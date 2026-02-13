import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { api } from '../../api/api'

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api("/user/login", "POST", formData);

            if (res.success) {
                const { access_token, refresh_token, role } = res.data;

                localStorage.setItem("accessToken", access_token);
                localStorage.setItem("refreshToken", refresh_token);
                localStorage.setItem("role", role);

                navigate("/products");
            }
        } catch (error) {
            console.error("Login Error: ", error);
        }
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
                    Sign in to your account
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
                        label="Password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    {/* <div className="flex items-center justify-end">
                        <div className="text-sm">
                            <a href="#" className="font-semibold text-indigo-400 hover:text-indigo-300">
                                Forgot password?
                            </a>
                        </div>
                    </div> */}

                    <Button text="Sign in" type="submit" />

                </form>

                <p className="mt-10 text-center text-sm text-gray-500">
                    Not a user?{' '}
                    <Link to="/signup" className="font-semibold leading-6 text-slate-600 hover:text-indigo-600">
                        Create an account
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;