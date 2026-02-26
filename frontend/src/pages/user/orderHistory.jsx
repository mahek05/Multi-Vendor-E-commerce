import { useEffect, useState } from "react";
import { api } from "../../api/api";

const API_BASE_URL = "http://localhost:5000";

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);

    const fetchOrders = async () => {
        const res = await api("/order/myOrder", "GET");
        if (res?.success) {
            setOrders(res.data || []);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const canRequestRefund = (item) =>
        item?.status === "Placed" || item?.status === "Order Placed";

    const canRequestReturn = (item) => {
        if (item?.status !== "Delivered") return false;
        if (!item?.delivered_on) return false;

        const deliveredOn = new Date(item.delivered_on);
        const diffDays =
            (Date.now() - deliveredOn.getTime()) / (1000 * 60 * 60 * 24);

        return diffDays <= 7;
    };

    const handleRefund = async (itemId) => {
        const res = await api(`/order-item/cancel/${itemId}`, "PUT");
        if (res?.success) fetchOrders();
    };

    const handleReturn = async (item) => {
        const reason = window.prompt("Enter return reason:");
        if (reason === null) return;

        const res = await api(`/order-item/return/${item.id}`, "PUT", {
            return_reason: reason.trim() || "No reason provided"
        });

        if (res?.success) fetchOrders();
    };

    if (!orders.length) {
        return (
            <div className="p-10 text-center text-slate-600">
                No orders found.
            </div>
        );
    }

    return (
        <section className="min-h-[calc(100vh-4rem)] py-4 bg-slate-50">
            <div className="max-w-6xl mx-auto px-4">
                <h2 className="text-2xl font-semibold text-slate-900 mb-6 text-center">
                    My Orders
                </h2>

                <div className="space-y-4">
                    {orders.map((order) => {

                        const rawDate =
                            order.created_at ||
                            order.createdAt ||
                            order.created_at?.$date;

                        const formattedDate = rawDate
                            ? new Date(rawDate).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                            })
                            : "—";

                        return (
                            <div
                                key={order.id}
                                className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition"
                            >
                                <div className="flex flex-wrap justify-between gap-4 mb-4">
                                    <div>
                                        <p className="text-sm text-slate-500">
                                            Order ID
                                        </p>

                                        <p className="text-sm font-medium text-slate-900">
                                            #{order.id?.slice(0, 8)}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-slate-500">
                                            Ordered on
                                        </p>
                                        <p className="text-sm font-medium text-slate-900">
                                            {formattedDate}
                                        </p>
                                    </div>
                                </div>

                                <div className="divide-y divide-slate-200">
                                    {(order.order_items || []).map((item) => {
                                        return (
                                            <div
                                                key={item.id}
                                                className="py-2 flex flex-col md:flex-row gap-4 justify-between"
                                            >
                                                <div className="flex gap-10">
                                                    <img
                                                        src={`${API_BASE_URL}${item.product?.image || ""}`}
                                                        alt={item.product?.product_name}
                                                        className="w-24 aspect-[3/4] object-cover rounded-md border"
                                                    />

                                                    <div>
                                                        <p className="text-sm font-medium text-slate-900">
                                                            {item.product?.product_name}
                                                        </p>

                                                        <p className="text-xs text-slate-500 mt-1">
                                                            Qty: {item.quantity}
                                                        </p>

                                                        <p className="text-xs text-slate-500">
                                                            Price: ₹{item.price}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex justify-between items-start mt-2 border-t border-slate-100 pt-4 gap-3">
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={() => handleRefund(item.id)}
                                                            disabled={!canRequestRefund(item)}
                                                            className={`text-xs px-3 py-1 rounded-md border transition
                                                                ${canRequestRefund(item)
                                                                    ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                                                    : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                                                }`}
                                                        >
                                                            Refund
                                                        </button>

                                                        <button
                                                            onClick={() => handleReturn(item)}
                                                            disabled={!canRequestReturn(item)}
                                                            className={`text-xs px-3 py-1 rounded-md border transition
                                                                ${canRequestReturn(item)
                                                                    ? "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                                                                    : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                                                }`}
                                                        >
                                                            Return
                                                        </button>
                                                    </div>

                                                    <div className="text-right">
                                                        <p className="text-xs text-slate-500">
                                                            Order Status:
                                                        </p>

                                                        <span
                                                            className={`mt-1 text-xs font-normal px-2 py-1 rounded-full border ${item.status === "Delivered"
                                                                ? "bg-green-50 text-green-700 border-green-200"
                                                                : item.status.includes("Cancelled")
                                                                    ? "bg-red-50 text-red-700 border-red-200"
                                                                    : "bg-indigo-50 text-indigo-700 border-indigo-200"}`}
                                                        >
                                                            {item.status}
                                                        </span>

                                                        {item.return_reason && (
                                                            <p className="text-xs text-slate-500 mt-1 max-w-[220px]">
                                                                Reason: {item.return_reason}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default OrderHistory;