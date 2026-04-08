(function () {
  "use strict";

  const PUBLIC_PREVIEW_KEY = "rm_bu_jawa_public_preview_v1";

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
      renderPublicPage(parsed.menuHariIni, parsed.menuBesok);
    } catch (error) {
      renderErrorState("Data menu belum bisa dimuat. Pastikan file data/menu.json tersedia di repository GitHub Pages.");
    }
  }

  async function getActivePayload() {
    if (isLocalPreviewEnvironment()) {
      const preview = readPreviewPayload();
      if (preview) return preview;
    }

    const response = await fetch("data/menu.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Gagal memuat file menu.json");
    }
    return response.json();
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
    if (payload.menu_hari_ini && payload.menu_besok) {
      return {
        menuHariIni: Array.isArray(payload.menu_hari_ini) ? payload.menu_hari_ini.filter((menu) => menu.aktif) : [],
        menuBesok: Array.isArray(payload.menu_besok) ? payload.menu_besok.filter((menu) => menu.aktif) : [],
      };
    }

    const menus = Array.isArray(payload) ? payload : Array.isArray(payload.menus) ? payload.menus : [];
    return {
      menuHariIni: menus.filter((menu) => menu.aktif && menu.tipe_hari === "hari_ini"),
      menuBesok: menus.filter((menu) => menu.aktif && menu.tipe_hari === "besok"),
    };
  }

  function renderPublicPage(menuHariIni, menuBesok) {
    setText("#hero-menu-count", `${menuHariIni.length} menu aktif`);
    renderMenuList("#menu-hari-ini-list", menuHariIni, false);
    renderMenuList("#menu-besok-list", menuBesok, true);
  }

  function renderMenuList(selector, menus, isTomorrow) {
    const target = document.querySelector(selector);
    if (!target) {
      return;
    }

    if (!menus.length) {
      target.innerHTML = `
        <div class="marquee-shell">
          <div class="empty-state">
            <p>${isTomorrow ? "Menu besok belum kami tampilkan dulu. Cek lagi nanti, ya." : "Menu hari ini belum tampil dulu. Yuk cek lagi sebentar lagi."}</p>
          </div>
        </div>
      `;
      return;
    }

    const cards = menus.map((menu) => renderMenuCard(menu, isTomorrow)).join("");
    const animationClass = isTomorrow ? "is-tomorrow-marquee" : "is-today-marquee";

    target.innerHTML = `
      <div class="marquee-shell ${isTomorrow ? "marquee-shell-tomorrow" : ""}">
        <div class="menu-marquee ${animationClass}">
          <div class="menu-marquee-track">
            ${cards}
          </div>
          <div class="menu-marquee-track" aria-hidden="true">
            ${cards}
          </div>
        </div>
      </div>
    `;
  }

  function renderMenuCard(menu, isTomorrow) {
    const imageSrc = normalizeImagePath(menu.gambar) || "assets/img/about.jpg";
    const statusBadge = menu.status_ketersediaan === "habis"
      ? `<span class="menu-pill badge-danger">Habis</span>`
      : `<span class="menu-pill badge-success">Tersedia</span>`;
    const dayBadge = isTomorrow
      ? `<span class="menu-pill badge-warning">Menu Besok</span>`
      : `<span class="menu-pill badge-neutral">Siap Dipilih</span>`;

    return `
      <article class="menu-marquee-card ${isTomorrow ? "is-tomorrow-card" : ""}">
        <div class="menu-marquee-image-wrap">
          <img src="${escapeHtml(imageSrc)}" alt="${escapeHtml(menu.nama_menu)}" class="menu-marquee-image">
        </div>
        <div class="menu-marquee-body">
          <div class="menu-marquee-badges">
            ${dayBadge}
            ${statusBadge}
          </div>
          <h3>${escapeHtml(menu.nama_menu)}</h3>
          <div class="menu-marquee-meta">
            <span class="menu-category">${escapeHtml(menu.kategori)}</span>
            <strong class="menu-price">${formatRupiah(menu.harga)}</strong>
          </div>
          <p>${escapeHtml(menu.deskripsi || "")}</p>
        </div>
      </article>
    `;
  }

  function renderErrorState(message) {
    setText("#hero-menu-count", "0 menu aktif");
    const html = `<div class="marquee-shell"><div class="empty-state"><p>${escapeHtml(message)}</p></div></div>`;
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
    if (assetsIndex >= 0) {
      normalized = normalized.slice(assetsIndex);
    }
    return normalized;
  }

  function setText(selector, value) {
    const element = document.querySelector(selector);
    if (element) {
      element.textContent = value;
    }
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
