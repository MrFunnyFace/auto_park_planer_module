-- на каждого водителя и машины на которых он ездил средний пробег по путевым листам

CREATE VIEW view_DC_AVG_mil AS
SELECT drivers.dr_name, cars.car_model, ROUND(AVG(travel_sheets.trs_mileage_exit), 2) AS avg_mileage
FROM travel_sheets
INNER JOIN cars ON travel_sheets.trs_car = cars.car_shifr
INNER JOIN drivers ON travel_sheets.trs_driver = drivers.dr_shifr
GROUP BY cars.car_shifr,drivers.dr_shifr;

-- на каждого водителя и машину на которых он ездит среднее количество выездов и заказов 

CREATE VIEW view_D_orders_departure AS
SELECT drivers.dr_name, cars.car_model, COUNT(DISTINCT _order.ord_shifr) AS COUNT_ORDER, COUNT(DISTINCT departure.dep_shifr) AS COUNT_DEPARTURE
FROM _order
RIGHT JOIN departure ON _order.ord_driver = departure.dep_driver AND _order.ord_car = departure.dep_car
JOIN cars ON cars.car_shifr = departure.dep_car
JOIN drivers ON drivers.dr_shifr = departure.dep_driver
GROUP BY cars.car_shifr,drivers.dr_shifr;

-- Информация о водители, кол-во мед осмотров, общее количество выездов, общий км, выполненые заказы, сколько ремонтов выпало на водителя
CREATE VIEW view_D_state AS
SELECT drivers.dr_name, COUNT(DISTINCT medical.med_shifr) AS COUNT_MEDICAL_EXAMINATION, COUNT(DISTINCT departure.dep_shifr) AS COUNT_DEPARTURE,
SUM(departure.dep_mileage) AS SUM_MILEAGE, COUNT(DISTINCT _repair.rep_driver) AS SUN_REPAIR
FROM drivers
LEFT JOIN medical ON medical.med_driver=drivers.dr_shifr
LEFT JOIN departure ON departure.dep_driver=drivers.dr_shifr
LEFT JOIN _repair ON _repair.rep_driver=drivers.dr_shifr
GROUP BY drivers.dr_shifr;
