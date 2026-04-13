# Design - Web Rumah Makan Bu Jawa

## 1. Tujuan Sistem
Web Rumah Makan Bu Jawa dirancang sebagai website katalog menu yang sederhana, cepat, dan fokus pada konversi pesanan. Pengguna dapat melihat menu, mencari atau memfilter menu, menambahkan item ke cart, lalu melanjutkan pemesanan melalui WhatsApp.

## 2. Scope
Cakupan sistem meliputi:
- Menampilkan daftar menu dari file `menu.json`
- Menampilkan detail menu
- Filter menu berdasarkan kategori
- Pencarian menu berdasarkan kata kunci
- Menambahkan item ke cart
- Mengubah jumlah item di cart
- Menghitung total harga otomatis
- Membuat pesan pesanan ke WhatsApp
- Redirect ke WhatsApp menggunakan link dengan pesan yang sudah terisi

Di luar cakupan:
- Pembayaran online
- Login user
- Dashboard admin
- Penyimpanan order ke database
- Integrasi delivery API

## 3. Arsitektur Sistem

### 3.1 Frontend
Aplikasi menggunakan frontend sederhana berbasis:
- HTML
- CSS
- JavaScript

Semua rendering menu, filter, cart, dan checkout dilakukan di sisi client.

### 3.2 Data Source
Sumber data utama berasal dari file lokal `menu.json`.

File ini berisi seluruh data menu yang akan dirender ke halaman web.

### 3.3 External Integration
Checkout dilakukan melalui:
- WhatsApp deep link (`wa.me` atau `https://wa.me/`)

Sistem akan membentuk pesan order lalu mengarahkan user ke WhatsApp.

## 4. Komponen Utama

### 4.1 Header / Hero Section
Fungsi:
- Menampilkan branding Rumah Makan Bu Jawa
- Menampilkan headline promosi
- Menampilkan CTA utama seperti “Lihat Menu” atau “Pesan Sekarang”

Konten utama:
- Nama brand
- Tagline singkat
- Tombol CTA

### 4.2 Search Bar
Fungsi:
- Memungkinkan user mencari menu berdasarkan nama atau keyword

Perilaku:
- Input pencarian memfilter daftar menu secara langsung
- Pencarian bersifat case-insensitive

### 4.3 Category Filter
Fungsi:
- Menyaring menu berdasarkan kategori

Contoh kategori:
- Makanan
- Lauk
- Minuman
- Paket

Perilaku:
- User dapat memilih satu kategori aktif
- User dapat kembali ke tampilan semua menu

### 4.4 Menu Grid
Fungsi:
- Menampilkan daftar menu dalam bentuk card

Informasi pada card:
- Gambar menu
- Nama menu
- Harga
- Deskripsi singkat
- Status ketersediaan
- Tombol tambah ke cart

### 4.5 Menu Detail / Quick View
Fungsi:
- Menampilkan detail menu lebih lengkap saat item dipilih

Informasi detail:
- Nama menu
- Harga
- Gambar
- Deskripsi lengkap
- Kategori
- Status tersedia / tidak tersedia

### 4.6 Cart / Order Summary
Fungsi:
- Menyimpan item yang dipilih user
- Menampilkan ringkasan pesanan
- Menampilkan subtotal per item dan total akhir

Informasi cart:
- Nama item
- Harga satuan
- Jumlah
- Subtotal
- Total harga

Aksi di cart:
- Tambah quantity
- Kurangi quantity
- Hapus item jika quantity = 0

### 4.7 WhatsApp Checkout
Fungsi:
- Mengubah isi cart menjadi teks order
- Mengarahkan user ke WhatsApp

Format pesan harus rapi, mudah dibaca, dan siap kirim.

## 5. Model Data

### 5.1 Menu Data (`menu.json`)
Struktur minimal setiap item:

- `id`: identifier unik
- `name`: nama menu
- `category`: kategori menu
- `price`: harga menu
- `description`: deskripsi menu
- `image`: path atau URL gambar
- `available`: status ketersediaan

Contoh:
```json
{
  "id": 1,
  "name": "Nasi Ayam",
  "category": "Makanan",
  "price": 18000,
  "description": "Nasi ayam rumahan dengan sambal dan lalapan",
  "image": "images/nasi-ayam.jpg",
  "available": true
}
```

