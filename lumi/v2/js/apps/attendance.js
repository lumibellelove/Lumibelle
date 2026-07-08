/**
 * attendance.js — 출퇴근 / 스탭 출석 앱
 * 역할: renderer === "native" 인 attendance, staffAttendance 앱 렌더링
 */

window.LumiApps = window.LumiApps || {};

/* 홈 출석 요약용 오늘 출근 인원. 배치 명단은 총괄 운영 앱 연결 후 별도로 합산한다. */
window.StaffAttendanceStore = window.StaffAttendanceStore || (function () {
  var STORAGE_KEY = 'lumibelle_staff_checked_in_count_v1';
  var FALLBACK_COUNT = 12;
  var memoryCount = null;

  function getCheckedInCount() {
    if (memoryCount !== null) return memoryCount;
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw !== null && raw !== '') {
        memoryCount = Math.max(0, Number(raw) || 0);
        return memoryCount;
      }
    } catch (error) {}
    memoryCount = FALLBACK_COUNT;
    return memoryCount;
  }

  function markCheckedInOnce() {
    var next = getCheckedInCount() + 1;
    memoryCount = next;
    try { window.localStorage.setItem(STORAGE_KEY, String(next)); } catch (error) {}
    try { window.dispatchEvent(new CustomEvent('lumibelle:attendancechange')); } catch (error) {}
    return next;
  }

  return { getCheckedInCount: getCheckedInCount, markCheckedInOnce: markCheckedInOnce };
}());

var ATTENDANCE_HISTORY = [
  { date: "07.12", day: "SAT", checkin: "14:02:18", checkout: "22:01:43", status: "정상" },
  { date: "07.11", day: "FRI", checkin: "14:02:11", checkout: "22:01:09", status: "정상" },
  { date: "07.10", day: "THU", checkin: "14:01:06", checkout: "21:58:31", status: "정상" },
  { date: "07.09", day: "WED", checkin: "14:00:04", checkout: "22:00:28", status: "정상" },
  { date: "07.08", day: "TUE", checkin: "14:03:14", checkout: "22:02:33", status: "정정" },
  { date: "07.07", day: "MON", checkin: "14:01:55", checkout: "21:59:16", status: "정상" },
  { date: "07.06", day: "SUN", checkin: "13:59:48", checkout: "21:58:27", status: "정상" },
  { date: "07.05", day: "SAT", checkin: "14:02:10", checkout: "22:00:22", status: "정상" }
];

window.LumiApps.attendance = function (app, ctx) {
  return renderAttendance(ctx);
};

window.LumiApps.staffAttendance = function (app, ctx) {
  return renderAttendance(ctx);
};

(function bindAttendanceActions() {
  if (window.__lumiAttendanceBound) return;
  window.__lumiAttendanceBound = true;

  startAttendanceClockTicker();

  document.addEventListener("click", function (event) {
    var button = event.target.closest("[data-attendance-action]");
    if (!button) return;

    var action = button.getAttribute("data-attendance-action");
    var root = button.closest(".attendance-app");
    if (!root) return;

    if (action === "checkin") {
      updateAttendanceCheckin(root);
      return;
    }

    if (action === "checkout") {
      updateAttendanceCheckout(root);
      return;
    }

    if (action === "refresh") {
      refreshAttendanceInfo(root);
      return;
    }

    if (action === "open-history") {
      toggleAttendanceHistory(root, true);
      return;
    }

    if (action === "close-history") {
      toggleAttendanceHistory(root, false);
      return;
    }

    if (action === "prev-history-month") {
      moveAttendanceHistoryMonth(root, -1);
      return;
    }

    if (action === "next-history-month") {
      moveAttendanceHistoryMonth(root, 1);
      return;
    }

    if (action === "set-history-filter") {
      setAttendanceHistoryFilter(root, button.getAttribute("data-attendance-filter"));
      return;
    }

    if (action === "open-detail") {
      openAttendanceDetail(root, button.getAttribute("data-attendance-index"));
      return;
    }

    if (action === "close-detail") {
      closeAttendanceDetail(root);
      return;
    }

    if (action === "request-correction") {
      openAttendanceCorrectionModal(root);
      return;
    }

    if (action === "close-correction-modal") {
      closeAttendanceCorrectionModal(root);
      return;
    }

    if (action === "submit-correction") {
      submitAttendanceCorrectionRequest(root);
      return;
    }

    if (action === "edit-name") {
      openNameModal(root);
      return;
    }

    if (action === "close-name-modal") {
      closeNameModal(root);
      return;
    }

    if (action === "save-name") {
      saveStaffName(root);
      return;
    }
  });
}());

