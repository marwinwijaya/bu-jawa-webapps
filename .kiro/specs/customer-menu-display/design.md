# Design Document: Customer Menu Display

## Overview

Fitur ini mengganti tampilan marquee/scrolling horizontal pada section menu di `index.html` dengan layout grid statis yang lebih mudah dibaca. Perubahan mencakup tiga file:

- `index.html` — struktur HTML section `#menu-hari-ini` dan `#menu-besok` (hapus markup marquee, tambah filter bar + container grid)
- `assets/js/site.js` — ganti fungsi `renderMenuList` dan `renderMenuCard` dengan logika render grid + filter kategori
- `assets/css/style.css` — tambah kelas CSS baru untuk grid dan kartu menu baru; kelas marquee lama tetap ada (tidak dihapus) agar tidak merusak referensi yang mungkin masih ada

Tidak ada perubahan pada `menu.json`, halaman admin, atau logika pengambilan data (`getActivePayload`, `parsePayload`). Semua teks UI dalam Bahasa Indonesia.

---

## Architecture

### Alur Data (tidak berubah)

```
data/menu.json
      │
      ▼
site.js: getActivePayload()
      │
      ▼
site.js: parsePayload()  →  { menuHariIni[], menuBesok[], isFallback }
      │
      ▼
site.js: renderPublicPage()
      ├── renderMenuSection("#menu-hari-ini-list", menuHariIni, { showFilter: true })
      └── renderMenuSection("#menu-besok-list",    menuBesok,   { showFilter: false, isFallback })
```

### Perubahan Arsitektur

| Komponen | Sebelum | Sesudah |
|---|---|---|
| `renderMenuList()` | Render marquee HTML | Diganti `renderMenuSection()` — render filter bar + grid |
| `renderMenuCard()` | Kartu marquee horizontal | Diganti `renderMenuCard()` — kartu grid vertikal |
| Filter state | Tidak ada | State lokal per-section, disimpan di closure |
| CSS marquee | `.menu-marquee`, `.marquee-shell`, `@keyframes` | Tetap ada; kelas baru ditambahkan terpisah |

### Prinsip Desain

- **Self-contained**: `site.js` tetap IIFE tanpa dependensi eksternal
- **No re-fetch**: Filter bekerja pada data yang sudah ada di memori — tidak ada fetch ulang
- **Progressive enhancement**: Jika JS gagal, HTML section tetap terlihat (kosong tapi tidak rusak)
- **Backward compatible**: Kelas CSS lama tidak dihapus

---

## Components and Interfaces

### 1. `renderMenuSection(selector, menus, options)`

Fungsi utama pengganti `renderMenuList`. Bertanggung jawab merender seluruh section menu (filter bar + grid).

```js
/**
 * @param {string}   selector   - CSS selector untuk container target (e.g. "#menu-hari-ini-list")
 * @param {object[]} menus      - Array item menu aktif
 * @param {object}   options
 * @param {boolean}  options.showFilter   - Tampilkan filter bar (true untuk hari ini, false untuk besok)
 * @param {boolean}  options.isTomorrow   - Apakah section ini adalah menu besok
 * @param {boolean}  options.isFallback   - Apakah data besok menggunakan fallback dari hari ini
 */
function renderMenuSection(selector, menus, options) { ... }
```

### 2. `renderFilterBar(menus, activeCategory, onFilterChange)`

Merender tombol filter kategori. Dipanggil hanya untuk Section_Hari_Ini.

```js
/**
 * @param {object[]}  menus           - Array menu aktif (untuk mengekstrak kategori unik)
 * @param {string}    activeCategory  - Kategori yang sedang aktif ("Semua" atau nama kategori)
 * @param {Function}  onFilterChange  - Callback dipanggil dengan kategori baru saat tombol diklik
 * @returns {string}  HTML string filter bar
 */
function renderFilterBar(menus, activeCategory, onFilterChange) { ... }
```

