(() => {
  "use strict";

  const pointLogs = [
    { date: "2026.07.12", type: "반짝 포인트", title: "데뷔 라이브 ON AIR 참여", desc: "루미코드 인증 보상", amount: "+50P" },
    { date: "2026.07.12", type: "반짝 XP", title: "첫 온라인 연결 기록", desc: "방송 참여 성장 기록", amount: "+50XP" },
    { date: "2026.07.12", type: "물판 포인트", title: "특전권 15장 기준 적립", desc: "현장 물판 보상용 포인트", amount: "+1P" },
    { date: "2026.07.12", type: "반짝 포인트", title: "반짝 응원 참여", desc: "온라인 응원 기록", amount: "+30P" },
    { date: "2026.07.12", type: "반짝 XP", title: "첫 루미 체크인", desc: "특전회 참여 성장 기록", amount: "+70XP" },
    { date: "2026.07.12", type: "반짝 포인트", title: "닉네임 콜 교환", desc: "교환소 사용 샘플", amount: "-50P", minus: true }
  ];

  let currentFilter = "전체";
  let currentPage = 1;
  const perPage = 3;

  function getFilteredLogs() {
    if (currentFilter === "전체") return pointLogs;
    return pointLogs.filter((item) => item.type === currentFilter);
  }

  function renderPointLedger() {
    const list = document.getElementById("pointLedgerList");
    const pageText = document.getElementById("pointLedgerPageText");
    const prev = document.getElementById("pointLedgerPrev");
    const next = document.getElementById("pointLedgerNext");
    if (!list) return;

    const logs = getFilteredLogs();
    const totalPages = Math.max(1, Math.ceil(logs.length / perPage));
    currentPage = Math.min(currentPage, totalPages);
    const start = (currentPage - 1) * perPage;
    const pageItems = logs.slice(start, start + perPage);

    if (!pageItems.length) {
      list.innerHTML = `<div class="point-empty">아직 표시할 포인트 기록이 없어요.</div>`;
    } else {
      list.innerHTML = pageItems.map((item) => `
        <article class="point-ledger-card">
          <div>
            <small>${item.date} · ${item.type}</small>
            <b>${item.title}</b>
            <span>${item.desc}</span>
          </div>
          <div class="point-ledger-amount${item.minus ? " minus" : ""}">${item.amount}</div>
        </article>
      `).join("");
    }

    if (pageText) pageText.textContent = `${currentPage} / ${totalPages}`;
    if (prev) prev.disabled = currentPage <= 1;
    if (next) next.disabled = currentPage >= totalPages;
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

    renderPointLedger();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
