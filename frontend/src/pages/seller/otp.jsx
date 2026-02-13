import React, { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
// import Input from '../../components/Input';
import Button from '../../components/Button';
import { api } from '../../api/api'

const SellerOtp = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const email = state?.email;

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const inputsRef = useRef([]);

    if (!email) {
        navigate("/seller/signup");
    }

    const handleChange = (index, value) => {
        if (!/^\d?$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            inputsRef.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputsRef.current[index - 1].focus();
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();

        const otpValue = otp.join("");
        if (otpValue.length !== 6) return alert("Enter valid OTP");

        const verifyRes = await api("/otp/verify", "POST", {
            email,
            otp: otpValue,
        });


        if (!verifyRes.success) {
            return alert("Invalid or expired OTP");
        }

        const signupRes = await api("/seller/signup", "POST", state);

        if (signupRes.success) {
            navigate("/seller/login");
        } else {
            alert("Signup failed");
        }
    };

    return (
        <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8 bg-slate-50">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-slate-900">
                    Verify Email
                </h2>
                <p className="mt-10 text-center tracking-tight text-slate-600">
                    Enter 6 digit code.
                </p>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form className="space-y-6" onSubmit={handleVerify}>
                    <div className="mb-6 flex justify-center gap-3">
                        {otp.map((digit, i) => (
                            <input
                                key={i}
                                ref={(el) => (inputsRef.current[i] = el)}
                                type="text"
                                maxLength="1"
                                value={digit}
                                onChange={(e) => handleChange(i, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(i, e)}
                                className="h-14 w-12 rounded px-4 py-2 text-sm shadow-sm transition-colors duration-200 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                            />
                        ))}
                    </div>

                    <Button text="Verify" type="submit" />
                </form>

                <p className="mt-10 text-center text-sm text-gray-500">
                    Didn't receive code?{' '}
                    {/* <span
                        className="cursor-pointer text-indigo-400 hover:underline"
                        onClick={() => api("/otp/send_otp", "POST", { email })}
                    >
                        Resend
                    </span> */}

                    <Link onClick={() => api("/otp/send_otp", "POST", { email })} className="font-semibold leading-6 text-slate-600 hover:text-indigo-600">
                        Resend
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SellerOtp;