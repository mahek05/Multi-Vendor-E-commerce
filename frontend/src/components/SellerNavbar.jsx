import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { isLoggedIn } from "../utils/auth";
import Dropdown from "./Dropdown";

const SellerNavbar = () => {
    const navigate = useNavigate();
    const loggedIn = isLoggedIn();
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/seller/login");
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (!query.trim()) return;
        navigate(`/seller/product/category/${query.toLowerCase()}`);
    };

    return (
        <header className="fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-40">
            <div className="mx-auto max-w-7xl px-4 h-16 flex items-center gap-6">

                {/* Logo
                <button
                    onClick={() => navigate("/seller/products")}
                    className="text-lg font-bold text-indigo-600"
                >
                    Seller Panel
                </button> */}

                <Link to="/seller" className="font-bold text-indigo-600 text-lg">
                    YourStore
                </Link>

                <form
                    onSubmit={handleSearch}
                    className="flex-1 max-w-md flex"
                >
                    <input
                        type="search"
                        placeholder="Search by category (e.g. phone)"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                navigate(`/seller/product/category/${query.toLowerCase()}`);
                            }
                        }}
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />

                    <button type="submit" className="hidden">
                        Search
                    </button>
                </form>

                <div className="ml-auto flex items-center gap-4 relative">
                    {!loggedIn ? (
                        <div className="flex gap-4">
                            <Link to="/seller/login" className="text-sm font-medium text-slate-700 hover:text-indigo-600">
                                Sign in
                            </Link>
                            <Link to="/seller/signup" className="text-sm font-medium text-slate-700 hover:text-indigo-600">
                                Create account
                            </Link>
                        </div>
                    ) : (
                        <>

                            <button
                                onClick={() => navigate("/add-product")}
                                className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                                aria-label="Add Product"
                            >
                                +
                            </button>

                            <button
                                onClick={() => setOpen(!open)}
                                className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                                aria-label="Seller menu"
                            >
                                👤
                            </button>

                            <Dropdown open={open} onClose={() => setOpen(false)}>
                                <button
                                    onClick={() => navigate("/seller/profile")}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100"
                                >
                                    View Profile
                                </button>

                                <button
                                    onClick={() => navigate("/seller/orders")}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100"
                                >
                                    Order History
                                </button>

                                <button
                                    onClick={handleLogout}
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-slate-100"
                                >
                                    Logout
                                </button>
                            </Dropdown>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default SellerNavbar;