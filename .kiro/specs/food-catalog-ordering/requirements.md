# Dokumen Persyaratan

## Pendahuluan

Fitur ini menambahkan halaman katalog menu dan pemesanan berbasis web untuk Rumah Makan Bu Jawa. Halaman ini memungkinkan pengunjung menelusuri seluruh daftar menu dari `data/menu.json`, memfilter dan mencari item, menambahkan item ke keranjang belanja, serta mengirim pesanan melalui WhatsApp dengan pesan yang sudah diformat otomatis.

Halaman ini bersifat sepenuhnya statis (HTML, CSS, JavaScript murni), tidak memerlukan backend, dan dapat diakses langsung dari `index.html` atau halaman terpisah. Semua teks antarmuka menggunakan Bahasa Indonesia.

---

## Glosarium

- **Katalog**: Halaman yang menampilkan seluruh item menu yang tersedia dari `data/menu.json`.
- **Catalog_Page**: Halaman web yang menampilkan katalog menu dan fitur pemesanan.
- **Menu_Loader**: Komponen JavaScript yang memuat dan mem-parsing `data/menu.json`.
- **Menu_Grid**: Komponen tampilan yang merender item menu dalam tata letak grid.
- **Category_Filter**: Komponen UI yang memfilter item menu berdasarkan kategori.
- **Search_Bar**: Komponen UI yang memfilter item menu berdasarkan kata kunci.
- **Menu_Item**: Satu entri menu dengan properti: `id`, `nama_menu`, `kategori`, `deskripsi`, `harga`, `gambar`, `aktif`, `status_ketersediaan`.
- **Cart**: Struktur data dalam memori yang menyimpan item yang dipilih pengguna beserta jumlahnya.
- **Cart_Panel**: Komponen UI yang menampilkan isi keranjang, jumlah item, dan total harga.
- **Cart_Item**: Satu entri dalam Cart yang terdiri dari referensi Menu_Item dan kuantitas.
- **Order_Message**: Teks pesan yang diformat berisi ringkasan pesanan untuk dikirim via WhatsApp.
- **WhatsApp_Redirect**: Tindakan membuka `wa.me` dengan Order_Message yang sudah di-encode sebagai parameter URL.
- **Rupiah_Formatter**: Fungsi yang mengubah angka harga (misalnya `15000`) menjadi format `Rp 15.000`.
- **Kategori Tetap**: Empat kategori menu yang sudah ditentukan: `Menu Utama`, `Menu Sayur`, `Minuman`, `Snack`.

---

## Persyaratan

### Persyaratan 1: Memuat Data Menu

**User Story:** Sebagai pengunjung, saya ingin halaman katalog memuat data menu secara otomatis, sehingga saya dapat melihat pilihan menu yang tersedia tanpa tindakan tambahan.

#### Kriteria Penerimaan

1. WHEN halaman Catalog_Page dimuat, THE Menu_Loader SHALL mengambil `data/menu.json` menggunakan `fetch` dengan opsi `cache: "no-store"`.
2. WHEN `data/menu.json` berhasil dimuat, THE Menu_Loader SHALL mem-parsing array `master_menu` dan hanya meneruskan item dengan `aktif: true` ke Menu_Grid.
3. IF `data/menu.json` gagal dimuat karena error jaringan atau file tidak ditemukan, THEN THE Catalog_Page SHALL menampilkan pesan error dalam Bahasa Indonesia di area Menu_Grid, menggantikan konten grid.
4. IF `master_menu` kosong atau tidak ada item dengan `aktif: true`, THEN THE Catalog_Page SHALL menampilkan pesan kosong dalam Bahasa Indonesia di area Menu_Grid.
5. THE Menu_Loader SHALL menyelesaikan proses fetch dan render dalam satu siklus `DOMContentLoaded`.

---

### Persyaratan 2: Menampilkan Menu dalam Grid

**User Story:** Sebagai pengunjung, saya ingin melihat item menu dalam tata letak grid yang bersih dan terfokus pada produk, sehingga saya dapat dengan mudah menelusuri pilihan yang tersedia.

#### Kriteria Penerimaan

1. THE Menu_Grid SHALL merender setiap Menu_Item aktif sebagai kartu yang menampilkan: gambar menu, nama menu, kategori, deskripsi (dipotong maksimal 2 baris), harga dalam format Rupiah, dan badge status ketersediaan.
2. THE Rupiah_Formatter SHALL mengubah nilai harga integer (misalnya `15000`) menjadi string `Rp 15.000` menggunakan `toLocaleString("id-ID")`.
3. WHEN gambar Menu_Item gagal dimuat, THE Menu_Grid SHALL menampilkan gambar fallback `assets/img/about.jpg` pada kartu tersebut.
4. THE Menu_Grid SHALL menggunakan tata letak grid responsif: 1 kolom pada layar < 576px, 2 kolom pada layar 576px–991px, dan 3 kolom pada layar ≥ 992px.
5. WHEN `status_ketersediaan` sebuah Menu_Item adalah `"habis"`, THE Menu_Grid SHALL menampilkan badge "Habis" dan menonaktifkan tombol "Tambah ke Keranjang" pada kartu tersebut.
6. WHEN `status_ketersediaan` sebuah Menu_Item adalah `"tersedia"`, THE Menu_Grid SHALL menampilkan badge "Tersedia" dan mengaktifkan tombol "Tambah ke Keranjang" pada kartu tersebut.