function renderAttendance(ctx) {
  var esc = ctx.escHtml;
  var currentTime = getAttendanceTime(false);
  var todayDate = getAttendanceDate();

  return (
    '<section class="attendance-app attendance-experiment" data-attendance-state="ready" data-attendance-view="main">' +
      '<div class="attendance-main-view" data-attendance-view-panel="main">' +
        '<header class="attendance-hero-bar">' +
          '<div class="attendance-mini-brand">' +
            '<span>Lumibelle</span>' +
            '<b>STAFF OS</b>' +
          '</div>' +
          '<div class="attendance-hero-title">' +
            '<span aria-hidden="true">⌒ ♥ ⌒</span>' +
            '<h2>출퇴근</h2>' +
            '<p>STAFF ATTENDANCE</p>' +
          '</div>' +
          '<button type="button" class="attendance-heart-btn" data-attendance-action="edit-name" aria-label="스탭 이름 수정">♡</button>' +
        '</header>' +

        '<article class="attendance-summary-card" aria-label="스탭 요약">' +
          '<div class="attendance-summary-list">' +
            '<p><i>♡</i><b>스탭명</b><strong data-attendance-value="staffName">마리링</strong></p>' +
            '<p><i>▣</i><b>역할</b><strong>STAFF</strong></p>' +
            '<p><i>⚑</i><b>오늘 공연</b><strong>Shine Me Up : 루미벨 데뷔 라이브</strong></p>' +
          '</div>' +
          '<div class="attendance-summary-state">' +
            '<span>상태</span>' +
            '<strong data-attendance-status>출근 전</strong>' +
          '</div>' +
        '</article>' +

        '<article class="attendance-clock-card" aria-label="현재 시각">' +
          '<span aria-hidden="true">◷</span>' +
          '<strong data-attendance-current-time>' + esc(currentTime) + '</strong>' +
          '<p data-attendance-current-date>' + esc(todayDate) + '</p>' +
        '</article>' +

        '<article class="attendance-action-card" aria-label="출퇴근 체크">' +
          '<div class="attendance-action-row">' +
            '<button type="button" class="attendance-punch-btn is-checkin" data-attendance-action="checkin">' +
              '<span>▣</span><strong>출근하기</strong>' +
            '</button>' +
            '<button type="button" class="attendance-punch-btn is-checkout" data-attendance-action="checkout" disabled>' +
              '<span>↪</span><strong>퇴근하기</strong>' +
            '</button>' +
          '</div>' +
          '<p data-attendance-note>계정 정보는 자동으로 불러와집니다.</p>' +
        '</article>' +

        '<article class="attendance-work-card" aria-label="오늘 근무 정보">' +
          '<header>' +
            '<strong>오늘 근무 정보</strong>' +
            '<button type="button" data-attendance-action="refresh">↻ 새로고침</button>' +
          '</header>' +
          '<div class="attendance-work-grid">' +
            '<p><span>출근 예정</span><strong>14:00</strong></p>' +
            '<p><span>퇴근 예정</span><strong>22:00</strong></p>' +
            '<p><span>근무 장소</span><strong>상상마당 라이브홀</strong></p>' +
            '<p><span>담당</span><strong>접수 / 입장</strong></p>' +
          '</div>' +
        '</article>' +

        '<article class="attendance-record-card" aria-label="오늘 기록">' +
          '<header><strong>오늘 기록</strong></header>' +
          '<div class="attendance-record-grid">' +
            '<section><span>출근 시각</span><strong data-attendance-checkin-time>—</strong></section>' +
            '<section><span>퇴근 시각</span><strong data-attendance-checkout-time>—</strong></section>' +
            '<section><span>총 근무시간</span><strong data-attendance-total-time>—</strong></section>' +
          '</div>' +
        '</article>' +

        '<article class="attendance-history-card" aria-label="최근 출퇴근 기록">' +
          '<header><strong>최근 출퇴근 기록</strong><button type="button" data-attendance-action="open-history">전체 보기 ›</button></header>' +
          '<div class="attendance-history-list">' + renderAttendancePreviewList() + '</div>' +
        '</article>' +
      '</div>' +

      '<div class="attendance-history-view" data-attendance-view-panel="history" hidden>' +
        renderAttendanceHistoryScreen() +
      '</div>' +

      '<div class="attendance-detail-view" data-attendance-view-panel="detail" hidden>' +
      '</div>' +

      '<section class="attendance-correction-modal" aria-hidden="true" data-attendance-correction-modal>' +
        '<div class="attendance-modal-card attendance-correction-card" role="dialog" aria-modal="true" aria-label="정정 요청">' +
          '<header>' +
            '<strong>정정 요청</strong>' +
            '<button type="button" data-attendance-action="close-correction-modal" aria-label="닫기">×</button>' +
          '</header>' +
          '<p class="attendance-correction-lead"><b data-correction-date>07.12 SAT</b> 기록을 정정 요청합니다.</p>' +
          '<div class="attendance-correction-current">' +
            '<span>현재 기록</span>' +
            '<strong data-correction-current>출근 14:02 / 퇴근 22:01</strong>' +
          '</div>' +
          '<div class="attendance-correction-time-row">' +
            '<label><span>출근</span><input type="time" data-correction-checkin value="14:02" /></label>' +
            '<label><span>퇴근</span><input type="time" data-correction-checkout value="22:01" /></label>' +
          '</div>' +
          '<label>' +
            '<span>정정 사유</span>' +
            '<select data-correction-reason>' +
              '<option value="">사유를 선택해 주세요</option>' +
              '<option>출근 체크를 늦게 눌렀어요</option>' +
              '<option>퇴근 체크를 늦게 눌렀어요</option>' +
              '<option>잘못 눌렀어요</option>' +
              '<option>관리자 확인 필요</option>' +
              '<option>기타</option>' +
            '</select>' +
          '</label>' +
          '<label>' +
            '<span>메모</span>' +
            '<textarea rows="3" placeholder="예: 출근 체크를 늦게 눌렀습니다." data-correction-memo></textarea>' +
          '</label>' +
          '<div class="attendance-modal-actions">' +
            '<button type="button" data-attendance-action="close-correction-modal">취소</button>' +
            '<button type="button" data-attendance-action="submit-correction">요청 보내기</button>' +
          '</div>' +
        '</div>' +
      '</section>' +

      '<section class="attendance-name-modal" aria-hidden="true" data-attendance-modal>' +
        '<div class="attendance-modal-card" role="dialog" aria-modal="true" aria-label="스탭 이름 수정">' +
          '<header>' +
            '<strong>스탭 이름 수정</strong>' +
            '<button type="button" data-attendance-action="close-name-modal" aria-label="닫기">×</button>' +
          '</header>' +
          '<label>' +
            '<span>스탭 이름</span>' +
            '<input type="text" value="' + esc('마리링') + '" data-attendance-name-input />' +
          '</label>' +
          '<div class="attendance-modal-actions">' +
            '<button type="button" data-attendance-action="close-name-modal">취소</button>' +
            '<button type="button" data-attendance-action="save-name">저장</button>' +
          '</div>' +
        '</div>' +
      '</section>' +
    '</section>'
  );
}

