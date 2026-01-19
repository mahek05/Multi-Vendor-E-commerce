const Joi = require("joi");

exports.createCartItemSchema = Joi.object({
    quantity: Joi.number().integer().min(1).required()
});

exports.updateCartItemSchema = Joi.object({
    quantity: Joi.number().integer().min(1).required()
});