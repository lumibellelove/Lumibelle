(function () {
  'use strict';

  var TASKS = [
    {
      id: 'hc-001', member: '마리링', title: '숙제 체키', taskLabel: '윙크 포즈',
      applyDate: '2025.06.21', shootDate: '2025.06.21', readyDate: '검수 완료 후 안내', currentState: '제작 중',
      status: '진행 중', tone: 'progress',
      timeline: [ ['2025.06.21', '접수됨'], ['2025.06.21', '준비중'] ],
      guide: [
        '마리링에게 윙크 포즈로 촬영한 숙제체키예요.',
        '제작과 검수가 끝나면 수령 가능 상태로 바뀌어요.',
        '상태가 바뀌면 앱에서 다시 확인할 수 있어요.'
      ]
    },
    {
      id: 'hc-002', member: '루루', title: '숙제 체키', taskLabel: '하트 포즈',
      applyDate: '2025.06.21', shootDate: '2025.06.21', readyDate: '검수 완료 후 안내', currentState: '검수 중',
      status: '검수 중', tone: 'review',
      timeline: [ ['2025.06.21', '접수됨'], ['2025.06.21', '준비중'] ],
      guide: [
        '루루에게 하트 포즈로 촬영한 숙제체키예요.',
        '검수가 끝나면 수령 가능 상태로 바뀌어요.',
        '상태가 바뀌면 앱에서 다시 확인할 수 있어요.'
      ]
    },
    {
      id: 'hc-003', member: '이로', title: '숙제 체키', taskLabel: '토끼 포즈',
      applyDate: '2025.06.21', readyDate: '2025.07.18 공연부터',
      status: '수령 가능', tone: 'ready', readyNotice: true,
      pickupOptions: [ '7/18 루미벨 정기공연', '7/25 루미벨 정기공연', '8/1 오히로메' ],
      pickupScheduled: '7/25 루미벨 정기공연', fanMemo: '',
      timeline: [ ['2025.06.21', '접수됨'], ['2025.07.10', '준비중'], ['2025.07.18', '수령 가능'] ],
      guide: [
        '이 체키는 수령을 원하시는 공연을 등록해 주세요.',
        '등록한 공연에 맞춰 멤버가 준비해 드려요.',
        '현장에서는 루미 ID 또는 닉네임을 보여주세요.'
      ]
    },
    {
      id: 'hc-004', member: '루나', title: '숙제 체키', taskLabel: '리본 포즈',
      applyDate: '2025.06.14', completedDate: '2025.06.15',
      status: '수령 완료', tone: 'received',
      timeline: [ ['2025.06.14', '접수됨'], ['2025.06.14', '준비중'], ['2025.06.15', '수령 가능'], ['2025.06.15', '수령 완료'] ],
      guide: [
        '루나에게 리본 포즈로 촬영한 숙제체키예요.',
        '수령이 완료된 숙제체키예요.',
        '다시보기에서 내용을 확인할 수 있어요.'
      ]
    }
  ];

  window.LumiApps = window.LumiApps || {};

  window.LumiApps.homeworkCheki = function () {
    return renderHomeworkChekiList();
  };

  window.LumiApps.bindHomeworkCheki = function (root) {
    var app = root && root.querySelector ? root.querySelector('[data-homework-cheki-app]') : null;
    if (!app || app.__lumiHomeworkChekiBound) return;
    app.__lumiHomeworkChekiBound = true;
    app.__homeworkChekiListFilter = 'all';

    if (window.LumiPhone && typeof window.LumiPhone.setAppBackHandler === 'function') {
      window.LumiPhone.setAppBackHandler(function () {
        return handleHomeworkChekiBack(app);
      });
    }

    app.addEventListener('click', function (event) {
      var detailButton = event.target.closest('[data-homework-cheki-detail]');
      if (detailButton && app.contains(detailButton)) {
        var detailId = detailButton.getAttribute('data-homework-cheki-detail');
        var detailItem = findHomeworkTask(detailId);
        if (detailItem) renderHomeworkChekiDetail(app, detailItem);
        return;
      }

      var planOpen = event.target.closest('[data-homework-cheki-plan-open]');
      if (planOpen && app.contains(planOpen)) {
        openHomeworkChekiPlanModal(app, planOpen.getAttribute('data-homework-cheki-plan-open'));
        return;
      }

      var modalClose = event.target.closest('[data-homework-cheki-modal-close]');
      if (modalClose && app.contains(modalClose)) {
        closeHomeworkChekiPlanModal(app);
        return;
      }

      var planSave = event.target.closest('[data-homework-cheki-plan-save]');
      if (planSave && app.contains(planSave)) {
        saveHomeworkChekiPlan(app);
        return;
      }

      var listBack = event.target.closest('[data-homework-cheki-ui="list"]');
      if (listBack && app.contains(listBack)) {
        returnToHomeworkChekiList(app);
        return;
      }

      var back = event.target.closest('[data-homework-cheki-ui="back"]');
      if (back && window.LumiPhone && typeof window.LumiPhone.goBack === 'function') {
        window.LumiPhone.goBack();
        return;
      }

      var tab = event.target.closest('[data-homework-cheki-filter]');
      if (!tab || !app.contains(tab)) return;
      setHomeworkChekiFilter(app, tab.getAttribute('data-homework-cheki-filter') || 'all');
    });

    app.addEventListener('change', function (event) {
      var option = event.target.closest('[data-homework-cheki-plan-option]');
      if (!option || !app.contains(option)) return;
      syncHomeworkChekiPlanForm(app);
    });
  };

  function getHomeworkChekiActiveFilter(app) {
    return app.__homeworkChekiListFilter || 'all';
  }

  function returnToHomeworkChekiList(app) {
    var filter = getHomeworkChekiActiveFilter(app);
    app.innerHTML = renderHomeworkChekiListInner();
    setHomeworkChekiFilter(app, filter);
  }

  function handleHomeworkChekiBack(app) {
    var modal = app.querySelector('[data-homework-cheki-plan-modal].is-open');
    if (modal) {
      closeHomeworkChekiPlanModal(app);
      return true;
    }

    if (app.querySelector('[data-homework-cheki-detail-view]')) {
      returnToHomeworkChekiList(app);
      return true;
    }

    return false;
  }

  function renderHomeworkChekiList() {
    return '<section class="homework-cheki-app" data-homework-cheki-app>' + renderHomeworkChekiListInner() + '</section>';
  }

  function renderHomeworkChekiListInner() {
    var counts = getHomeworkChekiCounts();
    return [
      '<header class="homework-cheki-topbar">',
        '<button class="homework-cheki-top-back" type="button" data-homework-cheki-ui="back" aria-label="뒤로가기">‹</button>',
        '<div class="homework-cheki-brand"><strong>LumiPhone</strong><span>V2</span></div>',
        '<div class="homework-cheki-top-actions">',
          '<span class="homework-cheki-profile-slot" aria-label="프로필 이미지 자리"></span>',
          '<button type="button" class="homework-cheki-notice" data-homework-cheki-ui="notice">알림</button>',
        '</div>',
      '</header>',
      '<section class="homework-cheki-title-panel">',
        '<span class="homework-cheki-title-mark" aria-hidden="true"></span>',
        '<h2>숙제체키</h2>',
        '<span class="homework-cheki-title-mark" aria-hidden="true"></span>',
      '</section>',
      '<section class="homework-cheki-summary-card">',
        '<div class="homework-cheki-summary-image-slot" aria-label="안내 이미지 자리"></div>',
        '<div class="homework-cheki-summary-copy">',
          '<p>내 숙제체키를 확인하고<br>진행 현황을 살펴보세요.</p>',
          '<div class="homework-cheki-summary-stats">',
            '<div><span>진행 중</span><strong>' + counts.progress + '개</strong></div>',
            '<div><span>수령 가능</span><strong>' + counts.ready + '개</strong></div>',
            '<div><span>수령 완료</span><strong>' + counts.received + '개</strong></div>',
          '</div>',
        '</div>',
      '</section>',
      '<nav class="homework-cheki-tabs" aria-label="숙제체키 분류" role="tablist">',
        '<button type="button" class="is-active" data-homework-cheki-filter="all" role="tab" aria-selected="true">전체</button>',
        '<button type="button" data-homework-cheki-filter="progress" role="tab" aria-selected="false">진행 중</button>',
        '<button type="button" data-homework-cheki-filter="ready" role="tab" aria-selected="false">수령 가능</button>',
        '<button type="button" data-homework-cheki-filter="received" role="tab" aria-selected="false">수령 완료</button>',
      '</nav>',
      '<section class="homework-cheki-list" aria-label="숙제체키 목록" aria-live="polite">', TASKS.map(renderTask).join(''), '</section>',
      '<section class="homework-cheki-guide">',
        '<div class="homework-cheki-guide-image-slot" aria-label="안내 이미지 자리"></div>',
        '<div><strong>안내</strong><p>숙제체키는 멤버와 운영팀이 준비해요.<br>수령 가능 상태가 되면 루미벨 특전회에서 받을 수 있어요.<br>현장에서는 루미 ID 또는 닉네임을 보여주세요.</p></div>',
      '</section>',
      TASKS.filter(function (item) { return item.tone === 'ready'; }).map(renderHomeworkChekiPlanModal).join('')
    ].join('');
  }

  function renderHomeworkChekiDetail(app, item) {
    var isReady = item.tone === 'ready';
    var isSingleAction = item.tone !== 'ready';
    return app.innerHTML = [
      '<header class="homework-cheki-topbar homework-cheki-detail-topbar">',
        '<button class="homework-cheki-top-back" type="button" data-homework-cheki-ui="list" aria-label="목록으로">‹</button>',
        '<div class="homework-cheki-brand"><strong>LumiPhone</strong><span>V2</span></div>',
        '<div class="homework-cheki-top-actions">',
          '<span class="homework-cheki-profile-slot" aria-label="프로필 이미지 자리"></span>',
          '<button type="button" class="homework-cheki-notice" data-homework-cheki-ui="notice">알림</button>',
        '</div>',
      '</header>',
      '<section class="homework-cheki-title-panel homework-cheki-detail-title">',
        '<span class="homework-cheki-title-mark" aria-hidden="true"></span>',
        '<h2>숙제체키</h2>',
        '<span class="homework-cheki-title-mark" aria-hidden="true"></span>',
      '</section>',
      '<main class="homework-cheki-detail" data-homework-cheki-detail-view="', escapeHtml(item.id), '">',
        '<section class="homework-cheki-detail-hero">',
          '<div class="homework-cheki-detail-visual-slot" aria-label="숙제체키 이미지 자리"></div>',
          '<div class="homework-cheki-detail-main">',
            '<div class="homework-cheki-detail-row"><span class="homework-cheki-detail-member">', escapeHtml(item.member), '</span><em class="is-', escapeHtml(item.tone), '">', escapeHtml(item.status), '</em></div>',
            '<h3>', escapeHtml(item.title), '</h3>',
            '<dl class="homework-cheki-detail-info">', renderDetailInfo(item), '</dl>',
          '</div>',
        '</section>',
        '<section class="homework-cheki-detail-section homework-cheki-detail-homework">',
          '<div class="homework-cheki-detail-section-head"><span aria-hidden="true"></span><h4>숙제 내용</h4><span aria-hidden="true"></span></div>',
          '<div class="homework-cheki-detail-content-grid">',
            '<div class="homework-cheki-detail-small-slot" aria-label="숙제 안내 이미지 자리"></div>',
            '<ul>', item.guide.map(function (line) { return '<li>' + escapeHtml(line) + '</li>'; }).join(''), '</ul>',
            '<div class="homework-cheki-detail-small-slot" aria-label="숙제 안내 이미지 자리"></div>',
          '</div>',
        '</section>',
        '<section class="homework-cheki-detail-section homework-cheki-detail-record">',
          '<div class="homework-cheki-detail-section-head"><span aria-hidden="true"></span><h4>처리 기록</h4><span aria-hidden="true"></span></div>',
          '<ol class="homework-cheki-detail-timeline">', renderTimeline(item), '</ol>',
          '<div class="homework-cheki-detail-record-slot" aria-label="처리 기록 이미지 자리"></div>',
        '</section>',
        '<section class="homework-cheki-detail-notice-card">',
          '<div class="homework-cheki-detail-notice-slot" aria-label="안내 이미지 자리"></div>',
          '<div><strong>안내</strong><p>', renderMultilineText(getDetailNotice(item)), '</p></div>',
          '<div class="homework-cheki-detail-notice-slot" aria-label="안내 이미지 자리"></div>',
        '</section>',
        '<div class="homework-cheki-detail-actions', isReady ? ' is-ready' : '', isSingleAction ? ' is-single' : '', '">',
          '<button type="button" class="homework-cheki-detail-action homework-cheki-detail-action-primary" data-homework-cheki-ui="list">목록으로</button>',
          isReady ? '<button type="button" class="homework-cheki-detail-action" data-homework-cheki-plan-open="' + escapeHtml(item.id) + '">' + escapeHtml(item.pickupScheduled ? '예정 변경' : '수령 예정 등록') + '</button>' : '',
        '</div>',
      '</main>',
      isReady ? renderHomeworkChekiPlanModal(item) : ''
    ].join('');
  }

  function renderDetailInfo(item) {
    if (item.tone === 'ready') {
      return [
        detailInfo('신청일', item.applyDate),
        detailInfo('수령 가능일', item.readyDate),
        detailInfo('수령 예정 공연', item.pickupScheduled || '미등록'),
        detailInfo('팬 메모', item.fanMemo || '메모 없음')
      ].join('');
    }

    if (item.tone === 'received') {
      return [
        detailInfo('신청일', item.applyDate),
        detailInfo('수령 완료일', item.completedDate || '수령 완료'),
        detailInfo('현재 상태', '수령 완료')
      ].join('');
    }

    return [
      detailInfo('신청일', item.applyDate),
      detailInfo('촬영일', item.shootDate || item.applyDate),
      detailInfo('현재 상태', item.currentState || item.status),
      detailInfo('수령 가능일', item.readyDate)
    ].join('');
  }

  function renderTimeline(item) {
    return item.timeline.map(function (entry, index) {
      return '<li class="' + (index === item.timeline.length - 1 ? 'is-current' : '') + '"><span class="homework-cheki-detail-timeline-dot" aria-hidden="true"></span><time>' + escapeHtml(entry[0]) + '</time><strong>' + escapeHtml(entry[1]) + '</strong></li>';
    }).join('');
  }

  function getDetailNotice(item) {
    if (item.tone === 'ready') {
      return '등록한 공연의 루미벨 특전회에서 받을 수 있어요.\n공연 일정이 바뀌면 수령 예정 공연을 다시 변경해 주세요.';
    }
    if (item.tone === 'received') {
      return '수령이 완료된 숙제체키예요.\n다시보기에서 내용을 확인할 수 있어요.';
    }
    return '수령 가능일은 검수 완료 후 안내돼요.\n상태가 바뀌면 앱에서 다시 확인할 수 있어요.';
  }

  function renderHomeworkChekiPlanModal(item) {
    var isDirect = isDirectPickupPlan(item);
    var hasScheduled = !!item.pickupScheduled;
    return [
      '<section class="homework-cheki-plan-modal" data-homework-cheki-plan-modal="', escapeHtml(item.id), '" hidden aria-hidden="true">',
        '<button type="button" class="homework-cheki-plan-backdrop" data-homework-cheki-modal-close aria-label="닫기"></button>',
        '<div class="homework-cheki-plan-dialog" role="dialog" aria-modal="true" aria-labelledby="homeworkChekiPlanTitle-', escapeHtml(item.id), '">',
          '<button type="button" class="homework-cheki-plan-close" data-homework-cheki-modal-close aria-label="닫기">×</button>',
          '<header class="homework-cheki-plan-head">',
            '<span class="homework-cheki-plan-image-slot" aria-hidden="true"></span>',
            '<h4 id="homeworkChekiPlanTitle-', escapeHtml(item.id), '">', escapeHtml(hasScheduled ? '수령 예정 변경' : '수령 예정 등록'), '</h4>',
            '<span class="homework-cheki-plan-image-slot" aria-hidden="true"></span>',
          '</header>',
          '<div class="homework-cheki-plan-body">',
            '<section class="homework-cheki-plan-panel">',
              '<strong>받으러 갈 공연 선택</strong>',
              '<div class="homework-cheki-plan-options">',
                (item.pickupOptions || []).map(function (label) {
                  var checked = item.pickupScheduled === label;
                  return '<label class="homework-cheki-plan-option' + (checked ? ' is-selected' : '') + '"><input type="radio" name="homeworkChekiPlanOption-' + escapeHtml(item.id) + '" value="' + escapeHtml(label) + '" data-homework-cheki-plan-option' + (checked ? ' checked' : '') + '><span>' + escapeHtml(label) + '</span></label>';
                }).join(''),
                '<label class="homework-cheki-plan-option' + (isDirect ? ' is-selected' : '') + '"><input type="radio" name="homeworkChekiPlanOption-' + escapeHtml(item.id) + '" value="__direct__" data-homework-cheki-plan-option' + (isDirect ? ' checked' : '') + '><span>직접 입력</span></label>',
              '</div>',
              '<div class="homework-cheki-plan-direct' + (isDirect ? ' is-visible' : '') + '">',
                '<input type="text" value="', escapeHtml(isDirect ? item.pickupScheduled : ''), '" data-homework-cheki-plan-direct-input placeholder="직접 공연명을 입력해 주세요">',
              '</div>',
            '</section>',
            '<section class="homework-cheki-plan-panel homework-cheki-plan-memo-panel">',
              '<strong>메모 (선택)</strong>',
              '<textarea data-homework-cheki-plan-memo rows="7" placeholder="예: 2부 끝나고 갈게요">', escapeHtml(item.fanMemo || ''), '</textarea>',
            '</section>',
          '</div>',
          '<div class="homework-cheki-plan-actions">',
            '<button type="button" class="homework-cheki-plan-action" data-homework-cheki-modal-close>취소</button>',
            '<button type="button" class="homework-cheki-plan-action is-primary" data-homework-cheki-plan-save>', escapeHtml(hasScheduled ? '변경하기' : '등록하기'), '</button>',
          '</div>',
        '</div>',
      '</section>'
    ].join('');
  }

  function isDirectPickupPlan(item) {
    if (!item.pickupScheduled) return false;
    return !item.pickupOptions || item.pickupOptions.indexOf(item.pickupScheduled) === -1;
  }

  function openHomeworkChekiPlanModal(app, taskId) {
    var modal = app.querySelector('[data-homework-cheki-plan-modal="' + String(taskId || '') + '"]');
    if (!modal) return;
    modal.hidden = false;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    syncHomeworkChekiPlanForm(app, modal);
  }

  function closeHomeworkChekiPlanModal(app) {
    var modal = app.querySelector('[data-homework-cheki-plan-modal].is-open');
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    modal.hidden = true;
  }

  function syncHomeworkChekiPlanForm(app, modal) {
    modal = modal || app.querySelector('[data-homework-cheki-plan-modal].is-open');
    if (!modal) return;
    var directWrap = modal.querySelector('.homework-cheki-plan-direct');
    var directInput = modal.querySelector('[data-homework-cheki-plan-direct-input]');
    var selected = modal.querySelector('input[data-homework-cheki-plan-option]:checked');
    var isDirect = !!selected && selected.value === '__direct__';

    Array.prototype.forEach.call(modal.querySelectorAll('.homework-cheki-plan-option'), function (label) {
      var input = label.querySelector('input');
      label.classList.toggle('is-selected', !!input && input.checked);
    });

    if (directWrap) directWrap.classList.toggle('is-visible', isDirect);
    if (directInput) {
      directInput.disabled = !isDirect;
      if (isDirect) directInput.focus();
    }
  }

  function saveHomeworkChekiPlan(app) {
    var modal = app.querySelector('[data-homework-cheki-plan-modal].is-open');
    if (!modal) return;
    var item = findHomeworkTask(modal.getAttribute('data-homework-cheki-plan-modal'));
    if (!item) return;

    var selected = modal.querySelector('input[data-homework-cheki-plan-option]:checked');
    var directInput = modal.querySelector('[data-homework-cheki-plan-direct-input]');
    var memoField = modal.querySelector('[data-homework-cheki-plan-memo]');

    var schedule = '';
    if (selected) {
      if (selected.value === '__direct__') {
        schedule = directInput ? String(directInput.value || '').trim() : '';
      } else {
        schedule = selected.value;
      }
    }

    item.pickupScheduled = schedule;
    item.fanMemo = memoField ? String(memoField.value || '').trim() : '';

    var detailView = app.querySelector('[data-homework-cheki-detail-view]');
    if (detailView) {
      renderHomeworkChekiDetail(app, item);
      return;
    }

    var activeTab = app.querySelector('[data-homework-cheki-filter].is-active');
    var activeFilter = activeTab ? activeTab.getAttribute('data-homework-cheki-filter') : 'all';
    app.innerHTML = renderHomeworkChekiListInner();
    setHomeworkChekiFilter(app, activeFilter || 'all');
  }

  function getHomeworkChekiCounts() {
    return TASKS.reduce(function (acc, item) {
      if (item.tone === 'progress' || item.tone === 'review') acc.progress += 1;
      else if (item.tone === 'ready') acc.ready += 1;
      else if (item.tone === 'received') acc.received += 1;
      return acc;
    }, { progress: 0, ready: 0, received: 0 });
  }

  function detailInfo(label, value) {
    return '<div><dt>' + escapeHtml(label) + '</dt><dd>' + escapeHtml(value) + '</dd></div>';
  }

  function renderMultilineText(value) {
    return escapeHtml(value).replace(/\n/g, '<br>');
  }

  function setHomeworkChekiFilter(app, filter) {
    var activeFilter = ['all', 'progress', 'ready', 'received'].indexOf(filter) > -1 ? filter : 'all';
    app.__homeworkChekiListFilter = activeFilter;
    var tabs = app.querySelectorAll('[data-homework-cheki-filter]');
    var list = app.querySelector('.homework-cheki-list');
    if (!list) return;

    Array.prototype.forEach.call(tabs, function (tab) {
      var isActive = tab.getAttribute('data-homework-cheki-filter') === activeFilter;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    var visibleTasks = TASKS.filter(function (item) {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'progress') return item.tone === 'progress' || item.tone === 'review';
      return item.tone === activeFilter;
    });
    list.innerHTML = visibleTasks.length ? visibleTasks.map(renderTask).join('') : renderEmptyHomeworkCheki(activeFilter);
  }

  function renderEmptyHomeworkCheki(filter) {
    var label = filter === 'progress' ? '진행 중인' : (filter === 'ready' ? '수령 가능한' : '수령 완료된');
    return '<p class="homework-cheki-empty">' + label + ' 숙제 체키가 없어요.</p>';
  }

  function renderTask(item) {
    var isReady = item.tone === 'ready';
    var actionLabel = isReady ? (item.pickupScheduled ? '예정 변경' : '수령 예정 등록') : '상세보기';
    var actionAttr = isReady
      ? ' data-homework-cheki-plan-open="' + escapeHtml(item.id) + '"'
      : ' data-homework-cheki-detail="' + escapeHtml(item.id) + '"';
    var scheduleLine = isReady && item.pickupScheduled
      ? '<p class="homework-cheki-task-schedule"><b>수령 예정</b> ' + escapeHtml(item.pickupScheduled) + '</p>'
      : '';

    return [
      '<article class="homework-cheki-task is-', item.tone, '">',
        '<div class="homework-cheki-task-image-slot" aria-label="숙제체키 이미지 자리"></div>',
        '<button type="button" class="homework-cheki-task-copy homework-cheki-task-detail-trigger" data-homework-cheki-detail="', escapeHtml(item.id), '">',
          '<span class="homework-cheki-task-member">', escapeHtml(item.member), '</span>',
          '<h3>', escapeHtml(item.title), '</h3>',
          '<p class="', item.readyNotice ? 'is-ready-notice' : '', '"><b>', item.readyNotice ? '수령 안내' : '접수일', '</b>', item.readyNotice ? ' 루미벨 특전회에서 받을 수 있어요.' : ' ' + escapeHtml(item.applyDate), '</p>',
          scheduleLine,
        '</button>',
        '<div class="homework-cheki-task-side">',
          '<em>', escapeHtml(item.status), '</em>',
          '<button type="button"', actionAttr, '>', actionLabel, '</button>',
        '</div>',
      '</article>'
    ].join('');
  }

  function findHomeworkTask(id) {
    for (var i = 0; i < TASKS.length; i += 1) {
      if (TASKS[i].id === id) return TASKS[i];
    }
    return null;
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}());
