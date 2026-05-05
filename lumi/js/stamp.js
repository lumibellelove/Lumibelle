(() => {
  "use strict";

  const maxStamp = 20;
  const defaultState = {
    round: 1,
    count: 1,
    checkinCount: 1,
    recentDate: "2026.07.12",
    recentEvent: "Debut Live"
  };

  let stampState = { ...defaultState };

  function setText(id, text) {
    const target = document.getElementById(id);
    if (target) target.textContent = text;
  }

  function clamp(value, min, max) {
    const n = Number(value);
    if (!Number.isFinite(n)) return min;
    return Math.min(max, Math.max(min, n));
  }

  function parseStampText(value) {
    const match = String(value || "").match(/(\d+)/);
    return match ? clamp(Number(match[1]), 0, maxStamp) : defaultState.count;
  }

  function normalizeState(input = {}, points = {}) {
    const count = input.count ?? parseStampText(points.stamp);
    return {
      round: clamp(input.round ?? defaultState.round, 1, 99),
      count: clamp(count, 0, maxStamp),
      checkinCount: clamp(input.checkinCount ?? input.count ?? count ?? defaultState.checkinCount, 0, 999),
      recentDate: input.recentDate || defaultState.recentDate,
      recentEvent: input.recentEvent || defaultState.recentEvent
    };
  }

  function formatToday() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}.${m}.${d}`;
  }

  function setMessage(text) {
    setText("stampMessage", text || "");
  }

  function renderStampGrid() {
    const grid = document.getElementById("stampGrid");
    if (!grid) return;

    grid.innerHTML = Array.from({ length: maxStamp }, (_, index) => {
      const number = index + 1;
      const filled = number <= stampState.count;
      return `
        <div class="stamp-cell${filled ? " filled" : ""}">
          <small>${number}</small>
        </div>
      `;
    }).join("");
  }

  function applyStampSummary() {
    const count = clamp(stampState.count, 0, maxStamp);
    const checkinCount = clamp(stampState.checkinCount, 0, 999);
    const stampText = `${count} / ${maxStamp}`;

    setText("stampRoundText", `${stampState.round}회차`);
    setText("stampCount", String(count));
    setText("stampRecentDate", stampState.recentDate);
    setText("stampRecentEvent", stampState.recentEvent);
    setText("homeCheckinCount", `${checkinCount}회`);
    setText("homeStampCount", `${count}개`);
    setText("profileStampValue", stampText);
    setText("profileCheckinChip", `루미 체크인 ${checkinCount}회`);
  }

  function renderAll() {
    renderStampGrid();
    applyStampSummary();
  }

  async function loadStampData() {
    if (!window.LumiData?.getData) {
      stampState = { ...defaultState };
      renderAll();
      return;
    }

    try {
      const data = await window.LumiData.getData();
      stampState = normalizeState(data.stamps || {}, data.points || {});
      renderAll();
    } catch (error) {
      stampState = { ...defaultState };
      renderAll();
    }
  }

  async function saveStampData(message) {
    stampState = normalizeState(stampState, { stamp: `${stampState.count} / ${maxStamp}` });
    renderAll();
    setMessage(message);

    const patch = {
      stamps: { ...stampState },
      points: { stamp: `${stampState.count} / ${maxStamp}` }
    };

    if (window.LumiData?.updateData) {
      try {
        await window.LumiData.updateData(patch);
        return;
      } catch (error) {
        /* fall through to direct localStorage fallback */
      }
    }

    try {
      const key = window.LumiData?.storageKey || "lumiphone.stage59.localData";
      const current = JSON.parse(window.localStorage.getItem(key) || "{}");
      const next = {
        ...current,
        stamps: { ...stampState },
        points: { ...(current.points || {}), stamp: `${stampState.count} / ${maxStamp}` }
      };
      window.localStorage.setItem(key, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent("lumi:data-updated", { detail: next }));
    } catch (error) {
      /* ignore storage fallback errors */
    }
  }

  function addCheckin() {
    if (stampState.count >= maxStamp) {
      setMessage("이번 회차 스탬프가 모두 채워졌어요. 다음 회차는 운영 확인 후 시작해요.");
      return;
    }

    stampState = {
      ...stampState,
      count: stampState.count + 1,
      checkinCount: stampState.checkinCount + 1,
      recentDate: formatToday(),
      recentEvent: "루미 체크인"
    };
    saveStampData("루미 체크인 기록이 저장됐어요. 홈/프로필/스탬프에 함께 반영돼요.");
  }

  function adjustStamp(delta) {
    const nextCount = clamp(stampState.count + delta, 0, maxStamp);
    stampState = {
      ...stampState,
      count: nextCount,
      checkinCount: Math.max(nextCount, stampState.checkinCount)
    };
    saveStampData(delta > 0 ? "스탬프가 1개 추가됐어요." : "스탬프가 1개 줄었어요.");
  }

  function boot() {
    const addButton = document.getElementById("stampAddTest");
    const prevButton = document.getElementById("stampPrev");
    const nextButton = document.getElementById("stampNext");

    if (addButton) addButton.addEventListener("click", addCheckin);
    if (prevButton) prevButton.addEventListener("click", () => adjustStamp(-1));
    if (nextButton) nextButton.addEventListener("click", () => adjustStamp(1));

    window.addEventListener("lumi:data-updated", (event) => {
      const data = event.detail || {};
      if (!data.stamps && !data.points?.stamp) return;
      stampState = normalizeState(data.stamps || stampState, data.points || {});
      renderAll();
    });

    loadStampData();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
