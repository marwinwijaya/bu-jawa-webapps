# Requirements Document

## Introduction

Fitur ini meningkatkan tampilan section menu di halaman publik `index.html` agar lebih mudah dibaca, lebih informatif, dan lebih menarik bagi customer Rumah Makan Bu Jawa. Saat ini menu ditampilkan sebagai marquee/scrolling cards horizontal otomatis — tampilan ini akan diganti dengan layout grid statis yang lebih ramah pengguna, mendukung filter kategori, dan menampilkan informasi menu secara lengkap dan jelas.

Perubahan hanya menyentuh `site.js` (logika render) dan `style.css` (gaya tampilan) serta HTML section menu di `index.html`. Tidak ada perubahan pada struktur data `menu.json`, logika admin, atau halaman lain.

---

## Glossary

- **Site**: Halaman publik `index.html` beserta `site.js` dan `style.css`
- **Menu_Card**: Elemen kartu visual yang menampilkan satu item menu (foto, nama, kategori, harga, deskripsi, status)
- **Menu_Grid**: Layout grid responsif yang menampilkan kumpulan Menu_Card
- **Filter_Bar**: Komponen tombol filter kategori di atas Menu_Grid
- **Section_Hari_Ini**: Section `#menu-hari-ini` yang menampilkan menu aktif hari ini
- **Section_Besok**: Section `#menu-besok` yang menampilkan preview menu besok
- **Status_Badge**: Indikator visual pada Menu_Card yang menunjukkan ketersediaan menu (`tersedia` / `habis`)
- **Fallback_Notice**: Pesan informasi yang ditampilkan ketika menu besok belum diisi dan menggunakan data menu hari ini sebagai referensi
- **Empty_State**: Tampilan yang ditampilkan ketika tidak ada menu aktif pada suatu section
- **Kategori**: Nilai field `kategori` dari `menu.json` — saat ini: `Menu Utama`, `Menu Sayur`, `Minuman`, `Snack`

---

## Requirements

### Requirement 1: Tampilan Grid Statis Menggantikan Marquee

**User Story:** Sebagai customer, saya ingin melihat semua menu dalam layout grid yang bisa saya baca dengan tenang, sehingga saya bisa membandingkan pilihan tanpa harus menunggu animasi scroll.

#### Acceptance Criteria

1. THE Site SHALL menampilkan menu pada Section_Hari_Ini dan Section_Besok menggunakan Menu_Grid, bukan marquee/scrolling horizontal otomatis.
2. THE Menu_Grid SHALL menggunakan layout grid responsif: 1 kolom pada layar < 576px, 2 kolom pada layar 576px–991px, dan 3 kolom pada layar ≥ 992px.
3. THE Menu_Card SHALL menampilkan foto menu, nama menu, kategori, harga, deskripsi singkat, dan Status_Badge dalam satu kartu.
4. WHEN foto menu tidak tersedia atau gagal dimuat, THE Menu_Card SHALL menampilkan gambar fallback `assets/img/about.jpg`.
5. THE Menu_Grid SHALL menampilkan seluruh menu aktif sekaligus tanpa paginasi.

---

### Requirement 2: Informasi Menu yang Lengkap dan Jelas di Setiap Kartu

**User Story:** Sebagai customer, saya ingin melihat foto, nama, harga, kategori, deskripsi, dan status ketersediaan menu dalam satu kartu, sehingga saya bisa memutuskan pilihan tanpa harus mencari informasi tambahan.

#### Acceptance Criteria

1. THE Menu_Card SHALL menampilkan foto menu dengan rasio aspek 4:3 dan `object-fit: cover` agar foto tidak terdistorsi.
2. THE Menu_Card SHALL menampilkan nama menu menggunakan tipografi yang menonjol (font heading).
3. THE Menu_Card SHALL menampilkan harga dalam format Rupiah (contoh: `Rp 15.000`).
4. THE Menu_Card SHALL menampilkan label kategori sebagai badge/chip berwarna sesuai kategori.
5. THE Menu_Card SHALL menampilkan deskripsi menu, dibatasi maksimal 3 baris teks dengan `line-clamp`.
6. THE Menu_Card SHALL menampilkan Status_Badge dengan warna hijau dan teks "Tersedia" untuk menu yang `status_ketersediaan === "tersedia"`, dan warna merah dengan teks "Habis" untuk menu yang `status_ketersediaan === "habis"`.
7. WHEN menu memiliki `status_ketersediaan === "habis"`, THE Menu_Card SHALL menampilkan overlay visual semi-transparan pada foto untuk memberi sinyal visual bahwa menu tidak tersedia.

