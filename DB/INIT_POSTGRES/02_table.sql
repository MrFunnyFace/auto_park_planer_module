CREATE TYPE user_role AS ENUM ('Scheduler', 
                               'Dispatcher', 
                               'Mechanic', 
                               'Doctor',
                               'Admin');
-- Статус прохождения медика
CREATE TYPE medical_status AS ENUM ('Allowed',
                                    'Not allowed (Health)',
                                    'Not allowed (Intoxication)');

-- Статус автомобиля
CREATE TYPE car_status AS ENUM ('Available', 'In use', 'Maintenance', 'Repair', 'Out of service');

-- Типы ТО
CREATE TYPE TO_type_of AS ENUM ('Daily',
                                'Periodic',
                                'Seasonal');

-- Статус ТО
CREATE TYPE TO_status AS ENUM ('Scheduled', 'In progress', 'Completed', 'Cancelled');

-- Лимиты (новая таблица)
CREATE TYPE limit_type AS ENUM ('Daily', 'Weekly', 'Monthly');
CREATE TYPE limit_parameter AS ENUM ('Mileage', 'Fuel', 'Time');

-- Статус ремонта
CREATE TYPE repair_status AS ENUM ('Inspection required',
                                   'Rep. zone required',
                                   'In repair zone',
                                   'On-site repair',
                                   'Repair completed',
                                   'Ready for pickup');

-- Пользователи 
CREATE TABLE users (
    ID SERIAL PRIMARY KEY,
    user_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    _password BYTEA NOT NULL,
    _role user_role NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Водители 
CREATE TABLE drivers (
    dr_shifr SERIAL PRIMARY KEY,
    dr_name VARCHAR(100) NOT NULL,
    dr_born DATE NOT NULL,
    dr_experience INTEGER NOT NULL,
    dr_category VARCHAR(10),
    dr_phone VARCHAR(20),
    dr_address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_experience CHECK (dr_experience >= 0)
);



-- Медицинские осмотры
CREATE TABLE medical (
    med_shifr SERIAL PRIMARY KEY,
    med_driver INTEGER NOT NULL,
    med_date DATE NOT NULL,
    med_status medical_status NOT NULL,
    med_doctor_name VARCHAR(100) NOT NULL, 
    med_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (med_driver) REFERENCES drivers(dr_shifr) ON DELETE CASCADE
);

-- Автомобили 
CREATE TABLE cars (
    car_shifr SERIAL PRIMARY KEY,
    car_gosnomer CHAR(9) NOT NULL UNIQUE,
    car_vin CHAR(17) NOT NULL UNIQUE, 
    car_model VARCHAR(100) NOT NULL,
    car_year INTEGER,
    car_fixed_driver INTEGER,
    car_status car_status DEFAULT 'Available',
    car_mileage NUMERIC(10) NOT NULL DEFAULT 0,
    car_fuel_type VARCHAR(20),
    car_capacity NUMERIC(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (car_fixed_driver) REFERENCES drivers(dr_shifr),
    CONSTRAINT check_mileage CHECK (car_mileage >= 0)
);

-- Путевые листы
CREATE TABLE travel_sheets (
    trs_travel_sheets SERIAL PRIMARY KEY,
    trs_car INTEGER NOT NULL,
    trs_driver INTEGER NOT NULL,
    trs_medical INTEGER NOT NULL,
    trs_date_exit DATE NOT NULL,
    trs_time_exit TIME,
    trs_mileage_exit NUMERIC(10),
    trs_date_return DATE,
    trs_time_return TIME,
    trs_mileage_return NUMERIC(10),
    trs_fuel_issued NUMERIC(8,2),
    trs_status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trs_car) REFERENCES cars(car_shifr),
    FOREIGN KEY (trs_driver) REFERENCES drivers(dr_shifr),
    FOREIGN KEY (trs_medical) REFERENCES medical(med_shifr)
);

-- Патрулирование/расход топлива
CREATE TABLE fuel_consumption (
    fuel_shifr SERIAL PRIMARY KEY,
    fuel_car INTEGER NOT NULL,
    fuel_consumption_liters NUMERIC(8,2) NOT NULL,
    fuel_date DATE NOT NULL,
    fuel_cost NUMERIC(10,2),
    fuel_station VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fuel_car) REFERENCES cars(car_shifr),
    CONSTRAINT check_consumption CHECK (fuel_consumption_liters > 0)
);

-- Техническое обслуживание
CREATE TABLE maintenance (
    TO_shifr SERIAL PRIMARY KEY,
    TO_car INTEGER NOT NULL,
    TO_test_date DATE NOT NULL,
    TO_mileage NUMERIC(10),
    TO_type TO_type_of NOT NULL,
    TO_status TO_status DEFAULT 'Scheduled',
    TO_description TEXT,
    TO_cost NUMERIC(10,2),
    TO_mechanic_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (TO_car) REFERENCES cars(car_shifr),
    FOREIGN KEY (TO_mechanic_id) REFERENCES users(ID)
);

-- Заказы 
CREATE TABLE orders (
    ord_shifr SERIAL PRIMARY KEY,
    ord_client_name VARCHAR(200),
    ord_client_phone VARCHAR(20),
    ord_pickup_address TEXT NOT NULL,
    ord_delivery_address TEXT NOT NULL,
    ord_distance NUMERIC(10,2),
    ord_cargo_description TEXT,
    ord_cargo_weight NUMERIC(10,2),
    ord_driver INTEGER,
    ord_car INTEGER,
    ord_scheduled_date DATE NOT NULL,
    ord_scheduled_time TIME,
    ord_status VARCHAR(50) DEFAULT 'Created',
    ord_cost NUMERIC(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ord_driver) REFERENCES drivers(dr_shifr),
    FOREIGN KEY (ord_car) REFERENCES cars(car_shifr)
);

