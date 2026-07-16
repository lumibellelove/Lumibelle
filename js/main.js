(() => {
  const dots = Array.from(document.querySelectorAll('.hero-dots button'));
  const prev = document.querySelector('.hero-arrow-prev');
  const next = document.querySelector('.hero-arrow-next');
  let current = 0;

  function setActive(index) {
    current = (index + dots.length) % dots.length;
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === current));
  }

  prev?.addEventListener('click', () => setActive(current - 1));
  next?.addEventListener('click', () => setActive(current + 1));
  dots.forEach((dot, index) => dot.addEventListener('click', () => setActive(index)));

  const languagePicker = document.querySelector('.language-picker');
  const languageButton = document.querySelector('.language-button');
  const languageMenu = document.querySelector('.language-menu');
  const languageOptions = Array.from(document.querySelectorAll('.language-menu button'));

  function closeLanguageMenu() {
    if (!languageButton || !languageMenu) return;
    languageButton.setAttribute('aria-expanded', 'false');
    languageMenu.hidden = true;
  }

  languageButton?.addEventListener('click', () => {
    const willOpen = languageButton.getAttribute('aria-expanded') !== 'true';
    languageButton.setAttribute('aria-expanded', String(willOpen));
    if (languageMenu) languageMenu.hidden = !willOpen;
  });

  languageOptions.forEach((option) => {
    option.addEventListener('click', () => {
      const selectedLanguage = option.dataset.lang;
      const label = languageButton?.querySelector('span');
      if (label && selectedLanguage) label.textContent = selectedLanguage;
      languageOptions.forEach((item) => item.classList.toggle('is-current', item === option));
      closeLanguageMenu();
    });
  });

  document.addEventListener('click', (event) => {
    if (languagePicker && !languagePicker.contains(event.target)) closeLanguageMenu();
  });

  const menuButton = document.querySelector('.menu-button');
  const siteMenu = document.querySelector('.site-menu');
  const menuClose = document.querySelector('.menu-close');
  const menuLinks = Array.from(document.querySelectorAll('.site-menu a'));

  function setMenu(open) {
    if (!menuButton || !siteMenu) return;
    menuButton.setAttribute('aria-expanded', String(open));
    siteMenu.setAttribute('aria-hidden', String(!open));
    siteMenu.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
  }

  menuButton?.addEventListener('click', () => setMenu(true));
  menuClose?.addEventListener('click', () => setMenu(false));
  menuLinks.forEach((link) => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenu(false);
  });

  const newsTabs = Array.from(document.querySelectorAll('[data-news-filter]'));
  const newsSearchForm = document.querySelector('[data-news-search]');
  const newsSearchInput = document.querySelector('[data-news-search-input]');
  const newsFeaturedSection = document.querySelector('[data-news-featured-section]');
  const newsFeaturedCard = document.querySelector('.news-featured-card[data-news-category]');
  const newsListSection = document.querySelector('[data-news-list-section]');
  const newsItems = Array.from(document.querySelectorAll('.news-list li[data-news-category]'));
  const newsEmpty = document.querySelector('.news-empty');
  const newsPageButton = document.querySelector('.news-page-button');
  const newsPageButtonLabel = newsPageButton?.querySelector('span');
  const newsPageCurrent = document.querySelector('.news-page-status b');
  const newsPageTotal = document.querySelector('.news-page-status span');
  const newsItemsPerPage = 5;
  let newsFilter = 'all';
  let newsSearchQuery = '';
  let newsPage = 1;

  function normalizeNewsText(value) {
    return String(value || '').trim().toLocaleLowerCase('ko-KR');
  }

  function getNewsSearchText(element) {
    if (!element) return '';

    const title = element.querySelector('strong')?.textContent || '';
    const description = element === newsFeaturedCard
      ? element.querySelector('small')?.textContent || ''
      : '';

    return normalizeNewsText(`${title} ${description}`);
  }

  function matchesNewsSearch(element) {
    if (!newsSearchQuery) return true;
    return getNewsSearchText(element).includes(newsSearchQuery);
  }

  function matchesNewsCategory(element) {
    return newsFilter === 'all' || element?.dataset.newsCategory === newsFilter;
  }

  function getFilteredNewsItems() {
    return newsItems.filter((item) => {
      return matchesNewsCategory(item) && matchesNewsSearch(item);
    });
  }

  function renderNews() {
    if (!newsTabs.length || !newsListSection) return;

    const filteredItems = getFilteredNewsItems();
    const showFeatured = Boolean(
      newsFeaturedCard &&
      matchesNewsCategory(newsFeaturedCard) &&
      matchesNewsSearch(newsFeaturedCard)
    );
    const totalPages = Math.max(1, Math.ceil(filteredItems.length / newsItemsPerPage));

    if (newsPage > totalPages) newsPage = 1;

    const start = (newsPage - 1) * newsItemsPerPage;
    const visibleItems = filteredItems.slice(start, start + newsItemsPerPage);

    newsItems.forEach((item) => {
      item.hidden = !visibleItems.includes(item);
    });

    if (newsFeaturedSection) newsFeaturedSection.hidden = !showFeatured;

    const showEmpty = filteredItems.length === 0 && !showFeatured;
    newsListSection.hidden = filteredItems.length === 0 && !showEmpty;

    if (newsEmpty) {
      newsEmpty.hidden = !showEmpty;
      newsEmpty.textContent = newsSearchQuery
        ? '검색 결과가 없습니다.'
        : '해당 분류에 등록된 공지가 없습니다.';
    }

    if (newsPageCurrent) newsPageCurrent.textContent = String(newsPage);
    if (newsPageTotal) newsPageTotal.textContent = String(totalPages);

    if (newsPageButton && newsPageButtonLabel) {
      const hasMultiplePages = totalPages > 1;
      newsPageButton.disabled = !hasMultiplePages;
      newsPageButton.classList.toggle('is-previous', hasMultiplePages && newsPage === totalPages);
      newsPageButtonLabel.textContent = hasMultiplePages && newsPage === totalPages
        ? '이전 페이지'
        : '다음 페이지';
    }
  }

  newsTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      newsTabs.forEach((item) => {
        const active = item === tab;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-selected', String(active));
      });
      newsFilter = tab.dataset.newsFilter || 'all';
      newsPage = 1;
      renderNews();
    });
  });

  newsSearchForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    newsSearchQuery = normalizeNewsText(newsSearchInput?.value);
    newsPage = 1;
    renderNews();
  });

  newsSearchInput?.addEventListener('input', () => {
    if (newsSearchInput.value.trim() !== '') return;
    newsSearchQuery = '';
    newsPage = 1;
    renderNews();
  });

  newsPageButton?.addEventListener('click', () => {
    const filteredCount = getFilteredNewsItems().length;
    const totalPages = Math.max(1, Math.ceil(filteredCount / newsItemsPerPage));

    newsPage = newsPage >= totalPages ? 1 : newsPage + 1;
    renderNews();
  });

  renderNews();


  const featuredNewsCards = Array.from(document.querySelectorAll('.news-featured-card'));

  featuredNewsCards.forEach((card) => {
    const media = card.querySelector('.news-featured-media');
    const image = media?.querySelector('img');
    const source = image?.getAttribute('src')?.trim() || '';
    const hasImage = Boolean(source);

    card.classList.toggle('has-image', hasImage);

    if (media) media.hidden = !hasImage;

    image?.addEventListener('error', () => {
      card.classList.remove('has-image');
      media.hidden = true;
    });
  });


  const memberCards = Array.from(
    document.querySelectorAll('.members-grid--current .member-list-card')
  );
  const memberTouchTimers = new WeakMap();

  if (memberCards.length) {
    document.documentElement.classList.add('member-card-effects-ready');

    memberCards.forEach((card, index) => {
      card.style.setProperty('--member-reveal-delay', `${index * 90}ms`);

      card.addEventListener('pointerdown', () => {
        const previousTimer = memberTouchTimers.get(card);
        if (previousTimer) window.clearTimeout(previousTimer);

        card.classList.remove('is-touch-shining');
        void card.offsetWidth;
        card.classList.add('is-touch-shining');

        const timer = window.setTimeout(() => {
          card.classList.remove('is-touch-shining');
          memberTouchTimers.delete(card);
        }, 760);

        memberTouchTimers.set(card, timer);
      });

      card.addEventListener('animationend', (event) => {
        if (event.animationName !== 'memberCardTouchShine') return;
        card.classList.remove('is-touch-shining');
      });
    });

    const revealMemberCard = (card) => {
      card.classList.add('is-revealed');
    };

    if ('IntersectionObserver' in window) {
      const memberCardObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          revealMemberCard(entry.target);
          observer.unobserve(entry.target);
        });
      }, {
        threshold: .18,
        rootMargin: '0px 0px -6% 0px'
      });

      memberCards.forEach((card) => memberCardObserver.observe(card));
    } else {
      memberCards.forEach(revealMemberCard);
    }
  }

