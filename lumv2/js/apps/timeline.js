(function () {
  "use strict";

  var DEFAULT_TIMELINE_DATA = {
    joinedAt: "2026.05.07",
    firstVisitAt: "",
    summary: {
      live: 1,
      checkin: 1,
      stamp: 1
    },
    items: [
      {
        id: "timeline-ticket-20260712",
        category: "ticket",
        icon: "🎟️",
        title: "Debut Live 예매 기록",
        subtitle: "Shine Me UP : 데뷔 라이브 예매가 기록돼요.",
        date: "2026.07.12",
        tags: ["티켓"]
      },
      {
        id: "timeline-live-20260712",
        category: "live",
        icon: "🎤",
        title: "Debut Live 입장 완료",
        subtitle: "루미벨과 만난 첫 라이브 기록이에요.",
        date: "2026.07.12",
        tags: ["라이브"]
      },
      {
        id: "timeline-checkin-20260712",
        category: "checkin",
        icon: "🌸",
        title: "첫 루미 체크인",
        subtitle: "특전회에 참여한 기록이 남아요.",
        date: "2026.07.12",
        tags: ["체크인", "스탬프 +1"]
      },
      {
        id: "timeline-online-20260726",
        category: "online",
        icon: "✨",
        title: "온라인 응원 기록",
        subtitle: "멀리서 보낸 응원도 루미폰에 보관돼요.",
        date: "2026.07.26",
        tags: ["온라인"]
      }
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
    return (
      '<section class="timeline-app" data-timeline-app>' +
        '<div class="timeline-head">' +
          '<h2>추억의 시간</h2>' +
          '<p>오프라인에서 만난 순간과 온라인으로 이어진 마음을 함께 모아보는 공간이에요.</p>' +
        '</div>' +
        '<div class="timeline-body" data-timeline-body></div>' +
      '</section>'
    );
  };

  window.LumiApps.bindTimeline = function (root) {
    var app = root.querySelector("[data-timeline-app]");
    if (!app || app.__lumiTimelineBound) return;
    app.__lumiTimelineBound = true;

    app.__lumiTimelineData = normalizeTimelinePayload(window.LUMI_TIMELINE_DATA || DEFAULT_TIMELINE_DATA);
    app.__lumiTimelineFilter = "all";
    app.__lumiTimelineMonth = getInitialMonth(app.__lumiTimelineData.items);

    app.addEventListener("click", function (e) {
      var filterBtn = e.target.closest("[data-timeline-filter]");
      if (filterBtn) {
        app.__lumiTimelineFilter = filterBtn.getAttribute("data-timeline-filter") || "all";
        app.querySelectorAll("[data-timeline-filter]").forEach(function (btn) {
          btn.classList.toggle("is-active", btn === filterBtn);
        });
        renderTimeline(app);
        return;
      }

      var monthBtn = e.target.closest("[data-timeline-month]");
      if (monthBtn) {
        var dir = monthBtn.getAttribute("data-timeline-month") === "prev" ? -1 : 1;
        app.__lumiTimelineMonth = moveMonth(app.__lumiTimelineMonth, dir);
        renderTimeline(app);
      }
    });

    renderTimeline(app);
  };

  function renderTimeline(app) {
    var body = app.querySelector("[data-timeline-body]");
    if (!body) return;

    var data = app.__lumiTimelineData || normalizeTimelinePayload(DEFAULT_TIMELINE_DATA);
    var filter = app.__lumiTimelineFilter || "all";
    var month = app.__lumiTimelineMonth || getInitialMonth(data.items);
    var items = filterTimelineItems(data.items, filter, month);
    var grouped = groupItemsByDate(items);
    var dayCount = getDayCount(data.joinedAt);

    body.innerHTML = (
      '<section class="timeline-summary-grid">' +
        '<article class="timeline-summary-card">' +
          '<span>루미벨과 만난 지</span>' +
          '<strong>DAY ' + escHtml(dayCount) + '</strong>' +
          '<p>' + escHtml(data.joinedAt || '-') + '부터 루미벨과 이어진 시간</p>' +
        '</article>' +
        '<article class="timeline-summary-card">' +
          '<span>첫 루미 방문일</span>' +
          '<strong>' + escHtml(data.firstVisitAt || '-') + '</strong>' +
          '<p>' + escHtml(data.firstVisitAt ? '첫 방문 기록이 저장되어 있어요.' : '아직 루미벨 방문 기록이 없어요.') + '</p>' +
        '</article>' +
      '</section>' +
      '<section class="timeline-count-grid">' +
        '<article><span>라이브</span><strong>' + escHtml(data.summary.live || 0) + '회</strong></article>' +
        '<article><span>체크인</span><strong>' + escHtml(data.summary.checkin || 0) + '회</strong></article>' +
        '<article><span>스탬프</span><strong>' + escHtml(data.summary.stamp || 0) + '개</strong></article>' +
      '</section>' +
      '<div class="timeline-filters">' +
        FILTERS.map(function (filterItem) {
          return '<button type="button" class="' + (filterItem.id === filter ? 'is-active' : '') + '" data-timeline-filter="' + escHtml(filterItem.id) + '">' + escHtml(filterItem.label) + '</button>';
        }).join("") +
      '</div>' +
      '<div class="timeline-month-nav">' +
        '<button type="button" data-timeline-month="prev" aria-label="이전 달">‹</button>' +
        '<strong>' + escHtml(formatMonthLabel(month)) + '</strong>' +
        '<button type="button" data-timeline-month="next" aria-label="다음 달">›</button>' +
      '</div>' +
      '<section class="timeline-list">' +
        '<h3>기록 타임라인</h3>' +
        (grouped.length ? '<div class="timeline-diary-card">' + grouped.map(renderDateGroup).join("") + '</div>' : renderEmptyDiary(month)) +
      '</section>'
    );
  }

  function renderDateGroup(group) {
    return (
      '<article class="timeline-day-group">' +
        '<div class="timeline-day-dot">' + escHtml(group.icon || "✦") + '</div>' +
        '<div class="timeline-day-content">' +
          '<span class="timeline-day-date">' + escHtml(formatDateForDiary(group.date)) + '</span>' +
          '<strong>' + escHtml(group.title) + '</strong>' +
          '<p>' + escHtml(group.summary) + '</p>' +
          '<div class="timeline-day-tags">' +
            group.tags.map(function (tag) {
              return '<em>' + escHtml(tag) + '</em>';
            }).join("") +
          '</div>' +
        '</div>' +
      '</article>'
    );
  }

  function renderEmptyDiary(month) {
    return (
      '<div class="timeline-diary-card">' +
        '<article class="timeline-day-group is-empty">' +
          '<div class="timeline-day-dot">🕰️</div>' +
          '<div class="timeline-day-content">' +
            '<span class="timeline-day-date">' + escHtml(month.replace("-", ".")) + '</span>' +
            '<strong>아직 기록이 없어요</strong>' +
            '<p>루미벨과 함께한 순간이 생기면 이곳에 차곡차곡 남아요.</p>' +
            '<div class="timeline-day-tags"><em>안내</em></div>' +
          '</div>' +
        '</article>' +
      '</div>'
    );
  }

  function groupItemsByDate(items) {
    var map = {};
    (items || []).forEach(function (item) {
      var key = normalizeDateText(item.date || "");
      if (!map[key]) {
        map[key] = {
          date: key,
          icon: item.icon || iconByCategory(item.category),
          items: [],
          tags: []
        };
      }
      map[key].items.push(item);
      (item.tags || [item.tag || categoryLabel(item.category)]).forEach(function (tag) {
        if (tag && map[key].tags.indexOf(tag) === -1) map[key].tags.push(tag);
      });
    });

    return Object.keys(map).sort().map(function (key) {
      var group = map[key];
      var first = group.items[0] || {};
      var title = first.title || "루미 기록";
      var summary = first.subtitle || "";
      if (group.items.length > 1) {
        title = getDiaryTitleForDate(group.items);
        summary = group.items.map(function (item) {
          return item.title;
        }).join(" · ");
      }

      return {
        date: group.date,
        icon: group.icon,
        title: title,
        summary: summary,
        tags: group.tags.slice(0, 4)
      };
    });
  }

  function getDiaryTitleForDate(items) {
    var hasLive = items.some(function (item) { return item.category === "live"; });
    var hasCheckin = items.some(function (item) { return item.category === "checkin"; });
    var hasTicket = items.some(function (item) { return item.category === "ticket"; });
    if (hasLive && hasCheckin) return "Debut Live";
    if (hasTicket) return "티켓과 만남의 기록";
    return (items[0] && items[0].title) || "루미 기록";
  }

  function filterTimelineItems(items, filter, month) {
    return (items || []).filter(function (item) {
      var itemMonth = getItemMonth(item.date);
      if (itemMonth !== month) return false;
      if (filter === "all") return true;
      return item.category === filter;
    });
  }

  function normalizeTimelinePayload(payload) {
    var data = payload || {};
    var items = Array.isArray(data.items) ? data.items : [];

    return {
      joinedAt: data.joinedAt || data.createdAt || DEFAULT_TIMELINE_DATA.joinedAt,
      firstVisitAt: data.firstVisitAt || "",
      summary: {
        live: Number(data.summary && data.summary.live || 0),
        checkin: Number(data.summary && data.summary.checkin || 0),
        stamp: Number(data.summary && data.summary.stamp || 0)
      },
      items: items.map(function (item, index) {
        var category = item.category || "guide";
        var tags = Array.isArray(item.tags) ? item.tags : (item.tag ? [item.tag] : [categoryLabel(category)]);
        return {
          id: item.id || "timeline-" + index,
          category: category,
          icon: item.icon || iconByCategory(category),
          title: item.title || "",
          subtitle: item.subtitle || item.note || "",
          date: normalizeDateText(item.date || item.createdAt || ""),
          tags: tags
        };
      })
    };
  }

  function getInitialMonth(items) {
    var dated = (items || []).map(function (item) {
      return getItemMonth(item.date);
    }).filter(Boolean).sort();
    return dated[0] || "2026-05";
  }

  function getItemMonth(dateText) {
    var raw = String(dateText || "").trim();
    var match = raw.match(/^(\d{4})[.-](\d{1,2})/);
    if (!match) return "";
    return match[1] + "-" + String(match[2]).padStart(2, "0");
  }

  function normalizeDateText(value) {
    var raw = String(value || "").trim();
    var match = raw.match(/^(\d{4})[.-](\d{1,2})(?:[.-](\d{1,2}))?/);
    if (!match) return raw;
    if (!match[3]) return match[1] + "." + String(match[2]).padStart(2, "0");
    return match[1] + "." + String(match[2]).padStart(2, "0") + "." + String(match[3]).padStart(2, "0");
  }

  function formatDateForDiary(dateText) {
    return String(dateText || "").replace(/-/g, ".");
  }

  function moveMonth(month, dir) {
    var parts = String(month || "2026-05").split("-");
    var y = Number(parts[0] || 2026);
    var m = Number(parts[1] || 5) + dir;
    if (m < 1) {
      y -= 1;
      m = 12;
    }
    if (m > 12) {
      y += 1;
      m = 1;
    }
    return y + "-" + String(m).padStart(2, "0");
  }

  function formatMonthLabel(month) {
    var parts = String(month || "2026-05").split("-");
    return parts[0] + "년 " + parts[1] + "월";
  }

  function getDayCount(joinedAt) {
    var raw = String(joinedAt || "").replace(/\./g, "-");
    var start = new Date(raw + "T00:00:00");
    if (isNaN(start)) return 1;
    var today = new Date();
    var diff = Math.floor((today.setHours(0, 0, 0, 0) - start.getTime()) / 86400000) + 1;
    return Math.max(1, diff);
  }

  function categoryLabel(category) {
    var map = {
      live: "라이브",
      checkin: "체크인",
      online: "온라인",
      ticket: "티켓",
      guide: "안내"
    };
    return map[category] || "기록";
  }

  function iconByCategory(category) {
    var map = {
      live: "🎤",
      checkin: "🌸",
      online: "✨",
      ticket: "🎟️",
      guide: "🕰️"
    };
    return map[category] || "✦";
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
