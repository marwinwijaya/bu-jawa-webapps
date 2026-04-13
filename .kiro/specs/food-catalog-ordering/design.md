# Dokumen Desain: Katalog Menu & Pemesanan

## Gambaran Umum

Fitur ini menambahkan halaman `catalog.html` sebagai halaman katalog menu interaktif untuk Rumah Makan Bu Jawa. Pengunjung dapat menelusuri seluruh daftar menu dari `data/menu.json`, memfilter berdasarkan kategori tetap, mencari berdasarkan kata kunci, mengelola keranjang belanja dalam memori, dan mengirim pesanan via WhatsApp dengan pesan yang sudah diformat otomatis.

Implementasi sepenuhnya statis: tidak ada backend, tidak ada build step, tidak ada dependensi eksternal selain Bootstrap 5 yang sudah tersedia di `assets/vendor/`. Semua logika ditulis dalam satu file IIFE (`catalog.js`) yang berjalan langsung di browser.

---

## Arsitektur

### Pola Keseluruhan

```
catalog.html
  └── assets/js/catalog.js  (IIFE tunggal, tidak ada modul)
        ├── State in-memory: allItems, cart, activeCategory, searchQuery
        ├── Menu_Loader     → fetch data/menu.json → allItems
        ├── Category_Filter → mutasi activeCategory → applyFilters()
        ├── Search_Bar      → mutasi searchQuery    → applyFilters()
        ├── applyFilters()  → filter allItems       → renderMenuGrid()
        ├── Cart            → addToCart / changeQty / removeFromCart
        ├── Cart_Panel      → renderCartPanel()
        └── WhatsApp_Redirect → buildOrderMessage() → wa.me URL
```

### Alur Data

```
data/menu.json
      │
      ▼ fetch (cache: "no-store")
  master_menu[]
      │
      ▼ filter aktif: true
  allItems[]  ←── sumber kebenaran tunggal, tidak pernah dimutasi
      │
      ▼ applyFilters(activeCategory, searchQuery)
  filteredItems[]
      │
      ▼ renderMenuGrid()
  #catalog-menu-grid (DOM)
      │
      ▼ klik "Tambah ke Keranjang"
  cart[]  ←── state in-memory, dimutasi oleh addToCart / changeQty / removeFromCart
      │
      ▼ renderCartPanel()
  #cart-panel (DOM)
      │
      ▼ klik checkout
  buildOrderMessage() → encodeURIComponent → wa.me/6289540571803
```

### Prinsip Desain

- **Tidak ada state tersembunyi**: semua state tersimpan di empat variabel modul (`allItems`, `cart`, `activeCategory`, `searchQuery`).
- **Render ulang penuh**: setiap mutasi state memanggil fungsi render yang menulis ulang seluruh DOM target — tidak ada patch parsial.
- **Event delegation**: listener dipasang pada container (`#catalog-menu-grid`, `#cart-panel`), bukan pada setiap kartu/tombol individual.
- **Tidak ada localStorage**: keranjang tidak dipersistensikan; sesi baru selalu dimulai dengan keranjang kosong.

---

## Struktur File

```
catalog.html                  ← halaman utama katalog
assets/js/catalog.js          ← seluruh logika katalog (IIFE)
assets/css/style.css          ← tambahan CSS untuk halaman katalog
                                 (scoped dengan [data-page="katalog"])
data/menu.json                ← sumber data (tidak dimodifikasi oleh fitur ini)
```

### Perubahan pada File yang Ada

| File | Perubahan |
|---|---|
| `index.html` | Tambah link "Katalog Menu" di navbar dan tombol CTA di hero section |
| `assets/css/style.css` | Tambah blok CSS baru di bagian bawah, scoped dengan `[data-page="katalog"]` |

---

## Komponen dan Antarmuka

### Menu_Loader

Bertanggung jawab mengambil dan mem-parsing `data/menu.json`.

```js
function loadMenuData(): void
  // Memanggil fetch("data/menu.json", { cache: "no-store" })
  // Mem-parsing data.master_menu
  // Memfilter item dengan aktif: true → allItems
  // Memanggil renderMenuGrid(allItems) atau menampilkan error/empty state
```

**Input**: tidak ada (membaca dari URL relatif)
**Output**: mengisi `allItems`, memanggil `renderMenuGrid()`
**Error handling**: catch semua error → tampilkan pesan error di `#catalog-menu-grid`

