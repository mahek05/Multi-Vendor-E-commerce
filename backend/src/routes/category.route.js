const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/category.controller");
const { verifyAdmin } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const {
    createCategorySchema,
    updateCategorySchema
} = require("../validators/category.validator");

router.post(
    "/create",
    verifyAdmin,
    validate(createCategorySchema),
    categoryController.createCategory
);

router.get(
    "/",
    categoryController.getAllCategory
);

router.put(
    "/update/:id",
    verifyAdmin,
    validate(updateCategorySchema),
    categoryController.updateCategory
);

router.delete(
    "/delete/:id",
    verifyAdmin,
    categoryController.deleteCategory
);

module.exports = router;