const { Op } = require("sequelize");
const Payout = require("../models/payout.model")

exports.processPayouts = async (req, res) => {
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
            return response.error(res, 5006, 404);
        }

        let paid = 0;

        for (const payout of payouts) {
            const seller = await Seller.findByPk(payout.seller_id);

            if (!seller || !seller.stripe_account_id) continue;

            const transfer = await stripe.transfers.create({
                amount: Math.round(payout.amount * 100),
                currency: "inr",
                destination: seller.stripe_account_id,
                transfer_group: `ORDER_ITEM_${payout.order_item_id}`,
            });

            await payout.update({
                status: "Paid",
            });

            paid++;
        }

        return response.success(res, 200, { paid }, 200);

    } catch (error) {
        console.error("Payout error:", error);
        return response.error(res, 9999);
    }
};
