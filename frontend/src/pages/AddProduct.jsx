import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ProductAPI } from "../api/api.js";

const today = new Date().toISOString().split("T")[0];

export default function AddProduct() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    productName: "",
    category: "",
    quantity: "",
    price: "",
    lowStockThreshold: 5,
    storageLocation: "Main Storage",
    purchaseDate: today,
    expiryDate: "",
  });
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.id]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await ProductAPI.create({
        ...form,
        quantity: Number(form.quantity),
        price: Number(form.price),
        lowStockThreshold: Number(form.lowStockThreshold),
        storageLocation: form.storageLocation,
      });
      navigate("/products");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page-container">
      <h2 className="page-title">Add Product</h2>
      <p className="page-subtitle">
        Enter product details below. Days remaining and status are calculated automatically.
      </p>

      <div className="form-card">
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Product Name</label>
            <input
              type="text" className="form-control" id="productName"
              value={form.productName} onChange={handleChange} required placeholder="e.g. Milk"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Category</label>
            <input
              type="text" className="form-control" id="category"
              value={form.category} onChange={handleChange} required placeholder="e.g. Dairy"
            />
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Quantity</label>
              <input
                type="number" className="form-control" id="quantity" min="1"
                value={form.quantity} onChange={handleChange} required placeholder="e.g. 20"
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Price (₹)</label>
              <input
                type="number" className="form-control" id="price" min="0" step="0.01"
                value={form.price} onChange={handleChange} required placeholder="e.g. 35.00"
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Low-stock alert at</label>
              <input
                type="number" className="form-control" id="lowStockThreshold" min="0"
                value={form.lowStockThreshold} onChange={handleChange} required
              />
              <small className="text-muted">Alert when units reach this level.</small>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Storage location</label>
              <input
                type="text" className="form-control" id="storageLocation"
                value={form.storageLocation} onChange={handleChange} required placeholder="e.g. Aisle 2, Rack B"
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Purchase Date</label>
              <input
                type="date" className="form-control" id="purchaseDate"
                value={form.purchaseDate} onChange={handleChange} required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Expiry Date</label>
              <input
                type="date" className="form-control" id="expiryDate"
                value={form.expiryDate} onChange={handleChange} required
              />
            </div>
          </div>
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Link to="/products" className="btn btn-outline-secondary">Cancel</Link>
            <button type="submit" className="btn btn-success">Save Product</button>
          </div>
        </form>
      </div>
    </div>
  );
}
