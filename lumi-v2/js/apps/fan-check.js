/**
 * fan-check.js — Staff OS 팬 조회
 *
 * 역할:
 * - 루미 ID / 닉네임으로 팬 상태를 빠르게 조회
 * - 오늘 처리 필요 항목과 기록 요약을 확인
 * - 실제 API 연결 전 더미 데이터 기반 화면
 */

window.LumiApps = window.LumiApps || {};

window.LumiVisitStore = window.LumiVisitStore || (function () {
  var STORAGE_KEY = "lumibelle_staff_visit_status_v1";
  var memory = {};

  function read() {
    try {
      var raw = window.sessionStorage && window.sessionStorage.getItem(STORAGE_KEY);
      if (!raw && window.localStorage) raw = window.localStorage.getItem(STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : null;
      return parsed && typeof parsed === "object" ? parsed : memory;
    } catch (error) {
      return memory;
    }
  }

  function write(data) {
    memory = data;
    var raw = JSON.stringify(data);
    try { if (window.localStorage) window.localStorage.setItem(STORAGE_KEY, raw); } catch (error) {}
    try { if (window.sessionStorage) window.sessionStorage.setItem(STORAGE_KEY, raw); } catch (error) {}
  }

  function key(eventId, fanId) {
    return String(eventId || "") + "::" + String(fanId || "");
  }

  return {
    get: function (eventId, fanId) { return read()[key(eventId, fanId)] || null; },
    complete: function (payload) {
      var data = read();
      data[key(payload.eventId, payload.fanId)] = Object.assign({ completed: true, completedAt: new Date().toISOString() }, payload);
      write(data);
      return data[key(payload.eventId, payload.fanId)];
    }
  };
})();

(function () {
  var state = {
    query: "딸기우유",
    selectedId: "strawberry_0720",
    detailKey: null,
    toast: "",
    toastTimer: null,
    openApp: null
  };

  var FANS = [
    {
      id: "strawberry_0720",
      name: "딸기우유♡",
      lumiId: "LB-0720",
      fanType: "팬",
      eventTicketTarget: true,
      welcomeFollowChecked: false,
      joinFollowChecked: false,
      welcomeTicketIssued: false,
      joinTicketIssued: false,
      visitToday: false,
      checkinToday: false,
      point: 1284,
      caution: true,
      memo: true,
      visits: [
        ["2026.07.12", "Lumibelle Debut Live", "1회"],
        ["2026.05.20", "Lunily 1st 팬미팅", "1회"],
        ["2026.04.15", "Lunily 미니 팬미팅", "1회"]
      ],
      checkins: [
        ["2026.07.12", "Lumibelle Debut Live", "미완료"],
        ["2026.05.20", "Lunily 1st 팬미팅", "1회"],
        ["2026.04.15", "Lunily 미니 팬미팅", "1회"]
      ],
      benefits: [
        ["메아테 수령", "미수령", "1건"],
        ["숙제체키", "미수령", "2건"]
      ],
      benefitRecords: [
        { type: "메아테 수령", eventId: "EVT-20260712", eventTitle: "Lumibelle Debut Live", occurredAt: "2026-07-12T19:24:00+09:00", kind: "주최 라이브 메아테", status: "미수령" },
        { type: "숙제체키", eventId: "EVT-20260712", eventTitle: "Lumibelle Debut Live", occurredAt: "2026-07-12T20:05:00+09:00", kind: "마리링 · 숙제체키", status: "미수령" },
        { type: "숙제체키", eventId: "EVT-20260628-OUT", eventTitle: "Dream Pop Party Vol. 3 · 외부겐바", occurredAt: "2026-06-28T20:18:00+09:00", kind: "루루 · 숙제체키", status: "미수령" }
      ]
    },
    {
      id: "lemoncandy_0427",
      name: "레몬캔디",
      lumiId: "LB-0427",
      fanType: "팬",
      eventTicketTarget: false,
      welcomeFollowChecked: false,
      joinFollowChecked: false,
      welcomeTicketIssued: false,
      joinTicketIssued: false,
      visitToday: false,
      checkinToday: false,
      point: 640,
      caution: false,
      memo: false,
      visits: [
        ["2026.05.04", "Lunily Mini Live", "1회"]
      ],
      checkins: [
        ["2026.05.04", "Lunily Mini Live", "1회"]
      ],
      benefits: [
        ["메아테 수령", "미수령", "0건"],
        ["숙제체키", "미수령", "0건"]
      ],
      benefitRecords: []
    },
    {
      id: "skysoda_0831",
      name: "하늘소다",
      lumiId: "LB-0831",
      fanType: "팬",
      eventTicketTarget: true,
      welcomeFollowChecked: true,
      joinFollowChecked: false,
      welcomeTicketIssued: true,
      joinTicketIssued: false,
      visitToday: false,
      checkinToday: false,
      point: 2310,
      caution: false,
      memo: true,
      visits: [
        ["2026.06.28", "Dream Pop Party Vol. 3 · 외부겐바", "1회"],
        ["2026.05.11", "Lunily Mini Live", "1회"]
      ],
      checkins: [
        ["2026.06.28", "Dream Pop Party Vol. 3 · 외부겐바", "미완료"],
        ["2026.05.11", "Lunily Mini Live", "1회"]
      ],
      benefits: [
        ["메아테 수령", "미수령", "1건"],
        ["숙제체키", "미수령", "1건"]
      ],
      benefitRecords: [
        { type: "메아테 수령", eventId: "EVT-20260628-OUT", eventTitle: "Dream Pop Party Vol. 3 · 외부겐바", occurredAt: "2026-06-28T19:36:00+09:00", kind: "외부겐 메아테", status: "미수령" },
        { type: "숙제체키", eventId: "EVT-20260628-OUT", eventTitle: "Dream Pop Party Vol. 3 · 외부겐바", occurredAt: "2026-06-28T20:05:00+09:00", kind: "이로 · 숙제체키", status: "미수령" }
      ]
    },
    {
      id: "nyangnyang_0101",
      name: "냥냥마카롱",
      lumiId: "LB-0101",
      fanType: "팬",
      eventTicketTarget: false,
      welcomeFollowChecked: true,
      joinFollowChecked: true,
      welcomeTicketIssued: true,
      joinTicketIssued: true,
      visitToday: true,
      checkinToday: true,
      point: 12450,
      caution: false,
      memo: true,
      visits: [
        ["2026.07.12", "Lumibelle Debut Live", "1회"],
        ["2026.06.02", "Rose Hall Mini Live", "1회"]
      ],
      checkins: [
        ["2026.07.12", "Lumibelle Debut Live", "완료"],
        ["2026.06.02", "Rose Hall Mini Live", "1회"]
      ],
      benefits: [
        ["메아테 수령", "완료", "1건"],
        ["숙제체키", "미수령", "1건"]
      ],
      benefitRecords: [
        { type: "메아테 수령", eventId: "EVT-20260712", eventTitle: "Lumibelle Debut Live", occurredAt: "2026-07-12T19:24:00+09:00", kind: "주최 라이브 메아테", status: "완료" },
        { type: "숙제체키", eventId: "EVT-20260712", eventTitle: "Lumibelle Debut Live", occurredAt: "2026-07-12T20:05:00+09:00", kind: "마리링 · 숙제체키", status: "미수령" }
      ]
    }
  ];

  var DEMO_EVENTS = {
    host: {
      eventId: "EVT-20260712",
      eventDate: "2026-07-12",
      eventTitle: "Shine Me UP : 루미벨 데뷔 라이브",
      eventType: "host"
    },
    external: {
      eventId: "EVT-20260628-OUT",
      eventDate: "2026-06-28",
      eventTitle: "Dream Pop Party Vol. 3 · 외부겐바",
      eventType: "external"
    }
  };

  function readDemoEvent() {
    try {
      var saved = window.sessionStorage && window.sessionStorage.getItem("lumibelle_staff_demo_event");
      return saved && DEMO_EVENTS[saved] ? saved : "host";
    } catch (error) {
      return "host";
    }
  }

  function setDemoEvent(key) {
    var selected = DEMO_EVENTS[key] ? key : "host";
    window.LumiCurrentEvent = Object.assign({}, DEMO_EVENTS[selected]);
    try { if (window.sessionStorage) window.sessionStorage.setItem("lumibelle_staff_demo_event", selected); } catch (error) {}
    return selected;
  }

  if (!window.LumiCurrentEvent || !window.LumiCurrentEvent.eventId) {
    setDemoEvent(readDemoEvent());
  }

  window.LumiApps.fanCheck = function (app, ctx) {
    state.openApp = ctx && typeof ctx.openApp === "function" ? ctx.openApp : null;
    setTimeout(bindFanCheckApp, 0);
    return '<section class="fan-check-app" data-fan-check-app>' + renderFanCheck() + '</section>';
  };

  function getSelectedFan() {
    return FANS.find(function (fan) { return fan.id === state.selectedId; }) || FANS[0];
  }

  function renderFanCheck() {
    var fan = getSelectedFan();
    if (state.detailKey) return renderRecordDetailPage(fan) + renderToast();
    return (
      renderHeader() +
      renderSearch(fan) +
      renderFanCard(fan) +
      renderTodayActions(fan) +
      renderRecordSummary(fan) +
      renderToast()
    );
  }

  function renderHeader() {
    var event = getCurrentEvent();
    var isHost = event.eventType === "host";
    return (
      '<header class="fan-check-title">' +
        '<span>LUMIPHONE STAFF OS</span>' +
        '<h2>팬 조회</h2>' +
        '<p>팬 상태와 오늘 처리 항목을 확인합니다.</p>' +
      '</header>' +
      '<section class="fan-event-context" aria-label="현재 공연 기준">' +
        '<div><span>현재 공연</span><strong>' + esc(event.eventTitle) + '</strong></div>' +
        '<div class="fan-event-context-actions">' +
          '<button type="button" class="' + (isHost ? 'is-active' : '') + '" data-fan-event-switch="host">주최겐</button>' +
          '<button type="button" class="' + (!isHost ? 'is-active' : '') + '" data-fan-event-switch="external">외부겐</button>' +
        '</div>' +
      '</section>'
    );
  }

  function renderSearch(fan) {
    return (
      '<section class="fan-search-card" aria-label="팬 조회 검색">' +
        '<label class="fan-search-field">' +
          '<span aria-hidden="true"></span>' +
          '<input type="text" value="' + esc(state.query) + '" placeholder="루미 ID 또는 닉네임" data-fan-search-input />' +
        '</label>' +
        '<button type="button" data-fan-search-button>조회</button>' +
      '</section>'
    );
  }

  function renderFanCard(fan) {
    return (
      '<article class="fan-profile-card">' +
        '<div class="fan-photo-slot" aria-label="프로필 사진 자리"><span>PHOTO</span></div>' +
        '<div class="fan-profile-info">' +
          infoLine("팬 닉네임", fan.name) +
          infoLine("루미 ID", fan.lumiId) +
          infoLine("루미 방문", isVisitedForCurrentEvent(fan) ? "기록 완료" : "미기록") +
          infoLine("루미 체크인", fan.checkinToday ? "완료" : "미기록") +
          infoLine("신규 이벤트", getNewEventProfileStatus(fan)) +
          '<div class="fan-profile-badges">' +
            '<span class="' + (fan.caution ? "is-warn" : "is-muted") + '">' + (fan.caution ? "주의 체크 있음" : "주의 없음") + '</span>' +
            '<span class="' + (fan.memo ? "is-note" : "is-muted") + '">' + (fan.memo ? "메모톡 있음" : "메모 없음") + '</span>' +
          '</div>' +
          '<button type="button" class="fan-point-adjust-button" data-fan-point-adjust>포인트 기록 · 정정</button>' +
        '</div>' +
      '</article>'
    );
  }

  function renderTodayActions(fan) {
    return (
      '<section class="fan-action-section">' +
        '<h3>오늘 처리 필요</h3>' +
        renderActionCard({
          no: "1",
          title: "루미 방문",
          status: isVisitedForCurrentEvent(fan) ? "기록 완료" : "미기록",
          body: "이번 공연에서 루미벨 부스·특전회에 온 팬이면 확인해주세요.",
          button: isVisitedForCurrentEvent(fan) ? "방문 확인 완료" : "방문 확인",
          action: "visit",
          disabled: isVisitedForCurrentEvent(fan)
        }) +
        renderMeateCard(fan) +
        renderTicketCard(fan) +
      '</section>'
    );
  }

  function getCurrentEvent() {
    return Object.assign({}, DEMO_EVENTS.host, window.LumiCurrentEvent || {});
  }

  function isVisitedForCurrentEvent(fan) {
    var event = getCurrentEvent();
    if (window.LumiVisitStore && typeof window.LumiVisitStore.get === "function") {
      var recorded = window.LumiVisitStore.get(event.eventId, fan.lumiId);
      if (recorded) return true;
    }
    return event.eventId === "EVT-20260712" && !!fan.visitToday;
  }

  function getMeateResult(fan) {
    var event = getCurrentEvent();
    if (window.LumiMeateStore && typeof window.LumiMeateStore.get === "function") {
      return window.LumiMeateStore.get(event.eventId, fan.lumiId);
    }
    return null;
  }

  function renderMeateCard(fan) {
    var event = getCurrentEvent();
    var result = getMeateResult(fan);
    var isHost = event.eventType === "host";
    var visited = isVisitedForCurrentEvent(fan);
    var completed = !!(result && result.completed);
    var title = "메아테";
    var status = completed ? "처리 완료" : (visited ? "처리 가능" : "방문 확인 필요");
    var body = completed
      ? "이번 공연 메아테 수령이 완료되었어요."
      : (isHost
        ? "이번 공연 방문 확인 후 처리할 수 있어요."
        : "외부 명단 대조 후 처리할 수 있어요.");
    var button = completed ? "처리 완료" : "포인트 처리로 이동";

    return renderActionCard({
      no: "2",
      title: title,
      status: status,
      body: body,
      button: button,
      action: "meate-point",
      disabled: completed || !visited
    });
  }

  function isJoinTicketCampaignActive() {
    var event = getCurrentEvent();
    var eventDate = String(event.eventDate || "").slice(0, 10);
    return eventDate >= "2026-10-18";
  }

  function getWelcomeFollowPrompt() {
    var event = getCurrentEvent();
    var eventDate = String(event.eventDate || "").slice(0, 10);
    return eventDate >= "2026-10-18"
      ? "공식 계정과 마리링·루루·이로·루나 계정 팔로우를 확인했나요?"
      : "공식 계정과 마리링·루루 계정 팔로우를 확인했나요?";
  }

  function getNewEventTicketState(fan) {
    var welcomeIssued = !!fan.welcomeTicketIssued;
    var joinIssued = !!fan.joinTicketIssued;
    var joinCampaignActive = isJoinTicketCampaignActive();

    if (welcomeIssued && !joinIssued && joinCampaignActive) {
      return {
        kind: "join",
        profileStatus: "발급 대상",
        status: "대상자",
        issued: false,
        target: true,
        followChecked: !!fan.joinFollowChecked,
        followLabel: fan.joinFollowChecked ? "팔로우 확인" : "팔로우 미확인",
        description: "이로·루나 팔로우 확인",
        followPrompt: "공식 계정과 이로·루나 계정 팔로우를 확인했나요?",
        issuedText: "이벤트권이 발급되었어요.",
        issueLabel: "Join Ticket"
      };
    }

    if (welcomeIssued) {
      return {
        kind: "complete",
        profileStatus: "발급 완료",
        status: "발급 완료",
        issued: true,
        target: true,
        followChecked: true,
        followLabel: "팔로우 확인",
        description: "신규 이벤트권 발급 기록이 있어요.",
        followPrompt: "",
        issuedText: "발급 완료",
        issueLabel: ""
      };
    }

    if (fan.eventTicketTarget) {
      return {
        kind: "welcome",
        profileStatus: "발급 대상",
        status: "대상자",
        issued: false,
        target: true,
        followChecked: !!fan.welcomeFollowChecked,
        followLabel: fan.welcomeFollowChecked ? "팔로우 확인" : "팔로우 미확인",
        description: "첫 신규 · 전체 팔로우 확인",
        followPrompt: getWelcomeFollowPrompt(),
        issuedText: "이벤트권이 발급되었어요.",
        issueLabel: "Welcome Ticket"
      };
    }

    return {
      kind: "ineligible",
      profileStatus: "대상 아님",
      status: "대상 아님",
      issued: false,
      target: false,
      followChecked: false,
      followLabel: "",
      description: "신규 이벤트 발급 대상이 아니에요.",
      followPrompt: "",
      issuedText: "",
      issueLabel: ""
    };
  }

  function getNewEventProfileStatus(fan) {
    return getNewEventTicketState(fan).profileStatus;
  }

  function renderTicketCard(fan) {
    var ticket = getNewEventTicketState(fan);
    var meta = '<span class="fan-action-meta">' + esc(ticket.status) + '</span>';
    var buttons = '';

    if (ticket.kind !== "ineligible") {
      if (!ticket.issued) {
        meta += '<span class="fan-action-meta">' + esc(ticket.followLabel) + '</span>' +
          '<span class="fan-action-meta">미발급</span>';
      }
      buttons =
        '<div class="fan-action-buttons">' +
          '<button type="button" class="is-secondary" data-fan-action="follow" ' + (ticket.issued || !ticket.target || ticket.followChecked ? "disabled" : "") + '>팔로우 확인</button>' +
          '<button type="button" data-fan-action="ticket" ' + (!ticket.target || !ticket.followChecked || ticket.issued ? "disabled" : "") + '>이벤트권 발급</button>' +
        '</div>';
    }

    return (
      '<article class="fan-action-card">' +
        '<div class="fan-action-media" aria-label="이미지 자리"><span></span></div>' +
        '<div class="fan-action-main">' +
          '<header class="' + (ticket.issued ? 'is-single-meta' : '') + '">' +
            '<div class="fan-action-title-row"><strong>신규 이벤트</strong></div>' +
            '<div class="fan-action-meta-row">' + meta + '</div>' +
          '</header>' +
          '<p>' + esc(ticket.description) + '</p>' +
        '</div>' +
        buttons +
      '</article>'
    );
  }

  function renderActionCard(item) {
    return (
      '<article class="fan-action-card">' +
        '<div class="fan-action-media" aria-label="이미지 자리"><span></span></div>' +
        '<div class="fan-action-main">' +
          '<header class="is-single-meta">' +
            '<div class="fan-action-title-row"><strong>' + esc(item.title) + '</strong></div>' +
            '<div class="fan-action-meta-row"><span class="fan-action-meta">' + esc(item.status) + '</span></div>' +
          '</header>' +
          '<p>' + esc(item.body) + '</p>' +
        '</div>' +
        '<div class="fan-action-buttons">' +
          '<button type="button" data-fan-action="' + esc(item.action) + '" ' + (item.disabled ? "disabled" : "") + '>' + esc(item.button) + '</button>' +
        '</div>' +
      '</article>'
    );
  }

  function renderRecordSummary(fan) {
    return (
      '<section class="fan-record-section">' +
        '<h3>기록 확인</h3>' +
        '<div class="fan-record-grid">' +
          recordCard("루미 방문 기록", fan.visits.length + "회", "visits") +
          recordCard("루미 체크인 기록", fan.checkins.length + "회", "checkins") +
          recordCard("메아테 수령 기록", getBenefitCount(fan, "메아테"), "benefits") +
          recordCard("숙제체키", getBenefitCount(fan, "숙제"), "homework") +
        '</div>' +
      '</section>'
    );
  }

  function renderRecordDetailPage(fan) {
    var configMap = {
      visits: { title: "루미 방문 기록", totalLabel: "총 방문 횟수", todayLabel: "오늘 방문 상태", latestLabel: "최근 방문" },
      checkins: { title: "루미 체크인 기록", totalLabel: "총 체크인 횟수", todayLabel: "오늘 체크인 상태", latestLabel: "최근 체크인" },
      benefits: { title: "메아테 수령 기록", totalLabel: "총 수령 횟수", todayLabel: "이번 공연 상태", latestLabel: "최근 수령" },
      homework: { title: "숙제체키", totalLabel: "총 접수 건수", todayLabel: "미수령 상태", latestLabel: "최근 기록" }
    };
    var key = state.detailKey;
    var config = configMap[key] || configMap.visits;
    var rows = getDetailRows(fan, key);
    var total = key === "visits" ? fan.visits.length + "회" : key === "checkins" ? fan.checkins.length + "회" : getBenefitCount(fan, key === "homework" ? "숙제" : "메아테");
    var today = key === "visits" ? (isVisitedForCurrentEvent(fan) ? "기록 완료" : "미기록") : key === "checkins" ? (fan.checkinToday ? "기록 완료" : "미기록") : key === "benefits" ? getBenefitStatus(fan, "메아테") : getBenefitStatus(fan, "숙제");
    var latest = rows.length ? rows[0][1] : "기록 없음";
    return (
      '<section class="fan-record-detail-view">' +
        '<header class="fan-record-detail-topbar">' +
          '<button type="button" aria-label="팬 조회로 돌아가기" data-fan-detail-close>‹</button>' +
          '<h2>' + esc(config.title) + '</h2>' +
          '<span aria-hidden="true"></span>' +
        '</header>' +
        '<div class="fan-record-detail-banner" aria-label="상세 배너 이미지 자리"><span>DETAIL BANNER</span></div>' +
        '<section class="fan-record-detail-summary">' +
          detailSummaryRow(config.totalLabel, total) +
          detailSummaryRow(config.todayLabel, today) +
          detailSummaryRow(config.latestLabel, latest) +
        '</section>' +
        '<section class="fan-record-detail-history">' +
          '<h3>기록 목록</h3>' +
          '<div class="fan-record-detail-list">' +
            buildDetailItems(fan, key).map(function (item) {
              return '' +
                '<article>' +
                  '<div class="fan-record-detail-copy">' +
                    '<span>' + esc(item.meta) + '</span>' +
                    '<strong>' + esc(item.title) + '</strong>' +
                  '</div>' +
                  '<p>' + esc(item.kind) + '</p>' +
                  '<em class="' + (item.done ? 'is-done' : 'is-pending') + '">' + esc(item.status) + '</em>' +
                '</article>';
            }).join('') +
          '</div>' +
        '</section>' +
        '<button type="button" class="fan-record-detail-back" data-fan-detail-close>팬 조회로 돌아가기</button>' +
      '</section>'
    );
  }

  function detailSummaryRow(label, value) {
    return '<p><span>' + esc(label) + '</span><strong>' + esc(value) + '</strong></p>';
  }

  function renderToast() {
    if (!state.toast) return "";
    return '<div class="fan-check-toast" data-fan-toast>' + esc(state.toast) + '</div>';
  }

  function infoLine(label, value) {
    return '<p><span>' + esc(label) + '</span><strong>' + esc(value) + '</strong></p>';
  }

  function recordCard(title, value, key) {
    return (
      '<button type="button" class="fan-record-card" data-fan-record="' + esc(key) + '">' +
        '<strong>' + esc(title) + '</strong>' +
        '<b>' + esc(value) + '</b>' +
        '<em aria-hidden="true">›</em>' +
      '</button>'
    );
  }

  function getBenefitStatus(fan, keyword) {
    var found = fan.benefits.find(function (row) { return row[0].indexOf(keyword) >= 0; });
    return found ? found[1] : "미수령";
  }

  function getBenefitCount(fan, keyword) {
    var found = fan.benefits.find(function (row) { return row[0].indexOf(keyword) >= 0; });
    return found ? found[2] : "0건";
  }

  function getDetailRows(fan, key) {
    if (key === "visits") return fan.visits;
    if (key === "checkins") return fan.checkins;
    var records = Array.isArray(fan.benefitRecords) ? fan.benefitRecords : [];
    if (key === "benefits") return records.filter(function (record) { return record.type === "메아테 수령"; });
    if (key === "homework") return records.filter(function (record) { return record.type === "숙제체키"; });
    return [];
  }

  function buildDetailItems(fan, key) {
    return getDetailRows(fan, key).map(function (row, index) {
      return formatDetailItem(row, key, index);
    });
  }

  function formatDetailItem(row, key, index) {
    if (key === "visits") {
      return {
        meta: formatDateTime(row[0], detailTimeByIndex(index)),
        title: row[1],
        kind: inferVisitKind(row[1]),
        status: "기록 완료",
        done: true
      };
    }
    if (key === "checkins") {
      var checkinDone = row[2] !== "미완료" && row[2] !== "미기록";
      return {
        meta: formatDateTime(row[0], detailTimeByIndex(index)),
        title: row[1],
        kind: "루미 체크인",
        status: checkinDone ? "기록 완료" : "미완료",
        done: checkinDone
      };
    }
    var recordDone = row.status === "완료" || row.status === "수령 완료";
    return {
      meta: formatOccurredAt(row.occurredAt),
      title: row.eventTitle || "공연 기록 없음",
      kind: row.kind || row.type,
      status: recordDone ? "기록 완료" : row.status || "미기록",
      done: recordDone
    };
  }

  function detailTimeByIndex(index) {
    var times = ["19:02", "18:41", "17:55", "19:10", "16:20"];
    return times[index] || "18:00";
  }

  function formatDateTime(dateText, timeText) {
    return formatDateWithDay(dateText) + " " + timeText;
  }

  function formatOccurredAt(isoText) {
    var match = String(isoText || "").match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}:\d{2})/);
    if (!match) return "날짜 기록 없음";
    return formatDateWithDay(match[1] + "-" + match[2] + "-" + match[3]) + " " + match[4];
  }

  function formatDateWithDay(dateText) {
    var parts = String(dateText || "").split("-");
    if (parts.length !== 3) return String(dateText || "");
    var date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    var days = ["일", "월", "화", "수", "목", "금", "토"];
    return parts.join(".") + " (" + days[date.getDay()] + ")";
  }

  function inferVisitKind(title) {
    if (!title) return "현장 방문";
    if (title.indexOf("외부겐바") >= 0) return "메아테 지정";
    if (title.indexOf("팬미팅") >= 0) return "물판 방문";
    if (title.indexOf("Picnic") >= 0 || title.indexOf("피크닉") >= 0) return "부스 방문";
    return "특전회 방문";
  }

  function bindFanCheckApp() {
    var root = document.querySelector("[data-fan-check-app]");
    if (!root || root.dataset.bound === "true") return;
    root.dataset.bound = "true";

    root.addEventListener("input", function (event) {
      var input = event.target.closest("[data-fan-search-input]");
      if (!input) return;
      state.query = input.value;
    });

    root.addEventListener("keydown", function (event) {
      var input = event.target.closest("[data-fan-search-input]");
      if (!input || event.key !== "Enter" || event.isComposing) return;
      event.preventDefault();
      state.query = input.value;
      searchFan();
      rerender(root);
    });

    root.addEventListener("click", function (event) {
      var eventSwitch = event.target.closest("[data-fan-event-switch]");
      if (eventSwitch) {
        setDemoEvent(eventSwitch.getAttribute("data-fan-event-switch"));
        state.toast = getCurrentEvent().eventType === "host" ? "주최겐 기준으로 전환" : "외부겐 기준으로 전환";
        rerender(root);
        return;
      }

      var searchButton = event.target.closest("[data-fan-search-button]");
      if (searchButton) {
        searchFan();
        rerender(root);
        return;
      }

      if (event.target.closest("[data-fan-point-adjust]")) {
        var pointFan = getSelectedFan();
        var pointEvent = getCurrentEvent();
        window.LumiPointAdjustTransfer = {
          source: "fanCheck",
          fanId: pointFan.lumiId,
          fanName: pointFan.name,
          currentPoint: Number(pointFan.point || 0),
          caution: Boolean(pointFan.caution),
          memo: Boolean(pointFan.memo),
          eventId: pointEvent.eventId,
          eventTitle: pointEvent.eventTitle
        };
        try {
          window.sessionStorage.setItem("lumibelle_point_adjust_transfer_v1", JSON.stringify(window.LumiPointAdjustTransfer));
          window.localStorage.setItem("lumibelle_point_adjust_transfer_v1", JSON.stringify(window.LumiPointAdjustTransfer));
        } catch (error) {}
        if (typeof state.openApp === "function") state.openApp("pointAdjust");
        else if (window.StaffOS && typeof window.StaffOS.openApp === "function") window.StaffOS.openApp("pointAdjust");
        return;
      }

      var action = event.target.closest("[data-fan-action]");
      if (action && !action.disabled) {
        var actionName = action.getAttribute("data-fan-action");
        if (actionName === "follow") {
          var followState = getNewEventTicketState(getSelectedFan());
          var followFan = getSelectedFan();
          if (followState.kind === "join") followFan.joinFollowChecked = true;
          if (followState.kind === "welcome") followFan.welcomeFollowChecked = true;
          state.toast = "팔로우 확인 완료";
          rerender(root);
          return;
        }

        applyFanAction(actionName);

        if (actionName === "meate-point") return;

        rerender(root);
        return;
      }

      var record = event.target.closest("[data-fan-record]");
      if (record) {
        state.detailKey = record.getAttribute("data-fan-record");
        state.toast = "";
        rerender(root);
        return;
      }

      if (event.target.closest("[data-fan-detail-close]")) {
        state.detailKey = null;
        rerender(root);
      }
    });
  }

  function rerender(root) {
    root.innerHTML = renderFanCheck();
    root.dataset.bound = "false";
    bindFanCheckApp();
    scheduleToastClear(root);
  }

  function scheduleToastClear(root) {
    if (state.toastTimer) {
      clearTimeout(state.toastTimer);
      state.toastTimer = null;
    }
    if (!state.toast) return;

    state.toastTimer = setTimeout(function () {
      state.toast = "";
      state.toastTimer = null;
      if (root && root.isConnected) {
        root.innerHTML = renderFanCheck();
        root.dataset.bound = "false";
        bindFanCheckApp();
      }
    }, 2200);
  }

  function searchFan() {
    var q = normalize(state.query);
    var found = FANS.find(function (fan) {
      return normalize(fan.name).indexOf(q) >= 0 || normalize(fan.lumiId).indexOf(q) >= 0;
    });
    if (found) {
      state.selectedId = found.id;
      state.toast = found.name + " 조회 완료";
      state.detailKey = null;
    } else {
      state.toast = "일치하는 더미 팬이 없어 기본 팬을 표시합니다.";
    }
  }

  function applyFanAction(action) {
    var fan = getSelectedFan();
    if (action === "meate-point") {
      var event = getCurrentEvent();
      if (!isVisitedForCurrentEvent(fan)) {
        state.toast = "먼저 이번 공연 루미 방문을 확인해주세요.";
        return;
      }
      var points = event.eventType === "host" ? 2 : 1;

      window.LumiPointTransfer = {
        source: "fanCheck",
        fanId: fan.lumiId,
        fanName: fan.name,
        eventId: event.eventId,
        eventTitle: event.eventTitle,
        eventType: event.eventType,
        reason: event.eventType === "host" ? "host" : "meate",
        points: points
      };

      if (typeof state.openApp === "function") {
        state.openApp("point");
      } else if (window.StaffOS && typeof window.StaffOS.openApp === "function") {
        window.StaffOS.openApp("point");
      } else {
        state.toast = "물판 포인트 앱을 열 수 없습니다.";
      }
    } else if (action === "ticket") {
      var ticket = getNewEventTicketState(fan);
      if (ticket.target && ticket.followChecked && !ticket.issued) {
        if (ticket.kind === "join") {
          fan.joinTicketIssued = true;
          state.toast = "Join Ticket 발급 완료";
        } else if (ticket.kind === "welcome") {
          fan.welcomeTicketIssued = true;
          state.toast = "Welcome Ticket 발급 완료";
        } else {
          state.toast = "이벤트권 발급 조건을 확인해주세요.";
        }
      } else {
        state.toast = "이벤트권 발급 조건을 확인해주세요.";
      }
    } else if (action === "visit") {
      var visitEvent = getCurrentEvent();
      if (window.LumiVisitStore && typeof window.LumiVisitStore.complete === "function") {
        window.LumiVisitStore.complete({
          eventId: visitEvent.eventId,
          eventTitle: visitEvent.eventTitle,
          fanId: fan.lumiId,
          fanName: fan.name
        });
      }
      fan.visitToday = true;
      state.toast = "이번 공연 루미 방문 기록 완료";
    } else if (action === "benefit") {
      state.toast = "메아테 수령 완료";
      fan.benefits = fan.benefits.map(function (row) {
        return row[0].indexOf("메아테") >= 0 ? [row[0], "완료", row[2]] : row;
      });
    }
  }

  function initials(name) {
    var value = String(name || "팬").trim();
    return esc(value.slice(0, 1) || "팬");
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
}());
