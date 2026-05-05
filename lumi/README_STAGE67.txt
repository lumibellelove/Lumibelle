# Stage 67 - Ticket local state save

기준: Stage 66 스탬프/체크인 로컬 저장본

변경 범위:
- js/ticket.js
- css/ticket.css
- js/data-adapter.js
- data/lumi-sample-data.json

내용:
- 티켓 상세 모달에서 입장 확인/특전권 사용 완료 상태를 localStorage에 저장
- 새로고침 후에도 티켓 상태 유지
- 현재 티켓 입장 확인 후 지난 티켓 쪽으로 이동
- 실제 서버/API 연동 전 기기 안에만 저장되는 1차 구조
