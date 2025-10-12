const mongoose = require('mongoose');

const listingDraftSchema = new mongoose.Schema({
  // Owner information
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Listing data (same structure as Car model)
  brand: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  category: {
    type: String,
    required: true,
    enum: ['Sedan', 'SUV', 'Hatchback'],
    index: true
  },
  pricePerDay: {
    type: Number,
    required: true,
    min: 0
  },
  images: [{
    type: String,
    required: true
  }],
  location: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  engineCapacity: {
    type: String,
    required: true,
    trim: true
  },
  fuelType: {
    type: String,
    required: true,
    trim: true
  },
  transmission: {
    type: String,
    required: true,
    trim: true
  },
  mileage: {
    type: String,
    required: true,
    trim: true
  },
  seating: {
    type: Number,
    required: true,
    min: 1,
    max: 20
  },
  features: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    required: true,
    trim: true
  },

  // Payment and pricing information
  requestedAmountInPaise: {
    type: Number,
    required: true,
    min: 0
  },
  featureAddon: {
    type: Boolean,
    default: false
  },
  isFirstListing: {
    type: Boolean,
    default: false
  },

  // Payment reference
  paymentRef: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // Status tracking
  status: {
    type: String,
    enum: ['payment_pending', 'payment_failed', 'payment_success', 'published', 'cancelled'],
    default: 'payment_pending',
    index: true
  },

  // Published listing reference (if successfully published)
  publishedListingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    default: null
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  publishedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for performance
listingDraftSchema.index({ ownerId: 1, status: 1 });
listingDraftSchema.index({ paymentRef: 1 });
listingDraftSchema.index({ createdAt: -1 });

// Virtual for amount in PKR
listingDraftSchema.virtual('requestedAmountInPKR').get(function() {
  return this.requestedAmountInPaise / 100;
});

// Method to check if draft is ready for publishing
listingDraftSchema.methods.isReadyForPublishing = function() {
  return this.status === 'payment_success' && !this.publishedListingId;
};

// Method to mark as published
listingDraftSchema.methods.markAsPublished = function(listingId) {
  this.status = 'published';
  this.publishedListingId = listingId;
  this.publishedAt = new Date();
  return this.save();
};

// Static method to find pending payments for user
listingDraftSchema.statics.findPendingPayments = function(ownerId) {
  return this.find({
    ownerId,
    status: { $in: ['payment_pending', 'payment_success'] }
  }).sort({ createdAt: -1 });
};

// Static method to find drafts by payment reference
listingDraftSchema.statics.findByPaymentRef = function(paymentRef) {
  return this.findOne({ paymentRef });
};

module.exports = mongoose.model('ListingDraft', listingDraftSchema);
