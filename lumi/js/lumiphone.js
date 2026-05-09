
    (() => {
      "use strict";

      const APP_VERSION = 'lumi_signup_patch1_fix2C_signup_ux_ghost_fix_20260510';
      const LUMI_API_ENDPOINT_RAW = String(window.LUMI_API_ENDPOINT || "").trim();

      // ── PATCH 51-36: 캐시 유틸 ───────────────────────────────
      const CACHE_VERSION = "v1";
      function cacheKey_(lumiId, type) {
        return "lumiphone.cache." + CACHE_VERSION + "." + type + "." + String(lumiId || "").toLowerCase();
      }
      function cacheWrite_(lumiId, type, data) {
        try {
          localStorage.setItem(cacheKey_(lumiId, type), JSON.stringify({ ts: Date.now(), data: data }));
        } catch(e) {}
      }
      function cacheRead_(lumiId, type, maxAgeMs) {
        try {
          const raw = localStorage.getItem(cacheKey_(lumiId, type));
          if (!raw) return null;
          const obj = JSON.parse(raw);
          if (!obj || !obj.data) return null;
          if (maxAgeMs && (Date.now() - obj.ts) > maxAgeMs) return null;
          return obj.data;
        } catch(e) { return null; }
      }
      // 별도 IIFE에서도 접근할 수 있도록 window 브릿지 노출
      window.__lumiCacheRead  = function(lumiId, type, maxAgeMs) { return cacheRead_(lumiId, type, maxAgeMs); };
      window.__lumiCacheWrite = function(lumiId, type, data)      { cacheWrite_(lumiId, type, data); };
      // ──────────────────────────────────────────────────────────
      // PATCH 51-32-fix5: const로 고정하면 window.LUMI_API_ENDPOINT가 나중에 세팅될 때
      // IIFE 내부 변수는 이미 ""로 굳어버림. 함수로 바꿔서 호출 시점에 항상 최신값 읽기.
      function LUMI_API_ENDPOINT() { return String(window.LUMI_API_ENDPOINT || "").trim(); }
      const DEBUG_MODE = new URLSearchParams(window.location.search).get("debug") === "1";
      // PATCH 51-46: 별도 IIFE에서 접근 가능하도록 window 브릿지로 노출
      window.__LUMI_DEBUG_MODE = DEBUG_MODE;
      const LUMI_API_TIMEOUT_MS = 12000;
      let currentUser = null;
      let myReservations = [];
      let reservationsLoadState = "idle"; // PATCH 51-41: idle/loading/loaded/error
      let bootDebugText = "";

      function setBootDebug(text) {
        bootDebugText = String(text || "");
        if (!DEBUG_MODE) return;
        const target = document.getElementById("lumiChromeDebugText");
        if (target) target.textContent = bootDebugText;
      }

      function appendBootDebug(text) {
        const next = String(text || "");
        setBootDebug(bootDebugText ? bootDebugText + " / " + next : next);
      }

      function clearLegacyStorageForChromePatch(force) {
        const keys = [
          "lumiApiEndpoint",
          "LUMI_API_ENDPOINT",
          "lumiphone.apiEndpoint",
          "lumiphone.version",
          "lumiphone.appVersion"
          // PATCH 51-39-fix1: lumiphone.releaseReset.patch14.v1는 여기서 지우지 않음.
          // 이 키가 지워지면 APP_VERSION 변경마다 runReleaseDataResetPatch14()가 재실행되어
          // lumi_v108_msg_read(읽음 기록) 등을 삭제하고 NEW가 되살아나는 버그 발생.
        ];
        try {
          const current = window.localStorage ? localStorage.getItem("lumiphone.appVersion") : APP_VERSION;
          if (force || current !== APP_VERSION) {
            keys.forEach((key) => {
              try { localStorage.removeItem(key); } catch (error) {}
              try { sessionStorage.removeItem(key); } catch (error) {}
            });
            try { localStorage.setItem("lumiphone.appVersion", APP_VERSION); } catch (error) {}
            appendBootDebug(force ? "storage reset forced" : "storage reset for " + APP_VERSION);
          }
        } catch (error) {
          appendBootDebug("storage reset skipped: " + String(error && error.message ? error.message : error));
        }
      }

      function unregisterServiceWorkersForChromePatch(force) {
        if (!("serviceWorker" in navigator)) return;
        try {
          navigator.serviceWorker.getRegistrations().then((registrations) => {
            if (!registrations || !registrations.length) {
              if (force) appendBootDebug("service worker none");
              return;
            }
            registrations.forEach((registration) => registration.unregister());
            appendBootDebug("service worker unregistered: " + registrations.length);
          }).catch((error) => appendBootDebug("service worker check failed: " + String(error && error.message ? error.message : error)));
        } catch (error) {
          appendBootDebug("service worker check failed: " + String(error && error.message ? error.message : error));
        }
      }

      function clearBrowserCachesForChromePatch() {
        if (!("caches" in window)) return Promise.resolve();
        return caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key)))).then((deleted) => {
          appendBootDebug("cache cleared: " + deleted.length);
        }).catch((error) => appendBootDebug("cache clear skipped: " + String(error && error.message ? error.message : error)));
      }

      function forceChromeRecoveryReload() {
        setBootDebug("Chrome recovery reload running...");
        clearLegacyStorageForChromePatch(true);
        unregisterServiceWorkersForChromePatch(true);
        clearBrowserCachesForChromePatch().finally(() => {
          const url = new URL(window.location.href);
          url.searchParams.set("lumiReload", String(Date.now()));
          window.location.replace(url.toString());
        });
      }

      function installChromeRecoveryPanel() {
        if (!DEBUG_MODE) return;
        const parent = (loginForm && loginForm.parentNode) || loginView || document.body;
        if (!parent || document.getElementById("lumiChromeRecoveryBox")) return;
        const box = document.createElement("div");
        box.id = "lumiChromeRecoveryBox";
        box.style.marginTop = "12px";
        box.style.padding = "12px";
        box.style.border = "1px solid #f0bfd4";
        box.style.borderRadius = "18px";
        box.style.background = "#fff8ee";
        box.style.color = "#b96b2f";
        box.style.fontSize = "12px";
        box.style.fontWeight = "900";
        box.style.lineHeight = "1.55";
        box.innerHTML = '<div>APP VERSION: ' + APP_VERSION + '</div>' +
          '<div>API: ' + (LUMI_API_ENDPOINT() ? '설정됨' : '미설정') + '</div>' +
          '<div id="lumiChromeDebugText">' + (bootDebugText || 'debug ready') + '</div>' +
          '<button type="button" id="lumiChromeForceReloadBtn" style="margin-top:8px;min-height:36px;border-radius:999px;border:1px solid #f0bfd4;background:#fff;color:#d77ca7;font-weight:900;padding:0 12px;cursor:pointer;">Chrome 일반모드 강제 새로고침</button>';
        parent.appendChild(box);
        const btn = document.getElementById("lumiChromeForceReloadBtn");
        if (btn) btn.addEventListener("click", forceChromeRecoveryReload);
      }

      clearLegacyStorageForChromePatch(false);
      unregisterServiceWorkersForChromePatch(false);
      if (!LUMI_API_ENDPOINT()) setBootDebug("missing LUMI_API_ENDPOINT");
      else setBootDebug("API endpoint ready");
      const $ = (selector, root = document) => root.querySelector(selector);
      const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

      const loginView = $("#loginView");
      const appView = $("#appView");
      const loginForm = $("#loginForm");
      const loginId = $("#loginId");
      const loginPin = $("#loginPin");
      const loginMsg = $("#loginMsg");

      // Security Patch 2-2E: 로그인 비밀번호 입력칸은 더 이상 4자리 PIN 전용이 아님.
      // index.html에 남아 있는 maxlength/inputmode/pattern 속성을 JS에서 보정한다.
      if (loginPin) {
        loginPin.setAttribute("maxlength", "20");
        loginPin.setAttribute("autocomplete", "current-password");
        loginPin.setAttribute("placeholder", "비밀번호");
        loginPin.setAttribute("inputmode", "text");
        loginPin.removeAttribute("pattern");
      }

      const sampleBtn = $("#sampleBtn");
      const newIdBtn = $("#newIdBtn");
      const forgotPinBtn = $("#forgotPinBtn");
      const loginLangButtons = $$('[data-lumi-lang]');
      const langStorageKey = "lumiLang";
      const loginStateStorageKey = "lumiphone.loginState.v1";
      const lastPageStorageKey = "lumiphone.lastPage.v1"; // PATCH 51-40: 마지막 탭 저장
      const logoutBtn = $("#logoutBtn");
      const statusTime = $("#statusTime");
      const homeClock = $("#homeClock");
      const homeDate = $("#homeDate");
      const codeReadyBtn = $("#codeReadyBtn");
      const codeToast = $("#codeToast");
      const profileEditOpen = $("#profileEditOpen");
      const profileEditor = $("#profileEditor");
      const profileCancel = $("#profileCancel");
      const profileApply = $("#profileApply");
      const profileCoverPick = $("#profileCoverPick");
      const profileAvatarPick = $("#profileAvatarPick");
      const profileCoverInput = $("#profileCoverInput");
      const profileAvatarInput = $("#profileAvatarInput");
      const profileCoverImg = $("#profileCoverImg");
      const profileAvatarImg = $("#profileAvatarImg");
      const profileCover = $("#profileCover");
      const profileAvatar = $("#profileAvatar");
      const profileDisplayName = $("#profileDisplayName");
      const profileMeta = $("#profileMeta");
      const profileTitlePill = $("#profileTitlePill");
      
      const profileSpaceTag = $("#profileSpaceTag");
      const profileBirthdayTag = $("#profileBirthdayTag");
      const profileJoinTag = $("#profileJoinTag");
      const profileInputDisplayName = $("#profileInputDisplayName");
      const profileInputLetterName = $("#profileInputLetterName");
      const profileInputOshi = $("#profileInputOshi");
      const profileOshiButton = $("#profileOshiButton");
      const profileOshiCurrent = $("#profileOshiCurrent");
      const profileOshiModal = $("#profileOshiModal");
      const profileOshiClose = $("#profileOshiClose");
      const profileOshiConfirmModal = $("#profileOshiConfirmModal");
      const profileOshiConfirmClose = $("#profileOshiConfirmClose");
      const profileOshiConfirmApply = $("#profileOshiConfirmApply");
      const profileOshiConfirmBody = $("#profileOshiConfirmBody");
      const profileOshiConfirmCancel = $("#profileOshiConfirmCancel");
      const profileInputBroadcastName = $("#profileInputBroadcastName");
      const profileInputTitle = $("#profileInputTitle");
      const profileSelectedTitle = $("#profileSelectedTitle");
      const profileTitlePick = $("#profileTitlePick");
      const profileTitleQuickOpen = $("#profileTitleQuickOpen");
      const profileTitleModal = $("#profileTitleModal");
      const profileTitleClose = $("#profileTitleClose");
      
      const profileInputSpace = $("#profileInputSpace");
      const profileBirthdayMonth = $("#profileBirthdayMonth");
      const profileBirthdayDay = $("#profileBirthdayDay");
      const profileError = $("#profileError");
      const profileShareOpen = $("#profileShareOpen");
      const profileEditorClose = $("#profileEditorClose");
      const profileEditorSaveTop = $("#profileEditorSaveTop");
      const profileEditorCoverImg = $("#profileEditorCoverImg");
      const profileEditorAvatarImg = $("#profileEditorAvatarImg");
      const profileEditorCover = $("#profileEditorCover");
      const profileEditorAvatar = $("#profileEditorAvatar");
      const profileSimpleModal = $("#profileSimpleModal");
      const profileSimpleTitle = $("#profileSimpleTitle");
      const profileSimpleBody = $("#profileSimpleBody");
      const profileSimpleClose = $("#profileSimpleClose");
      const profileSimpleOk = $("#profileSimpleOk");
      const profileSimpleActions = $("#profileSimpleActions");
      const achievementCards = $$('.achievement-card[data-achievement-title]');
      const achievementModal = $('#achievementModal');
      const achievementModalClose = $('#achievementModalClose');
      const achievementModalIcon = $('#achievementModalIcon');
      const achievementModalTitle = $('#achievementModalTitle');
      const achievementModalStatus = $('#achievementModalStatus');
      const achievementModalCategory = $('#achievementModalCategory');
      const achievementModalDesc = $('#achievementModalDesc');
      const achievementModalCondition = $('#achievementModalCondition');
      const achievementModalReward = $('#achievementModalReward');
      const achievementModalProgress = $('#achievementModalProgress');
      const achievementModalDate = $('#achievementModalDate');
      const achievementModalEquip = $('#achievementModalEquip');
      const achievementModalRepresentative = $('#achievementModalRepresentative');
      const achievementFilterButtons = $$('.achievement-filter-pill[data-achievement-filter]');
      const achievementSummaryDone = $('#achievementSummaryDone');
      const achievementSummaryTitles = $('#achievementSummaryTitles');
      const achievementSummaryProgress = $('#achievementSummaryProgress');
      const achievementSummaryProgressName = $('#achievementSummaryProgressName');
      const achievementSummaryProgressIcon = $('#achievementSummaryProgressIcon');
      const achievementSummaryProgressCard = $('#achievementSummaryProgressCard');
      const achievementSummaryRepresentative = $('#achievementSummaryRepresentative');
      const achievementSummaryRepresentativeIcon = $('#achievementSummaryRepresentativeIcon');
      const achievementSummaryRepresentativeCard = $('#achievementSummaryRepresentativeCard');
      const achievementPagePrev = $('#achievementPagePrev');
      const achievementPageNext = $('#achievementPageNext');
      const achievementPageText = $('#achievementPageText');
      const achievementShareActionButtons = $$('.achievement-share-action[data-share-scope][data-share-action]');
      let currentAchievementCard = null;
      let achievementCurrentFilter = "전체";
      let achievementCurrentPage = 1;
      const achievementPageSize = 6;
      // Lumi Signup Patch 1-fix2A: 업적 대표 칭호 키도 계정별 격리
      function representativeAchievementKeyFor(lumiId) {
        const id = lumiId || getCurrentLumiId() || "";
        return id ? "lumiphone.representativeAchievement.v2." + id.toLowerCase() : "lumiphone.representativeAchievement.v1";
      }
      const representativeAchievementKey = representativeAchievementKeyFor("");
      let runtimeEquippedTitleFromApi = ''; // PATCH 51-52: API 조회용 장착 칭호 표시

      function normId(value) {
        const digits = String(value || "").replace(/\D/g, "").slice(-4);
        return digits ? "LB-" + digits.padStart(4, "0") : "";
      }

      function normalizeLoginIdInput(value) {
        return String(value || "").replace(/\D/g, "").slice(-4);
      }

      function showMessage(text) {
        loginMsg.textContent = text;
        loginMsg.classList.add("show");
      }

      function clearMessage() {
        loginMsg.textContent = "";
        loginMsg.classList.remove("show");
      }

      function saveLumiLang(lang) {
        try { localStorage.setItem(langStorageKey, lang); } catch (error) {}
      }

      function readLumiLang() {
        try { return localStorage.getItem(langStorageKey) || "kr"; } catch (error) { return "kr"; }
      }

      function saveLoginState(user) {
        try {
          const source = (user && typeof user === "object") ? user : { lumiId: user };
          const id = normId(source.lumiId || source.id || "");
          if (!id) {
            appendBootDebug("saveLoginState skipped: empty id");
            return;
          }
          const payload = {
            id: id,
            lumiId: id,
            nickname: source.nickname || "",
            oshi: source.oshi || "",
            level: source.level || "",
            // PATCH 51-54: 프로필 표시용 확장 필드도 세션에 보존
            createdAt: source.createdAt || "",
            joinedAt: source.joinedAt || source.createdAt || "",
            birthMonth: source.birthMonth || source.birthdayMonth || "",
            birthDay: source.birthDay || source.birthdayDay || "",
            profileMessage: source.profileMessage || "",
            equippedTitle: source.equippedTitle || "",
            // SecPatch1: 서버 발급 sessionToken 저장
            sessionToken: source.sessionToken || "",
            // Security Patch 2-2D: 임시 비밀번호 변경 유도용 상태 보존
            passwordType: source.passwordType || source.pinType || "",
            mustChangePassword: source.mustChangePassword === true || String(source.mustChangePassword || source.mustChangePin || "").toLowerCase() === "true",
            passwordRule: source.passwordRule || "",
            passwordUpdatedAt: source.passwordUpdatedAt || source.pinUpdatedAt || "",
            type: "api",
            savedAt: Date.now()
          };
          localStorage.setItem(loginStateStorageKey, JSON.stringify(payload));
          // PATCH 51-39: sessionStorage에도 세션 플래그 저장 (탭 새로고침 즉시 진입용)
          try { sessionStorage.setItem("lumiphone.session.active", id); } catch(e) {}
          const savedRaw = localStorage.getItem(loginStateStorageKey);
          if (savedRaw) {
            appendBootDebug("login saved OK: " + id);
          } else {
            appendBootDebug("login save FAILED: " + id);
          }
        } catch (error) {
          appendBootDebug("login save error: " + String(error && error.message ? error.message : error));
        }
      }

      function readLoginState() {
        try {
          const raw = localStorage.getItem(loginStateStorageKey);
          if (!raw) return null;
          const state = JSON.parse(raw);
          const id = normId(state && (state.lumiId || state.id));
          if (!id) return null;
          return {
            id: id,
            lumiId: id,
            nickname: state.nickname || "",
            oshi: state.oshi || "",
            level: state.level || "",
            createdAt: state.createdAt || "",
            joinedAt: state.joinedAt || state.createdAt || "",
            birthMonth: state.birthMonth || state.birthdayMonth || "",
            birthDay: state.birthDay || state.birthdayDay || "",
            profileMessage: state.profileMessage || "",
            equippedTitle: state.equippedTitle || "",
            passwordType: state.passwordType || state.pinType || "",
            mustChangePassword: state.mustChangePassword === true || String(state.mustChangePassword || state.mustChangePin || "").toLowerCase() === "true",
            passwordRule: state.passwordRule || "",
            passwordUpdatedAt: state.passwordUpdatedAt || state.pinUpdatedAt || "",
            type: state.type || "api",
            // SecPatch1: 저장된 sessionToken 복원
            sessionToken: state.sessionToken || ""
          };
        } catch (error) {
          return null;
        }
      }

      function getCurrentLumiId() {
        return normId((currentUser && (currentUser.lumiId || currentUser.id)) || "");
      }

      function getCurrentNickname() {
        return (currentUser && currentUser.nickname) || "루미나";
      }

      function clearLoginState() {
        try { localStorage.removeItem(loginStateStorageKey); } catch (error) {}
        try { sessionStorage.removeItem("lumiphone.session.active"); } catch(e) {} // PATCH 51-39
      }


      function runReleaseDataResetPatch14() {
        const resetKey = "lumiphone.releaseReset.patch14.v1";
        try {
          if (localStorage.getItem(resetKey) === "done") return;
          [
            "lumiSavedMailIds",
            // PATCH 51-39-fix1: 읽음 상태 키는 삭제하지 않음
            // "lumiReadMailIds",     ← 우편 읽음 기록 — 보존
            "lumiSavedLogIds",
            "lumiReadLogIds",
            // "lumi_v108_msg_read",  ← 문자 읽음 기록 — 보존
            "lumi_v108_msg_saved",
            "lumi_v108_msg_replies",
            "lumi_v256_stamp_title_rewards",
            "lumiphone.representativeAchievement.v1"
          ].forEach((key) => localStorage.removeItem(key));
          Object.keys(localStorage).forEach((key) => {
            if (
              key.indexOf("lumiMessageSaved:") === 0 ||
              key.indexOf("lumiphone.birthdayTicket.used.") === 0 ||
              key.indexOf("lumiphone:onair:cheer:") === 0
            ) {
              localStorage.removeItem(key);
            }
          });
          localStorage.setItem(resetKey, "done");
        } catch (error) {}
      }

      // Lumi Signup Patch 1-fix2A: 이전 글로벌 프로필 키 잔재 정리 (1회 실행)
      function runAccountIsolationReset() {
        const resetKey2 = "lumiphone.releaseReset.fix2A.v1";
        try {
          if (localStorage.getItem(resetKey2) === "done") return;
          // 이전 글로벌 profile/oshi 키는 삭제하지 않고 그대로 둔다.
          // (삭제하면 기존 유저의 커버/아바타가 날아가므로 마이그레이션하지 않음)
          // 단, lumiphone.profile.v1은 로그인 후 계정별 키가 비어 있을 때 1회 복사한다.
          localStorage.setItem(resetKey2, "done");
        } catch (error) {}
      }
      runReleaseDataResetPatch14();
      runAccountIsolationReset();

      function setLumiLang(lang, announce) {
        const selected = ["kr", "en", "jp", "cn"].includes(lang) ? lang : "kr";
        loginLangButtons.forEach((button) => {
          button.classList.toggle("active", button.dataset.lumiLang === selected);
          button.setAttribute("aria-pressed", button.dataset.lumiLang === selected ? "true" : "false");
        });
        saveLumiLang(selected);
        document.documentElement.setAttribute("data-lumi-lang", selected);
        if (announce) {
          showMessage(selected === "kr" ? "한국어 기준으로 표시할게요." : "언어 선택은 저장됐어요. 실제 다국어 전환은 준비 중이에요.");
        }
      }


      function isMustChangePasswordUser_(user) {
        if (!user) return false;
        const type = String(user.passwordType || user.pinType || "").trim().toLowerCase();
        const must = user.mustChangePassword === true || String(user.mustChangePassword || user.mustChangePin || "").trim().toLowerCase() === "true";
        return must || type === "temporary" || type === "temp";
      }

      function showTemporaryPasswordNotice_() {
        if (!isMustChangePasswordUser_(currentUser)) return;
        if (document.getElementById("lumiTempPasswordNotice")) return;
        const styleId = "lumiTempPasswordNoticeStyle";
        if (!document.getElementById(styleId)) {
          const style = document.createElement("style");
          style.id = styleId;
          style.textContent = "#lumiTempPasswordNotice{position:fixed;inset:0;z-index:9998;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(84,48,74,.26);backdrop-filter:blur(6px)}.lumi-temp-password-card{width:min(430px,100%);border:1px solid #f2bdd5;border-radius:26px;background:#fff;box-shadow:0 24px 70px rgba(110,62,91,.2);padding:22px;color:#6b445b}.lumi-temp-password-card h3{margin:0 0 8px;font-size:22px;color:#e06fa3}.lumi-temp-password-card p{margin:0 0 16px;font-size:13px;font-weight:800;line-height:1.65;color:#8a5d75}.lumi-temp-password-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}.lumi-temp-password-actions button{min-height:42px;border-radius:999px;font-weight:900;cursor:pointer}.lumi-temp-password-primary{border:0;background:#ff5ba5;color:#fff;box-shadow:0 10px 24px rgba(255,91,165,.2)}.lumi-temp-password-later{border:1px solid #f0bfd4;background:#fff;color:#9a5b7b}";
          document.head.appendChild(style);
        }
        const notice = document.createElement("div");
        notice.id = "lumiTempPasswordNotice";
        notice.innerHTML = '<div class="lumi-temp-password-card" role="dialog" aria-modal="true" aria-label="임시 비밀번호 변경 안내"><h3>임시 비밀번호로 로그인했어요</h3><p>현장에서 발급받은 임시 비밀번호는 안전을 위해 직접 새 비밀번호로 변경해 주세요. 새 비밀번호는 영문, 숫자, 특수문자를 사용할 수 있어요.</p><div class="lumi-temp-password-actions"><button type="button" class="lumi-temp-password-primary" id="lumiTempPasswordChange">비밀번호 변경하기</button><button type="button" class="lumi-temp-password-later" id="lumiTempPasswordLater">나중에 하기</button></div></div>';
        document.body.appendChild(notice);
        const close = function() { try { notice.remove(); } catch(e) {} };
        notice.querySelector("#lumiTempPasswordLater").addEventListener("click", close);
        notice.querySelector("#lumiTempPasswordChange").addEventListener("click", function() {
          close();
          try { openLumiRecoveryModal("reset"); } catch(e) { if (forgotPinBtn) forgotPinBtn.click(); }
        });
      }

      async function openApp(options) {
        const settings = options || {};
        if (settings.user) currentUser = normalizeLumiUser(settings.user);
        if (settings.persist !== false && currentUser) saveLoginState(currentUser);

        // PATCH 51-32: 문자함 IIFE에서 API 읽음 처리를 호출할 수 있도록 최소 브릿지만 노출
        window.__lumiFetchApi = function(params) { return fetchLumiApi(params); };
        window.__lumiGetCurrentId = function() { return getCurrentLumiId(); };

        clearMessage();
        loginView.classList.remove("active");
        appView.classList.add("active");

        // PATCH 51-45: 안정화 단계에서는 새 진입 시 항상 home 고정
        // (공홈 재진입과 새로고침을 구분할 수 없어 기록탭 복원이 오히려 혼란스러운 문제)
        // lastPage 복원은 추후 별도 패치에서 재활성화
        go("home");
        updateClock();
        window.setTimeout(showTemporaryPasswordNotice_, 450);

        if (!(currentUser && getCurrentLumiId())) return;

        const lid = getCurrentLumiId();

        // Lumi Signup Patch 1-fix2A: 계정별 격리 - 로그인 시 해당 계정 프로필 로드
        loadProfileState(lid);
        renderProfileView();

        // PATCH 51-54: 로그인 응답/lumi_users 기반 프로필 표시값 즉시 반영
        syncProfileInfoFromUser(currentUser);
        // PATCH 51-57: 기록 탭 루미 ID 생성일/DAY 즉시 반영
        syncRecordJoinDateFromUser(currentUser);

        // PATCH 51-57-fix3: 저장 세션이 오래되어 createdAt이 비어 있을 수 있으므로
        // profile 캐시가 있으면 먼저 보강한다.
        const cachedProfile = cacheRead_(lid, "profile", 24 * 60 * 60 * 1000);
        if (cachedProfile && cachedProfile.user) {
          currentUser = normalizeLumiUser(Object.assign({}, currentUser || {}, cachedProfile.user));
          saveLoginState(currentUser);
          syncProfileInfoFromUser(currentUser);
          syncRecordJoinDateFromUser(currentUser);
        }

        // PATCH 51-37: 캐시 즉시 복원 (동기, 0ms)
        const cachedRes    = cacheRead_(lid, "reservations", 24 * 60 * 60 * 1000);
        const cachedMail   = cacheRead_(lid, "mail",         24 * 60 * 60 * 1000);
        const cachedSms    = cacheRead_(lid, "sms",          24 * 60 * 60 * 1000);
        const cachedVisits = cacheRead_(lid, "visits",       24 * 60 * 60 * 1000);

        if (cachedRes) {
          myReservations = cachedRes;
          renderMyReservations(cachedRes);
        }

        // PATCH 51-45: mail과 sms를 독립적으로 복원 (한쪽만 있어도 다른 쪽을 [] 확정하지 않음)
        if (cachedMail) {
          LUMI_RUNTIME_MAIL_ITEMS = cachedMail;
          window.__lumiRuntimeMailItems = LUMI_RUNTIME_MAIL_ITEMS;
        }
        if (cachedSms) {
          LUMI_RUNTIME_MESSAGE_ITEMS = cachedSms;
          window.__lumiRuntimeMessageItems = LUMI_RUNTIME_MESSAGE_ITEMS;
        }
        if (cachedMail || cachedSms) {
          // 캐시가 있는 쪽만 확정, 없는 쪽은 API 결과 기다림
          if (cachedMail && cachedSms) {
            LUMI_MESSAGES_LOAD_DONE   = true;
            window.__lumiMessagesLoadDone = true;
          }
          // 한쪽만 있으면 loadDone=false 유지 → API 완료 후 확정
          renderMailAll();
          if (typeof window.showLumiMessageInbox === "function") window.showLumiMessageInbox();
          appendBootDebug("cache restored: mail=" + (cachedMail ? cachedMail.length : "miss") + " sms=" + (cachedSms ? cachedSms.length : "miss"));
        }

        // PATCH 51-45: visits 캐시 즉시 window 브릿지로 전달 (기록 탭 0회 방지)
        if (cachedVisits && Array.isArray(cachedVisits) && cachedVisits.length > 0) {
          window.__lumiCachedVisits = cachedVisits; // 기록 IIFE가 읽어서 즉시 렌더
          appendBootDebug("visits cache: " + cachedVisits.length + " items");
        }

        // PATCH 51-47: 숙제체키 캐시 즉시 복원
        const cachedCheki = cacheRead_(lid, "cheki", 24 * 60 * 60 * 1000);
        if (cachedCheki && Array.isArray(cachedCheki)) {
          renderHomeworkCheki(cachedCheki);
          appendBootDebug("cheki cache: " + cachedCheki.length + " items");
        }

        // PATCH 51-48: 특전권/이벤트권 캐시 즉시 복원
        const cachedLumiTickets = cacheRead_(lid, "lumiTickets", 24 * 60 * 60 * 1000);
        if (cachedLumiTickets && Array.isArray(cachedLumiTickets)) {
          renderLumiTickets(cachedLumiTickets);
          appendBootDebug("lumiTickets cache: " + cachedLumiTickets.length + " items");
        }

        // PATCH 51-49: 루미 체크인/스탬프 캐시 즉시 복원
        const cachedCheckins = cacheRead_(lid, "checkins", 24 * 60 * 60 * 1000);
        if (cachedCheckins) {
          renderCheckins(cachedCheckins);
          appendBootDebug("checkins cache: stamps=" + (cachedCheckins.totalStamps || 0));
        }

        // PATCH 51-50: 포인트 3종 캐시 즉시 복원
        const cachedPoints = cacheRead_(lid, "points", 24 * 60 * 60 * 1000);
        if (cachedPoints) {
          renderPoints(cachedPoints);
          appendBootDebug("points cache: merch=" + (((cachedPoints.totals || {}).merch) || 0) + " xp=" + (((cachedPoints.totals || {}).xp) || 0) + " site=" + (((cachedPoints.totals || {}).site) || 0));
        }

        // PATCH 51-52: 업적/칭호 캐시 즉시 복원
        const cachedAchievements = cacheRead_(lid, "achievements", 24 * 60 * 60 * 1000);
        if (cachedAchievements) {
          renderAchievementsFromApi(cachedAchievements);
          appendBootDebug("achievements cache: " + (((cachedAchievements.achievements || []).length) || 0) + " items");
        }

        // PATCH 51-53: ON AIR 기록 캐시 즉시 복원
        const cachedOnAirLogs = cacheRead_(lid, "onAirLogs", 24 * 60 * 60 * 1000);
        if (cachedOnAirLogs) {
          renderOnAirLogs(cachedOnAirLogs);
          appendBootDebug("onAir cache: " + (((cachedOnAirLogs.logs || []).length) || 0) + " items");
        }

        // PATCH 51-55: 교환소 아이템 캐시 즉시 복원
        const cachedShopItems = cacheRead_(lid, "shopItems", 24 * 60 * 60 * 1000);
        if (cachedShopItems) {
          renderShopItems(cachedShopItems);
          appendBootDebug("shopItems cache: " + (((cachedShopItems.items || []).length) || 0) + " items");
        }

        // PATCH 51-37: API는 백그라운드 병렬 실행 (await 없음 → 화면 진입 차단 안 함)
        function runBackgroundRefresh(lid) {
          function doRefresh() {
          // PATCH 51-39: allSettled → 한쪽 실패해도 나머지 계속
          Promise.allSettled([
            loadMyProfile(lid).catch(function(e) { // PATCH 51-57-fix3
              appendBootDebug("bg profile error: " + String(e && e.message || e));
            }),
            loadMyReservations(lid).catch(function(e) {
              appendBootDebug("bg reservation error: " + String(e && e.message || e));
            }),
            loadMyMessages(lid).catch(function(e) {
              appendBootDebug("bg message error: " + String(e && e.message || e));
            }),
            loadMyCheki(lid).catch(function(e) { // PATCH 51-47
              appendBootDebug("bg cheki error: " + String(e && e.message || e));
            }),
            loadMyLumiTickets(lid).catch(function(e) { // PATCH 51-48
              appendBootDebug("bg lumiTickets error: " + String(e && e.message || e));
            }),
            loadMyCheckins(lid).catch(function(e) { // PATCH 51-49
              appendBootDebug("bg checkins error: " + String(e && e.message || e));
            }),
            loadMyPoints(lid).catch(function(e) { // PATCH 51-50
              appendBootDebug("bg points error: " + String(e && e.message || e));
            }),
            loadMyAchievements(lid).catch(function(e) { // PATCH 51-52
              appendBootDebug("bg achievements error: " + String(e && e.message || e));
            }),
            loadMyOnAirLogs(lid).catch(function(e) { // PATCH 51-53
              appendBootDebug("bg onair error: " + String(e && e.message || e));
            }),
            loadMyShopItems(lid).catch(function(e) { // PATCH 51-55
              appendBootDebug("bg shopItems error: " + String(e && e.message || e));
            })
          ]);
          }

          if (LUMI_API_ENDPOINT()) {
            doRefresh();
          } else {
            // endpoint가 나중에 세팅되는 경우 최대 2초 폴링
            appendBootDebug("openApp: LUMI_API_ENDPOINT empty, polling for bg refresh...");
            var attempts = 0;
            var poll = setInterval(function() {
              attempts++;
              if (LUMI_API_ENDPOINT() || attempts >= 20) {
                clearInterval(poll);
                appendBootDebug("openApp: poll done attempts=" + attempts + " found=" + !!LUMI_API_ENDPOINT());
                if (LUMI_API_ENDPOINT()) doRefresh();
              }
            }, 100);
          }
        }

        runBackgroundRefresh(lid);
      }

      // PATCH 51-38-fix1: 로그인 버튼 상태 원복 헬퍼 (closeApp/로그아웃 시 반드시 호출)
      function resetLoginButton() {
        const btn = loginForm && loginForm.querySelector("button[type='submit']");
        if (!btn) return;
        btn.disabled = false;
        btn.textContent = "루미폰 열기";
      }

      function closeApp() {
        clearLoginState();
        // PATCH 51-40: 로그아웃 후에는 마지막 탭 기록 제거 → 재로그인 시 home 시작
        try { localStorage.removeItem(lastPageStorageKey); } catch (error) {}
        appView.classList.remove("active");
        loginView.classList.add("active");
        loginId.value = "";
        loginPin.value = "";
        clearMessage();
        resetLoginButton(); // PATCH 51-38-fix1: 버튼 고착 방지
      }

      function go(page) {
        const targetName = page || "home";
        // PATCH 51-40: 마지막 탭 저장. 잘못된 값은 다음 openApp에서 page 존재 여부로 fallback 처리.
        try { localStorage.setItem(lastPageStorageKey, targetName); } catch (error) {}
        if (typeof closeProfileSimpleModal === "function") closeProfileSimpleModal();
        $$(".page").forEach((el) => el.classList.toggle("active", el.id === "page-" + targetName));
        $$(".tab").forEach((el) => el.classList.toggle("active", el.dataset.page === targetName));
        if (targetName === "message" && typeof window.showLumiMessageInbox === "function") {
          window.showLumiMessageInbox();
        }
        window.scrollTo({ top: 0, behavior: "auto" });
      }

      function setMessageView(mode) {
        const inbox = document.getElementById("messageInbox");
        const detail = document.getElementById("messageDetail");
        const showDetail = mode === "detail";
        if (inbox) inbox.classList.toggle("hidden", showDetail);
        if (detail) detail.classList.toggle("hidden", !showDetail);
      }

      window.showLumiMessageInbox = function() {
        setMessageView("inbox");
      };

      function updateMessageSaveButton(member) {
        const button = document.getElementById("messageSaveToggle");
        if (!button) return;
        const target = String(member || "coming-soon").toLowerCase();
        button.setAttribute("data-message-save", target);
        let saved = false;
        try {
          saved = window.localStorage && window.localStorage.getItem("lumiMessageSaved:" + (getCurrentLumiId() || "guest") + ":" + target) === "1";
        } catch (error) {}
        button.classList.toggle("saved", saved);
        button.textContent = saved ? "소장 해제" : "소장하기";
      }

      function renderMessageThread(member) {
        const phone = document.getElementById("messageThread") || document.querySelector("#page-message .message-phone");
        if (!phone) return;
        const target = String(member || "coming-soon").toLowerCase();
        const title = document.getElementById("messageDetailTitle");
        const sub = document.getElementById("messageDetailSub");
        if (target === "coming-soon") {
          if (title) title.textContent = "ON AIR 메시지";
          if (sub) sub.textContent = "Coming Soon";
          phone.innerHTML = [
            '<div class="bubble from">Coming Soon</div>',
            '<div class="bubble from">새로운 빛이 준비 중이에요</div>',
            '<div class="bubble to">오늘도 응원할게!</div>',
            '<div class="bubble from">자세한 내용은 추후 공개됩니다.</div>'
          ].join("");
        } else {
          if (title) title.textContent = "루루 🍼🐰";
          if (sub) sub.textContent = "예시 문자";
          phone.innerHTML = [
            '<div class="bubble from">루미나... 오늘 와주는 거야...? 🐰🩷</div>',
            '<div class="bubble from">루루가 기다리고 있을게...! 입장번호랑 작은 우산도 잊지 말기... 🐰💭</div>',
            '<div class="bubble to">응! 오늘 보러 갈게.</div>',
            '<div class="bubble from">와줘서 고마워... 오늘도 루루랑 같이 있어줄래...? 🍼🐰</div>'
          ].join("");
        }
        updateMessageSaveButton(target);
        setMessageView("detail");
      }

      window.openLumiMessage = function(member) {
        go("message");
        renderMessageThread(member || "coming-soon");
      };

      document.addEventListener("click", function(event) {
        const openButton = event.target.closest("[data-message-open]");
        if (openButton) {
          event.preventDefault();
          renderMessageThread(openButton.getAttribute("data-message-open") || "coming-soon");
          return;
        }

        const backButton = event.target.closest("[data-message-back]");
        if (backButton) {
          event.preventDefault();
          setMessageView("inbox");
          return;
        }

        const saveButton = event.target.closest("[data-message-save]");
        if (saveButton) {
          event.preventDefault();
          const target = saveButton.getAttribute("data-message-save") || "coming-soon";
          let saved = false;
          try {
            saved = window.localStorage && window.localStorage.getItem("lumiMessageSaved:" + (getCurrentLumiId() || "guest") + ":" + target) === "1";
            if (window.localStorage) window.localStorage.setItem("lumiMessageSaved:" + (getCurrentLumiId() || "guest") + ":" + target, saved ? "0" : "1");
          } catch (error) {}
          updateMessageSaveButton(target);
          return;
        }
      });

      function updateClock() {
        const now = new Date();
        const clockText = now.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false });
        const dateText = now.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", weekday: "long" }).toUpperCase().replace(",", " ·");
        statusTime.textContent = clockText;
        homeClock.textContent = clockText;
        homeDate.textContent = dateText;
      }

      function setMiniPage(targetId) {
        const target = document.getElementById(targetId);
        if (!target) return;
        const group = target.closest(".module-card");
        if (!group) return;
        group.querySelectorAll(".mini-page").forEach((page) => page.classList.toggle("active", page.id === targetId));
        group.querySelectorAll(".mini-tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.miniTarget === targetId));
        if (targetId === "mail-inbox") renderMailBox("inbox");
        if (targetId === "mail-saved") renderMailBox("saved");
        if (targetId === "lumilog-list") renderLumiLogBox("list");
        if (targetId === "lumilog-saved") renderLumiLogBox("saved");
      }

      const LUMI_MAIL_ITEMS = [
        {
          id: "welcome",
          box: "inbox",
          category: "event",
          icon: "💌",
          from: "루미벨",
          meta: "개통 안내 · 오늘 12:00",
          status: "NEW",
          title: "루미벨에서 도착한 첫 우편",
          preview: "루미폰 개통을 환영해요.",
          body: "루미폰 개통을 환영해요.\n\n이곳에는 루미벨과 함께한 기록, 공연 후 남겨지는 우편, 특별한 날의 메시지가 천천히 쌓입니다. 오래 간직하고 싶은 우편은 소장하기를 눌러 소장 우편에 보관할 수 있어요."
        },
        {
          id: "debut-guide",
          box: "pending",
          category: "live",
          type: "preLive",
          unlock: "reservationConfirmed",
          icon: "🎀",
          from: "LUMIBELLE 운영",
          meta: "라이브 안내 · 2026.07.12",
          status: "scheduled",
          title: "Debut Live 안내",
          preview: "공연 일정과 입장 안내는 티켓함과 캘린더에서 확인할 수 있어요.",
          body: "공연 일정과 입장 안내는 티켓함과 캘린더에서 확인할 수 있어요.\n\n현장에서는 루미 ID 또는 입장 확인용 번호를 먼저 보여주세요. 메아테 혜택은 입장 시 지급되는 것이 아니라, 물판/특전회에서 확인 후 처리됩니다."
        },
        {
          id: "after-live",
          box: "pending",
          category: "member",
          type: "afterLive",
          unlock: "afterLiveEnd",
          icon: "🎀",
          from: "마리링",
          meta: "공연 종료 후 도착 예정",
          status: "예약됨",
          title: "오늘 와줘서 고마워",
          preview: "공연이 끝난 뒤 조건에 맞춰 도착하는 메시지예요.",
          body: "오늘 와줘서 고마워.\n\n네가 남겨준 마음이 오늘 무대의 반짝임이 됐어. 모든 순간에 답장을 남기지는 못해도, 루미벨은 루미나가 보내준 응원과 후기를 소중히 확인하고 있어. 다음에도 무대에서 꼭 만나자."
        },
        {
          id: "birthday-ticket",
          box: "guide",
          category: "event",
          icon: "🎂",
          from: "루미폰",
          meta: "이벤트 안내 · 생일 등록 후",
          status: "읽음",
          title: "Birthday Ticket 안내",
          preview: "생일을 등록하면 생일 시즌에 안내가 도착해요.",
          body: "생일을 등록하면 생일 시즌에 Birthday Ticket 안내가 도착해요.\n\nBirthday Ticket은 팬 본인의 생일 등록값을 기준으로 표시됩니다. 본인 사용만 가능하며 양도할 수 없고, 사용 완료 후 재발급되지 않습니다."
        },
        {
          id: "lumi-log-note",
          box: "guide",
          category: "live",
          icon: "📖",
          from: "LUMI LOG",
          meta: "루미로그 안내 · 준비 중",
          status: "읽음",
          title: "루미로그 안내",
          preview: "공연이 끝난 뒤, 그날의 기억이 루미로그와 추억의 시간에 정리돼요.",
          body: "공연이 끝난 뒤, 그날의 기억이 루미로그와 추억의 시간에 정리돼요.\n\n루미벨은 루미나가 남겨준 후기와 응원을 소중히 확인하고, 지나가는 글이 아니라 오래 남는 기록으로 보관할 예정이에요."
        }
      ];

      // PATCH 51-32-fix5: 초기값은 항상 null. window.LUMI_API_ENDPOINT가 늦게 세팅되므로
      // 로드 시점 체크가 의미없음. openApp에서 []로 교체 후 loadMyMessages가 채움.
      let LUMI_RUNTIME_MAIL_ITEMS = null;
      let LUMI_RUNTIME_MESSAGE_ITEMS = null;
      let LUMI_MESSAGES_LOAD_DONE = false;

      const LUMI_SMS_MESSAGE_TYPES = new Set([
        "paymentconfirmed",
        "paymentconfirm",  // PATCH 51-45: 시트에 paymentConfirm으로 저장된 경우도 허용
        "entrycomplete",
        "reservationconfirmed",
        "birthdaynotice",
        "jointicket",
        "welcometicket",
        "livereminder",
        "systemshort"
      ]);

      const LUMI_MAIL_MESSAGE_TYPES = new Set([
        "afterliveletter",
        "memberletter",
        "lumiletter",
        "archiveletter",
        "eventstory",
        "seasonletter"
      ]);

      function normalizeMessageTypeKey(value) {
        return String(value || "").trim().toLowerCase().replace(/[\s_\-]/g, "");
      }

      function getLumiMessageChannel(item) {
        const key = normalizeMessageTypeKey(item && (item.messageType || item.type));
        if (LUMI_MAIL_MESSAGE_TYPES.has(key)) return "mail";
        if (LUMI_SMS_MESSAGE_TYPES.has(key)) return "message";
        const senderType = String(item && item.senderType || "").trim().toLowerCase();
        if (senderType === "member") return "mail";
        return "message";
      }

      function getAllMailItems() {
        // PATCH 51-33: 로드 완료 후에는 항상 runtime 배열만 사용
        if (LUMI_MESSAGES_LOAD_DONE) {
          return Array.isArray(LUMI_RUNTIME_MAIL_ITEMS) ? LUMI_RUNTIME_MAIL_ITEMS : [];
        }
        // 로드 중이지만 로그인 상태(API 모드)면 mock 억제 → 로딩 상태로 표시
        if (LUMI_API_ENDPOINT() && getCurrentLumiId()) return [];
        // 비로그인/오프라인이면 mock 표시
        return LUMI_MAIL_ITEMS;
      }

      function memberLabelFromKey(key) {
        const value = String(key || "").trim().toLowerCase();
        if (value === "mariring") return "마리링 🎀⭐";
        if (value === "lulu") return "루루 🍼🐰";
        // 공개 전 멤버는 팬 화면에서 이름/오시마크를 직접 노출하지 않는다.
        if (value === "iro" || value === "lunar" || value === "luna") return "새로운 빛";
        return "LUMIBELLE 운영";
      }

      // Patch 51-30: system/member message label and icon styling
      function messageIconFromType(item) {
        const type = normalizeMessageTypeKey(item && (item.messageType || item.type));
        const senderType = String(item && item.senderType || "").toLowerCase();
        const senderMember = String(item && item.senderMember || "").toLowerCase();

        if (senderType === "member") {
          if (senderMember === "mariring") return "🎀⭐";
          if (senderMember === "lulu") return "🍼🐰";
          // 공개 전 멤버는 직접 오시마크 노출 금지
          if (senderMember === "iro" || senderMember === "lunar" || senderMember === "luna") return "✦";
          return "💌";
        }

        if (type === "paymentconfirmed") return "🎫";
        if (type === "entrycomplete") return "🎀";
        if (type === "birthdaynotice" || type === "birthday") return "🎂";
        if (type === "welcometicket" || type === "jointicket") return "🎟️";
        if (type === "livereminder" || type === "beforelive" || type === "prelive") return "📣";

        // 운영/system 기본 아이콘: 클립/문서 느낌 대신 루미벨 운영용 티아라
        return "👑";
      }

      function normalizeLumiMessageItem(item) {
        const source = item || {};
        const senderType = String(source.senderType || "system").trim();
        const senderMember = String(source.senderMember || "system").trim();
        const from = senderType === "member" ? memberLabelFromKey(senderMember) : (source.from || "LUMIBELLE 운영");
        const createdAt = source.createdAt || source.visibleFrom || "";
        const title = source.title || "루미벨에서 도착한 메시지";
        const body = source.body || source.preview || "";
        const id = String(source.messageId || source.id || ("message_" + Date.now() + "_" + Math.random())).trim();
        const isReadValue = String(source.isRead == null ? "" : source.isRead).toLowerCase();
        const isRead = source.isRead === true || isReadValue === "true" || isReadValue === "1" || isReadValue === "읽음";
        const channel = getLumiMessageChannel(source);
        return {
          id: id,
          messageId: id,
          box: channel === "mail" ? "inbox" : "message",
          channel: channel,
          category: senderType === "member" ? "member" : (source.category || "event"),
          messageType: source.messageType || "",
          senderType: senderType,
          senderMember: senderMember,
          // PATCH 51-30-fix: source.icon(시트/API 원본값)은 무시하고
          // messageIconFromType으로 항상 강제 적용 (📎 등 구 아이콘 차단)
          icon: messageIconFromType(source),
          from: from,
          meta: source.meta || (createdAt ? String(createdAt) : "루미폰 메시지"),
          status: isRead ? "읽음" : "NEW",
          title: title,
          preview: source.preview || String(body).replace(/\s+/g, " ").slice(0, 64),
          body: body,
          createdAt: createdAt
        };
      }

      // PATCH 51-32-fix8: normalizeRuntimeChatMessage는 문자함 IIFE 전용이라
      // 로그인 IIFE(loadMyMessages)에서 호출하면 ReferenceError.
      // 동일한 출력 구조를 가진 함수를 이 스코프에 직접 선언.
      function normalizeSmsItem(source) {
        source = source || {};
        const type = normalizeMessageTypeKey(source.messageType || source.type);
        const senderType = String(source.senderType || "system").trim().toLowerCase();
        const senderMember = String(source.senderMember || "system").trim().toLowerCase();
        const from = senderType === "member" ? memberLabelFromKey(senderMember) : (source.from || "LUMIBELLE 운영");
        const body = String(source.body || source.preview || "").trim();
        const date = String(source.createdAt || source.visibleFrom || source.date || "루미폰 메시지");
        const id = String(source.messageId || source.id || ("sms_" + Date.now() + "_" + Math.random())).trim();
        const icon = messageIconFromType(source);
        let tag = source.tag || "운영";
        let filterType = "staff";
        if (type === "livereminder" || type === "entrycomplete") { tag = source.tag || "라이브"; filterType = "live"; }
        if (type === "birthdaynotice") { tag = source.tag || "생일"; filterType = "birthday"; }
        if (type === "welcometicket" || type === "jointicket") { tag = source.tag || "티켓"; filterType = "staff"; }
        if (senderType === "member") { tag = source.tag || "루미레터"; filterType = "lumiletter"; }
        const isReadValue = String(source.isRead == null ? "" : source.isRead).toLowerCase();
        const isRead = source.isRead === true || isReadValue === "true" || isReadValue === "1" || isReadValue === "읽음";
        return {
          id: id,
          messageId: id,
          box: "inbox",
          status: isRead ? "read" : "NEW",
          date: date,
          from: from,
          tag: tag,
          type: filterType,
          messageType: source.messageType || "",
          title: source.title || "루미벨에서 도착한 문자",
          preview: source.preview || body.replace(/\s+/g, " ").slice(0, 80),
          icon: icon,
          lines: body ? body.split(/\n+/).filter(Boolean) : [source.title || "루미벨에서 도착한 문자예요."],
          choices: []
        };
      }

      const mailState = {
        inbox: { page: 0, filter: "all" },
        saved: { page: 0, filter: "all" },
        currentId: null
      };
      const MAIL_PAGE_SIZE = 3;
      // Lumi Signup Patch 1-fix2A: 우편 읽음/저장 키 계정별 격리
      function mailKeyFor(base, lumiId) {
        const id = lumiId || getCurrentLumiId() || "";
        return id ? base + "." + id.toLowerCase() : base;
      }
      const MAIL_SAVE_KEY = "lumiSavedMailIds";
      const MAIL_READ_KEY = "lumiReadMailIds";

      function readMailIds(key) {
        try {
          const k = mailKeyFor(key);
          const parsed = JSON.parse(localStorage.getItem(k) || "[]");
          return Array.isArray(parsed) ? parsed.map(String) : [];
        } catch (error) {
          return [];
        }
      }

      function writeMailIds(key, ids) {
        try {
          const k = mailKeyFor(key);
          localStorage.setItem(k, JSON.stringify(Array.from(new Set(ids.map(String)))));
        } catch (error) {}
      }

      function isMailRead(id) {
        const item = getAllMailItems().find((mail) => mail.id === String(id));
        return Boolean(item && item.status !== "NEW") || readMailIds(MAIL_READ_KEY).includes(String(id));
      }

      function setMailRead(id, read) {
        const ids = readMailIds(MAIL_READ_KEY).filter((item) => item !== String(id));
        if (read) ids.push(String(id));
        writeMailIds(MAIL_READ_KEY, ids);
      }

      function markLumiMessageReadRemote(messageId) {
        const targetId = String(messageId || "").trim();
        const lumiId = getCurrentLumiId();
        if (DEBUG_MODE) console.log("[lumi] markRead request:", targetId || "(no messageId)", lumiId || "(no lumiId)");
        if (!targetId || !lumiId) {
          if (DEBUG_MODE) console.warn("[lumi] markRead skipped: missing target/lumiId", { messageId: targetId, lumiId: lumiId });
          return;
        }
        fetchLumiApi({
          action: "lumiMarkMessageRead",
          lumiId: lumiId,
          messageId: targetId
        }).then((response) => {
          if (DEBUG_MODE) console.log("[lumi] markRead ok:", targetId, "ok=" + Boolean(response && response.ok), response);
        }).catch((error) => {
          // API 실패해도 이미 열린 상세/로컬 읽음 상태는 유지한다.
          if (DEBUG_MODE) console.warn("[lumi] markRead failed:", targetId, error);
        });
      }
      window.__lumiMarkMessageReadRemote = markLumiMessageReadRemote;

      function readSavedMailIds() {
        return readMailIds(MAIL_SAVE_KEY);
      }

      function writeSavedMailIds(ids) {
        writeMailIds(MAIL_SAVE_KEY, ids);
      }

      function isMailSaved(id) {
        return readSavedMailIds().includes(String(id));
      }

      function setMailSaved(id, saved) {
        const ids = readSavedMailIds().filter((item) => item !== String(id));
        if (saved) ids.push(String(id));
        writeSavedMailIds(ids);
      }

      function getMailItems(box) {
        const state = mailState[box] || mailState.inbox;
        const savedIds = readSavedMailIds();
        const allMailItems = getAllMailItems();
        const base = box === "saved" ? allMailItems.filter((item) => item.box !== "pending" && savedIds.includes(item.id)) : allMailItems.filter((item) => item.box === "inbox");
        return base.filter((item) => {
          if (state.filter === "all") return true;
          if (state.filter === "guide") {
            const haystack = [item.title, item.from, item.meta, item.preview, item.body].join(" ");
            return item.category === "guide" || /안내|개통|기록/.test(haystack);
          }
          return item.category === state.filter;
        });
      }

      function renderMailBox(box) {
        const list = document.getElementById(box === "saved" ? "mailSavedList" : "mailInboxList");
        const pager = document.getElementById(box === "saved" ? "mailSavedPager" : "mailInboxPager");
        const text = document.getElementById(box === "saved" ? "mailSavedPageText" : "mailInboxPageText");
        const prev = document.getElementById(box === "saved" ? "mailSavedPrev" : "mailInboxPrev");
        const next = document.getElementById(box === "saved" ? "mailSavedNext" : "mailInboxNext");
        const empty = document.getElementById(box === "saved" ? "mailSavedEmpty" : "mailInboxEmpty");
        if (!list || !pager || !text || !prev || !next || !empty) return;

        // PATCH 51-33: 로그인 상태에서 API 로드 미완료면 로딩 문구 표시
        if (!LUMI_MESSAGES_LOAD_DONE && LUMI_API_ENDPOINT() && getCurrentLumiId()) {
          list.innerHTML = '<p style="text-align:center;color:var(--sub,#c9a0bc);padding:24px 0;font-size:14px;">우편을 불러오는 중…</p>';
          empty.classList.add("hidden");
          pager.classList.add("hidden");
          return;
        }

        const state = mailState[box];
        const items = getMailItems(box);
        const mailPageSize = window.matchMedia && window.matchMedia("(min-width: 760px)").matches ? 4 : MAIL_PAGE_SIZE;
        const totalPages = Math.max(1, Math.ceil(items.length / mailPageSize));
        state.page = Math.min(Math.max(0, state.page), totalPages - 1);
        const pageItems = items.slice(state.page * mailPageSize, state.page * mailPageSize + mailPageSize);

        list.innerHTML = pageItems.map((item) => {
          const saved = isMailSaved(item.id);
          const status = saved ? "소장" : (isMailRead(item.id) ? "읽음" : item.status);
          const statusClass = status === "NEW" ? " new" : (status === "소장" ? " saved" : " read");
          return '<button class="mail-item" type="button" data-mail-open="' + item.id + '">' +
            '<span class="icon">' + item.icon + '</span>' +
            '<span class="mail-item-main"><span class="mail-item-meta">From. ' + item.from + ' · ' + item.meta + '</span><b>' + item.title + '</b><span class="mail-item-preview">' + item.preview + '</span></span>' +
            '<span class="mail-status-chip' + statusClass + '">' + status + '</span>' +
          '</button>';
        }).join("");
        empty.classList.toggle("hidden", items.length > 0);
        pager.classList.toggle("hidden", items.length <= mailPageSize);
        text.textContent = (state.page + 1) + " / " + totalPages;
        prev.disabled = state.page <= 0;
        next.disabled = state.page >= totalPages - 1;
      }

      function updateMailTabBadge() {
        const badge = document.querySelector('.tab[data-page="mail"] .badge');
        if (!badge) return;
        // API 모드에서 로드 완료 전에는 배지 숨김 (유령 알림 방지)
        const apiMode = !!(LUMI_API_ENDPOINT() && getCurrentLumiId());
        if (apiMode && !LUMI_MESSAGES_LOAD_DONE) { badge.textContent = ""; badge.style.display = "none"; return; }
        const unread = getAllMailItems().filter((mail) => mail.box === "inbox" && !isMailRead(mail.id) && mail.status === "NEW").length;
        badge.textContent = unread || "";
        badge.style.display = unread ? "" : "none";
      }

      function renderMailAll() {
        renderMailBox("inbox");
        renderMailBox("saved");
        updateMailTabBadge();
      }

      function openMailModal(id) {
        const targetOpenId = String(id || "");
        const item = getAllMailItems().find((mail) => String(mail.id) === targetOpenId || String(mail.messageId) === targetOpenId);
        const modal = document.getElementById("mailModal");
        if (DEBUG_MODE) console.log("[lumi] openMailModal:", targetOpenId, item ? (item.messageId || item.id || "(no id)") : "item not found");
        if (!item || !modal) return;
        mailState.currentId = id;
        const icon = document.getElementById("mailModalIcon");
        const meta = document.getElementById("mailModalMeta");
        const title = document.getElementById("mailModalTitle");
        const body = document.getElementById("mailModalBody");
        const save = document.getElementById("mailSaveToggle");
        if (icon) icon.textContent = item.icon || "💌";
        if (meta) meta.textContent = item.from + " · " + item.meta;
        if (title) title.textContent = item.title;
        if (body) body.textContent = item.body;
        const wasUnread = !isMailRead(id);
        if (wasUnread) {
          setMailRead(id, true);
          renderMailAll();
        }
        // PATCH 51-32-fix: 로컬에서 이미 읽음이어도 DB 메시지면 서버 읽음 처리를 한 번 더 시도한다.
        // 테스트/캐시/localStorage 때문에 local=읽음, DB=false가 갈라지는 상황을 복구하기 위함.
        markLumiMessageReadRemote(item.messageId || "");
        if (save) save.textContent = isMailSaved(id) ? "소장해제" : "소장하기";
        modal.classList.remove("hidden");
        modal.setAttribute("aria-hidden", "false");
      }

      function closeMailModal() {
        const modal = document.getElementById("mailModal");
        if (!modal) return;
        modal.classList.add("hidden");
        modal.setAttribute("aria-hidden", "true");
      }

      function setMailFilter(box, value) {
        mailState[box].filter = value;
        mailState[box].page = 0;
        document.querySelectorAll('[data-mail-filter="' + box + '"]').forEach((button) => {
          button.classList.toggle("active", button.dataset.mailFilterValue === value);
        });
        renderMailBox(box);
      }

      function changeMailPage(box, delta) {
        const state = mailState[box];
        const mailPageSize = window.matchMedia && window.matchMedia("(min-width: 760px)").matches ? 4 : MAIL_PAGE_SIZE;
        const totalPages = Math.max(1, Math.ceil(getMailItems(box).length / mailPageSize));
        state.page = Math.min(Math.max(0, state.page + delta), totalPages - 1);
        renderMailBox(box);
      }

      function showMailDetail(detailId) {
        openMailModal(detailId);
      }

      const LUMI_LOG_ITEMS = [];

      const lumiLogState = {
        list: { page: 0, filter: "all" },
        saved: { page: 0, filter: "all" },
        currentId: null
      };
      const LUMILOG_PAGE_SIZE = 3;
      // Lumi Signup Patch 1-fix2A: 루미로그 읽음/저장 키 계정별 격리
      const LUMILOG_SAVE_KEY = "lumiSavedLogIds";
      const LUMILOG_READ_KEY = "lumiReadLogIds";

      function readLumiLogIds(key) {
        try {
          const k = mailKeyFor(key); // lumiId suffix 공용 유틸
          const parsed = JSON.parse(localStorage.getItem(k) || "[]");
          return Array.isArray(parsed) ? parsed.map(String) : [];
        } catch (error) {
          return [];
        }
      }

      function writeLumiLogIds(key, ids) {
        try {
          const k = mailKeyFor(key);
          localStorage.setItem(k, JSON.stringify(Array.from(new Set(ids.map(String)))));
        } catch (error) {}
      }

      function isLumiLogRead(id) {
        const item = LUMI_LOG_ITEMS.find((log) => log.id === String(id));
        return Boolean(item && item.status !== "NEW") || readLumiLogIds(LUMILOG_READ_KEY).includes(String(id));
      }

      function setLumiLogRead(id, read) {
        const ids = readLumiLogIds(LUMILOG_READ_KEY).filter((item) => item !== String(id));
        if (read) ids.push(String(id));
        writeLumiLogIds(LUMILOG_READ_KEY, ids);
      }

      function readSavedLumiLogIds() {
        return readLumiLogIds(LUMILOG_SAVE_KEY);
      }

      function writeSavedLumiLogIds(ids) {
        writeLumiLogIds(LUMILOG_SAVE_KEY, ids);
      }

      function isLumiLogSaved(id) {
        return readSavedLumiLogIds().includes(String(id));
      }

      function setLumiLogSaved(id, saved) {
        const ids = readSavedLumiLogIds().filter((item) => item !== String(id));
        if (saved) ids.push(String(id));
        writeSavedLumiLogIds(ids);
      }

      function getLumiLogItems(box) {
        const state = lumiLogState[box] || lumiLogState.list;
        const savedIds = readSavedLumiLogIds();
        const base = box === "saved" ? LUMI_LOG_ITEMS.filter((item) => savedIds.includes(item.id)) : LUMI_LOG_ITEMS;
        return base.filter((item) => state.filter === "all" || item.category === state.filter);
      }

      function renderLumiLogBox(box) {
        const list = document.getElementById(box === "saved" ? "lumiLogSavedList" : "lumiLogList");
        const pager = document.getElementById(box === "saved" ? "lumiLogSavedPager" : "lumiLogListPager");
        const text = document.getElementById(box === "saved" ? "lumiLogSavedPageText" : "lumiLogListPageText");
        const prev = document.getElementById(box === "saved" ? "lumiLogSavedPrev" : "lumiLogListPrev");
        const next = document.getElementById(box === "saved" ? "lumiLogSavedNext" : "lumiLogListNext");
        const empty = document.getElementById(box === "saved" ? "lumiLogSavedEmpty" : "lumiLogListEmpty");
        if (!list || !pager || !text || !prev || !next || !empty) return;

        const state = lumiLogState[box] || lumiLogState.list;
        const items = getLumiLogItems(box);
        const totalPages = Math.max(1, Math.ceil(items.length / LUMILOG_PAGE_SIZE));
        state.page = Math.min(Math.max(0, state.page), totalPages - 1);
        const pageItems = items.slice(state.page * LUMILOG_PAGE_SIZE, state.page * LUMILOG_PAGE_SIZE + LUMILOG_PAGE_SIZE);

        list.innerHTML = pageItems.map((item) => {
          const labelType = item.labelType || (item.category === "letter" ? "letter" : (item.category === "upcoming" ? "upcoming" : "live"));
          const lockedClass = labelType === "upcoming" ? " locked" : "";
          return '<button class="lumiLog-item' + lockedClass + '" type="button" data-lumilog-open="' + item.id + '">' +
            '<span class="lumiLog-label-pill ' + labelType + '">' + item.label + '</span>' +
            '<b>' + item.title + '</b>' +
            '<span class="lumiLog-item-preview">' + item.preview + '</span>' +
          '</button>';
        }).join("");
        empty.classList.toggle("hidden", items.length > 0);
        pager.classList.toggle("hidden", items.length <= LUMILOG_PAGE_SIZE);
        text.textContent = (state.page + 1) + " / " + totalPages;
        prev.disabled = state.page <= 0;
        next.disabled = state.page >= totalPages - 1;
      }

      function renderLumiLogAll() {
        renderLumiLogBox("list");
        renderLumiLogBox("saved");
      }

      function openLumiLogModal(id) {
        const item = LUMI_LOG_ITEMS.find((log) => log.id === id);
        const modal = document.getElementById("lumiLogModal");
        if (!item || !modal) return;
        lumiLogState.currentId = id;
        const icon = document.getElementById("lumiLogModalIcon");
        const meta = document.getElementById("lumiLogModalMeta");
        const title = document.getElementById("lumiLogModalTitle");
        const body = document.getElementById("lumiLogModalBody");
        const save = document.getElementById("lumiLogSaveToggle");
        if (icon) icon.textContent = item.label || "LIVE LOG";
        if (meta) meta.textContent = item.from + " · " + item.meta;
        if (title) title.textContent = item.title;
        if (body) body.textContent = item.body;
        if (!isLumiLogRead(id)) {
          setLumiLogRead(id, true);
          renderLumiLogAll();
        }
        if (save) save.textContent = isLumiLogSaved(id) ? "보관 해제" : "기록 보관하기";
        modal.classList.remove("hidden");
        modal.setAttribute("aria-hidden", "false");
      }

      function closeLumiLogModal() {
        const modal = document.getElementById("lumiLogModal");
        if (!modal) return;
        modal.classList.add("hidden");
        modal.setAttribute("aria-hidden", "true");
      }

      function setLumiLogFilter(box, value) {
        lumiLogState[box].filter = value;
        lumiLogState[box].page = 0;
        document.querySelectorAll('[data-lumilog-filter="' + box + '"]').forEach((button) => {
          button.classList.toggle("active", button.dataset.lumilogFilterValue === value);
        });
        renderLumiLogBox(box);
      }

      function changeLumiLogPage(box, delta) {
        const state = lumiLogState[box];
        const totalPages = Math.max(1, Math.ceil(getLumiLogItems(box).length / LUMILOG_PAGE_SIZE));
        state.page = Math.min(Math.max(0, state.page + delta), totalPages - 1);
        renderLumiLogBox(box);
      }



      const ticketPagerState = {};

      function getTicketPagerItems(scope) {
        const activeFilter = scope.dataset.ticketActiveFilter || "전체";
        return Array.from(scope.querySelectorAll(".ticket-page-item")).filter((item) => {
          const category = item.dataset.ticketCategory || "전체";
          return activeFilter === "전체" || category === activeFilter;
        });
      }

      function renderTicketPager(scope) {
        if (!scope) return;
        const key = scope.dataset.ticketPager || scope.id;
        const pageSize = Math.max(1, parseInt(scope.dataset.ticketPageSize || "1", 10));
        const allItems = Array.from(scope.querySelectorAll(".ticket-page-item"));
        const items = getTicketPagerItems(scope);
        const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
        const current = Math.min(Math.max(0, ticketPagerState[key] || 0), totalPages - 1);
        ticketPagerState[key] = current;

        allItems.forEach((item) => item.classList.remove("active"));
        items.forEach((item, index) => {
          const active = index >= current * pageSize && index < (current + 1) * pageSize;
          item.classList.toggle("active", active);
        });

        const textEl = scope.querySelector("[data-ticket-page-text]");
        const prevBtn = scope.querySelector("[data-ticket-prev]");
        const nextBtn = scope.querySelector("[data-ticket-next]");
        if (textEl) textEl.textContent = (current + 1) + " / " + totalPages;
        if (prevBtn) prevBtn.disabled = current <= 0;
        if (nextBtn) nextBtn.disabled = current >= totalPages - 1;
      }

      function updateTicketPager(key, delta) {
        const scope = document.querySelector('[data-ticket-pager="' + key + '"]');
        if (!scope) return;
        ticketPagerState[key] = (ticketPagerState[key] || 0) + delta;
        renderTicketPager(scope);
      }

      function setTicketFilter(button) {
        const scope = button.closest(".ticket-pager-scope");
        if (!scope) return;
        const key = scope.dataset.ticketPager || scope.id;
        scope.dataset.ticketActiveFilter = button.dataset.ticketFilter || "전체";
        ticketPagerState[key] = 0;
        scope.querySelectorAll(".ticket-filter-pill").forEach((pill) => {
          pill.classList.toggle("active", pill === button);
        });
        renderTicketPager(scope);
      }

      function initTicketPagers() {
        document.querySelectorAll(".ticket-pager-scope").forEach((scope) => renderTicketPager(scope));
      }

      // Lumi Signup Patch 1-fix2A: 계정별 격리 - profileStorageKey/profileOshiChangedKey를 함수로
      function profileStorageKeyFor(lumiId) {
        const id = lumiId || getCurrentLumiId() || "";
        return id ? "lumiphone.profile.v2." + id.toLowerCase() : "lumiphone.profile.v1";
      }
      // boot 시점 key는 직후 loadProfileState(lid) 호출 시 override됨
      const profileStorageKey = "lumiphone.profile.v1"; // fallback (boot 전용, openApp에서 재로딩)
      function profileOshiChangedKeyFor(lumiId) {
        const id = lumiId || getCurrentLumiId() || "";
        return id ? "lumiphone.profile.oshiChangedAt.v2." + id.toLowerCase() : "lumiphone.profile.oshiChangedAt.v1";
      }
      const profileOshiChangedKey = "lumiphone.profile.oshiChangedAt.v1"; // fallback
      const profileDefaultPart = () => ({ src: "", x: 50, y: 50, scale: 1 });
      const profileDefaultInfo = () => ({
        displayName: "루미나",
        oshi: "루루 🍼🐰",
        letterName: "",
        broadcastName: "",
        title: "나만의 루미나",
        space: "",
        birthdayMonth: "",
        birthdayDay: "",
        birthdayRegistered: false,
        joinedAt: ""
      });
      const profileDefaultState = () => ({ cover: profileDefaultPart(), avatar: profileDefaultPart(), info: profileDefaultInfo() });
      let profileState = profileDefaultState();
      let profileDraft = profileDefaultState();
      let profileEditTarget = "cover";
      let profileCropPart = profileDefaultPart();
      let profileCropTarget = "cover";
      let profileDragState = null;
      let profileShareCache = null;

      const profileMediaModal = $("#profileMediaModal");
      const profileMediaTitle = $("#profileMediaTitle");
      const profileMediaClose = $("#profileMediaClose");
      const profileMediaApply = $("#profileMediaApply");
      const profileMediaStage = $("#profileMediaStage");
      const profileMediaImg = $("#profileMediaImg");
      const profileMediaZoom = $("#profileMediaZoom");
      const profileMediaReset = $("#profileMediaReset");

      function cloneProfileState(state) {
        return JSON.parse(JSON.stringify(state || profileDefaultState()));
      }

      function normalizeProfilePart(part) {
        const base = profileDefaultPart();
        const next = Object.assign(base, part || {});
        next.x = Math.min(100, Math.max(0, Number(next.x) || 50));
        next.y = Math.min(100, Math.max(0, Number(next.y) || 50));
        next.scale = Math.min(2.5, Math.max(1, Number(next.scale) || 1));
        next.src = typeof next.src === "string" ? next.src : "";
        return next;
      }

      function clampText(value, max) {
        return String(value || "").trim().slice(0, max);
      }

      function normalizeBirthdayMonth(value) {
        const raw = String(value || "").trim();
        if (!raw) return "";
        const n = parseInt(raw, 10);
        if (!Number.isFinite(n) || n < 1 || n > 12) return "";
        return String(n).padStart(2, "0");
      }

      function normalizeBirthdayDay(value) {
        const raw = String(value || "").trim();
        if (!raw) return "";
        const n = parseInt(raw, 10);
        if (!Number.isFinite(n) || n < 1 || n > 31) return "";
        return String(n).padStart(2, "0");
      }

      function normalizeProfileInfo(info) {
        const base = profileDefaultInfo();
        const next = Object.assign(base, info || {});
        let birthdayMonth = normalizeBirthdayMonth(next.birthdayMonth);
        let birthdayDay = normalizeBirthdayDay(next.birthdayDay);
        let birthdayRegistered = next.birthdayRegistered === true || next.birthdayRegistered === "true";
        if (!birthdayRegistered && birthdayMonth === "07" && birthdayDay === "19") {
          birthdayMonth = "";
          birthdayDay = "";
        }
        birthdayRegistered = Boolean(birthdayMonth && birthdayDay && (birthdayRegistered || next.birthdayMonth || next.birthdayDay));
        return {
          displayName: clampText(next.displayName || "루미나", 12) || "루미나",
          oshi: clampText(next.oshi || "루루 🍼🐰", 24) || "루루 🍼🐰",
          letterName: clampText(next.letterName || "", 10),
          broadcastName: clampText(next.broadcastName || "", 12),
          title: clampText(String(next.title || "나만의 루미나").replace(/^대표 칭호\s*·\s*/, "").replace("첫 번째 점을 따라온 루미나", "첫 번째 점"), 18),
          space: clampText(next.space || "", 12),
          birthdayMonth,
          birthdayDay,
          birthdayRegistered,
          profileMessage: clampText(next.profileMessage || "", 60),
          joinedAt: next.joinedAt || ""
        };
      }

      function formatProfileJoinDate(value) {
        const raw = String(value || "").trim();
        if (!raw) return "";
        const m = raw.match(/^(\d{4})[-.](\d{1,2})[-.](\d{1,2})/);
        if (m) return m[1] + "." + String(m[2]).padStart(2, "0") + "." + String(m[3]).padStart(2, "0");
        return raw.slice(0, 10).replace(/-/g, ".");
      }


      // PATCH 51-57-fix3: 기록 탭 상단 의미 복구 + createdAt 우선순위 고정
      // 왼쪽: 루미 ID 생성일(createdAt) 기준 DAY / 오른쪽: 첫 루미 방문일 영역 보존
      function getExplicitProfileJoinRaw(user) {
        const candidates = [];
        if (user && typeof user === "object") {
          candidates.push(user.createdAt, user.joinedAt);
        }
        if (currentUser && typeof currentUser === "object") {
          candidates.push(currentUser.createdAt, currentUser.joinedAt);
        }
        // profileState.info.joinedAt은 예전 기본값(2026.05.06)이 남아 있을 수 있으므로
        // 명시적인 사용자/캐시 값이 없을 때만 마지막 후보로 본다.
        if (profileState && profileState.info) {
          candidates.push(profileState.info.joinedAt);
        }
        for (let i = 0; i < candidates.length; i++) {
          const raw = String(candidates[i] || "").trim();
          if (!raw) continue;
          // 51-57 이전 기본 하드코딩값은 실제 createdAt으로 보지 않는다.
          if (raw === "2026.05.06" || raw === "2026-05-06") continue;
          return raw;
        }
        return "";
      }

      function calculateInclusiveDayFromJoin(joined) {
        const m = String(joined || "").match(/^(\d{4})\.(\d{2})\.(\d{2})/);
        if (!m) return "DAY 1";
        const start = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (isNaN(start.getTime())) return "DAY 1";
        const diff = Math.floor((today.getTime() - start.getTime()) / 86400000) + 1;
        return "DAY " + Math.max(1, diff);
      }

      function syncRecordJoinDateFromUser(user) {
        const rawJoin = getExplicitProfileJoinRaw(user);
        const joined = formatProfileJoinDate(rawJoin);
        if (!joined) return;
        const dayLabel = calculateInclusiveDayFromJoin(joined);

        Array.from(document.querySelectorAll(".record-hero-card")).forEach(function(card) {
          const label = card.querySelector("small");
          const value = card.querySelector("b");
          const desc = card.querySelector("span");
          const labelText = label ? String(label.textContent || "").trim() : "";
          if (!label || !value) return;

          // 첫 번째 카드: 루미 ID 개통일 기준 DAY. 라벨/문구는 최종 안정본 형태 유지.
          if (labelText.indexOf("이어진 지") !== -1 || labelText.indexOf("만난 지") !== -1) {
            label.textContent = "루미벨과 만난 지";
            value.textContent = dayLabel;
            if (desc) desc.textContent = joined + "부터 루미벨과 이어진 시간";
            return;
          }

          // 두 번째 카드: 첫 루미 방문일 영역. 값은 visits/첫 방문 기록 렌더러가 관리한다.
          if (labelText.indexOf("루미 ID 생성일") !== -1 || labelText.indexOf("첫 루미 방문일") !== -1) {
            label.textContent = "첫 루미 방문일";
            if (desc) desc.textContent = "오프라인 기록과 온라인 연결감을 함께 저장해요";
          }
        });
      }

      function normalizeOshiForProfile(value) {
        const raw = String(value || "").trim();
        if (!raw) return "";
        const lower = raw.toLowerCase();
        if (lower === "lumibelle" || raw === "루미벨") return "Lumibelle";
        if (lower === "mariring" || raw === "마리링") return "마리링 🎀⭐";
        if (lower === "lulu" || raw === "루루") return "루루 🍼🐰";
        if (lower === "team" || raw === "팀") return "Lumibelle";
        return raw;
      }

      function syncProfileInfoFromUser(user) {
        if (!user || typeof user !== "object") return;
        const current = normalizeProfileInfo(profileState && profileState.info);
        const nextInfo = Object.assign({}, current);
        if (user.nickname) nextInfo.displayName = user.nickname;
        const normalizedOshi = normalizeOshiForProfile(user.oshi);
        if (normalizedOshi) nextInfo.oshi = normalizedOshi;
        const title = user.equippedTitle || runtimeEquippedTitleFromApi;
        if (title) nextInfo.title = title;
        const joined = formatProfileJoinDate(user.joinedAt || user.createdAt);
        if (joined) nextInfo.joinedAt = joined;
        if (user.birthMonth || user.birthdayMonth) nextInfo.birthdayMonth = user.birthMonth || user.birthdayMonth;
        if (user.birthDay || user.birthdayDay) nextInfo.birthdayDay = user.birthDay || user.birthdayDay;
        if (user.profileMessage) nextInfo.profileMessage = user.profileMessage;
        nextInfo.birthdayRegistered = Boolean(nextInfo.birthdayMonth && nextInfo.birthdayDay);
        profileState = normalizeProfileState(Object.assign({}, profileState, { info: nextInfo }));
        profileDraft = cloneProfileState(profileState);
        saveProfileState();
        if (typeof renderProfileView === "function") renderProfileView();
        if (typeof renderProfileEditor === "function") renderProfileEditor();
        syncRecordJoinDateFromUser(currentUser || user);
      }

      function normalizeProfileState(state) {
        return {
          cover: normalizeProfilePart(state && state.cover),
          avatar: normalizeProfilePart(state && state.avatar),
          info: normalizeProfileInfo(state && state.info)
        };
      }

      function isDesktopProfileEditor() {
        return window.matchMedia && window.matchMedia("(min-width: 760px)").matches;
      }

      function loadProfileState(lumiId) {
        // Lumi Signup Patch 1-fix2A: 계정별 격리 - lumiId가 있으면 계정별 키 사용
        const key = lumiId ? profileStorageKeyFor(lumiId) : profileStorageKey;
        try {
          const raw = localStorage.getItem(key);
          profileState = normalizeProfileState(raw ? JSON.parse(raw) : profileDefaultState());
        } catch (error) {
          profileState = profileDefaultState();
        }
        profileDraft = cloneProfileState(profileState);
      }


      function getLastOshiChangedAt() {
        const key = profileOshiChangedKeyFor(getCurrentLumiId());
        const raw = localStorage.getItem(key);
        const time = raw ? Number(raw) : 0;
        return Number.isFinite(time) ? time : 0;
      }

      function setLastOshiChangedAt(time) {
        const key = profileOshiChangedKeyFor(getCurrentLumiId());
        localStorage.setItem(key, String(time || Date.now()));
      }

      function getNextOshiChangeDateText(lastChangedAt) {
        const next = new Date(Number(lastChangedAt) + 14 * 24 * 60 * 60 * 1000);
        return next.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
      }

      function canChangeOshiNow(lastChangedAt) {
        if (!lastChangedAt) return true;
        return Date.now() - Number(lastChangedAt) >= 14 * 24 * 60 * 60 * 1000;
      }

      function setProfileOshiConfirmContent(mode, data) {
        const payload = data || {};
        if (!profileOshiConfirmTitle || !profileOshiConfirmBody || !profileOshiConfirmApply || !profileOshiConfirmCancel) return;

        profileOshiConfirmBody.innerHTML = "";

        if (mode === "limit") {
          const dateText = getNextOshiChangeDateText(payload.lastChangedAt);
          profileOshiConfirmTitle.textContent = "아직 오시를 변경할 수 없어요";
          profileOshiConfirmApply.classList.add("hidden");
          profileOshiConfirmCancel.textContent = "확인";

          ["오시는 14일에 한 번 변경할 수 있어요.", "다음 변경 가능일 이후 다시 변경해 주세요."].forEach((text) => {
            const p = document.createElement("p");
            p.textContent = text;
            profileOshiConfirmBody.appendChild(p);
          });

          const date = document.createElement("span");
          date.className = "profile-confirm-date";
          date.textContent = "다음 변경 가능일: " + dateText;
          profileOshiConfirmBody.appendChild(date);
          return;
        }

        profileOshiConfirmTitle.textContent = "오시를 변경할까요?";
        profileOshiConfirmApply.classList.remove("hidden");
        profileOshiConfirmApply.textContent = "변경하기";
        profileOshiConfirmCancel.textContent = "취소";

        const guide1 = document.createElement("p");
        guide1.textContent = "오시는 14일에 한 번 변경할 수 있어요.";
        profileOshiConfirmBody.appendChild(guide1);

        const guide2 = document.createElement("p");
        guide2.textContent = "변경 후에는 다음 변경 가능일까지 다시 바꿀 수 없어요.";
        profileOshiConfirmBody.appendChild(guide2);

        const before = document.createElement("span");
        before.className = "profile-confirm-line";
        before.textContent = "현재 오시: " + (payload.beforeOshi || "루루 🍼🐰");
        profileOshiConfirmBody.appendChild(before);

        const after = document.createElement("span");
        after.className = "profile-confirm-line";
        after.textContent = "변경할 오시: " + (payload.afterOshi || "루루 🍼🐰");
        profileOshiConfirmBody.appendChild(after);
      }

      function showOshiLimitMessage(lastChangedAt) {
        setProfileOshiConfirmContent("limit", { lastChangedAt });
        openProfileOshiConfirmModal();
      }

      function showOshiChangeConfirm(beforeOshi, afterOshi) {
        setProfileOshiConfirmContent("confirm", { beforeOshi, afterOshi });
        openProfileOshiConfirmModal();
      }

      function saveProfileState() {
        try {
          // Lumi Signup Patch 1-fix2A: 계정별 키로 저장
          const key = profileStorageKeyFor(getCurrentLumiId());
          localStorage.setItem(key, JSON.stringify(profileState));
          return true;
        } catch (error) {
          /* localStorage quota can fail with large images. Keep the current screen stable and report the failure. */
          return false;
        }
      }

      function applyImagePart(img, part) {
        if (!img) return;
        if (part.src) {
          img.src = part.src;
          img.classList.remove("hidden");
          img.style.setProperty("--pos-x", part.x + "%");
          img.style.setProperty("--pos-y", part.y + "%");
          img.style.setProperty("--scale", String(part.scale));
        } else {
          img.removeAttribute("src");
          img.classList.add("hidden");
          img.style.removeProperty("--pos-x");
          img.style.removeProperty("--pos-y");
          img.style.removeProperty("--scale");
        }
      }

      function profileBirthdayText(info) {
        const data = normalizeProfileInfo(info);
        return data.birthdayRegistered && data.birthdayMonth && data.birthdayDay ? data.birthdayMonth + "." + data.birthdayDay : "생일 미등록";
      }

      function setCounter(name, value, max) {
        const el = document.querySelector('[data-count-for="' + name + '"]');
        if (el) el.textContent = String(value || "").length + "/" + max;
      }

      function profileInputMax(input) {
        return Number(input && input.dataset && input.dataset.max) || Number(input && input.getAttribute("maxlength")) || 0;
      }

      function trimProfileInputToMax(input) {
        const max = profileInputMax(input);
        if (!input || !max) return;
        const value = String(input.value || "");
        if (value.length > max) input.value = value.slice(0, max);
      }

      function trimAllProfileInputs() {
        [profileInputDisplayName, profileInputLetterName, profileInputBroadcastName, profileInputSpace].forEach(trimProfileInputToMax);
      }

      function updateProfileCounters() {
        setCounter("displayName", profileInputDisplayName ? profileInputDisplayName.value : "", 12);
        setCounter("letterName", profileInputLetterName ? profileInputLetterName.value : "", 10);
        setCounter("broadcastName", profileInputBroadcastName ? profileInputBroadcastName.value : "", 12);
        setCounter("space", profileInputSpace ? profileInputSpace.value : "", 12);
      }

      function populateBirthdaySelects() {
        if (!profileBirthdayMonth || !profileBirthdayDay || profileBirthdayMonth.options.length) return;
        profileBirthdayMonth.add(new Option("월 선택", ""));
        profileBirthdayDay.add(new Option("일 선택", ""));
        for (let i = 1; i <= 12; i += 1) {
          const value = String(i).padStart(2, "0");
          profileBirthdayMonth.add(new Option(value + "월", value));
        }
        for (let i = 1; i <= 31; i += 1) {
          const value = String(i).padStart(2, "0");
          profileBirthdayDay.add(new Option(value + "일", value));
        }
      }

      function renderProfileForm() {
        const info = normalizeProfileInfo(profileDraft.info);
        if (profileInputDisplayName) profileInputDisplayName.value = info.displayName;
        if (profileInputOshi) profileInputOshi.value = info.oshi;
        updateProfileOshiOptions(info.oshi);
        if (profileInputLetterName) profileInputLetterName.value = info.letterName;
        if (profileInputBroadcastName) profileInputBroadcastName.value = info.broadcastName;
        if (profileInputTitle) profileInputTitle.value = info.title;
        if (profileSelectedTitle) profileSelectedTitle.textContent = info.title;
        updateProfileTitleOptions(info.title);
        if (profileInputSpace) profileInputSpace.value = info.space;
        populateBirthdaySelects();
        if (profileBirthdayMonth) profileBirthdayMonth.value = info.birthdayMonth;
        if (profileBirthdayDay) profileBirthdayDay.value = info.birthdayDay;
        updateProfileCounters();
      }

      function collectProfileForm() {
        trimAllProfileInputs();
        const current = normalizeProfileInfo(profileDraft.info);
        return normalizeProfileInfo(Object.assign({}, current, {
          displayName: profileInputDisplayName ? profileInputDisplayName.value : current.displayName,
          oshi: profileInputOshi ? profileInputOshi.value : current.oshi,
          letterName: profileInputLetterName ? profileInputLetterName.value : current.letterName,
          broadcastName: profileInputBroadcastName ? profileInputBroadcastName.value : current.broadcastName,
          title: current.title,
          space: profileInputSpace ? profileInputSpace.value : current.space,
          birthdayMonth: profileBirthdayMonth ? profileBirthdayMonth.value : current.birthdayMonth,
          birthdayDay: profileBirthdayDay ? profileBirthdayDay.value : current.birthdayDay,
          birthdayRegistered: Boolean((profileBirthdayMonth ? profileBirthdayMonth.value : current.birthdayMonth) && (profileBirthdayDay ? profileBirthdayDay.value : current.birthdayDay))
        }));
      }

      function showProfileError(text) {
        if (!profileError) return;
        profileError.textContent = text || "";
        profileError.classList.toggle("show", Boolean(text));
      }

      function updateProfileOshiOptions(currentOshi) {
        const nextOshi = normalizeProfileInfo({ oshi: currentOshi }).oshi;
        if (profileInputOshi) profileInputOshi.value = nextOshi;
        if (profileOshiCurrent) profileOshiCurrent.textContent = nextOshi;
        $$(".profile-oshi-option[data-oshi-value]").forEach((button) => {
          button.classList.toggle("active", button.dataset.oshiValue === nextOshi);
        });
      }

      function openProfileOshiModal() {
        if (!profileOshiModal) return;
        updateProfileOshiOptions(normalizeProfileInfo(profileDraft.info).oshi);
        profileOshiModal.classList.remove("hidden");
        profileOshiModal.setAttribute("aria-hidden", "false");
      }

      function closeProfileOshiModal() {
        if (!profileOshiModal) return;
        profileOshiModal.classList.add("hidden");
        profileOshiModal.setAttribute("aria-hidden", "true");
      }

      function selectProfileOshi(oshiName) {
        const nextOshi = normalizeProfileInfo({ oshi: oshiName || "루루 🍼🐰" }).oshi;
        profileDraft.info = normalizeProfileInfo(Object.assign({}, profileDraft.info, { oshi: nextOshi }));
        updateProfileOshiOptions(nextOshi);
        closeProfileOshiModal();
      }

      function openProfileOshiConfirmModal() {
        if (!profileOshiConfirmModal) return;
        profileOshiConfirmModal.classList.remove("hidden");
        profileOshiConfirmModal.setAttribute("aria-hidden", "false");
      }

      function closeProfileOshiConfirmModal() {
        if (!profileOshiConfirmModal) return;
        profileOshiConfirmModal.classList.add("hidden");
        profileOshiConfirmModal.setAttribute("aria-hidden", "true");
      }

      function openProfileTitleModal() {
        if (!profileTitleModal) return;
        profileDraft = cloneProfileState(profileState);
        updateProfileTitleOptions(normalizeProfileInfo(profileDraft.info).title);
        document.documentElement.classList.add("profile-title-modal-open");
        document.body.classList.add("profile-title-modal-open");
        profileTitleModal.classList.remove("hidden");
        profileTitleModal.setAttribute("aria-hidden", "false");
      }

      function closeProfileTitleModal() {
        if (!profileTitleModal) return;
        profileTitleModal.classList.add("hidden");
        profileTitleModal.setAttribute("aria-hidden", "true");
        document.documentElement.classList.remove("profile-title-modal-open");
        document.body.classList.remove("profile-title-modal-open");
      }

      function updateProfileTitleOptions(currentTitle) {
        $$(".profile-title-option[data-title-value]").forEach((button) => {
          button.classList.toggle("active", button.dataset.titleValue === currentTitle);
        });
        if (profileSelectedTitle) profileSelectedTitle.textContent = currentTitle || "아직 칭호가 없어요";
      }

      function selectProfileTitle(titleName) {
        const nextTitle = clampText(titleName || "아직 칭호가 없어요", 18) || "아직 칭호가 없어요";
        profileDraft.info = normalizeProfileInfo(Object.assign({}, profileDraft.info, { title: nextTitle }));
        profileState = normalizeProfileState(Object.assign({}, profileState, { info: profileDraft.info }));
        saveProfileState();
        updateProfileTitleOptions(nextTitle);
        renderProfileView();
        closeProfileTitleModal();
      }

      function getAchievementCards() {
        return $$('.achievement-card[data-achievement-title]');
      }

      function findAchievementCardByTitle(title) {
        return getAchievementCards().find((card) => card.dataset.achievementTitle === title) || getAchievementCards()[0] || null;
      }

      function achievementIsOwned(card) {
        return Boolean(card && card.dataset.achievementOwned === "true");
      }

      function achievementCanShare(card) {
        if (!card) return false;
        const status = card.dataset.achievementStatus || "잠김";
        return achievementIsOwned(card) && status !== "숨김";
      }

      function achievementShareText(card) {
        if (!card) return "";
        return "루미폰에서 업적을 달성했어요!\n\n" +
          (card.dataset.achievementIcon || "🏅") + " " + (card.dataset.achievementTitle || "업적") + "\n" +
          "칭호 「" + (card.dataset.achievementReward || "-") + "」 획득\n\n" +
          (card.dataset.achievementDesc || "루미벨과 함께한 기록") + "\n\n" +
          "https://lumibellelove.com/\n\n" +
          "#루미벨 #LUMIBELLE #루미폰 #왕도아이돌 #라이브아이돌";
      }

      function achievementSummaryShareText() {
        const cards = getAchievementCards();
        const ownedCards = cards.filter(achievementIsOwned);
        const progressCards = cards.filter((card) => (card.dataset.achievementStatus || "") === "대기 중");
        const ownedTitles = Array.from(new Set(ownedCards.map((card) => card.dataset.achievementReward).filter(Boolean)));
        const representativeTitle = localStorage.getItem(representativeAchievementKeyFor(getCurrentLumiId())) || (ownedCards[0] && ownedCards[0].dataset.achievementTitle) || "-";
        const sampleCards = ownedCards.slice(0, 4).map((card) => (card.dataset.achievementIcon || "🏅") + " " + (card.dataset.achievementTitle || "업적")).join("\n");
        return "루미폰 업적 현황\n\n" +
          "달성 업적 " + ownedCards.length + " / " + cards.length + "\n" +
          "보유 칭호 " + ownedTitles.length + "개\n" +
          "대기 중 " + progressCards.length + "개\n" +
          "대표 업적 " + representativeTitle + "\n\n" +
          "업적 도감\n" + (sampleCards || "아직 공개된 업적이 없어요") + "\n\n" +
          "https://lumibellelove.com/\n\n" +
          "#루미벨 #LUMIBELLE #루미폰 #왕도아이돌 #라이브아이돌";
      }

      function getAchievementSharePayload(scope) {
        if (scope === "single") {
          const card = currentAchievementCard;
          if (!achievementCanShare(card)) return null;
          return {
            mode: "single",
            kicker: (card.dataset.achievementShareType || "") === "limited" ? "LIMITED ACHIEVEMENT" : "ACHIEVEMENT UNLOCKED",
            icon: card.dataset.achievementIcon || "🏅",
            title: card.dataset.achievementTitle || "업적",
            reward: "칭호 「" + (card.dataset.achievementReward || "-") + "」 획득",
            desc: card.dataset.achievementDesc || "루미벨과 함께한 기록",
            date: card.dataset.achievementDate || "",
            text: achievementShareText(card)
          };
        }
        const cards = getAchievementCards();
        const ownedCards = cards.filter(achievementIsOwned);
        const progressCards = cards.filter((card) => (card.dataset.achievementStatus || "") === "대기 중");
        const ownedTitles = Array.from(new Set(ownedCards.map((card) => card.dataset.achievementReward).filter(Boolean)));
        const representativeTitle = localStorage.getItem(representativeAchievementKeyFor(getCurrentLumiId())) || (ownedCards[0] && ownedCards[0].dataset.achievementTitle) || "-";
        return {
          mode: "summary",
          kicker: "ACHIEVEMENT",
          icon: "✦",
          title: "나의 루미폰 업적",
          reward: "달성 " + ownedCards.length + " / " + cards.length + " · 칭호 " + ownedTitles.length + "개",
          desc: "대기 중 " + progressCards.length + "개 · 대표 업적 " + representativeTitle,
          date: new Date().toLocaleDateString("ko-KR").replace(/\. /g, ".").replace(/\.$/, ""),
          text: achievementSummaryShareText(),
          cards: ownedCards.slice(0, 4).map((card) => ({ icon: card.dataset.achievementIcon || "🏅", title: card.dataset.achievementTitle || "업적" }))
        };
      }

      function drawAchievementShareImage(payload) {
        const canvas = document.createElement("canvas");
        canvas.width = 1080;
        canvas.height = 1350;
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;

        const pink = "#ff5fa8";
        const pink2 = "#ff82ba";
        const pinkSoft = "#fff0f7";
        const deep = "#624459";
        const muted = "#9a7187";
        const line = "#f2d8e7";
        const white = "#ffffff";

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const outer = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        outer.addColorStop(0, "#fffafd");
        outer.addColorStop(.48, "#fff0f7");
        outer.addColorStop(1, "#f8f0ff");
        ctx.fillStyle = outer;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "rgba(255, 95, 168, .11)";
        ctx.beginPath();
        ctx.arc(168, 190, 158, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(202, 167, 255, .16)";
        ctx.beginPath();
        ctx.arc(916, 238, 174, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255, 205, 226, .28)";
        ctx.beginPath();
        ctx.arc(884, 1120, 210, 0, Math.PI * 2);
        ctx.fill();

        const cardBg = ctx.createLinearGradient(100, 76, 980, 1280);
        cardBg.addColorStop(0, "#ffffff");
        cardBg.addColorStop(.68, "#fff7fb");
        cardBg.addColorStop(1, "#f8f0ff");
        roundRect(ctx, 90, 72, 900, 1206, 72, cardBg, "#f7d9e8");
        roundRect(ctx, 134, 122, 812, 1108, 52, "rgba(255,255,255,.76)", "#f8dce9");

        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(255,95,168,.22)";
        ctx.font = "900 48px sans-serif";
        ctx.fillText("✦", 185, 190);

        ctx.fillStyle = pink;
        ctx.font = "900 30px sans-serif";
        ctx.fillText("LUMI PHONE", 540, 190);
        ctx.fillStyle = muted;
        ctx.font = "900 24px sans-serif";
        ctx.fillText(payload.mode === "summary" ? "ACHIEVEMENT LOG" : (payload.kicker || "ACHIEVEMENT UNLOCKED"), 540, 228);

        const icon = payload.mode === "summary" ? "✦" : (payload.icon || "🏅");
        roundRect(ctx, 420, 285, 240, 240, 66, pinkSoft, line);
        const iconGrad = ctx.createLinearGradient(420, 285, 660, 525);
        iconGrad.addColorStop(0, "#fff");
        iconGrad.addColorStop(1, "#ffe4f0");
        roundRect(ctx, 440, 305, 200, 200, 56, iconGrad, "#f4c8dc");
        ctx.fillStyle = pink;
        ctx.font = "900 94px sans-serif";
        ctx.fillText(icon, 540, 435);

        ctx.fillStyle = deep;
        ctx.font = "900 58px sans-serif";
        wrapText(ctx, payload.title || (payload.mode === "summary" ? "나의 루미폰 업적" : "업적"), 540, 600, 760, 66, "center");

        ctx.fillStyle = pink;
        ctx.font = "900 34px sans-serif";
        wrapText(ctx, payload.reward || "", 540, 724, 760, 44, "center");

        ctx.fillStyle = muted;
        ctx.font = "800 30px sans-serif";
        wrapText(ctx, payload.desc || "루미벨과 함께 쌓아가는 나만의 기록이에요.", 540, 838, 760, 42, "center");

        const small = payload.mode === "summary" ? "루미벨과 함께 쌓아가는 나만의 기록이에요." : (payload.small || "루미벨과 함께한 기록이에요.");
        ctx.fillStyle = "#b5869c";
        ctx.font = "900 24px sans-serif";
        wrapText(ctx, small, 540, 940, 700, 34, "center");

        ctx.textAlign = "left";

        const profileInfoForFooter = normalizeProfileInfo(profileState.info);
        const footerJoinDate = profileInfoForFooter.joinedAt || getCurrentLumiId() || "";
        const footerCardX = 134;
        const footerCardY = 122;
        const footerCardW = 812;
        const footerCardH = 1108;
        const infoY = 1034;
        const footerPadX = 44;
        const infoX = footerCardX + footerPadX;
        const infoW = footerCardW - footerPadX * 2;

        ctx.strokeStyle = "rgba(242,216,231,.78)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(footerCardX + 34, infoY);
        ctx.lineTo(footerCardX + footerCardW - 34, infoY);
        ctx.stroke();

        const footerGrad = ctx.createLinearGradient(footerCardX, infoY + 1, footerCardX, footerCardY + footerCardH);
        footerGrad.addColorStop(0, "rgba(255,255,255,.24)");
        footerGrad.addColorStop(1, "rgba(255,247,251,.34)");
        ctx.save();
        roundRect(ctx, footerCardX, footerCardY, footerCardW, footerCardH, 52, null, null);
        ctx.clip();
        ctx.fillStyle = footerGrad;
        ctx.fillRect(footerCardX + 1, infoY + 1, footerCardW - 2, footerCardY + footerCardH - infoY - 2);
        ctx.restore();

        ctx.fillStyle = muted;
        ctx.font = "900 28px sans-serif";
        ctx.fillText(footerJoinDate + " 개통", infoX, infoY + 52);
        ctx.fillStyle = pink;
        ctx.font = "900 36px sans-serif";
        ctx.fillText("LUMI ID · " + (getCurrentLumiId() || "-"), infoX, infoY + 104);
        ctx.fillStyle = muted;
        ctx.font = "900 27px sans-serif";
        ctx.fillText("왕도 라이브 아이돌 · lumibellelove.com", infoX, infoY + 150);
        fakeQr(ctx, infoX + infoW - 128, infoY + 42, 112);
        return canvas;
      }

      function roundRect(ctx, x, y, w, h, r, fill, stroke) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
        if (fill) { ctx.fillStyle = fill; ctx.fill(); }
        if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 3; ctx.stroke(); }
      }

      function wrapText(ctx, text, x, y, maxWidth, lineHeight, align) {
        const words = String(text || "").split(/\s+/);
        let line = "";
        const oldAlign = ctx.textAlign;
        ctx.textAlign = align || oldAlign;
        words.forEach((word) => {
          const test = line ? line + " " + word : word;
          if (ctx.measureText(test).width > maxWidth && line) {
            ctx.fillText(line, x, y);
            line = word;
            y += lineHeight;
          } else {
            line = test;
          }
        });
        if (line) ctx.fillText(line, x, y);
        ctx.textAlign = oldAlign;
      }

      function fakeQr(ctx, x, y, size) {
        ctx.fillStyle = "#fff";
        ctx.fillRect(x, y, size, size);
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 10;
        ctx.strokeRect(x, y, size, size);
        ctx.fillStyle = "#7c5b6d";
        const cell = size / 9;
        for (let row = 0; row < 9; row += 1) {
          for (let col = 0; col < 9; col += 1) {
            if ((row * 3 + col * 5 + row * col) % 4 === 0 || (row < 3 && col < 3) || (row > 5 && col > 5)) {
              ctx.fillRect(x + col * cell, y + row * cell, cell * .86, cell * .86);
            }
          }
        }
      }

      function achievementImageFileName(payload) {
        return (payload.mode === "summary" ? "lumiphone-achievement" : "lumiphone-achievement-" + (payload.title || "card")).replace(/[\/:*?"<>|\s]+/g, "-") + ".png";
      }

      function achievementCanvasToBlob(canvas) {
        return new Promise((resolve) => {
          if (!canvas || !canvas.toBlob) {
            resolve(null);
            return;
          }
          canvas.toBlob((blob) => resolve(blob), "image/png");
        });
      }

      function downloadBlob(blob, fileName) {
        if (!blob) return false;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName || "lumiphone-achievement.png";
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 800);
        return true;
      }

      async function downloadAchievementImage(payload, silent) {
        const canvas = drawAchievementShareImage(payload);
        const blob = await achievementCanvasToBlob(canvas);
        if (!blob) {
          if (!silent) openProfileSimpleModal("저장 안내", ["이미지 저장이 어려워요.", "공유 버튼으로 다른 앱에 보내 주세요.", "PC 환경에서는 PC에서 저장해 주세요."]);
          return null;
        }
        downloadBlob(blob, achievementImageFileName(payload));
        if (!silent) openProfileSimpleModal("저장 완료", ["공유 카드가 저장되었어요."]);
        return blob;
      }

      async function copyPlainTextAsync(text) {
        if (!text) return false;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          try {
            await navigator.clipboard.writeText(text);
            return true;
          } catch (error) {
            // file:// 또는 일부 PC 브라우저에서는 clipboard API가 막힐 수 있어 아래 방식으로 한 번 더 시도한다.
          }
        }
        try {
          const textarea = document.createElement("textarea");
          textarea.value = text;
          textarea.setAttribute("readonly", "readonly");
          textarea.style.position = "fixed";
          textarea.style.left = "-9999px";
          textarea.style.top = "0";
          document.body.appendChild(textarea);
          textarea.focus();
          textarea.select();
          const ok = document.execCommand && document.execCommand("copy");
          document.body.removeChild(textarea);
          return Boolean(ok);
        } catch (error) {
          return false;
        }
      }

      async function shareAchievementNative(payload) {
        const canvas = drawAchievementShareImage(payload);
        const blob = await achievementCanvasToBlob(canvas);
        const fileName = achievementImageFileName(payload);
        const isMobile = isMobileLikeDevice();

        // PC에서는 Web Share 동작이 브라우저마다 불안정하므로 저장 + 문구 복사 방식으로 고정한다.
        if (!isMobile) {
          if (blob) downloadBlob(blob, fileName);
          const copied = await copyPlainTextAsync(payload.text);
          openProfileSimpleModal("PC 공유 준비 완료", [
            "PC에서는 공유 준비를 완료했어요.",
            "공유 카드 이미지는 저장했고, 공유 문구는 " + (copied ? "복사해두었어요." : "복사가 어려워요."),
            copied ? "X나 인스타 웹에서 직접 업로드해 주세요." : "공유 문구가 필요하면 X 버튼을 이용해 주세요."
          ]);
          return;
        }

        const file = blob ? new File([blob], fileName, { type: "image/png" }) : null;
        const shareData = {
          title: "LUMI PHONE",
          text: payload.text,
          url: "https://lumibellelove.com"
        };
        if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({ title: "LUMI PHONE", text: payload.text, files: [file] });
            return;
          } catch (error) {
            if (error && error.name === "AbortError") return;
          }
        }
        if (navigator.share) {
          try {
            await navigator.share(shareData);
            return;
          } catch (error) {
            if (error && error.name === "AbortError") return;
          }
        }
        if (blob) downloadBlob(blob, fileName);
        await copyPlainTextAsync(payload.text);
        openProfileSimpleModal("공유 안내", ["이 기기에서는 이미지 공유가 바로 되지 않아요.", "이미지는 저장했고, 공유 문구는 복사해두었어요.", "X나 인스타에서 직접 붙여 넣어 주세요."]);
      }

      function isMobileLikeDevice() {
        const ua = navigator.userAgent || "";
        const touchPoints = Number(navigator.maxTouchPoints || 0);
        const coarsePointer = Boolean(window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
        const narrowViewport = Math.min(window.innerWidth || 9999, window.screen && window.screen.width ? window.screen.width : 9999) <= 900;
        return /Android|iPhone|iPad|iPod|Mobile|SamsungBrowser/i.test(ua) || (touchPoints > 1 && coarsePointer && narrowViewport);
      }

      function moveToXShareUrl(xUrl) {
        if (!xUrl) return;
        const ua = navigator.userAgent || "";

        if (/Android/i.test(ua)) {
          const intentTarget = String(xUrl).replace(/^https?:\/\//, "");
          const intentUrl = "intent://" + intentTarget + "#Intent;scheme=https;package=com.twitter.android;S.browser_fallback_url=" + encodeURIComponent(xUrl) + ";end";
          window.location.assign(intentUrl);
          return;
        }

        if (isMobileLikeDevice()) {
          window.location.assign(xUrl);
          return;
        }

        const nextWindow = window.open(xUrl, "_blank", "noopener,noreferrer");
        if (nextWindow && typeof nextWindow.focus === "function") nextWindow.focus();
      }

      function openXAchievementShareConfirm(payload) {
        if (!payload) return;
        const xUrl = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(payload.text);
        openProfileSimpleModal("X 작성창으로 이동할까요?", [
          "공유 문구를 클립보드에 복사한 뒤 X 작성 화면을 열어요.",
          "공유 이미지는 자동 첨부되지 않으니, 저장된 이미지를 직접 첨부해 주세요."
        ], [
          {
            label: "이동하기",
            primary: true,
            onClick: async () => { await copyPlainTextAsync(payload.text); moveToXShareUrl(xUrl); }
          },
          { label: "취소" }
        ]);
      }

      function getProfileSharePayload() {
        const info = normalizeProfileInfo(profileState.info);
        const coverPart = normalizeProfilePart(profileState && profileState.cover);
        const avatarPart = normalizeProfilePart(profileState && profileState.avatar);
        const name = info.displayName || "루미나";
        const title = info.title || "나만의 루미나";
        const oshi = info.oshi || "루루 🍼🐰";
        const joinedAt = info.joinedAt || "";
        const text = [
          "루미폰 프로필 카드",
          "",
          name + " · " + (getCurrentLumiId() || "-"),
          "오시: " + oshi,
          "대표 칭호: " + title,
          "",
          "루미벨과 함께 반짝이는 중 ✨",
          "https://lumibellelove.com/",
          "",
          "#루미벨 #LUMIBELLE #루미폰 #왕도아이돌 #라이브아이돌"
        ].join("\n");
        return {
          mode: "profile",
          kicker: "PROFILE CARD",
          icon: "♡",
          title: name,
          reward: "LUMI ID · " + (getCurrentLumiId() || "-"),
          desc: "오시: " + oshi,
          small: "대표 칭호 · " + title,
          space: info.space || "",
          birthday: profileBirthdayText(info),
          date: joinedAt,
          cover: coverPart.src || "",
          coverPart,
          avatar: avatarPart.src || "",
          avatarPart,
          text
        };
      }

      function loadCanvasImage(src) {
        return new Promise((resolve) => {
          if (!src) { resolve(null); return; }
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
          img.src = src;
        });
      }

      function drawCircularImage(ctx, img, x, y, size, part) {
        if (!ctx || !img) return false;
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        drawImageCover(ctx, img, part || null, x, y, size, size);
        ctx.restore();
        return true;
      }

      function drawImageCover(ctx, img, part, x, y, w, h) {
        if (!ctx || !img) return false;
        const iw = img.naturalWidth || img.width;
        const ih = img.naturalHeight || img.height;
        if (!iw || !ih) return false;
        const safePart = normalizeProfilePart(part || {});
        const scale = Math.max(w / iw, h / ih) * (safePart.scale || 1);
        const dw = iw * scale;
        const dh = ih * scale;
        const dx = x + (w - dw) * (safePart.x / 100);
        const dy = y + (h - dh) * (safePart.y / 100);
        ctx.drawImage(img, dx, dy, dw, dh);
        return true;
      }

      function drawRoundedCoverImage(ctx, img, part, x, y, w, h, r, stroke) {
        if (!ctx || !img) return false;
        ctx.save();
        roundRect(ctx, x, y, w, h, r, null, null);
        ctx.clip();
        drawImageCover(ctx, img, part || null, x, y, w, h);
        ctx.restore();
        if (stroke) roundRect(ctx, x, y, w, h, r, null, stroke);
        return true;
      }

      function topRoundRect(ctx, x, y, w, h, r, fill, stroke) {
        const radius = Math.max(0, Math.min(r || 0, w / 2, h));
        ctx.beginPath();
        ctx.moveTo(x, y + h);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.lineTo(x + w - radius, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
        ctx.lineTo(x + w, y + h);
        ctx.closePath();
        if (fill) {
          ctx.fillStyle = fill;
          ctx.fill();
        }
        if (stroke) {
          ctx.strokeStyle = stroke;
          ctx.stroke();
        }
      }

      function drawTopRoundedCoverImage(ctx, img, part, x, y, w, h, r, stroke) {
        if (!ctx || !img) return false;
        ctx.save();
        topRoundRect(ctx, x, y, w, h, r, null, null);
        ctx.clip();
        drawImageCover(ctx, img, part || null, x, y, w, h);
        ctx.restore();
        if (stroke) topRoundRect(ctx, x, y, w, h, r, null, stroke);
        return true;
      }

      const LUMIBELLE_SHARE_LOGO_DATA_URL = "data:image/png;base64,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";

      async function drawProfileShareImage(payload) {
        // Export-only profile share card.
        // This canvas is intentionally independent from the modal preview size.
        const canvas = document.createElement("canvas");
        canvas.width = 1080;
        canvas.height = 1440;
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;

        const pink = "#ff5fa8";
        const deep = "#624459";
        const muted = "#9a7187";
        const line = "#f2d8e7";
        const line2 = "#efbcd5";
        const white = "#ffffff";

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        const cardX = 26;
        const cardY = 26;
        const cardW = canvas.width - cardX * 2;
        const cardH = canvas.height - cardY * 2;
        const cardR = 56;
        const cardGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
        cardGrad.addColorStop(0, "#ffffff");
        cardGrad.addColorStop(.72, "#fffafd");
        cardGrad.addColorStop(1, "#fff5fb");
        roundRect(ctx, 0, 0, canvas.width, canvas.height, 0, "#fff7fb", null);
        roundRect(ctx, cardX, cardY, cardW, cardH, cardR, cardGrad, "#f4c8dc");

        const coverX = cardX;
        const coverY = cardY;
        const coverW = cardW;
        const coverH = 392;
        const coverR = cardR;
        const coverGrad = ctx.createLinearGradient(coverX, coverY, coverX + coverW, coverY + coverH);
        coverGrad.addColorStop(0, "#ffd0e7");
        coverGrad.addColorStop(.48, "#ff8fc2");
        coverGrad.addColorStop(1, "#e9d8ff");
        topRoundRect(ctx, coverX, coverY, coverW, coverH, coverR, coverGrad, "#f3c6dc");
        const coverImg = await loadCanvasImage(payload.cover || "");
        if (coverImg) {
          drawTopRoundedCoverImage(ctx, coverImg, payload.coverPart || null, coverX, coverY, coverW, coverH, coverR, "#f3c6dc");
        } else {
          ctx.fillStyle = "rgba(255,255,255,.24)";
          ctx.beginPath();
          ctx.arc(230, 154, 112, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "rgba(255,255,255,.17)";
          ctx.beginPath();
          ctx.arc(830, 315, 136, 0, Math.PI * 2);
          ctx.fill();
        }

        const avatarOuter = 300;
        const avatarInner = 290;
        const avatarX = cardX + 36;
        const avatarY = coverY + coverH - 128;
        const avatarCX = avatarX + avatarOuter / 2;
        const avatarCY = avatarY + avatarOuter / 2;
        ctx.beginPath();
        ctx.arc(avatarCX, avatarCY, avatarOuter / 2, 0, Math.PI * 2);
        ctx.fillStyle = "#fff9fd";
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = white;
        ctx.stroke();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = line;
        ctx.stroke();

        const avatarImg = await loadCanvasImage(payload.avatar || "");
        const avatarImgX = avatarX + (avatarOuter - avatarInner) / 2;
        const avatarImgY = avatarY + (avatarOuter - avatarInner) / 2;
        if (avatarImg) {
          drawCircularImage(ctx, avatarImg, avatarImgX, avatarImgY, avatarInner, payload.avatarPart || null);
        } else {
          const iconGrad = ctx.createLinearGradient(avatarImgX, avatarImgY, avatarImgX + avatarInner, avatarImgY + avatarInner);
          iconGrad.addColorStop(0, "#ff82ba");
          iconGrad.addColorStop(1, "#caa7ff");
          ctx.beginPath();
          ctx.arc(avatarCX, avatarCY, avatarInner / 2, 0, Math.PI * 2);
          ctx.fillStyle = iconGrad;
          ctx.fill();
          ctx.fillStyle = white;
          ctx.font = "900 104px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("✦", avatarCX, avatarCY + 34);
        }

        const leftX = cardX + 54;
        const contentTop = avatarY + avatarOuter + 92;
        ctx.textAlign = "left";
        ctx.fillStyle = deep;
        ctx.font = "900 88px sans-serif";
        wrapText(ctx, payload.title || "루미나", leftX, contentTop, cardW - 108, 92, "left");

        ctx.fillStyle = muted;
        ctx.font = "900 39px sans-serif";
        ctx.fillText("LUMI ID · " + (getCurrentLumiId() || "-"), leftX, contentTop + 70);

        ctx.fillStyle = deep;
        ctx.font = "900 43px sans-serif";
        wrapText(ctx, payload.desc || "오시: 루루 🍼🐰", leftX, contentTop + 136, cardW - 108, 52, "left");

        const logoImg = await loadCanvasImage(LUMIBELLE_SHARE_LOGO_DATA_URL || "");
        if (logoImg) {
          const logoW = 190;
          const logoH = logoW * ((logoImg.naturalHeight || logoImg.height) / (logoImg.naturalWidth || logoImg.width));
          const logoX = cardX + cardW - logoW - 24;
          const logoY = coverY + coverH + 14;
          ctx.save();
          ctx.globalAlpha = .76;
          ctx.drawImage(logoImg, logoX, logoY, logoW, logoH);
          ctx.restore();
        }

        function singleLine(text, maxChars) {
          const value = String(text || "").trim();
          if (!maxChars || value.length <= maxChars) return value;
          return value.slice(0, Math.max(1, maxChars - 1)) + "…";
        }

        function pill(text, x, y, w, h, fontSize, align) {
          roundRect(ctx, x, y, w, h, h / 2, "rgba(255,255,255,.94)", line2);
          const fs = fontSize || 31;
          const pad = Math.max(18, Math.round(h * 0.36));
          ctx.fillStyle = muted;
          ctx.font = "900 " + fs + "px sans-serif";
          ctx.textBaseline = "middle";
          if (align === "center") {
            ctx.textAlign = "center";
            ctx.fillText(singleLine(text, Math.floor(w / (fs * .58))), x + w / 2, y + h / 2 + 1);
          } else {
            ctx.textAlign = "left";
            ctx.fillText(singleLine(text, Math.floor((w - pad * 2) / (fs * .58))), x + pad, y + h / 2 + 1);
          }
          ctx.textBaseline = "alphabetic";
          ctx.textAlign = "left";
        }

        const pillY1 = contentTop + 190;
        const pillY2 = pillY1 + 72;
        const titleText = String(payload.small || "대표 칭호 · 나만의 루미나").replace(/^대표 칭호\s*[·:]\s*/, "");
        pill(titleText || "나만의 루미나", leftX, pillY1, 360, 62, 36, "center");

        ctx.fillStyle = muted;
        ctx.font = "900 38px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText("📍 " + (payload.space || "루루의 방"), leftX + 4, pillY1 + 128);

        function getProfileShareStampText() {
          const statusText = document.querySelector(".stamp-status span")?.textContent || "";
          const match = statusText.match(/(\d+\s*\/\s*\d+)/);
          return match ? match[1].replace(/\s+/g, " ") : "1 / 20";
        }

        function getProfileShareXpText() {
          const cards = Array.from(document.querySelectorAll(".point-card"));
          const xpCard = cards.find((card) => (card.querySelector("small")?.textContent || "").includes("반짝 XP"));
          const raw = xpCard?.querySelector("b")?.textContent || "0XP";
          return raw.replace(/\s+/g, " ").replace(/XP$/i, " XP");
        }

        function summaryBox(label, value, x, y, w, h) {
          const grad = ctx.createLinearGradient(x, y, x, y + h);
          grad.addColorStop(0, "#ffffff");
          grad.addColorStop(1, "#fff7fb");
          roundRect(ctx, x, y, w, h, 22, grad, line2);
          ctx.fillStyle = "#b07693";
          ctx.font = "900 28px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(label, x + w / 2, y + 38);
          ctx.fillStyle = "#d77ca7";
          ctx.font = "900 42px sans-serif";
          ctx.fillText(value, x + w / 2, y + 88);
          ctx.textAlign = "left";
        }

        const summaryY = pillY1 + 158;
        const summaryW = 318;
        const summaryH = 106;
        summaryBox("스탬프", getProfileShareStampText(), leftX, summaryY, summaryW, summaryH);
        summaryBox("반짝 XP", getProfileShareXpText(), leftX + summaryW + 42, summaryY, summaryW, summaryH);

        const infoY = cardY + cardH - 248;
        const infoH = cardY + cardH - infoY - 1;
        const footerPadX = 54;
        const infoX = cardX + footerPadX;
        const infoW = cardW - footerPadX * 2;
        ctx.save();
        roundRect(ctx, cardX, cardY, cardW, cardH, cardR, null, null);
        ctx.clip();
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(cardX + 1, infoY, cardW - 2, infoH);
        ctx.restore();
        ctx.strokeStyle = line;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cardX + 28, infoY);
        ctx.lineTo(cardX + cardW - 28, infoY);
        ctx.stroke();

        ctx.fillStyle = muted;
        ctx.font = "900 38px sans-serif";
        ctx.fillText((payload.date || "2026.07.12") + " 개통", infoX, infoY + 80);
        ctx.fillStyle = pink;
        ctx.font = "900 48px sans-serif";
        ctx.fillText("LUMI ID · " + (getCurrentLumiId() || "-"), infoX, infoY + 144);
        ctx.fillStyle = muted;
        ctx.font = "900 34px sans-serif";
        ctx.fillText("왕도 라이브 아이돌 · lumibellelove.com", infoX, infoY + 194);
        fakeQr(ctx, infoX + infoW - 190, infoY + 42, 166);

        return canvas;
      }

      async function prepareProfileShareCache(payload) {
        const safePayload = payload || getProfileSharePayload();
        const canvas = await drawProfileShareImage(safePayload);
        const blob = canvas ? await achievementCanvasToBlob(canvas) : null;
        const dataUrl = canvas ? canvas.toDataURL("image/png") : "";
        profileShareCache = {
          payload: safePayload,
          canvas,
          blob,
          dataUrl,
          fileName: profileImageFileName()
        };
        return profileShareCache;
      }

      function getPreparedProfileShareCache() {
        return profileShareCache && profileShareCache.payload ? profileShareCache : null;
      }

      function profileImageFileName() {
        const name = normalizeProfileInfo(profileState.info).displayName || "profile";
        return ("lumiphone-profile-" + name).replace(/[\/:*?"<>|\s]+/g, "-") + ".png";
      }

      async function downloadProfileShareImage(silent) {
        const payload = getProfileSharePayload();
        const cached = getPreparedProfileShareCache();
        const nextCache = cached && cached.blob ? cached : await prepareProfileShareCache(payload);
        const blob = nextCache && nextCache.blob;
        if (!blob) {
          if (!silent) openProfileSimpleModal("저장 안내", ["이미지 저장이 어려워요.", "공유 버튼으로 다른 앱에 보내 주세요.", "PC 환경에서는 PC에서 저장해 주세요."]);
          return null;
        }
        downloadBlob(blob, (nextCache && nextCache.fileName) || profileImageFileName());
        if (!silent) openProfileSimpleModal("저장 완료", ["공유 카드가 저장되었어요."]);
        return blob;
      }

      async function shareProfileNative() {
        const payload = getProfileSharePayload();
        const cached = getPreparedProfileShareCache();
        const fileName = (cached && cached.fileName) || profileImageFileName();
        const blob = cached && cached.blob ? cached.blob : null;
        const isMobile = isMobileLikeDevice();

        // iPhone/Safari는 사용자 클릭 직후에 navigator.share가 바로 호출되어야 안정적이다.
        // 그래서 프로필 공유 모달을 열 때 미리 만든 blob/cache를 우선 사용한다.
        if (isMobile && blob) {
          const file = new File([blob], fileName, { type: "image/png" });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({ title: "LUMI PHONE", text: payload.text, files: [file] });
              closeProfileSimpleModal();
              return;
            } catch (error) {
              if (error && error.name === "AbortError") return;
            }
          }
          if (navigator.share) {
            try {
              await navigator.share({ title: "LUMI PHONE", text: payload.text, url: "https://lumibellelove.com" });
              closeProfileSimpleModal();
              return;
            } catch (error) {
              if (error && error.name === "AbortError") return;
            }
          }
          downloadBlob(blob, fileName);
          await copyPlainTextAsync(payload.text);
          openProfileSimpleModal("공유 안내", ["이 기기에서는 이미지 공유가 바로 되지 않아요.", "이미지는 저장했고, 공유 문구는 복사해두었어요.", "X나 인스타에서 직접 붙여 넣어 주세요."]);
          return;
        }

        const nextCache = cached && cached.blob ? cached : await prepareProfileShareCache(payload);
        const nextBlob = nextCache && nextCache.blob;
        if (!isMobile) {
          if (nextBlob) downloadBlob(nextBlob, (nextCache && nextCache.fileName) || fileName);
          const copied = await copyPlainTextAsync(payload.text);
          openProfileSimpleModal("PC 공유 준비 완료", [
            "PC에서는 공유 준비를 완료했어요.",
            "공유 카드 이미지는 저장했고, 공유 문구는 " + (copied ? "복사해두었어요." : "복사가 어려워요."),
            copied ? "X나 인스타 웹에서 직접 업로드해 주세요." : "공유 문구가 필요하면 X 버튼을 이용해 주세요."
          ]);
          return;
        }

        if (navigator.share) {
          try {
            await navigator.share({ title: "LUMI PHONE", text: payload.text, url: "https://lumibellelove.com" });
            closeProfileSimpleModal();
            return;
          } catch (error) {
            if (error && error.name === "AbortError") return;
          }
        }
        if (nextBlob) downloadBlob(nextBlob, (nextCache && nextCache.fileName) || fileName);
        await copyPlainTextAsync(payload.text);
        openProfileSimpleModal("공유 안내", ["이 기기에서는 이미지 공유가 바로 되지 않아요.", "이미지는 저장했고, 공유 문구는 복사해두었어요.", "X나 인스타에서 직접 붙여 넣어 주세요."]);
      }

      function openProfileXShareConfirm() {
        const payload = getProfileSharePayload();
        const xUrl = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(payload.text);
        openProfileSimpleModal("X 작성창으로 이동할까요?", [
          "공유 문구를 클립보드에 복사한 뒤 X 작성 화면을 열어요.",
          "공유 이미지는 자동 첨부되지 않으니, 저장된 이미지를 직접 첨부해 주세요."
        ], [
          { label: "이동하기", primary: true, onClick: async () => { await copyPlainTextAsync(payload.text); moveToXShareUrl(xUrl); } },
          { label: "취소" }
        ]);
      }

      function handleProfileShareAction(action) {
        const payload = getProfileSharePayload();
        if (action === "native") { shareProfileNative(); return; }
        if (action === "x") { openProfileXShareConfirm(); return; }
        if (action === "instagram") {
          copyPlainText(payload.text, "인스타 공유 준비 완료!\n\n이미지 저장 버튼으로 공유 카드를 저장한 뒤, 인스타 스토리나 게시물에 올려주세요.\n\n공유 문구는 복사해두었어요.");
          return;
        }
        if (action === "save") { downloadProfileShareImage(false); }
      }

      async function openProfileSharePanel() {
        profileShareCache = null;
        openProfileSimpleModal("프로필 공유", ["프로필 공유 카드를 준비하는 중이에요."], [
          { icon: "↗", text: "공유", primary: true, keepOpen: true, onClick: () => handleProfileShareAction("native") },
          { icon: "𝕏", text: "X", onClick: () => handleProfileShareAction("x") },
          { icon: "📷", text: "인스타", onClick: () => handleProfileShareAction("instagram") },
          { icon: "↓", text: "저장", onClick: () => handleProfileShareAction("save") }
        ]);
        if (profileSimpleModal) {
          profileSimpleModal.classList.add("is-profile-share");
          profileSimpleModal.classList.remove("hidden");
          profileSimpleModal.setAttribute("aria-hidden", "false");
        }
        if (!profileSimpleBody) return;
        const payload = getProfileSharePayload();
        const cache = await prepareProfileShareCache(payload);
        if (!cache || !cache.dataUrl || !profileSimpleModal || profileSimpleModal.classList.contains("hidden")) return;
        profileSimpleBody.innerHTML = "";
        const wrap = document.createElement("div");
        wrap.className = "profile-share-preview-wrap";
        const img = document.createElement("img");
        img.className = "profile-share-preview-img";
        img.alt = "프로필 공유 카드 미리보기";
        img.src = cache.dataUrl;
        wrap.appendChild(img);
        profileSimpleBody.appendChild(wrap);
        const note = document.createElement("p");
        note.textContent = "공유할 방법을 선택해 주세요.";
        profileSimpleBody.appendChild(note);
      }

      function handleAchievementShareAction(scope, action) {
        const payload = getAchievementSharePayload(scope);
        if (!payload) {
          openProfileSimpleModal("공유 안내", ["획득한 업적만 공유할 수 있어요."]);
          return;
        }
        if (action === "x") {
          openXAchievementShareConfirm(payload);
          return;
        }
        if (action === "instagram") {
          copyPlainText(payload.text, "인스타 공유 준비 완료!\n\n이미지 저장 버튼으로 공유 카드를 저장한 뒤, 인스타 스토리나 게시물에 올려주세요.\n\n공유 문구는 복사해두었어요.");
          return;
        }
        if (action === "save") {
          downloadAchievementImage(payload, false);
          return;
        }
        if (action === "native") {
          shareAchievementNative(payload);
        }
      }

      function copyPlainText(text, successMessage) {
        const showCopyMessage = () => {
          const message = successMessage || "공유 문구를 복사했어요.";
          openProfileSimpleModal("복사 완료", String(message).split(/\n+/).filter(Boolean));
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(showCopyMessage).catch(() => openProfileSimpleModal("복사 안내", String(text || "").split(/\n+/).filter(Boolean)));
        } else {
          openProfileSimpleModal("복사 안내", String(text || "").split(/\n+/).filter(Boolean));
        }
      }

      function openAchievementModal(card) {
        if (!achievementModal || !card) return;
        currentAchievementCard = card;
        const owned = achievementIsOwned(card);
        const status = card.dataset.achievementStatus || "잠김";
        const category = card.dataset.achievementCategory || "기본";
        const reward = card.dataset.achievementReward || "-";
        if (achievementModalIcon) achievementModalIcon.textContent = card.dataset.achievementIcon || "✦";
        if (achievementModalTitle) achievementModalTitle.textContent = card.dataset.achievementTitle || "업적 상세";
        if (achievementModalStatus) {
          achievementModalStatus.textContent = status;
          achievementModalStatus.classList.toggle("locked", !owned);
        }
        if (achievementModalCategory) {
          achievementModalCategory.textContent = category;
          achievementModalCategory.classList.toggle("locked", !owned);
        }
        if (achievementModalDesc) achievementModalDesc.textContent = card.dataset.achievementDesc || "루미벨과 함께한 순간을 기록한 업적이에요.";
        if (achievementModalCondition) achievementModalCondition.textContent = card.dataset.achievementCondition || "-";
        if (achievementModalProgress) achievementModalProgress.textContent = card.dataset.achievementProgress || (owned ? "완료" : "미달성");
        if (achievementModalReward) achievementModalReward.textContent = reward;
        if (achievementModalDate) achievementModalDate.textContent = card.dataset.achievementDate || "-";
        if (achievementModalEquip) {
          const currentTitle = normalizeProfileInfo(profileState.info).title;
          achievementModalEquip.dataset.achieveEquipTitle = owned ? reward : "";
          achievementModalEquip.disabled = !owned || currentTitle === reward;
          achievementModalEquip.textContent = owned ? (currentTitle === reward ? "장착된 칭호" : "칭호 장착") : "획득 후 장착 가능";
          achievementModalEquip.classList.toggle("primary-look", owned && currentTitle !== reward);
        }
        if (achievementModalRepresentative) {
          achievementModalRepresentative.disabled = !owned;
          achievementModalRepresentative.textContent = owned ? "대표 업적 설정" : "획득 후 설정 가능";
        }
        achievementShareActionButtons.forEach((button) => {
          if (button.dataset.shareScope === "single") button.disabled = !achievementCanShare(card);
        });
        document.documentElement.classList.add("profile-title-modal-open");
        document.body.classList.add("profile-title-modal-open");
        achievementModal.classList.remove("hidden");
        achievementModal.setAttribute("aria-hidden", "false");
      }

      function closeAchievementModal() {
        if (!achievementModal) return;
        achievementModal.classList.add("hidden");
        achievementModal.setAttribute("aria-hidden", "true");
        document.documentElement.classList.remove("profile-title-modal-open");
        document.body.classList.remove("profile-title-modal-open");
      }

      function equipAchievementTitle(titleName, showFeedback) {
        const nextTitle = clampText(titleName || "나만의 루미나", 18) || "나만의 루미나";
        const currentTitle = normalizeProfileInfo(profileState.info).title;
        if (currentTitle === nextTitle) return;
        const nextInfo = normalizeProfileInfo(Object.assign({}, profileState.info, { title: nextTitle }));
        profileState = normalizeProfileState(Object.assign({}, profileState, { info: nextInfo }));
        profileDraft = cloneProfileState(profileState);
        saveProfileState();
        updateProfileTitleOptions(nextTitle);
        renderProfileView();
        if (showFeedback) {
          openProfileSimpleModal("칭호 장착 완료", ["대표 칭호가 ‘" + nextTitle + "’로 변경되었어요."]);
        }
      }
      window.equipAchievementTitle = equipAchievementTitle;

      function setRepresentativeAchievement(card) {
        if (!card || !achievementIsOwned(card)) return;
        localStorage.setItem(representativeAchievementKeyFor(getCurrentLumiId()), card.dataset.achievementTitle || "");
        updateAchievementSummary();
        openProfileSimpleModal("대표 업적 설정 완료", ["대표 업적이 ‘" + (card.dataset.achievementTitle || "업적") + "’로 설정되었어요."]);
      }

      function updateAchievementSummary() {
        const cards = getAchievementCards();
        const ownedCards = cards.filter(achievementIsOwned);
        const progressCards = cards.filter((card) => (card.dataset.achievementStatus || "") === "대기 중");
        const ownedTitles = Array.from(new Set(ownedCards.map((card) => card.dataset.achievementReward).filter(Boolean)));
        if (achievementSummaryDone) achievementSummaryDone.textContent = ownedCards.length + " / " + cards.length;
        if (achievementSummaryTitles) achievementSummaryTitles.textContent = ownedTitles.length + "개";

        const progressCard = progressCards[0] || null;
        if (achievementSummaryProgress) achievementSummaryProgress.textContent = progressCard ? (progressCard.dataset.achievementProgress || "대기 중") : "0개";
        if (achievementSummaryProgressName) achievementSummaryProgressName.textContent = progressCard ? (progressCard.dataset.achievementTitle || "이어가는 기록") : "이어가는 기록";
        if (achievementSummaryProgressIcon) achievementSummaryProgressIcon.textContent = progressCard ? (progressCard.dataset.achievementIcon || "✨") : "✨";
        if (achievementSummaryProgressCard) {
          achievementSummaryProgressCard.disabled = !progressCard;
          achievementSummaryProgressCard.dataset.summaryAchievementTitle = progressCard ? (progressCard.dataset.achievementTitle || "") : "";
        }

        let representativeTitle = localStorage.getItem(representativeAchievementKeyFor(getCurrentLumiId())) || (ownedCards[0] && ownedCards[0].dataset.achievementTitle) || "";
        let representativeCard = findAchievementCardByTitle(representativeTitle) || ownedCards[0] || cards[0];
        if (representativeCard && !achievementIsOwned(representativeCard)) representativeCard = ownedCards[0] || cards[0];
        if (representativeCard) {
          localStorage.setItem(representativeAchievementKeyFor(getCurrentLumiId()), representativeCard.dataset.achievementTitle || "");
          if (achievementSummaryRepresentative) achievementSummaryRepresentative.textContent = representativeCard.dataset.achievementTitle || "-";
          if (achievementSummaryRepresentativeIcon) achievementSummaryRepresentativeIcon.textContent = representativeCard.dataset.achievementIcon || "🏅";
          if (achievementSummaryRepresentativeCard) {
            achievementSummaryRepresentativeCard.disabled = false;
            achievementSummaryRepresentativeCard.dataset.summaryAchievementTitle = representativeCard.dataset.achievementTitle || "";
          }
        } else if (achievementSummaryRepresentativeCard) {
          achievementSummaryRepresentativeCard.disabled = true;
        }
      }

      function getFilteredAchievementCards(category) {
        const nextCategory = category || "전체";
        return getAchievementCards().filter((card) => {
          const cardCategory = card.dataset.achievementCategory || "기본";
          const isHidden = (card.dataset.achievementStatus || "") === "숨김" || cardCategory === "숨김";
          return nextCategory === "전체" ? true : nextCategory === "숨김" ? isHidden : cardCategory === nextCategory;
        });
      }

      function renderAchievementPage() {
        const filteredCards = getFilteredAchievementCards(achievementCurrentFilter);
        const totalPages = Math.max(1, Math.ceil(filteredCards.length / achievementPageSize));
        if (achievementCurrentPage > totalPages) achievementCurrentPage = totalPages;
        if (achievementCurrentPage < 1) achievementCurrentPage = 1;
        const start = (achievementCurrentPage - 1) * achievementPageSize;
        const visibleSet = new Set(filteredCards.slice(start, start + achievementPageSize));
        getAchievementCards().forEach((card) => { card.hidden = !visibleSet.has(card); });
        if (achievementPageText) achievementPageText.textContent = achievementCurrentPage + " / " + totalPages;
        if (achievementPagePrev) achievementPagePrev.disabled = achievementCurrentPage <= 1;
        if (achievementPageNext) achievementPageNext.disabled = achievementCurrentPage >= totalPages;
      }

      function filterAchievements(category) {
        achievementCurrentFilter = category || "전체";
        achievementCurrentPage = 1;
        achievementFilterButtons.forEach((button) => {
          button.classList.toggle("active", button.dataset.achievementFilter === achievementCurrentFilter);
        });
        renderAchievementPage();
      }


      // PATCH 51-52: 업적/칭호 조회 데이터 표시 전용
      function normalizeApiAchievementStatus(status) {
        const raw = String(status || "").trim().toLowerCase();
        if (raw === "achieved" || raw === "complete" || raw === "completed" || raw === "달성" || raw === "달성 완료") return "달성 완료";
        if (raw === "progress" || raw === "progressing" || raw === "진행" || raw === "진행 중" || raw === "대기 중") return "진행 중";
        if (raw === "hidden" || raw === "숨김") return "숨김";
        return "잠김";
      }

      function rewardTitleFromAchievement(item) {
        const raw = String((item && (item.rewardText || item.reward || item.titleReward)) || "").trim();
        return raw.replace(/^칭호\s*[:：]\s*/, "").trim() || (item && item.title) || "-";
      }

      function achievementProgressText(item, statusLabel) {
        if (statusLabel === "달성 완료") return "완료";
        const current = Number(item && item.progressCurrent || 0);
        const target = Number(item && item.progressTarget || 0);
        if (target > 0) return String(current) + " / " + String(target);
        return statusLabel === "진행 중" ? "진행 중" : "미달성";
      }

      function findAchievementCardsForApi(item) {
        const title = String(item && item.title || "").trim();
        const key = String(item && item.achievementKey || "").trim();
        const aliasByKey = {
          first_visit: "첫 번째 점",
          stamp_1: "첫 루미 체크인",
          stamp_20: "꽃도장 한 판 완성"
        };
        const candidates = Array.from(new Set([title, aliasByKey[key]].filter(Boolean)));
        const cards = getAchievementCards();
        const matched = cards.filter((card) => candidates.includes(String(card.dataset.achievementTitle || "").trim()));
        return matched;
      }

      function findAchievementCardForApi(item) {
        return findAchievementCardsForApi(item)[0] || null;
      }

      function applyAchievementItemToCard(card, item) {
        if (!card || !item) return;
        const statusLabel = normalizeApiAchievementStatus(item.status);
        const owned = statusLabel === "달성 완료";
        const progressText = achievementProgressText(item, statusLabel);
        const rewardTitle = rewardTitleFromAchievement(item);
        const title = String(item.title || card.dataset.achievementTitle || "업적").trim();
        const icon = String(item.icon || card.dataset.achievementIcon || (owned ? "✦" : "🔒")).trim();
        const category = String(item.category || card.dataset.achievementCategory || "기본").trim();
        const date = String(item.achievedAt || (owned ? card.dataset.achievementDate || "" : statusLabel)).trim();

        card.dataset.achievementTitle = title;
        card.dataset.achievementIcon = icon;
        card.dataset.achievementStatus = statusLabel;
        card.dataset.achievementCategory = category;
        card.dataset.achievementDesc = String(item.note || card.dataset.achievementDesc || "루미벨과 함께한 기록이에요.");
        card.dataset.achievementCondition = String(item.conditionText || card.dataset.achievementCondition || "-");
        card.dataset.achievementProgress = progressText;
        card.dataset.achievementReward = rewardTitle;
        card.dataset.achievementDate = date || (owned ? "달성 완료" : statusLabel);
        card.dataset.achievementOwned = owned ? "true" : "false";
        card.dataset.achievementKey = String(item.achievementKey || "");
        card.classList.toggle("locked", statusLabel === "잠김");
        card.classList.toggle("progressing", statusLabel === "진행 중");
        card.classList.toggle("hidden-achievement", statusLabel === "숨김");

        const iconEl = card.querySelector(".achievement-icon");
        const stateEl = card.querySelector(".achievement-state");
        const titleEl = card.querySelector("h3");
        const rewardEl = card.querySelector(".achievement-title-line");
        if (iconEl) iconEl.textContent = icon;
        if (stateEl) {
          stateEl.textContent = statusLabel;
          stateEl.classList.toggle("locked", !owned && statusLabel !== "진행 중");
        }
        if (titleEl) titleEl.textContent = title;
        if (rewardEl) rewardEl.textContent = owned || statusLabel === "진행 중" ? ("보상 칭호: " + rewardTitle) : "조건 달성 후 해금";
      }

      function updateTitleOptionsFromApi(titles, equippedTitle) {
        const activeTitles = Array.isArray(titles) ? titles.filter((item) => String(item.status || "active") === "active") : [];
        runtimeEquippedTitleFromApi = equippedTitle || (activeTitles.find((item) => item.equipped) || {}).titleName || "";
        if (runtimeEquippedTitleFromApi) {
          if (profileTitlePill) profileTitlePill.textContent = runtimeEquippedTitleFromApi;
          if (profileSelectedTitle) profileSelectedTitle.textContent = runtimeEquippedTitleFromApi;
          if (profileInputTitle) profileInputTitle.value = runtimeEquippedTitleFromApi;
        }
        const existingValues = new Set($$(".profile-title-option[data-title-value]").map((button) => button.dataset.titleValue));
        const optionHost = profileTitleModal && profileTitleModal.querySelector(".profile-title-options, .profile-setting-list, .profile-title-list");
        activeTitles.forEach((item) => {
          const titleName = String(item.titleName || "").trim();
          if (!titleName || existingValues.has(titleName) || !optionHost) return;
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "profile-title-option";
          btn.dataset.titleValue = titleName;
          btn.textContent = titleName;
          btn.addEventListener("click", () => selectProfileTitle(titleName));
          optionHost.appendChild(btn);
          existingValues.add(titleName);
        });
        if (runtimeEquippedTitleFromApi) updateProfileTitleOptions(runtimeEquippedTitleFromApi);
      }

      function renderAchievementsFromApi(payload) {
        const data = payload || {};
        window.__lumiLatestAchievementsPayload = data; // PATCH 51-52-fix2: PC 전용 업적 렌더러 동기화용
        if (typeof window.__lumiUpdatePcAchievements === "function") {
          try { window.__lumiUpdatePcAchievements(data); } catch (error) {}
        }
        const achievements = Array.isArray(data.achievements) ? data.achievements : [];
        const titles = Array.isArray(data.titles) ? data.titles : [];
        achievements.forEach((item) => {
          const cards = findAchievementCardsForApi(item);
          cards.forEach((card) => applyAchievementItemToCard(card, item));
        });
        updateTitleOptionsFromApi(titles, data.equippedTitle || "");

        const summary = data.summary || {};
        if (achievementSummaryDone) {
          const total = achievements.length || getAchievementCards().length;
          const achieved = Number(summary.achieved != null ? summary.achieved : achievements.filter((item) => normalizeApiAchievementStatus(item.status) === "달성 완료").length);
          achievementSummaryDone.textContent = achieved + " / " + total;
        }
        if (achievementSummaryTitles) {
          const titleCount = Number(summary.titles != null ? summary.titles : titles.length);
          achievementSummaryTitles.textContent = titleCount + "개";
        }
        updateAchievementSummary();
        renderAchievementPage();
      }

      async function loadMyProfile(lumiId) {
        const id = normId(lumiId || getCurrentLumiId());
        if (!id || !LUMI_API_ENDPOINT()) return null;
        const payload = await fetchLumiApi({ action: "lumiGetMyProfile", lumiId: id });
        if (payload && payload.ok && payload.user) {
          cacheWrite_(id, "profile", payload);
          currentUser = normalizeLumiUser(Object.assign({}, currentUser || {}, payload.user));
          saveLoginState(currentUser);
          syncProfileInfoFromUser(currentUser);
          syncRecordJoinDateFromUser(currentUser);
          // Admin Users Patch 1-fix1:
          // 로그인 직후 응답/캐시가 normal로 남아 있어도, 프로필 재조회에서 temporary 상태를 받으면
          // 임시 비밀번호 변경 안내 모달을 다시 띄운다.
          if (typeof showTemporaryPasswordNotice_ === "function") {
            window.setTimeout(showTemporaryPasswordNotice_, 80);
          }
        }
        return payload;
      }

      async function loadMyAchievements(lumiId) {
        const id = normId(lumiId || getCurrentLumiId());
        if (!id || !LUMI_API_ENDPOINT()) return null;
        const payload = await fetchLumiApi({ action: "lumiGetMyAchievements", lumiId: id });
        if (payload && payload.ok) {
          cacheWrite_(id, "achievements", payload);
          renderAchievementsFromApi(payload);
        }
        return payload;
      }

      function renderProfileView() {
        applyImagePart(profileCoverImg, profileState.cover);
        applyImagePart(profileAvatarImg, profileState.avatar);
        if (profileCover) profileCover.classList.toggle("has-image", Boolean(profileState.cover.src));
        if (profileAvatar) profileAvatar.classList.toggle("has-image", Boolean(profileState.avatar.src));
        const info = normalizeProfileInfo(profileState.info);
        const displayTitle = runtimeEquippedTitleFromApi || info.title;
        if (profileDisplayName) profileDisplayName.textContent = info.displayName;
        if (profileMeta) profileMeta.textContent = "오시: " + info.oshi;
        if (profileTitlePill) profileTitlePill.textContent = displayTitle;
        if (profileSpaceTag) {
          if (info.space) {
            profileSpaceTag.textContent = "📍 " + info.space;
            profileSpaceTag.hidden = false;
          } else {
            profileSpaceTag.textContent = "";
            profileSpaceTag.hidden = true;
          }
        }
        if (profileBirthdayTag) profileBirthdayTag.textContent = "🎂 " + profileBirthdayText(info);
        if (profileJoinTag) profileJoinTag.textContent = "";
      }

      function renderProfileEditorPreview() {
        applyImagePart(profileEditorCoverImg, profileDraft.cover);
        applyImagePart(profileEditorAvatarImg, profileDraft.avatar);
        if (profileEditorCover) profileEditorCover.classList.toggle("has-image", Boolean(profileDraft.cover.src));
        if (profileEditorAvatar) profileEditorAvatar.classList.toggle("has-image", Boolean(profileDraft.avatar.src));
      }

      function renderProfileEditor() {
        if (!profileEditor || profileEditor.classList.contains("hidden")) return;
        renderProfileEditorPreview();
        renderProfileForm();
      }

      function openProfileSimpleModal(title, lines, actions) {
        if (!profileSimpleModal || !profileSimpleTitle || !profileSimpleBody) return;
        if (profileSimpleModal.parentElement !== document.body) document.body.appendChild(profileSimpleModal);
        profileSimpleTitle.textContent = title || "안내";
        profileSimpleBody.innerHTML = "";
        (Array.isArray(lines) ? lines : [String(lines || "")]).forEach((line) => {
          const p = document.createElement("p");
          p.textContent = line;
          profileSimpleBody.appendChild(p);
        });
        if (profileSimpleActions) {
          profileSimpleActions.innerHTML = "";
          const actionList = Array.isArray(actions) ? actions : [];
          profileSimpleActions.classList.toggle("hidden", actionList.length === 0);
          if (profileSimpleOk) profileSimpleOk.classList.toggle("hidden", actionList.length > 0);
          actionList.forEach((action) => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "profile-simple-action-btn" + (action.primary ? " primary-look" : "");
            if (action.icon || action.text) {
              const icon = document.createElement("b");
              icon.textContent = action.icon || "";
              const label = document.createElement("span");
              label.textContent = action.text || action.label || "확인";
              btn.appendChild(icon);
              btn.appendChild(label);
            } else {
              btn.textContent = action.label || "확인";
            }
            btn.addEventListener("click", () => {
              if (!action.keepOpen) closeProfileSimpleModal();
              if (typeof action.onClick === "function") action.onClick();
            });
            profileSimpleActions.appendChild(btn);
          });
        } else if (profileSimpleOk) {
          profileSimpleOk.classList.remove("hidden");
        }
        profileSimpleModal.classList.remove("hidden");
        profileSimpleModal.setAttribute("aria-hidden", "false");
      }

      function closeProfileSimpleModal() {
        if (!profileSimpleModal) return;
        profileSimpleModal.classList.remove("is-profile-share");
        profileSimpleModal.classList.add("hidden");
        profileSimpleModal.setAttribute("aria-hidden", "true");
        if (profileSimpleActions) {
          profileSimpleActions.innerHTML = "";
          profileSimpleActions.classList.add("hidden");
        }
        if (profileSimpleOk) profileSimpleOk.classList.remove("hidden");
      }

      window.openProfileSimpleModal = openProfileSimpleModal;
      window.closeProfileSimpleModal = closeProfileSimpleModal;



      function openStampRuleModal() {
        openProfileSimpleModal("스탬프 지급 기준", [
          "루미 체크인 완료 시 1일 1스탬프가 지급돼요.",
          "이벤트 데이에는 추가 스탬프가 지급될 수 있어요.",
          "관람만, 물판만, 굿즈 구매만, 촬영 없이 지나간 경우는 제외돼요.",
          "20개 달성 시 완주 기록 저장 후 다음 회차가 시작돼요."
        ]);
      }

      const stampRuleOpen = document.getElementById("stampRuleOpen");
      if (stampRuleOpen) stampRuleOpen.addEventListener("click", openStampRuleModal);

      function renderProfileCrop() {
        if (!profileMediaImg || !profileMediaStage || !profileMediaZoom) return;
        const part = normalizeProfilePart(profileCropPart);
        profileMediaStage.dataset.mode = profileCropTarget === "avatar" ? "avatar" : "cover";
        profileMediaImg.src = part.src;
        profileMediaImg.style.setProperty("--pos-x", part.x + "%");
        profileMediaImg.style.setProperty("--pos-y", part.y + "%");
        profileMediaImg.style.setProperty("--scale", String(part.scale));
        profileMediaZoom.value = String(part.scale);
        if (profileMediaTitle) profileMediaTitle.textContent = profileCropTarget === "avatar" ? "프로필 이미지 수정" : "헤더 이미지 수정";
      }

      function openProfileMediaModal(targetName, part) {
        profileCropTarget = targetName === "avatar" ? "avatar" : "cover";
        profileCropPart = normalizeProfilePart(part || profileDraft[profileCropTarget]);
        if (profileMediaModal) {
          profileMediaModal.classList.remove("hidden");
          profileMediaModal.setAttribute("aria-hidden", "false");
        }
        renderProfileCrop();
      }

      function closeProfileMediaModal() {
        if (typeof resetProfilePointerState === "function") resetProfilePointerState();
        profileDragState = null;
        if (profileMediaModal) {
          profileMediaModal.classList.add("hidden");
          profileMediaModal.setAttribute("aria-hidden", "true");
        }
      }

      function applyProfileMediaCrop() {
        profileDraft[profileCropTarget] = normalizeProfilePart(profileCropPart);
        profileEditTarget = profileCropTarget;
        closeProfileMediaModal();
        renderProfileEditor();
        showProfileError("");
      }

      function resetProfileMediaCrop() {
        profileCropPart = normalizeProfilePart(Object.assign({}, profileCropPart, { x: 50, y: 50, scale: 1 }));
        renderProfileCrop();
      }

      function updateProfileCropPosition(dx, dy) {
        if (!profileMediaStage) return;
        const rect = profileMediaStage.getBoundingClientRect();
        const part = normalizeProfilePart(profileCropPart);
        part.x -= (dx / Math.max(rect.width, 1)) * 100;
        part.y -= (dy / Math.max(rect.height, 1)) * 100;
        profileCropPart = normalizeProfilePart(part);
        renderProfileCrop();
      }

      function openProfileEditor() {
        profileDraft = cloneProfileState(profileState);
        if (profileEditor) {
          profileEditor.classList.remove("hidden");
          profileEditor.setAttribute("aria-hidden", "false");
        }
        renderProfileEditor();
      }

      function closeProfileEditor(resetDraft) {
        closeProfileMediaModal();
        closeProfileTitleModal();
        closeProfileSimpleModal();
        closeProfileOshiModal();
        closeProfileOshiConfirmModal();
        if (resetDraft) profileDraft = cloneProfileState(profileState);
        if (profileEditor) {
          profileEditor.classList.add("hidden");
          profileEditor.setAttribute("aria-hidden", "true");
        }
        renderProfileView();
      }

      function profileFileToPersistentDataUrl(file, targetName) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onerror = () => reject(new Error("file-read-failed"));
          reader.onload = () => {
            const original = String(reader.result || "");
            const img = new Image();
            img.onload = () => {
              try {
                const maxW = targetName === "avatar" ? 900 : 1600;
                const maxH = targetName === "avatar" ? 900 : 900;
                const iw = img.naturalWidth || img.width || 1;
                const ih = img.naturalHeight || img.height || 1;
                const ratio = Math.min(1, maxW / Math.max(iw, 1), maxH / Math.max(ih, 1));
                const w = Math.max(1, Math.round(iw * ratio));
                const h = Math.max(1, Math.round(ih * ratio));
                const canvas = document.createElement("canvas");
                canvas.width = w;
                canvas.height = h;
                const c = canvas.getContext("2d");
                if (!c) { resolve(original); return; }
                c.drawImage(img, 0, 0, w, h);
                const compressed = canvas.toDataURL("image/jpeg", 0.84);
                resolve(compressed || original);
              } catch (error) {
                resolve(original);
              }
            };
            img.onerror = () => resolve(original);
            img.src = original;
          };
          reader.readAsDataURL(file);
        });
      }

      async function readProfileFile(input, targetName) {
        const file = input && input.files && input.files[0];
        if (!file || !file.type.startsWith("image/")) return;
        try {
          const dataUrl = await profileFileToPersistentDataUrl(file, targetName === "avatar" ? "avatar" : "cover");
          const nextPart = { src: String(dataUrl || ""), x: 50, y: 50, scale: 1 };
          profileEditTarget = targetName === "avatar" ? "avatar" : "cover";
          openProfileMediaModal(profileEditTarget, nextPart);
        } catch (error) {
          showProfileError("이미지를 불러오기 어려워요. 다른 이미지를 선택해 주세요.");
        } finally {
          input.value = "";
        }
      }

      function normalizeLumiUser(user) {
        const source = user || {};
        const id = normId(source.lumiId || source.id || "");
        return {
          id: id,
          lumiId: id,
          nickname: source.nickname || source.name || "루미나",
          oshi: source.oshi || "",
          level: source.level || "",
          createdAt: source.createdAt || "",
          joinedAt: source.joinedAt || source.createdAt || "",
          birthMonth: source.birthMonth || source.birthdayMonth || "",
          birthDay: source.birthDay || source.birthdayDay || "",
          profileMessage: source.profileMessage || "",
          equippedTitle: source.equippedTitle || "",
          passwordType: source.passwordType || source.pinType || "",
          mustChangePassword: source.mustChangePassword === true || String(source.mustChangePassword || source.mustChangePin || "").toLowerCase() === "true",
          passwordRule: source.passwordRule || "",
          passwordUpdatedAt: source.passwordUpdatedAt || source.pinUpdatedAt || "",
          // SecPatch1-fix1: openApp/normalize 과정에서 로그인 토큰이 지워지지 않도록 보존
          sessionToken: source.sessionToken || ""
        };
      }

      async function fetchLumiApi(params) {
        const payload = Object.assign({}, params || {});
        appendBootDebug("ENTER fetchLumiApi: " + String(payload.action || "unknown"));
        if (!LUMI_API_ENDPOINT()) {
          appendBootDebug("missingApiEndpoint");
          throw new Error("missingApiEndpoint");
        }
        appendBootDebug("API request: " + String(payload.action || "unknown"));

        const query = new URLSearchParams();
        Object.keys(payload).forEach((key) => {
          if (payload[key] !== undefined && payload[key] !== null) query.set(key, String(payload[key]));
        });
        query.set("_", String(Date.now()));
        query.set("_v", APP_VERSION);

        // SecPatch1: lumiLogin/lumiFindId/lumiGetRecoveryQuestion/lumiResetPin 제외하고 sessionToken 자동 첨부
        const _noTokenActions = new Set(["lumiLogin", "lumiFindId", "lumiFindIdEmail", "lumiRequestSignupEmailCode", "lumiSignupWithCode", "lumiRequestPinResetCode", "lumiResetPinWithCode", "lumiGetRecoveryQuestion", "lumiResetPin"]);
        if (!_noTokenActions.has(payload.action)) {
          const _storedToken = (function() {
            try {
              const _raw = localStorage.getItem("lumiphone.loginState.v1");
              if (!_raw) return "";
              const _obj = JSON.parse(_raw);
              return (_obj && _obj.sessionToken) || "";
            } catch(e) { return ""; }
          })();
          if (_storedToken) query.set("sessionToken", _storedToken);
        }

        const url = LUMI_API_ENDPOINT() + (LUMI_API_ENDPOINT().indexOf("?") === -1 ? "?" : "&") + query.toString();
        appendBootDebug("fetch action: " + String(payload.action || "unknown")); // SecPatch1: URL/PIN/token 노출 방지

        const controller = new AbortController();
        const timer = window.setTimeout(() => {
          controller.abort();
          appendBootDebug("apiTimeout: " + String(payload.action || "unknown"));
        }, LUMI_API_TIMEOUT_MS);

        try {
          const response = await fetch(url, { signal: controller.signal });
          window.clearTimeout(timer);
          if (!response.ok) throw new Error("apiNetworkError");
          const data = await response.json();
          appendBootDebug("fetch success: " + String(payload.action || "unknown"));
          // SecPatch1: unauthorized 응답 감지 시 자동 로그아웃
          if (data && data.ok === false && (data.error === "unauthorized" || data.code === 401)) {
            appendBootDebug("unauthorized: auto logout triggered by " + String(payload.action || "unknown"));
            if (typeof closeApp === "function") closeApp();
            throw new Error("unauthorized");
          }
          return data;
        } catch (err) {
          window.clearTimeout(timer);
          const msg = err && err.name === "AbortError" ? "apiTimeout" : "apiNetworkError";
          appendBootDebug("fetch error: " + msg + " / " + String(err && err.message || ""));
          throw new Error(msg);
        }
      }


      async function postLumiApi(params) {
        const payload = Object.assign({}, params || {});
        payload._ = String(Date.now());
        payload._v = APP_VERSION;
        appendBootDebug("POST action: " + String(payload.action || "unknown"));
        if (!LUMI_API_ENDPOINT()) {
          appendBootDebug("missingApiEndpoint");
          throw new Error("missingApiEndpoint");
        }

        const controller = new AbortController();
        const timer = window.setTimeout(() => {
          controller.abort();
          appendBootDebug("postTimeout: " + String(payload.action || "unknown"));
        }, LUMI_API_TIMEOUT_MS);

        try {
          const response = await fetch(LUMI_API_ENDPOINT(), {
            method: "POST",
            headers: { "Content-Type": "application/json;charset=UTF-8" },
            body: JSON.stringify(payload),
            signal: controller.signal
          });
          window.clearTimeout(timer);
          if (!response.ok) throw new Error("apiNetworkError");
          const text = await response.text();
          let data = null;
          try {
            data = JSON.parse(text);
          } catch (jsonError) {
            const match = String(text || "").match(/^[^(]+\(([\s\S]*)\);?$/);
            if (match && match[1]) data = JSON.parse(match[1]);
          }
          if (!data) throw new Error("apiParseError");
          appendBootDebug("POST success: " + String(payload.action || "unknown"));
          if (data && data.ok === false && (data.error === "unauthorized" || data.code === 401)) {
            appendBootDebug("unauthorized: auto logout triggered by " + String(payload.action || "unknown"));
            if (typeof closeApp === "function") closeApp();
            throw new Error("unauthorized");
          }
          return data;
        } catch (err) {
          window.clearTimeout(timer);
          const msg = err && err.name === "AbortError" ? "apiTimeout" : (err && err.message ? err.message : "apiNetworkError");
          appendBootDebug("POST error: " + msg + " / " + String(err && err.message || ""));
          throw new Error(msg);
        }
      }

      async function loginLumiPhone(lumiId, pin) {
        const response = await postLumiApi({ action: "lumiLogin", lumiId: lumiId, pin: pin });
        if (!response || response.ok !== true) {
          setBootDebug("login failed: " + String((response && (response.message || response.error)) || "loginFailed"));
          throw new Error((response && (response.message || response.error)) || "loginFailed");
        }
        const user = normalizeLumiUser(response.user || response.data || {});
        // SecPatch1: 서버 발급 sessionToken을 user 객체에 추가 → saveLoginState에서 저장됨
        if (response.sessionToken) user.sessionToken = response.sessionToken;
        appendBootDebug("login success: " + (user.lumiId || user.id || lumiId));
        return user;
      }

      async function getMyReservations(lumiId) {
        const response = await fetchLumiApi({ action: "lumiGetMyReservations", lumiId: lumiId });
        if (!response || response.ok !== true) {
          appendBootDebug("reservation load failed: " + String((response && (response.message || response.error)) || "reservationLoadFailed"));
          throw new Error((response && (response.message || response.error)) || "reservationLoadFailed");
        }
        const list = Array.isArray(response.reservations) ? response.reservations : (response.data && Array.isArray(response.data.reservations) ? response.data.reservations : []);
        appendBootDebug("reservations count: " + list.length);
        if (list.length > 0) {
          const first = list[0];
          appendBootDebug("first item: eventId=" + first.eventId + " date=" + first.eventDate + " end=" + String(first.eventEndAt || "") + " pay=" + first.paymentStatus);
        }
        return list;
      }

      async function getMyMessages(lumiId) {
        const response = await fetchLumiApi({ action: "lumiGetMessages", lumiId: lumiId });
        if (DEBUG_MODE) console.log("[lumi] getMyMessages raw response:", response);
        if (!response || response.ok !== true) {
          if (DEBUG_MODE) console.warn("[lumi] getMyMessages failed:", response);
          appendBootDebug("message load failed: " + String((response && (response.message || response.error)) || "messageLoadFailed"));
          throw new Error((response && (response.message || response.error)) || "messageLoadFailed");
        }
        const list = Array.isArray(response.messages) ? response.messages : (response.data && Array.isArray(response.data.messages) ? response.data.messages : []);
        if (DEBUG_MODE) console.log("[lumi] getMyMessages list count:", list.length, "| first item:", list[0] || null);
        appendBootDebug("messages count: " + list.length);
        return list;
      }

      function escapeHtml(value) {
        return String(value == null ? "" : value).replace(/[&<>'"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[ch]));
      }

      function normalizeReservationItem(item) {
        const source = item || {};
        const eventDate = source.eventDate || source.date || "";
        return {
          eventId: source.eventId || "",
          eventTitle: source.eventTitle || source.eventName || source.title || "공연명 확인 중",
          eventDate: eventDate,
          eventStartAt: source.eventStartAt || source.startAt || source.eventStart || "",
          eventEndAt: source.eventEndAt || source.endAt || source.eventEnd || "",
          venueName: source.venueName || source.location || source.venue || "공연장 확인 중",
          reservationNumber: source.reservationNumber || source.reserveNo || source.number || "-",
          paymentStatus: source.paymentStatus || "pending",
          reservationStatus: source.reservationStatus || "reserved",
          entryStatus: source.entryStatus || "",
          meate: source.meate || source.oshimember || source.oshi || "-",
          eventStatus: source.eventStatus || "",
          startTime: source.startTime || ""
        };
      }

      function parseLumiDateTime(value) {
        const text = String(value || "").trim();
        if (!text) return null;
        const localMatch = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
        if (localMatch) {
          const year = Number(localMatch[1]);
          const month = Number(localMatch[2]) - 1;
          const day = Number(localMatch[3]);
          const hour = Number(localMatch[4] || 0);
          const minute = Number(localMatch[5] || 0);
          const second = Number(localMatch[6] || 0);
          const date = new Date(year, month, day, hour, minute, second);
          return Number.isNaN(date.getTime()) ? null : date;
        }
        const fallback = new Date(text);
        return Number.isNaN(fallback.getTime()) ? null : fallback;
      }

      function isPastReservation(item) {
        const eventEnd = parseLumiDateTime(item && item.eventEndAt);
        if (eventEnd) return Date.now() >= eventEnd.getTime();
        const status = String(item.eventStatus || "").toLowerCase();
        if (["ended", "closed", "finished", "past"].includes(status)) return true;
        if (!item.eventDate) return false;
        const today = new Date();
        const todayKey = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
        return String(item.eventDate) < todayKey;
      }

      function isEntryDone(item) {
        const es = String(item.entryStatus || "").toLowerCase();
        return es === "entered" || es === "입장완료" || es === "입장 완료" || es === "checkedin";
      }

      function ticketStatusLabel(item) {
        if (isEntryDone(item)) return "입장 완료";
        return paymentLabel(item.paymentStatus);
      }

      function paymentLabel(status) {
        const key = String(status || "").toLowerCase();
        if (key === "confirmed") return "입금 확인 완료";
        if (key === "cancelled" || key === "canceled") return "예약 취소";
        return "입금 확인 대기";
      }

      // PATCH 51-51: 메아테 혜택 표시 전용 헬퍼
      // 예약 데이터의 meate/paymentStatus만 읽고, 특전권 자동 발급/포인트 자동 지급은 하지 않음.
      function normalizeMeateValue_(value) {
        return String(value || "").trim();
      }

      function isLumibelleMeate_(value) {
        var raw = normalizeMeateValue_(value);
        var key = raw.toLowerCase().replace(/[\s_\-·・.]/g, "");
        return key === "lumibelle" || key === "루미벨";
      }

      function isPaymentConfirmed_(status) {
        var raw = String(status || "").trim();
        var key = raw.toLowerCase().replace(/[\s_\-]/g, "");
        return key === "confirmed" || key === "paid" || key === "paymentconfirmed" || raw === "입금 완료" || raw === "입금확인완료" || raw === "입금 확인 완료";
      }

      function meateBenefitState(item) {
        var meate = normalizeMeateValue_(item && item.meate);
        var hasMeate = Boolean(meate && meate !== "-");
        var confirmed = isPaymentConfirmed_(item && item.paymentStatus);
        if (!item) {
          return { state:"none", meate:"-", label:"예매 정보 없음", shortLabel:"예매 없음", desc:"예약 티켓이 연결되면 메아테 혜택 대상 여부가 표시돼요.", cardSmall:"메아테 안내", active:false, locked:true };
        }
        if (!confirmed) {
          return { state:"pending", meate:meate || "-", label:"입금 확인 후 메아테 혜택 확정", shortLabel:"확인 중", desc:"입금 확인 후, 예매 시 선택한 메아테 팀 기준으로 루미벨 혜택 대상 여부가 표시돼요.", cardSmall:"입금 확인 후 표시", active:false, locked:false };
        }
        if (hasMeate && isLumibelleMeate_(meate)) {
          return { state:"eligible", meate:meate, label:"루미벨 메아테 혜택 대상", shortLabel:"혜택 대상", desc:"Lumibelle 메아테 선택이 확인되어 루미벨 메아테 혜택 대상이에요. 현장 물판/특전회에서 스탭 확인 후 안내돼요.", cardSmall:"메아테 혜택 대상", active:true, locked:false };
        }
        return { state:"notEligible", meate:meate || "다른 팀", label:"루미벨 혜택 대상 아님", shortLabel:"대상 아님", desc:"이번 예매의 메아테는 " + (meate || "다른 팀") + " 기준이에요. 루미벨 메아테 혜택 대상은 아니지만, 공연 기록은 그대로 남아요.", cardSmall:"루미벨 혜택 대상 아님", active:false, locked:true };
      }

      function updateTextIfExists_(root, selector, text) {
        var el = root && root.querySelector ? root.querySelector(selector) : null;
        if (el) el.textContent = text;
      }

      function findTicketBenefitItemByTitle_(titleText) {
        var list = document.querySelector("#ticket-benefit .ticket-paged-list");
        if (!list) return null;
        return Array.from(list.querySelectorAll(".ticket-page-item")).find(function(item) {
          var title = item.querySelector(".ticket-title, .plain-row b, b");
          return title && String(title.textContent || "").trim().indexOf(titleText) >= 0;
        }) || null;
      }

      function updateMeateBenefitUi(reservations) {
        var normalized = Array.isArray(reservations) ? reservations.map(normalizeReservationItem) : [];
        var current = normalized.filter(function(item) { return !isPastReservation(item); });
        var item = current[0] || normalized[0] || null;
        var state = meateBenefitState(item);

        try {
          var pcBtn = document.querySelector('#ticket-pc-benefit [data-perk="meate"]');
          var pcCard = pcBtn ? pcBtn.closest(".ticket-pc-wallet-card") : null;
          if (pcCard) {
            pcCard.classList.toggle("is-locked", Boolean(state.locked));
            updateTextIfExists_(pcCard, "small", state.cardSmall);
            updateTextIfExists_(pcCard, "b", "메아테 특전권");
            var desc = Array.from(pcCard.children).find(function(el) { return el.tagName === "SPAN"; });
            if (desc) desc.textContent = state.desc;
            var statusSpan = pcCard.querySelector(".ticket-pc-card-actions span");
            if (statusSpan) {
              statusSpan.textContent = state.active ? "사용 가능" : state.shortLabel;
              statusSpan.classList.toggle("active", Boolean(state.active));
            }
          }
        } catch(e) {}

        try {
          var mobileItem = findTicketBenefitItemByTitle_("메아테");
          if (mobileItem) {
            var titleEl = mobileItem.querySelector(".ticket-title, .plain-row b, b");
            if (titleEl) titleEl.textContent = "메아테 특전권";
            var subEl = mobileItem.querySelector(".ticket-sub, .plain-row span");
            if (subEl) subEl.textContent = state.desc;
            var smallEl = mobileItem.querySelector(".ticket-kicker, small");
            if (smallEl) smallEl.textContent = state.cardSmall;
            var statusCells = Array.from(mobileItem.querySelectorAll(".ticket-cell"));
            statusCells.forEach(function(cell) {
              var small = cell.querySelector("small");
              var b = cell.querySelector("b");
              if (!small || !b) return;
              var label = String(small.textContent || "").trim();
              if (label === "상태" || label === "STATUS") b.textContent = state.label;
              if (label === "메아테" || label === "MEATE") b.textContent = state.meate;
              if (label === "혜택" || label === "BENEFIT") b.textContent = state.shortLabel;
            });
            var chips = Array.from(mobileItem.querySelectorAll("button, .btn, .status-chip, .mail-status-chip, .ticket-chip"));
            var statusChip = chips.find(function(el) { return String(el.textContent || "").indexOf("상세") < 0; });
            if (statusChip) {
              statusChip.textContent = state.active ? "사용 가능" : state.shortLabel;
              statusChip.classList.toggle("active", Boolean(state.active));
            }
          }
        } catch(e) {}
      }

      function reservationStatusLabel(status) {
        const key = String(status || "").toLowerCase();
        if (key === "cancelled" || key === "canceled") return "예약 취소";
        if (key === "checkedin") return "입장 완료";
        if (key === "reserved") return "예약 접수";
        return status || "예약 접수";
      }

      function ticketHref(item) {
        if (!item.eventId) return "#";
        return "/ticket/?eventId=" + encodeURIComponent(item.eventId);
      }

      function reservationTicketHtml(item) {
        const href = ticketHref(item);
        const entryCode = getEntryCode_(item.reservationNumber || "");
        const paymentSt = ticketStatusLabel(item);
        const entrySt   = isEntryDone(item) ? "입장완료" : "미입장";
        return '<article class="ticket-card lumi-pass">' +
          '<div class="ticket-inner">' +
          '<div class="lumi-pass-top">' +
            '<div class="lumi-pass-label">LUMI PASS · E-TICKET</div>' +
            '<div class="lumi-pass-date">' + escapeHtml(formatTicketDate(item.eventDate)) + '<br>' +
            (item.openTime ? 'OPEN ' + escapeHtml(item.openTime) + ' · ' : '') +
            'START ' + escapeHtml(item.startTime || "18:00") + '</div>' +
          '</div>' +
          '<div class="lumi-pass-title">LUMI PASS</div>' +
          '<div class="lumi-pass-sub">Stardust Admission Ticket · ' + escapeHtml(item.eventTitle) + '</div>' +
          '<div class="lumi-pass-place">' + escapeHtml(paymentSt) + ' · ' + escapeHtml(entrySt) + (item.meate ? ' · 메아테 ' + escapeHtml(item.meate) : '') + '</div>' +
          '<div class="lumi-entry-box"><small>ENTRY NO.</small><strong>' + escapeHtml(entryCode || item.reservationNumber) + '</strong></div>' +
          '<div class="ticket-meta">' +
            '<div class="ticket-cell"><small>RESERVATION</small><b>' + escapeHtml(paymentSt) + '</b></div>' +
            '<div class="ticket-cell"><small>STATUS</small><b>' + escapeHtml(entrySt) + '</b></div>' +
            '<div class="ticket-cell"><small>MEATE</small><b>' + escapeHtml(item.meate || "-") + '</b></div>' +
            '<div class="ticket-cell"><small>BENEFIT</small><b>' + escapeHtml(meateBenefitState(item).shortLabel) + '</b></div>' +
          '</div>' +
          '</div>' +
          '</article>';
      }

      function pastTicketHtml(item) {
        const href = ticketHref(item);
        return '<article class="plain-row">' +
          '<b>' + escapeHtml(item.eventTitle) + '</b>' +
          '<span>' + escapeHtml(item.eventDate || "날짜 확인 중") + ' · ' + escapeHtml(item.venueName) + '<br>예약번호 ' + escapeHtml(item.reservationNumber) + ' · ' + escapeHtml(paymentLabel(item.paymentStatus)) + '</span>' +
          '<a class="btn sub ticket-api-link" href="' + escapeHtml(href) + '">추억 보기</a>' +
          '</article>';
      }

      function pcCurrentTicketHtml(item) {
        const href = ticketHref(item);
        const entryCode = getEntryCode_(item.reservationNumber || "");
        const statusLabel = (isEntryDone(item) ? "입장완료" : paymentLabel(item.paymentStatus)) +
          " / " + (isEntryDone(item) ? "입장완료" : "미입장");
        return '<h3>현재 예약 티켓</h3>' +
          '<article class="ticket-pc-pass ticket-pc-stardust">' +
          '<div class="ticket-pc-pass-inner">' +
          '<div class="ticket-pc-top">' +
            '<span class="ticket-pc-label">LUMI PASS · E-TICKET</span>' +
            '<span class="ticket-pc-date">' + escapeHtml(formatTicketDate(item.eventDate)) + '<br>' +
            (item.openTime ? 'OPEN ' + escapeHtml(item.openTime) + ' · ' : '') +
            'START ' + escapeHtml(item.startTime || "18:00") + '</span>' +
          '</div>' +
          '<div class="ticket-pc-title-en">LUMI PASS</div>' +
          '<div class="ticket-pc-title-ko">' + escapeHtml(item.eventTitle) + '</div>' +
          '<div class="ticket-pc-place">' + escapeHtml(item.venueName || "") + '</div>' +
          '<div class="ticket-pc-entry"><small>ENTRY NO.</small><strong>' + escapeHtml(entryCode || item.reservationNumber) + '</strong></div>' +
          '<div class="ticket-pc-note">이 티켓은 루미벨의 이야기에 들어가는 작은 초대장입니다.<br>입장 시 현장 확인 시 입장번호를 보여주세요.</div>' +
          '<div class="ticket-pc-meta">' +
            '<div><small>RESERVATION</small><b>' + escapeHtml(item.reservationNumber) + '</b></div>' +
            '<div><small>MEATE</small><b>' + escapeHtml(item.meate || "-") + '</b></div>' +
            '<div><small>TYPE</small><b>' + escapeHtml(item.ticketType || "사전예약") + '</b></div>' +
            '<div><small>STATUS</small><b>' + escapeHtml(statusLabel) + '</b></div>' +
          '</div>' +
          '<div class="ticket-pc-qr"><i>▣</i><p><b>QR은 보조 확인용입니다.</b><br>입장 확인은 예약번호/입장번호/닉네임 기준으로 진행됩니다.</p></div>' +
          '<div class="ticket-pc-chips"><span>QR은 보조 확인용</span><span>현장에서 제시</span><span>' + escapeHtml(meateBenefitState(item).label) + '</span></div>' +
          '</div>' +
          '</article>';
      }

      function getEntryCode_(reservationNumber) {
        var digits = String(reservationNumber || "").replace(/\D/g, "");
        return digits ? digits.slice(-4) : "";
      }

      function formatTicketDate(dateStr) {
        if (!dateStr) return "";
        var d = new Date(dateStr);
        if (isNaN(d.getTime())) return String(dateStr);
        var days = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
        var y = d.getFullYear();
        var m = String(d.getMonth()+1).padStart(2,"0");
        var day = String(d.getDate()).padStart(2,"0");
        return y + "." + m + "." + day + " " + days[d.getDay()];
      }

      function pcPastTicketHtml(item) {
        const href = ticketHref(item);
        return '<article class="ticket-pc-wallet-card">' +
          '<small>' + escapeHtml(item.eventDate || "날짜 확인 중") + '</small>' +
          '<b>' + escapeHtml(item.eventTitle) + '</b>' +
          '<span>' + escapeHtml(item.venueName) + '<br>예약번호 ' + escapeHtml(item.reservationNumber) + '</span>' +
          '<div class="ticket-pc-card-actions"><a href="' + escapeHtml(href) + '">추억 보기</a><span>' + escapeHtml(paymentLabel(item.paymentStatus)) + '</span></div>' +
          '</article>';
      }

      // PATCH 51-41: 홈 예약 카드가 API 로드 전/timeout 때 "없음"으로 깜빡이지 않게 안정화
      function updateHomeReservationLoading() {
        const ticketCard = document.querySelector(".home-grid .home-card.no-icon.pass");
        const summaryCard = Array.from(document.querySelectorAll(".home-grid .home-card.no-icon")).find((card) => {
          return card !== ticketCard && card.id !== "homeMessageCard" && card.textContent.indexOf("현재 예약") !== -1;
        });

        if (ticketCard) {
          const small = ticketCard.querySelector("small");
          const title = ticketCard.querySelector("b");
          const desc = ticketCard.querySelector("span");
          if (small) small.textContent = "티켓 확인 중";
          if (title) title.textContent = "예약 정보를 불러오는 중…";
          if (desc) desc.textContent = "확인되는 즉시 티켓함에 표시돼요.";
        }

        if (summaryCard) {
          const small = summaryCard.querySelector("small");
          const title = summaryCard.querySelector("b");
          const desc = summaryCard.querySelector("span");
          if (small) small.textContent = "현재 예약 확인 중";
          if (title) title.textContent = "예약 정보를 확인하고 있어요.";
          if (desc) desc.textContent = "잠시 후 자동으로 갱신돼요.";
        }
      }

      function updateHomeReservationSummary(reservations) {
        const normalized = (reservations || []).map(normalizeReservationItem);
        const current = normalized.filter((item) => !isPastReservation(item));
        const item = current[0] || null;

        const ticketCard = document.querySelector(".home-grid .home-card.no-icon.pass");
        const summaryCard = Array.from(document.querySelectorAll(".home-grid .home-card.no-icon")).find((card) => {
          return card !== ticketCard && card.id !== "homeMessageCard" && card.textContent.indexOf("현재 예약") !== -1;
        });

        if (ticketCard) {
          const small = ticketCard.querySelector("small");
          const title = ticketCard.querySelector("b");
          const desc = ticketCard.querySelector("span");
          if (item) {
            if (small) small.textContent = isEntryDone(item) ? "입장 완료" : ticketStatusLabel(item);
            if (title) title.textContent = item.reservationNumber || "예약번호 확인 중";
            if (desc) desc.textContent = (item.eventTitle || "공연명 확인 중") + " · " + (item.eventDate || "날짜 확인 중");
          } else if (reservationsLoadState !== "loaded") {
            if (small) small.textContent = "티켓 확인 중";
            if (title) title.textContent = "예약 정보를 불러오는 중…";
            if (desc) desc.textContent = "확인되는 즉시 티켓함에 표시돼요.";
          } else {
            if (small) small.textContent = "예약된 공연 없음";
            if (title) title.textContent = "티켓 준비 중";
            if (desc) desc.textContent = "예매가 확인되면 입장 확인용 번호가 이곳에 표시돼요.";
          }
        }

        if (summaryCard) {
          const small = summaryCard.querySelector("small");
          const title = summaryCard.querySelector("b");
          const desc = summaryCard.querySelector("span");
          if (item) {
            if (small) small.textContent = "현재 예약 " + String(current.length) + "건";
            if (title) title.textContent = item.eventTitle || "공연명 확인 중";
            if (desc) desc.textContent = (item.venueName || "공연장 확인 중") + " · " + paymentLabel(item.paymentStatus);
          } else if (reservationsLoadState !== "loaded") {
            if (small) small.textContent = "현재 예약 확인 중";
            if (title) title.textContent = "예약 정보를 확인하고 있어요.";
            if (desc) desc.textContent = "잠시 후 자동으로 갱신돼요.";
          } else {
            if (small) small.textContent = "현재 예약";
            if (title) title.textContent = "예약된 공연이 없어요.";
            if (desc) desc.textContent = "예매가 확인되면 티켓함에 표시돼요.";
          }
        }
      }

      function renderMyReservations(reservations) {
        if (reservationsLoadState !== "loading") reservationsLoadState = "loaded";
        const normalized = (reservations || []).map(normalizeReservationItem);
        appendBootDebug("render: normalized=" + normalized.length);
        const current = normalized.filter((item) => !isPastReservation(item));
        const past = normalized.filter(isPastReservation).sort((a, b) => String(b.eventEndAt || b.eventDate || "").localeCompare(String(a.eventEndAt || a.eventDate || "")));
        appendBootDebug("render: current=" + current.length + " past=" + past.length + (normalized[0] ? " date=" + normalized[0].eventDate : ""));

        const currentList = document.querySelector("#ticket-current .ticket-paged-list");
        if (currentList) {
          currentList.innerHTML = current.length
            ? current.map((item) => '<div class="ticket-page-item">' + reservationTicketHtml(item) + '</div>').join("")
            : '<div class="ticket-page-item"><article class="info-card"><small>예약 없음</small><b>아직 연결된 예매 내역이 없습니다.</b><span>루미 ID로 예매가 연결되면 이곳에 현재 티켓이 표시돼요.</span></article></div>';
        }

        const pastList = document.querySelector("#ticket-past .ticket-paged-list");
        if (pastList) {
          pastList.innerHTML = past.length
            ? past.map((item) => '<div class="ticket-page-item">' + pastTicketHtml(item) + '</div>').join("")
            : '<div class="ticket-page-item"><article class="plain-row"><b>지난 티켓 없음</b><span>공연이 끝난 뒤 연결된 예매 기록이 이곳에 보관돼요.</span></article></div>';
        }

        const pcCurrent = document.querySelector(".ticket-pc-current-section");
        if (pcCurrent) {
          pcCurrent.innerHTML = current.length
            ? pcCurrentTicketHtml(current[0])
            : '<h3>현재 예약 티켓</h3><article class="info-card"><small>예약 없음</small><b>아직 연결된 예매 내역이 없습니다.</b><span>루미 ID로 예매가 연결되면 이곳에 입장 확인용 티켓이 표시돼요.</span></article>';
        }

        const pcPastGrid = document.querySelector("#ticket-pc-past .ticket-pc-wallet-grid");
        if (pcPastGrid) {
          pcPastGrid.innerHTML = past.length
            ? past.map(pcPastTicketHtml).join("")
            : '<article class="ticket-pc-wallet-card is-locked"><small>지난 티켓</small><b>공연 후 기록 예정</b><span>종료된 공연 티켓은 공연이 끝난 뒤 이곳에 저장돼요.</span><div class="ticket-pc-card-actions"><span>대기</span><span>기록 예정</span></div></article>';
        }

        updateHomeReservationSummary(normalized);
        updateMeateBenefitUi(normalized); // PATCH 51-51: 예약 meate/paymentStatus 기반 혜택 표시
        initTicketPagers();
      }

      function renderReservationsLoading() {
        reservationsLoadState = "loading";
        updateHomeReservationLoading();
        const loadingHtml = '<div class="ticket-page-item"><article class="info-card"><small>잠시만요</small><b>티켓 불러오는 중...</b><span>예매 정보를 확인하고 있어요.</span></article></div>';
        const el1 = document.querySelector("#ticket-current .ticket-paged-list");
        const el2 = document.querySelector(".ticket-pc-current-section");
        if (el1) el1.innerHTML = loadingHtml;
        if (el2) el2.innerHTML = '<h3>현재 예약 티켓</h3>' + loadingHtml;
      }

      async function loadMyMessages(lumiId) {
        try {
          const messages = await getMyMessages(lumiId);
          // getMyMessages는 항상 배열을 반환하거나 throw — 비배열 분기는 방어용
          const safeMessages = Array.isArray(messages) ? messages : [];
          if (DEBUG_MODE) console.log("[lumi] loadMyMessages: messages arrived, count=", safeMessages.length);
          const publicMessages = safeMessages.filter((item) => {
            const member = String(item && item.senderMember || "").toLowerCase();
            return member !== "iro" && member !== "lunar" && member !== "luna";
          });
          const normalized = publicMessages.map(normalizeLumiMessageItem);
          const mailItems = normalized.filter((item) => item.channel === "mail");
          const smsItems = publicMessages
            .filter((item) => getLumiMessageChannel(item) === "message")
            .map(normalizeSmsItem);
          if (DEBUG_MODE) console.log("[lumi] loadMyMessages split: mail=", mailItems.length, "| sms=", smsItems.length);
          // API 성공 — 빈 배열이어도 캐시 버리고 실제 결과로 확정 (유령 알림 방지)
          LUMI_MESSAGES_LOAD_DONE = true;
          LUMI_RUNTIME_MAIL_ITEMS = mailItems;
          LUMI_RUNTIME_MESSAGE_ITEMS = smsItems;
          window.__lumiRuntimeMessageItems = LUMI_RUNTIME_MESSAGE_ITEMS;
          window.__lumiRuntimeMailItems = LUMI_RUNTIME_MAIL_ITEMS;
          window.__lumiMessagesLoadDone = true;
          cacheWrite_(lumiId, "mail", mailItems);
          cacheWrite_(lumiId, "sms",  smsItems);
          mailState.inbox.page = 0;
          mailState.saved.page = 0;
          renderMailAll();
          if (typeof window.showLumiMessageInbox === "function") window.showLumiMessageInbox();
          if (typeof window.__lumiRefreshMessageList === "function") window.__lumiRefreshMessageList();
          appendBootDebug(safeMessages.length === 0
            ? "messages empty from API: cache cleared"
            : "messages UI split applied: mail=" + mailItems.length + " sms=" + smsItems.length);
        } catch (error) {
          const errMsg = String(error && error.message ? error.message : error);
          if (DEBUG_MODE) console.error("[lumi] loadMyMessages catch:", errMsg);
          // missingApiEndpoint → 500ms 뒤 재시도 1회
          if (errMsg === "missingApiEndpoint" && window.LUMI_API_ENDPOINT) {
            appendBootDebug("missingApiEndpoint → retry in 500ms (window value found)");
            setTimeout(function() { loadMyMessages(lumiId); }, 500);
            return;
          }
          // timeout/네트워크 에러: loadDone 확정하되 캐시 유지 (기존 정책)
          LUMI_MESSAGES_LOAD_DONE = true;
          window.__lumiMessagesLoadDone = true;
          appendBootDebug("message load error (cache kept): " + errMsg);
          if (!Array.isArray(LUMI_RUNTIME_MAIL_ITEMS) || LUMI_RUNTIME_MAIL_ITEMS.length === 0) {
            LUMI_RUNTIME_MAIL_ITEMS = [];
            window.__lumiRuntimeMailItems = [];
            LUMI_RUNTIME_MESSAGE_ITEMS = LUMI_RUNTIME_MESSAGE_ITEMS || [];
            window.__lumiRuntimeMessageItems = window.__lumiRuntimeMessageItems || [];
            renderMailAll();
          }
          // 캐시가 있으면 기존 UI 유지 (에러/타임아웃 시에만)
        }
      }

      async function loadMyReservations(lumiId) {
        try {
          // PATCH 51-41: 캐시/기존 예약 화면이 있으면 로딩 카드로 덮어쓰지 않음
          if (!Array.isArray(myReservations) || myReservations.length === 0) {
            renderReservationsLoading();
          }
          const reservations = await getMyReservations(lumiId);
          reservationsLoadState = "loaded";
          myReservations = reservations;
          cacheWrite_(lumiId, "reservations", reservations); // PATCH 51-36: 캐시 저장
          renderMyReservations(myReservations);
        } catch (error) {
          const errMsg = String(error && error.message ? error.message : error);
          appendBootDebug("reservation UI error: " + errMsg);
          // PATCH 51-41: 에러/timeout 시 캐시가 있으면 유지, 없으면 "없음"으로 확정하지 않음
          if (!myReservations || myReservations.length === 0) {
            reservationsLoadState = "error";
            updateHomeReservationLoading();
            appendBootDebug("reservation error without cache: keep loading/soft state");
          } else {
            appendBootDebug("keeping cached reservations after error");
            renderMyReservations(myReservations); // 캐시 유지 렌더
          }
          if (errMsg === "missingApiEndpoint") {
            showMessage("루미폰 API 주소가 아직 설정되지 않았어요. LUMI_API_ENDPOINT를 Apps Script 웹앱 URL로 설정해 주세요.");
          }
        }
      }

      // ── PATCH 51-47: 숙제체키 ────────────────────────────────

      // 멤버 라벨/아이콘 매핑
      function chekiMemberLabel(member) {
        var m = String(member || "").trim().toLowerCase();
        if (m === "mariring" || m === "마리링") return "마리링 🎀⭐";
        if (m === "lulu" || m === "루루")       return "루루 🍼🐰";
        return member || "루미벨";
      }

      // 상태 배지 레이블
      function chekiStatusLabel(status) {
        var s = String(status || "").trim();
        if (s === "접수됨")   return { label: "접수됨",   cls: "status-pending" };
        if (s === "준비 중")  return { label: "준비 중",  cls: "status-progress" };
        if (s === "수령 가능") return { label: "수령 가능", cls: "status-ready" };
        if (s === "수령 완료") return { label: "수령 완료", cls: "status-done" };
        return { label: s || "대기 중", cls: "status-pending" };
      }

      function renderHomeworkCheki(items) {
        const list = items || [];

        // ── 홈 요약 카드 업데이트 (기존 home-card 구조 유지, 숫자/텍스트만 교체)
        const readyCount = list.filter(function(c) {
          return String(c.status || "").trim() === "수령 가능";
        }).length;
        try {
          const homeCards = document.querySelectorAll(".home-card.no-icon");
          homeCards.forEach(function(card) {
            const small = card.querySelector("small");
            if (small && small.textContent.includes("숙제체키")) {
              const b    = card.querySelector("b");
              const span = card.querySelector("span");
              if (b) b.textContent = readyCount + "장";
              if (span) {
                const pendingCount = list.filter(function(c) {
                  return String(c.status || "").trim() !== "수령 완료";
                }).length;
                span.textContent = pendingCount > 0
                  ? "준비 중 " + pendingCount + "장 · 상태는 숙제체키 탭에서 확인"
                  : "신청 내역이 확인되면 이곳에 표시돼요.";
              }
            }
          });
        } catch(e) {}

        // ── 숙제체키 탭 렌더 (최종 안정본 구조: homework-main-card / dl.homework-info-list)
        const mainCard   = document.querySelector(".homework-main-card");
        const pickupCard = document.querySelector(".homework-pickup-card");
        if (!mainCard) return;

        if (list.length === 0) {
          // 비어 있을 때 — 안정본 기본 구조 유지
          mainCard.innerHTML =
            '<div class="homework-main-head">' +
              '<strong>숙제체키 없음</strong>' +
              '<span class="homework-code">대기 중</span>' +
            '</div>' +
            '<dl class="homework-info-list">' +
              '<div><dt>안내</dt><dd>신청한 숙제체키가 있으면 이곳에 표시돼요.</dd></div>' +
            '</dl>';
          if (pickupCard) pickupCard.style.display = "none";
          return;
        }

        // 항목이 있을 때 — 첫 번째 항목을 main-card에, 나머지는 뒤에 추가
        mainCard.innerHTML = list.map(function(item, idx) {
          var st     = chekiStatusLabel(item.status);
          var member = chekiMemberLabel(item.member);
          var rows   = [];
          if (item.requestedAt) rows.push('<div><dt>접수일</dt><dd>' + escapeHtml(item.requestedAt.slice(0,10).replace(/-/g,".")) + '</dd></div>');
          rows.push('<div><dt>상태</dt><dd>' + escapeHtml(item.status || "대기 중") + '</dd></div>');
          if (item.receivePlan)   rows.push('<div><dt>수령 예정</dt><dd>' + escapeHtml(item.receivePlan)   + '</dd></div>');
          if (item.receiveMethod) rows.push('<div><dt>수령 방식</dt><dd>' + escapeHtml(item.receiveMethod) + '</dd></div>');
          if (item.controlNo)     rows.push('<div><dt>관리번호</dt><dd>'  + escapeHtml(item.controlNo)     + '</dd></div>');
          if (item.note)          rows.push('<div><dt>메모</dt><dd>'       + escapeHtml(item.note)          + '</dd></div>');
          return (idx > 0 ? '<hr style="margin:10px 0;border:none;border-top:1px solid #f0d6e8">' : '') +
            '<div class="homework-main-head">' +
              '<strong>' + escapeHtml(member) + '</strong>' +
              '<span class="homework-code">' + escapeHtml(item.homeworkChekiId || "") + '</span>' +
            '</div>' +
            '<dl class="homework-info-list">' + rows.join("") + '</dl>';
        }).join("");

        // 수령 가능이면 pickup 안내 표시, 아니면 숨김
        if (pickupCard) {
          if (readyCount > 0) {
            pickupCard.style.display = "";
            pickupCard.innerHTML =
              '<strong>수령 안내</strong>' +
              '<p>상태가 수령 가능으로 바뀌면 다음 루미벨 특전회/물판에서 확인 후 받을 수 있어요. 현장에서는 루미 ID 또는 닉네임을 보여주세요.</p>';
          } else {
            pickupCard.style.display = "none";
          }
        }
      }

      async function loadMyCheki(lumiId) {
        try {
          const response = await fetchLumiApi({ action: "lumiGetHomeworkCheki", lumiId: lumiId });
          if (!response || response.ok !== true) {
            appendBootDebug("cheki load failed: " + String((response && (response.error || response.message)) || "failed"));
            return;
          }
          const items = Array.isArray(response.cheki) ? response.cheki : [];
          cacheWrite_(lumiId, "cheki", items); // 캐시 저장
          renderHomeworkCheki(items);
          appendBootDebug("cheki loaded: " + items.length + " items");
        } catch (error) {
          const errMsg = String(error && error.message ? error.message : error);
          appendBootDebug("cheki error: " + errMsg);
          // 에러 시 기존 캐시 유지 (renderHomeworkCheki 재호출 안 함)
        }
      }
      // ─────────────────────────────────────────────────────────

      // ── PATCH 51-48: 특전권 / 이벤트권 / Birthday Ticket ──────

      const LUMI_TICKET_MEMBER_LABELS = {
        mariring: "마리링 🎀⭐",
        lulu:     "루루 🍼🐰",
        team:     "루미벨 전체",
        system:   "루미벨"
      };
      const LUMI_TICKET_HIDDEN_MEMBERS = new Set(["iro", "lunar", "luna"]);
      const LUMI_TICKET_TYPE_LABELS = {
        welcome:  "신규 이벤트",
        join:     "합류 이벤트",
        birthday: "생일",
        meate:    "메아테",
        event:    "이벤트",
        general:  "일반"
      };
      const LUMI_TICKET_STATUS_LABELS = {
        available:  "사용 가능",
        used:       "사용 완료",
        expired:    "만료",
        pending:    "확인 중",
        cancelled:  "취소"
      };

      function lumiTicketMemberName(member) {
        var m = String(member || "").trim().toLowerCase();
        if (LUMI_TICKET_HIDDEN_MEMBERS.has(m)) return "공개 예정 멤버";
        return LUMI_TICKET_MEMBER_LABELS[m] || member || "루미벨";
      }

      function renderLumiTickets(items) {
        const list = items || [];
        const available = list.filter(function(t) { return t.status === "available"; }).length;

        // ── 홈 요약 카드 (기존 DOM 구조 유지, 숫자/문구만 교체)
        try {
          const noIconCards = Array.from(document.querySelectorAll(".home-grid .home-card.no-icon"));
          const ticketSummaryCard = noIconCards.find(function(card) {
            var small = card.querySelector("small");
            return small && (small.textContent.includes("보유 티켓") || small.textContent.includes("특전권"));
          });
          if (ticketSummaryCard) {
            var b    = ticketSummaryCard.querySelector("b");
            var span = ticketSummaryCard.querySelector("span");
            if (b) b.textContent = available + "장";
            if (span) span.textContent = available > 0
              ? "사용 가능 " + available + "장 · 티켓함에서 확인"
              : "보유 티켓이 생기면 이곳에 표시돼요.";
          }
        } catch(e) {}

        // ── PC #ticket-pc-benefit: data-perk 속성으로 카드 찾아서 상태만 업데이트
        // 전체 innerHTML 교체 금지 — 기존 4카드(welcome/join/meate/birthday) 구조 유지
        try {
          var pcGrid = document.querySelector("#ticket-pc-benefit .ticket-pc-wallet-grid");
          if (pcGrid) {
            // ticketType → data-perk 매핑
            var perkMap = { welcome:"welcome", join:"join", meate:"meate", birthday:"birthday", event:"welcome", general:"welcome" };
            list.forEach(function(t) {
              var perk = perkMap[t.ticketType] || t.ticketType;
              var card = pcGrid.querySelector('[data-perk="' + perk + '"]');
              if (!card) return;
              var cardEl = card.closest(".ticket-pc-wallet-card");
              if (!cardEl) return;
              var statusEl = cardEl.querySelector(".ticket-pc-card-actions span");
              var smallEl  = cardEl.querySelector("small");
              var spanEl   = cardEl.querySelector("b + span, small + b + span, span:not(.ticket-pc-card-actions span)");
              // is-locked 해제 (available)
              if (t.status === "available") {
                cardEl.classList.remove("is-locked");
                if (statusEl) { statusEl.textContent = "사용 가능"; statusEl.className = "active"; }
              } else if (t.status === "used") {
                cardEl.classList.remove("is-locked");
                if (statusEl) { statusEl.textContent = "사용 완료"; statusEl.className = ""; }
              } else if (t.status === "pending") {
                cardEl.classList.remove("is-locked");
                if (statusEl) { statusEl.textContent = "확인 중"; statusEl.className = ""; }
              }
              // small 레이블 갱신
              if (smallEl && t.source) {
                var typeLabel = LUMI_TICKET_TYPE_LABELS[t.ticketType] || "";
                if (typeLabel) smallEl.textContent = typeLabel;
              }
              // span 설명 갱신 (note 있으면)
              if (t.note) {
                var descEl = cardEl.querySelector("span:not(.ticket-pc-card-actions span):not([class])");
                if (descEl) descEl.textContent = lumiTicketMemberName(t.member) + " · " + t.note;
              }
            });
          }
        } catch(e) {}

        // ── 모바일 #ticket-benefit: 기존 ticket-page-item들의 카드 상태만 업데이트
        // ticket-paged-list 전체 innerHTML 교체 금지
        // Welcome Ticket(이벤트), Birthday Ticket(생일) 카드는 이미 HTML에 있음
        // → API 데이터로 상태 셀만 갱신
        try {
          var benefitList = document.querySelector("#ticket-benefit .ticket-paged-list");
          if (!benefitList) return;

          // ticketType → category 매핑 (data-ticket-category 값 기준)
          var categoryMap = {
            welcome:  "이벤트",
            join:     "이벤트",
            birthday: "생일",
            meate:    "메아테",
            event:    "이벤트",
            general:  "이벤트"
          };
          // ticketType → ticket-title 텍스트로 카드 찾기
          var titleMap = {
            welcome:  "Welcome Ticket",
            join:     "Join Ticket",
            birthday: "Birthday Ticket",
            meate:    "메아테 특전권"
          };

          list.forEach(function(t) {
            var expectedTitle = titleMap[t.ticketType];
            if (!expectedTitle) return; // 매핑 없는 타입은 skip

            // 해당 제목의 카드 찾기
            var allItems = Array.from(benefitList.querySelectorAll(".ticket-page-item"));
            var targetItem = allItems.find(function(item) {
              var titleEl = item.querySelector(".ticket-title");
              return titleEl && titleEl.textContent.trim() === expectedTitle;
            });

            if (!targetItem) {
              // 카드가 없으면 — API 전용 신규 카드 추가 (기존 카드 구조로)
              var memberName  = lumiTicketMemberName(t.member);
              var statusLabel = LUMI_TICKET_STATUS_LABELS[t.status] || t.status || "";
              var expireText  = t.expireAt ? String(t.expireAt).slice(0,10).replace(/-/g,".") + "까지" : "제한 없음";
              var issuedText  = t.issuedAt ? String(t.issuedAt).slice(0,10).replace(/-/g,".") + " 지급" : "";
              var cat = categoryMap[t.ticketType] || "이벤트";
              var newItem = document.createElement("div");
              newItem.className = "ticket-page-item";
              newItem.dataset.ticketCategory = cat;
              newItem.innerHTML =
                '<article class="ticket-card soft"><div class="ticket-inner">' +
                  '<div class="ticket-kicker">SPECIAL TICKET</div>' +
                  '<div class="ticket-title">' + escapeHtml(t.ticketName || expectedTitle) + '</div>' +
                  '<div class="ticket-sub">' + escapeHtml(t.note || "") + '</div>' +
                  '<div class="ticket-meta">' +
                    '<div class="ticket-cell"><small>사용 가능 멤버</small><b>' + escapeHtml(memberName) + '</b></div>' +
                    '<div class="ticket-cell"><small>상태</small><b>' + escapeHtml(statusLabel) + '</b></div>' +
                    '<div class="ticket-cell"><small>유효기간</small><b>' + escapeHtml(expireText) + '</b></div>' +
                    (issuedText ? '<div class="ticket-cell"><small>지급일</small><b>' + escapeHtml(issuedText) + '</b></div>' : '') +
                  '</div>' +
                '</div></article>';
              benefitList.insertBefore(newItem, benefitList.firstChild);
              return;
            }

            // 기존 카드 찾음 → 상태 셀만 업데이트
            var statusCells = Array.from(targetItem.querySelectorAll(".ticket-cell"));
            statusCells.forEach(function(cell) {
              var smallEl = cell.querySelector("small");
              if (!smallEl) return;
              if (smallEl.textContent === "상태") {
                var bEl = cell.querySelector("b");
                if (bEl) bEl.textContent = LUMI_TICKET_STATUS_LABELS[t.status] || t.status || "";
              }
              if (smallEl.textContent === "사용 가능 멤버") {
                var bEl = cell.querySelector("b");
                if (bEl) bEl.textContent = lumiTicketMemberName(t.member);
              }
              if (smallEl.textContent === "유효기간" && t.expireAt) {
                var bEl = cell.querySelector("b");
                if (bEl) bEl.textContent = String(t.expireAt).slice(0,10).replace(/-/g,".") + "까지";
              }
            });
          });
        } catch(e) {}
      }

      async function loadMyLumiTickets(lumiId) {
        try {
          const response = await fetchLumiApi({ action: "lumiGetMyTickets", lumiId: lumiId });
          if (!response || response.ok !== true) {
            appendBootDebug("lumiTickets load failed: " + String((response && (response.error || response.message)) || "failed"));
            return;
          }
          const items = Array.isArray(response.tickets) ? response.tickets : [];
          cacheWrite_(lumiId, "lumiTickets", items);
          renderLumiTickets(items);
          appendBootDebug("lumiTickets loaded: " + items.length + " items");
        } catch (error) {
          appendBootDebug("lumiTickets error: " + String(error && error.message ? error.message : error));
        }
      }
      // ──────────────────────────────────────────────────────────

      // ── PATCH 51-49: 루미 체크인 / 스탬프 ─────────────────────
      // visits(라이브 방문)와 완전히 분리. checkins는 특전권 사용 후 촬영·교류 특전 참여 기록.

      function renderCheckins(data) {
        if (!data) return;
        var totalStamps  = parseInt(data.totalStamps  || 0, 10);
        var checkinCount = parseInt(data.checkinCount || 0, 10);
        var cycle        = parseInt(data.cycle        || 1, 10);   // 현재 회차
        var cycleStamps  = parseInt(data.cycleStamps  || 0, 10);   // 현재 회차 스탬프 수
        var maxPerCycle  = 20;

        // PATCH 51-52-fix3: PC stamp restore renderer가 늦게 실행되며 STAMP_COUNT=0으로
        // 스탬프 그리드를 다시 그리는 문제 방지. checkins 기준 값을 window에 공유한다.
        try {
          window.__lumiStampTotalStamps = totalStamps;
          window.__lumiStampCheckinCount = checkinCount;
          window.__lumiStampCycle = cycle;
          window.__lumiStampCycleStamps = cycleStamps;
          // PATCH 51-57-fix5: 기록 타임라인도 checkins를 읽을 수 있게 공유한다.
          window.__lumiRecordCheckins = Array.isArray(data.checkins) ? data.checkins : [];
          if (typeof window.__lumiRefreshRecordTimeline === "function") {
            window.__lumiRefreshRecordTimeline(window.__lumiRecordCheckins);
          }
        } catch(e) {}

        // ── 기록탭 stat 카드 (record-stat-card) — 기존 DOM 유지, 숫자만 교체
        try {
          var statCards = Array.from(document.querySelectorAll(".record-stat-card"));
          statCards.forEach(function(card) {
            var small = card.querySelector("small");
            var b     = card.querySelector("b");
            if (!small || !b) return;
            if (small.textContent.trim() === "체크인") b.textContent = checkinCount + "회";
            if (small.textContent.trim() === "스탬프")  b.textContent = totalStamps  + "개";
          });
        } catch(e) {}

        // PATCH 51-57-fix4: 프로필 요약의 스탬프/나의 루미 기록도 checkins 기준으로 동기화한다.
        try {
          var profileStats = Array.from(document.querySelectorAll(".profile-stat"));
          profileStats.forEach(function(card) {
            var small = card.querySelector("small");
            var b = card.querySelector("b");
            if (!small || !b) return;
            if ((small.textContent || "").trim() === "스탬프") {
              b.textContent = cycleStamps + "/" + maxPerCycle;
            }
          });
          var liveText = "0회";
          var recordStats = Array.from(document.querySelectorAll(".record-stat-card"));
          recordStats.forEach(function(card) {
            var small = card.querySelector("small");
            var b = card.querySelector("b");
            if (small && b && (small.textContent || "").trim() === "라이브") liveText = (b.textContent || "0회").trim();
          });
          Array.from(document.querySelectorAll(".profile-info-item")).forEach(function(item) {
            var title = item.querySelector("b");
            var span = item.querySelector("span:last-child");
            if (title && span && (title.textContent || "").trim() === "나의 루미 기록") {
              span.textContent = "라이브 " + liveText + " · 체크인 " + checkinCount + "회 · 스탬프 " + totalStamps + "개 · 온라인 연결 기록은 추억의 시간에서 확인할 수 있어요.";
            }
          });
        } catch(e) {}

        // PATCH 51-57-fix4: 포인트 탭의 스탬프 필터에도 루미 체크인/스탬프 기록을 안내용으로 표시한다.
        try {
          var timeline = document.getElementById("pointLedgerTimeline");
          if (timeline) {
            Array.from(timeline.querySelectorAll('[data-lumi-api-stamp="1"]')).forEach(function(node) { node.remove(); });
            var checkins = Array.isArray(data.checkins) ? data.checkins : [];
            checkins.filter(function(item) { return String(item.status || "active") === "active"; }).slice(0, 4).reverse().forEach(function(item) {
              var stampCount = parseInt(item.stampCount || 0, 10) || 0;
              if (stampCount <= 0) return;
              var rawDate = item.checkedInAt || item.checkedAt || "";
              var date = String(rawDate || "").slice(0, 10).replace(/-/g, ".");
              var title = item.eventTitle || "루미 체크인";
              var member = item.memberName || item.member || "";
              var article = document.createElement("article");
              article.className = "point-ledger-item";
              article.setAttribute("data-lumi-api-stamp", "1");
              article.setAttribute("data-point-category", "스탬프");
              article.setAttribute("data-point-title", "루미 체크인 스탬프");
              article.setAttribute("data-point-date", date || "");
              article.setAttribute("data-point-desc", title + (member ? " · " + member : "") + " · 스탬프 +" + stampCount + "개");
              article.innerHTML =
                '<span class="point-ledger-icon">🌸</span>' +
                '<time>' + escapeHtml(date || "기록") + '</time>' +
                '<b>루미 체크인 스탬프</b>' +
                '<span>' + escapeHtml(title + (member ? " · " + member : "")) + '</span>' +
                '<em>스탬프 +' + stampCount + '개</em>';
              timeline.insertBefore(article, timeline.firstChild);
            });
            if (typeof window.__lumiRefreshPointLedger === "function") window.__lumiRefreshPointLedger();
          }
        } catch(e) {}

        // ── 포인트 탭 요약 카드 (point-ledger-summary-card) 스탬프 수치
        try {
          var pointCards = Array.from(document.querySelectorAll(".point-ledger-summary-card"));
          pointCards.forEach(function(card) {
            var small = card.querySelector("small");
            var b     = card.querySelector("b");
            if (small && b && small.textContent.trim() === "스탬프") {
              b.textContent = cycleStamps + "개";
            }
          });
        } catch(e) {}

        // ── 모바일 스탬프 탭 (.stamp-status)
        try {
          var statusEl = document.querySelector(".stamp-status");
          if (statusEl) {
            var bEl    = statusEl.querySelector("b");
            var spanEl = statusEl.querySelector("span");
            if (bEl) bEl.textContent = cycle + "회차";
            if (spanEl) spanEl.textContent = "현재 스탬프 " + cycleStamps + " / " + maxPerCycle;
          }
          // 스탬프 칸 (stamp-cell) 채우기
          var cells = Array.from(document.querySelectorAll(".stamp-grid .stamp-cell"));
          cells.forEach(function(cell, idx) {
            var stamp = idx + 1;
            if (stamp <= cycleStamps) {
              cell.classList.add("done");
            } else {
              cell.classList.remove("done");
            }
          });
        } catch(e) {}

        // ── PC 스탬프 탭 (.stamp-pc-wrap)
        try {
          // status-chip
          var chip = document.querySelector(".stamp-pc-wrap .status-chip");
          if (chip) chip.textContent = cycle + "회차 " + cycleStamps + " / " + maxPerCycle;
          // progress bar
          var fill = document.querySelector(".stamp-pc-wrap .progress-fill");
          if (fill) fill.style.width = Math.round((cycleStamps / maxPerCycle) * 100) + "%";
          // pc-lead 텍스트
          var lead = document.querySelector(".stamp-pc-wrap .stamp-pc-lead");
          if (lead) {
            var nextMilestone = [5, 10, 15, 20].find(function(m) { return m > cycleStamps; });
            if (nextMilestone) {
              lead.textContent = "다음 혜택까지 " + (nextMilestone - cycleStamps) + "개 남았어요. 20개 달성 시 초기화가 아니라 " + cycle + "회차 완료로 기록됩니다.";
            } else {
              lead.textContent = cycle + "회차 완주 달성! 다음 회차로 이어집니다.";
            }
          }
          // PC 스탬프 그리드 (#stampGridPc)
          // PATCH 51-49-fix2: 최종 안정본의 꽃/별 도장 UI를 보존한다.
          // 기존 DOM을 숫자 1~20으로 재생성하지 말고, 기존 셀의 상태와 아이콘만 갱신한다.
          var pcGrid = document.getElementById("stampGridPc");
          if (pcGrid) {
            var pcCells = Array.from(pcGrid.children || []);
            pcCells.forEach(function(cell, idx) {
              var active = (idx + 1) <= cycleStamps;
              cell.classList.toggle("empty", !active);
              cell.classList.toggle("done", active);
              // 기존 셀이 숫자로 오염된 경우에도 꽃/별 UI로 되돌린다.
              if (/^\s*\d+\s*$/.test(cell.textContent || "")) {
                cell.textContent = active ? "🌸" : "✧";
              } else if (!String(cell.textContent || "").trim()) {
                cell.textContent = active ? "🌸" : "✧";
              } else if ((cell.textContent || "").indexOf("🌸") >= 0 || (cell.textContent || "").indexOf("✧") >= 0) {
                cell.textContent = active ? "🌸" : "✧";
              }
            });
          }
        } catch(e) {}
      }

      async function loadMyCheckins(lumiId) {
        try {
          const response = await fetchLumiApi({ action: "lumiGetMyCheckins", lumiId: lumiId });
          if (!response || response.ok !== true) {
            appendBootDebug("checkins load failed: " + String((response && (response.error || response.message)) || "failed"));
            return;
          }
          const data = Object.assign({}, response.summary || {}, { checkins: Array.isArray(response.checkins) ? response.checkins : [] });
          cacheWrite_(lumiId, "checkins", data);
          renderCheckins(data);
          appendBootDebug("checkins loaded: stamps=" + (data.totalStamps || 0) + " checkins=" + (data.checkinCount || 0));
        } catch (error) {
          appendBootDebug("checkins error: " + String(error && error.message ? error.message : error));
        }
      }
      // ──────────────────────────────────────────────────────────


      // ── PATCH 51-50: 포인트 3종 조회 / 표시 ───────────────────
      // merch(물판 포인트) / xp(반짝 XP) / site(홈페이지 포인트)는 절대 합산하지 않는다.

      function normalizePointPayload(data) {
        data = data || {};
        var totals = data.totals || {};
        return {
          totals: {
            merch: parseInt(totals.merch || 0, 10) || 0,
            xp: parseInt(totals.xp || 0, 10) || 0,
            site: parseInt(totals.site || 0, 10) || 0
          },
          points: Array.isArray(data.points) ? data.points : []
        };
      }

      function pointTypeLabel(type) {
        var key = String(type || "").trim().toLowerCase();
        if (key === "merch") return "물판 포인트";
        if (key === "xp") return "반짝 XP";
        if (key === "site") return "반짝 포인트";
        return "포인트";
      }

      function pointTypeUnit(type) {
        var key = String(type || "").trim().toLowerCase();
        if (key === "xp") return "XP";
        return "p";
      }

      function pointTypeIcon(type) {
        var key = String(type || "").trim().toLowerCase();
        if (key === "merch") return "🎟️";
        if (key === "xp") return "✨";
        if (key === "site") return "💎";
        return "✦";
      }

      function pointDateText(value) {
        var raw = String(value || "").trim();
        if (!raw) return "";
        return raw.slice(0, 10).replace(/-/g, ".");
      }

      function updateAchievementXpBox_(xpValue) {
        // PATCH 51-56: 업적 PC 사이드의 "현재 반짝 XP" 박스에 포인트 XP 합계를 표시한다.
        // 기존 업적/포인트/스탬프 로직은 건드리지 않고 텍스트와 진행바만 갱신한다.
        try {
          var xp = parseInt(xpValue || 0, 10) || 0;
          window.__lumiPointTotals = window.__lumiPointTotals || {};
          window.__lumiPointTotals.xp = xp;

          var scoreBoxes = Array.from(document.querySelectorAll(".ach-pc-score"));
          scoreBoxes.forEach(function(box) {
            var label = Array.from(box.querySelectorAll("small")).find(function(el) {
              return (el.textContent || "").trim().indexOf("현재 반짝 XP") >= 0;
            });
            if (!label) return;
            var valueEl = box.querySelector("b");
            if (valueEl) valueEl.textContent = String(xp);

            var smalls = Array.from(box.querySelectorAll("small"));
            var goalEl = smalls.find(function(el) {
              return (el.textContent || "").trim().indexOf("다음 목표") >= 0;
            });
            if (goalEl) {
              var nextGoal = 100;
              goalEl.textContent = xp > 0 ? "다음 목표까지 " + Math.max(0, nextGoal - (xp % nextGoal || nextGoal)) + " XP" : "다음 목표 준비 중";
              if (xp >= nextGoal && xp % nextGoal === 0) goalEl.textContent = "다음 목표 달성 준비 중";
            }

            var fill = box.querySelector(".ach-pc-bar span");
            if (fill) {
              var pct = Math.max(0, Math.min(100, xp % 100));
              if (xp > 0 && pct === 0) pct = 100;
              fill.style.width = pct + "%";
            }
          });
        } catch(e) {}
      }

      function renderPoints(data) {
        var payload = normalizePointPayload(data);
        var totals = payload.totals;
        var points = payload.points;
        window.__lumiPointTotals = Object.assign({}, window.__lumiPointTotals || {}, totals);
        updateAchievementXpBox_(totals.xp);

        // 포인트 탭 요약 카드: 기존 카드/DOM 유지, 숫자만 교체
        try {
          var cards = Array.from(document.querySelectorAll(".point-ledger-summary-card"));
          cards.forEach(function(card) {
            var small = card.querySelector("small");
            var b = card.querySelector("b");
            if (!small || !b) return;
            var label = small.textContent.trim();
            if (label === "물판 포인트") b.textContent = totals.merch + " p";
            if (label === "반짝 XP") b.textContent = totals.xp + " XP";
            if (label === "반짝 포인트" || label === "홈페이지 포인트") b.textContent = totals.site + " p";
          });
        } catch(e) {}

        // 프로필 요약 카드도 기존 DOM 유지, 숫자만 교체
        try {
          var profileStats = Array.from(document.querySelectorAll(".profile-stat"));
          profileStats.forEach(function(card) {
            var small = card.querySelector("small");
            var b = card.querySelector("b");
            if (!small || !b) return;
            var label = small.textContent.trim();
            if (label === "물판 포인트") b.textContent = totals.merch + "P";
            if (label === "반짝 XP") b.textContent = totals.xp + "XP";
            if (label === "반짝 포인트" || label === "홈페이지 포인트") b.textContent = totals.site + "P";
          });
        } catch(e) {}

        // 최근 포인트 내역: 기존 타임라인 shell 유지. API 항목만 prepend/교체.
        try {
          var timeline = document.getElementById("pointLedgerTimeline");
          if (timeline) {
            Array.from(timeline.querySelectorAll('[data-lumi-api-point="1"]')).forEach(function(node) { node.remove(); });
            points.filter(function(item) { return String(item.status || "active") === "active"; }).slice(0, 6).reverse().forEach(function(item) {
              var type = String(item.pointType || "").trim().toLowerCase();
              var amount = parseInt(item.amount || 0, 10) || 0;
              var label = pointTypeLabel(type);
              var unit = pointTypeUnit(type);
              var reason = item.reason || item.note || label;
              var date = pointDateText(item.createdAt || "");
              var article = document.createElement("article");
              article.className = "point-ledger-item";
              article.setAttribute("data-lumi-api-point", "1");
              article.setAttribute("data-point-category", label);
              article.setAttribute("data-point-title", reason);
              article.setAttribute("data-point-date", date || "");
              article.setAttribute("data-point-desc", (item.note || reason || "포인트 내역") + " · " + label + " " + (amount >= 0 ? "+" : "") + amount + unit);
              article.innerHTML =
                '<span class="point-ledger-icon">' + pointTypeIcon(type) + '</span>' +
                '<time>' + escapeHtml(date || "기록") + '</time>' +
                '<b>' + escapeHtml(reason) + '</b>' +
                '<span>' + escapeHtml(label + ' · ' + (item.sourceType || '기록')) + '</span>' +
                '<em>' + escapeHtml(label + ' ' + (amount >= 0 ? '+' : '') + amount + unit) + '</em>';
              timeline.insertBefore(article, timeline.firstChild);
            });
            if (typeof window.__lumiRefreshPointLedger === "function") window.__lumiRefreshPointLedger();
          }
        } catch(e) {}
      }

      async function loadMyPoints(lumiId) {
        try {
          const response = await fetchLumiApi({ action: "lumiGetMyPoints", lumiId: lumiId });
          if (!response || response.ok !== true) {
            appendBootDebug("points load failed: " + String((response && (response.error || response.message)) || "failed"));
            return;
          }
          const payload = { points: Array.isArray(response.points) ? response.points : [], totals: response.totals || { merch: 0, xp: 0, site: 0 } };
          cacheWrite_(lumiId, "points", payload);
          renderPoints(payload);
          appendBootDebug("points loaded: merch=" + (payload.totals.merch || 0) + " xp=" + (payload.totals.xp || 0) + " site=" + (payload.totals.site || 0));
        } catch (error) {
          appendBootDebug("points error: " + String(error && error.message ? error.message : error));
        }
      }
      // ──────────────────────────────────────────────────────────
      // PATCH 51-53: ON AIR / 루미코드 / 반짝응원 기록 조회 1차
      // 기존 ON AIR 탭 구조를 갈아엎지 않고 숫자/최근 기록만 주입한다.
      function normalizeOnAirPayload(data) {
        var payload = data || {};
        var logs = Array.isArray(payload.logs) ? payload.logs : (Array.isArray(payload) ? payload : []);
        var summary = payload.summary || {};
        if (!summary || typeof summary !== "object") summary = {};
        var lumiCode = Number(summary.lumiCode || 0) || 0;
        var sparkle = Number(summary.sparkle || 0) || 0;
        var total = Number(summary.total || 0) || 0;
        if (!total && logs.length) {
          logs.forEach(function(item) {
            if (String(item.status || "active") !== "active") return;
            total += 1;
            if (String(item.logType || "") === "lumiCode") lumiCode += 1;
            if (String(item.logType || "") === "sparkle") sparkle += Math.max(1, Number(item.amount || 1) || 1);
          });
        }
        return { logs: logs, summary: { lumiCode: lumiCode, sparkle: sparkle, total: total } };
      }

      function onAirDateText(value) {
        var raw = String(value || "").trim();
        if (!raw) return "기록";
        return raw.slice(0, 10).replace(/-/g, ".");
      }

      function onAirTypeLabel(type) {
        var key = String(type || "").trim();
        if (key === "lumiCode") return "루미코드";
        if (key === "sparkle") return "반짝응원";
        if (key === "chat") return "채팅";
        if (key === "mission") return "미션";
        if (key === "event") return "이벤트";
        return "ON AIR";
      }

      function onAirIcon(type) {
        var key = String(type || "").trim();
        if (key === "lumiCode") return "📡";
        if (key === "sparkle") return "✨";
        if (key === "chat") return "💬";
        if (key === "mission") return "🎯";
        return "✦";
      }

      function ensureOnAirLogHost(root) {
        if (!root) return null;
        var host = root.querySelector("[data-lumi-onair-log-host]");
        if (host) return host;
        var rewardPanel = root.querySelector('[data-onair-panel="reward"]');
        var cheerPanel = root.querySelector('[data-onair-panel="cheer"]');
        var target = rewardPanel || cheerPanel || root;
        host = document.createElement("div");
        host.className = "onair-note-card";
        host.setAttribute("data-lumi-onair-log-host", "1");
        host.innerHTML = '<b>최근 ON AIR 기록</b><span data-lumi-onair-log-summary>연결된 온라인 기록이 이곳에 표시돼요.</span><div data-lumi-onair-log-list></div>';
        target.appendChild(host);
        return host;
      }

      function renderOnAirLogs(data) {
        var payload = normalizeOnAirPayload(data);
        var logs = payload.logs.filter(function(item) { return String(item.status || "active") === "active"; });
        var summary = payload.summary;
        var root = document.getElementById("page-onair");
        if (!root) return;

        // 기존 반짝응원 상태 카드 숫자/문구만 업데이트
        try {
          var statusCard = root.querySelector("[data-onair-cheer-status]");
          if (statusCard) {
            var countEl = statusCard.querySelector("[data-onair-cheer-count]");
            var detailEl = statusCard.querySelector("[data-onair-cheer-detail]");
            if (countEl) countEl.textContent = "루미코드 " + summary.lumiCode + "회 · 반짝응원 " + summary.sparkle + "회";
            if (detailEl) detailEl.textContent = logs.length ? "최근 ON AIR 기록 " + logs.length + "개가 연결됐어요." : "아직 연결된 ON AIR 기록이 없어요.";
          }
        } catch (error) {}

        // 기존 ON AIR 탭에 작은 최근 기록 박스만 추가/갱신. 전체 재렌더 금지.
        try {
          var host = ensureOnAirLogHost(root);
          if (!host) return;
          var summaryEl = host.querySelector("[data-lumi-onair-log-summary]");
          var list = host.querySelector("[data-lumi-onair-log-list]");
          if (summaryEl) summaryEl.textContent = "루미코드 " + summary.lumiCode + "회 · 반짝응원 " + summary.sparkle + "회";
          if (list) {
            Array.from(list.querySelectorAll('[data-lumi-api-onair="1"]')).forEach(function(node) { node.remove(); });
            logs.slice(0, 5).reverse().forEach(function(item) {
              var row = document.createElement("article");
              row.className = "record-memory-card";
              row.setAttribute("data-lumi-api-onair", "1");
              var label = onAirTypeLabel(item.logType);
              var date = onAirDateText(item.createdAt);
              var title = item.message || label;
              var sub = (item.broadcastTitle || "ON AIR") + (item.code ? " · " + item.code : " · " + label);
              row.innerHTML =
                '<span class="record-memory-icon">' + onAirIcon(item.logType) + '</span>' +
                '<time>' + escapeHtml(date) + '</time>' +
                '<b>' + escapeHtml(title) + '</b>' +
                '<span>' + escapeHtml(sub) + '</span>' +
                '<em>' + escapeHtml(label) + '</em>';
              list.insertBefore(row, list.firstChild);
            });
          }
        } catch (error) {}
      }

      async function loadMyOnAirLogs(lumiId) {
        try {
          const response = await fetchLumiApi({ action: "lumiGetMyOnAirLogs", lumiId: lumiId });
          if (!response || response.ok !== true) {
            appendBootDebug("onair load failed: " + String((response && (response.error || response.message)) || "failed"));
            return;
          }
          const payload = {
            logs: Array.isArray(response.logs) ? response.logs : [],
            summary: response.summary || { lumiCode: 0, sparkle: 0, total: 0 }
          };
          cacheWrite_(lumiId, "onAirLogs", payload);
          renderOnAirLogs(payload);
          appendBootDebug("onair loaded: code=" + (payload.summary.lumiCode || 0) + " sparkle=" + (payload.summary.sparkle || 0));
        } catch (error) {
          appendBootDebug("onair error: " + String(error && error.message ? error.message : error));
        }
      }
      // PATCH 51-55: 교환소 조회/표시 1차 연동
      function normalizeShopPayload(data) {
        const items = Array.isArray(data && data.items) ? data.items : (Array.isArray(data) ? data : []);
        return { items: items, count: Number((data && data.count) || items.length || 0) };
      }

      function renderShopItems(data) {
        const payload = normalizeShopPayload(data);
        window.__lumiShopItemsPayload = payload;
        if (typeof window.__lumiRenderExchangeV2828 === "function") {
          try { window.__lumiRenderExchangeV2828(window.__lumiExchangeSelectedCatV2828 || "all"); } catch (error) {}
        }
      }

      async function loadMyShopItems(lumiId) {
        try {
          const response = await fetchLumiApi({ action: "lumiGetShopItems", lumiId: lumiId });
          if (!response || response.ok !== true) {
            appendBootDebug("shopItems load failed: " + String((response && (response.error || response.message)) || "failed"));
            return;
          }
          const payload = { items: Array.isArray(response.items) ? response.items : [], count: Number(response.count || 0) };
          cacheWrite_(lumiId, "shopItems", payload);
          renderShopItems(payload);
          appendBootDebug("shopItems loaded: " + payload.items.length + " items");
        } catch (error) {
          appendBootDebug("shopItems error: " + String(error && error.message ? error.message : error));
        }
      }

      // ──────────────────────────────────────────────────────────
      // Security Patch 2-2C: 로그인/메일 발송 UX 안정화
      // Security Patch 2-2B: 이메일 기반 복구 UI 안정화 / 로그인 잠금 문구 / 생일 드롭다운
      // - 루미 ID는 화면에 직접 표시하지 않고 등록 이메일로 발송
      // - 비밀번호 재설정은 등록 이메일 인증코드 + 본인확인 답변 + 새 비밀번호로 처리
      function ensureLumiRecoveryModal() {
        let modal = document.getElementById("lumiRecoveryModal");
        if (modal) return modal;

        const style = document.createElement("style");
        style.id = "lumiRecoveryModalStyle";
        style.textContent = "#lumiRecoveryModal{position:fixed;inset:0;z-index:9999;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(84,48,74,.38);backdrop-filter:blur(8px)}#lumiRecoveryModal.show{display:flex}.lumi-recovery-box{width:min(520px,100%);max-height:88vh;overflow:auto;border:1px solid #f2bdd5;border-radius:28px;background:#fff;box-shadow:0 24px 80px rgba(110,62,91,.22);padding:24px;color:#6b445b}.lumi-recovery-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:16px}.lumi-recovery-head h3{margin:0;font-size:24px;color:#e06fa3}.lumi-recovery-head p{margin:6px 0 0;font-size:13px;font-weight:800;color:#9a7087;line-height:1.5}.lumi-recovery-close{width:36px;height:36px;border-radius:999px;border:1px solid #f0bfd4;background:#fff;color:#d77ca7;font-size:22px;font-weight:900;cursor:pointer}.lumi-recovery-tabs{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0 16px}.lumi-recovery-tab{min-height:42px;border-radius:999px;border:1px solid #f0bfd4;background:#fff;color:#9a5b7b;font-weight:900;cursor:pointer}.lumi-recovery-tab.active{background:#ff5ba5;color:#fff;box-shadow:0 10px 24px rgba(255,91,165,.22)}.lumi-recovery-panel{display:none}.lumi-recovery-panel.active{display:block}.lumi-recovery-field{margin:10px 0}.lumi-recovery-field label{display:block;margin-bottom:6px;font-size:12px;font-weight:900;color:#b36d93}.lumi-recovery-field input,.lumi-recovery-field select{width:100%;box-sizing:border-box;min-height:44px;border-radius:16px;border:1px solid #f0bfd4;background:#fff8fc;color:#6b445b;font-weight:900;padding:0 14px;outline:none}.lumi-recovery-field select{appearance:none;-webkit-appearance:none;background-image:linear-gradient(45deg,transparent 50%,#d77ca7 50%),linear-gradient(135deg,#d77ca7 50%,transparent 50%);background-position:calc(100% - 18px) 19px,calc(100% - 12px) 19px;background-size:6px 6px,6px 6px;background-repeat:no-repeat;padding-right:34px;cursor:pointer}.lumi-recovery-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}.lumi-recovery-action{width:100%;min-height:46px;margin-top:12px;border:0;border-radius:999px;background:#ff5ba5;color:#fff;font-weight:900;cursor:pointer}.lumi-recovery-subaction{width:100%;min-height:42px;margin-top:8px;border:1px solid #f0bfd4;border-radius:999px;background:#fff;color:#d77ca7;font-weight:900;cursor:pointer}.lumi-recovery-result{min-height:20px;margin-top:12px;padding:12px;border-radius:16px;background:#fff5fb;border:1px dashed #f0bfd4;font-size:13px;font-weight:900;color:#8a5d75;line-height:1.5}.lumi-recovery-note{margin-top:12px;font-size:12px;font-weight:800;color:#9a7087;line-height:1.55}.lumi-recovery-question-card{display:none;margin:10px 0;padding:12px 14px;border-radius:16px;border:1px dashed #f0bfd4;background:#fff8fc;color:#6b445b;line-height:1.5}.lumi-recovery-question-card.show{display:block}.lumi-recovery-question-card .lumi-recovery-question-label{display:block;margin-bottom:4px;font-size:12px;font-weight:900;color:#b36d93}.lumi-recovery-question-card .lumi-recovery-question-text{display:block;font-size:14px;font-weight:900;color:#6b445b}.lumi-recovery-field input:disabled,.lumi-recovery-field select:disabled,.lumi-recovery-action:disabled,.lumi-recovery-subaction:disabled{opacity:.62;cursor:wait}.lumi-password-wrap{position:relative}.lumi-password-wrap input{padding-right:52px}.lumi-password-toggle{position:absolute;right:8px;top:50%;transform:translateY(-50%);width:36px;height:36px;border-radius:999px;border:1px solid #f0bfd4;background:#fff;color:#d77ca7;font-size:17px;font-weight:900;cursor:pointer;line-height:1;display:grid;place-items:center;overflow:visible}.lumi-password-toggle.is-visible{background:#fff1f8;box-shadow:0 8px 20px rgba(255,91,165,.18)}.lumi-password-heart{position:absolute;left:50%;top:50%;pointer-events:none;animation:lumiRabbitHeart .72s ease-out forwards;font-size:12px;color:#ff6aa8;filter:drop-shadow(0 4px 8px rgba(255,91,165,.2))}@keyframes lumiRabbitHeart{0%{opacity:0;transform:translate(-50%,-50%) scale(.65)}20%{opacity:1}100%{opacity:0;transform:translate(calc(-50% + var(--heart-x,0px)),calc(-50% - 34px)) scale(1.25)}}";
        document.head.appendChild(style);

        function buildLumiNumberOptions_(start, end, suffix, placeholder) {
          var html = '<option value="">' + placeholder + '</option>';
          for (var i = start; i <= end; i++) {
            html += '<option value="' + i + '">' + i + suffix + '</option>';
          }
          return html;
        }
        const recoveryMonthOptions = buildLumiNumberOptions_(1, 12, "월", "월 선택");
        const recoveryDayOptions = buildLumiNumberOptions_(1, 31, "일", "일 선택");
        // Security Patch 2-2F: 본인확인 질문 선택식
        const LUMI_RECOVERY_QUESTION_OPTIONS = [
          "나만의 비밀 단어는?",
          "키우는 반려동물의 이름은?",
          "좋아하는 음식은?",
          "좋아하는 색은?",
          "좌우명은?",
          "처음 루미벨을 알게 된 계기는?",
          "좋아하는 아이돌은?"
        ];
        const recoveryQuestionOptions = '<option value="">질문 선택</option>' + LUMI_RECOVERY_QUESTION_OPTIONS.map(function(q) {
          return '<option value="' + q.replace(/"/g, '&quot;') + '">' + q + '</option>';
        }).join("");

        modal = document.createElement("div");
        modal.id = "lumiRecoveryModal";
        modal.setAttribute("aria-hidden", "true");
        modal.innerHTML = '' +
          '<div class="lumi-recovery-box" role="dialog" aria-modal="true" aria-label="루미 ID와 비밀번호 찾기">' +
            '<div class="lumi-recovery-head">' +
              '<div><h3>루미 ID / 비밀번호 찾기</h3><p>등록 이메일 인증으로 더 안전하게 루미 ID를 찾고 비밀번호를 재설정해요.</p></div>' +
              '<button type="button" class="lumi-recovery-close" data-recovery-close>×</button>' +
            '</div>' +
            '<div class="lumi-recovery-tabs">' +
              '<button type="button" class="lumi-recovery-tab active" data-recovery-tab="find">루미 ID 찾기</button>' +
              '<button type="button" class="lumi-recovery-tab" data-recovery-tab="reset">비밀번호 재설정</button>' +
            '</div>' +
            '<section class="lumi-recovery-panel active" data-recovery-panel="find">' +
              '<div class="lumi-recovery-field"><label>닉네임</label><input id="recoveryFindNickname" autocomplete="nickname" placeholder="예: 루루나나"></div>' +
              '<div class="lumi-recovery-row">' +
                '<div class="lumi-recovery-field"><label>생일 월</label><select id="recoveryFindMonth">' + recoveryMonthOptions + '</select></div>' +
                '<div class="lumi-recovery-field"><label>생일 일</label><select id="recoveryFindDay">' + recoveryDayOptions + '</select></div>' +
              '</div>' +
              '<div class="lumi-recovery-field"><label>본인확인 질문</label><select id="recoveryFindQuestion">' + recoveryQuestionOptions + '</select></div>' +
              '<div class="lumi-recovery-field"><label>본인확인 답변</label><input id="recoveryFindAnswer" placeholder="예: 루미벨"></div>' +
              '<button type="button" class="lumi-recovery-action" id="recoveryFindSubmit">등록 이메일로 루미 ID 받기</button>' +
              '<div class="lumi-recovery-result" id="recoveryFindResult">닉네임, 생일, 본인확인 답변이 일치하면 등록 이메일로 루미 ID를 보내요.</div>' +
            '</section>' +
            '<section class="lumi-recovery-panel" data-recovery-panel="reset">' +
              '<div class="lumi-recovery-field"><label>루미 ID</label><input id="recoveryResetLumiId" placeholder="LB-0001"></div>' +
              '<button type="button" class="lumi-recovery-subaction" id="recoveryCodeSubmit">등록 이메일로 인증코드 받기</button>' +
              '<div class="lumi-recovery-result" id="recoveryQuestionResult">루미 ID를 입력한 뒤 인증코드를 받아 주세요.</div>' +
              '<div class="lumi-recovery-question-card" id="recoveryResetQuestionBox" aria-live="polite"><span class="lumi-recovery-question-label">본인확인 질문</span><span class="lumi-recovery-question-text" id="recoveryResetQuestionText"></span></div>' +
              '<div class="lumi-recovery-field"><label>이메일 인증코드</label><input id="recoveryResetCode" inputmode="numeric" maxlength="6" placeholder="메일로 받은 6자리 코드"></div>' +
              '<div class="lumi-recovery-field"><label>본인확인 답변</label><input id="recoveryResetAnswer" placeholder="답변 입력"></div>' +
              '<div class="lumi-recovery-field"><label>새 비밀번호</label><div class="lumi-password-wrap"><input id="recoveryResetPin" type="password" autocomplete="new-password" maxlength="20" placeholder="영문/숫자/특수문자 4~20자"><button type="button" class="lumi-password-toggle" data-password-toggle="recoveryResetPin" aria-label="비밀번호 보기">🐰</button></div></div>' +
              '<button type="button" class="lumi-recovery-action" id="recoveryResetSubmit">비밀번호 재설정</button>' +
              '<div class="lumi-recovery-note">기존 비밀번호는 보여주지 않고, 등록 이메일 인증 후 새 비밀번호로 재설정해요.</div>' +
            '</section>' +
          '</div>';
        document.body.appendChild(modal);

        function setRecoveryTab(mode) {
          modal.querySelectorAll("[data-recovery-tab]").forEach((btn) => btn.classList.toggle("active", btn.dataset.recoveryTab === mode));
          modal.querySelectorAll("[data-recovery-panel]").forEach((panel) => panel.classList.toggle("active", panel.dataset.recoveryPanel === mode));
        }
        modal.querySelectorAll("[data-recovery-tab]").forEach((btn) => btn.addEventListener("click", () => setRecoveryTab(btn.dataset.recoveryTab)));
        modal.querySelectorAll("[data-recovery-close]").forEach((btn) => btn.addEventListener("click", closeLumiRecoveryModal));
        modal.addEventListener("click", (event) => { if (event.target === modal) closeLumiRecoveryModal(); });

        const findResult = modal.querySelector("#recoveryFindResult");
        const questionResult = modal.querySelector("#recoveryQuestionResult");
        const resetQuestionBox = modal.querySelector("#recoveryResetQuestionBox");
        const resetQuestionText = modal.querySelector("#recoveryResetQuestionText");
        function setResetRecoveryQuestion_(question) {
          const text = String(question || "").trim();
          if (!resetQuestionBox || !resetQuestionText) return;
          if (!text) {
            resetQuestionText.textContent = "";
            resetQuestionBox.classList.remove("show");
            return;
          }
          resetQuestionText.textContent = text;
          resetQuestionBox.classList.add("show");
        }
        const resetIdInput = modal.querySelector("#recoveryResetLumiId");
        const resetPasswordInput = modal.querySelector("#recoveryResetPin");
        function setRecoveryButtonLoading(button, isLoading, loadingText) {
          if (!button) return function() {};
          const originalText = button.getAttribute("data-lumi-original-text") || button.textContent;
          button.setAttribute("data-lumi-original-text", originalText);
          if (button._lumiRecoveryCountdownTimer) {
            window.clearInterval(button._lumiRecoveryCountdownTimer);
            button._lumiRecoveryCountdownTimer = null;
          }
          button.disabled = Boolean(isLoading);
          if (isLoading && loadingText) button.textContent = loadingText;
          return function restoreRecoveryButton() {
            button.disabled = false;
            button.textContent = originalText;
          };
        }
        function getRecoveryRetrySeconds(response) {
          if (!response) return 0;
          const direct = Number(response.retryAfterSeconds || response.retryAfter || 0);
          if (direct > 0) return Math.ceil(direct);
          const text = String(response.message || response.error || "");
          const match = text.match(/(\d+)\s*초\s*후/);
          return match ? Math.ceil(Number(match[1] || 0)) : 0;
        }
        function startRecoveryCountdown(button, resultEl, seconds, options) {
          if (!button) return;
          options = options || {};
          let remain = Math.max(0, Math.ceil(Number(seconds || 0)));
          if (!remain) return;
          const originalText = button.getAttribute("data-lumi-original-text") || button.textContent;
          button.setAttribute("data-lumi-original-text", originalText);
          if (button._lumiRecoveryCountdownTimer) window.clearInterval(button._lumiRecoveryCountdownTimer);
          function renderCountdown() {
            if (remain > 0) {
              button.disabled = true;
              button.textContent = remain + "초 후 다시 요청";
              if (resultEl && options.updateResult !== false) {
                resultEl.textContent = (options.prefix || "인증 메일은 ") + remain + "초 후 다시 요청할 수 있어요.";
              }
              remain -= 1;
              return;
            }
            window.clearInterval(button._lumiRecoveryCountdownTimer);
            button._lumiRecoveryCountdownTimer = null;
            button.disabled = false;
            button.textContent = originalText;
            if (resultEl && options.doneText) resultEl.textContent = options.doneText;
          }
          renderCountdown();
          button._lumiRecoveryCountdownTimer = window.setInterval(renderCountdown, 1000);
        }
        function playRabbitPasswordHeart(button) {
          if (!button) return;
          const xs = [-8, 0, 8];
          xs.forEach(function(x, idx) {
            const heart = document.createElement("span");
            heart.className = "lumi-password-heart";
            heart.textContent = "♡";
            heart.style.setProperty("--heart-x", String(x) + "px");
            heart.style.animationDelay = String(idx * 0.055) + "s";
            button.appendChild(heart);
            window.setTimeout(function() { try { heart.remove(); } catch(e) {} }, 900);
          });
        }
        modal.querySelectorAll("[data-password-toggle]").forEach(function(button) {
          button.addEventListener("click", function() {
            const target = modal.querySelector("#" + button.getAttribute("data-password-toggle"));
            if (!target) return;
            const willShow = target.type === "password";
            target.type = willShow ? "text" : "password";
            button.classList.toggle("is-visible", willShow);
            button.setAttribute("aria-label", willShow ? "비밀번호 숨기기" : "비밀번호 보기");
            playRabbitPasswordHeart(button);
          });
        });

        modal.querySelector("#recoveryFindSubmit").addEventListener("click", async () => {
          const nickname = modal.querySelector("#recoveryFindNickname").value.trim();
          const birthMonth = modal.querySelector("#recoveryFindMonth").value.trim();
          const birthDay = modal.querySelector("#recoveryFindDay").value.trim();
          const recoveryQuestion = modal.querySelector("#recoveryFindQuestion").value.trim();
          const recoveryAnswer = modal.querySelector("#recoveryFindAnswer").value.trim();
          if (!nickname || !birthMonth || !birthDay || !recoveryQuestion || !recoveryAnswer) {
            findResult.textContent = "닉네임, 생일, 본인확인 질문과 답변을 모두 입력해 주세요.";
            return;
          }
          const findButton = modal.querySelector("#recoveryFindSubmit");
          const restoreFindButton = setRecoveryButtonLoading(findButton, true, "메일 보내는 중…");
          findResult.textContent = "등록 이메일을 확인하는 중…";
          let countdownStarted = false;
          try {
            const response = await postLumiApi({ action: "lumiFindIdEmail", nickname, birthMonth, birthDay, recoveryQuestion, recoveryAnswer });
            if (response && response.ok === true && response.emailSent === true && response.emailMasked) {
              findResult.textContent = response.emailMasked + "로 루미 ID를 보냈어요. 메일함을 확인해 주세요.";
              countdownStarted = true;
              startRecoveryCountdown(findButton, findResult, 60, { updateResult: false, doneText: "다시 요청할 수 있어요." });
            } else if (response && response.ok === true) {
              // Security Patch 2-1-fix1: 예전/잘못된 서버 응답(ok:true만 있고 이메일 발송 증거 없음)을 성공으로 보지 않는다.
              findResult.textContent = "이메일 발송 확인값이 없어요. Apps Script 배포 버전을 확인해 주세요.";
            } else {
              const retrySeconds = getRecoveryRetrySeconds(response);
              if (retrySeconds > 0) {
                countdownStarted = true;
                startRecoveryCountdown(findButton, findResult, retrySeconds, { prefix: "인증 메일은 ", doneText: "다시 요청할 수 있어요." });
              } else {
                findResult.textContent = String((response && (response.message || response.error)) || "일치하는 정보를 찾을 수 없습니다.");
              }
            }
          } catch (error) {
            findResult.textContent = "루미폰 서버 연결을 확인해 주세요.";
          } finally {
            if (!countdownStarted) restoreFindButton();
          }
        });

        modal.querySelector("#recoveryCodeSubmit").addEventListener("click", async () => {
          const lumiId = normId(resetIdInput.value);
          resetIdInput.value = lumiId;
          if (!lumiId) {
            questionResult.textContent = "루미 ID를 입력해 주세요.";
            setResetRecoveryQuestion_("");
            return;
          }
          const codeButton = modal.querySelector("#recoveryCodeSubmit");
          const restoreCodeButton = setRecoveryButtonLoading(codeButton, true, "인증코드 보내는 중…");
          questionResult.textContent = "인증코드를 발송하는 중…";
          setResetRecoveryQuestion_("");
          let countdownStarted = false;
          try {
            const response = await postLumiApi({ action: "lumiRequestPinResetCode", lumiId });
            if (response && response.ok === true && response.emailSent === true && response.emailMasked) {
              questionResult.textContent = response.emailMasked + "로 인증코드를 보냈어요.";
              if (response.recoveryQuestion) {
                setResetRecoveryQuestion_(response.recoveryQuestion);
              } else {
                setResetRecoveryQuestion_("");
                questionResult.textContent = response.emailMasked + "로 인증코드를 보냈어요. 등록된 본인확인 답변도 함께 입력해 주세요.";
              }
              countdownStarted = true;
              startRecoveryCountdown(codeButton, questionResult, 60, { updateResult: false, doneText: "다시 요청할 수 있어요." });
            } else if (response && response.ok === true) {
              // Security Patch 2-1-fix1: 예전/잘못된 서버 응답(ok:true만 있고 이메일 발송 증거 없음)을 성공으로 보지 않는다.
              questionResult.textContent = "이메일 발송 확인값이 없어요. Apps Script 배포 버전을 확인해 주세요.";
            } else {
              const retrySeconds = getRecoveryRetrySeconds(response);
              if (retrySeconds > 0) {
                countdownStarted = true;
                startRecoveryCountdown(codeButton, questionResult, retrySeconds, { prefix: "인증 메일은 ", doneText: "다시 요청할 수 있어요." });
              } else {
                questionResult.textContent = String((response && (response.message || response.error)) || "인증코드를 발송하지 못했어요.");
              }
            }
          } catch (error) {
            questionResult.textContent = "루미폰 서버 연결을 확인해 주세요.";
          } finally {
            if (!countdownStarted) restoreCodeButton();
          }
        });

        modal.querySelector("#recoveryResetSubmit").addEventListener("click", async () => {
          const lumiId = normId(resetIdInput.value);
          resetIdInput.value = lumiId;
          const code = modal.querySelector("#recoveryResetCode").value.trim();
          const recoveryAnswer = modal.querySelector("#recoveryResetAnswer").value.trim();
          const newPin = modal.querySelector("#recoveryResetPin").value.trim();
          if (!lumiId || !code || !recoveryAnswer || !newPin) {
            questionResult.textContent = "루미 ID, 인증코드, 답변, 새 비밀번호를 모두 입력해 주세요.";
            return;
          }
          if (!/^\d{6}$/.test(code)) {
            questionResult.textContent = "인증코드는 숫자 6자리로 입력해 주세요.";
            return;
          }
          if (newPin.length < 4 || newPin.length > 20 || /\s/.test(newPin)) {
            questionResult.textContent = "비밀번호는 4~20자, 공백 없이 입력해 주세요.";
            return;
          }
          const resetButton = modal.querySelector("#recoveryResetSubmit");
          const restoreResetButton = setRecoveryButtonLoading(resetButton, true, "재설정하는 중…");
          questionResult.textContent = "비밀번호를 재설정하는 중…";
          try {
            const response = await postLumiApi({ action: "lumiResetPinWithCode", lumiId, code, recoveryAnswer, newPin });
            if (response && response.ok === true) {
              questionResult.textContent = "비밀번호가 재설정됐어요. 새 비밀번호로 로그인해 주세요.";
              loginId.value = lumiId;
              loginPin.value = "";
              modal.querySelector("#recoveryResetCode").value = "";
              modal.querySelector("#recoveryResetAnswer").value = "";
              modal.querySelector("#recoveryResetPin").value = "";
              if (resetPasswordInput) resetPasswordInput.type = "password";
              const toggle = modal.querySelector('[data-password-toggle="recoveryResetPin"]');
              if (toggle) {
                toggle.classList.remove("is-visible");
                toggle.setAttribute("aria-label", "비밀번호 보기");
              }
              window.setTimeout(function() { closeLumiRecoveryModal(); }, 1200);
            } else {
              questionResult.textContent = String((response && (response.message || response.error)) || "비밀번호를 재설정하지 못했어요.");
            }
          } catch (error) {
            questionResult.textContent = "루미폰 서버 연결을 확인해 주세요.";
          } finally {
            restoreResetButton();
          }
        });
        return modal;
      }


      function ensureLumiSignupModal() {
        let modal = document.getElementById("lumiSignupModal");
        if (modal) return modal;
        const styleId = "lumiSignupModalStyle";
        if (!document.getElementById(styleId)) {
          const style = document.createElement("style");
          style.id = styleId;
          style.textContent = "#lumiSignupModal{position:fixed;inset:0;z-index:9999;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(84,48,74,.38);backdrop-filter:blur(8px)}#lumiSignupModal.show{display:flex}.lumi-signup-box{width:min(540px,100%);max-height:88vh;overflow:auto;border:1px solid #f2bdd5;border-radius:28px;background:#fff;box-shadow:0 24px 80px rgba(110,62,91,.22);padding:24px;color:#6b445b}.lumi-signup-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:14px}.lumi-signup-head h3{margin:0;font-size:24px;color:#e06fa3}.lumi-signup-head p{margin:6px 0 0;font-size:13px;font-weight:800;color:#9a7087;line-height:1.5}.lumi-signup-close{width:36px;height:36px;border-radius:999px;border:1px solid #f0bfd4;background:#fff;color:#d77ca7;font-size:22px;font-weight:900;cursor:pointer}.lumi-signup-field{margin:10px 0}.lumi-signup-field label{display:block;margin-bottom:6px;font-size:12px;font-weight:900;color:#b36d93}.lumi-signup-field input,.lumi-signup-field select{width:100%;box-sizing:border-box;min-height:44px;border-radius:16px;border:1px solid #f0bfd4;background:#fff8fc;color:#6b445b;font-weight:900;padding:0 14px;outline:none}.lumi-signup-field select{appearance:none;-webkit-appearance:none;background-image:linear-gradient(45deg,transparent 50%,#d77ca7 50%),linear-gradient(135deg,#d77ca7 50%,transparent 50%);background-position:calc(100% - 18px) 19px,calc(100% - 12px) 19px;background-size:6px 6px,6px 6px;background-repeat:no-repeat;padding-right:34px;cursor:pointer}.lumi-signup-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}.lumi-signup-action{width:100%;min-height:46px;margin-top:12px;border:0;border-radius:999px;background:#ff5ba5;color:#fff;font-weight:900;cursor:pointer}.lumi-signup-subaction{width:100%;min-height:42px;margin-top:8px;border:1px solid #f0bfd4;border-radius:999px;background:#fff;color:#d77ca7;font-weight:900;cursor:pointer}.lumi-signup-result{min-height:20px;margin-top:12px;padding:12px;border-radius:16px;background:#fff5fb;border:1px dashed #f0bfd4;font-size:13px;font-weight:900;color:#8a5d75;line-height:1.5}.lumi-signup-result.success{background:#f5fff8;border-color:#bfe7cc;color:#3a8b53}.lumi-signup-note{margin-top:10px;font-size:12px;font-weight:800;color:#9a7087;line-height:1.55}.lumi-signup-field input:disabled,.lumi-signup-field select:disabled,.lumi-signup-action:disabled,.lumi-signup-subaction:disabled{opacity:.62;cursor:wait}.lumi-signup-password-wrap{position:relative}.lumi-signup-password-wrap input{padding-right:52px}.lumi-signup-password-wrap .lumi-password-toggle{position:absolute;right:8px;top:50%;transform:translateY(-50%);width:36px;height:36px;border-radius:999px;border:1px solid #f0bfd4;background:#fff;color:#d77ca7;font-size:17px;font-weight:900;cursor:pointer;line-height:1;display:grid;place-items:center;overflow:visible}.lumi-signup-password-wrap .lumi-password-toggle.is-visible{background:#fff1f8;box-shadow:0 8px 20px rgba(255,91,165,.18)}.lumi-signup-password-wrap .lumi-password-heart{position:absolute;left:50%;top:50%;pointer-events:none;animation:lumiSignupRabbitHeart .72s ease-out forwards;font-size:12px;color:#ff6aa8;filter:drop-shadow(0 4px 8px rgba(255,91,165,.2))}@keyframes lumiSignupRabbitHeart{0%{opacity:0;transform:translate(-50%,-50%) scale(.65)}20%{opacity:1}100%{opacity:0;transform:translate(calc(-50% + var(--heart-x,0px)),calc(-50% - 34px)) scale(1.25)}}";
          document.head.appendChild(style);
        }
        const questionOptions = [
          "나만의 비밀 단어는?",
          "키우는 반려동물의 이름은?",
          "좋아하는 음식은?",
          "좋아하는 색은?",
          "좌우명은?",
          "처음 루미벨을 알게 된 계기는?",
          "좋아하는 아이돌은?"
        ].map(function(q) { return '<option value="' + q.replace(/"/g, '&quot;') + '">' + q + '</option>'; }).join("");
        const oshiOptions = [
          '<option value="Lumibelle">Lumibelle</option>',
          '<option value="마리링">마리링</option>',
          '<option value="루루">루루</option>',
          '<option value="DD">DD</option>',
          '<option value="아직 고민 중">아직 고민 중</option>'
        ].join("");
        modal = document.createElement("div");
        modal.id = "lumiSignupModal";
        modal.setAttribute("aria-hidden", "true");
        modal.innerHTML = '' +
          '<div class="lumi-signup-box" role="dialog" aria-modal="true" aria-label="루미 ID 만들기">' +
            '<div class="lumi-signup-head">' +
              '<div><h3>루미 ID 만들기</h3><p>루미폰에서 티켓, 우편, 기록을 확인할 수 있는 루미 ID를 만들어요.</p></div>' +
              '<button type="button" class="lumi-signup-close" data-signup-close>×</button>' +
            '</div>' +
            '<div class="lumi-signup-field"><label>닉네임</label><input id="signupNickname" autocomplete="nickname" placeholder="예: 루루나나"></div>' +
            '<div class="lumi-signup-field"><label>이메일</label><input id="signupEmail" type="email" autocomplete="email" placeholder="메일 인증이 가능한 이메일"></div>' +
            '<button type="button" class="lumi-signup-subaction" id="signupCodeSend">이메일 인증코드 받기</button>' +
            '<div class="lumi-signup-result" id="signupCodeResult">이메일 인증 후 루미 ID를 만들 수 있어요.</div>' +
            '<div class="lumi-signup-field"><label>이메일 인증코드</label><input id="signupEmailCode" inputmode="numeric" maxlength="6" placeholder="메일로 받은 6자리 코드"></div>' +
            '<div class="lumi-signup-row">' +
              '<div class="lumi-signup-field"><label>비밀번호</label><div class="lumi-signup-password-wrap"><input id="signupPassword" type="password" autocomplete="new-password" maxlength="20" placeholder="4~20자"><button type="button" class="lumi-password-toggle" data-password-toggle="signupPassword" aria-label="비밀번호 보기">🐰</button></div></div>' +
              '<div class="lumi-signup-field"><label>비밀번호 확인</label><div class="lumi-signup-password-wrap"><input id="signupPasswordConfirm" type="password" autocomplete="new-password" maxlength="20" placeholder="한 번 더 입력"><button type="button" class="lumi-password-toggle" data-password-toggle="signupPasswordConfirm" aria-label="비밀번호 보기">🐰</button></div></div>' +
            '</div>' +
            '<div class="lumi-signup-field"><label>오시 선택</label><select id="signupOshi">' + oshiOptions + '</select></div>' +
            '<div class="lumi-signup-field"><label>본인확인 질문</label><select id="signupRecoveryQuestion">' + questionOptions + '</select></div>' +
            '<div class="lumi-signup-field"><label>본인확인 답변</label><input id="signupRecoveryAnswer" placeholder="비밀번호 찾기에 사용할 답변"></div>' +
            '<button type="button" class="lumi-signup-action" id="signupSubmit">루미 ID 만들기</button>' +
            '<div class="lumi-signup-note">입력한 이메일과 본인확인 질문/답변은 루미 ID 찾기와 비밀번호 재설정에 사용돼요. 답변은 다른 사람에게 알려주지 마세요.</div>' +
          '</div>';
        document.body.appendChild(modal);

        let signupCountdownTimer = null;
        function resetSignupModalFields() {
          try { if (signupCountdownTimer) window.clearInterval(signupCountdownTimer); } catch(e) {}
          signupCountdownTimer = null;
          const ids = ["signupNickname", "signupEmail", "signupEmailCode", "signupPassword", "signupPasswordConfirm", "signupRecoveryAnswer"];
          ids.forEach(function(id) { const el = modal.querySelector("#" + id); if (el) el.value = ""; });
          const oshi = modal.querySelector("#signupOshi"); if (oshi) oshi.value = "Lumibelle";
          const question = modal.querySelector("#signupRecoveryQuestion"); if (question) question.selectedIndex = 0;
          const codeBtn = modal.querySelector("#signupCodeSend"); if (codeBtn) { codeBtn.disabled = false; codeBtn.textContent = "이메일 인증코드 받기"; }
          const submitBtn = modal.querySelector("#signupSubmit"); if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "루미 ID 만들기"; }
          const result = modal.querySelector("#signupCodeResult");
          if (result) { result.classList.remove("success"); result.textContent = "이메일 인증 후 루미 ID를 만들 수 있어요."; }
          modal.querySelectorAll("[data-password-toggle]").forEach(function(button) {
            const target = modal.querySelector("#" + button.getAttribute("data-password-toggle"));
            if (target) target.type = "password";
            button.classList.remove("is-visible");
            button.setAttribute("aria-label", "비밀번호 보기");
          });
        }
        function closeSignupModal() {
          modal.classList.remove("show");
          modal.setAttribute("aria-hidden", "true");
          resetSignupModalFields();
        }
        function signupBtnLoading(btn, text) {
          if (!btn) return function(){};
          const original = btn.textContent;
          btn.disabled = true;
          btn.textContent = text;
          return function() { btn.disabled = false; btn.textContent = original; };
        }
        function signupRetrySeconds(response) {
          if (!response) return 0;
          if (Number(response.retryAfterSeconds || 0) > 0) return Math.ceil(Number(response.retryAfterSeconds));
          const msg = String(response.message || response.error || "");
          const m = msg.match(/(\d+)\s*초\s*후/);
          return m ? Number(m[1]) : 0;
        }
        function signupCountdown(btn, resultEl, seconds) {
          let remain = Math.max(1, Number(seconds || 60));
          if (signupCountdownTimer) window.clearInterval(signupCountdownTimer);
          btn.disabled = true;
          const tick = function() {
            btn.textContent = remain + "초 후 다시 요청";
            if (resultEl) {
              resultEl.textContent = "이메일로 인증코드를 보냈어요. " + remain + "초 후 다시 요청할 수 있어요.";
              resultEl.classList.add("success");
            }
            remain -= 1;
            if (remain < 0) {
              window.clearInterval(signupCountdownTimer);
              signupCountdownTimer = null;
              btn.disabled = false;
              btn.textContent = "이메일 인증코드 받기";
              if (resultEl) {
                resultEl.classList.remove("success");
                resultEl.textContent = "다시 요청할 수 있어요.";
              }
            }
          };
          tick();
          signupCountdownTimer = window.setInterval(tick, 1000);
        }

        function playSignupRabbitPasswordHeart(button) {
          if (!button) return;
          [-8, 0, 8].forEach(function(x, idx) {
            const heart = document.createElement("span");
            heart.className = "lumi-password-heart";
            heart.textContent = "♡";
            heart.style.setProperty("--heart-x", String(x) + "px");
            heart.style.animationDelay = String(idx * 0.055) + "s";
            button.appendChild(heart);
            window.setTimeout(function() { try { heart.remove(); } catch(e) {} }, 900);
          });
        }
        modal.querySelectorAll("[data-password-toggle]").forEach(function(button) {
          button.addEventListener("click", function() {
            const target = modal.querySelector("#" + button.getAttribute("data-password-toggle"));
            if (!target) return;
            const willShow = target.type === "password";
            target.type = willShow ? "text" : "password";
            button.classList.toggle("is-visible", willShow);
            button.setAttribute("aria-label", willShow ? "비밀번호 숨기기" : "비밀번호 보기");
            playSignupRabbitPasswordHeart(button);
          });
        });

        modal.querySelectorAll("[data-signup-close]").forEach((btn) => btn.addEventListener("click", closeSignupModal));
        modal.addEventListener("click", (event) => { if (event.target === modal) closeSignupModal(); });

        modal.querySelector("#signupCodeSend").addEventListener("click", async function() {
          const email = modal.querySelector("#signupEmail").value.trim();
          const result = modal.querySelector("#signupCodeResult");
          if (!email) { result.textContent = "이메일을 입력해 주세요."; return; }
          const btn = modal.querySelector("#signupCodeSend");
          const restore = signupBtnLoading(btn, "인증코드 보내는 중…");
          result.classList.remove("success");
          result.textContent = "인증코드를 발송하는 중…";
          let countdown = false;
          try {
            const response = await postLumiApi({ action: "lumiRequestSignupEmailCode", email });
            if (response && response.ok === true && response.emailSent) {
              result.classList.add("success");
              result.textContent = (response.emailMasked || email) + "로 인증코드를 보냈어요.";
              countdown = true;
              signupCountdown(btn, result, 60);
            } else {
              const retry = signupRetrySeconds(response);
              if (retry > 0) { countdown = true; signupCountdown(btn, result, retry); }
              else result.textContent = String((response && (response.message || response.error)) || "인증코드를 발송하지 못했어요.");
            }
          } catch (e) {
            result.textContent = "루미폰 서버 연결을 확인해 주세요.";
          } finally {
            if (!countdown) restore();
          }
        });

        // 버그 1 수정: Enter 키로 signupCodeSend가 우발적으로 발동되는 것 방지
        modal.addEventListener("keydown", function(e) {
          if (e.key !== "Enter") return;
          const active = document.activeElement;
          // 인증코드 요청 버튼에 포커스가 없고, 입력 필드에서 Enter를 누를 때
          // signupCodeSend가 form submit처럼 동작하는 것 방지
          if (active && active.id === "signupCodeSend") return; // 명시적 포커스는 허용
          const codeBtn = modal.querySelector("#signupCodeSend");
          if (codeBtn && !codeBtn.disabled && active && active.tagName === "INPUT") {
            e.preventDefault(); // 인증코드 버튼 자동 발동 차단
          }
        });

        modal.querySelector("#signupSubmit").addEventListener("click", async function() {
          const nickname = modal.querySelector("#signupNickname").value.trim();
          const email = modal.querySelector("#signupEmail").value.trim();
          const code = modal.querySelector("#signupEmailCode").value.trim();
          const password = modal.querySelector("#signupPassword").value.trim();
          const passwordConfirm = modal.querySelector("#signupPasswordConfirm").value.trim();
          const oshi = modal.querySelector("#signupOshi").value.trim();
          const recoveryQuestion = modal.querySelector("#signupRecoveryQuestion").value.trim();
          const recoveryAnswer = modal.querySelector("#signupRecoveryAnswer").value.trim();
          const result = modal.querySelector("#signupCodeResult");
          result.classList.remove("success");
          if (!nickname || !email || !code || !password || !passwordConfirm || !oshi || !recoveryQuestion || !recoveryAnswer) {
            result.textContent = "닉네임, 이메일, 인증코드, 비밀번호, 오시, 본인확인 질문/답변을 모두 입력해 주세요.";
            return;
          }
          if (!/^\d{6}$/.test(code)) { result.textContent = "인증코드는 숫자 6자리로 입력해 주세요."; return; }
          if (password !== passwordConfirm) { result.textContent = "비밀번호 확인이 일치하지 않아요."; return; }
          if (password.length < 4 || password.length > 20 || /\s/.test(password)) { result.textContent = "비밀번호는 4~20자, 공백 없이 입력해 주세요."; return; }
          const btn = modal.querySelector("#signupSubmit");
          if (btn && btn.disabled) return; // 중복 제출 방지
          // 제출 중에는 인증코드 요청 버튼도 비활성화 (중복 발송 방지)
          const codeBtn = modal.querySelector("#signupCodeSend");
          if (codeBtn) codeBtn.disabled = true;
          const restore = signupBtnLoading(btn, "루미 ID 만드는 중…");
          result.textContent = "루미 ID를 만드는 중…";
          try {
            const response = await postLumiApi({ action: "lumiSignupWithCode", nickname, email, code, password, passwordConfirm, oshi, recoveryQuestion, recoveryAnswer });
            if (response && response.ok === true && response.lumiId) {
              const issuedId = String(response.lumiId || "");
              // 자동 닫힘 없음 — 사용자가 직접 확인 후 루미폰 열기
              loginId.value = issuedId.replace(/\D/g, "").slice(-4);
              loginPin.value = "";

              // 입력 필드 전체 비활성화
              modal.querySelectorAll("input, select, button:not(#signupSuccessOpen):not(#signupSuccessCopy)").forEach(function(el) {
                el.disabled = true;
              });

              // 성공 화면 렌더링
              const box = modal.querySelector(".lumi-signup-box");
              if (box) {
                box.innerHTML =
                  '<div style="padding:8px 0 4px;">' +
                    '<div style="text-align:center;margin-bottom:18px;">' +
                      '<div style="font-size:36px;margin-bottom:8px;">✨</div>' +
                      '<h3 style="margin:0 0 6px;font-size:22px;color:#e06fa3;">루미 ID가 만들어졌어요!</h3>' +
                      '<p style="margin:0;font-size:13px;font-weight:800;color:#9a7087;line-height:1.6;">입력한 이메일로 루미 ID 안내 메일도 발송했어요.</p>' +
                    '</div>' +
                    '<div style="background:#fff5fb;border:1px solid #f0bfd4;border-radius:20px;padding:18px 20px;margin-bottom:18px;text-align:center;">' +
                      '<div style="font-size:12px;font-weight:900;color:#b36d93;margin-bottom:6px;">나의 루미 ID</div>' +
                      '<div style="font-size:28px;font-weight:900;color:#e06fa3;letter-spacing:2px;" id="signupSuccessId">' + issuedId + '</div>' +
                    '</div>' +
                    '<button type="button" id="signupSuccessCopy" style="width:100%;min-height:44px;margin-bottom:10px;border:1px solid #f0bfd4;border-radius:999px;background:#fff;color:#d77ca7;font-weight:900;font-size:15px;cursor:pointer;">루미 ID 복사</button>' +
                    '<button type="button" id="signupSuccessOpen" style="width:100%;min-height:48px;border:0;border-radius:999px;background:#ff5ba5;color:#fff;font-weight:900;font-size:15px;cursor:pointer;">루미폰 열기</button>' +
                    '<p style="margin:14px 0 0;font-size:12px;font-weight:800;color:#9a7087;text-align:center;line-height:1.6;">방금 설정한 비밀번호로 로그인해 주세요.</p>' +
                  '</div>';

                // 복사 버튼
                const copyBtn = box.querySelector("#signupSuccessCopy");
                if (copyBtn) {
                  copyBtn.addEventListener("click", function() {
                    try {
                      navigator.clipboard.writeText(issuedId).then(function() {
                        copyBtn.textContent = "복사됐어요 ✓";
                        copyBtn.style.background = "#f5fff8";
                        copyBtn.style.borderColor = "#bfe7cc";
                        copyBtn.style.color = "#3a8b53";
                        window.setTimeout(function() {
                          copyBtn.textContent = "루미 ID 복사";
                          copyBtn.style.background = "";
                          copyBtn.style.borderColor = "";
                          copyBtn.style.color = "";
                        }, 2000);
                      }).catch(function() {
                        copyBtn.textContent = issuedId + " (직접 복사해 주세요)";
                      });
                    } catch (e) {
                      copyBtn.textContent = issuedId + " (직접 복사해 주세요)";
                    }
                  });
                }

                // 루미폰 열기 버튼 — 클릭 시에만 모달 닫기
                const openBtn = box.querySelector("#signupSuccessOpen");
                if (openBtn) {
                  openBtn.addEventListener("click", function() {
                    closeSignupModal();
                    showMessage("루미 ID가 만들어졌어요. 비밀번호를 입력해 루미폰을 열어 주세요.");
                  });
                }
              }
            } else {
              result.textContent = String((response && (response.message || response.error)) || "루미 ID를 만들지 못했어요.");
              if (codeBtn) codeBtn.disabled = false; // 실패 시 인증코드 버튼 복원
            }
          } catch (e) {
            result.textContent = "루미폰 서버 연결을 확인해 주세요.";
            if (codeBtn) codeBtn.disabled = false;
          } finally {
            restore();
          }
        });
        return modal;
      }

      function openLumiSignupModal() {
        const modal = ensureLumiSignupModal();
        modal.classList.add("show");
        modal.setAttribute("aria-hidden", "false");
      }

      function openLumiRecoveryModal(mode) {
        const modal = ensureLumiRecoveryModal();
        modal.classList.add("show");
        modal.setAttribute("aria-hidden", "false");
        if (mode) {
          const tab = modal.querySelector('[data-recovery-tab="' + mode + '"]');
          if (tab) tab.click();
        }
        if (mode === "reset") {
          const idInput = modal.querySelector("#recoveryResetLumiId");
          if (idInput) idInput.value = getCurrentLumiId() || idInput.value || "";
        }
      }

      function closeLumiRecoveryModal() {
        const modal = document.getElementById("lumiRecoveryModal");
        if (!modal) return;
        modal.classList.remove("show");
        modal.setAttribute("aria-hidden", "true");
      }

      loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        clearMessage();
        appendBootDebug("LOGIN submit start");
        loginId.value = normalizeLoginIdInput(loginId.value);
        const lumiId = normId(loginId.value);
        const pin = loginPin.value.trim();
        if (!lumiId || !pin) {
          showMessage("루미 ID와 비밀번호를 입력해 주세요.");
          return;
        }

        // PATCH 51-38: 중복 submit 방지 + 즉각 시각 피드백
        const submitBtn = loginForm.querySelector("button[type='submit']");
        const originalText = submitBtn ? submitBtn.textContent : "";
        if (submitBtn && submitBtn.disabled) return; // 이미 처리 중이면 무시
        let loginLoadingTimers = [];
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = "계정 확인 중…";
          loginLoadingTimers = [
            window.setTimeout(function() {
              if (submitBtn && submitBtn.disabled) submitBtn.textContent = "보안 확인 중…";
            }, 1200),
            window.setTimeout(function() {
              if (submitBtn && submitBtn.disabled) submitBtn.textContent = "기록을 불러오는 중…";
            }, 3200)
          ];
        }

        try {
          const user = await loginLumiPhone(lumiId, pin);
          if (submitBtn && submitBtn.disabled) submitBtn.textContent = "루미폰 여는 중…";
          saveLoginState(user);
          await openApp({ user: user });
          // openApp 성공 후엔 loginView가 hidden 상태 → 버튼 복원 불필요하지만 안전하게 처리
        } catch (error) {
          const msg = String(error && error.message || "");
          appendBootDebug("LOGIN catch: " + msg);
          appendBootDebug("login UI error: " + msg);
          if (msg === "missingApiEndpoint") showMessage("루미폰 API 주소가 아직 설정되지 않았어요. LUMI_API_ENDPOINT를 Apps Script 웹앱 URL로 설정해 주세요.");
          else if (msg === "apiTimeout" || msg === "apiNetworkError") { console.warn("[루미폰] 서버 연결 오류:", msg); showMessage("루미폰 서버에 연결할 수 없어요. 잠시 후 다시 시도해 주세요."); }
          else if (/5회|10분|잠금|locked|여러 번|잠시 후/.test(msg)) showMessage("비밀번호를 5회 이상 잘못 입력했어요. 안전을 위해 잠시 후 다시 시도해 주세요.");
          else if (msg && msg !== "loginFailed") showMessage(msg);
          else showMessage("루미 ID 또는 비밀번호를 확인해 주세요.");
        } finally {
          // Security Patch 2-2C: 로그인 로딩 문구 타이머 정리
          loginLoadingTimers.forEach(function(timerId) {
            try { window.clearTimeout(timerId); } catch (e) {}
          });
          // PATCH 51-38-fix1: 성공/실패 모두 버튼 원복 (로그아웃 후 재사용 대비)
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText || "루미폰 열기";
          }
        }
      });

      loginId.addEventListener("input", () => {
        const normalized = normalizeLoginIdInput(loginId.value);
        if (loginId.value !== normalized) loginId.value = normalized;
      });

      loginId.addEventListener("paste", () => {
        window.setTimeout(() => {
          loginId.value = normalizeLoginIdInput(loginId.value);
        }, 0);
      });

      if (DEBUG_MODE) installChromeRecoveryPanel();
      setLumiLang(readLumiLang(), false);
      loginLangButtons.forEach((button) => {
        button.addEventListener("click", () => setLumiLang(button.dataset.lumiLang, true));
      });

      if (sampleBtn) {
        sampleBtn.hidden = true;
        sampleBtn.setAttribute("aria-hidden", "true");
      }
      newIdBtn.addEventListener("click", openLumiSignupModal);
      forgotPinBtn.addEventListener("click", openLumiRecoveryModal);
      logoutBtn.addEventListener("click", closeApp);

      $$(".tab").forEach((button) => button.addEventListener("click", () => go(button.dataset.page)));
      $$("[data-go]").forEach((button) => button.addEventListener("click", () => go(button.dataset.go)));
      $$(".mini-tab").forEach((button) => button.addEventListener("click", () => setMiniPage(button.dataset.miniTarget)));
      document.addEventListener("click", (event) => {
        const mailOpen = event.target.closest("[data-mail-open]");
        if (mailOpen) {
          openMailModal(mailOpen.dataset.mailOpen);
          return;
        }
        const mailFilter = event.target.closest("[data-mail-filter]");
        if (mailFilter) {
          setMailFilter(mailFilter.dataset.mailFilter, mailFilter.dataset.mailFilterValue || "all");
          return;
        }
        const mailClose = event.target.closest("[data-mail-close]");
        if (mailClose) {
          closeMailModal();
          return;
        }
        const logOpen = event.target.closest("[data-lumilog-open]");
        if (logOpen) {
          openLumiLogModal(logOpen.dataset.lumilogOpen);
          return;
        }
        const logFilter = event.target.closest("[data-lumilog-filter]");
        if (logFilter) {
          setLumiLogFilter(logFilter.dataset.lumilogFilter, logFilter.dataset.lumilogFilterValue || "all");
          return;
        }
        const logClose = event.target.closest("[data-lumilog-close]");
        if (logClose) {
          closeLumiLogModal();
        }
      });
      const mailInboxPrev = document.getElementById("mailInboxPrev");
      const mailInboxNext = document.getElementById("mailInboxNext");
      const mailSavedPrev = document.getElementById("mailSavedPrev");
      const mailSavedNext = document.getElementById("mailSavedNext");
      const mailSaveToggle = document.getElementById("mailSaveToggle");
      const lumiLogListPrev = document.getElementById("lumiLogListPrev");
      const lumiLogListNext = document.getElementById("lumiLogListNext");
      const lumiLogSavedPrev = document.getElementById("lumiLogSavedPrev");
      const lumiLogSavedNext = document.getElementById("lumiLogSavedNext");
      const lumiLogSaveToggle = document.getElementById("lumiLogSaveToggle");
      if (mailInboxPrev) mailInboxPrev.addEventListener("click", () => changeMailPage("inbox", -1));
      if (mailInboxNext) mailInboxNext.addEventListener("click", () => changeMailPage("inbox", 1));
      if (mailSavedPrev) mailSavedPrev.addEventListener("click", () => changeMailPage("saved", -1));
      if (mailSavedNext) mailSavedNext.addEventListener("click", () => changeMailPage("saved", 1));
      if (mailSaveToggle) mailSaveToggle.addEventListener("click", () => {
        if (!mailState.currentId) return;
        const nextSaved = !isMailSaved(mailState.currentId);
        setMailSaved(mailState.currentId, nextSaved);
        mailSaveToggle.textContent = nextSaved ? "소장해제" : "소장하기";
        renderMailAll();
        closeMailModal();
      });
      if (lumiLogListPrev) lumiLogListPrev.addEventListener("click", () => changeLumiLogPage("list", -1));
      if (lumiLogListNext) lumiLogListNext.addEventListener("click", () => changeLumiLogPage("list", 1));
      if (lumiLogSavedPrev) lumiLogSavedPrev.addEventListener("click", () => changeLumiLogPage("saved", -1));
      if (lumiLogSavedNext) lumiLogSavedNext.addEventListener("click", () => changeLumiLogPage("saved", 1));
      if (lumiLogSaveToggle) lumiLogSaveToggle.addEventListener("click", () => {
        if (!lumiLogState.currentId) return;
        const nextSaved = !isLumiLogSaved(lumiLogState.currentId);
        setLumiLogSaved(lumiLogState.currentId, nextSaved);
        lumiLogSaveToggle.textContent = nextSaved ? "소장해제" : "소장하기";
        renderLumiLogAll();
      });
      renderMailAll();
      renderLumiLogAll();
      if (typeof window.showLumiMessageInbox === "function") window.showLumiMessageInbox();
      $$("[data-ticket-prev]").forEach((button) => button.addEventListener("click", () => updateTicketPager(button.dataset.ticketPrev, -1)));
      $$("[data-ticket-next]").forEach((button) => button.addEventListener("click", () => updateTicketPager(button.dataset.ticketNext, 1)));
      $$(".ticket-filter-pill").forEach((button) => button.addEventListener("click", () => setTicketFilter(button)));
      initTicketPagers();

      if (codeReadyBtn && codeToast) {
        codeReadyBtn.addEventListener("click", () => codeToast.classList.add("show"));
      }

      if (profileEditOpen) profileEditOpen.addEventListener("click", openProfileEditor);
      if (profileCancel) profileCancel.addEventListener("click", () => { profileTextComposing = false; closeProfileEditor(true); });

      if (profileEditor) {
        profileEditor.addEventListener("click", (event) => {
          if (event.target === profileEditor) closeProfileEditor(true);
        });
      }

      function commitProfileSave(confirmedOshiChange) {
        profileTextComposing = false;
        trimAllProfileInputs();
        updateProfileCounters();
        profileDraft.info = collectProfileForm();
        if (!profileDraft.info.displayName) {
          showProfileError("표시 닉네임을 입력해 주세요.");
          return;
        }
        // space/letterName/broadcastName은 선택 입력 — 필수 검증 없음

        const nextState = normalizeProfileState(profileDraft);
        const beforeOshi = normalizeProfileInfo(profileState.info).oshi;
        const afterOshi = normalizeProfileInfo(nextState.info).oshi;
        const oshiChanged = beforeOshi !== afterOshi;

        if (oshiChanged) {
          const lastChangedAt = getLastOshiChangedAt();
          if (!canChangeOshiNow(lastChangedAt)) {
            showOshiLimitMessage(lastChangedAt);
            return;
          }
          if (!confirmedOshiChange) {
            showOshiChangeConfirm(beforeOshi, afterOshi);
            return;
          }
          setLastOshiChangedAt(Date.now());
        }

        profileState = nextState;
        if (!saveProfileState()) {
          showProfileError("이미지 용량이 커서 저장이 어려워요. 조금 작은 이미지로 다시 선택해 주세요.");
          return;
        }
        renderProfileView();
        closeProfileEditor(false);
      }

      if (profileApply) {
        profileApply.addEventListener("click", () => commitProfileSave(false));
      }
      if (profileOshiButton) profileOshiButton.addEventListener("click", openProfileOshiModal);
      if (profileOshiClose) profileOshiClose.addEventListener("click", closeProfileOshiModal);
      if (profileOshiModal) {
        profileOshiModal.addEventListener("click", (event) => {
          if (event.target === profileOshiModal) closeProfileOshiModal();
        });
      }
      $$(".profile-oshi-option[data-oshi-value]").forEach((button) => {
        button.addEventListener("click", () => selectProfileOshi(button.dataset.oshiValue));
      });
      if (profileOshiConfirmClose) profileOshiConfirmClose.addEventListener("click", closeProfileOshiConfirmModal);
      if (profileOshiConfirmCancel) profileOshiConfirmCancel.addEventListener("click", closeProfileOshiConfirmModal);
      if (profileOshiConfirmApply) profileOshiConfirmApply.addEventListener("click", () => {
        closeProfileOshiConfirmModal();
        commitProfileSave(true);
      });
      if (profileOshiConfirmModal) {
        profileOshiConfirmModal.addEventListener("click", (event) => {
          if (event.target === profileOshiConfirmModal) closeProfileOshiConfirmModal();
        });
      }
      if (profileTitlePick) profileTitlePick.addEventListener("click", openProfileTitleModal);
      if (profileTitleQuickOpen) profileTitleQuickOpen.addEventListener("click", openProfileTitleModal);
      if (profileShareOpen) profileShareOpen.addEventListener("click", openProfileSharePanel);
      if (profileEditorClose) profileEditorClose.addEventListener("click", () => { profileTextComposing = false; closeProfileEditor(true); });
      if (profileEditorSaveTop) profileEditorSaveTop.addEventListener("click", () => commitProfileSave(false));
      if (profileSimpleClose) profileSimpleClose.addEventListener("click", closeProfileSimpleModal);
      if (profileSimpleOk) profileSimpleOk.addEventListener("click", closeProfileSimpleModal);
      if (profileSimpleModal) {
        profileSimpleModal.addEventListener("click", (event) => {
          if (event.target === profileSimpleModal) closeProfileSimpleModal();
        });
      }
      if (profileTitleClose) profileTitleClose.addEventListener("click", closeProfileTitleModal);
      if (profileTitleModal) {
        profileTitleModal.addEventListener("click", (event) => {
          if (event.target === profileTitleModal) closeProfileTitleModal();
        });
      }
      $$(".profile-title-option[data-title-value]").forEach((button) => {
        button.addEventListener("click", () => selectProfileTitle(button.dataset.titleValue));
      });
      getAchievementCards().forEach((card) => {
        card.addEventListener("click", (event) => {
          event.preventDefault();
          openAchievementModal(card);
        });
      });
      achievementFilterButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          filterAchievements(button.dataset.achievementFilter || "전체");
        });
      });
      if (achievementModalClose) achievementModalClose.addEventListener("click", closeAchievementModal);
      if (achievementModal) {
        achievementModal.addEventListener("click", (event) => {
          if (event.target === achievementModal) closeAchievementModal();
        });
      }
      if (achievementModalEquip) {
        achievementModalEquip.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          if (achievementModalEquip.disabled) return;
          const title = achievementModalEquip.dataset.achieveEquipTitle || "";
          closeAchievementModal();
          equipAchievementTitle(title, true);
        });
      }
      if (achievementModalRepresentative) {
        achievementModalRepresentative.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          if (!currentAchievementCard || achievementModalRepresentative.disabled) return;
          closeAchievementModal();
          setRepresentativeAchievement(currentAchievementCard);
        });
      }
      achievementShareActionButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          handleAchievementShareAction(button.dataset.shareScope || "summary", button.dataset.shareAction || "native");
        });
      });
      if (achievementSummaryProgressCard) {
        achievementSummaryProgressCard.addEventListener("click", () => {
          const title = achievementSummaryProgressCard.dataset.summaryAchievementTitle || "";
          const card = title ? findAchievementCardByTitle(title) : null;
          if (card) openAchievementModal(card);
        });
      }
      if (achievementSummaryRepresentativeCard) {
        achievementSummaryRepresentativeCard.addEventListener("click", () => {
          const title = achievementSummaryRepresentativeCard.dataset.summaryAchievementTitle || "";
          const card = title ? findAchievementCardByTitle(title) : null;
          if (card) openAchievementModal(card);
        });
      }
      if (achievementPagePrev) {
        achievementPagePrev.addEventListener("click", () => {
          achievementCurrentPage -= 1;
          renderAchievementPage();
        });
      }
      if (achievementPageNext) {
        achievementPageNext.addEventListener("click", () => {
          achievementCurrentPage += 1;
          renderAchievementPage();
        });
      }
      updateAchievementSummary();
      filterAchievements("전체");
      $$(".profile-title-tab").forEach((button) => {
        button.addEventListener("click", () => {
          const owned = button.dataset.titlePanel === "owned";
          $$(".profile-title-tab").forEach((tab) => tab.classList.toggle("active", tab === button));
          const ownedPanel = $("#profileTitleOwned");
          const lockedPanel = $("#profileTitleLocked");
          if (ownedPanel) ownedPanel.classList.toggle("active", owned);
          if (lockedPanel) lockedPanel.classList.toggle("active", !owned);
        });
      });
      if (profileCoverPick && profileCoverInput) profileCoverPick.addEventListener("click", () => profileCoverInput.click());
      if (profileAvatarPick && profileAvatarInput) profileAvatarPick.addEventListener("click", () => profileAvatarInput.click());
      if (profileCoverInput) profileCoverInput.addEventListener("change", () => readProfileFile(profileCoverInput, "cover"));
      if (profileAvatarInput) profileAvatarInput.addEventListener("change", () => readProfileFile(profileAvatarInput, "avatar"));

      if (profileMediaClose) profileMediaClose.addEventListener("click", closeProfileMediaModal);
      if (profileMediaApply) profileMediaApply.addEventListener("click", applyProfileMediaCrop);
      if (profileMediaReset) profileMediaReset.addEventListener("click", resetProfileMediaCrop);
      if (profileMediaZoom) {
        profileMediaZoom.addEventListener("input", () => {
          profileCropPart = normalizeProfilePart(Object.assign({}, profileCropPart, { scale: Number(profileMediaZoom.value) || 1 }));
          renderProfileCrop();
        });
      }
      const profilePointers = new Map();
      let profilePinchStart = null;

      function profilePointerDistance(points) {
        if (points.length < 2) return 0;
        return Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
      }

      function resetProfilePointerState() {
        profileDragState = null;
        profilePinchStart = null;
        profilePointers.clear();
      }

      if (profileMediaStage) {
        profileMediaStage.addEventListener("pointerdown", (event) => {
          event.preventDefault();
          profilePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
          profileMediaStage.setPointerCapture(event.pointerId);

          const points = Array.from(profilePointers.values());
          if (points.length === 1) {
            profileDragState = { id: event.pointerId, x: event.clientX, y: event.clientY };
            profilePinchStart = null;
          } else if (points.length >= 2) {
            profileDragState = null;
            profilePinchStart = {
              distance: Math.max(profilePointerDistance(points), 1),
              scale: normalizeProfilePart(profileCropPart).scale
            };
          }
        }, { passive: false });

        profileMediaStage.addEventListener("pointermove", (event) => {
          if (!profilePointers.has(event.pointerId)) return;
          event.preventDefault();

          const previous = profilePointers.get(event.pointerId);
          profilePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
          const points = Array.from(profilePointers.values());

          if (points.length >= 2 && profilePinchStart) {
            const distance = Math.max(profilePointerDistance(points), 1);
            const nextScale = profilePinchStart.scale * (distance / profilePinchStart.distance);
            profileCropPart = normalizeProfilePart(Object.assign({}, profileCropPart, { scale: nextScale }));
            renderProfileCrop();
            return;
          }

          if (points.length === 1 && profileDragState && profileDragState.id === event.pointerId) {
            const dx = event.clientX - previous.x;
            const dy = event.clientY - previous.y;
            updateProfileCropPosition(dx, dy);
          }
        }, { passive: false });

        ["pointerup", "pointercancel", "pointerleave"].forEach((type) => {
          profileMediaStage.addEventListener(type, (event) => {
            profilePointers.delete(event.pointerId);
            const points = Array.from(profilePointers.values());

            if (points.length === 1) {
              profileDragState = { id: Array.from(profilePointers.keys())[0], x: points[0].x, y: points[0].y };
              profilePinchStart = null;
            } else if (points.length === 0) {
              resetProfilePointerState();
            }
          });
        });
      }


      let profileTextComposing = false;

      function updateProfileCountersSoft() {
        if (profileTextComposing) return;
        updateProfileCounters();
      }

      [profileInputDisplayName, profileInputLetterName, profileInputBroadcastName, profileInputSpace].forEach((input) => {
        if (!input) return;
        input.addEventListener("compositionstart", () => {
          profileTextComposing = true;
        });
        input.addEventListener("compositionend", () => {
          profileTextComposing = false;
        });
        input.addEventListener("blur", () => { updateProfileCountersSoft(); });
      });
      [profileBirthdayMonth, profileBirthdayDay].forEach((select) => {
        if (!select) return;
        select.addEventListener("change", updateProfileCounters);
      });

      populateBirthdaySelects();
      loadProfileState();
      renderProfileView();
      renderProfileEditor();

      // PATCH 51-39: 세션/자동 로그인 강화
      // sessionStorage에 세션 플래그가 있으면 API 재인증 없이 즉시 앱 진입
      // localStorage에 저장된 유저 정보로 바로 openApp() 호출
      (function() {
        const savedLoginState = readLoginState();
        if (!savedLoginState) {
          appendBootDebug("saved login none");
          return;
        }
        appendBootDebug("saved login found: " + (savedLoginState.lumiId || savedLoginState.id));
        currentUser = normalizeLumiUser(savedLoginState);
        loginId.value = normalizeLoginIdInput(savedLoginState.id);

        // sessionStorage 플래그가 있으면 즉시 진입 (새로고침 등 같은 세션)
        var sessionActive = false;
        try { sessionActive = !!sessionStorage.getItem("lumiphone.session.active"); } catch(e) {}

        if (sessionActive) {
          appendBootDebug("session active: instant openApp");
          openApp({ persist: true, user: currentUser });
        } else {
          // 새 탭/첫 로드: savedLoginState만으로도 바로 진입 (서버 재인증 없이)
          // 로그인 상태가 localStorage에 있으면 신뢰 → 즉시 진입 + sessionStorage 플래그 갱신
          appendBootDebug("saved login: auto openApp (no re-auth)");
          try { sessionStorage.setItem("lumiphone.session.active", savedLoginState.lumiId || savedLoginState.id); } catch(e) {}
          openApp({ persist: true, user: currentUser });
        }
      })();

      updateClock();
      setInterval(updateClock, 30000);
    })();


/* ===== merged from exchange-mobile-pagination-clean-js ===== */
(() => {
      "use strict";
      const exchangeCards = Array.from(document.querySelectorAll("#exchangeList .exchange-card"));
      const exchangeFilterButtons = Array.from(document.querySelectorAll(".exchange-filter-pill"));
      const exchangePagePrev = document.querySelector("#exchangePagePrev");
      const exchangePageNext = document.querySelector("#exchangePageNext");
      const exchangePageText = document.querySelector("#exchangePageText");
      const exchangeMsg = document.querySelector("#exchangeMsg");
      const pageSize = 4;
      let currentFilter = "전체";
      let currentPage = 1;

      function filteredCards() {
        return exchangeCards.filter((card) => currentFilter === "전체" || card.dataset.exchangeCategory === currentFilter);
      }

      function renderExchangePage() {
        if (!exchangeCards.length) return;
        const list = filteredCards();
        const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
        if (currentPage > totalPages) currentPage = totalPages;
        if (currentPage < 1) currentPage = 1;
        const start = (currentPage - 1) * pageSize;
        const visibleSet = new Set(list.slice(start, start + pageSize));
        exchangeCards.forEach((card) => { card.hidden = !visibleSet.has(card); });
        if (exchangePageText) exchangePageText.textContent = currentPage + " / " + totalPages;
        if (exchangePagePrev) exchangePagePrev.disabled = currentPage <= 1;
        if (exchangePageNext) exchangePageNext.disabled = currentPage >= totalPages;
        if (exchangeMsg) {
          exchangeMsg.textContent = currentFilter === "전체"
            ? "지금은 보상 후보와 포인트 기준을 먼저 잡아둔 상태예요. 실제 신청, 차감, 멤버별 가능 범위는 추후 공개됩니다."
            : currentFilter + " 보상 후보만 보고 있어요. 실제 신청, 차감, 멤버별 가능 범위는 추후 공개됩니다.";
        }
      }

      function setExchangeFilter(filter) {
        currentFilter = filter || "전체";
        currentPage = 1;
        exchangeFilterButtons.forEach((button) => {
          button.classList.toggle("active", button.dataset.exchangeFilter === currentFilter);
        });
        renderExchangePage();
      }

      exchangeFilterButtons.forEach((button) => {
        button.addEventListener("click", () => setExchangeFilter(button.dataset.exchangeFilter || "전체"));
      });
      if (exchangePagePrev) {
        exchangePagePrev.addEventListener("click", () => {
          currentPage -= 1;
          renderExchangePage();
        });
      }
      if (exchangePageNext) {
        exchangePageNext.addEventListener("click", () => {
          currentPage += 1;
          renderExchangePage();
        });
      }
      exchangeCards.forEach((card) => {
        card.addEventListener("click", () => {
          const title = card.dataset.exchangeTitle || "보상";
          const cost = card.dataset.exchangeCost || "-";
          const desc = card.dataset.exchangeDesc || "준비 중인 보상 후보예요.";
          if (typeof window.openProfileSimpleModal === "function") {
            window.openProfileSimpleModal("교환소 준비중", [title + " · " + cost, desc, "실제 신청과 포인트 차감은 추후 연결됩니다."]);
            return;
          }
          alert(title + " · " + cost + "\n" + desc + "\n실제 신청과 포인트 차감은 추후 연결됩니다.");
        });
      });
      renderExchangePage();
    })();



/* ===== merged from guide-mobile-accordion-pagination-js ===== */
(() => {
      "use strict";
      const guideRoot = document.getElementById("page-guide");
      if (!guideRoot) return;
      const guideCards = Array.from(guideRoot.querySelectorAll(".guide-accordion-card"));
      const guideFilterButtons = Array.from(guideRoot.querySelectorAll(".guide-filter-pill"));
      const guideQuickButtons = Array.from(guideRoot.querySelectorAll(".guide-quick-card"));
      const guidePrev = guideRoot.querySelector('[data-guide-page="prev"]');
      const guideNext = guideRoot.querySelector('[data-guide-page="next"]');
      const guidePageText = document.getElementById("guidePageText");
      const guideNote = document.getElementById("guideNote");
      const pageSize = 4;
      let guideFilter = "전체";
      let guidePage = 1;

      function guideFilteredCards() {
        if (guideFilter === "전체") return guideCards;
        return guideCards.filter((card) => card.dataset.guideCategory === guideFilter);
      }

      function renderGuide() {
        const list = guideFilteredCards();
        const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
        if (guidePage > totalPages) guidePage = totalPages;
        if (guidePage < 1) guidePage = 1;
        const start = (guidePage - 1) * pageSize;
        const visible = new Set(list.slice(start, start + pageSize));
        guideCards.forEach((card) => {
          card.hidden = !visible.has(card);
          if (card.hidden) card.classList.remove("open");
        });
        if (guidePageText) guidePageText.textContent = guidePage + " / " + totalPages;
        if (guidePrev) guidePrev.disabled = guidePage <= 1;
        if (guideNext) guideNext.disabled = guidePage >= totalPages;
        if (guideNote) {
          guideNote.textContent = guideFilter === "전체"
            ? "가이드는 운영 기준에 맞춰 순차적으로 업데이트됩니다. 문의/이동 링크도 필요한 항목부터 연결할 예정이에요."
            : guideFilter + " 가이드만 보고 있어요. 필요한 항목을 누르면 설명이 열립니다.";
        }
      }

      function setGuideFilter(filter) {
        guideFilter = filter || "전체";
        guidePage = 1;
        guideFilterButtons.forEach((button) => {
          button.classList.toggle("active", button.dataset.guideFilter === guideFilter);
        });
        renderGuide();
      }

      function openGuideItem(key) {
        const target = guideCards.find((card) => card.dataset.guideKey === key);
        if (!target) return;
        const category = target.dataset.guideCategory || "전체";
        setGuideFilter(category);
        const list = guideFilteredCards();
        const index = list.indexOf(target);
        if (index >= 0) guidePage = Math.floor(index / pageSize) + 1;
        renderGuide();
        guideCards.forEach((card) => card.classList.toggle("open", card === target));
        target.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }

      guideFilterButtons.forEach((button) => {
        button.addEventListener("click", () => setGuideFilter(button.dataset.guideFilter || "전체"));
      });
      guideQuickButtons.forEach((button) => {
        button.addEventListener("click", () => openGuideItem(button.dataset.guideOpen));
      });
      guideCards.forEach((card) => {
        const head = card.querySelector(".guide-accordion-head");
        if (!head) return;
        head.addEventListener("click", () => {
          const willOpen = !card.classList.contains("open");
          guideCards.forEach((item) => item.classList.remove("open"));
          if (willOpen) card.classList.add("open");
        });
      });
      if (guidePrev) guidePrev.addEventListener("click", () => { guidePage -= 1; renderGuide(); });
      if (guideNext) guideNext.addEventListener("click", () => { guidePage += 1; renderGuide(); });
      renderGuide();
    })();



/* ===== merged from record-memory-pagination-js ===== */
/* PATCH 51-35: visits API 연동으로 교체 */
(() => {
      "use strict";
      const recordCardList  = document.getElementById("recordCardList");
      const recordFilterButtons = Array.from(document.querySelectorAll(".record-filter-pill"));
      const recordPagePrev  = document.querySelector("#recordPagePrev");
      const recordPageNext  = document.querySelector("#recordPageNext");
      const recordPageText  = document.querySelector("#recordPageText");
      const recordMsg       = document.querySelector("#recordMsg");
      const recordMonthPrev = document.querySelector("#recordMonthPrev");
      const recordMonthNext = document.querySelector("#recordMonthNext");
      const recordMonthLabel = document.querySelector("#recordMonthLabel");
      const pageSize = 4;
      const minYear  = 2026;
      let currentFilter = "전체";
      let currentPage   = 1;
      let currentYear   = new Date().getFullYear();
      let currentMonth  = new Date().getMonth() + 1;
      // PATCH 51-45: openApp에서 visits 캐시를 window 브릿지로 미리 전달받으면 즉시 복원
      let runtimeVisits = (function() {
        var cached = window.__lumiCachedVisits;
        if (Array.isArray(cached) && cached.length > 0) return cached;
        return [];
      })();
      // PATCH 51-57-fix5: 기록 타임라인은 visits(방문) + checkins(루미 체크인)를 함께 보여준다.
      // 단, 집계 기준은 섞지 않는다. 라이브 수는 visits, 체크인/스탬프 수는 renderCheckins가 관리한다.
      let runtimeCheckins = (function() {
        var cached = window.__lumiRecordCheckins;
        if (Array.isArray(cached) && cached.length > 0) return cached;
        return [];
      })();
      let visitsLoadState = runtimeVisits.length > 0 ? "loaded" : "idle"; // PATCH 51-41
      let recordUserMovedMonth = false;
      let recordAutoJumpDone   = runtimeVisits.length > 0;

      // PATCH 51-45: 캐시에서 복원된 경우 즉시 최신 월로 이동
      if (runtimeVisits.length > 0) {
        (function() {
          for (var i = 0; i < runtimeVisits.length; i++) {
            var raw = runtimeVisits[i].eventDate || runtimeVisits[i].visitedAt || "";
            var d = new Date(raw);
            if (!isNaN(d.getTime())) {
              currentYear  = d.getFullYear();
              currentMonth = d.getMonth() + 1;
              break;
            }
          }
        })();
      }

      function pad2(v) { return String(v).padStart(2, "0"); }
      function currentMonthKey() { return currentYear + "." + pad2(currentMonth); }

      function updateMonthLabel() {
        if (recordMonthLabel) recordMonthLabel.textContent = currentYear + "년 " + pad2(currentMonth) + "월";
        if (recordMonthPrev) recordMonthPrev.disabled = currentYear <= minYear && currentMonth <= 1;
      }

      // PATCH 51-57-fix4 + Lumi Signup Patch 1-fix2A: 오른쪽 히어로 카드 첫 루미 방문일
      function syncFirstVisitHeroFromVisits() {
        try {
          var cards = Array.from(document.querySelectorAll(".record-hero-card"));
          var target = cards.find(function(card) {
            var label = card.querySelector("small");
            var text = label ? String(label.textContent || "").trim() : "";
            return text.indexOf("첫 루미 방문일") !== -1 || text.indexOf("루미 ID 생성일") !== -1;
          }) || cards[1];
          if (!target) return;
          var label = target.querySelector("small");
          var b = target.querySelector("b");
          var span = target.querySelector("span");
          if (label) label.textContent = "첫 루미 방문일";
          if (!runtimeVisits || !runtimeVisits.length) {
            // visits가 없으면 샘플/이전 계정 잔상 방지 - 빈 상태로 표시
            if (b) b.textContent = "-";
            if (span) span.textContent = "아직 루미벨 방문 기록이 없어요";
            return;
          }
          var first = null;
          runtimeVisits.forEach(function(v) {
            var raw = v.eventDate || v.visitedAt || "";
            var d = new Date(raw);
            if (isNaN(d.getTime())) return;
            if (!first || d.getTime() < first.getTime()) first = d;
          });
          if (!first) return;
          var date = first.getFullYear() + "." + pad2(first.getMonth() + 1) + "." + pad2(first.getDate());
          if (b) b.textContent = date;
          if (span) span.textContent = "오프라인 기록과 온라인 연결감을 함께 저장해요";
        } catch(e) {}
      }

      // visitType → 필터 카테고리 매핑
      function visitTypeToCategory(visitType) {
        if (visitType === "live") return "라이브";
        if (visitType === "checkin") return "체크인";
        if (visitType === "online") return "온라인";
        return "라이브";
      }

      // visitType → 아이콘
      function visitTypeToIcon(visitType) {
        if (visitType === "live") return "🎤";
        if (visitType === "checkin") return "📸";
        if (visitType === "online") return "📡";
        return "🎤";
      }

      function normalizeCheckinForRecord(item) {
        item = item || {};
        var stampCount = parseInt(item.stampCount || 0, 10) || 0;
        var eventTitle = item.eventTitle || "루미 체크인";
        var member = item.memberName || item.member || "";
        var rawDate = item.checkedInAt || item.checkedAt || item.eventDate || "";
        return {
          visitType: "checkin",
          eventDate: rawDate,
          visitedAt: rawDate,
          eventTitle: "루미 체크인 스탬프",
          note: eventTitle + (member ? " · " + member : "") + (stampCount > 0 ? " · 스탬프 +" + stampCount + "개" : ""),
          _recordSource: "checkin"
        };
      }

      function allRecordItems() {
        var visitItems = Array.isArray(runtimeVisits) ? runtimeVisits.slice() : [];
        var checkinItems = (Array.isArray(runtimeCheckins) ? runtimeCheckins : [])
          .filter(function(item) { return String(item.status || "active") === "active"; })
          .map(normalizeCheckinForRecord);
        return visitItems.concat(checkinItems).sort(function(a, b) {
          var da = new Date(a.eventDate || a.visitedAt || "");
          var db = new Date(b.eventDate || b.visitedAt || "");
          if (isNaN(da.getTime()) && isNaN(db.getTime())) return 0;
          if (isNaN(da.getTime())) return 1;
          if (isNaN(db.getTime())) return -1;
          return db.getTime() - da.getTime();
        });
      }

      function filteredVisits() {
        return allRecordItems().filter(function(v) {
          var matchFilter = currentFilter === "전체" || visitTypeToCategory(v.visitType) === currentFilter;
          // PATCH 51-35-fix3: new Date()로 파싱 (시트에서 Date 객체 직렬화 형태로 올 수 있음)
          var raw = v.eventDate || v.visitedAt || "";
          var d = new Date(raw);
          var matchMonth = !isNaN(d.getTime()) &&
            d.getFullYear() === currentYear &&
            (d.getMonth() + 1) === currentMonth;
          return matchFilter && matchMonth;
        });
      }

      function renderRecordPage() {
        updateMonthLabel();
        syncFirstVisitHeroFromVisits();
        if (!recordCardList) return;

        const list = filteredVisits();
        const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
        currentPage = Math.min(Math.max(1, currentPage), totalPages);

        const pageItems = list.slice((currentPage - 1) * pageSize, currentPage * pageSize);

        if (pageItems.length === 0) {
          const hasAnyRecord = allRecordItems().length > 0;
          const waiting = !hasAnyRecord && visitsLoadState !== "loaded";
          recordCardList.innerHTML =
            '<article class="record-memory-card" data-record-category="전체">' +
            '<span class="record-memory-icon">🕰️</span>' +
            '<time>' + (waiting ? "" : currentMonthKey()) + '</time>' +
            '<b>' + (waiting ? "기록을 불러오는 중…" : (!hasAnyRecord ? "아직 기록이 없어요" : currentMonthKey() + " 기록 없음")) + '</b>' +
            '<span>' + (waiting ? "잠시 후 자동으로 갱신돼요." : (!hasAnyRecord ? "루미벨과 함께한 순간이 생기면 이곳에 차곡차곡 남아요." : "이 달에는 기록이 없어요.")) + '</span>' +
            '<em>안내</em></article>';
        } else {
          recordCardList.innerHTML = pageItems.map(function(v) {
            var cat  = visitTypeToCategory(v.visitType);
            var icon = visitTypeToIcon(v.visitType);
            // PATCH 51-35-fix3: new Date()로 파싱해서 yyyy.MM.dd 형식으로 표시
            var raw = v.eventDate || v.visitedAt || "";
            var d = new Date(raw);
            var date = isNaN(d.getTime())
              ? raw.slice(0, 10).replace(/-/g, ".")
              : d.getFullYear() + "." + pad2(d.getMonth() + 1) + "." + pad2(d.getDate());
            var title = v.eventTitle || "루미벨 공연";
            var desc  = v.note || (cat + " · " + date);
            return '<article class="record-memory-card" ' +
              'data-record-category="' + cat + '" ' +
              'data-record-title="' + title + '" ' +
              'data-record-date="' + date + '" ' +
              'data-record-desc="' + desc + '">' +
              '<span class="record-memory-icon">' + icon + '</span>' +
              '<time>' + date + '</time>' +
              '<b>' + title + '</b>' +
              '<span>' + desc + '</span>' +
              '<em>' + cat + '</em>' +
              '</article>';
          }).join("");

          // 카드 클릭 이벤트
          Array.from(recordCardList.querySelectorAll(".record-memory-card")).forEach(function(card) {
            card.addEventListener("click", function() {
              const t = card.dataset.recordTitle || "기록";
              const d = card.dataset.recordDate  || "";
              const s = card.dataset.recordDesc  || "루미벨과 이어진 기록이에요.";
              if (typeof window.openProfileSimpleModal === "function") {
                window.openProfileSimpleModal("추억의 시간", [t, d, s]);
              } else {
                alert(t + "\n" + d + "\n" + s);
              }
            });
          });
        }

        if (recordPageText) recordPageText.textContent = currentPage + " / " + totalPages;
        if (recordPagePrev) recordPagePrev.disabled = currentPage <= 1;
        if (recordPageNext) recordPageNext.disabled = currentPage >= totalPages;
        if (recordMsg) {
          const hasAnyRecord = allRecordItems().length > 0;
          const waiting = !hasAnyRecord && visitsLoadState !== "loaded";
          recordMsg.textContent = runtimeVisits.length > 0
            ? "라이브 방문 " + runtimeVisits.filter(function(v){ return v.visitType === "live"; }).length + "회 기록됨"
            : (waiting ? "기록을 불러오는 중…" : (hasAnyRecord ? "루미 체크인 기록이 표시돼요." : "활동 기록이 연결되면 이곳에 표시돼요."));
        }

        // record-stat-card 라이브 수치 갱신
        const statCards = document.querySelectorAll(".record-stat-card");
        if (statCards.length >= 1) {
          const liveCount = runtimeVisits.filter(function(v){ return v.visitType === "live"; }).length;
          statCards[0].querySelector("b").textContent = liveCount + "회";
        }
      }

      // PATCH 51-42: 월 이동 시 이전 카드가 한 프레임 겹쳐 보이는 잔상 완화
      function renderRecordPageAfterMonthMove() {
        if (!recordCardList) {
          renderRecordPage();
          return;
        }
        var h = recordCardList.offsetHeight || 0;
        if (h) recordCardList.style.minHeight = h + "px";
        recordCardList.innerHTML = "";
        window.requestAnimationFrame(function() {
          renderRecordPage();
          window.requestAnimationFrame(function() {
            if (recordCardList) recordCardList.style.minHeight = "";
          });
        });
      }

      function setRecordFilter(filter) {
        currentFilter = filter || "전체";
        currentPage = 1;
        recordFilterButtons.forEach(function(btn) {
          btn.classList.toggle("active", btn.dataset.recordFilter === currentFilter);
        });
        renderRecordPage();
      }

      function moveMonth(delta) {
        // PATCH 51-44: parseInt 보장 (문자열로 저장됐을 경우 "5"+1="51" 버그 방지)
        let m = parseInt(currentMonth, 10) + parseInt(delta, 10);
        let y = parseInt(currentYear, 10);
        while (m < 1)  { m += 12; y -= 1; }
        while (m > 12) { m -= 12; y += 1; }
        if (y < minYear) return;
        recordUserMovedMonth = true;
        currentYear = y; currentMonth = m; currentPage = 1;
        renderRecordPageAfterMonthMove();
      }

      // ── API 로드 ──────────────────────────────────────────────
      function loadVisits() {
        const lumiId = typeof window.__lumiGetCurrentId === "function" ? window.__lumiGetCurrentId() : "";
        const endpoint = window.LUMI_API_ENDPOINT || "";
        if (!lumiId || !endpoint) {
          if (runtimeVisits.length === 0) visitsLoadState = "loading";
          renderRecordPage();
          return;
        }

        function parseVisitDate(v) {
          var raw = v.eventDate || v.visitedAt || "";
          if (!raw) return null;
          var d = new Date(raw);
          return isNaN(d.getTime()) ? null : d;
        }

        function jumpToLatest(visits) {
          if (!visits || !visits.length) return;
          // PATCH 51-42: 최초 자동 이동은 1회만. 사용자가 월 이동을 누른 뒤에는 API 응답이 와도 월을 덮어쓰지 않음.
          if (recordAutoJumpDone || recordUserMovedMonth) return;
          var latest = parseVisitDate(visits[0]);
          if (latest) {
            currentYear  = latest.getFullYear();
            currentMonth = latest.getMonth() + 1;
            currentPage  = 1;
            recordAutoJumpDone = true;
            if (window.__LUMI_DEBUG_MODE) console.log("[lumi] jumped to:", currentYear, currentMonth);
          }
        }

        // PATCH 51-36-fix1: 별도 IIFE 스코프라 cacheRead_ 직접 접근 불가 → window 브릿지 사용
        const _cacheRead  = typeof window.__lumiCacheRead  === "function" ? window.__lumiCacheRead  : function() { return null; };
        const _cacheWrite = typeof window.__lumiCacheWrite === "function" ? window.__lumiCacheWrite : function() {};

        // 캐시가 있으면 즉시 렌더 (빈 화면/로딩 중 방지)
        const cachedVisits = _cacheRead(lumiId, "visits", 24 * 60 * 60 * 1000);
        if (cachedVisits && Array.isArray(cachedVisits) && cachedVisits.length > 0) {
          visitsLoadState = "loaded";
          runtimeVisits = cachedVisits;
          jumpToLatest(runtimeVisits);
          renderRecordPage();
        } else {
          visitsLoadState = "loading";
          // 캐시 없을 때만 로딩 중 표시
          if (recordCardList) {
            recordCardList.innerHTML =
              '<article class="record-memory-card" data-record-category="전체">' +
              '<span class="record-memory-icon">🕰️</span><time></time>' +
              '<b>기록을 불러오는 중…</b><span>잠시만 기다려 주세요.</span><em></em>' +
              '</article>';
          }
          if (recordMsg) recordMsg.textContent = "기록을 불러오는 중…";
        }

        // 백그라운드로 API 최신값 호출 (캐시 유무와 무관)
        // PATCH 51-44: __lumiFetchApi 브릿지가 없으면 잠깐 기다렸다가 재시도
        function doApiCall() {
          var apiCall;
          if (typeof window.__lumiFetchApi === "function") {
            apiCall = window.__lumiFetchApi({ action: "lumiGetVisits", lumiId: lumiId });
          } else if (endpoint) {
            const url = endpoint + (endpoint.indexOf("?") === -1 ? "?" : "&") +
              new URLSearchParams({ action: "lumiGetVisits", lumiId: lumiId, _: Date.now() }).toString();
            apiCall = fetch(url).then(function(r) { return r.json(); });
          } else {
            if (runtimeVisits.length === 0) visitsLoadState = "error";
            renderRecordPage();
            return;
          }

          apiCall
            .then(function(data) {
              if (window.__LUMI_DEBUG_MODE) console.log("[lumi] loadVisits response:", data);
              if (data && data.ok && Array.isArray(data.visits)) {
                // 최신순 정렬
                data.visits.sort(function(a, b) {
                  var da = parseVisitDate(a), db = parseVisitDate(b);
                  if (!da && !db) return 0;
                  if (!da) return 1;
                  if (!db) return -1;
                  return db.getTime() - da.getTime();
                });
                visitsLoadState = "loaded";
                runtimeVisits = data.visits; // PATCH 51-46: 빈 배열도 그대로 반영 (이전 캐시 덮어쓰기)
                _cacheWrite(lumiId, "visits", runtimeVisits);
                if (window.__LUMI_DEBUG_MODE) console.log("[lumi] loadVisits count:", runtimeVisits.length);
                jumpToLatest(runtimeVisits);
              } else {
                if (window.__LUMI_DEBUG_MODE) console.warn("[lumi] loadVisits: unexpected response:", data);
                visitsLoadState = runtimeVisits.length === 0 ? "error" : "loaded";
              }
              renderRecordPage();
            })
            .catch(function(err) {
              if (window.__LUMI_DEBUG_MODE) console.error("[lumi] loadVisits error:", err);
              if (runtimeVisits.length === 0) visitsLoadState = "error";
              renderRecordPage();
            });
        }

        // __lumiFetchApi 브릿지가 아직 없으면 최대 1초 대기 후 실행
        if (typeof window.__lumiFetchApi === "function") {
          doApiCall();
        } else {
          var bridgeWait = 0;
          var bridgePoll = setInterval(function() {
            bridgeWait += 100;
            if (typeof window.__lumiFetchApi === "function" || bridgeWait >= 1000) {
              clearInterval(bridgePoll);
              doApiCall();
            }
          }, 100);
        }
      }

      // PATCH 51-40-fix1: openApp/go 복원 흐름에서도 기록 로더를 호출할 수 있게 전역 브릿지 노출
      window.__lumiLoadVisits = loadVisits;
      // PATCH 51-57-fix5: checkins 로더가 나중에 도착해도 기록 타임라인을 다시 렌더한다.
      window.__lumiRefreshRecordTimeline = function(checkins) {
        if (Array.isArray(checkins)) runtimeCheckins = checkins;
        renderRecordPage();
      };

      // ── 이벤트 등록 ───────────────────────────────────────────
      recordFilterButtons.forEach(function(btn) {
        btn.addEventListener("click", function() { setRecordFilter(btn.dataset.recordFilter || "전체"); });
      });
      if (recordMonthPrev) recordMonthPrev.addEventListener("click", function() { moveMonth(-1); });
      if (recordMonthNext) recordMonthNext.addEventListener("click", function() { moveMonth(1); });
      if (recordPagePrev)  recordPagePrev.addEventListener("click",  function() { currentPage -= 1; renderRecordPage(); });
      if (recordPageNext)  recordPageNext.addEventListener("click",  function() { currentPage += 1; renderRecordPage(); });

      // 기록 탭 클릭 시 로드
      document.addEventListener("click", function(e) {
        const tab = e.target && e.target.closest ? e.target.closest('[data-page="record"],[data-go="record"]') : null;
        if (tab) { setTimeout(loadVisits, 50); }
      });

      // 초기 렌더 (API 로드 전 빈 상태)
      renderRecordPage();
    })();




/* ===== merged from point-ledger-filter-pagination-js ===== */
(() => {
      "use strict";
      const pointRoot = document.getElementById("page-point");
      if (!pointRoot) return;
      let pointItems = Array.from(pointRoot.querySelectorAll(".point-ledger-item"));
      const pointFilterButtons = Array.from(pointRoot.querySelectorAll(".point-ledger-filter-pill"));
      const pointPrev = document.getElementById("pointLedgerPrev");
      const pointNext = document.getElementById("pointLedgerNext");
      const pointPageText = document.getElementById("pointLedgerPageText");
      const pointMsg = document.getElementById("pointLedgerMsg");
      const pageSize = 4;
      let pointFilter = "전체";
      let pointPage = 1;

      function filteredPointItems() {
        if (pointFilter === "전체") return pointItems;
        return pointItems.filter((item) => item.dataset.pointCategory === pointFilter);
      }

      function refreshPointItems() {
        pointItems = Array.from(pointRoot.querySelectorAll(".point-ledger-item"));
      }

      function renderPointLedger() {
        refreshPointItems();
        if (!pointItems.length) return;
        const list = filteredPointItems();
        const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
        if (pointPage > totalPages) pointPage = totalPages;
        if (pointPage < 1) pointPage = 1;
        const start = (pointPage - 1) * pageSize;
        const visibleSet = new Set(list.slice(start, start + pageSize));
        pointItems.forEach((item) => { item.hidden = !visibleSet.has(item); });
        if (pointPageText) pointPageText.textContent = pointPage + " / " + totalPages;
        if (pointPrev) pointPrev.disabled = pointPage <= 1;
        if (pointNext) pointNext.disabled = pointPage >= totalPages;
        if (pointMsg) {
          pointMsg.textContent = pointFilter === "전체"
            ? "아직 적립 내역이 없어요. 활동 기록이 연결되면 이곳에 표시돼요."
            : pointFilter + " 내역은 아직 없어요. 활동 기록이 연결되면 이곳에 표시돼요.";
        }
      }

      function setPointFilter(filter) {
        pointFilter = filter || "전체";
        pointPage = 1;
        pointFilterButtons.forEach((button) => {
          button.classList.toggle("active", button.dataset.pointFilter === pointFilter);
        });
        renderPointLedger();
      }

      pointFilterButtons.forEach((button) => {
        button.addEventListener("click", () => setPointFilter(button.dataset.pointFilter || "전체"));
      });
      if (pointPrev) pointPrev.addEventListener("click", () => { pointPage -= 1; renderPointLedger(); });
      if (pointNext) pointNext.addEventListener("click", () => { pointPage += 1; renderPointLedger(); });
      pointItems.forEach((item) => {
        item.addEventListener("click", () => {
          const title = item.dataset.pointTitle || "포인트 내역";
          const date = item.dataset.pointDate || "";
          const desc = item.dataset.pointDesc || "활동 기록이 연결되면 이곳에 표시돼요.";
          if (typeof window.openProfileSimpleModal === "function") {
            window.openProfileSimpleModal("포인트 내역", [title, date, desc]);
            return;
          }
          alert(title + "\n" + date + "\n" + desc);
        });
      });
      renderPointLedger();
    })();



/* ===== merged from calendar-personal-schedule-js ===== */
(function(){
      const root = document.getElementById("page-calendar");
      if (!root) return;
      const monthLabel = root.querySelector("[data-calendar-month-label]");
      const grid = root.querySelector("[data-calendar-grid]");
      const list = root.querySelector("[data-calendar-list]");
      const pageLabel = root.querySelector("[data-calendar-page-label]");
      const prevPage = root.querySelector('[data-calendar-page="prev"]');
      const nextPage = root.querySelector('[data-calendar-page="next"]');
      const filters = Array.from(root.querySelectorAll("[data-calendar-filter]"));
      const monthButtons = root.querySelectorAll("[data-calendar-month]");
      const pageSize = 4;
      const minMonth = new Date(2026, 0, 1);
      let currentMonth = new Date(2026, 6, 1);
      let activeFilter = "all";
      let currentPage = 0;

      const events = [
        { date:"2026-07-12", type:"live", icon:"●", title:"Lumibelle Debut Live", desc:"입장 17:30 / 공연 18:00 · 티켓함에서 확인", tags:["라이브", "티켓함"] },
        { date:"2026-08-17", type:"birthday", icon:"♥", title:"루루 생일", desc:"축하 예정", tags:["생일", "루루"] },
        { date:"2026-09-21", type:"birthday", icon:"♥", title:"마리링 생일", desc:"축하 예정", tags:["생일", "마리링"] },
        { date:"2026-10-18", type:"event", icon:"★", title:"새로운 빛이 열리는 날", desc:"자세한 내용은 추후 공개됩니다.", tags:["이벤트", "예정"] }
      ];

      function pad(n){ return String(n).padStart(2, "0"); }
      function ym(date){ return date.getFullYear() + "-" + pad(date.getMonth()+1); }
      function sameMonth(dateStr){ return dateStr.slice(0,7) === ym(currentMonth); }
      function dateLabel(dateStr){ return dateStr.replace(/-/g, "."); }

      function monthEvents(){
        return events.filter(ev => sameMonth(ev.date) && (activeFilter === "all" || ev.type === activeFilter));
      }

      function renderCalendar(){
        if (!grid || !monthLabel) return;
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        monthLabel.textContent = year + "년 " + pad(month+1) + "월";
        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month+1, 0).getDate();
        const byDay = {};
        events.filter(ev => ev.date.slice(0,7) === ym(currentMonth)).forEach(ev => {
          const day = Number(ev.date.slice(8,10));
          if (!byDay[day]) byDay[day] = [];
          byDay[day].push(ev);
        });
        const cells = [];
        for (let i=0; i<firstDay; i++) cells.push('<button type="button" class="calendar-day blank" tabindex="-1"></button>');
        for (let day=1; day<=lastDate; day++){
          const dayEvents = byDay[day] || [];
          const marks = dayEvents.slice(0,3).map(ev => '<i class="calendar-dot '+ ev.type +'"></i>').join("");
          const cls = dayEvents.length ? "calendar-day has-event" : "calendar-day";
          cells.push('<button type="button" class="'+cls+'" data-calendar-day="'+day+'"><span>'+day+'</span><span class="calendar-mark">'+marks+'</span></button>');
        }
        grid.innerHTML = cells.join("");
        grid.querySelectorAll("[data-calendar-day]").forEach(btn => {
          btn.addEventListener("click", () => {
            const day = Number(btn.getAttribute("data-calendar-day"));
            grid.querySelectorAll(".calendar-day.selected").forEach(el => el.classList.remove("selected"));
            btn.classList.add("selected");
            const matched = events.filter(ev => ev.date === year + "-" + pad(month+1) + "-" + pad(day));
            if (matched.length && typeof openLumiModal === "function") {
              const first = matched[0];
              openLumiModal(first.title, dateLabel(first.date) + "\n" + first.desc);
            }
          });
        });
      }

      function renderList(){
        if (!list || !pageLabel) return;
        const items = monthEvents();
        const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
        currentPage = Math.max(0, Math.min(currentPage, totalPages - 1));
        const shown = items.slice(currentPage * pageSize, currentPage * pageSize + pageSize);
        if (!shown.length) {
          list.innerHTML = '<article class="calendar-event-card"><small>일정 없음</small><b>이 달에는 표시할 루미 일정이 없어요</b><span>공홈 SCHEDULE에 새 일정이 등록되면 루미폰 캘린더에도 연결될 예정이에요.</span></article>';
        } else {
          list.innerHTML = shown.map(ev => (
            '<article class="calendar-event-card" data-calendar-detail="'+ ev.date +'">' +
              '<small>'+ dateLabel(ev.date) +' · '+ typeLabel(ev.type) +'</small>' +
              '<b>'+ ev.title +'</b>' +
              '<span>'+ ev.desc +'</span>' +
              '<div class="calendar-event-tags">'+ ev.tags.map(tag => '<i>'+tag+'</i>').join("") +'</div>' +
            '</article>'
          )).join("");
          list.querySelectorAll("[data-calendar-detail]").forEach(card => {
            card.addEventListener("click", () => {
              const date = card.getAttribute("data-calendar-detail");
              const ev = events.find(item => item.date === date && card.textContent.includes(item.title));
              if (ev && typeof openLumiModal === "function") openLumiModal(ev.title, dateLabel(ev.date) + "\n" + ev.desc);
            });
          });
        }
        pageLabel.textContent = (currentPage + 1) + " / " + totalPages;
        if (prevPage) prevPage.disabled = currentPage <= 0;
        if (nextPage) nextPage.disabled = currentPage >= totalPages - 1;
      }

      function typeLabel(type){
        return { live:"라이브", birthday:"생일", event:"이벤트", onair:"ON AIR" }[type] || "일정";
      }

      function render(){
        renderCalendar();
        renderList();
      }

      filters.forEach(btn => {
        btn.addEventListener("click", () => {
          filters.forEach(item => item.classList.remove("active"));
          btn.classList.add("active");
          activeFilter = btn.getAttribute("data-calendar-filter") || "all";
          currentPage = 0;
          renderList();
        });
      });

      monthButtons.forEach(btn => {
        btn.addEventListener("click", () => {
          const dir = btn.getAttribute("data-calendar-month") === "next" ? 1 : -1;
          const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + dir, 1);
          if (next < minMonth) return;
          currentMonth = next;
          currentPage = 0;
          render();
        });
      });

      if (prevPage) prevPage.addEventListener("click", () => { currentPage -= 1; renderList(); });
      if (nextPage) nextPage.addEventListener("click", () => { currentPage += 1; renderList(); });

      render();

    })();


/* ===== onair-mobile-tabs-click-fix-js ===== */
(function(){
  function setOnAirTab(target){
    if (!target) return;
    const root = document.getElementById('page-onair');
    if (!root) return;
    const tabs = Array.from(root.querySelectorAll('[data-onair-tab]'));
    const panels = Array.from(root.querySelectorAll('[data-onair-panel]'));
    if (!tabs.length || !panels.length) return;
    tabs.forEach((button) => {
      button.classList.toggle('active', button.getAttribute('data-onair-tab') === target);
    });
    panels.forEach((panel) => {
      panel.classList.toggle('active', panel.getAttribute('data-onair-panel') === target);
    });
  }

  const ON_AIR_CHEER_COOLDOWN_MS = 30000;
  const ON_AIR_CHEER_ENABLED = false;

  function getTodayCheerKey(){
    const today = new Date().toISOString().slice(0, 10);
    return 'lumiphone:onair:cheer:' + today;
  }

  function getTodayCheerData(){
    const base = { count: 0, last: '', updatedAt: 0 };
    try {
      const saved = window.localStorage ? window.localStorage.getItem(getTodayCheerKey()) : null;
      return saved ? Object.assign(base, JSON.parse(saved)) : base;
    } catch (error) {
      return base;
    }
  }

  function getCheerRemainMs(data){
    const updatedAt = Number(data && data.updatedAt) || 0;
    return Math.max(0, ON_AIR_CHEER_COOLDOWN_MS - (Date.now() - updatedAt));
  }

  function setOnAirCheerButtonsLocked(remainMs){
    const root = document.getElementById('page-onair');
    if (!root) return;
    const buttons = Array.from(root.querySelectorAll('[data-onair-cheer]'));
    const locked = !ON_AIR_CHEER_ENABLED || remainMs > 0;
    buttons.forEach((button) => {
      button.disabled = locked;
      button.setAttribute('aria-disabled', locked ? 'true' : 'false');
    });
    clearTimeout(window.__lumiOnAirCheerCooldownTimer);
    if (locked) {
      window.__lumiOnAirCheerCooldownTimer = setTimeout(renderOnAirCheerStatus, remainMs + 80);
    }
  }

  function renderOnAirCheerStatus(messageOverride){
    const root = document.getElementById('page-onair');
    const statusCard = root ? root.querySelector('[data-onair-cheer-status]') : null;
    if (!statusCard) return;
    const countEl = statusCard.querySelector('[data-onair-cheer-count]');
    const detailEl = statusCard.querySelector('[data-onair-cheer-detail]');
    const data = getTodayCheerData();
    const count = Number(data.count) || 0;
    const remainMs = getCheerRemainMs(data);
    if (!ON_AIR_CHEER_ENABLED) {
      if (countEl) countEl.textContent = '반짝 응원 준비 중';
      if (detailEl) detailEl.textContent = '방송이 시작되면 사용할 수 있어요.';
      setOnAirCheerButtonsLocked(0);
      return;
    }
    if (countEl) countEl.textContent = '오늘 보낸 반짝 응원 ' + count + '회';
    if (detailEl) {
      if (messageOverride) {
        detailEl.textContent = messageOverride;
      } else if (count > 0 && remainMs > 0) {
        detailEl.textContent = '마지막 응원: ' + (data.last || '반짝 응원') + ' · 약 ' + Math.ceil(remainMs / 1000) + '초 뒤 다시 보낼 수 있어요. 보상은 오늘 1회만 저장돼요.';
      } else if (count > 0) {
        detailEl.textContent = '마지막 응원: ' + (data.last || '반짝 응원') + ' · 다시 응원을 보낼 수 있어요. 추가 응원은 마음 기록으로 남아요.';
      } else {
        detailEl.textContent = '아직 보낸 응원이 없어요. 보상은 방송마다 1회만 저장돼요.';
      }
    }
    setOnAirCheerButtonsLocked(remainMs);
  }

  document.addEventListener('click', function(event){
    if (event.target.closest('#profileSimpleModal')) return;

    const tabButton = event.target.closest('[data-onair-tab]');
    if (tabButton) {
      event.preventDefault();
      event.stopPropagation();
      setOnAirTab(tabButton.getAttribute('data-onair-tab'));
      return;
    }

    const messageButton = event.target.closest('[data-onair-message]');
    if (messageButton) {
      event.preventDefault();
      event.stopPropagation();
      const member = messageButton.getAttribute('data-onair-message') || 'coming-soon';
      if (typeof window.lumiOpenMessageById === 'function') {
        window.lumiOpenMessageById(member === 'coming-soon' ? 'coming-soon-secret-onair' : member);
      } else if (typeof window.openLumiMessage === 'function') {
        window.openLumiMessage(member);
      } else if (typeof window.openProfileSimpleModal === 'function') {
        window.openProfileSimpleModal('ON AIR 메시지', ['문자함으로 이동해 메시지를 확인해 주세요.']);
      }
      return;
    }

    const cheerButton = event.target.closest('[data-onair-cheer]');
    if (cheerButton) {
      event.preventDefault();
      event.stopPropagation();
      if (!ON_AIR_CHEER_ENABLED) {
        renderOnAirCheerStatus('방송이 시작되면 사용할 수 있어요.');
        cheerButton.blur();
        return;
      }

      const now = Date.now();
      const label = cheerButton.getAttribute('data-onair-cheer') || '반짝 응원';
      let cheerData = getTodayCheerData();
      const remainMs = getCheerRemainMs(cheerData);

      if (remainMs > 0) {
        renderOnAirCheerStatus('방금 응원이 기록됐어요. 약 ' + Math.ceil(remainMs / 1000) + '초 뒤 다시 보낼 수 있어요.');
        cheerButton.blur();
        return;
      }

      cheerData.count = (Number(cheerData.count) || 0) + 1;
      cheerData.last = label;
      cheerData.updatedAt = now;

      try {
        if (window.localStorage) window.localStorage.setItem(getTodayCheerKey(), JSON.stringify(cheerData));
      } catch (error) {}

      renderOnAirCheerStatus(
        cheerData.count === 1
          ? '마지막 응원: ' + label + ' · 오늘 보상 기록 완료. 30초 뒤 다시 응원을 보낼 수 있어요.'
          : '마지막 응원: ' + label + ' · 추가 응원은 마음 기록으로 남아요. 30초 뒤 다시 보낼 수 있어요.'
      );

      cheerButton.blur();
      return;
    }
  });

  renderOnAirCheerStatus();
  setOnAirTab('code');
})();

  

/* ===== v10.8 message / lumiletter choice inbox patch ===== */
(function(){
  "use strict";
  window.LUMI_MEMBER_MESSAGES = window.LUMI_MEMBER_MESSAGES || {
    mariring: {
      status: "ready",
      firstVisit: "와줘서 고마워! 오늘부터 링링이 너만의 아이돌이 되어줄게.",
      liveThanks: "오늘 와줘서 정말 고마워! 네가 있어서 링링은 더 반짝일 수 있었어.",
      comeback: "오랜만이야! 다시 와줘서 고마워. 기다리고 있었다구!",
      onlineSupport: "멀리서 보내준 마음도 링링에게 전부 닿았어. 고마워!",
      birthday: "오늘 특별한 날이라고 하던데, 맞아? 태어나줘서 고맙고 항상 링링을 응원해주는 네가 있기에 링링은 빛날 수 있었어. 진심으로 생일을 축하해."
    },
    lulu: {
      status: "ready",
      firstVisit: "어... 루루 보러 와준거야...? 🐰🩷\n와줘서 고마워...! 오늘부터 루루랑 같이 있어줄래...? 🍼🐰",
      liveThanks: "오늘 와줘서 루루 진짜 힘났어... 🐰🩷\n잘 못했어도 루루 정말 열심히 했는데, 네 눈에도 괜찮았을까...? 🐰💦\n다음엔 더 열심히 할게...! 🐰✨️",
      comeback: "🐰💭\n...루루 잊어버린 줄 알았어..🐰💦\n루루는 항상 기다리고 있었어...\n루루 곁에 다시 와줘서 너무 고마워... 오늘은 조금 더 같이 있어줄래...?🐰🩷",
      onlineSupport: "직접 못 만나도 루루 다 느끼고 있어...!\n오늘도 응원해줘서 고마워... 루루도 더 열심히 할게...! 항상 루루를 생각해줘서 고마워...! 🐰🩷",
      birthday: "🐰🎀🎉\n오늘은 너의 날이네...!\n태어나줘서 고마워... 오늘 하루가 조금 더 특별하고 행복하기를 루루가 기도할게...🐰🍀\n루루도 오늘은 더 많이 좋아해도 될까...? 🍼🩷"
    },
    iro: {
      status: "locked",
      firstVisit: "Coming Soon\n새로운 빛이 준비 중이에요",
      liveThanks: "Coming Soon\n새로운 빛이 준비 중이에요",
      comeback: "Coming Soon\n새로운 빛이 준비 중이에요",
      onlineSupport: "Coming Soon\n새로운 빛이 준비 중이에요",
      birthday: "Coming Soon\n새로운 빛이 준비 중이에요"
    },
    comingSoon: {
      status: "locked",
      firstVisit: "Coming Soon\n새로운 빛이 준비 중이에요",
      liveThanks: "Coming Soon\n새로운 빛이 준비 중이에요",
      comeback: "Coming Soon\n새로운 빛이 준비 중이에요",
      onlineSupport: "Coming Soon\n새로운 빛이 준비 중이에요",
      birthday: "Coming Soon\n새로운 빛이 준비 중이에요"
    }
  };
  const MEMBER_MESSAGES = window.LUMI_MEMBER_MESSAGES;
  const MESSAGES = [
    {
      id:"coming-soon-online-cheer",
      box:"pending",
      status:"scheduled",
      unlock:"afterOnAir",
      date:"ON AIR 종료 후",
      from:"Coming Soon",
      tag:"온라인",
      type:"onairAfter",
      title:"Coming Soon",
      preview:"새로운 빛이 준비 중이에요",
      icon:"✦",
      lines:["Coming Soon", "새로운 빛이 준비 중이에요", "자세한 내용은 추후 공개됩니다."],
      choices:["확인했어요","기다릴게요","추후 공개를 기다릴게요"],
      after:{
        "확인했어요":["Coming Soon", "새로운 빛이 준비 중이에요"],
        "기다릴게요":["Coming Soon", "새로운 빛이 준비 중이에요"],
        "추후 공개를 기다릴게요":["자세한 내용은 추후 공개됩니다."]
      }
    },
    {
      id:"lulu-live-today",
      box:"pending",
      status:"scheduled",
      unlock:"liveDay",
      date:"공연 당일",
      from:"루루 🍼🐰",
      tag:"라이브",
      type:"liveDay",
      title:"루미나, 오늘 오는 날이지?",
      preview:"날씨랑 입장번호 챙겨서 조심히 와야 해.",
      icon:"🐰",
      lines:["루미나, 오늘 오는 날이지...? 🐰🩷","공연장 근처는 비가 스칠 수도 있대. 작은 우산 챙기고, 입장번호도 잊지 말기...!","천천히 와도 괜찮으니까 조심히 와야 해 🐰"],
      choices:["응! 조심히 갈게","우산 챙길게!","루루도 준비 힘내!"],
      after:{
        "응! 조심히 갈게":["정말...? 그 말 들으니까 루루도 더 힘내서 준비할 수 있을 것 같아.","오늘 무대에서 꼭 찾아볼게 🐰🩷"],
        "우산 챙길게!":["좋아...! 오는 길 미끄럽지 않게 조심해야 해.","루루도 무대에서 기다리고 있을게 🐰"],
        "루루도 준비 힘내!":["에헤헤... 그런 말 들으면 루루 더 힘내버려!","오늘 꼭 반짝이는 모습 보여줄게 🐰✨️"]
      }
    },
    {
      id:"mariring-online-cheer",
      box:"pending",
      status:"scheduled",
      unlock:"afterOnAir",
      date:"ON AIR 종료 후",
      from:"마리링 🎀⭐️",
      tag:"온라인",
      type:"onairAfter",
      title:"멀리서도 마음이 닿았어",
      preview:"직접 만나지 못해도 그 마음은 분명히 닿을 거야.",
      icon:"🎀",
      lines:["와줘서 고마워!","오늘 네 마음이 링링에게 닿았어.","앞으로도 더 반짝일 수 있게 힘내볼게!"],
      choices:["멀리서 응원할게","ON AIR로 함께할게","다음엔 꼭 보러 갈게"],
      after:{
        "멀리서 응원할게":["링링 고마워! 멀리서 보내준 마음도 진짜 크게 느껴졌어."],
        "ON AIR로 함께할게":["좋아! 화면 너머 응원도 링링에게 닿았어."],
        "다음엔 꼭 보러 갈게":["기다릴게! 다음에 만나는 날엔 더 반짝이는 모습 보여줄게!"]
      }
    },
    {
      id:"lulu-return-welcome",
      box:"pending",
      status:"scheduled",
      unlock:"afterReturn",
      date:"복귀 조건 달성 후",
      from:"루루 🍼🐰",
      tag:"복귀",
      type:"comeback",
      title:"다시 와줘서 고마워",
      preview:"오랜만에 루미폰에 돌아온 루미나를 위한 문자예요.",
      icon:"🐰",
      lines:(MEMBER_MESSAGES.lulu.comeback || "다시 와줘서 고마워...").split("\n"),
      choices:["루루 보러 다시 왔어","기다려줘서 고마워","오늘은 더 같이 있을게"],
      after:{
        "루루 보러 다시 왔어":["정말...? 그 말 들으니까 루루 너무 기뻐... 🐰🩷"],
        "기다려줘서 고마워":["루루는 항상 기다리고 있었어... 다시 와줘서 고마워."],
        "오늘은 더 같이 있을게":["응... 오늘은 조금 더 같이 있어줄래...? 🍼🐰"]
      }
    },
    {
      id:"coming-soon-secret-onair",
      box:"pending",
      status:"scheduled",
      unlock:"afterOnAir",
      date:"ON AIR 종료 후",
      from:"Coming Soon",
      tag:"비밀",
      type:"onairAfter",
      title:"Coming Soon",
      preview:"새로운 빛이 준비 중이에요",
      icon:"✦",
      lines:["Coming Soon", "새로운 빛이 준비 중이에요", "자세한 내용은 추후 공개됩니다."],
      choices:["확인했어요","기다릴게요","추후 공개를 기다릴게요"],
      after:{
        "확인했어요":["Coming Soon", "새로운 빛이 준비 중이에요"],
        "기다릴게요":["Coming Soon", "새로운 빛이 준비 중이에요"],
        "추후 공개를 기다릴게요":["자세한 내용은 추후 공개됩니다."]
      }
    },
    {
      id:"staff-lumi-guide",
      box:"inbox",
      date:"운영 안내",
      from:"루미폰 운영",
      tag:"운영",
      type:"staff",
      title:"루미폰 기록 안내",
      preview:"티켓, 포인트, 스탬프 기록이 이상할 때 확인하는 안내예요.",
      icon:"👑", // PATCH 51-30-fix: 구 클립 아이콘 제거
      lines:["루미폰 기록은 공연/특전회/ON AIR 기록을 천천히 연결하는 공간이에요.", "기록이 다르게 보이면 루미 ID와 날짜를 알려주세요.", "스탭 확인 후 가능한 범위에서 수정해드릴게요."],
      choices:["확인했어요","문의할게요","루미 ID 준비할게요"],
      after:{
        "확인했어요":["확인해줘서 고마워요. 기록은 안전하게 남겨둘게요."],
        "문의할게요":["좋아요. 루미 ID와 날짜를 함께 알려주시면 확인이 빨라요."],
        "루미 ID 준비할게요":["루미 ID가 있으면 티켓/포인트/스탬프 확인이 쉬워져요."]
      }
    },
    {
      id:"lumi-letter-0712",
      box:"pending",
      status:"scheduled",
      unlock:"afterLiveEnd",
      date:"공연 후",
      from:"루미레터",
      tag:"루미레터",
      type:"afterLive",
      title:"데뷔 라이브의 첫 페이지",
      preview:"공연 후 루미로그와 함께 남는 공식 루미레터예요.",
      icon:"💌",
      lines:["오늘의 루미레터가 도착했어요.","2026년 7월 12일, 루미벨의 첫 페이지가 열렸습니다.","남겨준 마음은 지나가는 글이 아니라 루미벨의 기록 속에 오래 보관됩니다."],
      choices:[]
    },
    {
      id:"coming-soon-birthday",
      box:"pending",
      status:"scheduled",
      unlock:"birthdaySeason",
      date:"생일 시즌",
      from:"Coming Soon",
      tag:"생일",
      type:"birthday",
      title:"Coming Soon",
      preview:"새로운 빛이 준비 중이에요",
      icon:"✦",
      lines:["Coming Soon", "새로운 빛이 준비 중이에요", "자세한 내용은 추후 공개됩니다."],
      choices:["확인했어요","기다릴게요","추후 공개를 기다릴게요"],
      after:{
        "확인했어요":["Coming Soon", "새로운 빛이 준비 중이에요"],
        "기다릴게요":["Coming Soon", "새로운 빛이 준비 중이에요"],
        "추후 공개를 기다릴게요":["자세한 내용은 추후 공개됩니다."]
      }
    }
  ];
  const KEY = { read:"lumi_v108_msg_read", saved:"lumi_v108_msg_saved", replies:"lumi_v108_msg_replies" };
  // Lumi Signup Patch 1-fix2A: 문자함 키 계정별 격리
  function msgKeyFor(base) {
    try { var id = window.__lumiGetCurrentId ? window.__lumiGetCurrentId() : ""; return id ? base + "." + id.toLowerCase() : base; } catch(e) { return base; }
  }
  function $(s,r){ return (r||document).querySelector(s); }
  function $$(s,r){ return Array.from((r||document).querySelectorAll(s)); }
  function getArr(k){ try { return JSON.parse(localStorage.getItem(msgKeyFor(k))||"[]"); } catch(e) { return []; } }
  function setArr(k,v){ try { localStorage.setItem(msgKeyFor(k), JSON.stringify(v)); } catch(e) {} }
  function getObj(k){ try { return JSON.parse(localStorage.getItem(msgKeyFor(k))||"{}"); } catch(e) { return {}; } }
  function setObj(k,v){ try { localStorage.setItem(msgKeyFor(k), JSON.stringify(v)); } catch(e) {} }
  function fanText(value){ return String(value == null ? "" : value); }
  function getAllLumiMessageItems(){
    const runtimeItems = window.__lumiRuntimeMessageItems;
    if (window.__LUMI_DEBUG_MODE) console.log("[lumiMsg] getAllLumiMessageItems runtimeItems:", runtimeItems);
    // 로드 완료 후에는 항상 runtime 배열만 사용 (undefined면 빈 배열, mock 금지)
    if (window.__lumiMessagesLoadDone === true) {
      return Array.isArray(runtimeItems) ? runtimeItems : [];
    }
    // 로드 중이고 runtime이 배열이면 그것 사용
    if (Array.isArray(runtimeItems)) return runtimeItems;
    // 로드 전이고 API 모드면 mock 억제 (로딩 중 표시)
    if (window.LUMI_API_ENDPOINT) return [];
    // 비로그인/오프라인이면 mock 표시
    return MESSAGES;
  }
  function normalizeRuntimeChatMessage(item){
    const source = item || {};
    const type = normalizeMessageTypeKey(source.messageType || source.type);
    const senderType = String(source.senderType || "system").trim().toLowerCase();
    const senderMember = String(source.senderMember || "system").trim().toLowerCase();
    const from = senderType === "member" ? memberLabelFromKey(senderMember) : (source.from || "LUMIBELLE 운영");
    const body = String(source.body || source.preview || "").trim();
    const date = String(source.createdAt || source.visibleFrom || source.date || "루미폰 메시지");
    const id = String(source.messageId || source.id || ("runtime_msg_" + Date.now() + "_" + Math.random())).trim();
    // PATCH 51-30-fix: source.icon 무시, messageIconFromType 강제
    const icon = messageIconFromType(source);
    let tag = source.tag || "운영";
    let filterType = "staff";
    if (type === "livereminder" || type === "entrycomplete") { tag = source.tag || "라이브"; filterType = "live"; }
    if (type === "birthdaynotice") { tag = source.tag || "생일"; filterType = "birthday"; }
    if (type === "welcometicket" || type === "jointicket") { tag = source.tag || "티켓"; filterType = "staff"; }
    if (senderType === "member") { tag = source.tag || "루미레터"; filterType = "lumiletter"; }
    const isReadValue = String(source.isRead == null ? "" : source.isRead).toLowerCase();
    const isReadFromApi = source.isRead === true || isReadValue === "true" || isReadValue === "1" || isReadValue === "읽음";
    // PATCH 51-39: local read state 우선 병합 (API 응답이 느리거나 실패해도 NEW 재등장 방지)
    // KEY.read는 문자함 IIFE 스코프라 직접 접근 불가 → localStorage에서 직접 읽음
    var isReadLocal = false;
    try {
      var readRaw = localStorage.getItem(msgKeyFor("lumi_v108_msg_read"));
      var readIds = readRaw ? JSON.parse(readRaw) : [];
      var msgId = String(source.messageId || source.id || "").trim();
      if (msgId) isReadLocal = Array.isArray(readIds) && readIds.includes(msgId);
    } catch(e) {}
    const isRead = isReadFromApi || isReadLocal;
    return {
      id: id,
      messageId: id,
      box: "inbox",
      status: isRead ? "read" : "NEW",
      date: date,
      from: from,
      tag: tag,
      type: filterType,
      messageType: source.messageType || "",
      title: source.title || "루미벨에서 도착한 문자",
      preview: source.preview || body.replace(/\s+/g, " ").slice(0, 80),
      icon: icon,
      lines: body ? body.split(/\n+/).filter(Boolean) : [source.title || "루미벨에서 도착한 문자예요."],
      choices: []
    };
  }
  function isComingSoonMessage(m){
    const id = String((m && m.id) || "");
    const from = String((m && m.from) || "");
    return id.indexOf("coming-soon") === 0 || from === "Coming Soon" || m && m.comingSoon === true;
  }
  function isPendingMessage(m){
    const boxName = String((m && m.box) || "inbox");
    const statusName = String((m && m.status) || "");
    const typeName = String((m && m.type) || "");
    const hiddenTypes = ["afterLive", "comeback", "birthday", "onairAfter", "preLive", "liveDay"];
    return boxName === "pending" || statusName === "scheduled" || statusName === "pending" || !!(m && m.unlock) || hiddenTypes.includes(typeName);
  }
  function isVisibleInboxMessage(m){
    const boxName = String((m && m.box) || "inbox");
    return boxName === "inbox" && !isPendingMessage(m) && !isComingSoonMessage(m);
  }
  function perPage(){ return window.matchMedia && window.matchMedia("(max-width: 430px)").matches ? 3 : 6; }
  let box = "inbox", filter = "all", page = 1, currentId = null, timers = [];
  function pageEl(){ return document.getElementById("page-message"); }
  function releaseMessageScrollLock(){
    document.documentElement.classList.remove("lumi-msg-modal-open");
    document.body.classList.remove("lumi-msg-modal-open");
  }
  function showMessagePage(){
    if (typeof go === "function") {
      go("message");
      return;
    }
    const target = pageEl();
    if (!target) return;
    $$(".page").forEach(el => el.classList.toggle("active", el.id === "page-message"));
    $$(".tab").forEach(el => el.classList.toggle("active", el.dataset.page === "message"));
    window.scrollTo({ top: 0, behavior: "auto" });
  }
  function isRead(id){ return getArr(KEY.read).includes(id); }
  function isSaved(id){ return getArr(KEY.saved).includes(id); }
  function clearTimers(){ timers.forEach(t => clearTimeout(t)); timers = []; }
  function delay(fn,ms){ const t = setTimeout(() => { timers = timers.filter(x => x !== t); fn(); }, ms); timers.push(t); return t; }
  function markRead(id){ const arr = getArr(KEY.read); if (!arr.includes(id)) { arr.push(id); setArr(KEY.read, arr); } }
  function setSaved(id,yes){ let arr = getArr(KEY.saved); arr = yes ? Array.from(new Set(arr.concat(id))) : arr.filter(x => x !== id); setArr(KEY.saved, arr); }
  function getReplyData(){ return getObj(KEY.replies); }
  function saveReply(id, choice, after){ const data = getReplyData(); data[id] = { choice, after }; setObj(KEY.replies, data); }
  function filtered(){
    const root = pageEl();
    const term = (($("#lumiMsgSearch", root)||{}).value || "").trim().toLowerCase();
    const rawItems = getAllLumiMessageItems();
    // PATCH 51-29-3 DEBUG
    if (window.__LUMI_DEBUG_MODE) console.log("[lumiMsg] filtered() rawItems (sourceItems):", rawItems);
    const items = Array.isArray(rawItems) ? rawItems.map(m => {
      if (m && (m.lines || m.box || m.type)) return m;
      return normalizeRuntimeChatMessage(m);
    }) : [];
    if (window.__LUMI_DEBUG_MODE) console.log("[lumiMsg] filtered() normalized items (messageItems):", items);

    const result = items.filter(m => {
      if (box === "saved") {
        if (!isSaved(m.id) || !isVisibleInboxMessage(m)) return false;
      } else if (!isVisibleInboxMessage(m)) return false;
      if (filter !== "all" && m.type !== filter) return false;
      if (term) {
        const hay = [m.from,m.tag,m.title,m.preview,m.type].concat(m.lines||[]).join(" ").toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
    if (window.__LUMI_DEBUG_MODE) console.log("[lumiMsg] filtered() result (filteredMessages):", result);
    return result;
  }
  function updateBadges(){
    // 2순위 유령 알림 방지: API 모드에서 loadDone 전에는 배지/홈 알림을 0으로 처리
    const apiMode = !!(window.LUMI_API_ENDPOINT && window.__lumiGetCurrentId && window.__lumiGetCurrentId());
    const loadDone = window.__lumiMessagesLoadDone === true;
    const unreadItems = (apiMode && !loadDone) ? [] : getAllLumiMessageItems().filter(m => isVisibleInboxMessage(m) && !isRead(m.id));
    const unread = unreadItems.length;
    const messageMini = document.querySelector('.app-icon[data-go="message"] .mini, .kawaii-app-icon[data-go="message"] .mini');
    if (messageMini) { messageMini.textContent = unread > 0 ? String(Math.min(unread,9)) : ""; messageMini.style.display = unread > 0 ? "inline-flex" : "none"; }
    const homeCard = document.getElementById("homeMessageCard");
    const homeTitle = document.getElementById("homeMessageTitle");
    const homePreview = document.getElementById("homeMessagePreview");
    const homeKicker = document.getElementById("homeMessageKicker");
    if (homeCard) {
      homeCard.classList.remove("hidden");
      // API 모드 로딩 중에는 홈 카드에 로딩 문구 표시
      if (apiMode && !loadDone) {
        if (homeKicker) homeKicker.textContent = "MESSAGE";
        if (homeTitle) homeTitle.textContent = "문자함";
        if (homePreview) homePreview.textContent = "문자를 불러오는 중…";
        return;
      }
      const publicUnreadItems = unreadItems.filter(m => isVisibleInboxMessage(m));
      const first = publicUnreadItems[0];
      if (first) {
        if (homeKicker) homeKicker.textContent = publicUnreadItems.length > 1 ? "NEW MESSAGES" : "NEW MESSAGE";
        if (homeTitle) homeTitle.textContent = first.from ? first.from + "에게서 새 문자 " + publicUnreadItems.length + "통" : "새 문자 확인";
        if (homePreview) homePreview.textContent = first.preview || first.title || "도착한 문자를 확인해 주세요.";
      } else {
        if (homeKicker) homeKicker.textContent = "MESSAGE";
        if (homeTitle) homeTitle.textContent = "문자함";
        if (homePreview) homePreview.textContent = "새 문자는 없지만, 도착했던 메시지를 다시 볼 수 있어요.";
      }
    }
  }
  function renderList(){
    const root = pageEl(); if (!root) return;
    clearTimers();
    const list = $("#lumiMsgList", root), empty = $("#lumiMsgEmpty", root), pager = $("#lumiMsgPager", root);
    if (!list) return;
    list.style.display = "grid";
    list.style.gap = "10px";
    list.style.minHeight = "1px";

    // PATCH 51-33: 로딩 중 상태 표시
    if (!window.__lumiMessagesLoadDone && window.LUMI_API_ENDPOINT) {
      list.innerHTML = '<p style="text-align:center;color:var(--sub,#c9a0bc);padding:24px 0;font-size:14px;">문자를 불러오는 중…</p>';
      if (empty) empty.classList.add("hidden");
      if (pager) pager.classList.add("hidden");
      return;
    }
    const items = filtered();
    const pp = perPage();
    const total = Math.max(1, Math.ceil(items.length / pp));
    page = Math.min(Math.max(1, page), total);
    list.innerHTML = "";
    items.slice((page-1)*pp, page*pp).forEach(m => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "lumiMsg-item message-preview-card";
      btn.dataset.lumimsgId = m.id;
      btn.style.display = "grid";
      btn.style.width = "100%";
      btn.style.textAlign = "left";
      btn.style.marginBottom = "10px";
      btn.style.border = "1px solid var(--line, #f2d8e7)";
      btn.style.borderRadius = "22px";
      btn.style.background = "#fff";
      btn.style.padding = "13px";
      btn.style.color = "#76586a";
      let state = "읽음", cls = "read";
      if (!isRead(m.id)) { state = "NEW"; cls = ""; }
      else if (isSaved(m.id)) { state = "소장"; cls = "saved"; }
      btn.innerHTML = '<div class="lumiMsg-icon">'+(m.icon||"💌")+'</div><div class="lumiMsg-meta">'+m.from+' <small>· '+m.date+'</small></div><span class="lumiMsg-tag">'+m.tag+'</span><b class="lumiMsg-title">'+m.title+'</b><span class="lumiMsg-preview">'+m.preview+'</span><em class="lumiMsg-state '+cls+'">'+state+'</em>';
      btn.addEventListener("click", () => openMessage(m.id, true));
      list.appendChild(btn);
    });
    const pageText = $("#lumiMsgPageText", root), prev = $("#lumiMsgPrev", root), next = $("#lumiMsgNext", root);
    if (pageText) pageText.textContent = page + " / " + total;
    if (prev) prev.disabled = page <= 1;
    if (next) next.disabled = page >= total;
    if (pager) pager.classList.toggle("hidden", items.length <= pp && page === 1);
    if (empty) empty.classList.toggle("hidden", items.length > 0);
    updateBadges();
  }
  function showInbox(){
    const root = pageEl(); if (!root) return;
    clearTimers();
    const view = $("#lumiMsgView", root);
    if (view) view.classList.remove("show");
    releaseMessageScrollLock();
    currentId = null;
    renderList();
  }
  function addBubble(text, kind){
    const root = pageEl(); const log = $("#lumiMsgChatLog", root); if (!log) return null;
    const div = document.createElement("div");
    div.className = "lumiMsg-bubble " + (kind || "from");
    div.textContent = text;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
    return div;
  }
  function updateSaveButtons(){
    const root = pageEl(); if (!root) return;
    const saved = currentId && isSaved(currentId);
    const save = $("#lumiMsgSaveBtn", root), unsave = $("#lumiMsgUnsaveBtn", root);
    if (save) save.classList.toggle("hidden", !!saved);
    if (unsave) unsave.classList.toggle("hidden", !saved);
  }
  function renderReplyChoices(m, overwrite){
    const root = pageEl(); const replies = $("#lumiMsgReplies", root); if (!replies) return;
    replies.innerHTML = "";
    (m.choices || []).forEach(choice => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = choice;
      btn.addEventListener("click", () => selectReply(m, choice, overwrite));
      replies.appendChild(btn);
    });
  }
  function renderReplies(m, already){
    const root = pageEl(); const replies = $("#lumiMsgReplies", root); if (!replies) return;
    replies.innerHTML = "";
    if (!m.choices || !m.choices.length) return;
    if (already) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "다른 답장 보기";
      btn.addEventListener("click", () => renderReplyChoices(m, true));
      replies.appendChild(btn);
      return;
    }
    renderReplyChoices(m, false);
  }
  function selectReply(m, choice, overwrite){
    if (overwrite && !confirm("이미 저장된 답장이 있어요.\n새 답장으로 바꿀까요?")) return;
    clearTimers();
    if (overwrite) {
      const root = pageEl(); const log = $("#lumiMsgChatLog", root); if (log) log.innerHTML = "";
      (m.lines || []).map(fanText).forEach(line => addBubble(line, "from"));
    }
    const after = ((m.after && m.after[choice]) || []).map(fanText);
    saveReply(m.id, choice, after);
    addBubble(choice, "to");
    const root = pageEl(); const replies = $("#lumiMsgReplies", root); if (replies) replies.innerHTML = "";
    renderList();
    after.forEach((line, idx) => delay(() => addBubble(line, "from"), 760 * (idx + 1)));
  }
  function openMessage(id, animate){
    const root = pageEl(); if (!root) return;
    clearTimers();
    const sourceMessages = getAllLumiMessageItems();
    const allMessages = Array.isArray(sourceMessages) ? sourceMessages.map(m => {
      if (m && (m.lines || m.box || m.type)) return m;
      return normalizeRuntimeChatMessage(m);
    }) : [];
    const m = allMessages.find(x => String(x.id) === String(id) || String(x.messageId) === String(id)) || allMessages[0];
    if (!m) return;
    currentId = m.id;
    const wasUnread = m.status !== "read";
    markRead(m.id);
    renderList();
    if (window.__LUMI_DEBUG_MODE) console.log("[lumiMsg] markRead request:", m.messageId || m.id || "(no messageId)");
    if ((m.messageId || m.id) && typeof window.__lumiFetchApi === "function" && typeof window.__lumiGetCurrentId === "function") {
      const lumiId = window.__lumiGetCurrentId();
      if (lumiId) {
        window.__lumiFetchApi({
          action: "lumiMarkMessageRead",
          lumiId: lumiId,
          messageId: m.messageId || m.id
        }).then((response) => {
          if (window.__LUMI_DEBUG_MODE) console.log("[lumiMsg] markRead ok:", m.messageId, "ok=" + Boolean(response && response.ok));
        }).catch((error) => {
          if (window.__LUMI_DEBUG_MODE) console.warn("[lumiMsg] markRead failed:", m.messageId, error);
        });
      }
    }
    const title = $("#lumiMsgChatTitle", root), date = $("#lumiMsgChatDate", root), tag = $("#lumiMsgChatTag", root), log = $("#lumiMsgChatLog", root), replies = $("#lumiMsgReplies", root), view = $("#lumiMsgView", root);
    if (title) title.textContent = m.from + " · " + m.title;
    if (date) date.textContent = m.date;
    if (tag) tag.textContent = m.tag;
    if (log) log.innerHTML = "";
    if (replies) replies.innerHTML = "";
    updateSaveButtons();
    if (view) view.classList.add("show");
    document.documentElement.classList.add("lumi-msg-modal-open");
    document.body.classList.add("lumi-msg-modal-open");
    const savedReply = getReplyData()[m.id];
    const sequence = (m.lines || []).map(fanText);
    if (savedReply) {
      sequence.push({ text:savedReply.choice, kind:"to" });
      (savedReply.after || []).forEach(line => sequence.push({ text:line, kind:"from" }));
    }
    let i = 0;
    function step(){
      if (i >= sequence.length) { renderReplies(m, !!savedReply); return; }
      const item = sequence[i++];
      addBubble(typeof item === "string" ? item : item.text, typeof item === "string" ? "from" : item.kind);
      delay(step, animate ? 720 : 520);
    }
    delay(step, animate ? 420 : 140);
  }
  function bind(){
    const root = pageEl(); if (!root || root.dataset.lumiMsgV108 === "1") return;
    root.dataset.lumiMsgV108 = "1";
    $$("#lumiMsgFilters button", root).forEach(btn => btn.addEventListener("click", () => {
      clearTimers(); $$("#lumiMsgFilters button", root).forEach(b => b.classList.remove("active")); btn.classList.add("active"); filter = btn.dataset.lumimsgFilter || "all"; page = 1; showInbox();
    }));
    $$(".lumiMsg-tabs button", root).forEach(btn => btn.addEventListener("click", () => {
      clearTimers(); $$(".lumiMsg-tabs button", root).forEach(b => b.classList.remove("active")); btn.classList.add("active"); box = btn.dataset.lumimsgBox || "inbox"; page = 1; showInbox();
    }));
    $("#lumiMsgSearch", root)?.addEventListener("input", () => { clearTimers(); page = 1; renderList(); });
    $("#lumiMsgPrev", root)?.addEventListener("click", () => { if (page > 1) { page--; showInbox(); } });
    $("#lumiMsgNext", root)?.addEventListener("click", () => { const total = Math.max(1, Math.ceil(filtered().length / perPage())); if (page < total) { page++; showInbox(); } });
    $("#lumiMsgReplayFromList", root)?.addEventListener("click", () => { if (currentId) openMessage(currentId, true); });
    $("#lumiMsgReplayBtn", root)?.addEventListener("click", () => { if (currentId) openMessage(currentId, true); });
    $("#lumiMsgCloseBtn", root)?.addEventListener("click", showInbox);
    $("#lumiMsgView", root)?.addEventListener("click", (event) => { if (event.target && event.target.id === "lumiMsgView") showInbox(); });
    $("#lumiMsgSaveBtn", root)?.addEventListener("click", () => { if (!currentId) return; setSaved(currentId, true); updateSaveButtons(); renderList(); showInbox(); });
    $("#lumiMsgUnsaveBtn", root)?.addEventListener("click", () => { if (!currentId) return; setSaved(currentId, false); updateSaveButtons(); renderList(); showInbox(); });
    document.addEventListener("click", (event) => {
      const tab = event.target && event.target.closest ? event.target.closest("[data-page]") : null;
      if (tab && tab.dataset.page !== "message") releaseMessageScrollLock();
    }, true);
    renderList();
  }
  window.showLumiMessageInbox = function(){ box = "inbox"; filter = "all"; page = 1; bind(); const root = pageEl(); if (root) { const s = $("#lumiMsgSearch", root); if (s) s.value = ""; $$(".lumiMsg-tabs button", root).forEach(b => b.classList.toggle("active", (b.dataset.lumimsgBox || "inbox") === "inbox")); $$("#lumiMsgFilters button", root).forEach(b => b.classList.toggle("active", (b.dataset.lumimsgFilter || "all") === "all")); } showInbox(); };
  // PATCH 51-45: API 로드 완료 후 문자함 강제 재렌더용 브릿지
  window.__lumiRefreshMessageList = function() { renderList(); };
  window.lumiOpenMessageById = function(id){ bind(); showMessagePage(); setTimeout(() => openMessage(id || "coming-soon-online-cheer", true), 30); };
  window.openLumiMessage = function(member){
    const key = String(member || "coming-soon").toLowerCase();
    const id = key.includes("lulu") ? "lulu-live-today" : key.includes("mariring") ? "mariring-online-cheer" : "coming-soon-online-cheer";
    window.lumiOpenMessageById(id);
  };
  function ready(){ bind(); renderList(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready); else ready();
})();

/* GAME ZONE ready-modal binding: keeps cards as preview/coming-soon without connecting point logic yet */
(() => {
  "use strict";

  const GAME_ZONE_MESSAGES = {
    fortune: {
      title: "오늘의 운세 준비중",
      lines: [
        "카드 3장 중 하나를 골라 오늘의 반짝 운세를 확인하는 기능이에요.",
        "현재는 미리보기 단계라 결과 저장과 포인트 보상은 아직 연결하지 않았어요."
      ]
    },
    lesson: {
      title: "루미 레슨 준비중",
      lines: [
        "보컬, 댄스, 응원법 레슨 결과와 멤버 한마디가 나오는 미니 기능이에요.",
        "실제 결과 카드와 기록 저장은 추후 연결할 예정이에요."
      ]
    },
    crane: {
      title: "루미 크레인 준비중",
      lines: [
        "하루 1회 무료 플레이와 반짝 포인트 추가 플레이를 고려 중인 기능이에요.",
        "포인트 차감과 보상 지급은 아직 연결하지 않았어요."
      ]
    },
    ai: {
      title: "루미 AI 채팅 준비중",
      lines: [
        "루미벨 멤버 캐릭터와 세계관을 바탕으로 대화할 수 있는 캐릭터 AI 채팅 공간을 준비 중이에요.",
        "수위 제한은 강하게 적용하며, 우회 표현·성적 대화·개인 연락 유도·멤버 사생활 추측은 제공하지 않는 방향으로 설계합니다."
      ]
    }
  };

  function openGameZoneNotice(key) {
    const data = GAME_ZONE_MESSAGES[key] || GAME_ZONE_MESSAGES.fortune;
    if (typeof window.openProfileSimpleModal === "function") {
      window.openProfileSimpleModal(data.title, data.lines);
      return;
    }
    alert([data.title].concat(data.lines).join("\n"));
  }

  function bindGameZoneButtons() {
    document.querySelectorAll("[data-game-zone-modal]").forEach((button) => {
      if (button.dataset.gameZoneBound === "true") return;
      button.dataset.gameZoneBound = "true";
      button.addEventListener("click", () => openGameZoneNotice(button.dataset.gameZoneModal));
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindGameZoneButtons);
  } else {
    bindGameZoneButtons();
  }
})();


/* PC ticket detail buttons: bind legacy-style perk modal without touching ticket data */
(() => {
  "use strict";

  const DETAIL_MAP = {
    welcome: {
      title: "Welcome Ticket",
      sub: "신규 이벤트 환영 특전권",
      valid: "발급 후 안내된 기간",
      rule: "본인 사용 · 1회 사용 후 완료 처리",
      copy: "처음 루미벨을 만나러 온 루미나를 위한 환영 특전권이에요. 루미벨 공식 계정과 멤버 계정 팔로우 인증 후, 현장에서 스탭 확인을 거쳐 발급돼요. 발급이 완료되면 루미폰 티켓함에 자동으로 표시됩니다."
    },
    join: {
      title: "Join Ticket",
      sub: "새로운 빛이 열리는 날 공개돼요.",
      valid: "10.18 이벤트 이후 지정 기간",
      rule: "자세한 내용은 추후 공개됩니다.",
      copy: "Coming Soon. 새로운 빛이 준비 중이에요"
    },
    meate: {
      title: "메아테 특전권",
      sub: "메아테 팀 기준 특전권",
      valid: "입금 확인 후 표시",
      rule: "현장 수령은 스탭 확인 후 진행",
      copy: "입금 완료 후, 예매 시 선택한 메아테 팀 기준으로 루미벨 메아테 혜택 대상 여부가 표시돼요. 메아테가 Lumibelle인 경우 메아테 특전권이 티켓함에 표시되며, 현장 수령과 사용은 스탭 확인 후 진행됩니다."
    },
    birthday: {
      title: "Birthday Ticket 안내",
      sub: "생일을 등록하면 생일 시즌에 열려요.",
      valid: "생일 등록 후 표시",
      rule: "본인 사용 · 양도 불가 · 사용 완료 후 재발급 불가",
      copy: "생일을 등록하면 생일 시즌에 Birthday Ticket이 열려요. 사용 가능 기간은 생일 당월 1일부터 말일까지예요. 실제 사용은 현장에서 스탭 확인 후 진행됩니다."
    }
  };

  function ensureTicketModal() {
    let modal = document.getElementById("ticketDetailModal");
    if (modal) return modal;
    modal = document.createElement("section");
    modal.id = "ticketDetailModal";
    modal.className = "ticket-detail-modal hidden";
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = '<article class="ticket-detail-card" role="dialog" aria-modal="true" aria-labelledby="ticketDetailTitle">' +
      '<button class="ticket-detail-close" type="button" aria-label="닫기">×</button>' +
      '<div class="perk-ticket-visual">' +
        '<small>LUMIBELLE SPECIAL PASS</small>' +
        '<h4 id="ticketDetailTitle">Welcome Ticket</h4>' +
        '<p id="ticketDetailSub">신규 이벤트 환영 특전권</p>' +
        '<div class="perk-valid">' +
          '<div><b>사용 기간</b><span id="ticketDetailValid">발급 후 안내된 기간</span></div>' +
          '<div><b>사용 기준</b><span id="ticketDetailRule">본인 사용 · 1회 사용 후 완료 처리</span></div>' +
        '</div>' +
      '</div>' +
      '<p class="ticket-detail-copy" id="ticketDetailCopy">처음 루미벨을 만나러 온 루미나를 위한 환영 특전권이에요.</p>' +
      '<button class="ticket-detail-ok" type="button">확인했어요</button>' +
    '</article>';
    document.body.appendChild(modal);
    modal.addEventListener("click", (event) => {
      if (event.target === modal || event.target.closest(".ticket-detail-close") || event.target.closest(".ticket-detail-ok")) closeTicketModal();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !modal.classList.contains("hidden")) closeTicketModal();
    });
    return modal;
  }

  function closeTicketModal() {
    const modal = document.getElementById("ticketDetailModal");
    if (!modal) return;
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
  }

  function openTicketModal(key) {
    const data = DETAIL_MAP[key] || DETAIL_MAP.welcome;
    const modal = ensureTicketModal();
    const title = modal.querySelector("#ticketDetailTitle");
    const sub = modal.querySelector("#ticketDetailSub");
    const valid = modal.querySelector("#ticketDetailValid");
    const rule = modal.querySelector("#ticketDetailRule");
    const copy = modal.querySelector("#ticketDetailCopy");
    if (title) title.textContent = data.title;
    if (sub) sub.textContent = data.sub;
    if (valid) valid.textContent = data.valid;
    if (rule) rule.textContent = data.rule;
    if (copy) copy.textContent = data.copy;
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
  }

  function bindTicketDetailButtons() {
    document.querySelectorAll("[data-perk]").forEach((button) => {
      if (button.dataset.ticketDetailBound === "true") return;
      button.dataset.ticketDetailBound = "true";
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        openTicketModal(button.dataset.perk);
      });
    });
    document.querySelectorAll("[data-ticket-memory]").forEach((button) => {
      if (button.dataset.ticketMemoryBound === "true") return;
      button.dataset.ticketMemoryBound = "true";
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const recordTab = document.querySelector('.tab[data-page="record"]');
        const recordIcon = document.querySelector('[data-go="record"]');
        if (recordTab) recordTab.click();
        else if (recordIcon) recordIcon.click();
        else {
          document.querySelectorAll(".page").forEach((el) => el.classList.toggle("active", el.id === "page-record"));
          document.querySelectorAll(".tab").forEach((el) => el.classList.toggle("active", el.dataset.page === "record"));
          window.scrollTo({ top: 0, behavior: "auto" });
        }
      });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bindTicketDetailButtons);
  else bindTicketDetailButtons();
  setTimeout(bindTicketDetailButtons, 0);
})();



/* ===== PC achievement renderer restored from backup: 업적 PC 전용 ===== */
(function () {
  'use strict';

  var ACH = [
    {id:'first-dot',cat:'live',state:'locked',icon:'✨',name:'첫 번째 점',desc:'Lumibelle Debut Live에서 루미벨의 첫 번째 점을 함께 기록하는 업적이에요.',progress:'미달성',reward:'조건 달성 후 해금',title:'',date:'미달성',rule:'데뷔 라이브 참여 기록 또는 첫 공연 기록과 연결되는 업적이에요.'},
    {id:'first-visit',cat:'live',state:'locked',icon:'🎀',name:'첫 루미 방문',desc:'공연/물판/온라인으로 루미벨에게 처음 와준 기록이에요. 스탬프 기준은 아니고, 와줘서 고마워요 기록으로 남아요.',progress:'미달성',reward:'조건 달성 후 해금',title:'',date:'미달성',rule:'첫 루미 방문 기록이 생기면 달성되는 기본 성장 업적이에요.'},
    {id:'first-ticket',cat:'event',state:'locked',icon:'🎫',name:'첫 티켓 보유',desc:'루미폰 티켓함에 첫 공연 티켓이 들어온 기록이에요.',progress:'미달성',reward:'조건 달성 후 해금',title:'',date:'미달성',rule:'현재 티켓 또는 지난 티켓 기록과 연결되는 업적이에요.'},
    {id:'welcome-ticket',cat:'event',state:'locked',icon:'💝',name:'Welcome Ticket 보유',desc:'처음 루미벨을 만나러 온 루미나에게 지급되는 신규 이벤트권 기록이에요.',progress:'미달성',reward:'조건 달성 후 해금',title:'',date:'미달성',rule:'Welcome Ticket 보유 기록이 연결되면 달성되는 업적이에요.'},
    {id:'first-letter',cat:'online',state:'locked',icon:'💌',name:'첫 루미레터 수신',desc:'루미폰에 도착한 우편/루미레터를 처음 확인한 기록이에요.',progress:'미달성',reward:'조건 달성 후 해금',title:'',date:'미달성',rule:'우편/루미레터 수신 기록이 연결되면 달성되는 업적이에요.'},
    {id:'first-checkin',cat:'field',state:'locked',icon:'📸',name:'첫 루미 체크인',desc:'특전회 촬영/교류 실제 참여 완료 시 달성되는 업적이에요.',progress:'0 / 1',reward:'스탬프 / 반짝 XP 후보',title:'첫 체크인',date:'미달성',rule:'루미 체크인은 스탬프 지급 기준이에요. 라이브 관람만으로는 달성되지 않아요.'},
    {id:'stamp-one',cat:'field',state:'locked',icon:'🌸',name:'스탬프 첫 장',desc:'루미 체크인으로 첫 스탬프를 받으면 열리는 성장 업적이에요.',progress:'0 / 1',reward:'반짝 XP 후보',title:'스탬프 첫 장',date:'미달성',rule:'스탬프는 기본 1일 1회, 이벤트 데이에는 추가 지급될 수 있어요.'},
    {id:'stamp-five',cat:'field',state:'locked',icon:'🌷',name:'스탬프 5개',desc:'루미 체크인을 차곡차곡 쌓으면 5번째 스탬프에 도착하는 업적이에요.',progress:'0 / 5',reward:'반짝 XP 후보',title:'다섯 번의 반짝임',date:'미달성',rule:'루미 체크인 완료 기록 기준으로 카운트되는 성장 업적이에요.'},
    {id:'stamp-ten',cat:'field',state:'locked',icon:'🌹',name:'스탬프 10개',desc:'루미 체크인 10회에 도착하면 열리는 중간 성장 업적이에요.',progress:'0 / 10',reward:'칭호 후보',title:'열 번의 약속',date:'미달성',rule:'루미 체크인 완료 기록 기준으로 카운트되는 성장 업적이에요.'},
    {id:'stamp-twenty',cat:'field',state:'locked',icon:'🏵️',name:'스탬프 20개 완주',desc:'한 회차 스탬프를 완주하면 열리는 업적이에요. 보상 수령 후 다음 회차로 이어져요.',progress:'0 / 20',reward:'완주 보상 후보',title:'스탬프 완주자',date:'미달성',rule:'20회 완주 후 보상 수령 가능하며, 기록은 사라지지 않아요.'},
    {id:'first-onair',cat:'online',state:'locked',icon:'📡',name:'첫 ON AIR 방문',desc:'방송 중 ON AIR 페이지를 통해 루미벨과 온라인으로 연결된 기록이에요.',progress:'0 / 1',reward:'반짝 포인트 / 반짝 XP 후보',title:'온라인으로 닿은 마음',date:'미달성',rule:'ON AIR 방문 기록 또는 방송 보러가기 클릭 기록과 연결할 수 있어요.'},
    {id:'first-lumicode',cat:'online',state:'locked',icon:'🔑',name:'첫 루미코드 인증',desc:'방송이나 이벤트에서 공개된 루미코드를 처음 인증한 기록이에요.',progress:'0 / 1',reward:'루미코드 기록',title:'첫 번째 코드',date:'미달성',rule:'실제 루미코드 인증 기능은 추후 연결 예정이에요.'},
    {id:'first-meate',cat:'event',state:'locked',icon:'💗',name:'첫 메아테 지정',desc:'공연 예매에서 Lumibelle을 처음 메아테로 지정한 기록이에요.',progress:'0 / 1',reward:'메아테 기록',title:'처음의 메아테',date:'미달성',rule:'예약/티켓 데이터의 메아테 값과 연결될 예정이에요.'},
    {id:'birthday-ticket',cat:'event',state:'locked',icon:'🎂',name:'Birthday Ticket 보유',desc:'생일 시즌에 Birthday Ticket이 지급되면 확인할 수 있는 이벤트 업적이에요.',progress:'예정',reward:'생일 기념 기록',title:'생일의 주인공',date:'생일 기준에 따라 표시',rule:'Birthday Ticket은 특전권의 한 종류지만, 생일 시즌에는 상단에 특별 표시됩니다.'},
    {id:'new-color-line',cat:'secret',state:'locked',icon:'🔐',name:'새로운 색이 다가오는 중',desc:'공개 전 멤버와 관련된 해금 예정 업적이에요.',progress:'공개 전 잠금',reward:'공개 후 해금 예정',title:'',date:'잠금',rule:'공개 전에는 이름과 상세 조건을 표시하지 않습니다.'},
    {id:'angel-blue',cat:'secret',state:'locked',icon:'💎',name:'Angel Blue Coming Soon',desc:'푸른 색의 새로운 조각이 다가오고 있어요.',progress:'공개 전 잠금',reward:'공개 후 해금 예정',title:'',date:'잠금',rule:'공개 전에는 이름과 상세 조건을 표시하지 않습니다.'},
    {id:'secret-line',cat:'secret',state:'secret',icon:'❔',name:'???',desc:'조건을 만족하면 갑자기 해금되는 비밀 업적이에요.',progress:'숨김',reward:'비밀 칭호 후보',title:'',date:'미공개',rule:'비공개 숨김 업적은 해금 전까지 상세 조건을 공개하지 않습니다.'}
  ];

  var currentFilter = 'all';

  function pcNormalizeApiStatus(status) {
    var raw = String(status || '').trim().toLowerCase();
    if (raw === 'achieved' || raw === 'complete' || raw === 'completed' || raw === '달성' || raw === '달성 완료') return 'done';
    if (raw === 'progress' || raw === 'progressing' || raw === '진행' || raw === '진행 중' || raw === '대기 중') return 'progress';
    if (raw === 'hidden' || raw === '숨김') return 'secret';
    return 'locked';
  }

  function pcProgressText(item, state) {
    if (state === 'done') return '1 / 1';
    var cur = Number(item && item.progressCurrent || 0);
    var target = Number(item && item.progressTarget || 0);
    if (target > 0) return String(cur) + ' / ' + String(target);
    return state === 'progress' ? '진행중' : '미달성';
  }

  function pcRewardText(item) {
    return String(item && (item.rewardText || item.reward || '') || '').trim() || '조건 달성 후 해금';
  }

  function pcTitleReward(item) {
    var raw = pcRewardText(item);
    var m = raw.match(/^칭호\s*[:：]\s*(.+)$/);
    return m ? String(m[1] || '').trim() : '';
  }

  function pcAchievementIdForApi(item) {
    var key = String(item && item.achievementKey || '').trim();
    var title = String(item && item.title || '').trim();
    var byKey = {
      first_visit: 'first-dot',
      stamp_1: 'stamp-one',
      stamp_20: 'stamp-twenty'
    };
    if (byKey[key]) return byKey[key];
    var byTitle = {
      '첫 번째 점': 'first-dot',
      '첫 번째 꽃도장': 'stamp-one',
      '꽃도장 한 판 완성': 'stamp-twenty',
      '첫 루미 체크인': 'first-checkin'
    };
    return byTitle[title] || '';
  }

  function applyApiAchievementToPc(item) {
    var id = pcAchievementIdForApi(item);
    if (!id) return;
    var target = ACH.find(function(a){ return a.id === id; });
    if (!target) return;
    var state = pcNormalizeApiStatus(item.status);
    var reward = pcRewardText(item);
    var titleReward = pcTitleReward(item);
    target.state = state;
    target.icon = String(item.icon || target.icon || '✦');
    target.name = String(item.title || target.name || '업적');
    target.desc = String(item.conditionText || target.desc || '루미벨과 함께한 기록이에요.');
    target.progress = pcProgressText(item, state);
    target.reward = reward;
    target.title = titleReward;
    target.date = String(item.achievedAt || (state === 'done' ? '달성 완료' : state === 'progress' ? '진행중' : '미달성'));
    target.rule = String(item.conditionText || target.rule || '-');
  }

  function applyApiAchievementsPayload(payload) {
    var data = payload || {};
    var achievements = Array.isArray(data.achievements) ? data.achievements : [];
    achievements.forEach(applyApiAchievementToPc);
    drawList();
  }

  window.__lumiUpdatePcAchievements = function(payload) {
    try { applyApiAchievementsPayload(payload); } catch(e) {}
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function rowClass(a) {
    var cls = 'ach-pc-row';
    if (a.state === 'done') cls += ' done';
    if (a.state === 'locked' || a.state === 'secret') cls += ' locked secret';
    return cls;
  }

  function isVisible(a, f) {
    if (f === 'all') return a.cat !== 'secret';
    if (f === 'done') return a.state === 'done';
    if (f === 'progress') return a.state === 'progress';
    if (f === 'field') return a.cat === 'field' || a.cat === 'live';
    if (f === 'online') return a.cat === 'online';
    if (f === 'event') return a.cat === 'event';
    if (f === 'secret') return a.cat === 'secret';
    return true;
  }

  function rewardLine(a) {
    if (a.title) return esc(a.progress) + ' · 보상: 칭호 「' + esc(a.title) + '」';
    return esc(a.progress) + ' · 보상: ' + esc(a.reward || '-');
  }

  function stateLabel(a) {
    if (a.state === 'done') return '달성';
    if (a.state === 'progress') return '대기 중';
    if (a.state === 'locked') return '잠금';
    if (a.state === 'secret') return '숨김';
    return a.state || '';
  }

  function ensureModal() {
    var m = document.getElementById('achPcModal');
    if (m) return m;
    m = document.createElement('div');
    m.id = 'achPcModal';
    m.style.cssText = 'position:fixed;inset:0;z-index:99999;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(67,45,58,.28);backdrop-filter:blur(6px);';
    m.innerHTML = '<div style="position:relative;width:min(600px,100%);max-height:86vh;overflow:auto;border:1px solid #f2d8e7;border-radius:30px;background:#fff;box-shadow:0 24px 60px rgba(126,78,105,.22);text-align:center;padding:30px;">'
      + '<button id="achPcModalX" type="button" style="position:absolute;right:16px;top:16px;width:40px;height:40px;border:1px solid #efbcd5;border-radius:50%;background:#fff;color:#b07693;font-size:20px;font-weight:900;cursor:pointer;">×</button>'
      + '<div id="achPcModalBody"></div>'
      + '</div>';
    document.body.appendChild(m);
    m.querySelector('#achPcModalX').onclick = function () { m.style.display = 'none'; };
    m.onclick = function (e) { if (e.target === m) m.style.display = 'none'; };
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') m.style.display = 'none'; });
    return m;
  }

  function openModal(a) {
    var m = ensureModal();
    var body = document.getElementById('achPcModalBody');
    if (!body) return;
    var canEquip = (a.state === 'done' && !!a.title);
    body.innerHTML = '<div style="width:74px;height:74px;border-radius:24px;display:grid;place-items:center;margin:0 auto 14px;background:linear-gradient(135deg,#fff0f7,#fff);border:1px solid #f2d8e7;font-style:normal;font-size:36px;line-height:1;">' + esc(a.icon) + '</div>'
      + '<h4 style="margin:0 0 12px;color:#d77ca7;font-size:28px;line-height:1.24;font-weight:900;">' + esc(a.name) + '</h4>'
      + '<p style="margin:0 0 18px;color:#76586a;font-size:16px;line-height:1.75;font-weight:900;">' + esc(a.desc) + '</p>'
      + '<div style="display:grid;grid-template-columns:92px minmax(0,1fr);gap:8px 10px;padding:16px;border:1px solid #f2d8e7;border-radius:20px;background:#fffafd;text-align:left;margin-bottom:20px;">'
      + '<b style="color:#d77ca7;font-size:15px;font-weight:900;">상태</b><span style="color:#7c5b6d;font-size:15px;line-height:1.45;font-weight:900;">' + esc(stateLabel(a)) + '</span>'
      + '<b style="color:#d77ca7;font-size:15px;font-weight:900;">진행도</b><span style="color:#7c5b6d;font-size:15px;line-height:1.45;font-weight:900;">' + esc(a.progress) + '</span>'
      + '<b style="color:#d77ca7;font-size:15px;font-weight:900;">보상</b><span style="color:#7c5b6d;font-size:15px;line-height:1.45;font-weight:900;">' + esc(a.reward || '-') + '</span>'
      + (a.title ? '<b style="color:#d77ca7;font-size:15px;font-weight:900;">획득 칭호</b><span style="color:#7c5b6d;font-size:15px;line-height:1.45;font-weight:900;">「' + esc(a.title) + '」</span>' : '')
      + '<b style="color:#d77ca7;font-size:15px;font-weight:900;">기록일</b><span style="color:#7c5b6d;font-size:15px;line-height:1.45;font-weight:900;">' + esc(a.date || '-') + '</span>'
      + '<b style="color:#d77ca7;font-size:15px;font-weight:900;">달성 기준</b><span style="color:#7c5b6d;font-size:15px;line-height:1.45;font-weight:900;">' + esc(a.rule || '-') + '</span>'
      + '</div>'
      + (canEquip ? '<button id="achPcEquipBtn" type="button" style="min-height:48px;border:0;border-radius:999px;background:linear-gradient(180deg,#ff82ba,#ff5fa8);color:#fff;font-size:16px;font-weight:900;padding:0 28px;cursor:pointer;">프로필 칭호로 장착</button>' : '');
    m.style.display = 'flex';
    if (canEquip) {
      var btn = document.getElementById('achPcEquipBtn');
      if (btn) {
        btn.onclick = function () {
          /* 1번 파일 기존 equipAchievementTitle 함수 호출 */
          if (typeof equipAchievementTitle === 'function') {
            equipAchievementTitle(a.title, false);
          } else {
            /* fallback: localStorage 직접 저장 후 안내 */
            try { var _tid = window.__lumiGetCurrentId ? window.__lumiGetCurrentId() : ""; localStorage.setItem('lumi_v9_title' + (_tid ? "." + _tid.toLowerCase() : ""), a.title); } catch(e) {}
            /* profileTitleText, titlePill 등 UI 동기화 */
            ['titlePill','profileTitleText','v25CurrentTitleText'].forEach(function(id) {
              var el = document.getElementById(id);
              if (el) el.textContent = a.title;
            });
            if (typeof openProfileSimpleModal === 'function') {
              // 팝업 없이 조용히 장착
            } else {
              // 조용히 처리
            }
          }
          m.style.display = 'none';
        };
      }
    }
  }

  function drawList() {
    var list = document.getElementById('achPcList');
    if (!list) return;
    var data = ACH.filter(function (a) { return isVisible(a, currentFilter); });
    if (!data.length) {
      list.innerHTML = '<div class="ach-pc-empty">표시할 업적이 아직 없어요.</div>';
      return;
    }
    list.innerHTML = data.map(function (a, i) {
      return '<button type="button" class="' + rowClass(a) + '" data-ach-idx="' + i + '">'
        + '<i class="ach-pc-icon">' + esc(a.icon) + '</i>'
        + '<span class="ach-pc-text">'
          + '<b>' + esc(a.name) + '</b>'
          + '<span>' + esc(a.desc) + '</span>'
          + '<small>' + rewardLine(a) + '</small>'
          + '<em class="ach-pc-date">' + esc(a.date || '-') + '</em>'
        + '</span>'
        + '<span class="ach-pc-chip">상세</span>'
      + '</button>';
    }).join('');
    list.querySelectorAll('.ach-pc-row').forEach(function (row) {
      row.onclick = function () { openModal(data[Number(row.dataset.achIdx)]); };
    });
  }

  function bindMenu() {
    var menu = document.getElementById('achPcMenu');
    if (!menu) return;
    menu.querySelectorAll('button[data-ach-pc]').forEach(function (btn) {
      btn.onclick = function () {
        currentFilter = btn.dataset.achPc || 'all';
        menu.querySelectorAll('button').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        drawList();
      };
    });
  }

  function isPc() {
    return window.innerWidth >= 760;
  }

  function init() {
    if (!isPc()) return;
    initialized = true;
    bindMenu();
    drawList();
    if (window.__lumiLatestAchievementsPayload) applyApiAchievementsPayload(window.__lumiLatestAchievementsPayload);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* 창 크기 바뀔 때 PC 진입 시 한 번만 초기화 */
  var initialized = false;
  window.addEventListener('resize', function () {
    if (isPc() && !initialized) {
      initialized = true;
      bindMenu();
      drawList();
      if (window.__lumiLatestAchievementsPayload) applyApiAchievementsPayload(window.__lumiLatestAchievementsPayload);
    }
  });
})();


/* ===== PC stamp restore renderer: desktop-only, mobile untouched ===== */
(function(){
  'use strict';

  // PATCH 51-52-fix3: checkins 연동값을 우선 사용.
  // 이 PC 복구 렌더러가 늦게 실행되며 0개로 덮어쓰지 않도록 매 렌더마다 최신값을 읽는다.
  var STAMP_COUNT = 0;
  function getLiveStampCount(){
    var n = Number(window.__lumiStampCycleStamps);
    if (Number.isFinite(n) && n >= 0) return n;
    return STAMP_COUNT || 0;
  }
  // Lumi Signup Patch 1-fix2A: 스탬프 보상 키 계정별 격리
  function stampRewardKey() {
    try { var id = window.__lumiGetCurrentId ? window.__lumiGetCurrentId() : ""; return id ? 'lumi_v256_stamp_title_rewards.' + id.toLowerCase() : 'lumi_v256_stamp_title_rewards'; } catch(e) { return 'lumi_v256_stamp_title_rewards'; }
  }
  var STAMP_REWARD_KEY = 'lumi_v256_stamp_title_rewards'; // 하위호환용 상수 (readRewards/writeRewards에서 stampRewardKey() 사용)
  var rewards = [
    {key:'stamp5', need:5, label:'5개', title:'특별 우편 도착', desc:'다음 보상까지 5개 남았어요.'},
    {key:'stamp10', need:10, label:'10개', title:'디지털 메시지 / 칭호 후보', desc:'다음 보상까지 10개 남았어요.'},
    {key:'stamp15', need:15, label:'15개', title:'특별 편지 / 장식 후보', desc:'다음 보상까지 15개 남았어요.'},
    {key:'stamp20', need:20, label:'20개', title:'1회차 완주 · 소장 우편 · 업적 해금', desc:'다음 보상까지 20개 남았어요.'}
  ];

  function $(id){ return document.getElementById(id); }
  function readRewards(){
    try{
      var arr = JSON.parse(localStorage.getItem(stampRewardKey()) || '[]');
      return Array.isArray(arr) ? arr.filter(Boolean) : [];
    }catch(e){ return []; }
  }
  function writeRewards(arr){
    try{ localStorage.setItem(stampRewardKey(), JSON.stringify(Array.from(new Set((arr || []).filter(Boolean))))); }catch(e){}
  }
  function isPc(){ return window.innerWidth >= 760; }

  function renderStampGrid(){
    var grid = $('stampGridPc');
    if(!grid) return;
    var liveCount = getLiveStampCount();
    var html = '';
    for(var i=1;i<=20;i++){
      html += '<div class="stamp ' + (i > liveCount ? 'empty' : '') + '">' + (i <= liveCount ? '🌸' : '✧') + '</div>';
    }
    grid.innerHTML = html;
  }

  function rewardState(r, claimed){
    var liveCount = getLiveStampCount();
    if(claimed.indexOf(r.key) !== -1) return 'done';
    if(liveCount >= r.need) return 'ready';
    return 'lock';
  }
  function rewardLabel(state){
    if(state === 'done') return '완료';
    if(state === 'ready') return '수령 가능';
    return '대기 중';
  }
  function rewardButton(state){
    if(state === 'done') return '수령 완료';
    if(state === 'ready') return '보상 수령';
    return '아직 시작 전';
  }

  function renderStampRewards(){
    var list = $('stampRewardListPc');
    if(!list) return;
    var claimed = readRewards();
    list.innerHTML = rewards.map(function(r){
      var state = rewardState(r, claimed);
      var liveCount = getLiveStampCount();
      var pct = Math.max(0, Math.min(100, Math.round((liveCount / r.need) * 100)));
      return '<div class="reward" data-stamp-reward="' + r.key + '">'
        + '<b>' + r.label + '<span class="stamp-reward-state ' + state + '">' + rewardLabel(state) + '</span></b>'
        + '<span>' + r.title + '</span>'
        + '<small class="stamp-reward-meta">' + r.desc + '</small>'
        + '<div class="stamp-reward-progress"><i style="width:' + pct + '%"></i></div>'
        + '<button type="button" class="stamp-reward-btn ' + state + '" data-stamp-claim="' + r.key + '" ' + (state === 'lock' || state === 'done' ? 'disabled' : '') + '>' + rewardButton(state) + '</button>'
      + '</div>';
    }).join('');

    Array.prototype.slice.call(list.querySelectorAll('[data-stamp-claim]')).forEach(function(btn){
      btn.onclick = function(){
        var key = btn.getAttribute('data-stamp-claim');
        var arr = readRewards();
        if(arr.indexOf(key) === -1) arr.push(key);
        writeRewards(arr);
        renderStampRewards();
      };
    });
  }

  function init(){
    if(!isPc()) return;
    renderStampGrid();
    renderStampRewards();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  window.addEventListener('resize', init);
})();


/* ===== Exchange PC original restore v2828 renderer ===== */
(function(){
  'use strict';
  var rewards=[
    {cat:'reaction', icon:'💧', title:'물 한 모금', point:'30p', desc:'방송 중 멤버가 물 한 모금 마시는 가벼운 리액션 후보.'},
    {cat:'reaction', icon:'🧘', title:'스트레칭 타임', point:'30p', desc:'오래 앉아있는 방송 중 짧게 몸을 풀어주는 리액션 후보.'},
    {cat:'reaction', icon:'📣', title:'닉네임 콜', point:'50p', desc:'방송 중 닉네임을 불러주는 짧은 리액션 후보.'},
    {cat:'reaction', icon:'💬', title:'응원 한마디', point:'80p', desc:'루미나에게 짧은 응원 멘트를 전하는 보상 후보.'},
    {cat:'reaction', icon:'💕', title:'애교 대사', point:'150p', desc:'멤버별 가능 범위 안에서 진행하는 애교 대사 후보.'},
    {cat:'reaction', icon:'😼', title:'매도 대사', point:'300p', desc:'방송 분위기와 멤버 가능 여부에 따라 조정되는 대사 후보.'},
    {cat:'digital', icon:'🎧', title:'시크릿 보이스', point:'300p', desc:'짧은 디지털 보이스 보상 후보. 실제 지급 방식은 추후 확정.'},
    {cat:'digital', icon:'💌', title:'랜덤 대사 해금', point:'300p', desc:'루미폰 안에서 랜덤 대사나 메시지를 해금하는 후보.'},
    {cat:'season', icon:'🏷️', title:'시즌 배지', point:'300p', desc:'프로필/업적과 연결 가능한 시즌 한정 배지 후보.'},
    {cat:'song', icon:'🎶', title:'애교송', point:'500p', desc:'방송에서 가능한 짧은 애교송 보상 후보. 실제 가능 범위는 추후 확정.'},
    {cat:'song', icon:'🎫', title:'노래 신청권', point:'500p', desc:'노래책에 등록된 신청 가능 곡 중 1곡을 신청하는 후보. 멤버 컨디션과 방송 상황에 따라 조정될 수 있어요.'},
    {cat:'season', icon:'🎴', title:'시즌 디지털 카드', point:'700p', desc:'카드 앨범에 남길 수 있는 시즌 한정 디지털 카드 후보.'}
  ];
  var labels={all:'전체',reaction:'방송 리액션',digital:'디지털 보상',song:'노래 보상',season:'시즌 보상'};
  var order=['all','reaction','digital','song','season'];
  function qs(s,r){return (r||document).querySelector(s)}
  function qsa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function cleanTextValue(v){
    return String(v||'')
      .replace(/샘플 코드:\s*STARDUST\s*\/\s*LUMI2026/g,'')
      .replace(/샘플 코드는\s*STARDUST\s*입니다\.?/g,'다시 확인해 주세요.')
      .replace(/샘플 코드 인증 완료\s*·\s*실제 지급\/차감은 이번 패치에서 연결하지 않음/g,'루미코드 인증 완료 · 방송 참여 기록 저장')
      .replace(/샘플 코드 인증 완료/g,'루미코드 인증 완료')
      .replace(/더미 기록\.?\s*실제 교환소 처리는 다음 단계에서 연결합니다\.?/g,'온라인 응원 기록이 저장되었어요.')
      .replace(/온라인 응원 흔적 더미 기록\.?\s*실제 교환소 처리는 다음 단계에서 연결합니다\.?/g,'온라인 응원 기록이 저장되었어요.')
      .replace(/화면 구조 확인용 더미 카드입니다\.?/g,'이벤트 오픈 전 준비 카드입니다.')
      .replace(/이번 패치에서는 구조 확인용 더미 카드만 제공합니다\.?/g,'이벤트 오픈 전 준비 카드로 표시됩니다.')
      .replace(/현재는 화면 구조 확인 단계예요\. 실제 노래 데이터와 신청 로직은 연결하지 않았어요\.?/g,'현재는 노래 보상 후보를 정리하는 단계예요. 실제 신청 로직은 추후 연결됩니다.')
      .replace(/더미 카드/g,'준비 카드')
      .replace(/더미 날짜/g,'임시 날짜');
  }
  function cleanNode(el){
    if(!el) return;
    if(el.nodeType===3){var next=cleanTextValue(el.nodeValue); if(next!==el.nodeValue) el.nodeValue=next; return;}
    if(el.nodeType!==1) return;
    ['title','aria-label','placeholder','data-original-title'].forEach(function(attr){
      if(el.hasAttribute && el.hasAttribute(attr)){
        var val=el.getAttribute(attr)||'';
        var cleaned=cleanTextValue(val);
        if(!cleaned.trim() && /샘플 코드|STARDUST|LUMI2026/.test(val)) el.removeAttribute(attr);
        else if(cleaned!==val) el.setAttribute(attr,cleaned);
      }
    });
    Array.prototype.slice.call(el.childNodes||[]).forEach(cleanNode);
  }
  function ensureExchangeShell(){
    var page=qs('#page-exchange'); if(!page) return null;
    qsa('[data-exchange-filter]',page).forEach(function(btn){
      btn.setAttribute('data-legacy-ok','1');
      btn.setAttribute('tabindex','-1');
      btn.setAttribute('aria-hidden','true');
    });
    qsa('[data-legacy-exchange-tabs], [data-legacy-exchange-grid], .exchange-tabs:not(#exchangeTabsV2828):not(#exchangeTabsV2827), #exchangeRewardGrid:not(#exchangeRewardGridV2828):not(#exchangeRewardGridV2827), .exchange-reward-grid:not(#exchangeRewardGridV2828):not(#exchangeRewardGridV2827)',page).forEach(function(el){
      el.setAttribute('aria-hidden','true');
      el.style.display='none';
      el.style.pointerEvents='none';
    });
    var article=qs('article.card',page) || page;
    var oldTabs=qs('#exchangeTabsV2827',page);
    var oldGrid=qs('#exchangeRewardGridV2827',page);
    var tabs=qs('#exchangeTabsV2828',page);
    if(!tabs){
      tabs=document.createElement('div'); tabs.id='exchangeTabsV2828'; tabs.className='exchange-tabs-v2828';
      if(oldTabs) oldTabs.insertAdjacentElement('afterend',tabs);
      else article.appendChild(tabs);
    }
    if(!qs('[data-lumi-exchange-filter]',tabs)){
      tabs.innerHTML=order.map(function(cat){return '<button type="button" data-lumi-exchange-filter="'+cat+'">'+labels[cat]+'</button>';}).join('');
    }
    qsa('[data-lumi-exchange-filter]',tabs).forEach(function(btn){
      btn.onclick=function(ev){
        if(ev){ev.preventDefault(); ev.stopPropagation();}
        renderExchange(btn.getAttribute('data-lumi-exchange-filter')||'all');
        return false;
      };
    });
    var grid=qs('#exchangeRewardGridV2828',page);
    if(!grid){
      grid=document.createElement('div'); grid.id='exchangeRewardGridV2828'; grid.className='exchange-reward-grid-v2828';
      if(oldGrid) oldGrid.insertAdjacentElement('afterend',grid);
      else tabs.insertAdjacentElement('afterend',grid);
    }
    if(oldTabs){oldTabs.setAttribute('aria-hidden','true'); oldTabs.style.display='none'; oldTabs.style.pointerEvents='none';}
    if(oldGrid){oldGrid.setAttribute('aria-hidden','true'); oldGrid.style.display='none'; oldGrid.style.pointerEvents='none';}
    return {page:page,tabs:tabs,grid:grid};
  }
  function escExchangeText(v){
    return String(v == null ? '' : v).replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];});
  }
  function pointLabel(type){
    var key=String(type||'').trim();
    if(key==='site') return '홈페이지 포인트';
    if(key==='merch') return '물판 포인트';
    if(key==='xp') return '반짝 XP';
    if(key==='none') return '안내';
    return key || '포인트';
  }
  function statusLabel(status){
    var key=String(status||'').trim();
    if(key==='active') return '교환 가능';
    if(key==='preparing') return '준비중';
    if(key==='closed') return '종료';
    if(key==='info') return '안내';
    return key || '준비중';
  }
  function limitText(item){
    var type=String(item.limitType||'none').trim();
    var count=Number(item.limitCount||0);
    if(type==='monthly') return '월 '+(count||1)+'회';
    if(type==='daily') return '일 '+(count||1)+'회';
    if(type==='once') return '1회 한정';
    return '';
  }
  function iconForShopItem(item){
    var cat=String(item.category||'').trim();
    var point=String(item.pointType||'').trim();
    if(cat==='merch'||point==='merch') return '🎫';
    if(item.status==='info') return '💡';
    if(point==='site') return '💌';
    return '✦';
  }
  function exchangeCatForShopItem(item){
    var cat=String(item.category||'').trim();
    var point=String(item.pointType||'').trim();
    var status=String(item.status||'').trim();
    // PATCH 51-55-fix1: 최종 안정본 탭은 유지한다.
    // special/site 보상은 디지털 보상 후보로 묶고, merch/info는 별도 탭을 만들지 않고 전체에서만 안내 카드로 보여준다.
    if(cat==='merch'||point==='merch'||status==='info') return 'allOnly';
    if(cat==='special'||point==='site') return 'digital';
    if(labels[cat] && cat!=='all') return cat;
    return 'digital';
  }
  function apiShopRewards(){
    var payload=window.__lumiShopItemsPayload||null;
    var items=payload&&Array.isArray(payload.items)?payload.items:[];
    if(!items.length) return [];
    return items.filter(function(item){
      return String(item.status||'').trim() !== 'hidden';
    }).map(function(item){
      var cost=Number(item.cost||0);
      var ptype=String(item.pointType||'site');
      var status=String(item.status||'preparing');
      var cat=exchangeCatForShopItem(item);
      var costText=(ptype==='none'||status==='info')?'안내':pointLabel(ptype)+' '+cost+'p';
      var lim=limitText(item);
      var desc=String(item.description||item.note||'교환소 보상이에요.');
      if(cat==='allOnly') desc += ' · 현장 스탭 확인 후 사용';
      else if(lim) desc += ' · '+lim;
      return {cat:cat, icon:iconForShopItem(item), title:String(item.itemName||'교환소 아이템'), point:costText, desc:desc, status:status, itemId:String(item.itemId||''), source:'api'};
    });
  }
  function currentExchangeRewards(){
    // PATCH 51-55-fix1: API 아이템으로 안정본 보상 후보를 교체하지 않고, 기존 후보 뒤에 추가한다.
    // 이렇게 해야 2열 카드 밀도와 기본 탭 구성이 유지된다.
    var api=apiShopRewards();
    return rewards.concat(api);
  }
  function cardHtml(item){
    var label=statusLabel(item.status||'preparing');
    var cls='exchange-reward-card-v2828 status-'+String(item.status||'preparing');
    return '<div class="'+cls+'" data-lumi-exchange-cat="'+escExchangeText(item.cat)+'" data-lumi-shop-item="'+escExchangeText(item.itemId||'')+'"><em>'+escExchangeText(item.point)+'</em><i>'+escExchangeText(item.icon)+'</i><b>'+escExchangeText(item.title)+'</b><span>'+escExchangeText(item.desc)+'</span><button type="button" disabled>'+escExchangeText(label)+'</button></div>';
  }
  function renderExchange(cat){
    var shell=ensureExchangeShell(); if(!shell) return;
    cat=labels[cat]?cat:'all'; window.__lumiExchangeSelectedCatV2828=cat;
    qsa('[data-lumi-exchange-filter]',shell.tabs).forEach(function(btn){btn.classList.toggle('active',btn.getAttribute('data-lumi-exchange-filter')===cat);});
    var allRewards=currentExchangeRewards();
    var data=allRewards.filter(function(item){return cat==='all'||item.cat===cat});
    shell.grid.innerHTML=data.map(cardHtml).join('');
    var msg=qs('#exchangeMsgV2827',shell.page) || qs('#exchangeMsg',shell.page);
    if(msg){
      msg.innerHTML=cat==='all'
        ? (apiShopRewards().length ? '교환소 아이템을 불러왔어요. 홈페이지 포인트 보상은 후보로, 물판 포인트는 현장 안내 카드로 표시해요. 실제 신청과 차감은 아직 연결하지 않았어요.' : '지금은 보상 후보와 포인트 기준을 먼저 잡아둔 상태예요. 실제 신청, 차감, 멤버별 가능 범위는 추후 공개됩니다.')
        : '<strong>'+labels[cat]+'</strong> 후보만 보고 있어요. 실제 신청, 차감, 멤버별 가능 범위는 추후 공개됩니다.';
    }
  }
  window.__lumiRenderExchangeV2828=renderExchange;

  function patchMemoryCopy(){
    var page=qs('#page-record'); if(!page) return;
    var intro=qs('.v27-record-intro',page) || qs('.v23-story-copy',page);
    if(intro){
      intro.innerHTML='오프라인에서 만난 순간과 온라인으로 이어진 마음을 함께 모아보는 공간이에요.<br>루미 방문은 와준 순간, 루미 체크인은 특전회에 함께한 기록이에요. 스탬프는 체크인 기준으로 지급돼요.';
    }
    qsa('.v27-compact-guide, .record-clean-note, .memory-empty-note',page).forEach(function(el){
      if(el.classList.contains('v27-compact-guide') || /루미 방문은 와준 순간|스탬프는 체크인/.test(el.textContent||'')) el.remove();
    });
  }
  function patchFanDevCopy(){
    qsa('#page-onair,#page-record,#page-point,#page-home,#page-guide,#page-exchange,#page-future,#page-message,#page-lumilog').forEach(cleanNode);
    var preview=qs('#secretMessagePreview'); if(preview) preview.remove();
    var codeBtn=qs('#codeBtn'); if(codeBtn) codeBtn.removeAttribute('title');
    var codeInput=qs('#lumiCode') || qs('#onairCode'); if(codeInput) codeInput.removeAttribute('title');
    var msg=qs('#onairMsg'); if(msg) msg.textContent=cleanTextValue(msg.textContent);
  }
  function run(){
    renderExchange(window.__lumiExchangeSelectedCatV2828 || window.__lumiExchangeSelectedCat || 'all');
    patchMemoryCopy();
    patchFanDevCopy();
  }
  document.addEventListener('click',function(e){
    var btn=e.target.closest && e.target.closest('#exchangeTabsV2828 [data-lumi-exchange-filter]');
    if(!btn) return;
    e.preventDefault();
    e.stopPropagation();
    if(e.stopImmediatePropagation) e.stopImmediatePropagation();
    renderExchange(btn.getAttribute('data-lumi-exchange-filter')||'all');
  },true);
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run); else run();
  [60,180,420,900,1600,2600,4200,7000,10000].forEach(function(t){setTimeout(run,t)});
  if(window.MutationObserver && !window.__v2828FinalObserver){
    var timer=null;
    window.__v2828FinalObserver=new MutationObserver(function(){clearTimeout(timer); timer=setTimeout(run,90);});
    if(document.body) window.__v2828FinalObserver.observe(document.body,{childList:true,subtree:true});
  }
})();

/* Patch 11: Birthday Ticket month-based state only */
(() => {
  "use strict";

  const PROFILE_KEY = "lumiphone.profile.v1";
  const LOGIN_KEY = "lumiphone.loginState.v1";
  const SAMPLE_ID = ""; // Lumi Signup Patch 1-fix2A: SAMPLE_ID를 빈 문자열로 - LB-0001 자동 낙수 제거

  function normId(value) {
    const digits = String(value || "").replace(/\D/g, "").slice(-4);
    return digits ? "LB-" + digits.padStart(4, "0") : "";
  }

  function readLoginId() {
    try {
      const raw = localStorage.getItem(LOGIN_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      return normId(parsed && parsed.id);
    } catch (error) {
      return SAMPLE_ID;
    }
  }

  function pad2(value) {
    return String(value).padStart(2, "0");
  }

  function readProfileBirthday() {
    let info = null;
    try {
      // Lumi Signup Patch 1-fix2A: 계정별 격리 원칙
      // - lumiId가 있으면 반드시 lumiphone.profile.v2.{lid} 만 읽는다.
      // - per-user profile이 없으면 null 처리 (글로벌 PROFILE_KEY fallback 금지).
      // - lumiId가 없는 비로그인 상태에서만 PROFILE_KEY를 허용하지 않고, 그냥 null 처리.
      const lid = readLoginId();
      if (lid) {
        const perUserKey = "lumiphone.profile.v2." + lid.toLowerCase();
        const raw = localStorage.getItem(perUserKey);
        const parsed = raw ? JSON.parse(raw) : null;
        info = parsed && parsed.info ? parsed.info : null;
      }
      // lumiId가 없으면 info = null 그대로 유지 (Birthday Ticket 표시 안 함)
    } catch (error) {
      info = null;
    }

    // 생일 보강: loginState의 birthMonth/birthDay만 허용
    // (글로벌 profileState 읽기 금지 — 다른 계정 오염 방지)
    if (!info || (!info.birthdayMonth && !info.birthMonth)) {
      try {
        const loginRaw = localStorage.getItem(LOGIN_KEY);
        const loginParsed = loginRaw ? JSON.parse(loginRaw) : null;
        // loginState의 id가 현재 readLoginId()와 일치할 때만 사용
        const loginId = loginParsed && loginParsed.id ? String(loginParsed.id).trim().toUpperCase() : "";
        const currentLid = readLoginId().toUpperCase();
        if (loginId && loginId === currentLid && (loginParsed.birthMonth || loginParsed.birthdayMonth)) {
          info = Object.assign({}, info || {}, {
            birthdayMonth: loginParsed.birthMonth || loginParsed.birthdayMonth || "",
            birthdayDay: loginParsed.birthDay || loginParsed.birthdayDay || "",
            birthdayRegistered: !!(loginParsed.birthMonth || loginParsed.birthdayMonth)
          });
        }
      } catch(e) {}
    }

    const source = info || {};
    const birthdayRegistered = source.birthdayRegistered === true || source.birthdayRegistered === "true";
    const rawMonth = String(source.birthdayMonth || source.birthMonth || source.month || "").trim();
    const rawDay = String(source.birthdayDay || source.birthDay || source.day || "").trim();
    if (!birthdayRegistered && rawMonth === "07" && rawDay === "19") return { registered: false, month: null, day: null };
    const month = parseInt(rawMonth, 10);
    const day = parseInt(rawDay, 10);
    const hasBirthdayValue = Boolean(rawMonth && rawDay);
    const valid = (birthdayRegistered || hasBirthdayValue) && Number.isFinite(month) && month >= 1 && month <= 12 && Number.isFinite(day) && day >= 1 && day <= 31;
    return valid ? { registered: true, month, day } : { registered: false, month: null, day: null };
  }

  function lastDayOfMonth(year, month) {
    return new Date(year, month, 0).getDate();
  }

  function birthdayUseKey(year) {
    return "lumiphone.birthdayTicket.used." + readLoginId() + "." + year;
  }

  function isBirthdayUsed(year) {
    try {
      return localStorage.getItem(birthdayUseKey(year)) === "true";
    } catch (error) {
      return false;
    }
  }

  function getBirthdayTicketState(now) {
    const today = now || new Date();
    const year = today.getFullYear();
    const birth = readProfileBirthday();
    if (!birth.registered) {
      return {
        year: year,
        month: null,
        day: null,
        last: null,
        period: "생일 등록 후 표시",
        state: "unregistered",
        isActive: false,
        titleText: "Birthday Ticket 안내",
        labelText: "BIRTHDAY TICKET GUIDE",
        entryLabel: "BIRTHDAY GUIDE",
        periodLabel: "상태",
        statusText: "생일 등록 후 열림",
        statusShort: "생일 등록 후 열림",
        subText: "생일을 등록하면 생일 시즌에 열려요.",
        detailCopy: "생일을 등록하면 생일 시즌에 Birthday Ticket이 열려요. 사용 가능 기간은 생일 당월 1일부터 말일까지예요. 실제 사용은 현장에서 스탭 확인 후 진행됩니다."
      };
    }
    const last = lastDayOfMonth(year, birth.month);
    const start = new Date(year, birth.month - 1, 1, 0, 0, 0, 0);
    const end = new Date(year, birth.month - 1, last, 23, 59, 59, 999);
    const used = isBirthdayUsed(year);
    let state = "upcoming";
    if (used) state = "used";
    else if (today >= start && today <= end) state = "available";
    else if (today > end) state = "expired";

    const monthText = pad2(birth.month) + ".01 ~ " + pad2(birth.month) + "." + pad2(last);
    return {
      year: year,
      month: birth.month,
      day: birth.day,
      last: last,
      period: monthText,
      state: state,
      isActive: state === "available",
      titleText: "Birthday Ticket",
      labelText: "HAPPY BIRTHDAY · SPECIAL TICKET",
      entryLabel: "BIRTHDAY MONTH",
      periodLabel: "사용 기간",
      statusText: state === "used" ? "Birthday Ticket 사용 완료" : state === "available" ? "Birthday Ticket 사용 가능" : state === "expired" ? "올해 Birthday Ticket 사용 기간이 지났어요" : "생일 당월에 열려요",
      statusShort: state === "used" ? "사용 완료" : state === "available" ? "미사용 / 기간 내" : state === "expired" ? "기간 종료" : "대기 중",
      subText: state === "available" ? "생일 기념 촬영 특전권 · Birthday Ticket 사용 가능" : state === "used" ? "생일 기념 촬영 특전권 · 올해 사용 완료" : state === "expired" ? "생일 기념 촬영 특전권 · 올해 사용 기간 종료" : "생일 기념 촬영 특전권 · 생일 당월 1일에 열려요",
      detailCopy: "Birthday Ticket은 생일 당월 1일부터 말일까지 사용할 수 있는 생일 기념 촬영 특전권이에요. 현재 상태: " + (state === "used" ? "Birthday Ticket 사용 완료" : state === "available" ? "Birthday Ticket 사용 가능" : state === "expired" ? "올해 Birthday Ticket 사용 기간이 지났어요" : "생일 당월에 열려요") + "."
    };
  }

  function setText(el, text) {
    if (el) el.textContent = text;
  }

  function setHtml(el, html) {
    if (el) el.innerHTML = html;
  }

  function isBirthdayTicketVisible(state) {
    return state && (state.state === "available" || state.state === "used");
  }

  function updateBirthdayTicketVisibility(state) {
    const visible = isBirthdayTicketVisible(state);
    document.querySelectorAll("[data-birthday-ticket-card]").forEach((el) => {
      el.hidden = !visible;
    });
  }

  function updatePcBirthday(state) {
    const section = document.querySelector(".ticket-pc-birthday-section");
    if (!section) return;
    const sectionTitle = section.querySelector("h3");
    setText(sectionTitle, state.titleText || "Birthday Ticket");
    setText(section.querySelector(".ticket-pc-label"), state.labelText || "HAPPY BIRTHDAY · SPECIAL TICKET");
    setHtml(section.querySelector(".ticket-pc-date"), (state.periodLabel || "사용 기간") + "<br>" + state.period);
    setText(section.querySelector(".ticket-pc-title-en"), state.titleText || "Birthday Ticket");
    setText(section.querySelector(".ticket-pc-place"), state.subText);
    setText(section.querySelector(".ticket-pc-entry small"), state.entryLabel || "BIRTHDAY MONTH");
    setText(section.querySelector(".ticket-pc-entry strong"), state.period);
    const statusCell = Array.from(section.querySelectorAll(".ticket-pc-meta div")).find((cell) => /STATUS/.test(cell.textContent || ""));
    if (statusCell) setHtml(statusCell.querySelector("b"), state.statusShort.replace(" / ", "<br>"));
  }

  function updateMobileBirthday(state) {
    document.querySelectorAll(".birthday-pass, .ticket-card.birthday").forEach((card) => {
      setText(card.querySelector(".birthday-pass-label"), state.labelText || "HAPPY BIRTHDAY · SPECIAL TICKET");
      setText(card.querySelector(".birthday-pass-period small"), state.periodLabel || "사용 기간");
      setText(card.querySelector(".birthday-pass-period b"), state.period);
      setText(card.querySelector(".ticket-title"), state.titleText || "Birthday Ticket");
      setText(card.querySelector(".ticket-number small"), state.entryLabel || "BIRTHDAY MONTH");
      setText(card.querySelector(".ticket-number strong"), state.period);
      setText(card.querySelector(".ticket-sub"), state.subText);
      const statusCell = Array.from(card.querySelectorAll(".ticket-cell")).find((cell) => /STATUS/.test(cell.textContent || ""));
      if (statusCell) setHtml(statusCell.querySelector("b"), state.statusShort.replace(" / ", "<br>"));
    });
  }

  function updateWalletBirthday(state) {
    document.querySelectorAll(".ticket-pc-wallet-card").forEach((card) => {
      const title = card.querySelector("b");
      if (!title || title.textContent.trim() !== "Birthday Ticket") return;
      setText(card.querySelector("small"), state.state === "available" ? "사용 가능" : state.state === "used" ? "사용 완료" : state.state === "expired" ? "기간 종료" : "생일 등록 후 열림");
      setText(card.querySelector("span"), state.state === "unregistered" ? "생일을 등록하면 생일 시즌에 열려요." : "생일 기념 촬영 특전권 · " + state.period);
      const status = card.querySelector(".ticket-pc-card-actions span");
      setText(status, state.statusText);
      if (status) status.classList.toggle("active", state.isActive);
    });
  }

  function updateTicketModal(state) {
    const modal = document.getElementById("ticketDetailModal");
    if (!modal || modal.classList.contains("hidden")) return;
    const title = modal.querySelector("#ticketDetailTitle");
    if (!title || !/^Birthday Ticket/.test(title.textContent.trim())) return;
    setText(title, state.titleText || "Birthday Ticket");
    setText(modal.querySelector("#ticketDetailSub"), state.state === "unregistered" ? "생일을 등록하면 생일 시즌에 열려요." : "생일 기념 촬영 특전권");
    setText(modal.querySelector("#ticketDetailValid"), state.period);
    setText(modal.querySelector("#ticketDetailRule"), "본인 사용 · 양도 불가 · 사용 완료 후 재발급 불가");
    setText(modal.querySelector("#ticketDetailCopy"), state.detailCopy || ("Birthday Ticket은 생일 당월 1일부터 말일까지 사용할 수 있는 생일 기념 촬영 특전권이에요. 현재 상태: " + state.statusText + "."));
  }

  function applyBirthdayTicketState() {
    const state = getBirthdayTicketState();
    updateBirthdayTicketVisibility(state);
    updatePcBirthday(state);
    updateMobileBirthday(state);
    updateWalletBirthday(state);
    updateTicketModal(state);
  }

  document.addEventListener("click", (event) => {
    if (event.target.closest('[data-perk="birthday"]')) {
      setTimeout(applyBirthdayTicketState, 0);
      setTimeout(applyBirthdayTicketState, 80);
    }
    if (event.target.closest("#profileApply, #profileEditorSaveTop, #profileSimpleOk")) {
      setTimeout(applyBirthdayTicketState, 120);
    }
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", applyBirthdayTicketState);
  else applyBirthdayTicketState();
  [120, 500, 1200, 2400].forEach((delay) => setTimeout(applyBirthdayTicketState, delay));
})();
