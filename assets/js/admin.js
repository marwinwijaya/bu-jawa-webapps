(function () {
  "use strict";

  const STORAGE_KEY = "rm_bu_jawa_admin_draft_v2";
  const CATEGORIES = ["Makanan", "Minuman", "Lauk Tambahan", "Paket"];
  const DEFAULT_IMAGE = "assets/img/about.jpg";
  const seedMenus = [
    createMenu(1, "Nasi Gudeg", "Makanan", "Gudeg manis gurih dengan sambal krecek dan telur, cocok untuk makan siang keluarga.", 22000, "assets/img/menu/cake.jpg", true, "tersedia", "hari_ini"),
    createMenu(2, "Ayam Goreng", "Lauk Tambahan", "Ayam goreng bumbu kuning khas rumahan dengan tekstur empuk dan rasa meresap.", 18000, "assets/img/menu/tuscan-grilled.jpg", true, "tersedia", "hari_ini"),
    createMenu(3, "Sayur Lodeh", "Makanan", "Sayur lodeh santan hangat dengan isian sayuran segar dan rasa khas dapur Jawa.", 16000, "assets/img/menu/greek-salad.jpg", true, "tersedia", "hari_ini"),
    createMenu(4, "Tempe Orek", "Lauk Tambahan", "Tempe orek manis pedas yang renyah dan cocok sebagai pelengkap berbagai lauk.", 9000, "assets/img/menu/bread-barrel.jpg", true, "tersedia", "hari_ini"),
    createMenu(5, "Sambal Terasi", "Lauk Tambahan", "Sambal terasi segar dengan rasa pedas mantap untuk menemani lauk utama.", 7000, "assets/img/menu/lobster-bisque.jpg", true, "tersedia", "hari_ini"),
    createMenu(6, "Es Teh Manis", "Minuman", "Es teh manis segar yang pas untuk menemani hidangan rumahan sepanjang hari.", 6000, "assets/img/menu/mozzarella.jpg", true, "tersedia", "hari_ini"),
    createMenu(7, "Teh Hangat", "Minuman", "Teh hangat klasik yang nyaman dinikmati bersama menu sarapan atau makan malam.", 5000, "assets/img/menu/spinach-salad.jpg", true, "tersedia", "besok"),
    createMenu(8, "Jeruk Es", "Minuman", "Minuman jeruk segar dengan rasa manis asam yang ringan dan menyegarkan.", 8000, "assets/img/menu/caesar.jpg", true, "tersedia", "besok"),
  ];

  let draftMenus = [];

  document.addEventListener("DOMContentLoaded", async () => {
    setupCategoryOptions();
    setupListeners();
    await bootstrapDraft();
    resetForm();
    renderAll();
  });

  function createMenu(id, nama_menu, kategori, deskripsi, harga, gambar, aktif, status_ketersediaan, tipe_hari) {
    return { id, nama_menu, kategori, deskripsi, harga, gambar, aktif, status_ketersediaan, tipe_hari };
  }

  async function bootstrapDraft() {
    const savedDraft = localStorage.getItem(STORAGE_KEY);
    if (savedDraft) {
      draftMenus = JSON.parse(savedDraft);
      showFlash("success", "Draft lokal dimuat dari browser.");
      return;
    }

    try {
      const response = await fetch("data/menu.json", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Gagal memuat JSON");
      }
      const payload = await response.json();
      draftMenus = Array.isArray(payload) ? payload : Array.isArray(payload.menus) ? payload.menus : [];
      saveDraft();
      showFlash("success", "Data awal dimuat dari data/menu.json.");
    } catch (error) {
      draftMenus = JSON.parse(JSON.stringify(seedMenus));
      saveDraft();
      showFlash("error", "data/menu.json belum bisa dibaca. Draft contoh digunakan sebagai fallback.");
    }
  }

  function setupCategoryOptions() {
    const selects = [document.querySelector("#menu-kategori"), document.querySelector("#filter-kategori")];
    selects.forEach((select, index) => {
      if (!select) {
        return;
      }
      const firstOption = index === 1 ? `<option value="">Semua kategori</option>` : `<option value="">Pilih kategori</option>`;
      select.innerHTML = `${firstOption}${CATEGORIES.map((category) => `<option value="${category}">${category}</option>`).join("")}`;
    });
  }

  function setupListeners() {
    document.querySelector("#menu-form")?.addEventListener("submit", handleMenuSubmit);
    document.querySelector("#filter-form")?.addEventListener("input", renderTable);
    document.querySelector("#download-json-button")?.addEventListener("click", () => downloadJson("menu.json", buildMainPayload()));
    document.querySelector("#download-json-hari-ini-button")?.addEventListener("click", () => downloadJson("menu-hari-ini.json", draftMenus.filter((menu) => menu.aktif && menu.tipe_hari === "hari_ini")));
    document.querySelector("#download-json-besok-button")?.addEventListener("click", () => downloadJson("menu-besok.json", draftMenus.filter((menu) => menu.aktif && menu.tipe_hari === "besok")));
    document.querySelector("#save-draft-button")?.addEventListener("click", () => {
      saveDraft();
      showFlash("success", "Draft disimpan di browser ini.");
    });
    document.querySelector("#reset-form-button")?.addEventListener("click", resetForm);
    document.querySelector("#reload-source-button")?.addEventListener("click", async () => {
      localStorage.removeItem(STORAGE_KEY);
      await bootstrapDraft();
      resetForm();
      renderAll();
    });
    document.querySelector("#import-json-input")?.addEventListener("change", handleImportJson);
    document.querySelector("#menu-gambar-file")?.addEventListener("change", handleImageUpload);
  }

  function handleMenuSubmit(event) {
    event.preventDefault();
    const id = Number(document.querySelector("#menu-id")?.value || 0);
    const item = {
      id: id || nextId(),
      nama_menu: (document.querySelector("#menu-nama")?.value || "").trim(),
      kategori: document.querySelector("#menu-kategori")?.value || "",
      deskripsi: (document.querySelector("#menu-deskripsi")?.value || "").trim(),
      harga: Number(document.querySelector("#menu-harga")?.value || 0),
      gambar: (document.querySelector("#menu-gambar")?.value || "").trim() || DEFAULT_IMAGE,
      aktif: Boolean(document.querySelector("#menu-aktif")?.checked),
      status_ketersediaan: document.querySelector("#menu-status")?.value || "tersedia",
      tipe_hari: document.querySelector("#menu-tipe-hari")?.value || "hari_ini",
    };

    if (!item.nama_menu || !item.kategori || item.harga <= 0) {
      showFlash("error", "Nama menu, kategori, dan harga wajib diisi dengan benar.");
      return;
    }

    const index = draftMenus.findIndex((menu) => menu.id === item.id);
    if (index >= 0) {
      draftMenus[index] = item;
      showFlash("success", "Menu berhasil diperbarui.");
    } else {
      draftMenus.push(item);
      showFlash("success", "Menu baru berhasil ditambahkan.");
    }

    saveDraft();
    resetForm();
    renderAll();
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
        const menus = Array.isArray(payload) ? payload : Array.isArray(payload.menus) ? payload.menus : null;
        if (!menus) {
          throw new Error("Format tidak valid");
        }
        draftMenus = menus;
        saveDraft();
        resetForm();
        renderAll();
        showFlash("success", "File JSON berhasil diimpor.");
      } catch (error) {
        showFlash("error", "File JSON tidak valid.");
      }
    };
    reader.readAsText(file);
  }

  function handleImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const imageField = document.querySelector("#menu-gambar");
      if (imageField) {
        imageField.value = result;
      }
      renderImagePreview(result);
      showFlash("success", "Gambar menu dimasukkan ke draft. File akan tersimpan di JSON sebagai data URL.");
    };
    reader.readAsDataURL(file);
  }

  function renderAll() {
    renderSummary();
    renderTable();
    renderScheduleLists();
    renderJsonInfo();
  }

  function renderSummary() {
    const hariIni = draftMenus.filter((menu) => menu.aktif && menu.tipe_hari === "hari_ini").length;
    const besok = draftMenus.filter((menu) => menu.aktif && menu.tipe_hari === "besok").length;
    const nonaktif = draftMenus.filter((menu) => !menu.aktif).length;
    setText("#summary-hari-ini", String(hariIni));
    setText("#summary-besok", String(besok));
    setText("#summary-total", String(draftMenus.length));
    setText("#summary-nonaktif", String(nonaktif));
  }

  function renderTable() {
    const tbody = document.querySelector("#menu-table-body");
    if (!tbody) {
      return;
    }

    const kategori = document.querySelector("#filter-kategori")?.value || "";
    const aktif = document.querySelector("#filter-aktif")?.value || "";
    const tipeHari = document.querySelector("#filter-tipe-hari")?.value || "";

    const filtered = draftMenus.filter((menu) => {
      if (kategori && menu.kategori !== kategori) {
        return false;
      }
      if (aktif && String(menu.aktif) !== aktif) {
        return false;
      }
      if (tipeHari && menu.tipe_hari !== tipeHari) {
        return false;
      }
      return true;
    });

    if (!filtered.length) {
      tbody.innerHTML = `<tr><td colspan="8" class="empty-inline">Belum ada data menu untuk filter yang dipilih.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered
      .sort((a, b) => a.nama_menu.localeCompare(b.nama_menu))
      .map((menu) => `
        <tr>
          <td><strong>${escapeHtml(menu.nama_menu)}</strong><p>${escapeHtml(menu.deskripsi || "")}</p></td>
          <td>${escapeHtml(menu.kategori)}</td>
          <td>${formatRupiah(menu.harga)}</td>
          <td><span class="table-badge ${menu.status_ketersediaan === "habis" ? "is-danger" : "is-success"}">${escapeHtml(menu.status_ketersediaan)}</span></td>
          <td>${menu.aktif ? "Aktif" : "Nonaktif"}</td>
          <td>${escapeHtml(menu.tipe_hari)}</td>
          <td>${menu.gambar ? "Ada gambar" : "Tanpa gambar"}</td>
          <td>
            <div class="table-actions">
              <button type="button" data-action="edit" data-id="${menu.id}">Edit</button>
              <button type="button" data-action="toggle" data-id="${menu.id}">${menu.aktif ? "Nonaktifkan" : "Aktifkan"}</button>
              <button type="button" data-action="switch-day" data-id="${menu.id}">${menu.tipe_hari === "hari_ini" ? "Pindah ke Besok" : "Pindah ke Hari Ini"}</button>
              <button type="button" class="danger-link" data-action="delete" data-id="${menu.id}">Hapus</button>
            </div>
          </td>
        </tr>
      `)
      .join("");

    tbody.querySelectorAll("[data-action]").forEach((button) => {
      button.addEventListener("click", handleTableAction);
    });
  }

  function handleTableAction(event) {
    const action = event.currentTarget.dataset.action;
    const id = Number(event.currentTarget.dataset.id);
    const menu = draftMenus.find((item) => item.id === id);
    if (!menu) {
      return;
    }

    if (action === "edit") {
      fillForm(menu);
      return;
    }

    if (action === "toggle") {
      menu.aktif = !menu.aktif;
      showFlash("success", menu.aktif ? "Menu berhasil diaktifkan." : "Menu berhasil dinonaktifkan.");
    }

    if (action === "switch-day") {
      menu.tipe_hari = menu.tipe_hari === "hari_ini" ? "besok" : "hari_ini";
      menu.aktif = true;
      showFlash("success", "Jadwal menu berhasil diubah.");
    }

    if (action === "delete") {
      if (!window.confirm("Hapus menu ini?")) {
        return;
      }
      draftMenus = draftMenus.filter((item) => item.id !== id);
      showFlash("success", "Menu berhasil dihapus.");
    }

    saveDraft();
    renderAll();
  }

  function renderScheduleLists() {
    renderScheduleList("#schedule-hari-ini-list", draftMenus.filter((menu) => menu.aktif && menu.tipe_hari === "hari_ini"));
    renderScheduleList("#schedule-besok-list", draftMenus.filter((menu) => menu.aktif && menu.tipe_hari === "besok"));
  }

  function renderScheduleList(selector, menus) {
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
            <strong>${escapeHtml(menu.nama_menu)}</strong>
            <small>${escapeHtml(menu.kategori)} | ${escapeHtml(menu.status_ketersediaan)}</small>
          </div>
          <button type="button" data-edit-schedule="${menu.id}">Edit</button>
        </li>
      `)
      .join("");

    target.querySelectorAll("[data-edit-schedule]").forEach((button) => {
      button.addEventListener("click", () => {
        const menu = draftMenus.find((item) => item.id === Number(button.dataset.editSchedule));
        if (menu) {
          fillForm(menu);
        }
      });
    });
  }

  function renderJsonInfo() {
    setText("#json-info", `Draft saat ini berisi ${draftMenus.length} menu. Gunakan tombol unduh untuk menghasilkan file JSON yang siap di-upload ke repository GitHub Pages.`);
  }

  function fillForm(menu) {
    setValue("#menu-id", String(menu.id));
    setValue("#menu-nama", menu.nama_menu);
    setValue("#menu-kategori", menu.kategori);
    setValue("#menu-deskripsi", menu.deskripsi || "");
    setValue("#menu-harga", String(menu.harga));
    setValue("#menu-gambar", menu.gambar || DEFAULT_IMAGE);
    setValue("#menu-status", menu.status_ketersediaan);
    setValue("#menu-tipe-hari", menu.tipe_hari);
    const checkbox = document.querySelector("#menu-aktif");
    if (checkbox) {
      checkbox.checked = Boolean(menu.aktif);
    }
    renderImagePreview(menu.gambar || DEFAULT_IMAGE);
    setText("#menu-form-title", "Edit menu");
    setText("#menu-submit-label", "Simpan Perubahan");
    document.querySelector("#menu-form-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function resetForm() {
    setValue("#menu-id", "");
    setValue("#menu-nama", "");
    setValue("#menu-kategori", "");
    setValue("#menu-deskripsi", "");
    setValue("#menu-harga", "");
    setValue("#menu-gambar", DEFAULT_IMAGE);
    setValue("#menu-status", "tersedia");
    setValue("#menu-tipe-hari", "hari_ini");
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
    setText("#menu-submit-label", "Tambah Menu");
  }

  function renderImagePreview(src) {
    const image = document.querySelector("#menu-image-preview");
    if (image) {
      image.src = src || DEFAULT_IMAGE;
    }
  }

  function nextId() {
    return draftMenus.reduce((max, item) => Math.max(max, item.id), 0) + 1;
  }

  function buildMainPayload() {
    return {
      generated_at: new Date().toISOString(),
      menus: draftMenus,
    };
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

  function saveDraft() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draftMenus));
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
