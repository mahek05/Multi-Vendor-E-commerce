const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Order = sequelize.define(
    "orders",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        user_id: {
            type: DataTypes.UUID,
            references: {
                model: "users",
                key: "id",
            },
        },

        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00
        },

        address: {
            type: DataTypes.TEXT,
            allowNull: false,
            defaultValue: "defaultValue"
        },

        is_deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        tableName: "orders",
        timestamps: true,
        underscored: true,
    }
);

module.exports = Order;