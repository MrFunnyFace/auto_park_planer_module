<?php
require_once 'config/cors.php';
require_once 'utils/response.php'; // <-- добавь
ini_set('log_errors', 1);
ini_set('error_log', 'php://STDOUT');

$uri = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

// Убираем query параметры из URI
$uri = parse_url($uri, PHP_URL_PATH);
if ($method === 'GET' && ($uri === '/api' || $uri === '/api/')) {
    Response::json(['message' => 'API is working']);
    exit();
}
// Роутинг
switch (true) {
    // Корневой путь
    case $uri === '/':
        http_response_code(200);
        echo json_encode([
            'message' => 'Fleet Management API Server',
            'version' => '1.0',
            'endpoints' => [
                'POST /api/auth/login' => 'User login',
                'POST /api/auth/logout' => 'User logout',
                'GET /api/dashboard/overview' => 'Dashboard overview',
                'GET /api/dashboard/cars' => 'Cars data',
                'GET /api/dashboard/drivers' => 'Drivers data',
                'GET /api/dashboard/orders' => 'Orders data',
                'GET /api/dashboard/expenses' => 'Expenses data',
                'GET /api/dashboard/activity' => 'Recent activity'
            ]
        ]);
        break;
    
    // ============ АВТОРИЗАЦИЯ ============
    case preg_match('/^\/api\/auth\/login$/', $uri):
        require 'api/auth/login.php';
        break;
        
    case preg_match('/^\/api\/auth\/logout$/', $uri):
        require 'api/auth/logout.php';
        break;
    
    // ============ DASHBOARD ============
    case preg_match('/^\/api\/dashboard\/overview$/', $uri):
        error_log("ROUTE MATCHED: /api/dashboard/overview");
        $_GET['action'] = 'getDashboardData';
        require 'api/dashboard/dashboard.php';
        break;
        
    case preg_match('/^\/api\/dashboard\/cars$/', $uri):
        $_GET['action'] = 'getCars';
        require 'api/dashboard/dashboard.php';
        break;
        
    case preg_match('/^\/api\/dashboard\/drivers$/', $uri):
        $_GET['action'] = 'getDrivers';
        require 'api/dashboard/dashboard.php';
        break;
        
    case preg_match('/^\/api\/dashboard\/orders$/', $uri):
        $_GET['action'] = 'getOrders';
        require 'api/dashboard/dashboard.php';
        break;
        
    case preg_match('/^\/api\/dashboard\/expenses$/', $uri):
        $_GET['action'] = 'getExpenses';
        require 'api/dashboard/dashboard.php';
        break;
        
    case preg_match('/^\/api\/dashboard\/activity$/', $uri):
        $_GET['action'] = 'getRecentActivity';
        require 'api/dashboard/dashboard.php';
        break;

    // 404 для всех остальных
    default:
        http_response_code(404);
        echo json_encode([
            'error' => 'Route not found',
            'requested_path' => $uri,
            'method' => $method,
            'available_endpoints' => [
                'GET /' => 'API info',
                'POST /api/auth/login' => 'User login',
                'POST /api/auth/logout' => 'User logout',
                'GET /api/dashboard/overview' => 'Dashboard overview',
                'GET /api/dashboard/cars' => 'Cars data',
                'GET /api/dashboard/drivers' => 'Drivers data',
                'GET /api/dashboard/orders' => 'Orders data',
                'GET /api/dashboard/expenses' => 'Expenses data',
                'GET /api/dashboard/activity' => 'Recent activity'
            ]
        ]);
}
?>