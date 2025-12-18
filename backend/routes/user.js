const express = require("express");
const Car = require("../models/Car");
const Booking = require("../models/Booking");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

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

