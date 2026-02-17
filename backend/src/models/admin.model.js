const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Admin = sequelize.define(
    "admins",
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

        deleted_at: {
            type: DataTypes.DATE
        }
    },
    {
        tableName: "admins",
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

module.exports = Admin;