function renderAttendancePreviewList() {
  return ATTENDANCE_HISTORY.slice(0, 2).map(function (item) {
    return (
      '<p>' +
        '<b>' + item.date + '<br><small>' + item.day + '</small></b>' +
        '<span>' + item.checkin.slice(0, 5) + ' ~ ' + item.checkout.slice(0, 5) + '</span>' +
        '<em>' + calculateAttendanceTotal(item.checkin, item.checkout) + '</em>' +
      '</p>'
    );
  }).join('');
}

function renderAttendanceHistoryScreen(year, month, filter) {
  var viewState = normalizeAttendanceHistoryView(year, month, filter);
  var summary = getAttendanceMonthlySummary(viewState.year, viewState.month);
  var monthLabel = formatAttendanceYearMonth(viewState.year, viewState.month);
  return (
    '<section class="attendance-history-shell" aria-label="최근 출퇴근 기록 전체">' +
      '<header class="attendance-history-screen-header">' +
      '<button type="button" class="attendance-history-back-btn" data-attendance-action="close-history" aria-label="뒤로가기">←</button>' +
      '<div class="attendance-history-screen-title">' +
        '<span aria-hidden="true">⌒ ✦ ⌒</span>' +
        '<h3>최근 출퇴근 기록</h3>' +
        '<p>ATTENDANCE HISTORY</p>' +
      '</div>' +
      '<button type="button" class="attendance-heart-btn" data-attendance-action="edit-name" aria-label="스탭 이름 수정">♡</button>' +
    '</header>' +

    '<section class="attendance-history-panel" aria-label="최근 출퇴근 기록 본문">' +
      '<article class="attendance-month-summary-card">' +
        '<header><strong>' + monthLabel + ' 출퇴근 요약</strong></header>' +
        '<div class="attendance-month-summary-grid">' +
          '<section><span>총 출근일</span><strong>' + summary.days + '회</strong></section>' +
          '<section><span>총 근무 시간</span><strong>' + summary.totalText + '</strong></section>' +
          '<section><span>평균 근무 시간</span><strong>' + summary.averageText + '</strong></section>' +
        '</div>' +
      '</article>' +

      '<section class="attendance-history-list-frame" aria-label="최근 출퇴근 기록 목록">' +
        '<article class="attendance-history-filter-card">' +
          '<div class="attendance-month-switch">' +
            '<button type="button" data-attendance-action="prev-history-month" aria-label="이전 달">‹</button>' +
            '<strong data-attendance-history-month-label>' + monthLabel + '</strong>' +
            '<button type="button" data-attendance-action="next-history-month" aria-label="다음 달">›</button>' +
          '</div>' +
          '<div class="attendance-filter-chip-row" role="tablist" aria-label="출퇴근 기록 필터">' +
            renderAttendanceHistoryFilterButton('all', '전체', viewState.filter) +
            renderAttendanceHistoryFilterButton('normal', '정상', viewState.filter) +
            renderAttendanceHistoryFilterButton('corrected', '정정', viewState.filter) +
          '</div>' +
        '</article>' +
        '<article class="attendance-history-detail-card">' +
          '<div class="attendance-history-detail-list">' + renderAttendanceDetailList(viewState.year, viewState.month, viewState.filter) + '</div>' +
        '</article>' +
      '</section>' +
    '</section>' +
  '</section>'
  );
}

