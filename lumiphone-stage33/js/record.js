(() => {
  "use strict";

  const records = [
    { icon: "🎤", date: "2026.07.12", title: "Debut Live 입장 완료", desc: "입장번호 0001 · 메아테 루루", cat: "라이브" },
    { icon: "💗", date: "2026.07.12", title: "첫 루미 방문", desc: "와준 순간을 남기는 방문 기록", cat: "체크인" },
    { icon: "📸", date: "2026.07.12", title: "첫 루미 체크인", desc: "촬영 · 교류 참여 완료 / 스탬프 +1", cat: "체크인" },
    { icon: "🎟️", date: "2026.07.12", title: "지난 티켓 저장", desc: "LUMI PASS 기록 보관", cat: "티켓" },
    { icon: "📡", date: "2026.07.12", title: "온라인 연결", desc: "ON AIR 방문 기록 샘플", cat: "온라인" },
    { icon: "✨", date: "2026.07.12", title: "반짝 응원", desc: "온라인 응원 기록 샘플", cat: "온라인" }
  ];

  let currentFilter = "전체";
  let currentPage = 1;
  const pageSize = 4;

  function getFilteredRecords() {
    if (currentFilter === "전체") return records;
    return records.filter((item) => item.cat === currentFilter);
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

    list.innerHTML = visible.map((item) => `
      <button type="button" class="record-split-card">
        <span class="record-split-icon">${item.icon}</span>
        <span class="record-split-date">${item.date}</span>
        <b>${item.title}</b>
        <em>${item.cat}</em>
        <small>${item.desc}</small>
      </button>
    `).join("");

    if (pageText) pageText.textContent = currentPage + " / " + totalPages;
    if (prev) prev.disabled = currentPage <= 1;
    if (next) next.disabled = currentPage >= totalPages;
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

    renderRecords();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
