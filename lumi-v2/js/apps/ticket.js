window.LumiApps = window.LumiApps || {};

window.LumiTicketRuntime = window.LumiTicketRuntime || {
  activeApp: null,
  notificationListenerBound: false,
  systemBackListenerBound: false
};

window.LumiApps.ticket = function (app, ctx) {
  var t = ctx.t;

  function text(key, fallback) {
    var value = t(key);
    return value === key ? fallback : value;
  }

  return [
    '<section class="ticket-app ticket-layout-v2" data-ticket-app>',
      '<section class="ticket-title-zone" aria-label="티켓함">',
        '<span class="ticket-title-kicker">LUMI TICKET</span>',
        '<h2>티켓함</h2>',
      '</section>',

      '<div class="ticket-tabs" role="tablist" aria-label="' + text("ticket.tabs", "티켓함 탭") + '">',
        '<button class="ticket-tab is-active" type="button" data-ticket-tab="current">' + text("ticket.current", "현재 티켓") + '</button>',
        '<button class="ticket-tab" type="button" data-ticket-tab="benefit">' + text("ticket.benefit", "특전권") + '</button>',
        '<button class="ticket-tab" type="button" data-ticket-tab="past">' + text("ticket.past", "지난 티켓") + '</button>',
      '</div>',

      '<div class="ticket-panel is-active" data-ticket-panel="current">',
        '<button class="ticket-transfer-inbox-notice" type="button" data-ticket-incoming-transfer hidden>',
          '<strong>티켓 양도 요청이 있어요</strong><span data-ticket-incoming-transfer-copy>양도 요청 1건</span><em>확인하기</em>',
        '</button>',
        '<div class="ticket-toolbar">',
          '<span class="ticket-count" data-ticket-current-count>보유 티켓 <b>2장</b></span>',
          '<button type="button" class="ticket-sort" data-ticket-sort data-ticket-sort-order="latest">',
            '<span data-ticket-sort-label>예매일 최신순</span><span class="ticket-sort-arrow" aria-hidden="true">⌄</span>',
          '</button>',
        '</div>',

        '<div class="ticket-list">',
          '<article class="ticket-list-card" data-ticket-id="ticket-debut-A-023" data-ticket-order="1" data-ticket-event-end-at="2026-07-12T21:30:00+09:00">',
            '<div class="ticket-poster-column">',
              '<div class="ticket-poster-slot" data-asset-slot="ticket-poster-debut">공연 이미지</div>',
            '</div>',
            '<div class="ticket-list-copy">',
              '<span class="ticket-type-chip">메인 공연</span>',
              '<h3>루미벨 데뷔 라이브</h3>',
              '<p class="ticket-info-line">2026.07.12 (일) 오후 6:00</p>',
              '<p class="ticket-info-line">홍대 상상마당 라이브홀</p>',
              '<p class="ticket-info-line">예매번호 <b>A-023</b></p>',
            '</div>',
            '<div class="ticket-qr-area">',
              '<div class="ticket-qr-slot" data-asset-slot="ticket-qr-debut">QR 이미지</div>',
              '<span>입장용 QR</span>',
            '</div>',
            '<span class="ticket-state-chip ticket-card-state">입장 전</span>',
            '<button class="ticket-detail-link" type="button" data-ticket-detail="ticket:ticket-debut-A-023">상세 보기</button>',
          '</article>',

          '<article class="ticket-list-card" data-ticket-id="ticket-shine-B-114" data-ticket-order="2" data-ticket-event-end-at="2026-07-26T19:00:00+09:00">',
            '<div class="ticket-poster-column">',
              '<div class="ticket-poster-slot" data-asset-slot="ticket-poster-shine">공연 이미지</div>',
            '</div>',
            '<div class="ticket-list-copy">',
              '<span class="ticket-type-chip">미니 라이브</span>',
              '<h3>Shine Me UP 미니 라이브</h3>',
              '<p class="ticket-info-line">2026.07.26 (일) 오후 5:00</p>',
              '<p class="ticket-info-line">서교 스테이지</p>',
              '<p class="ticket-info-line">예매번호 <b>B-114</b></p>',
            '</div>',
            '<div class="ticket-qr-area">',
              '<div class="ticket-qr-slot" data-asset-slot="ticket-qr-shine">QR 이미지</div>',
              '<span>입장용 QR</span>',
            '</div>',
            '<span class="ticket-state-chip ticket-card-state is-usable">사용 가능</span>',
            '<button class="ticket-detail-link" type="button" data-ticket-detail="ticket:ticket-shine-B-114">상세 보기</button>',
          '</article>',
        '</div>',

        '<div class="ticket-notice">입장용 QR은 공연 당일에 확인할 수 있어요.</div>',
      '</div>',

      '<div class="ticket-panel" data-ticket-panel="benefit">',
        '<div class="ticket-toolbar">',
          '<span class="ticket-count">보유 특전권 <b>3장</b></span>',
        '</div>',
        '<div class="benefit-ticket-list">',
          '<article class="benefit-ticket-card benefit-ticket-card--birthday" data-benefit-order="1" data-benefit-status="unavailable" data-benefit-expiry="99999999" data-benefit-issued="0">',
            '<div class="benefit-image-slot" data-asset-slot="benefit-birthday">특전 이미지</div>',
            '<div class="benefit-ticket-copy">',
              '<span class="ticket-type-chip">BIRTHDAY</span>',
              '<h3>Birthday Ticket</h3>',
              '<div class="benefit-ticket-facts">',
                '<div class="benefit-ticket-row"><span>사용 기간</span><b>생일 설정 후 표시</b></div>',
              '</div>',
            '</div>',
            '<span class="ticket-state-chip ticket-card-state">생일 미설정</span>',
            '<button type="button" class="ticket-detail-link benefit-detail-link" data-ticket-detail="birthday">상세 보기</button>',
          '</article>',
          '<article class="benefit-ticket-card benefit-ticket-card--welcome" data-benefit-order="2" data-benefit-status="available" data-benefit-expiry="99999999" data-benefit-issued="20260712">',
            '<div class="benefit-image-slot" data-asset-slot="benefit-welcome">특전 이미지</div>',
            '<div class="benefit-ticket-copy">',
              '<span class="ticket-type-chip">WELCOME</span>',
              '<h3>Welcome Ticket</h3>',
              '<div class="benefit-ticket-facts">',
                '<div class="benefit-ticket-row"><span>구성</span><b>핀체키 1장 · 샤메 1장 · 교류 60초</b></div>',
                '<div class="benefit-ticket-row"><span>사용 가능 기간</span><b>사용 완료 전까지</b></div>',
              '</div>',
            '</div>',
            '<span class="ticket-state-chip ticket-card-state is-usable">사용 가능</span>',
            '<button type="button" class="ticket-detail-link benefit-detail-link" data-ticket-detail="welcome">상세 보기</button>',
          '</article>',
          '<article class="benefit-ticket-card benefit-ticket-card--meate" data-benefit-order="3" data-benefit-status="empty" data-benefit-expiry="99999999" data-benefit-issued="0">',
            '<div class="benefit-image-slot" data-asset-slot="benefit-meate">특전 이미지</div>',
            '<div class="benefit-ticket-copy">',
              '<span class="ticket-type-chip">MEATE</span>',
              '<h3>메아테 특전권</h3>',
              '<div class="benefit-ticket-facts">',
                '<div class="benefit-ticket-row"><span>보유 수</span><b data-meate-outer-total>0장</b></div>',
                '<div class="benefit-ticket-row"><span>사용 가능 기간</span><b>권종별 상이</b></div>',
              '</div>',
            '</div>',
            '<span class="ticket-state-chip ticket-card-state" data-meate-outer-state>보유 없음</span>',
            '<button type="button" class="ticket-detail-link benefit-detail-link" data-ticket-detail="meate">상세 보기</button>',
          '</article>',
        '</div>',
      '</div>',

      '<div class="ticket-panel" data-ticket-panel="past">',
        '<div class="ticket-toolbar">',
          '<span class="ticket-count" data-ticket-past-count>지난 티켓 <b>0장</b></span>',
          '<span class="ticket-past-caption">공연 종료 후 자동 보관</span>',
        '</div>',
        '<div class="ticket-list ticket-past-list" data-ticket-past-list></div>',
        '<div class="ticket-empty" data-ticket-past-empty>' + text("ticket.empty.past", "지난 티켓은 공연이 끝난 뒤 이곳에 모여요.") + '</div>',
      '</div>',

      '<div class="ticket-detail-sheet" data-ticket-detail-sheet aria-hidden="true">',
        '<div class="ticket-detail-body" data-ticket-detail-body></div>',
      '</div>',
      '<section class="ticket-transfer-unavailable-modal" data-ticket-transfer-unavailable aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="ticket-transfer-unavailable-title">',
        '<div class="ticket-transfer-unavailable-backdrop" data-ticket-transfer-unavailable-close></div>',
        '<div class="ticket-transfer-unavailable-dialog">',
          '<div class="ticket-transfer-unavailable-art-slot" data-asset-slot="ticket-transfer-unavailable-art">안내 이미지</div>',
          '<strong id="ticket-transfer-unavailable-title">양도할 수 없어요</strong>',
          '<p class="ticket-transfer-unavailable-message" data-ticket-transfer-unavailable-message>공연 당일에는 티켓을 양도할 수 없어요.</p>',
          '<p class="ticket-transfer-unavailable-submessage" data-ticket-transfer-unavailable-submessage>양도는 공연 전날 23:59까지 가능해요.</p>',
          '<section class="ticket-transfer-unavailable-reasons">',
            '<strong>양도할 수 없는 다른 경우</strong>',
            '<ul>',
              '<li>이미 사용된 티켓</li>',
              '<li>양도 횟수 초과</li>',
              '<li>존재하지 않는 루미폰 ID</li>',
            '</ul>',
          '</section>',
          '<button type="button" class="ticket-transfer-unavailable-confirm" data-ticket-transfer-unavailable-close>확인</button>',
          '<button type="button" class="ticket-transfer-unavailable-detail" data-ticket-transfer-unavailable-detail>티켓 상세로</button>',
        '</div>',
      '</section>',
      '<section class="ticket-transfer-cancel-modal" data-ticket-transfer-cancel-modal aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="ticket-transfer-cancel-title">',
        '<div class="ticket-transfer-cancel-backdrop" data-ticket-transfer-cancel-back></div>',
        '<div class="ticket-transfer-cancel-dialog">',
          '<div class="ticket-transfer-cancel-art-slot" data-asset-slot="ticket-transfer-cancel-art">안내 이미지</div>',
          '<strong id="ticket-transfer-cancel-title" data-ticket-transfer-cancel-title>양도 요청을 취소할까요?</strong>',
          '<p class="ticket-transfer-cancel-message" data-ticket-transfer-cancel-message>취소하면 양도 요청이 사라져요.</p>',
          '<p class="ticket-transfer-cancel-submessage" data-ticket-transfer-cancel-submessage><span>티켓은 내 계정에 그대로 유지돼요.</span><span>기존 입장 QR도 계속 사용할 수 있어요.</span></p>',
          '<section class="ticket-transfer-cancel-summary" data-ticket-transfer-cancel-summary>',
            '<dl>',
              '<div><dt>공연명</dt><dd>루미벨 데뷔 라이브</dd></div>',
              '<div><dt>양수인 닉네임</dt><dd data-ticket-transfer-cancel-recipient>딸기토끼</dd></div>',
              '<div><dt>루미폰 ID</dt><dd data-ticket-transfer-cancel-recipient-id>LB-1002</dd></div>',
            '</dl>',
          '</section>',
          '<div class="ticket-transfer-cancel-actions">',
            '<button type="button" class="ticket-detail-action ticket-detail-action-primary" data-ticket-transfer-cancel-confirm>요청 취소</button>',
            '<button type="button" class="ticket-detail-action" data-ticket-transfer-cancel-back>돌아가기</button>',
          '</div>',
        '</div>',
      '</section>',
      '<section class="ticket-transfer-accept-modal" data-ticket-transfer-accept-modal aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="ticket-transfer-accept-title">',
        '<div class="ticket-transfer-accept-backdrop" data-ticket-transfer-accept-cancel></div>',
        '<div class="ticket-transfer-accept-dialog">',
          '<div class="ticket-transfer-accept-art-slot" data-asset-slot="ticket-transfer-accept-art">최종 확인 이미지</div>',
          '<strong id="ticket-transfer-accept-title">티켓을 받을까요?</strong>',
          '<p class="ticket-transfer-accept-copy">양도를 수락하면 티켓이 내 티켓함으로 이동해요.<br>기존 예매자의 입장 QR은 즉시 무효화되고,<br>내 계정에 새로운 입장 QR이 발급돼요.</p>',
          '<dl class="ticket-transfer-accept-event">',
            '<div><dt>공연명</dt><dd>루미벨 데뷔 라이브</dd></div>',
            '<div><dt>일시</dt><dd>2026.07.12 (일) 오후 6:00</dd></div>',
            '<div><dt>장소</dt><dd>홍대 상상마당 라이브홀</dd></div>',
            '<div><dt>권종</dt><dd>일반 티켓 1매</dd></div>',
          '</dl>',
          '<section class="ticket-transfer-accept-donor">',
            '<strong>양도인 정보</strong>',
            '<dl><div><dt>양도인</dt><dd>루미</dd></div><div><dt>루미폰 ID</dt><dd>LB-1001</dd></div></dl>',
          '</section>',
          '<section class="ticket-transfer-accept-notice"><p>수락 후에는 되돌릴 수 없어요.</p><p>공연 당일에는 변경 및 취소가 어려울 수 있어요.</p></section>',
          '<div class="ticket-transfer-accept-actions">',
            '<button type="button" class="ticket-transfer-accept-confirm" data-ticket-transfer-accept-confirm>받기</button>',
            '<button type="button" class="ticket-transfer-accept-cancel" data-ticket-transfer-accept-cancel>취소</button>',
          '</div>',
        '</div>',
      '</section>',
    '</section>'
  ].join("");
};

