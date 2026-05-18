(function(){
  const API_URL = 'https://lumi-news-api.lumibelle-love.workers.dev';
  const STORAGE_KEY = 'lumibelleContentAdminV2';
  const NEWS_UPDATED_EVENT = 'lumi-news-updated';

  const DEFAULT_NEWS = [];
  let cachedPublicNewsByLang = {};
  let hasLoadedPublicNewsByLang = {};

  let _currentLang = normalizeLang(new URLSearchParams(location.search).get('lang') || localStorage.getItem('lumibelleCurrentLang') || 'ko');

  function normalizeLang(lang){
    lang = String(lang || 'ko').toLowerCase().trim();
    if(lang === 'kr') return 'ko';
    if(lang === 'jp') return 'ja';
    if(lang === 'cn' || lang === 'zh-cn' || lang === 'zh_hans' || lang === 'zh-hans') return 'zh';
    if(['ko','ja','en','zh'].indexOf(lang) !== -1) return lang;
    return 'ko';
  }

  function getCurrentLang(){
    return _currentLang || 'ko';
  }

  function setCurrentLang(lang){
    _currentLang = normalizeLang(lang);
    try{ localStorage.setItem('lumibelleCurrentLang', _currentLang); }catch(e){}
    return _currentLang;
  }

  function htmlEscape(v){
    return String(v == null ? '' : v).replace(/[&<>"']/g, function(s){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s];
    });
  }

  function stripHTML(v){
    const el = document.createElement('div');
    el.innerHTML = String(v || '');
    return el.textContent || el.innerText || '';
  }

  function toBoolean(value){
    if(value === true) return true;
    if(value === false) return false;
    const text = String(value == null ? '' : value).toLowerCase();
    return text === 'true' || text === '1' || text === 'yes' || text === 'y';
  }

  function firstDatePart(v){
    const s = String(v || '').trim();
    if(!s) return '';
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if(m) return m[1] + '-' + m[2] + '-' + m[3];
    const dot = s.match(/^(\d{4})\.(\d{2})\.(\d{2})/);
    if(dot) return dot[1] + '-' + dot[2] + '-' + dot[3];
    return s.slice(0, 10);
  }

  function nowDate(){
    return new Date().toISOString().slice(0,10);
  }

  function convertApiItem(item){
    item = item || {};
    const status = String(item.status || 'draft');
    const date = firstDatePart(item.publishedAt || item.createdAt || item.updatedAt) || nowDate();
    const category = String(item.category || '공지');
    const badges = item.badges && Array.isArray(item.badges) ? item.badges : [defaultBadgeForCategory(category)];
    return {
      id: String(item.id || ''),
      title: String(item.title || ''),
      body: String(item.body || ''),
      category,
      status,
      published: status === 'public',
      draft: status === 'draft',
      home: toBoolean(item.isHome),
      pinned: toBoolean(item.isPinned),
      isHome: toBoolean(item.isHome),
      isPinned: toBoolean(item.isPinned),
      heroImage: String(item.heroImageUrl || item.heroImage || ''),
      heroImageUrl: String(item.heroImageUrl || item.heroImage || ''),
      heroAlt: String(item.heroAlt || ''),
      infoDate: String(item.infoDate || ''),
      infoPlace: String(item.infoPlace || ''),
      infoTime: String(item.infoTime || ''),
      infoTicket: String(item.infoTicket || ''),
      btn1Text: String(item.btn1Text || ''),
      btn1Link: String(item.btn1Link || item.ticketUrl || ''),
      btn2Text: String(item.btn2Text || ''),
      btn2Link: String(item.btn2Link || ''),
      ticketUrl: String(item.ticketUrl || item.btn1Link || ''),
      imageLayout: String(item.imageLayout || 'auto'),
      date,
      badges,
      link: 'news-detail.html?id=' + encodeURIComponent(String(item.id || '')),
      createdAt: String(item.createdAt || ''),
      updatedAt: String(item.updatedAt || ''),
      publishedAt: String(item.publishedAt || ''),
      createdBy: String(item.createdBy || ''),
      updatedBy: String(item.updatedBy || ''),
      sortOrder: Number(item.sortOrder || 0),
      lang: String(item.lang || 'ko'),
      translationGroupId: String(item.translationGroupId || item.id || ''),
      translations: item.translations || {},
      translationStatus: item.translationStatus || {},
      deletedAt: String(item.deletedAt || '')
    };
  }

  function newsStatusFromLocal(row){
    if(row && row.draft) return 'draft';
    if(row && row.published === false) return 'private';
    return 'public';
  }

  function toApiPayload(row){
    row = row || {};
    return {
      id: row.id || '',
      title: row.title || '',
      body: row.body || '',
      category: row.category || '공지',
      status: row.status || newsStatusFromLocal(row),
      isHome: row.isHome !== undefined ? !!row.isHome : row.home !== false,
      isPinned: row.isPinned !== undefined ? !!row.isPinned : !!row.pinned,
      heroImageUrl: row.heroImageUrl || row.heroImage || '',
      heroAlt: row.heroAlt || '',
      infoDate: row.infoDate || '',
      infoPlace: row.infoPlace || '',
      infoTime: row.infoTime || '',
      infoTicket: row.infoTicket || '',
      btn1Text: '',
      btn1Link: row.ticketUrl || row.btn1Link || '',
      btn2Text: '',
      btn2Link: '',
      ticketUrl: row.ticketUrl || row.btn1Link || '',
      imageLayout: row.imageLayout || 'auto',
      sortOrder: row.sortOrder || 0,
      lang: row.lang || 'ko',
      translationGroupId: row.translationGroupId || row.id || '',
      translations: row.translations || {},
      translationStatus: row.translationStatus || {},
      createdBy: row.createdBy || 'admin',
      updatedBy: row.updatedBy || 'admin'
    };
  }

  function request(action, payload){
    payload = payload || {};
    return new Promise(function(resolve, reject){
      const callbackName = '__lumiContentCb_' + Date.now() + '_' + Math.floor(Math.random() * 1000000);
      const script = document.createElement('script');
      const url = API_URL
        + '?action=' + encodeURIComponent(action)
        + '&callback=' + encodeURIComponent(callbackName)
        + '&payload=' + encodeURIComponent(JSON.stringify(payload));
      let done = false;
      window[callbackName] = function(data){
        done = true;
        try{ delete window[callbackName]; }catch(e){ window[callbackName] = undefined; }
        if(script.parentNode) script.parentNode.removeChild(script);
        if(data && data.ok === false){ reject(data); return; }
        resolve(data || {});
      };
      script.onerror = function(){
        if(done) return;
        try{ delete window[callbackName]; }catch(e){ window[callbackName] = undefined; }
        if(script.parentNode) script.parentNode.removeChild(script);
        reject({ok:false,error:'networkError'});
      };
      script.src = url;
      document.head.appendChild(script);
    });
  }


  function workerGet(action, payload){
    payload = payload || {};
    const qs = '?action=' + encodeURIComponent(action)
      + '&payload=' + encodeURIComponent(JSON.stringify(payload))
      + '&_nocache=' + Date.now();
    return fetch(API_URL + qs, {
      method: 'GET',
      mode: 'cors',
      redirect: 'follow',
      headers: { 'Accept': 'application/json, text/plain, */*' }
    }).then(function(res){
      if(!res.ok){
        throw {ok:false,error:'httpError',status:res.status,statusText:res.statusText};
      }
      return res.text();
    }).then(function(text){
      let data;
      try{ data = JSON.parse(text || '{}'); }
      catch(err){
        throw {ok:false,error:'invalidJsonResponse',message:String(err && err.message ? err.message : err),raw:text};
      }
      if(data && data.ok === false) throw data;
      return data || {};
    });
  }


  function iframePost(action, payload){
    payload = payload || {};
    return new Promise(function(resolve, reject){
      const uploadId = 'lumiUpload_' + Date.now() + '_' + Math.floor(Math.random() * 1000000);
      const iframeName = uploadId + '_frame';
      const iframe = document.createElement('iframe');
      iframe.name = iframeName;
      iframe.style.display = 'none';

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = API_URL;
      form.target = iframeName;
      form.style.display = 'none';

      function addField(name, value){
        const input = document.createElement('textarea');
        input.name = name;
        input.value = value == null ? '' : String(value);
        form.appendChild(input);
      }

      addField('action', action);
      addField('responseMode', 'iframe');
      addField('uploadId', uploadId);
      addField('payload', JSON.stringify(payload));

      let timeoutId;
      function cleanup(){
        window.removeEventListener('message', onMessage);
        clearTimeout(timeoutId);
        setTimeout(function(){
          if(form.parentNode) form.parentNode.removeChild(form);
          if(iframe.parentNode) iframe.parentNode.removeChild(iframe);
        }, 0);
      }
      function onMessage(event){
        const data = event && event.data;
        if(!data || data.uploadId !== uploadId) return;
        cleanup();
        if(data.ok === false){ reject(data); return; }
        resolve(data || {});
      }
      window.addEventListener('message', onMessage);
      timeoutId = setTimeout(function(){
        cleanup();
        reject({ok:false,error:'uploadTimeout'});
      }, 90000);

      document.body.appendChild(iframe);
      document.body.appendChild(form);
      form.submit();
    });
  }

  function fetchPost(action, payload){
    payload = payload || {};
    const form = new URLSearchParams();
    form.set('action', action);
    form.set('payload', JSON.stringify(payload));
    form.set('responseMode', 'json');

    return fetch(API_URL, {
      method: 'POST',
      mode: 'cors',
      redirect: 'follow',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body: form.toString()
    }).then(function(res){
      if(!res.ok){
        throw {ok:false,error:'httpError',status:res.status,statusText:res.statusText};
      }
      return res.text();
    }).then(function(text){
      let data;
      try{ data = JSON.parse(text || '{}'); }
      catch(err){
        throw {ok:false,error:'invalidJsonResponse',message:String(err && err.message ? err.message : err),raw:text};
      }
      if(data && data.ok === false) throw data;
      return data || {};
    });
  }

  function uploadNewsImage(payload){
    return fetchPost('uploadNewsImage', payload || {});
  }

  function listRecentNewsImages(payload){
    return fetchPost('listRecentNewsImages', payload || {});
  }

  function deleteRecentNewsImages(payload){
    return fetchPost('deleteRecentNewsImages', payload || {});
  }


  function getDriveImageData(payload){
    return fetchPost('getDriveImageData', payload || {});
  }


  function listNewsStickers(payload){
    return fetchPost('listNewsStickers', payload || {});
  }

  function uploadNewsSticker(payload){
    return fetchPost('uploadNewsSticker', payload || {});
  }

  function translateNewsContent(payload){
    payload = payload || {};
    // HTML 본문/이미지 태그가 포함되면 JSONP GET URL이 길어져 실패할 수 있어서 POST로 호출한다.
    return fetchPost('translateNewsContent', payload).then(function(res){
      return res || {};
    });
  }

  function readState(){
    try{
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if(parsed && Array.isArray(parsed.news)) return parsed;
    }catch(e){}
    return {news: DEFAULT_NEWS.slice()};
  }

  function publicCacheKey(lang){
    return STORAGE_KEY + ':public:' + normalizeLang(lang || getCurrentLang());
  }

  function keepOnlyLang(items, lang){
    lang = normalizeLang(lang || getCurrentLang());
    items = (items || []).map(convertApiItem).sort(sortNews);
    return items.filter(function(n){
      return normalizeLang(n.lang || 'ko') === lang;
    });
  }

  function cachedLocalPublicNews(lang){
    lang = normalizeLang(lang || getCurrentLang());
    try{
      const parsed = JSON.parse(localStorage.getItem(publicCacheKey(lang)) || '[]');
      if(Array.isArray(parsed)) return keepOnlyLang(parsed, lang);
    }catch(e){}

    /* 기존 단일 캐시는 ko 화면에서만 fallback으로 사용한다.
       ja/en/zh 화면에서는 ko 캐시가 잠깐 보이지 않도록 절대 사용하지 않는다. */
    if(lang === 'ko'){
      const local = readState().news || [];
      return keepOnlyLang(local.filter(function(n){
        const status = String(n.status || (n.draft ? 'draft' : (n.published === false ? 'private' : 'public')));
        return n && status === 'public' && !n.draft && !n.deletedAt;
      }), lang);
    }
    return [];
  }

  function savePublicNewsCache(items, lang){
    lang = normalizeLang(lang || getCurrentLang());
    try{
      localStorage.setItem(publicCacheKey(lang), JSON.stringify(keepOnlyLang(items || [], lang)));
    }catch(e){}
  }

  function saveLocalNews(items){
    try{
      const state = readState();
      state.news = items;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }catch(e){}
  }

  function dispatchNewsUpdated(){
    window.dispatchEvent(new CustomEvent(NEWS_UPDATED_EVENT));
  }

  function adminListNewsItems(){
    return workerGet('adminListNewsItems', {}).then(function(res){
      const items = (res.items || []).map(convertApiItem).sort(sortNews);
      saveLocalNews(items);
      return items;
    });
  }

  function adminCreateNewsItem(row){
    // 번역 HTML/이미지가 함께 저장될 때 payload가 커지므로 JSONP GET 대신 POST를 사용한다.
    return fetchPost('adminCreateNewsItem', toApiPayload(row)).then(function(res){
      return convertApiItem(res.item || {});
    });
  }

  function adminUpdateNewsItem(row){
    // 번역 HTML/이미지가 함께 저장될 때 payload가 커지므로 JSONP GET 대신 POST를 사용한다.
    return fetchPost('adminUpdateNewsItem', toApiPayload(row)).then(function(res){
      return convertApiItem(res.item || {});
    });
  }

  function adminSaveNewsItem(row, isUpdate){
    return (isUpdate ? adminUpdateNewsItem(row) : adminCreateNewsItem(row));
  }

  function adminArchiveNewsItem(id){
    return workerGet('adminArchiveNewsItem', {id:id, updatedBy:'admin'}).then(function(res){
      return convertApiItem(res.item || {});
    });
  }

  function loadPublicNews(lang){
    lang = setCurrentLang(lang || getCurrentLang());
    return workerGet('publicListNewsItems', {lang: lang}).then(function(res){
      const items = keepOnlyLang(res.items || [], lang);
      cachedPublicNewsByLang[lang] = items;
      hasLoadedPublicNewsByLang[lang] = true;
      savePublicNewsCache(items, lang);
      dispatchNewsUpdated();
      return items.slice();
    }).catch(function(err){
      cachedPublicNewsByLang[lang] = cachedLocalPublicNews(lang);
      hasLoadedPublicNewsByLang[lang] = true;
      dispatchNewsUpdated();
      throw err;
    });
  }

  function publicNews(lang){
    lang = normalizeLang(lang || getCurrentLang());
    if(cachedPublicNewsByLang[lang] && cachedPublicNewsByLang[lang].length){
      return cachedPublicNewsByLang[lang].slice();
    }
    if(hasLoadedPublicNewsByLang[lang]) return [];
    cachedPublicNewsByLang[lang] = cachedLocalPublicNews(lang);
    return cachedPublicNewsByLang[lang].slice();
  }

  function isNew(date){
    if(!date) return false;
    const d = new Date(String(date).slice(0,10) + 'T00:00:00');
    const now = new Date();
    const diff = (now - d) / (1000 * 60 * 60 * 24);
    return diff <= 7 && diff >= 0;
  }

  function toLongDate(date){
    if(!date) return '-';
    const parts = String(date).slice(0,10).split('-');
    if(parts.length !== 3) return date;
    return parts[0] + '.' + parts[1] + '.' + parts[2];
  }

  function toShortDate(date){
    if(!date) return '-';
    const parts = String(date).slice(0,10).split('-');
    if(parts.length !== 3) return date;
    return parts[1] + '.' + parts[2];
  }

  function getYear(date){
    const y = String(date || '').slice(0,10).split('-')[0];
    return y || '';
  }

  function sortNews(a,b){
    if(!!b.pinned !== !!a.pinned) return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
    if(Number(a.sortOrder || 0) !== Number(b.sortOrder || 0)) return Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
    return String(b.date || b.publishedAt || '').localeCompare(String(a.date || a.publishedAt || ''));
  }

  function badgeClass(badge){
    const key = String(badge || '').toLowerCase();
    if(key === 'debut') return 'badge-debut';
    if(key === 'live') return 'badge-live';
    if(key === 'event') return 'badge-event';
    if(key === 'update') return 'badge-update';
    if(key === 'media') return 'badge-media';
    if(key === 'new') return 'badge-new';
    return 'badge-info';
  }

  function defaultBadgeForCategory(cat){
    return {'라이브':'LIVE','공지':'INFO','이벤트':'EVENT','업데이트':'UPDATE'}[cat] || 'INFO';
  }

  function badgesFor(n){
    const badges = Array.isArray(n && n.badges) ? n.badges.slice() : [];
    if(!badges.length) badges.push(defaultBadgeForCategory(n && n.category));
    if(isNew(n && n.date) && !badges.includes('NEW')) badges.push('NEW');
    return badges;
  }

  function addLangToUrl(href, lang){
    href = String(href || '');
    lang = normalizeLang(lang || getCurrentLang());
    if(!href || lang === 'ko') return href;
    const hashIndex = href.indexOf('#');
    const hash = hashIndex >= 0 ? href.slice(hashIndex) : '';
    const base = hashIndex >= 0 ? href.slice(0, hashIndex) : href;
    const sep = base.indexOf('?') >= 0 ? '&' : '?';
    return base + sep + 'lang=' + encodeURIComponent(lang) + hash;
  }

  function newsHref(n){
    const lang = getCurrentLang();
    let href = '';
    if(n && n.id === 'NEWS-20260712-001'){
      href = n.link || 'news-debut.html';
    }else{
      /* group(=translationGroupId) 기준 링크를 생성해야 언어 전환이 정상 동작함.
         번역 행의 id는 NEWS-YYYYMMDD-NNN-JA 처럼 lang suffix가 붙으므로
         ?id=를 그대로 쓰면 다른 lang으로 전환 시 글을 찾지 못함. */
      const groupId = (n && n.translationGroupId) || (n && n.id) || '';
      href = 'news-detail.html?group=' + encodeURIComponent(groupId);
    }
    return addLangToUrl(href, lang);
  }

  function searchHaystack(n){
    return [
      n && n.id,n && n.date,toLongDate(n && n.date),toShortDate(n && n.date),n && n.category,n && n.title,stripHTML(n && n.body),
      ...((n && Array.isArray(n.badges)) ? n.badges : []),
      n && n.infoDate,n && n.infoPlace,n && n.infoTime,n && n.infoTicket
    ].join(' ').toLowerCase();
  }

  const api = {
    API_URL,
    STORAGE_KEY,
    NEWS_UPDATED_EVENT,
    DEFAULT_NEWS,
    getCurrentLang,
    setCurrentLang,
    normalizeLang,
    readState,
    publicNews,
    loadPublicNews,
    adminListNewsItems,
    adminCreateNewsItem,
    adminUpdateNewsItem,
    adminSaveNewsItem,
    adminArchiveNewsItem,
    uploadNewsImage,
    listRecentNewsImages,
    deleteRecentNewsImages,
    getDriveImageData,
    listNewsStickers,
    uploadNewsSticker,
    translateNewsContent,
    sortNews,
    htmlEscape,
    stripHTML,
    isNew,
    toLongDate,
    toShortDate,
    getYear,
    badgeClass,
    badgesFor,
    newsHref,
    addLangToUrl,
    searchHaystack,
    convertApiItem,
    toApiPayload
  };

  window.LumiContentSync = api;
  window.LumiNewsSync = api;

  function initPublicNewsLoad(){
    const initLang = normalizeLang(new URLSearchParams(location.search).get('lang') || getCurrentLang());
    setCurrentLang(initLang);
    loadPublicNews(initLang).catch(function(){});
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initPublicNewsLoad);
  }else{
    initPublicNewsLoad();
  }
})();