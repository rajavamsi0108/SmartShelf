import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Products from "./pages/Products.jsx";
import AddProduct from "./pages/AddProduct.jsx";
import EditProduct from "./pages/EditProduct.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import Reports from "./pages/Reports.jsx";
import Login from "./pages/Login.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import StockMovements from "./pages/StockMovements.jsx";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
        <Route path="/stock-movements" element={<ProtectedRoute><StockMovements /></ProtectedRoute>} />
        <Route path="/add-product" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
        <Route path="/edit-product/:id" element={<ProtectedRoute><EditProduct /></ProtectedRoute>} />
        <Route path="/product-details/:id" element={<ProtectedRoute><ProductDetails /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      </Routes>
    </>
  );
}
