/**
 * gate.js — Staff OS 입장 확인 앱
 * 입장 처리·로그 조회·로그 수정·입금 내역 열람
 */
window.LumiApps = window.LumiApps || {};

var gateRecordDefaults = [
  { id: 'gate-strawberry', nickname: '딸기버터케이크', reservation: '250520-12345', lumiId: 'LB-0018', ticket: 'VIP석', reservedAt: '2026.07.05 19:42', paidAt: '2026.07.06 13:18', paymentChecker: '총괄', payerName: '김딸기', paymentAmount: '₩30,000', paymentMethod: '계좌이체', paymentMemo: '예약자명과 입금자명 일치 확인 후 입금 확인 처리했습니다.', entered: false, enteredAt: '', checker: '', method: '예약번호 확인', entryMemo: '' },
  { id: 'gate-cherry', nickname: '체리슈크림', reservation: '250520-12346', lumiId: 'LB-0019', ticket: '일반석', reservedAt: '2026.07.06 11:05', paidAt: '2026.07.06 11:32', paymentChecker: '총괄', payerName: '박체리', paymentAmount: '₩20,000', paymentMethod: '계좌이체', paymentMemo: '정상 확인 처리되었습니다.', entered: true, enteredAt: '18:57', checker: '김스탭', method: '예약번호 확인', entryMemo: '문제 없이 정상 입장 처리' },
  { id: 'gate-pink', nickname: '핑크샤베트', reservation: '250520-12347', lumiId: 'LB-0020', ticket: '일반석', reservedAt: '2026.07.07 20:10', paidAt: '확인 대기', paymentChecker: '', payerName: '-', paymentAmount: '₩20,000', paymentMethod: '계좌이체', paymentMemo: '입금 확인 대기 중입니다.', entered: false, enteredAt: '', checker: '', method: '예약번호 확인', entryMemo: '' },
  { id: 'gate-sparkle', nickname: '반짝이는루미', reservation: '250520-12348', lumiId: 'LB-0021', ticket: '일반석', reservedAt: '2026.07.07 21:02', paidAt: '2026.07.07 21:30', paymentChecker: '총괄', payerName: '이루미', paymentAmount: '₩20,000', paymentMethod: '계좌이체', paymentMemo: '정상 확인 처리되었습니다.', entered: true, enteredAt: '18:42', checker: '김스탭', method: '예약번호 확인', entryMemo: '문제 없이 정상 입장 처리' },
  /* 테스트: 초대석·관계자는 닉네임 검색 시 결제 상태 칩이 모두 “초대석”으로 표시됩니다. */
  { id: 'gate-invite-test', nickname: '초대테스트', reservation: '250520-12349', lumiId: 'LB-0024', ticket: '초대석', reservedAt: '2026.07.08 10:10', paidAt: '초대석', paymentChecker: '총괄', payerName: '-', paymentAmount: '-', paymentMethod: '해당 없음', paymentMemo: '초대석으로 등록된 테스트 기록입니다.', entered: false, enteredAt: '', checker: '', method: '닉네임 확인', entryMemo: '', isInvite: true, entryType: '초대석' },
  { id: 'gate-staff-test', nickname: '관계자테스트', reservation: '250520-12350', lumiId: 'LB-0025', ticket: '관계자', reservedAt: '2026.07.08 10:15', paidAt: '관계자', paymentChecker: '총괄', payerName: '-', paymentAmount: '-', paymentMethod: '해당 없음', paymentMemo: '관계자 초대석으로 등록된 테스트 기록입니다.', entered: false, enteredAt: '', checker: '', method: '닉네임 확인', entryMemo: '', isInvite: true, entryType: '초대석' }
];

/* 오늘 사전예약과 별도로, 기존 팬 여부만 확인하는 최소 팬 목록입니다.
   실제 연동 시에는 루미폰 팬 DB 조회 결과로 교체합니다. */
var gateFanDirectory = [
  /* 오늘 사전예약은 없지만 기존 팬으로 조회되어 현장 입장 테스트에 쓰는 목록입니다. */
  { id: 'fan-starlight', nickname: '별빛루미', lumiId: 'LB-0022' },
  { id: 'fan-milky', nickname: '밀키하트', lumiId: 'LB-0023' },
  { id: 'fan-walkin-test', nickname: '현장기존팬', lumiId: 'LB-0026' },
  { id: 'fan-walkin-test-2', nickname: '구름솜사탕', lumiId: 'LB-0027' }
];

function gateNormalizeLumiId(value) {
  var text = String(value || '').trim().toUpperCase();
  if (!text) return '';
  var match = text.match(/(?:LB[-\s]?)?(\d{1,4})$/) || text.match(/(?:LM[-\d]*)?(\d{1,4})$/);
  return match ? 'LB-' + String(match[1]).padStart(4, '0') : '';
}
function gateFormatLumiId(value) {
  return gateNormalizeLumiId(value) || String(value || '').trim();
}

window.GateRecordStore = window.GateRecordStore || (function () {
  var STORAGE_KEY = 'lumibelle_gate_records_v1';
  function cloneDefaults() { return JSON.parse(JSON.stringify(gateRecordDefaults)); }
  function normalizeRecords(records) {
    return records.map(function (record) {
      var copy = Object.assign({}, record);
      if (copy.lumiId && copy.lumiId !== '현장 미연결') copy.lumiId = gateFormatLumiId(copy.lumiId);
      return copy;
    });
  }
  function mergeMissingDefaults(records) {
    var current = Array.isArray(records) ? records.slice() : [];
    var ids = {};
    current.forEach(function (record) { if (record && record.id) ids[record.id] = true; });
    cloneDefaults().forEach(function (record) {
      if (!ids[record.id]) current.push(record);
    });
    return current;
  }
  function read() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      var saved = raw ? JSON.parse(raw) : null;
      if (Array.isArray(saved) && saved.length) return normalizeRecords(mergeMissingDefaults(saved));
    } catch (error) {}
    return normalizeRecords(cloneDefaults());
  }
  function save(records) {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); } catch (error) {}
    return records;
  }
  return { read: read, save: save };
}());

window.GateHomeStore = window.GateHomeStore || (function () {
  var STORAGE_KEY = 'lumibelle_gate_entered_count_v1';
  var FALLBACK_COUNT = 87;
  var memoryCount = null;
  function readCount() {
    if (memoryCount !== null) return memoryCount;
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw !== null && raw !== '') return memoryCount = Math.max(0, Number(raw) || 0);
    } catch (error) {}
    return memoryCount = FALLBACK_COUNT;
  }
  function saveCount(count) {
    memoryCount = Math.max(0, Number(count) || 0);
    try { window.localStorage.setItem(STORAGE_KEY, String(memoryCount)); } catch (error) {}
    try { window.dispatchEvent(new CustomEvent('lumibelle:gatechange')); } catch (error) {}
    return memoryCount;
  }
  function adjustEnteredCount(delta) { return saveCount(readCount() + Number(delta || 0)); }
  return { getEnteredCount: readCount, adjustEnteredCount: adjustEnteredCount, markEnteredOnce: function () { return adjustEnteredCount(1); } };
}());

