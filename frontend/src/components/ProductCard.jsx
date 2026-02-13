import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";
const API_BASE_URL = "http://localhost:5000";

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const inStock = product.stock > 0;
    const role = localStorage.getItem("role");

    const handleAddToCart = async () => {
        await api(`/cart/${product.id}`, "POST", { quantity: 1 });
        navigate("/cart");
    };

    return (
        <div className="bg-white flex flex-col rounded shadow-sm hover:scale-[1.02] transition relative hover:shadow-md">
            {role !== "SELLER" && (
                <Link to={`/product/${product.id}`}>
                    <img
                        src={`${API_BASE_URL}${product.image}`}
                        alt={product.product_name}
                        className="w-full aspect-[3/2] object-cover transition-transform duration-300"
                    />
                </Link>
            )}

            {role === "SELLER" && (
                <Link to={`/seller/product/${product.id}`}>
                    <img
                        src={`${API_BASE_URL}${product.image}`}
                        alt={product.product_name}
                        className="w-full aspect-[3/2] object-cover transition-transform duration-300"
                    />
                </Link>
            )}

            <div className="p-3 flex flex-col flex-1">
                <h5 className="text-sm font-medium text-slate-900 line-clamp-2 hover:text-indigo-600 transition-colors">
                    {product.product_name}
                </h5>

                <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="font-mono text-slate-900 text-sm">
                        ₹{product.price}
                    </span>
                </div>

                <div className="mt-1 flex items-center justify-between gap-2">
                    <span className="font-serif text-red-600 bg-red-50 text-sm">
                        stock: {product.stock}
                    </span>
                </div>
            </div>

            {role === "USER" && (
                <div className="p-4 pt-0">
                    <button
                        disabled={!inStock}
                        onClick={handleAddToCart}
                        className="flex w-full items-center justify-center rounded-full border border-transparent bg-yellow-400 px-8 py-2 text-sm font-medium text-black hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        Add to Cart
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProductCard;
