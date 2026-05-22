# Patch 7 Hotfix - Avatar Explosion Guard

원인:
- .avatar 안에 실제 이미지가 들어갔는데 .avatar img 크기 제한이 빠져서 원본 이미지가 리스트에서 터짐.

수정:
- 모든 avatar 계열 img에 width/height 100%, object-fit: cover 적용
- avatar overflow hidden 적용
- 채널 리스트 overflow 안전장치 추가

기능 변경 없음.
