import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Button from '../../components/Button';
import { api } from '../../api/api'

const AddProduct = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        product_name: '',
        description: '',
        price: '',
        stock: '',
        category_id: '',
        image: ''
    });

    const handleChange = (e) => {
        const { name, type, value, files } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: type === "file" ? files[0] : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const fd = new FormData();
        Object.keys(formData).forEach(key => {
            fd.append(key, formData[key]);
        });

        const res = await api("/product/create", "POST", fd);

        if (res.success) navigate("/seller");
    };


    return (
        <div className="flex min-h-screen flex-col justify-center px-6 pt-12 pb-40 lg:px-8 bg-slate-50">

            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                {/* <img 
          className="mx-auto h-10 w-auto" 
          src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500" 
          alt="Ecommerce Platform" 
        /> */}
                <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-slate-900">
                    Create Product
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form className="space-y-6" onSubmit={handleSubmit}>

                    <Input
                        label="Product Name"
                        name="product_name"
                        type="text"
                        value={formData.product_name}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        label="Description"
                        name="description"
                        type="text"
                        value={formData.description}
                        onChange={handleChange}
                        required
                    />

                    <Select
                        label="Category"
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        label="Price"
                        name="price"
                        type="number"
                        value={formData.price}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        label="Stock"
                        name="stock"
                        type="number"
                        value={formData.stock}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        label="Image"
                        name="image"
                        type="file"
                        value={formData.image}
                        onChange={handleChange}
                        required
                    />

                    <Button text="Create" type="submit" />

                </form>
            </div>
        </div>
    );
};

export default AddProduct;