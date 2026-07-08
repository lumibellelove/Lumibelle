(function () {
  window.LumiApps = window.LumiApps || {};

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
    urlTokenApplied: false
  };

  var scanStream = null;
  var scanTimer = null;

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

  function applyLookup(token) {
    var found = extractToken(token);
    if (found) state.lookupValue = found;
    state.finalMember = state.preferredMember;
    state.memberEditOpen = false;
    state.scannerOpen = false;
    state.message = found ? 'QR 스캔 조회 완료. 팬 선택 멤버가 자동 적용됐어요.' : '티켓 조회 완료. 팬 선택 멤버가 사용 멤버로 자동 적용됐어요.';
  }

  function stopQrScanner() {
    if (scanTimer) {
      clearTimeout(scanTimer);
      scanTimer = null;
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
    var video = document.querySelector('[data-digital-staff-scan-video]');
    if (!video || !state.scannerOpen) return;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      state.message = '이 브라우저에서는 카메라 스캔을 사용할 수 없어요. 티켓번호를 직접 입력해주세요.';
      state.scannerOpen = false;
      rerender();
      return;
    }

    if (!window.BarcodeDetector) {
      state.message = '이 브라우저에서는 QR 자동 인식이 지원되지 않아요. 스탭폰 기본 카메라로 QR을 찍거나 티켓번호를 직접 입력해주세요.';
      state.scannerOpen = false;
      rerender();
      return;
    }

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false }).then(function (stream) {
      scanStream = stream;
      video.srcObject = stream;
      video.setAttribute('playsinline', 'playsinline');
      return video.play();
    }).then(function () {
      var detector = new BarcodeDetector({ formats: ['qr_code'] });

      function detectLoop() {
        if (!state.scannerOpen || !video || video.readyState < 2) {
          scanTimer = setTimeout(detectLoop, 300);
          return;
        }

        detector.detect(video).then(function (codes) {
          if (codes && codes.length) {
            var value = codes[0].rawValue || '';
            stopQrScanner();
            applyLookup(value);
            rerender();
            return;
          }
          scanTimer = setTimeout(detectLoop, 350);
        }).catch(function () {
          scanTimer = setTimeout(detectLoop, 500);
        });
      }

      detectLoop();
    }).catch(function () {
      state.message = '카메라 권한이 막혔어요. 권한 허용 후 다시 누르거나 티켓번호를 직접 입력해주세요.';
      state.scannerOpen = false;
      rerender();
    });
  }

  function memberButton(name) {
    var selected = state.finalMember === name ? ' is-selected' : '';
    return '<button type="button" class="digital-staff-member-button' + selected + '" data-digital-staff-member="' + esc(name) + '">' + esc(name) + '</button>';
  }

  function renderStatusText() {
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
        '<video data-digital-staff-scan-video muted playsinline></video>' +
        '<p>팬 화면의 특전권 QR을 카메라 안에 맞춰주세요.</p>' +
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

  function renderUsePanel() {
    var urlToken = getQrTokenFromUrl();
    var inputValue = state.lookupValue || urlToken || 'TKT-0621-00023';

    return '' +
      '<section class="digital-staff-panel digital-staff-use-panel">' +
        '<div class="digital-staff-panel-head">' +
          '<span>특전권 조회 / 사용 처리</span>' +
          '<strong>특전권 QR 스캔</strong>' +
        '</div>' +
        '<article class="digital-staff-scan-guide">' +
          '<strong>스캔 방식</strong>' +
          '<p>QR 스캔 버튼을 누르면 카메라가 열려요. 안 되면 스탭폰 기본 카메라로 QR을 찍거나 티켓번호를 직접 입력해요.</p>' +
        '</article>' +
        '<label class="digital-staff-search">' +
          '<span>QR이 안 찍히면 티켓번호나 토큰을 직접 입력해주세요</span>' +
          '<input type="text" value="' + esc(inputValue) + '" aria-label="티켓번호 또는 QR 토큰" data-digital-staff-token-input />' +
          '<button type="button" data-digital-staff-action="scan">QR 스캔</button>' +
          '<button type="button" data-digital-staff-action="lookup">티켓 조회</button>' +
        '</label>' +
        renderScannerPanel() +
        '<article class="digital-staff-ticket-card">' +
          '<div class="digital-staff-ticket-top">' +
            '<div>' +
              '<span>팬</span>' +
              '<strong>리리 / 4040</strong>' +
            '</div>' +
            '<b>' + esc(renderStatusText()) + '</b>' +
          '</div>' +
          '<div class="digital-staff-ticket-grid">' +
            '<p><span>특전권</span><strong>투샷체키</strong></p>' +
            '<p><span>잔여</span><strong data-digital-staff-remaining>' + esc(state.remaining) + '회</strong></p>' +
            '<p><span>팬 선택 멤버</span><strong>' + esc(state.preferredMember) + '</strong></p>' +
            '<p><span>사용 멤버</span><strong data-digital-staff-final-member>' + esc(state.finalMember || state.preferredMember || '미선택') + '</strong></p>' +
          '</div>' +
        '</article>' +
        renderMemberPanel() +
        '<button type="button" class="digital-staff-primary" data-digital-staff-action="use">1회 사용 처리</button>' +
      '</section>';
  }

  function renderOrderPanel() {
    var approved = state.orderStatus === '승인 완료';
    var buttonLabel = approved ? '발급 완료' : '입금 확인 후 발급';
    var buttonClass = approved ? ' is-complete' : '';
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
          '<button type="button" class="' + buttonClass + '" data-digital-staff-action="approve">' + buttonLabel + '</button>' +
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
      applyLookup(urlToken);
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
        applyLookup(tokenInput ? tokenInput.value : '');
      }

      if (action === 'scan') {
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
        state.orderStatus = '승인 완료';
        state.issued = true;
        state.message = '입금 확인 완료. 특전권 발급 상태로 변경했어요.';
      }

      if (action === 'use' && state.remaining > 0) {
        if (!state.finalMember) state.finalMember = state.preferredMember;
        state.remaining -= 1;
        state.message = state.finalMember + ' 사용으로 1회 처리했어요.';
        if (state.remaining <= 0) state.status = '사용 완료';
      }

      rerender();

      if (action === 'scan') {
        setTimeout(startQrScanner, 80);
      }
    });
  }
}());
