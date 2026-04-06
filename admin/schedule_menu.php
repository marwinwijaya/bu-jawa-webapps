<?php

declare(strict_types=1);

require_once __DIR__ . '/../includes/auth.php';

require_admin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: index.html');
    exit;
}

verify_csrf();

$id = (int) ($_POST['id'] ?? 0);
$targetDay = (string) ($_POST['target_day'] ?? 'besok');
$scheduleDate = trim((string) ($_POST['tanggal_tampil'] ?? ''));

if ($id <= 0) {
    set_flash('error', 'Menu yang dipilih tidak valid.');
    header('Location: index.html#jadwal');
    exit;
}

schedule_menu_for_day($id, $targetDay, $scheduleDate);

if ($targetDay === 'hari_ini') {
    set_flash('success', 'Menu berhasil dijadwalkan untuk hari ini dan otomatis diaktifkan.');
} elseif ($targetDay === 'jadwal') {
    set_flash('success', 'Menu berhasil dimasukkan ke menu terjadwal dan otomatis diaktifkan.');
} else {
    set_flash('success', 'Menu berhasil ditambahkan ke Menu Terjadwal dan otomatis diaktifkan untuk besok.');
}

header('Location: index.html#jadwal');
exit;
