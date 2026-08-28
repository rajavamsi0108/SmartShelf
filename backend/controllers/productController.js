const Product = require("../models/Product");
const StockTransaction = require("../models/StockTransaction");
const { toProductResponse, calculateDaysRemaining } = require("../utils/statusUtil");

/**
 * productController.js
 *
 * Contains all business logic for products: CRUD, search, expiry
 * filters, FEFO priority ordering, and the simple report. This plays
 * the same role as ProductService + ProductController combined in
 * the Java version, adapted to Express's simpler (req, res) style.
 */

// Small helper so every response goes through the computed-fields mapper
function toResponseList(products) {
  return products.map(toProductResponse);
}

// Business-rule validation not covered by the Mongoose schema
function validateDates(purchaseDate, expiryDate) {
  if (new Date(purchaseDate) > new Date(expiryDate)) {
    const error = new Error("Purchase date cannot be after expiry date.");
    error.statusCode = 400;
    throw error;
  }
}

// POST /api/products
exports.addProduct = async (req, res, next) => {
  try {
    const { productName, category, quantity, price, lowStockThreshold, storageLocation, purchaseDate, expiryDate } = req.body;
    validateDates(purchaseDate, expiryDate);

    const product = await Product.create({
      productName,
      category,
      quantity,
      price,
      lowStockThreshold,
      storageLocation,
      purchaseDate,
      expiryDate,
    });

    res.status(201).json(toProductResponse(product));
  } catch (err) {
    next(err);
  }
};

// GET /api/products
exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    res.json(toResponseList(products));
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:id
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      const error = new Error(`Product not found with id: ${req.params.id}`);
      error.statusCode = 404;
      throw error;
    }
    res.json(toProductResponse(product));
  } catch (err) {
    next(err);
  }
};

// PUT /api/products/:id
exports.updateProduct = async (req, res, next) => {
  try {
    const { productName, category, quantity, price, lowStockThreshold, storageLocation, purchaseDate, expiryDate } = req.body;
    validateDates(purchaseDate, expiryDate);

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { productName, category, quantity, price, lowStockThreshold, storageLocation, purchaseDate, expiryDate },
      { new: true, runValidators: true }
    );

    if (!product) {
      const error = new Error(`Product not found with id: ${req.params.id}`);
      error.statusCode = 404;
      throw error;
    }

    res.json(toProductResponse(product));
  } catch (err) {
    next(err);
  }
};

// DELETE /api/products/:id
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      const error = new Error(`Product not found with id: ${req.params.id}`);
      error.statusCode = 404;
      throw error;
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// GET /api/products/search?keyword=milk
exports.searchProducts = async (req, res, next) => {
  try {
    const keyword = req.query.keyword || "";
    const regex = new RegExp(keyword, "i"); // case-insensitive partial match
    const products = await Product.find({
      $or: [{ productName: regex }, { category: regex }],
    });
    res.json(toResponseList(products));
  } catch (err) {
    next(err);
  }
};

// GET /api/products/expired
exports.getExpiredProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    const expired = products.filter((p) => calculateDaysRemaining(p.expiryDate) < 0);
    res.json(toResponseList(expired));
  } catch (err) {
    next(err);
  }
};

// GET /api/products/expiring-today
exports.getExpiringToday = async (req, res, next) => {
  try {
    const products = await Product.find();
    const result = products.filter((p) => calculateDaysRemaining(p.expiryDate) === 0);
    res.json(toResponseList(result));
  } catch (err) {
    next(err);
  }
};

// GET /api/products/expiring-soon (1-3 days remaining)
exports.getExpiringSoon = async (req, res, next) => {
  try {
    const products = await Product.find();
    const result = products.filter((p) => {
      const d = calculateDaysRemaining(p.expiryDate);
      return d >= 1 && d <= 3;
    });
    res.json(toResponseList(result));
  } catch (err) {
    next(err);
  }
};

// GET /api/products/expiring-week (4-7 days remaining)
exports.getExpiringWithinWeek = async (req, res, next) => {
  try {
    const products = await Product.find();
    const result = products.filter((p) => {
      const d = calculateDaysRemaining(p.expiryDate);
      return d >= 4 && d <= 7;
    });
    res.json(toResponseList(result));
  } catch (err) {
    next(err);
  }
};

// GET /api/products/safe (> 7 days remaining)
exports.getSafeProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    const result = products.filter((p) => calculateDaysRemaining(p.expiryDate) > 7);
    res.json(toResponseList(result));
  } catch (err) {
    next(err);
  }
};

// GET /api/products/priority - FEFO: soonest expiry first
exports.getPriorityProducts = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ expiryDate: 1 });
    res.json(toResponseList(products));
  } catch (err) {
    next(err);
  }
};

// GET /api/products/low-stock
exports.getLowStockProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    const result = products.filter((product) => product.quantity <= (product.lowStockThreshold ?? 5));
    res.json(toResponseList(result));
  } catch (err) {
    next(err);
  }
};

// GET /api/products/report - simple report summary
exports.getReport = async (req, res, next) => {
  try {
    const products = await Product.find();
    const responses = toResponseList(products);

    const totalProducts = responses.length;
    const totalInventoryQuantity = products.reduce((sum, p) => sum + p.quantity, 0);
    const expiredProductCount = responses.filter((p) => p.status === "EXPIRED").length;
    const expiringSoonCount = responses.filter((p) =>
      ["EXPIRES_TODAY", "EXPIRING_SOON", "EXPIRING_WITHIN_WEEK"].includes(p.status)
    ).length;
    const safeProductCount = responses.filter((p) => p.status === "SAFE").length;
    const potentiallyWastedQuantity = responses
      .filter((p) => p.status === "EXPIRED")
      .reduce((sum, p) => sum + p.quantity, 0);

    res.json({
      totalProducts,
      totalInventoryQuantity,
      expiredProductCount,
      expiringSoonCount,
      safeProductCount,
      potentiallyWastedQuantity,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/products/:id/stock
exports.moveStock = async (req, res, next) => {
  try {
    const { type, quantity, reason } = req.body;
    const movementQuantity = Number(quantity);
    if (!["IN", "OUT"].includes(type) || !Number.isInteger(movementQuantity) || movementQuantity < 1) {
      const error = new Error("Type must be IN or OUT and quantity must be a positive whole number.");
      error.statusCode = 400;
      throw error;
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      const error = new Error(`Product not found with id: ${req.params.id}`);
      error.statusCode = 404;
      throw error;
    }
    if (type === "OUT" && movementQuantity > product.quantity) {
      const error = new Error(`Only ${product.quantity} unit(s) are available for stock out.`);
      error.statusCode = 400;
      throw error;
    }

    product.quantity += type === "IN" ? movementQuantity : -movementQuantity;
    await product.save();
    const transaction = await StockTransaction.create({
      product: product._id,
      type,
      quantity: movementQuantity,
      reason: reason || (type === "IN" ? "Stock received" : "Stock sold"),
      balanceAfter: product.quantity,
    });

    res.status(201).json({
      id: transaction._id,
      type: transaction.type,
      quantity: transaction.quantity,
      reason: transaction.reason,
      balanceAfter: transaction.balanceAfter,
      createdAt: transaction.createdAt,
      product: toProductResponse(product),
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:id/stock
exports.getStockHistory = async (req, res, next) => {
  try {
    const history = await StockTransaction.find({ product: req.params.id }).sort({ createdAt: -1 }).limit(50);
    res.json(history);
  } catch (err) {
    next(err);
  }
};
