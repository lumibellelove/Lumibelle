/**
 * NEWS 관리자 자동번역용 Apps Script 추가 패치
 *
 * 연결 방법:
 * 1) 이 파일 내용을 Apps Script 프로젝트(Code.gs 또는 별도 gs 파일)에 추가합니다.
 * 2) 기존 doGet/doPost 라우터에서 action === 'translateNewsContent'일 때
 *    handleTranslateNewsContent_(payload)를 호출하도록 연결합니다.
 *
 * 예시:
 *   if (action === 'translateNewsContent') {
 *     return jsonp_(handleTranslateNewsContent_(payload), callback);
 *   }
 *
 * 기존 에디터/사진/Drive/NEWS 저장 함수와 무관한 독립 함수입니다.
 */

function handleTranslateNewsContent_(payload) {
  payload = payload || {};

  var sourceLang = String(payload.sourceLang || 'ko');
  var title = String(payload.title || '');
  var bodyText = String(payload.bodyText || '');
  var targetLangs = payload.targetLangs || ['ja', 'en', 'zh'];

  var langMap = {
    ja: 'ja',
    en: 'en',
    zh: 'zh-CN'
  };

  var translations = {};
  targetLangs.forEach(function(lang) {
    var target = langMap[lang];
    if (!target) return;

    translations[lang] = {
      title: title ? LanguageApp.translate(title, sourceLang, target) : '',
      body: bodyText ? LanguageApp.translate(bodyText, sourceLang, target) : '',
      status: 'translated'
    };
  });

  return {
    ok: true,
    translations: translations
  };
}
