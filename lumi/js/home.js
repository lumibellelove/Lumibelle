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



  let statusbarOriginal = null;

  function updateHomeStatusbar() {
    const statusbar = document.querySelector(".statusbar");
    if (!statusbar) return;
    const items = statusbar.querySelectorAll("span");
    if (items.length < 2) return;

    if (!statusbarOriginal) {
      statusbarOriginal = [items[0].textContent, items[1].textContent];
    }

    const isHome = document.body.dataset.currentPage === "home";
    if (!isHome) {
      items[0].textContent = statusbarOriginal[0] || "LUMI PHONE";
      if (window.LumiData && typeof window.LumiData.getData === "function") {
        window.LumiData.getData().then((data) => {
          const id = data && data.user && data.user.lumiId ? data.user.lumiId : statusbarOriginal[1];
          items[1].textContent = id || "LB-0001";
        });
      } else {
        items[1].textContent = statusbarOriginal[1] || "LB-0001";
      }
      return;
    }

    const now = new Date();
    items[0].textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    items[1].textContent = "LUMIBELLE ✦ 100%";
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
    updateHomeStatusbar();
    window.setInterval(() => {
      updateClock();
      updateHomeStatusbar();
    }, 10000);
    window.addEventListener("hashchange", updateHomeStatusbar);
    window.addEventListener("lumi:data-updated", updateHomeStatusbar);
    document.addEventListener("click", () => window.setTimeout(updateHomeStatusbar, 0));
    bootLogoutNotice();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
