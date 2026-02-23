import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "../../api/api";
import { Check } from "lucide-react";

const PaymentResult = () => {
    const [params] = useSearchParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        const verifyPayment = async () => {
            const payment_intent = params.get("payment_intent");

            if (!payment_intent) {
                navigate("/products");
                return;
            }

            const res = await api(`/order/verify-payment/${payment_intent}`, "POST");
            if (res?.success) setData(res.data);
            setLoading(false);
        };
        verifyPayment();
    }, []);

    if (loading) return <div className="p-10 text-center">Verifying payment...</div>;

    if (!data) return <div className="p-10 text-center text-red-600">Payment failed</div>;

    return (
        <div className="min-h-screen flex justify-center items-center bg-gray-50">
            <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md text-center space-y-6">

                <div className="flex items-center justify-center gap-3 text-green-600">
                    <Check size={28} strokeWidth={2.5} />
                    <h1 className="text-2xl font-semibold leading-none">
                        Payment Successful!
                    </h1>
                </div>

                <p className="text-gray-600">
                    Your payment has been processed successfully.
                </p>

                <div className="bg-gray-100 rounded-lg p-4 text-left space-y-2">
                    <div className="flex justify-between">
                        <span>Amount</span>
                        <span>₹{data.amount}</span>
                    </div>

                    <div className="flex justify-between">
                        <span>Transaction ID</span>
                        <span>{data.id?.slice(0, 10)}</span>
                    </div>

                    <div className="flex justify-between">
                        <span>Date</span>
                        <span>
                            {data.createdAt
                                ? new Date(data.createdAt).toLocaleString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                })
                                : "—"}
                        </span>
                    </div>
                </div>

                <button
                    onClick={() => navigate("/order/orderHistory")}
                    className="w-full bg-indigo-600 text-white py-3 rounded-md"
                >
                    Go to Orders
                </button>
            </div>
        </div>
    );
};

export default PaymentResult;