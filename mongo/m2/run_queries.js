const { sqlConnection, testSql } = require("./connSql");
const { mongoConn, testMongo } = require("./connMongo");

mongoConn.db("m2").collection("employees").find({ "managers.emp_no": "110511" }).limit(3).toArray((err, managerIdResults) => {
    if(err) throw err;
    console.log(JSON.stringify(managerIdResults, null, 2));
});

mongoConn.db("m2").collection("employees").find({
    $and: [
        { "managers.first_name": "DeForest" },
        { "managers.last_name": "Hagimont" }
    ]
}).limit(3).toArray((err, managerFirstNameResults) => {
    if(err) throw err;
    console.log(JSON.stringify(managerFirstNameResults, null, 2));
});

mongoConn.db("m2").collection("employees").find({ "titles.title": "Senior Engineer" }).limit(3).toArray((err, titleResults) => {
    if(err) throw err;
    console.log(JSON.stringify(titleResults, null, 2));
});

mongoConn.db("m2").collection("employees").find({ "depts.dept_name": "Development" }).limit(3).toArray((err, deptNameResults) => {
    if(err) throw err;
    console.log(JSON.stringify(deptNameResults, null, 2));
});

mongoConn.db("m2").collection("employees").aggregate([
    {
        $group: {
            _id: "$curr_dept_no",
            averageSalary: { $avg: "$curr_salary" },
        },
    },
    {
        $limit: 3,
    },
]).toArray((err, aggregateResults) => {
    if(err) throw err;
    console.log(JSON.stringify(aggregateResults, null, 2));
});
