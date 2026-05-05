Stage 81 - Hash fallback 안정화

기준: lumiphone_modular_stage80_nav_active_sync.zip

수정 범위:
- js/app.js만 수정
- Stage 75 홈 상태바 기준 유지
- Stage 76 미사용 유지
- CSS, 각 탭 파일, 로컬 저장 데이터는 수정하지 않음

수정 내용:
- 존재하지 않는 해시(#abc, #page-abc 등)로 들어왔을 때 빈 화면/꼬임 방지
- 잘못된 해시는 home으로 안전하게 정리
- 정상 탭 이동과 active 상태 동기화는 Stage 80 기준 유지

확인:
- 일반 탭 이동 정상
- 홈 상태바 LUMIBELLE ✦ 100% 유지
- 다른 탭은 LUMI PHONE / LB-0001 유지
