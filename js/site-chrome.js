(() => {
  const mount = document.querySelector('[data-site-chrome]');
  if (!mount) return;

  mount.outerHTML = `
    <header class="site-header" id="top">
      <div class="language-wrap">
        <button class="language-button" type="button" aria-expanded="false" aria-controls="language-menu">
          <span>KR</span><i aria-hidden="true"></i>
        </button>
        <div class="language-menu" id="language-menu" hidden>
          <button class="is-current" type="button" data-lang="KR">KR</button>
          <button type="button" data-lang="EN">EN</button>
          <button type="button" data-lang="JP">JP</button>
          <button type="button" data-lang="CN">CN</button>
        </div>
      </div>
      <a class="brand" href="./index.html" aria-label="LUMIBELLE 홈"><strong>LUMIBELLE</strong></a>
      <button class="menu-button" type="button" aria-label="메뉴 열기" aria-expanded="false" aria-controls="site-menu">
        <span class="menu-lines" aria-hidden="true"><i></i><i></i><i></i></span><b>MENU</b>
      </button>
    </header>
    <aside class="site-menu" id="site-menu" hidden aria-hidden="true">
      <div class="menu-shell">
        <header class="menu-header">
          <button class="menu-language" type="button" aria-label="현재 언어 한국어">KR <i aria-hidden="true"></i></button>
          <a class="menu-brand" href="./index.html">LUMIBELLE</a>
          <button class="menu-close" type="button" aria-label="메뉴 닫기"><span aria-hidden="true"></span><b>CLOSE</b></button>
        </header>
        <div class="menu-content">
          <h2>ALL MENU</h2>
          <nav class="menu-main-grid" aria-label="주요 전체 메뉴">
            <a href="./index.html" data-menu-key="home"><strong>HOME</strong><span>홈</span></a>
            <a href="./news.html" data-menu-key="news"><strong>NEWS</strong><span>공지사항</span></a>
            <a href="./members.html" data-menu-key="members"><strong>MEMBER</strong><span>멤버 소개</span></a>
            <a href="./schedule.html" data-menu-key="schedule"><strong>SCHEDULE</strong><span>스케줄</span></a>
            <a href="#"><strong>TICKET</strong><span>예매</span></a>
            <a href="#"><strong>GOODS</strong><span>굿즈</span></a>
            <a href="#"><strong>SETLIST</strong><span>응원 가이드</span></a>
            <a href="#"><strong>INFO</strong><span>안내</span></a>
          </nav>
          <a class="menu-lounge-entry" href="#"><span><strong>LUMINA LOUNGE</strong><small>루미폰 회원 전용 커뮤니티</small></span><i aria-hidden="true"></i></a>
          <section class="menu-list-section">
            <h3>MORE CONTENTS</h3>
            <a href="./music.html" data-menu-key="music"><strong>MUSIC</strong><span>음악 아카이브</span><i aria-hidden="true"></i></a>
            <a href="./video.html" data-menu-key="video"><strong>MORE VIDEO</strong><span>영상 아카이브</span><i aria-hidden="true"></i></a>
            <a href="#"><strong>LUMI LOG</strong><span>공연 기록</span><i aria-hidden="true"></i></a>
            <a href="./photo.html" data-menu-key="photo"><strong>MOMENTS</strong><span>순간들</span><i aria-hidden="true"></i></a>
            <a href="./story.html" data-menu-key="story"><strong>STORY</strong><span>스토리</span><i aria-hidden="true"></i></a>
          </section>
          <details class="menu-more-group">
            <summary>FAN CONTENTS <i aria-hidden="true"></i></summary>
            <div><a href="#">EVENT</a><a href="#">GAME ZONE</a><a href="./fanname.html" data-menu-key="fanname">FANNAME</a><a href="#">LUMI ID</a><a href="#">ON AIR</a></div>
          </details>
          <section class="menu-social">
            <h3>FOLLOW US</h3>
            <div><a href="#">X</a><a href="#">Instagram</a><a href="#">TikTok</a><a href="#">YouTube</a></div>
          </section>
        </div>
      </div>
    </aside>`;

  const pageName = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  let currentKey = '';
  if (pageName === 'index.html' || pageName === '') currentKey = 'home';
  else if (pageName.startsWith('news')) currentKey = 'news';
  else if (pageName === 'members.html' || pageName.startsWith('member-')) currentKey = 'members';
  else if (pageName.startsWith('music')) currentKey = 'music';
  else if (pageName === 'video.html' || pageName === 'lumi-clip.html') currentKey = 'video';
  else if (pageName === 'photo.html') currentKey = 'photo';
  else if (pageName === 'schedule.html') currentKey = 'schedule';
  else if (pageName === 'fanname.html') currentKey = 'fanname';
  else if (pageName === 'story.html' || pageName.startsWith('story-')) currentKey = 'story';

  if (currentKey) {
    document.querySelector(`[data-menu-key="${currentKey}"]`)?.setAttribute('aria-current', 'page');
  }
})();
