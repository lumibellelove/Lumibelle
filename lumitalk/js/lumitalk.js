/* LUMI TALK Patch 7 Clean Polish */

const AS = "./assets/";
const rooms = {
  lumibelle:{
    title:"루미벨 반짝채널", short:"루미벨", label:"LUMIBELLE", avatar:"✦", avatarClass:"a-lumi", mark:"✦", cover:AS+"lumibelle_logo.png", profile:AS+"lumibelle_logo.png",
    sub:"루미벨이 루미나에게 보내는 단체 반짝 메시지예요.", profileSub:"루미벨 공식 반짝채널", talkButton:"반짝채널 보기", photoTitle:"루미벨이 남긴 사진",
    joinCopy:"루미벨 공식 소식과 공통 메시지를 받을 수 있어요.",
    messages:[
      {type:"date", text:"2026년 5월 22일 금요일"},
      {type:"notice", text:"루미벨 공식 소식과 멤버 공통 메시지가 도착하는 채널이에요."},
      {type:"member", text:"루미나, 오늘도 루미벨을 찾아와줘서 고마워요.\n작은 점들이 모여 반짝이는 선이 되는 순간을 함께 기록해요.", time:"10:18", reactions:["✨ 42","❤︎ 21"]}
    ]
  },
  lulu:{
    title:"루루의 포근포근 토끼굴", short:"루루", label:"LULU", avatar:"🐰", avatarClass:"a-lulu", mark:"🍼🐰", cover:AS+"lulu_cover.png", profile:AS+"lulu_sd.png",
    sub:"루루와 루미나가 포근한 마음을 주고받는 작은 토끼굴이에요.", profileSub:"포근포근 토끼굴 · 루루만의 길로 한발씩", talkButton:"루루와 이야기하기", photoTitle:"루루가 남긴 사진",
    joinCopy:"루루의 포근포근 토끼굴에 함께할 수 있어요.",
    messages:[
      {type:"date", text:"2026년 5월 22일 금요일"},
      {type:"notice", text:"팬끼리 보이지 않는 멤버 전용 채널이에요. 답장은 루루에게만 전달돼요."},
      {type:"member", text:"율, 오늘 와줘서 루루 진짜 힘났어… 🐰🩷\n잘 못했어도 루루 정말 열심히 했는데, 네 눈에도 괜찮았을까…?", time:"방금", reactions:["🩷 30","🐰 12","✨ 18"]},
      {type:"photo", text:"사진도 조금만 두고 갈게… 루미톡에만 두는 거야…!", time:"방금", photoIndexes:[0,1,2], reactions:["❤︎ 24","😭 7"]},
      {type:"me", text:"오늘 무대 너무 귀여웠어 ㅠㅠ 다음에도 갈게!", time:"방금"},
      {type:"letter", text:"오늘의 말랑한 한마디\n넘어지고 늦어도 괜찮아… 루루도 한 발씩 가고 있으니까, 우리 같이 천천히 가자 🐰🍀", time:"소장 가능"}
    ]
  },
  mari:{
    title:"링링의 별빛톡", short:"마리링", label:"MARIRING", avatar:"🎀", avatarClass:"a-mari", mark:"🎀⭐️", cover:AS+"mariring_cover.webp", profile:AS+"mariring_sd.png",
    sub:"링링이 루미나에게 별빛 같은 말을 남기는 공간이에요.", profileSub:"별빛톡 · 펼쳐지는 세상에 마법을 걸어줄게", talkButton:"링링과 이야기하기", photoTitle:"링링이 남긴 사진",
    joinCopy:"링링의 별빛톡을 받아볼 수 있어요.",
    messages:[
      {type:"date", text:"2026년 5월 22일 금요일"},
      {type:"notice", text:"링링의 별빛톡이 시작되었어요. 답장은 링링에게만 전달돼요."},
      {type:"member", text:"오늘도 보러 와준 거야? 링링 진짜 기뻐!\n네가 있어서 오늘 무대도 더 반짝일 수 있었어.", time:"20:17", reactions:["🎀 18","⭐️ 23","❤︎ 15"]}
    ]
  },
  help:{
    title:"운영팀 문의하기", short:"문의하기", label:"LUMI HELP", avatar:"?", avatarClass:"a-help", mark:"HELP", cover:null, profile:null,
    sub:"예매, 입금, 굿즈, 오류 문의를 운영팀에게 남기는 채널이에요. 멤버 채널과는 분리돼요.", profileSub:"루미벨 운영팀이 확인 후 답변드려요", talkButton:"문의 남기기", photoTitle:"문의 안내",
    joinCopy:"운영팀에게 문의를 남길 수 있어요.",
    messages:[
      {type:"notice", text:"문의 내용은 운영팀에게만 전달돼요. 멤버 채널 답장함과 섞이지 않아요."},
      {type:"member", text:"안녕하세요, 루미벨 운영팀입니다.\n예매/입금/굿즈/홈페이지 오류 문의를 남겨주시면 확인 후 답변드릴게요.", time:"상시", reactions:["답변 대기"]}
    ]
  }
};

let channels = [
  {id:"lumibelle", type:"member", status:"joined", tag:"단체 채널", preview:"오늘의 루미벨 소식이 도착했어요.", time:"10:18", unread:2, muted:false},
  {id:"lulu", type:"member", status:"joined", tag:"오시 채널", preview:"오늘 와줘서 루루 진짜 힘났어…", time:"방금", unread:6, muted:false},
  {id:"mari", type:"member", status:"available", tag:"추가하기", preview:"채널을 추가하면 지금부터 루미톡을 받을 수 있어요.", time:"NEW", unread:0, muted:false},
  {id:"iro", type:"member", status:"locked", tag:"공개 예정", preview:"Coming Soon", time:"LOCK", unread:0, muted:false, title:"이로의 블루 다이아 채널", avatar:"💎", avatarClass:"a-iro"},
  {id:"lunar", type:"member", status:"locked", tag:"공개 예정", preview:"Coming Soon", time:"LOCK", unread:0, muted:false, title:"LUNAR의 달빛방", avatar:"🌙", avatarClass:"a-lunar"},
  {id:"help", type:"help", status:"joined", tag:"HELP", preview:"예매, 입금, 굿즈, 오류 문의를 남길 수 있어요.", time:"상시", unread:0, muted:false}
];

const galleryItems = {
  lulu:[
    {src:AS+"lulu_cover.png", caption:"오늘 와줘서 고마워… 🐰🩷", type:"photo", date:"2026.05.22 07:02"},
    {src:AS+"lulu_sd.png", caption:"루루 SD도 남겨둘게…!", type:"photo", date:"2026.05.22 07:03"},
    {src:AS+"lulu_spring.png", caption:"봄날의 루루야 🍼🐰", type:"photo", date:"2026.05.22 07:04"},
    {src:AS+"lulu_cover.png", caption:"비밀 토끼굴 사진", type:"video", date:"2026.05.22 07:05"},
    {src:AS+"lulu_sd.png", caption:"오늘의 작은 마음", type:"photo", date:"2026.05.22 07:06"}
  ],
  mari:[
    {src:AS+"mariring_cover.webp", caption:"링링이 남긴 별빛 순간", type:"photo", date:"2026.05.22 20:17"},
    {src:AS+"mariring_sd.png", caption:"링링 프로필 사진", type:"photo", date:"2026.05.22 20:18"},
    {src:AS+"mariring_cover.webp", caption:"별빛톡 미리보기", type:"photo", date:"2026.05.22 20:19"}
  ],
  lumibelle:[
    {src:AS+"lulu_spring.png", caption:"루미벨 반짝채널 사진", type:"photo", date:"2026.05.22 10:18"}
  ],
  help:[]
};

