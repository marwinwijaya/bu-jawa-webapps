<?php

declare(strict_types=1);

require_once __DIR__ . '/functions.php';

function current_admin(): ?array
{
    if (!isset($_SESSION['admin_id'])) {
        return null;
    }

    $stmt = get_db()->prepare('SELECT id, username, created_at FROM admin WHERE id = :id LIMIT 1');
    $stmt->execute(['id' => (int) $_SESSION['admin_id']]);
    $admin = $stmt->fetch();

    return $admin ?: null;
}

function attempt_login(string $username, string $password): bool
{
    $stmt = get_db()->prepare('SELECT * FROM admin WHERE username = :username LIMIT 1');
    $stmt->execute(['username' => $username]);
    $admin = $stmt->fetch();

    if (!$admin) {
        return false;
    }

    $storedPassword = (string) $admin['password'];
    $valid = password_verify($password, $storedPassword) || hash_equals($storedPassword, $password);

    if (!$valid) {
        return false;
    }

    if (!password_get_info($storedPassword)['algo']) {
        $newHash = password_hash($password, PASSWORD_DEFAULT);
        $update = get_db()->prepare('UPDATE admin SET password = :password WHERE id = :id');
        $update->execute([
            'password' => $newHash,
            'id' => (int) $admin['id'],
        ]);
    }

    $_SESSION['admin_id'] = (int) $admin['id'];

    return true;
}

function require_admin(): void
{
    if (!current_admin()) {
        header('Location: login.php');
        exit;
    }
}

function logout_admin(): void
{
    unset($_SESSION['admin_id']);
}
