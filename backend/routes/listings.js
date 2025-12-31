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

    const car = await Car.findById(req.params.id)
      .populate('ownerId', 'name phone location');

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    if (!car.ownerId || !car.ownerId.phone) {
      return res.status(404).json({ message: 'Owner phone not available' });
    }

    // Set security headers - do not cache sensitive owner phone data
    res.set('Vary', 'Authorization');
    res.set('Cache-Control', 'private, max-age=0, no-store');
    
    return res.json({
      phone: car.ownerId.phone
    });
  } catch (err) {
    // Log error without exposing sensitive data
    console.error('Error in contact handler:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

