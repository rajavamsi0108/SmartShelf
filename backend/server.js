require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cron = require("node-cron");

const connectDB = require("./config/db");
const loadSampleData = require("./seed/sampleData");

const productRoutes = require("./routes/productRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const NotificationSubscriber = require("./models/NotificationSubscriber");
const { sendExpiryEmail } = require("./utils/emailService");

const app = express();

const PORT = process.env.PORT || 10000;

// ==================================================
// CORS CONFIGURATION
// ==================================================

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://smartshelf-frontend-z598.onrender.com",
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests without an Origin header
    // such as curl, Postman, server-to-server requests, etc.
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("Blocked CORS origin:", origin);

    return callback(
      new Error(`CORS blocked for origin: ${origin}`)
    );
  },

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Accept",
    "Origin",
    "X-Requested-With",
  ],

  optionsSuccessStatus: 204,
};

// Apply CORS to every request
app.use(cors(corsOptions));

// Explicitly handle browser preflight requests.
// This is important for requests such as:
// OPTIONS /api/dashboard
app.options(/.*/, cors(corsOptions));

// ==================================================
// BODY PARSER
// ==================================================

app.use(express.json());

// ==================================================
// BASIC TEST ROUTES
// ==================================================

app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "SmartShelf backend is running",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "SmartShelf API is running",
  });
});

// ==================================================
// API ROUTES
// ==================================================

app.use("/api/products", productRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/notifications", notificationRoutes);

// ==================================================
// 404 HANDLER
// ==================================================

app.use(notFound);

// ==================================================
// CENTRAL ERROR HANDLER
// ==================================================

app.use(errorHandler);

// ==================================================
// START SERVER
// ==================================================
//
// Start Express immediately.
// MongoDB connection should NOT prevent Render from
// starting the HTTP server.
//

app.listen(PORT, "0.0.0.0", () => {
  console.log("========================================");
  console.log(" SmartShelf backend is running!");
  console.log(` Port: ${PORT}`);
  console.log(` API: http://0.0.0.0:${PORT}/api`);
  console.log("========================================");
});

// ==================================================
// DATABASE INITIALIZATION
// ==================================================

async function initializeDatabase() {
  try {
    console.log("Connecting to MongoDB...");

    await connectDB();

    console.log("MongoDB connected successfully.");

    try {
      await loadSampleData();

      console.log("Sample data loaded successfully.");
    } catch (error) {
      console.error(
        "Sample data loading failed:",
        error.message
      );
    }
  } catch (error) {
    console.error(
      "MongoDB connection failed:",
      error.message
    );

    console.error(
      "Server is still running, but database features may not work."
    );
  }
}

initializeDatabase();

// ==================================================
// EXPIRY EMAIL CRON JOB
// ==================================================

cron.schedule("0 9 * * *", async () => {
  console.log("========================================");
  console.log("Running expiry notification job...");
  console.log("========================================");

  try {
    const subscribers =
      await NotificationSubscriber.find({
        active: true,
      });

    console.log(
      `Found ${subscribers.length} active subscriber(s).`
    );

    for (const subscriber of subscribers) {
      try {
        const itemCount = await sendExpiryEmail(
          subscriber.email
        );

        console.log(
          `Expiry email checked for ${subscriber.email}. Items: ${itemCount}`
        );

        if (itemCount > 0) {
          await NotificationSubscriber.updateOne(
            {
              _id: subscriber._id,
            },
            {
              lastSentAt: new Date(),
            }
          );
        }
      } catch (error) {
        console.error(
          `Expiry email failed for ${subscriber.email}:`,
          error.message
        );
      }
    }
  } catch (error) {
    console.error(
      "Expiry notification job failed:",
      error.message
    );
  }
});

// ==================================================
// GLOBAL PROCESS ERROR HANDLERS
// ==================================================

process.on("unhandledRejection", (error) => {
  console.error(
    "Unhandled Promise Rejection:",
    error
  );
});

process.on("uncaughtException", (error) => {
  console.error(
    "Uncaught Exception:",
    error
  );
});