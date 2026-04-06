<?php

declare(strict_types=1);

const APP_NAME = 'Rumah Makan Bu Jawa';
const APP_PHONE = '0895-4057-18033';
const APP_OPEN_HOURS = 'Setiap hari, pukul 09.00 sampai 21.00 WIB';
const APP_MAPS_URL = 'https://maps.app.goo.gl/XNuEpTYSbn5omncMA';
const DB_PATH = __DIR__ . '/../data/rumah_makan_bu_jawa.sqlite';

date_default_timezone_set('Asia/Jakarta');

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
