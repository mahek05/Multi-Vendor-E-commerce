import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Input from "../../components/Input";
import Select from '../../components/Select';
import Button from "../../components/Button";
import { api } from "../../api/api";

const UpdateProduct = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [formData, setFormData] = useState({
        product_name: "",
        description: "",
        price: "",
        stock: "",
        category_id: ""
    });

    useEffect(() => {
        const fetchProduct = async () => {
            const res = await api(`/product/getById/${id}`, "GET");
            if (res?.success) {
                setFormData({
                    product_name: res.data.product_name || "",
                    description: res.data.description || "",
                    price: res.data.price || "",
                    stock: "",
                    category_id: res.data.category_id || ""
                });
            }
        };
        fetchProduct();
    }, [id]);

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            product_name: formData.product_name.trim(),
            description: formData.description.trim(),
            price: Number(formData.price),
            stock: formData.stock === "" ? undefined : Number(formData.stock),
            category_id: formData.category_id || undefined
        };

        const res = await api(`/product/update/${id}`, "PUT", payload);
        if (res?.success) navigate(`/seller/product/${id}`);
    };

    return (
        <div className="flex min-h-screen flex-col justify-center px-5 pt-5 pb-40 lg:px-8 bg-slate-50">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-slate-900">
                    Update Product
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Product Name"
                        name="product_name"
                        value={formData.product_name}
                        onChange={handleChange}
                    />

                    <Input
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                    />

                    <Input
                        label="Price"
                        name="price"
                        type="number"
                        value={formData.price}
                        onChange={handleChange}
                    />

                    <Input
                        label="Stock Add"
                        name="stock"
                        type="number"
                        value={formData.stock}
                        onChange={handleChange}
                    />

                    <Select
                        label="Category"
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleChange}
                    />

                    <Button text="Update Product" type="submit" />
                </form>
            </div>
        </div>
    );
};

export default UpdateProduct;