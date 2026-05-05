(() => {
  "use strict";

  const defaultPointLogs = [
    { date: "2026.07.12", type: "반짝 포인트", title: "데뷔 라이브 ON AIR 참여", desc: "루미코드 인증 보상", amount: "+50P" },
    { date: "2026.07.12", type: "반짝 XP", title: "첫 온라인 연결 기록", desc: "방송 참여 성장 기록", amount: "+50XP" },
    { date: "2026.07.12", type: "물판 포인트", title: "특전권 15장 기준 적립", desc: "현장 물판 보상용 포인트", amount: "+1P" },
    { date: "2026.07.12", type: "반짝 포인트", title: "반짝 응원 참여", desc: "온라인 응원 기록", amount: "+30P" },
    { date: "2026.07.12", type: "반짝 XP", title: "첫 루미 체크인", desc: "특전회 참여 성장 기록", amount: "+70XP" },
    { date: "2026.07.12", type: "반짝 포인트", title: "닉네임 콜 교환", desc: "교환소 사용 기록", amount: "-50P", minus: true }
  ];

  const defaultPoints = { merchPoint: 0, sparkPoint: 180, sparkXp: 120, stamp: "1 / 20" };
  const filterLabels = new Set(["전체", "반짝 포인트", "반짝 XP", "물판 포인트"]);

  let pointLogs = [...defaultPointLogs];
  let currentFilter = "전체";
  let currentPage = 1;
  const perPage = 3;

  function setText(id, text) {
    const target = document.getElementById(id);
    if (target) target.textContent = text;
  }

  function numberText(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? String(n) : String(fallback);
  }

  function toNumber(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function normalizeAmount(amount) {
    const text = String(amount || "").trim();
    if (!text) return "0P";
    return text.replace(/\s+/g, "");
  }

  function getLogKind(item) {
    const amount = normalizeAmount(item.amount);
    const type = String(item.type || "");
    if (item.minus || amount.startsWith("-")) return "minus";
    if (type.includes("XP") || amount.toUpperCase().includes("XP")) return "xp";
    if (type.includes("물판")) return "merch";
    return "plus";
  }

  function normalizeLog(item, index) {
    const base = item && typeof item === "object" ? item : {};
    const normalizedType = filterLabels.has(base.type) ? base.type : (base.type || "반짝 포인트");
    return {
      id: base.id || base.createdAt || `${base.date || "날짜 없음"}-${base.title || "기록"}-${base.amount || "0"}-${index}`,
      date: base.date || "날짜 없음",
      type: normalizedType,
      title: base.title || "포인트 기록",
      desc: base.desc || "루미폰 활동 기록",
      amount: normalizeAmount(base.amount),
      minus: Boolean(base.minus) || normalizeAmount(base.amount).startsWith("-"),
      createdAt: base.createdAt || "",
      _index: index
    };
  }

  function normalizeLogs(logs) {
    const source = Array.isArray(logs) ? logs : [];
    const seenIds = new Set();
    return source.map(normalizeLog).filter((item) => {
      if (!item.id) return true;
      if (seenIds.has(item.id)) return false;
      seenIds.add(item.id);
      return true;
    });
  }

  function applyPointSummary(points = {}) {
    const merged = { ...defaultPoints, ...(points || {}) };
    const merchPoint = numberText(merged.merchPoint, 0);
    const sparkPoint = numberText(merged.sparkPoint, 180);
    const sparkXp = numberText(merged.sparkXp, 120);
    const stamp = merged.stamp || "1 / 20";

    setText("twinklePointBalance", sparkPoint);
    setText("twinkleXpBalance", sparkXp);
    setText("boothPointBalance", merchPoint);
    setText("exchangeBalanceValue", `${sparkPoint}p`);
    setText("exchangeBalanceHint", toNumber(merged.sparkPoint, 0) > 0 ? "교환 가능한 반짝 포인트" : "반짝 포인트를 모아 교환해요");
    setText("homeSparkXpValue", sparkXp);
    setText("profileMerchPointValue", `${merchPoint}P`);
    setText("profileSparkPointValue", `${sparkPoint}P`);
    setText("profileSparkXpValue", `${sparkXp}XP`);
    setText("profileStampValue", stamp);
  }

  function getFilteredLogs() {
    if (currentFilter === "전체") return pointLogs;
    return pointLogs.filter((item) => item.type === currentFilter);
  }

  function ensureStatusNode() {
    const title = document.querySelector("#page-point .point-section-title");
    if (!title) return null;
    let status = document.getElementById("pointLedgerStatus");
    if (!status) {
      status = document.createElement("div");
      status.id = "pointLedgerStatus";
      status.className = "point-ledger-status";
      title.insertAdjacentElement("afterend", status);
    }
    return status;
  }

  function updateStatus(totalCount, filteredCount) {
    const status = ensureStatusNode();
    if (!status) return;
    const label = currentFilter === "전체" ? "전체 기록" : currentFilter;
    status.textContent = `${label} ${filteredCount}개 · 전체 ${totalCount}개`;
  }

  function renderPointLedger() {
    const list = document.getElementById("pointLedgerList");
    const pageText = document.getElementById("pointLedgerPageText");
    const prev = document.getElementById("pointLedgerPrev");
    const next = document.getElementById("pointLedgerNext");
    if (!list) return;

    const logs = getFilteredLogs();
    const totalPages = Math.max(1, Math.ceil(logs.length / perPage));
    currentPage = Math.min(Math.max(1, currentPage), totalPages);
    const start = (currentPage - 1) * perPage;
    const pageItems = logs.slice(start, start + perPage);

    updateStatus(pointLogs.length, logs.length);

    if (!pageItems.length) {
      list.innerHTML = `<div class="point-empty">아직 표시할 포인트 기록이 없어요.</div>`;
    } else {
      list.innerHTML = pageItems.map((item) => {
        const kind = getLogKind(item);
        const badge = kind === "minus" ? "사용" : (kind === "xp" ? "성장" : (kind === "merch" ? "현장" : "적립"));
        return `
          <article class="point-ledger-card point-log-${kind}">
            <div class="point-ledger-main">
              <div class="point-ledger-meta">
                <small>${escapeHtml(item.date)} · ${escapeHtml(item.type)}</small>
                <em>${badge}</em>
              </div>
              <b>${escapeHtml(item.title)}</b>
              <span>${escapeHtml(item.desc)}</span>
            </div>
            <div class="point-ledger-amount ${kind}">${escapeHtml(item.amount)}</div>
          </article>
        `;
      }).join("");
    }

    if (pageText) pageText.textContent = `${currentPage} / ${totalPages}`;
    if (prev) prev.disabled = currentPage <= 1;
    if (next) next.disabled = currentPage >= totalPages;
  }

  async function loadPointData() {
    if (!window.LumiData?.getData) {
      pointLogs = normalizeLogs(defaultPointLogs);
      applyPointSummary({ merchPoint: 1, sparkPoint: 180, sparkXp: 120, stamp: "1 / 20" });
      renderPointLedger();
      return;
    }

    try {
      const data = await window.LumiData.getData();
      pointLogs = normalizeLogs(Array.isArray(data.pointLogs) ? data.pointLogs : defaultPointLogs);
      applyPointSummary(data.points || defaultPoints);
    } catch (error) {
      pointLogs = normalizeLogs(defaultPointLogs);
      applyPointSummary({ merchPoint: 1, sparkPoint: 180, sparkXp: 120, stamp: "1 / 20" });
    }
    renderPointLedger();
  }

  function boot() {
    document.querySelectorAll("[data-point-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        currentFilter = button.dataset.pointFilter || "전체";
        currentPage = 1;
        document.querySelectorAll("[data-point-filter]").forEach((item) => {
          item.classList.toggle("active", item === button);
        });
        renderPointLedger();
      });
    });

    const prev = document.getElementById("pointLedgerPrev");
    const next = document.getElementById("pointLedgerNext");

    if (prev) {
      prev.addEventListener("click", () => {
        currentPage = Math.max(1, currentPage - 1);
        renderPointLedger();
      });
    }

    if (next) {
      next.addEventListener("click", () => {
        const totalPages = Math.max(1, Math.ceil(getFilteredLogs().length / perPage));
        currentPage = Math.min(totalPages, currentPage + 1);
        renderPointLedger();
      });
    }

    window.addEventListener("lumi:data-updated", (event) => {
      const data = event.detail || {};
      pointLogs = normalizeLogs(Array.isArray(data.pointLogs) ? data.pointLogs : pointLogs);
      applyPointSummary(data.points || defaultPoints);
      renderPointLedger();
    });

    loadPointData();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
