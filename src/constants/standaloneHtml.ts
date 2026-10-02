export const STANDALONE_INDEX_HTML = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>나만의 맛집 다이어리 - 구글 시트 연동</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
  <style>
    body {
      font-family: "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
    }
    .star-btn {
      transition: transform 0.15s ease, color 0.15s ease;
    }
    .star-btn:hover {
      transform: scale(1.2);
    }
  </style>
</head>
<body class="bg-amber-50/40 text-slate-800 min-h-screen flex flex-col antialiased">

  <!-- Header -->
  <header class="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-amber-200/60 shadow-xs">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <span class="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-xl shadow-xs">🍽️</span>
        <div>
          <h1 class="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            나만의 맛집 다이어리
            <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">Google Sheets DB</span>
          </h1>
          <p class="text-xs text-slate-500 hidden sm:block">구글 스프레드시트로 실시간 동기화되는 나만의 미식 아카이브</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button id="btn-open-settings" class="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5">
          ⚙️ <span>시트 URL 설정</span>
        </button>
        <button id="btn-refresh" class="p-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="새로고침">
          🔄
        </button>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
    
    <!-- Hero / Stats -->
    <section class="text-center max-w-xl mx-auto space-y-2">
      <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">기억하고 싶은 그 맛, 정갈하게 기록하세요</h2>
      <p class="text-xs sm:text-sm text-slate-600">별도의 데이터베이스 비용 없이 구글 스프레드시트 하나로 영구 보관됩니다.</p>
      <div id="stats-bar" class="pt-2 flex items-center justify-center gap-4 text-xs text-slate-500 font-medium">
        <span>총 맛집 <strong id="stat-total" class="text-amber-600">0</strong>곳</span>
        <span>·</span>
        <span>평균 별점 ⭐ <strong id="stat-avg" class="text-slate-900">0.0</strong></span>
        <span>·</span>
        <span>강력 추천 👍 <strong id="stat-rec" class="text-emerald-600">0</strong>곳</span>
      </div>
    </section>

    <!-- Register Form Card -->
    <section class="max-w-2xl mx-auto bg-white rounded-3xl border border-amber-200/80 shadow-sm p-6 sm:p-8 space-y-5">
      <div class="flex items-center justify-between border-b border-amber-100 pb-3">
        <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
          <span>✍️ 새 맛집 기록하기</span>
        </h3>
        <span id="connection-status-pill" class="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          연동 준비 완료
        </span>
      </div>

      <form id="restaurant-form" class="space-y-4">
        <!-- 식당 이름 & 카테고리 -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">식당 이름 <span class="text-rose-500">*</span></label>
            <input type="text" id="input-name" required placeholder="예: 연남토마, 을지면옥"
              class="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">카테고리</label>
            <select id="input-category"
              class="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500">
              <option value="한식">🍚 한식</option>
              <option value="일식">🍣 일식</option>
              <option value="양식">🍝 양식</option>
              <option value="중식">🥟 중식</option>
              <option value="카페·디저트">☕ 카페·디저트</option>
              <option value="분식"> 분식</option>
              <option value="기타">🍴 기타</option>
            </select>
          </div>
        </div>

        <!-- 대표 메뉴 & 위치 -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">대표 메뉴 / 시그니처 <span class="text-rose-500">*</span></label>
            <input type="text" id="input-menu" required placeholder="예: 명란 바질오일 파스타"
              class="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">위치 / 지역</label>
            <input type="text" id="input-location" placeholder="예: 서울 마포구 연남동"
              class="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500">
          </div>
        </div>

        <!-- 별점 & 추천 여부 -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1.5">별점 평가</label>
            <div id="star-container" class="flex items-center gap-1.5 text-2xl cursor-pointer select-none">
              <span data-star="1" class="star-btn text-amber-400">★</span>
              <span data-star="2" class="star-btn text-amber-400">★</span>
              <span data-star="3" class="star-btn text-amber-400">★</span>
              <span data-star="4" class="star-btn text-amber-400">★</span>
              <span data-star="5" class="star-btn text-amber-400">★</span>
              <span id="star-score-text" class="text-xs font-bold text-amber-700 ml-2">5점 (인생 맛집)</span>
            </div>
          </div>
          <div class="flex items-center sm:justify-end gap-3 pt-2 sm:pt-0">
            <label class="relative flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" id="input-recommend" checked class="w-4 h-4 text-amber-600 rounded focus:ring-amber-500">
              <span class="text-xs font-bold text-slate-800">👍 지인에게 강력 추천</span>
            </label>
          </div>
        </div>

        <!-- 방문 후기 -->
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">방문 후기 및 꿀팁</label>
          <textarea id="input-review" rows="3" placeholder="식당의 분위기, 웨이팅 시간, 주차 팁 등을 자유롭게 적어주세요."
            class="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"></textarea>
        </div>

        <!-- 등록 버튼 -->
        <button type="submit" id="btn-submit"
          class="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2">
          <span>구글 스프레드시트에 저장하기</span>
        </button>
      </form>
    </section>

    <!-- Filters & List Section -->
    <section class="space-y-4">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-200/60 pb-4">
        <!-- Category Filter Buttons -->
        <div id="category-tabs" class="flex flex-wrap items-center gap-1.5">
          <!-- Rendered via JS -->
        </div>

        <!-- Search & Sort -->
        <div class="flex items-center gap-2">
          <input type="text" id="search-input" placeholder="식당 또는 메뉴 검색..."
            class="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 w-48">
          <select id="sort-select" class="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none">
            <option value="latest">최신 등록순</option>
            <option value="rating">별점 높은순</option>
            <option value="name">이름 가나다순</option>
          </select>
        </div>
      </div>

      <!-- Restaurant Cards Grid -->
      <div id="cards-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <!-- Cards will be populated here -->
      </div>
    </section>

  </main>

  <!-- Settings Modal -->
  <div id="settings-modal" class="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs hidden flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl space-y-4">
      <div class="flex items-center justify-between border-b pb-3">
        <h3 class="font-bold text-slate-900">구글 Apps Script 웹앱 URL 설정</h3>
        <button id="btn-close-settings" class="text-slate-400 hover:text-slate-600 text-lg">✕</button>
      </div>
      <p class="text-xs text-slate-600 leading-relaxed">
        구글 스프레드시트의 <code class="bg-amber-100 px-1.5 py-0.5 rounded text-amber-900">[확장 프로그램] &gt; [Apps Script]</code>에서 배포한 웹 앱 URL을 아래에 입력하세요.
      </p>
      <input type="url" id="modal-url-input" placeholder="https://script.google.com/macros/s/.../exec"
        class="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500">
      
      <div class="flex items-center justify-end gap-2 pt-2">
        <button id="btn-save-settings" class="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl">
          저장하기
        </button>
      </div>
    </div>
  </div>

  <!-- Toast Notification -->
  <div id="toast" class="fixed bottom-6 right-6 z-50 transform transition-all duration-300 translate-y-20 opacity-0 pointer-events-none bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-lg flex items-center gap-3 text-xs">
    <span id="toast-icon">✨</span>
    <span id="toast-message">저장되었습니다.</span>
  </div>

  <!-- Script -->
  <script>
    // State
    const STORAGE_KEY = 'restaurant_gas_url';
    const LOCAL_DATA_KEY = 'restaurant_local_items';

    let currentGasUrl = localStorage.getItem(STORAGE_KEY) || '';
    let currentRating = 5;
    let currentCategory = '전체';
    let searchQuery = '';
    let sortBy = 'latest';
    let restaurants = [];

    const categories = ['전체', '한식', '일식', '양식', '중식', '카페·디저트', '분식', '기타'];

    // Default Sample Data
    const defaultData = [
      {
        id: 'r_1',
        timestamp: new Date().toISOString(),
        name: '연남토마 본점',
        category: '일식',
        signatureMenu: '명란 바질오일 파스타, 안심가츠',
        rating: 5,
        review: '바질 향 가득한 명란 파스타와 겉바속촉 끝판왕 안심가츠! 웨이팅이 조금 있지만 기다릴 가치 충분.',
        isRecommended: true,
        location: '서울 마포구 연남동'
      },
      {
        id: 'r_2',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        name: '오브제 커피 로스터스',
        category: '카페·디저트',
        signatureMenu: '피스타치오 크림 라떼',
        rating: 4,
        review: '고소한 원두와 묵직한 크림의 조화. 성수동 골목에서 조용하게 머무르기 좋은 감성 카페.',
        isRecommended: true,
        location: '서울 성동구 성수동'
      }
    ];

    function showToast(msg, icon = '🎉') {
      const toast = document.getElementById('toast');
      document.getElementById('toast-icon').textContent = icon;
      document.getElementById('toast-message').textContent = msg;
      toast.classList.remove('translate-y-20', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
      setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
        toast.classList.remove('translate-y-0', 'opacity-100');
      }, 3000);
    }

    // Initialize Categories
    function renderCategoryTabs() {
      const container = document.getElementById('category-tabs');
      container.innerHTML = categories.map(cat => {
        const isActive = cat === currentCategory;
        return \`<button onclick="selectCategory('\${cat}')" class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors \${isActive ? 'bg-amber-500 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-amber-50 border border-slate-200'}">\${cat}</button>\`;
      }).join('');
    }

    window.selectCategory = function(cat) {
      currentCategory = cat;
      renderCategoryTabs();
      renderCards();
    };

    // Rating star interactions
    const starBtns = document.querySelectorAll('.star-btn');
    const starLabels = ['', '1점 (아쉬워요)', '2점 (보통 이하)', '3점 (무난해요)', '4점 (맛있어요)', '5점 (인생 맛집)'];
    starBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const star = parseInt(btn.dataset.star, 10);
        currentRating = star;
        starBtns.forEach(b => {
          const bStar = parseInt(b.dataset.star, 10);
          b.classList.toggle('text-amber-400', bStar <= star);
          b.classList.toggle('text-slate-200', bStar > star);
        });
        document.getElementById('star-score-text').textContent = starLabels[star];
      });
    });

    // Fetch data
    async function loadData() {
      if (!currentGasUrl) {
        const local = localStorage.getItem(LOCAL_DATA_KEY);
        restaurants = local ? JSON.parse(local) : defaultData;
        renderCards();
        updateStats();
        return;
      }

      try {
        const res = await fetch(currentGasUrl);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          restaurants = json.data;
          localStorage.setItem(LOCAL_DATA_KEY, JSON.stringify(restaurants));
          renderCards();
          updateStats();
        }
      } catch (e) {
        console.warn('GAS fetch failed, using local:', e);
        const local = localStorage.getItem(LOCAL_DATA_KEY);
        restaurants = local ? JSON.parse(local) : defaultData;
        renderCards();
        updateStats();
      }
    }

    function updateStats() {
      document.getElementById('stat-total').textContent = restaurants.length;
      const avg = restaurants.length ? (restaurants.reduce((acc, c) => acc + (c.rating || 0), 0) / restaurants.length).toFixed(1) : '0.0';
      document.getElementById('stat-avg').textContent = avg;
      const rec = restaurants.filter(r => r.isRecommended).length;
      document.getElementById('stat-rec').textContent = rec;
    }

    function renderCards() {
      const container = document.getElementById('cards-container');
      let filtered = restaurants.filter(r => {
        if (currentCategory !== '전체' && r.category !== currentCategory) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (r.name || '').toLowerCase().includes(q) || (r.signatureMenu || '').toLowerCase().includes(q);
        }
        return true;
      });

      if (sortBy === 'rating') {
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      } else if (sortBy === 'name') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
      } else {
        filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      }

      if (filtered.length === 0) {
        container.innerHTML = \`<div class="col-span-full py-12 text-center text-slate-400 text-xs">등록된 맛집이 없습니다. 첫 맛집을 기록해보세요!</div>\`;
        return;
      }

      container.innerHTML = filtered.map(r => {
        const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
        return \`
          <article class="bg-white rounded-3xl p-5 border border-amber-100 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-3">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">\${r.category || '기타'}</span>
                \${r.isRecommended ? '<span class="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">👍 추천 맛집</span>' : ''}
              </div>
              <h4 class="text-base font-extrabold text-slate-900">\${r.name}</h4>
              <p class="text-xs text-slate-500 mb-2">\${r.location || '위치 미등록'}</p>
              <div class="flex items-center gap-1.5 text-amber-500 text-sm mb-3">
                <span>\${stars}</span>
                <span class="text-xs font-bold text-slate-700">(\${r.rating}점)</span>
              </div>
              <div class="bg-amber-50/60 p-2.5 rounded-xl text-xs border border-amber-100 text-slate-700 mb-3">
                <span class="font-bold text-amber-900 block mb-0.5">📌 대표 메뉴:</span>
                \${r.signatureMenu}
              </div>
              <p class="text-xs text-slate-600 leading-relaxed line-clamp-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                "\${r.review || '방문 후기가 작성되지 않았습니다.'}"
              </p>
            </div>
            <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>\${new Date(r.timestamp).toLocaleDateString()}</span>
            </div>
          </article>
        \`;
      }).join('');
    }

    // Submit form
    document.getElementById('restaurant-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('btn-submit');
      btn.disabled = true;
      btn.innerHTML = '<span>저장 중...</span>';

      const payload = {
        name: document.getElementById('input-name').value.trim(),
        category: document.getElementById('input-category').value,
        signatureMenu: document.getElementById('input-menu').value.trim(),
        location: document.getElementById('input-location').value.trim(),
        rating: currentRating,
        isRecommended: document.getElementById('input-recommend').checked,
        review: document.getElementById('input-review').value.trim()
      };

      const newEntry = {
        id: 'r_' + Date.now(),
        timestamp: new Date().toISOString(),
        ...payload
      };

      if (currentGasUrl) {
        try {
          await fetch(currentGasUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload)
          });
        } catch (err) {
          console.warn('POST fallback:', err);
        }
      }

      restaurants.unshift(newEntry);
      localStorage.setItem(LOCAL_DATA_KEY, JSON.stringify(restaurants));
      renderCards();
      updateStats();

      // Reset form
      document.getElementById('input-name').value = '';
      document.getElementById('input-menu').value = '';
      document.getElementById('input-location').value = '';
      document.getElementById('input-review').value = '';
      btn.disabled = false;
      btn.innerHTML = '<span>구글 스프레드시트에 저장하기</span>';
      showToast('새 맛집이 저장되었습니다!');
    });

    // Settings Modal
    document.getElementById('btn-open-settings').onclick = () => {
      document.getElementById('modal-url-input').value = currentGasUrl;
      document.getElementById('settings-modal').classList.remove('hidden');
    };
    document.getElementById('btn-close-settings').onclick = () => {
      document.getElementById('settings-modal').classList.add('hidden');
    };
    document.getElementById('btn-save-settings').onclick = () => {
      const url = document.getElementById('modal-url-input').value.trim();
      currentGasUrl = url;
      localStorage.setItem(STORAGE_KEY, url);
      document.getElementById('settings-modal').classList.add('hidden');
      showToast('시트 URL이 저장되었습니다.');
      loadData();
    };

    document.getElementById('btn-refresh').onclick = () => {
      loadData();
      showToast('목록을 새로고침했습니다.');
    };

    document.getElementById('search-input').oninput = (e) => {
      searchQuery = e.target.value;
      renderCards();
    };

    document.getElementById('sort-select').onchange = (e) => {
      sortBy = e.target.value;
      renderCards();
    };

    // Init
    renderCategoryTabs();
    loadData();
  </script>
</body>
</html>
`;
