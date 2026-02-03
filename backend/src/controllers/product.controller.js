const Product = require("../models/product.model");
const Category = require("../models/category.model");
const response = require("../helpers");
const {
    getPaginationMetadata,
    getPaginatedResponse
} = require("../helpers/pagination.helper");
const { deleteFile } = require("../middlewares/upload.middleware");

exports.createProduct = async (req, res) => {
    try {
        const { product_name, description, price, stock, category_id } = req.body;
        const seller_id = req.seller.seller_id;

        let imagePath = null;

        if (req.file) {
            imagePath = `/uploads/${req.file.filename}`;
        }

        await Product.create({
            product_name,
            description,
            image: imagePath,
            category_id,
            price,
            stock,
            seller_id
        });
        return response.success(res, 3001, null, 201);
    } catch (error) {
        console.error(error);
        return response.error(res, 9999);
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { product_name, description, price, stock, category_id } = req.body;
        const { id } = req.params;

        let newImagePath = null;
        if (req.file) {
            newImagePath = `/uploads/${req.file.filename}`;
        }

        const product = await Product.findOne({
            where: {
                id,
                is_deleted: false,
            },
        });

        if (!product) {
            if (newImagePath) deleteFile(newImagePath);
            return response.error(res, 3002, 404);
        }

        if (newImagePath && product.image) {
            deleteFile(product.image);
        }

        await product.update({
            product_name: product_name ?? product.product_name,
            description: description ?? product.description,
            price: price ?? product.price,
            stock: stock ?? product.stock,
            image: newImagePath ?? product.image,
            category_id: category_id ?? product.category_id
        });

        return response.success(res, 3003, product, 200);
    } catch (error) {
        console.error("Error:", error);
        return response.error(res, 9999);
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findOne({
            where: {
                id,
                is_deleted: false,
            },
        });

        if (!product) {
            return response.error(res, 3002, 404);
        }

        if (product.image) {
            deleteFile(product.image);
        }

        await product.update({ is_deleted: true });

        return response.success(res, 3004, null, 200);
    } catch (error) {
        console.error("Error:", error);
        return response.error(res, 9999);
    }
};

exports.getAllProducts = async (req, res) => {
    try {
        const { page, limit, offset } = getPaginationMetadata(
            req.query.page,
            req.query.limit
        );

        const products = await Product.findAndCountAll({
            where: { is_deleted: false },
            limit,
            offset,
            include: [{
                model: Category,
                attributes: ['category_name']
            }],
            order: [["created_at", "DESC"]],
        });

        const paginatedResponse = getPaginatedResponse(
            products,
            page,
            limit
        );

        return response.success(res, null, paginatedResponse, 200);
    } catch (error) {
        console.error("Error:", error);
        return response.error(res, 9999);
    }
};

exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findOne({
            where: {
                id,
                is_deleted: false,
            },
        });

        if (!product) {
            return response.error(res, 3002, 404);
        }

        return response.success(res, null, product, 200);
    } catch (error) {
        console.error("Error:", error);
        return response.error(res, 9999);
    }
};

exports.getProductBySellerId = async (req, res) => {
    try {
        const { seller_id } = req.seller;

        const { page, limit, offset } = getPaginationMetadata(
            req.query.page,
            req.query.limit
        );

        const products = await Product.findAndCountAll({
            where: {
                seller_id: seller_id,
                is_deleted: false,
            },
            limit,
            offset,
            order: [["created_at", "DESC"]],
        });

        const paginatedResponse = getPaginatedResponse(products, page, limit);
        return response.success(res, null, paginatedResponse, 200);
    } catch (error) {
        console.error("Error: ", error);
        return response.error(res, 9999);
    }
};

exports.getProductByCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const { page, limit, offset } = getPaginationMetadata(
            req.query.page,
            req.query.limit
        );

        const products = await Product.findAndCountAll({
            where: {
                category_id: id,
                is_deleted: false,
            },
            limit,
            offset,
            order: [["created_at", "DESC"]],
        });

        const paginatedResponse = getPaginatedResponse(
            products,
            page,
            limit
        );

        return response.success(res, null, paginatedResponse, 200);
    } catch (error) {
        console.error("Error: ", error);
        return response.error(res, 9999)
    }
};