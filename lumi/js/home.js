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
    window.setInterval(updateClock, 30000);
    bootLogoutNotice();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