---

### Menu_Grid

Merender array Menu_Item sebagai kartu Bootstrap ke `#catalog-menu-grid`.

```js
function renderMenuGrid(items: MenuItem[]): void
  // Menulis innerHTML #catalog-menu-grid
  // Setiap item → satu col-12 col-sm-6 col-lg-4 > .menu-card
```

**Input**: array Menu_Item (sudah difilter)
**Output**: DOM update pada `#catalog-menu-grid`
**Edge cases**: array kosong → tampilkan empty state

---

### Category_Filter

Mengelola state `activeCategory` dan event listener tombol filter.

```js
function initCategoryFilter(): void
  // Pasang click listener pada setiap .catalog-filter-btn
  // Klik → update activeCategory → applyFilters()
```

**State yang dikelola**: `activeCategory` (string, default `"Semua"`)
**Kategori tetap**: `"Semua"`, `"Menu Utama"`, `"Menu Sayur"`, `"Minuman"`, `"Snack"`

---

### Search_Bar

Mengelola state `searchQuery` dan event listener input pencarian.

```js
function initSearchBar(): void
  // Pasang input listener pada #catalog-search-input
  // Input → update searchQuery → applyFilters()
```

**State yang dikelola**: `searchQuery` (string, default `""`)

---

### applyFilters

Fungsi inti yang menggabungkan kedua filter dan merender ulang grid.

```js
function applyFilters(): void
  // Baca activeCategory dan nilai #catalog-search-input
  // Filter allItems: kategori (jika bukan "Semua") → keyword (case-insensitive, nama_menu | deskripsi)
  // Panggil renderMenuGrid(filtered)
```

**Sifat**: murni terhadap `allItems` — tidak pernah memutasi `allItems`.

---

### Cart

State dan fungsi mutasi keranjang belanja.

```js
// State
let cart = []  // Cart_Item[]

// Struktur Cart_Item
// { id: number, nama_menu: string, harga: number, gambar: string, kuantitas: number }

function addToCart(menuItem: MenuItem): void
  // Jika item.id sudah ada di cart → kuantitas += 1
  // Jika belum ada → push { id, nama_menu, harga, gambar, kuantitas: 1 }
  // Panggil renderCartPanel()

function changeQty(id: number, delta: number): void
  // Temukan item di cart berdasarkan id
  // kuantitas += delta
  // Jika kuantitas <= 0 → hapus item dari cart
  // Panggil renderCartPanel()

function removeFromCart(id: number): void
  // Filter cart untuk menghapus item dengan id tersebut
  // Panggil renderCartPanel()
```

---

### Cart_Panel

Merender state keranjang ke DOM.

```js
function renderCartPanel(): void
  // Tulis ulang #cart-items-list
  // Perbarui #cart-count-badge dan #cart-fab-badge
  // Perbarui #cart-total-price via formatRupiah(totalHarga)
  // Jika cart kosong → tampilkan empty state, disable #cart-checkout-btn
  // Jika tidak kosong → enable #cart-checkout-btn
```

**Event delegation**: listener dipasang sekali pada `#cart-panel` untuk tombol `+` dan `−`.

---

### WhatsApp_Redirect

Membangun pesan pesanan dan membuka URL WhatsApp.

```js
function buildOrderMessage(): string
  // Kembalikan string pesan dalam Bahasa Indonesia:
  // - Salam pembuka
  // - Daftar item: "- {nama_menu} x{kuantitas} = {formatRupiah(harga * kuantitas)}"
  // - Total: "Total: {formatRupiah(totalHarga)}"

function handleCheckout(): void
  // Jika cart kosong → tampilkan peringatan, return
  // Bangun pesan via buildOrderMessage()
  // Buka "https://wa.me/6289540571803?text=" + encodeURIComponent(pesan) di tab baru
```

---

### Rupiah_Formatter

```js
function formatRupiah(angka: number): string
  // return "Rp " + Number(angka).toLocaleString("id-ID")
  // Contoh: formatRupiah(15000) → "Rp 15.000"
```

---

## Model Data

### Menu_Item (dari `data/menu.json` → `master_menu[]`)

