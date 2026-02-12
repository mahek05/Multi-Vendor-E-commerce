const jwt = require("jsonwebtoken");
const response = require('../helpers');
const {
    regenerateAccessToken
} = require("../helpers/token.helper");

exports.refreshAccessToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return response.error(res, 1006, 401);
        }
        let payload;
        try {
            payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        } catch (error) {
            console.error("JWT Verification failed:", error.message);
            return response.error(res, 1024, 401);
        }

        const tokenData = await regenerateAccessToken(
            refreshToken, 
            payload.entity_id, 
            payload.role
        );

        if (!tokenData) {
            return response.error(res, 1006, 401); 
        }

        return response.success(res, 1023, {
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            role: tokenData.role,
        }, 200);

    } catch (err) {
        console.error("Refresh Token Error:", err);
        return response.error(res, 1024, 401);
    }
};