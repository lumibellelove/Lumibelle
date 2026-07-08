/**
 * cheki.js — Staff OS 특전 사용 / 촬영
 *
 * 역할
 * - 특전회 대기에서 [도착 확인]된 건(status: 진행중)만 자동 표시
 * - 스탭은 이 화면에서 실제 특전 사용/촬영을 처리한 뒤 완료 처리
 * - 완료 시 QueueStore.completedCount 반영, 진행중 목록에서 제거
 */

window.LumiApps = window.LumiApps || {};

window.LumiApps.cheki = function () {
  var state = getChekiInitialState();
  setTimeout(function () { bindChekiApp(state); }, 0);
  return '<section class="cheki-app" data-cheki-app>' + renderChekiApp(state) + '</section>';
};

function getChekiInitialState() {
  var returned = null;
  try {
    returned = JSON.parse(window.sessionStorage.getItem('lumibelle_homework_cheki_return_v1') || 'null');
    if (returned && returned.queueNumber) window.sessionStorage.removeItem('lumibelle_homework_cheki_return_v1');
  } catch (error) { returned = null; }
  return {
    filter: '전체',
    view: returned && returned.queueNumber ? 'detail' : 'list',
    selectedNumber: returned && returned.queueNumber ? String(returned.queueNumber) : null,
    prepComplete: !!(returned && returned.queueNumber),
    homeworkRegistered: !!(returned && returned.queueNumber),
    shootComplete: false,
    toast: returned && returned.queueNumber ? '숙제체키 접수가 완료되었습니다.' : ''
  };
}

function readChekiData() {
  return typeof QueueStore !== 'undefined' && QueueStore.read ? QueueStore.read() : {
    event: { specialTime: '19:00 ~ 21:30' },
    queues: [],
    completedCount: 0
  };
}


/*
 * 루미 체크인 실연동
 * - 기존 루미폰 Apps Script의 adminCreateChekiCheckin action을 JSONP로 호출한다.
 * - 지급 규칙은 서버가 단일 기준으로 판단한다.
 *   첫 체크인: stamp 1 / xp 10, 같은 날짜 추가 특전: stamp 0 / xp 0.
 * - Staff OS는 촬영 완료 시점에 이 action을 요청할 뿐, 보상 중복 판정은 직접 하지 않는다.
 */
