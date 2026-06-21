/**
 * i18n.js — 루미폰 v2 다국어 문구
 * 규칙: 문구만. 로직 없음. LumiI18n 모듈만 포함.
 * 새 문구 추가 시 ko에 먼저 넣고, en/ja/zh는 추후 번역.
 */

window.LUMI_I18N = {
  ko: {
    /* 앱 이름 */
    "app.ticket":       "티켓",
    "app.benefitQueue": "특전회 대기",
    "app.messages":     "문자",
    "app.mail":         "우편함",
    "app.lumitalk":     "루미톡",
    "app.timeline":     "기록",
    "app.profile":      "프로필",
    "app.stamp":        "스탬프",
    "app.point":        "포인트",
    "app.boothBank":    "물판 통장",
    "app.achievement":  "업적",
    "app.homeworkCheki":"숙제체키",
    "app.onair":        "ON AIR",
    "app.lumilog":      "루미로그",
    "app.exchange":     "교환소",
    "app.songbook":     "노래책",
    "app.themeShop":    "테마샵",
    "app.settings":     "설정",
    "app.attendance":   "루미 출석",
    "app.gameZone":     "게임존",
    "app.guide":        "가이드",
    "app.more":         "추가 예정",
    "app.lumicheki":    "루미체키",
    "app.lumicall":     "루미콜",

    /* 네비게이션 */
    "nav.tabs":  "탭보기",
    "nav.home":  "홈",
    "nav.back":  "뒤로가기",

    /* Today View */
    "today.weather":          "LUMI WEATHER",
    "today.reservation":      "현재 예약",
    "today.message":          "오늘의 한마디",
    "today.onair":            "ON AIR 현황",
    "today.summary.messages": "새 메시지",
    "today.summary.stamps":   "스탬프 현황",
    "today.summary.points":   "보유 포인트",
    "today.summary.cheki":    "숙제체키",

    "home.stamp.label": "LUMI STAMP",
    "home.stamp.desc": "스탬프를 모아보세요",
    "home.energy.label": "반짝 충전",
    "home.energy.desc": "오늘의 루미 에너지가 채워지고 있어요.",

    /* 최근 앱 */
    "recent.title": "최근 앱",
    "recent.empty": "아직 열린 앱이 없어요.",

    /* 빈 화면 메시지 */
    "empty.ticket":   "현재 확인할 티켓이 없어요.",
    "empty.messages": "아직 도착한 메시지가 없어요.",
    "empty.mail":     "아직 도착한 우편이 없어요.",
    "empty.default":  "곧 루미나와 만나는 새로운 공간이 열려요.",

    /* Placeholder 앱 안내 문구 */
    "placeholder.lumitalk":  "곧 루미나와 멤버를 이어주는 공간이 열려요.",
    "placeholder.lumicheki": "소중한 체키 기록이 이곳에 모일 거예요.",
    "placeholder.lumicall":  "반짝이는 목소리를 만나는 시간이 준비되고 있어요.",
    "placeholder.themeShop": "나만의 루미폰을 꾸미는 테마가 이곳에 모일 거예요.",
    "placeholder.attendance":"오늘의 루미 출석을 남기고 반짝 에너지를 모아요.",
    "placeholder.gameZone":  "작은 게임과 반짝 이벤트가 이곳에 모일 거예요.",
    "placeholder.more":      "새로운 루미폰 앱이 이곳에 찾아올 거예요."
  ,
      "ticket.tabs": "티켓함 탭",
      "ticket.current": "현재 티켓",
      "ticket.benefit": "특전권",
      "ticket.past": "지난 티켓",
      "ticket.current.kicker": "CURRENT TICKET",
      "ticket.current.meta": "입금 확인 대기 · 홍대 상상마당",
      "ticket.status.waiting": "입금 확인 대기",
      "ticket.enter.ready": "입장 전",
      "ticket.empty.benefit": "아직 표시할 특전권이 없어요.",
      "ticket.empty.past": "지난 티켓은 공연이 끝난 뒤 이곳에 모여요."
,
      "common.close": "닫기"
},
  en: {
      "ticket.tabs": "Ticket tabs",
      "ticket.current": "Current",
      "ticket.benefit": "Benefits",
      "ticket.past": "Past",
      "ticket.current.kicker": "CURRENT TICKET",
      "ticket.current.meta": "Payment pending · Hongdae Sangsangmadang",
      "ticket.status.waiting": "Payment pending",
      "ticket.enter.ready": "Before entry",
      "ticket.empty.benefit": "No benefit tickets to show yet.",
      "ticket.empty.past": "Past tickets will appear here after the show."
,
      "common.close": "Close"
},
  ja: {
      "ticket.tabs": "チケットタブ",
      "ticket.current": "現在のチケット",
      "ticket.benefit": "特典券",
      "ticket.past": "過去のチケット",
      "ticket.current.kicker": "CURRENT TICKET",
      "ticket.current.meta": "入金確認待ち · 弘大サンサンマダン",
      "ticket.status.waiting": "入金確認待ち",
      "ticket.enter.ready": "入場前",
      "ticket.empty.benefit": "表示できる特典券はまだありません。",
      "ticket.empty.past": "終了した公演のチケットはここに表示されます。"
,
      "common.close": "閉じる"
},
  zh: {
      "ticket.tabs": "票券标签",
      "ticket.current": "当前票券",
      "ticket.benefit": "特典券",
      "ticket.past": "历史票券",
      "ticket.current.kicker": "CURRENT TICKET",
      "ticket.current.meta": "等待确认入金 · 弘大 Sangsangmadang",
      "ticket.status.waiting": "等待确认入金",
      "ticket.enter.ready": "入场前",
      "ticket.empty.benefit": "目前还没有可显示的特典券。",
      "ticket.empty.past": "演出结束后，历史票券会显示在这里。"
,
      "common.close": "关闭"
}
};

/**
 * LumiI18n — 번역 헬퍼 모듈
 * 사용: LumiI18n.t("app.ticket") / LumiI18n.apply(document)
 */
window.LumiI18n = (function () {
  var _lang = (function () {
    var saved = localStorage.getItem("lumiLang");
    if (saved && window.LUMI_I18N[saved]) return saved;
    var browser = (navigator.language || "ko").toLowerCase();
    if (browser.startsWith("en")) return "en";
    if (browser.startsWith("ja")) return "ja";
    if (browser.startsWith("zh")) return "zh";
    return "ko";
  }());

  function getLang() { return _lang; }

  function setLang(lang) {
    if (!window.LUMI_I18N[lang]) return;
    _lang = lang;
    localStorage.setItem("lumiLang", lang);
  }

  function t(key) {
    var pack = window.LUMI_I18N[_lang] || {};
    var ko   = window.LUMI_I18N.ko || {};
    return pack[key] || ko[key] || key;
  }

  function apply(root) {
    var scope = root || document;
    scope.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
  }

  return { getLang: getLang, setLang: setLang, t: t, apply: apply };
}());