```js
{
  id: number,                    // integer positif, unik
  nama_menu: string,             // nama tampilan
  kategori: string,              // salah satu dari Kategori Tetap
  deskripsi: string,             // deskripsi singkat
  harga: number,                 // integer, dalam Rupiah penuh (misal 15000)
  gambar: string,                // path relatif: "assets/img/<filename>"
  aktif: boolean,                // true = tampil di katalog
  status_ketersediaan: string    // "tersedia" | "habis"
}
```

### Cart_Item (in-memory)

```js
{
  id: number,         // sama dengan Menu_Item.id
  nama_menu: string,
  harga: number,
  gambar: string,
  kuantitas: number   // integer positif, minimal 1
}
```

### State Modul

```js
let allItems      = []        // Menu_Item[], diisi sekali saat load, tidak pernah dimutasi
let cart          = []        // Cart_Item[], dimutasi oleh fungsi cart
let activeCategory = "Semua" // string, salah satu dari Kategori Tetap atau "Semua"
let searchQuery   = ""        // string, nilai input pencarian saat ini (lowercase)
```

---

## Strategi CSS dan Konvensi Penamaan

### Scoping

Semua CSS baru untuk halaman katalog ditulis di bawah selector `[data-page="katalog"]` untuk menghindari konflik dengan halaman lain.

```css
[data-page="katalog"] .catalog-layout { ... }
[data-page="katalog"] .catalog-card   { ... }
```

### Design Tokens

Menggunakan variabel CSS yang sudah ada di `:root`:

| Token | Nilai | Penggunaan |
|---|---|---|
| `--primary` | `#6e4f35` | Tombol filter aktif, harga |
| `--primary-dark` | `#4e3521` | Judul kartu |
| `--accent` | `#2e5b3c` | Badge kategori, ikon |
| `--accent-soft` | `#d9e5d3` | Background badge tersedia |
| `--danger` | `#b4532a` | Badge habis |
| `--border` | `rgba(110,79,53,0.14)` | Border kartu |
| `--shadow` | `0 20px 50px rgba(74,48,28,0.12)` | Shadow kartu |
| `--surface` | `#fffdf9` | Background kartu |
| `--muted` | `#6e6255` | Teks sekunder |

### Kelas Utama

| Kelas | Elemen | Keterangan |
|---|---|---|
| `.catalog-layout` | `<div>` wrapper utama | Flex container untuk content + cart panel |
| `.catalog-inner` | `<div>` | Flex row: catalog-content + cart-panel |
| `.catalog-content` | `<div>` | Area utama (filter + grid), flex-grow: 1 |
| `.catalog-page-header` | `<div>` | Header halaman dengan judul dan deskripsi |
| `.catalog-filter-area` | `<div>` | Sticky filter bar |
| `.catalog-filter-row` | `<div>` | Flex row: tombol kategori + search input |
| `.catalog-filter-buttons` | `<div>` | Grup tombol filter kategori |
| `.catalog-filter-btn` | `<button>` | Tombol filter individual |
| `.catalog-filter-btn.active` | `<button>` | Tombol filter yang sedang aktif |
| `.catalog-search-wrap` | `<div>` | Wrapper input pencarian dengan ikon |
| `.catalog-search-input` | `<input>` | Input pencarian |
| `.catalog-grid-area` | `<div>` | Wrapper area grid menu |
| `.menu-card` | `<div>` | Kartu menu individual |
| `.menu-card-img-wrap` | `<div>` | Wrapper gambar + badge status |
| `.menu-card-img` | `<img>` | Gambar menu |
| `.menu-card-badge` | `<span>` | Badge status (tersedia/habis) |
| `.badge-tersedia` | modifier | Badge hijau "Tersedia" |
| `.badge-habis` | modifier | Badge merah "Habis" |
| `.menu-card-body` | `<div>` | Konten teks kartu |
| `.menu-card-kategori` | `<span>` | Label kategori |
| `.menu-card-nama` | `<h3>` | Nama menu |
| `.menu-card-deskripsi` | `<p>` | Deskripsi (clamp 2 baris) |
| `.menu-card-footer` | `<div>` | Baris harga + tombol tambah |
| `.menu-card-harga` | `<span>` | Harga dalam format Rupiah |
| `.btn-tambah-keranjang` | `<button>` | Tombol tambah ke keranjang |
| `.cart-panel` | `<aside>` | Panel keranjang |
| `.cart-panel-header` | `<div>` | Header panel keranjang |
| `.cart-panel-title` | `<h2>` | Judul panel + badge jumlah |
| `.cart-badge` | `<span>` | Badge jumlah item di keranjang |
| `.cart-panel-body` | `<div>` | Daftar item keranjang (scrollable) |
| `.cart-item` | `<div>` | Satu baris item keranjang |
| `.cart-item-img` | `<img>` | Gambar mini item keranjang |
| `.cart-item-info` | `<div>` | Nama + harga satuan |
| `.cart-item-qty` | `<div>` | Kontrol kuantitas (−, angka, +) |
| `.cart-qty-btn` | `<button>` | Tombol + atau − |
| `.cart-item-subtotal` | `<span>` | Subtotal per item |
| `.cart-empty-state` | `<div>` | State kosong keranjang |
| `.cart-panel-footer` | `<div>` | Footer: total + tombol checkout |
| `.cart-total-row` | `<div>` | Baris total harga |
| `.cart-checkout-btn` | `<button>` | Tombol checkout WhatsApp |
| `.cart-fab` | `<button>` | Floating action button (mobile) |
| `.cart-fab-badge` | `<span>` | Badge jumlah item pada FAB |

