
    (() => {
      "use strict";

      const APP_VERSION = "patch51_21_cloudflare_fetch_20260508";
      const LUMI_API_ENDPOINT = String(window.LUMI_API_ENDPOINT || "").trim();
      const LUMI_API_TIMEOUT_MS = 12000;
      let currentUser = null;
      let myReservations = [];
      let bootDebugText = "";

      function setBootDebug(text) {
        bootDebugText = String(text || "");
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
          "lumiphone.appVersion",
          "lumiphone.releaseReset.patch14.v1"
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
          '<div>API: ' + (LUMI_API_ENDPOINT ? '설정됨' : '미설정') + '</div>' +
          '<div id="lumiChromeDebugText">' + (bootDebugText || 'debug ready') + '</div>' +
          '<button type="button" id="lumiChromeForceReloadBtn" style="margin-top:8px;min-height:36px;border-radius:999px;border:1px solid #f0bfd4;background:#fff;color:#d77ca7;font-weight:900;padding:0 12px;cursor:pointer;">Chrome 일반모드 강제 새로고침</button>';
        parent.appendChild(box);
        const btn = document.getElementById("lumiChromeForceReloadBtn");
        if (btn) btn.addEventListener("click", forceChromeRecoveryReload);
      }

      clearLegacyStorageForChromePatch(false);
      unregisterServiceWorkersForChromePatch(false);
      if (!LUMI_API_ENDPOINT) setBootDebug("missing LUMI_API_ENDPOINT");
      else setBootDebug("API endpoint ready");
      const $ = (selector, root = document) => root.querySelector(selector);
      const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

      const loginView = $("#loginView");
      const appView = $("#appView");
      const loginForm = $("#loginForm");
      const loginId = $("#loginId");
      const loginPin = $("#loginPin");
      const loginMsg = $("#loginMsg");
      const sampleBtn = $("#sampleBtn");
      const newIdBtn = $("#newIdBtn");
      const forgotPinBtn = $("#forgotPinBtn");
      const loginLangButtons = $$('[data-lumi-lang]');
      const langStorageKey = "lumiLang";
      const loginStateStorageKey = "lumiphone.loginState.v1";
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
      const representativeAchievementKey = 'lumiphone.representativeAchievement.v1';

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
            type: "api",
            savedAt: Date.now()
          };
          localStorage.setItem(loginStateStorageKey, JSON.stringify(payload));
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
            type: state.type || "api"
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
      }


      function runReleaseDataResetPatch14() {
        const resetKey = "lumiphone.releaseReset.patch14.v1";
        try {
          if (localStorage.getItem(resetKey) === "done") return;
          [
            "lumiSavedMailIds",
            "lumiReadMailIds",
            "lumiSavedLogIds",
            "lumiReadLogIds",
            "lumi_v108_msg_read",
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
      runReleaseDataResetPatch14();

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

      async function openApp(options) {
        const settings = options || {};
        if (settings.user) currentUser = normalizeLumiUser(settings.user);
        if (settings.persist !== false && currentUser) saveLoginState(currentUser);
        clearMessage();
        loginView.classList.remove("active");
        appView.classList.add("active");
        go("home");
        updateClock();
        if (currentUser && getCurrentLumiId()) {
          await loadMyReservations(getCurrentLumiId());
        }
      }

      function closeApp() {
        clearLoginState();
        appView.classList.remove("active");
        loginView.classList.add("active");
        loginId.value = "";
        loginPin.value = "";
        clearMessage();
      }

      function go(page) {
        const targetName = page || "home";
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
          saved = window.localStorage && window.localStorage.getItem("lumiMessageSaved:" + target) === "1";
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
            saved = window.localStorage && window.localStorage.getItem("lumiMessageSaved:" + target) === "1";
            if (window.localStorage) window.localStorage.setItem("lumiMessageSaved:" + target, saved ? "0" : "1");
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

      const mailState = {
        inbox: { page: 0, filter: "all" },
        saved: { page: 0, filter: "all" },
        currentId: null
      };
      const MAIL_PAGE_SIZE = 3;
      const MAIL_SAVE_KEY = "lumiSavedMailIds";
      const MAIL_READ_KEY = "lumiReadMailIds";

      function readMailIds(key) {
        try {
          const parsed = JSON.parse(localStorage.getItem(key) || "[]");
          return Array.isArray(parsed) ? parsed.map(String) : [];
        } catch (error) {
          return [];
        }
      }

      function writeMailIds(key, ids) {
        try {
          localStorage.setItem(key, JSON.stringify(Array.from(new Set(ids.map(String)))));
        } catch (error) {}
      }

      function isMailRead(id) {
        const item = LUMI_MAIL_ITEMS.find((mail) => mail.id === String(id));
        return Boolean(item && item.status !== "NEW") || readMailIds(MAIL_READ_KEY).includes(String(id));
      }

      function setMailRead(id, read) {
        const ids = readMailIds(MAIL_READ_KEY).filter((item) => item !== String(id));
        if (read) ids.push(String(id));
        writeMailIds(MAIL_READ_KEY, ids);
      }

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
        const base = box === "saved" ? LUMI_MAIL_ITEMS.filter((item) => item.box !== "pending" && savedIds.includes(item.id)) : LUMI_MAIL_ITEMS.filter((item) => item.box === "inbox");
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
        const unread = LUMI_MAIL_ITEMS.filter((mail) => mail.box === "inbox" && !isMailRead(mail.id) && mail.status === "NEW").length;
        badge.textContent = unread || "";
        badge.style.display = unread ? "" : "none";
      }

      function renderMailAll() {
        renderMailBox("inbox");
        renderMailBox("saved");
        updateMailTabBadge();
      }

      function openMailModal(id) {
        const item = LUMI_MAIL_ITEMS.find((mail) => mail.id === id);
        const modal = document.getElementById("mailModal");
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
        if (!isMailRead(id)) {
          setMailRead(id, true);
          renderMailAll();
        }
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
      const LUMILOG_SAVE_KEY = "lumiSavedLogIds";
      const LUMILOG_READ_KEY = "lumiReadLogIds";

      function readLumiLogIds(key) {
        try {
          const parsed = JSON.parse(localStorage.getItem(key) || "[]");
          return Array.isArray(parsed) ? parsed.map(String) : [];
        } catch (error) {
          return [];
        }
      }

      function writeLumiLogIds(key, ids) {
        try {
          localStorage.setItem(key, JSON.stringify(Array.from(new Set(ids.map(String)))));
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

      const profileStorageKey = "lumiphone.profile.v1";
      const profileOshiChangedKey = "lumiphone.profile.oshiChangedAt.v1";
      const profileDefaultPart = () => ({ src: "", x: 50, y: 50, scale: 1 });
      const profileDefaultInfo = () => ({
        displayName: "루미나",
        oshi: "루루 🍼🐰",
        letterName: "루리",
        broadcastName: "리",
        title: "나만의 루미나",
        space: "루루의 방",
        birthdayMonth: "",
        birthdayDay: "",
        birthdayRegistered: false,
        joinedAt: "2026.05.06"
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
          letterName: clampText(next.letterName || "루리", 10),
          broadcastName: clampText(next.broadcastName || "리", 12),
          title: clampText(String(next.title || "나만의 루미나").replace(/^대표 칭호\s*·\s*/, "").replace("첫 번째 점을 따라온 루미나", "첫 번째 점"), 18),
          space: clampText(next.space || "루루의 방", 12),
          birthdayMonth,
          birthdayDay,
          birthdayRegistered,
          joinedAt: next.joinedAt || "2026.05.06"
        };
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

      function loadProfileState() {
        try {
          const raw = localStorage.getItem(profileStorageKey);
          profileState = normalizeProfileState(raw ? JSON.parse(raw) : profileDefaultState());
        } catch (error) {
          profileState = profileDefaultState();
        }
        profileDraft = cloneProfileState(profileState);
      }


      function getLastOshiChangedAt() {
        const raw = localStorage.getItem(profileOshiChangedKey);
        const time = raw ? Number(raw) : 0;
        return Number.isFinite(time) ? time : 0;
      }

      function setLastOshiChangedAt(time) {
        localStorage.setItem(profileOshiChangedKey, String(time || Date.now()));
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
          localStorage.setItem(profileStorageKey, JSON.stringify(profileState));
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
        const representativeTitle = localStorage.getItem(representativeAchievementKey) || (ownedCards[0] && ownedCards[0].dataset.achievementTitle) || "-";
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
        const representativeTitle = localStorage.getItem(representativeAchievementKey) || (ownedCards[0] && ownedCards[0].dataset.achievementTitle) || "-";
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
        const footerJoinDate = profileInfoForFooter.joinedAt || "2026.05.06";
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
        const joinedAt = info.joinedAt || "2026.05.06";
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
          space: info.space || "루루의 방",
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
        localStorage.setItem(representativeAchievementKey, card.dataset.achievementTitle || "");
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

        let representativeTitle = localStorage.getItem(representativeAchievementKey) || (ownedCards[0] && ownedCards[0].dataset.achievementTitle) || "";
        let representativeCard = findAchievementCardByTitle(representativeTitle) || ownedCards[0] || cards[0];
        if (representativeCard && !achievementIsOwned(representativeCard)) representativeCard = ownedCards[0] || cards[0];
        if (representativeCard) {
          localStorage.setItem(representativeAchievementKey, representativeCard.dataset.achievementTitle || "");
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

      function renderProfileView() {
        applyImagePart(profileCoverImg, profileState.cover);
        applyImagePart(profileAvatarImg, profileState.avatar);
        if (profileCover) profileCover.classList.toggle("has-image", Boolean(profileState.cover.src));
        if (profileAvatar) profileAvatar.classList.toggle("has-image", Boolean(profileState.avatar.src));
        const info = normalizeProfileInfo(profileState.info);
        if (profileDisplayName) profileDisplayName.textContent = info.displayName;
        if (profileMeta) profileMeta.textContent = "오시: " + info.oshi;
        if (profileTitlePill) profileTitlePill.textContent = info.title;
        if (profileSpaceTag) profileSpaceTag.textContent = "📍 " + info.space;
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
          level: source.level || ""
        };
      }

      async function fetchLumiApi(params) {
        const payload = Object.assign({}, params || {});
        appendBootDebug("ENTER fetchLumiApi: " + String(payload.action || "unknown"));
        if (!LUMI_API_ENDPOINT) {
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

        const url = LUMI_API_ENDPOINT + (LUMI_API_ENDPOINT.indexOf("?") === -1 ? "?" : "&") + query.toString();
        appendBootDebug("fetch: " + url.slice(0, 80));

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
          return data;
        } catch (err) {
          window.clearTimeout(timer);
          const msg = err && err.name === "AbortError" ? "apiTimeout" : "apiNetworkError";
          appendBootDebug("fetch error: " + msg + " / " + String(err && err.message || ""));
          throw new Error(msg);
        }
      }

      async function loginLumiPhone(lumiId, pin) {
        const response = await fetchLumiApi({ action: "lumiLogin", lumiId: lumiId, pin: pin });
        if (!response || response.ok !== true) {
          setBootDebug("login failed: " + String((response && (response.message || response.error)) || "loginFailed"));
          throw new Error((response && (response.message || response.error)) || "loginFailed");
        }
        const user = normalizeLumiUser(response.user || response.data || {});
        appendBootDebug("login success: " + (user.lumiId || user.id || lumiId));
        return user;
      }

      async function getMyReservations(lumiId) {
        const response = await fetchLumiApi({ action: "lumiGetMyReservations", lumiId: lumiId });
        if (!response || response.ok !== true) {
          setBootDebug("reservation load failed: " + String((response && (response.message || response.error)) || "reservationLoadFailed"));
          throw new Error((response && (response.message || response.error)) || "reservationLoadFailed");
        }
        return Array.isArray(response.reservations) ? response.reservations : (response.data && Array.isArray(response.data.reservations) ? response.data.reservations : []);
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
          venueName: source.venueName || source.location || source.venue || "공연장 확인 중",
          reservationNumber: source.reservationNumber || source.reserveNo || source.number || "-",
          paymentStatus: source.paymentStatus || "pending",
          reservationStatus: source.reservationStatus || "reserved",
          meate: source.meate || source.oshimember || source.oshi || "-",
          eventStatus: source.eventStatus || "",
          startTime: source.startTime || ""
        };
      }

      function isPastReservation(item) {
        const status = String(item.eventStatus || "").toLowerCase();
        if (["ended", "closed", "finished", "past"].includes(status)) return true;
        if (!item.eventDate) return false;
        const today = new Date();
        const todayKey = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
        return String(item.eventDate) < todayKey;
      }

      function paymentLabel(status) {
        const key = String(status || "").toLowerCase();
        if (key === "confirmed") return "입금 확인 완료";
        if (key === "cancelled" || key === "canceled") return "예약 취소";
        return "입금 확인 대기";
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
        return '<article class="ticket-card lumi-pass">' +
          '<div class="ticket-inner">' +
          '<div class="ticket-kicker">CURRENT RESERVATION</div>' +
          '<div class="ticket-title">' + escapeHtml(item.eventTitle) + '</div>' +
          '<div class="ticket-sub">' + escapeHtml(item.eventDate || "날짜 확인 중") + ' · ' + escapeHtml(item.venueName) + '</div>' +
          '<div class="ticket-number"><small>RESERVATION NO.</small><strong>' + escapeHtml(item.reservationNumber) + '</strong></div>' +
          '<div class="ticket-meta">' +
          '<div class="ticket-cell"><small>PAYMENT</small><b>' + escapeHtml(paymentLabel(item.paymentStatus)) + '</b></div>' +
          '<div class="ticket-cell"><small>STATUS</small><b>' + escapeHtml(reservationStatusLabel(item.reservationStatus)) + '</b></div>' +
          '<div class="ticket-cell"><small>MEATE</small><b>' + escapeHtml(item.meate || "-") + '</b></div>' +
          '<div class="ticket-cell"><small>LUMI ID</small><b>' + escapeHtml(getCurrentLumiId() || "-") + '</b></div>' +
          '</div>' +
          '<a class="btn sub ticket-api-link" href="' + escapeHtml(href) + '">티켓 페이지 보기</a>' +
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
        return '<h3>현재 예약 티켓</h3>' +
          '<article class="ticket-pc-pass">' +
          '<div class="ticket-pc-pass-inner">' +
          '<div class="ticket-pc-top"><span class="ticket-pc-label">LUMIBELLE RESERVATION</span><span class="ticket-pc-date">' + escapeHtml(item.eventDate || "날짜 확인 중") + '<br>' + escapeHtml(item.startTime || "") + '</span></div>' +
          '<div class="ticket-pc-title-en">' + escapeHtml(item.eventTitle) + '</div>' +
          '<div class="ticket-pc-place">' + escapeHtml(item.venueName) + '</div>' +
          '<div class="ticket-pc-entry"><small>RESERVATION NO.</small><strong>' + escapeHtml(item.reservationNumber) + '</strong></div>' +
          '<div class="ticket-pc-meta">' +
          '<div><small>PAYMENT</small><b>' + escapeHtml(paymentLabel(item.paymentStatus)) + '</b></div>' +
          '<div><small>STATUS</small><b>' + escapeHtml(reservationStatusLabel(item.reservationStatus)) + '</b></div>' +
          '<div><small>MEATE</small><b>' + escapeHtml(item.meate || "-") + '</b></div>' +
          '<div><small>LUMI ID</small><b>' + escapeHtml(getCurrentLumiId() || "-") + '</b></div>' +
          '</div>' +
          '<p class="ticket-pc-help"><a class="btn sub ticket-api-link" href="' + escapeHtml(href) + '">티켓 페이지 보기</a></p>' +
          '</div>' +
          '</article>';
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
            if (small) small.textContent = paymentLabel(item.paymentStatus);
            if (title) title.textContent = item.reservationNumber || "예약번호 확인 중";
            if (desc) desc.textContent = (item.eventTitle || "공연명 확인 중") + " · " + (item.eventDate || "날짜 확인 중");
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
          } else {
            if (small) small.textContent = "현재 예약";
            if (title) title.textContent = "예약된 공연이 없어요.";
            if (desc) desc.textContent = "예매가 확인되면 티켓함에 표시돼요.";
          }
        }
      }

      function renderMyReservations(reservations) {
        const normalized = (reservations || []).map(normalizeReservationItem);
        const current = normalized.filter((item) => !isPastReservation(item));
        const past = normalized.filter(isPastReservation).sort((a, b) => String(b.eventDate || "").localeCompare(String(a.eventDate || "")));

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
        initTicketPagers();
      }

      async function loadMyReservations(lumiId) {
        try {
          renderMyReservations([]);
          const reservations = await getMyReservations(lumiId);
          myReservations = reservations;
          renderMyReservations(myReservations);
        } catch (error) {
          myReservations = [];
          renderMyReservations([]);
          setBootDebug("reservation UI error: " + String(error && error.message ? error.message : error));
          if (String(error && error.message) === "missingApiEndpoint") {
            showMessage("루미폰 API 주소가 아직 설정되지 않았어요. LUMI_API_ENDPOINT를 Apps Script 웹앱 URL로 설정해 주세요.");
          }
        }
      }

      loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        clearMessage();
        appendBootDebug("LOGIN submit start");
        loginId.value = normalizeLoginIdInput(loginId.value);
        const lumiId = normId(loginId.value);
        const pin = loginPin.value.trim();
        if (!lumiId || !pin) {
          showMessage("루미 ID와 PIN을 입력해 주세요.");
          return;
        }
        try {
          const user = await loginLumiPhone(lumiId, pin);
          saveLoginState(user);
          await openApp({ user: user });
        } catch (error) {
          const msg = String(error && error.message || "");
          appendBootDebug("LOGIN catch: " + msg);
          appendBootDebug("login UI error: " + msg);
          if (msg === "missingApiEndpoint") showMessage("루미폰 API 주소가 아직 설정되지 않았어요. LUMI_API_ENDPOINT를 Apps Script 웹앱 URL로 설정해 주세요.");
          else if (msg === "apiTimeout" || msg === "apiNetworkError") showMessage("루미폰 서버 연결을 확인해 주세요. debug: " + msg);
          else showMessage("루미 ID 또는 PIN을 확인해 주세요.");
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

      installChromeRecoveryPanel();
      setLumiLang(readLumiLang(), false);
      loginLangButtons.forEach((button) => {
        button.addEventListener("click", () => setLumiLang(button.dataset.lumiLang, true));
      });

      if (sampleBtn) {
        sampleBtn.hidden = true;
        sampleBtn.setAttribute("aria-hidden", "true");
      }
      newIdBtn.addEventListener("click", () => showMessage("온라인 팬도 루미 ID를 만들 수 있어요. 실제 발급 페이지에서는 닉네임, 이메일, 오시, 생일, PIN을 입력하게 됩니다."));
      forgotPinBtn.addEventListener("click", () => showMessage("PIN 분실 시 루미 ID, 닉네임, 이메일 등으로 문의 후 임시 PIN을 재설정하는 구조로 운영합니다."));
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
        if (!profileDraft.info.space) {
          showProfileError("나의 공간을 입력해 주세요.");
          return;
        }

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

      const savedLoginState = readLoginState();
      if (savedLoginState) {
        appendBootDebug("saved login found: " + (savedLoginState.lumiId || savedLoginState.id));
        currentUser = normalizeLumiUser(savedLoginState);
        loginId.value = normalizeLoginIdInput(savedLoginState.id);
        openApp({ persist: true, user: currentUser });
      } else {
        appendBootDebug("saved login none");
      }

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
(() => {
      "use strict";
      const recordCards = Array.from(document.querySelectorAll("#recordCardList .record-memory-card"));
      const recordFilterButtons = Array.from(document.querySelectorAll(".record-filter-pill"));
      const recordPagePrev = document.querySelector("#recordPagePrev");
      const recordPageNext = document.querySelector("#recordPageNext");
      const recordPageText = document.querySelector("#recordPageText");
      const recordMsg = document.querySelector("#recordMsg");
      const recordMonthPrev = document.querySelector("#recordMonthPrev");
      const recordMonthNext = document.querySelector("#recordMonthNext");
      const recordMonthLabel = document.querySelector("#recordMonthLabel");
      const pageSize = 4;
      const minYear = 2026;
      let currentFilter = "전체";
      let currentPage = 1;
      let currentYear = 2026;
      let currentMonth = 5;

      function pad2(value) {
        return String(value).padStart(2, "0");
      }

      function currentMonthKey() {
        return currentYear + "." + pad2(currentMonth);
      }

      function updateMonthLabel() {
        if (recordMonthLabel) recordMonthLabel.textContent = currentYear + "년 " + pad2(currentMonth) + "월";
        if (recordMonthPrev) recordMonthPrev.disabled = currentYear <= minYear && currentMonth <= 1;
      }

      function cardMatchesMonth(card) {
        const date = card.dataset.recordDate || "";
        if (!date || date === "준비중") return currentYear === 2026 && currentMonth === 5;
        return date.indexOf(currentMonthKey()) === 0;
      }

      function filteredRecords() {
        return recordCards.filter((card) => {
          const matchesFilter = currentFilter === "전체" || card.dataset.recordCategory === currentFilter;
          return matchesFilter && cardMatchesMonth(card);
        });
      }

      function renderRecordPage() {
        if (!recordCards.length) return;
        updateMonthLabel();
        const list = filteredRecords();
        const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
        if (currentPage > totalPages) currentPage = totalPages;
        if (currentPage < 1) currentPage = 1;
        const start = (currentPage - 1) * pageSize;
        const visibleSet = new Set(list.slice(start, start + pageSize));
        recordCards.forEach((card) => { card.hidden = !visibleSet.has(card); });
        if (recordPageText) recordPageText.textContent = currentPage + " / " + totalPages;
        if (recordPagePrev) recordPagePrev.disabled = currentPage <= 1;
        if (recordPageNext) recordPageNext.disabled = currentPage >= totalPages;
        if (recordMsg) {
          if (!list.length) {
            recordMsg.textContent = currentMonthKey() + " 기록은 아직 없어요. 활동 기록이 연결되면 이곳에 표시돼요.";
          } else {
            recordMsg.textContent = currentFilter === "전체"
              ? "아직 기록이 없어요. 루미벨과 함께한 순간이 생기면 이곳에 차곡차곡 남아요."
              : currentFilter + " 기록은 아직 없어요. 활동 기록이 연결되면 이곳에 표시돼요.";
          }
        }
      }

      function setRecordFilter(filter) {
        currentFilter = filter || "전체";
        currentPage = 1;
        recordFilterButtons.forEach((button) => {
          button.classList.toggle("active", button.dataset.recordFilter === currentFilter);
        });
        renderRecordPage();
      }

      function moveMonth(delta) {
        let nextMonth = currentMonth + delta;
        let nextYear = currentYear;
        while (nextMonth < 1) { nextMonth += 12; nextYear -= 1; }
        while (nextMonth > 12) { nextMonth -= 12; nextYear += 1; }
        if (nextYear < minYear) return;
        currentYear = nextYear;
        currentMonth = nextMonth;
        currentPage = 1;
        renderRecordPage();
      }

      recordFilterButtons.forEach((button) => {
        button.addEventListener("click", () => setRecordFilter(button.dataset.recordFilter || "전체"));
      });
      if (recordMonthPrev) recordMonthPrev.addEventListener("click", () => moveMonth(-1));
      if (recordMonthNext) recordMonthNext.addEventListener("click", () => moveMonth(1));
      if (recordPagePrev) {
        recordPagePrev.addEventListener("click", () => {
          currentPage -= 1;
          renderRecordPage();
        });
      }
      if (recordPageNext) {
        recordPageNext.addEventListener("click", () => {
          currentPage += 1;
          renderRecordPage();
        });
      }
      recordCards.forEach((card) => {
        card.addEventListener("click", () => {
          const title = card.dataset.recordTitle || "기록";
          const date = card.dataset.recordDate || "";
          const desc = card.dataset.recordDesc || "루미벨과 이어진 기록이에요.";
          if (typeof window.openProfileSimpleModal === "function") {
            window.openProfileSimpleModal("추억의 시간", [title, date, desc]);
            return;
          }
          alert(title + "\n" + date + "\n" + desc);
        });
      });
      renderRecordPage();
    })();



/* ===== merged from point-ledger-filter-pagination-js ===== */
(() => {
      "use strict";
      const pointRoot = document.getElementById("page-point");
      if (!pointRoot) return;
      const pointItems = Array.from(pointRoot.querySelectorAll(".point-ledger-item"));
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

      function renderPointLedger() {
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
      icon:"📎",
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
  function $(s,r){ return (r||document).querySelector(s); }
  function $$(s,r){ return Array.from((r||document).querySelectorAll(s)); }
  function getArr(k){ try { return JSON.parse(localStorage.getItem(k)||"[]"); } catch(e) { return []; } }
  function setArr(k,v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e) {} }
  function getObj(k){ try { return JSON.parse(localStorage.getItem(k)||"{}"); } catch(e) { return {}; } }
  function setObj(k,v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e) {} }
  function fanText(value){ return String(value == null ? "" : value); }
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
    return MESSAGES.filter(m => {
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
  }
  function updateBadges(){
    const unreadItems = MESSAGES.filter(m => isVisibleInboxMessage(m) && !isRead(m.id));
    const unread = unreadItems.length;
    const messageMini = document.querySelector('.app-icon[data-go="message"] .mini, .kawaii-app-icon[data-go="message"] .mini');
    if (messageMini) { messageMini.textContent = unread > 0 ? String(Math.min(unread,9)) : ""; messageMini.style.display = unread > 0 ? "inline-flex" : "none"; }
    const homeCard = document.getElementById("homeMessageCard");
    const homeTitle = document.getElementById("homeMessageTitle");
    const homePreview = document.getElementById("homeMessagePreview");
    const homeKicker = document.getElementById("homeMessageKicker");
    if (homeCard) {
      homeCard.classList.remove("hidden");
      const publicUnreadItems = unreadItems.filter(m => isVisibleInboxMessage(m));
      if (publicUnreadItems.length > 0) {
        if (homeKicker) homeKicker.textContent = publicUnreadItems.length > 1 ? "NEW MESSAGES" : "NEW MESSAGE";
        if (homeTitle) homeTitle.textContent = "새 문자 확인";
        if (homePreview) homePreview.textContent = "도착한 문자를 확인해 주세요.";
      } else {
        if (homeKicker) homeKicker.textContent = "NEW MESSAGE";
        if (homeTitle) homeTitle.textContent = "새 문자 확인";
        if (homePreview) homePreview.textContent = "도착한 문자를 확인해 주세요.";
      }
    }
  }
  function renderList(){
    const root = pageEl(); if (!root) return;
    clearTimers();
    const list = $("#lumiMsgList", root), empty = $("#lumiMsgEmpty", root), pager = $("#lumiMsgPager", root);
    if (!list) return;
    const items = filtered();
    const pp = perPage();
    const total = Math.max(1, Math.ceil(items.length / pp));
    page = Math.min(Math.max(1, page), total);
    list.innerHTML = "";
    items.slice((page-1)*pp, page*pp).forEach(m => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "lumiMsg-item";
      btn.dataset.lumimsgId = m.id;
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
    const m = MESSAGES.find(x => x.id === id) || MESSAGES[0];
    currentId = m.id;
    markRead(m.id);
    renderList();
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
            try { localStorage.setItem('lumi_v9_title', a.title); } catch(e) {}
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
    }
  });
})();


/* ===== PC stamp restore renderer: desktop-only, mobile untouched ===== */
(function(){
  'use strict';

  var STAMP_COUNT = 0;
  var STAMP_REWARD_KEY = 'lumi_v256_stamp_title_rewards';
  var rewards = [
    {key:'stamp5', need:5, label:'5개', title:'특별 우편 도착', desc:'다음 보상까지 5개 남았어요.'},
    {key:'stamp10', need:10, label:'10개', title:'디지털 메시지 / 칭호 후보', desc:'다음 보상까지 10개 남았어요.'},
    {key:'stamp15', need:15, label:'15개', title:'특별 편지 / 장식 후보', desc:'다음 보상까지 15개 남았어요.'},
    {key:'stamp20', need:20, label:'20개', title:'1회차 완주 · 소장 우편 · 업적 해금', desc:'다음 보상까지 20개 남았어요.'}
  ];

  function $(id){ return document.getElementById(id); }
  function readRewards(){
    try{
      var arr = JSON.parse(localStorage.getItem(STAMP_REWARD_KEY) || '[]');
      return Array.isArray(arr) ? arr.filter(Boolean) : [];
    }catch(e){ return []; }
  }
  function writeRewards(arr){
    try{ localStorage.setItem(STAMP_REWARD_KEY, JSON.stringify(Array.from(new Set((arr || []).filter(Boolean))))); }catch(e){}
  }
  function isPc(){ return window.innerWidth >= 760; }

  function renderStampGrid(){
    var grid = $('stampGridPc');
    if(!grid) return;
    var html = '';
    for(var i=1;i<=20;i++){
      html += '<div class="stamp ' + (i > STAMP_COUNT ? 'empty' : '') + '">' + (i <= STAMP_COUNT ? '🌸' : '✧') + '</div>';
    }
    grid.innerHTML = html;
  }

  function rewardState(r, claimed){
    if(claimed.indexOf(r.key) !== -1) return 'done';
    if(STAMP_COUNT >= r.need) return 'ready';
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
      var pct = Math.max(0, Math.min(100, Math.round((STAMP_COUNT / r.need) * 100)));
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
  function cardHtml(item){
    return '<div class="exchange-reward-card-v2828" data-lumi-exchange-cat="'+item.cat+'"><em>'+item.point+'</em><i>'+item.icon+'</i><b>'+item.title+'</b><span>'+item.desc+'</span><button type="button" disabled>준비중</button></div>';
  }
  function renderExchange(cat){
    var shell=ensureExchangeShell(); if(!shell) return;
    cat=labels[cat]?cat:'all'; window.__lumiExchangeSelectedCatV2828=cat;
    qsa('[data-lumi-exchange-filter]',shell.tabs).forEach(function(btn){btn.classList.toggle('active',btn.getAttribute('data-lumi-exchange-filter')===cat);});
    var data=rewards.filter(function(item){return cat==='all'||item.cat===cat});
    shell.grid.innerHTML=data.map(cardHtml).join('');
    var msg=qs('#exchangeMsgV2827',shell.page) || qs('#exchangeMsg',shell.page);
    if(msg){
      msg.innerHTML=cat==='all'
        ? '지금은 보상 후보와 포인트 기준을 먼저 잡아둔 상태예요. 실제 신청, 차감, 멤버별 가능 범위는 추후 공개됩니다.'
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
  const SAMPLE_ID = "LB-0001";

  function normId(value) {
    const digits = String(value || "").replace(/\D/g, "").slice(-4);
    return digits ? "LB-" + digits.padStart(4, "0") : SAMPLE_ID;
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
      const raw = localStorage.getItem(PROFILE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      info = parsed && parsed.info ? parsed.info : null;
    } catch (error) {
      info = null;
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
