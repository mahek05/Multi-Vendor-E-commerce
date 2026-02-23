import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../api/api";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
    transports: ["websocket"],
    auth: {
        token: `Bearer ${localStorage.getItem("accessToken")}`
    }
});

const Chat = () => {
    const { roomId } = useParams();

    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [typingUser, setTypingUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState({});
    const [otherUserId, setOtherUserId] = useState(null);
    const bottomRef = useRef(null);

    const currentUserId = String(localStorage.getItem("id"));
    const currentUserRole = localStorage.getItem("role");

    const fetchMessages = async () => {
        let endpoint = "";

        if (currentUserRole === "USER")
            endpoint = `/chat/user/${roomId}`;
        if (currentUserRole === "SELLER")
            endpoint = `/chat/seller/${roomId}`;
        if (currentUserRole === "ADMIN")
            endpoint = `/chat/admin/${roomId}`;

        const res = await api(endpoint, "GET");

        if (res?.success) {
            setMessages(res.data || []);
            const other = res.data?.find(
                (msg) => String(msg.sender_id) !== currentUserId
            );
            if (other) setOtherUserId(other.sender_id);
        }
    };

    useEffect(() => {
        fetchMessages();

        socket.emit("join_room", { roomId });
        socket.emit("getOnlineStatuses");

        socket.on("receive_message", (msg) => {
            if (msg.room_id === roomId) {
                setMessages((prev) => [...prev, msg]);
            }
        });

        socket.on("typingStatus", ({ senderId, isTyping }) => {
            if (isTyping) {
                setTypingUser(senderId);
                console.log("Typing user:", senderId);
            } else {
                setTypingUser(null);
            }
        });

        socket.on("onlineStatus", (data) => {
            setOnlineUsers(data);
        });

        return () => {
            socket.off("receive_message");
            socket.off("typingStatus");
            socket.off("onlineStatus");
        };
    }, [roomId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = () => {
        if (!text.trim()) return;

        socket.emit("send_message", {
            roomId,
            message: text
        });

        socket.emit("typing", { roomId, isTyping: false });

        setText("");
    };

    const handleTyping = (e) => {
        setText(e.target.value);

        socket.emit("typing", {
            roomId,
            isTyping: true
        });

        setTimeout(() => {
            socket.emit("typing", {
                roomId,
                isTyping: false
            });
        }, 1000);
    };

    return (
        <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-gray-100">
            <div className="flex-1 flex flex-col">
                <header className="bg-white p-4 shadow flex justify-between">
                    <div>
                        <h1 className="text-lg font-semibold">
                            Chat Room
                        </h1>

                        {otherUserId && (
                            <p className="text-sm text-gray-500">
                                {onlineUsers[otherUserId]
                                    ? "Online"
                                    : "Offline"}
                            </p>
                        )}
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">

                    {messages.map((msg) => {
                        const isMe =
                            String(msg.sender_id) === currentUserId;

                        return (
                            <div
                                key={msg.id}
                                className={`flex ${isMe
                                        ? "justify-end"
                                        : "justify-start"
                                    }`}
                            >
                                <div
                                    className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl text-sm break-words
                                    ${isMe
                                            ? "bg-indigo-500 text-white rounded-br-none"
                                            : "bg-white text-gray-800 rounded-bl-none shadow"
                                        }`}
                                >
                                    <p className="text-xs opacity-70 mb-1">
                                        {isMe
                                            ? "You"
                                            : msg.sender_role}
                                    </p>

                                    <p>{msg.message}</p>

                                    <p className="text-[10px] mt-1 text-right opacity-60">
                                        {new Date(
                                            msg.created_at
                                        ).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit"
                                        })}
                                    </p>
                                </div>
                            </div>
                        );
                    })}

                    {typingUser &&
                        typingUser !== currentUserId && (
                            <div className="text-sm text-gray-500 italic">
                                Typing...
                            </div>
                        )}

                    <div ref={bottomRef} />
                </div>

                <footer className="bg-white border-t p-4">
                    <div className="flex gap-2">
                        <input
                            value={text}
                            onChange={handleTyping}
                            onKeyDown={(e) =>
                                e.key === "Enter" && sendMessage()
                            }
                            placeholder="Type a message..."
                            className="flex-1 p-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />

                        <button
                            onClick={sendMessage}
                            className="bg-indigo-500 text-white px-5 rounded-full"
                        >
                            Send
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default Chat;