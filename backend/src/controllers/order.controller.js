const sequelize = require("../config/sequelize");
const Order = require("../models/order.model");
const OrderItem = require("../models/order_item.model");
const Payment = require("../models/payment.model");
const CartItem = require("../models/cart_item.model");
const Product = require("../models/product.model");
const Payout = require("../models/payout.model");
const response = require("../helpers");
const { createPaymentIntent } = require("../helpers/stripe.helper");

const PLATFORM_FEE_PERCENT = 0.10;

exports.checkout = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { user_id } = req.user;
        const { payment_method_id, address } = req.body;

        const cart_items = await CartItem.findAll({
            where: { user_id },
            include: [{
                model: Product
            }],
            transaction
        });

        if (!cart_items || cart_items.length === 0) {
            await transaction.rollback();
            return response.error(res, 5001, 400);
        }

        let total_amount = 0;

        for (const item of cart_items) {
            const product = await Product.findOne({
                where: { id: item.product_id, is_deleted: false },
                attributes: ["id", "product_name", "stock", "price", "seller_id"],
                transaction,
                lock: transaction.LOCK.UPDATE,
            });

            if (!product) {
                throw new Error(`Product not found: ${item.product_id}`);
            }

            if (Number(product.stock) < Number(item.quantity)) {
                throw new Error(`Insufficient stock for ${product.product_name}.`);
            }

            await product.update({
                stock: Number(product.stock) - Number(item.quantity)
            }, { transaction });

            total_amount += Number(product.price) * Number(item.quantity);
        }

        const payment_intent = await createPaymentIntent(total_amount, payment_method_id, "inr");

        const order = await Order.create({
            user_id,
            address
        }, { transaction });

        const payment = await Payment.create({
            order_id: order.id,
            gateway_payment_id: payment_intent.id,
            amount: total_amount,
            payment_status: "Paid"
        }, { transaction });

        for (const item of cart_items) {
            const Amount = Number(item.product.price) * Number(item.quantity);

            const order_item = await OrderItem.create({
                order_id: order.id,
                product_id: item.product_id,
                quantity: item.quantity,
                price: Amount,
            }, { transaction });

            await Payout.create({
                amount: Amount * (1 - PLATFORM_FEE_PERCENT),
                payment_id: payment.id,
                order_item_id: order_item.id,
                seller_id: item.product.seller_id,
                status: "Pending"
            }, { transaction });
        }

        await CartItem.destroy({ where: { user_id }, transaction });

        await transaction.commit();
        return response.success(res, 5003, { order_id: order.id }, 201);
    } catch (error) {
        await transaction.rollback();
        console.error("Checkout error:", error);
        return response.error(res, 9999);
    }
};

exports.orderHistory = async (req, res) => {
    try {
        const { user_id } = req.user;

        const orders = await Order.findAll({
            where: { user_id },
            include: [
                {
                    model: OrderItem,
                    include: [{
                        model: Product,
                        attributes: ["product_name", "image"]
                    }]
                },
                {
                    model: Payment,
                    attributes: ["gateway_payment_id", "amount", "payment_status"]
                }
            ],
            order: [["created_at", "DESC"]],
        });

        return response.success(res, 5004, orders, 200);
    } catch (error) {
        console.error("Get orders error:", error);
        return response.error(res, 9999);
    }
};
