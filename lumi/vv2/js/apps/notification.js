window.LumiApps = window.LumiApps || {};

(function () {
  var SETTINGS_STORAGE_KEY = 'lumiphone-v2-settings';
  var NOTIFICATION_TYPES = {
    ticket: 'ticket',
    benefitQueue: 'benefitQueue',
    homeworkCheki: 'homeworkCheki',
    point: 'point',
    lumitalk: 'lumitalk',
    messages: 'messages',
    mail: 'mail'
  };
  var activeNotificationApp = null;

  window.LumiNotificationState = window.LumiNotificationState || {
    activeTab: 'all',
    items: [
      { id: 'transfer-request', category: NOTIFICATION_TYPES.ticket, type: 'action', unread: true, title: '티켓 양도 요청', body: '루미님이 티켓 양도를 요청했어요.', meta: '루미벨 데뷔 라이브 · 수락 대기', time: '15분 전', target: 'ticket-transfer', imageLabel: '양도 알림 이미지' },
      { id: 'homework-ready', category: NOTIFICATION_TYPES.homeworkCheki, type: 'action', unread: true, title: '숙제체키 수령 가능', body: '마리링 숙제체키를 수령할 수 있어요.', meta: '숙제체키 관리번호 HC-001', time: '1시간 전', target: 'homeworkCheki', targetId: 'hc-001', imageLabel: '숙제체키 알림 이미지' },
      { id: 'booking-complete', category: NOTIFICATION_TYPES.ticket, type: 'result', unread: false, title: '공연 예매 완료', body: '루미벨 데뷔 라이브 예매가 완료되었어요.', meta: '티켓함에서 예매 내역을 확인할 수 있어요.', time: '어제', target: 'ticket', targetId: 'ticket:ticket-debut-A-023', imageLabel: '예매 알림 이미지' },
      { id: 'birthday-open', category: NOTIFICATION_TYPES.ticket, type: 'info', unread: true, title: 'Birthday Ticket 사용 가능', body: '이번 달 Birthday Ticket을 사용할 수 있어요.', meta: '생일 체키 · 샤메 · 교류 120초', time: '2일 전', target: 'ticket', targetId: 'birthday', imageLabel: 'Birthday Ticket 이미지' }
    ]
  };

  function readNotificationSettings() {
    try {
      var saved = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) || '{}');
      return {
        ticket: saved.notifyTicket !== false,
        benefitQueue: saved.notifyQueue !== false,
        homeworkCheki: saved.notifyHomework !== false,
        point: saved.notifyPoint === true,
        lumitalk: saved.notifyLumitalk !== false,
        messages: saved.notifyMessages !== false,
        mail: saved.notifyMail !== false
      };
    } catch (error) {
      return {
        ticket: true,
        benefitQueue: true,
        homeworkCheki: true,
        point: false,
        lumitalk: true,
        messages: true,
        mail: true
      };
    }
  }

  function currentViewerId() {
    return window.LumiTicketStore && window.LumiTicketStore.viewerId;
  }

  function notificationVisibleToViewer(item) {
    return !item.audienceId || item.audienceId === currentViewerId();
  }

  function unreadNotificationCount() {
    return window.LumiNotificationState.items.filter(function (item) {
      return notificationVisibleToViewer(item) && item.unread;
    }).length;
  }

  function notificationTransferRequestCount() {
    return window.LumiNotificationState.items.filter(function (item) {
      return notificationVisibleToViewer(item) && item.transferId && item.type === 'action' && item.pending !== false;
    }).length;
  }

  function syncNotificationBadge() {
    var count = unreadNotificationCount();
    document.querySelectorAll('[data-notification-badge]').forEach(function (badge) {
      badge.textContent = String(count);
      badge.hidden = count === 0;
    });
    if (window.LumiPhone && typeof window.LumiPhone.setAppBadge === 'function') {
      window.LumiPhone.setAppBadge('ticket', notificationTransferRequestCount());
    }
  }

  function emitNotificationStateChange() {
    document.dispatchEvent(new CustomEvent('lumi:notification-state-change'));
  }

  function notificationAssetSlot(label, className) {
    return '<span class="notification-asset-slot ' + className + '" data-asset-slot="notification" aria-label="' + label + '"><span>' + label + '</span></span>';
  }

  function makeNotificationId(category) {
    return 'ntf-' + String(category || 'general') + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
  }

  function isNotificationEnabled(category) {
    var settings = readNotificationSettings();
    return Object.prototype.hasOwnProperty.call(settings, category) ? settings[category] !== false : true;
  }

  function normalizeNotification(payload) {
    var data = payload || {};
    return {
      id: data.id || makeNotificationId(data.category),
      category: data.category || NOTIFICATION_TYPES.messages,
      audienceId: data.audienceId || null,
      type: data.type || 'info',
      pending: data.pending,
      unread: data.unread !== false,
      title: data.title || '새 알림',
      body: data.body || '',
      meta: data.meta || '',
      time: data.time || '방금',
      target: data.target || null,
      targetId: data.targetId || null,
      transferId: data.transferId || null,
      imageLabel: data.imageLabel || '알림 이미지',
      createdAt: data.createdAt || new Date().toISOString()
    };
  }

  window.LumiNotification = window.LumiNotification || {};

  /* API 연결 시 이 함수의 insert 부분만 POST /notifications 또는 실시간 이벤트 수신으로 교체. */
  window.LumiNotification.emit = function (payload) {
    var item = normalizeNotification(payload);
    if (!item.category || !isNotificationEnabled(item.category)) return null;
    window.LumiNotificationState.items.unshift(item);
    syncNotificationBadge();
    emitNotificationStateChange();
    return item;
  };

  window.LumiNotification.isEnabled = isNotificationEnabled;

  window.LumiNotification.markRead = function (notificationId) {
    var item = window.LumiNotificationState.items.find(function (entry) { return entry.id === notificationId; });
    if (!item || !item.unread) return;
    item.unread = false;
    syncNotificationBadge();
    emitNotificationStateChange();
  };

  window.LumiNotification.markAllRead = function () {
    window.LumiNotificationState.items.forEach(function (item) {
      if (notificationVisibleToViewer(item)) item.unread = false;
    });
    syncNotificationBadge();
    emitNotificationStateChange();
  };

  /* 화면에 버튼을 추가하지 않는 더미 이벤트 호출부. 실제 이벤트 API 연결 때 같은 payload 형태를 사용. */
  window.LumiNotification.emitDemo = function (category) {
    var demos = {
      ticket: { category: NOTIFICATION_TYPES.ticket, type: 'action', title: '티켓 양도 요청', body: '새 티켓 양도 요청이 도착했어요.', meta: '티켓함에서 요청을 확인해요.', target: 'ticket', imageLabel: '티켓 알림 이미지' },
      benefitQueue: { category: NOTIFICATION_TYPES.benefitQueue, type: 'action', title: '특전회 호출', body: '현재 호출 순서가 되었어요.', meta: '특전회 대기에서 내 순서를 확인해요.', target: 'benefitQueue', imageLabel: '특전회 대기 알림 이미지' },
      homeworkCheki: { category: NOTIFICATION_TYPES.homeworkCheki, type: 'result', title: '숙제체키 수령 가능', body: '숙제체키를 수령할 수 있어요.', meta: '숙제체키 앱에서 확인해요.', target: 'homeworkCheki', imageLabel: '숙제체키 알림 이미지' },
      point: { category: NOTIFICATION_TYPES.point, type: 'result', title: '반짝 포인트 적립', body: '새 반짝 포인트가 적립되었어요.', meta: '포인트 내역에서 확인해요.', target: 'point', imageLabel: '포인트 알림 이미지' },
      lumitalk: { category: NOTIFICATION_TYPES.lumitalk, type: 'info', title: '루미톡 새 메시지', body: '새 답장이 도착했어요.', meta: '루미톡에서 확인해요.', target: 'lumitalk', imageLabel: '루미톡 알림 이미지' },
      messages: { category: NOTIFICATION_TYPES.messages, type: 'result', title: '문자 도착', body: '운영 안내 문자가 도착했어요.', meta: '문자함에서 확인해요.', target: 'messages', imageLabel: '문자 알림 이미지' },
      mail: { category: NOTIFICATION_TYPES.mail, type: 'info', title: '새 우편 도착', body: '루미벨의 공식 안내가 도착했어요.', meta: '우편함에서 확인해요.', target: 'mail', imageLabel: '우편함 알림 이미지' }
    };
    return window.LumiNotification.emit(demos[category] || demos.messages);
  };

  window.LumiNotification.upsertTransferRequest = function (transfer, event) {
    if (!transfer || !transfer.id) return;
    var recipient = transfer.recipient || {};
    var items = window.LumiNotificationState.items;
    var existing = items.find(function (item) { return item.transferId === transfer.id; });
    if (!existing && !isNotificationEnabled(NOTIFICATION_TYPES.ticket)) return;
    var sender = transfer.sender || {};
    var eventTitle = event && event.title ? event.title : '티켓';
    var item = existing || { id: 'transfer-request-' + transfer.id, transferId: transfer.id, category: NOTIFICATION_TYPES.ticket };
    item.audienceId = recipient.id;
    item.type = 'action';
    item.pending = true;
    item.unread = true;
    item.title = '티켓 양도 요청';
    item.body = (sender.nickname || '루미') + '님이 티켓 양도를 요청했어요.';
    item.meta = eventTitle + ' · 수락 대기';
    item.time = '방금';
    item.target = 'ticket-transfer';
    item.targetId = transfer.id;
    item.imageLabel = '양도 알림 이미지';
    item.createdAt = item.createdAt || new Date().toISOString();
    if (!existing) items.unshift(item);
    syncNotificationBadge();
    emitNotificationStateChange();
  };

  window.LumiNotification.resolveTransferRequest = function (transferId, status, event) {
    if (!transferId) return;
    var item = window.LumiNotificationState.items.find(function (entry) { return entry.transferId === transferId; });
    if (!item) return;
    var labels = { accepted: '수락 완료', rejected: '거절 완료', cancelled: '요청 취소', expired: '요청 만료' };
    item.pending = false;
    item.unread = false;
    item.type = 'result';
    item.resolvedAt = new Date().toISOString();
    item.title = '티켓 양도 ' + (labels[status] || '처리 완료');
    item.body = status === 'accepted' ? '티켓 양도가 완료되었어요.' : '티켓 양도 요청이 처리되었어요.';
    item.meta = (event && event.title ? event.title : '티켓') + ' · 티켓함에서 이력을 확인할 수 있어요.';
    item.time = '방금';
    syncNotificationBadge();
    emitNotificationStateChange();
  };

  window.LumiApps.notification = function () {
    return [
      '<section class="notification-app" data-notification-app>',
        '<header class="notification-page-hero">',
          '<div class="notification-hero-top">',
            '<div class="notification-title-block"><h2>알림센터</h2><p>루미벨의 새로운 소식을 확인해요.</p></div>',
          '</div>',
        '</header>',
        '<div class="notification-tabs" role="tablist" aria-label="알림 분류">',
          '<button class="notification-tab is-active" type="button" data-notification-tab="all">전체</button>',
          '<button class="notification-tab" type="button" data-notification-tab="unread">안 읽음</button>',
        '</div>',
        '<div class="notification-list" data-notification-list></div>',
        '<button class="notification-read-all" type="button" data-notification-read-all>모두 읽음으로 표시</button>',
      '</section>'
    ].join('');
  };

  window.LumiApps.bindNotification = function (root) {
    var app = root.querySelector('[data-notification-app]');
    if (!app || app.__lumiNotificationBound) return;
    app.__lumiNotificationBound = true;
    var state = window.LumiNotificationState;

    function visibleItems() {
      var scoped = state.items.filter(notificationVisibleToViewer);
      return state.activeTab === 'unread' ? scoped.filter(function (item) { return item.unread; }) : scoped.slice();
    }

    function itemMarkup(item) {
      var pending = item.type === 'action' && item.pending !== false;
      return [
        '<button type="button" class="notification-card' + (item.unread ? ' is-unread' : '') + (pending ? ' is-action' : '') + '" data-notification-id="' + item.id + '">',
          '<span class="notification-card-unread" aria-hidden="true"' + (item.unread ? '' : ' hidden') + '></span>',
          notificationAssetSlot(item.imageLabel, 'notification-card-image'),
          '<span class="notification-card-copy">',
            '<span class="notification-card-top"><strong>' + item.title + '</strong><em>' + item.time + '</em></span>',
            '<span class="notification-card-body">' + item.body + '</span>',
            '<span class="notification-card-meta">' + item.meta + '</span>',
          '</span>',
        '</button>'
      ].join('');
    }

    function render() {
      var list = app.querySelector('[data-notification-list]');
      var items = visibleItems();
      app.querySelectorAll('[data-notification-tab]').forEach(function (button) {
        button.classList.toggle('is-active', button.getAttribute('data-notification-tab') === state.activeTab);
      });
      if (!list) return;
      if (!items.length) {
        list.innerHTML = '<section class="notification-empty">안 읽은 알림이 없어요.</section>';
        return;
      }
      var actions = items.filter(function (item) { return item.type === 'action' && item.pending !== false; });
      var recent = items.filter(function (item) { return !(item.type === 'action' && item.pending !== false); });
      var ordered = state.activeTab === 'unread' ? items : actions.concat(recent);
      list.innerHTML = '<section class="notification-group">' + ordered.map(itemMarkup).join('') + '</section>';
    }

    app.addEventListener('click', function (event) {
      var tab = event.target.closest('[data-notification-tab]');
      if (tab) { state.activeTab = tab.getAttribute('data-notification-tab'); render(); return; }
      if (event.target.closest('[data-notification-read-all]')) {
        window.LumiNotification.markAllRead();
        render();
        return;
      }
      var card = event.target.closest('[data-notification-id]');
      if (!card) return;
      var item = state.items.find(function (entry) { return entry.id === card.getAttribute('data-notification-id'); });
      if (!item) return;
      window.LumiNotification.markRead(item.id);
      if (item.target === 'ticket-transfer') {
        window.LumiPhone.openApp('ticket');
        if (window.LumiApps.openTicketTransferRecipientRequest) window.LumiApps.openTicketTransferRecipientRequest(document, item.targetId || '');
        return;
      }
      if (item.target === 'ticket') {
        window.LumiPhone.openApp('ticket');
        if (window.LumiApps.openTicketNotificationTarget) window.LumiApps.openTicketNotificationTarget(document, item.targetId || 'lumi-pass');
        return;
      }
      if (item.target === 'homeworkCheki') {
        window.LumiPhone.openApp('homeworkCheki');
        if (window.LumiApps.openHomeworkChekiNotificationTarget) window.LumiApps.openHomeworkChekiNotificationTarget(document, item.targetId || '');
        return;
      }
      if (item.target) window.LumiPhone.openApp(item.target);
    });

    activeNotificationApp = app;
    app.__renderNotification = render;

    syncNotificationBadge();
    render();
  };

  document.addEventListener('lumi:notification-state-change', function () {
    var app = activeNotificationApp;
    if (!app || !app.isConnected || typeof app.__renderNotification !== 'function') return;
    app.__renderNotification();
  });

  document.addEventListener('DOMContentLoaded', syncNotificationBadge);
}());
