const express = require("express");
const router = express.Router();

const productController = require("../controllers/product.controller");
const { verifySeller, verifySellerApproved } = require("../middlewares/auth.middleware");
const {
    upload
} = require("../middlewares/upload.middleware");
const validate = require("../middlewares/validate.middleware");
const {
    createProductSchema,
    updateProductSchema
} = require("../validators/product.validator");

router.post(
    "/create",
    verifySeller,
    verifySellerApproved,
    upload.single("image"),
    validate(createProductSchema),
    productController.createProduct
);

router.put(
    "/update/:id",
    verifySeller,
    verifySellerApproved,
    upload.single("image"),
    validate(updateProductSchema),
    productController.updateProduct
);

router.delete(
    "/delete/:id",
    verifySeller,
    verifySellerApproved,
    productController.deleteProduct
);

router.get(
    "/",
    productController.getAllProducts
);

router.get(
    "/getById/:id",
    productController.getProductById
);

router.get(
    "/getBySellerId",
    verifySeller,
    verifySellerApproved,
    productController.getProductBySellerId
);

router.get(
    "/getBySellerCategory/:name",
    verifySeller,
    verifySellerApproved,
    productController.getSellerProductByCategory
);

router.get(
    "/getByCategory/:name",
    productController.getProductByCategory
);

module.exports = router;