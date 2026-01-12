const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/category.controller");
const { verifyAdmin } = require("../middlewares/auth.middleware");

router.post("/create", verifyAdmin, categoryController.createCategory);
router.get("/", categoryController.getAllCategory);
router.put("/update/:id", verifyAdmin, categoryController.updateCategory);
router.delete("/delete/:id", verifyAdmin, categoryController.deleteCategory);

module.exports = router;