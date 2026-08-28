const mongoose = require("mongoose");

const notificationSubscriberSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    active: { type: Boolean, default: true },
    lastSentAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("NotificationSubscriber", notificationSubscriberSchema);