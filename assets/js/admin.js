const form = document.querySelector("[data-admin-form]");
const statusElement = document.querySelector("[data-admin-status]");
const tokenInput = document.querySelector("[data-admin-token]");
const languages = ["az", "ru", "en"];

let currentSettings = {};

const editorDefinitions = {
  "slider.slides": {
    title: "Slider slaydları",
    addLabel: "Yeni slayd əlavə et",
    emptyItem: () => ({
      id: `slide-${Date.now()}`,
      enabled: true,
      image: "assets/images/globtech-hero.png",
      href: "index.html#contact",
      az: {
        badge: "Yeni slayd",
        title: "Yeni slayd başlığı",
        text: "Slayd haqqında qısa mətn.",
        primaryLabel: "Daha ətraflı",
        primaryHref: "index.html#contact",
        secondaryLabel: "Layihələr",
        secondaryHref: "projects.html",
        alt: "Slider şəkli",
      },
      ru: {
        badge: "Новый слайд",
        title: "Заголовок нового слайда",
        text: "Краткий текст о слайде.",
        primaryLabel: "Подробнее",
        primaryHref: "index.html#contact",
        secondaryLabel: "Проекты",
        secondaryHref: "projects.html",
        alt: "Изображение слайда",
      },
      en: {
        badge: "New slide",
        title: "New slide title",
        text: "Short text about the slide.",
        primaryLabel: "Learn more",
        primaryHref: "index.html#contact",
        secondaryLabel: "Projects",
        secondaryHref: "projects.html",
        alt: "Slider image",
      },
    }),
    fields: [
      { path: "id", label: "ID", type: "text" },
      { path: "enabled", label: "Aktiv", type: "checkbox" },
      { path: "image", label: "Şəkil yolu", type: "text" },
      { path: "href", label: "Şəkilə klik linki", type: "text" },
      ...localizedFields(["badge", "title", "text", "primaryLabel", "primaryHref", "secondaryLabel", "secondaryHref", "alt"]),
    ],
  },
  "projects.items": {
    title: "Layihə kartları",
    addLabel: "Yeni layihə əlavə et",
    emptyItem: () => ({
      id: `project-${Date.now()}`,
      enabled: true,
      image: "assets/images/projects/araz-supermarket/network-cabinet.png",
      gallery: ["assets/images/projects/araz-supermarket/network-cabinet.png"],
      az: {
        tags: ["IT infrastruktur"],
        meta: ["Audit", "Montaj"],
        title: "Yeni layihə",
        summary: "Layihə haqqında qısa məlumat.",
        scopeTitle: "Görülən işlərin əhatəsi",
        scope: "Layihədə görülən əsas işləri burada yaz.",
        galleryTitle: "Foto kataloq",
      },
      ru: {
        tags: ["IT-инфраструктура"],
        meta: ["Аудит", "Монтаж"],
        title: "Новый проект",
        summary: "Краткая информация о проекте.",
        scopeTitle: "Объем работ",
        scope: "Опишите основные выполненные работы.",
        galleryTitle: "Фотокаталог",
      },
      en: {
        tags: ["IT infrastructure"],
        meta: ["Audit", "Installation"],
        title: "New project",
        summary: "Short project description.",
        scopeTitle: "Scope of delivered work",
        scope: "Describe the main delivered work here.",
        galleryTitle: "Photo catalog",
      },
    }),
    fields: [
      { path: "id", label: "ID", type: "text" },
      { path: "enabled", label: "Aktiv", type: "checkbox" },
      { path: "image", label: "Əsas şəkil", type: "text" },
      { path: "gallery", label: "Foto kataloq yolları", type: "list", rows: 4 },
      ...localizedFields(["tags", "meta", "title", "summary", "scopeTitle", "scope", "galleryTitle"], {
        tags: "list",
        meta: "list",
        summary: "textarea",
        scope: "textarea",
      }),
    ],
  },
  customSections: {
    title: "Əlavə bölmələr",
    addLabel: "Yeni bölmə əlavə et",
    emptyItem: () => ({
      id: `section-${Date.now()}`,
      enabled: true,
      theme: "light",
      az: {
        kicker: "Yeni bölmə",
        title: "Yeni bölmə başlığı",
        lead: "Bu bölmənin mətnini admin paneldən dəyiş.",
        buttonLabel: "Əlaqə saxla",
        buttonHref: "index.html#contact",
      },
      ru: {
        kicker: "Новый блок",
        title: "Заголовок нового блока",
        lead: "Текст этого блока можно изменить из панели.",
        buttonLabel: "Связаться",
        buttonHref: "index.html#contact",
      },
      en: {
        kicker: "New section",
        title: "New section title",
        lead: "Edit this section text from the admin panel.",
        buttonLabel: "Contact us",
        buttonHref: "index.html#contact",
      },
    }),
    fields: [
      { path: "id", label: "ID", type: "text" },
      { path: "enabled", label: "Aktiv", type: "checkbox" },
      { path: "theme", label: "Tema", type: "select", options: ["light", "dark"] },
      ...localizedFields(["kicker", "title", "lead", "buttonLabel", "buttonHref"], {
        lead: "textarea",
      }),
    ],
  },
};

function localizedFields(keys, typeMap = {}) {
  return languages.flatMap((language) =>
    keys.map((key) => ({
      path: `${language}.${key}`,
      label: `${language.toUpperCase()} ${key}`,
      type: typeMap[key] || "text",
    }))
  );
}

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
    source[key] = source[key] && typeof source[key] === "object" && !Array.isArray(source[key]) ? source[key] : {};
    return source[key];
  }, target);
  parent[last] = value;
}

