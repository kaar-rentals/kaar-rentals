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

    // Don't filter by status - show all listings including rented ones
    // Only filter by isActive and isApproved
    const filters = { isActive: true, isApproved: true };
    
    // Optional status filter if explicitly requested
    if (req.query.status) {
      filters.status = req.query.status;
    }
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
      .populate('ownerId', req.user ? 'name email phone unique_id location' : 'unique_id')
      .sort({ [sortBy]: order === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Format owner data based on authentication
    cars = cars.map(car => {
      const owner = car.ownerId || car.owner; // Support both ownerId and legacy owner
      if (owner && typeof owner === 'object') {
        if (req.user) {
          // Authenticated: include name and location
          return {
            ...car,
            owner: {
              unique_id: owner.unique_id || null,
              name: owner.name || null,
              location: owner.location || null,
              email: owner.email || null,
              phone: owner.phone || null
            }
          };
        } else {
          // Unauthenticated: only unique_id
          return {
            ...car,
            owner: {
              unique_id: owner.unique_id || null,
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
      .populate('ownerId', req.user ? 'name email phone unique_id location' : 'unique_id')
      .lean();
    
    if (!car) return res.status(404).json({ message: "Car not found" });
    
    // Format owner data based on authentication
    const owner = car.ownerId || car.owner; // Support both ownerId and legacy owner
    if (owner && typeof owner === 'object') {
      if (req.user) {
        // Authenticated: include name and location
        car.owner = {
          unique_id: owner.unique_id || null,
          name: owner.name || null,
          location: owner.location || null,
          email: owner.email || null,
          phone: owner.phone || null
        };
      } else {
        // Unauthenticated: only unique_id
        car.owner = {
          unique_id: owner.unique_id || null,
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

    return res.json({
      phone: car.ownerId.phone
    });
  } catch (error) {
    console.error('CONTACT OWNER ERROR:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/cars - Admin-only: Create listing
router.post("/", authMiddleware, async (req, res) => {
  // Check admin status explicitly
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
    }

  const user = await User.findById(req.user.id || req.user._id);
  if (!user || !(user.is_admin === true || user.role === 'admin')) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  // Continue with handler logic
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
    const ownerUser = await User.findOne({ unique_id: owner_unique_id });
    if (!ownerUser) {
      return res.status(422).json({ 
        message: "Owner not found with the provided unique_id",
        owner_unique_id 
      });
    }

    // Admin-only: If owner has no phone and admin provided owner_phone, save it to owner
    const { owner_phone } = req.body;
    if (!ownerUser.phone && owner_phone) {
      ownerUser.phone = owner_phone.trim() || null;
      await ownerUser.save();
    }

    // Get priceType from request or default to 'daily'
    const { priceType = 'daily' } = req.body;
    
    const car = await Car.create({
      ownerId: ownerUser._id,
      owner: ownerUser._id, // Legacy field for backward compatibility
      brand, model, year, category, pricePerDay, 
      price: pricePerDay, // Set price alias
      priceType: priceType === 'monthly' ? 'monthly' : 'daily',
      images,
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
      .populate('ownerId', 'name email phone unique_id location')
      .lean();

    // Emit socket event - support both ownerId and legacy owner
    const owner = populatedCar.ownerId || populatedCar.owner;
    if (owner && typeof owner === 'object') {
      populatedCar.owner_unique_id = owner.unique_id;
      populatedCar.owner = {
        unique_id: owner.unique_id || null,
        name: owner.name || null,
        location: owner.location || null
      };
    }
    notifyListingEvent('created', populatedCar);

    // Format response
    if (owner && typeof owner === 'object') {
      populatedCar.owner = {
        unique_id: owner.unique_id || null,
        name: owner.name || null,
        location: owner.location || null
      };
    }

    return res.status(201).json(populatedCar);
  } catch (err) {
    console.error('Error creating car:', err);
    return res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/cars/:id - Update listing (price, priceType, etc.) - owner or admin only
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const carId = req.params.id;
    const { price, pricePerDay, priceType } = req.body;
    const userId = req.user.id || req.user._id;

    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ message: "Car not found" });

    // Check if user is admin
    const user = await User.findById(userId);
    const isAdmin = user && (user.is_admin || user.role === 'admin');

    // Verify ownership (unless admin) - support both ownerId and legacy owner
    const carOwnerId = car.ownerId || car.owner;
    if (!isAdmin && carOwnerId && carOwnerId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You can only update your own listings" });
    }

    // Validate price if provided
    const finalPrice = price || pricePerDay;
    if (finalPrice !== undefined) {
      const priceNum = Number(finalPrice);
      if (isNaN(priceNum) || priceNum <= 0) {
        return res.status(400).json({ message: "Price must be a positive number" });
      }
      car.pricePerDay = priceNum;
      car.price = priceNum;
    }

    // Validate priceType if provided
    if (priceType !== undefined) {
      if (!['daily', 'monthly'].includes(priceType)) {
        return res.status(400).json({ message: "priceType must be 'daily' or 'monthly'" });
      }
      car.priceType = priceType;
    }

    await car.save();

    // Populate owner for socket event and response
    const populatedCar = await Car.findById(car._id)
      .populate('ownerId', 'name email phone unique_id location')
      .lean();

    // Emit socket event - support both ownerId and legacy owner
    const owner = populatedCar.ownerId || populatedCar.owner;
    if (owner && typeof owner === 'object') {
      populatedCar.owner_unique_id = owner.unique_id;
      populatedCar.owner = {
        unique_id: owner.unique_id || null,
        name: owner.name || null,
        location: owner.location || null
      };
    }
    notifyListingEvent('updated', populatedCar);

    // Format response
    if (owner && typeof owner === 'object') {
      populatedCar.owner = {
        unique_id: owner.unique_id || null,
        name: owner.name || null,
        location: owner.location || null
      };
    }

    res.set('Vary', 'Authorization');
    res.json(populatedCar);
  } catch (err) {
    console.error('Error updating car:', err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/cars/:id/price - Update price and priceType (shortcut endpoint)
router.put("/:id/price", authMiddleware, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const carId = req.params.id;
    const { price, pricePerDay, priceType } = req.body;
    const userId = req.user.id || req.user._id;

    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ message: "Car not found" });

    // Check if user is admin
    const user = await User.findById(userId);
    const isAdmin = user && (user.is_admin || user.role === 'admin');

    // Verify ownership (unless admin)
    const carOwnerId = car.ownerId || car.owner;
    if (!isAdmin && carOwnerId && carOwnerId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You can only update your own listings" });
    }

    // Validate price
    const finalPrice = price || pricePerDay;
    if (finalPrice !== undefined) {
      const priceNum = Number(finalPrice);
      if (isNaN(priceNum) || priceNum <= 0) {
        return res.status(400).json({ message: "Price must be a positive number" });
      }
      car.pricePerDay = priceNum;
      car.price = priceNum;
    }

    // Validate priceType
    if (priceType !== undefined) {
      if (!['daily', 'monthly'].includes(priceType)) {
        return res.status(400).json({ message: "priceType must be 'daily' or 'monthly'" });
      }
      car.priceType = priceType;
    }

    await car.save();

    // Populate and format response
    const populatedCar = await Car.findById(car._id)
      .populate('ownerId', 'name email phone unique_id location')
      .lean();

    const owner = populatedCar.ownerId || populatedCar.owner;
    if (owner && typeof owner === 'object') {
      populatedCar.owner_unique_id = owner.unique_id;
      populatedCar.owner = {
        unique_id: owner.unique_id || null,
        name: owner.name || null,
        location: owner.location || null
      };
    }
    notifyListingEvent('updated', populatedCar);

    res.set('Vary', 'Authorization');
    res.json(populatedCar);
  } catch (err) {
    console.error('Error updating car price:', err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/cars/:id/status - Toggle listing status (owner or admin)
router.put("/:id/status", authMiddleware, async (req, res) => {
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

    // Verify ownership (unless admin) - support both ownerId and legacy owner
    const carOwnerId = car.ownerId || car.owner;
    if (!isAdmin && carOwnerId && carOwnerId.toString() !== userId.toString()) {
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
      .populate('ownerId', 'name email phone unique_id location')
      .lean();

    // Emit socket event - support both ownerId and legacy owner
    const owner = populatedCar.ownerId || populatedCar.owner;
    if (owner && typeof owner === 'object') {
      populatedCar.owner_unique_id = owner.unique_id;
      populatedCar.owner = {
        unique_id: owner.unique_id || null,
        name: owner.name || null,
        location: owner.location || null
      };
    }
    notifyListingEvent('updated', populatedCar);

    // Format response based on authentication
    if (owner && typeof owner === 'object') {
      if (req.user) {
        // Authenticated: include name and location
        populatedCar.owner = {
          unique_id: owner.unique_id || null,
          name: owner.name || null,
          location: owner.location || null,
          email: owner.email || null,
          phone: owner.phone || null
        };
      } else {
        // Unauthenticated: only unique_id
        populatedCar.owner = {
          unique_id: owner.unique_id || null,
          name: null,
          location: null,
          contact: null
        };
      }
    }

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
    ).populate('ownerId', 'name email phone unique_id location');

    if (!car) return res.status(404).json({ message: "Car not found" });

    // Emit socket event - support both ownerId and legacy owner
    const carObj = car.toObject ? car.toObject() : car;
    const owner = carObj.ownerId || carObj.owner;
    if (owner && typeof owner === 'object') {
      carObj.owner_unique_id = owner.unique_id;
      carObj.owner = {
        unique_id: owner.unique_id || null,
        name: owner.name || null,
        location: owner.location || null
      };
    }
    notifyListingEvent('updated', carObj);

    return res.json(car);
  } catch (err) {
    console.error('Error updating featured status:', err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
