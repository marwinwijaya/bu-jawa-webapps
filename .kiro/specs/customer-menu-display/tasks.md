# Implementation Plan: Customer Menu Display

## Overview

Ganti tampilan marquee/scrolling horizontal pada section menu di `index.html` dengan layout grid statis yang mendukung filter kategori. Perubahan menyentuh tiga file: `index.html` (struktur HTML), `assets/js/site.js` (logika render), dan `assets/css/style.css` (kelas CSS baru).

## Tasks

- [x] 1. Tambah kelas CSS baru untuk grid dan kartu menu di `style.css`
  - Tambah `.menu-filter-bar`, `.menu-filter-btn`, `.menu-filter-btn.is-active` untuk filter bar
  - Tambah `.menu-grid` dengan layout responsif: 1 kolom `< 576px`, 2 kolom `576px–991px`, 3 kolom `≥ 992px`
  - Tambah `.menu-card`, `.menu-card-img-wrap`, `.menu-card-img`, `.menu-card-overlay` untuk kartu grid vertikal
  - Tambah `.menu-card-body`, `.menu-card-badges`, `.menu-card-title`, `.menu-card-desc` untuk konten kartu
  - Tambah `.menu-empty-state` untuk tampilan empty state yang konsisten (ikon + pesan)
  - Tambah `.menu-fallback-notice` untuk banner fallback menu besok
  - Kelas marquee lama (`menu-marquee`, `marquee-shell`, dll.) **tidak dihapus**
  - _Requirements: 1.2, 2.1, 2.5, 4.4_

- [x] 2. Implementasi fungsi-fungsi render baru di `site.js`
  - [x] 2.1 Implementasi `renderEmptyState(message)`
    - Kembalikan HTML string dengan elemen ikon Bootstrap Icons dan teks pesan
    - Gunakan kelas `.menu-empty-state`
    - _Requirements: 4.1, 4.2, 4.4_

  - [x] 2.2 Tulis property test untuk `renderEmptyState`
    - **Property 9: Empty state selalu mengandung pesan yang diberikan**
    - **Validates: Requirements 4.4**

  - [x] 2.3 Implementasi `formatRupiah(harga)` (refactor dari fungsi yang sudah ada)
    - Pastikan output dimulai dengan `"Rp "` dan menggunakan `toLocaleString("id-ID")`
    - Fungsi ini sudah ada — pastikan tidak ada perubahan perilaku, hanya dipindah/diekspos jika perlu
    - _Requirements: 2.3_

  - [x] 2.4 Tulis property test untuk `formatRupiah`
    - **Property 4: Format Rupiah selalu konsisten**
    - **Validates: Requirements 2.3**

  - [x] 2.5 Implementasi `renderMenuCard(menu, isTomorrow)`
    - Gunakan elemen `<article class="menu-card">`
    - Tampilkan foto dengan rasio 4:3, `object-fit: cover`, `loading="lazy"`, `alt` = nama menu, `onerror` fallback ke `FALLBACK_MENU_IMAGE`
    - Tampilkan Status_Badge: hijau "Tersedia" atau merah "Habis" sesuai `status_ketersediaan`
    - Tampilkan overlay `.menu-card-overlay` jika `status_ketersediaan === "habis"`
    - Tampilkan nama, kategori (badge berwarna), harga (`formatRupiah`), deskripsi (max 3 baris via `line-clamp`)
    - _Requirements: 1.3, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 6.1, 6.3, 6.4, 6.5_

  - [x] 2.6 Tulis property test untuk `renderMenuCard`
    - **Property 2: Kartu menu mengandung semua informasi wajib dan badge yang benar**
    - **Property 11: Setiap gambar kartu menu memiliki alt dan loading lazy**
    - **Validates: Requirements 1.3, 2.6, 2.7, 6.1, 6.4**

  - [x] 2.7 Implementasi `renderMenuGrid(menus)`
    - Kembalikan HTML string `<div class="menu-grid">` berisi N elemen `<article class="menu-card">` dari `renderMenuCard`
    - _Requirements: 1.5, 6.3_

  - [x] 2.8 Tulis property test untuk `renderMenuGrid`
    - **Property 3: Jumlah kartu sama dengan jumlah menu yang diberikan**
    - **Validates: Requirements 1.5, 6.3**

  - [x] 2.9 Implementasi `renderFilterBar(menus, activeCategory)`
    - Ekstrak kategori unik dari array `menus` secara dinamis
    - Render tombol "Semua" + satu tombol per kategori unik
    - Tombol aktif mendapat kelas `is-active` dan `aria-pressed="true"`; tombol lain `aria-pressed="false"`
    - Gunakan `data-category` attribute pada setiap tombol untuk event delegation
    - Bungkus dalam `<div class="menu-filter-bar" role="group" aria-label="Filter kategori menu">`
    - _Requirements: 3.1, 3.2, 3.5, 6.2_

  - [x] 2.10 Tulis property test untuk `renderFilterBar`
    - **Property 6: Jumlah tombol filter = jumlah kategori unik + 1**
    - **Property 8: Tepat satu tombol filter aktif pada satu waktu**
    - **Validates: Requirements 3.2, 3.5, 6.2**

