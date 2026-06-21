(function () {
  "use strict";

  var DEFAULT_STAMP_DATA = {
    round: 1,
    count: 1,
    max: 20,
    records: [
      {
        id: "stamp-001",
        createdAt: "2026.07.12 18:30",
        title: "Debut Live",
        reason: "루미 체크인 완료",
        amount: 1,
        type: "checkin"
      }
    ],
    completedRounds: [],
    benefits: [
      { count: 5, title: "특별 우편 도착", desc: "다음 혜택까지 4개 남았어요.", status: "waiting" },
      { count: 10, title: "디지털 메시지 / 칭호 후보", desc: "다음 혜택까지 9개 남았어요.", status: "waiting" },
      { count: 15, title: "특별 편지 / 장식 후보", desc: "다음 혜택까지 14개 남았어요.", status: "waiting" },
      { count: 20, title: "1회차 완주 · 소장 우편 · 업적 해금", desc: "다음 혜택까지 19개 남았어요.", status: "waiting" }
    ]
  };

  var TABS = [
    { id: "card", label: "카드" },
    { id: "record", label: "기록" },
    { id: "benefit", label: "혜택" },
    { id: "guide", label: "안내" }
  ];

  window.LumiApps = window.LumiApps || {};

  window.LumiApps.stamp = function () {
    return (
      '<section class="stamp-app" data-stamp-app>' +
        '<div class="stamp-head">' +
          '<h2>스탬프</h2>' +
          '<p>루미 체크인으로 모이는 꽃도장 기록을 확인하는 공간이에요.</p>' +
        '</div>' +
        '<div class="stamp-tabs" role="tablist">' +
          TABS.map(function (tab, index) {
            return '<button type="button" class="stamp-tab ' + (index === 0 ? 'is-active' : '') + '" data-stamp-tab="' + escHtml(tab.id) + '">' + escHtml(tab.label) + '</button>';
          }).join("") +
        '</div>' +
        '<div class="stamp-body" data-stamp-body></div>' +
      '</section>'
    );
  };

  window.LumiApps.bindStamp = function (root) {
    var app = root.querySelector("[data-stamp-app]");
    if (!app || app.__lumiStampBound) return;
    app.__lumiStampBound = true;
    app.__lumiStampTab = "card";
    app.__lumiStampData = normalizeStampPayload(window.LUMI_STAMP_DATA || DEFAULT_STAMP_DATA);

    app.addEventListener("click", function (e) {
      var tab = e.target.closest("[data-stamp-tab]");
      if (tab) {
        app.__lumiStampTab = tab.getAttribute("data-stamp-tab") || "card";
        app.querySelectorAll("[data-stamp-tab]").forEach(function (btn) {
          btn.classList.toggle("is-active", btn === tab);
        });
        renderStamp(app);
      }
    });

    renderStamp(app);
  };

  function renderStamp(app) {
    var body = app.querySelector("[data-stamp-body]");
    if (!body) return;

    var tab = app.__lumiStampTab || "card";
    var data = app.__lumiStampData || normalizeStampPayload(DEFAULT_STAMP_DATA);

    if (tab === "record") {
      body.innerHTML = renderRecord(data);
      return;
    }

    if (tab === "benefit") {
      body.innerHTML = renderBenefit(data);
      return;
    }

    if (tab === "guide") {
      body.innerHTML = renderGuide(data);
      return;
    }

    body.innerHTML = renderCard(data);
  }

  function renderCard(data) {
    var count = clamp(Number(data.count || 0), 0, data.max);
    var max = Number(data.max || 20);
    var round = Number(data.round || 1);
    var next = getNextBenefit(data);
    var percent = Math.max(0, Math.min(100, Math.round(count / max * 100)));

    return (
      '<section class="stamp-card-tab">' +
        '<article class="stamp-board-card">' +
          '<div class="stamp-board-head">' +
            '<div>' +
              '<span class="stamp-label">LUMIBELLE STAMP CARD</span>' +
              '<h3>스탬프 카드</h3>' +
            '</div>' +
            '<em>' + escHtml(round) + '회차 ' + escHtml(count) + ' / ' + escHtml(max) + '</em>' +
          '</div>' +
          '<div class="stamp-progress"><i style="width:' + escHtml(percent) + '%"></i></div>' +
          '<p class="stamp-board-desc">다음 혜택까지 ' + escHtml(next.left) + '개 남았어요. 20개 달성 시 초기화가 아니라 ' + escHtml(round) + '회차 완료로 기록됩니다.</p>' +
          '<div class="stamp-grid" aria-label="스탬프 카드">' +
            renderStampSlots(count, max) +
          '</div>' +
        '</article>' +
        '<article class="stamp-next-card">' +
          '<span>다음 혜택</span>' +
          '<strong>' + escHtml(next.benefit.count) + '개 · ' + escHtml(next.benefit.title) + '</strong>' +
          '<p>' + escHtml(next.benefit.desc) + '</p>' +
        '</article>' +
      '</section>'
    );
  }

  function renderRecord(data) {
    var records = (data.records || []).slice().sort(function (a, b) {
      return String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
    });

    return (
      '<section class="stamp-record-tab">' +
        '<div class="stamp-section-head">' +
          '<h3>스탬프 기록</h3>' +
          '<p>루미 체크인 완료 후 지급된 꽃도장 기록이에요.</p>' +
        '</div>' +
        (records.length ? records.map(renderRecordItem).join("") : '<div class="stamp-empty">아직 스탬프 기록이 없어요.</div>') +
      '</section>'
    );
  }

  function renderRecordItem(item) {
    var amount = Number(item.amount || 1);
    return (
      '<article class="stamp-record-item">' +
        '<div class="stamp-record-icon">🌸</div>' +
        '<div>' +
          '<strong>' + escHtml(item.title || "루미 체크인") + '</strong>' +
          '<p>' + escHtml(item.reason || "루미 체크인 완료") + ' · +' + escHtml(amount) + '</p>' +
          '<span>' + escHtml(item.createdAt || "") + '</span>' +
        '</div>' +
      '</article>'
    );
  }

  function renderBenefit(data) {
    var count = Number(data.count || 0);

    return (
      '<section class="stamp-benefit-tab">' +
        '<div class="stamp-section-head">' +
          '<h3>스탬프 혜택 · 레귤레이션</h3>' +
          '<p>스탬프 구간을 처음 달성했을 때 받을 수 있는 혜택이에요.</p>' +
        '</div>' +
        '<div class="stamp-benefit-grid">' +
          (data.benefits || []).map(function (benefit) {
            return renderBenefitCard(benefit, count);
          }).join("") +
        '</div>' +
        '<article class="stamp-info-card is-dashed">' +
          '<h3>20개 완주 보상 흐름</h3>' +
          '<p>20개 달성 순간 보상 우편이 도착하고, 업적/칭호 후보가 해금돼요. 보상 확인 후 다음 회차 0/20으로 시작돼요.</p>' +
        '</article>' +
      '</section>'
    );
  }

  function renderBenefitCard(benefit, count) {
    var reached = count >= Number(benefit.count || 0);
    return (
      '<article class="stamp-benefit-card ' + (reached ? 'is-reached' : '') + '">' +
        '<div>' +
          '<span>' + escHtml(benefit.count) + '개</span>' +
          '<strong>' + escHtml(benefit.title || "") + '</strong>' +
          '<p>' + escHtml(reached ? "달성 완료" : benefit.desc || "") + '</p>' +
        '</div>' +
        '<em>' + (reached ? '달성' : '대기 중') + '</em>' +
      '</article>'
    );
  }

  function renderGuide() {
    return (
      '<section class="stamp-guide-tab">' +
        '<article>' +
          '<h3>스탬프 안내</h3>' +
          '<ul>' +
            '<li>기본 지급은 하루 1개예요.</li>' +
            '<li>루미 방문과 루미 체크인은 달라요.</li>' +
            '<li>스탬프는 루미 체크인 완료 기준으로 지급돼요.</li>' +
            '<li>이벤트 데이에는 추가 스탬프가 지급될 수 있어요.</li>' +
            '<li>스탬프는 물판 포인트, 반짝 포인트, 반짝 XP와 합산되지 않아요.</li>' +
            '<li>20개를 채우면 회차 완료 기록이 남고 다음 회차로 이어져요.</li>' +
          '</ul>' +
        '</article>' +
        '<article>' +
          '<h3>보상 기준</h3>' +
          '<p>스탬프 보상은 각 구간을 처음 달성했을 때 1회만 받을 수 있어요. 이미 받은 보상은 다시 지급되지 않고, 보상 기록으로 남아요.</p>' +
        '</article>' +
      '</section>'
    );
  }

  function renderStampSlots(count, max) {
    var html = "";
    for (var i = 1; i <= max; i += 1) {
      var filled = i <= count;
      html += '<span class="stamp-slot ' + (filled ? 'is-filled' : '') + '" aria-label="' + i + '번째 스탬프">' + (filled ? '🌸' : '✧') + '</span>';
    }
    return html;
  }

  function getNextBenefit(data) {
    var count = Number(data.count || 0);
    var benefits = (data.benefits || []).slice().sort(function (a, b) {
      return Number(a.count || 0) - Number(b.count || 0);
    });
    var next = benefits.find(function (benefit) {
      return Number(benefit.count || 0) > count;
    }) || benefits[benefits.length - 1] || { count: 20, title: "1회차 완주", desc: "" };
    return {
      benefit: next,
      left: Math.max(0, Number(next.count || 0) - count)
    };
  }

  function normalizeStampPayload(payload) {
    var data = payload || {};
    var max = Number(data.max || 20);
    var count = clamp(Number(data.count || 0), 0, max);

    return {
      round: Number(data.round || 1),
      count: count,
      max: max,
      records: Array.isArray(data.records) ? data.records : [],
      completedRounds: Array.isArray(data.completedRounds) ? data.completedRounds : [],
      benefits: Array.isArray(data.benefits) && data.benefits.length ? data.benefits : DEFAULT_STAMP_DATA.benefits
    };
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function escHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
