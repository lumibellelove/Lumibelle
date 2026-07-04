/**
 * homework-cheki.js — 숙제체키 접수
 * 현장 특전 처리에서 넘긴 대상만 접수하고, 완료 후 같은 특전 처리 화면으로 복귀한다.
 */
window.LumiApps = window.LumiApps || {};

window.LumiApps.homeworkCheki = function () {
  var transfer = readHomeworkTransfer();
  window.__LumiHomeworkChekiActiveTransfer = transfer || null;
  if (transfer) clearHomeworkReceiptRouteToken();
  var state = homeworkManageState();

  /* 앱 아이콘으로 직접 열 때는 항상 관리 목록이 첫 화면이다.
     상세 화면은 목록에서 기록을 눌렀을 때만 같은 앱 세션 안에서 연다. */
  if (!transfer) state.detailId = '';

  var content = transfer ? renderHomeworkChekiApp(transfer) : renderHomeworkChekiManageApp();
  var modeClass = transfer ? ' is-receipt-mode' : ' is-manage-mode';
  setTimeout(bindHomeworkChekiApp, 0);
  return '<section class="homework-cheki-app' + modeClass + '" data-homework-cheki-app>' + content + '</section>';
};

function readHomeworkTransfer() {
  var hasReceiptRoute = false;
  try { hasReceiptRoute = window.sessionStorage.getItem('lumibelle_homework_cheki_receipt_route_v1') === '1'; } catch (error) {}
  if (!hasReceiptRoute) return null;
  var transfer = window.LumiHomeworkChekiTransfer || null;
  if (!transfer) {
    try { transfer = JSON.parse(window.sessionStorage.getItem('lumibelle_homework_cheki_transfer_v1') || 'null'); } catch (error) { transfer = null; }
  }
  return transfer && transfer.ticketType === 'homeworkCheki' ? transfer : null;
}

function clearHomeworkReceiptRouteToken() {
  try { window.sessionStorage.removeItem('lumibelle_homework_cheki_receipt_route_v1'); } catch (error) {}
}

function clearHomeworkReceiptTransfer() {
  window.LumiHomeworkChekiTransfer = null;
  window.__LumiHomeworkChekiActiveTransfer = null;
  try {
    window.sessionStorage.removeItem('lumibelle_homework_cheki_transfer_v1');
    window.sessionStorage.removeItem('lumibelle_homework_cheki_receipt_route_v1');
  } catch (error) {}
}

function homeworkCurrentStaffName() {
  return ((window.LumiCurrentStaff || {}).name || '유리 스탭');
}

function escHomework(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
    return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[ch];
  });
}

function homeworkDateText(value) {
  var date = value ? new Date(value) : new Date();
  if (isNaN(date.getTime())) date = new Date();
  return date.getFullYear() + '.' + String(date.getMonth() + 1).padStart(2, '0') + '.' + String(date.getDate()).padStart(2, '0') + ' · ' + String(date.getHours()).padStart(2, '0') + ':' + String(date.getMinutes()).padStart(2, '0');
}

function homeworkQuantity(transfer) {
  return Math.max(1, Number((transfer || {}).quantity || 1));
}

