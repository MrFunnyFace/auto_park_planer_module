CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 2) Функция: логирование любых изменений в таблицах (INSERT, UPDATE, DELETE)
CREATE OR REPLACE FUNCTION log_changes()
RETURNS TRIGGER AS $$
DECLARE
    entity_id INTEGER;
    log_data JSONB;
BEGIN
    -- Определяем ID и данные в зависимости от операции
    IF TG_OP = 'DELETE' THEN
        -- Для DELETE используем OLD запись
        BEGIN
            SELECT to_jsonb(OLD.*) INTO log_data;
            -- Пробуем получить поле "id" из OLD записи
            entity_id := (log_data->>'id')::INTEGER;
        EXCEPTION WHEN others THEN
            entity_id := NULL;
        END;
    ELSE
        -- Для INSERT и UPDATE используем NEW запись
        BEGIN
            SELECT to_jsonb(NEW.*) INTO log_data;
            -- Пробуем получить поле "id" из NEW записи
            entity_id := (log_data->>'id')::INTEGER;
        EXCEPTION WHEN others THEN
            entity_id := NULL;
        END;
    END IF;

    -- Вставляем лог
    INSERT INTO system_logs (log_entity_type, log_entity_id, log_action, log_details)
    VALUES (
        TG_TABLE_NAME,
        entity_id,
        TG_OP,
        log_data::TEXT
    );

    -- Возвращаем соответствующую запись
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ############################################### 
-- задания по БД


--функции для сдачи работы
--1) Посчитать и вернуть количество выездов на определенного водителя (статистика выполненых заказов(сколько всего заказов выполнил), 
--количество пройденых отрицательно мед осмотров, количество ремонтов выпавших на водителя, общее количество пробега)
CREATE FUNCTION state_driver(ID_driver INTEGER)
RETURNS TABLE ( dr_name VARCHAR, count_order INT, count_bad_med_status INT, count_repair_drivers INT, sum_mileage NUMERIC) AS 
$$
BEGIN
    RETURN QUERY
    SELECT
        d.dr_name,
        (
            SELECT COUNT(dep_order)::INT
            FROM departure
            WHERE dep_driver = d.dr_shifr AND dep_date_of_return IS NOT NULL AND dep_mileage IS NOT NULL
        ),
        (
            SELECT COUNT(med_shifr)::INT
            FROM medical
            WHERE med_driver = d.dr_shifr
              AND med_status IN ('Not allowed (Health)', 'Not allowed (Intoxication)')
        ),
        (
            SELECT COUNT(rep_shifr)::INT
            FROM _repair
            WHERE rep_driver = d.dr_shifr
        ),
        (
            SELECT SUM(dep_mileage)::NUMERIC
            FROM departure
            WHERE dep_driver = d.dr_shifr
        )
    FROM drivers d
    WHERE d.dr_shifr = ID_driver;
END;
$$ LANGUAGE plpgsql;

--2) С использование предыдущей функции вывести всех водителей
CREATE OR REPLACE FUNCTION state_all_drivers()
RETURNS TABLE (
    dr_name VARCHAR,
    count_order INT,
    count_bad_med_status INT,
    count_repair_drivers INT,
    sum_mileage NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.dr_name,
        s.count_order,
        s.count_bad_med_status,
        s.count_repair_drivers,
        s.sum_mileage
    FROM drivers d
    LEFT JOIN LATERAL state_driver(d.dr_shifr) AS s ON TRUE;
END;
$$ LANGUAGE plpgsql;

--3) Общий отчет по заказам (их количество выполненых за период; заказов в ожидании на выполнение)

CREATE OR REPLACE FUNCTION statistics_for_orders(start_date DATE, end_date DATE)
RETURNS TABLE (
    orders_between_dates_count BIGINT,
    orders_in_work_count BIGINT,
    orders_complete_count BIGINT
) AS
$$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) FILTER (
            WHERE o.ord_date_ex BETWEEN start_date AND end_date
        ),

        COUNT(*) FILTER (
            WHERE EXISTS (
                SELECT 1 FROM departure d WHERE d.dep_order = o.ord_shifr
            ) AND o.ord_date_ex BETWEEN start_date AND end_date
        ),
        
        COUNT(*) FILTER (
            WHERE EXISTS (
                SELECT 1 FROM departure d 
                WHERE d.dep_order = o.ord_shifr AND d.dep_date_of_return IS NOT NULL
            ) AND o.ord_date_ex BETWEEN start_date AND end_date
        )
    FROM _order o;
END;
$$ LANGUAGE plpgsql