var LumiChekiCheckinApi = (function () {
  var API_URL = window.LUMIBELLE_CHEKI_API_URL || 'https://script.google.com/macros/s/AKfycbwJRbaZDXnquhBTYaa4R1Onaq0pkDLUWPip0pjzoAcdkcUVNYCCZ2wHWtzCyQLZ0sboJQ/exec';
  var ADMIN_KEY = window.LUMIBELLE_CHEKI_ADMIN_KEY || '';

  function call(params) {
    return new Promise(function (resolve, reject) {
      if (!API_URL) { reject(new Error('루미 체크인 API 주소가 연결되지 않았습니다.')); return; }
      var callbackName = 'lumibelleChekiCheckinCb_' + Date.now() + '_' + Math.floor(Math.random() * 99999);
      var url;
      try {
        url = new URL(API_URL);
        Object.keys(params || {}).forEach(function (key) { url.searchParams.set(key, params[key]); });
        if (ADMIN_KEY) url.searchParams.set('adminKey', ADMIN_KEY);
        url.searchParams.set('callback', callbackName);
        url.searchParams.set('_', Date.now());
      } catch (error) {
        reject(new Error('루미 체크인 API 주소를 확인할 수 없습니다.'));
        return;
      }

      var script = document.createElement('script');
      var timer = window.setTimeout(function () {
        cleanup();
        reject(new Error('루미 체크인 응답 시간이 초과되었습니다.'));
      }, 15000);

      function cleanup() {
        window.clearTimeout(timer);
        try { delete window[callbackName]; } catch (error) { window[callbackName] = undefined; }
        if (script.parentNode) script.parentNode.removeChild(script);
      }

      window[callbackName] = function (payload) {
        cleanup();
        resolve(payload || {});
      };
      script.onerror = function () {
        cleanup();
        reject(new Error('루미 체크인 API 호출에 실패했습니다.'));
      };
      script.src = url.toString();
      document.body.appendChild(script);
    });
  }

  function getEventContext(queueData) {
    var current = window.LumiCurrentEvent || {};
    var currentEventId = String(current.apiEventId || current.lumiApiEventId || current.eventId || '').trim();
    var currentTitle = String(current.eventTitle || current.title || '').trim();
    var queueEvent = (queueData && queueData.event) || {};

    /* 현재 Staff OS 데모의 EVT-20260712는 화면용 임시 ID라, 실제 루미폰 eventId로 변환한다. */
    if (!currentEventId || currentEventId === 'EVT-20260712') currentEventId = 'shine-me-up-20260712';
    if (!currentTitle) currentTitle = String(queueEvent.title || '').trim();
    if (!currentTitle || currentTitle === 'Lumibelle Debut Live') currentTitle = 'Shine Me UP : 데뷔 라이브';

    return { eventId: currentEventId, eventTitle: currentTitle };
  }

  function processedBy() {
    var staff = window.LumiCurrentStaff || {};
    return String(staff.name || staff.id || 'cheki-staff').trim() || 'cheki-staff';
  }

  function createForShot(row, queueData) {
    var event = getEventContext(queueData);
    var item = row && (window.QueueStore && typeof QueueStore.itemLabel === 'function'
      ? QueueStore.itemLabel(row)
      : row.item) || 'normal';
    return call({
      action: 'adminCreateChekiCheckin',
      lumiId: String(row && row.lumiId || '').trim(),
      eventId: event.eventId,
      eventTitle: event.eventTitle,
      member: String(row && row.member || '').trim(),
      ticketId: item,
      checkinType: 'cheki',
      stampCount: '1',
      xp: '10',
      processedBy: processedBy(),
      note: 'Staff OS 촬영 완료 자동 기록 · No.' + String(row && row.number || '') + ' · ' + item
    }).then(function (result) {
      if (!result || !result.ok) {
        throw new Error((result && (result.error || result.message)) || '루미 체크인 저장에 실패했습니다.');
      }
      return result;
    });
  }

  return { createForShot: createForShot };
}());

function chekiCheckinToastMessage() {
  return '루미 체크인 완료';
}

function renderChekiApp(state) {
  var data = readChekiData();
  var actionableRows = getActionableInProgressRows(data, state.filter);
  var exchangeRows = getExchangeInProgressRows(data, state.filter);
  var selected = state.selectedNumber ? findQueueRow(data, state.selectedNumber) : null;

  if (state.view === 'detail' && selected) {
    return renderChekiDetailPage(data, selected, state) + renderChekiToast();
  }

  return (
    renderChekiHeader(data) +
    renderChekiSummary(data, actionableRows, exchangeRows, state.filter) +
    renderChekiTabs(state.filter) +
    renderChekiList(data, actionableRows, exchangeRows, state.filter) +
    renderChekiToast()
  );
}

function renderChekiHeader(data) {
  return (
    '<header class="cheki-titlebar">' +
      '<div class="cheki-topline is-title-only">' +
        '<div class="cheki-title-wrap">' +
          '<h2>특전 사용 · 촬영</h2>' +
        '</div>' +
      '</div>' +
      '<div class="cheki-event-line">' +
        '<span>이벤트 진행 중</span>' +
        '<b>' + escapeCheki((data.event && data.event.specialTime) || '19:00 ~ 21:30') + '</b>' +
      '</div>' +
    '</header>'
  );
}

