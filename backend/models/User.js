// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true, sparse: true, required: false },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'owner', 'admin'], default: 'user' },
  phone: { type: String, trim: true, required: true },
  location: { type: String },
  unique_id: { type: String, unique: true, sparse: true },
  is_admin: { type: Boolean, default: false },

  // Membership fields
  membershipActive: { type: Boolean, default: false },
  membershipPlan: { type: String, default: null }, // e.g., 'basic','premium'
  membershipExpiry: { type: Date, default: null }
}, { timestamps: true });

// Index for faster lookups
userSchema.index({ unique_id: 1 });

module.exports = mongoose.model('User', userSchema);
