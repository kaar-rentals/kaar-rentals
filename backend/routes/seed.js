const express = require("express");
const User = require("../models/User");
const Car = require("../models/Car");
const Payment = require("../models/Payment");

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    await User.deleteMany({});
    await Car.deleteMany({});
    await Payment.deleteMany({});

    const users = await User.insertMany([
      { name: "Admin", email: "admin@test.com", password: "123456", role: "admin" },
      { name: "User", email: "user@test.com", password: "123456", role: "user" },
    ]);

    const cars = await Car.insertMany([
      { brand: "Toyota", model: "Corolla", year: 2022, pricePerDay: 5000 },
      { brand: "Honda", model: "Civic", year: 2023, pricePerDay: 7000 },
    ]);

    res.json({ users, cars });
  } catch (err) {
    res.status(500).json({ error: "Seeding failed", details: err.message });
  }
});

module.exports = router;
