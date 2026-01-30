const express = require("express");
const router = express.Router();
const Car = require("../models/Car");
const User = require("../models/User");

let cachedStats = null;
let cacheTimestamp = 0;
const CACHE_TTL = 10 * 1000; // 10 seconds

router.get("/", async (req, res) => {
  try {
    const now = Date.now();
    if (cachedStats && (now - cacheTimestamp < CACHE_TTL)) {
      return res.json(cachedStats);
    }

    const users_count = await User.countDocuments();
    const listings_count = await Car.countDocuments({ isActive: true, isApproved: true });
    const featured_count = await Car.countDocuments({ isActive: true, isApproved: true, featured: true });

    cachedStats = { users_count, listings_count, featured_count };
    cacheTimestamp = now;

    res.json(cachedStats);
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;


