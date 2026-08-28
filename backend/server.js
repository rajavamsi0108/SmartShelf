require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const loadSampleData = require("./seed/sampleData");
const productRoutes = require("./routes/productRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const notificationRoutes = require("./routes/notificationRoutes");
const NotificationSubscriber = require("./models/NotificationSubscriber");
const { sendExpiryEmail } = require("./utils/emailService");
const cron = require("node-cron");

const app = express();
const PORT = process.env.PORT || 5000;

// Allow the React frontend (running on a different port) to call this API
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/products", productRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);

// Simple health check
app.get("/api/health", (req, res) => res.json({ status: "SmartShelf API is running" }));

// 404 + centralized error handling (must be registered last)
app.use(notFound);
app.use(errorHandler);

async function start() {
  await connectDB();
  await loadSampleData();

  cron.schedule("0 9 * * *", async () => {
    const subscribers = await NotificationSubscriber.find({ active: true });
    for (const subscriber of subscribers) {
      try {
        const itemCount = await sendExpiryEmail(subscriber.email);
        if (itemCount > 0) {
          await NotificationSubscriber.updateOne({ _id: subscriber._id }, { lastSentAt: new Date() });
        }
      } catch (error) {
        console.error(`Expiry email failed for ${subscriber.email}:`, error.message);
      }
    }
  });

  app.listen(PORT, () => {
    console.log("========================================");
    console.log(" SmartShelf backend is running!");
    console.log(` API base: http://localhost:${PORT}/api`);
    console.log("========================================");
  });
}

start();
