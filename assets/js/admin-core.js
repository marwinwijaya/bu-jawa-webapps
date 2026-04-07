(function () {
  "use strict";

  const app = (window.RMBJAdmin = window.RMBJAdmin || {});

  app.STORAGE_KEY = "rm_bu_jawa_admin_dashboard_v4";
  app.SESSION_KEY = "rm_bu_jawa_admin_session";
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
      gambar: typeof item.gambar === "string" ? item.gambar : "",
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
        aktif: menu.aktif,
        status_ketersediaan: menu.status_ketersediaan,
        tipe_hari: type,
      }));
  };

  app.buildExportPayload = function buildExportPayload() {
    return {
      metadata: {
        ...app.state.metadata,
        generated_at: new Date().toISOString(),
      },
      master_menu: app.state.master_menu,
      menu_hari_ini: app.buildSnapshot(app.state.menu_hari_ini, "hari_ini"),
      menu_besok: app.buildSnapshot(app.state.menu_besok, "besok"),
    };
  };

  app.downloadJson = function downloadJson(fileName, payload) {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  app.saveMainJson = function saveMainJson() {
    app.persist();
    app.downloadJson("menu.json", app.buildExportPayload());
    app.flash("success", "JSON terbaru berhasil dibuat. Ganti file data/menu.json lokal Anda lalu commit dan push.");
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

  app.renderThumb = function renderThumb(src, className) {
    if (!src) return `<span class="${className} thumb-placeholder">Foto</span>`;
    return `<img src="${app.escapeHtml(src)}" alt="" class="${className}">`;
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
