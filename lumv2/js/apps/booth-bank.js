/** booth-bank.js — 물판 통장 (반짝 포인트 UI 패밀리) */
(function () {
  "use strict";
  window.LumiApps = window.LumiApps || {};

  var DEFAULT_POINT_DATA = {
    totals: { merch: 3 },
    points: [
      { id:"merch-1", pointType:"merch", amount:1, reason:"특전권 15장 구매", eventName:"Debut Live", createdAt:"2026.07.12 18:20", status:"confirmed", sourceType:"ticketPurchase" },
      { id:"merch-2", pointType:"merch", amount:1, reason:"Lumibelle 메아테 지정", eventName:"Debut Live", createdAt:"2026.07.12 18:22", status:"confirmed", sourceType:"meate" },
      { id:"merch-3", pointType:"merch", amount:2, reason:"주최 라이브 Lumibelle 메아테 지정", eventName:"LUMIBELLE 주최 라이브", createdAt:"2026.07.26 18:10", status:"confirmed", sourceType:"hostedLive" },
      { id:"merch-4", pointType:"merch", amount:2, reason:"주최 라이브 Lumibelle 메아테 지정", eventName:"LUMIBELLE 주최 라이브 2회차", createdAt:"2026.08.02 18:10", status:"confirmed", sourceType:"hostedLive" },
      { id:"merch-5", pointType:"merch", amount:-3, reason:"이벤트 특전권 1장 사용", eventName:"현장 물판", createdAt:"2026.08.03 20:15", status:"used", sourceType:"reward" }
    ]
  };

  var REWARDS = [
    { point:1, title:"사메권", desc:"교류 30초" }, { point:3, title:"이벤트 특전권 1장", desc:"현장 확인 후 지급" },
    { point:5, title:"카코미 체키", desc:"데코 O · 교류 X" }, { point:7, title:"물품 사인권", desc:"운영 확인 후 진행" },
    { point:10, title:"30초 영상 + 녹음권", desc:"현장 확인 후 지급" }, { point:15, title:"물판 패스권", desc:"운영 확인 후 사용" },
    { point:20, title:"멤버 지정 숙제 체키 1개", desc:"멤버 지정 가능" }, { point:25, title:"루미벨 굿즈", desc:"한정 굿즈 포함 1개 선택 가능" },
    { point:30, title:"라이브 무료 입장", desc:"대상 공연은 운영 확인" }, { point:35, title:"세트리스트 지정권", desc:"2곡 지정 가능" },
    { point:40, title:"오프회 무료 참가권", desc:"운영 일정에 따라 사용" }, { point:100, title:"프라이빗 콘서트 & 1:1 비전 만찬", desc:"미니공연 + 식사 + 한정 인증서" }
  ];

  window.LumiApps.boothBank = function () {
    return '<section class="booth-bank-app" data-booth-bank-app>' +
      '<header class="booth-bank-heading"><span class="booth-bank-heading-kicker">LUMIBELLE</span><h2>물판 포인트 통장</h2></header>' +
      '<nav class="booth-bank-tabs" role="tablist" aria-label="물판 포인트 메뉴">' +
        tab('book','통장',true) + tab('ledger','내역') + tab('rewards','보상판') + tab('guide','안내') +
      '</nav><div class="booth-bank-body" data-booth-bank-body></div></section>';
  };

  function tab(id,label,active){ return '<button type="button" class="booth-bank-tab'+(active?' is-active':'')+'" data-booth-tab="'+id+'" role="tab" aria-selected="'+(active?'true':'false')+'">'+label+'</button>'; }

  window.LumiApps.bindBoothBank = function (root) {
    var app=root.querySelector('[data-booth-bank-app]'); if(!app || app.__lumiBoothBankBound) return;
    app.__lumiBoothBankBound=true; app.__lumiBoothTab='book'; app.__lumiBoothPeriod='all'; app.__lumiBoothSort='newest'; app.__lumiBoothPage=1;
    app.__lumiBoothData=normalize(window.LUMI_POINT_DATA || DEFAULT_POINT_DATA); render(app);
    app.addEventListener('click',function(e){
      var go=e.target.closest('[data-booth-goto]'); if(go){ selectTab(app,go.getAttribute('data-booth-goto')); return; }
      var tabEl=e.target.closest('[data-booth-tab]'); if(tabEl){ selectTab(app,tabEl.getAttribute('data-booth-tab')); return; }
      var period=e.target.closest('[data-booth-period]'); if(period){ app.__lumiBoothPeriod=period.getAttribute('data-booth-period'); app.__lumiBoothPage=1; render(app); return; }
      var sort=e.target.closest('[data-booth-sort]'); if(sort){ app.__lumiBoothSort=sort.getAttribute('data-booth-sort'); app.__lumiBoothPage=1; render(app); return; }
      var more=e.target.closest('[data-booth-more]'); if(more){ app.__lumiBoothPage+=1; render(app); }
    });
  };
  function selectTab(app,id){ app.__lumiBoothTab=id||'book'; app.__lumiBoothPage=1; app.querySelectorAll('[data-booth-tab]').forEach(function(b){var on=b.getAttribute('data-booth-tab')===app.__lumiBoothTab; b.classList.toggle('is-active',on);b.setAttribute('aria-selected',on?'true':'false');}); render(app); }
  function render(app){ var body=app.querySelector('[data-booth-bank-body]'); if(!body)return; var data=app.__lumiBoothData, tabName=app.__lumiBoothTab; body.innerHTML=tabName==='ledger'?renderLedger(data,app):tabName==='rewards'?renderRewards(data):tabName==='guide'?renderGuide():renderBook(data); }

  function renderBook(data){
    var balance=Number(data.totals.merch||0), summary=summaryOf(data.points), next=getNextReward(balance), recent=sortPoints(data.points).slice(0,3);
    return '<section class="booth-book booth-screen">'+
      '<article class="booth-balance-panel"><div class="booth-art-slot booth-art-slot--hero" aria-hidden="true"></div><div class="booth-balance-copy"><span>보유 물판 포인트</span><strong>'+balance+'<em>P</em></strong><p class="booth-today-chip">이번 달 +'+summary.monthEarned+'P 적립</p></div><div class="booth-month-earned"><span>다음 보상</span><strong>'+(next?next.reward.point+'P':'MAX')+'</strong></div></article>'+
      '<section class="booth-bank-panel"><h3>물판 통장</h3><div class="booth-bank-grid">'+metric('누적 적립','+'+summary.earned+'P')+metric('누적 사용','-'+summary.used+'P')+'</div></section>'+
      '<section class="booth-recommend-panel"><div class="booth-section-title"><h3>다음 보상</h3><button type="button" data-booth-goto="rewards">보상판 보기</button></div><div class="booth-recommend-grid">'+rewardPreview(next,balance)+'</div></section>'+
      '<section class="booth-recent-panel"><div class="booth-section-title"><h3>최근 내역</h3><button type="button" data-booth-goto="ledger">전체 내역 보기</button></div><div class="booth-recent-list">'+recent.map(recentRow).join('')+'</div></section>'+
      '<p class="booth-note">물판 포인트는 특전회와 메아테 참여 기록으로 적립돼요.</p></section>';
  }
  function metric(label,value){return '<article class="booth-metric"><span>'+esc(label)+'</span><strong>'+esc(value)+'</strong></article>';}
  function recentRow(item){var minus=Number(item.amount)<0;return '<article class="booth-recent-row"><div class="booth-row-slot" aria-hidden="true"></div><div><strong>'+esc(item.reason)+'</strong><span>'+esc(item.createdAt)+'</span></div><em class="'+(minus?'is-minus':'')+'">'+format(item.amount)+'</em></article>';}
  function rewardPreview(next,balance){ if(!next)return '<article class="booth-recommend-card"><div class="booth-item-slot" aria-hidden="true"></div><div><strong>최고 보상 달성</strong><span>운영 확인</span></div></article>'; return '<article class="booth-recommend-card"><div class="booth-item-slot" aria-hidden="true"></div><div><strong>'+esc(next.reward.title)+'</strong><span>'+next.reward.point+'P · '+next.left+'P 남음</span></div></article>'; }

  function renderLedger(data,app){
    var period=app.__lumiBoothPeriod, sort=app.__lumiBoothSort, page=app.__lumiBoothPage, all=filterPeriod(sortPoints(data.points,sort),period), shown=all.slice(0,page*6), groups=groupByMonth(shown);
    return '<section class="booth-ledger booth-screen">'+
      '<nav class="booth-subtabs" aria-label="내역 기간">'+periodTabs(period)+'</nav>'+
      '<div class="booth-ledger-tools"><button type="button" class="booth-tool-button" data-booth-sort="'+(sort==='newest'?'oldest':'newest')+'">'+(sort==='newest'?'최신순':'오래된순')+'</button><span>'+all.length+'건</span></div>'+
      '<div class="booth-ledger-list">'+(groups.length?groups.map(function(g){return '<section class="booth-month-group"><h3>'+esc(g.label)+'</h3><div>'+g.items.map(ledgerItem).join('')+'</div></section>';}).join(''):'<div class="booth-empty">해당 기간에 내역이 없어요.</div>')+'</div>'+
      (all.length>shown.length?'<button type="button" class="booth-more-button" data-booth-more="1">더보기</button>':'')+
      '<p class="booth-note">물판 포인트 내역은 현장 스탭 확인 후 반영돼요.</p></section>';
  }
  function periodTabs(now){var map={all:'전체', '1m':'1개월','3m':'3개월','6m':'6개월','1y':'1년'};return Object.keys(map).map(function(k){return '<button type="button" class="booth-subtab'+(now===k?' is-active':'')+'" data-booth-period="'+k+'">'+map[k]+'</button>';}).join('');}
  function ledgerItem(item){var minus=Number(item.amount)<0, chip=minus?'사용':'적립';return '<article class="booth-ledger-item '+(minus?'is-minus':'is-plus')+'"><div class="booth-row-slot" aria-hidden="true"></div><div class="booth-ledger-copy"><div class="booth-ledger-title"><strong>'+esc(item.reason)+'</strong><i class="'+(minus?'is-used':'')+'">'+chip+'</i></div><span>'+esc(item.createdAt)+' · '+esc(item.eventName||sourceLabel(item.sourceType))+'</span></div><div class="booth-ledger-amount"><em class="'+(minus?'is-minus':'')+'">'+format(item.amount)+'</em><span>'+esc(statusLabel(item.status))+'</span></div></article>';}

  function renderRewards(data){var balance=Number(data.totals.merch||0);return '<section class="booth-rewards booth-screen"><article class="booth-reward-balance"><div class="booth-art-slot" aria-hidden="true"></div><div><span>보유 물판 포인트</span><strong>'+balance+'<em>P</em></strong></div><p>다음 보상<br><b>'+(getNextReward(balance)?getNextReward(balance).reward.point+'P':'MAX')+'</b></p></article><section class="booth-reward-grid">'+REWARDS.map(function(r){var on=balance>=r.point;return '<article class="booth-reward-card'+(on?' is-reached':'')+'"><div class="booth-item-slot booth-item-slot--large" aria-hidden="true"></div><strong>'+esc(r.title)+'</strong><span>'+r.point+'P</span><p>'+esc(r.desc)+'</p><b>'+ (on?'확인 가능':'부족')+'</b></article>';}).join('')+'</section><p class="booth-note">보상은 현장 운영 확인 후 사용할 수 있어요.</p></section>';}
  function renderGuide(){return '<section class="booth-guide booth-screen"><article class="booth-guide-intro"><div class="booth-art-slot" aria-hidden="true"></div><div><h3>물판 포인트란?</h3><p>특전회와 메아테 참여 기록으로 쌓이는 현장 포인트예요.<br>보상판에서 달성 보상을 확인할 수 있어요.</p></div></article><section class="booth-guide-panel"><h3>적립 기준</h3>'+guideRow('특전권 15장 구매','1P 지급')+guideRow('Lumibelle 메아테 지정','1P 지급')+guideRow('주최 라이브 메아테 지정','2P 지급')+'</section><section class="booth-guide-panel"><h3>사용 규정</h3><ul><li>포인트 사용 시 즉시 차감되며 복구되지 않아요.</li><li>보상은 현장 운영 확인 후 사용할 수 있어요.</li><li>반짝 포인트·반짝 XP·스탬프와 합산되지 않아요.</li></ul></section><section class="booth-guide-panel"><h3>부정행위 및 제한</h3><ul><li>양도·복제·위조 확인 시 포인트가 몰수될 수 있어요.</li><li>최종 기준은 루미벨 공식 계정 공지를 확인해 주세요.</li></ul></section></section>';}
  function guideRow(title,desc){return '<article class="booth-guide-row"><div class="booth-row-slot" aria-hidden="true"></div><div><strong>'+esc(title)+'</strong><span>'+esc(desc)+'</span></div></article>';}

  function normalize(payload){var src=payload||{}, totals=src.totals||{}; return {totals:{merch:Number(totals.merch||0)},points:Array.isArray(src.points)?src.points.filter(function(x){return (x.pointType||'merch')==='merch';}).map(function(x,i){return {id:x.id||'m-'+i,pointType:'merch',amount:Number(x.amount||0),reason:x.reason||'',eventName:x.eventName||'',createdAt:x.createdAt||'',status:x.status||'',sourceType:x.sourceType||''};}):[]};}
  function summaryOf(points){var total={earned:0,used:0,monthEarned:0};var latestMonth=''; points.forEach(function(x){if(String(x.createdAt)>latestMonth) latestMonth=String(x.createdAt).slice(0,7);}); points.forEach(function(x){var a=Number(x.amount||0); if(a>0){total.earned+=a;if(String(x.createdAt).slice(0,7)===latestMonth)total.monthEarned+=a;} else total.used+=Math.abs(a);});return total;}
  function getNextReward(balance){for(var i=0;i<REWARDS.length;i++){if(balance<REWARDS[i].point)return {reward:REWARDS[i],left:REWARDS[i].point-balance};}return null;}
  function sortPoints(points,sort){return points.slice().sort(function(a,b){var c=String(b.createdAt).localeCompare(String(a.createdAt));return sort==='oldest'?-c:c;});}
  function filterPeriod(points,p){if(p==='all')return points; var months={ '1m':1,'3m':3,'6m':6,'1y':12 }[p]||999; var newest=points.length?String(points[0].createdAt).slice(0,7):'';if(!newest)return points;var spl=newest.split('.'), base=new Date(Number(spl[0]),Number(spl[1])-1,1);return points.filter(function(x){var a=String(x.createdAt).match(/(\d{4})\.(\d{2})/);if(!a)return false;var d=new Date(Number(a[1]),Number(a[2])-1,1);return (base-d)/(1000*60*60*24*30.5)<months;});}
  function groupByMonth(points){var out=[];points.forEach(function(x){var label=String(x.createdAt).slice(0,7)||'기록';var g=out.find(function(v){return v.label===label;});if(!g){g={label:label,items:[]};out.push(g);}g.items.push(x);});return out;}
  function sourceLabel(t){return t==='ticketPurchase'?'특전권 구매':t==='meate'?'메아테':t==='hostedLive'?'주최 라이브':t==='reward'?'보상 사용':'스탭 확인';}
  function statusLabel(s){return s==='used'?'차감 완료':s==='pending'?'확인 중':'스탭 확인 완료';}
  function format(a){var n=Number(a||0);return (n>0?'+':'')+n+'P';}
  function esc(v){return String(v==null?'':v).replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
}());
