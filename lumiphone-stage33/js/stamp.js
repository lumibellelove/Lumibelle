(() => {
  "use strict";

  let stampCount = 1;
  const maxStamp = 20;

  function renderStampGrid() {
    const grid = document.getElementById("stampGrid");
    const countText = document.getElementById("stampCount");
    if (!grid) return;

    grid.innerHTML = Array.from({ length: maxStamp }, (_, index) => {
      const number = index + 1;
      const filled = number <= stampCount;
      return `
        <div class="stamp-cell${filled ? " filled" : ""}">
          <small>${number}</small>
        </div>
      `;
    }).join("");

    if (countText) countText.textContent = stampCount;
  }

  function boot() {
    const addButton = document.getElementById("stampAddTest");
    const prevButton = document.getElementById("stampPrev");
    const nextButton = document.getElementById("stampNext");

    if (addButton) {
      addButton.addEventListener("click", () => {
        stampCount = Math.min(maxStamp, stampCount + 1);
        renderStampGrid();
      });
    }

    if (prevButton) {
      prevButton.addEventListener("click", () => {
        stampCount = Math.max(0, stampCount - 1);
        renderStampGrid();
      });
    }

    if (nextButton) {
      nextButton.addEventListener("click", () => {
        stampCount = Math.min(maxStamp, stampCount + 1);
        renderStampGrid();
      });
    }

    renderStampGrid();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
