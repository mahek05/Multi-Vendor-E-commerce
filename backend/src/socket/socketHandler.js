const Chat = require("../models/chat.model");
const RoomParticipant = require("../models/room_participant.model");
const { Op } = require("sequelize");

const onlineUsers = new Map();

module.exports = (io) => {
    io.on("connection", (socket) => {
        if (!socket.user) {
            console.error("Add user details.");
            return socket.disconnect(true);
        }

        const { id: userId, role: userRole } = socket.user;

        if (!onlineUsers.has(userId)) {
            onlineUsers.set(userId, new Set());
        }

        onlineUsers.get(userId).add(socket.id);
        const personalRoom = `${userRole}:${userId}`;
        socket.join(personalRoom);

        socket.on("join_room", async ({ roomId }) => {
            try {
                if (!roomId) return;

                const participant = await RoomParticipant.findOne({
                    where: {
                        room_id: roomId,
                        user_id: userId,
                        user_role: userRole
                    }
                });

                if (!participant) {
                    return socket.emit("chat_error", { message: "Access denied." });
                }
                socket.join(roomId);

                const statuses = {};
                onlineUsers.forEach((set, id) => {
                    statuses[id] = set.size > 0;
                });

                io.emit("onlineStatus", statuses);
                socket.emit("room_joined", { roomId });
            } catch (err) {
                console.error("Join Room Error:", err);
            }
        });

        socket.on("send_message", async ({ roomId, message }) => {
            try {
                if (!roomId || !message) {
                    return socket.emit("chat_error", { message: "Missing roomId or message" });
                }

                const roomSockets = io.sockets.adapter.rooms.get(roomId);
                const isReceiverInRoom = roomSockets && roomSockets.size > 1;

                const newChat = await Chat.create({
                    room_id: roomId,
                    sender_id: userId,
                    message: message,
                    is_read: isReceiverInRoom ? true : false
                });

                const responseData = newChat.toJSON();
                responseData.sender_role = userRole;

                io.to(roomId).emit("receive_message", responseData);

                const participants = await RoomParticipant.findAll({
                    where: { room_id: roomId },
                    attributes: ["user_id", "user_role"]
                });

                participants.forEach((participant) => {
                    io.to(`${participant.user_role}:${participant.user_id}`).emit("room_message", responseData);
                });
            } catch (err) {
                console.error("Message Error:", err);
                socket.emit("chat_error", { message: "Message failed to send" });
            }
        });

        socket.on("typing", ({ roomId, isTyping }) => {
            socket.to(roomId).emit("typingStatus", {
                roomId,
                senderId: userId,
                isTyping
            });

            RoomParticipant.findAll({
                where: { room_id: roomId },
                attributes: ["user_id", "user_role"]
            })
                .then((participants) => {
                    participants.forEach((participant) => {
                        if (String(participant.user_id) === String(userId)) return;
                        io.to(`${participant.user_role}:${participant.user_id}`).emit("typingStatus", {
                            roomId,
                            senderId: userId,
                            isTyping
                        });
                    });
                })
                .catch((err) => {
                    console.error("Typing Broadcast Error:", err);
                });
        });

        socket.on("getOnlineStatuses", () => {
            try {
                const statuses = {};
                onlineUsers.forEach((socketsSet, id) => {
                    statuses[id] = socketsSet.size > 0;
                });

                socket.emit("onlineStatus", statuses);
            } catch (err) {
                console.error("Error fetching online statuses:", err);
                socket.emit("chat_error", { message: "Failed to get online statuses" });
            }
        });

        socket.on("mark_messages_read", async ({ roomId }) => {
            try {
                if (!roomId) {
                    return;
                }
                const unreadMessages = await Chat.findAll({
                    where: {
                        room_id: roomId,
                        is_read: false,
                        sender_id: { [Op.ne]: userId }
                    },
                    attributes: ['id']
                });

                if (unreadMessages.length === 0) {
                    return;
                }

                const messageIds = unreadMessages.map(msg => msg.id);

                await Chat.update(
                    { is_read: true },
                    {
                        where: {
                            id: messageIds
                        }
                    }
                );

                io.to(roomId).emit("messages_read_update", {
                    roomId,
                    readBy: userId,
                    timestamp: new Date()
                });
            } catch (err) {
                console.error("Mark Read Error:", err);
            }
        });

        socket.on("disconnecting", () => {
            const rooms = [...socket.rooms];
            const userSockets = onlineUsers.get(userId);

            if (userSockets) {
                userSockets.delete(socket.id);

                if (userSockets.size === 0) {
                    onlineUsers.delete(userId);

                    const statuses = {};
                    onlineUsers.forEach((set, id) => {
                        statuses[id] = set.size > 0;
                    });

                    io.emit("onlineStatus", statuses);
                }
            }
        });

        socket.on("disconnect", async () => {
        });
    });
};