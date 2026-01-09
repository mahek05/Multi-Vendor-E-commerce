const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Seller = sequelize.define(
    "sellers",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },

        password: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        address: {
            type: DataTypes.TEXT,
            allowNull: false
        },

        phone_number: {
            type: DataTypes.STRING(15),
            allowNull: false,
        },

        status: {
            type: DataTypes.ENUM("Pending", "Approved", "Rejected"),
            defaultValue: "Pending",
        },

        approved_by: {
            type: DataTypes.UUID,
            references: {
                model: "admins",
                key: "id",
            },
        },

        is_deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        tableName: "sellers",
        timestamps: true,
        underscored: true,
    }
);

module.exports = Seller;