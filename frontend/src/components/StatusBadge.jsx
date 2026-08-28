import React from "react";

/**
 * StatusBadge.jsx
 * Renders a colored status pill for a product, e.g. "🟠 EXPIRING SOON".
 */
export default function StatusBadge({ product }) {
  return (
    <span className={`badge-status badge-${product.status}`}>
      {product.statusIcon} {product.statusLabel}
    </span>
  );
}
