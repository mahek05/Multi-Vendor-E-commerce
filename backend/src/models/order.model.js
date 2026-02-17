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

        address: {
            type: DataTypes.TEXT,
            allowNull: false,
            defaultValue: "defaultValue"
        },
    },
    {
        tableName: "orders",
        timestamps: true,
        underscored: true,
    }
);

module.exports = Order;