window.LumiApps.ticketDetails = {
  "lumi-pass": [
    '<section class="ticket-detail-page ticket-detail-page--event">',
      '<header class="ticket-detail-topbar">',
        '<button class="ticket-detail-back" type="button" data-ticket-detail-close aria-label="뒤로"><span aria-hidden="true">‹</span></button>',
        '<strong>티켓 상세</strong>',
        '<span aria-hidden="true"></span>',
      '</header>',

      '<article class="ticket-detail-card ticket-detail-card--event">',
        '<div class="ticket-detail-event-head">',
          '<div class="ticket-detail-event-copy">',
            '<span class="ticket-type-chip">메인 공연</span>',
            '<h3>루미벨 데뷔 라이브</h3>',
          '</div>',
          '<span class="ticket-detail-state is-usable">입장 전</span>',
        '</div>',

        '<div class="ticket-detail-ticket-grid">',
          '<dl class="ticket-detail-info-list">',
            '<div><dt>공연명</dt><dd>루미벨 데뷔 라이브</dd></div>',
            '<div><dt>일시</dt><dd>2026.07.12 (일) 오후 6:00</dd></div>',
            '<div><dt>장소</dt><dd>홍대 상상마당 라이브홀</dd></div>',
            '<div><dt>예매번호</dt><dd class="ticket-detail-number">A-023</dd></div>',
            '<div><dt>권종</dt><dd>일반 티켓 1매</dd></div>',
            '<div><dt>입장 순서</dt><dd>현장 확인</dd></div>',
          '</dl>',
          '<aside class="ticket-detail-visuals">',
            '<div class="ticket-detail-poster-slot" data-asset-slot="ticket-detail-poster">공연 이미지</div>',
            '<div class="ticket-detail-qr-card">',
              '<div class="ticket-detail-qr-slot" data-asset-slot="ticket-detail-qr">QR 이미지</div>',
              '<span>입장용 QR</span>',
            '</div>',
          '</aside>',
        '</div>',

        '<section class="ticket-detail-guide">',
          '<strong>안내</strong>',
          '<ul>',
            '<li>공연 시작 10분 전까지 입장해 주세요.</li>',
            '<li>입장 시 입장용 QR을 스탭에게 보여주세요.</li>',
            '<li>QR코드는 캡처본 사용이 불가합니다.</li>',
            '<li>본 티켓은 1회만 사용 가능하며, 재입장 불가합니다.</li>',
          '</ul>',
        '</section>',

        '<dl class="ticket-detail-meta">',
          '<div><dt>예매자</dt><dd>루미</dd></div>',
          '<div><dt>발급일</dt><dd>2026.06.10</dd></div>',
        '</dl>',

        '<div class="ticket-detail-actions">',
          '<button type="button" class="ticket-detail-action ticket-detail-action-primary" data-ticket-qr-expand>QR 크게 보기</button>',
          '<button type="button" class="ticket-detail-action" data-ticket-transfer>양도하기</button>',
          '<button type="button" class="ticket-detail-action ticket-detail-action-refund" data-ticket-refund>취소 / 환불</button>',
        '</div>',
      '</article>',
    '</section>'
  ].join(""),
  "lumi-pass-qr": [
    '<section class="ticket-qr-page">',
      '<header class="ticket-qr-topbar">',
        '<button class="ticket-detail-back" type="button" data-ticket-qr-back aria-label="티켓 상세로"><span aria-hidden="true">‹</span></button>',
        '<strong>QR 크게 보기</strong>',
        '<span aria-hidden="true"></span>',
      '</header>',
      '<article class="ticket-qr-card">',
        '<div class="ticket-qr-event-head">',
          '<div><h3>루미벨 데뷔 라이브</h3></div>',
          '<span class="ticket-detail-state is-usable">입장 전</span>',
        '</div>',
        '<dl class="ticket-qr-event-info">',
          '<div><dt>일시</dt><dd>2026.07.12 (일) 오후 6:00</dd></div>',
          '<div><dt>장소</dt><dd>홍대 상상마당 라이브홀</dd></div>',
          '<div><dt>예매번호</dt><dd class="ticket-detail-number">A-023</dd></div>',
        '</dl>',
        '<section class="ticket-qr-display" aria-label="입장용 QR">',
          '<div class="ticket-qr-large-slot" data-asset-slot="ticket-detail-qr-large">QR 이미지</div>',
          '<strong>입장용 QR</strong>',
        '</section>',
        '<section class="ticket-qr-guide">',
          '<ul>',
            '<li>입장 시 스탭에게 QR을 보여주세요.</li>',
            '<li>QR 코드는 캡처본 사용이 불가합니다.</li>',
            '<li>화면 밝기를 높이면 더 잘 보여요.</li>',
          '</ul>',
        '</section>',
        '<div class="ticket-qr-actions">',
          '<button type="button" class="ticket-detail-action ticket-detail-action-primary" data-ticket-detail-close>닫기</button>',
          '<button type="button" class="ticket-detail-action" data-ticket-qr-back>티켓 상세로</button>',
        '</div>',
      '</article>',
    '</section>'
  ].join(""),
  "lumi-pass-transfer": [
    '<section class="ticket-transfer-page">',
      '<header class="ticket-transfer-topbar">',
        '<button class="ticket-detail-back" type="button" data-ticket-transfer-back aria-label="티켓 상세로"><span aria-hidden="true">‹</span></button>',
        '<strong>양도하기</strong>',
        '<span aria-hidden="true"></span>',
      '</header>',
      '<article class="ticket-transfer-summary">',
        '<div class="ticket-transfer-summary-head">',
          '<div class="ticket-transfer-summary-copy">',
            '<span class="ticket-type-chip">메인 공연</span>',
            '<h3>루미벨 데뷔 라이브</h3>',
          '</div>',
          '<span class="ticket-detail-state is-usable">입장 전</span>',
        '</div>',
        '<div class="ticket-transfer-ticket-grid">',
          '<dl class="ticket-transfer-info-list">',
            '<div><dt>일시</dt><dd>2026.07.12 (일) 오후 6:00</dd></div>',
            '<div><dt>장소</dt><dd>홍대 상상마당 라이브홀</dd></div>',
            '<div><dt>예매번호</dt><dd class="ticket-detail-number">A-023</dd></div>',
            '<div><dt>권종</dt><dd>일반 티켓 1매</dd></div>',
          '</dl>',
          '<aside class="ticket-transfer-visuals">',
            '<div class="ticket-transfer-poster-slot" data-asset-slot="ticket-transfer-poster">공연 이미지</div>',
          '</aside>',
        '</div>',
      '</article>',
      '<section class="ticket-transfer-account-card">',
        '<strong class="ticket-transfer-section-title">양도 받을 계정</strong>',
        '<div class="ticket-transfer-id-row">',
          '<label for="ticket-transfer-id">루미폰 ID</label>',
          '<input id="ticket-transfer-id" type="text" placeholder="예: LB-1234" autocomplete="off" aria-label="루미폰 ID">',
          '<button type="button" class="ticket-transfer-check" data-ticket-transfer-check>계정 확인</button>',
        '</div>',
        '<div class="ticket-transfer-nickname-row">',
          '<span>닉네임 확인</span>',
          '<div class="ticket-transfer-readonly is-empty" data-ticket-transfer-nickname>계정 확인 후 표시돼요</div>',
          '<span class="ticket-transfer-row-spacer" aria-hidden="true"></span>',
        '</div>',
        '<p class="ticket-transfer-account-message" data-ticket-transfer-message aria-live="polite"></p>',
      '</section>',
      '<section class="ticket-transfer-guide">',
        '<strong class="ticket-transfer-section-title">양도 안내</strong>',
        '<ul>',
          '<li>양도는 루미폰 계정 간에만 가능해요.</li>',
          '<li>공연 전날 23:59까지 양도할 수 있어요.</li>',
          '<li>공연 당일에는 양도할 수 없어요.</li>',
          '<li>티켓 1장은 1회만 양도할 수 있어요.</li>',
          '<li>양도 완료 시 기존 입장 QR은 즉시 무효화돼요.</li>',
          '<li>양수인 계정에 새 입장 QR이 발급돼요.</li>',
        '</ul>',
      '</section>',
      '<section class="ticket-transfer-meta-card">',
        '<strong class="ticket-transfer-section-title">양도 정보</strong>',
        '<dl class="ticket-transfer-meta">',
          '<div><dt>양도인</dt><dd>루미</dd></div>',
          '<div><dt>양수인</dt><dd data-ticket-transfer-recipient>계정 확인 전</dd></div>',
          '<div><dt>양도 가능 횟수</dt><dd>1회 중 1회</dd></div>',
        '</dl>',
      '</section>',
      '<div class="ticket-transfer-actions">',
        '<button type="button" class="ticket-detail-action ticket-detail-action-primary" data-ticket-transfer-submit disabled>양도 요청 보내기</button>',
        '<button type="button" class="ticket-detail-action" data-ticket-transfer-back>취소</button>',
      '</div>',
    '</section>'
  ].join(""),
  "lumi-pass-transfer-pending": [
    '<section class="ticket-transfer-pending-page">',
      '<header class="ticket-transfer-topbar">',
        '<button class="ticket-detail-back" type="button" data-ticket-transfer-pending-back aria-label="티켓 상세로"><span aria-hidden="true">‹</span></button>',
        '<strong>양도 요청 확인</strong>',
        '<span aria-hidden="true"></span>',
      '</header>',
      '<section class="ticket-transfer-pending-hero">',
        '<span class="ticket-detail-state is-usable">수락 대기</span>',
        '<div>',
          '<h3>양도 요청을 보냈어요</h3>',
          '<p>양수인이 티켓을 수락해야 양도가 완료돼요.</p>',
        '</div>',
      '</section>',
      '<article class="ticket-transfer-pending-ticket">',
        '<div class="ticket-transfer-pending-poster-slot" data-asset-slot="ticket-transfer-pending-poster">공연 이미지</div>',
        '<dl class="ticket-transfer-pending-info-list">',
          '<div><dt>공연명</dt><dd>루미벨 데뷔 라이브</dd></div>',
          '<div><dt>일시</dt><dd>2026.07.12 (일) 오후 6:00</dd></div>',
          '<div><dt>장소</dt><dd>홍대 상상마당 라이브홀</dd></div>',
          '<div><dt>예매번호</dt><dd class="ticket-detail-number">A-023</dd></div>',
          '<div><dt>권종</dt><dd>일반 티켓 1매</dd></div>',
        '</dl>',
      '</article>',
      '<div class="ticket-transfer-pending-bottom-grid">',
        '<section class="ticket-transfer-pending-recipient">',
          '<strong class="ticket-transfer-section-title">양수인 정보</strong>',
          '<dl class="ticket-transfer-pending-recipient-list">',
            '<div><dt>닉네임</dt><dd data-ticket-pending-recipient-name></dd></div>',
            '<div><dt>루미폰 ID</dt><dd data-ticket-pending-recipient-id></dd></div>',
          '</dl>',
        '</section>',
        '<section class="ticket-transfer-pending-meta-card">',
          '<strong class="ticket-transfer-section-title">양도 정보</strong>',
          '<dl class="ticket-transfer-pending-meta">',
            '<div><dt>양도인</dt><dd>루미</dd></div>',
            '<div><dt>양도 가능 횟수</dt><dd>잔여 0회</dd></div>',
            '<div><dt>요청 유효 기간</dt><dd>공연 전날<br>23:59까지</dd></div>',
            '<div><dt>처리 기준</dt><dd>수락 시 QR<br>즉시 갱신</dd></div>',
          '</dl>',
        '</section>',
      '</div>',
      '<section class="ticket-transfer-progress-card">',
        '<strong class="ticket-transfer-section-title">양도 진행 상태</strong>',
        '<ol class="ticket-transfer-progress">',
          '<li class="is-complete"><span>1</span><strong>요청 전송</strong><em data-ticket-transfer-request-time></em></li>',
          '<li class="is-current"><span>2</span><strong>수락 대기</strong><em data-ticket-transfer-accepted-time>대기 중</em></li>',
          '<li><span>3</span><strong>양도 완료</strong><em data-ticket-transfer-completed-time>완료 시 표시</em></li>',
        '</ol>',
      '</section>',
      '<section class="ticket-transfer-guide ticket-transfer-pending-guide">',
        '<strong class="ticket-transfer-section-title">양도 안내</strong>',
        '<ul>',
          '<li>양수인이 수락하면 양도가 완료돼요.</li>',
          '<li>양도 완료 시 기존 입장 QR은 즉시 무효화돼요.</li>',
          '<li>양수인 계정에 새 입장 QR이 발급돼요.</li>',
          '<li>양수인 수락 전까지 요청을 취소할 수 있어요.</li>',
        '</ul>',
      '</section>',
      '<div class="ticket-transfer-pending-actions">',
        '<button type="button" class="ticket-detail-action ticket-detail-action-primary" data-ticket-transfer-pending-home>티켓함으로</button>',
        '<button type="button" class="ticket-detail-action" data-ticket-transfer-pending-detail>요청 상세 보기</button>',
      '</div>',
    '</section>'
  ].join(""),
  "lumi-pass-transfer-request-detail": [
    '<section class="ticket-transfer-pending-page">',
      '<header class="ticket-transfer-topbar">',
        '<button class="ticket-detail-back" type="button" data-ticket-transfer-request-detail-back aria-label="티켓 상세로"><span aria-hidden="true">‹</span></button>',
        '<strong>양도 요청 상세</strong>',
        '<span aria-hidden="true"></span>',
      '</header>',
      '<section class="ticket-transfer-pending-hero">',
        '<span class="ticket-detail-state is-usable">수락 대기</span>',
        '<div>',
          '<h3>양도 요청을 보냈어요</h3>',
          '<p>양수인이 티켓을 수락해야 양도가 완료돼요.</p>',
        '</div>',
      '</section>',
      '<article class="ticket-transfer-pending-ticket">',
        '<div class="ticket-transfer-pending-poster-slot" data-asset-slot="ticket-transfer-pending-poster">공연 이미지</div>',
        '<dl class="ticket-transfer-pending-info-list">',
          '<div><dt>공연명</dt><dd>루미벨 데뷔 라이브</dd></div>',
          '<div><dt>일시</dt><dd>2026.07.12 (일) 오후 6:00</dd></div>',
          '<div><dt>장소</dt><dd>홍대 상상마당 라이브홀</dd></div>',
          '<div><dt>예매번호</dt><dd class="ticket-detail-number">A-023</dd></div>',
          '<div><dt>권종</dt><dd>일반 티켓 1매</dd></div>',
        '</dl>',
      '</article>',
      '<div class="ticket-transfer-pending-bottom-grid">',
        '<section class="ticket-transfer-pending-recipient">',
          '<strong class="ticket-transfer-section-title">양수인 정보</strong>',
          '<dl class="ticket-transfer-pending-recipient-list">',
            '<div><dt>닉네임</dt><dd data-ticket-pending-recipient-name></dd></div>',
            '<div><dt>루미폰 ID</dt><dd data-ticket-pending-recipient-id></dd></div>',
          '</dl>',
        '</section>',
        '<section class="ticket-transfer-pending-meta-card">',
          '<strong class="ticket-transfer-section-title">양도 정보</strong>',
          '<dl class="ticket-transfer-pending-meta">',
            '<div><dt>양도인</dt><dd>루미</dd></div>',
            '<div><dt>양도 가능 횟수</dt><dd>잔여 0회</dd></div>',
            '<div><dt>요청 유효 기간</dt><dd>공연 전날<br>23:59까지</dd></div>',
            '<div><dt>처리 기준</dt><dd>수락 시 QR<br>즉시 갱신</dd></div>',
          '</dl>',
        '</section>',
      '</div>',
      '<section class="ticket-transfer-progress-card">',
        '<strong class="ticket-transfer-section-title">양도 진행 상태</strong>',
        '<ol class="ticket-transfer-progress">',
          '<li class="is-complete"><span>1</span><strong>요청 전송</strong><em data-ticket-transfer-request-time></em></li>',
          '<li class="is-current"><span>2</span><strong>수락 대기</strong><em data-ticket-transfer-accepted-time>대기 중</em></li>',
          '<li><span>3</span><strong>양도 완료</strong><em data-ticket-transfer-completed-time>완료 시 표시</em></li>',
        '</ol>',
      '</section>',
      '<section class="ticket-transfer-guide ticket-transfer-pending-guide">',
        '<strong class="ticket-transfer-section-title">양도 안내</strong>',
        '<ul>',
          '<li>양수인이 수락하면 양도가 완료돼요.</li>',
          '<li>양도 완료 시 기존 입장 QR은 즉시 무효화돼요.</li>',
          '<li>양수인 계정에 새 입장 QR이 발급돼요.</li>',
          '<li>양수인 수락 전까지 요청을 취소할 수 있어요.</li>',
        '</ul>',
      '</section>',
      '<div class="ticket-transfer-pending-actions">',
        '<button type="button" class="ticket-detail-action ticket-detail-action-primary" data-ticket-transfer-request-detail-home>티켓함으로</button>',
        '<button type="button" class="ticket-detail-action" data-ticket-transfer-request-detail-cancel>요청 취소</button>',
      '</div>',
    '</section>'
  ].join(""),
  "lumi-pass-transfer-request": [
    '<section class="ticket-transfer-request-page">',
      '<header class="ticket-transfer-topbar">',
        '<button class="ticket-detail-back" type="button" data-ticket-transfer-request-close aria-label="닫기"><span aria-hidden="true">‹</span></button>',
        '<strong>티켓 양도 요청</strong>',
        '<span aria-hidden="true"></span>',
      '</header>',
      '<article class="ticket-transfer-request-ticket">',
        '<div class="ticket-transfer-request-ticket-head">',
          '<span class="ticket-detail-state is-usable">수락 대기</span>',
          '<strong class="ticket-transfer-request-kicker">공연 정보</strong>',
        '</div>',
        '<div class="ticket-transfer-request-ticket-grid">',
          '<div class="ticket-transfer-request-poster-slot" data-asset-slot="ticket-transfer-request-poster">공연 이미지</div>',
          '<dl class="ticket-transfer-request-info-list">',
            '<div><dt>공연명</dt><dd>루미벨 데뷔 라이브</dd></div>',
            '<div><dt>일시</dt><dd>2026.07.12 (일) 오후 6:00</dd></div>',
            '<div><dt>장소</dt><dd>홍대 상상마당 라이브홀</dd></div>',
            '<div><dt>예매번호</dt><dd class="ticket-detail-number">A-023</dd></div>',
            '<div class="ticket-transfer-request-ticket-type"><dt>권종</dt><dd>일반 티켓 1매</dd></div>',
          '</dl>',
        '</div>',
      '</article>',
      '<section class="ticket-transfer-request-donor">',
        '<strong class="ticket-transfer-section-title">양도인 정보</strong>',
        '<div class="ticket-transfer-request-split">',
          '<dl class="ticket-transfer-request-donor-list">',
            '<div><dt>양도인</dt><dd>루미</dd></div>',
            '<div><dt>루미폰 ID</dt><dd>LB-1001</dd></div>',
          '</dl>',
          '<p class="ticket-transfer-request-note">양도를 수락하면 티켓이<br>내 티켓함으로 이동하고<br>새 입장 QR이 발급돼요.</p>',
        '</div>',
      '</section>',
      '<section class="ticket-transfer-guide ticket-transfer-request-guide">',
        '<strong class="ticket-transfer-section-title">받기 전 안내</strong>',
        '<ul>',
          '<li>요청을 수락하면 내 티켓함으로 티켓이 이동해요.</li>',
          '<li>기존 예매자의 입장 QR은 즉시 무효화돼요.</li>',
          '<li>내 계정으로 새 입장 QR이 발급돼요.</li>',
          '<li>잘못된 요청이면 거절할 수 있어요.</li>',
        '</ul>',
      '</section>',
      '<section class="ticket-transfer-request-account">',
        '<strong class="ticket-transfer-section-title">내 계정 확인</strong>',
        '<div class="ticket-transfer-request-split">',
          '<dl class="ticket-transfer-request-account-list">',
            '<div><dt>양수인</dt><dd>딸기토끼</dd></div>',
            '<div><dt>루미폰 ID</dt><dd>LB-1002</dd></div>',
          '</dl>',
          '<p class="ticket-transfer-request-note">받을 계정이 맞는지<br>확인해 주세요.</p>',
        '</div>',
      '</section>',
      '<div class="ticket-transfer-request-actions">',
        '<button type="button" class="ticket-detail-action ticket-detail-action-primary" data-ticket-transfer-request-accept>받기</button>',
        '<button type="button" class="ticket-detail-action" data-ticket-transfer-request-reject>거절하기</button>',
      '</div>',
    '</section>'
  ].join(""),
  "lumi-pass-transfer-accepted": [
    '<section class="ticket-transfer-result-page ticket-transfer-result-page--accepted">',
      '<header class="ticket-transfer-topbar">',
        '<button class="ticket-detail-back" type="button" data-ticket-transfer-result-close aria-label="닫기"><span aria-hidden="true">‹</span></button>',
        '<strong>양도 수락 완료</strong>',
        '<span aria-hidden="true"></span>',
      '</header>',
      '<section class="ticket-transfer-result-hero">',
        '<span class="ticket-detail-state is-usable">수락 완료</span>',
        '<div>',
          '<h3>티켓 양도가 완료되었어요</h3>',
          '<p>티켓이 내 티켓함으로 들어왔어요.</p>',
        '</div>',
      '</section>',
      '<article class="ticket-transfer-result-ticket">',
        '<div class="ticket-transfer-result-poster-slot" data-asset-slot="ticket-transfer-result-poster">공연 이미지</div>',
        '<dl class="ticket-transfer-result-info-list">',
          '<div><dt>공연명</dt><dd>루미벨 데뷔 라이브</dd></div>',
          '<div><dt>일시</dt><dd>2026.07.12 (일) 오후 6:00</dd></div>',
          '<div><dt>장소</dt><dd>홍대 상상마당 라이브홀</dd></div>',
          '<div><dt>예매번호</dt><dd class="ticket-detail-number">A-023</dd></div>',
          '<div class="ticket-transfer-result-ticket-type"><dt>권종</dt><dd>일반 티켓 1매</dd></div>',
        '</dl>',
      '</article>',
      '<div class="ticket-transfer-result-bottom-grid">',
        '<section class="ticket-transfer-result-donor">',
          '<strong class="ticket-transfer-section-title">양도인 정보</strong>',
          '<dl class="ticket-transfer-result-person-list">',
            '<div><dt>양도인</dt><dd>루미</dd></div>',
            '<div><dt>루미폰 ID</dt><dd>LB-1001</dd></div>',
          '</dl>',
        '</section>',
        '<section class="ticket-transfer-result-recipient">',
          '<strong class="ticket-transfer-section-title">내 정보 (수락 결과)</strong>',
          '<dl class="ticket-transfer-result-person-list">',
            '<div><dt>계정</dt><dd>딸기토끼</dd></div>',
            '<div><dt>루미폰 ID</dt><dd>LB-1002</dd></div>',
          '</dl>',
          '<p class="ticket-transfer-result-qr-note">새 입장 QR이<br>내 계정으로 발급됐어요.</p>',
        '</section>',
      '</div>',
      '<section class="ticket-transfer-guide ticket-transfer-result-guide">',
        '<strong class="ticket-transfer-section-title">안내 사항</strong>',
        '<ul>',
          '<li>기존 양도인의 QR은 즉시 무효화됐어요.</li>',
          '<li>새 입장 QR이 내 계정으로 발급됐어요.</li>',
          '<li>티켓은 티켓함에서 확인할 수 있어요.</li>',
          '<li>입장 및 이용은 새 QR로만 가능해요.</li>',
        '</ul>',
      '</section>',
      '<section class="ticket-transfer-result-progress-card">',
        '<strong class="ticket-transfer-section-title">양도 진행 상태</strong>',
        '<ol class="ticket-transfer-result-progress">',
          '<li class="is-complete"><span>1</span><strong>요청 도착</strong><em data-ticket-result-requested-at></em></li>',
          '<li class="is-complete"><span>2</span><strong>수락 완료</strong><em data-ticket-result-accepted-at></em></li>',
        '</ol>',
      '</section>',
      '<div class="ticket-transfer-result-actions">',
        '<button type="button" class="ticket-detail-action ticket-detail-action-primary" data-ticket-transfer-result-ticket>티켓 보러가기</button>',
        '<button type="button" class="ticket-detail-action" data-ticket-transfer-result-close>닫기</button>',
      '</div>',
    '</section>'
  ].join(""),
  "lumi-pass-transfer-rejected": [
    '<section class="ticket-transfer-result-page ticket-transfer-result-page--rejected">',
      '<header class="ticket-transfer-topbar">',
        '<button class="ticket-detail-back" type="button" data-ticket-transfer-result-close aria-label="닫기"><span aria-hidden="true">‹</span></button>',
        '<strong>양도 거절 완료</strong>',
        '<span aria-hidden="true"></span>',
      '</header>',
      '<section class="ticket-transfer-result-hero">',
        '<span class="ticket-detail-state">거절 완료</span>',
        '<div>',
          '<h3>양도 요청을 거절했어요</h3>',
          '<p>티켓은 양도인에게 그대로 유지돼요.</p>',
        '</div>',
      '</section>',
      '<article class="ticket-transfer-result-ticket">',
        '<div class="ticket-transfer-result-poster-slot" data-asset-slot="ticket-transfer-result-poster">공연 이미지</div>',
        '<dl class="ticket-transfer-result-info-list">',
          '<div><dt>공연명</dt><dd>루미벨 데뷔 라이브</dd></div>',
          '<div><dt>일시</dt><dd>2026.07.12 (일) 오후 6:00</dd></div>',
          '<div><dt>장소</dt><dd>홍대 상상마당 라이브홀</dd></div>',
          '<div><dt>예매번호</dt><dd class="ticket-detail-number">A-023</dd></div>',
          '<div class="ticket-transfer-result-ticket-type"><dt>권종</dt><dd>일반 티켓 1매</dd></div>',
        '</dl>',
      '</article>',
      '<div class="ticket-transfer-result-bottom-grid">',
        '<section class="ticket-transfer-result-donor">',
          '<strong class="ticket-transfer-section-title">양도인 정보</strong>',
          '<dl class="ticket-transfer-result-person-list">',
            '<div><dt>양도인</dt><dd>루미</dd></div>',
            '<div><dt>루미폰 ID</dt><dd>LB-1001</dd></div>',
          '</dl>',
        '</section>',
        '<section class="ticket-transfer-result-recipient">',
          '<strong class="ticket-transfer-section-title">내 처리 결과</strong>',
          '<dl class="ticket-transfer-result-person-list">',
            '<div><dt>계정</dt><dd>딸기토끼</dd></div>',
            '<div><dt>루미폰 ID</dt><dd>LB-1002</dd></div>',
          '</dl>',
          '<p class="ticket-transfer-result-qr-note">거절 처리 완료<br>새 입장 QR은 발급되지 않았어요.</p>',
        '</section>',
      '</div>',
      '<section class="ticket-transfer-guide ticket-transfer-result-guide">',
        '<strong class="ticket-transfer-section-title">안내 사항</strong>',
        '<ul>',
          '<li>거절된 티켓은 내 티켓함으로 이동되지 않아요.</li>',
          '<li>기존 티켓은 양도인 계정에 그대로 유지돼요.</li>',
          '<li>새 입장 QR은 발급되지 않았어요.</li>',
          '<li>필요하면 다시 양도 요청을 받을 수 있어요.</li>',
        '</ul>',
      '</section>',
      '<section class="ticket-transfer-result-progress-card">',
        '<strong class="ticket-transfer-section-title">양도 진행 상태</strong>',
        '<ol class="ticket-transfer-result-progress">',
          '<li class="is-complete"><span>1</span><strong>요청 도착</strong><em data-ticket-result-requested-at></em></li>',
          '<li class="is-complete"><span>2</span><strong>거절 처리</strong><em data-ticket-result-rejected-at></em></li>',
        '</ol>',
      '</section>',
      '<div class="ticket-transfer-result-actions">',
        '<button type="button" class="ticket-detail-action ticket-detail-action-primary" data-ticket-transfer-result-ticket>티켓함으로</button>',
        '<button type="button" class="ticket-detail-action" data-ticket-transfer-result-close>닫기</button>',
      '</div>',
    '</section>'
  ].join(""),
  "lumi-pass-transferred": [
    '<section class="ticket-transferred-page">',
      '<header class="ticket-detail-topbar">',
        '<button class="ticket-detail-back" type="button" data-ticket-transferred-close aria-label="닫기"><span aria-hidden="true">‹</span></button>',
        '<strong>티켓 상세</strong>',
        '<span aria-hidden="true"></span>',
      '</header>',
      '<article class="ticket-transferred-card">',
        '<div class="ticket-transferred-event-head">',
          '<div class="ticket-transferred-event-copy">',
            '<span class="ticket-type-chip">메인 공연</span>',
            '<h3>루미벨 데뷔 라이브</h3>',
          '</div>',
          '<span class="ticket-transferred-state">양도 완료</span>',
        '</div>',
        '<div class="ticket-transferred-ticket-grid">',
          '<dl class="ticket-transferred-info-list">',
            '<div><dt>공연명</dt><dd>루미벨 데뷔 라이브</dd></div>',
            '<div><dt>일시</dt><dd>2026.07.12 (일) 오후 6:00</dd></div>',
            '<div><dt>장소</dt><dd>홍대 상상마당 라이브홀</dd></div>',
            '<div><dt>예매번호</dt><dd class="ticket-detail-number">A-023</dd></div>',
            '<div><dt>권종</dt><dd>일반 티켓 1매</dd></div>',
            '<div><dt>상태</dt><dd class="ticket-transferred-status-copy">양도 완료</dd></div>',
          '</dl>',
          '<aside class="ticket-transferred-visuals">',
            '<div class="ticket-transferred-poster-slot" data-asset-slot="ticket-transferred-poster">공연 이미지</div>',
            '<div class="ticket-transferred-qr-card">',
              '<div class="ticket-transferred-qr-slot" data-asset-slot="ticket-transferred-qr-disabled">기존 QR 사용 불가</div>',
              '<span>기존 QR 사용 불가</span>',
            '</div>',
          '</aside>',
        '</div>',
      '</article>',
      '<section class="ticket-transferred-history-card">',
        '<strong class="ticket-transferred-section-title">양도 완료 내역</strong>',
        '<dl class="ticket-transferred-history-list">',
          '<div><dt>양도 완료 시각</dt><dd data-ticket-transferred-completed-at></dd></div>',
          '<div><dt>양수인</dt><dd data-ticket-transferred-recipient-name></dd></div>',
          '<div><dt>루미폰 ID</dt><dd data-ticket-transferred-recipient-id></dd></div>',
          '<div><dt>처리 상태</dt><dd class="ticket-transferred-status-copy">양도 완료</dd></div>',
        '</dl>',
      '</section>',
      '<section class="ticket-transferred-guide">',
        '<ul>',
          '<li>이 티켓은 양도 완료되어 내 계정에서 입장할 수 없어요.</li>',
          '<li>기존 입장 QR은 즉시 무효화됐어요.</li>',
          '<li>새 입장 QR은 양수인 계정에서 확인할 수 있어요.</li>',
          '<li>티켓 이력에서 양도 정보를 다시 볼 수 있어요.</li>',
        '</ul>',
      '</section>',
      '<dl class="ticket-transferred-meta">',
        '<div><dt>기존 예매자</dt><dd>루미</dd></div>',
        '<div><dt>발급일</dt><dd>2026.06.10</dd></div>',
      '</dl>',
      '<div class="ticket-transferred-actions">',
        '<button type="button" class="ticket-detail-action ticket-detail-action-primary" data-ticket-transferred-history>양도 이력 보기</button>',
        '<button type="button" class="ticket-detail-action" data-ticket-transferred-home>티켓함으로</button>',
      '</div>',
    '</section>'
  ].join(""),
  "lumi-pass-transfer-history": [
    '<section class="ticket-transfer-history-page">',
      '<header class="ticket-detail-topbar">',
        '<button class="ticket-detail-back" type="button" data-ticket-transfer-history-back aria-label="티켓 상세로"><span aria-hidden="true">‹</span></button>',
        '<strong>양도 이력</strong>',
        '<span aria-hidden="true"></span>',
      '</header>',
      '<section class="ticket-transfer-history-intro">',
        '<p>티켓 양도와 수락의 전체 진행 이력을 확인할 수 있어요.</p>',
      '</section>',
      '<article class="ticket-transfer-history-event">',
        '<div class="ticket-transfer-history-poster-slot" data-asset-slot="ticket-transfer-history-poster">공연 이미지</div>',
        '<div class="ticket-transfer-history-event-copy">',
          '<h3>루미벨 데뷔 라이브</h3>',
          '<dl class="ticket-transfer-history-event-list">',
            '<div><dt>일시</dt><dd>2026.07.12 (일) 오후 6:00</dd></div>',
            '<div><dt>장소</dt><dd>홍대 상상마당 라이브홀</dd></div>',
            '<div><dt>권종</dt><dd>일반 티켓 1매</dd></div>',
          '</dl>',
        '</div>',
      '</article>',
      '<section class="ticket-transfer-history-card">',
        '<ol class="ticket-transfer-timeline">',
          '<li>',
            '<time data-ticket-history-requested-at></time>',
            '<span class="ticket-transfer-timeline-marker">1</span>',
            '<div class="ticket-transfer-timeline-content"><strong>양도 요청 시각</strong><p>양도 요청이 완료됐어요.</p></div>',
          '</li>',
          '<li>',
            '<time data-ticket-history-recipient-confirmed-at></time>',
            '<span class="ticket-transfer-timeline-marker">2</span>',
            '<div class="ticket-transfer-timeline-content"><strong>양수인 계정 확인</strong><p><span data-ticket-history-recipient-name></span> · <span data-ticket-history-recipient-id></span></p></div>',
          '</li>',
          '<li>',
            '<time data-ticket-history-accepted-at></time>',
            '<span class="ticket-transfer-timeline-marker">3</span>',
            '<div class="ticket-transfer-timeline-content"><strong>수락 시각</strong><p>양수인이 양도를 수락했어요.</p></div>',
          '</li>',
          '<li>',
            '<time data-ticket-history-completed-at></time>',
            '<span class="ticket-transfer-timeline-marker">4</span>',
            '<div class="ticket-transfer-timeline-content"><strong>양도 완료 시각</strong><p>티켓이 양수인에게 전달됐어요.</p></div>',
          '</li>',
          '<li>',
            '<time data-ticket-history-qr-revoked-at></time>',
            '<span class="ticket-transfer-timeline-marker">5</span>',
            '<div class="ticket-transfer-timeline-content"><strong>기존 QR 무효화 완료</strong><p>기존 예매자의 입장 QR이 무효화됐어요.</p></div>',
          '</li>',
          '<li>',
            '<time data-ticket-history-qr-issued-at></time>',
            '<span class="ticket-transfer-timeline-marker">6</span>',
            '<div class="ticket-transfer-timeline-content"><strong>새 QR 발급 완료</strong><p>양수인 계정에 새 입장 QR이 발급됐어요.</p></div>',
          '</li>',
        '</ol>',
        '<div class="ticket-transfer-history-status"><span>처리 상태</span><strong>양도 완료</strong></div>',
      '</section>',
      '<p class="ticket-transfer-history-footnote">양도 내역은 티켓 상세와 티켓 이력에서 다시 확인할 수 있어요.</p>',
    '</section>'
  ].join(""),
  "lumi-pass-past": [
    '<section class="ticket-detail-page ticket-detail-page--past">',
      '<header class="ticket-detail-topbar">',
        '<button class="ticket-detail-back" type="button" data-ticket-detail-close aria-label="뒤로"><span aria-hidden="true">‹</span></button>',
        '<strong>지난 티켓</strong>',
        '<span aria-hidden="true"></span>',
      '</header>',
      '<article class="ticket-detail-card ticket-detail-card--event">',
        '<div class="ticket-detail-event-head">',
          '<div class="ticket-detail-event-copy">',
            '<span class="ticket-type-chip">공연 완료</span>',
            '<h3>루미벨 데뷔 라이브</h3>',
          '</div>',
          '<span class="ticket-detail-state">관람 완료</span>',
        '</div>',
        '<div class="ticket-detail-ticket-grid">',
          '<dl class="ticket-detail-info-list">',
            '<div><dt>공연명</dt><dd>루미벨 데뷔 라이브</dd></div>',
            '<div><dt>일시</dt><dd>2026.07.12 (일) 오후 6:00</dd></div>',
            '<div><dt>장소</dt><dd>홍대 상상마당 라이브홀</dd></div>',
            '<div><dt>예매번호</dt><dd class="ticket-detail-number">A-023</dd></div>',
            '<div><dt>권종</dt><dd>일반 티켓 1매</dd></div>',
            '<div><dt>상태</dt><dd>관람 완료</dd></div>',
          '</dl>',
          '<aside class="ticket-detail-visuals">',
            '<div class="ticket-detail-poster-slot" data-asset-slot="ticket-detail-poster">공연 이미지</div>',
          '</aside>',
        '</div>',
        '<section class="ticket-detail-guide">',
          '<strong>관람 기록</strong>',
          '<ul><li>공연이 종료되어 입장용 QR과 양도 기능은 사용할 수 없어요.</li><li>양도 이력이 있는 티켓은 이력만 계속 확인할 수 있어요.</li></ul>',
        '</section>',
        '<dl class="ticket-detail-meta">',
          '<div><dt>예매자</dt><dd>루미</dd></div>',
          '<div><dt>발급일</dt><dd>2026.06.10</dd></div>',
        '</dl>',
      '</article>',
    '</section>'
  ].join(""),
  "birthday": [
    '<section class="ticket-detail-page ticket-benefit-detail-page ticket-benefit-detail-page--simple">',
      '<header class="ticket-detail-topbar">',
        '<button class="ticket-detail-back" type="button" data-ticket-detail-close aria-label="뒤로"><span aria-hidden="true">‹</span></button>',
        '<strong>특전권 상세</strong>',
        '<span aria-hidden="true"></span>',
      '</header>',
      '<article class="ticket-detail-card ticket-benefit-hero">',
        '<div class="ticket-benefit-hero-visual" data-asset-slot="birthday-detail">특전 이미지</div>',
        '<div class="ticket-benefit-hero-copy">',
          '<div class="ticket-benefit-hero-head">',
            '<div><span class="ticket-type-chip">BIRTHDAY</span><h3>Birthday Ticket</h3></div>',
            '<span class="ticket-detail-state">생일 미설정</span>',
          '</div>',
          '<dl class="ticket-detail-info-list ticket-benefit-info-list">',
            '<div><dt>사용 기간</dt><dd>생일 설정 후 표시</dd></div>',
            '<div><dt>발급 상태</dt><dd>생일 설정 후 확인 가능</dd></div>',
          '</dl>',
        '</div>',
      '</article>',
      '<section class="ticket-benefit-section ticket-benefit-section--birthday">',
        '<h3>구성</h3>',
        '<div class="ticket-benefit-composition">',
          '<article><div class="ticket-benefit-item-slot" data-asset-slot="birthday-benefit-cheki">구성 이미지</div><strong>생일 체키 1장</strong><span>멤버 지정</span></article>',
          '<article><div class="ticket-benefit-item-slot" data-asset-slot="birthday-benefit-shame">구성 이미지</div><strong>샤메 1장</strong><span>멤버 지정</span></article>',
          '<article><div class="ticket-benefit-item-slot" data-asset-slot="birthday-benefit-talk">구성 이미지</div><strong>교류 120초</strong><span>멤버 지정</span></article>',
        '</div>',
      '</section>',
      '<section class="ticket-benefit-section">',
        '<h3>사용 가능 멤버</h3>',
        '<div class="ticket-benefit-member-list ticket-benefit-member-list--birthday">',
          '<article><div class="ticket-benefit-member-slot" data-asset-slot="birthday-member-maring">멤버 이미지</div><strong>마리링</strong></article>',
          '<article><div class="ticket-benefit-member-slot" data-asset-slot="birthday-member-ruru">멤버 이미지</div><strong>루루</strong></article>',
        '</div>',
      '</section>',
      '<section class="ticket-detail-guide ticket-benefit-guide">',
        '<strong>사용 방법</strong>',
        '<ul><li>공연 당일 특전회에서 Birthday Ticket을 스탭에게 보여주세요.</li><li>사용할 멤버를 선택한 뒤 생일 특전을 진행해요.</li><li>특전 사용이 완료되면 루미 체크인과 사용 기록이 함께 남아요.</li></ul>',
      '</section>',
      '<section class="ticket-detail-guide ticket-benefit-guide">',
        '<strong>사용 전 안내</strong>',
        '<ul><li>Birthday Ticket은 생일 당월에 1회만 사용할 수 있어요.</li><li>본인만 사용할 수 있으며, 양도 및 재발급은 어려워요.</li><li>교류 시간은 현장 운영 상황에 따라 변동될 수 있어요.</li></ul>',
      '</section>',
      '<button type="button" class="ticket-benefit-history-link" data-ticket-benefit-history="birthday">특전권 사용 기록 <span aria-hidden="true">›</span></button>',
    '</section>'
  ].join(""),
  "welcome": [
    '<section class="ticket-detail-page ticket-benefit-detail-page ticket-benefit-detail-page--welcome">',
      '<header class="ticket-detail-topbar">',
        '<button class="ticket-detail-back" type="button" data-ticket-detail-close aria-label="뒤로"><span aria-hidden="true">‹</span></button>',
        '<strong>특전권 상세</strong>',
        '<span aria-hidden="true"></span>',
      '</header>',
      '<article class="ticket-detail-card ticket-benefit-hero">',
        '<div class="ticket-benefit-hero-visual" data-asset-slot="welcome-detail">특전 이미지</div>',
        '<div class="ticket-benefit-hero-copy">',
          '<div class="ticket-benefit-hero-head">',
            '<div><span class="ticket-type-chip">WELCOME</span><h3>Welcome Ticket</h3></div>',
            '<span class="ticket-detail-state is-usable">사용 가능</span>',
          '</div>',
          '<dl class="ticket-detail-info-list ticket-benefit-info-list">',
            '<div><dt>권번호</dt><dd>발급 후 표시</dd></div>',
            '<div><dt>사용 기간</dt><dd>사용 완료 전까지</dd></div>',
          '</dl>',
        '</div>',
      '</article>',
      '<section class="ticket-benefit-section">',
        '<h3>구성</h3>',
        '<div class="ticket-benefit-composition">',
          '<article><div class="ticket-benefit-item-slot" data-asset-slot="welcome-benefit-pin">구성 이미지</div><strong>핀체키 1장</strong><span>멤버 지정</span></article>',
          '<article><div class="ticket-benefit-item-slot" data-asset-slot="welcome-benefit-shame">구성 이미지</div><strong>샤메 1장</strong><span>멤버 지정</span></article>',
          '<article><div class="ticket-benefit-item-slot" data-asset-slot="welcome-benefit-talk">구성 이미지</div><strong>교류 60초</strong><span>멤버 지정</span></article>',
        '</div>',
      '</section>',
      '<section class="ticket-benefit-section">',
        '<h3>사용 가능 멤버</h3>',
        '<div class="ticket-benefit-member-list">',
          '<article><div class="ticket-benefit-member-slot" data-asset-slot="welcome-member-maring">멤버 이미지</div><strong>마리링</strong></article>',
          '<article><div class="ticket-benefit-member-slot" data-asset-slot="welcome-member-ruru">멤버 이미지</div><strong>루루</strong></article>',
        '</div>',
      '</section>',
      '<section class="ticket-detail-guide ticket-benefit-guide">',
        '<strong>사용 방법</strong>',
        '<ul><li>공연 당일 현장에서 특전권을 스탭에게 제시해주세요.</li><li>구성품은 현장 운영 상황에 따라 변경될 수 있어요.</li></ul>',
      '</section>',
      '<section class="ticket-detail-guide ticket-benefit-guide">',
        '<strong>사용 전 안내</strong>',
        '<ul><li>본 특전권은 1회만 사용할 수 있어요.</li><li>분실 시 재발급이 어려우니 보관에 유의해주세요.</li><li>교류 시간은 현장 운영 상황에 따라 변동될 수 있어요.</li></ul>',
      '</section>',
      '<button type="button" class="ticket-benefit-history-link" data-ticket-benefit-history>특전권 사용 기록 <span aria-hidden="true">›</span></button>',
    '</section>'
  ].join(""),
  "welcome-usage-history": [
    '<section class="ticket-detail-page ticket-benefit-history-page">',
      '<header class="ticket-detail-topbar">',
        '<button class="ticket-detail-back" type="button" data-ticket-benefit-history-back="welcome" aria-label="특전권 상세로"><span aria-hidden="true">‹</span></button>',
        '<strong>특전권 사용 기록</strong>',
        '<span aria-hidden="true"></span>',
      '</header>',
      '<article class="ticket-benefit-history-summary">',
        '<div class="ticket-benefit-history-ticket-slot" data-asset-slot="welcome-history-ticket">특전 이미지</div>',
        '<div class="ticket-benefit-history-summary-copy">',
          '<div class="ticket-benefit-history-summary-head"><span>티켓명</span><strong>사용 완료</strong></div>',
          '<h3>Welcome Ticket</h3>',
          '<dl><div><dt>권번호</dt><dd>WT-2026-001</dd></div></dl>',
        '</div>',
      '</article>',
      '<section class="ticket-benefit-history-record">',
        '<h3>사용 완료 기록</h3>',
        '<dl class="ticket-benefit-history-list">',
          '<div><dt>사용 일시</dt><dd>2026.07.12 오후 7:24</dd></div>',
          '<div><dt>사용 공연</dt><dd>루미벨 데뷔 라이브</dd></div>',
          '<div class="ticket-benefit-history-member"><dt>사용 멤버</dt><dd><div class="ticket-benefit-history-member-slot" data-asset-slot="welcome-history-member">멤버 이미지</div><strong>마리링</strong></dd></div>',
          '<div class="ticket-benefit-history-composition-row"><dt>사용 구성</dt><dd><div class="ticket-benefit-history-used-items">',
            '<article><div class="ticket-benefit-history-item-slot" data-asset-slot="welcome-history-pin">구성 이미지</div><span>핀체키 1장</span></article>',
            '<article><div class="ticket-benefit-history-item-slot" data-asset-slot="welcome-history-shame">구성 이미지</div><span>샤메 1장</span></article>',
            '<article><div class="ticket-benefit-history-item-slot" data-asset-slot="welcome-history-talk">구성 이미지</div><span>교류 60초</span></article>',
          '</div></dd></div>',
          '<div class="ticket-benefit-history-state"><dt>처리 상태</dt><dd>사용 완료</dd></div>',
        '</dl>',
      '</section>',
      '<section class="ticket-benefit-history-finish">이 특전권은 사용 완료되었어요.</section>',
    '</section>'
  ].join(""),
  "meate": [
    '<section class="ticket-detail-page ticket-meate-overview-page">',
      '<header class="ticket-detail-topbar">',
        '<button class="ticket-detail-back" type="button" data-ticket-detail-close aria-label="뒤로"><span aria-hidden="true">‹</span></button>',
        '<strong>메아테 특전권</strong>',
        '<span aria-hidden="true"></span>',
      '</header>',
      '<article class="ticket-meate-summary">',
        '<div class="ticket-meate-summary-copy"><span class="ticket-type-chip">MEATE</span><h3>공연별 메아테 특전권</h3><p>대상 공연마다 발급된 특전권을 따로 확인할 수 있어요.</p></div>',
        '<div class="ticket-meate-count"><span>보유</span><strong>3장</strong><em>사용 가능 2장</em></div>',
      '</article>',
      '<section class="ticket-meate-list-section">',
        '<header><h3>보유한 특전권</h3><span>공연별 보관</span></header>',
        '<div class="ticket-meate-list">',
          '<article class="ticket-meate-event-card">',
            '<div class="ticket-meate-event-slot" data-asset-slot="meate-event-20260712">공연 이미지</div>',
            '<div class="ticket-meate-event-copy"><span>2026.07.12</span><h4>루미벨 데뷔 라이브</h4><p>핀 또는 투샷 1장 · 교류 120초</p><b class="is-usable">사용 가능</b></div>',
            '<button type="button" data-meate-benefit-detail="meate-event-debut" aria-label="루미벨 데뷔 라이브 메아테 특전권 상세 보기">상세 보기 <i aria-hidden="true">›</i></button>',
          '</article>',
          '<article class="ticket-meate-event-card">',
            '<div class="ticket-meate-event-slot" data-asset-slot="meate-event-20260726">공연 이미지</div>',
            '<div class="ticket-meate-event-copy"><span>2026.07.26</span><h4>루미벨 7월 정기공연</h4><p>핀 또는 투샷 1장 · 교류 120초</p><b class="is-usable">사용 가능</b></div>',
            '<button type="button" data-meate-benefit-detail="meate-event-july" aria-label="루미벨 7월 정기공연 메아테 특전권 상세 보기">상세 보기 <i aria-hidden="true">›</i></button>',
          '</article>',
          '<article class="ticket-meate-event-card">',
            '<div class="ticket-meate-event-slot" data-asset-slot="meate-event-20260802">공연 이미지</div>',
            '<div class="ticket-meate-event-copy"><span>2026.08.02</span><h4>루미벨 8월 정기공연</h4><p>핀 또는 투샷 1장 · 교류 120초</p><b>사용 완료</b></div>',
            '<button type="button" data-meate-benefit-detail="meate-event-august" aria-label="루미벨 8월 정기공연 메아테 특전권 상세 보기">상세 보기 <i aria-hidden="true">›</i></button>',
          '</article>',
        '</div>',
      '</section>',
      '<section class="ticket-detail-guide ticket-benefit-guide">',
        '<strong>메아테 특전권 안내</strong>',
        '<ul><li>메아테 특전권은 대상 공연의 입금 확인 후 발급돼요.</li><li>발급된 특전권은 공연별로 누적되어 보관돼요.</li></ul>',
      '</section>',
    '</section>'
  ].join(""),
  "meate-event-debut": [
    '<section class="ticket-detail-page ticket-benefit-detail-page ticket-benefit-detail-page--meate">',
      '<header class="ticket-detail-topbar">',
        '<button class="ticket-detail-back" type="button" data-meate-benefit-back aria-label="메아테 특전권 목록으로"><span aria-hidden="true">‹</span></button>',
        '<strong>특전권 상세</strong>',
        '<span aria-hidden="true"></span>',
      '</header>',
      '<article class="ticket-detail-card ticket-benefit-hero">',
        '<div class="ticket-benefit-hero-visual" data-asset-slot="meate-detail-debut">특전 이미지</div>',
        '<div class="ticket-benefit-hero-copy">',
          '<div class="ticket-benefit-hero-head"><div><span class="ticket-type-chip">MEATE</span><h3>메아테 특전권</h3></div><span class="ticket-detail-state is-usable">사용 가능</span></div>',
          '<dl class="ticket-detail-info-list ticket-benefit-info-list">',
            '<div><dt>대상 공연</dt><dd>루미벨 데뷔 라이브</dd></div>',
            '<div><dt>권번호</dt><dd>MT-2026-0712-01</dd></div>',
            '<div><dt>발급 일시</dt><dd>2026.07.12 입금 확인 후</dd></div>',
          '</dl>',
        '</div>',
      '</article>',
      '<section class="ticket-benefit-section">',
        '<h3>구성</h3>',
        '<div class="ticket-benefit-composition ticket-benefit-composition--two">',
          '<article><div class="ticket-benefit-item-slot" data-asset-slot="meate-benefit-photo">구성 이미지</div><strong>핀 또는 투샷 1장</strong><span>멤버 지정</span></article>',
          '<article><div class="ticket-benefit-item-slot" data-asset-slot="meate-benefit-talk">구성 이미지</div><strong>교류 120초</strong><span>멤버 지정</span></article>',
        '</div>',
      '</section>',
      '<section class="ticket-benefit-section">',
        '<h3>사용 가능 멤버</h3>',
        '<div class="ticket-benefit-member-list">',
          '<article><div class="ticket-benefit-member-slot" data-asset-slot="meate-member-maring">멤버 이미지</div><strong>마리링</strong></article>',
          '<article><div class="ticket-benefit-member-slot" data-asset-slot="meate-member-ruru">멤버 이미지</div><strong>루루</strong></article>',
        '</div>',
      '</section>',
      '<section class="ticket-detail-guide ticket-benefit-guide">',
        '<strong>사용 방법</strong>',
        '<ul><li>공연 당일 특전회에서 메아테 특전권을 스탭에게 보여주세요.</li><li>사용할 멤버와 촬영 종류를 확인한 뒤 특전을 진행해요.</li><li>특전 사용이 완료되면 루미 체크인과 사용 기록이 함께 남아요.</li></ul>',
      '</section>',
      '<section class="ticket-detail-guide ticket-benefit-guide">',
        '<strong>사용 전 안내</strong>',
        '<ul><li>메아테 특전권은 대상 공연별로 1회 사용할 수 있어요.</li><li>구성은 현장 운영 상황에 따라 안내될 수 있어요.</li><li>사용 완료 후에는 복구할 수 없어요.</li></ul>',
      '</section>',
    '</section>'
  ].join(""),
  "meate-event-july": [
    '<section class="ticket-detail-page ticket-benefit-detail-page ticket-benefit-detail-page--meate">',
      '<header class="ticket-detail-topbar">',
        '<button class="ticket-detail-back" type="button" data-meate-benefit-back aria-label="메아테 특전권 목록으로"><span aria-hidden="true">‹</span></button>',
        '<strong>특전권 상세</strong>',
        '<span aria-hidden="true"></span>',
      '</header>',
      '<article class="ticket-detail-card ticket-benefit-hero">',
        '<div class="ticket-benefit-hero-visual" data-asset-slot="meate-detail-july">특전 이미지</div>',
        '<div class="ticket-benefit-hero-copy">',
          '<div class="ticket-benefit-hero-head"><div><span class="ticket-type-chip">MEATE</span><h3>메아테 특전권</h3></div><span class="ticket-detail-state is-usable">사용 가능</span></div>',
          '<dl class="ticket-detail-info-list ticket-benefit-info-list">',
            '<div><dt>대상 공연</dt><dd>루미벨 7월 정기공연</dd></div>',
            '<div><dt>권번호</dt><dd>MT-2026-0726-01</dd></div>',
            '<div><dt>발급 일시</dt><dd>2026.07.26 입금 확인 후</dd></div>',
          '</dl>',
        '</div>',
      '</article>',
      '<section class="ticket-benefit-section"><h3>구성</h3><div class="ticket-benefit-composition ticket-benefit-composition--two"><article><div class="ticket-benefit-item-slot" data-asset-slot="meate-july-photo">구성 이미지</div><strong>핀 또는 투샷 1장</strong><span>멤버 지정</span></article><article><div class="ticket-benefit-item-slot" data-asset-slot="meate-july-talk">구성 이미지</div><strong>교류 120초</strong><span>멤버 지정</span></article></div></section>',
      '<section class="ticket-benefit-section"><h3>사용 가능 멤버</h3><div class="ticket-benefit-member-list"><article><div class="ticket-benefit-member-slot" data-asset-slot="meate-july-maring">멤버 이미지</div><strong>마리링</strong></article><article><div class="ticket-benefit-member-slot" data-asset-slot="meate-july-ruru">멤버 이미지</div><strong>루루</strong></article></div></section>',
      '<section class="ticket-detail-guide ticket-benefit-guide"><strong>사용 방법</strong><ul><li>공연 당일 특전회에서 메아테 특전권을 스탭에게 보여주세요.</li><li>사용할 멤버와 촬영 종류를 확인한 뒤 특전을 진행해요.</li><li>특전 사용이 완료되면 루미 체크인과 사용 기록이 함께 남아요.</li></ul></section>',
      '<section class="ticket-detail-guide ticket-benefit-guide"><strong>사용 전 안내</strong><ul><li>메아테 특전권은 대상 공연별로 1회 사용할 수 있어요.</li><li>구성은 현장 운영 상황에 따라 안내될 수 있어요.</li><li>사용 완료 후에는 복구할 수 없어요.</li></ul></section>',
    '</section>'
  ].join(""),
  "meate-event-august": [
    '<section class="ticket-detail-page ticket-benefit-detail-page ticket-benefit-detail-page--meate">',
      '<header class="ticket-detail-topbar">',
        '<button class="ticket-detail-back" type="button" data-meate-benefit-back aria-label="메아테 특전권 목록으로"><span aria-hidden="true">‹</span></button>',
        '<strong>특전권 상세</strong>',
        '<span aria-hidden="true"></span>',
      '</header>',
      '<article class="ticket-detail-card ticket-benefit-hero">',
        '<div class="ticket-benefit-hero-visual" data-asset-slot="meate-detail-august">특전 이미지</div>',
        '<div class="ticket-benefit-hero-copy">',
          '<div class="ticket-benefit-hero-head"><div><span class="ticket-type-chip">MEATE</span><h3>메아테 특전권</h3></div><span class="ticket-detail-state">사용 완료</span></div>',
          '<dl class="ticket-detail-info-list ticket-benefit-info-list">',
            '<div><dt>대상 공연</dt><dd>루미벨 8월 정기공연</dd></div>',
            '<div><dt>권번호</dt><dd>MT-2026-0802-01</dd></div>',
            '<div><dt>사용 상태</dt><dd>사용 완료</dd></div>',
          '</dl>',
        '</div>',
      '</article>',
      '<section class="ticket-benefit-section"><h3>구성</h3><div class="ticket-benefit-composition ticket-benefit-composition--two"><article><div class="ticket-benefit-item-slot" data-asset-slot="meate-august-photo">구성 이미지</div><strong>핀 또는 투샷 1장</strong><span>멤버 지정</span></article><article><div class="ticket-benefit-item-slot" data-asset-slot="meate-august-talk">구성 이미지</div><strong>교류 120초</strong><span>멤버 지정</span></article></div></section>',
      '<section class="ticket-benefit-section"><h3>사용 가능 멤버</h3><div class="ticket-benefit-member-list"><article><div class="ticket-benefit-member-slot" data-asset-slot="meate-august-maring">멤버 이미지</div><strong>마리링</strong></article><article><div class="ticket-benefit-member-slot" data-asset-slot="meate-august-ruru">멤버 이미지</div><strong>루루</strong></article></div></section>',
      '<section class="ticket-detail-guide ticket-benefit-guide"><strong>사용 방법</strong><ul><li>공연 당일 특전회에서 메아테 특전권을 스탭에게 보여주세요.</li><li>사용할 멤버와 촬영 종류를 확인한 뒤 특전을 진행해요.</li></ul></section>',
      '<section class="ticket-detail-guide ticket-benefit-guide"><strong>사용 전 안내</strong><ul><li>사용 완료된 메아테 특전권이에요.</li><li>사용 기록은 사용 완료 후 확인할 수 있어요.</li></ul></section>',
      '<button class="ticket-benefit-history-link" type="button" data-meate-benefit-history="meate-event-august">특전권 사용 기록 <span aria-hidden="true">›</span></button>',
    '</section>'
  ].join(""),
  "meate-event-august-usage-history": [
    '<section class="ticket-detail-page ticket-benefit-history-page">',
      '<header class="ticket-detail-topbar">',
        '<button class="ticket-detail-back" type="button" data-meate-benefit-history-back="meate-event-august" aria-label="메아테 특전권 상세로"><span aria-hidden="true">‹</span></button>',
        '<strong>특전권 사용 기록</strong>',
        '<span aria-hidden="true"></span>',
      '</header>',
      '<article class="ticket-benefit-history-summary">',
        '<div class="ticket-benefit-history-ticket-slot" data-asset-slot="meate-august-history-ticket">특전 이미지</div>',
        '<div class="ticket-benefit-history-summary-copy">',
          '<div class="ticket-benefit-history-summary-head"><span>티켓명</span><strong>사용 완료</strong></div>',
          '<h3>메아테 특전권</h3>',
          '<dl><div><dt>권번호</dt><dd>MT-2026-0802-01</dd></div></dl>',
        '</div>',
      '</article>',
      '<section class="ticket-benefit-history-record">',
        '<h3>사용 완료 기록</h3>',
        '<dl class="ticket-benefit-history-list">',
          '<div><dt>사용 일시</dt><dd>2026.08.02 오후 8:16</dd></div>',
          '<div><dt>사용 공연</dt><dd>루미벨 8월 정기공연</dd></div>',
          '<div class="ticket-benefit-history-member"><dt>사용 멤버</dt><dd><div class="ticket-benefit-history-member-slot" data-asset-slot="meate-august-history-member">멤버 이미지</div><strong>마리링</strong></dd></div>',
          '<div class="ticket-benefit-history-composition-row"><dt>사용 구성</dt><dd><div class="ticket-benefit-history-used-items">',
            '<article><div class="ticket-benefit-history-item-slot" data-asset-slot="meate-august-history-photo">구성 이미지</div><span>투샷 체키 1장</span></article>',
            '<article><div class="ticket-benefit-history-item-slot" data-asset-slot="meate-august-history-talk">구성 이미지</div><span>교류 120초</span></article>',
          '</div></dd></div>',
          '<div class="ticket-benefit-history-state"><dt>처리 상태</dt><dd>사용 완료</dd></div>',
        '</dl>',
      '</section>',
      '<section class="ticket-benefit-history-finish">이 메아테 특전권은 사용 완료되었어요.</section>',
    '</section>'
  ].join(""),
  "birthday-usage-history": [
    '<section class="ticket-detail-page ticket-benefit-history-page">',
      '<header class="ticket-detail-topbar">',
        '<button class="ticket-detail-back" type="button" data-ticket-benefit-history-back="birthday" aria-label="특전권 상세로"><span aria-hidden="true">‹</span></button>',
        '<strong>특전권 사용 기록</strong>',
        '<span aria-hidden="true"></span>',
      '</header>',
      '<article class="ticket-benefit-history-summary">',
        '<div class="ticket-benefit-history-ticket-slot" data-asset-slot="birthday-history-ticket">특전 이미지</div>',
        '<div class="ticket-benefit-history-summary-copy">',
          '<div class="ticket-benefit-history-summary-head"><span>티켓명</span><strong>사용 완료</strong></div>',
          '<h3>Birthday Ticket</h3>',
          '<dl><div><dt>권번호</dt><dd>BT-2026-001</dd></div></dl>',
        '</div>',
      '</article>',
      '<section class="ticket-benefit-history-record">',
        '<h3>사용 완료 기록</h3>',
        '<dl class="ticket-benefit-history-list">',
          '<div><dt>사용 일시</dt><dd>2026.07.12 오후 7:24</dd></div>',
          '<div><dt>사용 공연</dt><dd>루미벨 데뷔 라이브</dd></div>',
          '<div class="ticket-benefit-history-member"><dt>사용 멤버</dt><dd><div class="ticket-benefit-history-member-slot" data-asset-slot="birthday-history-member">멤버 이미지</div><strong>마리링</strong></dd></div>',
          '<div class="ticket-benefit-history-composition-row"><dt>사용 구성</dt><dd><div class="ticket-benefit-history-used-items">',
            '<article><div class="ticket-benefit-history-item-slot" data-asset-slot="birthday-history-cheki">구성 이미지</div><span>생일 체키 1장</span></article>',
            '<article><div class="ticket-benefit-history-item-slot" data-asset-slot="birthday-history-shame">구성 이미지</div><span>샤메 1장</span></article>',
            '<article><div class="ticket-benefit-history-item-slot" data-asset-slot="birthday-history-talk">구성 이미지</div><span>교류 120초</span></article>',
          '</div></dd></div>',
          '<div class="ticket-benefit-history-state"><dt>처리 상태</dt><dd>사용 완료</dd></div>',
        '</dl>',
      '</section>',
      '<section class="ticket-benefit-history-finish">이 특전권은 사용 완료되었어요.</section>',
    '</section>'
  ].join(""),
  "meate-usage-history": [
    '<section class="ticket-detail-page ticket-benefit-history-page">',
      '<header class="ticket-detail-topbar">',
        '<button class="ticket-detail-back" type="button" data-ticket-benefit-history-back="meate" aria-label="특전권 상세로"><span aria-hidden="true">‹</span></button>',
        '<strong>특전권 사용 기록</strong>',
        '<span aria-hidden="true"></span>',
      '</header>',
      '<article class="ticket-benefit-history-summary">',
        '<div class="ticket-benefit-history-ticket-slot" data-asset-slot="meate-history-ticket">특전 이미지</div>',
        '<div class="ticket-benefit-history-summary-copy">',
          '<div class="ticket-benefit-history-summary-head"><span>티켓명</span><strong>보유 없음</strong></div>',
          '<h3>메아테 특전권</h3>',
          '<dl><div><dt>보유 수</dt><dd>0장</dd></div></dl>',
        '</div>',
      '</article>',
      '<section class="ticket-benefit-history-empty">아직 사용한 메아테 특전권이 없어요.</section>',
    '</section>'
  ].join("")

};

