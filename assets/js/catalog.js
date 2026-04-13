(function () {
  "use strict";

  // === MODULE STATE ===
  let allItems = [];
  let cart = [];
  let activeCategory = "Semua";

  // === RUPIAH FORMATTER ===
  function formatRupiah(angka) {
    return "Rp " + (Number(angka) || 0).toLocaleString("id-ID");
  }

  // === RENDER MENU GRID ===
  function renderMenuGrid(items) {
    var grid = document.getElementById("catalog-menu-grid");
    if (!grid) return;

    if (!items || items.length === 0) {
      grid.innerHTML =
        '<div class="col-12">' +
        '<div class="catalog-state-box">' +
        '<i class="bi bi-search"></i>' +
        "<p>Tidak ada menu yang sesuai</p>" +
        "<span>Coba kata kunci lain atau pilih kategori berbeda</span>" +
        "</div></div>";
      return;
    }

    var html = "";
    items.forEach(function (item) {
      var isHabis = item.status_ketersediaan === "habis";
      var badgeClass = isHabis ? "badge-habis" : "badge-tersedia";
      var badgeText = isHabis ? "Habis" : "Tersedia";
      var btnDisabled = isHabis ? " disabled" : "";
      var imgSrc = item.gambar || "assets/img/about.jpg";

      html +=
        '<div class="col-12 col-sm-6 col-lg-4">' +
        '<div class="menu-card h-100">' +
        '<div class="menu-card-img-wrap">' +
        '<img src="' + imgSrc + '"' +
        ' alt="' + item.nama_menu + '"' +
        ' loading="lazy"' +
        ' onerror="this.onerror=null;this.src=\'assets/img/about.jpg\'"' +
        ' class="menu-card-img">' +
        '<span class="menu-card-badge ' + badgeClass + '">' + badgeText + "</span>" +
        "</div>" +
        '<div class="menu-card-body">' +
        '<span class="menu-card-kategori">' + item.kategori + "</span>" +
        '<h3 class="menu-card-nama">' + item.nama_menu + "</h3>" +
        '<p class="menu-card-deskripsi">' + (item.deskripsi || "") + "</p>" +
        '<div class="menu-card-footer">' +
        '<span class="menu-card-harga">' + formatRupiah(item.harga) + "</span>" +
        '<button type="button" class="btn-tambah-keranjang"' +
        ' data-id="' + item.id + '"' +
        btnDisabled + ">" +
        '<i class="bi bi-cart-plus"></i> Tambah' +
        "</button>" +
        "</div>" +
        "</div>" +
        "</div>" +
        "</div>";
    });

    grid.innerHTML = html;
  }

  // === APPLY FILTERS ===
  function applyFilters() {
    var searchInput = document.getElementById("catalog-search-input");
    var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";

    var filtered = allItems;

    if (activeCategory !== "Semua") {
      filtered = filtered.filter(function (item) {
        return item.kategori === activeCategory;
      });
    }

    if (keyword !== "") {
      filtered = filtered.filter(function (item) {
        return (
          (item.nama_menu || "").toLowerCase().indexOf(keyword) !== -1 ||
          (item.deskripsi || "").toLowerCase().indexOf(keyword) !== -1
        );
      });
    }

    renderMenuGrid(filtered);
  }

  // === CATEGORY FILTER ===
  function initCategoryFilter() {
    var filterContainer = document.getElementById("catalog-category-filter");
    if (!filterContainer) return;

    var buttons = filterContainer.querySelectorAll(".catalog-filter-btn");
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        buttons.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        activeCategory = btn.getAttribute("data-category") || "Semua";
        applyFilters();
      });
    });
  }

  // === SEARCH BAR ===
  function initSearchBar() {
    var searchInput = document.getElementById("catalog-search-input");
    if (!searchInput) return;
    searchInput.addEventListener("input", applyFilters);
  }

  // === LOAD MENU DATA ===
  function loadMenuData() {
    var grid = document.getElementById("catalog-menu-grid");

    fetch("data/menu.json", { cache: "no-store" })
      .then(function (response) {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.json();
      })
      .then(function (data) {
        var masterMenu = data.master_menu;
        if (!Array.isArray(masterMenu)) throw new Error("Format data tidak valid");

        allItems = masterMenu.filter(function (item) { return item.aktif === true; });

        if (allItems.length === 0) {
          if (grid) {
            grid.innerHTML =
              '<div class="col-12"><div class="catalog-state-box">' +
              '<i class="bi bi-journal-x"></i>' +
              "<p>Menu belum tersedia saat ini</p>" +
              "<span>Silakan kembali lagi nanti</span>" +
              "</div></div>";
          }
          return;
        }

        renderMenuGrid(allItems);
      })
      .catch(function (err) {
        console.error("Gagal memuat data menu:", err);
        if (grid) {
          grid.innerHTML =
            '<div class="col-12"><div class="catalog-state-box is-error">' +
            '<i class="bi bi-exclamation-triangle"></i>' +
            "<p>Gagal memuat data menu</p>" +
            "<span>Pastikan file data/menu.json tersedia, lalu muat ulang halaman</span>" +
            "</div></div>";
        }
      });
  }

  // ============================================================
  // CART
  // ============================================================

  function addToCart(menuItem) {
    var existing = cart.find(function (c) { return c.id === menuItem.id; });
    if (existing) {
      existing.kuantitas += 1;
    } else {
      cart.push({
        id: menuItem.id,
        nama_menu: menuItem.nama_menu,
        harga: menuItem.harga,
        gambar: menuItem.gambar || "assets/img/about.jpg",
        kuantitas: 1
      });
    }
    renderCartPanel();
  }

  function changeQty(id, delta) {
    var idx = cart.findIndex(function (c) { return c.id === id; });
    if (idx === -1) return;
    cart[idx].kuantitas += delta;
    if (cart[idx].kuantitas <= 0) {
      cart.splice(idx, 1);
    }
    renderCartPanel();
  }

  function renderCartPanel() {
    var listEl = document.getElementById("cart-items-list");
    var totalEl = document.getElementById("cart-total-price");
    var badgeEl = document.getElementById("cart-count-badge");
    var fabBadgeEl = document.getElementById("cart-fab-badge");
    var checkoutBtn = document.getElementById("cart-checkout-btn");

    var totalItems = cart.reduce(function (s, c) { return s + c.kuantitas; }, 0);
    var totalHarga = cart.reduce(function (s, c) { return s + c.harga * c.kuantitas; }, 0);

    if (badgeEl) badgeEl.textContent = totalItems;
    if (fabBadgeEl) fabBadgeEl.textContent = totalItems;
    if (totalEl) totalEl.textContent = formatRupiah(totalHarga);

    if (checkoutBtn) {
      checkoutBtn.disabled = cart.length === 0;
    }

    if (!listEl) return;

    if (cart.length === 0) {
      listEl.innerHTML =
        '<div class="cart-empty-state">' +
        '<i class="bi bi-cart-x"></i>' +
        "<p>Keranjang masih kosong</p>" +
        "<span>Tambahkan menu yang ingin dipesan</span>" +
        "</div>";
      return;
    }

    var html = "";
    cart.forEach(function (item) {
      var subtotal = formatRupiah(item.harga * item.kuantitas);
      html +=
        '<div class="cart-item" data-id="' + item.id + '">' +
        '<img src="' + item.gambar + '" alt="' + item.nama_menu + '" class="cart-item-img"' +
        ' onerror="this.onerror=null;this.src=\'assets/img/about.jpg\'">' +
        '<div class="cart-item-info">' +
        '<div class="cart-item-nama">' + item.nama_menu + "</div>" +
        '<div class="cart-item-harga-satuan">' + formatRupiah(item.harga) + " / porsi</div>" +
        "</div>" +
        '<div class="cart-item-right">' +
        '<div class="cart-item-qty">' +
        '<button class="cart-qty-btn" data-action="minus" data-id="' + item.id + '" aria-label="Kurangi">−</button>' +
        '<span class="cart-qty-num">' + item.kuantitas + "</span>" +
        '<button class="cart-qty-btn" data-action="plus" data-id="' + item.id + '" aria-label="Tambah">+</button>' +
        "</div>" +
        '<span class="cart-item-subtotal">' + subtotal + "</span>" +
        "</div>" +
        "</div>";
    });

    listEl.innerHTML = html;
  }

  // === CART EVENT DELEGATION ===
  function initCartEvents() {
    var listEl = document.getElementById("cart-items-list");
    if (listEl) {
      listEl.addEventListener("click", function (e) {
        var btn = e.target.closest(".cart-qty-btn");
        if (!btn) return;
        var id = parseInt(btn.getAttribute("data-id"), 10);
        var action = btn.getAttribute("data-action");
        changeQty(id, action === "plus" ? 1 : -1);
      });
    }

    // Add to cart via grid delegation
    var grid = document.getElementById("catalog-menu-grid");
    if (grid) {
      grid.addEventListener("click", function (e) {
        var btn = e.target.closest(".btn-tambah-keranjang");
        if (!btn || btn.disabled) return;
        var id = parseInt(btn.getAttribute("data-id"), 10);
        var item = allItems.find(function (m) { return m.id === id; });
        if (item) addToCart(item);
      });
    }
  }

  // === WHATSAPP CHECKOUT ===
  function buildOrderMessage() {
    var lines = ["Halo, saya ingin memesan:\n"];
    cart.forEach(function (item) {
      lines.push(
        "- " + item.nama_menu +
        " x" + item.kuantitas +
        " = " + formatRupiah(item.harga * item.kuantitas)
      );
    });
    var total = cart.reduce(function (s, c) { return s + c.harga * c.kuantitas; }, 0);
    lines.push("\nTotal: " + formatRupiah(total));
    lines.push("\nMohon konfirmasi ketersediaan. Terima kasih!");
    return lines.join("\n");
  }

  function initCheckout() {
    var btn = document.getElementById("cart-checkout-btn");
    if (!btn) return;
    btn.addEventListener("click", function () {
      if (cart.length === 0) {
        alert("Keranjang masih kosong. Tambahkan menu terlebih dahulu.");
        return;
      }
      var msg = buildOrderMessage();
      window.open(
        "https://wa.me/6289540571803?text=" + encodeURIComponent(msg),
        "_blank",
        "noopener,noreferrer"
      );
    });
  }

  // === MOBILE CART TOGGLE ===
  function initCartToggle() {
    var fab = document.getElementById("cart-fab");
    var panel = document.getElementById("cart-panel");
    var closeBtn = document.getElementById("cart-panel-close");
    var overlay = document.getElementById("cart-overlay");

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

  // === INIT ===
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
