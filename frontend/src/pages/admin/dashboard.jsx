import { useEffect, useState } from "react";
import { api } from "../../api/api";

const StatCard = ({ title, value, color }) => (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:">
        <p className="text-xs text-slate-500">{title}</p>
        <p className={`mt-2 text-3xl font-semibold ${color}`}>{value}</p>
    </div>
);

const AdminDashboard = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetch = async () => {
            const res = await api("/admin/dashboard", "GET");
            if (res?.success) setData(res.data);
        };
        fetch();
    }, []);

    if (!data) return <div className="p-10 text-center">Loading dashboard...</div>;

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-semibold">
                Admin Dashboard
            </h1>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                <StatCard title="Active Users" value={data.activeUsers} color="text-indigo-600" />
                <StatCard title="Active Sellers" value={data.activeSellers} color="text-emerald-600" />
                <StatCard title="Total Products" value={data.totalProducts} color="text-sky-600" />
                <StatCard title="Revenue" value={`₹${data.revenue}`} color="text-green-600" />
                <StatCard title="Return Rate" value={`${data.returnRate}%`} color="text-amber-600" />
                <StatCard title="Pending Payout" value={`₹${data.pendingPayout}`} color="text-purple-600" />
            </div>
        </div>
    );
};

export default AdminDashboard;