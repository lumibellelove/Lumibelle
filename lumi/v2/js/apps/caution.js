/**
 * caution.js — Staff OS 주의 체크
 *
 * - 닉네임 또는 루미 ID 4자리 조회 (예: 1024 → LB-1024)
 * - 주의 항목 복수 선택 / 상세 메모 / 저장 / 해제 / 이력 보기
 * - 현재는 localStorage 임시 저장이며, 새 스탭 DB API 연결 시 CautionStore만 교체
 */

window.LumiApps = window.LumiApps || {};

var CautionStore = (function () {
  var STORAGE_KEY = "lumibelle_staff_caution_v1";

  function defaultData() {
    return {
      version: 1,
      fans: {
        "LB-1024": {
          name: "ringnami",
          active: true,
          selected: ["무리한 요구", "폭언·비하"],
          memo: "현장 안내 후에도 동일한 요구를 반복함.\n다음 참여 시 스탭 동행 및 사전 안내 필요.",
          updatedAt: "2026-06-15T12:00:00.000Z",
          history: [
            {
              id: "ct_0615",
              createdAt: "2026-06-15T12:00:00.000Z",
              action: "save",
              items: ["무리한 요구"],
              memo: "현장 안내 후에도 동일한 요구를 반복함.",
              staff: "마리링",
              eventTitle: "Shine Me UP : 루미벨 데뷔 라이브",
              area: "특전회",
              member: "마리링",
              benefit: "샤메",
              queueNumber: "#045",
              actionTaken: "규정 재안내"
            },
            {
              id: "ct_0612",
              createdAt: "2026-06-12T12:00:00.000Z",
              action: "save",
              items: ["폭언·비하"],
              memo: "",
              staff: "루루",
              eventTitle: "Shine Me UP : 루미벨 데뷔 라이브",
              area: "특전회",
              member: "루루",
              benefit: "핀체키",
              queueNumber: "#032",
              actionTaken: "구두 안내"
            }
          ]
        }
      }
    };
  }

  function read() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultData();
      var data = JSON.parse(raw);
      if (!data || typeof data !== "object" || !data.fans) return defaultData();
      return data;
    } catch (error) {
      return defaultData();
    }
  }

  function write(data) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      return false;
    }
  }

  function normalizeId(value) {
    var raw = String(value || "").trim().toUpperCase();
    var match = raw.match(/^LB[\s\-_]?(\d+)$/);
    var digits = match ? match[1] : raw.replace(/\D/g, "");
    if (!digits) return "";
    return "LB-" + digits.slice(-4).padStart(4, "0");
  }

  function findByName(data, value) {
    var target = String(value || "").trim().toLocaleLowerCase();
    if (!target) return "";
    return Object.keys(data.fans).find(function (id) {
      return String(data.fans[id].name || "").trim().toLocaleLowerCase() === target;
    }) || "";
  }

  function lookup(value) {
    var data = read();
    var key = normalizeId(value) || findByName(data, value);

    if (!key || !data.fans[key]) {
      return {
        ok: false,
        message: "등록된 닉네임 또는 루미 ID를 찾지 못했습니다."
      };
    }

    return {
      ok: true,
      id: key,
      fan: data.fans[key]
    };
  }

  function update(id, patch) {
    var data = read();
    var key = normalizeId(id);
    if (!key || !data.fans[key]) return { ok: false, message: "팬 정보를 찾지 못했습니다." };

    var fan = data.fans[key];
    Object.keys(patch).forEach(function (name) {
      fan[name] = patch[name];
    });

    if (!write(data)) return { ok: false, message: "브라우저 저장에 실패했습니다." };
    return { ok: true, id: key, fan: fan };
  }

  function addRecord(id, record) {
    var data = read();
    var key = normalizeId(id);
    if (!key || !data.fans[key]) return { ok: false, message: "팬 정보를 찾지 못했습니다." };

    var fan = data.fans[key];
    fan.history = Array.isArray(fan.history) ? fan.history : [];
    fan.history.unshift(record);
    fan.updatedAt = record.createdAt;

    if (!write(data)) return { ok: false, message: "브라우저 저장에 실패했습니다." };
    return { ok: true, id: key, fan: fan };
  }

  return {
    lookup: lookup,
    update: update,
    addRecord: addRecord
  };
})();

