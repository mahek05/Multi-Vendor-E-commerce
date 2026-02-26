import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/api";

const CreateGroupChat = () => {
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [groupName, setGroupName] = useState("");
    const navigate = useNavigate();
    const role = localStorage.getItem("role");

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        let allUsers = [];

        if (role === "ADMIN") {
            const sellerRes = await api("/seller/getSeller", "GET");
            const userRes = await api("/user/admin/getUser", "GET");

            if (sellerRes?.success) {
                allUsers = [...allUsers, ...sellerRes.data.page_data];
            }

            if (userRes?.success) {
                allUsers = [...allUsers, ...userRes.data.page_data];
            }
        }

        if (role === "SELLER") {
            const userRes = await api("/user/seller/getUser", "GET");

            if (userRes?.success) {
                allUsers = userRes.data.page_data;
            }
        }
        setUsers(allUsers);
    };

    const toggleUser = (id) => {
        setSelectedUsers(prev =>
            prev.includes(id)
                ? prev.filter(u => u !== id)
                : [...prev, id]
        );
    };

    const createGroup = async () => {
        if (!groupName || selectedUsers.length === 0) return;

        let endpoint = role === "ADMIN"
            ? "/chat/admin/group"
            : "/chat/seller/group";

        const res = await api(endpoint, "POST", {
            group_name: groupName,
            participant_ids: selectedUsers
        });

        if (res?.success) {
            navigate(`/${role.toLowerCase()}/chat/${res.data}`);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 p-5">
            <h2 className="text-2xl font-semibold mb-4 text-center">
                Create Group Chat
            </h2>

            <input
                type="text"
                placeholder="Group Name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full p-2 mb-4 border rounded"
            />

            <div className="space-y-1 max-h-100 overflow-y-auto">
                {users.map(user => (
                    <div
                        key={user.id}
                        onClick={() => toggleUser(user.id)}
                        className={`p-3 rounded cursor-pointer border 
                            ${selectedUsers.includes(user.id)
                                ? "bg-indigo-300 border-indigo-400 hover:bg-indigo-400"
                                : "bg-white hover:bg-indigo-100"
                            }`}
                    >
                        <p className="font-medium">
                            {user.name}
                        </p>

                        <p className="text-sm text-gray-500">
                            {user.email}
                        </p>
                    </div>
                ))}
            </div>

            <button
                onClick={createGroup}
                className="mt-4 w-full bg-indigo-600 text-white py-2 rounded"
            >
                Create Group
            </button>
        </div>
    );
};

export default CreateGroupChat;