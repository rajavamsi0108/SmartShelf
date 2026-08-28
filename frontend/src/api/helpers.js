/**
 * helpers.js
 * Small formatting utilities shared across pages.
 */

export function formatDate(dateValue) {
  if (!dateValue) return "-";
  const d = new Date(dateValue);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export function toInputDate(dateValue) {
  // Converts any date value to the yyyy-MM-dd format required by <input type="date">
  if (!dateValue) return "";
  return new Date(dateValue).toISOString().split("T")[0];
}

export function formatCurrency(value) {
  return "₹" + Number(value).toFixed(2);
}

export function daysRemainingLabel(days) {
  if (days < 0) return `${Math.abs(days)} day(s) ago`;
  if (days === 0) return "Today";
  if (days === 1) return "1 day left";
  return `${days} days left`;
}
