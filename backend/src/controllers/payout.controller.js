const { Op } = require("sequelize");
const Payout = require("../models/payout.model");
const OrderItem = require("../models/order_item.model");
const Product = require("../models/product.model");
const Seller = require("../models/seller.model");
const Payment = require("../models/payment.model");
const { createTransfer } = require("../helpers/stripe.helper");
const sequelize = require("../config/sequelize");

exports.processPayouts = async () => {
    const transaction = await sequelize.transaction();
    try {
        const payouts = await Payout.findAll({
            where: { status: "Pending" },
            transaction,
            lock: transaction.LOCK.UPDATE
        });

        if (payouts.length === 0) {
            await transaction.rollback();
            console.log("No pending payouts found.");
            return;
        }

        for (const payout of payouts) {
            const orderItem = await OrderItem.findOne({
                where: {
                    id: payout.order_item_id,
                    status: { [Op.or]: ["Delivered", "Return Request Not Approved"] },
                    payout_eligible_at: { [Op.lte]: new Date() }
                },
                transaction,
                lock: transaction.LOCK.UPDATE
            });

            if (!orderItem) continue;

            const payment = await Payment.findOne({
                where: {
                    id: payout.payment_id
                },
                transaction,
                lock: transaction.LOCK.UPDATE
            });

            if (!payment) continue;

            const seller = await Seller.findOne({
                where: { id: payout.seller_id },
                transaction
            });

            if (!seller || !seller.stripe_account_id) continue;

            const transfer_group = payment.transfer_group;
            try {
                const transfer = await createTransfer(payout.amount, seller.stripe_account_id, transfer_group);

                await payout.update({
                    status: "Paid",
                    stripe_transfer_id: transfer.id
                }, { transaction });
                console.log(`Payout success: ${payout.id}`);
            } catch (stripeError) {
                console.error(`Stripe Error: ${stripeError.message}`);
            }
        }
        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        console.error("Payout error:", error);
    }
};
