(() => {
  "use strict";

  function setMessage(text) {
    const message = document.getElementById("profileMessage");
    if (!message) return;
    message.textContent = text;
  }

  function setText(id, text) {
    const target = document.getElementById(id);
    if (target) target.textContent = text;
  }

  function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  }

  function syncSharePreview() {
    const nickname = document.getElementById("profileNickname")?.textContent || "루루냐냐";
    const oshi = document.getElementById("profileOshiCard")?.textContent || "Lumibelle 👑";
    const title = document.getElementById("profileEquippedTitleInline")?.textContent || "첫 예매의 반짝임";
    const avatar = document.getElementById("profileAvatar")?.textContent || "👑";

    setText("profileShareNickname", nickname);
    setText("profileShareOshi", oshi);
    setText("profileShareTitleText", title);
    setText("profileShareAvatar", avatar);
  }

  function saveProfileEdit() {
    const nickname = document.getElementById("profileEditNickname")?.value.trim() || "루루냐냐";
    const oshi = document.getElementById("profileEditOshi")?.value || "Lumibelle 👑";
    const birthday = document.getElementById("profileEditBirthday")?.value.trim();
    const avatar = document.getElementById("profileEditAvatar")?.value || "👑";

    setText("profileNickname", nickname);
    setText("profileAvatar", avatar);
    setText("profileOshiChip", `오시 ${oshi}`);
    setText("profileOshiCard", oshi);
    setText("profileBirthdayChip", birthday ? `생일 ${birthday}` : "생일 미등록");
    syncSharePreview();
    closeModal("profileEditModal");
    setMessage("프로필 꾸미기 샘플이 화면에 반영됐어요. 실제 저장은 연동 단계에서 연결해요.");
  }

  function goAchievement() {
    const achievementButton = document.querySelector('[data-page-target="achievement"]');
    if (achievementButton) {
      achievementButton.click();
      return;
    }
    window.location.hash = "#achievement";
  }

  function bootButtons() {
    const editButton = document.getElementById("profileEditButton");
    const shareButton = document.getElementById("profileShareButton");
    const titleButton = document.getElementById("profileTitleButton");
    const saveButton = document.getElementById("profileEditSave");

    if (editButton) {
      editButton.addEventListener("click", () => openModal("profileEditModal"));
    }

    if (titleButton) {
      titleButton.addEventListener("click", () => {
        setMessage("업적/칭호 탭에서 해금된 칭호를 장착할 수 있어요.");
        goAchievement();
      });
    }

    if (shareButton) {
      shareButton.addEventListener("click", () => {
        syncSharePreview();
        openModal("profileShareModal");
      });
    }

    if (saveButton) saveButton.addEventListener("click", saveProfileEdit);
  }

  function bootModalClose() {
    document.querySelectorAll("[data-profile-close]").forEach((button) => {
      button.addEventListener("click", () => {
        const type = button.dataset.profileClose;
        if (type === "edit") closeModal("profileEditModal");
        if (type === "share") closeModal("profileShareModal");
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      closeModal("profileEditModal");
      closeModal("profileShareModal");
    });
  }

  function boot() {
    bootButtons();
    bootModalClose();
    syncSharePreview();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
