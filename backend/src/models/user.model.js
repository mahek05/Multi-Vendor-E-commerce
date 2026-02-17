const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const User = sequelize.define(
    "users",
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
        },

        phone_number: {
            type: DataTypes.STRING(15),
            allowNull: false,
        },

        stripe_account_id: {
            type: DataTypes.STRING,
            allowNull: true
        },

        stripe_customer_id: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        deleted_at: {
            type: DataTypes.DATE
        }
    },
    {
        tableName: "users",
        timestamps: true,
        underscored: true,
        paranoid: true,
        deletedAt: 'deleted_at',

        defaultScope: {
            attributes: {
                exclude: ["password"],
            },
        },
    }
);

module.exports = User;