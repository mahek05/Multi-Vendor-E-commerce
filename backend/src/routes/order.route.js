const express = require("express");
const router = express.Router();

const orderController = require("../controllers/order.controller");
const { verifyUser } = require("../middlewares/auth.middleware");

router.post(
    "/checkout",
    verifyUser,
    orderController.checkout
);

router.get(
    "/myOrder",
    verifyUser,
    orderController.orderHistory
);

router.post(
    "/verify-payment/:payment_intent",
    verifyUser,
    orderController.verifyPayment
);

module.exports = router;