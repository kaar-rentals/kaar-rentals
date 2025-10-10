const express = require("express");
const router = express.Router();
const Car = require("../models/Car");

// GET /api/cars
router.get("/", async (req, res) => {
  try {
    const {
      city, category, minPrice, maxPrice, transmission, fuelType, seats, search,
      page = 1, limit = 12, sortBy = "createdAt", order = "desc"
    } = req.query;

    const filters = { isActive: true, isApproved: true };
    if (city) filters.city = city;
    if (category) filters.category = category;
    if (transmission) filters.transmission = transmission;
    if (fuelType) filters.fuelType = fuelType;
    if (seats) filters.seating = parseInt(seats);
    if (minPrice || maxPrice) {
      filters.pricePerDay = {};
      if (minPrice) filters.pricePerDay.$gte = parseInt(minPrice);
      if (maxPrice) filters.pricePerDay.$lte = parseInt(maxPrice);
    }
    if (search) {
      filters.$or = [
        { brand: { $regex: search, $options: "i" } },
        { model: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    const skip = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
    const projectionPublic = { owner: 0, renterPhone: 0, exactLocation: 0 };
    const projection = req.user ? {} : projectionPublic;

    const total = await Car.countDocuments(filters);
    const cars = await Car.find(filters, projection)
      .sort({ [sortBy]: order === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    res.json({ total, page: parseInt(page), limit: parseInt(limit), cars });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/cars/:id
router.get("/:id", async (req, res) => {
  try {
    const car = await Car.findById(req.params.id).lean();
    if (!car) return res.status(404).json({ message: "Car not found" });
    if (!req.user) {
      delete car.owner;
      delete car.renterPhone;
      car.location = car.city;
    }
    res.json(car);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
