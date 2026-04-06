# Rumah Makan Bu Jawa

Website custom ringan berbasis PHP dan SQLite untuk rumah makan berbahasa Indonesia.

## Fitur utama

- Halaman publik untuk beranda, tentang kami, menu hari ini, menu besok, dan kontak.
- Dashboard admin sederhana dengan login.
- CRUD menu.
- Pengaturan status aktif atau nonaktif.
- Pengaturan status ketersediaan `tersedia` atau `habis`.
- Penjadwalan menu berdasarkan `tanggal_tampil` dan `tipe_hari`.
- Database SQLite lokal siap pakai.

## Struktur penting

- `index.php` : halaman publik.
- `admin/login.php` : login admin.
- `admin/index.php` : dashboard admin.
- `admin/menu_form.php` : tambah dan edit menu.
- `includes/` : konfigurasi, autentikasi, helper, dan koneksi database.
- `database/schema.sql` : schema dan seed awal.
- `data/rumah_makan_bu_jawa.sqlite` : file database SQLite.

## Login awal admin

- Username: `admin`
- Password: `admin123`

Password awal akan di-upgrade ke hash saat login pertama kali.

## Menjalankan aplikasi

Gunakan server PHP lokal atau hosting PHP yang mendukung SQLite, lalu buka `index.php`.

Contoh dengan server bawaan PHP:

```bash
php -S localhost:8000
```

Lalu akses:

- `http://localhost:8000/index.php`
- `http://localhost:8000/admin/login.php`
