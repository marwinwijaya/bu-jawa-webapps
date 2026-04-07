(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", async () => {
    try {
      const response = await fetch("data/menu.json", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Gagal memuat file menu.json");
      }

      const payload = await response.json();
      const parsed = parsePayload(payload);
      renderPublicPage(parsed.menuHariIni, parsed.menuBesok);
    } catch (error) {
      renderErrorState("Data menu belum bisa dimuat. Pastikan file data/menu.json tersedia di repository GitHub Pages.");
    }
  });

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
            <p>${isTomorrow ? "Preview menu besok belum tersedia." : "Menu aktif untuk hari ini belum tersedia."}</p>
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
      : `<span class="menu-pill badge-neutral">Siap Dipesan</span>`;

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
            <strong>${formatRupiah(menu.harga)}</strong>
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
