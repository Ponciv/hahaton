// Смена темы
document.addEventListener('DOMContentLoaded', () => {
  const THEME_KEY = 'collably_theme';
  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  };
  // Сохранённая тема или системная
  const savedTheme = localStorage.getItem(THEME_KEY);
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  applyTheme(savedTheme || (prefersLight ? 'light' : 'dark'));

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

  
document.addEventListener('DOMContentLoaded', () => {
  // 1. Сворачивание сайдбара
  const sidebar = document.getElementById('sidebar');
  const main = document.getElementById('main');
  const toggleBtn = document.getElementById('sidebarToggle');

  if (toggleBtn && sidebar && main) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      main.classList.toggle('expanded');
    });
  }

  // 2. Дропдаун (поддерживает несколько дропдаунов)
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

  // 3. Синхронизация аватара в топбаре из localStorage
  const STORAGE_KEY = 'collably_profile';
  const topAvatar = document.getElementById('topAvatar');
  if (topAvatar) {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (data && data.avatar) topAvatar.src = data.avatar;
    } catch (e) {}
  }

  // 4. Выход (и в сайдбаре, и в дропдауне)
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

  // 5. Синхронизация между вкладками
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY && topAvatar) {
      try {
        const data = JSON.parse(e.newValue);
        if (data && data.avatar) topAvatar.src = data.avatar;
      } catch (err) {}
    }
  });
});
  });
