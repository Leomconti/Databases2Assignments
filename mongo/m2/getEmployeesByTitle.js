const { mongoConn, testMongo } = require("./connMongo");

async function getEmployeesByTitle(title) {
  const titleResults = await mongoConn
    .db("m2")
    .collection("employees")
    .find({ "titles.title": title })
    .limit(3)
    .toArray();
  return titleResults;
}

async function runQueries() {
  try {
    await testMongo();
    const employeesByTitle = await getEmployeesByTitle("Senior Engineer");
    console.log(
      "Employees by title:",
      JSON.stringify(employeesByTitle, null, 2)
    );
  } catch (error) {
    console.error("Error running queries:", error);
  }
}

runQueries();
