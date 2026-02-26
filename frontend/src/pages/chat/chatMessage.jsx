import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../api/api";
import socket, { connectSocket } from "../../utils/socket";

const Chat = () => {
    const { roomId } = useParams();
    const [room, setRoom] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [messages, setMessages] = useState([]);
    const [typingUsers, setTypingUsers] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState({});
    const [text, setText] = useState("");
    const typingTimeoutRef = useRef(null);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    const currentUserId = String(localStorage.getItem("id"));
    const role = localStorage.getItem("role");

    useEffect(() => {
        if (!roomId) return;
        connectSocket();
        fetchChat();

        socket.emit("join_room", { roomId });
        socket.emit("getOnlineStatuses");
        socket.emit("mark_messages_read", { roomId });

        const handleReceiveMessage = (msg) => {
            if (msg.room_id === roomId) {
                setMessages(prev => [...prev, msg]);
                socket.emit("mark_messages_read", { roomId });
            }
        };

        const handleTyping = ({ roomId: typingRoomId, senderId, isTyping }) => {
            if (String(typingRoomId) !== String(roomId)) return;
            if (String(senderId) === currentUserId) return;

            setTypingUsers((prev) => {
                const exists = prev.includes(senderId);
                if (isTyping && !exists) return [...prev, senderId];
                if (!isTyping && exists) {
                    return prev.filter((id) => String(id) !== String(senderId));
                }
                return prev;
            });
        };

        const handleOnlineStatus = (data) => {
            setOnlineUsers(data);
        };

        const handleChatError = (payload) => {
            console.warn("Chat socket error:", payload?.message || payload);
        };

        socket.on("receive_message", handleReceiveMessage);
        socket.on("typingStatus", handleTyping);
        socket.on("onlineStatus", handleOnlineStatus);
        socket.on("chat_error", handleChatError);

        return () => {
            socket.off("receive_message", handleReceiveMessage);
            socket.off("typingStatus", handleTyping);
            socket.off("onlineStatus", handleOnlineStatus);
            socket.off("chat_error", handleChatError);
            setTypingUsers([]);
        };
    }, [roomId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const fetchChat = async () => {
        let endpoint = `/chat/user/${roomId}`;
        if (role === "SELLER") endpoint = `/chat/seller/${roomId}`;
        if (role === "ADMIN") endpoint = `/chat/admin/${roomId}`;
        if (role === "USER") endpoint = `/chat/user/${roomId}`;

        const res = await api(endpoint, "GET");

        if (res?.success) {
            setRoom(res.data.room);
            setParticipants(res.data.participants);
            setMessages(res.data.messages);
        }
    };

    const sendMessage = (messageText) => {
        if (!messageText.trim()) return;

        socket.emit("send_message", {
            roomId,
            message: messageText
        });
    };

    const adjustComposerHeight = () => {
        if (!inputRef.current) return;
        inputRef.current.style.height = "auto";
        inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 140)}px`;
    };

    const getOtherParticipant = () => {
        return participants.find(
            p => String(p.user_id) !== currentUserId
        );
    };

    const isOtherOnline = () => {
        const other = getOtherParticipant();
        return other && onlineUsers[other.user_id];
    };

    const getGroupParticipantsText = () => {
        return participants.map(p => p.name).join(", ");
    };

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] bg-slate-100">
            <header className="bg-white p-4 border-b border-slate-200">
                {room && (
                    <>
                        <h2 className="font-semibold text-lg">
                            {room.type === "group"
                                ? room.name
                                : getOtherParticipant()?.name}
                        </h2>

                        <p className="text-sm text-slate-500">
                            {room.type === "group"
                                ? getGroupParticipantsText()
                                : isOtherOnline()
                                    ? "Online"
                                    : "Offline"}
                        </p>
                    </>
                )}
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">

                {messages.map(msg => {
                    const isMe = String(msg.sender_id) === currentUserId;
                    const sender =
                        participants.find(
                            p => String(p.user_id) === String(msg.sender_id)
                        )?.name;

                    return (
                        <div key={msg.id}
                            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                            <div className={`max-w-md px-4 py-2 rounded-xl 
                                ${isMe
                                    ? "bg-indigo-600 text-white"
                                    : "bg-white border border-slate-200 shadow-sm"
                                }`}>

                                {!isMe && room?.type === "group" && (
                                    <p className="text-xs font-semibold mb-1">
                                        {sender}
                                    </p>
                                )}

                                <p className="whitespace-pre-wrap break-words">
                                    {msg.message}
                                </p>
                            </div>
                        </div>
                    );
                })}

                {typingUsers.length > 0 && (
                    <div className="text-sm italic text-slate-500">
                        {typingUsers
                            .map((typingId) =>
                                participants.find(
                                    (p) => String(p.user_id) === String(typingId)
                                )?.name
                            )
                            .filter(Boolean)
                            .join(", ")} typing...
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            <footer className="bg-white border-t border-slate-200 p-4 shrink-0">
                <div className="flex items-center gap-2">
                    <textarea
                        ref={inputRef}
                        value={text}
                        onChange={(e) => {
                            setText(e.target.value);
                            adjustComposerHeight();

                            socket.emit("typing", {
                                roomId,
                                isTyping: true
                            });

                            if (typingTimeoutRef.current) {
                                clearTimeout(typingTimeoutRef.current);
                            }

                            typingTimeoutRef.current = setTimeout(() => {
                                socket.emit("typing", {
                                    roomId,
                                    isTyping: false
                                });
                            }, 1500);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey && text.trim()) {
                                e.preventDefault();
                                sendMessage(text);
                                setText("");
                                if (inputRef.current) {
                                    inputRef.current.style.height = "auto";
                                }

                                socket.emit("typing", {
                                    roomId,
                                    isTyping: false
                                });
                            }
                        }}
                        rows={1}
                        className="flex-1 border px-4 py-2 rounded-2xl focus:outline-none resize-none leading-6 max-h-[140px] overflow-y-auto"
                        placeholder="Type message..."
                    />

                    <button
                        onClick={() => {
                            if (!text.trim()) return;
                            sendMessage(text);
                            setText("");
                            if (inputRef.current) {
                                inputRef.current.style.height = "auto";
                            }

                            socket.emit("typing", {
                                roomId,
                                isTyping: false
                            });
                        }}
                        className="bg-indigo-500 text-white px-5 py-2 rounded-full"
                    >
                        Send
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default Chat;