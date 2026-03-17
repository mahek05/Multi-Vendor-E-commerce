const Joi = require("joi");

exports.createProductSchema = Joi.object({
    product_name: Joi.string().max(30).required(),
    description: Joi.string().required(),
    price: Joi.number().required(),
    stock: Joi.number().integer().required(),
    category_id: Joi.string().required()
});

exports.updateProductSchema = Joi.object({
    product_name: Joi.string().max(30).optional(),
    description: Joi.string().optional(),
    price: Joi.number().optional(),
    stock: Joi.number().integer().optional(),
    category_id: Joi.string().optional()
});