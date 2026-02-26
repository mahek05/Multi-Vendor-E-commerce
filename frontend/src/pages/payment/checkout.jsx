import { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "../../utils/stripe";
import { api } from "../../api/api";
import PaymentForm from "./paymentForm";

const Checkout = () => {
    const [clientSecret, setClientSecret] = useState("");
    const [ready, setReady] = useState(false);
    const [items, setItems] = useState([]);

    const loadCart = async () => {
        const res = await api("/cart", "GET");
        if (res?.success) setItems(res.data.page_data || []);
    };

    const initPayment = async () => {
        const res = await api("/order/checkout", "POST", {});
        if (res?.success) {
            setClientSecret(res.data.client_secret);
            setReady(true);
        }
    };

    useEffect(() => {
        loadCart();
        initPayment();
    }, []);

    const subtotal = items.reduce(
        (sum, item) => sum + item.quantity * item.product.price,
        0
    );

    if (!ready) return <div className="p-10 text-center">Preparing payment...</div>;

    return (
        <div className="min-h-[70vh] justify-center items-start mt-5">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <div className="rounded-lg border border-gray-200  p-6 shadow-sm space-y-3">
                    <h2 className="text-xl font-semibold mb-6 text-gray-900">
                        Payment
                    </h2>

                    <div className="flex justify-between">
                        <span className="text-slate-600">
                            Subtotal
                        </span>

                        <span className="font-medium">
                            ₹{subtotal}
                        </span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-slate-600">
                            Tax
                        </span>
                        
                        <span>
                            ₹0
                        </span>
                    </div>

                    <hr />

                    <div className="flex justify-between font-bold text-lg">
                        <span>
                            Total
                        </span>

                        <span>
                            ₹{subtotal}
                        </span>
                    </div>
                </div>

                <Elements key={clientSecret} stripe={stripePromise} options={{ clientSecret }}>
                    <PaymentForm />
                </Elements>
            </div>
        </div>
    );
};

export default Checkout;