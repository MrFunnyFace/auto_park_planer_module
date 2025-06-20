run:
	docker compose up -d

down:
	docker compose down

clearDB: 
	docker compose down
	rm -r DB/PostgresSQL/

run_log:
	docker compose up

logs:
	docker logs auto_park_postgres

PS:
	docker ps
	docker compose ps

psql_login:
	docker exec -it auto_park_postgres psql -U admin -d park

bash_login:
	docker exec -it auto_park_postgres bash

plog:
	docker logs a_php

php_log_dash:
	docker exec a_php tail -f /tmp/dashboard.log