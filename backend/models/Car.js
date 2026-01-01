// backend/models/Car.js
const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Legacy field for backward compatibility
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  category: { type: String, enum: ['Sedan', 'SUV', 'Hatchback'], required: true },
  pricePerDay: { type: Number, required: true },
  price: { type: Number, required: true }, // Alias for pricePerDay for consistency
  priceType: { type: String, enum: ['daily', 'monthly'], default: 'daily' },
  images: [String],
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
  featured: { type: Boolean, default: false },
  status: { type: String, enum: ['available', 'rented'], default: 'available' },
  owner_type: { type: String, enum: ['user', 'dealership'], default: 'user' }
}, { timestamps: true });

// Indexes for performance
carSchema.index({ featured: 1 });
carSchema.index({ createdAt: -1 });
carSchema.index({ ownerId: 1 });
carSchema.index({ owner: 1 }); // Legacy index
carSchema.index({ status: 1 });

module.exports = mongoose.model('Car', carSchema);
