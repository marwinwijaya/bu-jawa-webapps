<?php

declare(strict_types=1);

require_once __DIR__ . '/db.php';

function e(?string $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}

function format_rupiah(int|float|string $value): string
{
    return 'Rp ' . number_format((float) $value, 0, ',', '.');
}

function today_date(): string
{
    return date('Y-m-d');
}

function tomorrow_date(): string
{
    return date('Y-m-d', strtotime('+1 day'));
}

function current_flash(): ?array
{
    if (!isset($_SESSION['flash'])) {
        return null;
    }

    $flash = $_SESSION['flash'];
    unset($_SESSION['flash']);

    return $flash;
}

function set_flash(string $type, string $message): void
{
    $_SESSION['flash'] = [
        'type' => $type,
        'message' => $message,
    ];
}

function csrf_token(): string
{
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }

    return $_SESSION['csrf_token'];
}

function verify_csrf(): void
{
    $token = $_POST['csrf_token'] ?? '';

    if (!hash_equals($_SESSION['csrf_token'] ?? '', $token)) {
        http_response_code(419);
        exit('Permintaan tidak valid. Silakan muat ulang halaman.');
    }
}

function fetch_public_menu_today(): array
{
    $sql = <<<SQL
        SELECT m.*, k.nama_kategori
        FROM menu m
        JOIN kategori k ON k.id = m.kategori_id
        WHERE m.is_active = 1
          AND (
            m.tipe_hari = 'hari_ini'
            OR m.tanggal_tampil = :today
          )
        ORDER BY k.nama_kategori, m.nama_menu
    SQL;

    $stmt = get_db()->prepare($sql);
    $stmt->execute(['today' => today_date()]);

    return $stmt->fetchAll();
}

function fetch_public_menu_upcoming(): array
{
    $sql = <<<SQL
        SELECT m.*, k.nama_kategori
        FROM menu m
        JOIN kategori k ON k.id = m.kategori_id
        WHERE m.is_active = 1
          AND (
            m.tipe_hari = 'besok'
            OR m.tanggal_tampil >= :tomorrow
          )
        ORDER BY m.tanggal_tampil ASC, k.nama_kategori, m.nama_menu
    SQL;

    $stmt = get_db()->prepare($sql);
    $stmt->execute(['tomorrow' => tomorrow_date()]);

    return $stmt->fetchAll();
}

function fetch_categories(): array
{
    $stmt = get_db()->query('SELECT * FROM kategori ORDER BY nama_kategori');

    return $stmt->fetchAll();
}

function fetch_all_menu_options(): array
{
    $stmt = get_db()->query(
        'SELECT m.id, m.nama_menu, m.is_active, m.tipe_hari, m.tanggal_tampil, k.nama_kategori
         FROM menu m
         JOIN kategori k ON k.id = m.kategori_id
         ORDER BY m.nama_menu ASC'
    );

    return $stmt->fetchAll();
}

function fetch_menu_by_id(int $id): ?array
{
    $stmt = get_db()->prepare('SELECT * FROM menu WHERE id = :id LIMIT 1');
    $stmt->execute(['id' => $id]);
    $menu = $stmt->fetch();

    return $menu ?: null;
}

function fetch_admin_menu(array $filters = []): array
{
    $conditions = [];
    $params = [];

    if (($filters['kategori_id'] ?? '') !== '') {
        $conditions[] = 'm.kategori_id = :kategori_id';
        $params['kategori_id'] = (int) $filters['kategori_id'];
    }

    if (($filters['is_active'] ?? '') !== '') {
        $conditions[] = 'm.is_active = :is_active';
        $params['is_active'] = (int) $filters['is_active'];
    }

    if (($filters['tanggal_tampil'] ?? '') !== '') {
        $conditions[] = 'm.tanggal_tampil = :tanggal_tampil';
        $params['tanggal_tampil'] = $filters['tanggal_tampil'];
    }

    if (($filters['tipe_hari'] ?? '') !== '') {
        $conditions[] = 'm.tipe_hari = :tipe_hari';
        $params['tipe_hari'] = $filters['tipe_hari'];
    }

    $where = $conditions ? 'WHERE ' . implode(' AND ', $conditions) : '';

    $sql = <<<SQL
        SELECT m.*, k.nama_kategori
        FROM menu m
        JOIN kategori k ON k.id = m.kategori_id
        {$where}
        ORDER BY m.tanggal_tampil ASC, m.updated_at DESC, m.nama_menu ASC
    SQL;

    $stmt = get_db()->prepare($sql);
    $stmt->execute($params);

    return $stmt->fetchAll();
}

