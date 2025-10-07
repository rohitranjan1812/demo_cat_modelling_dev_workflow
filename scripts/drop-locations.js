/**
 * Drop locations collection to remove broken 2dsphere index
 */

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cat_modeling_exposure';

async function dropLocationCollection() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected\n');

    const db = mongoose.connection.db;
    
    // Drop locations collection (including all indexes)
    try {
      await db.collection('locations').drop();
      console.log('✓ Dropped locations collection (including broken 2dsphere index)');
    } catch (error) {
      if (error.message.includes('ns not found')) {
        console.log('✓ Locations collection does not exist (nothing to drop)');
      } else {
        throw error;
      }
    }

    await mongoose.disconnect();
    console.log('✓ Disconnected');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

dropLocationCollection()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
