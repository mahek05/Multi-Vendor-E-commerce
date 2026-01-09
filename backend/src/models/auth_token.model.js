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

        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "users",
                key: "id",
            },
            onDelete: "CASCADE",
        },

        access_token: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        refresh_token: {
            type: DataTypes.TEXT,
            allowNull: false,
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
    }
);

module.exports = AuthToken;
