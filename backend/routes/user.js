const express = require("express");
const Car = require("../models/Car");
const User = require("../models/User");
const Booking = require("../models/Booking");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/user/profile/:unique_id - Get public user profile by unique_id
router.get("/profile/:unique_id", async (req, res) => {
  try {
    const { unique_id } = req.params;
    const user = await User.findOne({ unique_id }).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Return public profile (no sensitive data)
    res.json({
      user: {
        _id: user._id,
        name: user.name,
        unique_id: user.unique_id,
        role: user.role,
        // Don't return email, phone, etc. for public profiles
      }
    });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// GET /api/user/listings - returns listings for authenticated user only
router.get("/listings", auth(['user', 'owner', 'admin']), async (req, res) => {
  try {
    const ownerId = req.user.id || req.user._id;
    
    // Get all cars owned by the authenticated user
    const cars = await Car.find({ owner: ownerId }).lean();
    
    // Build listings with stats
    const listings = await Promise.all(
      cars.map(async (car) => {
        // Count completed bookings (rented_count)
        const rentedCount = await Booking.countDocuments({
          car: car._id,
          status: 'ACCEPTED'
        });
        
        // For views and contact_count, use placeholder values until tracking is implemented
        // TODO: Implement view tracking system (e.g., CarView model or analytics)
        // TODO: Implement contact tracking (e.g., ContactInquiry model)
        const views = 0; // Placeholder - implement view tracking
        const contactCount = await Booking.countDocuments({
          car: car._id,
          status: { $in: ['PENDING', 'ACCEPTED'] }
        });
        
        return {
          id: car._id.toString(),
          title: `${car.year} ${car.brand} ${car.model}`,
          image_url: car.images && car.images.length > 0 ? car.images[0] : "/placeholder-car.png",
          views: views,
          rented_count: rentedCount,
          contact_count: contactCount,
          ad_url: `/car/${car._id}`,
        };
      })
    );
    
    return res.json({ listings });
  } catch (err) {
    console.error('Error fetching user listings:', err);
    return res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

module.exports = router;

