import { useEffect, useState } from "react";
import { api } from "../../api/api";
import Pagination from "../../components/Pagination";

const API_BASE_URL = "http://localhost:5000";

const STATUS_FLOW = {
    "Order Placed": ["Shipped"],
    "Shipped": ["Out for Delivery"],
    "Out for Delivery": ["Delivered"],
    "Delivered": [],
    "Return Requested": [
        "Return Request Approved",
        "Return Request Not Approved"
    ]
};

const SellerOrders = () => {
    const [orders, setOrders] = useState([]);
    const [pageInfo, setPageInfo] = useState(null);
    const [page, setPage] = useState(1);
    const [openId, setOpenId] = useState(null);


    const fetchOrders = async () => {
        const res = await api(
            `/order-item/seller/history?page=${page}`,
            "GET"
        );

        if (!res?.success) return;

        setOrders(res.data.page_data);
        setPageInfo(res.data.page_information);
    };

    useEffect(() => {
        fetchOrders();
    }, [page]);

    const updateStatus = async (item, newStatus) => {
        await api(`/order-item/status/${item.id}`, "PUT", {
            status: newStatus,
        });

        fetchOrders();
    };

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
                    Seller Orders
                </h2>

                <div className="space-y-4">
                    {orders.map((order) => {
                        const rawDate =
                            order.order.created_at ||
                            order.order.createdAt ||
                            order.order.created_at?.$date;
                        const formattedDate = rawDate
                            ? new Date(rawDate).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                            })
                            : "—";
                        return (
                            // <div
                            //     key={item.id}
                            //     className="bg-white border border-slate-200 rounded-lg p-4 flex justify-between items-center"
                            // >
                            //     <div>
                            //         <p className="font-medium text-slate-900">
                            //             {item.product.product_name}
                            //         </p>
                            //         <p className="text-sm text-slate-500">
                            //             Qty: {item.quantity}
                            //         </p>
                            //         <p className="text-sm text-slate-500">
                            //             Status: {item.status}
                            //         </p>
                            //     </div>

                            //     {STATUS_FLOW[item.status] && (
                            //         <button
                            //             onClick={() => updateStatus(item)}
                            //             className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                            //         >
                            //             Mark as {STATUS_FLOW[item.status]}
                            //         </button>
                            //     )}
                            // </div>

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
                                            #{order.id.slice(0, 8)}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-slate-500">
                                            Payout ID
                                        </p>
                                        <p className="text-sm font-medium text-slate-900">
                                            #{order.payout.id.slice(0, 8)}
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
                                    <div
                                        key={order.id}
                                        className="py-4 flex gap-4 items-start"
                                    >
                                        <img
                                            src={`${API_BASE_URL}${order.product.image}`}
                                            alt={order.product.product_name}
                                            className="w-24 h-20 object-cover rounded-md border"
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-slate-900">
                                                {order.product.product_name}
                                            </p>

                                            <p className="text-xs text-slate-500 mt-1">
                                                Qty: {order.quantity}
                                            </p>

                                            <p className="text-xs text-slate-500">
                                                Price: ₹{order.price}
                                            </p>

                                            <p className="text-xs text-slate-500">
                                                Payout Amount: ₹{order.payout.amount}
                                            </p>
                                        </div>
                                    </div>

                                    {/* <div className="text-right space-y-2">
                                        <div>
                                            <p className="text-xs text-slate-500">
                                                Order Status
                                            </p>

                                            <span
                                                className={`text-xs font-medium px-2 py-1 rounded-full
                                                    ${order.status === "Delivered"
                                                        ? "bg-green-100 text-green-700"
                                                        : order.status.includes("Cancelled")
                                                            ? "bg-red-100 text-red-700"
                                                            : "bg-indigo-100 text-indigo-700"
                                                    }`}
                                            >{order.status}
                                            </span>
                                        </div>

                                        <div>
                                            <p className="text-xs text-slate-500">
                                                Payout Status
                                            </p>
                                            <span
                                                className={`text-xs font-medium px-2 py-1 rounded-full
                                                    ${order.payout.status === "Paid"
                                                        ? "bg-green-100 text-green-700"
                                                        : order.payout.status.includes("Order Cancelled")
                                                            ? "bg-red-100 text-red-700"
                                                            : "bg-indigo-100 text-indigo-700"
                                                    }`}
                                            >
                                                {order.payout.status}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <button
                                        onClick={() => setOpenId(openId === order.id ? null : order.id)}
                                        className="mt-4 px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                                        aria-label="Status menu"
                                    >
                                        Update Status
                                    </button>

                                    {openId === order.id && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
                                            {[
                                                "Shipped",
                                                "Out for Delivery",
                                                "Delivered",
                                                "Return Request Approved",
                                                "Return Request Not Approved"
                                            ].map((statusOption) => {
                                                const allowedStatuses =
                                                    STATUS_FLOW[order.status] || [];

                                                const isAllowed =
                                                    allowedStatuses.includes(statusOption);

                                                return (
                                                    <button
                                                        key={statusOption}
                                                        disabled={!isAllowed}
                                                        onClick={() =>
                                                            isAllowed &&
                                                            updateStatus(order, statusOption)
                                                        }
                                                        className={`block w-full text-left px-4 py-2 text-sm
                                                        ${isAllowed
                                                                ? "hover:bg-slate-100"
                                                                : "text-gray-400 cursor-not-allowed"
                                                            }`}
                                                    >
                                                        {statusOption}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )} */}

                                    <div className="flex justify-between items-start mt-4 border-t border-slate-100 pt-4">

                                        <div className="relative">
                                            <button
                                                onClick={() => setOpenId(openId === order.id ? null : order.id)}
                                                className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition shadow-sm"
                                            >
                                                Update Status
                                            </button>

                                            {openId === order.id && (
                                                <div className="absolute left-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-xl z-50">
                                                    {[
                                                        "Shipped",
                                                        "Out for Delivery",
                                                        "Delivered",
                                                        "Return Request Approved",
                                                        "Return Request Not Approved"
                                                    ].map((statusOption) => {
                                                        const allowedStatuses = STATUS_FLOW[order.status] || [];
                                                        const isAllowed = allowedStatuses.includes(statusOption);

                                                        return (
                                                            <button
                                                                key={statusOption}
                                                                disabled={!isAllowed}
                                                                onClick={() =>
                                                                    isAllowed &&
                                                                    updateStatus(order, statusOption)
                                                                }
                                                                className={`block w-full text-left px-4 py-2 text-sm transition-colors
                                                                    ${isAllowed
                                                                        ? "hover:bg-slate-50 text-slate-700"
                                                                        : "text-gray-300 cursor-not-allowed"
                                                                    }`}
                                                            >
                                                                {statusOption}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col items-end space-y-3">

                                            <div className="text-right">
                                                <p className="text-xs text-slate-500">Order Status</p>
                                                <span
                                                    className={`text-xs font-normal px-2 py-1 rounded-full border
                                                        ${order.status === "Delivered"
                                                            ? "bg-green-50 text-green-700 border-green-200"
                                                            : order.status.includes("Cancelled")
                                                                ? "bg-red-50 text-red-700 border-red-200"
                                                                : "bg-indigo-50 text-indigo-700 border-indigo-200"
                                                        }`}
                                                >
                                                    {order.status}
                                                </span>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-xs text-slate-500">Payout Status</p>
                                                <span
                                                    className={`text-xs font-normal px-2 py-1 rounded-full border
                                                        ${order.payout.status === "Paid"
                                                            ? "bg-green-50 text-green-700 border-green-200"
                                                            : order.payout.status.includes("Order Cancelled")
                                                                ? "bg-red-50 text-red-700 border-red-200"
                                                                : "bg-indigo-50 text-indigo-700 border-indigo-200"
                                                        }`}
                                                >
                                                    {order.payout.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <Pagination
                pageInfo={pageInfo}
                onPageChange={(newPage) => setPage(newPage)}
            />
        </section>


    );
};

export default SellerOrders;