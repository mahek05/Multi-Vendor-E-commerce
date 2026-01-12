const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin.controller");
const { verifyAdmin } = require("../middlewares/auth.middleware");
const { loginRateLimit } = require("../middlewares/rate_limit.middleware");

router.post("/signup", adminController.signup);
router.post("/login", loginRateLimit, adminController.login);
router.post("/logout", verifyAdmin, adminController.logout);
router.get("/profile", verifyAdmin, adminController.getProfile);
router.put("/profile", verifyAdmin, adminController.updateProfile);
router.delete("/profile", verifyAdmin, adminController.deactivateProfile);

module.exports = router;