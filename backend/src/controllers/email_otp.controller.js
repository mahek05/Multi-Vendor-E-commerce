const EmailOtp = require("../models/email_otp.model");
const emailService = require("../helpers/email_service");
const response = require("../helpers");
const crypto = require("crypto");
const { Op } = require("sequelize");

exports.send_otp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return response.error(res, 9000, 400);
        }

        // check for existing unexpired OTP
        const existingOtp = await EmailOtp.findOne({
            where: {
                email,
                is_used: false,
                expires_at: {
                    [Op.gt]: new Date(),
                },
            },
            order: [["created_at", "DESC"]],
        }); 

        if (existingOtp) {
            return response.error(res, 1018, 429);
        }

        const otp = crypto.randomInt(100000, 999999).toString();

        const expires_at = new Date();
        expires_at.setMinutes(expires_at.getMinutes() + 10);

        await EmailOtp.create({
            email,
            otp,
            expires_at,
            is_used: false,
        });

        await emailService.send_otp_email(email, otp);

        return response.success(res, 1013, null, 200);
    } catch (error) {
        console.error("Send OTP error:", error);
        return response.error(res, 9999);
    }
};

exports.verify_otp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return response.error(res, 9000, 400);
        }

        const record = await EmailOtp.findOne({
            where: {
                email,
                otp,
                is_used: false,
            },
            order: [["created_at", "DESC"]],
        });

        if (!record) {
            return response.error(res, 1014, 400);
        }

        if (new Date() > record.expires_at) {
            return response.error(res, 1015, 400);
        }

        await record.update({ is_used: true });

        return response.success(res, 1016, null, 200);
    } catch (error) {
        console.error("Verify OTP error:", error);
        return response.error(res, 9999);
    }
};