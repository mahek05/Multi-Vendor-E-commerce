const jwt = require("jsonwebtoken");
const AuthToken = require("../models/auth_token.model")
const { Op } = require("sequelize");

exports.generateToken = async (entity_id, role) => {
    //For single device at a time.
    // await AuthToken.update(
    //     { is_active: false },
    //     { where: { entity_id, entity_type: role } }
    // );

    const accessToken = jwt.sign(
        { entity_id, role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
        { entity_id, role },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
    );

    const refreshExpiry = new Date();
    refreshExpiry.setDate(refreshExpiry.getDate() + 7);

    const token = await AuthToken.create({
        entity_id,
        entity_type: role,
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: refreshExpiry,
        is_active: true,
    });

    return token;
};

exports.deactivateToken = async (token) => {
    await AuthToken.destroy(
        { where: { access_token: token } }
    );
};

exports.deactivateAccountToken = async (user_id) => {
    await AuthToken.destroy(
        { where: { user_id } }
    );
};

exports.regenerateAccessToken = async (refreshToken, entity_id, role) => {
    const tokenRecord = await AuthToken.findOne({
        where: {
            refresh_token: refreshToken,
            entity_id,
            entity_type: role,
            is_active: true,
            expires_at: { [Op.gt]: new Date() }
        },
        attributes: ["id", "refresh_token", "entity_id", "entity_type", "expires_at"]
    });

    if (!tokenRecord) {
        return null;
    }

    const newAccessToken = jwt.sign(
        { entity_id, role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    const [updatedCount] = await AuthToken.update(
        { access_token: newAccessToken, },
        {
            where: {
                id: tokenRecord.id
            }
        }
    );

    if (updatedCount === 0) {
        return null;
    }

    return {
        access_token: newAccessToken,
        refresh_token: tokenRecord.refresh_token,
        role: tokenRecord.entity_type
    };
};