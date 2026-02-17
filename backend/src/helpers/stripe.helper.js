const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.getOrCreateCustomer = async (user) => {

    if (user.stripe_customer_id)
        return user.stripe_customer_id;

    const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
            user_id: user.id
        }
    });

    await user.update({
        stripe_customer_id: customer.id
    });

    return customer.id;
}

exports.createCheckoutIntent = async (amount, metadata = {}, currency, customer_id) => {
    const payment_intent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency,
        customer: customer_id,
        automatic_payment_methods: {
            enabled: true,
            allow_redirects: "never"
        },
        metadata,
    });
    return payment_intent;
};

exports.createRefund = async (chargeId, amount) => {
    const refund = await stripe.refunds.create({
        charge: chargeId,
        amount: Math.round(amount * 100)
    }, {
        idempotencyKey: `refund_${chargeId}`
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
    }, {
        idempotencyKey: `payout_${transfer_group}_${destination_id}_${amount}`
    });

    if (transfer.status !== "succeeded") {
        throw new Error(`Payout failed with status: ${transfer.status}`);
    }

    return transfer;
};

exports.createConnectedAccount = async (email, country = "US") => {
    const account = await stripe.accounts.create({
        type: "express",
        email,
        country,
        capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
        },
    });

    return account.id;
};

exports.generateOnboardingLink = async (accountId, redirectUrl) => {
    const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: redirectUrl,
        return_url: redirectUrl,
        type: "account_onboarding",
    });

    return accountLink.url;
};