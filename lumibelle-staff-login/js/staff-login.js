(function () {
  const root = document.documentElement;
  const ua = navigator.userAgent.toLowerCase();

  if (ua.includes('iphone')) {
    root.classList.add('device-iphone');
  }

  if (ua.includes('android')) {
    root.classList.add('device-android');
  }

  if (ua.includes('samsung') || ua.includes('sm-') || ua.includes('galaxy')) {
    root.classList.add('device-galaxy');
  }

  const timeEl = document.getElementById('statusTime');
  const form = document.getElementById('staffLoginForm');
  const message = document.getElementById('loginMessage');

  function updateTime() {
    if (!timeEl) return;
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    timeEl.textContent = `${hours}:${minutes}`;
  }

  updateTime();
  window.setInterval(updateTime, 30000);

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();

      const staffId = form.staffId.value.trim();
      const password = form.staffPassword.value.trim();

      if (!staffId || !password) {
        message.textContent = '스탭 ID와 비밀번호를 입력해 주세요.';
        return;
      }

      message.textContent = '로그인 연결 전 임시 화면입니다. 다음 화면 연결 예정.';
    });
  }
}());
