window.LumiApps = window.LumiApps || {};

(function () {
  var STORAGE_KEY = 'lumiphone-v2-settings';

  function readSettings() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return {
        push: saved.push !== false,
        ticket: saved.ticket !== false,
        message: saved.message !== false,
        dnd: saved.dnd === true,
        notifyTicket: saved.notifyTicket !== false,
        notifyQueue: saved.notifyQueue !== false,
        notifyHomework: saved.notifyHomework !== false,
        notifyPoint: saved.notifyPoint === true,
        notifyLumitalk: saved.notifyLumitalk !== false,
        notifyMessages: saved.notifyMessages !== false,
        notifyMail: saved.notifyMail !== false
      };
    } catch (error) {
      return {
        push: true,
        ticket: true,
        message: true,
        dnd: false,
        notifyTicket: true,
        notifyQueue: true,
        notifyHomework: true,
        notifyPoint: false,
        notifyLumitalk: true,
        notifyMessages: true,
        notifyMail: true
      };
    }
  }

  function saveSettings(next) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    document.dispatchEvent(new CustomEvent('lumi:notification-settings-change', { detail: next }));
  }

  function row(title, description, action, trailing) {
    return [
      '<button type="button" class="settings-row" data-settings-action="', action, '">',
        '<span class="settings-row-thumb" aria-hidden="true"></span>',
        '<span class="settings-row-copy"><strong>', title, '</strong><small>', description, '</small></span>',
        '<span class="settings-row-end">',
          trailing ? '<span>' + trailing + '</span>' : '',
          '<span class="settings-row-arrow" aria-hidden="true">›</span>',
        '</span>',
      '</button>'
    ].join('');
  }

  function group(title, content) {
    return [
      '<section class="settings-group">',
        '<h3 class="settings-group-title">', title, '</h3>',
        '<div class="settings-list">', content, '</div>',
      '</section>'
    ].join('');
  }

  function renderRoot() {
    return [
      '<section class="settings-app" data-settings-app>',
        '<header class="settings-page-head">',
          '<h2>설정</h2>',
          '<p>내 루미폰을 더 편하게 설정해보세요.</p>',
        '</header>',
        group('내 루미폰',
          row('홈 화면 꾸미기', '홈에 보일 카드와 앱 순서를 바꿔요.', 'home') +
          row('앱 관리', '자주 쓰는 앱을 정리해요.', 'apps')
        ),
        group('알림',
          row('알림 설정', '문자, 티켓, 공연 관련 알림을 설정해요.', 'notifications') +
          row('방해 금지 시간', '특정 시간에는 알림을 쉬게 해요.', 'dnd')
        ),
        group('도움',
          row('루미폰 사용 가이드', '앱별 사용 방법을 확인해요.', 'guide') +
          row('도움말 · 문의', '오류 제보와 문의를 남겨요.', 'support') +
          row('루미폰 정보', '현재 버전과 업데이트 소식을 확인해요.', 'about', 'V2.1.0')
        ),
      '</section>'
    ].join('');
  }

  function toggle(label, key, enabled) {
    return [
      '<label class="settings-toggle">',
        '<span>', label, '</span>',
        '<input type="checkbox" data-settings-toggle="', key, '"', enabled ? ' checked' : '', '>',
        '<i aria-hidden="true"></i>',
      '</label>'
    ].join('');
  }

  function appToggleRow(title, description, key, enabled, meta) {
    return [
      '<label class="settings-notify-row">',
        '<span class="settings-notify-row-thumb" aria-hidden="true"></span>',
        '<span class="settings-notify-row-copy">',
          '<span class="settings-notify-row-title">',
            '<strong>', title, '</strong>',
            meta ? '<em class="settings-notify-meta">' + meta + '</em>' : '',
          '</span>',
          '<small>', description, '</small>',
        '</span>',
        '<input type="checkbox" data-settings-toggle="', key, '"', enabled ? ' checked' : '', '>',
        '<i class="settings-notify-switch" aria-hidden="true"></i>',
      '</label>'
    ].join('');
  }

  function renderDetail(kind) {
    var settings = readSettings();
    var title;
    var description;
    var body;

    if (kind === 'notifications') {
      title = '앱별 알림';
      description = '원하는 알림만 골라서 받아보세요.';
      body = '' +
        '<section class="settings-detail-card settings-notify-intro">' +
          '<span class="settings-notify-intro-thumb" aria-hidden="true"></span>' +
          '<div class="settings-notify-intro-copy">' +
            '<strong>알림을 켜두면 중요한 소식을 놓치지 않아요</strong>' +
            '<p>특전회 호출과 티켓 양도 요청은 푸시 알림을 켜두는 것을 권장해요.</p>' +
          '</div>' +
        '</section>' +
        '<section class="settings-detail-card settings-notify-list">' +
          appToggleRow('티켓함', '양도 요청, 공연 변경 알림', 'notifyTicket', settings.notifyTicket) +
          appToggleRow('특전회 대기', '호출, 순서 변경, 취소 전 알림', 'notifyQueue', settings.notifyQueue, '켜짐 권장') +
          appToggleRow('숙제체키', '수령 가능, 수령 완료 알림', 'notifyHomework', settings.notifyHomework) +
          appToggleRow('반짝 포인트', '교환소 결과, 큰 적립 알림', 'notifyPoint', settings.notifyPoint) +
          appToggleRow('루미톡', '새 메시지, 답장, 중요 공지', 'notifyLumitalk', settings.notifyLumitalk) +
          appToggleRow('문자', '입금 확인, 예매 및 처리 결과', 'notifyMessages', settings.notifyMessages) +
          appToggleRow('우편함', '새 우편과 공식 안내', 'notifyMail', settings.notifyMail) +
        '</section>';
    } else if (kind === 'dnd') {
      title = '방해 금지 시간';
      description = '설정한 시간에는 알림을 조용히 쉬게 해요.';
      body = '<div class="settings-detail-card">' +
        toggle('방해 금지 사용', 'dnd', settings.dnd) +
        '<p class="settings-detail-note">시간 설정은 실제 알림 연결 단계에서 적용돼요.</p>' +
      '</div>';
    } else if (kind === 'guide') {
      title = '루미폰 사용 가이드';
      description = '앱별 기본 사용 흐름을 확인해요.';
      body = '<div class="settings-detail-card settings-detail-list">' +
        '<p>티켓함에서는 예매 내역과 특전권을 확인할 수 있어요.</p>' +
        '<p>문자함에서는 멤버와 운영 안내를 모아볼 수 있어요.</p>' +
        '<p>홈 화면에서는 자주 쓰는 앱을 빠르게 열 수 있어요.</p>' +
      '</div>';
    } else if (kind === 'support') {
      title = '도움말 · 문의';
      description = '이용 중 불편한 점이나 오류를 알려주세요.';
      body = '<div class="settings-detail-card settings-detail-list">' +
        '<p>자주 묻는 질문은 이용 가이드에서 먼저 확인할 수 있어요.</p>' +
        '<p>문의 접수 기능은 루미폰 운영 채널 연결 전까지 안내 화면으로 유지돼요.</p>' +
      '</div>';
    } else if (kind === 'about') {
      title = '루미폰 정보';
      description = '현재 루미폰의 버전과 업데이트 정보를 확인해요.';
      body = '<div class="settings-detail-card settings-about"><strong>LumiPhone V2.1.0</strong><p>업데이트 내용은 준비되는 대로 안내해요.</p></div>';
    } else {
      title = kind === 'home' ? '홈 화면 꾸미기' : '앱 관리';
      description = kind === 'home' ? '홈에 보일 카드와 앱 순서를 정리하는 공간이에요.' : '자주 쓰는 앱을 고르고 정리하는 공간이에요.';
      body = '<div class="settings-detail-card settings-detail-list"><p>이 기능은 홈 화면 구성 작업과 함께 연결될 예정이에요.</p></div>';
    }

    return [
      '<section class="settings-detail" data-settings-detail data-settings-view="', kind, '">',
        '<header><h2>', title, '</h2><p>', description, '</p></header>',
        body,
      '</section>'
    ].join('');
  }

  function renderView(view) {
    return view === 'root' ? renderRoot() : renderDetail(view);
  }

  function syncBackHandler(root, stack) {
    if (!window.LumiPhone || typeof window.LumiPhone.setAppBackHandler !== 'function') return;
    window.LumiPhone.setAppBackHandler(function () {
      if (!stack.length || stack[stack.length - 1] === 'root') return false;
      stack.pop();
      root.innerHTML = renderView(stack[stack.length - 1] || 'root');
      syncBackHandler(root, stack);
      return true;
    });
  }

  window.LumiApps.settings = function () {
    return renderRoot();
  };

  window.LumiApps.bindSettings = function (root) {
    if (!root || root.__lumiSettingsBound) return;
    root.__lumiSettingsBound = true;

    var viewStack = ['root'];
    syncBackHandler(root, viewStack);

    root.addEventListener('click', function (event) {
      var item = event.target.closest('[data-settings-action]');

      if (item) {
        var nextView = item.getAttribute('data-settings-action');
        viewStack.push(nextView);
        root.innerHTML = renderView(nextView);
        syncBackHandler(root, viewStack);
      }
    });

    root.addEventListener('change', function (event) {
      var input = event.target.closest('[data-settings-toggle]');
      if (!input) return;
      var next = readSettings();
      next[input.getAttribute('data-settings-toggle')] = input.checked;
      saveSettings(next);
    });
  };
}());
