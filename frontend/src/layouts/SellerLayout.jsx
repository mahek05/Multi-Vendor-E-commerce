import { Outlet } from "react-router-dom";
import SellerNavbar from "../components/SellerNavbar";

const SellerLayout = () => {
    return (
        <>
            <SellerNavbar />
            <main className="pt-16">
                <Outlet />
            </main>
        </>
    );
};

export default SellerLayout;