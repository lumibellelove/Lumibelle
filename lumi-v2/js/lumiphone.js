/**
 * lumiphone.js — 루미폰 v2 OS 본체
 *
 * 규칙:
 *   - 앱 내부 UI 로직은 여기 넣지 않음 (js/apps/*.js 담당)
 *   - 앱끼리 직접 호출 금지. 반드시 LumiPhone.openApp() 경유
 *   - TODAY_STATE = 더미 데이터. 실제 API 연결 시 이 블록만 교체
 *   - 새 앱 추가: APP_REGISTRY 항목 추가 + js/apps/{id}.js 생성
 *
 * 공개 API: LumiPhone.init / openApp / goHome / goBack / goToPage
 */

window.LumiPhone = (function () {

  /* ─────────────────────────────────────────
     앱 레지스트리
     renderer:
       "empty"       — 빈 화면 (개발 전)
       "placeholder" — placeholder-apps.js 담당
       "native"      — js/apps/{id}.js 담당 (추후)
  ───────────────────────────────────────── */
  var APP_REGISTRY = [
    { id: "ticket",       labelKey: "app.ticket",        iconText: "티켓", badge: "1", group: "main", color: "#fff4f7", renderer: "native" },
    { id: "benefitQueue", labelKey: "app.benefitQueue",  iconText: "대기",             group: "main", color: "#fff0f5", renderer: "native" },
    { id: "messages",     labelKey: "app.messages",      iconText: "문자", badge: "2", group: "main", color: "#fdf4fa", renderer: "native" },
    { id: "stamp",        labelKey: "app.stamp",         iconText: "스탬프",           group: "main", color: "#fff5f8", renderer: "native" },
    { id: "point",        labelKey: "app.point",         iconText: "포인트",           group: "main", color: "#fff2f6", renderer: "native" },
    { id: "homeworkCheki",labelKey: "app.homeworkCheki", iconText: "숙체",             group: "main", color: "#fdf5f7", renderer: "native" },
    { id: "mail",         labelKey: "app.mail",          iconText: "우편",             group: "main", color: "#fff7f4", renderer: "native" },
    { id: "timeline",     labelKey: "app.timeline",      iconText: "기록",             group: "main", color: "#fff5f8", renderer: "native" },

    { id: "boothBank",    labelKey: "app.boothBank",     iconText: "통장",             group: "more", color: "#fff4f7", renderer: "native" },
    { id: "achievement",  labelKey: "app.achievement",   iconText: "업적",             group: "more", color: "#fdf5f7", renderer: "native" },
    { id: "onair",        labelKey: "app.onair",         iconText: "ON",               group: "more", color: "#f5f6ff", renderer: "empty" },
    { id: "profile",      labelKey: "app.profile",       iconText: "MY",               group: "more", color: "#fff3f7", renderer: "empty" },
    { id: "lumitalk",     labelKey: "app.lumitalk",      iconText: "톡",               group: "more", color: "#fff3f8", renderer: "placeholder" },
    { id: "lumilog",      labelKey: "app.lumilog",       iconText: "로그",             group: "more", color: "#f6fbf9", renderer: "empty" },
    { id: "exchange",     labelKey: "app.exchange",      iconText: "교환",             group: "more", color: "#fffaf1", renderer: "empty" },
    { id: "songbook",     labelKey: "app.songbook",      iconText: "노래",             group: "more", color: "#f7f3ff", renderer: "empty" },
    { id: "themeShop",    labelKey: "app.themeShop",     iconText: "테마",             group: "more", color: "#fff3f7", renderer: "placeholder" },
    { id: "settings",     labelKey: "app.settings",      iconText: "설정",             group: "more", color: "#f9f7fa", renderer: "empty" },
    { id: "attendance",   labelKey: "app.attendance",    iconText: "출석",             group: "more", color: "#fff3f8", renderer: "placeholder" },
    { id: "gameZone",     labelKey: "app.gameZone",      iconText: "게임",             group: "more", color: "#f5fbf8", renderer: "placeholder" },
    { id: "guide",        labelKey: "app.guide",         iconText: "안내",             group: "more", color: "#fffaf2", renderer: "empty" }
  ];

  /* ─────────────────────────────────────────
     Today 더미 데이터
     실제 API 붙이면 이 블록만 교체
  ───────────────────────────────────────── */
  var TODAY_STATE = {
    weather:     { temp: "24°C", desc: "홍대 상상마당 · 24°C 맑음" },
    reservation: { title: "루미벨 데뷔 라이브", date: "2026.07.12 (일) 오후 6:00", meta: "홍대 상상마당 라이브홀", status: "예약 완료" },
    summary: [
      { labelKey: "today.summary.messages", value: "2", icon: "assets/icons/message-envelope.webp", iconAlt: "" },
      { labelKey: "today.summary.stamps",   value: "3", icon: "assets/icons/stamp.webp", iconAlt: "" },
      { labelKey: "today.summary.points",   value: "120P", icon: "assets/icons/point-heart.webp", iconAlt: "" },
      { labelKey: "today.summary.cheki",    value: "1", icon: "assets/icons/homework-cheki.webp", iconAlt: "" }
    ],
    onair: { status: "다음 방송 알림 대기 중", badge: "STANDBY" }
  };

  /* ─────────────────────────────────────────
     OS 상태
  ───────────────────────────────────────── */
  var state = {
    currentApp:      null,
    appStack:        [],
    recentApps:      [],
    currentPage:     1,
    returnPage:      1,
    _scrollLocked:   false,
    _syncTimer:      null,
    _scrollLockTimer: null
  };

  var els = {};

  /* ─────────────────────────────────────────
     초기화
  ───────────────────────────────────────── */
  function init() {
    _cacheElements();
    _renderToday();
    _renderAppGrids();
    _bindEvents();
    _applyI18n();
    goToPage(0);
  }

  function _cacheElements() {
    els.screens     = document.querySelector('[data-role="screens"]');
    els.appWindow   = document.querySelector('[data-role="app-window"]');
    els.appTitle    = document.querySelector('[data-role="app-title"]');
    els.appBody     = document.querySelector('[data-role="app-body"]');
    els.dock        = document.querySelector('[data-role="dock"]');
    els.recentPanel = document.querySelector('[data-role="recent-panel"]');
    els.recentList  = document.querySelector('[data-role="recent-list"]');
    els.pageDots    = document.querySelector('[data-role="page-dots"]');
  }

  /* ─────────────────────────────────────────
     i18n
  ───────────────────────────────────────── */
  function _t(key) {
    return window.LumiI18n ? window.LumiI18n.t(key) : key;
  }

  function _applyI18n() {
    if (window.LumiI18n) window.LumiI18n.apply(document);
  }


  /* ─────────────────────────────────────────
     Today View 렌더
  ───────────────────────────────────────── */
  function _renderToday() {
    _setText('[data-role="weather-desc"]', TODAY_STATE.weather.desc);
    _setText('[data-role="reservation-title"]', TODAY_STATE.reservation.title);
    _setText('[data-role="reservation-date"]', TODAY_STATE.reservation.date);
    _setText('[data-role="reservation-meta"]', TODAY_STATE.reservation.meta);
    var summaryEl = document.querySelector('[data-role="today-summary"]');
    if (summaryEl) {
      summaryEl.innerHTML = TODAY_STATE.summary.map(function (item) {
        return '<article class="mini-info"><span class="mini-icon-slot" aria-hidden="true"><img src="' + _escHtml(item.icon || '') + '" alt=""></span><div class="mini-info-copy"><span>' + _t(item.labelKey) + '</span><strong>' + _escHtml(item.value) + '</strong></div></article>';
      }).join('');
    }
  }

  function _formatEventTitle(title) {
    var parts = String(title || "").split(":");
    if (parts.length > 1) {
      var main = parts.shift().trim();
      var sub  = parts.join(":").trim();
      return _escHtml(main) + ' :<br>' + _escHtml(sub);
    }
    return _escHtml(title || "");
  }

  /* ─────────────────────────────────────────
     앱 그리드 렌더
  ───────────────────────────────────────── */
  function _renderAppGrids() {
    var mainEl = document.querySelector('[data-role="app-grid-main"]');
    var moreEl = document.querySelector('[data-role="app-grid-more"]');
    if (mainEl) mainEl.innerHTML = APP_REGISTRY.filter(function (a) { return a.group === "main"; }).map(_renderAppIcon).join("");
    if (moreEl) moreEl.innerHTML = APP_REGISTRY.filter(function (a) { return a.group === "more"; }).map(_renderAppIcon).join("");
  }

  function _renderAppIcon(app) {
    var badge = app.badge
      ? '<em class="app-badge">' + _escHtml(app.badge) + '</em>'
      : "";
    return (
      '<article class="app-icon">' +
        '<button type="button" class="app-button" data-app-id="' + app.id + '" style="--app-bg:' + app.color + '">' +
          '<span>' + _escHtml(app.iconText) + '</span>' + badge +
        '</button>' +
        '<p class="app-label">' + _t(app.labelKey) + '</p>' +
      '</article>'
    );
  }

  /* ─────────────────────────────────────────
     페이지 점
  ───────────────────────────────────────── */
  function _renderPageDots() {
    if (!els.pageDots) return;
    var count = els.screens ? els.screens.querySelectorAll(".screen-page").length : 2;
    els.pageDots.innerHTML = Array.from({ length: count }, function (_, i) { return i; }).map(function (i) {
      return '<span class="dot' + (i === state.currentPage ? " is-active" : "") + '"></span>';
    }).join("");
  }

  /* ─────────────────────────────────────────
     이벤트 바인딩
     data-app-id   → openApp
     data-dock-app → openApp
     data-action   → OS 동작 (home / back / recent / close-recent)
     홈 버튼은 data-action="home" 만 사용 (data-dock-app 없음)
  ───────────────────────────────────────── */
  function _bindEvents() {
    document.addEventListener("click", function (e) {
      /* 1. 앱 아이콘 (그리드 + 최근앱) */
      var appBtn = e.target.closest("[data-app-id]");
      if (appBtn) { openApp(appBtn.getAttribute("data-app-id")); return; }

      /* 2. 독 앱 버튼 */
      var dockBtn = e.target.closest("[data-dock-app]");
      if (dockBtn) { openApp(dockBtn.getAttribute("data-dock-app")); return; }

      /* 3. OS 액션 */
      var actionEl = e.target.closest("[data-action]");
      if (!actionEl) return;
      var action = actionEl.getAttribute("data-action");
      if (action === "home")         goHome();
      if (action === "back")         goBack();
      if (action === "recent")       _toggleRecentApps();
      if (action === "close-recent") _closeRecentApps();
    });

    if (els.screens) {
      els.screens.addEventListener("scroll", _syncPageFromScroll, { passive: true });
      _bindSwipeFallback();
    }
  }

  function _bindSwipeFallback() {
    if (!els.screens || els.screens.__lumiSwipeBound) return;
    els.screens.__lumiSwipeBound = true;

    var startX = 0;
    var startY = 0;
    var tracking = false;

    els.screens.addEventListener("touchstart", function (e) {
      if (!e.touches || e.touches.length !== 1) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      tracking = true;
    }, { passive: true });

    els.screens.addEventListener("touchend", function (e) {
      if (!tracking || !e.changedTouches || !e.changedTouches.length) return;
      tracking = false;

      var dx = e.changedTouches[0].clientX - startX;
      var dy = e.changedTouches[0].clientY - startY;

      if (Math.abs(dx) < 42 || Math.abs(dx) < Math.abs(dy) * 1.15) return;

      var next = state.currentPage + (dx < 0 ? 1 : -1);
      var pageCount = els.screens ? els.screens.querySelectorAll(".screen-page").length : 2;
      next = Math.max(0, Math.min(pageCount - 1, next));
      if (next !== state.currentPage) goToPage(next);
    }, { passive: true });
  }

  /* ─────────────────────────────────────────
     페이지 이동
  ───────────────────────────────────────── */
  function goToPage(index) {
    if (!els.screens) return;
    var pageCount = els.screens.querySelectorAll(".screen-page").length || 2;
    var next = Math.max(0, Math.min(pageCount - 1, index));
    state.currentPage = next;
    _renderPageDots();
    state._scrollLocked = true;
    els.screens.scrollTo({ left: els.screens.clientWidth * next, behavior: "smooth" });
    clearTimeout(state._scrollLockTimer);
    state._scrollLockTimer = setTimeout(function () {
      state._scrollLocked = false;
    }, 400);
  }

  function _syncPageFromScroll() {
    if (!els.screens || state._scrollLocked) return;
    clearTimeout(state._syncTimer);
    state._syncTimer = setTimeout(function () {
      if (state._scrollLocked) return;
      var next = Math.round(els.screens.scrollLeft / (els.screens.clientWidth || 1));
      if (next !== state.currentPage) {
        state.currentPage = next;
        _renderPageDots();
      }
    }, 150);
  }

  /* ─────────────────────────────────────────
     앱 열기
  ───────────────────────────────────────── */
  function openApp(appId) {
    var app = _getApp(appId);
    if (!app || !els.appWindow) return;

    if (!state.currentApp) {
      state.returnPage = state.currentPage;
    }

    state.currentApp = app.id;
    state.appStack   = [app.id];
    _addRecentApp(app.id);

    els.appTitle.textContent = _t(app.labelKey);
    els.appBody.innerHTML    = _renderAppBody(app);
    _applyI18n();

    els.appWindow.classList.add("is-open");
    els.appWindow.setAttribute("aria-hidden", "false");
    if (els.dock) els.dock.setAttribute("aria-hidden", "true");
    _bindActiveApp(app.id);
    _closeRecentApps();
  }

  function _bindActiveApp(appId) {
    if (!els.appBody || !window.LumiApps) return;

    if (appId === "ticket" && typeof window.LumiApps.bindTicket === "function") {
      window.LumiApps.bindTicket(els.appBody);
    }

    if (appId === "messages" && typeof window.LumiApps.bindMessages === "function") {
      window.LumiApps.bindMessages(els.appBody);
    }

    if (appId === "mail" && typeof window.LumiApps.bindMail === "function") {
      window.LumiApps.bindMail(els.appBody);
    }

    if (appId === "boothBank" && typeof window.LumiApps.bindBoothBank === "function") {
      window.LumiApps.bindBoothBank(els.appBody);
    }

    if (appId === "point" && typeof window.LumiApps.bindPoint === "function") {
      window.LumiApps.bindPoint(els.appBody);
    }
  
    if (appId === "stamp" && typeof window.LumiApps.bindStamp === "function") {
      window.LumiApps.bindStamp(els.appBody);
    }
  
    if (appId === "homeworkCheki" && typeof window.LumiApps.bindHomeworkCheki === "function") {
      window.LumiApps.bindHomeworkCheki(els.appBody);
    }
  
    if (appId === "timeline" && typeof window.LumiApps.bindTimeline === "function") {
      window.LumiApps.bindTimeline(els.appBody);
    }
  
    if (appId === "achievement" && typeof window.LumiApps.bindAchievement === "function") {
      window.LumiApps.bindAchievement(els.appBody);
    }
  }

  /**
   * 앱 렌더 라우터
   * renderer === "native"       → window.LumiApps[id](app, ctx)
   * renderer === "placeholder"  → window.LumiApps.placeholder(app, ctx)
   * renderer === "empty"        → 기본 빈 화면
   */
  function _renderAppBody(app) {
    var ctx = { t: _t, escHtml: _escHtml, openApp: openApp };

    if (app.renderer === "native") {
      if (window.LumiApps && typeof window.LumiApps[app.id] === "function") {
        return window.LumiApps[app.id](app, ctx);
      }
    }

    if (app.renderer === "placeholder") {
      if (window.LumiApps && typeof window.LumiApps.placeholder === "function") {
        return window.LumiApps.placeholder(app, ctx);
      }
    }

    return _renderEmptyBody(app);
  }

  function _renderEmptyBody(app) {
    return (
      '<section class="placeholder-app-card">' +
        '<div class="placeholder-orb">' + _escHtml(app.iconText) + '</div>' +
        '<h2>' + _t(app.labelKey) + '</h2>' +
        '<p>' + _t("empty." + app.id) + '</p>' +
      '</section>'
    );
  }

  /* ─────────────────────────────────────────
     홈 / 뒤로가기
  ───────────────────────────────────────── */
  function _closeAppWindow() {
    if (els.appWindow) {
      els.appWindow.classList.remove("is-open");
      els.appWindow.setAttribute("aria-hidden", "true");
    }
    if (els.dock) els.dock.setAttribute("aria-hidden", "false");
    state.currentApp = null;
    state.appStack   = [];
    _closeRecentApps();
  }

  function goHome() {
    _closeAppWindow();
    state.returnPage = 0;
    goToPage(0);
  }

  function goBack() {
    /* 앱 내 서브페이지 스택이 2개 이상이면 한 단계 위로 */
    if (state.appStack.length > 1) {
      state.appStack.pop();
      /* 추후: 서브페이지 라우팅 로직 추가 */
      return;
    }

    if (state.currentApp) {
      var page = Number.isInteger(state.returnPage) ? state.returnPage : state.currentPage;
      _closeAppWindow();
      goToPage(page);
      return;
    }

    goToPage(state.currentPage);
  }

  /* ─────────────────────────────────────────
     최근 앱
  ───────────────────────────────────────── */
  function _addRecentApp(appId) {
    state.recentApps = state.recentApps.filter(function (r) { return r.id !== appId; });
    state.recentApps.unshift({ id: appId, openedAt: _shortTime() });
    state.recentApps = state.recentApps.slice(0, 5);
  }

  function _toggleRecentApps() {
    if (!els.recentPanel) return;
    if (els.recentPanel.classList.contains("is-open")) {
      _closeRecentApps();
    } else {
      _openRecentApps();
    }
  }

  function _openRecentApps() {
    if (!els.recentPanel || !els.recentList) return;
    if (!state.recentApps.length) {
      els.recentList.innerHTML = '<div class="empty-state">' + _t("recent.empty") + '</div>';
    } else {
      els.recentList.innerHTML = state.recentApps.map(function (item) {
        var app = _getApp(item.id);
        return (
          '<button type="button" class="recent-card" data-app-id="' + item.id + '">' +
            '<span>' + _escHtml(app ? app.iconText : "?") + '</span>' +
            '<div>' +
              '<strong>' + (app ? _t(app.labelKey) : item.id) + '</strong>' +
              '<em>' + _escHtml(item.openedAt) + '</em>' +
            '</div>' +
          '</button>'
        );
      }).join("");
    }
    els.recentPanel.classList.add("is-open");
    els.recentPanel.setAttribute("aria-hidden", "false");
  }

  function _closeRecentApps() {
    if (!els.recentPanel) return;
    els.recentPanel.classList.remove("is-open");
    els.recentPanel.setAttribute("aria-hidden", "true");
  }

  /* ─────────────────────────────────────────
     유틸
  ───────────────────────────────────────── */
  function _getApp(appId) {
    return APP_REGISTRY.find(function (a) { return a.id === appId; });
  }

  function _setText(selector, value) {
    var el = document.querySelector(selector);
    if (el) el.textContent = value;
  }

  function _escHtml(value) {
    return String(value).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function _shortTime() {
    return new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false });
  }

  function _throttle(fn, wait) {
    var timer = null;
    return function () {
      if (timer) return;
      timer = setTimeout(function () { timer = null; fn(); }, wait);
    };
  }

  /* ─────────────────────────────────────────
     공개 API
  ───────────────────────────────────────── */
  return {
    init:     init,
    openApp:  openApp,
    goHome:   goHome,
    goBack:   goBack,
    goToPage: goToPage
  };

}());
