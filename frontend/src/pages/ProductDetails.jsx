import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ProductAPI } from "../api/api.js";
import { formatDate, formatCurrency, daysRemainingLabel } from "../api/helpers.js";
import StatusBadge from "../components/StatusBadge.jsx";

function recommendationFor(status) {
  switch (status) {
    case "EXPIRED":
      return "❌ This product has expired and should be removed from the shelf immediately.";
    case "EXPIRES_TODAY":
      return "🚨 This product expires today. Sell or discount it immediately.";
    case "EXPIRING_SOON":
      return "⚠️ Prioritize selling this product soon to avoid wastage.";
    case "EXPIRING_WITHIN_WEEK":
      return "🟡 Keep an eye on this product — plan to sell it within the week.";
    default:
      return "✅ This product is safe. No immediate action needed.";
  }
}

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    ProductAPI.getById(id).then(setProduct).catch((err) => setError(err.message));
  }, [id]);

  if (error) {
    return (
      <div className="page-container">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-container">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h2 className="page-title">Product Details</h2>
      <p className="page-subtitle">Full information for the selected product.</p>

      <div className="detail-card">
        <Row label="Product" value={product.productName} />
        <Row label="Category" value={product.category} />
        <Row label="Quantity" value={product.quantity} />
        <Row label="Price" value={formatCurrency(product.price)} />
        <Row label="Purchase Date" value={formatDate(product.purchaseDate)} />
        <Row label="Expiry Date" value={formatDate(product.expiryDate)} />
        <Row label="Days Remaining" value={daysRemainingLabel(product.daysRemaining)} />
        <Row label="Status" value={<StatusBadge product={product} />} />

        <div className="recommendation-box">{recommendationFor(product.status)}</div>

        <div className="d-flex justify-content-end gap-2 mt-4">
          <Link to="/products" className="btn btn-outline-secondary">Back to Products</Link>
          <Link to={`/edit-product/${product.id}`} className="btn btn-primary">Edit Product</Link>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value}</span>
    </div>
  );
}
