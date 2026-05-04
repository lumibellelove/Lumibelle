(() => {
  "use strict";

  function setMessage(text) {
    const message = document.getElementById("profileMessage");
    if (!message) return;
    message.textContent = text;
  }

  function boot() {
    const editButton = document.getElementById("profileEditButton");
    const shareButton = document.getElementById("profileShareButton");
    const titleButton = document.getElementById("profileTitleButton");

    if (editButton) {
      editButton.addEventListener("click", () => {
        setMessage("프로필 꾸미기는 다음 단계에서 연결할 예정이에요.");
      });
    }

    if (titleButton) {
      titleButton.addEventListener("click", () => {
        setMessage("칭호 변경은 업적/칭호 모듈 이식 후 연결할 예정이에요.");
      });
    }

    if (shareButton) {
      shareButton.addEventListener("click", () => {
        setMessage("프로필 공유 이미지는 이후 공유 모듈에서 연결할 예정이에요.");
      });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
