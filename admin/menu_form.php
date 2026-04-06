<?php

declare(strict_types=1);

require_once __DIR__ . '/../includes/auth.php';

require_admin();

$categories = fetch_categories();
$id = isset($_GET['id']) ? (int) $_GET['id'] : null;
$menu = $id ? fetch_menu_by_id($id) : null;

if ($id && !$menu) {
    set_flash('error', 'Data menu tidak ditemukan.');
    header('Location: index.html');
    exit;
}

$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();

    $namaMenu = trim((string) ($_POST['nama_menu'] ?? ''));
    $kategoriId = (int) ($_POST['kategori_id'] ?? 0);
    $harga = (int) ($_POST['harga'] ?? 0);
    $tanggalTampil = (string) ($_POST['tanggal_tampil'] ?? '');

    if ($namaMenu === '') {
        $errors[] = 'Nama menu wajib diisi.';
    }

    if ($kategoriId <= 0) {
        $errors[] = 'Kategori wajib dipilih.';
    }

    if ($harga <= 0) {
        $errors[] = 'Harga harus lebih besar dari nol.';
    }

    if ($tanggalTampil === '') {
        $errors[] = 'Tanggal tampil wajib diisi.';
    }

    if (!$errors) {
        save_menu($_POST, $id);
        set_flash('success', $id ? 'Menu berhasil diperbarui.' : 'Menu baru berhasil ditambahkan.');
        header('Location: index.html');
        exit;
    }

    $menu = $_POST;
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= $id ? 'Edit Menu' : 'Tambah Menu'; ?> | <?= e(APP_NAME); ?></title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fraunces:wght@600;700&display=swap" rel="stylesheet">
  <link href="../assets/vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet">
  <link href="../assets/vendor/bootstrap-icons/bootstrap-icons.css" rel="stylesheet">
  <link href="../assets/css/style.css" rel="stylesheet">
</head>
<body class="admin-body">
  <main class="form-layout">
    <section class="form-card">
      <div class="section-title-inline">
        <div>
          <span class="section-kicker">Form Menu</span>
          <h1><?= $id ? 'Edit data menu' : 'Tambah menu baru'; ?></h1>
        </div>
        <a href="index.html" class="btn btn-outline-custom">Kembali ke Dashboard</a>
      </div>

      <?php if ($errors): ?>
        <div class="alert alert-danger"><?= e(implode(' ', $errors)); ?></div>
      <?php endif; ?>

      <form method="post" class="menu-form-grid">
        <input type="hidden" name="csrf_token" value="<?= e(csrf_token()); ?>">

        <div class="full">
          <label for="nama_menu">Nama Menu</label>
          <input id="nama_menu" name="nama_menu" type="text" class="form-control" value="<?= e((string) ($menu['nama_menu'] ?? '')); ?>" required>
        </div>

        <div>
          <label for="kategori_id">Kategori</label>
          <select id="kategori_id" name="kategori_id" class="form-select" required>
            <option value="">Pilih kategori</option>
            <?php foreach ($categories as $category): ?>
              <option value="<?= (int) $category['id']; ?>" <?= (string) ($menu['kategori_id'] ?? '') === (string) $category['id'] ? 'selected' : ''; ?>><?= e($category['nama_kategori']); ?></option>
            <?php endforeach; ?>
          </select>
        </div>

        <div>
          <label for="harga">Harga</label>
          <input id="harga" name="harga" type="number" min="0" class="form-control" value="<?= e((string) ($menu['harga'] ?? '')); ?>" required>
        </div>

        <div>
          <label for="status_ketersediaan">Status Ketersediaan</label>
          <select id="status_ketersediaan" name="status_ketersediaan" class="form-select">
            <option value="tersedia" <?= ($menu['status_ketersediaan'] ?? 'tersedia') === 'tersedia' ? 'selected' : ''; ?>>Tersedia</option>
            <option value="habis" <?= ($menu['status_ketersediaan'] ?? '') === 'habis' ? 'selected' : ''; ?>>Habis</option>
          </select>
        </div>

        <div>
          <label for="tipe_hari">Tipe Hari</label>
          <select id="tipe_hari" name="tipe_hari" class="form-select">
            <option value="hari_ini" <?= ($menu['tipe_hari'] ?? 'hari_ini') === 'hari_ini' ? 'selected' : ''; ?>>Hari Ini</option>
            <option value="besok" <?= ($menu['tipe_hari'] ?? '') === 'besok' ? 'selected' : ''; ?>>Besok</option>
            <option value="jadwal" <?= ($menu['tipe_hari'] ?? '') === 'jadwal' ? 'selected' : ''; ?>>Jadwal Lain</option>
          </select>
        </div>

        <div>
          <label for="tanggal_tampil">Tanggal Tampil</label>
          <input id="tanggal_tampil" name="tanggal_tampil" type="date" class="form-control" value="<?= e((string) ($menu['tanggal_tampil'] ?? today_date())); ?>" required>
        </div>

        <div class="full">
          <label for="gambar">Path Gambar</label>
          <input id="gambar" name="gambar" type="text" class="form-control" value="<?= e((string) ($menu['gambar'] ?? 'assets/img/about.jpg')); ?>" placeholder="assets/img/about.jpg">
        </div>

        <div class="full">
          <label for="deskripsi">Deskripsi Singkat</label>
          <textarea id="deskripsi" name="deskripsi" class="form-control" rows="4"><?= e((string) ($menu['deskripsi'] ?? '')); ?></textarea>
        </div>

        <div class="full checkbox-row">
          <input id="is_active" name="is_active" type="checkbox" value="1" <?= (string) ($menu['is_active'] ?? '1') === '1' ? 'checked' : ''; ?>>
          <label for="is_active">Aktifkan menu ini agar bisa tampil di halaman publik</label>
        </div>

        <div class="full form-actions">
          <button type="submit" class="btn btn-primary-custom"><?= $id ? 'Simpan Perubahan' : 'Tambah Menu'; ?></button>
          <a href="index.html" class="btn btn-outline-custom">Batal</a>
        </div>
      </form>
    </section>
  </main>
</body>
</html>
