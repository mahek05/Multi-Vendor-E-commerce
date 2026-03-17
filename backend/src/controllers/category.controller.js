const Category = require("../models/category.model");
const response = require("../helpers");
const {
    getPaginationMetadata,
    getPaginatedResponse
} = require("../helpers/pagination.helper");

exports.createCategory = async (req, res) => {
    try {
        const { category_name } = req.body;

        const category = await Category.findOne({
            where: { category_name }
        });

        if (category) {
            return response.error(res, 2005, 404);
        }

        await Category.create({
            category_name
        });

        return response.success(res, 2001, null, 201);
    } catch (error) {
        console.error("Create Category Error: ", error);
        return response.error(res, 9999);
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { category_name } = req.body;
        const { id } = req.params;

        const exist = await Category.findOne({
            where: { category_name }
        });

        if (exist) {
            return response.error(res, 2005, 404);
        }

        const category = await Category.findOne({
            where: {
                id
            },
        });

        if (!category) {
            return response.error(res, 2002, 404);
        }

        await category.update({
            category_name: category_name ?? category.category_name,
        });

        return response.success(res, 2004, category, 200);
    } catch (error) {
        console.error("Update Category Error:", error);
        return response.error(res, 9999);
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findOne({
            where: {
                id,
            },
        });

        if (!category) {
            return response.error(res, 2002, 404);
        }

        await category.destroy();
        return response.success(res, 2003, null, 200);
    } catch (error) {
        console.error("Delete Category Error: ", error);
        return response.error(res, 9999);
    }
};

exports.getAllCategory = async (req, res) => {
    try {
        const { page, limit, offset } = getPaginationMetadata(
            req.query.page,
            req.query.limit
        );

        const categories = await Category.findAndCountAll({
            limit,
            offset,
            order: [["created_at", "DESC"]],
        });

        const paginatedResponse = getPaginatedResponse(
            categories,
            page,
            limit
        );

        return response.success(res, null, paginatedResponse, 200);
    } catch (error) {
        console.error("Get Category Error: ", error);
        return response.error(res, 9999);
    }
};

exports.getAllCategoryAdmin = async (req, res) => {
    try {
        const { page, limit, offset } = getPaginationMetadata(
            req.query.page,
            req.query.limit
        );

        const categories = await Category.findAndCountAll({
            paranoid: false,
            limit,
            offset,
            order: [["created_at", "DESC"]],
        });

        const paginatedResponse = getPaginatedResponse(
            categories,
            page,
            limit
        );

        return response.success(res, null, paginatedResponse, 200);
    } catch (error) {
        console.error("Get Category for Admin Error: ", error);
        return response.error(res, 9999);
    }
};