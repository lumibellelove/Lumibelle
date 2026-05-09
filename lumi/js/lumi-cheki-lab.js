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
    galleryModal: $('galleryModal'),
    modalBody: $('modalBody'),
    modalTitle: $('modalTitle'),
    modalClose: $('modalClose'),
    modalEdit: $('modalEdit'),
    modalDelete: $('modalDelete'),
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

  function saveCurrentCard() {
    const next = readCurrentCardData();
    const cards = getSavedCards();
    const index = cards.findIndex((card) => card.id === next.id);
    if (index >= 0) {
      next.createdAt = cards[index].createdAt || next.updatedAt;
      cards[index] = next;
    } else {
      cards.unshift(next);
      currentEditId = next.id;
    }
    try {
      setSavedCards(cards);
      if (els.saveBtn) els.saveBtn.textContent = '수정 저장';
      renderGallery();
      alert('이 브라우저에 카드가 저장됐어요. 서버에는 저장되지 않아요.');
    } catch (error) {
      alert('저장 공간이 부족할 수 있어요. 사진 용량을 줄이거나 저장된 카드를 삭제해 주세요.');
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
    item.className = `gallery-card theme-${themeLabels[card.theme] ? card.theme : 'default'}`;
    item.dataset.id = card.id;
    const photoStyle = card.photoDataUrl ? `style="background-image:url('${card.photoDataUrl}')"` : '';
    item.innerHTML = `
      <div class="gallery-photo ${card.photoDataUrl ? 'has-photo' : ''}" ${photoStyle}>
        ${card.photoDataUrl ? '' : '<span>✦</span>'}
      </div>
      <div class="gallery-info">
        <strong>${escapeHtml(card.member || '멤버 미입력')}</strong>
        <span>${escapeHtml(formatDate(card.date))}</span>
        <p>${escapeHtml(card.eventName || '나만의 기록')}</p>
      </div>
    `;
    item.addEventListener('click', () => openModal(card.id));
    return item;
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[char]));
  }

  function renderGallery() {
    const allCards = getSavedCards();
    const cards = getVisibleCards();
    els.galleryCount.textContent = `${allCards.length}장`;
    els.galleryGrid.innerHTML = '';
    els.emptyGallery.hidden = cards.length > 0;
    cards.forEach((card) => els.galleryGrid.appendChild(createGalleryCard(card)));
  }

  function buildModalCard(card) {
    const theme = themeLabels[card.theme] ? card.theme : 'default';
    const align = ['left', 'center', 'right'].includes(card.textAlign) ? card.textAlign : 'left';
    const photoStyle = card.photoDataUrl ? `style="background-image:url('${card.photoDataUrl}')"` : '';
    return `
      <article class="cheki-card modal-cheki-card theme-${theme} text-align-${align}">
        <div class="card-topline"><span>${escapeHtml(cardLabelFor(card))}</span></div>
        <div class="cheki-date-strip"><span>♥</span><strong>${escapeHtml(formatDate(card.date))}</strong><span>♥</span></div>
        <div class="photo-frame modal-photo-frame ${card.photoDataUrl ? 'has-photo' : ''}" ${photoStyle}>
          ${card.photoDataUrl ? '' : '<div class="photo-placeholder"><span>✦</span><p>사진 없음</p></div>'}
        </div>
        <div class="card-info">
          <div class="member-line"><strong>${escapeHtml(card.member || '멤버 미입력')}</strong></div>
          <p class="event-line">${escapeHtml(card.eventName || '나만의 기록')}</p>
          <div class="memo-box"><span>PRIVATE MEMO</span><p>${escapeHtml(card.memo || '아직 적힌 메모가 없어요.')}</p></div>
        </div>
      </article>
    `;
  }

  function openModal(id) {
    const card = getSavedCards().find((item) => item.id === id);
    if (!card) return;
    activeModalId = id;
    els.modalTitle.textContent = card.member || '저장한 카드';
    els.modalBody.innerHTML = buildModalCard(card);
    els.galleryModal.hidden = false;
    document.body.classList.add('modal-open');
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

  window.addEventListener('resize', () => { if (photoDataUrl) applyPhotoTransform({ skipHistory: true }); });
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
  els.saveBtn.addEventListener('click', saveCurrentCard);
  els.galleryMemberFilter.addEventListener('change', renderGallery);
  els.gallerySort.addEventListener('change', renderGallery);
  els.modalClose.addEventListener('click', closeModal);
  els.galleryModal.addEventListener('click', (event) => { if (event.target === els.galleryModal) closeModal(); });
  els.modalDelete.addEventListener('click', deleteActiveCard);
  els.modalEdit.addEventListener('click', editActiveCard);
  window.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !els.galleryModal.hidden) closeModal(); });

  setTextAlign('left');
  resetForm();
  renderGallery();
})();
