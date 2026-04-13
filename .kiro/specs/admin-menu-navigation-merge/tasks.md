# Rencana Implementasi: Admin Menu Navigation Merge

## Gambaran Umum

Refaktor navigasi sidebar `admin.html` dengan menggabungkan item `Master Menu` dan `Menu Harian` menjadi satu grup berlabel **"Menu"** berisi tiga sub-menu. Perubahan menyentuh tiga file: `admin.html` (struktur HTML), `assets/css/style.css` (kelas CSS baru), dan `assets/js/admin-actions.js` (fungsi indikator aktif).

## Tasks

- [~] 1. Tambah kelas CSS untuk grup navigasi di `style.css`
  - Tambahkan blok kelas baru di bawah blok `.premium-nav` yang sudah ada
  - Kelas yang ditambahkan: `.nav-menu-group`, `.nav-menu-group-header`, `.nav-sub-menu`, `.nav-sub-item`, `.nav-sub-item.is-active`
  - Tambahkan aturan collapsed sidebar untuk menyembunyikan teks label grup dan sub-menu saat `body.sidebar-collapsed` aktif
  - Pastikan `.nav-sub-item` memiliki indentasi dan style konsisten dengan `.admin-nav a` yang sudah ada
  - _Requirements: 1.1, 3.3, 4.1, 4.2_

- [~] 2. Refaktor HTML sidebar nav di `admin.html`
  - [~] 2.1 Ganti dua item nav lama dengan struktur `nav-menu-group`
    - Hapus `<a href="#master-menu">` dan `<a href="#penjadwalan">` dari level atas `<nav>`
    - Tambahkan `<div class="nav-menu-group">` di posisi yang sama (setelah `<a href="#ringkasan">`, sebelum `<a href="index.html">`)
    - Isi `nav-menu-group-header` dengan ikon `bi-journal-bookmark` dan teks "Menu"
    - Isi `nav-sub-menu` dengan tiga `<a class="nav-sub-item">`: Katalog Menu (`href="#master-menu"`, ikon `bi-grid-3x3-gap`), Menu Hari Ini (`href="#penjadwalan"`, ikon `bi-calendar-check`), Menu Besok (`href="#penjadwalan"`, ikon `bi-calendar-plus`)
    - Tambahkan atribut `data-sub-nav` pada setiap sub-item: `katalog-menu`, `menu-hari-ini`, `menu-besok`
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4_

  - [~] 2.2 Verifikasi struktur DOM non-regresi
    - Pastikan `a[href="#ringkasan"]`, `a[href="index.html"][target="_blank"]`, dan `button#logout-button` masih ada di `<nav>`
    - Pastikan section `#ringkasan`, `#master-menu`, `#penjadwalan` tidak diubah
    - _Requirements: 1.4, 5.1, 5.3, 5.4_

- [ ] 3. Tambah fungsi `bindSubNavActive()` di `admin-actions.js`
  - [ ] 3.1 Implementasi fungsi `app.bindSubNavActive`
    - Tambahkan fungsi `app.bindSubNavActive` di dalam IIFE `admin-actions.js`
    - Fungsi memilih semua `.nav-sub-item`, lalu pada setiap klik: hapus `is-active` dari semua item, tambahkan `is-active` ke item yang diklik
    - _Requirements: 3.2_

  - [ ] 3.2 Panggil `bindSubNavActive()` dari `bindDashboard()`
    - Tambahkan satu baris `app.bindSubNavActive()` di dalam fungsi `app.bindDashboard` yang sudah ada
    - Tidak ada perubahan lain pada `bindDashboard` atau fungsi lain
    - _Requirements: 3.2, 5.2_

  - [ ] 3.3 Tulis unit test untuk indikator aktif (Property 2)
    - **Property 2: Klik sub-menu menerapkan class aktif secara eksklusif**
    - Simulasi klik pada masing-masing dari tiga `.nav-sub-item`; verifikasi hanya item yang diklik memiliki `is-active`, dua lainnya tidak
    - **Validates: Requirements 3.2**

- [ ] 4. Checkpoint — Verifikasi manual di browser
  - Buka `admin.html` di Chrome/Edge, login, dan pastikan semua hal berikut berfungsi:
    - Sidebar menampilkan grup "Menu" dengan tiga sub-menu
    - Klik setiap sub-menu → halaman scroll ke section yang benar
    - Class `is-active` berpindah saat sub-menu berbeda diklik
    - Klik tombol "Side Menu" → teks tersembunyi, ikon tetap terlihat, sub-menu masih bisa diklik
    - "Ringkasan", "Buka Website Publik", "Logout", dan semua fungsi dashboard lain tetap normal
  - Pastikan semua tests pass, tanyakan ke user jika ada pertanyaan.

## Catatan

- Task bertanda `*` bersifat opsional dan dapat dilewati
- Tidak ada file baru yang dibuat; tidak ada dependensi baru
- Tidak ada perubahan pada logika bisnis, `app.state`, atau `data/menu.json`
- Urutan load script di `admin.html` tidak perlu diubah
