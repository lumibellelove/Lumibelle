/* Staff OS — 스탭 메모톡
   홈 / 오늘 공연 운영방 1차 구현 */
window.LumiApps = window.LumiApps || {};

var MemoTalkState = {
  view: 'home',
  actionMessageIndex: null,
  editingMessageIndex: null,
  pendingConfirm: null,
  toastMessage: '',
  composeType: '일반',
  searchOpen: false,
  typeSheetOpen: false,
  searchQuery: '',
  archiveQuery: '',
  archiveFilter: '전체',
  selectedArchiveKey: null,
  archiveReturnView: 'history',
  archiveDetailFilter: '전체',
  composeReturnView: 'room',
  taskFilter: '긴급',
  referenceCategory: 'notice',
  referenceItemId: 'notice-1',
  referenceConfirmed: {},
  referenceSort: 'latest',
  referenceDraft: { title: '', summary: '', body: '', targets: [], checks: '', qty: '', stockStatus: '여유', location: '', handoverTo: '', handoverStatus: '인계 대기', manager: '' },
  currentStaff: { name: '총괄', role: '총괄' },
  referenceEditingId: null,
  statusMessageIndex: null,
  completionDraft: '',
  messages: [
    { kind: 'chat', name: '엘로디', text: '입장 대기 상황 공유합니다!\n현재 A구역 대기 약 45명입니다.', time: '09:20', reactions: 3 },
    { kind: 'card', type: '긴급', title: '마리링 특전회 대기열 10분 지연', body: '사인 회차 정리로 인해 10분 지연 발생했습니다.', status: '미확인', time: '09:28', reactions: 6, tone: 'urgent' },
    { kind: 'chat', name: '코델리아', text: '특전회 순서 조정 중입니다.\n곧 정상화될 예정이에요!', time: '09:29', reactions: 2 },
    { kind: 'card', type: '주의', title: '무대 뒤 바닥 미끄럼 주의', body: '어제 비로 인해 바닥이 미끄러울 수 있어요. 이동 시 조심 부탁드립니다.', status: '확인함', time: '09:32', reactions: 4, tone: 'caution' },
    { kind: 'card', type: '입장 확인', title: '입장 체크 시작 완료', body: '입장 시작 시간 13:30\n정상 진행 중입니다.', status: '확인함', time: '09:35', reactions: 3, tone: 'gate' }
  ]
};

window.LumiApps.memo = function () {
  return renderMemoView();
};

function renderMemoView() {
  if (MemoTalkState.view === 'compose') return renderMemoCompose();
  if (MemoTalkState.view === 'task-list') return renderMemoTaskList();
  if (MemoTalkState.view === 'reference-list') return renderMemoReferenceList();
  if (MemoTalkState.view === 'reference-detail') return renderMemoReferenceDetail();
  if (MemoTalkState.view === 'reference-compose') return renderMemoReferenceCompose();
  if (MemoTalkState.view === 'history') return renderMemoArchive();
  if (MemoTalkState.view === 'history-detail') return renderMemoArchiveDetail();
  if (MemoTalkState.view === 'history-chatlog') return renderMemoArchiveChatLog();
  return MemoTalkState.view === 'room' ? renderTodayRoom() : renderMemoHome();
}

function renderMemoHome() {
  return [
    '<section class="memo-home-app memo-app-root" aria-label="스탭 메모톡">',
      '<header class="memo-home-head">',
        '<span class="memo-home-brand-art memo-image-slot" data-memo-image="home-brand" aria-hidden="true"></span>',
        '<div class="memo-home-title">',
          '<span class="memo-home-kicker">LUMIBELLE STAFF OS</span>',
          '<h2>스탭톡</h2>',
          '<p>스탭 간 운영 메모를 한곳에서 관리하세요.</p>',
        '</div>',
        '<div class="memo-home-actions">',
          '<button type="button" class="memo-create-button" data-memo-action="create"><span class="memo-create-icon" aria-hidden="true">+</span><span>새 메모</span></button>',
        '</div>',
      '</header>',

      '<section class="memo-today-room" aria-label="오늘 공연 운영방 요약">',
        '<button type="button" class="memo-today-room-main" data-memo-action="open-room">',
          '<span class="memo-today-label">오늘 공연</span>',
          '<span class="memo-today-copy">',
            '<strong>오늘 공연 운영방</strong>',
            '<em>Shine Me UP : 루미벨 데뷔 라이브</em>',
          '</span>',
          '<span class="memo-room-arrow" aria-hidden="true">›</span>',
        '</button>',
        '<span class="memo-summary-grid">',
          renderMemoLiveSummary(),
        '</span>',
      '</section>',

      '<section class="memo-home-section" aria-labelledby="memo-history-title">',
        '<header class="memo-section-head">',
          '<h3 id="memo-history-title">공연별 기록</h3>',
          '<button type="button" data-memo-action="all-history">전체 보기 <span aria-hidden="true">›</span></button>',
        '</header>',
        '<div class="memo-history-list">',
          memoHomeHistoryCards(),
        '</div>',
      '</section>',

      '<section class="memo-home-section memo-common-section" aria-labelledby="memo-common-title">',
        '<header class="memo-section-head">',
          '<h3 id="memo-common-title">오늘의 운영 참고</h3>',
        '</header>',
        '<div class="memo-common-grid">',
          memoCommon('오늘의 공지', 'notice'),
          memoCommon('물판 · 특전 현황', 'stock'),
          memoCommon('현장 인계사항', 'handover'),
          memoCommon('당일 위치 안내', 'location'),
        '</div>',
      '</section>',
    '</section>'
  ].join('');
}


function memoTaskFilterLabel(filter) {
  return { urgent: '긴급 메모', unread: '미확인 메모', important: '중요 메모', complete: '처리 완료 메모' }[filter] || '메모 작업함';
}

function memoTaskMatches(item, filter) {
  if (!item || item.kind !== 'card') return false;
  if (filter === 'urgent') return item.type === '긴급' && item.status !== '처리 완료';
  if (filter === 'unread') return memoCardConfirmStatus(item) === '미확인';
  if (filter === 'important') return Boolean(item.important) && item.status !== '처리 완료';
  if (filter === 'complete') return item.status === '처리 완료' || item.type === '완료 보고';
  return false;
}

function renderMemoTaskList() {
  var filter = MemoTalkState.taskFilter || 'urgent';
  var cards = MemoTalkState.messages.filter(function (item) { return memoTaskMatches(item, filter); });
  return [
    '<section class="memo-task-app memo-app-root" aria-label="메모 작업함">',
      '<header class="memo-task-head">',
        '<button type="button" class="memo-room-back" data-memo-action="back-task-home" aria-label="메모톡 홈으로">‹</button>',
        '<div><p>오늘 공연 운영방</p><h2>', memoTaskFilterLabel(filter), '</h2></div>',
        '<span aria-hidden="true"></span>',
      '</header>',
      '<div class="memo-task-body">',
        '<p class="memo-task-intro">해당 조건의 메모만 모아서 확인하고 처리할 수 있어요.</p>',
        cards.length ? cards.map(function (item) { return renderRoomMessage(item, MemoTalkState.messages.indexOf(item)); }).join('') : '<p class="memo-task-empty">현재 해당 메모가 없어요.</p>',
      '</div>',
      renderMemoStatusLayer(),
      renderMemoToast(),
    '</section>'
  ].join('');
}

function memoArchiveItems() { return [
  {
    key:'a',
    title:'A 공연',
    date:'2026.07.12 (토) 16:00',
    status:'완료',
    urgent:1,
    unread:2,
    complete:11,
    memos:[
      { type:'긴급', title:'마리링 특전회 대기열 10분 지연', body:'사인 회차 정리로 인해 10분 지연 발생했습니다.', status:'처리 완료', time:'15:12', tone:'urgent', important:true },
      { type:'주의', title:'무대 뒤 바닥 미끄럼 주의', body:'어제 비로 인해 바닥이 미끄러울 수 있어요.', status:'확인함', time:'14:03', tone:'caution' },
      { type:'입장 확인', title:'입장 체크 시작 완료', body:'입장 시작 시간 13:30\n정상 진행 중입니다.', status:'처리 완료', time:'13:25', tone:'gate' },
      { type:'공지', title:'입장 13:30 시작 / 특전회 15:00 예정', body:'전체 운영방에 공지되었습니다.', status:'처리 완료', time:'12:10', tone:'notice' },
      { type:'일반', title:'MD 재입고 2종 확인', body:'띠부씰, 아크릴키링 재입고 완료했어요.', status:'확인함', time:'11:05', tone:'general' }
    ],
    chatLog:[
      { kind:'chat', name:'엘로디', text:'입장 대기 상황 공유합니다!\n현재 A구역 대기 약 45명입니다.', time:'09:20', reactions:3 },
      { kind:'chat', self:true, text:'특전회 동선 다시 확인 중입니다.', time:'09:24', reactions:0 },
      { kind:'chat', name:'코델리아', text:'특전회 순서 조정 중입니다.\n곧 정상화될 예정이에요!', time:'09:29', reactions:2 },
      { kind:'chat', name:'엘로디', text:'입장 체크 시작 5분 전이에요. 대기열 정리 부탁드립니다.', time:'09:33', reactions:1 },
      { kind:'chat', self:true, text:'확인했습니다. A구역부터 바로 정리할게요.', time:'09:34', reactions:0 }
    ]
  },
  {
    key:'b', title:'B 공연', date:'2026.07.18 (토) 14:00', status:'진행', urgent:0, unread:3, complete:7,
    memos:[
      { type:'공지', title:'입장 시작 예정 시간 공유', body:'입장 시작은 14:30 예정입니다.', status:'확인함', time:'13:10', tone:'notice' },
      { type:'주의', title:'우천으로 로비 혼잡 예상', body:'로비 우산 정리 공간 확인 부탁드립니다.', status:'미확인', time:'13:18', tone:'caution' }
    ],
    chatLog:[
      { kind:'chat', name:'엘로디', text:'현장 대기 20명 정도예요.', time:'13:02', reactions:0 },
      { kind:'chat', self:true, text:'우산 비닐 여분 더 챙겨둘게요.', time:'13:05', reactions:0 }
    ]
  },
  {
    key:'c', title:'C 공연', date:'2026.07.25 (토) 18:00', status:'예정', urgent:0, unread:1, complete:0,
    memos:[
      { type:'일반', title:'오픈 전 체크리스트 준비', body:'입장 / 물판 / 특전회 체크리스트 준비 중입니다.', status:'미확인', time:'12:00', tone:'general' }
    ],
    chatLog:[
      { kind:'chat', name:'코델리아', text:'C공연 자료 업로드 완료했어요.', time:'11:40', reactions:0 }
    ]
  },
  { key:'debut', title:'Debut Live', date:'2026.08.01 (토) 17:00', status:'완료', urgent:2, unread:0, complete:9,
    memos:[{ type:'긴급', title:'대기열 재정비 완료', body:'현장 동선 정리가 끝났습니다.', status:'처리 완료', time:'16:42', tone:'urgent' }],
    chatLog:[{ kind:'chat', name:'엘로디', text:'데뷔 라이브 대기열 정리 완료!', time:'16:40', reactions:1 }]
  },
  { key:'shine', title:'Shine Me Up', date:'2026.08.08 (토) 16:00', status:'진행', urgent:1, unread:4, complete:5,
    memos:[{ type:'공지', title:'공연장 입장 동선 재안내', body:'후문 대기 후 순차 입장합니다.', status:'미확인', time:'15:20', tone:'notice' }],
    chatLog:[{ kind:'chat', self:true, text:'사운드 체크 10분 지연될 것 같아요.', time:'15:02', reactions:0 }]
  }
]; }
function memoArchiveSearchText(value) {
  return String(value || '').toLowerCase().replace(/\s+/g, '');
}

function getSelectedArchiveItem() {
  var items = memoArchiveItems();
  var selected = MemoTalkState.selectedArchiveKey;
  for (var i = 0; i < items.length; i += 1) {
    if (items[i].key === selected) return items[i];
  }
  return items[0] || null;
}

