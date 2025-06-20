-- пользователи
INSERT INTO users (user_name, email, _password, _role) VALUES
('admin', 'admin@autopark.ru', decode('admin123', 'escape'), 'Admin'),
('planer1','planer@a.a',decode('planer','escape'),'Scheduler'),
('dispatcher1', 'dispatcher@autopark.ru', decode('disp123', 'escape'), 'Dispatcher'),
('mechanic1', 'mechanic@autopark.ru', decode('mech123', 'escape'), 'Mechanic'),
('doctor1', 'doctor@autopark.ru', decode('doc123', 'escape'), 'Doctor');

-- Водители
INSERT INTO drivers (dr_name, dr_born, dr_experience, dr_category, dr_phone, dr_address) VALUES
('Иван Иванов', '1980-05-12', 10, 'B', '+49 170 1234567', 'Frankfurt am Main'),
('Мария Смирнова', '1990-07-23', 5, 'B', '+49 160 7654321', 'Frankfurt am Main'),
('Олег Петров', '1985-11-30', 8, 'C', '+49 152 5551234', 'Offenbach'),
('Анна Кузнецова', '1978-03-15', 15, 'B', '+49 162 9998888', 'Mainz'),
('Дмитрий Соколов', '1992-09-01', 4, 'C', '+49 170 1112222', 'Wiesbaden'),
('Елена Новикова', '1988-12-05', 7, 'B', '+49 151 3334444', 'Hanau'),
('Сергей Орлов', '1975-01-20', 20, 'C', '+49 160 7776665', 'Darmstadt'),
('Наталья Фёдорова', '1995-06-18', 3, 'B', '+49 171 2223334', 'Frankfurt am Main'),
('Алексей Морозов', '1982-02-10', 12, 'C', '+49 152 4445556', 'Offenbach'),
('Светлана Павлова', '1991-10-29', 6, 'B', '+49 162 6667778', 'Wiesbaden'),
('Виктор Козлов', '1979-08-14', 14, 'C', '+49 170 8889990', 'Mainz'),
('Ольга Романова', '1987-04-27', 9, 'B', '+49 151 2221113', 'Darmstadt'),
('Роман Гусев', '1993-11-11', 2, 'B', '+49 160 3332221', 'Hanau'),
('Юлия Зайцева', '1984-07-07', 11, 'C', '+49 171 4443332', 'Frankfurt am Main'),
('Игорь Лебедев', '1977-12-31', 18, 'C', '+49 152 5556667', 'Offenbach');

-- Машины
INSERT INTO cars (car_gosnomer, car_vin, car_model, car_year, car_fixed_driver, car_status, car_mileage, car_fuel_type, car_capacity)
VALUES
('F-M 1234', '1HGCM82633A004001', 'VW Transporter', 2015, 1, 'Available', 120000, 'Diesel', 3.5),
('F-M 5678', '2HGCM82633A004002', 'Mercedes Sprinter', 2018, 2, 'Available', 80000, 'Diesel', 4.0),
('OF-B 100', '3HGCM82633A004003', 'Ford Transit', 2016, 3, 'In use', 150000, 'Diesel', 3.5),
('F-M 2345', '4HGCM82633A004004', 'Renault Master', 2017, 4, 'Maintenance', 90000, 'Diesel', 3.5),
('WI-E 300', '5HGCM82633A004005', 'Fiat Ducato', 2014, NULL, 'Available', 200000, 'Diesel', 4.5),
('OF-B 200', '6HGCM82633A004006', 'Peugeot Boxer', 2019, 5, 'Available', 60000, 'Diesel', 4.0),
('DA-T 500', '7HGCM82633A004007', 'Opel Movano', 2020, 6, 'Available', 50000, 'Diesel', 4.0),
('WI-E 400', '8HGCM82633A004008', 'Iveco Daily', 2013, NULL, 'Repair', 220000, 'Diesel', 5.0),
('OF-B 300', '9HGCM82633A004009', 'Citroen Jumper', 2016, 7, 'In use', 140000, 'Diesel', 3.5),
('DA-T 600', 'AHGCM82633A004010', 'MAN TGE', 2021, 8, 'Available', 30000, 'Diesel', 4.0);

-- Медосмотры
INSERT INTO medical (med_driver, med_date, med_status, med_doctor_name, med_notes) VALUES
(1, '2025-01-10', 'Allowed', 'Dr. Müller', 'OK'),
(2, '2025-02-20', 'Not allowed (Health)', 'Dr. Schmidt', 'Ортопедическое обследование'),
(3, '2025-03-15', 'Allowed', 'Dr. Becker', ''),
(4, '2025-04-05', 'Allowed', 'Dr. Wagner', 'Рекомендовано укрепление зрения'),
(5, '2025-05-12', 'Allowed', 'Dr. Müller', ''),
(6, '2025-01-25', 'Allowed', 'Dr. Schmidt', ''),
(7, '2025-03-30', 'Not allowed (Intoxication)', 'Dr. Becker', 'Повторный экзамен через 1 неделю'),
(8, '2025-02-14', 'Allowed', 'Dr. Wagner', ''),
(9, '2025-04-20', 'Allowed', 'Dr. Müller', ''),
(10, '2025-05-30', 'Allowed', 'Dr. Schmidt', '');

