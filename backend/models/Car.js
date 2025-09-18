// backend/models/Car.js
const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // set at create
  brand: String,
  model: String,
  year: Number,
  pricePerDay: Number,
  images: [String],
  location: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Car', carSchema);
