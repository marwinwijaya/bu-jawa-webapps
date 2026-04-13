# Design Document

## Fitur: Admin Menu Navigation Merge

---

## Overview

Fitur ini merefaktor navigasi sidebar `admin.html` dengan menggabungkan tiga item navigasi terpisah — `Master Menu`, `Menu Harian` — menjadi satu grup berlabel **"Menu"** yang berisi tiga sub-menu: **Katalog Menu**, **Menu Hari Ini**, dan **Menu Besok**.

Perubahan bersifat murni presentasi (HTML + CSS + sedikit JS untuk indikator aktif). Tidak ada perubahan pada logika bisnis, struktur data, atau file `data/menu.json`. Semua fungsi JavaScript yang ada (`app.initDashboard`, `app.renderAll`, `app.bindDashboard`) tetap tidak dimodifikasi.

**Tujuan utama:**
- Mengurangi kepadatan item di level atas sidebar
- Membuat hubungan antar tiga bagian pengelolaan menu lebih eksplisit secara visual
- Mempertahankan kompatibilitas penuh dengan sidebar collapsed

---

## Architecture

Karena proyek ini adalah static site tanpa build system, semua perubahan dilakukan langsung pada file yang ada:

```
admin.html          ← Modifikasi struktur HTML sidebar nav
assets/css/style.css ← Tambah CSS untuk menu-group dan sub-menu
assets/js/admin-actions.js ← Tambah event listener untuk indikator aktif sub-menu
```

Tidak ada file baru yang dibuat. Tidak ada dependensi baru.

### Diagram Struktur Navigasi

**Sebelum:**
```
<nav class="admin-nav premium-nav">
  <a href="#ringkasan">Ringkasan</a>
  <a href="#master-menu">Master Menu</a>       ← item terpisah
  <a href="#penjadwalan">Menu Harian</a>        ← item terpisah
  <a href="index.html" target="_blank">Buka Website Publik</a>
  <button id="logout-button">Logout</button>
</nav>
```

**Sesudah:**
```
<nav class="admin-nav premium-nav">
  <a href="#ringkasan">Ringkasan</a>
  <div class="nav-menu-group">               ← grup baru
    <div class="nav-menu-group-header">
      <i class="bi bi-journal-bookmark"></i>
      <span>Menu</span>
    </div>
    <div class="nav-sub-menu">
      <a href="#master-menu">Katalog Menu</a>
      <a href="#penjadwalan" data-sub="hari-ini">Menu Hari Ini</a>
      <a href="#penjadwalan" data-sub="besok">Menu Besok</a>
    </div>
  </div>
  <a href="index.html" target="_blank">Buka Website Publik</a>
  <button id="logout-button">Logout</button>
</nav>
```

---

## Components and Interfaces

### 1. HTML: `nav-menu-group` di `admin.html`

Struktur grup navigasi baru yang menggantikan dua item lama:

```html
<div class="nav-menu-group">
  <div class="nav-menu-group-header">
    <i class="bi bi-journal-bookmark"></i>
    <span>Menu</span>
  </div>
  <div class="nav-sub-menu">
    <a href="#master-menu" class="nav-sub-item" data-sub-nav="katalog-menu">
      <i class="bi bi-grid-3x3-gap"></i>
      <span>Katalog Menu</span>
    </a>
    <a href="#penjadwalan" class="nav-sub-item" data-sub-nav="menu-hari-ini">
      <i class="bi bi-calendar-check"></i>
      <span>Menu Hari Ini</span>
    </a>
    <a href="#penjadwalan" class="nav-sub-item" data-sub-nav="menu-besok">
      <i class="bi bi-calendar-plus"></i>
      <span>Menu Besok</span>
    </a>
  </div>
</div>
```

**Keputusan desain:**
- `nav-menu-group-header` adalah `div` (bukan `<a>` atau `<button>`) karena grup induk tidak memiliki aksi sendiri — hanya sebagai label visual.
- Sub-menu menggunakan `<a href="#...">` (anchor link) agar scroll ke section ditangani oleh browser secara native, tanpa JS tambahan.
- Atribut `data-sub-nav` digunakan oleh JS untuk mengelola indikator aktif.

### 2. CSS: Kelas baru di `style.css`

Kelas-kelas baru yang ditambahkan di bawah blok `.premium-nav`:

| Kelas | Fungsi |
|---|---|
| `.nav-menu-group` | Container grup, menggantikan padding/gap item nav biasa |
| `.nav-menu-group-header` | Label "Menu" dengan ikon, tidak dapat diklik |
| `.nav-sub-menu` | Container sub-menu, selalu expanded (tidak ada toggle collapse) |
| `.nav-sub-item` | Satu item sub-menu, mirip `.admin-nav a` tapi dengan indentasi |
| `.nav-sub-item.is-active` | State aktif sub-menu yang sedang dipilih |

**Aturan collapsed sidebar** — memanfaatkan selector yang sudah ada:
```css
body.sidebar-collapsed .nav-menu-group-header span,
body.sidebar-collapsed .nav-sub-item span {
  display: none;
}
body.sidebar-collapsed .nav-sub-item {
  justify-content: center;
  padding-inline: 0.7rem;
}
```

### 3. JS: Indikator aktif di `admin-actions.js`

Fungsi baru `app.bindSubNavActive()` yang dipanggil dari `app.bindDashboard()`:

