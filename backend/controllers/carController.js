// backend/controllers/carController.js
const Car = require('../models/Car');

const getCars = async (req, res) => {
  try {
    const cars = await Car.find().populate('owner', 'name email');
    res.json(cars);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addCar = async (req, res) => {
  try {
    // make sure req.user exists (auth middleware)
    const ownerId = req.user && req.user._id;
    if (!ownerId) return res.status(401).json({ error: 'Unauthorized' });

    const payload = {
      owner: ownerId,
      brand: req.body.brand || req.body.make || req.body.brand,
      model: req.body.model,
      year: req.body.year,
      pricePerDay: req.body.pricePerDay || req.body.dailyRate || 0,
      images: req.body.images || [],
      location: req.body.location || ''
    };

    const car = await Car.create(payload);
    res.json(car);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getCars, addCar };
