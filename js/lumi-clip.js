(() => {
  'use strict';

  const cards = Array.from(document.querySelectorAll('[data-clip-card]'));
  const grid = document.querySelector('[data-clip-grid]');
  const count = document.querySelector('[data-clip-count]');
  const empty = document.querySelector('[data-clip-empty]');
  const memberButtons = Array.from(document.querySelectorAll('[data-clip-member]'));
  const search = document.querySelector('[data-clip-search]');
  const sort = document.querySelector('[data-clip-sort]');
  const sortControl = document.querySelector('[data-clip-sort-control]');
  const sortTrigger = document.querySelector('[data-clip-sort-trigger]');
  const sortLabel = document.querySelector('[data-clip-sort-label]');
  const sortMenu = document.querySelector('[data-clip-sort-menu]');
  const sortOptions = Array.from(document.querySelectorAll('[data-clip-sort-option]'));
  const filterOpen = document.querySelector('[data-clip-filter-open]');
  const filterClose = document.querySelector('[data-clip-filter-close]');
  const filterApply = document.querySelector('[data-clip-filter-apply]');
  const filterReset = document.querySelector('[data-clip-filter-reset]');
  const filterSheet = document.querySelector('[data-clip-filter-sheet]');
  const filterOverlay = document.querySelector('[data-clip-filter-overlay]');
  const filterCount = document.querySelector('[data-clip-filter-count]');
  const viewer = document.querySelector('[data-lumi-viewer]');
  const feed = document.querySelector('[data-lumi-feed]');
  const slides = Array.from(document.querySelectorAll('[data-lumi-slide]'));
  const closeButton = document.querySelector('[data-lumi-close]');
  const current = document.querySelector('[data-lumi-current]');
  const total = document.querySelector('[data-lumi-total]');
  const hint = document.querySelector('[data-lumi-hint]');
  const commentsBackdrop = document.querySelector('[data-comments-backdrop]');
  const commentsSheet = document.querySelector('[data-comments-sheet]');
  const commentsClose = document.querySelector('[data-comments-close]');
  const commentsHandle = document.querySelector('[data-comments-handle]');
  const commentsList = document.querySelector('[data-comments-list]');
  const commentsCount = document.querySelector('[data-comments-count]');
  const commentAuth = document.querySelector('[data-comment-auth]');
  const commentLogin = document.querySelector('[data-comment-login]');
  const commentForm = document.querySelector('[data-comment-form]');
  const commentInput = document.querySelector('[data-comment-input]');
  const replyContext = document.querySelector('[data-reply-context]');
  const replyCancel = document.querySelector('[data-reply-cancel]');
  const actionsBackdrop = document.querySelector('[data-actions-backdrop]');
  const shareSheet = document.querySelector('[data-share-sheet]');
  const moreSheet = document.querySelector('[data-more-sheet]');
  const shareUrlText = document.querySelector('[data-share-url]');
  const toast = document.querySelector('[data-lumi-toast]');

  const storage = {
    read(key, fallback) {
      try {
        const value = window.localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
      } catch (error) {
        return fallback;
      }
    },
    write(key, value) {
      try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (error) { /* storage optional */ }
    }
  };

  let activeMember = 'ALL';
  let activeFilters = { type: 'ALL', tags: [], period: 'ALL' };
  let lastFocus = null;
  let toastTimer = 0;
  let activeSlide = slides[0] || null;
  let activeCommentSlide = null;
  let actionSlide = null;
  let replyTarget = null;
  let commentsCloseTimer = 0;
  let commentsDrag = null;
  let isMockAuthenticated = window.sessionStorage.getItem('lumiMockAuthenticated') === '1';
  const savedIds = new Set(storage.read('lumibelleSavedClips', []));
  const sparkleIds = new Set(storage.read('lumibelleSparkledClips', []));

  const commentTemplates = [
    ['반짝루미', '루', '오늘 클립도 너무 귀여워요. 다음 무대도 기대할게요.'],
    ['별빛나', '별', '이 부분 계속 돌려보는 중이에요 ✦'],
    ['LUMIBELLE', 'L', '반짝응원 고마워요. 새로운 클립도 곧 공개할게요.', true],
    ['핑크별', '핑', '오늘도 행복 충전 완료했어요.'],
    ['루미나링', '링', '무대 포인트가 정말 예뻐요.'],
    ['달빛토끼', '달', '다음 클립도 기다릴게요.']
  ];

  const commentsByClip = new Map();
  const now = Date.now();
  slides.forEach((slide, slideIndex) => {
    const shownCount = Number(slide.querySelector('[data-lumi-comment-count]')?.textContent || 0);
    const items = Array.from({ length: shownCount }, (_, index) => {
      const source = commentTemplates[index % commentTemplates.length];
      return {
        id: `${slide.dataset.id}-comment-${index + 1}`,
        author: source[0],
        avatar: source[1],
        official: Boolean(source[3]),
        text: source[2],
        createdAt: now - ((12 + index * 19 + slideIndex * 3) * 60 * 1000),
        likes: Math.max(1, 8 - index + slideIndex),
        liked: false,
        replies: []
      };
    });
    commentsByClip.set(slide.dataset.id, items);
  });

  const showToast = (message) => {
    if (!toast) return;
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.hidden = false;
    toastTimer = window.setTimeout(() => { toast.hidden = true; }, 1800);
  };

  const formatCompact = (value) => {
    if (value >= 10000) return `${Math.round(value / 1000)}K`;
    if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1).replace('.0', '')}K`;
    return String(value);
  };

  const formatPlaybackTime = (seconds) => {
    const safe = Math.max(0, Math.floor(Number(seconds) || 0));
    const minutes = Math.floor(safe / 60);
    const remainder = String(safe % 60).padStart(2, '0');
    return `${minutes}:${remainder}`;
  };

  const formatRelativeTime = (timestamp) => {
    const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
    if (seconds < 60) return '방금 전';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}분 전`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;
    const days = Math.floor(hours / 24);
    return `${days}일 전`;
  };

  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);

  const clipUrl = (slide = activeSlide) => {
    const url = new URL(location.href);
    const id = slide?.dataset.id || '';
    url.hash = id ? encodeURIComponent(id) : '';
    return url.toString();
  };

  const copyText = async (text) => {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
      else {
        const input = document.createElement('textarea');
        input.value = text;
        input.style.position = 'fixed';
        input.style.opacity = '0';
        document.body.append(input);
        input.select();
        document.execCommand('copy');
        input.remove();
      }
      return true;
    } catch (error) {
      return false;
    }
  };

  const requireLogin = (message) => {
    if (isMockAuthenticated) return true;
    showToast(message);
    return false;
  };

  const syncAuthUi = () => {
    if (commentAuth) commentAuth.hidden = isMockAuthenticated;
    if (commentForm) commentForm.hidden = !isMockAuthenticated;
  };

  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let previewCard = null;
  let hoverPreviewTimer = 0;
  let scrollStopTimer = 0;
  let lastScrollY = window.scrollY;
  let scrollDirection = 1;
  let youtubeApiPromise = null;
  const cardYoutubePlayers = new WeakMap();
  const cardYoutubePlayerPromises = new WeakMap();
  const cardYoutubeProgressTimers = new WeakMap();
  const feedYoutubePlayers = new WeakMap();
  const feedYoutubePlayerPromises = new WeakMap();
  const feedYoutubeProgressTimers = new WeakMap();
  const feedYoutubeProgressMeta = new WeakMap();
  let activeProgressDrag = null;
  let feedSoundEnabled = false;

  const loadYouTubeApi = () => {
    if (window.YT?.Player) return Promise.resolve(window.YT);
    if (youtubeApiPromise) return youtubeApiPromise;
    youtubeApiPromise = new Promise((resolve, reject) => {
      const previousReady = window.onYouTubeIframeAPIReady;
      const timeout = window.setTimeout(() => reject(new Error('YouTube API loading timed out')), 12000);
      window.onYouTubeIframeAPIReady = () => {
        window.clearTimeout(timeout);
        if (typeof previousReady === 'function') previousReady();
        resolve(window.YT);
      };
      if (!document.querySelector('script[data-youtube-iframe-api]')) {
        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        script.async = true;
        script.dataset.youtubeIframeApi = '';
        script.onerror = () => {
          window.clearTimeout(timeout);
          reject(new Error('YouTube API failed to load'));
        };
        document.head.append(script);
      }
    }).catch((error) => {
      youtubeApiPromise = null;
      throw error;
    });
    return youtubeApiPromise;
  };

  const clearCardYoutubeProgress = (card) => {
    const timer = cardYoutubeProgressTimers.get(card);
    if (timer) window.clearInterval(timer);
    cardYoutubeProgressTimers.delete(card);
  };

  const startCardYoutubeProgress = (card, player) => {
    clearCardYoutubeProgress(card);
    const progress = card.querySelector('.lumi-list-preview-progress i');
    const update = () => {
      if (!progress || previewCard !== card) return;
      const duration = Number(player.getDuration?.() || 0);
      const currentTime = Number(player.getCurrentTime?.() || 0);
      if (duration > 0) progress.style.transform = `scaleX(${Math.min(1, currentTime / duration)})`;
    };
    update();
    cardYoutubeProgressTimers.set(card, window.setInterval(update, 120));
  };

  const ensureCardYoutubePlayer = async (card) => {
    const existing = cardYoutubePlayers.get(card);
    if (existing) return existing;
    const pending = cardYoutubePlayerPromises.get(card);
    if (pending) return pending;
    const host = card.querySelector('[data-clip-youtube-player]');
    const videoId = card.dataset.youtubeId;
    if (!host || !videoId) return null;
    const YT = await loadYouTubeApi();
    const promise = new Promise((resolve, reject) => {
      let settled = false;
      new YT.Player(host, {
        width: '100%',
        height: '100%',
        videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          loop: 1,
          playlist: videoId,
          playsinline: 1,
          rel: 0
        },
        events: {
          onReady(event) {
            settled = true;
            event.target.mute();
            cardYoutubePlayers.set(card, event.target);
            cardYoutubePlayerPromises.delete(card);
            resolve(event.target);
          },
          onStateChange(event) {
            if (event.data === YT.PlayerState.PLAYING) startCardYoutubeProgress(card, event.target);
            if (event.data === YT.PlayerState.ENDED && previewCard === card) {
              event.target.seekTo(0, true);
              event.target.playVideo();
            }
          },
          onError() {
            clearCardYoutubeProgress(card);
            cardYoutubePlayerPromises.delete(card);
            if (!settled) reject(new Error('YouTube preview player failed'));
          }
        }
      });
    });
    cardYoutubePlayerPromises.set(card, promise);
    return promise;
  };

  const clearFeedYoutubeProgress = (slide) => {
    const timer = feedYoutubeProgressTimers.get(slide);
    if (timer) window.clearInterval(timer);
    feedYoutubeProgressTimers.delete(slide);
  };

  const syncFeedYoutubeStage = (slide, state) => {
    const stage = slide.querySelector('.lumi-feed-stage');
    if (!stage) return;
    stage.classList.remove('is-loading', 'is-playing', 'is-paused');
    stage.classList.add(state);
  };

  const syncFeedSoundUi = () => {
    slides.forEach((slide) => {
      const button = slide.querySelector('[data-lumi-sound]');
      if (!button) return;
      button.classList.toggle('is-unmuted', feedSoundEnabled);
      button.setAttribute('aria-pressed', String(feedSoundEnabled));
      button.setAttribute('aria-label', feedSoundEnabled ? '소리 끄기' : '소리 켜기');
    });
  };

  const applyFeedSoundPreference = (player) => {
    if (!player) return;
    try {
      if (feedSoundEnabled) {
        player.unMute?.();
        player.setVolume?.(100);
      } else {
        player.mute?.();
      }
    } catch (error) { /* player may still be initializing */ }
  };

  const startFeedYoutubeProgress = (slide, player) => {
    clearFeedYoutubeProgress(slide);
    const bar = slide.querySelector('[data-lumi-youtube-progress] i');
    const update = () => {
      if (!bar) return;
      const duration = Number(player.getDuration?.() || 0);
      const currentTime = Number(player.getCurrentTime?.() || 0);
      feedYoutubeProgressMeta.set(slide, { duration, currentTime });
      if (duration > 0 && activeProgressDrag?.slide !== slide) {
        paintFeedProgress(slide, currentTime / duration, currentTime);
      }
    };
    update();
    feedYoutubeProgressTimers.set(slide, window.setInterval(update, 100));
  };

  const feedProgressRatio = (event, track) => {
    const rect = track.getBoundingClientRect();
    if (!rect.width) return 0;
    return Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
  };

  const paintFeedProgress = (slide, ratio, previewTime = null) => {
    const track = slide?.querySelector('[data-lumi-youtube-progress]');
    if (!track) return;
    const clamped = Math.max(0, Math.min(1, ratio));
    track.style.setProperty('--lumi-progress', String(clamped));
    const time = track.querySelector('[data-lumi-progress-time]');
    if (time) {
      const meta = feedYoutubeProgressMeta.get(slide) || {};
      const duration = Number(meta.duration || 0);
      const seconds = previewTime == null ? duration * clamped : Number(previewTime || 0);
      time.textContent = formatPlaybackTime(seconds);
    }
  };

  const seekFeedYoutube = (slide, ratio) => {
    const player = feedYoutubePlayers.get(slide);
    if (!player?.seekTo) return;
    const meta = feedYoutubeProgressMeta.get(slide) || {};
    const duration = Number(player.getDuration?.() || meta.duration || 0);
    if (duration <= 0) return;
    const clamped = Math.max(0, Math.min(1, ratio));
    const targetTime = duration * clamped;
    player.seekTo(targetTime, true);
    feedYoutubeProgressMeta.set(slide, { duration, currentTime: targetTime });
    paintFeedProgress(slide, clamped, targetTime);
  };

  const finishFeedProgressDrag = (event) => {
    if (!activeProgressDrag || (event && event.pointerId !== activeProgressDrag.pointerId)) return;
    const { slide, track, wasPlaying, pointerId } = activeProgressDrag;
    if (event) {
      const ratio = feedProgressRatio(event, track);
      paintFeedProgress(slide, ratio);
      seekFeedYoutube(slide, ratio);
    }
    slide.querySelector('.lumi-feed-stage')?.classList.remove('is-seeking');
    try { track.releasePointerCapture?.(pointerId); } catch (error) { /* pointer capture may already be released */ }
    activeProgressDrag = null;
    if (wasPlaying) {
      try { feedYoutubePlayers.get(slide)?.playVideo?.(); } catch (error) { /* player may still be initializing */ }
    }
  };

  const bindFeedProgress = () => {
    viewer?.querySelectorAll('[data-lumi-youtube-progress]').forEach((track) => {
      const slide = track.closest('[data-lumi-slide]');
      if (!slide) return;
      track.addEventListener('pointerdown', (event) => {
        if (slide !== activeSlide || viewer?.hidden) return;
        event.preventDefault();
        event.stopPropagation();
        const stage = slide.querySelector('.lumi-feed-stage');
        const wasPlaying = stage?.classList.contains('is-playing') || false;
        activeProgressDrag = { slide, track, wasPlaying, pointerId: event.pointerId };
        stage?.classList.add('is-seeking');
        try { track.setPointerCapture?.(event.pointerId); } catch (error) { /* pointer capture is optional */ }
        try { feedYoutubePlayers.get(slide)?.pauseVideo?.(); } catch (error) { /* player may still be initializing */ }
        const ratio = feedProgressRatio(event, track);
        paintFeedProgress(slide, ratio);
        seekFeedYoutube(slide, ratio);
      });
      track.addEventListener('pointermove', (event) => {
        if (!activeProgressDrag || activeProgressDrag.track !== track || activeProgressDrag.pointerId !== event.pointerId) return;
        event.preventDefault();
        const ratio = feedProgressRatio(event, track);
        paintFeedProgress(slide, ratio);
        seekFeedYoutube(slide, ratio);
      });
      track.addEventListener('pointerup', finishFeedProgressDrag);
      track.addEventListener('pointercancel', finishFeedProgressDrag);
    });
  };

  const ensureFeedYoutubePlayer = async (slide) => {
    const existing = feedYoutubePlayers.get(slide);
    if (existing) return existing;
    const pending = feedYoutubePlayerPromises.get(slide);
    if (pending) return pending;
    const host = slide.querySelector('[data-lumi-youtube-player]');
    const videoId = slide.dataset.youtubeId;
    if (!host || !videoId) return null;
    const YT = await loadYouTubeApi();
    const promise = new Promise((resolve, reject) => {
      let settled = false;
      new YT.Player(host, {
        width: '100%',
        height: '100%',
        videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          loop: 1,
          playlist: videoId,
          playsinline: 1,
          rel: 0
        },
        events: {
          onReady(event) {
            settled = true;
            applyFeedSoundPreference(event.target);
            feedYoutubePlayers.set(slide, event.target);
            feedYoutubePlayerPromises.delete(slide);
            resolve(event.target);
            if (viewer && !viewer.hidden && activeSlide === slide) {
              event.target.playVideo();
              window.setTimeout(() => {
                if (event.target.getPlayerState?.() !== YT.PlayerState.PLAYING) syncFeedYoutubeStage(slide, 'is-paused');
              }, 900);
            }
          },
          onStateChange(event) {
            if (event.data === YT.PlayerState.PLAYING) {
              syncFeedYoutubeStage(slide, 'is-playing');
              startFeedYoutubeProgress(slide, event.target);
            } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.CUED) {
              clearFeedYoutubeProgress(slide);
              if (viewer && !viewer.hidden && activeSlide === slide) syncFeedYoutubeStage(slide, 'is-paused');
            } else if (event.data === YT.PlayerState.ENDED && viewer && !viewer.hidden && activeSlide === slide) {
              event.target.seekTo(0, true);
              event.target.playVideo();
            }
          },
          onError() {
            clearFeedYoutubeProgress(slide);
            syncFeedYoutubeStage(slide, 'is-paused');
            feedYoutubePlayerPromises.delete(slide);
            showToast('이 YouTube 영상은 임베드 재생을 지원하지 않을 수 있어요');
            if (!settled) reject(new Error('YouTube feed player failed'));
          }
        }
      });
    });
    feedYoutubePlayerPromises.set(slide, promise);
    return promise;
  };

  const pauseFeedYoutubeSlide = (slide, reset = false) => {
    const player = feedYoutubePlayers.get(slide);
    clearFeedYoutubeProgress(slide);
    try { if (player?.pauseVideo) player.pauseVideo(); } catch (error) { /* player may still be initializing */ }
    try { if (reset && player?.seekTo) player.seekTo(0, true); } catch (error) { /* player may still be initializing */ }
    if (reset) {
      feedYoutubeProgressMeta.set(slide, { duration: Number(player?.getDuration?.() || 0), currentTime: 0 });
      paintFeedProgress(slide, 0, 0);
    }
  };

  const activateSlidePlayback = async (slide) => {
    slides.forEach((item) => {
      if (item !== slide) {
        pauseFeedYoutubeSlide(item);
        item.querySelector('.lumi-feed-stage')?.classList.remove('is-playing', 'is-paused');
      }
    });
    if (!slide?.dataset.youtubeId) {
      slide?.querySelector('.lumi-feed-stage')?.classList.add('is-playing');
      return;
    }
    syncFeedYoutubeStage(slide, 'is-loading');
    try {
      const player = await ensureFeedYoutubePlayer(slide);
      if (!player || activeSlide !== slide || viewer?.hidden) return;
      applyFeedSoundPreference(player);
      player.playVideo();
    } catch (error) {
      syncFeedYoutubeStage(slide, 'is-paused');
      showToast('YouTube 플레이어를 불러오지 못했어요');
    }
  };

  const toggleFeedYoutubeSlide = async (slide) => {
    try {
      const YT = await loadYouTubeApi();
      const player = await ensureFeedYoutubePlayer(slide);
      if (!player) return;
      if (player.getPlayerState?.() === YT.PlayerState.PLAYING) player.pauseVideo();
      else {
        applyFeedSoundPreference(player);
        player.playVideo();
      }
    } catch (error) {
      showToast('YouTube 플레이어를 불러오지 못했어요');
    }
  };

  const toggleFeedSound = async (slide) => {
    try {
      const player = await ensureFeedYoutubePlayer(slide);
      if (!player) return;
      feedSoundEnabled = !feedSoundEnabled;
      applyFeedSoundPreference(player);
      syncFeedSoundUi();
      showToast(feedSoundEnabled ? '영상 소리를 켰어요' : '영상 소리를 껐어요');
    } catch (error) {
      showToast('소리 설정을 변경하지 못했어요');
    }
  };

  const stopCardPreview = (card = previewCard) => {
    if (!card) return;
    card.classList.remove('is-previewing');
    card.removeAttribute('data-preview-state');
    clearCardYoutubeProgress(card);
    const youtubePlayer = cardYoutubePlayers.get(card);
    try { if (youtubePlayer?.pauseVideo) youtubePlayer.pauseVideo(); } catch (error) { /* player may still be initializing */ }
    try { if (youtubePlayer?.seekTo) youtubePlayer.seekTo(0, true); } catch (error) { /* player may still be initializing */ }
    const video = card.querySelector('[data-clip-preview-video]');
    if (video) {
      video.pause();
      try { video.currentTime = 0; } catch (error) { /* metadata may not be ready */ }
      video.ontimeupdate = null;
      video.onended = null;
    }
    const progress = card.querySelector('.lumi-list-preview-progress i');
    progress?.style.removeProperty('transform');
    progress?.style.removeProperty('animation');
    if (previewCard === card) previewCard = null;
  };

  const startCardPreview = async (card) => {
    if (!card || card.hidden || reducedMotion.matches || (viewer && !viewer.hidden)) return;
    if (previewCard === card) return;
    stopCardPreview();
    previewCard = card;
    card.classList.add('is-previewing');
    card.dataset.previewState = 'playing';

    if (card.dataset.youtubeId) {
      try {
        const player = await ensureCardYoutubePlayer(card);
        if (!player || previewCard !== card) return;
        player.mute();
        player.seekTo(0, true);
        player.playVideo();
        startCardYoutubeProgress(card, player);
      } catch (error) {
        /* Keep the thumbnail and CSS preview as a graceful fallback. */
      }
      return;
    }

    const video = card.querySelector('[data-clip-preview-video]');
    const progress = card.querySelector('.lumi-list-preview-progress i');
    if (!video) return;
    video.muted = true;
    video.playsInline = true;
    try { video.currentTime = 0; } catch (error) { /* metadata may not be ready */ }
    if (progress) progress.style.animation = 'none';
    video.ontimeupdate = () => {
      if (!progress || !Number.isFinite(video.duration) || video.duration <= 0) return;
      progress.style.transform = `scaleX(${Math.min(1, video.currentTime / video.duration)})`;
    };
    video.onended = () => {
      try { video.currentTime = 0; } catch (error) { /* optional */ }
      video.play().catch(() => stopCardPreview(card));
    };
    video.play().catch(() => stopCardPreview(card));
  };

  const visiblePreviewCandidates = () => {
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const viewportCenter = viewportHeight / 2;
    return cards
      .filter((card) => !card.hidden)
      .map((card) => {
        const rect = card.getBoundingClientRect();
        const visibleHeight = Math.max(0, Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0));
        const ratio = rect.height > 0 ? visibleHeight / rect.height : 0;
        return {
          card,
          ratio,
          distance: Math.abs((rect.top + rect.bottom) / 2 - viewportCenter),
          left: rect.left,
          index: Number(card.dataset.index || 0)
        };
      })
      .filter((item) => item.ratio >= .55)
      .sort((a, b) => {
        const distanceGap = a.distance - b.distance;
        if (Math.abs(distanceGap) > 2) return distanceGap;
        if (Math.abs(a.left - b.left) > 2) return a.left - b.left;
        return scrollDirection >= 0 ? a.index - b.index : b.index - a.index;
      });
  };

  const selectMobilePreview = () => {
    if (finePointer.matches || reducedMotion.matches || (viewer && !viewer.hidden)) {
      stopCardPreview();
      return;
    }
    const candidate = visiblePreviewCandidates()[0];
    if (candidate) startCardPreview(candidate.card);
    else stopCardPreview();
  };

  const queueMobilePreview = (delay = 220) => {
    window.clearTimeout(scrollStopTimer);
    if (finePointer.matches || reducedMotion.matches) return;
    scrollStopTimer = window.setTimeout(selectMobilePreview, delay);
  };

  const handlePageScroll = () => {
    const currentY = window.scrollY;
    scrollDirection = currentY >= lastScrollY ? 1 : -1;
    lastScrollY = currentY;
    if (!finePointer.matches) stopCardPreview();
    queueMobilePreview(240);
  };

  cards.forEach((card) => {
    const trigger = card.querySelector('[data-clip-open]');
    trigger?.addEventListener('pointerenter', () => {
      if (!finePointer.matches || reducedMotion.matches) return;
      window.clearTimeout(hoverPreviewTimer);
      hoverPreviewTimer = window.setTimeout(() => startCardPreview(card), 300);
    });
    trigger?.addEventListener('pointerleave', () => {
      window.clearTimeout(hoverPreviewTimer);
      if (finePointer.matches) stopCardPreview(card);
    });
    trigger?.addEventListener('blur', () => {
      if (finePointer.matches) stopCardPreview(card);
    });
  });

  window.addEventListener('scroll', handlePageScroll, { passive: true });
  window.addEventListener('resize', () => queueMobilePreview(180));
  finePointer.addEventListener?.('change', () => {
    stopCardPreview();
    queueMobilePreview(100);
  });
  reducedMotion.addEventListener?.('change', () => {
    stopCardPreview();
    queueMobilePreview(100);
  });

  const renderCards = () => {
    if (!grid) return;
    const query = (search?.value || '').trim().toLowerCase();
    const referenceDate = Math.max(...cards.map((card) => new Date(card.dataset.published).getTime()));
    const matching = cards.filter((card) => {
      const memberMatch = activeMember === 'ALL' || card.dataset.member === activeMember;
      const haystack = `${card.dataset.title || ''} ${card.dataset.member || ''} ${card.dataset.tags || ''}`.toLowerCase();
      const type = card.querySelector('.lumi-list-badges em')?.textContent?.trim().toUpperCase() || '';
      const typeMatch = activeFilters.type === 'ALL' || type === activeFilters.type;
      const tagText = (card.dataset.tags || '').toLowerCase();
      const tagsMatch = activeFilters.tags.length === 0 || activeFilters.tags.every((tag) => tagText.includes(tag.toLowerCase()));
      const ageDays = Math.floor((referenceDate - new Date(card.dataset.published).getTime()) / 86400000);
      const periodMatch = activeFilters.period === 'ALL' || ageDays < Number(activeFilters.period);
      return memberMatch && typeMatch && tagsMatch && periodMatch && (!query || haystack.includes(query));
    });

    const mode = sort?.value || 'latest';
    matching.sort((a, b) => {
      if (mode === 'popular') return Number(b.dataset.views) - Number(a.dataset.views);
      if (mode === 'sparkles') return Number(b.dataset.sparkles) - Number(a.dataset.sparkles);
      return new Date(b.dataset.published).getTime() - new Date(a.dataset.published).getTime();
    });

    matching.forEach((card) => grid.append(card));
    cards.forEach((card) => { card.hidden = !matching.includes(card); });
    if (count) count.textContent = String(matching.length);
    if (empty) empty.hidden = matching.length !== 0;
    if (previewCard && !matching.includes(previewCard)) stopCardPreview(previewCard);
    queueMobilePreview(120);
  };

  memberButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activeMember = button.dataset.clipMember || 'ALL';
      memberButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      renderCards();
    });
  });
  search?.addEventListener('input', renderCards);
  sort?.addEventListener('change', renderCards);

  const setSortOpen = (open) => {
    if (!sortControl || !sortTrigger || !sortMenu) return;
    sortControl.classList.toggle('is-open', open);
    sortTrigger.setAttribute('aria-expanded', String(open));
    sortMenu.hidden = !open;
  };

  const syncSortUi = () => {
    const value = sort?.value || 'latest';
    const selected = sortOptions.find((option) => option.dataset.value === value);
    if (sortLabel) sortLabel.textContent = selected?.textContent?.trim() || '최신순';
    sortOptions.forEach((option) => option.setAttribute('aria-selected', String(option === selected)));
  };

  sortTrigger?.addEventListener('click', (event) => {
    event.stopPropagation();
    setSortOpen(sortTrigger.getAttribute('aria-expanded') !== 'true');
  });
  sortOptions.forEach((option) => option.addEventListener('click', () => {
    if (!sort) return;
    sort.value = option.dataset.value || 'latest';
    syncSortUi();
    setSortOpen(false);
    renderCards();
  }));
  document.addEventListener('click', (event) => {
    if (sortControl?.contains(event.target)) return;
    setSortOpen(false);
  });

  const readPendingFilters = () => ({
    type: document.querySelector('input[name="clip-type"]:checked')?.value || 'ALL',
    tags: Array.from(document.querySelectorAll('input[name="clip-tag"]:checked')).map((input) => input.value),
    period: document.querySelector('input[name="clip-period"]:checked')?.value || 'ALL'
  });

  const syncFilterCount = () => {
    const amount = (activeFilters.type !== 'ALL' ? 1 : 0) + activeFilters.tags.length + (activeFilters.period !== 'ALL' ? 1 : 0);
    if (filterCount) {
      filterCount.textContent = String(amount);
      filterCount.hidden = amount === 0;
    }
    filterOpen?.classList.toggle('is-active', amount > 0);
  };

  const setFilterOpen = (open) => {
    if (!filterSheet || !filterOverlay) return;
    filterSheet.hidden = !open;
    filterOverlay.hidden = !open;
    document.body.classList.toggle('video-filter-open', open);
    if (open) filterClose?.focus({ preventScroll: true });
  };

  filterOpen?.addEventListener('click', () => setFilterOpen(true));
  filterClose?.addEventListener('click', () => setFilterOpen(false));
  filterOverlay?.addEventListener('click', () => setFilterOpen(false));
  filterApply?.addEventListener('click', () => {
    activeFilters = readPendingFilters();
    syncFilterCount();
    renderCards();
    setFilterOpen(false);
  });
  filterReset?.addEventListener('click', () => {
    document.querySelector('input[name="clip-type"][value="ALL"]')?.click();
    document.querySelector('input[name="clip-period"][value="ALL"]')?.click();
    document.querySelectorAll('input[name="clip-tag"]').forEach((input) => { input.checked = false; });
    activeFilters = { type: 'ALL', tags: [], period: 'ALL' };
    syncFilterCount();
    renderCards();
  });
  syncSortUi();
  syncFilterCount();

  const updateCommentButtonCount = (slide) => {
    if (!slide) return;
    const items = commentsByClip.get(slide.dataset.id) || [];
    const totalItems = items.reduce((sum, item) => sum + 1 + item.replies.length, 0);
    const buttonCount = slide.querySelector('[data-lumi-comment-count]');
    if (buttonCount) buttonCount.textContent = String(totalItems);
    if (activeCommentSlide === slide && commentsCount) commentsCount.textContent = String(totalItems);
  };

  const commentMarkup = (comment, reply = false) => {
    const articleClass = reply ? 'lumi-comment-reply' : '';
    const officialAvatar = comment.official ? ' lumi-comment-avatar--official' : '';
    const official = comment.official ? '<svg aria-hidden="true" class="lumi-comment-official-badge" viewBox="0 0 24 24"><path d="M12 1.8 15 4l3.7-.1.9 3.5 2.9 2.3-1.3 3.5 1.3 3.5-2.9 2.3-.9 3.5-3.7-.1-3 2.2-3-2.2-3.7.1-.9-3.5-2.9-2.3 1.3-3.5-1.3-3.5 2.9-2.3.9-3.5L9 4l3-2.2Z"></path><path d="m8.4 12.1 2.2 2.2 4.9-5"></path></svg>' : '';
    return `<article${articleClass ? ` class="${articleClass}"` : ''} data-comment-id="${escapeHtml(comment.id)}">
      <span class="lumi-comment-avatar${officialAvatar}">${escapeHtml(comment.avatar)}</span>
      <div><span class="lumi-comment-meta"><strong>${escapeHtml(comment.author)}</strong>${official}<time datetime="${new Date(comment.createdAt).toISOString()}">${formatRelativeTime(comment.createdAt)}</time></span><p>${escapeHtml(comment.text)}</p><div class="lumi-comment-actions"><button type="button" data-comment-like class="${comment.liked ? 'is-liked' : ''}" aria-label="좋아요 ${comment.likes}개"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 20.5S3.5 15.2 3.5 8.6A4.6 4.6 0 0 1 12 6a4.6 4.6 0 0 1 8.5 2.6c0 6.6-8.5 11.9-8.5 11.9Z"></path></svg><span>${comment.likes}</span></button>${reply ? '' : '<button type="button" data-comment-reply>답글</button>'}</div></div>
    </article>`;
  };

  const renderComments = () => {
    if (!commentsList || !activeCommentSlide) return;
    const items = commentsByClip.get(activeCommentSlide.dataset.id) || [];
    commentsList.innerHTML = items.map((comment) => {
      const replies = comment.replies.length ? `<div class="lumi-comment-replies">${comment.replies.map((reply) => commentMarkup(reply, true)).join('')}</div>` : '';
      return `<div class="lumi-comment-thread">${commentMarkup(comment)}${replies}</div>`;
    }).join('');
    updateCommentButtonCount(activeCommentSlide);
  };

  const finishCommentsClose = () => {
    if (!commentsSheet || !commentsBackdrop) return;
    commentsSheet.hidden = true;
    commentsBackdrop.hidden = true;
    commentsSheet.style.removeProperty('transform');
    commentsBackdrop.style.removeProperty('opacity');
    viewer?.classList.remove('is-comments-mode');
    slides.forEach((slide) => slide.classList.remove('is-comments-active'));
  };

  const closeComments = () => {
    if (!commentsSheet || !commentsBackdrop || commentsSheet.hidden) return;
    window.clearTimeout(commentsCloseTimer);
    commentsDrag = null;
    commentsSheet.classList.remove('is-dragging');
    commentsSheet.style.removeProperty('transform');
    commentsBackdrop.style.removeProperty('opacity');
    commentsSheet.classList.remove('is-open');
    commentsBackdrop.classList.remove('is-open');
    viewer?.classList.remove('is-comments-mode');
    activeCommentSlide?.classList.remove('is-comments-active');
    replyTarget = null;
    if (replyContext) replyContext.hidden = true;
    commentsCloseTimer = window.setTimeout(finishCommentsClose, 240);
    feed?.focus({ preventScroll: true });
  };

  const openComments = (slide) => {
    if (!commentsSheet || !commentsBackdrop) return;
    window.clearTimeout(commentsCloseTimer);
    activeCommentSlide = slide || activeSlide;
    slides.forEach((item) => item.classList.toggle('is-comments-active', item === activeCommentSlide));
    renderComments();
    syncAuthUi();
    commentsSheet.hidden = false;
    commentsBackdrop.hidden = false;
    commentsSheet.classList.remove('is-dragging');
    commentsSheet.style.removeProperty('transform');
    commentsBackdrop.style.removeProperty('opacity');
    requestAnimationFrame(() => {
      viewer?.classList.add('is-comments-mode');
      commentsSheet.classList.add('is-open');
      commentsBackdrop.classList.add('is-open');
    });
    commentsClose?.focus({ preventScroll: true });
  };

  const resetCommentsDrag = () => {
    if (!commentsSheet || !commentsBackdrop) return;
    commentsDrag = null;
    commentsSheet.classList.remove('is-dragging');
    commentsSheet.style.removeProperty('transform');
    commentsBackdrop.style.removeProperty('opacity');
  };

  const finishCommentsDrag = (event) => {
    if (!commentsDrag || (event && event.pointerId !== commentsDrag.pointerId)) return;
    const delta = Math.max(0, (event?.clientY || commentsDrag.lastY) - commentsDrag.startY);
    const threshold = Math.max(72, commentsSheet.offsetHeight * .14);
    try { commentsHandle?.releasePointerCapture?.(commentsDrag.pointerId); } catch (error) { /* optional */ }
    if (delta >= threshold) {
      resetCommentsDrag();
      closeComments();
      return;
    }
    resetCommentsDrag();
  };

  const closeActionSheets = () => {
    if (actionsBackdrop) actionsBackdrop.hidden = true;
    if (shareSheet) shareSheet.hidden = true;
    if (moreSheet) moreSheet.hidden = true;
    actionSlide = null;
  };

  const openActionSheet = (type, slide) => {
    closeComments();
    actionSlide = slide || activeSlide;
    if (actionsBackdrop) actionsBackdrop.hidden = false;
    if (shareSheet) shareSheet.hidden = type !== 'share';
    if (moreSheet) moreSheet.hidden = type !== 'more';
    if (shareUrlText) shareUrlText.textContent = clipUrl(actionSlide);
    const sheet = type === 'share' ? shareSheet : moreSheet;
    sheet?.querySelector('[data-action-close]')?.focus({ preventScroll: true });
  };

  const setActiveSlide = (index, smooth = false) => {
    const slide = slides[index];
    if (!slide || !feed) return;
    activeSlide = slide;
    feed.scrollTo({ top: slide.offsetTop, behavior: smooth ? 'smooth' : 'auto' });
    if (current) current.textContent = String(index + 1);
  };

  const openViewer = (index, trigger = null) => {
    const targetSlide = slides[index];
    if (!viewer || !feed || !targetSlide) return;
    stopCardPreview();
    lastFocus = trigger || document.activeElement;

    // Disable the feed's smooth scrolling while opening. Without this,
    // opening clip 8 visibly races through clips 1–7 before it settles.
    viewer.classList.add('is-opening');
    feed.style.setProperty('scroll-behavior', 'auto');
    feed.style.setProperty('scroll-snap-type', 'none');
    viewer.hidden = false;
    document.body.classList.add('lumi-feed-open');
    if (total) total.textContent = String(slides.length);

    activeSlide = targetSlide;
    if (current) current.textContent = String(index + 1);

    const placeTargetImmediately = () => {
      const targetTop = targetSlide.offsetTop;
      feed.scrollTo({ top: targetTop, behavior: 'auto' });
      feed.scrollTop = targetTop;
    };

    requestAnimationFrame(() => {
      placeTargetImmediately();
      requestAnimationFrame(() => {
        placeTargetImmediately();
        feed.style.removeProperty('scroll-behavior');
        feed.style.removeProperty('scroll-snap-type');
        viewer.classList.remove('is-opening');
        activateSlidePlayback(targetSlide);
        closeButton?.focus({ preventScroll: true });
      });
    });
  };

  const closeViewer = () => {
    if (!viewer) return;
    closeComments();
    closeActionSheets();
    viewer.classList.remove('is-opening');
    viewer.hidden = true;
    document.body.classList.remove('lumi-feed-open');
    slides.forEach((slide) => {
      pauseFeedYoutubeSlide(slide, true);
      slide.querySelector('.lumi-feed-stage')?.classList.remove('is-loading', 'is-playing', 'is-paused');
    });
    if (lastFocus instanceof HTMLElement) lastFocus.focus({ preventScroll: true });
    queueMobilePreview(180);
  };

  syncFeedSoundUi();
  bindFeedProgress();

  cards.forEach((card) => {
    card.querySelector('[data-clip-open]')?.addEventListener('click', (event) => {
      const index = slides.findIndex((slide) => slide.dataset.id === card.dataset.id);
      openViewer(Math.max(0, index), event.currentTarget);
    });
  });

  closeButton?.addEventListener('click', closeViewer);
  commentsClose?.addEventListener('click', closeComments);
  commentsBackdrop?.addEventListener('click', closeComments);
  commentsHandle?.addEventListener('pointerdown', (event) => {
    if (!commentsSheet || commentsSheet.hidden) return;
    event.preventDefault();
    commentsDrag = { pointerId: event.pointerId, startY: event.clientY, lastY: event.clientY };
    commentsSheet.classList.add('is-dragging');
    try { commentsHandle.setPointerCapture?.(event.pointerId); } catch (error) { /* optional */ }
  });
  commentsHandle?.addEventListener('pointermove', (event) => {
    if (!commentsDrag || event.pointerId !== commentsDrag.pointerId || !commentsSheet || !commentsBackdrop) return;
    event.preventDefault();
    commentsDrag.lastY = event.clientY;
    const delta = Math.max(0, event.clientY - commentsDrag.startY);
    commentsSheet.style.transform = `translateY(${delta}px)`;
  });
  commentsHandle?.addEventListener('pointerup', finishCommentsDrag);
  commentsHandle?.addEventListener('pointercancel', finishCommentsDrag);
  actionsBackdrop?.addEventListener('click', closeActionSheets);
  document.querySelectorAll('[data-action-close]').forEach((button) => button.addEventListener('click', closeActionSheets));

  slides.forEach((slide) => {
    const clipId = slide.dataset.id;
    const saveButton = slide.querySelector('[data-lumi-save]');
    const sparkleButton = slide.querySelector('[data-lumi-sparkle]');

    saveButton?.classList.toggle('is-active', savedIds.has(clipId));
    saveButton?.setAttribute('aria-pressed', String(savedIds.has(clipId)));
    sparkleButton?.classList.toggle('is-active', sparkleIds.has(clipId));
    sparkleButton?.setAttribute('aria-pressed', String(sparkleIds.has(clipId)));

    slide.querySelector('[data-lumi-play]')?.addEventListener('click', () => {
      if (slide.dataset.youtubeId) {
        toggleFeedYoutubeSlide(slide);
        return;
      }
      const stage = slide.querySelector('.lumi-feed-stage');
      const playing = !stage?.classList.contains('is-playing');
      stage?.classList.toggle('is-playing', playing);
      showToast(playing ? '재생 중인 목업 상태입니다' : '일시정지했어요');
    });
    slide.querySelector('[data-lumi-youtube-toggle]')?.addEventListener('click', () => toggleFeedYoutubeSlide(slide));
    slide.querySelector('[data-lumi-sound]')?.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleFeedSound(slide);
    });

    sparkleButton?.addEventListener('click', (event) => {
      if (!requireLogin('루미폰 로그인 후 반짝응원을 보낼 수 있어요')) return;
      const button = event.currentTarget;
      const value = button.querySelector('[data-lumi-sparkle-count]');
      const active = !button.classList.contains('is-active');
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
      const next = Number(value?.textContent || 0) + (active ? 1 : -1);
      if (value) value.textContent = String(Math.max(0, next));
      const card = cards.find((item) => item.dataset.id === clipId);
      if (card) {
        card.dataset.sparkles = String(Math.max(0, next));
        const listValue = card.querySelector('.lumi-list-body small i:nth-of-type(2)');
        if (listValue) listValue.textContent = `♥ ${formatCompact(Math.max(0, next))}`;
      }
      if (active) sparkleIds.add(clipId); else sparkleIds.delete(clipId);
      storage.write('lumibelleSparkledClips', Array.from(sparkleIds));
      showToast(active ? '반짝응원을 보냈어요' : '반짝응원을 취소했어요');
    });

    slide.querySelector('[data-lumi-comments]')?.addEventListener('click', () => openComments(slide));

    saveButton?.addEventListener('click', (event) => {
      if (!requireLogin('루미폰 로그인 후 영상을 저장할 수 있어요')) return;
      const button = event.currentTarget;
      const active = !button.classList.contains('is-active');
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
      if (active) savedIds.add(clipId); else savedIds.delete(clipId);
      storage.write('lumibelleSavedClips', Array.from(savedIds));
      showToast(active ? '저장한 영상에 추가했어요' : '저장을 해제했어요');
    });

    slide.querySelector('[data-lumi-share]')?.addEventListener('click', () => openActionSheet('share', slide));
    slide.querySelector('[data-lumi-more]')?.addEventListener('click', () => openActionSheet('more', slide));
  });

  commentLogin?.addEventListener('click', () => {
    isMockAuthenticated = true;
    window.sessionStorage.setItem('lumiMockAuthenticated', '1');
    syncAuthUi();
    commentInput?.focus();
    showToast('목업 로그인 상태로 전환했어요');
  });

  commentsList?.addEventListener('click', (event) => {
    const likeButton = event.target.closest('[data-comment-like]');
    const replyButton = event.target.closest('[data-comment-reply]');
    const article = event.target.closest('[data-comment-id]');
    if (!article || !activeCommentSlide) return;
    const items = commentsByClip.get(activeCommentSlide.dataset.id) || [];
    const parent = items.find((item) => item.id === article.dataset.commentId);
    const reply = items.flatMap((item) => item.replies).find((item) => item.id === article.dataset.commentId);
    const comment = parent || reply;
    if (!comment) return;

    if (likeButton) {
      if (!requireLogin('루미폰 로그인 후 댓글에 반응할 수 있어요')) return;
      comment.liked = !comment.liked;
      comment.likes = Math.max(0, comment.likes + (comment.liked ? 1 : -1));
      renderComments();
      return;
    }

    if (replyButton && parent) {
      if (!requireLogin('루미폰 로그인 후 답글을 작성할 수 있어요')) return;
      replyTarget = parent;
      if (replyContext) {
        replyContext.hidden = false;
        const label = replyContext.querySelector('span');
        if (label) label.textContent = `${parent.author}님에게 답글 작성 중`;
      }
      if (commentInput) {
        commentInput.placeholder = `${parent.author}님에게 답글 입력`;
        commentInput.focus();
      }
    }
  });

  replyCancel?.addEventListener('click', () => {
    replyTarget = null;
    if (replyContext) replyContext.hidden = true;
    if (commentInput) commentInput.placeholder = '댓글을 입력하세요';
  });

  commentForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!activeCommentSlide || !commentInput) return;
    const text = commentInput.value.trim();
    if (!text) return;
    const item = {
      id: `${activeCommentSlide.dataset.id}-user-${Date.now()}`,
      author: '루미나',
      avatar: '루',
      official: false,
      text,
      createdAt: Date.now(),
      likes: 0,
      liked: false,
      replies: []
    };
    const items = commentsByClip.get(activeCommentSlide.dataset.id) || [];
    if (replyTarget) replyTarget.replies.push(item); else items.push(item);
    commentsByClip.set(activeCommentSlide.dataset.id, items);
    commentInput.value = '';
    replyTarget = null;
    if (replyContext) replyContext.hidden = true;
    commentInput.placeholder = '댓글을 입력하세요';
    renderComments();
    commentsList?.scrollTo({ top: commentsList.scrollHeight, behavior: 'smooth' });
    showToast('댓글을 등록했어요');
  });

  document.querySelector('[data-share-copy]')?.addEventListener('click', async () => {
    const copied = await copyText(clipUrl(actionSlide));
    showToast(copied ? '링크를 복사했어요' : '링크 복사에 실패했어요');
  });

  document.querySelectorAll('[data-share-target]').forEach((button) => {
    button.addEventListener('click', async () => {
      const target = button.dataset.shareTarget;
      const url = clipUrl(actionSlide);
      const title = actionSlide?.querySelector('.lumi-feed-info h2')?.textContent?.trim() || 'LUMI CLIP';
      const shareData = {
        title,
        text: `${title} · LUMI CLIP에서 확인해보세요.`,
        url
      };

      if (target === 'x') {
        const intent = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`${title} · LUMI CLIP`)}`;
        window.open(intent, '_blank', 'noopener,noreferrer');
        closeActionSheets();
        return;
      }

      if (target === 'instagram' || target === 'native') {
        if (navigator.share) {
          try {
            await navigator.share(shareData);
            closeActionSheets();
            return;
          } catch (error) {
            if (error?.name === 'AbortError') return;
          }
        }
        const copied = await copyText(url);
        closeActionSheets();
        showToast(copied ? (target === 'instagram' ? '공유창을 지원하지 않아 링크를 복사했어요' : '링크를 복사했어요') : '링크 복사에 실패했어요');
        return;
      }

      const copied = await copyText(url);
      closeActionSheets();
      showToast(copied ? '카카오톡 공유 연결 전이라 링크를 복사했어요' : '링크 복사에 실패했어요');
    });
  });

  document.querySelectorAll('[data-more-action]').forEach((button) => {
    button.addEventListener('click', async () => {
      const action = button.dataset.moreAction;
      if (action === 'copy') {
        const copied = await copyText(clipUrl(actionSlide));
        closeActionSheets();
        showToast(copied ? '링크를 복사했어요' : '링크 복사에 실패했어요');
      } else if (action === 'original') {
        const originalUrl = actionSlide?.dataset.youtubeUrl;
        closeActionSheets();
        if (originalUrl) window.open(originalUrl, '_blank', 'noopener,noreferrer');
        else showToast('원본 영상 연결 전 목업입니다');
      } else if (action === 'report') {
        closeActionSheets();
        showToast('신고 기능은 계정 연동 후 제공됩니다');
      } else if (action === 'hide') {
        closeActionSheets();
        showToast('이 클립을 추천에서 줄이는 기능을 준비 중이에요');
      }
    });
  });

  if ('IntersectionObserver' in window && feed) {
    const observer = new IntersectionObserver((entries) => {
      if (viewer?.classList.contains('is-opening')) return;
      entries.forEach((entry) => {
        if (!entry.isIntersecting || entry.intersectionRatio < .62) return;
        const index = slides.indexOf(entry.target);
        activeSlide = entry.target;
        if (index >= 0 && current) current.textContent = String(index + 1);
        activateSlidePlayback(entry.target);
        if (index > 0) hint?.classList.add('is-hidden');
      });
    }, { root: feed, threshold: [.62, .8] });
    slides.forEach((slide) => observer.observe(slide));
  }

  document.addEventListener('keydown', (event) => {
    if (!viewer || viewer.hidden || event.key !== 'Escape') return;
    if (commentsSheet && !commentsSheet.hidden) closeComments();
    else if ((shareSheet && !shareSheet.hidden) || (moreSheet && !moreSheet.hidden)) closeActionSheets();
    else closeViewer();
  });

  const hashId = decodeURIComponent(location.hash.replace(/^#/, ''));
  if (hashId) {
    const hashIndex = slides.findIndex((slide) => slide.dataset.id === hashId);
    if (hashIndex >= 0) window.setTimeout(() => openViewer(hashIndex), 80);
  }

  syncAuthUi();
  renderCards();
})();