Karena `renderFilterBar` menghasilkan HTML string dan event listener dipasang secara terpisah (event delegation pada container), callback `onFilterChange` diimplementasikan via `data-category` attribute dan event delegation.

### 3. `renderMenuGrid(menus)`

Merender grid kartu menu.

```js
/**
 * @param {object[]} menus - Array item menu yang akan ditampilkan (sudah difilter)
 * @returns {string} HTML string grid
 */
function renderMenuGrid(menus) { ... }
```

### 4. `renderMenuCard(menu, isTomorrow)`

Merender satu kartu menu dalam format grid vertikal.

```js
/**
 * @param {object}  menu        - Objek menu dari menu.json
 * @param {boolean} isTomorrow  - Apakah kartu ini untuk section besok
 * @returns {string} HTML string satu <article> kartu
 */
function renderMenuCard(menu, isTomorrow) { ... }
```

### 5. `renderEmptyState(message)`

Merender tampilan empty state yang konsisten.

```js
/**
 * @param {string} message - Pesan yang ditampilkan
 * @returns {string} HTML string empty state
 */
function renderEmptyState(message) { ... }
```

### HTML Structure (per section)

```html
<!-- Container yang sudah ada di index.html -->
<div id="menu-hari-ini-list">

  <!-- Filter bar (hanya Section_Hari_Ini) -->
  <div class="menu-filter-bar" role="group" aria-label="Filter kategori menu">
    <button class="menu-filter-btn is-active" data-category="Semua" aria-pressed="true">Semua</button>
    <button class="menu-filter-btn" data-category="Menu Utama" aria-pressed="false">Menu Utama</button>
    <!-- ... tombol per kategori aktif ... -->
  </div>

  <!-- Grid kartu menu -->
  <div class="menu-grid">
    <article class="menu-card">
      <div class="menu-card-img-wrap">
        <img src="..." alt="Nama Menu" loading="lazy" class="menu-card-img">
        <!-- overlay jika habis -->
        <div class="menu-card-overlay"></div>
      </div>
      <div class="menu-card-body">
        <div class="menu-card-badges">
          <span class="menu-pill badge-success">Tersedia</span>
          <span class="menu-pill badge-neutral">Menu Utama</span>
        </div>
        <h3 class="menu-card-title">Nama Menu</h3>
        <p class="menu-card-desc">Deskripsi singkat...</p>
        <strong class="menu-price">Rp 15.000</strong>
      </div>
    </article>
    <!-- ... kartu lainnya ... -->
  </div>

</div>
```

---

## Data Models

Tidak ada perubahan pada struktur data. `site.js` tetap membaca dari `menu.json` dengan shape yang sama:

```js
// Item menu (dari menu_hari_ini atau menu_besok di menu.json)
{
  id: number,
  nama_menu: string,
  kategori: string,          // "Menu Utama" | "Menu Sayur" | "Minuman" | "Snack"
  deskripsi: string,
  harga: number,             // dalam Rupiah penuh, e.g. 15000
  gambar: string,            // path relatif, e.g. "assets/img/menu-1-ayam-bakar.png"
  aktif: boolean,
  status_ketersediaan: string // "tersedia" | "habis"
}
```

### State Filter (in-memory, per render)

Filter state tidak disimpan ke `localStorage` — state direset ke "Semua" setiap kali `renderPublicPage` dipanggil (misalnya saat ada perubahan `storage` event).

```js
// State lokal di dalam closure renderMenuSection
let activeCategory = "Semua";
```

### Kategori yang Dikenali

Kategori diambil dinamis dari data menu aktif (bukan hardcoded), sehingga jika admin menambah kategori baru, filter bar akan otomatis menyesuaikan.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Render grid, bukan marquee

*Untuk sembarang* array menu aktif (termasuk array kosong), output `renderMenuSection` tidak boleh mengandung elemen dengan kelas `menu-marquee` atau `marquee-shell`, dan harus mengandung elemen dengan kelas `menu-grid` atau `menu-empty-state`.

