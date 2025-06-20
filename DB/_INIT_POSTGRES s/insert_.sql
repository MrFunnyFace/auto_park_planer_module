-- 1. Водители
INSERT INTO drivers (dr_name, dr_born, dr_experience, dr_category) VALUES
('Иванов Иван', '1980-03-12', 20, 'B'),
('Петров Петр', '1985-07-22', 15, 'C'),
('Сидоров Алексей', '1990-01-30', 10, 'D'),
('Кузнецов Виктор', '1982-11-14', 18, 'B'),
('Фёдоров Артем', '1979-06-17', 22, 'C');

-- 2. Автомобили
INSERT INTO cars (car_gosnomer, car_vin, car_model, car_fixed_driver, car_status, car_mileage) VALUES
('A123BC777', '1HGCM82633A004352', 'Toyota Corolla', NULL, 'Available', 120000),
('B234CD777', '2T1BR32E54C123456', 'Hyundai Solaris', NULL, 'Available', 85000),
('C345DE777', '3VWFE21C04M000001', 'KAMAZ 5320', 1, 'Available', 110000);

-- 3. Медосмотры
INSERT INTO medical (med_driver, med_date, med_status, med_doctor_name) VALUES
(1, '2025-03-12', 'Allowed', 'Доктор Котова'),
(1, '2025-04-12', 'Not allowed (Intoxication)', 'Доктор Иванова');

-- 4. Ремонты
INSERT INTO repairs (rep_car, rep_driver, rep_status, rep_date_reported, rep_reason) VALUES
(1, 1, 'Inspection required', '2025-04-15', 'Шумы в двигателе');

-- 5. Заказы
INSERT INTO orders (ord_client_name, ord_client_phone, ord_pickup_address, ord_delivery_address, ord_distance, ord_cargo_description, ord_cargo_weight, ord_driver, ord_car, ord_scheduled_date, ord_status) VALUES
('ООО "Транспорт"', '+79001234567', 'ул. Пушкина, 10', 'пр. Ленина, 25', 25.5, 'Грузы категории A', 500.00, 1, 1, '2025-04-10', 'Created');

-- 6. Поездка (выполненный заказ с пробегом)
INSERT INTO trips (trip_order, trip_driver, trip_car, trip_start_date, trip_start_mileage, trip_end_date, trip_end_mileage, trip_fuel_consumed, trip_status)
VALUES (1, 1, 1, '2025-04-10', 120000, '2025-04-10', 120025, 10.5, 'Completed');

-- 7. Пользователи системы (добавлено для авторизации)
INSERT INTO users (user_name, email, _password, _role) VALUES
('planner1', 'planner@example.com', decode('706c616e6e657231', 'hex'), 'Scheduler'),
('admin1', 'admin@example.com', decode('61646d696e313233', 'hex'), 'Admin');

