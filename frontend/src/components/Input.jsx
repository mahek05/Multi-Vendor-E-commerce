import React from 'react';

const Input = ({ label, type = "text", name, value, onChange, placeholder, required = false }) => {
    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium leading-6 text-gray-800 mb-2">
                {label}
            </label>
            <div className="mt-2">
                <input
                    id={name}
                    name={name}
                    type={type}
                    required={required}
                    {...(type !== "file" && { value })}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="block w-full rounded-md px-4 py-2 text-sm shadow-sm transition-colors duration-200 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
            </div>
        </div>
    );
};

export default Input;