**Validates: Requirements 1.1**

---

### Property 2: Kartu menu mengandung semua informasi wajib dan badge yang benar

*Untuk sembarang* objek menu valid, output `renderMenuCard` harus mengandung: nama menu, teks kategori, harga terformat (`Rp ...`), teks deskripsi, dan Status_Badge dengan teks "Tersedia" jika `status_ketersediaan === "tersedia"` atau teks "Habis" jika `status_ketersediaan === "habis"`. Selain itu, jika `status_ketersediaan === "habis"`, output harus mengandung elemen overlay pada foto.

**Validates: Requirements 1.3, 2.6, 2.7**

---

### Property 3: Jumlah kartu sama dengan jumlah menu yang diberikan

*Untuk sembarang* array menu dengan panjang N, output `renderMenuGrid` harus mengandung tepat N elemen `<article>` dengan kelas `menu-card`.

**Validates: Requirements 1.5, 6.3**

---

### Property 4: Format Rupiah selalu konsisten

*Untuk sembarang* nilai harga integer non-negatif, `formatRupiah(harga)` harus menghasilkan string yang dimulai dengan `"Rp "` dan mengandung representasi angka dengan pemisah ribuan titik (format `id-ID`).

**Validates: Requirements 2.3**

---

### Property 5: Filter bar ada atau tidak ada sesuai opsi `showFilter`

*Untuk sembarang* array menu dan nilai opsi `showFilter`, jika `showFilter === true` maka output `renderMenuSection` harus mengandung elemen `.menu-filter-bar`; jika `showFilter === false` maka output tidak boleh mengandung elemen `.menu-filter-bar`.

**Validates: Requirements 3.1, 3.7**

---

### Property 6: Jumlah tombol filter = jumlah kategori unik + 1

*Untuk sembarang* array menu dengan K kategori unik, filter bar yang dirender harus mengandung tepat K + 1 tombol (satu tombol "Semua" ditambah satu tombol per kategori unik).

**Validates: Requirements 3.2**

---

### Property 7: Filter menampilkan hanya kartu yang sesuai kategori

*Untuk sembarang* array menu dan sembarang kategori yang ada dalam array tersebut, setelah filter kategori tersebut diterapkan, semua kartu yang ditampilkan harus memiliki kategori yang sama dengan filter yang dipilih. Sebaliknya, ketika filter "Semua" diterapkan, jumlah kartu yang ditampilkan harus sama dengan jumlah total menu aktif.

**Validates: Requirements 3.3, 3.4**

---

### Property 8: Tepat satu tombol filter aktif pada satu waktu

*Untuk sembarang* state filter aktif, tepat satu tombol dalam filter bar harus memiliki atribut `aria-pressed="true"` dan kelas `is-active`; semua tombol lainnya harus memiliki `aria-pressed="false"`.

**Validates: Requirements 3.5, 6.2**

---

### Property 9: Empty state selalu mengandung pesan yang diberikan

*Untuk sembarang* string pesan, output `renderEmptyState(pesan)` harus mengandung teks pesan tersebut dan elemen ikon.

**Validates: Requirements 4.4**

---

### Property 10: Fallback besok menggunakan data hari ini dengan notice

*Untuk sembarang* array menu hari ini non-kosong: jika array menu besok kosong, data yang dirender di section besok harus identik dengan data menu hari ini dan output harus mengandung elemen fallback notice. Sebaliknya, jika array menu besok non-kosong, output tidak boleh mengandung fallback notice.

**Validates: Requirements 5.1, 5.2, 5.3**

---

### Property 11: Setiap gambar kartu menu memiliki alt dan loading lazy

*Untuk sembarang* objek menu, output `renderMenuCard` harus mengandung elemen `<img>` dengan atribut `alt` yang sama dengan `nama_menu` dan atribut `loading="lazy"`.

