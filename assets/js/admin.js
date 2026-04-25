const form = document.querySelector("[data-admin-form]");
const statusElement = document.querySelector("[data-admin-status]");
const tokenInput = document.querySelector("[data-admin-token]");
let currentSettings = {};

function setStatus(message, type = "info") {
  statusElement.textContent = message;
  statusElement.dataset.status = type;
}

function getByPath(source, path) {
  return path.split(".").reduce((value, key) => value?.[key], source);
}

function setByPath(target, path, value) {
  const parts = path.split(".");
  const last = parts.pop();
  const parent = parts.reduce((source, key) => {
    source[key] = source[key] && typeof source[key] === "object" ? source[key] : {};
    return source[key];
  }, target);
  parent[last] = value;
}

function fillForm(settings) {
  document.querySelectorAll("[data-field]").forEach((field) => {
    field.value = getByPath(settings, field.dataset.field) || "";
  });
}

function collectForm() {
  const nextSettings = structuredClone(currentSettings);

  document.querySelectorAll("[data-field]").forEach((field) => {
    setByPath(nextSettings, field.dataset.field, field.value.trim());
  });

  return nextSettings;
}

async function loadSettings() {
  setStatus("Məlumatlar yüklənir...");

  try {
    const response = await fetch("/api/settings", { cache: "no-store" });

    if (!response.ok) {
      throw new Error("Məlumatlar oxunmadı.");
    }

    currentSettings = await response.json();
    fillForm(currentSettings);
    setStatus("Hazırdır.", "success");
  } catch (error) {
    setStatus(error.message || "Admin məlumatları yüklənmədi.", "error");
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const nextSettings = collectForm();
  const headers = {
    "Content-Type": "application/json",
  };

  if (tokenInput.value.trim()) {
    headers["x-admin-token"] = tokenInput.value.trim();
  }

  setStatus("Yadda saxlanılır...");

  try {
    const response = await fetch("/api/settings", {
      method: "PUT",
      headers,
      body: JSON.stringify(nextSettings),
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || "Yadda saxlanmadı.");
    }

    currentSettings = payload.settings;
    fillForm(currentSettings);
    setStatus("Yadda saxlandı. Saytı yeniləyəndə dəyişiklik görünəcək.", "success");
  } catch (error) {
    setStatus(error.message || "Yadda saxlanmadı.", "error");
  }
});

loadSettings();
