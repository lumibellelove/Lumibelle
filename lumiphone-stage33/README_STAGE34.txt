Stage 34 - ON AIR 입력칸 안정화 패치

기준: Stage 33 responsive check
수정 범위:
- index.html: 루미코드 input의 placeholder 제거, iPhone 입력 보정 속성 추가
- css/onair.css: input focus/appearance/placeholder 안정화
- js/onair.js: 포커스/블러 시 placeholder가 다시 나타나지 않도록 방어

목표:
- iPhone에서 루미코드 입력칸 포커스 시 예시 코드가 잔상처럼 깜빡이는 현상 완화
- 다른 탭/기능/디자인 대형 변경 없음

확인:
1. ON AIR 탭 열기
2. 루미코드 입력칸 터치
3. 예시 코드 잔상이 반복적으로 보이지 않는지 확인
4. LUMI-4827 입력 후 인증 정상 확인
