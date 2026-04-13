# Requirements Document

## Introduction

Fitur ini menggabungkan tiga item navigasi terpisah di sidebar admin (`Master Menu`, `Menu Harian`) menjadi satu grup navigasi berlabel **"Menu"** dengan tiga sub-menu yang dapat diperluas: **Katalog Menu**, **Menu Hari Ini**, dan **Menu Besok**. Tujuannya adalah menyederhanakan struktur navigasi sidebar, mengurangi kepadatan item di level atas, dan membuat hubungan antar ketiga bagian tersebut lebih eksplisit secara visual.

Perubahan bersifat murni UI/navigasi — tidak ada perubahan pada struktur data, logika bisnis, atau file `data/menu.json`.

## Glossary

- **Sidebar**: Panel navigasi vertikal di sisi kiri `admin.html` (elemen `<aside class="admin-sidebar">`).
- **Nav_Item**: Satu tautan atau tombol navigasi di dalam `<nav class="admin-nav premium-nav">`.
- **Menu_Group**: Grup navigasi baru berlabel "Menu" yang menampung tiga sub-menu.
- **Sub_Menu**: Item navigasi di bawah Menu_Group — yaitu Katalog Menu, Menu Hari Ini, dan Menu Besok.
- **Active_Section**: Bagian konten utama (`<section>`) yang sedang terlihat di viewport.
- **Collapsed_Sidebar**: Kondisi sidebar saat lebar dipersempit (class `sidebar-collapsed` pada `<body>`), dikendalikan oleh tombol "Side Menu".
- **Anchor_Link**: Tautan `href="#id-section"` yang men-scroll halaman ke section terkait.

---

## Requirements

### Requirement 1: Grup Navigasi "Menu" di Sidebar

**User Story:** Sebagai admin, saya ingin melihat satu grup navigasi "Menu" di sidebar yang menampung semua sub-menu terkait pengelolaan menu, sehingga navigasi lebih ringkas dan terstruktur.

#### Acceptance Criteria

1. THE Sidebar SHALL menampilkan satu Nav_Item berlabel "Menu" sebagai grup induk, menggantikan item-item navigasi terpisah untuk Master Menu dan Menu Harian.
2. WHEN Admin_Dashboard dimuat, THE Menu_Group SHALL menampilkan tiga Sub_Menu: "Katalog Menu", "Menu Hari Ini", dan "Menu Besok".
3. THE Menu_Group SHALL mempertahankan posisi urutan yang sama dengan item navigasi yang digantikan (setelah "Ringkasan", sebelum "Buka Website Publik").
4. THE Sidebar SHALL tetap menampilkan item navigasi "Ringkasan", "Buka Website Publik", dan tombol "Logout" tanpa perubahan.

---

### Requirement 2: Sub-Menu dan Navigasi Anchor

**User Story:** Sebagai admin, saya ingin setiap sub-menu di dalam grup "Menu" dapat diklik untuk langsung menuju section yang relevan, sehingga saya bisa berpindah antar bagian dengan cepat.

#### Acceptance Criteria

1. WHEN Admin mengklik Sub_Menu "Katalog Menu", THE Admin_Dashboard SHALL men-scroll halaman ke section `#master-menu`.
2. WHEN Admin mengklik Sub_Menu "Menu Hari Ini", THE Admin_Dashboard SHALL men-scroll halaman ke section penjadwalan dan memfokuskan tampilan pada papan Menu Hari Ini.
3. WHEN Admin mengklik Sub_Menu "Menu Besok", THE Admin_Dashboard SHALL men-scroll halaman ke section penjadwalan dan memfokuskan tampilan pada papan Menu Besok.
4. THE Sub_Menu SHALL diimplementasikan sebagai Anchor_Link (`<a href="#...">`) agar kompatibel dengan perilaku scroll bawaan browser.

---

### Requirement 3: Indikator Sub-Menu Aktif

**User Story:** Sebagai admin, saya ingin sub-menu yang sedang aktif ditandai secara visual, sehingga saya tahu sedang berada di bagian mana dari dashboard.

#### Acceptance Criteria

1. WHEN Admin_Dashboard pertama kali dimuat, THE Menu_Group SHALL menampilkan semua Sub_Menu dalam kondisi terlihat (expanded) secara default.
2. WHEN Admin mengklik sebuah Sub_Menu, THE Admin_Dashboard SHALL menerapkan class visual aktif pada Sub_Menu tersebut untuk membedakannya dari Sub_Menu lain.
3. THE visual aktif Sub_Menu SHALL menggunakan warna atau style yang konsisten dengan palet warna sidebar yang sudah ada (`--primary`, `rgba(255,255,255,0.12)`).

---

### Requirement 4: Kompatibilitas dengan Sidebar Collapsed

**User Story:** Sebagai admin, saya ingin grup navigasi "Menu" tetap dapat digunakan saat sidebar dalam kondisi collapsed, sehingga fungsionalitas tidak hilang di mode ringkas.

#### Acceptance Criteria

1. WHILE Collapsed_Sidebar aktif, THE Menu_Group SHALL menyembunyikan label teks "Menu" dan label teks setiap Sub_Menu, konsisten dengan perilaku item navigasi lain saat collapsed.
2. WHILE Collapsed_Sidebar aktif, THE Menu_Group SHALL menampilkan ikon representatif untuk grup "Menu" agar admin tetap dapat mengidentifikasi grup tersebut.
3. WHILE Collapsed_Sidebar aktif, THE Sub_Menu SHALL tetap dapat diklik dan berfungsi sebagai Anchor_Link ke section yang sesuai.

---

### Requirement 5: Tidak Ada Regresi pada Fungsionalitas yang Ada

**User Story:** Sebagai admin, saya ingin semua fitur dashboard yang sudah ada tetap berfungsi normal setelah perubahan navigasi, sehingga pekerjaan operasional tidak terganggu.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL tetap merender section `#ringkasan`, `#master-menu`, dan `#penjadwalan` tanpa perubahan pada struktur HTML section tersebut.
2. THE Admin_Dashboard SHALL tetap menjalankan semua fungsi JavaScript yang ada (`app.initDashboard`, `app.renderAll`, `app.bindDashboard`) tanpa modifikasi pada logika bisnis.
3. WHEN Admin mengklik "Buka Website Publik", THE Admin_Dashboard SHALL membuka `index.html` di tab baru, sama seperti sebelumnya.
4. WHEN Admin mengklik "Logout", THE Admin_Dashboard SHALL menjalankan proses logout yang sudah ada tanpa perubahan.
5. THE Admin_Dashboard SHALL mempertahankan perilaku toggle sidebar (tombol "Side Menu") yang sudah ada.
