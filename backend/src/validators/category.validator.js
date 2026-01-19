const Joi = require("joi");

exports.createCategorySchema = Joi.object({
    category_name: Joi.string().required()
});

exports.updateCategorySchema = Joi.object({
    category_name: Joi.string().required()
});