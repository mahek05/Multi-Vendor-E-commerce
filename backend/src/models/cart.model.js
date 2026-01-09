const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Cart = sequelize.define(
    "carts",
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
            onDelete: "CASCADE",
        },
    },
    {
        tableName: "carts",
        timestamps: true,
        underscored: true,
    }
);

module.exports = Cart;