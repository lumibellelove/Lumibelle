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
  $("#profileAvatar").innerHTML=memberAvatarHTML(room);
  $("#profileName").textContent=room.short;
  $("#profileSub").textContent=room.profileSub;
  $("#goChatBtn").textContent=room.talkButton;
  $("#profilePhotoBtn").textContent=room.photoTitle;
  $("#profilePhotoTitle").textContent=room.photoTitle;
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

function openGallery(id){
  currentRoomId=id; const room=getRoom(id), items=galleryItems[id]||galleryItems.lulu;
  $("#galleryRoomTitle").textContent=room.title;
  $("#galleryGrid").innerHTML=items.map((item,i)=>`<button class="gallery-item" data-gallery-index="${i}" type="button">${photoHTML(item)}<div class="gallery-meta"><span class="gallery-chip">${item.type==="video"?"VIDEO":"PHOTO"}</span><span class="gallery-like">❤︎</span></div></button>`).join("");
  $$("[data-gallery-index]").forEach(btn=>btn.addEventListener("click",()=>openViewer(id,Number(btn.dataset.galleryIndex),"gallery")));
  showScreen("galleryScreen");
}

function openViewer(id,index,returnTo="gallery"){
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

function moveViewer(dir){
  const items=galleryItems[currentRoomId]||galleryItems.lulu;
  currentGalleryIndex=(currentGalleryIndex+dir+items.length)%items.length;
  openViewer(currentRoomId,currentGalleryIndex,viewerReturn);
}

function backFromViewer(){
  if(viewerReturn==="room"){renderRoom(currentRoomId);showScreen("roomScreen");return;}
  if(viewerReturn==="join"){renderJoin(currentRoomId);showScreen("joinScreen");return;}
  if(viewerReturn==="join-profile"){renderProfile(currentRoomId);showScreen("profileScreen");return;}
  if(viewerReturn==="info"){renderChannelInfo(currentRoomId);showScreen("channelInfoScreen");return;}
  if(viewerReturn==="profile"){renderProfile(currentRoomId);showScreen("profileScreen");return;}
  openGallery(currentRoomId);
}

function renderSearchResults(){
  const results=[["루루의 포근포근 토끼굴","오늘 와줘서 루루 진짜 힘났어…"],["소장한 메시지","우리 같이 천천히 가자 🐰🍀"],["운영팀 문의하기","예매, 입금, 굿즈, 오류 문의를 남길 수 있어요."]];
  $("#searchResults").innerHTML=results.map(([t,x])=>`<div class="result-card"><b>${t}</b><p>${x}</p></div>`).join("");
}
function renderSavedList(){
  const saved=[["루루 · LUMI LETTER","넘어지고 늦어도 괜찮아…"],["마리링 · 별빛톡","네가 있어서 오늘 무대도 더 반짝일 수 있었어."],["루미벨 반짝채널","작은 점들이 모여 반짝이는 선이 되는 순간을 함께 기록해요."]];
  $("#savedList").innerHTML=saved.map(([t,x])=>`<div class="saved-card"><b>${t}</b><p>${x}</p></div>`).join("");
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
  $("#profilePhotoBtn").onclick=()=>openGallery(currentRoomId);
  $("#galleryBackBtn").onclick=()=>{renderChannelInfo(currentRoomId);showScreen("channelInfoScreen");};
  $("#viewerBackBtn").onclick=backFromViewer;
  $("#viewerGalleryBtn").onclick=()=>openGallery(currentRoomId);
  $("#viewerPrevBtn").onclick=()=>moveViewer(-1);
  $("#viewerNextBtn").onclick=()=>moveViewer(1);
  $("#viewerBody").onclick=(e)=>{if(e.target.closest(".viewer-arrow"))return;$("#photoViewerScreen").classList.toggle("ui-hidden");};
  $("#savePhotoBtn").onclick=()=>showToast("루미톡 사진이 저장되었어요.");
  $("#keepPhotoBtn").onclick=()=>showToast("소장함에 담았어요.");
  $("#morePhotoBtn").onclick=()=>showToast("더보기는 다음 단계에서 열릴 예정이에요.");
  $("#searchBtn").onclick=()=>{renderSearchResults();$("#searchSheet").classList.remove("hidden");};
  $("#savedBtn").onclick=()=>{renderSavedList();$("#savedSheet").classList.remove("hidden");};
  $("#myProfileBtn").onclick=()=>$("#myProfileSheet").classList.remove("hidden");
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

renderChannels();
renderRoom(currentRoomId);
renderProfile(currentRoomId);
bindEvents();


/* Patch 19: join heart safe override */
(function(){
  const joinHeart = document.getElementById("joinHeartBtn");
  if (joinHeart) {
    joinHeart.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      showToast("채널을 소장했어요.");
    };
  }
  const joinHero = document.getElementById("joinHero");
  if (joinHero) {
    joinHero.onclick = null;
  }
})();


/* Patch 20 help icon visibility */
(function(){
  const helpAvatar = document.querySelector('.help-avatar');
  if(helpAvatar && helpAvatar.textContent.trim()===''){
    helpAvatar.textContent='?';
  }
})();
