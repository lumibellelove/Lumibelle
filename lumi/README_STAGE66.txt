Stage 66 - 스탬프/체크인 로컬 저장 1차 연결본

기준: Stage 65 포인트 기록/잔액 정리본

수정 범위:
- index.html: 스탬프/홈/프로필 일부 표시 id 추가, 스탬프 버튼 문구 정리
- js/stamp.js: 루미 체크인/스탬프 localStorage 저장 및 화면 동기화
- js/data-adapter.js: stamps 데이터 구조 추가
- data/lumi-sample-data.json: stamps 기본 데이터 추가
- css/stamp.css: 스탬프 메시지/버튼 터치 보강

확인:
- 스탬프 탭에서 루미 체크인 +1 클릭
- 홈 체크인/스탬프 숫자 반영
- 프로필 스탬프/체크인 칩 반영
- 새로고침 후 유지

주의:
- 실제 서버/API 저장 전, 기기 localStorage 안에만 저장되는 1차 연결 구조.
