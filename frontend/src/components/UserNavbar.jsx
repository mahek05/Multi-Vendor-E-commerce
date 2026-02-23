import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { isLoggedIn } from "../utils/auth";
import { api } from "../api/api";
import Dropdown from "./Dropdown";
import { User, ShoppingCart, LogOut, LogIn, UserPlus, MessageCircle } from "lucide-react";

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

    const handleLogout = async () => {
        const res = await api("/user/logout", "POST");
        if (res.success) {
            localStorage.clear();
            navigate("/login");
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 bg-slate-300 border-b border-slate-200 z-40">
            <div className="mx-auto max-w-7xl px-4 h-16 flex items-center gap-6">

                <Link to="/products" className="font-bold text-indigo-600 text-lg">
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
                                navigate(`/product/category/${query.toLowerCase()}`);
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
                            <Link to="/login" className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                                <LogIn size={16} />
                            </Link>
                            <Link to="/signup" className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                                <UserPlus size={16} />
                            </Link>
                        </div>
                    ) : (
                        <>
                            <button
                                onClick={() => navigate("/user/messages")}
                                className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                                aria-label="Cart"
                            >
                                <MessageCircle size={18} />
                            </button>

                            <button
                                onClick={() => navigate("/cart")}
                                className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                                aria-label="Cart"
                            >
                                <ShoppingCart size={18} />
                            </button>

                            <button
                                onClick={() => setOpen(!open)}
                                className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                                aria-label="User menu"
                            >
                                <User size={18} />
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
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-slate-100 flex items-center gap-2"
                                >
                                    <LogOut size={16} />
                                    <span>Logout</span>
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
