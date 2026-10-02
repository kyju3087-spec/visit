import { RestaurantEntry, NewRestaurantPayload } from '../types';
import { INITIAL_SAMPLE_RESTAURANTS } from '../constants/initialData';

export const DEFAULT_GAS_URL = '';

const STORAGE_KEY_URL = 'gourmet_diary_gas_url';
const STORAGE_KEY_ENTRIES = 'gourmet_diary_entries';
const STORAGE_KEY_LIKES = 'gourmet_diary_user_likes';

export function getStoredGasUrl(): string {
  if (typeof window === 'undefined') return DEFAULT_GAS_URL;
  const stored = localStorage.getItem(STORAGE_KEY_URL);
  if (stored !== null) return stored;
  return DEFAULT_GAS_URL;
}

export function saveStoredGasUrl(url: string): void {
  if (typeof window === 'undefined') return;
  if (!url) {
    localStorage.removeItem(STORAGE_KEY_URL);
  } else {
    localStorage.setItem(STORAGE_KEY_URL, url.trim());
  }
}

export function getLocalRestaurants(): RestaurantEntry[] {
  if (typeof window === 'undefined') return INITIAL_SAMPLE_RESTAURANTS;
  const raw = localStorage.getItem(STORAGE_KEY_ENTRIES);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(INITIAL_SAMPLE_RESTAURANTS));
    return INITIAL_SAMPLE_RESTAURANTS;
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SAMPLE_RESTAURANTS;
  } catch {
    return INITIAL_SAMPLE_RESTAURANTS;
  }
}

export function saveLocalRestaurants(entries: RestaurantEntry[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(entries));
}

export function getUserLikes(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_LIKES) || '{}');
  } catch {
    return {};
  }
}

export function toggleUserLike(id: string): { liked: boolean; totalLikes: number } {
  const currentLikes = getUserLikes();
  const isLiked = !!currentLikes[id];
  const newLiked = !isLiked;
  
  currentLikes[id] = newLiked;
  localStorage.setItem(STORAGE_KEY_LIKES, JSON.stringify(currentLikes));

  const list = getLocalRestaurants();
  const index = list.findIndex(item => item.id === id);
  let totalLikes = 0;
  if (index !== -1) {
    const cur = list[index].likes || 0;
    list[index].likes = Math.max(0, cur + (newLiked ? 1 : -1));
    totalLikes = list[index].likes;
    saveLocalRestaurants(list);
  }

  return { liked: newLiked, totalLikes };
}

/**
 * 구글 시트 웹앱 연결 테스트
 */
export async function testGasConnection(url: string): Promise<{ success: boolean; message: string; count?: number }> {
  const trimmed = url.trim();
  if (!trimmed) {
    return { success: false, message: 'Google Apps Script 웹 앱 URL을 입력해주세요.' };
  }
  if (!trimmed.startsWith('https://script.google.com/macros/s/')) {
    return {
      success: false,
      message: '유효한 Google Apps Script URL이 아닙니다. (https://script.google.com/macros/s/... 형식이어야 합니다)'
    };
  }

  try {
    const response = await fetch(trimmed, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      return {
        success: false,
        message: `HTTP 에러 (${response.status}): 배포 권한 설정을 확인하세요.`
      };
    }

    const data = await response.json();
    if (data.success !== undefined) {
      const count = Array.isArray(data.data) ? data.data.length : 0;
      return {
        success: true,
        message: `연결 성공! 현재 구글 시트에 ${count}개의 맛집 데이터가 동기화되어 있습니다.`,
        count
      };
    } else {
      return {
        success: false,
        message: '응답 형식이 일치하지 않습니다. Apps Script의 Code.gs를 복사했는지 확인해주세요.'
      };
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `연결 확인 중 오류 발생: ${errorMsg}. Apps Script 배포 시 '액세스 권한: 모든 사용자'로 설정했는지 확인하세요.`
    };
  }
}

/**
 * 맛집 목록 불러오기 (GET)
 */
