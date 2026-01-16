const Seller = require("../models/seller.model");
const AuthToken = require("../models/auth_token.model");
const EmailOtp = require("../models/email_otp.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const response = require('../helpers');

/**
 * Seller Signup
 */
exports.signup = async (req, res) => {
    try {
        const { name, email, password, address, phone_number } = req.body;

        if (!name || !email || !password) {
            return response.error(res, 9000, 400);
        }

        const otpRecord = await EmailOtp.findOne({
            where: {
                email,
                is_used: true,
            },
            order: [["updated_at", "DESC"]],
        });

        if (!otpRecord) {
            return response.error(res, 1017, 403); // email not verified
        }

        const existingSeller = await Seller.findOne({ where: { email } });

        if (existingSeller && existingSeller.is_deleted) {
            return response.error(res, 1009, 403);
        }

        if (existingSeller) {
            return response.error(res, 1003, 409);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await Seller.create({
            name,
            email,
            password: hashedPassword,
            address,
            phone_number,
        });

        return response.success(res, 1001, null, 201);
    } catch (error) {
        console.error(error);
        return response.error(res, 9999);
    }
};

/**
 * Seller Login
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return response.error(res, 1004, 400);
        }

        const seller = await Seller.findOne({
            where: { email },
            attributes: { include: ["password"] }
        });

        if (!seller) {
            return response.error(res, 1006, 404);
        }

        if (seller.is_deleted) {
            return response.error(res, 1009, 403);
        }

        const isMatch = await bcrypt.compare(password, seller.password);
        if (!isMatch) {
            return response.error(res, 1007, 401);
        }

        await AuthToken.update(
            { is_active: false },
            { where: { entity_id: seller.id, entity_type: "SELLER" } }
        );

        const accessToken = jwt.sign(
            { entity_id: seller.id, role: "SELLER" },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        const refreshToken = jwt.sign(
            { entity_id: seller.id, role: "SELLER" },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "7d" }
        );

        const refreshExpiry = new Date();
        refreshExpiry.setDate(refreshExpiry.getDate() + 7);

        await AuthToken.create({
            entity_id: seller.id,
            entity_type: "SELLER",
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_at: refreshExpiry,
            is_active: true,
        });

        return response.success(
            res,
            1002,
            { access_token: accessToken, refresh_token: refreshToken },
            200
        );
    } catch (error) {
        console.error(error);
        return response.error(res, 9999);
    }
};

/**
 * Seller Logout
 */
exports.logout = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return response.error(res, 1008, 401);
        }

        await AuthToken.update(
            { is_active: false },
            { where: { access_token: token } }
        );

        return response.success(res, 1005, null, 200);
    } catch (error) {
        console.error(error);
        return response.error(res, 9999);
    }
};

exports.getProfile = async (req, res) => {
    try {
        const { seller_id } = req.seller;

        const seller = await Seller.findOne({
            where: { id: seller_id },
            attributes: ["name", "email", "address", "phone_number"],
        });

        if (!seller) {
            return response.error(res, 1006, 404);
        }

        return response.success(res, 1010, seller, 200);
    } catch (error) {
        console.error("Seller profile error:", error);
        return response.error(res, 9999);
    }
};


/**
 * Update profile
 */
exports.updateProfile = async (req, res) => {
    try {
        const { seller_id } = req.seller;
        const { name, address, phone_number } = req.body;

        const seller = await Seller.findOne({ where: { id: seller_id } });

        if (!seller) {
            return response.error(res, 1006, 404); // Seller not found
        }

        await seller.update({
            name: name ?? seller.name,
            address: address ?? seller.address,
            phone_number: phone_number ?? seller.phone_number,
        });

        return response.success(res, 1011, seller, 200);
    } catch (error) {
        console.error("Update seller profile error:", error);
        return response.error(res, 9999);
    }
};

exports.deactivateProfile = async (req, res) => {
    try {
        const { seller_id } = req.seller;

        const seller = await Seller.findOne({ where: { id: seller_id } });

        if (!seller) {
            return response.error(res, 1006, 404);
        }

        await seller.update({ is_deleted: true });

        // deactivate all tokens
        await AuthToken.update(
            { is_active: false },
            { where: { entity_id: seller_id, entity_type: "SELLER" } }
        );

        return response.success(res, 1012, null, 200);
    } catch (error) {
        console.error("Deactivate seller error:", error);
        return response.error(res, 9999);
    }
};
