const mongoose = require('mongoose');
require('dotenv').config();

const SimulationRun = require('../src/models/SimulationRun');

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cat_modeling_dev');
    const result = await SimulationRun.deleteMany({});
    console.log(`Deleted ${result.deletedCount} old simulations`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

cleanup();
