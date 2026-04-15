(function () {
  "use strict";

  let allItems = [];
  let cart = [];
  let activeCategory = "Semua";
  const FALLBACK_IMAGE = "assets/img/about.jpg";

  function formatRupiah(angka) {
    return "Rp " + (Number(angka) || 0).toLocaleString("id-ID");
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalizeImagePath(value) {
    const raw = String(value || "").trim();
    if (!raw) return FALLBACK_IMAGE;
    if (raw.startsWith("data:") || raw.startsWith("blob:") || /^https?:\/\//i.test(raw)) return raw;
    return raw.replace(/\\/g, "/").replace(/^\.?\//, "");
  }

  function renderMenuGrid(items) {
    const grid = document.getElementById("catalog-menu-grid");
    if (!grid) return;

    if (!items || items.length === 0) {
      grid.innerHTML =
        '<div class="col-12"><div class="catalog-state-box">' +
        '<i class="bi bi-search"></i>' +
        "<p>Belum ketemu menu yang kamu cari</p>" +
        "<span>Coba ganti kata kunci atau pilih kategori lain.</span>" +
        "</div></div>";
      return;
    }

    grid.innerHTML = items.map(function (item) {
      const isAktif = item.aktif !== false;
      const isHabis = item.status_ketersediaan === "habis";
      const badgeClass = !isAktif ? "badge-nonaktif" : (isHabis ? "badge-habis" : "badge-tersedia");
      const badgeText = !isAktif ? "Nonaktif" : (isHabis ? "Habis" : "Tersedia");
      const buttonDisabled = (!isAktif || isHabis) ? " disabled" : "";
      const imageSrc = normalizeImagePath(item.gambar || FALLBACK_IMAGE);
      const description = item.deskripsi || "Masakan rumahan yang siap bikin waktu makan terasa lebih nikmat.";

      return (
        '<div class="col-12 col-sm-6 col-xl-4">' +
          '<article class="menu-card h-100' + (isHabis ? ' is-habis' : '') + '">' +
            '<div class="menu-card-img-wrap">' +
              '<img src="' + escapeHtml(imageSrc) + '" alt="' + escapeHtml(item.nama_menu) + '" loading="lazy" onerror="this.onerror=null;this.src=\'' + FALLBACK_IMAGE + '\'" class="menu-card-img">' +
              '<span class="menu-card-badge ' + badgeClass + '">' + escapeHtml(badgeText) + "</span>" +
            "</div>" +
            '<div class="menu-card-body">' +
              '<span class="menu-card-kategori">' + escapeHtml(item.kategori) + "</span>" +
              '<h3 class="menu-card-nama">' + escapeHtml(item.nama_menu) + "</h3>" +
              '<p class="menu-card-deskripsi">' + escapeHtml(description) + "</p>" +
              '<div class="menu-card-footer">' +
                '<span class="menu-card-harga">' + formatRupiah(item.harga) + "</span>" +
                '<button type="button" class="btn-tambah-keranjang" data-id="' + item.id + '"' + buttonDisabled + ">" +
                  '<i class="bi bi-cart-plus"></i> Pilih' +
                "</button>" +
              "</div>" +
            "</div>" +
          "</article>" +
        "</div>"
      );
    }).join("");
  }

  function applyFilters() {
    const searchInput = document.getElementById("catalog-search-input");
    const keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";

    let filtered = allItems.slice();
    if (activeCategory !== "Semua") {
      filtered = filtered.filter(function (item) {
        return item.kategori === activeCategory;
      });
    }

    if (keyword) {
      filtered = filtered.filter(function (item) {
        return (item.nama_menu || "").toLowerCase().includes(keyword) || (item.deskripsi || "").toLowerCase().includes(keyword);
      });
    }

    renderMenuGrid(filtered);
  }

  function initCategoryFilter() {
    const filterContainer = document.getElementById("catalog-category-filter");
    if (!filterContainer) return;

    const buttons = filterContainer.querySelectorAll(".catalog-filter-btn");
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        buttons.forEach(function (node) { node.classList.remove("active"); });
        button.classList.add("active");
        activeCategory = button.getAttribute("data-category") || "Semua";
        applyFilters();
      });
    });
  }

  function initSearchBar() {
    const searchInput = document.getElementById("catalog-search-input");
    if (!searchInput) return;
    searchInput.addEventListener("input", applyFilters);
  }

  function loadMenuData() {
    const grid = document.getElementById("catalog-menu-grid");

    fetch("data/menu.json", { cache: "no-store" })
      .then(function (response) {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.json();
      })
      .then(function (data) {
        const masterMenu = data.master_menu;
        if (!Array.isArray(masterMenu)) throw new Error("Format data tidak valid");
        allItems = masterMenu.slice();

        if (allItems.length === 0) {
          if (grid) {
            grid.innerHTML =
              '<div class="col-12"><div class="catalog-state-box">' +
              '<i class="bi bi-journal-x"></i>' +
              "<p>Menu belum siap ditampilkan</p>" +
              "<span>Coba cek lagi sebentar lagi, ya.</span>" +
              "</div></div>";
          }
          return;
        }

        renderMenuGrid(allItems);
      })
      .catch(function (error) {
        console.error("Gagal memuat data menu:", error);
        if (grid) {
          grid.innerHTML =
            '<div class="col-12"><div class="catalog-state-box is-error">' +
            '<i class="bi bi-exclamation-triangle"></i>' +
            "<p>Menu belum berhasil dimuat</p>" +
            "<span>Coba muat ulang halaman dan pastikan data menu tersedia.</span>" +
            "</div></div>";
        }
      });
  }

  function addToCart(menuItem) {
    const existing = cart.find(function (item) { return item.id === menuItem.id; });
    if (existing) {
      existing.kuantitas += 1;
    } else {
      cart.push({
        id: menuItem.id,
        nama_menu: menuItem.nama_menu,
        harga: menuItem.harga,
        gambar: normalizeImagePath(menuItem.gambar || FALLBACK_IMAGE),
        kuantitas: 1
      });
    }
    renderCartPanel();
  }

  function changeQty(id, delta) {
    const index = cart.findIndex(function (item) { return item.id === id; });
    if (index === -1) return;
    cart[index].kuantitas += delta;
    if (cart[index].kuantitas <= 0) cart.splice(index, 1);
    renderCartPanel();
  }

  function renderCartPanel() {
    const listEl = document.getElementById("cart-items-list");
    const totalEl = document.getElementById("cart-total-price");
    const badgeEl = document.getElementById("cart-count-badge");
    const fabBadgeEl = document.getElementById("cart-fab-badge");
    const checkoutBtn = document.getElementById("cart-checkout-btn");

    const totalItems = cart.reduce(function (sum, item) { return sum + item.kuantitas; }, 0);
    const totalHarga = cart.reduce(function (sum, item) { return sum + item.harga * item.kuantitas; }, 0);

    if (badgeEl) badgeEl.textContent = String(totalItems);
    if (fabBadgeEl) fabBadgeEl.textContent = String(totalItems);
    if (totalEl) totalEl.textContent = formatRupiah(totalHarga);
    if (checkoutBtn) checkoutBtn.disabled = cart.length === 0;
    if (!listEl) return;

    if (cart.length === 0) {
      listEl.innerHTML =
        '<div class="cart-empty-state">' +
        '<i class="bi bi-cart-x"></i>' +
        "<p>Belum ada menu di keranjang</p>" +
        "<span>Pilih menu favoritmu dulu, lalu lanjut pesan.</span>" +
        "</div>";
      return;
    }

    listEl.innerHTML = cart.map(function (item) {
      return (
        '<div class="cart-item" data-id="' + item.id + '">' +
          '<img src="' + escapeHtml(item.gambar) + '" alt="' + escapeHtml(item.nama_menu) + '" class="cart-item-img" onerror="this.onerror=null;this.src=\'' + FALLBACK_IMAGE + '\'">' +
          '<div class="cart-item-info">' +
            '<div class="cart-item-nama">' + escapeHtml(item.nama_menu) + "</div>" +
            '<div class="cart-item-harga-satuan">' + formatRupiah(item.harga) + " / porsi</div>" +
            '<div class="cart-item-right">' +
              '<div class="cart-item-qty">' +
                '<button class="cart-qty-btn" data-action="minus" data-id="' + item.id + '" aria-label="Kurangi">-</button>' +
                '<span class="cart-qty-num">' + item.kuantitas + "</span>" +
                '<button class="cart-qty-btn" data-action="plus" data-id="' + item.id + '" aria-label="Tambah">+</button>' +
              "</div>" +
              '<span class="cart-item-subtotal">' + formatRupiah(item.harga * item.kuantitas) + "</span>" +
            "</div>" +
          "</div>" +
        "</div>"
      );
    }).join("");
  }

  function initCartEvents() {
    const listEl = document.getElementById("cart-items-list");
    if (listEl) {
      listEl.addEventListener("click", function (event) {
        const button = event.target.closest(".cart-qty-btn");
        if (!button) return;
        const id = parseInt(button.getAttribute("data-id"), 10);
        const action = button.getAttribute("data-action");
        changeQty(id, action === "plus" ? 1 : -1);
      });
    }

    const grid = document.getElementById("catalog-menu-grid");
    if (grid) {
      grid.addEventListener("click", function (event) {
        const button = event.target.closest(".btn-tambah-keranjang");
        if (!button || button.disabled) return;
        const id = parseInt(button.getAttribute("data-id"), 10);
        const item = allItems.find(function (menu) { return menu.id === id; });
        if (item) addToCart(item);
      });
    }
  }

  function buildOrderMessage() {
    const lines = ["Halo, saya ingin memesan:", ""];
    cart.forEach(function (item) {
      lines.push("- " + item.nama_menu + " x" + item.kuantitas + " = " + formatRupiah(item.harga * item.kuantitas));
    });
    const total = cart.reduce(function (sum, item) { return sum + item.harga * item.kuantitas; }, 0);
    lines.push("");
    lines.push("Total: " + formatRupiah(total));
    lines.push("");
    lines.push("Mohon konfirmasi ketersediaan. Terima kasih.");
    return lines.join("\n");
  }

  function initCheckout() {
    const button = document.getElementById("cart-checkout-btn");
    if (!button) return;
    button.addEventListener("click", function () {
      if (cart.length === 0) {
        window.alert("Keranjang masih kosong. Pilih menu dulu, lalu lanjut pesan.");
        return;
      }
      const message = buildOrderMessage();
      window.open("https://wa.me/6289540571803?text=" + encodeURIComponent(message), "_blank", "noopener,noreferrer");
    });
  }

  function initCartToggle() {
    const fab = document.getElementById("cart-fab");
    const panel = document.getElementById("cart-panel");
    const closeBtn = document.getElementById("cart-panel-close");
    const overlay = document.getElementById("cart-overlay");

    function openCart() {
      if (panel) panel.classList.add("is-open");
      if (overlay) overlay.classList.add("is-visible");
      document.body.style.overflow = "hidden";
    }

    function closeCart() {
      if (panel) panel.classList.remove("is-open");
      if (overlay) overlay.classList.remove("is-visible");
      document.body.style.overflow = "";
    }

    if (fab) fab.addEventListener("click", openCart);
    if (closeBtn) closeBtn.addEventListener("click", closeCart);
    if (overlay) overlay.addEventListener("click", closeCart);
  }

  document.addEventListener("DOMContentLoaded", function () {
    loadMenuData();
    initCategoryFilter();
    initSearchBar();
    initCartEvents();
    initCheckout();
    initCartToggle();
    renderCartPanel();
  });
})();
