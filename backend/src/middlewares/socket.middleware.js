const jwt = require("jsonwebtoken");
const AuthToken = require("../models/auth_token.model");

const socketAuthMiddleware = async (socket, next) => {
    try {
        const authHeader =
            socket.handshake.auth.token ||
            socket.handshake.headers.token ||
            socket.handshake.headers["authorization"];

        if (!authHeader) {
            return next(new Error("Authentication error: Token missing"));
        }
        const token = authHeader.replace("Bearer ", "");

        decoded = jwt.verify(token, process.env.JWT_SECRET);

        const activeToken = await AuthToken.findOne({
            where: { access_token: token, is_active: true }
        });

        if (!activeToken) {
            return next(new Error("Session expired or invalid"));
        }

        socket.user = {
            id: activeToken.entity_id,
            role: activeToken.entity_type
        };

        console.log(`Authorized as ${socket.user.role}: ${socket.user.id}`);
        next();

    } catch (err) {
        console.error("CRITICAL SOCKET AUTH ERROR:", err.message);
        next(new Error(`Authentication failed: ${err.message}`));
    }
};

module.exports = socketAuthMiddleware;