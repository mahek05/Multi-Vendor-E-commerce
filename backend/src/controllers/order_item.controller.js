const sequelize = require("../config/sequelize");
const OrderItem = require("../models/order_item.model");
const Payout = require("../models/payout.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");
const response = require("../helpers");
const {
    getPaginationMetadata,
    getPaginatedResponse
} = require("../helpers/pagination.helper");

const STATUS_FLOW = {
    "Order Placed": ["Shipped"],
    "Shipped": ["Out for Delivery"],
    "Out for Delivery": ["Delivered"],
    "Delivered": [],
    "Return Requested": [
        "Return Request Approved",
        "Return Request Not Approved"
    ]
};

exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const { seller_id } = req.seller;

        const order_item = await OrderItem.findOne({
            where: { id },
            include: [
                {
                    model: Product,
                    attributes: ["seller_id"],
                },
            ],
        });

        if (!order_item) {
            return response.error(res, 5006, 404);
        }

        if (order_item.product.seller_id !== seller_id) {
            return response.error(res, 1008, 403);
        }

        const current_status = order_item.status;

        const allowedStatuses = STATUS_FLOW[current_status] || [];

        if (!allowedStatuses.includes(status)) {
            return response.error(res, 5008, 403);
        }

        const updateData = { status };

        if (status === "Delivered") {
            updateData.delivered_on = new Date();
            updateData.payout_eligible_at = new Date(
                Date.now() + 10 * 24 * 60 * 60 * 1000
            );
        }

        if (status === "Return Request Not Approved") {
            await Payout.update(
                { status: "Pending" },
                { where: { order_item_id: id } }
            );
        }

        await order_item.update(updateData);

        return response.success(res, 5007, order_item, 200);
    } catch (error) {
        console.error("Update error:", error);
        return response.error(res, 9999);
    }
};

exports.cancelOrderItem = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { order_item_id } = req.params;
        const { user_id } = req.user;

        const orderItem = await OrderItem.findOne({
            where: { id: order_item_id },
            attributes: ["id", "status", "order_id", "product_id", "quantity"],
            transaction: t,
            lock: t.LOCK.UPDATE,
        });

        if (!orderItem) {
            await t.rollback();
            return response.error(res, 5006, 404);
        }

        const order = await Order.findOne({
            where: { id: orderItem.order_id },
            transaction: t,
        });

        if (!order || order.user_id !== user_id) {
            await t.rollback();
            return response.error(res, 1008, 403);
        }

        if (orderItem.status !== "Placed" && orderItem.status !== "Order Placed") {
            await t.rollback();
            return response.error(res, 5009, 400);
        }

        const product = await Product.findOne({
            where: { id: orderItem.product_id },
            attributes: { include: ["stock"] },
            transaction: t,
            lock: t.LOCK.UPDATE,
        });

        if (!product) {
            await t.rollback();
            return response.error(res, 9001, 404);
        }

        await product.increment('stock', { by: orderItem.quantity, transaction: t });

        await orderItem.update(
            { status: "Order Cancelled" },
            { transaction: t }
        );

        await Payout.update(
            { status: "Order Cancelled" },
            { where: { order_item_id }, transaction: t }
        );

        await t.commit();
        return response.success(res, 5011, { message: "Order cancelled" }, 200);

    } catch (error) {
        await t.rollback();
        console.error("Cancel OrderItem error:", error);
        return response.error(res, 9999);
    }
};

exports.requestReturn = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { order_item_id } = req.params
        const { return_reason } = req.body;
        const { user_id } = req.user;

        const orderItem = await OrderItem.findOne({
            where: { id: order_item_id },
            attributes: ["status", "return_reason"],
            include: [{
                model: Order,
                required: true
            }],
            transaction: t,
            lock: t.LOCK.UPDATE,
        });

        if (!orderItem || orderItem.order.user_id !== user_id) {
            await t.rollback();
            return response.error(res, 5006, 404);
        }

        if (orderItem.status !== "Delivered") {
            await t.rollback();
            return response.error(res, 5018, 400);
        }

        const deliveredDate = new Date(orderItem.delivered_on);
        const diffDays =
            (Date.now() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24);

        if (diffDays > 7) {
            await t.rollback();
            return response.error(res, 5019, 400);
        }

        await orderItem.update(
            {
                status: "Return Requested",
                return_reason,
                returned_on: new Date(),
            },
            { transaction: t }
        );

        await Payout.update(
            { status: "Order Returned" },
            { where: { order_item_id, seller_id: orderItem.product.seller_id }, transaction: t }
        );

        await t.commit();
        return response.success(res, 5020, null, 200);

    } catch (error) {
        await t.rollback();
        console.error("Return error:", error);
        return response.error(res, 9999);
    }
};

exports.sellerOrderHistory = async (req, res) => {
    try {
        const { seller_id } = req.seller;

        const { page, limit, offset } = getPaginationMetadata(
            req.query.page,
            req.query.limit
        );

        const orderItem = await OrderItem.findAndCountAll({
            attributes: ['product_id', 'status', 'price', "quantity", "order_id", "return_reason", "returned_on"],
            limit,
            offset,
            order: [['created_at', 'DESC']],
            include: [
                {
                    model: Product,
                    where: { seller_id: seller_id },
                    attributes: ['product_name', 'image', 'price']
                },
                {
                    model: Order,
                    attributes: ['id', 'created_at', 'address', 'user_id']
                },
                {
                    model: Payout,
                    attributes: ['id', 'amount', 'status']
                }
            ]
        });

        const paginatedResponse = getPaginatedResponse(
            orderItem,
            page,
            limit
        );

        return response.success(res, null, paginatedResponse, 200);

    } catch (error) {
        console.error("Seller Order History Error:", error);
        return response.error(res, 9999);
    }
};