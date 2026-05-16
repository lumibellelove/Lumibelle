(function(){
  const API_URL = 'https://script.google.com/macros/s/AKfycbzmZHCLvg_Nd8f6qnat3RisYoMPnGARaLWPqeCnt2zHI8wl0-QuXkMmnGtcP_BoSFEH/exec';
  const STORAGE_KEY = 'lumibelleContentAdminV2';
  const NEWS_UPDATED_EVENT = 'lumi-news-updated';

  const DEFAULT_NEWS = [];
  let cachedPublicNews = [];
  let hasLoadedPublicNews = false;

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
      btn1Text: row.btn1Text || '',
      btn1Link: row.btn1Link || row.ticketUrl || '',
      btn2Text: row.btn2Text || '',
      btn2Link: row.btn2Link || '',
      ticketUrl: row.ticketUrl || row.btn1Link || '',
      sortOrder: row.sortOrder || 0,
      lang: row.lang || 'ko',
      translationGroupId: row.translationGroupId || row.id || '',
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

  function readState(){
    try{
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if(parsed && Array.isArray(parsed.news)) return parsed;
    }catch(e){}
    return {news: DEFAULT_NEWS.slice()};
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
    return request('adminListNewsItems', {}).then(function(res){
      const items = (res.items || []).map(convertApiItem).sort(sortNews);
      saveLocalNews(items);
      return items;
    });
  }

  function adminCreateNewsItem(row){
    return request('adminCreateNewsItem', toApiPayload(row)).then(function(res){
      return convertApiItem(res.item || {});
    });
  }

  function adminUpdateNewsItem(row){
    return request('adminUpdateNewsItem', toApiPayload(row)).then(function(res){
      return convertApiItem(res.item || {});
    });
  }

  function adminSaveNewsItem(row, isUpdate){
    return (isUpdate ? adminUpdateNewsItem(row) : adminCreateNewsItem(row));
  }

  function adminArchiveNewsItem(id){
    return request('adminArchiveNewsItem', {id:id, updatedBy:'admin'}).then(function(res){
      return convertApiItem(res.item || {});
    });
  }

  function loadPublicNews(lang){
    return request('publicListNewsItems', {lang: lang || 'ko'}).then(function(res){
      cachedPublicNews = (res.items || []).map(convertApiItem).sort(sortNews);
      hasLoadedPublicNews = true;
      saveLocalNews(cachedPublicNews);
      dispatchNewsUpdated();
      return cachedPublicNews;
    }).catch(function(err){
      const local = readState().news || [];
      cachedPublicNews = local.filter(function(n){ return n && n.published !== false && !n.draft; }).sort(sortNews);
      hasLoadedPublicNews = true;
      dispatchNewsUpdated();
      throw err;
    });
  }

  function publicNews(){
    if(hasLoadedPublicNews) return cachedPublicNews.slice();
    const local = readState().news || [];
    return local.filter(function(n){ return n && n.published !== false && !n.draft; }).sort(sortNews);
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

  function newsHref(n){
    if(n && n.id === 'NEWS-20260712-001') return n.link || 'news-debut.html';
    return (n && n.link) ? n.link : ('news-detail.html?id=' + encodeURIComponent(n && n.id || ''));
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
    readState,
    publicNews,
    loadPublicNews,
    adminListNewsItems,
    adminCreateNewsItem,
    adminUpdateNewsItem,
    adminSaveNewsItem,
    adminArchiveNewsItem,
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
    searchHaystack,
    convertApiItem,
    toApiPayload
  };

  window.LumiContentSync = api;
  window.LumiNewsSync = api;

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ loadPublicNews('ko').catch(function(){}); });
  }else{
    loadPublicNews('ko').catch(function(){});
  }
})();