function renderAttendanceHistoryFilterButton(value, label, activeFilter) {
  var active = value === activeFilter;
  return '<button type="button" role="tab" aria-selected="' + (active ? 'true' : 'false') + '" class="' + (active ? 'is-active' : '') + '" data-attendance-action="set-history-filter" data-attendance-filter="' + value + '">' + label + '</button>';
}

function renderAttendanceDetailList(year, month, filter) {
  var list = getAttendanceHistoryItems(year, month, filter);
  if (!list.length) {
    return (
      '<article class="attendance-history-empty">' +
        '<strong>기록이 없습니다</strong>' +
        '<span>선택한 월과 필터에 해당하는 출퇴근 기록이 없어요.</span>' +
      '</article>'
    );
  }

  return list.map(function (entry) {
    var item = entry.item;
    var total = calculateAttendanceTotal(item.checkin, item.checkout);
    var statusClass = item.status === '정상' ? 'is-normal' : 'is-edited';
    return (
      '<article class="attendance-history-row" role="button" tabindex="0" data-attendance-action="open-detail" data-attendance-index="' + entry.index + '">' +
        '<div class="attendance-history-row-date">' +
          '<b>' + item.date + '</b>' +
          '<small>' + item.day + '</small>' +
        '</div>' +
        '<div class="attendance-history-row-copy">' +
          '<p><span>출근</span><strong>' + item.checkin.slice(0, 5) + '</strong><em>~</em><span>퇴근</span><strong>' + item.checkout.slice(0, 5) + '</strong></p>' +
          '<p><span>총</span><strong>' + total + '</strong></p>' +
        '</div>' +
        '<div class="attendance-history-row-side">' +
          '<mark class="' + statusClass + '">' + item.status + '</mark>' +
          '<i>›</i>' +
        '</div>' +
      '</article>'
    );
  }).join('');
}

