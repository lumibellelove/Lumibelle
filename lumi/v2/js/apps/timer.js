/**
 * timer.js — Staff OS 교류 타이머 V3
 *
 * 운영 흐름
 * - 특전 처리의 [촬영 완료] → 해당 멤버 타이머 자동 시작
 * - 0초는 자동 완료하지 않음. 초과 시간/공통 토스트로 스탭에게 알림
 * - 자동 연동 건의 [교류 종료] → QueueStore.complete() → 다음 같은 멤버 1차 호출
 * - 수동 시작 건은 QueueStore와 분리
 */

window.LumiApps = window.LumiApps || {};

var LumiTimerStore = (function () {
  var STORAGE_KEY = 'lumibelle_staff_timer_v3';
  var MEMBER_ORDER = ['마리링', '루루', '이로', '루나'];
  var PRESETS = [60, 90, 120, 180];
  /*
   * 미리보기/파일 실행 환경에서는 localStorage 접근이 막힐 수 있다.
   * 그 경우 클릭 뒤 화면을 다시 그릴 때 초기값으로 돌아가지 않도록,
   * 현재 탭 동안은 메모리 사본을 항상 상태 원본으로 유지한다.
   */
  var memoryCache = null;

  function makeIdle(member) {
    return {
      member: member,
      fanName: '', lumiId: '', item: '', queueNumber: '',
      source: 'manual', exchangeSeconds: 60, remainingSeconds: 60,
      status: '대기중', startedAt: null, pausedAt: null, endedAt: null,
      warned: false, lastOvertimeAlertAt: 0
    };
  }

  function defaults() {
    var members = {};
    MEMBER_ORDER.forEach(function (member) { members[member] = makeIdle(member); });
    return { version: 3, baseSeconds: 60, members: members };
  }

  function normalizeRow(member, source) {
    var fallback = makeIdle(member);
    source = source && typeof source === 'object' ? source : fallback;
    var status = ['대기중', '진행중', '일시정지', '종료'].indexOf(source.status) >= 0 ? source.status : '대기중';
    return {
      member: member,
      fanName: String(source.fanName || ''), lumiId: String(source.lumiId || ''),
      item: String(source.item || ''), queueNumber: String(source.queueNumber || ''),
      source: source.source === 'auto' ? 'auto' : 'manual',
      exchangeSeconds: PRESETS.indexOf(Number(source.exchangeSeconds)) >= 0 ? Number(source.exchangeSeconds) : 60,
      remainingSeconds: Math.max(0, Number(source.remainingSeconds || 0)),
      status: status,
      startedAt: source.startedAt ? Number(source.startedAt) : null,
      pausedAt: source.pausedAt ? Number(source.pausedAt) : null,
      endedAt: source.endedAt ? Number(source.endedAt) : null,
      warned: !!source.warned,
      lastOvertimeAlertAt: Math.max(0, Number(source.lastOvertimeAlertAt || 0))
    };
  }

  function normalize(data) {
    if (!data || typeof data !== 'object' || Number(data.version) !== 3) return defaults();
    var result = { version: 3, baseSeconds: PRESETS.indexOf(Number(data.baseSeconds)) >= 0 ? Number(data.baseSeconds) : 60, members: {} };
    MEMBER_ORDER.forEach(function (member) { result.members[member] = normalizeRow(member, data.members && data.members[member]); });
    return result;
  }

  function read() {
    if (memoryCache) return normalize(memoryCache);
    try {
      var saved = normalize(JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null'));
      memoryCache = saved;
      return normalize(saved);
    } catch (error) {
      memoryCache = defaults();
      return normalize(memoryCache);
    }
  }

  function write(data) {
    var next = normalize(data);
    memoryCache = next;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      /* localStorage가 막힌 환경에서도 현재 탭의 타이머는 정상 동작한다. */
    }
    return true;
  }

  function remaining(row, at) {
    if (!row || row.status !== '진행중' || !row.startedAt) return Math.max(0, Number(row && row.remainingSeconds || 0));
    return Math.max(0, Number(row.remainingSeconds || 0) - Math.floor((at - row.startedAt) / 1000));
  }

  function overtime(row, at) {
    return !row || row.status !== '종료' || !row.endedAt ? 0 : Math.max(0, Math.floor((at - row.endedAt) / 1000));
  }

  return { memberOrder: MEMBER_ORDER, presets: PRESETS, read: read, write: write, remaining: remaining, overtime: overtime, makeIdle: makeIdle };
}());

