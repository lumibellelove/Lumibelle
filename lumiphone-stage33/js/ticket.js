(() => {
  "use strict";

  const tickets = [
    {
      id: "debut-live-20260712",
      tab: "현재 티켓",
      kind: "LUMI PASS",
      status: "예매 완료",
      title: "Debut Live",
      meta: "2026.07.12 · 입장 전 · 메아테 루루",
      entry: "0001",
      detailRows: [
        ["입장 상태", "입장 전"],
        ["메아테", "루루"],
        ["혜택 상태", "물판/특전회에서 루미 ID 확인 후 지급"],
        ["사용 안내", "현장에서는 예약자명 또는 예약번호와 함께 확인해요."]
      ],
      detailNote: "입장 전에는 현재 티켓의 입장 확인용 번호를 먼저 보여주세요. 메아테 혜택은 입장 시가 아니라 물판/특전회에서 확인해요.",
      memoryRows: [
        ["기록 상태", "공연 전"],
        ["추억의 시간", "공연 종료 후 연결 예정"],
        ["루미 체크인", "특전회 참여 후 기록"],
        ["스탬프", "루미 체크인 완료 기준"]
      ],
      memoryNote: "아직 공연 전이라 추억 기록은 열리지 않았어요. 공연 종료 후 지난 티켓과 추억의 시간에 천천히 보관돼요."
    },
    {
      id: "birthday-ticket",
      tab: "특전권",
      kind: "Birthday Ticket",
      status: "사용 가능",
      title: "생일 기념 촬영 특전권",
      meta: "생일 당월 사용 가능 · 본인 사용",
      entry: "BIRTHDAY",
      detailRows: [
        ["사용 가능 기간", "생일 당월 1일~말일"],
        ["사용 대상", "본인만 사용 가능"],
        ["양도", "양도 불가"],
        ["재발급", "사용 완료 후 재발급 불가"]
      ],
      detailNote: "오시 멤버 생일 체키 또는 당일 출연 멤버 기준 단체 생일 체키처럼 운영 가능한 범위에서 사용해요.",
      memoryRows: [
        ["기록 상태", "사용 전"],
        ["보관", "사용 후 티켓 기록에 남김"],
        ["체키 기록", "사용 완료 처리 후 연결 예정"]
      ],
      memoryNote: "사용 전 티켓이라 추억 기록은 아직 없어요. 사용 완료 후 소장 기록으로 남길 수 있게 연결할 예정이에요."
    },
    {
      id: "welcome-ticket",
      tab: "특전권",
      kind: "Welcome Ticket",
      status: "준비중",
      title: "첫 방문 Welcome Ticket",
      meta: "신규 이벤트 대상 확인 후 사용",
      entry: "WELCOME",
      detailRows: [
        ["지급 조건", "신규 이벤트 대상 확인"],
        ["확인 방식", "공식/멤버 계정 팔로우 등 운영 기준 확인"],
        ["사용 방식", "현장 스탭 확인 후 처리"],
        ["상태", "샘플 단계"]
      ],
      detailNote: "Welcome Ticket은 루미 ID 발급자 전체가 아니라 신규 이벤트 조건을 확인한 뒤 지급하는 방향이에요.",
      memoryRows: [
        ["기록 상태", "준비중"],
        ["추억 연결", "사용 완료 후 연결 예정"],
        ["주의", "샘플 데이터"]
      ],
      memoryNote: "아직 샘플 단계라 실제 사용 기록은 없어요."
    },
    {
      id: "archive-saved",
      tab: "지난 티켓",
      kind: "ARCHIVE",
      status: "보관 완료",
      title: "지난 티켓 기록",
      meta: "공연 종료 후 추억의 시간에 보관",
      entry: "SAVED",
      detailRows: [
        ["상태", "보관 완료"],
        ["입장", "완료 처리된 티켓 예시"],
        ["메아테 기록", "추억의 시간과 연결 예정"],
        ["루미 체크인", "특전회 참여 시 별도 기록"]
      ],
      detailNote: "지난 티켓은 카드 전체를 막지 않고, 상태만 보관 완료로 표시하는 방향이에요.",
      memoryRows: [
        ["보관 위치", "추억의 시간"],
        ["표시 방식", "지난 공연 기록 카드"],
        ["스탬프", "루미 체크인 완료 기준"],
        ["팬 기록", "비교/랭킹 없이 개인 기록으로 보관"]
      ],
      memoryNote: "지난 티켓의 추억 보기는 권리 보관이 아니라 공연에 함께한 기록을 천천히 보는 용도예요."
    }
  ];

  let currentTab = "현재 티켓";
  let currentPage = 1;
  const pageSize = 2;

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;"
    }[char]));
  }

  function render() {
    const list = document.getElementById("ticketSplitList");
    const pageText = document.querySelector("[data-ticket-page]");
    const prev = document.querySelector("[data-ticket-prev]");
    const next = document.querySelector("[data-ticket-next]");
    if (!list) return;

    const data = tickets.filter((ticket) => ticket.tab === currentTab);
    const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
    currentPage = Math.max(1, Math.min(currentPage, totalPages));
    const visible = data.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    if (!visible.length) {
      list.innerHTML = `<div class="ticket-split-empty">표시할 티켓이 없어요.</div>`;
    } else {
      list.innerHTML = visible.map((ticket) => `
        <article class="ticket-split-card">
          <div class="ticket-split-top">
            <span class="ticket-split-kind">${escapeHtml(ticket.kind)}</span>
            <span class="ticket-split-status">${escapeHtml(ticket.status)}</span>
          </div>
          <b>${escapeHtml(ticket.title)}</b>
          <span class="ticket-split-meta">${escapeHtml(ticket.meta)}</span>
          <div class="ticket-split-entry">${escapeHtml(ticket.entry)}</div>
          <div class="ticket-split-actions">
            <button type="button" data-ticket-action="detail" data-ticket-id="${escapeHtml(ticket.id)}">상세 보기</button>
            <button type="button" data-ticket-action="memory" data-ticket-id="${escapeHtml(ticket.id)}">추억 보기</button>
          </div>
        </article>
      `).join("");
    }

    if (pageText) pageText.textContent = `${currentPage} / ${totalPages}`;
    if (prev) prev.disabled = currentPage <= 1;
    if (next) next.disabled = currentPage >= totalPages;
  }

  function setTicketMessage(text) {
    const message = document.getElementById("ticketMessage");
    if (!message) return;
    message.textContent = text;
  }

  function findTicket(id) {
    return tickets.find((ticket) => ticket.id === id) || null;
  }

  function setModalRows(rows) {
    const list = document.getElementById("ticketModalList");
    if (!list) return;
    list.innerHTML = rows.map(([term, desc]) => `
      <div>
        <dt>${escapeHtml(term)}</dt>
        <dd>${escapeHtml(desc)}</dd>
      </div>
    `).join("");
  }

  function openTicketModal(ticket, mode) {
    const backdrop = document.getElementById("ticketModalBackdrop");
    const kind = document.getElementById("ticketModalKind");
    const title = document.getElementById("ticketModalTitle");
    const meta = document.getElementById("ticketModalMeta");
    const entry = document.getElementById("ticketModalEntry");
    const note = document.getElementById("ticketModalNote");
    if (!backdrop || !ticket) return;

    const isMemory = mode === "memory";
    if (kind) kind.textContent = isMemory ? "MEMORY" : ticket.kind;
    if (title) title.textContent = isMemory ? `${ticket.title} 추억 보기` : `${ticket.title} 상세 보기`;
    if (meta) meta.textContent = isMemory ? "지난 기록과 추억 연결 상태를 확인해요." : ticket.meta;
    if (entry) entry.textContent = ticket.entry;
    setModalRows(isMemory ? ticket.memoryRows : ticket.detailRows);
    if (note) note.textContent = isMemory ? ticket.memoryNote : ticket.detailNote;

    backdrop.hidden = false;
    document.body.classList.add("ticket-modal-open");
    setTicketMessage(isMemory ? `${ticket.title} 추억 보기 창을 열었어요.` : `${ticket.title} 상세보기 창을 열었어요.`);

    const close = document.getElementById("ticketModalClose");
    if (close) close.focus();
  }

  function closeTicketModal() {
    const backdrop = document.getElementById("ticketModalBackdrop");
    if (!backdrop) return;
    backdrop.hidden = true;
    document.body.classList.remove("ticket-modal-open");
  }

  function bindTicketActions() {
    const list = document.getElementById("ticketSplitList");
    if (!list) return;
    list.addEventListener("click", (event) => {
      const button = event.target.closest("[data-ticket-action]");
      if (!button) return;
      const ticket = findTicket(button.dataset.ticketId);
      if (!ticket) {
        setTicketMessage("티켓 정보를 찾을 수 없어요.");
        return;
      }
      openTicketModal(ticket, button.dataset.ticketAction);
    });
  }

  function bindModal() {
    const backdrop = document.getElementById("ticketModalBackdrop");
    const close = document.getElementById("ticketModalClose");
    if (close) close.addEventListener("click", closeTicketModal);
    if (backdrop) {
      backdrop.addEventListener("click", (event) => {
        if (event.target === backdrop) closeTicketModal();
      });
    }
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeTicketModal();
    });
  }

  function boot() {
    bindTicketActions();
    bindModal();
    document.querySelectorAll("[data-ticket-tab]").forEach((button) => {
      button.addEventListener("click", () => {
        currentTab = button.dataset.ticketTab || "현재 티켓";
        currentPage = 1;
        document.querySelectorAll("[data-ticket-tab]").forEach((item) => {
          item.classList.toggle("active", item === button);
        });
        closeTicketModal();
        render();
      });
    });

    const prev = document.querySelector("[data-ticket-prev]");
    const next = document.querySelector("[data-ticket-next]");

    if (prev) {
      prev.addEventListener("click", () => {
        currentPage -= 1;
        render();
      });
    }

    if (next) {
      next.addEventListener("click", () => {
        currentPage += 1;
        render();
      });
    }

    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
