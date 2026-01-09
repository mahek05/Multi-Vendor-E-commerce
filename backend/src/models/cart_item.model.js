const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const CartItem = sequelize.define(
    "cart_items",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        quantity: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            allowNull: false,
        },

        cart_id: {
            type: DataTypes.UUID,
            references: {
                model: "carts",
                key: "id",
            },
            onDelete: "CASCADE",
        },

        product_id: {
            type: DataTypes.UUID,
            references: {
                model: "products",
                key: "id",
            },
            onDelete: "CASCADE",
        },
    },
    {
        tableName: "cart_items",
        timestamps: true,
        underscored: true,
    }
);

module.exports = CartItem;