window.LumiApps.bindTicket = function (root) {
  var app = root.querySelector("[data-ticket-app]");
  if (!app || app.__lumiTicketBound) return;
  app.__lumiTicketBound = true;
  window.LumiTicketRuntime.activeApp = app;

  var detailType = null;
  var transferRequestRecipient = null;
  // DB 연결 전 단일 원본. 실제 연동 시 GET /tickets, GET /ticket-transfers 응답으로 교체한다.
  // 화면은 ticketId / transferId / qr 상태만 참조하고, 개별 카드 문구를 직접 상태값으로 쓰지 않는다.
  var ticketStoreStorageKey = "lumiphone.ticketStore.v1";
  function loadTicketStore() {
    try {
      var saved = window.sessionStorage && window.sessionStorage.getItem(ticketStoreStorageKey);
      return saved ? JSON.parse(saved) : null;
    } catch (error) { return null; }
  }
  function saveTicketStore() {
    try {
      if (window.sessionStorage) window.sessionStorage.setItem(ticketStoreStorageKey, JSON.stringify(window.LumiTicketStore));
    } catch (error) {}
  }

  // 티켓 처리 결과는 문자함의 루미폰 운영 대화방에만 새 메시지로 추가한다.
  // 문자함 UI를 티켓 앱이 직접 건드리지 않는다.
  function enqueueOperationMessage(payload) {
    if (!payload || !payload.id) return;
    if (window.LumiPhoneMessages && typeof window.LumiPhoneMessages.addSystemMessage === 'function') {
      window.LumiPhoneMessages.addSystemMessage(payload);
    }
  }
  function createTransferOperationMessages(transfer, status, resolvedAt) {
    if (!transfer) return;
    var ticket = getTicketById(transfer.sourceTicketId);
    var eventTitle = ticket ? ticket.title : '티켓';
    var bookingNo = ticket ? ticket.bookingNo : '';
    var base = {
      member: 'system', box: 'operation', status: 'unread', from: '루미폰 운영', tag: '티켓',
      receivedAt: resolvedAt || new Date().toISOString(), choices: [], transferId: transfer.id,
      kind: 'result', actionType: 'ticket'
    };
    var senderId = transfer.sender && transfer.sender.id;
    var recipientId = transfer.recipient && transfer.recipient.id;
    var senderTicketRoute = 'ticket:' + transfer.sourceTicketId;
    var senderHistoryRoute = 'transfer-history:' + transfer.id;
    var recipientRoute = status === 'accepted' && transfer.receivedTicketId ? ('ticket:' + transfer.receivedTicketId) : null;
    var senderCopy = null;
    var recipientCopy = null;
    if (status === 'accepted') {
      senderCopy = { title: '티켓 양도가 완료되었어요.', preview: eventTitle + (bookingNo ? ' · 예매번호 ' + bookingNo : ''), actionLabel: '양도 이력 보기', route: senderHistoryRoute };
      recipientCopy = { title: '티켓을 받았어요.', preview: eventTitle + ' · 새 입장 QR 발급 완료', actionLabel: '받은 티켓 보기', route: recipientRoute };
    } else if (status === 'rejected') {
      senderCopy = { title: '티켓 양도 요청이 거절되었어요.', preview: eventTitle + ' · 티켓은 다시 양도할 수 있어요.', actionLabel: '티켓 보기', route: senderTicketRoute };
      recipientCopy = { title: '양도 요청을 거절했어요.', preview: eventTitle + ' · 요청이 종료되었어요.' };
    } else if (status === 'cancelled') {
      senderCopy = { title: '티켓 양도 요청을 취소했어요.', preview: eventTitle + ' · 티켓은 내 계정에 유지돼요.', actionLabel: '티켓 보기', route: senderTicketRoute };
      recipientCopy = { title: '티켓 양도 요청이 취소되었어요.', preview: eventTitle + ' · 요청이 종료되었어요.' };
    } else if (status === 'expired') {
      senderCopy = { title: '티켓 양도 요청이 만료되었어요.', preview: eventTitle + ' · 양도 가능 시간이 지났어요.', actionLabel: '티켓 보기', route: senderTicketRoute };
      recipientCopy = { title: '티켓 양도 요청이 만료되었어요.', preview: eventTitle + ' · 요청이 종료되었어요.' };
    }
    if (senderCopy && senderId) enqueueOperationMessage(Object.assign({}, base, senderCopy, { id: 'transfer-' + transfer.id + '-' + status + '-sender', audienceId: senderId }));
    if (recipientCopy && recipientId) enqueueOperationMessage(Object.assign({}, base, recipientCopy, { id: 'transfer-' + transfer.id + '-' + status + '-recipient', audienceId: recipientId }));
  }
  var defaultTicketStore = {
    tickets: [
      { id: "ticket-debut-A-023", status: "active", qrStatus: "active", transferCount: 0, transferRequestStatus: null, eventStartAt: "2026-07-12T18:00:00+09:00", eventEndAt: "2026-07-12T21:30:00+09:00", title: "루미벨 데뷔 라이브", dateLabel: "2026.07.12 (일) 오후 6:00", venue: "홍대 상상마당 라이브홀", bookingNo: "A-023", ticketType: "메인 공연", ownerId: "LB-1001", qrToken: "qr-ticket-debut-A-023" },
      { id: "ticket-shine-B-114", status: "active", qrStatus: "active", transferCount: 0, transferRequestStatus: null, eventStartAt: "2026-07-26T17:00:00+09:00", eventEndAt: "2026-07-26T19:00:00+09:00", title: "Shine Me UP 미니 라이브", dateLabel: "2026.07.26 (일) 오후 5:00", venue: "서교 스테이지", bookingNo: "B-114", ticketType: "미니 라이브", ownerId: "LB-1001", qrToken: "qr-ticket-shine-B-114" }
    ],
    transfers: [],
    viewerId: "LB-1001"
  };
  window.LumiTicketStore = window.LumiTicketStore || loadTicketStore() || defaultTicketStore;
  if (!Array.isArray(window.LumiTicketStore.tickets)) window.LumiTicketStore.tickets = defaultTicketStore.tickets;
  if (!Array.isArray(window.LumiTicketStore.transfers)) window.LumiTicketStore.transfers = [];
  if (!window.LumiTicketStore.viewerId) window.LumiTicketStore.viewerId = "LB-1001";
  var activeTicketId = "ticket-debut-A-023";
  function getTicketById(ticketId) {
    return window.LumiTicketStore.tickets.filter(function (ticket) { return ticket.id === ticketId; })[0] || null;
  }

  function getTransferForTicket(ticket) {
    if (!ticket) return null;
    var transferId = ticket.transferId || null;
    var sourceTicketId = ticket.sourceTicketId || ticket.id;
    return (window.LumiTicketStore.transfers || []).filter(function (transfer) {
      return (transferId && transfer.id === transferId) || transfer.sourceTicketId === sourceTicketId || transfer.receivedTicketId === ticket.id;
    })[0] || null;
  }

  function getPendingIncomingTransfers() {
    var viewerId = window.LumiTicketStore.viewerId;
    return (window.LumiTicketStore.transfers || []).filter(function (transfer) {
      return transfer.status === "pending" && transfer.recipient && transfer.recipient.id === viewerId;
    });
  }

  function hasResolvedIncomingTransfer() {
    var viewerId = window.LumiTicketStore.viewerId;
    return (window.LumiTicketStore.transfers || []).some(function (transfer) {
      return transfer.status === "accepted" && transfer.recipient && transfer.recipient.id === viewerId;
    });
  }

  // DB 연결 전에도 종료 상태를 한 transferId 기록으로 유지한다.
  // 실제 API 연결 시 이 함수들은 transfer PATCH 응답으로 대체한다.
  function getTransferDeadline(ticket) {
    if (!ticket || !ticket.eventStartAt) return null;
    var start = new Date(ticket.eventStartAt);
    if (Number.isNaN(start.getTime())) return null;
    var deadline = new Date(start);
    deadline.setDate(deadline.getDate() - 1);
    deadline.setHours(23, 59, 59, 999);
    return deadline;
  }


  // 환불 마감은 공연 현지 날짜 기준 7일 전 23:59이다.
  // API 연결 후에도 eventStartAt 원본 값을 기준으로 동일하게 계산한다.
  function getRefundDeadline(ticket) {
    if (!ticket || !ticket.eventStartAt) return null;
    var match = /^(\d{4})-(\d{2})-(\d{2})/.exec(ticket.eventStartAt);
    if (!match) return null;
    var year = Number(match[1]);
    var month = Number(match[2]) - 1;
    var day = Number(match[3]);
    var deadlineUtc = new Date(Date.UTC(year, month, day - 7, 23, 59, 0, 0));
    if (Number.isNaN(deadlineUtc.getTime())) return null;
    return deadlineUtc;
  }

  function formatRefundDeadline(ticket) {
    if (ticket && ticket.refundDeadline) return ticket.refundDeadline;
    var deadline = getRefundDeadline(ticket);
    if (!deadline) return '공연일 7일 전 23:59';
    var year = deadline.getUTCFullYear();
    var month = String(deadline.getUTCMonth() + 1).padStart(2, '0');
    var day = String(deadline.getUTCDate()).padStart(2, '0');
    return year + '.' + month + '.' + day + ' 23:59';
  }

  function getOpenTransferForSource(sourceTicketId) {
    return (window.LumiTicketStore.transfers || []).filter(function (transfer) {
      return transfer.sourceTicketId === sourceTicketId && transfer.status === 'pending';
    })[0] || null;
  }

  function resolveTransferRecord(transferId, status, resolvedAt) {
    var record = (window.LumiTicketStore.transfers || []).filter(function (transfer) { return transfer.id === transferId; })[0] || null;
    if (!record) return null;
    record.status = status;
    record.resolvedAt = resolvedAt || formatTransferTimestamp(new Date());
    var source = getTicketById(record.sourceTicketId);
    if (source && status !== 'accepted') {
      source.transferRequestStatus = null;
      source.status = source.status === 'transferred' ? source.status : 'active';
      source.qrStatus = source.qrStatus === 'revoked' ? source.qrStatus : 'active';
    }
    saveTicketStore();
    if (status === 'rejected' || status === 'cancelled' || status === 'expired') createTransferOperationMessages(record, status, record.resolvedAt);
    syncTransferNotification(record, status);
    return record;
  }

  function expirePendingTransfers(now) {
    var reference = now instanceof Date ? now : new Date();
    var changed = false;
    (window.LumiTicketStore.transfers || []).forEach(function (transfer) {
      if (transfer.status !== 'pending') return;
      var ticket = getTicketById(transfer.sourceTicketId);
      var deadline = getTransferDeadline(ticket);
      if (deadline && reference.getTime() > deadline.getTime()) {
        transfer.status = 'expired';
        transfer.resolvedAt = formatTransferTimestamp(reference);
        if (ticket) ticket.transferRequestStatus = null;
        createTransferOperationMessages(transfer, 'expired', transfer.resolvedAt);
        syncTransferNotification(transfer, 'expired');
        changed = true;
      }
    });
    if (changed) saveTicketStore();
    return changed;
  }
  function setActiveTicket(ticketId) {
    var ticket = getTicketById(ticketId);
    if (!ticket) return null;
    activeTicketId = ticket.id;
    sourceTicketState = ticket;
    return ticket;
  }
  var sourceTicketState = getTicketById(activeTicketId);
  // 하위 호환: 이전 테스트 도구가 참조하던 상태 객체도 최신 저장소를 바라본다.
  window.LumiTicketTransferState = window.LumiTicketTransferState || { receivedTicket: null, transferRecord: null };
  var transferAvailability = {
    allowed: true,
    message: "공연 당일에는 티켓을 양도할 수 없어요.",
    submessage: "양도는 공연 전날 23:59까지 가능해요."
  };
  // 이전 목업 화면 호환용 상태. 실제 요청 판정은 LumiTicketStore.transfers만 사용한다.
  var transferRequestState = {
    status: null,
    requestedAt: null,
    acceptedAt: null,
    rejectedAt: null,
    completedAt: null,
    cancelledAt: null
  };
  // 첫 렌더 전에도 만료된 요청은 수락 대기/뱃지에 남기지 않는다.
  expirePendingTransfers(new Date());

  // 팬 화면에서는 사용 완료를 직접 처리하지 않는다.
  // 실제 연결 시 스탭 OS의 특전권 사용 완료 결과를 이 구조로 전달한다.
  var benefitUsageState = {
    welcome: null,
    birthday: null
  };

  // 메아테는 공연별로 1장씩 쌓이는 권종이다.
  // 실제 DB 연결 시 이 배열만 서버 응답으로 교체하면 바깥 요약과 안쪽 목록이 함께 갱신된다.
  var meateBenefitTickets = [
    { id: "meate-event-debut", date: "2026.07.12", title: "루미벨 데뷔 라이브", status: "available", slot: "meate-event-20260712" },
    { id: "meate-event-july", date: "2026.07.26", title: "루미벨 7월 정기공연", status: "available", slot: "meate-event-20260726" },
    { id: "meate-event-august", date: "2026.08.02", title: "루미벨 8월 정기공연", status: "completed", slot: "meate-event-20260802" }
  ];

  function getMeateSummary() {
    var total = meateBenefitTickets.length;
    var available = meateBenefitTickets.filter(function (ticket) { return ticket.status === "available"; }).length;
    var completed = meateBenefitTickets.filter(function (ticket) { return ticket.status === "completed"; }).length;
    return { total: total, available: available, completed: completed };
  }

  function getIncomingTransferCount() {
    // 티켓함 요청 수는 실제 pending transfer만 기준으로 계산한다.
    return getPendingIncomingTransfers().length;
  }

  function syncIncomingTransferNotice() {
    var notice = app.querySelector("[data-ticket-incoming-transfer]");
    if (!notice) return;
    var count = getIncomingTransferCount();
    var copy = notice.querySelector("[data-ticket-incoming-transfer-copy]");
    notice.hidden = count === 0;
    if (copy) copy.textContent = "양도 요청 " + count + "건";
  }

  function syncTransferNotification(transfer, status) {
    if (!transfer || !window.LumiNotification) {
      syncIncomingTransferNotice();
      return;
    }
    var event = getTicketById(transfer.sourceTicketId);
    if (status === 'pending' && typeof window.LumiNotification.upsertTransferRequest === 'function') {
      window.LumiNotification.upsertTransferRequest(transfer, event);
    } else if (status && typeof window.LumiNotification.resolveTransferRequest === 'function') {
      window.LumiNotification.resolveTransferRequest(transfer.id, status, event);
    }
    syncIncomingTransferNotice();
  }

  function syncMeateBenefitCard() {
    var card = app.querySelector(".benefit-ticket-card--meate");
    if (!card) return;
    var summary = getMeateSummary();
    var total = card.querySelector("[data-meate-outer-total]");
    var state = card.querySelector("[data-meate-outer-state]");
    if (total) total.textContent = summary.total + "장";
    if (state) {
      state.classList.toggle("is-usable", summary.available > 0);
      state.textContent = summary.available > 0 ? "사용 가능 " + summary.available + "장" : (summary.total > 0 ? "사용 완료" : "보유 없음");
    }
    card.setAttribute("data-benefit-status", summary.available > 0 ? "available" : (summary.total ? "completed" : "empty"));
  }

  var meateActiveTab = "available";

  function renderMeateOverview() {
    var summary = getMeateSummary();
    var isCompletedTab = meateActiveTab === "completed";
    var visibleTickets = meateBenefitTickets.filter(function (ticket) {
      return isCompletedTab ? ticket.status === "completed" : ticket.status === "available";
    });
    var cards = visibleTickets.length ? visibleTickets.map(function (ticket) {
      var usable = ticket.status === "available";
      return [
        '<article class="ticket-meate-event-card">',
          '<div class="ticket-meate-event-slot" data-asset-slot="' + ticket.slot + '">공연 이미지</div>',
          '<div class="ticket-meate-event-copy">',
            '<span>' + ticket.date + '</span>',
            '<h4>' + ticket.title + '</h4>',
            '<p>핀 또는 투샷 1장 · 교류 120초</p>',
            '<b' + (usable ? ' class="is-usable"' : '') + '>' + (usable ? '사용 가능' : '사용 완료') + '</b>',
          '</div>',
          '<button type="button" data-meate-benefit-detail="' + ticket.id + '" aria-label="' + ticket.title + ' 메아테 특전권 상세 보기">' + (usable ? '상세 보기' : '사용 기록') + ' <i aria-hidden="true">›</i></button>',
        '</article>'
      ].join("");
    }).join("") : '<div class="ticket-benefit-history-empty">' + (isCompletedTab ? '아직 사용 완료된 메아테 특전권이 없어요.' : '아직 사용 가능한 메아테 특전권이 없어요.') + '</div>';

    return [
      '<section class="ticket-detail-page ticket-meate-overview-page">',
        '<header class="ticket-detail-topbar">',
          '<button class="ticket-detail-back" type="button" data-ticket-detail-close aria-label="뒤로"><span aria-hidden="true">‹</span></button>',
          '<strong>메아테 특전권</strong>',
          '<span aria-hidden="true"></span>',
        '</header>',
        '<article class="ticket-meate-summary">',
          '<div class="ticket-meate-summary-copy"><span class="ticket-type-chip">MEATE</span><h3>공연별 메아테 특전권</h3><p>대상 공연마다 발급된 특전권을 따로 확인할 수 있어요.</p></div>',
          '<div class="ticket-meate-count"><span>보유</span><strong>' + summary.total + '장</strong><em>사용 가능 ' + summary.available + '장</em></div>',
        '</article>',
        '<section class="ticket-meate-list-section">',
          '<div class="ticket-meate-tabs" role="tablist" aria-label="메아테 특전권 분류">',
            '<button type="button" class="ticket-meate-tab' + (!isCompletedTab ? ' is-active' : '') + '" data-meate-tab="available" role="tab" aria-selected="' + (!isCompletedTab) + '">보유한 특전권 <b>' + summary.available + '장</b></button>',
            '<button type="button" class="ticket-meate-tab' + (isCompletedTab ? ' is-active' : '') + '" data-meate-tab="completed" role="tab" aria-selected="' + isCompletedTab + '">사용 완료 기록 <b>' + summary.completed + '장</b></button>',
          '</div>',
          '<header><h3>' + (isCompletedTab ? '사용 완료 기록' : '보유한 특전권') + '</h3><span>공연별 보관</span></header>',
          '<div class="ticket-meate-list">' + cards + '</div>',
        '</section>',
        '<section class="ticket-detail-guide ticket-benefit-guide"><strong>메아테 특전권 안내</strong><ul><li>메아테 특전권은 대상 공연의 입금 확인 후 발급돼요.</li><li>발급된 특전권은 공연별로 누적되어 보관돼요.</li></ul></section>',
      '</section>'
    ].join("");
  }

  function normalizeBenefitUsage(type, record) {
    var fallback = type === "birthday"
      ? { ticketName: "Birthday Ticket", ticketNo: "B-2026-001", usedAt: "", eventName: "", memberName: "", composition: ["생일 체키 1장", "샤메 1장", "교류 120초"] }
      : { ticketName: "Welcome Ticket", ticketNo: "WT-2026-001", usedAt: "", eventName: "", memberName: "", composition: ["핀체키 1장", "샤메 1장", "교류 60초"] };
    var value = record || {};
    return {
      ticketName: value.ticketName || fallback.ticketName,
      ticketNo: value.ticketNo || fallback.ticketNo,
      usedAt: value.usedAt || formatTransferTimestamp(new Date()),
      eventName: value.eventName || "공연명 확인 후 표시",
      memberName: value.memberName || "멤버 확인 후 표시",
      composition: Array.isArray(value.composition) && value.composition.length ? value.composition : fallback.composition
    };
  }

  function hasBenefitUsage(type) {
    return !!benefitUsageState[type];
  }

  function syncBenefitCard(type) {
    var card = app.querySelector(".benefit-ticket-card--" + type);
    if (!card) return;
    var state = card.querySelector(".ticket-card-state");
    if (state) {
      state.textContent = "사용 완료";
      state.classList.remove("is-usable");
    }
  }

  function applyBenefitUsageToDetail(type, body) {
    if (type !== "welcome" && type !== "birthday") return;
    var historyLink = body.querySelector("[data-ticket-benefit-history]");
    if (!historyLink) return;
    if (!hasBenefitUsage(type)) {
      historyLink.remove();
      return;
    }
    var headState = body.querySelector(".ticket-benefit-hero-head strong");
    if (headState) headState.textContent = "사용 완료";
  }

  function applyBenefitUsageToHistory(type, body) {
    var record = benefitUsageState[type];
    if (!record) {
      renderDetail(type);
      return;
    }
    var summary = body.querySelector(".ticket-benefit-history-summary");
    if (summary) {
      var summaryTitle = summary.querySelector("h3");
      var summaryNo = summary.querySelector("dd");
      var summaryState = summary.querySelector(".ticket-benefit-history-summary-head strong");
      if (summaryTitle) summaryTitle.textContent = record.ticketName;
      if (summaryNo) summaryNo.textContent = record.ticketNo;
      if (summaryState) summaryState.textContent = "사용 완료";
    }
    var rows = body.querySelector(".ticket-benefit-history-list");
    if (!rows) return;
    var rowItems = Array.prototype.slice.call(rows.children);
    if (rowItems[0]) { var firstDd = rowItems[0].querySelector("dd"); if (firstDd) firstDd.textContent = record.usedAt; }
    if (rowItems[1]) { var secondDd = rowItems[1].querySelector("dd"); if (secondDd) secondDd.textContent = record.eventName; }
    if (rowItems[2]) { var memberName = rowItems[2].querySelector("strong"); if (memberName) memberName.textContent = record.memberName; }
    if (rowItems[3]) {
      var composition = rowItems[3].querySelectorAll(".ticket-benefit-history-used-items span");
      Array.prototype.forEach.call(composition, function (node, index) { node.textContent = record.composition[index] || ""; });
    }
  }

  function markBenefitUsed(type, record) {
    if (type !== "welcome" && type !== "birthday") return;
    benefitUsageState[type] = normalizeBenefitUsage(type, record);
    syncBenefitCard(type);
    if (detailType === type || detailType === type + "-usage-history") renderDetail(detailType);
  }

  window.LumiTicketBenefitUsage = window.LumiTicketBenefitUsage || {};
  window.LumiTicketBenefitUsage.markUsed = markBenefitUsed;

  window.addEventListener("lumiphone:benefit-used", function (event) {
    var detail = event && event.detail ? event.detail : {};
    markBenefitUsed(detail.type, detail.record);
  });

  syncMeateBenefitCard();

  function formatTransferTimestamp(date) {
    var value = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(value.getTime())) return "";
    function pad(number) { return String(number).padStart(2, "0"); }
    return value.getFullYear() + "." + pad(value.getMonth() + 1) + "." + pad(value.getDate()) + " " + pad(value.getHours()) + ":" + pad(value.getMinutes());
  }

  function getActiveTransferRecord() {
    var source = getTicketById(activeTicketId) || sourceTicketState;
    if (!source) return null;
    return getOpenTransferForSource(source.id) || null;
  }

  function getLatestTransferRecord() {
    var source = getTicketById(activeTicketId) || sourceTicketState;
    if (!source) return null;
    var records = (window.LumiTicketStore.transfers || []).filter(function (transfer) {
      return transfer.sourceTicketId === source.id || transfer.receivedTicketId === source.id || transfer.id === source.transferId;
    });
    return records.sort(function (a, b) { return String(b.resolvedAt || b.requestedAt || '').localeCompare(String(a.resolvedAt || a.requestedAt || '')); })[0] || null;
  }

  function ensureTransferRequestTime() {
    var record = getActiveTransferRecord() || getLatestTransferRecord();
    return record && record.requestedAt ? record.requestedAt : '';
  }

  function hasActiveTransferRequest() {
    return !!getActiveTransferRecord();
  }

  function updateTicketCount(target, label, count) {
    if (!target) return;
    target.innerHTML = label + ' <b>' + count + '장</b>';
  }

  function syncTicketPeriod(now) {
    var currentList = app.querySelector('.ticket-list:not(.ticket-past-list)');
    var pastList = app.querySelector('[data-ticket-past-list]');
    var pastEmpty = app.querySelector('[data-ticket-past-empty]');
    if (!currentList || !pastList) return;

    var referenceTime = now instanceof Date ? now : new Date();
    var cards = Array.prototype.slice.call(currentList.querySelectorAll('.ticket-list-card[data-ticket-event-end-at]'));
    cards.forEach(function (card) {
      var endAt = new Date(card.getAttribute('data-ticket-event-end-at'));
      if (Number.isNaN(endAt.getTime()) || endAt.getTime() > referenceTime.getTime()) return;

      card.classList.add('is-past');
      card.setAttribute('data-ticket-detail', 'lumi-pass-past');
      var qr = card.querySelector('.ticket-qr-area');
      if (qr) qr.remove();
      var state = card.querySelector('.ticket-card-state');
      if (state) {
        state.textContent = '관람 완료';
        state.classList.remove('is-usable');
      }
      var action = card.querySelector('.ticket-detail-link');
      if (action) {
        action.textContent = '기록 보기';
        action.setAttribute('data-ticket-detail', 'lumi-pass-past');
      }
      pastList.appendChild(card);
    });

    var viewerTickets = (window.LumiTicketStore.tickets || []).filter(function (ticket) { return ticket.ownerId === window.LumiTicketStore.viewerId && ticket.status !== 'cancelled' && ticket.status !== 'transferred'; });
    var currentCount = viewerTickets.filter(function (ticket) { return new Date(ticket.eventEndAt).getTime() > referenceTime.getTime(); }).length;
    var pastCount = viewerTickets.length - currentCount;
    updateTicketCount(app.querySelector('[data-ticket-current-count]'), '보유 티켓', currentCount);
    updateTicketCount(app.querySelector('[data-ticket-past-count]'), '지난 티켓', pastCount);
    if (pastEmpty) pastEmpty.hidden = pastCount > 0;
  }

  function escapeTicketText(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) { return ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "\"":"&quot;", "'":"&#39;" })[char]; });
  }

  function renderTransferredTicketDetail(ticket) {
    var transfer = getTransferForTicket(ticket) || {};
    var recipient = transfer.recipient || { nickname: "-", id: "-" };
    var completedAt = transfer.resolvedAt || transfer.completedAt || "처리 완료";
    return [
      '<section class="ticket-transferred-page">',
        '<header class="ticket-detail-topbar"><button class="ticket-detail-back" type="button" data-ticket-transferred-close aria-label="닫기"><span aria-hidden="true">‹</span></button><strong>티켓 상세</strong><span aria-hidden="true"></span></header>',
        '<article class="ticket-transferred-card">',
          '<div class="ticket-transferred-event-head"><div class="ticket-transferred-event-copy"><span class="ticket-type-chip">' + escapeTicketText(ticket.ticketType || "메인 공연") + '</span><h3>' + escapeTicketText(ticket.title) + '</h3></div><span class="ticket-transferred-state">양도 완료</span></div>',
          '<div class="ticket-transferred-ticket-grid"><dl class="ticket-transferred-info-list">',
            '<div><dt>공연명</dt><dd>' + escapeTicketText(ticket.title) + '</dd></div>',
            '<div><dt>일시</dt><dd>' + escapeTicketText(ticket.dateLabel) + '</dd></div>',
            '<div><dt>장소</dt><dd>' + escapeTicketText(ticket.venue) + '</dd></div>',
            '<div><dt>예매번호</dt><dd class="ticket-detail-number">' + escapeTicketText(ticket.bookingNo) + '</dd></div>',
            '<div><dt>권종</dt><dd>일반 티켓 1매</dd></div>',
            '<div><dt>상태</dt><dd class="ticket-transferred-status-copy">양도 완료</dd></div>',
          '</dl><aside class="ticket-transferred-visuals"><div class="ticket-transferred-poster-slot" data-asset-slot="ticket-transferred-poster-' + escapeTicketText(ticket.id) + '">공연 이미지</div><div class="ticket-transferred-qr-card"><div class="ticket-transferred-qr-slot" data-asset-slot="ticket-transferred-qr-disabled-' + escapeTicketText(ticket.id) + '">기존 QR 사용 불가</div><span>기존 QR 사용 불가</span></div></aside></div>',
        '</article>',
        '<section class="ticket-transferred-history-card"><strong class="ticket-transferred-section-title">양도 완료 내역</strong><dl class="ticket-transferred-history-list">',
          '<div><dt>양도 완료 시각</dt><dd>' + escapeTicketText(completedAt) + '</dd></div>',
          '<div><dt>양수인</dt><dd>' + escapeTicketText(recipient.nickname) + '</dd></div>',
          '<div><dt>루미폰 ID</dt><dd>' + escapeTicketText(recipient.id) + '</dd></div>',
          '<div><dt>처리 상태</dt><dd class="ticket-transferred-status-copy">양도 완료</dd></div>',
        '</dl></section>',
        '<section class="ticket-transferred-guide"><ul><li>이 티켓은 양도 완료되어 내 계정에서 입장할 수 없어요.</li><li>기존 입장 QR은 즉시 무효화됐어요.</li><li>새 입장 QR은 양수인 계정에서 확인할 수 있어요.</li><li>티켓 이력에서 양도 정보를 다시 볼 수 있어요.</li></ul></section>',
        '<dl class="ticket-transferred-meta"><div><dt>기존 예매자</dt><dd>' + escapeTicketText((transfer.sender && transfer.sender.nickname) || "루미") + '</dd></div><div><dt>발급일</dt><dd>' + escapeTicketText(ticket.issuedAt || "예매 정보 기준") + '</dd></div></dl>',
        '<div class="ticket-transferred-actions"><button type="button" class="ticket-detail-action ticket-detail-action-primary" data-ticket-transferred-history>양도 이력 보기</button><button type="button" class="ticket-detail-action" data-ticket-transferred-home>티켓함으로</button></div>',
      '</section>'
    ].join("");
  }

  function renderRefundRequest(ticketId) {
    var ticket = getTicketById(ticketId) || getTicketById(activeTicketId) || sourceTicketState;
    if (!ticket) return '';
    var issued = ticket.issuedAt || '예매 정보 기준';
    var holder = ticket.holderName || ticket.bookerName || '루미';
    var amount = ticket.amountLabel || ticket.priceLabel || '10,000원';
    var refundDeadline = formatRefundDeadline(ticket);
    return [
      '<section class="ticket-refund-page">',
        '<header class="ticket-detail-topbar">',
          '<button class="ticket-detail-back" type="button" data-ticket-refund-back aria-label="티켓 상세로"><span aria-hidden="true">‹</span></button>',
          '<strong>취소 / 환불</strong><span aria-hidden="true"></span>',
        '</header>',
        '<article class="ticket-refund-card">',
          '<section class="ticket-refund-summary">',
            '<div class="ticket-refund-poster-slot" data-asset-slot="ticket-refund-poster-' + escapeTicketText(ticket.id) + '">공연 이미지</div>',
            '<dl class="ticket-refund-ticket-info">',
              '<div><dt>공연명</dt><dd>' + escapeTicketText(ticket.title) + '</dd></div>',
              '<div><dt>일시</dt><dd>' + escapeTicketText(ticket.dateLabel) + '</dd></div>',
              '<div><dt>장소</dt><dd>' + escapeTicketText(ticket.venue) + '</dd></div>',
              '<div><dt>예매번호</dt><dd class="ticket-refund-number">' + escapeTicketText(ticket.bookingNo) + '</dd></div>',
              '<div><dt>권종</dt><dd>' + escapeTicketText(ticket.ticketName || '일반 티켓 1매') + '</dd></div>',
            '</dl>',
          '</section>',
          '<section class="ticket-refund-section ticket-refund-section-info">',
            '<div class="ticket-refund-section-head"><strong>환불 정보</strong></div>',
            '<div class="ticket-refund-info-layout">',
              '<div class="ticket-refund-info-visual">',
                '<span class="ticket-refund-status">환불 가능</span>',
                '<div class="ticket-refund-visual-slot" data-asset-slot="ticket-refund-info-' + escapeTicketText(ticket.id) + '">안내 이미지</div>',
              '</div>',
              '<dl class="ticket-refund-info">',
                '<div><dt>결제 금액</dt><dd>' + escapeTicketText(amount) + '</dd></div>',
                '<div class="is-highlight"><dt>예상 환불 금액</dt><dd>' + escapeTicketText(amount) + '</dd></div>',
                '<div><dt>환불 마감</dt><dd>' + escapeTicketText(refundDeadline) + '</dd></div>',
                '<div><dt>환불 예정 결제수단 기준</dt><dd>3~5일</dd></div>',
              '</dl>',
            '</div>',
          '</section>',
          '<section class="ticket-refund-section">',
            '<div class="ticket-refund-section-head"><strong>환불 계좌 입력</strong></div>',
            '<div class="ticket-refund-form">',
              '<label><span>예금주명</span><input type="text" placeholder="예금주명을 입력해 주세요" data-ticket-refund-holder autocomplete="name"></label>',
              '<label><span>은행명</span><select data-ticket-refund-bank><option value="">은행을 선택해 주세요</option><option>국민은행</option><option>신한은행</option><option>우리은행</option><option>하나은행</option><option>농협은행</option><option>기업은행</option><option>카카오뱅크</option><option>토스뱅크</option><option>케이뱅크</option><option>새마을금고</option><option value="custom">기타 / 직접 입력</option></select></label>',
              '<label class="ticket-refund-custom-bank is-hidden"><span>은행명 직접 입력</span><input type="text" placeholder="은행명을 직접 입력해 주세요" data-ticket-refund-bank-custom></label><label><span>계좌번호</span><input type="text" inputmode="numeric" placeholder="숫자만 입력해 주세요" data-ticket-refund-account></label>',
            '</div>',
            '<label class="ticket-refund-check"><input type="checkbox" data-ticket-refund-confirm><span>입력한 계좌 정보가 맞는지 확인했어요</span></label>',
          '</section>',
          '<section class="ticket-refund-section">',
            '<div class="ticket-refund-section-head"><strong>취소 사유</strong><span class="ticket-refund-optional">선택</span></div>',
            '<label class="ticket-refund-reason"><select data-ticket-refund-reason><option value="">취소 사유를 선택해 주세요</option><option>단순 취소</option><option>일정 변경</option><option>기타</option></select></label>',
          '</section>',
          '<section class="ticket-refund-policy">',
            '<strong>환불 정책</strong>',
            '<p>예매 취소 및 환불은 공연일 7일 전 23:59까지 가능합니다. 해당 기간 내 취소 시 전액 환불됩니다.</p>',
            '<p>공연일 6일 전부터는 공연 운영 준비에 따라 취소 및 환불이 불가합니다.</p>',
            '<p>관람이 어려운 경우 공연 전날 23:59까지 루미폰 공식 티켓 양도 기능을 이용할 수 있습니다.</p>',
            '<p>공연 취소·연기 또는 주최 측의 중대한 변경이 발생한 경우에는 전액 환불됩니다.</p>',
          '</section>',
          '<dl class="ticket-detail-meta ticket-refund-meta"><div><dt>예매자</dt><dd>' + escapeTicketText(holder) + '</dd></div><div><dt>발급일</dt><dd>' + escapeTicketText(issued) + '</dd></div></dl>',
          '<div class="ticket-refund-actions"><button type="button" class="ticket-detail-action ticket-detail-action-primary" data-ticket-refund-submit disabled aria-disabled="true">취소 / 환불 요청하기</button><button type="button" class="ticket-detail-action" data-ticket-refund-back>닫기</button></div>',
        '</article>',
      '</section>'
    ].join('');
  }

  function renderTicketRecordDetail(ticketId) {
    var ticket = getTicketById(ticketId);
    if (!ticket) return window.LumiApps.ticketDetails["lumi-pass"] || "";
    if (ticket.status === "transferred") return renderTransferredTicketDetail(ticket);
    if (ticket.sourceTicketId) return renderReceivedTicketDetail(ticket);
    var isUsed = ticket.status === "used" || ticket.qrStatus === "used";
    var isPast = new Date(ticket.eventEndAt).getTime() <= Date.now();
    var stateText = isUsed ? "입장 완료" : (isPast ? "관람 완료" : "입장 전");
    var qrText = ticket.qrStatus === "used" ? "사용 완료" : "입장용 QR";
    var qrStatusText = ticket.qrStatus === "used" ? "사용 완료" : "사용 가능";
    return [
      '<section class="ticket-detail-page">',
        '<header class="ticket-detail-topbar"><button class="ticket-detail-back" type="button" data-ticket-detail-close aria-label="뒤로"><span aria-hidden="true">‹</span></button><strong>티켓 상세</strong><span aria-hidden="true"></span></header>',
        '<article class="ticket-detail-card ticket-detail-card--event">',
          '<div class="ticket-detail-event-head"><div class="ticket-detail-event-copy"><span class="ticket-type-chip">' + escapeTicketText(ticket.ticketType) + '</span><h3>' + escapeTicketText(ticket.title) + '</h3></div><span class="ticket-detail-state' + (!isUsed && !isPast ? ' is-usable' : '') + '">' + stateText + '</span></div>',
          '<div class="ticket-detail-ticket-grid"><dl class="ticket-detail-info-list"><div><dt>공연명</dt><dd>' + escapeTicketText(ticket.title) + '</dd></div><div><dt>일시</dt><dd>' + escapeTicketText(ticket.dateLabel) + '</dd></div><div><dt>장소</dt><dd>' + escapeTicketText(ticket.venue) + '</dd></div><div><dt>예매번호</dt><dd class="ticket-detail-number">' + escapeTicketText(ticket.bookingNo) + '</dd></div><div><dt>권종</dt><dd>' + escapeTicketText(ticket.ticketName || "일반 티켓 1매") + '</dd></div><div><dt>입장 순서</dt><dd>' + escapeTicketText(ticket.entryOrder || "현장 확인") + '</dd></div></dl><aside class="ticket-detail-visuals"><div class="ticket-detail-poster-slot" data-asset-slot="ticket-detail-poster-' + escapeTicketText(ticket.id) + '">공연 이미지</div><div class="ticket-detail-qr-card"><div class="ticket-detail-qr-slot" data-asset-slot="ticket-detail-qr-' + escapeTicketText(ticket.id) + '">QR 이미지</div><span>' + qrText + '</span></div></aside></div>',
          '<section class="ticket-detail-guide"><strong>안내</strong><ul><li>공연 시작 10분 전까지 입장해 주세요.</li><li>입장 시 입장용 QR을 스탭에게 보여주세요.</li><li>QR코드는 캡처본 사용이 불가합니다.</li><li>본 티켓은 1회만 사용 가능하며, 재입장 불가합니다.</li></ul></section>',
          '<dl class="ticket-detail-meta"><div><dt>예매자</dt><dd>' + escapeTicketText(ticket.holderName || ticket.bookerName || "루미") + '</dd></div><div><dt>발급일</dt><dd>' + escapeTicketText(ticket.issuedAt || "예매 정보 기준") + '</dd></div></dl>',
          '<div class="ticket-detail-actions"><button type="button" class="ticket-detail-action ticket-detail-action-primary" data-ticket-qr-expand' + (ticket.qrStatus !== 'active' ? ' disabled' : '') + '>QR 크게 보기</button><button type="button" class="ticket-detail-action" data-ticket-transfer>양도하기</button><button type="button" class="ticket-detail-action ticket-detail-action-refund" data-ticket-refund>취소 / 환불</button></div>',
        '</article>',
      '</section>'
    ].join("");
  }

  function renderReceivedTicketDetail(ticketArg) {
    var received = ticketArg || getTicketById(activeTicketId) || (window.LumiTicketTransferState && window.LumiTicketTransferState.receivedTicket);
    if (!received) return window.LumiApps.ticketDetails["lumi-pass"] || "";
    return [
      '<section class="ticket-detail-page">',
        '<header class="ticket-detail-topbar"><button class="ticket-detail-back" type="button" data-ticket-detail-close aria-label="뒤로"><span aria-hidden="true">‹</span></button><strong>티켓 상세</strong><span aria-hidden="true"></span></header>',
        '<article class="ticket-detail-card ticket-detail-card--event">',
          '<div class="ticket-detail-event-head"><div class="ticket-detail-event-copy"><span class="ticket-type-chip">양도받은 티켓</span><h3>' + escapeTicketText(received.title) + '</h3></div><span class="ticket-detail-state is-usable">입장 전</span></div>',
          '<div class="ticket-detail-ticket-grid"><dl class="ticket-detail-info-list"><div><dt>공연명</dt><dd>' + escapeTicketText(received.title) + '</dd></div><div><dt>일시</dt><dd>' + escapeTicketText(received.dateLabel) + '</dd></div><div><dt>장소</dt><dd>' + escapeTicketText(received.venue) + '</dd></div><div><dt>예매번호</dt><dd class="ticket-detail-number">' + escapeTicketText(received.bookingNo) + '</dd></div><div><dt>권종</dt><dd>' + escapeTicketText(received.ticketName || "일반 티켓 1매") + '</dd></div><div><dt>입장 순서</dt><dd>' + escapeTicketText(received.entryOrder || "현장 확인") + '</dd></div></dl><aside class="ticket-detail-visuals"><div class="ticket-detail-poster-slot" data-asset-slot="ticket-detail-poster-received">공연 이미지</div><div class="ticket-detail-qr-card"><div class="ticket-detail-qr-slot" data-asset-slot="ticket-detail-qr-received">QR 이미지</div><span>새 입장 QR</span></div></aside></div>',
          '<section class="ticket-detail-guide"><strong>안내</strong><ul><li>공연 시작 10분 전까지 입장해 주세요.</li><li>입장 시 새로 발급된 QR을 스탭에게 보여주세요.</li><li>QR코드는 캡처본 사용이 불가합니다.</li><li>양도받은 티켓은 다시 양도할 수 없어요.</li></ul></section>',
          '<dl class="ticket-detail-meta"><div><dt>예매자</dt><dd>' + escapeTicketText(received.holderName || received.bookerName || "루미") + '</dd></div><div><dt>발급일</dt><dd>' + escapeTicketText(received.issuedAt || "예매 정보 기준") + '</dd></div></dl>',
          '<div class="ticket-detail-actions"><button type="button" class="ticket-detail-action ticket-detail-action-primary" data-ticket-qr-expand>QR 크게 보기</button></div>',
        '</article>',
      '</section>'
    ].join("");
  }

  function getTransferEligibility() {
    sourceTicketState = getTicketById(activeTicketId) || sourceTicketState;
    var received = getTicketById(activeTicketId) || (window.LumiTicketTransferState && window.LumiTicketTransferState.receivedTicket);
    if (detailType === "lumi-pass-received" || (received && received.transferCount >= 1 && received.transferAllowed === false)) {
      return { allowed: false, message: "이미 한 번 양도된 티켓이에요.", submessage: "티켓은 기본 1회만 양도할 수 있어요." };
    }
    if (sourceTicketState.status === "used" || sourceTicketState.qrStatus === "used") {
      return { allowed: false, message: "이미 입장 처리된 티켓이에요.", submessage: "입장 처리된 티켓은 양도할 수 없어요." };
    }
    if (sourceTicketState.status === "cancelled") {
      return { allowed: false, message: "취소된 티켓이에요.", submessage: "취소된 티켓은 양도할 수 없어요." };
    }
    if (sourceTicketState.status === "transferred" || sourceTicketState.transferCount >= 1) {
      return { allowed: false, message: "이미 한 번 양도된 티켓이에요.", submessage: "티켓은 기본 1회만 양도할 수 있어요." };
    }
    if (hasActiveTransferRequest() || sourceTicketState.transferRequestStatus === "pending") {
      return { allowed: false, message: "양도 요청이 진행 중이에요.", submessage: "현재 요청이 처리된 뒤 다시 확인해 주세요." };
    }
    var eventStart = new Date(sourceTicketState.eventStartAt);
    var deadline = new Date(eventStart);
    deadline.setDate(deadline.getDate() - 1);
    deadline.setHours(23, 59, 59, 999);
    if (Date.now() > deadline.getTime()) {
      return { allowed: false, message: "양도 가능한 시간이 지났어요.", submessage: "양도는 공연 전날 23:59까지 가능해요." };
    }
    return { allowed: true };
  }

  function renderReceivedTransferTicket() {
    var received = (window.LumiTicketStore.tickets || []).filter(function (ticket) { return ticket.sourceTicketId && ticket.ownerId === window.LumiTicketStore.viewerId && ticket.status === 'active'; })[0] || null;
    var currentList = app.querySelector('.ticket-list:not(.ticket-past-list)');
    if (!received || !currentList) return;

    var existing = currentList.querySelector('[data-transfer-ticket-id="' + received.id + '"]');
    if (existing) return;

    var card = document.createElement('article');
    card.className = 'ticket-list-card ticket-list-card--received-transfer';
    card.setAttribute('data-transfer-ticket-id', received.id);
    card.setAttribute('data-ticket-id', received.id);
    card.setAttribute('data-ticket-order', String(received.order || 0));
    card.setAttribute('data-ticket-event-end-at', received.eventEndAt);
    card.innerHTML = [
      '<div class="ticket-poster-column"><div class="ticket-poster-slot" data-asset-slot="ticket-poster-received-transfer">공연 이미지</div></div>',
      '<div class="ticket-list-copy">',
        '<span class="ticket-type-chip">양도받은 티켓</span>',
        '<h3>' + received.title + '</h3>',
        '<p class="ticket-info-line">' + received.dateLabel + '</p>',
        '<p class="ticket-info-line">' + received.venue + '</p>',
        '<p class="ticket-info-line">예매번호 <b>' + received.bookingNo + '</b></p>',
      '</div>',
      '<div class="ticket-qr-area"><div class="ticket-qr-slot" data-asset-slot="ticket-qr-received-transfer">QR 이미지</div><span>입장용 QR</span></div>',
      '<span class="ticket-state-chip ticket-card-state is-usable">입장 전</span>',
      '<button class="ticket-detail-link" type="button" data-ticket-detail="ticket:' + received.id + '">상세 보기</button>'
    ].join('');
    currentList.prepend(card);
  }

  function getCurrentIncomingTransfer() {
    var viewerId = window.LumiTicketStore.viewerId;
    var bySource = getOpenTransferForSource(activeTicketId);
    if (bySource && bySource.recipient && bySource.recipient.id === viewerId) return bySource;
    return getPendingIncomingTransfers()[0] || null;
  }

  function receiveTransferTicket() {
    var transfer = getCurrentIncomingTransfer();
    if (!transfer) return null;
    var sourceRecord = getTicketById(transfer.sourceTicketId);
    if (!sourceRecord) return null;
    var completedAt = formatTransferTimestamp(new Date());
    var recipient = transfer.recipient || {};
    var recipientId = recipient.id;
    var receivedTicket = {
      id: 'ticket-transfer-received-' + sourceRecord.id + '-' + Date.now(),
      sourceTicketId: sourceRecord.id,
      transferId: transfer.id,
      title: sourceRecord.title,
      ticketType: sourceRecord.ticketType || '메인 공연',
      issuedAt: completedAt,
      dateLabel: sourceRecord.dateLabel,
      venue: sourceRecord.venue,
      bookingNo: 'T-' + String(sourceRecord.bookingNo || '').replace(/^[A-Z]-/, ''),
      eventStartAt: sourceRecord.eventStartAt,
      eventEndAt: sourceRecord.eventEndAt,
      order: 99,
      status: 'active',
      ownerId: recipientId,
      qrStatus: 'active',
      transferCount: 1,
      transferAllowed: false,
      qr: { status: 'active', token: 'qr-ticket-transfer-received-' + sourceRecord.id + '-' + Date.now(), issuedAt: completedAt }
    };
    sourceRecord.status = 'transferred';
    sourceRecord.qrStatus = 'revoked';
    sourceRecord.transferCount = 1;
    sourceRecord.transferRequestStatus = null;
    sourceRecord.transferId = transfer.id;
    window.LumiTicketStore.tickets.push(receivedTicket);
    transfer.status = 'accepted';
    transfer.resolvedAt = completedAt;
    transfer.receivedTicketId = receivedTicket.id;
    transfer.oldQr = { status: 'revoked', revokedAt: completedAt };
    transfer.newQr = { status: 'active', issuedAt: completedAt, ticketId: receivedTicket.id };
    createTransferOperationMessages(transfer, 'accepted', completedAt);
    window.LumiTicketTransferState.receivedTicket = receivedTicket;
    window.LumiTicketTransferState.transferRecord = transfer;
    window.LumiTicketStore.viewerId = recipientId;
    saveTicketStore();
    syncTransferNotification(transfer, 'accepted');
    syncTransferredTicketState();
    return transfer;
  }

  function syncTicketStoreUi() {
    expirePendingTransfers(new Date());
    var cards = app.querySelectorAll('.ticket-list-card[data-ticket-id]');
    Array.prototype.forEach.call(cards, function (card) {
      var ticket = getTicketById(card.getAttribute('data-ticket-id'));
      if (!ticket) return;
      card.setAttribute('data-ticket-event-end-at', ticket.eventEndAt || '');
      var belongsToViewer = ticket.ownerId === window.LumiTicketStore.viewerId;
      card.hidden = !belongsToViewer || ticket.status === 'transferred' || ticket.status === 'cancelled';
      var state = card.querySelector('.ticket-card-state');
      if (state) {
        var past = new Date(ticket.eventEndAt).getTime() <= Date.now();
        state.textContent = ticket.status === 'transferred' ? '양도 완료' : (ticket.status === 'used' ? '입장 완료' : (past ? '관람 완료' : '입장 전'));
        state.classList.toggle('is-usable', ticket.status === 'active' && ticket.qrStatus === 'active' && !past);
      }
    });
  }

  function syncTransferredTicketState() {
    renderReceivedTransferTicket();
    syncTicketStoreUi();
    syncTicketPeriod();
  }

  var transferAccounts = {
    "LB-1001": { nickname: "루미", isSelf: true },
    "LB-1002": { nickname: "딸기토끼" },
    "LB-1003": { nickname: "별빛소다" },
    "LB-1004": { nickname: "솜사탕구름" },
    "LB-9999": { nickname: "테스트계정" }
  };

  function getTransferFields() {
    return {
      id: app.querySelector("#ticket-transfer-id"),
      nickname: app.querySelector("[data-ticket-transfer-nickname]"),
      recipient: app.querySelector("[data-ticket-transfer-recipient]"),
      message: app.querySelector("[data-ticket-transfer-message]"),
      submit: app.querySelector("[data-ticket-transfer-submit]")
    };
  }

  function resetTransferLookup() {
    var fields = getTransferFields();
    if (fields.nickname) {
      fields.nickname.textContent = "계정 확인 후 표시돼요";
      fields.nickname.classList.add("is-empty");
    }
    if (fields.recipient) fields.recipient.textContent = "계정 확인 전";
    if (fields.message) {
      fields.message.textContent = "";
      fields.message.className = "ticket-transfer-account-message";
    }
    if (fields.submit) fields.submit.disabled = true;
  }

  function normalizeTransferId(value) {
    var normalized = String(value || "").trim().toUpperCase().replace(/\s+/g, "");
    if (/^\d{4}$/.test(normalized)) normalized = "LB-" + normalized;
    if (/^LB\d{4}$/.test(normalized)) normalized = "LB-" + normalized.slice(2);
    return normalized;
  }

  function checkTransferAccount() {
    var fields = getTransferFields();
    if (!fields.id) return;
    var id = normalizeTransferId(fields.id.value);
    fields.id.value = id;
    var account = transferAccounts[id];

    if (!account) {
      resetTransferLookup();
      if (fields.message) {
        fields.message.textContent = "등록되지 않은 루미폰 ID예요. 다시 확인해주세요.";
        fields.message.classList.add("is-error");
      }
      return;
    }

    if (account.isSelf) {
      resetTransferLookup();
      if (fields.message) {
        fields.message.textContent = "본인 계정으로는 양도할 수 없어요.";
        fields.message.classList.add("is-error");
      }
      return;
    }

    if (fields.nickname) {
      fields.nickname.textContent = account.nickname;
      fields.nickname.classList.remove("is-empty");
    }
    if (fields.recipient) fields.recipient.textContent = account.nickname;
    if (fields.message) {
      fields.message.textContent = "양도 받을 계정을 확인했어요.";
      fields.message.className = "ticket-transfer-account-message is-success";
    }
    if (fields.submit) fields.submit.disabled = false;
  }

  function showTransferUnavailable(options) {
    var modal = app.querySelector("[data-ticket-transfer-unavailable]");
    if (!modal) return;
    var message = modal.querySelector("[data-ticket-transfer-unavailable-message]");
    var submessage = modal.querySelector("[data-ticket-transfer-unavailable-submessage]");
    var config = options || transferAvailability;
    if (message) message.textContent = config.message || transferAvailability.message;
    if (submessage) submessage.textContent = config.submessage || transferAvailability.submessage;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
  }

  function closeTransferUnavailable() {
    var modal = app.querySelector("[data-ticket-transfer-unavailable]");
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  }

  function openTransferAcceptConfirm() {
    var modal = app.querySelector("[data-ticket-transfer-accept-modal]");
    if (!modal) return;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
  }

  function closeTransferAcceptConfirm() {
    var modal = app.querySelector("[data-ticket-transfer-accept-modal]");
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  }

  function showTransferCancelConfirm() {
    if (!hasActiveTransferRequest()) {
      closeTransferCancelModal();
      renderDetail("lumi-pass");
      return;
    }
    var modal = app.querySelector("[data-ticket-transfer-cancel-modal]");
    if (!modal) return;
    var title = modal.querySelector("[data-ticket-transfer-cancel-title]");
    var message = modal.querySelector("[data-ticket-transfer-cancel-message]");
    var submessage = modal.querySelector("[data-ticket-transfer-cancel-submessage]");
    var summary = modal.querySelector("[data-ticket-transfer-cancel-summary]");
    var recipient = modal.querySelector("[data-ticket-transfer-cancel-recipient]");
    var recipientId = modal.querySelector("[data-ticket-transfer-cancel-recipient-id]");
    var confirm = modal.querySelector("[data-ticket-transfer-cancel-confirm]");
    var back = modal.querySelector("[data-ticket-transfer-cancel-back]");
    var activeTransfer = getActiveTransferRecord();
    var activeRecipient = (activeTransfer && activeTransfer.recipient) || transferRequestRecipient || { nickname: "-", id: "-" };
    if (title) title.textContent = "양도 요청을 취소할까요?";
    if (message) message.textContent = "취소하면 양도 요청이 사라져요.";
    if (submessage) submessage.innerHTML = "<span>티켓은 내 계정에 그대로 유지돼요.</span><span>기존 입장 QR도 계속 사용할 수 있어요.</span>";
    if (recipient) recipient.textContent = activeRecipient.nickname;
    if (recipientId) recipientId.textContent = activeRecipient.id || "-";
    if (summary) summary.hidden = false;
    if (confirm) {
      confirm.textContent = "요청 취소";
      confirm.setAttribute("data-ticket-transfer-cancel-confirm", "");
      confirm.removeAttribute("data-ticket-transfer-cancel-finish");
    }
    if (back) {
      back.textContent = "돌아가기";
      back.hidden = false;
    }
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
  }

  function showTransferCancelCompleted() {
    var modal = app.querySelector("[data-ticket-transfer-cancel-modal]");
    if (!modal) return;
    var title = modal.querySelector("[data-ticket-transfer-cancel-title]");
    var message = modal.querySelector("[data-ticket-transfer-cancel-message]");
    var submessage = modal.querySelector("[data-ticket-transfer-cancel-submessage]");
    var summary = modal.querySelector("[data-ticket-transfer-cancel-summary]");
    var confirm = modal.querySelector("[data-ticket-transfer-cancel-confirm]");
    var back = modal.querySelector("[data-ticket-transfer-cancel-back]");
    if (title) title.textContent = "양도 요청이 취소되었어요";
    if (message) message.textContent = "티켓은 내 계정에 그대로 유지돼요.";
    if (submessage) submessage.innerHTML = "<span>기존 입장 QR도 계속 사용할 수 있어요.</span>";
    if (summary) summary.hidden = true;
    if (confirm) {
      confirm.textContent = "티켓 상세로";
      confirm.removeAttribute("data-ticket-transfer-cancel-confirm");
      confirm.setAttribute("data-ticket-transfer-cancel-finish", "");
    }
    if (back) back.hidden = true;
  }

  function closeTransferCancelModal() {
    var modal = app.querySelector("[data-ticket-transfer-cancel-modal]");
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  }

  function renderDetail(type) {
    var sheet = app.querySelector("[data-ticket-detail-sheet]");
    var body = app.querySelector("[data-ticket-detail-body]");
    if (!sheet || !body) return;

    var ticketMatch = /^ticket:(.+)$/.exec(type || "");
    var refundMatch = /^ticket-refund:(.+)$/.exec(type || "");
    body.innerHTML = refundMatch ? renderRefundRequest(refundMatch[1]) : (ticketMatch ? renderTicketRecordDetail(ticketMatch[1]) : (type === "meate" ? renderMeateOverview() : (type === "lumi-pass-received" ? renderReceivedTicketDetail() : (window.LumiApps.ticketDetails[type] || ""))));
    var benefitHistoryType = type.replace("-usage-history", "");
    if (type === "welcome" || type === "birthday") applyBenefitUsageToDetail(type, body);
    if (type === "welcome-usage-history" || type === "birthday-usage-history") applyBenefitUsageToHistory(benefitHistoryType, body);
    sheet.classList.add("is-open");
    sheet.setAttribute("aria-hidden", "false");

    if ((type === "lumi-pass-transfer-pending" || type === "lumi-pass-transfer-request-detail") && transferRequestRecipient) {
      var recipientName = body.querySelector("[data-ticket-pending-recipient-name]");
      var recipientId = body.querySelector("[data-ticket-pending-recipient-id]");
      var requestTime = body.querySelector("[data-ticket-transfer-request-time]");
      var acceptedTime = body.querySelector("[data-ticket-transfer-accepted-time]");
      var completedTime = body.querySelector("[data-ticket-transfer-completed-time]");
      if (recipientName) recipientName.textContent = transferRequestRecipient.nickname;
      if (recipientId) recipientId.textContent = transferRequestRecipient.id;
      if (requestTime) requestTime.textContent = transferRequestRecipient.requestedAt || "-";
      if (acceptedTime) acceptedTime.textContent = "대기 중";
      if (completedTime) completedTime.textContent = "완료 시 표시";
    }

    if (type === "lumi-pass-transferred") {
      var transferredCompletedAt = body.querySelector("[data-ticket-transferred-completed-at]");
      var transferredRecipientName = body.querySelector("[data-ticket-transferred-recipient-name]");
      var transferredRecipientId = body.querySelector("[data-ticket-transferred-recipient-id]");
      var legacyTransfer = getLatestTransferRecord() || {};
      var completedValue = legacyTransfer.resolvedAt || legacyTransfer.requestedAt || "-";
      var recipientValue = legacyTransfer.recipient || transferRequestRecipient || { nickname: "-", id: "-" };
      if (transferredCompletedAt) transferredCompletedAt.textContent = completedValue;
      if (transferredRecipientName) transferredRecipientName.textContent = recipientValue.nickname;
      if (transferredRecipientId) transferredRecipientId.textContent = recipientValue.id;
    }

    if (type === "lumi-pass-transfer-history") {
      var historyTicket = getTicketById(activeTicketId);
      var actualTransfer = getTransferForTicket(historyTicket);
      if (actualTransfer) {
        var historyRecipient = actualTransfer.recipient || {};
        var historyRequestedAt = actualTransfer.requestedAt || '';
        var historyAcceptedAt = actualTransfer.resolvedAt || historyRequestedAt;
        var historyMap = {
          "[data-ticket-history-requested-at]": historyRequestedAt,
          "[data-ticket-history-recipient-confirmed-at]": historyRequestedAt,
          "[data-ticket-history-accepted-at]": historyAcceptedAt,
          "[data-ticket-history-completed-at]": historyAcceptedAt,
          "[data-ticket-history-qr-revoked-at]": actualTransfer.oldQr && actualTransfer.oldQr.revokedAt ? actualTransfer.oldQr.revokedAt : historyAcceptedAt,
          "[data-ticket-history-qr-issued-at]": actualTransfer.newQr && actualTransfer.newQr.issuedAt ? actualTransfer.newQr.issuedAt : historyAcceptedAt,
          "[data-ticket-history-recipient-name]": historyRecipient.nickname || '-',
          "[data-ticket-history-recipient-id]": historyRecipient.id || '-'
        };
        Object.keys(historyMap).forEach(function (selector) {
          var target = body.querySelector(selector);
          if (target) target.textContent = historyMap[selector];
        });
      }
    }

    if (type === "lumi-pass-transfer-accepted" || type === "lumi-pass-transfer-rejected") {
      var requestedAt = body.querySelector("[data-ticket-result-requested-at]");
      var acceptedAt = body.querySelector("[data-ticket-result-accepted-at]");
      var rejectedAt = body.querySelector("[data-ticket-result-rejected-at]");
      var resultTransfer = getLatestTransferRecord() || {};
      if (requestedAt) requestedAt.textContent = resultTransfer.requestedAt || "-";
      if (acceptedAt) acceptedAt.textContent = resultTransfer.status === "accepted" ? (resultTransfer.resolvedAt || "처리 완료") : "-";
      if (rejectedAt) rejectedAt.textContent = resultTransfer.status === "rejected" ? (resultTransfer.resolvedAt || "처리 완료") : "-";
    }
  }

  function openDetail(type) {
    var ticketMatch = /^ticket:(.+)$/.exec(type || "");
    if (ticketMatch) setActiveTicket(ticketMatch[1]);
    detailType = type;
    renderDetail(type);
  }

  function openQrDetail() {
    renderDetail("lumi-pass-qr");
  }

  function openTransferDetail() {
    var eligibility = getTransferEligibility();
    if (!eligibility.allowed) {
      showTransferUnavailable(eligibility);
      return;
    }
    renderDetail("lumi-pass-transfer");
  }

  function openTransferPending() {
    if (!hasActiveTransferRequest()) {
      renderDetail("lumi-pass");
      return;
    }
    renderDetail("lumi-pass-transfer-pending");
  }

  function openTransferRequestDetail() {
    renderDetail("lumi-pass-transfer-request");
  }

  function openTransferRequestDetailSender() {
    if (!hasActiveTransferRequest()) {
      renderDetail("lumi-pass");
      return;
    }
    renderDetail("lumi-pass-transfer-request-detail");
  }

  function openTransferAcceptedDetail() {
    renderDetail("lumi-pass-transfer-accepted");
  }

  function openTransferredTicketDetail() {
    renderDetail("ticket:" + activeTicketId);
  }

  function openTransferHistoryDetail() {
    renderDetail("lumi-pass-transfer-history");
  }

  function returnToTicketDetail() {
    renderDetail(detailType || "lumi-pass");
  }

  function closeDetail() {
    var sheet = app.querySelector("[data-ticket-detail-sheet]");
    if (!sheet) return;
    sheet.classList.remove("is-open");
    sheet.setAttribute("aria-hidden", "true");
  }

  function applyTicketSort(order) {
    var list = app.querySelector(".ticket-list");
    var label = app.querySelector("[data-ticket-sort-label]");
    if (!list) return;

    var cards = Array.prototype.slice.call(list.querySelectorAll(".ticket-list-card"));
    cards.sort(function (a, b) {
      var aOrder = Number(a.getAttribute("data-ticket-order") || 0);
      var bOrder = Number(b.getAttribute("data-ticket-order") || 0);
      return order === "oldest" ? aOrder - bOrder : bOrder - aOrder;
    });
    cards.forEach(function (card) { list.appendChild(card); });
    if (label) label.textContent = order === "oldest" ? "예매일 오래된순" : "예매일 최신순";
  }

  app.addEventListener("click", function (e) {
    var incomingTransfer = e.target.closest("[data-ticket-incoming-transfer]");
    if (incomingTransfer) {
      window.LumiApps.openTicketTransferRecipientRequest(document);
      return;
    }

    var unavailableClose = e.target.closest("[data-ticket-transfer-unavailable-close]");
    if (unavailableClose) {
      closeTransferUnavailable();
      return;
    }

    var unavailableDetail = e.target.closest("[data-ticket-transfer-unavailable-detail]");
    if (unavailableDetail) {
      closeTransferUnavailable();
      renderDetail("lumi-pass");
      return;
    }

    var qrBack = e.target.closest("[data-ticket-qr-back]");
    if (qrBack) {
      returnToTicketDetail();
      return;
    }

    var qrExpand = e.target.closest("[data-ticket-qr-expand]");
    if (qrExpand) {
      openQrDetail();
      return;
    }

    var transferCheck = e.target.closest("[data-ticket-transfer-check]");
    if (transferCheck) {
      checkTransferAccount();
      return;
    }

    var transferSubmit = e.target.closest("[data-ticket-transfer-submit]");
    if (transferSubmit) {
      if (transferSubmit.disabled) return;
      var transferFields = getTransferFields();
      var requestId = transferFields.id ? normalizeTransferId(transferFields.id.value) : "";
      var requestAccount = transferAccounts[requestId];
      if (!requestAccount || requestAccount.isSelf) return;
      transferRequestRecipient = { id: requestId, nickname: requestAccount.nickname, requestedAt: formatTransferTimestamp(new Date()) };
      transferRequestState.status = "pending";
      transferRequestState.requestedAt = transferRequestRecipient.requestedAt;
      transferRequestState.acceptedAt = null;
      transferRequestState.rejectedAt = null;
      transferRequestState.completedAt = null;
      transferRequestState.cancelledAt = null;
      sourceTicketState = getTicketById(activeTicketId) || sourceTicketState;
      sourceTicketState.transferRequestStatus = "pending";
      var createdTransferId = 'transfer-' + sourceTicketState.id + '-' + requestId + '-' + Date.now();
      window.LumiTicketStore.transfers = (window.LumiTicketStore.transfers || []).filter(function (transfer) {
        return !(transfer.sourceTicketId === sourceTicketState.id && transfer.status === 'pending');
      });
      window.LumiTicketStore.transfers.push({
        id: createdTransferId,
        status: 'pending',
        requestedAt: transferRequestRecipient.requestedAt,
        resolvedAt: null,
        sourceTicketId: sourceTicketState.id,
        sender: { id: window.LumiTicketStore.viewerId, nickname: '루미' },
        recipient: { id: requestId, nickname: requestAccount.nickname },
        oldQr: { status: sourceTicketState.qrStatus || 'active' },
        newQr: null,
        receivedTicketId: null
      });
      sourceTicketState.transferId = createdTransferId;
      var createdTransfer = (window.LumiTicketStore.transfers || []).filter(function (transfer) { return transfer.id === createdTransferId; })[0];
      saveTicketStore();
      syncTransferNotification(createdTransfer, 'pending');
      enqueueOperationMessage({
        id: 'transfer-' + createdTransfer.id + '-pending-sender',
        audienceId: window.LumiTicketStore.viewerId,
        receivedAt: createdTransfer.requestedAt,
        kind: 'result',
        title: '티켓 양도 요청을 보냈어요.',
        preview: sourceTicketState.title + ' · ' + requestAccount.nickname + '님 수락 대기 중',
        actionLabel: '양도 요청 보기',
        actionTarget: 'transfer-request:' + createdTransfer.id,
        actionType: 'ticket'
      });
      openTransferPending();
      return;
    }

    var transferRequestClose = e.target.closest("[data-ticket-transfer-request-close]");
    if (transferRequestClose) {
      closeDetail();
      return;
    }

    var transferAcceptCancel = e.target.closest("[data-ticket-transfer-accept-cancel]");
    if (transferAcceptCancel) {
      closeTransferAcceptConfirm();
      return;
    }

    var transferAcceptConfirm = e.target.closest("[data-ticket-transfer-accept-confirm]");
    if (transferAcceptConfirm) {
      closeTransferAcceptConfirm();
      ensureTransferRequestTime();
      transferRequestState.acceptedAt = formatTransferTimestamp(new Date());
      transferRequestState.completedAt = transferRequestState.acceptedAt;
      transferRequestState.rejectedAt = null;
      transferRequestState.status = "accepted";
      var acceptedTransfer = receiveTransferTicket();
      if (!acceptedTransfer) return;
      openTransferAcceptedDetail();
      return;
    }

    var transferRequestAccept = e.target.closest("[data-ticket-transfer-request-accept]");
    if (transferRequestAccept) {
      openTransferAcceptConfirm();
      return;
    }

    var transferRequestReject = e.target.closest("[data-ticket-transfer-request-reject]");
    if (transferRequestReject) {
      ensureTransferRequestTime();
      transferRequestState.rejectedAt = formatTransferTimestamp(new Date());
      transferRequestState.acceptedAt = null;
      transferRequestState.completedAt = transferRequestState.rejectedAt;
      transferRequestState.status = "rejected";
      sourceTicketState = getTicketById(activeTicketId) || sourceTicketState;
      var rejectedTransfer = getOpenTransferForSource(sourceTicketState.id) || getTransferForTicket(sourceTicketState);
      if (rejectedTransfer) resolveTransferRecord(rejectedTransfer.id, 'rejected', transferRequestState.rejectedAt);
      else {
        sourceTicketState.transferRequestStatus = null;
        saveTicketStore();
      }
      renderDetail("lumi-pass-transfer-rejected");
      return;
    }

    var transferResultClose = e.target.closest("[data-ticket-transfer-result-close]");
    if (transferResultClose) {
      closeDetail();
      return;
    }

    var transferResultTicket = e.target.closest("[data-ticket-transfer-result-ticket]");
    if (transferResultTicket) {
      closeDetail();
      return;
    }

    var transferredClose = e.target.closest("[data-ticket-transferred-close]");
    if (transferredClose) {
      closeDetail();
      return;
    }

    var transferredHome = e.target.closest("[data-ticket-transferred-home]");
    if (transferredHome) {
      closeDetail();
      return;
    }

    var transferredHistory = e.target.closest("[data-ticket-transferred-history]");
    if (transferredHistory) {
      openTransferHistoryDetail();
      return;
    }

    var transferHistoryBack = e.target.closest("[data-ticket-transfer-history-back]");
    if (transferHistoryBack) {
      openTransferredTicketDetail();
      return;
    }

    var pendingBack = e.target.closest("[data-ticket-transfer-pending-back]");
    if (pendingBack) {
      returnToTicketDetail();
      return;
    }

    var pendingHome = e.target.closest("[data-ticket-transfer-pending-home]");
    if (pendingHome) {
      closeDetail();
      return;
    }

    var pendingDetail = e.target.closest("[data-ticket-transfer-pending-detail]");
    if (pendingDetail) {
      openTransferRequestDetailSender();
      return;
    }

    var requestDetailBack = e.target.closest("[data-ticket-transfer-request-detail-back]");
    if (requestDetailBack) {
      openTransferPending();
      return;
    }

    var requestDetailHome = e.target.closest("[data-ticket-transfer-request-detail-home]");
    if (requestDetailHome) {
      closeDetail();
      return;
    }

    var transferCancelBack = e.target.closest("[data-ticket-transfer-cancel-back]");
    if (transferCancelBack) {
      closeTransferCancelModal();
      return;
    }

    var transferCancelConfirm = e.target.closest("[data-ticket-transfer-cancel-confirm]");
    if (transferCancelConfirm) {
      if (!hasActiveTransferRequest()) {
        closeTransferCancelModal();
        renderDetail("lumi-pass");
        return;
      }
      ensureTransferRequestTime();
      transferRequestState.status = "cancelled";
      transferRequestState.cancelledAt = formatTransferTimestamp(new Date());
      sourceTicketState = getTicketById(activeTicketId) || sourceTicketState;
      var cancelledTransfer = getOpenTransferForSource(sourceTicketState.id) || getTransferForTicket(sourceTicketState);
      if (cancelledTransfer) resolveTransferRecord(cancelledTransfer.id, 'cancelled', transferRequestState.cancelledAt);
      else {
        sourceTicketState.transferRequestStatus = null;
        saveTicketStore();
      }
      transferRequestState.acceptedAt = null;
      transferRequestState.rejectedAt = null;
      transferRequestState.completedAt = null;
      showTransferCancelCompleted();
      return;
    }

    var transferCancelFinish = e.target.closest("[data-ticket-transfer-cancel-finish]");
    if (transferCancelFinish) {
      closeTransferCancelModal();
      transferRequestRecipient = null;
      renderDetail("lumi-pass");
      return;
    }

    var requestDetailCancel = e.target.closest("[data-ticket-transfer-request-detail-cancel]");
    if (requestDetailCancel) {
      if (!hasActiveTransferRequest()) {
        renderDetail("lumi-pass");
        return;
      }
      showTransferCancelConfirm();
      return;
    }

    var refundOpen = e.target.closest("[data-ticket-refund]");
    if (refundOpen) {
      renderDetail("ticket-refund:" + activeTicketId);
      return;
    }

    var refundBack = e.target.closest("[data-ticket-refund-back]");
    if (refundBack) {
      renderDetail("ticket:" + activeTicketId);
      return;
    }

    var refundSubmit = e.target.closest("[data-ticket-refund-submit]");
    if (refundSubmit) {
      var holderInput = app.querySelector("[data-ticket-refund-holder]");
      var bankInput = app.querySelector("[data-ticket-refund-bank]");
      var bankCustomInput = app.querySelector("[data-ticket-refund-bank-custom]");
      var accountInput = app.querySelector("[data-ticket-refund-account]");
      var confirmInput = app.querySelector("[data-ticket-refund-confirm]");
      var bankReady = !!bankInput && !!bankInput.value && (bankInput.value !== "custom" || !!(bankCustomInput && bankCustomInput.value.trim()));
      if (!holderInput || !holderInput.value.trim() || !bankReady || !accountInput || !accountInput.value.trim() || !confirmInput || !confirmInput.checked) return;
      refundSubmit.textContent = "환불 접수 준비 완료";
      refundSubmit.classList.add("is-ready");
      refundSubmit.setAttribute("aria-disabled", "true");
      return;
    }

    var transferBack = e.target.closest("[data-ticket-transfer-back]");
    if (transferBack) {
      returnToTicketDetail();
      return;
    }

    var transferOpen = e.target.closest("[data-ticket-transfer]");
    if (transferOpen) {
      openTransferDetail();
      return;
    }

    var meateTab = e.target.closest("[data-meate-tab]");
    if (meateTab) {
      meateActiveTab = meateTab.getAttribute("data-meate-tab") === "completed" ? "completed" : "available";
      renderDetail("meate");
      return;
    }

    var meateDetail = e.target.closest("[data-meate-benefit-detail]");
    if (meateDetail) {
      renderDetail(meateDetail.getAttribute("data-meate-benefit-detail"));
      return;
    }

    var meateBack = e.target.closest("[data-meate-benefit-back]");
    if (meateBack) {
      renderDetail("meate");
      return;
    }

    var meateHistory = e.target.closest("[data-meate-benefit-history]");
    if (meateHistory) {
      renderDetail(meateHistory.getAttribute("data-meate-benefit-history") + "-usage-history");
      return;
    }

    var meateHistoryBack = e.target.closest("[data-meate-benefit-history-back]");
    if (meateHistoryBack) {
      renderDetail(meateHistoryBack.getAttribute("data-meate-benefit-history-back") || "meate");
      return;
    }

    var benefitHistory = e.target.closest("[data-ticket-benefit-history]");
    if (benefitHistory) {
      var benefitHistoryType = benefitHistory.getAttribute("data-ticket-benefit-history") || "welcome";
      if (!hasBenefitUsage(benefitHistoryType)) return;
      renderDetail(benefitHistoryType + "-usage-history");
      return;
    }

    var benefitHistoryBack = e.target.closest("[data-ticket-benefit-history-back]");
    if (benefitHistoryBack) {
      renderDetail(benefitHistoryBack.getAttribute("data-ticket-benefit-history-back") || "welcome");
      return;
    }

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

    var sortButton = e.target.closest("[data-ticket-sort]");
    if (sortButton && !sortButton.classList.contains("ticket-sort-static")) {
      var currentOrder = sortButton.getAttribute("data-ticket-sort-order") || "latest";
      var nextOrder = currentOrder === "latest" ? "oldest" : "latest";
      sortButton.setAttribute("data-ticket-sort-order", nextOrder);
      applyTicketSort(nextOrder);
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


  function syncRefundBankField() {
    var bankSelect = app.querySelector("[data-ticket-refund-bank]");
    var customWrap = app.querySelector(".ticket-refund-custom-bank");
    var customInput = app.querySelector("[data-ticket-refund-bank-custom]");
    if (!bankSelect || !customWrap || !customInput) return;
    var isCustom = bankSelect.value === "custom";
    customWrap.classList.toggle("is-hidden", !isCustom);
    customInput.disabled = !isCustom;
    if (!isCustom) customInput.value = "";
  }

  function updateRefundSubmitState() {
    var submit = app.querySelector("[data-ticket-refund-submit]");
    var holder = app.querySelector("[data-ticket-refund-holder]");
    var bank = app.querySelector("[data-ticket-refund-bank]");
    var bankCustom = app.querySelector("[data-ticket-refund-bank-custom]");
    var account = app.querySelector("[data-ticket-refund-account]");
    var confirm = app.querySelector("[data-ticket-refund-confirm]");
    if (!submit || !holder || !bank || !account || !confirm) return;
    var bankReady = !!bank.value && (bank.value !== "custom" || !!(bankCustom && bankCustom.value.trim()));
    var ready = !!holder.value.trim() && bankReady && !!account.value.trim() && !!confirm.checked;
    submit.classList.toggle("disabled", !ready);
    submit.setAttribute("aria-disabled", ready ? "false" : "true");
  }

  app.__handleTicketSystemBack = function (e) {
    var backButton = e.target.closest('[data-action="back"]');
    if (!backButton) return false;
    var sheet = app.querySelector('[data-ticket-detail-sheet]');
    if (!sheet || !sheet.classList.contains('is-open')) return false;
    if (app.querySelector('.ticket-refund-page')) {
      e.preventDefault();
      e.stopPropagation();
      renderDetail('ticket:' + activeTicketId);
      return true;
    }
    if (app.querySelector('.ticket-detail-page, .ticket-benefit-page, .ticket-transfer-page, .ticket-qr-page, .ticket-transfer-history-page, .ticket-record-page')) {
      e.preventDefault();
      e.stopPropagation();
      closeDetail();
      return true;
    }
    return false;
  };

  app.addEventListener("change", function (e) {
    if (!e.target.closest(".ticket-refund-page")) return;
    if (e.target.matches("[data-ticket-refund-bank]")) {
      syncRefundBankField();
    }
    updateRefundSubmitState();
  });

  app.addEventListener("input", function (e) {
    if (e.target && e.target.id === "ticket-transfer-id") {
      resetTransferLookup();
    }
    if (e.target && e.target.closest && e.target.closest(".ticket-refund-page")) {
      updateRefundSubmitState();
    }
  });

  app.addEventListener("keydown", function (e) {
    if (!e.target || e.target.id !== "ticket-transfer-id" || e.key !== "Enter") return;
    e.preventDefault();
    checkTransferAccount();
  });

  app.__syncIncomingTransferNotice = syncIncomingTransferNotice;

  if (!window.LumiTicketRuntime.notificationListenerBound) {
    window.LumiTicketRuntime.notificationListenerBound = true;
    document.addEventListener("lumi:notification-state-change", function () {
      var activeApp = window.LumiTicketRuntime.activeApp;
      if (!activeApp || !activeApp.isConnected || typeof activeApp.__syncIncomingTransferNotice !== "function") return;
      activeApp.__syncIncomingTransferNotice();
    });
  }

  if (!window.LumiTicketRuntime.systemBackListenerBound) {
    window.LumiTicketRuntime.systemBackListenerBound = true;
    document.addEventListener("click", function (e) {
      var activeApp = window.LumiTicketRuntime.activeApp;
      if (!activeApp || !activeApp.isConnected || typeof activeApp.__handleTicketSystemBack !== "function") return;
      activeApp.__handleTicketSystemBack(e);
    }, true);
  }

  function openIncomingTransferRequest(requestTransferId) {
    var pending = requestTransferId ? (window.LumiTicketStore.transfers || []).filter(function (transfer) { return transfer.id === requestTransferId && transfer.status === 'pending' && transfer.recipient && transfer.recipient.id === window.LumiTicketStore.viewerId; })[0] : getPendingIncomingTransfers()[0];
    if (!pending && hasResolvedIncomingTransfer()) {
      var accepted = (window.LumiTicketStore.transfers || []).filter(function (transfer) {
        return transfer.status === "accepted" && transfer.recipient && transfer.recipient.id === window.LumiTicketStore.viewerId;
      })[0];
      if (accepted && accepted.receivedTicketId) {
        openDetail("ticket:" + accepted.receivedTicketId);
        return;
      }
    }
    if (!pending) return;
    activeTicketId = pending.sourceTicketId || activeTicketId;
    transferRequestRecipient = pending.sender || null;
    openTransferRequestDetail();
  }

  app.__openIncomingTransferRequest = openIncomingTransferRequest;
  app.__openTicketTransferHistoryFromMessage = function (transferId) {
    var transfer = (window.LumiTicketStore.transfers || []).filter(function (record) { return record.id === transferId; })[0] || null;
    if (!transfer) return;
    activeTicketId = transfer.sourceTicketId || activeTicketId;
    openTransferHistoryDetail();
  };
  app.__openTicketTransferRequestFromMessage = function (transferId) {
    var transfer = (window.LumiTicketStore.transfers || []).filter(function (record) { return record.id === transferId; })[0] || null;
    if (!transfer) return;
    activeTicketId = transfer.sourceTicketId || activeTicketId;
    transferRequestRecipient = transfer.recipient || null;
    openTransferRequestDetailSender();
  };

  syncIncomingTransferNotice();
  syncTransferredTicketState();

  // Preview helper only: creates the same in-memory pending request state as the real sender flow.
  app.__openTransferRequestDetailPreview = function () {
    var previewAccount = transferAccounts["LB-1003"] || transferAccounts["LB-1002"] || { nickname: "미리보기", id: "LB-PREVIEW" };
    transferRequestRecipient = { nickname: previewAccount.nickname, id: previewAccount.id || "LB-1003", isSelf: false };
    transferRequestState.status = "preview";
    transferRequestState.requestedAt = "";
    transferRequestState.acceptedAt = null;
    transferRequestState.rejectedAt = null;
    transferRequestState.completedAt = null;
    transferRequestState.cancelledAt = null;
    renderDetail("lumi-pass-transfer-request-detail");
  };
};

window.LumiApps.openTicketTransferUnavailable = function (root, options) {
  var app = root && root.querySelector ? root.querySelector("[data-ticket-app]") : null;
  if (!app) return;
  var modal = app.querySelector("[data-ticket-transfer-unavailable]");
  if (!modal) return;
  var message = modal.querySelector("[data-ticket-transfer-unavailable-message]");
  var submessage = modal.querySelector("[data-ticket-transfer-unavailable-submessage]");
  var config = options || {};
  if (message && config.message) message.textContent = config.message;
  if (submessage && config.submessage) submessage.textContent = config.submessage;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
};

window.LumiApps.openTicketTransferRequest = function (root) {
  var app = root && root.querySelector ? root.querySelector("[data-ticket-app]") : null;
  if (!app) return;
  var body = app.querySelector("[data-ticket-detail-body]");
  var sheet = app.querySelector("[data-ticket-detail-sheet]");
  if (!body || !sheet) return;
  body.innerHTML = window.LumiApps.ticketDetails["lumi-pass-transfer-request"] || "";
  sheet.classList.add("is-open");
  sheet.setAttribute("aria-hidden", "false");
};

window.LumiApps.openTransferredTicketPreview = function (root) {
  var app = root && root.querySelector ? root.querySelector("[data-ticket-app]") : null;
  if (!app) return;
  var sheet = app.querySelector("[data-ticket-detail-sheet]");
  var body = app.querySelector("[data-ticket-detail-body]");
  if (!sheet || !body) return;
  body.innerHTML = window.LumiApps.ticketDetails["lumi-pass-transferred"] || "";
  sheet.classList.add("is-open");
  sheet.setAttribute("aria-hidden", "false");
  var completedAt = body.querySelector("[data-ticket-transferred-completed-at]");
  var name = body.querySelector("[data-ticket-transferred-recipient-name]");
  var id = body.querySelector("[data-ticket-transferred-recipient-id]");
  var previewTransfer = (window.LumiTicketStore && window.LumiTicketStore.transfers || []).filter(function (transfer) { return transfer.status === "accepted"; })[0] || null;
  if (completedAt) completedAt.textContent = previewTransfer && previewTransfer.resolvedAt ? previewTransfer.resolvedAt : "처리 완료";
  if (name) name.textContent = previewTransfer && previewTransfer.recipient ? previewTransfer.recipient.nickname : "-";
  if (id) id.textContent = previewTransfer && previewTransfer.recipient ? previewTransfer.recipient.id : "-";
};


window.LumiApps.openTransferRequestDetailPreview = function (root) {
  var app = root && root.querySelector ? root.querySelector("[data-ticket-app]") : null;
  if (!app || typeof app.__openTransferRequestDetailPreview !== "function") return;
  app.__openTransferRequestDetailPreview();
};


window.LumiApps.openTicketTransferRecipientRequest = function (root, transferId) {
  var app = root && root.querySelector ? root.querySelector("[data-ticket-app]") : null;
  if (!app || typeof app.__openIncomingTransferRequest !== "function") return;
  app.__openIncomingTransferRequest(transferId || '');
};


window.LumiApps.getTicketStoreSnapshot = function () {
  var store = window.LumiTicketStore || { tickets: [], transfers: [] };
  return JSON.parse(JSON.stringify(store));
};

window.LumiApps.openTicketNotificationTarget = function (root, detailType) {
  var app = root && root.querySelector ? root.querySelector('[data-ticket-app]') : null;
  if (!app) return;
  var target = String(detailType || 'ticket:ticket-debut-A-023');
  if (target.indexOf('transfer-history:') === 0 && typeof app.__openTicketTransferHistoryFromMessage === 'function') {
    app.__openTicketTransferHistoryFromMessage(target.slice('transfer-history:'.length));
    return;
  }
  if (target.indexOf('transfer-request:') === 0 && typeof app.__openTicketTransferRequestFromMessage === 'function') {
    app.__openTicketTransferRequestFromMessage(target.slice('transfer-request:'.length));
    return;
  }
  if (target === 'lumi-pass') target = 'ticket:ticket-debut-A-023';
  var selector = '[data-ticket-detail="' + target.replace(/"/g, '\\"') + '"]';
  var trigger = app.querySelector(selector);
  if (trigger) trigger.click();
};
