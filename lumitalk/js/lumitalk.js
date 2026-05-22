/* LUMI TALK Fan Clean Baseline v1
   실험 목업 v1~v5 정리본.
   실제 구현 시 HELP 채널은 /lumi-help/ 엔진과 연결한다.
*/

const channels = [
  {
    id: "lumibelle",
    group: "내 채널",
    type: "member",
    title: "루미벨 반짝채널",
    tag: "단체 채널",
    preview: "오늘의 루미벨 소식이 도착했어요.",
    time: "10:18",
    unread: 2,
    avatar: "✦",
    avatarClass: "a-lumi"
  },
  {
    id: "lulu",
    group: "내 채널",
    type: "member",
    title: "루루의 포근포근 토끼굴",
    tag: "오시 채널",
    preview: "오늘 와줘서 루루 진짜 힘났어…",
    time: "방금",
    unread: 6,
    avatar: "🐰",
    avatarClass: "a-lulu"
  },
  {
    id: "mari",
    group: "멤버 채널",
    type: "member",
    title: "링링의 별빛톡",
    tag: "추가됨",
    preview: "링링이 오늘도 너에게 마법을 걸어줄게!",
    time: "20:17",
    unread: 1,
    avatar: "🎀",
    avatarClass: "a-mari"
  },
  {
    id: "iro",
    group: "멤버 채널",
    type: "member",
    title: "이로의 블루 다이아 채널",
    tag: "공개 예정",
    preview: "Coming Soon",
    time: "LOCK",
    unread: 0,
    avatar: "💎",
    avatarClass: "a-iro",
    locked: true
  },
  {
    id: "lunar",
    group: "멤버 채널",
    type: "member",
    title: "LUNAR의 달빛방",
    tag: "공개 예정",
    preview: "Coming Soon",
    time: "LOCK",
    unread: 0,
    avatar: "🌙",
    avatarClass: "a-lunar",
    locked: true
  },
  {
    id: "help",
    group: "HELP 채널",
    type: "help",
    title: "운영팀 문의하기",
    tag: "HELP",
    preview: "예매, 입금, 굿즈, 오류 문의를 남길 수 있어요.",
    time: "상시",
    unread: 0,
    avatar: "?",
    avatarClass: "a-help"
  }
];

const rooms = {
  lumibelle: {
    title: "루미벨 반짝채널",
    short: "루미벨",
    status: "공식 채널 · 알림 켜짐",
    label: "LUMIBELLE",
    sub: "루미벨이 루미나에게 보내는 단체 반짝 메시지예요.",
    avatar: "✦",
    avatarClass: "a-lumi",
    profileSub: "루미벨 공식 반짝채널",
    talkButton: "반짝채널 보기",
    photoTitle: "루미벨이 남긴 사진",
    messages: [
      { type: "notice", text: "루미벨 공식 소식과 멤버 공통 메시지가 도착하는 채널이에요." },
      { type: "member", text: "루미나, 오늘도 루미벨을 찾아와줘서 고마워요.\n작은 점들이 모여 반짝이는 선이 되는 순간을 함께 기록해요.", time: "10:18", reactions: ["✨ 42", "🩷 21"] }
    ]
  },
  lulu: {
    title: "루루의 포근포근 토끼굴",
    short: "루루",
    status: "오시 채널 · 알림 켜짐",
    label: "LULU",
    sub: "루루와 루미나가 포근한 마음을 주고받는 작은 토끼굴이에요.",
    avatar: "🐰",
    avatarClass: "a-lulu",
    profileSub: "포근포근 토끼굴 · 루루만의 길로 한발씩",
    talkButton: "루루와 이야기하기",
    photoTitle: "루루가 남긴 사진",
    messages: [
      { type: "notice", text: "팬끼리 보이지 않는 멤버 전용 채널이에요. 답장은 루루에게만 전달돼요." },
      { type: "member", text: "율, 오늘 와줘서 루루 진짜 힘났어… 🐰🩷\n잘 못했어도 루루 정말 열심히 했는데, 네 눈에도 괜찮았을까…?", time: "방금", reactions: ["🩷 30", "🐰 12", "✨ 18"] },
      { type: "photo", text: "사진도 조금만 두고 갈게… 루미톡에만 두는 거야…!", time: "방금", reactions: ["🩷 24", "😭 7"] },
      { type: "me", text: "오늘 무대 너무 귀여웠어 ㅠㅠ 다음에도 갈게!", time: "방금" },
      { type: "letter", text: "오늘의 말랑한 한마디\n넘어지고 늦어도 괜찮아… 루루도 한 발씩 가고 있으니까, 우리 같이 천천히 가자 🐰🍀", time: "소장 가능" }
    ]
  },
  mari: {
    title: "링링의 별빛톡",
    short: "마리링",
    status: "추가됨 · 알림 켜짐",
    label: "MARIRING",
    sub: "링링이 루미나에게 별빛 같은 말을 남기는 공간이에요.",
    avatar: "🎀",
    avatarClass: "a-mari",
    profileSub: "별빛톡 · 펼쳐지는 세상에 마법을 걸어줄게",
    talkButton: "링링과 이야기하기",
    photoTitle: "링링이 남긴 사진",
    messages: [
      { type: "notice", text: "팬 답장은 다른 팬에게 보이지 않고 링링에게만 전달돼요." },
      { type: "member", text: "오늘도 보러 와준 거야? 링링 진짜 기뻐!\n네가 있어서 오늘 무대도 더 반짝일 수 있었어.", time: "20:17", reactions: ["🎀 18", "⭐️ 23", "🩷 15"] }
    ]
  },
  help: {
    title: "운영팀 문의하기",
    short: "문의하기",
    status: "HELP · 운영팀 확인",
    label: "LUMI HELP",
    sub: "예매, 입금, 굿즈, 오류 문의를 운영팀에게 남기는 채널이에요. 멤버 채널과는 분리돼요.",
    avatar: "?",
    avatarClass: "a-help",
    profileSub: "루미벨 운영 문의 채널",
    talkButton: "문의 남기기",
    photoTitle: "문의 안내",
    messages: [
      { type: "notice", text: "문의 내용은 운영팀에게만 전달돼요. 멤버 채널 답장함과 섞이지 않아요." },
      { type: "member", text: "안녕하세요, 루미벨 운영팀입니다.\n예매/입금/굿즈/홈페이지 오류 문의를 남겨주시면 확인 후 답변드릴게요.", time: "상시", reactions: ["답변 대기"] },
      { type: "letter", text: "문의 전 확인\n· 예매/입금 문의: 예매자명과 입금자명을 함께 남겨주세요.\n· 굿즈 문의: 상품명과 주문번호를 함께 남겨주세요.\n· 오류 문의: 화면 캡처가 있으면 더 빠르게 확인할 수 있어요.", time: "안내" }
    ]
  }
};

