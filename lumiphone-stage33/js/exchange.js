(() => {
  "use strict";

  const EXCHANGE_DETAILS = {
    water: {
      kicker: "BROADCAST REACTION",
      title: "물 한 모금",
      lead: "방송 중 멤버에게 잠깐 쉬어가는 물 마시기 리액션을 보내는 가벼운 보상이에요.",
      rows: [
        ["필요 포인트", "30p"],
        ["사용 가능", "방송 중 사용 가능 · 1회성 리액션"],
        ["운영 메모", "멤버 컨디션과 방송 흐름에 따라 바로 반응하지 못할 수 있어요."]
      ],
      note: "실제 연동 전에는 포인트가 차감되지 않고, 신청도 접수되지 않아요."
    },
    nickname: {
      kicker: "BROADCAST REACTION",
      title: "닉네임 콜",
      lead: "방송 중 루미나의 닉네임을 짧게 불러주는 리액션 보상이에요.",
      rows: [
        ["필요 포인트", "50p"],
        ["사용 가능", "방송 중 · 닉네임 표시 동의 후 사용"],
        ["운영 메모", "닉네임은 방송에서 불러도 괜찮은 이름만 사용하는 방향이에요."]
      ],
      note: "방송 닉네임 공개는 강제가 아니라, 팬이 원할 때만 쓰는 구조로 유지해요."
    },
    cheer: {
      kicker: "DIGITAL REWARD",
      title: "응원 한마디",
      lead: "루미나에게 짧은 응원 멘트를 남기는 디지털 보상이에요.",
      rows: [
        ["필요 포인트", "80p"],
        ["사용 가능", "방송/온라인 이벤트용 디지털 보상"],
        ["운영 메모", "멤버별 말투 샘플과 연결하면 루미레터처럼 확장할 수 있어요."]
      ],
      note: "소장형 우편/루미레터와 연결할 때는 멤버 부담이 커지지 않게 짧은 문구 중심이 좋아요."
    },
    stretch: {
      kicker: "BROADCAST REACTION",
      title: "스트레칭 타임",
      lead: "방송 중 가볍게 쉬어가는 스트레칭 리액션 보상이에요.",
      rows: [
        ["필요 포인트", "30p"],
        ["사용 가능", "방송 중 · 쉬는 타이밍에 사용"],
        ["운영 메모", "방송 흐름을 끊지 않는 가벼운 리액션으로 유지해요."]
      ],
      note: "반짝 포인트 전용 보상이며 현장 물판 포인트와 합산하지 않아요."
    },
    aegyo: {
      kicker: "MEMBER REACTION",
      title: "애교 대사",
      lead: "멤버별 말투에 맞춘 짧은 애교 대사 보상이에요.",
      rows: [
        ["필요 포인트", "150p"],
        ["사용 가능", "방송 중 · 멤버별 대사 템플릿 연동 예정"],
        ["운영 메모", "너무 부담스러운 문구보다 짧고 귀여운 대사 중심이 안전해요."]
      ],
      note: "멤버별 말투 검수 후 실제 대사 목록을 연결하는 게 좋아요."
    },
    voice: {
      kicker: "DIGITAL REWARD",
      title: "시크릿 보이스",
      lead: "소장형 짧은 보이스 메시지로 확장할 수 있는 디지털 보상이에요.",
      rows: [
        ["필요 포인트", "300p"],
        ["사용 가능", "소장형 디지털 보상 · 추후 연동"],
        ["운영 메모", "저장/공개 범위와 재전송 기준을 정한 뒤 열어야 해요."]
      ],
      note: "실제 보이스 파일 운영은 저작권/보관/전달 방식까지 정리한 뒤 붙이는 게 안전해요."
    },
    header: {
      kicker: "PROFILE CUSTOM",
      title: "프로필 헤더",
      lead: "루미폰 프로필 꾸미기용 디지털 헤더 보상이에요.",
      rows: [
        ["필요 포인트", "500p"],
        ["사용 가능", "프로필 꾸미기 기능 연동 후 사용"],
        ["운영 메모", "시즌/멤버/이벤트별 헤더로 확장 가능해요."]
      ],
      note: "이미지 리소스가 준비된 뒤 실제 장착 기능과 연결하면 돼요."
    },
    season: {
      kicker: "SEASON LIMITED",
      title: "시즌 디지털 카드",
      lead: "생일, 데뷔일, 합류 이벤트 같은 기간 한정 디지털 보상이에요.",
      rows: [
        ["필요 포인트", "700p"],
        ["사용 가능", "시즌 이벤트 기간 한정"],
        ["운영 메모", "소장 우편/업적/프로필 배지와 연결하기 좋아요."]
      ],
      note: "시즌 한정 보상은 나중에 놓친 팬을 위해 재오픈 기준도 따로 정하면 좋아요."
    }
  };

  function setMessage(text) {
    const box = document.getElementById("exchangeMessage");
    if (!box) return;
    box.textContent = text;
  }

  function showPanel(name) {
    document.querySelectorAll("[data-exchange-tab]").forEach((button) => {
      button.classList.toggle("active", button.dataset.exchangeTab === name);
    });

    document.querySelectorAll("[data-exchange-panel]").forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.exchangePanel === name);
    });

    setMessage("");
  }

  function goSongbook() {
    const targetButton = document.querySelector('[data-page-target="songbook"]');
    if (targetButton) targetButton.click();
  }

  function openDetail(key) {
    const data = EXCHANGE_DETAILS[key];
    const modal = document.getElementById("exchangeDetailModal");
    if (!data || !modal) return;

    document.getElementById("exchangeDetailKicker").textContent = data.kicker;
    document.getElementById("exchangeDetailTitle").textContent = data.title;
    document.getElementById("exchangeDetailLead").textContent = data.lead;
    document.getElementById("exchangeDetailNote").textContent = data.note;

    const grid = document.getElementById("exchangeDetailGrid");
    if (grid) {
      grid.innerHTML = data.rows.map(([label, value]) => `
        <div class="exchange-detail-row">
          <span>${label}</span>
          <b>${value}</b>
        </div>
      `).join("");
    }

    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    setMessage(`${data.title} 상세를 열었어요.`);
  }

  function closeDetail() {
    const modal = document.getElementById("exchangeDetailModal");
    if (!modal) return;
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
  }

  function bindTabs() {
    document.querySelectorAll("[data-exchange-tab]").forEach((button) => {
      button.addEventListener("click", () => {
        const name = button.dataset.exchangeTab || "all";
        showPanel(name);
      });
    });
  }

  function bindActions() {
    document.querySelectorAll("[data-exchange-detail]").forEach((button) => {
      button.addEventListener("click", () => {
        openDetail(button.dataset.exchangeDetail);
      });
    });

    document.querySelectorAll("[data-exchange-action]").forEach((button) => {
      button.addEventListener("click", () => {
        const action = button.dataset.exchangeAction;
        if (action === "songbook") {
          goSongbook();
          return;
        }
        setMessage("교환 신청은 실제 포인트 차감 연동 후 사용할 예정이에요.");
      });
    });
  }

  function bindModal() {
    const modal = document.getElementById("exchangeDetailModal");
    const close = document.getElementById("exchangeDetailClose");
    const ok = document.getElementById("exchangeDetailOk");
    const apply = document.getElementById("exchangeDetailApply");

    close?.addEventListener("click", closeDetail);
    ok?.addEventListener("click", closeDetail);
    apply?.addEventListener("click", () => {
      setMessage("교환 신청은 실제 포인트 차감 연동 후 사용할 예정이에요.");
      closeDetail();
    });
    modal?.addEventListener("click", (event) => {
      if (event.target === modal) closeDetail();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeDetail();
    });
  }

  function boot() {
    bindTabs();
    bindActions();
    bindModal();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
