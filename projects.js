// Логика проектов: локальное сохранение, редактирование и архив.
(() => {
  'use strict';
  const PROJECTS_KEY = 'collably_projects';
  const ICONS = {
    laptop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20V9M12 20V4M20 20v-9"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg>',
    box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8l-9-5-9 5v8l9 5 9-5Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z"/></svg>'
  };
  const safeRead = () => { try { const v = JSON.parse(localStorage.getItem(PROJECTS_KEY) || '[]'); return Array.isArray(v) ? v : []; } catch { return []; } };
  const safeWrite = items => { try { localStorage.setItem(PROJECTS_KEY, JSON.stringify(items)); return true; } catch { return false; } };
  const profileAvatar = () => { try { return JSON.parse(localStorage.getItem('collably_profile') || '{}').avatar || ''; } catch { return ''; } };
  const closeModal = modal => modal?.classList.remove('active');

  function makeProject(data) {
    const card = document.createElement('article');
    card.className = 'card project-card';
    card.dataset.status = data.status || 'active';
    card.dataset.owner = 'self';
    card.dataset.projectId = data.id;
    const top = document.createElement('div'); top.className = 'project-card-top';
    const iconBox = document.createElement('div'); iconBox.className = 'project-icon cream'; iconBox.innerHTML = ICONS[data.icon] || ICONS.laptop;
    const info = document.createElement('div'); info.className = 'project-info'; info.style.flexGrow = '1';
    const headingRow = document.createElement('div'); headingRow.className = 'project-heading-row';
    const heading = document.createElement('h3'); heading.textContent = data.title;
    const count = document.createElement('span'); count.className = 'applications-badge'; count.title = 'Подано заявок'; count.textContent = String(data.responses || 0); heading.append(count);
    const actions = document.createElement('div'); actions.className = 'project-actions';
    const status = document.createElement('span'); status.className = `status ${data.status === 'archive' ? 'archive' : 'active'} status-badge`;
    const dot = document.createElement('span'); dot.className = 'status-dot'; status.append(dot, document.createTextNode(data.status === 'archive' ? ' Архив' : ' Активен'));
    const edit = document.createElement('button'); edit.type = 'button'; edit.className = 'btn-project-edit'; edit.textContent = 'Изменить';
    const archive = document.createElement('button'); archive.type = 'button'; archive.className = 'btn-archive-toggle'; archive.textContent = data.status === 'archive' ? 'Восстановить' : 'В архив';
    actions.append(status, edit, archive); headingRow.append(heading, actions);
    const desc = document.createElement('p'); desc.textContent = data.description; desc.style.marginTop = '6px'; info.append(headingRow, desc); top.append(iconBox, info);
    const footer = document.createElement('div'); footer.className = 'project-card-footer';
    const avatars = document.createElement('div'); avatars.className = 'avatars';
    const avatarSrc = profileAvatar();
    if (avatarSrc) { const img = document.createElement('img'); img.src = avatarSrc; img.alt = 'Ваш аватар'; img.className = 'project-owner-avatar'; avatars.append(img); }
    const date = document.createElement('span'); date.className = 'project-date'; date.textContent = data.updatedAt ? 'Обновлён недавно' : 'Только что'; footer.append(avatars, date);
    card.append(top, footer); return card;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('projectsGrid');
    const search = document.getElementById('projectSearch');
    const modal = document.getElementById('createModal');
    const form = document.getElementById('createProjectForm');
    const error = document.getElementById('createError');
    const titleInput = document.getElementById('projectTitle');
    const descInput = document.getElementById('projectDesc');
    const openButton = document.getElementById('openCreateModal');
    const modalTitle = modal?.querySelector('.modal-header h2');
    const submitButton = form?.querySelector('[type="submit"]');
    let selectedIcon = 'laptop';
    let editingId = null;
    let projects = safeRead();

    function renderSaved() {
      grid?.querySelectorAll('.project-card[data-owner="self"]').forEach(card => card.remove());
      projects.slice().reverse().forEach(project => grid?.prepend(makeProject(project)));
      refreshProfileAvatars();
    }
    function refreshProfileAvatars() {
      const src = profileAvatar();
      grid?.querySelectorAll('.project-owner-avatar').forEach(img => { if (src) img.src = src; else img.remove(); });
    }
    function filterProjects(value) {
      const query = value.trim().toLocaleLowerCase('ru');
      grid?.querySelectorAll('.project-card').forEach(card => card.classList.toggle('hidden', !card.textContent.toLocaleLowerCase('ru').includes(query)));
    }
    function resetForm() {
      editingId = null; form?.reset(); selectedIcon = 'laptop';
      if (modalTitle) modalTitle.textContent = 'Создать проект';
      if (submitButton) submitButton.textContent = 'Создать проект';
      document.querySelectorAll('.icon-option').forEach(item => item.classList.toggle('selected', item.dataset.icon === 'laptop'));
      error?.classList.remove('visible');
    }
    function openEditor(project) {
      editingId = project.id; titleInput.value = project.title; descInput.value = project.description; selectedIcon = project.icon || 'laptop';
      document.querySelectorAll('.icon-option').forEach(item => item.classList.toggle('selected', item.dataset.icon === selectedIcon));
      if (modalTitle) modalTitle.textContent = 'Редактировать проект';
      if (submitButton) submitButton.textContent = 'Сохранить изменения';
      modal?.classList.add('active');
    }

    if (search && grid) {
      search.addEventListener('input', () => filterProjects(search.value));
      const initialQuery = new URLSearchParams(location.search).get('q');
      if (initialQuery) { search.value = initialQuery; filterProjects(initialQuery); }
    }
    openButton?.addEventListener('click', () => { resetForm(); modal?.classList.add('active'); });
    modal?.addEventListener('click', event => { if (event.target === modal) { closeModal(modal); resetForm(); } });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && modal?.classList.contains('active')) { closeModal(modal); resetForm(); } });
    modal?.querySelector('.modal-close')?.addEventListener('click', () => { closeModal(modal); resetForm(); });
    document.querySelectorAll('.icon-option').forEach(option => option.addEventListener('click', () => {
      document.querySelectorAll('.icon-option').forEach(item => item.classList.remove('selected'));
      option.classList.add('selected'); selectedIcon = ICONS[option.dataset.icon] ? option.dataset.icon : 'laptop';
    }));

    grid?.addEventListener('click', event => {
      const card = event.target.closest('.project-card');
      if (!card || card.dataset.owner !== 'self') return;
      const project = projects.find(item => item.id === card.dataset.projectId);
      if (!project) return;
      if (event.target.closest('.btn-archive-toggle')) {
        project.status = project.status === 'archive' ? 'active' : 'archive';
        project.updatedAt = Date.now(); safeWrite(projects); renderSaved(); filterProjects(search?.value || '');
      } else if (event.target.closest('.btn-project-edit')) openEditor(project);
    });

    form?.addEventListener('submit', event => {
      event.preventDefault();
      const title = titleInput?.value.trim() || '';
      const description = descInput?.value.trim() || '';
      if (!title || !description) { if (error) { error.textContent = 'Заполните название и описание.'; error.classList.add('visible'); } return; }
      if (editingId) {
        const project = projects.find(item => item.id === editingId);
        if (project) Object.assign(project, { title, description, icon: selectedIcon, updatedAt: Date.now() });
      } else {
        projects.unshift({ id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, title, description, icon: selectedIcon, status: 'active', responses: 0, createdAt: Date.now() });
      }
      if (!safeWrite(projects)) { if (error) { error.textContent = 'Не удалось сохранить. Возможно, хранилище браузера заполнено.'; error.classList.add('visible'); } return; }
      renderSaved(); filterProjects(search?.value || ''); closeModal(modal); resetForm();
    });

    renderSaved();
    window.addEventListener('storage', event => { if (event.key === 'collably_profile') refreshProfileAvatars(); if (event.key === PROJECTS_KEY) { projects = safeRead(); renderSaved(); } });
  });
})();
