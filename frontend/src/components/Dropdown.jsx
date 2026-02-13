import { useEffect, useRef } from "react";

const Dropdown = ({ open, onClose, children }) => {
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    if (!open) return null;

    return (
        <div
            ref={ref}
            className="
                absolute right-0 top-full mt-2
                w-48
                max-w-[90vw]
                rounded-md
                bg-white
                border border-slate-200
                shadow-lg
                z-50
            "
        >
            {children}
        </div>
    );
};

export default Dropdown;
