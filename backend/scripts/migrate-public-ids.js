#!/usr/bin/env node
/**
 * Migration script: Add public_ids and detect orphaned ads
 * 
 * Usage:
 *   node migrate-public-ids.js                    # Dry-run (default)
 *   node migrate-public-ids.js --allow-deletions  # Actually delete orphans
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Car = require('../models/Car');

dotenv.config();

const ALLOW_DELETIONS = process.argv.includes('--allow-deletions');

// Generate unique public_id
function generatePublicId(prefix) {
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${random}`;
}

// Ensure unique public_id
async function ensureUniquePublicId(Model, prefix, existingId = null) {
  let publicId = existingId || generatePublicId(prefix);
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const existing = await Model.findOne({ public_id: publicId });
    if (!existing) {
      return publicId;
    }
    publicId = generatePublicId(prefix);
    attempts++;
  }

  throw new Error(`Failed to generate unique public_id after ${maxAttempts} attempts`);
}

async function migrateUsers() {
  console.log('\n=== Migrating Users ===');
  const usersWithoutPublicId = await User.find({ public_id: { $exists: false } });
  console.log(`Found ${usersWithoutPublicId.length} users without public_id`);

  const updates = [];
  for (const user of usersWithoutPublicId) {
    const publicId = await ensureUniquePublicId(User, 'U');
    updates.push({
      userId: user._id,
      email: user.email,
      publicId: publicId
    });
    
    if (!ALLOW_DELETIONS) {
      console.log(`  [DRY-RUN] Would add public_id ${publicId} to user ${user.email}`);
    } else {
      await User.findByIdAndUpdate(user._id, { public_id: publicId });
      console.log(`  ✓ Added public_id ${publicId} to user ${user.email}`);
    }
  }

  return updates;
}

async function migrateCars() {
  console.log('\n=== Migrating Cars ===');
  const carsWithoutPublicId = await Car.find({ public_id: { $exists: false } });
  console.log(`Found ${carsWithoutPublicId.length} cars without public_id`);

  const updates = [];
  for (const car of carsWithoutPublicId) {
    const publicId = await ensureUniquePublicId(Car, 'A');
    updates.push({
      carId: car._id,
      title: `${car.year} ${car.brand} ${car.model}`,
      ownerId: car.owner,
      publicId: publicId
    });
    
    if (!ALLOW_DELETIONS) {
      console.log(`  [DRY-RUN] Would add public_id ${publicId} to car ${car._id}`);
    } else {
      await Car.findByIdAndUpdate(car._id, { public_id: publicId });
      console.log(`  ✓ Added public_id ${publicId} to car ${car._id}`);
    }
  }

  return updates;
}

async function detectOrphanedAds() {
  console.log('\n=== Detecting Orphaned Ads ===');
  
  // Find cars with invalid owner references
  const allCars = await Car.find().populate('owner');
  const orphanedCars = [];
  const validCars = [];

  for (const car of allCars) {
    if (!car.owner || !car.owner._id) {
      orphanedCars.push({
        carId: car._id,
        publicId: car.public_id,
        title: `${car.year} ${car.brand} ${car.model}`,
        ownerId: car.owner?.toString() || 'null',
        reason: 'Owner reference is null or invalid'
      });
    } else {
      validCars.push(car);
    }
  }

  console.log(`Found ${orphanedCars.length} orphaned ads`);
  
  if (orphanedCars.length > 0) {
    console.log('\nOrphaned ads:');
    orphanedCars.forEach((ad, idx) => {
      console.log(`  ${idx + 1}. Car ID: ${ad.carId}, Public ID: ${ad.publicId || 'N/A'}`);
      console.log(`     Title: ${ad.title}`);
      console.log(`     Owner ID: ${ad.ownerId}`);
      console.log(`     Reason: ${ad.reason}`);
    });

    if (ALLOW_DELETIONS) {
      console.log('\n⚠️  DELETING ORPHANED ADS...');
      for (const ad of orphanedCars) {
        await Car.findByIdAndDelete(ad.carId);
        console.log(`  ✓ Deleted car ${ad.carId}`);
      }
    } else {
      console.log('\n[DRY-RUN] Would delete orphaned ads. Use --allow-deletions to actually delete.');
    }
  } else {
    console.log('  ✓ No orphaned ads found');
  }

  return { orphanedCars, validCars };
}

async function detectCopiedAds() {
  console.log('\n=== Detecting Potential Copied Ads ===');
  
  // Group cars by owner and check for duplicates
  const carsByOwner = {};
  const allCars = await Car.find().lean();

  for (const car of allCars) {
    const ownerId = car.owner?.toString();
    if (!ownerId) continue;

    if (!carsByOwner[ownerId]) {
      carsByOwner[ownerId] = [];
    }
    carsByOwner[ownerId].push(car);
  }

  const potentialCopies = [];
  for (const [ownerId, cars] of Object.entries(carsByOwner)) {
    // Check for duplicate entries (same brand, model, year)
    const seen = new Map();
    for (const car of cars) {
      const key = `${car.brand}-${car.model}-${car.year}`;
      if (seen.has(key)) {
        potentialCopies.push({
          carId: car._id,
          publicId: car.public_id,
          title: `${car.year} ${car.brand} ${car.model}`,
          ownerId: ownerId,
          duplicateOf: seen.get(key),
          reason: 'Potential duplicate (same brand/model/year)'
        });
      } else {
        seen.set(key, car._id);
      }
    }
  }

  console.log(`Found ${potentialCopies.length} potential copied ads`);
  
  if (potentialCopies.length > 0) {
    console.log('\nPotential copies (manual review recommended):');
    potentialCopies.forEach((ad, idx) => {
      console.log(`  ${idx + 1}. Car ID: ${ad.carId}, Public ID: ${ad.publicId || 'N/A'}`);
      console.log(`     Title: ${ad.title}`);
      console.log(`     Owner ID: ${ad.ownerId}`);
      console.log(`     Duplicate of: ${ad.duplicateOf}`);
      console.log(`     Reason: ${ad.reason}`);
    });
    console.log('\n⚠️  These require manual review. Not deleting automatically.');
  } else {
    console.log('  ✓ No potential copies detected');
  }

  return potentialCopies;
}

async function main() {
  try {
    console.log('=== Migration Script ===');
    console.log(`Mode: ${ALLOW_DELETIONS ? 'LIVE (deletions enabled)' : 'DRY-RUN (no changes)'}`);
    
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/kaarDB';
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB');

    const userUpdates = await migrateUsers();
    const carUpdates = await migrateCars();
    const { orphanedCars } = await detectOrphanedAds();
    const potentialCopies = await detectCopiedAds();

    console.log('\n=== Summary ===');
    console.log(`Users updated: ${userUpdates.length}`);
    console.log(`Cars updated: ${carUpdates.length}`);
    console.log(`Orphaned ads found: ${orphanedCars.length}`);
    console.log(`Potential copies found: ${potentialCopies.length}`);

    if (!ALLOW_DELETIONS && (orphanedCars.length > 0 || potentialCopies.length > 0)) {
      console.log('\n⚠️  Run with --allow-deletions to apply changes and delete orphans');
    }

    await mongoose.disconnect();
    console.log('\n✓ Migration complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

main();



