import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="page-container">
      <div className="hero-box">
        <h1>SmartShelf</h1>
        <p className="lead mb-1">Smart Expiry Alert &amp; Product Management System</p>
        <p className="mb-4">
          Never let another product expire on the shelf. Track, sort, and sell using the FEFO principle.
        </p>
        <Link to="/dashboard" className="btn btn-light btn-lg fw-semibold">
          Go to Dashboard
        </Link>
        <Link to="/add-product" className="btn btn-outline-light btn-lg ms-2">
          Add a Product
        </Link>
      </div>

      <div className="row g-4">
        <div className="col-md-4">
          <div className="stat-card">
            <h5>📊 Live Dashboard</h5>
            <p className="text-muted mb-0">
              See at a glance how many products are expired, expiring soon, or safe.
            </p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-card">
            <h5>⚠️ Automatic Alerts</h5>
            <p className="text-muted mb-0">
              SmartShelf automatically calculates days remaining and warns you before it's too late.
            </p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-card">
            <h5>🔁 FEFO Priority Selling</h5>
            <p className="text-muted mb-0">
              Products are ranked by expiry date so employees always know what to sell first.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <h4 className="page-title">The Problem</h4>
        <p className="text-muted">
          Store employees often forget which products are about to expire, resulting in product
          wastage and financial loss. SmartShelf solves this by automatically tracking expiry
          dates, calculating days remaining, classifying products by status, and recommending
          which products should be sold first — following the First Expire, First Out (FEFO)
          principle.
        </p>
      </div>
    </div>
  );
}
