// backend/controllers/carController.js
const Car = require('../models/Car');
const Payment = require('../models/Payment');


const getCars = async (req, res) => {
  try {
    const cars = await Car.find({ isActive: true, isApproved: true })
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });
    res.json(cars);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id).populate('owner', 'name email phone');
    if (!car) return res.status(404).json({ error: 'Car not found' });
    res.json(car);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const bucket = require('../firebase');

const addCar = async (req, res) => {
  try {
    const ownerId = req.user && req.user._id;
    if (!ownerId) return res.status(401).json({ error: 'Unauthorized' });

    // Accept image URLs from frontend (already uploaded to Firebase)
    const images = Array.isArray(req.body.images) ? req.body.images : [];

    const payload = {
      owner: ownerId,
      brand: req.body.brand,
      model: req.body.model,
      year: req.body.year,
      category: req.body.category,
      pricePerDay: req.body.pricePerDay,
      images,
      location: req.body.location,
      city: req.body.city,
      engineCapacity: req.body.engineCapacity,
      fuelType: req.body.fuelType,
      transmission: req.body.transmission,
      mileage: req.body.mileage,
      seating: req.body.seating,
      features: Array.isArray(req.body.features) ? req.body.features : (req.body.features ? JSON.parse(req.body.features) : []),
      description: req.body.description
    };

    const car = await Car.create(payload);
    await car.populate('owner', 'name email');
    res.json(car);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateCar = async (req, res) => {
  try {
    const ownerId = req.user && req.user._id;
    if (!ownerId) return res.status(401).json({ error: 'Unauthorized' });

    const car = await Car.findOne({ _id: req.params.id, owner: ownerId });
    if (!car) return res.status(404).json({ error: 'Car not found' });

    const updatedCar = await Car.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('owner', 'name email');

    res.json(updatedCar);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const toggleCarRentalStatus = async (req, res) => {
  try {
    const ownerId = req.user && req.user._id;
    if (!ownerId) return res.status(401).json({ error: 'Unauthorized' });

    const car = await Car.findOne({ _id: req.params.id, owner: ownerId });
    if (!car) return res.status(404).json({ error: 'Car not found' });

    car.isRented = !car.isRented;
    await car.save();

    res.json(car);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getOwnerCars = async (req, res) => {
  try {
    const ownerId = req.user && req.user._id;
    if (!ownerId) return res.status(401).json({ error: 'Unauthorized' });

    const cars = await Car.find({ owner: ownerId })
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });
    res.json(cars);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteCar = async (req, res) => {
  try {
    const ownerId = req.user && req.user._id;
    if (!ownerId) return res.status(401).json({ error: 'Unauthorized' });

    const car = await Car.findOne({ _id: req.params.id, owner: ownerId });
    if (!car) return res.status(404).json({ error: 'Car not found' });

    await Car.findByIdAndDelete(req.params.id);
    res.json({ message: 'Car deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { 
  getCars, 
  getCarById, 
  addCar, 
  updateCar, 
  toggleCarRentalStatus, 
  getOwnerCars, 
  deleteCar 
};
