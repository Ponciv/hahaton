// Общие функции интерфейса Collably
(() => {
  'use strict';

  const THEME_KEY = 'collably_theme';
  const themes = [
    ['dark-orange', 'Тёмная · Оранжевая'],
    ['light-orange', 'Светлая · Оранжевая'],
    ['dark-purple', 'Тёмная · Фиолетовая'],
    ['light-purple', 'Светлая · Фиолетовая'],
    ['dark-blue', 'Тёмная · Синяя'],
    ['light-blue', 'Светлая · Синяя'],
    ['dark-green', 'Тёмная · Зелёная'],
    ['light-green', 'Светлая · Зелёная'],
    ['dark-pink', 'Тёмная · Розовая'],
    ['light-pink', 'Светлая · Розовая']
  ];

  const safeGet = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const safeSet = (key, value) => { try { localStorage.setItem(key, value); } catch {} };

  function applyTheme(theme) {
    const valid = themes.some(([id]) => id === theme) ? theme : 'dark-orange';
    document.documentElement.dataset.theme = valid;
    safeSet(THEME_KEY, valid);
    const picker = document.getElementById('themePicker');
    if (picker) picker.value = valid;
  }

  document.addEventListener('DOMContentLoaded', () => {
    applyTheme(safeGet(THEME_KEY) || 'dark-orange');

    const topbar = document.querySelector('.topbar');
    const themeHost = topbar || document.querySelector('.auth-right');
    if (themeHost && !document.getElementById('themePicker')) {
      const wrap = document.createElement('div');
      wrap.className = 'theme-control';
      wrap.innerHTML = '<button type="button" class="icon-btn theme-trigger" aria-label="Настройки темы" aria-expanded="false" title="Тема оформления"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a9 9 0 1 0 0 18h1.2a2 2 0 0 0 1.4-3.4 1.8 1.8 0 0 1 1.3-3.1H18a3 3 0 0 0 3-3c0-4.7-4-8.5-9-8.5Z"/><circle cx="7.5" cy="10" r="1"/><circle cx="11" cy="6.8" r="1"/><circle cx="15.5" cy="8" r="1"/></svg></button><div class="theme-popover"><span class="theme-popover-title">Цвет и оформление</span><select id="themePicker" aria-label="Цветовая тема"></select></div>';
      const select = wrap.querySelector('select');
      const trigger = wrap.querySelector('.theme-trigger');
      trigger.addEventListener('click', () => {
        const opened = wrap.classList.toggle('is-open');
        trigger.setAttribute('aria-expanded', String(opened));
      });
      document.addEventListener('click', event => {
        if (!wrap.contains(event.target)) { wrap.classList.remove('is-open'); trigger.setAttribute('aria-expanded', 'false'); }
      });
      themes.forEach(([id, label]) => {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = label;
        select.append(option);
      });
      select.addEventListener('change', () => applyTheme(select.value));
      if (topbar) topbar.insertBefore(wrap, topbar.querySelector('.dropdown') || null);
      else { wrap.classList.add('auth-theme-control'); themeHost.prepend(wrap); }
      select.value = document.documentElement.dataset.theme;
    }

    const sidebar = document.getElementById('sidebar');
    const main = document.getElementById('main');
    const toggle = document.getElementById('sidebarToggle');
    if (toggle && sidebar && main) {
      toggle.addEventListener('click', () => {
        const collapsed = sidebar.classList.toggle('collapsed');
        main.classList.toggle('expanded', collapsed);
        toggle.setAttribute('aria-expanded', String(!collapsed));
      });
    }

    document.querySelectorAll('[data-dropdown]').forEach(dropdown => {
      const trigger = dropdown.querySelector('[data-dropdown-toggle]');
      if (!trigger) return;
      const toggleDropdown = event => {
        event?.stopPropagation();
        document.querySelectorAll('[data-dropdown].is-open').forEach(item => {
          if (item !== dropdown) item.classList.remove('is-open');
        });
        dropdown.classList.toggle('is-open');
        trigger.setAttribute('aria-expanded', String(dropdown.classList.contains('is-open')));
      };
      trigger.addEventListener('click', toggleDropdown);
      trigger.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          toggleDropdown(event);
        }
      });
    });

    document.addEventListener('click', event => {
      document.querySelectorAll('[data-dropdown].is-open').forEach(item => {
        if (!item.contains(event.target)) item.classList.remove('is-open');
      });
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        document.querySelectorAll('[data-dropdown].is-open').forEach(item => item.classList.remove('is-open'));
      }
    });

    const profileKey = 'collably_profile';
    const updateAvatar = value => {
      const avatar = document.getElementById('topAvatar');
      if (!avatar) return;
      try {
        const data = JSON.parse(value || 'null');
        if (data?.avatar) avatar.src = data.avatar;
      } catch {}
    };
    updateAvatar(safeGet(profileKey));
    window.addEventListener('storage', event => {
      if (event.key === profileKey) updateAvatar(event.newValue);
      if (event.key === THEME_KEY && event.newValue) applyTheme(event.newValue);
    });

    ['logoutLink', 'dropdownLogout'].forEach(id => {
      document.getElementById(id)?.addEventListener('click', event => {
        event.preventDefault();
        try { localStorage.removeItem('collably_user'); } catch {}
        location.href = 'register.html';
      });
    });
  });
})();
