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
    /*
      Stage 81
      존재하지 않는 해시/탭 이름으로 들어와도 빈 화면이 되지 않게
      항상 실제 존재하는 페이지 이름으로 정리한다.
      정상 탭 이동/저장 데이터/각 탭 내용은 건드리지 않는다.
    */
    return pageExists(name) ? name : "home";
  }

  function pageExists(name) {
    return Boolean(document.getElementById(`page-${name}`));
  }

  function setActiveButton(name) {
    /*
      Stage 80
      상단 탭과 홈 메뉴 버튼의 active 표시를 한 번에 맞춘다.
      화면 디자인은 그대로 두고, 접근성 상태만 같이 정리한다.
    */
    document.querySelectorAll(targetSelector).forEach((button) => {
      const isActive = button.dataset.pageTarget === name;
      button.classList.toggle("active", isActive);
      if (isActive) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
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
    const safeName = normalizePageName(name);
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
    /*
      Stage 79
      분리/이식 중 app.js가 실수로 한 번 더 로드되거나
      탭 버튼이 재초기화되어도 클릭 이벤트가 중복으로 쌓이지 않게 막는다.
      화면/저장 데이터는 건드리지 않는다.
    */
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