function memoArchiveMatches(item) {
  var filter = MemoTalkState.archiveFilter;
  var query = memoArchiveSearchText(MemoTalkState.archiveQuery);
  if (filter === '긴급' && !item.urgent) return false;
  if (filter === '미확인' && !item.unread) return false;
  if (filter === '처리 완료' && !item.complete) return false;
  var searchable = memoArchiveSearchText(item.title + ' ' + item.date + ' ' + item.status);
  return !query || searchable.indexOf(query) !== -1;
}
function memoArchiveFilter(label) { return '<button type="button" class="memo-archive-filter'+(MemoTalkState.archiveFilter===label?' is-active':'')+'" data-memo-action="archive-filter" data-memo-filter="'+label+'">'+label+'</button>'; }
function memoArchiveCard(item) { return [
  '<button type="button" class="memo-archive-card" data-memo-action="open-archive-event" data-memo-archive-key="', item.key, '">',
  '<span class="memo-archive-art memo-image-slot" data-memo-image="archive-',item.key,'" aria-hidden="true"></span>',
  '<span class="memo-archive-copy"><strong>',escapeMemo(item.title),'</strong><em>',escapeMemo(item.date),'</em><i class="memo-archive-status">',escapeMemo(item.status),'</i></span>',
  '<span class="memo-archive-counts"><b>긴급 <i>',item.urgent,'</i></b><b>미확인 <i>',item.unread,'</i></b><b>처리 완료 <i>',item.complete,'</i></b></span><span class="memo-archive-arrow" aria-hidden="true">›</span></button>'
].join(''); }
function memoArchiveDetailFilter(label) {
  return '<button type="button" class="memo-archive-detail-filter' + (MemoTalkState.archiveDetailFilter === label ? ' is-active' : '') + '" data-memo-action="archive-detail-filter" data-memo-detail-filter="' + label + '">' + label + '</button>';
}
function memoArchiveDetailMatches(item) {
  var filter = MemoTalkState.archiveDetailFilter || '전체';
  if (filter === '전체') return true;
  if (filter === '처리 완료') return item.status === '처리 완료';
  return item.type === filter;
}
function memoArchiveStatusClass(status) {
  if (status === '완료') return 'complete';
  if (status === '진행') return 'progress';
  if (status === '예정') return 'planned';
  return 'default';
}
function memoArchiveDetailCard(item) {
  return [
    '<article class="memo-archive-detail-card is-', escapeMemo(item.tone || 'general'), '">',
      '<header>',
        '<span class="memo-archive-detail-type">', escapeMemo(item.type), '</span>',
      '</header>',
      '<strong>', escapeMemo(item.title), '</strong>',
      '<p>', escapeMemo(item.body).replace(/\n/g, '<br>'), '</p>',
      '<footer>',
        '<span class="memo-archive-detail-status is-', statusClass(item.status), '">상태 : <b>', escapeMemo(item.status), '</b></span>',
        '<time>', escapeMemo(item.time), '</time>',
      '</footer>',
    '</article>'
  ].join('');
}
function renderReadonlyChatMessage(item) {
  var text = escapeMemo(item.text || '').replace(/\n/g, '<br>');
  if (item.self) {
    return [
      '<article class="memo-chat-message is-self is-readonly">',
        '<div class="memo-chat-content">',
          '<div class="memo-chat-line">',
            '<footer><time>', escapeMemo(item.time), '</time></footer>',
            '<p>', text, '</p>',
          '</div>',
        '</div>',
      '</article>'
    ].join('');
  }
  return [
    '<article class="memo-chat-message is-readonly">',
      '<span class="memo-chat-avatar memo-image-slot" data-memo-image="avatar" aria-hidden="true"></span>',
      '<div class="memo-chat-content">',
        '<b>', escapeMemo(item.name), '</b>',
        '<div class="memo-chat-line">',
          '<p>', text, '</p>',
          '<footer><time>', escapeMemo(item.time), '</time></footer>',
        '</div>',
      '</div>',
    '</article>'
  ].join('');
}
function renderMemoArchive() {
  var items=memoArchiveItems().filter(memoArchiveMatches);
  return ['<section class="memo-archive-app memo-app-root" aria-label="공연별 기록">',
  '<header class="memo-archive-head"><button type="button" class="memo-archive-back" data-memo-action="close-history" aria-label="메모톡 홈으로">‹</button><div class="memo-archive-heading"><span class="memo-archive-title-art memo-image-slot" data-memo-image="archive-title" aria-hidden="true"></span><h2>공연별 기록</h2><p>SHOW LOG ARCHIVE</p></div><span class="memo-archive-head-spacer" aria-hidden="true"></span></header>',
  '<div class="memo-archive-body"><p class="memo-archive-intro">공연별 메모 기록을 확인할 수 있어요.</p><label class="memo-archive-searchbox"><span class="memo-search-icon" aria-hidden="true"></span><input type="search" data-memo-archive-search value="',escapeMemo(MemoTalkState.archiveQuery),'" placeholder="공연명 또는 날짜 검색" autocomplete="off" /></label>',
  '<div class="memo-archive-filters">',memoArchiveFilter('전체'),memoArchiveFilter('긴급'),memoArchiveFilter('미확인'),memoArchiveFilter('처리 완료'),'</div><div class="memo-archive-list">',items.length?items.map(memoArchiveCard).join(''):'<p class="memo-archive-empty">검색 결과가 없어요.</p>','</div><p class="memo-archive-help">공연을 누르면 해당 공연 메모 기록으로 이동해요.</p></div></section>'].join('');
}
function renderMemoArchiveDetail() {
  var archive = getSelectedArchiveItem();
  var memos = archive ? (archive.memos || []).filter(memoArchiveDetailMatches) : [];
  if (!archive) return '';
  return [
    '<section class="memo-archive-detail-app memo-app-root" aria-label="공연 기록 상세">',
      '<header class="memo-archive-head">',
        '<button type="button" class="memo-archive-back" data-memo-action="back-archive-list" aria-label="공연 목록으로">‹</button>',
        '<div class="memo-archive-heading">',
          '<span class="memo-archive-title-art memo-image-slot" data-memo-image="archive-title" aria-hidden="true"></span>',
          '<h2>', escapeMemo(archive.title), ' 기록</h2>',
          '<p>SHOW LOG DETAIL</p>',
        '</div>',
        '<button type="button" class="memo-archive-detail-room" data-memo-action="open-archive-chatlog">대화 기록 보기</button>',
      '</header>',
      '<div class="memo-archive-body memo-archive-detail-body">',
        '<section class="memo-archive-detail-hero">',
          '<span class="memo-archive-detail-art memo-image-slot" data-memo-image="archive-', escapeMemo(archive.key), '" aria-hidden="true"></span>',
          '<div class="memo-archive-detail-copy">',
            '<strong>', escapeMemo(archive.title), '</strong>',
            '<div class="memo-archive-detail-meta-row">',
              '<em>', escapeMemo(archive.date), '</em>',
              '<i class="memo-archive-status is-', memoArchiveStatusClass(archive.status), '">', escapeMemo(archive.status), '</i>',
            '</div>',
          '</div>',
        '</section>',
        '<div class="memo-archive-detail-filters">',
          memoArchiveDetailFilter('전체'),
          memoArchiveDetailFilter('긴급'),
          memoArchiveDetailFilter('공지'),
          memoArchiveDetailFilter('주의'),
          memoArchiveDetailFilter('처리 완료'),
        '</div>',
        '<div class="memo-archive-detail-list">', memos.length ? memos.map(memoArchiveDetailCard).join('') : '<p class="memo-archive-empty">해당하는 메모가 없어요.</p>', '</div>',
        '<p class="memo-archive-help">위 목록은 해당 공연에서 작성된 메모만 모아둔 기록이에요.</p>',
      '</div>',
    '</section>'
  ].join('');
}
function renderMemoArchiveChatLog() {
  var archive = getSelectedArchiveItem();
  var chats = archive ? (archive.chatLog || []) : [];
  if (!archive) return '';
  return [
    '<section class="memo-archive-chatlog-app memo-app-root" aria-label="공연 대화 기록">',
      '<header class="memo-archive-head">',
        '<button type="button" class="memo-archive-back" data-memo-action="back-archive-detail" aria-label="공연 기록 상세로">‹</button>',
        '<div class="memo-archive-heading">',
          '<span class="memo-archive-title-art memo-image-slot" data-memo-image="archive-title" aria-hidden="true"></span>',
          '<h2>', escapeMemo(archive.title), ' 대화 기록</h2>',
          '<p>READ ONLY CHAT LOG</p>',
        '</div>',
        '<span class="memo-archive-head-spacer" aria-hidden="true"></span>',
      '</header>',
      '<div class="memo-archive-body memo-archive-chatlog-body">',
        '<section class="memo-archive-chatlog-meta">',
          '<strong>', escapeMemo(archive.title), '</strong>',
          '<div class="memo-archive-chatlog-submeta">',
            '<em>', escapeMemo(archive.date), '</em>',
            '<span>읽기 전용</span>',
          '</div>',
        '</section>',
        '<div class="memo-room-stream memo-room-stream--readonly">', chats.length ? chats.map(renderReadonlyChatMessage).join('') : '<p class="memo-archive-empty">대화 기록이 없어요.</p>', '</div>',
      '</div>',
    '</section>'
  ].join('');
}


function memoComposeTypeCard(label, key) {
  var selected = MemoTalkState.composeType === label ? ' is-selected' : '';
  return [
    '<button type="button" class="memo-compose-type-card', selected, '" data-memo-action="select-compose-type" data-memo-type="', label, '">',
      '<span class="memo-compose-type-art memo-image-slot" data-memo-image="compose-', key, '" aria-hidden="true"></span>',
      '<strong>', label, '</strong>',
    '</button>'
  ].join('');
}

function renderMemoCompose() {
  return [
    '<section class="memo-compose-app memo-app-root" aria-label="메모 작성">',
      '<header class="memo-compose-head">',
        '<span class="memo-compose-kicker">LUMIPHONE STAFF OS</span>',
        '<div class="memo-compose-title-row">',
          '<button type="button" class="memo-compose-close" data-memo-action="close-compose" aria-label="작성 취소">×</button>',
          '<h2>메모 작성</h2>',
          '<button type="button" class="memo-compose-done" data-memo-action="submit-compose">완료</button>',
        '</div>',
      '</header>',
      '<form class="memo-compose-form" data-memo-compose-form>',
        '<section class="memo-compose-section">',
          '<h3>메모 종류 선택</h3>',
          '<div class="memo-compose-type-grid">',
            memoComposeTypeCard('일반', 'general'),
            memoComposeTypeCard('공지', 'notice'),
            memoComposeTypeCard('긴급', 'urgent'),
            memoComposeTypeCard('입장 확인', 'gate'),
            memoComposeTypeCard('특전회', 'benefit'),
            memoComposeTypeCard('주의', 'caution'),
            memoComposeTypeCard('분실물', 'lost'),
            memoComposeTypeCard('완료 보고', 'complete'),
          '</div>',
        '</section>',
        '<section class="memo-compose-section">',
          '<label class="memo-compose-label" for="memo-compose-title">제목</label>',
          '<input id="memo-compose-title" type="text" placeholder="제목을 입력하세요" autocomplete="off" />',
        '</section>',
        '<section class="memo-compose-section">',
          '<label class="memo-compose-label" for="memo-compose-body">내용</label>',
          '<textarea id="memo-compose-body" rows="6" placeholder="내용을 입력하세요"></textarea>',
        '</section>',
        '<section class="memo-compose-options" aria-label="메모 옵션">',
          '<label class="memo-compose-important"><input id="memo-compose-important" type="checkbox" /><span class="memo-compose-toggle" aria-hidden="true"></span><b>중요</b></label>',
          '<label class="memo-compose-status"><span>상태</span><select id="memo-compose-status" aria-label="메모 상태"><option>미확인</option><option>확인함</option><option>처리 중</option><option>처리 완료</option></select></label>',
        '</section>',
        '<footer class="memo-compose-footer">',
          '<button type="button" class="memo-compose-cancel" data-memo-action="close-compose">취소</button>',
          '<button type="submit" class="memo-compose-submit">메모 등록</button>',
        '</footer>',
      '</form>',
    '</section>'
  ].join('');
}

function memoSearchMatches(item, query) {
  var needle = String(query || '').trim().toLowerCase();
  if (!needle) return true;
  var haystack = [item.name, item.type, item.title, item.body, item.text, item.status]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.indexOf(needle) !== -1;
}