let currentRoomId="lulu";
let currentFilter="all";
let currentGalleryIndex=0;
let viewerReturn="gallery";
let myViewerItems = [];
let myViewerIndex = 0;
let fromMyProfileViewer = false;
let lastRoomIdBeforeMyProfile = "lulu";
let galleryReturn="info";
let touchStartX=0;

const $=(s)=>document.querySelector(s);
const $$=(s)=>Array.from(document.querySelectorAll(s));
const getRoom=(id)=>rooms[id] || rooms.lulu;
const getChannel=(id)=>channels.find(c=>c.id===id);
const getDisplayName=(id)=>localStorage.getItem(`lumitalkName:${id}`) || getRoom(id).short;
const memberAvatarHTML=(room, cls="")=> room.profile ? `<img src="${room.profile}" alt="${room.short}" />` : room.avatar;
const photoHTML=(item, alt="사진")=>`<img src="${item.src}" alt="${alt}" />`;

function showScreen(id){ $$("#app > .screen").forEach(s=>s.classList.add("hidden")); $("#"+id).classList.remove("hidden"); }
function closeSheets(){ $$(".sheet").forEach(s=>s.classList.add("hidden")); }
function closeBottomSheets(){ $$(".bottom-sheet").forEach(s=>s.classList.add("hidden")); }

function groupFor(c){ if(c.type==="help") return "HELP 채널"; if(c.status==="joined" || c.status==="muted") return "내 채널"; return "멤버 채널"; }
function channelTitle(c){ return c.title || getRoom(c.id).title; }
function channelAvatar(c){ return c.avatar || getRoom(c.id).avatar; }
function channelAvatarClass(c){ return c.avatarClass || getRoom(c.id).avatarClass; }

function renderFilters(){
  const unreadTotal = channels.filter(c=>c.status==="joined" || c.status==="muted").reduce((sum,c)=>sum+(c.unread||0),0);
  const filters=[["all","전체"],["unread",`안 읽음 ${unreadTotal}`],["mine","내 채널"],["members","멤버 채널"],["help","HELP"]];
  $("#filterBar").innerHTML=filters.map(([key,label])=>`<button class="pill ${currentFilter===key?"active":""}" data-filter="${key}" type="button">${label}</button>`).join("");
  $$("[data-filter]").forEach(btn=>btn.addEventListener("click",()=>{currentFilter=btn.dataset.filter;renderChannels();}));
}

function filterChannels(items){
  if(currentFilter==="unread") return items.filter(c=>(c.unread||0)>0);
  if(currentFilter==="mine") return items.filter(c=>groupFor(c)==="내 채널");
  if(currentFilter==="members") return items.filter(c=>groupFor(c)==="멤버 채널");
  if(currentFilter==="help") return items.filter(c=>groupFor(c)==="HELP 채널");
  return items;
}

function renderChannels(){
  renderFilters();
  const list=$("#channelList");
  const visible=filterChannels(channels);
  const groups=["내 채널","멤버 채널","HELP 채널"];
  list.innerHTML=groups.map(group=>{
    const items=visible.filter(c=>groupFor(c)===group);
    if(!items.length) return "";
    return `<div class="section-title">${group}</div>${items.map(renderChannelRow).join("")}`;
  }).join("") || `<div class="empty-list">아직 안 읽은 루미톡이 없어요.<br>새 메시지가 오면 여기에서 모아볼 수 있어요.</div>`;
  $$(".avatar-btn[data-profile]").forEach(btn=>btn.addEventListener("click",(e)=>{e.stopPropagation();renderProfile(btn.dataset.profile);showScreen("profileScreen");}));
  $$(".channel-main[data-room]").forEach(btn=>btn.addEventListener("click",()=>openChannel(btn.dataset.room)));
}

function renderChannelRow(c){
  const room=getRoom(c.id);
  const unread=c.unread>0 && c.status!=="locked" ? `<span class="unread">${c.unread}</span>`:"";
  const locked=c.status==="locked";
  const tag=c.status==="muted"?"알림 꺼짐":c.tag;
  const avatarContent = room.profile ? `<img src="${room.profile}" alt="${room.short}" />` : channelAvatar(c);
  const avatar = locked ? `<div class="avatar ${channelAvatarClass(c)}">${avatarContent}</div>` : `<button class="avatar-btn" type="button" data-profile="${c.id}"><div class="avatar ${channelAvatarClass(c)}">${avatarContent}${unread}</div></button>`;
  const main = locked ? `<div class="channel-main"><div class="channel-name"><b>${channelTitle(c)}</b><span class="tag">${tag}</span></div><div class="preview">${c.preview}</div></div>` : `<button class="channel-main" type="button" data-room="${c.id}"><div class="channel-name"><b>${channelTitle(c)}</b><span class="tag">${tag}</span></div><div class="preview">${c.preview}</div></button>`;
  return `<div class="channel ${locked?"locked":""}">${avatar}${main}<div class="time ${c.time==="NEW"?"is-new":""}">${c.time}</div></div>`;
}

function openChannel(id){
  const c=getChannel(id);
  if(!c || c.status==="locked") return;
  if(c.type==="help" || c.status==="joined" || c.status==="muted"){
    renderRoom(id);
    showScreen("roomScreen");
    return;
  }
  renderJoin(id);
  showScreen("joinScreen");
}

function renderRoom(id){
  const room=getRoom(id), c=getChannel(id); currentRoomId=id;
  if(c){c.unread=0; renderChannels();}
  $("#roomTitle").textContent=room.title;
  $("#roomStatus").textContent=getRoomStatus(id);
  $("#roomLabel").textContent=room.label;
  $("#roomSub").textContent=room.sub;
  $("#roomAvatar").className=`avatar room-avatar ${room.avatarClass}`;
  $("#roomAvatar").innerHTML=memberAvatarHTML(room);
  $("#chatBody").innerHTML=room.messages.map(m=>renderMessage(m,room)).join("");
  $$(".chat-photo").forEach(btn=>btn.addEventListener("click",()=>openViewer(id,Number(btn.dataset.index),"room")));
}

function getRoomStatus(id){
  const c=getChannel(id), room=getRoom(id);
  if(!c) return "";
  if(c.status==="muted") return `${c.tag} · 알림 꺼짐`;
  if(c.status==="available" || c.status==="left") return "추가 전 · 프로필만 보기";
  return `${c.tag} · 알림 켜짐`;
}

function renderMessage(m,room){
  if(m.type==="date") return `<div class="date-pill">${m.text}</div>`;
  if(m.type==="notice") return `<div class="notice"><span>${m.text}</span></div>`;
  if(m.type==="me") return `<div class="msg me"><div class="bubble-wrap"><div class="bubble">${m.text}</div><div class="msg-time" style="text-align:right">${m.time}</div></div></div>`;
  if(m.type==="letter") return `<div class="letter"><div class="letter-label">✦ LUMI LETTER</div><div class="letter-body">${m.text}</div><div class="letter-foot"><button class="save-btn" type="button">소장하기</button><span class="msg-time">${m.time}</span></div></div>`;
  let photoHtml="";
  if(m.type==="photo"){
    const items=galleryItems[currentRoomId] || galleryItems.lulu;
    photoHtml=`<div class="photos">${m.photoIndexes.map(i=>`<button class="photo chat-photo" type="button" data-index="${i}">${photoHTML(items[i]||items[0])}</button>`).join("")}</div>`;
  }
  const reactions=(m.reactions||[]).map(r=>`<button class="react" type="button">${r}</button>`).join("");
  const memberImg = room.profile ? `<img src="${room.profile}" alt="${room.short}" />` : room.avatar;
  const displayName = getDisplayName(currentRoomId);
  return `<div class="msg"><div class="msg-avatar ${room.avatarClass}">${memberImg}</div><div class="bubble-wrap"><div class="msg-head"><span class="msg-name">${displayName}</span></div><div class="bubble">${m.text}${photoHtml}</div><div class="react-row">${reactions}<button class="react" type="button">❤︎ 반응</button><button class="react" type="button">▣ 소장</button></div><div class="msg-time">${m.time}</div></div></div>`;
}

