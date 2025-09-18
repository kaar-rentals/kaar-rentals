// backend/controllers/paymentController.js
const axios = require('axios');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const User = require('../models/User');

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

      // activate membership for user
      const plan = payment.plan || (data.metadata && data.metadata.plan);
      const days = PLAN_DAYS[plan] || PLAN_DAYS['basic'];
      const expiry = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

      await User.findByIdAndUpdate(payment.user, {
        membershipActive: true,
        membershipPlan: plan,
        membershipExpiry: expiry
      });

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

module.exports = { createMembershipCheckout, webhook };
