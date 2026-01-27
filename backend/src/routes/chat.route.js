const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.controller");
const {
    verifyUser,
    verifySeller,
    verifyAdmin
} = require("../middlewares/auth.middleware")

router.post(
    "/seller/chat",
    verifySeller,
    chatController.createPrivateChat
);

router.post(
    "/admin/chat",
    verifyAdmin,
    chatController.createPrivateChat
)

router.get(
    "/user/rooms",
    verifyUser,
    chatController.getMyRooms
);

router.get(
    "/seller/rooms",
    verifySeller,
    chatController.getMyRooms
);

router.get(
    "/admin/rooms",
    verifyAdmin,
    chatController.getMyRooms
);

router.post(
    "/admin/group",
    verifyAdmin,
    chatController.createGroup
);

router.post(
    "/seller/group",
    verifySeller,
    chatController.createGroup
);

router.get(
    "/seller/:room_id",
    verifySeller,
    chatController.getChat
);

router.get(
    "/admin/:room_id",
    verifyAdmin,
    chatController.getChat
);

router.get(
    "/user/:room_id",
    verifyUser,
    chatController.getChat
);

module.exports = router;