let currentRoomId = "lulu";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function showScreen(screenId) {
  $$("#app > .screen").forEach((screen) => screen.classList.add("hidden"));
  $("#" + screenId).classList.remove("hidden");
}

function closeSheets() {
  $$(".sheet").forEach((sheet) => sheet.classList.add("hidden"));
}

function renderChannels() {
  const list = $("#channelList");
  const groups = ["내 채널", "멤버 채널", "HELP 채널"];

  list.innerHTML = groups.map((group) => {
    const items = channels.filter((channel) => channel.group === group);
    if (!items.length) return "";

    const rows = items.map(renderChannelRow).join("");
    return `<div class="section-title">${group}</div>${rows}`;
  }).join("");

  $$(".avatar-btn[data-profile]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const id = button.dataset.profile;
      if (rooms[id]) {
        renderProfile(id);
        showScreen("profileScreen");
      }
    });
  });

  $$(".channel-main[data-room]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.room;
      if (rooms[id]) {
        renderRoom(id);
        showScreen("roomScreen");
      }
    });
  });
}

function renderChannelRow(channel) {
  const unread = channel.unread > 0 ? `<span class="unread">${channel.unread}</span>` : "";
  const lockedClass = channel.locked ? " locked" : "";
  const profileButton = channel.locked
    ? `<div class="avatar ${channel.avatarClass}">${channel.avatar}</div>`
    : `<button class="avatar-btn" type="button" data-profile="${channel.id}" aria-label="${channel.title} 프로필홈"><div class="avatar ${channel.avatarClass}">${channel.avatar}${unread}</div></button>`;

  const main = channel.locked
    ? `<div class="channel-main"><div class="channel-name"><b>${channel.title}</b><span class="tag">${channel.tag}</span></div><div class="preview">${channel.preview}</div></div>`
    : `<button class="channel-main" type="button" data-room="${channel.id}" aria-label="${channel.title} 입장"><div class="channel-name"><b>${channel.title}</b><span class="tag">${channel.tag}</span></div><div class="preview">${channel.preview}</div></button>`;

  return `<div class="channel${lockedClass}">${profileButton}${main}<div class="time">${channel.time}</div></div>`;
}

