const rateLimit = require("express-rate-limit");
//const response = require('../helpers');

exports.loginRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many login attempts. Please try again later."
    }
});