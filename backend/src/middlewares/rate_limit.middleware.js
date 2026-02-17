const rateLimit = require("express-rate-limit");

exports.loginRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    keyGenerator: (req) => req.body.email,
    message: {
        success: false,
        message: "Too many login attempts. Please try again later."
    }
});