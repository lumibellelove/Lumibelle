/**
 * point-adjust.js — Staff OS 포인트 기록 / 정정
 * - 원본 포인트 기록은 수정하지 않고 정정 기록을 별도 추가한다.
 * - 팬 조회/물판 포인트에서 전달된 팬을 기준으로 연다.
 */
window.LumiApps = window.LumiApps || {};

(function () {
  var state = {
    fanId: "",
    fanName: "",
    initialBalance: 0,
    caution: false,
    memo: false,
    eventId: "",
    eventTitle: "",
    filter: "all",
    expanded: false,
    view: "list",
    selectedEntryId: "",
    adjustType: "earn",
    adjustPoints: 1,
    reason: "입력 실수",
    memoText: "",
    notice: "",
    openApp: null
  };

  var FILTERS = { all: "전체", earn: "적립", redeem: "사용", adjust: "정정" };

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function currentStaff() {
    var raw = window.LumiCurrentStaff || {};
    return {
      name: raw.name || "유리 스탭",
      type: raw.type || "regular",
      id: raw.id || "staff-demo"
    };
  }

  function formatDate(value) {
    var date = new Date(value);
    if (isNaN(date.getTime())) return "기록 없음";
    var yyyy = date.getFullYear();
    var mm = String(date.getMonth() + 1).padStart(2, "0");
    var dd = String(date.getDate()).padStart(2, "0");
    var hh = String(date.getHours()).padStart(2, "0");
    var min = String(date.getMinutes()).padStart(2, "0");
    return yyyy + "." + mm + "." + dd + " " + hh + ":" + min;
  }

  function recordKind(entry) {
    var type = String((entry && entry.type) || "").toLowerCase();
    if (type === "adjust") return "adjust";
    if (type === "redeem") return "redeem";
    return "earn";
  }

  function typeName(entry) {
    var kind = recordKind(entry);
    return kind === "adjust" ? "정정" : (kind === "redeem" ? "사용" : "적립");
  }

  function typeClass(entry) { return recordKind(entry); }

  function amountText(amount) {
    var num = Number(amount || 0);
    return (num > 0 ? "+" : "−") + Math.abs(num) + "P";
  }

  function seedHistory() {
    return [
      { id: "seed_ticket", createdAt: "2026-07-12T14:22:00+09:00", type: "earn", label: "특전권 30장 구매", detail: "특전권 30장 · 현금", delta: 2, balanceBefore: 1282, balanceAfter: 1284, staffName: "유리 스탭", staffType: "regular", eventId: "EVT-20260712", eventTitle: "Shine Me UP : 루미벨 데뷔 라이브", ticketCount: 30 },
      { id: "seed_redeem", createdAt: "2026-07-12T15:10:00+09:00", type: "redeem", label: "레귤 교환", detail: "샤메권 · 교류 30초", delta: -2, balanceBefore: 1286, balanceAfter: 1284, staffName: "유리 스탭", staffType: "regular", eventId: "EVT-20260712", eventTitle: "Shine Me UP : 루미벨 데뷔 라이브", rewardCost: 2 },
      { id: "seed_meate", createdAt: "2026-07-12T16:05:00+09:00", type: "earn", label: "이벤트 추가 적립", detail: "현장 이벤트 적립", delta: 3, balanceBefore: 1282, balanceAfter: 1285, staffName: "유리 스탭", staffType: "regular", eventId: "EVT-20260712", eventTitle: "Shine Me UP : 루미벨 데뷔 라이브" },
      { id: "seed_adjust", createdAt: "2026-07-12T16:20:00+09:00", type: "adjust", label: "중복 적립 정정", detail: "중복 적립", delta: -1, balanceBefore: 1285, balanceAfter: 1284, staffName: "유리 스탭", staffType: "regular", eventId: "EVT-20260712", eventTitle: "Shine Me UP : 루미벨 데뷔 라이브", sourceEntryId: "seed_meate", adjustmentReason: "중복 적립" }
    ];
  }

  function transferFromWindow() {
    var transfer = window.LumiPointAdjustTransfer || {};
    if (!transfer || !transfer.fanId) {
      try {
        var saved = (window.sessionStorage && window.sessionStorage.getItem("lumibelle_point_adjust_transfer_v1")) ||
          (window.localStorage && window.localStorage.getItem("lumibelle_point_adjust_transfer_v1"));
        transfer = saved ? JSON.parse(saved) : transfer;
      } catch (error) {}
    }

    state.fanId = transfer.fanId || state.fanId || "LB-0720";
    state.fanName = transfer.fanName || state.fanName || "딸기우유♡";
    state.initialBalance = Number(transfer.currentPoint != null ? transfer.currentPoint : (state.initialBalance || 1284));
    state.caution = transfer.caution != null ? Boolean(transfer.caution) : state.caution;
    state.memo = transfer.memo != null ? Boolean(transfer.memo) : state.memo;
    state.eventId = transfer.eventId || (window.LumiCurrentEvent && window.LumiCurrentEvent.eventId) || "";
    state.eventTitle = transfer.eventTitle || (window.LumiCurrentEvent && window.LumiCurrentEvent.eventTitle) || "";

    // 화면 재렌더링 시에도 같은 팬의 이름·ID가 반드시 남도록 현재 전달값을 다시 보관한다.
    window.LumiPointAdjustTransfer = {
      source: transfer.source || "pointAdjust",
      fanId: state.fanId,
      fanName: state.fanName,
      currentPoint: state.initialBalance,
      caution: state.caution,
      memo: state.memo,
      eventId: state.eventId,
      eventTitle: state.eventTitle
    };
  }

  function ensureFan() {
    if (!window.PointStore || typeof window.PointStore.ensureFan !== "function") return null;
    return window.PointStore.ensureFan(state.fanId, state.fanName, state.initialBalance, state.fanId === "LB-0720" ? seedHistory() : []);
  }

  function getFan() {
    var ensured = ensureFan();
    return ensured && ensured.ok ? ensured.fan : { name: state.fanName, balance: state.initialBalance, history: [] };
  }

  function entriesForFan(fan) {
    var entries = Array.isArray(fan.history) ? fan.history.slice() : [];
    return entries.sort(function (a, b) { return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); });
  }

  function filteredEntries(fan) {
    return entriesForFan(fan).filter(function (entry) {
      if (state.filter === "all") return true;
      return recordKind(entry) === state.filter;
    });
  }

  function renderFilter() {
    return '<div class="point-adjust-filter" role="tablist">' + Object.keys(FILTERS).map(function (key) {
      return '<button type="button" class="' + (state.filter === key ? "is-active" : "") + '" data-pa-filter="' + key + '">' + FILTERS[key] + '</button>';
    }).join("") + '</div>';
  }

  function renderFanCard(fan) {
    var displayName = (fan && fan.name) || state.fanName || "팬 정보 없음";
    var displayId = state.fanId || "—";
    var displayBalance = Number((fan && fan.balance != null) ? fan.balance : state.initialBalance || 0);
    return '<article class="point-adjust-fan-card point-adjust-list-fan-card">' +
      '<div class="point-adjust-list-portrait" aria-hidden="true"></div>' +
      '<div class="point-adjust-list-fan-main">' +
        '<div><span>팬 닉네임</span><strong class="is-name">' + esc(displayName) + '</strong></div>' +
        '<div><span>루미 ID</span><strong>' + esc(displayId) + '</strong></div>' +
        '<div><span>현재 포인트</span><strong class="is-point">' + displayBalance.toLocaleString() + ' P</strong></div>' +
        '<div><span>최근 정정</span><strong>' + esc(latestAdjustmentText(fan || { history: [] })) + '</strong></div>' +
      '</div>' +
      '<div class="point-adjust-list-flags">' +
        '<em class="' + (state.caution ? "is-on" : "") + '">주의 체크 ' + (state.caution ? "있음" : "없음") + '</em>' +
        '<em class="' + (state.memo ? "is-on" : "") + '">메모록 ' + (state.memo ? "있음" : "없음") + '</em>' +
      '</div>' +
    '</article>';
  }

  function latestAdjustmentText(fan) {
    var entry = entriesForFan(fan).find(function (item) { return recordKind(item) === "adjust"; });
    return entry ? formatDate(entry.createdAt) : "없음";
  }

  function renderDetailHero(fan, title) {
    var displayName = (fan && fan.name) || state.fanName || "팬 정보 없음";
    var displayId = state.fanId || "—";
    var displayBalance = Number((fan && fan.balance != null) ? fan.balance : state.initialBalance || 0);

    return '<header class="point-adjust-detail-top">' +
      '<div class="point-adjust-detail-bar">' +
        '<button type="button" class="point-adjust-back-ornate" data-pa-back aria-label="기록으로 돌아가기">‹</button>' +
        '<h2>' + esc(title || '포인트 기록 정정') + '</h2>' +
      '</div>' +
      '<div class="point-adjust-ribbon-divider" aria-hidden="true"><span>🎀</span></div>' +
    '</header>' +
    '<article class="point-adjust-detail-fan-card">' +
      '<div class="point-adjust-detail-portrait" aria-hidden="true"></div>' +
      '<div class="point-adjust-detail-main">' +
        '<div><span class="point-adjust-detail-label">팬 닉네임</span><span class="point-adjust-detail-value is-name">' + esc(displayName) + '</span></div>' +
        '<div><span class="point-adjust-detail-label">루미 ID</span><span class="point-adjust-detail-value">' + esc(displayId) + '</span></div>' +
        '<div><span class="point-adjust-detail-label">현재 포인트</span><span class="point-adjust-detail-value is-point">' + displayBalance.toLocaleString() + ' P</span></div>' +
        '<div><span class="point-adjust-detail-label">최근 정정</span><span class="point-adjust-detail-value">' + esc(latestAdjustmentText(fan || { history: [] })) + '</span></div>' +
      '</div>' +
      '<div class="point-adjust-detail-flags">' +
        '<em class="' + (state.caution ? 'is-on' : '') + '">주의 체크 ' + (state.caution ? '있음' : '없음') + '</em>' +
        '<em class="' + (state.memo ? 'is-on' : '') + '">메모록 ' + (state.memo ? '있음' : '없음') + '</em>' +
      '</div>' +
    '</article>';
  }

  function renderEntry(entry) {
    return '<article class="point-adjust-entry">' +
      '<div class="point-adjust-entry-meta"><span>' + formatDate(entry.createdAt) + '</span><em class="is-' + typeClass(entry) + '">' + typeName(entry) + '</em></div>' +
      '<div class="point-adjust-entry-main"><div><strong>' + esc(entry.label || "포인트 기록") + '</strong><span>담당 ' + esc(entry.staffName || "담당 스탭") + ' · ' + esc(entry.eventTitle || "연결 공연 없음") + '</span></div><b class="is-' + (Number(entry.delta || 0) >= 0 ? "plus" : "minus") + '">' + amountText(entry.delta) + '</b></div>' +
      '<div class="point-adjust-entry-bottom"><span>처리 후 <b>' + Number(entry.balanceAfter || 0).toLocaleString() + 'P</b></span><div><button type="button" data-pa-detail="' + esc(entry.id) + '">상세 보기</button><button type="button" data-pa-adjust="' + esc(entry.id) + '">정정</button></div></div>' +
    '</article>';
  }

  function renderList() {
    var fan = getFan();
    var entries = filteredEntries(fan);
    var visible = state.expanded ? entries : entries.slice(0, 4);
    return '<section class="point-adjust-app" data-point-adjust-app>' +
      '<header class="point-adjust-title"><span>기록 확인 및 정정 관리</span><h2>포인트 기록 / 정정</h2></header>' +
      renderFanCard(fan) +
      renderFilter() +
      '<h3 class="point-adjust-heading">기록 리스트</h3>' +
      '<section class="point-adjust-list">' + (visible.length ? visible.map(renderEntry).join("") : '<p class="point-adjust-empty">조건에 맞는 포인트 기록이 없습니다.</p>') + '</section>' +
      (entries.length > 4 ? '<button type="button" class="point-adjust-more" data-pa-more><span class="point-adjust-more-ribbon" aria-hidden="true">🎀</span><span class="point-adjust-more-label">' + (state.expanded ? '최근 기록만 보기' : '전체 기록 더보기') + '</span><span class="point-adjust-more-arrow" aria-hidden="true">' + (state.expanded ? '⌃' : '›') + '</span></button>' : '') +
      (state.notice ? '<p class="point-adjust-notice">' + esc(state.notice) + '</p>' : '') +
    '</section>';
  }

  function selectedEntry(fan) {
    return entriesForFan(fan).find(function (entry) { return entry.id === state.selectedEntryId; }) || null;
  }

  function renderRecordCompact(entry) {
    return '<article class="point-adjust-source-card">' +
      '<div><span>처리 일시</span><strong>' + formatDate(entry.createdAt) + '</strong></div>' +
      '<div><span>원본 사유</span><strong>' + esc(entry.label) + '</strong></div>' +
      '<div><span>상태</span><em class="is-' + typeClass(entry) + '">' + typeName(entry) + ' 기록</em></div>' +
      '<div><span>처리자</span><strong>' + esc(entry.staffName || "담당 스탭") + '</strong></div>' +
      '<div><span>연결 공연</span><strong>' + esc(entry.eventTitle || "연결 공연 없음") + '</strong></div>' +
      '<div><span>원본 변동</span><b class="is-' + (Number(entry.delta || 0) >= 0 ? "plus" : "minus") + '">' + amountText(entry.delta) + '</b></div>' +
    '</article>';
  }

  function formatKindLabel(entry) {
    var kind = recordKind(entry);
    return kind === "earn" ? "적립" : (kind === "redeem" ? "사용" : "정정");
  }

  function adjustmentEntriesFor(entry, fan) {
    var all = entriesForFan(fan);
    if (recordKind(entry) === "adjust") {
      return [entry];
    }
    return all.filter(function (item) {
      return recordKind(item) === "adjust" && item.sourceEntryId === entry.id;
    });
  }

  function renderRecordInfo(entry) {
    var before = entry.balanceBefore != null ? Number(entry.balanceBefore) : Number(entry.balanceAfter || 0) - Number(entry.delta || 0);
    var kind = formatKindLabel(entry);
    return '<section class="point-adjust-record-card">' +
      '<div class="point-adjust-record-card-head"><h3>기록 상세</h3><em class="is-' + typeClass(entry) + '">' + kind + ' 기록</em></div>' +
      '<div class="point-adjust-record-grid">' +
        '<div><span>처리 일시</span><strong>' + formatDate(entry.createdAt) + '</strong></div>' +
        '<div><span>구분</span><strong class="is-' + typeClass(entry) + '">' + kind + '</strong></div>' +
        '<div><span>원본 사유</span><strong>' + esc(entry.label || '포인트 기록') + '</strong></div>' +
        '<div><span>처리 포인트</span><strong class="is-' + (Number(entry.delta || 0) >= 0 ? 'plus' : 'minus') + '">' + amountText(entry.delta) + '</strong></div>' +
        '<div><span>처리 후 포인트</span><strong class="is-point">' + Number(entry.balanceAfter || 0).toLocaleString() + 'P</strong></div>' +
        '<div><span>담당자</span><strong>' + esc(entry.staffName || '담당 스탭') + '</strong></div>' +
        '<div><span>연결 공연</span><strong>' + esc(entry.eventTitle || '연결 공연 없음') + '</strong></div>' +
        '<div><span>비고</span><strong>' + esc(entry.detail || entry.adjustmentReason || '별도 비고 없음') + '</strong></div>' +
      '</div>' +
    '</section>';
  }

  function renderPointFlow(entry) {
    var before = entry.balanceBefore != null ? Number(entry.balanceBefore) : Number(entry.balanceAfter || 0) - Number(entry.delta || 0);
    return '<section class="point-adjust-flow">' +
      '<h3 class="point-adjust-section-title">포인트 흐름</h3>' +
      '<div class="point-adjust-flow-card">' +
        '<div><span>기존 보유</span><strong>' + before.toLocaleString() + 'P</strong></div>' +
        '<b aria-hidden="true">›</b>' +
        '<div><span>이번 기록</span><strong class="is-' + (Number(entry.delta || 0) >= 0 ? 'plus' : 'minus') + '">' + amountText(entry.delta) + '</strong></div>' +
        '<b aria-hidden="true">›</b>' +
        '<div><span>처리 후</span><strong>' + Number(entry.balanceAfter || 0).toLocaleString() + 'P</strong></div>' +
      '</div>' +
    '</section>';
  }

  function renderAdjustmentHistory(entry, fan) {
    var adjustments = adjustmentEntriesFor(entry, fan);
    var content = adjustments.length ? adjustments.map(function (item) {
      return '<li><span>' + formatDate(item.createdAt) + '</span><strong>' + esc(item.label || '정정 기록') + '</strong><b class="is-' + (Number(item.delta || 0) >= 0 ? 'plus' : 'minus') + '">' + amountText(item.delta) + '</b></li>';
    }).join('') : '<p class="point-adjust-history-empty"><strong>정정 이력 없음</strong><span>이 기록은 아직 정정되지 않았어요.</span></p>';

    return '<section class="point-adjust-history">' +
      '<h3 class="point-adjust-section-title">정정 이력</h3>' +
      '<div class="point-adjust-history-card">' + content + '</div>' +
    '</section>';
  }

  function renderRecordView() {
    var fan = getFan();
    var entry = selectedEntry(fan);
    if (!entry) { state.view = "list"; return renderList(); }
    return '<section class="point-adjust-app point-adjust-record-view" data-point-adjust-app>' +
      renderDetailHero(fan, '포인트 기록 상세') +
      renderRecordInfo(entry) +
      renderPointFlow(entry) +
      '<section class="point-adjust-record-memo">' +
        '<h3 class="point-adjust-section-title">관련 메모</h3>' +
        '<div>' + esc(entry.detail || entry.adjustmentReason || '별도 메모가 없습니다.') + '</div>' +
      '</section>' +
      renderAdjustmentHistory(entry, fan) +
      '<aside class="point-adjust-record-guide"><ul><li>이 화면은 기록 확인 전용이에요.</li><li>원본 기록은 삭제되지 않고 보존됩니다.</li></ul></aside>' +
      '<div class="point-adjust-record-actions"><button type="button" data-pa-back>닫기</button></div>' +
    '</section>';
  }

  function renderAdjustDetail() {
    var fan = getFan();
    var entry = selectedEntry(fan);
    if (!entry) { state.view = "list"; return renderList(); }
    var delta = state.adjustType === "earn" ? state.adjustPoints : -state.adjustPoints;
    var expected = Number(fan.balance || 0) + delta;
    return '<section class="point-adjust-app point-adjust-detail" data-point-adjust-app>' +
      renderDetailHero(fan, "포인트 기록 정정") +
      '<h3 class="point-adjust-section-title">정정 대상 기록</h3>' + renderRecordCompact(entry) +
      '<h3 class="point-adjust-section-title">정정 내용</h3>' +
      '<section class="point-adjust-form">' +
        '<div class="point-adjust-field point-adjust-type-field"><span>정정 유형</span><div class="point-adjust-toggle"><button type="button" class="' + (state.adjustType === "earn" ? "is-active" : "") + '" data-pa-type="earn">적립 정정</button><button type="button" class="' + (state.adjustType === "redeem" ? "is-active" : "") + '" data-pa-type="redeem">차감 정정</button></div></div>' +
        '<div class="point-adjust-field point-adjust-step"><span>정정 포인트</span><div class="point-adjust-step-controls"><button type="button" data-pa-step="-1">−</button><strong>' + state.adjustPoints + 'P</strong><button type="button" data-pa-step="1">＋</button></div></div>' +
        '<div class="point-adjust-reasons"><span>정정 사유</span><div>' + ["입력 실수", "중복 적립", "중복 차감", "환불", "기타"].map(function (reason) { return '<button type="button" class="' + (state.reason === reason ? "is-active" : "") + '" data-pa-reason="' + reason + '">' + reason + '</button>'; }).join("") + '</div></div>' +
        '<label class="point-adjust-memo"><span>정정 사유 메모</span><textarea data-pa-memo placeholder="정정 사유를 자세히 입력해주세요.">' + esc(state.memoText) + '</textarea></label>' +
      '</section>' +
      '<h3 class="point-adjust-section-title">적용 후 예상</h3>' +
      '<section class="point-adjust-preview"><p><span>기존 보유 포인트</span><b>' + Number(fan.balance || 0).toLocaleString() + 'P</b></p><p><span>정정 반영</span><b class="is-' + (delta > 0 ? "plus" : "minus") + '">' + amountText(delta) + '</b></p><p><span>정정 후 포인트</span><strong>' + expected.toLocaleString() + ' P</strong></p></section>' +
      '<aside class="point-adjust-guide"><ul><li>정정 내용은 별도 기록으로 남아요.</li><li>완료 후에는 관리자 권한 없이 되돌릴 수 없어요.</li></ul></aside>' +
      '<div class="point-adjust-actions"><button type="button" data-pa-back>취소</button><button type="button" data-pa-submit ' + (expected < 0 ? 'disabled' : '') + '>정정 완료</button></div>' +
    '</section>';
  }

  function render() { if (state.view === "detail") return renderAdjustDetail(); if (state.view === "record") return renderRecordView(); return renderList(); }

  function rerender(root) {
    /*
     * 앱 본문 전체만 다시 그린다.
     * 기존에는 .point-adjust-app 자기 자신 안에 다시 .point-adjust-app을 넣어서
     * 필터를 누를 때마다 화면이 중첩되고 클릭 리스너도 누적됐다.
     */
    var appBody = (root && root.closest && root.closest('[data-role="app-body"]')) ||
      document.querySelector('[data-role="app-body"]');
    if (!appBody) return;
    appBody.innerHTML = render();
    bind(appBody.querySelector('[data-point-adjust-app]'));
  }

  function openDetail(id) {
    state.selectedEntryId = id;
    state.view = "detail";
    state.adjustType = "earn";
    state.adjustPoints = 1;
    state.reason = "입력 실수";
    state.memoText = "";
    state.notice = "";
  }

  function openRecord(id) {
    state.selectedEntryId = id;
    state.view = "record";
    state.notice = "";
  }

  function applyAdjustment(root) {
    var fan = getFan();
    var source = selectedEntry(fan);
    if (!source || !window.PointStore || typeof window.PointStore.applyTransaction !== "function") return;
    var delta = state.adjustType === "earn" ? state.adjustPoints : -state.adjustPoints;
    var staff = currentStaff();
    var result = window.PointStore.applyTransaction(state.fanId, {
      type: "adjust",
      label: state.reason + " 정정",
      detail: state.memoText || state.reason,
      delta: delta,
      sourceEntryId: source.id,
      adjustmentReason: state.reason,
      staffName: staff.name,
      staffType: staff.type,
      staffId: staff.id,
      eventId: source.eventId || state.eventId,
      eventTitle: source.eventTitle || state.eventTitle
    });
    if (!result || !result.ok) {
      state.notice = result && result.message ? result.message : "정정 저장에 실패했습니다.";
      state.view = "list";
      rerender(root);
      return;
    }
    state.notice = "정정 기록이 저장되었습니다.";
    state.view = "list";
    state.expanded = true;
    rerender(root);
  }

  function bind(root) {
    if (!root || root.dataset.bound === "true") return;
    root.dataset.bound = "true";
    root.addEventListener("input", function (event) {
      var memo = event.target.closest("[data-pa-memo]");
      if (memo) state.memoText = memo.value;
    });
    root.addEventListener("click", function (event) {
      var filter = event.target.closest("[data-pa-filter]");
      if (filter) { state.filter = filter.getAttribute("data-pa-filter"); state.expanded = false; rerender(root); return; }
      if (event.target.closest("[data-pa-more]")) { state.expanded = !state.expanded; rerender(root); return; }
      var detail = event.target.closest("[data-pa-detail]");
      if (detail) { openRecord(detail.getAttribute("data-pa-detail")); rerender(root); return; }
      var adjust = event.target.closest("[data-pa-adjust]");
      if (adjust) { openDetail(adjust.getAttribute("data-pa-adjust")); rerender(root); return; }
      if (event.target.closest("[data-pa-back]")) { state.view = "list"; rerender(root); return; }
      var type = event.target.closest("[data-pa-type]");
      if (type) { state.adjustType = type.getAttribute("data-pa-type"); rerender(root); return; }
      var step = event.target.closest("[data-pa-step]");
      if (step) { state.adjustPoints = Math.max(1, Math.min(999, state.adjustPoints + Number(step.getAttribute("data-pa-step")))); rerender(root); return; }
      var reason = event.target.closest("[data-pa-reason]");
      if (reason) { state.reason = reason.getAttribute("data-pa-reason"); rerender(root); return; }
      if (event.target.closest("[data-pa-submit]")) { applyAdjustment(root); }
    });
  }

  window.LumiApps.pointAdjust = function (app, ctx) {
    state.openApp = ctx && ctx.openApp;
    transferFromWindow();
    setTimeout(function () { bind(document.querySelector("[data-point-adjust-app]")); }, 0);
    return render();
  };
})();
