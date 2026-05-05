(() => {
  "use strict";

  const SONGBOOK_DETAILS = {
    mariring: {
      kicker: "MARIRING SONGBOOK",
      title: "마리링 노래책",
      lead: "별빛, 마법소녀, 왕도 아이돌, 감성 발라드 계열을 중심으로 정리하는 노래책이에요.",
      rows: [
        ["보컬 키워드", "맑은 음색 · 감성 보이스 · 바이올린 발라드"],
        ["방송 보상", "닉네임 콜, 짧은 한 소절, 감성 멘트 보상과 연결 가능"],
        ["준비 상태", "멤버 검토용 곡 리스트를 받은 뒤 실제 곡명 연결 예정"]
      ],
      note: "마리링은 밝은 왕도곡과 처연한 감성 발라드를 모두 담을 수 있게 분리해두면 좋아요."
    },
    lulu: {
      kicker: "LULU SONGBOOK",
      title: "루루 노래책",
      lead: "포근함, 딸기우유, 아기토끼 공주, 귀여운 응원송 중심으로 정리하는 노래책이에요.",
      rows: [
        ["보컬 키워드", "수줍음 · 포근함 · 핑크빛 왕도 · 귀여운 응원"],
        ["방송 보상", "애교송, 응원 한마디, 달콤한 짧은 노래 보상과 연결 가능"],
        ["준비 상태", "멤버 검토용 곡 리스트를 받은 뒤 실제 곡명 연결 예정"]
      ],
      note: "루루는 귀여움만이 아니라 작은 용기와 포근한 응원 느낌도 같이 살리면 좋아요."
    },
    iro: {
      kicker: "IRO SONGBOOK",
      title: "이로 노래책",
      lead: "명창 코나니, 푸른 다이아, 고음, 파워보컬, 여오타 감성 쪽으로 정리하는 노래책이에요.",
      rows: [
        ["보컬 키워드", "고음 · 파워보컬 · 푸른 다이아 · 공명"],
        ["방송 보상", "고음 포인트, 파워 한 소절, 명창 리액션 보상과 연결 가능"],
        ["준비 상태", "멤버 검토용 곡 리스트를 받은 뒤 실제 곡명 연결 예정"]
      ],
      note: "이로는 노래책에서도 실력파/여오타 감성을 살리는 칭호형 카피가 잘 맞아요."
    },
    lunar: {
      kicker: "LUNAR SONGBOOK",
      title: "루나 노래책",
      lead: "달빛, 밤, 몽환, 부드러운 여운형 보컬과 고양이 감성으로 정리하는 노래책이에요.",
      rows: [
        ["보컬 키워드", "달빛 · 몽환 · 부드러운 음색 · 여운"],
        ["방송 보상", "굿나잇 한 소절, 달빛 멘트, 몽환 보이스 보상과 연결 가능"],
        ["준비 상태", "멤버 검토용 곡 리스트를 받은 뒤 실제 곡명 연결 예정"]
      ],
      note: "루나는 차분하지만 친해지면 밝아지는 반전까지 노래 보상명에 녹이면 좋아요."
    }
  };

  let songbookScrollY = 0;

  function lockSongbookScroll() {
    songbookScrollY = window.scrollY || document.documentElement.scrollTop || 0;
    document.body.style.position = "fixed";
    document.body.style.top = `-${songbookScrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.classList.add("songbook-modal-open");
  }

  function unlockSongbookScroll() {
    document.body.classList.remove("songbook-modal-open");
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    window.scrollTo(0, songbookScrollY || 0);
  }

  function bindTap(element, handler) {
    if (!element) return;
    let touched = false;
    element.addEventListener("touchend", (event) => {
      touched = true;
      event.preventDefault();
      handler(event);
      setTimeout(() => { touched = false; }, 350);
    }, { passive: false });
    element.addEventListener("click", (event) => {
      if (touched) return;
      handler(event);
    });
  }

  function setMessage(text) {
    const box = document.getElementById("songbookMessage");
    if (!box) return;
    box.textContent = text;
  }

  function showPanel(name) {
    document.querySelectorAll("[data-songbook-tab]").forEach((button) => {
      button.classList.toggle("active", button.dataset.songbookTab === name);
    });

    document.querySelectorAll("[data-songbook-panel]").forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.songbookPanel === name);
    });

    setMessage("");
  }

  function openDetail(key) {
    const data = SONGBOOK_DETAILS[key];
    const modal = document.getElementById("songbookDetailModal");
    if (!data || !modal) return;

    document.getElementById("songbookDetailKicker").textContent = data.kicker;
    document.getElementById("songbookDetailTitle").textContent = data.title;
    document.getElementById("songbookDetailLead").textContent = data.lead;
    document.getElementById("songbookDetailNote").textContent = data.note;

    const grid = document.getElementById("songbookDetailGrid");
    if (grid) {
      grid.innerHTML = data.rows.map(([label, value]) => `
        <div class="songbook-detail-row">
          <span>${label}</span>
          <b>${value}</b>
        </div>
      `).join("");
    }

    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    lockSongbookScroll();
    setMessage(`${data.title} 상세를 열었어요.`);
  }

  function closeDetail() {
    const modal = document.getElementById("songbookDetailModal");
    if (!modal) return;
    if (!modal.classList.contains("active")) return;
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    unlockSongbookScroll();
  }

  function bindTabs() {
    document.querySelectorAll("[data-songbook-tab]").forEach((button) => {
      bindTap(button, () => {
        const name = button.dataset.songbookTab || "all";
        showPanel(name);
      });
    });
  }

  function bindActions() {
    document.querySelectorAll("[data-songbook-detail]").forEach((button) => {
      bindTap(button, () => {
        openDetail(button.dataset.songbookDetail);
      });
    });

    document.querySelectorAll("[data-songbook-action]").forEach((button) => {
      bindTap(button, () => {
        setMessage("노래 목록은 멤버 검토 후 연결할 예정이에요.");
      });
    });
  }

  function bindModal() {
    const modal = document.getElementById("songbookDetailModal");
    const close = document.getElementById("songbookDetailClose");
    const ok = document.getElementById("songbookDetailOk");

    bindTap(close, closeDetail);
    bindTap(ok, closeDetail);
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
