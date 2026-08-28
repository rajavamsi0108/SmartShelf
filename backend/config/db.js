const mongoose = require("mongoose");

/**
 * Connects to MongoDB using the URI from the .env file.
 * Called once when the server starts (see server.js).
 */
async function connectDB() {
  try {
    const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smartshelf";
    await mongoose.connect(uri);
    console.log("MongoDB connected:", uri);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

module.exports = connectDB;
