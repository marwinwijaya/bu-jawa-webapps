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
$targetStatus = (int) ($_POST['target_status'] ?? 0);

$stmt = get_db()->prepare('UPDATE menu SET is_active = :is_active, updated_at = CURRENT_TIMESTAMP WHERE id = :id');
$stmt->execute([
    'is_active' => $targetStatus === 1 ? 1 : 0,
    'id' => $id,
]);

set_flash('success', $targetStatus === 1 ? 'Menu berhasil diaktifkan.' : 'Menu berhasil dinonaktifkan.');
header('Location: index.php');
exit;
