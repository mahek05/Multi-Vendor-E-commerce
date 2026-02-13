import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/api";
const API_BASE_URL = "http://localhost:5000";

const ProductDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [qty, setQty] = useState(1);
    const role = localStorage.getItem("role");

    useEffect(() => {
        const fetchProduct = async () => {

            const res = await api(`/product/getById/${id}`, "GET");

            if (res.success) {
                setProduct(res.data);
            }
        };
        fetchProduct();
    }, [id]);

    if (!product) return <div className="p-10 text-center">Product not found.</div>;

    const handleAddToCart = async () => {
        await api(`/cart/${product.id}`, "POST", { quantity: qty });
        navigate("/cart");
    };

    const handleUpdateProduct = async () => {
        navigate("/product/update");
    };

    const handleDeleteProduct = async () => {
        await api(`/product/delete/${product.id}`, "DELETE");
        navigate("/seller");
    };

    const inStock = product.stock > 0;
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 4);
    const formattedDelivery = deliveryDate.toLocaleDateString('en-US', {
        weekday: 'long', month: 'short', day: 'numeric'
    });

    return (
        <div className="bg-white min-h-screen font-sans text-slate-900">
            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="lg:grid lg:grid-cols-12 lg:gap-x-8">
                    <div className="lg:col-span-5">
                        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-100 border border-gray-200">
                            <img
                                src={`${API_BASE_URL}${product.image}`}
                                alt={product.product_name}
                                className="w-full aspect-[3/2] object-cover transition-transform duration-300"
                            />
                        </div>
                    </div>


                    <div className="mt-8 lg:col-span-4 lg:mt-0 lg:border-r lg:border-gray-200 lg:pr-8">
                        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
                            {product.product_name}
                        </h1>

                        <div className="py-6">
                            <h3 className="sr-only">Description</h3>
                            <div className="space-y-6 text-sm text-gray-700">
                                <p>{product.description}</p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: The "Buy Box" (Span 3 cols) */}
                    <div className="mt-8 lg:col-span-3 lg:mt-0">
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="sr-only">Product information</h2>

                            <p className="text-3xl tracking-tight text-gray-900">
                                <sup className="text-sm top-[-0.5em]">₹</sup>{product.price}
                            </p>

                            <div className="mt-4">
                                <p className="text-sm text-gray-500">
                                    Delivery by <span className="font-bold text-gray-900">{formattedDelivery}</span>
                                </p>

                                {inStock ? (
                                    <p className="text-lg text-green-700 font-medium mt-2">
                                        Stock: {product.stock}
                                    </p>
                                ) : (
                                    <p className="text-lg text-red-600 font-medium mt-2">
                                        Currently Unavailable
                                    </p>
                                )}
                            </div>

                            {role === "USER" && (
                                <>
                                    <div className="mb-4">
                                        <label htmlFor="quantity" className="inline">Qty: </label>
                                        <select
                                            id="quantity"
                                            name="quantity"
                                            value={qty}
                                            onChange={(e) => setQty(Number(e.target.value))}
                                            disabled={!inStock}
                                            className="block w-full rounded-md border-gray-300 py-1.5 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100"
                                        >
                                            {[1, 2, 3, 4].map(n => (
                                                <option key={n} value={n}>{n}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <button
                                        disabled={!inStock}
                                        onClick={handleAddToCart}
                                        className="flex w-full items-center justify-center rounded-full border border-transparent bg-yellow-400 px-8 py-2 text-sm font-medium text-black hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    >
                                        Add to Cart
                                    </button>
                                </>
                            )}

                            {role === "SELLER" && (
                                <div className="mt-4 flex justify-between">
                                    <button
                                        disabled={!inStock}
                                        onClick={handleUpdateProduct}
                                        className="flex items-center md-6 justify-center rounded-md border border-transparent bg-yellow-400 px-8 py-2 text-sm font-medium text-black hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed left-0"
                                    >
                                        Update
                                    </button>

                                    <button
                                        disabled={!inStock}
                                        onClick={handleDeleteProduct}
                                        className="flex items-center justify-center rounded-md border border-transparent bg-red-400 px-8 py-2 text-sm font-medium text-black hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed "
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}

                            <div className="mt-4 text-xs text-gray-500 space-y-1">
                                <p className="grid grid-cols-2">
                                    <span>Ships from</span>
                                    <span className="text-slate-900 font-medium">{product.seller?.address}</span>
                                </p>
                                <p className="grid grid-cols-2">
                                    <span>Sold by</span>
                                    <span className="text-slate-900 font-medium truncate">
                                        {product.seller?.name || "Unknown Seller"}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default ProductDetails;