/**
 * mail.js — 우편함 앱 1차 베타
 * 역할: 받은 우편 / 소장 우편 / 안내 탭 + 필터 + 상세 보기 + 소장 토글
 */
(function () {
  "use strict";

  window.LumiApps = window.LumiApps || {};

  /* ── 샘플 데이터 ── */
  var MAIL_ITEMS = [
    {
      id: "welcome",
      box: "inbox",
      category: "guide",
      icon: "💌",
      from: "루미벨",
      meta: "개통 안내 · 오늘 12:00",
      status: "NEW",
      title: "루미벨에서 도착한 첫 우편",
      preview: "루미폰 개통을 환영해요.",
      body: "루미폰 개통을 환영해요.\n\n이곳에는 루미벨과 함께한 기록, 공연 후 남겨지는 우편, 특별한 날의 메시지가 천천히 쌓입니다.\n\n오래 간직하고 싶은 우편은 소장하기를 눌러 소장 우편에 보관할 수 있어요."
    },
    {
      id: "after-live-mariring",
      box: "inbox",
      category: "member",
      icon: "🎀",
      from: "마리링",
      meta: "공연 후 우편 · 오늘 18:00",
      status: "NEW",
      title: "오늘 와줘서 고마워",
      preview: "네가 남겨준 마음이 오늘 무대의 반짝임이 됐어.",
      body: "오늘 와줘서 고마워.\n\n네가 남겨준 마음이 오늘 무대의 반짝임이 됐어. 모든 순간에 답장을 남기지는 못해도, 루미벨은 루미나가 보내준 응원과 후기를 소중히 확인하고 있어.\n\n다음에도 무대에서 꼭 만나자."
    },
    {
      id: "debut-guide",
      box: "inbox",
      category: "live",
      icon: "🎟",
      from: "LUMI STAFF",
      meta: "라이브 안내 · 2026.07.12",
      status: "읽음",
      title: "Debut Live 안내",
      preview: "공연 일정과 입장 안내는 티켓함과 캘린더에서 확인할 수 있어요.",
      body: "공연 일정과 입장 안내는 티켓함과 캘린더에서 확인할 수 있어요.\n\n현장에서는 루미 ID 또는 입장 확인용 번호를 먼저 보여주세요. 메아테 혜택은 입장 시 지급되는 것이 아니라, 물판/특전회에서 확인 후 처리됩니다."
    },
    {
      id: "birthday-ticket",
      box: "guide",
      category: "event",
      icon: "🎂",
      from: "루미폰",
      meta: "이벤트 안내 · 생일 당월",
      status: "읽음",
      title: "Birthday Ticket 안내",
      preview: "생일을 등록하면 생일 시즌에 안내가 도착해요.",
      body: "생일을 등록하면 생일 시즌에 Birthday Ticket 안내가 도착해요.\n\nBirthday Ticket은 팬 본인의 생일 등록값을 기준으로 표시됩니다. 본인 사용만 가능하며 양도할 수 없고, 사용 완료 후 재발급되지 않습니다."
    },
    {
      id: "lumilog-guide",
      box: "guide",
      category: "guide",
      icon: "📖",
      from: "LUMI LOG",
      meta: "루미로그 안내 · 준비 중",
      status: "읽음",
      title: "루미로그 안내",
      preview: "공연이 끝난 뒤, 그날의 기억이 루미로그와 추억의 시간에 정리돼요.",
      body: "공연이 끝난 뒤, 그날의 기억이 루미로그와 추억의 시간에 정리돼요.\n\n루미벨은 루미나가 남겨준 후기와 응원을 소중히 확인하고, 지나가는 글이 아니라 오래 남는 기록으로 보관할 예정이에요."
    }
  ];

  var STORAGE = {
    read:  "lumi_v2_mail_read",
    saved: "lumi_v2_mail_saved"
  };

  /* ── 앱 HTML ── */
  window.LumiApps.mail = function () {
    return (
      '<section class="mail-app" data-mail-app>' +
        '<div class="mail-toolbar">' +
          '<h2>우편함</h2>' +
          '<span class="mail-desc">공연 후 도착한 우편, 소장 우편, 안내 우편을 모아보는 공간이에요.</span>' +
        '</div>' +
        '<div class="mail-tabs" role="tablist">' +
          '<button type="button" class="mail-tab is-active" data-mail-tab="inbox">받은 우편</button>' +
          '<button type="button" class="mail-tab" data-mail-tab="saved">소장 우편</button>' +
          '<button type="button" class="mail-tab" data-mail-tab="guide">안내</button>' +
        '</div>' +
        '<div class="mail-filters" data-mail-filters>' +
          '<button type="button" class="mail-filter-chip is-active" data-mail-filter="all">전체</button>' +
          '<button type="button" class="mail-filter-chip" data-mail-filter="member">멤버</button>' +
          '<button type="button" class="mail-filter-chip" data-mail-filter="live">라이브</button>' +
          '<button type="button" class="mail-filter-chip" data-mail-filter="guide">안내</button>' +
          '<button type="button" class="mail-filter-chip" data-mail-filter="event">이벤트</button>' +
        '</div>' +
        '<input class="mail-search" data-mail-search type="search" placeholder="검색할 내용을 입력하세요.">' +
        '<div class="mail-list" data-mail-list></div>' +
        '<section class="mail-detail-sheet" data-mail-detail aria-hidden="true"></section>' +
      '</section>'
    );
  };

  /* ── 바인딩 ── */
  window.LumiApps.bindMail = function (root) {
    var app = root.querySelector("[data-mail-app]");
    if (!app || app.__lumiMailBound) return;
    app.__lumiMailBound = true;
    app.__lumiMailTab    = "inbox";
    app.__lumiMailFilter = "all";

    renderMailList(app);

    app.addEventListener("input", function (e) {
      if (e.target.closest("[data-mail-search]")) { renderMailList(app); }
    });

    app.addEventListener("click", function (e) {
      /* 탭 전환 */
      var tab = e.target.closest("[data-mail-tab]");
      if (tab) {
        app.__lumiMailTab = tab.getAttribute("data-mail-tab") || "inbox";
        app.querySelectorAll("[data-mail-tab]").forEach(function (b) {
          b.classList.toggle("is-active", b === tab);
        });
        /* 안내 탭에서는 필터 숨김 */
        var filters = app.querySelector("[data-mail-filters]");
        if (filters) filters.style.display = app.__lumiMailTab === "guide" ? "none" : "";
        renderMailList(app);
        return;
      }

      /* 필터 칩 */
      var chip = e.target.closest("[data-mail-filter]");
      if (chip) {
        app.__lumiMailFilter = chip.getAttribute("data-mail-filter") || "all";
        app.querySelectorAll("[data-mail-filter]").forEach(function (b) {
          b.classList.toggle("is-active", b === chip);
        });
        renderMailList(app);
        return;
      }

      /* 카드 클릭 → 상세 열기 */
      var card = e.target.closest("[data-mail-open]");
      if (card) {
        openMailDetail(app, card.getAttribute("data-mail-open"));
        return;
      }

      /* 닫기 */
      var close = e.target.closest("[data-mail-close]");
      if (close) {
        closeMailDetail(app);
        return;
      }

      /* 소장 토글 */
      var saveBtn = e.target.closest("[data-mail-save]");
      if (saveBtn) {
        toggleMailSave(app, saveBtn);
        return;
      }
    });
  };

  /* ── 목록 렌더 ── */
  function renderMailList(app) {
    var list = app.querySelector("[data-mail-list]");
    if (!list) return;

    var tab    = app.__lumiMailTab    || "inbox";
    var filter = app.__lumiMailFilter || "all";
    var savedIds = getArr(STORAGE.saved);
    var readIds  = getArr(STORAGE.read);

    var searchEl   = app.querySelector("[data-mail-search]");
    var searchTerm = searchEl ? searchEl.value.trim().toLowerCase() : "";

    var items = MAIL_ITEMS.filter(function (m) {
      /* 1단계: 탭 조건 */
      if (tab === "saved") {
        if (savedIds.indexOf(m.id) === -1) return false;
      } else if (tab === "guide") {
        var isGuideType = m.box === "guide" || (m.category !== "member" && (m.category === "live" || m.category === "event" || m.category === "guide"));
        if (!isGuideType) return false;
      } else {
        /* inbox */
        if (m.box !== "inbox") return false;
      }
      /* 2단계: 필터 칩 category 조건 */
      if (filter !== "all" && m.category !== filter) return false;
      return true;
    });

    /* 검색어 2차 필터 */
    if (searchTerm) {
      items = items.filter(function (m) {
        var hay = [m.from, m.title, m.preview, m.meta, m.category, m.body || ""].join(" ").toLowerCase();
        return hay.indexOf(searchTerm) !== -1;
      });
    }

    if (!items.length) {
      var emptyMsg = searchTerm ? "조건에 맞는 우편이 없어요." : "아직 이 탭에 표시할 우편이 없어요.<br>도착한 우편은 이곳에 차곡차곡 모여요.";
      list.innerHTML = '<div class="mail-empty">' + emptyMsg + '</div>';
      return;
    }

    list.innerHTML = items.map(function (m) {
      var isRead  = readIds.indexOf(m.id) !== -1 || m.status === "읽음";
      var isSaved = savedIds.indexOf(m.id) !== -1;
      var statusLabel = isSaved ? "소장" : (isRead ? "읽음" : m.status || "NEW");
      var statusClass = isSaved ? " is-saved" : (isRead ? " is-read" : " is-new");
      return (
        '<button type="button" class="mail-card' + (!isRead && !isSaved ? " is-unread" : "") + '" data-mail-open="' + escAttr(m.id) + '">' +
          '<span class="mail-card-icon">' + escHtml(m.icon) + '</span>' +
          '<span class="mail-card-main">' +
            '<span class="mail-card-meta">From. ' + escHtml(m.from) + ' · ' + escHtml(m.meta) + '</span>' +
            '<b class="mail-card-title">' + escHtml(m.title) + '</b>' +
            '<span class="mail-card-preview">' + escHtml(m.preview) + '</span>' +
          '</span>' +
          '<span class="mail-status-chip' + statusClass + '">' + escHtml(statusLabel) + '</span>' +
        '</button>'
      );
    }).join("");
  }

  /* ── 상세 열기 ── */
  function openMailDetail(app, mailId) {
    var item  = MAIL_ITEMS.find(function (m) { return m.id === mailId; });
    var sheet = app.querySelector("[data-mail-detail]");
    if (!item || !sheet) return;

    /* 읽음 처리 */
    var readIds = getArr(STORAGE.read);
    if (readIds.indexOf(mailId) === -1) {
      readIds.push(mailId);
      setArr(STORAGE.read, readIds);
      renderMailList(app);
    }

    var isSaved = getArr(STORAGE.saved).indexOf(mailId) !== -1;

    sheet.innerHTML = (
      '<div class="mail-detail-inner">' +
        '<header class="mail-detail-head">' +
          '<span class="mail-detail-icon">' + escHtml(item.icon) + '</span>' +
          '<div class="mail-detail-title-wrap">' +
            '<b class="mail-detail-title">' + escHtml(item.title) + '</b>' +
            '<span class="mail-detail-meta">From. ' + escHtml(item.from) + ' · ' + escHtml(item.meta) + '</span>' +
          '</div>' +
        '</header>' +
        '<div class="mail-detail-body">' + escHtml(item.body).replace(/\n/g, '<br>') + '</div>' +
        '<div class="mail-detail-actions">' +
          '<button type="button" class="mail-save-btn' + (isSaved ? " is-saved" : "") + '" data-mail-save data-mail-id="' + escAttr(mailId) + '">' +
            (isSaved ? "♥ 소장 해제" : "♡ 소장하기") +
          '</button>' +
          '<button type="button" class="mail-close-btn" data-mail-close>닫기</button>' +
        '</div>' +
      '</div>'
    );

    sheet.classList.add("is-open");
    sheet.setAttribute("aria-hidden", "false");
  }

  /* ── 상세 닫기 ── */
  function closeMailDetail(app) {
    var sheet = app.querySelector("[data-mail-detail]");
    if (!sheet) return;
    sheet.classList.remove("is-open");
    sheet.setAttribute("aria-hidden", "true");
    sheet.innerHTML = "";
  }

  /* ── 소장 토글 ── */
  function toggleMailSave(app, btn) {
    var mailId  = btn.getAttribute("data-mail-id");
    if (!mailId) return;
    var saved   = getArr(STORAGE.saved);
    var idx     = saved.indexOf(mailId);
    var isSaved = idx !== -1;
    if (isSaved) {
      saved.splice(idx, 1);
    } else {
      saved.unshift(mailId);
    }
    setArr(STORAGE.saved, saved);

    /* 버튼 즉시 업데이트 */
    var nextSaved = !isSaved;
    btn.classList.toggle("is-saved", nextSaved);
    btn.textContent = nextSaved ? "♥ 소장 해제" : "♡ 소장하기";

    /* 목록 갱신 */
    renderMailList(app);
  }

  /* ── localStorage 헬퍼 ── */
  function getArr(key) {
    try {
      var v = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(v) ? v : [];
    } catch (e) { return []; }
  }
  function setArr(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val || [])); } catch (e) {}
  }

  /* ── XSS 방지 ── */
  function escHtml(v) {
    return String(v == null ? "" : v).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function escAttr(v) { return escHtml(v).replace(/'/g, "&#39;"); }

}());
