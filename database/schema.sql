PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kategori (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama_kategori TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS menu (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama_menu TEXT NOT NULL,
    kategori_id INTEGER NOT NULL,
    deskripsi TEXT,
    harga INTEGER NOT NULL DEFAULT 0,
    gambar TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    status_ketersediaan TEXT NOT NULL DEFAULT 'tersedia',
    tanggal_tampil TEXT NOT NULL,
    tipe_hari TEXT NOT NULL DEFAULT 'hari_ini',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kategori_id) REFERENCES kategori (id)
);

CREATE INDEX IF NOT EXISTS idx_menu_tanggal_tampil ON menu (tanggal_tampil);
CREATE INDEX IF NOT EXISTS idx_menu_tipe_hari ON menu (tipe_hari);
CREATE INDEX IF NOT EXISTS idx_menu_is_active ON menu (is_active);

INSERT INTO admin (username, password)
SELECT 'admin', 'admin123'
WHERE NOT EXISTS (SELECT 1 FROM admin WHERE username = 'admin');

INSERT INTO kategori (nama_kategori)
SELECT 'Makanan'
WHERE NOT EXISTS (SELECT 1 FROM kategori WHERE nama_kategori = 'Makanan');

INSERT INTO kategori (nama_kategori)
SELECT 'Minuman'
WHERE NOT EXISTS (SELECT 1 FROM kategori WHERE nama_kategori = 'Minuman');

INSERT INTO kategori (nama_kategori)
SELECT 'Lauk Tambahan'
WHERE NOT EXISTS (SELECT 1 FROM kategori WHERE nama_kategori = 'Lauk Tambahan');

INSERT INTO kategori (nama_kategori)
SELECT 'Paket'
WHERE NOT EXISTS (SELECT 1 FROM kategori WHERE nama_kategori = 'Paket');

INSERT INTO menu (nama_menu, kategori_id, deskripsi, harga, gambar, is_active, status_ketersediaan, tanggal_tampil, tipe_hari)
SELECT 'Nasi Gudeg', (SELECT id FROM kategori WHERE nama_kategori = 'Makanan'), 'Gudeg manis gurih dengan sambal krecek dan telur, cocok untuk makan siang keluarga.', 22000, 'assets/img/menu/cake.jpg', 1, 'tersedia', DATE('now', 'localtime'), 'hari_ini'
WHERE NOT EXISTS (SELECT 1 FROM menu WHERE nama_menu = 'Nasi Gudeg');

INSERT INTO menu (nama_menu, kategori_id, deskripsi, harga, gambar, is_active, status_ketersediaan, tanggal_tampil, tipe_hari)
SELECT 'Ayam Goreng', (SELECT id FROM kategori WHERE nama_kategori = 'Lauk Tambahan'), 'Ayam goreng bumbu kuning khas rumahan dengan tekstur empuk dan rasa meresap.', 18000, 'assets/img/menu/tuscan-grilled.jpg', 1, 'tersedia', DATE('now', 'localtime'), 'hari_ini'
WHERE NOT EXISTS (SELECT 1 FROM menu WHERE nama_menu = 'Ayam Goreng');

INSERT INTO menu (nama_menu, kategori_id, deskripsi, harga, gambar, is_active, status_ketersediaan, tanggal_tampil, tipe_hari)
SELECT 'Sayur Lodeh', (SELECT id FROM kategori WHERE nama_kategori = 'Makanan'), 'Sayur lodeh santan hangat dengan isian sayuran segar dan rasa khas dapur Jawa.', 16000, 'assets/img/menu/greek-salad.jpg', 1, 'tersedia', DATE('now', 'localtime'), 'hari_ini'
WHERE NOT EXISTS (SELECT 1 FROM menu WHERE nama_menu = 'Sayur Lodeh');

INSERT INTO menu (nama_menu, kategori_id, deskripsi, harga, gambar, is_active, status_ketersediaan, tanggal_tampil, tipe_hari)
SELECT 'Tempe Orek', (SELECT id FROM kategori WHERE nama_kategori = 'Lauk Tambahan'), 'Tempe orek manis pedas yang renyah dan cocok sebagai pelengkap berbagai lauk.', 9000, 'assets/img/menu/bread-barrel.jpg', 1, 'tersedia', DATE('now', 'localtime'), 'hari_ini'
WHERE NOT EXISTS (SELECT 1 FROM menu WHERE nama_menu = 'Tempe Orek');

INSERT INTO menu (nama_menu, kategori_id, deskripsi, harga, gambar, is_active, status_ketersediaan, tanggal_tampil, tipe_hari)
SELECT 'Sambal Terasi', (SELECT id FROM kategori WHERE nama_kategori = 'Lauk Tambahan'), 'Sambal terasi segar dengan rasa pedas mantap untuk menemani lauk utama.', 7000, 'assets/img/menu/lobster-bisque.jpg', 1, 'tersedia', DATE('now', 'localtime'), 'hari_ini'
WHERE NOT EXISTS (SELECT 1 FROM menu WHERE nama_menu = 'Sambal Terasi');

INSERT INTO menu (nama_menu, kategori_id, deskripsi, harga, gambar, is_active, status_ketersediaan, tanggal_tampil, tipe_hari)
SELECT 'Es Teh Manis', (SELECT id FROM kategori WHERE nama_kategori = 'Minuman'), 'Es teh manis segar yang pas untuk menemani hidangan rumahan sepanjang hari.', 6000, 'assets/img/menu/mozzarella.jpg', 1, 'tersedia', DATE('now', 'localtime'), 'hari_ini'
WHERE NOT EXISTS (SELECT 1 FROM menu WHERE nama_menu = 'Es Teh Manis');

INSERT INTO menu (nama_menu, kategori_id, deskripsi, harga, gambar, is_active, status_ketersediaan, tanggal_tampil, tipe_hari)
SELECT 'Teh Hangat', (SELECT id FROM kategori WHERE nama_kategori = 'Minuman'), 'Teh hangat klasik yang nyaman dinikmati bersama menu sarapan atau makan malam.', 5000, 'assets/img/menu/spinach-salad.jpg', 1, 'tersedia', DATE('now', 'localtime', '+1 day'), 'besok'
WHERE NOT EXISTS (SELECT 1 FROM menu WHERE nama_menu = 'Teh Hangat');

INSERT INTO menu (nama_menu, kategori_id, deskripsi, harga, gambar, is_active, status_ketersediaan, tanggal_tampil, tipe_hari)
SELECT 'Jeruk Es', (SELECT id FROM kategori WHERE nama_kategori = 'Minuman'), 'Minuman jeruk segar dengan rasa manis asam yang ringan dan menyegarkan.', 8000, 'assets/img/menu/caesar.jpg', 1, 'tersedia', DATE('now', 'localtime', '+1 day'), 'besok'
WHERE NOT EXISTS (SELECT 1 FROM menu WHERE nama_menu = 'Jeruk Es');

INSERT INTO menu (nama_menu, kategori_id, deskripsi, harga, gambar, is_active, status_ketersediaan, tanggal_tampil, tipe_hari)
SELECT 'Paket Hemat Bu Jawa', (SELECT id FROM kategori WHERE nama_kategori = 'Paket'), 'Paket nasi, ayam goreng, sayur, sambal, dan es teh untuk makan praktis dan lengkap.', 32000, 'assets/img/menu/lobster-roll.jpg', 1, 'tersedia', DATE('now', 'localtime', '+1 day'), 'besok'
WHERE NOT EXISTS (SELECT 1 FROM menu WHERE nama_menu = 'Paket Hemat Bu Jawa');
