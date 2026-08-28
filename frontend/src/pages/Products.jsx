import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ProductAPI } from "../api/api.js";
import { formatDate, formatCurrency, daysRemainingLabel } from "../api/helpers.js";
import StatusBadge from "../components/StatusBadge.jsx";
import DeleteModal from "../components/DeleteModal.jsx";

const FILTERS = [
  { key: "all", label: "All", cls: "btn-outline-secondary" },
  { key: "expired", label: "Expired", cls: "btn-outline-danger" },
  { key: "today", label: "Expires Today", cls: "btn-outline-danger" },
  { key: "3days", label: "Within 3 Days", cls: "btn-outline-warning" },
  { key: "7days", label: "Within 7 Days", cls: "btn-outline-warning" },
  { key: "safe", label: "Safe", cls: "btn-outline-success" },
  { key: "priority", label: "FEFO Priority Order", cls: "btn-outline-primary" },
  { key: "low-stock", label: "Low Stock", cls: "btn-outline-info" },
];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, productName }

  const loadByFilter = useCallback(async (activeFilter) => {
    try {
      let data;
      switch (activeFilter) {
        case "expired": data = await ProductAPI.expired(); break;
        case "today": data = await ProductAPI.expiringToday(); break;
        case "3days": data = await ProductAPI.expiringSoon(); break;
        case "7days": data = await ProductAPI.expiringWeek(); break;
        case "safe": data = await ProductAPI.safe(); break;
        case "priority": data = await ProductAPI.priority(); break;
        case "low-stock": data = await ProductAPI.lowStock(); break;
        default: data = await ProductAPI.getAll();
      }
      setProducts(data);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    loadByFilter(filter);
  }, [filter, loadByFilter]);

  // Debounced live search
  useEffect(() => {
    if (searchTerm.trim() === "") return;
    const timer = setTimeout(async () => {
      try {
        const results = await ProductAPI.search(searchTerm.trim());
        setProducts(results);
        setError("");
      } catch (err) {
        setError(err.message);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  function handleFilterClick(key) {
    setSearchTerm("");
    setFilter(key);
  }

  function handleSearchChange(e) {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim() === "") {
      loadByFilter(filter);
    }
  }

  async function confirmDelete() {
    try {
      await ProductAPI.remove(deleteTarget.id);
      setDeleteTarget(null);
      loadByFilter(filter);
    } catch (err) {
      setDeleteTarget(null);
      setError(err.message);
    }
  }

  const isPriorityView = filter === "priority" && searchTerm.trim() === "";

  return (
    <div className="page-container">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <h2 className="page-title">Products</h2>
          <p className="page-subtitle mb-0">View, search, filter, and manage all products.</p>
        </div>
        <Link to="/add-product" className="btn btn-success">+ Add Product</Link>
      </div>

      {error && <div className="alert alert-danger mt-3">{error}</div>}

      <div className="row mt-4">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Search by product name or category..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <div className="filter-btn-group mt-3">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`btn btn-sm ${f.cls} ${filter === f.key ? "active" : ""}`}
            onClick={() => handleFilterClick(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isPriorityView && (
        <div className="alert alert-info mt-3">
          🔁 <strong>FEFO (First Expire, First Out):</strong> Sell products with the earliest
          expiry first to reduce wastage.
        </div>
      )}

      <div className="table-responsive mt-3">
        <table className="table table-hover bg-white align-middle">
          <thead>
            <tr>
              <th>ID</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Location</th>
              <th>Price</th>
              <th>Purchase Date</th>
              <th>Expiry Date</th>
              <th>Days Remaining</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="11" className="empty-state">No products found.</td>
              </tr>
            ) : (
              products.map((p, index) => (
                <tr key={p.id}>
                  <td>
                    {isPriorityView ? (
                      <span className="priority-rank">{index + 1}</span>
                    ) : (
                      p.id.slice(-6)
                    )}
                  </td>
                  <td>{p.productName}</td>
                  <td>{p.category}</td>
                  <td>{p.quantity}</td>
                  <td>{p.storageLocation || "Main Storage"}</td>
                  <td>{formatCurrency(p.price)}</td>
                  <td>{formatDate(p.purchaseDate)}</td>
                  <td>{formatDate(p.expiryDate)}</td>
                  <td>{daysRemainingLabel(p.daysRemaining)}</td>
                  <td><StatusBadge product={p} /></td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <Link to={`/product-details/${p.id}`} className="btn btn-outline-secondary">View</Link>
                      <Link to={`/edit-product/${p.id}`} className="btn btn-outline-primary">Edit</Link>
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => setDeleteTarget({ id: p.id, productName: p.productName })}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <DeleteModal
        show={!!deleteTarget}
        productName={deleteTarget?.productName}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
