-- 3) Триггеры для обновления updated_at на различных таблицах
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_limits_updated_at BEFORE UPDATE ON limits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON routes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_repairs_updated_at BEFORE UPDATE ON repairs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cars_updated_at BEFORE UPDATE ON cars
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON trips
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4) Триггеры для логирования действий (пример для users и cars)
-- CREATE TRIGGER log_users_changes
--     AFTER INSERT OR UPDATE OR DELETE ON users
--     FOR EACH ROW EXECUTE FUNCTION log_changes();

-- CREATE TRIGGER log_cars_changes
--     AFTER INSERT OR UPDATE OR DELETE ON cars
--     FOR EACH ROW EXECUTE FUNCTION log_changes();

-- 5) Процедура: создание логов вручную из backend
CREATE OR REPLACE PROCEDURE log_action(
    p_entity_type VARCHAR(50),
    p_entity_id INTEGER,
    p_action VARCHAR(100),
    p_details TEXT DEFAULT NULL,
    p_user_id INTEGER DEFAULT NULL
)
AS $$
BEGIN
    INSERT INTO system_logs (
        log_entity_type,
        log_entity_id,
        log_action,
        log_details,
        log_user_id
    ) VALUES (
        p_entity_type,
        p_entity_id,
        p_action,
        p_details,
        p_user_id
    );
    RAISE NOTICE 'Действие залогировано: % для % ID:% (Пользователь: %)',
                p_action, p_entity_type, p_entity_id, COALESCE(p_user_id::text, 'Система');
END;
$$ LANGUAGE plpgsql;

-- 6) Триггер для таблицы trips (бывший departure)
CREATE OR REPLACE FUNCTION trg_update_car_mileage()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.trip_end_date IS NOT NULL AND NEW.trip_end_mileage IS NOT NULL AND NEW.trip_start_mileage IS NOT NULL THEN
        UPDATE cars
        SET car_mileage = car_mileage + (NEW.trip_end_mileage - NEW.trip_start_mileage)
        WHERE car_shifr = NEW.trip_car;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_after_trip_complete
AFTER UPDATE OF trip_end_date, trip_end_mileage
ON trips
FOR EACH ROW
EXECUTE FUNCTION trg_update_car_mileage();