import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardAPI } from "../api/api.js";
import { formatDate, daysRemainingLabel } from "../api/helpers.js";
import StatusBadge from "../components/StatusBadge.jsx";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [browserStatus, setBrowserStatus] = useState("");

  useEffect(() => {
    const loadDashboard = () => DashboardAPI.get()
      .then(setData)
      .catch((err) => setError(err.message));
    loadDashboard();
    const refreshTimer = setInterval(loadDashboard, 60000);
    return () => clearInterval(refreshTimer);
  }, []);

  const attention = data?.productsRequiringAttention || [];

  useEffect(() => {
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    const urgent = attention.filter((product) => product.daysRemaining <= 3);
    if (urgent.length === 0) return;

    const alertKey = `${new Date().toISOString().slice(0, 10)}:${urgent.map((product) => `${product.id}-${product.daysRemaining}`).join(",")}`;
    if (localStorage.getItem("smartshelf_last_browser_alert") === alertKey) return;

    new Notification("SmartShelf expiry reminder", {
      body: urgent.length === 1
        ? `${urgent[0].productName} ${urgent[0].daysRemaining < 0 ? "has expired" : urgent[0].daysRemaining === 0 ? "expires today" : `expires in ${urgent[0].daysRemaining} day(s)`}.`
        : `${urgent.length} products expire today or within 3 days.`,
    });
    localStorage.setItem("smartshelf_last_browser_alert", alertKey);
  }, [attention]);

  if (error) {
    return (
      <div className="page-container">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="page-container">
        <p className="text-muted">Loading dashboard...</p>
      </div>
    );
  }

  async function enableBrowserAlerts() {
    if (!("Notification" in window)) {
      setBrowserStatus("Browser notifications are not supported here.");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setBrowserStatus("Browser alerts are blocked. Allow notifications in browser settings.");
      return;
    }
    const urgent = attention.filter((product) => product.daysRemaining <= 3);
    new Notification("SmartShelf expiry alerts enabled", {
      body: urgent.length > 0 ? `${urgent.length} product(s) are expired or expire within 3 days.` : "No products are expired or expiring within 3 days.",
    });
    setBrowserStatus("Browser expiry alerts are enabled on this device.");
  }

  return (
    <div className="page-container">
      <h2 className="page-title">SmartShelf Dashboard</h2>
      <div className="dashboard-heading">
        <p className="page-subtitle">Live overview of your inventory and expiry status.</p>
        <div className="d-flex flex-wrap gap-2">
          <button type="button" className="btn btn-outline-primary" onClick={enableBrowserAlerts}>Enable browser alerts</button>
        </div>
      </div>
      {browserStatus && <div className="alert alert-info">{browserStatus}</div>}

      <div className="row g-3 mb-4">
        <StatCard cls="stat-total" value={data.totalProducts} label="Total Products" />
        <StatCard cls="stat-expired" value={data.expiredCount} label="Expired" />
        <StatCard cls="stat-today" value={data.expiringTodayCount} label="Expires Today" />
        <StatCard cls="stat-soon" value={data.expiringWithinThreeDaysCount} label="Within 3 Days" />
        <StatCard cls="stat-week" value={data.expiringWithinSevenDaysCount} label="Within 7 Days" />
        <StatCard cls="stat-safe" value={data.safeCount} label="Safe Products" />
        <StatCard cls="stat-low" value={data.lowStockCount || 0} label="Low Stock" />
      </div>

      <div className="alert-panel mb-4">
        <h5>⚠️ Expiry Alerts</h5>
        {data.alerts && data.alerts.length > 0 ? (
          <ul className="mb-0">
            {data.alerts.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        ) : (
          <p className="text-success mb-0">No urgent alerts. Everything looks good! ✅</p>
        )}
      </div>

      {(data.lowStockProducts || []).length > 0 && (
        <>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
            <h4 className="page-title mb-0">Replenishment List</h4>
            <Link to="/products" className="btn btn-sm btn-outline-primary">Manage inventory</Link>
          </div>
          <div className="table-responsive mb-4">
            <table className="table table-hover bg-white align-middle">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Location</th>
                  <th>Units Left</th>
                  <th>Alert Level</th>
                </tr>
              </thead>
              <tbody>
                {data.lowStockProducts.map((p) => (
                  <tr key={p.id}>
                    <td>{p.productName}</td>
                    <td>{p.storageLocation || "Main Storage"}</td>
                    <td><strong>{p.quantity}</strong></td>
                    <td>{p.lowStockThreshold ?? 5}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <h4 className="page-title">Products Requiring Attention</h4>
      <div className="table-responsive">
        <table className="table table-hover bg-white align-middle">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Expiry Date</th>
              <th>Days Remaining</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {attention.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-state">
                  No products need attention right now. 🎉
                </td>
              </tr>
            ) : (
              attention.map((p) => (
                <tr key={p.id}>
                  <td>{p.productName}</td>
                  <td>{p.category}</td>
                  <td>{p.quantity}</td>
                  <td>{formatDate(p.expiryDate)}</td>
                  <td>{daysRemainingLabel(p.daysRemaining)}</td>
                  <td><StatusBadge product={p} /></td>
                  <td>
                    <Link to={`/product-details/${p.id}`} className="btn btn-sm btn-outline-secondary">
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ cls, value, label }) {
  return (
    <div className="col-6 col-md-4 col-lg-2">
      <div className={`stat-card ${cls}`}>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}
