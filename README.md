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
5. Saat selesai, klik `Simpan` untuk menulis perubahan ke `data/menu.json`.
6. Pada penyimpanan pertama, browser akan meminta Anda memilih file `data/menu.json` sekali.
7. Setelah itu, klik `Simpan` berikutnya akan menulis ke file yang sama selama izin browser masih tersedia.
8. Commit dan push lewat GitHub Desktop.

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
- Penyimpanan langsung ke file membutuhkan browser yang mendukung File System Access API, seperti Chrome atau Edge terbaru.

## Deploy

Upload repository ini ke GitHub Pages. Halaman utama publik memakai `index.html`.

Untuk update menu:

1. Buka `login.html`
2. Kelola menu
3. Klik `Simpan`
4. Pada pertama kali, pilih file `data/menu.json`
5. Commit dan push ke GitHub
