(() => {
  "use strict";

  const DEFAULT_PROFILE = {
    lumiId: "LB-0001",
    nickname: "루루냐냐",
    oshi: "Lumibelle 👑",
    title: "첫 예매의 반짝임",
    birthday: "미등록",
    avatar: "👑"
  };

  function setMessage(text) {
    const message = document.getElementById("profileMessage");
    if (!message) return;
    message.textContent = text;
  }

  function setText(id, text) {
    const target = document.getElementById(id);
    if (target) target.textContent = text;
  }

  function setAllTitleText(title) {
    document.querySelectorAll("#profileEquippedTitleInline").forEach((target) => {
      target.textContent = title;
    });
    setText("profileEquippedTitleCard", title);
    setText("profileShareTitleText", title);
  }

  function normalizeProfile(user = {}) {
    return {
      ...DEFAULT_PROFILE,
      ...user,
      nickname: user.nickname || DEFAULT_PROFILE.nickname,
      oshi: user.oshi || DEFAULT_PROFILE.oshi,
      title: user.title || DEFAULT_PROFILE.title,
      birthday: user.birthday || DEFAULT_PROFILE.birthday,
      avatar: user.avatar || DEFAULT_PROFILE.avatar
    };
  }

  function getCurrentProfileFromScreen() {
    return normalizeProfile({
      lumiId: document.getElementById("globalLumiId")?.textContent?.trim() || DEFAULT_PROFILE.lumiId,
      nickname: document.getElementById("profileNickname")?.textContent?.trim() || DEFAULT_PROFILE.nickname,
      oshi: document.getElementById("profileOshiCard")?.textContent?.trim() || DEFAULT_PROFILE.oshi,
      title: document.getElementById("profileEquippedTitleCard")?.textContent?.trim() || DEFAULT_PROFILE.title,
      birthday: (document.getElementById("profileBirthdayChip")?.textContent || "").replace(/^생일\s*/, "").trim() || DEFAULT_PROFILE.birthday,
      avatar: document.getElementById("profileAvatar")?.textContent?.trim() || DEFAULT_PROFILE.avatar
    });
  }

  function fillProfileForm(profile) {
    const nicknameInput = document.getElementById("profileEditNickname");
    const oshiInput = document.getElementById("profileEditOshi");
    const birthdayInput = document.getElementById("profileEditBirthday");
    const avatarInput = document.getElementById("profileEditAvatar");

    if (nicknameInput) nicknameInput.value = profile.nickname;
    if (oshiInput) oshiInput.value = profile.oshi;
    if (birthdayInput) birthdayInput.value = profile.birthday === "미등록" ? "" : profile.birthday;
    if (avatarInput) avatarInput.value = profile.avatar;
  }

  function applyProfile(profileInput) {
    const profile = normalizeProfile(profileInput);
    const birthdayText = profile.birthday && profile.birthday !== "미등록" ? profile.birthday : "미등록";

    setText("globalLumiId", profile.lumiId);
    setText("homeAvatar", profile.avatar);
    setText("homeProfileMeta", `${profile.lumiId} · ${profile.oshi}`);
    setText("homeNickname", profile.nickname);

    setText("profileMeta", `${profile.lumiId} · ${profile.oshi}`);
    setText("profileNickname", profile.nickname);
    setText("profileAvatar", profile.avatar);
    setText("profileOshiChip", `오시 ${profile.oshi}`);
    setText("profileOshiCard", profile.oshi);
    setText("profileBirthdayChip", birthdayText === "미등록" ? "생일 미등록" : `생일 ${birthdayText}`);
    setAllTitleText(profile.title);

    setText("profileShareLumiId", profile.lumiId);
    setText("profileShareNickname", profile.nickname);
    setText("profileShareOshi", profile.oshi);
    setText("profileShareAvatar", profile.avatar);
    setText("profileShareTitleText", profile.title);
    fillProfileForm(profile);
  }

  async function loadProfileFromData() {
    if (!window.LumiData?.getData) {
      applyProfile(DEFAULT_PROFILE);
      return;
    }

    try {
      const data = await window.LumiData.getData();
      applyProfile(data.user || DEFAULT_PROFILE);
    } catch (error) {
      applyProfile(DEFAULT_PROFILE);
    }
  }

  async function saveProfileToData(profile) {
    if (!window.LumiData?.updateData) return;
    try {
      await window.LumiData.updateData({ user: profile });
    } catch (error) {
      // 화면 반영은 유지하고, 저장 실패만 조용히 넘긴다.
    }
  }

  function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    if (id === "profileEditModal") fillProfileForm(getCurrentProfileFromScreen());
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
    applyProfile(getCurrentProfileFromScreen());
  }

  async function saveProfileEdit() {
    const current = getCurrentProfileFromScreen();
    const nickname = document.getElementById("profileEditNickname")?.value.trim() || DEFAULT_PROFILE.nickname;
    const oshi = document.getElementById("profileEditOshi")?.value || DEFAULT_PROFILE.oshi;
    const birthday = document.getElementById("profileEditBirthday")?.value.trim() || "미등록";
    const avatar = document.getElementById("profileEditAvatar")?.value || DEFAULT_PROFILE.avatar;
    const nextProfile = normalizeProfile({ ...current, nickname, oshi, birthday, avatar });

    applyProfile(nextProfile);
    await saveProfileToData(nextProfile);
    closeModal("profileEditModal");
    setMessage("프로필 꾸미기가 저장됐어요. 새로고침 후에도 유지돼요.");
  }

  function goAchievement() {
    const achievementButton = document.querySelector('[data-page-target="achievement"]');
    if (achievementButton) {
      achievementButton.click();
      return;
    }
    window.location.hash = "#achievement";
  }

  function handleProfileAction(target) {
    const button = target.closest("button");
    if (!button) return false;

    if (button.id === "profileEditButton") {
      openModal("profileEditModal");
      return true;
    }

    if (button.id === "profileTitleButton") {
      setMessage("업적/칭호 탭에서 해금된 칭호를 장착할 수 있어요.");
      goAchievement();
      return true;
    }

    if (button.id === "profileShareButton") {
      syncSharePreview();
      openModal("profileShareModal");
      return true;
    }

    if (button.id === "profileEditSave") {
      saveProfileEdit();
      return true;
    }

    if (button.dataset.profileClose) {
      const type = button.dataset.profileClose;
      if (type === "edit") closeModal("profileEditModal");
      if (type === "share") closeModal("profileShareModal");
      return true;
    }

    return false;
  }

  function handleBackdrop(target) {
    const closer = target.closest("[data-profile-close]");
    if (!closer) return false;
    const type = closer.dataset.profileClose;
    if (type === "edit") closeModal("profileEditModal");
    if (type === "share") closeModal("profileShareModal");
    return true;
  }

  function bootDelegatedEvents() {
    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (handleProfileAction(target) || handleBackdrop(target)) event.preventDefault();
    });

    document.addEventListener("touchend", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (handleProfileAction(target) || handleBackdrop(target)) event.preventDefault();
    }, { passive: false });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      closeModal("profileEditModal");
      closeModal("profileShareModal");
    });
  }

  async function boot() {
    bootDelegatedEvents();
    await loadProfileFromData();
    syncSharePreview();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
