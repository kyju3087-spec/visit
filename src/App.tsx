import React, { useState, useEffect, useMemo, useRef } from 'react';
import { RestaurantEntry, NewRestaurantPayload, RestaurantCategory, ToastInfo } from './types';
import {
  getStoredGasUrl,
  fetchRestaurants,
  postNewRestaurant,
  getUserLikes,
  toggleUserLike,
  saveLocalRestaurants,
  exportToCsv
} from './services/api';
import { INITIAL_SAMPLE_RESTAURANTS, CATEGORIES } from './constants/initialData';
import { Navbar } from './components/Navbar';
import { EntryForm } from './components/EntryForm';
import { EntryCard } from './components/EntryCard';
import { GuideModal } from './components/GuideModal';
import { SettingsModal } from './components/SettingsModal';
import { ToastContainer } from './components/Toast';
import {
  Search,
  FileSpreadsheet,
  Star,
  ThumbsUp,
  Sparkles,
  Plus,
  UtensilsCrossed,
  SlidersHorizontal,
  Flame,
  Coffee,
  Heart
} from 'lucide-react';

export default function App() {
  const [gasUrl, setGasUrl] = useState<string>(() => getStoredGasUrl());
  const [restaurants, setRestaurants] = useState<RestaurantEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isRealGas, setIsRealGas] = useState<boolean>(false);

  // Filter & Search & Sort
  const [selectedCategory, setSelectedCategory] = useState<RestaurantCategory | '전체'>('전체');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'latest' | 'rating' | 'name' | 'likes'>('latest');

  // Modals & Toasts
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  // Likes Map
  const [likesMap, setLikesMap] = useState<Record<string, boolean>>(() => getUserLikes());

  const formRef = useRef<HTMLDivElement>(null);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    const id = 'toast_' + Date.now() + Math.random().toString(36).slice(2, 6);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load data from Google Apps Script or LocalStorage
  const loadData = async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const result = await fetchRestaurants(gasUrl);
      setRestaurants(result.entries);
      setIsRealGas(result.isRealGas);

      if (result.error && gasUrl) {
        addToast(
          'error',
          '시트 통신 안내',
          `${result.error} (임시 로컬 데이터가 표시됩니다)`
        );
      } else if (isManualRefresh) {
        addToast('success', '새로고침 완료', '최신 맛집 데이터를 동기화했습니다.');
      }
    } catch {
      addToast('error', '불러오기 실패', '데이터를 가져오는 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [gasUrl]);

  // Handle new restaurant submit
  const handleSubmitRestaurant = async (payload: NewRestaurantPayload): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const result = await postNewRestaurant(gasUrl, payload);

      if (result.success) {
        setRestaurants((prev) => [result.entry, ...prev.filter((r) => r.id !== result.entry.id)]);
        setIsRealGas(result.isRealGas);

        if (result.isRealGas) {
          addToast('success', '등록 완료 🍽️', '구글 스프레드시트에 성공적으로 저장되었습니다!');
          setTimeout(() => {
            loadData();
          }, 1200);
        } else {
          addToast('success', '등록 완료 🍽️', '맛집 다이어리에 기록되었습니다. (체험 모드)');
        }
        return true;
      } else {
        setRestaurants((prev) => [result.entry, ...prev.filter((r) => r.id !== result.entry.id)]);
        addToast(
          'info',
          '로컬 저장 완료',
          `구글 시트 통신 확인 필요(${result.error || '권한'}). 브라우저에 우선 안전하게 저장되었습니다.`
        );
        return true;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '등록에 실패했습니다.';
      addToast('error', '등록 실패', msg);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Like reaction
  const handleToggleLike = (id: string) => {
    const { liked, totalLikes } = toggleUserLike(id);
    setLikesMap((prev) => ({ ...prev, [id]: liked }));
    setRestaurants((prev) =>
      prev.map((r) => (r.id === id ? { ...r, likes: totalLikes } : r))
    );
  };

  const handleUrlUpdated = (newUrl: string) => {
    setGasUrl(newUrl);
    if (newUrl) {
      addToast('success', '연결 완료', '구글 시트 Web App URL이 설정되었습니다.');
    } else {
      addToast('info', '체험 모드', '로컬 체험 모드로 전환되었습니다.');
    }
  };

  const handleResetLocalData = () => {
    saveLocalRestaurants(INITIAL_SAMPLE_RESTAURANTS);
    setRestaurants(INITIAL_SAMPLE_RESTAURANTS);
    addToast('info', '초기화 완료', '샘플 맛집 데이터가 복원되었습니다.');
  };

  const handleExportCsv = () => {
    exportToCsv(restaurants);
    addToast('success', '다운로드 완료', 'CSV 파일로 내보냈습니다.');
  };

  // Filtered and sorted restaurants
  const filteredRestaurants = useMemo(() => {
    let result = [...restaurants];

    // Category filter
    if (selectedCategory !== '전체') {
      result = result.filter((r) => r.category === selectedCategory);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.signatureMenu.toLowerCase().includes(q) ||
          (r.location && r.location.toLowerCase().includes(q)) ||
          r.review.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === 'latest') {
      result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
    } else if (sortBy === 'likes') {
      result.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    }

    return result;
  }, [restaurants, selectedCategory, searchQuery, sortBy]);

  // Statistics calculation
  const totalCount = restaurants.length;
  const avgRating = totalCount > 0 
    ? (restaurants.reduce((acc, cur) => acc + (cur.rating || 0), 0) / totalCount).toFixed(1)
    : '0.0';
  const recommendedCount = restaurants.filter((r) => r.isRecommended).length;

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-slate-800 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        isRealGas={isRealGas}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onRefresh={() => loadData(true)}
        onExportCsv={handleExportCsv}
        isRefreshing={isRefreshing}
        totalCount={totalCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-10">
        
        {/* Hero Section */}
        <section className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-900 bg-amber-100/70 border border-amber-300/80 px-3.5 py-1 rounded-full shadow-2xs">
            <Flame className="w-3.5 h-3.5 text-amber-600" />
            <span>Google Sheets as Database</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight text-balance">
            나만의 맛집 다이어리
          </h2>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed text-balance">
            복잡한 백엔드 서버 없이, 구글 스프레드시트 하나로 식당 이름, 대표 메뉴,
            별점과 방문 후기를 평생 무료로 안전하게 보관하세요.
          </p>

          {/* Quick Metrics Bar */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <UtensilsCrossed className="w-4 h-4 text-amber-600" />
              <span>기록된 맛집 <strong className="font-mono text-slate-900 font-bold">{totalCount}</strong>곳</span>
            </div>
            <span aria-hidden="true" className="text-amber-200">·</span>
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>평균 별점 <strong className="font-mono text-slate-900 font-bold">{avgRating}</strong>점</span>
            </div>
            <span aria-hidden="true" className="text-amber-200">·</span>
            <div className="flex items-center gap-1.5">
              <ThumbsUp className="w-4 h-4 text-emerald-600" />
              <span>추천 맛집 <strong className="font-mono text-emerald-700 font-bold">{recommendedCount}</strong>곳</span>
            </div>
            <span aria-hidden="true" className="text-amber-200">·</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isRealGas ? 'bg-emerald-500' : 'bg-amber-400'}`} />
              <span className="font-medium">{isRealGas ? '구글 시트 실시간' : '체험 모드'}</span>
            </div>
          </div>
        </section>

        {/* Input Form Section */}
        <section ref={formRef} className="max-w-2xl mx-auto">
          <EntryForm
            onSubmit={handleSubmitRestaurant}
            isSubmitting={isSubmitting}
            isRealGas={isRealGas}
            onOpenGuide={() => setIsGuideOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        </section>

        {/* List & Filtering Section */}
        <section className="space-y-6 pt-2">
          {/* Controls Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-amber-200/60 pb-4">
            {/* Category Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-amber-50/80 border border-amber-200/60'
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Search & Sort */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="식당명, 메뉴, 위치 검색..."
                  className="pl-8 pr-3 py-1.5 text-xs bg-white border border-amber-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 w-44 sm:w-56 transition-all"
                />
              </div>

              {/* Sort Segmented Controls */}
              <div className="flex items-center p-1 bg-amber-100/70 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setSortBy('latest')}
                  className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                    sortBy === 'latest'
                      ? 'bg-white text-amber-900 shadow-2xs font-bold'
                      : 'text-amber-800/80 hover:text-amber-900'
                  }`}
                >
                  최신순
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('rating')}
                  className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                    sortBy === 'rating'
                      ? 'bg-white text-amber-900 shadow-2xs font-bold'
                      : 'text-amber-800/80 hover:text-amber-900'
                  }`}
                >
                  별점순
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('name')}
                  className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                    sortBy === 'name'
                      ? 'bg-white text-amber-900 shadow-2xs font-bold'
                      : 'text-amber-800/80 hover:text-amber-900'
                  }`}
                >
                  이름순
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('likes')}
                  className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                    sortBy === 'likes'
                      ? 'bg-white text-amber-900 shadow-2xs font-bold'
                      : 'text-amber-800/80 hover:text-amber-900'
                  }`}
                >
                  공감순
                </button>
              </div>
            </div>
          </div>

          {/* Cards Render */}
          {isLoading ? (
            /* Loading Skeleton */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-56 bg-white rounded-3xl border border-amber-100 p-6 animate-pulse flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-5 bg-amber-100 rounded-full w-16" />
                      <div className="h-5 bg-slate-100 rounded-full w-10" />
                    </div>
                    <div className="h-5 bg-slate-200 rounded w-36" />
                    <div className="h-4 bg-slate-100 rounded w-24" />
                    <div className="h-10 bg-amber-50 rounded-2xl w-full" />
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="h-3 bg-slate-100 rounded w-16" />
                    <div className="h-3 bg-slate-100 rounded w-8" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredRestaurants.length === 0 ? (
            /* Empty State */
            <div className="text-center py-16 px-4 bg-white rounded-3xl border border-amber-200/80">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3 text-2xl">
                🍽️
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                {searchQuery || selectedCategory !== '전체'
                  ? '조건에 맞는 맛집이 없습니다'
                  : '아직 등록된 맛집이 없습니다'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5 leading-relaxed">
                {searchQuery || selectedCategory !== '전체'
                  ? '다른 검색어를 입력하시거나 카테고리 필터를 [전체]로 변경해보세요.'
                  : '잊을 수 없는 맛있는 추억을 첫 번째로 다이어리에 기록해보세요!'}
              </p>
              {searchQuery || selectedCategory !== '전체' ? (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('전체');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  필터 초기화
                </button>
              ) : (
                <button
                  onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  첫 맛집 기록하기
                </button>
              )}
            </div>
          ) : (
            /* Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredRestaurants.map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  isLiked={!!likesMap[entry.id]}
                  onToggleLike={handleToggleLike}
                  onCopyToast={() =>
                    addToast('info', '복사 완료', '식당 정보와 후기가 복사되었습니다.')
                  }
                />
              ))}
            </div>
          )}
        </section>

        {/* Educational Callout Banner */}
        <section className="rounded-3xl border border-amber-200/90 bg-gradient-to-r from-amber-50 via-orange-50/50 to-amber-50 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xs">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h3 className="font-extrabold text-slate-900 text-sm md:text-base">
                구글 스프레드시트를 나만의 무료 데이터베이스로 쓰는 법
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Google Apps Script는 별도의 복잡한 데이터베이스 서버 없이도 스프레드시트의 행 데이터를
              실시간 JSON API로 변환해줍니다. 모바일 구글 시트 앱에서도 언제든 직접 열람하고 수정할 수 있습니다.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Apps Script 코드 & 가이드
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-amber-200/60 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            나만의 맛집 다이어리 · Powered by Google Sheets & Apps Script
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="hover:text-slate-700 transition-colors"
            >
              연동 가이드 & 소스
            </button>
            <span>·</span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-slate-700 transition-colors"
            >
              시트 연동 설정
            </button>
            <span>·</span>
            <button
              onClick={handleExportCsv}
              className="hover:text-slate-700 transition-colors"
            >
              CSV 다운로드
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Toasts */}
      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        currentUrl={gasUrl}
        onUrlUpdated={handleUrlUpdated}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentUrl={gasUrl}
        onUrlUpdated={handleUrlUpdated}
        onResetLocalData={handleResetLocalData}
      />

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
