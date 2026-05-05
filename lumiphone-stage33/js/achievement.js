(() => {
  "use strict";

  const achievements = [
    {
      title: "루미폰 개통",
      category: "성장",
      icon: "📱",
      desc: "루미 ID로 루미폰에 처음 접속했어요.",
      state: "달성",
      reward: "루미폰 첫 손님",
      detail: "루미폰에 처음 들어온 순간을 기록하는 기본 업적이에요. 앞으로의 방문, 체크인, 편지, 응원 기록이 이 루미 ID에 차곡차곡 쌓여요."
    },
    {
      title: "첫 예매의 반짝임",
      category: "라이브",
      icon: "🎟️",
      desc: "루미벨 공연을 처음 예매한 기록이에요.",
      state: "달성",
      reward: "첫 예매의 반짝임",
      detail: "루미벨을 처음 만나러 오기로 한 마음을 남기는 업적이에요. 공연 전의 설렘까지 루미폰 안에 조용히 보관해요."
    },
    {
      title: "첫 루미 체크인",
      category: "라이브",
      icon: "🌸",
      desc: "특전회에 함께한 첫 체크인 기록이에요.",
      state: "달성",
      reward: "처음 함께한 하루",
      detail: "특전회에 참여하고 루미 체크인이 완료되면 남는 업적이에요. 스탬프는 체크인 기준으로 지급돼요."
    },
    {
      title: "온라인으로 이어진 빛",
      category: "온라인",
      icon: "✨",
      desc: "방송 또는 온라인 이벤트 참여 기록이 생기면 해금돼요.",
      state: "진행 중",
      reward: "랜선 루미나",
      detail: "현장에 오지 못한 날에도 방송, 루미코드, 반짝 응원으로 이어진 마음을 기록하는 업적이에요."
    },
    {
      title: "스탬프 카드 완주",
      category: "성장",
      icon: "💮",
      desc: "스탬프 20칸을 모두 채우면 해금돼요.",
      state: "미달성",
      reward: "1회차 완주자",
      detail: "루미 체크인을 통해 스탬프를 모아 한 카드가 완주되면 해금되는 업적이에요. 완주 기록은 초기화가 아니라 회차 기록으로 남아요."
    },
    {
      title: "???",
      category: "숨김",
      icon: "🔒",
      desc: "조건을 달성하면 이름과 보상이 공개돼요.",
      state: "숨김",
      reward: "비밀 칭호",
      detail: "아직 조건이 공개되지 않은 숨김 업적이에요. 조건을 달성하면 이름과 칭호가 열려요."
    }
  ];

  const pageSize = 4;
  let currentFilter = "전체";
  let currentPage = 1;
  let equippedTitle = "첫 예매의 반짝임";
  let selectedIndex = null;
  let modalScrollY = 0;

  function lockModalScroll() {
    if (document.body.classList.contains("achievement-modal-scroll-lock")) return;
    modalScrollY = window.scrollY || window.pageYOffset || 0;
    document.body.classList.add("achievement-modal-scroll-lock");
    document.body.style.position = "fixed";
    document.body.style.top = `-${modalScrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
  }

  function unlockModalScroll() {
    if (!document.body.classList.contains("achievement-modal-scroll-lock")) return;
    document.body.classList.remove("achievement-modal-scroll-lock");
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    window.scrollTo(0, modalScrollY || 0);
  }

  function getFiltered() {
    if (currentFilter === "전체") return achievements;
    return achievements.filter((item) => item.category === currentFilter);
  }

  function setMessage(text) {
    const message = document.getElementById("achievementMessage");
    if (!message) return;
    message.textContent = text;
  }

  function syncProfileTitle() {
    const inline = document.getElementById("profileEquippedTitleInline");
    const card = document.getElementById("profileEquippedTitleCard");
    if (inline) inline.textContent = equippedTitle;
    if (card) card.textContent = equippedTitle;
  }

  function renderSummary() {
    const doneCount = achievements.filter((item) => item.state === "달성").length;
    const titleCount = achievements.filter((item) => item.state === "달성" && item.reward).length;
    const doneEl = document.getElementById("achievementDoneCount");
    const titleEl = document.getElementById("titleOwnedCount");
    const equippedEl = document.getElementById("equippedTitleText");

    if (doneEl) doneEl.textContent = String(doneCount);
    if (titleEl) titleEl.textContent = String(titleCount);
    if (equippedEl) equippedEl.textContent = equippedTitle;
    syncProfileTitle();
  }

  function renderList() {
    const list = document.getElementById("achievementList");
    const pageText = document.getElementById("achievementPageText");
    const prev = document.getElementById("achievementPrev");
    const next = document.getElementById("achievementNext");
    if (!list) return;

    const filtered = getFiltered();
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    currentPage = Math.min(currentPage, totalPages);
    const start = (currentPage - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    list.innerHTML = items.map((item) => {
      const isDone = item.state === "달성";
      const isLocked = item.state === "숨김" || item.state === "미달성";
      const realIndex = achievements.indexOf(item);
      const buttonText = !isDone ? "잠김" : (item.reward === equippedTitle ? "장착 중" : "칭호 장착");
      return `
        <article class="achievement-card ${isDone ? "done" : ""} ${isLocked ? "locked" : ""}" data-achievement-index="${realIndex}" tabindex="0" role="button" aria-label="${item.title} 상세 보기">
          <div class="achievement-card-top">
            <div class="achievement-icon">${item.icon}</div>
            <span class="achievement-state">${item.state}</span>
          </div>
          <h3>${item.title}</h3>
          <p>${item.desc}</p>
          <span class="achievement-title-chip">칭호: ${item.reward}</span>
          <div class="achievement-card-actions">
            <button type="button" class="achievement-detail-button" data-achievement-detail="${realIndex}">상세 보기</button>
            <button type="button" class="achievement-title-button" data-title-index="${realIndex}" ${isDone ? "" : "disabled"}>${buttonText}</button>
          </div>
        </article>`;
    }).join("");

    if (pageText) pageText.textContent = `${currentPage} / ${totalPages}`;
    if (prev) prev.disabled = currentPage <= 1;
    if (next) next.disabled = currentPage >= totalPages;
  }

  function render() {
    renderSummary();
    renderList();
  }

  function getModal() {
    return document.getElementById("achievementDetailModal");
  }

  function updateDetailModal(item) {
    const icon = document.getElementById("achievementDetailIcon");
    const category = document.getElementById("achievementDetailCategory");
    const title = document.getElementById("achievementDetailTitle");
    const state = document.getElementById("achievementDetailState");
    const desc = document.getElementById("achievementDetailDesc");
    const reward = document.getElementById("achievementDetailReward");
    const equip = document.getElementById("achievementDetailEquipButton");
    const help = document.getElementById("achievementDetailHelp");

    if (icon) icon.textContent = item.icon;
    if (category) category.textContent = item.category;
    if (title) title.textContent = item.title;
    if (state) state.textContent = item.state;
    if (desc) desc.textContent = item.detail || item.desc;
    if (reward) reward.textContent = item.reward;

    const canEquip = item.state === "달성";
    if (equip) {
      equip.disabled = !canEquip;
      equip.textContent = !canEquip ? "아직 장착할 수 없어요" : (item.reward === equippedTitle ? "현재 장착 중" : "대표 칭호로 장착");
    }
    if (help) {
      help.textContent = canEquip ? "달성한 업적의 칭호를 대표 칭호로 장착할 수 있어요." : "아직 달성하지 않은 업적의 칭호는 장착할 수 없어요.";
    }
  }

  function openDetail(index) {
    const item = achievements[index];
    const modal = getModal();
    if (!item || !modal) return;
    selectedIndex = index;
    updateDetailModal(item);
    lockModalScroll();
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  }

  function closeDetail() {
    const modal = getModal();
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    unlockModalScroll();
  }

  function equipTitle(index) {
    const item = achievements[index];
    if (!item || item.state !== "달성") {
      setMessage("아직 달성하지 않은 업적의 칭호는 장착할 수 없어요.");
      return;
    }
    equippedTitle = item.reward;
    setMessage(`대표 칭호가 '${equippedTitle}'로 장착되었습니다.`);
    render();
    if (selectedIndex === index) updateDetailModal(item);
  }

  function boot() {
    document.querySelectorAll("[data-achievement-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        currentFilter = button.dataset.achievementFilter || "전체";
        currentPage = 1;
        document.querySelectorAll("[data-achievement-filter]").forEach((item) => {
          item.classList.toggle("active", item === button);
        });
        setMessage("");
        render();
      });
    });

    const prev = document.getElementById("achievementPrev");
    const next = document.getElementById("achievementNext");
    if (prev) prev.addEventListener("click", () => {
      currentPage = Math.max(1, currentPage - 1);
      render();
    });
    if (next) next.addEventListener("click", () => {
      const totalPages = Math.max(1, Math.ceil(getFiltered().length / pageSize));
      currentPage = Math.min(totalPages, currentPage + 1);
      render();
    });

    const list = document.getElementById("achievementList");
    if (list) {
      list.addEventListener("click", (event) => {
        const detailButton = event.target.closest("[data-achievement-detail]");
        if (detailButton) {
          event.stopPropagation();
          openDetail(Number(detailButton.dataset.achievementDetail));
          return;
        }

        const titleButton = event.target.closest("[data-title-index]");
        if (titleButton) {
          event.stopPropagation();
          if (!titleButton.disabled) equipTitle(Number(titleButton.dataset.titleIndex));
          return;
        }

        const card = event.target.closest("[data-achievement-index]");
        if (card) openDetail(Number(card.dataset.achievementIndex));
      });

      list.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        const card = event.target.closest("[data-achievement-index]");
        if (!card) return;
        event.preventDefault();
        openDetail(Number(card.dataset.achievementIndex));
      });
    }

    document.querySelectorAll("[data-achievement-close]").forEach((item) => {
      item.addEventListener("click", closeDetail);
    });

    const equipButton = document.getElementById("achievementDetailEquipButton");
    if (equipButton) {
      equipButton.addEventListener("click", () => {
        if (selectedIndex === null) return;
        equipTitle(selectedIndex);
      });
    }

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeDetail();
    });

    render();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
