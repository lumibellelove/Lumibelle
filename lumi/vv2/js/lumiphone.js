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

  var DIGITAL_API_URL = 'https://script.google.com/macros/s/AKfycbzP-LK_SDX-aRkWPPLoVF05Qz-61ubqkP7DC8LqdBNH7QP3cjhPqlse-UiHMduK02bd/exec';

  /* ─────────────────────────────────────────
     앱 레지스트리
     renderer:
       "empty"       — 빈 화면 (개발 전)
       "placeholder" — placeholder-apps.js 담당
       "native"      — js/apps/{id}.js 담당 (추후)
  ───────────────────────────────────────── */
  var APP_REGISTRY = [
    { id: "ticket",       labelKey: "app.ticket",        iconText: "티켓", group: "more", color: "#fff4f7", renderer: "native", previewNotice: true },
    { id: "benefitQueue", labelKey: "app.benefitQueue",  iconText: "대기",             group: "hidden", color: "#fff0f5", renderer: "native" },
    { id: "messages",     labelKey: "app.messages",      iconText: "문자", badge: "2", group: "hidden", color: "#fdf4fa", renderer: "native" },
    { id: "notification",  labelKey: "app.notification",   iconText: "알림",             group: "hidden", color: "#fff4f8", renderer: "native" },
    { id: "stamp",        labelKey: "app.stamp",         iconText: "스탬프",           group: "more", color: "#fff5f8", renderer: "native", previewNotice: true },
    { id: "point",        labelKey: "app.point",         iconText: "포인트",           group: "hidden", color: "#fff2f6", renderer: "native" },
    { id: "homeworkCheki",labelKey: "app.homeworkCheki", iconText: "숙체",             group: "more", color: "#fdf5f7", renderer: "native", previewNotice: true, previewType: "homework" },
    { id: "mail",         labelKey: "app.mail",          iconText: "우편",             group: "hidden", color: "#fff7f4", renderer: "native" },
    { id: "timeline",     labelKey: "app.timeline",      iconText: "기록",             group: "hidden", color: "#fff5f8", renderer: "native" },
    { id: "boothBank",    labelKey: "app.boothBank",     iconText: "물판",             group: "more", color: "#fff4f7", renderer: "native", previewNotice: true },
    { id: "achievement",  labelKey: "app.achievement",   iconText: "업적",             group: "more", color: "#fdf5f7", renderer: "native", previewNotice: true },
    { id: "profile",      labelKey: "app.profile",       iconText: "MY",               group: "more", color: "#fff3f7", renderer: "native", previewNotice: true },
    { id: "digitalTicketPurchase", labelKey: "app.digitalTicketPurchase", iconText: "구매", group: "hidden", color: "#fff4f8", renderer: "native" },
    { id: "digitalTicketDetail", labelKey: "app.digitalTicketDetail", iconText: "상세", group: "hidden", color: "#fff4f8", renderer: "native" }
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
    appHistory:      [],
    recentApps:      [],
    overviewIndex:    0,
    recentObserver:  null,
    recentCaptureTimer: null,
    currentPage:     1,
    returnPage:      1,
    backRoute:       null,
    appBackHandler:  null,
    digitalTicketDetail: null,
    digitalTicketDetailIndex: null,
    digitalTicketMemberDraft: null,
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
    _syncDigitalTicketLoginState();
    _renderToday();
    _renderDigitalTicketGreeting();
    _renderDigitalTicketStatus();
    setTimeout(function () { _loadDigitalTicketStateFromApi(true); }, 180);
    setTimeout(function () { _loadDigitalTicketStateFromApi(true); }, 2500);
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
    els.digitalLoginGate = document.querySelector('[data-role="digital-login-gate"]');
    els.digitalLoginForm = document.querySelector('[data-role="digital-login-form"]');
    els.digitalLoginError = document.querySelector('[data-role="digital-login-error"]');
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




  function _digitalApiRequest(action, params, onDone) {
    var finished = false;
    var attempt = 0;
    var maxAttempts = 2;
    var timeoutMs = 22000;

    function finish(response) {
      if (finished) return;
      finished = true;
      if (typeof onDone === 'function') onDone(response || { ok: false, message: '응답이 비어 있어요.' });
    }

    function runAttempt() {
      attempt += 1;

      var callbackName = '__lumiFanDigitalApiCallback_' + Date.now() + '_' + Math.floor(Math.random() * 100000);
      var script = document.createElement('script');
      var query = new URLSearchParams();
      var timer = null;
      var settled = false;

      params = params || {};
      query.set('action', action);
      query.set('callback', callbackName);
      query.set('_', String(Date.now()));

      Object.keys(params).forEach(function (key) {
        if (params[key] != null) query.set(key, params[key]);
      });

      function cleanup() {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        if (script.parentNode) script.parentNode.removeChild(script);
        try { delete window[callbackName]; } catch (error) { window[callbackName] = undefined; }
      }

      window[callbackName] = function (response) {
        if (settled || finished) return;
        settled = true;
        cleanup();
        finish(response || { ok: false, message: '응답이 비어 있어요.' });
      };

      script.onerror = function () {
        if (settled || finished) return;
        settled = true;
        cleanup();

        if (attempt < maxAttempts) {
          setTimeout(runAttempt, 700);
          return;
        }

        finish({
          ok: false,
          error: 'API_LOAD_FAILED',
          message: '특전권 정보를 불러오지 못했어요.'
        });
      };

      timer = setTimeout(function () {
        if (settled || finished) return;
        settled = true;
        cleanup();

        if (attempt < maxAttempts) {
          setTimeout(runAttempt, 700);
          return;
        }

        finish({
          ok: false,
          error: 'API_TIMEOUT',
          message: '특전권 정보 확인이 지연되고 있어요.'
        });
      }, timeoutMs);

      script.src = DIGITAL_API_URL + '?' + query.toString();
      document.head.appendChild(script);
    }

    runAttempt();
  }

  function _loadDigitalTicketStateFromApi(force) {
    var user = _getDigitalTicketLoginUser() || _getDigitalTicketLoginUserFromInputs();
    if (!user || !user.nickname || !user.phoneLast4) {
      window.LumiDigitalTicketLoadMessage = '특전권 확인을 위해 닉네임과 전화번호 뒤 4자리가 필요해요.';
      _renderDigitalTicketStatus();
      return;
    }

    try {
      window.LumiDigitalTicketUser = {
        nickname: user.nickname,
        phoneLast4: user.phoneLast4
      };
      if (window.localStorage) {
        window.localStorage.setItem('lumiphone-digital-ticket-user', JSON.stringify({
          nickname: user.nickname,
          phoneLast4: user.phoneLast4,
          recoveredAt: new Date().toISOString()
        }));
      }
    } catch (error) {}

    var now = Date.now();
    if (window.__lumiFanDigitalApiLoading) return;
    if (!force && window.__lumiFanDigitalApiLastLoad && now - window.__lumiFanDigitalApiLastLoad < 8000) return;

    window.__lumiFanDigitalApiLoading = true;
    window.__lumiFanDigitalApiLastLoad = now;
    window.LumiDigitalTicketLoadMessage = '특전권 정보를 확인 중이에요.';
    _renderDigitalTicketStatus();

    _digitalApiRequest('getFanDigitalState', {
      nickname: user.nickname,
      phone_last4: user.phoneLast4
    }, function (response) {
      window.__lumiFanDigitalApiLoading = false;

      if (!response || !response.ok) {
        window.LumiDigitalTicketLoadMessage = (response && response.message) || '특전권 정보를 불러오지 못했어요.';
        _renderDigitalTicketStatus();
        return;
      }

      var stateData = {
        tickets: Array.isArray(response.tickets) ? response.tickets : [],
        orders: Array.isArray(response.orders) ? response.orders.map(function (order) {
          order = order || {};
          return {
            orderId: order.orderId || order.order_id || '',
            orderToken: order.orderToken || order.order_token || '',
            depositorName: order.depositorName || order.depositor_name || '',
            status: order.status || order.order_status || '',
            totalAmount: order.totalAmount || order.total_amount || 0,
            boothPoint: order.boothPoint || order.booth_point || 0,
            orderItems: order.orderItems || order.order_items || '',
            requestedAt: order.requestedAt || order.requested_at || '',
            approvedAt: order.approvedAt || order.approved_at || '',
            raw: order
          };
        }) : [],
        loadedAt: new Date().toISOString()
      };

      try {
        window.LumiDigitalTicketState = stateData;
        window.LumiDigitalTicketData = stateData;
        if (window.localStorage) {
          window.localStorage.setItem('lumiphone-digital-ticket-state', JSON.stringify(stateData));
        }
      } catch (error) {}

      window.LumiDigitalTicketLoadMessage = '';
      _renderDigitalTicketGreeting();
      _renderDigitalTicketStatus();
    });
  }

  function _getDigitalTicketLoginUser() {
    if (window.LumiDigitalTicketUser && typeof window.LumiDigitalTicketUser === 'object') {
      var liveNickname = String(window.LumiDigitalTicketUser.nickname || '').trim();
      var livePhoneLast4 = String(window.LumiDigitalTicketUser.phoneLast4 || '').trim();
      if (liveNickname && /^\d{4}$/.test(livePhoneLast4)) {
        return { nickname: liveNickname, phoneLast4: livePhoneLast4 };
      }
    }

    try {
      if (!window.localStorage) return null;
      var raw = window.localStorage.getItem('lumiphone-digital-ticket-user');
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      var nickname = String(parsed.nickname || '').trim();
      var phoneLast4 = String(parsed.phoneLast4 || '').trim();
      if (!nickname || !/^\d{4}$/.test(phoneLast4)) return null;
      return { nickname: nickname, phoneLast4: phoneLast4 };
    } catch (error) {
      return null;
    }
  }

  function _getDigitalTicketLoginUserFromInputs() {
    var nickname = '';
    var phoneLast4 = '';

    try {
      var nicknameInput = document.querySelector('[data-role="digital-login-form"] input[name="nickname"]');
      var phoneInput = document.querySelector('[data-role="digital-login-form"] input[name="phoneLast4"]');

      if (nicknameInput) nickname = String(nicknameInput.value || '').trim();
      if (phoneInput) phoneLast4 = String(phoneInput.value || '').replace(/\D/g, '').slice(0, 4);
    } catch (error) {}

    if (!nickname) nickname = String(_getViewerDisplayName ? _getViewerDisplayName() : '').replace(/님\s*♡?$/, '').trim();

    if (!/^\d{4}$/.test(phoneLast4)) return null;
    if (!nickname) return null;

    return {
      nickname: nickname,
      phoneLast4: phoneLast4
    };
  }

  function _syncDigitalTicketLoginState() {
    var user = _getDigitalTicketLoginUser();
    if (user) {
      window.LumiDigitalTicketUser = {
        nickname: user.nickname,
        phoneLast4: user.phoneLast4
      };
      document.body.classList.remove('is-digital-login-required');
      document.body.classList.add('is-digital-login-complete');
      setTimeout(_loadDigitalTicketStateFromApi, 80);
      return;
    }

    document.body.classList.add('is-digital-login-required');
    document.body.classList.remove('is-digital-login-complete');
  }

  function _submitDigitalTicketLogin(form) {
    if (!form) return;
    var nicknameInput = form.querySelector('input[name="nickname"]');
    var phoneInput = form.querySelector('input[name="phoneLast4"]');
    var nickname = String(nicknameInput && nicknameInput.value || '').trim();
    var phoneLast4 = String(phoneInput && phoneInput.value || '').replace(/\D/g, '').slice(0, 4);

    if (phoneInput) phoneInput.value = phoneLast4;

    if (!nickname) {
      if (els.digitalLoginError) els.digitalLoginError.textContent = '닉네임을 입력해주세요.';
      if (nicknameInput) nicknameInput.focus();
      return;
    }

    if (!/^\d{4}$/.test(phoneLast4)) {
      if (els.digitalLoginError) els.digitalLoginError.textContent = '전화번호 뒤 4자리 숫자를 입력해주세요.';
      if (phoneInput) phoneInput.focus();
      return;
    }

    var user = {
      nickname: nickname,
      phoneLast4: phoneLast4,
      enteredAt: new Date().toISOString()
    };

    try {
      if (window.localStorage) {
        window.localStorage.setItem('lumiphone-digital-ticket-user', JSON.stringify(user));
      }
    } catch (error) {}

    window.LumiDigitalTicketUser = {
      nickname: nickname,
      phoneLast4: phoneLast4
    };

    if (els.digitalLoginError) els.digitalLoginError.textContent = '';
    document.body.classList.remove('is-digital-login-required');
    document.body.classList.add('is-digital-login-complete');
    _syncDigitalTicketLoginState();
    _renderDigitalTicketGreeting();
    _renderDigitalTicketStatus();
    _loadDigitalTicketStateFromApi();
    goToPage(0);
  }


  function _renderDigitalTicketGreeting() {
    var nameEl = document.querySelector('[data-role="digital-fan-name"]');
    if (!nameEl) return;
    var name = _getViewerDisplayName();
    nameEl.textContent = name || '루미';
  }


  function _renderDigitalTicketStatus() {
    var statusEl = document.querySelector('[data-role="digital-ticket-status"]');
    if (!statusEl) return;

    var state = _getDigitalTicketState();
    var tickets = Array.isArray(state.tickets) ? state.tickets.filter(function (ticket) {
      return ticket && String(ticket.name || ticket.ticketType || ticket.ticketNumber || '').trim();
    }) : [];
    var orders = Array.isArray(state.orders) ? state.orders.filter(function (order) {
      return order && String(order.status || '').trim() === '입금 확인 대기';
    }) : [];
    var message = window.LumiDigitalTicketLoadMessage || '';

    if (!tickets.length && !orders.length) {
      statusEl.innerHTML =
        (message ? '<p class="digital-sync-message">' + _escHtml(message) + '</p>' : '') +
        '<article class="digital-empty-card" aria-label="발급된 특전권 없음">' +
          '<div class="digital-art-slot digital-art-slot--ticket" aria-hidden="true"></div>' +
          '<div class="digital-empty-copy">' +
            '<strong>아직 발급된 특전권이 없어요</strong>' +
            '<p>발급 완료되면 이 화면에 자동으로 표시돼요.</p>' +
          '</div>' +
          '<button type="button" class="digital-main-action" data-app-id="digitalTicketPurchase" data-dock-app="digitalTicketPurchase">현장 특전권 구매하기</button>' +
        '</article>';
      return;
    }

    statusEl.innerHTML =
      (message ? '<p class="digital-sync-message">' + _escHtml(message) + '</p>' : '') +
      (orders.length ? '<div class="digital-ticket-list digital-ticket-list--orders">' + orders.map(_renderDigitalPendingOrderCard).join('') + '</div>' : '') +
      (tickets.length ? '<div class="digital-ticket-list">' + tickets.map(_renderDigitalTicketCard).join('') + '</div>' : '') +
      '<article class="digital-buy-strip">' +
        '<div class="digital-art-slot digital-art-slot--mini" aria-hidden="true"></div>' +
        '<p>현장 특전권을 추가로 신청할 수 있어요.</p>' +
        '<button type="button" data-app-id="digitalTicketPurchase" data-dock-app="digitalTicketPurchase">구매하기</button>' +
      '</article>';
  }

  function _getDigitalTicketState() {
    var source = window.LumiDigitalTicketState || window.LumiDigitalTicketData || null;

    if (!source && window.localStorage) {
      try {
        var raw = window.localStorage.getItem('lumiphone-digital-ticket-state');
        if (raw) source = JSON.parse(raw);
      } catch (error) {}
    }

    if (!source || typeof source !== 'object') return { tickets: [] };
    return source;
  }

  function _renderDigitalPendingOrderCard(order) {
    order = order || {};
    return (
      '<article class="digital-ticket-card digital-ticket-card--pending-order">' +
        '<div class="digital-art-slot digital-art-slot--card" aria-hidden="true"></div>' +
        '<div class="digital-ticket-card__copy">' +
          '<span>입금 확인 대기</span>' +
          '<strong>' + _escHtml(order.orderItems || '현장 특전권 신청') + '</strong>' +
          '<p>입금자명: ' + _escHtml(order.depositorName || '-') + '</p>' +
          '<p>결제 금액 <b>' + _escHtml(_formatDigitalMoney(order.totalAmount)) + '</b></p>' +
        '</div>' +
        '<button type="button" class="digital-ticket-detail-button" data-app-id="digitalTicketPurchase" data-dock-app="digitalTicketPurchase">입금 QR 보기</button>' +
      '</article>'
    );
  }

  function _formatDigitalMoney(value) {
    var number = Number(value || 0);
    return number.toLocaleString('ko-KR') + '원';
  }

  function _renderDigitalTicketCard(ticket, index) {
    var normalized = _normalizeDigitalTicket(ticket, index);
    var type = normalized.type;
    var displayName = _getDigitalTicketDisplayName(normalized);

    return (
      '<article class="digital-ticket-card digital-ticket-card--' + type + '">' +
        '<div class="digital-art-slot digital-art-slot--card" aria-hidden="true"></div>' +
        '<div class="digital-ticket-card__copy">' +
          '<span>' + _escHtml(normalized.badge) + '</span>' +
          '<strong>' + _escHtml(displayName || normalized.name) + '</strong>' +
          '<p>상태: ' + _escHtml(normalized.status) + '</p>' +
          '<p>잔여 <b>' + _escHtml(String(normalized.remaining)) + '회</b></p>' +
        '</div>' +
        '<button type="button" class="digital-ticket-detail-button" data-digital-ticket-detail="' + index + '">상세 보기</button>' +
      '</article>'
    );
  }

  function _normalizeDigitalTicket(ticket, index) {
    ticket = ticket || {};
    var rawName = String(ticket.name || ticket.displayName || ticket.display_name || ticket.ticketType || ticket.ticket_type || '').trim();
    var rawOrderId = String(ticket.orderId || ticket.order_id || '').trim();
    var explicitType = String(ticket.type || '').trim();
    var isEvent = explicitType === 'event' || rawName.indexOf('메아테') !== -1 || rawName.indexOf('이벤트') !== -1 || rawOrderId.indexOf('EVENT') === 0;
    var type = isEvent ? 'event' : 'paid';
    var count = Number.isFinite(Number(ticket.count)) ? Number(ticket.count) : (Number.isFinite(Number(ticket.remaining)) ? Number(ticket.remaining) : 1);
    var remaining = Number.isFinite(Number(ticket.remaining)) ? Number(ticket.remaining) : count;
    var pointBase = Number.isFinite(Number(ticket.paidTicketUnits || ticket.paid_ticket_count)) ? Number(ticket.paidTicketUnits || ticket.paid_ticket_count) : count;
    var point = type === 'paid' ? Math.floor(pointBase / 15) : 0;
    var ticketNumber = ticket.ticketNumber || ticket.ticketId || ticket.ticket_id || ('TKT-' + _buildTicketSeed(index));
    var token = ticket.token || ticket.ticketToken || ticket.ticket_token || ticketNumber;
    var displayName = rawName || (type === 'event' ? '메아테 이벤트 특전권' : '현장 구매 특전권');
    return {
      type: type,
      badge: ticket.badge || (type === 'event' ? '이벤트 특전권' : '현장 구매 특전권'),
      name: displayName,
      status: ticket.status || '사용 가능',
      count: count,
      remaining: remaining,
      point: point,
      ticketNumber: ticketNumber,
      token: token,
      preferredMember: ticket.preferredMember || ticket.preferred_member || ticket.hopeMember || ticket.member || '',
      baseName: ticket.baseName || ticket.ticketType || ticket.ticket_type || ticket.rawName || displayName,
      ticketType: ticket.ticketType || ticket.ticket_type || ticket.baseName || ticket.rawName || displayName,
      qrDataUrl: ticket.qrDataUrl || ticket.qrDataURL || ticket.qr_data_url || ticket.qrImage || ticket.qr_image || '',
      orderId: rawOrderId
    };
  }

  function _buildTicketSeed(index) {
    var today = new Date();
    var month = String(today.getMonth() + 1).padStart(2, '0');
    var day = String(today.getDate()).padStart(2, '0');
    var seq = String(Number(index || 0) + 23).padStart(5, '0');
    return month + day + '-' + seq;
  }



  function _openDigitalTicketDetail(index) {
    var stateData = _getDigitalTicketState();
    var tickets = Array.isArray(stateData.tickets) ? stateData.tickets : [];
    var ticket = tickets[Number(index || 0)];
    if (!ticket) return;
    state.digitalTicketDetailIndex = Number(index || 0);
    state.digitalTicketDetail = _normalizeDigitalTicket(ticket, state.digitalTicketDetailIndex);
    state.digitalTicketMemberDraft = state.digitalTicketDetail.preferredMember || '';
    openApp('digitalTicketDetail');
  }

  function _getDigitalTicketBaseName(ticket) {
    var name = String((ticket && (ticket.baseName || ticket.ticketType || ticket.name)) || '');
    if (!name) return '';
    var members = ['루루', '마리링'];
    members.forEach(function(member) {
      if (name.indexOf(member) === 0) {
        name = name.slice(member.length).trim();
      }
    });
    return name || String((ticket && ticket.name) || '');
  }

  function _getDigitalTicketDisplayName(ticket) {
    if (!ticket) return '';
    var baseName = _getDigitalTicketBaseName(ticket);
    var memberName = String(ticket.preferredMember || '');

    if (baseName.indexOf('단체 촬영권') !== -1) {
      return '단체 촬영권';
    }

    var memberReflectTargets = ['투샷체키', '핀체키', '샤메권', '영상권'];
    var shouldReflectMember = memberReflectTargets.some(function(target) {
      return baseName.indexOf(target) !== -1;
    });

    if (memberName && shouldReflectMember) {
      return memberName + ' ' + baseName;
    }

    return baseName;
  }

  function _shouldShowDigitalTicketMemberSection(ticket) {
    var baseName = _getDigitalTicketBaseName(ticket);
    var memberSelectableTargets = ['투샷체키', '핀체키', '샤메권', '영상권'];

    return memberSelectableTargets.some(function(target) {
      return baseName.indexOf(target) !== -1;
    });
  }

  function _renderDigitalTicketDetailApp() {
    var ticket = state.digitalTicketDetail || _normalizeDigitalTicket({ name: '현장 구매 특전권', remaining: 1, count: 1 }, 0);
    var pointText = ticket.point > 0 ? '+' + ticket.point + 'P 적립 완료' : '0P';
    var displayName = _getDigitalTicketDisplayName(ticket);

    return (
      '<section class="digital-ticket-detail-app">' +
        '<section class="digital-detail-title">' +
          '<h2>특전권 발급 완료</h2>' +
        '</section>' +
        '<section class="digital-detail-main-card">' +
          '<div class="digital-detail-top">' +
            '<div class="digital-art-slot digital-art-slot--detail" aria-hidden="true"></div>' +
            '<div class="digital-detail-summary">' +
              '<span>특전권 이름</span>' +
              '<strong>' + _escHtml(displayName) + '</strong>' +
              '<div class="digital-detail-counts">' +
                '<div><span>수량</span><b>' + _escHtml(String(ticket.count)) + '장</b></div>' +
                '<div><span>잔여 횟수</span><b>' + _escHtml(String(ticket.remaining)) + '회</b></div>' +
              '</div>' +
              '<p>상태 <b>' + _escHtml(ticket.status) + '</b></p>' +
            '</div>' +
          '</div>' +
          '<div class="digital-detail-bottom">' +
            '<div class="digital-detail-ticket-meta">' +
              '<span>티켓 번호</span>' +
              '<strong>' + _escHtml(ticket.ticketNumber) + '</strong>' +
              '<span>이번 구매로 적립된 물판 포인트</span>' +
              '<em>' + _escHtml(pointText) + '</em>' +
            '</div>' +
            '<div class="digital-detail-qr" aria-label="특전권 QR">' + _renderTicketQr(ticket) + '</div>' +
          '</div>' +
        '</section>' +
        (_shouldShowDigitalTicketMemberSection(ticket) ? _renderDigitalTicketMemberSection(ticket) : '') +
        '<section class="digital-detail-guide">' +
          '<strong>이용 안내</strong>' +
          '<p>특전회 진행 시 이 화면을 스탭에게 보여주세요.</p>' +
          '<p>사용 처리된 특전권은 다시 사용할 수 없어요.</p>' +
        '</section>' +
        '<section class="digital-info-card digital-detail-info">' +
          '<div class="digital-info-copy">' +
            '<strong>숙제체키 안내</strong>' +
            '<p>이번 디지털 특전권은 현장 특전권과 이벤트 특전권 확인을 위한 임시 운영이에요.</p>' +
            '<p>숙제체키 접수는 이번 페이지에서 진행하지 않아요.<br>추후 별도 안내 예정이에요.</p>' +
          '</div>' +
        '</section>' +
        '<article class="digital-id-card digital-detail-id-card">' +
          '<div class="digital-id-copy">' +
            '<strong>루미 ID와 함께하는 나만의 루미 기록 ♡</strong>' +
            '<p>공연 티켓, 입장 QR, 특전권과 기록을 한곳에 모아볼 수 있어요.</p>' +
            '<p>루미폰 V2는 현재 준비 중이에요.</p>' +
            '<a class="digital-id-link" href="https://lumibellelove.com/lumi/index.html">루미 ID 만들러 가기</a>' +
            '<small>기본 기능은 루미폰 V1에서 이용할 수 있어요.</small>' +
          '</div>' +
        '</article>' +
        '<button type="button" class="digital-detail-back" data-action="home">내 특전권함으로 돌아가기</button>' +
      '</section>'
    );
  }

  function _selectDigitalTicketPreferredMember(memberName) {
    if (!state.digitalTicketDetail) return;
    state.digitalTicketMemberDraft = memberName || '';
    openApp('digitalTicketDetail');
  }

  function _confirmDigitalTicketPreferredMember() {
    if (!state.digitalTicketDetail) return;
    var memberName = state.digitalTicketMemberDraft || state.digitalTicketDetail.preferredMember || '';
    if (!memberName) return;

    state.digitalTicketDetail.preferredMember = memberName;
    state.digitalTicketDetail.displayName = _getDigitalTicketDisplayName(state.digitalTicketDetail);
    state.digitalTicketDetail.staffPreferredMember = memberName;

    var stateData = _getDigitalTicketState();
    var tickets = Array.isArray(stateData.tickets) ? stateData.tickets : [];
    var index = Number(state.digitalTicketDetailIndex || 0);
    if (tickets[index]) {
      tickets[index].preferredMember = memberName;
      tickets[index].displayName = _getDigitalTicketDisplayName(state.digitalTicketDetail);
      tickets[index].staffPreferredMember = memberName;
      state.digitalTicketDetail = _normalizeDigitalTicket(tickets[index], index);
      state.digitalTicketMemberDraft = memberName;
    }

    try {
      if (stateData && Array.isArray(stateData.tickets)) {
        window.LumiDigitalTicketState = stateData;
        window.LumiDigitalTicketData = stateData;
      }
      if (window.localStorage && stateData && Array.isArray(stateData.tickets)) {
        window.localStorage.setItem('lumiphone-digital-ticket-state', JSON.stringify(stateData));
      }
    } catch (error) {}

    _renderDigitalTicketStatus();
    openApp('digitalTicketDetail');
  }

  function _renderDigitalTicketMemberSection(ticket) {
    var selectedMember = state.digitalTicketMemberDraft || ticket.preferredMember || '';
    var currentMember = ticket.preferredMember || '아직 선택하지 않았어요';
    var members = ['루루', '마리링'];
    var buttons = members.map(function(member) {
      var activeClass = selectedMember === member ? ' is-selected' : '';
      return '<button type="button" class="' + activeClass + '" data-digital-member-select="' + _escHtml(member) + '">' + _escHtml(member) + '</button>';
    }).join('');
    return '<section class="digital-detail-member">' +
      '<div class="digital-detail-member__head">' +
        '<strong>희망 멤버 선택</strong>' +
        '<p>현재 희망 멤버</p>' +
        '<span>' + _escHtml(currentMember) + '</span>' +
      '</div>' +
      '<div class="digital-detail-member__buttons" aria-label="희망 멤버 선택">' + buttons + '</div>' +
      '<button type="button" class="digital-detail-member__confirm" data-digital-member-confirm="true">희망 멤버 확정</button>' +
      '<p class="digital-detail-member__notice">희망 멤버는 사용 전까지 변경할 수 있어요.</p>' +
      '<p class="digital-detail-member__notice">최종 정산은 스탭 사용 처리 기준으로 기록돼요.</p>' +
    '</section>';
  }

  function _getStaffQrValue(ticket) {
    var rawToken = String((ticket && (ticket.token || ticket.ticketToken || ticket.ticketNumber)) || 'TKT-0000-00000').trim();
    if (!rawToken) rawToken = 'TKT-0000-00000';
    return 'https://lumibellelove.com/staff/index.html?ticket_token=' + encodeURIComponent(rawToken);
  }

  function _renderTicketQr(ticket) {
    ticket = ticket || {};
    var token = String(ticket.token || ticket.ticketToken || ticket.ticketNumber || 'TKT-0000-00000').trim();
    var directImage = ticket.qrDataUrl || ticket.qrImage || ticket.qrSvg || ticket.qrUrl || '';
    var knownQrMap = window.LumiDigitalTicketQrMap || {};
    var mappedImage = knownQrMap[token] || knownQrMap[ticket.ticketNumber] || '';

    if (directImage || mappedImage) {
      return '<img class="digital-qr-image" src="' + _escHtml(directImage || mappedImage) + '" alt="특전권 QR" data-qr-value="' + _escHtml(_getStaffQrValue(ticket)) + '" />';
    }

    return _renderDynamicQrImage(token, '특전권 QR');
  }

  function _renderDynamicQrImage(value, label) {
    var modules = _makeQrModules(String(value || ''));
    var size = modules.length;
    var cell = 4;
    var quiet = 4;
    var full = (size + quiet * 2) * cell;
    var rects = [];

    for (var y = 0; y < size; y++) {
      for (var x = 0; x < size; x++) {
        if (modules[y][x]) {
          rects.push('<rect x="' + ((x + quiet) * cell) + '" y="' + ((y + quiet) * cell) + '" width="' + cell + '" height="' + cell + '"/>');
        }
      }
    }

    return '<svg class="digital-qr-image" role="img" aria-label="' + _escHtml(label || 'QR') + '" viewBox="0 0 ' + full + ' ' + full + '" data-qr-value="' + _escHtml(value || '') + '" xmlns="http://www.w3.org/2000/svg">' +
      '<rect width="' + full + '" height="' + full + '" fill="#fff"/>' +
      '<g fill="#111">' + rects.join('') + '</g>' +
    '</svg>';
  }

  function _makeQrModules(text) {
    var version = 3;
    var size = version * 4 + 17;
    var dataCodewords = 55;
    var eccCodewords = 15;
    var mask = 0;
    var modules = [];
    var reserved = [];

    for (var y = 0; y < size; y++) {
      modules[y] = [];
      reserved[y] = [];
      for (var x = 0; x < size; x++) {
        modules[y][x] = false;
        reserved[y][x] = false;
      }
    }

    function setFunction(x, y, dark) {
      if (x < 0 || x >= size || y < 0 || y >= size) return;
      modules[y][x] = !!dark;
      reserved[y][x] = true;
    }

    function drawFinder(left, top) {
      for (var dy = -1; dy <= 7; dy++) {
        for (var dx = -1; dx <= 7; dx++) {
          var x = left + dx;
          var y = top + dy;
          if (x < 0 || x >= size || y < 0 || y >= size) continue;
          var dark = dx >= 0 && dx <= 6 && dy >= 0 && dy <= 6 &&
            (dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4));
          setFunction(x, y, dark);
        }
      }
    }

    function drawAlignment(cx, cy) {
      for (var dy = -2; dy <= 2; dy++) {
        for (var dx = -2; dx <= 2; dx++) {
          var dist = Math.max(Math.abs(dx), Math.abs(dy));
          setFunction(cx + dx, cy + dy, dist !== 1);
        }
      }
    }

    drawFinder(0, 0);
    drawFinder(size - 7, 0);
    drawFinder(0, size - 7);

    for (var i = 8; i < size - 8; i++) {
      setFunction(i, 6, i % 2 === 0);
      setFunction(6, i, i % 2 === 0);
    }

    drawAlignment(22, 22);
    setFunction(8, 4 * version + 9, true);

    for (var j = 0; j < 8; j++) {
      setFunction(8, j, false);
      setFunction(j, 8, false);
      setFunction(size - 1 - j, 8, false);
      setFunction(8, size - 1 - j, false);
    }

    var data = _makeQrDataCodewords(text, dataCodewords);
    var ecc = _makeQrEcc(data, eccCodewords);
    var allCodewords = data.concat(ecc);
    var bitIndex = 0;
    var upward = true;

    for (var right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right--;
      for (var vert = 0; vert < size; vert++) {
        var yPos = upward ? size - 1 - vert : vert;
        for (var col = 0; col < 2; col++) {
          var xPos = right - col;
          if (reserved[yPos][xPos]) continue;
          var bit = false;
          if (bitIndex < allCodewords.length * 8) {
            bit = ((allCodewords[Math.floor(bitIndex / 8)] >>> (7 - (bitIndex % 8))) & 1) !== 0;
          }
          modules[yPos][xPos] = bit;
          bitIndex++;
        }
      }
      upward = !upward;
    }

    for (var yy = 0; yy < size; yy++) {
      for (var xx = 0; xx < size; xx++) {
        if (!reserved[yy][xx] && ((xx + yy) % 2 === 0)) {
          modules[yy][xx] = !modules[yy][xx];
        }
      }
    }

    _drawQrFormatBits(modules, reserved, mask);
    return modules;
  }

  function _makeQrDataCodewords(text, dataCodewords) {
    var bytes = _toUtf8Bytes(text).slice(0, 32);
    var bits = [];

    function appendBits(value, length) {
      for (var i = length - 1; i >= 0; i--) {
        bits.push((value >>> i) & 1);
      }
    }

    appendBits(4, 4);
    appendBits(bytes.length, 8);
    for (var b = 0; b < bytes.length; b++) appendBits(bytes[b], 8);

    var capacityBits = dataCodewords * 8;
    var terminator = Math.min(4, capacityBits - bits.length);
    for (var t = 0; t < terminator; t++) bits.push(0);
    while (bits.length % 8 !== 0) bits.push(0);

    var data = [];
    for (var i = 0; i < bits.length; i += 8) {
      var codeword = 0;
      for (var j = 0; j < 8; j++) codeword = (codeword << 1) | bits[i + j];
      data.push(codeword);
    }

    var pads = [0xEC, 0x11];
    var padIndex = 0;
    while (data.length < dataCodewords) {
      data.push(pads[padIndex % 2]);
      padIndex++;
    }
    return data;
  }

  function _toUtf8Bytes(text) {
    var out = [];
    for (var i = 0; i < text.length; i++) {
      var c = text.charCodeAt(i);
      if (c < 0x80) {
        out.push(c);
      } else if (c < 0x800) {
        out.push(0xC0 | (c >>> 6), 0x80 | (c & 0x3F));
      } else {
        out.push(0xE0 | (c >>> 12), 0x80 | ((c >>> 6) & 0x3F), 0x80 | (c & 0x3F));
      }
    }
    return out;
  }

  function _makeQrEcc(data, eccLen) {
    var gen = _makeQrGenerator(eccLen);
    var res = [];
    for (var i = 0; i < eccLen; i++) res.push(0);

    for (var j = 0; j < data.length; j++) {
      var factor = data[j] ^ res.shift();
      res.push(0);
      for (var k = 0; k < eccLen; k++) {
        res[k] ^= _qrGfMul(gen[k], factor);
      }
    }
    return res;
  }

  function _makeQrGenerator(degree) {
    var result = [1];
    for (var i = 0; i < degree; i++) {
      var next = [];
      for (var j = 0; j < result.length + 1; j++) next[j] = 0;
      for (var k = 0; k < result.length; k++) {
        next[k] ^= _qrGfMul(result[k], _qrGfPow(2, i));
        next[k + 1] ^= result[k];
      }
      result = next;
    }
    result.shift();
    return result;
  }

  function _qrGfPow(x, power) {
    var result = 1;
    for (var i = 0; i < power; i++) result = _qrGfMul(result, x);
    return result;
  }

  function _qrGfMul(x, y) {
    var z = 0;
    for (var i = 7; i >= 0; i--) {
      z = (z << 1) ^ ((z >>> 7) * 0x11D);
      z ^= ((y >>> i) & 1) * x;
    }
    return z & 0xFF;
  }

  function _drawQrFormatBits(modules, reserved, mask) {
    var size = modules.length;
    var ecl = 1;
    var data = (ecl << 3) | mask;
    var rem = data;

    for (var i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    var bits = ((data << 10) | rem) ^ 0x5412;

    function getBit(i) {
      return ((bits >>> i) & 1) !== 0;
    }

    function set(x, y, dark) {
      modules[y][x] = dark;
      reserved[y][x] = true;
    }

    for (var i = 0; i <= 5; i++) set(8, i, getBit(i));
    set(8, 7, getBit(6));
    set(8, 8, getBit(7));
    set(7, 8, getBit(8));
    for (var j = 9; j < 15; j++) set(14 - j, 8, getBit(j));

    for (var k = 0; k < 8; k++) set(size - 1 - k, 8, getBit(k));
    for (var m = 8; m < 15; m++) set(8, size - 15 + m, getBit(m));
    set(8, size - 8, true);
  }

  function _getViewerDisplayName() {
    var candidates = [];

    [window.LumiDigitalTicketUser, window.LumiUser, window.LumiProfile].forEach(function (source) {
      if (!source || typeof source !== 'object') return;
      candidates.push(source.nickname, source.displayName, source.name);
      if (source.profile && typeof source.profile === 'object') {
        candidates.push(source.profile.nickname, source.profile.displayName, source.profile.name);
      }
      if (source.viewer && typeof source.viewer === 'object') {
        candidates.push(source.viewer.nickname, source.viewer.displayName, source.viewer.name);
      }
    });

    try {
      if (window.localStorage) {
        ['lumiphone-v2-profile', 'lumiphone-profile', 'lumiphone-v2-settings', 'lumitalk-viewer-profile'].forEach(function (key) {
          var raw = window.localStorage.getItem(key);
          if (!raw) return;
          var parsed = JSON.parse(raw);
          if (!parsed || typeof parsed !== 'object') return;
          candidates.push(parsed.nickname, parsed.displayName, parsed.name);
          if (parsed.profile && typeof parsed.profile === 'object') {
            candidates.push(parsed.profile.nickname, parsed.profile.displayName, parsed.profile.name);
          }
          if (parsed.viewer && typeof parsed.viewer === 'object') {
            candidates.push(parsed.viewer.nickname, parsed.viewer.displayName, parsed.viewer.name);
          }
        });
      }
    } catch (error) {}

    for (var i = 0; i < candidates.length; i += 1) {
      var value = String(candidates[i] || '').trim();
      if (value) return value;
    }
    return '루미';
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
    document.addEventListener("submit", function (e) {
      var form = e.target && e.target.closest ? e.target.closest('[data-role="digital-login-form"]') : null;
      if (!form) return;
      e.preventDefault();
      _submitDigitalTicketLogin(form);
    });

    document.addEventListener("click", function (e) {
      var submitBtn = e.target && e.target.closest ? e.target.closest('.digital-login-submit') : null;
      if (!submitBtn) return;
      var form = submitBtn.closest('[data-role="digital-login-form"]');
      if (!form) return;
      e.preventDefault();
      _submitDigitalTicketLogin(form);
    });

    document.addEventListener("input", function (e) {
      var input = e.target && e.target.matches ? e.target : null;
      if (!input || input.name !== 'phoneLast4') return;
      input.value = String(input.value || '').replace(/\D/g, '').slice(0, 4);
    });

    document.addEventListener("click", function (e) {
      var refreshBtn = e.target.closest("[data-digital-ticket-refresh]");
      if (refreshBtn) { _loadDigitalTicketStateFromApi(true); return; }

      /* 1. 앱 아이콘 (그리드 + 최근앱) */
      var appBtn = e.target.closest("[data-app-id]");
      if (appBtn) { openApp(appBtn.getAttribute("data-app-id")); return; }

      /* 2. 특전권 상세 */
      var detailBtn = e.target.closest("[data-digital-ticket-detail]");
      if (detailBtn) { _openDigitalTicketDetail(detailBtn.getAttribute("data-digital-ticket-detail")); return; }

      var memberBtn = e.target.closest("[data-digital-member-select]");
      if (memberBtn) { _selectDigitalTicketPreferredMember(memberBtn.getAttribute("data-digital-member-select")); return; }

      var memberConfirmBtn = e.target.closest("[data-digital-member-confirm]");
      if (memberConfirmBtn) { _confirmDigitalTicketPreferredMember(); return; }

      /* 3. 독 앱 버튼 */
      var dockBtn = e.target.closest("[data-dock-app]");
      if (dockBtn) { openApp(dockBtn.getAttribute("data-dock-app")); return; }

      /* 4. OS 액션 */
      var actionEl = e.target.closest("[data-action]");
      if (!actionEl) return;
      var action = actionEl.getAttribute("data-action");
      if (action === "home")         goHome();
      if (action === "more")         { _closeAppWindow(); goToPage(1); }
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
      if (!openOptions.isHistoryBack) {
        state.appHistory.push(state.currentApp);
      }
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
    els.appWindow.classList.toggle("is-mail-view", app.id === "mail");
    els.appWindow.classList.toggle("is-settings-view", app.id === "settings");
    els.appWindow.classList.toggle("is-profile-view", app.id === "profile");
    els.appWindow.classList.toggle("is-lumitalk-view", app.id === "lumitalk");
    els.appWindow.classList.toggle("is-homework-cheki-view", app.id === "homeworkCheki");
    els.appWindow.classList.toggle("is-point-view", app.id === "point");
    els.appWindow.classList.toggle("is-booth-bank-view", app.id === "boothBank");
    els.appWindow.classList.toggle("is-benefit-queue-view", app.id === "benefitQueue");
    els.appWindow.classList.toggle("is-cheerbook-view", app.id === "cheerbook");
    els.appWindow.classList.toggle("is-attendance-view", app.id === "attendance");
    els.appWindow.classList.toggle("is-timeline-view", app.id === "timeline");
    els.appWindow.classList.toggle("is-achievement-view", app.id === "achievement");
    els.appWindow.classList.toggle("is-lumilog-view", app.id === "lumilog");
    els.appWindow.classList.toggle("is-digital-ticket-purchase-view", app.id === "digitalTicketPurchase");
    els.appWindow.classList.toggle("is-digital-ticket-detail-view", app.id === "digitalTicketDetail");
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

    if (appId === "benefitQueue" && typeof window.LumiApps.bindBenefitQueue === "function") {
      window.LumiApps.bindBenefitQueue(els.appBody);
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

    if (appId === "cheerbook" && typeof window.LumiApps.bindCheerbook === "function") {
      window.LumiApps.bindCheerbook(els.appBody);
    }

    if (appId === "attendance" && typeof window.LumiApps.bindAttendance === "function") {
      window.LumiApps.bindAttendance(els.appBody);
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

    if (appId === "profile" && typeof window.LumiApps.bindProfile === "function") {
      window.LumiApps.bindProfile(els.appBody);
    }

    if (appId === "lumitalk" && typeof window.LumiApps.bindLumitalk === "function") {
      window.LumiApps.bindLumitalk(els.appBody);
    }

    if (appId === "lumilog" && typeof window.LumiApps.bindLumilog === "function") {
      window.LumiApps.bindLumilog(els.appBody);
    }

    if (appId === "digitalTicketPurchase" && typeof window.LumiApps.bindDigitalTicketPurchase === "function") {
      window.LumiApps.bindDigitalTicketPurchase(els.appBody);
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

    if (app.id === "digitalTicketDetail") {
      return _renderDigitalTicketDetailApp();
    }

    if (app.renderer === "native") {
      if (window.LumiApps && typeof window.LumiApps[app.id] === "function") {
        var nativeBody = window.LumiApps[app.id](app, ctx);
        if (app.previewNotice) {
          if (_usesInternalPreviewNotice(app.id)) {
            return nativeBody;
          }
          return _renderV2PreviewNotice(app, false) + nativeBody;
        }
        return nativeBody;
      }
    }

    if (app.renderer === "placeholder") {
      if (window.LumiApps && typeof window.LumiApps.placeholder === "function") {
        return window.LumiApps.placeholder(app, ctx);
      }
    }

    return _renderEmptyBody(app);
  }

  function _usesInternalPreviewNotice(appId) {
    return appId === "homeworkCheki" || appId === "achievement" || appId === "profile";
  }

  function _renderV2PreviewNotice(app, isBottom) {
    var className = isBottom ? "v2-dev-inline-notice v2-dev-inline-notice--bottom" : "v2-dev-inline-notice";
    var copy = app && app.id === "homeworkCheki"
      ? "숙제체키 접수는 이번 페이지에서 진행하지 않아요. 미리보기만 볼 수 있어요."
      : "디지털 특전권만 이용할 수 있어요. 아래 기능은 미리보기예요.";
    return (
      '<section class="' + className + '">' +
        '<strong>루미폰 V2 개발중인 화면이에요</strong>' +
        '<p>' + copy + '</p>' +
      '</section>'
    );
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
      els.appWindow.classList.remove("is-open", "is-ticket-view", "is-notification-view", "is-messages-view", "is-settings-view", "is-profile-view", "is-lumitalk-view", "is-homework-cheki-view", "is-benefit-queue-view", "is-cheerbook-view", "is-attendance-view", "is-timeline-view", "is-achievement-view", "is-lumilog-view", "is-message-detail-open");
      els.appWindow.setAttribute("aria-hidden", "true");
    }
    if (els.dock) els.dock.setAttribute("aria-hidden", "false");
    _stopRecentSnapshotTracking();
    state.currentApp = null;
    state.appStack   = [];
    state.appHistory = [];
    state.backRoute  = null;
    state.appBackHandler = null;
    if (!closeOptions.keepOverview) _closeRecentApps();
  }

  function goHome() {
    _closeAppWindow();
    state.returnPage = 0;
    _renderDigitalTicketStatus();
    _loadDigitalTicketStateFromApi(true);
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

    if (state.currentApp && state.appHistory.length) {
      var previousApp = state.appHistory.pop();
      openApp(previousApp, { isHistoryBack: true, keepBackRoute: true });
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
    setAppBadge: setAppBadge,
    refreshDigitalTickets: function (force, done) {
      var before = _getDigitalTicketState();
      var beforeCount = before && Array.isArray(before.tickets) ? before.tickets.length : 0;
      _loadDigitalTicketStateFromApi(force !== false);
      setTimeout(function () {
        var after = _getDigitalTicketState();
        var tickets = after && Array.isArray(after.tickets) ? after.tickets : [];
        if (typeof done === 'function') done({
          tickets: tickets,
          hasTickets: tickets.length > 0,
          changed: tickets.length !== beforeCount
        });
      }, 1800);
    },
    getDigitalTicketState: function () {
      return _getDigitalTicketState();
    }
  };

}());
