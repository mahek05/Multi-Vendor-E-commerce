import { triggerAlert } from "../components/AlertContext";
import { connectSocket, disconnectSocket } from "../utils/socket";
const BASE = "http://localhost:5000/api";

const getLoginPathByRole = () => {
    const role = localStorage.getItem("role");
    if (role === "SELLER") return "/seller/login";
    if (role === "ADMIN") return "/admin/login";
    return "/login";
};

export const api = async (
    url,
    method = "GET",
    body = null,
    isFormData = false
) => {

    let accessToken = localStorage.getItem("accessToken");

    const makeRequest = async (token) => {
        const isFormData = body instanceof FormData;

        return fetch(`http://localhost:5000/api${url}`, {
            method,
            headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
                ...(isFormData ? {} : { "Content-Type": "application/json" }),
            },
            body: body
                ? isFormData
                    ? body
                    : JSON.stringify(body)
                : null,
        });
    };

    let response = await makeRequest(accessToken);
    if (response.status === 401) {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
            disconnectSocket();
            localStorage.clear();
            window.location.href = getLoginPathByRole();
            return;
        }

        const refreshRes = await fetch(`${BASE}/auth`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
        });

        if (!refreshRes.ok) {
            disconnectSocket();
            localStorage.clear();
            window.location.href = getLoginPathByRole();
            return;
        }

        const refreshData = await refreshRes.json();
        if (!refreshData?.success || !refreshData?.data?.access_token) {
            disconnectSocket();
            localStorage.clear();
            window.location.href = getLoginPathByRole();
            return;
        }

        const newAccessToken = refreshData.data.access_token;
        const newRefreshToken = refreshData.data.refresh_token;
        localStorage.setItem("accessToken", newAccessToken);
        if (newRefreshToken) {
            localStorage.setItem("refreshToken", newRefreshToken);
        }
        disconnectSocket();
        connectSocket();
        response = await makeRequest(newAccessToken);

        if (response.status === 401) {
            disconnectSocket();
            localStorage.clear();
            window.location.href = getLoginPathByRole();
            return;
        }
    }

    const data = await response.json();
    if (!response.ok || data.success === false) {
        triggerAlert("error", data.message || "Something went wrong");
    } else if (data.message && method !== "GET") {
        triggerAlert("success", data.message);
    }
    return data;
};