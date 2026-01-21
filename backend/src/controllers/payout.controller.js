const { Op } = require("sequelize");
const Payout = require("../models/payout.model");
const OrderItem = require("../models/order_item.model");
const Product = require("../models/product.model");
const Seller = require("../models/seller.model");
const {createTransfer} = require("../helpers/stripe.helper");

exports.processPayouts = async () => {
    try {
        const payouts = await Payout.findAll({
            where: {
                status: "Pending",
            },
            include: [
                {
                    model: OrderItem,
                    where: {
                        status: "Delivered",
                        payout_eligible_at: {
                            [Op.lte]: new Date(),
                        },
                    },
                    include: [{ model: Product }],
                },
            ],
        });

        if (payouts.length === 0) {
            console.log("No pending payouts found.");
            return;
        }

        let paid = 0;

        for (const payout of payouts) {
            const seller = await Seller.findByPk(payout.seller_id);

            if (!seller || !seller.stripe_account_id) continue;

            const transfer_group = `ORDER_ITEM_${payout.order_item_id}`

            await createTransfer(payout.amount, seller.stripe_account_id, transfer_group)
        
            await payout.update({
                status: "Paid",
            });

            paid++;
        }

        console.log(`Payouts Processed: ${paid}`);
        return { paid };

    } catch (error) {
        console.error("Payout error:", error);
    }
};