function renderChekiSummary(data, actionableRows, exchangeRows, filter) {
  var allActionable = getActionableInProgressRows(data, '전체');
  var allExchange = getExchangeInProgressRows(data, '전체');
  var actionableCount = filter === '전체' ? allActionable.length : actionableRows.length;
  var exchangeCount = filter === '전체' ? allExchange.length : exchangeRows.length;
  return (
    '<section class="cheki-summary-card cheki-summary-card--three">' +
      '<div class="cheki-summary-col">' +
        '<span>처리 진행 중</span>' +
        '<strong>' + actionableCount + '<em>건</em></strong>' +
      '</div>' +
      '<div class="cheki-summary-divider" aria-hidden="true"></div>' +
      '<div class="cheki-summary-col">' +
        '<span>교류 진행 중</span>' +
        '<strong>' + exchangeCount + '<em>건</em></strong>' +
      '</div>' +
      '<div class="cheki-summary-divider" aria-hidden="true"></div>' +
      '<div class="cheki-summary-col">' +
        '<span>오늘 완료</span>' +
        '<strong>' + Number(data.completedCount || 0) + '<em>건</em></strong>' +
      '</div>' +
    '</section>'
  );
}

function renderChekiTabs(filter) {
  var labels = ['전체', '마리링', '루루', '이로', '루나'];
  return (
    '<div class="cheki-filter-tabs" role="tablist">' +
      labels.map(function (label) {
        return '<button type="button" class="' + (filter === label ? 'is-active' : '') + '" data-cheki-filter="' + label + '"><span>' + label + '</span></button>';
      }).join('') +
    '</div>'
  );
}

function renderChekiList(data, actionableRows, exchangeRows, filter) {
  var actionSection =
    '<section class="cheki-list-section">' +
      '<header class="cheki-section-head">' +
        '<strong>진행 중 특전</strong>' +
        '<span>' + actionableRows.length + '건</span>' +
      '</header>' +
      '<div class="cheki-card-list">' +
        (actionableRows.length ? actionableRows.map(renderChekiCard).join('') : renderChekiEmpty(filter)) +
      '</div>' +
    '</section>';

  var exchangeSection = !exchangeRows.length ? '' : (
    '<section class="cheki-list-section cheki-exchange-section">' +
      '<header class="cheki-section-head">' +
        '<strong>교류 진행 중</strong>' +
        '<span>' + exchangeRows.length + '건</span>' +
      '</header>' +
      '<div class="cheki-card-list">' +
        exchangeRows.map(renderChekiExchangeCard).join('') +
      '</div>' +
    '</section>'
  );

  return actionSection + exchangeSection;
}

function renderChekiCard(row) {
  return (
    '<article class="cheki-card">' +
      '<div class="cheki-number-box">' +
        '<small>No.</small>' +
        '<b>' + escapeCheki(row.number) + '</b>' +
      '</div>' +
      '<div class="cheki-card-main">' +
        '<strong>' + escapeCheki(row.displayName) + '</strong>' +
        '<em>' + escapeCheki(row.lumiId) + '</em>' +
        '<div class="cheki-meta-pills">' +
          chekiMetaPill('member', row.member) +
          chekiMetaPill('item', chekiItemLabel(row)) +
        '</div>' +
      '</div>' +
      '<div class="cheki-card-action">' +
        '<button type="button" class="cheki-process-button" data-cheki-open="' + escapeCheki(row.number) + '">처리하기 <span>›</span></button>' +
      '</div>' +
    '</article>'
  );
}

function renderChekiExchangeCard(row) {
  var timer = getLinkedTimerRow(row);
  var status = getChekiExchangeStatus(timer);
  return (
    '<article class="cheki-card cheki-exchange-card">' +
      '<div class="cheki-number-box">' +
        '<small>No.</small>' +
        '<b>' + escapeCheki(row.number) + '</b>' +
      '</div>' +
      '<div class="cheki-card-main">' +
        '<strong>' + escapeCheki(row.displayName) + '</strong>' +
        '<em>' + escapeCheki(row.lumiId) + '</em>' +
        '<div class="cheki-meta-pills">' +
          chekiMetaPill('member', row.member) +
          chekiMetaPill('item', chekiItemLabel(row)) +
        '</div>' +
      '</div>' +
      '<div class="cheki-card-action cheki-timer-card-action">' +
        '<strong>' + status.title + '</strong>' +
        '<span>' + status.detail + '</span>' +
        '<button type="button" class="cheki-timer-view-button" data-cheki-timer-view="' + escapeCheki(row.member) + '">타이머 보기</button>' +
      '</div>' +
    '</article>'
  );
}

