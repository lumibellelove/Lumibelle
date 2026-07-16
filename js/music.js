(() => {
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
      tracks: [
        { title: 'Stardust Magical', artist: 'LUMIBELLE', duration: '03:46' },
        { title: 'Strawberry Love', artist: 'LUMIBELLE', duration: '03:21' },
        { title: '벚꽃타임', artist: 'LUMIBELLE', duration: '03:58' },
      ],
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
      tracks: [
        { title: '별자리 환상', artist: 'LUMIBELLE', duration: '--:--' },
        { title: '너에게로 가는 별', artist: 'LUMIBELLE', duration: '--:--' },
        { title: '전하지 못한 말', artist: 'LUMIBELLE', duration: '--:--' },
        { title: 'BALLAD TRACK', artist: 'LUMIBELLE', duration: '--:--' },
      ],
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
      tracks: [
        { title: 'Still', artist: 'LULU', duration: '--:--' },
        { title: 'Magical Present', artist: 'LULU', duration: '--:--' },
      ],
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
      tracks: [],
      links: [],
    },
  ];

  const playlists = [
    {
      id: 'live-setlist',
      kind: 'official',
      title: '루미벨 라이브 셋리스트',
      subtitle: 'LUMIBELLE LIVE SETLIST',
      description: '공연에서 선보인 곡을 무대 흐름대로 모아보는 공식 플레이리스트예요.',
      countLabel: '공연별 업데이트 예정',
      art: 'music-art--stardust',
      tracks: [],
      unit: 'LUMIBELLE',
    },
    {
      id: 'shining-morning',
      kind: 'official',
      title: '설레는 아침 러브송',
      subtitle: 'SHINING MORNING',
      description: '루미벨의 반짝이는 아침과 어울리는 곡을 모은 테마 플레이리스트예요.',
      countLabel: '선곡 준비 중',
      art: 'music-art--constellation',
      tracks: [],
      unit: 'LUMIBELLE OFFICIAL',
    },
    {
      id: 'mariring-pick',
      kind: 'member',
      member: 'MARIRING',
      title: '마리링의 반짝이는 하루 PICK',
      subtitle: 'MARIRING’S MUSIC ROOM',
      description: '무대에 오르기 전, 기분을 가장 반짝이게 만들어 주는 노래를 모으는 마리링의 추천 플리예요.',
      note: '“오늘도 빛나고 싶은 날 같이 들어요!”',
      color: '#ff59a5',
      soft: '#fff0f7',
      mark: 'M',
      tracks: [],
    },
    {
      id: 'lulu-pick',
      kind: 'member',
      member: 'LULU',
      title: '루루의 포근포근 토끼굴 PICK',
      subtitle: 'LULU’S MUSIC ROOM',
      description: '하루가 조금 지쳤을 때 포근하게 감싸주는 곡을 모으는 루루의 추천 플리예요.',
      note: '“루루랑 포근하게 쉬어가자!”',
      color: '#ef9fc0',
      soft: '#fff5f9',
      mark: 'L',
      tracks: [],
    },
    {
      id: 'iro-pick',
      kind: 'member',
      member: 'IRO',
      title: '이로의 컬러 체인지 PICK',
      subtitle: 'IRO’S MUSIC ROOM',
      description: '기분과 하루의 색을 완전히 바꾸고 싶을 때 듣는 곡을 모으는 이로의 추천 플리예요.',
      note: '“오늘은 어떤 색의 음악이 필요해?”',
      color: '#79b9e8',
      soft: '#eff8ff',
      mark: 'I',
      tracks: [],
    },
    {
      id: 'lunar-pick',
      kind: 'member',
      member: 'LUNAR',
      title: '루나의 달빛 아래 PICK',
      subtitle: 'LUNAR’S MUSIC ROOM',
      description: '밤과 달빛, 조용한 감정에 어울리는 곡을 모으는 루나의 추천 플리예요.',
      note: '“오늘 밤은 이 노래가 너를 비춰줄게.”',
      color: '#a887df',
      soft: '#f6f1ff',
      mark: 'L',
      tracks: [],
    },
  ];

  const viewButtons = Array.from(document.querySelectorAll('[data-music-view]'));
  const typeButtons = Array.from(document.querySelectorAll('[data-music-type]'));
  const memberButtons = Array.from(document.querySelectorAll('[data-music-member]'));
  const releaseView = document.querySelector('[data-music-release-view]');
  const playlistView = document.querySelector('[data-music-playlist-view]');
  const searchInput = document.querySelector('[data-music-search]');
  const sortTrigger = document.querySelector('[data-music-sort-trigger]');
  const sortMenu = document.querySelector('[data-music-sort-menu]');
  const sortLabel = document.querySelector('[data-music-sort-label]');
  const featuredRoot = document.querySelector('[data-music-featured]');
  const featuredTracksRoot = document.querySelector('[data-featured-tracks]');
  const releaseList = document.querySelector('[data-music-release-list]');
  const releaseCount = document.querySelector('[data-music-count]');
  const emptyState = document.querySelector('[data-music-empty]');
  const officialPlaylistsRoot = document.querySelector('[data-official-playlists]');
  const memberPicksRoot = document.querySelector('[data-member-picks]');
  const detail = document.querySelector('[data-music-detail]');
  const detailDialog = detail?.querySelector('.music-detail-dialog');
  const detailTitle = document.querySelector('[data-detail-title]');
  const detailEyebrow = document.querySelector('[data-detail-eyebrow]');
  const detailArt = document.querySelector('[data-detail-art]');
  const detailMeta = document.querySelector('[data-detail-meta]');
  const detailDescription = document.querySelector('[data-detail-description]');
  const detailNote = document.querySelector('[data-detail-note]');
  const detailInfo = document.querySelector('[data-detail-info]');
  const detailTracks = document.querySelector('[data-detail-tracks]');
  const detailLinks = document.querySelector('[data-detail-links]');
  const toast = document.querySelector('[data-music-toast]');

  let activeType = 'ALL';
  let activeMember = 'ALL';
  let activeSort = 'latest';
  let lastDetailTrigger = null;
  let toastTimer = 0;

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

  function formatReleaseDate(release) {
    return release.releaseLabel || release.releaseDate.replaceAll('-', '.');
  }

  function renderFeatured() {
    const featured = releases.find((release) => release.featured) || releases[0];
    if (!featured || !featuredRoot || !featuredTracksRoot) return;

    featuredRoot.innerHTML = `
      <span class="music-featured-art music-art ${escapeHtml(featured.art)}" aria-hidden="true"></span>
      <div class="music-featured-copy">
        <span>추천 신곡</span>
        <p>${escapeHtml(featured.eyebrow)}</p>
        <h2 id="music-featured-title">${escapeHtml(featured.title)}</h2>
        <div class="music-featured-meta"><span>${escapeHtml(formatReleaseDate(featured))}</span><span>총 ${featured.tracks.length}곡</span></div>
      </div>
      <div class="music-featured-actions">
        <button class="music-featured-listen" type="button" data-release-listen="${escapeHtml(featured.id)}">음원 듣기</button>
        <button class="music-featured-detail" type="button" data-release-detail="${escapeHtml(featured.id)}">앨범 상세</button>
      </div>`;

    featuredTracksRoot.innerHTML = featured.tracks.map((track, index) => `
      <article class="music-track-row">
        <span class="music-track-art music-art ${escapeHtml(featured.art)}" aria-hidden="true"></span>
        <b>${String(index + 1).padStart(2, '0')}</b>
        <div class="music-track-copy"><strong>${escapeHtml(track.title)}</strong><small>${escapeHtml(track.artist)}</small></div>
        <time>${escapeHtml(track.duration)}</time>
        <button class="music-track-listen" type="button" data-track-listen="${escapeHtml(track.title)}" aria-label="${escapeHtml(track.title)} 듣기"></button>
      </article>`).join('');
  }

  function getFilteredReleases() {
    const query = String(searchInput?.value || '').trim().toLocaleLowerCase('ko-KR');
    const filtered = releases.filter((release) => {
      const typeMatch = activeType === 'ALL' || release.type === activeType;
      const memberMatch = activeMember === 'ALL' || release.members.includes(activeMember);
      const searchText = [release.title, release.subtitle, release.type, ...release.members].join(' ').toLocaleLowerCase('ko-KR');
      return typeMatch && memberMatch && (!query || searchText.includes(query));
    });

    return filtered.sort((first, second) => {
      if (activeSort === 'title') return first.title.localeCompare(second.title, 'ko-KR');
      if (activeSort === 'tracks') return second.tracks.length - first.tracks.length;
      return new Date(second.releaseDate).getTime() - new Date(first.releaseDate).getTime();
    });
  }

  function renderReleaseList() {
    if (!releaseList) return;
    const filtered = getFilteredReleases();
    releaseList.innerHTML = filtered.map((release) => `
      <article class="music-release-card">
        <button type="button" data-release-detail="${escapeHtml(release.id)}">
          <span class="music-release-art music-art ${escapeHtml(release.art)}" aria-hidden="true"><em>${escapeHtml(release.status)}</em></span>
          <span class="music-release-copy">
            <small>${escapeHtml(release.eyebrow)} · ${escapeHtml(formatReleaseDate(release))}</small>
            <strong>${escapeHtml(release.title)}</strong>
            <p>${escapeHtml(release.subtitle)}</p>
            <span>${escapeHtml(release.type)} · ${release.tracks.length ? `${release.tracks.length} TRACKS` : 'ARCHIVE'}</span>
          </span>
          <i class="music-release-arrow" aria-hidden="true"></i>
        </button>
      </article>`).join('');

    if (releaseCount) releaseCount.textContent = String(filtered.length);
    if (emptyState) emptyState.hidden = filtered.length > 0;
  }

  function renderPlaylists() {
    if (officialPlaylistsRoot) {
      officialPlaylistsRoot.innerHTML = playlists.filter((playlist) => playlist.kind === 'official').map((playlist) => `
        <article class="music-official-card">
          <button type="button" data-playlist-detail="${escapeHtml(playlist.id)}">
            <span class="music-playlist-art music-art ${escapeHtml(playlist.art)}" aria-hidden="true"></span>
            <span class="music-official-copy"><strong>${escapeHtml(playlist.title)}</strong><small>${escapeHtml(playlist.subtitle)}</small><span>${escapeHtml(playlist.countLabel)}</span></span>
            <i class="music-release-arrow" aria-hidden="true"></i>
          </button>
        </article>`).join('');
    }

    if (memberPicksRoot) {
      memberPicksRoot.innerHTML = playlists.filter((playlist) => playlist.kind === 'member').map((playlist) => `
        <article class="music-member-card" style="--member-color:${escapeHtml(playlist.color)};--member-soft:${escapeHtml(playlist.soft)}">
          <button type="button" data-playlist-detail="${escapeHtml(playlist.id)}">
            <span class="music-member-mark" aria-hidden="true">${escapeHtml(playlist.mark)}</span>
            <strong>${escapeHtml(playlist.title)}</strong>
            <small>${escapeHtml(playlist.subtitle)}</small>
            <p>${escapeHtml(playlist.description)}</p>
            <span>추천곡 준비 중</span>
          </button>
        </article>`).join('');
    }
  }

  function renderInfoRows(rows) {
    if (!detailInfo) return;
    detailInfo.innerHTML = rows.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('');
  }

  function renderDetailTracks(tracks) {
    if (!detailTracks) return;
    const list = tracks.length ? tracks : [{ title: '추천곡 등록 예정', artist: '공개 준비 중', duration: '--:--' }];
    detailTracks.innerHTML = list.map((track, index) => `
      <article class="music-detail-track">
        <b>${String(index + 1).padStart(2, '0')}</b>
        <div><strong>${escapeHtml(track.title)}</strong><small>${escapeHtml(track.artist)}</small></div>
        <time>${escapeHtml(track.duration || '--:--')}</time>
      </article>`).join('');
  }

  function renderPlatformLinks(links) {
    if (!detailLinks) return;
    const platforms = ['YOUTUBE MUSIC', 'MELON', 'SPOTIFY', 'APPLE MUSIC'];
    detailLinks.innerHTML = platforms.map((platform) => {
      const url = links?.find((link) => link.platform === platform)?.url;
      return url
        ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${platform}</a>`
        : `<button type="button" data-platform-pending>${platform}</button>`;
    }).join('');
  }

  function openReleaseDetail(id, trigger) {
    const release = releases.find((item) => item.id === id);
    if (!release || !detail || !detailTitle || !detailEyebrow || !detailArt || !detailMeta || !detailDescription || !detailNote) return;

    lastDetailTrigger = trigger || null;
    detail.style.removeProperty('--detail-accent');
    detail.style.removeProperty('--detail-soft');
    detailTitle.textContent = release.title;
    detailEyebrow.textContent = release.eyebrow;
    detailArt.className = `music-detail-art music-art ${release.art}`;
    detailMeta.textContent = `${formatReleaseDate(release)} · ${release.tracks.length} TRACKS`;
    detailDescription.textContent = release.description;
    detailNote.hidden = true;
    renderInfoRows([
      ['UNIT', release.unit],
      ['MEMBER', release.members.join(' · ')],
      ['CREDIT', release.credit],
    ]);
    renderDetailTracks(release.tracks);
    renderPlatformLinks(release.links);
    detail.hidden = false;
    document.body.classList.add('music-detail-open');
    window.setTimeout(() => detailDialog?.focus({ preventScroll: true }), 0);
  }

  function openPlaylistDetail(id, trigger) {
    const playlist = playlists.find((item) => item.id === id);
    if (!playlist || !detail || !detailTitle || !detailEyebrow || !detailArt || !detailMeta || !detailDescription || !detailNote) return;

    lastDetailTrigger = trigger || null;
    detail.style.setProperty('--detail-accent', playlist.color || '#ed6fa2');
    detail.style.setProperty('--detail-soft', playlist.soft || '#fff0f6');
    detailTitle.textContent = playlist.title;
    detailEyebrow.textContent = playlist.subtitle;
    detailArt.className = `music-detail-art music-art ${playlist.art || 'music-art--cover'}`;
    detailMeta.textContent = playlist.kind === 'member' ? `${playlist.member} · MEMBER'S PICK` : playlist.countLabel;
    detailDescription.textContent = playlist.description;
    detailNote.hidden = !playlist.note;
    detailNote.textContent = playlist.note || '';
    renderInfoRows([
      ['CURATOR', playlist.member || playlist.unit],
      ['TYPE', playlist.kind === 'member' ? 'MEMBER PICK' : 'OFFICIAL PLAYLIST'],
      ['STATUS', playlist.tracks.length ? `${playlist.tracks.length} TRACKS` : '추천곡 준비 중'],
    ]);
    renderDetailTracks(playlist.tracks);
    renderPlatformLinks([]);
    detail.hidden = false;
    document.body.classList.add('music-detail-open');
    window.setTimeout(() => detailDialog?.focus({ preventScroll: true }), 0);
  }

  function closeDetail() {
    if (!detail || detail.hidden) return;
    detail.hidden = true;
    document.body.classList.remove('music-detail-open');
    lastDetailTrigger?.focus();
    lastDetailTrigger = null;
  }

  viewButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setActive(viewButtons, button);
      const playlistMode = button.dataset.musicView === 'playlists';
      if (releaseView) releaseView.hidden = playlistMode;
      if (playlistView) playlistView.hidden = !playlistMode;
    });
  });

  typeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activeType = button.dataset.musicType || 'ALL';
      setActive(typeButtons, button);
      renderReleaseList();
    });
  });

  memberButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activeMember = button.dataset.musicMember || 'ALL';
      setActive(memberButtons, button);
      renderReleaseList();
    });
  });

  searchInput?.addEventListener('input', renderReleaseList);

  sortTrigger?.addEventListener('click', () => {
    if (!sortMenu) return;
    const open = sortMenu.hidden;
    sortMenu.hidden = !open;
    sortTrigger.setAttribute('aria-expanded', String(open));
  });

  sortMenu?.querySelectorAll('[data-music-sort]').forEach((button) => {
    button.addEventListener('click', () => {
      activeSort = button.dataset.musicSort || 'latest';
      sortMenu.querySelectorAll('[data-music-sort]').forEach((option) => option.classList.toggle('is-active', option === button));
      if (sortLabel) sortLabel.textContent = button.textContent || '최신순';
      sortMenu.hidden = true;
      sortTrigger?.setAttribute('aria-expanded', 'false');
      renderReleaseList();
    });
  });

  document.addEventListener('click', (event) => {
    const releaseButton = event.target.closest('[data-release-detail]');
    if (releaseButton) {
      openReleaseDetail(releaseButton.dataset.releaseDetail, releaseButton);
      return;
    }

    const playlistButton = event.target.closest('[data-playlist-detail]');
    if (playlistButton) {
      openPlaylistDetail(playlistButton.dataset.playlistDetail, playlistButton);
      return;
    }

    if (event.target.closest('[data-featured-detail]')) {
      const featured = releases.find((release) => release.featured) || releases[0];
      openReleaseDetail(featured.id, event.target.closest('[data-featured-detail]'));
      return;
    }

    if (event.target.closest('[data-release-listen], [data-track-listen]')) {
      showToast('실제 음원과 스트리밍 링크 연결 전입니다');
      return;
    }

    if (event.target.closest('[data-platform-pending]')) {
      showToast('스트리밍 링크 연결 전입니다');
      return;
    }

    if (sortMenu && sortTrigger && !sortMenu.hidden && !sortMenu.contains(event.target) && !sortTrigger.contains(event.target)) {
      sortMenu.hidden = true;
      sortTrigger.setAttribute('aria-expanded', 'false');
    }
  });

  document.querySelectorAll('[data-music-detail-close]').forEach((button) => button.addEventListener('click', closeDetail));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && detail && !detail.hidden) closeDetail();
  });

  renderFeatured();
  renderReleaseList();
  renderPlaylists();
})();
