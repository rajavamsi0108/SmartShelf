const nodemailer = require("nodemailer");
const Product = require("../models/Product");
const { toProductResponse } = require("./statusUtil");

function getTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    const error = new Error("Email is not configured. Add SMTP_HOST, SMTP_USER, and SMTP_PASS to backend/.env.");
    error.statusCode = 503;
    throw error;
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

async function sendExpiryEmail(email) {
  const products = (await Product.find()).map(toProductResponse);
  const attention = products.filter((product) => product.daysRemaining >= 0 && product.daysRemaining <= 3);
  const rows = attention.length === 0
    ? "<p>Good news: no products currently need expiry attention.</p>"
    : `<table style="border-collapse:collapse;width:100%"><tr><th style="text-align:left;border-bottom:1px solid #ddd;padding:8px">Product</th><th style="text-align:left;border-bottom:1px solid #ddd;padding:8px">Expiry</th><th style="text-align:left;border-bottom:1px solid #ddd;padding:8px">Status</th></tr>${attention.map((product) => `<tr><td style="padding:8px;border-bottom:1px solid #eee">${product.productName}</td><td style="padding:8px;border-bottom:1px solid #eee">${new Date(product.expiryDate).toLocaleDateString()}</td><td style="padding:8px;border-bottom:1px solid #eee">${product.statusLabel}</td></tr>`).join("")}</table>`;

  await getTransporter().sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: `SmartShelf reminder: ${attention.length} item(s) expire within 3 days`,
    text: attention.length === 0 ? "No products expire within the next 3 days." : attention.map((product) => `${product.productName}: ${product.statusLabel}, expiry ${new Date(product.expiryDate).toLocaleDateString()}`).join("\n"),
    html: `<div style="font-family:Arial,sans-serif;max-width:640px"><h2>SmartShelf expiry reminder</h2><p>These products expire today or within the next 3 days.</p>${rows}</div>`,
  });
  return attention.length;
}

module.exports = { sendExpiryEmail };