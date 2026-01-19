const Joi = require("joi");

exports.adminSignupSchema = Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().required()
});

exports.adminLoginSchema = Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(6).required()
});

exports.adminUpdateSchema = Joi.object({
    name: Joi.string().required()
});