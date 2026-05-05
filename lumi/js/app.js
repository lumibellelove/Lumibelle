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

  function showPage(name, options = {}) {
    const safeName = pageExists(name) ? name : "home";
    const target = document.getElementById(`page-${safeName}`);
    if (!target) return;

    document.querySelectorAll(pageSelector).forEach((page) => {
      page.classList.toggle("active", page === target);
    });

    setActiveButton(safeName);
    document.body.dataset.currentPage = safeName;

    if (options.pushHash !== false) {
      const nextHash = `#${safeName}`;
      if (window.location.hash !== nextHash) {
        history.replaceState(null, "", nextHash);
      }
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
    const missingPages = targets.filter((name) => !pageExists(name));
    const pagesWithoutTarget = pages.filter((name) => !targets.includes(name));

    window.__LUMIPHONE_STAGE72_HOME_CLEANUP_CHECK__ = {
      pages,
      targets,
      missingPages,
      pagesWithoutTarget,
      ok: missingPages.length === 0 && pagesWithoutTarget.length === 0,
    };
  }

  function boot() {
    bindNavigation();
    runNavigationCheck();
    const initial = getPageNameFromHash();
    showPage(initial, { pushHash: false });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
