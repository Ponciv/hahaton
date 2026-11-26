interface ApplyResponse {
  success: boolean;
  message: string;
}

document.addEventListener('DOMContentLoaded', () => {
  // 1. Handle "Apply" buttons via event delegation
  document.addEventListener('click', async (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    const btn = target?.closest('.apply-btn') as HTMLButtonElement | null;
    if (!btn || btn.disabled) return;

    const projectId = Number(btn.dataset.projectId);
    if (!projectId) {
      console.error('Missing data-project-id on button');
      return;
    }

    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Отправка...';

    try {
      const response = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });

      const data: ApplyResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Server error');
      }

      btn.textContent = 'Отклик отправлен ✓';
      btn.style.opacity = '0.7';
    } catch (err) {
      console.error('Apply failed:', err);
      btn.disabled = false;
      btn.textContent = originalText;
      alert('Не удалось отправить отклик. Проверьте, запущен ли сервер.');
    }
  });

  // 2. Open "My Project"
  const openProjectBtn = document.getElementById('openMyProject');
  openProjectBtn?.addEventListener('click', () => {
    window.location.href = 'projects.html';
  });

  // 3. Search on Enter
  const homeSearch = document.getElementById('homeSearch') as HTMLInputElement | null;
  homeSearch?.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const query = homeSearch.value.trim();
      window.location.href = query
        ? `projects.html?search=${encodeURIComponent(query)}`
        : 'projects.html';
    }
  });
});