var gateRecords = window.GateRecordStore.read();
function saveGateRecords() { window.GateRecordStore.save(gateRecords); }
function gateIsPaid(record) { return !!(record && record.paidAt && record.paidAt !== '확인 대기'); }
function gateIsInviteSeat(record) {
  if (!record) return false;
  return record.isInvite === true || record.ticket === '초대석' || record.entryType === '초대석' || record.paidAt === '초대석' || record.paidAt === '관계자';
}
function gatePaymentChipLabel(record) {
  if (gateIsInviteSeat(record)) return '초대석';
  if (record && record.isWalkIn) return record.paidAt || '현장 결제 완료';
  return gateIsPaid(record) ? '입금 확인' : '확인 대기';
}
function syncGateEnteredCount(wasEntered, isEntered) {
  if (wasEntered === isEntered || !window.GateHomeStore) return;
  window.GateHomeStore.adjustEnteredCount(isEntered ? 1 : -1);
}


function gateLogRow(record, origin) {
  var status = record.entered ? '입장 완료' : '미입장';
  var time = record.enteredAt || '—';
  return '<button type="button" class="gate-log-row" data-gate-action="detail-open" data-gate-record-id="' + record.id + '" data-gate-origin="' + (origin || 'home') + '">' +
    '<span class="gate-log-time">' + time + '</span>' +
    '<strong>' + record.nickname + '</strong>' +
    '<mark class="' + (record.entered ? 'is-paid' : 'is-waiting') + '">' + status + '</mark>' +
    '<em aria-hidden="true">›</em>' +
  '</button>';
}
function gateDetailRow(label, value) { return '<p><span>' + label + '</span><strong>' + value + '</strong></p>'; }
function gatePaymentRow(label, value) { return '<p><span>' + label + '</span>' + value + '</p>'; }
function gateEditStaticRow(label, value, key) { return '<p><span>' + label + '</span><strong' + (key ? ' data-gate-edit-' + key : '') + '>' + value + '</strong></p>'; }
function gateEditChoiceRow() {
  return '<div class="gate-edit-row gate-edit-choice-row"><span>입장 상태</span><div class="gate-choice-grid">' +
    '<button type="button" class="gate-choice-button" data-gate-choice-value="entered">입장 완료</button>' +
    '<button type="button" class="gate-choice-button" data-gate-choice-value="waiting">미입장</button>' +
  '</div></div>';
}
function gateEditTimeRow() { return '<label class="gate-edit-row gate-edit-input-row"><span>입장 시각</span><input type="time" data-gate-edit-time /></label>'; }
function gateEditSelectRow(label, key, options) {
  return '<label class="gate-edit-row gate-edit-select-row"><span>' + label + '</span><div class="gate-select-wrap"><select data-gate-edit-' + key + '>' + options.map(function (option) { return '<option>' + option + '</option>'; }).join('') + '</select><em aria-hidden="true">⌄</em></div></label>';
}
function gateEditMemoRow() { return '<label class="gate-edit-row gate-edit-memo-row"><span>메모</span><textarea rows="3" data-gate-edit-memo></textarea></label>'; }

