/*  
Script to migrate data from MySQL to MongoDB 
Dataset used: https://github.com/datacharmer/test_db
*/
const { sqlConnection, testSql } = require("./connSql");
const { mongoConn, testMongo } = require("./connMongo");

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
    currDept.dept_no AS curr_dept_no,
    currSalary.salary AS curr_salary,

    GROUP_CONCAT(DISTINCT CONCAT(de.dept_no, ':', d.dept_name, ':', de.from_date, ':', de.to_date)) AS depts,

    GROUP_CONCAT(DISTINCT CONCAT(dm.dept_no, ':', d.dept_name, ':',  m.emp_no, ':', m.first_name, ':', m.last_name, ':', dm.from_date, ':', dm.to_date)) AS managers,

    GROUP_CONCAT(DISTINCT CONCAT(t.title, ':', t.from_date, ':', t.to_date)) AS titles,

    GROUP_CONCAT(DISTINCT CONCAT(s.salary, ':', s.from_date, ':', s.to_date)) AS salaries

FROM employees e

LEFT JOIN dept_emp de ON e.emp_no = de.emp_no
LEFT JOIN departments d ON de.dept_no = d.dept_no
LEFT JOIN dept_manager dm ON de.dept_no = dm.dept_no AND de.from_date <= dm.to_date AND de.to_date >= dm.from_date
LEFT JOIN employees m ON dm.emp_no = m.emp_no  -- Joining again with employees for manager details
LEFT JOIN titles t ON e.emp_no = t.emp_no
LEFT JOIN salaries s ON e.emp_no = s.emp_no
LEFT JOIN dept_emp currDept ON e.emp_no = currDept.emp_no AND currDept.to_date = '9999-01-01'
LEFT JOIN salaries currSalary ON e.emp_no = currSalary.emp_no AND currSalary.to_date = '9999-01-01'

GROUP BY e.emp_no, e.birth_date, e.first_name, e.last_name, e.gender, e.hire_date, curr_dept_no, curr_salary
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
                curr_dept_no: row.curr_dept_no,
                curr_salary: row.curr_salary,

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
                          const [dept_no, dept_name, emp_no, first_name, last_name, from_date, to_date] =
                              manager.split(":");
                          return { dept_no, dept_name, emp_no, first_name, last_name, from_date, to_date };
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

        // console.log(JSON.stringify(mongoDocs, null, 2)); // usando stringify pra fazer o "pretty print" e mostrar os aninhamentos tb, ele nao printa muitos registros!

        const mongoCollection = mongoConn.db("m2").collection("employees");

        const resMongo = await mongoCollection.insertMany(mongoDocs);
        console.log("Number of documents inserted: " + resMongo.insertedCount);

        return mongoDocs;
    } catch (error) {
        console.error("Error executing raw SQL query:", error);
        throw error;
    }
}

// Função para criar os índices
async function createIndexes() {
    try {
        const db = mongoConn.db("m2");
        const employeesCollection = db.collection("employees");

        // a) Retorne todos os employees dado nome ou ID de determinado manager.
        employeesCollection.createIndex({ "managers.first_name": 1, "managers.last_name": 1 });
        employeesCollection.createIndex({ "managers.emp_no": 1 });

        // b) Dado um title, recupere todos os employees que já estiveram vinculados a este title.
        employeesCollection.createIndex({ "titles.title": 1 });

        // c) Dado o nome de um departamento, retorne todos os employees vinculados a este departamento.
        employeesCollection.createIndex({ "depts.dept_name": 1 });

        // d) Testamos criacao de diversos tipos de index porem o Mongo nao fez o uso em nenhum dos casos, entao nao
        // vamos adicionar indices para a realizacao da letra d)
        return true;
    } catch (error) {
        console.error("Erro ao criar índices:", error);
        return false;
    }
}

async function run() {
    testSql();
    testMongo();
    const result = await executeRawQueryAndProcess(query);
    console.log("Finalizou insercao dos dados na collection employees");

    const addIndex = await createIndexes();
    if (!addIndex) {
        console.error("Erro ao criar índices");
    }
    console.log("Os indices foram criados para a collection employees");

    mongoConn.close();
    // sair se n ele fica hanging aq
    process.exit();
}

run();
