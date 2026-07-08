/**
 * point.js — Staff OS 물판 포인트
 *
 * UI 기준
 * - 오늘 공연 카드 → 제목 → 팬 조회 → 팬 결과 → 적립/레귤 교환 탭
 * - 특전권 15장 = 1P
 * - 포인트는 localStorage에 임시 저장
 * - 추후 새 스탭 DB/API 연결 시 PointStore 부분만 교체
 */

window.LumiApps = window.LumiApps || {};

var PointStore = (function () {
  var STORAGE_KEY = "lumibelle_staff_point_v1";
  var SESSION_KEY = STORAGE_KEY + "_session";
  var memoryRaw = null;

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

  function seedFans() {
    return {
      "LB-0000": { name: "테스트 팬", balance: 5, history: [] },
      "LB-0427": { name: "레몬캔디", balance: 640, history: [] },
      "LB-0831": { name: "하늘소다", balance: 2310, history: [] }
    };
  }

  function cloneSeedFan(fan) {
    return {
      name: fan.name,
      balance: Number(fan.balance || 0),
      history: []
    };
  }

  function ensureSeedFans(data) {
    data.fans = data.fans && typeof data.fans === "object" ? data.fans : {};
    var seeds = seedFans();
    Object.keys(seeds).forEach(function (id) {
      if (!data.fans[id]) data.fans[id] = cloneSeedFan(seeds[id]);
    });
    return data;
  }

  function defaultData() {
    return {
      version: 2,
      fans: ensureSeedFans({ fans: {} }).fans
    };
  }

  function read() {
    try {
      // Some local preview environments block browser storage. Keep the
      // point workflow usable in the active tab even when persistence is denied.
      var raw = memoryRaw ||
        safeGet(window.sessionStorage, SESSION_KEY) ||
        safeGet(window.localStorage, STORAGE_KEY);
      if (!raw) return defaultData();
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || !parsed.fans) return defaultData();
      return migrate(parsed);
    } catch (error) {
      return defaultData();
    }
  }

  function migrate(data) {
    // Earlier point UI used LUMI_0124 as a visual test ID.
    // It is only migrated inside the temporary browser store.
    if (data.fans && data.fans["LUMI_0124"] && !data.fans["LB-0000"]) {
      data.fans["LB-0000"] = data.fans["LUMI_0124"];
      data.fans["LB-0000"].name = data.fans["LB-0000"].name || "테스트 팬";
      delete data.fans["LUMI_0124"];
    }
    data.version = 2;
    return ensureSeedFans(data);
  }

  function write(data) {
    var raw;
    try {
      raw = JSON.stringify(data);
    } catch (error) {
      return false;
    }

    // Memory is the guaranteed fallback for an embedded/file preview.
    memoryRaw = raw;
    safeSet(window.localStorage, STORAGE_KEY, raw);
    safeSet(window.sessionStorage, SESSION_KEY, raw);
    return true;
  }

  function normalizeNumber(value) {
    var digits = String(value || "").replace(/\D/g, "");
    if (!digits) return "";
    return digits.slice(-4).padStart(4, "0");
  }

  function toLumiId(value) {
    var text = String(value || "").trim().toUpperCase();
    var idMatch = text.match(/^(?:LB|LUMI)[\s\-_]?(\d{1,})$/);
    if (idMatch) return "LB-" + normalizeNumber(idMatch[1]);
    if (/^\d{1,}$/.test(text)) return "LB-" + normalizeNumber(text);
    return "";
  }

  function findByNickname(data, value) {
    var name = String(value || "").trim().toLocaleLowerCase();
    if (!name) return null;

    return Object.keys(data.fans).find(function (id) {
      return String(data.fans[id].name || "").trim().toLocaleLowerCase() === name;
    }) || null;
  }

  function lookup(value) {
    var data = read();
    var typed = String(value || "").trim();
    var resolvedId = toLumiId(typed);

    if (!resolvedId) {
      resolvedId = findByNickname(data, typed);
    }

    if (!resolvedId) {
      return {
        ok: false,
        message: "등록된 닉네임 또는 루미 ID 번호를 찾지 못했습니다."
      };
    }

    if (!data.fans[resolvedId]) {
      // Temporary localStorage test mode: an ID number can start with 0P.
      data.fans[resolvedId] = {
        name: "임시 팬",
        balance: 0,
        history: []
      };
      write(data);
    }

    return {
      ok: true,
      id: resolvedId,
      fan: data.fans[resolvedId]
    };
  }

  function applyTransaction(id, transaction) {
    var data = read();
    var fanId = toLumiId(id) || "LB-0000";

    if (!data.fans[fanId]) {
      data.fans[fanId] = {
        name: "임시 팬",
        balance: 0,
        history: []
      };
    }

    var fan = data.fans[fanId];
    var before = Number(fan.balance || 0);
    var delta = Number(transaction.delta || 0);
    var after = before + delta;

    if (after < 0) {
      return {
        ok: false,
        message: "포인트가 부족합니다."
      };
    }

    var entry = {
      id: "pt_" + Date.now() + "_" + Math.random().toString(16).slice(2),
      createdAt: new Date().toISOString(),
      type: transaction.type,
      label: transaction.label,
      detail: transaction.detail || "",
      delta: delta,
      balanceBefore: before,
      balanceAfter: after,
      paymentMethod: transaction.paymentMethod || "",
      ticketCount: transaction.ticketCount || 0,
      rewardCost: transaction.rewardCost || 0,
      staffName: transaction.staffName || "유리 스탭",
      staffType: transaction.staffType || "regular",
      staffId: transaction.staffId || "",
      eventId: transaction.eventId || "",
      eventTitle: transaction.eventTitle || "",
      sourceEntryId: transaction.sourceEntryId || "",
      adjustmentReason: transaction.adjustmentReason || ""
    };

    fan.balance = after;
    fan.history = Array.isArray(fan.history) ? fan.history : [];
    fan.history.unshift(entry);

    if (!write(data)) {
      return {
        ok: false,
        message: "브라우저 저장에 실패했습니다."
      };
    }

    return {
      ok: true,
      fan: fan,
      entry: entry
    };
  }

  function ensureFan(id, name, initialBalance, initialHistory) {
    var data = read();
    var fanId = toLumiId(id);
    if (!fanId) {
      return {
        ok: false,
        message: "전달된 루미 ID를 확인할 수 없습니다."
      };
    }

    if (!data.fans[fanId]) {
      data.fans[fanId] = {
        name: name || "임시 팬",
        balance: Number(initialBalance || 0),
        history: Array.isArray(initialHistory) ? initialHistory.slice() : []
      };
    } else if (name) {
      data.fans[fanId].name = name;
    }

    if (!write(data)) {
      return {
        ok: false,
        message: "브라우저 저장에 실패했습니다."
      };
    }

    return {
      ok: true,
      id: fanId,
      fan: data.fans[fanId]
    };
  }

  return {
    lookup: lookup,
    ensureFan: ensureFan,
    applyTransaction: applyTransaction
  };
})();

