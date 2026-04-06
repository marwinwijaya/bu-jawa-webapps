# Rumah Makan Bu Jawa

Versi ini disiapkan untuk hosting statis seperti GitHub Pages.

## Teknologi

- HTML
- CSS
- JavaScript
- Penyimpanan data lokal browser menggunakan `localStorage`

## Halaman utama

- [index.html](d:/Development/amal/bu-jawa-webapps/index.html) untuk website publik
- [admin.html](d:/Development/amal/bu-jawa-webapps/admin.html) untuk dashboard admin

## Login awal admin

- Username: `admin`
- Password: `admin123`

## Cara kerja data

- Semua data menu disimpan di browser yang membuka website
- Perubahan dari admin hanya tersimpan di perangkat dan browser tersebut
- Jika browser dibersihkan atau ganti perangkat, data tidak ikut berpindah

## Cocok untuk

- Demo
- Prototype
- Website statis di GitHub Pages

## Batasan penting

- Tidak ada backend server
- Tidak ada SQLite saat live di GitHub Pages
- Login admin bersifat frontend-only dan tidak aman untuk kebutuhan produksi multi-user

## Deploy ke GitHub Pages

Upload isi repo ini ke branch GitHub Pages Anda, lalu gunakan:

- `index.html` sebagai halaman publik
- `admin.html` sebagai halaman admin
