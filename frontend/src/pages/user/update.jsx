import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { api } from '../../api/api';

const UserProfileUpdate = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        phone_number: '',
        address: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            const res = await api("/user/profile", "GET");

            if (res?.success && res.data) {
                setFormData({
                    name: res.data.name || '',
                    phone_number: res.data.phone_number || '',
                    address: res.data.address || ''
                });
            }

        };

        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();


        const res = await api("/user/profile", "PUT", formData);

        if (res?.success) {
            navigate("/profile");
        }
    };

    return (
        <div className="flex min-h-screen flex-col justify-center px-6 pt-12 pb-40 lg:px-8 bg-slate-50">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-slate-900">
                    Update Details
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
                <form className="space-y-6" onSubmit={handleSubmit}>

                    <Input
                        label="Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                    />

                    <Input
                        label="Mobile Number"
                        name="phone_number"
                        type="tel"
                        value={formData.phone_number}
                        onChange={handleChange}
                    />

                    <Input
                        label="Address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                    />

                    <Button text="Update" type="submit" />

                </form>
            </div>
        </div>
    );
};

export default UserProfileUpdate;
