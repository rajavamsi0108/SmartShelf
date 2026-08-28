const mongoose = require("mongoose");

const stockTransactionSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    type: {
      type: String,
      enum: ["IN", "OUT"],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Movement quantity must be at least 1"],
    },
    reason: {
      type: String,
      trim: true,
      default: "Manual adjustment",
    },
    balanceAfter: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StockTransaction", stockTransactionSchema);