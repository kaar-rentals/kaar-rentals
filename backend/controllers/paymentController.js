// backend/controllers/paymentController.js
const axios = require('axios');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const User = require('../models/User');
const ListingDraft = require('../models/ListingDraft');
const Car = require('../models/Car');

const SAFE_PAY_KEY = process.env.SAFE_PAY_KEY || '';
const SAFE_PAY_SECRET = process.env.SAFE_PAY_SECRET || '';
const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// plan durations (days)
const PLAN_DAYS = {
  basic: 30,
  premium: 365,
  enterprise: 3650
};

/**
 * POST /api/payments/create-membership
 * body: { plan: 'basic'|'premium', amount: 10000 }
 * req.user must be logged in (owner)
 */
async function createMembershipCheckout(req, res, next) {
  try {
    const userId = req.user && req.user._id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { plan, amount } = req.body;
    if (!plan || !amount) return res.status(400).json({ error: 'plan and amount required' });

    // create Payment record
    const payment = await Payment.create({
      user: userId,
      type: 'membership',
      plan,
      amount,
      currency: 'PKR',
      status: 'PENDING'
    });

    // use payment._id as order id
    const orderId = payment._id.toString();
    payment.orderId = orderId;
    await payment.save();

    // Build safepay payload for frontend (adjust field names to match Safepay docs)
    const payload = {
      merchant_key: SAFE_PAY_KEY,
      order_id: orderId,
      amount: payment.amount,
      item_name: `Kaar Membership: ${plan}`,
      currency: payment.currency,
      return_url: `${FRONTEND_URL}/membership/callback`,
      notify_url: `${BASE_URL}/api/payments/webhook`,
      customer_name: req.user.name || '',
      customer_email: req.user.email || '',
      metadata: { paymentId: payment._id.toString(), plan }
    };

    // NOTE: If your Safepay account supports server->Safepay session creation you can call it here (axios.post).
    // For now we return the payload so frontend can post/redirect to Safepay (safer until we confirm exact endpoint format).
    res.json({ paymentId: payment._id, orderId, amount: payment.amount, payload });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/payments/webhook
 * Safepay will POST here on payment events. We validate signature if provided.
 */
async function webhook(req, res, next) {
  try {
    // raw body expected via express.raw() in route
    const raw = req.rawBody || JSON.stringify(req.body);
    const sigHeader = req.headers['x-safepay-signature'] || req.headers['x-signature'] || '';

    // verify signature if secret and header provided
    if (SAFE_PAY_SECRET && sigHeader) {
      const expected = crypto.createHmac('sha256', SAFE_PAY_SECRET).update(raw).digest('hex');
      if (expected !== sigHeader) {
        console.warn('Invalid Safepay webhook signature');
        return res.status(400).send('invalid signature');
      }
    }

    const event = req.body;
    const data = event.data || event;
    const orderId = data.order_id || data.orderId || data.metadata?.paymentId || data.metadata?.payment_id;
    const statusRaw = (data.status || data.event || '').toString().toLowerCase();

    if (!orderId) {
      console.warn('Webhook missing order id:', event);
      return res.status(400).send('missing order id');
    }

    // find payment by orderId or _id
    const payment = await Payment.findOne({ orderId }) || await Payment.findById(orderId);
    if (!payment) {
      console.warn('Payment not found for orderId', orderId);
      return res.status(404).send('payment not found');
    }

    if (statusRaw.includes('success') || statusRaw.includes('succeeded') || statusRaw.includes('completed')) {
      payment.status = 'SUCCEEDED';
      payment.providerRef = data.transaction_id || data.txn_id || data.id || payment.providerRef;
      await payment.save();

      if (payment.type === 'membership') {
        // activate membership for user
        const plan = payment.plan || (data.metadata && data.metadata.plan);
        const days = PLAN_DAYS[plan] || PLAN_DAYS['basic'];
        const expiry = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

        await User.findByIdAndUpdate(payment.user, {
          membershipActive: true,
          membershipPlan: plan,
          membershipExpiry: expiry
        });
      } else if (payment.type === 'ad') {
        // approve car listing
        const carId = payment.metadata?.carId;
        if (carId) {
          const Car = require('../models/Car');
          await Car.findByIdAndUpdate(carId, {
            paymentStatus: 'PAID',
            isApproved: true
          });
        }
      } else if (payment.type === 'listing') {
        // Handle listing payment success
        await handleListingPaymentSuccess(payment, data);
      }

      // TODO: send email to user notifying activation (optional)
    } else if (statusRaw.includes('fail') || statusRaw.includes('failed') || statusRaw.includes('cancel')) {
      payment.status = 'FAILED';
      payment.providerRef = data.transaction_id || data.txn_id || data.id || payment.providerRef;
      await payment.save();

      // leave membership unchanged
    } else {
      // unknown event -> store metadata
      payment.metadata = payment.metadata || {};
      payment.metadata.lastWebhook = event;
      await payment.save();
    }

    return res.json({ received: true });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/payments/create-car-listing
 * body: { carId: 'car_id', amount: 5000 }
 * req.user must be logged in (owner)
 */
async function createCarListingPayment(req, res, next) {
  try {
    const userId = req.user && req.user._id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { carId, amount } = req.body;
    if (!carId || !amount) return res.status(400).json({ error: 'carId and amount required' });

    // Verify car belongs to user
    const Car = require('../models/Car');
    const car = await Car.findOne({ _id: carId, owner: userId });
    if (!car) return res.status(404).json({ error: 'Car not found' });

    // create Payment record
    const payment = await Payment.create({
      user: userId,
      type: 'ad',
      amount,
      currency: 'PKR',
      status: 'PENDING',
      metadata: { carId }
    });

    // use payment._id as order id
    const orderId = payment._id.toString();
    payment.orderId = orderId;
    await payment.save();

    // Update car with payment reference
    car.paymentId = payment._id;
    await car.save();

    // Build safepay payload for frontend
    const payload = {
      merchant_key: SAFE_PAY_KEY,
      order_id: orderId,
      amount: payment.amount,
      item_name: `Car Listing: ${car.brand} ${car.model}`,
      currency: payment.currency,
      return_url: `${FRONTEND_URL}/payment/callback`,
      notify_url: `${BASE_URL}/api/payments/webhook`,
      customer_name: req.user.name || '',
      customer_email: req.user.email || '',
      metadata: { paymentId: payment._id.toString(), carId }
    };

    res.json({ paymentId: payment._id, orderId, amount: payment.amount, payload });
  } catch (err) {
    next(err);
  }
}

/**
 * Calculate listing price based on user's existing listings
 * @param {string} userId - User ID
 * @param {boolean} featureAddon - Whether feature addon is selected
 * @returns {Object} Pricing breakdown
 */
async function calculateListingPrice(userId, featureAddon = false) {
  // Count user's published listings
  const publishedListingsCount = await Car.countDocuments({ 
    owner: userId, 
    isActive: true,
    isApproved: true 
  });
  
  const isFirstListing = publishedListingsCount === 0;
  const baseListingCost = isFirstListing ? 0 : 100; // PKR
  const featureCost = featureAddon ? 200 : 0; // PKR
  const totalCost = baseListingCost + featureCost;
  
  return {
    isFirstListing,
    baseListingCost,
    featureCost,
    totalCost,
    totalCostInPaise: totalCost * 100 // Convert to paise (integer)
  };
}

/**
 * Generate unique idempotency key
 */
function generateIdempotencyKey(userId, listingData) {
  const data = JSON.stringify({ userId, ...listingData });
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Handle successful listing payment and publish listing
 */
async function handleListingPaymentSuccess(payment, webhookData) {
  try {
    // Mark payment as succeeded with proper amounts
    const settledAmountInPaise = webhookData.amount || payment.requestedAmountInPaise;
    const gatewayFeesInPaise = webhookData.fee || 0;
    
    await payment.markAsSucceeded(
      webhookData.transaction_id || webhookData.txn_id || webhookData.id,
      settledAmountInPaise,
      gatewayFeesInPaise
    );

    // Get the listing draft
    const draft = await ListingDraft.findById(payment.listingDraftId);
    if (!draft) {
      console.error('Listing draft not found for payment:', payment._id);
      return;
    }

    // Check if already published
    if (draft.publishedListingId) {
      console.log('Listing already published for draft:', draft._id);
      return;
    }

    // Verify amount matches (with small tolerance for rounding)
    const amountDifference = Math.abs(settledAmountInPaise - draft.requestedAmountInPaise);
    if (amountDifference > 10) { // Allow 10 paise tolerance
      console.error('Amount mismatch for payment:', payment._id, {
        requested: draft.requestedAmountInPaise,
        settled: settledAmountInPaise,
        difference: amountDifference
      });
      // Don't publish if amount doesn't match
      return;
    }

    // Create the published listing
    const publishedCar = await Car.create({
      brand: draft.brand,
      model: draft.model,
      year: draft.year,
      category: draft.category,
      pricePerDay: draft.pricePerDay,
      images: draft.images,
      location: draft.location,
      city: draft.city,
      engineCapacity: draft.engineCapacity,
      fuelType: draft.fuelType,
      transmission: draft.transmission,
      mileage: draft.mileage,
      seating: draft.seating,
      features: draft.features,
      description: draft.description,
      owner: draft.ownerId,
      isActive: true,
      isApproved: true,
      isRented: false,
      featured: draft.featureAddon,
      paymentStatus: 'PAID',
      publishedAt: new Date()
    });

    // Mark draft as published
    await draft.markAsPublished(publishedCar._id);

    console.log('Successfully published listing:', publishedCar._id, 'from draft:', draft._id);

    // TODO: Send email notification to user
    // TODO: Send notification to admin about new published listing

  } catch (error) {
    console.error('Error handling listing payment success:', error);
    // Don't throw error to avoid webhook retry issues
  }
}

/**
 * POST /api/payments/create-listing-payment
 * Create payment for new listing with pricing calculation
 */
async function createListingPayment(req, res, next) {
  try {
    const userId = req.user && req.user._id;
    if (!userId) {
      return res.status(401).json({ error: 'You must be logged in to create a listing payment' });
    }

    const { listingDraft, feature = false } = req.body;
    
    if (!listingDraft) {
      return res.status(400).json({ error: 'Listing draft data is required' });
    }

    // Calculate pricing server-side
    const pricing = await calculateListingPrice(userId, feature);
    
    // If it's free, create and publish immediately
    if (pricing.totalCost === 0) {
      try {
        // Create the listing directly
        const newCar = await Car.create({
          ...listingDraft,
          owner: userId,
          isActive: true,
          isApproved: true,
          isRented: false,
          featured: feature,
          paymentStatus: 'PAID',
          publishedAt: new Date()
        });

        return res.json({
          success: true,
          freeListing: true,
          carId: newCar._id,
          message: 'Your first listing has been published for free!'
        });
      } catch (error) {
        console.error('Error creating free listing:', error);
        return res.status(500).json({ error: 'Failed to create free listing' });
      }
    }

    // Generate idempotency key
    const idempotencyKey = generateIdempotencyKey(userId, listingDraft);
    
    // Check for existing payment with same idempotency key
    const existingPayment = await Payment.findByIdempotencyKey(idempotencyKey);
    if (existingPayment) {
      return res.json({
        paymentId: existingPayment._id,
        orderId: existingPayment.orderId,
        checkout_url: existingPayment.metadata?.checkout_url,
        amount_in_paise: existingPayment.requestedAmountInPaise
      });
    }

    // Create listing draft
    const draft = await ListingDraft.create({
      ownerId: userId,
      ...listingDraft,
      requestedAmountInPaise: pricing.totalCostInPaise,
      featureAddon: feature,
      isFirstListing: pricing.isFirstListing,
      paymentRef: `listing_${Date.now()}_${userId}`,
      status: 'payment_pending'
    });

    // Create payment record
    const payment = await Payment.create({
      user: userId,
      type: 'listing',
      listingDraftId: draft._id,
      requestedAmountInPaise: pricing.totalCostInPaise,
      currency: 'PKR',
      status: 'PENDING',
      idempotencyKey,
      orderId: draft.paymentRef
    });

    // Create Safepay payment (server-to-server)
    try {
      const safepayPayload = {
        merchant_key: SAFE_PAY_KEY,
        order_id: draft.paymentRef,
        amount: pricing.totalCostInPaise, // Send amount in paise
        item_name: `Car Listing: ${listingDraft.brand} ${listingDraft.model}${feature ? ' (Featured)' : ''}`,
        currency: 'PKR',
        return_url: `${FRONTEND_URL}/payments/success?paymentId=${payment._id}`,
        notify_url: `${BASE_URL}/api/payments/webhook`,
        customer_name: req.user.name || '',
        customer_email: req.user.email || '',
        metadata: { 
          paymentId: payment._id.toString(),
          listingDraftId: draft._id.toString(),
          feature: feature.toString()
        }
      };

      // TODO: Replace with actual Safepay API call
      // For now, we'll simulate the response
      const checkout_url = `https://sandbox.safepay.com/checkout/${draft.paymentRef}`;
      
      // Store checkout URL in payment metadata
      payment.metadata = { checkout_url, safepayPayload };
      await payment.save();

      res.json({
        paymentId: payment._id,
        orderId: draft.paymentRef,
        checkout_url,
        amount_in_paise: pricing.totalCostInPaise,
        pricing: {
          baseListingCost: pricing.baseListingCost,
          featureCost: pricing.featureCost,
          totalCost: pricing.totalCost,
          isFirstListing: pricing.isFirstListing
        }
      });

    } catch (safepayError) {
      console.error('Safepay API error:', safepayError);
      
      // Mark payment as failed
      await payment.markAsFailed();
      await draft.updateOne({ status: 'payment_failed' });
      
      res.status(500).json({ 
        error: 'Failed to create payment with Safepay. Please try again.' 
      });
    }

  } catch (error) {
    console.error('Error creating listing payment:', error);
    next(error);
  }
}

/**
 * GET /api/payments/verify?paymentId=...
 * Verify payment status
 */
async function verifyPayment(req, res, next) {
  try {
    const { paymentId } = req.query;
    
    if (!paymentId) {
      return res.status(400).json({ error: 'Payment ID is required' });
    }

    const payment = await Payment.findById(paymentId).populate('listingDraftId');
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Check if user owns this payment
    if (payment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You must be the payment owner to verify this payment' });
    }

    // TODO: Verify with Safepay API if needed
    // For now, return current status from database
    
    const response = {
      paymentId: payment._id,
      status: payment.status,
      amount_in_paise: payment.requestedAmountInPaise,
      settled_amount_in_paise: payment.settledAmountInPaise,
      gateway_fees_in_paise: payment.gatewayFeesInPaise,
      providerRef: payment.providerRef,
      paidAt: payment.paidAt,
      createdAt: payment.createdAt
    };

    // If payment succeeded and has listing draft, include listing info
    if (payment.status === 'SUCCEEDED' && payment.listingDraftId) {
      const draft = payment.listingDraftId;
      response.listing = {
        draftId: draft._id,
        status: draft.status,
        publishedListingId: draft.publishedListingId,
        publishedAt: draft.publishedAt
      };
    }

    res.json(response);

  } catch (error) {
    console.error('Error verifying payment:', error);
    next(error);
  }
}

/**
 * GET /api/payments/pending-listings
 * Get user's pending payment listings
 */
async function getPendingListings(req, res, next) {
  try {
    const userId = req.user && req.user._id;
    if (!userId) {
      return res.status(401).json({ error: 'You must be logged in' });
    }

    const pendingDrafts = await ListingDraft.findPendingPayments(userId);
    
    const result = await Promise.all(
      pendingDrafts.map(async (draft) => {
        const payment = await Payment.findByListingDraft(draft._id);
        return {
          draftId: draft._id,
          paymentId: payment?._id,
          status: draft.status,
          requestedAmountInPaise: draft.requestedAmountInPaise,
          featureAddon: draft.featureAddon,
          carDetails: {
            brand: draft.brand,
            model: draft.model,
            year: draft.year,
            category: draft.category
          },
          createdAt: draft.createdAt,
          paymentStatus: payment?.status,
          publishedListingId: draft.publishedListingId
        };
      })
    );

    res.json({ pendingListings: result });

  } catch (error) {
    console.error('Error fetching pending listings:', error);
    next(error);
  }
}

module.exports = { 
  createMembershipCheckout, 
  createCarListingPayment, 
  createListingPayment,
  verifyPayment,
  getPendingListings,
  webhook,
  calculateListingPrice
};
