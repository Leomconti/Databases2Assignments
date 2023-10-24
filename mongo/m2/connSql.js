const { Sequelize } = require("sequelize");

const MYSQL_IP = "localhost";
const MYSQL_LOGIN = "root";
const MYSQL_PASSWORD = "admin123";
const DATABASE = "employees";
const sqlConnection = new Sequelize(DATABASE, MYSQL_LOGIN, MYSQL_PASSWORD, {
    host: MYSQL_IP,
    port: 3306,
    dialect: "mysql",
    logging: false,
});

async function testSql() {
    try {
        // Test the connection
        await sqlConnection.authenticate();
        console.log("Successfully connected to MySQL database!");
    } catch (error) {
        console.error("Error connecting to MySQL database:", error);
    }
}

module.exports = {
    sqlConnection,
    testSql,
};
