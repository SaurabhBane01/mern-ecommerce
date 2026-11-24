import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Product from './pages/Product';
import Auth from './pages/Auth';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Admin from './pages/Admin';
import Payment from './pages/Payment';
import './styles.css';
function App() { return <AppProvider><BrowserRouter><Routes><Route element={<Layout/>}><Route index element={<Home/>}/><Route path="products/:id" element={<Product/>}/><Route path="login" element={<Auth/>}/><Route path="register" element={<Auth register/>}/><Route path="cart" element={<Cart/>}/><Route path="payment/success" element={<Payment success/>}/><Route path="payment/cancel" element={<Payment/>}/><Route element={<ProtectedRoute/>}><Route path="checkout" element={<Checkout/>}/><Route path="orders" element={<Orders/>}/></Route><Route element={<ProtectedRoute admin/>}><Route path="admin" element={<Admin/>}/></Route><Route path="*" element={<Home/>}/></Route></Routes></BrowserRouter></AppProvider>; }
ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);
