const jwt = require("jsonwebtoken");
const AuthToken = require("../models/auth_token.model");

const socketAuthMiddleware = async (socket, next) => {
    try {
        const authHeader =
            socket.handshake.auth?.token ||
            socket.handshake.headers?.authorization ||
            socket.handshake.headers?.token;

        if (!authHeader) {
            console.error("SOCKET AUTH REJECTED: Token missing");
            return next(new Error("Authentication error: Token missing"));
        }

        const token = authHeader.replace("Bearer ", "");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const activeToken = await AuthToken.findOne({
            where: {
                access_token: token,
                entity_id: decoded.entity_id,
                entity_type: decoded.role,
                is_active: true
            }
        });

        if (!activeToken) {
            console.error("SOCKET AUTH REJECTED: Session expired or invalid");
            return next(new Error("Session expired or invalid"));
        }

        socket.user = {
            id: activeToken.entity_id,
            role: activeToken.entity_type
        };

        next();
    } catch (err) {
        console.error("CRITICAL SOCKET AUTH ERROR:", err.message);
        next(new Error(`Authentication failed: ${err.message}`));
    }
};

module.exports = socketAuthMiddleware;