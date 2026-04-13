(function () {
  "use strict";

  const app = (window.RMBJAdmin = window.RMBJAdmin || {});

  app.STORAGE_KEY = "rm_bu_jawa_admin_dashboard_v4";
  app.PUBLIC_PREVIEW_KEY = "rm_bu_jawa_public_preview_v1";
  app.SESSION_KEY = "rm_bu_jawa_admin_session";
  app.SIDEBAR_KEY = "rm_bu_jawa_admin_sidebar_collapsed";
  app.LOGIN_USERNAME = "admin";
  app.LOGIN_PASSWORD = "rmbujawa2026";
  app.CATEGORIES = ["Menu Utama", "Menu Sayur", "Minuman", "Snack"];
  app.PLACEHOLDER_IMAGE =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="360" height="240" viewBox="0 0 360 240">
        <rect width="360" height="240" rx="28" fill="#efe4d1"/>
        <rect x="24" y="24" width="312" height="192" rx="22" fill="#fbf7f0" stroke="#d8c7af" stroke-width="2"/>
        <circle cx="180" cy="96" r="26" fill="#d9e5d3"/>
        <path d="M126 158c14-22 31-33 54-33s40 11 54 33" fill="none" stroke="#6e4f35" stroke-width="8" stroke-linecap="round"/>
        <text x="180" y="200" text-anchor="middle" font-family="Arial" font-size="18" fill="#6e6255">Belum ada foto</text>
      </svg>
    `);

  app.state = {
    metadata: {
      nama_usaha: "Rumah Makan Bu Jawa",
      telepon: "0895-4057-18033",
      jam_buka: "Setiap hari, pukul 09.00 sampai 21.00 WIB",
      maps: "https://maps.app.goo.gl/XNuEpTYSbn5omncMA",
      generated_at: new Date().toISOString(),
    },
    master_menu: [],
    menu_hari_ini: [],
    menu_besok: [],
  };

  app.initialized = false;
  app.selectedIds = new Set();
  app.pendingImageFile = null;
  app.pendingImagePreviewUrl = "";
  app.pendingImageDataUrl = "";
  app.menuFileHandle = null;
  app.menuImageDirectoryHandle = null;
  app.handleDbPromise = null;

  app.validId = function validId(id) {
    return Number.isFinite(id) && id > 0;
  };

  app.normalizeCategory = function normalizeCategory(value) {
    const category = String(value || "").trim().toLowerCase();
    if (category === "menu utama" || category === "makanan") return "Menu Utama";
    if (category === "menu sayur" || category === "sayur") return "Menu Sayur";
    if (category === "minuman") return "Minuman";
    if (category === "snack" || category === "lauk tambahan" || category === "paket" || category === "lainnya") return "Snack";
    return "Menu Utama";
  };

  app.createEmptyState = function createEmptyState() {
    return {
      metadata: { ...app.state.metadata, generated_at: new Date().toISOString() },
      master_menu: [],
      menu_hari_ini: [],
      menu_besok: [],
    };
  };

  app.normalizeMenu = function normalizeMenu(item) {
    if (!item || typeof item !== "object") return null;
    return {
      id: Number(item.id) || Date.now(),
      nama_menu: String(item.nama_menu || "").trim(),
      kategori: app.normalizeCategory(item.kategori),
      deskripsi: String(item.deskripsi || "").trim(),
      harga: Number(item.harga || 0),
      gambar: app.normalizeImagePath(item.gambar),
      gambar_preview: typeof item.gambar_preview === "string" && item.gambar_preview.startsWith("data:") ? item.gambar_preview : "",
      image_version: Number(item.image_version || item.gambar_update || item.updated_at || 0) || 0,
      aktif: Boolean(item.aktif),
      status_ketersediaan: item.status_ketersediaan === "habis" ? "habis" : "tersedia",
    };
  };

  app.normalizeSchedule = function normalizeSchedule(schedule, legacyMenus, type) {
    if (Array.isArray(schedule)) {
      return schedule.map((item) => (typeof item === "object" ? Number(item.id) : Number(item))).filter(app.validId);
    }
    if (Array.isArray(legacyMenus)) {
      return legacyMenus.filter((item) => item?.tipe_hari === type).map((item) => Number(item.id)).filter(app.validId);
    }
    return [];
  };

  app.normalizePayload = function normalizePayload(payload) {
    const base = app.createEmptyState();
    const masterSource = Array.isArray(payload?.master_menu)
      ? payload.master_menu
      : Array.isArray(payload?.menus)
        ? payload.menus
        : [];

    return {
      metadata: {
        ...base.metadata,
        ...(payload?.metadata || {}),
        generated_at: payload?.metadata?.generated_at || payload?.generated_at || new Date().toISOString(),
      },
      master_menu: masterSource.map(app.normalizeMenu).filter(Boolean),
      menu_hari_ini: app.normalizeSchedule(payload?.menu_hari_ini, payload?.menus, "hari_ini"),
      menu_besok: app.normalizeSchedule(payload?.menu_besok, payload?.menus, "besok"),
    };
  };

  app.persist = function persist() {
    app.state.metadata.generated_at = new Date().toISOString();
    localStorage.setItem(app.STORAGE_KEY, JSON.stringify(app.state));
    localStorage.setItem(app.PUBLIC_PREVIEW_KEY, JSON.stringify(app.buildExportPayload()));
  };

  app.isSidebarCollapsed = function isSidebarCollapsed() {
    return localStorage.getItem(app.SIDEBAR_KEY) === "true";
  };

  app.applySidebarState = function applySidebarState() {
    const collapsed = app.isSidebarCollapsed();
    document.body.classList.toggle("sidebar-collapsed", collapsed);
    const button = document.querySelector("#sidebar-toggle-button");
    if (button) {
      button.setAttribute("aria-expanded", collapsed ? "false" : "true");
      const label = button.querySelector("span");
      if (label) label.textContent = collapsed ? "Tampilkan Menu" : "Sembunyikan Menu";
    }
  };

  app.toggleSidebar = function toggleSidebar() {
    localStorage.setItem(app.SIDEBAR_KEY, app.isSidebarCollapsed() ? "false" : "true");
    app.applySidebarState();
  };

  app.findMaster = function findMaster(id) {
    return app.state.master_menu.find((item) => Number(item.id) === Number(id)) || null;
  };

  app.nextId = function nextId() {
    return app.state.master_menu.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
  };

  app.buildSnapshot = function buildSnapshot(ids, type) {
    return ids
      .map((id) => app.findMaster(id))
      .filter(Boolean)
      .map((menu) => ({
        id: menu.id,
        nama_menu: menu.nama_menu,
        kategori: menu.kategori,
        deskripsi: menu.deskripsi,
        harga: menu.harga,
        gambar: menu.gambar,
        image_version: menu.image_version || 0,
        aktif: menu.aktif,
        status_ketersediaan: menu.status_ketersediaan,
        tipe_hari: type,
      }));
  };

  app.serializeMenu = function serializeMenu(menu) {
    return {
      id: menu.id,
      nama_menu: menu.nama_menu,
      kategori: menu.kategori,
      deskripsi: menu.deskripsi,
      harga: menu.harga,
      gambar: menu.gambar,
      image_version: menu.image_version || 0,
      aktif: menu.aktif,
      status_ketersediaan: menu.status_ketersediaan,
    };
  };

  app.isFallbackActive = function isFallbackActive() {
    return app.state.menu_besok.length === 0 && app.state.menu_hari_ini.length > 0;
  };

  app.buildExportPayload = function buildExportPayload() {
    const menuBesokSource = app.isFallbackActive()
      ? app.state.menu_hari_ini
      : app.state.menu_besok;

    return {
      metadata: {
        ...app.state.metadata,
        generated_at: new Date().toISOString(),
      },
      master_menu: app.state.master_menu.map(app.serializeMenu),
      menu_hari_ini: app.buildSnapshot(app.state.menu_hari_ini, "hari_ini"),
      menu_besok: app.buildSnapshot(menuBesokSource, "besok"),
    };
  };

  app.getJsonPickerOptions = function getJsonPickerOptions() {
    return {
      multiple: false,
      excludeAcceptAllOption: false,
      suggestedName: "menu.json",
      types: [
        {
          description: "File JSON menu",
          accept: {
            "application/json": [".json"],
          },
        },
      ],
    };
  };

  app.ensureHandlePermission = async function ensureHandlePermission(handle, mode) {
    if (!handle || typeof handle.queryPermission !== "function") return true;
    const options = { mode: mode || "readwrite" };
    const currentPermission = await handle.queryPermission(options);
    if (currentPermission === "granted") return true;
    if (typeof handle.requestPermission === "function") {
      const requestedPermission = await handle.requestPermission(options);
      return requestedPermission === "granted";
    }
    return false;
  };

  app.openHandleDb = function openHandleDb() {
    if (app.handleDbPromise) return app.handleDbPromise;

    app.handleDbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open("rmbj-admin-handles", 1);

      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains("handles")) {
          database.createObjectStore("handles");
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return app.handleDbPromise;
  };

  app.storePersistentHandle = async function storePersistentHandle(key, handle) {
    if (!("indexedDB" in window)) return;
    const database = await app.openHandleDb();
    await new Promise((resolve, reject) => {
      const transaction = database.transaction("handles", "readwrite");
      transaction.objectStore("handles").put(handle, key);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  };

  app.loadPersistentHandle = async function loadPersistentHandle(key) {
    if (!("indexedDB" in window)) return null;
    const database = await app.openHandleDb();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction("handles", "readonly");
      const request = transaction.objectStore("handles").get(key);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  };

  app.restoreStoredHandles = async function restoreStoredHandles() {
    try {
      const [jsonHandle, imageDirectoryHandle] = await Promise.all([
        app.loadPersistentHandle("menu-json"),
        app.loadPersistentHandle("menu-images"),
      ]);
      if (jsonHandle) {
        const granted = await app.ensureHandlePermission(jsonHandle, "readwrite");
        app.menuFileHandle = granted ? jsonHandle : null;
      }
      if (imageDirectoryHandle) {
        const granted = await app.ensureHandlePermission(imageDirectoryHandle, "readwrite");
        app.menuImageDirectoryHandle = granted ? imageDirectoryHandle : null;
      }
    } catch (error) {
      app.menuFileHandle = null;
      app.menuImageDirectoryHandle = null;
    }
  };

  app.readJsonFile = async function readJsonFile(file) {
    const text = await file.text();
    return JSON.parse(text);
  };

  app.pickMenuJsonFile = async function pickMenuJsonFile() {
    if (typeof window.showOpenFilePicker !== "function") {
      throw new Error("Browser ini belum mendukung penyimpanan langsung ke file. Gunakan Chrome atau Edge terbaru.");
    }

    const handles = await window.showOpenFilePicker(app.getJsonPickerOptions());
    const handle = handles?.[0] || null;
    if (!handle) {
      throw new Error("File data/menu.json belum dipilih.");
    }

    const granted = await app.ensureHandlePermission(handle, "readwrite");
    if (!granted) {
      throw new Error("Izin menulis ke data/menu.json belum diberikan.");
    }

    app.menuFileHandle = handle;
    await app.storePersistentHandle("menu-json", handle);
    return handle;
  };

  app.ensureMenuFileHandle = async function ensureMenuFileHandle() {
    if (app.menuFileHandle) {
      const granted = await app.ensureHandlePermission(app.menuFileHandle, "readwrite");
      if (granted) return app.menuFileHandle;
      app.menuFileHandle = null;
    }
    return app.pickMenuJsonFile();
  };

  app.writeJsonToFile = async function writeJsonToFile(fileHandle, payload) {
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(payload, null, 2));
    await writable.close();
  };

  app.pickMenuImageDirectory = async function pickMenuImageDirectory() {
    if (typeof window.showDirectoryPicker !== "function") {
      throw new Error("Browser ini belum mendukung penyimpanan gambar ke folder. Gunakan Chrome atau Edge terbaru.");
    }

    const handle = await window.showDirectoryPicker({
      id: "rmbj-assets-images",
      mode: "readwrite",
      startIn: "pictures",
    });

    if (!handle) {
      throw new Error("Folder assets/img belum dipilih.");
    }

    const granted = await app.ensureHandlePermission(handle, "readwrite");
    if (!granted) {
      throw new Error("Izin menulis ke folder assets/img belum diberikan.");
    }

    app.menuImageDirectoryHandle = handle;
    await app.storePersistentHandle("menu-images", handle);
    return handle;
  };

  app.ensureMenuImageDirectoryHandle = async function ensureMenuImageDirectoryHandle() {
    if (app.menuImageDirectoryHandle) {
      const granted = await app.ensureHandlePermission(app.menuImageDirectoryHandle, "readwrite");
      if (granted) return app.menuImageDirectoryHandle;
      app.menuImageDirectoryHandle = null;
    }
    return app.pickMenuImageDirectory();
  };

  app.saveMainJson = async function saveMainJson() {
    try {
      app.persist();
      const fileHandle = await app.ensureMenuFileHandle();
      await app.writeJsonToFile(fileHandle, app.buildExportPayload());
      app.flash("success", "data/menu.json berhasil diperbarui. Lanjutkan commit dan push lewat GitHub Desktop.");
    } catch (error) {
      if (error?.name === "AbortError") {
        app.flash("error", "Pilih file data/menu.json untuk mengaktifkan tombol Simpan.");
        return;
      }
      app.flash("error", error?.message || "Gagal memperbarui data/menu.json.");
    }
  };

  app.getFileExtension = function getFileExtension(fileName) {
    const parts = String(fileName || "").split(".");
    return parts.length > 1 ? parts.pop().toLowerCase() : "jpg";
  };

  app.normalizeImagePath = function normalizeImagePath(value) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    if (raw.startsWith("data:") || raw.startsWith("blob:") || /^https?:\/\//i.test(raw)) return raw;

    let normalized = raw.replace(/\\/g, "/").replace(/^\.?\//, "");
    const assetsIndex = normalized.toLowerCase().indexOf("assets/img/");
    if (assetsIndex >= 0) {
      normalized = normalized.slice(assetsIndex);
    }
    return normalized;
  };

  app.slugify = function slugify(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "menu";
  };

  app.buildMenuImageName = function buildMenuImageName(menuId, menuName, originalName) {
    const extension = app.getFileExtension(originalName);
    return `menu-${menuId}-${app.slugify(menuName)}.${extension}`;
  };

  app.buildImageReference = function buildImageReference(fileName) {
    const extension = app.getFileExtension(fileName);
    const baseName = String(fileName || "")
      .replace(/\.[^.]+$/, "")
      .trim();
    return `assets/img/${app.slugify(baseName)}.${extension}`;
  };

  app.saveMenuImageFile = async function saveMenuImageFile(file, menuId, menuName) {
    const directoryHandle = await app.ensureMenuImageDirectoryHandle();
    const fileName = app.buildMenuImageName(menuId, menuName, file.name);
    const fileHandle = await directoryHandle.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(await file.arrayBuffer());
    await writable.close();
    return `assets/img/${fileName}`;
  };

  app.clearPendingImage = function clearPendingImage() {
    if (app.pendingImagePreviewUrl) {
      URL.revokeObjectURL(app.pendingImagePreviewUrl);
    }
    app.pendingImageFile = null;
    app.pendingImagePreviewUrl = "";
    app.pendingImageDataUrl = "";
  };

  app.readFileAsDataUrl = function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
      reader.onerror = () => reject(new Error("Gagal membaca file gambar."));
      reader.readAsDataURL(file);
    });
  };

  app.showFormError = function showFormError(message) {
    const node = document.querySelector("#menu-form-error");
    if (!node) return;
    node.textContent = message;
    node.classList.remove("is-hidden");
  };

  app.clearFormError = function clearFormError() {
    const node = document.querySelector("#menu-form-error");
    if (!node) return;
    node.textContent = "";
    node.classList.add("is-hidden");
  };

  app.commitDraft = function commitDraft(message) {
    app.renderAll();
    if (message) app.flash("success", message);
  };

  app.setText = function setText(selector, value) {
    const element = document.querySelector(selector);
    if (element) element.textContent = value;
  };

  app.setValue = function setValue(selector, value) {
    const element = document.querySelector(selector);
    if (element) element.value = value;
  };

  app.formatRupiah = function formatRupiah(value) {
    return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
  };

  app.parsePriceInput = function parsePriceInput(value) {
    const digits = String(value || "").replace(/[^\d]/g, "");
    if (!digits) return 0;
    const amount = Number(digits);
    if (!Number.isFinite(amount) || amount <= 0) return 0;
    return amount >= 1000 ? amount : amount * 1000;
  };

  app.formatPriceInput = function formatPriceInput(value) {
    const amount = app.parsePriceInput(value);
    return amount ? String(amount) : "";
  };

  app.truncate = function truncate(value, maxLength) {
    const text = String(value || "").trim();
    if (text.length <= maxLength) return text;
    return `${text.slice(0, Math.max(0, maxLength - 1)).trim()}...`;
  };

  app.flash = function flash(type, message) {
    let node = document.querySelector("#floating-flash");
    if (!node) {
      node = document.createElement("div");
      node.id = "floating-flash";
      node.className = "floating-flash";
      document.body.appendChild(node);
    }
    node.className = `floating-flash ${type === "error" ? "flash-error" : "flash-success"}`;
    node.textContent = message;
    window.clearTimeout(app.flash.timer);
    app.flash.timer = window.setTimeout(() => node.remove(), 3200);
  };

  app.escapeHtml = function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  app.renderThumb = function renderThumb(src, className, previewSrc, version) {
    const normalizedSrc = app.buildVersionedImagePath(src, version);
    const fallbackSrc = previewSrc || app.PLACEHOLDER_IMAGE;
    const resolvedSrc = normalizedSrc || previewSrc;
    if (!resolvedSrc) return `<span class="${className} thumb-placeholder">Foto</span>`;
    return `<img src="${app.escapeHtml(resolvedSrc)}" alt="" class="${className}" onerror="this.onerror=null;this.src='${app.escapeHtml(fallbackSrc)}';">`;
  };

  app.buildVersionedImagePath = function buildVersionedImagePath(src, version) {
    const normalizedSrc = app.normalizeImagePath(src);
    if (!normalizedSrc || !version) return normalizedSrc;
    if (normalizedSrc.startsWith("data:") || normalizedSrc.startsWith("blob:") || /^https?:\/\//i.test(normalizedSrc)) return normalizedSrc;
    const separator = normalizedSrc.includes("?") ? "&" : "?";
    return `${normalizedSrc}${separator}v=${encodeURIComponent(String(version))}`;
  };

  app.renderEmpty = function renderEmpty(title, description, withButton) {
    return `
      <div class="schedule-empty empty-state-rich">
        <i class="bi bi-journal-plus"></i>
        <h4>${app.escapeHtml(title)}</h4>
        <p>${app.escapeHtml(description)}</p>
        ${withButton ? '<button type="button" class="btn btn-primary-custom empty-action" id="empty-add-button">Tambah Menu Baru</button>' : ""}
      </div>
    `;
  };

  app.renderSmallEmpty = function renderSmallEmpty(text) {
    return `
      <div class="small-empty-state">
        <i class="bi bi-inbox"></i>
        <p>${app.escapeHtml(text)}</p>
      </div>
    `;
  };
})();
