# Patch 11 - CSS Clean Baseline

기준:
- 사용자가 제공한 lumitalk_clean_baseline.css를 기준 CSS로 교체
- Patch 7~10 누적 CSS 정리본 적용

수정:
- .back / .dark-btn / .icon-btn 중복 센터링 블록 통합본 사용
- .avatar overflow 충돌 정리본 사용
- 위험했던 .profile-tools .dark-btn:not(.heart-icon)::before blank 처리 제거
- 프로필홈 오른쪽 ⋯ 버튼이 다시 보이도록 안전 수정
- #roomMenuBtn pseudo 안전 처리

주의:
- 기능/HTML/JS 구조는 건드리지 않음
- NEW 글자 핑크 처리는 상태값 class가 필요해서 다음 JS 최소 패치에서 처리하는 게 안전함
