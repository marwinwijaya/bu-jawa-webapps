<?php

declare(strict_types=1);

require_once __DIR__ . '/../includes/auth.php';

if (current_admin()) {
    header('Location: index.php');
    exit;
}

$flash = current_flash();
$error = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();

    $username = trim((string) ($_POST['username'] ?? ''));
    $password = (string) ($_POST['password'] ?? '');

    if (attempt_login($username, $password)) {
        set_flash('success', 'Login admin berhasil.');
        header('Location: index.php');
        exit;
    }

    $error = 'Username atau password tidak sesuai.';
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login Admin | <?= e(APP_NAME); ?></title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fraunces:wght@600;700&display=swap" rel="stylesheet">
  <link href="../assets/vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet">
  <link href="../assets/vendor/bootstrap-icons/bootstrap-icons.css" rel="stylesheet">
  <link href="../assets/css/style.css" rel="stylesheet">
</head>
<body class="admin-body">
  <main class="auth-layout">
    <section class="auth-card">
      <span class="section-kicker">Dashboard Admin</span>
      <h1>Login admin <?= e(APP_NAME); ?></h1>
      <p>Masuk untuk menambah, mengubah, mengaktifkan, dan menjadwalkan menu.</p>

      <?php if ($flash): ?>
        <div class="alert alert-<?= e($flash['type'] === 'error' ? 'danger' : $flash['type']); ?>"><?= e($flash['message']); ?></div>
      <?php endif; ?>

      <?php if ($error): ?>
        <div class="alert alert-danger"><?= e($error); ?></div>
      <?php endif; ?>

      <form method="post" class="auth-form">
        <input type="hidden" name="csrf_token" value="<?= e(csrf_token()); ?>">
        <label for="username">Username</label>
        <input id="username" name="username" type="text" class="form-control" required>

        <label for="password">Password</label>
        <input id="password" name="password" type="password" class="form-control" required>

        <button type="submit" class="btn btn-primary-custom w-100">Masuk ke Dashboard</button>
      </form>

      <div class="auth-note">
        <strong>Login awal:</strong> username <code>admin</code>, password <code>admin123</code>
      </div>

      <a href="../index.php" class="back-link">Kembali ke website publik</a>
    </section>
  </main>
</body>
</html>