function renderChannelInfo(id){
  const room=getRoom(id), c=getChannel(id); currentRoomId=id;
  const screen = $("#channelInfoScreen");
  const main = $(".info-main");
  screen.classList.toggle("help-mode", c?.type === "help");
  $("#infoAvatar").className=`info-avatar ${room.avatarClass}`;
  $("#infoAvatar").innerHTML=memberAvatarHTML(room);
  $("#infoTitle").textContent=room.title;
  $("#infoStatus").textContent=getRoomStatus(id);
  const muted=c?.status==="muted";
  $("#infoMuteBtn").textContent=room.avatar;
  $("#infoMuteBtn").classList.toggle("is-muted",muted);
  $("#infoMuteText").textContent=muted?"알림 켜기":"알림 끄기";
  const isLeaveHidden = (id==="lumibelle" || c?.type==="help");
  $("#infoLeaveBtn").style.display=isLeaveHidden?"none":"block";
  $(".leave-card").classList.toggle("is-hidden", isLeaveHidden);

  const items=(galleryItems[id]||[]).slice(0,5);
  const hasMedia = items.length > 0;
  $(".media-card").classList.toggle("is-empty", !hasMedia);
  screen.classList.toggle("no-gallery", !hasMedia);
  main.classList.toggle("no-media", !hasMedia);

  $("#infoPhotoStrip").innerHTML=hasMedia ? items.map((item,i)=>`<button class="media-thumb ${item.type==="video"?"video":""}" data-index="${i}" type="button">${photoHTML(item)}${item.type==="video"?"<em>4:07</em>":""}</button>`).join("") : "";
  $$("#infoPhotoStrip .media-thumb").forEach(btn=>btn.addEventListener("click",(e)=>{e.stopPropagation();openViewer(id,Number(btn.dataset.index),"info");}));
  $("#infoAvatar").onclick=()=>openProfileImageViewer(id,"info");
}

function renderChatSetting(id){
  const room=getRoom(id), c=getChannel(id); currentRoomId=id;
  $("#settingAvatar").className=`setting-avatar ${room.avatarClass}`;
  $("#settingAvatar").innerHTML=memberAvatarHTML(room);
  $("#settingTitle").textContent=room.title;
  $("#settingMuteText").textContent=c?.status==="muted"?"알림 켜기":"알림 끄기";
  $("#settingLeaveBtn").style.display=(id==="lumibelle" || c?.type==="help")?"none":"block";
  $("#homeAddIcon").textContent=room.avatar; $("#homeAddName").textContent=room.short;
}

function renderJoin(id){
  const room=getRoom(id); currentRoomId=id;
  $("#joinHero").style.backgroundImage=room.cover?`url("${room.cover}")`:"linear-gradient(135deg,#f9cedd,#bb8e9e)";
  $("#joinAvatar").innerHTML=memberAvatarHTML(room);
  $("#joinTitle").textContent=room.title;
  $("#joinSub").textContent=room.joinCopy;
  $("#joinCopyTitle").textContent=`${room.short} 채널을 추가할까요?`;
  $("#joinCopyText").textContent="지난 대화는 보이지 않고, 추가한 순간부터 함께 시작해요.";
  const items=(galleryItems[id]||galleryItems.lulu).slice(0,3);
  $("#joinPreviewRow").innerHTML=items.map(item=>photoHTML(item)).join("");
  $("#joinChannelBtn").textContent=`${room.short} 채널 추가하기`;
  // 미리보기 사진 클릭 → 갤러리 뷰어
  setTimeout(()=>{
    $$("#joinPreviewRow img").forEach((img,i)=>{
      img.style.cursor="pointer";
      img.onclick=(e)=>{e.stopPropagation();openViewer(currentRoomId,i,"join");};
    });
  },0);
}

function joinCurrentChannel(){
  const c=getChannel(currentRoomId); if(!c)return;
  c.status="joined"; c.tag="추가됨"; c.preview="채널이 추가되었어요. 지금부터 루미톡을 받을 수 있어요."; c.time="방금";
  renderChannels(); renderRoom(currentRoomId); showScreen("roomScreen"); showToast(`${getRoom(currentRoomId).short}와의 루미톡이 시작되었어요`);
}

function toggleMute(){
  const c=getChannel(currentRoomId); if(!c || c.status==="available" || c.status==="left" || c.status==="locked")return;
  c.status=c.status==="muted"?"joined":"muted"; c.muted=c.status==="muted";
  renderChannels();
  showToast(c.muted?"알림을 껐어요. 새 메시지는 조용히 쌓여요.":"알림을 켰어요.");
}

function leaveCurrentChannel(){
  const c=getChannel(currentRoomId); if(!c || currentRoomId==="lumibelle" || c.type==="help"){closeBottomSheets();return;}
  c.status="left"; c.tag="다시 추가"; c.preview="다시 추가하면 그 시점부터 대화가 시작돼요."; c.unread=0; c.time="OFF";
  closeBottomSheets(); renderChannels(); showScreen("listScreen"); showToast(`${getRoom(currentRoomId).short} 채널을 나갔어요`);
}

function renderProfile(id){
  const room=getRoom(id); currentRoomId=id;
  const screen=$("#profileScreen");
  screen.classList.toggle("help-profile", id==="help");
  $("#profileHero").style.backgroundImage=room.cover?`url("${room.cover}")`:"linear-gradient(135deg,#f6c7d6,#b98896)";
  $("#profileAvatar").className=`profile-avatar ${room.avatarClass}`;
  $("#profileAvatar").innerHTML=memberAvatarHTML(room);
  $("#profileName").textContent=room.short;
  $("#profileSub").textContent=room.profileSub;
  $("#goChatBtn").textContent=room.talkButton;
  $("#profilePhotoBtn").textContent=room.photoTitle;
  $("#profilePhotoTitle").textContent=room.photoTitle;
  const noteEl=$("#profileNote");
  if(noteEl){
    noteEl.textContent = id==="help"
      ? "예매, 입금, 굿즈, 오류 문의를 운영팀에게 남길 수 있어요."
      : "멤버가 남긴 사진과 순간들을 천천히 모아두는 공간이에요.";
  }
  $("#profilePhotoBtn").style.display=(id==="help")?"none":"block";
  const items=(galleryItems[id]||[]).slice(0,3);
  $("#profilePhotoRow").innerHTML=items.length ? items.map((item,i)=>`<button class="profile-photo-thumb" data-profile-photo="${i}" type="button">${photoHTML(item)}</button>`).join("") : "";
  $$("[data-profile-photo]").forEach(btn=>btn.addEventListener("click",()=>openViewer(id,Number(btn.dataset.profilePhoto),"profile")));
  $("#profileAvatar").onclick=()=>openProfileImageViewer(id,"profile");
  const heartBtn=$("#profileHeartBtn");
  if(heartBtn) heartBtn.onclick=()=>showToast("프로필을 소장했어요.");
  const moreBtn=$("#profileMoreBtn");
  if(moreBtn) moreBtn.onclick=()=>{renderChannelInfo(id);showScreen("channelInfoScreen");};
}

