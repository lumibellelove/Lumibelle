(() => {
  "use strict";

  const pageSelector = ".page";
  const targetSelector = "[data-page-target]";

  function getPageNameFromHash() {
    const raw = window.location.hash.replace(/^#/, "").trim();
    if (!raw) return "home";
    return raw.startsWith("page-") ? raw.slice(5) : raw;
  }

  function normalizePageName(name) {
    
    return pageExists(name) ? name : "home";
  }

  function pageExists(name) {
    return Boolean(document.getElementById(`page-${name}`));
  }

  function setActiveButton(name) {
    
    document.querySelectorAll(targetSelector).forEach((button) => {
      const isActive = button.dataset.pageTarget === name;
      button.classList.toggle("active", isActive);
      if (isActive) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
  }

  function resetPageScroll() {
    
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      const screen = document.querySelector(".screen");
      if (screen && typeof screen.scrollTop === "number") screen.scrollTop = 0;
    });
  }

  function showPage(name, options = {}) {
    const safeName = normalizePageName(name);
    const target = document.getElementById(`page-${safeName}`);
    if (!target) return;

    
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
      if (button.dataset.lumiNavBound === "1") return;
      button.dataset.lumiNavBound = "1";

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
    if (window.__LUMIPHONE_APP_BOOTED__ === true) {
      bindNavigation();
      runNavigationCheck();
      return;
    }
    window.__LUMIPHONE_APP_BOOTED__ = true;

    bindNavigation();
    runNavigationCheck();
    const initialRaw = getPageNameFromHash();
    const initial = normalizePageName(initialRaw);
    showPage(initial, { pushHash: false, resetScroll: false });

    if (initialRaw !== initial && window.location.hash) {
      history.replaceState(null, "", `#${initial}`);
    }

    window.addEventListener("hashchange", () => {
      const nextRaw = getPageNameFromHash();
      const next = normalizePageName(nextRaw);
      showPage(next, { pushHash: false });
      if (nextRaw !== next && window.location.hash) {
        history.replaceState(null, "", `#${next}`);
      }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
