import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/api";

const CreatePrivateChat = () => {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();
    const role = localStorage.getItem("role");

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        if (role === "ADMIN") {
            const sellerRes = await api("/seller/getSeller", "GET");
            const userRes = await api("/user/admin/getUser", "GET");

            const sellers = sellerRes?.success
                ? sellerRes.data.page_data
                : [];

            const users = userRes?.success
                ? userRes.data.page_data
                : [];

            setUsers([...sellers, ...users]);
        }

        if (role === "SELLER") {
            const res = await api("/user/seller/getUser", "GET");

            if (res?.success) {
                setUsers(res.data.page_data);
            }
        }
    };

    const createChat = async (targetId) => {
        let endpoint = "";

        if (role === "ADMIN") endpoint = "/chat/admin/chat";
        if (role === "SELLER") endpoint = "/chat/seller/chat";

        const res = await api(endpoint, "POST", {
            target_id: targetId
        });

        if (res?.success) {
            const roomId = res.data;
            navigate(`/${role.toLowerCase()}/chat/${roomId}`);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 p-5">
            <h2 className="text-2xl font-semibold mb-4 text-center">
                Start New Chat
            </h2>

            <div className="space-y-1 max-h-100 overflow-y-auto">
                {users.map((user) => (
                    <div
                        key={user.id}
                        onClick={() =>
                            createChat(
                                user.id,
                                role === "ADMIN" ? "SELLER" : "USER"
                            )
                        }
                        className="p-3 rounded cursor-pointer border bg-white hover:bg-indigo-100"
                    >
                        <h3 className="font-medium">
                            {user.name}
                        </h3>

                        <p className="text-sm text-gray-500">
                            {user.email}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CreatePrivateChat;