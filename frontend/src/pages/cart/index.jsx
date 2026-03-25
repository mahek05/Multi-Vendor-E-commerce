import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../../api/api";

const API_BASE_URL = "http://localhost:5000";

const Cart = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchCart = async () => {
        setLoading(true);
        const res = await api("/cart", "GET");

        if (res?.success) {
            setItems(res.data?.page_data || []);
        } else {
            setItems([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const incrementQty = async (item) => {
        await api(`/cart/${item.id}`, "PUT", {
            quantity: item.quantity + 1,
        });
        fetchCart();
    };

    const decrementQty = async (item) => {
        if (item.quantity <= 1) return;
        await api(`/cart/${item.id}`, "PUT", {
            quantity: item.quantity - 1,
        });
        fetchCart();
    };

    const removeItem = async (id) => {
        await api(`/cart/${id}`, "DELETE");
        fetchCart();
    };

    const subtotal = items.reduce(
        (sum, item) => sum + item.quantity * item.product.price,
        0
    );

    if (loading) {
        return <div className="p-10 text-center">Loading cart...</div>;
    }

    if (!items.length) {
        return (
            <div className="p-10 text-center text-slate-600">
                Your cart is empty.
            </div>
        );
    }

    return (
        <section className="min-h-[calc(100vh-4rem)] py-4 bg-slate-50">
            <div className="max-w-6xl mx-auto px-4">
                <h2 className="text-2xl font-semibold text-slate-900 mb-6 text-center">
                    Shopping Cart
                </h2>

                <div className="space-y-4">

                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white rounded-lg border border-slate-200 p-4 flex gap-4 items-start"
                        >
                            <img
                                src={`${API_BASE_URL}${item.product.image}`}
                                alt={item.product.product_name}
                                className="w-24 aspect-[3/4] object-cover rounded-md border"
                            />

                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h5 className="text-base font-medium text-slate-900 leading-snug max-w-[80%]">
                                        {item.product.product_name}
                                    </h5>

                                    <button onClick={() => removeItem(item.id)} className="text-slate-400 hover:text-red-600 text-sm">
                                        ❌
                                    </button>
                                </div>

                                <div className="mt-3 flex items-center justify-between">
                                    <div className="flex items-center rounded-md">
                                        <button
                                            onClick={() => decrementQty(item)}
                                            className="px-2 py-1 text-slate-700 rounded-full border hover:bg-slate-100"
                                        >
                                            -
                                        </button>

                                        <span className="px-3 text-sm font-medium text-slate-900">
                                            {item.quantity}
                                        </span>

                                        <button
                                            onClick={() => incrementQty(item)}
                                            className="px-2 py-1 text-slate-700 rounded-full border hover:bg-slate-100"
                                        >
                                            +
                                        </button>
                                    </div>

                                    <h6 className="text-sm font-semibold text-slate-900">
                                        ₹{item.quantity * item.product.price}
                                    </h6>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="mt-8 bg-white border border-slate-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm font-medium text-slate-700">
                                Subtotal
                            </span>

                            <span className="text-lg font-semibold text-slate-900">
                                ₹{subtotal}
                            </span>
                        </div>

                        <button
                            onClick={() => navigate("/checkout")}
                            className="w-full rounded-md py-3 bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
                        >
                            Proceed to Checkout
                        </button>

                    </div>
                </div>
            </div>
        </section>
    );
};

export default Cart;