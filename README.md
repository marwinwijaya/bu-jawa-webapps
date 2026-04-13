# Rumah Makan Bu Jawa

Website statis untuk menampilkan menu harian Rumah Makan Bu Jawa, dilengkapi dengan panel admin lokal untuk mengelola data menu dan mempublikasikannya ke GitHub Pages.

---

## Fitur Utama

**Halaman Publik**
- Menampilkan menu hari ini dan preview menu besok secara real-time dari `data/menu.json`
- Setiap item menu menampilkan foto, nama, kategori, harga, dan status ketersediaan
- Tampilan responsif berbasis Bootstrap 5, dapat diakses dari perangkat apa pun

**Panel Admin**
- Login berbasis sesi dengan proteksi halaman dashboard
- Manajemen master menu: tambah, edit, hapus, aktifkan, dan atur ketersediaan menu
- Penjadwalan menu harian: susun daftar Menu Hari Ini dan Menu Besok secara terpisah
- Bulk action: pilih beberapa menu sekaligus dan tambahkan ke jadwal
- Salin Menu Hari Ini ke Menu Besok dengan satu klik
- Upload gambar menu langsung dari browser; file disimpan ke folder `assets/img`
- Draft admin tersimpan otomatis di `localStorage` sehingga tidak hilang saat halaman di-refresh
- Tombol Simpan menulis perubahan langsung ke `data/menu.json` menggunakan File System Access API

---

## Instalasi dan Menjalankan Proyek

Proyek ini tidak memerlukan instalasi dependensi atau proses build.

**Menjalankan secara lokal**

Buka file `index.html` langsung di browser Chrome atau Edge. Untuk menghindari batasan CORS saat memuat `data/menu.json` via `fetch`, disarankan menggunakan static file server:

```bash
npx serve .
```

Kemudian buka `http://localhost:3000` di browser.

**Mengakses panel admin**

1. Buka `login.html`
2. Masuk dengan kredensial admin
3. Kelola master menu dan susun jadwal harian
4. Klik **Simpan** — pada pertama kali, browser akan meminta Anda memilih file `data/menu.json`
5. Commit dan push perubahan ke GitHub menggunakan GitHub Desktop

> Panel admin memerlukan browser yang mendukung File System Access API (Chrome atau Edge versi terbaru).

**Deploy ke GitHub Pages**

Push repository ke GitHub dan aktifkan GitHub Pages dengan source branch yang sesuai. Halaman utama menggunakan `index.html` sebagai entry point.

---

## Struktur Folder

```
/
├── index.html              # Halaman publik
├── login.html              # Halaman login admin
├── admin.html              # Dashboard admin
├── data/
│   └── menu.json           # Sumber data menu untuk halaman publik
├── assets/
│   ├── css/
│   │   └── style.css       # Seluruh styling (publik dan admin)
│   ├── js/
│   │   ├── site.js         # Logika halaman publik
│   │   ├── admin-core.js   # State global, utilitas, File System API
│   │   ├── admin-auth.js   # Login, logout, pengecekan sesi
│   │   ├── admin-render.js # Fungsi render DOM (master list, jadwal, ringkasan)
│   │   ├── admin-actions.js# Event handler dan mutasi data
│   │   └── admin-main.js   # Entry point inisialisasi admin
│   ├── img/                # Gambar menu dan aset statis
│   └── vendor/             # Bootstrap 5 dan Bootstrap Icons (lokal)
└── forms/                  # Stub form PHP (tidak digunakan)
```

---

## Teknologi yang Digunakan

| Teknologi | Keterangan |
|---|---|
| HTML5 | Struktur halaman |
| CSS3 | Styling kustom di `assets/css/style.css` |
| JavaScript (ES6+) | Vanilla JS tanpa framework atau bundler |
| Bootstrap 5 | Layout, grid, dan komponen UI |
| Bootstrap Icons | Library ikon |
| Google Fonts | Nunito Sans dan DM Serif Display |
| File System Access API | Menulis `menu.json` dan menyimpan gambar dari browser |
| IndexedDB | Menyimpan file handle agar izin browser tidak perlu diminta ulang |
| localStorage | Auto-save draft admin dan preview publik |
| sessionStorage | Sesi login admin |
| GitHub Pages | Platform hosting statis |

---

## Format Data Menu

File `data/menu.json` memiliki struktur berikut:

```json
{
  "metadata": { "nama_usaha", "telepon", "jam_buka", "maps", "generated_at" },
  "master_menu": [ /* daftar lengkap semua item menu */ ],
  "menu_hari_ini": [ /* snapshot menu yang tampil hari ini */ ],
  "menu_besok": [ /* snapshot menu yang tampil besok */ ]
}
```

Setiap item menu memiliki field: `id`, `nama_menu`, `kategori`, `deskripsi`, `harga`, `gambar`, `aktif`, `status_ketersediaan`.

Kategori yang tersedia: `Menu Utama`, `Menu Sayur`, `Minuman`, `Snack`.
