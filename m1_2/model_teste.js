const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("./conn.js");

const Customer = sequelize.define(
    "Customer",
    {
        customer_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        store_id: {
            // foreign key do store
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "Store",
                key: "store_id",
            },
        },
        first_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        last_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
        },
        address_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "Address",
                key: "address_id",
            },
        },
        active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true, // quando cria vem como active
        },
        create_date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW, // utilizar isso para instanciar a data atual na hor ad acriacao
        },
        last_update: {
            type: DataTypes.DATE,
            defaultValue: Sequelize.NOW,
        },
    },
    {
        tableName: "customer",
        timestamps: false,
    }
);

const Rental = sequelize.define(
    "Rental",
    {
        rental_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        rental_date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW, // utilizar isso para instanciar a data atual na hor ad acriacao
        },
        inventory_id: {
            // foreign key to inventory
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "Inventory",
                key: "inventory_id",
            },
        },
        customer_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "Customer",
                key: "customer_id",
            },
        },
        return_date: {
            type: DataTypes.DATE,
        },
        staff_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "Staff",
                key: "staff_id",
            },
        },
        last_update: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW,
        },
    },
    {
        tableName: "rental",
        timestamps: false,
    }
);

const Payment = sequelize.define(
    "Payment",
    {
        payment_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        customer_id: {
            // foreign key do customer
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "Customer",
                key: "customer_id",
            },
        },
        staff_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        rental_id: {
            // foreign key para rental
            type: DataTypes.INTEGER,
            allowNull: true, // teoricamente pode ser  nulo, se um pagamento nao for ligado a rental
            references: {
                model: "Rental",
                key: "rental_id",
            },
        },
        amount: {
            type: DataTypes.DECIMAL(5, 2), // 5 digitos no total, 2 depois da virgula, conforme esta no banco
            allowNull: false,
        },
        payment_date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW,
        },
        last_update: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW,
        },
    },
    {
        tableName: "payment",
        timestamps: false,
    }
);

// Definindo relações
Rental.belongsTo(Customer, { foreignKey: "customer_id" }); // cada rental so tem um customer
Customer.hasMany(Rental, { foreignKey: "customer_id" }); // porem um customer pode ter varios rentals

Payment.belongsTo(Customer, { foreignKey: "customer_id" }); // cada pagamento so tem um customer
Customer.hasMany(Payment, { foreignKey: "customer_id" }); // porem um customer pode ter varios pagamentos

Payment.belongsTo(Rental, { foreignKey: "rental_id" }); // cada pagamento so tem um rental
Rental.hasOne(Payment, { foreignKey: "rental_id" }); // cada rental so tem um pagamento

// module.exports = { Customer, Rental, Payment };
module.exports = Customer;
