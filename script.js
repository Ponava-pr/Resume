document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('resumeForm');
    const profileNameInput = document.getElementById('profileNameInput');
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    const profilesSelect = document.getElementById('profilesSelect');
    const loadProfileBtn = document.getElementById('loadProfileBtn');
    const deleteProfileBtn = document.getElementById('deleteProfileBtn');
    const resetFormBtn = document.getElementById('resetFormBtn');

    // Ключи для localStorage
    const AUTO_SAVE_KEY = 'autosaveResume';
    const PROFILES_KEY = 'savedProfiles';

    // ФУНКЦИИ ДЛЯ РАБОТЫ С ФОРМОЙ
    function getFormData() {
        const formData = new FormData(form);
        const data = {};
      
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }

        const checkboxes = form.querySelectorAll('input[type="checkbox"]:checked');
        data.skills = Array.from(checkboxes).map(cb => cb.value);

        return data;
    }

    function setFormData(data) {
        if (!data) return;

        for (let key in data) {
            const element = form.querySelector(`[name="${key}"]`);
            if (!element) continue;

            if (element.type === 'checkbox') {
                // Для чекбоксов проверяем, есть ли значение в массиве
                element.checked = data.skills && data.skills.includes(element.value);
            } else {
                element.value = data[key] || '';
            }
        }

        if (data.skills && Array.isArray(data.skills)) {
            const allCheckboxes = form.querySelectorAll('input[type="checkbox"]');
            allCheckboxes.forEach(cb => {
                cb.checked = data.skills.includes(cb.value);
            });
        }
    }

    // АВТОСОХРАНЕНИЕ
    // Изменение в форме
    form.addEventListener('input', function () {
        const data = getFormData();
        localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(data));
        console.log('Автосохранение выполнено.');
    });

    // Восстановление черновика при загрузке страницы
    const autosaveData = localStorage.getItem(AUTO_SAVE_KEY);
    if (autosaveData) {
        try {
            const data = JSON.parse(autosaveData);
            setFormData(data);
            console.log('Черновик восстановлен.');
        } catch (e) {
            console.error('Ошибка при восстановлении черновика:', e);
        }
    }

    // УПРАВЛЕНИЕ ПРОФИЛЯМИ
    function updateProfileSelect() {
        const profiles = JSON.parse(localStorage.getItem(PROFILES_KEY)) || {};
        profilesSelect.innerHTML = '<option value="">-- Выберите профиль --</option>';

        for (let name in profiles) {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            profilesSelect.appendChild(option);
        }
    }

    // Инициализация списка профилей
    updateProfileSelect();

    // Сохранение профиля
    saveProfileBtn.addEventListener('click', function () {
        const profileName = profileNameInput.value.trim();
        if (!profileName) {
            alert('Введите название профиля!');
            return;
        }

        const formData = getFormData();
        const profiles = JSON.parse(localStorage.getItem(PROFILES_KEY)) || {};
        profiles[profileName] = formData;
        localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));

        alert(`Профиль "${profileName}" сохранён!`);
        profileNameInput.value = '';
        updateProfileSelect();
    });

    // Загрузка профиля
    loadProfileBtn.addEventListener('click', function () {
        const selectedName = profilesSelect.value;
        if (!selectedName) {
            alert('Выберите профиль для загрузки!');
            return;
        }

        const profiles = JSON.parse(localStorage.getItem(PROFILES_KEY)) || {};
        const data = profiles[selectedName];
        if (data) {
            setFormData(data);
            // Обновляем черновик автосохранения данными из профиля
            localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(data));
            alert(`Профиль "${selectedName}" загружен.`);
        } else {
            alert('Профиль не найден!');
        }
    });

    // Удаление профиля
    deleteProfileBtn.addEventListener('click', function () {
        const selectedName = profilesSelect.value;
        if (!selectedName) {
            alert('Выберите профиль для удаления!');
            return;
        }

        if (!confirm(`Вы точно хотите удалить профиль "${selectedName}"?`)) {
            return;
        }

        const profiles = JSON.parse(localStorage.getItem(PROFILES_KEY)) || {};
        delete profiles[selectedName];
        localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));

        alert(`Профиль "${selectedName}" удалён.`);
        updateProfileSelect();
    });

    // Сброс формы
    resetFormBtn.addEventListener('click', function () {
        if (!confirm('Очистить форму и удалить черновик? Введённые данные будут потеряны.')) {
            return;
        }

        form.reset();
        localStorage.removeItem(AUTO_SAVE_KEY);
        alert('Форма очищена, черновик удалён.');
    });
});
