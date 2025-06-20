-- Улучшенная версия схемы базы данных для автопарка

-- Добавляем временные метки для аудита


-- Типы пользователей
CREATE TYPE user_role AS ENUM ('Scheduler', 
                               'Dispatcher', 
                               'Mechanic', 
                               'Doctor');

-- Пользователи (добавлены временные метки и статус)
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

-- Триггер для автообновления updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Водители (добавлены дополнительные поля)
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

CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Статус прохождения медика
CREATE TYPE medical_status AS ENUM ('Allowed',
                                    'Not allowed (Health)',
                                    'Not allowed (Intoxication)');

-- Медицинские осмотры (исправлено название поля)
CREATE TABLE medical (
    med_shifr SERIAL PRIMARY KEY,
    med_driver INTEGER NOT NULL,
    med_date DATE NOT NULL,
    med_status medical_status NOT NULL,
    med_doctor_name VARCHAR(100) NOT NULL, -- исправлено с med_nnameDr
    med_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (med_driver) REFERENCES drivers(dr_shifr) ON DELETE CASCADE
);

-- Статус автомобиля
CREATE TYPE car_status AS ENUM ('Available', 'In use', 'Maintenance', 'Repair', 'Out of service');

-- Автомобили (улучшена структура)
CREATE TABLE cars (
    car_shifr SERIAL PRIMARY KEY,
    car_gosnomer CHAR(9) NOT NULL UNIQUE,
    car_vin CHAR(17) NOT NULL UNIQUE, -- исправлено с car_wine
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

CREATE TRIGGER update_cars_updated_at BEFORE UPDATE ON cars
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Путевые листы (добавлены дополнительные поля)
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

-- Патрулирование/расход топлива (переименована и улучшена)
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

-- Типы ТО
CREATE TYPE TO_type_of AS ENUM ('Daily',
                                'Periodic',
                                'Seasonal');

-- Статус ТО
CREATE TYPE TO_status AS ENUM ('Scheduled', 'In progress', 'Completed', 'Cancelled');

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

CREATE TRIGGER update_maintenance_updated_at BEFORE UPDATE ON maintenance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Заказы (улучшена структура)
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

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Отправления/поездки
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

CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON trips
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Статус ремонта
CREATE TYPE repair_status AS ENUM ('Inspection required',
                                   'Rep. zone required',
                                   'In repair zone',
                                   'On-site repair',
                                   'Repair completed',
                                   'Ready for pickup');

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

CREATE TRIGGER update_repairs_updated_at BEFORE UPDATE ON repairs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Маршруты (новая таблица)
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

CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON routes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Лимиты (новая таблица)
CREATE TYPE limit_type AS ENUM ('Daily', 'Weekly', 'Monthly');
CREATE TYPE limit_parameter AS ENUM ('Mileage', 'Fuel', 'Time');

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

CREATE TRIGGER update_limits_updated_at BEFORE UPDATE ON limits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Система логов (улучшена)
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

-- Индексы для производительности
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

-- Функция для логирования изменений
CREATE OR REPLACE FUNCTION log_changes()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO system_logs (log_entity_type, log_entity_id, log_action, log_details)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(NEW));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для логирования (пример для нескольких таблиц)
CREATE TRIGGER log_users_changes
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION log_changes();

CREATE TRIGGER log_cars_changes
    AFTER INSERT OR UPDATE OR DELETE ON cars
    FOR EACH ROW EXECUTE FUNCTION log_changes();

-- Вставка тестовых данных
INSERT INTO users (user_name, email, _password, _role) VALUES
('admin', 'admin@autopark.ru', decode('admin123', 'escape'), 'Scheduler'),
('dispatcher1', 'dispatcher@autopark.ru', decode('disp123', 'escape'), 'Dispatcher'),
('mechanic1', 'mechanic@autopark.ru', decode('mech123', 'escape'), 'Mechanic'),
('doctor1', 'doctor@autopark.ru', decode('doc123', 'escape'), 'Doctor');

INSERT INTO drivers (dr_name, dr_born, dr_experience, dr_category, dr_phone) VALUES
('Иванов Иван Иванович', '1985-03-15', 8, 'B,C,D', '+7-900-123-4567'),
('Петров Петр Петрович', '1978-07-22', 15, 'B,C,D,E', '+7-900-234-5678'),
('Сидоров Сидор Сидорович', '1990-11-08', 5, 'B,C', '+7-900-345-6789');

INSERT INTO cars (car_gosnomer, car_vin, car_model, car_year, car_mileage, car_fuel_type) VALUES
('А123БВ777', '12345678901234567', 'КАМАЗ-5320', 2018, 150000, 'Дизель'),
('В456ГД777', '23456789012345678', 'ГАЗель Next', 2020, 95000, 'Бензин'),
('С789ЕЖ777', '34567890123456789', 'МАЗ-6312', 2017, 200000, 'Дизель');

-- Комментарии к таблицам
