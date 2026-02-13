import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { api } from '../../api/api';

const SellerSignup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone_number: '',
        address: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const res = await api("/otp/send", "POST", {
            email: formData.email,
        });

        if (res.success) {
            navigate("/seller/otp", { state: formData });
        } else {
            alert("OTP already sent.");
        }
    };

    return (
        <div className="flex min-h-screen flex-col justify-center px-6 pt-12 pb-40 lg:px-8 bg-slate-50">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-slate-900">
                    Create an account
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form className="space-y-6" onSubmit={handleSubmit}>

                    <Input
                        label="Email address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        label="Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        label="Mobile Number"
                        name="phone_number"
                        type="tel"
                        value={formData.phone_number}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        label="Address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        label="Stripe Payment id"
                        name="stripe_account_id"
                        value={formData.stripe_account_id}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        label="Password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <Button text="Sign in" type="submit" />

                </form>

                <p className="mt-10 text-center text-sm text-gray-500">
                    Already Registered?{' '}
                    <Link to="/seller/login" className="font-semibold leading-6 text-slate-600 hover:text-indigo-600">
                        Sign In
                    </Link>
                </p>
            </div>
        </div >
    );
};

export default SellerSignup;