function renderAttendanceRecordDetailScreen(item) {
  var total = calculateAttendanceTotal(item.checkin, item.checkout);
  var statusClass = item.status === '정정' ? 'is-edited' : 'is-normal';
  var statusText = item.status === '정정' ? '정정 기록' : '정상 기록';

  return (
    '<section class="attendance-history-shell attendance-detail-shell" aria-label="출퇴근 기록 상세">' +
      '<header class="attendance-history-screen-header attendance-detail-screen-header">' +
        '<button type="button" class="attendance-history-back-btn" data-attendance-action="close-detail" aria-label="목록으로">←</button>' +
        '<div class="attendance-history-screen-title">' +
          '<span aria-hidden="true">⌒ ✦ ⌒</span>' +
          '<h3>출퇴근 기록 상세</h3>' +
          '<p>ATTENDANCE DETAIL</p>' +
        '</div>' +
        '<button type="button" class="attendance-heart-btn" data-attendance-action="edit-name" aria-label="스탭 이름 수정">♡</button>' +
      '</header>' +

      '<section class="attendance-detail-panel" aria-label="출퇴근 기록 상세 본문">' +
        '<article class="attendance-detail-hero-card">' +
          '<div class="attendance-detail-date-box">' +
            '<b>' + item.date + '</b>' +
            '<small>' + item.day + '</small>' +
          '</div>' +
          '<div class="attendance-detail-time-item">' +
            '<span>출근</span>' +
            '<strong>' + item.checkin.slice(0, 5) + '</strong>' +
          '</div>' +
          '<div class="attendance-detail-time-item">' +
            '<span>퇴근</span>' +
            '<strong>' + item.checkout.slice(0, 5) + '</strong>' +
          '</div>' +
          '<div class="attendance-detail-time-item is-total">' +
            '<span>총 근무시간</span>' +
            '<strong>' + total + '</strong>' +
          '</div>' +
          '<mark class="attendance-detail-status ' + statusClass + '">' + item.status + '</mark>' +
        '</article>' +

        '<article class="attendance-detail-info-card">' +
          '<header><strong>근무 상세 정보</strong></header>' +
          '<div class="attendance-detail-info-list">' +
            '<p><i>▣</i><span>공연명</span><b>Shine Me UP : 루미벨 데뷔 라이브</b></p>' +
            '<p><i>▣</i><span>근무 날짜</span><b>2026.' + item.date.replace('.', '.') + ' (' + item.day + ')</b></p>' +
            '<p><i>⌖</i><span>근무 장소</span><b>상상마당 라이브홀</b></p>' +
            '<p><i>♡</i><span>스탭명</span><b>마리링</b></p>' +
            '<p><i>▣</i><span>스탭 코드</span><b>GATE-D01</b></p>' +
            '<p><i>●</i><span>스탭 유형</span><b>일일 스탭</b></p>' +
            '<p><i>⚑</i><span>담당 역할</span><b>접수 / 입장</b></p>' +
            '<p><i>✓</i><span>근무 상태</span><b class="' + statusClass + '">' + statusText + '</b></p>' +
          '</div>' +
        '</article>' +

        '<article class="attendance-detail-time-card">' +
          '<header><strong>출퇴근 시간 기록</strong></header>' +
          '<div class="attendance-detail-time-grid">' +
            '<section><span>출근 시각</span><strong>' + item.checkin.slice(0, 5) + '</strong></section>' +
            '<section><span>퇴근 시각</span><strong>' + item.checkout.slice(0, 5) + '</strong></section>' +
            '<section><span>총 근무시간</span><strong>' + total + '</strong></section>' +
          '</div>' +
        '</article>' +

        '<article class="attendance-detail-note-card" data-attendance-detail-note>' +
          '<i>i</i>' +
          '<p><strong>이 기록은 자동 저장된 출퇴근 이력입니다.</strong><span>공연명, 날짜, 장소 정보를 함께 확인할 수 있습니다.</span></p>' +
        '</article>' +

        '<div class="attendance-detail-actions">' +
          '<button type="button" data-attendance-action="close-detail">목록으로</button>' +
          '<button type="button" data-attendance-action="request-correction">정정 요청</button>' +
        '</div>' +
      '</section>' +
    '</section>'
  );
}

function getAttendanceMonthlySummary(year, month) {
  var monthItems = getAttendanceHistoryItems(year, month, 'all');
  var totalMinutes = monthItems.reduce(function (sum, entry) {
    return sum + getAttendanceDurationMinutes(entry.item.checkin, entry.item.checkout);
  }, 0);
  var days = monthItems.length;
  var average = days ? Math.round(totalMinutes / days) : 0;

  return {
    days: days,
    totalText: formatMinutesAsKorean(totalMinutes),
    averageText: formatMinutesAsKorean(average)
  };
}

function getAttendanceHistoryItems(year, month, filter) {
  var viewState = normalizeAttendanceHistoryView(year, month, filter);
  return ATTENDANCE_HISTORY.map(function (item, index) {
    return { item: item, index: index };
  }).filter(function (entry) {
    var item = entry.item;
    if (getAttendanceItemYear(item) !== viewState.year) return false;
    if (getAttendanceItemMonth(item) !== viewState.month) return false;
    if (viewState.filter === 'normal') return item.status === '정상';
    if (viewState.filter === 'corrected') return item.status !== '정상';
    return true;
  });
}

function getAttendanceDefaultHistoryView() {
  var first = ATTENDANCE_HISTORY[0] || { date: '07.01' };
  return {
    year: getAttendanceItemYear(first),
    month: getAttendanceItemMonth(first),
    filter: 'all'
  };
}