var TimerAlertManager = (function () {
  var ticker = null;
  var audioContext = null;
  var activeFocusMember = '';

  function unlockAudio() {
    try {
      var AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) return;
      if (!audioContext) audioContext = new AudioCtor();
      if (audioContext.state === 'suspended') audioContext.resume();
    } catch (error) {}
  }

  function sound(pattern, vibratePattern) {
    try {
      unlockAudio();
      if (!audioContext) return;
      pattern.forEach(function (note) {
        var start = note[0], frequency = note[1], duration = note[2], type = note[3] || 'sine';
        var oscillator = audioContext.createOscillator();
        var gain = audioContext.createGain();
        oscillator.type = type;
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0.0001, audioContext.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.42, audioContext.currentTime + start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + start + duration);
        oscillator.connect(gain); gain.connect(audioContext.destination);
        oscillator.start(audioContext.currentTime + start);
        oscillator.stop(audioContext.currentTime + start + duration + 0.04);
      });
      if (navigator.vibrate && vibratePattern) navigator.vibrate(vibratePattern);
    } catch (error) {}
  }

  function soundWarn() { sound([[0,720,.12,'sine'], [.22,920,.18,'sine']], [120]); }
  function soundEnd() {
    sound([
      [0,950,.16,'square'], [.24,950,.16,'square'], [.48,950,.16,'square'], [.78,1250,.55,'square'],
      [1.45,950,.16,'square'], [1.69,950,.16,'square'], [1.93,950,.16,'square'], [2.23,1250,.60,'square'],
      [3,1100,.18,'square'], [3.25,1350,.70,'square']
    ], [260,110,260,110,520,180,260,110,260,110,650]);
  }

  /* 초과 상태는 30초마다 토스트와 함께 짧지만 분명한 재알림음을 낸다. */
  function soundOvertime() {
    sound([
      [0,980,.14,'square'], [.22,980,.14,'square'], [.48,1220,.28,'square']
    ], [160,90,160]);
  }

  function ensureToast() {
    var toast = document.querySelector('[data-staff-timer-alert]');
    if (toast) return toast;
    toast = document.createElement('aside');
    toast.className = 'staff-timer-alert';
    toast.setAttribute('data-staff-timer-alert', '');
    toast.setAttribute('hidden', '');
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'assertive');
    toast.innerHTML = '<div class="staff-timer-alert-copy"><strong></strong><p></p></div><button type="button" data-staff-timer-alert-go>타이머 보기</button><button type="button" class="staff-timer-alert-close" aria-label="알림 닫기" data-staff-timer-alert-close>×</button>';
    document.body.appendChild(toast);
    toast.addEventListener('click', function (event) {
      if (event.target.closest('[data-staff-timer-alert-close]')) { hideToast(); return; }
      if (event.target.closest('[data-staff-timer-alert-go]') || event.target.closest('.staff-timer-alert-copy')) focusTimer(activeFocusMember);
    });
    return toast;
  }

  function showToast(kind, title, detail, member) {
    var toast = ensureToast();
    activeFocusMember = member || '';
    toast.className = 'staff-timer-alert is-' + kind;
    toast.querySelector('strong').textContent = title;
    toast.querySelector('p').textContent = detail;
    toast.querySelector('[data-staff-timer-alert-go]').textContent = kind === 'warn' ? '타이머 보기' : '타이머로 이동';
    toast.hidden = false;
    window.clearTimeout(toast._hideTimer);
    toast._hideTimer = window.setTimeout(hideToast, kind === 'warn' ? 6500 : 9000);
  }

  function hideToast() {
    var toast = document.querySelector('[data-staff-timer-alert]');
    if (toast) toast.hidden = true;
  }

  function focusTimer(member) {
    activeFocusMember = member || '';
    if (window.StaffOS && typeof window.StaffOS.openApp === 'function') window.StaffOS.openApp('timer');
    window.setTimeout(function () {
      var root = document.querySelector('[data-timer-app]');
      var card = root && root.querySelector('[data-timer-card="' + cssEscape(member) + '"]');
      if (!card) return;
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.classList.remove('is-alert-focus');
      void card.offsetWidth;
      card.classList.add('is-alert-focus');
    }, 120);
  }

  function tick() {
    var data = LumiTimerStore.read();
    var at = Date.now();
    var changed = false;
    /* 종료 상태로 전환되는 순간에는 카드 구조도 진행 카드 → 초과 카드로 바뀌어야 한다.
       숫자만 갱신하면 기존 00:01 화면에 남아 초과 시간이 멈춘 것처럼 보인다. */
    var needsCardRerender = false;
    LumiTimerStore.memberOrder.forEach(function (member) {
      var row = data.members[member];
      if (row.status === '진행중') {
        var left = LumiTimerStore.remaining(row, at);
        var warningAt = wrapupSeconds(row.exchangeSeconds);
        if (!row.warned && left > 0 && left <= warningAt) {
          row.warned = true; changed = true;
          soundWarn();
          showToast('warn', '⚠ ' + member + ' 마무리 안내', (row.fanName || '팬 미지정') + ' · 교류 ' + left + '초 남음\n슬슬 마무리 안내해주세요.', member);
        }
        if (left <= 0) {
          row.remainingSeconds = 0;
          row.status = '종료';
          row.startedAt = null;
          row.endedAt = at;
          row.lastOvertimeAlertAt = 0;
          changed = true;
          needsCardRerender = true;
          soundEnd();
          showToast('end', '⏱ ' + member + ' 교류 종료', (row.fanName || '팬 미지정') + ' · 교류 시간이 종료되었습니다.', member);
        }
      }
      if (row.status === '종료') {
        var overtime = LumiTimerStore.overtime(row, at);
        if (overtime >= 30 && overtime % 30 === 0 && overtime !== row.lastOvertimeAlertAt) {
          row.lastOvertimeAlertAt = overtime;
          changed = true;
          soundOvertime();
          showToast('end', '⏱ ' + member + ' 교류 초과', (row.fanName || '팬 미지정') + ' · 초과 +' + formatTimerSeconds(overtime) + '\n교류 종료 처리가 필요합니다.', member);
        }
      }
    });
    if (changed) LumiTimerStore.write(data);
    if (needsCardRerender) {
      /* 종료 직후 초과 카드의 data-timer-overtime 영역을 즉시 만들고,
         이후 1초 단위로 +00:01, +00:02 ... 계속 갱신한다. */
      var openRoot = document.querySelector('[data-timer-app]');
      if (openRoot) renderTimerRoot(openRoot, getTimerState(openRoot));
    }
    refreshVisibleTimerApp(LumiTimerStore.read(), at);
  }

  function start() {
    if (ticker) return;
    document.addEventListener('pointerdown', unlockAudio, { passive: true });
    ticker = window.setInterval(tick, 1000);
    tick();
  }

  return { start: start, unlockAudio: unlockAudio, focusTimer: focusTimer, showToast: showToast };
}());

