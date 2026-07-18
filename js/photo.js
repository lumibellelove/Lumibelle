(() => {
  'use strict';

  const photos = [
    {
      id: 'debut-stage-light',
      src: '',
      thumb: '',
      title: '루미벨 데뷔 무대의 첫 빛',
      description: '처음 마주한 무대 위에서 가장 반짝였던 순간.',
      date: '2026-07-12',
      category: 'STAGE',
      categoryLabel: '무대',
      member: ['MARIRING', 'LULU'],
      memberLabel: 'LUMIBELLE',
      location: '상상마당 홍대 라이브홀',
      likes: 244,
      downloadUrl: '',
      albumId: 'debut-live',
      isPick: true,
      isNew: true
    },
    {
      id: 'mariring-ending',
      src: '',
      thumb: '',
      title: '마리링 엔딩 포즈',
      description: '데뷔 무대의 마지막을 장식한 마리링의 포즈.',
      date: '2026-07-12',
      category: 'FOCUS',
      categoryLabel: '직캠',
      member: ['MARIRING'],
      memberLabel: 'MARIRING',
      location: '상상마당 홍대 라이브홀',
      likes: 219,
      downloadUrl: '',
      albumId: 'debut-live',
      isPick: false,
      isNew: true
    },
    {
      id: 'lulu-smile',
      src: '',
      thumb: '',
      title: '루루의 포근한 미소',
      description: '루루가 팬들을 바라보며 남긴 포근한 순간.',
      date: '2026-07-12',
      category: 'FOCUS',
      categoryLabel: '직캠',
      member: ['LULU'],
      memberLabel: 'LULU',
      location: '상상마당 홍대 라이브홀',
      likes: 265,
      downloadUrl: '',
      albumId: 'debut-live',
      isPick: false,
      isNew: true
    },
    {
      id: 'debut-cheering',
      src: '',
      thumb: '',
      title: '응원봉으로 물든 객석',
      description: '루미나의 빛으로 가득 찬 데뷔 라이브 객석.',
      date: '2026-07-12',
      category: 'FANCAM',
      categoryLabel: '팬캠',
      member: ['MARIRING', 'LULU'],
      memberLabel: 'LUMIBELLE',
      location: '상상마당 홍대 라이브홀',
      likes: 301,
      downloadUrl: '',
      albumId: 'debut-live',
      isPick: true,
      isNew: true
    },
    {
      id: 'mariring-backstage',
      src: '',
      thumb: '',
      title: '마리링 무대 전 준비',
      description: '무대에 오르기 전 마지막으로 마음을 다잡는 순간.',
      date: '2026-07-11',
      category: 'BEHIND',
      categoryLabel: '비하인드',
      member: ['MARIRING'],
      memberLabel: 'MARIRING',
      location: '대기실',
      likes: 187,
      downloadUrl: '',
      albumId: 'debut-behind',
      isPick: false,
      isNew: true
    },
    {
      id: 'lulu-backstage',
      src: '',
      thumb: '',
      title: '루루 리허설 비하인드',
      description: '첫 무대를 앞두고 동선을 확인하는 루루.',
      date: '2026-07-11',
      category: 'BEHIND',
      categoryLabel: '비하인드',
      member: ['LULU'],
      memberLabel: 'LULU',
      location: '무대 뒤',
      likes: 198,
      downloadUrl: '',
      albumId: 'debut-behind',
      isPick: false,
      isNew: true
    },
    {
      id: 'team-stage',
      src: '',
      thumb: '',
      title: '두 사람의 첫 팀 무대',
      description: '마리링과 루루가 함께 완성한 첫 팀 무대.',
      date: '2026-07-12',
      category: 'STAGE',
      categoryLabel: '무대',
      member: ['MARIRING', 'LULU'],
      memberLabel: 'LUMIBELLE',
      location: '상상마당 홍대 라이브홀',
      likes: 284,
      downloadUrl: '',
      albumId: 'debut-live',
      isPick: false,
      isNew: true
    },
    {
      id: 'fan-view-stage',
      src: '',
      thumb: '',
      title: '루미나가 바라본 첫 무대',
      description: '객석에서 담아낸 루미벨의 첫 번째 페이지.',
      date: '2026-07-12',
      category: 'FANCAM',
      categoryLabel: '팬캠',
      member: ['MARIRING', 'LULU'],
      memberLabel: 'LUMIBELLE',
      location: '상상마당 홍대 라이브홀',
      likes: 231,
      downloadUrl: '',
      albumId: 'debut-live',
      isPick: false,
      isNew: true
    }
  ];

  const pickMount = document.querySelector('[data-photo-pick]');
  const grid = document.querySelector('[data-photo-grid]');
  const resultCount = document.querySelector('[data-photo-result-count]');
  const emptyState = document.querySelector('[data-photo-empty]');
  const loadMoreButton = document.querySelector('[data-photo-load-more]');
  const loadMoreLabel = document.querySelector('[data-photo-load-more-label]');
  const searchInput = document.querySelector('[data-photo-search]');
  const categoryButtons = Array.from(document.querySelectorAll('[data-photo-collection]'));
  const memberButtons = Array.from(document.querySelectorAll('[data-photo-member]'));
  const sortControl = document.querySelector('[data-photo-sort-control]');
  const sortTrigger = document.querySelector('[data-photo-sort-trigger]');
  const sortLabel = document.querySelector('[data-photo-sort-label]');
  const sortMenu = document.querySelector('[data-photo-sort-menu]');
  const sortOptions = Array.from(document.querySelectorAll('[data-photo-sort-option]'));
  const sortNative = document.querySelector('[data-photo-sort]');
  const filterOpen = document.querySelector('[data-photo-filter-open]');
  const filterCount = document.querySelector('[data-photo-filter-count]');
  const filterOverlay = document.querySelector('[data-photo-filter-overlay]');
  const filterSheet = document.querySelector('[data-photo-filter-sheet]');
  const filterClose = document.querySelector('[data-photo-filter-close]');
  const filterReset = document.querySelector('[data-photo-filter-reset]');
  const filterApply = document.querySelector('[data-photo-filter-apply]');

  const viewer = document.querySelector('[data-photo-viewer]');
  const viewerBackdrop = document.querySelector('[data-photo-viewer-backdrop]');
  const viewerDialog = document.querySelector('[data-photo-viewer-dialog]');
  const viewerStage = document.querySelector('[data-photo-viewer-stage]');
  const viewerImage = document.querySelector('[data-photo-viewer-image]');
  const viewerEmpty = document.querySelector('.photo-viewer-empty');
  const viewerClose = document.querySelector('[data-photo-viewer-close]');
  const viewerCurrent = document.querySelector('[data-photo-viewer-current]');
  const viewerTotal = document.querySelector('[data-photo-viewer-total]');
  const viewerLike = document.querySelector('[data-photo-viewer-like]');
  const viewerShare = document.querySelector('[data-photo-viewer-share]');
  const viewerPrev = document.querySelector('[data-photo-viewer-prev]');
  const viewerNext = document.querySelector('[data-photo-viewer-next]');
  const viewerDate = document.querySelector('[data-photo-viewer-date]');
  const viewerCategory = document.querySelector('[data-photo-viewer-category]');
  const viewerTitle = document.querySelector('[data-photo-viewer-title]');
  const viewerDescription = document.querySelector('[data-photo-viewer-description]');
  const viewerDownload = document.querySelector('[data-photo-viewer-download]');
  const viewerThumbs = document.querySelector('[data-photo-viewer-thumbs]');

  if (!pickMount || !grid) return;

  const initialVisible = 4;
  let visibleLimit = initialVisible;
  let activeCategory = 'ALL';
  let activeMember = 'ALL';
  let activePeriod = 'ALL';
  let activeSort = 'latest';
  let currentResults = photos.slice();
  let viewerItems = photos.slice();
  let viewerIndex = 0;
  let savedScrollY = 0;
  let lastFocused = null;
  let touchStartX = 0;
  let touchStartY = 0;
  let suppressStageToggle = false;


  const memberAliases = {
    MARIRING: '마리링',
    LULU: '루루',
    IRO: '이로',
    LUNAR: '루나'
  };

  function normalize(value) {
    return String(value || '').trim().toLocaleLowerCase('ko-KR');
  }

  function formatDate(value) {
    return String(value || '').replaceAll('-', '.');
  }

  function formatCount(value) {
    const count = Math.max(0, Number(value) || 0);
    if (count >= 1000) return `${(count / 1000).toFixed(count >= 10000 ? 0 : 1).replace(/\.0$/, '')}K`;
    return String(Math.round(count));
  }

  function imageMarkup(item, className, alt = '') {
    if (!item.src) return '';
    return `<img alt="${alt}" class="${className}" decoding="async" loading="lazy" src="${item.src}"/>`;
  }

  function renderPick() {
    const pick = photos.find((item) => item.isPick) || photos[0];
    const albumCount = photos.filter((item) => item.albumId === pick.albumId).length;
    pickMount.innerHTML = `
      <article class="photo-pick-card">
        <div class="photo-pick-media">
          ${imageMarkup(pick, 'photo-pick-image', '')}
          <span aria-hidden="true" class="photo-pick-ribbon"><b>PICK</b></span>
        </div>
        <div class="photo-pick-copy">
          <p class="photo-pick-kicker">
            <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m4 8 4.2 3.1L12 5l3.8 6.1L20 8l-1.4 9H5.4L4 8Z"></path><path d="M5.4 19h13.2"></path></svg>
            <span>오늘의 순간</span>
          </p>
          <h2 id="photo-pick-title">${pick.title}</h2>
          <p class="photo-pick-description">${pick.description}</p>
          <span aria-hidden="true" class="photo-pick-divider"></span>
          <div class="photo-pick-meta">
            <span>
              <svg aria-hidden="true" viewBox="0 0 24 24"><rect height="15" rx="2.5" width="17" x="3.5" y="5.5"></rect><path d="M7.5 3.5v4M16.5 3.5v4M3.5 9.5h17"></path><path d="M8 13h2M14 13h2M8 17h2M14 17h2"></path></svg>
              <time datetime="${pick.date}">${formatDate(pick.date)}</time>
            </span>
            <span>
              <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z"></path><circle cx="12" cy="10" r="2.2"></circle></svg>
              <span>${pick.location}</span>
            </span>
            <span>
              <svg aria-hidden="true" viewBox="0 0 24 24"><rect x="3" y="6.5" width="18" height="13" rx="2.8"></rect><path d="m8 6.5 1.5-2h5L16 6.5"></path><circle cx="12" cy="13" r="3.2"></circle></svg>
              <span>${albumCount}장</span>
            </span>
          </div>
          <button class="photo-pick-open" data-photo-open="${pick.id}" type="button"><span>자세히 보기</span><i aria-hidden="true">›</i></button>
        </div>
      </article>`;
  }

  function cardMarkup(item) {
    const badges = [
      item.isNew ? '<b class="video-badge video-badge--new">NEW</b>' : '',
      item.isPick ? '<b class="video-badge video-badge--pick">PICK</b>' : ''
    ].join('');

    return `
      <article class="video-card photo-card" data-photo-id="${item.id}">
        <button aria-label="${item.title} 사진 보기" class="video-card-open" data-photo-open="${item.id}" type="button">
          <span class="video-card-media photo-card-media">
            ${imageMarkup(item, 'photo-card-image', '')}
            <span class="video-card-badges">${badges}</span>
          </span>
          <span class="video-card-body">
            <strong>${item.title}</strong>
            <span class="video-card-stats">
              <time class="photo-card-date" datetime="${item.date}">
                <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"></circle><path d="M12 7.5v5l3 1.8"></path></svg>
                <span>${formatDate(item.date)}</span>
              </time>
              <span class="video-card-stat photo-card-like">
                <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 20.5S4 15.7 4 9.6C4 6.5 6 4.5 8.7 4.5c1.6 0 2.8.8 3.3 1.8.5-1 1.7-1.8 3.3-1.8C18 4.5 20 6.5 20 9.6c0 6.1-8 10.9-8 10.9Z"></path></svg>
                <span>${formatCount(item.likes)}</span>
              </span>
            </span>
          </span>
        </button>
      </article>`;
  }

  function matches(item) {
    const query = normalize(searchInput?.value);
    const searchable = normalize([
      item.title,
      item.description,
      item.categoryLabel,
      item.memberLabel,
      item.location,
      item.member.join(' '),
      item.member.map((member) => memberAliases[member] || '').join(' ')
    ].join(' '));

    const published = new Date(`${item.date}T00:00:00+09:00`);
    const days = Number(activePeriod);
    const periodMatches = activePeriod === 'ALL' || (
      !Number.isNaN(published.getTime()) &&
      Date.now() - published.getTime() >= 0 &&
      Date.now() - published.getTime() <= days * 24 * 60 * 60 * 1000
    );

    return (
      (!query || searchable.includes(query)) &&
      (activeCategory === 'ALL' || item.category === activeCategory) &&
      (activeMember === 'ALL' || item.member.includes(activeMember)) &&
      periodMatches
    );
  }

  function sortItems(items) {
    return items.slice().sort((a, b) => {
      if (activeSort === 'popular') return b.likes - a.likes;
      if (activeSort === 'recommended') return Number(b.isPick) - Number(a.isPick) || b.likes - a.likes;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }

  function renderFilterCount() {
    if (!filterCount) return;
    const count = activePeriod === 'ALL' ? 0 : 1;
    filterCount.textContent = String(count);
    filterCount.hidden = count === 0;
  }

  function renderResults(resetLimit = false) {
    if (resetLimit) visibleLimit = initialVisible;
    currentResults = sortItems(photos.filter(matches));
    viewerItems = currentResults.length ? currentResults : photos.slice();
    const visible = currentResults.slice(0, visibleLimit);

    grid.innerHTML = visible.map(cardMarkup).join('');
    if (resultCount) resultCount.textContent = String(currentResults.length);
    if (emptyState) emptyState.hidden = currentResults.length !== 0;
    if (loadMoreButton) {
      const canExpand = currentResults.length > visibleLimit;
      const canCollapse = visibleLimit > initialVisible && currentResults.length > initialVisible;
      loadMoreButton.hidden = !canExpand && !canCollapse;
      loadMoreButton.setAttribute('aria-expanded', String(canCollapse && !canExpand));
      if (loadMoreLabel) loadMoreLabel.textContent = canExpand ? '사진 더보기' : '접기';
    }
    renderFilterCount();
  }

  function setPressed(buttons, activeButton) {
    buttons.forEach((button) => {
      const active = button === activeButton;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function openFilter() {
    if (!filterSheet || !filterOverlay) return;
    filterSheet.hidden = false;
    filterOverlay.hidden = false;
    filterOpen?.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(() => filterSheet.classList.add('is-open'));
  }

  function closeFilter() {
    if (!filterSheet || !filterOverlay) return;
    filterSheet.classList.remove('is-open');
    filterSheet.hidden = true;
    filterOverlay.hidden = true;
    filterOpen?.setAttribute('aria-expanded', 'false');
  }

  function syncFilterInputs() {
    const category = filterSheet?.querySelector(`input[name="photo-category"][value="${activeCategory}"]`);
    const period = filterSheet?.querySelector(`input[name="photo-period"][value="${activePeriod}"]`);
    if (category) category.checked = true;
    if (period) period.checked = true;
  }

  function applyFilterSheet() {
    activeCategory = filterSheet?.querySelector('input[name="photo-category"]:checked')?.value || 'ALL';
    activePeriod = filterSheet?.querySelector('input[name="photo-period"]:checked')?.value || 'ALL';
    const categoryButton = categoryButtons.find((button) => button.dataset.photoCollection === activeCategory);
    if (categoryButton) setPressed(categoryButtons, categoryButton);
    renderResults(true);
    closeFilter();
  }

  function buildPhotoShareUrl(item) {
    const url = new URL(window.location.href);
    url.searchParams.set('photo', item.id);
    url.hash = '';
    return url.toString();
  }

  async function copyShareUrl(url) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(url);
      return;
    }

    const input = document.createElement('textarea');
    input.value = url;
    input.setAttribute('readonly', '');
    input.style.position = 'fixed';
    input.style.opacity = '0';
    input.style.pointerEvents = 'none';
    document.body.appendChild(input);
    input.select();
    const copied = document.execCommand('copy');
    input.remove();
    if (!copied) throw new Error('Clipboard copy failed');
  }

  function renderViewerThumbs() {
    if (!viewerThumbs) return;
    viewerThumbs.innerHTML = viewerItems.map((item, index) => `
      <button aria-label="${index + 1}번째 사진: ${item.title}" class="photo-viewer-thumb${index === viewerIndex ? ' is-active' : ''}" data-photo-thumb-index="${index}" type="button">
        ${item.thumb ? `<img alt="" decoding="async" loading="lazy" src="${item.thumb}"/>` : ''}
      </button>`).join('');
  }

  function renderViewer() {
    const item = viewerItems[viewerIndex];
    if (!item) return;

    if (viewerCurrent) viewerCurrent.textContent = String(viewerIndex + 1);
    if (viewerTotal) viewerTotal.textContent = String(viewerItems.length);
    if (viewerDate) {
      viewerDate.dateTime = item.date;
      viewerDate.textContent = formatDate(item.date);
    }
    if (viewerCategory) viewerCategory.textContent = item.categoryLabel;
    if (viewerTitle) viewerTitle.textContent = item.title;
    if (viewerDescription) viewerDescription.textContent = item.description;
    if (viewerLike) viewerLike.setAttribute('aria-pressed', String(Boolean(item.liked)));
    if (viewerPrev) viewerPrev.disabled = viewerIndex === 0;
    if (viewerNext) viewerNext.disabled = viewerIndex === viewerItems.length - 1;
    if (viewerDownload) {
      const canDownload = Boolean(item.downloadUrl);
      viewerDownload.disabled = !canDownload;
      viewerDownload.setAttribute('aria-disabled', String(!canDownload));
      viewerDownload.setAttribute('aria-label', canDownload ? `${item.title} 다운로드` : '다운로드 준비 중');
    }

    if (viewerImage && viewerEmpty) {
      if (item.src) {
        viewerImage.src = item.src;
        viewerImage.alt = item.title;
        viewerImage.hidden = false;
        viewerEmpty.hidden = true;
      } else {
        viewerImage.removeAttribute('src');
        viewerImage.alt = '';
        viewerImage.hidden = true;
        viewerEmpty.hidden = false;
      }
    }

    renderViewerThumbs();
    const activeThumb = viewerThumbs?.querySelector('.is-active');
    activeThumb?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  function lockPage() {
    savedScrollY = window.scrollY;
    document.body.classList.add('photo-viewer-open');
    document.body.style.position = 'fixed';
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.width = '100%';
  }

  function unlockPage() {
    document.body.classList.remove('photo-viewer-open');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, savedScrollY);
  }

  function openViewer(id) {
    const source = currentResults.some((item) => item.id === id)
      ? currentResults
      : photos;
    const requestedIndex = source.findIndex((item) => item.id === id);
    viewerItems = source.slice();
    viewerIndex = requestedIndex >= 0 ? requestedIndex : 0;
    lastFocused = document.activeElement;
    viewerDialog?.classList.remove('is-ui-hidden');
    if (viewer) viewer.hidden = false;
    lockPage();
    renderViewer();
    viewerDialog?.focus();
  }

  function closeViewer() {
    if (!viewer || viewer.hidden) return;
    viewer.hidden = true;
    viewerDialog?.classList.remove('is-ui-hidden');
    unlockPage();
    if (lastFocused instanceof HTMLElement) lastFocused.focus();
  }

  function moveViewer(step) {
    const next = viewerIndex + step;
    if (next < 0 || next >= viewerItems.length) return;
    viewerIndex = next;
    renderViewer();
  }

  renderPick();
  renderResults();

  const sharedPhotoId = new URLSearchParams(window.location.search).get('photo');
  if (sharedPhotoId && photos.some((item) => item.id === sharedPhotoId)) {
    requestAnimationFrame(() => openViewer(sharedPhotoId));
  }

  categoryButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activeCategory = button.dataset.photoCollection || 'ALL';
      setPressed(categoryButtons, button);
      syncFilterInputs();
      renderResults(true);
    });
  });

  memberButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activeMember = button.dataset.photoMember || 'ALL';
      setPressed(memberButtons, button);
      renderResults(true);
    });
  });

  searchInput?.addEventListener('input', () => renderResults(true));

  loadMoreButton?.addEventListener('click', () => {
    if (visibleLimit < currentResults.length) visibleLimit += 4;
    else visibleLimit = initialVisible;
    renderResults();
  });

  sortTrigger?.addEventListener('click', () => {
    const opening = sortMenu?.hidden !== false;
    if (sortMenu) sortMenu.hidden = !opening;
    sortControl?.classList.toggle('is-open', opening);
    sortTrigger.setAttribute('aria-expanded', String(opening));
  });

  sortOptions.forEach((option) => {
    option.addEventListener('click', () => {
      activeSort = option.dataset.value || 'latest';
      sortOptions.forEach((item) => item.setAttribute('aria-selected', String(item === option)));
      if (sortLabel) sortLabel.textContent = option.textContent.trim();
      if (sortNative) sortNative.value = activeSort;
      if (sortMenu) sortMenu.hidden = true;
      sortControl?.classList.remove('is-open');
      sortTrigger?.setAttribute('aria-expanded', 'false');
      renderResults(true);
    });
  });

  document.addEventListener('click', (event) => {
    if (!sortControl?.contains(event.target)) {
      if (sortMenu) sortMenu.hidden = true;
      sortControl?.classList.remove('is-open');
      sortTrigger?.setAttribute('aria-expanded', 'false');
    }

    const openButton = event.target.closest('[data-photo-open]');
    if (openButton) openViewer(openButton.dataset.photoOpen);

    const thumb = event.target.closest('[data-photo-thumb-index]');
    if (thumb) {
      viewerIndex = Number(thumb.dataset.photoThumbIndex) || 0;
      renderViewer();
    }
  });

  filterOpen?.addEventListener('click', () => {
    syncFilterInputs();
    openFilter();
  });
  filterClose?.addEventListener('click', closeFilter);
  filterOverlay?.addEventListener('click', closeFilter);
  filterApply?.addEventListener('click', applyFilterSheet);
  filterReset?.addEventListener('click', () => {
    filterSheet?.querySelector('input[name="photo-category"][value="ALL"]')?.click();
    filterSheet?.querySelector('input[name="photo-period"][value="ALL"]')?.click();
  });

  viewerClose?.addEventListener('click', (event) => {
    event.stopPropagation();
    closeViewer();
  });
  viewerBackdrop?.addEventListener('click', closeViewer);
  viewerPrev?.addEventListener('click', (event) => {
    event.stopPropagation();
    moveViewer(-1);
  });
  viewerNext?.addEventListener('click', (event) => {
    event.stopPropagation();
    moveViewer(1);
  });
  viewerLike?.addEventListener('click', (event) => {
    event.stopPropagation();
    const item = viewerItems[viewerIndex];
    if (!item) return;
    item.liked = !item.liked;
    viewerLike.setAttribute('aria-pressed', String(item.liked));
  });
  viewerShare?.addEventListener('click', async (event) => {
    event.stopPropagation();
    const item = viewerItems[viewerIndex];
    if (!item) return;

    const shareData = {
      title: `${item.title} | LUMIBELLE PHOTO`,
      text: item.description || '',
      url: buildPhotoShareUrl(item)
    };

    try {
      if (typeof navigator.share === 'function') {
        await navigator.share(shareData);
        return;
      }
      await copyShareUrl(shareData.url);
    } catch (error) {
      if (error?.name === 'AbortError') return;
      try {
        await copyShareUrl(shareData.url);
      } catch (copyError) {
        console.warn('PHOTO share failed', copyError);
      }
    }
  });
  viewerDownload?.addEventListener('click', (event) => {
    event.stopPropagation();
    const item = viewerItems[viewerIndex];
    if (!item?.downloadUrl) return;
    const anchor = document.createElement('a');
    anchor.href = item.downloadUrl;
    anchor.download = '';
    anchor.click();
  });

  viewerStage?.addEventListener('click', (event) => {
    if (event.target.closest('button')) return;
    if (suppressStageToggle) {
      suppressStageToggle = false;
      return;
    }
    viewerDialog?.classList.toggle('is-ui-hidden');
  });

  viewerStage?.addEventListener('touchstart', (event) => {
    const touch = event.changedTouches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  }, { passive: true });

  viewerStage?.addEventListener('touchend', (event) => {
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    if (Math.abs(deltaX) < 42 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
    suppressStageToggle = true;
    moveViewer(deltaX > 0 ? -1 : 1);
  }, { passive: true });

  document.addEventListener('keydown', (event) => {
    if (!viewer || viewer.hidden) return;
    if (event.key === 'Escape') closeViewer();
    else if (event.key === 'ArrowLeft') moveViewer(-1);
    else if (event.key === 'ArrowRight') moveViewer(1);
  });
})();