window.LumiApps.gate = function () {
  setTimeout(bindGateApp, 0);
  return '<section class="gate-app" data-gate-app>' +
    '<article class="gate-event-card" aria-label="오늘의 공연"><div><span>오늘의 공연</span><strong>Lumibelle Debut Live</strong></div><em aria-hidden="true">›</em></article>' +
    '<header class="gate-title-block"><p>STAFF CHECK-IN</p><h2>입장 확인</h2><i aria-hidden="true"></i></header>' +
    '<article class="gate-card gate-search-card" aria-label="검색"><header class="gate-card-head gate-search-head"><div><span>✿</span><strong>검색</strong></div><button type="button" class="gate-walkin-launch" data-gate-action="walkin-direct-open"><b aria-hidden="true">＋</b>현장 입장</button></header>' +
      '<div class="gate-tab-row" role="tablist"><button type="button" class="is-active" data-gate-tab="예약번호">예약번호</button><button type="button" data-gate-tab="루미 ID">루미 ID</button><button type="button" data-gate-tab="닉네임">닉네임</button></div>' +
      '<div class="gate-search-row"><label class="gate-input-wrap"><span aria-hidden="true">⌕</span><input type="text" value="" placeholder="예약번호를 입력하세요" data-gate-input /><button type="button" class="gate-search-clear" data-gate-action="search-clear" aria-label="검색어 지우기" hidden>×</button></label><button type="button" data-gate-action="search">검색</button></div>' +
      '<p class="gate-walkin-hint">사전예약 없이 왔다면 현장 입장으로 바로 등록하세요.</p>' +
    '</article>' +
    '<article class="gate-card gate-result-card is-empty" aria-label="조회 결과" data-gate-result-card></article>' +
    '<section class="gate-log-section" aria-label="최근 입장 로그"><div class="gate-log-head"><h3>최근 입장 로그</h3><button type="button" data-gate-action="logs-open">전체 보기 ›</button></div><div class="gate-log-list" data-gate-log-list></div></section>' +
    '<p class="gate-safe-note">모든 접속은 암호화되어 안전하게 보호됩니다.</p>' +
    '<section class="gate-logs-view" data-gate-logs-view hidden><header class="gate-logs-topbar"><button type="button" class="gate-logs-home-button" data-gate-action="logs-back" aria-label="입장 확인으로 돌아가기"><span aria-hidden="true">‹</span>입장 확인</button></header><header class="gate-title-block gate-detail-title"><p>ENTRY LOG</p><h2>입장 로그</h2><i aria-hidden="true"></i></header><article class="gate-card gate-logs-card"><p class="gate-log-caption">입장 완료 처리된 기록만 표시됩니다.</p><div class="gate-log-list gate-log-list-full" data-gate-full-log-list></div></article></section>' +
    '<section class="gate-detail-view" data-gate-detail hidden>' +
      '<button type="button" class="gate-detail-back" data-gate-action="detail-back" aria-label="이전으로 돌아가기">‹</button><article class="gate-event-card gate-detail-event gate-static-event"><div><span>오늘의 공연</span><strong>Lumibelle Debut Live</strong></div></article><header class="gate-title-block gate-detail-title"><p>ENTRY LOG DETAIL</p><h2>입장 로그 상세</h2><i aria-hidden="true"></i></header>' +
      '<article class="gate-card gate-detail-main"><div class="gate-profile gate-detail-profile" aria-hidden="true"><span>♡</span></div><div class="gate-detail-info">' + gateDetailRow('닉네임', '<span data-gate-detail-name></span>') + gateDetailRow('예약번호', '<span data-gate-detail-reservation></span>') + gateDetailRow('루미 ID', '<span data-gate-detail-lumi></span>') + gateDetailRow('권종', '<span data-gate-detail-ticket></span>') + gateDetailRow('입장 상태', '<mark data-gate-detail-status></mark>') + '</div></article>' +
      '<article class="gate-detail-meta"><p><span>입장 시각</span><strong data-gate-detail-time></strong></p><p><span>확인 스탭</span><strong data-gate-detail-checker></strong></p><p><span>처리 방식</span><strong data-gate-detail-method></strong></p></article>' +
      '<article class="gate-card gate-detail-record"><header class="gate-card-head"><span>✿</span><strong>입장 상세 정보</strong></header>' + gateDetailRow('예약 일시', '<span data-gate-detail-reserved></span>') + gateDetailRow('입금 확인', '<span data-gate-detail-paid></span>') + gateDetailRow('메모', '<span data-gate-detail-memo></span>') + '</article>' +
      '<div class="gate-detail-actions"><button type="button" class="gate-secondary" data-gate-action="detail-back">목록으로</button><button type="button" class="gate-primary" data-gate-action="edit-open">기록 수정</button></div>' +
    '</section>' +
    '<section class="gate-edit-view" data-gate-edit hidden><button type="button" class="gate-detail-back" data-gate-action="edit-back" aria-label="입장 로그 상세로 돌아가기">‹</button><article class="gate-event-card gate-detail-event gate-static-event"><div><span>오늘의 공연</span><strong>Lumibelle Debut Live</strong></div></article><header class="gate-title-block gate-detail-title"><p>ENTRY LOG EDIT</p><h2>입장 로그 수정</h2><i aria-hidden="true"></i></header>' +
      '<article class="gate-card gate-edit-summary">' + gateEditStaticRow('닉네임', '-', 'name') + gateEditStaticRow('예약번호', '-', 'reservation') + gateEditStaticRow('루미 ID', '-', 'lumi') + gateEditStaticRow('권종', '-', 'ticket') + '</article>' +
      '<article class="gate-card gate-edit-form">' + gateEditChoiceRow() + gateEditStaticRow('예약 일시', '-', 'reserved') + gateEditStaticRow('입금 확인', '-', 'paid') + gateEditTimeRow() + gateEditSelectRow('확인 스탭', 'checker', ['김스탭', '박스탭', '이로스탭']) + gateEditSelectRow('처리 방식', 'method', ['예약번호 확인', '루미 ID 확인', '닉네임 확인']) + gateEditMemoRow() + '</article>' +
      '<article class="gate-edit-notice"><strong>수정 내용은 운영 기록에 저장됩니다.</strong><span>모든 변경 사항은 운영 로그 히스토리에 안전하게 기록됩니다.</span></article><div class="gate-edit-actions"><button type="button" class="gate-secondary" data-gate-action="edit-back">취소</button><button type="button" class="gate-primary" data-gate-action="edit-save">수정 저장</button></div>' +
    '</section>' +
    '<section class="gate-payment-view" data-gate-payment-view hidden>' +
      '<header class="gate-payment-page-head"><button type="button" class="gate-payment-back" data-gate-action="payment-back" aria-label="입장 확인으로 돌아가기">‹</button><div class="gate-payment-head-copy"><h2 data-gate-payment-page-title>입금 내역</h2><p data-gate-payment-page-subtitle>PAYMENT HISTORY</p></div></header>' +
      '<article class="gate-payment-card gate-payment-hero"><div class="gate-profile gate-payment-profile" aria-hidden="true"><span>♡</span></div><div class="gate-payment-summary"><p><span>닉네임</span><strong data-gate-payment-name></strong></p><p><span data-gate-payment-reference-label>예약번호</span><strong data-gate-payment-reservation></strong></p><p><span data-gate-payment-ticket-label>권종</span><strong data-gate-payment-ticket></strong></p><p><span>입장 상태</span><mark class="is-waiting" data-gate-payment-entry-status></mark></p><div class="gate-payment-status-row"><mark class="is-paid" data-gate-payment-detail-status></mark><span data-gate-payment-readonly-note>읽기 전용</span></div></div></article>' +
      '<article class="gate-payment-card gate-payment-record"><header class="gate-payment-section-head"><span>✦</span><strong data-gate-payment-record-title>입금 정보</strong></header><div class="gate-payment-record-list">' + gatePaymentRow('<span data-gate-payment-status-label>입금 상태</span>', '<strong class="gate-payment-emphasis" data-gate-payment-history-status></strong>') + gatePaymentRow('<span data-gate-payment-payer-label>입금자명</span>', '<strong data-gate-payment-payer></strong>') + gatePaymentRow('<span data-gate-payment-amount-label>입금 금액</span>', '<strong class="gate-payment-emphasis" data-gate-payment-amount></strong>') + gatePaymentRow('<span data-gate-payment-method-label>입금 수단</span>', '<strong data-gate-payment-method></strong>') + gatePaymentRow('<span data-gate-payment-reserved-label>예약 일시</span>', '<strong data-gate-payment-reserved></strong>') + gatePaymentRow('<span data-gate-payment-confirmed-label>입금 확인 일시</span>', '<strong data-gate-payment-confirmed></strong>') + gatePaymentRow('<span data-gate-payment-checker-label>확인 담당</span>', '<strong data-gate-payment-checker></strong>') + '</div></article>' +
      '<article class="gate-payment-card gate-payment-memo"><header class="gate-payment-section-head"><span>✦</span><strong data-gate-payment-memo-title>처리 메모</strong></header><p data-gate-payment-memo></p></article><article class="gate-payment-card gate-payment-note"><header class="gate-payment-section-head"><span>i</span><strong>안내</strong></header><p data-gate-payment-note>입금 내역은 읽기 전용으로 표시됩니다.</p></article><div class="gate-payment-actions"><button type="button" class="gate-secondary" data-gate-action="payment-back">닫기</button><button type="button" class="gate-primary" data-gate-action="payment-back">입장 확인으로 돌아가기</button></div>' +
    '</section>' +
    '<section class="gate-walkin-find-view" data-gate-walkin-find-view hidden>' +
      '<button type="button" class="gate-detail-back" data-gate-action="walkin-find-back" aria-label="입장 확인으로 돌아가기">‹</button>' +
      '<article class="gate-event-card gate-detail-event gate-static-event"><div><span>오늘의 공연</span><strong>Lumibelle Debut Live</strong></div></article>' +
      '<header class="gate-title-block gate-detail-title"><p>WALK-IN CHECK-IN</p><h2>현장 입장</h2><i aria-hidden="true"></i></header>' +
      '<article class="gate-card gate-walkin-find-card"><header class="gate-card-head"><span>✿</span><strong>팬 찾기</strong></header><p class="gate-walkin-find-copy">루미 ID 또는 닉네임으로 기존 팬을 조회하세요.</p><div class="gate-walkin-lookup-switch" role="tablist" aria-label="조회 방식 선택"><button type="button" class="is-active" data-gate-walkin-mode="id" role="tab" aria-selected="true">루미 ID</button><button type="button" data-gate-walkin-mode="nickname" role="tab" aria-selected="false">닉네임</button></div><div class="gate-walkin-lookup-panel" data-gate-walkin-mode-panel="id"><label class="gate-walkin-input-box"><span>LB-</span><input type="text" inputmode="numeric" maxlength="4" autocomplete="off" placeholder="네 자리" data-gate-walkin-id-input /><button type="button" class="gate-walkin-clear" data-gate-action="walkin-clear-input" data-gate-clear-target="id" aria-label="루미 ID 입력 지우기" hidden>×</button></label><p class="gate-walkin-field-guide">루미 ID 뒤 숫자 4자리를 입력하세요.</p></div><div class="gate-walkin-lookup-panel" data-gate-walkin-mode-panel="nickname" hidden><label class="gate-walkin-input-box"><input type="text" autocomplete="off" placeholder="닉네임을 입력하세요" data-gate-walkin-nickname-input /><button type="button" class="gate-walkin-clear" data-gate-action="walkin-clear-input" data-gate-clear-target="nickname" aria-label="닉네임 입력 지우기" hidden>×</button></label><p class="gate-walkin-field-guide">팬이 사용하는 닉네임을 입력하세요.</p></div><button type="button" class="gate-primary gate-walkin-find-button" data-gate-action="walkin-find-search">팬 조회</button><div class="gate-walkin-find-result" data-gate-walkin-find-result></div></article>' +
    '</section>' +
    '<section class="gate-walkin-view" data-gate-walkin-view hidden>' +
      '<button type="button" class="gate-detail-back" data-gate-action="walkin-back" aria-label="현장 입장 팬 찾기로 돌아가기">‹</button>' +
      '<article class="gate-event-card gate-detail-event gate-static-event"><div><span>오늘의 공연</span><strong>Lumibelle Debut Live</strong></div></article>' +
      '<header class="gate-title-block gate-detail-title"><p>WALK-IN CHECK-IN</p><h2>현장 입장 등록</h2><i aria-hidden="true"></i></header>' +
      '<article class="gate-card gate-walkin-summary"><div class="gate-profile" aria-hidden="true"><span>♡</span></div><div class="gate-walkin-summary-copy"><p><span>현장 번호</span><strong data-gate-walkin-number></strong></p><p><span>입장 유형</span><strong>현장 입장</strong></p><p><span>팬 정보</span><strong data-gate-walkin-fan></strong></p><p class="gate-walkin-existing-note" data-gate-walkin-note></p></div></article>' +
      '<article class="gate-card gate-walkin-form"><label class="gate-edit-row gate-edit-input-row"><span>닉네임</span><input type="text" data-gate-walkin-name placeholder="닉네임을 입력하세요" /></label><label class="gate-edit-row gate-edit-select-row"><span>결제 상태</span><div class="gate-select-wrap"><select data-gate-walkin-payment><option>현장 결제 완료</option><option>무료 입장</option><option>관계자</option></select><em aria-hidden="true">⌄</em></div></label><label class="gate-edit-row gate-edit-select-row"><span>결제 수단</span><div class="gate-select-wrap"><select data-gate-walkin-method><option>현금</option><option>계좌이체</option><option>카드</option><option>해당 없음</option></select><em aria-hidden="true">⌄</em></div></label></article>' +
      '<article class="gate-edit-notice"><strong>현장 번호는 자동으로 발급됩니다.</strong><span>등록하면 오늘 공연 방문 기록과 입장 로그에 함께 남습니다.</span></article>' +
      '<div class="gate-edit-actions"><button type="button" class="gate-secondary" data-gate-action="walkin-back">팬 찾기로</button><button type="button" class="gate-primary" data-gate-action="walkin-save">현장 입장 완료</button></div>' +
    '</section>' +
  '</section>';
};

