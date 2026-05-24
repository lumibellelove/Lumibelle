window.LumiApps = window.LumiApps || {};

window.LumiApps.ticket = function (app, ctx) {
  var t = ctx.t;

  function text(key, fallback) {
    var value = t(key);
    return value === key ? fallback : value;
  }

  return [
    '<section class="ticket-app" data-ticket-app>',
      '<div class="ticket-tabs" role="tablist" aria-label="' + text("ticket.tabs", "티켓함 탭") + '">',
        '<button class="ticket-tab is-active" type="button" data-ticket-tab="current">' + text("ticket.current", "현재 티켓") + '</button>',
        '<button class="ticket-tab" type="button" data-ticket-tab="benefit">' + text("ticket.benefit", "특전권") + '</button>',
        '<button class="ticket-tab" type="button" data-ticket-tab="past">' + text("ticket.past", "지난 티켓") + '</button>',
      '</div>',

      '<div class="ticket-panel is-active" data-ticket-panel="current">',
        '<article class="ticket-summary-card">',
          '<div class="ticket-summary-top">',
            '<span class="ticket-kicker">LUMI PASS · E-TICKET</span>',
            '<span class="ticket-summary-date">2026.07.12 SUN<br>OPEN 17:30</span>',
          '</div>',
          '<h3 class="ticket-summary-title">Lumibelle Debut Live</h3>',
          '<p class="ticket-summary-meta">KT&amp;G 상상마당 라이브홀 · 서울 마포구</p>',
          '<div class="ticket-entry-row">',
            '<div class="ticket-entry-mini"><div><span>ENTRY NO.</span><b>0001</b></div></div>',
            '<div class="ticket-summary-status">',
              '<b>입금확인완료 · 미입장</b>',
              '<span>예약번호 LBT-0712-0001 · 메아테 루루</span>',
            '</div>',
          '</div>',
          '<div class="ticket-card-footer">',
            '<button class="ticket-action is-primary" type="button" data-ticket-detail="lumi-pass">상세 보기</button>',
            '<span class="ticket-chip">현장에서 제시</span>',
          '</div>',
        '</article>',
      '</div>',

      '<div class="ticket-panel" data-ticket-panel="benefit">',
        '<div class="ticket-benefit-list">',
          '<article class="benefit-summary-card birthday-summary-card">',
            '<div class="ticket-summary-top">',
              '<span class="benefit-kicker">HAPPY BIRTHDAY · SPECIAL TICKET</span>',
              '<span class="ticket-summary-date">05.01 ~ 05.31</span>',
            '</div>',
            '<h3 class="benefit-title">Birthday Ticket</h3>',
            '<p class="benefit-desc">Lumibelle 202605 생일월 특전권 · 미사용 / 기간 내</p>',
            '<div class="ticket-card-footer">',
              '<button class="ticket-action is-primary" type="button" data-ticket-detail="birthday">상세 보기</button>',
              '<span class="ticket-chip">사용 가능</span>',
            '</div>',
          '</article>',

          '<article class="benefit-summary-card">',
            '<span class="benefit-kicker">신규 이벤트 대상</span>',
            '<h3 class="benefit-title">Welcome Ticket</h3>',
            '<p class="benefit-desc">공식 계정과 멤버 계정 전체 팔로우 확인 후 지급 · 사용 가능 멤버: 루미벨</p>',
            '<div class="ticket-card-footer">',
              '<span class="ticket-chip">상세 보기</span>',
              '<span class="ticket-chip">사용 대기</span>',
            '</div>',
          '</article>',

          '<article class="benefit-summary-card">',
            '<span class="benefit-kicker">보유 중</span>',
            '<h3 class="benefit-title">메아테 특전권</h3>',
            '<p class="benefit-desc">메아테 루루 지정 혜택. 메아테 특전권과 물판 포인트는 별도예요.</p>',
            '<div class="ticket-card-footer">',
              '<span class="ticket-chip">상세 보기</span>',
              '<span class="ticket-chip is-primary">사용 가능</span>',
            '</div>',
          '</article>',

          '<article class="benefit-summary-card is-locked">',
            '<span class="benefit-kicker">합류 이벤트</span>',
            '<h3 class="benefit-title">Join Ticket</h3>',
            '<p class="benefit-desc">새로운 만남을 위한 이벤트 티켓 자리가 이곳에 열릴 예정이에요.</p>',
            '<div class="ticket-card-footer">',
              '<span class="ticket-chip is-locked">잠금</span>',
            '</div>',
          '</article>',
        '</div>',
      '</div>',

      '<div class="ticket-panel" data-ticket-panel="past">',
        '<div class="ticket-empty">' + text("ticket.empty.past", "지난 티켓은 공연이 끝난 뒤 이곳에 모여요.") + '</div>',
      '</div>',

      '<div class="ticket-detail-sheet" data-ticket-detail-sheet aria-hidden="true">',
        '<div class="ticket-detail-head">',
          '<strong data-ticket-detail-title>티켓 상세</strong>',
          '<button class="ticket-close" type="button" data-ticket-detail-close>닫기</button>',
        '</div>',
        '<div class="ticket-detail-body" data-ticket-detail-body></div>',
      '</div>',
    '</section>'
  ].join("");
};

