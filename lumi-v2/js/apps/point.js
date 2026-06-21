/**
 * point.js — 반짝 포인트 & 반짝 XP 앱
 * 역할: 루미폰/온라인 활동 포인트(site) 및 경험치(xp) 조회
 * 물판 포인트는 물판 통장(booth-bank)에서 별도 관리
 */
(function () {
  "use strict";

  window.LumiApps = window.LumiApps || {};

  /* ── 더미 데이터 ── */
  var DEFAULT_POINT_DATA = {
    totals: {
      site: 120,
      xp: 340
    },
    xpLevel: {
      current: 3,
      label: "루미별",
      xpForNext: 500,
      xpProgress: 340
    },
    points: [
      {
        id: "site-20260801-login",
        pointType: "site",
        amount: 10,
        reason: "루미폰 출석 체크",
        createdAt: "2026.08.01 10:00",
        status: "confirmed"
      },
      {
        id: "xp-20260801-login",
        pointType: "xp",
        amount: 30,
        reason: "루미폰 출석 체크",
        createdAt: "2026.08.01 10:00",
        status: "confirmed"
      },
      {
        id: "site-20260731-mission",
        pointType: "site",
        amount: 50,
        reason: "이벤트 미션 완료",
        createdAt: "2026.07.31 20:15",
        status: "confirmed"
      },
      {
        id: "xp-20260731-mission",
        pointType: "xp",
        amount: 100,
        reason: "이벤트 미션 완료",
        createdAt: "2026.07.31 20:15",
        status: "confirmed"
      },
      {
        id: "site-20260728-comment",
        pointType: "site",
        amount: 20,
        reason: "루미로그 댓글 참여",
        createdAt: "2026.07.28 15:42",
        status: "confirmed"
      },
      {
        id: "xp-20260728-comment",
        pointType: "xp",
        amount: 50,
        reason: "루미로그 댓글 참여",
        createdAt: "2026.07.28 15:42",
        status: "confirmed"
      },
      {
        id: "site-20260720-exchange",
        pointType: "site",
        amount: -40,
        reason: "포인트 교환",
        createdAt: "2026.07.20 12:00",
        status: "used"
      },
      {
        id: "xp-20260715-levelup",
        pointType: "xp",
        amount: 160,
        reason: "레벨 3 달성",
        createdAt: "2026.07.15 18:00",
        status: "confirmed"
      }
    ]
  };

  /* ── HTML 골격 ── */
  window.LumiApps.point = function () {
    return (
      '<section class="point-app" data-point-app>' +
        '<div class="point-hero">' +
          '<span class="point-kicker">LUMIBELLE POINT</span>' +
          '<h2>반짝 포인트</h2>' +
          '<p>루미폰·온라인 활동으로 쌓이는 포인트와 경험치예요.</p>' +
        '</div>' +
        '<div class="point-tabs" role="tablist">' +
          '<button type="button" class="point-tab is-active" data-point-tab="book">통장</button>' +
          '<button type="button" class="point-tab" data-point-tab="ledger">내역</button>' +
          '<button type="button" class="point-tab" data-point-tab="exchange">교환소</button>' +
          '<button type="button" class="point-tab" data-point-tab="guide">안내</button>' +
        '</div>' +
        '<div class="point-body" data-point-body></div>' +
      '</section>'
    );
  };

  /* ── 바인딩 ── */
  window.LumiApps.bindPoint = function (root) {
    var app = root.querySelector("[data-point-app]");
    if (!app || app.__lumiPointBound) return;
    app.__lumiPointBound  = true;
    app.__lumiPointTab    = "book";
    app.__lumiPointFilter = "all";
    app.__lumiPointPeriod = "3m";
    app.__lumiPointSort   = "newest";
    app.__lumiPointPage   = 1;
    app.__lumiPointData   = normalizePointPayload(window.LUMI_POINT_DATA || DEFAULT_POINT_DATA);

    renderPoint(app);

    app.addEventListener("click", function (e) {
      var tab = e.target.closest("[data-point-tab]");
      if (tab) {
        app.__lumiPointTab  = tab.getAttribute("data-point-tab") || "book";
        app.__lumiPointPage = 1;
        app.querySelectorAll("[data-point-tab]").forEach(function (btn) {
          btn.classList.toggle("is-active", btn === tab);
        });
        renderPoint(app);
        return;
      }

      var moreBtn = e.target.closest("[data-point-more]");
      if (moreBtn) {
        app.__lumiPointPage = (app.__lumiPointPage || 1) + 1;
        var body = app.querySelector("[data-point-body]");
        if (body) body.innerHTML = renderLedger(app.__lumiPointData, app.__lumiPointFilter, app.__lumiPointPeriod, app.__lumiPointSort, app.__lumiPointPage);
        return;
      }

      var filterBtn = e.target.closest("[data-point-filter]");
      if (filterBtn) {
        app.__lumiPointFilter = filterBtn.getAttribute("data-point-filter") || "all";
        app.__lumiPointPage = 1;
        var body = app.querySelector("[data-point-body]");
        if (body) body.innerHTML = renderLedger(app.__lumiPointData, app.__lumiPointFilter, app.__lumiPointPeriod, app.__lumiPointSort, app.__lumiPointPage);
        return;
      }

      var periodBtn = e.target.closest("[data-point-period]");
      if (periodBtn) {
        app.__lumiPointPeriod = periodBtn.getAttribute("data-point-period");
        app.__lumiPointPage   = 1;
        var body = app.querySelector("[data-point-body]");
        if (body) body.innerHTML = renderLedger(app.__lumiPointData, app.__lumiPointFilter, app.__lumiPointPeriod, app.__lumiPointSort, app.__lumiPointPage);
        return;
      }

      var sortBtn = e.target.closest("[data-point-sort]");
      if (sortBtn) {
        app.__lumiPointSort = sortBtn.getAttribute("data-point-sort");
        app.__lumiPointPage = 1;
        var body = app.querySelector("[data-point-body]");
        if (body) body.innerHTML = renderLedger(app.__lumiPointData, app.__lumiPointFilter, app.__lumiPointPeriod, app.__lumiPointSort, app.__lumiPointPage);
        return;
      }
    });
  };

  /* ── 렌더 라우터 ── */
  function renderPoint(app) {
    var body = app.querySelector("[data-point-body]");
    if (!body) return;

    var tab  = app.__lumiPointTab  || "book";
    var data = app.__lumiPointData || normalizePointPayload(DEFAULT_POINT_DATA);

    if (tab === "ledger")   { body.innerHTML = renderLedger(data, app.__lumiPointFilter || "all", app.__lumiPointPeriod || "3m", app.__lumiPointSort || "newest", app.__lumiPointPage || 1); return; }
    if (tab === "exchange") { body.innerHTML = renderExchange(); return; }
    if (tab === "guide")    { body.innerHTML = renderGuide(); return; }
    body.innerHTML = renderBook(data);
  }

  /* ── 통장 탭 ── */
  function renderBook(data) {
    var site    = Number(data.totals.site || 0);
    var xp      = Number(data.totals.xp   || 0);
    var lvl     = data.xpLevel || {};
    var forNext = Number(lvl.xpForNext  || 1000);
    var prog    = Number(lvl.xpProgress || xp);
    var pct     = Math.min(100, Math.round(prog / forNext * 100));

    var latestTwo = getLatest(data.points, null, 2);

    return (
      '<section class="point-book">' +
        '<article class="point-balance-card">' +
          '<span class="point-card-label">현재 보유 반짝 포인트</span>' +
          '<strong>' + escHtml(site) + '<em>P</em></strong>' +
          '<p>반짝 XP ' + escHtml(xp) + 'XP 보유 중이에요.</p>' +
        '</article>' +
        '<div class="point-mini-grid">' +
          '<article><span>반짝 포인트</span><strong>' + escHtml(site) + 'P</strong></article>' +
          '<article><span>반짝 XP</span><strong>' + escHtml(xp) + 'XP</strong></article>' +
          '<article><span>현재 레벨</span><strong>Lv.' + escHtml(lvl.current || 1) + '</strong></article>' +
          '<article><span>최근 내역</span><strong>' + escHtml(latestTwo.length) + '건</strong></article>' +
        '</div>' +
        '<div class="point-xp-bar-wrap">' +
          '<span>반짝 XP · 다음 레벨까지</span>' +
          '<strong>' + escHtml(prog) + ' / ' + escHtml(forNext) + ' XP</strong>' +
          '<div class="point-xp-bar"><div class="point-xp-bar-fill" style="width:' + pct + '%"></div></div>' +
          '<div class="point-xp-bar-meta"><span>Lv.' + escHtml(lvl.current || 1) + ' ' + escHtml(lvl.label || '') + '</span><span>' + escHtml(pct) + '%</span></div>' +
        '</div>' +
        '<div class="point-preview-grid">' +
          (latestTwo.length ? latestTwo.map(function (item) {
            return (
              '<article>' +
                '<span>최근 내역</span>' +
                '<strong>' + formatAmount(item.amount, item.pointType) + ' ' + escHtml(item.reason) + '</strong>' +
                '<em>' + escHtml(item.createdAt || '') + '</em>' +
              '</article>'
            );
          }).join('') : '<article><span>최근 내역</span><strong>아직 내역이 없어요.</strong></article>') +
        '</div>' +
      '</section>'
    );
  }

  /* ── 내역 탭 ── */
  function renderLedger(data, filter, period, sort, page) {
    var PER_PAGE = 5;
    var f  = filter || "all";
    var p  = period || "3m";
    var s  = sort   || "newest";
    var pg = page   || 1;

    var now    = new Date();
    var cutoff = new Date(now);
    if      (p === "1m")  cutoff.setMonth(cutoff.getMonth() - 1);
    else if (p === "3m")  cutoff.setMonth(cutoff.getMonth() - 3);
    else if (p === "6m")  cutoff.setMonth(cutoff.getMonth() - 6);
    else if (p === "1y")  cutoff.setFullYear(cutoff.getFullYear() - 1);
    else                  cutoff = new Date(0);

    var all = data.points.filter(function (item) {
      if (f === "site" && item.pointType !== "site") return false;
      if (f === "xp"   && item.pointType !== "xp")  return false;
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

    function pad(n) { return n < 10 ? "0" + n : String(n); }
    function fmt(d) { return d.getFullYear() + "." + pad(d.getMonth()+1) + "." + pad(d.getDate()); }
    var rangeLabel = p === "all" ? "전체 기간" : fmt(cutoff) + " ~ " + fmt(now);

    var periodLabel = { "1m":"1개월", "3m":"3개월", "6m":"6개월", "1y":"1년", "all":"전체" }[p] || "3개월";
    var sortLabel   = s === "oldest" ? "오래된순" : "최신순";
    var filterLabel = f === "site" ? "반짝 포인트" : f === "xp" ? "반짝 XP" : "전체";

    var PERIOD_OPTS = [
      { v:"1m", t:"1개월" }, { v:"3m", t:"3개월" },
      { v:"6m", t:"6개월" }, { v:"1y", t:"1년" }, { v:"all", t:"전체" }
    ];
    var SORT_OPTS = [
      { v:"newest", t:"최신순" }, { v:"oldest", t:"오래된순" }
    ];
    var FILTER_OPTS = [
      { v:"all", t:"전체" }, { v:"site", t:"반짝 포인트" }, { v:"xp", t:"반짝 XP" }
    ];

    var periodMenu = PERIOD_OPTS.map(function(o) {
      return '<button type="button" class="pt-ledger-opt' + (p === o.v ? " is-active" : "") + '" data-point-period="' + o.v + '">' + o.t + '</button>';
    }).join('');
    var filterMenu = FILTER_OPTS.map(function(o) {
      return '<button type="button" class="pt-ledger-opt' + (f === o.v ? " is-active" : "") + '" data-point-filter="' + o.v + '">' + o.t + '</button>';
    }).join('');
    var sortMenu = SORT_OPTS.map(function(o) {
      return '<button type="button" class="pt-ledger-opt' + (s === o.v ? " is-active" : "") + '" data-point-sort="' + o.v + '">' + o.t + '</button>';
    }).join('');

    return (
      '<section class="point-ledger">' +
        '<div class="pt-ledger-bar">' +
          '<span class="pt-ledger-search-icon">&#128269;</span>' +
          '<div class="pt-ledger-bar-right">' +
            '<div class="pt-ledger-dropdown">' +
              '<button type="button" class="pt-ledger-bar-btn" data-point-period="' + p + '">' + escHtml(periodLabel) + '</button>' +
              '<div class="pt-ledger-menu">' + periodMenu + '</div>' +
            '</div>' +
            '<span class="pt-ledger-sep">·</span>' +
            '<div class="pt-ledger-dropdown">' +
              '<button type="button" class="pt-ledger-bar-btn" data-point-filter="' + f + '">' + escHtml(filterLabel) + '</button>' +
              '<div class="pt-ledger-menu">' + filterMenu + '</div>' +
            '</div>' +
            '<span class="pt-ledger-sep">·</span>' +
            '<div class="pt-ledger-dropdown">' +
              '<button type="button" class="pt-ledger-bar-btn" data-point-sort="' + s + '">' + escHtml(sortLabel) + '</button>' +
              '<div class="pt-ledger-menu">' + sortMenu + '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="pt-ledger-range">' +
          '<span>' + escHtml(rangeLabel) + '</span>' +
          '<span class="pt-ledger-count">' + escHtml(String(all.length)) + '건</span>' +
        '</div>' +
        (shown.length ? shown.map(renderLedgerItem).join("") : '<div class="point-empty">해당 기간에 내역이 없어요.</div>') +
        (hasMore ? '<button type="button" class="pt-ledger-more-btn" data-point-more="1">더보기 (' + (all.length - shown.length) + '건 남음)</button>' : '') +
      '</section>'
    );
  }

  function renderLedgerItem(item) {
    var amount  = Number(item.amount || 0);
    var isMinus = amount < 0;
    var isXp    = item.pointType === "xp";
    var cls     = "point-ledger-item" + (isXp ? " is-xp" : "") + (isMinus ? " is-minus" : "");
    return (
      '<article class="' + cls + '">' +
        '<div class="point-ledger-main">' +
          '<span>' + escHtml(item.createdAt || '') + '</span>' +
          '<strong>' + escHtml(item.reason || '내역') + '</strong>' +
          '<p>' + escHtml(pointTypeLabel(item.pointType)) + ' · ' + escHtml(statusLabel(item.status)) + '</p>' +
        '</div>' +
        '<em>' + escHtml(formatAmount(amount, item.pointType)) + '</em>' +
      '</article>'
    );
  }

  /* ── 교환소 탭 ── */
  function renderExchange() {
    return (
      '<section class="point-exchange">' +
        '<div class="point-section-head">' +
          '<h3>교환소</h3>' +
          '<p>반짝 포인트로 교환할 수 있는 항목이 생기면 이곳에 표시돼요.</p>' +
        '</div>' +
        '<div class="point-exchange-card">' +
          '<span class="point-exchange-badge">COMING SOON</span>' +
          '<strong>교환 가능 항목 준비 중</strong>' +
          '<p>현재 교환소는 오픈 준비 중이에요.<br>운영 공지를 확인해 주세요.</p>' +
        '</div>' +
        '<div class="point-exchange-card">' +
          '<strong>물판 포인트 보상은 별도예요</strong>' +
          '<p>물판 포인트 보상은 물판 통장에서 확인해 주세요.<br>반짝 포인트와 합산되지 않아요.</p>' +
        '</div>' +
      '</section>'
    );
  }

  /* ── 안내 탭 ── */
  function renderGuide() {
    return (
      '<section class="point-guide">' +
        '<article>' +
          '<h3>반짝 포인트란?</h3>' +
          '<ul>' +
            '<li>루미폰·온라인 활동으로 쌓이는 교환용 포인트예요.</li>' +
            '<li>출석 체크, 미션, 이벤트 참여 등으로 적립돼요.</li>' +
            '<li>교환소에서 아이템·혜택으로 전환할 수 있어요.</li>' +
          '</ul>' +
        '</article>' +
        '<article>' +
          '<h3>반짝 XP란?</h3>' +
          '<ul>' +
            '<li>팬 성장·레벨·업적에 반영되는 경험치예요.</li>' +
            '<li>활동할수록 XP가 쌓이고 레벨이 올라가요.</li>' +
            '<li>XP는 교환에 사용되지 않아요.</li>' +
          '</ul>' +
        '</article>' +
        '<article class="point-guide-note">' +
          '<h3>다른 포인트와 구분해요</h3>' +
          '<ul>' +
            '<li>물판 포인트는 특전회 기준 포인트로 물판 통장에서 따로 확인해요.</li>' +
            '<li>스탬프는 루미 체크인 기록으로 별도 관리돼요.</li>' +
            '<li>반짝 포인트·반짝 XP·물판 포인트·스탬프는 절대 합산되지 않아요.</li>' +
          '</ul>' +
        '</article>' +
      '</section>'
    );
  }

  /* ── 유틸 ── */
  function normalizePointPayload(payload) {
    var data   = payload || {};
    var totals = data.totals || {};
    return {
      totals: {
        site: Number(totals.site || 0),
        xp:   Number(totals.xp   || 0)
      },
      xpLevel: data.xpLevel || { current: 1, label: "루미씨앗", xpForNext: 500, xpProgress: 0 },
      points: Array.isArray(data.points) ? data.points.map(function (item, idx) {
        return {
          id:        item.id        || "point-" + idx,
          pointType: item.pointType || "site",
          amount:    Number(item.amount || 0),
          reason:    item.reason    || "",
          createdAt: item.createdAt || "",
          status:    item.status    || ""
        };
      }) : []
    };
  }

  function getLatest(points, type, count) {
    var n = count || 1;
    return points.filter(function (item) {
      return type ? item.pointType === type : true;
    }).sort(function (a, b) {
      return String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
    }).slice(0, n);
  }

  function pointTypeLabel(type) {
    if (type === "site") return "반짝 포인트";
    if (type === "xp")   return "반짝 XP";
    return "포인트";
  }

  function statusLabel(status) {
    if (status === "confirmed") return "적립 완료";
    if (status === "used")      return "차감 완료";
    if (status === "pending")   return "확인 중";
    return "기록됨";
  }

  function formatAmount(amount, type) {
    var unit  = type === "xp" ? "XP" : "P";
    var value = Number(amount || 0);
    return (value > 0 ? "+" : "") + value + unit;
  }

  function escHtml(value) {
    return String(value).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
}());
