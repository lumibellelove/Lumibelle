(() => {
  "use strict";

  const VALID_SAMPLE_CODES = new Set(["LUMI-4827", "루미별-127", "별사탕-482", "핑크문-315"]);
  const REWARD_POINT = 30;
  const REWARD_XP = 30;
  let onairCertified = false;
  let cheerSent = false;
  let guideScrollY = 0;

  function showMessage(text) {
    const target = document.getElementById("onairMessage");
    if (!target) return;
    target.textContent = text || "";
    target.classList.toggle("show", Boolean(text));
  }

  function normalizeCode(value) {
    return String(value || "").trim().toUpperCase();
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

  function setOnairVerifiedState(joinCount = 1, rewardPoint = REWARD_POINT, rewardXp = REWARD_XP) {
    onairCertified = true;
    const statusCard = document.getElementById("onairStatusCard");
    if (statusCard) statusCard.classList.add("is-verified");
    setText("onairStatusTitle", "루미코드 인증 완료");
    setText("onairStatusText", "오늘 방송 참여 기록이 확인됐어요.");
    setText("onairJoinCount", `${joinCount || 1}회`);
    setText("onairRewardPoint", `+${rewardPoint || 0}P`);
    setText("onairRewardXp", `+${rewardXp || 0}XP`);
  }

  function lockGuideScroll() {
    if (document.body.classList.contains("onair-modal-open")) return;
    guideScrollY = window.scrollY || window.pageYOffset || 0;
    document.body.classList.add("modal-open", "onair-modal-open");
    document.body.style.position = "fixed";
    document.body.style.top = `-${guideScrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
  }

  function unlockGuideScroll() {
    if (!document.body.classList.contains("onair-modal-open")) return;
    document.body.classList.remove("modal-open", "onair-modal-open");
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    window.scrollTo(0, guideScrollY || 0);
  }

  async function loadOnairData() {
    if (!window.LumiData?.getData) return;
    try {
      const data = await window.LumiData.getData();
      const onair = data.onair || {};
      if (onair.certified) {
        setOnairVerifiedState(onair.joinCount || 1, onair.todayRewardPoint || REWARD_POINT, onair.todayRewardXp || REWARD_XP);
        showMessage("오늘 방송 참여 인증이 완료된 상태예요.");
      }
    } catch (error) {
      // 데이터가 없어도 기본 화면으로 진행한다.
    }
  }

  async function saveOnairReward() {
    if (!window.LumiData?.getData || !window.LumiData?.updateData) {
      setOnairVerifiedState(1, REWARD_POINT, REWARD_XP);
      return;
    }

    const data = await window.LumiData.getData();
    const points = data.points || {};
    const previousLogs = Array.isArray(data.pointLogs) ? data.pointLogs : [];
    const nextJoinCount = Number(data.onair?.joinCount || 0) + 1;
    const today = formatToday();
    const nextLogs = [
      { date: today, type: "반짝 포인트", title: "ON AIR 루미코드 인증", desc: "방송 참여 보상", amount: `+${REWARD_POINT}P` },
      { date: today, type: "반짝 XP", title: "ON AIR 루미코드 인증", desc: "온라인 연결 성장 기록", amount: `+${REWARD_XP}XP` },
      ...previousLogs
    ];

    await window.LumiData.updateData({
      points: {
        ...points,
        sparkPoint: Number(points.sparkPoint || 0) + REWARD_POINT,
        sparkXp: Number(points.sparkXp || 0) + REWARD_XP
      },
      onair: {
        ...(data.onair || {}),
        certified: true,
        joinCount: nextJoinCount,
        todayRewardPoint: REWARD_POINT,
        todayRewardXp: REWARD_XP,
        lastCertifiedAt: new Date().toISOString()
      },
      pointLogs: nextLogs
    });

    setOnairVerifiedState(nextJoinCount, REWARD_POINT, REWARD_XP);
  }

  function bootCodeForm() {
    const input = document.getElementById("lumiCodeInput");
    const submit = document.getElementById("lumiCodeSubmit");
    if (!input || !submit) return;

    input.placeholder = "";
    input.setAttribute("autocomplete", "off");
    input.setAttribute("autocapitalize", "characters");
    input.setAttribute("spellcheck", "false");

    input.addEventListener("focus", () => {
      input.placeholder = "";
    });

    input.addEventListener("blur", () => {
      input.placeholder = "";
    });

    async function submitCode() {
      const raw = input.value.trim();
      if (!raw) {
        showMessage("루미코드를 입력해 주세요.");
        return;
      }

      if (onairCertified) {
        showMessage("이미 오늘 방송 참여 인증이 완료됐어요.");
        return;
      }

      const normalized = normalizeCode(raw);
      const valid = Array.from(VALID_SAMPLE_CODES).some((code) => normalizeCode(code) === normalized);
      if (valid) {
        await saveOnairReward();
        showMessage("루미코드 인증 완료! 반짝 포인트와 XP가 저장됐어요.");
      } else {
        showMessage("루미코드가 맞지 않아요. 예시 코드는 LUMI-4827 이에요.");
      }
    }

    submit.addEventListener("click", submitCode);
    submit.addEventListener("touchend", (event) => {
      event.preventDefault();
      submitCode();
    }, { passive: false });
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") submitCode();
    });
  }

  function openGuide() {
    const modal = document.getElementById("onairGuideModal");
    if (!modal) return;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    lockGuideScroll();
  }

  function closeGuide() {
    const modal = document.getElementById("onairGuideModal");
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    unlockGuideScroll();
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
      const runAction = () => {
        const action = button.dataset.onairAction;
        if (action === "cheer") {
          if (cheerSent) {
            showMessage("오늘 반짝 응원은 이미 보냈어요.");
            return;
          }
          cheerSent = true;
          button.classList.add("is-done");
          showMessage("반짝 응원을 보냈어요.");
        }
        if (action === "guide") openGuide();
      };

      button.addEventListener("click", runAction);
    });
  }

  function boot() {
    bootCodeForm();
    bootActions();
    bootGuideModal();
    loadOnairData();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