function getChekiExchangeStatus(timer) {
  if (!timer) return { title: '교류 진행 중', detail: '타이머 확인 필요' };
  if (timer.status === '일시정지') {
    return { title: '교류 일시정지', detail: chekiTimerFormat(timer.remainingSeconds) + ' 남음' };
  }
  if (timer.status === '종료') {
    var overtime = typeof LumiTimerStore !== 'undefined' && LumiTimerStore.overtime
      ? LumiTimerStore.overtime(timer, Date.now())
      : Math.max(0, Math.floor((Date.now() - Number(timer.endedAt || Date.now())) / 1000));
    return { title: '교류 종료', detail: '초과 +' + chekiTimerFormat(overtime) };
  }
  var remaining = typeof LumiTimerStore !== 'undefined' && LumiTimerStore.remaining
    ? LumiTimerStore.remaining(timer, Date.now())
    : Number(timer.remainingSeconds || 0);
  return { title: '교류 진행 중', detail: chekiTimerFormat(remaining) + ' 남음' };
}

function chekiTimerFormat(value) {
  var seconds = Math.max(0, Number(value || 0));
  var minutes = Math.floor(seconds / 60);
  var rest = seconds % 60;
  return String(minutes).padStart(2, '0') + ':' + String(rest).padStart(2, '0');
}

function chekiItemLabel(row) {
  if (window.QueueStore && typeof QueueStore.itemLabel === 'function') return QueueStore.itemLabel(row);
  return row && row.item ? row.item : '특전권';
}

function chekiMetaPill(type, label) {
  return '<span class="cheki-meta-pill is-' + type + '">' + escapeCheki(label) + '</span>';
}

function renderChekiEmpty(filter) {
  var title = filter === '전체'
    ? '현재 처리할 특전이 없습니다.'
    : filter + ' 진행중 특전이 없습니다.';
  var copy = '도착 확인된 대기자는 이 화면에서 특전 처리할 수 있습니다.';
  return (
    '<article class="cheki-empty-card">' +
      '<div class="cheki-empty-illust">✓</div>' +
      '<div class="cheki-empty-copy">' +
        '<strong>' + title + '</strong>' +
        '<p>' + copy + '</p>' +
      '</div>' +
    '</article>'
  );
}

function renderChekiDetailPage(data, row, state) {
  var isHomework = isHomeworkChekiRow(row);
  return (
    '<section class="cheki-detail-page">' +
      '<header class="cheki-detail-titlebar">' +
        '<button type="button" class="cheki-detail-back" data-cheki-detail-back aria-label="특전 사용 목록으로 돌아가기">‹</button>' +
        '<h2>특전 처리</h2>' +
        '<div class="cheki-event-line">' +
          '<span>이벤트 진행 중</span>' +
          '<b>' + escapeCheki((data.event && data.event.specialTime) || '19:00 ~ 21:30') + '</b>' +
        '</div>' +
      '</header>' +
      renderChekiTargetCard(row) +
      renderChekiPrepStage(state) +
      (state.prepComplete && isHomework && !state.homeworkRegistered ? renderChekiHomeworkReceiptStage(row, state, data) : '') +
      (state.prepComplete && isHomework && state.homeworkRegistered ? renderChekiHomeworkReceiptDoneStage(row) : '') +
      (state.prepComplete && (!isHomework || state.homeworkRegistered) ? renderChekiShootStage(state) : '') +
      renderChekiReferenceSection(row) +
      '<button type="button" class="cheki-exception-button" data-cheki-exception>문제 발생 / 예외 처리</button>' +
    '</section>'
  );
}

