const express = require("express");
const router = express.Router();

const sellerController = require("../controllers/seller.controller");
const { verifySeller } = require("../middlewares/auth.middleware");

router.post("/signup", sellerController.signup);
router.post("/login", sellerController.login);
router.post("/logout", verifySeller, sellerController.logout);
router.get("/profile", verifySeller, sellerController.getProfile);
router.put("/profile", verifySeller, sellerController.updateProfile);
router.delete("/profile", verifySeller, sellerController.deactivateProfile);

module.exports = router;