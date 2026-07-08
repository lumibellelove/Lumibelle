(function () {
  "use strict";

  window.LumiApps = window.LumiApps || {};

  var CHEERBOOK_DATA = {
    event: {
      title: "LUMIBELLE 1st OHIROME LIVE",
      date: "2026. 04. 11 SAT · 18:00",
      venue: "홍대 상상마당 라이브홀",
      ticket: "내 티켓 있음"
    },
    recentSongs: ["stardust-magical", "youth-subliminal", "dream-piece"],
    newSongs: ["lumi-love"],
    setlist: [
      {
        id: "stardust-magical",
        order: "01",
        title: "Stardust Magical",
        description: "오프닝, 반짝이는 시작",
        colorHex: "#ef8fb1",
        colorLabel: "핑크",
        first: true,
        call: true,
        gesture: false,
        difficulty: "쉬움",
        heroPoints: [
          "후렴에서 멤버 이름 외치기",
          "두 번째 후렴 손 흔들기",
          "마지막에 ‘루미벨!’ 함께 외치기"
        ],
        pointRows: [
          { label: "인트로", value: "박수 4번" },
          { label: "A멜로", value: "조용히 듣기" },
          { label: "후렴", value: "멤버 이름 콜" },
          { label: "브리지", value: "함께 손 흔들기" },
          { label: "엔딩", value: "루미벨! 외치기" }
        ],
        lyricRows: [
          { lyric: "끝없는 밤을 넘어 우리 빛나", call: "멤버 이름 콜!" },
          { lyric: "모든 별이 모여 하나가 돼", call: "루미벨!" }
        ],
        lightRows: [
          { label: "팬라이트 색", value: "핑크" },
          { label: "흔든 방향", value: "좌우" },
          { label: "박수", value: "있음" },
          { label: "손 흔들기", value: "있음" },
          { label: "점프", value: "없음" }
        ]
      },
      {
        id: "youth-subliminal",
        order: "02",
        title: "청춘 서브리미널",
        description: "청량한 메인 응원곡",
        colorHex: "#c7abef",
        colorLabel: "라벤더",
        first: true,
        call: false,
        gesture: true,
        difficulty: "보통",
        heroPoints: [
          "후렴 시작에서 손동작 맞추기",
          "브리지에서 박수 두 번씩 맞추기",
          "엔딩 포즈에서 함께 손 흔들기"
        ],
        pointRows: [
          { label: "인트로", value: "조용히 듣기" },
          { label: "1절 후렴", value: "손동작 시작" },
          { label: "브리지", value: "박수 두 번" },
          { label: "마지막 후렴", value: "손 크게 흔들기" }
        ],
        lyricRows: [
          { lyric: "청춘의 문을 열어 둘이 달려가", call: "" },
          { lyric: "눈부신 오늘을 같이 불러줘", call: "함께 떼창" }
        ],
        lightRows: [
          { label: "팬라이트 색", value: "라벤더" },
          { label: "흔든 방향", value: "좌우" },
          { label: "박수", value: "있음" },
          { label: "손 흔들기", value: "있음" },
          { label: "점프", value: "없음" }
        ]
      },
      {
        id: "dream-piece",
        order: "03",
        title: "꿈의 조각",
        description: "후렴 콜 포인트 있음",
        colorHex: "#96c4f6",
        colorLabel: "스카이",
        first: false,
        call: true,
        gesture: true,
        difficulty: "쉬움",
        heroPoints: [
          "후렴 첫 줄 끝에서 콜 넣기",
          "두 번째 벌스에서 좌우 손 흔들기",
          "엔딩에서 크게 박수하기"
        ],
        pointRows: [
          { label: "전주", value: "조용히 듣기" },
          { label: "후렴", value: "콜 있음" },
          { label: "2절", value: "손동작 있음" },
          { label: "엔딩", value: "박수" }
        ],
        lyricRows: [
          { lyric: "조각난 꿈들이 모여 빛이 돼", call: "루미!" },
          { lyric: "반짝이는 내일을 함께 열어가", call: "벨!" }
        ],
        lightRows: [
          { label: "팬라이트 색", value: "스카이" },
          { label: "흔든 방향", value: "좌우" },
          { label: "박수", value: "있음" },
          { label: "손 흔들기", value: "있음" },
          { label: "점프", value: "없음" }
        ]
      },
      {
        id: "sparkle-promise",
        order: "04",
        title: "반짝이는 약속",
        description: "손동작이 들어가는 곡",
        colorHex: "#8edacc",
        colorLabel: "민트",
        first: false,
        call: false,
        gesture: true,
        difficulty: "보통",
        heroPoints: [
          "첫 후렴에서 양손 들기",
          "브리지에서 좌우로 천천히 흔들기",
          "엔딩 포즈 함께 맞추기"
        ],
        pointRows: [
          { label: "1절", value: "조용히 듣기" },
          { label: "후렴", value: "손동작 있음" },
          { label: "브리지", value: "좌우 흔들기" },
          { label: "엔딩", value: "손 위로 올리기" }
        ],
        lyricRows: [
          { lyric: "작은 약속 하나로도 마음이 닿아", call: "" },
          { lyric: "손끝의 빛을 모아 내일을 그려", call: "함께" }
        ],
        lightRows: [
          { label: "팬라이트 색", value: "민트" },
          { label: "흔든 방향", value: "좌우" },
          { label: "박수", value: "없음" },
          { label: "손 흔들기", value: "있음" },
          { label: "점프", value: "없음" }
        ]
      },
      {
        id: "girl-recipe",
        order: "05",
        title: "소녀 레시피",
        description: "상큼한 분위기의 곡",
        colorHex: "#f6c08c",
        colorLabel: "오렌지",
        first: true,
        call: false,
        gesture: false,
        difficulty: "쉬움",
        heroPoints: [
          "중간 브레이크에서 가볍게 박수",
          "후렴에서는 리듬만 따라가기",
          "엔딩에서는 멤버 호응 듣기"
        ],
        pointRows: [
          { label: "인트로", value: "조용히 듣기" },
          { label: "후렴", value: "리듬 타기" },
          { label: "엔딩", value: "가볍게 박수" }
        ],
        lyricRows: [
          { lyric: "달콤한 오늘을 한 스푼 더 담아", call: "" },
          { lyric: "우리만의 레시피로 빛을 섞어", call: "" }
        ],
        lightRows: [
          { label: "팬라이트 색", value: "오렌지" },
          { label: "흔든 방향", value: "좌우" },
          { label: "박수", value: "있음" },
          { label: "손 흔들기", value: "없음" },
          { label: "점프", value: "없음" }
        ]
      },
      {
        id: "lumi-love",
        order: "Encore",
        title: "LUMI LOVE!",
        description: "마지막 함께 외치는 앙코르",
        colorHex: "#f39dbb",
        colorLabel: "핑크",
        first: true,
        call: true,
        gesture: true,
        difficulty: "쉬움",
        heroPoints: [
          "도입부에서 크게 박수하기",
          "후렴마다 ‘LUMI LOVE!’ 외치기",
          "마지막엔 모두 함께 손 흔들기"
        ],
        pointRows: [
          { label: "도입", value: "박수" },
          { label: "후렴", value: "콜 있음" },
          { label: "브레이크", value: "손동작 있음" },
          { label: "엔딩", value: "함께 외치기" }
        ],
        lyricRows: [
          { lyric: "눈부신 오늘을 다시 안아줘", call: "LUMI LOVE!" },
          { lyric: "이 순간 끝까지 같이 반짝여", call: "루미벨!" }
        ],
        lightRows: [
          { label: "팬라이트 색", value: "핑크" },
          { label: "흔든 방향", value: "좌우" },
          { label: "박수", value: "있음" },
          { label: "손 흔들기", value: "있음" },
          { label: "점프", value: "없음" }
        ]
      }
    ]
  };

  window.LumiApps.cheerbook = function () {
    return '<section class="cheerbook-app" data-cheerbook-app></section>';
  };

  window.LumiApps.bindCheerbook = function (root) {
    var app = root.querySelector('[data-cheerbook-app]');
    if (!app || app.__lumiCheerBound) return;
    app.__lumiCheerBound = true;
    app.__lumiCheerView = 'home';
    app.__lumiCheerSelected = CHEERBOOK_DATA.setlist[0].id;
    app.__lumiCheerTab = 'point';

    renderCheerbook(app);

    app.addEventListener('click', function (e) {
      var action = e.target.closest('[data-cheer-nav]');
      if (action) {
        handleAction(app, action.getAttribute('data-cheer-nav'), action.getAttribute('data-song-id'));
        return;
      }

      var tab = e.target.closest('[data-cheer-tab]');
      if (tab) {
        app.__lumiCheerTab = tab.getAttribute('data-cheer-tab') || 'point';
        renderCheerbook(app);
      }
    });
  };

  function handleAction(app, action, songId) {
    if (action === 'setlist') {
      app.__lumiCheerView = 'setlist';
      renderCheerbook(app);
      return;
    }

    if (action === 'song' && songId) {
      app.__lumiCheerSelected = songId;
      app.__lumiCheerView = 'detail';
      app.__lumiCheerTab = 'point';
      renderCheerbook(app);
      return;
    }

    if (action === 'home') {
      app.__lumiCheerView = 'home';
      renderCheerbook(app);
    }
  }

  function renderCheerbook(app) {
    var view = app.__lumiCheerView || 'home';

    if (view === 'setlist') {
      app.innerHTML = renderSetlist();
    } else if (view === 'detail') {
      app.innerHTML = renderDetail(getSong(app.__lumiCheerSelected));
    } else {
      app.innerHTML = renderHome();
    }

    updateBackHandler(app);
  }

  function updateBackHandler(app) {
    if (!window.LumiPhone || typeof window.LumiPhone.setAppBackHandler !== 'function') return;

    window.LumiPhone.setAppBackHandler(function () {
      if (app.__lumiCheerView === 'detail') {
        app.__lumiCheerView = 'setlist';
        renderCheerbook(app);
        return true;
      }

      if (app.__lumiCheerView === 'setlist') {
        app.__lumiCheerView = 'home';
        renderCheerbook(app);
        return true;
      }

      return false;
    });
  }

  function renderHome() {
    var recentMarkup = CHEERBOOK_DATA.recentSongs.map(function (id) {
      var song = getSong(id);
      return renderMiniSongLink(song, 'song');
    }).join('');

    var newMarkup = CHEERBOOK_DATA.newSongs.map(function (id) {
      var song = getSong(id);
      return renderMiniSongLink(song, 'song', true);
    }).join('');

    return (
      '<div class="cheerbook-screen cheerbook-home-screen">' +
        '<section class="cheerbook-home-hero">' +
          '<h2 class="cheerbook-home-title">루미 응원북</h2>' +
          '<div class="cheerbook-home-sub">오늘 공연을 더 즐겁게 준비해요</div>' +
          '<article class="cheerbook-event-card">' +
            '<div class="cheerbook-poster-slot" aria-hidden="true"></div>' +
            '<div class="cheerbook-event-copy">' +
              '<h3>' + escHtml(CHEERBOOK_DATA.event.title) + '</h3>' +
              '<div class="cheerbook-divider">♥</div>' +
              '<div class="cheerbook-event-meta">' +
                '<div class="cheerbook-meta-row">' + escHtml(CHEERBOOK_DATA.event.date) + '</div>' +
                '<div class="cheerbook-meta-row">' + escHtml(CHEERBOOK_DATA.event.venue) + '</div>' +
              '</div>' +
              '<div class="cheerbook-ticket-chip">' + escHtml(CHEERBOOK_DATA.event.ticket) + '</div>' +
              '<button type="button" class="cheerbook-primary-action" data-cheer-nav="setlist">응원 준비하기</button>' +
            '</div>' +
          '</article>' +
        '</section>' +
        '<section class="cheerbook-home-grid">' +
          '<article class="cheerbook-home-list">' +
            '<h3 class="cheerbook-list-title">최근 본 응원법</h3>' +
            '<div class="cheerbook-link-list">' + recentMarkup + '</div>' +
            '<button type="button" class="cheerbook-list-more" data-cheer-nav="setlist">전체 보기 〉</button>' +
          '</article>' +
          '<article class="cheerbook-home-list is-new">' +
            '<h3 class="cheerbook-list-title">새 응원법</h3>' +
            '<div class="cheerbook-link-list">' + newMarkup + '</div>' +
            '<button type="button" class="cheerbook-list-more" data-cheer-nav="setlist">전체 보기 〉</button>' +
          '</article>' +
        '</section>' +
        '<section class="cheerbook-note"><b>응원법을 미리 익혀두면 공연이 더 즐거워져요!</b>가사 · 포인트 · 타이밍을 확인하고 완벽한 응원을 준비해요.</section>' +
      '</div>'
    );
  }

  function renderSetlist() {
    return (
      '<div class="cheerbook-screen cheerbook-setlist-screen">' +
        '<header class="cheerbook-setlist-hero">' +
          '<button type="button" class="cheerbook-setlist-back" data-cheer-nav="home" aria-label="뒤로가기">←</button>' +
          '<div class="cheerbook-setlist-heading">' +
            '<h2>오늘의 세트리스트</h2>' +
            '<p>' + escHtml(CHEERBOOK_DATA.event.title) + ' · 2026. 04. 11</p>' +
          '</div>' +
        '</header>' +
        '<section class="cheerbook-setlist-frame">' +
          '<section class="cheerbook-setlist-summary-card">' +
            '<div class="cheerbook-summary-art-slot" aria-hidden="true"></div>' +
            '<div class="cheerbook-setlist-summary-copy"><b>총 ' + CHEERBOOK_DATA.setlist.length + '곡</b><p>곡을 눌러 응원 포인트를 볼 수 있어요.</p></div>' +
          '</section>' +
          '<section class="cheerbook-setlist">' +
            CHEERBOOK_DATA.setlist.map(function (song) { return renderSetlistCard(song); }).join('') +
          '</section>' +
        '</section>' +
      '</div>'
    );
  }

  function renderDetail(song) {
    if (!song) song = CHEERBOOK_DATA.setlist[0];
    return (
      '<div class="cheerbook-screen cheerbook-detail-screen">' +
        '<section class="cheerbook-detail-hero">' +
          '<button type="button" class="cheerbook-detail-back" data-cheer-nav="setlist" aria-label="뒤로가기">←</button>' +
          '<h2 class="cheerbook-detail-title">' + escHtml(song.title) + '</h2>' +
          '<div class="cheerbook-detail-meta">' +
            '<span class="cheerbook-song-colorline"><span class="cheerbook-dot" style="--dot-color:' + escAttr(song.colorHex) + '"></span> 팬라이트 색: ' + escHtml(song.colorLabel) + '</span>' +
            (song.first ? '<span class="cheerbook-pill">첫 응원</span>' : '') +
            '<span class="cheerbook-pill">응원 난이도 ' + escHtml(song.difficulty) + '</span>' +
          '</div>' +
        '</section>' +
        '<section class="cheerbook-highlight-card cheerbook-detail-highlight">' +
          '<h3>이 곡의 핵심 응원</h3>' +
          '<div class="cheerbook-highlight-list">' +
            song.heroPoints.map(function (text, index) {
              return '<div class="cheerbook-highlight-item"><span class="cheerbook-highlight-index">' + (index + 1) + '</span><span class="cheerbook-highlight-text">' + escHtml(text) + '</span></div>';
            }).join('') +
          '</div>' +
        '</section>' +
        '<section class="cheerbook-detail-tabs-section">' +
          '<div class="cheerbook-tabs">' +
            renderTab('point', '응원 포인트', appTabIs(song, 'point')) +
            renderTab('lyrics', '가사 + 콜', appTabIs(song, 'lyrics')) +
            renderTab('light', '라이트 / 동작', appTabIs(song, 'light')) +
          '</div>' +
          renderDetailPanel(song) +
        '</section>' +
      '</div>'
    );
  }


  function renderMiniSongLink(song, action, isNew) {
    if (!song) return '';
    return (
      '<button type="button" class="cheerbook-mini-link" data-cheer-nav="' + escAttr(action) + '" data-song-id="' + escAttr(song.id) + '">' +
        '<span><b>' + escHtml(song.title) + '</b></span>' +
        (isNew ? '<span class="cheerbook-song-chip">NEW</span>' : '<span class="cheerbook-dot" style="--dot-color:' + escAttr(song.colorHex) + '"></span>') +
      '</button>'
    );
  }

  function renderSetlistCard(song) {
    var chips = [];
    if (song.first) chips.push('<span class="cheerbook-song-chip">첫 응원</span>');
    if (song.call) chips.push('<span class="cheerbook-song-chip">콜 있음</span>');
    if (song.gesture) chips.push('<span class="cheerbook-song-chip">손동작 있음</span>');

    return (
      '<button type="button" class="cheerbook-song-card" data-cheer-nav="song" data-song-id="' + escAttr(song.id) + '">' +
        '<span class="cheerbook-song-order' + (song.order === 'Encore' ? ' is-encore' : '') + '">' + escHtml(song.order) + '</span>' +
        '<span class="cheerbook-song-main">' +
          '<b class="cheerbook-song-title">' + escHtml(song.title) + '</b>' +
          '<span class="cheerbook-song-desc">' + escHtml(song.description) + '</span>' +
          '<span class="cheerbook-song-chips">' + chips.join('') + '</span>' +
        '</span>' +
        '<span class="cheerbook-song-tools">' +
          '<span class="cheerbook-song-accent" style="--dot-color:' + escAttr(song.colorHex) + '"></span>' +
          '<span class="cheerbook-arrow">›</span>' +
          '<span class="cheerbook-level-chip">' + escHtml(song.difficulty) + '</span>' +
        '</span>' +
      '</button>'
    );
  }

  function renderTab(id, label, active) {
    return '<button type="button" class="cheerbook-tab' + (active ? ' is-active' : '') + '" data-cheer-tab="' + escAttr(id) + '">' + escHtml(label) + '</button>';
  }

  function renderDetailPanel(song) {
    var currentTab = getCurrentTab();

    if (currentTab === 'lyrics') {
      return (
        '<section class="cheerbook-panel">' +
          '<h4>가사 + 콜</h4>' +
          '<div class="cheerbook-lyric-list">' +
            song.lyricRows.map(function (row) {
              return '<div class="cheerbook-lyric-row"><b>' + escHtml(row.lyric) + '</b>' + (row.call ? '<span class="cheerbook-callout">' + escHtml(row.call) + '</span>' : '') + '</div>';
            }).join('') +
          '</div>' +
        '</section>'
      );
    }

    if (currentTab === 'light') {
      return (
        '<section class="cheerbook-panel">' +
          '<h4>라이트 / 동작</h4>' +
          '<div class="cheerbook-data-list">' +
            song.lightRows.map(function (row) {
              return '<div class="cheerbook-data-row"><b>' + escHtml(row.label) + '</b><span>' + escHtml(row.value) + '</span></div>';
            }).join('') +
          '</div>' +
        '</section>'
      );
    }

    return (
      '<section class="cheerbook-panel">' +
        '<h4>응원 포인트</h4>' +
        '<div class="cheerbook-guide-list">' +
          song.pointRows.map(function (row) {
            return '<div class="cheerbook-guide-row"><b>' + escHtml(row.label) + '</b><span>' + escHtml(row.value) + '</span></div>';
          }).join('') +
        '</div>' +
      '</section>'
    );
  }

  function getSong(id) {
    return CHEERBOOK_DATA.setlist.find(function (item) { return item.id === id; }) || CHEERBOOK_DATA.setlist[0];
  }

  function getCurrentTab() {
    var app = document.querySelector('[data-cheerbook-app]');
    return app && app.__lumiCheerTab ? app.__lumiCheerTab : 'point';
  }

  function appTabIs(song, tab) {
    return getCurrentTab() === tab;
  }

  function escHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>\"]/g, function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[character];
    });
  }

  function escAttr(value) {
    return escHtml(value).replace(/'/g, '&#39;');
  }
}());
