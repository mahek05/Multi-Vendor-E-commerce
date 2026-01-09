const jwt = require("jsonwebtoken");
const AuthToken = require("../models/auth_token.model");
const response = require("../helpers");

exports.verifyAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return response.error(res, 1008, 401);
        }

        const token = authHeader.split(" ")[1];
        // console.log("Authorization header:", req.headers.authorization);
        // console.log("JWT_SECRET VALUE:", process.env.JWT_SECRET);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const activeToken = await AuthToken.findOne({
            where: {
                access_token: token,
                entity_id: decoded.entity_id,
                entity_type: "ADMIN",
                is_active: true,
            },
        });

        if (!activeToken) {
            return response.error(res, 1008, 401);
        }

        req.admin = { admin_id: decoded.entity_id };
        next();
    } catch (error) {
        console.error("verifyAdmin error:", error);
        return response.error(res, 1008, 401);
    }
};

exports.verifyUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return response.error(res, 1008, 401);
        }

        const token = authHeader.split(" ")[1];
        console.log("Authorization header:", req.headers.authorization);
        console.log("JWT_SECRET VALUE:", process.env.JWT_SECRET);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const activeToken = await AuthToken.findOne({
            where: {
                access_token: token,
                entity_id: decoded.entity_id,
                entity_type: "USER",
                is_active: true,
            },
        });

        if (!activeToken) {
            return response.error(res, 1008, 401);
        }

        req.user = { user_id: decoded.entity_id };
        next();
    } catch (error) {
        console.error("verifyUser error:", error);
        return response.error(res, 1008, 401);
    }
};

exports.verifySeller = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return response.error(res, 1008, 401);
        }

        const token = authHeader.split(" ")[1];
        console.log("Authorization header:", req.headers.authorization);
        console.log("JWT_SECRET VALUE:", process.env.JWT_SECRET);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const activeToken = await AuthToken.findOne({
            where: {
                access_token: token,
                entity_id: decoded.entity_id,
                entity_type: "SELLER",
                is_active: true,
            },
        });

        if (!activeToken) {
            return response.error(res, 1008, 401);
        }

        req.seller = { seller_id: decoded.entity_id };
        next();
    } catch (error) {
        console.error("verifySeller error:", error);
        return response.error(res, 1008, 401);
    }
};