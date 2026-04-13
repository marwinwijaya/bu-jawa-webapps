(function () {
  "use strict";

  // === MODULE STATE ===
  let allItems = [];
  let activeCategory = "Semua";

  // === TASK 3.1 — formatRupiah ===
  function formatRupiah(angka) {
    return "Rp " + angka.toLocaleString("id-ID");
  }

  // === TASK 3.2 — renderMenuGrid ===
  function renderMenuGrid(items) {
    var grid = document.getElementById("catalog-menu-grid");
    if (!grid) return;

    if (!items || items.length === 0) {
      grid.innerHTML =
        '<div class="col-12 text-center py-5">' +
        '<i class="bi bi-search fs-1 text-muted"></i>' +
        '<p class="mt-3 text-muted">Tidak ada menu yang sesuai dengan pencarian Anda.</p>' +
        "</div>";
      return;
    }

    var html = "";
    items.forEach(function (item) {
      var isHabis = item.status_ketersediaan === "habis";
      var badgeClass = isHabis ? "badge-habis" : "badge-tersedia";
      var badgeText = isHabis ? "Habis" : "Tersedia";
      var btnDisabled = isHabis ? ' disabled aria-disabled="true"' : "";

      html +=
        '<div class="col-12 col-sm-6 col-lg-4">' +
        '<div class="menu-card h-100">' +
        '<div class="menu-card-img-wrap">' +
        '<img src="' + (item.gambar || "assets/img/about.jpg") + '"' +
        ' alt="' + item.nama_menu + '"' +
        ' loading="lazy"' +
        ' onerror="this.onerror=null;this.src=\'assets/img/about.jpg\'"' +
        ' class="menu-card-img">' +
        '<span class="menu-card-badge ' + badgeClass + '">' + badgeText + "</span>" +
        "</div>" +
        '<div class="menu-card-body">' +
        '<span class="menu-card-kategori">' + item.kategori + "</span>" +
        '<h3 class="menu-card-nama">' + item.nama_menu + "</h3>" +
        '<p class="menu-card-deskripsi">' + item.deskripsi + "</p>" +
        '<div class="menu-card-footer">' +
        '<span class="menu-card-harga">' + formatRupiah(item.harga) + "</span>" +
        '<button type="button" class="btn btn-tambah-keranjang"' +
        ' data-id="' + item.id + '"' +
        btnDisabled + ">" +
        '<i class="bi bi-cart-plus"></i> Tambah ke Keranjang' +
        "</button>" +
        "</div>" +
        "</div>" +
        "</div>" +
        "</div>";
    });

    grid.innerHTML = html;
  }

  // === TASK 6 — applyFilters ===
  function applyFilters() {
    var searchInput = document.getElementById("catalog-search-input");
    var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";

    var filtered = allItems;

    // Filter by category
    if (activeCategory !== "Semua") {
      filtered = filtered.filter(function (item) {
        return item.kategori === activeCategory;
      });
    }

    // Filter by keyword
    if (keyword !== "") {
      filtered = filtered.filter(function (item) {
        return (
          item.nama_menu.toLowerCase().indexOf(keyword) !== -1 ||
          item.deskripsi.toLowerCase().indexOf(keyword) !== -1
        );
      });
    }

    renderMenuGrid(filtered);
  }

  // === TASK 4 — initCategoryFilter ===
  function initCategoryFilter() {
    var filterContainer = document.getElementById("catalog-category-filter");
    if (!filterContainer) return;

    var buttons = filterContainer.querySelectorAll(".catalog-filter-btn");
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        // Update active state
        buttons.forEach(function (b) {
          b.classList.remove("active");
        });
        btn.classList.add("active");

        activeCategory = btn.getAttribute("data-category") || "Semua";
        applyFilters();
      });
    });
  }

  // === TASK 5 — Search Bar ===
  function initSearchBar() {
    var searchInput = document.getElementById("catalog-search-input");
    if (!searchInput) return;

    searchInput.addEventListener("input", function () {
      applyFilters();
    });
  }

  // === TASK 2.1 & 2.2 — loadMenuData ===
  function loadMenuData() {
    var grid = document.getElementById("catalog-menu-grid");

    fetch("data/menu.json", { cache: "no-store" })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("HTTP " + response.status);
        }
        return response.json();
      })
      .then(function (data) {
        var masterMenu = data.master_menu;

        if (!Array.isArray(masterMenu)) {
          throw new Error("Format data tidak valid");
        }

        allItems = masterMenu.filter(function (item) {
          return item.aktif === true;
        });

        if (allItems.length === 0) {
          if (grid) {
            grid.innerHTML =
              '<div class="col-12 text-center py-5">' +
              '<i class="bi bi-journal-x fs-1 text-muted"></i>' +
              '<p class="mt-3 text-muted">Menu belum tersedia saat ini.</p>' +
              "</div>";
          }
          return;
        }

        renderMenuGrid(allItems);
      })
      .catch(function (err) {
        console.error("Gagal memuat data menu:", err);
        if (grid) {
          grid.innerHTML =
            '<div class="col-12 text-center py-5">' +
            '<i class="bi bi-exclamation-triangle fs-1 text-danger"></i>' +
            '<p class="mt-3 text-danger fw-semibold">Gagal memuat data menu.</p>' +
            '<p class="text-muted small">Pastikan file <code>data/menu.json</code> tersedia dan coba muat ulang halaman.</p>' +
            "</div>";
        }
      });
  }

  // === INIT ===
  document.addEventListener("DOMContentLoaded", function () {
    loadMenuData();
    initCategoryFilter();
    initSearchBar();
  });

  // === CART STATE & FUNCTIONS (Tasks 8-10) ===

})();
