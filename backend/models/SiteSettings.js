// backend/models/SiteSettings.js
const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
  key: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  value: { 
    type: String, 
    required: true 
  }
}, { 
  timestamps: true,
  // Use a custom collection name
  collection: 'site_settings'
});

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);