window.LumiCautionContext = window.LumiCautionContext || null;

window.LumiApps.caution = function () {
  setTimeout(bindCautionApp, 0);

  return (
    '<section class="caution-app" data-caution-app>' +
      '<header class="caution-titlebar">' +
        '<div><span>🎀</span><h2>주의 체크</h2><span>🎀</span></div>' +
      '</header>' +

      '<article class="caution-card caution-fan-card">' +
        '<header><b>1</b><strong>팬 찾기</strong></header>' +
        '<div class="caution-search-row">' +
          '<label><span aria-hidden="true">⌕</span><input type="text" value="1024" placeholder="닉네임 또는 ID 번호 입력" data-caution-lookup-input /></label>' +
          '<button type="button" data-caution-lookup>조회</button>' +
        '</div>' +
        '<div class="caution-fan-result" data-caution-fan-result>' +
          '<div class="caution-avatar" aria-hidden="true"><span>🎀</span><i>♡</i></div>' +
          '<div class="caution-fan-copy"><span>닉네임</span><strong data-caution-name>ringnami</strong><em>루미 ID</em><b data-caution-id>LB-1024</b></div>' +
          '<div class="caution-fan-tags"><span>♡ 오늘 방문</span><span>▣ 특전 참여 2회</span><span class="is-alert">⚠ 주의 메모 있음</span></div>' +
        '</div>' +
      '</article>' +

      '<article class="caution-card caution-state-card">' +
        '<header><b>2</b><strong>주의 상태</strong></header>' +
        '<div class="caution-state-grid">' +
          '<div><span>현재 단계</span><strong data-caution-state>주의</strong></div>' +
          '<div><span>최근 기록</span><strong data-caution-count>2건</strong></div>' +
          '<div><span>마지막 확인</span><strong data-caution-last>오늘</strong></div>' +
        '</div>' +
      '</article>' +

      '<article class="caution-card caution-items-card">' +
        '<header><b>3</b><strong>주의 사유 선택</strong></header>' +
        '<div class="caution-item-grid">' +
          cautionOption("무리한 요구", "↻") +
          cautionOption("폭언·비하", "☁") +
          cautionOption("성희롱", "⚠") +
          cautionOption("접촉·추행", "✕") +
          cautionOption("촬영·녹음", "◉") +
          cautionOption("사적 연락", "✉") +
          cautionOption("운영 방해", "⚑") +
          cautionOption("위협 행동", "△") +
          cautionOption("기타", "◌") +
        '</div>' +
      '</article>' +

      '<article class="caution-card caution-context-card">' +
        '<header><b>4</b><strong>발생 정보</strong></header>' +
        '<div class="caution-event-line"><span>공연</span><strong data-caution-event-title>Shine Me UP : 루미벨 데뷔 라이브</strong><em>자동</em></div>' +
        '<div class="caution-context-grid">' +
          '<label><span>발생 구역</span><select data-caution-area>' +
            '<option value="특전회">특전회</option><option value="입장">입장</option><option value="물판">물판</option><option value="공연장">공연장</option><option value="기타">기타</option>' +
          '</select></label>' +
          '<label><span>현장 조치</span><select data-caution-action>' +
            '<option value="구두 안내">구두 안내</option><option value="규정 재안내">규정 재안내</option><option value="책임자 호출">책임자 호출</option><option value="참여 중단 안내">참여 중단 안내</option><option value="퇴장 안내">퇴장 안내</option><option value="기타">기타</option>' +
          '</select></label>' +
        '</div>' +
        '<p>체키·대기·입장 화면에서 바로 열면 멤버·특전·대기번호도 자동으로 함께 기록됩니다.</p>' +
      '</article>' +

      '<article class="caution-card caution-memo-card">' +
        '<header><b>5</b><strong>상세 상황</strong></header>' +
        '<textarea data-caution-memo placeholder="무슨 말·행동이 있었는지, 안내 뒤 어떤 반응이 있었는지 사실 중심으로 기록해주세요."></textarea>' +
      '</article>' +

      '<article class="caution-card caution-history-card">' +
        '<header><b>6</b><strong>이전 기록</strong><button type="button" data-caution-history-toggle>더보기 ›</button></header>' +
        '<div class="caution-history-list" data-caution-history></div>' +
      '</article>' +

      '<div class="caution-action-row">' +
        '<button type="button" class="caution-save-button" data-caution-save>▣ 주의 저장</button>' +
        '<button type="button" class="caution-clear-button" data-caution-clear>⊘ 주의 해제</button>' +
      '</div>' +

      '<section class="caution-history-view" data-caution-history-view hidden aria-label="주의 이력">' +
        '<header class="caution-history-view-head">' +
          '<button type="button" data-caution-history-close aria-label="주의 이력 닫기">‹</button>' +
          '<div><span>팬 주의 기록</span><h2>주의 이력</h2></div>' +
        '</header>' +
        '<article class="caution-history-fan-summary">' +
          '<div class="caution-history-mini-avatar" aria-hidden="true">🎀</div>' +
          '<div><strong data-caution-history-name>ringnami</strong><span data-caution-history-id>LB-1024</span></div>' +
          '<em data-caution-history-state>현재 주의</em>' +
        '</article>' +
        '<p class="caution-history-guide">기록은 삭제되지 않으며, 주의 해제 후에도 이력으로 남습니다.</p>' +
        '<div class="caution-history-full-list" data-caution-history-full></div>' +
      '</section>' +

      '<div class="caution-toast" data-caution-toast hidden role="status" aria-live="polite"></div>' +
    '</section>'
  );
};

