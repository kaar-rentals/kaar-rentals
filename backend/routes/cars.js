const express = require("express");
const router = express.Router();
const Car = require("../models/Car");
const User = require("../models/User");
const { notifyListingEvent, notifyViewUpdate } = require("../utils/socket");

/** Increment view count and emit real-time update */
async function recordListingView(carId) {
  const updated = await Car.findByIdAndUpdate(
    carId,
    { $inc: { viewCount: 1 } },
    { new: true }
  )
    .populate('ownerId', 'unique_id')
    .lean();

  if (!updated) return null;

  const owner = updated.ownerId || updated.owner;
  const owner_unique_id =
    owner && typeof owner === 'object' ? owner.unique_id : null;

  notifyViewUpdate({
    carId: String(updated._id),
    viewCount: updated.viewCount || 0,
    owner_unique_id,
  });

  return updated.viewCount || 0;
}
const authMiddleware = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");

const VALID_CATEGORIES = ['Sedan', 'SUV', 'Hatchback'];

function getCarOwnerIdFromDoc(car) {
  const owner = car?.ownerId ?? car?.owner;
  if (!owner) return null;
  if (typeof owner === 'string') return String(owner);
  if (typeof owner === 'object' && owner._id) return String(owner._id);
  return null;
}

async function loadViewerIsAdmin(req) {
  if (req._viewerIsAdmin !== undefined) return req._viewerIsAdmin;
  if (!req.user?.id && !req.user?._id) {
    req._viewerIsAdmin = false;
    return false;
  }
  const user = await User.findById(req.user.id || req.user._id)
    .select('is_admin role')
    .lean();
  req._viewerIsAdmin = !!(user && (user.is_admin === true || user.role === 'admin'));
  return req._viewerIsAdmin;
}

function canSeeViewCount(req, car, viewerIsAdmin) {
  if (viewerIsAdmin) return true;
  if (!req.user?.id && !req.user?._id) return false;
  const viewerId = String(req.user.id || req.user._id);
  const ownerId = getCarOwnerIdFromDoc(car);
  return Boolean(ownerId && viewerId === ownerId);
}

function stripViewCountUnlessAllowed(req, car, viewerIsAdmin) {
  if (canSeeViewCount(req, car, viewerIsAdmin)) return car;
  const { viewCount, ...rest } = car;
  return rest;
}

/** Map URL slugs (sedan, suv) and legacy values to schema enum. */
function normalizeCategoryQuery(category) {
  if (!category) return null;
  const map = {
    sedan: 'Sedan',
    sedans: 'Sedan',
    suv: 'SUV',
    suvs: 'SUV',
    hatchback: 'Hatchback',
    hatchbacks: 'Hatchback',
  };
  const key = String(category).trim().toLowerCase();
  if (map[key]) return map[key];
  if (VALID_CATEGORIES.includes(category)) return category;
  return null;
}

