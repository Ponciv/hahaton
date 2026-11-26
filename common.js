// common.js — общая логика для всех страниц
(function () {
  'use strict';

  // ============================================================
  // 1. ТЕМА — выполняется сразу, не ждём DOMContentLoaded
  // ============================================================
  const THEME_KEY = 'collably_theme';

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    const theme = saved || (prefersLight ? 'light' : 'dark');
    document.documentElement.setAttribute('data-theme', theme);

    // Кнопки-переключатели
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        applyTheme(current === 'light' ? 'dark' : 'light');
      });
    });

    // Синхронизация между вкладками
    window.addEventListener('storage', (e) => {
      if (e.key === THEME_KEY && e.newValue) {
        document.documentElement.setAttribute('data-theme', e.newValue);
      }
    });
  }

  // Применяем тему как можно раньше — если DOM ещё грузится, ждём его
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
  } else {
    initTheme();
  }

  // ============================================================
  // 2. ОСТАЛЬНАЯ ЛОГИКА — после DOMContentLoaded
  // ============================================================
  document.addEventListener('DOMContentLoaded', () => {
    // 2.1. Сворачивание сайдбара
    const sidebar = document.getElementById('sidebar');
    const main = document.getElementById('main');
    const toggleBtn = document.getElementById('sidebarToggle');
    if (toggleBtn && sidebar && main) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        main.classList.toggle('expanded');
      });
    }

    // 2.2. Дропдаун (поддерживает несколько)
    document.querySelectorAll('[data-dropdown]').forEach(dropdown => {
      const toggle = dropdown.querySelector('[data-dropdown-toggle]');
      if (!toggle) return;

      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('[data-dropdown].is-open').forEach(d => {
          if (d !== dropdown) d.classList.remove('is-open');
        });
        dropdown.classList.toggle('is-open');
      });

      toggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle.click();
        }
      });
    });

    document.addEventListener('click', (e) => {
      document.querySelectorAll('[data-dropdown].is-open').forEach(dropdown => {
        if (!dropdown.contains(e.target)) dropdown.classList.remove('is-open');
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('[data-dropdown].is-open').forEach(d => d.classList.remove('is-open'));
      }
    });

    // 2.3. Синхронизация аватара в топбаре
    const STORAGE_KEY = 'collably_profile';
    const topAvatar = document.getElementById('topAvatar');

    function syncTopAvatar() {
      if (!topAvatar) return;
      try {
        const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (data && data.avatar) topAvatar.src = data.avatar;
      } catch (e) {}
    }
    syncTopAvatar();

    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY) syncTopAvatar();
    });

    // 2.4. Выход
    ['logoutLink', 'dropdownLogout'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('click', (e) => {
          e.preventDefault();
          localStorage.removeItem('collably_user');
          location.href = 'register.html';
        });
      }
    });
  });
})();