function getGateRecord(id) { return gateRecords.find(function (record) { return record.id === id; }) || null; }
function gateRecentRecords() {
  return gateRecords.filter(function (record) { return record.entered; }).sort(function (a, b) { return (b.enteredAt || '').localeCompare(a.enteredAt || ''); }).slice(0, 3);
}
function gateRenderLogs(root) {
  var recent = root.querySelector('[data-gate-log-list]');
  if (recent) recent.innerHTML = gateRecentRecords().map(function (record) { return gateLogRow(record, 'home'); }).join('') || '<p class="gate-result-empty">아직 입장 완료 기록이 없습니다.</p>';
  renderGateFullLogs(root);
}
function renderGateFullLogs(root) {
  var target = root.querySelector('[data-gate-full-log-list]');
  if (!target) return;
  var list = gateRecords.filter(function (record) { return record.entered; }).sort(function (a, b) { return (b.enteredAt || '').localeCompare(a.enteredAt || ''); });
  target.innerHTML = list.map(function (record) { return gateLogRow(record, 'logs'); }).join('') || '<p class="gate-result-empty">아직 입장 완료 기록이 없습니다.</p>';
}
function gateFindSearchResult(root) {
  var input = root.querySelector('[data-gate-input]');
  var activeTab = root.querySelector('[data-gate-tab].is-active');
  var query = input ? input.value.trim() : '';
  if (!query) return null;
  var mode = activeTab ? activeTab.getAttribute('data-gate-tab') : '예약번호';
  if (mode === '루미 ID') query = gateNormalizeLumiId(query) || query;
  var lowered = query.toLowerCase();
  var recordMatches = gateRecords.filter(function (record) {
    var value = mode === '루미 ID' ? record.lumiId : (mode === '닉네임' ? record.nickname : record.reservation);
    return String(value || '').toLowerCase() === lowered;
  });
  if (recordMatches.length === 1) return { kind: 'record', record: recordMatches[0] };
  if (mode === '닉네임') {
    recordMatches = gateRecords.filter(function (record) { return String(record.nickname || '').toLowerCase().indexOf(lowered) !== -1; });
    if (recordMatches.length === 1) return { kind: 'record', record: recordMatches[0] };
  }
  if (mode === '예약번호') return { kind: 'reservation-missing' };
  var fanMatches = gateFanDirectory.filter(function (fan) {
    var value = mode === '루미 ID' ? fan.lumiId : fan.nickname;
    return String(value || '').toLowerCase() === lowered;
  });
  if (fanMatches.length === 1) return { kind: 'existing-fan', fan: fanMatches[0] };
  if (mode === '닉네임') {
    fanMatches = gateFanDirectory.filter(function (fan) { return String(fan.nickname || '').toLowerCase().indexOf(lowered) !== -1; });
    if (fanMatches.length === 1) return { kind: 'existing-fan', fan: fanMatches[0] };
  }
  return { kind: 'new-fan', nickname: mode === '닉네임' ? query : '', lumiId: mode === '루미 ID' ? query : '' };
}
function gateResultProfile() { return '<div class="gate-profile" aria-hidden="true"><span>♡</span></div>'; }
function gateResultEmpty(message) { return '<p class="gate-result-empty">' + message + '</p>'; }
function gateRenderResult(root, result) {
  var card = root.querySelector('[data-gate-result-card]');
  if (!card) return;
  card.removeAttribute('data-gate-record-id');
  card.removeAttribute('data-gate-walkin-kind');
  card.removeAttribute('data-gate-walkin-name');
  card.removeAttribute('data-gate-walkin-lumi');
  card.className = 'gate-card gate-result-card';
  if (!result) {
    card.classList.add('is-empty');
    card.innerHTML = gateResultEmpty('예약번호, 루미 ID 또는 닉네임으로<br>입장할 팬을 조회해주세요.');
    return;
  }
  if (result.kind === 'reservation-missing') {
    card.classList.remove('is-empty');
    card.classList.add('is-single');
    card.innerHTML = '<div class="gate-reservation-missing"><strong>사전예약 내역 없음</strong><p>번호를 다시 확인하거나 ＋ 현장 입장을 이용하세요.</p></div>';
    return;
  }
  if (result.kind === 'existing-fan') {
    var fan = result.fan;
    card.setAttribute('data-gate-walkin-kind', 'existing');
    card.setAttribute('data-gate-walkin-name', fan.nickname || '');
    card.setAttribute('data-gate-walkin-lumi', fan.lumiId || '');
    card.innerHTML = gateResultProfile() +
      '<div class="gate-info-list gate-walkin-result-info">' +
        '<p><span>닉네임</span><strong>' + (fan.nickname || '미확인') + '</strong></p>' +
        '<p><span>루미 ID</span><strong>' + (fan.lumiId || '미확인') + '</strong></p>' +
        '<p><span>오늘 예약</span><mark class="is-waiting">사전예약 없음</mark></p>' +
      '</div>' +
      '<div class="gate-walkin-result-copy"><strong>기존 팬 · 오늘 사전예약 없음</strong><p>현장 입장은 위의 ＋ 현장 입장에서 진행해주세요.</p></div>' +
      '<div class="gate-action-row gate-action-row-single"><button type="button" class="gate-primary" data-gate-action="walkin-open">현장 입장 등록</button></div>';
    return;
  }
  if (result.kind === 'new-fan') {
    card.classList.remove('is-empty');
    card.classList.add('is-single');
    var isLumiLookup = !!result.lumiId;
    card.innerHTML = '<div class="gate-reservation-missing gate-search-no-match"><strong>조회 결과 없음</strong><p>' + (isLumiLookup ? '닉네임으로 다시 찾거나 ＋ 현장 입장을 이용하세요.' : '다시 확인하거나 ＋ 현장 입장을 이용하세요.') + '</p></div>';
    return;
  }
  var record = result.record || result;
  if (!record || !record.id) { gateRenderResult(root, null); return; }
  card.setAttribute('data-gate-record-id', record.id);
  var paid = gateIsPaid(record);
  card.innerHTML = gateResultProfile() +
    '<div class="gate-info-list">' +
      '<p><span>닉네임</span><strong>' + record.nickname + '</strong></p>' +
      '<p><span>' + (record.isWalkIn ? '현장 번호' : '예약번호') + '</span><strong>' + record.reservation + '</strong></p>' +
      '<p><span>권종</span><strong>' + record.ticket + '</strong></p>' +
      '<p><span>등록 일시</span><strong>' + record.reservedAt + '</strong></p>' +
      '<p><span>결제 상태</span><mark class="' + (paid ? 'is-paid' : 'is-waiting') + '">' + gatePaymentChipLabel(record) + '</mark></p>' +
      '<p><span>입장 상태</span><mark class="' + (record.entered ? 'is-paid' : 'is-waiting') + '">' + (record.entered ? '입장 완료' : '미입장') + '</mark></p>' +
    '</div>' +
    '<div class="gate-action-row"><button type="button" class="gate-primary" data-gate-action="enter" ' + ((record.entered || !paid) ? 'disabled' : '') + '>' + (record.entered ? '입장 처리됨' : (paid ? '입장 완료' : '입금 확인 필요')) + '</button><button type="button" class="gate-secondary" data-gate-action="payment-detail-open">' + (record.isWalkIn ? '결제 기록' : '입금 내역') + '</button></div>';
}
function getCurrentRecord(root) {
  var card = root.querySelector('[data-gate-result-card]');
  return card ? getGateRecord(card.getAttribute('data-gate-record-id')) : null;
}
function setText(root, selector, text) { root.querySelectorAll(selector).forEach(function (node) { node.textContent = text || '-'; }); }
function fillGateDetail(root, record) {
  setText(root, '[data-gate-detail-name]', record.nickname); setText(root, '[data-gate-detail-reservation]', record.reservation); setText(root, '[data-gate-detail-lumi]', record.lumiId); setText(root, '[data-gate-detail-ticket]', record.ticket); setText(root, '[data-gate-detail-time]', record.enteredAt || '—'); setText(root, '[data-gate-detail-checker]', record.checker || '—'); setText(root, '[data-gate-detail-method]', record.method || '—'); setText(root, '[data-gate-detail-reserved]', record.reservedAt); setText(root, '[data-gate-detail-paid]', record.paidAt || '—'); setText(root, '[data-gate-detail-memo]', record.entryMemo || '—');
  var state = root.querySelector('[data-gate-detail-status]'); state.textContent = record.entered ? '입장 완료' : '미입장'; state.className = record.entered ? 'is-paid' : 'is-waiting';
}
function fillGateEdit(root, record) {
  setText(root, '[data-gate-edit-name]', record.nickname); setText(root, '[data-gate-edit-reservation]', record.reservation); setText(root, '[data-gate-edit-lumi]', record.lumiId); setText(root, '[data-gate-edit-ticket]', record.ticket); setText(root, '[data-gate-edit-reserved]', record.reservedAt); setText(root, '[data-gate-edit-paid]', record.paidAt || '확인 대기');
  root.querySelector('[data-gate-edit-time]').value = record.enteredAt || '';
  root.querySelector('[data-gate-edit-checker]').value = record.checker || '김스탭';
  root.querySelector('[data-gate-edit-method]').value = record.method || '예약번호 확인';
  root.querySelector('[data-gate-edit-memo]').value = record.entryMemo || '';
  root.querySelectorAll('[data-gate-choice-value]').forEach(function (button) { button.classList.toggle('is-selected', (record.entered && button.getAttribute('data-gate-choice-value') === 'entered') || (!record.entered && button.getAttribute('data-gate-choice-value') === 'waiting')); });
}
function saveGateEdit(root) {
  var record = getGateRecord(root.getAttribute('data-gate-selected-record'));
  if (!record) return false;
  var wasEntered = !!record.entered;
  var wantsEntered = !!root.querySelector('[data-gate-choice-value="entered"].is-selected');
  if (wantsEntered && !gateIsPaid(record)) {
    window.alert('입금 확인 전에는 입장 완료로 변경할 수 없습니다.');
    return false;
  }
  record.entered = wantsEntered;
  record.enteredAt = wantsEntered ? (root.querySelector('[data-gate-edit-time]').value || record.enteredAt || '') : '';
  record.checker = wantsEntered ? root.querySelector('[data-gate-edit-checker]').value : '';
  record.method = wantsEntered ? root.querySelector('[data-gate-edit-method]').value : '';
  record.entryMemo = root.querySelector('[data-gate-edit-memo]').value.trim();
  saveGateRecords();
  syncGateEnteredCount(wasEntered, record.entered);
  fillGateDetail(root, record);
  gateRenderLogs(root);
  gateRenderResult(root, getCurrentRecord(root));
  return true;
}
function gateNextWalkinNumber() {
  var count = gateRecords.filter(function (record) { return !!record.isWalkIn; }).length + 1;
  return '현장 ' + String(count).padStart(3, '0');
}
function gateNowTime() { return new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }); }
function gateNowStamp() {
  var now = new Date();
  return now.getFullYear() + '.' + String(now.getMonth() + 1).padStart(2, '0') + '.' + String(now.getDate()).padStart(2, '0') + ' ' + gateNowTime();
}
function getGateWalkinView(root) { return root.querySelector('[data-gate-walkin-view]'); }
function getGateWalkinFindView(root) { return root.querySelector('[data-gate-walkin-find-view]'); }
function gateSyncWalkinClearButtons(root) {
  var idInput = root.querySelector('[data-gate-walkin-id-input]');
  var nameInput = root.querySelector('[data-gate-walkin-nickname-input]');
  var idClear = root.querySelector('[data-gate-clear-target="id"]');
  var nameClear = root.querySelector('[data-gate-clear-target="nickname"]');
  if (idClear) idClear.hidden = !idInput || !String(idInput.value || '').trim();
  if (nameClear) nameClear.hidden = !nameInput || !String(nameInput.value || '').trim();
}
function gateWalkinFindResult(root, html) {
  var target = root.querySelector('[data-gate-walkin-find-result]');
  if (target) target.innerHTML = html || '';
}
function gateFindWalkinFan(idText, nicknameText) {
  var lumiId = gateNormalizeLumiId(idText);
  var nickname = String(nicknameText || '').trim();
  if (!lumiId && !nickname) return { kind: 'empty' };
  var byId = function (item) { return lumiId && gateFormatLumiId(item.lumiId) === lumiId; };
  var byNameExact = function (item) { return nickname && String(item.nickname || '').toLowerCase() === nickname.toLowerCase(); };
  var booking = gateRecords.find(byId) || gateRecords.find(byNameExact);
  if (booking) return { kind: 'reservation', record: booking };
  var fan = gateFanDirectory.find(byId) || gateFanDirectory.find(byNameExact);
  if (!fan && nickname) {
    var nameMatches = gateFanDirectory.filter(function (item) { return String(item.nickname || '').toLowerCase().indexOf(nickname.toLowerCase()) !== -1; });
    if (nameMatches.length === 1) fan = nameMatches[0];
  }
  return fan ? { kind: 'existing', fan: fan } : { kind: 'new', nickname: nickname };
}
function renderGateWalkinFind(root) {
  var findView = getGateWalkinFindView(root);
  if (!findView) return;
  var idInput = findView.querySelector('[data-gate-walkin-id-input]');
  var nameInput = findView.querySelector('[data-gate-walkin-nickname-input]');
  var result = gateFindWalkinFan(idInput ? idInput.value : '', nameInput ? nameInput.value : '');
  if (result.kind === 'empty') {
    gateWalkinFindResult(root, '<p class="gate-walkin-find-empty">루미 ID 뒤 4자리 또는 닉네임을 입력해주세요.</p>');
    return;
  }
  if (result.kind === 'reservation') {
    gateWalkinFindResult(root, '<div class="gate-walkin-find-message is-reservation"><strong>오늘 사전예약 내역이 있습니다.</strong><p>' + result.record.nickname + ' · ' + result.record.reservation + '</p><button type="button" class="gate-secondary" data-gate-action="walkin-to-gate" data-gate-record-id="' + result.record.id + '">입장 확인에서 처리</button></div>');
    return;
  }
  if (result.kind === 'existing') {
    gateWalkinFindResult(root, '<div class="gate-walkin-found-fan"><div class="gate-profile" aria-hidden="true"><span>♡</span></div><div><span>기존 팬</span><strong>' + result.fan.nickname + '</strong><em>' + gateFormatLumiId(result.fan.lumiId) + '</em></div></div><button type="button" class="gate-primary" data-gate-action="walkin-register-existing" data-gate-walkin-name="' + result.fan.nickname + '" data-gate-walkin-lumi="' + gateFormatLumiId(result.fan.lumiId) + '">이 팬으로 현장 입장 등록</button>');
    return;
  }
  var label = result.nickname ? '<strong>조회된 팬 정보가 없습니다.</strong><p>입력한 닉네임으로 신규 현장 입장을 등록할 수 있어요.</p>' : '<strong>조회된 팬 정보가 없습니다.</strong><p>닉네임을 확인한 뒤 신규 현장 입장으로 등록하세요.</p>';
  gateWalkinFindResult(root, '<div class="gate-walkin-find-message">' + label + '<button type="button" class="gate-primary" data-gate-action="walkin-register-new" data-gate-walkin-name="' + (result.nickname || '') + '">신규 현장 입장으로 계속</button></div>');
}
function openGateWalkinFind(root) {
  var findView = getGateWalkinFindView(root);
  if (!findView) return;
  var idInput = findView.querySelector('[data-gate-walkin-id-input]');
  var nameInput = findView.querySelector('[data-gate-walkin-nickname-input]');
  if (idInput) idInput.value = '';
  if (nameInput) nameInput.value = '';
  gateWalkinFindResult(root, '');
  gateSyncWalkinClearButtons(root);
  openView(root, 'walkin-find');
  if (idInput) idInput.focus();
}
function openGateWalkin(root, source) {
  source = source || {};
  var kind = source.kind || 'new';
  var walkinView = getGateWalkinView(root);
  if (!walkinView) return;
  var nameInput = walkinView.querySelector('[data-gate-walkin-name]');
  var name = String(source.name || '').trim();
  var lumi = gateNormalizeLumiId(source.lumi || '');
  var number = gateNextWalkinNumber();
  root.setAttribute('data-gate-walkin-kind', kind);
  root.setAttribute('data-gate-walkin-number', number);
  root.setAttribute('data-gate-walkin-nickname', name);
  root.setAttribute('data-gate-walkin-lumi', lumi);
  if (nameInput) { nameInput.value = name; nameInput.readOnly = kind === 'existing'; }
  setText(root, '[data-gate-walkin-number]', number);
  setText(root, '[data-gate-walkin-fan]', lumi ? name + ' · ' + lumi : (name || '신규 팬'));
  setText(root, '[data-gate-walkin-note]', kind === 'existing' ? '조회된 기존 팬 정보와 연결됩니다.' : '닉네임만 적으면 신규 현장 방문 기록으로 등록됩니다.');
  openView(root, 'walkin');
  if (nameInput && !name) nameInput.focus();
}
function saveGateWalkin(root) {
  var walkinView = getGateWalkinView(root);
  if (!walkinView) return false;
  var nameInput = walkinView.querySelector('[data-gate-walkin-name]');
  var payment = walkinView.querySelector('[data-gate-walkin-payment]');
  var method = walkinView.querySelector('[data-gate-walkin-method]');
  var typedNickname = nameInput && typeof nameInput.value === 'string' ? nameInput.value.trim() : '';
  var nickname = typedNickname || (root.getAttribute('data-gate-walkin-nickname') || '').trim();
  if (!nickname) { window.alert('현장 기록에 남길 닉네임을 입력해주세요.'); if (nameInput) nameInput.focus(); return false; }
  var number = root.getAttribute('data-gate-walkin-number') || gateNextWalkinNumber();
  var nowTime = gateNowTime();
  var status = payment ? payment.value : '현장 결제 완료';
  var linkedLumiId = gateNormalizeLumiId(root.getAttribute('data-gate-walkin-lumi') || '');
  var processingStamp = gateNowStamp();
  var record = {
    id: 'gate-walkin-' + Date.now(), nickname: nickname, reservation: number,
    lumiId: linkedLumiId || '현장 미연결', ticket: '현장 입장', reservedAt: processingStamp,
    paidAt: status, paymentChecker: '김스탭', payerName: '현장', paymentAmount: '-',
    paymentMethod: method ? method.value : '해당 없음', paymentProcessedAt: processingStamp, paymentMemo: '현장 입장으로 등록했습니다.',
    entered: true, enteredAt: nowTime, checker: '김스탭', method: '현장 입장 등록',
    entryMemo: status, isWalkIn: true, walkinNumber: number, entryType: '현장 입장'
  };
  gateRecords.push(record);
  saveGateRecords();
  if (window.GateHomeStore) window.GateHomeStore.adjustEnteredCount(1);
  gateRenderLogs(root);
  root.removeAttribute('data-gate-walkin-nickname');
  root.removeAttribute('data-gate-walkin-lumi');
  returnToGateHome(root);
  gateRenderResult(root, { kind: 'record', record: record });
  return true;
}
function gateViewSelector(name) {
  if (name === 'payment') return '[data-gate-payment-view]';
  if (name === 'logs') return '[data-gate-logs-view]';
  if (name === 'walkin') return '[data-gate-walkin-view]';
  if (name === 'walkin-find') return '[data-gate-walkin-find-view]';
  return '[data-gate-' + name + ']';
}
function openView(root, kind) {
  ['detail', 'edit', 'logs', 'payment', 'walkin-find', 'walkin'].forEach(function (name) {
    root.classList.remove('is-' + name + '-open');
    var node = root.querySelector(gateViewSelector(name));
    if (node) node.hidden = true;
  });
  if (!kind) return;
  var view = root.querySelector(gateViewSelector(kind));
  if (!view) return;
  root.classList.add('is-' + kind + '-open');
  view.hidden = false;
  root.scrollTop = 0;
}
function returnToGateHome(root) {
  openView(root, null);
  root.removeAttribute('data-gate-detail-origin');
  root.removeAttribute('data-gate-selected-record');
  root.scrollTop = 0;
}
function renderGatePaymentDetail(root, record) {
  var isWalkIn = !!record.isWalkIn;
  var paid = gateIsPaid(record);
  var isInvite = gateIsInviteSeat(record);
  var statusLabel = gatePaymentChipLabel(record);
  var values = {
    '[data-gate-payment-name]': record.nickname,
    '[data-gate-payment-reservation]': record.reservation,
    '[data-gate-payment-ticket]': isWalkIn ? '현장 입장' : record.ticket,
    '[data-gate-payment-payer]': record.payerName,
    '[data-gate-payment-amount]': record.paymentAmount,
    '[data-gate-payment-method]': record.paymentMethod,
    '[data-gate-payment-reserved]': record.reservedAt,
    '[data-gate-payment-confirmed]': isWalkIn ? (record.paymentProcessedAt || record.reservedAt) : (paid ? record.paidAt : '-'),
    '[data-gate-payment-checker]': paid ? record.paymentChecker : '-',
    '[data-gate-payment-memo]': record.paymentMemo
  };
  Object.keys(values).forEach(function (selector) { setText(root, selector, values[selector]); });
  setText(root, '[data-gate-payment-page-title]', isWalkIn ? '결제 기록' : '입금 내역');
  setText(root, '[data-gate-payment-page-subtitle]', isWalkIn ? 'WALK-IN PAYMENT' : 'PAYMENT HISTORY');
  setText(root, '[data-gate-payment-reference-label]', isWalkIn ? '현장 번호' : '예약번호');
  setText(root, '[data-gate-payment-ticket-label]', isWalkIn ? '입장 유형' : '권종');
  setText(root, '[data-gate-payment-record-title]', isWalkIn ? '결제 정보' : '입금 정보');
  setText(root, '[data-gate-payment-status-label]', isWalkIn ? '결제 상태' : '입금 상태');
  setText(root, '[data-gate-payment-method-label]', isWalkIn ? '결제 수단' : '입금 수단');
  setText(root, '[data-gate-payment-reserved-label]', isWalkIn ? '등록 일시' : '예약 일시');
  setText(root, '[data-gate-payment-confirmed-label]', isWalkIn ? '처리 시각' : '입금 확인 일시');
  setText(root, '[data-gate-payment-checker-label]', isWalkIn ? '처리 담당' : '확인 담당');
  setText(root, '[data-gate-payment-memo-title]', isWalkIn ? '현장 처리 메모' : '처리 메모');
  setText(root, '[data-gate-payment-readonly-note]', isWalkIn ? '현장 처리 기록' : '읽기 전용');
  setText(root, '[data-gate-payment-note]', isWalkIn ? '현장 입장 시 등록된 결제·처리 기록입니다.' : '입금 내역은 읽기 전용으로 표시됩니다.');
  var entry = root.querySelector('[data-gate-payment-entry-status]');
  entry.textContent = record.entered ? '입장 완료' : '미입장';
  entry.className = record.entered ? 'is-paid' : 'is-waiting';
  root.querySelectorAll('[data-gate-payment-detail-status], [data-gate-payment-history-status]').forEach(function (node) {
    node.textContent = isWalkIn ? statusLabel : (isInvite ? '초대석' : (paid ? '입금 확인' : '확인 대기'));
  });
  var payerRow = root.querySelector('[data-gate-payment-payer]').closest('p');
  var amountRow = root.querySelector('[data-gate-payment-amount]').closest('p');
  if (payerRow) payerRow.hidden = isWalkIn;
  if (amountRow) amountRow.hidden = isWalkIn;
}

