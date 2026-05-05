(() => {
  "use strict";

  const EXCHANGE_DETAILS = {
    water: {
      cost: 30,
      kicker: "BROADCAST REACTION",
      title: "물 한 모금",
      lead: "방송 중 멤버에게 잠깐 쉬어가는 물 마시기 리액션을 보내는 가벼운 보상이에요.",
      rows: [
        ["필요 포인트", "30p"],
        ["사용 가능", "방송 중 사용 가능 · 1회성 리액션"],
        ["운영 메모", "멤버 컨디션과 방송 흐름에 따라 바로 반응하지 못할 수 있어요."]
      ],
      note: "교환 신청 시 필요한 포인트와 이용 조건을 확인해 주세요."
    },
    nickname: {
      cost: 50,
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
      cost: 80,
      kicker: "DIGITAL REWARD",
      title: "응원 한마디",
      lead: "루미나에게 짧은 응원 멘트를 남기는 디지털 보상이에요.",
      rows: [
        ["필요 포인트", "80p"],
        ["사용 가능", "방송/온라인 이벤트용 디지털 보상"],
        ["운영 메모", "멤버별 메시지 보상과 연결할 수 있어요."]
      ],
      note: "소장형 우편/루미레터와 연결할 때는 멤버 부담이 커지지 않게 짧은 문구 중심이 좋아요."
    },
    stretch: {
      cost: 30,
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
      cost: 150,
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
      cost: 300,
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
      cost: 500,
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
      cost: 700,
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

  let savedScrollY = 0;
  let currentDetailKey = null;
  let currentSparkPoint = 0;

  function setMessage(text) {
    const box = document.getElementById("exchangeMessage");
    if (!box) return;
    box.textContent = text || "";
  }

  function setText(id, text) {
    const target = document.getElementById(id);
    if (target) target.textContent = text;
  }

  function formatToday() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}.${m}.${d}`;
  }

  function updateExchangeBalance(points = {}) {
    currentSparkPoint = Number(points.sparkPoint || 0);
    setText("exchangeBalanceValue", `${currentSparkPoint}p`);
    const hint = currentSparkPoint > 0 ? "교환 가능한 반짝 포인트" : "반짝 포인트를 모아 교환해요";
    setText("exchangeBalanceHint", hint);
  }

  async function loadExchangeData() {
    if (!window.LumiData?.getData) {
      updateExchangeBalance({ sparkPoint: 180 });
      return;
    }
    try {
      const data = await window.LumiData.getData();
      updateExchangeBalance(data.points || {});
    } catch (error) {
      updateExchangeBalance({ sparkPoint: 180 });
    }
  }

  function lockBodyScroll() {
    savedScrollY = window.scrollY || document.documentElement.scrollTop || 0;
    document.body.classList.add("modal-open-exchange");
    document.body.style.position = "fixed";
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
  }

  function unlockBodyScroll() {
    document.body.classList.remove("modal-open-exchange");
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    window.scrollTo(0, savedScrollY);
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

  function setApplyButtonState(data) {
    const apply = document.getElementById("exchangeDetailApply");
    if (!apply || !data) return;
    const cost = Number(data.cost || 0);
    const enough = currentSparkPoint >= cost;
    apply.textContent = enough ? `교환 신청하기 · ${cost}p` : `포인트 부족 · ${cost}p 필요`;
    apply.disabled = !enough;
    apply.classList.toggle("is-disabled", !enough);
  }

  function openDetail(key) {
    const data = EXCHANGE_DETAILS[key];
    const modal = document.getElementById("exchangeDetailModal");
    if (!data || !modal) return;
    currentDetailKey = key;

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

    setApplyButtonState(data);
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    lockBodyScroll();
    setMessage(`${data.title} 상세를 열었어요.`);
  }

  function closeDetail() {
    const modal = document.getElementById("exchangeDetailModal");
    if (!modal) return;
    if (!modal.classList.contains("active")) return;
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    unlockBodyScroll();
  }

  async function redeemCurrentItem() {
    const item = EXCHANGE_DETAILS[currentDetailKey];
    if (!item) return;
    const cost = Number(item.cost || 0);

    if (currentSparkPoint < cost) {
      setMessage(`반짝 포인트가 부족해요. ${item.title} 교환에는 ${cost}p가 필요해요.`);
      setApplyButtonState(item);
      return;
    }

    if (!window.LumiData?.getData || !window.LumiData?.updateData) {
      setMessage(`${item.title} 교환 신청이 기록됐어요.`);
      closeDetail();
      return;
    }

    try {
      const data = await window.LumiData.getData();
      const points = data.points || {};
      const balance = Number(points.sparkPoint || 0);
      if (balance < cost) {
        currentSparkPoint = balance;
        updateExchangeBalance(points);
        setMessage(`반짝 포인트가 부족해요. 현재 ${balance}p를 보유 중이에요.`);
        setApplyButtonState(item);
        return;
      }

      const today = formatToday();
      const previousLogs = Array.isArray(data.pointLogs) ? data.pointLogs : [];
      const previousRequests = Array.isArray(data.exchange?.requests) ? data.exchange.requests : [];
      const nextLog = {
        date: today,
        type: "반짝 포인트",
        title: `${item.title} 교환`,
        desc: "교환소 보상 신청",
        amount: `-${cost}P`,
        minus: true
      };
      const nextRequest = {
        id: `exchange-${Date.now()}`,
        key: currentDetailKey,
        title: item.title,
        cost,
        status: "신청 완료",
        createdAt: new Date().toISOString()
      };

      const next = await window.LumiData.updateData({
        points: {
          ...points,
          sparkPoint: balance - cost
        },
        pointLogs: [nextLog, ...previousLogs],
        exchange: {
          ...(data.exchange || {}),
          requests: [nextRequest, ...previousRequests]
        }
      });

      updateExchangeBalance(next.points || {});
      setMessage(`${item.title} 교환 신청 완료! 반짝 포인트 ${cost}p가 차감됐어요.`);
      closeDetail();
    } catch (error) {
      setMessage("교환 신청 저장 중 문제가 생겼어요. 다시 시도해 주세요.");
    }
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
        setMessage("상세 화면에서 교환 신청을 진행해 주세요.");
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
    apply?.addEventListener("click", redeemCurrentItem);
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
    loadExchangeData();

    window.addEventListener("lumi:data-updated", (event) => {
      updateExchangeBalance((event.detail || {}).points || {});
      if (currentDetailKey) setApplyButtonState(EXCHANGE_DETAILS[currentDetailKey]);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
