(function () {
  if (!window.LumiApps) window.LumiApps = {};

  var BANK_NAME = '우리은행';
  var BANK_NUMBER = '1002-466-445046';
  var BANK_HOLDER = 'ㅇㅅㅇ';
  var STAFF_URL = 'https://lumibellelove.com/staff/index.html';

  var ITEMS = [
    { id: 'same', name: '샤메권', price: 7000, ticketUnits: 1, descLines: ['솔로 or 투샷 중 택 1', '교류 90초'] },
    { id: 'video', name: '영상권', price: 10000, ticketUnits: 1, descLines: ['틱톡 및 SNS 업로드 가능', '교류 60초'] },
    { id: 'group', name: '단체 촬영권', price: 30000, ticketUnits: 1, descLines: ['체키 / 사메 중 택 1', '교류 180초'] },
    { id: 'pin', name: '핀체키 특전권', price: 7000, ticketUnits: 1, descLines: ['아이돌 혼자', '교류 90초'] },
    { id: 'twoshot', name: '투샷체키 특전권', price: 10000, ticketUnits: 2, descLines: ['아이돌과 함께', '교류 120초'] }
  ];

  var purchaseState = createInitialState();
  var pendingPollTimer = null;
  var pendingPollCount = 0;

  function createInitialState() {
    return {
      view: 'form',
      depositorName: '',
      quantities: ITEMS.reduce(function (acc, item) {
        acc[item.id] = 0;
        return acc;
      }, {}),
      pendingOrder: null
    };
  }

  function formatNumber(value) {
    return Number(value || 0).toLocaleString('ko-KR');
  }

  function escHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getTotals() {
    return ITEMS.reduce(function (acc, item) {
      var qty = Number(purchaseState.quantities[item.id] || 0);
      acc.amount += item.price * qty;
      acc.ticketUnits += item.ticketUnits * qty;
      acc.selectionCount += qty;
      return acc;
    }, { amount: 0, ticketUnits: 0, selectionCount: 0 });
  }

  function getPointValue() {
    return Math.floor(getTotals().ticketUnits / 15);
  }

  function getPendingPointValue(order) {
    return Math.floor(Number(order && order.ticketUnits || 0) / 15);
  }

  function buildOrderNumber() {
    var now = new Date();
    var year = String(now.getFullYear());
    var month = String(now.getMonth() + 1).padStart(2, '0');
    var day = String(now.getDate()).padStart(2, '0');
    return year + month + day + '-0023';
  }

  function buildOrderToken(orderNumber) {
    return 'ORD-0708-00023';
  }

  function getOrderQrValue(order) {
    var token = String(order && order.orderToken || '').trim();
    return STAFF_URL + '?order_token=' + encodeURIComponent(token);
  }

  function renderOrderQr(order) {
    var token = String(order && order.orderToken || '').trim();
    var knownQrMap = window.LumiDigitalOrderQrMap || {};
    var mappedImage = knownQrMap[token] || order.qrDataUrl || order.qrImage || '';

    if (mappedImage) {
      return '<img class="ticket-pending-qr__image" src="' + escHtml(mappedImage) + '" alt="입금 확인용 주문 QR" data-order-qr-value="' + escHtml(getOrderQrValue(order)) + '" />';
    }

    return '' +
      '<div class="ticket-pending-qr__fallback" data-order-qr-value="' + escHtml(getOrderQrValue(order)) + '">' +
        '<strong>주문 QR 발급 대기</strong>' +
        '<span>' + escHtml(token) + '</span>' +
      '</div>';
  }

  function createPendingOrder() {
    var totals = getTotals();
    var orderNumber = buildOrderNumber();
    var orderToken = buildOrderToken(orderNumber);
    return {
      orderNumber: orderNumber,
      orderToken: orderToken,
      orderQrValue: STAFF_URL + '?order_token=' + encodeURIComponent(orderToken),
      depositorName: String(purchaseState.depositorName || '').trim() || '미입력',
      amount: totals.amount,
      ticketUnits: totals.ticketUnits,
      bankName: BANK_NAME,
      accountNumber: BANK_NUMBER,
      bankHolder: BANK_HOLDER
    };
  }

  function renderItem(item) {
    var qty = Number(purchaseState.quantities[item.id] || 0);
    var descLines = Array.isArray(item.descLines) ? item.descLines : [];
    return '' +
      '<article class="ticket-purchase-item" data-ticket-purchase-item>' +
        '<div class="ticket-purchase-item__art" aria-hidden="true"></div>' +
        '<div class="ticket-purchase-item__body">' +
          '<strong>' + escHtml(item.name) + '</strong>' +
          '<span class="ticket-purchase-item__price">' + formatNumber(item.price) + '원</span>' +
          '<p>' + descLines.map(function (line) { return '<span>' + escHtml(line) + '</span>'; }).join('') + '</p>' +
        '</div>' +
        '<div class="ticket-purchase-stepper" data-ticket-stepper="' + item.id + '">' +
          '<button type="button" class="ticket-purchase-stepper__button" data-ticket-step="decrease" data-ticket-id="' + item.id + '" aria-label="수량 줄이기">−</button>' +
          '<strong data-ticket-qty="' + item.id + '">' + qty + '</strong>' +
          '<button type="button" class="ticket-purchase-stepper__button" data-ticket-step="increase" data-ticket-id="' + item.id + '" aria-label="수량 늘리기">＋</button>' +
        '</div>' +
      '</article>';
  }

  function renderSummary() {
    return '' +
      '<div class="ticket-purchase-summary-row">' +
        '<span>총 결제 금액</span>' +
        '<strong data-ticket-total-amount>' + formatNumber(getTotals().amount) + '원</strong>' +
      '</div>' +
      '<div class="ticket-purchase-summary-row">' +
        '<span>예상 물판 포인트</span>' +
        '<strong data-ticket-total-point>' + getPointValue() + 'P</strong>' +
      '</div>' +
      '<div class="ticket-purchase-guide">' +
        '<strong>안내</strong>' +
        '<p>유료 특전권은 15장 구매마다 물판 포인트 1P가 적립돼요.</p>' +
        '<p>이벤트 특전권은 핀체키 1장 + 교류 60초 기준이며 적립 대상이 아니에요.</p>' +
      '</div>';
  }

  function renderFormView() {
    return '' +
      '<section class="ticket-purchase-app">' +
        '<section class="ticket-purchase-hero">' +
          '<span class="ticket-purchase-kicker">DIGITAL TICKET</span>' +
          '<h2>현장 특전권 구매</h2>' +
          '<p>원하는 특전권 종류와 수량을 선택해 신청해 주세요.</p>' +
        '</section>' +
        '<section class="ticket-purchase-card">' +
          '<div class="ticket-purchase-card__label">1. 특전권 종류 선택</div>' +
          '<div class="ticket-purchase-list">' + ITEMS.map(renderItem).join('') + '</div>' +
        '</section>' +
        '<section class="ticket-purchase-card">' +
          '<div class="ticket-purchase-card__label">2. 입금자명</div>' +
          '<label class="ticket-purchase-input-wrap">' +
            '<input type="text" class="ticket-purchase-input" data-ticket-depositor-input placeholder="입금자명을 입력해주세요" value="' + escHtml(purchaseState.depositorName) + '">' +
          '</label>' +
          '<p class="ticket-purchase-help">입금 확인을 위해 실제 입금자명을 정확히 입력해 주세요.</p>' +
        '</section>' +
        '<section class="ticket-purchase-card">' +
          '<div class="ticket-purchase-card__label">3. 신청 정보 요약</div>' +
          '<div class="ticket-purchase-summary" data-ticket-summary>' + renderSummary() + '</div>' +
        '</section>' +
        '<button type="button" class="ticket-purchase-submit" data-ticket-purchase-submit>구매 신청하기</button>' +
      '</section>';
  }

  function renderPendingView() {
    var order = purchaseState.pendingOrder || createPendingOrder();
    var pointValue = getPendingPointValue(order);

    return '' +
      '<section class="ticket-purchase-app ticket-purchase-app--pending">' +
        '<section class="ticket-pending-hero">' +
          '<h2>입금 확인 대기</h2>' +
          '<p>신청 후 입금이 완료되면 운영 확인 후 특전권이 발급돼요.</p>' +
        '</section>' +
        '<section class="ticket-purchase-card ticket-pending-status">' +
          '<div class="ticket-pending-status__art" aria-hidden="true"></div>' +
          '<div class="ticket-pending-status__body">' +
            '<div class="ticket-purchase-card__label ticket-purchase-card__label--status">입금 확인 대기</div>' +
            '<p>입금 후 스탭에게 아래 QR을 보여주세요.</p>' +
            '<p>확인 후 특전권이 발급돼요.</p>' +
          '</div>' +
        '</section>' +
        '<section class="ticket-purchase-card ticket-pending-qr">' +
          '<div class="ticket-purchase-card__label">입금 확인용 QR</div>' +
          '<div class="ticket-pending-qr__box">' + renderOrderQr(order) + '</div>' +
          '<p>이 QR은 입금 확인 대기 주문을 찾는 용도예요.</p>' +
          '<p>발급 후 특전권함으로 자동 이동해요.</p>' +
          '<strong class="ticket-pending-live-status" data-ticket-pending-live-status>입금 확인 상태를 자동으로 확인 중이에요.</strong>' +
        '</section>' +
        '<section class="ticket-purchase-card ticket-pending-order-card">' +
          '<div class="ticket-purchase-card__label">주문 정보</div>' +
          '<div class="ticket-pending-info">' +
            '<div class="ticket-pending-info__row"><span>주문번호</span><strong>' + escHtml(order.orderNumber) + '</strong></div>' +
            '<div class="ticket-pending-info__row"><span>주문토큰</span><strong>' + escHtml(order.orderToken) + '</strong></div>' +
            '<div class="ticket-pending-info__row"><span>입금자명</span><strong>' + escHtml(order.depositorName) + '</strong></div>' +
            '<div class="ticket-pending-info__row"><span>결제 금액</span><strong class="ticket-pending-info__price">' + formatNumber(order.amount) + '원</strong></div>' +
            '<div class="ticket-pending-info__row"><span>은행명</span><strong>' + escHtml(order.bankName) + '</strong></div>' +
            '<div class="ticket-pending-info__row"><span>계좌번호</span><strong>' + escHtml(order.accountNumber) + '</strong></div>' +
            '<div class="ticket-pending-info__row"><span>예금주</span><strong>' + escHtml(order.bankHolder) + '</strong></div>' +
          '</div>' +
        '</section>' +
        '<section class="ticket-purchase-guide ticket-purchase-guide--pending">' +
          '<strong>안내</strong>' +
          '<p>위 계좌로 결제 금액을 입금해 주세요.</p>' +
          '<p>입금자명이 다르면 확인이 늦어질 수 있어요.</p>' +
          '<p>확인 후 상세보기에서 특전권 사용 QR이 새로 발급돼요.</p>' +
        '</section>' +
        '<section class="ticket-purchase-card ticket-pending-point">' +
          '<div class="ticket-pending-info__row ticket-pending-info__row--single"><span>예상 적립 물판 포인트</span><strong class="ticket-pending-info__price">' + pointValue + 'P</strong></div>' +
        '</section>' +

        '<button type="button" class="ticket-purchase-submit" data-ticket-go-home>내 특전권함으로 돌아가기</button>' +
      '</section>';
  }

  function stopPendingPoll() {
    if (pendingPollTimer) {
      clearInterval(pendingPollTimer);
      pendingPollTimer = null;
    }
  }

  function checkIssuedTickets(root, silent) {
    if (!window.LumiPhone || typeof window.LumiPhone.refreshDigitalTickets !== 'function') return;

    window.LumiPhone.refreshDigitalTickets(true, function (result) {
      if (!purchaseState || purchaseState.view !== 'pending') return;

      if (result && result.hasTickets) {
        stopPendingPoll();
        if (window.LumiPhone && typeof window.LumiPhone.goHome === 'function') {
          window.LumiPhone.goHome();
        }
        return;
      }

      if (!silent && root) {
        var statusEl = root.querySelector('[data-ticket-pending-live-status]');
        if (statusEl) statusEl.textContent = '아직 확인 중이에요. 입금 확인 후 자동으로 특전권함에 표시돼요.';
      }
    });
  }

  function startPendingPoll(root) {
    if (purchaseState.view !== 'pending') {
      stopPendingPoll();
      return;
    }

    if (pendingPollTimer) return;
    pendingPollCount = 0;

    checkIssuedTickets(root, true);

    pendingPollTimer = setInterval(function () {
      if (purchaseState.view !== 'pending') {
        stopPendingPoll();
        return;
      }

      pendingPollCount += 1;
      checkIssuedTickets(root, pendingPollCount % 3 !== 0);
    }, 5000);
  }

  function renderRoot() {
    return purchaseState.view === 'pending' ? renderPendingView() : renderFormView();
  }

  function rerenderSummary(root) {
    if (!root) return;
    var amountEl = root.querySelector('[data-ticket-total-amount]');
    var pointEl = root.querySelector('[data-ticket-total-point]');
    if (amountEl) amountEl.textContent = formatNumber(getTotals().amount) + '원';
    if (pointEl) pointEl.textContent = getPointValue() + 'P';
  }

  function rerender(root) {
    if (!root) return;
    root.innerHTML = renderRoot();
    bind(root);
  }

  function updateBackHandler() {
    if (!window.LumiPhone || typeof window.LumiPhone.setAppBackHandler !== 'function') return;
    if (purchaseState.view === 'pending') {
      window.LumiPhone.setAppBackHandler(function () {
        stopPendingPoll();
        purchaseState.view = 'form';
        purchaseState.pendingOrder = null;
        if (window.LumiPhone && typeof window.LumiPhone.openApp === 'function') {
          window.LumiPhone.openApp('digitalTicketPurchase');
        }
        return true;
      });
    } else {
      window.LumiPhone.setAppBackHandler(null);
    }
  }

  function bind(root) {
    if (!root) return;

    updateBackHandler();

    if (purchaseState.view === 'pending') startPendingPoll(root);
    else stopPendingPoll();

    root.onclick = function (event) {
      var stepButton = event.target.closest('[data-ticket-step]');
      if (stepButton && purchaseState.view === 'form') {
        var ticketId = stepButton.getAttribute('data-ticket-id');
        var stepType = stepButton.getAttribute('data-ticket-step');
        var current = Number(purchaseState.quantities[ticketId] || 0);
        purchaseState.quantities[ticketId] = stepType === 'increase' ? current + 1 : Math.max(0, current - 1);
        var qtyEl = root.querySelector('[data-ticket-qty="' + ticketId + '"]');
        if (qtyEl) qtyEl.textContent = String(purchaseState.quantities[ticketId]);
        rerenderSummary(root);
        return;
      }

      if (event.target.closest('[data-ticket-purchase-submit]')) {
        purchaseState.pendingOrder = createPendingOrder();
        purchaseState.view = 'pending';
        rerender(root);
        return;
      }

      if (event.target.closest('[data-ticket-go-home]')) {
        if (window.LumiPhone && typeof window.LumiPhone.goHome === 'function') {
          stopPendingPoll();
          purchaseState.view = 'form';
          purchaseState.pendingOrder = null;
          window.LumiPhone.goHome();
        }
      }
    };

    var input = root.querySelector('[data-ticket-depositor-input]');
    if (input && purchaseState.view === 'form') {
      input.oninput = function () {
        purchaseState.depositorName = input.value;
      };
    }
  }

  window.LumiApps.digitalTicketPurchase = function () {
    return renderRoot();
  };

  window.LumiApps.bindDigitalTicketPurchase = function (root) {
    bind(root);
  };
}());