function renderChekiTargetCard(row) {
  return (
    '<article class="cheki-target-card">' +
      '<div class="cheki-target-number"><small>No.</small><b>' + escapeCheki(row.number) + '</b></div>' +
      '<div class="cheki-target-main">' +
        '<strong>' + escapeCheki(row.displayName) + '</strong>' +
        '<em>' + escapeCheki(row.lumiId) + '</em>' +
        '<div class="cheki-meta-pills">' +
          chekiMetaPill('member', row.member) +
          chekiMetaPill('item', chekiItemLabel(row)) +
        '</div>' +
      '</div>' +
    '</article>'
  );
}

function renderChekiPrepStage(state) {
  var isDone = !!state.prepComplete;
  return (
    '<section class="cheki-stage-card ' + (isDone ? 'is-complete' : '') + '">' +
      '<header><span>특전권 회수</span>' + (isDone ? '<em>회수 완료</em>' : '') + '</header>' +
      '<div class="cheki-stage-layout">' +
        '<div class="cheki-media-slot" aria-label="특전권 회수 확인 자리"></div>' +
        '<div class="cheki-stage-copy">' +
          '<strong>실물 특전권을 회수하고<br>멤버 · 권종 · 수량을 확인해주세요.</strong>' +
          '<p>확인 후 특전권 회수 완료를 눌러주세요.</p>' +
        '</div>' +
      '</div>' +
      '<button type="button" class="cheki-stage-button" data-cheki-prep-complete ' + (isDone ? 'is-done' : '') + '"' + (isDone ? ' disabled' : '') + '>특전권 회수 완료</button>' +
    '</section>'
  );
}

function renderChekiHomeworkReceiptStage(row, state, data) {
  return (
    '<section class="cheki-stage-card cheki-homework-stage">' +
      '<header><span>숙제체키 접수</span></header>' +
      '<div class="cheki-stage-copy">' +
        '<strong>회수한 특전권 기준으로<br>숙제체키 접수 기록을 생성해주세요.</strong>' +
        '<p>접수 완료 후 이 특전 처리 화면으로 자동 복귀합니다.</p>' +
      '</div>' +
      '<button type="button" class="cheki-stage-button" data-cheki-homework-register>숙제체키 접수</button>' +
    '</section>'
  );
}

function renderChekiHomeworkReceiptDoneStage(row) {
  var receiver = row.homeworkReceiverName || '담당 스탭';
  return (
    '<section class="cheki-stage-card cheki-homework-stage is-complete">' +
      '<header><span>숙제체키 접수</span><em>접수 완료</em></header>' +
      '<div class="cheki-stage-copy">' +
        '<strong>숙제체키 접수 기록이 저장되었습니다.</strong>' +
        '<p>접수 담당자 · ' + escapeCheki(receiver) + '</p>' +
      '</div>' +
    '</section>'
  );
}

function isHomeworkChekiRow(row) {
  return !!(window.QueueStore && typeof QueueStore.isHomeworkCheki === 'function'
    ? QueueStore.isHomeworkCheki(row)
    : row && String(row.item || '').replace(/\s/g, '') === '숙제체키');
}

function renderChekiShootStage(state) {
  return (
    '<section class="cheki-stage-card cheki-shoot-stage ' + (state.shootComplete ? 'is-complete' : '') + '">' +
      '<header><span>촬영 진행</span>' + (state.shootComplete ? '<em>촬영 완료</em>' : '') + '</header>' +
      '<p class="cheki-shoot-copy">촬영이 끝난 후 아래 버튼을 눌러주세요.</p>' +
      '<button type="button" class="cheki-stage-button" data-cheki-shoot-complete ' + (state.shootComplete ? 'is-done' : '') + '"' + (state.shootComplete ? ' disabled' : '') + '>' + (state.shootComplete ? '✓ 촬영 완료' : '촬영 완료') + '</button>' +
      '<small class="cheki-timer-note">' + (state.shootComplete ? '교류 진행 중 · 타이머에서 교류 종료 시 특전 처리가 완료됩니다.' : '촬영 완료 시 권종별 교류 타이머가 자동으로 시작됩니다.') + '</small>' +
    '</section>'
  );
}

