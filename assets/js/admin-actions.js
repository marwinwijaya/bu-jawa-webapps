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

    document.querySelector("#menu-form")?.addEventListener("submit", app.onSubmitForm);
    document.querySelector("#reset-form-button")?.addEventListener("click", app.resetForm);
    document.querySelector("#menu-gambar-file")?.addEventListener("change", app.onImageChange);

    document.querySelector("#bulk-add-hari-ini")?.addEventListener("click", () => app.bulkAdd("hari_ini"));
    document.querySelector("#bulk-add-besok")?.addEventListener("click", () => app.bulkAdd("besok"));
    document.querySelector("#clear-hari-ini")?.addEventListener("click", app.clearToday);
    document.querySelector("#save-hari-ini")?.addEventListener("click", app.saveMainJson);
    document.querySelector("#clear-besok")?.addEventListener("click", app.clearTomorrow);
    document.querySelector("#save-besok")?.addEventListener("click", app.saveMainJson);
    document.querySelector("#copy-hari-ini-ke-besok")?.addEventListener("click", app.copyTodayToTomorrow);
    document.querySelector("#promote-button")?.addEventListener("click", app.promoteTomorrow);

    document.addEventListener("click", (event) => {
      if (event.target instanceof HTMLElement && event.target.id === "empty-add-button") {
        app.resetForm();
        app.openModal();
      }
    });
  };

  app.handleMasterAction = function handleMasterAction(event) {
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
      app.flash("success", "Menu berhasil dihapus dari Master Menu.");
      app.renderAll();
      return;
    }
    if (action === "toggle-active") {
      menu.aktif = !menu.aktif;
      app.flash("success", `Status aktif ${menu.nama_menu} diperbarui.`);
      app.renderAll();
      return;
    }
    if (action === "toggle-availability") {
      menu.status_ketersediaan = menu.status_ketersediaan === "habis" ? "tersedia" : "habis";
      app.flash("success", `Status ketersediaan ${menu.nama_menu} diperbarui.`);
      app.renderAll();
      return;
    }
    if (action === "add-today") {
      app.addToSchedule(id, "hari_ini");
      return;
    }
    if (action === "add-tomorrow") {
      app.addToSchedule(id, "besok");
    }
  };

  app.addToSchedule = function addToSchedule(id, targetName) {
    const key = targetName === "hari_ini" ? "menu_hari_ini" : "menu_besok";
    const label = targetName === "hari_ini" ? "Menu Hari Ini" : "Menu Besok";
    if (app.state[key].includes(id)) {
      app.flash("error", `Menu sudah ada di ${label}.`);
      return;
    }
    app.state[key].push(id);
    app.flash("success", `Menu berhasil ditambahkan ke ${label}.`);
    app.renderAll();
  };

  app.bulkAdd = function bulkAdd(targetName) {
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
    app.flash(added ? "success" : "error", added ? `${added} menu berhasil ditambahkan.` : "Semua menu terpilih sudah ada di daftar tujuan.");
    app.renderAll();
  };

  app.handleScheduleAction = function handleScheduleAction(event) {
    const action = event.currentTarget.dataset.scheduleAction;
    const targetName = event.currentTarget.dataset.target;
    const id = Number(event.currentTarget.dataset.id);
    const menu = app.findMaster(id);
    if (!menu) return;

    const key = targetName === "hari_ini" ? "menu_hari_ini" : "menu_besok";
    if (action === "toggle-availability") {
      menu.status_ketersediaan = menu.status_ketersediaan === "habis" ? "tersedia" : "habis";
      app.flash("success", `Status ${menu.nama_menu} diperbarui.`);
    }
    if (action === "toggle-active") {
      menu.aktif = !menu.aktif;
      app.flash("success", `Status aktif ${menu.nama_menu} diperbarui.`);
    }
    if (action === "remove") {
      app.state[key] = app.state[key].filter((item) => item !== id);
      app.flash("success", `${menu.nama_menu} dihapus dari ${targetName === "hari_ini" ? "Menu Hari Ini" : "Menu Besok"}.`);
    }
    if (action === "move-up" || action === "move-down") {
      app.reorder(key, id, action === "move-up" ? -1 : 1);
    }
    app.renderAll();
  };

  app.reorder = function reorder(key, id, delta) {
    const currentIndex = app.state[key].indexOf(id);
    const nextIndex = currentIndex + delta;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= app.state[key].length) return;
    const copy = [...app.state[key]];
    [copy[currentIndex], copy[nextIndex]] = [copy[nextIndex], copy[currentIndex]];
    app.state[key] = copy;
    app.flash("success", "Urutan menu berhasil diperbarui.");
  };

  app.onSubmitForm = function onSubmitForm(event) {
    event.preventDefault();
    const id = Number(document.querySelector("#menu-id")?.value || 0);
    const item = {
      id: id || app.nextId(),
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
      app.flash("error", "Nama menu, kategori, dan harga wajib diisi dengan benar.");
      return;
    }

    const existingIndex = app.state.master_menu.findIndex((menu) => menu.id === item.id);
    if (existingIndex >= 0) {
      app.state.master_menu[existingIndex] = item;
      app.flash("success", "Menu berhasil diperbarui.");
    } else {
      app.state.master_menu.push(item);
      app.flash("success", "Menu baru berhasil ditambahkan.");
    }

    if (quickAdd) {
      const key = quickAdd === "hari_ini" ? "menu_hari_ini" : "menu_besok";
      if (!app.state[key].includes(item.id)) app.state[key].push(item.id);
    }

    app.closeModal();
    app.resetForm();
    app.renderAll();
  };

  app.fillForm = function fillForm(menu) {
    app.setValue("#menu-id", String(menu.id));
    app.setValue("#menu-nama", menu.nama_menu);
    app.setValue("#menu-kategori", menu.kategori);
    app.setValue("#menu-deskripsi", menu.deskripsi || "");
    app.setValue("#menu-harga", String(menu.harga));
    app.setValue("#menu-gambar-data", menu.gambar || "");
    app.setValue("#menu-status", menu.status_ketersediaan);
    app.setValue("#menu-quick-add", "");
    const checkbox = document.querySelector("#menu-aktif");
    if (checkbox) checkbox.checked = Boolean(menu.aktif);
    app.renderImagePreview(menu.gambar || "");
    app.setText("#menu-form-title", "Edit menu");
    app.setText("#menu-submit-label", "Simpan Perubahan");
  };

  app.resetForm = function resetForm() {
    app.setValue("#menu-id", "");
    app.setValue("#menu-nama", "");
    app.setValue("#menu-kategori", "");
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

  app.onImageChange = function onImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) {
      app.setValue("#menu-gambar-data", "");
      app.renderImagePreview("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      app.setValue("#menu-gambar-data", result);
      app.renderImagePreview(result);
      app.flash("success", "Gambar menu berhasil dimuat ke draft.");
    };
    reader.readAsDataURL(file);
  };

  app.clearToday = function clearToday() {
    if (!app.state.menu_hari_ini.length) {
      app.flash("error", "Menu Hari Ini sudah kosong.");
      return;
    }
    if (!window.confirm("Kosongkan seluruh daftar Menu Hari Ini?")) return;
    app.state.menu_hari_ini = [];
    app.renderAll();
    app.flash("success", "Menu Hari Ini berhasil dikosongkan.");
  };

  app.clearTomorrow = function clearTomorrow() {
    if (!app.state.menu_besok.length) {
      app.flash("error", "Menu Besok sudah kosong.");
      return;
    }
    if (!window.confirm("Kosongkan seluruh daftar Menu Besok?")) return;
    app.state.menu_besok = [];
    app.renderAll();
    app.flash("success", "Menu Besok berhasil dikosongkan.");
  };

  app.copyTodayToTomorrow = function copyTodayToTomorrow() {
    if (!app.state.menu_hari_ini.length) {
      app.flash("error", "Menu Hari Ini masih kosong.");
      return;
    }
    if (app.state.menu_besok.length && !window.confirm("Isi Menu Besok saat ini akan diganti dengan salinan Menu Hari Ini. Lanjutkan?")) return;
    app.state.menu_besok = [...app.state.menu_hari_ini];
    app.renderAll();
    app.flash("success", "Menu Hari Ini berhasil disalin ke Menu Besok.");
  };

  app.promoteTomorrow = function promoteTomorrow() {
    if (!app.state.menu_besok.length) {
      app.flash("error", "Menu Besok masih kosong.");
      return;
    }
    if (!window.confirm("Gunakan seluruh Menu Besok sebagai Menu Hari Ini? Menu Besok akan dikosongkan setelah proses selesai.")) return;
    app.state.menu_hari_ini = [...app.state.menu_besok];
    app.state.menu_besok = [];
    app.renderAll();
    app.flash("success", "Menu Besok berhasil dipindahkan menjadi Menu Hari Ini.");
  };
})();