---

## Strategi Layout Responsif

### Desktop (≥ 992px / `lg`)

```
┌─────────────────────────────────────────────────────┐
│  Topbar                                             │
│  Header / Navbar                                    │
├──────────────────────────────────┬──────────────────┤
│  catalog-content                 │  cart-panel      │
│  ┌──────────────────────────┐    │  (fixed sidebar, │
│  │  Filter + Search         │    │   width: 340px,  │
│  └──────────────────────────┘    │   sticky top)    │
│  ┌────┐ ┌────┐ ┌────┐            │                  │
│  │card│ │card│ │card│  (3 col)   │  [item list]     │
│  └────┘ └────┘ └────┘            │  [total]         │
│  ┌────┐ ┌────┐ ┌────┐            │  [checkout btn]  │
│  │card│ │card│ │card│            │                  │
│  └────┘ └────┘ └────┘            │                  │
├──────────────────────────────────┴──────────────────┤
│  Footer                                             │
└─────────────────────────────────────────────────────┘
```

### Tablet (576px–991px / `sm`–`md`)

- Grid menu: 2 kolom (`col-sm-6`)
- Cart panel: tersembunyi, dapat dibuka via FAB
- FAB muncul di pojok kanan bawah

### Mobile (< 576px)

- Grid menu: 1 kolom (`col-12`)
- Cart panel: tersembunyi, dapat dibuka via FAB
- FAB muncul di pojok kanan bawah
- Cart panel muncul sebagai overlay dari kanan (slide-in)

### Implementasi Toggle Mobile

```js
// FAB klik → tambahkan class .is-open pada #cart-panel
// Overlay backdrop klik → hapus class .is-open
// Tombol close (#cart-panel-close) → hapus class .is-open
```

```css
/* Mobile: cart panel tersembunyi secara default */
@media (max-width: 991.98px) {
  .cart-panel {
    position: fixed;
    right: -100%;
    top: 0;
    height: 100vh;
    transition: right 0.3s ease;
    z-index: 50;
  }
  .cart-panel.is-open {
    right: 0;
  }
}
```

---

## Penanganan Error dan Edge Case

| Kondisi | Penanganan |
|---|---|
| `fetch` gagal (network error) | Tampilkan pesan error di `#catalog-menu-grid` dengan ikon `bi-exclamation-triangle` |
| JSON tidak valid | Catch di `.catch()`, tampilkan pesan error yang sama |
| `master_menu` tidak ada atau bukan array | Throw error, ditangkap oleh `.catch()` |
| Tidak ada item dengan `aktif: true` | Tampilkan "Menu belum tersedia saat ini" di grid |
| Filter menghasilkan nol item | Tampilkan "Tidak ada menu yang sesuai" di grid |
| Gambar gagal dimuat | `onerror` pada `<img>` → ganti `src` ke `assets/img/about.jpg` |
| Gambar path kosong/null | Gunakan `assets/img/about.jpg` langsung saat render |
| Checkout dengan keranjang kosong | Tampilkan alert, tidak buka WhatsApp |
| Item `status_ketersediaan: "habis"` | Tombol "Tambah ke Keranjang" di-`disabled`, badge "Habis" ditampilkan |
| Klik tombol disabled | Event tidak terpicu (atribut `disabled` mencegah klik) |
| `deskripsi` kosong atau null | Render string kosong, CSS clamp tidak bermasalah |
| `harga` bukan angka | `Number(harga)` → `NaN` → `toLocaleString` → `"NaN"`, perlu guard: `Number(harga) || 0` |

