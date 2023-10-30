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

## 3. About indexes

- We cannot index two arrays inside the collection, and while trying to do the last index, we got the following error:

```shell
Error executing raw SQL query: MongoBulkWriteError: cannot index parallel arrays [salaries] [depts]
```

- Than, so instead of not creating it, we'll create a field, called curr_dept, which will represent the current department the employee is working at, so we can calculate the aggreagate based on that. Or, maybe, we could add curr_salary and curr_dept, which would be better.


# Schema we've defined for the Mongo Document, it ended up not being used in the code but it's nce to have here,
- Notice that schemas other than employeeSchema are just models for the values that will be in the lists
```javascript

managerSchema = {
    dept_no: dept_no_manager,
    dept_name: dept_name_manager,
    emp_no: manager_no,
    first_name: manager_first,
    last_name: manager_last,
    from_date: from_date_manager,
    to_date: to_date_manager,
};

deptsSchema = {
    dept_no: dept_no,
    dept_name: dept_name,
    from_date: from_date,
    to_date: to_date,
};

titlesSchema = {
    title: title,
    from_date: from_date_title,
    to_date: to_date_title,
};

salarySchema = {
    salary: salary,
    from_date: from_date_salary,
    to_date: to_date_salary,
};

employeeSchema = {
    emp_no: emp_no,
    birth_date: birth_date,
    first_name: first_name,
    last_name: last_name,
    gender: gender,
    hire_date: hire_date,
    curr_dept: curr_dept,
    curr_salary: curr_salary,
    depts: deps_list,
    managers: managers_list,
    titles: title_list,
    salaries: salaries_list,
};

```