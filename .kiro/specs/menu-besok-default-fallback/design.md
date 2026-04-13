# Design Document: Menu Besok Default Fallback

## Overview

Fitur ini menambahkan logika fallback otomatis: ketika `app.state.menu_besok` kosong, sistem menggunakan data `menu_hari_ini` sebagai pengganti Menu Besok — baik di halaman publik (`site.js`) maupun di Admin Dashboard (`admin-render.js`, `admin-core.js`).

Prinsip utama:
- **State tidak diubah** — `app.state.menu_besok` tetap `[]` di memori; fallback hanya diterapkan saat membangun payload ekspor dan saat merender.
- **Satu sumber kebenaran** — logika fallback terpusat di `app.buildExportPayload()` dan di fungsi render jadwal admin.
- **Transparansi** — baik pengunjung maupun admin mendapat sinyal visual bahwa fallback sedang aktif.

---

## Architecture

### Alur Data (setelah fitur ini)

```
app.state.menu_besok (array ID)
        │
        ▼
  apakah kosong?
   ┌────┴────┐
  Ya        Tidak
   │          │
   ▼          ▼
gunakan    gunakan
menu_hari_ini  menu_besok
(sebagai fallback)  (normal)
        │
        ▼
app.buildExportPayload()
  → menu_besok snapshot (tipe_hari: "besok")
        │
        ├─→ localStorage (PUBLIC_PREVIEW_KEY)  ← via app.persist()
        └─→ data/menu.json                     ← via app.saveMainJson()
                │
                ▼
           site.js
     parsePayload() → renderMenuList("#menu-besok-list", ...)
```

### Komponen yang Dimodifikasi

| File | Perubahan |
|---|---|
| `admin-core.js` | Tambah `app.isFallbackActive()`, modifikasi `app.buildExportPayload()` |
| `admin-render.js` | Modifikasi `app.renderSchedule()` untuk menampilkan indikator fallback |
| `site.js` | Modifikasi `parsePayload()` dan `renderMenuList()` untuk menampilkan label fallback |

---

## Components and Interfaces

### 1. `app.isFallbackActive()` — `admin-core.js`

Fungsi helper murni yang menentukan apakah kondisi fallback aktif.

```js
app.isFallbackActive = function isFallbackActive() {
  return app.state.menu_besok.length === 0 && app.state.menu_hari_ini.length > 0;
};
```

**Input:** tidak ada (membaca `app.state` langsung)  
**Output:** `boolean`

---

### 2. `app.buildExportPayload()` — `admin-core.js`

Fungsi yang sudah ada, dimodifikasi untuk menerapkan fallback saat membangun payload.

**Logika baru:**
```
if menu_besok kosong AND menu_hari_ini tidak kosong:
    menu_besok_snapshot = buildSnapshot(menu_hari_ini, "besok")
else:
    menu_besok_snapshot = buildSnapshot(menu_besok, "besok")
```

State `app.state.menu_besok` **tidak diubah**.

---

### 3. `app.renderSchedule("besok", ...)` — `admin-render.js`

Fungsi yang sudah ada, dimodifikasi untuk menampilkan indikator fallback di panel Menu Besok.

**Logika baru:**
- Jika `app.isFallbackActive()` bernilai `true`, tampilkan banner/badge info di atas daftar jadwal besok.
- Jika `app.state.menu_besok` tidak kosong, sembunyikan indikator tersebut.
- Konten indikator: `"Menu Besok belum diisi — akan menggunakan Menu Hari Ini sebagai fallback."`

---

### 4. `parsePayload(payload)` — `site.js`

Fungsi yang sudah ada, dimodifikasi untuk mendeteksi kondisi fallback dari payload JSON.

**Logika baru:**
```
if menu_besok kosong AND menu_hari_ini tidak kosong:
    menuBesok = menuHariIni  (data yang sama)
    isFallback = true
else:
    menuBesok = menu_besok dari payload
    isFallback = false
```

Mengembalikan objek `{ menuHariIni, menuBesok, isFallback }`.

---

### 5. `renderMenuList(selector, menus, isTomorrow, isFallback)` — `site.js`

Fungsi yang sudah ada, ditambah parameter `isFallback`.

**Logika baru:**
- Jika `isTomorrow && isFallback`, tambahkan teks penanda di atas daftar kartu:  
  `"Menu besok belum diperbarui — menampilkan menu hari ini sebagai referensi."`

---

## Data Models

### Export Payload (tidak berubah strukturnya)

```json
{
  "metadata": { ... },
  "master_menu": [ /* full menu objects */ ],
  "menu_hari_ini": [
    { "id": 1, "nama_menu": "...", "tipe_hari": "hari_ini", ... }
  ],
  "menu_besok": [
    { "id": 1, "nama_menu": "...", "tipe_hari": "besok", ... }
  ]
}
```

Ketika fallback aktif, `menu_besok` di payload akan berisi snapshot yang sama dengan `menu_hari_ini`, namun dengan `tipe_hari: "besok"`. Struktur JSON tidak berubah — konsumen payload (termasuk `site.js`) tidak perlu tahu apakah data berasal dari fallback atau tidak.

### Tidak Ada Field Baru di State

`app.state` tidak mendapat field baru. Fallback adalah perilaku turunan dari kondisi `menu_besok.length === 0`.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Fallback payload konsisten dengan menu_hari_ini

*For any* state di mana `menu_besok` kosong dan `menu_hari_ini` berisi setidaknya satu ID valid, hasil `buildExportPayload().menu_besok` harus berisi snapshot yang ID-nya identik dengan snapshot `menu_hari_ini`, dan setiap item harus memiliki `tipe_hari: "besok"`.

