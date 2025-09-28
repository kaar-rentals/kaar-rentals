// backend/routes/cars.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const ensureMembership = require('../middleware/ensureMembership');
const upload = require('../middleware/upload');
const { 
  getCars, 
  getCarById, 
  addCar, 
  updateCar, 
  toggleCarRentalStatus, 
  getOwnerCars, 
  deleteCar 
} = require('../controllers/carController');

// Public routes
router.get('/', getCars);
router.get('/:id', getCarById);

// Owner routes (require authentication and membership)
router.get('/owner/my-cars', auth(['owner', 'admin']), getOwnerCars);
router.post('/', auth(['owner', 'admin']), ensureMembership, upload.array('images', 5), addCar);
router.put('/:id', auth(['owner', 'admin']), upload.array('images', 5), updateCar);
router.patch('/:id/toggle-rental', auth(['owner', 'admin']), toggleCarRentalStatus);
router.delete('/:id', auth(['owner', 'admin']), deleteCar);

module.exports = router;