// GET /api/cars - Support pagination, featured filter, owner info based on auth
router.get("/", async (req, res) => {
  try {
    // Repair legacy listings hidden when status was set to rented (non-blocking)
    Car.updateMany(
      { isApproved: true, isActive: false },
      { $set: { isActive: true } }
    ).catch(() => {});

    const {
      city, category, minPrice, maxPrice, transmission, fuelType, seats, search,
      page = 1, limit = 12, offset = 0, sortBy = "createdAt", order = "desc",
      featured, owner_unique_id, mine
    } = req.query;

    // Public listings: approved + (active OR rented)
    // Owner profile by unique_id: all approved cars for that owner (any status)
    // mine=true: authenticated owner's dashboard (all their cars)
    const relaxFilters = process.env.RELAX_CAR_FILTERS === 'true';
    const userId = req.user?.id || req.user?._id;

    let filters = { isApproved: true };

    if (mine === 'true' && userId) {
      filters = { $or: [{ ownerId: userId }, { owner: userId }] };
    } else if (relaxFilters) {
      // Temporary: show every approved listing
      filters = { isApproved: true };
    } else if (owner_unique_id) {
      const owner = await User.findOne({ unique_id: owner_unique_id });
      if (!owner) {
        return res.json({ total: 0, page: parseInt(page), limit: parseInt(limit), offset: parseInt(offset) || 0, cars: [] });
      }
      filters = {
        isApproved: true,
        $or: [{ ownerId: owner._id }, { owner: owner._id }]
      };
    } else if (mine === 'true') {
      return res.status(401).json({ message: 'Authentication required' });
    } else {
      filters.$or = [
        { isActive: true },
        { isRented: true },
        { status: 'rented' } // legacy/synced status field
      ];
    }

    if (search) {
      filters = {
        $and: [
          filters,
          {
            $or: [
              { brand: { $regex: search, $options: "i" } },
              { model: { $regex: search, $options: "i" } },
              { description: { $regex: search, $options: "i" } }
            ]
          }
        ]
      };
    }

    if (req.query.status) {
      if (filters.$and) filters.$and.push({ status: req.query.status });
      else filters.status = req.query.status;
    }
    if (city) {
      if (filters.$and) filters.$and.push({ city });
      else filters.city = city;
    }
    if (category) {
      const normalizedCategory = normalizeCategoryQuery(category);
      if (normalizedCategory) {
        const categoryFilter = { category: normalizedCategory };
        if (filters.$and) filters.$and.push(categoryFilter);
        else filters.category = normalizedCategory;
      }
    }
    if (transmission) {
      if (filters.$and) filters.$and.push({ transmission });
      else filters.transmission = transmission;
    }
    if (fuelType) {
      if (filters.$and) filters.$and.push({ fuelType });
      else filters.fuelType = fuelType;
    }
    if (seats) {
      const seatFilter = { seating: parseInt(seats) };
      if (filters.$and) filters.$and.push(seatFilter);
      else filters.seating = parseInt(seats);
    }
    if (featured !== undefined) {
      const feat = { featured: featured === 'true' || featured === true };
      if (filters.$and) filters.$and.push(feat);
      else Object.assign(filters, feat);
    }
    if (minPrice || maxPrice) {
      const priceFilter = { pricePerDay: {} };
      if (minPrice) priceFilter.pricePerDay.$gte = parseInt(minPrice);
      if (maxPrice) priceFilter.pricePerDay.$lte = parseInt(maxPrice);
      if (filters.$and) filters.$and.push(priceFilter);
      else filters.pricePerDay = priceFilter.pricePerDay;
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
    const viewerIsAdmin = await loadViewerIsAdmin(req);
    cars = cars.map(car => {
      const owner = car.ownerId || car.owner; // Support both ownerId and legacy owner
      let formatted = car;
      if (owner && typeof owner === 'object') {
        const ownerIdStr = owner._id ? String(owner._id) : null;
        if (req.user) {
          formatted = {
            ...car,
            ownerId: ownerIdStr,
            owner: {
              _id: ownerIdStr,
              unique_id: owner.unique_id || null,
              name: owner.name || null,
              location: owner.location || null,
              email: owner.email || null,
              phone: owner.phone || null
            }
          };
        } else {
          formatted = {
            ...car,
            ownerId: ownerIdStr,
            owner: {
              _id: ownerIdStr,
              unique_id: owner.unique_id || null,
              name: null,
              location: null,
              contact: null
            }
          };
        }
      }
      return stripViewCountUnlessAllowed(req, formatted, viewerIsAdmin);
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

// GET /api/cars/owner/my-cars - All listings for authenticated owner (any status)
router.get("/owner/my-cars", authMiddleware, async (req, res) => {
  try {
    if (!req.user || !(req.user.id || req.user._id)) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const userId = req.user.id || req.user._id;

    // Repair legacy listings hidden when marked rented
    await Car.updateMany(
      { $or: [{ ownerId: userId }, { owner: userId }], status: 'rented', isActive: false },
      { $set: { isActive: true } }
    );

    const cars = await Car.find({
      $or: [{ ownerId: userId }, { owner: userId }]
    })
      .populate('ownerId', 'name email phone unique_id location membershipPlan membershipActive')
      .sort({ createdAt: -1 })
      .lean();

    const formatted = cars.map((car) => {
      const owner = car.ownerId || car.owner;
      const ownerIdStr = owner && typeof owner === 'object' && owner._id ? String(owner._id) : null;
      return {
        ...car,
        ownerId: ownerIdStr,
        owner: owner && typeof owner === 'object' ? {
          _id: ownerIdStr,
          name: owner.name,
          email: owner.email,
          phone: owner.phone,
          unique_id: owner.unique_id,
          location: owner.location
        } : car.owner
      };
    });

    return res.json({ cars: formatted });
  } catch (err) {
    console.error('Error fetching owner cars:', err);
    return res.status(500).json({ message: "Server error" });
  }
});

// POST /api/cars/:id/view - Record a listing view (real-time broadcast to owner dashboard)
router.post("/:id/view", async (req, res) => {
  try {
    const car = await Car.findById(req.params.id).select('_id isApproved');
    if (!car) return res.status(404).json({ message: 'Car not found' });
    if (!car.isApproved) {
      return res.status(404).json({ message: 'Car not found' });
    }

    const viewCount = await recordListingView(req.params.id);
    const viewerIsAdmin = await loadViewerIsAdmin(req);
    const carDoc = await Car.findById(req.params.id).select('ownerId owner').lean();
    const payload = { carId: req.params.id, recorded: true };
    if (carDoc && canSeeViewCount(req, carDoc, viewerIsAdmin)) {
      payload.viewCount = viewCount;
    }
    return res.json(payload);
  } catch (err) {
    console.error('Error recording view:', err);
    return res.status(500).json({ message: 'Server error' });
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
      const ownerIdStr = owner._id ? String(owner._id) : null;
      car.ownerId = ownerIdStr;
      if (req.user) {
        // Authenticated: include name and location
        car.owner = {
          _id: ownerIdStr,
          unique_id: owner.unique_id || null,
          name: owner.name || null,
          location: owner.location || null,
          email: owner.email || null,
          phone: owner.phone || null
        };
      } else {
        // Unauthenticated: only unique_id
        car.owner = {
          _id: ownerIdStr,
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
    
    const viewerIsAdmin = await loadViewerIsAdmin(req);
    res.json(stripViewCountUnlessAllowed(req, car, viewerIsAdmin));
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
      isActive: true,
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
    const {
      price, pricePerDay, priceType, brand, model, year, category,
      description, features, images, location, city, engineCapacity,
      fuelType, transmission, mileage, seating, featured
    } = req.body;
    const userId = req.user.id || req.user._id;

    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ message: "Car not found" });

    const user = await User.findById(userId);
    const isAdmin = user && (user.is_admin || user.role === 'admin');
    const isPremium = user && (user.membershipPlan === 'premium' || user.membershipActive);

    const carOwnerId = car.ownerId || car.owner;
    if (!isAdmin && carOwnerId && carOwnerId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You can only update your own listings" });
    }

    const finalPrice = price ?? pricePerDay;
    if (finalPrice !== undefined) {
      const priceNum = Number(finalPrice);
      if (isNaN(priceNum) || priceNum <= 0) {
        return res.status(400).json({ message: "Price must be a positive number" });
      }
      car.pricePerDay = priceNum;
      car.price = priceNum;
    }
    if (priceType !== undefined) {
      if (!['daily', 'monthly'].includes(priceType)) {
        return res.status(400).json({ message: "priceType must be 'daily' or 'monthly'" });
      }
      car.priceType = priceType;
    }
    if (brand !== undefined) car.brand = brand;
    if (model !== undefined) car.model = model;
    if (year !== undefined) car.year = Number(year);
    if (category !== undefined) car.category = category;
    if (description !== undefined) car.description = description;
    if (features !== undefined) car.features = Array.isArray(features) ? features : [];
    if (images !== undefined) car.images = Array.isArray(images) ? images : [];
    if (location !== undefined) car.location = location;
    if (city !== undefined) car.city = city;
    if (engineCapacity !== undefined) car.engineCapacity = engineCapacity;
    if (fuelType !== undefined) car.fuelType = fuelType;
    if (transmission !== undefined) car.transmission = transmission;
    if (mileage !== undefined) car.mileage = mileage;
    if (seating !== undefined) car.seating = Number(seating);
    if (featured !== undefined) {
      if (!isAdmin && !isPremium) {
        return res.status(403).json({ message: "Featured listings require a Premium plan" });
      }
      car.featured = Boolean(featured);
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

    // Update status — keep listing visible (isActive stays true)
    car.status = status;
    car.isRented = status === 'rented';
    car.isActive = true;

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

// POST /api/cars/:id/inquiry - Log renter inquiry (authenticated)
router.post("/:id/inquiry", authMiddleware, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: "Car not found" });

    const inquirer = await User.findById(req.user.id || req.user._id).select('name email phone');
    const { message } = req.body || {};

    car.inquiries = car.inquiries || [];
    car.inquiries.push({
      name: inquirer?.name || 'Guest',
      phone: inquirer?.phone || null,
      email: inquirer?.email || null,
      message: message || 'Contacted owner via listing',
      userId: inquirer?._id
    });
    await car.save();

    return res.json({ success: true, inquiries: car.inquiries });
  } catch (err) {
    console.error('Error logging inquiry:', err);
    return res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/cars/:id/featured - Toggle featured (admin or Premium plan)
router.put("/:id/featured", authMiddleware, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId);
    const isAdmin = user && (user.is_admin || user.role === 'admin');
    const isPremium = user && (user.membershipPlan === 'premium' || user.membershipActive);

    if (!isAdmin && !isPremium) {
      return res.status(403).json({ message: "Premium plan required to feature listings" });
    }

    const carId = req.params.id;
    const { featured } = req.body;

    if (typeof featured !== 'boolean') {
      return res.status(400).json({ message: "featured must be a boolean" });
    }

    const existing = await Car.findById(carId);
    if (!existing) return res.status(404).json({ message: "Car not found" });
    const carOwnerId = existing.ownerId || existing.owner;
    if (!isAdmin && carOwnerId && carOwnerId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You can only update your own listings" });
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
