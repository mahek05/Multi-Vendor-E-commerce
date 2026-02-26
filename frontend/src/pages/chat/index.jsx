import { useEffect, useState } from "react";
import { api } from "../../api/api";
import { useNavigate } from "react-router-dom";
import socket, { connectSocket } from "../../utils/socket";

const ChatList = () => {
    const [rooms, setRooms] = useState([]);
    const [typingUsers, setTypingUsers] = useState({});
    const navigate = useNavigate();
    const currentUserId = String(localStorage.getItem("id"));
    const role = localStorage.getItem("role");

    const getMessageTime = (msg) => {
        if (!msg) return 0;
        return new Date(msg.created_at || msg.createdAt || 0).getTime();
    };

    const sortRoomsByLatest = (list) => {
        return [...list].sort(
            (a, b) =>
                getMessageTime(b.latest_message) - getMessageTime(a.latest_message)
        );
    };

    useEffect(() => {
        connectSocket();
        fetchRooms();

        const handleRoomMessage = (msg) => {
            setRooms(prevRooms => {
                const roomExists = prevRooms.some((room) => room.id === msg.room_id);
                if (!roomExists) {
                    fetchRooms();
                    return prevRooms;
                }

                const updatedRooms = prevRooms.map(room => {
                    if (room.id === msg.room_id) {
                        return {
                            ...room,
                            latest_message: msg,
                            unread_count:
                                String(msg.sender_id) !== currentUserId
                                    ? (room.unread_count || 0) + 1
                                    : room.unread_count
                        };
                    }
                    return room;
                });

                return sortRoomsByLatest(updatedRooms);
            });
        };

        const handleTyping = ({ roomId, senderId, isTyping }) => {
            setTypingUsers(prev => ({
                ...prev,
                [roomId]: isTyping ? senderId : null
            }));
        };

        const handleChatError = (payload) => {
            console.warn("Chat socket error:", payload?.message || payload);
        };

        const handleMessagesRead = ({ roomId, readBy }) => {
            if (String(readBy) !== currentUserId) return;
            setRooms((prevRooms) =>
                prevRooms.map((room) =>
                    room.id === roomId ? { ...room, unread_count: 0 } : room
                )
            );
        };

        socket.on("room_message", handleRoomMessage);
        socket.on("typingStatus", handleTyping);
        socket.on("chat_error", handleChatError);
        socket.on("messages_read_update", handleMessagesRead);

        return () => {
            socket.off("room_message", handleRoomMessage);
            socket.off("typingStatus", handleTyping);
            socket.off("chat_error", handleChatError);
            socket.off("messages_read_update", handleMessagesRead);
        };
    }, [currentUserId]);

    const fetchRooms = async () => {
        let endpoint = `/chat/user/rooms`;
        if (role === "SELLER") endpoint = `/chat/seller/rooms`;
        if (role === "ADMIN") endpoint = `/chat/admin/rooms`;

        try {
            const res = await api(endpoint, "GET");
            if (res?.success) {
                setRooms(sortRoomsByLatest(res.data));
            }
        } catch (err) {
            console.log("API error:", err);
        }
    };

    const getTitle = (room) => {
        if (room.type === "group") return room.name;

        const other = room.participants.find(
            p => String(p.user_id) !== currentUserId
        );
        return other?.name || "Unknown";
    };

    return (
        <section className="min-h-[calc(100vh-4rem)] py-4 px-4 bg-slate-50">
            <h2 className="text-2xl font-semibold text-slate-900 mb-6 justify-between items-center flex">
                <span>
                    My Chat
                </span>

                {role !== "USER" && (
                    <div className="justify-between items-center flex gap-2">
                        <button
                            onClick={() => navigate(`/${role.toLowerCase()}/chat/new`)}
                            className="text-sm px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                        >
                            New Chat
                        </button>

                        <button
                            onClick={() => navigate(`/${role.toLowerCase()}/groupChat/new`)}
                            className="text-sm px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                        >
                            Create Group
                        </button>
                    </div>
                )}
            </h2>

            <div className="space-y-4">
                {rooms.map((room) => {
                    const typingUserId = typingUsers[room.id];

                    const typingUserName =
                        typingUserId &&
                        room.participants.find(
                            p => String(p.user_id) === String(typingUserId)
                        )?.name;

                    return (
                        <div
                            key={room.id}
                            onClick={() =>
                                navigate(`/${role.toLowerCase()}/chat/${room.id}`)
                            }
                            className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer flex justify-between items-center"
                        >
                            <div>
                                <h3 className="font-semibold">
                                    {getTitle(room)}
                                </h3>

                                {typingUserName ? (
                                    <p className="text-sm italic text-indigo-600">
                                        {typingUserName} typing...
                                    </p>
                                ) : (
                                    <p
                                        className="text-sm text-gray-600"
                                        style={{
                                            maxWidth: "220px",
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis"
                                        }}
                                    >
                                        {room.latest_message?.message}
                                    </p>
                                )}
                            </div>

                            {room.unread_count > 0 && (
                                <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">
                                    {room.unread_count}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default ChatList;