function openGallery(id,returnTo="info"){
  currentRoomId=id; galleryReturn=returnTo; const room=getRoom(id), items=galleryItems[id]||galleryItems.lulu;
  $("#galleryRoomTitle").textContent=room.title;
  $("#galleryGrid").innerHTML=items.map((item,i)=>`<button class="gallery-item" data-gallery-index="${i}" type="button">${photoHTML(item)}<div class="gallery-meta"><span class="gallery-chip">${item.type==="video"?"VIDEO":"PHOTO"}</span><span class="gallery-like">❤︎</span></div></button>`).join("");
  $$("[data-gallery-index]").forEach(btn=>btn.addEventListener("click",()=>openViewer(id,Number(btn.dataset.galleryIndex),"gallery")));
  showScreen("galleryScreen");
}

function openViewer(id,index,returnTo="gallery"){
  if(id==="__myProfileCore"){
    currentRoomId=id; currentGalleryIndex=index; viewerReturn=returnTo;
    fromMyProfileViewer=false;
    const items=galleryItems.__myProfileCore||[];
    const item=items[index]||items[0];
    if(!item) return;
    $("#viewerMember").textContent=returnTo==="mySavedGallery" ? "소장 사진" : "율";
    $("#viewerDate").textContent=returnTo==="mySavedGallery" ? `소장 사진 · ${item.date||""}` : "내 루미 프로필 · LB-0002";
    $("#viewerPhotoImg").src=item.src;
    $("#viewerCaption").textContent=item.caption||"내 루미 프로필";
    $("#viewerIndex").textContent=`${index+1} / ${items.length}`;
    $("#photoViewerScreen").classList.remove("ui-hidden");
    showScreen("photoViewerScreen");
    return;
  }
  currentRoomId=id; currentGalleryIndex=index; viewerReturn=returnTo;
  const room=getRoom(id), items=galleryItems[id]||galleryItems.lulu, item=items[index]||items[0];
  $("#viewerMember").textContent=room.short;
  $("#viewerDate").textContent=`${item.date} · ${room.mark}`;
  $("#viewerPhotoImg").src=item.src;
  $("#viewerCaption").textContent=item.caption;
  $("#viewerIndex").textContent=`${index+1} / ${items.length}`;
  $("#photoViewerScreen").classList.remove("ui-hidden");
  showScreen("photoViewerScreen");
}

function openProfileImageViewer(id, returnTo="profile"){
  const room=getRoom(id);
  const src=room.profile || (galleryItems[id] && galleryItems[id][0] && galleryItems[id][0].src) || (galleryItems.lulu && galleryItems.lulu[1].src);
  const oldItems=galleryItems[id] || [];
  const tempItem={src, caption:`${room.short} 프로필 사진`, type:"photo", date:"프로필 사진"};
  galleryItems.__profile=[tempItem, ...oldItems];
  const backupId=currentRoomId;
  currentRoomId="__profile";
  currentGalleryIndex=0;
  viewerReturn=returnTo;
  $("#viewerMember").textContent=room.short;
  $("#viewerDate").textContent=`프로필 사진 · ${room.mark}`;
  $("#viewerPhotoImg").src=src;
  $("#viewerCaption").textContent=`${room.short} 프로필 사진`;
  $("#viewerIndex").textContent=`1 / ${galleryItems.__profile.length}`;
  $("#photoViewerScreen").classList.remove("ui-hidden");
  showScreen("photoViewerScreen");
  currentRoomId=id;
}


function openMyViewer(items,index=0,returnTo="myProfile"){
  myViewerItems = Array.isArray(items) && items.length ? items : [{src:"./assets/lulu_cover.png", caption:"내 루미 프로필", type:"photo", date:"내 프로필"}];
  myViewerIndex = Math.max(0, Math.min(Number(index)||0, myViewerItems.length-1));
  viewerReturn = returnTo;
  fromMyProfileViewer = true;

  const item = myViewerItems[myViewerIndex] || myViewerItems[0];
  $("#viewerMember").textContent = returnTo === "mySavedGallery" ? "소장 사진" : "율";
  $("#viewerDate").textContent = returnTo === "mySavedGallery" ? `소장 사진 · ${item.date || ""}` : "내 루미 프로필 · LB-0002";
  $("#viewerPhotoImg").src = item.src;
  $("#viewerCaption").textContent = item.caption || "내 루미 프로필";
  $("#viewerIndex").textContent = `${myViewerIndex+1} / ${myViewerItems.length}`;
  $("#photoViewerScreen").classList.remove("ui-hidden");
  showScreen("photoViewerScreen");
}

function moveMyViewer(dir){
  if(!myViewerItems || !myViewerItems.length){
    myViewerItems = [{src:$("#viewerPhotoImg")?.src || "./assets/lulu_cover.png", caption:$("#viewerCaption")?.textContent || "내 루미 프로필", type:"photo", date:"내 프로필"}];
    myViewerIndex = 0;
  }
  myViewerIndex = (myViewerIndex + dir + myViewerItems.length) % myViewerItems.length;
  const item = myViewerItems[myViewerIndex] || myViewerItems[0];
  $("#viewerPhotoImg").src = item.src;
  $("#viewerCaption").textContent = item.caption || "내 루미 프로필";
  $("#viewerIndex").textContent = `${myViewerIndex+1} / ${myViewerItems.length}`;
  if(viewerReturn === "mySavedGallery"){
    $("#viewerMember").textContent = "소장 사진";
    $("#viewerDate").textContent = `소장 사진 · ${item.date || ""}`;
  }else{
    $("#viewerMember").textContent = "율";
    $("#viewerDate").textContent = "내 루미 프로필 · LB-0002";
  }
}

function moveViewer(dir){
  if(currentRoomId==="__myProfileCore"){
    const items=galleryItems.__myProfileCore||[];
    if(!items.length) return;
    currentGalleryIndex=(currentGalleryIndex+dir+items.length)%items.length;
    openViewer("__myProfileCore",currentGalleryIndex,viewerReturn);
    return;
  }
  if(viewerReturn==="myProfile" || viewerReturn==="mySavedGallery" || fromMyProfileViewer){
    moveMyViewer(dir);
    return;
  }
  const items=galleryItems[currentRoomId]||galleryItems.lulu;
  currentGalleryIndex=(currentGalleryIndex+dir+items.length)%items.length;
  openViewer(currentRoomId,currentGalleryIndex,viewerReturn);
}

function backFromViewer(){
  if(currentRoomId==="__myProfileCore"){openMyProfile();return;}
  if(viewerReturn==="room"){renderRoom(currentRoomId);showScreen("roomScreen");return;}
  if(viewerReturn==="join"){renderJoin(currentRoomId);showScreen("joinScreen");return;}
  if(viewerReturn==="join-profile"){renderProfile(currentRoomId);showScreen("profileScreen");return;}
  if(viewerReturn==="info"){renderChannelInfo(currentRoomId);showScreen("channelInfoScreen");return;}
  if(viewerReturn==="profile"){renderProfile(currentRoomId);showScreen("profileScreen");return;}
  if(viewerReturn==="myProfile"){fromMyProfileViewer=false;openMyProfile();return;}
  if(viewerReturn==="mySavedGallery"){showScreen("mySavedGalleryScreen");return;}
  openGallery(currentRoomId);
}

