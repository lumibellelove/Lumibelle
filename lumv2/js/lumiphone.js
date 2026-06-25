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
    { id: "notification",  labelKey: "app.notification",   iconText: "알림",             group: "hidden", color: "#fff4f8", renderer: "native" },
    { id: "stamp",        labelKey: "app.stamp",         iconText: "스탬프",           group: "main", color: "#fff5f8", renderer: "native" },
    { id: "point",        labelKey: "app.point",         iconText: "포인트",           group: "main", color: "#fff2f6", renderer: "native" },
    { id: "homeworkCheki",labelKey: "app.homeworkCheki", iconText: "숙체",             group: "main", color: "#fdf5f7", renderer: "native" },
    { id: "mail",         labelKey: "app.mail",          iconText: "우편",             group: "main", color: "#fff7f4", renderer: "native" },
    { id: "timeline",     labelKey: "app.timeline",      iconText: "기록",             group: "main", color: "#fff5f8", renderer: "native" },

    { id: "boothBank",    labelKey: "app.boothBank",     iconText: "통장",             group: "more", color: "#fff4f7", renderer: "native" },
    { id: "achievement",  labelKey: "app.achievement",   iconText: "업적",             group: "more", color: "#fdf5f7", renderer: "native" },
    { id: "onair",        labelKey: "app.onair",         iconText: "ON",               group: "more", color: "#f5f6ff", renderer: "empty" },
    { id: "profile",      labelKey: "app.profile",       iconText: "MY",               group: "more", color: "#fff3f7", renderer: "empty" },
    { id: "lumitalk",     labelKey: "app.lumitalk",      iconText: "톡",               group: "more", color: "#fff3f8", renderer: "native" },
    { id: "lumilog",      labelKey: "app.lumilog",       iconText: "로그",             group: "more", color: "#f6fbf9", renderer: "empty" },
    { id: "exchange",     labelKey: "app.exchange",      iconText: "교환",             group: "more", color: "#fffaf1", renderer: "empty" },
    { id: "songbook",     labelKey: "app.songbook",      iconText: "노래",             group: "more", color: "#f7f3ff", renderer: "empty" },
    { id: "themeShop",    labelKey: "app.themeShop",     iconText: "테마",             group: "more", color: "#fff3f7", renderer: "placeholder" },
    { id: "settings",     labelKey: "app.settings",      iconText: "설정",             group: "more", color: "#f9f7fa", renderer: "native" },
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
    overviewIndex:    0,
    recentObserver:  null,
    recentCaptureTimer: null,
    currentPage:     1,
    returnPage:      1,
    backRoute:       null,
    appBackHandler:  null,
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
    els.dock             = document.querySelector('[data-role="dock"]');
    els.appOverview      = document.querySelector('[data-role="app-overview"]');
    els.appOverviewTrack = document.querySelector('[data-role="app-overview-track"]');
    els.pageDots         = document.querySelector('[data-role="page-dots"]');
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
      if (action === "recent")           _toggleRecentApps();
      if (action === "close-all-recent") _dismissAllRecentApps();
    });

    if (els.screens) {
      els.screens.addEventListener("scroll", _syncPageFromScroll, { passive: true });
      _bindSwipeFallback();
    }
    _bindRecentOverviewGestures();
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
  function openApp(appId, options) {
    var app = _getApp(appId);
    var openOptions = options || {};
    if (!app || !els.appWindow) return;

    if (state.currentApp && state.currentApp !== app.id) {
      _captureCurrentAppSnapshot();
    }

    if (!state.currentApp) {
      state.returnPage = state.currentPage;
    }

    if (openOptions.returnRoute) {
      state.backRoute = openOptions.returnRoute;
    } else if (!openOptions.keepBackRoute) {
      state.backRoute = null;
    }
    state.appBackHandler = null;

    state.currentApp = app.id;
    state.appStack   = [app.id];
    _addRecentApp(app.id);

    els.appTitle.textContent = _t(app.labelKey);
    els.appBody.innerHTML    = _renderAppBody(app);
    _applyI18n();

    /* 이전 앱 상세 화면의 전용 상태가 다음 앱까지 남지 않게 한다. */
    els.appWindow.classList.remove("is-message-detail-open");
    els.appWindow.classList.toggle("is-ticket-view", app.id === "ticket");
    els.appWindow.classList.toggle("is-notification-view", app.id === "notification");
    els.appWindow.classList.toggle("is-messages-view", app.id === "messages");
    els.appWindow.classList.toggle("is-settings-view", app.id === "settings");
    els.appWindow.classList.toggle("is-lumitalk-view", app.id === "lumitalk");
    els.appWindow.classList.add("is-open");
    els.appWindow.setAttribute("aria-hidden", "false");
    if (els.dock) els.dock.setAttribute("aria-hidden", "true");
    _bindActiveApp(app.id);
    _startRecentSnapshotTracking();
    _scheduleRecentSnapshot(30);
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

    if (appId === "notification" && typeof window.LumiApps.bindNotification === "function") {
      window.LumiApps.bindNotification(els.appBody);
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

    if (appId === "settings" && typeof window.LumiApps.bindSettings === "function") {
      window.LumiApps.bindSettings(els.appBody);
    }

    if (appId === "lumitalk" && typeof window.LumiApps.bindLumitalk === "function") {
      window.LumiApps.bindLumitalk(els.appBody);
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
  function _closeAppWindow(options) {
    var closeOptions = options || {};
    if (els.appWindow) {
      els.appWindow.classList.remove("is-open", "is-ticket-view", "is-notification-view", "is-messages-view", "is-settings-view", "is-lumitalk-view", "is-message-detail-open");
      els.appWindow.setAttribute("aria-hidden", "true");
    }
    if (els.dock) els.dock.setAttribute("aria-hidden", "false");
    _stopRecentSnapshotTracking();
    state.currentApp = null;
    state.appStack   = [];
    state.backRoute  = null;
    state.appBackHandler = null;
    if (!closeOptions.keepOverview) _closeRecentApps();
  }

  function goHome() {
    _closeAppWindow();
    state.returnPage = 0;
    goToPage(0);
  }

  function goBack() {
    /* 문자에서 티켓 상세로 이동한 경우, 티켓함 첫 화면이 아니라 원래 문자방으로 복귀한다. */
    if (state.backRoute) {
      var route = state.backRoute;
      state.backRoute = null;
      openApp(route.appId, { keepBackRoute: true });
      if (route.appId === "messages" && window.LumiApps && typeof window.LumiApps.restoreMessagesRoute === "function") {
        window.LumiApps.restoreMessagesRoute(els.appBody, route.payload || {});
      }
      return;
    }

    if (typeof state.appBackHandler === 'function' && state.appBackHandler() === true) {
      return;
    }

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
     최근 앱 · 시스템 탭 보기
     - 가장 최근(방금 보던) 앱을 중앙에서 시작한다.
     - 이전 앱으로 이동하면 기존 중앙 카드는 오른쪽 뒤 스택으로 남는다.
     - 각 카드는 마지막으로 보던 실제 앱 DOM 스냅샷을 사용한다.
  ───────────────────────────────────────── */
  function _addRecentApp(appId) {
    var existing = state.recentApps.find(function (item) { return item.id === appId; });
    state.recentApps = state.recentApps.filter(function (item) { return item.id !== appId; });
    state.recentApps.unshift(existing || { id: appId, snapshot: "" });
    state.recentApps = state.recentApps.slice(0, 5);
  }

  function _captureCurrentAppSnapshot() {
    if (!state.currentApp || !els.appWindow) return;
    var recent = state.recentApps.find(function (item) { return item.id === state.currentApp; });
    if (!recent) return;

    var clone = els.appWindow.cloneNode(true);
    clone.classList.add("app-overview-snapshot-window", "is-open");
    clone.setAttribute("aria-hidden", "true");
    var nestedOverview = clone.querySelector('[data-role="app-overview"]');
    if (nestedOverview) nestedOverview.remove();
    clone.querySelectorAll("[data-action], [data-app-id], [data-dock-app]").forEach(function (node) {
      node.removeAttribute("data-action");
      node.removeAttribute("data-app-id");
      node.removeAttribute("data-dock-app");
    });
    recent.snapshot = clone.outerHTML;
  }

  function _scheduleRecentSnapshot(delay) {
    if (!state.currentApp) return;
    if (state.recentCaptureTimer) {
      clearTimeout(state.recentCaptureTimer);
      state.recentCaptureTimer = null;
    }
    state.recentCaptureTimer = window.setTimeout(function () {
      state.recentCaptureTimer = null;
      _captureCurrentAppSnapshot();
    }, typeof delay === "number" ? delay : 60);
  }

  function _stopRecentSnapshotTracking() {
    if (state.recentObserver) {
      state.recentObserver.disconnect();
      state.recentObserver = null;
    }
    if (state.recentCaptureTimer) {
      clearTimeout(state.recentCaptureTimer);
      state.recentCaptureTimer = null;
    }
    if (els.appBody && els.appBody.__recentSnapshotHandler) {
      ["click", "input", "change", "keyup"].forEach(function (eventName) {
        els.appBody.removeEventListener(eventName, els.appBody.__recentSnapshotHandler, true);
      });
      els.appBody.removeEventListener("scroll", els.appBody.__recentSnapshotScrollHandler, true);
      delete els.appBody.__recentSnapshotHandler;
      delete els.appBody.__recentSnapshotScrollHandler;
    }
  }

  function _startRecentSnapshotTracking() {
    if (!els.appBody) return;
    _stopRecentSnapshotTracking();

    var schedule = _throttle(function () { _scheduleRecentSnapshot(20); }, 80);
    els.appBody.__recentSnapshotHandler = schedule;
    els.appBody.__recentSnapshotScrollHandler = _throttle(function () { _scheduleRecentSnapshot(30); }, 120);

    ["click", "input", "change", "keyup"].forEach(function (eventName) {
      els.appBody.addEventListener(eventName, schedule, true);
    });
    els.appBody.addEventListener("scroll", els.appBody.__recentSnapshotScrollHandler, true);

    if (window.MutationObserver) {
      state.recentObserver = new MutationObserver(_throttle(function () {
        _scheduleRecentSnapshot(24);
      }, 100));
      state.recentObserver.observe(els.appBody, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: false,
        attributeFilter: ["class", "style", "aria-hidden", "hidden", "value", "src"]
      });
    }

    _scheduleRecentSnapshot(40);
  }

  function _toggleRecentApps() {
    if (!els.appOverview) return;
    if (els.appOverview.classList.contains("is-open")) _closeRecentApps();
    else _openRecentApps();
  }

  function _openRecentApps() {
    if (!els.appOverview || !els.appOverviewTrack) return;
    _captureCurrentAppSnapshot();
    state.overviewIndex = 0;
    _renderRecentApps();
    els.appOverview.classList.add("is-open");
    els.appOverview.setAttribute("aria-hidden", "false");
  }

  function _recentCardTransform(index, dragX, dragY) {
    var distance = state.overviewIndex - index;
    var step = Math.min(Math.abs(distance), 4);
    var x = distance * 172 + (dragX || 0);
    var y = distance === 0 ? (dragY || 0) : -8 * step;
    var scale = distance === 0 ? 1 : Math.max(.82, 1 - (.055 * step));
    var opacity = step > 3 ? .56 : 1;
    var zIndex = distance === 0 ? 100 : 80 - step;
    return { x: x, y: y, scale: scale, opacity: opacity, zIndex: zIndex };
  }

  function _applyRecentCardPositions(dragX, dragY) {
    if (!els.appOverviewTrack) return;
    els.appOverviewTrack.querySelectorAll('[data-recent-card]').forEach(function (card, index) {
      var p = _recentCardTransform(index, dragX, dragY);
      card.style.setProperty('--recent-x', p.x + 'px');
      card.style.setProperty('--recent-y', p.y + 'px');
      card.style.setProperty('--recent-scale', String(p.scale));
      card.style.opacity = String(p.opacity);
      card.style.zIndex = String(p.zIndex);
    });
  }

  function _renderRecentApps() {
    if (!els.appOverviewTrack) return;
    if (!state.recentApps.length) {
      els.appOverviewTrack.innerHTML = '<div class="app-overview-empty">열려 있는 앱이 없어요</div>';
      return;
    }

    els.appOverviewTrack.innerHTML = state.recentApps.map(function (item) {
      var app = _getApp(item.id);
      var label = app ? _t(app.labelKey) : item.id;
      var snapshot = item.snapshot;
      if (!snapshot && app) {
        snapshot = '<section class="app-window app-overview-snapshot-window is-open" aria-hidden="true"><header class="app-header"><div class="app-header__row"><button class="app-back" type="button" aria-label="뒤로">←</button><div class="app-title" data-role="app-title">' + _escHtml(_t(app.labelKey)) + '</div><span class="app-header__spacer"></span></div></header><div class="app-body" data-role="app-body">' + _renderAppBody(app) + '</div></section>';
      }
      snapshot = snapshot || '<div class="app-overview-fallback">' + _escHtml(app ? app.iconText : "?") + '</div>';
      return '<article class="app-overview-card" data-recent-card data-app-id="' + _escHtml(item.id) + '" aria-label="' + _escHtml(label) + ' 열기"><div class="app-overview-snapshot" aria-hidden="true">' + snapshot + '</div></article>';
    }).join("");
    _applyRecentCardPositions(0, 0);
  }

  function _restoreRecentApp(appId, options) {
    var restoreOptions = options || {};
    var recent = state.recentApps.find(function (item) { return item.id === appId; });
    if (!recent || !recent.snapshot || !els.appWindow || !els.appBody) {
      openApp(appId);
      return;
    }

    var holder = document.createElement('div');
    holder.innerHTML = recent.snapshot;
    var snapshotWindow = holder.firstElementChild;
    var snapshotHeader = snapshotWindow && snapshotWindow.querySelector('[data-role="app-title"]');
    var snapshotBody = snapshotWindow && snapshotWindow.querySelector('[data-role="app-body"]');
    if (!snapshotWindow || !snapshotBody) {
      openApp(appId);
      return;
    }

    state.currentApp = appId;
    state.appStack = [appId];
    state.backRoute = null;
    state.appBackHandler = null;
    if (!restoreOptions.preserveRecentOrder) _addRecentApp(appId);
    els.appWindow.className = snapshotWindow.className;
    /* 최근 앱 카드용 축소 클래스는 실제 앱 창에 남기면 하단 시스템 네비가 숨는다. */
    els.appWindow.classList.remove('app-overview-snapshot-window');
    els.appWindow.classList.add('is-open');
    els.appWindow.setAttribute('aria-hidden', 'false');
    if (snapshotHeader) els.appTitle.textContent = snapshotHeader.textContent;
    els.appBody.innerHTML = snapshotBody.innerHTML;
    if (els.dock) els.dock.setAttribute('aria-hidden', 'true');
    _bindActiveApp(appId);
    _startRecentSnapshotTracking();
    _scheduleRecentSnapshot(30);
    if (!restoreOptions.keepOverview) _closeRecentApps();
  }

  function _dismissRecentApp(appId) {
    var wasCurrent = state.currentApp === appId;

    /* 카드 하나만 recentApps에서 제거한다. 다른 앱의 스냅샷/스크롤은 그대로 둔다. */
    state.recentApps = state.recentApps.filter(function (item) { return item.id !== appId; });

    /* 마지막 카드까지 닫힌 경우에만 탭보기를 종료하고 홈으로 돌아간다. */
    if (!state.recentApps.length) {
      _closeAppWindow({ keepOverview: true });
      _closeRecentApps();
      state.returnPage = 0;
      goToPage(0);
      return;
    }

    /* 제거된 자리에 남은 다음 카드를 중앙으로 둔다. */
    state.overviewIndex = Math.max(0, Math.min(state.overviewIndex, state.recentApps.length - 1));
    var nextItem = state.recentApps[state.overviewIndex];

    /* 현재 보고 있던 앱을 닫았을 때는, 탭보기 뒤 배경도 다음 카드의 마지막 화면으로 교체한다.
       탭보기는 닫지 않고 그대로 유지한다. */
    if (wasCurrent && nextItem) {
      _restoreRecentApp(nextItem.id, { keepOverview: true, preserveRecentOrder: true });
    }

    _renderRecentApps();
    if (els.appOverview) {
      els.appOverview.classList.add('is-open');
      els.appOverview.setAttribute('aria-hidden', 'false');
    }
  }

  function _dismissAllRecentApps() {
    state.recentApps = [];
    state.overviewIndex = 0;
    _closeAppWindow({ keepOverview: true });
    _closeRecentApps();
    state.returnPage = 0;
    goToPage(0);
  }

  function _closeRecentApps() {
    if (!els.appOverview) return;
    els.appOverview.classList.remove("is-open");
    els.appOverview.setAttribute("aria-hidden", "true");
  }

  function _bindRecentOverviewGestures() {
    if (!els.appOverview || els.appOverview.__recentBound) return;
    els.appOverview.__recentBound = true;

    var drag = null;
    var ignoreClickUntil = 0;

    function getCurrentCard() {
      return els.appOverviewTrack && els.appOverviewTrack.querySelectorAll('[data-recent-card]')[state.overviewIndex];
    }

    els.appOverview.addEventListener('pointerdown', function (e) {
      var card = e.target.closest('[data-recent-card]');
      if (!card || card !== getCurrentCard()) return;
      drag = { card: card, startX: e.clientX, startY: e.clientY, type: null, moved: false };
      if (card.setPointerCapture) card.setPointerCapture(e.pointerId);
    });

    els.appOverview.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.startX;
      var dy = e.clientY - drag.startY;
      if (!drag.type) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 14) return;
        drag.moved = true;
        drag.type = Math.abs(dy) > Math.abs(dx) && dy < 0 ? 'dismiss' : 'horizontal';
        drag.card.classList.add('is-dragging');
      }
      e.preventDefault();
      if (drag.type === 'dismiss') {
        _applyRecentCardPositions(0, Math.min(0, dy));
        drag.card.style.opacity = String(Math.max(.12, 1 + Math.min(0, dy) / 300));
      } else {
        _applyRecentCardPositions(dx, 0);
      }
    });

    function finishDrag(e) {
      if (!drag) return;
      var active = drag;
      drag = null;
      var dx = e.clientX - active.startX;
      var dy = e.clientY - active.startY;
      active.card.classList.remove('is-dragging');
      if (active.moved) ignoreClickUntil = Date.now() + 350;

      if (active.type === 'dismiss' && dy < -170) {
        active.card.classList.add('is-dismissing');
        active.card.style.setProperty('--recent-y', '-110%');
        active.card.style.opacity = '0';
        window.setTimeout(function () { _dismissRecentApp(active.card.getAttribute('data-app-id')); }, 190);
        return;
      }

      if (active.type === 'horizontal' && Math.abs(dx) > 62) {
        /* 오른쪽으로 넘기면 이전에 열었던 앱이 중앙으로, 현재 카드는 오른쪽 뒤에 남는다. */
        if (dx > 0 && state.overviewIndex < state.recentApps.length - 1) state.overviewIndex += 1;
        if (dx < 0 && state.overviewIndex > 0) state.overviewIndex -= 1;
      }
      _applyRecentCardPositions(0, 0);
    }

    els.appOverview.addEventListener('pointerup', finishDrag);
    els.appOverview.addEventListener('pointercancel', finishDrag);

    els.appOverview.addEventListener('click', function (e) {
      var card = e.target.closest('[data-recent-card]');
      if (e.target.closest('[data-action="close-all-recent"]')) return;
      if (!card) {
        _closeRecentApps();
        return;
      }
      if (Date.now() < ignoreClickUntil) return;
      var current = getCurrentCard();
      if (card === current) _restoreRecentApp(card.getAttribute('data-app-id'));
    });
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

  function setAppBackHandler(handler) {
    state.appBackHandler = typeof handler === 'function' ? handler : null;
  }

  function setAppBadge(appId, value) {
    var app = _getApp(appId);
    if (!app) return;
    var next = value === null || value === undefined || value === "" || Number(value) === 0 ? "" : String(value);
    if (app.badge === next) return;
    app.badge = next;
    _renderAppGrids();
  }

  /* ─────────────────────────────────────────
     공개 API
  ───────────────────────────────────────── */
  return {
    init:     init,
    openApp:  openApp,
    goHome:   goHome,
    goBack:   goBack,
    goToPage: goToPage,
    setAppBackHandler: setAppBackHandler,
    setAppBadge: setAppBadge
  };

}());
