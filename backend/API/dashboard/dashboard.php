<?php
// Подключение к базе данных и другим зависимостям
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../utils/auth.php';
require_once __DIR__ . '/../../utils/response.php';

ini_set('log_errors', 1);
ini_set('error_log', 'php://stdout');

error_log("dashboard");

class DashboardAPI {
    private $db;
    private $auth;

    public function __construct() {
        global $pdo;
        $this->db = $pdo;
        $this->auth = new AuthUtils();
    }

    public function handleRequest() {
        try {
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }

            $user = $this->auth->validateToken();
            if (!$user) {
                Response::unauthorized('Требуется авторизация');
                return;
            }

            $action = $_GET['action'] ?? '';
            switch ($action) {
                case 'getDashboardData':
                    $this->getDashboardData($user);
                    break;
                case 'getCars':
                    $this->getCarsData($user);
                    break;
                case 'getDrivers':
                    $this->getDriversData($user);
                    break;
                case 'getOrders':
                    $this->getOrdersData($user);
                    break;
                case 'getExpenses':
                    $this->getExpensesData($user);
                    break;
                case 'getRecentActivity':
                    $this->getRecentActivity($user);
                    break;
                default:
                    Response::error('Неизвестное действие', 400);
            }

        } catch (Exception $e) {
            error_log("Dashboard API Error: " . $e->getMessage());
            Response::error('Внутренняя ошибка сервера: ' . $e->getMessage(), 500);
        }
    }

    private function getDashboardData($user) {
        $data = [
            'cars' => $this->calculateCarsStats(),
            'drivers' => $this->calculateDriversStats(),
            'orders' => $this->calculateOrdersStats(),
            'expenses' => $this->calculateExpensesStats(),
            'recentActivity' => $this->getRecentActivityData()
        ];
        $this->logActivity($user['ID'], 'dashboard', 0, 'dashboard_view', 'Dashboard data requested');

        Response::success($data);
    }
    
    private function calculateCarsStats() {
        try {
            $totalQuery = "SELECT COUNT(*) as total FROM cars WHERE car_status != 'Out of service'";
            $totalResult = $this->db->query($totalQuery);
            $total = $totalResult->fetch(PDO::FETCH_ASSOC)['total'];

            $statusQuery = "
                SELECT car_status, COUNT(*) as count 
                FROM cars 
                WHERE car_status != 'Out of service'
                GROUP BY car_status
            ";
            $statusResult = $this->db->query($statusQuery);
            $statusData = $statusResult->fetchAll(PDO::FETCH_ASSOC);

            $stats = [
                'total' => (int)$total,
                'inUse' => 0,
                'maintenance' => 0,
                'repair' => 0,
                'available' => 0
            ];

            foreach ($statusData as $status) {
                switch ($status['car_status']) {
                    case 'In use':
                        $stats['inUse'] = (int)$status['count'];
                        break;
                    case 'Maintenance':
                        $stats['maintenance'] = (int)$status['count'];
                        break;
                    case 'Repair':
                        $stats['repair'] = (int)$status['count'];
                        break;
                    case 'Available':
                        $stats['available'] = (int)$status['count'];
                        break;
                }
            }

            return $stats;

        } catch (Exception $e) {
            error_log("Error calculating cars stats: " . $e->getMessage());
            return [
                'total' => 0,
                'inUse' => 0,
                'maintenance' => 0,
                'repair' => 0,
                'available' => 0
            ];
        }
    }

    private function calculateDriversStats() {
        try {
            $totalQuery = "SELECT COUNT(*) as total FROM drivers WHERE is_active = true";
            $totalResult = $this->db->query($totalQuery);
            $total = $totalResult->fetch(PDO::FETCH_ASSOC)['total'];

            $medicalQuery = "
                SELECT 
                    m.med_status,
                    COUNT(DISTINCT m.med_driver) as count
                FROM medical m
                INNER JOIN (
                    SELECT med_driver, MAX(med_date) as latest_date
                    FROM medical 
                    WHERE med_date >= CURRENT_DATE - INTERVAL '30 days'
                    GROUP BY med_driver
                ) latest ON m.med_driver = latest.med_driver AND m.med_date = latest.latest_date
                INNER JOIN drivers d ON m.med_driver = d.dr_shifr
                WHERE d.is_active = true
                GROUP BY m.med_status
            ";

            $medicalResult = $this->db->query($medicalQuery);
            $medicalData = $medicalResult->fetchAll(PDO::FETCH_ASSOC);

            $stats = [
                'total' => (int)$total,
                'allowed' => 0,
                'notAllowed' => 0
            ];

            foreach ($medicalData as $medical) {
                if ($medical['med_status'] === 'Allowed') {
                    $stats['allowed'] = (int)$medical['count'];
                } else {
                    $stats['notAllowed'] += (int)$medical['count'];
                }
            }

            return $stats;

        } catch (Exception $e) {
            error_log("Error calculating drivers stats: " . $e->getMessage());
            return [
                'total' => 0,
                'allowed' => 0,
                'notAllowed' => 0
            ];
        }
    }

    private function calculateOrdersStats() {
        try {
            $stmt = $this->db->query("
                SELECT 
                    COUNT(*) AS total,
                    COUNT(*) FILTER (WHERE ord_status = 'Completed') AS completed,
                    COUNT(*) FILTER (WHERE ord_status = 'In progress') AS inProgress,
                    COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE) AS createdToday,
                    SUM(ord_cost) AS revenue,
                    AVG(ord_cost) AS avgCost
                FROM orders
            ");
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Orders stats error: " . $e->getMessage());
            return [];
        }
    }

    private function calculateExpensesStats() {
        try {
            $stmt = $this->db->query("
                SELECT
                    COALESCE((SELECT SUM(fuel_cost) FROM fuel_consumption), 0) AS fuel,
                    COALESCE((SELECT SUM(rep_cost) FROM repairs), 0) AS repair,
                    COALESCE((SELECT SUM(TO_cost) FROM maintenance), 0) AS maintenance
            ");
            $data = $stmt->fetch(PDO::FETCH_ASSOC);
            $data['total'] = $data['fuel'] + $data['repair'] + $data['maintenance'];
            $data['trend'] = '-15%'; // пока заглушка
            return $data;
        } catch (Exception $e) {
            error_log("Expenses stats error: " . $e->getMessage());
            return [];
        }
    }


    private function getRecentActivityData() {
        try {
            $stmt = $this->db->query("
                SELECT 
                    log_type AS type, 
                    log_action AS action, 
                    log_description AS description, 
                    log_created_at AS created_at
                FROM activity_logs
                ORDER BY log_created_at DESC
                LIMIT 20
            ");
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Recent activity error: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Последние события в системе
     */
    // private function getRecentActivityData() {
    //     try {
    //         $query = "
    //             SELECT 
    //                 log_action,
    //                 log_details,
    //                 log_date,
    //                 log_entity_type
    //             FROM system_logs 
    //             WHERE log_date >= CURRENT_DATE
    //             ORDER BY log_date DESC 
    //             LIMIT 10
    //         ";
            
    //         $result = $this->db->query($query);
    //         $logs = $result->fetchAll(PDO::FETCH_ASSOC);
            
    //         $activities = [];
    //         foreach ($logs as $log) {
    //             $time = date('H:i', strtotime($log['log_date']));
    //             $description = $this->formatActivityDescription($log);
    //             $type = $this->getActivityType($log['log_action']);
                
    //             $activities[] = [
    //                 'time' => $time,
    //                 'description' => $description,
    //                 'type' => $type
    //             ];
    //         }
            
    //         return $activities;
            
    //     } catch (Exception $e) {
    //         error_log("Error getting recent activity: " . $e->getMessage());
    //         return [];
    //     }
    // }
    
    /**
     * Форматирование описания активности
     */
    private function formatActivityDescription($log) {
        $details = json_decode($log['log_details'], true);
        
        switch ($log['log_action']) {
            case 'shift_start':
                return "Водитель {$details['driver_name']} начал смену на автомобиле {$details['car_number']}";
            
            case 'maintenance_scheduled':
                return "Автомобиль {$details['car_number']} отправлен на техническое обслуживание";
            
            case 'order_completed':
                return "Заказ #{$details['order_id']} успешно выполнен водителем {$details['driver_name']}";
            
            case 'limit_exceeded':
                return "Превышен лимит {$details['limit_type']} для {$details['entity_type']} {$details['entity_name']}";
            
            case 'repair_started':
                return "Начат ремонт автомобиля {$details['car_number']}";
            
            case 'fuel_consumed':
                return "Заправка автомобиля {$details['car_number']} - {$details['liters']}л";
            
            case 'medical_check':
                return "Медосмотр водителя {$details['driver_name']} - {$details['status']}";
            
            default:
                return $log['log_action'] . ' - ' . ($details['description'] ?? 'Системное событие');
        }
    }
    
    /**
     * Определение типа активности для стилизации
     */
    private function getActivityType($action) {
        $typeMap = [
            'shift_start' => 'shift_start',
            'maintenance_scheduled' => 'maintenance',
            'order_completed' => 'order_completed',
            'limit_exceeded' => 'limit_exceeded',
            'repair_started' => 'repair',
            'fuel_consumed' => 'fuel',
            'medical_check' => 'medical'
        ];
        
        return $typeMap[$action] ?? 'default';
    }
    
    /**
     * Логирование активности
     */
    private function logActivity($userId, $entityType, $entityId, $action, $description) {
        try {
            $stmt = $this->db->prepare("
                INSERT INTO system_logs 
                (log_entity_type, log_entity_id, log_action, log_details, log_user_id, log_ip_address)
                VALUES (:type, :id, :action, :details, :user, :ip)
            ");
            $stmt->execute([
                ':type' => $entityType,
                ':id' => $entityId,
                ':action' => $action,
                ':details' => json_encode(['description' => $description]),
                ':user' => $userId,
                ':ip' => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1'
            ]);
        } catch (Exception $e) {
            error_log("Error logging activity: " . $e->getMessage());
        }
    }

    
    /**
     * Получение данных по автомобилям (детальная информация)
     */
    private function getCarsData($user) {
        try {
            $query = "
                SELECT 
                    c.car_shifr,
                    c.car_gosnomer,
                    c.car_model,
                    c.car_status,
                    c.car_mileage,
                    d.dr_name as driver_name,
                    ts.trs_date_exit as last_trip_date
                FROM cars c
                LEFT JOIN drivers d ON c.car_fixed_driver = d.dr_shifr
                LEFT JOIN travel_sheets ts ON c.car_shifr = ts.trs_car
                WHERE c.car_status != 'Out of service'
                ORDER BY c.car_gosnomer
            ";
            
            $result = $this->db->query($query);
            $cars = $result->fetchAll(PDO::FETCH_ASSOC);
            
            Response::success($cars);
            
        } catch (Exception $e) {
            error_log("Error getting cars data: " . $e->getMessage());
            Response::error('Ошибка получения данных автомобилей', 500);
        }
    }
    
    /**
     * Получение данных по водителям (детальная информация)
     */
    private function getDriversData($user) {
        try {
            $query = "
                SELECT 
                    d.dr_shifr,
                    d.dr_name,
                    d.dr_experience,
                    d.dr_category,
                    d.dr_phone,
                    m.med_status,
                    m.med_date as last_medical_date,
                    c.car_gosnomer as assigned_car
                FROM drivers d
                LEFT JOIN medical m ON d.dr_shifr = m.med_driver 
                    AND m.med_date = (
                        SELECT MAX(med_date) 
                        FROM medical 
                        WHERE med_driver = d.dr_shifr
                    )
                LEFT JOIN cars c ON d.dr_shifr = c.car_fixed_driver
                WHERE d.is_active = true
                ORDER BY d.dr_name
            ";
            
            $result = $this->db->query($query);
            $drivers = $result->fetchAll(PDO::FETCH_ASSOC);
            
            Response::success($drivers);
            
        } catch (Exception $e) {
            error_log("Error getting drivers data: " . $e->getMessage());
            Response::error('Ошибка получения данных водителей', 500);
        }
    }
    
    /**
     * Получение данных по заказам (детальная информация)
     */
    private function getOrdersData($user) {
        try {
            $today = date('Y-m-d');
            
            $query = "
                SELECT 
                    o.ord_shifr,
                    o.ord_client_name,
                    o.ord_pickup_address,
                    o.ord_delivery_address,
                    o.ord_scheduled_time,
                    o.ord_status,
                    d.dr_name as driver_name,
                    c.car_gosnomer as car_number
                FROM orders o
                LEFT JOIN drivers d ON o.ord_driver = d.dr_shifr
                LEFT JOIN cars c ON o.ord_car = c.car_shifr
                WHERE o.ord_scheduled_date = :today
                ORDER BY o.ord_scheduled_time
            ";
            
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':today', $today);
            $stmt->execute();
            $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            Response::success($orders);
            
        } catch (Exception $e) {
            error_log("Error getting orders data: " . $e->getMessage());
            Response::error('Ошибка получения данных заказов', 500);
        }
    }
    
    /**
     * Получение данных по расходам (детальная информация)
     */
    private function getExpensesData($user) {
        try {
            $currentMonth = date('Y-m');
            
            // Детальная информация по расходам
            $query = "
                SELECT 
                    'fuel' as expense_type,
                    SUM(fuel_cost) as total_cost,
                    COUNT(*) as count,
                    AVG(fuel_cost) as avg_cost
                FROM fuel_consumption 
                WHERE DATE_TRUNC('month', fuel_date) = DATE_TRUNC('month', CURRENT_DATE)
                
                UNION ALL
                
                SELECT 
                    'maintenance' as expense_type,
                    SUM(TO_cost) as total_cost,
                    COUNT(*) as count,
                    AVG(TO_cost) as avg_cost
                FROM maintenance 
                WHERE DATE_TRUNC('month', TO_test_date) = DATE_TRUNC('month', CURRENT_DATE)
                AND TO_status = 'Completed'
                
                UNION ALL
                
                SELECT 
                    'repair' as expense_type,
                    SUM(rep_cost) as total_cost,
                    COUNT(*) as count,
                    AVG(rep_cost) as avg_cost
                FROM repairs 
                WHERE DATE_TRUNC('month', rep_date_completed) = DATE_TRUNC('month', CURRENT_DATE)
                AND rep_status = 'Repair completed'
            ";
            
            $result = $this->db->query($query);
            $expenses = $result->fetchAll(PDO::FETCH_ASSOC);
            
            Response::success($expenses);
            
        } catch (Exception $e) {
            error_log("Error getting expenses data: " . $e->getMessage());
            Response::error('Ошибка получения данных расходов', 500);
        }
    }
    
    /**
     * Получение последних событий (детальная информация)
     */
    private function getRecentActivity($user) {
        try {
            $activities = $this->getRecentActivityData();
            Response::success($activities);
            
        } catch (Exception $e) {
            error_log("Error getting recent activity: " . $e->getMessage());
            Response::error('Ошибка получения последних событий', 500);
        }
    }
}

// Инициализация и обработка запроса
try {
    $dashboard = new DashboardAPI(); // без аргументов
    $dashboard->handleRequest();
} catch (Exception $e) {
    error_log("Dashboard API initialization error: " . $e->getMessage());
    Response::error('Ошибка инициализации API', 500);
}

?>