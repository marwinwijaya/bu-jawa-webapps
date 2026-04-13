# Requirements Document

## Introduction

Fitur ini menambahkan perilaku fallback otomatis: jika admin tidak mengisi atau memperbarui Menu Besok, maka sistem secara otomatis menggunakan data Menu Hari Ini sebagai Menu Besok — baik di halaman publik (`index.html`) maupun di tampilan admin (`admin.html`). Admin tetap bisa mengisi Menu Besok secara manual kapan saja; fallback hanya aktif ketika Menu Besok kosong.

## Glossary

- **Site**: Halaman publik (`index.html`) yang dirender oleh `site.js`
- **Admin_Dashboard**: Halaman admin (`admin.html`) yang dikelola oleh `admin-core.js`, `admin-render.js`, dan `admin-actions.js`
- **Menu_Besok**: Daftar ID menu yang dijadwalkan untuk hari berikutnya, disimpan di `app.state.menu_besok`
- **Menu_Hari_Ini**: Daftar ID menu yang dijadwalkan untuk hari ini, disimpan di `app.state.menu_hari_ini`
- **Fallback**: Kondisi di mana Menu Besok kosong sehingga sistem menggunakan data Menu Hari Ini sebagai penggantinya
- **Snapshot**: Representasi lengkap item menu (bukan hanya ID) yang ditulis ke `data/menu.json` oleh `app.buildExportPayload()`
- **Export_Payload**: Objek JSON yang ditulis ke `data/menu.json`, berisi `menu_hari_ini` dan `menu_besok` sebagai array snapshot lengkap

---

## Requirements

### Requirement 1: Fallback otomatis Menu Besok di halaman publik

**User Story:** Sebagai pengunjung, saya ingin tetap melihat menu besok meskipun admin belum mengisinya, sehingga saya mendapat gambaran menu yang akan tersedia.

#### Acceptance Criteria

1. WHEN `menu_besok` di `data/menu.json` adalah array kosong (`[]`) DAN `menu_hari_ini` berisi setidaknya satu item, THE **Site** SHALL menampilkan item dari `menu_hari_ini` pada bagian "Menu Besok" di halaman publik.
2. WHEN `menu_besok` di `data/menu.json` berisi setidaknya satu item, THE **Site** SHALL menampilkan item dari `menu_besok` pada bagian "Menu Besok" tanpa modifikasi.
3. WHEN fallback aktif, THE **Site** SHALL menampilkan label atau teks penanda yang menginformasikan bahwa menu besok belum diperbarui dan yang ditampilkan adalah menu hari ini.
4. IF `menu_hari_ini` juga kosong DAN `menu_besok` juga kosong, THEN THE **Site** SHALL menampilkan pesan kosong default yang sudah ada ("Menu besok belum kami tampilkan dulu. Cek lagi nanti, ya.").

---

### Requirement 2: Indikator fallback di Admin Dashboard

**User Story:** Sebagai admin, saya ingin tahu ketika Menu Besok sedang menggunakan fallback dari Menu Hari Ini, sehingga saya sadar bahwa saya belum mengisi Menu Besok secara manual.

#### Acceptance Criteria

1. WHILE `app.state.menu_besok` adalah array kosong DAN `app.state.menu_hari_ini` berisi setidaknya satu ID, THE **Admin_Dashboard** SHALL menampilkan indikator visual (misalnya badge atau teks info) di panel Menu Besok yang menyatakan bahwa Menu Besok akan menggunakan fallback dari Menu Hari Ini.
2. WHEN admin menambahkan setidaknya satu item ke `app.state.menu_besok`, THE **Admin_Dashboard** SHALL menyembunyikan indikator fallback tersebut.
3. WHEN admin mengosongkan `app.state.menu_besok` (melalui tombol "Kosongkan" atau hapus manual), THE **Admin_Dashboard** SHALL menampilkan kembali indikator fallback jika `app.state.menu_hari_ini` tidak kosong.

---

### Requirement 3: Export payload merefleksikan logika fallback

**User Story:** Sebagai sistem, saya ingin `data/menu.json` yang diekspor selalu berisi data yang konsisten dengan apa yang ditampilkan di halaman publik, sehingga tidak ada perbedaan antara preview admin dan tampilan publik.

#### Acceptance Criteria

1. WHEN `app.state.menu_besok` kosong DAN `app.state.menu_hari_ini` tidak kosong, THE **Admin_Dashboard** SHALL mengisi field `menu_besok` di Export_Payload dengan snapshot yang sama dengan `menu_hari_ini` (menggunakan `tipe_hari: "besok"`).
2. WHEN `app.state.menu_besok` berisi setidaknya satu ID, THE **Admin_Dashboard** SHALL mengisi field `menu_besok` di Export_Payload hanya dari ID-ID tersebut, tanpa pengaruh dari `menu_hari_ini`.
3. THE **Admin_Dashboard** SHALL tidak mengubah nilai `app.state.menu_besok` di memori saat menerapkan fallback — fallback hanya diterapkan pada saat membangun Export_Payload.

---

### Requirement 4: Konsistensi preview localStorage

**User Story:** Sebagai admin, saya ingin preview publik yang tersimpan di localStorage juga mencerminkan logika fallback, sehingga saat saya membuka `index.html` di localhost, tampilannya konsisten dengan yang akan dipublikasikan.

#### Acceptance Criteria

1. WHEN `app.persist()` dipanggil DAN `app.state.menu_besok` kosong DAN `app.state.menu_hari_ini` tidak kosong, THE **Admin_Dashboard** SHALL menyimpan payload fallback (menu_besok berisi snapshot dari menu_hari_ini) ke localStorage dengan key `rm_bu_jawa_public_preview_v1`.
2. WHEN `app.persist()` dipanggil DAN `app.state.menu_besok` tidak kosong, THE **Admin_Dashboard** SHALL menyimpan payload normal (menu_besok dari state asli) ke localStorage.
