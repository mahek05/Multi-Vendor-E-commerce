import { useEffect, useState } from "react";
import { api } from "../../api/api";
import Pagination from "../../components/Pagination";

const Sellers = () => {
    const [sellers, setSellers] = useState([]);
    const [pageInfo, setPageInfo] = useState(null);
    const [page, setPage] = useState(1);

    const fetchSeller = async () => {
        const res = await api(`/admin/getSeller?page=${page}`, "GET");
        if (!res.success) return;

        setSellers(res.data.page_data);
        setPageInfo(res.data.page_information);
    };

    useEffect(() => {
        fetchSeller();
    }, [page]);

    const updateStatus = async (id, status) => {
        const res = await api(`/admin/sellerStatus/${id}`, "PUT", { status });

        if (res?.success) {
            fetchSeller();
        }
    };

    const statusColor = (status) => {
        if (status === "Approved") return "bg-green-50 text-green-700 border-green-200";
        if (status === "Suspended") return "bg-red-50 text-red-700 border-red-200";
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
    };

    return (
        <section className="py-10 bg-slate-50 min-h-screen">
            <div className="max-w-6xl mx-auto px-4">
                <h2 className="text-2xl font-semibold text-slate-900 mb-6 text-center">
                    Seller Management
                </h2>

                <div className="space-y-4">

                    {sellers.map((s) => (
                        <div
                            key={s.id}
                            className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition"
                        >
                            <div className="flex justify-between items-start flex-wrap gap-4">
                                <div className="space-y-1">
                                    <p className="font-medium text-slate-900">
                                        {s.name}
                                    </p>

                                    <p className="text-slate-700">
                                        {s.email}
                                    </p>

                                    <p className="text-slate-700">
                                        {s.phone_number}
                                    </p>

                                    <p className="text-slate-700">
                                        {s.address}
                                    </p>

                                    <p className="text-slate-700">
                                        Status By: {s.admin?.name || "—"}
                                    </p>
                                </div>

                                <div className="flex text-right justify-between gap-2">
                                    <p className="flex text-slate-700">
                                        Status:
                                    </p>

                                    <span className={`px-4 flex rounded-full border ${statusColor(s.status)}`}>
                                        {s.status || "Pending"}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-5 flex gap-3">
                                <button
                                    disabled={s.status === "Approved"}
                                    onClick={() => updateStatus(s.id, "Approved")}
                                    className="px-4 py-2 text-sm rounded-md bg-green-700 text-white hover:bg-green-800 focus:ring-2 focus:ring-green-700 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    Approve
                                </button>

                                <button
                                    disabled={s.status === "Suspended"}
                                    onClick={() => updateStatus(s.id, "Suspended")}
                                    className="px-4 py-2 text-sm rounded-md bg-red-800 text-white hover:bg-red-900 focus:ring-2 focus:ring-red-800 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    Suspend
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

export default Sellers;