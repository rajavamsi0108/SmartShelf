const Product = require("../models/Product");
const { toProductResponse } = require("../utils/statusUtil");

/**
 * dashboardController.js
 * Builds the single dashboard summary payload used by the
 * Dashboard page: stat counts, auto-generated alert sentences,
 * and the "products requiring attention" list.
 */

// GET /api/dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const products = await Product.find();
    const responses = products.map(toProductResponse);

    const totalProducts = responses.length;
    const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);
    const lowStockProducts = responses.filter((p) => p.quantity <= p.lowStockThreshold);

    const expiredCount = responses.filter((p) => p.status === "EXPIRED").length;
    const expiringTodayCount = responses.filter((p) => p.status === "EXPIRES_TODAY").length;
    const expiringWithinThreeDaysCount = responses.filter((p) => p.status === "EXPIRING_SOON").length;
    const expiringWithinSevenDaysCount = responses.filter((p) => p.status === "EXPIRING_WITHIN_WEEK").length;
    const safeCount = responses.filter((p) => p.status === "SAFE").length;

    // Products requiring attention = anything not SAFE, soonest first
    const productsRequiringAttention = responses
      .filter((p) => p.status !== "SAFE")
      .sort((a, b) => a.daysRemaining - b.daysRemaining);

    // Build human-readable alert sentences
    const alerts = [];
    if (lowStockProducts.length > 0) {
      alerts.push(`${lowStockProducts.length} product(s) are low in stock and may need replenishment.`);
    }
    if (expiredCount > 0) {
      alerts.push(`${expiredCount} product(s) have already expired.`);
    }
    responses.forEach((p) => {
      if (p.status === "EXPIRES_TODAY") {
        alerts.push(`${p.quantity} ${p.productName} unit(s) expire today.`);
      } else if (p.status === "EXPIRING_SOON") {
        alerts.push(`${p.quantity} ${p.productName} unit(s) will expire in ${p.daysRemaining} day(s).`);
      }
    });

    res.json({
      totalProducts,
      totalQuantity,
      expiredCount,
      expiringTodayCount,
      expiringWithinThreeDaysCount,
      expiringWithinSevenDaysCount,
      safeCount,
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
      alerts,
      productsRequiringAttention,
    });
  } catch (err) {
    next(err);
  }
};
