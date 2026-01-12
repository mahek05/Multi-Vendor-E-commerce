const express = require("express");
const router = express.Router();

const productController = require("../controllers/product.controller");
const { verifySeller, verifySellerApproved } = require("../middlewares/auth.middleware");

router.post("/create", verifySeller, verifySellerApproved, productController.createProduct);
router.put("/update/:id", verifySeller, verifySellerApproved, productController.updateProduct);
router.delete("/delete/:id", verifySeller, verifySellerApproved, productController.deleteProduct);
router.get("/", productController.getAllProducts);
router.get("/getById/:id", productController.getProductById);
router.get("/getBySellerId/:id", verifySeller, productController.getProductBySellerId);

module.exports = router;