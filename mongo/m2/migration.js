/*  
Script to migrate data from MySQL to MongoDB 
Dataset used: https://github.com/datacharmer/test_db
*/
const { sqlConnection, testSql } = require("./connSql");
const { mongoConn, testMongo } = require("./connMongo");

testSql();
testMongo();
