(() => {
  "use strict";

  const VALID_SAMPLE_CODES = new Set(["LUMI-4827", "루미별-127", "별사탕-482", "핑크문-315"]);
  let onairCertified = false;
  let cheerSent = false;

  function showMessage(text) {
    const target = document.getElementById("onairMessage");
    if (!target) return;
    target.textContent = text;
  }

  function normalizeCode(value) {
    return String(value || "").trim().toUpperCase();
  }

  function setText(id, text) {
    const target = document.getElementById(id);
    if (target) target.textContent = text;
  }

  function setOnairVerifiedState() {
    onairCertified = true;
    const statusCard = document.getElementById("onairStatusCard");
    if (statusCard) statusCard.classList.add("is-verified");
    setText("onairStatusTitle", "루미코드 인증 완료");
    setText("onairStatusText", "오늘 방송 참여 샘플 기록이 확인됐어요. 실제 연동 전에는 저장되지 않아요.");
    setText("onairJoinCount", "1회");
    setText("onairRewardPoint", "+30P");
    setText("onairRewardXp", "+30XP");
  }

  function bootCodeForm() {
    const input = document.getElementById("lumiCodeInput");
    const submit = document.getElementById("lumiCodeSubmit");
    if (!input || !submit) return;

    function submitCode() {
      const raw = input.value.trim();
      if (!raw) {
        showMessage("루미코드를 입력해 주세요.");
        return;
      }

      if (onairCertified) {
        showMessage("이미 오늘 방송 참여 샘플 인증이 완료됐어요.");
        return;
      }

      const normalized = normalizeCode(raw);
      const valid = Array.from(VALID_SAMPLE_CODES).some((code) => normalizeCode(code) === normalized);
      if (valid) {
        setOnairVerifiedState();
        showMessage("루미코드 인증 샘플 완료! 반짝 포인트와 XP가 화면에 반영됐어요.");
      } else {
        showMessage("샘플 코드와 달라요. 예시 코드는 LUMI-4827 이에요.");
      }
    }

    submit.addEventListener("click", submitCode);
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") submitCode();
    });
  }

  function openGuide() {
    const modal = document.getElementById("onairGuideModal");
    if (!modal) return;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
  }

  function closeGuide() {
    const modal = document.getElementById("onairGuideModal");
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  }

  function bootGuideModal() {
    document.querySelectorAll("[data-onair-guide-close]").forEach((button) => {
      button.addEventListener("click", closeGuide);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeGuide();
    });
  }

  function bootActions() {
    document.querySelectorAll("[data-onair-action]").forEach((button) => {
      button.addEventListener("click", () => {
        const action = button.dataset.onairAction;
        if (action === "cheer") {
          if (cheerSent) {
            showMessage("오늘 반짝 응원 샘플은 이미 보냈어요.");
            return;
          }
          cheerSent = true;
          button.classList.add("is-done");
          showMessage("반짝 응원 샘플을 보냈어요. 실제 방송 연동 전에는 저장되지 않아요.");
        }
        if (action === "guide") openGuide();
      });
    });
  }

  function boot() {
    bootCodeForm();
    bootActions();
    bootGuideModal();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
