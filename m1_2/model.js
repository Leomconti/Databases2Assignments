const { Sequelize, DataTypes, Model } = require("sequelize");
const sequelize = require("./conn.js");

const TableCsv = sequelize.define(
    "TableCsv",
    {
        user_id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        first_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        last_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        sex: {
            type: DataTypes.STRING,
        },
        email: {
            type: DataTypes.STRING,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        date_of_birth: {
            type: DataTypes.DATEONLY,
        },
        job_title: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        tableName: "TableCsv",
        timestamps: false,
    }
);

TableCsv.sync({ force: true });

module.exports = TableCsv;
