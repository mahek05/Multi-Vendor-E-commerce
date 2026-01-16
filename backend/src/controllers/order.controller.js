const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const sequelize = require("../config/sequelize");

const Order = require("../models/order.model");
const OrderItem = require("../models/order_item.model");
const Payment = require("../models/payment.model");
const CartItem = require("../models/cart_item.model");
const Product = require("../models/product.model");
// const Seller = require("../models/seller.model");
const Payout = require("../models/payout.model");

const response = require("../helpers");

const PLATFORM_FEE_PERCENT = 0.10;

//Checkout
exports.checkout = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { user_id } = req.user;
        const { payment_method_id, address } = req.body;

        if (!payment_method_id || !address) {
            await transaction.rollback();
            return response.error(res, 9000, 400);
        }

        const cart_items = await CartItem.findAll({
            where: { user_id },
            include: [{ model: Product }],
            transaction
        });

        if (!cart_items || cart_items.length === 0) {
            await transaction.rollback();
            return response.error(res, 5001, 400);
        }

        let total_amount = 0;
        for (const item of cart_items) {
            const price = Number(item.product.price);
            total_amount += price * item.quantity;
        }

        const payment_intent = await stripe.paymentIntents.create({
            amount: Math.round(total_amount * 100),
            currency: "inr",
            payment_method: payment_method_id,
            confirm: true,
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: "never",
            },
        });

        if (payment_intent.status !== "succeeded") {
            await transaction.rollback();
            return response.error(res, 5002, 400);
        }

        const order = await Order.create({
            user_id,
            total_amount,
            address
        }, { transaction });

        const payment = await Payment.create({
            order_id: order.id,
            gateway_payment_id: payment_intent.id,
            amount: total_amount,
        }, { transaction });

        for (const item of cart_items) {
            const product = await Product.findOne({
                where: { id: item.product_id, is_deleted: false },
                attributes: { include: ["stock"] },
                transaction,
                lock: transaction.LOCK.UPDATE,
            });

            if (!product) {
                throw new Error(`Product not found: ${item.product_id}`);
            }

            const currentStock = Number(product.stock);
            const quantity = Number(item.quantity);

            // if (isNaN(currentStock) || isNaN(quantity)) {
            //     throw new Error(`Invalid data: Stock=${currentStock}, Qty=${quantity}`);
            // }

            // if (currentStock < quantity) {
            //     throw new Error(`Insufficient stock for ${product.product_name}`);
            // }

            await product.update({
                stock: currentStock - quantity
            }, { transaction });

            const unitPrice = Number(item.product.price);
            
            const order_item = await OrderItem.create({
                order_id: order.id,
                product_id: item.product_id,
                quantity: quantity,
                price: unitPrice, 
            }, { transaction });

            const seller_id = item.product.seller_id;
            const item_total = unitPrice * quantity;
            const seller_share = item_total * (1 - PLATFORM_FEE_PERCENT);

            await Payout.create({
                amount: seller_share,
                payment_id: payment.id,
                order_item_id: order_item.id,
                seller_id: seller_id,
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

// exports.refundOrder = async (req, res) => {
//     try {
//         const { order_id } = req.params;

//         const payment = await Payment.findOne({ where: { order_id } });

//         if (!payment) {
//             return response.error(res, 9001, 404);
//         }

//         const refund = await stripe.refunds.create({
//             payment_intent: payment.gateway_payment_id,
//         });

//         if (refund.status === "succeeded") {
//             await Order.update(
//                 { is_deleted: true },
//                 { where: { id: order_id } }
//             );

//             await Payout.update(
//                 { status: "Refunded" },
//                 { where: { payment_id: payment.id, status: "Pending" } }
//             );
//         }

//         return response.success(res, 5005, refund, 200);
//     } catch (error) {
//         console.error("Refund error:", error);
//         return response.error(res, 9999);
//     }
// };