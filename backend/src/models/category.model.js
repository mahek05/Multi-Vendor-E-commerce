const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Category = sequelize.define(
    "categories",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        category_name: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },

        deleted_at: {
            type: DataTypes.DATE
        }
    },
    {
        tableName: "categories",
        timestamps: true,
        underscored: true,
        paranoid: true,
        deletedAt: 'deleted_at',
    }
);

module.exports = Category;