function homeworkManageSeedRecords() {
  if (window.__LumiHomeworkChekiDemoRecords) return window.__LumiHomeworkChekiDemoRecords;
  window.__LumiHomeworkChekiDemoRecords = [
    { id: 'demo_hw_001', fanId: 'LB-0720', fanName: '딸기우유♡', member: '마리링', quantity: 1, eventTitle: 'Lumibelle Debut Live', receivedAt: '2026-07-12T18:05:00.000Z', receiverName: '유리 스탭', status: '수령 가능', memo: '', isDemo: true, history: [{ status:'접수됨', at:'2026-07-12T18:05:00.000Z', staffName:'유리 스탭' }, { status:'준비중', at:'2026-07-14T07:10:00.000Z', staffName:'manager02' }, { status:'수령 가능', at:'2026-07-16T09:40:00.000Z', staffName:'manager02' }] },
    { id: 'demo_hw_002', fanId: 'LB-1041', fanName: '핑크라떼', member: '루루', quantity: 2, eventTitle: 'Lumibelle Debut Live', receivedAt: '2026-07-10T18:20:00.000Z', receiverName: '유리 스탭', status: '준비중', memo: '', isDemo: true, history: [{ status:'접수됨', at:'2026-07-10T18:20:00.000Z', staffName:'유리 스탭' }, { status:'준비중', at:'2026-07-13T07:00:00.000Z', staffName:'manager02' }] },
    { id: 'demo_hw_003', fanId: 'LB-0877', fanName: '별빛소다', member: '이로', quantity: 1, eventTitle: 'Lumibelle Debut Live', receivedAt: '2026-07-08T17:45:00.000Z', receiverName: '유리 스탭', status: '접수됨', memo: '', isDemo: true, history: [{ status:'접수됨', at:'2026-07-08T17:45:00.000Z', staffName:'유리 스탭' }] },
    { id: 'demo_hw_004', fanId: 'LB-2210', fanName: '달콤메론', member: '루나', quantity: 1, eventTitle: 'Lumibelle Debut Live', receivedAt: '2026-07-05T18:10:00.000Z', receiverName: '유리 스탭', status: '수령완료', memo: '', isDemo: true, deliveredAt: '2026-07-19T10:12:00.000Z', deliveryEventTitle:'Dream Pop Party Vol. 3', deliveryVenue:'상상마당 라이브홀', deliveryStaffName:'유리 스탭', deliveryMemo:'', history: [{ status:'접수됨', at:'2026-07-05T18:10:00.000Z', staffName:'유리 스탭' }, { status:'준비중', at:'2026-07-07T08:00:00.000Z', staffName:'manager02' }, { status:'수령 가능', at:'2026-07-09T09:30:00.000Z', staffName:'manager02' }, { status:'수령완료', at:'2026-07-19T10:12:00.000Z', staffName:'유리 스탭' }] },
    { id: 'demo_hw_005', fanId: 'LB-3002', fanName: '슈가리본', member: '마리링', quantity: 3, eventTitle: 'Lumibelle Debut Live', receivedAt: '2026-07-03T17:55:00.000Z', receiverName: '유리 스탭', status: '수령 가능', memo: '', isDemo: true, history: [{ status:'접수됨', at:'2026-07-03T17:55:00.000Z', staffName:'유리 스탭' }, { status:'준비중', at:'2026-07-05T07:30:00.000Z', staffName:'manager02' }, { status:'수령 가능', at:'2026-07-07T08:40:00.000Z', staffName:'manager02' }] }
  ];
  return window.__LumiHomeworkChekiDemoRecords;
}

function homeworkManageState() {
  if (!window.__LumiHomeworkChekiManageState) {
    window.__LumiHomeworkChekiManageState = { query: '', member: '전체', status: '전체' };
  }
  return window.__LumiHomeworkChekiManageState;
}

function homeworkManageRows() {
  // 특전 처리에서 접수 완료된 대기 건과 관리 목록을 열 때마다 대조한다.
  // 저장 환경 차이로 목록 저장이 빠진 기존 접수 건도 여기서 한 번 복구한다.
  HomeworkChekiStore.syncFromQueue();
  var rows = HomeworkChekiStore.read();
  return rows.length ? rows : homeworkManageSeedRecords();
}

function homeworkShortDate(value) {
  var date = value ? new Date(value) : null;
  if (!date || isNaN(date.getTime())) return '날짜 미정';
  return String(date.getMonth() + 1).padStart(2, '0') + '.' + String(date.getDate()).padStart(2, '0') + ' 접수';
}

function homeworkStatusClass(status) {
  return ({ '접수됨': 'received', '준비중': 'preparing', '수령 가능': 'ready', '수령완료': 'complete' })[status] || 'received';
}

function homeworkStatusCount(rows, status) {
  return rows.filter(function (row) { return row.status === status; }).length;
}

function homeworkRecordById(id) {
  if (!id) return null;
  return homeworkManageRows().filter(function (row) { return row.id === id; })[0] || null;
}