window.LumiMeateStore = window.LumiMeateStore || (function () {
  var STORAGE_KEY = "lumibelle_staff_meate_status_v1";
  var SESSION_KEY = STORAGE_KEY + "_session";
  var memoryRaw = null;

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

  function read() {
    try {
      var raw = memoryRaw ||
        safeGet(window.sessionStorage, SESSION_KEY) ||
        safeGet(window.localStorage, STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (error) {
      return {};
    }
  }

  function write(data) {
    var raw;
    try {
      raw = JSON.stringify(data);
    } catch (error) {
      return false;
    }

    memoryRaw = raw;
    safeSet(window.localStorage, STORAGE_KEY, raw);
    safeSet(window.sessionStorage, SESSION_KEY, raw);
    return true;
  }

  function makeKey(eventId, fanId) {
    return String(eventId || "") + "::" + String(fanId || "");
  }

  function get(eventId, fanId) {
    return read()[makeKey(eventId, fanId)] || null;
  }

  function complete(payload) {
    var data = read();
    data[makeKey(payload.eventId, payload.fanId)] = Object.assign({
      completed: true,
      completedAt: new Date().toISOString()
    }, payload);
    return write(data);
  }

  return {
    get: get,
    complete: complete
  };
})();

window.LumiApps.point = function () {
  var transfer = window.LumiPointTransfer || null;
  var transferReason = transfer ? (transfer.eventType === "host" ? "host" : "meate") : "ticket";
  var transferFanId = transfer && transfer.fanId ? transfer.fanId : "0000";
  var transferTitle = transfer && transfer.eventTitle ? transfer.eventTitle : "Lumibelle Debut Live";
  var transferStatus = transfer
    ? (transfer.eventType === "host" ? "주최 라이브 · 메아테 2P" : "외부 공연 · 메아테 1P")
    : "오늘 공연 연결 완료";

  return (
    '<section class="point-app' + (transfer ? ' is-transfer-mode' : '') + '" data-point-app>' +
      '<article class="point-event-card" aria-label="오늘 공연">' +
        '<div class="point-event-mark" aria-hidden="true">LB</div>' +
        '<div class="point-event-copy">' +
          '<span>오늘의 공연</span>' +
          '<strong>' + transferTitle + '</strong>' +
        '</div>' +
        '<em class="point-event-status">' + transferStatus + '</em>' +
      '</article>' +

      '<header class="point-page-title">' +
        '<h2>물판 포인트</h2>' +
        '<p>현장 포인트 적립 / 사용</p>' +
      '</header>' +
      (transfer
        ? '<article class="point-transfer-notice" data-point-transfer-card>' +
            '<div class="point-transfer-copy">' +
              '<span>팬 조회 연동 · 메아테 처리</span>' +
              '<strong>' + transfer.fanName + '</strong>' +
              '<em>' + transfer.fanId + ' · ' + (transfer.eventType === "host" ? "주최 라이브 메아테 +2P" : "외부 공연 메아테 +1P") + '</em>' +
            '</div>' +
          '</article>'
        : '') +

      (transfer ? '' :
        '<article class="point-fan-search-card">' +
          '<div class="point-fan-search-head"><strong>팬 조회</strong></div>' +
          '<div class="point-fan-search-row">' +
            '<label>' +
              '<span aria-hidden="true">⌕</span>' +
              '<input type="text" placeholder="닉네임 또는 ID 번호 (예: 0003)" value="' + transferFanId + '" data-point-lookup-input />' +
            '</label>' +
            '<button type="button" data-point-lookup>조회</button>' +
          '</div>' +
          '<div class="point-fan-result is-confirmed" data-point-result>' +
            '<div class="point-fan-badge" aria-hidden="true">P</div>' +
            '<div class="point-fan-info">' +
              '<strong data-point-name>김루미</strong>' +
              '<span data-point-id>LUMI_0124</span>' +
            '</div>' +
            '<button type="button" class="point-adjust-open" data-point-adjust-open>기록 · 정정</button>' +
            '<b aria-hidden="true">✓</b>' +
          '</div>' +
          '<p class="point-fan-note">이 화면은 현재 브라우저에 임시 저장됩니다. 새 스탭 DB 연결 전 테스트용입니다.</p>' +
        '</article>' +
        '<div class="point-mode-tabs" role="tablist" aria-label="포인트 처리 구분">' +
          '<button type="button" class="is-active" data-point-mode="earn">포인트 적립</button>' +
          '<button type="button" data-point-mode="redeem">레귤 교환</button>' +
        '</div>'
      ) +

      '<section class="point-panel" data-point-panel="earn">' +
        pointSummary("earn") +

        '<article class="point-card point-reason-card">' +
          '<header class="point-section-label">' + (transfer ? '메아테 처리' : '지급 사유') + '</header>' +
          (transfer
            ? pointTransferReason(transferReason)
            : '<div class="point-reason-grid">' + pointReason("ticket", "특전권 구매", "15장 = 1P", true) + '</div>') +
        '</article>' +

        (transfer ? '' :
          '<article class="point-card point-setting-card" data-point-ticket-setting>' +
            '<div class="point-setting-row point-ticket-row">' +
              '<strong>특전권 수량</strong>' +
              '<div class="point-stepper">' +
                '<button type="button" data-point-ticket-step="-15">−</button>' +
                '<b data-point-ticket-count>15장</b>' +
                '<button type="button" data-point-ticket-step="15">＋</button>' +
              '</div>' +
            '</div>' +
            '<div class="point-preset-row">' +
              '<button type="button" class="is-active" data-point-ticket-preset="15">15장</button>' +
              '<button type="button" data-point-ticket-preset="30">30장</button>' +
              '<button type="button" data-point-ticket-preset="45">45장</button>' +
              '<button type="button" data-point-ticket-preset="60">60장</button>' +
            '</div>' +
            '<div class="point-setting-row point-payment-row">' +
              '<strong>결제 방법</strong>' +
              '<div class="point-payment-tabs">' +
                '<button type="button" class="is-active" data-point-payment="cash">현금</button>' +
                '<button type="button" data-point-payment="transfer">계좌</button>' +
              '</div>' +
            '</div>' +
            '<p class="point-inline-note">특전권 구매 포인트는 결제 건별로 계산하며, 당일 구매 합산은 불가합니다.</p>' +
            '<div class="point-calc-strip"><strong data-point-ticket-result>15장</strong><span>→</span><b data-point-ticket-points>+1P</b></div>' +
          '</article>'
        ) +

        '<button type="button" class="point-process-button" data-point-process="earn">' + (transfer ? '메아테 포인트 적립' : '적립 처리') + '</button>' +
        (transfer ? '' : '<button type="button" class="point-cancel-button" data-point-cancel="earn">취소</button>') +
      '</section>' +

      '<section class="point-panel" data-point-panel="redeem" hidden>' +
        pointSummary("redeem") +

        '<article class="point-card point-reason-card">' +
          '<header class="point-section-label">교환 항목</header>' +
          '<button type="button" class="point-reward-selector" data-point-catalog-open>' +
            '<span data-point-selector-label>레귤 교환 항목 선택</span><em>›</em>' +
          '</button>' +
          '<p class="point-redeem-guide">레귤 항목을 선택하면 필요한 포인트와 교환 후 잔여 포인트가 자동 계산됩니다.</p>' +
        '</article>' +

        '<article class="point-card point-redeem-summary">' +
          '<p><span>선택 항목</span><strong data-point-selected-title>아직 선택된 레귤이 없습니다.</strong></p>' +
          '<p><span>필요 포인트</span><strong data-point-selected-cost>−</strong></p>' +
          '<p><span>교환 후</span><strong data-point-selected-after>−</strong></p>' +
          '<div data-point-selected-note>교환 항목 선택 후 조건 및 처리 유의사항이 표시됩니다.</div>' +
        '</article>' +

        '<button type="button" class="point-process-button" data-point-process="redeem" disabled>레귤 교환 처리</button>' +
        '<button type="button" class="point-cancel-button" data-point-cancel="redeem">취소</button>' +
      '</section>' +

      '<section class="point-catalog-view" data-point-catalog hidden>' +
        '<header class="point-catalog-head">' +
          '<button type="button" data-point-catalog-close aria-label="레귤 교환으로 돌아가기">‹</button>' +
          '<div><span>현재 보유 <b data-point-catalog-balance>5P</b></span><h2>레귤 교환 항목</h2></div>' +
        '</header>' +
        '<div class="point-catalog-list">' +
          pointReward(1, "샤메권 · 교류 30초", "즉시 교환 가능", "available") +
          pointReward(3, "이벤트 특전권 1장", "즉시 교환 가능", "available") +
          pointReward(5, "카코미 체키", "데코 0 · 교류 없음", "available") +
          pointReward(7, "물품 사인권", "포인트 부족", "locked") +
          pointReward(10, "30초 영상 + 녹음권", "포인트 부족", "locked") +
          pointReward(15, "물판 패스 티켓", "포인트 부족", "locked") +
          pointReward(20, "멤버 지정 숙제체키 1개", "포인트 부족", "locked") +
          pointReward(25, "루미벨 굿즈 1개 선택", "재고 확인 필요", "review") +
          pointReward(30, "라이브 무료 입장", "사용 공연 지정 필요", "review") +
          pointReward(35, "세트리스트 지정권", "2곡 지정 · 운영 확인 필요", "review") +
          pointReward(40, "오프회 무료 참가권", "대상 일정 확인 필요", "review") +
          pointReward(100, "프라이빗 콘서트 & 1:1 만찬", "운영진 일정 조율 필요", "review") +
        '</div>' +
      '</section>' +

      '<section class="point-confirm-layer" data-point-confirm hidden>' +
        '<div class="point-confirm-backdrop" data-point-confirm-close></div>' +
        '<article class="point-confirm-card" role="dialog" aria-modal="true" aria-label="포인트 처리 확인">' +
          '<span class="point-confirm-eyebrow">처리 전 확인</span>' +
          '<h3 data-point-confirm-title>포인트 적립</h3>' +
          '<p data-point-confirm-description>내용을 확인한 뒤 확정 처리해주세요.</p>' +
          '<dl>' +
            '<div><dt>현재 보유</dt><dd data-point-confirm-before>5P</dd></div>' +
            '<div><dt data-point-confirm-delta-label>이번 적립</dt><dd data-point-confirm-delta>+1P</dd></div>' +
            '<div><dt>처리 후</dt><dd data-point-confirm-after>6P</dd></div>' +
          '</dl>' +
          '<div class="point-confirm-actions">' +
            '<button type="button" data-point-confirm-close>취소</button>' +
            '<button type="button" data-point-confirm-apply>확정 처리</button>' +
          '</div>' +
        '</article>' +
      '</section>' +

      '<div class="point-toast" data-point-toast role="status" aria-live="polite" hidden></div>' +
    '</section>'
  );
};

window.LumiApps.mountPoint = function (host) {
  var root = host && typeof host.querySelector === "function"
    ? host.querySelector("[data-point-app]")
    : document.querySelector("[data-point-app]");

  if (!root) return;
  bindPointApp(root);
};

function pointReason(key, label, meta, active) {
  return '<button type="button" class="' + (active ? "is-active" : "") + '" data-point-reason="' + key + '"><strong>' + label + "</strong><span>" + meta + "</span></button>";
}

function pointTransferReason(reason) {
  var isHost = reason === "host";
  return '<div class="point-transfer-reason">' +
    '<strong>' + (isHost ? '주최 라이브 메아테' : '외부겐 메아테') + '</strong>' +
    '<span>' + (isHost ? '+2P · 현재 공연 기준 처리' : '+1P · 외부 명단 대조 후 처리') + '</span>' +
  '</div>';
}

function pointSummary(mode) {
  var middle = mode === "earn" ? "이번 적립" : "이번 사용";
  return (
    '<article class="point-summary-row" data-point-summary="' + mode + '">' +
      '<p><span>현재 보유</span><strong data-point-before>5P</strong></p>' +
      '<p><span>' + middle + '</span><strong data-point-delta>' + (mode === "earn" ? "+1P" : "−") + "</strong></p>" +
      '<p><span>처리 후</span><strong data-point-after>' + (mode === "earn" ? "6P" : "−") + "</strong></p>" +
    "</article>"
  );
}

function pointReward(cost, title, note, state) {
  return (
    '<button type="button" class="point-reward-row is-' + state + '" data-point-reward="' + cost + '" data-point-title="' + title + '" data-point-note="' + note + '">' +
      "<b>" + cost + "P</b><span><strong>" + title + "</strong><em>" + note + "</em></span><i>" + (state === "available" ? "선택" : state === "locked" ? "부족" : "확인") + "</i>" +
    "</button>"
  );
}

function bindPointApp(root) {
  root = root || document.querySelector("[data-point-app]");
  if (!root || root.getAttribute("data-point-bound") === "true") return;

  var transfer = window.LumiPointTransfer || null;
  /* 팬 조회 연동값은 reason 문자열이 누락돼도 공연 유형으로 강제 정규화한다. */
  if (transfer) {
    transfer.reason = transfer.eventType === "host" ? "host" : "meate";
    transfer.points = transfer.reason === "host" ? 2 : 1;
  }
  var initial = transfer
    ? PointStore.ensureFan(transfer.fanId, transfer.fanName)
    : PointStore.lookup("0000");

  /* 전달값이 비정상이더라도 화면 전체를 무반응 상태로 남기지 않는다.
     수동 조회/일반 적립은 계속 가능해야 한다. */
  var initialError = "";
  if (!initial || !initial.ok) {
    initialError = (initial && initial.message) || "전달받은 팬 정보를 불러오지 못했습니다. 팬 조회 후 처리해주세요.";
    initial = PointStore.lookup("0000");
  }
  if (!initial || !initial.ok) {
    initial = {
      ok: true,
      id: "LB-0000",
      fan: { name: "테스트 팬", balance: 0, history: [] }
    };
  }

  var state = {
    fanId: initial.id,
    fanName: transfer && transfer.fanName && !initialError ? transfer.fanName : initial.fan.name,
    balance: Number(initial.fan.balance || 0),
    reason: transfer ? transfer.reason : "ticket",
    count: 15,
    paymentMethod: "cash",
    reward: null,
    pending: null,
    transfer: transfer,
    transferCompleted: Boolean(transfer && initial && initial.id && window.LumiMeateStore.get(transfer.eventId, initial.id)),
    isApplying: false,
    toastTimer: null
  };

  root.setAttribute("data-point-bound", "true");
  root._pointState = state;

  root.querySelectorAll("[data-point-reason]").forEach(function (button) {
    button.classList.toggle("is-active", button.getAttribute("data-point-reason") === state.reason);
  });

  renderFan(root, state);
  if (state.transfer) {
    root.classList.add("is-transfer-mode");
    root.querySelectorAll("[data-point-reason]").forEach(function (button) {
      button.classList.toggle("is-active", button.getAttribute("data-point-reason") === state.reason);
    });
  }
  syncTicketSettingVisibility(root, state);
  syncAll(root, state);
  syncTransferCompletion(root, state);

  var lookupInput = root.querySelector("[data-point-lookup-input]");
  if (lookupInput) {
    lookupInput.addEventListener("keydown", function (event) {
      if (event.key !== "Enter") return;
      event.preventDefault();
      var lookupButton = root.querySelector("[data-point-lookup]");
      if (lookupButton) lookupButton.click();
    });
  }

  root.addEventListener("click", function (event) {
    var target = event.target && event.target.nodeType === 1 ? event.target : event.target && event.target.parentElement;
    if (!target || typeof target.closest !== "function") return;

    var mode = target.closest("[data-point-mode]");
    if (mode) {
      event.stopPropagation();
      switchMode(root, mode.getAttribute("data-point-mode"));
      return;
    }

    if (target.closest("[data-point-adjust-open]")) {
      event.stopPropagation();
      var adjustFan = PointStore.lookup(state.fanId || "0000");
      if (!adjustFan.ok) {
        showToast(root, adjustFan.message);
        return;
      }
      window.LumiPointAdjustTransfer = {
        source: "point",
        fanId: adjustFan.id,
        fanName: adjustFan.fan.name,
        currentPoint: Number(adjustFan.fan.balance || 0),
        eventId: (window.LumiCurrentEvent || {}).eventId || "",
        eventTitle: (window.LumiCurrentEvent || {}).eventTitle || ""
      };
      try {
        window.sessionStorage.setItem("lumibelle_point_adjust_transfer_v1", JSON.stringify(window.LumiPointAdjustTransfer));
        window.localStorage.setItem("lumibelle_point_adjust_transfer_v1", JSON.stringify(window.LumiPointAdjustTransfer));
      } catch (error) {}
      if (window.StaffOS && typeof window.StaffOS.openApp === "function") window.StaffOS.openApp("pointAdjust");
      return;
    }

    if (target.closest("[data-point-lookup]")) {
      event.stopPropagation();
      var input = root.querySelector("[data-point-lookup-input]");
      var found = PointStore.lookup(input ? input.value : "0000");
      if (!found.ok) {
        showToast(root, found.message);
        return;
      }
      state.fanId = found.id;
      state.fanName = found.fan.name;
      state.balance = Number(found.fan.balance || 0);
      state.reward = null;
      state.transfer = null;
      state.transferCompleted = false;
      root.classList.remove("is-transfer-mode");
      renderFan(root, state);
      syncAll(root, state);
      showToast(root, "처리 대상을 불러왔습니다.");
      return;
    }

    var reason = target.closest("[data-point-reason]");
    if (reason) {
      event.stopPropagation();
      if (state.transfer) return;
      state.reason = reason.getAttribute("data-point-reason");
      root.querySelectorAll("[data-point-reason]").forEach(function (button) {
        button.classList.toggle("is-active", button === reason);
      });
      syncTicketSettingVisibility(root, state);
      syncEarn(root, state);
      return;
    }

    var step = target.closest("[data-point-ticket-step]");
    if (step) {
      event.stopPropagation();
      state.count = Math.max(15, Math.min(150, state.count + Number(step.getAttribute("data-point-ticket-step"))));
      syncPresetSelection(root, state);
      syncEarn(root, state);
      return;
    }

    var preset = target.closest("[data-point-ticket-preset]");
    if (preset) {
      event.stopPropagation();
      state.count = Number(preset.getAttribute("data-point-ticket-preset"));
      syncPresetSelection(root, state);
      syncEarn(root, state);
      return;
    }

    var payment = target.closest("[data-point-payment]");
    if (payment) {
      event.stopPropagation();
      state.paymentMethod = payment.getAttribute("data-point-payment") || "cash";
      root.querySelectorAll("[data-point-payment]").forEach(function (button) {
        button.classList.toggle("is-active", button === payment);
      });
      return;
    }

    if (target.closest("[data-point-catalog-open]")) {
      event.stopPropagation();
      root.querySelector("[data-point-catalog]").hidden = false;
      root.classList.add("is-catalog-open");
      syncCatalog(root, state);
      return;
    }

    if (target.closest("[data-point-catalog-close]")) {
      event.stopPropagation();
      root.querySelector("[data-point-catalog]").hidden = true;
      root.classList.remove("is-catalog-open");
      return;
    }

    var reward = target.closest("[data-point-reward]");
    if (reward) {
      event.stopPropagation();
      var cost = Number(reward.getAttribute("data-point-reward"));
      if (cost > state.balance) {
        showToast(root, "현재 포인트가 부족합니다.");
        return;
      }
      state.reward = {
        cost: cost,
        title: reward.getAttribute("data-point-title"),
        note: reward.getAttribute("data-point-note")
      };
      root.querySelector("[data-point-catalog]").hidden = true;
      root.classList.remove("is-catalog-open");
      syncRedeem(root, state);
      return;
    }

    var process = target.closest("[data-point-process]");
    if (process) {
      event.stopPropagation();
      if (process.disabled) return;
      if (state.transfer && state.transferCompleted) {
        showToast(root, "이 메아테 포인트는 이미 처리 완료되었습니다.");
        return;
      }
      openConfirm(root, state, process.getAttribute("data-point-process"));
      return;
    }

    var cancel = target.closest("[data-point-cancel]");
    if (cancel) {
      event.stopPropagation();
      resetPanel(root, state, cancel.getAttribute("data-point-cancel"));
      return;
    }

    if (target.closest("[data-point-confirm-close]")) {
      event.stopPropagation();
      closeConfirm(root, state);
      return;
    }

    if (target.closest("[data-point-confirm-apply]")) {
      event.stopPropagation();
      applyPendingTransaction(root, state);
    }
  });

  if (initialError) showToast(root, initialError);
}

function syncTransferCompletion(root, state) {
  var process = root.querySelector('[data-point-process="earn"]');
  var transferCard = root.querySelector("[data-point-transfer-card]");
  if (!state.transfer || !state.transferCompleted) {
    if (process && process.getAttribute("data-point-completed") === "true") {
      process.disabled = false;
      process.textContent = "적립 처리";
      process.removeAttribute("data-point-completed");
    }
    return;
  }

  if (process) {
    process.disabled = true;
    process.textContent = "메아테 처리 완료";
    process.setAttribute("data-point-completed", "true");
  }
  if (transferCard) {
    transferCard.classList.add("is-completed");
    var copy = transferCard.querySelector(".point-transfer-copy em");
    if (copy && copy.textContent.indexOf("처리 완료") === -1) {
      copy.textContent += " · 처리 완료";
    }
  }
}

function switchMode(root, modeName) {
  root.querySelectorAll("[data-point-mode]").forEach(function (button) {
    button.classList.toggle("is-active", button.getAttribute("data-point-mode") === modeName);
  });
  root.querySelectorAll("[data-point-panel]").forEach(function (panel) {
    panel.hidden = panel.getAttribute("data-point-panel") !== modeName;
  });
}

function renderFan(root, state) {
  var result = root.querySelector("[data-point-result]");
  if (result) result.classList.add("is-confirmed");

  root.querySelectorAll("[data-point-name]").forEach(function (el) {
    el.textContent = state.fanName;
  });
  root.querySelectorAll("[data-point-id]").forEach(function (el) {
    el.textContent = state.fanId;
  });

  var input = root.querySelector("[data-point-lookup-input]");
  if (input) input.value = state.fanId.replace(/^LB-/, "");
}

function syncAll(root, state) {
  syncEarn(root, state);
  syncRedeem(root, state);
  syncCatalog(root, state);
}

function syncTicketSettingVisibility(root, state) {
  var ticketSetting = root.querySelector("[data-point-ticket-setting]");
  if (ticketSetting) ticketSetting.hidden = state.reason !== "ticket";
}

function syncPresetSelection(root, state) {
  root.querySelectorAll("[data-point-ticket-preset]").forEach(function (button) {
    button.classList.toggle("is-active", Number(button.getAttribute("data-point-ticket-preset")) === state.count);
  });
}

function earnDelta(state) {
  return state.reason === "ticket" ? Math.floor(state.count / 15) : state.reason === "meate" ? 1 : 2;
}

function earnLabel(state) {
  if (state.reason === "ticket") return "특전권 " + state.count + "장 구매";
  if (state.reason === "meate") return "메아테 지정";
  return "주최 라이브 메아테 지정";
}

function paymentLabel(state) {
  return state.paymentMethod === "transfer" ? "계좌" : "현금";
}

function syncEarn(root, state) {
  var delta = earnDelta(state);
  var before = state.balance;
  root.querySelectorAll("[data-point-ticket-count]").forEach(function (el) { el.textContent = state.count + "장"; });
  root.querySelectorAll("[data-point-ticket-result]").forEach(function (el) { el.textContent = state.count + "장"; });
  root.querySelectorAll("[data-point-ticket-points]").forEach(function (el) { el.textContent = "+" + delta + "P"; });

  var summary = root.querySelector('[data-point-summary="earn"]');
  if (summary) {
    summary.querySelector("[data-point-before]").textContent = before + "P";
    summary.querySelector("[data-point-delta]").textContent = "+" + delta + "P";
    summary.querySelector("[data-point-after]").textContent = (before + delta) + "P";
  }
}

function syncRedeem(root, state) {
  var summary = root.querySelector('[data-point-summary="redeem"]');
  var process = root.querySelector('[data-point-process="redeem"]');

  if (!state.reward) {
    root.querySelector("[data-point-selected-title]").textContent = "아직 선택된 레귤이 없습니다.";
    root.querySelector("[data-point-selected-cost]").textContent = "−";
    root.querySelector("[data-point-selected-after]").textContent = "−";
    root.querySelector("[data-point-selected-note]").textContent = "교환 항목 선택 후 조건 및 처리 유의사항이 표시됩니다.";
    root.querySelector("[data-point-selector-label]").textContent = "레귤 교환 항목 선택";
    if (process) {
      process.disabled = true;
      process.textContent = "레귤 교환 처리";
    }
    if (summary) {
      summary.querySelector("[data-point-before]").textContent = state.balance + "P";
      summary.querySelector("[data-point-delta]").textContent = "−";
      summary.querySelector("[data-point-after]").textContent = "−";
    }
    return;
  }

  var after = state.balance - state.reward.cost;
  root.querySelector("[data-point-selected-title]").textContent = state.reward.title;
  root.querySelector("[data-point-selected-cost]").textContent = state.reward.cost + "P";
  root.querySelector("[data-point-selected-after]").textContent = after + "P";
  root.querySelector("[data-point-selected-note]").textContent = state.reward.note;
  root.querySelector("[data-point-selector-label]").textContent = state.reward.title;

  if (process) {
    process.disabled = after < 0;
    process.textContent = after < 0 ? "포인트 부족" : "레귤 교환 처리";
  }

  if (summary) {
    summary.querySelector("[data-point-before]").textContent = state.balance + "P";
    summary.querySelector("[data-point-delta]").textContent = "−" + state.reward.cost + "P";
    summary.querySelector("[data-point-after]").textContent = after + "P";
  }
}

function syncCatalog(root, state) {
  root.querySelectorAll("[data-point-catalog-balance]").forEach(function (el) {
    el.textContent = state.balance + "P";
  });

  root.querySelectorAll("[data-point-reward]").forEach(function (button) {
    var cost = Number(button.getAttribute("data-point-reward"));
    button.classList.toggle("is-disabled", cost > state.balance);
    var tag = button.querySelector("i");
    if (!tag) return;
    if (cost <= state.balance) {
      tag.textContent = button.classList.contains("is-review") ? "확인" : "선택";
    } else {
      tag.textContent = "부족";
    }
  });
}

function openConfirm(root, state, type) {
  if (state.transfer && state.transferCompleted) {
    showToast(root, "이 메아테 포인트는 이미 처리 완료되었습니다.");
    return;
  }
  if (type === "redeem" && !state.reward) {
    showToast(root, "교환할 레귤 항목을 먼저 선택해주세요.");
    return;
  }

  var delta = type === "earn" ? earnDelta(state) : -state.reward.cost;
  var label = type === "earn" ? earnLabel(state) : state.reward.title;
  var detail = type === "earn"
    ? (state.reason === "ticket" ? "결제 방법: " + paymentLabel(state) : (state.transfer ? "팬 조회 연동 처리" : "포인트 적립 사유를 확인해주세요."))
    : state.reward.note;

  state.pending = {
    type: type,
    delta: delta,
    label: label,
    detail: detail
  };

  var layer = root.querySelector("[data-point-confirm]");
  layer.hidden = false;
  layer.querySelector("[data-point-confirm-title]").textContent = type === "earn" ? "포인트 적립 확인" : "레귤 교환 확인";
  layer.querySelector("[data-point-confirm-description]").textContent = label + " · " + detail;
  layer.querySelector("[data-point-confirm-before]").textContent = state.balance + "P";
  layer.querySelector("[data-point-confirm-delta-label]").textContent = type === "earn" ? "이번 적립" : "이번 사용";
  layer.querySelector("[data-point-confirm-delta]").textContent = (delta > 0 ? "+" : "−") + Math.abs(delta) + "P";
  layer.querySelector("[data-point-confirm-after]").textContent = (state.balance + delta) + "P";
}

function closeConfirm(root, state) {
  state.pending = null;
  var layer = root.querySelector("[data-point-confirm]");
  if (layer) layer.hidden = true;
}

function applyPendingTransaction(root, state) {
  if (!state.pending || state.isApplying) return;

  /* 메아테 연동 건은 동일 공연·동일 팬에 대해 한 번만 적립한다. */
  if (state.transfer && (state.reason === "meate" || state.reason === "host")) {
    var completed = window.LumiMeateStore.get(state.transfer.eventId, state.fanId);
    if (state.transferCompleted || (completed && completed.completed)) {
      state.transferCompleted = true;
      closeConfirm(root, state);
      syncTransferCompletion(root, state);
      showToast(root, "이 메아테 포인트는 이미 처리 완료되었습니다.");
      return;
    }
  }

  state.isApplying = true;
  var applyButton = root.querySelector("[data-point-confirm-apply]");
  if (applyButton) {
    applyButton.disabled = true;
    applyButton.textContent = "처리 중…";
  }

  var pending = state.pending;
  var result = PointStore.applyTransaction(state.fanId, {
    type: pending.type === "earn" ? "earn" : "redeem",
    label: pending.label,
    detail: pending.detail,
    delta: pending.delta,
    paymentMethod: pending.type === "earn" ? paymentLabel(state) : "",
    ticketCount: pending.type === "earn" && state.reason === "ticket" ? state.count : 0,
    rewardCost: pending.type === "redeem" ? state.reward.cost : 0,
    staffName: ((window.LumiCurrentStaff || {}).name || "유리 스탭"),
    staffType: ((window.LumiCurrentStaff || {}).type || "regular"),
    staffId: ((window.LumiCurrentStaff || {}).id || ""),
    eventId: (state.transfer && state.transfer.eventId) || ((window.LumiCurrentEvent || {}).eventId || ""),
    eventTitle: (state.transfer && state.transfer.eventTitle) || ((window.LumiCurrentEvent || {}).eventTitle || "")
  });

  state.isApplying = false;
  if (applyButton) {
    applyButton.disabled = false;
    applyButton.textContent = "확정 처리";
  }

  if (!result.ok) {
    closeConfirm(root, state);
    showToast(root, result.message || "처리에 실패했습니다.");
    return;
  }

  state.balance = Number(result.fan.balance || 0);

  if (pending.type === "earn" && state.transfer && (state.reason === "meate" || state.reason === "host")) {
    window.LumiMeateStore.complete({
      eventId: state.transfer.eventId,
      eventTitle: state.transfer.eventTitle,
      eventType: state.transfer.eventType,
      fanId: state.fanId,
      fanName: state.fanName,
      points: earnDelta(state)
    });
    state.transferCompleted = true;
    /* 완료된 1회성 팬 조회 전달값은 다음 일반 물판 진입에 남기지 않는다. */
    window.LumiPointTransfer = null;
  }

  closeConfirm(root, state);

  if (pending.type === "redeem") {
    state.reward = null;
  }

  syncAll(root, state);
  syncTransferCompletion(root, state);
  showToast(
    root,
    pending.type === "earn"
      ? (state.transfer && (state.reason === "meate" || state.reason === "host") ? "메아테 지정 처리 완료" : "포인트 적립이 저장되었습니다.")
      : "레귤 교환이 저장되었습니다."
  );
}

function resetPanel(root, state, mode) {
  if (mode === "earn") {
    if (state.transfer) {
      showToast(root, "메아테 연동 처리 중입니다. 일반 적립으로 전환 후 변경할 수 있습니다.");
      return;
    }
    state.reason = "ticket";
    state.count = 15;
    state.paymentMethod = "cash";
    root.querySelectorAll("[data-point-reason]").forEach(function (button) {
      button.classList.toggle("is-active", button.getAttribute("data-point-reason") === "ticket");
    });
    root.querySelectorAll("[data-point-payment]").forEach(function (button) {
      button.classList.toggle("is-active", button.getAttribute("data-point-payment") === "cash");
    });
    syncTicketSettingVisibility(root, state);
    syncPresetSelection(root, state);
    syncEarn(root, state);
    showToast(root, "적립 입력을 초기화했습니다.");
    return;
  }

  state.reward = null;
  syncRedeem(root, state);
  showToast(root, "교환 선택을 초기화했습니다.");
}

function showToast(root, message) {
  var toast = root.querySelector("[data-point-toast]");
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  toast.classList.add("is-visible");
  window.clearTimeout(root._pointToastTimer);
  root._pointToastTimer = window.setTimeout(function () {
    toast.classList.remove("is-visible");
    toast.hidden = true;
  }, 2300);
}
