import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UserLayout from "./layouts/UserLayout";
import SellerLayout from "./layouts/SellerLayout";
import AdminLayout from './layouts/AdminLayout';

import Login from './pages/user/login';
import Signup from './pages/user/signup';
import Otp from './pages/user/otp';
import AllProducts from './pages/product/allProducts';
import ProductDetails from './pages/product/productDetail';
import ProductsByCategory from './pages/product/productByCategory';
import Cart from './pages/cart/index';
import OrderHistory from './pages/user/orderHistory';
import SellerSignup from './pages/seller/signup';
import SellerLogin from './pages/seller/login';
import SellerOtp from './pages/seller/otp';
import SellerOrders from './pages/seller/orderHistory';
import SellerProducts from './pages/product/sellerProduct';
import SellerProductsByCategory from './pages/product/sellerProductByCategory';
import AddProduct from './pages/product/addProduct';
import SellerProfile from './pages/seller/profile';
import UserProfile from './pages/user/profile';
import UserProfileUpdate from './pages/user/update';
import SellerProfileUpdate from './pages/seller/update';
import UpdateProduct from './pages/product/productUpdate';
import AdminSignup from './pages/admin/signup';
import AdminLogin from './pages/admin/login';
import AdminOtp from './pages/admin/otp';
import AdminProfile from './pages/admin/profile';
import AdminDashboard from './pages/admin/dashboard';
import Sellers from './pages/admin/getSeller';
import Users from './pages/admin/getUser';
import ViewCategory from './pages/admin/category';
import Checkout from './pages/payment/checkout';
import PaymentResult from './pages/payment/paymentSuccess';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/otp" element={<Otp />} />
                <Route path="/seller/signup" element={<SellerSignup />} />
                <Route path="/seller/login" element={<SellerLogin />} />
                <Route path="/seller/otp" element={<SellerOtp />} />
                <Route path="/admin/signup" element={<AdminSignup />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/otp" element={<AdminOtp />} />

                <Route element={<UserLayout />}>
                    <Route path="/products" element={<AllProducts />} />
                    <Route path="/category/:id" element={<ProductsByCategory />} />
                    <Route path="/product/:id" element={<ProductDetails />} />
                    <Route path="/product/category/:name" element={<ProductsByCategory />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/order/orderHistory" element={<OrderHistory />} />
                    <Route path="/profile" element={<UserProfile/>} />
                    <Route path="/update" element={<UserProfileUpdate/>} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/payment-success" element={<PaymentResult />} />
                </Route>

                <Route element={<SellerLayout />}>
                    <Route path="/seller/orders" element={<SellerOrders />} />
                    <Route path="/seller" element={<SellerProducts />} />
                    <Route path="/seller/product/:id" element={<ProductDetails />} />
                    <Route path="/seller/product/category/:name" element={<SellerProductsByCategory />} />
                    <Route path="/add-product" element={<AddProduct/>} />
                    <Route path="/seller/profile" element={<SellerProfile/>} />
                    <Route path="/seller/update" element={<SellerProfileUpdate/>} />
                    <Route path="/seller/product/update/:id" element={<UpdateProduct/>} />
                </Route>

                <Route element={<AdminLayout />}>
                    <Route path="/admin/profile" element={<AdminProfile/>} />
                    <Route path="/admin/dashboard" element={<AdminDashboard/>} />
                    <Route path="/admin/allSeller" element={<Sellers/>} />
                    <Route path="/admin/allUser" element={<Users/>} />
                    <Route path="/admin/categories" element={<ViewCategory/>} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;