---

### Persyaratan 3: Filter Berdasarkan Kategori

**User Story:** Sebagai pengunjung, saya ingin memfilter menu berdasarkan kategori, sehingga saya dapat dengan cepat menemukan jenis makanan atau minuman yang saya inginkan.

#### Kriteria Penerimaan

1. THE Category_Filter SHALL menampilkan tombol filter untuk setiap Kategori Tetap: "Semua", "Menu Utama", "Menu Sayur", "Minuman", dan "Snack".
2. WHEN halaman pertama kali dimuat, THE Category_Filter SHALL mengatur filter aktif ke "Semua" dan Menu_Grid SHALL menampilkan semua item aktif.
3. WHEN pengguna memilih sebuah kategori, THE Category_Filter SHALL menandai tombol tersebut sebagai aktif dan THE Menu_Grid SHALL hanya menampilkan item yang `kategori`-nya cocok dengan kategori yang dipilih.
4. WHEN pengguna memilih "Semua", THE Menu_Grid SHALL menampilkan semua item aktif tanpa memandang kategori.
5. WHEN filter kategori aktif dan tidak ada item yang cocok, THE Menu_Grid SHALL menampilkan pesan kosong dalam Bahasa Indonesia.
6. WHILE filter kategori aktif, THE Category_Filter SHALL mempertahankan filter yang dipilih ketika pengguna mengetik di Search_Bar, sehingga kedua filter diterapkan secara bersamaan.

---

### Persyaratan 4: Pencarian Berdasarkan Kata Kunci

**User Story:** Sebagai pengunjung, saya ingin mencari menu berdasarkan kata kunci, sehingga saya dapat langsung menemukan item tertentu tanpa harus menelusuri semua pilihan.

#### Kriteria Penerimaan

1. THE Search_Bar SHALL merender sebuah input teks dengan placeholder dalam Bahasa Indonesia.
2. WHEN pengguna mengetik di Search_Bar, THE Menu_Grid SHALL memfilter item secara real-time (pada setiap event `input`) dan hanya menampilkan item yang `nama_menu` atau `deskripsi`-nya mengandung kata kunci (case-insensitive).
3. WHILE filter kategori aktif, THE Search_Bar SHALL menerapkan pencarian kata kunci hanya pada item yang sudah difilter oleh kategori aktif.
4. WHEN kolom Search_Bar dikosongkan, THE Menu_Grid SHALL menampilkan kembali semua item yang sesuai dengan filter kategori aktif saat itu.
5. WHEN pencarian aktif dan tidak ada item yang cocok, THE Menu_Grid SHALL menampilkan pesan kosong dalam Bahasa Indonesia.

---

### Persyaratan 5: Menambahkan Item ke Keranjang

**User Story:** Sebagai pengunjung, saya ingin menambahkan item menu ke keranjang, sehingga saya dapat mengumpulkan pesanan saya sebelum melakukan checkout.

#### Kriteria Penerimaan

1. WHEN pengguna mengklik tombol "Tambah ke Keranjang" pada sebuah kartu Menu_Item, THE Cart SHALL menambahkan item tersebut dengan kuantitas 1 jika item belum ada di Cart.
2. WHEN pengguna mengklik tombol "Tambah ke Keranjang" pada sebuah Menu_Item yang sudah ada di Cart, THE Cart SHALL menambah kuantitas Cart_Item tersebut sebesar 1, bukan membuat entri duplikat.
3. WHEN Cart diperbarui, THE Cart_Panel SHALL segera memperbarui tampilan daftar item, kuantitas, dan total harga tanpa memuat ulang halaman.
4. THE Cart SHALL menyimpan Cart_Item sebagai array objek dalam memori dengan struktur: `{ id, nama_menu, harga, gambar, kuantitas }`.
5. WHEN sebuah item ditambahkan ke Cart, THE Cart_Panel SHALL menampilkan indikator visual (misalnya badge jumlah item) yang diperbarui secara real-time.

---

### Persyaratan 6: Mengelola Kuantitas Item di Keranjang

**User Story:** Sebagai pengunjung, saya ingin mengubah jumlah item di keranjang atau menghapusnya, sehingga saya dapat menyesuaikan pesanan sebelum checkout.

#### Kriteria Penerimaan

