const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const sequelize = require("../config/sequelize");

const OrderItem = require("../models/order_item.model");
const Payment = require("../models/payment.model");
const Product = require("../models/product.model");
const Payout = require("../models/payout.model");

const response = require("../helpers");

exports.refundOrderItem = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { order_item_id } = req.params;

        const orderItem = await OrderItem.findOne({
            where: { id: order_item_id },
            transaction,
            lock: transaction.LOCK.UPDATE,
        });

        if (!orderItem) {
            await transaction.rollback();
            return response.error(res, 5006, 404);
        }

        if (!["Order Cancelled", "Return Request Approved"].includes(orderItem.status)) {
            await transaction.rollback();
            return response.error(res, 5009, 400);
        }

        const payment = await Payment.findOne({
            where: { order_id: orderItem.order_id },
            transaction,
            lock: transaction.LOCK.UPDATE,
        });

        if (!payment) {
            await transaction.rollback();
            return response.error(res, 5010, 404);
        }

        const refundAmount = Number(orderItem.price); 

        await stripe.refunds.create({
            payment_intent: payment.gateway_payment_id,
            amount: Math.round(refundAmount * 100),
            reason: "requested_by_customer",
        });

        await orderItem.update(
            {
                status: "Refunded",
                returned_on: new Date(),
            },
            { transaction }
        );

        const newRefundedAmount = Number(payment.refunded_amount) + refundAmount;

        await payment.update(
            {
                refunded_amount: newRefundedAmount,
                payment_status:
                    newRefundedAmount >= Number(payment.amount)
                        ? "Refunded"
                        : "Partially_Refunded",
            },
            { transaction }
        );

        const product = await Product.findByPk(orderItem.product_id, {
            transaction,
            lock: transaction.LOCK.UPDATE,
        });

        if (product) {
            await product.update(
                { stock: product.stock + orderItem.quantity },
                { transaction }
            );
        }

        await Payout.update(
            {
                status:
                    orderItem.status === "Order Cancelled"
                        ? "Order Cancelled"
                        : "Order Returned",
            },
            {
                where: { order_item_id },
                transaction,
            }
        );

        await transaction.commit();
        return response.success(res, 5005, null, 200);

    } catch (error) {
        await transaction.rollback();
        console.error("Refund error:", error);
        return response.error(res, 9999);
    }
};