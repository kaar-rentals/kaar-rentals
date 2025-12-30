const express = require("express");
const router = express.Router();
const Car = require("../models/Car");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/authMiddleware");

// GET /api/cars - Support pagination, featured filter, hide owner contact for unauthenticated
router.get("/", async (req, res) => {
  try {
    const {
      city, category, minPrice, maxPrice, transmission, fuelType, seats, search,
      page = 1, limit = 12, offset = 0, sortBy = "createdAt", order = "desc",
      featured
    } = req.query;

    const filters = { isActive: true, isApproved: true };
    if (city) filters.city = city;
    if (category) filters.category = category;
    if (transmission) filters.transmission = transmission;
    if (fuelType) filters.fuelType = fuelType;
    if (seats) filters.seating = parseInt(seats);
    if (featured !== undefined) {
      filters.featured = featured === 'true' || featured === true;
    }
    // Filter by owner_unique_id if provided
    if (req.query.owner_unique_id) {
      const owner = await User.findOne({ unique_id: req.query.owner_unique_id });
      if (owner) {
        filters.owner = owner._id;
      } else {
        // If owner not found, return empty results
        return res.json({ total: 0, page: parseInt(page), limit: limitNum, offset: skip, cars: [] });
      }
    }
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

    // Use offset if provided, otherwise calculate from page
    const skip = offset ? parseInt(offset) : (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
    const limitNum = parseInt(limit) || 12;

    const total = await Car.countDocuments(filters);
    let cars = await Car.find(filters)
      .populate('owner', req.user ? 'name email phone unique_id location' : 'unique_id') // Include name and location if authenticated
      .sort({ [sortBy]: order === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Format owner data based on authentication
    cars = cars.map(car => {
      if (car.owner && typeof car.owner === 'object') {
        if (req.user) {
          // Authenticated: include name and location
          return {
            ...car,
            owner: {
              unique_id: car.owner.unique_id || null,
              name: car.owner.name || null,
              location: car.owner.location || null,
              email: car.owner.email || null,
              phone: car.owner.phone || null
            }
          };
        } else {
          // Unauthenticated: only unique_id
          return {
            ...car,
            owner: {
              unique_id: car.owner.unique_id || null,
              name: null,
              location: null,
              contact: null
            }
          };
        }
      }
      return car;
    });

    // Add caching headers with stale-while-revalidate
    res.set('Cache-Control', 'public, max-age=20, stale-while-revalidate=60');
    res.set('Vary', 'Authorization');

    res.json({ 
      total, 
      page: parseInt(page), 
      limit: limitNum, 
      offset: skip,
      cars 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/cars/:id - Include owner name and location when authenticated
router.get("/:id", async (req, res) => {
  try {
    let car = await Car.findById(req.params.id)
      .populate('owner', req.user ? 'name email phone unique_id location' : 'unique_id')
      .lean();
    if (!car) return res.status(404).json({ message: "Car not found" });
    
    // Format owner data based on authentication
    if (car.owner && typeof car.owner === 'object') {
      if (req.user) {
        // Authenticated: include name and location
        car.owner = {
          unique_id: car.owner.unique_id || null,
          name: car.owner.name || null,
          location: car.owner.location || null,
          email: car.owner.email || null,
          phone: car.owner.phone || null
        };
      } else {
        // Unauthenticated: only unique_id
        car.owner = {
          unique_id: car.owner.unique_id || null,
          name: null,
          location: null,
          contact: null
        };
      }
    }
    
    if (!req.user) {
      delete car.renterPhone;
      car.location = car.city;
    }

    // Add caching headers with stale-while-revalidate
    res.set('Cache-Control', 'public, max-age=20, stale-while-revalidate=60');
    res.set('Vary', 'Authorization');

    res.json(car);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/cars - Admin-only: Create a new car listing
router.post("/", auth(['admin']), isAdmin, async (req, res) => {
  try {
    if (!req.user || !req.user.is_admin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const {
      brand,
      model,
      year,
      category,
      pricePerDay,
      images = [],
      location,
      city,
      engineCapacity,
      fuelType,
      transmission,
      mileage,
      seating,
      features = [],
      description = "",
      owner_unique_id, // Admin supplies owner's unique_id
      featured = false,
      status = 'available'
    } = req.body || {};

    // Basic required validations
    const missingFields = [];
    if (!brand) missingFields.push('brand');
    if (!model) missingFields.push('model');
    if (!year) missingFields.push('year');
    if (!category) missingFields.push('category');
    if (!pricePerDay) missingFields.push('pricePerDay');
    if (!location) missingFields.push('location');
    if (!city) missingFields.push('city');
    if (!engineCapacity) missingFields.push('engineCapacity');
    if (!fuelType) missingFields.push('fuelType');
    if (!transmission) missingFields.push('transmission');
    if (!mileage) missingFields.push('mileage');
    if (!seating) missingFields.push('seating');
    if (!description) missingFields.push('description');
    if (!owner_unique_id) missingFields.push('owner_unique_id');

    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: "Missing required fields", 
        missingFields: missingFields 
      });
    }

    // Validate category enum
    const validCategories = ['Sedan', 'SUV', 'Hatchback'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ 
        message: "Invalid category. Must be one of: " + validCategories.join(', '),
        received: category
      });
    }

    // Resolve owner_unique_id to owner_id
    const owner = await User.findOne({ unique_id: owner_unique_id });
    if (!owner) {
      return res.status(422).json({ 
        message: "Owner not found with the provided unique_id",
        owner_unique_id 
      });
    }

    const car = await Car.create({
      owner: owner._id,
      brand,
      model,
      year,
      category,
      pricePerDay,
      images,
      location,
      city,
      engineCapacity,
      fuelType,
      transmission,
      mileage,
      seating,
      features,
      description,
      status: status === 'rented' ? 'rented' : 'available',
      featured: featured === true || featured === 'true',
      isActive: status === 'available',
      isRented: status === 'rented',
      isApproved: true, // Admin-created listings are auto-approved
      paymentStatus: 'PAID', // Admin bypass: free for admins
      createdByAdmin: true
    });

    return res.status(201).json(car);
  } catch (err) {
    console.error('Error creating car:', err);
    return res.status(500).json({ message: "Server error" });
  }
});

// GET /api/cars/owner/my-cars - Get cars for the logged-in owner
// Requires a valid JWT; allow roles owner/admin/user
router.get("/owner/my-cars", auth(["owner", "admin", "user"]), async (req, res) => {
  try {
    const ownerId = req.user && req.user._id;
    if (!ownerId) return res.status(401).json({ message: "Unauthorized" });

    const cars = await Car.find({ owner: ownerId })
      .sort({ createdAt: -1 })
      .lean();

    return res.json(cars);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/cars/:id/status - Owner or admin can toggle listing status
router.put("/:id/status", auth(["owner", "admin", "user"]), async (req, res) => {
  try {
    const carId = req.params.id;
    const { status } = req.body; // 'available' or 'rented'
    const userId = req.user.id || req.user._id;

    if (!status || !['available', 'rented'].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be 'available' or 'rented'" });
    }

    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ message: "Car not found" });

    // Verify ownership (unless admin)
    if (!req.user.is_admin && car.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You can only update your own listings" });
    }

    // Update status
    car.status = status;
    if (status === 'rented') {
      car.isRented = true;
      car.isActive = false;
    } else {
      car.isRented = false;
      car.isActive = true;
    }

    await car.save();
    return res.json(car);
  } catch (err) {
    console.error('Error updating car status:', err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Also support PATCH for backward compatibility
router.patch("/:id/status", auth(["owner", "admin", "user"]), async (req, res) => {
  try {
    const carId = req.params.id;
    const { status } = req.body;
    const userId = req.user.id || req.user._id;

    if (!status || !['available', 'rented'].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be 'available' or 'rented'" });
    }

    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ message: "Car not found" });

    if (!req.user.is_admin && car.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You can only update your own listings" });
    }

    car.status = status;
    if (status === 'rented') {
      car.isRented = true;
      car.isActive = false;
    } else {
      car.isRented = false;
      car.isActive = true;
    }

    await car.save();
    return res.json(car);
  } catch (err) {
    console.error('Error updating car status:', err);
    return res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/cars/:id/featured - Toggle featured status (admin only)
router.put("/:id/featured", auth(['admin']), isAdmin, async (req, res) => {
  try {
    if (!req.user || !req.user.is_admin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const carId = req.params.id;
    const { featured } = req.body;

    if (typeof featured !== 'boolean') {
      return res.status(400).json({ message: "featured must be a boolean" });
    }

    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ message: "Car not found" });

    car.featured = featured;
    await car.save();

    return res.json(car);
  } catch (err) {
    console.error('Error updating featured status:', err);
    return res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/cars/:id - Delete car (owner or admin)
router.delete("/:id", auth(["owner", "admin"]), async (req, res) => {
  try {
    const carId = req.params.id;
    const ownerId = req.user.id || req.user._id;

    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ message: "Car not found" });

    // Verify ownership (unless admin)
    if (req.user.role !== 'admin' && car.owner.toString() !== ownerId.toString()) {
      return res.status(403).json({ message: "You can only delete your own listings" });
    }

    await Car.findByIdAndDelete(carId);
    return res.json({ message: "Car deleted successfully" });
  } catch (err) {
    console.error('Error deleting car:', err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
