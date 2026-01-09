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

        is_deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        tableName: "categories",
        timestamps: true,
        underscored: true,
    }
);

module.exports = Category;