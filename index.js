// Главная: рекомендации, сохранение откликов и плавное перелистывание.
document.addEventListener('DOMContentLoaded', () => {
  const RESPONSE_KEY = 'collably_responses';
  const recommendations = [
    { id: 'frontend-react', title: 'Frontend-разработчик', meta: 'Удалённо • React', description: 'Помоги развивать интерфейс продукта и улучшать пользовательский опыт.' },
    { id: 'ux-design', title: 'UX/UI-дизайнер', meta: 'Удалённо • Figma', description: 'Продумай удобные сценарии и создай визуальную систему проекта.' },
    { id: 'content-manager', title: 'Контент-менеджер', meta: 'Гибкий график • Контент', description: 'Помоги команде с публикациями, текстами и развитием сообщества.' }
  ];
  const readResponses = () => { try { const data = JSON.parse(localStorage.getItem(RESPONSE_KEY) || '[]'); return Array.isArray(data) ? data : []; } catch { return []; } };
  const saveResponses = data => { try { localStorage.setItem(RESPONSE_KEY, JSON.stringify(data)); return true; } catch { return false; } };
  const card = document.getElementById('recommendationCard');
  const title = document.getElementById('recommendationTitle');
  const meta = document.getElementById('recommendationMeta');
  const description = document.getElementById('recommendationDescription');
  const button = document.getElementById('applyRecommendation');
  const counter = document.getElementById('recommendationCounter');
  const message = document.getElementById('recommendationEnd');
  let responded = readResponses();
  let index = 0;
  const remaining = () => recommendations.map((item, i) => ({ item, i })).filter(({ item }) => !responded.includes(item.id));
  function showNext() {
    const available = remaining();
    if (!available.length) {
      if (card) card.classList.add('recommendation-finished');
      if (title) title.textContent = 'Рекомендации закончились';
      if (meta) meta.textContent = 'Пока больше нет доступных проектов';
      if (description) description.textContent = 'Новые предложения появятся здесь позже.';
      if (button) button.hidden = true;
      if (counter) counter.textContent = `${recommendations.length} / ${recommendations.length}`;
      if (message) message.hidden = false;
      return;
    }
    const current = available[0]; index = current.i;
    if (title) title.textContent = current.item.title;
    if (meta) meta.textContent = current.item.meta;
    if (description) description.textContent = current.item.description;
    if (button) { button.hidden = false; button.disabled = false; button.textContent = 'Откликнуться'; button.dataset.projectId = current.item.id; }
    if (counter) counter.textContent = `${recommendations.length - available.length + 1} / ${recommendations.length}`;
    if (message) message.hidden = true;
    card?.classList.remove('recommendation-finished');
  }
  button?.addEventListener('click', () => {
    const id = button.dataset.projectId;
    if (!id || responded.includes(id)) return;
    const next = [...responded, id];
    if (!saveResponses(next)) { button.textContent = 'Не удалось сохранить'; return; }
    responded = next;
    button.disabled = true;
    button.textContent = 'Отклик отправлен ✓';
    card?.classList.add('recommendation-slide-out');
    window.setTimeout(() => { card?.classList.remove('recommendation-slide-out'); showNext(); }, 320);
  });
  showNext();

  document.getElementById('openMyProject')?.addEventListener('click', () => { location.href = 'projects.html'; });
  const search = document.getElementById('homeSearch');
  search?.addEventListener('keydown', event => { if (event.key === 'Enter') { const query = search.value.trim(); location.href = `projects.html${query ? `?q=${encodeURIComponent(query)}` : ''}`; } });
});
