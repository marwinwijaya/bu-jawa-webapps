# Rencana Implementasi: Menu Besok Default Fallback

## Gambaran Umum

Implementasi dilakukan secara bertahap di tiga file: `admin-core.js` (logika fallback inti), `admin-render.js` (indikator visual di panel admin), dan `site.js` (label fallback di halaman publik). Tidak ada perubahan struktur data atau `menu.json`.

## Tasks

- [ ] 1. Tambah `app.isFallbackActive()` dan modifikasi `app.buildExportPayload()` di `admin-core.js`
  - Tambahkan fungsi `app.isFallbackActive()` yang mengembalikan `true` jika dan hanya jika `app.state.menu_besok.length === 0` dan `app.state.menu_hari_ini.length > 0`
  - Modifikasi `app.buildExportPayload()`: jika `app.isFallbackActive()` bernilai `true`, gunakan `app.state.menu_hari_ini` sebagai sumber snapshot `menu_besok` (dengan `tipe_hari: "besok"`); jika tidak, gunakan `app.state.menu_besok` seperti semula
  - `app.state.menu_besok` tidak boleh diubah di dalam fungsi ini
  - _Requirements: 3.1, 3.2, 3.3, 4.1, 4.2_

  - [ ]* 1.1 Tulis property test untuk `isFallbackActive()` (Property 4)
    - **Property 4: `isFallbackActive` mencerminkan kondisi state secara tepat**
    - Generate kombinasi panjang array `menu_besok` dan `menu_hari_ini` secara acak; verifikasi `isFallbackActive()` mengembalikan `true` jika dan hanya jika `menu_besok.length === 0` dan `menu_hari_ini.length > 0`
    - Gunakan fast-check via CDN (`https://cdn.jsdelivr.net/npm/fast-check/...`), jalankan via `node --input-type=module`
    - Minimum 100 iterasi; tag: `Feature: menu-besok-default-fallback, Property 4`
    - **Validates: Requirements 2.1, 2.2, 2.3**

  - [ ]* 1.2 Tulis property test untuk `buildExportPayload()` — fallback aktif (Property 1)
    - **Property 1: Fallback payload konsisten dengan `menu_hari_ini`**
    - Generate array ID acak untuk `menu_hari_ini`, set `menu_besok = []`; verifikasi `buildExportPayload().menu_besok` ID-nya identik dengan snapshot `menu_hari_ini` dan semua item memiliki `tipe_hari === "besok"`
    - Minimum 100 iterasi; tag: `Feature: menu-besok-default-fallback, Property 1`
    - **Validates: Requirements 3.1**

  - [ ]* 1.3 Tulis property test untuk `buildExportPayload()` — state tidak termutasi (Property 2)
    - **Property 2: State tidak termutasi oleh fallback**
    - Generate state acak dengan `menu_besok = []`; panggil `buildExportPayload()`; verifikasi `app.state.menu_besok` masih `[]` setelah pemanggilan
    - Minimum 100 iterasi; tag: `Feature: menu-besok-default-fallback, Property 2`
    - **Validates: Requirements 3.3**

  - [ ]* 1.4 Tulis property test untuk `buildExportPayload()` — payload normal tidak terpengaruh (Property 3)
    - **Property 3: Payload normal tidak terpengaruh fallback**
    - Generate array ID acak untuk `menu_besok` (non-empty); verifikasi `buildExportPayload().menu_besok` ID-nya identik dengan `menu_besok` di state, tanpa pengaruh dari `menu_hari_ini`
    - Minimum 100 iterasi; tag: `Feature: menu-besok-default-fallback, Property 3`
    - **Validates: Requirements 3.2**

- [ ] 2. Checkpoint — Pastikan semua tests lulus
  - Pastikan semua tests lulus, tanyakan ke user jika ada pertanyaan.

- [ ] 3. Tambah indikator fallback di `app.renderSchedule()` pada `admin-render.js`
  - Modifikasi `app.renderSchedule("besok", ...)`: jika `app.isFallbackActive()` bernilai `true`, sisipkan banner info di atas daftar jadwal besok dengan teks: `"Menu Besok belum diisi — akan menggunakan Menu Hari Ini sebagai fallback."`
  - Jika `app.isFallbackActive()` bernilai `false`, pastikan banner tersebut tidak ditampilkan
  - Banner hanya muncul di panel `besok`, tidak di panel `hari_ini`
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 4. Modifikasi `parsePayload()` dan `renderMenuList()` di `site.js`
  - Modifikasi `parsePayload()`: deteksi kondisi fallback dari payload — jika `menu_besok` adalah array kosong dan `menu_hari_ini` berisi setidaknya satu item aktif, set `menuBesok = menuHariIni` dan `isFallback = true`; kembalikan `{ menuHariIni, menuBesok, isFallback }`
  - Jika `menu_besok` tidak kosong, `isFallback = false` dan `menuBesok` diisi dari `menu_besok` seperti semula
  - Modifikasi `renderMenuList(selector, menus, isTomorrow, isFallback)`: tambah parameter `isFallback`; jika `isTomorrow && isFallback`, tampilkan teks penanda di atas daftar kartu: `"Menu besok belum diperbarui — menampilkan menu hari ini sebagai referensi."`
  - Perbarui pemanggilan `renderMenuList` di `renderPublicPage()` untuk meneruskan `isFallback`
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ]* 4.1 Tulis property test untuk `parsePayload()` — fallback aktif (Property 5)
    - **Property 5: `parsePayload` fallback menghasilkan `menuBesok` identik dengan `menuHariIni`**
    - Generate payload acak dengan `menu_besok: []` dan `menu_hari_ini` non-empty; verifikasi `parsePayload(payload).menuBesok` kontennya identik dengan `parsePayload(payload).menuHariIni` dan `isFallback === true`
    - Minimum 100 iterasi; tag: `Feature: menu-besok-default-fallback, Property 5`
    - **Validates: Requirements 1.1**

  - [ ]* 4.2 Tulis property test untuk `parsePayload()` — payload normal tidak berubah (Property 6)
    - **Property 6: `parsePayload` normal tidak mengubah `menu_besok`**
    - Generate payload acak dengan `menu_besok` non-empty; verifikasi `parsePayload(payload).menuBesok` sama dengan item aktif dari `menu_besok` di payload dan `isFallback === false`
    - Minimum 100 iterasi; tag: `Feature: menu-besok-default-fallback, Property 6`
    - **Validates: Requirements 1.2**

- [ ] 5. Checkpoint akhir — Pastikan semua tests lulus
  - Pastikan semua tests lulus, tanyakan ke user jika ada pertanyaan.

## Catatan

- Tasks bertanda `*` bersifat opsional dan dapat dilewati untuk MVP yang lebih cepat
- Property tests menggunakan fast-check via CDN, dijalankan di browser atau via `node --input-type=module`
- Setiap task mereferensikan requirements spesifik untuk keterlacakan
- `app.state.menu_besok` tidak boleh diubah di mana pun selama implementasi fallback — fallback hanya diterapkan saat membangun payload ekspor dan saat merender