function renderMemoRoomSearch() {
  if (!MemoTalkState.searchOpen) return '';
  return [
    '<form class="memo-room-searchbar" data-memo-room-search-form role="search">',
      '<span class="memo-room-searchbar-icon"><span class="memo-search-icon" aria-hidden="true"></span></span>',
      '<input type="search" data-memo-room-search-input value="', escapeMemo(MemoTalkState.searchQuery), '" placeholder="메시지 검색" autocomplete="off" aria-label="운영방 메시지 검색" />',
      '<span class="memo-room-search-scope">통합검색</span>',
      '<button type="button" class="memo-room-search-close" data-memo-action="close-search" aria-label="검색 닫기">×</button>',
    '</form>'
  ].join('');
}

function renderMemoSearchEmpty() {
  return '<p class="memo-room-search-empty">검색 결과가 없어요.</p>';
}

function refreshMemoSearchResults(root) {
  var stream = root.querySelector('[data-memo-stream]');
  if (!stream) return;
  var results = MemoTalkState.messages.filter(function (item) {
    return memoSearchMatches(item, MemoTalkState.searchQuery);
  });
  stream.innerHTML = results.length
    ? results.map(function (item) { return renderRoomMessage(item, MemoTalkState.messages.indexOf(item)); }).join('')
    : renderMemoSearchEmpty();
}

function renderTodayRoom() {
  return [
    '<section class="memo-room-app memo-app-root' + (MemoTalkState.searchOpen ? ' is-search-open' : '') + '" aria-label="오늘 공연 운영방">',
      '<header class="memo-room-head">',
        '<button type="button" class="memo-room-back" data-memo-action="back-home" aria-label="메모톡 홈으로">‹</button>',
        '<div class="memo-room-title">',
          '<h2>오늘 공연 운영방</h2>',
          '<p>Shine Me UP : 루미벨 데뷔 라이브</p>',
        '</div>',
        '<div class="memo-room-actions">',
          '<button type="button" class="memo-room-search" data-memo-action="open-search" aria-label="운영방 검색"><span class="memo-search-icon" aria-hidden="true"></span></button>',
          '<button type="button" class="memo-room-menu" data-memo-action="toggle-menu" aria-label="운영방 메뉴"><span></span><span></span><span></span></button>',
        '</div>',
      '</header>',
      renderMemoRoomSearch(),
      '<button type="button" class="memo-room-notice" data-memo-action="notice">',
        '<span class="memo-notice-badge">공지</span>',
        '<strong>', escapeMemo((MemoTalkState.notice && MemoTalkState.notice.text) || '입장 13:30 시작 / 특전회 15:00 예정'), '</strong>',
        '<span class="memo-room-arrow" aria-hidden="true">›</span>',
      '</button>',
      '<div class="memo-room-stream" data-memo-stream>',
        (function () { var results = MemoTalkState.messages.filter(function (item) { return memoSearchMatches(item, MemoTalkState.searchQuery); }); return results.length ? results.map(function (item) { return renderRoomMessage(item, MemoTalkState.messages.indexOf(item)); }).join('') : renderMemoSearchEmpty(); })(),
      '</div>',
      renderMemoComposer(),
      '<div class="memo-type-sheet" data-memo-types' + (MemoTalkState.typeSheetOpen ? '' : ' hidden') + '>',
        '<p>업무 메모는 새 메모에서 작성합니다.</p>',
        '<button type="button" data-memo-action="close-types">닫기</button>',
      '</div>',
      renderMemoActionLayer(),
      renderMemoStatusLayer(),
      renderMemoToast(),
    '</section>'
  ].join('');
}

function renderMemoEditBar() {
  var editing = MemoTalkState.editingMessageIndex !== null ? MemoTalkState.messages[MemoTalkState.editingMessageIndex] : null;
  if (!editing) return '';
  return [
    '<section class="memo-edit-bar" data-memo-edit-bar>',
      '<div><strong>메시지 수정</strong><p>', escapeMemo(editing.text), '</p></div>',
      '<button type="button" data-memo-action="cancel-edit" aria-label="수정 취소">×</button>',
    '</section>'
  ].join('');
}

function renderMemoComposer() {
  var editing = MemoTalkState.editingMessageIndex !== null ? MemoTalkState.messages[MemoTalkState.editingMessageIndex] : null;
  var inputValue = editing ? ' value="' + escapeMemo(editing.text) + '"' : '';
  var placeholder = editing ? '메시지를 수정하세요' : '메시지를 입력하세요';
  var sendLabel = editing ? '메시지 수정' : '메시지 보내기';
  return [
    '<form class="memo-composer" data-memo-composer>',
      renderMemoEditBar(),
      '<div class="memo-composer-row">',
        '<button type="button" class="memo-composer-plus" data-memo-action="open-type" aria-label="메모 종류 선택">+</button>',
        '<input type="text" data-memo-input placeholder="', placeholder, '" autocomplete="off"', inputValue, ' />',
        '<button type="submit" class="memo-composer-send" aria-label="', sendLabel, '"><svg class="memo-send-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3.35 2.8 21.3 11.1c.9.42.9 1.38 0 1.8L3.35 21.2c-.82.38-1.67-.36-1.45-1.25l1.82-6.32h7.14c.45 0 .82-.37.82-.82s-.37-.82-.82-.82H3.72L1.9 5.05C1.68 4.16 2.53 2.42 3.35 2.8Z" fill="currentColor"/></svg></button>',
      '</div>',
    '</form>'
  ].join('');
}

function renderMemoActionLayer() {
  var index = MemoTalkState.actionMessageIndex;
  var item = index !== null ? MemoTalkState.messages[index] : null;
  var confirm = MemoTalkState.pendingConfirm;
  var editing = MemoTalkState.editingMessageIndex !== null ? MemoTalkState.messages[MemoTalkState.editingMessageIndex] : null;

  if (editing) return '';
  if (!item && !confirm) return '';

  if (confirm) {
    return [
      '<div class="memo-confirm-layer">',
        '<section class="memo-confirm-dialog" role="dialog" aria-modal="true" aria-label="확인">',
          '<strong>', confirm.type === 'notice' ? '공지로 등록할까요?' : '메시지를 삭제할까요?', '</strong>',
          '<p>', confirm.type === 'notice' ? '등록하면 이 메시지가 오늘 공연 운영방 상단 공지로 표시됩니다.' : '삭제 후에도 삭제된 메시지와 전송 시간은 운영 기록에 남습니다.', '</p>',
          '<div><button type="button" data-memo-action="cancel-confirm">취소</button><button type="button" class="' + (confirm.type === 'delete' ? 'is-delete' : 'is-confirm') + '" data-memo-action="confirm-' + confirm.type + '" data-memo-message-index="' + confirm.index + '">' + (confirm.type === 'notice' ? '공지 등록' : '삭제') + '</button></div>',
        '</section>',
      '</div>'
    ].join('');
  }

  return [
    '<div class="memo-action-layer" data-memo-layer="actions">',
      '<section class="memo-action-sheet" role="dialog" aria-modal="true" aria-label="메시지 메뉴">',
        '<div class="memo-action-list">',
          '<button type="button" data-memo-action="copy-message" data-memo-message-index="', index, '">복사</button>',
          '<button type="button" data-memo-action="notice-message" data-memo-message-index="', index, '">공지</button>',
          '<button type="button" data-memo-action="edit-message" data-memo-message-index="', index, '">수정</button>',
          '<button type="button" class="is-delete" data-memo-action="delete-message" data-memo-message-index="', index, '">삭제</button>',
        '</div>',
      '</section>',
    '</div>'
  ].join('');
}

function renderMemoStatusLayer() {
  var index = MemoTalkState.statusMessageIndex;
  var item = index !== null ? MemoTalkState.messages[index] : null;
  if (!item || item.kind !== 'card') return '';
  var isComplete = MemoTalkState.completionDraft !== null;
  if (isComplete) {
    return [
      '<div class="memo-status-layer">',
        '<section class="memo-status-dialog" role="dialog" aria-modal="true" aria-label="처리 완료 기록">',
          '<strong>처리 완료 기록</strong><p>짧게 처리 내용을 남겨주세요.</p>',
          '<textarea data-memo-complete-note rows="3" placeholder="예: 사인 회차 정리 완료, 15:20부터 정상 진행">', escapeMemo(MemoTalkState.completionDraft || ''), '</textarea>',
          '<div><button type="button" data-memo-action="cancel-status">취소</button><button type="button" class="is-confirm" data-memo-action="save-complete" data-memo-message-index="', index, '">처리 완료</button></div>',
        '</section>',
      '</div>'
    ].join('');
  }
  return [
    '<div class="memo-status-layer">',
      '<section class="memo-status-dialog" role="dialog" aria-modal="true" aria-label="메모 상태 변경">',
        '<strong>상태 변경</strong><p>확인은 하트, 업무 진행은 상태로 관리해요.</p>',
        '<div class="memo-status-options">',
          '<button type="button" data-memo-action="set-status" data-memo-status="미처리" data-memo-message-index="', index, '">미처리</button>',
          '<button type="button" data-memo-action="set-status" data-memo-status="처리 중" data-memo-message-index="', index, '">처리 중</button>',
          '<button type="button" data-memo-action="set-status" data-memo-status="처리 완료" data-memo-message-index="', index, '">처리 완료</button>',
        '</div>',
        '<button type="button" class="memo-status-cancel" data-memo-action="cancel-status">닫기</button>',
      '</section>',
    '</div>'
  ].join('');
}

function renderMemoToast() {
  if (!MemoTalkState.toastMessage) return '';
  return '<div class="memo-toast" role="status" aria-live="polite">' + escapeMemo(MemoTalkState.toastMessage) + '</div>';
}

function memoLiveSummary() {
  var cards = MemoTalkState.messages.filter(function (item) {
    return item && item.kind === 'card';
  });

  return {
    urgent: cards.filter(function (item) {
      return item.type === '긴급' && item.status !== '처리 완료';
    }).length,
    unread: cards.filter(function (item) {
      return memoCardConfirmStatus(item) === '미확인';
    }).length,
    important: cards.filter(function (item) {
      return Boolean(item.important) && item.status !== '처리 완료';
    }).length,
    complete: cards.filter(function (item) {
      return item.status === '처리 완료' || item.type === '완료 보고';
    }).length
  };
}

function renderMemoLiveSummary() {
  var summary = memoLiveSummary();
  return [
    memoSummary('긴급', summary.urgent, 'urgent'),
    memoSummary('미확인', summary.unread, 'unread'),
    memoSummary('중요', summary.important, 'important'),
    memoSummary('처리 완료', summary.complete, 'complete')
  ].join('');
}

function memoSummary(label, value, tone) {
  return '<button type="button" class="memo-summary-item is-' + tone + '" data-memo-action="open-task-filter" data-memo-filter="' + tone + '"><b>' + label + '</b><strong>' + value + '</strong></button>';
}

function memoHomeHistoryItems() {
  /* 최신 공연이 앞에 오고, 새 공연이 추가되면 가장 오래된 항목이 자동으로 밀립니다. */
  return memoArchiveItems().slice().sort(function (a, b) {
    return memoArchiveDateValue(b.date) - memoArchiveDateValue(a.date);
  }).slice(0, 3);
}

function memoArchiveDateValue(dateText) {
  var match = String(dateText || '').match(/(\d{4})\.(\d{2})\.(\d{2})/);
  if (!match) return 0;
  return Number(match[1] + match[2] + match[3]);
}

function memoHomeHistoryCards() {
  return memoHomeHistoryItems().map(memoHomeHistoryCard).join('');
}

function memoHomeHistoryCard(item) {
  return [
    '<button type="button" class="memo-history-card" data-memo-action="open-home-history-event" data-memo-archive-key="', item.key, '">',
      '<span class="memo-history-art memo-image-slot" data-memo-image="history-', item.key, '" aria-hidden="true"></span>',
      '<span class="memo-history-main">',
        '<strong>', escapeMemo(item.title), '</strong>',
        '<span class="memo-history-meta">',
          '<em>', escapeMemo(item.date), '</em>',
          '<i class="memo-history-status is-', memoArchiveStatusClass(item.status), '">', escapeMemo(item.status), '</i>',
        '</span>',
      '</span>',
      '<span class="memo-history-counts"><b>긴급 <i>', item.urgent, '</i></b><b>미확인 <i>', item.unread, '</i></b><b>처리 완료 <i>', item.complete, '</i></b></span>',
      '<span class="memo-room-arrow" aria-hidden="true">›</span>',
    '</button>'
  ].join('');
}

