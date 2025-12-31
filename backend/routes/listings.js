// Alias route for /api/listings/:id/contact -> delegates to cars route
const express = require("express");
const router = express.Router();
const Car = require("../models/Car");
const authMiddleware = require("../middleware/auth");

// GET /api/listings/:id/contact - Alias for /api/cars/:id/contact
router.get("/:id/contact", authMiddleware, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const car = await Car.findById(req.params.id).populate('owner', 'phone unique_id');
    if (!car) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (!car.owner || typeof car.owner !== 'object') {
      // Owner not found in database - internal error
      console.warn(`Owner not found for listing ${req.params.id}`);
      return res.status(500).json({ message: 'Server error: owner data unavailable' });
    }

    const phone = car.owner.phone;
    if (!phone) {
      // Owner exists but phone is missing - internal error
      console.warn(`Owner phone missing for listing ${req.params.id}`);
      return res.status(500).json({ message: 'Server error: owner contact unavailable' });
    }

    // Set security headers - do not cache sensitive owner phone data
    res.set('Vary', 'Authorization');
    res.set('Cache-Control', 'private, max-age=0, no-store');
    
    return res.json({ phone });
  } catch (err) {
    // Log error without exposing sensitive data
    console.error('Error fetching contact for listing:', req.params.id);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

