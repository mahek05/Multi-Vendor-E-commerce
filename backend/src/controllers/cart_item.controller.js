const CartItem = require("../models/cart_item.model");
const Product = require("../models/product.model");
const response = require("../helpers");
const {
    getPaginationMetadata,
    getPaginatedResponse
} = require("../helpers/pagination.helper");

exports.createCartItem = async (req, res) => {
    try {
        const { quantity = 1 } = req.body;
        const { id } = req.params;
        const { user_id } = req.user;

        const existingItem = await CartItem.findOne({
            where: { user_id, product_id: id }
        });

        if (existingItem) {
            await existingItem.update({
                quantity: existingItem.quantity + quantity
            });

            return response.success(res, 4003, existingItem, 200);
        }

        const newItem = await CartItem.create({
            quantity,
            user_id,
            product_id: id
        });

        return response.success(res, 4001, newItem, 201);
    } catch (error) {
        console.error(error);
        return response.error(res, 9999);
    }
};

exports.updateCartItem = async (req, res) => {
    try {
        const { quantity } = req.body;
        const { id } = req.params;

        const cartItem = await CartItem.findOne({
            where: { id },
        });

        if (!cartItem) {
            return response.error(res, 4002, 404);
        }

        await cartItem.update({
            quantity: quantity ?? cartItem.quantity,
        });

        return response.success(res, 4003, cartItem, 200);
    } catch (error) {
        console.error("Update category error:", error);
        return response.error(res, 9999);
    }
};

exports.deleteCartItem = async (req, res) => {
    try {
        const { id } = req.params;

        const cartItem = await CartItem.findOne({
            where: {
                id
            },
        });

        if (!cartItem) {
            return response.error(res, 4002, 404);
        }

        await cartItem.destroy();

        return response.success(res, 4004, null, 200);
    } catch (error) {
        console.error("Error:", error);
        return response.error(res, 9999);
    }
};

exports.getAllCartItem = async (req, res) => {
    try {
        const { user_id } = req.user;
        const { page, limit, offset } = getPaginationMetadata(
            req.query.page,
            req.query.limit
        );

        const CartItems = await CartItem.findAndCountAll({
            where: { user_id: user_id },
            limit,
            offset,
            order: [["created_at", "DESC"]],
            include: [
                {
                    model: Product,
                    attributes: ['product_name', 'image', 'price']
                }
            ]
        });

        const paginatedResponse = getPaginatedResponse(
            CartItems,
            page,
            limit
        );

        return response.success(res, null, paginatedResponse, 200);
    } catch (error) {
        console.error("Get all category error:", error);
        return response.error(res, 9999);
    }
};