function memoCommon(title, referenceKey) {
  return [
    '<button type="button" class="memo-common-card" data-memo-action="open-reference" data-memo-reference="', escapeMemo(referenceKey), '">',
      '<span class="memo-common-art memo-image-slot" data-memo-image="common" aria-hidden="true"></span>',
      '<strong>', escapeMemo(title), '</strong>',
    '</button>'
  ].join('');
}

var MemoReferenceDataStore = null;

function memoReferenceData() {
  if (MemoReferenceDataStore) return MemoReferenceDataStore;
  MemoReferenceDataStore = {
    notice: {
      title: '오늘의 공지',
      kicker: 'OPERATING REFERENCE',
      intro: '오늘 스탭 전체가 꼭 알아야 하는 운영 변경사항을 확인하는 곳이에요.',
      listLabel: '공지 목록',
      addLabel: '공지 추가',
      items: [
        { id:'notice-1', title:'입장 시작 13:30 / 특전회 15:00 예정', summary:'오늘 공연 운영 일정입니다. 현장 상황에 따라 변동 시 다시 공지합니다.', author:'총괄', time:'09:10', updated:'09:28', body:['오늘 공연 입장은 13:30부터 시작합니다.','특전회는 15:00 예정이며, 현장 상황에 따라 시작 시간이 조정될 수 있습니다.','A구역 대기 동선과 입장 안내는 운영방 공지를 우선 확인해주세요.','변동이 생기면 이 화면과 운영방에 다시 공지됩니다.'], targets:['전체 스탭','총괄','부총괄','입장팀','물판 담당','촬영 담당','매니저'], checks:['입장 시작 시간 13:30 확인','특전회 예정 시간 15:00 확인','시간 변동 시 운영방 재확인'] },
        { id:'notice-2', title:'A구역 대기 동선 변경', summary:'현장 혼잡으로 인해 A구역 대기 위치를 입구 오른쪽 라인으로 조정합니다.', author:'입장팀', time:'10:05', updated:'10:05', body:['A구역 대기 위치를 입구 오른쪽 라인으로 조정합니다.','입장 대기 스탭은 줄이 길어질 경우 2열 전환 후 총괄에게 공유해주세요.'], targets:['총괄','부총괄','입장팀'], checks:['A구역 대기줄 위치 확인','혼잡 시 2열 전환','변동 사항 총괄 공유'] },
        { id:'notice-3', title:'우천 대비 우산 보관 안내', summary:'우산은 입구 왼편 보관함에 임시 보관 부탁드립니다.', author:'운영방', time:'11:20', updated:'11:20', body:['우산은 입구 왼편 보관함에 임시 보관합니다.','입장팀은 우산 비닐 여분과 보관함 상태를 수시로 확인해주세요.'], targets:['입장팀','매니저'], checks:['우산 보관함 위치 확인','우산 비닐 여분 확인'] }
      ]
     },
    stock: {
      type: 'stock',
      title: '물판 · 특전 현황',
      detailTitle: '현황 상세',
      kicker: 'OPERATING REFERENCE',
      intro: '특전권·소모품·물판 재고의 현재 수량과 보충 위치를 확인하는 곳이에요.',
      listLabel: '현황 목록',
      addLabel: '현황 등록',
      items: [
        { id:'stock-1', title:'마리링 핀체키', qty:'12장', status:'여유', location:'특전회 테이블 아래 투명 박스 A', summary:'현재 12장 보유 · 다음 보충 전까지 사용 가능', author:'물판 담당', time:'10:10', updated:'10:10', body:['현재 수량 12장입니다.','다음 회차 전까지는 보충 없이 진행 가능합니다.'] },
        { id:'stock-2', title:'신규 이벤트권 봉투', qty:'1묶음', status:'보충 필요', location:'입장 데스크 오른쪽 서랍', summary:'1묶음 남음 · 종료 전 추가 봉투 보충 필요', author:'부총괄', time:'10:25', updated:'10:25', body:['현재 1묶음 남아 있습니다.','특전회 종료 전 추가 봉투를 무대 뒤 캐리어에서 가져와주세요.'] },
        { id:'stock-3', title:'샤메 필름', qty:'0개', status:'소진', location:'무대 뒤 검은 캐리어', summary:'준비분 소진 · 추가 필름 확인 필요', author:'촬영 담당', time:'11:05', updated:'11:05', body:['준비된 샤메 필름이 모두 소진되었습니다.','추가 재고 여부를 총괄에게 확인해주세요.'] }
      ]
    },
    handover: {
      type: 'handover',
      title: '현장 인계사항',
      detailTitle: '인계 상세',
      kicker: 'OPERATING REFERENCE',
      intro: '교대·담당 변경·공연 종료 후 다음 담당에게 전달해야 할 일을 정리하는 곳이에요.',
      listLabel: '인계 목록',
      addLabel: '인계 추가',
      items: [
        { id:'handover-1', title:'18:30부터 입장 데스크 교대', summary:'루루 담당에서 이로 담당으로 교대합니다.', handoverTo:'이로 · 입장팀', status:'인계 대기', author:'총괄', time:'17:55', updated:'17:55', body:['18:30부터 이로가 입장 데스크를 맡습니다.','예약 확인 시 보류 건 2건을 먼저 이어서 확인해주세요.'] },
        { id:'handover-2', title:'특전회 종료 후 소진 수 전달', summary:'멤버별 특전권 사용 수를 총괄에게 전달합니다.', handoverTo:'물판 담당 · 총괄', status:'인계 확인', author:'물판 담당', time:'18:10', updated:'18:10', body:['특전회 종료 후 멤버별 사용 수를 취합합니다.','봉투 및 잔여 특전권 수량도 함께 총괄에게 전달해주세요.'] }
      ]
    },
    location: {
      type: 'location',
      title: '당일 위치 안내',
      detailTitle: '위치 상세',
      kicker: 'OPERATING REFERENCE',
      intro: '분실물 보관함, 특전권 여분, 스탭 짐, 추가 재고 등 오늘 필요한 물건의 위치를 확인하는 곳이에요.',
      listLabel: '위치 목록',
      addLabel: '위치 추가',
      items: [
        { id:'location-1', title:'분실물 임시 보관함', location:'총괄 테이블 아래 투명 박스', manager:'총괄', summary:'분실물 접수 시 라벨 부착 후 투명 박스에 보관', author:'총괄', time:'13:00', updated:'13:00', body:['분실물 접수 메모를 남긴 뒤 투명 박스에 보관해주세요.','수령 시 본인 확인 후 분실물 메모 상태를 갱신합니다.'] },
        { id:'location-2', title:'특전권 여분 · 신규권 봉투', location:'입장 데스크 오른쪽 서랍', manager:'부총괄', summary:'특전권 여분과 신규 이벤트권 봉투 보관', author:'부총괄', time:'13:05', updated:'13:05', body:['입장팀은 필요 수량만 꺼내 사용해주세요.','남은 수량은 물판·특전 현황에 업데이트합니다.'] },
        { id:'location-3', title:'스탭 짐 · 추가 재고', location:'대기실 A 안쪽 선반 / 무대 뒤 검은 캐리어', manager:'매니저', summary:'개인 짐과 추가 재고를 분리 보관', author:'매니저', time:'13:12', updated:'13:12', body:['개인 짐은 대기실 A 안쪽 선반에 보관합니다.','추가 재고는 무대 뒤 검은 캐리어에서 확인해주세요.'] }
      ]
    }
  };
  return MemoReferenceDataStore;
}

function memoReferenceCategory() {
  return memoReferenceData()[MemoTalkState.referenceCategory] || memoReferenceData().notice;
}

function memoReferenceItem() {
  var category = memoReferenceCategory();
  return category.items.filter(function (item) { return item.id === MemoTalkState.referenceItemId; })[0] || category.items[0];
}

var MEMO_REFERENCE_TARGETS = ['전체 스탭', '총괄', '부총괄', '입장팀', '물판 담당', '촬영 담당', '매니저'];

function memoReferenceDraftTargets(draft) {
  var targets = draft && draft.targets;
  if (Array.isArray(targets)) return targets;
  return String(targets || '').split(/[\n,]+/).map(function (target) { return target.trim(); }).filter(Boolean);
}

function canManageReferenceItem(item) {
  var current = MemoTalkState.currentStaff || {};
  return !!item && (item.author === current.name || current.role === '총괄' || current.role === '부총괄');
}

function memoReferenceTimeValue(item) {
  var raw = String((item && (item.updated || item.time)) || '00:00');
  var match = raw.match(/(\d{1,2}):(\d{2})/);
  if (!match) return 0;
  return Number(match[1]) * 60 + Number(match[2]);
}

function memoReferenceSortedItems(category) {
  var items = (category.items || []).slice();
  items.sort(function (a, b) {
    var diff = memoReferenceTimeValue(a) - memoReferenceTimeValue(b);
    return MemoTalkState.referenceSort === 'oldest' ? diff : -diff;
  });
  return items;
}

function memoReferenceStockStatusClass(status) {
  if (status === '소진') return 'is-empty';
  if (status === '보충 필요') return 'is-low';
  return 'is-ready';
}

function renderMemoStockListCard(item, index) {
  return '<button type="button" class="memo-reference-list-card is-stock" data-memo-action="open-reference-item" data-memo-reference-item="' + escapeMemo(item.id) + '"><b>' + (index + 1) + '</b><span><strong>' + escapeMemo(item.title) + '</strong><em>' + escapeMemo(item.summary || '') + '</em><i class="memo-stock-qty">' + escapeMemo(item.qty || '') + '</i></span><time>' + escapeMemo(item.time) + '</time><mark class="memo-stock-status ' + memoReferenceStockStatusClass(item.status) + '">' + escapeMemo(item.status || '여유') + '</mark><u aria-hidden="true">›</u></button>';
}

function renderMemoStockCompose(category, draft, isEditing) {
  var statuses = ['여유', '보충 필요', '소진'];
  return [
    '<section class="memo-reference-compose-app memo-app-root" aria-label="물판 특전 현황 ', isEditing ? '수정' : '등록', '">',
      '<header class="memo-reference-head">',
        '<button type="button" class="memo-reference-back" data-memo-action="cancel-reference-create" aria-label="목록으로">‹</button>',
        '<div><h2>', escapeMemo(isEditing ? '현황 수정' : '현황 등록'), '</h2><p>', escapeMemo(category.kicker), '</p></div>',
        '<span aria-hidden="true"></span>',
      '</header>',
      '<form class="memo-reference-form memo-stock-form" data-memo-reference-form data-reference-kind="stock">',
        '<label><span>품목명</span><input name="title" type="text" maxlength="80" value="', escapeMemo(draft.title), '" placeholder="예: 마리링 핀체키"></label>',
        '<label><span>현재 수량</span><input name="qty" type="text" maxlength="40" value="', escapeMemo(draft.qty || ''), '" placeholder="예: 12장 / 1묶음 / 0개"></label>',
        '<fieldset class="memo-stock-status-field"><legend>현재 상태</legend><div>',
          statuses.map(function(status) { var checked = (draft.stockStatus || '여유') === status ? ' checked' : ''; return '<label><input type="radio" name="stockStatus" value="' + status + '"' + checked + '><span>' + status + '</span></label>'; }).join(''),
        '</div></fieldset>',
        '<label><span>보관·보충 위치</span><input name="location" type="text" maxlength="120" value="', escapeMemo(draft.location || ''), '" placeholder="예: 특전회 테이블 아래 투명 박스 A"></label>',
        '<label><span>메모</span><textarea name="body" rows="5" placeholder="보충 필요 시점이나 전달할 내용을 적어주세요.">', escapeMemo(draft.body), '</textarea></label>',
        '<div class="memo-reference-form-actions"><button type="button" data-memo-action="cancel-reference-create">취소</button><button type="submit" class="is-submit">', isEditing ? '수정 저장' : '등록하기', '</button></div>',
      '</form>',
    '</section>'
  ].join('');
}

