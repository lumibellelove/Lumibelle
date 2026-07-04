/**
 * booth.js — 스탭 가이드
 *
 * 이미지 자리는 실제 가이드 에셋으로 교체하는 전제의 빈 슬롯이다.
 * 별도의 이모지/텍스트 아이콘을 쓰지 않는다.
 */
window.LumiApps = window.LumiApps || {};

window.LumiApps.booth = function () {
  return [
    '<section class="staff-guide-app" aria-label="스탭 가이드">',
      '<header class="staff-guide-titlebar">',
        '<button type="button" class="staff-guide-back" data-guide-action="back" aria-label="뒤로가기">‹</button>',
        '<div>',
          '<h2>스탭 가이드</h2>',
          '<span>STAFF GUIDE</span>',
        '</div>',
        '<div class="guide-title-art guide-image-slot" data-guide-image="title" aria-hidden="true"></div>',
      '</header>',

      '<section class="guide-hero" aria-label="가이드 안내">',
        '<div class="guide-hero-copy">',
          '<strong>루미벨 스탭 OS 사용 가이드</strong>',
          '<p>필요한 정보를 빠르게 찾아보세요.</p>',
        '</div>',
        '<div class="guide-hero-art guide-image-slot" data-guide-image="hero" aria-hidden="true"></div>',
      '</section>',

      '<label class="guide-search">',
        '<span class="guide-search-mark" aria-hidden="true"></span>',
        '<input type="search" data-guide-search placeholder="가이드 검색" autocomplete="off" />',
      '</label>',

      '<section class="guide-section guide-frequent-section" aria-labelledby="guide-frequent-title">',
        '<h3 id="guide-frequent-title">자주 찾는 가이드</h3>',
        '<div class="guide-frequent-grid">',
          guideQuickItem('입장 확인', 'gate'),
          guideQuickItem('특전회 대기', 'queue'),
          guideQuickItem('특전 사용', 'cheki'),
          guideQuickItem('숙제체키', 'homeworkCheki'),
          guideQuickItem('포인트 정정', 'pointAdjust'),
        '</div>',
      '</section>',

      '<section class="guide-section" aria-labelledby="guide-category-title">',
        '<h3 id="guide-category-title">가이드 카테고리</h3>',
        '<div class="guide-category-grid" data-guide-categories>',
          guideCategory('공연 운영', '입장 · 체크인 · 공연 흐름', 'gate', 'operation'),
          guideCategory('특전 · 체키', '대기 · 특전 사용 · 숙제체키', 'cheki', 'cheki'),
          guideCategory('팬 · 포인트', '팬 조회 · 포인트 기록 · 정정', 'fanCheck', 'fan-point'),
          guideCategory('타이머 · 교류', '호출 · 시간 관리', 'timer', 'timer'),
          guideCategory('계정 · 권한', '로그인 · 권한 설정', 'caution', 'account'),
          guideCategory('문제 해결', '자주 묻는 문제', 'caution', 'help'),
        '</div>',
        '<p class="guide-empty" data-guide-empty hidden>검색 결과가 없습니다.</p>',
      '</section>',

      '<section class="guide-section guide-recent-section" aria-labelledby="guide-recent-title">',
        '<h3 id="guide-recent-title">최근 본 가이드</h3>',
        '<div class="guide-recent-list">',
          guideRecent('특전회 대기 운영 흐름', '2026.07.10', 'queue'),
          guideRecent('숙제체키 접수 방법', '2026.07.09', 'homeworkCheki'),
          guideRecent('포인트 기록 정정 처리', '2026.07.08', 'pointAdjust'),
          guideRecent('메아테 확인 방법', '2026.07.07', 'fanCheck'),
        '</div>',
      '</section>',
    '</section>'
  ].join('');
};

function guideQuickItem(label, appId) {
  return [
    '<button type="button" class="guide-quick-item" data-guide-open="', appId, '" data-guide-keywords="', label, '">',
      '<span class="guide-quick-art guide-image-slot" data-guide-image="quick-', appId, '" aria-hidden="true"></span>',
      '<strong>', label, '</strong>',
    '</button>'
  ].join('');
}

function guideCategory(title, description, appId, imageName) {
  return [
    '<button type="button" class="guide-category-card" data-guide-open="', appId, '" data-guide-keywords="', title, ' ', description, '">',
      '<span class="guide-category-thumb guide-image-slot" data-guide-image="category-', imageName, '" aria-hidden="true"></span>',
      '<span class="guide-category-copy">',
        '<strong>', title, '</strong>',
        '<em>', description, '</em>',
      '</span>',
      '<span class="guide-card-arrow" aria-hidden="true">›</span>',
    '</button>'
  ].join('');
}

function guideRecent(title, date, appId) {
  return [
    '<button type="button" class="guide-recent-row" data-guide-open="', appId, '" data-guide-keywords="', title, '">',
      '<span class="guide-recent-copy"><strong>', title, '</strong></span>',
      '<time datetime="', date.replaceAll('.', '-'), '">', date, '</time>',
      '<span class="guide-card-arrow" aria-hidden="true">›</span>',
    '</button>'
  ].join('');
}

window.LumiApps.mountBooth = function (root, ctx) {
  if (!root || root.dataset.guideMounted === 'true') return;
  root.dataset.guideMounted = 'true';

  var search = root.querySelector('[data-guide-search]');
  var entries = Array.prototype.slice.call(root.querySelectorAll('[data-guide-keywords]'));
  var empty = root.querySelector('[data-guide-empty]');

  root.addEventListener('click', function (event) {
    var back = event.target.closest('[data-guide-action="back"]');
    if (back) {
      if (window.StaffOS && typeof window.StaffOS.goBack === 'function') window.StaffOS.goBack();
      return;
    }

    var target = event.target.closest('[data-guide-open]');
    if (target && ctx && typeof ctx.openApp === 'function') {
      ctx.openApp(target.getAttribute('data-guide-open'));
    }
  });

  if (search) {
    search.addEventListener('input', function () {
      var query = search.value.trim().toLowerCase();
      var visibleCount = 0;

      entries.forEach(function (entry) {
        var matches = !query || entry.getAttribute('data-guide-keywords').toLowerCase().indexOf(query) !== -1;
        entry.hidden = !matches;
        if (matches) visibleCount += 1;
      });

      if (empty) empty.hidden = visibleCount > 0;
    });
  }
};
