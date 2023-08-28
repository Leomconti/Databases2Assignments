const { Sequelize } = require("sequelize"); //npm install --save sequelize , npm install --save mysql2
//initialize mysql connection
const MYSQL_IP = "localhost";
const MYSQL_LOGIN = "admin";
const MYSQL_PASSWORD = "admin123";
const DATABASE = "sakila";
const sequelize = new Sequelize(DATABASE, MYSQL_LOGIN, MYSQL_PASSWORD, {
    host: "localhost",
    port: 3306,
    dialect: "mysql",
});

module.exports = sequelize;
