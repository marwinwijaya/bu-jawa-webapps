# Rencana Implementasi: Katalog Menu & Pemesanan

## Gambaran Umum

Implementasi halaman `catalog.html` dan `assets/js/catalog.js` untuk Rumah Makan Bu Jawa. Halaman ini memungkinkan pengunjung menelusuri seluruh daftar menu, memfilter dan mencari item, mengelola keranjang belanja, dan mengirim pesanan via WhatsApp — semuanya berjalan sepenuhnya di sisi klien tanpa backend.

## Tugas

- [x] 1. Buat struktur HTML `catalog.html`
  - Buat file `catalog.html` dengan struktur halaman lengkap: topbar, header/navbar (konsisten dengan `index.html`), area filter & pencarian, area grid menu (`#catalog-menu-grid`), panel keranjang (`#cart-panel`), dan footer
  - Sertakan semua dependensi: Bootstrap 5 lokal, Bootstrap Icons, Google Fonts, `assets/css/style.css`, dan `assets/js/catalog.js`
  - Tambahkan atribut `data-page="katalog"` pada `<body>` untuk scoping CSS
  - Tambahkan link navigasi ke `catalog.html` dari `index.html` (navbar dan tombol CTA yang relevan)
  - _Persyaratan: 1.5, 2.4, 8.1_

- [ ] 2. Implementasi pemuatan data menu (`Menu_Loader`)
  - [-] 2.1 Tulis fungsi `loadMenuData()` di `catalog.js` yang mengambil `data/menu.json` menggunakan `fetch` dengan opsi `cache: "no-store"`, mem-parsing array `master_menu`, dan memfilter hanya item dengan `aktif: true`
    - Fungsi dipanggil di dalam event listener `DOMContentLoaded`
    - Simpan hasil filter ke variabel modul `allItems` (array in-memory)
    - _Persyaratan: 1.1, 1.2, 1.5_
  - [-] 2.2 Tangani kondisi error dan kosong pada `loadMenuData()`
    - Jika fetch gagal (network error, file tidak ditemukan, JSON tidak valid): tampilkan pesan error informatif dalam Bahasa Indonesia di `#catalog-menu-grid`
    - Jika `master_menu` kosong atau tidak ada item `aktif: true`: tampilkan pesan "Menu belum tersedia saat ini" di `#catalog-menu-grid`
    - Pastikan tidak ada crash halaman pada kondisi apapun
    - _Persyaratan: 1.3, 1.4, 9.1, 9.2_

- [ ] 3. Implementasi `Rupiah_Formatter` dan render kartu menu (`Menu_Grid`)
  - [-] 3.1 Tulis fungsi `formatRupiah(angka)` yang mengubah integer (misal `15000`) menjadi string `Rp 15.000` menggunakan `toLocaleString("id-ID")`
    - _Persyaratan: 2.2, 7.5_
  - [-] 3.2 Tulis fungsi `renderMenuGrid(items)` yang menerima array Menu_Item dan merender kartu ke `#catalog-menu-grid`
    - Setiap kartu menampilkan: gambar (`loading="lazy"`, fallback ke `assets/img/about.jpg` via `onerror`), nama menu, kategori, deskripsi (CSS clamp 2 baris), harga via `formatRupiah`, badge status ketersediaan
    - Badge "Tersedia" (`.badge-success`) atau "Habis" (`.badge-danger`) sesuai `status_ketersediaan`
    - Tombol "Tambah ke Keranjang" dinonaktifkan (`disabled`) jika status `"habis"`
    - Tata letak grid responsif: `col-12 col-sm-6 col-lg-4` (Bootstrap 5)
    - _Persyaratan: 2.1, 2.3, 2.4, 2.5, 2.6, 8.3, 8.4, 8.5, 9.4_

- [-] 4. Implementasi filter kategori (`Category_Filter`)
  - Tulis fungsi `initCategoryFilter()` yang merender tombol filter untuk kategori tetap: "Semua", "Menu Utama", "Menu Sayur", "Minuman", "Snack"
  - Saat halaman dimuat, filter aktif adalah "Semua" dan semua item aktif ditampilkan
  - Klik tombol kategori: tandai tombol sebagai aktif, panggil `applyFilters()` untuk memperbarui grid
  - _Persyaratan: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [-] 5. Implementasi pencarian kata kunci (`Search_Bar`)
  - Tambahkan elemen `<input type="text">` dengan placeholder Bahasa Indonesia di area filter
  - Pasang event listener `input` yang memanggil `applyFilters()` pada setiap keystroke
  - _Persyaratan: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 6. Implementasi fungsi filter gabungan `applyFilters()`
  - Tulis fungsi `applyFilters()` yang membaca state filter kategori aktif dan nilai search bar saat ini
  - Filter `allItems`: pertama berdasarkan kategori (jika bukan "Semua"), lalu berdasarkan kata kunci (case-insensitive, cocokkan `nama_menu` atau `deskripsi`)
  - Panggil `renderMenuGrid(filteredItems)` dengan hasil filter
  - Jika hasil kosong: tampilkan pesan kosong Bahasa Indonesia di grid
  - _Persyaratan: 3.3, 3.4, 3.5, 3.6, 4.2, 4.3, 4.4, 4.5_

