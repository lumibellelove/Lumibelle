(function(){
  const STORAGE_KEY = 'lumibelleContentAdminV2';
  const DEFAULT_NEWS = [
    {id:'NEWS-20260712-001',title:'루미벨 데뷔라이브 안내',date:'2026-07-12',category:'라이브',badges:['DEBUT'],body:'안녕하세요. 루미벨입니다.<br><br>루미벨의 데뷔라이브가 2026년 7월 12일 진행됩니다.<br><br>상세 안내와 예약 관련 내용은 아래 티켓 버튼을 통해 확인 부탁드립니다.',published:true,draft:false,home:true,pinned:true,link:'news-detail.html?id=NEWS-20260712-001',infoDate:'2026.07.12 (토)',infoPlace:'KT&G 상상마당 라이브홀 홍대',infoTime:'OPEN 13:50 / START 14:20',infoTicket:'구글폼 예약 진행',btn1Text:'TICKET',btn1Link:'/ticket/index.html',btn2Text:'BACK TO NEWS',btn2Link:'news.html'},
    {id:'NEWS-20261018-001',title:'빅 이벤트 라이브 예정 안내',date:'2026-10-18',category:'라이브',badges:['LIVE'],body:'빅 이벤트 라이브 예정 안내입니다.',published:true,draft:false,home:true,pinned:false,link:'news-detail.html?id=NEWS-20261018-001'},
    {id:'NEWS-20260501-001',title:'굿즈 관련 안내 예정',date:'2026-05-01',category:'공지',badges:['INFO'],body:'굿즈 관련 안내 예정입니다.',published:true,draft:false,home:false,pinned:false,link:'news-detail.html?id=NEWS-20260501-001'}
  ];

  function readState(){
    try{
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if(parsed && Array.isArray(parsed.news)) return parsed;
    }catch(e){}
    return {news: DEFAULT_NEWS.slice()};
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

  function isNew(date){
    if(!date) return false;
    const d = new Date(date + 'T00:00:00');
    const now = new Date();
    const diff = (now - d) / (1000 * 60 * 60 * 24);
    return diff <= 7 && diff >= 0;
  }

  function toLongDate(date){
    if(!date) return '-';
    const parts = String(date).split('-');
    if(parts.length !== 3) return date;
    return parts[0] + '.' + parts[1] + '.' + parts[2];
  }

  function toShortDate(date){
    if(!date) return '-';
    const parts = String(date).split('-');
    if(parts.length !== 3) return date;
    return parts[1] + '.' + parts[2];
  }

  function getYear(date){
    const y = String(date || '').split('-')[0];
    return y || '';
  }

  function publicNews(){
    return readState().news
      .filter(function(n){ return n && n.published !== false && !n.draft; })
      .sort(sortNews);
  }

  function sortNews(a,b){
    if(!!b.pinned !== !!a.pinned) return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
    return String(b.date || '').localeCompare(String(a.date || ''));
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

  function badgesFor(n){
    const badges = Array.isArray(n.badges) ? n.badges.slice() : [];
    if(!badges.length){
      const fallback = {'라이브':'LIVE','공지':'INFO','이벤트':'EVENT','업데이트':'UPDATE'}[n.category] || 'INFO';
      badges.push(fallback);
    }
    if(isNew(n.date) && !badges.includes('NEW')) badges.push('NEW');
    return badges;
  }

  function newsHref(n){
    if(n && n.id === 'NEWS-20260712-001') return n.link || 'news-debut.html';
    return (n && n.link) ? n.link : ('news-detail.html?id=' + encodeURIComponent(n.id || ''));
  }

  function searchHaystack(n){
    return [
      n.id,n.date,toLongDate(n.date),toShortDate(n.date),n.category,n.title,stripHTML(n.body),
      ...(Array.isArray(n.badges) ? n.badges : []),
      n.infoDate,n.infoPlace,n.infoTime,n.infoTicket
    ].join(' ').toLowerCase();
  }

  window.LumiNewsSync = {
    STORAGE_KEY,
    DEFAULT_NEWS,
    readState,
    publicNews,
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
    searchHaystack
  };
})();
