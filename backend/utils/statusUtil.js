/**
 * statusUtil.js
 *
 * Central place where "days remaining" and "status" are calculated
 * from a product's expiryDate. This mirrors ProductStatus.java from
 * the Java version, so the business rules are identical:
 *
 *   days < 0        -> EXPIRED
 *   days == 0       -> EXPIRES_TODAY
 *   1 <= days <= 3  -> EXPIRING_SOON
 *   4 <= days <= 7  -> EXPIRING_WITHIN_WEEK
 *   days > 7        -> SAFE
 */

const STATUS_META = {
  EXPIRED: { label: "EXPIRED", icon: "🔴" },
  EXPIRES_TODAY: { label: "EXPIRES TODAY", icon: "🔴" },
  EXPIRING_SOON: { label: "EXPIRING SOON", icon: "🟠" },
  EXPIRING_WITHIN_WEEK: { label: "EXPIRING WITHIN 7 DAYS", icon: "🟡" },
  SAFE: { label: "SAFE", icon: "🟢" },
};

/** Returns the number of whole calendar days between today and the expiry date. */
function calculateDaysRemaining(expiryDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);

  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((expiry.getTime() - today.getTime()) / msPerDay);
}

/** Maps a days-remaining number to a status key (EXPIRED, SAFE, etc). */
function statusFromDaysRemaining(daysRemaining) {
  if (daysRemaining < 0) return "EXPIRED";
  if (daysRemaining === 0) return "EXPIRES_TODAY";
  if (daysRemaining <= 3) return "EXPIRING_SOON";
  if (daysRemaining <= 7) return "EXPIRING_WITHIN_WEEK";
  return "SAFE";
}

/**
 * Converts a Mongoose Product document into a plain response object,
 * adding the computed daysRemaining/status fields. Equivalent of
 * ProductResponse.fromEntity() in the Java version.
 */
function toProductResponse(productDoc) {
  const product = productDoc.toObject ? productDoc.toObject() : productDoc;
  const daysRemaining = calculateDaysRemaining(product.expiryDate);
  const statusKey = statusFromDaysRemaining(daysRemaining);
  const meta = STATUS_META[statusKey];

  return {
    id: product._id,
    productName: product.productName,
    category: product.category,
    quantity: product.quantity,
    price: product.price,
    lowStockThreshold: product.lowStockThreshold ?? 5,
    storageLocation: product.storageLocation || "Main Storage",
    purchaseDate: product.purchaseDate,
    expiryDate: product.expiryDate,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    daysRemaining,
    status: statusKey,
    statusLabel: meta.label,
    statusIcon: meta.icon,
  };
}

module.exports = {
  calculateDaysRemaining,
  statusFromDaysRemaining,
  toProductResponse,
};
