(function () {
  "use strict";

  var DEFAULT_DATA = {
    xp: {
      current: 312,
      next: 320
    },
    equippedTitle: "첫 번째 점",
    achievements: [
      {
        id: "first-dot",
        category: "live",
        icon: "✨",
        title: "첫 번째 점",
        desc: "Lumibelle Debut Live에서 루미벨의 첫 번째 점을 함께 기록했어요.",
        progress: "1 / 1",
        status: "done",
        reward: "칭호 「첫 번째 점」",
        date: "2026.07.12"
      },
      {
        id: "first-visit",
        category: "live",
        icon: "🎀",
        title: "첫 루미 방문",
        desc: "루미벨에게 처음 와준 기록이에요.",
        progress: "1 / 1",
        status: "done",
        reward: "칭호 「처음 와준 루미나」",
        date: "2026.07.12"
      },
      {
        id: "first-ticket",
        category: "ticket",
        icon: "🎫",
        title: "첫 티켓 보유",
        desc: "루미폰 티켓함에 첫 공연 티켓이 들어온 기록이에요.",
        progress: "1 / 1",
        status: "done",
        reward: "칭호 「첫 초대장」",
        date: "2026.07.12"
      },
      {
        id: "welcome-ticket",
        category: "ticket",
        icon: "💝",
        title: "Welcome Ticket 보유",
        desc: "처음 루미벨을 만나러 온 루미나에게 지급되는 신규 이벤트권 기록이에요.",
        progress: "1 / 1",
        status: "done",
        reward: "칭호 「웰컴 루미나」",
        date: "2026.07.12"
      },
      {
        id: "first-checkin",
        category: "checkin",
        icon: "🌸",
        title: "처음 만난 반짝임",
        desc: "첫 루미 체크인을 완료했어요.",
        progress: "1 / 1",
        status: "done",
        reward: "칭호 「처음 만난 반짝임」",
        date: "2026.07.12"
      },
      {
        id: "stamp-first",
        category: "stamp",
        icon: "🌸",
        title: "스탬프 첫 장",
        desc: "첫 번째 꽃도장이 루미폰에 기록됐어요.",
        progress: "1 / 1",
        status: "done",
        reward: "칭호 「스탬프 첫 장」",
        date: "2026.07.12"
      },
      {
        id: "online-heart",
        category: "online",
        icon: "💌",
        title: "멀리서 닿은 마음",
        desc: "온라인 응원 기록이 생기면 해금돼요.",
        progress: "0 / 1",
        status: "progress",
        reward: "칭호 후보",
        date: ""
      },
      {
        id: "season-secret",
        category: "hidden",
        icon: "🔒",
        title: "숨겨진 반짝임",
        desc: "특별한 조건을 만족하면 공개돼요.",
        progress: "0 / 1",
        status: "locked",
        reward: "비공개",
        date: ""
      }
    ],
    titles: [
      { id: "title-first-dot", name: "첫 번째 점", source: "첫 번째 점 업적", equipped: true },
      { id: "title-welcome", name: "웰컴 루미나", source: "Welcome Ticket 보유", equipped: false },
      { id: "title-stamp", name: "스탬프 첫 장", source: "스탬프 첫 장", equipped: false },
      { id: "title-sparkle", name: "처음 만난 반짝임", source: "첫 루미 체크인", equipped: false }
    ]
  };

  var MAIN_TABS = [
    { id: "achievements", label: "업적" },
    { id: "titles", label: "칭호" },
    { id: "guide", label: "안내" }
  ];

  var CATEGORIES = [
    { id: "all", label: "전체" },
    { id: "done", label: "달성" },
    { id: "progress", label: "진행 중" },
    { id: "hidden", label: "숨김" }
  ];

  window.LumiApps = window.LumiApps || {};

  window.LumiApps.achievement = function () {
    return (
      '<section class="achievement-app" data-achievement-app>' +
        '<div class="achievement-head">' +
          '<h2>업적</h2>' +
          '<p>루미벨과 함께한 시간을 보관하는 기록이에요. 칭호는 업적 보상으로 해금돼요.</p>' +
        '</div>' +
        '<div class="achievement-tabs" role="tablist">' +
          MAIN_TABS.map(function (tab, index) {
            return '<button type="button" class="achievement-tab ' + (index === 0 ? 'is-active' : '') + '" data-achievement-tab="' + escHtml(tab.id) + '">' + escHtml(tab.label) + '</button>';
          }).join("") +
        '</div>' +
        '<div class="achievement-body" data-achievement-body></div>' +
      '</section>'
    );
  };

  window.LumiApps.bindAchievement = function (root) {
    var app = root.querySelector("[data-achievement-app]");
    if (!app || app.__lumiAchievementBound) return;
    app.__lumiAchievementBound = true;

    app.__lumiAchievementData = normalizePayload(window.LUMI_ACHIEVEMENT_DATA || DEFAULT_DATA);
    app.__lumiAchievementTab = "achievements";
    app.__lumiAchievementCategory = "all";

    app.addEventListener("click", function (e) {
      var tab = e.target.closest("[data-achievement-tab]");
      if (tab) {
        app.__lumiAchievementTab = tab.getAttribute("data-achievement-tab") || "achievements";
        app.querySelectorAll("[data-achievement-tab]").forEach(function (btn) {
          btn.classList.toggle("is-active", btn === tab);
        });
        renderAchievement(app);
        return;
      }

      var category = e.target.closest("[data-achievement-category]");
      if (category) {
        app.__lumiAchievementCategory = category.getAttribute("data-achievement-category") || "all";
        renderAchievement(app);
        return;
      }
    });

    renderAchievement(app);
  };

  function renderAchievement(app) {
    var body = app.querySelector("[data-achievement-body]");
    if (!body) return;

    var tab = app.__lumiAchievementTab || "achievements";
    var data = app.__lumiAchievementData || normalizePayload(DEFAULT_DATA);

    if (tab === "titles") {
      body.innerHTML = renderTitles(data);
      return;
    }

    if (tab === "guide") {
      body.innerHTML = renderGuide();
      return;
    }

    body.innerHTML = renderAchievements(app, data);
  }

  function renderAchievements(app, data) {
    var category = app.__lumiAchievementCategory || "all";
    var filtered = filterAchievements(data.achievements, category);
    var current = filtered;
    var doneCount = data.achievements.filter(function (item) { return item.status === "done"; }).length;
    var progressCount = data.achievements.filter(function (item) { return item.status === "progress"; }).length;

    return (
      '<section class="achievement-xp-card">' +
        '<div>' +
          '<span>현재 반짝 XP</span>' +
          '<strong>' + escHtml(data.xp.current) + ' XP</strong>' +
          '<p>다음 목표 ' + escHtml(data.xp.next) + '</p>' +
        '</div>' +
        '<i><b style="width:' + escHtml(getXpPercent(data.xp)) + '%"></b></i>' +
      '</section>' +
      '<section class="achievement-summary-grid">' +
        '<article><span>달성 업적</span><strong>' + escHtml(doneCount) + '개</strong></article>' +
        '<article><span>보유 칭호</span><strong>' + escHtml(data.titles.length) + '개</strong></article>' +
        '<article><span>진행 중</span><strong>' + escHtml(progressCount) + '개</strong></article>' +
        '<article><span>대표 칭호</span><strong>' + escHtml(data.equippedTitle || "-") + '</strong></article>' +
      '</section>' +
      '<div class="achievement-category-row">' +
        CATEGORIES.map(function (item) {
          return '<button type="button" class="' + (item.id === category ? 'is-active' : '') + '" data-achievement-category="' + escHtml(item.id) + '">' + escHtml(item.label) + '</button>';
        }).join("") +
      '</div>' +
      '<section class="achievement-collection">' +
        '<div class="achievement-section-head">' +
          '<h3>업적 도감</h3>' +
          '<p>카드를 눌러 보는 상세 기능은 이후 연결 예정이에요.</p>' +
        '</div>' +
        '<div class="achievement-card-grid">' +
          (current.length ? current.map(renderAchievementCard).join("") : '<div class="achievement-empty">조건에 맞는 업적이 없어요.</div>') +
        '</div>'+
      '</section>'
    );
  }

  function renderAchievementCard(item) {
    var statusLabel = item.status === "done" ? "달성" : item.status === "locked" ? "숨김" : "진행중";
    return (
      '<article class="achievement-card is-' + escHtml(item.status) + '">' +
        '<div class="achievement-icon">' + escHtml(item.icon || "✦") + '</div>' +
        '<span>' + escHtml(statusLabel) + '</span>' +
        '<strong>' + escHtml(item.title) + '</strong>' +
        '<p>' + escHtml(item.progress || "-") + ' · ' + escHtml(item.reward || "") + '</p>' +
      '</article>'
    );
  }

  function renderTitles(data) {
    return (
      '<section class="achievement-title-tab">' +
        '<article class="achievement-equipped-card">' +
          '<span>현재 장착 칭호</span>' +
          '<strong>' + escHtml(data.equippedTitle || "-") + '</strong>' +
          '<p>칭호 장착 변경은 이후 프로필 기능과 함께 연결돼요.</p>' +
        '</article>' +
        '<div class="achievement-section-head">' +
          '<h3>보유 칭호</h3>' +
          '<p>업적 보상으로 해금된 칭호예요.</p>' +
        '</div>' +
        '<div class="achievement-title-grid">' +
          data.titles.map(function (title) {
            return (
              '<article class="achievement-title-card ' + (title.equipped ? 'is-equipped' : '') + '">' +
                '<strong>' + escHtml(title.name) + '</strong>' +
                '<p>' + escHtml(title.source || "") + '</p>' +
                '<span>' + escHtml(title.equipped ? "장착 중" : "보유") + '</span>' +
              '</article>'
            );
          }).join("") +
        '</div>' +
      '</section>'
    );
  }

  function renderGuide() {
    return (
      '<section class="achievement-guide-tab">' +
        '<article>' +
          '<h3>업적 안내</h3>' +
          '<p>업적은 루미벨과 함께한 팬 활동 기록이에요. 라이브, 티켓, 특전회, 스탬프, 온라인 기록에 따라 해금돼요.</p>' +
        '</article>' +
        '<article>' +
          '<h3>칭호 안내</h3>' +
          '<p>칭호는 업적 보상으로 해금되는 프로필 꾸미기 보상이에요. 장착 기능은 이후 프로필과 함께 연결돼요.</p>' +
        '</article>' +
        '<article>' +
          '<h3>비교 없이 보관해요</h3>' +
          '<p>업적은 랭킹이나 비교가 아니라, 루미나가 루미벨과 함께한 시간을 보관하는 기록이에요.</p>' +
        '</article>' +
      '</section>'
    );
  }

  function filterAchievements(items, category) {
    if (category === "all") return items;
    if (category === "done") {
      return items.filter(function (item) {
        return item.status === "done";
      });
    }
    if (category === "progress") {
      return items.filter(function (item) {
        return item.status === "progress";
      });
    }
    if (category === "hidden") {
      return items.filter(function (item) {
        return item.status === "locked" || item.category === "hidden";
      });
    }
    return items;
  }

  function getXpPercent(xp) {
    var current = Number(xp.current || 0);
    var next = Number(xp.next || 1);
    if (!next) return 0;
    return Math.max(0, Math.min(100, Math.round(current / next * 100)));
  }

  function normalizePayload(payload) {
    var data = payload || {};
    return {
      xp: data.xp || DEFAULT_DATA.xp,
      equippedTitle: data.equippedTitle || DEFAULT_DATA.equippedTitle,
      achievements: Array.isArray(data.achievements) ? data.achievements : DEFAULT_DATA.achievements,
      titles: Array.isArray(data.titles) ? data.titles : DEFAULT_DATA.titles
    };
  }

  function escHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
