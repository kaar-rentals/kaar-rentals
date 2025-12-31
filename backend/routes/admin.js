// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { asHandler } = require('./_routeHelpers');
const adminController = require('../controllers/adminController');
const {
  getDashboardStats,
  getPendingCars,
  approveCar,
  rejectCar,
  getAllUsers,
  updateUserRole,
  getAllCars,
  getRecentBookings,
  getAllPayments,
  getPaymentStats,
  getListingDrafts
} = adminController;

// Debug: log available exports
if (process.env.NODE_ENV !== 'production') {
  console.log('adminController exports:', Object.keys(adminController));
}

// All admin routes require admin role
router.use(auth(['admin']));

// Dashboard
router.get('/dashboard', asHandler(getDashboardStats));

// Car management
router.get('/cars', asHandler(getAllCars));
router.get('/cars/pending', asHandler(getPendingCars));
router.patch('/cars/:id/approve', asHandler(approveCar));
router.patch('/cars/:id/reject', asHandler(rejectCar));
// Note: createCarAsAdmin is not exported from adminController
// Admin can use POST /api/cars endpoint directly (requires isAdmin middleware)
// router.post('/cars', asHandler(createCarAsAdmin)); // Disabled - function not found

// User management
router.get('/users', asHandler(getAllUsers));
router.patch('/users/:id/role', asHandler(updateUserRole));
// Note: toggleOwnerStatus is not exported from adminController
// router.patch('/users/:id/toggle-owner', asHandler(toggleOwnerStatus)); // Disabled - function not found

// Bookings
router.get('/bookings', asHandler(getRecentBookings));

// Payment audit
router.get('/payments', asHandler(getAllPayments));
router.get('/payments/stats', asHandler(getPaymentStats));

// Listing drafts audit
router.get('/listing-drafts', asHandler(getListingDrafts));

module.exports = router;

