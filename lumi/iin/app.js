(function () {
  var API_URL = window.LUMIBELLE_ENTRY_API_URL || '';
  var input = document.getElementById('entry-key');
  var clearButton = document.querySelector('[data-action="clear"]');

  function showView(name) {
    document.querySelectorAll('[data-view]').forEach(function (node) {
      node.hidden = node.getAttribute('data-view') !== name;
    });
  }

  function setText(selector, value) {
    var node = document.querySelector(selector);
    if (node) node.textContent = value || '-';
  }

  function norm(value) {
    return String(value == null ? '' : value).trim();
  }

  function showMessage(title, message) {
    setText('[data-message-title]', title || '확인 필요');
    setText('[data-message-text]', message || '입력 정보를 확인해주세요.');
    showView('message');
  }

  function jsonp(action, params, done) {
    var callbackName = '__lumiEntryQr_' + Date.now() + '_' + Math.floor(Math.random() * 100000);
    var timer = null;
    var finished = false;

    function finish(data) {
      if (finished) return;
      finished = true;
      try { delete window[callbackName]; } catch (error) { window[callbackName] = undefined; }
      if (timer) clearTimeout(timer);
      var script = document.querySelector('script[data-entry-callback="' + callbackName + '"]');
      if (script && script.parentNode) script.parentNode.removeChild(script);
      done(data || {});
    }

    window[callbackName] = function (data) {
      finish(data);
    };

    var query = new URLSearchParams();
    query.set('action', action);
    query.set('callback', callbackName);
    Object.keys(params || {}).forEach(function (key) {
      if (params[key] !== undefined && params[key] !== null) query.set(key, params[key]);
    });

    var script = document.createElement('script');
    script.setAttribute('data-entry-callback', callbackName);
    script.onerror = function () {
      finish({ ok: false, message: '조회 연결에 실패했어요. 현장 스탭에게 문의해주세요.' });
    };
    script.src = API_URL + (API_URL.indexOf('?') === -1 ? '?' : '&') + query.toString();
    document.head.appendChild(script);

    timer = setTimeout(function () {
      finish({ ok: false, message: '조회 시간이 지연되고 있어요. 잠시 후 다시 시도해주세요.' });
    }, 25000);
  }

  function itemValue(item, keys) {
    for (var i = 0; i < keys.length; i += 1) {
      var value = norm(item && item[keys[i]]);
      if (value) return value;
    }
    return '';
  }

  function codeFromReservation(reservation) {
    var match = String(reservation || '').match(/(\d{4})$/);
    return match ? match[1] : '0000';
  }

  function qrImageUrl(reservation) {
    return 'https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=16&data=' + encodeURIComponent(reservation);
  }

  function renderTicket(item) {
    var reservation = itemValue(item, ['ticketId', 'reservationNumber', 'reservation_no', '예약번호']);
    if (!reservation) {
      showMessage('예약번호 없음', '예약번호를 찾지 못했어요. 현장 스탭에게 문의해주세요.');
      return;
    }

    setText('[data-result-nickname]', itemValue(item, ['nickname', 'name', '닉네임']) || norm(input.value));
    setText('[data-result-meate]', itemValue(item, ['meate', 'meateTeam', '메아테']) || '-');
    setText('[data-result-reservation]', reservation);
    setText('[data-result-code]', codeFromReservation(reservation));

    var qr = document.querySelector('[data-result-qr]');
    if (qr) {
      qr.src = qrImageUrl(reservation);
      qr.alt = '입장용 QR ' + reservation;
    }

    showView('ticket');
  }

  function lookup() {
    var value = norm(input.value);
    if (!value) {
      showMessage('입력 필요', '예약 시 작성한 닉네임 + 숫자 4자리를 입력해주세요.');
      return;
    }

    var button = document.querySelector('[data-action="lookup"]');
    if (button) {
      button.disabled = true;
      button.textContent = '조회 중...';
    }

    jsonp('search', { q: value }, function (response) {
      if (button) {
        button.disabled = false;
        button.textContent = '입장 QR 확인하기';
      }

      if (!response || response.ok === false) {
        showMessage('조회 실패', response && (response.message || response.error) ? (response.message || response.error) : '입력 정보를 확인해주세요.');
        return;
      }

      var items = Array.isArray(response.items) ? response.items : [];
      if (!items.length && response.item) items = [response.item];

      if (!items.length) {
        showMessage('조회 결과 없음', '예약 시 작성한 닉네임 + 숫자 4자리를 다시 확인해주세요.');
        return;
      }

      if (items.length > 1) {
        showMessage('현장 확인 필요', '조회 결과가 여러 명입니다. 현장 스탭에게 닉네임과 입금자명을 함께 알려주세요.');
        return;
      }

      renderTicket(items[0]);
    });
  }

  document.addEventListener('click', function (event) {
    var action = event.target.closest('[data-action]');
    if (!action) return;
    var type = action.getAttribute('data-action');

    if (type === 'lookup') lookup();
    if (type === 'back' || type === 'message-back') showView('login');
    if (type === 'clear') {
      input.value = '';
      if (clearButton) clearButton.hidden = true;
      input.focus();
    }
  });

  input.addEventListener('input', function () {
    if (clearButton) clearButton.hidden = !norm(input.value);
  });

  input.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      lookup();
    }
  });

  showView('login');
}());
