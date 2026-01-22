const jwt = require("jsonwebtoken");
const AuthToken = require("../models/auth_token.model")

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
    await AuthToken.update(
        { is_active: false },
        { where: { access_token: token } }
    );
};