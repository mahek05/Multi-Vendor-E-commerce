import { useEffect, useState } from "react";
import { api } from "../../api/api";
import Pagination from "../../components/Pagination";

const ViewCategory = () => {
    const [categories, setCategories] = useState([]);
    const [pageInfo, setPageInfo] = useState(null);
    const [page, setPage] = useState(1);
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [newCategory, setNewCategory] = useState("");

    const fetchCategory = async () => {
        const res = await api(`/category/admin/get-category?page=${page}`, "GET");
        if (!res?.success) return;

        setCategories(res.data.page_data);
        setPageInfo(res.data.page_information);
    };

    useEffect(() => {
        fetchCategory();
    }, [page]);

    const deleteCategory = async (id) => {
        const res = await api(`/category/delete/${id}`, "DELETE");
        if (res?.success) fetchCategory();
    };

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

    const createCategory = async () => {
        if (!newCategory.trim()) return;

        const res = await api(`/category/create`, "POST", {
            category_name: newCategory
        });

        if (res?.success) {
            setNewCategory("");
            setIsCreating(false);
            fetchCategory();
        }
    };

    const getStatus = (category) =>
        category.deleted_at ? "Deleted" : "Active";

    const statusStyle = (category) =>
        category.deleted_at
            ? "bg-red-100 text-red-600"
            : "bg-green-100 text-green-600";

    return (
        <section className="min-h-[calc(100vh-4rem)] py-4 bg-slate-50">
            <div className="max-w-5xl mx-auto px-6">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-semibold text-slate-800">
                        Category Management
                    </h2>

                    <button
                        onClick={() => setIsCreating(!isCreating)}
                        className="px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                    >
                        {isCreating ? "Cancel" : "New Category"}
                    </button>
                </div>

                {isCreating && (
                    <div className="bg-white p-6 rounded-lg shadow mb-6 flex gap-3">
                        <input
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder="Enter category name"
                            className="flex-1 border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />

                        <button
                            onClick={createCategory}
                            className="px-6 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                            Create
                        </button>
                    </div>
                )}

                <div className="space-y-4">
                    {categories.map((c) => (
                        <div
                            key={c.id}
                            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition"
                        >
                            <div className="flex justify-between items-center">
                                <div className="flex-1">
                                    {editingId === c.id ? (
                                        <div className="flex gap-2">
                                            <input
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="border border-slate-300 rounded-md px-3 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                                            />

                                            <button
                                                onClick={() => updateCategory(c.id)}
                                                className="px-3 bg-green-600 text-white rounded-md"
                                            >
                                                Save
                                            </button>

                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="px-3 bg-gray-200 rounded-md"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="text-lg font-medium text-slate-800">
                                            {c.category_name}
                                        </p>
                                    )}
                                </div>

                                <span
                                    className={`px-4 py-1 text-sm rounded-full ${statusStyle(c)}`}
                                >
                                    {getStatus(c)}
                                </span>
                            </div>

                            <div className="mt-5 flex gap-3">
                                <button
                                    disabled={c.deleted_at}
                                    onClick={() => {
                                        setEditingId(c.id);
                                        setEditName(c.category_name);
                                    }}
                                    className="px-4 py-2 bg-yellow-500 text-white rounded-md disabled:bg-gray-400"
                                >
                                    Update
                                </button>

                                <button
                                    disabled={c.deleted_at}
                                    onClick={() => deleteCategory(c.id)}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md disabled:bg-gray-400"
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