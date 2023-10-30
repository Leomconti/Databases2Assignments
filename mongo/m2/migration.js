/*  
Script to migrate data from MySQL to MongoDB 
Dataset used: https://github.com/datacharmer/test_db
*/
const { sqlConnection, testSql } = require("./connSql");
const { mongoConn, testMongo } = require("./connMongo");

// opens SQL connection
testSql();
// opens mongo Connection
testMongo();

// Aqui na query a gnt vai usar o group_concat (no postgres tem ARRAY_AGG) para juntar os dados de cada tabela em uma string só,
// o que fica mais facil para transformar em list depois
query = `
    SELECT 
        e.emp_no,
        e.birth_date,
        e.first_name,
        e.last_name,
        e.gender,
        e.hire_date,

        GROUP_CONCAT(DISTINCT CONCAT(de.dept_no, ':', d.dept_name, ':', de.from_date, ':', de.to_date)) AS depts,

        GROUP_CONCAT(DISTINCT CONCAT(dm.dept_no, ':', d.dept_name, ':', dm.from_date, ':', dm.to_date)) AS managers,

        GROUP_CONCAT(DISTINCT CONCAT(t.title, ':', t.from_date, ':', t.to_date)) AS titles,

        GROUP_CONCAT(DISTINCT CONCAT(s.salary, ':', s.from_date, ':', s.to_date)) AS salaries

    FROM employees e

    LEFT JOIN dept_emp de ON e.emp_no = de.emp_no
    LEFT JOIN departments d ON de.dept_no = d.dept_no
    LEFT JOIN dept_manager dm ON de.dept_no = dm.dept_no AND de.from_date <= dm.to_date AND de.to_date >= dm.from_date
    LEFT JOIN titles t ON e.emp_no = t.emp_no
    LEFT JOIN salaries s ON e.emp_no = s.emp_no

    GROUP BY e.emp_no, e.birth_date, e.first_name, e.last_name, e.gender, e.hire_date
    LIMIT 10
`;

async function executeRawQueryAndProcess(query) {
    try {
        const [mysqlResults] = await sqlConnection.query(query);
        const mongoDocs = mysqlResults.map((row) => {
            return {
                emp_no: row.emp_no,
                birth_date: row.birth_date,
                first_name: row.first_name,
                last_name: row.last_name,
                gender: row.gender,
                hire_date: row.hire_date,

                // para os seguintes, vamos fazer o split baseado no que setamos acima na query com o GROUP_CONCAT
                // teve q tacar o ? [] se nao em null dava ruim
                depts: row.depts
                    ? row.depts.split(",").map((dept) => {
                          const [dept_no, dept_name, from_date, to_date] = dept.split(":");
                          return { dept_no, dept_name, from_date, to_date };
                      })
                    : [],
                managers: row.managers
                    ? row.managers.split(",").map((manager) => {
                          const [dept_no, dept_name, from_date, to_date] = manager.split(":");
                          return { dept_no, dept_name, from_date, to_date };
                      })
                    : [],
                titles: row.titles
                    ? row.titles.split(",").map((title) => {
                          const [title_name, from_date, to_date] = title.split(":");
                          return { title: title_name, from_date, to_date };
                      })
                    : [],
                salaries: row.salaries
                    ? row.salaries.split(",").map((salary) => {
                          const [salary_amount, from_date, to_date] = salary.split(":");
                          return { salary: parseInt(salary_amount), from_date, to_date };
                      })
                    : [],
            };
        });

        // se tentar printar muito grande, da erro !! cuidado
        // console.log(JSON.stringify(mongoDocs, null, 2)); // usando stringify pra fazer o "pretty print" e mostrar os aninhamentos tb

        const mongoCollection = mongoConn.db("m2").collection("employees");

        const resMongo = await mongoCollection.insertMany(mongoDocs);
        console.log("Number of documents inserted: " + resMongo.insertedCount);

        return mongoDocs;
    } catch (error) {
        console.error("Error executing raw SQL query:", error);
        throw error;
    }
}

async function run() {
    const result = await executeRawQueryAndProcess(query);
    console.log("Finished!");
}

run();