function homeworkStatusOrder() { return ['접수됨', '준비중', '수령 가능', '수령완료']; }
function homeworkStatusDescription(status) {
  return ({ '접수됨':'숙제체키 접수가 완료되었어요.', '준비중':'멤버가 숙제체키를 준비하고 있어요.', '수령 가능':'다음 공연에서 팬에게 전달할 수 있어요.', '수령완료':'팬에게 실물 전달이 완료되었어요.' })[status] || '';
}
function homeworkDateTimeShort(value) {
  var date = value ? new Date(value) : null;
  if (!date || isNaN(date.getTime())) return '−';
  return date.getFullYear() + '.' + String(date.getMonth()+1).padStart(2,'0') + '.' + String(date.getDate()).padStart(2,'0') + ' ' + String(date.getHours()).padStart(2,'0') + ':' + String(date.getMinutes()).padStart(2,'0');
}
function homeworkCurrentEventContext() {
  var current = window.LumiCurrentEvent || {};
  return {
    title: current.eventTitle || current.title || '현재 공연',
    venue: current.venueName || current.venue || '공연장 미연결',
    eventId: current.eventId || ''
  };
}
function homeworkHistoryFor(record) {
  if (Array.isArray(record.history) && record.history.length) return record.history;
  return [{ status:'접수됨', at:record.receivedAt || new Date().toISOString(), staffName:record.receiverName || '담당 스탭' }];
}
function homeworkProgressMarkup(record) {
  var active = record.status || '접수됨';
  var order = homeworkStatusOrder();
  var activeIndex = Math.max(0, order.indexOf(active));
  return '<div class="homework-detail-progress is-step-' + activeIndex + '">' + order.map(function(status, index){
    var cls = index < activeIndex ? 'is-done' : (index === activeIndex ? 'is-current' : '');
    return '<div class="' + cls + '"><i aria-hidden="true"></i><span>' + status + '</span></div>';
  }).join('') + '</div>';
}
function homeworkDetailInfoRow(label, value) { return '<p><span>' + escHomework(label) + '</span><strong>' + escHomework(value || '−') + '</strong></p>'; }
function homeworkDetailHistoryRow(record, status) {
  var order = homeworkStatusOrder();
  var currentIndex = Math.max(0, order.indexOf(record.status));
  var index = order.indexOf(status);
  var history = homeworkHistoryFor(record).filter(function(item){ return item.status === status; })[0];
  var stateClass = index < currentIndex ? ' is-done' : (index === currentIndex ? ' is-current' : ' is-future');
  return '<div class="homework-detail-history-row' + stateClass + '"><i aria-hidden="true"></i><strong>' + status + '</strong><span>' + (history ? homeworkDateTimeShort(history.at) : '−') + '</span><em>' + escHomework(history ? history.staffName : (status === '수령완료' ? '아직 처리되지 않았어요' : '')) + '</em></div>';
}
function renderHomeworkReceiptMemo(record) {
  var memo = String(record && record.memo || '').trim();
  if (!memo) return '';
  return '<section class="homework-detail-receipt-memo-card"><header>접수 메모</header><p>' + escHomework(memo).replace(/\n/g, '<br>') + '</p></section>';
}
function renderHomeworkChekiDetailApp(record) {
  if (!record) return '<section class="homework-empty-card"><span>♡</span><strong>숙제체키 기록을 찾지 못했어요.</strong></section>';
  var event = homeworkCurrentEventContext();
  var isReady = record.status === '수령 가능';
  var isComplete = record.status === '수령완료';
  return '<header class="homework-detail-titlebar"><button type="button" data-homework-detail-back aria-label="숙제체키 관리로">‹</button><div><h2>숙제체키 상세</h2><span>HOMEWORK CHEKI RECORD</span></div><button type="button" aria-label="더보기">•••</button></header>' +
    '<section class="homework-detail-status-card"><span>현재 상태</span><strong>' + escHomework(record.status) + '</strong><p>' + homeworkStatusDescription(record.status) + '</p>' + homeworkProgressMarkup(record) + '</section>' +
    '<section class="homework-detail-info-card"><header>기본 정보</header><div class="homework-detail-info-grid"><div class="homework-detail-profile" aria-hidden="true"><span>♡</span></div><div class="homework-detail-info-column homework-detail-info-main">' +
      homeworkDetailInfoRow('팬 닉네임', record.fanName) + homeworkDetailInfoRow('루미 ID', record.fanId) + homeworkDetailInfoRow('멤버 · 수량', (record.member || '−') + ' · ' + homeworkQuantity(record) + '장') + homeworkDetailInfoRow('접수 공연', record.eventTitle || '공연 정보 없음') + homeworkDetailInfoRow('접수 일시', homeworkDateTimeShort(record.receivedAt)) +
      '</div></div><div class="homework-detail-flags"><span>주의 체크 있음</span><span>메모록 있음</span></div></section>' +
    renderHomeworkReceiptMemo(record) +
    '<section class="homework-detail-history-card"><header>진행 기록</header><div>' + homeworkStatusOrder().map(function(status){ return homeworkDetailHistoryRow(record, status); }).join('') + '</div></section>' +
    (isReady ? '<section class="homework-delivery-card"><header>수령 완료 처리</header><div>' + homeworkDetailInfoRow('전달 공연', event.title) + homeworkDetailInfoRow('전달 장소', event.venue) + homeworkDetailInfoRow('수령 담당자', homeworkCurrentStaffName()) + '<label>전달 메모<input type="text" data-homework-delivery-memo placeholder="전달 후 필요 시 메모를 남겨주세요."></label></div><button type="button" data-homework-delivery-complete>♡ 수령 완료 처리</button></section>' : '') +
    (isComplete ? '<section class="homework-detail-complete-card"><header>수령 완료 정보</header><div>' + homeworkDetailInfoRow('전달 공연', record.deliveryEventTitle) + homeworkDetailInfoRow('전달 장소', record.deliveryVenue) + homeworkDetailInfoRow('수령 완료', homeworkDateTimeShort(record.deliveredAt)) + homeworkDetailInfoRow('수령 담당자', record.deliveryStaffName) + (record.deliveryMemo ? homeworkDetailInfoRow('전달 메모', record.deliveryMemo) : '') + '</div></section>' : '') +
    '<section class="homework-detail-guide"><span>✉</span><p><b>안내</b>실물 전달 전 팬 정보와 수량을 다시 확인해주세요.</p></section>';
}
function homeworkUpdateRecord(id, patch) {
  var rows = HomeworkChekiStore.read();
  var index = rows.findIndex(function(row){ return row.id === id; });
  if (index >= 0) { rows[index] = Object.assign({}, rows[index], patch); HomeworkChekiStore.write(rows); return rows[index]; }
  var demo = homeworkManageSeedRecords();
  var demoIndex = demo.findIndex(function(row){ return row.id === id; });
  if (demoIndex >= 0) { demo[demoIndex] = Object.assign({}, demo[demoIndex], patch); return demo[demoIndex]; }
  return null;
}
function homeworkCompleteDelivery(record, memo) {
  var event = homeworkCurrentEventContext();
  var at = new Date().toISOString();
  var history = homeworkHistoryFor(record).slice();
  history.push({ status:'수령완료', at:at, staffName:homeworkCurrentStaffName() });
  return homeworkUpdateRecord(record.id, { status:'수령완료', history:history, deliveredAt:at, deliveryEventId:event.eventId, deliveryEventTitle:event.title, deliveryVenue:event.venue, deliveryStaffName:homeworkCurrentStaffName(), deliveryMemo:memo || '' });
}

