
<?php
header('Content-Type: application/json');

// Получаем действие из $_GET (устанавливается роутером)
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'getDashboardData':
        // Основные данные дашборда
        echo json_encode([
            'success' => true,
            'data' => [
                'totalCars' => 25,
                'activeCars' => 18,
                'totalDrivers' => 30,
                'activeDrivers' => 22,
                'todayOrders' => 45,
                'completedOrders' => 38,
                'revenue' => 15600.50,
                'expenses' => 3200.75
            ]
        ]);
        break;
        
    case 'getCars':
        // Данные об автомобилях
        echo json_encode([
            'success' => true,
            'data' => [
                [
                    'id' => 1,
                    'model' => 'Toyota Camry',
                    'number' => 'A123BC',
                    'status' => 'active',
                    'driver' => 'Иван Петров'
                ],
                [
                    'id' => 2,
                    'model' => 'Honda Accord',
                    'number' => 'B456DE',
                    'status' => 'maintenance',
                    'driver' => null
                ]
            ]
        ]);
        break;
        
    case 'getDrivers':
        // Данные о водителях
        echo json_encode([
            'success' => true,
            'data' => [
                [
                    'id' => 1,
                    'name' => 'Иван Петров',
                    'phone' => '+7(999)123-45-67',
                    'status' => 'active',
                    'car' => 'Toyota Camry (A123BC)'
                ],
                [
                    'id' => 2,
                    'name' => 'Сергей Сидоров',
                    'phone' => '+7(999)765-43-21',
                    'status' => 'offline',
                    'car' => null
                ]
            ]
        ]);
        break;
        
    case 'getOrders':
        // Данные о заказах
        echo json_encode([
            'success' => true,
            'data' => [
                [
                    'id' => 1,
                    'customer' => 'ООО "Компания"',
                    'from' => 'ул. Ленина, 10',
                    'to' => 'ул. Советская, 25',
                    'status' => 'completed',
                    'price' => 1200.00,
                    'created_at' => '2025-06-18 10:30:00'
                ],
                [
                    'id' => 2,
                    'customer' => 'Частное лицо',
                    'from' => 'пр. Мира, 5',
                    'to' => 'ул. Гагарина, 15',
                    'status' => 'in_progress',
                    'price' => 800.00,
                    'created_at' => '2025-06-18 12:15:00'
                ]
            ]
        ]);
        break;
        
    case 'getExpenses':
        // Данные о расходах
        echo json_encode([
            'success' => true,
            'data' => [
                [
                    'id' => 1,
                    'category' => 'Топливо',
                    'amount' => 5600.00,
                    'description' => 'Заправка автопарка',
                    'date' => '2025-06-18'
                ],
                [
                    'id' => 2,
                    'category' => 'Ремонт',
                    'amount' => 2400.00,
                    'description' => 'Замена тормозных колодок',
                    'date' => '2025-06-17'
                ]
            ]
        ]);
        break;
        
    case 'getRecentActivity':
        // Последняя активность
        echo json_encode([
            'success' => true,
            'data' => [
                [
                    'id' => 1,
                    'type' => 'order_completed',
                    'message' => 'Заказ #123 выполнен водителем Иван Петров',
                    'timestamp' => '2025-06-18 14:30:00'
                ],
                [
                    'id' => 2,
                    'type' => 'car_maintenance',
                    'message' => 'Автомобиль Honda Accord (B456DE) отправлен на ТО',
                    'timestamp' => '2025-06-18 13:45:00'
                ],
                [
                    'id' => 3,
                    'type' => 'new_order',
                    'message' => 'Новый заказ #124 принят в работу',
                    'timestamp' => '2025-06-18 13:20:00'
                ]
            ]
        ]);
        break;
        
    default:
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Unknown action',
            'action' => $action
        ]);
        break;
}
?>