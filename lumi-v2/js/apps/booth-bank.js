/**
 * booth-bank.js — 물판 통장 앱 1차 베타
 * 역할: 물판 포인트 조회 / 적립·사용 내역 / 보상판 / 안내
 * 팬 화면에서는 조회만 가능하며, 적립·차감·교환 처리는 스탭 확인 후 반영한다.
 */
(function () {
  "use strict";

  window.LumiApps = window.LumiApps || {};

  var DEFAULT_POINT_DATA = {
    totals: {
      merch: 3
    },
    points: [
      {
        id: "merch-20260712-ticket",
        pointType: "merch",
        amount: 1,
        reason: "특전권 15장 구매",
        eventName: "Debut Live",
        createdAt: "2026.07.12 18:20",
        status: "confirmed",
        sourceType: "ticketPurchase"
      },
      {
        id: "merch-20260712-meate",
        pointType: "merch",
        amount: 1,
        reason: "Lumibelle 메아테 지정",
        eventName: "Debut Live",
        createdAt: "2026.07.12 18:22",
        status: "confirmed",
        sourceType: "meate"
      },
      {
        id: "merch-20260726-hosted",
        pointType: "merch",
        amount: 2,
        reason: "주최 라이브 Lumibelle 메아테 지정",
        eventName: "LUMIBELLE 주최 라이브",
        createdAt: "2026.07.26 18:10",
        status: "confirmed",
        sourceType: "hostedLive"
      },
      {
        id: "merch-20260802-hosted",
        pointType: "merch",
        amount: 2,
        reason: "주최 라이브 Lumibelle 메아테 지정",
        eventName: "LUMIBELLE 주최 라이브 2회차",
        createdAt: "2026.08.02 18:10",
        status: "confirmed",
        sourceType: "hostedLive"
      },
      {
        id: "merch-20260803-reward",
        pointType: "merch",
        amount: -3,
        reason: "이벤트 특전권 1장 사용",
        eventName: "현장 물판",
        createdAt: "2026.08.03 20:15",
        status: "used",
        sourceType: "reward"
      }
    ]
  };

  var REWARDS = [
    { point: 1, title: "사메권", desc: "교류 30초" },
    { point: 3, title: "이벤트 특전권 1장", desc: "현장 확인 후 지급" },
    { point: 5, title: "카코미 체키", desc: "데코 O · 교류 X" },
    { point: 7, title: "물품 사인권", desc: "운영 확인 후 진행" },
    { point: 10, title: "30초 영상 + 녹음권", desc: "현장 확인 후 지급" },
    { point: 15, title: "물판 패스권", desc: "운영 확인 후 사용" },
    { point: 20, title: "멤버 지정 숙제 체키 1개", desc: "멤버 지정 가능" },
    { point: 25, title: "루미벨 굿즈", desc: "한정 굿즈 포함 1개 선택 가능" },
    { point: 30, title: "라이브 무료 입장", desc: "대상 공연은 운영 확인" },
    { point: 35, title: "세트리스트 지정권", desc: "2곡 지정 가능" },
    { point: 40, title: "오프회 무료 참가권", desc: "운영 일정에 따라 사용" },
    { point: 100, title: "프라이빗 콘서트 & 1:1 비전 만찬", desc: "미니공연 + 식사 + 한정 인증서 + 체키&사메 서비스" }
  ];

  window.LumiApps.boothBank = function () {
    return (
      '<section class="booth-bank-app" data-booth-bank-app>' +
        '<div class="booth-bank-hero">' +
          '<span class="booth-bank-kicker">LUMIBELLE POINT BANK</span>' +
          '<h2>물판 포인트 통장</h2>' +
          '<p>특전회 기준으로 쌓인 포인트를 확인하는 공간이에요.</p>' +
        '</div>' +
        '<div class="booth-bank-tabs" role="tablist">' +
          '<button type="button" class="booth-bank-tab is-active" data-booth-tab="book">통장</button>' +
          '<button type="button" class="booth-bank-tab" data-booth-tab="ledger">내역</button>' +
          '<button type="button" class="booth-bank-tab" data-booth-tab="rewards">보상판</button>' +
          '<button type="button" class="booth-bank-tab" data-booth-tab="guide">안내</button>' +
        '</div>' +
        '<div class="booth-bank-body" data-booth-bank-body></div>' +
      '</section>'
    );
  };

  window.LumiApps.bindBoothBank = function (root) {
    var app = root.querySelector("[data-booth-bank-app]");
    if (!app || app.__lumiBoothBankBound) return;
    app.__lumiBoothBankBound = true;
    app.__lumiBoothTab    = "book";
    app.__lumiBoothFilter = "merch";
    app.__lumiBoothPeriod = "3m";
    app.__lumiBoothSort   = "newest";
    app.__lumiBoothPage   = 1;
    app.__lumiBoothData   = normalizePointPayload(window.LUMI_POINT_DATA || DEFAULT_POINT_DATA);

    renderBoothBank(app);

    app.addEventListener("click", function (e) {
      var goto = e.target.closest("[data-booth-goto]");
      if (goto) {
        var target = goto.getAttribute("data-booth-goto");
        app.__lumiBoothTab = target;
        app.querySelectorAll("[data-booth-tab]").forEach(function (button) {
          button.classList.toggle("is-active", button.getAttribute("data-booth-tab") === target);
        });
        renderBoothBank(app);
        return;
      }
      var tab = e.target.closest("[data-booth-tab]");
      if (tab) {
        app.__lumiBoothTab  = tab.getAttribute("data-booth-tab") || "book";
        app.__lumiBoothPage = 1;
        app.querySelectorAll("[data-booth-tab]").forEach(function (button) {
          button.classList.toggle("is-active", button === tab);
        });
        renderBoothBank(app);
        return;
      }

      var moreBtn = e.target.closest("[data-booth-more]");
      if (moreBtn) {
        app.__lumiBoothPage = (app.__lumiBoothPage || 1) + 1;
        var body = app.querySelector("[data-booth-bank-body]");
        if (body) body.innerHTML = renderLedger(app.__lumiBoothData, app.__lumiBoothPeriod, app.__lumiBoothSort, app.__lumiBoothPage);
        return;
      }

      var periodBtn = e.target.closest("[data-booth-period]");
      if (periodBtn) {
        app.__lumiBoothPeriod = periodBtn.getAttribute("data-booth-period");
        app.__lumiBoothPage   = 1;
        var body = app.querySelector("[data-booth-bank-body]");
        if (body) body.innerHTML = renderLedger(app.__lumiBoothData, app.__lumiBoothPeriod, app.__lumiBoothSort, app.__lumiBoothPage);
        return;
      }

      var sortBtn = e.target.closest("[data-booth-sort]");
      if (sortBtn) {
        app.__lumiBoothSort = sortBtn.getAttribute("data-booth-sort");
        app.__lumiBoothPage = 1;
        var body = app.querySelector("[data-booth-bank-body]");
        if (body) body.innerHTML = renderLedger(app.__lumiBoothData, app.__lumiBoothPeriod, app.__lumiBoothSort, app.__lumiBoothPage);
        return;
      }
    });
  };

  function renderBoothBank(app) {
    var body = app.querySelector("[data-booth-bank-body]");
    if (!body) return;

    var tab = app.__lumiBoothTab || "book";
    var data = app.__lumiBoothData || normalizePointPayload(DEFAULT_POINT_DATA);

    if (tab === "ledger") {
      body.innerHTML = renderLedger(data, app.__lumiBoothPeriod || "3m", app.__lumiBoothSort || "newest", app.__lumiBoothPage || 1);
      return;
    }
    if (tab === "rewards") {
      body.innerHTML = renderRewards(data);
      return;
    }
    if (tab === "guide") {
      body.innerHTML = renderGuide();
      return;
    }
    body.innerHTML = renderBook(data);
  }

  function renderBook(data) {
    var merch = Number(data.totals.merch || 0);
    var monthSummary = getMonthSummary(data.points, "merch");
    var next = getNextReward(merch);
    var latestTwo = getLatestMerch(data.points, 2);

    return (
      '<section class="booth-bank-book">' +
        '<article class="booth-bank-balance-card">' +
          '<span class="booth-bank-card-label">현재 보유 물판 포인트</span>' +
          '<strong>' + escHtml(merch) + '<em>P</em></strong>' +
          '<p>' + (next ? '다음 보상까지 ' + escHtml(next.left) + 'P 남았어요.' : '가장 높은 보상 기준에 도달했어요.') + '</p>' +
        '</article>' +
        '<div class="booth-bank-mini-grid is-merch-only">' +
          '<article><span>이번 달 적립</span><strong>+' + escHtml(monthSummary.earn) + 'P</strong></article>' +
          '<article><span>이번 달 사용</span><strong>' + escHtml(monthSummary.use) + 'P</strong></article>' +
          '<article><span>다음 보상</span><strong>' + (next ? escHtml(next.reward.point) + 'P' : 'MAX') + '</strong></article>' +
          '<article><span>최근 내역</span><strong>' + escHtml(latestTwo.length) + '건</strong></article>' +
        '</div>' +
        '<div class="booth-bank-preview-grid">' +
          (latestTwo.length ? latestTwo.map(function (item) {
            return (
              '<article>' +
                '<span>최근 내역</span>' +
                '<strong>' + formatAmount(item.amount, item.pointType) + ' ' + escHtml(item.reason) + '</strong>' +
                '<em>' + escHtml(item.createdAt || '') + '</em>' +
              '</article>'
            );
          }).join('') : '<article><span>최근 내역</span><strong>아직 내역이 없어요.</strong></article>') +
          '<article>' +
            '<span>다음 보상</span>' +
            (next ? '<strong>' + escHtml(next.reward.point) + 'P · ' + escHtml(next.reward.title) + '</strong><em>' + escHtml(next.reward.desc) + '</em>' : '<strong>운영 확인 대상</strong><em>현장 스탭에게 확인해 주세요.</em>') +
          '</article>' +
        '</div>' +
        '<button type="button" class="booth-bank-link-btn" data-booth-goto="rewards">보상판 보기</button>' +
      '</section>'
    );
  }

  function renderLedger(data, period, sort, page) {
    var PER_PAGE = 5;
    var p    = period || "3m";
    var s    = sort   || "newest";
    var pg   = page   || 1;

    var now      = new Date();
    var cutoff   = new Date(now);
    if      (p === "1m")  cutoff.setMonth(cutoff.getMonth() - 1);
    else if (p === "3m")  cutoff.setMonth(cutoff.getMonth() - 3);
    else if (p === "6m")  cutoff.setMonth(cutoff.getMonth() - 6);
    else if (p === "1y")  cutoff.setFullYear(cutoff.getFullYear() - 1);
    else                  cutoff = new Date(0);

    var all = data.points.filter(function (item) {
      if (item.pointType !== "merch") return false;
      if (p === "all") return true;
      var m = String(item.createdAt || "").match(/(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})/);
      if (!m) return false;
      return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) >= cutoff;
    }).sort(function (a, b) {
      var cmp = String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
      return s === "oldest" ? -cmp : cmp;
    });

    var shown   = all.slice(0, PER_PAGE * pg);
    var hasMore = all.length > shown.length;
    var rangeLabel = p === "all" ? "전체 기간"
      : (function () {
          var from = new Date(cutoff);
          function fmt(d) { return d.getFullYear() + "." + pad(d.getMonth()+1) + "." + pad(d.getDate()); }
          function pad(n) { return n < 10 ? "0"+n : String(n); }
          return fmt(from) + " ~ " + fmt(now);
        })();

    var periodLabel = { "1m":"1개월", "3m":"3개월", "6m":"6개월", "1y":"1년", "all":"전체" }[p] || "3개월";
    var sortLabel   = s === "oldest" ? "오래된순" : "최신순";

    var PERIOD_OPTS = [
      { v:"1m", t:"1개월" }, { v:"3m", t:"3개월" },
      { v:"6m", t:"6개월" }, { v:"1y", t:"1년" }, { v:"all", t:"전체" }
    ];
    var SORT_OPTS = [
      { v:"newest", t:"최신순" }, { v:"oldest", t:"오래된순" }
    ];

    var periodMenu = PERIOD_OPTS.map(function(o) {
      return '<button type="button" class="bb-ledger-opt' + (p === o.v ? " is-active" : "") + '" data-booth-period="' + o.v + '">' + o.t + '</button>';
    }).join('');
    var sortMenu = SORT_OPTS.map(function(o) {
      return '<button type="button" class="bb-ledger-opt' + (s === o.v ? " is-active" : "") + '" data-booth-sort="' + o.v + '">' + o.t + '</button>';
    }).join('');

    return (
      '<section class="booth-bank-ledger">' +
        '<div class="bb-ledger-bar">' +
          '<span class="bb-ledger-search-icon">&#128269;</span>' +
          '<div class="bb-ledger-bar-right">' +
            '<div class="bb-ledger-dropdown">' +
              '<button type="button" class="bb-ledger-bar-btn" data-booth-period="' + p + '">' + periodLabel + '</button>' +
              '<div class="bb-ledger-menu">' + periodMenu + '</div>' +
            '</div>' +
            '<span class="bb-ledger-sep">·</span>' +
            '<div class="bb-ledger-dropdown">' +
              '<button type="button" class="bb-ledger-bar-btn" data-booth-sort="' + s + '">' + sortLabel + '</button>' +
              '<div class="bb-ledger-menu">' + sortMenu + '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="bb-ledger-range">' +
          '<span>' + escHtml(rangeLabel) + '</span>' +
          '<span class="bb-ledger-count">' + escHtml(String(all.length)) + '건</span>' +
        '</div>' +
        (shown.length ? shown.map(renderLedgerItem).join("") : '<div class="booth-bank-empty">해당 기간에 내역이 없어요.</div>') +
        (hasMore ? '<button type="button" class="bb-ledger-more-btn" data-booth-more="1">더보기 (' + (all.length - shown.length) + '건 남음)</button>' : '') +
      '</section>'
    );
  }

  function renderLedgerItem(item) {
    var amount = Number(item.amount || 0);
    var isMinus = amount < 0;
    return (
      '<article class="booth-bank-ledger-item' + (isMinus ? ' is-minus' : ' is-plus') + '">' +
        '<div class="booth-bank-ledger-main">' +
          '<span>' + escHtml(item.createdAt || '') + '</span>' +
          '<strong>' + escHtml(item.reason || '포인트 내역') + '</strong>' +
          '<p>' + escHtml(pointTypeLabel(item.pointType)) + ' · ' + escHtml(sourceLabel(item.sourceType)) + ' · ' + escHtml(statusLabel(item.status)) + '</p>' +
        '</div>' +
        '<em>' + escHtml(formatAmount(amount, item.pointType)) + '</em>' +
      '</article>'
    );
  }

  function renderRewards(data) {
    var merch = Number(data.totals.merch || 0);
    return (
      '<section class="booth-bank-rewards">' +
        '<div class="booth-bank-section-head">' +
          '<h3>물판 포인트 보상판</h3>' +
          '<p>리워드 달성 단위 및 내용은 상황에 따라 변경될 수 있어요.</p>' +
        '</div>' +
        REWARDS.map(function (reward) {
          var reached = merch >= reward.point;
          return (
            '<article class="booth-bank-reward-card' + (reached ? ' is-reached' : '') + '">' +
              '<div>' +
                '<span>' + escHtml(reward.point) + 'P</span>' +
                '<strong>' + escHtml(reward.title) + '</strong>' +
                '<p>' + escHtml(reward.desc) + '</p>' +
              '</div>' +
              '<em>' + (reached ? '확인 가능' : '부족') + '</em>' +
            '</article>'
          );
        }).join("") +
      '</section>'
    );
  }

  function renderGuide() {
    return (
      '<section class="booth-bank-guide">' +
        '<article>' +
          '<h3>적립 기준</h3>' +
          '<ul>' +
            '<li>특전권 15장 구매 시 1P 지급.</li>' +
            '<li>Lumibelle 메아테 지정 시 1P 지급.</li>' +
            '<li>주최 라이브 Lumibelle 메아테 지정 시 2P 지급.</li>' +
            '<li>포인트는 이벤트 당일 기준으로 지급.</li>' +
          '</ul>' +
        '</article>' +
        '<article>' +
          '<h3>사용 규정</h3>' +
          '<ul>' +
            '<li>포인트 사용 시 즉시 차감, 복구 불가.</li>' +
            '<li>특전권 및 이벤트 참여권 교환·환불·양도 불가.</li>' +
            '<li>특전권 및 포인트 카드 분실 시 재발급 불가.</li>' +
            '<li>포인트 보상과 규정은 운영 상황에 따라 변경 가능.</li>' +
          '</ul>' +
        '</article>' +
        '<article>' +
          '<h3>부정행위 및 제한</h3>' +
          '<ul>' +
            '<li>양도·복제·위조 확인 시 포인트 몰수 및 참여 제한.</li>' +
            '<li>개봉 식품 및 안전 우려 선물 수령 불가.</li>' +
            '<li>최종 기준은 루미벨 공식 계정 공지 확인.</li>' +
          '</ul>' +
        '</article>' +
        '<article class="booth-bank-guide-note">' +
          '<strong>포인트는 따로 모여요</strong>' +
          '<p>특전회와 메아테로 쌓이는 현장 포인트입니다.</p>' +
          '<p>반짝 포인트·XP·스탬프와는 각각 다른 기록으로 보관돼요.</p>' +
        '</article>' +
      '</section>'
    );
  }

  function normalizePointPayload(payload) {
    var data = payload || {};
    var totals = data.totals || {};
    return {
      totals: {
        merch: Number(totals.merch || 0)
      },
      points: Array.isArray(data.points) ? data.points.filter(function (item) {
        return (item.pointType || "merch") === "merch";
      }).map(function (item, index) {
        return {
          id: item.id || 'point-' + index,
          pointType: item.pointType || 'merch',
          amount: Number(item.amount || 0),
          reason: item.reason || '',
          eventName: item.eventName || '',
          createdAt: item.createdAt || '',
          status: item.status || '',
          sourceType: item.sourceType || ''
        };
      }) : []
    };
  }

  function getMonthSummary(points, type) {
    var today = new Date();
    var year = today.getFullYear();
    var month = today.getMonth() + 1;
    return points.reduce(function (acc, item) {
      if (item.pointType !== type) return acc;
      var text = String(item.createdAt || "");
      var match = text.match(/(\d{4})[.\-\/](\d{1,2})/);
      if (!match || Number(match[1]) !== year || Number(match[2]) !== month) return acc;
      var amount = Number(item.amount || 0);
      if (amount > 0) acc.earn += amount;
      if (amount < 0) acc.use += Math.abs(amount);
      return acc;
    }, { earn: 0, use: 0 });
  }

  function getNextReward(balance) {
    for (var i = 0; i < REWARDS.length; i += 1) {
      if (balance < REWARDS[i].point) {
        return { reward: REWARDS[i], left: REWARDS[i].point - balance };
      }
    }
    return null;
  }

  function getLatestMerch(points, count) {
    var n = count || 1;
    return points.filter(function (item) { return item.pointType === "merch"; }).sort(function (a, b) {
      return String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
    }).slice(0, n);
  }

  function pointTypeLabel(type) {
    if (type === "merch") return "물판 포인트";
    if (type === "site") return "반짝 포인트";
    if (type === "xp") return "반짝 XP";
    return "포인트";
  }

  function sourceLabel(type) {
    if (type === "ticketPurchase") return "특전권 구매";
    if (type === "meate") return "메아테";
    if (type === "hostedLive") return "주최 라이브";
    if (type === "reward") return "보상 사용";
    if (type === "online") return "온라인";
    return "스탭 확인";
  }

  function statusLabel(status) {
    if (status === "confirmed") return "스탭 확인 완료";
    if (status === "used") return "차감 완료";
    if (status === "pending") return "확인 중";
    return "기록됨";
  }

  function formatAmount(amount, type) {
    var unit = type === "xp" ? "XP" : "P";
    var value = Number(amount || 0);
    return (value > 0 ? "+" : "") + value + unit;
  }

  function escHtml(value) {
    return String(value).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
}());
