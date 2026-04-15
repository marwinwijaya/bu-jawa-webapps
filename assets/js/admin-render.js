(function () {
  "use strict";

  const app = window.RMBJAdmin;

  app.setupCategoryOptions = function setupCategoryOptions() {
    const filter = document.querySelector("#filter-kategori");
    const form = document.querySelector("#menu-kategori");
    const options = app.CATEGORIES.map((category) => `<option value="${category}">${category}</option>`).join("");
    if (filter) filter.innerHTML = `<option value="">Semua kategori</option>${options}`;
    if (form) form.innerHTML = options;
  };

  app.renderAll = function renderAll() {
    app.persist();
    app.renderDate();
    app.renderSummary();
    app.renderMasterMenu();
    const maxScheduleRows = Math.max(app.state.menu_hari_ini.length, app.state.menu_besok.length, 1);
    app.renderSchedule("hari_ini", maxScheduleRows);
    app.renderSchedule("besok", maxScheduleRows);
  };

  app.renderDate = function renderDate() {
    const formatter = new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    app.setText("#today-label", formatter.format(new Date()));
  };

  app.renderSummary = function renderSummary() {
    app.setText("#summary-master", String(app.state.master_menu.length));
    app.setText("#summary-hari-ini", String(app.state.menu_hari_ini.length));
    app.setText("#summary-besok", String(app.state.menu_besok.length));
    app.setText("#summary-aktif", String(app.state.master_menu.filter((item) => item.aktif).length));
    app.setText("#summary-habis", String(app.state.master_menu.filter((item) => item.status_ketersediaan === "habis").length));
  };

  app.renderMasterMenu = function renderMasterMenu() {
    const target = document.querySelector("#master-grid");
    if (!target) return;

    const search = (document.querySelector("#master-search")?.value || "").trim().toLowerCase();
    const kategori = document.querySelector("#filter-kategori")?.value || "";
    const aktif = document.querySelector("#filter-aktif")?.value || "";
    const ketersediaan = document.querySelector("#filter-ketersediaan")?.value || "";

    const filtered = app.state.master_menu.filter((menu) => {
      const matchesSearch = !search || menu.nama_menu.toLowerCase().includes(search) || menu.deskripsi.toLowerCase().includes(search);
      const matchesKategori = !kategori || menu.kategori === kategori;
      const matchesAktif = !aktif || (aktif === "aktif" ? menu.aktif : !menu.aktif);
      const matchesKetersediaan = !ketersediaan || menu.status_ketersediaan === ketersediaan;
      return matchesSearch && matchesKategori && matchesAktif && matchesKetersediaan;
    });

    if (!app.state.master_menu.length) {
      target.innerHTML = app.renderEmpty("Belum ada menu", "Silakan tambahkan menu baru untuk memulai.", true);
      return;
    }

    target.innerHTML = app.CATEGORIES.map((category) => app.renderCategory(category, filtered)).join("");
    target.querySelectorAll("[data-master-action]").forEach((button) => button.addEventListener("click", app.handleMasterAction));
    target.querySelectorAll("[data-master-select]").forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        const id = Number(checkbox.dataset.masterSelect);
        if (checkbox.checked) app.selectedIds.add(id);
        else app.selectedIds.delete(id);
      });
    });
  };

  app.renderCategory = function renderCategory(category, items) {
    const categoryItems = items.filter((item) => item.kategori === category).sort((a, b) => a.nama_menu.localeCompare(b.nama_menu));
    return `
      <section class="category-block">
        <div class="category-head">
          <div>
            <h4>${app.escapeHtml(category)}</h4>
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
            ${categoryItems.length ? categoryItems.map(app.renderMasterRow).join("") : app.renderSmallEmpty("Belum ada menu di kategori ini.")}
          </div>
        </div>
      </section>
    `;
  };

  app.renderMasterRow = function renderMasterRow(menu) {
    const selected = app.selectedIds.has(menu.id);
    const inToday = app.state.menu_hari_ini.includes(menu.id);
    const inTomorrow = app.state.menu_besok.includes(menu.id);
    return `
      <article class="master-row ${selected ? "is-selected" : ""}">
        <div class="master-row-menu row-cell" data-label="Menu">
          <label class="checkbox-chip compact-checkbox" aria-label="Pilih ${app.escapeHtml(menu.nama_menu)}">
            <input type="checkbox" data-master-select="${menu.id}" ${selected ? "checked" : ""}>
          </label>
          ${app.renderThumb(menu.gambar, "master-row-thumb", menu.gambar_preview, menu.image_version)}
          <div class="master-row-copy">
            <h4>${app.escapeHtml(menu.nama_menu)}</h4>
            <p>${app.escapeHtml(app.truncate(menu.deskripsi || "Belum ada deskripsi menu.", 84))}</p>
          </div>
        </div>
        <div class="master-row-price row-cell" data-label="Harga"><strong>${app.formatRupiah(menu.harga)}</strong></div>
        <div class="master-row-status row-cell" data-label="Status">
          <span class="soft-badge ${menu.aktif ? "is-success" : "is-neutral"}">${menu.aktif ? "Aktif" : "Nonaktif"}</span>
          <span class="soft-badge ${menu.status_ketersediaan === "habis" ? "is-danger" : "is-success"}">${menu.status_ketersediaan === "habis" ? "Habis" : "Tersedia"}</span>
        </div>
        <div class="master-row-schedule row-cell" data-label="Penjadwalan">
          ${inToday ? '<span class="soft-badge badge-outline-info">Hari Ini</span>' : ""}
          ${inTomorrow ? '<span class="soft-badge badge-outline-warning">Besok</span>' : ""}
          ${!inToday && !inTomorrow ? '<span class="soft-badge is-neutral">Belum dijadwalkan</span>' : ""}
        </div>
        <div class="master-row-actions row-cell" data-label="Aksi">
          <button type="button" class="action-chip action-primary" data-master-action="add-today" data-id="${menu.id}">Hari Ini</button>
          <button type="button" class="action-chip action-warning" data-master-action="add-tomorrow" data-id="${menu.id}">Besok</button>
          <button type="button" class="action-chip" data-master-action="edit" data-id="${menu.id}">Edit</button>
          <button type="button" class="action-chip" data-master-action="toggle-active" data-id="${menu.id}">${menu.aktif ? "Nonaktifkan" : "Aktifkan"}</button>
          <button type="button" class="action-chip" data-master-action="toggle-availability" data-id="${menu.id}">${menu.status_ketersediaan === "habis" ? "Tandai Tersedia" : "Tandai Habis"}</button>
          <button type="button" class="action-chip action-danger" data-master-action="delete" data-id="${menu.id}">Hapus</button>
        </div>
      </article>
    `;
  };

  app.renderSchedule = function renderSchedule(targetName, minRows) {
    const selector = targetName === "hari_ini" ? "#hari-ini-list" : "#besok-list";
    const list = document.querySelector(selector);
    if (!list) return;

    const ids = targetName === "hari_ini" ? app.state.menu_hari_ini : app.state.menu_besok;
    const items = ids.map((id) => app.findMaster(id)).filter(Boolean);

    const fallbackBanner =
      targetName === "besok" && app.isFallbackActive()
        ? `<div class="fallback-banner"><i class="bi bi-info-circle"></i> Menu Besok belum diisi dan akan menggunakan Menu Hari Ini sebagai fallback.</div>`
        : "";

    if (!items.length) {
      list.innerHTML = fallbackBanner + app.renderEmpty(
        targetName === "hari_ini" ? "Menu Hari Ini masih kosong" : "Menu Besok masih kosong",
        targetName === "hari_ini" ? "Pilih menu dari Master Menu untuk mulai menyusun menu hari ini." : "Tambahkan menu dari Master Menu atau copy dari Menu Hari Ini.",
        false
      );
      return;
    }

    const rows = items.map((menu, index) => app.renderScheduleRow(menu, targetName, index, items.length));
    const fillerCount = Math.max(0, (minRows || items.length) - items.length);
    for (let index = 0; index < fillerCount; index += 1) {
      rows.push(app.renderScheduleSpacer());
    }

    list.innerHTML = fallbackBanner + rows.join("");
    list.querySelectorAll("[data-schedule-action]").forEach((button) => button.addEventListener("click", app.handleScheduleAction));
  };

  app.renderScheduleRow = function renderScheduleRow(menu, targetName, index, length) {
    return `
      <article class="schedule-row">
        <div class="schedule-row-menu row-cell" data-label="Menu">
          ${app.renderThumb(menu.gambar, "schedule-row-thumb", menu.gambar_preview, menu.image_version)}
          <div class="schedule-row-copy">
            <h4>${app.escapeHtml(menu.nama_menu)}</h4>
            <p>${app.escapeHtml(menu.kategori)} | ${app.formatRupiah(menu.harga)}</p>
          </div>
        </div>
        <div class="schedule-row-status row-cell" data-label="Status">
          <span class="soft-badge ${menu.aktif ? "is-success" : "is-neutral"}">${menu.aktif ? "Aktif" : "Nonaktif"}</span>
          <span class="soft-badge ${menu.status_ketersediaan === "habis" ? "is-danger" : "is-success"}">${menu.status_ketersediaan === "habis" ? "Habis" : "Tersedia"}</span>
        </div>
        <div class="schedule-row-order row-cell" data-label="Urutan">
          <button type="button" class="action-chip action-order" data-schedule-action="move-up" data-target="${targetName}" data-id="${menu.id}" ${index === 0 ? "disabled" : ""}>Naik</button>
          <button type="button" class="action-chip action-order" data-schedule-action="move-down" data-target="${targetName}" data-id="${menu.id}" ${index === length - 1 ? "disabled" : ""}>Turun</button>
        </div>
        <div class="schedule-row-actions row-cell" data-label="Aksi">
          <button type="button" class="action-chip" data-schedule-action="toggle-availability" data-target="${targetName}" data-id="${menu.id}">${menu.status_ketersediaan === "habis" ? "Tandai Tersedia" : "Tandai Habis"}</button>
          <button type="button" class="action-chip" data-schedule-action="toggle-active" data-target="${targetName}" data-id="${menu.id}">${menu.aktif ? "Nonaktifkan" : "Aktifkan"}</button>
          <button type="button" class="action-chip action-danger" data-schedule-action="remove" data-target="${targetName}" data-id="${menu.id}">Hapus</button>
        </div>
      </article>
    `;
  };

  app.renderScheduleSpacer = function renderScheduleSpacer() {
    return `
      <article class="schedule-row schedule-row-spacer" aria-hidden="true">
        <div class="schedule-row-menu row-cell" data-label="Menu">
          <span class="schedule-row-thumb thumb-placeholder">-</span>
          <div class="schedule-row-copy">
            <h4>Slot kosong</h4>
            <p>Baris ini hanya untuk menjaga kerapihan layout.</p>
          </div>
        </div>
        <div class="schedule-row-status row-cell" data-label="Status"></div>
        <div class="schedule-row-order row-cell" data-label="Urutan"></div>
        <div class="schedule-row-actions row-cell" data-label="Aksi"></div>
      </article>
    `;
  };

  app.renderImagePreview = function renderImagePreview(src) {
    const image = document.querySelector("#menu-image-preview");
    const note = document.querySelector("#menu-image-note");
    if (!image) return;
    image.src = src || app.PLACEHOLDER_IMAGE;
    image.dataset.empty = src ? "false" : "true";
    if (note) note.textContent = src ? "Preview gambar menu yang akan disimpan." : "Belum ada gambar dipilih.";
  };
})();
