(function () {
  "use strict";

  const APP = {
    name: "Rumah Makan Bu Jawa",
    phone: "0895-4057-18033",
    openHours: "Setiap hari, pukul 09.00 sampai 21.00 WIB",
    mapsUrl: "https://maps.app.goo.gl/XNuEpTYSbn5omncMA",
    storageKey: "rm_bu_jawa_static_app_v1",
    sessionKey: "rm_bu_jawa_admin_session",
  };

  const today = new Date();
  const todayIso = formatDate(today);
  const tomorrowIso = formatDate(addDays(today, 1));

  const seedState = {
    admin: {
      username: "admin",
      password: "admin123",
    },
    categories: [
      { id: 1, namaKategori: "Makanan" },
      { id: 2, namaKategori: "Minuman" },
      { id: 3, namaKategori: "Lauk Tambahan" },
      { id: 4, namaKategori: "Paket" },
    ],
    menus: [
      createMenuSeed(1, "Nasi Gudeg", 1, "Gudeg manis gurih dengan sambal krecek dan telur, cocok untuk makan siang keluarga.", 22000, "assets/img/menu/cake.jpg", true, "tersedia", todayIso, "hari_ini"),
      createMenuSeed(2, "Ayam Goreng", 3, "Ayam goreng bumbu kuning khas rumahan dengan tekstur empuk dan rasa meresap.", 18000, "assets/img/menu/tuscan-grilled.jpg", true, "tersedia", todayIso, "hari_ini"),
      createMenuSeed(3, "Sayur Lodeh", 1, "Sayur lodeh santan hangat dengan isian sayuran segar dan rasa khas dapur Jawa.", 16000, "assets/img/menu/greek-salad.jpg", true, "tersedia", todayIso, "hari_ini"),
      createMenuSeed(4, "Tempe Orek", 3, "Tempe orek manis pedas yang renyah dan cocok sebagai pelengkap berbagai lauk.", 9000, "assets/img/menu/bread-barrel.jpg", true, "tersedia", todayIso, "hari_ini"),
      createMenuSeed(5, "Sambal Terasi", 3, "Sambal terasi segar dengan rasa pedas mantap untuk menemani lauk utama.", 7000, "assets/img/menu/lobster-bisque.jpg", true, "tersedia", todayIso, "hari_ini"),
      createMenuSeed(6, "Es Teh Manis", 2, "Es teh manis segar yang pas untuk menemani hidangan rumahan sepanjang hari.", 6000, "assets/img/menu/mozzarella.jpg", true, "tersedia", todayIso, "hari_ini"),
      createMenuSeed(7, "Teh Hangat", 2, "Teh hangat klasik yang nyaman dinikmati bersama menu sarapan atau makan malam.", 5000, "assets/img/menu/spinach-salad.jpg", true, "tersedia", tomorrowIso, "besok"),
      createMenuSeed(8, "Jeruk Es", 2, "Minuman jeruk segar dengan rasa manis asam yang ringan dan menyegarkan.", 8000, "assets/img/menu/caesar.jpg", true, "tersedia", tomorrowIso, "besok"),
      createMenuSeed(9, "Paket Hemat Bu Jawa", 4, "Paket nasi, ayam goreng, sayur, sambal, dan es teh untuk makan praktis dan lengkap.", 32000, "assets/img/menu/lobster-roll.jpg", true, "tersedia", tomorrowIso, "besok"),
    ],
  };

  document.addEventListener("DOMContentLoaded", () => {
    bootstrapState();

    const page = document.body.dataset.page;
    if (page === "publik") {
      renderPublicPage();
    }
    if (page === "admin") {
      setupAdminPage();
    }
  });

  function createMenuSeed(id, namaMenu, kategoriId, deskripsi, harga, gambar, isActive, statusKetersediaan, tanggalTampil, tipeHari) {
    return {
      id,
      namaMenu,
      kategoriId,
      deskripsi,
      harga,
      gambar,
      isActive,
      statusKetersediaan,
      tanggalTampil,
      tipeHari,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  function bootstrapState() {
    if (!localStorage.getItem(APP.storageKey)) {
      localStorage.setItem(APP.storageKey, JSON.stringify(seedState));
    }
  }

  function getState() {
    return JSON.parse(localStorage.getItem(APP.storageKey) || JSON.stringify(seedState));
  }

  function saveState(state) {
    localStorage.setItem(APP.storageKey, JSON.stringify(state));
  }

  function renderPublicPage() {
    const state = getState();
    const todayMenus = getPublicMenus(state, "hari_ini");
    const upcomingMenus = getPublicMenus(state, "besok");

    setText("#hero-menu-count", `${todayMenus.length} menu aktif`);

    renderPublicMenuList("#menu-hari-ini-list", todayMenus, false);
    renderPublicMenuList("#menu-besok-list", upcomingMenus, true);
  }

  function getPublicMenus(state, mode) {
    return state.menus
      .filter((menu) => {
        if (!menu.isActive) {
          return false;
        }
        if (mode === "hari_ini") {
          return menu.tipeHari === "hari_ini" || menu.tanggalTampil === todayIso;
        }
        return menu.tipeHari === "besok" || menu.tanggalTampil >= tomorrowIso;
      })
      .sort((a, b) => a.tanggalTampil.localeCompare(b.tanggalTampil) || a.namaMenu.localeCompare(b.namaMenu));
  }

  function renderPublicMenuList(selector, menus, showTomorrowBadge) {
    const target = document.querySelector(selector);
    if (!target) {
      return;
    }

    if (!menus.length) {
      target.innerHTML = `<div class="empty-state"><p>${showTomorrowBadge ? "Preview menu besok belum tersedia." : "Menu aktif untuk hari ini belum tersedia."}</p></div>`;
      return;
    }

    target.innerHTML = menus
      .map((menu) => {
        const category = getCategoryName(menu.kategoriId);
        const badge = showTomorrowBadge
          ? `<span class="menu-badge badge-warning">Menu Besok</span>`
          : `<span class="menu-badge ${menu.statusKetersediaan === "habis" ? "badge-danger" : "badge-success"}">${menu.statusKetersediaan === "habis" ? "Habis" : "Tersedia"}</span>`;

        return `
          <div class="col-md-6 col-xl-4">
            <article class="menu-card ${showTomorrowBadge ? "menu-card-future" : ""}">
              <div class="menu-card-image-wrap">
                <img src="${escapeHtml(menu.gambar || "assets/img/about.jpg")}" alt="${escapeHtml(menu.namaMenu)}" class="menu-card-image">
                ${badge}
              </div>
              <div class="menu-card-body">
                <div class="menu-card-top">
                  <span class="menu-category">${escapeHtml(category)}</span>
                  <strong>${formatRupiah(menu.harga)}</strong>
                </div>
                <h3>${escapeHtml(menu.namaMenu)}</h3>
                <p>${escapeHtml(menu.deskripsi)}</p>
                ${showTomorrowBadge ? `<div class="menu-date">Tayang: ${formatDisplayDate(menu.tanggalTampil)}</div>` : ""}
              </div>
            </article>
          </div>
        `;
      })
      .join("");
  }

  function setupAdminPage() {
    const loginSection = document.querySelector("#admin-login-section");
    const dashboardSection = document.querySelector("#admin-dashboard-section");
    const loginForm = document.querySelector("#admin-login-form");
    const menuForm = document.querySelector("#menu-form");
    const filtersForm = document.querySelector("#filter-form");
    const scheduleForm = document.querySelector("#schedule-form");
    const logoutButton = document.querySelector("#logout-button");
    const resetButton = document.querySelector("#reset-data-button");

    if (!loginSection || !dashboardSection) {
      return;
    }

    loginForm?.addEventListener("submit", onLoginSubmit);
    menuForm?.addEventListener("submit", onMenuSubmit);
    filtersForm?.addEventListener("input", renderAdminPage);
    scheduleForm?.addEventListener("submit", onScheduleSubmit);
    logoutButton?.addEventListener("click", onLogout);
    resetButton?.addEventListener("click", onResetData);

    if (sessionStorage.getItem(APP.sessionKey) === "logged-in") {
      loginSection.classList.add("is-hidden");
      dashboardSection.classList.remove("is-hidden");
      resetMenuForm();
      setValue("#schedule-date", tomorrowIso);
      renderAdminPage();
    } else {
      loginSection.classList.remove("is-hidden");
      dashboardSection.classList.add("is-hidden");
    }
  }

  function onLoginSubmit(event) {
    event.preventDefault();
    const state = getState();
    const username = document.querySelector("#username")?.value.trim() || "";
    const password = document.querySelector("#password")?.value || "";

    if (username === state.admin.username && password === state.admin.password) {
      sessionStorage.setItem(APP.sessionKey, "logged-in");
      showFlash("success", "Login admin berhasil.");
      setText("#login-error", "");
      document.querySelector("#admin-login-section")?.classList.add("is-hidden");
      document.querySelector("#admin-dashboard-section")?.classList.remove("is-hidden");
      resetMenuForm();
      setValue("#schedule-date", tomorrowIso);
      renderAdminPage();
      return;
    }

    setText("#login-error", "Username atau password tidak sesuai.");
  }

  function onLogout() {
    sessionStorage.removeItem(APP.sessionKey);
    location.reload();
  }

  function onResetData() {
    if (!window.confirm("Reset seluruh data ke contoh awal?")) {
      return;
    }
    localStorage.setItem(APP.storageKey, JSON.stringify(seedState));
    showFlash("success", "Data berhasil dikembalikan ke contoh awal.");
    renderAdminPage();
    renderPublicPage();
  }

  function renderAdminPage() {
    const state = getState();
    renderSummary(state);
    renderCategoryOptions(state.categories);
    renderMenuTable(state);
    renderScheduleState(state);
    populateScheduleMenuOptions(state.menus, state.categories);
    if (!document.querySelector("#menu-id")?.value) {
      setValue("#schedule-date", tomorrowIso);
    }
  }

  function renderSummary(state) {
    const todayMenus = getPublicMenus(state, "hari_ini");
    const upcomingMenus = getPublicMenus(state, "besok");
    const inactiveMenus = state.menus.filter((menu) => !menu.isActive);

    setText("#summary-hari-ini", String(todayMenus.length));
    setText("#summary-besok", String(upcomingMenus.length));
    setText("#summary-total", String(state.menus.length));
    setText("#summary-nonaktif", String(inactiveMenus.length));
  }

  function renderCategoryOptions(categories) {
    const filterCategory = document.querySelector("#filter-kategori");
    const formCategory = document.querySelector("#menu-kategori");

    if (filterCategory && filterCategory.dataset.ready !== "true") {
      filterCategory.innerHTML = `<option value="">Semua kategori</option>${categories
        .map((category) => `<option value="${category.id}">${escapeHtml(category.namaKategori)}</option>`)
        .join("")}`;
      filterCategory.dataset.ready = "true";
    }

    if (formCategory && formCategory.dataset.ready !== "true") {
      formCategory.innerHTML = `<option value="">Pilih kategori</option>${categories
        .map((category) => `<option value="${category.id}">${escapeHtml(category.namaKategori)}</option>`)
        .join("")}`;
      formCategory.dataset.ready = "true";
    }
  }

  function renderMenuTable(state) {
    const tbody = document.querySelector("#menu-table-body");
    if (!tbody) {
      return;
    }

    const filters = {
      kategoriId: document.querySelector("#filter-kategori")?.value || "",
      isActive: document.querySelector("#filter-aktif")?.value || "",
      tipeHari: document.querySelector("#filter-tipe-hari")?.value || "",
      tanggalTampil: document.querySelector("#filter-tanggal")?.value || "",
    };

    const filteredMenus = state.menus.filter((menu) => {
      if (filters.kategoriId && String(menu.kategoriId) !== filters.kategoriId) {
        return false;
      }
      if (filters.isActive !== "" && String(Number(menu.isActive)) !== filters.isActive) {
        return false;
      }
      if (filters.tipeHari && menu.tipeHari !== filters.tipeHari) {
        return false;
      }
      if (filters.tanggalTampil && menu.tanggalTampil !== filters.tanggalTampil) {
        return false;
      }
      return true;
    });

    if (!filteredMenus.length) {
      tbody.innerHTML = `<tr><td colspan="8" class="empty-inline">Belum ada data menu untuk filter yang dipilih.</td></tr>`;
      return;
    }

    tbody.innerHTML = filteredMenus
      .sort((a, b) => a.tanggalTampil.localeCompare(b.tanggalTampil) || a.namaMenu.localeCompare(b.namaMenu))
      .map((menu) => {
        const category = getCategoryName(menu.kategoriId, state.categories);
        return `
          <tr>
            <td><strong>${escapeHtml(menu.namaMenu)}</strong><p>${escapeHtml(menu.deskripsi)}</p></td>
            <td>${escapeHtml(category)}</td>
            <td>${formatRupiah(menu.harga)}</td>
            <td><span class="table-badge ${menu.statusKetersediaan === "habis" ? "is-danger" : "is-success"}">${escapeHtml(menu.statusKetersediaan)}</span></td>
            <td>${menu.isActive ? "Aktif" : "Nonaktif"}</td>
            <td>${escapeHtml(menu.tanggalTampil)}</td>
            <td>${escapeHtml(menu.tipeHari)}</td>
            <td>
              <div class="table-actions">
                <button type="button" data-action="edit" data-id="${menu.id}">Edit</button>
                <button type="button" data-action="schedule" data-id="${menu.id}">Jadwalkan ke Besok</button>
                <button type="button" data-action="toggle" data-id="${menu.id}">${menu.isActive ? "Nonaktifkan" : "Aktifkan"}</button>
                <button type="button" class="danger-link" data-action="delete" data-id="${menu.id}">Hapus</button>
              </div>
            </td>
          </tr>
        `;
      })
      .join("");

    tbody.querySelectorAll("button[data-action]").forEach((button) => {
      button.addEventListener("click", onTableAction);
    });
  }

  function onTableAction(event) {
    const button = event.currentTarget;
    const action = button.dataset.action;
    const id = Number(button.dataset.id);
    const state = getState();
    const menu = state.menus.find((item) => item.id === id);

    if (!menu) {
      return;
    }

    if (action === "edit") {
      fillMenuForm(menu);
      return;
    }

    if (action === "schedule") {
      scheduleMenu(state, id, "besok", tomorrowIso);
      showFlash("success", "Menu berhasil ditambahkan ke Menu Terjadwal dan otomatis diaktifkan untuk besok.");
    }

    if (action === "toggle") {
      menu.isActive = !menu.isActive;
      menu.updatedAt = new Date().toISOString();
      saveState(state);
      showFlash("success", menu.isActive ? "Menu berhasil diaktifkan." : "Menu berhasil dinonaktifkan.");
    }

    if (action === "delete") {
      if (!window.confirm("Hapus menu ini?")) {
        return;
      }
      state.menus = state.menus.filter((item) => item.id !== id);
      saveState(state);
      showFlash("success", "Menu berhasil dihapus.");
    }

    renderAdminPage();
  }

  function fillMenuForm(menu) {
    setValue("#menu-id", String(menu.id));
    setValue("#menu-nama", menu.namaMenu);
    setValue("#menu-kategori", String(menu.kategoriId));
    setValue("#menu-harga", String(menu.harga));
    setValue("#menu-status", menu.statusKetersediaan);
    setValue("#menu-tipe-hari", menu.tipeHari);
    setValue("#menu-tanggal", menu.tanggalTampil);
    setValue("#menu-gambar", menu.gambar);
    setValue("#menu-deskripsi", menu.deskripsi);
    const checkbox = document.querySelector("#menu-aktif");
    if (checkbox) {
      checkbox.checked = menu.isActive;
    }
    setText("#menu-form-title", "Edit data menu");
    setText("#menu-form-button", "Simpan Perubahan");
    document.querySelector("#menu-form-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function resetMenuForm() {
    setValue("#menu-id", "");
    setValue("#menu-nama", "");
    setValue("#menu-kategori", "");
    setValue("#menu-harga", "");
    setValue("#menu-status", "tersedia");
    setValue("#menu-tipe-hari", "hari_ini");
    setValue("#menu-tanggal", todayIso);
    setValue("#menu-gambar", "assets/img/about.jpg");
    setValue("#menu-deskripsi", "");
    const checkbox = document.querySelector("#menu-aktif");
    if (checkbox) {
      checkbox.checked = true;
    }
    setText("#menu-form-title", "Tambah menu baru");
    setText("#menu-form-button", "Tambah Menu");
  }

  function onMenuSubmit(event) {
    event.preventDefault();
    const state = getState();
    const id = Number(document.querySelector("#menu-id")?.value || 0);
    const data = {
      namaMenu: document.querySelector("#menu-nama")?.value.trim() || "",
      kategoriId: Number(document.querySelector("#menu-kategori")?.value || 0),
      deskripsi: document.querySelector("#menu-deskripsi")?.value.trim() || "",
      harga: Number(document.querySelector("#menu-harga")?.value || 0),
      gambar: document.querySelector("#menu-gambar")?.value.trim() || "assets/img/about.jpg",
      isActive: Boolean(document.querySelector("#menu-aktif")?.checked),
      statusKetersediaan: document.querySelector("#menu-status")?.value || "tersedia",
      tanggalTampil: document.querySelector("#menu-tanggal")?.value || todayIso,
      tipeHari: document.querySelector("#menu-tipe-hari")?.value || "hari_ini",
    };

    if (!data.namaMenu || !data.kategoriId || data.harga <= 0 || !data.tanggalTampil) {
      showFlash("error", "Nama menu, kategori, harga, dan tanggal tampil wajib diisi.");
      return;
    }

    if (id > 0) {
      const menu = state.menus.find((item) => item.id === id);
      if (!menu) {
        return;
      }
      Object.assign(menu, data, { updatedAt: new Date().toISOString() });
      showFlash("success", "Menu berhasil diperbarui.");
    } else {
      state.menus.push({
        id: nextMenuId(state.menus),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      showFlash("success", "Menu baru berhasil ditambahkan.");
    }

    saveState(state);
    resetMenuForm();
    renderAdminPage();
  }

  function onScheduleSubmit(event) {
    event.preventDefault();
    const state = getState();
    const menuId = Number(document.querySelector("#schedule-menu-id")?.value || 0);
    const targetDay = document.querySelector("#schedule-target-day")?.value || "besok";
    const date = document.querySelector("#schedule-date")?.value || (targetDay === "hari_ini" ? todayIso : tomorrowIso);

    if (!menuId) {
      showFlash("error", "Pilih menu yang akan dijadwalkan.");
      return;
    }

    scheduleMenu(state, menuId, targetDay, date);
    saveState(state);
    showFlash("success", "Menu berhasil dimasukkan ke Menu Terjadwal dan otomatis diaktifkan.");
    renderAdminPage();
  }

  function scheduleMenu(state, id, targetDay, date) {
    const menu = state.menus.find((item) => item.id === id);
    if (!menu) {
      return;
    }
    menu.isActive = true;
    menu.tipeHari = targetDay;
    menu.tanggalTampil = date || (targetDay === "hari_ini" ? todayIso : tomorrowIso);
    menu.updatedAt = new Date().toISOString();
    saveState(state);
  }

  function renderScheduleState(state) {
    const todayMenus = getPublicMenus(state, "hari_ini");
    const upcomingMenus = getPublicMenus(state, "besok");
    renderScheduleList("#schedule-today-list", todayMenus, "besok");
    renderScheduleList("#schedule-upcoming-list", upcomingMenus, "hari_ini");
  }

  function renderScheduleList(selector, menus, nextTarget) {
    const target = document.querySelector(selector);
    if (!target) {
      return;
    }

    if (!menus.length) {
      target.innerHTML = `<p class="empty-inline">Belum ada menu pada bagian ini.</p>`;
      return;
    }

    target.innerHTML = menus
      .map((menu) => `
        <li>
          <div>
            <strong>${escapeHtml(menu.namaMenu)}</strong>
            <small>${escapeHtml(menu.tanggalTampil)} | ${escapeHtml(getCategoryName(menu.kategoriId))}</small>
          </div>
          <div class="schedule-actions-inline">
            <button type="button" data-schedule-edit="${menu.id}">Edit</button>
            <button type="button" data-schedule-move="${menu.id}" data-next-target="${nextTarget}">
              ${nextTarget === "besok" ? "Pindah ke Besok" : "Tampilkan Hari Ini"}
            </button>
          </div>
        </li>
      `)
      .join("");

    target.querySelectorAll("[data-schedule-edit]").forEach((button) => {
      button.addEventListener("click", () => {
        const state = getState();
        const menu = state.menus.find((item) => item.id === Number(button.dataset.scheduleEdit));
        if (menu) {
          fillMenuForm(menu);
        }
      });
    });

    target.querySelectorAll("[data-schedule-move]").forEach((button) => {
      button.addEventListener("click", () => {
        const state = getState();
        const menuId = Number(button.dataset.scheduleMove);
        const nextTargetValue = button.dataset.nextTarget || "besok";
        scheduleMenu(state, menuId, nextTargetValue, nextTargetValue === "hari_ini" ? todayIso : tomorrowIso);
        showFlash("success", "Jadwal menu berhasil diperbarui.");
        renderAdminPage();
      });
    });
  }

  function populateScheduleMenuOptions(menus, categories) {
    const select = document.querySelector("#schedule-menu-id");
    if (!select) {
      return;
    }

    select.innerHTML = `<option value="">Pilih menu</option>${menus
      .slice()
      .sort((a, b) => a.namaMenu.localeCompare(b.namaMenu))
      .map((menu) => `<option value="${menu.id}">${escapeHtml(menu.namaMenu)} - ${escapeHtml(getCategoryName(menu.kategoriId, categories))} - ${menu.isActive ? "aktif" : "nonaktif"}</option>`)
      .join("")}`;
  }

  function nextMenuId(menus) {
    return menus.reduce((maxId, menu) => Math.max(maxId, menu.id), 0) + 1;
  }

  function getCategoryName(categoryId, categories = null) {
    const source = categories || getState().categories;
    return source.find((category) => category.id === Number(categoryId))?.namaKategori || "-";
  }

  function formatRupiah(value) {
    return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
  }

  function formatDisplayDate(value) {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  }

  function formatDate(date) {
    return date.toISOString().slice(0, 10);
  }

  function addDays(date, amount) {
    const next = new Date(date);
    next.setDate(next.getDate() + amount);
    return next;
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
    showFlash.timer = window.setTimeout(() => {
      flash.remove();
    }, 2500);
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