### 5.2 Cart State
Cart disimpan sementara di memory browser.

Struktur cart:
- `items`: array item terpilih
- `totalQty`: total jumlah item
- `totalPrice`: total harga seluruh item

Struktur item di cart:
- `id`
- `name`
- `price`
- `qty`

Contoh:
```json
{
  "items": [
    {
      "id": 1,
      "name": "Nasi Ayam",
      "price": 18000,
      "qty": 2
    }
  ],
  "totalQty": 2,
  "totalPrice": 36000
}
```

## 6. Alur Sistem

### 6.1 Load Menu
1. User membuka website
2. Sistem mengambil data dari `menu.json`
3. Sistem merender menu ke halaman utama
4. Jika gagal load, tampilkan pesan error/fallback

### 6.2 Search dan Filter
1. User mengetik pada kolom search
2. Sistem menyaring data menu berdasarkan keyword
3. User memilih kategori
4. Sistem menampilkan hasil filter sesuai kategori dan keyword aktif

### 6.3 Add to Cart
1. User menekan tombol tambah pesanan
2. Sistem memeriksa apakah item sudah ada di cart
3. Jika belum ada, sistem menambahkan item baru
4. Jika sudah ada, sistem menambahkan quantity
5. Sistem menghitung ulang total harga

### 6.4 Update Cart
1. User menambah atau mengurangi quantity item
2. Sistem memperbarui nilai subtotal item
3. Sistem memperbarui total cart
4. Jika quantity menjadi 0, item dihapus dari cart

### 6.5 Checkout WhatsApp
1. User menekan tombol checkout / pesan
2. Sistem memvalidasi bahwa cart tidak kosong
3. Sistem membentuk pesan order
4. Sistem melakukan URL encoding pada pesan
5. Sistem redirect ke link WhatsApp

## 7. Format Pesan WhatsApp

Format standar:
- Sapaan
- Daftar item dan quantity
- Total harga
- Penutup singkat

Contoh:
Halo Bu Jawa, saya mau pesan:

- Nasi Ayam x2
- Es Teh x1

Total: Rp 41.000

Mohon diproses ya, terima kasih.

## 8. Aturan Logika Utama

### 8.1 Duplicate Prevention
Jika item yang sama ditambahkan kembali:
- Jangan buat item cart baru
- Tambahkan quantity item existing

### 8.2 Availability Rule
Jika `available = false`:
- Tombol tambah ke cart dinonaktifkan
- Item diberi label tidak tersedia

### 8.3 Empty Cart Rule
Jika cart kosong:
- Tombol checkout tetap ada, tetapi tidak boleh memproses redirect
- Sistem menampilkan pesan bahwa pesanan masih kosong

### 8.4 Price Calculation Rule
Total harga dihitung dengan rumus:
- subtotal item = price × qty
- total akhir = jumlah seluruh subtotal item

## 9. Error Handling

### 9.1 menu.json Gagal Dimuat
Tampilkan pesan:
- “Menu sedang tidak dapat dimuat, silakan coba lagi nanti.”

### 9.2 Gambar Tidak Tersedia
Gunakan placeholder image default.

### 9.3 Checkout Gagal
Jika link WhatsApp gagal diproses:
- Tampilkan pesan fallback
- Tetap tampilkan ringkasan pesanan agar user bisa copy manual

## 10. UI/UX Principles

- Fokus visual utama pada produk makanan
- Layout rapi, compact, dan mudah dibaca
- CTA pemesanan harus terlihat jelas
- Mobile-first layout
- Teks tidak terlalu panjang
- Harga mudah dikenali
- Cart mudah diakses
- Desain harus terasa hangat, ramah, dan menarik untuk user umum

## 11. Future Enhancement
Pengembangan lanjutan yang bisa ditambahkan:
- Rekomendasi best seller
- Badge promo
- Simpan cart di localStorage
- Multi-image detail produk
- Estimasi ongkir / area delivery
- Jam operasional restoran
- Testimoni pelanggan
- Integrasi admin panel untuk update menu
