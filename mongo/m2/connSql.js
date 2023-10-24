const { Sequelize } = require("sequelize");

const MYSQL_IP = "localhost";
const MYSQL_LOGIN = "admin";
const MYSQL_PASSWORD = "admin123";
const DATABASE = "db_m2";
const sqlConnection = new Sequelize(DATABASE, MYSQL_LOGIN, MYSQL_PASSWORD, {
    host: MYSQL_IP,
    port: 3306,
    dialect: "mysql",
    logging: false,
});

module.exports = sqlConnection;
