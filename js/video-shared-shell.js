(() => {
  'use strict';

  const pageConfigs = {
    video: {
      heroId: 'video-archive-title',
      heroClass: '',
      heroTitle: 'VIDEO ARCHIVE',
      heroDescription: '루미벨의 공연, 방송, 클립과 기록을 여기에서 모두 만나보세요.',
      activeMode: 'video',
      controlsId: 'video-archive-controls',
      controlsClass: 'video-archive-controls',
      memberClass: 'video-member-filter',
      memberData: 'video-member',
      collectionData: 'video-collection',
      searchData: 'video-search',
      searchLabel: '영상 검색',
      filterSheetId: 'video-filter-sheet',
      filterOpenData: 'video-filter-open',
      filterCountData: '',
      sortControlData: 'video-sort-control',
      sortTriggerData: 'video-sort-trigger',
      sortLabelData: 'video-sort-label',
      sortMenuData: 'video-sort-menu',
      sortMenuId: 'video-sort-menu',
      sortOptionData: 'video-sort-option',
      sortNativeData: 'video-sort',
      sortAria: '영상 정렬',
      sortOptions: [
        ['latest', '최신순'],
        ['popular', '인기순'],
        ['recommended', '추천순']
      ],
      activeFilters: '<div class="video-active-filters" data-video-active-filters hidden></div>'
    },
    clip: {
      heroId: 'lumi-clip-title',
      heroClass: 'lumi-clip-hero',
      heroTitle: 'LUMI CLIP',
      heroDescription: '루미벨의 짧고 반짝이는 순간을 모아봤어요.',
      activeMode: 'clip',
      controlsId: 'lumi-clip-controls',
      controlsClass: 'lumi-clip-controls',
      memberClass: 'video-member-filter',
      memberData: 'clip-member',
      collectionData: 'clip-collection',
      searchData: 'clip-search',
      searchLabel: '루미클립 검색',
      filterSheetId: 'clip-filter-sheet',
      filterOpenData: 'clip-filter-open',
      filterCountData: 'clip-filter-count',
      sortControlData: 'clip-sort-control',
      sortTriggerData: 'clip-sort-trigger',
      sortLabelData: 'clip-sort-label',
      sortMenuData: 'clip-sort-menu',
      sortMenuId: 'clip-sort-menu',
      sortOptionData: 'clip-sort-option',
      sortNativeData: 'clip-sort',
      sortAria: '루미클립 정렬',
      sortOptions: [
        ['latest', '최신순'],
        ['popular', '인기순'],
        ['sparkles', '반짝응원순']
      ],
      activeFilters: ''
    }
  };

  const attribute = (name) => name ? ` data-${name}` : '';

  const noticeMarkup = () => `
    <section aria-label="주요 공지" class="notice-bar notice-rotator archive-notice-bar video-notice-bar" data-notice-rotator>
      <div class="notice-rotator-viewport">
        <a aria-hidden="false" class="notice-slide is-active" data-notice-slide href="./video.html"><span class="notice-label">공지</span><span class="notice-text">LUMIBELLE 공식 영상 아카이브</span><span class="notice-link">자세히 보기 <i aria-hidden="true"></i></span></a>
        <a aria-hidden="true" class="notice-slide" data-notice-slide href="./news-detail.html" tabindex="-1"><span class="notice-label">공지</span><span class="notice-text">LUMIBELLE 홈페이지 개편 안내</span><span class="notice-link">자세히 보기 <i aria-hidden="true"></i></span></a>
        <a aria-hidden="true" class="notice-slide" data-notice-slide href="./news.html" tabindex="-1"><span class="notice-label">공지</span><span class="notice-text">LUMIBELLE 굿즈 발매 예정 안내</span><span class="notice-link">자세히 보기 <i aria-hidden="true"></i></span></a>
      </div>
    </section>`;

  const heroMarkup = (config) => `
    <section aria-labelledby="${config.heroId}" class="archive-hero archive-page-hero${config.heroClass ? ` ${config.heroClass}` : ''}">
      <p class="archive-hero-eyebrow">LUMIBELLE OFFICIAL</p>
      <h1 id="${config.heroId}">${config.heroTitle}</h1>
      <p>${config.heroDescription}</p>
    </section>`;

  const modeTabsMarkup = (activeMode) => `
    <section aria-label="VIDEO 탐색 탭" class="video-tab-stack archive-primary-tabs">
      <nav aria-label="VIDEO 시청 방식" class="video-mode-tabs">
        <a${activeMode === 'video' ? ' aria-current="page" class="is-active"' : ''} href="./video.html">VIDEO ARCHIVE</a>
        <a${activeMode === 'clip' ? ' aria-current="page" class="is-active"' : ''} href="./lumi-clip.html">LUMI CLIP</a>
      </nav>
    </section>`;

  const collectionTabsMarkup = (config) => `
    <section aria-label="특별 영상 모음" class="video-collection-panel video-collection-shell archive-secondary-tabs">
      <div aria-label="특별 모음" class="video-collection-tabs" role="group">
        <button aria-pressed="true" class="is-active" data-${config.collectionData}="ALL" type="button"><span aria-hidden="true" class="sparkle-left">✦</span><span class="label-text">전체</span><span aria-hidden="true" class="sparkle-right">✦</span></button>
        <button aria-pressed="false" data-${config.collectionData}="HOT_CLIP" type="button"><span aria-hidden="true" class="sparkle-left">✦</span><span class="label-text">HOT CLIP</span><span aria-hidden="true" class="sparkle-right">✦</span></button>
        <button aria-pressed="false" data-${config.collectionData}="LIVE" type="button"><span aria-hidden="true" class="sparkle-left">✦</span><span class="label-text">LIVE</span><span aria-hidden="true" class="sparkle-right">✦</span></button>
      </div>
    </section>`;

  const memberButtonsMarkup = (config) => ['ALL', 'MARIRING', 'LULU', 'IRO', 'LUNAR']
    .map((member, index) => `<button aria-pressed="${index === 0}"${index === 0 ? ' class="is-active"' : ''} data-${config.memberData}="${member}" type="button">${member}</button>`)
    .join('');

  const sortOptionsMarkup = (config) => config.sortOptions
    .map(([value, label], index) => `<button aria-selected="${index === 0}" data-${config.sortOptionData} data-value="${value}" role="option" type="button">${label}</button>`)
    .join('');

  const nativeSortOptionsMarkup = (config) => config.sortOptions
    .map(([value, label]) => `<option value="${value}">${label}</option>`)
    .join('');

  const controlsMarkup = (config) => `
    <section aria-label="영상 아카이브 탐색" class="${config.controlsClass} archive-search-controls" id="${config.controlsId}">
      <div aria-label="멤버 필터" class="${config.memberClass}" role="group">${memberButtonsMarkup(config)}</div>
      <div class="video-search-row">
        <label class="video-search-box">
          <input aria-label="${config.searchLabel}" data-${config.searchData} placeholder="제목, 멤버명, 태그를 검색하세요" type="search"/>
          <i aria-hidden="true"></i>
        </label>
        <button aria-controls="${config.filterSheetId}" aria-expanded="false" aria-haspopup="dialog" class="video-filter-button" data-${config.filterOpenData} type="button">
          <span aria-hidden="true"><i></i><i></i><i></i></span>필터${config.filterCountData ? ` <b data-${config.filterCountData} hidden>0</b>` : ''}
        </button>
        <div class="video-sort-select" data-${config.sortControlData}>
          <button aria-controls="${config.sortMenuId}" aria-expanded="false" aria-haspopup="listbox" class="video-sort-trigger" data-${config.sortTriggerData} type="button"><span data-${config.sortLabelData}>최신순</span><i aria-hidden="true"></i></button>
          <div aria-label="${config.sortAria}" class="video-sort-menu" data-${config.sortMenuData} hidden id="${config.sortMenuId}" role="listbox">${sortOptionsMarkup(config)}</div>
          <select aria-hidden="true" aria-label="${config.sortAria}" class="video-sort-native" data-${config.sortNativeData} hidden tabindex="-1">${nativeSortOptionsMarkup(config)}</select>
        </div>
      </div>
      ${config.activeFilters}
    </section>`;

  document.querySelectorAll('[data-video-shared-shell]').forEach((mount) => {
    const page = mount.dataset.videoSharedShell || 'video';
    const config = pageConfigs[page];
    if (!config) return;

    const template = document.createElement('template');
    template.innerHTML = [
      noticeMarkup(),
      heroMarkup(config),
      modeTabsMarkup(config.activeMode),
      collectionTabsMarkup(config),
      controlsMarkup(config)
    ].join('');
    mount.replaceWith(template.content);
  });
})();
