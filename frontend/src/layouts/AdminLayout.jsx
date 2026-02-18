import { Outlet } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";

const AdminLayout = () => {
    return (
        <>
            <AdminNavbar />
            <main className="pt-16">
                <Outlet />
            </main>
        </>
    );
};

export default AdminLayout;