<?php

declare(strict_types=1);

require_once __DIR__ . '/../includes/auth.php';

require_admin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: index.php');
    exit;
}

verify_csrf();

$id = (int) ($_POST['id'] ?? 0);

$stmt = get_db()->prepare('DELETE FROM menu WHERE id = :id');
$stmt->execute(['id' => $id]);

set_flash('success', 'Menu berhasil dihapus.');
header('Location: index.php');
exit;