---

## Properti Kebenaran

*Sebuah properti adalah karakteristik atau perilaku yang harus berlaku di semua eksekusi sistem yang valid — pada dasarnya, pernyataan formal tentang apa yang seharusnya dilakukan sistem. Properti berfungsi sebagai jembatan antara spesifikasi yang dapat dibaca manusia dan jaminan kebenaran yang dapat diverifikasi secara otomatis.*

### Properti 1: Filter aktif hanya meneruskan item aktif

*Untuk semua* array menu item dengan campuran nilai `aktif`, fungsi filter Menu_Loader hanya boleh mengembalikan item yang memiliki `aktif: true` — tidak ada item dengan `aktif: false` atau `aktif` tidak terdefinisi yang boleh lolos.

**Memvalidasi: Persyaratan 1.2**

---

### Properti 2: Rupiah_Formatter menghasilkan format yang benar

*Untuk semua* bilangan bulat non-negatif, `formatRupiah(n)` harus mengembalikan string yang diawali `"Rp "` dan bagian angkanya identik dengan `n.toLocaleString("id-ID")`.

**Memvalidasi: Persyaratan 2.2, 7.5**

---

### Properti 3: Render kartu menu memuat semua informasi wajib

*Untuk semua* Menu_Item aktif, HTML yang dihasilkan oleh `renderMenuGrid` harus mengandung: nama menu, kategori, harga yang diformat, badge status ketersediaan, atribut `loading="lazy"` pada elemen `<img>`, dan tombol "Tambah ke Keranjang" (dinonaktifkan jika `status_ketersediaan === "habis"`).

**Memvalidasi: Persyaratan 2.1, 2.4, 2.5, 2.6, 8.4**

---

### Properti 4: Filter kategori hanya menampilkan item dari kategori yang dipilih

*Untuk semua* kombinasi array menu item dan pilihan kategori (bukan "Semua"), `applyFilters()` hanya boleh merender item yang `kategori`-nya sama persis dengan kategori yang dipilih — tidak ada item dari kategori lain yang boleh muncul.

**Memvalidasi: Persyaratan 3.3, 3.5**

---

### Properti 5: Filter gabungan (kategori + kata kunci) adalah irisan keduanya

*Untuk semua* kombinasi kategori aktif dan kata kunci pencarian, hasil `applyFilters()` harus merupakan irisan dari: (a) item yang cocok dengan filter kategori, dan (b) item yang `nama_menu` atau `deskripsi`-nya mengandung kata kunci (case-insensitive). Tidak ada item yang lolos jika tidak memenuhi kedua kondisi.

**Memvalidasi: Persyaratan 3.6, 4.2, 4.3**

---

### Properti 6: Menambahkan item baru ke keranjang menghasilkan entri dengan kuantitas 1

*Untuk semua* Menu_Item yang belum ada di keranjang, memanggil `addToCart(item)` harus menghasilkan tepat satu entri baru di `cart` dengan `kuantitas: 1` dan semua field wajib (`id`, `nama_menu`, `harga`, `gambar`) terisi dengan nilai yang benar dari item sumber.

**Memvalidasi: Persyaratan 5.1, 5.4**

---

### Properti 7: Menambahkan item yang sudah ada menambah kuantitas sebesar 1

*Untuk semua* state keranjang dan Menu_Item yang sudah ada di keranjang, memanggil `addToCart(item)` harus menambah `kuantitas` item tersebut sebesar tepat 1 tanpa membuat entri duplikat — panjang array `cart` tidak boleh bertambah.

**Memvalidasi: Persyaratan 5.2**

---

### Properti 8: Operasi kuantitas keranjang mempertahankan invariant

*Untuk semua* state keranjang dengan item berisi kuantitas arbitrer:
- `changeQty(id, +1)` harus menambah kuantitas item sebesar tepat 1
- `changeQty(id, -1)` pada item dengan kuantitas > 1 harus mengurangi kuantitas sebesar tepat 1
- `changeQty(id, -1)` pada item dengan kuantitas = 1 harus menghapus item dari keranjang

**Memvalidasi: Persyaratan 6.2, 6.3, 6.4**

