(function () {
  window.LumiApps = window.LumiApps || {};

  var API_URL = 'https://script.google.com/macros/s/AKfycbzP-LK_SDX-aRkWPPLoVF05Qz-61ubqkP7DC8LqdBNH7QP3cjhPqlse-UiHMduK02bd/exec';

  var state = {
    preferredMember: '마리링',
    finalMember: '마리링',
    memberEditOpen: false,
    remaining: 2,
    status: '사용 가능',
    orderStatus: '입금 확인 대기',
    issued: false,
    message: '',
    lookupValue: '',
    scannerOpen: false,
    urlTokenApplied: false,
    loading: false,
    ticket: null
  };

  var scanStream = null;
  var scanTimer = null;
  var html5QrScanner = null;

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function getQrTokenFromUrl() {
    try {
      var params = new URLSearchParams(window.location.search || '');
      return params.get('ticket_token') || params.get('ticket') || params.get('token') || '';
    } catch (error) {
      return '';
    }
  }

  function extractToken(raw) {
    var value = String(raw || '').trim();
    if (!value) return '';
    try {
      var url = new URL(value, window.location.href);
      return url.searchParams.get('ticket_token') || url.searchParams.get('ticket') || url.searchParams.get('token') || value;
    } catch (error) {
      return value;
    }
  }

  function syncTicketToState(ticket) {
    if (!ticket) return;
    state.ticket = ticket;
    state.lookupValue = ticket.ticket_token || ticket.ticket_id || state.lookupValue;
    state.preferredMember = ticket.preferred_member || '';
    state.finalMember = ticket.used_member || ticket.preferred_member || '';
    state.remaining = Number(ticket.remaining || 0);
    state.status = ticket.status || '사용 가능';
    state.memberEditOpen = false;
    state.scannerOpen = false;
  }

  function apiRequest(action, params, onDone) {
    var finished = false;
    var attempt = 0;
    var maxAttempts = 2;
    var timeoutMs = 25000;

    function finish(response) {
      if (finished) return;
      finished = true;
      onDone(response || { ok: false, message: '응답이 비어 있어요.' });
    }

    function runAttempt() {
      attempt += 1;

      var callbackName = '__lumiDigitalApiCallback_' + Date.now() + '_' + Math.floor(Math.random() * 100000);
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
          setTimeout(runAttempt, 900);
          return;
        }

        finish({
          ok: false,
          error: 'API_LOAD_FAILED',
          message: '이 브라우저가 API 호출을 막았어요. 아이폰 Safari/Chrome 또는 안드 삼성 브라우저로 다시 열어주세요.'
        });
      };

      timer = setTimeout(function () {
        if (settled || finished) return;
        settled = true;
        cleanup();

        if (attempt < maxAttempts) {
          setTimeout(runAttempt, 900);
          return;
        }

        finish({
          ok: false,
          error: 'API_TIMEOUT',
          message: 'API 응답 시간이 초과됐어요. 같은 버튼을 한 번 더 누르거나 안드 삼성 브라우저/아이폰 Safari로 열어주세요.'
        });
      }, timeoutMs);

      script.src = API_URL + '?' + query.toString();
      document.head.appendChild(script);
    }

    runAttempt();
  }


  function lookupTicket(token) {
    var found = extractToken(token);
    if (!found) {
      state.message = '조회할 티켓번호나 QR 토큰이 없어요.';
      rerender();
      return;
    }

    stopQrScanner();
    state.loading = true;
    state.message = '특전권을 조회 중이에요.';
    state.lookupValue = found;
    rerender();

    apiRequest('lookupTicket', { ticket_token: found }, function (response) {
      state.loading = false;
      if (!response || !response.ok) {
        state.message = (response && response.message) || '특전권 조회에 실패했어요.';
        rerender();
        return;
      }

      syncTicketToState(response.ticket);
      state.message = '특전권 조회 완료. 팬 선택 멤버가 사용 멤버로 자동 적용됐어요.';
      rerender();
    });
  }

  function useTicket() {
    var token = state.lookupValue || (state.ticket && (state.ticket.ticket_token || state.ticket.ticket_id)) || '';
    var member = state.finalMember || state.preferredMember || '';

    if (!token) {
      state.message = '먼저 특전권을 조회해주세요.';
      rerender();
      return;
    }

    state.loading = true;
    state.message = '1회 사용 처리 중이에요.';
    rerender();

    apiRequest('useTicket', {
      ticket_token: token,
      used_member: member,
      staff_name: '스탭'
    }, function (response) {
      state.loading = false;
      if (!response || !response.ok) {
        state.message = (response && response.message) || '사용 처리에 실패했어요.';
        if (response && response.ticket) syncTicketToState(response.ticket);
        rerender();
        return;
      }

      syncTicketToState(response.ticket);
      state.message = response.message || '1회 사용 처리되었습니다.';
      rerender();
    });
  }

  function approveOrder() {
    state.loading = true;
    state.message = '입금 확인 후 발급 처리 중이에요.';
    rerender();

    apiRequest('approveOrder', {
      order_id: 'ORDER-0001',
      staff_name: '스탭'
    }, function (response) {
      state.loading = false;
      if (!response || !response.ok) {
        state.message = (response && response.message) || '주문 승인에 실패했어요.';
        rerender();
        return;
      }

      state.orderStatus = '승인 완료';
      state.issued = true;
      state.message = response.message || '입금 확인 완료. 특전권 발급 상태로 변경했어요.';
      rerender();
    });
  }

  function stopQrScanner() {
    if (scanTimer) {
      clearTimeout(scanTimer);
      scanTimer = null;
    }

    if (html5QrScanner) {
      try {
        html5QrScanner.stop().catch(function () {});
      } catch (error) {}
      try {
        html5QrScanner.clear();
      } catch (error) {}
      html5QrScanner = null;
    }

    if (scanStream) {
      scanStream.getTracks().forEach(function (track) { track.stop(); });
      scanStream = null;
    }
  }

  function rerender() {
    var app = document.querySelector('[data-digital-staff-app]');
    if (app && window.LumiApps.digitalBenefit) app.outerHTML = window.LumiApps.digitalBenefit();
  }

  function startQrScanner() {
    var readerId = 'digital-staff-html5-reader';
    var reader = document.getElementById(readerId);

    if (!reader || !state.scannerOpen) return;

    if (window.Html5Qrcode) {
      try {
        html5QrScanner = new Html5Qrcode(readerId);
        html5QrScanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: function (viewfinderWidth, viewfinderHeight) {
              var minEdge = Math.min(viewfinderWidth, viewfinderHeight);
              var boxSize = Math.max(180, Math.floor(minEdge * 0.72));
              return { width: boxSize, height: boxSize };
            }
          },
          function (decodedText) {
            stopQrScanner();
            lookupTicket(decodedText);
          },
          function () {}
        ).catch(function () {
          state.message = '카메라 스캔을 시작하지 못했어요. 네이버 브라우저 또는 기본 카메라 링크 진입을 사용해주세요.';
          state.scannerOpen = false;
          rerender();
        });
        return;
      } catch (error) {
        state.message = 'QR 스캔 라이브러리를 시작하지 못했어요. 티켓번호 직접 입력을 사용해주세요.';
        state.scannerOpen = false;
        rerender();
        return;
      }
    }

    state.message = 'QR 스캔 라이브러리를 불러오지 못했어요. 인터넷 연결을 확인하거나 티켓번호를 직접 입력해주세요.';
    state.scannerOpen = false;
    rerender();
  }


  function memberButton(name) {
    var selected = state.finalMember === name ? ' is-selected' : '';
    return '<button type="button" class="digital-staff-member-button' + selected + '" data-digital-staff-member="' + esc(name) + '">' + esc(name) + '</button>';
  }

  function renderStatusText() {
    if (!state.ticket) return '조회 전';
    if (state.remaining <= 0) return '사용 완료';
    return state.status;
  }

  function renderNotice() {
    if (!state.message) return '';
    return '<p class="digital-staff-result" data-digital-staff-result>' + esc(state.message) + '</p>';
  }

  function renderScannerPanel() {
    if (!state.scannerOpen) return '';
    return '' +
      '<section class="digital-staff-scanner" data-digital-staff-scanner>' +
        '<div class="digital-staff-scanner-head">' +
          '<strong>QR 스캔</strong>' +
          '<button type="button" data-digital-staff-action="scan-close">닫기</button>' +
        '</div>' +
        '<div id="digital-staff-html5-reader" class="digital-staff-html5-reader"></div>' +
        '<p>팬 화면의 특전권 QR을 카메라 안에 맞춰주세요. 아이폰은 권한 허용 후 화면이 뜨기까지 시간이 걸릴 수 있어요.</p>' +
      '</section>';
  }

  function renderMemberPanel() {
    var edit = state.memberEditOpen ? '' +
      '<div class="digital-staff-member-buttons">' + memberButton('루루') + memberButton('마리링') + '</div>' +
      '<p>예외 상황에서만 실제 사용 멤버를 바꿔주세요.</p>' : '' +
      '<button type="button" class="digital-staff-secondary" data-digital-staff-action="member-edit">멤버 변경</button>' +
      '<p>팬이 선택한 멤버가 자동 적용됩니다. 현장에서 변경이 필요할 때만 수정하세요.</p>';

    return '' +
      '<section class="digital-staff-member-box">' +
        '<div class="digital-staff-member-current">' +
          '<span>사용 멤버</span>' +
          '<strong data-digital-staff-final-member>' + esc(state.finalMember || state.preferredMember || '미선택') + '</strong>' +
        '</div>' +
        edit +
      '</section>';
  }

  function renderTicketResult() {
    if (!state.ticket) {
      return '' +
        '<article class="digital-staff-ticket-card digital-staff-ticket-card--empty">' +
          '<div class="digital-staff-empty-result">' +
            '<strong>아직 조회된 특전권이 없어요.</strong>' +
            '<p>QR 스캔 또는 티켓 조회 후 팬 정보와 잔여 횟수가 표시돼요.</p>' +
          '</div>' +
        '</article>';
    }

    var ticket = state.ticket || {};
    var nickname = ticket.nickname || '';
    var phone = ticket.phone_last4 || '';
    var ticketName = ticket.display_name || ticket.ticket_type || '';

    return '' +
      '<article class="digital-staff-ticket-card">' +
        '<div class="digital-staff-ticket-top">' +
          '<div>' +
            '<span>팬</span>' +
            '<strong>' + esc(nickname) + ' / ' + esc(phone) + '</strong>' +
          '</div>' +
          '<b>' + esc(renderStatusText()) + '</b>' +
        '</div>' +
        '<div class="digital-staff-ticket-grid">' +
          '<p><span>특전권</span><strong>' + esc(ticketName) + '</strong></p>' +
          '<p><span>잔여</span><strong data-digital-staff-remaining>' + esc(state.remaining) + '회</strong></p>' +
          '<p><span>팬 선택 멤버</span><strong>' + esc(state.preferredMember || '미선택') + '</strong></p>' +
          '<p><span>사용 멤버</span><strong data-digital-staff-final-member>' + esc(state.finalMember || state.preferredMember || '미선택') + '</strong></p>' +
        '</div>' +
      '</article>';
  }

  function renderUsePanel() {
    var urlToken = getQrTokenFromUrl();
    var inputValue = state.lookupValue || urlToken || '';
    var disabled = state.loading ? ' disabled' : '';
    var useDisabled = state.loading || !state.ticket ? ' disabled' : '';

    return '' +
      '<section class="digital-staff-panel digital-staff-use-panel">' +
        '<div class="digital-staff-panel-head">' +
          '<span>특전권 조회 / 사용 처리</span>' +
          '<strong>특전권 QR 스캔</strong>' +
        '</div>' +
        '<article class="digital-staff-scan-guide">' +
          '<strong>스캔 방식</strong>' +
          '<p>권장: 아이폰 Safari/Chrome, 안드 삼성 브라우저. 네이버/안드 Chrome은 API 응답이 느리거나 막힐 수 있어요.</p>' +
        '</article>' +
        '<label class="digital-staff-search">' +
          '<span>QR이 안 찍히면 티켓번호나 토큰을 직접 입력해주세요</span>' +
          '<input type="text" value="' + esc(inputValue) + '" placeholder="스캔 전에는 비워둬요" aria-label="티켓번호 또는 QR 토큰" data-digital-staff-token-input />' +
          '<button type="button" data-digital-staff-action="scan"' + disabled + '>QR 스캔</button>' +
          '<button type="button" data-digital-staff-action="lookup"' + disabled + '>티켓 조회</button>' +
        '</label>' +
        renderScannerPanel() +
        renderTicketResult() +
        (state.ticket ? renderMemberPanel() : '') +
        '<button type="button" class="digital-staff-primary" data-digital-staff-action="use"' + useDisabled + '>1회 사용 처리</button>' +
      '</section>';
  }

  function renderOrderPanel() {
    var approved = state.orderStatus === '승인 완료';
    var buttonLabel = state.loading ? '처리 중' : (approved ? '발급 완료' : '입금 확인 후 발급');
    var buttonClass = approved ? ' is-complete' : '';
    var disabled = state.loading ? ' disabled' : '';
    return '' +
      '<section class="digital-staff-panel">' +
        '<div class="digital-staff-panel-head">' +
          '<span>입금 확인 대기</span>' +
          '<strong>주문 승인</strong>' +
        '</div>' +
        '<article class="digital-staff-order-card">' +
          '<div class="digital-staff-order-row"><span>주문자</span><strong>리리 / 4040</strong></div>' +
          '<div class="digital-staff-order-row"><span>입금자명</span><strong>리리</strong></div>' +
          '<div class="digital-staff-order-row"><span>주문내용</span><strong>투샷체키 1개</strong></div>' +
          '<div class="digital-staff-order-row"><span>총금액</span><strong>10,000원</strong></div>' +
          '<div class="digital-staff-order-row"><span>적립 포인트</span><strong>0P</strong></div>' +
          '<div class="digital-staff-order-row"><span>주문상태</span><strong data-digital-staff-order-status>' + esc(state.orderStatus) + '</strong></div>' +
          '<button type="button" class="' + buttonClass + '" data-digital-staff-action="approve"' + disabled + '>' + buttonLabel + '</button>' +
        '</article>' +
      '</section>';
  }

  function renderGuidePanel() {
    return '' +
      '<section class="digital-staff-panel digital-staff-guide">' +
        '<div class="digital-staff-panel-head">' +
          '<span>운영 기준</span>' +
          '<strong>디지털 특전 처리</strong>' +
        '</div>' +
        '<p>사용 멤버는 팬이 선택한 멤버를 기본으로 자동 적용해요.</p>' +
        '<p>현장 변경이 필요한 예외 상황에서만 멤버 변경을 눌러 수정해요.</p>' +
      '</section>';
  }

  window.LumiApps.digitalBenefit = function () {
    var urlToken = getQrTokenFromUrl();
    if (urlToken && !state.urlTokenApplied) {
      state.urlTokenApplied = true;
      setTimeout(function () { lookupTicket(urlToken); }, 80);
    }
    return '' +
      '<section class="digital-staff-app" data-digital-staff-app>' +
        '<header class="digital-staff-hero">' +
          '<span>DIGITAL BENEFIT</span>' +
          '<h2>디지털 특전 관리</h2>' +
          '<p>입금 승인, QR 조회, 사용 처리를 확인해요.</p>' +
        '</header>' +
        renderOrderPanel() +
        renderUsePanel() +
        renderGuidePanel() +
        renderNotice() +
      '</section>';
  };

  if (!window.__digitalStaffBenefitBound) {
    window.__digitalStaffBenefitBound = true;
    document.addEventListener('click', function (event) {
      var memberButton = event.target.closest('[data-digital-staff-member]');
      if (memberButton) {
        state.finalMember = memberButton.getAttribute('data-digital-staff-member') || state.preferredMember;
        state.memberEditOpen = false;
        state.message = '사용 멤버를 ' + state.finalMember + '으로 변경했어요.';
        rerender();
        return;
      }

      var actionButton = event.target.closest('[data-digital-staff-action]');
      if (!actionButton) return;
      var action = actionButton.getAttribute('data-digital-staff-action');

      if (action === 'lookup') {
        var tokenInput = document.querySelector('[data-digital-staff-token-input]');
        lookupTicket(tokenInput ? tokenInput.value : '');
        return;
      }

      if (action === 'scan') {
        stopQrScanner();
        state.scannerOpen = true;
        state.message = '';
      }

      if (action === 'scan-close') {
        stopQrScanner();
        state.scannerOpen = false;
      }

      if (action === 'member-edit') {
        state.memberEditOpen = true;
        state.message = '';
      }

      if (action === 'approve') {
        approveOrder();
        return;
      }

      if (action === 'use') {
        useTicket();
        return;
      }

      rerender();

      if (action === 'scan') {
        setTimeout(startQrScanner, 80);
      }
    });
  }
}());
