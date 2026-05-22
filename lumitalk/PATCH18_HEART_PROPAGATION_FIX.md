# Patch 18 — joinScreen 하트 버그 근본 수정

## 진짜 원인
joinScreen에서 하트/백 버튼 클릭 시 이벤트가 join-hero 전체로 버블링되어
다른 이벤트가 발동되는 문제.

## 수정 항목
✅ joinHeartBtn, joinBackBtn, joinAvatar 전부 e.stopPropagation() 추가
✅ .profile-top z-index:10으로 강화 (::after 레이어 위)
✅ CSS preview/channel-name 중복 블록 통합 정리
✅ 아바타 img 핑크 배경 통합 수정
