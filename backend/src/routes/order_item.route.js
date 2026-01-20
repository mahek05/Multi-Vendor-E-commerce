const express = require("express");
const router = express.Router();

const orderItemController = require("../controllers/order_item.controller");
const {
    verifySeller,
    verifySellerApproved,
    verifyUser
} = require("../middlewares/auth.middleware");

router.put(
    "/status/:id",
    verifySeller,
    verifySellerApproved,
    orderItemController.updateStatus
);

router.get(
    "/seller/history",
    verifySeller,
    verifySellerApproved,
    orderItemController.sellerOrderHistory
);

router.put(
    "/cancel/:order_item_id",
    verifyUser,
    orderItemController.cancelOrderItem
);

router.put(
    "/return/:order_item_id",
    verifyUser,
    orderItemController.requestReturn
);

module.exports = router;