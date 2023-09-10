const { Sequelize, DataTypes, Model } = require("sequelize");
const sequelize = require("./conn.js");

const Usuarios = sequelize.define(
    "Usuarios",
    {
        user_id: {
            type: DataTypes.STRING,
        },
        first_name: {
            type: DataTypes.STRING,
        },
        last_name: {
            type: DataTypes.STRING,
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
            type: DataTypes.DATEONLY, // n tem hroario nem nd
        },
        job_title: {
            type: DataTypes.STRING,
            allowNull: true, // arquivo mo grande n sabemos se vai ter algo vazio, ent deixa
        },
    },
    {
        tableName: "Usuarios",
        timestamps: false,
    }
);

// colocar force true para na apresentacao fazer o upload do zero la e tals

Usuarios.sync({ force: true });

module.exports = Usuarios;
