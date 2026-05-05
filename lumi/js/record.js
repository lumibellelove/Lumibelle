(() => {
  "use strict";

  const baseRecords = [
    { key: "base-live", icon: "🎤", date: "2026.07.12", title: "Debut Live 입장 준비", desc: "입장번호 0001 · 메아테 루루", cat: "라이브" },
    { key: "base-visit", icon: "💗", date: "2026.07.12", title: "첫 루미 방문", desc: "와준 순간을 남기는 방문 기록", cat: "체크인" },
    { key: "base-checkin", icon: "📸", date: "2026.07.12", title: "첫 루미 체크인", desc: "촬영 · 교류 참여 완료 / 스탬프 +1", cat: "체크인" },
    { key: "base-ticket", icon: "🎟️", date: "2026.07.12", title: "LUMI PASS 기록", desc: "티켓과 공연 기록 보관", cat: "티켓" },
    { key: "base-online", icon: "📡", date: "2026.07.12", title: "온라인 연결", desc: "ON AIR 방문 기록", cat: "온라인" },
    { key: "base-cheer", icon: "✨", date: "2026.07.12", title: "반짝 응원", desc: "온라인 응원 기록", cat: "온라인" }
  ];

  let records = baseRecords.slice();
  let currentFilter = "전체";
  let currentPage = 1;
  const pageSize = 4;

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>\"]/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;"
    }[char]));
  }

  function todayLabel() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}.${m}.${d}`;
  }

  function normalizeDate(value, fallback = "2026.07.12") {
    if (!value) return fallback;
    const raw = String(value).slice(0, 10).replace(/-/g, ".");
    return /^\d{4}\.\d{2}\.\d{2}$/.test(raw) ? raw : fallback;
  }

  function addUnique(list, item) {
    const key = item.key || `${item.date}-${item.title}-${item.cat}`;
    if (list.some((existing) => (existing.key || `${existing.date}-${existing.title}-${existing.cat}`) === key)) return;
    list.push({ ...item, key });
  }

  function buildDynamicRecords(data = {}) {
    const list = [];
    const ticketStates = data.ticketStates || {};
    const stamps = data.stamps || {};
    const onair = data.onair || {};
    const pointLogs = Array.isArray(data.pointLogs) ? data.pointLogs : [];
    const letters = Array.isArray(data.letters) ? data.letters : [];
    const recordEvents = Array.isArray(data.recordEvents) ? data.recordEvents : [];

    Object.entries(ticketStates).forEach(([id, state]) => {
      if (!state || state.status !== "done") return;
      addUnique(list, {
        key: `ticket-${id}`,
        icon: id.includes("birthday") ? "🎂" : id.includes("welcome") ? "🎟️" : "🎫",
        date: normalizeDate(state.date, todayLabel()),
        title: state.title ? `${state.title} 기록 완료` : "티켓 상태 기록 완료",
        desc: state.kind ? `${state.kind} · 이 기기에 저장된 티켓 기록` : "이 기기에 저장된 티켓 기록",
        cat: "티켓"
      });
    });

    const checkinCount = Number(stamps.checkinCount || 0);
    const stampCount = Number(stamps.count || 0);
    if (checkinCount > 0) {
      addUnique(list, {
        key: "stamp-checkin-current",
        icon: "🌸",
        date: normalizeDate(stamps.recentDate, todayLabel()),
        title: `루미 체크인 ${checkinCount}회`,
        desc: `스탬프 ${stampCount || checkinCount}개 · ${stamps.recentEvent || "체크인 기록"}`,
        cat: "체크인"
      });
    }

    if (onair.certified || Number(onair.joinCount || 0) > 0) {
      addUnique(list, {
        key: "onair-certified-current",
        icon: "📡",
        date: todayLabel(),
        title: "ON AIR 루미코드 인증",
        desc: `방송 참여 ${Number(onair.joinCount || 1)}회 · 반짝 포인트/XP 기록`,
        cat: "온라인"
      });
    }

    pointLogs.slice(0, 12).forEach((log, index) => {
      const amount = String(log.amount || "");
      const isExchange = amount.startsWith("-") || String(log.desc || "").includes("교환");
      const isOnair = String(log.title || "").includes("ON AIR") || String(log.desc || "").includes("방송");
      if (!isExchange && !isOnair) return;
      addUnique(list, {
        key: `point-${log.date || "local"}-${log.title || index}-${amount}`,
        icon: isExchange ? "🎁" : "✨",
        date: normalizeDate(log.date, todayLabel()),
        title: log.title || (isExchange ? "교환소 사용" : "온라인 기록"),
        desc: `${log.type || "포인트"} ${amount} · ${log.desc || "루미폰 기록"}`,
        cat: "온라인"
      });
    });

    letters.forEach((letter) => {
      addUnique(list, {
        key: `letter-${letter.id}`,
        icon: letter.icon || "💌",
        date: normalizeDate(letter.keptAt, todayLabel()),
        title: `${letter.title || "우편"} 소장`,
        desc: `${letter.cat || "우편"} · 소장 우편에 보관된 기록`,
        cat: "온라인"
      });
    });

    recordEvents.forEach((event, index) => {
      if (!event) return;
      addUnique(list, {
        key: event.key || `event-${index}`,
        icon: event.icon || "✨",
        date: normalizeDate(event.date, todayLabel()),
        title: event.title || "루미폰 기록",
        desc: event.desc || "루미폰에 저장된 기록이에요.",
        cat: event.cat || "온라인"
      });
    });

    return list;
  }

  function sortRecords(list) {
    return list.slice().sort((a, b) => String(b.date).localeCompare(String(a.date)) || String(a.key).localeCompare(String(b.key)));
  }

  function buildRecords(data) {
    const dynamic = buildDynamicRecords(data);
    const merged = [];
    sortRecords([...dynamic, ...baseRecords]).forEach((item) => addUnique(merged, item));
    return merged;
  }

  function getFilteredRecords() {
    if (currentFilter === "전체") return records;
    return records.filter((item) => item.cat === currentFilter);
  }

  function renderSummary(data = {}) {
    const summaryCards = document.querySelectorAll("#page-record .record-summary-grid .summary-card b");
    if (!summaryCards.length) return;

    const liveCount = Math.max(1, records.filter((item) => item.cat === "라이브" || item.cat === "티켓").length - 1);
    const checkinCount = Number(data.stamps?.checkinCount || 1);
    const stampCount = Number(data.stamps?.count || 1);

    if (summaryCards[0]) summaryCards[0].textContent = `${liveCount}회`;
    if (summaryCards[1]) summaryCards[1].textContent = `${checkinCount}회`;
    if (summaryCards[2]) summaryCards[2].textContent = `${stampCount}개`;
  }

  function renderRecords() {
    const list = document.getElementById("recordMemoryList");
    const pageText = document.getElementById("recordMemoryPageText");
    const prev = document.getElementById("recordMemoryPrev");
    const next = document.getElementById("recordMemoryNext");
    if (!list) return;

    const filtered = getFilteredRecords();
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    currentPage = Math.max(1, Math.min(currentPage, totalPages));
    const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    if (!visible.length) {
      list.innerHTML = `<div class="record-empty">아직 표시할 기록이 없어요.</div>`;
    } else {
      list.innerHTML = visible.map((item) => `
        <button type="button" class="record-split-card">
          <span class="record-split-icon">${escapeHtml(item.icon)}</span>
          <span class="record-split-date">${escapeHtml(item.date)}</span>
          <b>${escapeHtml(item.title)}</b>
          <em>${escapeHtml(item.cat)}</em>
          <small>${escapeHtml(item.desc)}</small>
        </button>
      `).join("");
    }

    if (pageText) pageText.textContent = currentPage + " / " + totalPages;
    if (prev) prev.disabled = currentPage <= 1;
    if (next) next.disabled = currentPage >= totalPages;
  }

  async function syncFromData() {
    let data = {};
    if (window.LumiData?.getData) {
      try {
        data = await window.LumiData.getData();
      } catch (error) {
        data = {};
      }
    }
    records = buildRecords(data);
    renderSummary(data);
    renderRecords();
  }

  function boot() {
    document.querySelectorAll("[data-record-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        currentFilter = button.dataset.recordFilter || "전체";
        currentPage = 1;
        document.querySelectorAll("[data-record-filter]").forEach((item) => item.classList.toggle("active", item === button));
        renderRecords();
      });
    });

    const prev = document.getElementById("recordMemoryPrev");
    const next = document.getElementById("recordMemoryNext");
    if (prev) prev.addEventListener("click", () => { currentPage -= 1; renderRecords(); });
    if (next) next.addEventListener("click", () => { currentPage += 1; renderRecords(); });

    window.addEventListener("lumi:data-updated", () => syncFromData());
    syncFromData();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
