const express = require("express");
const router = express.Router();

const cartItemController = require("../controllers/cart_item.controller");
const { verifyUser } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const {
    createCartItemSchema,
    updateCartItemSchema
} = require("../validators/cart.validator");

router.post(
    "/:id",
    verifyUser,
    validate(createCartItemSchema),
    cartItemController.createCartItem
);
router.get(
    "/",
    verifyUser,
    validate(updateCartItemSchema),
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