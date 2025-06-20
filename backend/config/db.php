<?php
require_once __DIR__ . '/../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

$dsn = "pgsql:host={$_ENV['POSTGRES_HOST']};port={$_ENV['POSTGRES_PORT']};dbname={$_ENV['POSTGRES_DB']}";
$user = $_ENV['POSTGRES_USER'];
$pass = $_ENV['POSTGRES_PASSWORD'];

try {
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
} catch (PDOException $e) {
    die('Ошибка подключения к базе: ' . $e->getMessage());
}

$GLOBALS['pdo'] = $pdo;