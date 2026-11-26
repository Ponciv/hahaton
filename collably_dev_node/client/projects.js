// projects.js
(function () {
  'use strict';

  function closeModal(id) {
    document.getElementById(id).classList.remove('active');
  }
  window.closeModal = closeModal;

  window.toggleArchive = function (btn) {
    const card = btn.closest('.project-card');
    const statusBadge = card.querySelector('.status-badge');
    const isArchive = card.getAttribute('data-status') === 'archive';
    if (isArchive) {
      card.setAttribute('data-status', 'active');
      statusBadge.className = 'status active status-badge';
      statusBadge.innerHTML = '<span class="status-dot"></span> Активен';
      btn.textContent = 'В архив';
    } else {
      card.setAttribute('data-status', 'archive');
      statusBadge.className = 'status archive status-badge';
      statusBadge.innerHTML = '<span class="status-dot"></span> Архив';
      btn.textContent = 'Восстановить';
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    // Поиск
    const searchInput = document.getElementById('projectSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase().trim();
        document.querySelectorAll('#projectsGrid .project-card').forEach(card => {
          card.classList.toggle('hidden', !card.textContent.toLowerCase().includes(q));
        });
      });
    }

    // Модалка создания
    const modal = document.getElementById('createModal');
    document.getElementById('openCreateModal').addEventListener('click', () => modal.classList.add('active'));
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal('createModal'); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal('createModal');
    });

    // Выбор иконки
    let selectedIcon = 'laptop';
    document.querySelectorAll('.icon-option').forEach(opt => {
      opt.addEventListener('click', () => {
        document.querySelectorAll('.icon-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        selectedIcon = opt.dataset.icon;
      });
    });

    // Создание проекта
    const createErr = document.getElementById('createError');
    document.getElementById('createProjectForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('projectTitle').value.trim();
      const desc = document.getElementById('projectDesc').value.trim();

      if (!title || !desc) {
        createErr.classList.add('visible');
        return;
      }
      createErr.classList.remove('visible');

      const icons = {
        laptop: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
        chart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>`,
        phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`,
        box: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
        star: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"/></svg>`
      };

      const cardHTML = `
        <div class="card project-card" data-status="active">
          <div class="project-card-top">
            <div class="project-icon cream">${icons[selectedIcon]}</div>
            <div class="project-info" style="flex-grow: 1;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%;">
                <h3>${title.replace(/</g, '&lt;')} <span class="applications-badge" title="Подано заявок">0</span></h3>
                <div style="display: flex; gap: 8px;">
                  <span class="status active status-badge"><span class="status-dot"></span> Активен</span>
                  <button class="btn-archive-toggle" onclick="toggleArchive(this)">В архив</button>
                </div>
              </div>
              <p style="margin-top: 6px;">${desc.replace(/</g, '&lt;')}</p>
            </div>
          </div>
          <div class="project-card-footer">
            <div class="avatars"><img src="https://i.pravatar.cc/150?img=5"></div>
            <span class="project-date">Только что</span>
          </div>
        </div>
      `;

      document.getElementById('projectsGrid').insertAdjacentHTML('afterbegin', cardHTML);
      closeModal('createModal');
      e.target.reset();
      document.querySelectorAll('.icon-option').forEach(o => o.classList.remove('selected'));
      document.querySelector('.icon-option[data-icon="laptop"]').classList.add('selected');
      selectedIcon = 'laptop';
    });
  });
})();