function toList(value) {
  if (Array.isArray(value)) {
    return value.join("\n");
  }

  return value || "";
}

function fromList(value) {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function fillForm(settings) {
  document.querySelectorAll("[data-field]").forEach((field) => {
    field.value = getByPath(settings, field.dataset.field) || "";
  });

  renderArrayEditors(settings);
}

function collectForm() {
  const nextSettings = structuredClone(currentSettings);

  document.querySelectorAll("[data-field]").forEach((field) => {
    setByPath(nextSettings, field.dataset.field, field.value.trim());
  });

  document.querySelectorAll("[data-array-editor]").forEach((editor) => {
    const path = editor.dataset.arrayEditor;
    const definition = editorDefinitions[path];

    if (!definition) {
      return;
    }

    const items = Array.from(editor.querySelectorAll("[data-array-item]")).map((itemElement) => {
      const item = {};

      itemElement.querySelectorAll("[data-item-field]").forEach((field) => {
        const itemPath = field.dataset.itemField;
        let value = field.value?.trim() || "";

        if (field.type === "checkbox") {
          value = field.checked;
        } else if (field.dataset.listField === "true") {
          value = fromList(field.value);
        }

        setByPath(item, itemPath, value);
      });

      return item;
    });

    setByPath(nextSettings, path, items);
  });

  return nextSettings;
}

function renderArrayEditors(settings) {
  document.querySelectorAll("[data-array-editor]").forEach((editor) => {
    const path = editor.dataset.arrayEditor;
    const definition = editorDefinitions[path];
    const items = getByPath(settings, path) || [];

    if (!definition) {
      return;
    }

    editor.innerHTML = `
      <div class="admin-array-head">
        <div>
          <strong>${definition.title}</strong>
          <span>${items.length} element</span>
        </div>
        <button class="button button-light" type="button" data-add-item>${definition.addLabel}</button>
      </div>
      <div class="admin-array-list">
        ${items.map((item, index) => renderArrayItem(definition, item, index)).join("")}
      </div>
    `;

    editor.querySelector("[data-add-item]").addEventListener("click", () => {
      const nextSettings = collectForm();
      const nextItems = getByPath(nextSettings, path) || [];
      nextItems.push(definition.emptyItem());
      setByPath(nextSettings, path, nextItems);
      currentSettings = nextSettings;
      fillForm(currentSettings);
      setStatus("Yeni element əlavə olundu. Sonda yadda saxla.", "success");
    });

    editor.querySelectorAll("[data-delete-item]").forEach((button) => {
      button.addEventListener("click", () => {
        const nextSettings = collectForm();
        const nextItems = getByPath(nextSettings, path) || [];
        nextItems.splice(Number(button.dataset.deleteItem), 1);
        setByPath(nextSettings, path, nextItems);
        currentSettings = nextSettings;
        fillForm(currentSettings);
        setStatus("Element silindi. Sonda yadda saxla.", "success");
      });
    });

    editor.querySelectorAll("[data-duplicate-item]").forEach((button) => {
      button.addEventListener("click", () => {
        const nextSettings = collectForm();
        const nextItems = getByPath(nextSettings, path) || [];
        const source = structuredClone(nextItems[Number(button.dataset.duplicateItem)]);

        if (source) {
          source.id = `${source.id || "item"}-copy-${Date.now()}`;
          nextItems.splice(Number(button.dataset.duplicateItem) + 1, 0, source);
        }

        setByPath(nextSettings, path, nextItems);
        currentSettings = nextSettings;
        fillForm(currentSettings);
        setStatus("Element kopyalandı. Sonda yadda saxla.", "success");
      });
    });
  });
}

function renderArrayItem(definition, item, index) {
  const title = getByPath(item, "az.title") || item.id || `${definition.title} ${index + 1}`;

  return `
    <article class="admin-array-item" data-array-item>
      <div class="admin-array-title">
        <strong>${escapeHtml(title)}</strong>
        <div>
          <button class="button button-light" type="button" data-duplicate-item="${index}">Kopyala</button>
          <button class="button button-danger" type="button" data-delete-item="${index}">Sil</button>
        </div>
      </div>
      <div class="admin-array-fields">
        ${definition.fields.map((field) => renderField(field, getByPath(item, field.path))).join("")}
      </div>
    </article>
  `;
}

function renderField(field, value) {
  if (field.type === "checkbox") {
    return `
      <label class="admin-check">
        <input data-item-field="${field.path}" type="checkbox" ${value === false ? "" : "checked"} />
        <span>${field.label}</span>
      </label>
    `;
  }

  if (field.type === "select") {
    return `
      <label>
        <span>${field.label}</span>
        <select data-item-field="${field.path}">
          ${field.options.map((option) => `<option value="${option}" ${value === option ? "selected" : ""}>${option}</option>`).join("")}
        </select>
      </label>
    `;
  }

  if (field.type === "textarea" || field.type === "list") {
    const rows = field.rows || (field.type === "list" ? 3 : 4);
    const displayValue = field.type === "list" ? toList(value) : value || "";

    return `
      <label>
        <span>${field.label}${field.type === "list" ? " (hər sətir ayrı)" : ""}</span>
        <textarea data-item-field="${field.path}" ${field.type === "list" ? 'data-list-field="true"' : ""} rows="${rows}">${escapeHtml(displayValue)}</textarea>
      </label>
    `;
  }

  return `
    <label>
      <span>${field.label}</span>
      <input data-item-field="${field.path}" value="${escapeHtml(value || "")}" />
    </label>
  `;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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
