// Получаем элементы формы и управления профилями
const form = document.getElementById("resumeForm");
const profileNameInput = document.getElementById("profileName");
const profileSelect = document.getElementById("profileSelect");
const saveBtn = document.getElementById("saveProfile");
const loadBtn = document.getElementById("loadProfile");
const deleteBtn = document.getElementById("deleteProfile");
const resetBtn = document.getElementById("resetForm");

// Функция для получения данных формы
function getFormData() {
  const data = {};
  new FormData(form).forEach((value, key) => {
    // Если поле уже есть (checkbox с одинаковым name)
    if (data[key]) {
      if (Array.isArray(data[key])) data[key].push(value);
      else data[key] = [data[key], value];
    } else {
      data[key] = value;
    }
  });
  return data;
}

// Функция для заполнения формы данными
function setFormData(data) {
  for (let key in data) {
    const field = form.elements[key];
    if (!field) continue;

    // Checkbox или множественные элементы
    if (field.type === "checkbox" || field.length) {
      if (!Array.isArray(data[key])) {
        field.checked = data[key] === field.value;
      } else {
        Array.from(field).forEach(f => f.checked = data[key].includes(f.value));
      }
    } else {
      field.value = data[key];
    }
  }
}

// --- Автосохранение при вводе ---
form.addEventListener("input", () => {
  const data = getFormData();
  localStorage.setItem("autosaveResume", JSON.stringify(data));
});

// --- Восстановление черновика при загрузке страницы ---
document.addEventListener("DOMContentLoaded", () => {
  const draft = localStorage.getItem("autosaveResume");
  if (draft) setFormData(JSON.parse(draft));
  updateProfileSelect();
});

// --- Сохранение профиля ---
saveBtn.addEventListener("click", () => {
  const profileName = profileNameInput.value.trim();
  if (!profileName) return alert("Введите имя профиля!");
  
  const data = getFormData();
  const savedProfiles = JSON.parse(localStorage.getItem("savedProfiles") || "{}");
  
  savedProfiles[profileName] = data;
  localStorage.setItem("savedProfiles", JSON.stringify(savedProfiles));
  
  updateProfileSelect();
  profileNameInput.value = "";
});

// --- Обновление списка профилей ---
function updateProfileSelect() {
  const savedProfiles = JSON.parse(localStorage.getItem("savedProfiles") || "{}");
  profileSelect.innerHTML = '<option value="">Выберите профиль</option>';
  for (let key in savedProfiles) {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = key;
    profileSelect.appendChild(option);
  }
}

// --- Загрузка выбранного профиля ---
loadBtn.addEventListener("click", () => {
  const selected = profileSelect.value;
  if (!selected) return alert("Выберите профиль!");
  
  const savedProfiles = JSON.parse(localStorage.getItem("savedProfiles") || "{}");
  setFormData(savedProfiles[selected]);
  // Обновляем черновик, чтобы автосохранение не стерло загруженные данные
  localStorage.setItem("autosaveResume", JSON.stringify(savedProfiles[selected]));
});

// --- Удаление выбранного профиля ---
deleteBtn.addEventListener("click", () => {
  const selected = profileSelect.value;
  if (!selected) return alert("Выберите профиль!");
  if (!confirm(`Удалить профиль "${selected}"?`)) return;

  const savedProfiles = JSON.parse(localStorage.getItem("savedProfiles") || "{}");
  delete savedProfiles[selected];
  localStorage.setItem("savedProfiles", JSON.stringify(savedProfiles));
  updateProfileSelect();
});

// --- Сброс формы и удаление черновика ---
resetBtn.addEventListener("click", () => {
  if (!confirm("Очистить форму и удалить черновик?")) return;
  form.reset();
  localStorage.removeItem("autosaveResume");
});
