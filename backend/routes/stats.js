// backend/routes/stats.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Car = require('../models/Car');

// Simple in-memory cache with TTL
let statsCache = {
  data: null,
  timestamp: null,
  ttl: 10000 // 10 seconds
};

// GET /api/stats - Get site statistics
router.get('/', async (req, res) => {
  try {
    const now = Date.now();
    
    // Check cache
    if (statsCache.data && statsCache.timestamp && (now - statsCache.timestamp) < statsCache.ttl) {
      return res.json(statsCache.data);
    }

    // Fetch fresh data
    const [usersCount, listingsCount, featuredCount] = await Promise.all([
      User.countDocuments(),
      Car.countDocuments({ isActive: true, isApproved: true }),
      Car.countDocuments({ isActive: true, isApproved: true, featured: true })
    ]);

    const stats = {
      users_count: usersCount,
      listings_count: listingsCount,
      featured_count: featuredCount
    };

    // Update cache
    statsCache.data = stats;
    statsCache.timestamp = now;

    res.json(stats);
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;

