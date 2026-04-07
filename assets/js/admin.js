(function () {
  "use strict";

  const STORAGE_KEY = "rm_bu_jawa_admin_dashboard_v4";
  const SESSION_KEY = "rm_bu_jawa_admin_session";
  const LOGIN_USERNAME = "admin";
  const LOGIN_PASSWORD = "rmbujawa2026";
  const CATEGORIES = ["Menu Utama", "Menu Sayur", "Minuman", "Snack"];
  const PLACEHOLDER_IMAGE =
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

  let state = {
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

  let initialized = false;
  const selectedIds = new Set();

  document.addEventListener("DOMContentLoaded", async () => {
    bindLogin();
    if (!isLoggedIn()) {
      showLogin();
      return;
    }
    showDashboard();
    await initDashboard();
  });

  function bindLogin() {
    document.querySelector("#login-form")?.addEventListener("submit", onLogin);
    document.querySelector("#logout-button")?.addEventListener("click", onLogout);
  }

  function onLogin(event) {
    event.preventDefault();
    const username = (document.querySelector("#login-username")?.value || "").trim();
    const password = document.querySelector("#login-password")?.value || "";
    if (username === LOGIN_USERNAME && password === LOGIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "logged_in");
      clearLoginError();
      clearLoginForm();
      showDashboard();
      initDashboard();
      flash("success", "Login admin berhasil.");
      return;
    }
    setLoginError("Username atau password salah. Silakan periksa kembali.");
  }

  function onLogout() {
    sessionStorage.removeItem(SESSION_KEY);
    closeModal();
    showLogin();
    clearLoginForm();
    clearLoginError();
    flash("success", "Anda telah logout dari panel admin.");
  }

  function isLoggedIn() {
    return sessionStorage.getItem(SESSION_KEY) === "logged_in";
  }

  function showLogin() {
    document.querySelector("#login-screen")?.classList.remove("is-hidden");
    document.querySelector("#admin-shell")?.classList.add("is-hidden");
  }

  function showDashboard() {
    document.querySelector("#login-screen")?.classList.add("is-hidden");
    document.querySelector("#admin-shell")?.classList.remove("is-hidden");
  }

  async function initDashboard() {
    if (!initialized) {
      setupCategoryOptions();
      bindDashboard();
      await bootstrapState();
      initialized = true;
    }
    selectedIds.clear();
    renderDate();
    resetForm();
    closeModal();
    renderAll();
  }

  async function bootstrapState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      state = normalizePayload(JSON.parse(saved));
      return;
    }
    try {
      const response = await fetch("data/menu.json", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Gagal memuat data/menu.json");
      }
      state = normalizePayload(await response.json());
      persist();
      flash("success", "Data awal dimuat dari data/menu.json.");
    } catch (error) {
      state = createEmptyState();
      persist();
      flash("error", "Dashboard dimulai dari kondisi kosong.");
    }
  }

  function createEmptyState() {
    return {
      metadata: { ...state.metadata, generated_at: new Date().toISOString() },
      master_menu: [],
      menu_hari_ini: [],
      menu_besok: [],
    };
  }

  function normalizePayload(payload) {
    const base = createEmptyState();
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
      master_menu: masterSource.map(normalizeMenu).filter(Boolean),
      menu_hari_ini: normalizeSchedule(payload?.menu_hari_ini, payload?.menus, "hari_ini"),
      menu_besok: normalizeSchedule(payload?.menu_besok, payload?.menus, "besok"),
    };
  }

  function normalizeMenu(item) {
    if (!item || typeof item !== "object") {
      return null;
    }
    return {
      id: Number(item.id) || Date.now(),
      nama_menu: String(item.nama_menu || "").trim(),
      kategori: normalizeCategory(item.kategori),
      deskripsi: String(item.deskripsi || "").trim(),
      harga: Number(item.harga || 0),
      gambar: typeof item.gambar === "string" ? item.gambar : "",
      aktif: Boolean(item.aktif),
      status_ketersediaan: item.status_ketersediaan === "habis" ? "habis" : "tersedia",
    };
  }

  function normalizeSchedule(schedule, legacyMenus, type) {
    if (Array.isArray(schedule)) {
      return schedule.map((item) => (typeof item === "object" ? Number(item.id) : Number(item))).filter(validId);
    }
    if (Array.isArray(legacyMenus)) {
      return legacyMenus.filter((item) => item?.tipe_hari === type).map((item) => Number(item.id)).filter(validId);
    }
    return [];
  }

  function normalizeCategory(value) {
    const category = String(value || "").trim().toLowerCase();
    if (category === "menu utama" || category === "makanan") return "Menu Utama";
    if (category === "menu sayur" || category === "sayur") return "Menu Sayur";
    if (category === "minuman") return "Minuman";
    if (category === "snack" || category === "lauk tambahan" || category === "paket" || category === "lainnya") return "Snack";
    return "Menu Utama";
  }

  function validId(id) {
    return Number.isFinite(id) && id > 0;
  }

  function setupCategoryOptions() {
    const filter = document.querySelector("#filter-kategori");
    const form = document.querySelector("#menu-kategori");
    const options = CATEGORIES.map((category) => `<option value="${category}">${category}</option>`).join("");
    if (filter) filter.innerHTML = `<option value="">Semua kategori</option>${options}`;
    if (form) form.innerHTML = `<option value="">Pilih kategori</option>${options}`;
  }

  function bindDashboard() {
    document.querySelector("#master-search")?.addEventListener("input", renderMasterMenu);
    document.querySelector("#filter-kategori")?.addEventListener("change", renderMasterMenu);
    document.querySelector("#filter-aktif")?.addEventListener("change", renderMasterMenu);
    document.querySelector("#filter-ketersediaan")?.addEventListener("change", renderMasterMenu);

    document.querySelector("#open-create-modal")?.addEventListener("click", () => {
      resetForm();
      openModal();
    });
    document.querySelector("#close-modal-button")?.addEventListener("click", closeModal);
    document.querySelectorAll("[data-close-modal='true']").forEach((node) => node.addEventListener("click", closeModal));
    document.addEventListener("keydown", onEscape);

    document.querySelector("#menu-form")?.addEventListener("submit", onSubmitForm);
    document.querySelector("#reset-form-button")?.addEventListener("click", resetForm);
    document.querySelector("#menu-gambar-file")?.addEventListener("change", onImageChange);

    document.querySelector("#bulk-add-hari-ini")?.addEventListener("click", () => bulkAdd("hari_ini"));
    document.querySelector("#bulk-add-besok")?.addEventListener("click", () => bulkAdd("besok"));
    document.querySelector("#save-draft-button")?.addEventListener("click", saveDraft);
    document.querySelector("#download-json-button")?.addEventListener("click", saveMainJson);
    document.querySelector("#download-json-hari-ini-button")?.addEventListener("click", () => saveAndExport("menu-hari-ini.json", buildScheduleSnapshot("hari_ini"), "JSON Menu Hari Ini berhasil dibuat."));
    document.querySelector("#download-json-besok-mini-button")?.addEventListener("click", () => saveAndExport("menu-besok.json", buildScheduleSnapshot("besok"), "JSON Menu Besok berhasil dibuat."));
    document.querySelector("#reload-source-button")?.addEventListener("click", reloadFromSource);
    document.querySelector("#import-json-input")?.addEventListener("change", importJson);

    document.querySelector("#clear-hari-ini")?.addEventListener("click", clearToday);
    document.querySelector("#save-hari-ini")?.addEventListener("click", saveMainJson);
    document.querySelector("#clear-besok")?.addEventListener("click", clearTomorrow);
    document.querySelector("#save-besok")?.addEventListener("click", saveMainJson);
    document.querySelector("#copy-hari-ini-ke-besok")?.addEventListener("click", copyTodayToTomorrow);
    document.querySelector("#promote-button")?.addEventListener("click", promoteTomorrow);

    document.addEventListener("click", (event) => {
      if (event.target instanceof HTMLElement && event.target.id === "empty-add-button") {
        resetForm();
        openModal();
      }
    });
  }

  function renderAll() {
    persist();
    renderDate();
    renderSummary();
    renderMasterMenu();
    renderSchedule("hari_ini");
    renderSchedule("besok");
    renderJsonInfo();
    renderJsonPreview();
  }

  function renderDate() {
    const formatter = new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    setText("#today-label", formatter.format(new Date()));
  }

  function renderSummary() {
    setText("#summary-master", String(state.master_menu.length));
    setText("#summary-hari-ini", String(state.menu_hari_ini.length));
    setText("#summary-besok", String(state.menu_besok.length));
    setText("#summary-aktif", String(state.master_menu.filter((item) => item.aktif).length));
    setText("#summary-habis", String(state.master_menu.filter((item) => item.status_ketersediaan === "habis").length));
  }

  function renderMasterMenu() {
    const target = document.querySelector("#master-grid");
    if (!target) return;

    const search = (document.querySelector("#master-search")?.value || "").trim().toLowerCase();
    const kategori = document.querySelector("#filter-kategori")?.value || "";
    const aktif = document.querySelector("#filter-aktif")?.value || "";
    const ketersediaan = document.querySelector("#filter-ketersediaan")?.value || "";

    const filtered = state.master_menu.filter((menu) => {
      const matchesSearch = !search || menu.nama_menu.toLowerCase().includes(search) || menu.deskripsi.toLowerCase().includes(search);
      const matchesKategori = !kategori || menu.kategori === kategori;
      const matchesAktif = !aktif || (aktif === "aktif" ? menu.aktif : !menu.aktif);
      const matchesKetersediaan = !ketersediaan || menu.status_ketersediaan === ketersediaan;
      return matchesSearch && matchesKategori && matchesAktif && matchesKetersediaan;
    });

    if (!state.master_menu.length) {
      target.innerHTML = renderEmpty("Belum ada menu", "Silakan tambahkan menu baru untuk memulai.", true);
      return;
    }

    target.innerHTML = CATEGORIES.map((category) => renderCategory(category, filtered)).join("");
    target.querySelectorAll("[data-master-action]").forEach((button) => button.addEventListener("click", handleMasterAction));
    target.querySelectorAll("[data-master-select]").forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        const id = Number(checkbox.dataset.masterSelect);
        if (checkbox.checked) selectedIds.add(id);
        else selectedIds.delete(id);
      });
    });
  }

  function renderCategory(category, items) {
    const categoryItems = items.filter((item) => item.kategori === category).sort((a, b) => a.nama_menu.localeCompare(b.nama_menu));
    return `
      <section class="category-block">
        <div class="category-head">
          <div>
            <h4>${escapeHtml(category)}</h4>
            <p>${categoryItems.length ? `${categoryItems.length} menu tersedia di kategori ini.` : "Belum ada menu di kategori ini."}</p>
          </div>
        </div>
        <div class="list-shell master-list-shell">
          <div class="list-header master-list-header">
            <div>Menu</div>
            <div>Harga</div>
            <div>Status</div>
            <div>Penjadwalan</div>
            <div>Aksi</div>
          </div>
          <div class="master-list">
            ${categoryItems.length ? categoryItems.map(renderMasterRow).join("") : renderSmallEmpty("Belum ada menu di kategori ini.")}
          </div>
        </div>
      </section>
    `;
  }

  function renderMasterRow(menu) {
    const selected = selectedIds.has(menu.id);
    const inToday = state.menu_hari_ini.includes(menu.id);
    const inTomorrow = state.menu_besok.includes(menu.id);
    return `
      <article class="master-row ${selected ? "is-selected" : ""}">
        <div class="master-row-menu">
          <label class="checkbox-chip compact-checkbox" aria-label="Pilih ${escapeHtml(menu.nama_menu)}">
            <input type="checkbox" data-master-select="${menu.id}" ${selected ? "checked" : ""}>
          </label>
          ${renderThumb(menu.gambar, "master-row-thumb")}
          <div class="master-row-copy">
            <h4>${escapeHtml(menu.nama_menu)}</h4>
            <p>${escapeHtml(truncate(menu.deskripsi || "Belum ada deskripsi menu.", 84))}</p>
          </div>
        </div>
        <div class="master-row-price"><strong>${formatRupiah(menu.harga)}</strong></div>
        <div class="master-row-status">
          <span class="soft-badge ${menu.aktif ? "is-success" : "is-neutral"}">${menu.aktif ? "Aktif" : "Nonaktif"}</span>
          <span class="soft-badge ${menu.status_ketersediaan === "habis" ? "is-danger" : "is-success"}">${menu.status_ketersediaan === "habis" ? "Habis" : "Tersedia"}</span>
        </div>
        <div class="master-row-schedule">
          ${inToday ? '<span class="soft-badge badge-outline-info">Hari Ini</span>' : ""}
          ${inTomorrow ? '<span class="soft-badge badge-outline-warning">Besok</span>' : ""}
          ${!inToday && !inTomorrow ? '<span class="soft-badge is-neutral">Belum dijadwalkan</span>' : ""}
        </div>
        <div class="master-row-actions">
          <button type="button" class="action-chip action-primary" data-master-action="add-today" data-id="${menu.id}">Hari Ini</button>
          <button type="button" class="action-chip action-warning" data-master-action="add-tomorrow" data-id="${menu.id}">Besok</button>
          <button type="button" class="action-chip" data-master-action="edit" data-id="${menu.id}">Edit</button>
          <button type="button" class="action-chip" data-master-action="toggle-active" data-id="${menu.id}">${menu.aktif ? "Nonaktifkan" : "Aktifkan"}</button>
          <button type="button" class="action-chip" data-master-action="toggle-availability" data-id="${menu.id}">${menu.status_ketersediaan === "habis" ? "Tandai Tersedia" : "Tandai Habis"}</button>
          <button type="button" class="action-chip action-danger" data-master-action="delete" data-id="${menu.id}">Hapus</button>
        </div>
      </article>
    `;
  }

  function handleMasterAction(event) {
    const action = event.currentTarget.dataset.masterAction;
    const id = Number(event.currentTarget.dataset.id);
    const menu = findMaster(id);
    if (!menu) return;

    if (action === "edit") {
      fillForm(menu);
      openModal();
      return;
    }
    if (action === "delete") {
      if (!window.confirm(`Hapus menu "${menu.nama_menu}" dari Master Menu?`)) return;
      state.master_menu = state.master_menu.filter((item) => item.id !== id);
      state.menu_hari_ini = state.menu_hari_ini.filter((item) => item !== id);
      state.menu_besok = state.menu_besok.filter((item) => item !== id);
      selectedIds.delete(id);
      flash("success", "Menu berhasil dihapus dari Master Menu.");
      renderAll();
      return;
    }
    if (action === "toggle-active") {
      menu.aktif = !menu.aktif;
      flash("success", `Status aktif ${menu.nama_menu} diperbarui.`);
      renderAll();
      return;
    }
    if (action === "toggle-availability") {
      menu.status_ketersediaan = menu.status_ketersediaan === "habis" ? "tersedia" : "habis";
      flash("success", `Status ketersediaan ${menu.nama_menu} diperbarui.`);
      renderAll();
      return;
    }
    if (action === "add-today") {
      addToSchedule(id, "hari_ini");
      return;
    }
    if (action === "add-tomorrow") {
      addToSchedule(id, "besok");
    }
  }

  function addToSchedule(id, target) {
    const key = target === "hari_ini" ? "menu_hari_ini" : "menu_besok";
    const label = target === "hari_ini" ? "Menu Hari Ini" : "Menu Besok";
    if (state[key].includes(id)) {
      flash("error", `Menu sudah ada di ${label}.`);
      return;
    }
    state[key].push(id);
    flash("success", `Menu berhasil ditambahkan ke ${label}.`);
    renderAll();
  }

  function bulkAdd(target) {
    if (!selectedIds.size) {
      flash("error", "Pilih minimal satu menu terlebih dahulu.");
      return;
    }
    const key = target === "hari_ini" ? "menu_hari_ini" : "menu_besok";
    let added = 0;
    Array.from(selectedIds).forEach((id) => {
      if (!state[key].includes(id)) {
        state[key].push(id);
        added += 1;
      }
    });
    flash(added ? "success" : "error", added ? `${added} menu berhasil ditambahkan.` : "Semua menu terpilih sudah ada di daftar tujuan.");
    renderAll();
  }

  function renderSchedule(target) {
    const selector = target === "hari_ini" ? "#hari-ini-list" : "#besok-list";
    const list = document.querySelector(selector);
    if (!list) return;

    const ids = target === "hari_ini" ? state.menu_hari_ini : state.menu_besok;
    const items = ids.map((id) => findMaster(id)).filter(Boolean);
    if (!items.length) {
      list.innerHTML = renderEmpty(
        target === "hari_ini" ? "Menu Hari Ini masih kosong" : "Menu Besok masih kosong",
        target === "hari_ini" ? "Pilih menu dari Master Menu untuk mulai menyusun menu hari ini." : "Tambahkan menu dari Master Menu atau copy dari Menu Hari Ini.",
        false
      );
      return;
    }

    list.innerHTML = items.map((menu, index) => renderScheduleRow(menu, target, index, items.length)).join("");
    list.querySelectorAll("[data-schedule-action]").forEach((button) => button.addEventListener("click", handleScheduleAction));
  }

  function renderScheduleRow(menu, target, index, length) {
    return `
      <article class="schedule-row">
        <div class="schedule-row-menu">
          ${renderThumb(menu.gambar, "schedule-row-thumb")}
          <div class="schedule-row-copy">
            <h4>${escapeHtml(menu.nama_menu)}</h4>
            <p>${escapeHtml(menu.kategori)} | ${formatRupiah(menu.harga)}</p>
          </div>
        </div>
        <div class="schedule-row-status">
          <span class="soft-badge ${menu.aktif ? "is-success" : "is-neutral"}">${menu.aktif ? "Aktif" : "Nonaktif"}</span>
          <span class="soft-badge ${menu.status_ketersediaan === "habis" ? "is-danger" : "is-success"}">${menu.status_ketersediaan === "habis" ? "Habis" : "Tersedia"}</span>
        </div>
        <div class="schedule-row-order">
          <button type="button" class="action-chip action-order" data-schedule-action="move-up" data-target="${target}" data-id="${menu.id}" ${index === 0 ? "disabled" : ""}>Naik</button>
          <button type="button" class="action-chip action-order" data-schedule-action="move-down" data-target="${target}" data-id="${menu.id}" ${index === length - 1 ? "disabled" : ""}>Turun</button>
        </div>
        <div class="schedule-row-actions">
          <button type="button" class="action-chip" data-schedule-action="toggle-availability" data-target="${target}" data-id="${menu.id}">${menu.status_ketersediaan === "habis" ? "Tandai Tersedia" : "Tandai Habis"}</button>
          <button type="button" class="action-chip" data-schedule-action="toggle-active" data-target="${target}" data-id="${menu.id}">${menu.aktif ? "Nonaktifkan" : "Aktifkan"}</button>
          <button type="button" class="action-chip action-danger" data-schedule-action="remove" data-target="${target}" data-id="${menu.id}">Hapus</button>
        </div>
      </article>
    `;
  }

  function handleScheduleAction(event) {
    const action = event.currentTarget.dataset.scheduleAction;
    const target = event.currentTarget.dataset.target;
    const id = Number(event.currentTarget.dataset.id);
    const menu = findMaster(id);
    if (!menu) return;

    const key = target === "hari_ini" ? "menu_hari_ini" : "menu_besok";
    if (action === "toggle-availability") {
      menu.status_ketersediaan = menu.status_ketersediaan === "habis" ? "tersedia" : "habis";
      flash("success", `Status ${menu.nama_menu} diperbarui.`);
    }
    if (action === "toggle-active") {
      menu.aktif = !menu.aktif;
      flash("success", `Status aktif ${menu.nama_menu} diperbarui.`);
    }
    if (action === "remove") {
      state[key] = state[key].filter((item) => item !== id);
      flash("success", `${menu.nama_menu} dihapus dari ${target === "hari_ini" ? "Menu Hari Ini" : "Menu Besok"}.`);
    }
    if (action === "move-up" || action === "move-down") {
      reorder(key, id, action === "move-up" ? -1 : 1);
    }
    renderAll();
  }

  function reorder(key, id, delta) {
    const currentIndex = state[key].indexOf(id);
    const nextIndex = currentIndex + delta;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= state[key].length) return;
    const copy = [...state[key]];
    [copy[currentIndex], copy[nextIndex]] = [copy[nextIndex], copy[currentIndex]];
    state[key] = copy;
    flash("success", "Urutan menu berhasil diperbarui.");
  }

  function onSubmitForm(event) {
    event.preventDefault();
    const id = Number(document.querySelector("#menu-id")?.value || 0);
    const item = {
      id: id || nextId(),
      nama_menu: (document.querySelector("#menu-nama")?.value || "").trim(),
      kategori: document.querySelector("#menu-kategori")?.value || "",
      deskripsi: (document.querySelector("#menu-deskripsi")?.value || "").trim(),
      harga: Number(document.querySelector("#menu-harga")?.value || 0),
      gambar: (document.querySelector("#menu-gambar-data")?.value || "").trim(),
      aktif: Boolean(document.querySelector("#menu-aktif")?.checked),
      status_ketersediaan: document.querySelector("#menu-status")?.value || "tersedia",
    };
    const quickAdd = document.querySelector("#menu-quick-add")?.value || "";

    if (!item.nama_menu || !item.kategori || item.harga <= 0) {
      flash("error", "Nama menu, kategori, dan harga wajib diisi dengan benar.");
      return;
    }

    const existingIndex = state.master_menu.findIndex((menu) => menu.id === item.id);
    if (existingIndex >= 0) {
      state.master_menu[existingIndex] = item;
      flash("success", "Menu berhasil diperbarui.");
    } else {
      state.master_menu.push(item);
      flash("success", "Menu baru berhasil ditambahkan.");
    }

    if (quickAdd) {
      const key = quickAdd === "hari_ini" ? "menu_hari_ini" : "menu_besok";
      if (!state[key].includes(item.id)) {
        state[key].push(item.id);
      }
    }

    closeModal();
    resetForm();
    renderAll();
  }

  function fillForm(menu) {
    setValue("#menu-id", String(menu.id));
    setValue("#menu-nama", menu.nama_menu);
    setValue("#menu-kategori", menu.kategori);
    setValue("#menu-deskripsi", menu.deskripsi || "");
    setValue("#menu-harga", String(menu.harga));
    setValue("#menu-gambar-data", menu.gambar || "");
    setValue("#menu-status", menu.status_ketersediaan);
    setValue("#menu-quick-add", "");
    const checkbox = document.querySelector("#menu-aktif");
    if (checkbox) checkbox.checked = Boolean(menu.aktif);
    renderImagePreview(menu.gambar || "");
    setText("#menu-form-title", "Edit menu");
    setText("#menu-submit-label", "Simpan Perubahan");
  }

  function resetForm() {
    setValue("#menu-id", "");
    setValue("#menu-nama", "");
    setValue("#menu-kategori", "");
    setValue("#menu-deskripsi", "");
    setValue("#menu-harga", "");
    setValue("#menu-gambar-data", "");
    setValue("#menu-status", "tersedia");
    setValue("#menu-quick-add", "");
    const checkbox = document.querySelector("#menu-aktif");
    if (checkbox) checkbox.checked = true;
    const fileInput = document.querySelector("#menu-gambar-file");
    if (fileInput) fileInput.value = "";
    renderImagePreview("");
    setText("#menu-form-title", "Tambah menu baru");
    setText("#menu-submit-label", "Simpan Menu");
  }

  function openModal() {
    const shell = document.querySelector("#menu-modal-shell");
    shell?.classList.remove("is-hidden");
    shell?.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    window.setTimeout(() => document.querySelector("#menu-nama")?.focus(), 20);
  }

  function closeModal() {
    const shell = document.querySelector("#menu-modal-shell");
    shell?.classList.add("is-hidden");
    shell?.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  function onEscape(event) {
    const open = document.querySelector("#menu-modal-shell") && !document.querySelector("#menu-modal-shell").classList.contains("is-hidden");
    if (event.key === "Escape" && open) {
      closeModal();
    }
  }

  function onImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) {
      setValue("#menu-gambar-data", "");
      renderImagePreview("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      setValue("#menu-gambar-data", result);
      renderImagePreview(result);
      flash("success", "Gambar menu berhasil dimuat ke draft.");
    };
    reader.readAsDataURL(file);
  }

  function renderImagePreview(src) {
    const image = document.querySelector("#menu-image-preview");
    const note = document.querySelector("#menu-image-note");
    if (!image) return;
    image.src = src || PLACEHOLDER_IMAGE;
    image.dataset.empty = src ? "false" : "true";
    if (note) note.textContent = src ? "Preview gambar menu yang akan disimpan." : "Belum ada gambar dipilih.";
  }

  function clearToday() {
    if (!state.menu_hari_ini.length) {
      flash("error", "Menu Hari Ini sudah kosong.");
      return;
    }
    if (!window.confirm("Kosongkan seluruh daftar Menu Hari Ini?")) return;
    state.menu_hari_ini = [];
    renderAll();
    flash("success", "Menu Hari Ini berhasil dikosongkan.");
  }

  function clearTomorrow() {
    if (!state.menu_besok.length) {
      flash("error", "Menu Besok sudah kosong.");
      return;
    }
    if (!window.confirm("Kosongkan seluruh daftar Menu Besok?")) return;
    state.menu_besok = [];
    renderAll();
    flash("success", "Menu Besok berhasil dikosongkan.");
  }

  function copyTodayToTomorrow() {
    if (!state.menu_hari_ini.length) {
      flash("error", "Menu Hari Ini masih kosong.");
      return;
    }
    if (state.menu_besok.length && !window.confirm("Isi Menu Besok saat ini akan diganti dengan salinan Menu Hari Ini. Lanjutkan?")) return;
    state.menu_besok = [...state.menu_hari_ini];
    renderAll();
    flash("success", "Menu Hari Ini berhasil disalin ke Menu Besok.");
  }

  function promoteTomorrow() {
    if (!state.menu_besok.length) {
      flash("error", "Menu Besok masih kosong.");
      return;
    }
    if (!window.confirm("Gunakan seluruh Menu Besok sebagai Menu Hari Ini? Menu Besok akan dikosongkan setelah proses selesai.")) return;
    state.menu_hari_ini = [...state.menu_besok];
    state.menu_besok = [];
    renderAll();
    flash("success", "Menu Besok berhasil dipindahkan menjadi Menu Hari Ini.");
  }

  async function reloadFromSource() {
    if (!window.confirm("Muat ulang data dari data/menu.json? Draft lokal saat ini akan diganti.")) return;
    localStorage.removeItem(STORAGE_KEY);
    await bootstrapState();
    selectedIds.clear();
    resetForm();
    renderAll();
    flash("success", "Data berhasil dimuat ulang dari data/menu.json.");
  }

  function importJson(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        state = normalizePayload(JSON.parse(String(reader.result || "")));
        selectedIds.clear();
        resetForm();
        renderAll();
        flash("success", "File JSON berhasil diimpor.");
      } catch (error) {
        flash("error", "File JSON tidak valid.");
      }
    };
    reader.readAsText(file);
  }

  function saveDraft() {
    persist();
    renderJsonPreview();
    flash("success", "Draft lokal berhasil diperbarui.");
  }

  function saveMainJson() {
    saveAndExport("menu.json", buildExportPayload(), "JSON terbaru berhasil dibuat. Ganti file data/menu.json lokal Anda lalu commit dan push.");
  }

  function saveAndExport(fileName, payload, message) {
    persist();
    renderJsonPreview();
    downloadJson(fileName, payload);
    flash("success", message);
  }

  function renderJsonInfo() {
    setText(
      "#json-info",
      `Semua perubahan tersimpan sebagai draft lokal. Klik Simpan untuk mengunduh JSON terbaru, lalu ganti file data/menu.json di project lokal dan commit melalui GitHub Desktop. Master Menu ${state.master_menu.length} item, Hari Ini ${state.menu_hari_ini.length} item, Besok ${state.menu_besok.length} item.`
    );
  }

  function renderJsonPreview() {
    const preview = document.querySelector("#json-preview-output");
    if (preview) preview.textContent = JSON.stringify(buildExportPayload(), null, 2);
  }

  function buildExportPayload() {
    return {
      metadata: {
        ...state.metadata,
        generated_at: new Date().toISOString(),
      },
      master_menu: state.master_menu,
      menu_hari_ini: buildSnapshot(state.menu_hari_ini, "hari_ini"),
      menu_besok: buildSnapshot(state.menu_besok, "besok"),
    };
  }

  function buildScheduleSnapshot(target) {
    return {
      metadata: {
        ...state.metadata,
        generated_at: new Date().toISOString(),
        tipe_hari: target,
      },
      menus: buildSnapshot(target === "hari_ini" ? state.menu_hari_ini : state.menu_besok, target),
    };
  }

  function buildSnapshot(ids, type) {
    return ids
      .map((id) => findMaster(id))
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
  }

  function persist() {
    state.metadata.generated_at = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function findMaster(id) {
    return state.master_menu.find((item) => Number(item.id) === Number(id)) || null;
  }

  function nextId() {
    return state.master_menu.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
  }

  function renderThumb(src, className) {
    if (!src) return `<span class="${className} thumb-placeholder">Foto</span>`;
    return `<img src="${escapeHtml(src)}" alt="" class="${className}">`;
  }

  function renderEmpty(title, description, withButton) {
    return `
      <div class="schedule-empty empty-state-rich">
        <i class="bi bi-journal-plus"></i>
        <h4>${escapeHtml(title)}</h4>
        <p>${escapeHtml(description)}</p>
        ${withButton ? '<button type="button" class="btn btn-primary-custom empty-action" id="empty-add-button">Tambah Menu Baru</button>' : ""}
      </div>
    `;
  }

  function renderSmallEmpty(text) {
    return `
      <div class="small-empty-state">
        <i class="bi bi-inbox"></i>
        <p>${escapeHtml(text)}</p>
      </div>
    `;
  }

  function downloadJson(fileName, payload) {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  function setLoginError(message) {
    const target = document.querySelector("#login-error");
    if (target) target.textContent = message;
  }

  function clearLoginError() {
    setLoginError("");
  }

  function clearLoginForm() {
    setValue("#login-username", "");
    setValue("#login-password", "");
  }

  function setText(selector, value) {
    const element = document.querySelector(selector);
    if (element) element.textContent = value;
  }

  function setValue(selector, value) {
    const element = document.querySelector(selector);
    if (element) element.value = value;
  }

  function formatRupiah(value) {
    return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
  }

  function truncate(value, maxLength) {
    const text = String(value || "").trim();
    if (text.length <= maxLength) return text;
    return `${text.slice(0, Math.max(0, maxLength - 1)).trim()}...`;
  }

  function flash(type, message) {
    let node = document.querySelector("#floating-flash");
    if (!node) {
      node = document.createElement("div");
      node.id = "floating-flash";
      node.className = "floating-flash";
      document.body.appendChild(node);
    }
    node.className = `floating-flash ${type === "error" ? "flash-error" : "flash-success"}`;
    node.textContent = message;
    window.clearTimeout(flash.timer);
    flash.timer = window.setTimeout(() => node.remove(), 3200);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