function cautionOption(label, icon) {
  return '<button type="button" data-caution-option="' + label + '"><span>' + icon + '</span><strong>' + label + '</strong><em>✓</em></button>';
}

function bindCautionApp() {
  var root = document.querySelector("[data-caution-app]");
  if (!root || root.getAttribute("data-caution-bound") === "true") return;
  root.setAttribute("data-caution-bound", "true");

  var result = CautionStore.lookup("1024");
  if (!result.ok) return;

  var state = {
    fanId: result.id,
    fan: result.fan,
    historyOpen: false,
    context: Object.assign({
      eventTitle: "Shine Me UP : 루미벨 데뷔 라이브",
      area: "특전회",
      member: "",
      benefit: "",
      queueNumber: "",
      actionTaken: "구두 안내"
    }, window.LumiCautionContext || {})
  };

  renderCaution(root, state);

  var lookupInput = root.querySelector("[data-caution-lookup-input]");
  if (lookupInput) {
    lookupInput.addEventListener("keydown", function (event) {
      if (event.key !== "Enter") return;
      event.preventDefault();
      var button = root.querySelector("[data-caution-lookup]");
      if (button) button.click();
    });
  }

  root.addEventListener("click", function (event) {
    if (event.target.closest("[data-caution-lookup]")) {
      var input = root.querySelector("[data-caution-lookup-input]");
      var found = CautionStore.lookup(input ? input.value : "");

      if (!found.ok) {
        showCautionToast(root, found.message);
        return;
      }

      state.fanId = found.id;
      state.fan = found.fan;
      state.historyOpen = false;
      root.querySelector("[data-caution-history-view]").hidden = true;
      renderCaution(root, state);
      showCautionToast(root, "팬 정보를 불러왔습니다.");
      return;
    }

    var option = event.target.closest("[data-caution-option]");
    if (option) {
      option.classList.toggle("is-selected");
      return;
    }

    if (event.target.closest("[data-caution-save]")) {
      saveCaution(root, state);
      return;
    }

    if (event.target.closest("[data-caution-clear]")) {
      clearCaution(root, state);
      return;
    }

    if (event.target.closest("[data-caution-history-toggle]")) {
      state.historyOpen = true;
      renderHistoryView(root, state);
      root.querySelector("[data-caution-history-view]").hidden = false;
      return;
    }

    if (event.target.closest("[data-caution-history-close]")) {
      state.historyOpen = false;
      root.querySelector("[data-caution-history-view]").hidden = true;
      return;
    }

  });
}

