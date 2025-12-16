const express = require("express");

const router = express.Router();

// GET /api/user/listings - returns mock data for now
router.get("/listings", (_req, res) => {
  // TODO: replace mockListings with a real DB query joined to bookings/views once available
  // Example: const listings = await ListingModel.find({ owner: req.user.id }).lean();
  const mockListings = [
    {
      id: 123,
      title: "2019 Toyota Corolla",
      image_url: "/placeholder-car.png",
      views: 1234,
      rented_count: 7,
      contact_count: 12,
      ad_url: "/ads/123",
    },
  ];

  return res.json({ listings: mockListings });
});

module.exports = router;

