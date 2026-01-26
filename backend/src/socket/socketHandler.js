const Chat = require("../models/chat.model");
const RoomParticipant = require("../models/room_participant.model");

const onlineUsers = new Map();

module.exports = (io) => {
    io.on("connection", (socket) => {
        const { id: userId, role: userRole } = socket.user;

        console.log(`Connected: ${userRole} (${userId})`);

        // if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
        // onlineUsers.get(userId).add(socket.id);
        // socket.join(userId);

        // socketsInRoom.forEach((s) => {
        //     if (s.userId !== userId && !existingUsers.has(s.userId)) {
        //         existingUsers.add(s.userId);
        //         socket.emit("onlineStatus", { userId: s.userId, isOnline: true });
        //     }
        // });

        socket.to(roomId).emit("onlineStatus", { userId: userId, isOnline: true });

        socket.on("join_room", async (roomId) => {
            try {
                if (!roomId) return socket.emit("error", "Room ID is required");

                if (socket.rooms.has(roomId)) {
                    return socket.emit("room_joined", { roomId, status: "already_joined" });
                }

                if (userRole === "ADMIN") {
                    socket.join(roomId);
                    console.log(`Admin joined room: ${roomId}`);
                    return socket.emit("room_joined", { roomId, status: "success" });
                }

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
                    console.log(`Access Granted: ${userRole} joined ${roomId}`);
                    socket.emit("room_joined", { roomId, status: "success" });
                } else {
                    console.warn(`Access Denied: ${userRole} ${userId} tried to join ${roomId}`);
                    socket.emit("error", { message: "Access denied. You are not a member of this chat." });
                }

            } catch (err) {
                console.error("Join Room Error:", err);
                socket.emit("error", { message: "Internal server error" });
            }
        });

        socket.on("send_message", async (payload) => {
            try {
                const data = typeof payload === "string" ? JSON.parse(payload) : payload;
                const { roomId, message } = data;

                if (!roomId || !message) {
                    return socket.emit("error", "Missing roomId or message");
                }

                if (!socket.rooms.has(roomId)) {
                    return socket.emit("error", {
                        code: "NOT_JOINED",
                        message: "You must emit 'join_room' before sending messages."
                    });
                }

                const newChat = await Chat.create({
                    room_id: roomId,
                    sender_id: userId,
                    message: message
                });

                const responseData = newChat.toJSON();
                responseData.sender_role = userRole;

                io.to(roomId).emit("receive_message", responseData);

            } catch (err) {
                console.error("Message Error:", err);
                socket.emit("error", { message: "Message failed to send" });
            }
        });

        // socket.on("typing", ({ roomId, isTyping }) => {
        //     socket.to(roomId).emit("typingStatus", {
        //         senderId: socket.userId,
        //         isTyping
        //     });
        // });

        // socket.on("getOnlineStatuses", () => {
        //     try {
        //         const statuses = {};
        //         onlineUsers.forEach((socketsSet, userId) => {
        //             statuses[userId] = socketsSet.size > 0;
        //         });

        //         socket.emit("onlineStatuses", statuses);
        //     } catch (err) {
        //         console.error("Error fetching online statuses:", err);
        //         socket.emit("error", "Failed to get online statuses");
        //     }
        // });

        socket.on("disconnect", async () => {
            const sockets = onlineUsers.get(userId);
            if (sockets) {
                sockets.delete(socket.id);
                // if (sockets.size === 0) {
                //     onlineUsers.delete(userId);
                //     await broadcastOnlineStatus(io, userId, false);
                // }
            }
            console.log(`[DISCONNECT] userId=${userId}, socketId=${socket.id}`);
        });
    });
};