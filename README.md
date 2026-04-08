# Rumah Makan Bu Jawa

Website statis untuk GitHub Pages dengan admin lokal untuk mengelola menu dan memperbarui file JSON.

## Struktur utama

- `index.html` : website publik
- `login.html` : halaman login admin
- `admin.html` : admin lokal untuk kelola menu
- `assets/css/` : styling
- `assets/js/site.js` : logika website publik
- `assets/js/admin-*.js` : modul logika admin
- `data/menu.json` : sumber data publik

## Cara kerja

1. Website publik membaca data dari `data/menu.json`.
2. Admin membuka `login.html` lalu login.
3. Admin mengelola `master_menu`, lalu memilih menu ke `menu_hari_ini` atau `menu_besok`.
4. Seluruh perubahan bekerja di draft aktif yang tersimpan otomatis di browser.
5. Jika perlu memuat data awal dari repository, gunakan tombol `Import JSON`.
6. Saat selesai, gunakan `Simpan / Export JSON` untuk mengunduh file `menu.json` terbaru.
7. Ganti file `data/menu.json` di project lokal, lalu commit dan push lewat GitHub Desktop.

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
- File gambar menu direferensikan ke `assets/img/nama-file.ext`, jadi file aslinya perlu ikut disalin ke folder `assets/img` di project lokal.

## Deploy

Upload repository ini ke GitHub Pages. Halaman utama publik memakai `index.html`.

Untuk update menu:

1. Buka `login.html`
2. Kelola menu
3. Jika perlu, gunakan `Import JSON` untuk memuat data awal
4. Klik `Simpan / Export JSON`
5. Ganti file `data/menu.json` dengan hasil export
6. Commit dan push ke GitHub
