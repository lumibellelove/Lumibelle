(function () {
  var API_URL = window.LUMIBELLE_MEATE_API_URL || '';
  var teamSelect = document.querySelector('[data-team-select]');
  var codeInput = document.querySelector('[data-team-code]');
  var currentTeam = '';
  var currentCode = '';

  function text(value) {
    return String(value == null ? '' : value).trim();
  }

  function escapeHtml(value) {
    return text(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function showView(name) {
    document.querySelectorAll('[data-view]').forEach(function (node) {
      node.hidden = node.getAttribute('data-view') !== name;
    });
  }

  function setText(selector, value) {
    var node = document.querySelector(selector);
    if (node) node.textContent = value;
  }

  function showMessage(title, message) {
    setText('[data-message-title]', title || '확인 필요');
    setText('[data-message-text]', message || '입력 정보를 확인해주세요.');
    showView('message');
  }

  function jsonp(action, params, done) {
    var callbackName = '__lumiTeamMeate_' + Date.now() + '_' + Math.floor(Math.random() * 100000);
    var finished = false;
    var timer = null;

    function finish(response) {
      if (finished) return;
      finished = true;
      try { delete window[callbackName]; } catch (error) { window[callbackName] = undefined; }
      if (timer) clearTimeout(timer);
      var script = document.querySelector('script[data-team-callback="' + callbackName + '"]');
      if (script && script.parentNode) script.parentNode.removeChild(script);
      done(response || {});
    }

    window[callbackName] = function (response) {
      finish(response);
    };

    var query = new URLSearchParams();
    query.set('action', action);
    query.set('callback', callbackName);
    Object.keys(params || {}).forEach(function (key) {
      if (params[key] !== undefined && params[key] !== null) query.set(key, params[key]);
    });

    var script = document.createElement('script');
    script.setAttribute('data-team-callback', callbackName);
    script.onerror = function () {
      finish({ ok: false, message: '조회 연결에 실패했어요.' });
    };
    script.src = API_URL + (API_URL.indexOf('?') === -1 ? '?' : '&') + query.toString();
    document.head.appendChild(script);

    timer = setTimeout(function () {
      finish({ ok: false, message: '조회 시간이 지연되고 있어요.' });
    }, 25000);
  }

  function memberCard(item, index) {
    var nickname = escapeHtml(item.nickname || '-');
    var kind = escapeHtml(item.kind || '-');
    var reservation = escapeHtml(item.reservation || '-');
    var phone = escapeHtml(item.phoneLast4 || '-');
    var entryStatus = escapeHtml(item.entryStatus || '-');
    var entryTime = escapeHtml(item.entryTime || '-');
    var received = escapeHtml(item.meateReceived || '미수령');
    var receivedAt = escapeHtml(item.meateReceivedAt || '-');
    var isReceived = (item.meateReceived === '수령 완료');
    var button = isReceived
      ? '<button type="button" class="team-received-button is-done" disabled>수령 완료</button>'
      : '<button type="button" class="team-received-button" data-action="receive" data-reservation="' + reservation + '" data-nickname="' + nickname + '">수령 완료</button>';

    return '<article class="team-member-card">' +
      '<header><h2>' + (index + 1) + '. ' + nickname + '</h2><b>' + kind + '</b></header>' +
      '<dl>' +
        '<div><dt>번호</dt><dd>' + reservation + '</dd></div>' +
        '<div><dt>뒤4자리</dt><dd>' + phone + '</dd></div>' +
        '<div><dt>입장상태</dt><dd>' + entryStatus + '</dd></div>' +
        '<div><dt>입장시간</dt><dd>' + entryTime + '</dd></div>' +
        '<div><dt>수령상태</dt><dd>' + received + '</dd></div>' +
        '<div><dt>수령시간</dt><dd>' + receivedAt + '</dd></div>' +
      '</dl>' +
      button +
    '</article>';
  }

  function renderList(response) {
    var items = Array.isArray(response.items) ? response.items : [];
    setText('[data-result-team]', response.team || teamSelect.value);
    setText('[data-count-total]', String(response.total || items.length || 0));
    setText('[data-count-reserved]', String(response.reservedCount || 0));
    setText('[data-count-walkin]', String(response.walkinCount || 0));
    setText('[data-count-received]', String(response.receivedCount || 0));

    var list = document.querySelector('[data-list]');
    if (!list) return;

    if (!items.length) {
      list.innerHTML = '<article class="team-card team-empty">현재 조회되는 메아테 명단이 없습니다.</article>';
    } else {
      list.innerHTML = items.map(memberCard).join('');
    }

    showView('list');
  }

  function lookup() {
    var team = text(teamSelect.value);
    var code = text(codeInput.value);

    if (!team || !code) {
      showMessage('입력 필요', '팀명과 확인번호를 입력해주세요.');
      return;
    }

    var button = document.querySelector('[data-action="lookup"]');
    if (button) {
      button.disabled = true;
      button.textContent = '조회 중...';
    }

    currentTeam = team;
    currentCode = code;

    jsonp('teamMeateList', { team: team, code: code }, function (response) {
      if (button) {
        button.disabled = false;
        button.textContent = '조회하기';
      }

      if (!response || response.ok === false) {
        showMessage('조회 실패', response && (response.message || response.error) ? (response.message || response.error) : '입력 정보를 확인해주세요.');
        return;
      }

      renderList(response);
    });
  }


  function receive(button) {
    var reservation = button.getAttribute('data-reservation') || '';
    var nickname = button.getAttribute('data-nickname') || '';

    if (!reservation || !currentTeam || !currentCode) {
      showMessage('처리 실패', '다시 조회 후 처리해주세요.');
      return;
    }

    if (!window.confirm('메아테 수령 완료로 체크할까요?')) return;

    button.disabled = true;
    button.textContent = '처리 중...';

    jsonp('teamMeateReceive', {
      team: currentTeam,
      code: currentCode,
      reservation: reservation,
      nickname: nickname
    }, function (response) {
      if (!response || response.ok === false) {
        button.disabled = false;
        button.textContent = '수령 완료';
        showMessage('처리 실패', response && (response.message || response.error) ? (response.message || response.error) : '수령 완료 처리에 실패했어요.');
        return;
      }

      lookup();
    });
  }

  document.addEventListener('click', function (event) {
    var button = event.target.closest('[data-action]');
    if (!button) return;
    var action = button.getAttribute('data-action');

    if (action === 'lookup') lookup();
    if (action === 'receive') receive(button);
    if (action === 'logout' || action === 'back') showView('login');
  });

  codeInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      lookup();
    }
  });

  showView('login');
}());
