Stage 76 - Home narrow mobile statusbar micro polish

기준: Stage 75 home statusbar hard-lock 통과본

수정 범위:
- css/home.css only

변경 내용:
- Stage 75의 홈 상태바 고정 JS는 건드리지 않음.
- 플립/좁은 모바일에서 LUMIBELLE ✦ 100% 문구가 노치에 너무 붙어 보이는 느낌만 CSS로 완화.
- 홈에서만 적용, 다른 탭의 공통 status/nav 구조는 유지.
- 로컬 저장 기능, 데이터 구조, 탭 기능은 건드리지 않음.

확인 순서:
1. 플립 모바일 홈에서 오른쪽 문구가 노치에 너무 붙지 않는지 확인
2. 아이폰 홈에서 상태바가 깨지지 않는지 확인
3. PC 홈에서 기존처럼 보이는지 확인
4. 다른 탭에서는 LUMI PHONE / LB-0001 공통 상태가 유지되는지 확인
