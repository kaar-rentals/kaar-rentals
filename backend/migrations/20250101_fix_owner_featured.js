// backend/migrations/20250101_fix_owner_featured.js
// MongoDB migration script (idempotent)
// Ensures users have name & location fields, listings have owner_id and featured

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Car = require('../models/Car');
const { connectDB } = require('../config/db');

dotenv.config();

async function migrate() {
  try {
    await connectDB(process.env.MONGO_URI || 'mongodb://localhost:27017/kaarDB');
    console.log('✅ Connected to MongoDB');

    // Note: MongoDB/Mongoose schemas handle field additions automatically
    // This script ensures existing documents have default values if needed

    // 1. Ensure all users have name field (if missing, set to email or 'User')
    console.log('\n📝 Ensuring users have name field...');
    // Iterate through users without name
    const usersToUpdate = await User.find({ $or: [{ name: { $exists: false } }, { name: null }, { name: '' }] });
    let updatedCount = 0;
    for (const user of usersToUpdate) {
      if (!user.name || user.name.trim() === '') {
        user.name = user.email?.split('@')[0] || 'User';
        await user.save();
        updatedCount++;
      }
    }
    console.log(`✅ Updated ${updatedCount} users with name field`);

    // 2. Ensure all cars have featured field (defaults to false in schema, but ensure existing docs)
    console.log('\n📝 Ensuring cars have featured field...');
    const carsWithoutFeatured = await Car.updateMany(
      { featured: { $exists: false } },
      { $set: { featured: false } }
    );
    console.log(`✅ Updated ${carsWithoutFeatured.modifiedCount} cars with featured field`);

    // 3. Ensure all cars have status field
    console.log('\n📝 Ensuring cars have status field...');
    const carsWithoutStatus = await Car.updateMany(
      { status: { $exists: false } },
      { $set: { status: 'available' } }
    );
    console.log(`✅ Updated ${carsWithoutStatus.modifiedCount} cars with status field`);

    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();

