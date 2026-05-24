/**
 * _template.js — 새 앱 추가용 복붙 템플릿
 *
 * ─── 사용법 ───────────────────────────────────────────
 * 1. 이 파일을 js/apps/{appId}.js 로 복사
 * 2. 아래 "myApp" → 실제 앱 id로 교체 (APP_REGISTRY의 id와 일치)
 * 3. APP_REGISTRY에서 renderer: "empty" → "native" 로 변경
 * 4. index.html 에 <script src="js/apps/{appId}.js"> 추가
 *    (lumiphone.js 로딩 이후, </body> 직전)
 * 5. i18n.js에 필요한 문구 키 추가
 *
 * ─── 금지 사항 ───────────────────────────────────────
 * - 다른 앱(LumiApps.xxx) 직접 호출 금지
 * - window.LumiPhone 내부 함수 직접 호출 금지
 *   (openApp / goHome / goBack 만 ctx 통해 사용 가능)
 * - DOM 전역 조작 금지 (els.appBody 밖은 건드리지 않음)
 * ─────────────────────────────────────────────────────
 */

window.LumiApps = window.LumiApps || {};

/**
 * @param {object} app  — APP_REGISTRY 항목 { id, labelKey, iconText, ... }
 * @param {object} ctx  — OS가 전달하는 헬퍼
 *   ctx.t(key)            i18n 번역
 *   ctx.escHtml(str)      XSS 방지 이스케이프
 *   ctx.openApp(appId)    다른 앱 열기 (OS 경유)
 * @returns {string} HTML 문자열
 */
window.LumiApps.myApp = function (app, ctx) {
  return (
    '<div class="app-scroll-body">' +
      /* 여기에 앱 UI HTML 작성 */
      '<section class="app-section card">' +
        '<h2>' + ctx.t(app.labelKey) + '</h2>' +
        '<p>앱 내용을 여기에 작성하세요.</p>' +
      '</section>' +
    '</div>'
  );
};
