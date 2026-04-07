(function () {
  "use strict";

  const STORAGE_KEY = "rm_bu_jawa_admin_dashboard_v3";
  const SESSION_KEY = "rm_bu_jawa_admin_session";
  const LOGIN_USERNAME = "admin";
  const LOGIN_PASSWORD = "rmbujawa2026";
  const CATEGORIES = ["Makanan", "Minuman", "Lauk Tambahan", "Paket", "Lainnya"];
  const DEFAULT_IMAGE = "assets/img/about.jpg";

  const seedMasterMenu = [
    createMasterMenu(1, "Nasi Gudeg", "Makanan", "Gudeg manis gurih dengan sambal krecek dan telur, cocok untuk makan siang keluarga.", 22000, "assets/img/menu/cake.jpg", true, "tersedia"),
    createMasterMenu(2, "Ayam Goreng", "Lauk Tambahan", "Ayam goreng bumbu kuning khas rumahan dengan tekstur empuk dan rasa meresap.", 18000, "assets/img/menu/tuscan-grilled.jpg", true, "tersedia"),
    createMasterMenu(3, "Sayur Lodeh", "Makanan", "Sayur lodeh santan hangat dengan isian sayuran segar dan rasa khas dapur Jawa.", 16000, "assets/img/menu/greek-salad.jpg", true, "tersedia"),
    createMasterMenu(4, "Tempe Orek", "Lauk Tambahan", "Tempe orek manis pedas yang renyah dan cocok sebagai pelengkap berbagai lauk.", 9000, "assets/img/menu/bread-barrel.jpg", true, "tersedia"),
    createMasterMenu(5, "Sambal Terasi", "Lauk Tambahan", "Sambal terasi segar dengan rasa pedas mantap untuk menemani lauk utama.", 7000, "assets/img/menu/lobster-bisque.jpg", true, "tersedia"),
    createMasterMenu(6, "Es Teh Manis", "Minuman", "Es teh manis segar yang pas untuk menemani hidangan rumahan sepanjang hari.", 6000, "assets/img/menu/mozzarella.jpg", true, "tersedia"),
    createMasterMenu(7, "Teh Hangat", "Minuman", "Teh hangat klasik yang nyaman dinikmati bersama menu sarapan atau makan malam.", 5000, "assets/img/menu/spinach-salad.jpg", true, "tersedia"),
    createMasterMenu(8, "Jeruk Es", "Minuman", "Minuman jeruk segar dengan rasa manis asam yang ringan dan menyegarkan.", 8000, "assets/img/menu/caesar.jpg", true, "tersedia"),
  ];

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

  let adminInitialized = false;
  const selectedMasterIds = new Set();

  document.addEventListener("DOMContentLoaded", async () => {
    setupLogin();
    if (!isLoggedIn()) {
      showLoginScreen();
      return;
    }

    showDashboard();
    await initializeDashboard();
  });

  function createMasterMenu(id, nama_menu, kategori, deskripsi, harga, gambar, aktif, status_ketersediaan) {
    return { id, nama_menu, kategori, deskripsi, harga, gambar, aktif, status_ketersediaan };
  }

  function setupLogin() {
    document.querySelector("#login-form")?.addEventListener("submit", handleLoginSubmit);
    document.querySelector("#logout-button")?.addEventListener("click", handleLogout);
  }

  function handleLoginSubmit(event) {
    event.preventDefault();
    const username = (document.querySelector("#login-username")?.value || "").trim();
    const password = document.querySelector("#login-password")?.value || "";

    if (username === LOGIN_USERNAME && password === LOGIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "logged_in");
      clearLoginError();
      clearLoginForm();
      showDashboard();
      initializeDashboard();
      showFlash("success", "Login admin berhasil.");
      return;
    }

    setLoginError("Username atau password salah. Silakan periksa kembali.");
  }

  function handleLogout() {
    sessionStorage.removeItem(SESSION_KEY);
    showLoginScreen();
    clearLoginForm();
    clearLoginError();
    showFlash("success", "Anda telah logout dari panel admin.");
  }

  function isLoggedIn() {
    return sessionStorage.getItem(SESSION_KEY) === "logged_in";
  }

  function showLoginScreen() {
    document.querySelector("#login-screen")?.classList.remove("is-hidden");
    document.querySelector("#admin-shell")?.classList.add("is-hidden");
  }

  function showDashboard() {
    document.querySelector("#login-screen")?.classList.add("is-hidden");
    document.querySelector("#admin-shell")?.classList.remove("is-hidden");
  }

  async function initializeDashboard() {
    if (!adminInitialized) {
      setupCategoryOptions();
      setupDashboardListeners();
      await bootstrapState();
      adminInitialized = true;
    }

    selectedMasterIds.clear();
    renderTodayLabel();
    closeModal();
    resetForm();
    renderAll();
  }

  async function bootstrapState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      state = JSON.parse(saved);
      return;
    }

    try {
      const response = await fetch("data/menu.json", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Gagal memuat data/menu.json");
      }
      const payload = await response.json();
      state = normalizeImportedData(payload);
      persistState();
      showFlash("success", "Data awal dimuat dari data/menu.json.");
    } catch (error) {
      state = createSeedState();
      persistState();
      showFlash("error", "data/menu.json belum bisa dibaca. Draft contoh digunakan sebagai fallback.");
    }
  }

  function createSeedState() {
    return {
      metadata: {
        nama_usaha: "Rumah Makan Bu Jawa",
        telepon: "0895-4057-18033",
        jam_buka: "Setiap hari, pukul 09.00 sampai 21.00 WIB",
        maps: "https://maps.app.goo.gl/XNuEpTYSbn5omncMA",
        generated_at: new Date().toISOString(),
      },
      master_menu: JSON.parse(JSON.stringify(seedMasterMenu)),
      menu_hari_ini: [1, 2, 3, 4, 5, 6],
      menu_besok: [7, 8],
    };
  }

  function normalizeImportedData(payload) {
    if (payload.master_menu && payload.menu_hari_ini && payload.menu_besok) {
      return {
        metadata: {
          ...createSeedState().metadata,
          ...(payload.metadata || {}),
          generated_at: payload.metadata?.generated_at || payload.generated_at || new Date().toISOString(),
        },
        master_menu: Array.isArray(payload.master_menu) ? payload.master_menu : [],
        menu_hari_ini: normalizeScheduleArray(payload.menu_hari_ini),
        menu_besok: normalizeScheduleArray(payload.menu_besok),
      };
    }

    const flatMenus = Array.isArray(payload?.menus) ? payload.menus : Array.isArray(payload) ? payload : [];
    const master_menu = flatMenus.map((menu) => ({
      id: Number(menu.id),
      nama_menu: menu.nama_menu,
      kategori: menu.kategori,
      deskripsi: menu.deskripsi || "",
      harga: Number(menu.harga || 0),
      gambar: menu.gambar || DEFAULT_IMAGE,
      aktif: Boolean(menu.aktif),
      status_ketersediaan: menu.status_ketersediaan || "tersedia",
    }));

    return {
      metadata: {
        ...createSeedState().metadata,
        generated_at: payload.generated_at || new Date().toISOString(),
      },
      master_menu,
      menu_hari_ini: master_menu.filter((menu) => flatMenus.find((item) => Number(item.id) === menu.id)?.tipe_hari === "hari_ini").map((menu) => menu.id),
      menu_besok: master_menu.filter((menu) => flatMenus.find((item) => Number(item.id) === menu.id)?.tipe_hari === "besok").map((menu) => menu.id),
    };
  }

  function normalizeScheduleArray(items) {
    return (Array.isArray(items) ? items : [])
      .map((item) => (typeof item === "object" ? Number(item.id) : Number(item)))
      .filter((id) => Number.isFinite(id) && id > 0);
  }

  function setupCategoryOptions() {
    const filter = document.querySelector("#filter-kategori");
    const form = document.querySelector("#menu-kategori");

    if (filter) {
      filter.innerHTML = `<option value="">Semua kategori</option>${CATEGORIES.map((category) => `<option value="${category}">${category}</option>`).join("")}`;
    }

    if (form) {
      form.innerHTML = `<option value="">Pilih kategori</option>${CATEGORIES.map((category) => `<option value="${category}">${category}</option>`).join("")}`;
    }
  }

  function setupDashboardListeners() {
    document.querySelector("#master-search")?.addEventListener("input", renderMasterMenu);
    document.querySelector("#filter-kategori")?.addEventListener("change", renderMasterMenu);
    document.querySelector("#filter-aktif")?.addEventListener("change", renderMasterMenu);
    document.querySelector("#filter-ketersediaan")?.addEventListener("change", renderMasterMenu);

    document.querySelector("#open-create-modal")?.addEventListener("click", () => {
      resetForm();
      openModal();
    });
    document.querySelector("#close-modal-button")?.addEventListener("click", closeModal);
    document.querySelectorAll("[data-close-modal='true']").forEach((element) => {
      element.addEventListener("click", closeModal);
    });

    document.querySelector("#menu-form")?.addEventListener("submit", handleFormSubmit);
    document.querySelector("#reset-form-button")?.addEventListener("click", resetForm);
    document.querySelector("#menu-gambar-file")?.addEventListener("change", handleImageUpload);

    document.querySelector("#bulk-add-hari-ini")?.addEventListener("click", () => bulkAddToSchedule("hari_ini"));
    document.querySelector("#bulk-add-besok")?.addEventListener("click", () => bulkAddToSchedule("besok"));
    document.querySelector("#promote-button")?.addEventListener("click", promoteBesokToHariIni);
    document.querySelector("#reset-besok-button")?.addEventListener("click", resetBesok);
    document.querySelector("#clear-hari-ini")?.addEventListener("click", clearHariIni);

    document.querySelector("#save-draft-button")?.addEventListener("click", () => {
      persistState();
      showFlash("success", "Draft dashboard berhasil disimpan di browser.");
    });
    document.querySelector("#download-json-button")?.addEventListener("click", () => downloadJson("menu.json", buildExportPayload()));
    document.querySelector("#download-json-hari-ini-button")?.addEventListener("click", () => downloadJson("menu-hari-ini.json", buildScheduleSnapshot("hari_ini")));
    document.querySelector("#download-json-besok-button")?.addEventListener("click", () => downloadJson("menu-besok.json", buildScheduleSnapshot("besok")));
    document.querySelector("#download-json-besok-mini-button")?.addEventListener("click", () => downloadJson("menu-besok.json", buildScheduleSnapshot("besok")));
    document.querySelector("#import-json-input")?.addEventListener("change", handleImportJson);
    document.querySelector("#reload-source-button")?.addEventListener("click", reloadFromSource);
  }

  function renderAll() {
    persistState();
    renderSummary();
    renderMasterMenu();
    renderScheduleBoard("hari_ini");
    renderScheduleBoard("besok");
    renderJsonInfo();
    renderJsonPreview();
  }

  function renderTodayLabel() {
    const formatter = new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    setText("#today-label", formatter.format(new Date()));
  }

  function renderSummary() {
    const aktifCount = state.master_menu.filter((menu) => menu.aktif).length;
    const habisCount = state.master_menu.filter((menu) => menu.status_ketersediaan === "habis").length;
    setText("#summary-master", String(state.master_menu.length));
    setText("#summary-hari-ini", String(state.menu_hari_ini.length));
    setText("#summary-besok", String(state.menu_besok.length));
    setText("#summary-aktif", String(aktifCount));
    setText("#summary-habis", String(habisCount));
  }

  function renderMasterMenu() {
    const target = document.querySelector("#master-grid");
    if (!target) {
      return;
    }

    const search = (document.querySelector("#master-search")?.value || "").trim().toLowerCase();
    const kategori = document.querySelector("#filter-kategori")?.value || "";
    const aktif = document.querySelector("#filter-aktif")?.value || "";
    const ketersediaan = document.querySelector("#filter-ketersediaan")?.value || "";

    const filtered = state.master_menu.filter((menu) => {
      const matchesSearch = !search || menu.nama_menu.toLowerCase().includes(search) || (menu.deskripsi || "").toLowerCase().includes(search);
      const matchesKategori = !kategori || menu.kategori === kategori;
      const matchesAktif = !aktif || (aktif === "aktif" ? menu.aktif : !menu.aktif);
      const matchesKetersediaan = !ketersediaan || menu.status_ketersediaan === ketersediaan;
      return matchesSearch && matchesKategori && matchesAktif && matchesKetersediaan;
    });

    if (!filtered.length) {
      target.innerHTML = `
        <div class="master-empty">
          <i class="bi bi-basket"></i>
          <h3>Belum ada menu yang cocok</h3>
          <p>Coba ubah filter, atau tambahkan menu baru ke Master Menu.</p>
        </div>
      `;
      return;
    }

    target.innerHTML = filtered
      .sort((a, b) => a.nama_menu.localeCompare(b.nama_menu))
      .map((menu) => renderMasterRow(menu))
      .join("");

    target.querySelectorAll("[data-master-action]").forEach((button) => {
      button.addEventListener("click", handleMasterAction);
    });

    target.querySelectorAll("[data-master-select]").forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        const id = Number(checkbox.dataset.masterSelect);
        if (checkbox.checked) {
          selectedMasterIds.add(id);
        } else {
          selectedMasterIds.delete(id);
        }
      });
    });
  }

  function renderMasterRow(menu) {
    const selected = selectedMasterIds.has(menu.id);
    const inToday = state.menu_hari_ini.includes(menu.id);
    const inTomorrow = state.menu_besok.includes(menu.id);
    const shortDescription = truncateText(menu.deskripsi || "Belum ada deskripsi menu.", 92);

    return `
      <article class="master-row ${selected ? "is-selected" : ""}">
        <div class="master-row-menu">
          <label class="checkbox-chip compact-checkbox" aria-label="Pilih ${escapeHtml(menu.nama_menu)}">
            <input type="checkbox" data-master-select="${menu.id}" ${selected ? "checked" : ""}>
          </label>
          <img src="${escapeHtml(menu.gambar || DEFAULT_IMAGE)}" alt="${escapeHtml(menu.nama_menu)}" class="master-row-thumb">
          <div class="master-row-copy">
            <h4>${escapeHtml(menu.nama_menu)}</h4>
            <p>${escapeHtml(shortDescription)}</p>
          </div>
        </div>
        <div class="master-row-cell">
          <span class="soft-badge category-${slugify(menu.kategori)}">${escapeHtml(menu.kategori)}</span>
        </div>
        <div class="master-row-price">
          <strong>${formatRupiah(menu.harga)}</strong>
        </div>
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
          <button type="button" class="action-chip action-primary" data-master-action="add-today" data-id="${menu.id}">
            <i class="bi bi-sunrise"></i><span>Hari Ini</span>
          </button>
          <button type="button" class="action-chip action-warning" data-master-action="add-tomorrow" data-id="${menu.id}">
            <i class="bi bi-moon-stars"></i><span>Besok</span>
          </button>
          <button type="button" class="action-chip" data-master-action="toggle-active" data-id="${menu.id}">
            <i class="bi ${menu.aktif ? "bi-toggle-on" : "bi-toggle-off"}"></i><span>${menu.aktif ? "Nonaktifkan" : "Aktifkan"}</span>
          </button>
          <button type="button" class="action-chip" data-master-action="toggle-availability" data-id="${menu.id}">
            <i class="bi ${menu.status_ketersediaan === "habis" ? "bi-bag-check" : "bi-bag-x"}"></i><span>${menu.status_ketersediaan === "habis" ? "Tersedia" : "Habis"}</span>
          </button>
          <button type="button" class="action-chip" data-master-action="edit" data-id="${menu.id}">
            <i class="bi bi-pencil-square"></i><span>Edit</span>
          </button>
          <button type="button" class="action-chip action-danger" data-master-action="delete" data-id="${menu.id}">
            <i class="bi bi-trash3"></i><span>Hapus</span>
          </button>
        </div>
      </article>
    `;
  }

  function handleMasterAction(event) {
    const action = event.currentTarget.dataset.masterAction;
    const id = Number(event.currentTarget.dataset.id);
    const menu = findMasterMenu(id);
    if (!menu) {
      return;
    }

    if (action === "edit") {
      fillForm(menu);
      openModal();
      return;
    }

    if (action === "delete") {
      if (!window.confirm(`Hapus master menu "${menu.nama_menu}"? Menu juga akan hilang dari Hari Ini dan Besok.`)) {
        return;
      }
      state.master_menu = state.master_menu.filter((item) => item.id !== id);
      state.menu_hari_ini = state.menu_hari_ini.filter((item) => item !== id);
      state.menu_besok = state.menu_besok.filter((item) => item !== id);
      selectedMasterIds.delete(id);
      showFlash("success", "Master menu berhasil dihapus.");
      renderAll();
      return;
    }

    if (action === "toggle-active") {
      menu.aktif = !menu.aktif;
      showFlash("success", `Status aktif ${menu.nama_menu} diperbarui.`);
      renderAll();
      return;
    }

    if (action === "toggle-availability") {
      menu.status_ketersediaan = menu.status_ketersediaan === "habis" ? "tersedia" : "habis";
      showFlash("success", `Status ketersediaan ${menu.nama_menu} diperbarui.`);
      renderAll();
      return;
    }

    if (action === "add-today") {
      addMenuToSchedule(id, "hari_ini");
      return;
    }

    if (action === "add-tomorrow") {
      addMenuToSchedule(id, "besok");
    }
  }

  function addMenuToSchedule(id, target) {
    const listKey = target === "hari_ini" ? "menu_hari_ini" : "menu_besok";
    const label = target === "hari_ini" ? "Hari Ini" : "Besok";

    if (state[listKey].includes(id)) {
      showFlash("error", `Menu sudah ada di daftar ${label}.`);
      return;
    }

    state[listKey].push(id);
    showFlash("success", `Menu berhasil ditambahkan ke ${label}.`);
    renderAll();
  }

  function bulkAddToSchedule(target) {
    if (!selectedMasterIds.size) {
      showFlash("error", "Pilih minimal satu menu dari Master Menu terlebih dahulu.");
      return;
    }

    let added = 0;
    Array.from(selectedMasterIds).forEach((id) => {
      const listKey = target === "hari_ini" ? "menu_hari_ini" : "menu_besok";
      if (!state[listKey].includes(id)) {
        state[listKey].push(id);
        added += 1;
      }
    });

    showFlash(added ? "success" : "error", added ? `${added} menu berhasil ditambahkan.` : "Semua menu terpilih sudah ada di daftar tujuan.");
    renderAll();
  }

  function renderScheduleBoard(target) {
    const selector = target === "hari_ini" ? "#hari-ini-list" : "#besok-list";
    const list = document.querySelector(selector);
    if (!list) {
      return;
    }

    const ids = target === "hari_ini" ? state.menu_hari_ini : state.menu_besok;
    const items = ids.map((id) => findMasterMenu(id)).filter(Boolean);

    if (!items.length) {
      list.innerHTML = `
        <div class="schedule-empty">
          <i class="bi bi-card-checklist"></i>
          <h4>${target === "hari_ini" ? "Menu Hari Ini masih kosong" : "Menu Besok belum disusun"}</h4>
          <p>Pilih menu dari Master Menu agar daftar ini terisi otomatis.</p>
        </div>
      `;
      return;
    }

    list.innerHTML = items
      .map((menu, index) => `
        <article class="schedule-row">
          <div class="schedule-row-menu">
            <img src="${escapeHtml(menu.gambar || DEFAULT_IMAGE)}" alt="${escapeHtml(menu.nama_menu)}" class="schedule-row-thumb">
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
            <button type="button" class="action-chip action-order" data-schedule-action="move-up" data-target="${target}" data-id="${menu.id}" ${index === 0 ? "disabled" : ""}>
              <i class="bi bi-arrow-up"></i><span>Naik</span>
            </button>
            <button type="button" class="action-chip action-order" data-schedule-action="move-down" data-target="${target}" data-id="${menu.id}" ${index === items.length - 1 ? "disabled" : ""}>
              <i class="bi bi-arrow-down"></i><span>Turun</span>
            </button>
          </div>
          <div class="schedule-row-actions">
            <button type="button" class="action-chip" data-schedule-action="toggle-availability" data-target="${target}" data-id="${menu.id}">
              <i class="bi ${menu.status_ketersediaan === "habis" ? "bi-bag-check" : "bi-bag-x"}"></i><span>${menu.status_ketersediaan === "habis" ? "Tersedia" : "Habis"}</span>
            </button>
            <button type="button" class="action-chip" data-schedule-action="toggle-active" data-target="${target}" data-id="${menu.id}">
              <i class="bi ${menu.aktif ? "bi-toggle-on" : "bi-toggle-off"}"></i><span>${menu.aktif ? "Nonaktifkan" : "Aktifkan"}</span>
            </button>
            <button type="button" class="action-chip action-danger" data-schedule-action="remove" data-target="${target}" data-id="${menu.id}">
              <i class="bi bi-x-circle"></i><span>Hapus</span>
            </button>
          </div>
        </article>
      `)
      .join("");

    list.querySelectorAll("[data-schedule-action]").forEach((button) => {
      button.addEventListener("click", handleScheduleAction);
    });
  }

  function handleScheduleAction(event) {
    const action = event.currentTarget.dataset.scheduleAction;
    const target = event.currentTarget.dataset.target;
    const id = Number(event.currentTarget.dataset.id);
    const menu = findMasterMenu(id);
    if (!menu) {
      return;
    }

    const listKey = target === "hari_ini" ? "menu_hari_ini" : "menu_besok";

    if (action === "toggle-availability") {
      menu.status_ketersediaan = menu.status_ketersediaan === "habis" ? "tersedia" : "habis";
      showFlash("success", `Status ${menu.nama_menu} diperbarui.`);
    }

    if (action === "toggle-active") {
      menu.aktif = !menu.aktif;
      showFlash("success", `Status aktif ${menu.nama_menu} diperbarui.`);
    }

    if (action === "remove") {
      state[listKey] = state[listKey].filter((item) => item !== id);
      showFlash("success", `${menu.nama_menu} dihapus dari ${target === "hari_ini" ? "Hari Ini" : "Besok"}.`);
    }

    if (action === "move-up" || action === "move-down") {
      reorderSchedule(listKey, id, action === "move-up" ? -1 : 1);
    }

    renderAll();
  }

  function reorderSchedule(listKey, id, direction) {
    const currentIndex = state[listKey].indexOf(id);
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= state[listKey].length) {
      return;
    }

    const cloned = [...state[listKey]];
    [cloned[currentIndex], cloned[nextIndex]] = [cloned[nextIndex], cloned[currentIndex]];
    state[listKey] = cloned;
    showFlash("success", "Urutan menu berhasil diperbarui.");
  }

  function handleFormSubmit(event) {
    event.preventDefault();

    const id = Number(document.querySelector("#menu-id")?.value || 0);
    const item = {
      id: id || nextMasterId(),
      nama_menu: (document.querySelector("#menu-nama")?.value || "").trim(),
      kategori: document.querySelector("#menu-kategori")?.value || "",
      deskripsi: (document.querySelector("#menu-deskripsi")?.value || "").trim(),
      harga: Number(document.querySelector("#menu-harga")?.value || 0),
      gambar: (document.querySelector("#menu-gambar")?.value || "").trim() || DEFAULT_IMAGE,
      aktif: Boolean(document.querySelector("#menu-aktif")?.checked),
      status_ketersediaan: document.querySelector("#menu-status")?.value || "tersedia",
    };
    const quickAdd = document.querySelector("#menu-quick-add")?.value || "";

    if (!item.nama_menu || !item.kategori || item.harga <= 0) {
      showFlash("error", "Nama menu, kategori, dan harga wajib diisi dengan benar.");
      return;
    }

    const existingIndex = state.master_menu.findIndex((menu) => menu.id === item.id);
    if (existingIndex >= 0) {
      state.master_menu[existingIndex] = item;
      showFlash("success", "Master menu berhasil diperbarui.");
    } else {
      state.master_menu.push(item);
      showFlash("success", "Master menu baru berhasil ditambahkan.");
    }

    if (quickAdd) {
      const targetKey = quickAdd === "hari_ini" ? "menu_hari_ini" : "menu_besok";
      if (!state[targetKey].includes(item.id)) {
        state[targetKey].push(item.id);
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
    setValue("#menu-gambar", menu.gambar || DEFAULT_IMAGE);
    setValue("#menu-status", menu.status_ketersediaan);
    setValue("#menu-quick-add", "");
    const checkbox = document.querySelector("#menu-aktif");
    if (checkbox) {
      checkbox.checked = Boolean(menu.aktif);
    }
    renderImagePreview(menu.gambar || DEFAULT_IMAGE);
    setText("#menu-form-title", "Edit master menu");
    setText("#menu-submit-label", "Simpan Perubahan");
  }

  function resetForm() {
    setValue("#menu-id", "");
    setValue("#menu-nama", "");
    setValue("#menu-kategori", "");
    setValue("#menu-deskripsi", "");
    setValue("#menu-harga", "");
    setValue("#menu-gambar", DEFAULT_IMAGE);
    setValue("#menu-status", "tersedia");
    setValue("#menu-quick-add", "");
    const checkbox = document.querySelector("#menu-aktif");
    if (checkbox) {
      checkbox.checked = true;
    }
    const fileInput = document.querySelector("#menu-gambar-file");
    if (fileInput) {
      fileInput.value = "";
    }
    renderImagePreview(DEFAULT_IMAGE);
    setText("#menu-form-title", "Tambah menu baru");
    setText("#menu-submit-label", "Simpan Master Menu");
  }

  function openModal() {
    document.querySelector("#menu-modal-shell")?.classList.remove("is-hidden");
    document.querySelector("#menu-modal-shell")?.setAttribute("aria-hidden", "false");
  }

  function closeModal() {
    document.querySelector("#menu-modal-shell")?.classList.add("is-hidden");
    document.querySelector("#menu-modal-shell")?.setAttribute("aria-hidden", "true");
  }

  function handleImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      setValue("#menu-gambar", result);
      renderImagePreview(result);
      showFlash("success", "Gambar dimasukkan ke draft form.");
    };
    reader.readAsDataURL(file);
  }

  function renderImagePreview(src) {
    const image = document.querySelector("#menu-image-preview");
    if (image) {
      image.src = src || DEFAULT_IMAGE;
    }
  }

  function promoteBesokToHariIni() {
    if (!state.menu_besok.length) {
      showFlash("error", "Menu Besok masih kosong.");
      return;
    }

    const confirmed = window.confirm("Semua Menu Besok akan menggantikan Menu Hari Ini. Setelah proses selesai, Menu Besok akan dikosongkan. Lanjutkan?");
    if (!confirmed) {
      return;
    }

    state.menu_hari_ini = [...state.menu_besok];
    state.menu_besok = [];
    showFlash("success", "Menu Besok berhasil dipromosikan menjadi Menu Hari Ini.");
    renderAll();
  }

  function resetBesok() {
    if (!state.menu_besok.length) {
      showFlash("error", "Menu Besok sudah kosong.");
      return;
    }

    if (!window.confirm("Kosongkan seluruh daftar Menu Besok?")) {
      return;
    }

    state.menu_besok = [];
    showFlash("success", "Menu Besok berhasil dikosongkan.");
    renderAll();
  }

  function clearHariIni() {
    if (!state.menu_hari_ini.length) {
      showFlash("error", "Menu Hari Ini sudah kosong.");
      return;
    }

    if (!window.confirm("Kosongkan seluruh daftar Menu Hari Ini?")) {
      return;
    }

    state.menu_hari_ini = [];
    showFlash("success", "Menu Hari Ini berhasil dikosongkan.");
    renderAll();
  }

  async function reloadFromSource() {
    if (!window.confirm("Muat ulang data dari data/menu.json? Draft lokal saat ini akan diganti.")) {
      return;
    }

    localStorage.removeItem(STORAGE_KEY);
    await bootstrapState();
    selectedMasterIds.clear();
    resetForm();
    renderAll();
    showFlash("success", "Data berhasil dimuat ulang dari data/menu.json.");
  }

  function handleImportJson(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const payload = JSON.parse(String(reader.result || ""));
        state = normalizeImportedData(payload);
        selectedMasterIds.clear();
        resetForm();
        renderAll();
        showFlash("success", "File JSON berhasil diimpor.");
      } catch (error) {
        showFlash("error", "File JSON tidak valid.");
      }
    };
    reader.readAsText(file);
  }

  function renderJsonInfo() {
    setText(
      "#json-info",
      `Semua perubahan langsung tersimpan sebagai draft lokal. Setelah selesai, unduh JSON terbaru, ganti file data/menu.json di project lokal, lalu commit dan push lewat GitHub Desktop. Master Menu ${state.master_menu.length} item, Hari Ini ${state.menu_hari_ini.length} item, Besok ${state.menu_besok.length} item.`
    );
  }

  function renderJsonPreview() {
    const preview = document.querySelector("#json-preview-output");
    if (preview) {
      preview.textContent = JSON.stringify(buildExportPayload(), null, 2);
    }
  }

  function buildExportPayload() {
    const generatedAt = new Date().toISOString();
    const menuHariIni = buildSnapshotList(state.menu_hari_ini, "hari_ini");
    const menuBesok = buildSnapshotList(state.menu_besok, "besok");

    return {
      metadata: {
        ...state.metadata,
        generated_at: generatedAt,
      },
      master_menu: state.master_menu,
      menu_hari_ini: menuHariIni,
      menu_besok: menuBesok,
    };
  }

  function buildScheduleSnapshot(target) {
    return {
      metadata: {
        ...state.metadata,
        generated_at: new Date().toISOString(),
        tipe_hari: target,
      },
      menus: buildSnapshotList(target === "hari_ini" ? state.menu_hari_ini : state.menu_besok, target),
    };
  }

  function buildSnapshotList(ids, tipeHari) {
    return ids
      .map((id) => findMasterMenu(id))
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
        tipe_hari: tipeHari,
      }));
  }

  function persistState() {
    state.metadata.generated_at = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function findMasterMenu(id) {
    return state.master_menu.find((menu) => Number(menu.id) === Number(id)) || null;
  }

  function nextMasterId() {
    return state.master_menu.reduce((max, item) => Math.max(max, Number(item.id)), 0) + 1;
  }

  function downloadJson(fileName, payload) {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
    showFlash("success", `${fileName} berhasil diunduh.`);
  }

  function setLoginError(message) {
    const target = document.querySelector("#login-error");
    if (target) {
      target.textContent = message;
    }
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
    if (element) {
      element.textContent = value;
    }
  }

  function setValue(selector, value) {
    const element = document.querySelector(selector);
    if (element) {
      element.value = value;
    }
  }

  function formatRupiah(value) {
    return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
  }

  function slugify(value) {
    return String(value).toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  }

  function truncateText(value, maxLength) {
    const text = String(value || "").trim();
    if (text.length <= maxLength) {
      return text;
    }
    return `${text.slice(0, Math.max(0, maxLength - 1)).trim()}...`;
  }

  function showFlash(type, message) {
    let flash = document.querySelector("#floating-flash");
    if (!flash) {
      flash = document.createElement("div");
      flash.id = "floating-flash";
      flash.className = "floating-flash";
      document.body.appendChild(flash);
    }

    flash.className = `floating-flash ${type === "error" ? "flash-error" : "flash-success"}`;
    flash.textContent = message;

    window.clearTimeout(showFlash.timer);
    showFlash.timer = window.setTimeout(() => flash.remove(), 2800);
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
