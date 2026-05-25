
/**
 * MH-02 MOCKUP — 멤버용 루미톡 작성 앱
 * 실제 발송/API 연결 없음. 팬용 루미톡 전체 이식 금지.
 */
window.LumiApps = window.LumiApps || {};

window.LumiApps.lumitalk = function(app, ctx) {
  return (
    '<div class="app-scroll-body member-lumitalk-app">' +
      '<section class="member-lumitalk-hero">' +
        '<div class="member-lumitalk-kicker">MEMBER LUMITALK</div>' +
        '<h2>루미톡 작성</h2>' +
        '<p>팬이 보는 루미톡 화면이 아니라, 멤버가 채널 메시지를 작성하고 미리보는 목업 화면이에요.</p>' +
      '</section>' +

      '<section class="member-lumitalk-section">' +
        '<h3 class="member-lumitalk-section-title">채널 선택</h3>' +
        '<div class="member-channel-grid" data-lumitalk-channel-grid>' +
          '<button type="button" class="member-channel-btn is-active" data-channel="lulu" data-mark="🐰" data-room="루루의 포근포근 토끼굴" data-title="루루">🐰 루루</button>' +
          '<button type="button" class="member-channel-btn" data-channel="mariring" data-mark="🎀" data-room="링링의 별빛 작업실" data-title="마리링">🎀 마리링</button>' +
          '<button type="button" class="member-channel-btn" data-channel="iro" data-mark="👼🏻" data-room="이로의 블루 다이아 룸" data-title="이로">👼🏻 이로</button>' +
          '<button type="button" class="member-channel-btn" data-channel="lunar" data-mark="🌙" data-room="LUNAR의 달빛 고양이방" data-title="LUNAR">🌙 LUNAR</button>' +
        '</div>' +
      '</section>' +

      '<section class="member-lumitalk-section member-lumitalk-form">' +
        '<h3 class="member-lumitalk-section-title">메시지 작성</h3>' +
        '<label><span class="member-lumitalk-label">공개 범위</span>' +
          '<select class="member-lumitalk-select">' +
            '<option>전체 루미나</option>' +
            '<option>오시 팬</option>' +
            '<option>나중에 조건 선택</option>' +
          '</select>' +
        '</label>' +
        '<label><span class="member-lumitalk-label">메시지</span>' +
          '<textarea class="member-lumitalk-textarea" data-lumitalk-input>오늘도 루루 보러 와준 거야...? 🐰🩷' + "\n" + '와줘서 고마워...! 오늘도 같이 있어줄래...?</textarea>' +
        '</label>' +
      '</section>' +

      '<section class="member-lumitalk-section">' +
        '<h3 class="member-lumitalk-section-title">팬 화면 미리보기</h3>' +
        '<div class="member-preview-phone">' +
          '<div class="member-preview-head">' +
            '<div class="member-preview-avatar" data-lumitalk-preview-mark>🐰</div>' +
            '<div class="member-preview-name">' +
              '<strong data-lumitalk-preview-title>루루</strong>' +
              '<span data-lumitalk-preview-room>루루의 포근포근 토끼굴</span>' +
            '</div>' +
          '</div>' +
          '<div class="member-preview-bubble" data-lumitalk-preview-text>오늘도 루루 보러 와준 거야...? 🐰🩷' + "\n" + '와줘서 고마워...! 오늘도 같이 있어줄래...?</div>' +
        '</div>' +
      '</section>' +

      '<section class="member-lumitalk-section">' +
        '<h3 class="member-lumitalk-section-title">상태</h3>' +
        '<div class="member-lumitalk-status">' +
          '<div class="member-status-chip"><span>상태</span><strong>초안</strong></div>' +
          '<div class="member-status-chip"><span>검수</span><strong>대기</strong></div>' +
          '<div class="member-status-chip"><span>발송</span><strong>보류</strong></div>' +
        '</div>' +
        '<p class="member-mock-note" style="margin-top:10px;">실제 저장/발송/API 연결은 아직 없어요. 화면 흐름 확인용 목업이에요.</p>' +
      '</section>' +

      '<div class="member-lumitalk-actions">' +
        '<button type="button" class="member-action-btn">임시저장</button>' +
        '<button type="button" class="member-action-btn primary">작성 완료</button>' +
      '</div>' +
    '</div>'
  );
};

/* App window 렌더 후 이벤트 연결: OS 본체 직접 접근 없이 document 위임 */
(function(){
  document.addEventListener("input", function(e){
    var input = e.target.closest("[data-lumitalk-input]");
    if (!input) return;
    var preview = document.querySelector("[data-lumitalk-preview-text]");
    if (preview) preview.textContent = input.value || "메시지를 입력해 주세요.";
  });

  document.addEventListener("click", function(e){
    var btn = e.target.closest(".member-channel-btn");
    if (!btn) return;

    var wrap = btn.closest("[data-lumitalk-channel-grid]");
    if (wrap) {
      wrap.querySelectorAll(".member-channel-btn").forEach(function(b){ b.classList.remove("is-active"); });
    }
    btn.classList.add("is-active");

    var mark = document.querySelector("[data-lumitalk-preview-mark]");
    var title = document.querySelector("[data-lumitalk-preview-title]");
    var room = document.querySelector("[data-lumitalk-preview-room]");
    if (mark) mark.textContent = btn.getAttribute("data-mark") || "✦";
    if (title) title.textContent = btn.getAttribute("data-title") || "루미벨";
    if (room) room.textContent = btn.getAttribute("data-room") || "LUMI ROOM";
  });
}());