function renderSearchResults(queryOverride){
  const input=$("#lumiTalkSearchInput");
  const resultsEl=$("#searchResults");
  const quick=$("#lumiTalkSearchQuick");
  if(!resultsEl) return;

  const lang = (window.LUMI_LANG || window.currentLang || new URLSearchParams(location.search).get("lang") || "ko").toLowerCase();
  const normalizedLang = lang==="kr" ? "ko" : lang;
  const q = String(queryOverride ?? input?.value ?? "").trim().toLowerCase();
  const activeFilter = document.querySelector("[data-search-filter].active")?.dataset.searchFilter || "all";

  const pickText=(item)=>{
    if(!item) return "";
    if(typeof item==="string") return item;
    return item[normalizedLang] || item.ko || item.en || item.ja || item.zh || "";
  };

  const roomTitle=(room)=>{
    if(!room) return "";
    if(room.titleI18n) return pickText(room.titleI18n);
    return room.title || room.short || "";
  };

  const roomSub=(room)=>{
    if(!room) return "";
    if(room.subI18n) return pickText(room.subI18n);
    return room.sub || room.profileSub || "";
  };

  const messageText=(message)=>{
    if(!message) return "";
    if(message.textI18n) return pickText(message.textI18n);
    return message.text || "";
  };

  const resultItems=[];

  if(typeof rooms!=="undefined"){
    Object.keys(rooms).forEach((id)=>{
      const room=rooms[id];
      const title=roomTitle(room);
      const sub=roomSub(room);
      const haystack=`${title} ${sub} ${room.short||""}`.toLowerCase();
      if(q && haystack.includes(q)){
        resultItems.push({type:"channel", id, title, body:sub || "채널 프로필로 이동", badge:"채널"});
      }
    });
  }

  if(typeof rooms!=="undefined"){
    Object.keys(rooms).forEach((id)=>{
      const room=rooms[id];
      (room.messages||[]).forEach((m)=>{
        if(!m || !m.text || m.type==="date") return;
        const text=messageText(m);
        if(!text) return;
        if(q && text.toLowerCase().includes(q)){
          resultItems.push({type:"message", id, title:roomTitle(room), body:text, badge:"메시지"});
        }
      });
    });
  }

  const savedMock=[
    {id:"lulu", title:{ko:"루루의 포근포근 토끼굴",en:"LULU's Cozy Bunny Den",ja:"ルルのぽかぽかうさぎ穴",zh:"LULU的暖暖兔子洞"}, text:{ko:"오늘 와줘서 루루 진짜 힘났어... 다음엔 더 열심히 할게...!",en:"Seeing you today gave LULU so much strength.",ja:"今日来てくれてルル、本当に元気をもらったよ…",zh:"今天你来见我，LULU真的得到了很多力量。"}},
    {id:"mari", title:{ko:"링링의 별빛톡",en:"Ringring's Starlight Talk",ja:"リンリンの星明かりトーク",zh:"Ringring的星光聊天"}, text:{ko:"네가 있어서 오늘 무대도 더 반짝일 수 있었어.",en:"Because you were there, today’s stage shined brighter.",ja:"君がいてくれたから、今日のステージももっと輝けたよ。",zh:"因为有你在，今天的舞台也更加闪耀。"}},
    {id:"lumibelle", title:{ko:"루미벨 반짝채널",en:"Lumibelle Sparkle Channel",ja:"ルミベルきらめきチャンネル",zh:"Lumibelle闪耀频道"}, text:{ko:"작은 점들이 모여 반짝이는 선이 되는 순간을 함께 기록해요.",en:"Let’s record the moment tiny points become a sparkling line.",ja:"小さな点が集まって、きらめく線になる瞬間を一緒に記録しよう。",zh:"一起记录小小的点连成闪耀线条的瞬间。"}}
  ];

  savedMock.forEach((item)=>{
    const title=pickText(item.title);
    const text=pickText(item.text);
    const haystack=`${title} ${text}`.toLowerCase();
    if(q && haystack.includes(q)){
      resultItems.push({type:"saved", id:item.id, title, body:text, badge:"소장함"});
    }
  });

  const filtered=resultItems.filter((item)=>activeFilter==="all" || item.type===activeFilter);

  if(quick) quick.style.display = q ? "none" : "block";

  if(!q){
    resultsEl.innerHTML='<div class="search-empty">검색어를 입력하면 채널, 메시지, 소장함을 함께 찾아요.</div>';
    return;
  }

  if(!filtered.length){
    resultsEl.innerHTML=`<div class="search-empty">“${q}”에 대한 검색 결과가 없어요.</div>`;
    return;
  }

  resultsEl.innerHTML=filtered.slice(0,20).map((item)=>`
    <button class="search-result-card" type="button" data-search-result="${item.type}" data-search-room="${item.id}">
      <span class="search-result-badge ${item.type}">${item.badge}</span>
      <b>${item.title}</b>
      <p>${item.body}</p>
    </button>
  `).join("");

  resultsEl.querySelectorAll("[data-search-result]").forEach((card)=>{
    card.addEventListener("click",()=>{
      const type=card.dataset.searchResult;
      const roomId=card.dataset.searchRoom;
      $("#searchSheet")?.classList.add("hidden");
      if(type==="channel" && typeof renderProfile==="function"){
        renderProfile(roomId);
        showScreen("profileScreen");
        return;
      }
      if(type==="message" && typeof renderRoom==="function"){
        renderRoom(roomId);
        showScreen("roomScreen");
        return;
      }
      if(type==="saved"){
        if(typeof renderSavedList==="function") renderSavedList();
        $("#savedSheet")?.classList.remove("hidden");
        return;
      }
    });
  });
}
function renderSavedList(){
  const list=$("#savedList");
  if(!list) return;

  const joined = channels.filter(c => c.type !== "help" && (c.status === "joined" || c.status === "muted"));

  const savedByChannel = {
    lulu: [
      {kind:"멤버 메시지", text:"오늘 와줘서 루루 진짜 힘났어... 다음엔 더 열심히 할게...!", date:"2026.05.22"},
      {kind:"멤버 메시지", text:"루루는 항상 기다리고 있었어... 다시 와줘서 너무 고마워.", date:"2026.05.23"}
    ],
    mari: [
      {kind:"멤버 메시지", text:"네가 있어서 오늘 무대도 더 반짝일 수 있었어.", date:"2026.05.22"}
    ],
    lumibelle: [
      {kind:"공식 메시지", text:"작은 점들이 모여 반짝이는 선이 되는 순간을 함께 기록해요.", date:"2026.05.20"}
    ]
  };

  const available = joined
    .map(c => {
      const room = getRoom(c.id);
      const items = savedByChannel[c.id] || [];
      return {id:c.id, room, items};
    })
    .filter(x => x.items.length > 0);

  if(!available.length){
    list.innerHTML = `
      <div class="saved-shell">
        <p class="saved-intro">다시 보고 싶은 루미톡 메시지를 모아두는 곳이에요.</p>
        <div class="saved-empty">아직 소장한 메시지가 없어요.</div>
      </div>`;
    return;
  }

  list.innerHTML = `
    <div class="saved-shell" data-saved-view="channels">
      <p class="saved-intro">다시 보고 싶은 루미톡 메시지를 채널별로 모아뒀어요.</p>
      <div class="saved-channel-list">
        ${available.map(({id,room,items})=>`
          <button class="saved-channel-card" type="button" data-saved-channel="${id}">
            <span class="saved-channel-icon">${room.avatar || "✦"}</span>
            <span class="saved-channel-main">
              <b>${room.title}</b>
              <small>소장 메시지 ${items.length}개 · 최근 ${items[0].date}</small>
              <span class="saved-channel-preview">“${items[0].text}”</span>
            </span>
            <em>›</em>
          </button>
        `).join("")}
      </div>
      <p class="saved-note">사진과 영상은 내 프로필의 채널별 앨범에서 볼 수 있어요.</p>
    </div>`;

  list.querySelectorAll("[data-saved-channel]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      renderSavedChannelDetail(btn.dataset.savedChannel, savedByChannel);
    });
  });
}
function renderSavedChannelDetail(channelId, savedByChannel){
  const list=$("#savedList");
  if(!list) return;

  const room=getRoom(channelId);
  const items=(savedByChannel && savedByChannel[channelId]) || [];

  list.innerHTML = `
    <div class="saved-shell" data-saved-view="detail">
      <button class="saved-back" type="button" data-saved-back>‹ 소장함</button>
      <div class="saved-detail-head">
        <span class="saved-channel-icon">${room.avatar || "✦"}</span>
        <span>
          <b>${room.title}</b>
          <small>소장 메시지 ${items.length}개 · 다시 보고 싶은 말을 모아뒀어요.</small>
        </span>
      </div>

      <div class="saved-filter-row">
        <button class="active" type="button">전체</button>
        <button type="button">멤버 메시지</button>
        <button type="button">공식 메시지</button>
      </div>

      <div class="saved-message-list">
        ${items.map(item=>`
          <article class="saved-message-card">
            <div class="saved-message-meta">
              <b>${room.short || room.title}</b>
              <span>${item.kind}</span>
            </div>
            <p>${item.text}</p>
            <small>${item.date} · 소장</small>
          </article>
        `).join("")}
      </div>

      <p class="saved-note">사진과 영상은 내 프로필의 채널별 앨범에서 볼 수 있어요.</p>
    </div>`;

  const back=list.querySelector("[data-saved-back]");
  if(back) back.onclick=renderSavedList;
}

