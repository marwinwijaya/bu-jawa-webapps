<?php

declare(strict_types=1);

require_once __DIR__ . '/../includes/auth.php';

require_admin();

$filters = [
    'kategori_id' => $_GET['kategori_id'] ?? '',
    'is_active' => $_GET['is_active'] ?? '',
    'tanggal_tampil' => $_GET['tanggal_tampil'] ?? '',
    'tipe_hari' => $_GET['tipe_hari'] ?? '',
];

$admin = current_admin();
$flash = current_flash();
$summary = fetch_dashboard_summary();
$categories = fetch_categories();
$menus = fetch_admin_menu($filters);
$menuOptions = fetch_all_menu_options();
$menuHariIni = fetch_menu_for_date_group('hari_ini');
$menuBesok = fetch_menu_for_date_group('besok');
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard Admin | <?= e(APP_NAME); ?></title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fraunces:wght@600;700&display=swap" rel="stylesheet">
  <link href="../assets/vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet">
  <link href="../assets/vendor/bootstrap-icons/bootstrap-icons.css" rel="stylesheet">
  <link href="../assets/css/style.css" rel="stylesheet">
</head>
<body class="admin-body">
  <div class="admin-shell">
    <aside class="admin-sidebar">
      <div>
        <span class="section-kicker">Admin</span>
        <h1><?= e(APP_NAME); ?></h1>
        <p>Kelola menu aktif, jadwal tayang, dan status ketersediaan dari satu dashboard ringan.</p>
      </div>
      <nav class="admin-nav">
        <a href="#ringkasan">Ringkasan</a>
        <a href="#daftar-menu">Daftar Menu</a>
        <a href="#jadwal">Menu Terjadwal</a>
        <a href="../index.php" target="_blank" rel="noopener noreferrer">Buka Website Publik</a>
        <a href="logout.php">Keluar</a>
      </nav>
    </aside>

    <main class="admin-main">
      <header class="admin-header">
        <div>
          <h2>Halo, <?= e((string) $admin['username']); ?></h2>
          <p>Kelola katalog menu dan masukkan menu yang dipilih ke jadwal tampil.</p>
        </div>
        <a href="menu_form.php" class="btn btn-primary-custom">Tambah Menu Baru</a>
      </header>

      <?php if ($flash): ?>
        <div class="alert alert-<?= e($flash['type'] === 'error' ? 'danger' : $flash['type']); ?>"><?= e($flash['message']); ?></div>
      <?php endif; ?>

      <section class="admin-section" id="ringkasan">
        <div class="summary-grid">
          <div class="summary-card"><span>Menu Hari Ini</span><strong><?= e((string) $summary['hari_ini']); ?></strong></div>
          <div class="summary-card"><span>Menu Besok</span><strong><?= e((string) $summary['besok']); ?></strong></div>
          <div class="summary-card"><span>Total Menu</span><strong><?= e((string) $summary['total']); ?></strong></div>
          <div class="summary-card"><span>Menu Nonaktif</span><strong><?= e((string) $summary['nonaktif']); ?></strong></div>
        </div>
      </section>

      <section class="admin-section" id="daftar-menu">
        <div class="section-title-inline">
          <div>
            <span class="section-kicker">Daftar Menu</span>
            <h3>Katalog menu utama yang bisa ditambah dan dipilih untuk dijadwalkan</h3>
          </div>
          <a href="menu_form.php" class="btn btn-primary-custom">Tambah Menu Baru</a>
        </div>

        <form method="get" class="filter-grid">
          <div>
            <label for="kategori_id">Kategori</label>
            <select id="kategori_id" name="kategori_id" class="form-select">
              <option value="">Semua kategori</option>
              <?php foreach ($categories as $category): ?>
                <option value="<?= (int) $category['id']; ?>" <?= (string) $filters['kategori_id'] === (string) $category['id'] ? 'selected' : ''; ?>><?= e($category['nama_kategori']); ?></option>
              <?php endforeach; ?>
            </select>
          </div>
          <div>
            <label for="is_active">Status Aktif</label>
            <select id="is_active" name="is_active" class="form-select">
              <option value="">Semua status</option>
              <option value="1" <?= $filters['is_active'] === '1' ? 'selected' : ''; ?>>Aktif</option>
              <option value="0" <?= $filters['is_active'] === '0' ? 'selected' : ''; ?>>Nonaktif</option>
            </select>
          </div>
          <div>
            <label for="tipe_hari">Tipe Hari</label>
            <select id="tipe_hari" name="tipe_hari" class="form-select">
              <option value="">Semua tipe</option>
              <option value="hari_ini" <?= $filters['tipe_hari'] === 'hari_ini' ? 'selected' : ''; ?>>Hari Ini</option>
              <option value="besok" <?= $filters['tipe_hari'] === 'besok' ? 'selected' : ''; ?>>Besok</option>
              <option value="jadwal" <?= $filters['tipe_hari'] === 'jadwal' ? 'selected' : ''; ?>>Jadwal Lain</option>
            </select>
          </div>
          <div>
            <label for="tanggal_tampil">Tanggal Tampil</label>
            <input id="tanggal_tampil" type="date" name="tanggal_tampil" class="form-control" value="<?= e((string) $filters['tanggal_tampil']); ?>">
          </div>
          <div class="filter-actions">
            <button type="submit" class="btn btn-primary-custom">Terapkan Filter</button>
            <a href="index.php" class="btn btn-outline-custom">Reset</a>
          </div>
        </form>

        <div class="table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Menu</th>
                <th>Kategori</th>
                <th>Harga</th>
                <th>Status</th>
                <th>Aktif</th>
                <th>Tanggal Tampil</th>
                <th>Tipe Hari</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <?php if ($menus): ?>
                <?php foreach ($menus as $menu): ?>
                  <tr>
                    <td><strong><?= e($menu['nama_menu']); ?></strong><p><?= e($menu['deskripsi']); ?></p></td>
                    <td><?= e($menu['nama_kategori']); ?></td>
                    <td><?= format_rupiah($menu['harga']); ?></td>
                    <td><span class="table-badge <?= $menu['status_ketersediaan'] === 'habis' ? 'is-danger' : 'is-success'; ?>"><?= e($menu['status_ketersediaan']); ?></span></td>
                    <td><?= (int) $menu['is_active'] === 1 ? 'Aktif' : 'Nonaktif'; ?></td>
                    <td><?= e($menu['tanggal_tampil']); ?></td>
                    <td><?= e($menu['tipe_hari']); ?></td>
                    <td>
                      <div class="table-actions">
                        <a href="menu_form.php?id=<?= (int) $menu['id']; ?>">Edit</a>
                        <form method="post" action="schedule_menu.php">
                          <input type="hidden" name="csrf_token" value="<?= e(csrf_token()); ?>">
                          <input type="hidden" name="id" value="<?= (int) $menu['id']; ?>">
                          <input type="hidden" name="target_day" value="besok">
                          <button type="submit">Jadwalkan ke Besok</button>
                        </form>
                        <form method="post" action="toggle_menu.php">
                          <input type="hidden" name="csrf_token" value="<?= e(csrf_token()); ?>">
                          <input type="hidden" name="id" value="<?= (int) $menu['id']; ?>">
                          <input type="hidden" name="target_status" value="<?= (int) $menu['is_active'] === 1 ? '0' : '1'; ?>">
                          <button type="submit"><?= (int) $menu['is_active'] === 1 ? 'Nonaktifkan' : 'Aktifkan'; ?></button>
                        </form>
                        <form method="post" action="delete_menu.php" onsubmit="return confirm('Hapus menu ini?');">
                          <input type="hidden" name="csrf_token" value="<?= e(csrf_token()); ?>">
                          <input type="hidden" name="id" value="<?= (int) $menu['id']; ?>">
                          <button type="submit" class="danger-link">Hapus</button>
                        </form>
                      </div>
                    </td>
                  </tr>
                <?php endforeach; ?>
              <?php else: ?>
                <tr><td colspan="8" class="empty-inline">Belum ada data menu untuk filter yang dipilih.</td></tr>
              <?php endif; ?>
            </tbody>
          </table>
        </div>
      </section>

      <section class="admin-section" id="jadwal">
        <div class="section-title-inline">
          <div>
            <span class="section-kicker">Menu Terjadwal</span>
            <h3>Tambahkan menu dari Daftar Menu ke jadwal tampil. Menu nonaktif akan aktif otomatis saat dijadwalkan.</h3>
          </div>
        </div>

        <div class="schedule-grid">
          <div class="schedule-card">
            <div class="schedule-head">
              <h4>Tambah ke Jadwal</h4>
              <span>Atur cepat</span>
            </div>
            <form method="post" action="schedule_menu.php" class="schedule-form">
              <input type="hidden" name="csrf_token" value="<?= e(csrf_token()); ?>">
              <div>
                <label for="jadwal_id">Pilih menu dari Daftar Menu</label>
                <select id="jadwal_id" name="id" class="form-select" required>
                  <option value="">Pilih menu</option>
                  <?php foreach ($menuOptions as $option): ?>
                    <option value="<?= (int) $option['id']; ?>">
                      <?= e($option['nama_menu']); ?> - <?= e($option['nama_kategori']); ?> - <?= (int) $option['is_active'] === 1 ? 'aktif' : 'nonaktif'; ?>
                    </option>
                  <?php endforeach; ?>
                </select>
              </div>
              <div>
                <label for="target_day">Masukkan ke</label>
                <select id="target_day" name="target_day" class="form-select">
                  <option value="besok">Menu Besok</option>
                  <option value="hari_ini">Menu Hari Ini</option>
                  <option value="jadwal">Jadwal Lain</option>
                </select>
              </div>
              <div>
                <label for="tanggal_tampil_jadwal">Tanggal Tampil</label>
                <input id="tanggal_tampil_jadwal" type="date" name="tanggal_tampil" class="form-control" value="<?= e(tomorrow_date()); ?>">
              </div>
              <button type="submit" class="btn btn-primary-custom">Tambahkan ke Menu Terjadwal</button>
            </form>
          </div>

          <div class="schedule-card">
            <div class="schedule-head">
              <h4>Menu Hari Ini</h4>
              <span><?= e(today_date()); ?></span>
            </div>
            <?php if ($menuHariIni): ?>
              <ul class="schedule-list">
                <?php foreach ($menuHariIni as $item): ?>
                  <li>
                    <div>
                      <strong><?= e($item['nama_menu']); ?></strong>
                      <small><?= e($item['nama_kategori']); ?></small>
                    </div>
                    <div class="schedule-actions-inline">
                      <a href="menu_form.php?id=<?= (int) $item['id']; ?>">Edit</a>
                      <form method="post" action="schedule_menu.php">
                        <input type="hidden" name="csrf_token" value="<?= e(csrf_token()); ?>">
                        <input type="hidden" name="id" value="<?= (int) $item['id']; ?>">
                        <input type="hidden" name="target_day" value="besok">
                        <button type="submit">Pindah ke Besok</button>
                      </form>
                    </div>
                  </li>
                <?php endforeach; ?>
              </ul>
            <?php else: ?>
              <p class="empty-inline">Belum ada menu aktif untuk hari ini.</p>
            <?php endif; ?>
          </div>

          <div class="schedule-card schedule-card-wide">
            <div class="schedule-head">
              <h4>Menu Besok / Selanjutnya</h4>
              <span><?= e(tomorrow_date()); ?></span>
            </div>
            <?php if ($menuBesok): ?>
              <ul class="schedule-list">
                <?php foreach ($menuBesok as $item): ?>
                  <li>
                    <div>
                      <strong><?= e($item['nama_menu']); ?></strong>
                      <small><?= e($item['tanggal_tampil']); ?> | <?= e($item['nama_kategori']); ?></small>
                    </div>
                    <div class="schedule-actions-inline">
                      <a href="menu_form.php?id=<?= (int) $item['id']; ?>">Edit</a>
                      <form method="post" action="schedule_menu.php">
                        <input type="hidden" name="csrf_token" value="<?= e(csrf_token()); ?>">
                        <input type="hidden" name="id" value="<?= (int) $item['id']; ?>">
                        <input type="hidden" name="target_day" value="hari_ini">
                        <button type="submit">Tampilkan Hari Ini</button>
                      </form>
                    </div>
                  </li>
                <?php endforeach; ?>
              </ul>
            <?php else: ?>
              <p class="empty-inline">Belum ada preview menu berikutnya.</p>
            <?php endif; ?>
          </div>
        </div>
      </section>
    </main>
  </div>
</body>
</html>
