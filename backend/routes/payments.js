// backend/routes/payments.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const paymentController = require('../controllers/paymentController');

// Create membership checkout (owner buys membership)
// Requires login
router.post('/create-membership', auth(['owner','admin','user']), express.json(), paymentController.createMembershipCheckout);

// Create car listing payment (owner pays for car listing)
// Requires login (allow any logged-in user)
router.post('/create-car-listing', auth(['owner','admin','user']), express.json(), paymentController.createCarListingPayment);

// Create listing payment with pricing calculation
// Requires login (allow any logged-in user)
router.post('/create-listing-payment', auth(['owner','admin','user']), express.json(), paymentController.createListingPayment);

// Verify payment status (no auth required to support post-redirect verification)
router.get('/verify', paymentController.verifyPayment);

// Get pending listings for user
// Requires login
router.get('/pending-listings', auth(['owner','admin']), paymentController.getPendingListings);

// Webhook endpoint (Safepay -> server). Use raw body so signature can be validated.
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.webhook);

// Dev-only: force-settle a payment for testing (DO NOT enable in production)
if (process.env.NODE_ENV !== 'production') {
  const Payment = require('../models/Payment');
  router.post('/dev/force-settle', express.json(), async (req, res) => {
    try {
      const { paymentId, status = 'SUCCEEDED', providerRef = 'DEV_FORCE', settledAmountInPaise } = req.body || {};
      if (!paymentId) return res.status(400).json({ error: 'paymentId required' });

      const payment = await Payment.findById(paymentId);
      if (!payment) return res.status(404).json({ error: 'Payment not found' });

      if (String(status).toUpperCase() === 'SUCCEEDED' || String(status).toUpperCase() === 'SUCCESS') {
        const settled = typeof settledAmountInPaise === 'number' ? settledAmountInPaise : (payment.requestedAmountInPaise || 0);
        await payment.markAsSucceeded(providerRef, settled, 0);
      } else if (String(status).toUpperCase() === 'FAILED') {
        await payment.markAsFailed();
      } else {
        payment.status = status;
        await payment.save();
      }

      const refreshed = await Payment.findById(paymentId);
      return res.json({ ok: true, payment: refreshed });
    } catch (err) {
      console.error('dev/force-settle error:', err);
      return res.status(500).json({ error: err.message });
    }
  });
}

module.exports = router;
