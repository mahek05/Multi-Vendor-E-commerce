const express = require("express");
const router = express.Router();

const orderItemController = require("../controllers/order_item.controller");
const refundController = require("../controllers/refund.controller");
const {
    verifySeller,
    verifySellerApproved,
    verifyUser,
    verifyAdmin
} = require("../middlewares/auth.middleware");

router.put(
    "/status/:id",
    verifySeller,
    orderItemController.updateStatus
);

router.get(
    "/seller/history",
    verifySeller,
    orderItemController.sellerOrderHistory
);

router.put(
    "/cancel/:order_item_id",
    verifyUser,
    orderItemController.cancelOrderItem
);

router.post(
    "/return",
    verifyUser,
    orderItemController.requestReturn
);

router.post(
    "/refund/:order_item_id",
    verifyAdmin,
    refundController.refundOrderItem
);

module.exports = router;