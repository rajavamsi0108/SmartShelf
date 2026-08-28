const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

/**
 * All routes here are mounted under /api/products in server.js.
 * IMPORTANT: specific routes like /search and /expired must be
 * declared BEFORE the generic /:id route, otherwise Express would
 * try to treat "search" or "expired" as an :id value.
 */

router.get("/search", productController.searchProducts);
router.get("/expired", productController.getExpiredProducts);
router.get("/expiring-today", productController.getExpiringToday);
router.get("/expiring-soon", productController.getExpiringSoon);
router.get("/expiring-week", productController.getExpiringWithinWeek);
router.get("/safe", productController.getSafeProducts);
router.get("/priority", productController.getPriorityProducts);
router.get("/low-stock", productController.getLowStockProducts);
router.get("/report", productController.getReport);

router.post("/", productController.addProduct);
router.get("/", productController.getAllProducts);
router.post("/:id/stock", productController.moveStock);
router.get("/:id/stock", productController.getStockHistory);
router.get("/:id", productController.getProductById);
router.put("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

module.exports = router;