function renderMemoStockDetail(category, item) {
  var canManage = canManageReferenceItem(item);
  var tools = canManage ? '<span class="memo-reference-detail-tools"><button type="button" data-memo-action="edit-reference-item">수정</button><button type="button" data-memo-action="delete-reference-item">삭제</button></span>' : '<span aria-hidden="true"></span>';
  return [
    '<section class="memo-reference-detail-app memo-app-root" aria-label="물판 특전 현황 상세">',
      '<header class="memo-reference-head">',
        '<button type="button" class="memo-reference-back" data-memo-action="back-reference-list" aria-label="목록으로">‹</button>',
        '<div><h2>', escapeMemo(category.detailTitle || '현황 상세'), '</h2><p>', escapeMemo(category.kicker), '</p></div>',
        tools,
      '</header>',
      '<section class="memo-reference-detail-hero">',
        '<span class="memo-reference-category">', escapeMemo(category.title), '</span>',
        '<h3>', escapeMemo(item.title), '</h3>',
        '<p class="memo-reference-meta">작성: ', escapeMemo(item.author), ' <i></i> 등록 ', escapeMemo(item.time), ' <i></i> 최종 수정 ', escapeMemo(item.updated), '</p>',
        '<div class="memo-stock-detail-summary"><b>', escapeMemo(item.qty || '-'), '</b><span class="memo-stock-status ', memoReferenceStockStatusClass(item.status), '">', escapeMemo(item.status || '여유'), '</span></div>',
      '</section>',
      '<section class="memo-reference-detail-section memo-stock-detail-section"><h4>현재 현황</h4><dl><div><dt>현재 수량</dt><dd>', escapeMemo(item.qty || '-'), '</dd></div><div><dt>현재 상태</dt><dd>', escapeMemo(item.status || '여유'), '</dd></div></dl></section>',
      '<section class="memo-reference-detail-section memo-stock-detail-section"><h4>보관·보충 위치</h4><p class="memo-stock-location">', escapeMemo(item.location || '등록된 위치가 없어요.'), '</p></section>',
      '<section class="memo-reference-detail-section"><h4>메모</h4><ul>', (item.body || []).map(function (line) { return '<li>' + escapeMemo(line) + '</li>'; }).join('') || '<li>추가 메모가 없어요.</li>', '</ul></section>',
      '<div class="memo-reference-detail-actions is-single"><button type="button" data-memo-action="back-reference-list">목록으로</button></div>',
    '</section>'
  ].join('');
}

function memoReferenceHandoverStatusClass(status) {
  if (status === '처리 완료') return 'is-ready';
  if (status === '인계 확인') return 'is-low';
  return 'is-empty';
}
function renderMemoHandoverListCard(item, index) {
  return '<button type="button" class="memo-reference-list-card is-stock" data-memo-action="open-reference-item" data-memo-reference-item="' + escapeMemo(item.id) + '"><b>' + (index + 1) + '</b><span><strong>' + escapeMemo(item.title) + '</strong><em>' + escapeMemo(item.summary || '') + '</em><i class="memo-stock-qty">다음: ' + escapeMemo(item.handoverTo || '-') + '</i></span><time>' + escapeMemo(item.time) + '</time><mark class="memo-stock-status ' + memoReferenceHandoverStatusClass(item.status) + '">' + escapeMemo(item.status || '인계 대기') + '</mark><u aria-hidden="true">›</u></button>';
}
function renderMemoLocationListCard(item, index) {
  return '<button type="button" class="memo-reference-list-card is-stock" data-memo-action="open-reference-item" data-memo-reference-item="' + escapeMemo(item.id) + '"><b>' + (index + 1) + '</b><span><strong>' + escapeMemo(item.title) + '</strong><em>' + escapeMemo(item.summary || '') + '</em><i class="memo-stock-qty">' + escapeMemo(item.location || '') + '</i></span><time>' + escapeMemo(item.time) + '</time><u aria-hidden="true">›</u></button>';
}
function renderMemoReferenceList() {
  var category = memoReferenceCategory();
  var items = memoReferenceSortedItems(category);
  var sortLabel = MemoTalkState.referenceSort === 'oldest' ? '오래된순' : '최신순';
  return [
    '<section class="memo-reference-app memo-app-root" aria-label="오늘의 운영 참고">',
      '<header class="memo-reference-head">',
        '<button type="button" class="memo-reference-back" data-memo-action="close-reference" aria-label="메모톡 홈으로">‹</button>',
        '<div><h2>', escapeMemo(category.title), '</h2><p>', escapeMemo(category.kicker), '</p></div>',
        '<span aria-hidden="true"></span>',
      '</header>',
      '<section class="memo-reference-intro">',
        '<span class="memo-reference-intro-art memo-image-slot" data-memo-image="reference-intro" aria-hidden="true"></span>',
        '<div><span>', escapeMemo(category.title), '</span><strong>', escapeMemo(category.title), '</strong><p>', escapeMemo(category.intro), '</p></div>',
      '</section>',
      '<section class="memo-reference-list-section">',
        '<header><h3>', escapeMemo(category.listLabel), '</h3><span class="memo-reference-list-actions"><button type="button" class="memo-reference-add-trigger" data-memo-action="open-reference-create">+ ', escapeMemo(category.addLabel || '추가'), '</button><button type="button" class="memo-reference-sort-trigger" data-memo-action="toggle-reference-sort">', sortLabel, '</button></span></header>',
        '<div class="memo-reference-list">',
          items.map(function (item, index) {
            if (category.type === 'stock') return renderMemoStockListCard(item, index);
            if (category.type === 'handover') return renderMemoHandoverListCard(item, index);
            if (category.type === 'location') return renderMemoLocationListCard(item, index);
            return '<button type="button" class="memo-reference-list-card" data-memo-action="open-reference-item" data-memo-reference-item="' + escapeMemo(item.id) + '"><b>' + (index + 1) + '</b><span><strong>' + escapeMemo(item.title) + '</strong><em>' + escapeMemo(item.summary) + '</em><i>' + escapeMemo(item.author) + '</i></span><time>' + escapeMemo(item.time) + '</time><u aria-hidden="true">›</u></button>';
          }).join(''),
        '</div>',
      '</section>',
      '<p class="memo-reference-hint">카드를 눌러 내용을 자세히 확인할 수 있어요.</p>',
    '</section>'
  ].join('');
}
function renderMemoHandoverCompose(category, draft, isEditing) {
  var states = ['인계 대기','인계 확인','처리 완료'];
  return [
    '<section class="memo-reference-compose-app memo-app-root">',
      '<header class="memo-reference-head"><button type="button" class="memo-reference-back" data-memo-action="cancel-reference-create">‹</button><div><h2>', isEditing ? '인계 수정' : '인계 추가', '</h2><p>', escapeMemo(category.kicker), '</p></div><span></span></header>',
      '<form class="memo-reference-form memo-stock-form" data-memo-reference-form data-reference-kind="handover">',
        '<label><span>인계 제목</span><input name="title" value="', escapeMemo(draft.title || ''), '" placeholder="예: 18:30부터 입장 데스크 교대"></label>',
        '<label><span>다음 담당</span><input name="handoverTo" value="', escapeMemo(draft.handoverTo || ''), '" placeholder="예: 이로 · 입장팀"></label>',
        '<fieldset class="memo-stock-status-field"><legend>인계 상태</legend><div>', states.map(function(st){var ck=(draft.handoverStatus||'인계 대기')===st?' checked':'';return '<label><input type="radio" name="handoverStatus" value="'+st+'"'+ck+'><span>'+st+'</span></label>';}).join(''), '</div></fieldset>',
        '<label><span>전달 내용</span><textarea name="body" rows="6" placeholder="교대 전 전달해야 할 일과 현재 상황을 적어주세요.">', escapeMemo(draft.body || ''), '</textarea></label>',
        '<div class="memo-reference-form-actions"><button type="button" data-memo-action="cancel-reference-create">취소</button><button type="submit" class="is-submit">', isEditing ? '수정 저장' : '등록하기', '</button></div>',
      '</form>',
    '</section>'
  ].join('');
}
function renderMemoLocationCompose(category, draft, isEditing) {
  return [
    '<section class="memo-reference-compose-app memo-app-root">',
      '<header class="memo-reference-head"><button type="button" class="memo-reference-back" data-memo-action="cancel-reference-create">‹</button><div><h2>', isEditing ? '위치 수정' : '위치 추가', '</h2><p>', escapeMemo(category.kicker), '</p></div><span></span></header>',
      '<form class="memo-reference-form memo-stock-form" data-memo-reference-form data-reference-kind="location">',
        '<label><span>항목명</span><input name="title" value="', escapeMemo(draft.title || ''), '" placeholder="예: 특전권 여분"></label>',
        '<label><span>위치</span><input name="location" value="', escapeMemo(draft.location || ''), '" placeholder="예: 입장 데스크 오른쪽 서랍"></label>',
        '<label><span>관리 담당</span><input name="manager" value="', escapeMemo(draft.manager || ''), '" placeholder="예: 부총괄"></label>',
        '<label><span>추가 메모</span><textarea name="body" rows="6" placeholder="보관 방법이나 이동 시 주의사항을 적어주세요.">', escapeMemo(draft.body || ''), '</textarea></label>',
        '<div class="memo-reference-form-actions"><button type="button" data-memo-action="cancel-reference-create">취소</button><button type="submit" class="is-submit">', isEditing ? '수정 저장' : '등록하기', '</button></div>',
      '</form>',
    '</section>'
  ].join('');
}
function renderMemoReferenceCompose() {
  var category=memoReferenceCategory(), draft=MemoTalkState.referenceDraft||{}, isEditing=!!MemoTalkState.referenceEditingId;
  if(category.type==='stock') return renderMemoStockCompose(category,draft,isEditing);
  if(category.type==='handover') return renderMemoHandoverCompose(category,draft,isEditing);
  if(category.type==='location') return renderMemoLocationCompose(category,draft,isEditing);
  return renderMemoReferenceComposeNotice(category,draft,isEditing);
}
function renderMemoReferenceComposeNotice(category,draft,isEditing){
  return [
    '<section class="memo-reference-compose-app memo-app-root"><header class="memo-reference-head"><button type="button" class="memo-reference-back" data-memo-action="cancel-reference-create">‹</button><div><h2>', isEditing?'공지 수정':'공지 추가','</h2><p>',escapeMemo(category.kicker),'</p></div><span></span></header>',
    '<form class="memo-reference-form" data-memo-reference-form><label><span>제목</span><input name="title" value="',escapeMemo(draft.title||''),'" placeholder="예: 입장 시작 시간 변경"></label><label><span>한 줄 요약</span><input name="summary" value="',escapeMemo(draft.summary||''),'" placeholder="목록에 먼저 보일 짧은 내용을 적어주세요."></label><label><span>내용</span><textarea name="body" rows="7" placeholder="공지 내용을 줄바꿈으로 나누어 적어주세요.">',escapeMemo(draft.body||''),'</textarea></label><fieldset class="memo-reference-target-field"><legend>적용 대상</legend><div class="memo-reference-target-picker">',MEMO_REFERENCE_TARGETS.map(function(t){var c=memoReferenceDraftTargets(draft).indexOf(t)>-1?' checked':'';return '<label><input type="checkbox" name="target" value="'+escapeMemo(t)+'"'+c+'><span>'+escapeMemo(t)+'</span></label>';}).join(''),'</div></fieldset><label><span>확인 포인트</span><textarea name="checks" rows="4" placeholder="한 줄에 하나씩 적어주세요.">',escapeMemo(draft.checks||''),'</textarea></label><div class="memo-reference-form-actions"><button type="button" data-memo-action="cancel-reference-create">취소</button><button type="submit" class="is-submit">',isEditing?'수정 저장':'등록하기','</button></div></form></section>'
  ].join('');
}
function renderMemoReferenceDetail(){
  var category=memoReferenceCategory(), item=memoReferenceItem(); if(!item) return '';
  if(category.type==='stock') return renderMemoStockDetail(category,item);
  var canManage=canManageReferenceItem(item); var tools=canManage?'<span class="memo-reference-detail-tools"><button type="button" data-memo-action="edit-reference-item">수정</button><button type="button" data-memo-action="delete-reference-item">삭제</button></span>':'<span></span>';
  var isHandover=category.type==='handover', isLocation=category.type==='location'; var confirmed=!!MemoTalkState.referenceConfirmed[item.id];
  var special='';
  if(isHandover) special='<section class="memo-reference-detail-section memo-stock-detail-section"><h4>인계 현황</h4><dl><div><dt>다음 담당</dt><dd>'+escapeMemo(item.handoverTo||'-')+'</dd></div><div><dt>상태</dt><dd>'+escapeMemo(item.status||'인계 대기')+'</dd></div></dl></section>';
  if(isLocation) special='<section class="memo-reference-detail-section memo-stock-detail-section"><h4>정확한 위치</h4><p class="memo-stock-location">'+escapeMemo(item.location||'-')+'</p></section><section class="memo-reference-detail-section memo-stock-detail-section"><h4>관리 담당</h4><p class="memo-stock-location">'+escapeMemo(item.manager||'-')+'</p></section>';
  var bodyTitle=isHandover?'전달 내용':isLocation?'위치 안내':'공지 내용';
  return '<section class="memo-reference-detail-app memo-app-root"><header class="memo-reference-head"><button type="button" class="memo-reference-back" data-memo-action="back-reference-list">‹</button><div><h2>'+escapeMemo(category.detailTitle||'상세')+'</h2><p>'+escapeMemo(category.kicker)+'</p></div>'+tools+'</header><section class="memo-reference-detail-hero"><span class="memo-reference-category">'+escapeMemo(category.title)+'</span><h3>'+escapeMemo(item.title)+'</h3><p class="memo-reference-meta">작성: '+escapeMemo(item.author)+' <i></i> 등록 '+escapeMemo(item.time)+' <i></i> 최종 수정 '+escapeMemo(item.updated)+'</p><p>'+escapeMemo(item.summary||'')+'</p></section>'+special+'<section class="memo-reference-detail-section"><h4>'+bodyTitle+'</h4><ul>'+(item.body||[]).map(function(l){return '<li>'+escapeMemo(l)+'</li>';}).join('')+'</ul></section><div class="memo-reference-detail-actions '+(isLocation?'is-single':'')+'"><button type="button" data-memo-action="back-reference-list">목록으로</button>'+(isLocation?'':'<button type="button" class="is-confirmed" data-memo-action="confirm-reference-item">'+(confirmed?(isHandover?'인계 확인함':'확인함'):(isHandover?'인계 확인':'확인 완료'))+'</button>')+'</div></section>';
}

