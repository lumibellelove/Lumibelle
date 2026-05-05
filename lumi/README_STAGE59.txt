Stage 59: Data link preparation

목적:
- 화면 디자인/기능을 크게 바꾸지 않고, 나중에 실제 데이터 연동을 붙일 수 있는 준비 구조를 추가합니다.
- 지금 루미폰 화면은 기존처럼 그대로 보입니다.

추가된 파일:
- data/lumi-sample-data.json
- js/data-adapter.js

확인 기준:
- /lumi/ 화면이 기존처럼 정상 표시됩니다.
- 전체 탭 이동이 깨지지 않습니다.
- 콘솔에서 window.LumiData가 보이면 준비 구조가 붙은 상태입니다.

주의:
- 아직 Google Sheets/API 실제 연동은 아닙니다.
- 실제 저장/조회는 다음 단계에서 모듈별로 연결합니다.
