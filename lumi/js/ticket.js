(() => {
  "use strict";

  const baseTickets = [
    {
      id: "debut-live-20260712",
      tab: "현재 티켓",
      kind: "LUMI PASS",
      status: "예매 완료",
      title: "Debut Live",
      meta: "2026.07.12 · 입장 전 · 메아테 루루",
      entry: "0001",
      actionLabel: "입장 확인 기록하기",
      actionDoneLabel: "입장 확인 완료",
      doneStatus: "입장 완료",
      doneMeta: "2026.07.12 · 입장 완료 · 메아테 루루",
      doneTab: "지난 티켓",
      detailRows: [
        ["입장 상태", "입장 전"],
        ["메아테", "루루"],
        ["혜택 상태", "물판/특전회에서 루미 ID 확인 후 지급"],
        ["사용 안내", "현장에서는 예약자명 또는 예약번호와 함께 확인해요."]
      ],
      doneDetailRows: [
        ["입장 상태", "입장 완료"],
        ["메아테", "루루"],
        ["혜택 상태", "물판/특전회에서 루미 ID 확인 후 지급"],
        ["기록", "이 기기 안에 입장 확인 상태가 저장됐어요."]
      ],
      detailNote: "입장 전에는 현재 티켓의 입장 확인용 번호를 먼저 보여주세요. 메아테 혜택은 입장 시가 아니라 물판/특전회에서 확인해요.",
      doneDetailNote: "입장 완료 상태로 저장됐어요. 공연 종료 후에는 지난 티켓과 추억의 시간에 천천히 보관돼요.",
      memoryRows: [
        ["기록 상태", "공연 전"],
        ["추억의 시간", "공연 종료 후 연결 예정"],
        ["루미 체크인", "특전회 참여 후 기록"],
        ["스탬프", "루미 체크인 완료 기준"]
      ],
      doneMemoryRows: [
        ["기록 상태", "입장 완료"],
        ["추억의 시간", "공연 기록 보관 준비"],
        ["루미 체크인", "특전회 참여 후 별도 기록"],
        ["스탬프", "체크인 완료 기준"]
      ],
      memoryNote: "아직 공연 전이라 추억 기록은 열리지 않았어요. 공연 종료 후 지난 티켓과 추억의 시간에 천천히 보관돼요.",
      doneMemoryNote: "입장 기록이 지난 티켓 쪽에 보관됐어요. 루미 체크인은 특전회 참여 후 별도로 기록해요."
    },
    {
      id: "birthday-ticket",
      tab: "특전권",
      kind: "Birthday Ticket",
      status: "사용 가능",
      title: "생일 기념 촬영 특전권",
      meta: "생일 당월 사용 가능 · 본인 사용",
      entry: "BIRTHDAY",
      actionLabel: "사용 완료 처리",
      actionDoneLabel: "사용 완료",
      doneStatus: "사용 완료",
      doneMeta: "생일 당월 사용 · 사용 완료 기록",
      detailRows: [
        ["사용 가능 기간", "생일 당월 1일~말일"],
        ["사용 대상", "본인만 사용 가능"],
        ["양도", "양도 불가"],
        ["재발급", "사용 완료 후 재발급 불가"]
      ],
      doneDetailRows: [
        ["사용 상태", "사용 완료"],
        ["사용 대상", "본인 사용 기록"],
        ["양도", "양도 불가"],
        ["재발급", "사용 완료 후 재발급 불가"]
      ],
      detailNote: "오시 멤버 생일 체키 또는 당일 출연 멤버 기준 단체 생일 체키처럼 운영 가능한 범위에서 사용해요.",
      doneDetailNote: "Birthday Ticket 사용 완료 상태가 이 기기에 저장됐어요.",
      memoryRows: [
        ["기록 상태", "사용 전"],
        ["보관", "사용 후 티켓 기록에 남김"],
        ["체키 기록", "사용 완료 처리 후 연결 예정"]
      ],
      doneMemoryRows: [
        ["기록 상태", "사용 완료"],
        ["보관", "생일 기념 티켓 기록"],
        ["체키 기록", "숙제체키/추억 기능과 추후 연결"]
      ],
      memoryNote: "사용 전 티켓이라 추억 기록은 아직 없어요. 사용 완료 후 소장 기록으로 남길 수 있게 연결할 예정이에요.",
      doneMemoryNote: "생일 기념 티켓 사용 완료 기록이 남았어요."
    },
    {
      id: "welcome-ticket",
      tab: "특전권",
      kind: "Welcome Ticket",
      status: "준비 중",
      title: "첫 방문 Welcome Ticket",
      meta: "신규 이벤트 대상 확인 후 사용",
      entry: "WELCOME",
      actionLabel: "사용 완료 처리",
      actionDoneLabel: "사용 완료",
      doneStatus: "사용 완료",
      doneMeta: "신규 이벤트 특전권 · 사용 완료 기록",
      detailRows: [
        ["지급 조건", "신규 이벤트 대상 확인"],
        ["확인 방식", "공식/멤버 계정 팔로우 등 운영 기준 확인"],
        ["사용 방식", "현장 스탭 확인 후 처리"],
        ["상태", "발급 전"]
      ],
      doneDetailRows: [
        ["사용 상태", "사용 완료"],
        ["확인 방식", "현장 스탭 확인"],
        ["사용 방식", "신규 이벤트 특전권 사용 기록"],
        ["상태", "이 기기에 저장됨"]
      ],
      detailNote: "Welcome Ticket은 루미 ID 발급자 전체가 아니라 신규 이벤트 조건을 확인한 뒤 지급하는 방향이에요.",
      doneDetailNote: "Welcome Ticket 사용 완료 상태가 저장됐어요.",
      memoryRows: [
        ["기록 상태", "준비 중"],
        ["추억 연결", "사용 완료 후 연결 예정"],
        ["안내", "운영 확인 후 표시"]
      ],
      doneMemoryRows: [
        ["기록 상태", "사용 완료"],
        ["추억 연결", "첫 방문 이벤트 기록"],
        ["안내", "나중에 개인 기록과 연결 가능"]
      ],
      memoryNote: "아직 사용 기록이 없어요.",
      doneMemoryNote: "첫 방문 이벤트 티켓 사용 완료 기록이 남았어요."
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

  let tickets = baseTickets.map((ticket) => ({ ...ticket }));
  let currentTab = "현재 티켓";
  let currentPage = 1;
  let currentModalTicketId = null;
  const pageSize = 2;

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;"
    }[char]));
  }

  function todayLabel() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${yyyy}.${mm}.${dd}`;
  }

  async function getLocalTicketStates() {
    if (!window.LumiData?.getData) return {};
    const data = await window.LumiData.getData();
    return data.ticketStates || {};
  }

  function applyTicketStates(states) {
    tickets = baseTickets.map((ticket) => {
      const state = states?.[ticket.id];
      if (!state) return { ...ticket, localDone: false };
      const done = state.status === "done";
      return {
        ...ticket,
        localDone: done,
        localDoneDate: state.date || "",
        tab: done && ticket.doneTab ? ticket.doneTab : ticket.tab,
        status: done ? (ticket.doneStatus || ticket.status) : ticket.status,
        meta: done ? (ticket.doneMeta || ticket.meta) : ticket.meta,
        detailRows: done ? (ticket.doneDetailRows || ticket.detailRows) : ticket.detailRows,
        detailNote: done ? (ticket.doneDetailNote || ticket.detailNote) : ticket.detailNote,
        memoryRows: done ? (ticket.doneMemoryRows || ticket.memoryRows) : ticket.memoryRows,
        memoryNote: done ? (ticket.doneMemoryNote || ticket.memoryNote) : ticket.memoryNote
      };
    });
  }

  async function syncTicketsFromStorage() {
    applyTicketStates(await getLocalTicketStates());
    render();
  }

  async function saveTicketDone(ticket) {
    if (!window.LumiData?.getData || !window.LumiData?.updateData) return false;
    const data = await window.LumiData.getData();
    const ticketStates = { ...(data.ticketStates || {}) };
    ticketStates[ticket.id] = {
      status: "done",
      date: todayLabel(),
      title: ticket.title,
      kind: ticket.kind
    };
    await window.LumiData.updateData({ ticketStates });
    applyTicketStates(ticketStates);
    return true;
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
        <article class="ticket-split-card ${ticket.tab === "현재 티켓" ? "is-current" : ""} ${ticket.tab === "특전권" ? "is-benefit" : ""} ${ticket.tab === "지난 티켓" ? "is-archive" : ""} ${ticket.localDone ? "is-local-done" : ""}">
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
    list.innerHTML = (rows || []).map(([term, desc]) => `
      <div>
        <dt>${escapeHtml(term)}</dt>
        <dd>${escapeHtml(desc)}</dd>
      </div>
    `).join("");
  }

  function ensureTicketActionButton() {
    const actions = document.querySelector(".ticket-modal-actions");
    const ok = document.getElementById("ticketModalOk");
    if (!actions || !ok) return null;
    let button = document.getElementById("ticketModalPrimaryAction");
    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.id = "ticketModalPrimaryAction";
      button.className = "ticket-modal-primary-action";
      actions.insertBefore(button, ok);
      button.addEventListener("click", handleModalPrimaryAction);
    }
    return button;
  }

  function openTicketModal(ticket, mode) {
    const backdrop = document.getElementById("ticketModalBackdrop");
    const kind = document.getElementById("ticketModalKind");
    const title = document.getElementById("ticketModalTitle");
    const meta = document.getElementById("ticketModalMeta");
    const entry = document.getElementById("ticketModalEntry");
    const note = document.getElementById("ticketModalNote");
    const actionButton = ensureTicketActionButton();
    if (!backdrop || !ticket) return;

    currentModalTicketId = ticket.id;
    const isMemory = mode === "memory";
    if (kind) kind.textContent = isMemory ? "MEMORY" : ticket.kind;
    if (title) title.textContent = isMemory ? `${ticket.title} 추억 보기` : `${ticket.title} 상세 보기`;
    if (meta) meta.textContent = isMemory ? "지난 기록과 추억 연결 상태를 확인해요." : ticket.meta;
    if (entry) entry.textContent = ticket.entry;
    setModalRows(isMemory ? ticket.memoryRows : ticket.detailRows);
    if (note) note.textContent = isMemory ? ticket.memoryNote : ticket.detailNote;

    if (actionButton) {
      const canAct = !isMemory && ticket.actionLabel;
      actionButton.hidden = !canAct;
      actionButton.disabled = !!ticket.localDone;
      actionButton.textContent = ticket.localDone ? (ticket.actionDoneLabel || "완료됨") : (ticket.actionLabel || "기록하기");
    }

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
    currentModalTicketId = null;
  }

  async function handleModalPrimaryAction() {
    const ticket = findTicket(currentModalTicketId);
    if (!ticket || ticket.localDone) return;
    const ok = await saveTicketDone(ticket);
    if (!ok) {
      setTicketMessage("이 기기에서 티켓 상태를 저장할 수 없어요.");
      return;
    }
    const updated = findTicket(ticket.id);
    setTicketMessage(`${ticket.title} 상태를 저장했어요.`);
    openTicketModal(updated || ticket, "detail");
    render();
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
    const ok = document.getElementById("ticketModalOk");
    ensureTicketActionButton();
    if (close) close.addEventListener("click", closeTicketModal);
    if (ok) ok.addEventListener("click", closeTicketModal);
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

    window.addEventListener("lumi:data-updated", () => syncTicketsFromStorage());
    syncTicketsFromStorage();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