function memoHeartPill(item, index) {
  var active = item.hearted ? ' is-active' : '';
  var pressed = item.hearted ? 'true' : 'false';
  return '<button type="button" class="memo-heart-pill' + active + '" data-memo-action="heart" data-memo-message-index="' + index + '" aria-pressed="' + pressed + '" aria-label="하트 반응 ' + item.reactions + '"><span aria-hidden="true">♥</span><b>' + item.reactions + '</b></button>';
}

function memoCardConfirmStatus(item) {
  if (!item) return '미확인';
  if (item.confirmedByMe) {
    var count = Number(item.confirmCount || 1);
    var total = Number(item.confirmTotal || 5);
    return count > 1 ? '확인 ' + count + '/' + total : '확인함';
  }
  return item.status || '미확인';
}

function memoConfirmHeartPill(item, index) {
  var active = item.confirmedByMe ? ' is-active' : '';
  var pressed = item.confirmedByMe ? 'true' : 'false';
  var count = Number(item.confirmCount || 0);
  return '<button type="button" class="memo-heart-pill memo-confirm-heart' + active + '" data-memo-action="confirm-card" data-memo-message-index="' + index + '" aria-pressed="' + pressed + '" aria-label="메모 확인 ' + count + '명"><span aria-hidden="true">♥</span><b>' + count + '</b></button>';
}

function memoHeartResult(item) {
  if (!item || !item.reactions) return '';
  return '<span class="memo-heart-pill" aria-label="하트 반응 ' + item.reactions + '"><span aria-hidden="true">♥</span><b>' + item.reactions + '</b></span>';
}

function memoSentTime(date) {
  var hours = date.getHours();
  var minutes = String(date.getMinutes()).padStart(2, '0');
  var period = hours < 12 ? '오전' : '오후';
  var hour12 = hours % 12 || 12;
  return period + ' ' + hour12 + ':' + minutes;
}

function renderRoomMessage(item, index) {
  if (item.kind === 'chat') {
    if (item.self) {
      var selfBody = item.deleted ? '삭제된 메시지입니다' : escapeMemo(item.text).replace(/\n/g, '<br>');
      var edited = item.edited ? '<em class="memo-edited-label">수정됨</em>' : '';
      return [
        '<article class="memo-chat-message is-self' + (item.deleted ? ' is-deleted' : '') + '" data-memo-self-message-index="', index, '">',
          '<div class="memo-chat-content">',
            '<div class="memo-chat-line">',
              '<footer><time>', item.time, '</time>', memoHeartResult(item), '</footer>',
              '<p>', selfBody, edited, '</p>',
            '</div>',
          '</div>',
        '</article>'
      ].join('');
    }
    return [
      '<article class="memo-chat-message">',
        '<span class="memo-chat-avatar memo-image-slot" data-memo-image="avatar" aria-hidden="true"></span>',
        '<div class="memo-chat-content">',
          '<b>', escapeMemo(item.name), '</b>',
          '<div class="memo-chat-line">',
            '<p>', escapeMemo(item.text).replace(/\n/g, '<br>'), '</p>',
            '<footer><time>', item.time, '</time>', memoHeartPill(item, index), '</footer>',
          '</div>',
        '</div>',
      '</article>'
    ].join('');
  }
  var cardStatus = memoCardConfirmStatus(item);
  return [
    '<article class="memo-work-card is-', item.tone, item.important ? ' is-important' : '', '">',
      '<header><span class="memo-work-tags"><span class="memo-work-type">', escapeMemo(item.type), '</span>', item.important ? '<span class="memo-work-important">중요</span>' : '', '</span></header>',
      '<strong>', escapeMemo(item.title), '</strong>',
      '<p>', escapeMemo(item.body).replace(/\n/g, '<br>'), '</p>',
      item.completionNote ? '<p class="memo-work-completion"><b>처리 기록</b> ' + escapeMemo(item.completionNote) + (item.completedAt ? '<em>완료 ' + escapeMemo(item.completedAt) + '</em>' : '') + '</p>' : '',
      '<footer><button type="button" class="memo-work-status is-', statusClass(item.status), '" data-memo-action="open-status" data-memo-message-index="', index, '">상태 <i>:</i> <b>', escapeMemo(item.status || '미처리'), '</b></button><span class="memo-work-meta"><time>', item.time, '</time>', memoConfirmHeartPill(item, index), '</span></footer>',
    '</article>'
  ].join('');
}

function statusClass(status) {
  if (status === '처리 완료') return 'complete';
  if (status === '처리 중') return 'progress';
  if (status === '확인함') return 'confirmed';
  return 'unread';
}

function escapeMemo(value) {
  return String(value || '').replace(/[&<>'"]/g, function (char) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char];
  });
}

function copyMemoText(text) {
  var value = String(text || '');
  if (!value) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(value).catch(function () { fallbackCopyMemoText(value); });
    return;
  }
  fallbackCopyMemoText(value);
}

function fallbackCopyMemoText(value) {
  var area = document.createElement('textarea');
  area.value = value;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  try { document.execCommand('copy'); } catch (error) {}
  document.body.removeChild(area);
}

function memoComposeTone(type) {
  var tones = {
    '일반': 'general',
    '공지': 'notice',
    '긴급': 'urgent',
    '입장 확인': 'gate',
    '특전회': 'benefit',
    '주의': 'caution',
    '분실물': 'lost',
    '완료 보고': 'complete'
  };
  return tones[type] || 'general';
}

function memoComposeTitle(type, title, body) {
  var clean = String(title || '').trim();
  if (clean) return clean;
  var firstLine = String(body || '').trim().split(/\n/)[0];
  return firstLine || type;
}

function refreshMemoArchiveResults(root) {
  var list = root.querySelector('.memo-archive-list');
  if (!list) return;
  var items = memoArchiveItems().filter(memoArchiveMatches);
  list.innerHTML = items.length ? items.map(memoArchiveCard).join('') : '<p class="memo-archive-empty">검색 결과가 없어요.</p>';
}

