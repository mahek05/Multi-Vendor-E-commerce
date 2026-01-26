const Chat = require("../models/chat.model");
const ChatRoom = require("../models/chat_room.model");
const RoomParticipant = require("../models/room_participant.model");
const User = require("../models/user.model");
const Admin = require("../models/admin.model");
const Seller = require("../models/seller.model");
const sequelize = require("../config/sequelize");
const response = require("../helpers");

exports.getChat = async (req, res) => {
    try {
        const { room_id } = req.params;
        let myId, myRole;
        if (req.user) {
            myId = req.user.user_id;
            myRole = "USER";
        } else if (req.seller) {
            myId = req.seller.seller_id;
            myRole = "SELLER";
        } else if (req.admin) {
            myId = req.admin.admin_id;
            myRole = "ADMIN";
        } else {
            return response.error(res, 6002, 401);
        }

        const isParticipant = await RoomParticipant.findOne({
            where: {
                room_id: room_id,
                user_id: myId,
                user_role: myRole
            }
        });

        if (!isParticipant) {
            return response.error(res, 6002, 404);
        }

        const chat = await Chat.findAll({
            where: { room_id: room_id },
            order: [["created_at", "ASC"]],
        });

        return response.success(res, null, chat, 200);
    } catch (error) {
        console.error("Get Chat by room ID error:", error);
        return response.error(res, 9999);
    }
};

exports.createGroup = async (req, res) => {
    try {
        const { group_name, emails } = req.body;

        let creatorId, creatorRole;

        if (req.admin) {
            creatorId = req.admin.admin_id;
            creatorRole = "ADMIN";
        } else if (req.seller) {
            creatorId = req.seller.seller_id;
            creatorRole = "SELLER";
        } else {
            return response.error(res, 6001, 403);
        }

        const participantsToAdd = [];

        if (emails && Array.isArray(emails) && emails.length > 0) {
            for (const email of emails) {
                let user = await User.findOne({ where: { email: email } });
                if (user) {
                    participantsToAdd.push({ user_id: user.id, user_role: "USER" });
                    continue;
                }

                let seller = await Seller.findOne({ where: { email: email } });
                if (seller) {
                    participantsToAdd.push({ user_id: seller.id, user_role: "SELLER" });
                }
            }
        }

        if (participantsToAdd.length === 0) {
            return response.error(res, 6004, 404);
        }

        const newRoom = await ChatRoom.create({
            name: group_name,
            type: 'group',
            created_by: creatorId,
            created_by_role: creatorRole
        });

        const finalParticipants = participantsToAdd.map(p => ({
            room_id: newRoom.id,
            user_id: p.user_id,
            user_role: p.user_role
        }));

        finalParticipants.push({
            room_id: newRoom.id,
            user_id: creatorId,
            user_role: creatorRole
        });

        await RoomParticipant.bulkCreate(finalParticipants);

        return response.success(res, 6002, null, 200);
    } catch (error) {
        console.error("Create Group Error:", error);
        return response.error(res, 9999);
    }
};

exports.getMyRooms = async (req, res) => {
    try {
        const myId = req.user?.user_id || req.seller?.seller_id || req.admin?.admin_id;

        const participations = await RoomParticipant.findAll({
            where: { user_id: myId },
            attributes: ['room_id']
        });

        const roomIds = participations.map(p => p.room_id);

        const rooms = await ChatRoom.findAll({
            where: {
                id: roomIds,
                is_active: true
            }
        });

        return response.success(res, null, rooms, 200);
    } catch (error) {
        return response.error(res, 9999);
    }
};

exports.createPrivateChat = async (req, res) => {
    try {
        const { target_id, target_role } = req.body;
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

        const newRoom = await ChatRoom.create({
            type: "private",
            created_by: myId,
        });

        await RoomParticipant.bulkCreate([
            { room_id: newRoom.id, user_id: myId, user_role: myRole },
            { room_id: newRoom.id, user_id: target_id, user_role: target_role }
        ]);

        return response.success(res, 6005, null, 200);
    } catch (error) {
        console.error(error);
        return response.error(res, 9999);
    }
};