function renderHomeworkChekiManageApp() {
  var rows = homeworkManageRows();
  var state = homeworkManageState();
  return (
    '<header class="homework-manage-titlebar">' +
      '<button type="button" class="homework-manage-back" data-homework-manage-back aria-label="이전 화면으로">‹</button>' +
      '<div><h2>숙제체키 관리</h2><span>HOMEWORK CHEKI ARCHIVE</span></div>' +
      '<button type="button" class="homework-manage-search-icon" data-homework-manage-focus-search aria-label="검색">⌕</button>' +
    '</header>' +
    '<section class="homework-manage-stats" aria-label="숙제체키 현황">' +
      homeworkManageStat('접수됨', homeworkStatusCount(rows, '접수됨'), 'received', '▤') +
      homeworkManageStat('준비중', homeworkStatusCount(rows, '준비중'), 'preparing', '⌛') +
      homeworkManageStat('수령 가능', homeworkStatusCount(rows, '수령 가능'), 'ready', '♡') +
      homeworkManageStat('수령완료', homeworkStatusCount(rows, '수령완료'), 'complete', '✉') +
    '</section>' +
    '<section class="homework-manage-filter-card">' +
      '<label class="homework-manage-search"><span>⌕</span><input type="search" data-homework-manage-search placeholder="닉네임 또는 루미 ID 검색" value="' + escHomework(state.query) + '"></label>' +
      '<div class="homework-member-filter"><b>멤버 필터</b>' + homeworkMemberButtons(state.member) + '</div>' +
    '</section>' +
    '<nav class="homework-status-tabs" aria-label="진행 상태 필터">' + homeworkStatusTabs(state.status) + '</nav>' +
    '<section class="homework-manage-list" data-homework-manage-list>' + renderHomeworkManageList(rows, state) + '</section>' +
    '<section class="homework-manage-guide"><span>✉</span><p>수령 가능 상태의 숙제체키는<br>다음 공연에서 전달해주세요.</p></section>'
  );
}

function homeworkManageStat(label, count, className, icon) {
  return '<button type="button" class="homework-manage-stat is-' + className + '" data-homework-status-filter="' + escHomework(label) + '"><i>' + icon + '</i><span>' + escHomework(label) + '</span><strong>' + count + '</strong></button>';
}

function homeworkMemberButtons(active) {
  return ['전체', '마리링', '루루', '이로', '루나'].map(function (member) {
    return '<button type="button" class="' + (member === active ? 'is-active' : '') + '" data-homework-member-filter="' + member + '">' + member + '</button>';
  }).join('');
}

