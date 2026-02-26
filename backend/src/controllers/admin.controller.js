const bcrypt = require("bcryptjs");
const response = require('../helpers');
const { Op } = require("sequelize");
const Admin = require("../models/admin.model");
const EmailOtp = require("../models/email_otp.model");
const User = require("../models/user.model");
const Payout = require("../models/payout.model");
const Seller = require("../models/seller.model");
const Product = require("../models/product.model");
const OrderItem = require("../models/order_item.model");
const {
    generateToken,
    deactivateToken
} = require("../helpers/token.helper");

exports.signup = async (req, res) => {
    try {
        const { email, password, name } = req.body;

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

        const existingAdmin = await Admin.findOne({
            where: { email },
            paranoid: false
        });

        if (existingAdmin && existingAdmin.deleted_at !== null) {
            return response.error(res, 1009, 403);
        }

        if (existingAdmin) {
            return response.error(res, 1003, 409);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await Admin.create({
            email,
            password: hashedPassword,
            name,
        });

        return response.success(res, 1001, null, 201);
    } catch (error) {
        console.error("Admin Signup Error: ", error);
        return response.error(res, 9999);
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await Admin.findOne({
            where: { email },
            attributes: { include: ["password"] }
        });

        if (!admin) {
            return response.error(res, 1006, 404);
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return response.error(res, 1007, 401);
        }

        const token = await generateToken(admin.id, "ADMIN");

        return response.success(res, 1002, {
            entity_id: token.entity_id,
            access_token: token.access_token,
            refresh_token: token.refresh_token,
            role: "ADMIN"
        }, 200);
    } catch (error) {
        console.error("Admin Login Error: ", error);
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
        console.error("Admin Logout Error: ", error);
        return response.error(res, 9999);
    }
};

exports.getProfile = async (req, res) => {
    try {
        const { admin_id } = req.admin;

        const admin = await Admin.findOne({
            where: { id: admin_id },
            attributes: ["id", "name", "email"],
        });

        if (!admin) {
            return response.error(res, 1006, 404);
        }

        return response.success(res, 1010, admin, 200);
    } catch (error) {
        console.error("Admin Profile Error: ", error);
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
        console.error("Update Admin Profile Error: ", error);
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

        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return response.error(res, 1008, 401);
        }

        await deactivateToken(token);
        await admin.destroy();

        return response.success(res, 1012, null, 200);
    } catch (error) {
        console.error("Deactivate Admin Account Error: ", error);
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
            },
        });

        if (!seller) {
            return response.error(res, 1006, 404);
        }

        if (seller.status === "APPROVED")
            return response.error(res, 1022, 400);

        await seller.update({
            status: status,
            approved_by: admin_id
        });

        return response.success(res, 1021, null, 201);
    } catch (error) {
        console.error("Seller Status Error: ", error);
        return response.error(res, 9999);
    }
};

exports.getDashboard = async (req, res) => {
    try {
        const activeUsers = await User.count();

        const activeSellers = await Seller.count({
            where: { status: "Approved" }
        });

        const totalProducts = await Product.count();
        const totalOrders = await OrderItem.count();

        const returnedOrders = await OrderItem.count({
            where: {
                status: {
                    [Op.in]: ["Refunded", "Return Request Approved", "Order Cancelled", "Return Requested"]
                }
            }
        });

        const revenueData = await OrderItem.sum("price", {
            where: {
                status: {
                    [Op.in]: ["Order Placed", "Delivered", "Return Request Not Approved"]
                }
            }
        });

        const returnRate = totalOrders
            ? ((returnedOrders / totalOrders) * 100).toFixed(2)
            : 0;

        const pendingPayout = await Payout.sum("amount", {
            where: { status: "Pending" }
        });

        return res.json({
            success: true,
            data: {
                activeUsers,
                activeSellers,
                totalProducts,
                revenue: revenueData || 0,
                returnRate,
                pendingPayout
            }
        });
    } catch (error) {
        console.error("Dashboard error:", error);
        return res.status(500).json({ success: false });
    }
};