const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const EmailOtp = sequelize.define(
    "EmailOtp",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        email: {
            type: DataTypes.STRING,
            allowNull: false,
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
        underscored: true,
        timestamps: true,
    }
);

module.exports = EmailOtp;