function renderCaution(root, state) {
  var fan = state.fan;
  root.querySelector("[data-caution-name]").textContent = fan.name || "이름 없음";
  root.querySelector("[data-caution-id]").textContent = state.fanId;
  root.querySelector("[data-caution-lookup-input]").value = state.fanId.replace(/^LB-/, "");

  root.querySelector("[data-caution-state]").textContent = fan.active ? "주의" : "정상";
  root.querySelector("[data-caution-state]").closest("div").classList.toggle("is-normal", !fan.active);

  var records = Array.isArray(fan.history) ? fan.history : [];
  root.querySelector("[data-caution-count]").textContent = records.length + "건";
  root.querySelector("[data-caution-last]").textContent = formatCautionLast(fan.updatedAt);

  var noteTag = root.querySelector(".caution-fan-tags .is-alert");
  if (noteTag) noteTag.hidden = !fan.active;

  root.querySelectorAll("[data-caution-option]").forEach(function (button) {
    var label = button.getAttribute("data-caution-option");
    button.classList.toggle("is-selected", (fan.selected || []).indexOf(label) > -1);
  });

  root.querySelector("[data-caution-memo]").value = fan.memo || "";
  root.querySelector("[data-caution-event-title]").textContent = state.context.eventTitle || "현재 공연 미연결";
  root.querySelector("[data-caution-area]").value = state.context.area || "특전회";
  root.querySelector("[data-caution-action]").value = state.context.actionTaken || "구두 안내";
  renderHistory(root, state);
}

function renderHistory(root, state) {
  var records = Array.isArray(state.fan.history) ? state.fan.history : [];
  var visible = records.slice(0, 2);
  var list = root.querySelector("[data-caution-history]");

  list.innerHTML = visible.length ? visible.map(function (record) {
    var date = formatCautionDate(record.createdAt);
    var label = record.action === "clear" ? "주의 해제" : (record.items || []).join(" · ");
    return '<article class="' + (record.action === "clear" ? "is-clear" : "") + '">' +
      '<span>▣</span><time>' + date + '</time><i></i><strong>' + escapeCaution(label) + '</strong><em>담당: ' + escapeCaution(record.staff || "스탭") + '</em>' +
    '</article>';
  }).join("") : '<p class="caution-empty-history">이전 기록이 없습니다.</p>';

}

function renderHistoryView(root, state) {
  var fan = state.fan;
  var records = Array.isArray(fan.history) ? fan.history : [];
  var view = root.querySelector("[data-caution-history-view]");
  if (!view) return;

  view.querySelector("[data-caution-history-name]").textContent = fan.name || "이름 없음";
  view.querySelector("[data-caution-history-id]").textContent = state.fanId;
  var stateLabel = view.querySelector("[data-caution-history-state]");
  stateLabel.textContent = fan.active ? "현재 주의" : "현재 정상";
  stateLabel.classList.toggle("is-normal", !fan.active);

  var full = view.querySelector("[data-caution-history-full]");
  if (!records.length) {
    full.innerHTML = '<p class="caution-history-full-empty">저장된 주의 기록이 없습니다.</p>';
    return;
  }

  full.innerHTML = records.map(function (record) {
    var isClear = record.action === "clear";
    var title = isClear ? "주의 해제" : ((record.items || []).length ? record.items.join(" · ") : "상세 메모");
    var memo = record.memo ? escapeCaution(record.memo).replace(/\n/g, "<br>") : "상세 메모 없음";
    var eventLine = record.eventTitle ? '<div class="caution-history-event">' + escapeCaution(record.eventTitle) + '</div>' : "";
    var contextBits = [];
    if (record.area) contextBits.push(record.area);
    if (record.member) contextBits.push(record.member);
    if (record.benefit) contextBits.push(record.benefit);
    if (record.queueNumber) contextBits.push(record.queueNumber);
    var contextLine = contextBits.length ? '<div class="caution-history-context">' + escapeCaution(contextBits.join(" · ")) + '</div>' : "";
    var actionLine = !isClear && record.actionTaken ? '<div class="caution-history-action"><span>현장 조치</span><strong>' + escapeCaution(record.actionTaken) + '</strong></div>' : "";
    return (
      '<article class="caution-history-detail-card ' + (isClear ? "is-clear" : "") + '">' +
        '<div class="caution-history-detail-top">' +
          '<span>' + (isClear ? "해제" : "주의") + '</span>' +
          '<time>' + formatCautionDateTime(record.createdAt) + '</time>' +
        '</div>' +
        '<strong>' + escapeCaution(title) + '</strong>' +
        eventLine +
        contextLine +
        '<p>' + memo + '</p>' +
        actionLine +
        '<footer>담당: ' + escapeCaution(record.staff || "스탭") + '</footer>' +
      '</article>'
    );
  }).join("");
}