window.LumiApps.ticketDetails = {
  "lumi-pass": [
    '<article class="lumi-pass-card">',
      '<div class="ticket-topline">',
        '<span class="ticket-pill">LUMI PASS · E-TICKET</span>',
        '<span class="ticket-date">2026.07.12 SUN<br>OPEN 17:30 · START 18:00</span>',
      '</div>',
      '<h3 class="ticket-pass-name">LUMI PASS</h3>',
      '<h4 class="ticket-event-title">Lumibelle Debut Live</h4>',
      '<p class="ticket-place">KT&amp;G 상상마당 라이브홀 · 서울 마포구</p>',
      '<div class="entry-box">',
        '<span class="entry-label">ENTRY NO.</span>',
        '<b class="entry-number">0001</b>',
      '</div>',
      '<p class="ticket-note">이 티켓은 루미벨의 이야기에 들어가는 작은 초대장입니다.<br>입장 시 현장 확인 시 입장번호를 보여주세요.</p>',
      '<div class="ticket-info-grid">',
        '<div class="ticket-info-cell"><span>RESERVATION</span><b>LBT-0712-0001</b></div>',
        '<div class="ticket-info-cell"><span>MEATE</span><b>루루</b></div>',
        '<div class="ticket-info-cell"><span>TYPE</span><b>사전예약</b></div>',
        '<div class="ticket-info-cell"><span>STATUS</span><b>입금확인완료 / 미입장</b></div>',
      '</div>',
      '<div class="ticket-card-footer">',
        '<span class="ticket-chip">QR은 보조 확인용</span>',
        '<span class="ticket-chip">현장에서 제시</span>',
        '<span class="ticket-chip is-primary">첫 번째 점이 되는 날</span>',
      '</div>',
    '</article>'
  ].join(""),

  "birthday": [
    '<article class="birthday-ticket-card">',
      '<div class="ticket-topline">',
        '<span class="ticket-pill">HAPPY BIRTHDAY · SPECIAL TICKET</span>',
        '<span class="ticket-date">사용 기간<br>05.01 ~ 05.31</span>',
      '</div>',
      '<h3 class="ticket-pass-name">Birthday Ticket</h3>',
      '<h4 class="ticket-event-title">Lumibelle 202605 생일월 특전권</h4>',
      '<p class="ticket-place">생일 기념 촬영 특전권 · 생일 당월 1일~말일까지</p>',
      '<div class="birthday-period">',
        '<span>BIRTHDAY MONTH</span>',
        '<b>05.01 ~ 05.31</b>',
      '</div>',
      '<div class="ticket-info-grid">',
        '<div class="ticket-info-cell"><span>USE</span><b>오시 생일 체키</b></div>',
        '<div class="ticket-info-cell"><span>OR</span><b>당일 출연 멤버 단체 생일 체키</b></div>',
        '<div class="ticket-info-cell"><span>RULE</span><b>본인 사용 / 양도 불가</b></div>',
        '<div class="ticket-info-cell"><span>STATUS</span><b>미사용 / 기간 내</b></div>',
      '</div>',
      '<div class="ticket-card-footer">',
        '<span class="ticket-chip is-primary">사용 가능</span>',
        '<span class="ticket-chip">생일 시즌 특별 티켓</span>',
      '</div>',
    '</article>'
  ].join("")
};

window.LumiApps.bindTicket = function (root) {
  var app = root.querySelector("[data-ticket-app]");
  if (!app || app.__lumiTicketBound) return;
  app.__lumiTicketBound = true;

  function openDetail(type) {
    var sheet = app.querySelector("[data-ticket-detail-sheet]");
    var body = app.querySelector("[data-ticket-detail-body]");
    var title = app.querySelector("[data-ticket-detail-title]");
    if (!sheet || !body) return;

    body.innerHTML = window.LumiApps.ticketDetails[type] || "";
    if (title) title.textContent = type === "birthday" ? "Birthday Ticket" : "LUMI PASS";
    sheet.classList.add("is-open");
    sheet.setAttribute("aria-hidden", "false");
  }

  function closeDetail() {
    var sheet = app.querySelector("[data-ticket-detail-sheet]");
    if (!sheet) return;
    sheet.classList.remove("is-open");
    sheet.setAttribute("aria-hidden", "true");
  }

  app.addEventListener("click", function (e) {
    var close = e.target.closest("[data-ticket-detail-close]");
    if (close) {
      closeDetail();
      return;
    }

    var detail = e.target.closest("[data-ticket-detail]");
    if (detail) {
      openDetail(detail.getAttribute("data-ticket-detail"));
      return;
    }

    var tab = e.target.closest("[data-ticket-tab]");
    if (!tab) return;

    var target = tab.getAttribute("data-ticket-tab");

    app.querySelectorAll("[data-ticket-tab]").forEach(function (el) {
      el.classList.toggle("is-active", el === tab);
    });

    app.querySelectorAll("[data-ticket-panel]").forEach(function (panel) {
      panel.classList.toggle("is-active", panel.getAttribute("data-ticket-panel") === target);
    });

    closeDetail();
  });
};