function normalizeAttendanceHistoryView(year, month, filter) {
  var defaults = getAttendanceDefaultHistoryView();
  var viewYear = Number(year || defaults.year);
  var viewMonth = Number(month || defaults.month);
  var viewFilter = filter || defaults.filter;

  if (!viewYear || viewYear < 2000) viewYear = defaults.year;
  if (!viewMonth || viewMonth < 1 || viewMonth > 12) viewMonth = defaults.month;
  if (['all', 'normal', 'corrected'].indexOf(viewFilter) === -1) viewFilter = 'all';

  return {
    year: viewYear,
    month: viewMonth,
    filter: viewFilter
  };
}

function getAttendanceHistoryView(root) {
  return normalizeAttendanceHistoryView(
    root.getAttribute('data-attendance-history-year'),
    root.getAttribute('data-attendance-history-month'),
    root.getAttribute('data-attendance-history-filter')
  );
}

function setAttendanceHistoryView(root, year, month, filter) {
  var viewState = normalizeAttendanceHistoryView(year, month, filter);
  root.setAttribute('data-attendance-history-year', String(viewState.year));
  root.setAttribute('data-attendance-history-month', String(viewState.month));
  root.setAttribute('data-attendance-history-filter', viewState.filter);
  return viewState;
}

function getAttendanceItemYear(item) {
  return Number(item.year || 2026);
}

function getAttendanceItemMonth(item) {
  if (item.month) return Number(item.month);
  return Number(String(item.date || '01.01').split('.')[0]);
}

function formatAttendanceYearMonth(year, month) {
  return year + '년 ' + Number(month) + '월';
}

function moveAttendanceHistoryMonth(root, direction) {
  var viewState = getAttendanceHistoryView(root);
  var nextMonth = viewState.month + direction;
  var nextYear = viewState.year;

  if (nextMonth < 1) {
    nextMonth = 12;
    nextYear -= 1;
  }

  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear += 1;
  }

  setAttendanceHistoryView(root, nextYear, nextMonth, viewState.filter);
  refreshAttendanceHistoryView(root);
}

function setAttendanceHistoryFilter(root, filter) {
  var viewState = getAttendanceHistoryView(root);
  setAttendanceHistoryView(root, viewState.year, viewState.month, filter);
  refreshAttendanceHistoryView(root);
}

function refreshAttendanceHistoryView(root) {
  var historyPanel = root.querySelector('[data-attendance-view-panel="history"]');
  if (!historyPanel) return;
  var viewState = getAttendanceHistoryView(root);
  historyPanel.innerHTML = renderAttendanceHistoryScreen(viewState.year, viewState.month, viewState.filter);
}

function toggleAttendanceHistory(root, showHistory) {
  var mainPanel = root.querySelector('[data-attendance-view-panel="main"]');
  var historyPanel = root.querySelector('[data-attendance-view-panel="history"]');
  var detailPanel = root.querySelector('[data-attendance-view-panel="detail"]');

  if (showHistory && historyPanel) {
    var viewState = getAttendanceHistoryView(root);
    setAttendanceHistoryView(root, viewState.year, viewState.month, viewState.filter);
    historyPanel.innerHTML = renderAttendanceHistoryScreen(viewState.year, viewState.month, viewState.filter);
  }

  root.setAttribute('data-attendance-view', showHistory ? 'history' : 'main');
  if (mainPanel) mainPanel.hidden = !!showHistory;
  if (historyPanel) historyPanel.hidden = !showHistory;
  if (detailPanel) detailPanel.hidden = true;

  var scroller = root.closest('[data-role="app-body"]');
  if (scroller) scroller.scrollTop = 0;
}

function openAttendanceDetail(root, indexValue) {
  var index = Number(indexValue || 0);
  var item = ATTENDANCE_HISTORY[index] || ATTENDANCE_HISTORY[0];
  var mainPanel = root.querySelector('[data-attendance-view-panel="main"]');
  var historyPanel = root.querySelector('[data-attendance-view-panel="history"]');
  var detailPanel = root.querySelector('[data-attendance-view-panel="detail"]');

  if (!detailPanel || !item) return;
  root.setAttribute('data-attendance-detail-index', String(index));
  detailPanel.innerHTML = renderAttendanceRecordDetailScreen(item);
  root.setAttribute('data-attendance-view', 'detail');
  if (mainPanel) mainPanel.hidden = true;
  if (historyPanel) historyPanel.hidden = true;
  detailPanel.hidden = false;

  var scroller = root.closest('[data-role="app-body"]');
  if (scroller) scroller.scrollTop = 0;
}