window.LumiApps.mountMemo = function (root) {
  if (!root || root.dataset.memoMounted === 'true') return;
  root.dataset.memoMounted = 'true';

  var toastTimer = null;
  function showMemoToast(message, options) {
    MemoTalkState.toastMessage = message;
    syncView(options);
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      MemoTalkState.toastMessage = '';
      syncView();
    }, 1800);
  }

  function syncView(options) {
    var previousStream = root.querySelector('[data-memo-stream]');
    var previousStreamTop = previousStream ? previousStream.scrollTop : 0;
    var appWindow = root.closest('.app-window');
    if (appWindow) {
      appWindow.classList.toggle('is-memo-room', MemoTalkState.view === 'room');
      appWindow.classList.toggle('is-memo-compose', MemoTalkState.view === 'compose');
      appWindow.classList.toggle('is-memo-history', MemoTalkState.view === 'history' || MemoTalkState.view === 'history-detail' || MemoTalkState.view === 'history-chatlog');
      appWindow.classList.toggle('is-memo-task', MemoTalkState.view === 'task-list');
      appWindow.classList.toggle('is-memo-reference', MemoTalkState.view === 'reference-list' || MemoTalkState.view === 'reference-detail' || MemoTalkState.view === 'reference-compose');
    }
    root.innerHTML = renderMemoView();
    if (MemoTalkState.view !== 'room') root.scrollTop = 0;

    if (MemoTalkState.view === 'room') {
      var nextStream = root.querySelector('[data-memo-stream]');
      if (nextStream) {
        window.requestAnimationFrame(function () {
          nextStream.scrollTop = options && options.streamToBottom ? nextStream.scrollHeight : previousStreamTop;
        });
      }
    }

    if (MemoTalkState.searchOpen) {
      window.requestAnimationFrame(function () {
        var searchInput = root.querySelector('[data-memo-room-search-input]');
        if (searchInput) {
          searchInput.focus();
          searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
        }
      });
    }

    if (MemoTalkState.editingMessageIndex !== null) {
      window.requestAnimationFrame(function () {
        var editInput = root.querySelector('[data-memo-input]');
        if (editInput) {
          editInput.focus();
          editInput.setSelectionRange(editInput.value.length, editInput.value.length);
        }
      });
    }
  }

  root.addEventListener('input', function (event) {
    if (event.target.matches('[data-memo-complete-note]')) {
      MemoTalkState.completionDraft = event.target.value;
      return;
    }
    if (!event.target.matches('[data-memo-room-search-input]')) return;
    MemoTalkState.searchQuery = event.target.value;
    if (event.isComposing) return;
    refreshMemoSearchResults(root);
  });

  root.addEventListener('compositionend', function (event) {
    if (!event.target.matches('[data-memo-room-search-input]')) return;
    MemoTalkState.searchQuery = event.target.value;
    refreshMemoSearchResults(root);
  });

  root.addEventListener('input', function (event) {
    if (!event.target.matches('[data-memo-archive-search]')) return;
    MemoTalkState.archiveQuery = event.target.value;
    if (event.isComposing) return;
    refreshMemoArchiveResults(root);
  });

  root.addEventListener('compositionend', function (event) {
    if (!event.target.matches('[data-memo-archive-search]')) return;
    MemoTalkState.archiveQuery = event.target.value;
    refreshMemoArchiveResults(root);
  });

  root.addEventListener('search', function (event) {
    if (!event.target.matches('[data-memo-archive-search]')) return;
    MemoTalkState.archiveQuery = event.target.value;
    refreshMemoArchiveResults(root);
  });

  root.addEventListener('keydown', function (event) {
    if (!event.target.matches('[data-memo-archive-search]') || event.key !== 'Enter') return;
    event.preventDefault();
    MemoTalkState.archiveQuery = event.target.value;
    refreshMemoArchiveResults(root);
  });

  root.addEventListener('click', function (event) {
    if (event.target.matches('[data-memo-layer="actions"]')) {
      MemoTalkState.actionMessageIndex = null;
      syncView();
      return;
    }
    var action = event.target.closest('[data-memo-action]');
    if (!action) return;
    var kind = action.getAttribute('data-memo-action');
    var index = Number(action.getAttribute('data-memo-message-index'));
    if (kind === 'confirm-card') {
      var confirmMessage = MemoTalkState.messages[index];
      if (!confirmMessage) return;
      confirmMessage.confirmedByMe = !confirmMessage.confirmedByMe;
      confirmMessage.confirmTotal = Number(confirmMessage.confirmTotal || 5);
      confirmMessage.confirmCount = Math.max(0, Number(confirmMessage.confirmCount || 0) + (confirmMessage.confirmedByMe ? 1 : -1));
      syncView();
      return;
    }
    if (kind === 'open-status') {
      var statusMessage = MemoTalkState.messages[index];
      if (!statusMessage || statusMessage.kind !== 'card') return;
      MemoTalkState.statusMessageIndex = index;
      MemoTalkState.completionDraft = null;
      syncView();
      return;
    }
    if (kind === 'cancel-status') {
      MemoTalkState.statusMessageIndex = null;
      MemoTalkState.completionDraft = '';
      syncView();
      return;
    }
    if (kind === 'set-status') {
      var statusTarget = MemoTalkState.messages[index];
      var nextStatus = action.getAttribute('data-memo-status');
      if (!statusTarget || !nextStatus) return;
      if (nextStatus === '처리 완료') {
        MemoTalkState.completionDraft = '';
        syncView();
        return;
      }
      statusTarget.status = nextStatus;
      MemoTalkState.statusMessageIndex = null;
      MemoTalkState.completionDraft = '';
      showMemoToast('상태를 ' + nextStatus + '로 변경했어요.');
      return;
    }
    if (kind === 'save-complete') {
      var completeTarget = MemoTalkState.messages[index];
      if (!completeTarget) return;
      completeTarget.status = '처리 완료';
      completeTarget.completionNote = String(MemoTalkState.completionDraft || '').trim() || '처리 완료';
      completeTarget.completedAt = memoSentTime(new Date());
      MemoTalkState.statusMessageIndex = null;
      MemoTalkState.completionDraft = '';
      showMemoToast('처리 완료로 기록했어요.');
      return;
    }
    if (kind === 'heart') {
      var message = MemoTalkState.messages[index];
      if (!message) return;
      message.hearted = !message.hearted;
      message.reactions += message.hearted ? 1 : -1;
      syncView();
      return;
    }
    if (kind === 'toggle-menu') {
      MemoTalkState.typeSheetOpen = !MemoTalkState.typeSheetOpen;
      syncView();
      return;
    }
    if (kind === 'close-types') {
      MemoTalkState.typeSheetOpen = false;
      syncView();
      return;
    }
    if (kind === 'notice') {
      MemoTalkState.referenceCategory = 'notice';
      MemoTalkState.referenceItemId = 'notice-1';
      MemoTalkState.view = 'reference-detail';
      syncView();
      return;
    }
    if (kind === 'open-search') {
      MemoTalkState.searchOpen = true;
      syncView();
      return;
    }
    if (kind === 'close-search') {
      MemoTalkState.searchOpen = false;
      MemoTalkState.searchQuery = '';
      syncView();
      return;
    }

if (kind === 'open-task-filter') {
  MemoTalkState.taskFilter = action.getAttribute('data-memo-filter') || 'urgent';
  MemoTalkState.view = 'task-list';
  syncView();
  return;
}
if (kind === 'back-task-home') { MemoTalkState.view = 'home'; syncView(); return; }
if (kind === 'open-home-history-event') {
  MemoTalkState.selectedArchiveKey = action.getAttribute('data-memo-archive-key') || 'a';
  MemoTalkState.archiveReturnView = 'home';
  MemoTalkState.archiveDetailFilter = '전체';
  MemoTalkState.view = 'history-detail';
  syncView();
  return;
}
if (kind === 'all-history') {
  MemoTalkState.archiveReturnView='history';
  MemoTalkState.view='history';
  MemoTalkState.archiveQuery='';
  MemoTalkState.archiveFilter='전체';
  syncView();
  return;
}
if (kind === 'close-history') { MemoTalkState.view='home'; syncView(); return; }
if (kind === 'archive-filter') { MemoTalkState.archiveFilter=action.getAttribute('data-memo-filter')||'전체'; syncView(); return; }
if (kind === 'open-archive-event') {
  MemoTalkState.selectedArchiveKey = action.getAttribute('data-memo-archive-key') || 'a';
  MemoTalkState.archiveReturnView = 'history';
  MemoTalkState.archiveDetailFilter = '전체';
  MemoTalkState.view = 'history-detail';
  syncView();
  return;
}
if (kind === 'back-archive-list') { MemoTalkState.view = MemoTalkState.archiveReturnView === 'home' ? 'home' : 'history'; syncView(); return; }
if (kind === 'archive-detail-filter') {
  MemoTalkState.archiveDetailFilter = action.getAttribute('data-memo-detail-filter') || '전체';
  syncView();
  return;
}
if (kind === 'open-archive-chatlog') { MemoTalkState.view = 'history-chatlog'; syncView(); return; }
if (kind === 'back-archive-detail') { MemoTalkState.view = 'history-detail'; syncView(); return; }
    if (kind === 'open-reference') {
      MemoTalkState.referenceCategory = action.getAttribute('data-memo-reference') || 'notice';
      MemoTalkState.referenceItemId = 'notice-1';
      MemoTalkState.view = 'reference-list';
      syncView();
      return;
    }
    if (kind === 'close-reference') { MemoTalkState.view = 'home'; syncView(); return; }
    if (kind === 'back-reference-list') { MemoTalkState.view = 'reference-list'; syncView(); return; }
    if (kind === 'toggle-reference-sort') {
      MemoTalkState.referenceSort = MemoTalkState.referenceSort === 'latest' ? 'oldest' : 'latest';
      syncView();
      return;
    }
    if (kind === 'open-reference-create') {
      MemoTalkState.referenceEditingId = null;
      MemoTalkState.referenceDraft = { title: '', summary: '', body: '', targets: [], checks: '', qty: '', stockStatus: '여유', location: '', handoverTo: '', handoverStatus: '인계 대기', manager: '' };
      MemoTalkState.view = 'reference-compose';
      syncView();
      return;
    }
    if (kind === 'edit-reference-item') {
      var editableItem = memoReferenceItem();
      if (!editableItem || !canManageReferenceItem(editableItem)) return;
      MemoTalkState.referenceEditingId = editableItem.id;
      MemoTalkState.referenceDraft = {
        title: editableItem.title || '',
        summary: editableItem.summary || '',
        body: (editableItem.body || []).join('\n'),
        targets: (editableItem.targets || []).slice(),
        checks: (editableItem.checks || []).join('\n'),
        qty: editableItem.qty || '',
        stockStatus: editableItem.status || '여유',
        location: editableItem.location || '',
        handoverTo: editableItem.handoverTo || '',
        handoverStatus: editableItem.status || '인계 대기',
        manager: editableItem.manager || ''
      };
      MemoTalkState.view = 'reference-compose';
      syncView();
      return;
    }
    if (kind === 'delete-reference-item') {
      var deletionCategory = memoReferenceCategory();
      var deletionId = MemoTalkState.referenceItemId;
      var deletionItem = memoReferenceItem();
      if (!deletionItem || !canManageReferenceItem(deletionItem)) return;
      if (!window.confirm('“' + deletionItem.title + '” 항목을 삭제할까요?')) return;
      deletionCategory.items = (deletionCategory.items || []).filter(function (item) { return item.id !== deletionId; });
      delete MemoTalkState.referenceConfirmed[deletionId];
      MemoTalkState.referenceItemId = (deletionCategory.items[0] && deletionCategory.items[0].id) || null;
      MemoTalkState.referenceEditingId = null;
      MemoTalkState.referenceDraft = { title: '', summary: '', body: '', targets: [], checks: '', qty: '', stockStatus: '여유', location: '', handoverTo: '', handoverStatus: '인계 대기', manager: '' };
      MemoTalkState.view = 'reference-list';
      showMemoToast((deletionCategory.title || '운영 참고') + ' 항목을 삭제했어요.');
      return;
    }
    if (kind === 'cancel-reference-create') {
      MemoTalkState.referenceEditingId = null;
      MemoTalkState.referenceDraft = { title: '', summary: '', body: '', targets: [], checks: '', qty: '', stockStatus: '여유', location: '', handoverTo: '', handoverStatus: '인계 대기', manager: '' };
      MemoTalkState.view = 'reference-list';
      syncView();
      return;
    }
    if (kind === 'open-reference-item') {
      MemoTalkState.referenceItemId = action.getAttribute('data-memo-reference-item') || 'notice-1';
      MemoTalkState.view = 'reference-detail';
      syncView();
      return;
    }
    if (kind === 'confirm-reference-item') {
      var referenceItemId = MemoTalkState.referenceItemId;
      MemoTalkState.referenceConfirmed[referenceItemId] = !MemoTalkState.referenceConfirmed[referenceItemId];
      syncView();
      return;
    }
    if (kind === 'open-room') { MemoTalkState.view = 'room'; syncView(); return; }
    if (kind === 'back-home') { MemoTalkState.view = 'home'; MemoTalkState.searchOpen = false; MemoTalkState.searchQuery = ''; syncView(); return; }
    if (kind === 'open-type' || kind === 'create') {
      MemoTalkState.composeReturnView = kind === 'create' ? 'home' : 'room';
      MemoTalkState.view = 'compose';
      MemoTalkState.composeType = '일반';
      syncView();
      return;
    }
    if (kind === 'submit-compose') {
      var compose = root.querySelector('[data-memo-compose-form]');
      if (compose && compose.requestSubmit) compose.requestSubmit();
      return;
    }
    if (kind === 'close-compose') {
      MemoTalkState.view = MemoTalkState.composeReturnView || 'room';
      syncView();
      return;
    }
    if (kind === 'select-compose-type') {
      MemoTalkState.composeType = action.getAttribute('data-memo-type') || '일반';
      syncView();
      return;
    }
    if (kind === 'close-actions') { MemoTalkState.actionMessageIndex = null; syncView(); return; }
    if (kind === 'copy-message') {
      copyMemoText(MemoTalkState.messages[index] && MemoTalkState.messages[index].text);
      MemoTalkState.actionMessageIndex = null;
      showMemoToast('클립보드에 복사했어요.');
      return;
    }
    if (kind === 'notice-message') {
      MemoTalkState.pendingConfirm = { type: 'notice', index: index };
      MemoTalkState.actionMessageIndex = null;
      syncView();
      return;
    }
    if (kind === 'edit-message') {
      MemoTalkState.editingMessageIndex = index;
      MemoTalkState.actionMessageIndex = null;
      syncView();
      return;
    }
    if (kind === 'delete-message') {
      MemoTalkState.pendingConfirm = { type: 'delete', index: index };
      MemoTalkState.actionMessageIndex = null;
      syncView();
      return;
    }
    if (kind === 'cancel-confirm') { MemoTalkState.pendingConfirm = null; syncView(); return; }
    if (kind === 'confirm-notice') {
      var noticeMessage = MemoTalkState.messages[index];
      if (noticeMessage) MemoTalkState.notice = { text: noticeMessage.text, time: memoSentTime(new Date()) };
      MemoTalkState.pendingConfirm = null;
      syncView();
      return;
    }
    if (kind === 'confirm-delete') {
      var deleteMessage = MemoTalkState.messages[index];
      if (deleteMessage) { deleteMessage.deleted = true; deleteMessage.text = ''; deleteMessage.edited = false; deleteMessage.reactions = 0; }
      MemoTalkState.pendingConfirm = null;
      syncView();
      return;
    }
    if (kind === 'cancel-edit') {
      MemoTalkState.editingMessageIndex = null;
      MemoTalkState.actionMessageIndex = null;
      MemoTalkState.pendingConfirm = null;
      syncView();
      return;
    }
  });

  root.addEventListener('submit', function (event) {
    var searchForm = event.target.closest('[data-memo-room-search-form]');
    if (searchForm) {
      event.preventDefault();
      return;
    }
    var composeForm = event.target.closest('[data-memo-compose-form]');
    if (composeForm) {
      event.preventDefault();
      var composeTitle = composeForm.querySelector('#memo-compose-title');
      var composeBody = composeForm.querySelector('#memo-compose-body');
      var composeStatus = composeForm.querySelector('#memo-compose-status');
      var composeImportant = composeForm.querySelector('#memo-compose-important');
      var titleValue = composeTitle && composeTitle.value.trim();
      var bodyValue = composeBody && composeBody.value.trim();
      if (!titleValue && !bodyValue) {
        showMemoToast('제목 또는 내용을 입력해주세요.');
        if (composeTitle) composeTitle.focus();
        return;
      }
      var typeValue = MemoTalkState.composeType || '일반';
      MemoTalkState.messages.push({
        kind: 'card',
        type: typeValue,
        title: memoComposeTitle(typeValue, titleValue, bodyValue),
        body: bodyValue || titleValue,
        status: typeValue === '완료 보고' ? '처리 완료' : ((composeStatus && composeStatus.value) || '미확인'),
        time: memoSentTime(new Date()),
        reactions: 0,
        confirmCount: 0,
        confirmTotal: 5,
        confirmedByMe: false,
        tone: memoComposeTone(typeValue),
        important: !!(composeImportant && composeImportant.checked),
        self: true
      });
      MemoTalkState.view = MemoTalkState.composeReturnView || 'room';
      showMemoToast('메모를 등록했어요.', { streamToBottom: MemoTalkState.composeReturnView === 'room' });
      return;
    }
    var referenceForm = event.target.closest('[data-memo-reference-form]');
    if (referenceForm) {
      event.preventDefault();
      var referenceTitle = (referenceForm.elements.title && referenceForm.elements.title.value || '').trim();
      var referenceSummary = (referenceForm.elements.summary && referenceForm.elements.summary.value || '').trim();
      var referenceBody = (referenceForm.elements.body && referenceForm.elements.body.value || '').trim();
      var referenceTargets = Array.prototype.slice.call(referenceForm.querySelectorAll('input[name="target"]:checked')).map(function (input) { return input.value; });
      var referenceChecks = (referenceForm.elements.checks && referenceForm.elements.checks.value || '').trim();
      var referenceKind = referenceForm.getAttribute('data-reference-kind') || '';
      if (referenceKind === 'handover' || referenceKind === 'location') {
        var customLocation = (referenceForm.elements.location && referenceForm.elements.location.value || '').trim();
        var handoverTo = (referenceForm.elements.handoverTo && referenceForm.elements.handoverTo.value || '').trim();
        var handoverStateInput = referenceForm.querySelector('input[name="handoverStatus"]:checked');
        var handoverStatus = handoverStateInput ? handoverStateInput.value : '인계 대기';
        var manager = (referenceForm.elements.manager && referenceForm.elements.manager.value || '').trim();
        if (!referenceTitle || (referenceKind === 'handover' && !handoverTo) || (referenceKind === 'location' && !customLocation)) {
          showMemoToast(referenceKind === 'handover' ? '인계 제목과 다음 담당을 입력해주세요.' : '항목명과 위치를 입력해주세요.');
          return;
        }
        var customNow = memoSentTime(new Date());
        var customCategory = memoReferenceCategory();
        var customPayload = { title: referenceTitle, summary: referenceBody.split(/\n+/)[0] || (referenceKind === 'handover' ? handoverTo : customLocation), body: referenceBody ? referenceBody.split(/\n+/).map(function(line){return line.trim();}).filter(Boolean) : [], location: customLocation, handoverTo: handoverTo, status: handoverStatus, manager: manager };
        var customEditId = MemoTalkState.referenceEditingId;
        var customEdit = customEditId && customCategory.items.filter(function(item){return item.id === customEditId;})[0];
        if (customEdit) { Object.keys(customPayload).forEach(function(key){customEdit[key]=customPayload[key];}); customEdit.updated=customNow; MemoTalkState.referenceItemId=customEdit.id; }
        else { var customItem = Object.assign({ id: MemoTalkState.referenceCategory + '-' + Date.now(), author:(MemoTalkState.currentStaff && MemoTalkState.currentStaff.name)||'총괄', time:customNow, updated:customNow }, customPayload); customCategory.items.push(customItem); MemoTalkState.referenceItemId=customItem.id; }
        MemoTalkState.referenceEditingId=null;
        MemoTalkState.referenceDraft={ title:'', summary:'', body:'', targets:[], checks:'', qty:'', stockStatus:'여유', location:'', handoverTo:'', handoverStatus:'인계 대기', manager:'' };
        MemoTalkState.referenceSort='latest'; MemoTalkState.view='reference-list'; showMemoToast(referenceKind === 'handover' ? (customEdit ? '인계사항을 수정했어요.' : '인계사항을 등록했어요.') : (customEdit ? '위치 안내를 수정했어요.' : '위치 안내를 등록했어요.')); return;
      }
      if (referenceKind === 'stock') {
        var stockQty = (referenceForm.elements.qty && referenceForm.elements.qty.value || '').trim();
        var stockStatusInput = referenceForm.querySelector('input[name="stockStatus"]:checked');
        var stockStatus = stockStatusInput ? stockStatusInput.value : '여유';
        var stockLocation = (referenceForm.elements.location && referenceForm.elements.location.value || '').trim();
        if (!referenceTitle || !stockQty) {
          showMemoToast('품목명과 현재 수량을 입력해주세요.');
          var stockFocus = !referenceTitle ? referenceForm.elements.title : referenceForm.elements.qty;
          if (stockFocus) stockFocus.focus();
          return;
        }
        var stockNow = memoSentTime(new Date());
        var stockCategory = memoReferenceCategory();
        var stockPayload = {
          title: referenceTitle,
          qty: stockQty,
          status: stockStatus,
          location: stockLocation,
          summary: '현재 ' + stockQty + ' · ' + stockStatus + (stockLocation ? ' · ' + stockLocation : ''),
          body: referenceBody ? referenceBody.split(/\n+/).map(function (line) { return line.trim(); }).filter(Boolean) : []
        };
        var stockEditingId = MemoTalkState.referenceEditingId;
        var stockEditingItem = stockEditingId && (stockCategory.items || []).filter(function (item) { return item.id === stockEditingId; })[0];
        if (stockEditingItem) {
          stockEditingItem.title = stockPayload.title;
          stockEditingItem.qty = stockPayload.qty;
          stockEditingItem.status = stockPayload.status;
          stockEditingItem.location = stockPayload.location;
          stockEditingItem.summary = stockPayload.summary;
          stockEditingItem.body = stockPayload.body;
          stockEditingItem.updated = stockNow;
          MemoTalkState.referenceItemId = stockEditingItem.id;
        } else {
          var stockItem = {
            id: MemoTalkState.referenceCategory + '-' + Date.now(),
            title: stockPayload.title,
            qty: stockPayload.qty,
            status: stockPayload.status,
            location: stockPayload.location,
            summary: stockPayload.summary,
            author: (MemoTalkState.currentStaff && MemoTalkState.currentStaff.name) || '총괄',
            time: stockNow,
            updated: stockNow,
            body: stockPayload.body
          };
          stockCategory.items.push(stockItem);
          MemoTalkState.referenceItemId = stockItem.id;
        }
        MemoTalkState.referenceEditingId = null;
        MemoTalkState.referenceDraft = { title: '', summary: '', body: '', targets: [], checks: '', qty: '', stockStatus: '여유', location: '', handoverTo: '', handoverStatus: '인계 대기', manager: '' };
        MemoTalkState.referenceSort = 'latest';
        MemoTalkState.view = 'reference-list';
        showMemoToast(stockEditingItem ? '현황을 수정했어요.' : '현황을 등록했어요.');
        return;
      }
      if (!referenceTitle || !referenceBody) {
        showMemoToast('제목과 내용을 입력해주세요.');
        var focusField = !referenceTitle ? referenceForm.elements.title : referenceForm.elements.body;
        if (focusField) focusField.focus();
        return;
      }
      var now = memoSentTime(new Date());
      var referenceCategory = memoReferenceCategory();
      var referencePayload = {
        title: referenceTitle,
        summary: referenceSummary || referenceBody.split(/\n+/)[0],
        body: referenceBody.split(/\n+/).map(function (line) { return line.trim(); }).filter(Boolean),
        targets: referenceTargets.length ? referenceTargets : ['전체 스탭'],
        checks: referenceChecks ? referenceChecks.split(/\n+/).map(function (line) { return line.trim(); }).filter(Boolean) : ['내용 확인']
      };
      var editingId = MemoTalkState.referenceEditingId;
      var editingItem = editingId && (referenceCategory.items || []).filter(function (item) { return item.id === editingId; })[0];
      if (editingItem) {
        editingItem.title = referencePayload.title;
        editingItem.summary = referencePayload.summary;
        editingItem.body = referencePayload.body;
        editingItem.targets = referencePayload.targets;
        editingItem.checks = referencePayload.checks;
        editingItem.updated = now;
        MemoTalkState.referenceItemId = editingItem.id;
      } else {
        var referenceItem = {
          id: MemoTalkState.referenceCategory + '-' + Date.now(),
          title: referencePayload.title,
          summary: referencePayload.summary,
          author: (MemoTalkState.currentStaff && MemoTalkState.currentStaff.name) || '총괄',
          time: now,
          updated: now,
          body: referencePayload.body,
          targets: referencePayload.targets,
          checks: referencePayload.checks
        };
        referenceCategory.items.push(referenceItem);
        MemoTalkState.referenceItemId = referenceItem.id;
      }
      MemoTalkState.referenceEditingId = null;
      MemoTalkState.referenceDraft = { title: '', summary: '', body: '', targets: [], checks: '', qty: '', stockStatus: '여유', location: '', handoverTo: '', handoverStatus: '인계 대기', manager: '' };
      MemoTalkState.referenceSort = 'latest';
      MemoTalkState.view = 'reference-list';
      showMemoToast(editingItem ? '공지를 수정했어요.' : ((referenceCategory.title || '운영 참고') + '를 등록했어요.'));
      return;
    }
    var form = event.target.closest('[data-memo-composer]');
    if (!form) return;
    event.preventDefault();
    var input = form.querySelector('[data-memo-input]');
    var text = input && input.value.trim();
    if (!text) return;

    if (MemoTalkState.editingMessageIndex !== null) {
      var messageToEdit = MemoTalkState.messages[MemoTalkState.editingMessageIndex];
      if (!messageToEdit || messageToEdit.deleted) return;
      if (text !== String(messageToEdit.text || '').trim()) {
        messageToEdit.text = text;
        messageToEdit.edited = true;
      }
      MemoTalkState.editingMessageIndex = null;
      syncView();
      return;
    }

    MemoTalkState.messages.push({ kind: 'chat', self: true, text: text, time: memoSentTime(new Date()), reactions: 0 });
    input.value = '';
    syncView({ streamToBottom: true });
    var nextInput = root.querySelector('[data-memo-input]');
    if (nextInput) nextInput.focus();
  });


  var longPressTimer = null;
  var longPressTarget = null;

  function clearMemoLongPress() {
    if (longPressTimer) window.clearTimeout(longPressTimer);
    longPressTimer = null;
    longPressTarget = null;
  }

  function openSelfMessageActions(target) {
    var rawIndex = target && target.getAttribute('data-memo-self-message-index');
    var selfIndex = Number(rawIndex);
    var selfMessage = MemoTalkState.messages[selfIndex];
    if (!selfMessage || selfMessage.deleted) return;
    MemoTalkState.actionMessageIndex = selfIndex;
    syncView();
  }

  root.addEventListener('pointerdown', function (event) {
    var target = event.target.closest('[data-memo-self-message-index]');
    if (!target || event.pointerType === 'mouse') return;
    longPressTarget = target;
    longPressTimer = window.setTimeout(function () {
      if (longPressTarget) {
        if (navigator.vibrate) navigator.vibrate(12);
        openSelfMessageActions(longPressTarget);
      }
      clearMemoLongPress();
    }, 480);
  });

  root.addEventListener('pointerup', clearMemoLongPress);
  root.addEventListener('pointercancel', clearMemoLongPress);
  root.addEventListener('pointermove', clearMemoLongPress);

  root.addEventListener('contextmenu', function (event) {
    var target = event.target.closest('[data-memo-self-message-index]');
    if (!target) return;
    event.preventDefault();
    openSelfMessageActions(target);
  });

  var appWindow = root.closest('.app-window');
  if (appWindow) {
    appWindow.classList.toggle('is-memo-room', MemoTalkState.view === 'room');
    appWindow.classList.toggle('is-memo-compose', MemoTalkState.view === 'compose');
      appWindow.classList.toggle('is-memo-history', MemoTalkState.view === 'history' || MemoTalkState.view === 'history-detail' || MemoTalkState.view === 'history-chatlog');
      appWindow.classList.toggle('is-memo-task', MemoTalkState.view === 'task-list');
      appWindow.classList.toggle('is-memo-reference', MemoTalkState.view === 'reference-list' || MemoTalkState.view === 'reference-detail' || MemoTalkState.view === 'reference-compose');
  }
};