function renderChekiReferenceSection(row) {
  return (
    '<section class="cheki-reference-card">' +
      '<div class="cheki-reference-info">' +
        '<h3>특전 정보</h3>' +
        chekiReferenceRow('특전 종류', chekiItemLabel(row)) +
        chekiReferenceRow('사용 멤버', row.member) +
        chekiReferenceRow('특전 수량', '1회') +
        chekiReferenceRow('요청 사항', row.request || '없음') +
      '</div>' +
      '<div class="cheki-memo-field">' +
        '<span>운영 메모</span>' +
        '<textarea data-cheki-memo-input placeholder="현장 메모를 입력해주세요.">' + escapeCheki(row.memo || '') + '</textarea>' +
        '<div class="cheki-memo-actions">' +
          '<button type="button" class="cheki-memo-save" data-cheki-memo-save>메모 저장</button>' +
          '<small data-cheki-memo-status>' + chekiMemoStatus(row.memoUpdatedAt) + '</small>' +
        '</div>' +
      '</div>' +
    '</section>'
  );
}

function chekiMemoStatus(savedAt) {
  if (!savedAt) return '';
  var date = new Date(savedAt);
  if (isNaN(date.getTime())) return '저장됨';
  return '저장됨 · ' + String(date.getHours()).padStart(2, '0') + ':' + String(date.getMinutes()).padStart(2, '0');
}

function chekiReferenceRow(label, value) {
  return '<p><span>' + escapeCheki(label) + '</span><strong>' + escapeCheki(value) + '</strong></p>';
}

function renderChekiToast() {
  return '<div class="cheki-toast" data-cheki-toast hidden role="status" aria-live="polite"></div>';
}