function closeAttendanceDetail(root) {
  var mainPanel = root.querySelector('[data-attendance-view-panel="main"]');
  var historyPanel = root.querySelector('[data-attendance-view-panel="history"]');
  var detailPanel = root.querySelector('[data-attendance-view-panel="detail"]');

  root.setAttribute('data-attendance-view', 'history');
  if (mainPanel) mainPanel.hidden = true;
  if (historyPanel) historyPanel.hidden = false;
  if (detailPanel) detailPanel.hidden = true;

  var scroller = root.closest('[data-role="app-body"]');
  if (scroller) scroller.scrollTop = 0;
}

function openAttendanceCorrectionModal(root) {
  var modal = root.querySelector('[data-attendance-correction-modal]');
  if (!modal) return;

  var index = Number(root.getAttribute('data-attendance-detail-index') || 0);
  var item = ATTENDANCE_HISTORY[index] || ATTENDANCE_HISTORY[0];
  if (item) {
    var checkin = item.checkin.slice(0, 5);
    var checkout = item.checkout.slice(0, 5);
    var dateText = modal.querySelector('[data-correction-date]');
    var currentText = modal.querySelector('[data-correction-current]');
    var checkinInput = modal.querySelector('[data-correction-checkin]');
    var checkoutInput = modal.querySelector('[data-correction-checkout]');
    var reasonInput = modal.querySelector('[data-correction-reason]');
    var memoInput = modal.querySelector('[data-correction-memo]');

    if (dateText) dateText.textContent = item.date + ' ' + item.day;
    if (currentText) currentText.textContent = '출근 ' + checkin + ' / 퇴근 ' + checkout;
    if (checkinInput) checkinInput.value = checkin;
    if (checkoutInput) checkoutInput.value = checkout;
    if (reasonInput) reasonInput.value = '';
    if (memoInput) memoInput.value = '';
  }

  modal.setAttribute('aria-hidden', 'false');
  root.classList.add('is-modal-open');
}

function closeAttendanceCorrectionModal(root) {
  var modal = root.querySelector('[data-attendance-correction-modal]');
  if (!modal) return;
  modal.setAttribute('aria-hidden', 'true');
  root.classList.remove('is-modal-open');
}

function submitAttendanceCorrectionRequest(root) {
  var note = root.querySelector('[data-attendance-detail-note]');
  if (note) {
    note.classList.add('is-requested');
    var text = note.querySelector('p');
    if (text) text.innerHTML = '<strong>정정 요청이 접수된 상태입니다.</strong><span>관리자 확인 후 정정 기록으로 반영됩니다.</span>';
  }
  closeAttendanceCorrectionModal(root);
}

function refreshAttendanceInfo(root) {
  updateCurrentClock(root);
  var note = root.querySelector('[data-attendance-note]');
  if (note) note.textContent = '근무 정보를 새로고침했어요. 마지막 확인 ' + getAttendanceTime(false);
  root.classList.add('is-refreshed');
  window.setTimeout(function () { root.classList.remove('is-refreshed'); }, 420);
}

function openNameModal(root) {
  var modal = root.querySelector('[data-attendance-modal]');
  var input = root.querySelector('[data-attendance-name-input]');
  var nameValue = root.querySelector('[data-attendance-value="staffName"]');
  if (!modal) return;
  if (input && nameValue) input.value = nameValue.textContent.trim();
  modal.setAttribute('aria-hidden', 'false');
  root.classList.add('is-modal-open');
  if (input) input.focus();
}

function closeNameModal(root) {
  var modal = root.querySelector('[data-attendance-modal]');
  if (!modal) return;
  modal.setAttribute('aria-hidden', 'true');
  root.classList.remove('is-modal-open');
}

function saveStaffName(root) {
  var input = root.querySelector('[data-attendance-name-input]');
  if (!input) return;
  var nextName = input.value.trim() || '마리링';
  var nameValue = root.querySelector('[data-attendance-value="staffName"]');
  var note = root.querySelector('[data-attendance-note]');
  if (nameValue) nameValue.textContent = nextName;
  if (note) note.textContent = '스탭 이름을 수정했어요.';
  closeNameModal(root);
}

