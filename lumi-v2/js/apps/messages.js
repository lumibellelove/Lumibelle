/**
 * messages.js — Patch 03A-fix6 기반
 * 인터랙션: 진입 시 선택지 펼침 → 허공 터치 시 접힘 → 선택 시 marquee + 체크 → 전송 → 읽음 → 답장 → 잠금
 */
(function () {
  "use strict";

  var LINE_DELAY   = 650;
  var LINE_GAP     = 1350;
  var READ_DELAY   = 2000;
  var REPLY_DELAY  = 3500;
  var UNLOCK_DELAY   = 600;
  var CHOICE_SLIDE_DELAY = 650;  /* 선택지 올라오는 딜레이 — 말풍선 리듬과 동일 */

  window.LumiApps = window.LumiApps || {};

  var MEMBER_PROFILE = {
    mariring: { name: "마리링", mark: "🎀⭐️", icon: "🎀", photo: "../img/member/mariring/mariring.webp" },
    lulu:     { name: "루루",   mark: "🍼🐰",  icon: "🐰", photo: "../img/member/lulu/lulu.webp" },
    system:   { name: "운영",   mark: "",      icon: "✉️", photo: "" },
    letter:   { name: "루미레터", mark: "",    icon: "💌", photo: "" }
  };

  var DEFAULT_MESSAGES = [
    {
      id: "lulu-live-today",
      member: "lulu",
      box: "member",
      status: "unread",
      date: "공연 당일",
      from: "루루 🍼🐰",
      tag: "공연 전",
      title: "루미나, 오늘 오는 날이지?",
      preview: "날씨랑 입장번호 챙겨서 조심히 와야 해.",
      lines: [
        "루미나, 오늘 오는 날이지...? 🐰🩷",
        "공연장 근처는 비가 스칠 수도 있대. 작은 우산 챙기고, 입장번호도 잊지 말기...!",
        "천천히 와도 괜찮으니까 조심히 와야 해 🐰"
      ],
      choices: ["응! 조심히 갈게", "우산 챙길게!", "루루도 준비 힘내!"],
      after: {
        "응! 조심히 갈게":    ["정말...? 그 말 들으니까 루루도 더 힘내서 준비할 수 있을 것 같아.", "오늘 무대에서 꼭 찾아볼게 🐰🩷"],
        "우산 챙길게!":       ["좋아...! 오는 길 미끄럽지 않게 조심해야 해.", "루루도 무대에서 기다리고 있을게 🐰"],
        "루루도 준비 힘내!":  ["에헤헤... 그런 말 들으면 루루 더 힘내버려!", "오늘 꼭 반짝이는 모습 보여줄게 🐰✨️"]
      }
    },
    {
      id: "mariring-online-cheer",
      member: "mariring",
      box: "member",
      status: "unread",
      date: "ON AIR 종료 후",
      from: "마리링 🎀⭐️",
      tag: "온라인",
      title: "멀리서도 마음이 닿았어",
      preview: "직접 만나지 못해도 그 마음은 분명히 닿을 거야.",
      lines: ["와줘서 고마워!", "오늘 네 마음이 링링에게 닿았어.", "앞으로도 더 반짝일 수 있게 힘내볼게!"],
      choices: ["멀리서 응원할게", "ON AIR로 함께할게", "다음엔 꼭 보러 갈게"],
      after: {
        "멀리서 응원할게":    ["링링 고마워! 멀리서 보내준 마음도 진짜 크게 느껴졌어."],
        "ON AIR로 함께할게":  ["좋아! 화면 너머 응원도 링링에게 닿았어."],
        "다음엔 꼭 보러 갈게": ["기다릴게! 다음에 만나는 날엔 더 반짝이는 모습 보여줄게!"]
      }
    },
    {
      id: "staff-lumi-guide",
      member: "system",
      box: "operation",
      status: "unread",
      date: "운영 안내",
      from: "루미폰 운영",
      tag: "운영",
      title: "루미폰 기록 안내",
      preview: "티켓, 포인트, 스탬프 기록이 이상할 때 확인하는 안내예요.",
      lines: ["루미폰 기록은 공연/특전회/ON AIR 기록을 천천히 연결하는 공간이에요.", "기록이 다르게 보이면 루미 ID와 날짜를 알려주세요.", "스탭 확인 후 가능한 범위에서 수정해드릴게요."],
      choices: ["확인했어요", "문의할게요", "루미 ID 준비할게요"],
      after: {
        "확인했어요":         ["확인해줘서 고마워요. 기록은 안전하게 남겨둘게요."],
        "문의할게요":         ["좋아요. 루미 ID와 날짜를 함께 알려주시면 확인이 빨라요."],
        "루미 ID 준비할게요": ["루미 ID가 있으면 티켓/포인트/스탬프 확인이 쉬워요."]
      }
    },
    {
      id: "lumi-letter-0712",
      member: "letter",
      box: "member",
      status: "read",
      date: "공연 후",
      from: "루미레터",
      tag: "루미레터",
      title: "데뷔 라이브의 첫 페이지",
      preview: "공연 후 루미로그와 함께 남는 공식 루미레터예요.",
      lines: ["오늘의 루미레터가 도착했어요.", "2026년 7월 12일, 루미벨의 첫 페이지가 열렸습니다.", "남겨준 마음은 지나가는 글이 아니라 루미벨의 기록 속에 오래 보관됩니다."],
      choices: []
    }
  ];

  var STORAGE = {
    read:    "lumi_v2_messages_read",
    saved:   "lumi_v2_messages_saved",
    replies: "lumi_v2_messages_replies_v4",
    times:   "lumi_v2_messages_times"
  };

  function nowTime() {
    var d = new Date();
    var h = String(d.getHours()).padStart(2, "0");
    var m = String(d.getMinutes()).padStart(2, "0");
    return h + ":" + m;
  }

  function getMessageTime(messageId) {
    var times = getObject(STORAGE.times);
    if (!times[messageId]) {
      times[messageId] = nowTime();
      setObject(STORAGE.times, times);
    }
    return times[messageId];
  }

  /* ── 앱 HTML ── */
  window.LumiApps.messages = function () {
    return (
      '<section class="messages-app" data-messages-app>' +
        '<div class="messages-toolbar">' +
          '<h2>문자함</h2>' +
          '<span class="messages-new-pill" data-messages-new>NEW 0</span>' +
        '</div>' +
        '<div class="messages-tabs" role="tablist" aria-label="문자함 탭">' +
          '<button type="button" class="messages-tab is-active" data-message-tab="all">전체</button>' +
          '<button type="button" class="messages-tab" data-message-tab="member">멤버</button>' +
          '<button type="button" class="messages-tab" data-message-tab="operation">운영</button>' +
          '<button type="button" class="messages-tab" data-message-tab="saved">소장</button>' +
        '</div>' +
        '<div class="messages-list" data-message-list></div>' +
        '<section class="messages-detail-sheet" data-message-detail aria-hidden="true"></section>' +
      '</section>'
    );
  };

  /* ── 바인딩 ── */
  window.LumiApps.bindMessages = function (root) {
    var app = root.querySelector("[data-messages-app]");
    if (!app || app.__lumiMessagesBound) return;
    app.__lumiMessagesBound = true;
    app.__lumiMessagesTab = "all";
    app.__lumiMessagesCurrent = null;
    app.__lumiMessagesTimers = [];

    renderList(app);

    app.addEventListener("click", function (e) {
      /* 탭 전환 */
      var tab = e.target.closest("[data-message-tab]");
      if (tab) {
        app.__lumiMessagesTab = tab.getAttribute("data-message-tab") || "all";
        app.querySelectorAll("[data-message-tab]").forEach(function (btn) {
          btn.classList.toggle("is-active", btn === tab);
        });
        closeDetail(app);
        renderList(app);
        return;
      }

      /* 메시지 열기 */
      var card = e.target.closest("[data-message-open]");
      if (card) {
        openDetail(app, card.getAttribute("data-message-open"));
        return;
      }

      /* 닫기 */
      var close = e.target.closest("[data-message-close]");
      if (close) { closeDetail(app); return; }

      /* 소장 */
      var save = e.target.closest("[data-message-save]");
      if (save) { toggleSaveCurrent(app, save); return; }

      /* 선택지 클릭 */
      var choice = e.target.closest("[data-message-choice]");
      if (choice) {
        var replyArea = app.querySelector("[data-message-reply-area]");
        if (replyArea && replyArea.classList.contains("is-locked")) return;
        if (replyArea && replyArea.classList.contains("is-waiting")) return;
        var choiceVal = choice.getAttribute("data-message-choice");
        var existing = getObject(STORAGE.replies)[app.__lumiMessagesCurrent];
        /* 소장탭 재선택: 다른 선택지면 미리보기 모드로 답 보여주기 */
        if (existing && existing.choice && existing.choice !== choiceVal && app.__lumiMessagesTab === "saved") {
          previewChoice(app, choiceVal);
          return;
        }
        fillInput(app, choiceVal);
        return;
      }

      /* 덮어쓰기 팝업 확인/취소 */
      var confirmYes = e.target.closest("[data-overwrite-yes]");
      if (confirmYes) {
        var confirmedChoice = confirmYes.getAttribute("data-overwrite-yes");
        /* 저장 */
        var msgNow = findMessage(app.__lumiMessagesCurrent);
        if (msgNow) {
          var afterNow = Array.isArray(msgNow.after && msgNow.after[confirmedChoice]) ? msgNow.after[confirmedChoice] : [];
          var replies2 = getObject(STORAGE.replies);
          replies2[app.__lumiMessagesCurrent] = { choice: confirmedChoice, after: afterNow, time: nowTime() };
          setObject(STORAGE.replies, replies2);
        }
        /* 팝업 닫기 */
        hideOverwriteConfirm(app);
        /* 미리보기 흐릿함 제거 — 화면 그대로 유지 */
        var sheet = app.querySelector("[data-message-detail]");
        if (sheet) {
          sheet.querySelectorAll(".is-preview").forEach(function (el) {
            el.classList.remove("is-preview");
          });
        }
        /* 선택지 체크표시 확정 업데이트 */
        app.querySelectorAll("[data-message-choice]").forEach(function (btn) {
          var isSel = btn.getAttribute("data-message-choice") === confirmedChoice;
          btn.classList.toggle("is-selected", isSel);
          btn.innerHTML = (isSel ? '<span class="messages-choice-check">✓</span>' : "") + escHtml(btn.getAttribute("data-message-choice"));
        });
        /* reply-area 잠금 */
        var ra = app.querySelector("[data-message-reply-area]");
        if (ra) {
          ra.classList.remove("is-waiting");
          ra.classList.add("is-locked");
          var inp = ra.querySelector("[data-messages-input]");
          if (inp) inp.removeAttribute("data-choice-value");
          var sendBtn = ra.querySelector("[data-message-send]");
          if (sendBtn) sendBtn.classList.remove("is-ready");
        }
        renderList(app);
        return;
      }
      var confirmNo = e.target.closest("[data-overwrite-no]");
      if (confirmNo) {
        hideOverwriteConfirm(app);
        /* 미리보기 취소 → 원래 상태로 재렌더 */
        openDetail(app, app.__lumiMessagesCurrent);
        return;
      }

      /* 전송 버튼 */
      var send = e.target.closest("[data-message-send]");
      if (send) {
        var ra = app.querySelector("[data-message-reply-area]");
        if (!ra || ra.classList.contains("is-locked") || ra.classList.contains("is-waiting")) return;
        var input = app.querySelector("[data-messages-input]");
        var val = input ? input.getAttribute("data-choice-value") : "";
        if (val) sendChoice(app, val);
        return;
      }

      /* 입력창 클릭 → 선택지 접기/펼치기 toggle */
      var inputEl = e.target.closest("[data-messages-input]");
      if (inputEl) {
        toggleChoices(app);
        return;
      }

      /* 허공(채팅 영역) 터치 → 선택지 접기 */
      var body = e.target.closest("[data-message-room-body]");
      if (body) {
        collapseChoices(app);
        return;
      }
    });
  };

  /* ── 입력창 채우기 (선택지 탭 시) ── */
  function fillInput(app, choice) {
    var input = app.querySelector("[data-messages-input]");
    if (!input) return;

    /* 선택지 체크 표시 */
    app.querySelectorAll("[data-message-choice]").forEach(function (btn) {
      var isThis = btn.getAttribute("data-message-choice") === choice;
      btn.classList.toggle("is-selected", isThis);
      var text = btn.getAttribute("data-message-choice");
      btn.innerHTML = (isThis ? '<span class="messages-choice-check">✓</span>' : "") + escHtml(text);
    });

    /* 입력창에 텍스트 세팅 + marquee 시작 */
    input.setAttribute("data-choice-value", choice);
    startMarquee(input, choice);

    /* 전송 버튼 활성화 */
    var send = app.querySelector("[data-message-send]");
    if (send) send.classList.add("is-ready");
  }

  /* ── marquee 효과 ── */
  function startMarquee(input, text) {
    /* 기존 marquee 클리어 */
    if (input.__marqueeTimer) clearInterval(input.__marqueeTimer);
    input.classList.remove("is-marquee");

    var span = input.querySelector(".messages-input-text");
    if (!span) return;
    span.textContent = text;

    /* 텍스트가 컨테이너보다 길 때만 marquee */
    setTimeout(function () {
      if (span.scrollWidth > input.offsetWidth - 32) {
        input.classList.add("is-marquee");
      }
    }, 50);
  }

  function stopMarquee(input) {
    if (input.__marqueeTimer) clearInterval(input.__marqueeTimer);
    input.classList.remove("is-marquee");
  }

  /* ── 선택지 펼치기/접기 ── */
  function toggleChoices(app) {
    var choiceBox = app.querySelector("[data-message-choice-box]");
    if (!choiceBox) return;
    var isOpen = choiceBox.classList.contains("is-open");
    if (isOpen) collapseChoices(app);
    else expandChoices(app);
  }

  function expandChoices(app) {
    var choiceBox = app.querySelector("[data-message-choice-box]");
    var replyArea = app.querySelector("[data-message-reply-area]");
    if (!choiceBox) return;
    choiceBox.classList.add("is-open");
    if (replyArea) replyArea.classList.add("is-expanded");
  }

  function collapseChoices(app) {
    var choiceBox = app.querySelector("[data-message-choice-box]");
    var replyArea = app.querySelector("[data-message-reply-area]");
    if (!choiceBox) return;
    choiceBox.classList.remove("is-open");
    if (replyArea) replyArea.classList.remove("is-expanded");
  }

  /* ── 전송 ── */
  function sendChoice(app, choice) {
    var message = findMessage(app.__lumiMessagesCurrent);
    if (!message || !choice) return;

    var after = Array.isArray(message.after && message.after[choice]) ? message.after[choice] : [];
    var replies = getObject(STORAGE.replies);
    replies[message.id] = { choice: choice, after: after, time: nowTime() };
    setObject(STORAGE.replies, replies);

    /* 입력창 잠금 */
    var replyArea = app.querySelector("[data-message-reply-area]");
    if (replyArea) replyArea.classList.add("is-waiting");
    collapseChoices(app);

    /* 내 말풍선 즉시 표시 */
    var response = app.querySelector("[data-message-response]");
    var member   = getMember(message.member);
    if (response) {
      response.innerHTML =
        '<div class="messages-chat-row is-me is-visible">' +
          '<div class="messages-bubble">' + escHtml(choice) + '<span class="messages-chat-time">나</span></div>' +
          renderUserAvatar() +
        '</div>';
      scrollBody(app);
    }

    /* 읽음 표시 → 답장 순서로 딜레이 */
    var sendTime = nowTime();
    var timers = [];

    /* 읽음 표시 */
    timers.push(setTimeout(function () {
      if (response) {
        var myRow = response.querySelector(".is-me");
        if (myRow) {
          var time = myRow.querySelector(".messages-chat-time");
          if (time) time.textContent = "읽음 " + sendTime;
          myRow.classList.add("is-read");
        }
      }
    }, READ_DELAY));

    /* 답장 말풍선들 순차 등장 */
    after.forEach(function (line, i) {
      timers.push(setTimeout(function () {
        if (!response) return;
        var bubble = document.createElement("div");
        bubble.className = "messages-chat-row is-member is-pending";
        bubble.innerHTML =
          renderMiniAvatar(member) +
          '<div class="messages-bubble">' + escHtml(line) + '<span class="messages-chat-time">' + sendTime + '</span></div>';
        response.appendChild(bubble);
        scrollBody(app);
        /* 한 프레임 후 is-visible */
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            bubble.classList.add("is-visible");
          });
        });

        /* 마지막 답장 후 잠금 */
        if (i === after.length - 1) {
          timers.push(setTimeout(function () {
            lockReplyArea(app);
          }, UNLOCK_DELAY));
        }
      }, REPLY_DELAY + i * LINE_GAP));
    });

    /* 답장 없는 경우도 잠금 */
    if (!after.length) {
      timers.push(setTimeout(function () {
        lockReplyArea(app);
      }, UNLOCK_DELAY));
    }

    app.__lumiMessagesTimers = (app.__lumiMessagesTimers || []).concat(timers);
  }

  /* 답장 완료 후 잠금 (2번 사진처럼) */
  function lockReplyArea(app) {
    var replyArea = app.querySelector("[data-message-reply-area]");
    if (!replyArea) return;
    replyArea.classList.remove("is-waiting");
    replyArea.classList.add("is-locked");

    /* 입력창 내용 비우기 */
    var span = replyArea.querySelector(".messages-input-text");
    if (span) span.textContent = "";
    var input = replyArea.querySelector("[data-messages-input]");
    if (input) {
      stopMarquee(input);
      input.removeAttribute("data-choice-value");
    }
    var send = replyArea.querySelector("[data-message-send]");
    if (send) send.classList.remove("is-ready");

    /* 답장 완료 후 선택지 체크 표시와 함께 슬라이드 올라오기 */
    var message = findMessage(app.__lumiMessagesCurrent);
    var savedReply = getObject(STORAGE.replies)[app.__lumiMessagesCurrent];
    if (message && message.choices && message.choices.length && savedReply && savedReply.choice) {
      setTimeout(function () {
        showCompletedChoices(app, message, savedReply.choice);
      }, CHOICE_SLIDE_DELAY);
    }

    renderList(app);
  }

  function showCompletedChoices(app, message, selectedChoice) {
    var replyArea = app.querySelector("[data-message-reply-area]");
    if (!replyArea) return;

    /* 선택지 박스 교체 */
    var existingBox = replyArea.querySelector("[data-message-choice-box]");
    if (existingBox) existingBox.remove();

    var box = document.createElement("div");
    box.className = "messages-choice-box";
    box.setAttribute("data-message-choice-box", "");
    box.innerHTML = message.choices.map(function (choice) {
      var isSel = choice === selectedChoice;
      return (
        '<button type="button" class="messages-choice' + (isSel ? " is-selected" : "") +
        '" data-message-choice="' + escAttr(choice) + '">' +
          (isSel ? '<span class="messages-choice-check">✓</span>' : "") +
          escHtml(choice) +
        '</button>'
      );
    }).join("");

    replyArea.appendChild(box);

    /* 한 프레임 후 is-open으로 슬라이드 */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        box.classList.add("is-open");
        replyArea.classList.add("is-expanded");
      });
    });
  }

  /* ── 상세 열기 ── */
  function openDetail(app, messageId) {
    var message = findMessage(messageId);
    var sheet   = app.querySelector("[data-message-detail]");
    if (!message || !sheet) return;

    app.__lumiMessagesCurrent = message.id;
    markRead(message.id);
    getMessageTime(message.id);  /* 최초 열람 시각 저장 */
    clearMessageTimers(app);

    var isSavedTab = app.__lumiMessagesTab === "saved";
    var savedReply = getObject(STORAGE.replies)[message.id];
    var isReplied  = savedReply && savedReply.choice;
    /* 소장탭에서 열면 재선택 가능 */
    var canReselect = isSavedTab && isReplied && message.choices && message.choices.length;

    sheet.innerHTML = renderDetail(message, savedReply, isReplied, canReselect);
    sheet.classList.add("is-open");
    sheet.setAttribute("aria-hidden", "false");
    renderList(app);

    /* 진입 시 처리 */
    if (isReplied) {
      /* 완료된 문자: 말풍선 + 응답 시퀀스 모두 순차 등장, 입력창은 잠금 유지 */
      playMemberBubbles(app, null);
    } else if (message.choices && message.choices.length) {
      /* 미답장 + 선택지 있음: 말풍선 순차 등장 후 선택지 펼치기 */
      playMemberBubbles(app, function () {
        expandChoices(app);
      });
    } else {
      /* 선택지 없음 (루미레터 등): 말풍선만 순차 등장 */
      playMemberBubbles(app, null);
    }
  }

  function closeDetail(app) {
    clearMessageTimers(app);
    var sheet = app.querySelector("[data-message-detail]");
    if (!sheet) return;
    sheet.classList.remove("is-open");
    sheet.setAttribute("aria-hidden", "true");
    sheet.innerHTML = "";
    app.__lumiMessagesCurrent = null;
  }

  /* ── 상세 HTML ── */
  function renderDetail(message, savedReply, isReplied, canReselect) {
    var member = getMember(message.member);
    var isSaved = getArray(STORAGE.saved).indexOf(message.id) !== -1;

    /* 멤버 말풍선: 항상 pending으로 — 완료 여부 무관하게 뿅뿅 등장 */
    var msgTime = getMessageTime(message.id);
    var memberBubbles = message.lines.map(function (line) {
      return renderBubble({ kind: "member", text: line, time: msgTime }, member, true);
    }).join("");

    /* 이미 답장한 경우 응답 시퀀스 */
    var responseHTML = "";
    if (isReplied) {
      /* 응답 시퀀스도 pending — 말풍선 다 나온 뒤 순차 등장 */
      responseHTML = renderResponseSequencePending(message, member, savedReply);
    }

    /* 답장 영역 */
    var replyHTML = renderReplyArea(message, savedReply, isReplied, canReselect);

    return (
      '<header class="messages-room-head">' +
        renderAvatar(member, "messages-avatar") +
        '<div class="messages-room-title">' +
          '<b>' + escHtml(message.from || member.name) + '의 문자</b>' +
          '<span>' + escHtml(message.tag || "문자") + ' · ' + escHtml(message.date || "방금 도착") + '</span>' +
        '</div>' +
        '<div class="messages-head-actions">' +
          '<button type="button" class="messages-save-chip' + (isSaved ? " is-saved" : "") + '" data-message-save>' + (isSaved ? "♥ 해제" : "♡ 소장") + '</button>' +
          '<button type="button" class="messages-close" data-message-close>닫기</button>' +
        '</div>' +
      '</header>' +
      '<div class="messages-room-body" data-message-room-body>' +
        '<div class="messages-room-notice">이 문자는 루미나에게만 도착한 메시지예요.</div>' +
        memberBubbles +
        '<div class="messages-response-sequence" data-message-response>' + responseHTML + '</div>' +
      '</div>' +
      replyHTML
    );
  }

  /* ── 말풍선 순차 등장 ── */
  function playMemberBubbles(app, onDone) {
    var sheet   = app.querySelector("[data-message-detail]");
    var pending = sheet ? Array.prototype.slice.call(sheet.querySelectorAll(".messages-pending-line:not(.is-visible)")) : [];
    var replyArea = sheet ? sheet.querySelector("[data-message-reply-area]") : null;
    if (replyArea) replyArea.classList.add("is-waiting");

    var timers = [];
    pending.forEach(function (el, i) {
      var t = setTimeout(function () {
        el.classList.add("is-visible");
        scrollBody(app);
        if (i === pending.length - 1) {
          var done = setTimeout(function () {
            if (replyArea) replyArea.classList.remove("is-waiting");
            if (onDone) onDone();
          }, UNLOCK_DELAY);
          timers.push(done);
        }
      }, LINE_DELAY + i * LINE_GAP);
      timers.push(t);
    });

    if (!pending.length) {
      if (replyArea) replyArea.classList.remove("is-waiting");
      if (onDone) onDone();
    }

    app.__lumiMessagesTimers = (app.__lumiMessagesTimers || []).concat(timers);
  }

  /* ── 답장 영역 ── */
  function renderReplyArea(message, savedReply, isReplied, canReselect) {
    if (!message.choices || !message.choices.length) {
      return (
        '<footer class="messages-reply-area is-locked" data-message-reply-area>' +
          '<div class="messages-reply-row">' +
            '<div class="messages-reply-input">' +
              '<span class="messages-input-placeholder">터치하여 내용 입력...</span>' +
            '</div>' +
            '<button type="button" class="messages-send">▶</button>' +
          '</div>' +
        '</footer>'
      );
    }

    if (isReplied && !canReselect) {
      /* 일반 탭: 잠긴 입력창 */
      return (
        '<footer class="messages-reply-area is-locked" data-message-reply-area>' +
          '<div class="messages-reply-row">' +
            '<div class="messages-reply-input">' +
              '<span class="messages-input-placeholder">터치하여 내용 입력...</span>' +
            '</div>' +
            '<button type="button" class="messages-send">▶</button>' +
          '</div>' +
        '</footer>'
      );
    }

    var choicesHTML = renderChoices(message, canReselect ? savedReply : null);
    return (
      '<footer class="messages-reply-area" data-message-reply-area>' +
        '<div class="messages-reply-row">' +
          '<div class="messages-reply-input" data-messages-input>' +
            '<span class="messages-input-placeholder">터치하여 내용 입력...</span>' +
            '<span class="messages-input-text"></span>' +
          '</div>' +
          '<button type="button" class="messages-send" data-message-send>▶</button>' +
        '</div>' +
        choicesHTML +

      '</footer>'
    );
  }

  /* ── 선택지 HTML ── */
  function renderChoices(message, savedReply, canReselect) {
    if (!message.choices || !message.choices.length) return '<div class="messages-choice-box"></div>';
    var selected = savedReply && savedReply.choice ? savedReply.choice : "";
    return (
      '<div class="messages-choice-box" data-message-choice-box>' +
        message.choices.map(function (choice) {
          var isSel = choice === selected;
          return (
            '<button type="button" class="messages-choice' + (isSel ? " is-selected" : "") + '" data-message-choice="' + escAttr(choice) + '">' +
              (isSel ? '<span class="messages-choice-check">✓</span>' : "") +
              escHtml(choice) +
            '</button>'
          );
        }).join("") +
      '</div>'
    );
  }

  /* ── 응답 시퀀스 (이미 답장한 경우) ── */
  function renderResponseSequence(message, member, savedReply) {
    if (!savedReply || !savedReply.choice) return "";
    var items = [{ kind: "me", text: savedReply.choice }];
    (savedReply.after || []).forEach(function (line) {
      items.push({ kind: "member", text: line });
    });
    return items.map(function (item) { return renderBubble(item, member, false); }).join("");
  }

  function renderResponseSequencePending(message, member, savedReply) {
    if (!savedReply || !savedReply.choice) return "";
    var replyTime = savedReply.time || getMessageTime(message.id);
    var items = [{ kind: "me", text: savedReply.choice, time: replyTime }];
    (savedReply.after || []).forEach(function (line) {
      items.push({ kind: "member", text: line, time: replyTime });
    });
    return items.map(function (item) { return renderBubble(item, member, true); }).join("");
  }

  /* ── 말풍선 ── */
  function renderBubble(item, member, pending) {
    var cls = "messages-chat-row" + (item.kind === "me" ? " is-me" : " is-member") + (pending ? " messages-pending-line" : " is-visible");
    var timeStr = item.time || "방금";
    if (item.kind === "me") {
      /* pending(재진입)이면 이미 읽음, 아니면 실시간 전송이라 "나"로 시작 */
      var myTimeStr = pending ? ("읽음 " + timeStr) : "나";
      return (
        '<div class="' + cls + '">' +
          '<div class="messages-bubble">' + escHtml(item.text) + '<span class="messages-chat-time">' + myTimeStr + '</span></div>' +
          renderUserAvatar() +
        '</div>'
      );
    }
    return (
      '<div class="' + cls + '">' +
        renderMiniAvatar(member) +
        '<div class="messages-bubble">' + escHtml(item.text) + '<span class="messages-chat-time">' + escHtml(timeStr) + '</span></div>' +
      '</div>'
    );
  }

  /* ── 스크롤 ── */
  function scrollBody(app) {
    var sheet = app.querySelector("[data-message-detail]");
    var body  = sheet && sheet.querySelector("[data-message-room-body]");
    if (body) body.scrollTop = body.scrollHeight;
  }

  /* ── 목록 렌더 ── */
  function renderList(app) {
    var list = app.querySelector("[data-message-list]");
    if (!list) return;

    var messages   = getMessages();
    var readIds    = getArray(STORAGE.read);
    var savedIds   = getArray(STORAGE.saved);
    var tab        = app.__lumiMessagesTab || "all";

    var filtered = messages.filter(function (m) {
      if (tab === "saved")     return savedIds.indexOf(m.id) !== -1;
      if (tab === "member")    return m.box !== "operation";
      if (tab === "operation") return m.box === "operation";
      return true;
    });

    var unread = messages.filter(function (m) {
      return readIds.indexOf(m.id) === -1 && m.status !== "read";
    }).length;
    var pill = app.querySelector("[data-messages-new]");
    if (pill) pill.textContent = "NEW " + unread;

    if (!filtered.length) {
      list.innerHTML = '<div class="messages-empty">아직 이 탭에 표시할 문자가 없어요.<br>도착한 마음은 이곳에 차곡차곡 모여요.</div>';
      return;
    }

    list.innerHTML = filtered.map(function (m) {
      var isRead  = readIds.indexOf(m.id) !== -1 || m.status === "read";
      var isSaved = savedIds.indexOf(m.id) !== -1;
      var member  = getMember(m.member);
      return (
        '<button type="button" class="messages-card' + (!isRead ? " is-unread" : "") + '" data-message-open="' + escAttr(m.id) + '">' +
          renderAvatar(member, "messages-avatar") +
          '<span class="messages-card-main">' +
            '<span class="messages-card-top">' +
              '<span class="messages-sender">' + escHtml(m.from || member.name) + '</span>' +
              '<span class="messages-date">' + escHtml(m.date || "방금") + '</span>' +
            '</span>' +
            '<strong class="messages-subject">' + escHtml(m.title || "도착한 문자") + '</strong>' +
            '<span class="messages-preview">' + escHtml(m.preview || firstLine(m)) + '</span>' +
            '<span class="messages-tags">' +
              (!isRead ? '<span class="messages-tag is-new">NEW</span>' : "") +
              (isSaved ? '<span class="messages-tag is-saved">소장</span>' : "") +
              '<span class="messages-tag">' + escHtml(m.tag || "문자") + '</span>' +
            '</span>' +
          '</span>' +
        '</button>'
      );
    }).join("");
  }

  /* ── 소장 토글 ── */
  function previewChoice(app, newChoice) {
    var message = findMessage(app.__lumiMessagesCurrent);
    if (!message) return;

    var after = Array.isArray(message.after && message.after[newChoice]) ? message.after[newChoice] : [];
    var member = getMember(message.member);
    var sendTime = nowTime();
    var replyArea = app.querySelector("[data-message-reply-area]");
    var response  = app.querySelector("[data-message-response]");

    /* 선택지 체크표시 먼저 */
    app.querySelectorAll("[data-message-choice]").forEach(function (btn) {
      var isSel = btn.getAttribute("data-message-choice") === newChoice;
      btn.classList.toggle("is-selected", isSel);
      btn.innerHTML = (isSel ? '<span class="messages-choice-check">✓</span>' : "") + escHtml(btn.getAttribute("data-message-choice"));
    });

    /* 선택지 접기 + 대기 */
    collapseChoices(app);
    if (replyArea) replyArea.classList.add("is-waiting");

    /* 내 말풍선 즉시 표시 (미리보기 표시) */
    if (response) {
      response.innerHTML =
        '<div class="messages-chat-row is-me is-visible is-preview">' +
          '<div class="messages-bubble">' + escHtml(newChoice) + '<span class="messages-chat-time">나</span></div>' +
          renderUserAvatar() +
        '</div>';
      scrollBody(app);
    }

    var timers = [];

    /* 읽음 */
    timers.push(setTimeout(function () {
      if (response) {
        var myRow = response.querySelector(".is-me");
        if (myRow) {
          var t = myRow.querySelector(".messages-chat-time");
          if (t) t.textContent = "읽음 " + sendTime;
        }
      }
    }, READ_DELAY));

    /* 답장 말풍선 순차 등장 */
    after.forEach(function (line, i) {
      timers.push(setTimeout(function () {
        if (!response) return;
        var bubble = document.createElement("div");
        bubble.className = "messages-chat-row is-member is-pending is-preview";
        bubble.innerHTML =
          renderMiniAvatar(member) +
          '<div class="messages-bubble">' + escHtml(line) + '<span class="messages-chat-time">' + sendTime + '</span></div>';
        response.appendChild(bubble);
        scrollBody(app);
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { bubble.classList.add("is-visible"); });
        });

        /* 마지막 답장 후 확정 팝업 */
        if (i === after.length - 1) {
          timers.push(setTimeout(function () {
            if (replyArea) replyArea.classList.remove("is-waiting");
            showOverwriteConfirm(app, newChoice);
          }, UNLOCK_DELAY + 400));
        }
      }, REPLY_DELAY + i * LINE_GAP));
    });

    /* 답장 없으면 바로 팝업 */
    if (!after.length) {
      timers.push(setTimeout(function () {
        if (replyArea) replyArea.classList.remove("is-waiting");
        showOverwriteConfirm(app, newChoice);
      }, READ_DELAY + 400));
    }

    app.__lumiMessagesTimers = (app.__lumiMessagesTimers || []).concat(timers);
  }

  function showOverwriteConfirm(app, newChoice) {
    var existing = app.querySelector("[data-overwrite-popup]");
    if (existing) existing.remove();
    /* detail-sheet에 absolute bottom:0으로 붙이기 */
    var sheet = app.querySelector("[data-message-detail]");
    if (!sheet) return;
    var popup = document.createElement("div");
    popup.className = "messages-overwrite-inline";
    popup.setAttribute("data-overwrite-popup", "");
    popup.innerHTML = (
      '<p class="messages-overwrite-question">이 선택지로 확정할까요?</p>' +
      '<div class="messages-overwrite-btns">' +
        '<button type="button" class="messages-overwrite-btn is-confirm" data-overwrite-yes="' + escAttr(newChoice) + '">예</button>' +
        '<button type="button" class="messages-overwrite-btn is-cancel" data-overwrite-no>아니오</button>' +
      '</div>'
    );
    sheet.appendChild(popup);
  }

  function hideOverwriteConfirm(app) {
    var popup = app.querySelector("[data-overwrite-popup]");
    if (popup) popup.remove();
  }

  function toggleSaveCurrent(app, button) {
    var message = findMessage(app.__lumiMessagesCurrent);
    if (!message) return;
    var saved = getArray(STORAGE.saved);
    var idx   = saved.indexOf(message.id);
    var next  = idx === -1;
    if (next) saved.unshift(message.id); else saved.splice(idx, 1);
    setArray(STORAGE.saved, saved);
    if (button) {
      button.classList.toggle("is-saved", next);
      button.textContent = next ? "♥ 해제" : "♡ 소장";
    }
    if (!next && app.__lumiMessagesTab === "saved") closeDetail(app);
    renderList(app);
  }

  function markRead(id) {
    var read = getArray(STORAGE.read);
    if (read.indexOf(id) === -1) read.push(id);
    setArray(STORAGE.read, read);
  }

  function clearMessageTimers(app) {
    (app.__lumiMessagesTimers || []).forEach(function (t) { clearTimeout(t); });
    app.__lumiMessagesTimers = [];
  }

  /* ── 데이터 헬퍼 ── */
  function getMessages() {
    if (Array.isArray(window.LumiPhoneMessagesData) && window.LumiPhoneMessagesData.length) {
      return window.LumiPhoneMessagesData.map(normalizeMessage).filter(Boolean);
    }
    return DEFAULT_MESSAGES.map(normalizeMessage).filter(Boolean);
  }

  function normalizeMessage(m) {
    if (!m || !m.id) return null;
    var n = Object.assign({}, m);
    n.member  = n.member || memberKeyFromFrom(n.from) || "system";
    n.box     = n.box || (n.member === "system" ? "operation" : "member");
    n.lines   = Array.isArray(n.lines) ? n.lines : String(n.body || n.preview || "").split("\n").filter(Boolean);
    n.choices = Array.isArray(n.choices) ? n.choices : [];
    n.after   = n.after || {};
    n.icon    = n.icon || getMember(n.member).icon;
    return n;
  }

  function findMessage(id) {
    return getMessages().find(function (m) { return m.id === id; });
  }

  function getMember(key) { return MEMBER_PROFILE[key] || MEMBER_PROFILE.system; }

  function memberKeyFromFrom(from) {
    var t = String(from || "");
    if (t.indexOf("마리링") !== -1) return "mariring";
    if (t.indexOf("루루") !== -1)   return "lulu";
    if (t.indexOf("루미레터") !== -1) return "letter";
    return "system";
  }

  function firstLine(m) { return m && m.lines && m.lines.length ? m.lines[0] : ""; }

  /* ── 아바타 ── */
  function renderAvatar(member, cls) {
    return (
      '<span class="' + cls + '">' +
        (member.photo ? '<img src="' + escAttr(member.photo) + '" alt="" onerror="this.remove()" />' : "") +
        '<em>' + escHtml(member.icon || "✉️") + '</em>' +
      '</span>'
    );
  }

  function renderMiniAvatar(member) {
    return (
      '<span class="messages-mini-avatar">' +
        (member.photo ? '<img src="' + escAttr(member.photo) + '" alt="" onerror="this.remove()" />' : "") +
        '<em>' + escHtml(member.icon || "✉️") + '</em>' +
      '</span>'
    );
  }

  function renderUserAvatar() {
    var src = readProfilePhoto();
    if (src) return '<span class="messages-mini-avatar"><img src="' + escAttr(src) + '" alt="" onerror="this.remove()" /><em>루</em></span>';
    return '<span class="messages-mini-avatar"><em>루</em></span>';
  }

  function readProfilePhoto() {
    var keys = ["lumiProfilePhoto", "lumi_profile_photo", "lumiProfileAvatar", "lumi_v2_profile_photo"];
    for (var i = 0; i < keys.length; i++) {
      try { var v = localStorage.getItem(keys[i]); if (v) return v; } catch (e) {}
    }
    return "";
  }

  /* ── localStorage ── */
  function getArray(key) {
    try { var v = JSON.parse(localStorage.getItem(key) || "[]"); return Array.isArray(v) ? v : []; } catch (e) { return []; }
  }
  function setArray(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val || [])); } catch (e) {}
  }
  function getObject(key) {
    try { var v = JSON.parse(localStorage.getItem(key) || "{}"); return v && typeof v === "object" && !Array.isArray(v) ? v : {}; } catch (e) { return {}; }
  }
  function setObject(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val || {})); } catch (e) {}
  }

  /* ── XSS 방지 ── */
  function escHtml(v) {
    return String(v == null ? "" : v).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function escAttr(v) { return escHtml(v).replace(/'/g, "&#39;"); }

}());
