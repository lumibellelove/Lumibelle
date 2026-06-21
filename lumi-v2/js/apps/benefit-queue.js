window.LumiApps = window.LumiApps || {};
window.LumiApps.benefitQueue = function (app, ctx) {
  return (
    '<section class="queue-app">' +
      '<article class="queue-app-card">' +
        '<div class="queue-app-image-slot" data-asset-slot="benefit-queue-main">특전회 메인 이미지</div>' +
        '<span class="queue-open-badge">사전 접수 오픈</span>' +
        '<h2>루미벨 데뷔 라이브 특전회</h2>' +
        '<p>사전 접수로 원하는 멤버와 특전을 선택할 수 있어요. 실제 연동 전까지는 화면 구조와 더미 상태만 표시합니다.</p>' +
        '<div class="queue-form-grid">' +
          '<button type="button">멤버 선택</button>' +
          '<button type="button">특전 선택</button>' +
        '</div>' +
        '<div class="queue-action-row">' +
          '<button type="button" class="primary">사전 접수하기</button>' +
          '<button type="button" class="secondary">내 접수 보기</button>' +
        '</div>' +
      '</article>' +
      '<article class="queue-app-card">' +
        '<h3>내 대기 상태</h3>' +
        '<ul class="queue-step-list">' +
          '<li><b>사전 접수</b><span>접수 전</span></li>' +
          '<li><b>1차 호출</b><span>대기</span></li>' +
          '<li><b>2차 호출</b><span>대기</span></li>' +
          '<li><b>도착 확인</b><span>스탭 확인</span></li>' +
          '<li><b>특전 진행</b><span>대기</span></li>' +
        '</ul>' +
      '</article>' +
      '<aside class="queue-note">호출 후 5분 내 입장해주세요. 1차 호출 3분과 2차 호출 2분 안에 도착이 확인되지 않으면 스탭이 미응답 취소 처리할 수 있어요.</aside>' +
    '</section>'
  );
};