function homeworkStatusTabs(active) {
  return ['전체', '접수됨', '준비중', '수령 가능', '수령완료'].map(function (status) {
    return '<button type="button" class="' + (status === active ? 'is-active is-' + homeworkStatusClass(status) : '') + '" data-homework-status-filter="' + status + '">' + status + '</button>';
  }).join('');
}

function renderHomeworkManageList(rows, state) {
  var query = String(state.query || '').trim().toLowerCase();
  var filtered = rows.filter(function (row) {
    var matchQuery = !query || String(row.fanName || '').toLowerCase().indexOf(query) !== -1 || String(row.fanId || '').toLowerCase().indexOf(query) !== -1;
    var matchMember = state.member === '전체' || row.member === state.member;
    var matchStatus = state.status === '전체' || row.status === state.status;
    return matchQuery && matchMember && matchStatus;
  });
  if (!filtered.length) return '<div class="homework-manage-empty">조건에 맞는 숙제체키 기록이 없습니다.</div>';
  return filtered.map(function (row) {
    return '<article class="homework-manage-row" data-homework-record-id="' + escHomework(row.id) + '">' +
      '<div class="homework-manage-avatar" aria-hidden="true">♡</div>' +
      '<div class="homework-manage-row-copy"><strong>' + escHomework(row.fanName || '이름 없음') + '</strong><p>' + escHomework(row.fanId || '−') + ' <i>·</i> ' + escHomework(row.member || '−') + ' <i>·</i> ' + homeworkQuantity(row) + '장</p><em>' + homeworkShortDate(row.receivedAt) + '</em></div>' +
      '<div class="homework-manage-row-status"><span class="is-' + homeworkStatusClass(row.status) + '">' + escHomework(row.status || '접수됨') + '</span><b>›</b></div>' +
    '</article>';
  }).join('');
}

function renderHomeworkChekiApp(transfer) {
  if (!transfer) {
    return '<section class="homework-empty-card"><span>♡</span><strong>접수할 숙제체키가 없습니다.</strong><p>특전 처리 화면에서 특전권 회수 완료 후 접수를 시작해주세요.</p></section>';
  }

  var quantity = homeworkQuantity(transfer);
  return (
    '<header class="homework-titlebar">' +
      '<button type="button" class="homework-back-button" data-homework-cheki-back aria-label="특전 처리로 돌아가기">‹</button>' +
      '<div><h2>숙제체키 접수</h2><span>HOMEWORK CHEKI</span></div>' +
      '<i aria-hidden="true">♡</i>' +
    '</header>' +
    '<section class="homework-hero-card">' +
      '<span class="homework-hero-ribbon" aria-hidden="true">♡</span>' +
      '<strong>나중에 수령할 체키를 접수해요</strong>' +
      '<p>회수한 특전권 기준으로 접수 기록을 남겨주세요.</p>' +
    '</section>' +
    '<article class="homework-fan-card">' +
      '<div class="homework-fan-portrait" aria-hidden="true"><span>♡</span></div>' +
      '<div class="homework-fan-details">' +
        homeworkFanRow('팬 닉네임', transfer.fanName || '−') +
        homeworkFanRow('루미 ID', transfer.fanId || '−') +
        homeworkFanRow('선택 멤버', transfer.member || '−') +
        homeworkFanRow('오늘 공연', transfer.eventTitle || '현재 공연') +
      '</div>' +
      '<div class="homework-fan-flags"><span>주의 체크 있음</span><span>메모록 있음</span></div>' +
    '</article>' +
    '<section class="homework-receipt-card">' +
      '<header><span>접수 정보</span></header>' +
      '<div class="homework-info-grid">' +
        homeworkInfoRow('특전 종류', '숙제체키') +
        '<div class="homework-info-row homework-quantity-row"><span>접수 수량</span><div class="homework-quantity-control"><button type="button" data-homework-quantity-minus aria-label="수량 줄이기">−</button><strong data-homework-cheki-quantity>' + quantity + '장</strong><button type="button" data-homework-quantity-plus aria-label="수량 늘리기">＋</button></div></div>' +
        homeworkInfoRow('사용 멤버', transfer.member || '−') +
        homeworkInfoRow('오늘 공연', transfer.eventTitle || '현재 공연') +
        homeworkInfoRow('접수 담당자', homeworkCurrentStaffName()) +
        homeworkInfoRow('접수 일시', '접수 완료 시 자동 기록', 'muted') +
        homeworkInfoRow('진행 상태', '접수 예정', 'status') +
      '</div>' +
    '</section>' +
    '<section class="homework-memo-card">' +
      '<label for="homework-cheki-memo">접수 메모 <small>선택</small></label>' +
      '<textarea id="homework-cheki-memo" data-homework-cheki-memo placeholder="요청 문구 · 데코 요청 · 사진 식별 메모 · 특전권 상태 등 작업에 필요한 내용을 남겨주세요."></textarea>' +
    '</section>' +
    '<section class="homework-summary-card">' +
      '<header>접수 요약</header>' +
      '<div>' +
        homeworkSummaryRow('팬', transfer.fanName || '−') +
        homeworkSummaryRow('멤버', transfer.member || '−') +
        homeworkSummaryRow('특전 종류', '숙제체키') +
        homeworkSummaryRow('수량', quantity + '장', 'data-homework-summary-quantity') +
        homeworkSummaryRow('진행 상태', '접수 예정') +
        homeworkSummaryNoteRow('♡ 접수 완료 후 기록이 생성됩니다.') +
      '</div>' +
    '</section>' +
    '<section class="homework-guide-card"><b>안내 사항</b><ul><li>접수 완료 후 숙제체키 기록이 생성됩니다.</li><li>완료되면 원래 특전 처리 화면으로 자동 돌아갑니다.</li><li>접수 이후 촬영을 진행하며, 촬영 완료 시 기존 120초 교류 타이머가 자동 시작됩니다.</li></ul></section>' +
    '<footer class="homework-actions"><button type="button" class="homework-cancel-button" data-homework-cheki-back>취소</button><button type="button" class="homework-submit-button" data-homework-cheki-submit>접수 완료</button></footer>' +
    '<div class="homework-toast" data-homework-cheki-toast hidden role="status" aria-live="polite"></div>'
  );
}

