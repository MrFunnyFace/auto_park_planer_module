CREATE SCHEMA backend_schem;--USER backend have ROLE backend scheme backend:Доступ ко всей базе и таблицам: SELECT, PROCEDURE CREATE and DELETE USERS 
CREATE SCHEMA scheduler_schem; --have ROLE scheduler and scheme scheduler:доступ к та
CREATE SCHEMA dispatcher_schem;
CREATE SCHEMA mechanic_schem;
CREATE SCHEMA doctor_schem;

CREATE ROLE backend;
CREATE ROLE scheduler;
CREATE ROLE Dispatcher;
CREATE ROLE Mechanic;
CREATE ROLE Doctor;

 
-- Планировщик - The Scheduler
-- Диспетчер - Dispatcher
-- Механик - Mechanic
-- Врач - Doctor