function openGateLogs(root) {
  renderGateFullLogs(root);
  openView(root, 'logs');
}
function openGateLogRecord(root, recordId, origin) {
  var record = getGateRecord(recordId);
  if (!record) return;
  root.setAttribute('data-gate-selected-record', record.id);
  root.setAttribute('data-gate-detail-origin', origin === 'logs' ? 'logs' : 'home');
  fillGateDetail(root, record);
  openView(root, 'detail');
}
function gateSyncSearchClearButton(root) {
  var input = root.querySelector('[data-gate-input]');
  var clear = root.querySelector('.gate-search-clear');
  if (!input || !clear) return;
  clear.hidden = !String(input.value || '').trim();
}

function bindGateApp() {
  var root = document.querySelector('[data-gate-app]');
  if (!root || root.getAttribute('data-gate-bound') === 'true') return;
  root.setAttribute('data-gate-bound', 'true');
  gateRenderResult(root, null);
  gateRenderLogs(root);
  gateSyncSearchClearButton(root);
  var input = root.querySelector('[data-gate-input]');
  input.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') { event.preventDefault(); gateRenderResult(root, gateFindSearchResult(root)); }
  });
  root.addEventListener('input', function (event) {
    if (event.target.closest('[data-gate-input]')) gateSyncSearchClearButton(root);
    var walkinName = event.target.closest('[data-gate-walkin-name]');
    if (walkinName && root.contains(walkinName)) root.setAttribute('data-gate-walkin-nickname', walkinName.value || '');
    var walkinId = event.target.closest('[data-gate-walkin-id-input]');
    if (walkinId && root.contains(walkinId)) walkinId.value = String(walkinId.value || '').replace(/\D/g, '').slice(0, 4);
    if (event.target.closest('[data-gate-walkin-id-input], [data-gate-walkin-nickname-input]')) gateSyncWalkinClearButtons(root);
  });
  root.addEventListener('keydown', function (event) {
    if (event.key !== 'Enter') return;
    if (event.target.closest('[data-gate-walkin-id-input], [data-gate-walkin-nickname-input]')) {
      event.preventDefault();
      renderGateWalkinFind(root);
    }
  });
  root.addEventListener('click', function (event) {
    var tab = event.target.closest('[data-gate-tab]');
    if (tab) {
      root.querySelectorAll('[data-gate-tab]').forEach(function (button) { button.classList.toggle('is-active', button === tab); });
      input.value = '';
      input.setAttribute('value', '');
      input.placeholder = tab.getAttribute('data-gate-tab') === '루미 ID' ? 'LB- 뒤 4자리를 입력하세요' : tab.getAttribute('data-gate-tab') + '를 입력하세요';
      gateRenderResult(root, null);
      gateSyncSearchClearButton(root);
      input.focus();
      return;
    }
    var walkinMode = event.target.closest('[data-gate-walkin-mode]');
    if (walkinMode && root.contains(walkinMode)) {
      var selectedMode = walkinMode.getAttribute('data-gate-walkin-mode');
      root.querySelectorAll('[data-gate-walkin-mode]').forEach(function (button) {
        var active = button === walkinMode;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      root.querySelectorAll('[data-gate-walkin-mode-panel]').forEach(function (panel) {
        panel.hidden = panel.getAttribute('data-gate-walkin-mode-panel') !== selectedMode;
      });
      var resultBox = root.querySelector('[data-gate-walkin-find-result]');
      if (resultBox) resultBox.innerHTML = '';
      var activeInput = selectedMode === 'id' ? root.querySelector('[data-gate-walkin-id-input]') : root.querySelector('[data-gate-walkin-nickname-input]');
      gateSyncWalkinClearButtons(root);
      if (activeInput) activeInput.focus();
      return;
    }
    var choice = event.target.closest('[data-gate-choice-value]');
    if (choice) { root.querySelectorAll('[data-gate-choice-value]').forEach(function (button) { button.classList.toggle('is-selected', button === choice); }); return; }
    var action = event.target.closest('[data-gate-action]');
    if (!action || !root.contains(action)) return;
    var type = action.getAttribute('data-gate-action');
    if (type === 'search') { gateRenderResult(root, gateFindSearchResult(root)); return; }
    if (type === 'search-clear') {
      input.value = '';
      gateRenderResult(root, null);
      gateSyncSearchClearButton(root);
      input.focus();
      return;
    }
    if (type === 'logs-open') { openGateLogs(root); return; }
    if (type === 'logs-back') { returnToGateHome(root); return; }
    if (type === 'detail-open') { openGateLogRecord(root, action.getAttribute('data-gate-record-id'), action.getAttribute('data-gate-origin')); return; }
    if (type === 'detail-back') {
      if (root.getAttribute('data-gate-detail-origin') === 'logs') openGateLogs(root);
      else returnToGateHome(root);
      return;
    }
    if (type === 'edit-open') {
      var selected = getGateRecord(root.getAttribute('data-gate-selected-record'));
      if (!selected) return;
      fillGateEdit(root, selected);
      openView(root, 'edit');
      return;
    }
    if (type === 'edit-back') { openView(root, 'detail'); return; }
    if (type === 'edit-save') { if (saveGateEdit(root)) openView(root, 'detail'); return; }
    if (type === 'walkin-open' || type === 'walkin-direct-open') { openGateWalkinFind(root); return; }
    if (type === 'walkin-clear-input') {
      var clearTarget = action.getAttribute('data-gate-clear-target');
      var clearInput = root.querySelector(clearTarget === 'id' ? '[data-gate-walkin-id-input]' : '[data-gate-walkin-nickname-input]');
      if (clearInput) { clearInput.value = ''; clearInput.focus(); }
      gateWalkinFindResult(root, '');
      gateSyncWalkinClearButtons(root);
      return;
    }
    if (type === 'walkin-find-search') { renderGateWalkinFind(root); return; }
    if (type === 'walkin-find-back') { returnToGateHome(root); return; }
    if (type === 'walkin-register-existing') { openGateWalkin(root, { kind: 'existing', name: action.getAttribute('data-gate-walkin-name') || '', lumi: action.getAttribute('data-gate-walkin-lumi') || '' }); return; }
    if (type === 'walkin-register-new') { openGateWalkin(root, { kind: 'new', name: action.getAttribute('data-gate-walkin-name') || '', lumi: '' }); return; }
    if (type === 'walkin-to-gate') {
      var linked = getGateRecord(action.getAttribute('data-gate-record-id'));
      if (!linked) return;
      var matchingTab = root.querySelector('[data-gate-tab="루미 ID"]');
      if (matchingTab) matchingTab.click();
      input.value = linked.lumiId;
      returnToGateHome(root);
      gateRenderResult(root, { kind: 'record', record: linked });
      return;
    }
    if (type === 'walkin-back') { openView(root, 'walkin-find'); return; }
    if (type === 'walkin-save') { saveGateWalkin(root); return; }
    if (type === 'payment-detail-open') {
      var current = getCurrentRecord(root);
      if (!current) return;
      renderGatePaymentDetail(root, current);
      openView(root, 'payment');
      return;
    }
    if (type === 'payment-back') { returnToGateHome(root); return; }
    if (type === 'enter') {
      var currentRecord = getCurrentRecord(root);
      if (!currentRecord || currentRecord.entered) return;
      if (!gateIsPaid(currentRecord)) { window.alert('입금 확인 후 입장 완료 처리할 수 있습니다.'); return; }
      var wasEntered = !!currentRecord.entered;
      currentRecord.entered = true;
      currentRecord.enteredAt = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
      currentRecord.checker = '김스탭';
      currentRecord.method = '예약번호 확인';
      currentRecord.entryMemo = '정상 입장 처리';
      saveGateRecords();
      syncGateEnteredCount(wasEntered, true);
      gateRenderResult(root, currentRecord);
      gateRenderLogs(root);
    }
  });
}

