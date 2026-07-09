/**
 * staff-os.js — 루미벨 스탭 OS 본체
 *
 * 규칙:
 *   - 앱 내부 UI 로직은 여기 넣지 않음 (js/apps/*.js 담당)
 *   - 앱끼리 직접 호출 금지. 반드시 LumiPhone.openApp() 경유
 *   - TODAY_STATE = 더미 데이터. 실제 API 연결 시 이 블록만 교체
 *   - 새 앱 추가: APP_REGISTRY 항목 추가 + js/apps/{id}.js 생성
 *
 * 공개 API: LumiPhone.init / openApp / goHome / goBack / goToPage
 */

window.StaffOS = (function () {

  /* ─────────────────────────────────────────
     앱 레지스트리
     renderer:
       "empty"       — 빈 화면 (개발 전)
       "placeholder" — placeholder-apps.js 담당
       "native"      — js/apps/{id}.js 담당 (추후)
  ───────────────────────────────────────── */
  var APP_REGISTRY = [
    { id: "gate",       labelKey: "app.gate",       iconText: "입장", group: "main", color: "#fff7fb", renderer: "native" },
    { id: "fanCheck",   labelKey: "app.fanCheck",   iconText: "팬",   group: "main", color: "#fff7fb", renderer: "native" },
    { id: "digitalBenefit", labelKey: "app.digitalBenefit", iconText: "디특", group: "main", color: "#fff7fb", renderer: "native" },
    { id: "timer",      labelKey: "app.timer",      iconText: "타",   group: "main", color: "#fff7fb", renderer: "native" },
    { id: "point",      labelKey: "app.point",      iconText: "P",    group: "main", color: "#fff7fb", renderer: "native" },
    { id: "pointAdjust",labelKey: "app.pointAdjust",iconText: "정정", group: "main", color: "#fff7fb", renderer: "native" }
  ];  /* ─────────────────────────────────────────
     Today 더미 데이터
     실제 API 붙이면 이 블록만 교체
  ───────────────────────────────────────── */
  var TODAY_STATE = {
    weather:     { temp: "21°C", desc: "공연장 날씨 기준" },
    reservation: { title: "루미벨 데뷔 라이브", meta: "KT&G 상상마당", status: "입장 준비 중" },
    dday:        { label: "MY MODE", value: "ALL", unit: "운영" },
    summary: [
      { labelKey: "today.summary.entered",   value: "87", unit: "명" },
      { labelKey: "today.summary.queue",     value: "52", unit: "명" },
      { labelKey: "today.summary.completed", value: "43", unit: "건" },
      { labelKey: "today.summary.attendance",value: "12", unit: "명" }
    ],
    onair: { status: "입장 준비 · 특전회 대기", badge: "FIELD" }
  };

  /* ─────────────────────────────────────────
     OS 상태
  ───────────────────────────────────────── */
  var state = {
    currentApp:      null,
    currentRecentId: null,
    appStack:        [],
    recentApps:      [],
    overviewIndex:   0,
    recentObserver:  null,
    recentCaptureTimer: null,
    currentPage:     0,
    returnPage:      0,
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
    _renderDashboardSummary();
    _renderAppGrids();
    _bindEvents();
    _bindHomeSummaryEvents();
    _applyI18n();
    _updateClock();
    setInterval(_updateClock, 30000);
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
     시계 — "FRI · MAY" 포맷 고정
  ───────────────────────────────────────── */
  function _updateClock() {
    var now      = new Date();
    var timeText = now.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false });
    var weekday  = now.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
    var month    = now.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
    var dateText = weekday + " · " + month;

    document.querySelectorAll('[data-role="status-time"], [data-role="clock-time"]').forEach(function (el) {
      el.textContent = timeText;
    });
    var dateEl = document.querySelector('[data-role="clock-date"]');
    if (dateEl) dateEl.textContent = dateText;
  }

  /* ─────────────────────────────────────────
     Today View 렌더
  ───────────────────────────────────────── */
  function _renderToday() {
    _setText('[data-role="weather-temp"]', TODAY_STATE.weather.temp);
    _setText('[data-role="weather-desc"]', TODAY_STATE.weather.desc);
    _setText('[data-role="reservation-title"]', TODAY_STATE.reservation.title);
    _setText('[data-role="reservation-date"]', 'OPEN 17:30 · START 18:00');
    _setText('[data-role="reservation-meta"]', 'KT&G 상상마당');
    _setText('[data-role="reservation-status"]', TODAY_STATE.reservation.status);
    _renderDashboardSummary();
    _renderQueueHomeStatus();
  }

  /* ─────────────────────────────────────────
     홈 실시간 요약
     - 홈은 읽기 전용이며, 각 앱이 가진 실제 상태를 계산해서 표시한다.
     - 배치 인원은 총괄 운영 앱이 생긴 뒤 `출석 n/전체`로 확장한다.
  ───────────────────────────────────────── */
  function _renderDashboardSummary() {
    var summary = _getDashboardSummary();
    var icons = [
      'assets/icons/message-envelope.webp',
      'assets/icons/stamp.webp',
      'assets/icons/point-heart.webp',
      'assets/icons/homework-cheki.webp'
    ];
    var items = [
      { label: '입장', value: summary.entered.value, unit: summary.entered.unit },
      { label: '대기', value: summary.queue.value, unit: summary.queue.unit },
      { label: '완료', value: summary.completed.value, unit: summary.completed.unit },
      { label: '출석', value: summary.attendance.value, unit: summary.attendance.unit }
    ];
    var el = document.querySelector('[data-role="today-summary"]');
    if (!el) return;
    el.innerHTML = items.map(function (item, index) {
      return '<article class="mini-info">' +
        '<span class="mini-icon-slot"><img src="' + icons[index] + '" alt="" /></span>' +
        '<span class="mini-info-copy"><span>' + item.label + '</span><strong>' + _escHtml(item.value) + _escHtml(item.unit) + '</strong></span>' +
      '</article>';
    }).join('');
  }

  function _renderQueueHomeStatus() {
    var title = document.querySelector('[data-role="queue-home-title"]');
    var copy = document.querySelector('[data-role="queue-home-copy"]');
    var status = document.querySelector('[data-role="queue-home-status"]');
    if (!title || !copy || !status || !window.QueueStore || typeof window.QueueStore.read !== 'function') return;

    var data = window.QueueStore.read();
    var registration = data.registration || {};
    var phase = registration.phase || 'auto_wait';
    var next = { title: '현재 준비 중이에요!', copy: '사전 접수 시작 전이에요. 설정된 시간에 자동으로 접수가 열립니다.', status: '준비 중' };

    if (data.started) {
      next = { title: '특전회가 진행 중이에요!', copy: '현재 호출과 멤버별 대기 현황을 확인할 수 있어요.', status: '진행 중' };
    } else if (phase === 'open') {
      next = { title: '사전 접수 진행 중이에요!', copy: '팬이 현재 특전회 대기를 신청할 수 있어요.', status: '접수 중' };
    } else if (phase === 'paused') {
      next = { title: '새 접수를 잠시 멈췄어요.', copy: '기존 대기는 유지되며 새 신청만 잠시 받지 않고 있어요.', status: '일시정지' };
    } else if (phase === 'held') {
      next = { title: '자동 오픈이 보류되었어요.', copy: '현장 상황을 확인한 뒤 사전 접수를 열어주세요.', status: '보류' };
    } else if (phase === 'closed') {
      next = { title: '최종 접수가 완료되었어요!', copy: '대기 현황을 확인한 뒤 특전회를 시작해주세요.', status: '시작 대기' };
    }

    title.textContent = next.title;
    copy.textContent = next.copy;
    status.textContent = next.status;
  }

  function _getDashboardSummary() {
    var entered = 0;
    var attendance = 0;
    var queue = 0;
    var completed = 0;

    if (window.GateHomeStore && typeof window.GateHomeStore.getEnteredCount === 'function') {
      entered = Number(window.GateHomeStore.getEnteredCount() || 0);
    }
    if (window.QueueStore && typeof window.QueueStore.read === 'function') {
      var queueData = window.QueueStore.read();
      var rows = Array.isArray(queueData.queues) ? queueData.queues : [];
      queue = rows.filter(function (row) {
        return row.status === '대기중' || row.status === '호출중' || row.status === '진행중';
      }).length;
      completed = Number(queueData.completedCount || 0);
    }
    if (window.StaffAttendanceStore && typeof window.StaffAttendanceStore.getCheckedInCount === 'function') {
      attendance = Number(window.StaffAttendanceStore.getCheckedInCount() || 0);
    }

    return {
      entered: { value: String(entered), unit: '명' },
      queue: { value: String(queue), unit: '명' },
      completed: { value: String(completed), unit: '건' },
      attendance: { value: String(attendance), unit: '명' }
    };
  }

  function _bindHomeSummaryEvents() {
    ['lumibelle:queuechange', 'lumibelle:gatechange', 'lumibelle:attendancechange'].forEach(function (name) {
      window.addEventListener(name, function () { _renderDashboardSummary(); _renderQueueHomeStatus(); });
    });
    window.addEventListener('storage', function (event) {
      if (!event || !event.key) return;
      if (event.key.indexOf('lumibelle_staff_') === 0 || event.key.indexOf('lumibelle_gate_') === 0) {
        _renderDashboardSummary();
        _renderQueueHomeStatus();
      }
    });
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
    els.pageDots.innerHTML = [0, 1, 2].map(function (i) {
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
      /* 0. 홈 특전회 바로가기: 접수 운영 / 대기열 현황을 명확히 분리한다. */
      var queueRoute = e.target.closest("[data-queue-home-route]");
      if (queueRoute) {
        window.__lumibelleQueueView = queueRoute.getAttribute("data-queue-home-route") || "management";
        openApp("queue");
        return;
      }

      /* 1. 앱 아이콘 (그리드 + 최근앱) */
      var appBtn = e.target.closest("[data-app-id]");
      if (appBtn) {
        var appId = appBtn.getAttribute("data-app-id");
        if (appId === "queue") window.__lumibelleQueueView = "management";
        openApp(appId);
        return;
      }

      /* 2. 독 앱 버튼 */
      var dockBtn = e.target.closest("[data-dock-app]");
      if (dockBtn) {
        var dockAppId = dockBtn.getAttribute("data-dock-app");
        if (dockAppId === "queue") window.__lumibelleQueueView = "management";
        openApp(dockAppId);
        return;
      }

      /* 3. OS 액션 */
      var actionEl = e.target.closest("[data-action]");
      if (!actionEl) return;
      var action = actionEl.getAttribute("data-action");
      if (action === "home")             goHome();
      if (action === "more")             goToPage(1);
      if (action === "back")             goBack();
      if (action === "recent")           _toggleRecentApps();
      if (action === "close-recent")     _closeRecentApps();
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
      next = Math.max(0, Math.min(2, next));
      if (next !== state.currentPage) goToPage(next);
    }, { passive: true });
  }

  /* ─────────────────────────────────────────
     페이지 이동
  ───────────────────────────────────────── */
  function goToPage(index) {
    if (!els.screens) return;
    var pageCount = els.screens.querySelectorAll(".screen-page").length || 3;
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
  function _applyAppWindowState(appId) {
    if (!els.appWindow) return;
    els.appWindow.classList.remove("is-attendance-app", "is-gate-app", "is-point-app", "is-caution-app", "is-queue-app", "is-cheki-app", "is-timer-app", "is-fan-check-app", "is-point-adjust-app", "is-digital-benefit-app", "is-homework-cheki-app", "is-guide-app", "is-memo-app", "is-memo-room", "app-overview-snapshot-window");
    els.appWindow.setAttribute("data-current-app", appId);
    if (appId === "attendance" || appId === "staffAttendance") els.appWindow.classList.add("is-attendance-app");
    if (appId === "gate") els.appWindow.classList.add("is-gate-app");
    if (appId === "point") els.appWindow.classList.add("is-point-app");
    if (appId === "caution") els.appWindow.classList.add("is-caution-app");
    if (appId === "queue") els.appWindow.classList.add("is-queue-app");
    if (appId === "cheki") els.appWindow.classList.add("is-cheki-app");
    if (appId === "timer") els.appWindow.classList.add("is-timer-app");
    if (appId === "fanCheck") els.appWindow.classList.add("is-fan-check-app");
    if (appId === "pointAdjust") els.appWindow.classList.add("is-point-adjust-app");
    if (appId === "digitalBenefit") els.appWindow.classList.add("is-digital-benefit-app");
    if (appId === "homeworkCheki") els.appWindow.classList.add("is-homework-cheki-app");
    if (appId === "booth") els.appWindow.classList.add("is-guide-app");
    if (appId === "memo") els.appWindow.classList.add("is-memo-app");
  }

  function _mountApp(appId) {
    if (!els.appBody || !window.LumiApps) return;
    if (appId === "point" && typeof window.LumiApps.mountPoint === "function") window.LumiApps.mountPoint(els.appBody);
    if (appId === "booth" && typeof window.LumiApps.mountBooth === "function") window.LumiApps.mountBooth(els.appBody, { openApp: openApp });
    if (appId === "memo" && typeof window.LumiApps.mountMemo === "function") window.LumiApps.mountMemo(els.appBody, { openApp: openApp });
  }

  function _getRecentIdentity(appId) {
    if (appId === "queue") {
      var route = window.__lumibelleQueueView || "management";
      return "queue:" + (route === "overview" ? "overview" : "management");
    }
    return appId;
  }

  function _getRecentRoute(appId) {
    if (appId !== "queue") return "";
    return (window.__lumibelleQueueView || "management") === "overview" ? "overview" : "management";
  }

  function openApp(appId) {
    var app = _getApp(appId);
    if (!app || !els.appWindow) return;

    var nextRecentId = _getRecentIdentity(app.id);
    var nextRoute = _getRecentRoute(app.id);
    if (state.currentApp && (state.currentApp !== app.id || state.currentRecentId !== nextRecentId)) _captureCurrentAppSnapshot();
    if (!state.currentApp) state.returnPage = state.currentPage;

    state.currentApp = app.id;
    state.currentRecentId = nextRecentId;
    state.appStack = [app.id];
    _addRecentApp(app.id, nextRecentId, nextRoute);

    els.appWindow.setAttribute("data-current-app", app.id);
    els.appTitle.textContent = _t(app.labelKey);
    els.appBody.innerHTML = _renderAppBody(app);
    _applyI18n();
    _applyAppWindowState(app.id);
    _mountApp(app.id);

    els.appWindow.classList.add("is-open");
    els.appWindow.setAttribute("aria-hidden", "false");
    if (els.dock) {
      els.dock.classList.remove("is-visible-over-memo");
      els.dock.setAttribute("aria-hidden", "true");
    }
    _startRecentSnapshotTracking();
    _scheduleRecentSnapshot(45);
    _closeRecentApps();
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
    _stopRecentSnapshotTracking();
    if (els.appWindow) {
      els.appWindow.classList.remove("is-open", "is-attendance-app", "is-gate-app", "is-point-app", "is-caution-app", "is-queue-app", "is-cheki-app", "is-timer-app", "is-fan-check-app", "is-point-adjust-app", "is-digital-benefit-app", "is-homework-cheki-app", "is-guide-app", "is-memo-app", "is-memo-room", "app-overview-snapshot-window");
      els.appWindow.removeAttribute("data-current-app");
      els.appWindow.setAttribute("aria-hidden", "true");
    }
    if (els.dock) {
      els.dock.classList.remove("is-visible-over-memo");
      els.dock.setAttribute("aria-hidden", "false");
    }
    state.currentApp = null;
    state.currentRecentId = null;
    state.appStack = [];
    if (!closeOptions.keepOverview) _closeRecentApps();
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
     최근 앱 · 시스템 탭 보기
  ───────────────────────────────────────── */
  function _addRecentApp(appId, recentId, route) {
    var key = recentId || appId;
    var existing = state.recentApps.find(function (item) { return item.id === key; });
    state.recentApps = state.recentApps.filter(function (item) { return item.id !== key; });
    var entry = existing || { id: key, appId: appId, route: route || "", snapshot: "", scrollTop: 0 };
    entry.appId = appId;
    entry.route = route || entry.route || "";
    state.recentApps.unshift(entry);
    state.recentApps = state.recentApps.slice(0, 5);
  }

  function _captureCurrentAppSnapshot() {
    if (!state.currentApp || !state.currentRecentId || !els.appWindow) return;
    var recent = state.recentApps.find(function (item) { return item.id === state.currentRecentId; });
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
    recent.scrollTop = els.appBody ? els.appBody.scrollTop : 0;
  }

  function _scheduleRecentSnapshot(delay) {
    if (!state.currentApp) return;
    if (state.recentCaptureTimer) clearTimeout(state.recentCaptureTimer);
    state.recentCaptureTimer = window.setTimeout(function () {
      state.recentCaptureTimer = null;
      _captureCurrentAppSnapshot();
    }, typeof delay === "number" ? delay : 60);
  }

  function _stopRecentSnapshotTracking() {
    if (state.recentObserver) { state.recentObserver.disconnect(); state.recentObserver = null; }
    if (state.recentCaptureTimer) { clearTimeout(state.recentCaptureTimer); state.recentCaptureTimer = null; }
    if (els.appBody && els.appBody.__recentSnapshotHandler) {
      ["click", "input", "change", "keyup"].forEach(function (eventName) { els.appBody.removeEventListener(eventName, els.appBody.__recentSnapshotHandler, true); });
      els.appBody.removeEventListener("scroll", els.appBody.__recentSnapshotScrollHandler, true);
      delete els.appBody.__recentSnapshotHandler;
      delete els.appBody.__recentSnapshotScrollHandler;
    }
  }

  function _startRecentSnapshotTracking() {
    if (!els.appBody) return;
    _stopRecentSnapshotTracking();
    var schedule = _throttle(function () { _scheduleRecentSnapshot(24); }, 90);
    els.appBody.__recentSnapshotHandler = schedule;
    els.appBody.__recentSnapshotScrollHandler = _throttle(function () { _scheduleRecentSnapshot(30); }, 120);
    ["click", "input", "change", "keyup"].forEach(function (eventName) { els.appBody.addEventListener(eventName, schedule, true); });
    els.appBody.addEventListener("scroll", els.appBody.__recentSnapshotScrollHandler, true);
    if (window.MutationObserver) {
      state.recentObserver = new MutationObserver(_throttle(function () { _scheduleRecentSnapshot(24); }, 100));
      state.recentObserver.observe(els.appBody, { childList: true, subtree: true, attributes: true, characterData: false, attributeFilter: ["class", "style", "aria-hidden", "hidden", "value", "src"] });
    }
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

  function _makeFallbackSnapshot(app, route) {
    var previousRoute = window.__lumibelleQueueView;
    if (app.id === "queue" && route) window.__lumibelleQueueView = route;
    var body = _renderAppBody(app);
    if (app.id === "queue") window.__lumibelleQueueView = previousRoute;
    return '<section class="app-window app-overview-snapshot-window is-open" aria-hidden="true"><header class="app-header"><strong data-role="app-title">' + _escHtml(_t(app.labelKey)) + '</strong></header><div class="app-body" data-role="app-body">' + body + '</div></section>';
  }

  function _getRecentLabel(item, app) {
    if (item && item.appId === "queue") return item.route === "overview" ? "대기 현황" : "특전회 대기";
    return app ? _t(app.labelKey) : (item ? item.id : "");
  }

  function _renderRecentApps() {
    if (!els.appOverviewTrack) return;
    if (!state.recentApps.length) { els.appOverviewTrack.innerHTML = '<div class="app-overview-empty">열려 있는 앱이 없어요</div>'; return; }
    els.appOverviewTrack.innerHTML = state.recentApps.map(function (item) {
      var app = _getApp(item.appId || item.id);
      var label = _getRecentLabel(item, app);
      var snapshot = item.snapshot || (app ? _makeFallbackSnapshot(app, item.route) : '<div class="app-overview-fallback">?</div>');
      return '<article class="app-overview-card" data-recent-card data-app-id="' + _escHtml(item.id) + '" aria-label="' + _escHtml(label) + ' 열기"><div class="app-overview-snapshot" aria-hidden="true">' + snapshot + '</div></article>';
    }).join("");
    _applyRecentCardPositions(0, 0);
  }

  function _restoreRecentApp(recentId) {
    var recent = state.recentApps.find(function (item) { return item.id === recentId; });
    var appId = recent ? (recent.appId || recent.id) : recentId;
    if (recent && recent.appId === "queue") window.__lumibelleQueueView = recent.route || "management";
    if (!recent || !recent.snapshot || !els.appWindow || !els.appBody) { openApp(appId); return; }
    var holder = document.createElement('div');
    holder.innerHTML = recent.snapshot;
    var snapshotWindow = holder.firstElementChild;
    var snapshotHeader = snapshotWindow && snapshotWindow.querySelector('[data-role="app-title"]');
    var snapshotBody = snapshotWindow && snapshotWindow.querySelector('[data-role="app-body"]');
    if (!snapshotWindow || !snapshotBody) { openApp(appId); return; }
    state.currentApp = appId;
    state.currentRecentId = recent.id;
    state.appStack = [appId];
    _addRecentApp(appId, recent.id, recent.route || "");
    els.appWindow.className = snapshotWindow.className;
    els.appWindow.classList.remove('app-overview-snapshot-window');
    els.appWindow.classList.add('is-open');
    els.appWindow.setAttribute('aria-hidden', 'false');
    if (snapshotHeader) els.appTitle.textContent = snapshotHeader.textContent;
    els.appBody.innerHTML = snapshotBody.innerHTML;
    els.appBody.scrollTop = recent.scrollTop || 0;
    _applyAppWindowState(appId);
    _mountApp(appId);
    if (els.dock) els.dock.setAttribute('aria-hidden', 'true');
    _startRecentSnapshotTracking();
    _scheduleRecentSnapshot(30);
    _closeRecentApps();
  }

  function _dismissRecentApp(appId) {
    var wasCurrent = state.currentRecentId === appId;
    var dismissedIndex = state.overviewIndex;

    /* 닫은 앱만 최근 앱 목록에서 제거한다. 다른 카드의 스냅샷/스크롤 값은 그대로 둔다. */
    state.recentApps = state.recentApps.filter(function (item) { return item.id !== appId; });

    /* 남은 카드가 있으면 탭보기는 유지하고, 같은 자리에 있던 다음 카드(없으면 이전 카드)를 중앙에 둔다. */
    if (state.recentApps.length) {
      state.overviewIndex = Math.max(0, Math.min(dismissedIndex, state.recentApps.length - 1));

      /* app-overview는 app-window 내부에 있으므로, 현재 앱을 닫을 때
         app-window 자체를 숨기면 탭보기까지 함께 사라진다.
         남은 카드가 있을 때는 실행 상태만 해제하고 창/탭보기 레이어는 유지한다. */
      if (wasCurrent) {
        _stopRecentSnapshotTracking();
        state.currentApp = null;
        state.currentRecentId = null;
        state.appStack = [];
        if (els.dock) els.dock.setAttribute('aria-hidden', 'false');
      }

      _renderRecentApps();
      if (els.appOverview) {
        els.appOverview.classList.add("is-open");
        els.appOverview.setAttribute("aria-hidden", "false");
      }
      return;
    }

    /* 마지막 카드까지 닫힌 경우에만 탭보기를 종료하고 홈으로 돌아간다. */
    state.overviewIndex = 0;
    if (state.currentApp) _closeAppWindow({ keepOverview: true });
    _closeRecentApps();
    state.returnPage = 0;
    goToPage(0);
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
    function getCurrentCard() { return els.appOverviewTrack && els.appOverviewTrack.querySelectorAll('[data-recent-card]')[state.overviewIndex]; }
    els.appOverview.addEventListener('pointerdown', function (e) {
      var card = e.target.closest('[data-recent-card]');
      if (!card || card !== getCurrentCard()) return;
      drag = { card: card, startX: e.clientX, startY: e.clientY, type: null, moved: false };
      if (card.setPointerCapture) card.setPointerCapture(e.pointerId);
    });
    els.appOverview.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.startX, dy = e.clientY - drag.startY;
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
      } else _applyRecentCardPositions(dx, 0);
    });
    function finishDrag(e) {
      if (!drag) return;
      var active = drag; drag = null;
      var dx = e.clientX - active.startX, dy = e.clientY - active.startY;
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
        if (dx > 0 && state.overviewIndex < state.recentApps.length - 1) state.overviewIndex += 1;
        if (dx < 0 && state.overviewIndex > 0) state.overviewIndex -= 1;
      }
      _applyRecentCardPositions(0, 0);
    }
    els.appOverview.addEventListener('pointerup', finishDrag);
    els.appOverview.addEventListener('pointercancel', finishDrag);
    els.appOverview.addEventListener('click', function (e) {
      if (e.target.closest('[data-action="close-all-recent"]')) return;
      var card = e.target.closest('[data-recent-card]');
      if (!card) { _closeRecentApps(); return; }
      if (Date.now() < ignoreClickUntil) return;
      if (card === getCurrentCard()) _restoreRecentApp(card.getAttribute('data-app-id'));
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

  /* ─────────────────────────────────────────
     공개 API
  ───────────────────────────────────────── */
  return {
    init:     init,
    openApp:  openApp,
    goHome:   goHome,
    goBack:   goBack,
    goToPage: goToPage,
    refreshHomeSummary: _renderDashboardSummary
  };

}());
