// backend/models/Payment.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  }, // payer (owner)
  
  type: { 
    type: String, 
    enum: ['membership', 'ad', 'listing'], 
    required: true,
    index: true
  },
  
  plan: { 
    type: String, 
    default: null 
  }, // membership plan slug
  
  // Listing payment specific fields
  listingDraftId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ListingDraft',
    default: null
  },
  
  orderId: { 
    type: String, 
    default: null,
    unique: true,
    sparse: true
  }, // payment order id (we can store _id here too)
  
  provider: { 
    type: String, 
    default: 'safepay' 
  },
  
  providerRef: { 
    type: String, 
    default: null,
    index: true
  }, // provider transaction id
  
  // Money handling with integer paise (fix rounding bug)
  requestedAmountInPaise: { 
    type: Number, 
    required: true,
    min: 0
  }, // amount requested in paise
  
  settledAmountInPaise: { 
    type: Number, 
    default: null,
    min: 0
  }, // amount actually settled by gateway in paise
  
  gatewayFeesInPaise: { 
    type: Number, 
    default: null,
    min: 0
  }, // gateway fees in paise
  
  currency: { 
    type: String, 
    default: 'PKR' 
  },
  
  status: { 
    type: String, 
    enum: ['PENDING', 'SUCCEEDED', 'FAILED', 'CANCELLED', 'EXPIRED'], 
    default: 'PENDING',
    index: true
  },
  
  // Idempotency key to prevent duplicate charges
  idempotencyKey: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  
  // Webhook tracking
  webhookReceived: {
    type: Boolean,
    default: false
  },
  
  webhookSignature: {
    type: String,
    default: null
  },
  
  // Timestamps
  paidAt: {
    type: Date,
    default: null
  },
  
  failedAt: {
    type: Date,
    default: null
  },
  
  metadata: { 
    type: Object, 
    default: {} 
  }
}, { 
  timestamps: true 
});

// Indexes for performance
paymentSchema.index({ user: 1, type: 1, status: 1 });
paymentSchema.index({ listingDraftId: 1 });
paymentSchema.index({ createdAt: -1 });

// Virtual for requested amount in PKR
paymentSchema.virtual('requestedAmountInPKR').get(function() {
  return this.requestedAmountInPaise / 100;
});

// Virtual for settled amount in PKR
paymentSchema.virtual('settledAmountInPKR').get(function() {
  return this.settledAmountInPaise ? this.settledAmountInPaise / 100 : null;
});

// Virtual for gateway fees in PKR
paymentSchema.virtual('gatewayFeesInPKR').get(function() {
  return this.gatewayFeesInPaise ? this.gatewayFeesInPaise / 100 : null;
});

// Virtual for net amount received in PKR
paymentSchema.virtual('netAmountInPKR').get(function() {
  if (this.settledAmountInPaise && this.gatewayFeesInPaise) {
    return (this.settledAmountInPaise - this.gatewayFeesInPaise) / 100;
  }
  return null;
});

// Method to mark payment as succeeded
paymentSchema.methods.markAsSucceeded = function(providerRef, settledAmountInPaise, gatewayFeesInPaise = 0) {
  this.status = 'SUCCEEDED';
  this.providerRef = providerRef;
  this.settledAmountInPaise = settledAmountInPaise;
  this.gatewayFeesInPaise = gatewayFeesInPaise;
  this.paidAt = new Date();
  return this.save();
};

// Method to mark payment as failed
paymentSchema.methods.markAsFailed = function() {
  this.status = 'FAILED';
  this.failedAt = new Date();
  return this.save();
};

// Static method to find payments by listing draft
paymentSchema.statics.findByListingDraft = function(listingDraftId) {
  return this.findOne({ listingDraftId });
};

// Static method to find payments by provider reference
paymentSchema.statics.findByProviderRef = function(providerRef) {
  return this.findOne({ providerRef });
};

// Static method to find payments by idempotency key
paymentSchema.statics.findByIdempotencyKey = function(idempotencyKey) {
  return this.findOne({ idempotencyKey });
};

module.exports = mongoose.model('Payment', paymentSchema);
