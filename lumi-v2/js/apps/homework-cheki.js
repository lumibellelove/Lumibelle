(function () {
  "use strict";

  var DEFAULT_CHEKI_DATA = {
    items: [
      {
        id: "hc-001",
        member: "마리링",
        memberMark: "🎀⭐️",
        status: "ready",
        title: "데뷔 라이브 숙제체키",
        requestedAt: "2026.07.12",
        photoDate: "2026.07.12",
        readyAt: "2026.07.26",
        pickupAt: "",
        note: "수령 가능 상태예요. 루미벨 특전회에서 받을 수 있어요."
      },
      {
        id: "hc-002",
        member: "루루",
        memberMark: "🍼🐰",
        status: "working",
        title: "첫 특전회 숙제체키",
        requestedAt: "2026.07.12",
        photoDate: "2026.07.12",
        readyAt: "",
        pickupAt: "",
        note: "멤버가 준비 중이에요. 수령 가능 상태가 되면 표시돼요."
      },
      {
        id: "hc-003",
        member: "마리링",
        memberMark: "🎀⭐️",
        status: "received",
        title: "오히로메 기념 숙제체키",
        requestedAt: "2026.06.30",
        photoDate: "2026.07.12",
        readyAt: "2026.07.20",
        pickupAt: "2026.07.26",
        note: "수령 완료된 숙제체키예요."
      }
    ]
  };

  var TABS = [
    { id: "all", label: "전체" },
    { id: "progress", label: "진행 중" },
    { id: "ready", label: "수령 가능" },
    { id: "received", label: "수령 완료" }
  ];

  var STATUS = {
    accepted: {
      label: "접수됨",
      tone: "wait",
      desc: "신청이 접수된 상태예요."
    },
    working: {
      label: "준비 중",
      tone: "work",
      desc: "멤버가 숙제체키를 준비 중이에요."
    },
    ready: {
      label: "수령 가능",
      tone: "ready",
      desc: "루미벨 특전회에서 수령할 수 있어요."
    },
    received: {
      label: "수령 완료",
      tone: "done",
      desc: "수령이 완료된 숙제체키예요."
    }
  };

  window.LumiApps = window.LumiApps || {};

  window.LumiApps.homeworkCheki = function () {
    return (
      '<section class="homework-cheki-app" data-homework-cheki-app>' +
        '<div class="homework-cheki-head">' +
          '<h2>숙제체키</h2>' +
          '<p>지명한 멤버가 준비 중인 숙제체키 상태를 확인하는 공간이에요.</p>' +
        '</div>' +
        '<div class="homework-cheki-tabs" role="tablist">' +
          TABS.map(function (tab, index) {
            return '<button type="button" class="homework-cheki-tab ' + (index === 0 ? 'is-active' : '') + '" data-homework-cheki-tab="' + escHtml(tab.id) + '">' + escHtml(tab.label) + '</button>';
          }).join("") +
        '</div>' +
        '<div class="homework-cheki-body" data-homework-cheki-body></div>' +
      '</section>'
    );
  };

  window.LumiApps.bindHomeworkCheki = function (root) {
    var app = root.querySelector("[data-homework-cheki-app]");
    if (!app || app.__lumiHomeworkChekiBound) return;
    app.__lumiHomeworkChekiBound = true;
    app.__lumiHomeworkChekiTab = "all";
    app.__lumiHomeworkChekiData = normalizeChekiPayload(window.LUMI_HOMEWORK_CHEKI_DATA || DEFAULT_CHEKI_DATA);

    app.addEventListener("click", function (e) {
      var tab = e.target.closest("[data-homework-cheki-tab]");
      if (tab) {
        app.__lumiHomeworkChekiTab = tab.getAttribute("data-homework-cheki-tab") || "all";
        app.querySelectorAll("[data-homework-cheki-tab]").forEach(function (btn) {
          btn.classList.toggle("is-active", btn === tab);
        });
        renderHomeworkCheki(app);
      }
    });

    renderHomeworkCheki(app);
  };

  function renderHomeworkCheki(app) {
    var body = app.querySelector("[data-homework-cheki-body]");
    if (!body) return;

    var tab = app.__lumiHomeworkChekiTab || "all";
    var data = app.__lumiHomeworkChekiData || normalizeChekiPayload(DEFAULT_CHEKI_DATA);
    var items = filterItems(data.items, tab);

    body.innerHTML = (
      '<section class="homework-cheki-list">' +
        '<article class="homework-cheki-guide-card">' +
          '<strong>수령 안내</strong>' +
          '<p>상태가 수령 가능으로 바뀌면 루미벨 특전회에서 받을 수 있어요. 현장에서는 루미 ID 또는 닉네임을 보여주세요.</p>' +
        '</article>' +
        (items.length ? items.map(renderChekiCard).join("") : '<div class="homework-cheki-empty">조건에 맞는 숙제체키가 없어요.</div>') +
      '</section>'
    );
  }

  function filterItems(items, tab) {
    if (tab === "all") return items;
    if (tab === "progress") {
      return items.filter(function (item) {
        return item.status === "accepted" || item.status === "working";
      });
    }
    if (tab === "ready") {
      return items.filter(function (item) {
        return item.status === "ready";
      });
    }
    if (tab === "received") {
      return items.filter(function (item) {
        return item.status === "received";
      });
    }
    return items;
  }

  function renderChekiCard(item) {
    var status = STATUS[item.status] || STATUS.accepted;

    return (
      '<article class="homework-cheki-card is-' + escHtml(status.tone) + '">' +
        '<div class="homework-cheki-card-top">' +
          '<div>' +
            '<span class="homework-cheki-member">' + escHtml(item.memberMark || '') + ' ' + escHtml(item.member || '') + '</span>' +
            '<h3>' + escHtml(item.title || '숙제체키') + '</h3>' +
          '</div>' +
          '<em>' + escHtml(status.label) + '</em>' +
        '</div>' +
        '<dl class="homework-cheki-meta">' +
          '<div><dt>촬영일</dt><dd>' + escHtml(item.photoDate || '-') + '</dd></div>' +
          '<div><dt>신청일</dt><dd>' + escHtml(item.requestedAt || '-') + '</dd></div>' +
          '<div><dt>수령 가능일</dt><dd>' + escHtml(item.readyAt || '-') + '</dd></div>' +
        '</dl>' +
        '<p class="homework-cheki-desc">' + escHtml(item.note || status.desc) + '</p>' +
      '</article>'
    );
  }

  function normalizeChekiPayload(payload) {
    var data = payload || {};
    var items = Array.isArray(data.items) ? data.items : [];

    return {
      items: items.map(function (item, index) {
        return {
          id: item.id || 'homework-cheki-' + index,
          member: item.member || '',
          memberMark: item.memberMark || '',
          status: item.status || 'accepted',
          title: item.title || '숙제체키',
          requestedAt: item.requestedAt || '',
          photoDate: item.photoDate || '',
          readyAt: item.readyAt || '',
          pickupAt: item.pickupAt || '',
          note: item.note || ''
        };
      })
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