function updateAttendanceCheckin(root) {
  var state = root.getAttribute('data-attendance-state') || 'ready';
  if (state !== 'ready') return;

  var time = getAttendanceTime(true);
  root.setAttribute('data-attendance-state', 'checked');
  root.setAttribute('data-attendance-checkin', time);

  var checkinTime = root.querySelector('[data-attendance-checkin-time]');
  var status = root.querySelector('[data-attendance-status]');
  var note = root.querySelector('[data-attendance-note]');
  var checkinButton = root.querySelector('[data-attendance-action="checkin"]');
  var checkoutButton = root.querySelector('[data-attendance-action="checkout"]');

  if (checkinTime) checkinTime.textContent = time;
  if (status) status.textContent = '출근 완료';
  if (note) note.textContent = '출근 체크가 완료되었어요. 퇴근 시 퇴근하기를 눌러주세요.';
  if (checkinButton) checkinButton.disabled = true;
  if (checkoutButton) checkoutButton.disabled = false;
  if (root.getAttribute('data-attendance-summary-counted') !== 'true') {
    root.setAttribute('data-attendance-summary-counted', 'true');
    if (window.StaffAttendanceStore) window.StaffAttendanceStore.markCheckedInOnce();
  }
  updateCurrentClock(root);
}

function updateAttendanceCheckout(root) {
  var state = root.getAttribute('data-attendance-state') || 'ready';
  if (state !== 'checked') return;

  var time = getAttendanceTime(true);
  root.setAttribute('data-attendance-state', 'done');
  root.setAttribute('data-attendance-checkout', time);

  var checkoutTime = root.querySelector('[data-attendance-checkout-time]');
  var totalTime = root.querySelector('[data-attendance-total-time]');
  var status = root.querySelector('[data-attendance-status]');
  var note = root.querySelector('[data-attendance-note]');
  var checkoutButton = root.querySelector('[data-attendance-action="checkout"]');

  if (checkoutTime) checkoutTime.textContent = time;
  if (totalTime) totalTime.textContent = calculateAttendanceTotal(root.getAttribute('data-attendance-checkin'), time);
  if (status) status.textContent = '퇴근 완료';
  if (note) note.textContent = '퇴근 체크가 완료되었어요. 오늘 근무 기록이 저장되었습니다.';
  if (checkoutButton) checkoutButton.disabled = true;
  updateCurrentClock(root);
}

function updateCurrentClock(root) {
  var time = root.querySelector('[data-attendance-current-time]');
  var date = root.querySelector('[data-attendance-current-date]');
  if (time) time.textContent = getAttendanceTime(false);
  if (date) date.textContent = getAttendanceDate();
}

function startAttendanceClockTicker() {
  if (window.__lumiAttendanceClockTimer) return;

  window.__lumiAttendanceClockTimer = window.setInterval(function () {
    var roots = document.querySelectorAll('.attendance-app');
    roots.forEach(function (root) {
      updateCurrentClock(root);
    });
  }, 1000);
}

function getAttendanceTime(showSeconds) {
  var now = new Date();
  var hh = String(now.getHours()).padStart(2, '0');
  var mm = String(now.getMinutes()).padStart(2, '0');
  var ss = String(now.getSeconds()).padStart(2, '0');
  return showSeconds ? hh + ':' + mm + ':' + ss : hh + ':' + mm;
}

function getAttendanceDate() {
  var now = new Date();
  var yyyy = now.getFullYear();
  var mm = String(now.getMonth() + 1).padStart(2, '0');
  var dd = String(now.getDate()).padStart(2, '0');
  var days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  return yyyy + '.' + mm + '.' + dd + '  ' + days[now.getDay()];
}

function getAttendanceDurationMinutes(start, end) {
  if (!start || !end) return 0;
  var s = start.split(':');
  var e = end.split(':');
  if (s.length < 2 || e.length < 2) return 0;

  var startSeconds = (Number(s[0]) * 3600) + (Number(s[1]) * 60) + Number(s[2] || 0);
  var endSeconds = (Number(e[0]) * 3600) + (Number(e[1]) * 60) + Number(e[2] || 0);
  if (endSeconds < startSeconds) endSeconds += 24 * 3600;

  return Math.max(0, Math.floor((endSeconds - startSeconds) / 60));
}

function formatMinutesAsKorean(totalMinutes) {
  var hours = Math.floor(totalMinutes / 60);
  var minutes = totalMinutes % 60;
  return String(hours).padStart(2, '0') + '시간 ' + String(minutes).padStart(2, '0') + '분';
}

function calculateAttendanceTotal(start, end) {
  if (!start || !end) return '—';
  return formatMinutesAsKorean(getAttendanceDurationMinutes(start, end));
}
