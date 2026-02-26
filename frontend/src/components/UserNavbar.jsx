import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { isLoggedIn } from "../utils/auth";
import { api } from "../api/api";
import Dropdown from "./Dropdown";
import socket, { connectSocket, disconnectSocket } from "../utils/socket";
import { User, ShoppingCart, LogOut, LogIn, UserPlus, MessageCircle } from "lucide-react";

const Navbar = () => {
    const navigate = useNavigate();
    const loggedIn = isLoggedIn();
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);
    const currentUserId = String(localStorage.getItem("id"));

    const loadUnreadStatus = async () => {
        if (!loggedIn) return;
        const res = await api("/chat/user/rooms", "GET");
        if (!res?.success) return;
        setHasUnread(res.data.some((room) => (room.unread_count || 0) > 0));
    };

    useEffect(() => {
        if (!loggedIn) return;
        connectSocket();
        loadUnreadStatus();

        const handleMessage = (msg) => {
            if (String(msg.sender_id) !== currentUserId) {
                setHasUnread(true);
            }
        };

        const handleReadUpdate = ({ readBy }) => {
            if (String(readBy) === currentUserId) {
                loadUnreadStatus();
            }
        };

        socket.on("room_message", handleMessage);
        socket.on("messages_read_update", handleReadUpdate);

        return () => {
            socket.off("room_message", handleMessage);
            socket.off("messages_read_update", handleReadUpdate);
        };
    }, [loggedIn, currentUserId]);

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
            disconnectSocket();
            localStorage.clear();
            navigate("/login");
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur border-b border-slate-200 z-40 shadow-sm">
            <div className="mx-auto max-w-7xl px-4 h-16 flex items-center gap-6">
                <Link to="/products" className="font-bold text-indigo-700 text-lg tracking-tight">
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
                            <Link to="/login" className="h-9 w-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center hover:bg-slate-200 transition-colors">
                                <LogIn size={16} />
                            </Link>

                            <Link to="/signup" className="h-9 w-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center hover:bg-slate-200 transition-colors">
                                <UserPlus size={16} />
                            </Link>
                        </div>
                    ) : (
                        <>
                            <button
                                onClick={() => navigate("/user/messages")}
                                className="h-9 w-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center hover:bg-slate-200 transition-colors relative"
                                aria-label="Cart"
                            >
                                <MessageCircle size={18} />
                                {hasUnread && (
                                    <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-indigo-500" />
                                )}
                            </button>

                            <button
                                onClick={() => navigate("/cart")}
                                className="h-9 w-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center hover:bg-slate-200 transition-colors"
                                aria-label="Cart"
                            >
                                <ShoppingCart size={18} />
                            </button>

                            <button
                                onClick={() => setOpen(!open)}
                                className="h-9 w-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center hover:bg-slate-200 transition-colors"
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
                                    className="w-full px-4 py-2 text-left text-sm text-rose-700 hover:bg-slate-100 flex items-center gap-2"
                                >
                                    <LogOut size={16} />
                                    <span>
                                        Logout
                                    </span>
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