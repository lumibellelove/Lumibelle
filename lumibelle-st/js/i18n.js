/**
 * i18n.js — 루미폰 v2 다국어 문구
 * 규칙: 문구만. 로직 없음. LumiI18n 모듈만 포함.
 * 새 문구 추가 시 ko에 먼저 넣고, en/ja/zh는 추후 번역.
 */

window.LUMI_I18N = {
  ko: {
    /* 앱 이름 */
    "app.gate":        "입장",
    "app.booth":       "물판",
    "app.cheki":       "체키",
    "app.eventTicket": "이벤트권",
    "app.point":       "포인트",
    "app.homeworkCheki":"숙제체키",
    "app.timer":       "타이머",
    "app.caution":     "주의 메모",
    "app.memo":        "메모톡",
    "app.guide":       "가이드",
    "app.attendance":  "출퇴근",
    "app.notice":      "공지",
    "app.close":       "마감",
    "app.todayLive":   "오늘 공연",
    "app.gateStatus":  "입장 현황",
    "app.staffLog":    "스탭 로그",
    "app.settings":    "설정",

    /* 네비게이션 */
    "nav.tabs":  "탭보기",
    "nav.home":  "홈",
    "nav.back":  "뒤로가기",

    /* Today View */
    "today.weather":          "STAFF WEATHER",
    "today.reservation":      "오늘 공연",
    "today.message":          "NOTICE",
    "today.onair":            "FIELD STATUS",
    "today.summary.waiting":  "입장 대기",
    "today.summary.entered":  "입장 완료",
    "today.summary.needs":    "확인 필요",
    "today.summary.memo":     "미처리 메모",

    "home.stamp.label": "STAFF CHECK",
    "home.stamp.desc": "오늘 운영 준비",
    "home.energy.label": "STAFF READY",
    "home.energy.desc": "현장 운영 준비 상태를 확인해요.",

    /* 최근 앱 */
    "recent.title": "최근 앱",
    "recent.empty": "아직 열린 앱이 없어요.",

    /* 빈 화면 메시지 */
    "empty.default": "기능 연결 전 자리만 준비된 앱이에요.",

    /* Placeholder 앱 안내 문구 */
    "placeholder.gate":        "예약번호·입금자명·닉네임·루미ID로 입장 확인을 처리할 자리예요.",
    "placeholder.booth":       "특전권 판매, 메아테 혜택 확인, 수령 처리를 담당하는 앱입니다. 기존 스탭허브의 물판 처리 흐름을 기준으로 하며, 포인트 적립·정정은 포인트 앱에서 따로 관리합니다.",
    "placeholder.cheki":       "실제 특전 사용, 루미 체크인, 스탬프 반영을 연결할 자리예요.",
    "placeholder.eventTicket": "Welcome / Join / Birthday Ticket 상태 확인과 발급을 연결할 자리예요.",
    "placeholder.point":       "물판 포인트 적립과 정정 기능을 연결할 자리예요.",
    "placeholder.homeworkCheki":"숙제체키 접수와 수령 상태를 관리할 자리예요.",
    "placeholder.timer":       "멤버별 교류 시간 타이머를 연결할 자리예요.",
    "placeholder.caution":     "팬별 주의사항과 총괄 확인 메모를 연결할 자리예요.",
    "placeholder.memo":        "개인 메모, 스탭 톡방, 멤버 전달을 연결할 자리예요.",
    "placeholder.guide":       "역할별 스탭 가이드를 연결할 자리예요.",
    "placeholder.attendance":  "스탭 출석/퇴근 체크 기능을 연결할 자리예요.",
    "placeholder.notice":      "운영 공지와 긴급 안내를 표시할 자리예요.",
    "placeholder.close":       "마감 체크와 정산 확인을 연결할 자리예요.",
    "placeholder.todayLive":   "오늘 공연 정보를 표시할 자리예요.",
    "placeholder.gateStatus":  "입장 현황 요약을 표시할 자리예요.",
    "placeholder.staffLog":    "스탭 처리 기록을 모아볼 자리예요.",
    "placeholder.settings":    "스탭폰 설정을 연결할 자리예요."
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
