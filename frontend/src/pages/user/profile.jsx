import { useEffect, useState } from "react";
import { api } from "../../api/api";
import { useNavigate } from "react-router-dom";
import { disconnectSocket } from "../../utils/socket";

const UserProfile = () => {
    const [profile, setProfile] = useState([]);
    const navigate = useNavigate();
    const [confirmOpen, setConfirmOpen] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            const res = await api(`/user/profile`, "GET");

            if (!res.success) return;

            setProfile(res.data);
        };

        fetchProfile();
    }, []);

    const handleUpdate = async () => {
        navigate("/update");
    };

    const confirmDelete = async () => {
        const res = await api(`/user/profile`, "DELETE");

        if (res?.success) {
            disconnectSocket();
            localStorage.clear();
            navigate("/login");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-sm font-medium text-slate-500 mb-4">
                        Account Information
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8 text-sm">
                        <div>
                            <p className="text-xs text-slate-500">
                                Name
                            </p>

                            <p className="mt-1 font-medium text-slate-900 break-words">
                                {profile.name}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-slate-500">
                                Email
                            </p>

                            <p className="mt-1 font-medium text-slate-900 break-words">
                                {profile.email}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-slate-500">
                                Phone Number
                            </p>

                            <p className="mt-1 font-medium text-slate-900 break-words">
                                {profile.phone_number}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-slate-500">
                                Address
                            </p>

                            <p className="mt-1 font-medium text-slate-900 break-words">
                                {profile.address}
                            </p>
                        </div>

                        <div className="mt-4 flex justify-between">
                            <button
                                onClick={handleUpdate}
                                className="flex items-center md-6 justify-center rounded-md border border-transparent bg-yellow-500 px-8 py-2 text-sm font-medium text-black hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed left-0"
                            >
                                Update
                            </button>

                            <button
                                onClick={() => setConfirmOpen(true)}
                                className="flex items-center justify-center rounded-md border border-transparent bg-red-800 px-8 py-2 text-sm font-medium text-white hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed "
                            >
                                Deactivate Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {confirmOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl ">
                        <h3 className="text-lg font-semibold text-gray-900 text-center">
                            Are you sure you want to continue?
                        </h3>

                        <p className="mt-1 text-sm text-red-800 text-center leading-relaxed">
                            This action is permanent.
                        </p>

                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setConfirmOpen(false)}
                                className="w-full rounded-lg bg-gray-200 py-2 text-sm font-medium text-black hover:bg-gray-300 transition"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={confirmDelete}
                                className="w-full rounded-lg bg-red-200 py-2 text-sm font-semibold text-black hover:bg-red-300 transition"
                            >
                                Yes, Deactivate
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfile;