// profile.js
(function () {
  'use strict';

  const STORAGE_KEY = 'collably_profile';
  const DEFAULT_AVATAR = 'https://i.pravatar.cc/150?img=5';
  const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
  const MAX_TAGS = 10;
  const MAX_TAG_LEN = 20;

  function closeModal(id) {
    document.getElementById(id).classList.remove('active');
  }
  window.closeModal = closeModal;

  function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (s) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[s]));
  }

  function compressImage(file, maxSize = 400) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Ошибка чтения файла'));
      reader.onload = (ev) => {
        const img = new Image();
        img.onerror = () => reject(new Error('Не удалось загрузить изображение'));
        img.onload = () => {
          let { width, height } = img;
          if (width > maxSize || height > maxSize) {
            const ratio = Math.min(maxSize / width, maxSize / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          canvas.getContext('2d').drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Элементы
    const profileAvatar = document.getElementById('profileAvatar');
    const topAvatar = document.getElementById('topAvatar');
    const displayName = document.getElementById('displayName');
    const displayHandle = document.getElementById('displayHandle');
    const displayBio = document.getElementById('displayBio');
    const displayTags = document.getElementById('displayTags');
    const displayAbout = document.getElementById('displayAbout');
    const displayLocation = document.getElementById('displayLocation');
    const displayEmail = document.getElementById('displayEmail');
    const displayTelegram = document.getElementById('displayTelegram');
    const profileBanner = document.getElementById('profileBanner');

    const editModal = document.getElementById('editModal');
    const modalAvatar = document.getElementById('modalAvatar');
    const avatarInput = document.getElementById('avatarInput');
    const changeAvatarBtn = document.getElementById('changeAvatarBtn');
    const avatarDrop = document.getElementById('avatarDrop');
    const inputName = document.getElementById('inputName');
    const inputHandle = document.getElementById('inputHandle');
    const inputLocation = document.getElementById('inputLocation');
    const inputBio = document.getElementById('inputBio');
    const inputAbout = document.getElementById('inputAbout');
    const inputEmail = document.getElementById('inputEmail');
    const inputTelegram = document.getElementById('inputTelegram');
    const inputTags = document.getElementById('inputTags');
    const bioCount = document.getElementById('bioCount');
    const aboutCount = document.getElementById('aboutCount');
    const tagsCount = document.getElementById('tagsCount');
    const errors = {
      name: document.getElementById('nameError'),
      handle: document.getElementById('handleError'),
      email: document.getElementById('emailError'),
      tags: document.getElementById('tagsError'),
      avatar: document.getElementById('avatarError')
    };

    let lastFocusedElement = null;
    let pendingAvatar = null;

    // --- Загрузка ---
    function loadProfile() {
      let data = null;
      try { data = JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch (e) {}
      if (!data) return;

      const avatarSrc = data.avatar || DEFAULT_AVATAR;
      profileAvatar.src = avatarSrc;
      if (topAvatar) topAvatar.src = avatarSrc;
      if (data.name) displayName.textContent = data.name;
      if (data.handle) displayHandle.textContent = data.handle;
      if (data.bio) displayBio.textContent = data.bio;
      if (data.about) displayAbout.textContent = data.about;
      if (data.location) displayLocation.textContent = data.location;
      if (data.email) displayEmail.textContent = data.email;
      if (data.telegram) displayTelegram.textContent = data.telegram;
      if (Array.isArray(data.tags)) {
        displayTags.innerHTML = data.tags.length
          ? data.tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')
          : '<span class="tag" style="opacity:0.5;">Нет тегов</span>';
      }
    }

    function fillForm() {
      pendingAvatar = null;
      modalAvatar.src = profileAvatar.src;
      avatarInput.value = '';
      inputName.value = displayName.textContent;
      inputHandle.value = displayHandle.textContent;
      inputLocation.value = displayLocation.textContent.trim();
      inputBio.value = displayBio.textContent;
      inputAbout.value = displayAbout.textContent;
      inputEmail.value = displayEmail.textContent;
      inputTelegram.value = displayTelegram.textContent;
      inputTags.value = [...displayTags.querySelectorAll('.tag')].map(t => t.textContent).join(', ');
      updateCounters();
      clearErrors();
    }

    function clearErrors() {
      Object.values(errors).forEach(el => {
        el.classList.remove('visible');
        el.textContent = '';
      });
      [inputName, inputHandle, inputEmail, inputTags].forEach(el => el.classList.remove('invalid'));
    }

    function updateCounters() {
      bioCount.textContent = inputBio.value.length;
      aboutCount.textContent = inputAbout.value.length;
      tagsCount.textContent = inputTags.value.split(',').map(t => t.trim()).filter(Boolean).length;
    }

    document.getElementById('editProfileBtn').addEventListener('click', () => {
      lastFocusedElement = document.activeElement;
      fillForm();
      editModal.classList.add('active');
      setTimeout(() => inputName.focus(), 100);
    });

    function handleClose() {
      closeModal('editModal');
      if (lastFocusedElement) lastFocusedElement.focus();
    }
    editModal.querySelector('.modal-close').addEventListener('click', handleClose);
    editModal.addEventListener('click', (e) => { if (e.target === editModal) handleClose(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && editModal.classList.contains('active')) handleClose();
    });

    // Фокус-трап
    editModal.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const focusable = editModal.querySelectorAll('button, input, textarea, [tabindex]:not([tabindex="-1"])');
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    });

    // --- Аватар ---
    async function handleAvatarFile(file) {
      errors.avatar.classList.remove('visible');
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        errors.avatar.textContent = 'Выберите файл изображения.';
        errors.avatar.classList.add('visible');
        return;
      }
      if (file.size > MAX_AVATAR_SIZE) {
        errors.avatar.textContent = 'Файл больше 2 МБ.';
        errors.avatar.classList.add('visible');
        return;
      }
      changeAvatarBtn.classList.add('avatar-loading');
      try {
        pendingAvatar = await compressImage(file, 400);
        modalAvatar.src = pendingAvatar;
      } catch (err) {
        errors.avatar.textContent = 'Не удалось обработать изображение.';
        errors.avatar.classList.add('visible');
      } finally {
        changeAvatarBtn.classList.remove('avatar-loading');
      }
    }

    changeAvatarBtn.addEventListener('click', () => avatarInput.click());
    avatarInput.addEventListener('change', (e) => handleAvatarFile(e.target.files[0]));

    avatarDrop.addEventListener('dragover', (e) => {
      e.preventDefault();
      avatarDrop.classList.add('dragover');
    });
    avatarDrop.addEventListener('dragleave', () => avatarDrop.classList.remove('dragover'));
    avatarDrop.addEventListener('drop', (e) => {
      e.preventDefault();
      avatarDrop.classList.remove('dragover');
      handleAvatarFile(e.dataTransfer.files[0]);
    });

    // --- Счётчики и валидация ---
    inputBio.addEventListener('input', updateCounters);
    inputAbout.addEventListener('input', updateCounters);
    inputTags.addEventListener('input', updateCounters);

    const validators = {
      name: v => v.length >= 2 && v.length <= 50,
      handle: v => /^@[A-Za-z0-9_]{2,29}$/.test(v),
      email: v => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      tags: v => {
        const tags = v.split(',').map(t => t.trim()).filter(Boolean);
        if (tags.length > MAX_TAGS) return false;
        if (tags.some(t => t.length > MAX_TAG_LEN)) return false;
        return true;
      }
    };

    function bindValidation(input, key) {
      input.addEventListener('input', () => {
        const ok = validators[key](input.value.trim());
        errors[key].classList.toggle('visible', !ok);
        input.classList.toggle('invalid', !ok);
      });
    }
    bindValidation(inputName, 'name');
    bindValidation(inputHandle, 'handle');
    bindValidation(inputEmail, 'email');
    bindValidation(inputTags, 'tags');

    // --- Сброс ---
    document.getElementById('resetProfileBtn').addEventListener('click', () => {
      if (!confirm('Сбросить профиль к исходному виду?')) return;
      localStorage.removeItem(STORAGE_KEY);
      location.reload();
    });

    // --- Сохранение ---
    document.getElementById('editProfileForm').addEventListener('submit', (e) => {
      e.preventDefault();

      const newName = inputName.value.trim();
      const newHandle = inputHandle.value.trim();
      const newLocation = inputLocation.value.trim();
      const newBio = inputBio.value.trim();
      const newAbout = inputAbout.value.trim();
      const newEmail = inputEmail.value.trim();
      const newTelegram = inputTelegram.value.trim();
      const parsedTags = inputTags.value.split(',').map(t => t.trim()).filter(Boolean);
      const uniqueTags = [...new Set(parsedTags)];

      let hasError = false;
      [['name', validators.name(newName), inputName],
       ['handle', validators.handle(newHandle), inputHandle],
       ['email', validators.email(newEmail), inputEmail],
       ['tags', validators.tags(inputTags.value), inputTags]].forEach(([key, ok, input]) => {
        if (!ok) {
          errors[key].classList.add('visible');
          input.classList.add('invalid');
          hasError = true;
        }
      });
      if (hasError) return;

      const newAvatar = pendingAvatar || (modalAvatar.src !== DEFAULT_AVATAR ? modalAvatar.src : null);
      const avatarToUse = newAvatar || DEFAULT_AVATAR;

      displayName.textContent = newName;
      displayHandle.textContent = newHandle;
      displayLocation.textContent = newLocation || 'Не указан';
      displayBio.textContent = newBio || 'Пользователь пока ничего не рассказал о себе.';
      displayAbout.textContent = newAbout || 'Информация не заполнена.';
      displayEmail.textContent = newEmail || '—';
      displayTelegram.textContent = newTelegram || '—';
      displayTags.innerHTML = uniqueTags.length
        ? uniqueTags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')
        : '<span class="tag" style="opacity:0.5;">Нет тегов</span>';
      profileAvatar.src = avatarToUse;
      if (topAvatar) topAvatar.src = avatarToUse;

      const data = {
        avatar: newAvatar,
        name: newName,
        handle: newHandle,
        location: newLocation,
        bio: newBio,
        about: newAbout,
        email: newEmail,
        telegram: newTelegram,
        tags: uniqueTags
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (err) {
        showToast('Не хватает места. Фото не сохранено.', 'error');
        data.avatar = null;
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e2) {}
      }

      profileBanner.classList.remove('profile-flash');
      void profileBanner.offsetWidth;
      profileBanner.classList.add('profile-flash');

      showToast('Профиль сохранён', 'success');
      handleClose();
    });

    // --- Синхронизация между вкладками ---
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY) loadProfile();
    });

    loadProfile();
  });
})();