const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const sequelize = require("../config/sequelize");
const Order = require("../models/order.model");
const OrderItem = require("../models/order_item.model");
const Payment = require("../models/payment.model");
const CartItem = require("../models/cart_item.model");
const Product = require("../models/product.model");
const Payout = require("../models/payout.model");
const Seller = require("../models/seller.model");
const response = require("../helpers");
const User = require("../models/user.model");
const { getOrCreateCustomer, createCheckoutIntent } = require("../helpers/stripe.helper");

exports.checkout = async (req, res) => {
    try {
        const { user_id } = req.user;

        const cart_items = await CartItem.findAll({
            where: { user_id },
            include: [{
                model: Product,
                attributes: ["id", "price", "stock"]
            }],
        });

        if (!cart_items || cart_items.length === 0) {
            return response.error(res, 5001, 400);
        }

        const user = await User.findOne({ where: { id: user_id } });
        if (!user) return response.error(res, 1006, 404);

        const customer_id = await getOrCreateCustomer(user);

        let total_amount = 0;

        for (const items of cart_items) {
            if (!items.product) {
                return response.error(res, 3002, 404);
            }
            if (items.product.stock < items.quantity) {
                return response.error(res, 5022, 400)
            }

            total_amount += Number(items.product.price) * items.quantity;
        }

        const paymentIntent = await createCheckoutIntent(total_amount, { user_id }, "inr", customer_id);

        return response.success(res, null, {
            client_secret: paymentIntent.client_secret
        });
    } catch (error) {
        console.error("Checkout Error: ", error);
        return response.error(res, 9999);
    }
}

exports.verifyPayment = async (req, res) => {
    try {
        const { payment_intent } = req.params;

        const intent = await stripe.paymentIntents.retrieve(payment_intent);

        if (intent.status !== "succeeded")
            return response.error(res, 4001, 400);

        const exists = await Payment.findOne({ where: { gateway_payment_id: payment_intent } });
        if (exists) return response.success(res, null, exists);

        return response.success(res, null, {
            amount: intent.amount / 100,
            transaction_id: intent.id,
            date: new Date()
        });
    } catch (err) {
        console.error("Verify Payment Error: ", err);
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
        console.error("Get Order History Error: ", error);
        return response.error(res, 9999);
    }
};