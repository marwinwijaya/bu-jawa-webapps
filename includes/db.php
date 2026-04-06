<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';

function get_db(): PDO
{
    static $pdo = null;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $shouldInitialize = !file_exists(DB_PATH);

    $pdo = new PDO('sqlite:' . DB_PATH);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    if ($shouldInitialize) {
        initialize_database($pdo);
    }

    return $pdo;
}

function initialize_database(PDO $pdo): void
{
    $schemaFile = __DIR__ . '/../database/schema.sql';

    if (!file_exists($schemaFile)) {
        throw new RuntimeException('File schema database tidak ditemukan.');
    }

    $schema = file_get_contents($schemaFile);

    if ($schema === false) {
        throw new RuntimeException('Gagal membaca schema database.');
    }

    $pdo->exec($schema);
}
