const Joi = require("joi");

exports.sendOtpSchema = Joi.object({
    email: Joi.string().email().lowercase().required()
});

exports.verifyOtpSchema = Joi.object({
    email: Joi.string().email().lowercase().required(),
    otp: Joi.string().length(6).required()
});