// MongoDB migration: Add required fields to users and cars collections
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

    // Add fields to users collection if they don't exist
    console.log('Updating users collection...');
    await User.updateMany(
      { name: { $exists: false } },
      { $set: { name: null } }
    );
    await User.updateMany(
      { phone: { $exists: false } },
      { $set: { phone: null } }
    );
    await User.updateMany(
      { location: { $exists: false } },
      { $set: { location: null } }
    );
    await User.updateMany(
      { unique_id: { $exists: false } },
      { $set: { unique_id: null } }
    );
    await User.updateMany(
      { is_admin: { $exists: false } },
      { $set: { is_admin: false } }
    );
    console.log('Users collection updated');

    // Add fields to cars collection if they don't exist
    console.log('Updating cars collection...');
    await Car.updateMany(
      { featured: { $exists: false } },
      { $set: { featured: false } }
    );
    await Car.updateMany(
      { status: { $exists: false } },
      { $set: { status: 'available' } }
    );
    await Car.updateMany(
      { owner_type: { $exists: false } },
      { $set: { owner_type: 'user' } }
    );
    console.log('Cars collection updated');

    // Create indexes (MongoDB handles duplicate index creation gracefully)
    console.log('Creating indexes...');
    await Car.collection.createIndex({ featured: 1 }).catch(() => {});
    await Car.collection.createIndex({ createdAt: -1 }).catch(() => {});
    await Car.collection.createIndex({ owner: 1 }).catch(() => {});
    await Car.collection.createIndex({ status: 1 }).catch(() => {});
    await User.collection.createIndex({ unique_id: 1 }).catch(() => {});
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

