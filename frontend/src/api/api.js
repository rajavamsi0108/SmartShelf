/**
 * api.js
 * Small shared helper for calling the SmartShelf Express backend.
 * Uses the Vite dev-server proxy, so paths are relative ("/api/...").
 */

const API_BASE = "/api";

async function request(path, options = {}) {
  const response = await fetch(API_BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      (data && (data.message || (data.errors && Object.values(data.errors).join(", ")))) ||
      "Something went wrong. Please try again.";
    throw new Error(message);
  }
  return data;
}

export const ProductAPI = {
  getAll: () => request("/products"),
  getById: (id) => request(`/products/${id}`),
  create: (payload) => request("/products", { method: "POST", body: JSON.stringify(payload) }),
  update: (id, payload) => request(`/products/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  remove: (id) => request(`/products/${id}`, { method: "DELETE" }),
  search: (keyword) => request(`/products/search?keyword=${encodeURIComponent(keyword)}`),
  expired: () => request("/products/expired"),
  expiringToday: () => request("/products/expiring-today"),
  expiringSoon: () => request("/products/expiring-soon"),
  expiringWeek: () => request("/products/expiring-week"),
  safe: () => request("/products/safe"),
  priority: () => request("/products/priority"),
  lowStock: () => request("/products/low-stock"),
  report: () => request("/products/report"),
  moveStock: (id, payload) => request(`/products/${id}/stock`, { method: "POST", body: JSON.stringify(payload) }),
  stockHistory: (id) => request(`/products/${id}/stock`),
};

export const DashboardAPI = {
  get: () => request("/dashboard"),
};

export const NotificationAPI = {
  subscribe: (email) => request("/notifications/subscribe", {
    method: "POST",
    body: JSON.stringify({ email }),
  }),
  sendExpiryReport: (email) => request("/notifications/expiry", {
    method: "POST",
    body: JSON.stringify({ email }),
  }),
};
