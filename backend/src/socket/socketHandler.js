const Chat = require("../models/chat.model");
const RoomParticipant = require("../models/room_participant.model");
const { Op } = require("sequelize");

const onlineUsers = new Map();

module.exports = (io) => {
    io.on("connection", (socket) => {
        if (!socket.user) {
            console.error("Add user details.");
            return socket.disconnected();
        }

        const { id: userId, role: userRole } = socket.user;
        console.log(`Connected: ${userRole} ${userId}`);

        if (!onlineUsers.has(userId)) {
            onlineUsers.set(userId, new Set());
        }

        onlineUsers.get(userId).add(socket.id);

        socket.on("join_room", async ({ roomId }) => {
            try {
                if (!roomId) return socket.emit("error", "Room ID is required");

                if (socket.rooms.has(roomId)) {
                    return socket.emit("room_joined", { roomId, status: "already_joined" });
                }

                // if (userRole === "ADMIN") {
                //     socket.join(roomId);
                //     socket.to(roomId).emit("onlineStatus", { userId, isOnline: true });
                //     return socket.emit("room_joined", { roomId, status: "success" });
                // }

                const participant = await RoomParticipant.findOne({
                    where: {
                        room_id: roomId,
                        user_id: userId,
                        user_role: userRole
                    },
                    attributes: ['id']
                });

                if (participant) {
                    socket.join(roomId);
                    socket.to(roomId).emit("onlineStatus", { userId, isOnline: true });
                    socket.emit("room_joined", { roomId, status: "success" });
                } else {
                    socket.emit("error", { message: "Access denied." });
                }

            } catch (err) {
                console.error("Join Room Error:", err);
                socket.emit("error", { message: "Failed to join room" });
            }
        });

        socket.on("send_message", async ({ roomId, message }) => {
            try {
                // const { roomId, message } = data;

                if (!roomId || !message) {
                    return socket.emit("error", "Missing roomId or message");
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

            } catch (err) {
                console.error("Message Error:", err);
                socket.emit("error", { message: "Message failed to send" });
            }
        });

        socket.on("typing", ({ roomId, isTyping }) => {
            socket.to(roomId).emit("typingStatus", {
                senderId: userId,
                isTyping
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
                socket.emit("error", "Failed to get online statuses");
            }
        });

        socket.on("mark_messages_read", async ({ roomId }) => {
            try {
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

                    rooms.forEach((roomId) => {
                        if (roomId !== socket.id) {
                            io.to(roomId).emit("onlineStatus", { userId, isOnline: false });
                        }
                    });
                }
            }
        });

        socket.on("disconnect", async () => {
            console.log(`Disconnected: ${userId}`);
        });
    });
};