const User = require("../models/user.model");
const AuthToken = require("../models/auth_token.model");
const EmailOtp = require("../models/email_otp.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const response = require('../helpers');

exports.signup = async (req, res) => {
    try {
        const { name, email, password, address, phone_number } = req.body;
        
        const otpRecord = await EmailOtp.findOne({
            where: {
                email,
                is_used: true,
            },
            order: [["updated_at", "DESC"]],
        });

        if (!otpRecord) {
            return response.error(res, 1017, 403);
        }

        const existingUser = await User.findOne({ where: { email } });

        if (existingUser && existingUser.is_deleted) {
            return response.error(res, 1009, 403);
        }

        if (existingUser) {
            return response.error(res, 1003, 409);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
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

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({
            where: { email },
            attributes: { include: ["password"] }
        });

        if (!user) {
            return response.error(res, 1006, 404);
        }

        if (user.is_deleted) {
            return response.error(res, 1009, 403);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return response.error(res, 1007, 401);
        }

        await AuthToken.update(
            { is_active: false },
            { where: { entity_id: user.id, entity_type: "USER" } }
        );

        const accessToken = jwt.sign(
            { entity_id: user.id, role: "USER" },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        const refreshToken = jwt.sign(
            { entity_id: user.id, role: "USER" },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "7d" }
        );

        const refreshExpiry = new Date();
        refreshExpiry.setDate(refreshExpiry.getDate() + 7);

        await AuthToken.create({
            entity_id: user.id,
            entity_type: "USER",
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
        const { user_id } = req.user;

        const user = await User.findOne({
            where: { id: user_id },
            attributes: ["name", "email", "address", "phone_number"],
        });

        if (!user) {
            return response.error(res, 1006, 404);
        }

        return response.success(res, 1010, user, 200);
    } catch (error) {
        console.error("Admin profile error:", error);
        return response.error(res, 9999);
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { user_id } = req.user;
        const { name, address, phone_number } = req.body;

        const user = await User.findOne({ where: { id: user_id } });

        if (!user) {
            return response.error(res, 1006, 404);
        }

        await user.update({
            name: name ?? user.name,
            address: address ?? user.address,
            phone_number: phone_number ?? user.phone_number,
        });

        return response.success(res, 1011, user, 200);
    } catch (error) {
        console.error("Update user profile error:", error);
        return response.error(res, 9999);
    }
};

exports.deactivateProfile = async (req, res) => {
    try {
        const { user_id } = req.user;

        const user = await User.findOne({ where: { id: user_id } });

        if (!user) {
            return response.error(res, 1006, 404);
        }

        await user.update({ is_deleted: true });

        await AuthToken.update(
            { is_active: false },
            { where: { entity_id: user_id, entity_type: "USER" } }
        );

        return response.success(res, 1012, null, 200);
    } catch (error) {
        console.error("Deactivate user error:", error);
        return response.error(res, 9999);
    }
};