var TimerRuntime = (function () {
  function canStartAuto(queueRow) {
    if (!queueRow || !queueRow.member || LumiTimerStore.memberOrder.indexOf(queueRow.member) < 0) return { ok: false, message: '타이머 대상 멤버를 찾지 못했습니다.' };
    var data = LumiTimerStore.read();
    var row = data.members[queueRow.member];
    if (row.status !== '대기중') return { ok: false, message: queueRow.member + ' 타이머가 이미 진행 중입니다.' };
    return { ok: true };
  }

  function startAuto(queueRow) {
    var availability = canStartAuto(queueRow);
    if (!availability.ok) return availability;
    var data = LumiTimerStore.read();
    var seconds = exchangeSecondsForItem(queueRow);
    var at = Date.now();
    data.members[queueRow.member] = {
      member: queueRow.member,
      fanName: queueRow.displayName || '', lumiId: queueRow.lumiId || '', item: (window.QueueStore && typeof QueueStore.itemLabel === 'function' ? QueueStore.itemLabel(queueRow) : (queueRow.item || '')), queueNumber: queueRow.number || '',
      source: 'auto', exchangeSeconds: seconds, remainingSeconds: seconds,
      status: '진행중', startedAt: at, pausedAt: null, endedAt: null, warned: false, lastOvertimeAlertAt: 0
    };
    LumiTimerStore.write(data);
    TimerAlertManager.unlockAudio();
    TimerAlertManager.start();
    return { ok: true, seconds: seconds };
  }

  function exchangeSecondsForItem(queueRowOrItem) {
    var item = typeof queueRowOrItem === 'object' && queueRowOrItem ? queueRowOrItem.item : queueRowOrItem;
    var label = String(item || '').replace(/\s/g, '');
    if (label.indexOf('단체촬영') >= 0 || label.indexOf('단체교류') >= 0) return 180;
    if (label.indexOf('영상') >= 0) return 60;
    if (label.indexOf('샤메') >= 0 || label.indexOf('핀체키') >= 0) return 90;
    if (label.indexOf('투샷') >= 0 || label.indexOf('숙제') >= 0) return 120;
    if (label.indexOf('신규') >= 0 || label.indexOf('이벤트') >= 0) return 60;
    return 60;
  }

  function isLinkedAutoActive(queueRow) {
    if (!queueRow || !queueRow.member || !queueRow.number) return false;
    var row = LumiTimerStore.read().members[queueRow.member];
    if (!row || row.source !== 'auto') return false;
    if (String(row.queueNumber || '') !== String(queueRow.number || '')) return false;
    return ['진행중', '일시정지', '종료'].indexOf(row.status) >= 0;
  }

  function finish(row) {
    if (row.source === 'auto') {
      if (!window.QueueStore || typeof QueueStore.complete !== 'function') return { ok: false, message: '특전 완료 연동을 찾지 못했습니다.' };
      var result = QueueStore.complete(row.queueNumber);
      if (!result.ok) return result;
      return { ok: true, message: row.member + ' 특전 완료 처리되었습니다.', queueResult: result };
    }
    return { ok: true, message: row.member + ' 수동 타이머를 종료했습니다.' };
  }

  return { startAuto: startAuto, canStartAuto: canStartAuto, isLinkedAutoActive: isLinkedAutoActive, finish: finish, exchangeSecondsForItem: exchangeSecondsForItem };
}());

window.LumiApps.timer = function () {
  TimerAlertManager.start();
  window.setTimeout(bindTimerApp, 0);
  return '<section class="timer-app" data-timer-app></section>';
};

function getTimerState(root) { if (!root._timerState) root._timerState = { data: LumiTimerStore.read() }; return root._timerState; }
function renderTimerRoot(root, state) { state.data = LumiTimerStore.read(); root.innerHTML = renderTimerApp(state.data, state); }

function renderTimerApp(data, state) {
  var running = LumiTimerStore.memberOrder.filter(function (member) { return data.members[member].status === '진행중'; }).length;
  return renderTimerHeader() + renderTimerSettings(data) +
    '<section class="timer-member-section" aria-label="멤버별 타이머"><header class="timer-section-head"><strong>멤버별 타이머</strong><span>' + running + '명 진행 중</span></header><div class="timer-card-list">' +
    LumiTimerStore.memberOrder.map(function (member) { return renderTimerMemberCard(data.members[member], data.baseSeconds, state); }).join('') +
    '</div></section><div class="timer-toast" data-timer-toast hidden role="status" aria-live="polite"></div>';
}

function renderTimerHeader() { return '<header class="timer-titlebar"><h2>타이머</h2><div class="timer-event-line"><span>이벤트 진행 중</span><b>19:00 ~ 21:30</b></div></header>'; }
function renderTimerSettings(data) {
  var warning = wrapupSeconds(data.baseSeconds);
  return '<section class="timer-setting-card"><header><strong>수동 타이머 설정</strong></header><div class="timer-setting-grid"><div class="timer-setting-col"><span>기본 시간</span><b>' + data.baseSeconds + '<em>초</em></b><div class="timer-preset-row">' + LumiTimerStore.presets.map(function (seconds) { return '<button type="button" data-timer-base="' + seconds + '" class="' + (data.baseSeconds === seconds ? 'is-active' : '') + '">' + seconds + '초</button>'; }).join('') + '</div></div><div class="timer-setting-divider" aria-hidden="true"></div><div class="timer-setting-col is-alert"><span>마무리 알림</span><b>' + warning + '초 남음에 안내</b><p>자동 연동 건은 권종별 교류 시간이 우선 적용됩니다.</p></div></div></section>';
}

function renderTimerMemberCard(row, baseSeconds, state) {
  if (row.status === '대기중') return renderTimerIdleCard(row, baseSeconds, state);
  if (row.status === '종료') return renderTimerEndedCard(row);
  return renderTimerActiveCard(row);
}

function renderTimerIdleCard(row, baseSeconds) {
  var readySeconds = Math.max(0, Number(row.remainingSeconds || baseSeconds));
  return '<article class="timer-member-card is-idle is-manual" data-timer-card="' + escapeTimer(row.member) + '">' +
    '<header class="timer-card-head"><strong>' + escapeTimer(row.member) + '</strong><span class="timer-row-status is-waiting">수동 타이머</span></header>' +
    '<div class="timer-active-layout">' +
      '<div class="timer-member-copy">' +
        '<p>자동 연동 대기 중</p>' +
        '<small>촬영 완료 시 권종별 시간으로 자동 시작됩니다.</small>' +
        '<div class="timer-big-number">' + formatTimerSeconds(readySeconds) + '</div>' +
        '<p class="timer-subnote">수동 기본 시간 ' + row.exchangeSeconds + '초</p>' +
      '</div>' +
      '<div class="timer-control-panel"><div class="timer-control-grid">' +
        '<button type="button" class="timer-control is-main" data-timer-action="manual-start" data-timer-member="' + escapeTimer(row.member) + '"><span>▷</span> 시작</button>' +
        '<button type="button" class="timer-control" data-timer-action="manual-reset" data-timer-member="' + escapeTimer(row.member) + '"><span>↻</span> 리셋</button>' +
        '<button type="button" class="timer-control" data-timer-action="manual-plus" data-timer-value="10" data-timer-member="' + escapeTimer(row.member) + '">+10초</button>' +
        '<button type="button" class="timer-control" data-timer-action="manual-plus" data-timer-value="30" data-timer-member="' + escapeTimer(row.member) + '">+30초</button>' +
        '<button type="button" class="timer-control timer-control-wide" data-timer-action="finish" data-timer-member="' + escapeTimer(row.member) + '"><span>✓</span> 교류 종료</button>' +
      '</div></div>' +
    '</div></article>';
}

function renderTimerActiveCard(row) {
  var paused = row.status === '일시정지';
  var manual = row.source === 'manual';
  var displaySeconds = row.status === '진행중'
    ? LumiTimerStore.remaining(row, Date.now())
    : Number(row.remainingSeconds || 0);
  var controls = '';
  if (manual) {
    controls = (paused
      ? '<button type="button" class="timer-control is-main" data-timer-action="resume" data-timer-member="' + escapeTimer(row.member) + '"><span>▷</span> 시작</button>'
      : '<button type="button" class="timer-control is-main" data-timer-action="pause" data-timer-member="' + escapeTimer(row.member) + '"><span>■</span> 정지</button>') +
      '<button type="button" class="timer-control" data-timer-action="reset" data-timer-member="' + escapeTimer(row.member) + '"><span>↻</span> 리셋</button>' +
      '<button type="button" class="timer-control" data-timer-action="plus" data-timer-value="10" data-timer-member="' + escapeTimer(row.member) + '">+10초</button>' +
      '<button type="button" class="timer-control" data-timer-action="plus" data-timer-value="30" data-timer-member="' + escapeTimer(row.member) + '">+30초</button>' +
      '<button type="button" class="timer-control timer-control-wide" data-timer-action="finish" data-timer-member="' + escapeTimer(row.member) + '"><span>✓</span> 교류 종료</button>';
  } else {
    controls = (paused
      ? '<button type="button" class="timer-control is-main" data-timer-action="resume" data-timer-member="' + escapeTimer(row.member) + '"><span>▷</span> 다시 시작</button><button type="button" class="timer-control" data-timer-action="reset" data-timer-member="' + escapeTimer(row.member) + '"><span>↻</span> 리셋</button>'
      : '<button type="button" class="timer-control is-main" data-timer-action="pause" data-timer-member="' + escapeTimer(row.member) + '"><span>■</span> 정지</button>') +
      '<button type="button" class="timer-control" data-timer-action="plus" data-timer-value="30" data-timer-member="' + escapeTimer(row.member) + '">+30초</button>' +
      '<button type="button" class="timer-control" data-timer-action="plus" data-timer-value="60" data-timer-member="' + escapeTimer(row.member) + '">+60초</button>';
  }
  var copy = manual
    ? '<p>수동 타이머</p><small>수동 진행 · 교류 ' + row.exchangeSeconds + '초</small>'
    : '<p>현재 팬 <b>' + escapeTimer(row.fanName || '미지정') + '</b></p><small>' + escapeTimer(row.lumiId || '') + (row.lumiId ? ' · ' : '') + escapeTimer(row.item || '') + ' · 교류 ' + row.exchangeSeconds + '초</small>';
  return '<article class="timer-member-card is-active" data-timer-card="' + escapeTimer(row.member) + '"><header class="timer-card-head"><strong>' + escapeTimer(row.member) + '</strong><span class="timer-row-status is-' + (paused ? 'paused' : 'running') + '">' + (paused ? '정지됨' : '진행 중') + '</span></header><div class="timer-active-layout"><div class="timer-member-copy">' + copy + '<div class="timer-big-number" data-timer-display="' + escapeTimer(row.member) + '">' + formatTimerSeconds(displaySeconds) + '</div><p class="timer-subnote">마무리 알림 ' + wrapupSeconds(row.exchangeSeconds) + '초 전</p></div><div class="timer-control-panel"><div class="timer-control-grid">' + controls + '</div></div></div></article>';
}

function renderTimerEndedCard(row) {
  var auto = row.source === 'auto';
  var extensionButtons = auto
    ? '<button type="button" class="timer-control" data-timer-action="plus" data-timer-value="30" data-timer-member="' + escapeTimer(row.member) + '">+30초</button><button type="button" class="timer-control" data-timer-action="plus" data-timer-value="60" data-timer-member="' + escapeTimer(row.member) + '">+60초</button>'
    : '<button type="button" class="timer-control" data-timer-action="plus" data-timer-value="10" data-timer-member="' + escapeTimer(row.member) + '">+10초</button><button type="button" class="timer-control" data-timer-action="plus" data-timer-value="30" data-timer-member="' + escapeTimer(row.member) + '">+30초</button>';
  return '<article class="timer-member-card is-ended" data-timer-card="' + escapeTimer(row.member) + '"><header class="timer-card-head"><strong>' + escapeTimer(row.member) + '</strong><span class="timer-row-status is-ended">' + (auto ? '교류 초과' : '시간 초과') + '</span></header><div class="timer-ended-layout"><div><span>' + escapeTimer(auto ? (row.fanName || '팬 미지정') : '수동 타이머') + '</span><strong data-timer-overtime="' + escapeTimer(row.member) + '">+' + formatTimerSeconds(LumiTimerStore.overtime(row, Date.now())) + '</strong></div><div class="timer-ended-actions"><div class="timer-control-grid">' + extensionButtons + '</div><button type="button" class="timer-finish-button" data-timer-action="finish" data-timer-member="' + escapeTimer(row.member) + '"><span>✓</span> 교류 종료</button></div></div></article>';
}

var TimerInteractionManager = (function () {
  var bound = false;

  function getOpenTimerRoot() {
    return document.querySelector('[data-timer-app]');
  }

  function renderOpenTimer() {
    var root = getOpenTimerRoot();
    if (!root) return;
    var state = getTimerState(root);
    renderTimerRoot(root, state);
  }

  function handleBase(base) {
    var data = LumiTimerStore.read();
    data.baseSeconds = Number(base.getAttribute('data-timer-base')) || 60;
    LumiTimerStore.memberOrder.forEach(function (member) {
      var row = data.members[member];
      if (row.status === '대기중' && row.source !== 'auto') {
        row.exchangeSeconds = data.baseSeconds;
        row.remainingSeconds = data.baseSeconds;
        row.warned = false;
      }
    });
    LumiTimerStore.write(data);
    renderOpenTimer();
  }

  function handleAction(button) {
    TimerAlertManager.unlockAudio();
    var data = LumiTimerStore.read();
    var member = button.getAttribute('data-timer-member');
    var row = data.members[member];
    if (!row) return;

    var result = applyTimerAction(
      data,
      row,
      button.getAttribute('data-timer-action'),
      Number(button.getAttribute('data-timer-value') || 0)
    );

    if (result && result.ok === false) {
      var openRoot = getOpenTimerRoot();
      if (openRoot) showTimerToast(openRoot, result.message);
      return;
    }

    LumiTimerStore.write(data);
    renderOpenTimer();
    var root = getOpenTimerRoot();
    if (root) {
      refreshVisibleTimerApp(LumiTimerStore.read(), Date.now());
      showTimerToast(root, result && result.message ? result.message : '처리했습니다.');
    }
  }

  function bind() {
    if (bound) return;
    bound = true;
    document.addEventListener('click', function (event) {
      var base = event.target.closest && event.target.closest('[data-timer-base]');
      if (base && base.closest('[data-timer-app]')) {
        handleBase(base);
        return;
      }

      var action = event.target.closest && event.target.closest('[data-timer-action]');
      if (action && action.closest('[data-timer-app]')) {
        handleAction(action);
      }
    });
  }

  return { bind: bind };
}());

function bindTimerApp() {
  var root = document.querySelector('[data-timer-app]');
  if (!root) return;
  TimerInteractionManager.bind();
  var state = getTimerState(root);
  renderTimerRoot(root, state);
}

