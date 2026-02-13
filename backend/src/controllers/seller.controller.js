const Seller = require("../models/seller.model");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
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
            phone_number
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

        const token = await generateToken(seller.id, "SELLER");

        return response.success(res, 1002, {
            entity_id: token.entity_id,
            access_token: token.access_token,
            refresh_token: token.refresh_token,
            role: "SELLER"
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
        const { seller_id } = req.seller;

        const seller = await Seller.findOne({
            where: { id: seller_id },
            attributes: ["name", "email", "address", "phone_number", "status"],
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
        console.error("Update seller profile error:", error);
        return response.error(res, 9999);
    }
};

exports.deactivateProfile = async (req, res) => {
    try {
        const { seller_id } = req.seller;
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return response.error(res, 1008, 401);
        }

        const seller = await Seller.findOne({ where: { id: seller_id } });

        if (!seller) {
            return response.error(res, 1006, 404);
        }

        await seller.update({ is_deleted: true });

        await deactivateToken(token);

        return response.success(res, 1012, null, 200);
    } catch (error) {
        console.error("Deactivate seller error:", error);
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
            const account = await stripe.accounts.create({
                type: 'express',
                email: seller.email,
                country: 'US',
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
            });

            seller.stripe_account_id = account.id;
            await seller.save();
        }

        const accountLink = await stripe.accountLinks.create({
            account: seller.stripe_account_id,
            refresh_url: 'http://localhost:5173/seller/dashboard', 
            return_url: 'http://localhost:5173/seller/dashboard',   
            type: 'account_onboarding',
        });

        return response.success(res, 1025, { url: accountLink.url }, 200);

    } catch (error) {
        console.error("Stripe Onboarding Error:", error);
        return response.error(res, 9999);
    }
};