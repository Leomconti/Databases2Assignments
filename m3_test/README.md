-   Conda environment

```
conda activate databases_m3
```

## 1. Let's load the data to MySql

-   Let's start the containers for Mongo and MySql, and run the shell script that will dump data into the database.

-   To insert the data into MySQL you **need** to add the folder **test_db-master** to this repository, which can be found here: https://github.com/datacharmer/test_db

```shell
docker compose up -d
```

```shell
sh add_to_db.sh
```

-   Test the database out, to see if loading the data has worked:

```shell
docker exec -it mysql mysql -u root --password=admin123
```

# Work done to get M3 up:

-   Queries to create the column families (tablesn) in cassandra

-   Each query should return all 6 employee's values:

    emp_no int,
    birth_date date,
    first_name text,
    last_name text,
    gender text,
    hire_date date,

```python
# Create Cassandra Tables
cassandra_session.execute("""
CREATE TABLE IF NOT EXISTS employees_by_manager (
    manager_name text,
    emp_no int,
    birth_date date,
    first_name text,
    last_name text,
    gender text,
    hire_date date,
    PRIMARY KEY (manager_name, emp_no)
)""")

cassandra_session.execute("""
CREATE TABLE IF NOT EXISTS employees_by_dept (
    dept_name text,
    query_date date,
    emp_no int,
    birth_date date,
    first_name text,
    last_name text,
    gender text,
    hire_date date,
    PRIMARY KEY ((dept_name, query_date), emp_no)
)""")

cassandra_session.execute("""
CREATE TABLE IF NOT EXISTS avg_salary_by_dept (
    dept_name text,
    average_salary double,
    PRIMARY KEY (dept_name)
)""")

```
