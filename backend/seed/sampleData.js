const Product = require("../models/Product");

/**
 * sampleData.js
 * Inserts demo products the first time the app runs against an
 * empty database, so the project can be tested immediately -
 * equivalent to SampleDataLoader.java.
 *
 * Expiry dates are calculated relative to "today" (dynamic), so the
 * demo always looks realistic no matter when you run it.
 */
async function loadSampleData() {
  if (process.env.LOAD_SAMPLE_DATA !== "true") {
    return;
  }

  const existingCount = await Product.countDocuments();
  if (existingCount > 0) {
    return; // already seeded on a previous run
  }

  const today = new Date();
  const daysFromNow = (n) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d;
  };

  await Product.insertMany([
    {
      productName: "Milk",
      category: "Dairy",
      quantity: 20,
      price: 35.0,
      purchaseDate: daysFromNow(-3),
      expiryDate: daysFromNow(2),
    },
    {
      productName: "Bread",
      category: "Bakery",
      quantity: 15,
      price: 40.0,
      purchaseDate: daysFromNow(-2),
      expiryDate: daysFromNow(1),
    },
    {
      productName: "Biscuits",
      category: "Snacks",
      quantity: 50,
      price: 20.0,
      purchaseDate: daysFromNow(-10),
      expiryDate: daysFromNow(15),
    },
    {
      productName: "Curd",
      category: "Dairy",
      quantity: 10,
      price: 30.0,
      purchaseDate: daysFromNow(-4),
      expiryDate: daysFromNow(0),
    },
    {
      productName: "Juice",
      category: "Beverages",
      quantity: 25,
      price: 60.0,
      purchaseDate: daysFromNow(-20),
      expiryDate: daysFromNow(-2),
    },
    {
      productName: "Paneer",
      category: "Dairy",
      quantity: 12,
      price: 80.0,
      purchaseDate: daysFromNow(-1),
      expiryDate: daysFromNow(5),
    },
    {
      productName: "Rice (5kg)",
      category: "Grocery",
      quantity: 30,
      price: 250.0,
      purchaseDate: daysFromNow(-30),
      expiryDate: daysFromNow(180),
    },
    {
      productName: "Chocolate Milk",
      category: "Dairy",
      quantity: 18,
      price: 45.0,
      purchaseDate: daysFromNow(-1),
      expiryDate: daysFromNow(6),
    },
  ]);

  console.log("SmartShelf: sample product data inserted.");
}

module.exports = loadSampleData;
