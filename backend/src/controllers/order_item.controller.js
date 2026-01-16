const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const sequelize = require("../config/sequelize");
const OrderItem = require("../models/order_item.model");
const Payment = require("../models/payment.model");
const Payout = require("../models/payout.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");
const Seller = require("../models/seller.model")
const response = require("../helpers");
const { getPaginationMetadata, getPaginatedResponse } = require("../helpers/pagination");

const STATUS_FLOW = {
    "Order Placed": "Shipped",
    "Shipped": "Out for Delivery",
    "Out for Delivery": "Delivered",
    "Delivered": null,
    "Return Requested": "Return Request Approved"
};

exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const { seller_id } = req.seller;

        const order_item = await OrderItem.findOne({
            where: { id },
            include: [
                {
                    model: Product,
                    attributes: ["seller_id"],
                },
            ],
        });

        if (!order_item) {
            return response.error(res, 5006, 404);
        }

        if (order_item.product.seller_id !== seller_id) {
            return response.error(res, 1008, 403);
        }

        const current_status = order_item.status;

        // if (!STATUS_FLOW[current_status]) {
        //     return response.error(res, 5008, 403);
        // }

        if (status !== STATUS_FLOW[current_status]) {
            return response.error(res, 5008, 403);
        }

        const updateData = { status };

        if (status === "Delivered") {
            updateData.delivered_on = new Date();
            updateData.payout_eligible_at = new Date(
                Date.now() + 10 * 24 * 60 * 60 * 1000
            );
        }

        await order_item.update(updateData);

        return response.success(res, 5007, order_item, 200);
    } catch (error) {
        console.error("Update error:", error);
        return response.error(res, 9999);
    }
};

exports.cancelOrderItem = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { order_item_id } = req.params;
        const { user_id } = req.user;

        const orderItem = await OrderItem.findOne({
            where: { id: order_item_id },
            transaction: t,
            lock: t.LOCK.UPDATE,
        });

        if (!orderItem) {
            await t.rollback();
            return response.error(res, 5006, 404);
        }

        const order = await Order.findOne({
            where: { id: orderItem.order_id },
            transaction: t,
        });

        if (!order || order.user_id !== user_id) {
            await t.rollback();
            return response.error(res, 1008, 403);
        }

        if (orderItem.status !== "Placed" && orderItem.status !== "Order Placed") {
            await t.rollback();
            return response.error(res, 5009, 400);
        }

        const product = await Product.findOne({
            where: { id: orderItem.product_id },
            attributes: { include: ["stock"] },
            transaction: t,
            lock: t.LOCK.UPDATE,
        });

        if (!product) {
            await t.rollback();
            return response.error(res, 9001, 404);
        }

        const currentStock = Number(product.stock);
        const qtyToRestore = Number(orderItem.quantity);

        await product.update(
            { stock: currentStock + qtyToRestore },
            { transaction: t }
        );

        await orderItem.update(
            { status: "Order Cancelled" }, 
            { transaction: t }
        );

        // 7️⃣ Block Seller Payout
        // CHANGE: Use "Order Cancelled" to match your Payout Enum
        await Payout.update(
            { status: "Order Cancelled" }, 
            { where: { order_item_id }, transaction: t }
        );

        await t.commit();
        return response.success(res, 5011, { message: "Order cancelled & refunded" }, 200);

    } catch (error) {
        await t.rollback();
        console.error("Cancel OrderItem error:", error);
        return response.error(res, 9999);
    }
};

exports.requestReturn = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { order_item_id, return_reason } = req.body;
        const { user_id } = req.user;

        const orderItem = await OrderItem.findOne({
            where: { id: order_item_id },
            include: [{ model: Order }],
            transaction: t,
            lock: t.LOCK.UPDATE,
        });

        if (!orderItem || orderItem.order.user_id !== user_id) {
            await t.rollback();
            return response.error(res, 5006, 404);
        }

        if (orderItem.status !== "Delivered") {
            await t.rollback();
            return response.error(res, 5018, 400);
        }

        const deliveredDate = new Date(orderItem.delivered_on);
        const diffDays =
            (Date.now() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24);

        if (diffDays > 7) {
            await t.rollback();
            return response.error(res, 5019, 400);
        }

        await orderItem.update(
            {
                status: "Return Requested",
                return_reason,
                returned_on: new Date(),
            },
            { transaction: t }
        );

        // Block payout
        await Payout.update(
            { status: "Order Returned" },
            { where: { order_item_id }, transaction: t }
        );

        await t.commit();
        return response.success(res, 5020, null, 200);

    } catch (error) {
        await t.rollback();
        console.error("Return error:", error);
        return response.error(res, 9999);
    }
};

exports.sellerOrderHistory = async (req, res) => {
    try {
        const seller_id = req.seller.id;

        const { page, limit, offset } = getPaginationMetadata(
            req.query.page,
            req.query.limit
        );

        const orderItem = await OrderItem.findAndCountAll({
            limit,
            offset,
            order: [['created_at', 'DESC']],
            include: [
                {
                    model: Product,
                    where: { seller_id: seller_id },
                    attributes: ['product_name', 'image', 'price']
                },
                {
                    model: Order,
                    attributes: ['id', 'created_at', 'address', 'user_id']
                },
                {
                    model: Payout,
                    attributes: ['amount', 'status']
                }
            ]
        });

        const paginatedResponse = getPaginatedResponse(
            orderItem,
            page,
            limit
        );

        return response.success(res, null, paginatedResponse, 200);

    } catch (error) {
        console.error("Seller Order History Error:", error);
        return response.error(res, 9999);
    }
};



