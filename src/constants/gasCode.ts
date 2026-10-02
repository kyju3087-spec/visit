export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * ========================================================
 *  나만의 맛집 다이어리 - 구글 스프레드시트 API (Google Apps Script)
 * ========================================================
 * 
 * [간단 배포 4단계]
 * 1. 구글 스프레드시트 상단 메뉴 > [확장 프로그램] > [Apps Script] 클릭
 * 2. 기존 코드를 모두 지우고 이 스크립트를 그대로 복사하여 붙여넣기
 * 3. 오른쪽 상단 파란색 [배포] > [새 배포] 클릭
 * 4. 배포 설정:
 *    - 유형 선택: 톱니바퀴 > [웹 앱] 선택
 *    - 설명: 맛집 다이어리 API v1
 *    - 다음 사용자 권한으로 실행: '나 (본인 계정)'
 *    - 액세스 권한이 있는 사용자: '모든 사용자 (Anyone)' <-- ⭐ 필수!
 * 5. [배포] 버튼 클릭 후 생성되는 '웹 앱 URL'을 복사해 맛집 다이어리 설정창에 넣으세요!
 */

const SHEET_NAME = 'Sheet1';

/**
 * 맛집 목록 조회 (GET 요청)
 */
function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
    
    if (!sheet) {
      sheet = ss.insertSheet('Sheet1');
    }

    const data = sheet.getDataRange().getValues();
    
    // 시트가 비어있거나 헤더 행(1행)만 있는 경우 빈 배열 반환
    if (!data || data.length <= 1) {
      return respondJSON({ success: true, data: [] });
    }

    // 1행(헤더)을 제외한 데이터 파싱
    const rows = data.slice(1);
    
    const entries = rows
      .filter(row => row[2]) // 식당 이름이 존재하는 행만 추출
      .map((row, index) => {
        let dateVal = row[1];
        let timestampIso = '';
        if (dateVal instanceof Date) {
          timestampIso = dateVal.toISOString();
        } else if (dateVal) {
          timestampIso = new Date(dateVal).toISOString();
        } else {
          timestampIso = new Date().toISOString();
        }

        const isRecVal = String(row[7]).toLowerCase();
        const isRecommended = isRecVal === 'true' || isRecVal === '추천' || isRecVal === 'yes' || isRecVal === '1';

        return {
          id: row[0] ? String(row[0]) : 'row_' + (index + 1),
          timestamp: timestampIso,
          name: String(row[2] || ''),
          category: String(row[3] || '기타'),
          signatureMenu: String(row[4] || ''),
          rating: Number(row[5] || 5),
          review: String(row[6] || ''),
          isRecommended: isRecommended,
          location: String(row[8] || '')
        };
      })
      .reverse(); // 최신 등록순으로 정렬

    return respondJSON({
      success: true,
      data: entries
    });
  } catch (err) {
    return respondJSON({
      success: false,
      error: err.toString()
    });
  }
}

/**
 * 새 맛집 등록 (POST 요청)
 */
function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
    
    if (!sheet) {
      sheet = ss.insertSheet('Sheet1');
    }

    // 처음 실행 시 헤더 라인 자동 생성 및 스타일 적용
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'ID', 
        '등록일시', 
        '식당이름', 
        '카테고리', 
        '대표메뉴', 
        '별점', 
        '방문후기', 
        '추천여부', 
        '위치'
      ]);
      const headerRange = sheet.getRange(1, 1, 1, 9);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#FDE68A'); // 포근한 웜옐로우 배경
      sheet.setFrozenRows(1);
    }

    // 전송된 본문 파싱 (JSON 또는 폼 데이터)
    let body = {};
    if (e.postData && e.postData.contents) {
      try {
        body = JSON.parse(e.postData.contents);
      } catch (parseError) {
        body = e.parameter || {};
      }
    } else if (e.parameter) {
      body = e.parameter;
    }

    const name = String(body.name || '').trim();
    if (!name) {
      return respondJSON({ success: false, error: '식당 이름을 입력해주세요.' });
    }

    const id = 'rest_' + Utilities.getUuid().slice(0, 8);
    const now = new Date();
    const category = String(body.category || '기타').trim();
    const signatureMenu = String(body.signatureMenu || '').trim();
    const rating = Math.min(5, Math.max(1, Number(body.rating) || 5));
    const review = String(body.review || '').trim();
    const isRecommended = body.isRecommended === true || String(body.isRecommended) === 'true';
    const location = String(body.location || '').trim();

    // 구글 스프레드시트에 행 추가
    sheet.appendRow([
      id,
      now,
      name,
      category,
      signatureMenu,
      rating,
      review,
      isRecommended ? '추천' : '보통',
      location
    ]);

    const newEntry = {
      id: id,
      timestamp: now.toISOString(),
      name: name,
      category: category,
      signatureMenu: signatureMenu,
      rating: rating,
      review: review,
      isRecommended: isRecommended,
      location: location
    };

    return respondJSON({
      success: true,
      message: '성공적으로 구글 시트에 맛집이 등록되었습니다!',
      data: newEntry
    });
  } catch (err) {
    return respondJSON({
      success: false,
      error: err.toString()
    });
  }
}

/**
 * JSON 응답 반환 및 CORS 헤더 지원
 */
function respondJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
