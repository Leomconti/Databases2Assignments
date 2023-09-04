const { Sequelize, DataTypes, Model } = require("sequelize");
const sequelize = require("./conn.js");

class TableCsv extends Model {}
TableCsv.init(
    {},
    {
        sequelize,
        modelName: "TableCsv",
    }
);

module.exports = TableCsv;
