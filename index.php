<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/functions.php';

$menuHariIni = fetch_public_menu_today();
$menuBesok = fetch_public_menu_upcoming();
$flash = current_flash();

function render_badge(string $status): string
{
    $class = $status === 'habis' ? 'badge-danger' : 'badge-success';
    $label = $status === 'habis' ? 'Habis' : 'Tersedia';

    return '<span class="menu-badge ' . $class . '">' . e($label) . '</span>';
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta content="width=device-width, initial-scale=1.0" name="viewport">
  <title><?= e(APP_NAME); ?> | Masakan Rumahan Khas Jawa</title>
  <meta name="description" content="Website resmi Rumah Makan Bu Jawa. Lihat menu hari ini, menu besok, jam buka, dan informasi pemesanan.">
  <link href="assets/img/favicon.png" rel="icon">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fraunces:wght@600;700&display=swap" rel="stylesheet">
  <link href="assets/vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet">
  <link href="assets/vendor/bootstrap-icons/bootstrap-icons.css" rel="stylesheet">
  <link href="assets/css/style.css" rel="stylesheet">
</head>
<body>
  <div class="site-shell">
    <div class="topbar-custom">
      <div class="container d-flex flex-column flex-lg-row justify-content-between gap-2">
        <div class="d-flex flex-wrap gap-3">
          <span><i class="bi bi-telephone"></i> <?= e(APP_PHONE); ?></span>
          <span><i class="bi bi-clock"></i> <?= e(APP_OPEN_HOURS); ?></span>
        </div>
        <div class="d-flex gap-3">
          <a href="<?= e(APP_MAPS_URL); ?>" target="_blank" rel="noopener noreferrer">Lihat Lokasi</a>
          <a href="admin/login.php">Login Admin</a>
        </div>
      </div>
    </div>

    <header class="main-header">
      <div class="container">
        <nav class="navbar navbar-expand-lg navbar-light p-0">
          <a class="navbar-brand brand-mark" href="#beranda"><?= e(APP_NAME); ?></a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarUtama" aria-controls="navbarUtama" aria-expanded="false" aria-label="Buka navigasi">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarUtama">
            <ul class="navbar-nav ms-auto align-items-lg-center">
              <li class="nav-item"><a class="nav-link" href="#beranda">Beranda</a></li>
              <li class="nav-item"><a class="nav-link" href="#tentang">Tentang Kami</a></li>
              <li class="nav-item"><a class="nav-link" href="#menu-hari-ini">Menu Hari Ini</a></li>
              <li class="nav-item"><a class="nav-link" href="#menu-besok">Menu Besok</a></li>
              <li class="nav-item"><a class="nav-link" href="#kontak">Kontak & Lokasi</a></li>
              <li class="nav-item ms-lg-3"><a class="btn btn-primary-custom" href="tel:<?= e(APP_PHONE); ?>">Pesan Sekarang</a></li>
            </ul>
          </div>
        </nav>
      </div>
    </header>

    <section class="hero-section" id="beranda">
      <div class="container">
        <div class="row align-items-center gy-5">
          <div class="col-lg-7">
            <span class="eyebrow">Masakan rumahan khas Jawa</span>
            <h1><?= e(APP_NAME); ?></h1>
            <p class="hero-copy">Hidangan hangat, rasa akrab, dan menu harian yang dibuat untuk keluarga, kantor, dan pelanggan yang ingin makan enak tanpa ribet.</p>
            <div class="hero-actions">
              <a class="btn btn-primary-custom" href="#menu-hari-ini">Lihat Menu</a>
              <a class="btn btn-outline-custom" href="tel:<?= e(APP_PHONE); ?>">Pesan Sekarang</a>
            </div>
            <div class="hero-meta">
              <div class="meta-card">
                <span class="meta-label">Telepon Pemesanan</span>
                <strong><?= e(APP_PHONE); ?></strong>
              </div>
              <div class="meta-card">
                <span class="meta-label">Jam Buka</span>
                <strong><?= e(APP_OPEN_HOURS); ?></strong>
              </div>
              <div class="meta-card">
                <span class="meta-label">Akses Lokasi</span>
                <a href="<?= e(APP_MAPS_URL); ?>" target="_blank" rel="noopener noreferrer">Buka Google Maps</a>
              </div>
            </div>
          </div>
          <div class="col-lg-5">
            <div class="hero-panel">
              <div class="hero-panel-top">
                <span class="panel-chip">Siap dipesan hari ini</span>
                <span class="panel-chip muted"><?= count($menuHariIni); ?> menu aktif</span>
              </div>
              <img src="assets/img/about.jpg" alt="Suasana Rumah Makan Bu Jawa" class="hero-image">
              <div class="hero-panel-content">
                <h2>Menu harian tersusun rapi</h2>
                <p>Pelanggan bisa langsung melihat menu aktif untuk hari ini dan melihat preview menu berikutnya tanpa harus bertanya manual.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <main>
      <section class="section-block" id="tentang">
        <div class="container">
          <div class="section-heading">
            <span class="section-kicker">Tentang Kami</span>
            <h2>Rumah makan yang mengutamakan rasa rumahan, kenyamanan, dan kejelasan menu</h2>
          </div>
          <div class="about-grid">
            <div class="about-card">
              <p><?= e(APP_NAME); ?> hadir dengan sajian khas Jawa yang hangat, akrab, dan cocok dinikmati bersama keluarga, rekan kerja, maupun pelanggan setia yang mencari masakan sehari-hari dengan rasa yang konsisten.</p>
              <p>Kami menata menu secara jelas agar pelanggan mudah melihat pilihan makanan, minuman, lauk tambahan, hingga paket praktis yang tersedia hari ini maupun untuk hari berikutnya.</p>
            </div>
            <div class="about-points">
              <div class="point-card">
                <i class="bi bi-house-heart"></i>
                <h3>Nuansa rumahan</h3>
                <p>Rasa akrab dan menu yang dekat dengan selera makan harian keluarga Indonesia.</p>
              </div>
              <div class="point-card">
                <i class="bi bi-basket2"></i>
                <h3>Mudah dipesan</h3>
                <p>Informasi menu, harga, status ketersediaan, dan kontak pemesanan tersaji dengan jelas.</p>
              </div>
              <div class="point-card">
                <i class="bi bi-calendar-check"></i>
                <h3>Terjadwal rapi</h3>
                <p>Menu hari ini dan menu besok ditampilkan terpisah supaya pelanggan bisa merencanakan pesanan.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="section-block menu-section" id="menu-hari-ini">
        <div class="container">
          <div class="section-heading">
            <span class="section-kicker">Menu Hari Ini</span>
            <h2>Daftar menu aktif yang siap dilihat pelanggan hari ini</h2>
          </div>
          <?php if ($menuHariIni): ?>
            <div class="row g-4">
              <?php foreach ($menuHariIni as $menu): ?>
                <div class="col-md-6 col-xl-4">
                  <article class="menu-card">
                    <div class="menu-card-image-wrap">
                      <img src="<?= e($menu['gambar'] ?: 'assets/img/about.jpg'); ?>" alt="<?= e($menu['nama_menu']); ?>" class="menu-card-image">
                      <?= render_badge((string) $menu['status_ketersediaan']); ?>
                    </div>
                    <div class="menu-card-body">
                      <div class="menu-card-top">
                        <span class="menu-category"><?= e($menu['nama_kategori']); ?></span>
                        <strong><?= format_rupiah($menu['harga']); ?></strong>
                      </div>
                      <h3><?= e($menu['nama_menu']); ?></h3>
                      <p><?= e($menu['deskripsi']); ?></p>
                    </div>
                  </article>
                </div>
              <?php endforeach; ?>
            </div>
          <?php else: ?>
            <div class="empty-state">
              <p>Menu aktif untuk hari ini belum tersedia. Silakan hubungi kami untuk informasi pemesanan terbaru.</p>
            </div>
          <?php endif; ?>
        </div>
      </section>

      <section class="section-block" id="menu-besok">
        <div class="container">
          <div class="section-heading">
            <span class="section-kicker">Menu Besok</span>
            <h2>Preview menu hari berikutnya untuk membantu pelanggan merencanakan pesanan</h2>
          </div>
          <?php if ($menuBesok): ?>
            <div class="row g-4">
              <?php foreach ($menuBesok as $menu): ?>
                <div class="col-md-6 col-xl-4">
                  <article class="menu-card menu-card-future">
                    <div class="menu-card-image-wrap">
                      <img src="<?= e($menu['gambar'] ?: 'assets/img/about.jpg'); ?>" alt="<?= e($menu['nama_menu']); ?>" class="menu-card-image">
                      <span class="menu-badge badge-warning">Menu Besok</span>
                    </div>
                    <div class="menu-card-body">
                      <div class="menu-card-top">
                        <span class="menu-category"><?= e($menu['nama_kategori']); ?></span>
                        <strong><?= format_rupiah($menu['harga']); ?></strong>
                      </div>
                      <h3><?= e($menu['nama_menu']); ?></h3>
                      <p><?= e($menu['deskripsi']); ?></p>
                      <div class="menu-date">Tayang: <?= e(date('d M Y', strtotime((string) $menu['tanggal_tampil']))); ?></div>
                    </div>
                  </article>
                </div>
              <?php endforeach; ?>
            </div>
          <?php else: ?>
            <div class="empty-state">
              <p>Preview menu besok belum tersedia. Admin dapat menambahkan jadwal menu berikutnya dari dashboard.</p>
            </div>
          <?php endif; ?>
        </div>
      </section>

      <section class="section-block contact-section" id="kontak">
        <div class="container">
          <div class="section-heading">
            <span class="section-kicker">Kontak & Lokasi</span>
            <h2>Informasi pemesanan yang jelas dan mudah dihubungi</h2>
          </div>
          <div class="contact-grid">
            <div class="contact-card">
              <h3>Hubungi Rumah Makan Bu Jawa</h3>
              <ul class="contact-list">
                <li><i class="bi bi-telephone"></i> <?= e(APP_PHONE); ?></li>
                <li><i class="bi bi-clock"></i> <?= e(APP_OPEN_HOURS); ?></li>
                <li><i class="bi bi-geo-alt"></i> Lokasi tersedia di Google Maps</li>
              </ul>
              <div class="hero-actions">
                <a class="btn btn-primary-custom" href="tel:<?= e(APP_PHONE); ?>">Hubungi Sekarang</a>
                <a class="btn btn-outline-custom" href="<?= e(APP_MAPS_URL); ?>" target="_blank" rel="noopener noreferrer">Buka Google Maps</a>
              </div>
            </div>
            <div class="contact-card contact-note">
              <h3>Siap melayani setiap hari</h3>
              <p>Kami membuka layanan setiap hari mulai pukul 09.00 sampai 21.00 WIB. Untuk pemesanan, pelanggan dapat langsung menghubungi nomor yang tersedia atau membuka lokasi melalui Google Maps.</p>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <div class="container d-flex flex-column flex-md-row justify-content-between gap-2">
        <p class="mb-0">&copy; <?= date('Y'); ?> <?= e(APP_NAME); ?>. Seluruh informasi disajikan untuk memudahkan pemesanan.</p>
        <a href="admin/login.php">Akses Admin</a>
      </div>
    </footer>
  </div>

  <?php if ($flash): ?>
    <div class="floating-flash flash-<?= e($flash['type']); ?>">
      <?= e($flash['message']); ?>
    </div>
  <?php endif; ?>

  <script src="assets/vendor/bootstrap/js/bootstrap.bundle.min.js"></script>
</body>
</html>
