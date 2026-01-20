const Joi = require("joi");

exports.checkoutSchema = Joi.object({
    payment_method_id: Joi.string().required(),
    address: Joi.string().max(255).required()
});