---

### Requirement 3: Filter Kategori pada Section Menu Hari Ini

**User Story:** Sebagai customer, saya ingin memfilter menu berdasarkan kategori (misalnya hanya melihat Minuman), sehingga saya bisa menemukan jenis menu yang saya cari dengan cepat.

#### Acceptance Criteria

1. THE Filter_Bar SHALL ditampilkan di atas Menu_Grid pada Section_Hari_Ini.
2. THE Filter_Bar SHALL menampilkan tombol "Semua" dan satu tombol untuk setiap kategori yang memiliki minimal satu menu aktif hari ini.
3. WHEN tombol filter diklik, THE Site SHALL menampilkan hanya Menu_Card yang memiliki kategori sesuai filter yang dipilih.
4. WHEN tombol "Semua" diklik, THE Site SHALL menampilkan seluruh Menu_Card pada Section_Hari_Ini.
5. THE Filter_Bar SHALL menandai tombol filter yang sedang aktif secara visual (misalnya warna berbeda atau garis bawah).
6. WHEN tidak ada menu aktif untuk kategori yang dipilih, THE Site SHALL menampilkan Empty_State dengan pesan "Tidak ada menu untuk kategori ini."
7. THE Filter_Bar SHALL tidak ditampilkan pada Section_Besok (section besok hanya menampilkan semua menu tanpa filter).

---

### Requirement 4: Empty State yang Informatif

**User Story:** Sebagai customer, saya ingin melihat pesan yang jelas ketika menu belum tersedia, sehingga saya tahu kondisi saat ini dan tidak bingung dengan halaman kosong.

#### Acceptance Criteria

1. WHEN Section_Hari_Ini tidak memiliki menu aktif, THE Site SHALL menampilkan Empty_State dengan pesan "Menu hari ini belum tersedia. Silakan cek kembali nanti."
2. WHEN Section_Besok tidak memiliki menu aktif dan tidak ada fallback, THE Site SHALL menampilkan Empty_State dengan pesan "Menu besok belum ditampilkan. Cek lagi nanti, ya."
3. WHEN data `menu.json` gagal dimuat, THE Site SHALL menampilkan pesan error "Data menu belum bisa dimuat. Pastikan file data/menu.json tersedia." pada kedua section.
4. THE Empty_State SHALL ditampilkan dengan tampilan yang konsisten: ikon, teks pesan, dan latar belakang yang sesuai dengan desain halaman.

---

### Requirement 5: Fallback Menu Besok

**User Story:** Sebagai customer, saya ingin tetap melihat referensi menu di section besok meskipun menu besok belum diisi admin, sehingga saya punya gambaran pilihan untuk esok hari.

#### Acceptance Criteria

1. WHEN `menu_besok` kosong atau tidak memiliki item aktif DAN `menu_hari_ini` memiliki minimal satu item aktif, THE Site SHALL menampilkan menu hari ini sebagai referensi di Section_Besok.
2. WHEN fallback aktif, THE Site SHALL menampilkan Fallback_Notice dengan teks "Menu besok belum diperbarui — menampilkan menu hari ini sebagai referensi." di atas Menu_Grid pada Section_Besok.
3. WHEN `menu_besok` memiliki minimal satu item aktif, THE Site SHALL menampilkan data `menu_besok` tanpa Fallback_Notice.

---

### Requirement 6: Aksesibilitas dan Performa Dasar

**User Story:** Sebagai customer dengan berbagai perangkat dan kondisi jaringan, saya ingin halaman menu tetap dapat diakses dan dimuat dengan wajar, sehingga pengalaman saya tidak terganggu.

#### Acceptance Criteria

1. THE Menu_Card SHALL menyertakan atribut `alt` yang berisi nama menu pada setiap elemen `<img>`.
2. THE Filter_Bar SHALL menggunakan elemen `<button>` dengan atribut `aria-pressed` yang diperbarui sesuai status aktif filter.
3. THE Menu_Grid SHALL menggunakan elemen `<article>` untuk setiap Menu_Card agar struktur semantik HTML terjaga.
4. THE Site SHALL menggunakan atribut `loading="lazy"` pada setiap `<img>` di dalam Menu_Card untuk menunda pemuatan gambar yang belum terlihat di viewport.
5. IF gambar menu gagal dimuat, THEN THE Menu_Card SHALL mengganti sumber gambar ke `assets/img/about.jpg` menggunakan event handler `onerror` tanpa memuat ulang halaman.