**Validates: Requirements 6.1, 6.4**

---

## Error Handling

| Kondisi | Penanganan |
|---|---|
| `fetch("data/menu.json")` gagal | `renderErrorState()` dipanggil — pesan error ditampilkan di kedua section |
| `menu_hari_ini` kosong | `renderEmptyState("Menu hari ini belum tersedia. Silakan cek kembali nanti.")` |
| `menu_besok` kosong, tidak ada fallback | `renderEmptyState("Menu besok belum ditampilkan. Cek lagi nanti, ya.")` |
| `menu_besok` kosong, ada fallback | Tampilkan menu hari ini + `fallback-notice` |
| Filter kategori tidak menghasilkan menu | `renderEmptyState("Tidak ada menu untuk kategori ini.")` |
| Gambar gagal dimuat (`onerror`) | Ganti `src` ke `assets/img/about.jpg` |
| `menu.gambar` kosong/null | `getMenuImageSrc()` mengembalikan `FALLBACK_MENU_IMAGE` |
| JSON parse error | Ditangkap oleh `try/catch` di `loadAndRender()`, `renderErrorState()` dipanggil |

Semua error handling sudah ada di `site.js` saat ini — tidak ada perubahan pada logika `getActivePayload`, `parsePayload`, atau `renderErrorState`.

---

## Testing Strategy

Karena proyek ini tidak memiliki build system atau test runner, strategi pengujian menggunakan pendekatan pragmatis:

### Unit Tests (Manual / Browser Console)

Fungsi-fungsi pure berikut dapat diuji langsung di browser console atau dengan file HTML test sederhana:

- `formatRupiah(harga)` — uji dengan berbagai nilai integer
- `renderMenuCard(menu, isTomorrow)` — uji dengan objek menu berbeda (tersedia/habis, dengan/tanpa gambar)
- `renderMenuGrid(menus)` — uji dengan array berbagai ukuran
- `renderEmptyState(pesan)` — uji dengan berbagai string pesan
- `renderFilterBar(menus, activeCategory)` — uji dengan berbagai kombinasi kategori

### Property-Based Testing

Karena tidak ada test runner, property-based testing diimplementasikan sebagai fungsi verifikasi manual yang dapat dijalankan di browser console. Setiap property diverifikasi dengan minimal 100 iterasi menggunakan data acak yang dibuat secara programatik.

**Library yang direkomendasikan jika test runner ditambahkan di masa depan**: [fast-check](https://fast-check.dev/) (JavaScript)

**Tag format untuk referensi**: `Feature: customer-menu-display, Property {N}: {deskripsi}`

### Contoh Verifikasi Property di Console

```js
// Property 3: Jumlah kartu = jumlah menu
function verifyProperty3(iterations = 100) {
  for (let i = 0; i < iterations; i++) {
    const n = Math.floor(Math.random() * 20);
    const menus = Array.from({ length: n }, (_, idx) => ({
      id: idx + 1, nama_menu: `Menu ${idx}`, kategori: "Menu Utama",
      deskripsi: "Deskripsi", harga: 15000, gambar: "", aktif: true,
      status_ketersediaan: "tersedia"
    }));
    const html = renderMenuGrid(menus);
    const doc = new DOMParser().parseFromString(html, "text/html");
    const cards = doc.querySelectorAll("article.menu-card");
    console.assert(cards.length === n, `FAIL: expected ${n}, got ${cards.length}`);
  }
  console.log("Property 3: OK");
}
```

### Integration Test

Buka `index.html` di browser dan verifikasi secara manual:
1. Menu hari ini tampil sebagai grid (bukan marquee)
2. Filter bar muncul di section hari ini, tidak muncul di section besok
3. Klik tombol filter — hanya kartu dengan kategori tersebut yang tampil
4. Klik "Semua" — semua kartu tampil kembali
5. Menu dengan status "habis" menampilkan overlay pada foto
6. Fallback notice muncul jika menu besok kosong
