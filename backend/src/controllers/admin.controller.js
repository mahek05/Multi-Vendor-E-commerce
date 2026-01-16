const Admin = require("../models/admin.model");
const AuthToken = require("../models/auth_token.model");
const EmailOtp = require("../models/email_otp.model");
const Seller = require("../models/seller.model")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const response = require('../helpers');
const {
    getPaginationMetadata,
    getPaginatedResponse
} = require("../helpers/pagination");

/**
 * Admin Signup
 */
exports.signup = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
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

        const existingAdmin = await Admin.findOne({ where: { email } });

        if (existingAdmin && existingAdmin.is_deleted) {
            return response.error(res, 1009, 403); // deactivated
        }

        if (existingAdmin) {
            return response.error(res, 1003, 409); // already registered
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await Admin.create({
            email,
            password: hashedPassword,
            name,
        });

        return response.success(res, 1001, null, 201);
    } catch (error) {
        console.error(error);
        return response.error(res, 9999);
    }
};

/**
 * Admin Login
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return response.error(res, 1004, 400);
        }

        const admin = await Admin.findOne({
            where: { email },
            attributes: { include: ["password"] }
        });

        if (!admin) {
            return response.error(res, 1006, 404);
        }

        if (admin.is_deleted) {
            return response.error(res, 1009, 403);
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return response.error(res, 1007, 401);
        }

        await AuthToken.update(
            { is_active: false },
            { where: { entity_id: admin.id, entity_type: "ADMIN" } }
        );

        const accessToken = jwt.sign(
            { entity_id: admin.id, role: "ADMIN" },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        const refreshToken = jwt.sign(
            { entity_id: admin.id, role: "ADMIN" },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "7d" }
        );

        const refreshExpiry = new Date();
        refreshExpiry.setDate(refreshExpiry.getDate() + 7);

        await AuthToken.create({
            entity_id: admin.id,
            entity_type: "ADMIN",
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
 * Admin Logout
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

/**
 * Admin Profile
 */
exports.getProfile = async (req, res) => {
    try {
        const { admin_id } = req.admin;

        const admin = await Admin.findOne({
            where: { id: admin_id },
            attributes: ["name", "email"],
        });

        if (!admin) {
            return response.error(res, 1006, 404);
        }

        return response.success(res, 1010, admin, 200);
    } catch (error) {
        console.error("Admin profile error:", error);
        return response.error(res, 9999);
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { admin_id } = req.admin;
        const { name } = req.body;

        const admin = await Admin.findOne({ where: { id: admin_id } });

        if (!admin) {
            return response.error(res, 1006, 404);
        }

        await admin.update({
            name: name ?? admin.name,
        });

        return response.success(res, 1011, admin, 200);
    } catch (error) {
        console.error("Update admin profile error:", error);
        return response.error(res, 9999);
    }
};

exports.deactivateProfile = async (req, res) => {
    try {
        const { admin_id } = req.admin;

        const admin = await Admin.findOne({ where: { id: admin_id } });

        if (!admin) {
            return response.error(res, 1006, 404);
        }

        await admin.update({ is_deleted: true });

        // deactivate all tokens
        await AuthToken.update(
            { is_active: false },
            { where: { entity_id: admin_id, entity_type: "ADMIN" } }
        );

        return response.success(res, 1012, null, 200);
    } catch (error) {
        console.error("Deactivate admin error:", error);
        return response.error(res, 9999);
    }
};


exports.sellerStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;
        const { admin_id } = req.admin;

        const seller = await Seller.findOne({
            where: {
                id: id,
                is_deleted: false,
            },
        });

        if (!seller) {
            return response.error(res, 1006, 404);
        }

        await seller.update({
            status: status,
            approved_by: admin_id
        });

        return response.success(res, 1021, null, 201);
    } catch (error) {
        console.error(error);
        return response.error(res, 9999);
    }
};

exports.getSeller = async (req, res) => {
    try {
        const { page, limit, offset } = getPaginationMetadata(
            req.query.page,
            req.query.limit
        );

        const sellers = await Seller.findAndCountAll({
            where: { is_deleted: false },
            limit,
            offset,
            order: [["created_at", "DESC"]],
        });

        const paginatedResponse = getPaginatedResponse(
            sellers,
            page,
            limit
        );

        return response.success(res, null, paginatedResponse, 200);
    } catch (error) {
        console.error("Error:", error);
        return response.error(res, 9999);
    }
};