**Validates: Requirements 3.1**

---

### Property 2: State tidak termutasi oleh fallback

*For any* pemanggilan `buildExportPayload()` ketika `menu_besok` kosong, nilai `app.state.menu_besok` setelah pemanggilan harus tetap `[]` (tidak berubah).

**Validates: Requirements 3.3**

---

### Property 3: Payload normal tidak terpengaruh fallback

*For any* state di mana `menu_besok` berisi setidaknya satu ID valid, hasil `buildExportPayload().menu_besok` harus berisi snapshot yang ID-nya identik dengan `menu_besok` di state, tanpa pengaruh dari `menu_hari_ini`.

**Validates: Requirements 3.2**

---

### Property 4: isFallbackActive mencerminkan kondisi state secara tepat

*For any* kombinasi panjang array `menu_besok` dan `menu_hari_ini`, `isFallbackActive()` harus mengembalikan `true` jika dan hanya jika `menu_besok.length === 0` dan `menu_hari_ini.length > 0` — mencakup kondisi fallback aktif, fallback tidak aktif karena menu_besok terisi, dan fallback tidak aktif karena keduanya kosong.

**Validates: Requirements 2.1, 2.2, 2.3**

---

### Property 5: parsePayload fallback menghasilkan menuBesok identik dengan menuHariIni

*For any* payload di mana `menu_besok` adalah array kosong dan `menu_hari_ini` berisi setidaknya satu item aktif, `parsePayload(payload).menuBesok` harus menghasilkan array yang kontennya identik dengan `parsePayload(payload).menuHariIni`.

**Validates: Requirements 1.1**

---

### Property 6: parsePayload normal tidak mengubah menu_besok

*For any* payload di mana `menu_besok` berisi setidaknya satu item aktif, `parsePayload(payload).menuBesok` harus sama dengan item aktif dari `menu_besok` di payload, tanpa pengaruh dari `menu_hari_ini`.

**Validates: Requirements 1.2**

---

## Error Handling

| Kondisi | Penanganan |
|---|---|
| `menu_hari_ini` juga kosong saat fallback dievaluasi | Tidak ada fallback; `menu_besok` di payload tetap `[]`; halaman publik menampilkan pesan kosong default |
| `buildSnapshot` mengembalikan item kosong (ID tidak ditemukan di master) | Item difilter oleh `.filter(Boolean)` yang sudah ada — tidak ada perubahan |
| `parsePayload` menerima payload lama (format array flat) | Logika fallback tidak diterapkan pada format lama; path legacy tetap berjalan seperti sebelumnya |
| `isFallbackActive()` dipanggil sebelum state diinisialisasi | `app.state.menu_besok` dan `menu_hari_ini` selalu diinisialisasi sebagai `[]` di `createEmptyState()`, sehingga hasilnya `false` — aman |

---

## Testing Strategy

Fitur ini melibatkan logika transformasi data murni (`buildExportPayload`, `isFallbackActive`, `parsePayload`) yang cocok untuk property-based testing. Tidak ada infrastruktur eksternal yang terlibat.

### Unit Tests (example-based)

- `isFallbackActive()` mengembalikan `true` ketika `menu_besok = []` dan `menu_hari_ini = [1, 2]`
- `isFallbackActive()` mengembalikan `false` ketika `menu_besok = [1]`
- `isFallbackActive()` mengembalikan `false` ketika keduanya kosong
- `buildExportPayload()` menghasilkan `menu_besok` berisi snapshot dari `menu_hari_ini` saat fallback aktif
- `buildExportPayload()` tidak mengubah `app.state.menu_besok` setelah dipanggil
- `parsePayload()` mengembalikan `isFallback: true` dan `menuBesok` sama dengan `menuHariIni` saat `menu_besok` kosong

### Property-Based Tests

Karena proyek ini adalah Vanilla JS tanpa build system, property-based testing diimplementasikan menggunakan **fast-check** yang dimuat via CDN (`<script src="https://cdn.jsdelivr.net/npm/fast-check/...">`), dijalankan di browser atau via `node --input-type=module`.

Setiap property test dikonfigurasi minimum **100 iterasi**.

**Tag format:** `Feature: menu-besok-default-fallback, Property {N}: {deskripsi}`

| Property | Implementasi |
|---|---|
| Property 1 | Generate array ID acak untuk `menu_hari_ini`, set `menu_besok = []`, verifikasi `buildExportPayload().menu_besok` ID-nya identik dan semua `tipe_hari === "besok"` |
| Property 2 | Generate state acak dengan `menu_besok = []`, panggil `buildExportPayload()`, verifikasi `app.state.menu_besok` masih `[]` |
| Property 3 | Generate array ID acak untuk `menu_besok` (non-empty), verifikasi output tidak terpengaruh `menu_hari_ini` |
| Property 4 | Generate kombinasi panjang array acak, verifikasi `isFallbackActive()` sesuai kondisi boolean |
| Property 5 | Generate payload acak dengan `menu_besok: []` dan `menu_hari_ini` non-empty, verifikasi `parsePayload` menghasilkan `menuBesok === menuHariIni` |
| Property 6 | Generate payload acak dengan `menu_besok` non-empty, verifikasi `parsePayload` tidak mengubah `menuBesok` |

### Integration / Smoke Tests (manual)

- Buka `admin.html`, kosongkan Menu Besok → verifikasi indikator fallback muncul di panel
- Tambah item ke Menu Besok → verifikasi indikator hilang
- Klik Simpan → buka `index.html` → verifikasi label fallback muncul di seksi "Menu Besok"
- Isi Menu Besok → Simpan → buka `index.html` → verifikasi label fallback tidak muncul
