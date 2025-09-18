// backend/models/Payment.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // payer (owner)
  type: { type: String, enum: ['membership','ad'], required: true },
  plan: { type: String, default: null }, // membership plan slug
  orderId: { type: String, default: null }, // payment order id (we can store _id here too)
  provider: { type: String, default: 'safepay' },
  providerRef: { type: String, default: null }, // provider transaction id
  amount: { type: Number, required: true }, // paisa or smallest unit
  currency: { type: String, default: 'PKR' },
  status: { type: String, enum: ['PENDING','SUCCEEDED','FAILED'], default: 'PENDING' },
  metadata: { type: Object, default: {} }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
