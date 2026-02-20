import { useEffect, useState } from "react";
import { api } from "../../api/api";
import Pagination from "../../components/Pagination";

const Users = () => {
    const [users, setUsers] = useState([]);
    const [pageInfo, setPageInfo] = useState(null);
    const [page, setPage] = useState(1);

    const fetchUser = async () => {
        const res = await api(`/admin/getUser?page=${page}`, "GET");
        if (!res.success) return;

        setUsers(res.data.page_data);
        setPageInfo(res.data.page_information);
    };

    useEffect(() => {
        fetchUser();
    }, [page]);

    const deactivateAccount = async (id) => {
        const res = await api(`/user/profile/${id}`, "DELETE");

        if (res?.success) {
            fetchUser();
        }
    }

    const getStatus = (user) => {
        return user.deleted_at ? "Deactivated" : "Active";
    };

    const statusStyle = (user) => {
        return user.deleted_at
            ? "bg-red-50 text-red-700 border-red-200"
            : "bg-green-50 text-green-700 border-green-200";
    };

    return (
        <section className="py-10 bg-slate-50 min-h-screen">
            <div className="max-w-6xl mx-auto px-4">
                <h2 className="text-2xl font-semibold text-slate-900 mb-6 text-center">
                    User Management
                </h2>

                <div className="space-y-4">

                    {users.map((u) => (
                        <div
                            key={u.id}
                            className={`bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition`}
                        >
                            <div className="flex justify-between items-start flex-wrap gap-4">
                                <div className="space-y-1 text-left">
                                    <p className="font-medium text-slate-900">
                                        Name: {u.name}
                                    </p>

                                    <p className="text-slate-700">
                                        {u.email}
                                    </p>

                                    <p className="text-slate-700">
                                        {u.phone_number}
                                    </p>

                                    <p className="text-slate-700">
                                        {u.address}
                                    </p>
                                </div>

                                <div className="flex text-right justify-between gap-2">
                                    <p className="flex text-slate-700">
                                        Account Status
                                    </p>

                                    <span
                                        className={`px-4 flex rounded-full border ${statusStyle(u)}`}
                                    >
                                        {getStatus(u)}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-5 flex gap-3">
                                <button
                                    disabled={u.deleted_at}
                                    onClick={() => deactivateAccount(u.id)}
                                    className="px-4 py-2 text-sm rounded-md bg-red-800 text-white hover:bg-red-900 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    Deactivate Account
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8">
                    <Pagination
                        pageInfo={pageInfo}
                        onPageChange={(newPage) => setPage(newPage)}
                    />
                </div>
            </div>
        </section>
    );
};

export default Users;