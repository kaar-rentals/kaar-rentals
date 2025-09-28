// backend/routes/payments.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const paymentController = require('../controllers/paymentController');

// Create membership checkout (owner buys membership)
// Requires login
router.post('/create-membership', auth(['owner','admin','user']), express.json(), paymentController.createMembershipCheckout);

// Create car listing payment (owner pays for car listing)
// Requires login
router.post('/create-car-listing', auth(['owner','admin']), express.json(), paymentController.createCarListingPayment);

// Webhook endpoint (Safepay -> server). Use raw body so signature can be validated.
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.webhook);

module.exports = router;
