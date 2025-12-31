// MongoDB migration: Add phone, status, and remove reviews
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

    // Ensure users have phone field
    console.log('Updating users collection...');
    await User.updateMany(
      { phone: { $exists: false } },
      { $set: { phone: null } }
    );
    console.log('Users collection updated with phone field');

    // Ensure cars have status field
    console.log('Updating cars collection...');
    await Car.updateMany(
      { status: { $exists: false } },
      { $set: { status: 'available' } }
    );
    console.log('Cars collection updated with status field');

    // Remove reviews collection if it exists
    console.log('Checking for reviews collection...');
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const reviewsCollection = collections.find(col => col.name === 'reviews');
    if (reviewsCollection) {
      await db.collection('reviews').drop();
      console.log('Reviews collection dropped');
    } else {
      console.log('No reviews collection found');
    }

    // Remove rating and review_text fields from cars if they exist
    // Note: MongoDB doesn't have a direct way to check if a field exists in schema
    // We'll just try to unset them - it's safe if they don't exist
    await Car.updateMany(
      {},
      { $unset: { rating: "", review_text: "" } }
    );
    console.log('Removed rating and review_text fields from cars (if they existed)');

    // Create indexes
    console.log('Creating indexes...');
    await Car.collection.createIndex({ status: 1 }).catch(() => {});
    await User.collection.createIndex({ phone: 1 }).catch(() => {});
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