function bindChekiApp(initialState) {
  var root = document.querySelector('[data-cheki-app]');
  if (!root || root.getAttribute('data-cheki-bound') === 'true') return;
  root.setAttribute('data-cheki-bound', 'true');

  var state = initialState || getChekiInitialState();

  if (!root._chekiExchangeTicker) {
    root._chekiExchangeTicker = window.setInterval(function () {
      if (!root.isConnected) {
        window.clearInterval(root._chekiExchangeTicker);
        root._chekiExchangeTicker = null;
        return;
      }
      if (state.view !== 'list') return;
      var currentData = readChekiData();
      if (getExchangeInProgressRows(currentData, state.filter).length) {
        rerenderChekiRoot(root, state);
      }
    }, 1000);
  }

  root.addEventListener('click', function (event) {
    var filter = event.target.closest('[data-cheki-filter]');
    if (filter) {
      state.filter = filter.getAttribute('data-cheki-filter') || '전체';
      state.view = 'list';
      state.selectedNumber = null;
      rerenderChekiRoot(root, state);
      return;
    }

    var openBtn = event.target.closest('[data-cheki-open]');
    if (openBtn) {
      state.selectedNumber = openBtn.getAttribute('data-cheki-open');
      var openedRow = findQueueRow(readChekiData(), state.selectedNumber);
      state.view = 'detail';
      var hasLinkedTimer = !!(openedRow && typeof TimerRuntime !== 'undefined' && TimerRuntime.isLinkedAutoActive && TimerRuntime.isLinkedAutoActive(openedRow));
      state.prepComplete = hasLinkedTimer;
      state.homeworkRegistered = !!(openedRow && openedRow.homeworkReceiptId);
      state.shootComplete = hasLinkedTimer;
      rerenderChekiRoot(root, state);
      return;
    }

    if (event.target.closest('[data-cheki-detail-back]')) {
      state.view = 'list';
      state.selectedNumber = null;
      state.prepComplete = false;
      state.homeworkRegistered = false;
      state.shootComplete = false;
      rerenderChekiRoot(root, state);
      return;
    }

    if (event.target.closest('[data-cheki-prep-complete]')) {
      state.prepComplete = true;
      rerenderChekiRoot(root, state);
      return;
    }

    if (event.target.closest('[data-cheki-homework-register]')) {
      var homeworkRow = findQueueRow(readChekiData(), state.selectedNumber);
      if (!homeworkRow) { showChekiToast(root, '숙제체키 접수 대상을 찾지 못했습니다.'); return; }
      var queueData = readChekiData();
      window.LumiHomeworkChekiTransfer = {
        source: 'chekiProcess',
        returnApp: 'cheki',
        returnQueueNumber: homeworkRow.number,
        receiptConfirmed: true,
        queueId: homeworkRow.id,
        queueNumber: homeworkRow.number,
        fanId: homeworkRow.lumiId,
        fanName: homeworkRow.displayName,
        member: homeworkRow.member,
        quantity: Number(homeworkRow.quantity || 1),
        eventId: (queueData.event || {}).eventId || '',
        eventTitle: (queueData.event || {}).title || '',
        ticketType: 'homeworkCheki'
      };
      try {
        window.sessionStorage.setItem('lumibelle_homework_cheki_transfer_v1', JSON.stringify(window.LumiHomeworkChekiTransfer));
        window.sessionStorage.setItem('lumibelle_homework_cheki_receipt_route_v1', '1');
      } catch (error) {}
      if (window.StaffOS && typeof window.StaffOS.openApp === 'function') window.StaffOS.openApp('homeworkCheki');
      return;
    }

    if (event.target.closest('[data-cheki-shoot-complete]')) {
      var activeRow = findQueueRow(readChekiData(), state.selectedNumber);
      var shootButton = event.target.closest('[data-cheki-shoot-complete]');
      if (!activeRow) { showChekiToast(root, '특전 처리 대상을 찾지 못했습니다.'); return; }
      if (state._shootSubmitting) return;
      if (typeof TimerRuntime === 'undefined' || !TimerRuntime.startAuto) { showChekiToast(root, '타이머 연동을 준비하지 못했습니다.'); return; }
      if (TimerRuntime.isLinkedAutoActive && TimerRuntime.isLinkedAutoActive(activeRow)) {
        state.shootComplete = true;
        rerenderChekiRoot(root, state);
        showChekiToast(root, activeRow.member + ' 타이머가 이미 진행 중입니다.');
        return;
      }

      var canStart = TimerRuntime.canStartAuto ? TimerRuntime.canStartAuto(activeRow) : { ok: true };
      if (!canStart.ok) { showChekiToast(root, canStart.message || '타이머를 시작할 수 없습니다.'); return; }

      state._shootSubmitting = true;
      if (shootButton) {
        shootButton.disabled = true;
        shootButton.textContent = '루미 체크인 저장 중…';
      }

      LumiChekiCheckinApi.createForShot(activeRow, readChekiData())
        .then(function (checkinResult) {
          var timerResult = TimerRuntime.startAuto(activeRow);
          if (!timerResult.ok) throw new Error(timerResult.message || '타이머 시작에 실패했습니다.');
          state.shootComplete = true;
          state._shootSubmitting = false;
          rerenderChekiRoot(root, state);
          showChekiToast(root, '· ' + chekiCheckinToastMessage(checkinResult) + '\n· ' + activeRow.member + ' ' + timerResult.seconds + '초 교류 시작');
        })
        .catch(function (error) {
          state._shootSubmitting = false;
          if (shootButton && shootButton.isConnected) {
            shootButton.disabled = false;
            shootButton.textContent = '촬영 완료';
          }
          showChekiToast(root, String(error && error.message ? error.message : error));
        });
      return;
    }

    var timerView = event.target.closest('[data-cheki-timer-view]');
    if (timerView) {
      var timerMember = timerView.getAttribute('data-cheki-timer-view') || '';
      if (window.StaffOS && typeof window.StaffOS.openApp === 'function') {
        window.StaffOS.openApp('timer');
        window.setTimeout(function () {
          var timerRoot = document.querySelector('[data-timer-app]');
          if (!timerRoot) return;
          var cards = timerRoot.querySelectorAll('[data-timer-card]');
          Array.prototype.some.call(cards, function (card) {
            if (card.getAttribute('data-timer-card') !== timerMember) return false;
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            card.classList.remove('is-alert-focus');
            void card.offsetWidth;
            card.classList.add('is-alert-focus');
            return true;
          });
        }, 120);
      } else {
        showChekiToast(root, '타이머 앱으로 이동하지 못했습니다.');
      }
      return;
    }

    if (event.target.closest('[data-cheki-memo-save]')) {
      var memoInput = root.querySelector('[data-cheki-memo-input]');
      if (!memoInput || !state.selectedNumber) { showChekiToast(root, '저장할 운영 메모 대상을 찾지 못했습니다.'); return; }
      if (typeof QueueStore === 'undefined' || !QueueStore.saveMemo) {
        showChekiToast(root, '운영 메모 저장 기능을 준비하지 못했습니다.');
        return;
      }
      var memoResult = QueueStore.saveMemo(state.selectedNumber, memoInput.value);
      if (!memoResult || !memoResult.ok) {
        showChekiToast(root, memoResult && memoResult.message ? memoResult.message : '운영 메모 저장에 실패했습니다.');
        return;
      }
      var status = root.querySelector('[data-cheki-memo-status]');
      if (status) status.textContent = chekiMemoStatus(memoResult.row.memoUpdatedAt);
      showChekiToast(root, '운영 메모를 저장했습니다.');
      return;
    }

    if (event.target.closest('[data-cheki-exception]')) {
      showChekiToast(root, '예외 처리 기능은 다음 단계에서 연결됩니다.');
    }
  });
}

