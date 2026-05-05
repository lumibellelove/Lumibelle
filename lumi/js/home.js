(() => {
  "use strict";

  const pad = (value) => String(value).padStart(2, "0");
  const dayNames = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

  function updateClock() {
    const now = new Date();
    const timeTarget = document.getElementById("homeClockTime");
    const dateTarget = document.getElementById("homeClockDate");
    if (timeTarget) timeTarget.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    if (dateTarget) dateTarget.textContent = `${dayNames[now.getDay()]} · ${pad(now.getMonth() + 1)}/${pad(now.getDate())}`;
  }



  const commonStatus = {
    left: "LUMI PHONE",
    right: "LB-0001",
  };

  const homeStatus = {
    right: "LUMIBELLE ✦ 100%",
  };

  function isHomePage() {
    const page = document.body.dataset.currentPage || "home";
    return page === "home";
  }

  function setCommonStatusbar(items) {
    items[0].textContent = commonStatus.left;
    if (window.LumiData && typeof window.LumiData.getData === "function") {
      window.LumiData.getData().then((data) => {
        if (isHomePage()) return;
        const id = data && data.user && data.user.lumiId ? data.user.lumiId : commonStatus.right;
        items[1].textContent = id || commonStatus.right;
      });
    } else {
      items[1].textContent = commonStatus.right;
    }
  }

  function setHomeStatusbar(items) {
    const now = new Date();
    items[0].textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    items[1].textContent = homeStatus.right;
  }

  function updateHomeStatusbar() {
    const statusbar = document.querySelector(".statusbar");
    if (!statusbar) return;
    const items = statusbar.querySelectorAll("span");
    if (items.length < 2) return;

    if (!isHomePage()) {
      setCommonStatusbar(items);
      return;
    }

    setHomeStatusbar(items);
  }

  function lockHomeStatusbar() {
    updateHomeStatusbar();
    [0, 40, 120, 300, 700, 1200].forEach((delay) => {
      window.setTimeout(updateHomeStatusbar, delay);
    });
    window.requestAnimationFrame(updateHomeStatusbar);
  }

  function watchStatusbarMutation() {
    const target = document.getElementById("globalLumiId");
    if (!target || typeof MutationObserver === "undefined") return;
    const observer = new MutationObserver(() => {
      if (isHomePage() && target.textContent.trim() !== homeStatus.right) {
        target.textContent = homeStatus.right;
      }
    });
    observer.observe(target, { childList: true, characterData: true, subtree: true });
  }

  function bootLogoutNotice() {
    const button = document.querySelector("[data-home-logout]");
    const message = document.getElementById("homeActionMessage");
    if (!button || !message) return;
    button.addEventListener("click", () => {
      message.textContent = "로그아웃 기능은 실제 로그인 연동 후 연결돼요.";
      window.setTimeout(() => {
        if (message.textContent.includes("로그아웃")) message.textContent = "";
      }, 2400);
    });
  }

  function boot() {
    updateClock();
    lockHomeStatusbar();
    watchStatusbarMutation();
    window.setInterval(() => {
      updateClock();
      updateHomeStatusbar();
    }, 10000);
    window.addEventListener("hashchange", lockHomeStatusbar);
    window.addEventListener("lumi:page-changed", lockHomeStatusbar);
    window.addEventListener("lumi:data-updated", lockHomeStatusbar);
    window.addEventListener("load", lockHomeStatusbar);
    document.addEventListener("click", () => window.setTimeout(lockHomeStatusbar, 0));
    bootLogoutNotice();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
