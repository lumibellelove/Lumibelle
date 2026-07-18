(() => {
  const tracks = [
    {
      id: 'stardust-magical',
      title: 'Stardust Magical',
      artist: 'LUMIBELLE',
      duration: '00:12',
      audio: './assets/audio/stardust-sample.wav',
      type: 'ORIGINAL',
      members: ['MARIRING', 'LULU'],
      art: 'music-art--stardust',
      lyrics: ['어둠 속에서도 난 너를 찾아', '수많은 별들 사이 너만 보여', '두근거리는 이 마음을 모아', '반짝이는 우리 이야기를 시작해', '빛나는 오늘, 너와 함께', '우리만의 기적이 될 거야'],
    },
    {
      id: 'strawberry-love',
      title: 'Strawberry Love',
      artist: 'LUMIBELLE',
      duration: '00:12',
      audio: './assets/audio/strawberry-sample.wav',
      type: 'ORIGINAL',
      members: ['LULU', 'MARIRING'],
      art: 'music-art--stardust',
      lyrics: ['달콤한 바람이 불어오면', '네가 웃던 순간이 떠올라', '분홍빛 마음을 가득 담아', '오늘도 너에게 달려갈게'],
    },
    {
      id: 'sakura-time',
      title: '벚꽃타임',
      artist: 'LUMIBELLE',
      duration: '00:12',
      audio: './assets/audio/sakura-sample.wav',
      type: 'ORIGINAL',
      members: ['MARIRING', 'LULU'],
      art: 'music-art--stardust',
      lyrics: ['벚꽃이 흩날리는 이 길에서', '우리의 계절을 기억해', '짧았던 순간도 반짝이니까', '다시 만날 날을 기다릴게'],
    },
  ];

  const releases = [
    {
      id: 'stardust-magical',
      title: 'Stardust Magical',
      eyebrow: '1st SINGLE · ORIGINAL',
      subtitle: '루미벨의 첫 번째 별빛 기록',
      description: '별빛처럼 시작되는 루미벨의 첫 번째 음악 기록. 데뷔 싱글의 대표곡과 수록곡을 한곳에서 확인할 수 있어요.',
      type: 'ORIGINAL',
      members: ['MARIRING', 'LULU'],
      releaseDate: '2026-07-12',
      releaseLabel: '2026.07.12',
      status: 'NEW',
      art: 'music-art--stardust',
      unit: 'LUMIBELLE',
      credit: '작사 · 작곡 · 편곡 정보 연결 예정',
      trackIds: ['stardust-magical', 'strawberry-love', 'sakura-time'],
      links: [],
      featured: true,
    },
    {
      id: 'constellation-fantasy',
      title: '별자리 환상',
      eyebrow: '1.5 PROJECT · ORIGINAL',
      subtitle: '꿈과 현실의 경계에서 만나는 별자리',
      description: '루미벨의 다음 음악 프로젝트. 공개 일정과 상세 트랙 정보는 추후 안내될 예정이에요.',
      type: 'ORIGINAL',
      members: ['MARIRING', 'LULU', 'IRO', 'LUNAR'],
      releaseDate: '2027-01-01',
      releaseLabel: '공개 예정',
      status: 'COMING',
      art: 'music-art--constellation',
      unit: 'LUMIBELLE',
      credit: '추후 공개',
      trackIds: [],
      links: [],
    },
    {
      id: 'still',
      title: 'Still',
      eyebrow: '2nd SINGLE · ORIGINAL',
      subtitle: 'LULU 메인 싱글 프로젝트',
      description: '루루의 색을 중심으로 준비 중인 두 번째 싱글 프로젝트예요.',
      type: 'ORIGINAL',
      members: ['LULU'],
      releaseDate: '2027-04-01',
      releaseLabel: '공개 예정',
      status: 'COMING',
      art: 'music-art--still',
      unit: 'LULU · LUMIBELLE',
      credit: '추후 공개',
      trackIds: [],
      links: [],
    },
    {
      id: 'cover-archive',
      title: 'LUMIBELLE Cover Archive',
      eyebrow: 'COVER COLLECTION',
      subtitle: '무대에서 공개한 커버곡 모음',
      description: '루미벨이 무대와 콘텐츠에서 선보인 커버곡을 정리하는 아카이브예요.',
      type: 'COVER',
      members: ['MARIRING', 'LULU', 'IRO', 'LUNAR'],
      releaseDate: '2026-07-12',
      releaseLabel: '업데이트 예정',
      status: 'ARCHIVE',
      art: 'music-art--cover',
      unit: 'LUMIBELLE',
      credit: '원곡 정보와 공연 기록 연결 예정',
      trackIds: [],
      links: [],
    },
  ];

  const playlists = [
    {
      id: 'original-essentials',
      kind: 'official',
      type: 'ORIGINAL',
      title: '루미벨 오리지널 모음',
      subtitle: 'LUMIBELLE ORIGINALS',
      description: '루미벨의 공식 오리지널 음원을 한 번에 들을 수 있는 플레이리스트예요.',
      art: 'music-art--stardust',
      trackIds: ['stardust-magical', 'strawberry-love', 'sakura-time'],
      curator: 'LUMIBELLE OFFICIAL',
      category: 'ORIGINAL',
      updatedDate: '2026-07-12',
    },
    {
      id: 'live-setlist',
      kind: 'official',
      type: 'LIVE SETLIST',
      title: '루미벨 라이브 셋리스트',
      subtitle: 'LUMIBELLE LIVE SETLIST',
      description: '공연의 흐름과 설렘을 그대로 담은 공식 플레이리스트예요.',
      art: 'music-art--stardust',
      trackIds: ['stardust-magical', 'strawberry-love', 'sakura-time'],
      curator: 'LUMIBELLE OFFICIAL',
      category: 'LIVE',
      updatedDate: '2026-07-12',
    },
    {
      id: 'cover-selection',
      kind: 'official',
      type: 'COVER SELECTION',
      title: '루미벨 커버 셀렉션',
      subtitle: 'LUMIBELLE COVER SELECTION',
      description: '루미벨이 무대와 콘텐츠에서 선보인 커버 무드를 한 번에 모은 플레이리스트예요.',
      art: 'music-art--cover',
      trackIds: ['strawberry-love', 'sakura-time'],
      curator: 'LUMIBELLE OFFICIAL',
      category: 'COVER',
      updatedDate: '2026-07-11',
    },
    {
      id: 'shining-morning',
      kind: 'official',
      type: 'MOOD',
      title: '설레는 아침 러브송',
      subtitle: 'SHINING MORNING',
      description: '반짝이는 하루를 시작하고 싶은 아침에 듣는 플레이리스트예요.',
      art: 'music-art--constellation',
      trackIds: ['strawberry-love', 'stardust-magical', 'sakura-time'],
      curator: 'LUMIBELLE OFFICIAL',
      category: 'THEME',
      updatedDate: '2026-07-10',
    },
    {
      id: 'moonlight-night',
      kind: 'official',
      type: 'NIGHT',
      title: '달빛 아래 듣는 노래',
      subtitle: 'MOONLIGHT NIGHT',
      description: '하루의 끝, 조용한 밤과 잘 어울리는 곡을 모았어요.',
      art: 'music-art--still',
      trackIds: ['sakura-time', 'stardust-magical'],
      curator: 'LUMIBELLE OFFICIAL',
      category: 'THEME',
      updatedDate: '2026-07-08',
    },
    {
      id: 'practice-boost',
      kind: 'official',
      type: 'PRACTICE',
      title: '연습실 에너지 충전',
      subtitle: 'PRACTICE BOOST',
      description: '연습 시작 전 기분을 끌어올리는 루미벨의 에너지 플리예요.',
      art: 'music-art--cover',
      trackIds: ['stardust-magical', 'strawberry-love'],
      curator: 'LUMIBELLE OFFICIAL',
      category: 'THEME',
      updatedDate: '2026-07-05',
    },
    {
      id: 'mariring-pick',
      kind: 'member',
      art: 'music-art--stardust',
      member: 'MARIRING',
      type: 'MEMBER PICK',
      title: '마리링의 반짝이는 하루',
      subtitle: 'MARIRING’S MUSIC ROOM',
      description: '무대에 오르기 전 기분을 가장 반짝이게 만들어 주는 노래를 모았어요.',
      note: '“오늘도 빛나고 싶은 날 같이 들어요!”',
      color: '#ff59a5',
      soft: '#fff0f7',
      mark: 'M',
      trackIds: ['stardust-magical', 'strawberry-love'],
      category: 'MEMBER',
      updatedDate: '2026-07-11',
    },
    {
      id: 'lulu-pick',
      kind: 'member',
      art: 'music-art--still',
      member: 'LULU',
      type: 'MEMBER PICK',
      title: '루루의 포근포근 토끼굴',
      subtitle: 'LULU’S MUSIC ROOM',
      description: '하루가 조금 지쳤을 때 포근하게 감싸주는 곡을 모았어요.',
      note: '“루루랑 포근하게 쉬어가자!”',
      color: '#ef9fc0',
      soft: '#fff5f9',
      mark: 'L',
      trackIds: ['strawberry-love', 'sakura-time'],
      category: 'MEMBER',
      updatedDate: '2026-07-09',
    },
    {
      id: 'iro-pick',
      kind: 'member',
      art: 'music-art--cover',
      member: 'IRO',
      type: 'MEMBER PICK',
      title: '이로의 컬러 체인지',
      subtitle: 'IRO’S MUSIC ROOM',
      description: '기분과 하루의 색을 완전히 바꾸고 싶을 때 듣는 곡을 모았어요.',
      note: '“오늘은 어떤 색의 음악이 필요해?”',
      color: '#79b9e8',
      soft: '#eff8ff',
      mark: 'I',
      trackIds: ['stardust-magical', 'sakura-time'],
      category: 'MEMBER',
      updatedDate: '2026-07-07',
    },
    {
      id: 'lunar-pick',
      kind: 'member',
      art: 'music-art--constellation',
      member: 'LUNAR',
      type: 'MEMBER PICK',
      title: '루나의 달빛 아래',
      subtitle: 'LUNAR’S MUSIC ROOM',
      description: '밤과 달빛, 조용한 감정에 어울리는 곡을 모았어요.',
      note: '“오늘 밤은 이 노래가 너를 비춰줄게.”',
      color: '#a887df',
      soft: '#f6f1ff',
      mark: 'L',
      trackIds: ['sakura-time', 'stardust-magical'],
      category: 'MEMBER',
      updatedDate: '2026-07-06',
    },
  ];

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const viewButtons = $$('[data-music-view]');
  const typeButtons = $$('[data-music-type]');
  const memberButtons = $$('[data-music-member]');
  const releaseView = $('[data-music-release-view]');
  const playlistView = $('[data-music-playlist-view]');
  const searchInput = $('[data-music-search]');
  const sortControl = $('[data-music-sort-control]');
  const sortTrigger = $('[data-music-sort-trigger]');
  const sortMenu = $('[data-music-sort-menu]');
  const sortLabel = $('[data-music-sort-label]');
  const featuredRoot = $('[data-music-featured]');
  const releaseList = $('[data-music-release-list]');
  const releaseCount = $('[data-music-count]');
  const emptyState = $('[data-music-empty]');
  const activeFiltersRoot = $('[data-music-active-filters]');
  const playlistFeaturedRoot = $('[data-playlist-featured]');
  const memberPicksRoot = $('[data-member-picks]');
  const playlistPreviewRoot = $('[data-playlist-preview]');
  const playlistPreviewMore = $('[data-playlist-preview-more]');
  const playlistDefaultView = $('[data-playlist-default-view]');
  const playlistTypeButtons = $$('[data-playlist-type]');
  const playlistMemberButtons = $$('[data-playlist-member]');
  const playlistSearchInput = $('[data-playlist-search]');
  const playlistSortControl = $('[data-playlist-sort-control]');
  const playlistSortTrigger = $('[data-playlist-sort-trigger]');
  const playlistSortMenu = $('[data-playlist-sort-menu]');
  const playlistSortLabel = $('[data-playlist-sort-label]');
  const playlistSortOptions = $$('[data-playlist-sort]');
  const playlistActiveFiltersRoot = $('[data-playlist-active-filters]');
  const playlistResults = $('[data-playlist-search-results]');
  const playlistResultList = $('[data-playlist-result-list]');
  const playlistResultEmpty = $('[data-playlist-result-empty]');
  const playlistFilterOpen = $('[data-playlist-filter-open]');
  const playlistFilterSheet = $('[data-playlist-filter-sheet]');
  const playlistFilterOverlay = $('[data-playlist-filter-overlay]');
  const playlistFilterCloseButtons = $$('[data-playlist-filter-close]');
  const playlistFilterReset = $('[data-playlist-filter-reset]');
  const playlistFilterApply = $('[data-playlist-filter-apply]');
  const playlistArchiveList = $('[data-playlist-archive-list]');
  const playlistCount = $('[data-playlist-count]');
  const playlistEmptyState = $('[data-playlist-empty]');
  const isPlaylistArchivePage = Boolean(playlistArchiveList);

  const detail = $('[data-music-detail]');
  const detailDialog = $('.music-detail-dialog', detail || document);
  const detailContent = $('.music-detail-content', detail || document);
  const detailKind = $('[data-detail-kind]');
  const detailTitle = $('[data-detail-title]');
  const detailEyebrow = $('[data-detail-eyebrow]');
  const detailArt = $('[data-detail-art]');
  const detailMeta = $('[data-detail-meta]');
  const detailDescription = $('[data-detail-description]');
  const detailNote = $('[data-detail-note]');
  const detailInfo = $('[data-detail-info]');
  const detailActions = $('[data-detail-actions]');
  const detailTracks = $('[data-detail-tracks]');
  const detailLinks = $('[data-detail-links]');

  const filterOpen = $('[data-music-filter-open]');
  const filterSheet = $('[data-music-filter-sheet]');
  const filterOverlay = $('[data-music-filter-overlay]');
  const filterCloseButtons = $$('[data-music-filter-close]');
  const filterReset = $('[data-music-filter-reset]');
  const filterApply = $('[data-music-filter-apply]');

  const toast = $('[data-music-toast]');
  const audio = $('[data-music-audio]');
  const player = $('[data-music-player]');
  const playerArt = $('[data-player-art]');
  const playerTitle = $('[data-player-title]');
  const playerArtist = $('[data-player-artist]');
  const playerToggle = $('[data-player-toggle]');
  const playerPrev = $('[data-player-prev]');
  const playerNext = $('[data-player-next]');
  const playerSeek = $('[data-player-seek]');
  const playerCurrent = $('[data-player-current]');
  const playerDuration = $('[data-player-duration]');
  const playerClose = $('[data-player-close]');
  const playerQueue = $('[data-player-queue]');
  const queueOverlay = $('[data-player-queue-overlay]');
  const queueSheet = $('[data-player-queue-sheet]');
  const queueTitle = $('[data-queue-title]');
  const queueMeta = $('[data-queue-meta]');
  const queueList = $('[data-queue-list]');
  const queueHandle = $('[data-queue-sheet-handle]');
  const queueDragZones = $$('[data-queue-sheet-handle], [data-queue-drag-zone]');
  const queueCloseButtons = $$('[data-player-queue-close]');
  const fullPlayer = $('[data-music-full-player]');
  const fullPlayerOpen = $('[data-player-full-open]');
  const fullPlayerClose = $('[data-full-player-close]');
  const fullPlayerArt = $('[data-full-player-art]');
  const fullPlayerTitle = $('[data-full-player-title]');
  const fullPlayerArtist = $('[data-full-player-artist]');
  const fullPlayerSource = $('[data-full-player-source]');
  const fullPlayerSeek = $('[data-full-player-seek]');
  const fullPlayerCurrent = $('[data-full-player-current]');
  const fullPlayerDuration = $('[data-full-player-duration]');
  const fullPlayerToggle = $('[data-full-player-toggle]');
  const fullPlayerPrev = $('[data-full-player-prev]');
  const fullPlayerNext = $('[data-full-player-next]');
  const fullPlayerShuffle = $('[data-full-player-shuffle]');
  const fullPlayerRepeat = $('[data-full-player-repeat]');
  const fullPlayerLyrics = $('[data-full-player-lyrics]');
  const fullPlayerLyricsSection = $('[data-full-player-lyrics-section]');
  const fullPlayerLyricsToggle = $('[data-full-player-lyrics-toggle]');
  const fullPlayerQueueList = $('[data-full-player-queue-list]');
  const fullPlayerQueueMeta = $('[data-full-player-queue-meta]');
  const fullPlayerQueueSection = $('[data-full-player-queue-section]');

  let activeType = 'ALL';
  let activeMember = 'ALL';
  let activeSort = 'latest';
  let activePlaylistType = 'ALL';
  let activePlaylistMember = 'ALL';
  let activePlaylistSort = 'latest';
  let lastDetailTrigger = null;
  let detailQueueContext = null;
  let toastTimer = 0;
  let queue = [];
  let queueIndex = -1;
  let queueSource = '';
  let currentTrackId = '';
  let queueSheetState = 'collapsed';
  let queueDrag = null;
  let queueReorderDrag = null;
  let suppressQueueHandleClick = false;
  let fullPlayerLyricsExpanded = false;
  let fullPlayerShuffleActive = false;

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function setActive(buttons, activeButton) {
    buttons.forEach((button) => {
      const active = button === activeButton;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.hidden = true;
    }, 1800);
  }

  function getTrack(id) {
    return tracks.find((track) => track.id === id) || null;
  }

  function getReleaseTracks(release) {
    return release.trackIds.map(getTrack).filter(Boolean);
  }

  function getPlaylistTracks(playlist) {
    return playlist.trackIds.map(getTrack).filter(Boolean);
  }

  function formatReleaseDate(release) {
    return release.releaseLabel || release.releaseDate.replaceAll('-', '.');
  }

  function formatTypeLabel(type) {
    return {
      ORIGINAL: '오리지널',
      COVER: '커버',
      LIVE: '라이브',
      OST: 'OST',
    }[type] || type;
  }


  function formatPlaylistTypeLabel(type) {
    return {
      OFFICIAL: '공식',
      MEMBER: '멤버 PICK',
      LIVE: '라이브',
      THEME: '테마',
      ORIGINAL: '오리지널',
      COVER: '커버',
      OST: 'OST',
    }[type] || type;
  }

  function getTrackTypeLabel(track) {
    return formatTypeLabel(track?.type || 'ORIGINAL');
  }

  function getPlaylistChipLabel(playlist) {
    if (!playlist) return '';
    if (playlist.kind === 'member') return `${playlist.member || 'MEMBER'} PICK`;
    return formatTypeLabel(playlist.category || playlist.type || 'THEME');
  }

  function parseTrackDuration(value) {
    const [minutes = 0, seconds = 0] = String(value || '0:0').split(':').map(Number);
    return (Number.isFinite(minutes) ? minutes : 0) * 60 + (Number.isFinite(seconds) ? seconds : 0);
  }

  function getPlaylistDuration(playlist) {
    return getPlaylistTracks(playlist).reduce((total, track) => total + parseTrackDuration(track.duration), 0);
  }

  function formatPlaylistDuration(playlist) {
    const total = getPlaylistDuration(playlist);
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  function playlistMatchesType(playlist, type) {
    if (type === 'ALL') return true;
    if (type === 'OFFICIAL') return playlist.kind === 'official';
    if (type === 'MEMBER') return playlist.kind === 'member';
    return playlist.category === type;
  }

  function formatTime(value) {
    if (!Number.isFinite(value) || value < 0) return '00:00';
    const minutes = Math.floor(value / 60);
    const seconds = Math.floor(value % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  function getQueueSourceItem() {
    return releases.find((item) => item.id === queueSource) || playlists.find((item) => item.id === queueSource) || null;
  }

  function getCurrentQueueTracks() {
    return (queue.length ? queue : (currentTrackId ? [currentTrackId] : []))
      .map(getTrack)
      .filter(Boolean);
  }

  function readQueueMetric(name, fallback) {
    if (!queueSheet) return fallback;
    const value = Number.parseFloat(getComputedStyle(queueSheet).getPropertyValue(name));
    return Number.isFinite(value) ? value : fallback;
  }

  function updateQueueSheetMetrics(trackCount = getCurrentQueueTracks().length) {
    if (!queueSheet) return;
    const viewportHeight = window.visualViewport?.height || window.innerHeight || 760;
    const collapsedMax = Math.max(240, Math.min(430, viewportHeight * .52));
    const collapsedHeight = Math.min(
      collapsedMax,
      Math.max(248, 118 + Math.min(Math.max(trackCount, 1), 3.35) * 60),
    );
    const contentHeight = 118 + Math.max(trackCount, 1) * 60;
    const expandedHeight = Math.min(
      viewportHeight * .9,
      Math.max(collapsedHeight + 110, contentHeight),
    );
    queueSheet.style.setProperty('--queue-collapsed-height', `${Math.round(collapsedHeight)}px`);
    queueSheet.style.setProperty('--queue-expanded-height', `${Math.round(Math.max(collapsedHeight, expandedHeight))}px`);
  }

  function setQueueSheetState(nextState) {
    queueSheetState = nextState === 'expanded' ? 'expanded' : 'collapsed';
    queueSheet?.classList.toggle('is-expanded', queueSheetState === 'expanded');
    if (queueHandle) {
      const expanded = queueSheetState === 'expanded';
      queueHandle.setAttribute('aria-expanded', String(expanded));
      queueHandle.setAttribute('aria-label', expanded ? '재생목록 줄이기' : '재생목록 펼치기');
    }
  }

  function renderQueueSheet() {
    if (!queueList) return;

    const queueTracks = getCurrentQueueTracks();
    const sourceItem = getQueueSourceItem();
    const activeIndex = Math.max(0, queueTracks.findIndex((track) => track.id === currentTrackId));

    updateQueueSheetMetrics(queueTracks.length);
    if (queueTitle) queueTitle.textContent = '현재 재생목록';
    if (queueMeta) {
      const sourceTitle = sourceItem?.title || getTrack(currentTrackId)?.title || '현재 곡';
      const position = queueTracks.length ? `${activeIndex + 1}/${queueTracks.length}` : '0/0';
      queueMeta.textContent = `${sourceTitle} · ${position}`;
    }

    if (!queueTracks.length) {
      queueList.innerHTML = '<div class="music-queue-empty">현재 재생목록이 비어 있어요.</div>';
      return;
    }

    queueList.innerHTML = queueTracks.map((track, index) => {
      const active = track.id === currentTrackId;
      const indexMarkup = active
        ? '<span aria-label="현재 재생 중" class="music-queue-wave"><i></i><i></i><i></i></span>'
        : String(index + 1).padStart(2, '0');
      return `
        <div class="music-queue-item${active ? ' is-current' : ''}">
          <button aria-label="${escapeHtml(track.title)} 재생" class="music-queue-select" data-queue-track="${escapeHtml(track.id)}" type="button">
            <span class="music-queue-index">${indexMarkup}</span>
            <span aria-hidden="true" class="music-queue-item-art music-art ${escapeHtml(track.art)}"></span>
            <span class="music-queue-item-copy">
              <strong>${escapeHtml(track.title)}</strong>
              <small>${escapeHtml(track.artist)}</small>
              ${active ? '<em>지금 재생 중</em>' : ''}
            </span>
          </button>
          <time>${escapeHtml(track.duration)}</time>
          <span aria-label="${escapeHtml(track.title)} 순서 변경" class="music-queue-drag" data-queue-reorder-handle role="button" tabindex="0"><i aria-hidden="true"></i></span>
        </div>`;
    }).join('');
  }


  function renderFullPlayer() {
    if (!fullPlayer) return;
    const track = getTrack(currentTrackId);
    if (!track) return;
    const sourceItem = getQueueSourceItem();
    const queueTracks = getCurrentQueueTracks();
    const activeIndex = Math.max(0, queueTracks.findIndex((item) => item.id === currentTrackId));

    if (fullPlayerArt) fullPlayerArt.className = `music-full-player-art music-art ${track.art}`;
    if (fullPlayerTitle) fullPlayerTitle.textContent = track.title;
    if (fullPlayerArtist) fullPlayerArtist.textContent = track.artist;
    if (fullPlayerSource) fullPlayerSource.textContent = sourceItem?.title || '현재 재생목록';
    if (fullPlayerCurrent) fullPlayerCurrent.textContent = formatTime(audio?.currentTime || 0);
    if (fullPlayerDuration) fullPlayerDuration.textContent = Number.isFinite(audio?.duration) ? formatTime(audio.duration) : track.duration;
    if (fullPlayerSeek && audio && Number.isFinite(audio.duration) && audio.duration > 0) {
      fullPlayerSeek.value = String(Math.round((audio.currentTime / audio.duration) * 1000));
    }

    const lyrics = Array.isArray(track.lyrics) && track.lyrics.length ? track.lyrics : ['가사 정보가 준비 중이에요.'];
    if (fullPlayerLyrics) {
      fullPlayerLyrics.innerHTML = lyrics.map((line, index) => `<p${index === 0 ? ' class="is-current"' : ''}>${escapeHtml(line)}</p>`).join('');
    }
    fullPlayerLyricsSection?.classList.toggle('is-expanded', fullPlayerLyricsExpanded);
    if (fullPlayerLyricsToggle) fullPlayerLyricsToggle.innerHTML = `${fullPlayerLyricsExpanded ? '가사 접기' : '가사 더보기'} <i aria-hidden="true"></i>`;

    if (fullPlayerQueueMeta) fullPlayerQueueMeta.textContent = queueTracks.length ? `${activeIndex + 1}/${queueTracks.length}` : '0/0';
    if (fullPlayerQueueList) {
      fullPlayerQueueList.innerHTML = queueTracks.map((item, index) => {
        const active = item.id === currentTrackId;
        return `<article class="music-full-queue-item${active ? ' is-current' : ''}">
          <button data-full-queue-track="${escapeHtml(item.id)}" type="button">
            <span class="music-full-queue-index">${active ? '<i aria-hidden="true"></i>' : String(index + 1).padStart(2, '0')}</span>
            <span class="music-full-queue-art music-art ${escapeHtml(item.art)}" aria-hidden="true"></span>
            <span class="music-full-queue-copy"><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.artist)}</small></span>
            <time>${escapeHtml(item.duration)}</time>
          </button>
        </article>`;
      }).join('');
    }
    syncPlayButtons();
  }

  function openFullPlayer() {
    if (!currentTrackId || !fullPlayer) {
      showToast('먼저 곡을 재생해주세요');
      return;
    }
    closeQueueSheet();
    renderFullPlayer();
    fullPlayer.hidden = false;
    document.body.classList.add('music-full-player-open');
    fullPlayerClose?.focus({ preventScroll: true });
  }

  function closeFullPlayer() {
    if (!fullPlayer) return;
    fullPlayer.hidden = true;
    document.body.classList.remove('music-full-player-open');
    fullPlayerOpen?.focus({ preventScroll: true });
  }

  function openQueueSheet() {
    if (!queue.length && !currentTrackId) {
      showToast('현재 재생목록이 없어요');
      return;
    }
    renderQueueSheet();
    setQueueSheetState('collapsed');
    if (queueOverlay) queueOverlay.hidden = false;
    if (queueSheet) queueSheet.hidden = false;
    document.body.classList.add('music-queue-open');
    window.requestAnimationFrame(() => {
      queueList?.querySelector('.music-queue-item.is-current')?.scrollIntoView({ block: 'nearest' });
    });
  }

  function closeQueueSheet() {
    queueDrag = null;
    queueSheet?.classList.remove('is-dragging', 'is-expanded');
    queueSheet?.style.removeProperty('--queue-drag-height');
    queueSheetState = 'collapsed';
    if (queueHandle) {
      queueHandle.setAttribute('aria-expanded', 'false');
      queueHandle.setAttribute('aria-label', '재생목록 펼치기');
    }
    if (queueOverlay) queueOverlay.hidden = true;
    if (queueSheet) queueSheet.hidden = true;
    document.body.classList.remove('music-queue-open');
  }

  function startQueueDrag(event) {
    if (!queueSheet || queueSheet.hidden || event.isPrimary === false) return;
    if (typeof event.button === 'number' && event.button !== 0) return;
    if (event.target.closest('[data-player-queue-close]')) return;

    const rect = queueSheet.getBoundingClientRect();
    queueDrag = {
      pointerId: event.pointerId,
      startY: event.clientY,
      lastY: event.clientY,
      startHeight: rect.height,
      startTime: performance.now(),
      startState: queueSheetState,
      moved: false,
    };
    queueSheet.style.setProperty('--queue-drag-height', `${Math.round(rect.height)}px`);
    queueSheet.classList.add('is-dragging');
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function moveQueueDrag(event) {
    if (!queueDrag || event.pointerId !== queueDrag.pointerId || !queueSheet) return;
    const deltaY = event.clientY - queueDrag.startY;
    const expandedHeight = readQueueMetric('--queue-expanded-height', window.innerHeight * .9);
    const nextHeight = Math.max(92, Math.min(expandedHeight, queueDrag.startHeight - deltaY));
    queueDrag.lastY = event.clientY;
    if (Math.abs(deltaY) > 4) queueDrag.moved = true;
    queueSheet.style.setProperty('--queue-drag-height', `${Math.round(nextHeight)}px`);
    if (queueDrag.moved) event.preventDefault();
  }

  function finishQueueDrag(event, cancelled = false) {
    if (!queueDrag || event.pointerId !== queueDrag.pointerId || !queueSheet) return;
    const drag = queueDrag;
    queueDrag = null;
    const deltaY = drag.lastY - drag.startY;
    const elapsed = Math.max(1, performance.now() - drag.startTime);
    const velocity = deltaY / elapsed;
    const currentHeight = queueSheet.getBoundingClientRect().height;
    const collapsedHeight = readQueueMetric('--queue-collapsed-height', 320);
    const expandedHeight = readQueueMetric('--queue-expanded-height', 620);

    queueSheet.classList.remove('is-dragging');
    queueSheet.style.removeProperty('--queue-drag-height');
    suppressQueueHandleClick = drag.moved;
    if (drag.moved) window.setTimeout(() => { suppressQueueHandleClick = false; }, 80);

    if (cancelled) {
      setQueueSheetState(currentHeight > (collapsedHeight + expandedHeight) / 2 ? 'expanded' : 'collapsed');
      return;
    }

    if (drag.startState === 'expanded') {
      if (deltaY > 220 || currentHeight < collapsedHeight * .7) {
        closeQueueSheet();
      } else if (deltaY > 48 || velocity > .38 || currentHeight < (collapsedHeight + expandedHeight) / 2) {
        setQueueSheetState('collapsed');
      } else {
        setQueueSheetState('expanded');
      }
      return;
    }

    if (deltaY > 105 || velocity > .52 || currentHeight < collapsedHeight * .75) {
      closeQueueSheet();
    } else if (deltaY < -42 || velocity < -.35 || currentHeight > (collapsedHeight + expandedHeight) / 2) {
      setQueueSheetState('expanded');
    } else {
      setQueueSheetState('collapsed');
    }
  }

  function toggleQueueSheetState() {
    setQueueSheetState(queueSheetState === 'expanded' ? 'collapsed' : 'expanded');
  }

  async function activateQueueTrack(trackId) {
    if (!trackId || !audio) return;
    if (trackId === currentTrackId) {
      if (audio.paused) {
        try { await audio.play(); } catch { showToast('브라우저에서 재생이 차단됐어요'); }
      }
      syncPlayButtons();
      renderQueueSheet();
      return;
    }
    await loadAndPlay(trackId, queue, queueSource);
    window.requestAnimationFrame(() => {
      queueList?.querySelector('.music-queue-item.is-current')?.scrollIntoView({ block: 'nearest' });
    });
  }


  function startQueueReorder(event) {
    const handle = event.target.closest('[data-queue-reorder-handle]');
    if (!handle || !queueList || event.isPrimary === false) return;
    if (typeof event.button === 'number' && event.button !== 0) return;
    const item = handle.closest('.music-queue-item');
    if (!item) return;

    const orderedItems = Array.from(queueList.querySelectorAll('.music-queue-item'));
    const startIndex = orderedItems.indexOf(item);
    if (startIndex < 0) return;

    queueReorderDrag = {
      pointerId: event.pointerId,
      item,
      handle,
      startIndex,
      startY: event.clientY,
      moved: false,
    };
    item.classList.add('is-reordering');
    queueList.classList.add('is-reordering');
    handle.setPointerCapture?.(event.pointerId);
    event.preventDefault();
    event.stopPropagation();
  }

  function moveQueueReorder(event) {
    const drag = queueReorderDrag;
    if (!drag || event.pointerId !== drag.pointerId || !queueList) return;
    const deltaY = event.clientY - drag.startY;
    if (Math.abs(deltaY) > 3) drag.moved = true;
    if (!drag.moved) return;

    const siblings = Array.from(queueList.querySelectorAll('.music-queue-item:not(.is-reordering)'));
    const nextItem = siblings.find((candidate) => {
      const rect = candidate.getBoundingClientRect();
      return event.clientY < rect.top + rect.height / 2;
    });
    if (nextItem) queueList.insertBefore(drag.item, nextItem);
    else queueList.appendChild(drag.item);

    event.preventDefault();
  }

  function finishQueueReorder(event, cancelled = false) {
    const drag = queueReorderDrag;
    if (!drag || event.pointerId !== drag.pointerId || !queueList) return;
    queueReorderDrag = null;
    drag.item.classList.remove('is-reordering');
    queueList.classList.remove('is-reordering');

    if (cancelled || !drag.moved) {
      renderQueueSheet();
      return;
    }

    const reorderedIds = Array.from(queueList.querySelectorAll('[data-queue-track]'))
      .map((button) => button.dataset.queueTrack)
      .filter((id) => getTrack(id));
    if (reorderedIds.length === queue.length) {
      queue = reorderedIds;
      queueIndex = Math.max(0, queue.indexOf(currentTrackId));
    }
    renderQueueSheet();
  }

  function syncPlayButtons() {
    const playing = Boolean(audio && !audio.paused && !audio.ended);
    $$('[data-play-track]').forEach((button) => {
      const active = playing && button.dataset.playTrack === currentTrackId;
      button.classList.toggle('is-playing', active);
      button.setAttribute('aria-pressed', String(active));
    });
    $$('[data-play-release], [data-play-playlist]').forEach((button) => {
      const source = button.dataset.playRelease || button.dataset.playPlaylist || '';
      const active = playing && source === queueSource;
      button.classList.toggle('is-playing', active);
      button.setAttribute('aria-pressed', String(active));
      const label = button.querySelector('span');
      if (label && (button.classList.contains('music-live-setlist-all-play') || button.classList.contains('music-playlist-primary-play'))) {
        label.textContent = active ? '일시정지' : (button.classList.contains('music-live-setlist-all-play') ? '전체 재생' : '재생하기');
      }
    });
    playerToggle?.classList.toggle('is-playing', playing);
    fullPlayerToggle?.classList.toggle('is-playing', playing);
  }

  function showPlayer(track) {
    if (!player || !playerArt || !playerTitle || !playerArtist) return;
    player.hidden = false;
    document.body.classList.add('music-player-open');
    playerArt.className = `music-player-art music-art ${track.art}`;
    playerTitle.textContent = track.title;
    playerArtist.textContent = track.artist;
    if (!queueSheet?.hidden) renderQueueSheet();
    if (fullPlayer && !fullPlayer.hidden) renderFullPlayer();
  }

  function closePlayer() {
    closeQueueSheet();
    if (fullPlayer && !fullPlayer.hidden) closeFullPlayer();
    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }
    currentTrackId = '';
    queue = [];
    queueIndex = -1;
    queueSource = '';
    if (player) player.hidden = true;
    document.body.classList.remove('music-player-open');
    if (playerCurrent) playerCurrent.textContent = '00:00';
    if (playerDuration) playerDuration.textContent = '00:00';
    if (playerSeek) playerSeek.value = '0';
    syncPlayButtons();
  }

  async function loadAndPlay(trackId, nextQueue = null, source = '', forcePlay = false) {
    if (!audio) return;
    const track = getTrack(trackId);
    if (!track) {
      showToast('재생 가능한 테스트 음원이 아직 없어요');
      return;
    }

    if (Array.isArray(nextQueue)) {
      queue = nextQueue.filter((id) => getTrack(id));
      queueIndex = Math.max(0, queue.indexOf(trackId));
      queueSource = source;
    } else if (!queue.includes(trackId)) {
      queue = [trackId];
      queueIndex = 0;
      queueSource = source;
    } else {
      queueIndex = queue.indexOf(trackId);
    }

    if (currentTrackId === trackId && audio.src) {
      if (forcePlay) {
        if (audio.ended) audio.currentTime = 0;
        if (audio.paused) {
          try { await audio.play(); } catch { showToast('브라우저에서 재생이 차단됐어요'); }
        }
      } else if (audio.paused) {
        try { await audio.play(); } catch { showToast('브라우저에서 재생이 차단됐어요'); }
      } else {
        audio.pause();
      }
      syncPlayButtons();
      if (!queueSheet?.hidden) renderQueueSheet();
      return;
    }

    currentTrackId = trackId;
    audio.src = track.audio;
    showPlayer(track);
    if (playerCurrent) playerCurrent.textContent = '00:00';
    if (playerDuration) playerDuration.textContent = track.duration;
    if (playerSeek) playerSeek.value = '0';

    try {
      await audio.play();
    } catch {
      showToast('브라우저에서 재생이 차단됐어요. 재생 버튼을 다시 눌러주세요.');
    }
    if (!queueSheet?.hidden) renderQueueSheet();
    syncPlayButtons();
  }

  function playQueue(trackIds, source, shuffle = false) {
    const playable = trackIds.filter((id) => getTrack(id));
    if (!playable.length) {
      showToast('재생 가능한 테스트 음원이 아직 없어요');
      return;
    }
    const nextQueue = shuffle ? [...playable].sort(() => Math.random() - 0.5) : playable;
    loadAndPlay(nextQueue[0], nextQueue, source);
  }

  function moveQueue(step) {
    if (!queue.length) return;
    if (step > 0 && fullPlayerShuffleActive && queue.length > 1) {
      const choices = queue.map((_, index) => index).filter((index) => index !== queueIndex);
      queueIndex = choices[Math.floor(Math.random() * choices.length)];
    } else {
      queueIndex = (queueIndex + step + queue.length) % queue.length;
    }
    loadAndPlay(queue[queueIndex], queue, queueSource, true);
  }


  function musicInlineIcon(kind) {
    const icons = {
      calendar: '<svg aria-hidden="true" class="music-meta-icon-svg music-meta-icon-svg--calendar" viewBox="0 0 24 24"><rect x="3.5" y="5.5" width="17" height="15" rx="2.8"></rect><path d="M7.5 3.5v4M16.5 3.5v4M3.5 9.5h17"></path><path class="music-calendar-dots" d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01M16 17h.01"></path></svg>',
      note: '<span aria-hidden="true" class="music-note-glyph">♬</span>'
    };
    return icons[kind] || '';
  }

  function renderFeatured() {
    const featured = releases.find((release) => release.featured) || releases[0];
    if (!featured || !featuredRoot) return;
    const featuredTracks = getReleaseTracks(featured);
    const typeLabel = formatTypeLabel(featured.type);

    featuredRoot.innerHTML = `
      <div class="music-featured-summary">
        <span class="music-featured-art music-art ${escapeHtml(featured.art)}" aria-hidden="true"></span>
        <div class="music-featured-copy">
          <span class="music-featured-badge">추천 신곡</span>
          <p class="music-featured-eyebrow">${escapeHtml(featured.eyebrow)}</p>
          <h2 id="music-featured-title">${escapeHtml(featured.title)}</h2>
          <p class="music-featured-subtitle">${escapeHtml(featured.subtitle)}</p>
          <div class="music-featured-meta">
            <span>${musicInlineIcon('calendar')}<span>${escapeHtml(formatReleaseDate(featured))} 발매</span></span>
            <span>${musicInlineIcon('note')}<span>총 ${featuredTracks.length}곡</span></span>
            <span class="music-featured-type">${escapeHtml(typeLabel)}</span>
          </div>
          <button aria-label="${escapeHtml(featured.title)} 전체 재생" class="music-featured-play" data-play-release="${escapeHtml(featured.id)}" type="button"><i class="music-play-icon" aria-hidden="true"></i></button>
        </div>
      </div>
      <div class="music-featured-tracks">
        ${featuredTracks.map((track, index) => `
          <article class="music-featured-track">
            <span class="music-featured-track-art music-art ${escapeHtml(track.art)}" aria-hidden="true"></span>
            <div class="music-featured-track-main">
              <div class="music-track-copy"><strong>${escapeHtml(track.title)}</strong><small>${escapeHtml(track.artist)}</small></div>
            </div>
            <span class="music-featured-track-meta"><em>${escapeHtml(typeLabel)}</em><time>${escapeHtml(track.duration)}</time></span>
            <button aria-label="${escapeHtml(track.title)} 재생" class="music-track-play" data-play-track="${escapeHtml(track.id)}" type="button"><i aria-hidden="true"></i></button>
            <button aria-label="${escapeHtml(track.title)} 옵션" class="music-track-more" data-track-more="${escapeHtml(track.id)}" type="button"><i aria-hidden="true"></i></button>
          </article>`).join('')}
      </div>
      <button aria-controls="music-detail-title" class="music-featured-footer" data-release-detail="${escapeHtml(featured.id)}" type="button">앨범의 모든 곡 보기 <i aria-hidden="true"></i></button>`;
  }

  function getFilteredReleases() {
    const query = String(searchInput?.value || '').trim().toLocaleLowerCase('ko-KR');
    const filtered = releases.filter((release) => {
      const typeMatch = activeType === 'ALL' || release.type === activeType;
      const memberMatch = activeMember === 'ALL' || release.members.includes(activeMember);
      const searchText = [
        release.title,
        release.subtitle,
        release.type,
        formatTypeLabel(release.type),
        ...release.members,
        ...getReleaseTracks(release).flatMap((track) => [track.title, track.artist]),
      ].join(' ').toLocaleLowerCase('ko-KR');
      return typeMatch && memberMatch && (!query || searchText.includes(query));
    });

    return filtered.sort((first, second) => {
      if (activeSort === 'title') return first.title.localeCompare(second.title, 'ko-KR');
      if (activeSort === 'tracks') return second.trackIds.length - first.trackIds.length;
      return new Date(second.releaseDate).getTime() - new Date(first.releaseDate).getTime();
    });
  }



  function renderReleaseList() {
    if (!releaseList) return;
    const filtered = getFilteredReleases();
    releaseList.innerHTML = filtered.map((release) => {
      const trackCount = release.trackIds.length;
      const typeLabel = formatTypeLabel(release.type);
      const memberLabel = release.members.join(' · ');
      const titleClass = release.title.length >= 22 ? 'music-release-title--compact' : '';
      const playButton = trackCount
        ? `<button aria-label="${escapeHtml(release.title)} 전체 재생" class="music-release-play" data-play-release="${escapeHtml(release.id)}" type="button"><i class="music-play-icon" aria-hidden="true"></i></button>`
        : `<button aria-label="${escapeHtml(release.title)} 재생 준비 중" class="music-release-play" disabled type="button"><i class="music-play-icon" aria-hidden="true"></i></button>`;

      return `
        <article class="music-release-card">
          <button class="music-release-detail" data-release-detail="${escapeHtml(release.id)}" type="button">
            <span class="music-release-art music-art ${escapeHtml(release.art)}" aria-hidden="true"><em>${escapeHtml(release.status)}</em><b class="music-release-art-type">${escapeHtml(typeLabel)}</b></span>
            <span class="music-release-copy">
              <small>${escapeHtml(release.eyebrow)} · ${escapeHtml(formatReleaseDate(release))}</small>
              <strong class="${titleClass}">${escapeHtml(release.title)}</strong>
              <p>${escapeHtml(release.subtitle)}</p>
              <span>${escapeHtml(memberLabel)} · ${trackCount ? `총 ${trackCount}곡` : '공개 예정'}</span>
            </span>
          </button>
          <footer class="music-release-actions">
            <span class="music-release-action-buttons">
              ${playButton}
            </span>
          </footer>
        </article>`;
    }).join('');

    if (releaseCount) releaseCount.textContent = String(filtered.length);
    if (emptyState) emptyState.hidden = filtered.length > 0;
  }

  function playlistMatchesTypeInline(playlist, type) {
    if (type === 'ALL') return true;
    return playlist.category === type;
  }

  function getInlineFilteredPlaylists() {
    const query = String(playlistSearchInput?.value || '').trim().toLocaleLowerCase('ko-KR');
    return playlists.filter((playlist) => {
      const typeMatch = playlistMatchesTypeInline(playlist, activePlaylistType);
      const memberMatch = activePlaylistMember === 'ALL' || playlist.member === activePlaylistMember;
      const searchText = [playlist.title, playlist.subtitle, playlist.description, playlist.member, playlist.curator, playlist.type,
        ...getPlaylistTracks(playlist).flatMap((track) => [track.title, track.artist])].filter(Boolean).join(' ').toLocaleLowerCase('ko-KR');
      return typeMatch && memberMatch && (!query || searchText.includes(query));
    }).sort((a,b) => {
      if (activePlaylistSort === 'title') return a.title.localeCompare(b.title,'ko-KR');
      if (activePlaylistSort === 'tracks') return b.trackIds.length-a.trackIds.length;
      return new Date(b.updatedDate||0)-new Date(a.updatedDate||0);
    });
  }

  function getInlinePlaylistMatch(playlist) {
    const query = String(playlistSearchInput?.value || '').trim().toLocaleLowerCase('ko-KR');
    if (!query) return '';
    const match = getPlaylistTracks(playlist).find((track) => track.title.toLocaleLowerCase('ko-KR').includes(query));
    return match ? `${match.title} 포함` : '';
  }



  function renderFeaturedPlaylistCard(playlist) {
    const playlistTracks = getPlaylistTracks(playlist);
    return `
      <div class="music-live-setlist-layout" data-live-setlist-card="${escapeHtml(playlist.id)}">
        <article class="music-live-setlist-card">
          <header class="music-live-setlist-header">
            <button aria-label="${escapeHtml(playlist.title)} 상세 보기" class="music-live-setlist-art-button" data-playlist-detail="${escapeHtml(playlist.id)}" type="button">
              <span class="music-live-setlist-art music-art ${escapeHtml(playlist.art)}" aria-hidden="true"></span>
            </button>
            <div class="music-live-setlist-copy">
              <small><em>추천</em>${escapeHtml(playlist.subtitle)}</small>
              <h2>${escapeHtml(playlist.title)}</h2>
              <p>${escapeHtml(playlist.description)}</p>
              <span>총 ${playlist.trackIds.length}곡 · ${formatPlaylistDuration(playlist)}</span>
              <div class="music-live-setlist-actions">
                <button class="music-live-setlist-all-play" data-play-playlist="${escapeHtml(playlist.id)}" type="button"><i aria-hidden="true"></i><span>전체 재생</span></button>
                <button class="music-live-setlist-detail" data-playlist-detail="${escapeHtml(playlist.id)}" type="button">상세 보기 <i aria-hidden="true"></i></button>
              </div>
            </div>
          </header>
        </article>
        <section aria-label="${escapeHtml(playlist.title)} 수록곡" class="music-live-setlist-tracks">
          ${playlistTracks.map((track, index) => `
            <article class="music-live-track" data-live-track="${escapeHtml(track.id)}">
              <span class="music-live-track-art music-art ${escapeHtml(track.art)}" aria-hidden="true"></span>
              <span class="music-live-track-copy"><strong>${escapeHtml(track.title)}</strong><small>${escapeHtml(track.artist)}</small></span>
              <span class="music-live-track-meta"><em>${escapeHtml(getTrackTypeLabel(track))}</em><time>${escapeHtml(track.duration)}</time></span>
              <button aria-label="${escapeHtml(track.title)} 재생" class="music-live-track-play" data-play-track="${escapeHtml(track.id)}" data-playlist-source="${escapeHtml(playlist.id)}" type="button"><i aria-hidden="true"></i></button>
            </article>`).join('')}
        </section>
      </div>`;
  }

  function renderMemberPlaylistCard(playlist) {
    const artClass = playlist.art || 'music-art--member';
    return `
      <article class="music-member-pick-card" style="--member-color:${escapeHtml(playlist.color)};--member-soft:${escapeHtml(playlist.soft)}">
        <button class="music-member-pick-detail" data-playlist-detail="${escapeHtml(playlist.id)}" type="button">
          <span class="music-member-pick-art music-art ${escapeHtml(artClass)}" aria-hidden="true"></span>
          <span class="music-member-pick-copy">
            <small>${escapeHtml(playlist.member)} PICK</small>
            <strong>${escapeHtml(playlist.title)}</strong>
            <p>${escapeHtml(playlist.description)}</p>
            <span>총 ${playlist.trackIds.length}곡 · ${formatPlaylistDuration(playlist)}</span>
          </span>
        </button>
        <button aria-label="${escapeHtml(playlist.title)} 재생" class="music-member-pick-play" data-play-playlist="${escapeHtml(playlist.id)}" type="button"><i aria-hidden="true"></i></button>
      </article>`;
  }

  function renderUnifiedPlaylistResultCard(playlist) {
    const artClass = playlist.art || 'music-art--member';
    const chipLabel = getPlaylistChipLabel(playlist);
    const subtitleText = playlist.kind === 'member'
      ? `${playlist.member || 'MEMBER'} PICK`
      : (playlist.subtitle || playlist.type || '');
    const style = playlist.kind === 'member'
      ? ` style="--member-color:${escapeHtml(playlist.color)};--member-soft:${escapeHtml(playlist.soft)}"`
      : '';

    return `
      <article class="music-member-pick-card music-playlist-unified-card"${style}>
        <button class="music-member-pick-detail music-playlist-unified-detail" data-playlist-detail="${escapeHtml(playlist.id)}" type="button">
          <span class="music-member-pick-art music-art ${escapeHtml(artClass)}" aria-hidden="true"></span>
          <span class="music-member-pick-copy music-playlist-unified-copy">
            <small>${chipLabel ? `<em>${escapeHtml(chipLabel)}</em>` : ''}${subtitleText ? `<span class="music-playlist-unified-kicker">${escapeHtml(subtitleText)}</span>` : ''}</small>
            <strong>${escapeHtml(playlist.title)}</strong>
            <p>${escapeHtml(playlist.description)}</p>
            <span>총 ${playlist.trackIds.length}곡 · ${formatPlaylistDuration(playlist)}</span>
          </span>
        </button>
        <button aria-label="${escapeHtml(playlist.title)} 재생" class="music-member-pick-play" data-play-playlist="${escapeHtml(playlist.id)}" type="button"><i aria-hidden="true"></i></button>
      </article>`;
  }

  function getPlaylistResultTracks(filteredPlaylists) {
    const query = String(playlistSearchInput?.value || '').trim().toLocaleLowerCase('ko-KR');
    const linkedIds = new Set(filteredPlaylists.flatMap((playlist) => playlist.trackIds));

    return tracks.filter((track) => {
      const typeMatch = activePlaylistType === 'ALL'
        || track.type === activePlaylistType
        || linkedIds.has(track.id);
      const memberMatch = activePlaylistMember === 'ALL'
        || (Array.isArray(track.members) && track.members.includes(activePlaylistMember))
        || filteredPlaylists.some((playlist) => playlist.trackIds.includes(track.id));
      const searchText = [track.title, track.artist, track.type, formatTypeLabel(track.type), ...(track.members || [])]
        .join(' ')
        .toLocaleLowerCase('ko-KR');
      const searchMatch = !query || searchText.includes(query);
      return typeMatch && memberMatch && searchMatch;
    });
  }

  function renderPlaylistTrackGroup(trackList) {
    if (!trackList.length) return '';
    return `
      <section class="music-playlist-result-group music-playlist-track-group" aria-labelledby="music-playlist-track-group-title">
        <header class="music-playlist-result-group-heading">
          <div class="music-inline-section-title"><span>TRACKS</span><i aria-hidden="true">·</i><h2 id="music-playlist-track-group-title">곡 목록</h2></div>
        </header>
        <section aria-label="필터 결과 곡 목록" class="music-live-setlist-tracks music-playlist-result-tracks">
          ${trackList.map((track) => `
            <article class="music-live-track" data-live-track="${escapeHtml(track.id)}">
              <span class="music-live-track-art music-art ${escapeHtml(track.art)}" aria-hidden="true"></span>
              <span class="music-live-track-copy"><strong>${escapeHtml(track.title)}</strong><small>${escapeHtml(track.artist)}</small></span>
              <span class="music-live-track-meta"><em>${escapeHtml(getTrackTypeLabel(track))}</em><time>${escapeHtml(track.duration)}</time></span>
              <button aria-label="${escapeHtml(track.title)} 재생" class="music-live-track-play" data-play-track="${escapeHtml(track.id)}" type="button"><i aria-hidden="true"></i></button>
            </article>`).join('')}
        </section>
      </section>`;
  }

  function renderPlaylistCardGroup(playlistList) {
    if (!playlistList.length) return '';
    return `
      <section class="music-playlist-result-group music-playlist-card-group" aria-labelledby="music-playlist-card-group-title">
        <header class="music-playlist-result-group-heading">
          <div class="music-inline-section-title"><span>PLAYLISTS</span><i aria-hidden="true">·</i><h2 id="music-playlist-card-group-title">플레이리스트</h2></div>
        </header>
        <div class="music-playlist-result-card-stack">
          ${playlistList.map((playlist) => renderUnifiedPlaylistResultCard(playlist)).join('')}
        </div>
      </section>`;
  }

  function renderPlaylistSearchResults() {
    if (!playlistResultList || !playlistResults || !playlistDefaultView) return;
    const query = String(playlistSearchInput?.value || '').trim();
    const hasFilter = activePlaylistType !== 'ALL' || activePlaylistMember !== 'ALL' || activePlaylistSort !== 'latest';
    const searching = Boolean(query || hasFilter);
    playlistDefaultView.hidden = searching;
    playlistResults.hidden = !searching;
    if (!searching) return;

    const filteredPlaylists = getInlineFilteredPlaylists();
    const filteredTracks = getPlaylistResultTracks(filteredPlaylists);
    playlistResultList.innerHTML = [
      renderPlaylistTrackGroup(filteredTracks),
      renderPlaylistCardGroup(filteredPlaylists),
    ].join('');

    if (playlistResultEmpty) playlistResultEmpty.hidden = filteredPlaylists.length > 0 || filteredTracks.length > 0;
  }

  function renderPlaylists() {
    const featured = playlists.find((playlist) => playlist.id === 'live-setlist') || playlists.find((playlist) => playlist.kind === 'official');
    const officialPlaylists = playlists.filter((playlist) => playlist.kind === 'official');

    if (playlistPreviewRoot) {
      playlistPreviewRoot.innerHTML = officialPlaylists.map((playlist) => `
        <article class="music-playlist-preview-card">
          <button data-playlist-detail="${escapeHtml(playlist.id)}" type="button">
            <span class="music-playlist-preview-art music-art ${escapeHtml(playlist.art)}" aria-hidden="true"></span>
            <span class="music-playlist-preview-copy"><strong>${escapeHtml(playlist.title)}</strong><small>총 ${playlist.trackIds.length}곡 · ${formatPlaylistDuration(playlist)}</small></span>
          </button>
        </article>`).join('');
    }

    if (playlistFeaturedRoot && featured) {
      playlistFeaturedRoot.innerHTML = renderFeaturedPlaylistCard(featured);
    }

    if (memberPicksRoot) {
      memberPicksRoot.innerHTML = playlists
        .filter((playlist) => playlist.kind === 'member')
        .map(renderMemberPlaylistCard)
        .join('');
      const resetMemberPickRail = () => { memberPicksRoot.scrollLeft = 0; };
      resetMemberPickRail();
      window.requestAnimationFrame(() => {
        resetMemberPickRail();
        window.requestAnimationFrame(resetMemberPickRail);
      });
    }
  }

  function getFilteredPlaylists() {
    const query = String(searchInput?.value || '').trim().toLocaleLowerCase('ko-KR');
    const filtered = playlists.filter((playlist) => {
      const typeMatch = playlistMatchesType(playlist, activeType);
      const memberMatch = activeMember === 'ALL' || playlist.member === activeMember;
      const trackText = getPlaylistTracks(playlist).flatMap((track) => [track.title, track.artist]);
      const searchText = [
        playlist.title,
        playlist.subtitle,
        playlist.description,
        playlist.member,
        playlist.curator,
        playlist.type,
        formatPlaylistTypeLabel(playlist.kind === 'member' ? 'MEMBER' : playlist.category || 'OFFICIAL'),
        ...trackText,
      ].filter(Boolean).join(' ').toLocaleLowerCase('ko-KR');
      return typeMatch && memberMatch && (!query || searchText.includes(query));
    });

    return filtered.sort((first, second) => {
      if (activeSort === 'title') return first.title.localeCompare(second.title, 'ko-KR');
      if (activeSort === 'tracks') return second.trackIds.length - first.trackIds.length;
      return new Date(second.updatedDate || 0).getTime() - new Date(first.updatedDate || 0).getTime();
    });
  }

  function getPlaylistSearchMatch(playlist) {
    const query = String(searchInput?.value || '').trim().toLocaleLowerCase('ko-KR');
    if (!query) return '';
    const match = getPlaylistTracks(playlist).find((track) => track.title.toLocaleLowerCase('ko-KR').includes(query));
    return match ? `${match.title} 포함` : '';
  }

  function renderPlaylistArchiveList() {
    if (!playlistArchiveList) return;
    const filtered = getFilteredPlaylists();
    playlistArchiveList.innerHTML = filtered.map((playlist) => {
      const badge = playlist.kind === 'member' ? 'MEMBER PICK' : (playlist.category === 'LIVE' ? 'LIVE' : 'OFFICIAL');
      const curator = playlist.member || playlist.curator || 'LUMIBELLE OFFICIAL';
      const match = getPlaylistSearchMatch(playlist);
      const artExtra = playlist.kind === 'member' ? `<b class="music-playlist-archive-mark">${escapeHtml(playlist.mark)}</b>` : '';
      const style = playlist.kind === 'member' ? ` style="--member-color:${escapeHtml(playlist.color)};--member-soft:${escapeHtml(playlist.soft)}"` : '';
      return `
        <article class="music-playlist-archive-card"${style}>
          <button class="music-playlist-archive-detail" data-playlist-detail="${escapeHtml(playlist.id)}" type="button">
            <span class="music-playlist-archive-art music-art ${escapeHtml(playlist.art || 'music-art--member')}" aria-hidden="true"><em>${escapeHtml(badge)}</em>${artExtra}</span>
            <span class="music-playlist-archive-copy">
              <small>${escapeHtml(playlist.type)} · ${escapeHtml(curator)}</small>
              <strong>${escapeHtml(playlist.title)}</strong>
              <p>${escapeHtml(playlist.description)}</p>
              <span>총 ${playlist.trackIds.length}곡 · ${formatPlaylistDuration(playlist)}</span>
              ${match ? `<mark>${escapeHtml(match)}</mark>` : ''}
            </span>
          </button>
          <footer class="music-playlist-archive-actions">
            <button aria-label="${escapeHtml(playlist.title)} 전체 재생" class="music-release-play" data-play-playlist="${escapeHtml(playlist.id)}" type="button"><i class="music-play-icon" aria-hidden="true"></i></button>
          </footer>
        </article>`;
    }).join('');
    if (playlistCount) playlistCount.textContent = String(filtered.length);
    if (playlistEmptyState) playlistEmptyState.hidden = filtered.length > 0;
  }

  function renderCurrentList() {
    if (isPlaylistArchivePage) renderPlaylistArchiveList();
    else renderReleaseList();
  }

  function renderDetailTracks(trackList) {
    if (!detailTracks) return;
    if (!trackList.length) {
      detailTracks.innerHTML = '<article class="music-detail-track"><b>--</b><div><strong>트랙 정보 공개 예정</strong><small>LUMIBELLE MUSIC</small></div><time>--:--</time></article>';
      return;
    }
    detailTracks.innerHTML = trackList.map((track, index) => `
      <article class="music-detail-track">
        <b>${String(index + 1).padStart(2, '0')}</b>
        <div><strong>${escapeHtml(track.title)}</strong><small>${escapeHtml(track.artist)}</small></div>
        <time>${escapeHtml(track.duration)}</time>
        <button aria-label="${escapeHtml(track.title)} 재생" class="music-detail-play" data-play-track="${escapeHtml(track.id)}" type="button"><i aria-hidden="true"></i></button>
      </article>`).join('');
  }

  function renderInfoRows(rows = []) {
    if (!detailInfo) return;
    detailInfo.innerHTML = rows
      .filter(([label, value]) => label && value !== undefined && value !== null && String(value).trim())
      .map(([label, value]) => `
        <div>
          <dt>${escapeHtml(label)}</dt>
          <dd>${escapeHtml(value)}</dd>
        </div>`)
      .join('');
  }

  function renderPlatformLinks(links = []) {
    if (!detailLinks) return;
    const platforms = ['YOUTUBE MUSIC', 'MELON', 'SPOTIFY', 'APPLE MUSIC'];
    detailLinks.innerHTML = platforms.map((platform) => {
      const url = links.find((link) => link.platform === platform)?.url;
      return url
        ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${platform}</a>`
        : `<button data-platform-pending type="button">${platform}</button>`;
    }).join('');
  }

  function openReleaseDetail(id, trigger) {
    const release = releases.find((item) => item.id === id);
    if (!release || !detail) return;
    const releaseTracks = getReleaseTracks(release);
    lastDetailTrigger = trigger || null;
    detailQueueContext = {
      kind: 'release',
      id: release.id,
      trackIds: [...release.trackIds],
    };
    detail.style.removeProperty('--detail-accent');
    detail.style.removeProperty('--detail-soft');
    detail.classList.add('is-release-detail');
    if (detailKind) detailKind.textContent = 'ALBUM DETAIL';
    if (detailTitle) detailTitle.textContent = release.title;
    if (detailEyebrow) detailEyebrow.textContent = release.eyebrow;
    if (detailArt) detailArt.className = `music-detail-art music-art ${release.art}`;
    if (detailMeta) detailMeta.textContent = `${formatReleaseDate(release)} · ${releaseTracks.length} TRACKS`;
    if (detailDescription) detailDescription.textContent = release.description;
    if (detailNote) detailNote.hidden = true;
    renderInfoRows([
      ['UNIT', release.unit],
      ['MEMBER', release.members.join(' · ')],
      ['CREDIT', release.credit],
    ]);
    if (detailActions) {
      detailActions.innerHTML = `<button data-play-release="${escapeHtml(release.id)}" type="button">전체 재생</button><button data-shuffle-release="${escapeHtml(release.id)}" type="button">랜덤 재생</button>`;
    }
    renderDetailTracks(releaseTracks);
    renderPlatformLinks(release.links);
    detail.hidden = false;
    if (detailContent) detailContent.scrollTop = 0;
    document.body.classList.add('music-detail-open');
    window.setTimeout(() => detailDialog?.focus({ preventScroll: true }), 0);
    syncPlayButtons();
  }

  function openPlaylistDetail(id, trigger) {
    const playlist = playlists.find((item) => item.id === id);
    if (!playlist || !detail) return;
    const playlistTracks = getPlaylistTracks(playlist);
    lastDetailTrigger = trigger || null;
    detailQueueContext = {
      kind: 'playlist',
      id: playlist.id,
      trackIds: [...playlist.trackIds],
    };
    detail.style.removeProperty('--detail-accent');
    detail.style.removeProperty('--detail-soft');
    detail.classList.add('is-release-detail');
    if (detailKind) detailKind.textContent = playlist.kind === 'member' ? 'MEMBER MUSIC ROOM' : 'PLAYLIST DETAIL';
    if (detailTitle) detailTitle.textContent = playlist.title;
    if (detailEyebrow) detailEyebrow.textContent = playlist.subtitle;
    if (detailArt) detailArt.className = `music-detail-art music-art ${playlist.art || 'music-art--cover'}`;
    if (detailMeta) detailMeta.textContent = `${playlistTracks.length} TRACKS · ${playlist.kind === 'member' ? playlist.member : playlist.type}`;
    if (detailDescription) detailDescription.textContent = playlist.description;
    if (detailNote) {
      detailNote.hidden = true;
      detailNote.textContent = '';
    }
    renderInfoRows([
      ['CURATOR', playlist.member || playlist.curator],
      ['TYPE', playlist.type],
      ['STATUS', `${playlistTracks.length} TRACKS`],
    ]);
    if (detailActions) {
      detailActions.innerHTML = `<button data-play-playlist="${escapeHtml(playlist.id)}" type="button">전체 재생</button><button data-shuffle-playlist="${escapeHtml(playlist.id)}" type="button">랜덤 재생</button>`;
    }
    renderDetailTracks(playlistTracks);
    renderPlatformLinks([]);
    detail.hidden = false;
    if (detailContent) detailContent.scrollTop = 0;
    document.body.classList.add('music-detail-open');
    window.setTimeout(() => detailDialog?.focus({ preventScroll: true }), 0);
    syncPlayButtons();
  }

  function closeDetail() {
    if (!detail || detail.hidden) return;
    detail.hidden = true;
    document.body.classList.remove('music-detail-open');
    lastDetailTrigger?.focus();
    lastDetailTrigger = null;
    detailQueueContext = null;
  }

  function setFilterSheet(open) {
    if (!filterSheet || !filterOverlay || !filterOpen) return;
    filterSheet.hidden = !open;
    filterOverlay.hidden = !open;
    filterOpen.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('video-filter-open', open);
    if (open) {
      const typeInput = $(`input[name="music-filter-type"][value="${activeType}"]`);
      const memberInput = $(`input[name="music-filter-member"][value="${activeMember}"]`);
      if (typeInput) typeInput.checked = true;
      if (memberInput) memberInput.checked = true;
      window.setTimeout(() => filterSheet.focus?.({ preventScroll: true }), 0);
    }
  }

  function applyTopState() {
    typeButtons.forEach((button) => {
      const active = button.dataset.musicType === activeType;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    memberButtons.forEach((button) => {
      const active = button.dataset.musicMember === activeMember;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    renderCurrentList();
  }

  playlistPreviewMore?.addEventListener('click', () => {
    const playlistTab = viewButtons.find((button) => button.dataset.musicView === 'playlists');
    playlistTab?.click();
    window.requestAnimationFrame(() => playlistView?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  });

  playlistTypeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activePlaylistType = button.dataset.playlistType || 'ALL';
      setActive(playlistTypeButtons, button);
      renderPlaylistSearchResults();
    });
  });

  playlistMemberButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activePlaylistMember = button.dataset.playlistMember || 'ALL';
      setActive(playlistMemberButtons, button);
      renderPlaylistSearchResults();
    });
  });

  playlistSearchInput?.addEventListener('input', renderPlaylistSearchResults);

  playlistSortTrigger?.addEventListener('click', () => {
    if (!playlistSortMenu || !playlistSortControl) return;
    const open = playlistSortMenu.hidden;
    playlistSortMenu.hidden = !open;
    playlistSortControl.classList.toggle('is-open', open);
    playlistSortTrigger.setAttribute('aria-expanded', String(open));
  });

  playlistSortOptions.forEach((option) => {
    option.addEventListener('click', () => {
      activePlaylistSort = option.dataset.playlistSort || 'latest';
      playlistSortOptions.forEach((item) => item.setAttribute('aria-selected', String(item === option)));
      if (playlistSortLabel) playlistSortLabel.textContent = option.textContent.trim();
      if (playlistSortMenu) playlistSortMenu.hidden = true;
      if (playlistSortControl) playlistSortControl.classList.remove('is-open');
      playlistSortTrigger?.setAttribute('aria-expanded', 'false');
      renderPlaylistSearchResults();
    });
  });

  viewButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setActive(viewButtons, button);
      const playlistMode = button.dataset.musicView === 'playlists';
      if (releaseView) releaseView.hidden = playlistMode;
      if (playlistView) playlistView.hidden = !playlistMode;
      if (playlistMode && memberPicksRoot) {
        memberPicksRoot.scrollLeft = 0;
        window.requestAnimationFrame(() => {
          memberPicksRoot.scrollLeft = 0;
          window.requestAnimationFrame(() => { memberPicksRoot.scrollLeft = 0; });
        });
      }
    });
  });

  typeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activeType = button.dataset.musicType || 'ALL';
      setActive(typeButtons, button);
      renderCurrentList();
    });
  });

  memberButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activeMember = button.dataset.musicMember || 'ALL';
      setActive(memberButtons, button);
      renderCurrentList();
    });
  });

  searchInput?.addEventListener('input', renderCurrentList);

  sortTrigger?.addEventListener('click', () => {
    if (!sortMenu || !sortControl) return;
    const open = sortMenu.hidden;
    sortMenu.hidden = !open;
    sortControl.classList.toggle('is-open', open);
    sortTrigger.setAttribute('aria-expanded', String(open));
  });

  $$('[data-music-sort]', sortMenu || document).forEach((button) => {
    button.addEventListener('click', () => {
      activeSort = button.dataset.musicSort || 'latest';
      $$('[data-music-sort]', sortMenu).forEach((option) => option.setAttribute('aria-selected', String(option === button)));
      if (sortLabel) sortLabel.textContent = button.textContent || '최신순';
      if (sortMenu) sortMenu.hidden = true;
      sortControl?.classList.remove('is-open');
      sortTrigger?.setAttribute('aria-expanded', 'false');
      renderCurrentList();
    });
  });

  filterOpen?.addEventListener('click', () => setFilterSheet(true));
  filterOverlay?.addEventListener('click', () => setFilterSheet(false));
  filterCloseButtons.forEach((button) => button.addEventListener('click', () => setFilterSheet(false)));
  filterReset?.addEventListener('click', () => {
    const typeAll = $('input[name="music-filter-type"][value="ALL"]');
    const memberAll = $('input[name="music-filter-member"][value="ALL"]');
    if (typeAll) typeAll.checked = true;
    if (memberAll) memberAll.checked = true;
  });
  filterApply?.addEventListener('click', () => {
    const selectedType = $('input[name="music-filter-type"]:checked');
    if (selectedType) activeType = selectedType.value || 'ALL';
    activeMember = $('input[name="music-filter-member"]:checked')?.value || 'ALL';
    applyTopState();
    setFilterSheet(false);
  });

  queueList?.addEventListener('pointerdown', startQueueReorder);
  queueList?.addEventListener('keydown', (event) => {
    const handle = event.target.closest('[data-queue-reorder-handle]');
    if (!handle || !queueList || (event.key !== 'ArrowUp' && event.key !== 'ArrowDown')) return;
    const item = handle.closest('.music-queue-item');
    if (!item) return;
    event.preventDefault();
    const sibling = event.key === 'ArrowUp' ? item.previousElementSibling : item.nextElementSibling;
    if (!sibling?.classList.contains('music-queue-item')) return;
    if (event.key === 'ArrowUp') queueList.insertBefore(item, sibling);
    else queueList.insertBefore(sibling, item);
    const reorderedIds = Array.from(queueList.querySelectorAll('[data-queue-track]'))
      .map((button) => button.dataset.queueTrack)
      .filter((id) => getTrack(id));
    if (reorderedIds.length === queue.length) {
      queue = reorderedIds;
      queueIndex = Math.max(0, queue.indexOf(currentTrackId));
    }
    renderQueueSheet();
    window.requestAnimationFrame(() => {
      queueList.querySelector(`[data-queue-track="${CSS.escape(item.querySelector('[data-queue-track]')?.dataset.queueTrack || '')}"]`)
        ?.closest('.music-queue-item')
        ?.querySelector('[data-queue-reorder-handle]')
        ?.focus();
    });
  });

  document.addEventListener('click', (event) => {
    const queueTrack = event.target.closest('[data-queue-track]');
    if (queueTrack) {
      activateQueueTrack(queueTrack.dataset.queueTrack);
      return;
    }

    const fullQueueTrack = event.target.closest('[data-full-queue-track]');
    if (fullQueueTrack) {
      loadAndPlay(fullQueueTrack.dataset.fullQueueTrack, queue, queueSource);
      return;
    }

    const trackMore = event.target.closest('[data-track-more]');
    if (trackMore) {
      showToast('곡 옵션은 다음 단계에서 연결할게요');
      return;
    }


    const releaseDetail = event.target.closest('[data-release-detail]');
    if (releaseDetail) {
      openReleaseDetail(releaseDetail.dataset.releaseDetail, releaseDetail);
      return;
    }

    const playlistDetail = event.target.closest('[data-playlist-detail]');
    if (playlistDetail) {
      openPlaylistDetail(playlistDetail.dataset.playlistDetail, playlistDetail);
      return;
    }

    const trackButton = event.target.closest('[data-play-track]');
    if (trackButton) {
      const trackId = trackButton.dataset.playTrack;
      if (fullPlayer?.contains(trackButton) && queue.includes(trackId)) {
        loadAndPlay(trackId, queue, queueSource);
      } else if (trackButton.dataset.playlistSource) {
        const sourcePlaylist = playlists.find((playlist) => playlist.id === trackButton.dataset.playlistSource);
        loadAndPlay(trackId, sourcePlaylist?.trackIds || [trackId], sourcePlaylist?.id || 'single-track');
      } else if (detail?.contains(trackButton) && detailQueueContext?.trackIds.includes(trackId)) {
        loadAndPlay(trackId, detailQueueContext.trackIds, detailQueueContext.id);
      } else {
        const parentRelease = releases.find((release) => release.trackIds.includes(trackId));
        loadAndPlay(trackId, parentRelease?.trackIds || [trackId], parentRelease?.id || 'single-track');
      }
      return;
    }

    const releasePlay = event.target.closest('[data-play-release]');
    if (releasePlay) {
      const release = releases.find((item) => item.id === releasePlay.dataset.playRelease);
      if (release) playQueue(release.trackIds, release.id);
      return;
    }

    const releaseShuffle = event.target.closest('[data-shuffle-release]');
    if (releaseShuffle) {
      const release = releases.find((item) => item.id === releaseShuffle.dataset.shuffleRelease);
      if (release) playQueue(release.trackIds, release.id, true);
      return;
    }

    const playlistPlay = event.target.closest('[data-play-playlist]');
    if (playlistPlay) {
      const playlist = playlists.find((item) => item.id === playlistPlay.dataset.playPlaylist);
      if (playlist) playQueue(playlist.trackIds, playlist.id);
      return;
    }

    const playlistShuffle = event.target.closest('[data-shuffle-playlist]');
    if (playlistShuffle) {
      const playlist = playlists.find((item) => item.id === playlistShuffle.dataset.shufflePlaylist);
      if (playlist) playQueue(playlist.trackIds, playlist.id, true);
      return;
    }

    if (event.target.closest('[data-platform-pending]')) {
      showToast('스트리밍 링크 연결 전입니다');
      return;
    }

    if (sortMenu && sortTrigger && !sortMenu.hidden && !sortMenu.contains(event.target) && !sortTrigger.contains(event.target)) {
      sortMenu.hidden = true;
      sortControl?.classList.remove('is-open');
      sortTrigger.setAttribute('aria-expanded', 'false');
    }
  });

  $$('[data-music-detail-close]').forEach((button) => button.addEventListener('click', closeDetail));

  playerToggle?.addEventListener('click', async () => {
    if (!audio || !currentTrackId) return;
    if (audio.paused) {
      try { await audio.play(); } catch { showToast('브라우저에서 재생이 차단됐어요'); }
    } else {
      audio.pause();
    }
    syncPlayButtons();
  });

  playerClose?.addEventListener('click', closePlayer);

  playerQueue?.addEventListener('click', openQueueSheet);

  queueOverlay?.addEventListener('click', closeQueueSheet);
  queueCloseButtons.forEach((button) => button.addEventListener('click', closeQueueSheet));
  queueDragZones.forEach((zone) => zone.addEventListener('pointerdown', startQueueDrag));
  window.addEventListener('pointermove', moveQueueDrag, { passive: false });
  window.addEventListener('pointermove', moveQueueReorder, { passive: false });
  window.addEventListener('pointerup', (event) => { finishQueueDrag(event); finishQueueReorder(event); });
  window.addEventListener('pointercancel', (event) => { finishQueueDrag(event, true); finishQueueReorder(event, true); });
  queueHandle?.addEventListener('click', () => {
    if (suppressQueueHandleClick) return;
    toggleQueueSheetState();
  });
  queueHandle?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleQueueSheetState();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setQueueSheetState('expanded');
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (queueSheetState === 'expanded') setQueueSheetState('collapsed');
      else closeQueueSheet();
    }
  });

  fullPlayerOpen?.addEventListener('click', (event) => {
    if (event.target.closest('input, button')) return;
    openFullPlayer();
  });
  fullPlayerOpen?.addEventListener('keydown', (event) => {
    if ((event.key === 'Enter' || event.key === ' ') && !event.target.closest('input, button')) {
      event.preventDefault();
      openFullPlayer();
    }
  });
  fullPlayerClose?.addEventListener('click', closeFullPlayer);
  fullPlayerToggle?.addEventListener('click', () => playerToggle?.click());
  fullPlayerPrev?.addEventListener('click', () => moveQueue(-1));
  fullPlayerNext?.addEventListener('click', () => moveQueue(1));
  fullPlayerSeek?.addEventListener('input', () => {
    if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) return;
    audio.currentTime = (Number(fullPlayerSeek.value) / 1000) * audio.duration;
  });
  fullPlayerLyricsToggle?.addEventListener('click', () => {
    fullPlayerLyricsExpanded = !fullPlayerLyricsExpanded;
    renderFullPlayer();
  });
  fullPlayerShuffle?.addEventListener('click', () => {
    fullPlayerShuffleActive = !fullPlayerShuffleActive;
    fullPlayerShuffle.classList.toggle('is-active', fullPlayerShuffleActive);
    showToast(fullPlayerShuffleActive ? '다음 재생부터 셔플을 적용해요' : '셔플을 해제했어요');
  });
  fullPlayerRepeat?.addEventListener('click', () => {
    if (!audio) return;
    audio.loop = !audio.loop;
    fullPlayerRepeat.classList.toggle('is-active', audio.loop);
    showToast(audio.loop ? '한 곡 반복을 켰어요' : '한 곡 반복을 껐어요');
  });

  playerPrev?.addEventListener('click', () => moveQueue(-1));
  playerNext?.addEventListener('click', () => moveQueue(1));

  playerSeek?.addEventListener('input', () => {
    if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) return;
    audio.currentTime = (Number(playerSeek.value) / 1000) * audio.duration;
  });

  audio?.addEventListener('play', () => {
    syncPlayButtons();
    if (!queueSheet?.hidden) renderQueueSheet();
    if (fullPlayer && !fullPlayer.hidden) renderFullPlayer();
  });
  audio?.addEventListener('pause', () => {
    syncPlayButtons();
    if (!queueSheet?.hidden) renderQueueSheet();
    if (fullPlayer && !fullPlayer.hidden) renderFullPlayer();
  });
  audio?.addEventListener('ended', () => moveQueue(1));
  audio?.addEventListener('loadedmetadata', () => {
    if (playerDuration) playerDuration.textContent = formatTime(audio.duration);
    if (fullPlayerDuration) fullPlayerDuration.textContent = formatTime(audio.duration);
  });
  audio?.addEventListener('timeupdate', () => {
    if (playerCurrent) playerCurrent.textContent = formatTime(audio.currentTime);
    if (fullPlayerCurrent) fullPlayerCurrent.textContent = formatTime(audio.currentTime);
    if (playerSeek && Number.isFinite(audio.duration) && audio.duration > 0) {
      const value = String(Math.round((audio.currentTime / audio.duration) * 1000));
      playerSeek.value = value;
      if (fullPlayerSeek) fullPlayerSeek.value = value;
    }
  });
  audio?.addEventListener('error', () => showToast('테스트 음원을 불러오지 못했어요'));

  const refreshQueueSheetMetrics = () => {
    if (queueSheet && !queueSheet.hidden) updateQueueSheetMetrics();
  };
  window.addEventListener('resize', refreshQueueSheetMetrics);
  window.visualViewport?.addEventListener('resize', refreshQueueSheetMetrics);

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (fullPlayer && !fullPlayer.hidden) closeFullPlayer();
    else if (queueSheet && !queueSheet.hidden) closeQueueSheet();
    else if (playlistFilterSheet && !playlistFilterSheet.hidden) setPlaylistFilterSheet(false);
    else if (filterSheet && !filterSheet.hidden) setFilterSheet(false);
    else if (detail && !detail.hidden) closeDetail();
  });

  renderFeatured();
  renderReleaseList();
  renderPlaylists();
  renderPlaylistSearchResults();
  renderPlaylistArchiveList();

  if (window.location.hash === '#playlists') {
    const playlistTab = viewButtons.find((button) => button.dataset.musicView === 'playlists');
    playlistTab?.click();
    window.requestAnimationFrame(() => playlistView?.scrollIntoView({ behavior: 'auto', block: 'start' }));
  }
})();
