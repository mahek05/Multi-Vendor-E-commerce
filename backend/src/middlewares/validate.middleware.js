const response = require("../helpers");

const validate = (schema) => (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
    });

    if (error) {
        const errorMessage = error.details.map((detail) => detail.message).join(", ");
        return response.error(res, 9000, 400, errorMessage);
    }

    req.body = value;
    next();
};

module.exports = validate;