const express = require("express");
const router = express.Router();
const Car = require("../models/Car");
const User = require("../models/User");
const { notifyListingEvent } = require("../utils/socket");
const authMiddleware = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");

// GET /api/cars - Support pagination, featured filter, owner info based on auth
router.get("/", async (req, res) => {
  try {
    const {
      city, category, minPrice, maxPrice, transmission, fuelType, seats, search,
      page = 1, limit = 12, offset = 0, sortBy = "createdAt", order = "desc",
      featured, owner_unique_id
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

    // Filter by owner_unique_id if provided
    if (owner_unique_id) {
      const owner = await User.findOne({ unique_id: owner_unique_id });
      if (owner) {
        filters.owner = owner._id;
      } else {
        return res.json({ total: 0, page: parseInt(page), limit: parseInt(limit), offset: parseInt(offset) || 0, cars: [] });
      }
    }

    const skip = offset ? parseInt(offset) : (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
    const limitNum = parseInt(limit) || 12;

    const total = await Car.countDocuments(filters);
    let cars = await Car.find(filters)
      .populate('owner', req.user ? 'name email phone unique_id location' : 'unique_id')
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

    // Add caching headers
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
    } else if (!req.user) {
      delete car.owner;
      delete car.renterPhone;
      car.location = car.city;
    }
    
    // Add caching headers
    res.set('Cache-Control', 'public, max-age=20, stale-while-revalidate=60');
    res.set('Vary', 'Authorization');
    
    res.json(car);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/cars/:id/contact - Get owner phone (authenticated only)
router.get("/:id/contact", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const car = await Car.findById(req.params.id).populate('owner', 'phone unique_id');
    if (!car) return res.status(404).json({ message: "Car not found" });

    if (!car.owner || typeof car.owner !== 'object') {
      return res.status(404).json({ message: "Owner not found" });
    }

    const phone = car.owner.phone;
    if (!phone) {
      return res.status(404).json({ message: "Owner phone not available" });
    }

    res.json({ phone });
  } catch (err) {
    console.error('Error fetching contact:', err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/cars - Admin-only: Create listing
router.post("/", authMiddleware, isAdmin, async (req, res) => {
  try {

    const {
      brand, model, year, category, pricePerDay, images = [],
      location, city, engineCapacity, fuelType, transmission,
      mileage, seating, features = [], description = "",
      owner_unique_id, featured = false, status = 'available'
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
        missingFields 
      });
    }

    // Validate category
    const validCategories = ['Sedan', 'SUV', 'Hatchback'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ 
        message: "Invalid category. Must be one of: " + validCategories.join(', ')
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
      brand, model, year, category, pricePerDay, images,
      location, city, engineCapacity, fuelType, transmission,
      mileage, seating, features, description,
      featured: featured === true || featured === 'true',
      status: status === 'rented' ? 'rented' : 'available',
      isActive: status === 'available',
      isRented: status === 'rented',
      isApproved: true, // Admin-created listings are auto-approved
      paymentStatus: 'PAID', // Admin bypass: free for admins
    });

    // Populate owner for socket event
    const populatedCar = await Car.findById(car._id)
      .populate('owner', 'name email phone unique_id location')
      .lean();

    // Emit socket event
    if (populatedCar.owner && typeof populatedCar.owner === 'object') {
      populatedCar.owner_unique_id = populatedCar.owner.unique_id;
    }
    notifyListingEvent('created', populatedCar);

    // Format response
    if (populatedCar.owner && typeof populatedCar.owner === 'object') {
      populatedCar.owner = {
        unique_id: populatedCar.owner.unique_id || null,
        name: populatedCar.owner.name || null,
        location: populatedCar.owner.location || null
      };
    }

    return res.status(201).json(populatedCar);
  } catch (err) {
    console.error('Error creating car:', err);
    return res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/cars/:id/status - Toggle listing status (owner or admin)
router.put("/:id/status", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const carId = req.params.id;
    const { status } = req.body;
    const userId = req.user.id || req.user._id;

    if (!status || !['available', 'rented'].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be 'available' or 'rented'" });
    }

    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ message: "Car not found" });

    // Check if user is admin
    const user = await User.findById(userId);
    const isAdmin = user && (user.is_admin || user.role === 'admin');

    // Verify ownership (unless admin)
    if (!isAdmin && car.owner.toString() !== userId.toString()) {
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

    // Populate owner for socket event and response
    const populatedCar = await Car.findById(car._id)
      .populate('owner', 'name email phone unique_id location')
      .lean();

    // Format owner data based on authentication
    if (populatedCar.owner && typeof populatedCar.owner === 'object') {
      if (req.user) {
        // Authenticated: include name and location
        populatedCar.owner = {
          unique_id: populatedCar.owner.unique_id || null,
          name: populatedCar.owner.name || null,
          location: populatedCar.owner.location || null,
          email: populatedCar.owner.email || null,
          phone: populatedCar.owner.phone || null
        };
      } else {
        // Unauthenticated: only unique_id
        populatedCar.owner = {
          unique_id: populatedCar.owner.unique_id || null,
          name: null,
          location: null,
          contact: null
        };
      }
      populatedCar.owner_unique_id = populatedCar.owner.unique_id;
    }

    // Emit socket event
    notifyListingEvent('updated', populatedCar);

    return res.json(populatedCar);
  } catch (err) {
    console.error('Error updating car status:', err);
    return res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/cars/:id/featured - Toggle featured status (admin only)
router.put("/:id/featured", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId);
    if (!user || !(user.is_admin || user.role === 'admin')) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const carId = req.params.id;
    const { featured } = req.body;

    if (typeof featured !== 'boolean') {
      return res.status(400).json({ message: "featured must be a boolean" });
    }

    const car = await Car.findByIdAndUpdate(
      carId,
      { featured: featured },
      { new: true }
    ).populate('owner', 'name email phone unique_id location');

    if (!car) return res.status(404).json({ message: "Car not found" });

    // Emit socket event
    const carObj = car.toObject ? car.toObject() : car;
    if (carObj.owner && typeof carObj.owner === 'object') {
      carObj.owner_unique_id = carObj.owner.unique_id;
    }
    notifyListingEvent('updated', carObj);

    return res.json(car);
  } catch (err) {
    console.error('Error updating featured status:', err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
