// Локальная демонстрационная регистрация (без серверной авторизации)
(() => {
  'use strict';
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');
    const error = document.getElementById('regError');
    if (!form || !error) return;
    const email = document.getElementById('regEmail');
    const password = document.getElementById('regPassword');
    const confirm = document.getElementById('regConfirm');

    const showError = message => {
      error.textContent = message;
      error.classList.add('visible');
    };
    const clearError = () => error.classList.remove('visible');

    form.addEventListener('submit', event => {
      event.preventDefault();
      const address = email.value.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) return showError('Введите корректный email.');
      if (password.value.length < 6) return showError('Пароль должен быть не короче 6 символов.');
      if (password.value !== confirm.value) return showError('Пароли не совпадают.');

      try {
        localStorage.setItem('collably_user', JSON.stringify({ email: address }));
      } catch {
        return showError('Браузер не разрешил сохранить данные. Проверьте настройки хранилища.');
      }
      clearError();
      location.href = 'index.html';
    });
    [email, password, confirm].forEach(input => input.addEventListener('input', clearError));
  });
})();
