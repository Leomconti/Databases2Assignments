const { mongoConn, testMongo } = require("./connMongo");

async function getEmployeesByDeptName(deptName) {
    const deptNameResults = await mongoConn
        .db("m2")
        .collection("employees")
        .find({ "depts.dept_name": deptName })
        .toArray();
    return deptNameResults;
}

async function runQueries() {
    try {
        await testMongo();
        const employeesByDeptName = await getEmployeesByDeptName("Finance");
        console.log("Employees by department name:", JSON.stringify(employeesByDeptName, null, 2));
    } catch (error) {
        console.error("Error running queries:", error);
    }
}

runQueries();
