(function () {
  const root = document.documentElement;
  const ua = navigator.userAgent.toLowerCase();

  if (/iphone/.test(ua)) {
    root.classList.add('device-iphone');
  }

  if (/android/.test(ua)) {
    root.classList.add('device-android');
  }

  if (/samsung|sm-|galaxy/.test(ua)) {
    root.classList.add('device-galaxy');
  }

  const pinInput = document.getElementById('pinValue');
  const dots = Array.from(document.querySelectorAll('.pin-dot'));
  const keypad = document.querySelector('.keypad');
  const passwordToggle = document.getElementById('passwordToggle');
  const passwordPanel = document.getElementById('passwordLoginPanel');
  const loginForm = document.getElementById('regularLoginForm');
  const loginMessage = document.getElementById('loginMessage');
  const staffCodeInput = document.getElementById('staffCode');
  const staffPasswordInput = document.getElementById('staffPassword');

  function renderPinDots() {
    const count = pinInput.value.length;
    dots.forEach((dot, index) => {
      dot.classList.toggle('is-filled', index < count);
    });
  }

  function addPinDigit(digit) {
    if (pinInput.value.length >= 4) return;
    pinInput.value += digit;
    renderPinDots();
  }

  function removePinDigit() {
    pinInput.value = pinInput.value.slice(0, -1);
    renderPinDots();
  }

  keypad?.addEventListener('click', function (event) {
    const key = event.target.closest('.keypad-key');
    if (!key) return;

    const digit = key.getAttribute('data-key');
    const action = key.getAttribute('data-action');

    if (digit) {
      addPinDigit(digit);
      return;
    }

    if (action === 'delete') {
      removePinDigit();
      return;
    }

    if (action === 'love') {
      loginMessage.textContent = '하트 키는 장식용 자리입니다.';
      setTimeout(() => {
        if (loginMessage.textContent === '하트 키는 장식용 자리입니다.') {
          loginMessage.textContent = '';
        }
      }, 1800);
    }
  });

  passwordToggle?.addEventListener('click', function () {
    const isExpanded = passwordToggle.getAttribute('aria-expanded') === 'true';
    passwordToggle.setAttribute('aria-expanded', String(!isExpanded));
    passwordPanel.hidden = isExpanded;
    passwordToggle.querySelector('.password-toggle-arrow').textContent = isExpanded ? '›' : '⌃';
  });

  loginForm?.addEventListener('submit', function (event) {
    event.preventDefault();
    const staffCode = staffCodeInput.value.trim();
    const pin = pinInput.value.trim();
    const passwordOpen = passwordToggle.getAttribute('aria-expanded') === 'true';
    const password = staffPasswordInput ? staffPasswordInput.value.trim() : '';

    if (!staffCode) {
      loginMessage.textContent = '스탭 코드를 입력해 주세요.';
      staffCodeInput.focus();
      return;
    }

    if (passwordOpen) {
      if (!password) {
        loginMessage.textContent = '비밀번호를 입력해 주세요.';
        staffPasswordInput.focus();
        return;
      }
      loginMessage.textContent = '비밀번호 로그인 준비 완료 (연동 전)';
      return;
    }

    if (pin.length !== 4) {
      loginMessage.textContent = 'PIN 4자리를 입력해 주세요.';
      return;
    }

    loginMessage.textContent = '정규 스탭 로그인 준비 완료 (연동 전)';
  });

  renderPinDots();
})();
