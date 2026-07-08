(function () {
  "use strict";

  window.LumiApps = window.LumiApps || {};

  var ATTENDANCE_DATA = {
    title: "루미 출석",
    subtitle: "하루 한 번 반짝 출석하고 보상을 받아요",
    current: getToday(),
    streak: 5,
    monthAttendance: 12,
    totalAttendance: 84,
    bestStreak: 18,
    rewardPoint: 10,
    checkedDays: [1, 2, 3, 6, 7, 8, 10, 15],
    rewards: [
      { label: "3일 연속 리워드", value: "+5P" },
      { label: "7일 연속 리워드", value: "+10P" },
      { label: "15일 달성 리워드", value: "+20P" }
    ]
  };

  var WEEK_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

  window.LumiApps.attendance = function () {
    return '<section class="attendance-app" data-attendance-app></section>';
  };

  window.LumiApps.bindAttendance = function (root) {
    var app = root.querySelector('[data-attendance-app]');
    if (!app || app.__lumiAttendanceBound) return;

    app.__lumiAttendanceBound = true;
    app.__lumiAttendanceState = createState();
    renderAttendance(app);

    app.addEventListener('click', function (event) {
      var openButton = event.target.closest('[data-att-open]');
      if (openButton && window.LumiPhone && typeof window.LumiPhone.openApp === 'function') {
        window.LumiPhone.openApp(openButton.getAttribute('data-att-open'));
        return;
      }

      var monthButton = event.target.closest('[data-att-month]');
      if (monthButton) {
        shiftMonth(app, monthButton.getAttribute('data-att-month') === 'prev' ? -1 : 1);
        return;
      }

      var checkButton = event.target.closest('[data-att-check]');
      if (checkButton) handleCheckIn(app);
    });
  };

  function createState() {
    return {
      viewYear: ATTENDANCE_DATA.current.year,
      viewMonth: ATTENDANCE_DATA.current.month,
      checkedDays: ATTENDANCE_DATA.checkedDays.slice(),
      streak: ATTENDANCE_DATA.streak,
      monthAttendance: ATTENDANCE_DATA.monthAttendance,
      totalAttendance: ATTENDANCE_DATA.totalAttendance,
      bestStreak: ATTENDANCE_DATA.bestStreak,
      rewardPoint: ATTENDANCE_DATA.rewardPoint,
      todayChecked: false,
      currentDay: ATTENDANCE_DATA.current.day
    };
  }

  function handleCheckIn(app) {
    var state = app.__lumiAttendanceState;
    if (!state || state.todayChecked) return;

    state.viewYear = ATTENDANCE_DATA.current.year;
    state.viewMonth = ATTENDANCE_DATA.current.month;
    if (state.checkedDays.indexOf(state.currentDay) === -1) state.checkedDays.push(state.currentDay);
    state.checkedDays.sort(function (a, b) { return a - b; });
    state.todayChecked = true;
    state.streak += 1;
    state.monthAttendance += 1;
    state.totalAttendance += 1;
    if (state.streak > state.bestStreak) state.bestStreak = state.streak;
    renderAttendance(app);
  }

  function shiftMonth(app, delta) {
    var state = app.__lumiAttendanceState;
    if (!state) return;

    var nextMonth = state.viewMonth + delta;
    var nextYear = state.viewYear;
    if (nextMonth < 1) {
      nextMonth = 12;
      nextYear -= 1;
    }
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }

    state.viewYear = nextYear;
    state.viewMonth = nextMonth;
    renderAttendance(app);
  }

  function renderAttendance(app) {
    var state = app.__lumiAttendanceState;
    var weekDays = getCurrentWeek(state);
    var calendar = getCalendarCells(state.viewYear, state.viewMonth);

    app.innerHTML = (
      '<section class="attendance-shell">' +
        renderBrandBar() +
        '<section class="attendance-intro">' +
          '<span class="attendance-eyebrow" aria-hidden="true"></span>' +
          '<h2>' + escHtml(ATTENDANCE_DATA.title) + '</h2>' +
          '<p>' + escHtml(ATTENDANCE_DATA.subtitle) + '</p>' +
        '</section>' +
        '<section class="attendance-card attendance-hero">' +
          '<div class="attendance-hero-ribbon" aria-hidden="true">' + renderImageSlot('ribbon') + '</div>' +
          '<div class="attendance-hero-inner">' +
            renderImageSlot('hero') +
            '<div class="attendance-hero-copy">' +
              '<h3>오늘 <b>' + (state.todayChecked ? '출석 완료' : '출석 가능') + '</b></h3>' +
              '<p>매일 1회 출석 체크 가능</p>' +
            '</div>' +
            '<button type="button" class="attendance-check-btn' + (state.todayChecked ? ' is-complete' : '') + '" data-att-check="1">' + (state.todayChecked ? '출석 완료' : '출석 체크') + '</button>' +
          '</div>' +
          '<div class="attendance-stats">' +
            renderStat('연속', state.streak + '일') +
            renderStat('이번 달', state.monthAttendance + '일') +
            renderStat('보상', '+' + state.rewardPoint + 'P') +
          '</div>' +
        '</section>' +
        '<section class="attendance-card attendance-week">' +
          '<div class="attendance-week-grid">' + weekDays.map(renderWeekDay).join('') + '</div>' +
        '</section>' +
        '<section class="attendance-card attendance-calendar">' +
          '<div class="attendance-calendar-head">' +
            '<button type="button" class="attendance-month-nav" data-att-month="prev" aria-label="이전 달">‹</button>' +
            '<h3>' + state.viewYear + '.' + padMonth(state.viewMonth) + '</h3>' +
            '<button type="button" class="attendance-month-nav" data-att-month="next" aria-label="다음 달">›</button>' +
          '</div>' +
          '<div class="attendance-calendar-grid">' +
            WEEK_LABELS.map(renderCalendarDow).join('') +
            calendar.map(function (cell) { return renderCalendarCell(cell, state); }).join('') +
          '</div>' +
        '</section>' +
        '<section class="attendance-lower-grid">' +
          '<section class="attendance-card attendance-panel">' +
            '<h4>출석 보상</h4>' +
            '<div class="attendance-list">' + ATTENDANCE_DATA.rewards.map(renderRewardRow).join('') + '</div>' +
          '</section>' +
          '<section class="attendance-card attendance-panel">' +
            '<h4>내 기록</h4>' +
            '<div class="attendance-list">' +
              renderInfoRow('이번 달 출석', state.monthAttendance + '일') +
              renderInfoRow('누적 출석', state.totalAttendance + '일') +
              renderInfoRow('최장 연속', state.bestStreak + '일') +
            '</div>' +
          '</section>' +
        '</section>' +
        '<section class="attendance-card attendance-guide">' +
          renderImageSlot('guide') +
          '<ul>' +
            '<li>출석은 하루 1회 가능해요.</li>' +
            '<li>자정 이후 다시 체크할 수 있어요.</li>' +
            '<li>출석 보상은 자동 적립돼요.</li>' +
          '</ul>' +
        '</section>' +
      '</section>'
    );
  }

  function renderBrandBar() {
    return (
      '<section class="attendance-brandbar">' +
        renderImageSlot('brand') +
        '<div class="attendance-brandmark"><strong>LumiPhone</strong><span>V2</span></div>' +
        '<div class="home-header-actions attendance-top-actions">' +
          '<button type="button" data-dock-app="profile" aria-label="프로필">MY</button>' +
          '<button type="button" class="home-notification-button" data-dock-app="notification" aria-label="알림센터"><span aria-hidden="true">알림</span><b data-notification-badge>' + getUnreadNotificationCount() + '</b></button>' +
        '</div>' +
      '</section>'
    );
  }

  function renderImageSlot(name) {
    return '<span class="attendance-image-slot attendance-image-slot--' + escHtml(name) + '" data-att-image-slot="' + escHtml(name) + '" aria-hidden="true"></span>';
  }

  function renderStat(label, value) {
    return '<article class="attendance-stat"><span>' + escHtml(label) + '</span><strong>' + escHtml(value) + '</strong></article>';
  }

  function renderWeekDay(day) {
    return '<div class="attendance-weekday' + (day.isSat ? ' is-sat' : '') + (day.isSun ? ' is-sun' : '') + '">' +
      '<strong>' + escHtml(day.label) + '</strong>' +
      '<span class="attendance-day-dot ' + day.stateClass + '">' + (day.checked ? '✓' : '') + '</span>' +
    '</div>';
  }

  function renderCalendarDow(label, index) {
    return '<div class="attendance-calendar-dow' + (index === 5 ? ' is-sat' : '') + (index === 6 ? ' is-sun' : '') + '">' + escHtml(label) + '</div>';
  }

  function renderCalendarCell(cell, state) {
    if (cell.empty) {
      return '<div class="attendance-calendar-cell is-empty' + (cell.isSat ? ' is-sat' : '') + (cell.isSun ? ' is-sun' : '') + '"><span class="attendance-calendar-num">' + escHtml(String(cell.day)) + '</span></div>';
    }

    var classes = 'attendance-calendar-cell';
    if (cell.isSat) classes += ' is-sat';
    if (cell.isSun) classes += ' is-sun';
    if (cell.day === state.currentDay && state.viewYear === ATTENDANCE_DATA.current.year && state.viewMonth === ATTENDANCE_DATA.current.month) classes += ' is-selected';

    var isChecked = state.viewYear === ATTENDANCE_DATA.current.year && state.viewMonth === ATTENDANCE_DATA.current.month && state.checkedDays.indexOf(cell.day) > -1;
    return '<div class="' + classes + '">' +
      '<span class="attendance-calendar-num">' + escHtml(String(cell.day)) + '</span>' +
      (isChecked ? '<span class="attendance-calendar-check" aria-label="출석 완료">✓</span>' : '') +
    '</div>';
  }

  function renderRewardRow(item) {
    return '<article class="attendance-list-row"><b>' + escHtml(item.label) + '</b><strong>' + escHtml(item.value) + '</strong></article>';
  }

  function renderInfoRow(label, value) {
    return '<article class="attendance-list-row"><b>' + escHtml(label) + '</b><strong>' + escHtml(value) + '</strong></article>';
  }

  function getToday() {
    var now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate()
    };
  }

  function getUnreadNotificationCount() {
    var notifications = window.LumiNotificationState && Array.isArray(window.LumiNotificationState.items)
      ? window.LumiNotificationState.items
      : [];
    return notifications.filter(function (item) {
      return item && item.unread !== false;
    }).length;
  }

  function getCurrentWeek(state) {
    var currentDate = new Date(ATTENDANCE_DATA.current.year, ATTENDANCE_DATA.current.month - 1, ATTENDANCE_DATA.current.day);
    var jsDay = currentDate.getDay();
    var mondayOffset = jsDay === 0 ? -6 : 1 - jsDay;
    var monday = new Date(currentDate);
    monday.setDate(currentDate.getDate() + mondayOffset);

    return WEEK_LABELS.map(function (label, index) {
      var dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + index);
      var dayNumber = dayDate.getDate();
      var inCurrentMonth = dayDate.getMonth() + 1 === ATTENDANCE_DATA.current.month;
      var isChecked = inCurrentMonth && state.checkedDays.indexOf(dayNumber) > -1;
      var isFuture = inCurrentMonth && dayNumber > ATTENDANCE_DATA.current.day;
      return {
        label: label,
        isSat: index === 5,
        isSun: index === 6,
        checked: isChecked,
        stateClass: isChecked ? 'is-done' : (isFuture ? 'is-pending' : '')
      };
    });
  }

  function getCalendarCells(year, month) {
    var first = new Date(year, month - 1, 1);
    var lastDate = new Date(year, month, 0).getDate();
    var firstDay = first.getDay();
    var startOffset = firstDay === 0 ? 6 : firstDay - 1;
    var prevLast = new Date(year, month - 1, 0).getDate();
    var cells = [];

    for (var before = 0; before < startOffset; before += 1) {
      cells.push({ day: prevLast - startOffset + 1 + before, empty: true, isSat: before === 5, isSun: before === 6 });
    }

    for (var day = 1; day <= lastDate; day += 1) {
      var index = startOffset + day - 1;
      var weekIndex = index % 7;
      cells.push({ day: day, empty: false, isSat: weekIndex === 5, isSun: weekIndex === 6 });
    }

    var nextDay = 1;
    while (cells.length % 7 !== 0) {
      var cellIndex = cells.length % 7;
      cells.push({ day: nextDay++, empty: true, isSat: cellIndex === 5, isSun: cellIndex === 6 });
    }
    return cells;
  }

  function padMonth(month) {
    return month < 10 ? '0' + month : String(month);
  }

  function escHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
})();