function saveCaution(root, state) {
  var selected = Array.prototype.slice.call(root.querySelectorAll("[data-caution-option].is-selected")).map(function (button) {
    return button.getAttribute("data-caution-option");
  });
  var memo = root.querySelector("[data-caution-memo]").value.trim();
  state.context.area = root.querySelector("[data-caution-area]").value;
  state.context.actionTaken = root.querySelector("[data-caution-action]").value;

  if (!selected.length && !memo) {
    showCautionToast(root, "주의 항목 또는 상세 메모를 입력해주세요.");
    return;
  }

  var now = new Date().toISOString();
  var patch = {
    active: true,
    selected: selected,
    memo: memo,
    updatedAt: now
  };

  var updated = CautionStore.update(state.fanId, patch);
  if (!updated.ok) {
    showCautionToast(root, updated.message);
    return;
  }

  var history = CautionStore.addRecord(state.fanId, {
    id: "ct_" + Date.now(),
    createdAt: now,
    action: "save",
    items: selected,
    memo: memo,
    staff: "현재 스탭",
    eventTitle: state.context.eventTitle || "",
    area: state.context.area || "",
    member: state.context.member || "",
    benefit: state.context.benefit || "",
    queueNumber: state.context.queueNumber || "",
    actionTaken: state.context.actionTaken || ""
  });

  if (!history.ok) {
    showCautionToast(root, history.message);
    return;
  }

  state.fan = history.fan;
  renderCaution(root, state);
  if (state.historyOpen) renderHistoryView(root, state);
  showCautionToast(root, "주의 기록이 저장되었습니다.");
}

function clearCaution(root, state) {
  var now = new Date().toISOString();
  var updated = CautionStore.update(state.fanId, {
    active: false,
    selected: [],
    memo: "",
    updatedAt: now
  });

  if (!updated.ok) {
    showCautionToast(root, updated.message);
    return;
  }

  var history = CautionStore.addRecord(state.fanId, {
    id: "ct_" + Date.now(),
    createdAt: now,
    action: "clear",
    items: [],
    memo: "",
    staff: "현재 스탭"
  });

  if (!history.ok) {
    showCautionToast(root, history.message);
    return;
  }

  state.fan = history.fan;
  renderCaution(root, state);
  if (state.historyOpen) renderHistoryView(root, state);
  showCautionToast(root, "현재 주의 상태를 해제했습니다.");
}

function formatCautionDate(value) {
  var date = new Date(value);
  if (Number.isNaN(date.getTime())) return "기록 없음";
  return String(date.getMonth() + 1).padStart(2, "0") + "." + String(date.getDate()).padStart(2, "0");
}

function formatCautionDateTime(value) {
  var date = new Date(value);
  if (Number.isNaN(date.getTime())) return "기록 없음";
  return String(date.getFullYear()).slice(-2) + "." +
    String(date.getMonth() + 1).padStart(2, "0") + "." +
    String(date.getDate()).padStart(2, "0") + " · " +
    String(date.getHours()).padStart(2, "0") + ":" +
    String(date.getMinutes()).padStart(2, "0");
}

function formatCautionLast(value) {
  if (!value) return "기록 없음";
  var date = new Date(value);
  if (Number.isNaN(date.getTime())) return "기록 없음";
  var today = new Date();
  var sameDay = date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();
  return sameDay ? "오늘" : formatCautionDate(value);
}

function escapeCaution(value) {
  return String(value || "").replace(/[&<>"']/g, function (char) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
  });
}

function showCautionToast(root, message) {
  var toast = root.querySelector("[data-caution-toast]");
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  toast.classList.add("is-visible");
  window.clearTimeout(root._cautionToastTimer);
  root._cautionToastTimer = window.setTimeout(function () {
    toast.classList.remove("is-visible");
    toast.hidden = true;
  }, 2300);
}
