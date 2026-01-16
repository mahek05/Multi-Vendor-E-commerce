const express = require("express");
const router = express.Router();

const cartItemController = require("../controllers/cart_item.controller");
const { verifyUser } = require("../middlewares/auth.middleware");

router.post(
    "/:id",
    verifyUser,
    cartItemController.createCartItem
);
router.get(
    "/",
    verifyUser,
    cartItemController.getAllCartItem
);
router.put(
    "/:id",
    verifyUser,
    cartItemController.updateCartItem
);

router.delete(
    "/:id",
    verifyUser,
    cartItemController.deleteCartItem
);

module.exports = router;