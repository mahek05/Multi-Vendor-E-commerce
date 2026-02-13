import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UserLayout from "./layouts/UserLayout";
import SellerLayout from "./layouts/SellerLayout";

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
                
                <Route element={<UserLayout />}>
                    <Route path="/products" element={<AllProducts />} />
                    <Route path="/category/:id" element={<ProductsByCategory />} />
                    <Route path="/product/:id" element={<ProductDetails />} />
                    <Route path="/product/category/:name" element={<ProductsByCategory />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/order/orderHistory" element={<OrderHistory />} />
                    <Route path="/profile" element={<UserProfile/>} />
                    <Route path="/update" element={<UserProfileUpdate/>} />
                </Route>

                <Route element={<SellerLayout />}>
                    <Route path="/seller/orders" element={<SellerOrders />} />
                    <Route path="/seller" element={<SellerProducts />} />
                    <Route path="/seller/product/:id" element={<ProductDetails />} />
                    <Route path="/seller/product/category/:name" element={<SellerProductsByCategory />} />
                    <Route path="/add-product" element={<AddProduct/>} />
                    <Route path="/seller/profile" element={<SellerProfile/>} />
                    <Route path="/seller/update" element={<SellerProfileUpdate/>} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;