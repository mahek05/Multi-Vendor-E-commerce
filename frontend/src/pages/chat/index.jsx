import { useEffect, useState } from "react";
import { api } from "../../api/api";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const API_BASE_URL = "http://localhost:5000";

const socket = io("http://localhost:5000", {
    withCredentials: true,
    transports: ["websocket"],
    auth: {
        token: `Bearer ${localStorage.getItem("accessToken")}`
    }
});

const ChatList = () => {
    const [rooms, setRooms] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState({});
    const navigate = useNavigate();
    const currentUserId = localStorage.getItem("id");

    useEffect(() => {
        fetchRooms();
    }, []);

    useEffect(() => {
        socket.emit("getOnlineStatuses");

        socket.on("onlineStatus", (data) => {
            setOnlineUsers(data);
        });

        socket.on("receive_message", () => {
            fetchRooms();
        });

        return () => {
            socket.off("onlineStatus");
            socket.off("receive_message");
        };
    }, []);

    const fetchRooms = async () => {
        const role = localStorage.getItem("role");

        let endpoint = "";
        if (role === "USER") endpoint = "/chat/user/rooms";
        else if (role === "SELLER") endpoint = "/chat/seller/rooms";
        else if (role === "ADMIN") endpoint = "/chat/admin/rooms";

        const res = await api(endpoint, "GET");

        if (res?.success) {
            setRooms(res.data || []);
        } else {
            setRooms([]);
        }
    };

    const getTitle = (room) => {
        if (room.is_group) return room.group_name;

        const other = room.participants?.find(
            (p) => p.user_id !== currentUserId
        );

        return other?.name ?? "Unknown";
    };

    const formatTime = (date) => {
        if (!date) return "";
        return new Date(date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    if (!rooms.length) {
        return (
            <div className="p-10 text-center text-slate-600">
                No chats found.
            </div>
        );
    }

    return (
        <section className="max-w-4xl mx-auto py-8">
            <h2 className="text-xl font-semibold mb-6">My Chats</h2>

            <div className="space-y-3">
                {rooms.map((room) => {
                    const latest = room.latest_message;
                    const other = room.participants?.find(
                        (p) => p.user_id !== currentUserId
                    );

                    const isOnline =
                        !room.is_group &&
                        onlineUsers[other?.user_id];

                    return (
                        <div
                            key={room.id}
                            onClick={() => navigate(`/chat/${room.id}`)}
                            className="p-4 bg-white rounded-lg shadow cursor-pointer hover:bg-slate-50 flex justify-between"
                        >
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-medium">
                                        {getTitle(room)}
                                    </h3>

                                    {!room.is_group && (
                                        <span
                                            className={`w-2 h-2 rounded-full ${
                                                isOnline
                                                    ? "bg-green-500"
                                                    : "bg-gray-400"
                                            }`}
                                        />
                                    )}
                                </div>

                                <p className="text-sm text-gray-600 truncate w-64">
                                    {latest?.message ?? "No messages yet"}
                                </p>
                            </div>

                            <div className="text-right flex flex-col items-end">
                                <span className="text-xs text-gray-500">
                                    {formatTime(latest?.created_at)}
                                </span>

                                {room.unread_count > 0 && (
                                    <span className="mt-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                        {room.unread_count}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default ChatList;