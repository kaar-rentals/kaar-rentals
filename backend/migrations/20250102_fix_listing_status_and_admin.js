// MongoDB migration: Add is_admin flag, owner_id, and status fields
// This script is idempotent - safe to run multiple times

const mongoose = require('mongoose');
const User = require('../models/User');
const Car = require('../models/Car');
require('dotenv').config();

async function runMigration() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/kaarDB';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Add is_admin flag to users collection if it doesn't exist
    console.log('Updating users collection...');
    await User.updateMany(
      { is_admin: { $exists: false } },
      { $set: { is_admin: false } }
    );
    console.log('Users collection updated with is_admin flag');

    // Add status field to cars collection if it doesn't exist
    console.log('Updating cars collection...');
    await Car.updateMany(
      { status: { $exists: false } },
      { $set: { status: 'available' } }
    );
    console.log('Cars collection updated with status field');

    // Ensure owner field exists (it should already exist, but ensure it's set)
    await Car.updateMany(
      { owner: { $exists: false } },
      { $set: { owner: null } }
    );
    console.log('Cars collection owner field verified');

    // Create indexes (MongoDB handles duplicate index creation gracefully)
    console.log('Creating indexes...');
    await Car.collection.createIndex({ owner: 1 }).catch(() => {});
    await Car.collection.createIndex({ status: 1 }).catch(() => {});
    await User.collection.createIndex({ is_admin: 1 }).catch(() => {});
    console.log('Indexes created');

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

