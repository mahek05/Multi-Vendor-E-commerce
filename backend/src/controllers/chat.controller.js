const Chat = require("../models/chat.model");
const ChatRoom = require("../models/chat_room.model");
const RoomParticipant = require("../models/room_participant.model");
const User = require("../models/user.model");
const Admin = require("../models/admin.model");
const Seller = require("../models/seller.model");
const response = require("../helpers");
const { Op } = require("sequelize");
const sequelize = require("../config/sequelize");

exports.getChat = async (req, res) => {
    try {
        const { room_id } = req.params;

        const room = await ChatRoom.findByPk(room_id);
        if (!room) return response.error(res, 6002, 404);

        const rawParticipants = await RoomParticipant.findAll({
            where: { room_id }
        });

        const participants = [];

        for (const p of rawParticipants) {
            let name = "Unknown";

            if (p.user_role === "USER") {
                const user = await User.findByPk(p.user_id);
                name = user?.name || user?.email;
            }

            if (p.user_role === "SELLER") {
                const seller = await Seller.findByPk(p.user_id);
                name = seller?.name || seller?.email;
            }

            if (p.user_role === "ADMIN") {
                const admin = await Admin.findByPk(p.user_id);
                name = admin?.name || admin?.email;
            }

            participants.push({
                user_id: p.user_id,
                user_role: p.user_role,
                name
            });
        }

        const messages = await Chat.findAll({
            where: { room_id },
            order: [["created_at", "ASC"]]
        });

        return response.success(res, null, {
            room,
            participants,
            messages
        }, 200);
    } catch (error) {
        console.error(error);
        return response.error(res, 9999);
    }
};

exports.getMyRooms = async (req, res) => {
    try {
        const myId =
            req.user?.user_id ||
            req.seller?.seller_id ||
            req.admin?.admin_id;

        const participations = await RoomParticipant.findAll({
            where: { user_id: myId },
            attributes: ["room_id"]
        });

        const roomIds = participations.map(p => p.room_id);
        const finalRooms = [];

        for (const roomId of roomIds) {

            const room = await ChatRoom.findByPk(roomId);
            if (!room || !room.is_active) continue;

            const latestMessage = await Chat.findOne({
                where: { room_id: roomId },
                order: [["created_at", "DESC"]]
            });

            const unreadCount = await Chat.count({
                where: {
                    room_id: roomId,
                    is_read: false,
                    sender_id: { [Op.ne]: myId }
                }
            });

            const rawParticipants = await RoomParticipant.findAll({
                where: { room_id: roomId }
            });

            const participants = [];

            for (const p of rawParticipants) {
                let name = "Unknown";

                if (p.user_role === "USER") {
                    const user = await User.findByPk(p.user_id);
                    name = user?.name || user?.email;
                }

                if (p.user_role === "SELLER") {
                    const seller = await Seller.findByPk(p.user_id);
                    name = seller?.name || seller?.email;
                }

                if (p.user_role === "ADMIN") {
                    const admin = await Admin.findByPk(p.user_id);
                    name = admin?.name || admin?.email;
                }

                participants.push({
                    user_id: p.user_id,
                    user_role: p.user_role,
                    name
                });
            }

            finalRooms.push({
                ...room.toJSON(),
                participants,
                latest_message: latestMessage,
                unread_count: unreadCount
            });
        }

        finalRooms.sort((a, b) => {
            const aTime = new Date(
                a.latest_message?.created_at ||
                a.latest_message?.createdAt ||
                a.created_at ||
                a.createdAt ||
                0
            ).getTime();

            const bTime = new Date(
                b.latest_message?.created_at ||
                b.latest_message?.createdAt ||
                b.created_at ||
                b.createdAt ||
                0
            ).getTime();

            return bTime - aTime;
        });

        return response.success(res, null, finalRooms, 200);
    } catch (error) {
        console.error(error);
        return response.error(res, 9999);
    }
};

exports.createGroup = async (req, res) => {
    try {
        const { group_name, participant_ids } = req.body;

        if (!group_name || !participant_ids || participant_ids.length === 0) {
            return response.error(res, 6002, 400);
        }

        let myId, myRole;
        if (req.admin) {
            myId = req.admin.admin_id;
            myRole = "ADMIN";
        } else if (req.seller) {
            myId = req.seller.seller_id;
            myRole = "SELLER";
        } else {
            return response.error(res, 6001, 403);
        }

        const newRoom = await ChatRoom.create({
            name: group_name,
            type: "group",
            created_by: myId,
            created_by_role: myRole
        });

        const participants = [];

        participants.push({
            room_id: newRoom.id,
            user_id: myId,
            user_role: myRole
        });

        for (const id of participant_ids) {
            let role = null;

            const seller = await Seller.findByPk(id);
            if (seller) role = "SELLER";

            const user = await User.findByPk(id);
            if (user) role = "USER";

            const admin = await Admin.findByPk(id);
            if (admin) role = "ADMIN";

            if (role) {
                participants.push({
                    room_id: newRoom.id,
                    user_id: id,
                    user_role: role
                });
            }
        }

        await RoomParticipant.bulkCreate(participants);
        return response.success(res, 6008, newRoom.id, 200);
    } catch (error) {
        console.error("Create Group Error:", error);
        return response.error(res, 9999);
    }
};

exports.createPrivateChat = async (req, res) => {
    try {
        const { target_id } = req.body;
        let targetRole = null;

        const seller = await Seller.findByPk(target_id);
        if (seller) targetRole = "SELLER";

        const user = await User.findByPk(target_id);
        if (user) targetRole = "USER";

        if (!targetRole) {
            return response.error(res, 6002, 404);
        }

        let myId, myRole;

        if (req.seller) {
            myId = req.seller.seller_id;
            myRole = "SELLER";
        } else if (req.admin) {
            myId = req.admin.admin_id;
            myRole = "ADMIN";
        } else {
            return response.error(res, 6002, 404);
        }

        const existingRooms = await RoomParticipant.findAll({
            where: {
                user_id: [myId, target_id]
            },
            attributes: ["room_id"],
            group: ["room_id"],
            having: sequelize.literal("COUNT(room_id) = 2")
        });

        for (const room of existingRooms) {
            const roomData = await ChatRoom.findOne({
                where: {
                    id: room.room_id,
                    type: "private"
                }
            });

            if (roomData) {
                return response.success(res, 6007, roomData.id, 200);
            }
        }

        const newRoom = await ChatRoom.create({
            type: "private",
            created_by: myId,
        });

        await RoomParticipant.bulkCreate([
            { room_id: newRoom.id, user_id: myId, user_role: myRole },
            { room_id: newRoom.id, user_id: target_id, user_role: targetRole }
        ]);

        return response.success(res, 6005, newRoom.id, 200);
    } catch (error) {
        console.error("Create Private Chat Error: ", error);
        return response.error(res, 9999);
    }
};