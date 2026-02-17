const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Product = sequelize.define(
    "products",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        product_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },

        stock: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false
        },

        image: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        category_id: {
            type: DataTypes.UUID,
            references: {
                model: "categories",
                key: "id",
            },
        },

        seller_id: {
            type: DataTypes.UUID,
            references: {
                model: "sellers",
                key: "id",
            },
        },

        deleted_at: {
            type: DataTypes.DATE
        }
    },
    {
        tableName: "products",
        timestamps: true,
        underscored: true,
        paranoid: true,
        deletedAt: 'deleted_at',
    }
);

module.exports = Product;