function showToast(text){
  const old=$(".toast"); if(old)old.remove();
  const toast=document.createElement("div"); toast.className="toast"; toast.textContent=text; $("#app").appendChild(toast);
  setTimeout(()=>toast.remove(),1800);
}

function bindEvents(){
  $("#roomBackBtn").onclick=()=>showScreen("listScreen");
  $("#roomProfileBtn").onclick=()=>{renderProfile(currentRoomId);showScreen("profileScreen");};
  $("#roomMenuBtn").onclick=()=>{renderChannelInfo(currentRoomId);showScreen("channelInfoScreen");};
  $("#infoBackBtn").onclick=()=>{renderRoom(currentRoomId);showScreen("roomScreen");};
  $("#infoSettingBtn").onclick=()=>{renderChatSetting(currentRoomId);showScreen("chatSettingScreen");};
  $("#infoMuteBtn").onclick=()=>{toggleMute();renderChannelInfo(currentRoomId);};
  $("#infoMuteRowBtn").onclick=()=>{toggleMute();renderChannelInfo(currentRoomId);};
  $("#infoSavedBtn").onclick=()=>{$("#savedSheet").classList.remove("hidden");renderSavedList();};
  $("#infoSavedRowBtn").onclick=()=>{$("#savedSheet").classList.remove("hidden");renderSavedList();};
  $("#infoProfileRowBtn").onclick=()=>{renderProfile(currentRoomId);showScreen("profileScreen");};
  $("#openGalleryTitleBtn").onclick=()=>{ const items=galleryItems[currentRoomId]||[]; if(!items.length){showToast("아직 모아볼 사진이 없어요."); return;} openGallery(currentRoomId); };
  $("#infoLeaveBtn").onclick=()=>{$("#leaveTitle").textContent=`${getRoom(currentRoomId).title}을 나갈까요?`;$("#leaveConfirmSheet").classList.remove("hidden");};
  $("#settingBackBtn").onclick=()=>{renderChannelInfo(currentRoomId);showScreen("channelInfoScreen");};
  $("#editDisplayNameBtn").onclick=()=>{
    const room=getRoom(currentRoomId);
    const current=getDisplayName(currentRoomId);
    const next=prompt("나에게만 보이는 채널 이름을 입력해 주세요.", current);
    if(next===null) return;
    const clean=next.trim();
    if(!clean){ localStorage.removeItem(`lumitalkName:${currentRoomId}`); }
    else{ localStorage.setItem(`lumitalkName:${currentRoomId}`, clean); }
    renderChatSetting(currentRoomId);
    renderChannelInfo(currentRoomId);
    renderRoom(currentRoomId);
    showToast("표시 이름을 저장했어요.");
  };
  $("#backgroundBtn").onclick=()=>showToast("루미톡 배경 설정은 다음 패치에서 열릴 예정이에요.");
  $("#homeAddBtn").onclick=()=>$("#homeAddSheet").classList.remove("hidden");
  $("#settingMuteBtn").onclick=()=>{toggleMute();renderChatSetting(currentRoomId);};
  $("#settingLeaveBtn").onclick=()=>{$("#leaveTitle").textContent=`${getRoom(currentRoomId).title}을 나갈까요?`;$("#leaveConfirmSheet").classList.remove("hidden");};
  $("#joinBackBtn").onclick=(e)=>{e.stopPropagation();showScreen("listScreen");};
  $("#joinHeartBtn").onclick=(e)=>{e.stopPropagation();renderProfile(currentRoomId);showScreen("profileScreen");};
  // joinAvatar 클릭 → 프로필 이미지 뷰어
  $("#joinAvatar").onclick=(e)=>{e.stopPropagation();openProfileImageViewer(currentRoomId,"join");};
  $("#joinChannelBtn").onclick=joinCurrentChannel;
  $("#profileBackBtn").onclick=()=>showScreen("listScreen");
  $("#goChatBtn").onclick=()=>openChannel(currentRoomId);
  $("#profilePhotoBtn").onclick=()=>openGallery(currentRoomId,"profile");
  $("#galleryBackBtn").onclick=()=>{ if(galleryReturn==="profile"){renderProfile(currentRoomId);showScreen("profileScreen");}else{renderChannelInfo(currentRoomId);showScreen("channelInfoScreen");} };
  $("#viewerBackBtn").onclick=backFromViewer;
  $("#viewerGalleryBtn").onclick=()=>{
    if(viewerReturn==="myProfile" || fromMyProfileViewer){openMySavedGallery(currentRoomId||"lulu");return;}
    if(viewerReturn==="mySavedGallery"){showScreen("mySavedGalleryScreen");return;}
    openGallery(currentRoomId,galleryReturn);
  };
  $("#viewerPrevBtn").onclick=()=>moveViewer(-1);
  $("#viewerNextBtn").onclick=()=>moveViewer(1);
  $("#viewerBody").onclick=(e)=>{if(e.target.closest(".viewer-arrow")||e.target.closest(".viewer-footer")||e.target.closest("#viewerBackBtn"))return;$("#photoViewerScreen").classList.toggle("ui-hidden");};
  $("#savePhotoBtn").onclick=()=>showToast("루미톡 사진이 저장되었어요.");
  $("#keepPhotoBtn").onclick=()=>showToast("소장함에 담았어요.");
  $("#morePhotoBtn").onclick=()=>showToast("더보기는 다음 단계에서 열릴 예정이에요.");
  $("#searchBtn").onclick=()=>{
    $("#searchSheet").classList.remove("hidden");
    renderSearchResults("");
    setTimeout(()=>$("#lumiTalkSearchInput")?.focus(),80);
  };
  $("#savedBtn").onclick=()=>{renderSavedList();$("#savedSheet").classList.remove("hidden");};
  $("#myProfileBtn").onclick=openMyProfile;
  $$(".sheet-close").forEach(b=>b.onclick=closeSheets);
  $$("[data-close-leave]").forEach(b=>b.onclick=()=>$("#leaveConfirmSheet").classList.add("hidden"));
  $("#confirmLeaveBtn").onclick=leaveCurrentChannel;
  $$("[data-close-homeadd]").forEach(b=>b.onclick=()=>$("#homeAddSheet").classList.add("hidden"));
  $("#confirmHomeAddBtn").onclick=()=>{$("#homeAddSheet").classList.add("hidden");showToast("홈 화면 추가 안내를 열었어요.");};

  const viewer=$("#photoViewerScreen");
  viewer.addEventListener("touchstart",e=>{touchStartX=e.changedTouches[0].clientX;},{passive:true});
  viewer.addEventListener("touchend",e=>{
    const dx=e.changedTouches[0].clientX-touchStartX;
    if(Math.abs(dx)>45) moveViewer(dx<0?1:-1);
  },{passive:true});
  document.addEventListener("keydown",e=>{
    if($("#photoViewerScreen").classList.contains("hidden"))return;
    if(e.key==="ArrowRight")moveViewer(1);
    if(e.key==="ArrowLeft")moveViewer(-1);
    if(e.key==="Escape")backFromViewer();
  });
}