// exports.requestReturn = async (req, res) => {
//     try {
    //         const { order_item_id, reason } = req.body;
    //         const user_id = req.user.user_id; // From verifyUser middleware
    
    //         const orderItem = await OrderItem.findOne({
        //             where: { id: order_item_id },
//             include: [{ model: Order, where: { user_id } }] // Ensure User owns this order
//         });

//         if (!orderItem) {
//             return response.error(res, 404, "Order Item not found");
//         }

//         if (orderItem.status !== "Delivered") {
//             return response.error(res, 400, "Only delivered items can be returned");
//         }

//         await orderItem.update({ 
//             status: "Return_Requested",
//             return_reason: reason // Ensure your model has this field or remove this line
//         });

//         return response.success(res, 200, "Return requested. Waiting for approval.");

//     } catch (error) {
//         console.error("Return Request Error:", error);
//         return response.error(res, 9999);
//     }
// };

// exports.refundOrderItem = async (req, res) => {
//     const t = await sequelize.transaction();

//     try {
//         const { order_item_id } = req.params;

//         const orderItem = await OrderItem.findOne({
//             where: { id: order_item_id },
//             include: [{ 
//                 model: Product,
//                 required: true
//             }],
//             transaction: t,
//             lock: t.LOCK.UPDATE,
//         });

//         if (!orderItem) {
//             await t.rollback();
//             return response.error(res, 5006, 404);
//         }

//         if (orderItem.status !== "Delivered" || orderItem.status !== "Refunded") {
//             await t.rollback();
//             return response.error(res, 5009, 400);
//         }

//         const payment = await Payment.findOne({ 
//             where: { order_id: targetItem.order_id },
//             transaction: t 
//         });

//         if (!payment) {
//             await t.rollback();
//             return response.error(res, 5010, 404);
//         }

//         const refundAmount = orderItem.price;

//         await stripe.refunds.create({
//             payment_intent: payment.gateway_payment_id,
//             amount: Math.round(refundAmount * 100),
//             reason: "requested_by_customer",
//         });

//         await orderItem.update(
//             { status: "Refunded" },
//             { transaction: t }
//         );

//         const currentRefunded = Number(payment.refunded_amount) || 0;
//         await payment.update({ 
//             refunded_amount: currentRefunded + refundAmount,
//             payment_status: "Partially_Refunded"
//         }, { transaction: t });

//         const product = await Product.findOne({
//             where: { id: item.product_id, is_deleted: false },
//             transaction,
//             lock: transaction.LOCK.UPDATE,
//         });

//         await product.update({
//             stock: product.stock + orderItem.quantity
//         },
//             { transaction }
//         );

//         const payout = await Payout.findOne({
//             where: { order_item_id: orderItem.id },
//             transaction: t,
//             lock: t.LOCK.UPDATE,
//         });

//         if (payout && payout.status === "Pending") {
//             await payout.update(
//                 { status: "Reversed" },
//                 { transaction: t }
//             );
//         }
//         else {
//             return response.error(res, 5017, 400);
//         }

//         await t.commit();
//         return response.success(res, 5011, null, 200);
//     } catch (error) {
//         await t.rollback();
//         console.error("Refund Item Error:", error);
//         return response.error(res, 9999);
//     }
// };


// exports.sellerPayout = async (req, res) => {
//     const transaction = await sequelize.transaction();

//     try {
//         const { order_item_id } = req.params;

//         const payout = await Payout.findOne({
//             where: { order_item_id },
//             include: [
//                 {
//                     model: OrderItem,
//                     include: [
//                         {
//                             model: Product,
//                             include: [{ model: Seller }]
//                         }
//                     ]
//                 }
//             ],
//             transaction
//         });

//         if (!payout) {
//             await transaction.rollback();
//             return response.error(res, 5012, 404);
//         }

//         if (payout.status === "Paid") {
//             await transaction.rollback();
//             return response.error(res, 5013, 404);
//         }

//         if (payout.status === "Reversed") {
//             await transaction.rollback();
//             return response.error(res, 5014, 404);
//         }

//         const seller = payout.order_item?.product?.seller;

//         if (!seller || !seller.stripe_account_id) {
//             await transaction.rollback();
//             // return response.error(res, 400, "Seller Stripe account not found or not connected");
//             return response.error(res, 5015, 404);
//         }

//         const transfer = await stripe.transfers.create({
//             amount: Math.round(payout.amount * 100),
//             currency: "inr",
//             destination: seller.stripe_account_id,
//             transfer_group: `ORDER_${payout.order_item.order_id}`,
//         });

//         await payout.update({
//             status: "Paid",
//             stripe_transfer_id: transfer.id
//         }, { transaction });

//         await transaction.commit();

//         return response.success(res, 5016, null, 200);

//     } catch (error) {
//         await transaction.rollback();
//         console.error("Seller Payout Error: ", error);
//         return response.error(res, 9999);
//     }
// };