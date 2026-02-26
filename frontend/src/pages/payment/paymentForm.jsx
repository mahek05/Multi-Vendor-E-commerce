import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useState } from "react";

const PaymentForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: "http://localhost:5173/payment-success",
            },
        });

        if (error) {
            setMessage(error.message);
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="w-full rounded-lg border border-gray-200 bg-white p-6 shadow-sm max-w-xl mt-6"
        >
            <div className="mb-6">
                <PaymentElement />
            </div>

            {message && (
                <div className="mb-4 text-sm text-red-600">
                    {message}
                </div>
            )}

            <button
                disabled={loading || !stripe}
                className="w-full rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
                {loading ? "Processing..." : "Pay Now"}
            </button>
        </form>
    );
};

export default PaymentForm;