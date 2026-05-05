(() => {
  "use strict";

  const chekiDetails = {
    "debut-live": {
      kicker: "숙제체키 기록",
      title: "데뷔 라이브 숙제체키",
      desc: "현장 특전회에서 접수된 숙제체키 샘플 기록이에요.",
      event: "2026.07.12 Debut Live",
      member: "마리링 / 루루",
      status: "데코/전달 준비 중",
      receive: "다음 라이브 현장 수령",
      note: "실제 사진 업로드와 전달 완료 처리는 추후 스탭 기록과 연결할 예정이에요. 지금은 상세보기 흐름 확인용 샘플이에요."
    }
  };

  let savedScrollY = 0;

  function setMessage(text) {
    const message = document.getElementById("chekiMessage");
    if (!message) return;
    message.textContent = text || "";
    message.classList.toggle("show", Boolean(text));
  }

  function fillText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function lockBodyScroll() {
    savedScrollY = window.scrollY || document.documentElement.scrollTop || 0;
    document.body.classList.add("cheki-modal-open");
    document.body.style.top = `-${savedScrollY}px`;
  }

  function unlockBodyScroll() {
    document.body.classList.remove("cheki-modal-open");
    document.body.style.top = "";
    window.scrollTo(0, savedScrollY || 0);
  }

  function openDetail(id) {
    const data = chekiDetails[id] || chekiDetails["debut-live"];
    const modal = document.getElementById("chekiDetailModal");
    if (!modal || !data) return;

    fillText("chekiDetailKicker", data.kicker);
    fillText("chekiDetailTitle", data.title);
    fillText("chekiDetailDesc", data.desc);
    fillText("chekiDetailEvent", data.event);
    fillText("chekiDetailMember", data.member);
    fillText("chekiDetailStatus", data.status);
    fillText("chekiDetailReceive", data.receive);
    fillText("chekiDetailNote", data.note);

    modal.hidden = false;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    lockBodyScroll();
    setMessage("");
  }

  function closeDetail() {
    const modal = document.getElementById("chekiDetailModal");
    if (!modal || modal.hidden) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    modal.hidden = true;
    unlockBodyScroll();
  }

  function bindPress(selector, handler) {
    document.querySelectorAll(selector).forEach((button) => {
      button.addEventListener("click", handler);
      button.addEventListener("touchend", (event) => {
        event.preventDefault();
        handler.call(button, event);
      }, { passive: false });
    });
  }

  function boot() {
    bindPress("[data-cheki-action]", function () {
      const action = this.dataset.chekiAction;
      if (action === "view") {
        openDetail(this.dataset.chekiId || "debut-live");
      } else if (action === "request") {
        setMessage("숙제체키 문의/요청 기능은 실제 데이터 연동 전 샘플이에요.");
      } else {
        setMessage("숙제체키 기록을 확인했어요.");
      }
    });

    bindPress("[data-cheki-close]", closeDetail);

    const modal = document.getElementById("chekiDetailModal");
    if (modal) {
      modal.addEventListener("click", (event) => {
        if (event.target === modal) closeDetail();
      });
    }

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeDetail();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
