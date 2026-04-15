(function () {
  "use strict";

  const app = window.RMBJAdmin;

  app.bindDashboard = function bindDashboard() {
    document.querySelector("#master-search")?.addEventListener("input", app.renderMasterMenu);
    document.querySelector("#filter-kategori")?.addEventListener("change", app.renderMasterMenu);
    document.querySelector("#filter-aktif")?.addEventListener("change", app.renderMasterMenu);
    document.querySelector("#filter-ketersediaan")?.addEventListener("change", app.renderMasterMenu);

    document.querySelector("#open-create-modal")?.addEventListener("click", () => {
      app.resetForm();
      app.openModal();
    });
    document.querySelector("#close-modal-button")?.addEventListener("click", app.closeModal);
    document.querySelectorAll("[data-close-modal='true']").forEach((node) => node.addEventListener("click", app.closeModal));
    document.addEventListener("keydown", app.onEscape);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && app.isMobileViewport() && app.isMobileSidebarOpen()) {
        app.closeMobileSidebar();
      }
    });

    document.querySelector("#menu-form")?.addEventListener("submit", app.onSubmitForm);
    document.querySelector("#reset-form-button")?.addEventListener("click", app.resetForm);
    document.querySelector("#menu-gambar-file")?.addEventListener("change", app.onImageChange);
    document.querySelector("#menu-harga")?.addEventListener("blur", app.onPriceInputBlur);

    document.querySelector("#bulk-add-hari-ini")?.addEventListener("click", () => app.bulkAdd("hari_ini"));
    document.querySelector("#bulk-add-besok")?.addEventListener("click", () => app.bulkAdd("besok"));
    document.querySelector("#clear-hari-ini")?.addEventListener("click", app.clearToday);
    document.querySelector("#clear-besok")?.addEventListener("click", app.clearTomorrow);
    document.querySelector("#copy-hari-ini-ke-besok")?.addEventListener("click", app.copyTodayToTomorrow);
    document.querySelector("#save-json-button")?.addEventListener("click", app.saveMainJson);
    document.querySelector("#sidebar-toggle-button")?.addEventListener("click", app.toggleSidebar);
    document.querySelector("#sidebar-rail-toggle")?.addEventListener("click", app.toggleSidebar);
    document.querySelector("#sidebar-fab-button")?.addEventListener("click", app.toggleSidebar);
    document.querySelector("#sidebar-backdrop")?.addEventListener("click", app.closeMobileSidebar);
    window.addEventListener("resize", app.syncSidebarForViewport);
    window.addEventListener("scroll", app.handleAdminScroll, { passive: true });

    document.querySelectorAll(".admin-nav a, .nav-sub-item").forEach((link) => {
      link.addEventListener("click", () => {
        if (app.isMobileViewport()) app.closeMobileSidebar();
      });
    });

    document.addEventListener("click", (event) => {
      if (event.target instanceof HTMLElement && event.target.id === "empty-add-button") {
        app.resetForm();
        app.openModal();
      }
    });
  };

  app.handleMasterAction = async function handleMasterAction(event) {
    const action = event.currentTarget.dataset.masterAction;
    const id = Number(event.currentTarget.dataset.id);
    const menu = app.findMaster(id);
    if (!menu) return;

    if (action === "edit") {
      app.fillForm(menu);
      app.openModal();
      return;
    }
    if (action === "delete") {
      if (!window.confirm(`Hapus menu "${menu.nama_menu}" dari Master Menu?`)) return;
      app.state.master_menu = app.state.master_menu.filter((item) => item.id !== id);
      app.state.menu_hari_ini = app.state.menu_hari_ini.filter((item) => item !== id);
      app.state.menu_besok = app.state.menu_besok.filter((item) => item !== id);
      app.selectedIds.delete(id);
      app.commitDraft("Menu berhasil dihapus dari Master Menu.");
      return;
    }
    if (action === "toggle-active") {
      menu.aktif = !menu.aktif;
      app.commitDraft(`Status aktif ${menu.nama_menu} diperbarui.`);
      return;
    }
    if (action === "toggle-availability") {
      menu.status_ketersediaan = menu.status_ketersediaan === "habis" ? "tersedia" : "habis";
      app.commitDraft(`Status ketersediaan ${menu.nama_menu} diperbarui.`);
      return;
    }
    if (action === "add-today") {
      await app.addToSchedule(id, "hari_ini");
      return;
    }
    if (action === "add-tomorrow") {
      await app.addToSchedule(id, "besok");
    }
  };

  app.addToSchedule = async function addToSchedule(id, targetName) {
    const key = targetName === "hari_ini" ? "menu_hari_ini" : "menu_besok";
    const label = targetName === "hari_ini" ? "Menu Hari Ini" : "Menu Besok";
    if (app.state[key].includes(id)) {
      app.flash("error", `Menu sudah ada di ${label}.`);
      return;
    }
    app.state[key].push(id);
    app.commitDraft(`Menu berhasil ditambahkan ke ${label}.`);
  };

  app.bulkAdd = async function bulkAdd(targetName) {
    if (!app.selectedIds.size) {
      app.flash("error", "Pilih minimal satu menu terlebih dahulu.");
      return;
    }
    const key = targetName === "hari_ini" ? "menu_hari_ini" : "menu_besok";
    let added = 0;
    Array.from(app.selectedIds).forEach((id) => {
      if (!app.state[key].includes(id)) {
        app.state[key].push(id);
        added += 1;
      }
    });
    if (!added) {
      app.flash("error", "Semua menu terpilih sudah ada di daftar tujuan.");
      return;
    }
    app.commitDraft(`${added} menu berhasil ditambahkan.`);
  };

  app.handleScheduleAction = async function handleScheduleAction(event) {
    const action = event.currentTarget.dataset.scheduleAction;
    const targetName = event.currentTarget.dataset.target;
    const id = Number(event.currentTarget.dataset.id);
    const menu = app.findMaster(id);
    if (!menu) return;

    const key = targetName === "hari_ini" ? "menu_hari_ini" : "menu_besok";
    if (action === "toggle-availability") {
      menu.status_ketersediaan = menu.status_ketersediaan === "habis" ? "tersedia" : "habis";
    }
    if (action === "toggle-active") {
      menu.aktif = !menu.aktif;
    }
    if (action === "remove") {
      app.state[key] = app.state[key].filter((item) => item !== id);
    }
    if (action === "move-up" || action === "move-down") {
      app.reorder(key, id, action === "move-up" ? -1 : 1);
    }
    app.renderAll();
    const targetLabel = targetName === "hari_ini" ? "Menu Hari Ini" : "Menu Besok";
    const successMessage =
      action === "toggle-availability"
        ? `Status ${menu.nama_menu} diperbarui.`
        : action === "toggle-active"
          ? `Status aktif ${menu.nama_menu} diperbarui.`
          : action === "remove"
            ? `${menu.nama_menu} dihapus dari ${targetLabel}.`
            : "Urutan menu berhasil diperbarui.";
    app.flash("success", successMessage);
  };

  app.reorder = function reorder(key, id, delta) {
    const currentIndex = app.state[key].indexOf(id);
    const nextIndex = currentIndex + delta;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= app.state[key].length) return;
    const copy = [...app.state[key]];
    [copy[currentIndex], copy[nextIndex]] = [copy[nextIndex], copy[currentIndex]];
    app.state[key] = copy;
  };

  app.onSubmitForm = async function onSubmitForm(event) {
    event.preventDefault();
    app.clearFormError();
    const id = Number(document.querySelector("#menu-id")?.value || 0);
    const nameField = document.querySelector("#menu-nama");
    const categoryField = document.querySelector("#menu-kategori");
    const priceField = document.querySelector("#menu-harga");
    const existingIndex = app.state.master_menu.findIndex((menu) => menu.id === (id || -1));
    const item = {
      id: id || app.nextId(),
      nama_menu: (nameField?.value || "").trim(),
      kategori: categoryField?.value || "",
      deskripsi: (document.querySelector("#menu-deskripsi")?.value || "").trim(),
      harga: app.parsePriceInput(priceField?.value || ""),
      gambar: (document.querySelector("#menu-gambar-data")?.value || "").trim(),
      gambar_preview: "",
      image_version: 0,
      aktif: Boolean(document.querySelector("#menu-aktif")?.checked),
      status_ketersediaan: document.querySelector("#menu-status")?.value || "tersedia",
    };
    const quickAdd = document.querySelector("#menu-quick-add")?.value || "";

    if (!item.nama_menu) {
      app.showFormError("Nama menu wajib diisi.");
      nameField?.focus();
      return;
    }

    if (!item.kategori) {
      app.showFormError("Kategori menu wajib dipilih.");
      categoryField?.focus();
      return;
    }

    if (!Number.isFinite(item.harga) || item.harga <= 0) {
      app.showFormError("Harga menu wajib diisi dengan angka lebih dari 0.");
      priceField?.focus();
      return;
    }

    if (app.pendingImageFile) {
      try {
        item.gambar = await app.saveMenuImageFile(app.pendingImageFile, item.id, item.nama_menu);
        item.gambar_preview = app.pendingImageDataUrl || "";
        item.image_version = Date.now();
        app.setValue("#menu-gambar-data", item.gambar);
      } catch (error) {
        if (error?.name === "AbortError") {
          app.showFormError("Pilih folder assets/img untuk menyimpan gambar menu.");
          return;
        }
        app.showFormError(error?.message || "Gagal menyimpan gambar menu ke assets/img.");
        return;
      }
    } else if (existingIndex >= 0) {
      item.gambar_preview = app.state.master_menu[existingIndex]?.gambar_preview || "";
      item.image_version = app.state.master_menu[existingIndex]?.image_version || 0;
    }

    if (existingIndex >= 0) {
      app.state.master_menu[existingIndex] = item;
    } else {
      app.state.master_menu.push(item);
    }

    if (quickAdd) {
      const key = quickAdd === "hari_ini" ? "menu_hari_ini" : "menu_besok";
      if (!app.state[key].includes(item.id)) app.state[key].push(item.id);
    }

    app.closeModal();
    app.resetForm();
    app.commitDraft(existingIndex >= 0 ? "Menu berhasil diperbarui di draft admin." : "Menu baru berhasil ditambahkan ke draft admin.");
  };

  app.fillForm = function fillForm(menu) {
    app.clearFormError();
    app.clearPendingImage();
    app.setValue("#menu-id", String(menu.id));
    app.setValue("#menu-nama", menu.nama_menu);
    app.setValue("#menu-kategori", menu.kategori);
    app.setValue("#menu-deskripsi", menu.deskripsi || "");
    app.setValue("#menu-harga", String(Number(menu.harga || 0) || ""));
    app.setValue("#menu-gambar-data", menu.gambar || "");
    app.setValue("#menu-status", menu.status_ketersediaan);
    app.setValue("#menu-quick-add", "");
    const checkbox = document.querySelector("#menu-aktif");
    if (checkbox) checkbox.checked = Boolean(menu.aktif);
    const fileInput = document.querySelector("#menu-gambar-file");
    if (fileInput) fileInput.value = "";
    app.renderImagePreview(menu.gambar_preview || menu.gambar || "");
    app.setText("#menu-form-title", "Edit menu");
    app.setText("#menu-submit-label", "Simpan Perubahan");
  };

  app.resetForm = function resetForm() {
    app.clearFormError();
    app.clearPendingImage();
    app.setValue("#menu-id", "");
    app.setValue("#menu-nama", "");
    app.setValue("#menu-kategori", "Menu Utama");
    app.setValue("#menu-deskripsi", "");
    app.setValue("#menu-harga", "");
    app.setValue("#menu-gambar-data", "");
    app.setValue("#menu-status", "tersedia");
    app.setValue("#menu-quick-add", "");
    const checkbox = document.querySelector("#menu-aktif");
    if (checkbox) checkbox.checked = true;
    const fileInput = document.querySelector("#menu-gambar-file");
    if (fileInput) fileInput.value = "";
    app.renderImagePreview("");
    app.setText("#menu-form-title", "Tambah menu baru");
    app.setText("#menu-submit-label", "Simpan Menu");
  };

  app.openModal = function openModal() {
    const shell = document.querySelector("#menu-modal-shell");
    app.clearFormError();
    shell?.classList.remove("is-hidden");
    shell?.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    window.setTimeout(() => document.querySelector("#menu-nama")?.focus(), 20);
  };

  app.closeModal = function closeModal() {
    const shell = document.querySelector("#menu-modal-shell");
    shell?.classList.add("is-hidden");
    shell?.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  };

  app.onEscape = function onEscape(event) {
    const open = document.querySelector("#menu-modal-shell") && !document.querySelector("#menu-modal-shell").classList.contains("is-hidden");
    if (event.key === "Escape" && open) app.closeModal();
  };

  app.onImageChange = async function onImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) {
      app.clearPendingImage();
      app.setValue("#menu-gambar-data", "");
      app.renderImagePreview("");
      return;
    }
    try {
      app.clearPendingImage();
      app.pendingImageFile = file;
      app.pendingImagePreviewUrl = URL.createObjectURL(file);
      app.pendingImageDataUrl = await app.readFileAsDataUrl(file);
      app.setValue("#menu-gambar-data", app.buildImageReference(file.name));
      app.renderImagePreview(app.pendingImagePreviewUrl);
      app.flash("success", "Preview gambar siap. Saat simpan, file gambar akan ditulis ke folder assets/img.");
    } catch (error) {
      app.clearPendingImage();
      event.target.value = "";
      app.setValue("#menu-gambar-data", "");
      app.renderImagePreview("");
      app.showFormError(error?.message || "Gagal membaca file gambar.");
    }
  };

  app.onPriceInputBlur = function onPriceInputBlur(event) {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;
    input.value = app.formatPriceInput(input.value);
  };

  app.clearToday = async function clearToday() {
    if (!app.state.menu_hari_ini.length) {
      app.flash("error", "Menu Hari Ini sudah kosong.");
      return;
    }
    if (!window.confirm("Kosongkan seluruh daftar Menu Hari Ini?")) return;
    app.state.menu_hari_ini = [];
    app.commitDraft("Menu Hari Ini berhasil dikosongkan.");
  };

  app.clearTomorrow = async function clearTomorrow() {
    if (!app.state.menu_besok.length) {
      app.flash("error", "Menu Besok sudah kosong.");
      return;
    }
    if (!window.confirm("Kosongkan seluruh daftar Menu Besok?")) return;
    app.state.menu_besok = [];
    app.commitDraft("Menu Besok berhasil dikosongkan.");
  };

  app.copyTodayToTomorrow = async function copyTodayToTomorrow() {
    if (!app.state.menu_hari_ini.length) {
      app.flash("error", "Menu Hari Ini masih kosong.");
      return;
    }
    if (app.state.menu_besok.length && !window.confirm("Isi Menu Besok saat ini akan diganti dengan salinan Menu Hari Ini. Lanjutkan?")) return;
    app.state.menu_besok = [...app.state.menu_hari_ini];
    app.commitDraft("Menu Hari Ini berhasil disalin ke Menu Besok.");
  };
})();
