// backend/models/Car.js
const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  category: { type: String, enum: ['Sedan', 'SUV', 'Hatchback'], required: true },
  pricePerDay: { type: Number, required: true },
  images: [String],
  public_id: { type: String, unique: true, sparse: true }, // Format: A-xxxx (ad public_id)
  createdByAdmin: { type: Boolean, default: false }, // Flag for admin-created ads
  location: { type: String, required: true },
  city: { type: String, required: true }, // Karachi, Lahore, Islamabad
  engineCapacity: { type: String, required: true },
  fuelType: { type: String, required: true },
  transmission: { type: String, required: true },
  mileage: { type: String, required: true },
  seating: { type: Number, required: true },
  features: [String],
  description: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  isRented: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false }, // Admin approval required
  paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'FAILED'], default: 'PENDING' },
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  status: { type: String, enum: ['available', 'rented'], default: 'available' }, // Listing status
  featured: { type: Boolean, default: false } // Featured listing flag
}, { timestamps: true });

// Indexes for performance
carSchema.index({ createdAt: -1 });
carSchema.index({ owner: 1 });
carSchema.index({ featured: 1 });
carSchema.index({ status: 1 });

module.exports = mongoose.model('Car', carSchema);
