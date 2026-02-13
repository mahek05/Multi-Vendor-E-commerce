import { useEffect, useState } from "react";
import { api } from "../../api/api";

const API_BASE_URL = "http://localhost:5000";

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            const res = await api("/order/myOrder", "GET");

            if (res?.success) {
                setOrders(res.data || []);
            }
        };

        fetchOrders();
    }, []);

    if (!orders.length) {
        return (
            <div className="p-10 text-center text-slate-600">
                No orders found.
            </div>
        );
    }

    return (
        <section className="py-10 bg-slate-50 relative">
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
                                className="bg-white border border-slate-200 rounded-lg p-4"
                            >
                                {/* Order meta */}
                                <div className="flex flex-wrap justify-between gap-4 mb-4">
                                    <div>
                                        <p className="text-sm text-slate-500">
                                            Order ID
                                        </p>
                                        <p className="text-sm font-medium text-slate-900">
                                            #{order.id.slice(0, 8)}
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

                                {/* Order items */}
                                <div className="divide-y divide-slate-200">
                                    {order.order_items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="py-4 flex gap-4 items-start"
                                        >
                                            <img
                                                src={`${API_BASE_URL}${item.product.image}`}
                                                alt={item.product.product_name}
                                                className="w-24 h-20 object-cover rounded-md border"
                                            />

                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-slate-900">
                                                    {item.product.product_name}
                                                </p>

                                                <p className="text-xs text-slate-500 mt-1">
                                                    Qty: {item.quantity}
                                                </p>

                                                <p className="text-xs text-slate-500">
                                                    Price: ₹{item.price}
                                                </p>
                                            </div>

                                            {/* Status */}
                                            <span
                                                className={`text-xs font-medium px-2 py-1 rounded-full
                                                    ${item.status === "Delivered"
                                                        ? "bg-green-100 text-green-700"
                                                        : item.status.includes("Cancelled")
                                                            ? "bg-red-100 text-red-700"
                                                            : "bg-indigo-100 text-indigo-700"
                                                    }`}
                                            >
                                                {item.status}
                                            </span>
                                        </div>
                                    ))}
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
