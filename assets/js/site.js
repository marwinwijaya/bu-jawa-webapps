(function () {
  "use strict";

  const PUBLIC_PREVIEW_KEY = "rm_bu_jawa_public_preview_v1";
  const FALLBACK_MENU_IMAGE = "assets/img/about.jpg";

  document.addEventListener("DOMContentLoaded", async () => {
    await loadAndRender();
    window.addEventListener("storage", async (event) => {
      if (event.key === PUBLIC_PREVIEW_KEY) {
        await loadAndRender();
      }
    });
  });

  async function loadAndRender() {
    try {
      const payload = await getActivePayload();
      const parsed = parsePayload(payload);
      renderPublicPage(parsed.menuHariIni, parsed.menuBesok, parsed.isFallback);
    } catch (error) {
      renderErrorState("Data menu belum bisa dimuat. Pastikan file data/menu.json tersedia.");
    }
  }

  async function getActivePayload() {
    try {
      const response = await fetch("data/menu.json", { cache: "no-store" });
      if (!response.ok) throw new Error("Gagal memuat menu.json");
      return response.json();
    } catch (error) {
      if (isLocalPreviewEnvironment()) {
        const preview = readPreviewPayload();
        if (preview) return preview;
      }
      throw error;
    }
  }

  function readPreviewPayload() {
    try {
      const raw = localStorage.getItem(PUBLIC_PREVIEW_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function isLocalPreviewEnvironment() {
    const hostname = window.location.hostname;
    return window.location.protocol === "file:" || hostname === "127.0.0.1" || hostname === "localhost" || hostname === "[::1]";
  }

  function parsePayload(payload) {
    if (payload.menu_hari_ini && payload.menu_besok !== undefined) {
      const menuHariIni = Array.isArray(payload.menu_hari_ini) ? payload.menu_hari_ini.filter((menu) => menu.aktif) : [];
      const rawBesok = Array.isArray(payload.menu_besok) ? payload.menu_besok.filter((menu) => menu.aktif) : [];
      if (rawBesok.length === 0 && menuHariIni.length > 0) {
        return { menuHariIni, menuBesok: menuHariIni, isFallback: true };
      }
      return { menuHariIni, menuBesok: rawBesok, isFallback: false };
    }

    const menus = Array.isArray(payload) ? payload : Array.isArray(payload.menus) ? payload.menus : [];
    return {
      menuHariIni: menus.filter((menu) => menu.aktif && menu.tipe_hari === "hari_ini"),
      menuBesok: menus.filter((menu) => menu.aktif && menu.tipe_hari === "besok"),
      isFallback: false,
    };
  }

  function renderPublicPage(menuHariIni, menuBesok, isFallback) {
    setText("#hero-menu-count", `${menuHariIni.length} menu aktif`);
    renderMenuSection("#menu-hari-ini-list", menuHariIni, { showFilter: true });
    renderMenuSection("#menu-besok-list", menuBesok, { showFilter: false, isTomorrow: true, isFallback: isFallback });
  }

  function renderErrorState(message) {
    setText("#hero-menu-count", "0 menu aktif");
    const html = renderEmptyState(message);
    const today = document.querySelector("#menu-hari-ini-list");
    const tomorrow = document.querySelector("#menu-besok-list");
    if (today) today.innerHTML = html;
    if (tomorrow) tomorrow.innerHTML = html;
  }

  function formatRupiah(value) {
    return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
  }

  function normalizeImagePath(value) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    if (raw.startsWith("data:") || raw.startsWith("blob:") || /^https?:\/\//i.test(raw)) return raw;
    let normalized = raw.replace(/\\/g, "/").replace(/^\.?\//, "");
    const assetsIndex = normalized.toLowerCase().indexOf("assets/img/");
    if (assetsIndex >= 0) normalized = normalized.slice(assetsIndex);
    return normalized;
  }

  function getMenuImageSrc(menu) {
    const rawValue = menu?.gambar || menu?.image || menu?.gambar_menu || "";
    const normalized = normalizeImagePath(rawValue);
    if (!normalized) return FALLBACK_MENU_IMAGE;
    if (normalized.startsWith("data:") || normalized.startsWith("blob:") || /^https?:\/\//i.test(normalized)) return normalized;
    const version = Number(menu?.image_version || menu?.gambar_update || menu?.updated_at || 0) || 0;
    const encodedPath = encodeURI(normalized);
    if (!version) return encodedPath;
    const separator = encodedPath.includes("?") ? "&" : "?";
    return `${encodedPath}${separator}v=${encodeURIComponent(String(version))}`;
  }

  function setText(selector, value) {
    const element = document.querySelector(selector);
    if (element) element.textContent = value;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderEmptyState(message) {
    return `
      <div class="menu-empty-state">
        <i class="bi bi-cup-hot menu-empty-icon"></i>
        <p>${escapeHtml(message)}</p>
      </div>
    `;
  }

  function renderMenuCardGrid(menu) {
    const imageSrc = getMenuImageSrc(menu);
    const isHabis = menu.status_ketersediaan === "habis";
    const statusBadge = isHabis
      ? '<span class="menu-pill badge-danger"><i class="bi bi-x-circle"></i> Habis</span>'
      : '<span class="menu-pill badge-success"><i class="bi bi-check-circle"></i> Tersedia</span>';
    const categoryBadge = `<span class="menu-pill badge-neutral">${escapeHtml(menu.kategori || "Menu")}</span>`;
    const overlay = isHabis ? '<div class="menu-card-overlay"></div>' : "";
    const cardClass = isHabis ? "menu-card is-habis" : "menu-card";

    return `
      <article class="${cardClass}">
        <div class="menu-card-img-wrap">
          <img src="${escapeHtml(imageSrc)}" alt="${escapeHtml(menu.nama_menu || "")}" loading="lazy" class="menu-card-img" onerror="this.onerror=null;this.src='${escapeHtml(FALLBACK_MENU_IMAGE)}'">
          ${overlay}
        </div>
        <div class="menu-card-body">
          <div class="menu-card-badges">
            ${statusBadge}
            ${categoryBadge}
          </div>
          <h3 class="menu-card-title">${escapeHtml(menu.nama_menu || "")}</h3>
          <p class="menu-card-desc">${escapeHtml(menu.deskripsi || "Menu rumahan khas Jawa yang siap melengkapi selera makan Anda.")}</p>
          <div class="menu-card-footer">
            <strong class="menu-price">${formatRupiah(menu.harga)}</strong>
            <a class="btn btn-outline-custom" href="catalog.html">Pesan</a>
          </div>
        </div>
      </article>
    `;
  }

  function renderMenuGrid(menus) {
    if (!menus || menus.length === 0) {
      return '<div class="menu-grid"></div>';
    }
    return `<div class="menu-grid">${menus.map((menu) => renderMenuCardGrid(menu)).join("")}</div>`;
  }

  function renderFilterBar(menus, activeCategory) {
    const categories = [];
    const seen = {};
    menus.forEach((menu) => {
      const cat = menu.kategori;
      if (cat && !seen[cat]) {
        seen[cat] = true;
        categories.push(cat);
      }
    });

    const buttons = ['Semua'].concat(categories).map((category) => {
      const isActive = activeCategory === category;
      return `<button class="menu-filter-btn${isActive ? " is-active" : ""}" data-category="${escapeHtml(category)}" aria-pressed="${isActive ? "true" : "false"}">${escapeHtml(category)}</button>`;
    });

    return `<div class="menu-filter-bar" role="group" aria-label="Filter kategori menu">${buttons.join("")}</div>`;
  }

  function renderMenuSection(selector, menus, options) {
    const target = document.querySelector(selector);
    if (!target) return;

    const settings = options || {};
    const showFilter = settings.showFilter === true;
    const isFallback = settings.isFallback === true;
    const isTomorrow = settings.isTomorrow === true;
    let activeCategory = "Semua";

    function getFilteredMenus() {
      if (activeCategory === "Semua") return menus;
      return menus.filter((menu) => menu.kategori === activeCategory);
    }

    function renderContent() {
      const filtered = getFilteredMenus();
      let html = "";

      if (isFallback) {
        html += `
          <div class="menu-fallback-notice">
            <i class="bi bi-info-circle menu-fallback-icon"></i>
            Menu besok belum diperbarui. Untuk sementara, kami tampilkan menu hari ini sebagai referensi.
          </div>
        `;
      }

      if (showFilter) {
        html += renderFilterBar(menus, activeCategory);
      }

      if (filtered.length === 0) {
        const emptyMessage = activeCategory !== "Semua"
          ? "Tidak ada menu untuk kategori ini."
          : isTomorrow
            ? "Menu besok belum ditampilkan. Cek lagi nanti, ya."
            : "Menu hari ini belum tersedia. Silakan cek kembali nanti.";
        html += renderEmptyState(emptyMessage);
      } else {
        html += renderMenuGrid(filtered);
      }

      target.innerHTML = html;

      if (showFilter) {
        const filterBar = target.querySelector(".menu-filter-bar");
        if (filterBar) {
          filterBar.addEventListener("click", function (event) {
            const button = event.target.closest("button[data-category]");
            if (!button) return;
            activeCategory = button.getAttribute("data-category") || "Semua";
            renderContent();
          });
        }
      }
    }

    renderContent();
  }
})();
