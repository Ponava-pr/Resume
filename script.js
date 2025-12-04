document.addEventListener('DOMContentLoaded', function () {
    console.log('Скрипт запущен!');
    
    const form = document.getElementById('resumeForm');
    const profileNameInput = document.getElementById('profileNameInput');
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    const profilesSelect = document.getElementById('profilesSelect');
    const loadProfileBtn = document.getElementById('loadProfileBtn');
    const deleteProfileBtn = document.getElementById('deleteProfileBtn');
    const resetFormBtn = document.getElementById('resetFormBtn');

    if (!form || !profileNameInput || !saveProfileBtn || !profilesSelect || 
        !loadProfileBtn || !deleteProfileBtn || !resetFormBtn) {
        console.error('Ошибка: не все элементы найдены! Проверьте ID в HTML.');
        return;
    }

    const AUTO_SAVE_KEY = 'autosaveResume';
    const PROFILES_KEY = 'savedProfiles';

    function getFormData() {
        const data = {};
        
        const elements = form.querySelectorAll('input, select, textarea');
        
        elements.forEach(element => {
            const name = element.name;
            if (!name) return;
            
            if (element.type === 'checkbox') {
                if (!data[name]) {
                    data[name] = [];
                }
                if (element.checked) {
                    data[name].push(element.value);
                }
            } else if (element.type === 'radio') {
                if (element.checked) {
                    data[name] = element.value;
                }
            } else {
                data[name] = element.value;
            }
        });
        
        return data;
    }

    function setFormData(data) {
        if (!data) return;
        const elements = form.querySelectorAll('input, select, textarea');
        
        elements.forEach(element => {
            const name = element.name;
            if (!name || !data.hasOwnProperty(name)) return;
            
            const value = data[name];
            
            if (element.type === 'checkbox') {
                if (Array.isArray(value)) {
                    element.checked = value.includes(element.value);
                } else {
                    element.checked = false;
                }
            } else if (element.type === 'radio') {
                if (value === element.value) {
                    element.checked = true;
                }
            } else {
                element.value = value || '';
            }
        });
    }

    form.addEventListener('input', function () {
        const data = getFormData();
        localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(data));
        console.log('Автосохранение выполнено.');
    });

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

    updateProfileSelect();

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
            localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(data));
            alert(`Профиль "${selectedName}" загружен.`);
        } else {
            alert('Профиль не найден!');
        }
    });

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

    resetFormBtn.addEventListener('click', function () {
        if (!confirm('Очистить форму и удалить черновик? Введённые данные будут потеряны.')) {
            return;
        }

        form.reset();
        localStorage.removeItem(AUTO_SAVE_KEY);
        alert('Форма очищена, черновик удалён.');
    });
});
