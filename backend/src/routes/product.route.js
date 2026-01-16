const express = require("express");
const router = express.Router();

const productController = require("../controllers/product.controller");
const { verifySeller, verifySellerApproved } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

router.post(
  "/create", 
  verifySeller, 
  verifySellerApproved, 
  upload.single("image"),
  productController.createProduct
);

router.put(
    "/update/:id", 
    verifySeller, 
    verifySellerApproved, 
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
    "/getBySellerId/:id", 
    verifySeller, 
    productController.getProductBySellerId
);

router.get(
    "/getByCategory/:id", 
    productController.getProductByCategory
);

module.exports = router;