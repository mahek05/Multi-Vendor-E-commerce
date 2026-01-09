const express = require("express");
const router = express.Router();

const userRoutes = require("./user.route");
const adminRoutes = require("./admin.route");
const sellerRoutes = require("./seller.route")

router.use("/user", userRoutes);
router.use("/admin", adminRoutes);
router.use("/seller", sellerRoutes);

module.exports = router;