export async function fetchRestaurants(gasUrl: string): Promise<{ 
  entries: RestaurantEntry[]; 
  isRealGas: boolean; 
  error?: string 
}> {
  const trimmed = gasUrl.trim();
  
  if (!trimmed) {
    return {
      entries: getLocalRestaurants(),
      isRealGas: false
    };
  }

  try {
    const response = await fetch(trimmed, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`서버 응답 오류 (상태코드: ${response.status})`);
    }

    const json = await response.json();
    if (json.success && Array.isArray(json.data)) {
      // 구글 시트에서 가져온 최신 데이터를 로컬에도 백업 저장
      saveLocalRestaurants(json.data);
      return {
        entries: json.data,
        isRealGas: true
      };
    } else {
      throw new Error(json.error || '데이터 형식을 읽을 수 없습니다.');
    }
  } catch (err: unknown) {
    console.warn('Google Sheet GET fetch failed, falling back to local storage:', err);
    const errorMsg = err instanceof Error ? err.message : '구글 시트 데이터를 불러오지 못했습니다.';
    return {
      entries: getLocalRestaurants(),
      isRealGas: false,
      error: errorMsg
    };
  }
}

/**
 * 새 맛집 등록하기 (POST)
 */
export async function postNewRestaurant(
  gasUrl: string,
  payload: NewRestaurantPayload
): Promise<{ success: boolean; entry: RestaurantEntry; isRealGas: boolean; error?: string }> {
  const trimmed = gasUrl.trim();
  const now = new Date();
  const fallbackEntry: RestaurantEntry = {
    id: 'rest_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    timestamp: now.toISOString(),
    name: payload.name.trim(),
    category: payload.category,
    signatureMenu: payload.signatureMenu.trim(),
    rating: payload.rating,
    review: payload.review.trim(),
    isRecommended: payload.isRecommended,
    location: payload.location?.trim() || '',
    likes: 0
  };

  // 데모 모드 (URL이 없을 때)
  if (!trimmed) {
    await new Promise(r => setTimeout(r, 400));
    const entries = getLocalRestaurants();
    const updated = [fallbackEntry, ...entries];
    saveLocalRestaurants(updated);
    return {
      success: true,
      entry: fallbackEntry,
      isRealGas: false
    };
  }

  // Google Apps Script 실제 POST
  try {
    const response = await fetch(trimmed, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      try {
        const result = await response.json();
        if (result.success && result.data) {
          return {
            success: true,
            entry: result.data,
            isRealGas: true
          };
        }
      } catch {
        // GAS redirect handled
      }
      return {
        success: true,
        entry: fallbackEntry,
        isRealGas: true
      };
    } else {
      throw new Error(`HTTP 에러: ${response.status}`);
    }
  } catch (err: unknown) {
    console.warn('Standard GAS fetch encountered error or CORS redirect, attempting no-cors fallback:', err);
    try {
      // no-cors fallback
      await fetch(trimmed, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload)
      });

      await new Promise(r => setTimeout(r, 700));

      const entries = getLocalRestaurants();
      saveLocalRestaurants([fallbackEntry, ...entries]);

      return {
        success: true,
        entry: fallbackEntry,
        isRealGas: true
      };
    } catch (noCorsErr: unknown) {
      console.error('GAS POST failed completely:', noCorsErr);
      const entries = getLocalRestaurants();
      saveLocalRestaurants([fallbackEntry, ...entries]);

      const errorMsg = err instanceof Error ? err.message : '저장 중 통신 오류가 발생했습니다.';
      return {
        success: false,
        entry: fallbackEntry,
        isRealGas: false,
        error: errorMsg
      };
    }
  }
}

/**
 * CSV 파일로 내보내기
 */
export function exportToCsv(entries: RestaurantEntry[]): void {
  const headers = ['ID', '등록일시', '식당이름', '카테고리', '대표메뉴', '별점', '방문후기', '추천여부', '위치'];
  const rows = entries.map(e => [
    e.id,
    new Date(e.timestamp).toLocaleString('ko-KR'),
    `"${(e.name || '').replace(/"/g, '""')}"`,
    e.category,
    `"${(e.signatureMenu || '').replace(/"/g, '""')}"`,
    e.rating,
    `"${(e.review || '').replace(/"/g, '""')}"`,
    e.isRecommended ? '추천' : '보통',
    `"${(e.location || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `나만의_맛집_다이어리_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
