const STORAGE_KEY = "socialRoomV01";

const categoryNames = {
  all: "전체",
  bias: "덕질 계정",
  idol: "아이돌 공식",
  jpop: "J-pop",
  chika: "지하돌",
  shopping: "쇼핑",
  lumibelle: "루미벨 운영"
};

const defaultAccounts = [
  {
    id: "sample-love",
    name: "=LOVE 공식",
    handle: "Equal_LOVE_12",
    url: "https://x.com/Equal_LOVE_12",
    category: "jpop"
  },
  {
    id: "sample-notequal",
    name: "≠ME 공식",
    handle: "Notequal_ME",
    url: "https://x.com/Notequal_ME",
    category: "jpop"
  },
  {
    id: "sample-lizlisa",
    name: "LIZ LISA",
    handle: "lizlisaofficial",
    url: "https://x.com/lizlisaofficial",
    category: "shopping"
  },
  {
    id: "sample-lumibelle",
    name: "루미벨 운영 자리",
    handle: "lumibelle",
    url: "https://x.com/",
    category: "lumibelle"
  }
];

const defaultSearches = [
  {
    id: "search-ilove",
    name: "이코러브 검색",
    query: "=LOVE OR イコラブ",
    category: "jpop"
  },
  {
    id: "search-chika",
    name: "지하돌 검색",
    query: "地下アイドル OR 対バン",
    category: "chika"
  },
  {
    id: "search-lizlisa",
    name: "리즈리사 신상",
    query: "LIZ LISA 新作",
    category: "shopping"
  },
  {
    id: "search-lumibelle",
    name: "루미벨 해시태그",
    query: "#LUMIBELLE_LIVE OR 루미벨",
    category: "lumibelle"
  }
];

let state = {
  accounts: [],
  searches: [],
  category: "all",
  currentAccountId: null,
  timerEndAt: null
};

