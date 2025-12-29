// backend/models/SiteSettings.js
const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);