const memberVoiceButton = document.querySelector('[data-member-voice-button]');
  const memberVoiceText = document.querySelector('[data-member-voice-text]');
  const memberVoiceAudios = Array.from(document.querySelectorAll('[data-member-voice]'));
  const memberVoiceName = document.querySelector('.member-detail-name-ko');
  const memberVoiceEffect = memberVoiceButton?.querySelector('.member-voice-effect');
  const memberVoiceEffects =
    memberVoiceButton?.dataset.voiceEffects
      ?.split('|')
      .map((effect) => effect.trim())
      .filter(Boolean) || ['💖', '⭐️', '🎀'];
  const memberVoicePrompt =
    memberVoiceText?.dataset.voicePrompt?.trim() ||
    memberVoiceText?.textContent?.trim() ||
    '';
  let memberVoiceLastIndex = -1;
  let memberVoiceCurrentAudio = null;
  let memberVoicePlaying = false;

  function setMemberVoiceState(state) {
    if (!memberVoiceButton) return;

    const label = memberVoiceButton.querySelector('.member-voice-label');

    if (state === 'playing') {
      memberVoiceButton.classList.add('is-playing');
      memberVoiceName?.classList.add('is-voice-active');
      if (label) label.textContent = '⏸ PAUSE';
      return;
    }

    memberVoiceButton.classList.remove('is-playing');
    memberVoiceName?.classList.remove('is-voice-active');
    if (label) label.textContent = '▶ VOICE';

    if (state === 'reset' && memberVoiceText) {
      memberVoiceText.classList.remove('is-changed');
      memberVoiceText.textContent = memberVoicePrompt;
    }
  }

  function getNextMemberVoiceIndex() {
    if (memberVoiceAudios.length <= 1) return 0;

    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * memberVoiceAudios.length);
    } while (nextIndex === memberVoiceLastIndex);

    return nextIndex;
  }

  function triggerMemberVoiceEffect() {
    if (!memberVoiceEffect) return;

    const effectIndex = Math.floor(Math.random() * memberVoiceEffects.length);
    memberVoiceEffect.textContent = memberVoiceEffects[effectIndex];
    memberVoiceEffect.classList.remove('is-active');
    void memberVoiceEffect.offsetWidth;
    memberVoiceEffect.classList.add('is-active');
  }

  memberVoiceButton?.addEventListener('click', () => {
    if (!memberVoiceAudios.length) return;

    if (memberVoicePlaying && memberVoiceCurrentAudio) {
      memberVoiceCurrentAudio.pause();
      memberVoicePlaying = false;
      setMemberVoiceState('paused');
      return;
    }

    if (
      memberVoiceCurrentAudio &&
      memberVoiceCurrentAudio.currentTime > 0 &&
      !memberVoiceCurrentAudio.ended
    ) {
      const resumePromise = memberVoiceCurrentAudio.play();
      resumePromise?.catch(() => {});
      memberVoicePlaying = true;
      setMemberVoiceState('playing');
      return;
    }

    const nextIndex = getNextMemberVoiceIndex();
    memberVoiceLastIndex = nextIndex;
    memberVoiceCurrentAudio = memberVoiceAudios[nextIndex];

    memberVoiceAudios.forEach((audio) => {
      if (audio === memberVoiceCurrentAudio) return;
      audio.pause();
      audio.currentTime = 0;
    });

    memberVoiceCurrentAudio.currentTime = 0;

    // 원본과 같은 순서:
    // 실제 재생 성공 여부와 상관없이 즉시 playing 상태·대사·효과를 적용한다.
    const playPromise = memberVoiceCurrentAudio.play();
    playPromise?.catch(() => {});

    memberVoicePlaying = true;
    setMemberVoiceState('playing');
    triggerMemberVoiceEffect();

    if (memberVoiceText) {
      const selectedLine =
        memberVoiceCurrentAudio.dataset.line?.trim() || '';

      memberVoiceText.textContent =
        selectedLine || memberVoicePrompt;
      memberVoiceText.classList.add('is-changed');
    }

    memberVoiceCurrentAudio.onended = () => {
      if (memberVoiceCurrentAudio !== memberVoiceAudios[nextIndex]) return;
      memberVoicePlaying = false;
      memberVoiceCurrentAudio = null;
      setMemberVoiceState('reset');
    };
  });

  const memberSnsLinks = Array.from(document.querySelectorAll('.member-detail-sns a'));

  memberSnsLinks.forEach((link) => {
    let snsEffectTimer = null;

    link.addEventListener('pointerdown', () => {
      if (snsEffectTimer) window.clearTimeout(snsEffectTimer);

      link.classList.remove('is-touch-active');
      void link.offsetWidth;
      link.classList.add('is-touch-active');

      snsEffectTimer = window.setTimeout(() => {
        link.classList.remove('is-touch-active');
        snsEffectTimer = null;
      }, 620);
    });

    link.addEventListener('pointercancel', () => {
      link.classList.remove('is-touch-active');
    });
  });

  const memberActionLinks = Array.from(
    document.querySelectorAll(
      '.member-detail-list-link, .member-detail-home-link'
    )
  );

  memberActionLinks.forEach((link) => {
    let actionEffectTimer = null;

    link.addEventListener('pointerdown', () => {
      if (actionEffectTimer) window.clearTimeout(actionEffectTimer);

      link.classList.remove('is-touch-active');
      void link.offsetWidth;
      link.classList.add('is-touch-active');

      actionEffectTimer = window.setTimeout(() => {
        link.classList.remove('is-touch-active');
        actionEffectTimer = null;
      }, 420);
    });

    link.addEventListener('pointercancel', () => {
      link.classList.remove('is-touch-active');
    });
  });

  const memberVideoModal = document.querySelector('[data-video-modal]');
  const memberVideoFrame = document.querySelector('[data-video-frame]');
  const memberVideoYoutubeLink = document.querySelector('[data-video-youtube-link]');
  const memberVideoOpenButtons = Array.from(document.querySelectorAll('[data-video-open]'));
  const memberVideoCloseButtons = Array.from(document.querySelectorAll('[data-video-close]'));

  function closeMemberVideo() {
    if (!memberVideoModal || !memberVideoFrame) return;

    memberVideoModal.hidden = true;
    memberVideoModal.setAttribute('aria-hidden', 'true');
    memberVideoFrame.src = '';
    document.body.classList.remove('member-video-open');
  }

  memberVideoOpenButtons.forEach((button) => {
    button.addEventListener('click', () => {
      if (!memberVideoModal || !memberVideoFrame) return;

      const videoId = button.dataset.videoId;
      const start = button.dataset.videoStart || '';
      const end = button.dataset.videoEnd || '';
      if (!videoId) return;

      let embedUrl =
        `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;

      if (start) {
        embedUrl += `&start=${start}`;
      }

      if (end) {
        embedUrl += `&end=${end}`;
      }

      memberVideoFrame.src = embedUrl;

      let watchUrl =
        `https://www.youtube.com/watch?v=${videoId}`;

      if (start) {
        watchUrl += `&t=${start}s`;
      }

      if (memberVideoYoutubeLink) {
        memberVideoYoutubeLink.href = watchUrl;
      }

      memberVideoModal.hidden = false;
      memberVideoModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('member-video-open');
    });
  });

  memberVideoCloseButtons.forEach((button) => {
    button.addEventListener('click', closeMemberVideo);
  });

  memberVideoModal?.addEventListener('click', (event) => {
    if (event.target === memberVideoModal) {
      closeMemberVideo();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (
      event.key === 'Escape' &&
      memberVideoModal &&
      !memberVideoModal.hidden
    ) {
      closeMemberVideo();
    }
  });


  const videoPage = document.querySelector('.video-archive-page');
  const videoCards = Array.from(document.querySelectorAll('[data-video-card]'));
  const videoCollectionButtons = Array.from(document.querySelectorAll('[data-video-collection]'));
  const videoMemberButtons = Array.from(document.querySelectorAll('[data-video-member]'));
  const videoSearchInput = document.querySelector('[data-video-search]');
  const videoSortSelect = document.querySelector('[data-video-sort]');
  const videoSortControl = document.querySelector('[data-video-sort-control]');
  const videoSortTrigger = document.querySelector('[data-video-sort-trigger]');
  const videoSortLabel = document.querySelector('[data-video-sort-label]');
  const videoSortMenu = document.querySelector('[data-video-sort-menu]');
  const videoSortOptions = Array.from(document.querySelectorAll('[data-video-sort-option]'));
  const videoLoadMoreButton = document.querySelector('[data-video-load-more]');
  const videoLoadMoreLabel = document.querySelector('[data-video-load-more-label]');
  const videoGrid = document.querySelector('[data-video-grid]');
  const videoStandardResults = document.querySelector('[data-video-standard-results]');
  const videoHotLayout = document.querySelector('[data-video-hot-layout]');
  const videoHotSubviewHeader = document.querySelector('[data-video-hot-subview-header]');
  const videoHotSubviewBack = document.querySelector('[data-video-hot-subview-back]');
  const videoHotSubviewTitle = document.querySelector('[data-video-hot-subview-title]');
  const videoHotSubviewIcon = document.querySelector('[data-video-hot-subview-icon]');
  const videoHotFeaturedSection = document.querySelector('[data-video-hot-featured-section]');
  const videoHotFeaturedGrid = document.querySelector('[data-video-hot-featured-grid]');
  const videoHotPickSection = document.querySelector('[data-video-hot-pick-section]');
  const videoHotPickGrid = document.querySelector('[data-video-hot-pick-grid]');
  const videoHotPickToggle = document.querySelector('[data-video-hot-pick-toggle]');
  const videoHotPickToggleLabel = document.querySelector('[data-video-hot-pick-toggle-label]');
  const videoHotPickMoreButton = document.querySelector('[data-video-hot-pick-more]');
  const videoHotPickMoreLabel = document.querySelector('[data-video-hot-pick-more-label]');
  const videoHotAllSection = document.querySelector('[data-video-hot-all-section]');
  const videoHotAllGrid = document.querySelector('[data-video-hot-all-grid]');
  const videoHotAllToggle = document.querySelector('[data-video-hot-all-toggle]');
  const videoHotAllToggleLabel = document.querySelector('[data-video-hot-all-toggle-label]');
  const videoHotMoreButton = document.querySelector('[data-video-hot-more]');
  const videoHotMoreLabel = document.querySelector('[data-video-hot-more-label]');
  const videoHotShortsSection = document.querySelector('[data-video-hot-shorts-section]');
  const videoHotShortsGrid = document.querySelector('[data-video-hot-shorts-grid]');
  const videoHotEmpty = document.querySelector('[data-video-hot-empty]');
  const videoLumiPreview = document.querySelector('[data-video-lumi-preview]');
  const videoResultCount = document.querySelector('[data-video-result-count]');
  const videoResultsTitle = document.querySelector('#video-results-title');
  const videoEmpty = document.querySelector('[data-video-empty]');
  const videoActiveFilters = document.querySelector('[data-video-active-filters]');
  const videoFilterOpen = document.querySelector('[data-video-filter-open]');
  const videoFilterClose = document.querySelector('[data-video-filter-close]');
  const videoFilterApply = document.querySelector('[data-video-filter-apply]');
  const videoFilterReset = document.querySelector('[data-video-filter-reset]');
  const videoFilterSheet = document.querySelector('[data-video-filter-sheet]');
  const videoFilterOverlay = document.querySelector('[data-video-filter-overlay]');
  const videoEventSelect = document.querySelector('[data-video-event]');
  const videoEventControl = document.querySelector('[data-video-event-control]');
  const videoEventTrigger = document.querySelector('[data-video-event-trigger]');
  const videoEventLabel = document.querySelector('[data-video-event-label]');
  const videoEventMenu = document.querySelector('[data-video-event-menu]');
  const videoEventOptions = Array.from(document.querySelectorAll('[data-video-event-option]'));
  const videoArchiveControls = document.querySelector('#video-archive-controls');
  const videoFilterReturn = document.querySelector('[data-video-filter-return]');
  const videoDetailModal = document.querySelector('[data-video-detail-modal]');
  const videoDetailDialog = document.querySelector('.video-detail-dialog');
  const videoDetailFrame = document.querySelector('[data-video-detail-frame]');
  const videoDetailPlaceholder = document.querySelector('[data-video-detail-placeholder]');
  const videoDetailTitle = document.querySelector('[data-video-detail-title]');
  const videoDetailCategory = document.querySelector('[data-video-detail-category]');
  const videoDetailDescription = document.querySelector('[data-video-detail-description]');
  const videoDetailMembers = document.querySelector('[data-video-detail-members]');
  const videoDetailEvent = document.querySelector('[data-video-detail-event]');
  const videoDetailDate = document.querySelector('[data-video-detail-date]');
  const videoDetailViews = document.querySelector('[data-video-detail-views]');
  const videoDetailSparkles = document.querySelector('[data-video-detail-sparkles]');
  const videoDetailExternal = document.querySelector('[data-video-detail-external]');
  const videoDetailExternalLabel = document.querySelector('[data-video-detail-external-label]');
  const videoDetailSparkleButton = document.querySelector('[data-video-detail-sparkle-button]');
  const videoDetailShareButton = document.querySelector('[data-video-detail-share]');
  const videoDetailActionStatus = document.querySelector('[data-video-detail-action-status]');
  const videoDetailCloseButtons = Array.from(document.querySelectorAll('[data-video-detail-close]'));
  const videoInitialLimit = 4;
  const videoLoadStep = 4;
  let videoVisibleLimit = videoInitialLimit;
  let videoCollection = 'ALL';
  let videoMember = 'ALL';
  let videoCategory = 'ALL';
  let videoType = 'ALL';
  let videoPlatform = 'ALL';
  let videoEvent = 'ALL';
  let videoPeriod = 'ALL';
  const videoHotPickInitialLimit = 2;
  const videoHotAllInitialLimit = 4;
  const videoHotSubviewInitialLimit = 4;
  let videoHotPickExpanded = false;
  let videoHotAllExpanded = false;
  let videoHotSubview = new URLSearchParams(window.location.search).get('view') || '';

  videoCards.forEach((card, index) => {
    card.dataset.videoKey = String(index);
  });

  function normalizeVideoText(value) {
    return String(value || '').trim().toLocaleLowerCase('ko-KR');
  }

  function getCheckedVideoValue(name) {
    return document.querySelector(`input[name="${name}"]:checked`)?.value || 'ALL';
  }

  function isVideoNew(card) {
    const publishedAt = new Date(card.dataset.publishedAt || '');
    if (Number.isNaN(publishedAt.getTime())) return false;

    const now = new Date();
    const age = now.getTime() - publishedAt.getTime();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;

    return age >= 0 && age <= sevenDays;
  }

  function formatVideoCompactCount(value) {
    const count = Math.max(0, Number(value) || 0);

    const formatUnit = (unitValue, suffix) => {
      const digits = unitValue >= 100 ? 0 : 1;
      return `${unitValue.toFixed(digits).replace(/\.0$/, '')}${suffix}`;
    };

    if (count >= 1000000) return formatUnit(count / 1000000, 'M');
    if (count >= 1000) return formatUnit(count / 1000, 'K');
    return String(Math.round(count));
  }

  function formatVideoRelativeAge(value) {
    const publishedAt = new Date(value || '');
    if (Number.isNaN(publishedAt.getTime())) return '';

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const publishedDay = new Date(
      publishedAt.getFullYear(),
      publishedAt.getMonth(),
      publishedAt.getDate()
    );
    const difference = Math.floor(
      (today.getTime() - publishedDay.getTime()) / (24 * 60 * 60 * 1000)
    );

    if (difference < 0) return '· 공개 예정';
    if (difference === 0) return '· 오늘';
    return `· ${difference}일 전`;
  }

  function renderVideoCardStats() {
    videoCards.forEach((card) => {
      const views = card.querySelector('[data-video-card-views]');
      const sparkles = card.querySelector('[data-video-card-sparkles]');
      const age = card.querySelector('[data-video-card-age]');

      if (views) views.textContent = formatVideoCompactCount(card.dataset.views);
      if (sparkles) sparkles.textContent = formatVideoCompactCount(card.dataset.sparkles);
      if (age) age.textContent = formatVideoRelativeAge(card.dataset.publishedAt);
    });
  }

  function renderLumiClipPreviewStats() {
    document.querySelectorAll('.lumi-clip-card').forEach((card) => {
      const views = card.querySelector('[data-clip-view-text]');
      const sparkles = card.querySelector('[data-clip-sparkle-text]');
      const age = card.querySelector('[data-clip-age]');

      if (views) views.textContent = formatVideoCompactCount(card.dataset.clipViews);
      if (sparkles) sparkles.textContent = formatVideoCompactCount(card.dataset.clipSparkles);
      if (age) age.textContent = formatVideoRelativeAge(card.dataset.clipPublishedAt);
    });
  }

  function renderVideoAutoBadges() {
    videoCards.forEach((card) => {
      const badgeWrap = card.querySelector('[data-auto-badges]');
      if (!badgeWrap || badgeWrap.querySelector('.video-badge--new')) return;
      if (!isVideoNew(card)) return;

      const badge = document.createElement('b');
      badge.className = 'video-badge video-badge--new';
      badge.textContent = 'NEW';
      badgeWrap.prepend(badge);
    });
  }

  function matchesVideoCard(card) {
    const query = normalizeVideoText(videoSearchInput?.value);
    const searchableText = normalizeVideoText([
      card.dataset.title,
      card.dataset.description,
      card.dataset.members,
      card.dataset.category,
      card.dataset.event,
      card.dataset.platform,
    ].join(' '));

    const collections = String(card.dataset.collections || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    const members = String(card.dataset.members || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    const publishedAt = new Date(card.dataset.publishedAt || '');
    const periodDays = Number(videoPeriod);
    const periodMatches = videoPeriod === 'ALL' || (
      !Number.isNaN(publishedAt.getTime()) &&
      Date.now() - publishedAt.getTime() >= 0 &&
      Date.now() - publishedAt.getTime() <= periodDays * 24 * 60 * 60 * 1000
    );

    return (
      (!query || searchableText.includes(query)) &&
      (videoCollection === 'ALL' || collections.includes(videoCollection)) &&
      (videoMember === 'ALL' || members.includes(videoMember)) &&
      (videoCategory === 'ALL' || card.dataset.category === videoCategory) &&
      (videoType === 'ALL' || card.dataset.type === videoType) &&
      (videoPlatform === 'ALL' || card.dataset.platform === videoPlatform) &&
      (videoEvent === 'ALL' || card.dataset.event === videoEvent) &&
      periodMatches
    );
  }

  function setVideoSortMenuOpen(isOpen) {
    if (!videoSortControl || !videoSortTrigger || !videoSortMenu) return;

    videoSortControl.classList.toggle('is-open', isOpen);
    videoSortTrigger.setAttribute('aria-expanded', String(isOpen));
    videoSortMenu.hidden = !isOpen;
  }

  function syncVideoSortControl() {
    const value = videoSortSelect?.value || 'latest';
    const selectedOption = videoSortOptions.find((option) => option.dataset.value === value);

    if (videoSortLabel) {
      videoSortLabel.textContent = selectedOption?.textContent?.trim() || '최신순';
    }

    videoSortOptions.forEach((option) => {
      option.setAttribute('aria-selected', String(option.dataset.value === value));
    });
  }

  function setVideoEventMenuOpen(isOpen) {
    if (!videoEventControl || !videoEventTrigger || !videoEventMenu) return;

    videoEventControl.classList.toggle('is-open', isOpen);
    videoEventTrigger.setAttribute('aria-expanded', String(isOpen));
    videoEventMenu.hidden = !isOpen;
  }

  function syncVideoEventControl() {
    const value = videoEventSelect?.value || 'ALL';
    const selectedOption = videoEventOptions.find((option) => option.dataset.value === value);

    if (videoEventLabel) {
      videoEventLabel.textContent = selectedOption?.textContent?.trim() || '전체';
    }

    videoEventOptions.forEach((option) => {
      option.setAttribute('aria-selected', String(option.dataset.value === value));
    });
  }

  function sortVideoCards(cards) {
    const sortValue = videoSortSelect?.value || 'latest';

    return [...cards].sort((first, second) => {
      if (sortValue === 'popular') {
        return Number(second.dataset.views || 0) - Number(first.dataset.views || 0);
      }

      if (sortValue === 'recommended') {
        const pickDifference = Number(second.dataset.pick === 'true') - Number(first.dataset.pick === 'true');
        if (pickDifference !== 0) return pickDifference;
        return Number(second.dataset.sparkles || 0) - Number(first.dataset.sparkles || 0);
      }

      return new Date(second.dataset.publishedAt || 0) - new Date(first.dataset.publishedAt || 0);
    });
  }

  function renderActiveVideoFilters() {
    if (!videoActiveFilters) return;

    const labels = [];
    if (videoCategory !== 'ALL') labels.push(videoCategory);
    if (videoType === 'long') labels.push('일반 영상');
    if (videoType === 'short') labels.push('숏폼');
    if (videoPlatform !== 'ALL') labels.push(videoPlatform);
    if (videoEvent !== 'ALL') labels.push(videoEvent);
    if (videoPeriod !== 'ALL') labels.push(`최근 ${videoPeriod}일`);

    videoActiveFilters.replaceChildren(
      ...labels.map((label) => {
        const chip = document.createElement('span');
        chip.textContent = label;
        return chip;
      })
    );
    videoActiveFilters.hidden = labels.length === 0;
  }

  function syncHotClipControls(pickCount, allCount) {
    const isPickSubview = videoHotSubview === 'hot-pick';
    const isAllSubview = videoHotSubview === 'hot-clips';

    if (videoHotPickToggle && videoHotPickToggleLabel) {
      videoHotPickToggle.hidden = isPickSubview || pickCount === 0;
      videoHotPickToggle.classList.remove('is-collapse');
      videoHotPickToggle.setAttribute('aria-expanded', 'false');
      videoHotPickToggleLabel.textContent = '전체보기';
    }

    if (videoHotAllToggle && videoHotAllToggleLabel) {
      videoHotAllToggle.hidden = isAllSubview || allCount === 0;
      videoHotAllToggle.classList.remove('is-collapse');
      videoHotAllToggle.setAttribute('aria-expanded', 'false');
      videoHotAllToggleLabel.textContent = '전체보기';
    }

    const hasMorePicks = pickCount > videoHotSubviewInitialLimit;
    if (videoHotPickMoreButton && videoHotPickMoreLabel) {
      videoHotPickMoreButton.hidden = !isPickSubview || !hasMorePicks;
      videoHotPickMoreButton.classList.toggle('is-collapse', videoHotPickExpanded);
      videoHotPickMoreButton.setAttribute('aria-expanded', String(videoHotPickExpanded));
      videoHotPickMoreLabel.textContent = videoHotPickExpanded ? 'PICK 접기' : 'PICK 더보기';
    }

    const hasMoreHotClips = allCount > videoHotSubviewInitialLimit;
    if (videoHotMoreButton && videoHotMoreLabel) {
      videoHotMoreButton.hidden = !isAllSubview || !hasMoreHotClips;
      videoHotMoreButton.classList.toggle('is-collapse', videoHotAllExpanded);
      videoHotMoreButton.setAttribute('aria-expanded', String(videoHotAllExpanded));
      videoHotMoreLabel.textContent = videoHotAllExpanded ? 'HOT CLIP 접기' : 'HOT CLIP 더보기';
    }
  }

  function setHotClipSubview(nextSubview, { replace = false } = {}) {
    videoHotSubview = nextSubview;
    videoHotPickExpanded = false;
    videoHotAllExpanded = false;

    const url = new URL(window.location.href);
    if (nextSubview) url.searchParams.set('view', nextSubview);
    else url.searchParams.delete('view');

    window.history[replace ? 'replaceState' : 'pushState']({}, '', url);
    renderVideoCards();
    window.requestAnimationFrame(() => {
      videoHotLayout?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function createHotClipCardClone(card) {
    const clone = card.cloneNode(true);
    clone.removeAttribute('data-video-card');
    clone.dataset.videoHotClone = 'true';
    clone.hidden = false;

    const trigger = clone.querySelector('.video-card-open');
    trigger?.addEventListener('click', () => openVideoDetail(clone, trigger));

    return clone;
  }

  function renderHotClipCards(matchingCards) {
    const longCards = matchingCards.filter((card) => card.dataset.type !== 'short');
    const shortCards = matchingCards.filter((card) => card.dataset.type === 'short');
    const featuredCards = [...longCards]
      .sort((first, second) => Number(second.dataset.views || 0) - Number(first.dataset.views || 0))
      .slice(0, 2);
    const pickCards = sortVideoCards(longCards.filter((card) => card.dataset.pick === 'true'));
    const allLongCards = sortVideoCards(longCards);
    const sortedShortCards = sortVideoCards(shortCards);
    const isPickSubview = videoHotSubview === 'hot-pick';
    const isAllSubview = videoHotSubview === 'hot-clips';
    const isHotHome = !isPickSubview && !isAllSubview;

    const visiblePickCards = isPickSubview
      ? (videoHotPickExpanded ? pickCards : pickCards.slice(0, videoHotSubviewInitialLimit))
      : pickCards.slice(0, videoHotPickInitialLimit);
    const visibleAllCards = isAllSubview
      ? (videoHotAllExpanded ? allLongCards : allLongCards.slice(0, videoHotSubviewInitialLimit))
      : allLongCards.slice(0, videoHotAllInitialLimit);

    videoHotFeaturedGrid?.replaceChildren();
    videoHotPickGrid?.replaceChildren();
    videoHotAllGrid?.replaceChildren();
    videoHotShortsGrid?.replaceChildren();

    featuredCards.forEach((card) => videoHotFeaturedGrid?.append(createHotClipCardClone(card)));
    visiblePickCards.forEach((card) => videoHotPickGrid?.append(createHotClipCardClone(card)));
    visibleAllCards.forEach((card) => videoHotAllGrid?.append(createHotClipCardClone(card)));
    sortedShortCards.forEach((card) => videoHotShortsGrid?.append(createHotClipCardClone(card)));

    if (videoHotSubviewHeader) videoHotSubviewHeader.hidden = isHotHome;
    videoHotLayout?.classList.toggle('is-subview', !isHotHome);
    if (videoHotSubviewTitle) {
      videoHotSubviewTitle.textContent = isPickSubview ? 'HOT CLIP PICK' : 'HOT CLIP';
    }
    if (videoHotSubviewIcon) {
      videoHotSubviewIcon.textContent = isPickSubview ? '★' : '✦';
    }

    if (videoHotFeaturedSection) videoHotFeaturedSection.hidden = !isHotHome || featuredCards.length === 0;
    if (videoHotPickSection) videoHotPickSection.hidden = (!isHotHome && !isPickSubview) || pickCards.length === 0;
    if (videoHotAllSection) videoHotAllSection.hidden = (!isHotHome && !isAllSubview) || allLongCards.length === 0;
    if (videoHotShortsSection) videoHotShortsSection.hidden = !isHotHome || sortedShortCards.length === 0;
    if (videoHotEmpty) {
      const visibleCount = isPickSubview ? pickCards.length : isAllSubview ? allLongCards.length : matchingCards.length;
      videoHotEmpty.hidden = visibleCount !== 0;
    }

    syncHotClipControls(pickCards.length, allLongCards.length);
  }

  function renderVideoCards() {
    if (!videoPage || !videoCards.length || !videoGrid) return;

    videoCards.forEach((card) => {
      card.hidden = true;
      videoGrid.append(card);
    });

    const matchingCards = sortVideoCards(videoCards.filter(matchesVideoCard));
    const isHotClipView = videoCollection === 'HOT_CLIP';

    if (videoStandardResults) videoStandardResults.hidden = isHotClipView;
    if (videoHotLayout) videoHotLayout.hidden = !isHotClipView;
    if (videoLumiPreview) videoLumiPreview.hidden = isHotClipView;

    if (isHotClipView) {
      renderHotClipCards(matchingCards);
      if (videoLoadMoreButton) videoLoadMoreButton.hidden = true;
    } else {
      matchingCards.forEach((card, index) => {
        card.hidden = index >= videoVisibleLimit;
        videoGrid.append(card);
      });

      const visibleCards = matchingCards.slice(0, videoVisibleLimit);

      if (videoEmpty) videoEmpty.hidden = matchingCards.length !== 0;

      if (videoLoadMoreButton) {
        const hasMore = matchingCards.length > visibleCards.length;
        const canCollapse = matchingCards.length > videoInitialLimit && !hasMore;

        videoLoadMoreButton.hidden = matchingCards.length <= videoInitialLimit;
        videoLoadMoreButton.disabled = false;
        videoLoadMoreButton.classList.toggle('is-collapse', canCollapse);
        videoLoadMoreButton.setAttribute('aria-expanded', String(canCollapse));

        if (videoLoadMoreLabel) {
          videoLoadMoreLabel.textContent = canCollapse ? '영상 접기' : '영상 더보기';
        }
      }
    }

    if (videoResultCount) videoResultCount.textContent = String(matchingCards.length);
    if (videoResultsTitle) {
      const collectionLabel = videoCollection === 'HOT_CLIP'
        ? 'HOT CLIP'
        : videoCollection === 'LIVE'
          ? 'LIVE 영상'
          : '전체 영상';
      videoResultsTitle.textContent = videoMember === 'ALL'
        ? collectionLabel
        : `${videoMember} · ${collectionLabel}`;
    }

    renderActiveVideoFilters();
  }

  function setVideoPressedState(buttons, activeButton) {
    buttons.forEach((button) => {
      const active = button === activeButton;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function setVideoFilterSheet(open) {
    if (!videoFilterSheet || !videoFilterOverlay) return;
    videoFilterSheet.hidden = !open;
    videoFilterOverlay.hidden = !open;
    document.body.classList.toggle('video-filter-open', open);
    videoFilterOpen?.setAttribute('aria-expanded', String(open));

    if (open) {
      syncVideoEventControl();
      window.setTimeout(() => videoFilterClose?.focus(), 0);
    } else {
      setVideoEventMenuOpen(false);
      videoFilterOpen?.focus();
    }
  }

  function resetVideoDetailFilters() {
    ['video-category', 'video-type', 'video-platform', 'video-period'].forEach((name) => {
      const allOption = document.querySelector(`input[name="${name}"][value="ALL"]`);
      if (allOption) allOption.checked = true;
    });
    if (videoEventSelect) {
      videoEventSelect.value = 'ALL';
      syncVideoEventControl();
    }
  }

  function formatVideoNumber(value) {
    return new Intl.NumberFormat('ko-KR').format(Number(value || 0));
  }

  function formatVideoDate(value) {
    const date = new Date(value || '');
    if (Number.isNaN(date.getTime())) return '';

    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('.');
  }

  let lastVideoDetailTrigger = null;
  let currentVideoDetailCard = null;

  function setVideoDetailStatus(message) {
    if (!videoDetailActionStatus) return;

    videoDetailActionStatus.textContent = message;
    window.clearTimeout(setVideoDetailStatus.timer);
    setVideoDetailStatus.timer = window.setTimeout(() => {
      videoDetailActionStatus.textContent = '';
    }, 1800);
  }

  function syncVideoCardSparkles(card, value) {
    if (!card) return;

    const key = card.dataset.videoKey;
    const relatedCards = key
      ? Array.from(document.querySelectorAll(`[data-video-key="${key}"]`))
      : [card];

    relatedCards.forEach((relatedCard) => {
      relatedCard.dataset.sparkles = String(value);
      const cardSparkleStat = relatedCard.querySelector('[data-video-card-sparkles]');
      if (cardSparkleStat) {
        cardSparkleStat.textContent = formatVideoCompactCount(value);
      }
    });
  }

  function closeVideoDetail() {
    if (!videoDetailModal) return;

    videoDetailModal.hidden = true;
    document.body.classList.remove('video-detail-open');

    if (videoDetailFrame) {
      videoDetailFrame.src = '';
      videoDetailFrame.hidden = true;
    }
    if (videoDetailPlaceholder) videoDetailPlaceholder.hidden = false;

    lastVideoDetailTrigger?.focus();
    lastVideoDetailTrigger = null;
    currentVideoDetailCard = null;

    if (videoDetailActionStatus) videoDetailActionStatus.textContent = '';
  }

  function openVideoDetail(card, trigger) {
    if (!videoDetailModal || !card) return;

    lastVideoDetailTrigger = trigger || null;
    currentVideoDetailCard = card;

    const platform = card.dataset.platform || 'direct';
    const youtubeId = card.dataset.youtubeId || '';
    const startSec = Number(card.dataset.startSec || 0);
    const endSec = Number(card.dataset.endSec || 0);
    const youtubeUrl = card.dataset.youtubeUrl || '';
    const instagramUrl = card.dataset.instagramUrl || '';
    const tiktokUrl = card.dataset.tiktokUrl || '';
    const externalUrl = platform === 'youtube'
      ? youtubeUrl
      : platform === 'instagram'
        ? instagramUrl
        : platform === 'tiktok'
          ? tiktokUrl
          : '';

    if (videoDetailTitle) videoDetailTitle.textContent = card.dataset.title || '영상';
    if (videoDetailCategory) videoDetailCategory.textContent = card.dataset.category || '영상';
    if (videoDetailDescription) {
      videoDetailDescription.textContent = card.dataset.description || '루미벨의 영상 기록입니다.';
    }
    if (videoDetailMembers) {
      videoDetailMembers.textContent = String(card.dataset.members || 'ALL').replaceAll(',', ' · ');
    }
    if (videoDetailEvent) videoDetailEvent.textContent = card.dataset.event || 'VIDEO';
    if (videoDetailDate) videoDetailDate.textContent = formatVideoDate(card.dataset.publishedAt);
    if (videoDetailViews) videoDetailViews.textContent = formatVideoNumber(card.dataset.views);
    if (videoDetailSparkles) videoDetailSparkles.textContent = formatVideoNumber(card.dataset.sparkles);

    if (videoDetailSparkleButton) {
      const isSparkled = card.dataset.sparkled === 'true';
      videoDetailSparkleButton.classList.toggle('is-active', isSparkled);
      videoDetailSparkleButton.setAttribute('aria-pressed', String(isSparkled));
    }

    if (videoDetailActionStatus) videoDetailActionStatus.textContent = '';

    if (videoDetailExternal && videoDetailExternalLabel) {
      const label = platform === 'youtube'
        ? 'YOUTUBE에서 보기'
        : platform === 'instagram'
          ? 'INSTAGRAM에서 보기'
          : platform === 'tiktok'
            ? 'TIKTOK에서 보기'
            : '원본으로 이동';

      videoDetailExternalLabel.textContent = label;
      videoDetailExternal.href = externalUrl || '#';
      videoDetailExternal.setAttribute('aria-disabled', String(!externalUrl));
      videoDetailExternal.tabIndex = externalUrl ? 0 : -1;
    }

    if (videoDetailFrame && videoDetailPlaceholder && youtubeId) {
      const params = new URLSearchParams({
        autoplay: '1',
        rel: '0',
      });
      if (startSec > 0) params.set('start', String(startSec));
      if (endSec > 0) params.set('end', String(endSec));

      videoDetailFrame.src = `https://www.youtube.com/embed/${youtubeId}?${params.toString()}`;
      videoDetailFrame.hidden = false;
      videoDetailPlaceholder.hidden = true;
    } else {
      if (videoDetailFrame) {
        videoDetailFrame.src = '';
        videoDetailFrame.hidden = true;
      }
      if (videoDetailPlaceholder) videoDetailPlaceholder.hidden = false;
    }

    videoDetailModal.hidden = false;
    document.body.classList.add('video-detail-open');
    window.setTimeout(() => videoDetailDialog?.focus({ preventScroll: true }), 0);
  }

  function updateVideoFilterReturn() {
    if (!videoFilterReturn || !videoArchiveControls) return;

    const threshold = videoArchiveControls.offsetTop + videoArchiveControls.offsetHeight + 140;
    videoFilterReturn.hidden = window.scrollY < threshold || document.body.classList.contains('video-detail-open');
  }

  if (videoPage) {
    renderVideoCardStats();
    renderLumiClipPreviewStats();
    renderVideoAutoBadges();

    if (videoHotSubview === 'hot-pick' || videoHotSubview === 'hot-clips') {
      videoCollection = 'HOT_CLIP';
      const hotButton = videoCollectionButtons.find((button) => button.dataset.videoCollection === 'HOT_CLIP');
      if (hotButton) setVideoPressedState(videoCollectionButtons, hotButton);
    }

    videoCollectionButtons.forEach((button) => {
      button.addEventListener('click', () => {
        videoCollection = button.dataset.videoCollection || 'ALL';
        videoVisibleLimit = videoInitialLimit;
        videoHotPickExpanded = false;
        videoHotAllExpanded = false;
        videoHotSubview = '';
        const url = new URL(window.location.href);
        url.searchParams.delete('view');
        window.history.replaceState({}, '', url);
        setVideoPressedState(videoCollectionButtons, button);
        renderVideoCards();
      });
    });

    videoHotPickToggle?.addEventListener('click', () => {
      setHotClipSubview('hot-pick');
    });

    videoHotAllToggle?.addEventListener('click', () => {
      setHotClipSubview('hot-clips');
    });

    videoHotSubviewBack?.addEventListener('click', () => {
      setHotClipSubview('');
    });

    videoHotPickMoreButton?.addEventListener('click', () => {
      videoHotPickExpanded = !videoHotPickExpanded;
      renderVideoCards();
      window.requestAnimationFrame(() => {
        videoHotPickSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    videoHotMoreButton?.addEventListener('click', () => {
      videoHotAllExpanded = !videoHotAllExpanded;
      renderVideoCards();
      window.requestAnimationFrame(() => {
        videoHotAllSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    window.addEventListener('popstate', () => {
      videoHotSubview = new URLSearchParams(window.location.search).get('view') || '';
      videoHotPickExpanded = false;
      videoHotAllExpanded = false;
      renderVideoCards();
    });

    videoMemberButtons.forEach((button) => {
      button.addEventListener('click', () => {
        videoMember = button.dataset.videoMember || 'ALL';
        videoVisibleLimit = videoInitialLimit;
        setVideoPressedState(videoMemberButtons, button);
        renderVideoCards();
      });
    });

    videoSearchInput?.addEventListener('input', () => {
      videoVisibleLimit = videoInitialLimit;
      renderVideoCards();
    });

    syncVideoSortControl();

    videoSortTrigger?.addEventListener('click', (event) => {
      event.stopPropagation();
      const isOpen = videoSortTrigger.getAttribute('aria-expanded') === 'true';
      setVideoSortMenuOpen(!isOpen);
    });

    videoSortTrigger?.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowDown') return;
      event.preventDefault();
      setVideoSortMenuOpen(true);
      const selectedOption = videoSortOptions.find((option) => option.getAttribute('aria-selected') === 'true');
      (selectedOption || videoSortOptions[0])?.focus();
    });

    videoSortOptions.forEach((option) => {
      option.addEventListener('click', () => {
        if (!videoSortSelect) return;
        videoSortSelect.value = option.dataset.value || 'latest';
        syncVideoSortControl();
        setVideoSortMenuOpen(false);
        videoSortSelect.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });

    videoSortMenu?.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      setVideoSortMenuOpen(false);
      videoSortTrigger?.focus({ preventScroll: true });
    });

    document.addEventListener('click', (event) => {
      if (videoSortControl?.contains(event.target)) return;
      setVideoSortMenuOpen(false);
    });

    videoSortSelect?.addEventListener('change', () => {
      syncVideoSortControl();
      videoVisibleLimit = videoInitialLimit;
      renderVideoCards();
    });

    syncVideoEventControl();

    videoEventTrigger?.addEventListener('click', (event) => {
      event.stopPropagation();
      const isOpen = videoEventTrigger.getAttribute('aria-expanded') === 'true';
      setVideoEventMenuOpen(!isOpen);
    });

    videoEventTrigger?.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowDown') return;
      event.preventDefault();
      setVideoEventMenuOpen(true);
      const selectedOption = videoEventOptions.find((option) => option.getAttribute('aria-selected') === 'true');
      (selectedOption || videoEventOptions[0])?.focus();
    });

    videoEventOptions.forEach((option) => {
      option.addEventListener('click', () => {
        if (!videoEventSelect) return;
        videoEventSelect.value = option.dataset.value || 'ALL';
        syncVideoEventControl();
        setVideoEventMenuOpen(false);
        videoEventTrigger?.focus({ preventScroll: true });
      });
    });

    videoEventMenu?.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      setVideoEventMenuOpen(false);
      videoEventTrigger?.focus({ preventScroll: true });
    });

    document.addEventListener('click', (event) => {
      if (videoEventControl?.contains(event.target)) return;
      setVideoEventMenuOpen(false);
    });

    videoLoadMoreButton?.addEventListener('click', () => {
      const matchingCount = videoCards.filter(matchesVideoCard).length;
      const isFullyExpanded = videoVisibleLimit >= matchingCount;

      if (isFullyExpanded && matchingCount > videoInitialLimit) {
        videoVisibleLimit = videoInitialLimit;
        renderVideoCards();

        window.requestAnimationFrame(() => {
          document.querySelector('.video-results')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        });
        return;
      }

      videoVisibleLimit += videoLoadStep;
      renderVideoCards();
    });

    videoFilterOpen?.addEventListener('click', () => setVideoFilterSheet(true));
    videoFilterClose?.addEventListener('click', () => setVideoFilterSheet(false));
    videoFilterOverlay?.addEventListener('click', () => setVideoFilterSheet(false));

    videoCards.forEach((card) => {
      const trigger = card.querySelector('.video-card-open');
      trigger?.addEventListener('click', () => openVideoDetail(card, trigger));
    });

    videoDetailCloseButtons.forEach((button) => {
      button.addEventListener('click', closeVideoDetail);
    });

    videoDetailSparkleButton?.addEventListener('click', () => {
      if (!currentVideoDetailCard) return;

      const wasSparkled = currentVideoDetailCard.dataset.sparkled === 'true';
      const currentCount = Number(currentVideoDetailCard.dataset.sparkles || 0);
      const nextCount = Math.max(0, currentCount + (wasSparkled ? -1 : 1));
      const isSparkled = !wasSparkled;

      currentVideoDetailCard.dataset.sparkled = String(isSparkled);
      syncVideoCardSparkles(currentVideoDetailCard, nextCount);

      if (videoDetailSparkles) {
        videoDetailSparkles.textContent = formatVideoNumber(nextCount);
      }

      videoDetailSparkleButton.classList.toggle('is-active', isSparkled);
      videoDetailSparkleButton.setAttribute('aria-pressed', String(isSparkled));
      setVideoDetailStatus(isSparkled ? '반짝응원을 보냈어요.' : '반짝응원을 취소했어요.');
    });

    videoDetailShareButton?.addEventListener('click', async () => {
      if (!currentVideoDetailCard) return;

      const title = currentVideoDetailCard.dataset.title || 'LUMIBELLE VIDEO';
      const externalUrl = videoDetailExternal?.getAttribute('aria-disabled') === 'false'
        ? videoDetailExternal.href
        : window.location.href;

      try {
        if (navigator.share) {
          await navigator.share({
            title,
            text: `${title} | LUMIBELLE VIDEO`,
            url: externalUrl,
          });
          setVideoDetailStatus('공유했어요.');
          return;
        }

        await navigator.clipboard.writeText(externalUrl);
        setVideoDetailStatus('영상 링크를 복사했어요.');
      } catch (error) {
        if (error?.name !== 'AbortError') {
          setVideoDetailStatus('공유하지 못했어요.');
        }
      }
    });

    videoFilterReturn?.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    });

    window.addEventListener('scroll', updateVideoFilterReturn, { passive: true });
    window.addEventListener('resize', updateVideoFilterReturn);

    videoFilterApply?.addEventListener('click', () => {
      videoCategory = getCheckedVideoValue('video-category');
      videoType = getCheckedVideoValue('video-type');
      videoPlatform = getCheckedVideoValue('video-platform');
      videoPeriod = getCheckedVideoValue('video-period');
      videoEvent = videoEventSelect?.value || 'ALL';
      videoVisibleLimit = videoInitialLimit;
      setVideoFilterSheet(false);
      renderVideoCards();
    });

    videoFilterReset?.addEventListener('click', () => {
      resetVideoDetailFilters();
      videoCategory = 'ALL';
      videoType = 'ALL';
      videoPlatform = 'ALL';
      videoPeriod = 'ALL';
      videoEvent = 'ALL';
      videoVisibleLimit = videoInitialLimit;
      renderVideoCards();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && videoDetailModal && !videoDetailModal.hidden) {
        closeVideoDetail();
        return;
      }

      if (event.key === 'Escape' && videoEventMenu && !videoEventMenu.hidden) {
        setVideoEventMenuOpen(false);
        videoEventTrigger?.focus({ preventScroll: true });
        return;
      }

      if (event.key === 'Escape' && videoFilterSheet && !videoFilterSheet.hidden) {
        setVideoFilterSheet(false);
      }
    });

    renderVideoCards();
    updateVideoFilterReturn();
  }

})();
