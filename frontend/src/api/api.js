const BASE = "http://localhost:5000/api";
import { triggerAlert } from "../components/AlertContext";

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
            localStorage.clear();
            window.location.href = "/login";
            return;
        }

        const refreshRes = await fetch(`${BASE}/auth`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
        });

        if (!refreshRes.ok) {
            localStorage.clear();
            window.location.href = "/login";
            return;
        }

        const refreshData = await refreshRes.json();
        const newAccessToken = refreshData.data.access_token;
        localStorage.setItem("accessToken", newAccessToken);
        response = await makeRequest(newAccessToken);
    }
    const data = await response.json();
    if (!response.ok || data.success === false) {
        triggerAlert("error", data.message || "Something went wrong");
    } else if (data.message && method !== "GET") {
        triggerAlert("success", data.message);
    }

    return data;
};


// export const api = async (url, method = "GET", body = null) => {
//     let accessToken = localStorage.getItem("accessToken");

//     const makeRequest = async (token) => {
//         return fetch(`http://localhost:5000/api${url}`, {
//             method,
//             headers: {
//                 "Content-Type": "application/json",
//                 ...(token && { Authorization: `Bearer ${token}` }),
//             },
//             body: body ? JSON.stringify(body) : null,
//         });
//     };

//     let response = await makeRequest(accessToken);

//     if (response.status === 401) {
//         // try refresh
//         const refreshToken = localStorage.getItem("refreshToken");

//         const refreshRes = await fetch(
//             "http://localhost:5000/api/product/refresh",
//             {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ refreshToken }),
//             }
//         );

//         if (!refreshRes.ok) {
//             localStorage.clear();
//             window.location.href = "/login";
//             return;
//         }

//         const refreshData = await refreshRes.json();
//         localStorage.setItem("accessToken", refreshData.data.accessToken);

//         response = await makeRequest(refreshData.data.accessToken);
//     }

//     return response.json();
// };