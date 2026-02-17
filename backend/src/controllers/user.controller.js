const User = require("../models/user.model");
const AuthToken = require("../models/auth_token.model");
const { createConnectedAccount, generateOnboardingLink } = require("../helpers/stripe.helper");
const EmailOtp = require("../models/email_otp.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const response = require('../helpers');
const {
    generateToken,
    deactivateToken
} = require("../helpers/token.helper");

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

        const existingUser = await User.findOne({
            where: { email },
            paranoid: false,
        });

        if (existingUser && existingUser.deleted_at !== null) {
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

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return response.error(res, 1007, 401);
        }

        const token = await generateToken(user.id, "USER");

        return response.success(res, 1002, {
            entity_id: token.entity_id,
            access_token: token.access_token,
            refresh_token: token.refresh_token,
            role: "USER"
        }, 200);
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

        await deactivateToken(token);

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
            attributes: ["id", "name", "email", "address", "phone_number"],
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
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return response.error(res, 1008, 401);
        }

        const user = await User.findOne({ where: { id: user_id } });

        if (!user) {
            return response.error(res, 1006, 404);
        }

        await user.destroy();

        await deactivateToken(token);

        return response.success(res, 1012, null, 200);
    } catch (error) {
        console.error("Deactivate user error:", error);
        return response.error(res, 9999);
    }
};

exports.onboardStripe = async (req, res) => {
    try {
        const { user_id } = req.user;

        const user = await User.findByPk(user_id);
        if (!user) return response.error(res, 1006, 404);

        if (!user.stripe_account_id) {
            user.stripe_account_id = await createConnectedAccount(user.email);
            await user.save();
        }

        const url = await generateOnboardingLink(
            user.stripe_account_id,
            'http://localhost:5173/seller/products'
        );

        return response.success(res, 1025, { url }, 200);
    } catch (error) {
        console.error("Stripe User Onboarding Error:", error);
        return response.error(res, 9999);
    }
};