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
        <div class="col-12">
          <div class="empty-state">
            <p>${isTomorrow ? "Preview menu besok belum tersedia." : "Menu aktif untuk hari ini belum tersedia."}</p>
          </div>
        </div>
      `;
      return;
    }

    target.innerHTML = menus
      .map((menu) => {
        const badge = isTomorrow
          ? `<span class="menu-badge badge-warning">Menu Besok</span>`
          : `<span class="menu-badge ${menu.status_ketersediaan === "habis" ? "badge-danger" : "badge-success"}">${menu.status_ketersediaan === "habis" ? "Habis" : "Tersedia"}</span>`;

        return `
          <div class="col-md-6 col-xl-4">
            <article class="menu-card ${isTomorrow ? "menu-card-future" : ""}">
              <div class="menu-card-image-wrap">
                <img src="${escapeHtml(menu.gambar || "assets/img/about.jpg")}" alt="${escapeHtml(menu.nama_menu)}" class="menu-card-image">
                ${badge}
              </div>
              <div class="menu-card-body">
                <div class="menu-card-top">
                  <span class="menu-category">${escapeHtml(menu.kategori)}</span>
                  <strong>${formatRupiah(menu.harga)}</strong>
                </div>
                <h3>${escapeHtml(menu.nama_menu)}</h3>
                <p>${escapeHtml(menu.deskripsi || "")}</p>
              </div>
            </article>
          </div>
        `;
      })
      .join("");
  }

  function renderErrorState(message) {
    setText("#hero-menu-count", "0 menu aktif");
    const html = `<div class="col-12"><div class="empty-state"><p>${escapeHtml(message)}</p></div></div>`;
    const today = document.querySelector("#menu-hari-ini-list");
    const tomorrow = document.querySelector("#menu-besok-list");
    if (today) today.innerHTML = html;
    if (tomorrow) tomorrow.innerHTML = html;
  }

  function formatRupiah(value) {
    return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
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
