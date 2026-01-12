const express = require("express");
const router = express.Router();

const emailOtpController = require("../controllers/email_otp.controller");

router.post("/send", emailOtpController.send_otp);
router.post("/verify", emailOtpController.verify_otp);

module.exports = router;