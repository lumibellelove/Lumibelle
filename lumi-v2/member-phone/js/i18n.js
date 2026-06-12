/**
 * i18n.js — 루미폰 v2 다국어 문구
 * 규칙: 문구만. 로직 없음. LumiI18n 모듈만 포함.
 * 새 문구 추가 시 ko에 먼저 넣고, en/ja/zh는 추후 번역.
 */

window.LUMI_I18N = {
  ko: {
    /* 앱 이름 */
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

    "app.lumicheki":     "루미체키",
    "app.songbook":      "노래책",
    "app.photo":         "포토",
    "app.voice":         "보이스",
    "app.messages":      "문자",
    "app.guide":         "가이드",
    "app.settings":      "설정",
    "app.more":          "추가 예정",

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
    "home.energy.label": "NEXT SLOT",
    "home.energy.desc": "확장 앱과 예정 기능을 모아둘게요.",

    /* 최근 앱 */
    "recent.title": "최근 앱",
    "recent.empty": "아직 열린 앱이 없어요.",

    /* 빈 화면 메시지 */
    "empty.default":  "아직 연결 전이에요.",

    /* Placeholder 앱 안내 문구 */
    "placeholder.lumiroom":      "루미벨 멤버와 스탭이 함께 쓰는 루미룸을 준비 중이에요.",
    "placeholder.lumitalk":      "멤버가 루미나에게 보낼 짧은 메시지 작성 공간을 준비 중이에요.",
    "placeholder.lumiletter":    "긴 편지와 특별한 메시지를 정리하는 공간을 준비 중이에요.",
    "placeholder.schedule":      "공연, 연습, 촬영, 방송 일정을 한눈에 보는 공간을 준비 중이에요.",
    "placeholder.dday":          "공연과 준비 마감일까지 남은 시간을 정리하는 공간을 준비 중이에요.",
    "placeholder.setlist":       "오늘 셋리, 파트, 멘트, 동선을 확인하는 공간을 준비 중이에요.",
    "placeholder.homeworkCheki": "작성해야 할 숙제체키와 전달 상태를 확인하는 공간을 준비 중이에요.",
    "placeholder.prep":          "의상, 소품, 개인 준비물을 체크하는 공간을 준비 중이에요.",
    "placeholder.lumilog":       "공연 후 한마디와 기록용 코멘트를 남기는 공간을 준비 중이에요.",
    "placeholder.onair":         "방송 준비와 ON AIR 상태를 확인하는 공간을 준비 중이에요.",
    "placeholder.archive":       "말투, 해시태그, 팬응대 기준, 팀 자료를 모아둘 공간이에요.",
    "placeholder.sos":           "불편한 상황과 운영진 호출 기준을 빠르게 확인하는 공간이에요.",
    "placeholder.lumicheki":     "루미체키는 나중에 연결할 예정이에요. 지금은 자리만 남겨둘게요.",
    "placeholder.songbook":      "방송과 연습에 쓸 노래책을 준비 중이에요.",
    "placeholder.photo":         "공연 사진과 업로드 후보를 모아둘 공간을 준비 중이에요.",
    "placeholder.voice":         "보이스 메시지와 녹음 관련 기능을 준비 중이에요.",
    "placeholder.messages":      "개별 메시지와 단체 안내 문자는 팬용 문자함 완성 후 연결할 예정이에요.",
    "placeholder.guide":         "멤버용 가이드와 팬응대 매뉴얼을 정리할 공간이에요.",
    "placeholder.settings":      "계정, 언어, 알림, 테마 설정을 준비 중이에요.",
    "placeholder.more":          "새로운 멤버폰 앱이 이곳에 찾아올 거예요."
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
