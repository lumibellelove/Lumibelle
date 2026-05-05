(() => {
  "use strict";

  const baseMails = [
    {
      id: "mail-first-visit",
      box: "받은 우편",
      cat: "멤버",
      icon: "💌",
      title: "첫 루미 방문을 기억해요",
      meta: "루미벨 · 안내",
      desc: "루미벨과 처음 만난 날을 기념하는 우편이에요.",
      body: "처음 루미벨을 만나러 와준 날을 루미폰에 조용히 기록해둘게요. 공연 후 멤버의 한마디나 안내 우편도 이곳에 도착해요.",
      note: "받은 우편에서 열람 후 소장 우편으로 보관할 수 있어요."
    },
    {
      id: "mail-debut-live",
      box: "받은 우편",
      cat: "라이브",
      icon: "🎤",
      title: "Debut Live 입장 완료",
      meta: "2026.07.12 · 라이브",
      desc: "공연 입장 기록과 함께 보관되는 안내 우편이에요.",
      body: "2026.07.12 데뷔 라이브에 함께한 기록이에요. 공연, 티켓, 체크인, 스탬프 기록은 추억의 시간과 함께 천천히 연결됩니다.",
      note: "예매/입장/체크인 기록과 연결해 표시할 수 있어요."
    },
    {
      id: "mail-keep-sample",
      box: "소장 우편",
      cat: "이벤트",
      icon: "🎀",
      title: "소장 우편 후보",
      meta: "이벤트 · 보관",
      desc: "소장함에 보관할 수 있는 우편이에요.",
      body: "소장 우편은 지나간 메시지를 다시 열어볼 수 있게 남겨두는 공간이에요. 리프처럼 부담스러운 답장 구조가 아니라, 루미폰 안에 오래 보관되는 작은 기록으로 설계해요.",
      note: "이미 소장 우편에 보관된 편지예요."
    },
    {
      id: "mail-guide",
      box: "안내",
      cat: "안내",
      icon: "📮",
      title: "우편함 안내",
      meta: "루미폰 · 안내",
      desc: "공연 후 도착한 우편과 안내 우편을 모아보는 공간이에요.",
      body: "우편함은 공연 후 안내, 멤버 메시지, 이벤트 알림을 모아보는 공간이에요. 팬 화면에는 운영용 내부 메모를 노출하지 않고, 필요한 안내와 추억만 보여줘요.",
      note: "소장 우편은 다시 꺼내볼 수 있는 편지함에 보관돼요."
    }
  ];

  let currentBox = "받은 우편";
  let currentCat = "전체";
  let currentPage = 1;
  let selectedMail = null;
  let mailScrollY = 0;
  let keptLetterIds = new Set();
  const pageSize = 4;

  function getDataApi() {
    return window.LumiData || null;
  }

  function getSourceId(mail) {
    return String(mail && (mail.sourceId || mail.id) || "");
  }

  function buildMails() {
    const keptCopies = baseMails
      .filter((mail) => keptLetterIds.has(mail.id) && mail.box !== "소장 우편")
      .map((mail) => ({
        ...mail,
        id: `kept-${mail.id}`,
        sourceId: mail.id,
        box: "소장 우편",
        meta: `${mail.meta} · 소장`,
        desc: "소장 우편에 보관된 메시지예요.",
        note: "소장 우편에 보관된 편지예요."
      }));
    return [...baseMails, ...keptCopies];
  }

  function filteredMails() {
    return buildMails().filter((mail) => {
      const boxOk = currentBox === "전체" || mail.box === currentBox;
      const catOk = currentCat === "전체" || mail.cat === currentCat;
      return boxOk && catOk;
    });
  }

  function setMessage(text) {
    const message = document.getElementById("mailMessage");
    if (!message) return;
    message.textContent = text || "";
    message.classList.toggle("show", Boolean(text));
  }

  function escapeAttr(value) {
    return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function isKept(mail) {
    if (!mail) return false;
    return mail.box === "소장 우편" || keptLetterIds.has(getSourceId(mail));
  }

  async function loadKeptLetters() {
    const api = getDataApi();
    if (!api || typeof api.getData !== "function") return;
    const data = await api.getData();
    const letters = Array.isArray(data.letters) ? data.letters : [];
    keptLetterIds = new Set(letters.map((item) => String(item && item.id || "")).filter(Boolean));
  }

  async function saveKeptLetter(mail) {
    const sourceId = getSourceId(mail);
    if (!sourceId || keptLetterIds.has(sourceId)) return false;
    keptLetterIds.add(sourceId);

    const api = getDataApi();
    if (api && typeof api.getData === "function" && typeof api.updateData === "function") {
      const data = await api.getData();
      const letters = Array.isArray(data.letters) ? data.letters.filter((item) => item && item.id !== sourceId) : [];
      letters.unshift({
        id: sourceId,
        title: mail.title,
        cat: mail.cat,
        meta: mail.meta,
        icon: mail.icon,
        keptAt: new Date().toISOString().slice(0, 10)
      });
      await api.updateData({ letters });
    }
    return true;
  }

  function renderMail() {
    const list = document.getElementById("mailSplitList");
    const pageText = document.getElementById("mailPageText");
    const prev = document.getElementById("mailPrev");
    const next = document.getElementById("mailNext");
    if (!list) return;

    const data = filteredMails();
    const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
    currentPage = Math.max(1, Math.min(currentPage, totalPages));
    const visible = data.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    if (!visible.length) {
      list.innerHTML = `<div class="mail-split-empty">조건에 맞는 우편이 없어요.</div>`;
    } else {
      list.innerHTML = visible.map((mail) => `
        <button type="button" class="mail-split-card${isKept(mail) ? " is-kept" : ""}" data-mail-id="${escapeAttr(mail.id)}">
          <span class="mail-split-icon">${mail.icon}</span>
          <span class="mail-split-meta">${mail.meta}</span>
          <b>${mail.title}</b>
          <span class="mail-split-chip">${isKept(mail) ? "소장" : mail.cat}</span>
          <small>${mail.desc}</small>
          <span class="mail-split-open">상세 보기</span>
        </button>
      `).join("");
    }

    list.querySelectorAll("[data-mail-id]").forEach((card) => {
      card.addEventListener("click", () => openMail(card.dataset.mailId));
    });

    if (pageText) pageText.textContent = currentPage + " / " + totalPages;
    if (prev) prev.disabled = currentPage <= 1;
    if (next) next.disabled = currentPage >= totalPages;
  }

  function lockMailScroll() {
    mailScrollY = window.scrollY || document.documentElement.scrollTop || 0;
    document.body.classList.add("modal-open", "mail-modal-open");
    document.body.style.position = "fixed";
    document.body.style.top = `-${mailScrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
  }

  function unlockMailScroll() {
    document.body.classList.remove("modal-open", "mail-modal-open");
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    window.scrollTo(0, mailScrollY || 0);
  }

  function openMail(id) {
    const mail = buildMails().find((item) => item.id === id);
    const modal = document.getElementById("mailDetailModal");
    if (!mail || !modal) return;
    selectedMail = mail;

    const icon = document.getElementById("mailDetailIcon");
    const meta = document.getElementById("mailDetailMeta");
    const title = document.getElementById("mailDetailTitle");
    const cat = document.getElementById("mailDetailCat");
    const body = document.getElementById("mailDetailBody");
    const note = document.getElementById("mailDetailNote");
    const keep = document.getElementById("mailKeepButton");

    if (icon) icon.textContent = mail.icon;
    if (meta) meta.textContent = mail.meta;
    if (title) title.textContent = mail.title;
    if (cat) cat.textContent = mail.cat;
    if (body) body.textContent = mail.body;
    if (note) note.textContent = isKept(mail) ? "이 우편은 소장 우편에 보관되어 있어요." : mail.note;
    if (keep) {
      keep.textContent = isKept(mail) ? "소장 우편에 보관됨" : "소장 우편으로 보관";
      keep.disabled = isKept(mail);
      keep.classList.toggle("is-disabled", isKept(mail));
    }

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    lockMailScroll();
    setMessage("");
  }

  function closeMail() {
    const modal = document.getElementById("mailDetailModal");
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    unlockMailScroll();
  }

  async function keepMail() {
    if (!selectedMail) return;
    const title = selectedMail.title;
    if (isKept(selectedMail)) {
      closeMail();
      setMessage(`「${title}」은 이미 소장 우편에 보관되어 있어요.`);
      return;
    }
    await saveKeptLetter(selectedMail);
    closeMail();
    currentBox = "소장 우편";
    currentPage = 1;
    document.querySelectorAll("[data-mail-box]").forEach((item) => {
      item.classList.toggle("active", item.dataset.mailBox === "소장 우편");
    });
    renderMail();
    setMessage(`「${title}」을 소장 우편에 보관했어요.`);
  }

  async function boot() {
    await loadKeptLetters();

    document.querySelectorAll("[data-mail-box]").forEach((button) => {
      button.addEventListener("click", () => {
        currentBox = button.dataset.mailBox || "받은 우편";
        currentPage = 1;
        document.querySelectorAll("[data-mail-box]").forEach((item) => item.classList.toggle("active", item === button));
        setMessage("");
        renderMail();
      });
    });

    document.querySelectorAll("[data-mail-cat]").forEach((button) => {
      button.addEventListener("click", () => {
        currentCat = button.dataset.mailCat || "전체";
        currentPage = 1;
        document.querySelectorAll("[data-mail-cat]").forEach((item) => item.classList.toggle("active", item === button));
        setMessage("");
        renderMail();
      });
    });

    const prev = document.getElementById("mailPrev");
    const next = document.getElementById("mailNext");
    const keep = document.getElementById("mailKeepButton");

    if (prev) prev.addEventListener("click", () => { currentPage -= 1; renderMail(); });
    if (next) next.addEventListener("click", () => { currentPage += 1; renderMail(); });
    if (keep) keep.addEventListener("click", keepMail);

    document.querySelectorAll("[data-mail-close]").forEach((button) => {
      button.addEventListener("click", closeMail);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMail();
    });

    window.addEventListener("lumi:data-updated", async () => {
      await loadKeptLetters();
      renderMail();
    });

    renderMail();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
