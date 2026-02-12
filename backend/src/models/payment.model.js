const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Payment = sequelize.define(
    "payments",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        gateway_payment_id: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },

        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },

        order_id: {
            type: DataTypes.UUID,
            references: {
                model: "orders",
                key: "id",
            },
        },

        refunded_amount: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0.00,
        },

        payment_status: {
            type: DataTypes.ENUM("Pending", "Paid", "Refunded", "Partially_Refunded"),
            defaultValue: "Pending",
        },

        is_deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        tableName: "payments",
        timestamps: true,
        underscored: true,
    }
);

module.exports = Payment;