/* ── 내 프로필 ── */
const mySavedItems = {
  lulu: [
    {src:"./assets/lulu_cover.png", caption:"루루 소장 사진", type:"photo", date:"2026.05.22"},
    {src:"./assets/lulu_sd.png", caption:"루루 SD", type:"photo", date:"2026.05.22"},
    {src:"./assets/lulu_spring.png", caption:"봄날의 루루", type:"photo", date:"2026.05.22"}
  ],
  mari: [
    {src:"./assets/mariring_cover.webp", caption:"링링 소장 사진", type:"photo", date:"2026.05.22"},
    {src:"./assets/mariring_sd.png", caption:"링링 SD", type:"photo", date:"2026.05.22"}
  ]
};

function openMyProfile(){
  showScreen("myProfileSheet");
  renderMySavedSections();
  // 히어로 탭 — 매번 새로 바인딩 (onclick 덮어쓰기로 중복 방지)
  const heroTap=$("#myHeroTapBtn");
  if(heroTap) heroTap.onclick=(e)=>{
    e.stopPropagation();
    e.preventDefault();
    openMyViewer([{src:"./assets/lulu_cover.png", caption:"내 루미 프로필 배경", type:"photo", date:"내 프로필"}], 0, "myProfile");
  };
  bindMyProfileEvents();
}

function renderMySavedSections(){
  // 오시 설정된 멤버 ID (rooms에서 오시 채널)
  const oshiId = "lulu"; // 율의 오시: 루루

  // 표시할 멤버: 채널 추가(joined/muted)한 멤버 + 오시
  const visibleMembers = channels
    .filter(c => c.type === "member" && (c.status === "joined" || c.status === "muted" || c.id === oshiId))
    .filter(c => mySavedItems[c.id] && mySavedItems[c.id].length > 0)
    .map(c => c.id);

  // 중복 제거
  const memberIds = [...new Set([oshiId, ...visibleMembers])].filter(id => mySavedItems[id]);

  const container = $("#mySavedSections");
  if(!container) return;

  container.innerHTML = memberIds.map(memberId => {
    const room = getRoom(memberId);
    const items = mySavedItems[memberId] || [];
    const thumbs = items.slice(0,3).map((item, i) =>
      `<button class="my-saved-thumb" data-my-photo="${i}" data-member="${memberId}" type="button">
        <img src="${item.src}" alt="소장 사진" />
      </button>`
    ).join("");
    return `
      <div class="my-saved-section">
        <div class="my-saved-header">
          <span class="my-saved-member-name">${room.avatar} ${room.title}</span>
          <button class="my-saved-more" data-member-gallery="${memberId}" type="button">더보기 ›</button>
        </div>
        <div class="my-saved-grid">${thumbs}</div>
      </div>`;
  }).join("");
}

function bindMyProfileEvents(){
  // 뒤로가기 - 시트만 닫기
  const closeBtn=$("#myProfileCloseBtn");
  if(closeBtn) closeBtn.onclick=()=>showScreen("listScreen");

  const heartBtn=$("#myHeartBtn");
  if(heartBtn) heartBtn.onclick=()=>{renderSavedList();$("#savedSheet").classList.remove("hidden");};

  const moreBtn=$("#myMoreBtn");
  if(moreBtn) moreBtn.onclick=(e)=>{e.stopPropagation();$("#myMoreSheet").classList.remove("hidden");};

  const moreDim=$("#myMoreDim");
  if(moreDim) moreDim.onclick=()=>$("#myMoreSheet").classList.add("hidden");

  const editName=$("#editNameBtn");
  if(editName) editName.onclick=()=>{
    $("#myMoreSheet").classList.add("hidden");
    const cur=localStorage.getItem("myDisplayName")||"율";
    const next=prompt("표시 이름을 입력해 주세요.", cur);
    if(next===null) return;
    const clean=next.trim()||"율";
    localStorage.setItem("myDisplayName", clean);
    $$("#myProfileSheet .profile-name").forEach(el=>el.textContent=clean);
    $(".my-profile-card-name").textContent=clean;
    showToast("표시 이름을 저장했어요.");
  };

  const editStatus=$("#editStatusBtn");
  if(editStatus) editStatus.onclick=()=>{
    $("#myMoreSheet").classList.add("hidden");
    const cur=$("#myStatusMsg")?.textContent||"별빛톡 · 펼쳐지는 세상에 마법을 걸어줄게";
    const next=prompt("상태 메시지를 입력해 주세요.", cur);
    if(next===null) return;
    if($("#myStatusMsg")) $("#myStatusMsg").textContent=next.trim()||cur;
    showToast("상태 메시지를 저장했어요.");
  };

  const editProfile=$("#editProfileBtn");
  if(editProfile) editProfile.onclick=()=>{
    $("#myMoreSheet").classList.add("hidden");
    $("#myProfileEditSheet")?.classList.remove("hidden");
  };

  const editProfileDim=$("#myProfileEditDim");
  if(editProfileDim) editProfileDim.onclick=()=>$("#myProfileEditSheet")?.classList.add("hidden");

  const editProfilePhoto=$("#editProfilePhotoBtn");
  if(editProfilePhoto) editProfilePhoto.onclick=()=>{
    $("#myProfileEditSheet")?.classList.add("hidden");
    showToast("프로필 사진 바꾸기는 다음 단계에서 연결할게요.");
  };

  const editHeaderPhoto=$("#editHeaderPhotoBtn");
  if(editHeaderPhoto) editHeaderPhoto.onclick=()=>{
    $("#myProfileEditSheet")?.classList.add("hidden");
    showToast("헤더 배경 바꾸기는 다음 단계에서 연결할게요.");
  };

  // 이벤트 위임 — 동적 DOM 문제 근본 해결
  const savedSections=$("#mySavedSections");
  if(savedSections){
    savedSections.onclick=(e)=>{
      const thumb=e.target.closest("[data-my-photo]");
      const more=e.target.closest("[data-member-gallery]");
      if(thumb){
        const member=thumb.dataset.member||"lulu";
        const idx=Number(thumb.dataset.myPhoto||0);
        const items=mySavedItems[member]||mySavedItems.lulu;
        openMyViewer(items, idx, "myProfile");
      } else if(more){
        openMySavedGallery(more.dataset.memberGallery);
      }
    };
  }
}

