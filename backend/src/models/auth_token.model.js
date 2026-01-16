const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const AuthToken = sequelize.define(
    "auth_tokens",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        entity_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },

        entity_type: {
            type: DataTypes.ENUM("USER", "ADMIN", "SELLER"),
            allowNull: false,
        },

        access_token: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        refresh_token: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },

        expires_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    },
    {
        tableName: "auth_tokens",
        timestamps: true,
        underscored: true,

        defaultScope: {
            attributes: {
                exclude: ["refresh_token"],
            },
        },
    }
);

module.exports = AuthToken;