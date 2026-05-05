(() => {
  "use strict";

  const pageSelector = ".page";
  const targetSelector = "[data-page-target]";

  function getPageNameFromHash() {
    const raw = window.location.hash.replace(/^#/, "").trim();
    if (!raw) return "home";
    return raw.startsWith("page-") ? raw.slice(5) : raw;
  }

  function pageExists(name) {
    return Boolean(document.getElementById(`page-${name}`));
  }

  function setActiveButton(name) {
    document.querySelectorAll(targetSelector).forEach((button) => {
      button.classList.toggle("active", button.dataset.pageTarget === name);
    });
  }

  function resetPageScroll() {
    /*
      Stage 78
      모바일에서 홈 하단까지 내려간 뒤 다른 탭을 누르면
      새 탭도 중간 위치에서 시작해 보일 수 있어서,
      탭 전환 직후 루미폰 화면을 맨 위로 정리한다.
    */
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      const screen = document.querySelector(".screen");
      if (screen && typeof screen.scrollTop === "number") screen.scrollTop = 0;
    });
  }

  function showPage(name, options = {}) {
    const safeName = pageExists(name) ? name : "home";
    const target = document.getElementById(`page-${safeName}`);
    if (!target) return;

    /*
      Stage 77
      body 상태를 먼저 바꿔야 홈 전용 상단바/메뉴 CSS가
      탭 전환 순간에 늦게 따라오지 않는다.
    */
    document.body.dataset.currentPage = safeName;

    document.querySelectorAll(pageSelector).forEach((page) => {
      page.classList.toggle("active", page === target);
    });

    setActiveButton(safeName);
    window.dispatchEvent(new CustomEvent("lumi:page-changed", { detail: { page: safeName } }));

    if (options.pushHash !== false) {
      const nextHash = `#${safeName}`;
      if (window.location.hash !== nextHash) {
        history.replaceState(null, "", nextHash);
      }
    }

    if (options.resetScroll !== false) {
      resetPageScroll();
    }
  }

  function bindNavigation() {
    document.querySelectorAll(targetSelector).forEach((button) => {
      button.addEventListener("click", (event) => {
        const name = button.dataset.pageTarget;
        if (!name || !pageExists(name)) return;
        event.preventDefault();
        showPage(name);
      });
    });
  }

  function runNavigationCheck() {
    const pages = [...document.querySelectorAll(pageSelector)].map((page) => page.id.replace(/^page-/, ""));
    const targets = [...document.querySelectorAll(targetSelector)].map((button) => button.dataset.pageTarget).filter(Boolean);
    const targetSet = new Set(targets);
    const missingPages = [...targetSet].filter((name) => !pageExists(name));
    const pagesWithoutTarget = pages.filter((name) => !targetSet.has(name));
    const duplicateTargets = targets.filter((name, index) => targets.indexOf(name) !== index);

    window.__LUMIPHONE_STAGE77_NAV_CHECK__ = {
      pages,
      targets,
      missingPages,
      pagesWithoutTarget,
      duplicateTargets,
      ok: missingPages.length === 0 && pagesWithoutTarget.length === 0,
    };
  }

  function boot() {
    bindNavigation();
    runNavigationCheck();
    const initial = getPageNameFromHash();
    showPage(initial, { pushHash: false, resetScroll: false });

    window.addEventListener("hashchange", () => {
      showPage(getPageNameFromHash(), { pushHash: false });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
