// MongoDB migration: Create site_settings collection
// This script is idempotent - safe to run multiple times

const mongoose = require('mongoose');
const SiteSettings = require('../models/SiteSettings');
require('dotenv').config();

async function runMigration() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/kaarDB';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Check if listings_enabled already exists
    const existing = await SiteSettings.findOne({ key: 'listings_enabled' });
    if (!existing) {
      await SiteSettings.create({
        key: 'listings_enabled',
        value: 'false'
      });
      console.log('Created listings_enabled setting with default value: false');
    } else {
      console.log('listings_enabled setting already exists');
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if called directly
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };

