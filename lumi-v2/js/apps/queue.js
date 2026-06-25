/**
 * queue.js — Staff OS 특전회 대기 V1
 *
 * 현재: 브라우저 localStorage 임시 운영본
 * 이후: QueueStore만 새 스탭 DB/API 요청 함수로 교체
 *
 * 운영 규칙 반영
 * - [특전회 시작] → 첫 대기번호 자동 1차 호출
 * - 1차 호출 3분 후 자동 2차 호출 2분
 * - 도착 확인 → 현재 건 진행중 + 다음 번호 자동 1차 호출
 * - 2차 호출 후 미응답 → 스탭 확인 후 호출 미응답 취소
 */

window.LumiApps = window.LumiApps || {};

var QueueStore = (function () {
  var STORAGE_KEY = "lumibelle_staff_queue_v1";
  var SESSION_KEY = STORAGE_KEY + "_session";
  var memoryRaw = null;
  var MEMBERS = ["마리링", "루루", "이로", "루나"];
  var FIRST_CALL_SECONDS = 180;
  var SECOND_CALL_SECONDS = 120;
  var DEFAULT_PREREGISTRATION_WINDOW_MINUTES = 30;

  function emitChange() {
    try {
      window.dispatchEvent(new CustomEvent("lumibelle:queuechange"));
    } catch (error) {}
  }

  function normalizeData(data) {
    if (!data || typeof data !== "object") return data;
    if (!Array.isArray(data.pausedMembers)) data.pausedMembers = [];
    if (!data.registration || typeof data.registration !== "object") {
      data.registration = {
        phase: "auto_wait",
        autoOpenAt: "19:30",
        autoOpenEnabled: true,
        openedAt: null,
        pausedAt: null,
        heldAt: null,
        overrideReason: null,
        preregistrationDeadlineAt: null
      };
    }
    if (!data.registration.phase) data.registration.phase = "auto_wait";
    if (!data.registration.autoOpenAt) data.registration.autoOpenAt = "19:30";
    if (typeof data.registration.autoOpenEnabled === "undefined") data.registration.autoOpenEnabled = true;
    if (typeof data.registration.preregistrationDeadlineAt === "undefined") data.registration.preregistrationDeadlineAt = null;
    if (typeof data.registration.closedAt === "undefined") data.registration.closedAt = null;
    if (typeof data.callClosed === "undefined") data.callClosed = false;
    if (typeof data.callClosedAt === "undefined") data.callClosedAt = null;
    if (typeof data.callClosedCancelledCount === "undefined") data.callClosedCancelledCount = 0;
    data.queues.forEach(function (row) {
      if (!row.status) row.status = "대기중";
      if (!row.callRound) row.callRound = 0;
      if (typeof row.warning30At === "undefined") row.warning30At = null;
      if (typeof row.needsResponseCheck === "undefined") row.needsResponseCheck = false;
      if (typeof row.responseCheckAt === "undefined") row.responseCheckAt = null;
      if (!row.quantity) row.quantity = 1;
      if (typeof row.shootFormat === "undefined") row.shootFormat = "";
    });
    return data;
  }

  function safeGet(storage, key) {
    try {
      return storage ? storage.getItem(key) : null;
    } catch (error) {
      return null;
    }
  }

  function safeSet(storage, key, raw) {
    try {
      if (!storage) return false;
      storage.setItem(key, raw);
      return true;
    } catch (error) {
      return false;
    }
  }

  function parseQueueData(raw) {
    if (!raw) return null;
    try {
      var data = JSON.parse(raw);
      return data && typeof data === "object" && Array.isArray(data.queues) ? normalizeData(data) : null;
    } catch (error) {
      return null;
    }
  }

  function makeRows() {
    var members = [
      ["마리링", 7, ["딸기우유♡", "복숭아소다", "링링하트", "새콤딸기", "냥냥마카롱", "우유푸딩", "로즈베리"]],
      ["루루", 6, ["핑크라떼", "슈가리본", "루루피", "바닐라밀크", "토끼젤리", "체리크림"]],
      ["이로", 5, ["별빛소다", "블루문", "하늘구름", "소다별", "아이스캔디"]],
      ["루나", 6, ["달콤메론", "문라이트", "라벤더티", "별사탕", "달빛쿠키", "루나링"]]
    ];
    var types = [
      { item: "투샷 체키" },
      { item: "핀체키" },
      { item: "숙제체키" },
      { item: "샤메" },
      { item: "영상권" },
      { item: "단체 촬영", shootFormat: "체키" },
      { item: "단체 촬영", shootFormat: "샤메" },
      { item: "이벤트 특전권" }
    ];
    var rows = [];
    var number = 7;
    var cursor = 0;

    members.forEach(function (group) {
      for (var i = 0; i < group[1]; i += 1) {
        var type = types[(cursor + i) % types.length];
        rows.push({
          id: "q_" + number,
          number: String(number).padStart(3, "0"),
          displayName: group[2][i],
          lumiId: "LB-" + String(1000 + number).slice(-4),
          member: group[0],
          item: type.item,
          shootFormat: type.shootFormat || "",
          quantity: 1,
          estimateMin: group[0] === "마리링" ? 10 : 8,
          status: "대기중",
          callRound: 0,
          calledAt: null,
          registeredAt: "2026-07-12T18:" + String(10 + (number % 25)).padStart(2, "0") + ":00.000Z",
          memo: ""
        });
        number += 1;
      }
      cursor += 1;
    });
    return rows;
  }

  function ensureTicketTypeTestSamples(data) {
    if (!data || !Array.isArray(data.queues)) return false;

    var SAMPLE_VERSION = 1;
    if (Number(data.ticketTypeTestSamplesVersion || 0) >= SAMPLE_VERSION) return false;

    var samples = [
      { id: "test_homework_cheki", number: "001", displayName: "숙제딸기", lumiId: "LB-9001", member: "마리링", item: "숙제체키", quantity: 1, estimateMin: 10 },
      { id: "test_video_ticket", number: "002", displayName: "영상소다", lumiId: "LB-9002", member: "루루", item: "영상권", quantity: 1, estimateMin: 8 },
      { id: "test_group_cheki", number: "003", displayName: "단체체키", lumiId: "LB-9003", member: "이로", item: "단체 촬영", shootFormat: "체키", quantity: 1, estimateMin: 12 },
      { id: "test_group_shame", number: "004", displayName: "단체샤메", lumiId: "LB-9004", member: "루나", item: "단체 촬영", shootFormat: "샤메", quantity: 1, estimateMin: 12 },
      { id: "test_event_ticket", number: "005", displayName: "이벤트별", lumiId: "LB-9005", member: "마리링", item: "이벤트 특전권", quantity: 1, estimateMin: 8 }
    ];

    var existingIds = {};
    data.queues.forEach(function (row) { existingIds[row.id] = true; });

    var added = false;
    samples.forEach(function (sample) {
      if (existingIds[sample.id]) return;
      data.queues.push({
        id: sample.id,
        number: sample.number,
        displayName: sample.displayName,
        lumiId: sample.lumiId,
        member: sample.member,
        item: sample.item,
        shootFormat: sample.shootFormat || "",
        quantity: sample.quantity,
        estimateMin: sample.estimateMin,
        status: "대기중",
        callRound: 0,
        calledAt: null,
        registeredAt: "2026-07-12T17:00:00.000Z",
        memo: "",
        warning30At: null,
        needsResponseCheck: false,
        responseCheckAt: null,
        isTestSample: true
      });
      added = true;
    });

    data.ticketTypeTestSamplesVersion = SAMPLE_VERSION;
    if (added) appendAction(data, "TEST_TICKET_SAMPLES_ADDED", { count: samples.length });
    return added;
  }

  function defaultData() {
    return {
      version: 1,
      // 기존 진행중 세션을 새 자동호출 규칙으로 한 번만 보정하기 위한 버전값
      queueAutomationVersion: 3,
      started: false,
      event: {
        eventId: "EVT-20260712",
        title: "Lumibelle Debut Live",
        specialTime: "19:00 ~ 21:30",
        expectedStart: "오후 7:00",
        startedAt: null
      },
      registration: {
        schemaVersion: 1,
        phase: "auto_wait",
        autoOpenAt: "19:30",
        autoOpenEnabled: true,
        openedAt: null,
        pausedAt: null,
        heldAt: null,
        overrideReason: null
      },
      queues: makeRows(),
      pausedMembers: [],
      callClosed: false,
      callClosedAt: null,
      callClosedCancelledCount: 0,
      completedCount: 16,
      actions: []
    };
  }



  function migrateLegacyQueueIntoPreRegistration(data) {
    // v20 이전의 저장값은 `started`만 갖고 있어서 사전 접수 단계가 없었습니다.
    // 그 기존 데모 세션은 한 번만 시작 전/자동 오픈 대기 상태로 되돌려 새 흐름을 확인하게 합니다.
    if (!data || !data.registration || Number(data.registration.schemaVersion || 0) >= 1) return false;

    data.started = false;
    data.event = data.event || {};
    data.event.startedAt = null;
    data.callClosed = false;
    data.callClosedAt = null;
    data.callClosedCancelledCount = 0;
    data.pausedMembers = [];
    data.queueAutomationVersion = 3;

    data.queues.forEach(function (row) {
      if (row.status === "완료") return;
      row.status = "대기중";
      row.callRound = 0;
      row.calledAt = null;
      row.warning30At = null;
      row.needsResponseCheck = false;
      row.responseCheckAt = null;
    });

    data.registration.schemaVersion = 1;
    data.registration.phase = "auto_wait";
    data.registration.openedAt = null;
    data.registration.pausedAt = null;
    data.registration.heldAt = null;
    data.registration.closedAt = null;
    data.registration.overrideReason = "legacy_state_reset";
    appendAction(data, "PREREGISTRATION_LEGACY_STATE_RESET", {});
    return true;
  }

  function migrateActiveQueueAutomation(data) {
    // 이전 패치에서 이미 `진행 중`으로 저장된 세션은 [특전회 시작]을 다시 누르지 않는다.
    // 그래서 자동 1차 호출 초기화가 한 번도 실행되지 않은 빈 레인만 여기서 1회 보정한다.
    if (!data || !data.started || Number(data.queueAutomationVersion || 0) >= 3) return false;

    var changed = false;
    MEMBERS.forEach(function (member) {
      if (lanePaused(data, member) || currentCall(data, member)) return;
      var next = firstWaiting(data, member);
      if (!next) return;
      next.status = "호출중";
      next.callRound = 1;
      next.calledAt = new Date().toISOString();
      next.warning30At = null;
      next.needsResponseCheck = false;
      next.responseCheckAt = null;
      appendAction(data, "AUTO_FIRST_CALL_MIGRATED", { number: next.number, member: member });
      changed = true;
    });

    // 호출할 사람이 없는 레인까지 포함해, 이 보정은 해당 진행 세션에서 딱 한 번만 수행한다.
    data.queueAutomationVersion = 3;
    return changed || true;
  }

  function eventDateForRegistration(data) {
    var match = String((data.event || {}).eventId || "").match(/(\d{4})(\d{2})(\d{2})$/);
    if (!match) return null;
    return { year: Number(match[1]), month: Number(match[2]) - 1, day: Number(match[3]) };
  }

  function scheduledRegistrationTime(data, value) {
    var date = eventDateForRegistration(data);
    var time = String(value || "").match(/^(\d{1,2}):(\d{2})$/);
    if (!date || !time) return null;
    return new Date(date.year, date.month, date.day, Number(time[1]), Number(time[2]), 0, 0);
  }

  function defaultDeadlineForAutomaticOpen(data) {
    var openedAt = scheduledRegistrationTime(data, data.registration && data.registration.autoOpenAt);
    if (!openedAt) return null;
    openedAt.setMinutes(openedAt.getMinutes() + DEFAULT_PREREGISTRATION_WINDOW_MINUTES);
    return openedAt.toISOString();
  }

  function registrationAutoOpenDue(data) {
    if (!data || !data.registration || data.registration.phase !== "auto_wait" || !data.registration.autoOpenEnabled || data.started) return false;
    var target = scheduledRegistrationTime(data, data.registration.autoOpenAt);
    return !!target && Date.now() >= target.getTime();
  }

  function registrationDeadlineDue(data) {
    var registration = data && data.registration;
    if (!registration || data.started) return false;
    if (registration.phase !== "open" && registration.phase !== "paused") return false;
    var deadline = registration.preregistrationDeadlineAt ? new Date(registration.preregistrationDeadlineAt).getTime() : NaN;
    return Number.isFinite(deadline) && Date.now() >= deadline;
  }

  function syncRegistrationSchedule(data) {
    if (!data || !data.registration || data.started) return false;
    var changed = false;
    var registration = data.registration;

    if (registrationAutoOpenDue(data)) {
      registration.phase = "open";
      registration.openedAt = new Date().toISOString();
      registration.closedAt = null;
      registration.overrideReason = "automatic";
      registration.preregistrationDeadlineAt = registration.preregistrationDeadlineAt || defaultDeadlineForAutomaticOpen(data);
      appendAction(data, "REGISTRATION_OPENED_AUTOMATICALLY", { preregistrationDeadlineAt: registration.preregistrationDeadlineAt });
      changed = true;
    }

    if (registrationDeadlineDue(data)) {
      registration.phase = "closed";
      registration.closedAt = new Date().toISOString();
      registration.autoOpenEnabled = false;
      registration.overrideReason = "deadline_reached";
      appendAction(data, "REGISTRATION_CLOSED_AUTOMATICALLY", { preregistrationDeadlineAt: registration.preregistrationDeadlineAt });
      changed = true;
    }

    return changed;
  }

  function read() {
    // Some embedded previews deny localStorage. In that case, keep the test
    // queue alive in the open page instead of blocking operational buttons.
    var raw = memoryRaw ||
      safeGet(window.sessionStorage, SESSION_KEY) ||
      safeGet(window.localStorage, STORAGE_KEY);
    var data = parseQueueData(raw) || defaultData();

    // Temporary browser data created by older UI versions used older labels.
    // Keep existing queue records; only normalize current display/routing vocabulary.
    var changed = false;
    data.queues.forEach(function (row) {
      if (row.item === "2샷 포토" || row.item === "2샷 체키") {
        row.item = "투샷 체키";
        changed = true;
      }
      if (row.item === "단체체키") {
        row.item = "단체 촬영";
        row.shootFormat = row.shootFormat || "체키";
        changed = true;
      }
      if (row.item === "이벤트") {
        row.item = "이벤트 특전권";
        changed = true;
      }
      if (!row.quantity) { row.quantity = 1; changed = true; }
      if (typeof row.shootFormat === "undefined") { row.shootFormat = ""; changed = true; }
    });
    if (migrateLegacyQueueIntoPreRegistration(data)) changed = true;
    if (ensureTicketTypeTestSamples(data)) changed = true;
    if (syncRegistrationSchedule(data)) changed = true;
    if (changed) write(data);

    // 이미 시작된 기존 브라우저 세션도 새 자동 호출 규칙으로 버전별 1회 보정한다.
    // 예: "진행 중"인데 현재 호출이 비어 있고 다음 대기자가 남은 각 멤버 레인.
    if (migrateActiveQueueAutomation(data)) write(data);
    return data;
  }

  function write(data) {
    var raw;
    try {
      raw = JSON.stringify(data);
    } catch (error) {
      return false;
    }

    // Always retain the latest state for the current open session.
    memoryRaw = raw;

    // Persist where the preview/browser allows it; neither failure blocks testing.
    var localSaved = safeSet(window.localStorage, STORAGE_KEY, raw);
    var sessionSaved = safeSet(window.sessionStorage, SESSION_KEY, raw);

    var saved = localSaved || sessionSaved || memoryRaw === raw;
    if (saved) emitChange();
    return saved;
  }

  function firstWaiting(data, member) {
    return data.queues
      .filter(function (row) {
        return row.status === "대기중" && (!member || row.member === member);
      })
      .sort(function (a, b) { return Number(a.number) - Number(b.number); })[0] || null;
  }

  function currentCall(data, member) {
    return data.queues
      .filter(function (row) {
        return row.status === "호출중" && (!member || row.member === member);
      })
      .sort(function (a, b) { return Number(a.number) - Number(b.number); })[0] || null;
  }

  function lanePaused(data, member) {
    return Array.isArray(data.pausedMembers) && data.pausedMembers.indexOf(member) !== -1;
  }

  function callFirstIfEligible(data, member, triggeredBy) {
    if (!data.started || data.callClosed || lanePaused(data, member) || currentCall(data, member)) return null;
    var next = firstWaiting(data, member);
    if (!next) return null;
    next.status = "호출중";
    next.callRound = 1;
    next.calledAt = new Date().toISOString();
    next.warning30At = null;
    next.needsResponseCheck = false;
    next.responseCheckAt = null;
    appendAction(data, "AUTO_FIRST_CALL", { number: next.number, member: member, triggeredBy: triggeredBy || null });
    return next;
  }

  function appendAction(data, type, payload) {
    data.actions = Array.isArray(data.actions) ? data.actions : [];
    data.actions.unshift({
      id: "qa_" + Date.now() + "_" + Math.random().toString(16).slice(2),
      createdAt: new Date().toISOString(),
      type: type,
      payload: payload || {}
    });
  }

  function start() {
    var data = read();
    if (data.started) return { ok: false, message: "이미 특전회가 진행 중입니다.", data: data };
    var registrationPhase = (data.registration || {}).phase || "auto_wait";
    if (registrationPhase !== "open" && registrationPhase !== "closed") {
      return { ok: false, message: "사전 접수 마감 또는 진행 중 상태에서만 특전회를 시작할 수 있습니다.", data: data };
    }

    var members = MEMBERS;
    var calledRows = [];

    data.started = true;
    data.queueAutomationVersion = 3;
    data.event.startedAt = new Date().toISOString();
    data.registration.phase = "closed";
    data.registration.closedAt = data.event.startedAt;
    appendAction(data, "REGISTRATION_CLOSED_BY_SPECIAL_START", {});

    members.forEach(function (member) {
      var first = callFirstIfEligible(data, member, "SPECIAL_START");
      if (!first) return;
      calledRows.push(first);
      appendAction(data, "START_AND_FIRST_CALL", { number: first.number, member: member });
    });

    if (!calledRows.length) {
      data.started = false;
      data.event.startedAt = null;
      return { ok: false, message: "호출할 대기자가 없습니다.", data: data };
    }

    if (!write(data)) return { ok: false, message: "브라우저 저장에 실패했습니다.", data: data };
    return { ok: true, data: data, rows: calledRows };
  }

  function firstCall(member) {
    var data = read();
    if (!data.started) return { ok: false, message: "특전회 시작 후 호출할 수 있습니다.", data: data };
    if (!member) return { ok: false, message: "멤버를 확인하지 못했습니다.", data: data };
    var row = callFirstIfEligible(data, member, "MANUAL_EXCEPTION");
    if (!row) return { ok: false, message: member + "은 호출 가능한 대기자가 없습니다.", data: data };
    if (!write(data)) return { ok: false, message: "브라우저 저장에 실패했습니다.", data: data };
    return { ok: true, data: data, row: row };
  }

  function secondCall(number) {
    var data = read();
    var row = data.queues.find(function (item) { return item.number === number; });
    if (!row || row.status !== "호출중") return { ok: false, message: "현재 호출 대상을 찾지 못했습니다.", data: data };
    if (row.callRound >= 2) return { ok: false, message: "이미 2차 호출 상태입니다.", data: data };

    row.callRound = 2;
    row.calledAt = new Date().toISOString();
    row.needsResponseCheck = false;
    row.responseCheckAt = null;
    appendAction(data, "SECOND_CALL", { number: row.number });
    if (!write(data)) return { ok: false, message: "브라우저 저장에 실패했습니다.", data: data };
    return { ok: true, data: data, row: row };
  }

  function arrival(number) {
    var data = read();
    var row = data.queues.find(function (item) { return item.number === number; });
    if (!row || row.status !== "호출중") return { ok: false, message: "도착 확인할 대상을 찾지 못했습니다.", data: data };

    // 도착 확인은 현재 호출된 팬이 현장에 왔음을 확정하고,
    // 특전 사용 · 촬영 목록에 넣은 뒤 같은 멤버의 다음 번호를 자동 호출한다.
    // 앞 특전이 진행 중이어도 도착 확인은 막지 않는다.
    row.status = "진행중";
    row.arrivedAt = new Date().toISOString();
    appendAction(data, "ARRIVAL_CONFIRMED", { number: row.number });

    // A lane may hold one actual processing guest and one pre-called guest.
    // Once the current call enters processing, only the next waiting guest is pre-called.
    var next = callFirstIfEligible(data, row.member, row.number);

    if (!write(data)) return { ok: false, message: "브라우저 저장에 실패했습니다.", data: data };
    return { ok: true, data: data, processing: row, next: next };
  }

  function cancel(number, reason) {
    var data = read();
    var row = data.queues.find(function (item) { return item.number === number; });
    if (!row || row.status !== "호출중") return { ok: false, message: "취소할 대상을 찾지 못했습니다.", data: data };

    row.status = "취소";
    row.cancelledAt = new Date().toISOString();
    row.cancelReason = reason || "운영 사정";
    appendAction(data, "CANCELLED", { number: row.number, reason: row.cancelReason });

    var next = callFirstIfEligible(data, row.member, row.number);

    if (!write(data)) return { ok: false, message: "브라우저 저장에 실패했습니다.", data: data };
    return { ok: true, data: data, next: next, cancelled: row };
  }

  function closeCalls() {
    var data = read();
    if (!data.started) return { ok: false, message: "특전회가 아직 시작되지 않았습니다.", data: data };
    if (data.callClosed) return { ok: false, message: "이미 호출 마감 처리되었습니다.", data: data };

    var cancelled = [];
    data.queues.forEach(function (row) {
      if (row.status !== "대기중") return;
      row.status = "취소";
      row.cancelledAt = new Date().toISOString();
      row.cancelReason = "특전회 운영 시간 마감";
      row.cancelType = "운영 마감 취소";
      row.fanNotice = "특전회 운영 시간이 마감되어 이번 대기는 취소되었어요.";
      cancelled.push(row);
    });

    data.callClosed = true;
    data.callClosedAt = new Date().toISOString();
    data.callClosedCancelledCount = cancelled.length;
    appendAction(data, "CALL_CLOSED", {
      cancelledCount: cancelled.length,
      reason: "특전회 운영 시간 마감"
    });

    if (!write(data)) return { ok: false, message: "브라우저 저장에 실패했습니다.", data: data };
    return { ok: true, data: data, cancelled: cancelled };
  }

  function saveMemo(number, memo) {
    var data = read();
    var row = data.queues.find(function (item) { return item.number === number; });
    if (!row) return { ok: false, message: "저장할 특전 처리 대상을 찾지 못했습니다.", data: data };

    row.memo = typeof memo === "string" ? memo : "";
    row.memoUpdatedAt = new Date().toISOString();
    appendAction(data, "MEMO_SAVED", { number: row.number });

    if (!write(data)) return { ok: false, message: "브라우저 저장에 실패했습니다.", data: data };
    return { ok: true, data: data, row: row };
  }

  function itemLabel(row) {
    if (!row) return "특전권";
    return row.item === "단체 촬영" && row.shootFormat
      ? row.item + " · " + row.shootFormat
      : (row.item || "특전권");
  }

  function isHomeworkCheki(row) {
    return !!row && String(row.item || "").replace(/\s/g, "") === "숙제체키";
  }

  function canRegisterHomeworkCheki(number) {
    var data = read();
    var row = data.queues.find(function (item) { return item.number === number; });
    if (!row || !isHomeworkCheki(row)) return { ok: false, message: "숙제체키 접수 대상을 찾지 못했습니다.", data: data };
    if (row.homeworkReceiptId) return { ok: false, alreadyRegistered: true, message: "이미 접수된 숙제체키입니다.", data: data, row: row };
    return { ok: true, data: data, row: row };
  }

  function registerHomeworkCheki(number, receipt) {
    var eligibility = canRegisterHomeworkCheki(number);
    if (!eligibility.ok) return eligibility;
    var data = eligibility.data;
    var row = eligibility.row;

    var input = receipt || {};
    row.homeworkReceiptId = input.recordId || ("hw_" + Date.now());
    row.homeworkStatus = "접수됨";
    row.homeworkRegisteredAt = input.receivedAt || new Date().toISOString();
    row.homeworkReceiverName = input.receiverName || "담당 스탭";
    row.homeworkMemo = typeof input.memo === "string" ? input.memo : "";
    appendAction(data, "HOMEWORK_CHEKI_REGISTERED", {
      number: row.number,
      recordId: row.homeworkReceiptId,
      receiverName: row.homeworkReceiverName
    });

    if (!write(data)) return { ok: false, message: "브라우저 저장에 실패했습니다.", data: data };
    return { ok: true, data: data, row: row };
  }

  function complete(number) {
    var data = read();
    var row = data.queues.find(function (item) { return item.number === number; });
    if (!row || row.status !== "진행중") return { ok: false, message: "완료 처리할 진행 건을 찾지 못했습니다.", data: data };

    row.status = "완료";
    row.completedAt = new Date().toISOString();
    data.completedCount = Number(data.completedCount || 0) + 1;
    appendAction(data, "COMPLETED", { number: row.number });

    // Completion never creates another first call. In normal flow, the next guest
    // is already the single current call created when this guest arrived.
    if (!write(data)) return { ok: false, message: "브라우저 저장에 실패했습니다.", data: data };
    return { ok: true, data: data, row: row, next: null };
  }

  function setPaused(member, paused) {
    var data = read();
    if (MEMBERS.indexOf(member) === -1) return { ok: false, message: "멤버를 확인하지 못했습니다.", data: data };
    var list = data.pausedMembers;
    var index = list.indexOf(member);
    if (paused && index === -1) list.push(member);
    if (!paused && index !== -1) list.splice(index, 1);
    var next = !paused ? callFirstIfEligible(data, member, "LANE_RESUMED") : null;
    appendAction(data, paused ? "LANE_PAUSED" : "LANE_RESUMED", { member: member });
    if (!write(data)) return { ok: false, message: "브라우저 저장에 실패했습니다.", data: data };
    return { ok: true, data: data, next: next, paused: paused };
  }

  function addRegistration(rowInput) {
    var data = read();
    if (data.callClosed) return { ok: false, message: "호출 마감 후에는 새 대기를 받을 수 없습니다.", data: data };
    if (!data.registration || data.registration.phase !== "open") {
      return { ok: false, message: "현재 사전 접수가 열려 있지 않습니다.", data: data };
    }
    var input = rowInput || {};
    if (MEMBERS.indexOf(input.member) === -1) return { ok: false, message: "멤버를 확인하지 못했습니다.", data: data };
    var nextNumber = data.queues.reduce(function (max, row) { return Math.max(max, Number(row.number) || 0); }, 0) + 1;
    var row = {
      id: "q_" + nextNumber,
      number: String(nextNumber).padStart(3, "0"),
      displayName: input.displayName || "현장 접수",
      lumiId: input.lumiId || "−",
      member: input.member,
      item: input.item || "특전권",
      shootFormat: input.shootFormat || "",
      quantity: Math.max(1, Number(input.quantity || 1)),
      estimateMin: Number(input.estimateMin || 8),
      status: "대기중",
      callRound: 0,
      calledAt: null,
      registeredAt: new Date().toISOString(),
      memo: "",
      warning30At: null,
      needsResponseCheck: false,
      responseCheckAt: null
    };
    data.queues.push(row);
    var first = callFirstIfEligible(data, row.member, "NEW_REGISTRATION");
    appendAction(data, "REGISTERED", { number: row.number, member: row.member });
    if (!write(data)) return { ok: false, message: "브라우저 저장에 실패했습니다.", data: data };
    return { ok: true, data: data, row: row, first: first };
  }

  function deadlineFromConfiguredTime(value) {
    var match = String(value || "").match(/^(?:[01]\d|2[0-3]):[0-5]\d$/);
    if (!match) return null;
    var parts = value.split(":");
    var now = new Date();
    var deadline = new Date(now);
    deadline.setHours(Number(parts[0]), Number(parts[1]), 0, 0);
    // 이미 지난 시각을 설정하면 다음 날 같은 시각으로 계산한다.
    if (deadline.getTime() <= now.getTime()) deadline.setDate(deadline.getDate() + 1);
    return deadline.toISOString();
  }

  function updateRegistration(action) {
    var data = read();
    if (data.started) return { ok: false, message: "특전회가 이미 진행 중입니다.", data: data };
    var registration = data.registration;
    var now = new Date().toISOString();

    if (action === "open") {
      registration.phase = "open";
      registration.openedAt = now;
      registration.pausedAt = null;
      registration.heldAt = null;
      registration.overrideReason = "manual_open";
      registration.closedAt = null;
      registration.autoOpenEnabled = true;
      registration.preregistrationDeadlineAt = deadlineFromConfiguredTime(registration.autoOpenAt);
      appendAction(data, "REGISTRATION_OPENED_MANUALLY", { preregistrationDeadlineAt: registration.preregistrationDeadlineAt });
    } else if (action === "hold") {
      registration.phase = "held";
      registration.heldAt = now;
      registration.overrideReason = "held";
      appendAction(data, "REGISTRATION_AUTO_OPEN_HELD", {});
    } else if (action === "pause") {
      if (registration.phase !== "open") return { ok: false, message: "진행 중인 사전 접수만 일시정지할 수 있습니다.", data: data };
      registration.phase = "paused";
      registration.pausedAt = now;
      registration.overrideReason = "paused";
      appendAction(data, "REGISTRATION_PAUSED", {});
    } else if (action === "resume") {
      if (registration.phase !== "paused") return { ok: false, message: "일시정지 상태에서만 재개할 수 있습니다.", data: data };
      registration.phase = "open";
      registration.openedAt = registration.openedAt || now;
      registration.pausedAt = null;
      registration.overrideReason = "resumed";
      registration.closedAt = null;
      appendAction(data, "REGISTRATION_RESUMED", {});
    } else if (action === "resumeAuto") {
      registration.phase = "auto_wait";
      registration.heldAt = null;
      registration.pausedAt = null;
      registration.closedAt = null;
      registration.preregistrationDeadlineAt = null;
      registration.autoOpenEnabled = true;
      registration.overrideReason = null;
      appendAction(data, "REGISTRATION_AUTO_OPEN_RESUMED", {});
    } else {
      return { ok: false, message: "처리할 제어값을 확인하지 못했습니다.", data: data };
    }

    if (!write(data)) return { ok: false, message: "브라우저 저장에 실패했습니다.", data: data };
    return { ok: true, data: data, action: action };
  }

  function setAutoOpenTime(value) {
    var data = read();
    if (data.started) return { ok: false, message: "특전회 진행 중에는 자동 오픈 시간을 변경할 수 없습니다.", data: data };
    var registration = data.registration || {};
    var match = String(value || "").match(/^(?:[01]\d|2[0-3]):[0-5]\d$/);
    if (!match) return { ok: false, message: "자동 오픈 시간을 확인해 주세요.", data: data };
    registration.autoOpenAt = value;
    registration.autoOpenEnabled = true;
    registration.overrideReason = "time_changed";
    // 접수 중/일시정지 중에는 이 값이 곧 사전 접수 마감 시각이다.
    if (registration.phase === "open" || registration.phase === "paused") {
      registration.preregistrationDeadlineAt = deadlineFromConfiguredTime(value);
    }
    appendAction(data, "REGISTRATION_AUTO_OPEN_TIME_CHANGED", {
      autoOpenAt: value,
      preregistrationDeadlineAt: registration.preregistrationDeadlineAt
    });
    if (!write(data)) return { ok: false, message: "브라우저 저장에 실패했습니다.", data: data };
    return { ok: true, data: data, autoOpenAt: value };
  }

  function advanceAutomaticCalls() {
    var data = read();
    if (!data.started) return { changed: false, data: data, notices: [] };
    var now = Date.now();
    var changed = false;
    var notices = [];
    data.queues.filter(function (row) { return row.status === "호출중"; }).forEach(function (row) {
      // "다음 호출 일시정지"는 새 1차 호출만 막는다.
      // 이미 호출된 팬의 1차·2차·자동 취소 시계는 계속 진행한다.
      var elapsed = Math.floor((now - new Date(row.calledAt).getTime()) / 1000);
      if (row.callRound === 1 && elapsed >= FIRST_CALL_SECONDS) {
        row.callRound = 2;
        row.calledAt = new Date().toISOString();
        row.warning30At = null;
        appendAction(data, "AUTO_SECOND_CALL", { number: row.number, member: row.member });
        changed = true;
        return;
      }
      if (row.callRound === 2 && elapsed >= SECOND_CALL_SECONDS && !row.needsResponseCheck) {
        // 2차 호출 후에는 자동 취소하지 않는다.
        // 현장 확인이 필요한 특전회 특성상 스탭이 도착/미응답을 직접 선택한다.
        row.needsResponseCheck = true;
        row.responseCheckAt = new Date().toISOString();
        notices.push({ member: row.member, number: row.number, displayName: row.displayName });
        appendAction(data, "NO_SHOW_RESPONSE_CHECK_REQUIRED", { number: row.number, member: row.member });
        changed = true;
      }
    });
    if (changed) write(data);
    return { changed: changed, data: data, notices: notices };
  }

  return {
    read: read,
    start: start,
    firstCall: firstCall,
    secondCall: secondCall,
    arrival: arrival,
    cancel: cancel,
    closeCalls: closeCalls,
    complete: complete,
    saveMemo: saveMemo,
    setPaused: setPaused,
    addRegistration: addRegistration,
    updateRegistration: updateRegistration,
    setAutoOpenTime: setAutoOpenTime,
    advanceAutomaticCalls: advanceAutomaticCalls,
    itemLabel: itemLabel,
    isHomeworkCheki: isHomeworkCheki,
    canRegisterHomeworkCheki: canRegisterHomeworkCheki,
    registerHomeworkCheki: registerHomeworkCheki,
    getByNumber: function (number) {
      return read().queues.find(function (row) { return String(row.number) === String(number); }) || null;
    },
    isPaused: function (member) { return lanePaused(read(), member); }
  };
})();

window.LumiApps.queue = function () {
  setTimeout(bindQueueApp, 0);
  var data = QueueStore.read();
  var initialFilter = window.__lumibelleQueueFocusMember || "전체";
  var view = window.__lumibelleQueueView || "management";
  window.__lumibelleQueueFocusMember = null;
  window.__lumibelleQueueView = "management";
  return '<section class="queue-app" data-queue-app data-queue-view="' + escapeQueue(view) + '">' + renderQueueApp(data, initialFilter, false, view) + '</section>';
};

function renderQueueApp(data, activeFilter, showExceptionControls, view) {
  if (data.started) return renderQueueActive(data, activeFilter || "전체");
  if (view === "overview") return renderQueueWaitingOverview(data);
  return renderQueuePrestart(data, !!showExceptionControls);
}


function getQueueOverviewStateCopy(phase) {
  if (phase === "open") {
    return {
      heroTitle: '특전회 시작을<br><em>기다리고 있습니다</em>',
      heroCopy: '준비가 완료되면 <b>[특전회 시작]</b>을 눌러주세요.',
      helper: 'ⓘ 시작 전에는 아직 호출이 진행되지 않습니다.',
      note: '사전 접수 중 · 새 등록은 특전회 시작 전까지 반영됩니다.',
      buttonLabel: '특전회 시작'
    };
  }
  if (phase === "paused") {
    return {
      heroTitle: '새 접수를 잠시<br><em>멈춰두었어요</em>',
      heroCopy: '기존 대기 정보는 유지되고, 새 신청만 잠시 받지 않아요.',
      helper: 'ⓘ 접수를 다시 열거나 마감 처리한 뒤 특전회를 시작해주세요.',
      note: '사전 접수가 일시정지되어 있어도 현재 대기열은 그대로 확인할 수 있어요.',
      buttonLabel: '사전 접수 재개 필요'
    };
  }
  if (phase === "held") {
    return {
      heroTitle: '자동 오픈이<br><em>보류되었어요</em>',
      heroCopy: '현장 상황을 확인한 뒤 사전 접수를 열어주세요.',
      helper: 'ⓘ 보류 중에는 팬이 새 대기를 신청할 수 없습니다.',
      note: '자동 오픈 보류 상태예요. 현재까지 등록된 대기 정보만 확인할 수 있어요.',
      buttonLabel: '사전 접수 열기 필요'
    };
  }
  if (phase === "closed") {
    return {
      heroTitle: '최종 접수가<br><em>완료되었어요</em>',
      heroCopy: '멤버별 대기 현황을 확인한 뒤 특전회를 시작해주세요.',
      helper: 'ⓘ 신규 접수는 마감되었고, 기존 대기 정보만 유지됩니다.',
      note: '사전 접수 마감 · 특전회 시작 대기 상태예요.',
      buttonLabel: '특전회 시작'
    };
  }
  return {
    heroTitle: '사전 접수 시작을<br><em>기다리고 있어요</em>',
    heroCopy: '설정된 시간에 맞춰 팬 사전 접수가 자동으로 열립니다.',
    helper: 'ⓘ 접수가 시작되면 대기 등록 수가 실시간으로 반영됩니다.',
    note: '자동 오픈 전이에요. 현재까지 등록된 대기 정보만 확인할 수 있어요.',
    buttonLabel: '사전 접수 시작 전'
  };
}

function renderQueueWaitingOverview(data) {
  var registration = data.registration || {};
  var phase = registration.phase || "auto_wait";
  var counts = memberCounts(data);
  var total = activeCount(data);
  var totalLabel = "현재 대기 등록 수";
  var overviewState = getQueueOverviewStateCopy(phase);
  var note = overviewState.note;
  var startAllowed = (phase === "open" || phase === "closed") ? "" : " disabled";
  var startLabel = (phase === "open" || phase === "closed") ? "특전회 시작" : overviewState.buttonLabel;

  return (
    '<header class="queue-titlebar">' +
      '<div class="queue-title"><h2>대기 현황</h2></div>' +
      '<div class="queue-event-line"><span>루미벨 데뷔 라이브</span><b>' + escapeQueue(data.event.specialTime) + '</b></div>' +
    '</header>' +
    '<div class="queue-top-divider" aria-hidden="true"></div>' +
    '<section class="queue-event-card" aria-label="오늘 공연 정보">' +
      '<div><span>오늘 공연</span><strong>' + escapeQueue(data.event.title || "Lumibelle Debut Live") + '</strong></div>' +
      '<div><span>특전회 예정 시간</span><strong class="is-pink">' + escapeQueue(data.event.specialTime || "19:00 ~ 21:30") + '</strong></div>' +
      '<div><span>현재 상태</span><strong><em class="queue-status-pill is-prestart">' + (phase === "open" ? "접수 중" : (phase === "paused" ? "접수 일시정지" : (phase === "held" ? "자동 오픈 보류" : (phase === "closed" ? "접수 마감" : "시작 전")))) + '</em></strong></div>' +
    '</section>' +
    '<section class="queue-waiting-hero">' +
      '<h3>' + overviewState.heroTitle + '</h3>' +
      '<p>' + overviewState.heroCopy + '</p>' +
      '<small>' + overviewState.helper + '</small>' +
    '</section>' +
    '<section class="queue-panel" aria-label="대기 현황">' +
      '<header><strong>대기 현황</strong></header>' +
      '<div class="queue-prestart-summary">' +
        '<div class="queue-total-wait"><span>' + totalLabel + '</span><b>' + total + '<em>명</em></b><small>◷ 마지막 등록 시각 ' + lastRegistration(data) + '</small></div>' +
        '<div class="queue-member-counts">' + ["마리링", "루루", "이로", "루나"].map(function (member) { return '<div><span>' + member + '</span><b>' + counts[member] + '<em>명</em></b></div>'; }).join("") + '</div>' +
      '</div>' +
    '</section>' +
    '<section class="queue-panel queue-rule-panel" aria-label="운영 안내">' +
      '<header><strong>운영 안내</strong></header>' +
      '<div class="queue-rule-grid">' +
        '<div><b>①</b><strong>특전회 시작 시</strong><p>첫 대기번호가<br><em>자동 호출됩니다.</em></p></div>' +
        '<div><b>3분</b><strong>1차 호출</strong><p>1차 호출 후<br><em>3분간 대기합니다.</em></p></div>' +
        '<div><b>2분</b><strong>미도착 시 2차 호출</strong><p>1차 호출 미도착 시<br><em>2차 호출을 진행합니다.</em></p></div>' +
        '<div><b>!</b><strong>2차 후 미응답</strong><p>2차 호출 후 2분이 지나면<br><em>스탭 확인이 필요합니다.</em></p></div>' +
      '</div>' +
    '</section>' +
    '<p class="queue-overview-note">' + note + '</p>' +
    '<button type="button" class="queue-primary-button" data-queue-start' + startAllowed + '>' + startLabel + '</button>' +
    renderQueueModal()
  );
}

function formatRegistrationTime(value) {
  var match = String(value || "19:30").match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return String(value || "19:30");
  var hour = Number(match[1]);
  var minute = match[2];
  var period = hour < 12 ? "오전" : "오후";
  var displayHour = hour % 12 || 12;
  return period + " " + displayHour + ":" + minute;
}

function formatQueueClock(date) {
  var hours = date.getHours();
  var minutes = String(date.getMinutes()).padStart(2, "0");
  var seconds = String(date.getSeconds()).padStart(2, "0");
  var period = hours < 12 ? "오전" : "오후";
  var displayHour = hours % 12 || 12;
  return period + " " + displayHour + ":" + minutes + ":" + seconds;
}

function renderQueuePrestartOperationsInfo(data, formattedTime) {
  var currentRegistrations = activeCount(data);
  return '<section class="queue-prereg-operations" aria-label="운영 정보">' +
    '<h3>운영 정보</h3>' +
    '<div class="queue-prereg-operations-row"><span>예정 시작 시간</span><b>' + escapeQueue(formattedTime) + '</b></div>' +
    '<div class="queue-prereg-operations-row"><span>현재 접수된 총 인원</span><b>' + currentRegistrations + '명</b></div>' +
    '<div class="queue-prereg-operations-row"><span>현재 시간</span><b data-queue-prereg-clock>' + formatQueueClock(new Date()) + '</b></div>' +
  '</section>';
}

function formatPreRegistrationCountdown(value) {
  var end = value ? new Date(value).getTime() : NaN;
  var remaining = Number.isFinite(end) ? Math.max(0, Math.floor((end - Date.now()) / 1000)) : 0;
  var hours = String(Math.floor(remaining / 3600)).padStart(2, "0");
  var minutes = String(Math.floor((remaining % 3600) / 60)).padStart(2, "0");
  var seconds = String(remaining % 60).padStart(2, "0");
  return hours + ":" + minutes + ":" + seconds;
}

function renderPreRegistrationCountdown(registration, phase) {
  if (phase !== "open") return "";
  var deadline = registration.preregistrationDeadlineAt || "";
  return '<section class="queue-prereg-countdown" aria-label="사전 접수 마감까지 남은 시간">' +
    '<span>마감까지 남은 시간</span>' +
    '<strong data-queue-prereg-countdown data-deadline="' + escapeQueue(deadline) + '">' + formatPreRegistrationCountdown(deadline) + '</strong>' +
  '</section>';
}

function renderQueuePrestart(data, showExceptionControls) {
  var registration = data.registration || {};
  var phase = registration.phase || "auto_wait";
  var heroTitle = phase === "open" ? '사전 접수가<br><em>진행 중이에요</em>'
    : (phase === "paused" ? '사전 접수가<br><em>일시정지되었어요</em>'
      : (phase === "held" ? '자동 오픈이<br><em>보류 중이에요</em>'
        : (phase === "closed" ? '최종 접수가<br><em>완료되었어요</em>'
          : '자동 오픈을<br><em>기다리고 있어요</em>')));
  var heroDescription = phase === "open"
    ? '팬이 특전회 대기를 신청할 수 있어요.'
    : (phase === "paused" ? '팬 신규 접수가 잠시 멈춘 상태예요.'
      : (phase === "held" ? '자동 오픈이 보류되어 있습니다.'
        : (phase === "closed" ? '신규 접수는 마감되었어요. 대기 현황을 확인해주세요.'
          : '설정된 시간에 맞춰<br>자동으로 접수가 시작됩니다.')));
  var settingNote = phase === "open"
    ? '특전회 시작 전까지 신규 접수가 진행됩니다.'
    : (phase === "paused" ? '현재 신규 접수가 일시정지되어 있습니다.'
      : (phase === "held" ? '자동 오픈이 보류되어 있습니다.'
        : (phase === "closed" ? '사전 접수가 마감되었어요. 대기 현황에서 특전회를 시작할 수 있습니다.'
          : '설정된 시간에 자동으로 접수가 시작됩니다.')));
  var controls = showExceptionControls ? renderRegistrationExceptionControls(phase) : "";
  var formattedTime = formatRegistrationTime(registration.autoOpenAt || "19:30");

  return (
    '<header class="queue-titlebar queue-prereg-titlebar">' +
      '<div class="queue-title"><h2>특전회 대기</h2></div>' +
      '<p>사전 접수 운영</p>' +
    '</header>' +
    '<div class="queue-top-divider" aria-hidden="true"></div>' +
    '<article class="queue-prereg-hero">' +
      '<div class="queue-prereg-art-slot" data-image-slot="queue-registration-hero" aria-label="이미지 자리"></div>' +
      '<div class="queue-prereg-hero-copy">' +
        '<h3>' + heroTitle + '</h3>' +
        '<p>' + heroDescription + '</p>' +
      '</div>' +
    '</article>' +
    renderPreRegistrationCountdown(registration, phase) +
    renderQueuePrestartOperationsInfo(data, formattedTime) +
    '<button type="button" class="queue-auto-setting" data-queue-registration-settings aria-expanded="' + (showExceptionControls ? "true" : "false") + '">' +
      '<span class="queue-auto-setting-title">자동 오픈 설정</span>' +
      '<span class="queue-auto-setting-row queue-auto-setting-time" data-queue-time-edit role="button" tabindex="0" aria-label="자동 오픈 시간 변경"><b>자동 오픈 시간</b><strong>' + escapeQueue(formattedTime) + '</strong><i aria-hidden="true">›</i></span>' +
      '<span class="queue-auto-setting-row"><b>자동 오픈 상태</b><em>' + (registration.autoOpenEnabled ? "활성화" : "꺼짐") + '</em></span>' +
    '</button>' +
    controls +
    '<p class="queue-prereg-note">' + settingNote + '</p>' +
    '<button type="button" class="queue-primary-button" data-queue-go-overview>대기 현황 확인하기</button>' +
    renderQueueModal() +
    renderQueueAutoTimeEditor(registration)
  );
}

function renderRegistrationExceptionControls(phase) {
  var title = "";
  var copy = "";
  var first = "";
  var second = "";

  if (phase === "auto_wait") {
    title = "사전 접수는 아직 열리지 않았어요.";
    copy = "설정된 시간에 자동으로 시작됩니다.";
    first = '<button type="button" data-queue-registration-action="open">지금 사전 접수 열기</button>';
    second = '<button type="button" data-queue-registration-action="hold">자동 오픈 보류</button>';
  } else if (phase === "held") {
    title = "자동 오픈이 보류된 상태예요.";
    copy = "팬은 아직 사전 접수를 할 수 없습니다.";
    first = '<button type="button" data-queue-registration-action="resumeAuto">자동 오픈 다시 켜기</button>';
    second = '<button type="button" data-queue-registration-action="open">지금 사전 접수 열기</button>';
  } else if (phase === "paused") {
    title = "새 접수만 잠시 멈춘 상태예요.";
    copy = "이미 접수한 팬의 대기 정보는 유지됩니다.";
    first = '<button type="button" data-queue-registration-action="resume">새 접수 다시 열기</button>';
    second = '<button type="button" data-queue-time-edit>마감 시간 변경</button>';
  } else {
    title = "팬이 현재 특전회 대기를 신청할 수 있어요.";
    copy = "마감 시간 전까지 신규 접수가 가능합니다.";
    first = '<button type="button" data-queue-registration-action="pause">새 접수 일시정지</button>';
    second = '<button type="button" data-queue-time-edit>마감 시간 변경</button>';
  }

  return '<section class="queue-exception-controls" data-queue-exception-controls>' +
    '<header><strong>예외 제어</strong><span>자동 흐름을 일시적으로 바꿉니다.</span></header>' +
    '<p class="queue-exception-guidance"><b>' + title + '</b><span>' + copy + '</span></p>' +
    '<div>' + first + second + '</div>' +
  '</section>';
}

function renderQueueActive(data, activeFilter) {
  var selectedMember = activeFilter !== "전체" ? activeFilter : null;
  var current = currentQueue(data, selectedMember);
  var allCalling = data.queues.filter(function (row) { return row.status === "호출중"; });
  var counts = memberCounts(data);
  var inProgress = data.queues.filter(function (row) { return row.status === "진행중"; });
  var filterLabels = ["전체", "마리링", "루루", "이로", "루나"];

  return (
    '<header class="queue-titlebar">' +
      '<div class="queue-title"><h2>특전회 대기</h2>' + (data.callClosed ? '<span class="queue-call-closed-label">호출 마감됨</span>' : '<button type="button" class="queue-call-close-button" data-queue-call-close>호출 마감</button>') + '</div>' +
      '<div class="queue-event-line"><span>' + (data.callClosed ? '호출 마감 처리 중' : '이벤트 진행 중') + '</span><b>' + escapeQueue(data.event.specialTime) + '</b></div>' +
    '</header>' +
    '<section class="queue-dashboard">' +
      '<article><span>전체 대기</span><b data-queue-active-count>' + activeCount(data) + '<em>명</em></b><small>예상 대기 ' + estimatedWait(data) + '분</small></article>' +
      '<article class="is-current"><span>' + (selectedMember ? selectedMember + ' 호출' : '호출 레인') + '</span><b data-queue-current-number>' + (selectedMember ? (current ? current.number : "−") : allCalling.length) + '<em>' + (selectedMember ? '번' : '명') + '</em></b><small>' + (selectedMember ? (current ? '현재 호출 중' : '호출 대기 없음') : '멤버별 독립 호출') + '</small></article>' +
      '<article><span>완료</span><b data-queue-completed-count>' + Number(data.completedCount || 0) + '<em>명</em></b><small>오늘 완료</small></article>' +
    '</section>' +
    (inProgress.length ? renderProgressStrip(inProgress) : '') +
    '<div class="queue-filter-tabs" role="tablist">' +
      filterLabels.map(function (label) {
        return '<button type="button" class="' + (label === activeFilter ? 'is-active' : '') + '" data-queue-filter="' + label + '"><span>' + label + '</span></button>';
      }).join('') +
    '</div>' +
    renderLaneControl(data, selectedMember) +
    (current ? renderCurrentCallCard(current, data, selectedMember) : renderNoCurrentCall(selectedMember, data)) +
    '<section class="queue-list-section">' +
      '<header><strong>' + (selectedMember ? selectedMember + ' 다음 대기' : '전체 대기') + '</strong><span data-queue-list-count>0건</span></header>' +
      '<div class="queue-list" data-queue-list></div>' +
      '<button type="button" class="queue-list-more" data-queue-expand-list hidden>전체 대기 보기 <span>›</span></button>' +
    '</section>' +
    '<article class="queue-panel queue-active-guide">' +
      '<header><span>♡</span><strong>' + (data.callClosed ? '호출 마감 안내' : '대기 안내') + '</strong></header>' +
      (data.callClosed
        ? '<ul><li>새 대기번호는 더 이상 호출되지 않습니다.</li><li>이미 호출되었거나 진행 중인 팬만 계속 처리합니다.</li><li>미호출 대기 ' + Number(data.callClosedCancelledCount || 0) + '건은 운영 마감 취소로 기록됩니다.</li></ul>'
        : '<ul><li>1차 호출은 3분 뒤 자동으로 2차 호출됩니다.</li><li>도착 확인 시 다음 대기번호가 자동으로 1차 호출됩니다.</li><li>2차 호출 후 2분 미응답이면 스탭 확인이 필요합니다.</li></ul>') +
    '</article>' +
    renderQueueModal()
  );
}

function queueMemberCount(member, count) {
  return '<div><span>' + member + '</span><b>' + count + '<em>명</em></b></div>';
}

function queueRule(icon, title, body1, body2) {
  return '<div><b>' + icon + '</b><strong>' + title + '</strong><p>' + body1 + '<br><em>' + body2 + '</em></p></div>';
}

function renderProgressStrip(rows) {
  return '<section class="queue-progress-strip"><div><span>진행 중</span><strong>' + rows.map(function (row) { return '#' + row.number + ' · ' + escapeQueue(row.displayName); }).join(' / ') + '</strong></div><em>특전 사용 화면에서 완료 처리</em></section>';
}

function renderCurrentCallCard(row, data, selectedMember) {
  var action = '<button type="button" class="queue-arrival-button" data-queue-arrival="' + row.number + '">도착 확인</button>';
  var cancelAction = row.needsResponseCheck
    ? '<button type="button" class="queue-cancel-button" data-queue-cancel="' + row.number + '">호출 미응답 취소</button>'
    : '';

  return (
    '<article class="queue-current-card" data-queue-current-card>' +
      '<header><span class="queue-call-state" data-queue-call-state>' + callStateText(row) + '</span><strong>' + (selectedMember ? '현재 호출' : escapeQueue(row.member) + ' 현재 호출') + '</strong>' + (row.needsResponseCheck ? '' : '<b data-queue-timer>' + formatRemaining(row) + '</b>') + '</header>' +
      '<div class="queue-current-main">' +
        '<div class="queue-number-box"><b>' + row.number + '</b><span>대기번호</span></div>' +
        '<div class="queue-fan-box"><span>닉네임</span><strong>' + escapeQueue(row.displayName) + '</strong><em>' + escapeQueue(row.lumiId) + '</em></div>' +
        '<div class="queue-meta-box"><span>선택 멤버</span><strong>' + escapeQueue(row.member) + '</strong></div>' +
        '<div class="queue-meta-box"><span>참여 내용</span><strong>' + escapeQueue(QueueStore.itemLabel(row)) + '</strong></div>' +
        '<div class="queue-meta-box"><span>예상 시간</span><strong>' + row.estimateMin + '분</strong></div>' +
      '</div>' +
      '<div class="queue-current-actions' + (cancelAction ? ' is-response-check' : '') + '">' +
        action + cancelAction +
      '</div>' +
      '<p class="queue-call-note" data-queue-call-note>' + callNote(row) + '</p>' +
    '</article>'
  );
}

function renderNoCurrentCall(member, data) {
  var paused = member && QueueStore.isPaused(member);
  var title = member ? member + ' 현재 호출이 없습니다.' : '현재 호출할 대기자가 없습니다.';
  var copy = data.callClosed
    ? '호출 마감 처리되어 새 대기번호는 호출되지 않습니다.'
    : (paused
      ? '다음 호출이 일시정지되어 있습니다. 재개하면 가장 앞 대기자가 자동 호출됩니다.'
      : (member ? '대기자가 들어오면 자동으로 1차 호출됩니다.' : '멤버 탭을 열어 각 레인의 호출 상태를 확인해주세요.'));
  return '<article class="queue-current-card is-empty"><strong>' + title + '</strong><p>' + copy + '</p></article>';
}

function renderLaneControl(data, member) {
  if (!member) return '';
  if (data.callClosed) return '<div class="queue-lane-control is-call-closed"><span>' + escapeQueue(member) + ' 새 호출 마감됨</span></div>';
  var paused = QueueStore.isPaused(member);
  return '<div class="queue-lane-control">' +
    '<span>' + escapeQueue(member) + ' 다음 호출 ' + (paused ? '일시정지 중' : '자동 호출 중') + '</span>' +
    '<button type="button" data-queue-pause-member="' + escapeQueue(member) + '" data-queue-pause-value="' + (paused ? 'resume' : 'pause') + '">' + (paused ? '호출 재개' : '다음 호출 일시정지') + '</button>' +
  '</div>';
}

function renderQueueRow(row) {
  return (
    '<button type="button" class="queue-row" data-queue-row="' + row.number + '" data-member="' + escapeQueue(row.member) + '">' +
      '<b>' + row.number + '</b>' +
      '<span><em>닉네임</em><strong>' + escapeQueue(row.displayName) + '</strong></span>' +
      '<span><em>선택 멤버</em><strong>' + escapeQueue(row.member) + '</strong></span>' +
      '<span><em>종류</em><strong>' + escapeQueue(QueueStore.itemLabel(row)) + '</strong></span>' +
      '<span><em>예상 시간</em><strong>' + row.estimateMin + '분</strong></span>' +
      '<i>' + row.status + '</i>' +
    '</button>'
  );
}

function renderQueueAutoTimeEditor(registration) {
  var value = String((registration && registration.autoOpenAt) || "19:30");
  var match = value.match(/^(\d{1,2}):(\d{2})$/) || [null, "19", "30"];
  var hour24 = Number(match[1]);
  var minute = match[2];
  var period = hour24 < 12 ? "am" : "pm";
  var hour12 = hour24 % 12 || 12;
  var hourOptions = Array.from({ length: 12 }, function (_, index) {
    var hour = index + 1;
    return '<option value="' + hour + '"' + (hour === hour12 ? ' selected' : '') + '>' + hour + '시</option>';
  }).join("");
  var minuteOptions = ["00", "10", "20", "30", "40", "50"].map(function (item) {
    return '<option value="' + item + '"' + (item === minute ? ' selected' : '') + '>' + item + '분</option>';
  }).join("");
  return '<section class="queue-time-editor" data-queue-time-editor hidden aria-hidden="true">' +
    '<div class="queue-time-editor-backdrop" data-queue-time-editor-close></div>' +
    '<article class="queue-time-editor-card" role="dialog" aria-modal="true" aria-labelledby="queue-time-editor-title">' +
      '<span class="queue-time-editor-kicker">자동 오픈 설정</span>' +
      '<h3 id="queue-time-editor-title">자동 오픈 시간 변경</h3>' +
      '<p>설정한 시간에 팬 사전 접수가 자동으로 열립니다.</p>' +
      '<div class="queue-time-editor-fields">' +
        '<label><span>오전 / 오후</span><select data-queue-time-period><option value="am"' + (period === "am" ? " selected" : "") + '>오전</option><option value="pm"' + (period === "pm" ? " selected" : "") + '>오후</option></select></label>' +
        '<label><span>시</span><select data-queue-time-hour>' + hourOptions + '</select></label>' +
        '<label><span>분</span><select data-queue-time-minute>' + minuteOptions + '</select></label>' +
      '</div>' +
      '<div class="queue-time-editor-actions"><button type="button" data-queue-time-editor-close>취소</button><button type="button" data-queue-time-editor-apply>시간 적용</button></div>' +
    '</article>' +
  '</section>';
}

function renderQueueModal() {
  return (
    '<section class="queue-modal" data-queue-modal hidden>' +
      '<div class="queue-modal-backdrop" data-queue-modal-close></div>' +
      '<article class="queue-modal-card">' +
        '<span data-queue-modal-eyebrow>시작 전 확인</span>' +
        '<h3 data-queue-modal-title>특전회를 시작할까요?</h3>' +
        '<p data-queue-modal-copy>첫 번째 대기번호가 자동으로 1차 호출됩니다.</p>' +
        '<div class="queue-modal-summary" data-queue-modal-summary></div>' +
        '<div class="queue-modal-actions">' +
          '<button type="button" data-queue-modal-close>취소</button>' +
          '<button type="button" data-queue-modal-confirm>확정</button>' +
        '</div>' +
      '</article>' +
    '</section>' +
    '<div class="queue-toast" data-queue-toast hidden role="status" aria-live="polite"></div>'
  );
}

function bindQueueApp() {
  var root = document.querySelector("[data-queue-app]");
  if (!root || root.getAttribute("data-queue-bound") === "true") return;
  root.setAttribute("data-queue-bound", "true");

  var state = {
    data: QueueStore.read(),
    modal: null,
    activeFilter: (root.querySelector("[data-queue-filter].is-active") || {}).getAttribute ? root.querySelector("[data-queue-filter].is-active").getAttribute("data-queue-filter") : "전체",
    listExpanded: false,
    exceptionOpen: false,
    view: root.getAttribute("data-queue-view") || "management"
  };

  window.clearInterval(window.__lumibelleQueueTicker);
  window.__lumibelleQueueTicker = window.setInterval(function () {
    if (!document.body.contains(root)) {
      window.clearInterval(window.__lumibelleQueueTicker);
      return;
    }
    // 화면은 초 단위 카운트만 갱신한다.
    // 1차→2차·자동 취소 상태 전환은 아래의 공통 자동 실행기 한 곳에서만 처리한다.
    refreshQueueTimers(root, state);
  }, 1000);

  renderQueueList(root, state);

  root.addEventListener("click", function (event) {
    if (event.target.closest("[data-queue-time-edit]")) {
      event.preventDefault();
      event.stopPropagation();
      openQueueTimeEditor(root);
      return;
    }

    if (event.target.closest("[data-queue-time-editor-close]")) {
      closeQueueTimeEditor(root);
      return;
    }

    if (event.target.closest("[data-queue-time-editor-apply]")) {
      var timeResult = applyQueueTimeEditor(root);
      if (!timeResult.ok) { showQueueToast(root, timeResult.message); return; }
      state.data = timeResult.data;
      closeQueueTimeEditor(root);
      renderQueueRoot(root, state);
      showQueueToast(root, "자동 오픈 시간을 " + formatRegistrationTime(timeResult.autoOpenAt) + "으로 변경했습니다.");
      return;
    }

    if (event.target.closest("[data-queue-registration-settings]")) {
      state.exceptionOpen = !state.exceptionOpen;
      renderQueueRoot(root, state);
      return;
    }

    var registrationAction = event.target.closest("[data-queue-registration-action]");
    if (registrationAction) {
      openQueueModal(root, state, { type: "registration", action: registrationAction.getAttribute("data-queue-registration-action") });
      return;
    }

    if (event.target.closest("[data-queue-go-overview]")) {
      // 사전 접수 관리에서는 실제 시작을 하지 않고, 최종 확인용 대기 현황 화면으로 이동한다.
      window.__lumibelleQueueView = "overview";
      if (window.StaffOS && typeof window.StaffOS.openApp === "function") {
        window.StaffOS.openApp("queue");
      } else {
        state.view = "overview";
        state.exceptionOpen = false;
        renderQueueRoot(root, state);
      }
      return;
    }

    if (event.target.closest("[data-queue-start]")) {
      openQueueModal(root, state, { type: "start" });
      return;
    }

    if (event.target.closest("[data-queue-call-close]")) {
      openQueueModal(root, state, { type: "callClose" });
      return;
    }

    var pauseControl = event.target.closest("[data-queue-pause-member]");
    if (pauseControl) {
      var member = pauseControl.getAttribute("data-queue-pause-member");
      var shouldPause = pauseControl.getAttribute("data-queue-pause-value") === "pause";
      var pauseResult = QueueStore.setPaused(member, shouldPause);
      if (!pauseResult.ok) { showQueueToast(root, pauseResult.message); return; }
      state.data = pauseResult.data;
      renderQueueRoot(root, state);
      showQueueToast(root, member + (shouldPause ? " 다음 호출을 일시정지했습니다." : " 호출을 재개했습니다."));
      return;
    }

    var arrival = event.target.closest("[data-queue-arrival]");
    if (arrival) {
      openQueueModal(root, state, { type: "arrival", number: arrival.getAttribute("data-queue-arrival") });
      return;
    }

    var cancel = event.target.closest("[data-queue-cancel]");
    if (cancel) {
      openQueueModal(root, state, { type: "cancel", number: cancel.getAttribute("data-queue-cancel"), reason: "호출 미응답" });
      return;
    }

    var filter = event.target.closest("[data-queue-filter]");
    if (filter) {
      state.activeFilter = filter.getAttribute("data-queue-filter");
      state.listExpanded = false;
      setQueueFilter(root, state);
      return;
    }

    if (event.target.closest("[data-queue-expand-list]")) {
      state.listExpanded = !state.listExpanded;
      renderQueueList(root, state);
      return;
    }

    if (event.target.closest("[data-queue-modal-close]")) {
      closeQueueModal(root, state);
      return;
    }

    if (event.target.closest("[data-queue-modal-confirm]")) {
      confirmQueueModal(root, state);
    }
  });
}

function openQueueTimeEditor(root) {
  var layer = root.querySelector("[data-queue-time-editor]");
  if (!layer) return;
  layer.hidden = false;
  layer.setAttribute("aria-hidden", "false");
}

function closeQueueTimeEditor(root) {
  var layer = root.querySelector("[data-queue-time-editor]");
  if (!layer) return;
  layer.hidden = true;
  layer.setAttribute("aria-hidden", "true");
}

function applyQueueTimeEditor(root) {
  var layer = root.querySelector("[data-queue-time-editor]");
  if (!layer) return { ok: false, message: "시간 변경 창을 찾을 수 없습니다." };
  var period = (layer.querySelector("[data-queue-time-period]") || {}).value;
  var hour = Number((layer.querySelector("[data-queue-time-hour]") || {}).value);
  var minute = String((layer.querySelector("[data-queue-time-minute]") || {}).value || "");
  if (!hour || !/^(00|10|20|30|40|50)$/.test(minute)) return { ok: false, message: "시간을 확인해 주세요." };
  var hour24 = period === "pm" ? (hour === 12 ? 12 : hour + 12) : (hour === 12 ? 0 : hour);
  return QueueStore.setAutoOpenTime(String(hour24).padStart(2, "0") + ":" + minute);
}

function openQueueModal(root, state, modal) {
  state.modal = modal;
  var layer = root.querySelector("[data-queue-modal]");
  if (!layer) return;

  var title = "";
  var copy = "";
  var summary = "";
  var confirm = "";

  if (modal.type === "start") {
    title = "특전회를 시작할까요?";
    copy = "대기가 있는 멤버별 첫 대기자가 각각 자동으로 1차 호출됩니다.";
    summary = "<strong>멤버별 자동 1차 호출</strong><span>대기가 없는 멤버는 호출하지 않습니다.</span>";
    confirm = "시작하고 자동 호출";
  } else if (modal.type === "callClose") {
    var uncalledCount = state.data.queues.filter(function (row) { return row.status === "대기중"; }).length;
    var callingCount = state.data.queues.filter(function (row) { return row.status === "호출중"; }).length;
    var progressCount = state.data.queues.filter(function (row) { return row.status === "진행중"; }).length;
    title = "호출 마감할까요?";
    copy = "이미 호출되었거나 진행 중인 팬은 계속 처리하고, 아직 호출되지 않은 대기는 일괄 취소합니다.";
    summary = "<strong>미호출 대기 " + uncalledCount + "건이 운영 마감 취소됩니다.</strong><span>현재 호출 " + callingCount + "명 · 진행 중 " + progressCount + "명은 그대로 처리됩니다.</span>";
    confirm = "대기 " + uncalledCount + "건 마감 취소";
  } else if (modal.type === "arrival") {
    title = "도착 확인할까요?";
    copy = "#" + modal.number + "의 도착을 확인하면 진행 중으로 이동하고, 같은 멤버 다음 대기번호가 자동 1차 호출됩니다.";
    summary = "<strong>도착 확인 = 다음 번호 자동 호출</strong><span>도착 확인된 팬은 특전 사용 · 촬영 목록에서 처리합니다.</span>";
    confirm = "도착 확인";
  } else if (modal.type === "registration") {
    var registrationModalMap = {
      open: { title: "팬 사전 접수를 지금 시작할까요?", copy: "팬 화면의 접수하기 버튼이 바로 활성화됩니다.", summary: "<strong>예정 시간 전에도 접수가 시작됩니다.</strong><span>마감 시간은 자동 오픈 시간으로 설정됩니다.</span>", confirm: "지금 사전 접수 열기" },
      hold: { title: "자동 오픈을 보류할까요?", copy: "설정된 시간이 되어도 팬 사전 접수가 자동으로 열리지 않습니다.", summary: "<strong>팬은 아직 접수할 수 없습니다.</strong><span>필요할 때 자동 오픈 다시 켜기 또는 지금 열기를 선택하세요.</span>", confirm: "자동 오픈 보류" },
      pause: { title: "새로운 대기 접수만 잠시 막을까요?", copy: "이미 접수한 팬의 대기 정보와 번호는 그대로 유지됩니다.", summary: "<strong>새 접수만 일시정지됩니다.</strong><span>재개하면 팬이 다시 대기를 신청할 수 있습니다.</span>", confirm: "새 접수 일시정지" },
      resume: { title: "팬 사전 접수를 다시 받을까요?", copy: "일시정지했던 신규 접수를 다시 활성화합니다.", summary: "<strong>팬의 접수하기 버튼이 다시 활성화됩니다.</strong><span>현재 설정된 마감 시간은 유지됩니다.</span>", confirm: "새 접수 다시 열기" },
      resumeAuto: { title: "자동 오픈을 다시 켤까요?", copy: "보류를 해제하고 설정된 시간에 맞춘 자동 흐름으로 돌아갑니다.", summary: "<strong>자동 오픈 대기 상태로 돌아갑니다.</strong><span>설정 시간이 지나면 자동으로 사전 접수가 시작됩니다.</span>", confirm: "자동 오픈 다시 켜기" }
    };
    var registrationModal = registrationModalMap[modal.action] || registrationModalMap.open;
    title = registrationModal.title;
    copy = registrationModal.copy;
    summary = registrationModal.summary;
    confirm = registrationModal.confirm;
  } else {
    var noShowCancel = modal.reason === "호출 미응답";
    title = noShowCancel ? "호출 미응답으로 취소할까요?" : "대기를 취소할까요?";
    copy = noShowCancel
      ? "#" + modal.number + "은 2차 호출 후 미응답으로 취소 처리됩니다."
      : "#" + modal.number + " 대기번호를 취소 처리합니다.";
    summary = "<strong>취소 사유: " + escapeQueue(modal.reason) + "</strong><span>같은 멤버의 다음 대기자가 자동으로 1차 호출됩니다.</span>";
    confirm = noShowCancel ? "미응답 취소" : "취소 처리";
  }

  layer.querySelector("[data-queue-modal-title]").textContent = title;
  layer.querySelector("[data-queue-modal-copy]").textContent = copy;
  layer.querySelector("[data-queue-modal-summary]").innerHTML = summary;
  layer.querySelector("[data-queue-modal-confirm]").textContent = confirm;
  layer.hidden = false;
}

function closeQueueModal(root, state) {
  state.modal = null;
  var layer = root.querySelector("[data-queue-modal]");
  if (layer) layer.hidden = true;
}

function confirmQueueModal(root, state) {
  if (!state.modal) return;
  var modal = state.modal;
  var result;

  if (modal.type === "start") result = QueueStore.start();
  if (modal.type === "callClose") result = QueueStore.closeCalls();
  if (modal.type === "arrival") result = QueueStore.arrival(modal.number);
  if (modal.type === "cancel") result = QueueStore.cancel(modal.number, modal.reason);
  if (modal.type === "registration") result = QueueStore.updateRegistration(modal.action);

  closeQueueModal(root, state);

  if (!result || !result.ok) {
    showQueueToast(root, (result && result.message) || "처리에 실패했습니다.");
    return;
  }

  state.data = result.data;
  if (modal.type === "registration") state.exceptionOpen = true;
  renderQueueRoot(root, state);
  if (modal.type === "registration") {
    var registrationToast = {
      open: "사전 접수를 지금 열었습니다.",
      hold: "자동 오픈을 보류했습니다.",
      pause: "새 접수를 일시정지했습니다.",
      resume: "새 접수를 다시 열었습니다.",
      resumeAuto: "자동 오픈을 다시 켰습니다."
    };
    showQueueToast(root, registrationToast[modal.action] || "사전 접수 상태를 변경했습니다.");
  }
  if (modal.type === "start") {
    showQueueToast(root, result.rows.map(function (row) { return row.member + " #" + row.number; }).join(" · ") + " 1차 호출을 시작했습니다.");
  }
  if (modal.type === "callClose") {
    showQueueToast(root, "미호출 대기 " + result.cancelled.length + "건을 운영 마감 취소했습니다.");
  }
  if (modal.type === "arrival") {
    var nextCallText = result.next ? " · " + result.next.member + " #" + result.next.number + " 자동 1차 호출" : (result.data.callClosed ? " · 호출 마감 상태" : " · 다음 대기 없음");
    showQueueToast(root, "#" + result.processing.number + " 도착 확인" + nextCallText);
  }
  if (modal.type === "cancel") {
    var nextText = result.next ? " · " + result.next.member + " #" + result.next.number + " 자동 1차 호출" : (result.data.callClosed ? " · 호출 마감 상태" : "");
    var cancelText = modal.reason === "호출 미응답" ? " 호출 미응답 취소" : " 대기 취소";
    showQueueToast(root, "#" + result.cancelled.number + cancelText + nextText);
  }
}

function renderQueueRoot(root, state) {
  state.data = QueueStore.read();
  root.innerHTML = renderQueueApp(state.data, state.activeFilter, state.exceptionOpen, state.view);

  // Event delegation is already bound to the app root.
  // Re-rendering inner content must not bind another click listener.
  renderQueueList(root, state);
}

function setQueueFilter(root, state) {
  renderQueueRoot(root, state);
}

function renderQueueList(root, state) {
  var list = root.querySelector("[data-queue-list]");
  if (!list) return;

  var selectedMember = state.activeFilter !== "전체" ? state.activeFilter : null;
  var selectedCurrent = currentQueue(state.data, selectedMember);
  var rows = state.data.queues.filter(function (row) {
    if (!selectedMember) {
      return row.status === "대기중" || row.status === "호출중";
    }
    return row.member === selectedMember && row.status === "대기중" && (!selectedCurrent || row.id !== selectedCurrent.id);
  }).sort(function (a, b) {
    return Number(a.number) - Number(b.number);
  });

  var shown = state.listExpanded ? rows : rows.slice(0, 4);
  list.innerHTML = shown.map(renderQueueRow).join("") || '<p class="queue-list-empty">표시할 대기자가 없습니다.</p>';

  var count = root.querySelector("[data-queue-list-count]");
  if (count) count.textContent = rows.length + "건";

  var more = root.querySelector("[data-queue-expand-list]");
  if (more) {
    more.hidden = rows.length <= 4;
    more.innerHTML = state.listExpanded ? '다음 4명만 보기 <span>‹</span>' : '전체 대기 보기 <span>›</span>';
  }
}

function refreshQueueTimers(root, state) {
  var previousPhase = ((state.data || {}).registration || {}).phase || "auto_wait";
  state.data = QueueStore.read();
  var nextPhase = ((state.data || {}).registration || {}).phase || "auto_wait";
  if (previousPhase !== nextPhase) {
    renderQueueRoot(root, state);
    return;
  }
  var preregistrationCountdown = root.querySelector("[data-queue-prereg-countdown]");
  if (preregistrationCountdown) {
    preregistrationCountdown.textContent = formatPreRegistrationCountdown(preregistrationCountdown.getAttribute("data-deadline"));
  }
  var preregistrationClock = root.querySelector("[data-queue-prereg-clock]");
  if (preregistrationClock) preregistrationClock.textContent = formatQueueClock(new Date());
  var selectedMember = state.activeFilter !== "전체" ? state.activeFilter : null;
  var current = currentQueue(state.data, selectedMember);
  var timer = root.querySelector("[data-queue-timer]");
  var note = root.querySelector("[data-queue-call-note]");
  var stateEl = root.querySelector("[data-queue-call-state]");
  if (!current || !stateEl) return;

  if (!current.needsResponseCheck) {
    if (!timer) return;
    var remaining = remainingSeconds(current);
    if (remaining <= 0 && typeof window.__lumibelleRunQueueAutomation === "function") {
      var transition = window.__lumibelleRunQueueAutomation();
      if (transition && transition.changed) {
        state.data = transition.data;
        renderQueueRoot(root, state);
        return;
      }
    }
    timer.textContent = formatRemaining(current);
  }

  stateEl.textContent = callStateText(current);
  if (note) note.textContent = callNote(current);

  if (current.needsResponseCheck) {
    root.classList.add("is-response-check-needed");
  } else {
    root.classList.remove("is-response-check-needed");
  }
}

function currentQueue(data, member) {
  return data.queues
    .filter(function (row) {
      return row.status === "호출중" && (!member || row.member === member);
    })
    .sort(function (a, b) { return Number(a.number) - Number(b.number); })[0] || null;
}

function activeCount(data) {
  return data.queues.filter(function (row) {
    return row.status === "대기중" || row.status === "호출중" || row.status === "진행중";
  }).length;
}

function memberCounts(data) {
  // Tab number means only people still waiting in that member's line.
  // The number decreases as soon as 1차 호출 starts.
  var counts = { "마리링": 0, "루루": 0, "이로": 0, "루나": 0 };
  data.queues.forEach(function (row) {
    if (counts.hasOwnProperty(row.member) && row.status === "대기중") {
      counts[row.member] += 1;
    }
  });
  return counts;
}

function estimatedWait(data) {
  var waiting = data.queues.filter(function (row) { return row.status === "대기중"; });
  if (!waiting.length) return 0;
  var minutes = waiting.reduce(function (sum, row) { return sum + Number(row.estimateMin || 0); }, 0);
  return Math.max(5, Math.round(minutes / 4));
}

function lastRegistration(data) {
  var latest = data.queues.slice().sort(function (a, b) {
    return new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime();
  })[0];
  if (!latest) return "−";
  var date = new Date(latest.registeredAt);
  return String(date.getHours()).padStart(2, "0") + ":" + String(date.getMinutes()).padStart(2, "0");
}

function remainingSeconds(row) {
  if (!row || !row.calledAt) return 0;

  // QueueStore 내부 상수는 이 렌더 함수 범위에서 접근할 수 없으므로
  // 호출 타이머 기준을 여기에서 명시한다.
  var allowed = row.callRound === 2 ? 120 : 180;
  return Math.max(0, allowed - Math.floor((Date.now() - new Date(row.calledAt).getTime()) / 1000));
}

function formatRemaining(row) {
  var sec = remainingSeconds(row);
  return String(Math.floor(sec / 60)).padStart(2, "0") + ":" + String(sec % 60).padStart(2, "0");
}

function callStateText(row) {
  if (!row) return "호출 대기";
  if (row.needsResponseCheck) return "미응답 확인 필요";
  return "자동 " + row.callRound + "차 호출 중";
}

function callNote(row) {
  if (row.needsResponseCheck) return "2차 호출 후 2분 경과.\n현장 확인 후 처리해주세요.";
  if (row.callRound === 2) return "2차 호출 중입니다. 2분 내 도착 확인이 없으면 스탭 확인이 필요합니다.";
  return "1차 호출 중입니다. 3분 내 미도착 시 2차 호출이 자동 진행됩니다.";
}

function escapeQueue(value) {
  return String(value || "").replace(/[&<>"']/g, function (char) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
  });
}

function showQueueToast(root, message) {
  var toast = root.querySelector("[data-queue-toast]");
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  toast.classList.add("is-visible");
  window.clearTimeout(root._queueToastTimer);
  root._queueToastTimer = window.setTimeout(function () {
    toast.classList.remove("is-visible");
    toast.hidden = true;
  }, 2400);
}


(function startQueueAutomation() {
  function ensureQueueAlert() {
    var alert = document.querySelector('[data-staff-queue-alert]');
    if (alert) return alert;
    alert = document.createElement('aside');
    alert.className = 'staff-queue-alert';
    alert.hidden = true;
    alert.setAttribute('data-staff-queue-alert', '');
    alert.setAttribute('role', 'status');
    alert.setAttribute('aria-live', 'polite');
    alert.innerHTML = '<div class="staff-queue-alert-copy"><strong></strong><p></p></div><button type="button" data-staff-queue-alert-go>대기열 보기</button><button type="button" class="staff-queue-alert-close" aria-label="알림 닫기" data-staff-queue-alert-close>×</button>';
    document.body.appendChild(alert);
    alert.addEventListener('click', function (event) {
      if (event.target.closest('[data-staff-queue-alert-close]')) { alert.hidden = true; return; }
      if (event.target.closest('[data-staff-queue-alert-go]') || event.target.closest('.staff-queue-alert-copy')) {
        var member = alert.getAttribute('data-queue-alert-member') || '전체';
        window.__lumibelleQueueFocusMember = member;
        var launcher = document.querySelector('[data-app-id="queue"]');
        if (launcher) launcher.click();
        alert.hidden = true;
      }
    });
    return alert;
  }

  function showQueueResponseCheck(notice) {
    var timerAlert = document.querySelector('[data-staff-timer-alert]');
    if (timerAlert && !timerAlert.hidden) {
      window.__lumibellePendingQueueResponseCheck = notice;
      return;
    }
    var alert = ensureQueueAlert();
    alert.className = 'staff-queue-alert is-response-check';
    alert.querySelector('strong').textContent = '⚠ 미응답 확인 필요';
    alert.querySelector('p').textContent = notice.member + ' ' + notice.number + '번 · 2차 호출 후 2분이 지났습니다. 현장을 확인해주세요.';
    alert.setAttribute('data-queue-alert-member', notice.member);
    alert.setAttribute('data-queue-alert-number', notice.number);
    alert.hidden = false;
  }

  function clearResolvedQueueAlert() {
    var alert = document.querySelector('[data-staff-queue-alert]');
    if (!alert || alert.hidden) return;
    var number = alert.getAttribute('data-queue-alert-number');
    if (!number) return;
    var row = QueueStore.read().queues.find(function (item) { return item.number === number; });
    if (!row || !row.needsResponseCheck || row.status !== '호출중') alert.hidden = true;
  }

  function runQueueAutomation() {
    var result = QueueStore.advanceAutomaticCalls();
    if (result && result.notices && result.notices.length) showQueueResponseCheck(result.notices[0]);
    if (window.__lumibellePendingQueueResponseCheck) {
      var timerAlert = document.querySelector('[data-staff-timer-alert]');
      if (!timerAlert || timerAlert.hidden) {
        showQueueResponseCheck(window.__lumibellePendingQueueResponseCheck);
        window.__lumibellePendingQueueResponseCheck = null;
      }
    }
    clearResolvedQueueAlert();
    return result;
  }

  // 자동 호출 상태 전환은 이 공통 실행기 하나만 사용한다.
  window.__lumibelleRunQueueAutomation = runQueueAutomation;

  if (!window.__lumibelleQueueAutoTicker) {
    window.__lumibelleQueueAutoTicker = window.setInterval(runQueueAutomation, 1000);
  }

  window.addEventListener('lumibelle:queuechange', function () {
    var root = document.querySelector('[data-queue-app]');
    if (!root || root.getAttribute('data-queue-bound') !== 'true') return;
    var active = root.querySelector('[data-queue-filter].is-active');
    // Structural changes are refreshed without adding another listener.
    if (active) {
      var member = active.getAttribute('data-queue-filter') || '전체';
      var currentView = root.getAttribute("data-queue-view") || "management";
      root.innerHTML = renderQueueApp(QueueStore.read(), member, false, currentView);
      var state = { data: QueueStore.read(), modal: null, activeFilter: member, listExpanded: false, exceptionOpen: false, view: currentView };
      renderQueueList(root, state);
    }
  });
})();
