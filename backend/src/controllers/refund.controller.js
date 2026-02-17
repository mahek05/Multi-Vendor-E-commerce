const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { Op } = require("sequelize");
const sequelize = require("../config/sequelize");
const OrderItem = require("../models/order_item.model");
const Payment = require("../models/payment.model");
const Product = require("../models/product.model");
const Payout = require("../models/payout.model");
const { createRefund } = require("../helpers/stripe.helper");

exports.refundOrderItems = async () => {

    const orderItems = await OrderItem.findAll({
        where: {
            status: { [Op.or]: ["Order Cancelled", "Return Request Approved"] },
            refund_processing: false
        }
    });
    if (!orderItems.length) {
        console.log("No pending refunds found.");
        return;
    }
    for (const orderItem of orderItems) {
        await processSingleRefund(orderItem);
    }
};

async function processSingleRefund(orderItem) {
    const transaction = await sequelize.transaction();
    try {
        const item = await OrderItem.findOne({
            where: { id: orderItem.id },
            transaction,
            lock: transaction.LOCK.UPDATE
        });

        if (!item || item.status === "Refunded") {
            await transaction.rollback();
            return;
        }

        await item.update({ refund_processing: true }, { transaction });

        const payment = await Payment.findOne({
            where: { order_id: item.order_id },
            transaction,
            lock: transaction.LOCK.UPDATE
        });

        if (!payment)
            throw new Error(`Payment not found for ${item.id}`);

        const payout = await Payout.findOne({
            where: { order_item_id: item.id },
            transaction,
            lock: transaction.LOCK.UPDATE
        });

        const refundAmount = Number(item.price);
        if (payout && payout.status === "Paid" && payout.stripe_transfer_id) {
            await stripe.transfers.createReversal(payout.stripe_transfer_id);
            await payout.update({ status: "Reversed" }, { transaction });
        }

        await createRefund(
            payment.stripe_charge_id,
            refundAmount,
            `refund_${item.id}`
        );

        const updatedRefunded = Number(payment.refunded_amount) + refundAmount;

        await payment.update({
            refunded_amount: updatedRefunded,
            payment_status:
                updatedRefunded >= Number(payment.amount)
                    ? "Refunded"
                    : "Partially_Refunded"
        }, { transaction });

        await item.update({
            status: "Refunded",
            refund_processing: false
        }, { transaction });

        await Product.increment(
            { stock: item.quantity },
            { where: { id: item.product_id }, transaction }
        );

        await transaction.commit();
        console.log(`Refund success for orderItem ${item.id}`);
    } catch (error) {
        await transaction.rollback();
        console.error(`Refund failed for ${orderItem.id}:`, error.message);
    }
}