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
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }
}, { timestamps: true });

module.exports = mongoose.model('Car', carSchema);
