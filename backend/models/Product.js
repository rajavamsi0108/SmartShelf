const mongoose = require("mongoose");

/**
 * Product schema - the MongoDB equivalent of the "products" table
 * in the Java/MySQL version.
 *
 * Notes:
 * - "timestamps: true" automatically adds and maintains createdAt / updatedAt,
 *   equivalent to the @PrePersist / @PreUpdate logic in the Java entity.
 * - daysRemaining and status are NOT stored here - they are calculated
 *   on the fly in utils/statusUtil.js, exactly like the Java DTO did.
 */
const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: [true, "Product name cannot be empty"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category cannot be empty"],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    lowStockThreshold: {
      type: Number,
      min: [0, "Low-stock threshold cannot be negative"],
      default: 5,
    },
    storageLocation: {
      type: String,
      trim: true,
      default: "Main Storage",
    },
    purchaseDate: {
      type: Date,
      required: [true, "Purchase date is required"],
    },
    expiryDate: {
      type: Date,
      required: [true, "Expiry date cannot be empty"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
