const Joi = require("joi");

exports.checkoutSchema = Joi.object({
    payment_method_id: Joi.string().min(16).max(27).required(),
    address: Joi.string().max(255).required()
});