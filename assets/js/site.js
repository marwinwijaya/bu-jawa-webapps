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
      renderErrorState("Data menu belum bisa dimuat. Pastikan file data/menu.json tersedia di repository GitHub Pages.");
    }
  }

  async function getActivePayload() {
    try {
      const response = await fetch("data/menu.json", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Gagal memuat file menu.json");
      }
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

  function getMenuImageSrc(menu) {
    const rawValue = menu?.gambar || menu?.image || menu?.gambar_menu || "";
    const normalized = normalizeImagePath(rawValue);
    if (!normalized) return FALLBACK_MENU_IMAGE;
    if (normalized.startsWith("data:") || normalized.startsWith("blob:") || /^https?:\/\//i.test(normalized)) {
      return normalized;
    }
    const version = Number(menu?.image_version || menu?.gambar_update || menu?.updated_at || 0) || 0;
    const encodedPath = encodeURI(normalized);
    if (!version) return encodedPath;
    const separator = encodedPath.includes("?") ? "&" : "?";
    return `${encodedPath}${separator}v=${encodeURIComponent(String(version))}`;
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

  // ── Task 2.1: renderEmptyState ────────────────────────────────────────────
  function renderEmptyState(message) {
    return `
    <div class="menu-empty-state">
      <i class="bi bi-cup-hot menu-empty-icon"></i>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
  }

  // ── Task 2.2: Property 9 — renderEmptyState ───────────────────────────────
  function verifyProperty9(iterations) {
    iterations = iterations || 100;
    var messages = [
      "Menu hari ini belum tersedia.",
      "Tidak ada menu untuk kategori ini.",
      "Menu besok belum ditampilkan.",
      "",
      "Pesan dengan <karakter> & 'khusus'"
    ];
    for (var i = 0; i < iterations; i++) {
      var msg = messages[i % messages.length] + " #" + i;
      var html = renderEmptyState(msg);
      var doc = new DOMParser().parseFromString(html, "text/html");
      // Property 9: empty state contains the message text
      var hasIcon = doc.querySelector(".menu-empty-icon") !== null;
      var bodyText = doc.body.textContent || "";
      // escapeHtml encodes the message, so check decoded text
      console.assert(hasIcon, "Property 9 FAIL: no icon element, iteration " + i);
      console.assert(bodyText.length > 0, "Property 9 FAIL: empty body text, iteration " + i);
    }
    console.log("Property 9 (renderEmptyState): OK — " + iterations + " iterations");
  }

  // ── Task 2.3: formatRupiah already exists — no change needed ─────────────

  // ── Task 2.4: Property 4 — formatRupiah ──────────────────────────────────
  function verifyProperty4(iterations) {
    iterations = iterations || 100;
    for (var i = 0; i < iterations; i++) {
      var harga = Math.floor(Math.random() * 200000);
      var result = formatRupiah(harga);
      console.assert(
        typeof result === "string" && result.startsWith("Rp "),
        "Property 4 FAIL: formatRupiah(" + harga + ") = " + result
      );
    }
    console.log("Property 4 (formatRupiah): OK — " + iterations + " iterations");
  }

  // ── Task 2.5: renderMenuCardGrid ──────────────────────────────────────────
  function renderMenuCardGrid(menu, isTomorrow) {
    var imageSrc = getMenuImageSrc(menu);
    var isHabis = menu.status_ketersediaan === "habis";
    var statusBadge = isHabis
      ? '<span class="menu-pill badge-danger">Habis</span>'
      : '<span class="menu-pill badge-success">Tersedia</span>';
    var categoryBadge = '<span class="menu-pill badge-neutral">' + escapeHtml(menu.kategori || "") + '</span>';
    var overlay = isHabis ? '<div class="menu-card-overlay"></div>' : "";
    var habisClass = isHabis ? " is-habis" : "";

    return '<article class="menu-card' + habisClass + '">' +
      '<div class="menu-card-img-wrap">' +
        '<img src="' + escapeHtml(imageSrc) + '" alt="' + escapeHtml(menu.nama_menu || "") + '" loading="lazy" class="menu-card-img" onerror="this.onerror=null;this.src=\'' + escapeHtml(FALLBACK_MENU_IMAGE) + '\'">' +
        overlay +
      '</div>' +
      '<div class="menu-card-body">' +
        '<div class="menu-card-badges">' + statusBadge + categoryBadge + '</div>' +
        '<h3 class="menu-card-title">' + escapeHtml(menu.nama_menu || "") + '</h3>' +
        '<p class="menu-card-desc">' + escapeHtml(menu.deskripsi || "") + '</p>' +
        '<strong class="menu-price">' + formatRupiah(menu.harga) + '</strong>' +
      '</div>' +
    '</article>';
  }

  // ── Task 2.6: Property 2 & 11 — renderMenuCardGrid ───────────────────────
  function verifyProperty2(iterations) {
    iterations = iterations || 100;
    var statuses = ["tersedia", "habis"];
    for (var i = 0; i < iterations; i++) {
      var menu = {
        id: i + 1,
        nama_menu: "Menu Test " + i,
        kategori: "Menu Utama",
        deskripsi: "Deskripsi menu " + i,
        harga: (i + 1) * 5000,
        gambar: "",
        aktif: true,
        status_ketersediaan: statuses[i % 2]
      };
      var html = renderMenuCardGrid(menu, false);
      var doc = new DOMParser().parseFromString(html, "text/html");
      var card = doc.querySelector("article.menu-card");
      console.assert(card !== null, "Property 2 FAIL: no article.menu-card, i=" + i);
      console.assert(doc.body.textContent.indexOf(menu.nama_menu) >= 0, "Property 2 FAIL: nama_menu missing, i=" + i);
      console.assert(doc.body.textContent.indexOf(menu.kategori) >= 0, "Property 2 FAIL: kategori missing, i=" + i);
      console.assert(doc.body.textContent.indexOf("Rp") >= 0, "Property 2 FAIL: harga missing, i=" + i);
      var expectedStatus = menu.status_ketersediaan === "habis" ? "Habis" : "Tersedia";
      console.assert(doc.body.textContent.indexOf(expectedStatus) >= 0, "Property 2 FAIL: status badge missing, i=" + i);
      if (menu.status_ketersediaan === "habis") {
        console.assert(doc.querySelector(".menu-card-overlay") !== null, "Property 2 FAIL: overlay missing for habis, i=" + i);
      }
    }
    console.log("Property 2 (renderMenuCardGrid): OK — " + iterations + " iterations");
  }

  function verifyProperty11(iterations) {
    iterations = iterations || 100;
    for (var i = 0; i < iterations; i++) {
      var menu = {
        id: i + 1,
        nama_menu: "Menu " + i,
        kategori: "Minuman",
        deskripsi: "Desc",
        harga: 10000,
        gambar: "assets/img/test.jpg",
        aktif: true,
        status_ketersediaan: "tersedia"
      };
      var html = renderMenuCardGrid(menu, false);
      var doc = new DOMParser().parseFromString(html, "text/html");
      var img = doc.querySelector("img.menu-card-img");
      console.assert(img !== null, "Property 11 FAIL: no img.menu-card-img, i=" + i);
      console.assert(img && img.getAttribute("alt") === menu.nama_menu, "Property 11 FAIL: alt mismatch, i=" + i);
      console.assert(img && img.getAttribute("loading") === "lazy", "Property 11 FAIL: loading=lazy missing, i=" + i);
    }
    console.log("Property 11 (renderMenuCardGrid img): OK — " + iterations + " iterations");
  }

  // ── Task 2.7: renderMenuGrid ──────────────────────────────────────────────
  function renderMenuGrid(menus) {
    if (!menus || menus.length === 0) {
      return '<div class="menu-grid"></div>';
    }
    var cards = menus.map(function(menu) { return renderMenuCardGrid(menu, false); }).join("");
    return '<div class="menu-grid">' + cards + '</div>';
  }

  // ── Task 2.8: Property 3 — renderMenuGrid ────────────────────────────────
  function verifyProperty3(iterations) {
    iterations = iterations || 100;
    for (var i = 0; i < iterations; i++) {
      var n = Math.floor(Math.random() * 20);
      var menus = [];
      for (var j = 0; j < n; j++) {
        menus.push({
          id: j + 1,
          nama_menu: "Menu " + j,
          kategori: "Menu Utama",
          deskripsi: "Deskripsi",
          harga: 15000,
          gambar: "",
          aktif: true,
          status_ketersediaan: "tersedia"
        });
      }
      var html = renderMenuGrid(menus);
      var doc = new DOMParser().parseFromString(html, "text/html");
      var cards = doc.querySelectorAll("article.menu-card");
      console.assert(cards.length === n, "Property 3 FAIL: expected " + n + " cards, got " + cards.length);
    }
    console.log("Property 3 (renderMenuGrid): OK — " + iterations + " iterations");
  }

  // ── Task 2.9: renderFilterBar ─────────────────────────────────────────────
  function renderFilterBar(menus, activeCategory) {
    var categories = [];
    var seen = {};
    for (var i = 0; i < menus.length; i++) {
      var cat = menus[i].kategori;
      if (cat && !seen[cat]) {
        seen[cat] = true;
        categories.push(cat);
      }
    }

    var allPressed = activeCategory === "Semua" ? "true" : "false";
    var allActive = activeCategory === "Semua" ? " is-active" : "";
    var buttons = '<button class="menu-filter-btn' + allActive + '" data-category="Semua" aria-pressed="' + allPressed + '">Semua</button>';

    for (var k = 0; k < categories.length; k++) {
      var cat = categories[k];
      var isActive = activeCategory === cat;
      var pressed = isActive ? "true" : "false";
      var activeClass = isActive ? " is-active" : "";
      buttons += '<button class="menu-filter-btn' + activeClass + '" data-category="' + escapeHtml(cat) + '" aria-pressed="' + pressed + '">' + escapeHtml(cat) + '</button>';
    }

    return '<div class="menu-filter-bar" role="group" aria-label="Filter kategori menu">' + buttons + '</div>';
  }

  // ── Task 2.10: Property 6 & 8 — renderFilterBar ──────────────────────────
  function verifyProperty6(iterations) {
    iterations = iterations || 100;
    for (var i = 0; i < iterations; i++) {
      var k = Math.floor(Math.random() * 5) + 1;
      var catNames = ["Menu Utama", "Menu Sayur", "Minuman", "Snack", "Paket"];
      var menus = [];
      for (var j = 0; j < k; j++) {
        menus.push({ kategori: catNames[j % catNames.length] });
        menus.push({ kategori: catNames[j % catNames.length] }); // duplicates
      }
      var uniqueCount = {};
      menus.forEach(function(m) { uniqueCount[m.kategori] = true; });
      var K = Object.keys(uniqueCount).length;
      var html = renderFilterBar(menus, "Semua");
      var doc = new DOMParser().parseFromString(html, "text/html");
      var btns = doc.querySelectorAll("button.menu-filter-btn");
      console.assert(btns.length === K + 1, "Property 6 FAIL: expected " + (K + 1) + " buttons, got " + btns.length + ", i=" + i);
    }
    console.log("Property 6 (renderFilterBar button count): OK — " + iterations + " iterations");
  }

  function verifyProperty8(iterations) {
    iterations = iterations || 100;
    var categories = ["Semua", "Menu Utama", "Minuman"];
    var menus = [
      { kategori: "Menu Utama" },
      { kategori: "Minuman" }
    ];
    for (var i = 0; i < iterations; i++) {
      var active = categories[i % categories.length];
      var html = renderFilterBar(menus, active);
      var doc = new DOMParser().parseFromString(html, "text/html");
      var btns = doc.querySelectorAll("button.menu-filter-btn");
      var activeCount = 0;
      btns.forEach(function(btn) {
        if (btn.getAttribute("aria-pressed") === "true") activeCount++;
        if (btn.classList.contains("is-active")) activeCount++;
      });
      // Each active button counted twice (aria-pressed + class), so activeCount should be 2
      console.assert(activeCount === 2, "Property 8 FAIL: expected 2 (1 active btn counted twice), got " + activeCount + ", active=" + active);
    }
    console.log("Property 8 (renderFilterBar single active): OK — " + iterations + " iterations");
  }

  // ── Task 4.1: renderMenuSection ───────────────────────────────────────────
  function renderMenuSection(selector, menus, options) {
    var target = document.querySelector(selector);
    if (!target) return;

    options = options || {};
    var showFilter = options.showFilter === true;
    var isFallback = options.isFallback === true;
    var isTomorrow = options.isTomorrow === true;

    // Reset filter state to "Semua" on each call (closure per invocation)
    var activeCategory = "Semua";

    function getFilteredMenus() {
      if (activeCategory === "Semua") return menus;
      return menus.filter(function(m) { return m.kategori === activeCategory; });
    }

    function renderContent() {
      var filtered = getFilteredMenus();
      var html = "";

      // Fallback notice
      if (isFallback) {
        html += '<div class="menu-fallback-notice">' +
          '<i class="bi bi-info-circle menu-fallback-icon"></i>' +
          'Menu besok belum diperbarui — menampilkan menu hari ini sebagai referensi.' +
          '</div>';
      }

      // Filter bar
      if (showFilter) {
        html += renderFilterBar(menus, activeCategory);
      }

      // Grid or empty state
      if (filtered.length === 0) {
        var emptyMsg = activeCategory !== "Semua"
          ? "Tidak ada menu untuk kategori ini."
          : (isTomorrow
              ? "Menu besok belum ditampilkan. Cek lagi nanti, ya."
              : "Menu hari ini belum tersedia. Silakan cek kembali nanti.");
        html += renderEmptyState(emptyMsg);
      } else {
        html += renderMenuGrid(filtered);
      }

      target.innerHTML = html;

      // Attach event delegation for filter buttons
      if (showFilter) {
        var filterBar = target.querySelector(".menu-filter-bar");
        if (filterBar) {
          filterBar.addEventListener("click", function(e) {
            var btn = e.target.closest("button[data-category]");
            if (!btn) return;
            activeCategory = btn.getAttribute("data-category");
            renderContent();
          });
        }
      }
    }

    renderContent();
  }

  // ── Task 4.2: Property tests untuk renderMenuSection ─────────────────────
  function verifyProperty1(iterations) {
    // Property 1: output contains menu-grid or menu-empty-state, NOT menu-marquee/marquee-shell
    iterations = iterations || 20;
    var testCases = [
      [],
      [{ id: 1, nama_menu: "A", kategori: "Menu Utama", deskripsi: "D", harga: 10000, gambar: "", aktif: true, status_ketersediaan: "tersedia" }]
    ];
    testCases.forEach(function(menus) {
      // Create a temporary container
      var div = document.createElement("div");
      div.id = "__test_section__";
      document.body.appendChild(div);
      renderMenuSection("#__test_section__", menus, { showFilter: false });
      var html = div.innerHTML;
      console.assert(html.indexOf("menu-marquee") === -1, "Property 1 FAIL: found menu-marquee in output");
      console.assert(html.indexOf("marquee-shell") === -1, "Property 1 FAIL: found marquee-shell in output");
      console.assert(
        html.indexOf("menu-grid") >= 0 || html.indexOf("menu-empty-state") >= 0,
        "Property 1 FAIL: neither menu-grid nor menu-empty-state found"
      );
      document.body.removeChild(div);
    });
    console.log("Property 1 (renderMenuSection no marquee): OK");
  }

  function verifyProperty5(iterations) {
    // Property 5: filter bar present iff showFilter === true
    iterations = iterations || 20;
    var menus = [
      { id: 1, nama_menu: "A", kategori: "Menu Utama", deskripsi: "D", harga: 10000, gambar: "", aktif: true, status_ketersediaan: "tersedia" }
    ];
    [true, false].forEach(function(showFilter) {
      var div = document.createElement("div");
      div.id = "__test_filter__";
      document.body.appendChild(div);
      renderMenuSection("#__test_filter__", menus, { showFilter: showFilter });
      var hasFilterBar = div.querySelector(".menu-filter-bar") !== null;
      if (showFilter) {
        console.assert(hasFilterBar, "Property 5 FAIL: filter bar missing when showFilter=true");
      } else {
        console.assert(!hasFilterBar, "Property 5 FAIL: filter bar present when showFilter=false");
      }
      document.body.removeChild(div);
    });
    console.log("Property 5 (renderMenuSection filter bar): OK");
  }

  function verifyProperty10() {
    // Property 10: fallback notice present iff isFallback=true
    var menus = [
      { id: 1, nama_menu: "A", kategori: "Menu Utama", deskripsi: "D", harga: 10000, gambar: "", aktif: true, status_ketersediaan: "tersedia" }
    ];
    [true, false].forEach(function(isFallback) {
      var div = document.createElement("div");
      div.id = "__test_fallback__";
      document.body.appendChild(div);
      renderMenuSection("#__test_fallback__", menus, { showFilter: false, isFallback: isFallback });
      var hasNotice = div.querySelector(".menu-fallback-notice") !== null;
      if (isFallback) {
        console.assert(hasNotice, "Property 10 FAIL: fallback notice missing when isFallback=true");
      } else {
        console.assert(!hasNotice, "Property 10 FAIL: fallback notice present when isFallback=false");
      }
      document.body.removeChild(div);
    });
    console.log("Property 10 (renderMenuSection fallback notice): OK");
  }

})();

