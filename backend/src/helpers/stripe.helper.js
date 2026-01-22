const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.createPaymentIntent = async (amount, payment_method, currency = "inr") => {
    const payment_intent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency,
        payment_method: payment_method,
        confirm: true,
        automatic_payment_methods: {
            enabled: true,
            allow_redirects: "never"
        }
    });

    if (payment_intent.status !== "succeeded") {
        throw new Error(`Payment failed with status: ${payment_intent.status}`);
    }

    return payment_intent;
};

exports.createRefund = async (paymentIntentId, amount, reason = "requested_by_customer") => {
    const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: Math.round(amount * 100),
        reason
    });

    if (refund.status !== "succeeded") {
        throw new Error(`Refund failed with status: ${refund.status}`);
    }

    return refund;
};

exports.createTransfer = async (amount, destination_id, transfer_group, currency = "inr") => {
    const transfer = await stripe.transfers.create({
        amount: Math.round(amount * 100),
        currency,
        destination: destination_id,
        transfer_group: transfer_group,
    });

    if (transfer.status !== "succeeded") {
        throw new Error(`Payout failed with status: ${transfer.status}`);
    }

    return transfer;
};