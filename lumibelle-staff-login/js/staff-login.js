(function () {
  const root = document.documentElement;
  const ua = navigator.userAgent.toLowerCase();

  if (/iphone/.test(ua)) root.classList.add('device-iphone');
  if (/android/.test(ua)) root.classList.add('device-android');
  if (/samsung|sm-|galaxy/.test(ua)) root.classList.add('device-galaxy');

  const form = document.getElementById('regularLoginForm');
  const pinInput = document.getElementById('pinValue');
  const dots = Array.from(document.querySelectorAll('.pin-dot'));
  const keypad = document.querySelector('.keypad');
  const passwordToggle = document.getElementById('passwordToggle');
  const passwordPanel = document.getElementById('passwordLoginPanel');
  const pinLoginSection = document.getElementById('pinLoginSection');
  const loginModeDivider = document.getElementById('loginModeDivider');
  const staffCodeInput = document.getElementById('staffCode');
  const staffPasswordInput = document.getElementById('staffPassword');
  const loginMessage = document.getElementById('loginMessage');
  const toggleText = passwordToggle?.querySelector('.password-toggle-text');
  const toggleArrow = passwordToggle?.querySelector('.password-toggle-arrow');

  let loginMode = 'pin';

  function renderPinDots() {
    const count = pinInput?.value.length || 0;
    dots.forEach((dot, index) => dot.classList.toggle('is-filled', index < count));
  }

  function setLoginMode(nextMode) {
    loginMode = nextMode;
    const isPasswordMode = nextMode === 'password';

    form?.setAttribute('data-login-mode', nextMode);
    if (pinLoginSection) pinLoginSection.hidden = isPasswordMode;
    if (loginModeDivider) loginModeDivider.hidden = isPasswordMode;
    if (passwordPanel) passwordPanel.hidden = !isPasswordMode;
    if (passwordToggle) passwordToggle.setAttribute('aria-expanded', String(isPasswordMode));
    if (toggleText) toggleText.textContent = isPasswordMode ? 'PIN 빠른 로그인으로 돌아가기' : '비밀번호로 로그인';
    if (toggleArrow) toggleArrow.textContent = isPasswordMode ? '‹' : '›';
    if (loginMessage) loginMessage.textContent = '';

    if (isPasswordMode) {
      if (pinInput) pinInput.value = '';
      renderPinDots();
      setTimeout(() => staffPasswordInput?.focus(), 0);
    }
  }

  function addPinDigit(digit) {
    if (!pinInput || loginMode !== 'pin' || pinInput.value.length >= 4) return;
    pinInput.value += digit;
    renderPinDots();
  }

  function removePinDigit() {
    if (!pinInput || loginMode !== 'pin') return;
    pinInput.value = pinInput.value.slice(0, -1);
    renderPinDots();
  }

  keypad?.addEventListener('click', (event) => {
    const key = event.target.closest('.keypad-key');
    if (!key) return;

    const digit = key.getAttribute('data-key');
    const action = key.getAttribute('data-action');

    if (digit) {
      addPinDigit(digit);
    } else if (action === 'delete') {
      removePinDigit();
    } else if (action === 'love' && loginMessage) {
      loginMessage.textContent = '하트 키는 장식용 자리입니다.';
      setTimeout(() => {
        if (loginMessage.textContent === '하트 키는 장식용 자리입니다.') loginMessage.textContent = '';
      }, 1800);
    }
  });

  passwordToggle?.addEventListener('click', () => {
    setLoginMode(loginMode === 'pin' ? 'password' : 'pin');
  });

  form?.addEventListener('submit', (event) => {
    event.preventDefault();

    const staffCode = staffCodeInput?.value.trim() || '';
    const pin = pinInput?.value.trim() || '';
    const password = staffPasswordInput?.value.trim() || '';

    if (!staffCode) {
      if (loginMessage) loginMessage.textContent = '스탭 코드를 입력해 주세요.';
      staffCodeInput?.focus();
      return;
    }

    if (loginMode === 'password') {
      if (!password) {
        if (loginMessage) loginMessage.textContent = '비밀번호를 입력해 주세요.';
        staffPasswordInput?.focus();
        return;
      }
      if (loginMessage) loginMessage.textContent = '비밀번호 로그인 준비 완료 (연동 전)';
      return;
    }

    if (pin.length !== 4) {
      if (loginMessage) loginMessage.textContent = 'PIN 4자리를 입력해 주세요.';
      return;
    }

    if (loginMessage) loginMessage.textContent = '정규 스탭 로그인 준비 완료 (연동 전)';
  });

  setLoginMode('pin');
  renderPinDots();
})();
