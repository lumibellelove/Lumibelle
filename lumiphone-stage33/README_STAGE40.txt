Stage 40 - iPhone achievement modal scroll/background stability

Base: Stage 39 v2

Changed files:
- css/achievement.css
- js/achievement.js

Purpose:
- Reduce white seam/visual gap that appears on iPhone Safari while achievement modal is open and the background page is moved.
- Lock body scroll while the achievement detail modal is open.
- Stabilize overlay height using 100dvh with fallback.

Check first on iPhone:
- Open achievement modal.
- Scroll/drag lightly while modal is open.
- The white seam should not appear.
- X, backdrop, ESC, and 확인했어요 should close the modal.
- Returning to the page should preserve scroll position.