```js
app.bindSubNavActive = function bindSubNavActive() {
  const subItems = document.querySelectorAll('.nav-sub-item');
  subItems.forEach(function(item) {
    item.addEventListener('click', function() {
      subItems.forEach(function(el) { el.classList.remove('is-active'); });
      item.classList.add('is-active');
    });
  });
};
```

Fungsi ini dipanggil di dalam `app.bindDashboard()` yang sudah ada, sehingga tidak mengubah alur inisialisasi.

---

## Data Models

Tidak ada perubahan pada model data. Fitur ini murni UI.

- `app.state` tidak berubah
- `data/menu.json` tidak berubah
- `localStorage` tidak berubah
- Tidak ada state baru yang perlu disimpan (kondisi expanded/collapsed grup menu tidak perlu dipersist karena selalu expanded)

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Semua sub-menu adalah anchor link yang valid

*For any* sub-menu item di dalam `.nav-sub-menu`, elemen tersebut harus berupa tag `<a>` dengan atribut `href` yang dimulai dengan `"#"`, terlepas dari kondisi sidebar (expanded atau collapsed).

**Validates: Requirements 2.4, 4.3**

### Property 2: Klik sub-menu menerapkan class aktif secara eksklusif

*For any* sub-menu item yang diklik, hanya item tersebut yang memiliki class `is-active`, dan semua sub-menu lain tidak memiliki class `is-active`.

**Validates: Requirements 3.2**

---

## Error Handling

Karena fitur ini murni UI statis, tidak ada error handling yang diperlukan untuk logika baru. Namun beberapa kondisi perlu diperhatikan:

| Kondisi | Penanganan |
|---|---|
| Section target (`#master-menu`, `#penjadwalan`) tidak ada di DOM | Browser tidak scroll, tidak ada error — anchor link gagal secara diam-diam. Ini tidak mungkin terjadi karena section tersebut selalu ada di `admin.html`. |
| `app.bindSubNavActive()` dipanggil sebelum DOM siap | Tidak mungkin terjadi karena dipanggil dari `app.bindDashboard()` yang sudah dipanggil setelah `DOMContentLoaded`. |
| Sidebar collapsed saat sub-menu diklik | Anchor link tetap berfungsi; CSS hanya menyembunyikan teks, bukan menonaktifkan pointer events. |

---

## Testing Strategy

Fitur ini adalah perubahan UI murni (HTML + CSS + event listener sederhana). Property-based testing tidak sesuai untuk sebagian besar kriteria karena:
- Sebagian besar kriteria adalah verifikasi struktur DOM statis (EXAMPLE)
- Tidak ada transformasi data atau logika bisnis yang diuji
- Dua properti yang teridentifikasi (anchor link validity dan exclusive active state) dapat diuji dengan unit test berbasis DOM

### Unit Tests (Example-Based)

Menggunakan inspeksi DOM manual atau test runner ringan (misalnya dengan `document.querySelector` di browser console):

**Struktur DOM:**
- Verifikasi `div.nav-menu-group` ada di dalam `.premium-nav`
- Verifikasi tiga `.nav-sub-item` ada di dalam `.nav-sub-menu`
- Verifikasi urutan: Ringkasan → nav-menu-group → Buka Website Publik
- Verifikasi item lama (`a[href="#master-menu"]` level atas, `a[href="#penjadwalan"]` level atas) tidak ada lagi

**Anchor links (Property 1):**
- Verifikasi setiap `.nav-sub-item` adalah tag `<a>`
- Verifikasi `href` dimulai dengan `"#"`
- Verifikasi `href` mengarah ke section yang ada (`#master-menu`, `#penjadwalan`)

**Indikator aktif (Property 2):**
- Simulasi klik pada sub-menu pertama → verifikasi hanya sub-menu pertama yang memiliki `is-active`
- Simulasi klik pada sub-menu kedua → verifikasi hanya sub-menu kedua yang memiliki `is-active`
- Simulasi klik pada sub-menu ketiga → verifikasi hanya sub-menu ketiga yang memiliki `is-active`

**Non-regresi:**
- Verifikasi `a[href="#ringkasan"]` masih ada
- Verifikasi `a[href="index.html"][target="_blank"]` masih ada
- Verifikasi `button#logout-button` masih ada
- Verifikasi `button#sidebar-toggle-button` masih ada
- Verifikasi section `#ringkasan`, `#master-menu`, `#penjadwalan` masih ada

**Collapsed sidebar:**
- Toggle class `sidebar-collapsed` pada `<body>`
- Verifikasi `.nav-menu-group-header span` tidak terlihat
- Verifikasi `.nav-sub-item span` tidak terlihat
- Verifikasi `.nav-sub-item` masih memiliki `href` yang valid (tidak dinonaktifkan)

### Pengujian Manual

Karena tidak ada test runner di proyek ini, pengujian dilakukan dengan membuka `admin.html` di Chrome/Edge:

1. Login → buka dashboard
2. Verifikasi sidebar menampilkan grup "Menu" dengan tiga sub-menu
3. Klik "Katalog Menu" → halaman scroll ke `#master-menu`
4. Klik "Menu Hari Ini" → halaman scroll ke `#penjadwalan`
5. Klik "Menu Besok" → halaman scroll ke `#penjadwalan`
6. Verifikasi class aktif berpindah saat klik sub-menu berbeda
7. Klik tombol "Side Menu" → verifikasi sidebar collapsed, teks tersembunyi, ikon tetap terlihat
8. Klik sub-menu saat collapsed → verifikasi scroll tetap berfungsi
9. Verifikasi "Ringkasan", "Buka Website Publik", "Logout" masih berfungsi normal
