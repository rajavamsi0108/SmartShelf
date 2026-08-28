# SmartShelf (MERN Version) — Smart Expiry Alert & Product Management System

This is the **MERN stack** rebuild of SmartShelf — same features as the
Java/Spring Boot version, built with **MongoDB, Express, React, and Node.js**.

---

## 1. Problem Statement

Store employees often forget which products are about to expire, leading to
product wastage and financial loss. SmartShelf tracks every product's expiry
date automatically and tells staff exactly what needs attention.

## 2. Features

- Live dashboard with stats and auto-generated alerts
- Add / View / Update / Delete products
- Automatic expiry countdown (calculated from `expiryDate`, never stored)
- Automatic status classification (Expired / Expires Today / Expiring Soon /
  Expiring Within 7 Days / Safe) with color-coded badges
- Live search by product name or category
- Status filters (All / Expired / Today / 3 Days / 7 Days / Safe)
- FEFO "Priority Selling" view — soonest-expiring items first
- Product details page with a selling recommendation
- Simple reports page (totals + potentially wasted quantity)
- Delete confirmation modal
- Dynamic sample data seeded automatically on first run

## 3. Technology Stack

| Layer      | Technology |
|------------|------------|
| Database   | MongoDB (via Mongoose) |
| Backend    | Node.js, Express.js |
| Frontend   | React (Vite), React Router, Bootstrap 5 |

## 4. Project Structure

```
smartshelf-mern/
├── backend/
│   ├── config/db.js              → MongoDB connection
│   ├── models/Product.js         → Mongoose schema
│   ├── utils/statusUtil.js       → expiry/status calculation logic
│   ├── controllers/              → business logic (product + dashboard)
│   ├── routes/                   → Express route definitions
│   ├── middleware/                → 404 + global error handler
│   ├── seed/sampleData.js        → auto-seeds demo products
│   ├── server.js                 → app entry point
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── api/api.js            → fetch() wrapper for backend calls
│   │   ├── api/helpers.js        → date/currency formatting helpers
│   │   ├── components/           → Navbar, StatusBadge, DeleteModal
│   │   ├── pages/                → Home, Dashboard, Products, AddProduct,
│   │   │                           EditProduct, ProductDetails, Reports
│   │   ├── styles/style.css
│   │   ├── App.jsx               → React Router routes
│   │   └── main.jsx              → React entry point
│   ├── index.html
│   ├── vite.config.js            → dev server + /api proxy to backend
│   └── package.json
│
└── README.md (this file)
```

## 5. Architecture

```
React (Vite, port 5173)
        │  fetch("/api/...")  → proxied to backend by vite.config.js
        ▼
Express routes  (routes/*.js)
        │
        ▼
Controllers     (controllers/*.js — business logic, expiry rules, FEFO)
        │
        ▼
Mongoose models (models/Product.js)
        │
        ▼
MongoDB (database: smartshelf, collection: products)
```

## 6. Status Classification Rules

| Days Remaining | Status                  | Badge |
|-----------------|--------------------------|-------|
| < 0             | EXPIRED                  | 🔴    |
| = 0             | EXPIRES TODAY             | 🔴    |
| 1 – 3           | EXPIRING SOON             | 🟠    |
| 4 – 7           | EXPIRING WITHIN 7 DAYS    | 🟡    |
| > 7             | SAFE                      | 🟢    |

Calculated fresh on every request in `backend/utils/statusUtil.js` — never
stored in MongoDB.

## 7. API Documentation

Base URL: `http://localhost:5000/api`

| Method | Endpoint                          | Description                          |
|--------|------------------------------------|---------------------------------------|
| POST   | `/products`                        | Add a new product                     |
| GET    | `/products`                        | Get all products                      |
| GET    | `/products/:id`                    | Get a single product                  |
| PUT    | `/products/:id`                    | Update a product                      |
| DELETE | `/products/:id`                    | Delete a product                      |
| GET    | `/products/search?keyword=milk`    | Search by name or category            |
| GET    | `/products/expired`                | List expired products                 |
| GET    | `/products/expiring-today`         | List products expiring today          |
| GET    | `/products/expiring-soon`          | List products expiring in 1–3 days    |
| GET    | `/products/expiring-week`          | List products expiring in 4–7 days    |
| GET    | `/products/safe`                   | List safe products (>7 days)          |
| GET    | `/products/priority`               | FEFO order (soonest expiry first)     |
| GET    | `/products/report`                 | Simple report summary                 |
| GET    | `/dashboard`                       | Dashboard summary + alerts            |

**Sample request — Add Product**
```json
POST /api/products
{
  "productName": "Milk",
  "category": "Dairy",
  "quantity": 20,
  "price": 35.00,
  "purchaseDate": "2026-08-25",
  "expiryDate": "2026-08-29"
}
```

**Sample error response**
```json
{
  "message": "Product not found with id: 64f...",
  "status": 404,
  "timestamp": "2026-08-27T10:15:30.000Z"
}
```

## 8. Installation & Setup

See the separate step-by-step VS Code guide provided in chat. Quick summary:

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env      # then edit MONGO_URI if needed
npm run dev                # starts on http://localhost:5000

# 2. Frontend (in a second terminal)
cd frontend
npm install
npm run dev                # starts on http://localhost:5173
```

Then open **http://localhost:5173** in your browser.

## 9. Testing Instructions

### Manual test checklist
| # | Scenario                              | Expected Result          |
|---|----------------------------------------|---------------------------|
| 1 | Product expires today                  | Status = EXPIRES TODAY   |
| 2 | Product expired yesterday              | Status = EXPIRED         |
| 3 | Product expires in 2 days              | Status = EXPIRING SOON   |
| 4 | Product expires in 6 days              | Status = EXPIRING WITHIN 7 DAYS |
| 5 | Product expires in 20 days             | Status = SAFE             |
| 6 | Purchase date after expiry date        | 400 validation error      |
| 7 | Delete a product                       | Product removed from DB   |

## 10. Common Errors & Fixes

| Error | Likely Cause | Fix |
|-------|---------------|-----|
| `MongoDB connection failed` | MongoDB not running | Start MongoDB service (`mongod` or `brew services start mongodb-community`) |
| `EADDRINUSE: address already in use :::5000` | Port already used | Change `PORT` in backend `.env`, or stop the other process |
| Frontend shows "Failed to fetch" | Backend not running | Make sure `npm run dev` is running in the backend folder first |
| CORS error in browser console | Backend CORS not applied / wrong port | Confirm `app.use(cors())` is in `server.js` and frontend proxy target matches backend port |
| Blank products list | Sample data not loaded | Check backend terminal for "sample product data inserted" message; ensure MongoDB is empty on first run |

## 11. Future Enhancements

- Barcode scanning
- Email / SMS expiry notifications
- Mobile application
- User authentication & roles (e.g. JWT-based)
- Multi-store support
- Sales prediction / AI-based waste prediction
