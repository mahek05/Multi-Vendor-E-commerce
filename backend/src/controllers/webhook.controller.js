const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const sequelize = require("../config/sequelize");
const CartItem = require("../models/cart_item.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");
const OrderItem = require("../models/order_item.model");
const Payment = require("../models/payment.model");
const Payout = require("../models/payout.model");

const PLATFORM_FEE_PERCENT = 0.10;

exports.handleStripeWebhook = async (req, res) => {
    let event;

    try {
        const sig = req.headers["stripe-signature"];

        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            endpointSecret
        );
    } catch (err) {
        console.log("Webhook signature failed.");
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type !== "payment_intent.succeeded") {
        return res.json({ received: true });
    }

    const paymentIntent = event.data.object;
    const user_id = paymentIntent.metadata.user_id;

    const transaction = await sequelize.transaction();

    try {
        const cartItems = await CartItem.findAll({
            where: { user_id },
            transaction,
            lock: transaction.LOCK.UPDATE
        });

        if (!cartItems.length) {
            await transaction.rollback();
            return res.json({ received: true });
        }

        const order = await Order.create({
            user_id,
            address: "Saved during checkout step"
        }, { transaction });

        const chargeId = paymentIntent.latest_charge;

        const payment = await Payment.create({
            order_id: order.id,
            gateway_payment_id: paymentIntent.id,
            stripe_charge_id: chargeId,
            transfer_group: paymentIntent.id,
            amount: paymentIntent.amount / 100,
            payment_status: "Paid"
        }, { transaction });

        for (const item of cartItems) {
            const product = await Product.findOne({
                where: { id: item.product_id },
                transaction,
                lock: transaction.LOCK.UPDATE
            });

            if (!product) throw new Error("Product not found");
            if (product.stock < item.quantity)
                throw new Error("Stock changed after payment — manual refund needed");

            const amount = item.quantity * product.price;

            const orderItem = await OrderItem.create({
                order_id: order.id,
                product_id: item.product_id,
                quantity: item.quantity,
                price: amount
            }, { transaction });

            await Payout.create({
                seller_id: product.seller_id,
                order_item_id: orderItem.id,
                payment_id: payment.id,
                amount: amount * (1 - PLATFORM_FEE_PERCENT),
                status: "Pending"
            }, { transaction });

            await product.decrement("stock", {
                by: item.quantity,
                transaction
            });
        }

        await CartItem.destroy({ where: { user_id }, transaction });

        await transaction.commit();

    } catch (err) {
        await transaction.rollback();
        console.error("Webhook DB error:", err);
    }
    res.json({ received: true });
};