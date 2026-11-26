// index.js
document.addEventListener('DOMContentLoaded', () => {
  // Кнопки "Откликнуться"
  document.querySelectorAll('.apply-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.textContent = 'Отклик отправлен ✓';
      btn.disabled = true;
      btn.style.opacity = '0.7';
    });
  });

  // Открыть мой проект
  const openProjectBtn = document.getElementById('openMyProject');
  if (openProjectBtn) {
    openProjectBtn.addEventListener('click', () => {
      location.href = 'projects.html';
    });
  }

  // Поиск: Enter → переход на projects.html
  const homeSearch = document.getElementById('homeSearch');
  if (homeSearch) {
    homeSearch.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') location.href = 'projects.html';
    });
  }
});