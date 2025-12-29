// backend/scripts/migrate-unique-id.js
// Migration script to add unique_id to existing users and create site_settings collection
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const SiteSettings = require('../models/SiteSettings');
const generateUniqueId = require('../utils/generateUniqueId');
const { connectDB } = require('../config/db');

dotenv.config();

async function migrate() {
  try {
    // Connect to MongoDB
    await connectDB(process.env.MONGO_URI || 'mongodb://localhost:27017/kaarDB');
    console.log('✅ Connected to MongoDB');

    // 1. Add unique_id to existing users
    console.log('\n📝 Adding unique_id to existing users...');
    const users = await User.find({ unique_id: { $exists: false } });
    console.log(`Found ${users.length} users without unique_id`);

    for (const user of users) {
      let uniqueId;
      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts) {
        uniqueId = generateUniqueId();
        const existing = await User.findOne({ unique_id: uniqueId });
        if (!existing) break;
        attempts++;
      }
      
      if (attempts >= maxAttempts) {
        console.error(`❌ Failed to generate unique_id for user ${user._id}`);
        continue;
      }
      
      user.unique_id = uniqueId;
      await user.save();
      console.log(`✅ Added unique_id ${uniqueId} to user ${user.email}`);
    }

    // 2. Create site_settings collection with default value
    console.log('\n📝 Creating site_settings collection...');
    const existingSetting = await SiteSettings.findOne({ key: 'listings_enabled' });
    if (!existingSetting) {
      await SiteSettings.create({
        key: 'listings_enabled',
        value: 'false'
      });
      console.log('✅ Created listings_enabled setting (default: false)');
    } else {
      console.log('✅ listings_enabled setting already exists');
    }

    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();

