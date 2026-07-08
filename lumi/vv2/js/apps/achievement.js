(function () {
  "use strict";

  var DEFAULT_DATA = {
    xp: { current: 312, next: 320 },
    equippedTitle: "첫 번째 점",
    equippedTitleDescription: "루미벨과 처음 반짝인 순간의 칭호",
    recentTitle: "첫 루미 방문",
    nextUnlockCount: 1,
    achievements: [
      { id: "first-dot", category: "live", title: "첫 번째 점", progress: "1 / 1", status: "done", reward: "칭호 「첫 번째 점」" },
      { id: "first-visit", category: "live", title: "첫 루미 방문", progress: "1 / 1", status: "done", reward: "칭호 「처음 와준 루미나」" },
      { id: "first-ticket", category: "ticket", title: "첫 티켓 보유", progress: "1 / 1", status: "done", reward: "칭호 「첫 초대장」" },
      { id: "welcome-ticket", category: "ticket", title: "Welcome Ticket 보유", progress: "1 / 1", status: "done", reward: "칭호 「웰컴 루미나」" },
      { id: "first-checkin", category: "checkin", title: "처음 만난 반짝임", progress: "1 / 1", status: "done", reward: "칭호 「처음 만난 반짝임」" },
      { id: "stamp-first", category: "stamp", title: "스탬프 첫 장", progress: "1 / 1", status: "done", reward: "칭호 「스탬프 첫 장」" },
      { id: "online-heart", category: "online", title: "멀리서 닿은 마음", progress: "0 / 1", status: "progress", reward: "칭호 후보" },
      { id: "season-secret", category: "hidden", title: "숨겨진 반짝임", progress: "0 / 1", status: "locked", reward: "비공개" }
    ],
    titles: [
      { id: "title-first-dot", name: "첫 번째 점", source: "첫 공연 참여 보상", equipped: true },
      { id: "title-first-visit", name: "처음 와준 루미나", source: "첫 루미 방문 업적 보상", equipped: false },
      { id: "title-first-ticket", name: "첫 초대장", source: "첫 티켓 보유 업적 보상", equipped: false },
      { id: "title-welcome", name: "웰컴 루미나", source: "Welcome Ticket 보유 보상", equipped: false }
    ],
    titleCatalog: [
      { id: "catalog-first-dot", name: "첫 번째 점", description: "첫 공연 참여 보상", status: "owned" },
      { id: "catalog-first-visit", name: "처음 와준 루미나", description: "첫 루미 방문 업적 보상", status: "owned" },
      { id: "catalog-first-ticket", name: "첫 초대장", description: "첫 티켓 보유 업적 보상", status: "owned" },
      { id: "catalog-welcome", name: "웰컴 루미나", description: "Welcome Ticket 보유 보상", status: "owned" },
      { id: "catalog-stamp-master", name: "스탬프 마스터", description: "스탬프 10장 달성", status: "locked" },
      { id: "catalog-cheer-captain", name: "반짝 응원단장", description: "응원북 5회 열람", status: "locked" }
    ]
  };

  var HERO_COPY = {
    achievements: {
      title: "업적",
      description: "루미벨과 함께한 시간을 보관하는 기록이에요. 칭호는 업적 보상으로 해금돼요."
    },
    titles: {
      title: "칭호",
      description: "루미벨과 함께 얻은 칭호를 모아보고 대표 칭호를 설정해요."
    },
    guide: {
      title: "안내",
      description: "업적과 칭호 구조를 한눈에 보고 해금 흐름을 확인해요."
    }
  };

  var MAIN_TABS = [
    { id: "achievements", label: "업적" },
    { id: "titles", label: "칭호" },
    { id: "guide", label: "안내" }
  ];

  var ACHIEVEMENT_CATEGORIES = [
    { id: "all", label: "전체" },
    { id: "done", label: "달성" },
    { id: "progress", label: "진행 중" },
    { id: "hidden", label: "숨김" }
  ];

  var TITLE_CATEGORIES = [
    { id: "all", label: "전체" },
    { id: "owned", label: "보유" },
    { id: "locked", label: "미해금" }
  ];

  var GUIDE_EXAMPLES = [
    { condition: "첫 공연 참여", result: "첫 번째 점" },
    { condition: "첫 루미 방문", result: "처음 와준 루미나" },
    { condition: "Welcome Ticket 보유", result: "웰컴 루미나" },
    { condition: "스탬프 10장", result: "스탬프 마스터" }
  ];

  window.LumiApps = window.LumiApps || {};


  function renderAchievementPreviewNotice() {
    return '' +
      '<section class="v2-dev-inline-notice achievement-preview-notice">' +
        '<strong>루미폰 V2 개발중인 화면이에요</strong>' +
        '<p>디지털 특전권만 이용할 수 있어요. 아래 기능은 미리보기예요.</p>' +
      '</section>';
  }

  window.LumiApps.achievement = function () {
    return '' +
      '<section class="achievement-app" data-achievement-app>' +
        '<section class="achievement-hero">' +
          '<span class="achievement-image-slot achievement-hero-image" aria-hidden="true"></span>' +
          '<div class="achievement-hero-copy">' +
            '<h2 data-achievement-hero-title>업적</h2>' +
            '<p data-achievement-hero-desc>루미벨과 함께한 시간을 보관하는 기록이에요. 칭호는 업적 보상으로 해금돼요.</p>' +
          '</div>' +
          '<span class="achievement-image-slot achievement-hero-side" aria-hidden="true"></span>' +
        '</section>' +
        renderAchievementPreviewNotice() +
        '<div class="achievement-tabs" role="tablist">' +
          MAIN_TABS.map(function (tab, index) {
            return '<button type="button" class="achievement-tab ' + (index === 0 ? 'is-active' : '') + '" data-achievement-tab="' + escHtml(tab.id) + '">' + escHtml(tab.label) + '</button>';
          }).join('') +
        '</div>' +
        '<div class="achievement-body" data-achievement-body></div>' +
      '</section>';
  };

  window.LumiApps.bindAchievement = function (root) {
    var app = root.querySelector('[data-achievement-app]');
    if (!app || app.__lumiAchievementBound) return;
    app.__lumiAchievementBound = true;
    app.__lumiAchievementData = normalizePayload(window.LUMI_ACHIEVEMENT_DATA || DEFAULT_DATA);
    app.__lumiAchievementTab = 'achievements';
    app.__lumiAchievementCategory = 'all';
    app.__lumiTitleCategory = 'all';

    app.addEventListener('click', function (event) {
      var tab = event.target.closest('[data-achievement-tab]');
      if (tab) {
        app.__lumiAchievementTab = tab.getAttribute('data-achievement-tab') || 'achievements';
        renderAchievement(app);
        return;
      }

      var category = event.target.closest('[data-achievement-category]');
      if (category) {
        app.__lumiAchievementCategory = category.getAttribute('data-achievement-category') || 'all';
        renderAchievement(app);
        return;
      }

      var titleCategory = event.target.closest('[data-title-category]');
      if (titleCategory) {
        app.__lumiTitleCategory = titleCategory.getAttribute('data-title-category') || 'all';
        renderAchievement(app);
      }
    });

    renderAchievement(app);
  };

  function renderAchievement(app) {
    var body = app.querySelector('[data-achievement-body]');
    if (!body) return;

    var tab = app.__lumiAchievementTab || 'achievements';
    var data = app.__lumiAchievementData || normalizePayload(DEFAULT_DATA);

    updateHero(app, tab);

    app.querySelectorAll('[data-achievement-tab]').forEach(function (button) {
      button.classList.toggle('is-active', button.getAttribute('data-achievement-tab') === tab);
    });

    if (tab === 'titles') {
      body.innerHTML = renderTitles(app, data);
      return;
    }

    if (tab === 'guide') {
      body.innerHTML = renderGuide();
      return;
    }

    body.innerHTML = renderAchievements(app, data);
  }

  function updateHero(app, tab) {
    var copy = HERO_COPY[tab] || HERO_COPY.achievements;
    var titleEl = app.querySelector('[data-achievement-hero-title]');
    var descEl = app.querySelector('[data-achievement-hero-desc]');
    if (titleEl) titleEl.textContent = copy.title;
    if (descEl) descEl.textContent = copy.description;
  }

  function renderAchievements(app, data) {
    var category = app.__lumiAchievementCategory || 'all';
    var filtered = filterAchievements(data.achievements, category);
    var doneCount = data.achievements.filter(function (item) { return item.status === 'done'; }).length;
    var progressCount = data.achievements.filter(function (item) { return item.status === 'progress'; }).length;
    var xpPercent = getXpPercent(data.xp);

    return '' +
      '<section class="achievement-xp-card">' +
        '<div class="achievement-xp-copy">' +
          '<span>현재 반짝 XP</span>' +
          '<strong>' + escHtml(data.xp.current) + ' XP</strong>' +
          '<p>다음 목표 ' + escHtml(data.xp.next) + '</p>' +
          '<div class="achievement-xp-track"><b style="width:' + escHtml(xpPercent) + '%"></b></div>' +
        '</div>' +
        '<span class="achievement-image-slot achievement-xp-image" aria-hidden="true"></span>' +
      '</section>' +
      '<section class="achievement-summary-grid">' +
        renderSummary('달성 업적', doneCount + '개') +
        renderSummary('보유 칭호', data.titles.length + '개') +
        renderSummary('진행 중', progressCount + '개') +
        renderSummary('대표 칭호', data.equippedTitle || '-') +
      '</section>' +
      '<div class="achievement-category-row">' +
        ACHIEVEMENT_CATEGORIES.map(function (item) {
          return '<button type="button" class="' + (item.id === category ? 'is-active' : '') + '" data-achievement-category="' + escHtml(item.id) + '">' + escHtml(item.label) + '</button>';
        }).join('') +
      '</div>' +
      '<section class="achievement-collection">' +
        '<div class="achievement-section-head"><h3>업적 도감</h3><p>카드를 눌러 보는 상세 기능은 이후 연결 예정이에요.</p></div>' +
        '<div class="achievement-card-grid">' +
          (filtered.length ? filtered.map(renderAchievementCard).join('') : '<div class="achievement-empty">조건에 맞는 업적이 없어요.</div>') +
        '</div>' +
      '</section>';
  }

  function renderSummary(label, value) {
    return '<article><span class="achievement-image-slot achievement-summary-image" aria-hidden="true"></span><div><span>' + escHtml(label) + '</span><strong>' + escHtml(value) + '</strong></div></article>';
  }

  function renderAchievementCard(item) {
    var statusLabel = item.status === 'done' ? '달성' : item.status === 'locked' ? '숨김' : '진행 중';
    return '' +
      '<article class="achievement-card is-' + escHtml(item.status) + '">' +
        '<span class="achievement-image-slot achievement-card-image" aria-hidden="true"></span>' +
        '<div class="achievement-card-copy">' +
          '<span>' + escHtml(statusLabel) + '</span>' +
          '<strong>' + escHtml(item.title) + '</strong>' +
          '<p>' + escHtml(item.progress || '-') + ' · ' + escHtml(item.reward || '') + '</p>' +
        '</div>' +
      '</article>';
  }

  function renderTitles(app, data) {
    var category = app.__lumiTitleCategory || 'all';
    var filtered = filterTitleCatalog(data.titleCatalog, category);
    var ownedCount = data.titleCatalog.filter(function (item) { return item.status === 'owned'; }).length;

    return '' +
      '<section class="achievement-title-overview">' +
        '<div class="achievement-title-overview-main">' +
          '<div class="achievement-title-overview-copy">' +
            '<span>대표 칭호</span>' +
            '<strong>' + escHtml(data.equippedTitle || '-') + '</strong>' +
            '<p>' + escHtml(data.equippedTitleDescription || '') + '</p>' +
          '</div>' +
          '<span class="achievement-image-slot achievement-title-overview-image" aria-hidden="true"></span>' +
        '</div>' +
        '<div class="achievement-title-overview-stats">' +
          renderTitleSummaryCard('보유 칭호', ownedCount + '개') +
          renderTitleSummaryCard('최근 획득', data.recentTitle || '-') +
          renderTitleSummaryCard('다음 해금까지', escHtml(data.nextUnlockCount) + '개') +
        '</div>' +
      '</section>' +
      '<div class="achievement-title-category-row">' +
        TITLE_CATEGORIES.map(function (item) {
          return '<button type="button" class="' + (item.id === category ? 'is-active' : '') + '" data-title-category="' + escHtml(item.id) + '">' + escHtml(item.label) + '</button>';
        }).join('') +
      '</div>' +
      '<section class="achievement-collection">' +
        '<div class="achievement-section-head"><h3>칭호 도감</h3></div>' +
        '<div class="achievement-title-grid">' +
          (filtered.length ? filtered.map(renderTitleCard).join('') : '<div class="achievement-empty">조건에 맞는 칭호가 없어요.</div>') +
        '</div>' +
      '</section>' +
      '<div class="achievement-title-footnote">대표 칭호는 마이 프로필에서 설정할 수 있어요.</div>';
  }

  function renderTitleSummaryCard(label, value) {
    return '' +
      '<article class="achievement-title-summary-card">' +
        '<span class="achievement-image-slot achievement-title-summary-image" aria-hidden="true"></span>' +
        '<div>' +
          '<span>' + escHtml(label) + '</span>' +
          '<strong>' + escHtml(value) + '</strong>' +
        '</div>' +
      '</article>';
  }

  function renderTitleCard(item) {
    var statusLabel = item.status === 'owned' ? '보유' : '미해금';
    return '' +
      '<article class="achievement-title-card ' + (item.status === 'locked' ? 'is-locked' : 'is-owned') + '">' +
        '<span class="achievement-image-slot achievement-title-image" aria-hidden="true"></span>' +
        '<div class="achievement-title-card-copy">' +
          '<em>' + escHtml(statusLabel) + '</em>' +
          '<strong>' + escHtml(item.name) + '</strong>' +
          '<p>' + escHtml(item.description || '') + '</p>' +
        '</div>' +
      '</article>';
  }

  function renderGuide() {
    return '' +
      '<section class="achievement-guide-tab">' +
        '<article class="achievement-guide-card achievement-guide-intro">' +
          '<div class="achievement-guide-copy">' +
            '<h3>칭호이란?</h3>' +
            '<p>칭호는 루미벨과 함께한 기록을 통해 얻는 특별한 이름표예요. 공연 참여, 티켓 보유, 스탬프, 응원 활동 등으로 해금돼요.</p>' +
          '</div>' +
          '<span class="achievement-image-slot achievement-guide-intro-image" aria-hidden="true"></span>' +
        '</article>' +
        '<article class="achievement-guide-card">' +
          '<h3>대표 칭호 설정</h3>' +
          '<div class="achievement-guide-step-row">' +
            renderGuideStep('1', '보유한 칭호 확인') +
            renderGuideStep('2', '원하는 칭호 선택') +
            renderGuideStep('3', '마이 프로필에 적용') +
          '</div>' +
          '<p class="achievement-guide-caption">대표 칭호는 프로필과 일부 기록 화면에서 보여요.</p>' +
        '</article>' +
        '<article class="achievement-guide-card">' +
          '<h3>획득 방법 예시</h3>' +
          '<div class="achievement-guide-example-list">' +
            GUIDE_EXAMPLES.map(function (item) {
              return '<div class="achievement-guide-example-row">' +
                '<span class="achievement-image-slot achievement-guide-example-image" aria-hidden="true"></span>' +
                '<span class="achievement-guide-example-condition">' + escHtml(item.condition) + '</span>' +
                '<span class="achievement-guide-example-arrow">→</span>' +
                '<strong>' + escHtml(item.result) + '</strong>' +
              '</div>';
            }).join('') +
          '</div>' +
        '</article>' +
        '<article class="achievement-guide-card">' +
          '<h3>유의사항</h3>' +
          '<div class="achievement-guide-note-wrap">' +
            '<span class="achievement-image-slot achievement-guide-note-image" aria-hidden="true"></span>' +
            '<ul class="achievement-guide-note-list">' +
              '<li>해금 전 칭호는 잠금 상태로 보여요.</li>' +
              '<li>일부 칭호는 특정 기록 달성 후 자동 해금돼요.</li>' +
              '<li>대표 칭호는 언제든 다시 바꿀 수 있어요.</li>' +
              '<li>칭호 자체는 소모되지 않아요.</li>' +
            '</ul>' +
          '</div>' +
        '</article>' +
        '<div class="achievement-title-footnote">새 칭호는 조건 달성 후 자동으로 추가돼요.</div>' +
      '</section>';
  }

  function renderGuideStep(number, label) {
    return '' +
      '<div class="achievement-guide-step">' +
        '<span class="achievement-guide-step-num">' + escHtml(number) + '</span>' +
        '<span class="achievement-image-slot achievement-guide-step-image" aria-hidden="true"></span>' +
        '<strong>' + escHtml(label) + '</strong>' +
      '</div>';
  }

  function filterAchievements(items, category) {
    if (category === 'all' || category === 'done') {
      return items.filter(function (item) { return item.status === 'done'; });
    }
    if (category === 'progress') return items.filter(function (item) { return item.status === 'progress'; });
    if (category === 'hidden') return items.filter(function (item) { return item.status === 'locked' || item.category === 'hidden'; });
    return items;
  }

  function filterTitleCatalog(items, category) {
    if (category === 'owned') {
      return items.filter(function (item) { return item.status === 'owned'; });
    }
    if (category === 'locked') {
      return items.filter(function (item) { return item.status !== 'owned'; });
    }
    return items;
  }

  function getXpPercent(xp) {
    var current = Number(xp.current || 0);
    var next = Number(xp.next || 1);
    return next ? Math.max(0, Math.min(100, Math.round(current / next * 100))) : 0;
  }

  function normalizePayload(payload) {
    var data = payload || {};
    return {
      xp: data.xp || DEFAULT_DATA.xp,
      equippedTitle: data.equippedTitle || DEFAULT_DATA.equippedTitle,
      equippedTitleDescription: data.equippedTitleDescription || DEFAULT_DATA.equippedTitleDescription,
      recentTitle: data.recentTitle || DEFAULT_DATA.recentTitle,
      nextUnlockCount: data.nextUnlockCount == null ? DEFAULT_DATA.nextUnlockCount : data.nextUnlockCount,
      achievements: Array.isArray(data.achievements) ? data.achievements : DEFAULT_DATA.achievements,
      titles: Array.isArray(data.titles) ? data.titles : DEFAULT_DATA.titles,
      titleCatalog: Array.isArray(data.titleCatalog) ? data.titleCatalog : DEFAULT_DATA.titleCatalog
    };
  }

  function escHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();
