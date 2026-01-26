const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const RoomParticipant = sequelize.define(
    "RoomParticipant",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },

        room_id: {
            type: DataTypes.UUID,
            references: {
                model: "chat_rooms",
                key: "id",
            },
            onDelete: "CASCADE",
        },

        user_id: {
            type: DataTypes.UUID,
            allowNull: false
        },

        user_role: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    {
        tableName: "room_participants",
        underscored: true,
        timestamps: true
    }
);

module.exports = RoomParticipant;