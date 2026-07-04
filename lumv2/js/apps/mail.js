/**
 * mail.js — 우편함
 * 받은 우편 / 소장 우편 / 안내 탭 + 필터 + 상세 보기 + 소장 토글
 */
(function () {
  "use strict";

  window.LumiApps = window.LumiApps || {};

  var MAIL_ITEMS = [
    {
      id: "welcome", box: "inbox", category: "guide", from: "루미벨", meta: "개통 안내 · 오늘 12:00", status: "NEW",
      title: "루미벨에서 도착한 첫 우편", preview: "루미폰 개통을 환영해요.",
      body: "안녕, 반짝이야!\n\n루미폰 개통을 진심으로 환영해요.\n\n앞으로 공연 소식, 우편, 특전회 안내와 작은 추억들을 이곳에서 하나씩 보내줄게요.\n\n우리의 첫 우편이 너에게 설렘으로 닿았으면 좋겠어 ♡\n\n오늘도 함께 반짝여줘서 고마워!",
      related: "티켓함 / 캘린더"
    },
    {
      id: "after-live-mariring", box: "inbox", category: "member", from: "마리링", meta: "공연 후 우편 · 오늘 18:00", status: "NEW",
      title: "오늘 와줘서 고마워", preview: "네가 남겨준 마음이 오늘 무대의 반짝임이 됐어.",
      body: "오늘 와줘서 고마워.\n\n네가 남겨준 마음이 오늘 무대의 반짝임이 됐어. 모든 순간에 답장을 남기지는 못해도, 루미벨은 루미나가 보내준 응원과 후기를 소중히 확인하고 있어.\n\n다음에도 무대에서 꼭 만나자.",
      related: "공연 기록"
    },
    {
      id: "debut-guide", box: "guide", category: "live", from: "LUMI STAFF", meta: "라이브 안내 · 2026.07.12", status: "읽음",
      title: "Debut Live 안내", preview: "공연 일정과 입장 안내는 티켓함과 캘린더에서 확인할 수 있어요.",
      body: "공연 일정과 입장 안내는 티켓함과 캘린더에서 확인할 수 있어요.\n\n현장에서는 루미 ID 또는 입장 확인용 번호를 먼저 보여주세요. 메아테 혜택은 입장 시 지급되는 것이 아니라, 물판과 특전회에서 확인 후 처리됩니다.",
      related: "티켓함 / 캘린더"
    },
    {
      id: "birthday-ticket", box: "guide", category: "event", from: "루미폰", meta: "이벤트 안내 · 생일 당월", status: "읽음",
      title: "Birthday Ticket 안내", preview: "생일을 등록하면 생일 시즌에 안내가 도착해요.",
      body: "생일을 등록하면 생일 시즌에 Birthday Ticket 안내가 도착해요.\n\nBirthday Ticket은 팬 본인의 생일 등록값을 기준으로 표시됩니다. 본인 사용만 가능하며 양도할 수 없고, 사용 완료 후 재발급되지 않습니다.",
      related: "내 프로필"
    },
    {
      id: "lumilog-guide", box: "guide", category: "guide", from: "LUMI LOG", meta: "루미로그 안내 · 준비 중", status: "읽음",
      title: "루미로그 안내", preview: "공연이 끝난 뒤, 그날의 기억이 루미로그와 추억의 시간에 정리돼요.",
      body: "공연이 끝난 뒤, 그날의 기억이 루미로그와 추억의 시간에 정리돼요.\n\n루미벨은 루미나가 남겨준 후기와 응원을 소중히 확인하고, 지나가는 글이 아니라 오래 남는 기록으로 보관할 예정이에요.",
      related: "루미로그"
    }
  ];

  var STORAGE = { read: "lumi_v2_mail_read", saved: "lumi_v2_mail_saved" };

  window.LumiApps.mail = function () {
    return (
      '<section class="mail-app" data-mail-app>' +
        '<header class="mail-hero">' +
          '<div class="mail-hero-mark" aria-hidden="true"></div>' +
          '<h2>우편함</h2>' +
          '<p>공연 후 도착한 우편, 소장 우편, 안내 우편을 모아보는 공간이에요.</p>' +
        '</header>' +
        '<div class="mail-tabs" role="tablist">' +
          '<button type="button" class="mail-tab is-active" data-mail-tab="inbox"><span class="mail-tab-art" aria-hidden="true"></span><span>받은 우편</span></button>' +
          '<button type="button" class="mail-tab" data-mail-tab="saved"><span class="mail-tab-art" aria-hidden="true"></span><span>소장 우편</span></button>' +
          '<button type="button" class="mail-tab" data-mail-tab="guide"><span class="mail-tab-art" aria-hidden="true"></span><span>안내</span></button>' +
        '</div>' +
        '<div class="mail-filters" data-mail-filters>' +
          '<button type="button" class="mail-filter-chip is-active" data-mail-filter="all">전체</button>' +
          '<button type="button" class="mail-filter-chip" data-mail-filter="member">멤버</button>' +
          '<button type="button" class="mail-filter-chip" data-mail-filter="live">라이브</button>' +
          '<button type="button" class="mail-filter-chip" data-mail-filter="guide">안내</button>' +
          '<button type="button" class="mail-filter-chip" data-mail-filter="event">이벤트</button>' +
        '</div>' +
        '<label class="mail-search-wrap"><span class="mail-search-art" aria-hidden="true"></span><input class="mail-search" data-mail-search type="search" placeholder="검색할 내용을 입력하세요."></label>' +
        '<div class="mail-list" data-mail-list></div>' +
        '<section class="mail-detail-sheet" data-mail-detail aria-hidden="true"></section>' +
      '</section>'
    );
  };

  window.LumiApps.bindMail = function (root) {
    var app = root.querySelector("[data-mail-app]");
    if (!app || app.__lumiMailBound) return;
    app.__lumiMailBound = true;
    app.__lumiMailTab = "inbox";
    app.__lumiMailFilter = "all";

    renderMailList(app);

    app.addEventListener("input", function (e) {
      if (e.target.closest("[data-mail-search]")) renderMailList(app);
    });

    app.addEventListener("click", function (e) {
      var detailSheet = app.querySelector("[data-mail-detail]");
      if (detailSheet && detailSheet.classList.contains("is-open") && e.target === detailSheet) {
        closeMailDetail(app);
        return;
      }

      var tab = e.target.closest("[data-mail-tab]");
      if (tab) {
        app.__lumiMailTab = tab.getAttribute("data-mail-tab") || "inbox";
        app.querySelectorAll("[data-mail-tab]").forEach(function (button) { button.classList.toggle("is-active", button === tab); });
        var filters = app.querySelector("[data-mail-filters]");
        if (filters) filters.hidden = app.__lumiMailTab === "guide";
        renderMailList(app);
        return;
      }

      var chip = e.target.closest("[data-mail-filter]");
      if (chip) {
        app.__lumiMailFilter = chip.getAttribute("data-mail-filter") || "all";
        app.querySelectorAll("[data-mail-filter]").forEach(function (button) { button.classList.toggle("is-active", button === chip); });
        renderMailList(app);
        return;
      }

      var card = e.target.closest("[data-mail-open]");
      if (card) { openMailDetail(app, card.getAttribute("data-mail-open")); return; }

      if (e.target.closest("[data-mail-close]")) { closeMailDetail(app); return; }

      var saveBtn = e.target.closest("[data-mail-save]");
      if (saveBtn) toggleMailSave(app, saveBtn);
    });
  };

  function renderMailList(app) {
    var list = app.querySelector("[data-mail-list]");
    if (!list) return;

    var tab = app.__lumiMailTab || "inbox";
    var filter = app.__lumiMailFilter || "all";
    var savedIds = getArr(STORAGE.saved);
    var readIds = getArr(STORAGE.read);
    var searchEl = app.querySelector("[data-mail-search]");
    var searchTerm = searchEl ? searchEl.value.trim().toLowerCase() : "";

    var items = MAIL_ITEMS.filter(function (mail) {
      if (tab === "saved") {
        if (savedIds.indexOf(mail.id) === -1) return false;
      } else if (tab === "guide") {
        if (mail.box !== "guide") return false;
      } else if (mail.box !== "inbox") {
        return false;
      }
      return filter === "all" || mail.category === filter;
    });

    if (searchTerm) {
      items = items.filter(function (mail) {
        return [mail.from, mail.title, mail.preview, mail.meta, mail.category, mail.body || ""].join(" ").toLowerCase().indexOf(searchTerm) !== -1;
      });
    }

    if (!items.length) {
      list.innerHTML = '<div class="mail-empty">' + (searchTerm ? "조건에 맞는 우편이 없어요." : "아직 이 탭에 표시할 우편이 없어요.<br>도착한 우편은 이곳에 차곡차곡 모여요.") + '</div>';
      return;
    }

    list.innerHTML = items.map(function (mail) {
      var isRead = readIds.indexOf(mail.id) !== -1 || mail.status === "읽음";
      var isSaved = savedIds.indexOf(mail.id) !== -1;
      var statusLabel = isSaved ? "소장" : (isRead ? "읽음" : "NEW");
      var statusClass = isSaved ? " is-saved" : (isRead ? " is-read" : " is-new");
      return (
        '<button type="button" class="mail-card' + (!isRead && !isSaved ? " is-unread" : "") + '" data-mail-open="' + escAttr(mail.id) + '">' +
          '<span class="mail-card-art" aria-hidden="true"></span>' +
          '<span class="mail-card-main">' +
            '<span class="mail-card-meta">From. ' + escHtml(mail.from) + ' · ' + escHtml(mail.meta) + '</span>' +
            '<b class="mail-card-title">' + escHtml(mail.title) + '</b>' +
            '<span class="mail-card-preview">' + escHtml(mail.preview) + '</span>' +
          '</span>' +
          '<span class="mail-status-chip' + statusClass + '">' + escHtml(statusLabel) + '</span>' +
        '</button>'
      );
    }).join("");
  }

  function openMailDetail(app, mailId) {
    var item = MAIL_ITEMS.find(function (mail) { return mail.id === mailId; });
    var sheet = app.querySelector("[data-mail-detail]");
    if (!item || !sheet) return;

    var readIds = getArr(STORAGE.read);
    if (readIds.indexOf(mailId) === -1) {
      readIds.push(mailId);
      setArr(STORAGE.read, readIds);
      renderMailList(app);
    }

    var isSaved = getArr(STORAGE.saved).indexOf(mailId) !== -1;
    sheet.innerHTML = (
      '<div class="mail-detail-card" role="dialog" aria-modal="true" aria-label="우편 보기">' +
        '<button type="button" class="mail-detail-close" data-mail-close aria-label="닫기">×</button>' +
        '<div class="mail-detail-ribbon">우편 보기</div>' +
        '<header class="mail-detail-head">' +
          '<h3>' + escHtml(item.title) + '</h3>' +
          '<p>From. ' + escHtml(item.from) + ' · ' + escHtml(item.meta) + '</p>' +
        '</header>' +
        '<div class="mail-detail-art" aria-hidden="true"></div>' +
        '<div class="mail-detail-body">' + escHtml(item.body).replace(/\n/g, '<br>') + '</div>' +
        '<div class="mail-detail-state">읽음</div>' +
        '<button type="button" class="mail-related-link" data-mail-related="' + escAttr(item.id) + '"><span class="mail-related-art" aria-hidden="true"></span><span><small>관련 이동</small><b>' + escHtml(item.related) + '</b></span><i aria-hidden="true">›</i></button>' +
        '<div class="mail-detail-actions">' +
          '<button type="button" class="mail-close-btn" data-mail-close>닫기</button>' +
          '<button type="button" class="mail-save-btn' + (isSaved ? " is-saved" : "") + '" data-mail-save data-mail-id="' + escAttr(mailId) + '">' + (isSaved ? "소장 해제" : "소장하기") + '</button>' +
        '</div>' +
      '</div>'
    );

    sheet.classList.add("is-open");
    sheet.setAttribute("aria-hidden", "false");
    var appWindow = app.closest(".app-window");
    if (appWindow) appWindow.classList.add("is-mail-detail-open");
    setMailBackHandler(app);
  }

  function setMailBackHandler(app) {
    if (!window.LumiPhone || typeof window.LumiPhone.setAppBackHandler !== "function") return;
    window.LumiPhone.setAppBackHandler(function () {
      var sheet = app.querySelector("[data-mail-detail]");
      if (!sheet || !sheet.classList.contains("is-open")) return false;
      closeMailDetail(app);
      return true;
    });
  }

  function closeMailDetail(app) {
    var sheet = app.querySelector("[data-mail-detail]");
    if (!sheet) return;
    sheet.classList.remove("is-open");
    sheet.setAttribute("aria-hidden", "true");
    sheet.innerHTML = "";
    var appWindow = app.closest(".app-window");
    if (appWindow) appWindow.classList.remove("is-mail-detail-open");
    if (window.LumiPhone && typeof window.LumiPhone.setAppBackHandler === "function") window.LumiPhone.setAppBackHandler(null);
  }

  function toggleMailSave(app, button) {
    var mailId = button.getAttribute("data-mail-id");
    if (!mailId) return;
    var saved = getArr(STORAGE.saved);
    var index = saved.indexOf(mailId);
    var nextSaved = index === -1;
    if (nextSaved) saved.unshift(mailId); else saved.splice(index, 1);
    setArr(STORAGE.saved, saved);
    button.classList.toggle("is-saved", nextSaved);
    button.textContent = nextSaved ? "소장 해제" : "소장하기";
    renderMailList(app);
  }

  function getArr(key) { try { var value = JSON.parse(localStorage.getItem(key) || "[]"); return Array.isArray(value) ? value : []; } catch (error) { return []; } }
  function setArr(key, value) { try { localStorage.setItem(key, JSON.stringify(value || [])); } catch (error) {} }
  function escHtml(value) { return String(value == null ? "" : value).replace(/[&<>\"]/g, function (character) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[character]; }); }
  function escAttr(value) { return escHtml(value).replace(/'/g, "&#39;"); }
}());
