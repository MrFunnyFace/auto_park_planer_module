<?php
require_once '../../config/db.php';
header('Content-Type: application/json');

// Разрешаем только POST-запросы
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Получаем входные данные
$input = json_decode(file_get_contents('php://input'), true);

// Проверка обязательных полей
if (!isset($input['username'], $input['password'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email и пароль обязательны']);
    exit;
}

$username = trim($input['username']);
$password = trim($input['password']);

try {
    // Ищем пользователя по email - ИСПОЛЬЗУЕМ ПРАВИЛЬНЫЕ НАЗВАНИЯ ПОЛЕЙ
    $stmt = $pdo->prepare("SELECT id, user_name, email, _password, _role FROM users WHERE email = :email AND is_active = TRUE");
    $stmt->execute([':email' => $username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Неверный email или пользователь неактивен']);
        exit;
    }

    // Декодируем пароль из базы (он хранится как bytea/hex)
    // Используем convert_from для корректного преобразования
    $stmt_password = $pdo->prepare("SELECT convert_from(_password, 'UTF8') as plain_password FROM users WHERE id = :id");
    $stmt_password->execute([':id' => $user['id']]);
    $password_result = $stmt_password->fetch(PDO::FETCH_ASSOC);
    
    $stored_password = $password_result['plain_password'];

    if ($stored_password !== $password) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Неверный пароль']);
        exit;
    }

    // Стартуем сессию
    session_start();
    $_SESSION['user_id']    = $user['id'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['user_name']  = $user['user_name'];
    $_SESSION['user_role']  = $user['_role'];

    echo json_encode([
        'success' => true,
        'message' => 'Авторизация успешна',
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'name' => $user['user_name'],
            'role' => $user['_role']
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Ошибка сервера: ' . $e->getMessage()]);
}