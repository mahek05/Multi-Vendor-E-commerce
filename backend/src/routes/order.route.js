const express = require("express");
const router = express.Router();

const orderController = require("../controllers/order.controller");
const { verifyUser } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { checkoutSchema } = require("../validators/order.validator");

router.post(
    "/checkout",
    verifyUser,
    validate(checkoutSchema),
    orderController.checkout
);

router.get(
    "/myOrder",
    verifyUser,
    orderController.orderHistory
);

module.exports = router;