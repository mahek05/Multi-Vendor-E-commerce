import React from 'react';

const Button = ({ text, type = "button", onClick, className = "" }) => {
    return (
        <button
            type={type}
            onClick={onClick}
            className={`flex w-full justify-center rounded-md px-4 py-2
        text-sm font-semibold
        transition-all duration-200
        bg-indigo-600 text-white
        hover:bg-indigo-700
        active:bg-indigo-800
        focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2
        disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed
        ${className}`}
        >
            {text}
        </button>
    );
};

export default Button;