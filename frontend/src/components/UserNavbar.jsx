import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { isLoggedIn } from "../utils/auth";
import { api } from "../api/api";
import Dropdown from "./Dropdown";

const Navbar = () => {
    const navigate = useNavigate();
    const loggedIn = isLoggedIn();
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);

    // const handleSearch = async (e) => {
    //     e.preventDefault();
    //     if (!query.trim()) return;

    //     const res = await api(`/product/${query}`, "GET");

    //     if (!res.success || !res.data) {
    //         alert("Category not found");
    //         return;
    //     }

    //     navigate(`/product/category/${query.toLowerCase()}`);
    // };

    const handleSearch = (e) => {
        e.preventDefault();
        if (!query.trim()) return;
        navigate(`/product/category/${query.toLowerCase()}`);
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    return (
        <header className="fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-40">
            <div className="mx-auto max-w-7xl px-4 h-16 flex items-center gap-6">

                {/* Logo */}
                <Link to="/products" className="font-bold text-indigo-600 text-lg">
                    YourStore
                </Link>

                {/* Search */}
                {/* <form onSubmit={handleSearch} className="flex-1 max-w-md">
                    <input
                        type="text"
                        placeholder="Search by category (e.g. phone)"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </form> */}

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
                                navigate(`/product/category/${query.toLowerCase()}`);
                            }
                        }}
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />

                    {/* Invisible but REQUIRED */}
                    <button type="submit" className="hidden">
                        Search
                    </button>
                </form>


                {/* Right section */}
                <div className="ml-auto flex items-center gap-4 relative">
                    {!loggedIn ? (
                        <div className="flex gap-4">
                            <Link to="/login" className="text-sm font-medium text-slate-700 hover:text-indigo-600">
                                Sign in
                            </Link>
                            <Link to="/signup" className="text-sm font-medium text-slate-700 hover:text-indigo-600">
                                Create account
                            </Link>
                        </div>
                    ) : (
                        <>
                            {/* Cart Icon */}
                            <button
                                onClick={() => navigate("/cart")}
                                className="h-9 w-9 rounded-md bg-slate-100 flex items-center justify-center hover:bg-slate-200"
                                aria-label="Cart"
                            >
                                🛒
                            </button>

                            {/* Profile */}
                            <button
                                onClick={() => setOpen(!open)}
                                className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                                aria-label="User menu"
                            >
                                👤
                            </button>

                            <Dropdown open={open} onClose={() => setOpen(false)}>
                                <button
                                    onClick={() => navigate("/profile")}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100"
                                >
                                    View Profile
                                </button>

                                <button
                                    onClick={() => navigate("/order/orderHistory")}
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

export default Navbar;