function homeworkFanRow(label, value) {
  return '<p><span>' + escHomework(label) + '</span><strong>' + escHomework(value) + '</strong></p>';
}

function homeworkInfoRow(label, value, className) {
  return '<div class="homework-info-row' + (className ? ' is-' + className : '') + '"><span>' + escHomework(label) + '</span><strong>' + escHomework(value) + '</strong></div>';
}

function homeworkSummaryRow(label, value, strongAttr) {
  return '<p><span>' + escHomework(label) + '</span><strong' + (strongAttr ? ' ' + strongAttr : '') + '>' + escHomework(value) + '</strong></p>';
}

function homeworkSummaryNoteRow(text) {
  return '<p class="homework-summary-note"><strong>' + escHomework(text) + '</strong></p>';
}

var HomeworkChekiStore = (function () {
  var KEY = 'lumibelle_staff_homework_cheki_v1';
  var SESSION_KEY = 'lumibelle_staff_homework_cheki_session_v1';
  var memoryRows = null;

  function parseRows(raw) {
    try {
      var parsed = JSON.parse(raw || '[]');
      return Array.isArray(parsed) ? parsed : null;
    } catch (error) { return null; }
  }

  function read() {
    if (Array.isArray(memoryRows)) return memoryRows.slice();
    var rows = null;
    try { rows = parseRows(window.sessionStorage.getItem(SESSION_KEY)); } catch (error) {}
    if (!rows) {
      try { rows = parseRows(window.localStorage.getItem(KEY)); } catch (error) {}
    }
    memoryRows = rows || [];
    return memoryRows.slice();
  }

  function write(rows) {
    memoryRows = Array.isArray(rows) ? rows.slice() : [];
    var raw;
    try { raw = JSON.stringify(memoryRows); } catch (error) { return false; }
    var saved = false;
    try { window.sessionStorage.setItem(SESSION_KEY, raw); saved = true; } catch (error) {}
    try { window.localStorage.setItem(KEY, raw); saved = true; } catch (error) {}
    return saved || Array.isArray(memoryRows);
  }

  function create(input) {
    var rows = read();
    var now = new Date().toISOString();
    var record = {
      id: 'hw_' + Date.now() + '_' + Math.random().toString(16).slice(2),
      queueId: input.queueId,
      queueNumber: input.queueNumber,
      fanId: input.fanId,
      fanName: input.fanName,
      member: input.member,
      quantity: Math.max(1, Number(input.quantity || 1)),
      eventId: input.eventId || '',
      eventTitle: input.eventTitle || '',
      receivedAt: now,
      receiverName: homeworkCurrentStaffName(),
      status: '접수됨',
      memo: input.memo || '',
      history: [{ status:'접수됨', at:now, staffName:homeworkCurrentStaffName() }]
    };
    rows.unshift(record);
    write(rows);
    return record;
  }

  function remove(id) {
    var targetId = String(id || '');
    if (!targetId) return false;
    var rows = read();
    var nextRows = rows.filter(function (record) { return String(record.id || '') !== targetId; });
    if (nextRows.length === rows.length) return false;
    write(nextRows);
    return true;
  }

  function syncFromQueue() {
    if (typeof QueueStore === 'undefined' || typeof QueueStore.read !== 'function') return false;
    var queueData = QueueStore.read();
    var queueRows = Array.isArray(queueData.queues) ? queueData.queues : [];
    var rows = read();
    var changed = false;

    queueRows.forEach(function (queueRow) {
      if (!queueRow || !queueRow.homeworkReceiptId) return;
      var alreadyExists = rows.some(function (record) {
        return record.id === queueRow.homeworkReceiptId ||
          (String(record.queueId || '') === String(queueRow.id || '') && String(record.queueNumber || '') === String(queueRow.number || ''));
      });
      if (alreadyExists) return;

      var receivedAt = queueRow.homeworkRegisteredAt || queueRow.registeredAt || new Date().toISOString();
      var receiverName = queueRow.homeworkReceiverName || '담당 스탭';
      rows.unshift({
        id: queueRow.homeworkReceiptId,
        queueId: queueRow.id || '',
        queueNumber: queueRow.number || '',
        fanId: queueRow.lumiId || '−',
        fanName: queueRow.displayName || '현장 접수',
        member: queueRow.member || '−',
        quantity: Math.max(1, Number(queueRow.quantity || 1)),
        eventId: (queueData.event || {}).eventId || '',
        eventTitle: (queueData.event || {}).title || '현재 공연',
        receivedAt: receivedAt,
        receiverName: receiverName,
        status: queueRow.homeworkStatus || '접수됨',
        memo: queueRow.homeworkMemo || '',
        history: [{ status:'접수됨', at:receivedAt, staffName:receiverName }]
      });
      changed = true;
    });

    if (changed) write(rows);
    return changed;
  }

  return { read: read, write: write, create: create, remove: remove, syncFromQueue: syncFromQueue };
})();