function renderRoom(id) {
  const room = rooms[id] || rooms.lulu;
  currentRoomId = id;

  $("#roomTitle").textContent = room.title;
  $("#roomStatus").textContent = room.status;
  $("#roomLabel").textContent = room.label;
  $("#roomSub").textContent = room.sub;
  $("#roomAvatar").className = `avatar room-avatar ${room.avatarClass}`;
  $("#roomAvatar").textContent = room.avatar;
  $("#chatBody").innerHTML = room.messages.map((message) => renderMessage(message, room)).join("");
}

function renderMessage(message, room) {
  if (message.type === "notice") {
    return `<div class="notice"><span>${message.text}</span></div>`;
  }

  if (message.type === "me") {
    return `<div class="msg me"><div class="bubble-wrap"><div class="bubble">${message.text}</div><div class="msg-time" style="text-align:right">${message.time}</div></div></div>`;
  }

  if (message.type === "letter") {
    return `<div class="letter"><div class="letter-label">✦ LUMI LETTER</div><div class="letter-body">${message.text}</div><div class="letter-foot"><button class="save-btn" type="button">소장하기</button><span class="msg-time">${message.time}</span></div></div>`;
  }

  const photoHtml = message.type === "photo"
    ? `<div class="photos"><div class="photo">🍓</div><div class="photo">🐰</div><div class="photo">🍼</div></div>`
    : "";

  const reactions = (message.reactions || [])
    .map((reaction) => `<button class="react" type="button">${reaction}</button>`)
    .join("");

  return `<div class="msg"><div class="msg-avatar ${room.avatarClass}">${room.avatar}</div><div class="bubble-wrap"><div class="bubble">${message.text}${photoHtml}</div><div class="react-row">${reactions}<button class="react" type="button">♡ 반응</button><button class="react" type="button">▣ 소장</button></div><div class="msg-time">${message.time}</div></div></div>`;
}

function renderProfile(id) {
  const room = rooms[id] || rooms.lulu;
  currentRoomId = id;

  $("#profileAvatar").textContent = room.avatar;
  $("#profileName").textContent = room.short;
  $("#profileSub").textContent = room.profileSub;
  $("#goChatBtn").textContent = room.talkButton;
  $("#profilePhotoBtn").textContent = room.photoTitle;
  $("#profilePhotoTitle").textContent = room.photoTitle;
}

function renderSearchResults() {
  const results = [
    ["루루의 포근포근 토끼굴", "오늘 와줘서 루루 진짜 힘났어…"],
    ["링링의 별빛톡", "네가 있어서 오늘 무대도 더 반짝일 수 있었어."],
    ["소장한 메시지", "넘어지고 늦어도 괜찮아… 우리 같이 천천히 가자 🐰🍀"],
    ["운영팀 문의하기", "예매, 입금, 굿즈, 오류 문의를 남길 수 있어요."],
    ["예매/입금 문의", "예매자명, 입금자명, 공연명을 함께 남겨주세요."]
  ];

  $("#searchResults").innerHTML = results
    .map(([title, text]) => `<div class="result-card"><b>${title}</b><p>${text}</p></div>`)
    .join("");
}

function renderSavedList() {
  const saved = [
    ["루루 · LUMI LETTER", "넘어지고 늦어도 괜찮아… 루루도 한 발씩 가고 있으니까, 우리 같이 천천히 가자 🐰🍀"],
    ["마리링 · 별빛톡", "네가 있어서 오늘 무대도 더 반짝일 수 있었어."],
    ["루미벨 반짝채널", "작은 점들이 모여 반짝이는 선이 되는 순간을 함께 기록해요."]
  ];

  $("#savedList").innerHTML = saved
    .map(([title, text]) => `<div class="saved-card"><b>${title}</b><p>${text}</p></div>`)
    .join("");
}

function bindEvents() {
  $("#roomBackBtn").addEventListener("click", () => showScreen("listScreen"));
  $("#profileBackBtn").addEventListener("click", () => showScreen("listScreen"));

  $("#roomProfileBtn").addEventListener("click", () => {
    renderProfile(currentRoomId);
    showScreen("profileScreen");
  });

  $("#goChatBtn").addEventListener("click", () => {
    renderRoom(currentRoomId);
    showScreen("roomScreen");
  });

  $("#searchBtn").addEventListener("click", () => {
    renderSearchResults();
    $("#searchSheet").classList.remove("hidden");
  });

  $("#savedBtn").addEventListener("click", () => {
    renderSavedList();
    $("#savedSheet").classList.remove("hidden");
  });

  $("#myProfileBtn").addEventListener("click", () => {
    $("#myProfileSheet").classList.remove("hidden");
  });

  $$(".sheet-close").forEach((button) => {
    button.addEventListener("click", closeSheets);
  });
}

renderChannels();
renderRoom(currentRoomId);
renderProfile(currentRoomId);
bindEvents();