function fetch_dashboard_summary(): array
{
    $pdo = get_db();

    $todayStmt = $pdo->prepare(
        "SELECT COUNT(*) FROM menu WHERE is_active = 1 AND (tipe_hari = 'hari_ini' OR tanggal_tampil = :today)"
    );
    $todayStmt->execute(['today' => today_date()]);

    $tomorrowStmt = $pdo->prepare(
        "SELECT COUNT(*) FROM menu WHERE is_active = 1 AND (tipe_hari = 'besok' OR tanggal_tampil >= :tomorrow)"
    );
    $tomorrowStmt->execute(['tomorrow' => tomorrow_date()]);

    return [
        'hari_ini' => (int) $todayStmt->fetchColumn(),
        'besok' => (int) $tomorrowStmt->fetchColumn(),
        'total' => (int) $pdo->query('SELECT COUNT(*) FROM menu')->fetchColumn(),
        'nonaktif' => (int) $pdo->query('SELECT COUNT(*) FROM menu WHERE is_active = 0')->fetchColumn(),
    ];
}

function fetch_menu_for_date_group(string $mode): array
{
    if ($mode === 'hari_ini') {
        $sql = <<<SQL
            SELECT m.*, k.nama_kategori
            FROM menu m
            JOIN kategori k ON k.id = m.kategori_id
            WHERE m.is_active = 1
              AND (m.tipe_hari = 'hari_ini' OR m.tanggal_tampil = :date_value)
            ORDER BY k.nama_kategori, m.nama_menu
        SQL;
        $dateValue = today_date();
    } else {
        $sql = <<<SQL
            SELECT m.*, k.nama_kategori
            FROM menu m
            JOIN kategori k ON k.id = m.kategori_id
            WHERE m.is_active = 1
              AND (m.tipe_hari = 'besok' OR m.tanggal_tampil >= :date_value)
            ORDER BY m.tanggal_tampil ASC, k.nama_kategori, m.nama_menu
        SQL;
        $dateValue = tomorrow_date();
    }

    $stmt = get_db()->prepare($sql);
    $stmt->execute(['date_value' => $dateValue]);

    return $stmt->fetchAll();
}

function save_menu(array $data, ?int $id = null): void
{
    $pdo = get_db();
    $statusKetersediaan = (string) ($data['status_ketersediaan'] ?? 'tersedia');
    $tipeHari = (string) ($data['tipe_hari'] ?? 'hari_ini');

    if (!in_array($statusKetersediaan, ['tersedia', 'habis'], true)) {
        $statusKetersediaan = 'tersedia';
    }

    if (!in_array($tipeHari, ['hari_ini', 'besok', 'jadwal'], true)) {
        $tipeHari = 'hari_ini';
    }

    $payload = [
        'nama_menu' => trim((string) ($data['nama_menu'] ?? '')),
        'kategori_id' => (int) ($data['kategori_id'] ?? 0),
        'deskripsi' => trim((string) ($data['deskripsi'] ?? '')),
        'harga' => (int) ($data['harga'] ?? 0),
        'gambar' => trim((string) ($data['gambar'] ?? '')),
        'is_active' => isset($data['is_active']) ? 1 : 0,
        'status_ketersediaan' => $statusKetersediaan,
        'tanggal_tampil' => (string) ($data['tanggal_tampil'] ?? today_date()),
        'tipe_hari' => $tipeHari,
    ];

    if ($id === null) {
        $stmt = $pdo->prepare(
            'INSERT INTO menu (nama_menu, kategori_id, deskripsi, harga, gambar, is_active, status_ketersediaan, tanggal_tampil, tipe_hari, created_at, updated_at)
             VALUES (:nama_menu, :kategori_id, :deskripsi, :harga, :gambar, :is_active, :status_ketersediaan, :tanggal_tampil, :tipe_hari, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'
        );
        $stmt->execute($payload);

        return;
    }

    $payload['id'] = $id;

    $stmt = $pdo->prepare(
        'UPDATE menu
         SET nama_menu = :nama_menu,
             kategori_id = :kategori_id,
             deskripsi = :deskripsi,
             harga = :harga,
             gambar = :gambar,
             is_active = :is_active,
             status_ketersediaan = :status_ketersediaan,
             tanggal_tampil = :tanggal_tampil,
             tipe_hari = :tipe_hari,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = :id'
    );
    $stmt->execute($payload);
}

function schedule_menu_for_day(int $id, string $targetDay, ?string $date = null): void
{
    $allowedDays = ['hari_ini', 'besok', 'jadwal'];

    if (!in_array($targetDay, $allowedDays, true)) {
        $targetDay = 'besok';
    }

    if ($date === null || $date === '') {
        $date = $targetDay === 'hari_ini' ? today_date() : tomorrow_date();
    }

    $stmt = get_db()->prepare(
        'UPDATE menu
         SET is_active = 1,
             tipe_hari = :tipe_hari,
             tanggal_tampil = :tanggal_tampil,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = :id'
    );
    $stmt->execute([
        'tipe_hari' => $targetDay,
        'tanggal_tampil' => $date,
        'id' => $id,
    ]);
}
