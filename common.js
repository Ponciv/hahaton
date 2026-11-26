document.addEventListener('DOMContentLoaded', () => {
  // 1. Сворачивание
  const sidebar = document.getElementById('sidebar');
  const main = document.getElementById('main');
  const toggleBtn = document.getElementById('sidebarToggle');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      main.classList.toggle('expanded');
    });
  }

  // 2. Дропдаун 
  const dropdown = document.querySelector('[data-dropdown]');
  const toggle = document.querySelector('[data-dropdown-toggle]');
  
  if (dropdown && toggle) {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation(); 
      dropdown.classList.toggle('is-open');
    });

    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('is-open');
      }
    });
  }
});