---

### Properti 9: Total harga keranjang adalah jumlah harga × kuantitas semua item

*Untuk semua* state keranjang, total harga yang ditampilkan oleh `renderCartPanel()` harus sama persis dengan `Σ(item.harga × item.kuantitas)` untuk semua item di keranjang, diformat menggunakan `formatRupiah`.

**Memvalidasi: Persyaratan 6.5**

---

### Properti 10: Pesan pesanan memuat semua informasi wajib

*Untuk semua* state keranjang yang tidak kosong, `buildOrderMessage()` harus menghasilkan string yang mengandung: salam pembuka, nama setiap item, kuantitas setiap item, subtotal setiap item dalam format Rupiah, dan total keseluruhan dalam format Rupiah.

**Memvalidasi: Persyaratan 7.1, 7.2, 7.5**

---

### Properti 11: URL WhatsApp dikonstruksi dengan benar

*Untuk semua* pesan pesanan yang dihasilkan, URL yang dikonstruksi harus diawali dengan `"https://wa.me/6289540571803?text="` dan bagian setelah `?text=` harus identik dengan `encodeURIComponent(pesan)`.

**Memvalidasi: Persyaratan 7.3**

---

## Strategi Pengujian

### Pendekatan Pengujian Ganda

Fitur ini menggunakan dua lapisan pengujian yang saling melengkapi:

1. **Unit test berbasis contoh**: memverifikasi perilaku spesifik, edge case, dan kondisi error
2. **Property-based test**: memverifikasi properti universal di atas berbagai input yang digenerate

### Library Property-Based Testing

Karena proyek ini tidak memiliki build system atau `package.json`, property-based test dijalankan menggunakan **fast-check** yang dimuat via CDN dalam file HTML test terpisah (`tests/catalog.test.html`). Setiap property test dikonfigurasi untuk menjalankan minimal **100 iterasi**.

Format tag untuk setiap property test:
```
// Feature: food-catalog-ordering, Property {N}: {teks properti}
```

### Unit Test (Berbasis Contoh)

| Test | Persyaratan |
|---|---|
| `fetch` dipanggil dengan `cache: "no-store"` | 1.1 |
| Pesan error muncul saat fetch gagal | 1.3, 9.1 |
| Pesan kosong muncul saat tidak ada item aktif | 1.4, 9.2 |
| Tombol filter "Semua" aktif saat halaman dimuat | 3.2 |
| Semua 5 tombol kategori ada di DOM | 3.1 |
| Input pencarian memiliki placeholder Bahasa Indonesia | 4.1 |
| Checkout dengan keranjang kosong menampilkan peringatan | 7.4, 9.3 |
| Cart panel menampilkan empty state saat keranjang kosong | 6.6 |
| Tombol checkout di-disable saat keranjang kosong | 6.6 |

### Property-Based Test

Setiap properti di bagian "Properti Kebenaran" diimplementasikan sebagai satu property-based test:

| Property Test | Properti | Iterasi |
|---|---|---|
| Filter aktif hanya meneruskan item aktif | Properti 1 | 100 |
| Rupiah_Formatter menghasilkan format yang benar | Properti 2 | 100 |
| Render kartu memuat semua informasi wajib | Properti 3 | 100 |
| Filter kategori hanya menampilkan item yang cocok | Properti 4 | 100 |
| Filter gabungan adalah irisan keduanya | Properti 5 | 100 |
| Tambah item baru → kuantitas 1 | Properti 6 | 100 |
| Tambah item yang ada → kuantitas +1 | Properti 7 | 100 |
| Operasi kuantitas mempertahankan invariant | Properti 8 | 100 |
| Total harga = Σ(harga × kuantitas) | Properti 9 | 100 |
| Pesan pesanan memuat semua informasi wajib | Properti 10 | 100 |
| URL WhatsApp dikonstruksi dengan benar | Properti 11 | 100 |

### Edge Case yang Harus Dicakup Generator

Generator input untuk property test harus mencakup:
- Array menu kosong
- Item dengan `deskripsi` kosong atau null
- Item dengan `gambar` kosong atau null
- Harga 0 dan harga sangat besar
- Nama menu dengan karakter khusus (tanda kutip, ampersand, dll.)
- Kata kunci pencarian yang cocok dengan case berbeda
- Keranjang dengan satu item, banyak item, dan item dengan kuantitas besar
