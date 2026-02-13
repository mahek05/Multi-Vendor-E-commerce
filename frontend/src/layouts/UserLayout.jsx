import Navbar from "../components/UserNavbar";
import { Outlet } from "react-router-dom";

const UserLayout = () => {
    return (
        <>
            <Navbar />
            <main className="pt-16">
                <Outlet />
            </main>
        </>
    );
};

export default UserLayout;