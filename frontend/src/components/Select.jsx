import { useEffect, useState } from "react";
import { api } from "../api/api";

const Select = ({ label, name, value, onChange, required }) => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            const res = await api("/category", "GET");

            if (!res?.success) return;

            setCategories(res.data?.page_data || []);
        };

        fetchCategories();
    }, []);

    return (
        <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
                {label}
            </label>

            <select
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                className="block w-full rounded-md px-4 py-2 text-sm bg-white border border-slate-300 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
            >
                <option value="">Select Category</option>

                {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                        {cat.category_name}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default Select;