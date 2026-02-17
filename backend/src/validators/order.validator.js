const Joi = require("joi");

exports.checkoutSchema = Joi.object({
    address: Joi.string().max(255).required()
});