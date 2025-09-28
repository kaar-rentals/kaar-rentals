// backend/routes/seed.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Car = require('../models/Car');

// Seed initial data
router.post('/seed', async (req, res) => {
  try {
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.findOneAndUpdate(
      { email: 'admin@kaar.rentals' },
      {
        name: 'Admin User',
        email: 'admin@kaar.rentals',
        password: adminPassword,
        role: 'admin',
        membershipActive: true,
        membershipPlan: 'enterprise',
        membershipExpiry: new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000) // 10 years
      },
      { upsert: true, new: true }
    );

    // Create sample owner
    const ownerPassword = await bcrypt.hash('owner123', 10);
    const owner = await User.findOneAndUpdate(
      { email: 'owner@kaar.rentals' },
      {
        name: 'Car Owner',
        email: 'owner@kaar.rentals',
        password: ownerPassword,
        role: 'owner',
        membershipActive: true,
        membershipPlan: 'premium',
        membershipExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
      },
      { upsert: true, new: true }
    );

    // Create sample cars
    const sampleCars = [
      {
        owner: owner._id,
        brand: 'BMW',
        model: '320i',
        year: 2023,
        category: 'Sedan',
        pricePerDay: 45000,
        images: ['/assets/bmw-sedan.jpg'],
        location: 'DHA Phase 5, Karachi',
        city: 'Karachi',
        engineCapacity: '2.0L Turbo',
        fuelType: 'Petrol',
        transmission: 'Automatic',
        mileage: '12 km/L',
        seating: 5,
        features: ['Leather Seats', 'Navigation System', 'Bluetooth', 'Sunroof', 'Heated Seats'],
        description: 'Experience luxury and performance with the BMW 320i. Perfect balance of comfort and driving dynamics.',
        isActive: true,
        isRented: false,
        isApproved: true,
        paymentStatus: 'PAID'
      },
      {
        owner: owner._id,
        brand: 'Mercedes-Benz',
        model: 'GLC 300',
        year: 2023,
        category: 'SUV',
        pricePerDay: 60000,
        images: ['/assets/mercedes-suv.jpg'],
        location: 'Gulberg, Lahore',
        city: 'Lahore',
        engineCapacity: '2.0L Turbo',
        fuelType: 'Petrol',
        transmission: 'Automatic',
        mileage: '10.5 km/L',
        seating: 5,
        features: ['4MATIC AWD', 'Premium Audio', 'Panoramic Roof', 'Adaptive Cruise Control', 'Ambient Lighting'],
        description: 'The Mercedes-Benz GLC 300 combines elegance with capability. Premium SUV for the discerning driver.',
        isActive: true,
        isRented: false,
        isApproved: true,
        paymentStatus: 'PAID'
      },
      {
        owner: owner._id,
        brand: 'Audi',
        model: 'A3 Sportback',
        year: 2023,
        category: 'Hatchback',
        pricePerDay: 37500,
        images: ['/assets/audi-hatchback.jpg'],
        location: 'F-8, Islamabad',
        city: 'Islamabad',
        engineCapacity: '2.0L TFSI',
        fuelType: 'Petrol',
        transmission: 'Automatic',
        mileage: '13 km/L',
        seating: 5,
        features: ['Virtual Cockpit', 'Bang & Olufsen Audio', 'Quattro AWD', 'LED Headlights', 'Wireless Charging'],
        description: 'Compact luxury with Audi A3 Sportback. Advanced technology meets sophisticated design.',
        isActive: true,
        isRented: false,
        isApproved: true,
        paymentStatus: 'PAID'
      }
    ];

    // Clear existing cars and insert new ones
    await Car.deleteMany({});
    await Car.insertMany(sampleCars);

    res.json({
      message: 'Database seeded successfully',
      admin: { email: admin.email, password: 'admin123' },
      owner: { email: owner.email, password: 'owner123' },
      cars: sampleCars.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;