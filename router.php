<?php

declare(strict_types=1);

$requestPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';

$routes = [
    '/' => __DIR__ . '/index.php',
    '/index.html' => __DIR__ . '/index.php',
    '/inner-page.html' => __DIR__ . '/index.php',
    '/admin/login.html' => __DIR__ . '/admin/login.php',
    '/admin/index.html' => __DIR__ . '/admin/index.php',
    '/admin/menu-form.html' => __DIR__ . '/admin/menu_form.php',
    '/admin/toggle-menu.html' => __DIR__ . '/admin/toggle_menu.php',
    '/admin/delete-menu.html' => __DIR__ . '/admin/delete_menu.php',
    '/admin/schedule-menu.html' => __DIR__ . '/admin/schedule_menu.php',
    '/admin/logout.html' => __DIR__ . '/admin/logout.php',
];

if (isset($routes[$requestPath])) {
    require $routes[$requestPath];
    return true;
}

$fullPath = __DIR__ . $requestPath;

if ($requestPath !== '/' && is_file($fullPath)) {
    return false;
}

http_response_code(404);
echo 'Halaman tidak ditemukan.';
return true;
