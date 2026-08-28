import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ProductAPI } from "../api/api.js";
import { toInputDate } from "../api/helpers.js";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    ProductAPI.getById(id)
      .then((p) =>
        setForm({
          productName: p.productName,
          category: p.category,
          quantity: p.quantity,
          price: p.price,
          lowStockThreshold: p.lowStockThreshold ?? 5,
          storageLocation: p.storageLocation || "Main Storage",
          purchaseDate: toInputDate(p.purchaseDate),
          expiryDate: toInputDate(p.expiryDate),
        })
      )
      .catch((err) => setError(err.message));
  }, [id]);

  function handleChange(e) {
    setForm({ ...form, [e.target.id]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await ProductAPI.update(id, {
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

  if (error && !form) {
    return (
      <div className="page-container">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="page-container">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h2 className="page-title">Edit Product</h2>
      <p className="page-subtitle">Update the product details below.</p>

      <div className="form-card">
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Product Name</label>
            <input
              type="text" className="form-control" id="productName"
              value={form.productName} onChange={handleChange} required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Category</label>
            <input
              type="text" className="form-control" id="category"
              value={form.category} onChange={handleChange} required
            />
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Quantity</label>
              <input
                type="number" className="form-control" id="quantity" min="1"
                value={form.quantity} onChange={handleChange} required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Price (₹)</label>
              <input
                type="number" className="form-control" id="price" min="0" step="0.01"
                value={form.price} onChange={handleChange} required
              />
            </div>
          </div>
          <div className="row">
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
                value={form.storageLocation} onChange={handleChange} required
              />
            </div>
          </div>
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
            <button type="submit" className="btn btn-primary">Update Product</button>
          </div>
        </form>
      </div>
    </div>
  );
}
