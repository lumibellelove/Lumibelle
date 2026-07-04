/**
 * point.js — 반짝 포인트
 * 반짝 포인트/XP 조회 및 교환소 목업 UI
 */
(function () {
  "use strict";

  window.LumiApps = window.LumiApps || {};

  var DEFAULT_POINT_DATA = {
    totals: { site: 1250, xp: 340 },
    xpLevel: { current: 3, label: "루미별", xpForNext: 500, xpProgress: 340 },
    points: [
      { id: "site-live", pointType: "site", amount: 1250, reason: "루미벨 데뷔 라이브 참여", createdAt: "2025.06.21 20:15", status: "earned", balance: 1250 },
      { id: "site-attendance", pointType: "site", amount: 300, reason: "출석 체크 7일 달성", createdAt: "2025.06.21 09:02", status: "earned", balance: 1550 },
      { id: "site-exchange", pointType: "site", amount: -300, reason: "포토카드 교환", createdAt: "2025.06.20 18:43", status: "used", balance: 1250 },
      { id: "site-mission", pointType: "site", amount: 100, reason: "오늘의 미션 클리어", createdAt: "2025.06.20 12:30", status: "earned", balance: 1550 },
      { id: "site-expired", pointType: "site", amount: -150, reason: "포인트 유효기간 만료", createdAt: "2025.06.19 00:00", status: "expired", balance: 1450 },
      { id: "xp-attendance", pointType: "xp", amount: 30, reason: "루미폰 출석 체크", createdAt: "2025.06.21 09:02", status: "earned", balance: 340 }
    ]
  };

  var EXCHANGE_ITEMS = [
    { id: "reaction-water", title: "물 한 모금", category: "reaction", price: 30, state: "pending" },
    { id: "reaction-stretch", title: "스트레칭 타임", category: "reaction", price: 30, state: "pending" },
    { id: "reaction-call", title: "닉네임 콜", category: "reaction", price: 50, state: "pending" },
    { id: "reaction-cheer", title: "응원 한마디", category: "reaction", price: 80, state: "pending" },
    { id: "reaction-cute", title: "애교 대사", category: "reaction", price: 150, state: "pending" },
    { id: "reaction-scold", title: "매도 대사", category: "reaction", price: 300, state: "pending" },
    { id: "digital-voice", title: "시크릿 보이스", category: "digital", price: 300, state: "pending" },
    { id: "digital-random", title: "랜덤 대사 해금", category: "digital", price: 300, state: "pending" },
    { id: "song-aegyo", title: "애교송", category: "song", price: 500, state: "pending" },
    { id: "song-request", title: "노래 신청권", category: "song", price: 500, state: "pending" },
    { id: "season-wallpaper", title: "시즌 배경 세트", category: "season", price: 400, state: "pending" },
    { id: "season-photocard", title: "시즌 포토카드", category: "season", price: 600, state: "pending" }
  ];

  window.LumiApps.point = function () {
    return (
      '<section class="point-app" data-point-app>' +
        '<header class="point-heading">' +
          '<span class="point-heading-kicker">LUMIBELLE</span>' +
          '<h2>반짝 포인트</h2>' +
        '</header>' +
        '<nav class="point-tabs" role="tablist" aria-label="반짝 포인트 메뉴">' +
          '<button type="button" class="point-tab is-active" data-point-tab="book" role="tab" aria-selected="true">통장</button>' +
          '<button type="button" class="point-tab" data-point-tab="ledger" role="tab" aria-selected="false">내역</button>' +
          '<button type="button" class="point-tab" data-point-tab="exchange" role="tab" aria-selected="false">교환소</button>' +
          '<button type="button" class="point-tab" data-point-tab="guide" role="tab" aria-selected="false">안내</button>' +
        '</nav>' +
        '<div class="point-body" data-point-body></div>' +
      '</section>'
    );
  };

  window.LumiApps.bindPoint = function (root) {
    var app = root.querySelector("[data-point-app]");
    if (!app || app.__lumiPointBound) return;

    app.__lumiPointBound = true;
    app.__lumiPointTab = "book";
    app.__lumiPointFilter = "all";
    app.__lumiExchangeFilter = "all";
    app.__lumiPointData = normalizePointPayload(window.LUMI_POINT_DATA || DEFAULT_POINT_DATA);

    renderPoint(app);

    app.addEventListener("click", function (event) {
      var tab = event.target.closest("[data-point-tab]");
      if (tab) {
        app.__lumiPointTab = tab.getAttribute("data-point-tab") || "book";
        app.querySelectorAll("[data-point-tab]").forEach(function (button) {
          var active = button === tab;
          button.classList.toggle("is-active", active);
          button.setAttribute("aria-selected", active ? "true" : "false");
        });
        renderPoint(app);
        return;
      }

      var ledgerFilter = event.target.closest("[data-point-filter]");
      if (ledgerFilter) {
        app.__lumiPointFilter = ledgerFilter.getAttribute("data-point-filter") || "all";
        renderPoint(app);
        return;
      }

      var exchangeFilter = event.target.closest("[data-exchange-filter]");
      if (exchangeFilter) {
        app.__lumiExchangeFilter = exchangeFilter.getAttribute("data-exchange-filter") || "all";
        renderPoint(app);
        return;
      }

      var exchangeButton = event.target.closest("[data-point-exchange-item]");
      if (exchangeButton) {
        var status = exchangeButton.getAttribute("data-point-exchange-state");
        if (status === "available") exchangeButton.textContent = "교환 준비 중";
      }
    });
  };

  function renderPoint(app) {
    var body = app.querySelector("[data-point-body]");
    if (!body) return;
    var data = app.__lumiPointData;
    var tab = app.__lumiPointTab || "book";

    if (tab === "ledger") body.innerHTML = renderLedger(data, app.__lumiPointFilter || "all");
    else if (tab === "exchange") body.innerHTML = renderExchange(data, app.__lumiExchangeFilter || "all");
    else if (tab === "guide") body.innerHTML = renderGuide();
    else body.innerHTML = renderBook(data);
  }

  function renderBook(data) {
    var totals = calculateSummary(data.points);
    var recent = data.points.filter(function (item) { return item.pointType === "site"; }).slice(0, 3);
    var recommendations = EXCHANGE_ITEMS.slice(0, 2);

    return (
      '<section class="point-book point-screen">' +
        '<article class="point-balance-panel">' +
          '<div class="point-art-slot point-art-slot--hero" aria-hidden="true"></div>' +
          '<div class="point-balance-copy">' +
            '<span>보유 포인트</span>' +
            '<strong>' + number(data.totals.site) + '<em>P</em></strong>' +
            '<p>오늘 <b>+' + number(getTodayEarned(data.points)) + 'P</b> 적립</p>' +
          '</div>' +
          '<div class="point-month-earned"><span>이번 달 적립</span><strong>' + number(totals.monthEarned) + 'P</strong></div>' +
        '</article>' +
        '<section class="point-bank-panel">' +
          '<h3>포인트 통장</h3>' +
          '<div class="point-bank-grid">' +
            renderMetric("누적 적립", number(totals.earned) + "P") +
            renderMetric("누적 사용", number(totals.used) + "P") +
            renderMetric("교환 가능", data.totals.site > 0 ? "YES" : "NO") +
          '</div>' +
        '</section>' +
        '<section class="point-recent-panel">' +
          '<div class="point-section-title"><h3>최근 내역</h3><button type="button" data-point-tab="ledger">전체 내역 보기</button></div>' +
          '<div class="point-recent-list">' + recent.map(renderRecentRow).join("") + '</div>' +
        '</section>' +
        '<section class="point-recommend-panel">' +
          '<div class="point-section-title"><h3>교환소 추천</h3><button type="button" data-point-tab="exchange">교환소 가기</button></div>' +
          '<div class="point-recommend-grid">' + recommendations.map(renderRecommendCard).join("") + '</div>' +
        '</section>' +
        '<p class="point-note">포인트는 공연 참여와 앱 활동으로 적립돼요.</p>' +
      '</section>'
    );
  }

  function renderMetric(label, value) {
    return '<article class="point-metric"><span>' + escHtml(label) + '</span><strong>' + escHtml(value) + '</strong></article>';
  }

  function renderRecentRow(item) {
    return (
      '<article class="point-recent-row">' +
        '<div class="point-row-slot" aria-hidden="true"></div>' +
        '<div><strong>' + escHtml(item.reason) + '</strong><span>' + dateOnly(item.createdAt) + '</span></div>' +
        '<em class="' + (item.amount < 0 ? "is-minus" : "") + '">' + formatAmount(item.amount, "site") + '</em>' +
      '</article>'
    );
  }

  function renderRecommendCard(item) {
    return (
      '<article class="point-recommend-card">' +
        '<div class="point-item-slot" aria-hidden="true"></div>' +
        '<div><strong>' + escHtml(item.title) + '</strong><span>' + number(item.price) + 'P</span></div>' +
      '</article>'
    );
  }

  function renderLedger(data, filter) {
    var map = { all: "전체", earned: "적립", used: "사용", expired: "만료" };
    var points = data.points.filter(function (item) {
      if (item.pointType !== "site") return false;
      return filter === "all" || item.status === filter;
    });
    var months = groupByMonth(points);

    return (
      '<section class="point-ledger point-screen">' +
        '<nav class="point-subtabs" aria-label="내역 필터">' + Object.keys(map).map(function (key) {
          return '<button type="button" class="point-subtab' + (filter === key ? ' is-active' : '') + '" data-point-filter="' + key + '">' + map[key] + '</button>';
        }).join("") + '</nav>' +
        '<div class="point-ledger-list">' +
          (months.length ? months.map(function (group) {
            return '<section class="point-month-group"><h3>' + escHtml(group.label) + '</h3><div>' + group.items.map(renderLedgerItem).join("") + '</div></section>';
          }).join("") : '<div class="point-empty">해당 내역이 없어요.</div>') +
        '</div>' +
        '<p class="point-note">최근 6개월간의 내역만 확인할 수 있어요.</p>' +
      '</section>'
    );
  }

  function renderLedgerItem(item) {
    var state = item.status === "earned" ? "적립" : item.status === "used" ? "사용" : "만료";
    return (
      '<article class="point-ledger-item">' +
        '<div class="point-row-slot" aria-hidden="true"></div>' +
        '<div class="point-ledger-copy">' +
          '<div class="point-ledger-titleline"><strong>' + escHtml(item.reason) + '</strong><i class="point-ledger-status is-' + escHtml(item.status) + '">' + state + '</i></div>' +
          '<span>' + escHtml(item.createdAt) + '</span>' +
        '</div>' +
        '<div class="point-ledger-amount"><em class="' + (item.amount < 0 ? 'is-minus' : '') + '">' + formatAmount(item.amount, "site") + '</em><span>잔액 ' + number(item.balance) + 'P</span></div>' +
      '</article>'
    );
  }

  function renderExchange(data, filter) {
    var labels = { all: "전체", reaction: "방송", digital: "디지털", song: "노래", season: "시즌" };
    var items = EXCHANGE_ITEMS.filter(function (item) { return filter === "all" || item.category === filter; });
    return (
      '<section class="point-exchange point-screen">' +
        '<article class="point-exchange-balance"><div class="point-art-slot" aria-hidden="true"></div><div><span>보유 포인트</span><strong>' + number(data.totals.site) + '<em>P</em></strong></div><p>교환 가능<br><b>' + number(data.totals.site) + 'P</b></p></article>' +
        '<nav class="point-subtabs point-subtabs--exchange" aria-label="교환소 필터">' + Object.keys(labels).map(function (key) {
          return '<button type="button" class="point-subtab' + (filter === key ? ' is-active' : '') + '" data-exchange-filter="' + key + '">' + labels[key] + '</button>';
        }).join("") + '</nav>' +
        '<div class="point-exchange-grid">' + items.map(function (item) { return renderExchangeCard(item, data.totals.site); }).join("") + '</div>' +
        '<section class="point-exchange-notice"><h3>추천 교환</h3><p>매주 새로운 아이템이 추가돼요.<br>한정 특전은 조기 마감될 수 있어요.</p></section>' +
        '<p class="point-note">교환 후 포인트는 복구되지 않아요. 신중하게 선택 후 교환해 주세요.</p>' +
      '</section>'
    );
  }

  function renderExchangeCard(item, balance) {
    var available = item.state === "available" && balance >= item.price;
    var label = item.state === "pending" ? "준비중" : item.state === "unavailable" ? "교환 가능" : available ? "교환하기" : "포인트 부족";
    return (
      '<article class="point-exchange-item">' +
        '<div class="point-item-slot point-item-slot--large" aria-hidden="true"></div>' +
        '<strong>' + escHtml(item.title) + '</strong>' +
        '<span>' + number(item.price) + 'P</span>' +
        '<button type="button" class="point-exchange-button' + (available ? '' : ' is-muted') + '" data-point-exchange-item="' + item.id + '" data-point-exchange-state="' + item.state + '">' + label + '</button>' +
      '</article>'
    );
  }

  function renderGuide() {
    return (
      '<section class="point-guide point-screen">' +
        '<article class="point-guide-intro"><div class="point-art-slot" aria-hidden="true"></div><div><h3>반짝 포인트란?</h3><p>루미폰·온라인 활동으로 쌓이는 교환용 포인트예요.<br>출석 체크, 미션, 이벤트 참여 등으로 적립돼요.<br>교환소에서 반짝 포인트 전용 항목으로 전환할 수 있어요.</p></div></article>' +
        '<section class="point-guide-panel point-guide-panel--xp"><h3>반짝 XP란?</h3><p>팬 성장·레벨·업적에 반영되는 경험치예요.<br>활동할수록 XP가 쌓이고 레벨이 올라가요.<br><b>반짝 XP는 교환에 사용되지 않아요.</b></p></section>' +
        '<section class="point-guide-panel"><h3>적립 방법</h3>' + renderGuideRow("출석 체크", "매일 출석하고 반짝 포인트를 받아요!", "+10P") + renderGuideRow("미션", "오늘의 미션을 완료하면 포인트가 적립돼요!", "+αP") + renderGuideRow("이벤트 참여", "이벤트에 참여하면 보너스 포인트를 받을 수 있어요!", "+αP") + '</section>' +
        '<section class="point-guide-panel"><h3>사용 방법</h3>' + renderGuideRow("반짝 포인트 전용 항목 교환", "방송 리액션, 디지털 보상, 노래 보상, 시즌 보상 등으로 교환해요.", "") + '</section>' +
        '<section class="point-guide-panel"><h3>다른 포인트와 구분해요</h3><ul><li>물판 포인트는 특전회 기준 포인트로 물판 통장에서 따로 확인해요.</li><li>스탬프는 루미 체크인 기록으로 별도 관리돼요.</li><li>반짝 포인트·반짝 XP·물판 포인트·스탬프는 절대 합산되지 않아요.</li></ul></section>' +
        '<section class="point-guide-panel"><h3>유의사항</h3><ul><li>포인트는 교환 후 복구되지 않아요.</li><li>일부 포인트는 유효기간이 있어요.</li><li>교환 가능 여부와 운영 방식은 항목마다 달라질 수 있어요.</li></ul></section>' +
        '<section class="point-guide-panel point-guide-contact"><h3>문의</h3><p>반짝 포인트에 대해 더 궁금한 점이 있으신가요?</p><button type="button">자주 묻는 질문 보기</button></section>' +
      '</section>'
    );
  }

  function renderGuideRow(title, description, value) {
    return '<article class="point-guide-row"><div class="point-row-slot" aria-hidden="true"></div><div><strong>' + escHtml(title) + '</strong><span>' + escHtml(description) + '</span></div><em>' + escHtml(value) + '</em></article>';
  }

  function calculateSummary(points) {
    var site = points.filter(function (item) { return item.pointType === "site"; });
    var earned = site.filter(function (item) { return item.amount > 0; }).reduce(function (sum, item) { return sum + item.amount; }, 0);
    var used = site.filter(function (item) { return item.status === "used"; }).reduce(function (sum, item) { return sum + Math.abs(item.amount); }, 0);
    var monthEarned = site.filter(function (item) { return item.amount > 0 && String(item.createdAt).indexOf("2025.06") === 0; }).reduce(function (sum, item) { return sum + item.amount; }, 0);
    return { earned: earned, used: used, monthEarned: monthEarned };
  }

  function getTodayEarned(points) {
    return points.filter(function (item) { return item.pointType === "site" && item.amount > 0 && String(item.createdAt).indexOf("2025.06.21") === 0; }).reduce(function (sum, item) { return sum + item.amount; }, 0);
  }

  function groupByMonth(points) {
    var out = [];
    points.forEach(function (item) {
      var key = String(item.createdAt || "").slice(0, 7).replace(".", ".");
      var existing = out.find(function (group) { return group.key === key; });
      if (!existing) {
        existing = { key: key, label: key || "기록", items: [] };
        out.push(existing);
      }
      existing.items.push(item);
    });
    return out;
  }

  function normalizePointPayload(payload) {
    var data = payload || {};
    var totals = data.totals || {};
    return {
      totals: { site: Number(totals.site || 0), xp: Number(totals.xp || 0) },
      xpLevel: data.xpLevel || DEFAULT_POINT_DATA.xpLevel,
      points: Array.isArray(data.points) ? data.points.map(function (item, index) {
        return {
          id: item.id || "point-" + index,
          pointType: item.pointType || "site",
          amount: Number(item.amount || 0),
          reason: item.reason || "",
          createdAt: item.createdAt || "",
          status: item.status || (Number(item.amount || 0) < 0 ? "used" : "earned"),
          balance: Number(item.balance || 0)
        };
      }) : []
    };
  }

  function number(value) { return Number(value || 0).toLocaleString("ko-KR"); }
  function dateOnly(value) { return String(value || "").slice(5, 10).replace(".", "."); }
  function formatAmount(amount, type) { var unit = type === "xp" ? "XP" : "P"; return (Number(amount) > 0 ? "+" : "") + number(amount) + unit; }
  function escHtml(value) { return String(value).replace(/[&<>\"]/g, function (c) { return { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c]; }); }
}());
