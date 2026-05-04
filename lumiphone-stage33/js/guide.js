(() => {
  "use strict";

  const GUIDE_DETAILS = {
    beginner: {
      kicker: "FIRST LIVE GUIDE",
      title: "처음 현장에 오는 루미나를 위한 안내",
      body: [
        "예매자명 또는 예약번호를 미리 준비해 주세요. 입장 확인이 빨라지고, 현장에서 헷갈리는 시간을 줄일 수 있어요.",
        "메아테를 Lumibelle로 선택한 경우, 입장 시점이 아니라 물판/특전회에서 루미 ID 또는 예약번호 확인 후 혜택을 받을 수 있어요.",
        "특전회가 처음이어도 괜찮아요. 줄 서는 위치, 특전권 사용, 촬영 순서는 현장 스탭에게 물어봐도 됩니다."
      ],
      note: "첫 방문 가이드는 예매/입장/물판/특전회 흐름을 한 번에 보는 용도예요. 실제 시간표는 공연별 공지를 기준으로 확인해 주세요."
    },
    rules: {
      kicker: "LIVE & BENEFIT RULES",
      title: "라이브/특전회 기본 주의사항",
      body: [
        "촬영 가능 여부, 업로드 가능 범위, 콜/응원 가능 범위는 공연별 공지를 우선으로 해요.",
        "특전회에서는 촬영 대기와 교류 시간이 겹치지 않도록 스탭 안내를 따라 주세요.",
        "사진 업로드 전에는 멤버 확인이 필요한 경우가 있어요. 썸네일 및 사진 업로드 전 확인을 부탁드립니다."
      ],
      note: "상세 주의사항은 추후 운영 안내 페이지와 연결할 예정이에요. 지금은 분리 구조 안에서 상세보기 흐름을 확인하는 단계예요."
    },
    ticket: {
      kicker: "TICKET & BENEFIT GUIDE",
      title: "티켓/특전권 확인 안내",
      body: [
        "현재 티켓은 예매 완료 후 입장 전까지 확인하는 카드예요. 공연 종료 후에는 지난 티켓 기록으로 남길 수 있어요.",
        "Welcome Ticket, Birthday Ticket, Join Ticket은 사용 가능 멤버와 사용 기간이 다를 수 있어요.",
        "이벤트권은 기본적으로 본인 사용 기준이며, 사용 완료 후에는 재발급하지 않는 방향으로 관리해요."
      ],
      note: "티켓/특전권 상세 기능은 티켓함 상세보기와 단계적으로 연결할 예정이에요."
    }
  };

  function showGuidePanel(name) {
    const target = document.querySelector(`[data-guide-panel="${name}"]`);
    if (!target) return;

    document.querySelectorAll("[data-guide-panel]").forEach((panel) => {
      panel.classList.toggle("active", panel === target);
    });

    document.querySelectorAll("[data-guide-tab]").forEach((button) => {
      button.classList.toggle("active", button.dataset.guideTab === name);
    });
  }

  function setGuideMessage(text) {
    const message = document.getElementById("guideMessage");
    if (!message) return;
    message.textContent = text;
  }

  function openGuideDetail(type) {
    const data = GUIDE_DETAILS[type] || GUIDE_DETAILS.beginner;
    const modal = document.getElementById("guideDetailModal");
    const kicker = document.getElementById("guideDetailKicker");
    const title = document.getElementById("guideDetailTitle");
    const body = document.getElementById("guideDetailBody");
    const note = document.getElementById("guideDetailNote");
    if (!modal || !kicker || !title || !body || !note) return;

    kicker.textContent = data.kicker;
    title.textContent = data.title;
    body.innerHTML = data.body.map((item) => `<p>${item}</p>`).join("");
    note.textContent = data.note;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    setGuideMessage("가이드 상세를 열었어요.");
  }

  function closeGuideDetail() {
    const modal = document.getElementById("guideDetailModal");
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  }

  function bootGuide() {
    document.querySelectorAll("[data-guide-tab]").forEach((button) => {
      button.addEventListener("click", () => showGuidePanel(button.dataset.guideTab));
    });

    document.querySelectorAll("[data-guide-detail]").forEach((button) => {
      button.addEventListener("click", () => openGuideDetail(button.dataset.guideDetail));
    });

    document.querySelectorAll("[data-guide-action]").forEach((button) => {
      button.addEventListener("click", () => {
        setGuideMessage("가이드 기능은 실제 데이터 연동 전 샘플 상태예요.");
      });
    });

    document.querySelectorAll("[data-guide-close]").forEach((button) => {
      button.addEventListener("click", closeGuideDetail);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeGuideDetail();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bootGuide);
  else bootGuide();
})();