- [ ] 7. Checkpoint — Pastikan semua tes lulus, tanyakan kepada pengguna jika ada pertanyaan.

- [ ] 8. Implementasi keranjang belanja (`Cart`)
  - [~] 8.1 Definisikan state keranjang sebagai array in-memory `cart = []` dengan struktur item: `{ id, nama_menu, harga, gambar, kuantitas }`
    - _Persyaratan: 5.4_
  - [~] 8.2 Tulis fungsi `addToCart(menuItem)` yang menambahkan item baru dengan kuantitas 1, atau menambah kuantitas jika item sudah ada (berdasarkan `id`)
    - Setelah mutasi, panggil `renderCartPanel()`
    - _Persyaratan: 5.1, 5.2, 5.3_
  - [~] 8.3 Pasang event listener pada tombol "Tambah ke Keranjang" di setiap kartu menu (gunakan event delegation pada `#catalog-menu-grid`)
    - _Persyaratan: 5.1, 5.5_

- [ ] 9. Implementasi panel keranjang (`Cart_Panel`)
  - [~] 9.1 Tulis fungsi `renderCartPanel()` yang merender daftar Cart_Item ke `#cart-panel`, menampilkan: gambar mini, nama, harga satuan, tombol (+) dan (−) kuantitas, dan subtotal per item
    - Tampilkan total keseluruhan (jumlah `harga × kuantitas` semua item) via `formatRupiah`
    - Jika keranjang kosong: tampilkan pesan kosong Bahasa Indonesia dan nonaktifkan tombol checkout
    - _Persyaratan: 5.3, 5.5, 6.1, 6.5, 6.6_
  - [~] 9.2 Pasang event delegation pada `#cart-panel` untuk tombol (+) dan (−)
    - Tombol (+): panggil `changeQty(id, +1)`
    - Tombol (−) dengan kuantitas > 1: panggil `changeQty(id, -1)`
    - Tombol (−) dengan kuantitas = 1: panggil `removeFromCart(id)`
    - Setiap mutasi memanggil `renderCartPanel()`
    - _Persyaratan: 6.2, 6.3, 6.4_
  - [~] 9.3 Pastikan `Cart_Panel` dapat diakses di mobile (panel samping yang dapat di-toggle atau bagian bawah halaman yang selalu terlihat)
    - _Persyaratan: 8.2, 8.5_

- [~] 10. Implementasi pemesanan via WhatsApp (`WhatsApp_Redirect`)
  - Tulis fungsi `buildOrderMessage()` yang membuat teks `Order_Message` dalam Bahasa Indonesia: salam pembuka, daftar item (nama, kuantitas, subtotal per baris), dan total keseluruhan via `formatRupiah`
  - Pasang event listener pada tombol checkout: jika keranjang kosong tampilkan pesan peringatan "Keranjang masih kosong" (tanpa redirect); jika tidak kosong buka `https://wa.me/6289540571803?text=<encodeURIComponent(pesan)>` di tab baru
  - _Persyaratan: 7.1, 7.2, 7.3, 7.4, 7.5, 9.3_

- [~] 11. Tambahkan CSS untuk halaman katalog ke `assets/css/style.css`
  - Tambahkan styles untuk: kartu menu katalog (`.catalog-card`), panel keranjang (`.cart-panel`), tombol filter kategori (`.catalog-filter-btn`), badge status, dan state kosong/error — konsisten dengan design token yang sudah ada di `:root`
  - Pastikan semua elemen interaktif dapat digunakan hanya dengan sentuhan jari (ukuran tap target minimal 44px)
  - _Persyaratan: 8.1, 8.5_

- [ ] 12. Checkpoint akhir — Pastikan semua tes lulus, tanyakan kepada pengguna jika ada pertanyaan.

## Catatan

- Semua teks antarmuka dalam Bahasa Indonesia
- Tidak ada build step — file langsung dijalankan di browser
- `catalog.js` menggunakan IIFE atau modul ES6 sederhana; tidak ada dependensi eksternal selain Bootstrap 5 yang sudah tersedia di `assets/vendor/`
- Gambar fallback menggunakan `onerror="this.src='assets/img/about.jpg'"` pada elemen `<img>`
- Nomor WhatsApp diambil dari `data/menu.json` (`metadata.telepon`) atau di-hardcode sesuai data yang ada: `6289540571803`
- Setiap tugas merujuk ke persyaratan spesifik untuk keterlacakan
