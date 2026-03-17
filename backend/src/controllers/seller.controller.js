const Seller = require("../models/seller.model");
const Admin = require("../models/admin.model");
const { createConnectedAccount, generateOnboardingLink } = require("../helpers/stripe.helper");
const EmailOtp = require("../models/email_otp.model");
const bcrypt = require("bcryptjs");
const response = require('../helpers');
const {
    getPaginationMetadata,
    getPaginatedResponse
} = require("../helpers/pagination.helper");
const {
    generateToken,
    deactivateToken,
    deactivateAccountToken
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

        const existingSeller = await Seller.findOne({
            where: { email },
            paranoid: false
        });

        if (existingSeller && existingSeller.deleted_at !== null) {
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
            phone_number
        });

        return response.success(res, 1001, null, 201);
    } catch (error) {
        console.error("Seller Signup Error: ", error);
        return response.error(res, 9999);
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const seller = await Seller.findOne({
            where: { email },
            attributes: { include: ["password"] }
        });

        if (!seller) {
            return response.error(res, 1006, 404);
        }

        const isMatch = await bcrypt.compare(password, seller.password);
        if (!isMatch) {
            return response.error(res, 1007, 401);
        }

        const token = await generateToken(seller.id, "SELLER");

        return response.success(res, 1002, {
            entity_id: token.entity_id,
            access_token: token.access_token,
            refresh_token: token.refresh_token,
            role: "SELLER"
        }, 200);
    } catch (error) {
        console.error("Seller Login Error: ", error);
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
        console.error("Seller Logout Error: ", error);
        return response.error(res, 9999);
    }
};

exports.getProfile = async (req, res) => {
    try {
        const { seller_id } = req.seller;

        const seller = await Seller.findOne({
            where: { id: seller_id },
            attributes: ["id", "name", "email", "address", "phone_number", "status"],
        });

        if (!seller) {
            return response.error(res, 1006, 404);
        }

        return response.success(res, 1010, seller, 200);
    } catch (error) {
        console.error("Seller Profile Error: ", error);
        return response.error(res, 9999);
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { seller_id } = req.seller;
        const { name, address, phone_number } = req.body;

        const seller = await Seller.findOne({ where: { id: seller_id } });

        if (!seller) {
            return response.error(res, 1006, 404);
        }

        await seller.update({
            name: name ?? seller.name,
            address: address ?? seller.address,
            phone_number: phone_number ?? seller.phone_number,
        });

        return response.success(res, 1011, seller, 200);
    } catch (error) {
        console.error("Update Seller Profile Error: ", error);
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

        await seller.destroy();
        await deactivateAccountToken(seller_id);

        return response.success(res, 1012, null, 200);
    } catch (error) {
        console.error("Deactivate Seller Error: ", error);
        return response.error(res, 9999);
    }
};

exports.onboardStripe = async (req, res) => {
    try {
        const { seller_id } = req.seller;

        const seller = await Seller.findOne({ where: { id: seller_id } });
        if (!seller) {
            return response.error(res, 1006, 404);
        }

        if (!seller.stripe_account_id) {
            seller.stripe_account_id = await createConnectedAccount(seller.email);
            await seller.save();
        }

        const url = await generateOnboardingLink(
            seller.stripe_account_id,
            'http://localhost:5173/seller/product'
        );

        return response.success(res, 1025, { url }, 200);
    } catch (error) {
        console.error("Seller Stripe Onboarding Error:", error);
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
            attributes: ["id", "name", "email", "phone_number", "address", "status"],
            include: [
                {
                    model: Admin,
                    as: "admin",
                    attributes: ["name", "id"],
                },
            ],
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
        console.error("Get Seller Error:", error);
        return response.error(res, 9999);
    }
};