function applyTimerAction(data, row, action, value) {
  var at = Date.now();
  var left = LumiTimerStore.remaining(row, at);
  if (action === 'manual-start') {
    /*
     * 수동 기본 카드는 대기 상태에서도 바로 시작되어야 한다.
     * 저장된 이전 상태가 0초이거나 기본 시간이 비어 있는 경우에도
     * 현재 수동 기본 시간으로 정상 복구한 뒤 즉시 진행 상태로 전환한다.
     */
    var manualSeconds = Number(row.remainingSeconds);
    var fallbackSeconds = Number(row.exchangeSeconds || data.baseSeconds || 60);
    if (LumiTimerStore.presets.indexOf(fallbackSeconds) < 0) fallbackSeconds = Number(data.baseSeconds) || 60;
    if (!Number.isFinite(manualSeconds) || manualSeconds <= 0) manualSeconds = fallbackSeconds;

    row.source = 'manual';
    row.exchangeSeconds = fallbackSeconds;
    row.remainingSeconds = manualSeconds;
    row.status = '진행중';
    row.startedAt = at;
    row.pausedAt = null;
    row.endedAt = null;
    row.warned = false;
    row.lastOvertimeAlertAt = 0;
    return { ok: true, message: row.member + ' 수동 타이머를 시작했습니다.' };
  }
  if (action === 'manual-reset') {
    row.source = 'manual';
    row.exchangeSeconds = Math.max(1, Number(row.exchangeSeconds || data.baseSeconds));
    row.remainingSeconds = row.exchangeSeconds;
    row.status = '대기중'; row.startedAt = null; row.pausedAt = null; row.endedAt = null; row.warned = false; row.lastOvertimeAlertAt = 0;
    return { ok: true, message: row.member + ' 수동 타이머를 초기화했습니다.' };
  }
  if (action === 'manual-plus') {
    row.source = 'manual';
    row.remainingSeconds = Math.max(0, Number(row.remainingSeconds || row.exchangeSeconds || data.baseSeconds)) + value;
    row.status = '대기중'; row.startedAt = null; row.pausedAt = null; row.endedAt = null; row.warned = false; row.lastOvertimeAlertAt = 0;
    return { ok: true, message: row.member + ' 수동 타이머를 ' + value + '초 연장했습니다.' };
  }
  if (action === 'pause') { row.remainingSeconds = left; row.status = '일시정지'; row.startedAt = null; row.pausedAt = at; return { ok: true, message: row.member + ' 타이머를 정지했습니다.' }; }
  if (action === 'resume') { row.remainingSeconds = Math.max(1, left || row.exchangeSeconds); row.status = '진행중'; row.startedAt = at; row.pausedAt = null; return { ok: true, message: row.member + ' 타이머를 다시 시작했습니다.' }; }
  if (action === 'reset') { row.remainingSeconds = row.exchangeSeconds; row.status = '일시정지'; row.startedAt = null; row.pausedAt = at; row.warned = false; return { ok: true, message: row.member + ' 타이머를 초기화했습니다.' }; }
  if (action === 'plus') { var carry = row.status === '종료' ? 0 : left; row.remainingSeconds = carry + value; row.status = '진행중'; row.startedAt = at; row.endedAt = null; row.warned = false; row.lastOvertimeAlertAt = 0; return { ok: true, message: row.member + ' 타이머를 ' + value + '초 연장했습니다.' }; }
  if (action === 'finish') {
    var done = TimerRuntime.finish(row); if (!done.ok) return done;
    var idle = LumiTimerStore.makeIdle(row.member);
    idle.exchangeSeconds = data.baseSeconds;
    idle.remainingSeconds = data.baseSeconds;
    data.members[row.member] = idle;
    return done;
  }
  return { ok: false, message: '처리할 수 없습니다.' };
}

function refreshVisibleTimerApp(data, at) {
  var root = document.querySelector('[data-timer-app]'); if (!root) return;
  LumiTimerStore.memberOrder.forEach(function (member) {
    var row = data.members[member];
    var display = root.querySelector('[data-timer-display="' + cssEscape(member) + '"]');
    if (display && row.status === '진행중') display.textContent = formatTimerSeconds(LumiTimerStore.remaining(row, at));
    var overtime = root.querySelector('[data-timer-overtime="' + cssEscape(member) + '"]');
    if (overtime && row.status === '종료') overtime.textContent = '+' + formatTimerSeconds(LumiTimerStore.overtime(row, at));
  });
}

function wrapupSeconds(seconds) { return { 60: 25, 90: 35, 120: 50, 180: 60 }[Number(seconds)] || 25; }
function formatTimerSeconds(seconds) { var safe = Math.max(0, Number(seconds || 0)); return String(Math.floor(safe / 60)).padStart(2, '0') + ':' + String(safe % 60).padStart(2, '0'); }
function escapeTimer(value) { return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) { return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[character]; }); }
function cssEscape(value) { return String(value).replace(/(["\\])/g, '\\$1'); }
function showTimerToast(root, message) { var toast = root.querySelector('[data-timer-toast]'); if (!toast) return; toast.textContent = message; toast.hidden = false; toast.classList.add('is-visible'); window.clearTimeout(root._timerToastTimer); root._timerToastTimer = window.setTimeout(function () { toast.classList.remove('is-visible'); toast.hidden = true; }, 2400); }

TimerAlertManager.start();
