(function () {
  'use strict';

  var LOG_DATA = {
    featuredId: 'debut-live',
    events: [
      {
        id: 'debut-live',
        date: '2026.04.11',
        year: '2026',
        title: 'LUMIBELLE DEBUT LIVE',
        venue: '홍대 상상마당 라이브홀',
        status: ['SETLIST 공개', '사진 기록 업데이트', '멤버 한마디 도착'],
        tags: ['데뷔 공연', '단독', '홍대'],
        archiveTitle: '2026 ARCHIVE',
        members: [
          { name: '루루', note: '오늘, 정말 잊지 못할 날이야. 빛나줘서 고마워요!' },
          { name: '링링', note: '처음의 이 설렘을 오래오래 간직할게요.' }
        ],
        setlist: ['Stardust Magical', '청춘 서브리미널', '꿈의 조각', '반짝이는 약속', 'LUMI LOVE!'],
        memoryNote: '공연 후 남겨준 마음은 루미벨의 기록에 오래 보관돼요.',
        heartBoard: {
          intro: '공연 후 남겨준 마음은 루미벨의 기록에 오래 보관돼요.',
          button: '공연 후 마음 남기기',
          notice: '운영 확인 후 공연 기록에 보관돼요.',
          archive: '루미벨 공식 공연 기록 아카이브',
          entries: [
            { name: '루미나', time: '2026.04.11(토) 21:38', body: '오늘의 무대는 정말 마법 같았어요. 빛나는 루미벨을 직접 볼 수 있어서 평생 잊지 못할 것 같아요!', likes: 128 },
            { name: '별빛모아', time: '2026.04.11(토) 20:54', body: '처음부터 마지막까지 모든 순간이 행복이었어요. 루미벨 덕분에 오늘 하루가 가장 빛났어요. 고마워요!', likes: 97 },
            { name: 'Lumi_day', time: '2026.04.11(토) 20:23', body: '노래, 퍼포먼스, 그리고 루미벨의 미소까지 완벽했어요. 앞으로도 함께 응원할게요!', likes: 84 },
            { name: '핑크토끼', time: '2026.04.11(토) 19:42', body: '루미벨의 목소리가 제 마음을 포근하게 안아줬어요. 오늘 받은 행복 오래 간직할게요!', likes: 63 }
          ]
        },
        personalSummary: [
          '내 티켓', '내 체크인', '받은 스탬프', '해당 공연 체키', '그날 받은 우편', '특전 기록'
        ],
        personalCards: [
          { title: '내 티켓', value: '예매 완료', meta: ['일반 예매 · 1매'] },
          { title: '내 체크인', value: '체크인 완료', meta: ['2026.04.11 17:32', '입장 완료'] },
          { title: '받은 스탬프', value: '1개 지급', meta: ['LUMI 스탬프'] },
          { title: '해당 공연 체키', value: '체키 사진 자리', meta: ['찍은 체키가 여기에 보여져요.'] },
          { title: '그날 받은 우편', value: '우편 1건', meta: ['루미나의 감사 편지'] },
          { title: '특전 기록', value: '특전회 참여 기록', meta: ['특전회 대기 23번'] }
        ],
        recordMemo: '여기는 LUMIBELLE DEBUT LIVE (2026.04.11) 공연과 연결된 나의 개인 기록만 모아 보여드려요.'
      },
      {
        id: 'spring-mini-live',
        date: '2026.03.20',
        year: '2026',
        title: 'SPRING MINI LIVE',
        venue: '홍대 롤링홀',
        status: ['SETLIST 공개'],
        tags: ['봄 공연', '미니', '홍대'],
        archiveTitle: '2026 ARCHIVE',
        members: [
          { name: '루루', note: '따뜻한 봄날처럼 함께 반짝여줘서 고마워요.' },
          { name: '링링', note: '오늘의 웃음도 오래 기억할게요.' }
        ],
        setlist: ['봄빛 한 조각', '청춘 서브리미널', '꿈의 편지', '반짝이는 약속', 'Encore LUMI LOVE!'],
        memoryNote: '이날 남겨준 마음과 후기는 공연 기록에 함께 보관돼요.',
        heartBoard: {
          intro: '이날 남겨준 따뜻한 마음은 공식 공연 기록 안에 보관돼요.',
          button: '공연 후 마음 남기기',
          notice: '운영 확인 후 공연 기록에 보관돼요.',
          archive: '루미벨 공식 공연 기록 아카이브',
          entries: [
            { name: '봄별', time: '2026.03.20(금) 22:01', body: '봄처럼 상냥한 무대였어요. 오늘 받은 설렘 오래 기억할게요!', likes: 72 },
            { name: '루미러버', time: '2026.03.20(금) 21:15', body: '롤링홀에서 들은 노래가 아직도 마음에 남아 있어요.', likes: 45 }
          ]
        },
        personalSummary: [
          '내 티켓', '내 체크인', '받은 스탬프', '해당 공연 체키', '그날 받은 우편', '특전 기록'
        ],
        personalCards: [
          { title: '내 티켓', value: '예매 완료', meta: ['일반 예매 · 1매'] },
          { title: '내 체크인', value: '체크인 완료', meta: ['2026.03.20 18:11', '입장 완료'] },
          { title: '받은 스탬프', value: '1개 지급', meta: ['LUMI 스탬프'] },
          { title: '해당 공연 체키', value: '체키 사진 자리', meta: ['찍은 체키가 여기에 보여져요.'] },
          { title: '그날 받은 우편', value: '우편 1건', meta: ['스프링 메시지 카드'] },
          { title: '특전 기록', value: '특전회 참여 기록', meta: ['특전회 대기 11번'] }
        ],
        recordMemo: 'SPRING MINI LIVE와 연결된 내 기록만 한 번에 볼 수 있어요.'
      },
      {
        id: 'valentine-fan-live',
        date: '2026.02.14',
        year: '2026',
        title: 'VALENTINE FAN LIVE',
        venue: '신촌 예스24 원더로크홀',
        status: ['사진 기록 업데이트'],
        tags: ['팬 라이브', '발렌타인', '신촌'],
        archiveTitle: '2026 ARCHIVE',
        members: [
          { name: '루루', note: '달콤한 응원 덕분에 하루가 더 특별했어요.' },
          { name: '링링', note: '마음 가득한 오늘을 오래 기억할게요.' }
        ],
        setlist: ['Chocolate Wish', '청춘 서브리미널', 'Heart Beat', '반짝이는 약속', 'Encore LUMI LOVE!'],
        memoryNote: '응원과 후기, 체크인 기록이 공연의 추억으로 남아요.',
        heartBoard: {
          intro: '발렌타인 라이브에 남긴 마음은 공연 기록 속에 함께 보관돼요.',
          button: '공연 후 마음 남기기',
          notice: '운영 확인 후 공연 기록에 보관돼요.',
          archive: '루미벨 공식 공연 기록 아카이브',
          entries: [
            { name: '초코별', time: '2026.02.14(토) 20:10', body: '오늘의 분위기가 너무 사랑스러웠어요. 달콤한 추억으로 남길게요!', likes: 58 }
          ]
        },
        personalSummary: [
          '내 티켓', '내 체크인', '받은 스탬프', '해당 공연 체키', '그날 받은 우편', '특전 기록'
        ],
        personalCards: [
          { title: '내 티켓', value: '예매 완료', meta: ['일반 예매 · 1매'] },
          { title: '내 체크인', value: '체크인 완료', meta: ['2026.02.14 18:55', '입장 완료'] },
          { title: '받은 스탬프', value: '1개 지급', meta: ['LUMI 스탬프'] },
          { title: '해당 공연 체키', value: '체키 사진 자리', meta: ['찍은 체키가 여기에 보여져요.'] },
          { title: '그날 받은 우편', value: '우편 1건', meta: ['발렌타인 카드'] },
          { title: '특전 기록', value: '특전회 참여 기록', meta: ['특전회 대기 8번'] }
        ],
        recordMemo: 'VALENTINE FAN LIVE와 연결된 내 기록만 모아서 보여드려요.'
      },
      {
        id: 'winter-special-stage',
        date: '2025.12.24',
        year: '2025',
        title: 'WINTER SPECIAL STAGE',
        venue: '상상마당 라이브홀',
        status: ['멤버 한마디 도착'],
        tags: ['겨울 공연', '스페셜', '홍대'],
        archiveTitle: '2025 ARCHIVE',
        members: [
          { name: '루루', note: '겨울밤의 빛 같은 응원이었어요.' },
          { name: '링링', note: '따뜻한 순간을 하나하나 안고 갈게요.' }
        ],
        setlist: ['Snowy Wink', '꿈의 조각', 'Winter Wish', 'LUMI LOVE!'],
        memoryNote: '겨울 스테이지의 기억도 루미벨의 기록으로 남아요.',
        heartBoard: {
          intro: '겨울 스테이지에 남긴 소중한 마음을 보관해요.',
          button: '공연 후 마음 남기기',
          notice: '운영 확인 후 공연 기록에 보관돼요.',
          archive: '루미벨 공식 공연 기록 아카이브',
          entries: [
            { name: '겨울별', time: '2025.12.24(목) 21:09', body: '눈처럼 반짝이던 무대였어요. 따뜻한 기억으로 남길게요!', likes: 39 }
          ]
        },
        personalSummary: [
          '내 티켓', '내 체크인', '받은 스탬프', '해당 공연 체키', '그날 받은 우편', '특전 기록'
        ],
        personalCards: [
          { title: '내 티켓', value: '예매 완료', meta: ['일반 예매 · 1매'] },
          { title: '내 체크인', value: '체크인 완료', meta: ['2025.12.24 18:41', '입장 완료'] },
          { title: '받은 스탬프', value: '1개 지급', meta: ['LUMI 스탬프'] },
          { title: '해당 공연 체키', value: '체키 사진 자리', meta: ['찍은 체키가 여기에 보여져요.'] },
          { title: '그날 받은 우편', value: '우편 1건', meta: ['윈터 메시지 카드'] },
          { title: '특전 기록', value: '특전회 참여 기록', meta: ['특전회 대기 5번'] }
        ],
        recordMemo: 'WINTER SPECIAL STAGE와 연결된 내 기록만 따로 모아 보여드려요.'
      }
    ]
  };

  window.LumiApps = window.LumiApps || {};

  window.LumiApps.lumilog = function () {
    return '' +
      '<section class="lumilog-app" data-lumilog-app>' +
        '<div class="lumilog-shell">' +
          '<div class="lumilog-brand">' +
            '<span>LumiPhone</span><strong>V2</strong>' +
          '</div>' +
          '<section class="lumilog-content" data-lumilog-content></section>' +
        '</div>' +
      '</section>';
  };

  window.LumiApps.bindLumilog = function (root) {
    var app = root.querySelector('[data-lumilog-app]');
    if (!app || app.__lumiLumilogBound) return;
    app.__lumiLumilogBound = true;
    app.__lumiLumilogState = {
      view: 'list',
      selectedId: LOG_DATA.featuredId,
      heartSort: 'latest',
      composeCategory: '감동 받았어요'
    };

    app.addEventListener('input', function (event) {
      var composeText = event.target.closest('[data-lumilog-compose-text]');
      if (!composeText) return;
      var counter = app.querySelector('[data-lumilog-compose-count]');
      if (counter) counter.textContent = composeText.value.length + ' / 500자';
    });

    app.addEventListener('click', function (event) {
      var categoryButton = event.target.closest('[data-lumilog-compose-category]');
      if (categoryButton) {
        app.__lumiLumilogState.composeCategory = categoryButton.getAttribute('data-lumilog-compose-category') || '';
        app.querySelectorAll('[data-lumilog-compose-category]').forEach(function (button) {
          button.classList.toggle('is-selected', button === categoryButton);
        });
        return;
      }

      var openButton = event.target.closest('[data-lumilog-open]');
      if (openButton) {
        setView(app, 'detail', openButton.getAttribute('data-lumilog-open') || LOG_DATA.featuredId);
        return;
      }

      var switchButton = event.target.closest('[data-lumilog-view]');
      if (switchButton) {
        setView(app, switchButton.getAttribute('data-lumilog-view'), app.__lumiLumilogState.selectedId);
        return;
      }

      var backButton = event.target.closest('[data-lumilog-back]');
      if (backButton) {
        var targetView = backButton.getAttribute('data-lumilog-back') || 'list';
        setView(app, targetView, app.__lumiLumilogState.selectedId);
        return;
      }

      var sortButton = event.target.closest('[data-lumilog-sort]');
      if (sortButton) {
        app.__lumiLumilogState.heartSort = sortButton.getAttribute('data-lumilog-sort') || 'latest';
        renderLumilog(app);
        return;
      }

      var timelineButton = event.target.closest('[data-lumilog-open-timeline]');
      if (timelineButton && window.LumiPhone && typeof window.LumiPhone.openApp === 'function') {
        window.LumiPhone.openApp('timeline', { keepBackRoute: true });
      }
    });

    renderLumilog(app);
  };

  function setView(app, view, eventId) {
    var state = app.__lumiLumilogState || {};
    state.view = view;
    state.selectedId = eventId || state.selectedId || LOG_DATA.featuredId;
    app.__lumiLumilogState = state;
    renderLumilog(app);
  }

  function renderLumilog(app) {
    var content = app.querySelector('[data-lumilog-content]');
    if (!content) return;
    var state = app.__lumiLumilogState || { view: 'list', selectedId: LOG_DATA.featuredId, heartSort: 'latest' };
    var item = findEvent(state.selectedId);

    if (window.LumiPhone && typeof window.LumiPhone.setAppBackHandler === 'function') {
      window.LumiPhone.setAppBackHandler(function () {
        var nextState = app.__lumiLumilogState || state;
        if (nextState.view === 'compose') {
          setView(app, 'heart', nextState.selectedId);
          return true;
        }
        if (nextState.view === 'heart' || nextState.view === 'personal') {
          setView(app, 'detail', nextState.selectedId);
          return true;
        }
        if (nextState.view === 'detail') {
          setView(app, 'list', nextState.selectedId);
          return true;
        }
        return false;
      });
    }

    if (state.view === 'detail') {
      content.innerHTML = renderDetail(item);
      return;
    }
    if (state.view === 'heart') {
      content.innerHTML = renderHeart(item, state.heartSort || 'latest');
      return;
    }
    if (state.view === 'personal') {
      content.innerHTML = renderPersonal(item);
      return;
    }
    if (state.view === 'compose') {
      content.innerHTML = renderCompose(item, state.composeCategory || '감동 받았어요');
      return;
    }
    content.innerHTML = renderList();
  }

  function renderList() {
    var featured = findEvent(LOG_DATA.featuredId);
    var archiveList = LOG_DATA.events.filter(function (item) { return item.id !== LOG_DATA.featuredId; });

    return '' +
      '<section class="lumilog-hero">' +
        '<span class="lumilog-image-slot lumilog-hero-art" aria-hidden="true"></span>' +
        '<div class="lumilog-hero-copy">' +
          '<h2>LUMI LOG</h2>' +
          '<p class="lumilog-hero-sub">루미벨과 함께한 날들을 오래 기록해요</p>' +
          '<p class="lumilog-hero-note">참여 횟수나 리프 여부가 마음의 크기를 뜻하지 않아요. 그날 남겨준 마음은 모두 소중히 보관해요.</p>' +
        '</div>' +
      '</section>' +
      '<section class="lumilog-featured-card">' +
        '<span class="lumilog-image-slot lumilog-featured-image" aria-hidden="true"></span>' +
        '<div class="lumilog-featured-copy">' +
          '<span>' + esc(featured.date) + '</span>' +
          '<strong>' + esc(featured.title) + '</strong>' +
          '<p>' + esc(featured.venue) + '</p>' +
          '<button type="button" class="lumilog-primary-btn" data-lumilog-open="' + esc(featured.id) + '">공연 기록 보기</button>' +
          '<div class="lumilog-status-row">' +
            featured.status.map(function (label) {
              return '<span>' + esc(label) + '</span>';
            }).join('') +
          '</div>' +
        '</div>' +
      '</section>' +
      '<section class="lumilog-archive-section">' +
        '<div class="lumilog-section-title"><h3>2026 ARCHIVE</h3></div>' +
        '<div class="lumilog-archive-list">' + archiveList.map(renderArchiveCard).join('') + '</div>' +
      '</section>';
  }

  function renderArchiveCard(item) {
    return '' +
      '<article class="lumilog-archive-card">' +
        '<span class="lumilog-image-slot lumilog-archive-image" aria-hidden="true"></span>' +
        '<div class="lumilog-archive-copy">' +
          '<span>' + esc(item.date) + '</span>' +
          '<strong>' + esc(item.title) + '</strong>' +
          '<p>' + esc(item.venue) + '</p>' +
        '</div>' +
        '<button type="button" class="lumilog-link-btn" data-lumilog-open="' + esc(item.id) + '">기록 보기</button>' +
      '</article>';
  }

  function renderDetail(item) {
    return '' +
      '<button type="button" class="lumilog-back-btn" data-lumilog-back="list">뒤로</button>' +
      '<section class="lumilog-detail-hero">' +
        '<span class="lumilog-image-slot lumilog-detail-main-image" aria-hidden="true"></span>' +
        '<div class="lumilog-detail-copy">' +
          '<span>' + esc(item.date) + '</span>' +
          '<strong>' + esc(item.title) + '</strong>' +
          '<p>' + esc(item.venue) + '</p>' +
          '<div class="lumilog-tag-row">' + item.tags.map(function (tag) { return '<span>' + esc(tag) + '</span>'; }).join('') + '</div>' +
        '</div>' +
      '</section>' +
      '<section class="lumilog-detail-section">' +
        '<div class="lumilog-subtitle"><h3>오늘의 한마디</h3></div>' +
        '<div class="lumilog-message-grid">' + item.members.map(renderMemberNote).join('') + '</div>' +
      '</section>' +
      '<section class="lumilog-detail-split">' +
        '<article class="lumilog-setlist-card">' +
          '<div class="lumilog-subtitle"><h3>SETLIST</h3></div>' +
          '<ol>' + item.setlist.map(function (song, index) {
            return '<li><span>' + pad(index + 1) + '</span><strong>' + esc(song) + '</strong></li>';
          }).join('') + '</ol>' +
        '</article>' +
        '<article class="lumilog-photo-card">' +
          '<div class="lumilog-subtitle"><h3>PHOTO LOG</h3></div>' +
          '<div class="lumilog-photo-grid">' + new Array(6).fill(0).map(function () {
            return '<span class="lumilog-image-slot lumilog-photo-slot" aria-hidden="true"></span>';
          }).join('') + '</div>' +
        '</article>' +
      '</section>' +
      '<section class="lumilog-memory-card">' +
        '<div class="lumilog-subtitle"><h3>루미나의 마음</h3></div>' +
        '<button type="button" class="lumilog-memory-inner lumilog-card-link" data-lumilog-view="heart">' +
          '<span class="lumilog-image-slot lumilog-memory-image" aria-hidden="true"></span>' +
          '<p>' + esc(item.memoryNote) + '</p>' +
          '<span class="lumilog-arrow">›</span>' +
        '</button>' +
      '</section>' +
      '<section class="lumilog-personal-card">' +
        '<div class="lumilog-subtitle"><h3>이날의 내 추억</h3></div>' +
        '<div class="lumilog-personal-row">' +
          item.personalSummary.slice(0, 3).map(renderPersonalItem).join('') +
          '<button type="button" class="lumilog-primary-btn lumilog-record-btn" data-lumilog-view="personal">내 기록에서 보기</button>' +
        '</div>' +
      '</section>';
  }

  function renderHeart(item, sortKey) {
    var entries = item.heartBoard.entries.slice();
    if (sortKey === 'likes') {
      entries.sort(function (a, b) { return b.likes - a.likes; });
    }

    return '' +
      '<button type="button" class="lumilog-back-btn" data-lumilog-back="detail">뒤로</button>' +
      '<section class="lumilog-subpage-header">' +
        '<div class="lumilog-subpage-title">' +
          '<h2>루미나의 마음</h2>' +
          '<p>' + esc(item.title) + ' · ' + esc(item.date) + '</p>' +
        '</div>' +
        '<span class="lumilog-subpage-note">공연 후 남겨준 마음은 루미벨의 기록에 오래 보관돼요.</span>' +
      '</section>' +
      '<section class="lumilog-heart-intro">' +
        '<div class="lumilog-heart-intro-main">' +
          '<span class="lumilog-image-slot lumilog-heart-main-image" aria-hidden="true"></span>' +
          '<div class="lumilog-heart-intro-copy">' +
            '<strong>공연 후 마음 남기기</strong>' +
            '<p>' + esc(item.heartBoard.notice) + '</p>' +
            '<button type="button" class="lumilog-primary-btn lumilog-heart-write-btn" data-lumilog-view="compose">' + esc(item.heartBoard.button) + '</button>' +
          '</div>' +
        '</div>' +
        '<div class="lumilog-heart-intro-side">' +
          '<span class="lumilog-image-slot lumilog-heart-side-image" aria-hidden="true"></span>' +
          '<p>' + esc(item.heartBoard.archive) + '</p>' +
        '</div>' +
      '</section>' +
      '<div class="lumilog-heart-sort-row">' +
        '<button type="button" class="lumilog-sort-btn' + (sortKey === 'latest' ? ' is-active' : '') + '" data-lumilog-sort="latest">최신순</button>' +
        '<button type="button" class="lumilog-sort-btn' + (sortKey === 'likes' ? ' is-active' : '') + '" data-lumilog-sort="likes">공감순</button>' +
      '</div>' +
      '<div class="lumilog-heart-list">' + entries.map(renderHeartEntry).join('') + '</div>' +
      '<section class="lumilog-foot-note">' +
        '<span class="lumilog-image-slot lumilog-foot-image" aria-hidden="true"></span>' +
        '<p>모든 마음은 운영 확인 후 루미벨 공식 공연 기록 아카이브에 보관됩니다. 따뜻한 마음을 남겨주셔서 감사합니다.</p>' +
      '</section>';
  }

  function renderCompose(item, selectedCategory) {
    var categories = ['감동 받았어요', '노래가 좋았어요', '루미벨을 응원해요', '오늘이 행복했어요', '기억하고 싶은 말', '기타'];

    return '' +
      '<button type="button" class="lumilog-back-btn" data-lumilog-back="heart">뒤로</button>' +
      '<section class="lumilog-compose-header">' +
        '<h2>공연 후 마음 남기기</h2>' +
        '<p>루미벨과 함께한 소중한 순간을 마음으로 남겨주세요.</p>' +
      '</section>' +
      '<section class="lumilog-compose-event-card">' +
        '<span class="lumilog-image-slot lumilog-compose-event-image" aria-hidden="true"></span>' +
        '<div class="lumilog-compose-event-copy">' +
          '<span class="lumilog-compose-kicker">기록 대상 공연</span>' +
          '<strong>' + esc(item.title) + '</strong>' +
          '<p>' + esc(item.date) + ' · 18:00</p>' +
          '<p>' + esc(item.venue) + '</p>' +
        '</div>' +
      '</section>' +
      '<section class="lumilog-compose-form-card">' +
        '<section class="lumilog-compose-section">' +
          '<div class="lumilog-compose-section-title"><h3>어떤 마음을 남겨도 좋아요</h3></div>' +
          '<div class="lumilog-compose-category-grid">' + categories.map(function (category) {
            return '<button type="button" class="lumilog-compose-category' + (category === selectedCategory ? ' is-selected' : '') + '" data-lumilog-compose-category="' + esc(category) + '">' + esc(category) + '</button>';
          }).join('') + '</div>' +
        '</section>' +
        '<section class="lumilog-compose-section">' +
          '<div class="lumilog-compose-section-title"><h3>마음 작성하기</h3></div>' +
          '<label class="lumilog-compose-text-wrap">' +
            '<textarea data-lumilog-compose-text maxlength="500" aria-label="공연 후 마음" placeholder="오늘 공연의 어떤 순간이 가장 기억에 남았나요?&#10;루미벨에게 전하고 싶은 마음을 자유롭게 남겨주세요."></textarea>' +
            '<span data-lumilog-compose-count>0 / 500자</span>' +
          '</label>' +
        '</section>' +
        '<section class="lumilog-compose-section">' +
          '<div class="lumilog-compose-section-title"><h3>사진 첨부 (선택)</h3></div>' +
          '<p class="lumilog-compose-helper">공연 현장 사진을 함께 올리면 더 생생한 기록이 돼요. 최대 4장까지 첨부할 수 있어요.</p>' +
          '<label class="lumilog-compose-upload-button">' +
            '<input type="file" accept="image/*" multiple aria-label="사진 추가하기" />' +
            '<span>사진 추가하기</span><small>최대 4장</small>' +
          '</label>' +
        '</section>' +
        '<section class="lumilog-compose-guide">' +
          '<h3>운영 안내</h3>' +
          '<ul>' +
            '<li>남겨주신 마음은 운영 확인 후 공개돼요.</li>' +
            '<li>공연을 사랑하는 다른 루미나에게도 큰 힘이 돼요.</li>' +
            '<li>욕설, 비방, 광고 등 부적절한 내용은 보관되지 않을 수 있어요.</li>' +
          '</ul>' +
        '</section>' +
        '<button type="button" class="lumilog-compose-submit">마음 보내기</button>' +
      '</section>';
  }

  function renderHeartEntry(item) {
    return '' +
      '<article class="lumilog-heart-card">' +
        '<div class="lumilog-heart-entry-label">운영 공개</div>' +
        '<div class="lumilog-heart-entry-copy">' +
          '<strong>' + esc(item.name) + '</strong>' +
          '<span>' + esc(item.time) + '</span>' +
          '<p>' + esc(item.body) + '</p>' +
        '</div>' +
        '<div class="lumilog-heart-entry-like" aria-label="공감 ' + esc(item.likes) + '">' +
          '<span class="lumilog-heart-entry-like-icon">❤</span>' +
          '<span>' + esc(item.likes) + '</span>' +
        '</div>' +
      '</article>';
  }

  function renderPersonal(item) {
    return '' +
      '<button type="button" class="lumilog-back-btn" data-lumilog-back="detail">뒤로</button>' +
      '<section class="lumilog-subpage-header lumilog-personal-header">' +
        '<div class="lumilog-subpage-title">' +
          '<h2>내 기록</h2>' +
        '</div>' +
        '<button type="button" class="lumilog-text-link" data-lumilog-open-timeline>일반 기록 타임라인으로</button>' +
      '</section>' +
      '<section class="lumilog-personal-event-card">' +
        '<span class="lumilog-image-slot lumilog-personal-event-image" aria-hidden="true"></span>' +
        '<div class="lumilog-personal-event-copy">' +
          '<strong>' + esc(item.title) + ' · ' + esc(item.date) + '</strong>' +
          '<p>' + esc(item.venue) + '</p>' +
          '<span class="lumilog-filter-chip">해당 공연으로 필터됨</span>' +
        '</div>' +
      '</section>' +
      '<section class="lumilog-personal-summary">' +
        '<div class="lumilog-subtitle"><h3>이 공연의 내 기록 요약</h3></div>' +
        '<div class="lumilog-personal-summary-grid">' + item.personalSummary.map(function (label) {
          return '<div class="lumilog-personal-summary-item"><span class="lumilog-image-slot lumilog-personal-summary-image" aria-hidden="true"></span><p>' + esc(label) + '</p></div>';
        }).join('') + '</div>' +
      '</section>' +
      '<section class="lumilog-personal-card-grid">' + item.personalCards.map(renderRecordCard).join('') + '</section>' +
      '<section class="lumilog-foot-note lumilog-record-memo">' +
        '<span class="lumilog-image-slot lumilog-foot-image" aria-hidden="true"></span>' +
        '<p>' + esc(item.recordMemo) + '</p>' +
        '<span class="lumilog-image-slot lumilog-record-memo-side" aria-hidden="true"></span>' +
      '</section>';
  }

  function renderRecordCard(item) {
    return '' +
      '<article class="lumilog-record-card">' +
        '<div class="lumilog-record-card-title">' + esc(item.title) + '</div>' +
        '<span class="lumilog-image-slot lumilog-record-card-image" aria-hidden="true"></span>' +
        '<strong>' + esc(item.value) + '</strong>' +
        '<div class="lumilog-record-card-meta">' + item.meta.map(function (line) {
          return '<span>' + esc(line) + '</span>';
        }).join('') + '</div>' +
      '</article>';
  }

  function renderMemberNote(item) {
    return '' +
      '<article class="lumilog-message-card">' +
        '<span class="lumilog-image-slot lumilog-message-image" aria-hidden="true"></span>' +
        '<div class="lumilog-message-copy">' +
          '<strong>' + esc(item.name) + '</strong>' +
          '<p>' + esc(item.note) + '</p>' +
        '</div>' +
      '</article>';
  }

  function renderPersonalItem(label) {
    return '' +
      '<div class="lumilog-personal-item">' +
        '<span class="lumilog-image-slot lumilog-personal-image" aria-hidden="true"></span>' +
        '<p>' + esc(label) + '</p>' +
      '</div>';
  }

  function pad(value) {
    return value < 10 ? '0' + value : String(value);
  }

  function findEvent(id) {
    return LOG_DATA.events.find(function (item) { return item.id === id; }) || LOG_DATA.events[0];
  }

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();
