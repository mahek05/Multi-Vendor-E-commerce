const Joi = require("joi");

exports.createCategorySchema = Joi.object({
    category_name: Joi.string().lowercase().required()
});

exports.updateCategorySchema = Joi.object({
    category_name: Joi.string().lowercase().required()
});