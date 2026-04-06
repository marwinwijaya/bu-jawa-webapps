<?php

declare(strict_types=1);

require_once __DIR__ . '/../includes/auth.php';

logout_admin();
set_flash('success', 'Anda telah keluar dari dashboard admin.');
header('Location: login.php');
exit;
