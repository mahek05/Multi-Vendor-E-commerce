const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { Op } = require("sequelize");
const sequelize = require("../config/sequelize");
const OrderItem = require("../models/order_item.model");
const Payment = require("../models/payment.model");
const Product = require("../models/product.model");
const Payout = require("../models/payout.model");

exports.refundOrderItems = async () => {
    const transaction = await sequelize.transaction();

    try {
        const orderItems = await OrderItem.findAll({
            where: {
                status: {
                    [Op.or]: ["Order Cancelled", "Return Request Approved"]
                }
            },
            transaction,
            lock: transaction.LOCK.UPDATE
        });

        if (!orderItems.length) {
            await transaction.rollback();
            console.log("No pending refunds found.");
            return;
        }

        for (const orderItem of orderItems) {
            if (orderItem.status === "Refunded") continue;

            const payment = await Payment.findOne({
                where: { order_id: orderItem.order_id },
                transaction,
                lock: transaction.LOCK.UPDATE
            });

            if (!payment) {
                console.error(`Payment missing for order_item ${orderItem.id}`);
                continue;
            }

            const refundAmount = Number(orderItem.price);

            const payout = await Payout.findOne({
                where: { order_item_id: orderItem.id },
                transaction,
                lock: transaction.LOCK.UPDATE
            });

            if (payout && payout.status === "Paid") {
                console.error(`Seller already paid for ${orderItem.id}, cannot auto-refund.`);
                continue;
            }

            try {
                await stripe.refunds.create({
                    payment_intent: payment.gateway_payment_id,
                    amount: Math.round(refundAmount * 100),
                    reason: "requested_by_customer",
                });

            } catch (stripeError) {
                console.error(`Stripe Error: ${stripeError.message}`);
                throw stripeError;
            }

            await orderItem.update({
                status: "Refunded",
                returned_on: new Date(),
            }, { transaction });

            await orderItem.update({
                status: "Refunded",
                returned_on: new Date(),
            }, { transaction });

            const updatedRefunded = Number(payment.refunded_amount) + refundAmount;

            await payment.update({
                refunded_amount: updatedRefunded,
                payment_status:
                    updatedRefunded >= Number(payment.amount)
                        ? "Refunded"
                        : "Partially_Refunded"
            }, { transaction });

            const product = await Product.findOne({
                where: { id: orderItem.product_id },
                transaction,
                lock: transaction.LOCK.UPDATE
            });

            if (product) {
                await product.increment('stock', { by: orderItem.quantity, transaction });
            }

            if (payout) {
                await payout.update({
                    status: orderItem.status === "Order Cancelled" ? "Order Cancelled" : "Order Returned"
                }, { transaction });
            }
        }

        await transaction.commit();
        console.log("Refunds processed successfully.");

    } catch (error) {
        await transaction.rollback();
        console.error("Refund Cron Error:", error.message);
    }
};