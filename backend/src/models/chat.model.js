const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Chat = sequelize.define(
    "Chat",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        sender_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },

        room_id: {
            type: DataTypes.UUID,
            references: {
                model: "chat_rooms",
                key: "id",
            },
            onDelete: "CASCADE",
        },

        message: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    },
    {
        tableName: "chats",
        timestamps: true,
        underscored: true,
    }
);

module.exports = Chat;