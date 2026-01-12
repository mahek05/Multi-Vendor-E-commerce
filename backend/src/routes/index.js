const express = require("express");
const router = express.Router();

const userRoutes = require("./user.route");
const adminRoutes = require("./admin.route");
const sellerRoutes = require("./seller.route");
const emailOtpRoutes = require("./email_otp.route");
const productRoutes = require("./product.route");
const categoryRoutes = require("./category.route");

router.use("/user", userRoutes);
router.use("/admin", adminRoutes);
router.use("/seller", sellerRoutes);
router.use("/otp", emailOtpRoutes);
router.use("/product", productRoutes);
router.use("/category", categoryRoutes);

module.exports = router;