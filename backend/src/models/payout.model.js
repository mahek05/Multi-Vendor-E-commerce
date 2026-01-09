const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Payout = sequelize.define(
    "payouts",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },

        payment_id: {
            type: DataTypes.UUID,
            references: {
                model: "payments",
                key: "id",
            },
        },

        order_item_id: {
            type: DataTypes.UUID,
            references: {
                model: "order_items",
                key: "id",
            },
        },

        is_deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        tableName: "payouts",
        timestamps: true,
        underscored: true,
    }
);

module.exports = Payout;