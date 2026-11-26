// register.js
(function () {
  'use strict';

  const form = document.getElementById('registerForm');
  const err = document.getElementById('regError');
  const emailInput = document.getElementById('regEmail');
  const passInput = document.getElementById('regPassword');
  const confirmInput = document.getElementById('regConfirm');

  const showError = (msg) => {
    err.textContent = msg;
    err.classList.add('visible');
  };
  const hideError = () => err.classList.remove('visible');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const pass = passInput.value;
    const confirm = confirmInput.value;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return showError('Введите корректный email.');
    }
    if (pass.length < 6) {
      return showError('Пароль должен быть не короче 6 символов.');
    }
    if (pass !== confirm) {
      return showError('Пароли не совпадают.');
    }

    hideError();
    localStorage.setItem('collably_user', JSON.stringify({ email }));
    window.location.href = 'index.html';
  });

  [emailInput, passInput, confirmInput].forEach(el => {
    el.addEventListener('input', hideError);
  });
})();