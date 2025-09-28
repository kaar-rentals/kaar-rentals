// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  getDashboardStats,
  getPendingCars,
  approveCar,
  rejectCar,
  getAllUsers,
  updateUserRole,
  getAllCars,
  getRecentBookings
} = require('../controllers/adminController');

// All admin routes require admin role
router.use(auth(['admin']));

// Dashboard
router.get('/dashboard', getDashboardStats);

// Car management
router.get('/cars', getAllCars);
router.get('/cars/pending', getPendingCars);
router.patch('/cars/:id/approve', approveCar);
router.patch('/cars/:id/reject', rejectCar);

// User management
router.get('/users', getAllUsers);
router.patch('/users/:id/role', updateUserRole);

// Bookings
router.get('/bookings', getRecentBookings);

module.exports = router;
