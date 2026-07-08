(function () {
  "use strict";

  var DEFAULT_TIMELINE_DATA = {
    joinedAt: "2026.05.07",
    firstVisitAt: "2026.05.07",
    summary: { live: 2, checkin: 1, stamp: 3 },
    items: [
      { id: "timeline-live-20260507", category: "live", title: "첫 루미 방문", subtitle: "루미벨을 처음 만난 날이 기록돼요.", date: "2026.05.07" },
      { id: "timeline-checkin-20260520", category: "checkin", title: "라이브 체크인", subtitle: "현장 체크인과 스탬프 기록이 함께 남아요.", date: "2026.05.20" },
      { id: "timeline-online-20260601", category: "online", title: "ON AIR 참여", subtitle: "온라인에서 루미벨과 만났어요.", date: "2026.06.01" },
      { id: "timeline-ticket-20260610", category: "ticket", title: "티켓 예매 완료", subtitle: "데뷔 라이브 티켓을 예매했어요.", date: "2026.06.10" },
      { id: "timeline-live-20260621", category: "live", title: "루미벨 데뷔 라이브", subtitle: "반짝이는 첫 공연의 추억을 남겼어요.", date: "2026.06.21" }
    ]
  };

  var FILTERS = [
    { id: "all", label: "전체" },
    { id: "live", label: "라이브" },
    { id: "checkin", label: "체크인" },
    { id: "online", label: "온라인" },
    { id: "ticket", label: "티켓" }
  ];

  window.LumiApps = window.LumiApps || {};

  window.LumiApps.timeline = function () {
    return '<section class="timeline-app" data-timeline-app><div class="timeline-body" data-timeline-body></div></section>';
  };

  window.LumiApps.bindTimeline = function (root) {
    var app = root.querySelector("[data-timeline-app]");
    if (!app || app.__lumiTimelineBound) return;
    app.__lumiTimelineBound = true;
    app.__lumiTimelineData = normalizeTimelinePayload(window.LUMI_TIMELINE_DATA || DEFAULT_TIMELINE_DATA);
    app.__lumiTimelineFilter = "all";
    app.__lumiTimelineMonth = getInitialMonth(app.__lumiTimelineData.items);

    app.addEventListener("click", function (event) {
      var filter = event.target.closest("[data-timeline-filter]");
      if (filter) {
        app.__lumiTimelineFilter = filter.getAttribute("data-timeline-filter") || "all";
        renderTimeline(app);
        return;
      }

      var monthButton = event.target.closest("[data-timeline-month]");
      if (monthButton) {
        var direction = monthButton.getAttribute("data-timeline-month") === "prev" ? -1 : 1;
        app.__lumiTimelineMonth = moveMonth(app.__lumiTimelineMonth, direction);
        renderTimeline(app);
      }
    });

    renderTimeline(app);
  };

  function renderTimeline(app) {
    var body = app.querySelector("[data-timeline-body]");
    if (!body) return;

    var data = app.__lumiTimelineData;
    var selectedFilter = app.__lumiTimelineFilter || "all";
    var selectedMonth = app.__lumiTimelineMonth || getInitialMonth(data.items);
    var records = sortItems(filterItems(data.items, selectedFilter, selectedMonth));

    body.innerHTML =
      '<section class="timeline-hero">' +
        '<h2>추억의 시간</h2>' +
        '<p>루미벨과 함께한 소중한 추억을 기록해요.</p>' +
      '</section>' +
      '<section class="timeline-summary">' +
        '<article><span>루미벨과 만난지</span><strong>DAY ' + escHtml(getDayCount(data.joinedAt)) + '</strong></article>' +
        '<article><span>첫 루미 방문일</span><strong>' + escHtml(data.firstVisitAt || '-') + '</strong></article>' +
        '<article class="timeline-summary-stamps"><div>' +
          renderSummaryStamp("live", "라이브", data.summary.live, "회") +
          renderSummaryStamp("checkin", "체크인", data.summary.checkin, "회") +
          renderSummaryStamp("stamp", "스탬프", data.summary.stamp, "개") +
        '</div></article>' +
      '</section>' +
      '<nav class="timeline-filters" aria-label="기록 분류">' +
        FILTERS.map(function (item) {
          return '<button type="button" class="' + (item.id === selectedFilter ? 'is-active' : '') + '" data-timeline-filter="' + item.id + '">' + item.label + '</button>';
        }).join("") +
      '</nav>' +
      '<div class="timeline-month-nav">' +
        '<button type="button" class="timeline-month-btn" data-timeline-month="prev" aria-label="이전 달">‹</button>' +
        '<strong>' + escHtml(formatMonthLabel(selectedMonth)) + '</strong>' +
        '<button type="button" class="timeline-month-btn" data-timeline-month="next" aria-label="다음 달">›</button>' +
      '</div>' +
      '<section class="timeline-feed">' +
        (records.length ? records.map(renderEntry).join("") : renderEmpty(selectedMonth)) +
      '</section>';
  }

  function renderSummaryStamp(type, label, count, unit) {
    return '<div class="timeline-summary-stamp"><span class="timeline-image-slot is-' + type + '" aria-hidden="true"></span><b>' + escHtml(label) + '</b><strong>' + escHtml(String(count || 0)) + escHtml(unit) + '</strong></div>';
  }

  function renderEntry(item) {
    return '<article class="timeline-entry">' +
      '<div class="timeline-entry-card">' +
        '<span class="timeline-image-slot timeline-entry-image" aria-hidden="true"></span>' +
        '<div class="timeline-entry-copy">' +
          '<span>' + escHtml(formatDate(item.date)) + '</span>' +
          '<strong>' + escHtml(item.title) + '</strong>' +
          '<p>' + escHtml(item.subtitle) + '</p>' +
        '</div>' +
        '<em class="is-' + escHtml(item.category) + '">' + escHtml(categoryLabel(item.category)) + '</em>' +
      '</div>' +
    '</article>';
  }

  function renderEmpty(selectedMonth) {
    return '<article class="timeline-entry"><div class="timeline-entry-card is-empty"><span class="timeline-image-slot timeline-entry-image" aria-hidden="true"></span><div class="timeline-entry-copy"><span>' + escHtml(formatMonthLabel(selectedMonth)) + '</span><strong>아직 기록이 없어요</strong><p>루미벨과 함께한 순간이 생기면 이곳에 저장돼요.</p></div><em class="is-guide">안내</em></div></article>';
  }

  function normalizeTimelinePayload(payload) {
    payload = payload || {};
    return {
      joinedAt: payload.joinedAt || payload.createdAt || DEFAULT_TIMELINE_DATA.joinedAt,
      firstVisitAt: payload.firstVisitAt || DEFAULT_TIMELINE_DATA.firstVisitAt,
      summary: {
        live: Number(payload.summary && payload.summary.live || 0),
        checkin: Number(payload.summary && payload.summary.checkin || 0),
        stamp: Number(payload.summary && payload.summary.stamp || 0)
      },
      items: (Array.isArray(payload.items) ? payload.items : []).map(function (item, index) {
        return {
          id: item.id || "timeline-" + index,
          category: item.category || "guide",
          title: item.title || "",
          subtitle: item.subtitle || item.note || "",
          date: normalizeDate(item.date || item.createdAt || "")
        };
      })
    };
  }

  function filterItems(items, filter, month) {
    return (items || []).filter(function (item) {
      if (itemMonth(item.date) !== month) return false;
      return filter === "all" || item.category === filter;
    });
  }

  function sortItems(items) {
    return items.slice().sort(function (a, b) { return dateValue(a.date) - dateValue(b.date); });
  }

  function dateValue(value) {
    var date = new Date(normalizeDate(value).replace(/\./g, "-") + "T00:00:00");
    return isNaN(date) ? 0 : date.getTime();
  }

  function getInitialMonth(items) {
    var months = (items || []).map(function (item) { return itemMonth(item.date); }).filter(Boolean).sort();
    return months[0] || "2026-05";
  }

  function itemMonth(value) {
    var match = String(value || "").match(/^(\d{4})[.-](\d{1,2})/);
    return match ? match[1] + "-" + String(match[2]).padStart(2, "0") : "";
  }

  function normalizeDate(value) {
    var match = String(value || "").trim().match(/^(\d{4})[.-](\d{1,2})(?:[.-](\d{1,2}))?/);
    if (!match) return String(value || "");
    return match[1] + "." + String(match[2]).padStart(2, "0") + (match[3] ? "." + String(match[3]).padStart(2, "0") : "");
  }

  function formatDate(value) { return String(value || "").replace(/-/g, "."); }

  function moveMonth(month, direction) {
    var parts = String(month || "2026-05").split("-");
    var year = Number(parts[0]);
    var monthNumber = Number(parts[1]) + direction;
    if (monthNumber < 1) { year -= 1; monthNumber = 12; }
    if (monthNumber > 12) { year += 1; monthNumber = 1; }
    return year + "-" + String(monthNumber).padStart(2, "0");
  }

  function formatMonthLabel(month) { return String(month || "").replace("-", "."); }

  function getDayCount(joinedAt) {
    var start = new Date(String(joinedAt || "").replace(/\./g, "-") + "T00:00:00");
    if (isNaN(start)) return 1;
    var today = new Date();
    return Math.max(1, Math.floor((today.setHours(0, 0, 0, 0) - start.getTime()) / 86400000) + 1);
  }

  function categoryLabel(category) {
    return ({ live: "라이브", checkin: "체크인", online: "온라인", ticket: "티켓", guide: "안내" })[category] || "기록";
  }

  function escHtml(value) {
    return String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
})();
