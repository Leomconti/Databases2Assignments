from db_conn import create_sql_connection, get_cassandra_session

cassandra = get_cassandra_session()
mysql = create_sql_connection()

sql_cursor = mysql.cursor()

# 1. Create tables in Cassandra

# Drop existing tables if they exist
cassandra.execute("DROP TABLE IF EXISTS employees_by_manager")
cassandra.execute("DROP TABLE IF EXISTS employees_by_dept")
cassandra.execute("DROP TABLE IF EXISTS avg_salary_by_dept")

# - employees_by_manager, with manager_mp_no as partition key and emp_no as clustering key
cassandra.execute(
    """
CREATE TABLE IF NOT EXISTS employees_by_manager (
    manager_emp_no int,
    manager_first_name text,
    manager_last_name text,
    emp_no int,
    birth_date date,
    first_name text,
    last_name text,
    gender text,
    hire_date date,
    PRIMARY KEY (manager_emp_no, emp_no)
)"""
)

# - employees_by_dept, with dept_name as partition key and emp_no as clustering key
cassandra.execute(
    """
CREATE TABLE IF NOT EXISTS employees_by_dept (
    dept_name text,
    from_date date,
    to_date date,
    emp_no int,
    birth_date date,
    first_name text,
    last_name text,
    gender text,
    hire_date date,
    PRIMARY KEY (dept_name, emp_no)
)"""
)

# - avg_salary_by_dept, with dept_name as partition key and average_salary as clustering key ( only one left so no need to add it)
cassandra.execute(
    """
CREATE TABLE IF NOT EXISTS avg_salary_by_dept (
    dept_name text,
    average_salary double,
    PRIMARY KEY (dept_name)
)"""
)

# 2. Get the data from Mysql and insert into variables
mysql_query_for_manager = """
SELECT 
   m.emp_no, m.first_name, m.last_name, e.emp_no, e.birth_date, e.first_name, e.last_name, e.gender, e.hire_date
FROM employees e
INNER JOIN dept_emp de ON e.emp_no = de.emp_no
INNER JOIN departments d ON de.dept_no = d.dept_no
INNER JOIN dept_manager dm ON d.dept_no = dm.dept_no
INNER JOIN employees m ON dm.emp_no = m.emp_no
WHERE dm.to_date = '9999-01-01';
"""

sql_cursor.execute(mysql_query_for_manager)
manager_data = sql_cursor.fetchall()
# print(manager_data)

mysql_query_for_dept = """
SELECT d.dept_name, de.from_date, de.to_date, e.emp_no, e.birth_date, e.first_name, e.last_name, e.gender, e.hire_date
FROM employees e
JOIN dept_emp de ON e.emp_no = de.emp_no
JOIN departments d ON de.dept_no = d.dept_no;
"""
sql_cursor.execute(mysql_query_for_dept)
dept_data = sql_cursor.fetchall()
# print(dept_data)

mysql_query_for_avg_salary = """
SELECT d.dept_name, AVG(s.salary) AS average_salary
FROM salaries s
JOIN dept_emp de ON s.emp_no = de.emp_no
JOIN departments d ON de.dept_no = d.dept_no
GROUP BY d.dept_name;
"""


sql_cursor.execute(mysql_query_for_avg_salary)
avg_salary_data = sql_cursor.fetchall()
# print(avg_salary_data)
# 3. Insert the data into Cassandra
print("Inserting manager_data into Cassandra")
# print(len(manager_data)) # TEM 331 MIL
for row in manager_data[:1000]:
    cassandra.execute(
        f"""
        INSERT INTO employees_by_manager (manager_emp_no, manager_first_name, manager_last_name, emp_no, birth_date, first_name, last_name, gender, hire_date) 
        VALUES ({row[0]}, '{row[1]}', '{row[2]}', {row[3]}, '{row[4].strftime('%Y-%m-%d')}', '{row[5]}', '{row[6]}', '{row[7]}', '{row[8].strftime('%Y-%m-%d')}')
        """
    )


print("manager data inserted")

print("Inserting dept_data into Cassandra")
for row in dept_data[:1000]:
    cassandra.execute(
        f"""
        INSERT INTO employees_by_dept (dept_name, from_date, to_date, emp_no, birth_date, first_name, last_name, gender, hire_date)
        VALUES ('{row[0]}', '{row[1].strftime('%Y-%m-%d')}', '{row[2].strftime('%Y-%m-%d')}', {row[3]}, '{row[4].strftime('%Y-%m-%d')}', '{row[5]}', '{row[6]}', '{row[7]}', '{row[8].strftime('%Y-%m-%d')}')
        """
    )
print("dept data inserted")

print("Inserting avg_salary_data into Cassandra")
for row in avg_salary_data[:1000]:
    cassandra.execute(
        f"""
        INSERT INTO avg_salary_by_dept (dept_name, average_salary)
        VALUES ('{row[0]}', {float(row[1])})
        """
    )
print("avg_salary data inserted")
