import React, { useEffect, useState } from "react";
import { ProductAPI } from "../api/api.js";

export default function StockMovements() {
  const [products, setProducts] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [type, setType] = useState("IN");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedProduct = products.find((product) => product.id === selectedId);

  useEffect(() => {
    ProductAPI.getAll().then((data) => {
      setProducts(data);
      if (data.length > 0) setSelectedId(data[0].id);
    }).catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    ProductAPI.stockHistory(selectedId).then(setHistory).catch((err) => setError(err.message));
  }, [selectedId]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      const result = await ProductAPI.moveStock(selectedId, { type, quantity: Number(quantity), reason });
      setProducts((current) => current.map((product) => product.id === selectedId ? result.product : product));
      setHistory((current) => [result, ...current]);
      setMessage(`${type === "IN" ? "Stock received" : "Stock issued"} successfully. New balance: ${result.balanceAfter} units.`);
      setQuantity(1);
      setReason("");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page-container">
      <h2 className="page-title">Stock Movements</h2>
      <p className="page-subtitle">Record deliveries, sales, damages, and returns without losing inventory history.</p>
      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <div className="stock-layout">
        <div className="form-card stock-form-card">
          <div className="movement-toggle" role="group" aria-label="Movement type">
            <button type="button" className={type === "IN" ? "active" : ""} onClick={() => setType("IN")}>Stock In</button>
            <button type="button" className={type === "OUT" ? "active out" : ""} onClick={() => setType("OUT")}>Stock Out</button>
          </div>
          <form onSubmit={handleSubmit}>
            <label className="form-label" htmlFor="stock-product">Product</label>
            <select id="stock-product" className="form-select mb-3" value={selectedId} onChange={(event) => setSelectedId(event.target.value)} required>
              {products.map((product) => <option key={product.id} value={product.id}>{product.productName} ({product.quantity} units)</option>)}
            </select>
            {selectedProduct && <div className="stock-balance">Current balance <strong>{selectedProduct.quantity} units</strong><span>{selectedProduct.storageLocation || "Main Storage"}</span></div>}
            <label className="form-label" htmlFor="movement-quantity">Quantity</label>
            <input id="movement-quantity" type="number" className="form-control mb-3" min="1" max={type === "OUT" ? selectedProduct?.quantity : undefined} value={quantity} onChange={(event) => setQuantity(event.target.value)} required />
            <label className="form-label" htmlFor="movement-reason">Reason</label>
            <input id="movement-reason" type="text" className="form-control" placeholder={type === "IN" ? "e.g. Supplier delivery" : "e.g. Customer sale"} value={reason} onChange={(event) => setReason(event.target.value)} />
            <button type="submit" className={`btn ${type === "IN" ? "btn-primary" : "btn-danger"} w-100 mt-4`} disabled={!selectedProduct}>{type === "IN" ? "Add stock" : "Remove stock"}</button>
          </form>
        </div>

        <div>
          <h4 className="page-title movement-history-title">Recent movements</h4>
          <div className="table-responsive">
            <table className="table table-hover bg-white align-middle">
              <thead><tr><th>Type</th><th>Quantity</th><th>Reason</th><th>Balance</th><th>Date</th></tr></thead>
              <tbody>
                {history.length === 0 ? <tr><td colSpan="5" className="empty-state">No movements recorded for this product.</td></tr> : history.map((item) => <tr key={item.id || item._id}><td><span className={`movement-badge movement-${item.type.toLowerCase()}`}>{item.type}</span></td><td>{item.quantity}</td><td>{item.reason}</td><td>{item.balanceAfter}</td><td>{new Date(item.createdAt).toLocaleDateString()}</td></tr>)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}