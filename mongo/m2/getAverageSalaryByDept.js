const { mongoConn, testMongo } = require("./connMongo");

async function getAverageSalaryByDept() {
    const aggregateResults = await mongoConn
        .db("m2")
        .collection("employees")
        .aggregate([
            {
                $group: {
                    _id: "$curr_dept_no",
                    averageSalary: { $avg: "$curr_salary" },
                },
            },
        ])
        .toArray();
    return aggregateResults;
}

async function runQueries() {
    try {
        await testMongo();
        const averageSalaryByDept = await getAverageSalaryByDept();
        console.log("Average salary by department:", JSON.stringify(averageSalaryByDept, null, 2));
    } catch (error) {
        console.error("Error running queries:", error);
    }
}

runQueries();