-- Топливо
INSERT INTO fuel_consumption (fuel_car, fuel_consumption_liters, fuel_date, fuel_cost, fuel_station) VALUES
(1,50.00,'2025-06-01',75.00,'Shell'),
(2,45.00,'2025-06-02',68.00,'Aral'),
(3,60.00,'2025-06-03',90.00,'Jet'),
(4,55.00,'2025-06-04',82.00,'Total'),
(5,70.00,'2025-06-05',105.00,'Shell');

-- ТО
INSERT INTO maintenance (TO_car, TO_test_date, TO_mileage, TO_type, TO_status, TO_description, TO_cost) VALUES
(1,'2025-06-05',120000,'Periodic','Scheduled','Регулярный техосмотр',200.00),
(2,'2025-06-10',80000,'Daily','Completed','Ежедневная проверка',50.00),
(3,'2025-06-11',150000,'Seasonal','In progress','Проверка коробки передач',300.00);

-- Путевые листы
INSERT INTO travel_sheets (trs_car, trs_driver, trs_medical, trs_date_exit, trs_time_exit, trs_mileage_exit, trs_date_return, trs_time_return, trs_mileage_return, trs_fuel_issued, trs_status)
VALUES
(1,1,1,'2025-06-01','08:00',120000,'2025-06-01','18:00',120150,50.00,'Completed'),
(2,2,2,'2025-06-02','09:00',80000,'2025-06-02','17:00',80100,45.00,'Completed'),
(3,3,3,'2025-06-03','07:30',150000,NULL,NULL,NULL,60.00,'Active');

-- Заказы
INSERT INTO orders (ord_client_name, ord_client_phone, ord_pickup_address, ord_delivery_address, ord_distance, ord_cargo_description, ord_cargo_weight, ord_driver, ord_car, ord_scheduled_date, ord_scheduled_time, ord_status, ord_cost) VALUES
('Firma A','+49 123','Frankfurt','Wiesbaden',60.5,'Документы',0.5,1,1,'2025-06-12','10:00','Created',120.00),
('Firma B','+49 234','Offenbach','Mainz',45.2,'Оборудование',1.2,2,2,'2025-06-13','11:30','Scheduled',150.00),
('Firma C','+49 345','Hanau','Darmstadt',30.0,'Продукты',0.8,3,3,'2025-06-14','09:00','Delivered',90.00);

-- Поездки
INSERT INTO trips (trip_order, trip_driver, trip_car, trip_start_date, trip_start_time, trip_end_date, trip_end_time, trip_start_mileage, trip_end_mileage, trip_fuel_consumed, trip_status) VALUES
(1,1,1,'2025-06-12','10:00','2025-06-12','12:00',120000,120100,10.00,'Completed'),
(2,2,2,'2025-06-13','11:30','2025-06-13','13:00',80000,80100,9.00,'Completed'),
(3,3,3,'2025-06-14','09:00',NULL,NULL,NULL,NULL,NULL,'Planned');

-- Ремонты
INSERT INTO repairs (rep_car, rep_driver, rep_status, rep_date_reported, rep_date_started, rep_date_completed, rep_reason, rep_description, rep_cost) VALUES
(4,4,'Inspection required','2025-06-07',NULL,NULL,'Проблемы с тормозами','Требуется диагностика',NULL),
(5,5,'On-site repair','2025-06-08','2025-06-09',NULL,'Проблемы с рулевым управлением','Ремонт в процессе',350.00);

-- Маршруты
INSERT INTO routes (route_name, route_start_address, route_end_address, route_distance, route_estimated_time, route_waypoints, route_restrictions) VALUES
('Frankfurt–Wiesbaden','Frankfurt','Wiesbaden',40.0,45,'[]','Нет'),
('Offenbach–Mainz','Offenbach','Mainz',55.0,60,'[]','Дорожные работы');

-- Лимиты
INSERT INTO limits (limit_type, limit_parameter, limit_value, limit_car, limit_driver, limit_description, warning_threshold) VALUES
('Daily','Mileage',500.0,1,NULL,'Макс дневной пробег',80.0),
('Daily','Mileage',450.0,2,NULL,'Лимит маршрута по заказу',85.0);

-- Логирование событий
INSERT INTO activity_logs (log_type, log_entity_id, log_action, log_description)
VALUES 
('order', 1, 'created', 'Новый заказ №1 создан'),
('car', 5, 'departure', 'Автомобиль №5 выехал с базы'),
('maintenance', 3, 'completed', 'ТО завершено для машины №3'),
('driver', 7, 'medical_check', 'Медосмотр пройден успешно');
