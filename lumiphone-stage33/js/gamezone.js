(() => {
  "use strict";

  const GAMEZONE_DETAILS = {
    fortune: {
      icon: "🌙",
      title: "오늘의 운세",
      body: "하루에 한 번 루미벨의 짧은 메시지와 작은 행운을 확인하는 데일리 콘텐츠예요.",
      info: "실제 오픈 시 반짝 포인트/반짝 XP와 연결하고, 현장 물판 포인트와는 절대 합산하지 않아요."
    },
    attendance: {
      icon: "📅",
      title: "출석 체크",
      body: "루미폰에 들어온 날을 조용히 기록하는 기능이에요. 랭킹이나 비교 없이 개인 기록으로만 남겨요.",
      info: "출석은 온라인 기록이며, 루미 방문/루미 체크인/스탬프와는 별도 기준으로 관리해요."
    },
    gacha: {
      icon: "💎",
      title: "무료 카드 뽑기",
      body: "시즌 카드, 멤버 카드, 랜덤 대사를 가볍게 뽑아 보관하는 기능으로 확장 예정이에요.",
      info: "초기에는 무료/가벼운 보관형 콘텐츠로 두고, 실제 보상과 연결되는 기능은 나중에 따로 검토해요."
    },
    "random-message": {
      icon: "💌",
      title: "랜덤 대사",
      body: "멤버별 말투와 시즌 분위기에 맞춘 짧은 메시지를 해금하는 공간이에요.",
      info: "마리링/루루/이로/루나 말투 데이터와 연결할 수 있지만, 지금은 준비중 안내만 연결해요."
    },
    season: {
      icon: "🎀",
      title: "시즌 이벤트",
      body: "생일, 데뷔일, 합류 이벤트처럼 기간 한정으로 열리는 게임존 콘텐츠예요.",
      info: "업적/칭호/디지털 카드와 연결하기 좋지만, 실제 오픈 전에는 팬 화면에 과한 약속처럼 보이지 않게 해요."
    },
    roulette: {
      icon: "🎁",
      title: "룰렛 데이",
      body: "특정 방송이나 이벤트 기간에만 열리는 가벼운 랜덤 이벤트로 확장할 수 있어요.",
      info: "실물 특전권이나 물판 혜택이 아니라, 반짝 포인트/디지털 리액션 중심으로 설계하는 게 안전해요."
    },
    ready: {
      icon: "🎮",
      title: "미니게임 준비중",
      body: "리듬게임, 터치 게임, AI 채팅형 콘텐츠는 루미폰 안정화 이후 별도 단계로 붙여요.",
      info: "지금은 탭 구조와 안내 모달만 먼저 연결한 상태예요."
    }
  };

  function showGamezonePanel(name) {
    const target = document.querySelector(`[data-gamezone-panel="${name}"]`);
    if (!target) return;

    document.querySelectorAll("[data-gamezone-panel]").forEach((panel) => {
      panel.classList.toggle("active", panel === target);
    });

    document.querySelectorAll("[data-gamezone-tab]").forEach((button) => {
      button.classList.toggle("active", button.dataset.gamezoneTab === name);
    });
  }

  function setGamezoneMessage(text) {
    const message = document.getElementById("gamezoneMessage");
    if (!message) return;
    message.textContent = text;
  }

  let gamezoneScrollY = 0;

  function lockGamezonePageScroll() {
    gamezoneScrollY = window.scrollY || document.documentElement.scrollTop || 0;
    document.body.classList.add("gamezone-modal-lock");
    document.body.style.position = "fixed";
    document.body.style.top = `-${gamezoneScrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
  }

  function unlockGamezonePageScroll() {
    document.body.classList.remove("gamezone-modal-lock");
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    window.scrollTo(0, gamezoneScrollY || 0);
  }

  function openGamezoneModal(key) {
    const data = GAMEZONE_DETAILS[key] || GAMEZONE_DETAILS.ready;
    const modal = document.getElementById("gamezoneModal");
    if (!modal) return;

    const icon = document.getElementById("gamezoneModalIcon");
    const title = document.getElementById("gamezoneModalTitle");
    const body = document.getElementById("gamezoneModalBody");
    const info = document.getElementById("gamezoneModalInfo");

    if (icon) icon.textContent = data.icon;
    if (title) title.textContent = data.title;
    if (body) body.textContent = data.body;
    if (info) info.textContent = data.info;

    lockGamezonePageScroll();
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
  }

  function closeGamezoneModal() {
    const modal = document.getElementById("gamezoneModal");
    if (!modal) return;
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    unlockGamezonePageScroll();
  }

  function bootGamezone() {
    document.querySelectorAll("[data-gamezone-tab]").forEach((button) => {
      button.addEventListener("click", () => showGamezonePanel(button.dataset.gamezoneTab));
    });

    document.querySelectorAll("[data-gamezone-detail]").forEach((button) => {
      button.addEventListener("click", () => openGamezoneModal(button.dataset.gamezoneDetail));
    });

    document.querySelectorAll("[data-gamezone-action]").forEach((button) => {
      button.addEventListener("click", () => {
        const action = button.dataset.gamezoneAction;
        if (action === "fortune") setGamezoneMessage("오늘의 운세는 다음 단계에서 반짝 포인트/XP 기록과 연결할 예정이에요.");
        else if (action === "gacha") setGamezoneMessage("무료 카드 뽑기는 시즌 카드와 보관함 연결 전 샘플 상태예요.");
        else if (action === "coming") setGamezoneMessage("이 기능은 준비중이에요. 팬 화면에는 실제 오픈 가능한 기능만 순서대로 연결해요.");
        else setGamezoneMessage("게임존 기능은 실제 데이터 연동 전 샘플 상태예요.");
      });
    });

    document.querySelectorAll("[data-gamezone-close]").forEach((button) => {
      button.addEventListener("click", closeGamezoneModal);
    });

    const modal = document.getElementById("gamezoneModal");
    if (modal) {
      modal.addEventListener("click", (event) => {
        if (event.target === modal) closeGamezoneModal();
      });
    }

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeGamezoneModal();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bootGamezone);
  else bootGamezone();
})();
