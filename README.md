# Rumah Makan Bu Jawa

Website statis untuk GitHub Pages dengan admin lokal untuk mengelola menu dan memperbarui file JSON.

## Struktur utama

- `index.html` : website publik
- `admin.html` : admin lokal untuk kelola menu
- `assets/css/` : styling
- `assets/js/site.js` : logika website publik
- `assets/js/admin-*.js` : modul logika admin
- `data/menu.json` : sumber data publik

## Cara kerja

1. Website publik membaca data dari `data/menu.json`.
2. Admin membuka `admin.html` lalu login.
3. Admin mengelola `master_menu`, lalu memilih menu ke `menu_hari_ini` atau `menu_besok`.
4. Saat klik `Simpan`, admin memilih file `data/menu.json` lokal pada penyimpanan pertama.
5. Perubahan berikutnya akan menulis ulang file JSON terbaru ke file yang sama selama sesi browser masih aktif.
6. Setelah file lokal berubah, admin cukup commit dan push lewat GitHub Desktop.

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
- Penyimpanan langsung ke file membutuhkan browser yang mendukung File System Access API, seperti Chrome atau Edge terbaru.

## Deploy

Upload repository ini ke GitHub Pages. Halaman utama publik memakai `index.html`.

Untuk update menu:

1. Buka `admin.html`
2. Kelola menu
3. Klik `Simpan`
4. Pilih file `data/menu.json` pada penyimpanan pertama
5. Commit dan push ke GitHub
