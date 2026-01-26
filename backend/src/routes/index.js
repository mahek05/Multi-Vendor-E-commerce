const express = require("express");
const router = express.Router();

const userRoutes = require("./user.route");
const chatRoutes = require("./chat.route");
const orderRoutes = require("./order.route");
const adminRoutes = require("./admin.route");
const sellerRoutes = require("./seller.route");
const productRoutes = require("./product.route");
const categoryRoutes = require("./category.route");
const cartItemRoutes = require("./cart_item.route");
const emailOtpRoutes = require("./email_otp.route");
const orderItemRoutes = require("./order_item.route");

router.use("/user", userRoutes);
router.use("/chat", chatRoutes);
router.use("/order", orderRoutes);
router.use("/admin", adminRoutes);
router.use("/otp", emailOtpRoutes);
router.use("/cart", cartItemRoutes)
router.use("/seller", sellerRoutes);
router.use("/product", productRoutes);
router.use("/order-item", orderItemRoutes);
router.use("/category", categoryRoutes);

module.exports = router;