function rerenderChekiRoot(root, state) {
  root.innerHTML = renderChekiApp(state);
}

function getInProgressRows(data, filter) {
  return data.queues.filter(function (row) {
    var memberPass = filter === '전체' || row.member === filter;
    return memberPass && row.status === '진행중';
  }).sort(function (a, b) {
    return Number(a.number) - Number(b.number);
  });
}

function getLinkedTimerRow(queueRow) {
  if (!queueRow || typeof LumiTimerStore === 'undefined' || !LumiTimerStore.read) return null;
  var timerRow = LumiTimerStore.read().members && LumiTimerStore.read().members[queueRow.member];
  if (!timerRow || timerRow.source !== 'auto') return null;
  if (String(timerRow.queueNumber || '') !== String(queueRow.number || '')) return null;
  return ['진행중', '일시정지', '종료'].indexOf(timerRow.status) >= 0 ? timerRow : null;
}

function getActionableInProgressRows(data, filter) {
  return getInProgressRows(data, filter).filter(function (row) {
    return !getLinkedTimerRow(row);
  });
}

function getExchangeInProgressRows(data, filter) {
  return getInProgressRows(data, filter).filter(function (row) {
    return !!getLinkedTimerRow(row);
  });
}

function findQueueRow(data, number) {
  return data.queues.find(function (row) {
    return String(row.number) === String(number);
  }) || null;
}

function escapeCheki(value) {
  return String(value || '').replace(/[&<>"']/g, function (char) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
  });
}

function showChekiToast(root, message) {
  var toast = root.querySelector('[data-cheki-toast]');
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  toast.classList.add('is-visible');
  window.clearTimeout(root._chekiToastTimer);
  root._chekiToastTimer = window.setTimeout(function () {
    toast.classList.remove('is-visible');
    toast.hidden = true;
  }, 2600);
}
