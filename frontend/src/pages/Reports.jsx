import React, { useEffect, useState } from "react";
import { ProductAPI } from "../api/api.js";

export default function Reports() {
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    ProductAPI.report().then(setReport).catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div className="page-container">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="page-container">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h2 className="page-title">Reports</h2>
      <p className="page-subtitle">A simple summary of your inventory health.</p>

      <div className="row g-3">
        <StatCard cls="stat-total" value={report.totalProducts} label="Total Products" />
        <StatCard cls="stat-total" value={report.totalInventoryQuantity} label="Total Inventory Quantity" />
        <StatCard cls="stat-expired" value={report.expiredProductCount} label="Expired Products" />
        <StatCard cls="stat-soon" value={report.expiringSoonCount} label="Expiring Soon (≤7 days)" />
        <StatCard cls="stat-safe" value={report.safeProductCount} label="Safe Products" />
        <StatCard cls="stat-expired" value={report.potentiallyWastedQuantity} label="Potentially Wasted Units" />
      </div>
    </div>
  );
}

function StatCard({ cls, value, label }) {
  return (
    <div className="col-6 col-md-4">
      <div className={`stat-card ${cls}`}>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}
