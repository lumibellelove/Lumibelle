(function () {
  const state = {
    lang: resolveInitialLang(),
    currentApp: null,
    previousApp: null,
    recentApps: [],
    today: {
      weatherTemp: "21°C",
      weatherDesc: "공연장 날씨 또는 현재 위치 기준으로 표시돼요.",
      clockShort: "12:34",
      clockTime: "12:34",
      clockDate: "FRI · MAY",
      reservationTitle: "Shine Me UP : 루미벨 데뷔 라이브",
      reservationMeta: "입금 확인 완료 · 홍대 상상마당",
      reservationStatus: "입금 확인 대기",
      ddayLabel: "D-DAY",
      ddayValue: "27",
      ddayUnit: "LIVE LIFE",
      messagesCount: "2",
      stampsCurrent: "3",
      stampsTotal: "/ 20",
      pointsValue: "120",
      homeworkCheki: "1",
      dailyMessage: "오늘도 루미벨과 연결되어 있어요.<br />반짝이는 마음은 오래 보관돼요.",
      onairStatus: "다음 방송 알림 대기 중",
      onairBadge: "STANDBY"
    }
  };

  const APP_REGISTRY = [
    { id: "ticket", labelKey: "app.ticket", iconText: "T", badge: "1", status: "active", tone: "linear-gradient(145deg,#ffe0ef,#fff7fb)" },
    { id: "message", labelKey: "app.message", iconText: "M", badge: "2", status: "active", tone: "linear-gradient(145deg,#f0ebff,#fff7fb)" },
    { id: "mail", labelKey: "app.mail", iconText: "L", status: "active", tone: "linear-gradient(145deg,#fff5df,#fff7fb)" },
    { id: "lumitalk", labelKey: "app.lumitalk", iconText: "톡", status: "placeholder", tone: "linear-gradient(145deg,#ffe0ef,#f0ebff)" },
    { id: "timeline", labelKey: "app.timeline", iconText: "R", status: "active", tone: "linear-gradient(145deg,#ecfff8,#fff7fb)" },
    { id: "profile", labelKey: "app.profile", iconText: "P", status: "active", tone: "linear-gradient(145deg,#fff,#ffe8f4)" },
    { id: "stamp", labelKey: "app.stamp", iconText: "S", status: "active", tone: "linear-gradient(145deg,#ffe9f4,#fff7fb)" },
    { id: "point", labelKey: "app.point", iconText: "P", status: "active", tone: "linear-gradient(145deg,#fff6de,#fff7fb)" },
    { id: "achievement", labelKey: "app.achievement", iconText: "A", status: "active", tone: "linear-gradient(145deg,#f0ebff,#fff)" },
    { id: "homeworkCheki", labelKey: "app.homeworkCheki", iconText: "C", status: "active", tone: "linear-gradient(145deg,#ffe0ef,#fff)" },
    { id: "onair", labelKey: "app.onair", iconText: "ON", status: "active", tone: "linear-gradient(145deg,#e9f7ff,#fff7fb)" },
    { id: "lumilog", labelKey: "app.lumilog", iconText: "LOG", status: "active", tone: "linear-gradient(145deg,#ecfff8,#fff)" },
    { id: "exchange", labelKey: "app.exchange", iconText: "EX", status: "placeholder", tone: "linear-gradient(145deg,#fff6de,#fff7fb)" },
    { id: "songbook", labelKey: "app.songbook", iconText: "♪", status: "placeholder", tone: "linear-gradient(145deg,#f0ebff,#fff)" },
    { id: "themeShop", labelKey: "app.themeShop", iconText: "TH", status: "placeholder", tone: "linear-gradient(145deg,#ffe0ef,#fff)" },
    { id: "settings", labelKey: "app.settings", iconText: "⚙", status: "active", tone: "linear-gradient(145deg,#fff,#f0ebff)" },
    { id: "comingSoon", labelKey: "app.comingSoon", iconText: "?", status: "placeholder", tone: "linear-gradient(145deg,#fff2f8,#fff)" },
    { id: "gameZone", labelKey: "app.gameZone", iconText: "G", status: "placeholder", tone: "linear-gradient(145deg,#ecfff8,#fff)" },
    { id: "guide", labelKey: "app.guide", iconText: "?", status: "active", tone: "linear-gradient(145deg,#fff5df,#fff)" },
    { id: "more", labelKey: "app.more", iconText: "＋", status: "placeholder", tone: "linear-gradient(145deg,#f3f0f4,#fff)" }
  ];

  const els = {};

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    cacheElements();
    renderI18n();
    renderToday();
    renderAppGrid();
    bindEvents();
    bindScreenDots();
  }

  function cacheElements() {
    els.appGrid = document.getElementById("appGrid");
    els.appGridMore = document.getElementById("appGridMore");
    els.appWindow = document.getElementById("appWindow");
    els.appTitle = document.getElementById("appTitle");
    els.appSubTitle = document.getElementById("appSubTitle");
    els.appBody = document.getElementById("appBody");
    els.tabsBtn = document.getElementById("tabsBtn");
    els.systemHomeBtn = document.getElementById("systemHomeBtn");
    els.systemBackBtn = document.getElementById("systemBackBtn");
    els.recentPanel = document.getElementById("recentPanel");
    els.recentList = document.getElementById("recentList");
    els.closeRecentBtn = document.getElementById("closeRecentBtn");
    els.screens = document.getElementById("screens");
  }

  function bindScreenDots() {
    if (!els.screens) return;
    const dots = Array.from(document.querySelectorAll(".page-dots .dot"));
    els.screens.addEventListener("scroll", () => {
      const index = Math.round(els.screens.scrollLeft / Math.max(1, els.screens.clientWidth));
      dots.forEach((dot, dotIndex) => dot.classList.toggle("is-active", dotIndex === index));
    }, { passive: true });
  }

  function t(key) {
    const dict = window.LUMI_I18N || {};
    return (dict[state.lang] && dict[state.lang][key]) || (dict.ko && dict.ko[key]) || key;
  }

  function renderI18n(root) {
    const scope = root || document;
    scope.querySelectorAll("[data-i18n]").forEach((node) => {
      node.textContent = t(node.dataset.i18n);
    });
  }

  function renderToday() {
    Object.keys(state.today).forEach((key) => {
      document.querySelectorAll(`[data-today="${key}"]`).forEach((node) => {
        if (key === "dailyMessage" || key === "onairStatus") {
          node.innerHTML = state.today[key];
        } else {
          node.textContent = state.today[key];
        }
      });
    });
  }

  function renderAppGrid() {
    const renderApps = (apps) => apps.map((app) => {
      const badge = app.badge ? `<em class="app-badge">${app.badge}</em>` : "";
      return `
        <article class="app-icon">
          <button type="button" class="app-button" data-open-app="${app.id}" style="--app-bg:${app.tone}">
            <span>${app.iconText}</span>${badge}
          </button>
          <p class="app-label">${t(app.labelKey)}</p>
        </article>
      `;
    }).join("");

    els.appGrid.innerHTML = renderApps(APP_REGISTRY.slice(0, 12));
    if (els.appGridMore) {
      els.appGridMore.innerHTML = renderApps(APP_REGISTRY.slice(12));
    }
  }

  function bindEvents() {
    document.addEventListener("click", (event) => {
      const appButton = event.target.closest("[data-open-app]");
      if (appButton) {
        openApp(appButton.dataset.openApp);
        return;
      }

      const homeAction = event.target.closest("[data-home-action]");
      if (homeAction) {
        goHome();
      }
    });

    els.tabsBtn.addEventListener("click", toggleRecentApps);
    els.systemHomeBtn.addEventListener("click", goHome);
    els.systemBackBtn.addEventListener("click", goBack);
    els.closeRecentBtn.addEventListener("click", closeRecentApps);
  }

  function getApp(appId) {
    return APP_REGISTRY.find((app) => app.id === appId) || APP_REGISTRY[0];
  }

  function openApp(appId) {
    const app = getApp(appId);
    state.previousApp = state.currentApp;
    state.currentApp = app.id;
    els.appTitle.textContent = t(app.labelKey);
    els.appSubTitle.textContent = t(`app.${app.id}.subtitle`) || t("app.default.subtitle");
    els.appBody.innerHTML = renderAppBody(app);
    renderI18n(els.appBody);
    els.appWindow.classList.add("is-open");
    els.appWindow.setAttribute("aria-hidden", "false");
    addRecentApp(app.id);
    closeRecentApps();
  }

  function renderAppBody(app) {
    switch (app.id) {
      case "ticket":
        return renderTicketApp();
      case "message":
        return renderMessageApp();
      case "mail":
        return renderEmptyApp("empty.noMail");
      case "timeline":
        return renderEmptyApp("empty.noTimeline");
      case "homeworkCheki":
        return renderEmptyApp("empty.noCheki");
      case "onair":
        return renderOnairApp();
      case "settings":
        return renderSettingsApp();
      default:
        return renderEmptyApp(app.status === "placeholder" ? "empty.openSoon" : "empty.noTimeline");
    }
  }

  function renderTicketApp() {
    return `
      <div class="app-tabs">
        <button type="button" class="is-active" data-i18n="ticket.current"></button>
        <button type="button" data-i18n="ticket.benefit"></button>
        <button type="button" data-i18n="ticket.past"></button>
      </div>
      <article class="card app-section">
        <h2 data-i18n="ticket.currentTitle"></h2>
        <p data-i18n="ticket.currentMeta"></p>
        <span class="soft-pill" data-i18n="ticket.status"></span>
      </article>
    `;
  }

  function renderMessageApp() {
    return `
      <article class="card app-section">
        <h2 data-i18n="today.dailyMessage"></h2>
        <p>오늘도 루미벨과 연결되어 있어요.<br />반짝이는 마음은 루미폰 안에 오래 보관돼요.</p>
      </article>
      <article class="card app-section">
        <p data-i18n="empty.noMessages"></p>
      </article>
    `;
  }

  function renderOnairApp() {
    return `
      <article class="card app-section">
        <h2 data-i18n="today.onair"></h2>
        <p data-i18n="empty.noBroadcast"></p>
      </article>
    `;
  }

  function renderSettingsApp() {
    return `
      <article class="card app-section">
        <h2 data-i18n="app.settings"></h2>
        <p>한국어 · English · 日本語 · 中文</p>
      </article>
    `;
  }

  function renderEmptyApp(key) {
    return `<article class="card app-section empty-state"><p data-i18n="${key}"></p></article>`;
  }

  function goHome() {
    els.appWindow.classList.remove("is-open");
    els.appWindow.setAttribute("aria-hidden", "true");
    state.previousApp = null;
    state.currentApp = null;
    closeRecentApps();
  }

  function goBack() {
    if (state.previousApp && state.previousApp !== state.currentApp) {
      const previous = state.previousApp;
      state.previousApp = null;
      openApp(previous);
      return;
    }
    goHome();
  }

  function addRecentApp(appId) {
    state.recentApps = state.recentApps.filter((item) => item.id !== appId);
    state.recentApps.unshift({ id: appId, openedAt: state.today.clockShort });
    state.recentApps = state.recentApps.slice(0, 5);
  }

  function toggleRecentApps() {
    if (els.recentPanel.classList.contains("is-open")) {
      closeRecentApps();
      return;
    }
    renderRecentApps();
    els.recentPanel.classList.add("is-open");
    els.recentPanel.setAttribute("aria-hidden", "false");
  }

  function closeRecentApps() {
    els.recentPanel.classList.remove("is-open");
    els.recentPanel.setAttribute("aria-hidden", "true");
  }

  function renderRecentApps() {
    if (!state.recentApps.length) {
      els.recentList.innerHTML = `<div class="empty-state" data-i18n="empty.noRecentApps"></div>`;
      renderI18n(els.recentList);
      return;
    }

    els.recentList.innerHTML = state.recentApps.map((recent) => {
      const app = getApp(recent.id);
      return `
        <button type="button" class="recent-card" data-open-app="${app.id}">
          <span>${app.iconText}</span>
          <div>
            <strong>${t(app.labelKey)}</strong>
            <em>${recent.openedAt}</em>
          </div>
        </button>
      `;
    }).join("");
  }

  function resolveInitialLang() {
    const saved = localStorage.getItem("lumiLang");
    if (["ko", "en", "ja", "zh"].includes(saved)) return saved;
    const browser = (navigator.language || "ko").toLowerCase();
    if (browser.startsWith("en")) return "en";
    if (browser.startsWith("ja")) return "ja";
    if (browser.startsWith("zh")) return "zh";
    return "ko";
  }
})();
