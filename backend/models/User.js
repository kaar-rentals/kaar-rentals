// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'owner', 'admin'], default: 'user' },
  public_id: { type: String, unique: true, sparse: true }, // Format: U-xxxx
  unique_id: { type: String, unique: true, sparse: true }, // 8-12 char alphanumeric unique ID
  is_admin: { type: Boolean, default: false }, // Admin flag (can also use role === 'admin')
  location: { type: String }, // User location

  // Membership fields
  membershipActive: { type: Boolean, default: false },
  membershipPlan: { type: String, default: null }, // e.g., 'basic','premium'
  membershipExpiry: { type: Date, default: null }
}, { timestamps: true });

// Index for faster lookups
userSchema.index({ unique_id: 1 });

module.exports = mongoose.model('User', userSchema);
