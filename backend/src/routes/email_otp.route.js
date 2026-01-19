const express = require("express");
const router = express.Router();

const emailOtpController = require("../controllers/email_otp.controller");
const validate = require("../middlewares/validate.middleware");
const {
    sendOtpSchema,
    verifyOtpSchema
} = require("../validators/otp.validator");

router.post(
    "/send",
    validate(sendOtpSchema),
    emailOtpController.send_otp
);

router.post(
    "/verify",
    validate(verifyOtpSchema),
    emailOtpController.verify_otp
);

module.exports = router;