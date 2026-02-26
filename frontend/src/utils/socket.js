import { io } from "socket.io-client";
const SOCKET_URL = "http://localhost:5000";

const getSocketToken = () => {
    const accessToken = localStorage.getItem("accessToken");
    return accessToken ? `Bearer ${accessToken}` : "";
};

const socket = io(SOCKET_URL, {
    transports: ["websocket"],
    autoConnect: false,
    auth: (cb) => cb({ token: getSocketToken() })
});

export const connectSocket = () => {
    if (!localStorage.getItem("accessToken")) {
        console.error("No token found for socket");
        return;
    }

    if (!socket.connected) {
        socket.connect();
    }
};

export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
    }
};

socket.on("connect_error", (err) => {
    console.error("Socket connect error:", err?.message || err);
});

export default socket;