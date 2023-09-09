const { Sequelize, DataTypes, Model } = require("sequelize");
const sequelize = require("./conn.js");

class TableCsv extends Model {}
TableCsv.init(
  {
    user_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
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
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
    },
    job_title: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize,
    modelName: "TableCsv",
  }
);

module.exports = TableCsv;
