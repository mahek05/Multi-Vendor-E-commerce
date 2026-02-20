import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { isLoggedIn } from "../utils/auth";
import Dropdown from "./Dropdown";
import { api } from '../api/api';
import { Users, Store, User, LogOut, LogIn, UserPlus } from "lucide-react";

const AdminNavbar = () => {
    const navigate = useNavigate();
    const loggedIn = isLoggedIn();
    const [open, setOpen] = useState(false);

    const handleLogout = async () => {
        const res = await api("/admin/logout", "POST");
        if (res.success) {
            localStorage.clear();
            navigate("/admin/login");
        }
    };

    // const handleSearch = (e) => {
    //     e.preventDefault();
    //     if (!query.trim()) return;
    //     navigate(`/seller/product/category/${query.toLowerCase()}`);
    // };

    return (
        <header className="fixed top-0 left-0 right-0 bg-slate-300 border-b border-slate-200 z-40">
            <div className="mx-auto max-w-7xl px-4 h-16 flex items-center gap-6">

                {/* Logo
                <button
                    onClick={() => navigate("/seller/products")}
                    className="text-lg font-bold text-indigo-600"
                >
                    Seller Panel
                </button> */}

                <Link to="/admin/dashboard" className="font-bold text-indigo-600 text-lg">
                    YourStore
                </Link>

                <div className="ml-auto flex items-center gap-4 relative">
                    {!loggedIn ? (
                        <div className="flex gap-4">
                            <Link to="/admin/login" className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                                <LogIn size={16} />
                            </Link>
                            <Link to="/admin/signup" className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                                <UserPlus size={16} />
                            </Link>
                        </div>
                    ) : (
                        <>
                            <button
                                onClick={() => navigate("/admin/allUser")}
                                className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                                aria-label="View User"
                            >
                                <Users size={18} />
                            </button>

                            <button
                                onClick={() => navigate("/admin/allSeller")}
                                className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                                aria-label="View Seller"
                            >
                                <Store size={18} />
                            </button>

                            <button
                                onClick={() => setOpen(!open)}
                                className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                                aria-label="Admin menu"
                            >
                                <User size={18} />
                            </button>

                            <Dropdown open={open} onClose={() => setOpen(false)}>
                                <button
                                    onClick={() => navigate("/admin/profile")}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100"
                                >
                                    View Profile
                                </button>

                                <button
                                    onClick={() => navigate("/admin/categories")}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100"
                                >
                                    View Category
                                </button>

                                <button
                                    onClick={handleLogout}
                                    className="w-full px-4 py-2 text-left text-sm text-red-800 hover:bg-slate-100 flex items-center gap-2"
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

export default AdminNavbar;