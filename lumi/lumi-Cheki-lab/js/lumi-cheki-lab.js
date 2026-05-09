(() => {
  const $ = (id) => document.getElementById(id);
  const STORE_KEY = 'lumiChekiLabCards.v0.2';

  const els = {
    form: $('chekiForm'),
    photoInput: $('photoInput'),
    dateInput: $('dateInput'),
    memberSelect: $('memberSelect'),
    eventInput: $('eventInput'),
    typeSelect: $('typeSelect'),
    themeSelect: $('themeSelect'),
    memoInput: $('memoInput'),
    sampleBtn: $('sampleBtn'),
    resetBtn: $('resetBtn'),
    saveBtn: $('saveBtn'),
    newCardBtn: $('newCardBtn'),
    chekiCard: $('chekiCard'),
    photoFrame: $('photoFrame'),
    photoPreview: $('photoPreview'),
    photoPlaceholder: $('photoPlaceholder'),
    cardLabel: $('cardLabel'),
    cardMember: $('cardMember'),
    cardDate: $('cardDate'),
    cardEvent: $('cardEvent'),
    cardMemo: $('cardMemo'),
    themeBadge: $('themeBadge'),
    photoZoomIn: $('photoZoomIn'),
    photoZoomOut: $('photoZoomOut'),
    photoFitReset: $('photoFitReset'),
    photoUndo: $('photoUndo'),
    photoRedo: $('photoRedo'),
    photoAdjustStatus: $('photoAdjustStatus'),
    textAlignStatus: $('textAlignStatus'),
    alignButtons: Array.from(document.querySelectorAll('.align-btn')),
    galleryGrid: $('galleryGrid'),
    galleryCount: $('galleryCount'),
    emptyGallery: $('emptyGallery'),
    galleryMemberFilter: $('galleryMemberFilter'),
    gallerySort: $('gallerySort'),
    galleryPager: $('galleryPager'),
    galleryPrev: $('galleryPrev'),
    galleryNext: $('galleryNext'),
    galleryPageLabel: $('galleryPageLabel'),
    galleryNewBtn: $('galleryNewBtn'),
    gallerySelectToggle: $('gallerySelectToggle'),
    gallerySelectPanel: document.querySelector('.gallery-select-panel'),
    gallerySelectAll: $('gallerySelectAll'),
    gallerySelectClear: $('gallerySelectClear'),
    galleryDeleteSelected: $('galleryDeleteSelected'),
    gallerySelectStatus: $('gallerySelectStatus'),
    galleryModal: $('galleryModal'),
    modalBody: $('modalBody'),
    modalTitle: $('modalTitle'),
    modalClose: $('modalClose'),
    modalEdit: $('modalEdit'),
    modalDelete: $('modalDelete'),
    modalPrev: $('modalPrev'),
    modalNext: $('modalNext'),
    modalPageLabel: $('modalPageLabel'),
  };

  const themeLabels = {
    default: '기본 LUMI CHEKI',
    'cherry-pink': 'Cherry Pink',
    'milky-bunny': 'Milky Bunny',
    'angel-blue': 'Angel Blue',
    'moonlight-purple': 'Moonlight Purple',
    stardust: 'Stardust Magical',
    constellation: 'Constellation Night',
    'summer-focus': 'Summer Focus',
    'sakura-time': 'Sakura Time',
    'polaroid-white': 'Polaroid White',
  };

  const typeLabels = {
    '일반': '',
    '숙제': 'HOMEWORK',
    '생일': 'BIRTHDAY',
    'Lumibelle': 'LUMIBELLE',
    '이벤트': 'EVENT',
  };

  const memberTheme = {
    '마리링': 'cherry-pink',
    '루루': 'milky-bunny',
    '이로': 'angel-blue',
    '루나': 'moonlight-purple',
    'Lumibelle': 'stardust',
    '기타': 'default',
  };

  const themeClasses = Object.keys(themeLabels).map((key) => `theme-${key}`);
  const alignLabels = { left: '왼쪽 정렬', center: '중앙 정렬', right: '오른쪽 정렬' };

  let photoDataUrl = '';
  let photoNaturalSize = { width: 0, height: 0 };
  let userChangedTheme = false;
  let currentTextAlign = 'left';
  let currentEditId = null;
  let activeModalId = null;
  let galleryPage = 1;
  let selectionMode = false;
  const selectedCardIds = new Set();

  const GALLERY_PAGE_SIZE_DESKTOP = 8;
  const GALLERY_PAGE_SIZE_MOBILE = 3;
  const SAVE_IMAGE_MAX_SIDE = 1100;
  const SAVE_IMAGE_QUALITY = 0.78;

  const PHOTO_DEFAULT_SCALE = 1.04;
  const PHOTO_MIN_SCALE = 1;
  const PHOTO_MAX_SCALE = 2.6;
  const PHOTO_ZOOM_STEP = 0.08;

  let photoTransform = { x: 0, y: 0, scale: PHOTO_DEFAULT_SCALE };
  let historyStack = [];
  let historyIndex = -1;
  let dragState = { active: false, pointerId: null, startX: 0, startY: 0, startOffsetX: 0, startOffsetY: 0 };

  function todayString() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  function formatDate(value) {
    if (!value) return '날짜 미입력';
    return value.replaceAll('-', '.');
  }

  function uid() {
    return `cheki-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function roundNumber(value) {
    return Math.round(value * 1000) / 1000;
  }

  function copyTransform(transform) {
    return { x: roundNumber(transform.x), y: roundNumber(transform.y), scale: roundNumber(transform.scale) };
  }

  function safeJsonParse(text, fallback) {
    try { return JSON.parse(text); } catch { return fallback; }
  }

  function getSavedCards() {
    const data = safeJsonParse(localStorage.getItem(STORE_KEY) || '[]', []);
    return Array.isArray(data) ? data : [];
  }

  function setSavedCards(cards) {
    localStorage.setItem(STORE_KEY, JSON.stringify(cards));
  }


  function getCurrentPageCards(cards = getVisibleCards()) {
    const pageSize = getGalleryPageSize();
    const totalPages = Math.max(1, Math.ceil(cards.length / pageSize));
    galleryPage = clamp(galleryPage, 1, totalPages);
    const startIndex = (galleryPage - 1) * pageSize;
    return cards.slice(startIndex, startIndex + pageSize);
  }

  function updateSelectionControls(pageCards = getCurrentPageCards()) {
    const selectedCount = selectedCardIds.size;
    const hasPageCards = pageCards.length > 0;
    if (els.gallerySelectStatus) {
      els.gallerySelectStatus.textContent = `${selectedCount}장 선택됨`;
      els.gallerySelectStatus.hidden = !selectionMode;
      if (els.gallerySelectStatus.parentElement) els.gallerySelectStatus.parentElement.hidden = !selectionMode;
    }
    if (els.gallerySelectPanel) {
      els.gallerySelectPanel.classList.toggle('is-selecting', selectionMode);
    }
    if (els.gallerySelectToggle) {
      els.gallerySelectToggle.textContent = selectionMode ? '완료' : '선택 모드';
      els.gallerySelectToggle.classList.toggle('is-active', selectionMode);
      els.gallerySelectToggle.disabled = !hasPageCards && !selectionMode;
    }
    [els.gallerySelectAll, els.gallerySelectClear, els.galleryDeleteSelected].forEach((button) => {
      if (button) button.hidden = !selectionMode;
    });
    if (els.gallerySelectAll) els.gallerySelectAll.disabled = !hasPageCards;
    if (els.gallerySelectClear) els.gallerySelectClear.disabled = selectedCount === 0;
    if (els.galleryDeleteSelected) els.galleryDeleteSelected.disabled = selectedCount === 0;
  }

  function clearSelection() {
    selectedCardIds.clear();
  }

  function toggleSelectionMode(force) {
    selectionMode = typeof force === 'boolean' ? force : !selectionMode;
    if (!selectionMode) clearSelection();
    renderGallery();
  }

  function toggleCardSelection(id) {
    if (selectedCardIds.has(id)) selectedCardIds.delete(id);
    else selectedCardIds.add(id);
    renderGallery();
  }

  function selectCurrentPageCards() {
    getCurrentPageCards().forEach((card) => selectedCardIds.add(card.id));
    renderGallery();
  }

  function deleteSelectedCards() {
    const selectedCount = selectedCardIds.size;
    if (!selectedCount) return;
    if (!confirm(`선택한 ${selectedCount}장의 카드를 삭제할까요? 현재 브라우저에서만 삭제됩니다.`)) return;
    const cards = getSavedCards().filter((card) => !selectedCardIds.has(card.id));
    setSavedCards(cards);
    if (currentEditId && selectedCardIds.has(currentEditId)) resetForm();
    clearSelection();
    selectionMode = false;
    renderGallery();
  }

  function getGalleryPageSize() {
    return window.matchMedia && window.matchMedia('(min-width: 820px)').matches
      ? GALLERY_PAGE_SIZE_DESKTOP
      : GALLERY_PAGE_SIZE_MOBILE;
  }

  function imageMimeForSave() {
    const canvas = document.createElement('canvas');
    return canvas.toDataURL('image/webp', 0.8).startsWith('data:image/webp') ? 'image/webp' : 'image/jpeg';
  }

  function compressImageDataUrl(dataUrl, maxSide = SAVE_IMAGE_MAX_SIDE, quality = SAVE_IMAGE_QUALITY) {
    return new Promise((resolve, reject) => {
      if (!dataUrl) {
        resolve({ dataUrl: '', naturalSize: { width: 0, height: 0 } });
        return;
      }
      const img = new Image();
      img.onload = () => {
        const naturalWidth = img.naturalWidth || img.width || 1;
        const naturalHeight = img.naturalHeight || img.height || 1;
        const ratio = Math.min(1, maxSide / Math.max(naturalWidth, naturalHeight));
        const targetWidth = Math.max(1, Math.round(naturalWidth * ratio));
        const targetHeight = Math.max(1, Math.round(naturalHeight * ratio));
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('canvas unavailable')); return; }
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        const mime = imageMimeForSave();
        const savedDataUrl = canvas.toDataURL(mime, quality);
        resolve({ dataUrl: savedDataUrl, naturalSize: { width: targetWidth, height: targetHeight } });
      };
      img.onerror = () => reject(new Error('image load failed'));
      img.src = dataUrl;
    });
  }

  function getCoverBaseSize(frameWidth, frameHeight, imageWidth = photoNaturalSize.width, imageHeight = photoNaturalSize.height) {
    if (!imageWidth || !imageHeight || !frameWidth || !frameHeight) {
      return { width: frameWidth || 1, height: frameHeight || 1 };
    }

    const frameRatio = frameWidth / frameHeight;
    const imageRatio = imageWidth / imageHeight;
    if (imageRatio > frameRatio) {
      return { width: frameHeight * imageRatio, height: frameHeight };
    }
    return { width: frameWidth, height: frameWidth / imageRatio };
  }

  function getBounds(scale = photoTransform.scale) {
    const frame = els.photoFrame.getBoundingClientRect();
    const frameWidth = frame.width || 1;
    const frameHeight = frame.height || 1;
    const safeScale = Math.max(scale, 1);
    const base = getCoverBaseSize(frameWidth, frameHeight);
    const displayWidth = base.width * safeScale;
    const displayHeight = base.height * safeScale;
    return {
      maxX: Math.max(0, (displayWidth - frameWidth) / 2),
      maxY: Math.max(0, (displayHeight - frameHeight) / 2),
    };
  }

  function constrainTransform(transform = photoTransform) {
    const scale = clamp(roundNumber(transform.scale), PHOTO_MIN_SCALE, PHOTO_MAX_SCALE);
    const bounds = getBounds(scale);
    return {
      scale,
      x: clamp(transform.x, -bounds.maxX, bounds.maxX),
      y: clamp(transform.y, -bounds.maxY, bounds.maxY),
    };
  }

  function setTextAlign(align = 'left') {
    const safeAlign = ['left', 'center', 'right'].includes(align) ? align : 'left';
    currentTextAlign = safeAlign;
    els.chekiCard.classList.remove('text-align-left', 'text-align-center', 'text-align-right');
    els.chekiCard.classList.add(`text-align-${safeAlign}`);
    if (els.textAlignStatus) els.textAlignStatus.textContent = alignLabels[safeAlign];
    els.alignButtons.forEach((button) => {
      const active = button.dataset.align === safeAlign;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function setTheme(themeKey) {
    const safeTheme = themeLabels[themeKey] ? themeKey : 'default';
    els.chekiCard.classList.remove(...themeClasses);
    els.chekiCard.classList.add(`theme-${safeTheme}`);
    els.themeBadge.textContent = themeLabels[safeTheme];
  }

  function updateHistoryButtons() {
    const canUse = Boolean(photoDataUrl);
    if (els.photoUndo) els.photoUndo.disabled = !canUse || historyIndex <= 0;
    if (els.photoRedo) els.photoRedo.disabled = !canUse || historyIndex >= historyStack.length - 1;
  }

  function pushHistory() {
    if (!photoDataUrl) {
      updateHistoryButtons();
      return;
    }
    const next = copyTransform(constrainTransform(photoTransform));
    const current = historyStack[historyIndex];
    if (current && current.x === next.x && current.y === next.y && current.scale === next.scale) {
      updateHistoryButtons();
      return;
    }
    historyStack = historyStack.slice(0, historyIndex + 1);
    historyStack.push(next);
    historyIndex = historyStack.length - 1;
    updateHistoryButtons();
  }

  function applyPhotoTransform({ skipHistory = true } = {}) {
    photoTransform = constrainTransform(photoTransform);
    const frame = els.photoFrame.getBoundingClientRect();
    const frameWidth = frame.width || 1;
    const frameHeight = frame.height || 1;
    const base = getCoverBaseSize(frameWidth, frameHeight);
    const displayWidth = base.width * photoTransform.scale;
    const displayHeight = base.height * photoTransform.scale;

    if (photoDataUrl) {
      els.photoFrame.classList.add('has-photo');
      els.photoFrame.style.backgroundImage = `url("${photoDataUrl}")`;
      els.photoFrame.style.backgroundSize = `${displayWidth}px ${displayHeight}px`;
      els.photoFrame.style.backgroundPosition = `calc(50% + ${photoTransform.x}px) calc(50% + ${photoTransform.y}px)`;
      els.photoFrame.style.backgroundRepeat = 'no-repeat';
      els.photoPlaceholder.hidden = true;
      els.photoPlaceholder.style.display = 'none';
    } else {
      els.photoFrame.classList.remove('has-photo');
      els.photoFrame.style.backgroundImage = '';
      els.photoFrame.style.backgroundSize = '';
      els.photoFrame.style.backgroundPosition = '';
      els.photoFrame.style.backgroundRepeat = '';
      els.photoPlaceholder.hidden = false;
      els.photoPlaceholder.style.display = '';
    }

    if (!skipHistory) pushHistory();
  }

  function resetPhotoTransform({ keepHistory = false } = {}) {
    photoTransform = { x: 0, y: 0, scale: PHOTO_DEFAULT_SCALE };
    applyPhotoTransform({ skipHistory: true });
    if (!keepHistory) {
      historyStack = [];
      historyIndex = -1;
    }
    updateHistoryButtons();
  }

  function setPhotoControlsEnabled(enabled) {
    [els.photoZoomIn, els.photoZoomOut, els.photoFitReset].forEach((button) => {
      if (button) button.disabled = !enabled;
    });
    if (els.photoFrame) {
      els.photoFrame.classList.toggle('is-draggable', enabled);
      els.photoFrame.classList.remove('is-dragging');
    }
    if (els.photoAdjustStatus) els.photoAdjustStatus.textContent = enabled ? '드래그 가능' : '사진 선택 전';
    updateHistoryButtons();
  }

  function adjustPhoto(action) {
    if (!photoDataUrl) return;
    if (action === 'zoomIn') photoTransform.scale = roundNumber(photoTransform.scale + PHOTO_ZOOM_STEP);
    if (action === 'zoomOut') photoTransform.scale = roundNumber(photoTransform.scale - PHOTO_ZOOM_STEP);
    if (action === 'reset') resetPhotoTransform({ keepHistory: true });
    applyPhotoTransform({ skipHistory: false });
  }

  function undoPhoto() {
    if (!photoDataUrl || historyIndex <= 0) return;
    historyIndex -= 1;
    photoTransform = copyTransform(historyStack[historyIndex]);
    applyPhotoTransform({ skipHistory: true });
    updateHistoryButtons();
  }

  function redoPhoto() {
    if (!photoDataUrl || historyIndex >= historyStack.length - 1) return;
    historyIndex += 1;
    photoTransform = copyTransform(historyStack[historyIndex]);
    applyPhotoTransform({ skipHistory: true });
    updateHistoryButtons();
  }

  function startDrag(event) {
    if (!photoDataUrl) return;
    dragState = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startOffsetX: photoTransform.x,
      startOffsetY: photoTransform.y,
    };
    els.photoFrame.setPointerCapture?.(event.pointerId);
    els.photoFrame.classList.add('is-dragging');
    if (els.photoAdjustStatus) els.photoAdjustStatus.textContent = '조정 중';
    event.preventDefault();
  }

  function moveDrag(event) {
    if (!dragState.active || dragState.pointerId !== event.pointerId) return;
    photoTransform.x = dragState.startOffsetX + (event.clientX - dragState.startX);
    photoTransform.y = dragState.startOffsetY + (event.clientY - dragState.startY);
    applyPhotoTransform({ skipHistory: true });
    event.preventDefault();
  }

  function endDrag(event) {
    if (!dragState.active || dragState.pointerId !== event.pointerId) return;
    dragState.active = false;
    els.photoFrame.releasePointerCapture?.(event.pointerId);
    els.photoFrame.classList.remove('is-dragging');
    if (els.photoAdjustStatus) els.photoAdjustStatus.textContent = '드래그 가능';
    pushHistory();
  }

  function updatePreview() {
    const date = els.dateInput.value;
    const member = els.memberSelect.value;
    const eventName = els.eventInput.value.trim();
    const type = els.typeSelect.value;
    const theme = els.themeSelect.value;
    const memo = els.memoInput.value.trim();
    const typeLabel = typeLabels[type] || '';

    els.cardDate.textContent = formatDate(date);
    els.cardMember.textContent = member || '멤버 미입력';
    els.cardEvent.textContent = eventName || '나만의 기록';
    els.cardLabel.textContent = typeLabel ? `LUMI CHEKI · ${typeLabel}` : 'LUMI CHEKI';
    els.cardMemo.textContent = memo || '아직 적힌 메모가 없어요.';
    setTheme(theme);
  }

  function readCurrentCardData() {
    return {
      id: currentEditId || uid(),
      createdAt: currentEditId ? undefined : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      photoDataUrl,
      photoNaturalSize,
      photoTransform: copyTransform(photoTransform),
      date: els.dateInput.value,
      member: els.memberSelect.value,
      eventName: els.eventInput.value.trim(),
      type: els.typeSelect.value,
      theme: els.themeSelect.value,
      memo: els.memoInput.value.trim(),
      textAlign: currentTextAlign,
    };
  }

  function handlePhotoChange(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      photoDataUrl = '';
      photoNaturalSize = { width: 0, height: 0 };
      els.photoPreview.hidden = true;
      els.photoPreview.removeAttribute('src');
      resetPhotoTransform();
      setPhotoControlsEnabled(false);
      return;
    }
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 선택할 수 있어요.');
      els.photoInput.value = '';
      resetPhotoTransform();
      setPhotoControlsEnabled(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const nextDataUrl = String(reader.result || '');
      const probe = new Image();
      probe.onload = () => {
        photoDataUrl = nextDataUrl;
        photoNaturalSize = { width: probe.naturalWidth || probe.width || 0, height: probe.naturalHeight || probe.height || 0 };
        els.photoPreview.src = photoDataUrl;
        els.photoPreview.hidden = true;
        resetPhotoTransform();
        setPhotoControlsEnabled(true);
        pushHistory();
      };
      probe.onerror = () => {
        alert('사진을 불러오지 못했어요. 다른 이미지로 다시 선택해 주세요.');
        photoDataUrl = '';
        photoNaturalSize = { width: 0, height: 0 };
        els.photoInput.value = '';
        resetPhotoTransform();
        setPhotoControlsEnabled(false);
      };
      probe.src = nextDataUrl;
    };
    reader.readAsDataURL(file);
  }

  function resetForm() {
    photoDataUrl = '';
    photoNaturalSize = { width: 0, height: 0 };
    userChangedTheme = false;
    currentEditId = null;
    els.form.reset();
    els.dateInput.value = todayString();
    els.memberSelect.value = '마리링';
    els.typeSelect.value = '일반';
    els.themeSelect.value = memberTheme['마리링'];
    els.photoInput.value = '';
    els.photoPreview.hidden = true;
    els.photoPreview.removeAttribute('src');
    resetPhotoTransform();
    setPhotoControlsEnabled(false);
    setTextAlign('left');
    if (els.saveBtn) els.saveBtn.textContent = '카드 저장';
    updatePreview();
  }

  function startNewCard({ scroll = true } = {}) {
    resetForm();
    if (scroll) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function fillSample() {
    userChangedTheme = false;
    els.dateInput.value = '2026-07-12';
    els.memberSelect.value = '마리링';
    els.eventInput.value = 'LUMIBELLE Debut Live';
    els.typeSelect.value = '일반';
    els.memoInput.value = '첫 루미벨 체키. 오늘 눈 마주친 순간이 오래 기억날 것 같아.';
    els.themeSelect.value = memberTheme['마리링'];
    setTextAlign('left');
    updatePreview();
  }

  async function saveCurrentCard() {
    const next = readCurrentCardData();
    try {
      if (next.photoDataUrl) {
        const compressed = await compressImageDataUrl(next.photoDataUrl);
        next.photoDataUrl = compressed.dataUrl;
        next.photoNaturalSize = compressed.naturalSize;
      }

      const cards = getSavedCards();
      const index = cards.findIndex((card) => card.id === next.id);
      if (index >= 0) {
        next.createdAt = cards[index].createdAt || next.updatedAt;
        cards[index] = next;
      } else {
        cards.unshift(next);
        currentEditId = next.id;
        galleryPage = 1;
      }
      setSavedCards(cards);
      if (els.saveBtn) els.saveBtn.textContent = '수정 저장';
      renderGallery();
      alert(index >= 0 ? '수정한 카드가 저장됐어요. 서버에는 저장되지 않아요.' : '이 브라우저에 새 카드가 저장됐어요. 저장용 사진은 자동으로 가볍게 줄였고, 서버에는 저장되지 않아요.');
    } catch (error) {
      alert('저장 공간이 아직 부족할 수 있어요. 갤러리에서 저장된 카드를 조금 삭제한 뒤 다시 시도해 주세요.');
    }
  }

  function loadCardToEditor(card) {
    currentEditId = card.id;
    photoDataUrl = card.photoDataUrl || '';
    photoNaturalSize = card.photoNaturalSize || { width: 0, height: 0 };
    els.dateInput.value = card.date || todayString();
    els.memberSelect.value = card.member || '마리링';
    els.eventInput.value = card.eventName || '';
    els.typeSelect.value = card.type || '일반';
    els.themeSelect.value = card.theme || memberTheme[els.memberSelect.value] || 'default';
    els.memoInput.value = card.memo || '';
    setTextAlign(card.textAlign || 'left');
    if (photoDataUrl) {
      els.photoPreview.src = photoDataUrl;
      els.photoPreview.hidden = true;
      photoTransform = copyTransform(card.photoTransform || { x: 0, y: 0, scale: PHOTO_DEFAULT_SCALE });
      applyPhotoTransform({ skipHistory: true });
      setPhotoControlsEnabled(true);
      historyStack = [copyTransform(photoTransform)];
      historyIndex = 0;
      updateHistoryButtons();
    } else {
      resetPhotoTransform();
      setPhotoControlsEnabled(false);
    }
    if (els.saveBtn) els.saveBtn.textContent = '수정 저장';
    updatePreview();
    closeModal();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function getVisibleCards() {
    const filter = els.galleryMemberFilter.value;
    const sort = els.gallerySort.value;
    let cards = getSavedCards();
    if (filter !== 'all') cards = cards.filter((card) => card.member === filter);
    const byCreated = (a, b) => new Date(b.createdAt || b.updatedAt || 0) - new Date(a.createdAt || a.updatedAt || 0);
    const byDateDesc = (a, b) => String(b.date || '').localeCompare(String(a.date || '')) || byCreated(a, b);
    const byDateAsc = (a, b) => String(a.date || '').localeCompare(String(b.date || '')) || byCreated(a, b);
    if (sort === 'oldest') cards.reverse();
    else if (sort === 'dateDesc') cards.sort(byDateDesc);
    else if (sort === 'dateAsc') cards.sort(byDateAsc);
    else cards.sort(byCreated);
    return cards;
  }

  function cardLabelFor(card) {
    const typeLabel = typeLabels[card.type] || '';
    return typeLabel ? `LUMI CHEKI · ${typeLabel}` : 'LUMI CHEKI';
  }

  function createGalleryCard(card) {
    const item = document.createElement('button');
    item.type = 'button';
    const selected = selectedCardIds.has(card.id);
    item.className = `gallery-card theme-${themeLabels[card.theme] ? card.theme : 'default'} ${selected ? 'is-selected' : ''} ${selectionMode ? 'is-selecting' : ''}`;
    item.dataset.id = card.id;
    item.setAttribute('aria-pressed', selected ? 'true' : 'false');
    const photoStyle = photoStyleForCard(card);
    const emptyMarkup = `
      <div class="gallery-memory-card">
        <span>✦</span>
        <strong>LUMI MEMORY</strong>
        <p>오늘의 마음만 보관했어요.</p>
      </div>
    `;
    item.innerHTML = `
      <span class="gallery-check" role="checkbox" aria-checked="${selected ? 'true' : 'false'}" tabindex="0">${selected ? '✓' : ''}</span>
      <div class="gallery-photo ${card.photoDataUrl ? 'has-photo' : 'is-memory'}" ${photoStyle}>
        ${card.photoDataUrl ? '' : emptyMarkup}
      </div>
      <div class="gallery-info">
        <strong>${escapeHtml(card.member || '멤버 미입력')}</strong>
        <span>${escapeHtml(formatDate(card.date))}</span>
        <p>${escapeHtml(card.eventName || '나만의 기록')}</p>
      </div>
    `;
    const check = item.querySelector('.gallery-check');
    if (check) {
      check.addEventListener('click', (event) => {
        event.stopPropagation();
        toggleCardSelection(card.id);
      });
      check.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          event.stopPropagation();
          toggleCardSelection(card.id);
        }
      });
    }
    item.addEventListener('click', () => {
      if (selectionMode) {
        toggleCardSelection(card.id);
        return;
      }
      openModal(card.id);
    });
    return item;
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[char]));
  }

  function photoStyleForCard(card, { preserveTransform = false } = {}) {
    if (!card.photoDataUrl) return '';
    const style = [`background-image:url('${card.photoDataUrl}')`];
    if (preserveTransform && card.photoTransform && card.photoNaturalSize) {
      const ratio = Number(card.photoNaturalSize.width || 0) / Number(card.photoNaturalSize.height || 1);
      const frameRatio = 4 / 5;
      const scale = Number(card.photoTransform.scale || 1);
      let widthPercent = 100;
      let heightPercent = 100;
      if (ratio > frameRatio) {
        widthPercent = (1.25 * ratio) * 100;
        heightPercent = 100;
      } else {
        widthPercent = 100;
        heightPercent = ((1 / ratio) / 1.25) * 100;
      }
      const x = Number(card.photoTransform.x || 0);
      const y = Number(card.photoTransform.y || 0);
      style.push(`background-size:${Math.max(100, widthPercent * scale).toFixed(2)}% ${Math.max(100, heightPercent * scale).toFixed(2)}%`);
      style.push(`background-position:calc(50% + ${x.toFixed(1)}px) calc(50% + ${y.toFixed(1)}px)`);
      style.push('background-repeat:no-repeat');
    }
    return `style="${style.join(';')}"`;
  }

  function renderGallery() {
    const allCards = getSavedCards();
    const cards = getVisibleCards();
    const pageSize = getGalleryPageSize();
    const totalPages = Math.max(1, Math.ceil(cards.length / pageSize));
    galleryPage = clamp(galleryPage, 1, totalPages);
    const startIndex = (galleryPage - 1) * pageSize;
    const pageCards = cards.slice(startIndex, startIndex + pageSize);
    const validIds = new Set(cards.map((card) => card.id));
    Array.from(selectedCardIds).forEach((id) => { if (!validIds.has(id)) selectedCardIds.delete(id); });

    els.galleryCount.textContent = `${allCards.length}장`;
    els.galleryGrid.innerHTML = '';
    els.emptyGallery.hidden = cards.length > 0;
    pageCards.forEach((card) => els.galleryGrid.appendChild(createGalleryCard(card)));

    if (els.galleryPager) {
      els.galleryPager.hidden = cards.length === 0;
      els.galleryPageLabel.textContent = `${galleryPage} / ${totalPages}`;
      els.galleryPrev.disabled = galleryPage <= 1;
      els.galleryNext.disabled = galleryPage >= totalPages;
    }
    updateSelectionControls(pageCards);
  }

  function buildModalCard(card) {
    const theme = themeLabels[card.theme] ? card.theme : 'default';
    const align = ['left', 'center', 'right'].includes(card.textAlign) ? card.textAlign : 'left';
    const photoStyle = photoStyleForCard(card, { preserveTransform: true });
    return `
      <article class="cheki-card modal-cheki-card theme-${theme} text-align-${align}">
        <div class="card-topline"><span>${escapeHtml(cardLabelFor(card))}</span></div>
        <div class="cheki-date-strip"><span>♥</span><strong>${escapeHtml(formatDate(card.date))}</strong><span>♥</span></div>
        <div class="photo-frame modal-photo-frame ${card.photoDataUrl ? 'has-photo' : ''}" ${photoStyle}>
          ${card.photoDataUrl ? '' : '<div class="photo-placeholder memory-placeholder"><span>✦</span><strong>LUMI MEMORY</strong><p>오늘의 마음만 보관했어요.</p></div>'}
        </div>
        <div class="card-info">
          <div class="member-line"><strong>${escapeHtml(card.member || '멤버 미입력')}</strong></div>
          <p class="event-line">${escapeHtml(card.eventName || '나만의 기록')}</p>
          <div class="memo-box"><span>PRIVATE MEMO</span><p>${escapeHtml(card.memo || '아직 적힌 메모가 없어요.')}</p></div>
        </div>
      </article>
    `;
  }


  function getVisibleCardIds() {
    return getVisibleCards().map((card) => card.id);
  }

  function getModalContext() {
    const ids = getVisibleCardIds();
    let index = ids.indexOf(activeModalId);
    if (index < 0) index = 0;
    return { ids, index, total: ids.length };
  }

  function updateModalNav() {
    if (!els.modalPageLabel || !els.modalPrev || !els.modalNext) return;
    const { ids, index, total } = getModalContext();
    els.modalPageLabel.textContent = total ? `${index + 1} / ${total}` : '0 / 0';
    els.modalPrev.disabled = total <= 1 || index <= 0;
    els.modalNext.disabled = total <= 1 || index >= total - 1;
  }

  function moveModalCard(direction) {
    const { ids, index, total } = getModalContext();
    if (!total) return;
    const nextIndex = clamp(index + direction, 0, total - 1);
    if (nextIndex === index) return;
    openModal(ids[nextIndex]);
  }

  function openModal(id) {
    const card = getSavedCards().find((item) => item.id === id);
    if (!card) return;
    activeModalId = id;
    els.modalTitle.textContent = card.member ? `${card.member} 카드` : '저장한 카드';
    els.modalBody.innerHTML = buildModalCard(card);
    els.galleryModal.hidden = false;
    document.body.classList.add('modal-open');
    updateModalNav();
  }

  function closeModal() {
    els.galleryModal.hidden = true;
    activeModalId = null;
    document.body.classList.remove('modal-open');
  }

  function deleteActiveCard() {
    if (!activeModalId) return;
    if (!confirm('이 카드 기록을 삭제할까요? 현재 브라우저에서만 삭제됩니다.')) return;
    const cards = getSavedCards().filter((card) => card.id !== activeModalId);
    setSavedCards(cards);
    if (currentEditId === activeModalId) resetForm();
    closeModal();
    renderGallery();
  }

  function editActiveCard() {
    const card = getSavedCards().find((item) => item.id === activeModalId);
    if (card) loadCardToEditor(card);
  }

  window.addEventListener('resize', () => {
    if (photoDataUrl) applyPhotoTransform({ skipHistory: true });
    renderGallery();
  });
  els.photoInput.addEventListener('change', handlePhotoChange);
  els.photoZoomIn.addEventListener('click', () => adjustPhoto('zoomIn'));
  els.photoZoomOut.addEventListener('click', () => adjustPhoto('zoomOut'));
  els.photoFitReset.addEventListener('click', () => adjustPhoto('reset'));
  els.photoUndo.addEventListener('click', undoPhoto);
  els.photoRedo.addEventListener('click', redoPhoto);
  els.photoFrame.addEventListener('pointerdown', startDrag);
  els.photoFrame.addEventListener('pointermove', moveDrag);
  els.photoFrame.addEventListener('pointerup', endDrag);
  els.photoFrame.addEventListener('pointercancel', endDrag);
  els.photoFrame.addEventListener('lostpointercapture', () => {
    dragState.active = false;
    els.photoFrame.classList.remove('is-dragging');
    if (els.photoAdjustStatus && photoDataUrl) els.photoAdjustStatus.textContent = '드래그 가능';
  });

  els.themeSelect.addEventListener('change', () => { userChangedTheme = true; updatePreview(); });
  els.memberSelect.addEventListener('change', () => {
    if (!userChangedTheme) els.themeSelect.value = memberTheme[els.memberSelect.value] || 'default';
    updatePreview();
  });
  [els.dateInput, els.eventInput, els.typeSelect, els.memoInput].forEach((el) => {
    el.addEventListener('input', updatePreview);
    el.addEventListener('change', updatePreview);
  });
  els.alignButtons.forEach((button) => button.addEventListener('click', () => setTextAlign(button.dataset.align)));
  els.sampleBtn.addEventListener('click', fillSample);
  els.resetBtn.addEventListener('click', resetForm);
  if (els.newCardBtn) els.newCardBtn.addEventListener('click', () => startNewCard());
  els.saveBtn.addEventListener('click', saveCurrentCard);
  els.galleryMemberFilter.addEventListener('change', () => { galleryPage = 1; selectionMode = false; clearSelection(); renderGallery(); });
  els.gallerySort.addEventListener('change', () => { galleryPage = 1; selectionMode = false; clearSelection(); renderGallery(); });
  els.galleryPrev.addEventListener('click', () => { galleryPage -= 1; renderGallery(); });
  els.galleryNext.addEventListener('click', () => { galleryPage += 1; renderGallery(); });
  if (els.galleryNewBtn) els.galleryNewBtn.addEventListener('click', () => startNewCard());
  if (els.gallerySelectToggle) els.gallerySelectToggle.addEventListener('click', () => toggleSelectionMode());
  if (els.gallerySelectAll) els.gallerySelectAll.addEventListener('click', selectCurrentPageCards);
  if (els.gallerySelectClear) els.gallerySelectClear.addEventListener('click', () => { clearSelection(); renderGallery(); });
  if (els.galleryDeleteSelected) els.galleryDeleteSelected.addEventListener('click', deleteSelectedCards);
  els.modalClose.addEventListener('click', closeModal);
  els.galleryModal.addEventListener('click', (event) => { if (event.target === els.galleryModal) closeModal(); });
  els.modalDelete.addEventListener('click', deleteActiveCard);
  els.modalEdit.addEventListener('click', editActiveCard);
  if (els.modalPrev) els.modalPrev.addEventListener('click', () => moveModalCard(-1));
  if (els.modalNext) els.modalNext.addEventListener('click', () => moveModalCard(1));
  window.addEventListener('keydown', (event) => {
    if (els.galleryModal.hidden) return;
    if (event.key === 'Escape') closeModal();
    if (event.key === 'ArrowLeft') moveModalCard(-1);
    if (event.key === 'ArrowRight') moveModalCard(1);
  });

  setTextAlign('left');
  resetForm();
  renderGallery();
})();
