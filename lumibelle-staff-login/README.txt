루미벨 스탭 OS 로그인 화면 1차 골격

구성:
- index.html
- css/staff-login.css
- css/staff-login.iphone.css
- css/staff-login.galaxy.css
- js/staff-login.js
- assets/login/ 이미지 자리

이미지 교체는 CSS 변수 방식 추천:
.staff-login-page { --login-bg-image: url('../assets/login/login-bg.png'); }
.logo-slot { --login-logo-image: url('../assets/login/login-logo.png'); }
.crown-slot { --login-crown-image: url('../assets/login/login-crown.png'); }
.panel-corner { --login-panel-corner-image: url('../assets/login/login-corner.png'); }
.event-illust-slot { --login-event-image: url('../assets/login/event-illust.png'); }

주의:
- !important 사용 없음
- 공통 CSS + iPhone/Galaxy 보정 CSS 분리
- 실제 로그인/API 연결 없음
