const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const EmailOtp = sequelize.define(
    "email_otps",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        user_id: {
            type: DataTypes.UUID,
            references: {
                model: "users",
                key: "id",
            },
            onDelete: "CASCADE",
        },

        otp: {
            type: DataTypes.STRING(6),
            allowNull: false,
        },

        expires_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },

        is_used: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        tableName: "email_otps",
        timestamps: true,
        underscored: true,
    }
);

module.exports = EmailOtp;