function openMySavedGallery(memberId){
  const room=getRoom(memberId);
  const items=mySavedItems[memberId]||[];
  $("#mySavedGalleryTitle").textContent=`${room.short}의 소장 사진`;
  $("#mySavedGalleryGrid").innerHTML=items.map((item,i)=>
    `<button class="gallery-item" data-saved-index="${i}" data-saved-member="${memberId}" type="button">
      <img src="${item.src}" alt="소장 사진" />
      <div class="gallery-meta"><span class="gallery-chip">PHOTO</span><span class="gallery-like">❤︎</span></div>
    </button>`
  ).join("");
  $$("[data-saved-index]").forEach(btn=>{
    btn.onclick=()=>{
      const idx=Number(btn.dataset.savedIndex);
      const mid=btn.dataset.savedMember;
      const items2=mySavedItems[mid]||[];
      openMyViewer(items2, idx, "mySavedGallery");
    };
  });
  showScreen("mySavedGalleryScreen");
}

// 갤러리 뒤로가기 → 내 프로필로
$("#mySavedGalleryBack").onclick=()=>openMyProfile();


renderChannels();
renderRoom(currentRoomId);
bindEvents();




/* Patch 26c — clean mobile stability */
(function(){
  function patch26cMakeVirtualGallery(items){
    if(typeof galleryItems==="undefined" || !Array.isArray(items) || !items.length) return false;
    galleryItems.__myProfileCore=items.map((item)=>({
      src:item.src,
      caption:item.caption || item.title || "내 루미 프로필",
      type:item.type || "photo",
      date:item.date || "내 프로필"
    }));
    return true;
  }

  function patch26cOpenCore(items,index,returnTo){
    if(!patch26cMakeVirtualGallery(items)) return;
    if(typeof openViewer==="function") openViewer("__myProfileCore",Number(index)||0,returnTo || "myProfile");
  }

  function patch26cHeroItems(){
    return [
      {src:"./assets/lulu_cover.png", caption:"내 루미 프로필 배경", type:"photo", date:"내 프로필"},
      {src:"./assets/lulu_sd.png", caption:"내 루미 프로필 사진", type:"photo", date:"내 프로필"},
      {src:"./assets/lulu_spring.png", caption:"내 루미 프로필 후보", type:"photo", date:"내 프로필"}
    ];
  }

  function patch26cBind(){
    const heroTap=document.getElementById("myHeroTapBtn");
    if(heroTap && !heroTap.__patch26cBound){
      heroTap.addEventListener("click",(event)=>{
        event.preventDefault();
        event.stopPropagation();
        if(event.stopImmediatePropagation) event.stopImmediatePropagation();
        patch26cOpenCore(patch26cHeroItems(),0,"myProfile");
      },true);
      heroTap.__patch26cBound=true;
    }

    const savedSections=document.getElementById("mySavedSections");
    if(savedSections && !savedSections.__patch26cBound){
      savedSections.addEventListener("click",(event)=>{
        const thumb=event.target.closest("[data-my-photo]");
        if(!thumb) return;
        const member=thumb.dataset.member || "lulu";
        const idx=Number(thumb.dataset.myPhoto || 0);
        const items=(typeof mySavedItems!=="undefined" && mySavedItems[member]) ? mySavedItems[member] : null;
        if(!items || !items.length) return;

        event.preventDefault();
        event.stopPropagation();
        if(event.stopImmediatePropagation) event.stopImmediatePropagation();
        patch26cOpenCore(items,idx,"myProfile");
      },true);
      savedSections.__patch26cBound=true;
    }
  }

  const originalOpenMyProfile=window.openMyProfile;
  if(typeof originalOpenMyProfile==="function" && !window.__patch26cOpenMyProfileWrapped){
    window.openMyProfile=function(){
      const result=originalOpenMyProfile.apply(this,arguments);
      setTimeout(patch26cBind,0);
      return result;
    };
    window.__patch26cOpenMyProfileWrapped=true;
  }

  document.addEventListener("DOMContentLoaded",patch26cBind);
  setTimeout(patch26cBind,0);
  setTimeout(patch26cBind,350);
})();



/* LUMITALK V1 LOCK FROM 26C — search, saved, photo title */
(function(){
  function bindLumiTalkSearch(){
    const input=document.getElementById("lumiTalkSearchInput");
    const clear=document.getElementById("lumiTalkSearchClear");
    const filters=document.getElementById("lumiTalkSearchFilters");
    const quick=document.getElementById("lumiTalkSearchQuick");

    if(input && !input.__lockSearchBound){
      input.addEventListener("input",()=>renderSearchResults());
      input.__lockSearchBound=true;
    }

    if(clear && !clear.__lockSearchBound){
      clear.addEventListener("click",()=>{
        if(input) input.value="";
        renderSearchResults("");
        setTimeout(()=>input?.focus(),30);
      });
      clear.__lockSearchBound=true;
    }

    if(filters && !filters.__lockSearchBound){
      filters.addEventListener("click",(event)=>{
        const btn=event.target.closest("[data-search-filter]");
        if(!btn) return;
        filters.querySelectorAll("[data-search-filter]").forEach((el)=>el.classList.remove("active"));
        btn.classList.add("active");
        renderSearchResults();
      });
      filters.__lockSearchBound=true;
    }

    if(quick && !quick.__lockSearchBound){
      quick.addEventListener("click",(event)=>{
        const btn=event.target.closest("[data-search-word]");
        if(!btn || !input) return;
        input.value=btn.dataset.searchWord || "";
        renderSearchResults();
      });
      quick.__lockSearchBound=true;
    }
  }

  function isSavedDetailView(){
    const list=document.getElementById("savedList");
    const shell=list ? list.querySelector(".saved-shell") : null;
    return !!(shell && shell.dataset && shell.dataset.savedView==="detail");
  }

  function bindSavedBackFlow(){
    const savedSheet=document.getElementById("savedSheet");
    if(!savedSheet || savedSheet.__lockSavedBackBound) return;

    const topBack=savedSheet.querySelector(".sheet-close");
    if(topBack){
      topBack.addEventListener("click",(event)=>{
        if(!isSavedDetailView()) return;
        event.preventDefault();
        event.stopPropagation();
        if(event.stopImmediatePropagation) event.stopImmediatePropagation();
        if(typeof renderSavedList==="function") renderSavedList();
      },true);
    }

    savedSheet.__lockSavedBackBound=true;
  }

  function fixMyPhotoTitle(){
    const title=document.getElementById("mySavedGalleryTitle");
    if(!title) return;
    const gallery=document.getElementById("mySavedGalleryScreen");
    if(gallery && !gallery.classList.contains("hidden")){
      title.textContent="내 사진 모음";
    }
  }

  const originalOpenMySavedGallery=window.openMySavedGallery;
  if(typeof originalOpenMySavedGallery==="function" && !window.__lockOpenMySavedGalleryWrapped){
    window.openMySavedGallery=function(memberId){
      const result=originalOpenMySavedGallery.apply(this,arguments);
      setTimeout(fixMyPhotoTitle,0);
      return result;
    };
    window.__lockOpenMySavedGalleryWrapped=true;
  }

  function bootLockCandidate(){
    bindLumiTalkSearch();
    bindSavedBackFlow();
  }

  document.addEventListener("DOMContentLoaded",bootLockCandidate);
  setTimeout(bootLockCandidate,0);
})();