1. THE Cart_Panel SHALL menampilkan tombol penambah (+) dan pengurang (−) kuantitas untuk setiap Cart_Item.
2. WHEN pengguna mengklik tombol (+) pada sebuah Cart_Item, THE Cart SHALL menambah kuantitas item tersebut sebesar 1 dan THE Cart_Panel SHALL memperbarui tampilan secara real-time.
3. WHEN pengguna mengklik tombol (−) pada sebuah Cart_Item dengan kuantitas > 1, THE Cart SHALL mengurangi kuantitas item tersebut sebesar 1 dan THE Cart_Panel SHALL memperbarui tampilan secara real-time.
4. WHEN pengguna mengklik tombol (−) pada sebuah Cart_Item dengan kuantitas = 1, THE Cart SHALL menghapus item tersebut dari Cart dan THE Cart_Panel SHALL memperbarui tampilan secara real-time.
5. THE Cart_Panel SHALL menampilkan total harga keseluruhan yang dihitung sebagai jumlah dari `harga × kuantitas` untuk semua Cart_Item, diformat menggunakan Rupiah_Formatter.
6. WHEN Cart kosong, THE Cart_Panel SHALL menampilkan pesan kosong dalam Bahasa Indonesia dan menonaktifkan tombol checkout.

---

### Persyaratan 7: Pemesanan via WhatsApp

**User Story:** Sebagai pengunjung, saya ingin mengirim pesanan saya melalui WhatsApp, sehingga saya dapat dengan mudah mengkonfirmasi pesanan kepada pemilik restoran.

#### Kriteria Penerimaan

1. WHEN Cart berisi setidaknya satu Cart_Item dan pengguna mengklik tombol checkout, THE Catalog_Page SHALL membuat Order_Message yang diformat dalam Bahasa Indonesia.
2. THE Order_Message SHALL berisi: salam pembuka, daftar item pesanan (setiap baris: nama menu, kuantitas, dan subtotal harga), dan total harga keseluruhan.
3. WHEN Order_Message telah dibuat, THE WhatsApp_Redirect SHALL membuka URL `https://wa.me/6289540571803?text=<encoded_message>` di tab baru, di mana `<encoded_message>` adalah Order_Message yang di-encode menggunakan `encodeURIComponent`.
4. IF Cart kosong ketika pengguna mengklik tombol checkout, THEN THE Catalog_Page SHALL mencegah WhatsApp_Redirect dan menampilkan pesan peringatan dalam Bahasa Indonesia.
5. THE Order_Message SHALL menggunakan format harga Rupiah yang konsisten dengan Rupiah_Formatter untuk semua nilai harga yang ditampilkan.

---

### Persyaratan 8: Antarmuka Responsif dan Ramah Mobile

**User Story:** Sebagai pengunjung yang mengakses dari ponsel, saya ingin antarmuka yang nyaman digunakan di layar kecil, sehingga saya dapat menelusuri menu dan memesan dengan mudah.

#### Kriteria Penerimaan

1. THE Catalog_Page SHALL menggunakan sistem grid Bootstrap 5 untuk memastikan tata letak responsif di semua ukuran layar (mobile, tablet, desktop).
2. THE Cart_Panel SHALL dapat diakses di perangkat mobile, baik sebagai panel samping yang dapat di-toggle maupun sebagai bagian bawah halaman yang selalu terlihat.
3. THE Catalog_Page SHALL memuat dan merender konten yang terlihat dalam waktu kurang dari 3 detik pada koneksi 4G standar, dengan menggunakan lazy loading untuk gambar menu.
4. WHEN gambar menu dimuat, THE Menu_Grid SHALL menggunakan atribut `loading="lazy"` pada setiap elemen `<img>` untuk mengurangi waktu muat awal.
5. THE Catalog_Page SHALL dapat digunakan sepenuhnya hanya dengan sentuhan jari (tanpa hover) pada perangkat layar sentuh.

---

### Persyaratan 9: Penanganan Error dan Edge Case

**User Story:** Sebagai pengunjung, saya ingin aplikasi tetap berfungsi dengan baik meskipun terjadi kondisi tidak terduga, sehingga pengalaman saya tidak terganggu.

#### Kriteria Penerimaan

1. IF `data/menu.json` gagal dimuat (error jaringan, file tidak ditemukan, atau JSON tidak valid), THEN THE Catalog_Page SHALL menampilkan pesan error yang informatif dalam Bahasa Indonesia di area Menu_Grid, tanpa menyebabkan halaman crash.
2. IF `master_menu` dalam `data/menu.json` tidak mengandung item dengan `aktif: true`, THEN THE Catalog_Page SHALL menampilkan pesan "Menu belum tersedia saat ini" di area Menu_Grid.
3. IF Cart kosong ketika pengguna mencoba checkout, THEN THE Catalog_Page SHALL menampilkan pesan peringatan "Keranjang masih kosong" dan tidak melakukan WhatsApp_Redirect.
4. WHEN sebuah Menu_Item memiliki nilai `gambar` yang kosong atau tidak valid, THE Menu_Grid SHALL menampilkan gambar fallback `assets/img/about.jpg` tanpa menampilkan elemen gambar yang rusak.
5. THE Catalog_Page SHALL berfungsi penuh pada browser modern (Chrome, Firefox, Safari, Edge) tanpa memerlukan plugin atau ekstensi tambahan.
