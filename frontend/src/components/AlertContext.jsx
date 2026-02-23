import { createContext, useContext, useState, useEffect } from "react";

const AlertContext = createContext();
let globalAlert = null;

export const setGlobalAlert = (fn) => {
    globalAlert = fn;
};

export const triggerAlert = (type, message) => {
    if (globalAlert) {
        globalAlert(type, message);
    }
};

export const AlertProvider = ({ children }) => {
    const [alert, setAlert] = useState(null);

    const showAlert = (type, message) => {
        setAlert({ type, message });

        setTimeout(() => {
            setAlert(null);
        }, 2000);
    };

    useEffect(() => {
        setGlobalAlert(showAlert);
    }, []);

    return (
        <AlertContext.Provider value={{ showAlert }}>
            {children}
            {alert && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4">
                    <div
                        className={`rounded-lg p-4 shadow-lg border flex items-start gap-3
                        ${alert.type === "error"
                                ? "bg-red-50 border-red-300 text-red-800"
                                : "bg-green-50 border-green-300 text-green-800"
                            }`}
                    >
                        <div className="font-semibold">
                            {alert.type === "error" ? "Error" : "Success"}
                        </div>
                        <div>{alert.message}</div>
                    </div>
                </div>
            )}
        </AlertContext.Provider>
    );
};

export const useAlert = () => useContext(AlertContext);