-- Отправления/поездки (departure бывший)
CREATE TABLE trips (
    trip_shifr SERIAL PRIMARY KEY,
    trip_order INTEGER,
    trip_driver INTEGER NOT NULL,
    trip_car INTEGER NOT NULL,
    trip_start_date DATE NOT NULL,
    trip_start_time TIME,
    trip_end_date DATE,
    trip_end_time TIME,
    trip_start_mileage NUMERIC(10),
    trip_end_mileage NUMERIC(10),
    trip_fuel_consumed NUMERIC(8,2),
    trip_status VARCHAR(50) DEFAULT 'In progress',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_order) REFERENCES orders(ord_shifr),
    FOREIGN KEY (trip_driver) REFERENCES drivers(dr_shifr),
    FOREIGN KEY (trip_car) REFERENCES cars(car_shifr)
);

-- Ремонт
CREATE TABLE repairs (
    rep_shifr SERIAL PRIMARY KEY,
    rep_car INTEGER NOT NULL,
    rep_driver INTEGER,
    rep_status repair_status NOT NULL,
    rep_date_reported DATE NOT NULL,
    rep_date_started DATE,
    rep_date_completed DATE,
    rep_reason TEXT NOT NULL,
    rep_description TEXT,
    rep_cost NUMERIC(10,2),
    rep_mechanic_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rep_car) REFERENCES cars(car_shifr),
    FOREIGN KEY (rep_driver) REFERENCES drivers(dr_shifr),
    FOREIGN KEY (rep_mechanic_id) REFERENCES users(ID)
);


-- Маршруты 
CREATE TABLE routes (
    route_id SERIAL PRIMARY KEY,
    route_name VARCHAR(200) NOT NULL,
    route_start_address TEXT NOT NULL,
    route_end_address TEXT NOT NULL,
    route_distance NUMERIC(10,2),
    route_estimated_time INTEGER, -- в минутах
    route_waypoints JSON,
    route_restrictions TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);




CREATE TABLE limits (
    limit_id SERIAL PRIMARY KEY,
    limit_type limit_type NOT NULL,
    limit_parameter limit_parameter NOT NULL,
    limit_value NUMERIC(10,2) NOT NULL,
    limit_car INTEGER,
    limit_driver INTEGER,
    limit_description TEXT,
    warning_threshold NUMERIC(5,2) DEFAULT 80.0, -- процент для предупреждения
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (limit_car) REFERENCES cars(car_shifr),
    FOREIGN KEY (limit_driver) REFERENCES drivers(dr_shifr),
    CONSTRAINT check_warning_threshold CHECK (warning_threshold > 0 AND warning_threshold <= 100)
);



-- Система логов 
CREATE TABLE system_logs (
    log_id SERIAL PRIMARY KEY,
    log_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    log_entity_type VARCHAR(50) NOT NULL,
    log_entity_id INTEGER NOT NULL,
    log_action VARCHAR(100) NOT NULL,
    log_details JSON,
    log_user_id INTEGER,
    log_ip_address INET,
    FOREIGN KEY (log_user_id) REFERENCES users(ID)
);

------------------------------------------
CREATE TABLE activity_logs (
    log_id SERIAL PRIMARY KEY,
    log_type VARCHAR(50) NOT NULL,
    log_entity_id INTEGER,
    log_action VARCHAR(100) NOT NULL,
    log_description TEXT,
    log_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
------------------------------------------

-- Индексы
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_drivers_active ON drivers(is_active);
CREATE INDEX idx_cars_status ON cars(car_status);
CREATE INDEX idx_cars_gosnomer ON cars(car_gosnomer);
CREATE INDEX idx_medical_driver_date ON medical(med_driver, med_date);
CREATE INDEX idx_travel_sheets_date ON travel_sheets(trs_date_exit);
CREATE INDEX idx_fuel_consumption_date ON fuel_consumption(fuel_date);
CREATE INDEX idx_orders_date ON orders(ord_scheduled_date);
CREATE INDEX idx_trips_dates ON trips(trip_start_date, trip_end_date);
CREATE INDEX idx_repairs_status ON repairs(rep_status);
CREATE INDEX idx_system_logs_date ON system_logs(log_date);
CREATE INDEX idx_system_logs_entity ON system_logs(log_entity_type, log_entity_id);

COMMENT ON TABLE users IS 'Пользователи системы';
COMMENT ON TABLE drivers IS 'Водители автопарка';
COMMENT ON TABLE cars IS 'Автомобили автопарка';
COMMENT ON TABLE medical IS 'Медицинские осмотры водителей';
COMMENT ON TABLE travel_sheets IS 'Путевые листы';
COMMENT ON TABLE fuel_consumption IS 'Расход топлива';
COMMENT ON TABLE maintenance IS 'Техническое обслуживание';
COMMENT ON TABLE orders IS 'Заказы на перевозки';
COMMENT ON TABLE trips IS 'Поездки/отправления';
COMMENT ON TABLE repairs IS 'Ремонт автомобилей';
COMMENT ON TABLE routes IS 'Маршруты';
COMMENT ON TABLE limits IS 'Лимиты и ограничения';
COMMENT ON TABLE system_logs IS 'Системные логи';

--Пометки:
--!!!! order in purpose delete and add rep_driver поменять в отчете 

-- Логика:
-- без медицинского осмотра получить путевой лист нельзя;
-- Перед выездом авто проходит ежедневное ТО;
-- У выезда может и не быть цели и заказа тогда поля остаются NULL;
--  В случае поломки указывается причина поломки и водитель на котором машина сломалась;
-- После каждого выезда делается отчет по затраченному бензину.

