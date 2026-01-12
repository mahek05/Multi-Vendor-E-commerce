const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const { verifyUser } = require("../middlewares/auth.middleware");
const { loginRateLimit } = require("../middlewares/rate_limit.middleware");

router.post("/signup", userController.signup);
router.post("/login", loginRateLimit, userController.login);
router.post("/logout", verifyUser, userController.logout);
router.get("/profile", verifyUser, userController.getProfile);
router.put("/profile", verifyUser, userController.updateProfile);
router.delete("/profile", verifyUser, userController.deactivateProfile);

module.exports = router;