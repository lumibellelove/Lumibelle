/**
 * placeholder-apps.js — 준비 중 앱 화면 렌더러
 *
 * 역할: renderer === "placeholder" 인 앱의 안내 화면을 그림
 * 규칙:
 *   - 문구는 직접 쓰지 않고 ctx.t() (i18n) 경유
 *   - OS(lumiphone.js)에 직접 접근 금지
 *   - 앱이 "native"로 전환되면 이 파일에서 해당 케이스 삭제
 */

window.LumiApps = window.LumiApps || {};

window.LumiApps.placeholder = function (app, ctx) {
  /* 앱별 안내 문구 키: i18n.js의 "placeholder.{id}" */
  var msgKey = "placeholder." + app.id;
  return (
    '<section class="placeholder-app-card">' +
      '<div class="placeholder-orb">' + ctx.escHtml(app.iconText || "✦") + '</div>' +
      '<h2>' + ctx.t(app.labelKey) + '</h2>' +
      '<p>'  + ctx.t(msgKey)       + '</p>' +
    '</section>'
  );
};
