import { useEffect, useState } from "react";
import { api } from "../../api/api";
import Pagination from "../../components/Pagination";

const ViewCategory = () => {
    const [categories, setCategory] = useState([]);
    const [pageInfo, setPageInfo] = useState(null);
    const [page, setPage] = useState(1);
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState("");

    const fetchCategory = async () => {
        const res = await api(`/category/admin/get-category?page=${page}`, "GET");
        if (!res.success) return;

        setCategory(res.data.page_data);
        setPageInfo(res.data.page_information);
    };

    useEffect(() => {
        fetchCategory();
    }, [page]);

    const deleteCateory = async (id) => {
        const res = await api(`/category/delete/${id}`, "DELETE");

        if (res?.success) {
            fetchCategory();
        }
    }

    const updateCategory = async (id) => {
        if (!editName.trim()) return;

        const res = await api(`/category/update/${id}`, "PUT", {
            category_name: editName
        });

        if (res?.success) {
            setEditingId(null);
            setEditName("");
            fetchCategory();
        }
    };

    const getStatus = (category) => {
        return category.deleted_at ? "Deleted" : "Not Deleted";
    };

    const statusStyle = (category) => {
        return category.deleted_at
            ? "bg-red-50 text-red-700 border-red-200"
            : "bg-green-50 text-green-700 border-green-200";
    };

    const startEdit = (category) => {
        setEditingId(category.id);
        setEditName(category.category_name);
    };

    return (
        <section className="py-10 bg-slate-50 min-h-screen">
            <div className="max-w-6xl mx-auto px-4">
                <h2 className="text-2xl font-semibold text-slate-900 mb-6 text-center">
                    Category Management
                </h2>

                <div className="space-y-4">

                    {categories.map((c) => (
                        <div
                            key={c.id}
                            className={`bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition`}
                        >
                            <div className="flex justify-between items-start flex-wrap gap-4">
                                <div className="space-y-1 text-left min-w-[250px]">

                                    {editingId === c.id ? (
                                        <div className="flex gap-2 items-center">
                                            <input
                                                autoFocus
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="border border-slate-300 rounded-md px-2 py-1 text-sm w-56 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            />

                                            <button
                                                onClick={() => updateCategory(c.id)}
                                                className="px-3 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700"
                                            >
                                                Save
                                            </button>

                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="px-3 py-1 text-xs bg-gray-200 rounded-md hover:bg-gray-300"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-700">{c.category_name}</p>
                                    )}
                                </div>

                                <div className="flex text-right justify-between gap-2">
                                    <p className="flex text-sm text-slate-700">
                                        Status
                                    </p>

                                    <span className={`px-4 text-sm flex rounded-full border ${statusStyle(c)}`}>
                                        {getStatus(c)}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-5 flex gap-3">
                                <button
                                    disabled={c.deleted_at}
                                    onClick={() => startEdit(c)}
                                    className="px-2 py-2 text-sm rounded-md bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    Update
                                </button>

                                <button
                                    disabled={c.deleted_at}
                                    onClick={() => deleteCateory(c.id)}
                                    className="px-2 py-2 text-sm rounded-md bg-red-800 text-white hover:bg-red-900 focus:ring-2 focus:ring-red-800 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    Delete
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

export default ViewCategory;