- [x] 3. Checkpoint — Pastikan semua fungsi render baru menghasilkan HTML yang valid
  - Pastikan semua tests pass, tanyakan ke user jika ada pertanyaan.

- [x] 4. Implementasi `renderMenuSection` dan sambungkan ke `renderPublicPage` di `site.js`
  - [x] 4.1 Implementasi `renderMenuSection(selector, menus, options)`
    - Jika `menus` kosong: render `renderEmptyState` dengan pesan sesuai konteks (hari ini / besok)
    - Jika `options.isFallback`: render `.menu-fallback-notice` di atas grid
    - Jika `options.showFilter === true`: render `renderFilterBar` + pasang event delegation untuk klik tombol filter
    - Filter state (`activeCategory`) disimpan di closure — reset ke `"Semua"` setiap kali fungsi dipanggil
    - Saat tombol filter diklik: filter array `menus` sesuai kategori, re-render grid (atau empty state jika kosong)
    - Render `renderMenuGrid` dengan data yang sudah difilter
    - _Requirements: 1.1, 3.3, 3.4, 3.6, 3.7, 4.1, 4.2, 5.1, 5.2, 5.3_

  - [x] 4.2 Tulis property test untuk `renderMenuSection`
    - **Property 1: Render grid, bukan marquee**
    - **Property 5: Filter bar ada atau tidak ada sesuai opsi `showFilter`**
    - **Property 7: Filter menampilkan hanya kartu yang sesuai kategori**
    - **Property 10: Fallback besok menggunakan data hari ini dengan notice**
    - **Validates: Requirements 1.1, 3.1, 3.3, 3.4, 3.7, 5.1, 5.2, 5.3**

  - [x] 4.3 Ganti pemanggilan `renderMenuList` dengan `renderMenuSection` di `renderPublicPage`
    - `renderMenuSection("#menu-hari-ini-list", menuHariIni, { showFilter: true })`
    - `renderMenuSection("#menu-besok-list", menuBesok, { showFilter: false, isTomorrow: true, isFallback })`
    - Hapus fungsi `renderMenuList` lama dan `renderMenuCard` lama (versi marquee)
    - Update `renderErrorState` agar menggunakan `renderEmptyState` dan kelas baru (bukan `marquee-shell`)
    - _Requirements: 1.1, 4.3_

- [x] 5. Update struktur HTML section menu di `index.html`
  - Hapus markup `public-menu-legend` dari kedua section (tidak relevan untuk grid)
  - Pastikan `<div id="menu-hari-ini-list">` dan `<div id="menu-besok-list">` tetap ada sebagai container target
  - Tidak ada perubahan lain pada struktur section — `site.js` yang mengisi konten secara dinamis
  - _Requirements: 1.1, 3.1_

- [x] 6. Checkpoint akhir — Verifikasi integrasi end-to-end
  - Pastikan semua tests pass, tanyakan ke user jika ada pertanyaan.

## Notes

- Task bertanda `*` bersifat opsional dan bisa dilewati untuk MVP yang lebih cepat
- Karena tidak ada test runner, property test diimplementasikan sebagai fungsi verifikasi di browser console (lihat contoh di design.md)
- Kelas CSS marquee lama tidak dihapus agar tidak merusak referensi yang mungkin masih ada
- Filter state direset ke "Semua" setiap kali `renderPublicPage` dipanggil (tidak disimpan ke `localStorage`)
- Semua teks UI dalam Bahasa Indonesia
