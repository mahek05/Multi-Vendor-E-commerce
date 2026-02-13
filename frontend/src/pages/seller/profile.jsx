import { useEffect, useState } from "react";
import { api } from "../../api/api";
import { useNavigate } from "react-router-dom";

const SellerProfile = () => {
    const [profile, setProfile] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            const res = await api(`/seller/profile`, "GET");

            if (!res.success) return;

            setProfile(res.data);
        };

        fetchProfile();
    }, []);

    const handleUpdate = async () => {
        navigate("/seller/update");
    };

    const handleDelete = async () => {
        await api(`/seller/profile`, "DELETE");
        navigate("/seller/login");
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
                            <p className="text-xs text-slate-500">Name</p>
                            <p className="mt-1 font-medium text-slate-900 break-words">
                                {profile.name}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-slate-500">Email</p>
                            <p className="mt-1 font-medium text-slate-900 break-words">
                                {profile.email}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-slate-500">Phone Number</p>
                            <p className="mt-1 font-medium text-slate-900 break-words">
                                {profile.phone_number}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-slate-500">Address</p>
                            <p className="mt-1 font-medium text-slate-900 break-words">
                                {profile.address}
                            </p>
                        </div>

                        <div className="flex justify-between">
                            <p className="text-xs text-slate-500">Status</p>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium
                                ${profile.status === "Approved"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                            >
                                {profile.status}
                            </span>
                        </div>
                    </div>

                    <div className="mt-4 flex justify-between">
                        <button
                            onClick={handleUpdate}
                            className="flex items-center md-6 justify-center rounded-md border border-transparent bg-yellow-500 px-8 py-2 text-sm font-medium text-black hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed left-0"
                        >
                            Update
                        </button>

                        <button
                            onClick={handleDelete}
                            className="flex items-center justify-center rounded-md border border-transparent bg-red-800 px-8 py-2 text-sm font-medium text-white hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed "
                        >
                            Deactivate Account
                        </button>
                    </div>
                </div>

            </div>
        </div >
    );
}

export default SellerProfile;
