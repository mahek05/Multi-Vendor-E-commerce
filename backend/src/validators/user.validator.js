const Joi = require("joi");

exports.userSignupSchema = Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().required(),
    phone_number: Joi.string().pattern(/^\+?[0-9]+$/).min(10).max(15).required(),
    address: Joi.string().max(255).optional()
});

exports.userLoginSchema = Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().required()
});

exports.userUpdateSchema = Joi.object({
    name: Joi.string().min(2).max(50).optional(),
    phone_number: Joi.string().pattern(/^\+?[0-9]+$/).min(10).max(15).optional(),
    address: Joi.string().max(255).optional()
});