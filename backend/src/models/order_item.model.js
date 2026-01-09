const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const OrderItem = sequelize.define(
    "order_items",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        quantity: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
        },

        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },

        status: {
            type: DataTypes.ENUM("Order Placed", "Shipped", "Out for Delivery", "Delivered"),
            defaultValue: "Order Placed",
        },

        order_id: {
            type: DataTypes.UUID,
            references: {
                model: "orders",
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
        },
    },
    {
        tableName: "order_items",
        timestamps: true,
        underscored: true,
    }
);

module.exports = OrderItem;
