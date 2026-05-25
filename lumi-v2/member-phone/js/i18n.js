/**
 * i18n.js — 루미폰 v2 다국어 문구
 * 규칙: 문구만. 로직 없음. LumiI18n 모듈만 포함.
 * 새 문구 추가 시 ko에 먼저 넣고, en/ja/zh는 추후 번역.
 */

window.LUMI_I18N = {
  ko: {
    /* 앱 이름 — 멤버폰 OS */
    "app.lumiroom":      "루미룸",
    "app.lumitalk":      "루미톡",
    "app.lumiletter":    "루미레터",
    "app.schedule":      "스케줄",
    "app.dday":          "D-DAY",
    "app.setlist":       "SETLIST",
    "app.homeworkCheki": "숙제체키",
    "app.prep":          "준비물",
    "app.lumilog":       "루미로그",
    "app.onair":         "ON AIR",
    "app.archive":       "자료함",
    "app.sos":           "SOS",

    /* Home 2 / 확장·예정 앱 */
    "app.lumicheki":     "루미체키",
    "app.songbook":      "노래책",
    "app.photo":         "포토",
    "app.voice":         "보이스",
    "app.guide":         "가이드",
    "app.history":       "아카이브",
    "app.settings":      "설정",
    "app.more":          "추가 예정",

    /* 마리링 admin 모드 후보 — MH-01에서는 아직 노출하지 않음 */
    "app.paymentCheck":      "입금확인",
    "app.reservationAdmin":  "예매관리",
    "app.urgentNotice":      "긴급공지",
    "app.goodsAdmin":        "굿즈관리",
    "app.operationMemo":     "운영메모",
    "app.adminLog":          "관리자 로그",

    /* 네비게이션 */
    "nav.tabs":  "탭보기",
    "nav.home":  "홈",
    "nav.back":  "뒤로가기",
    "common.close": "닫기",

    /* Today View */
    "today.weather":          "LUMI WEATHER",
    "today.reservation":      "오늘 일정",
    "today.message":          "오늘의 멤버 메모",
    "today.onair":            "ON AIR 상태",
    "today.summary.messages": "새 루미톡",
    "today.summary.stamps":   "오늘 할 일",
    "today.summary.points":   "숙제체키",
    "today.summary.cheki":    "공지/메모",

    "home.stamp.label": "TODAY PREP",
    "home.stamp.desc": "오늘의 준비를 확인해요",
    "home.energy.label": "MEMBER ENERGY",
    "home.energy.desc": "오늘의 루미 준비 에너지가 채워지고 있어요.",

    /* 최근 앱 */
    "recent.title": "최근 앱",
    "recent.empty": "아직 열린 앱이 없어요.",

    /* 빈 화면 메시지 */
    "empty.default": "곧 멤버 전용 공간이 열려요.",
    "empty.lumiroom": "루미벨 멤버와 스탭이 함께 머무는 루미룸이 준비 중이에요.",
    "empty.lumitalk": "루미나에게 보낼 짧은 메시지를 준비하는 공간이에요.",
    "empty.lumiletter": "긴 편지와 특별한 날의 메시지를 준비하는 공간이에요.",
    "empty.schedule": "공연, 연습, 촬영, 방송 일정을 확인하는 공간이에요.",
    "empty.dday": "중요한 날까지 남은 시간을 확인하는 공간이에요.",
    "empty.setlist": "오늘 셋리, 파트, 멘트, 동선을 확인하는 공간이에요.",
    "empty.homeworkCheki": "내가 써야 하는 숙제체키를 확인하는 공간이에요.",
    "empty.prep": "의상, 소품, 개인 준비물을 체크하는 공간이에요.",
    "empty.lumilog": "공연 후 한마디와 기록을 남기는 공간이에요.",
    "empty.onair": "방송 준비와 ON AIR 상태를 확인하는 공간이에요.",
    "empty.archive": "말투, 해시태그, 팀 자료, 팬응대 기준을 모아두는 공간이에요.",
    "empty.sos": "불편한 상황과 운영진 호출 기준을 빠르게 확인하는 공간이에요.",

    /* Placeholder 앱 안내 문구 */
    "placeholder.lumiroom":  "멤버와 스탭이 함께 쓰는 게임형 루미벨 하우스가 준비 중이에요.",
    "placeholder.lumitalk":  "루미나에게 보낼 짧은 메시지 작성 공간이 열릴 예정이에요.",
    "placeholder.lumiletter":"긴 편지와 특별한 메시지를 준비하는 공간이 열릴 예정이에요.",
    "placeholder.lumicheki": "소중한 체키 기록과 촬영 흐름을 준비 중이에요.",
    "placeholder.songbook":  "방송과 연습에 쓸 노래책이 이곳에 모일 거예요.",
    "placeholder.photo":     "루미로그와 기록에 쓸 사진을 정리하는 공간이 준비 중이에요.",
    "placeholder.voice":     "보이스 메시지와 녹음 준비 공간이 열릴 예정이에요.",
    "placeholder.guide":     "멤버용 가이드와 확인 자료가 이곳에 정리될 거예요.",
    "placeholder.history":   "지나간 공연과 작업 기록이 이곳에 보관될 거예요.",
    "placeholder.more":      "새로운 멤버폰 앱이 이곳에 찾아올 거예요."
  },
  en: {},
  ja: {},
  zh: {}
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
