# Rumah Makan Bu Jawa

Website statis untuk GitHub Pages dengan admin lokal generator JSON.

## Struktur utama

- `index.html` : website publik
- `admin.html` : admin lokal untuk kelola menu dan generate JSON
- `assets/css/` : styling
- `assets/js/site.js` : logika website publik
- `assets/js/admin.js` : logika admin generator JSON
- `data/menu.json` : sumber data publik

## Cara kerja

1. Website publik membaca data dari `data/menu.json`.
2. Admin membuka `admin.html` lalu login.
3. Admin mengelola `master_menu`, lalu memilih menu ke `menu_hari_ini` atau `menu_besok`.
4. Admin dapat mempromosikan `menu_besok` menjadi `menu_hari_ini` dalam satu klik.
5. Admin mengunduh file JSON hasil generate.
6. File hasil unduhan digunakan untuk menggantikan `data/menu.json` di repository GitHub.

## Format data

Setiap item master menu memiliki field:

- `id`
- `nama_menu`
- `kategori`
- `deskripsi`
- `harga`
- `gambar`
- `aktif`
- `status_ketersediaan`

Struktur file JSON utama:

- `metadata`
- `master_menu`
- `menu_hari_ini`
- `menu_besok`

## Catatan penting

- Website ini full static dan tidak memakai backend.
- Tidak ada database runtime.
- Halaman publik hanya membaca file JSON.
- Admin lokal menyimpan draft otomatis di browser untuk memudahkan editing.
- Data yang benar-benar dipakai website publik tetap berasal dari `data/menu.json`.

## Deploy

Upload repository ini ke GitHub Pages. Halaman utama publik memakai `index.html`.

Untuk update menu:

1. Buka `admin.html`
2. Kelola menu
3. Klik unduh JSON
4. Ganti file `data/menu.json`
5. Commit dan push ke GitHub
