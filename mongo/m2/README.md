## 1. Let's load the data to MySql

-   Let's start the containers for Mongo and MySql, and run the shell script that will dump data into the database.

```shell
docker compose up -d

sh add_to_db.sh
```

-   Test the database out, to see if loading the data has worked:

```shell
docker exec -it mysql mysql -u root --password=admin123
```

```sql
select * from salaries LIMIT 10;
```

## 2. Run the migration script to send data from MySql to MongoDb

-   This will run the script we've developed that will take the data from mysql and send to the respective collecions on MongoDb

```shell
node migration.js
```
