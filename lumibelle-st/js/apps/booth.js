/**
 * booth.js — Staff OS 물판 앱 껍데기
 *
 * Patch 02-2:
 * - 기능/API 연결 없음
 * - 기존 /staff/cheki.html / point.html 수정 없음
 * - 물판 처리 흐름을 앱 안에서 볼 수 있는 작업판 형태로만 구성
 */

window.LumiApps = window.LumiApps || {};

window.LumiApps.booth = function (app, ctx) {
  return (
    '<section class="booth-app">' +
      '<article class="booth-hero">' +
        '<span class="booth-kicker">BOOTH</span>' +
        '<h2>물판 처리</h2>' +
        '<p>특전권 판매, 메아테 혜택 확인, 수령 처리를 담당하는 앱입니다.</p>' +
      '</article>' +

      '<div class="booth-tabs" aria-label="물판 처리 단계">' +
        '<span class="is-active">팬 조회</span>' +
        '<span>메아테</span>' +
        '<span>특전권</span>' +
        '<span>기록</span>' +
      '</div>' +

      '<article class="booth-panel">' +
        '<header>' +
          '<span>STEP 1</span>' +
          '<strong>팬 조회</strong>' +
        '</header>' +
        '<div class="booth-search-row">' +
          '<div class="booth-input-like">루미 ID / 예약번호 / 닉네임</div>' +
          '<button type="button">조회</button>' +
        '</div>' +
        '<p class="booth-note">조회 기능은 아직 연결하지 않았어요. 기존 스탭허브의 물판 처리 흐름을 기준으로 이식합니다.</p>' +
      '</article>' +

      '<article class="booth-panel">' +
        '<header>' +
          '<span>STEP 2</span>' +
          '<strong>메아테 혜택</strong>' +
        '</header>' +
        '<div class="booth-status-grid">' +
          '<div><small>메아테</small><b>Lumibelle</b></div>' +
          '<div><small>상태</small><b>처리 대상</b></div>' +
        '</div>' +
        '<div class="booth-actions">' +
          '<button type="button">수령 완료</button>' +
          '<button type="button">대상 아님</button>' +
        '</div>' +
      '</article>' +

      '<article class="booth-panel">' +
        '<header>' +
          '<span>STEP 3</span>' +
          '<strong>특전권 판매</strong>' +
        '</header>' +
        '<div class="booth-rule-card">' +
          '<b>특전권 15장 구매 시 +1P</b>' +
          '<p>포인트 적립/정정은 포인트 앱에서 따로 관리합니다.</p>' +
        '</div>' +
        '<div class="booth-actions">' +
          '<button type="button">구매 기록 자리</button>' +
          '<button type="button">포인트 앱 열기</button>' +
        '</div>' +
      '</article>' +

      '<article class="booth-panel booth-history">' +
        '<header>' +
          '<span>TODAY</span>' +
          '<strong>오늘 처리 기록</strong>' +
        '</header>' +
        '<ul>' +
          '<li>아직 연결된 처리 기록이 없어요.</li>' +
        '</ul>' +
      '</article>' +
    '</section>'
  );
};
