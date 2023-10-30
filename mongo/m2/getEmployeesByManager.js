const { mongoConn, testMongo } = require("./connMongo");

async function getEmployeesByManagerId(managerId) {
  const employeesResult = await mongoConn
    .db("m2")
    .collection("employees")
    .find({ "managers.emp_no": managerId.toString() })
    .limit(3)
    .toArray();
  return employeesResult;
}

async function getEmployeesByManagerName(firstName, lastName) {
  const employeesResult = mongoConn
    .db("m2")
    .collection("employees")
    .find({
      $and: [
        { "managers.first_name": firstName },
        { "managers.last_name": lastName },
      ],
    })
    .limit(3)
    .toArray();
  return employeesResult;
}

async function runQueries() {
  try {
    await testMongo();
    const employeesByManagerId = await getEmployeesByManagerId(110022);
    console.log(
      "Employees by manager ID:",
      JSON.stringify(employeesByManagerId, null, 2)
    );

    const employeesByManagerName = await getEmployeesByManagerName(
      "Selwyn",
      "Cushing"
    );
    console.log(
      "Employees by manager name:",
      JSON.stringify(employeesByManagerName, null, 2)
    );
  } catch (error) {
    console.error("Error running queries:", error);
  }
}

runQueries();