function bindHomeworkChekiApp() {
  var root = document.querySelector('[data-homework-cheki-app]');
  if (!root || root.getAttribute('data-homework-cheki-bound') === 'true') return;
  root.setAttribute('data-homework-cheki-bound', 'true');
  var activeTransfer = window.__LumiHomeworkChekiActiveTransfer || null;

  root.addEventListener('click', function (event) {
    if (event.target.closest('[data-homework-manage-back]')) {
      if (window.StaffOS && typeof window.StaffOS.goBack === 'function') window.StaffOS.goBack();
      return;
    }
    if (event.target.closest('[data-homework-manage-focus-search]')) {
      var searchField = root.querySelector('[data-homework-manage-search]');
      if (searchField) searchField.focus();
      return;
    }
    var statusButton = event.target.closest('[data-homework-status-filter]');
    if (statusButton) {
      homeworkManageState().status = statusButton.getAttribute('data-homework-status-filter') || '전체';
      renderHomeworkManageRoot(root);
      return;
    }
    var memberButton = event.target.closest('[data-homework-member-filter]');
    if (memberButton) {
      homeworkManageState().member = memberButton.getAttribute('data-homework-member-filter') || '전체';
      renderHomeworkManageRoot(root);
      return;
    }
    if (event.target.closest('[data-homework-cheki-back]')) {
      clearHomeworkReceiptTransfer();
      if (window.StaffOS && typeof window.StaffOS.openApp === 'function') window.StaffOS.openApp('cheki');
      return;
    }
    var recordCard = event.target.closest('[data-homework-record-id]');
    if (recordCard) {
      homeworkManageState().detailId = recordCard.getAttribute('data-homework-record-id') || '';
      renderHomeworkDetailRoot(root);
      return;
    }
    if (event.target.closest('[data-homework-detail-back]')) {
      homeworkManageState().detailId = '';
      renderHomeworkManageRoot(root);
      return;
    }
    if (event.target.closest('[data-homework-delivery-complete]')) {
      var deliveryRecord = homeworkRecordById(homeworkManageState().detailId);
      var deliveryMemo = (root.querySelector('[data-homework-delivery-memo]') || {}).value || '';
      if (deliveryRecord) { homeworkCompleteDelivery(deliveryRecord, deliveryMemo); renderHomeworkDetailRoot(root); }
      return;
    }

    var transfer = activeTransfer;
    if (!transfer) return;

    if (event.target.closest('[data-homework-quantity-minus]') || event.target.closest('[data-homework-quantity-plus]')) {
      var delta = event.target.closest('[data-homework-quantity-minus]') ? -1 : 1;
      transfer.quantity = Math.max(1, homeworkQuantity(transfer) + delta);
      window.LumiHomeworkChekiTransfer = transfer;
      window.__LumiHomeworkChekiActiveTransfer = transfer;
      activeTransfer = transfer;
      try { window.sessionStorage.setItem('lumibelle_homework_cheki_transfer_v1', JSON.stringify(transfer)); } catch (error) {}
      var quantityText = root.querySelector('[data-homework-cheki-quantity]');
      if (quantityText) quantityText.textContent = transfer.quantity + '장';
      root.querySelectorAll('[data-homework-summary-quantity]').forEach(function (node) { node.textContent = transfer.quantity + '장'; });
      return;
    }

    if (!event.target.closest('[data-homework-cheki-submit]')) return;
    var button = root.querySelector('[data-homework-cheki-submit]');
    if (button && button.disabled) return;
    if (button) { button.disabled = true; button.textContent = '접수 기록 저장 중…'; }

    var memo = (root.querySelector('[data-homework-cheki-memo]') || {}).value || '';

    if (typeof QueueStore === 'undefined' || typeof QueueStore.canRegisterHomeworkCheki !== 'function' || typeof QueueStore.registerHomeworkCheki !== 'function') {
      if (button) { button.disabled = false; button.textContent = '접수 완료'; }
      showHomeworkToast(root, '대기 건 연결을 준비하지 못했습니다.');
      return;
    }

    var eligibility = QueueStore.canRegisterHomeworkCheki(String(transfer.queueNumber));
    if (!eligibility.ok) {
      if (button) { button.disabled = false; button.textContent = '접수 완료'; }
      showHomeworkToast(root, eligibility.message || '이미 접수되었거나 접수할 수 없는 대기 건입니다.');
      return;
    }

    var record = HomeworkChekiStore.create({
      queueId: transfer.queueId,
      queueNumber: transfer.queueNumber,
      fanId: transfer.fanId,
      fanName: transfer.fanName,
      member: transfer.member,
      quantity: homeworkQuantity(transfer),
      eventId: transfer.eventId,
      eventTitle: transfer.eventTitle,
      memo: memo
    });

    var result = QueueStore.registerHomeworkCheki(String(transfer.queueNumber), {
      recordId: record.id,
      receivedAt: record.receivedAt,
      receiverName: record.receiverName,
      memo: record.memo,
      quantity: record.quantity
    });
    if (!result.ok || result.alreadyRegistered) {
      HomeworkChekiStore.remove(record.id);
      if (button) { button.disabled = false; button.textContent = '접수 완료'; }
      showHomeworkToast(root, result.message || '접수 기록을 저장하지 못했습니다.');
      return;
    }

    var back = { queueNumber: transfer.queueNumber, recordId: record.id, returnApp: 'cheki' };
    try { window.sessionStorage.setItem('lumibelle_homework_cheki_return_v1', JSON.stringify(back)); } catch (error) {}
    clearHomeworkReceiptTransfer();

    if (window.StaffOS && typeof window.StaffOS.openApp === 'function') {
      window.StaffOS.openApp('cheki');
    }
  });

  root.addEventListener('input', function (event) {
    if (!event.target.matches('[data-homework-manage-search]')) return;
    homeworkManageState().query = event.target.value || '';
    var list = root.querySelector('[data-homework-manage-list]');
    if (list) list.innerHTML = renderHomeworkManageList(homeworkManageRows(), homeworkManageState());
  });
}

function renderHomeworkManageRoot(root) {
  root.classList.remove('is-receipt-mode', 'is-detail-mode');
  root.classList.add('is-manage-mode');
  root.innerHTML = renderHomeworkChekiManageApp();
}

function renderHomeworkDetailRoot(root) {
  var record = homeworkRecordById(homeworkManageState().detailId);
  root.classList.remove('is-receipt-mode', 'is-manage-mode');
  root.classList.add('is-detail-mode');
  root.innerHTML = renderHomeworkChekiDetailApp(record);
}

function showHomeworkToast(root, message) {
  var toast = root.querySelector('[data-homework-cheki-toast]');
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  window.clearTimeout(root._homeworkToastTimer);
  root._homeworkToastTimer = window.setTimeout(function () { toast.hidden = true; }, 2200);
}