let timerInterval = null;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      state = { ...state, ...JSON.parse(raw) };
    } else {
      state.accounts = defaultAccounts;
      state.searches = defaultSearches;
      state.currentAccountId = defaultAccounts[0].id;
      saveState();
    }
  } catch (error) {
    console.warn("사교장 저장소를 불러오지 못했습니다.", error);
    state.accounts = defaultAccounts;
    state.searches = defaultSearches;
    state.currentAccountId = defaultAccounts[0].id;
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function toast(message) {
  const stack = $("#toastStack");
  const item = document.createElement("div");
  item.className = "toast";
  item.textContent = message;
  stack.prepend(item);
  setTimeout(() => {
    item.style.opacity = "0";
    item.style.transform = "translateY(8px)";
    item.style.transition = "0.2s ease";
    setTimeout(() => item.remove(), 220);
  }, 3600);
}

function normalizeXUrl(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (text.startsWith("@")) return `https://x.com/${text.slice(1)}`;
  if (/^https?:\/\//i.test(text)) return text.replace("twitter.com", "x.com");
  return `https://x.com/${text.replace(/^@/, "")}`;
}

function normalizeTwitterEmbedUrl(value) {
  const xUrl = normalizeXUrl(value);
  try {
    const parsed = new URL(xUrl);
    const parts = parsed.pathname.split("/").filter(Boolean);
    const handle = parts[0] || "";
    if (!handle) return xUrl.replace("x.com", "twitter.com");
    return `https://twitter.com/${handle}?ref_src=twsrc%5Etfw`;
  } catch {
    const handle = String(value || "").replace(/^@/, "").trim();
    return handle ? `https://twitter.com/${handle}?ref_src=twsrc%5Etfw` : "";
  }
}

function extractHandle(url) {
  const normalized = normalizeXUrl(url);
  try {
    const parsed = new URL(normalized);
    const parts = parsed.pathname.split("/").filter(Boolean);
    return parts[0] || "";
  } catch {
    return String(url || "").replace(/^@/, "");
  }
}

function getCurrentAccount() {
  return state.accounts.find((account) => account.id === state.currentAccountId) || null;
}

function getFilteredAccounts() {
  if (state.category === "all") return state.accounts;
  return state.accounts.filter((account) => account.category === state.category);
}

function getFilteredSearches() {
  if (state.category === "all") return state.searches;
  return state.searches.filter((item) => item.category === state.category);
}

function renderCategories() {
  $$("#categoryList button").forEach((button) => {
    button.classList.toggle("active", button.dataset.category === state.category);
  });
}

function renderAccounts() {
  const accounts = getFilteredAccounts();
  $("#accountCount").textContent = String(accounts.length);

  const list = $("#accountList");
  if (!accounts.length) {
    list.innerHTML = `<button class="account-button" type="button">아직 계정이 없습니다<small>계정을 추가해주세요</small></button>`;
    return;
  }

  list.innerHTML = accounts.map((account) => `
    <button class="account-button ${account.id === state.currentAccountId ? "active" : ""}" type="button" data-account="${account.id}">
      ${escapeHtml(account.name)}
      <small>@${escapeHtml(account.handle || extractHandle(account.url))} · ${escapeHtml(categoryNames[account.category] || account.category)}</small>
    </button>
  `).join("");

  list.querySelectorAll("[data-account]").forEach((button) => {
    button.addEventListener("click", () => selectAccount(button.dataset.account));
  });
}

function renderSearches() {
  const searches = getFilteredSearches();
  const list = $("#searchList");

  if (!searches.length) {
    list.innerHTML = `<button class="search-button" type="button">검색 초대장이 없습니다<small>검색어를 추가해주세요</small></button>`;
    return;
  }

  list.innerHTML = searches.map((item) => `
    <button class="search-button" type="button" data-search="${item.id}">
      ${escapeHtml(item.name)}
      <small>${escapeHtml(item.query)} · ${escapeHtml(categoryNames[item.category] || item.category)}</small>
    </button>
  `).join("");

  list.querySelectorAll("[data-search]").forEach((button) => {
    button.addEventListener("click", () => openSearch(button.dataset.search));
  });
}

function renderHeader() {
  const account = getCurrentAccount();
  if (!account) {
    $("#currentTitle").textContent = "계정을 선택해주세요";
    $("#currentMeta").textContent = "공개 계정 타임라인은 로그인된 브라우저에서 표시됩니다.";
    return;
  }

  $("#currentTitle").textContent = account.name;
  $("#currentMeta").textContent = `@${account.handle || extractHandle(account.url)} · ${categoryNames[account.category] || account.category}`;
}

// ─── renderTimeline v0.1.2 ───────────────────────────────────────────────────
// 변경 내용:
//   1. load() 대신 createTimeline()으로 교체 → DOM에 <a> 불필요, 타이밍 안정
//   2. twttr.ready() 패턴 사용 → widgets.js 로드 전/후 모두 안전
//   3. createTimeline Promise<Element> 반환값으로 성공/실패 명확히 판별
//   4. 임베드 성공 시 fallback div 숨김, 실패 시 fallback만 표시
//   5. 타임아웃 4200ms → 8000ms (네트워크 지연 고려)
//   6. file:// 환경 감지 → 안내 메시지 표시
// ─────────────────────────────────────────────────────────────────────────────
function renderTimeline() {
  const account = getCurrentAccount();
  const frame = $("#timelineFrame");

  if (!account) {
    frame.innerHTML = `
      <div class="empty-timeline">
        <strong>초대장을 선택해주세요.</strong>
        <span>자주 보는 계정을 선택하면 이곳에 미니 타임라인이 표시됩니다.</span>
      </div>
    `;
    $("#embedStatus").textContent = "대기 중";
    return;
  }

  const openUrl = normalizeXUrl(account.url);
  const embedUrl = normalizeTwitterEmbedUrl(account.url);
  const handle = account.handle || extractHandle(openUrl);
  $("#embedStatus").textContent = location.protocol === "file:" ? "file:// 제한" : "불러오는 중";

  frame.innerHTML = `
    <div class="embed-loading" id="embedLoading">
      <strong>${escapeHtml(account.name)}</strong>
      <span>초대장을 불러오는 중입니다. X 공식 임베드는 브라우저 로그인/쿠키 설정에 따라 늦게 뜰 수 있습니다.</span>
      ${location.protocol === "file:" ? `<small class="file-protocol-notice">file:// 환경에서는 X 쿠키 인증이 차단될 수 있습니다. localhost 또는 실제 도메인에서 테스트해주세요.</small>` : ""}
      <button type="button" class="js-open-current-x inline-x-open">X에서 최신 보기</button>
    </div>
    <div class="twitter-embed-target" id="twitterEmbedTarget"></div>
  `;

  const openButton = frame.querySelector(".js-open-current-x");
  if (openButton) openButton.addEventListener("click", openCurrentX);

  const target = frame.querySelector("#twitterEmbedTarget");
  const loading = frame.querySelector("#embedLoading");
  let settled = false;

  function showFallback(message = "8초 안에 응답이 없어 표시를 중단했습니다.") {
    if (settled) return;
    settled = true;
    $("#embedStatus").textContent = "임베드 실패";
    target.innerHTML = "";
    loading.innerHTML = `
      <strong>${escapeHtml(account.name)}</strong>
      <span>${escapeHtml(message)}</span>
      <span>X 공식 임베드는 로그인 상태, 쿠키 설정, 확장 프로그램, X 정책에 따라 이곳에서 바로 열리지 않을 수 있습니다.</span>
      <button type="button" class="js-open-current-x inline-x-open">X에서 최신 보기</button>
    `;
    const fallbackButton = loading.querySelector(".js-open-current-x");
    if (fallbackButton) fallbackButton.addEventListener("click", openCurrentX);
  }

  function markSuccess() {
    if (settled) return;
    settled = true;
    $("#embedStatus").textContent = "표시 중";
    if (loading) loading.style.display = "none";
  }

  const timeout = setTimeout(() => {
    showFallback("8초 안에 응답이 없어 표시를 중단했습니다.");
  }, 8000);

  function tryOfficialAnchorLoad() {
    target.innerHTML = `
      <a class="twitter-timeline"
         data-height="560"
         data-chrome="noheader nofooter transparent"
         href="${escapeHtml(embedUrl)}">
        Tweets by ${escapeHtml(handle)}
      </a>
    `;

    if (!window.twttr || !window.twttr.widgets) {
      return Promise.resolve(false);
    }

    return window.twttr.widgets.load(target).then((widgets) => {
      if (Array.isArray(widgets) && widgets.length > 0) {
        clearTimeout(timeout);
        markSuccess();
        return true;
      }
      return false;
    });
  }

  function tryCreateTimeline() {
    if (!window.twttr || !window.twttr.widgets || !window.twttr.widgets.createTimeline) {
      return Promise.resolve(false);
    }

    target.innerHTML = "";

    return window.twttr.widgets.createTimeline(
      { sourceType: "profile", screenName: handle },
      target,
      { height: 560, chrome: "noheader nofooter transparent" }
    ).then((widget) => {
      if (widget) {
        clearTimeout(timeout);
        markSuccess();
        return true;
      }
      return false;
    });
  }

  function runEmbed() {
    if (!window.twttr || !window.twttr.ready) {
      return showFallback("X 위젯 스크립트를 확인하지 못했습니다.");
    }

    window.twttr.ready(() => {
      tryOfficialAnchorLoad()
        .then((loaded) => loaded || tryCreateTimeline())
        .then((loaded) => {
          if (!loaded) showFallback("X 위젯이 타임라인을 만들지 못했습니다.");
        })
        .catch(() => {
          showFallback("X 위젯을 불러오는 중 오류가 발생했습니다.");
        });
    });
  }

  runEmbed();
}

function renderTimer() {
  const display = $("#timerDisplay");
  if (!state.timerEndAt) {
    display.textContent = "대기 중";
    return;
  }

  const remain = Math.max(0, new Date(state.timerEndAt).getTime() - Date.now());
  if (remain <= 0) {
    state.timerEndAt = null;
    saveState();
    display.textContent = "시간 종료";
    toast("공주님, 사교장 머무르기 시간이 끝났습니다.");
    return;
  }

  const min = Math.floor(remain / 60000);
  const sec = Math.floor((remain % 60000) / 1000);
  display.textContent = `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function renderAll({ reloadTimeline = false } = {}) {
  renderCategories();
  renderAccounts();
  renderSearches();
  renderHeader();
  renderTimer();
  if (reloadTimeline) renderTimeline();
}

function selectAccount(id) {
  state.currentAccountId = id;
  saveState();
  renderAll({ reloadTimeline: true });
}

function openCurrentX() {
  const account = getCurrentAccount();
  if (!account) {
    toast("열 계정을 선택해주세요.");
    return;
  }
  window.open(normalizeXUrl(account.url), "_blank", "noopener,noreferrer");
}

function reloadEmbed() {
  renderTimeline();
  toast("초대장을 다시 불러왔습니다. 최신순 확인은 X에서 바로 보는 쪽이 가장 안정적입니다.");
}

function openSearch(id) {
  const item = state.searches.find((search) => search.id === id);
  if (!item) return;
  const url = `https://x.com/search?q=${encodeURIComponent(item.query)}&f=live`;
  window.open(url, "_blank", "noopener,noreferrer");
}

function saveAccount() {
  const name = $("#accountName").value.trim();
  const url = normalizeXUrl($("#accountUrl").value.trim());

  if (!name || !url) {
    toast("계정 이름과 URL이 필요합니다.");
    return;
  }

  const handle = extractHandle(url);
  const account = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    name,
    handle,
    url,
    category: $("#accountCategory").value
  };

  state.accounts.unshift(account);
  state.currentAccountId = account.id;
  saveState();
  clearAccountForm();
  renderAll({ reloadTimeline: true });
  toast("사교장에 계정을 저장했습니다.");
}

function saveSearch() {
  const name = $("#searchName").value.trim();
  const query = $("#searchQuery").value.trim();

  if (!name || !query) {
    toast("검색 이름과 검색어가 필요합니다.");
    return;
  }

  state.searches.unshift({
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    name,
    query,
    category: $("#searchCategory").value
  });

  saveState();
  clearSearchForm();
  renderAll();
  toast("검색 초대장을 저장했습니다.");
}

function clearAccountForm() {
  $("#accountName").value = "";
  $("#accountUrl").value = "";
  $("#accountCategory").value = "bias";
}

function clearSearchForm() {
  $("#searchName").value = "";
  $("#searchQuery").value = "";
  $("#searchCategory").value = "jpop";
}

function startTimer(minutes) {
  state.timerEndAt = new Date(Date.now() + minutes * 60000).toISOString();
  saveState();
  renderTimer();

  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(renderTimer, 1000);

  toast(`${minutes}분 동안 사교장에 머무릅니다.`);
}

function stopTimer() {
  state.timerEndAt = null;
  saveState();
  renderTimer();
  if (timerInterval) clearInterval(timerInterval);
  toast("사교장 타이머를 정지했습니다.");
}

function bindEvents() {
  $$("#categoryList button").forEach((button) => {
    button.addEventListener("click", () => {
      state.category = button.dataset.category;
      saveState();
      renderAll();
    });
  });

  $("#openCurrentX").addEventListener("click", openCurrentX);
  $("#reloadEmbed").addEventListener("click", reloadEmbed);
  $("#quickTimer").addEventListener("click", () => startTimer(5));

  $("#saveAccount").addEventListener("click", saveAccount);
  $("#saveSearch").addEventListener("click", saveSearch);
  $("#clearAccountForm").addEventListener("click", clearAccountForm);
  $("#clearSearchForm").addEventListener("click", clearSearchForm);

  $$(".timer-buttons [data-minutes]").forEach((button) => {
    button.addEventListener("click", () => startTimer(Number(button.dataset.minutes)));
  });
  $("#stopTimer").addEventListener("click", stopTimer);
}

loadState();
bindEvents();
renderAll({ reloadTimeline: true });

if (state.timerEndAt) {
  timerInterval = setInterval(renderTimer, 1000);
}
