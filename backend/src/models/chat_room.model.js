const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const ChatRoom = sequelize.define(
    "ChatRoom",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        name: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        type: {
            type: DataTypes.ENUM("private", "group"),
            defaultValue: "private"
        },

        created_by: {
            type: DataTypes.UUID,
            allowNull: false
        },

        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    },
    {
        tableName: "chat_rooms",
        timestamps: true,
        underscored: true,
    }
);

module.exports = ChatRoom;