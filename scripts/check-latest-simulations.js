const mongoose = require('mongoose');
require('dotenv').config();

const SimulationRun = require('../src/models/SimulationRun');

async function checkSimulations() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cat_modeling_dev');
    console.log('Connected to MongoDB\n');
    
    const runs = await SimulationRun.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();
    
    console.log(`Found ${runs.length} most recent simulations:\n`);
    
    runs.forEach((run, i) => {
      console.log(`${i+1}. ${run.simulationRunId}`);
      console.log(`   Name: ${run.simulationName}`);
      console.log(`   Status: ${run.status}`);
      console.log(`   Events: ${run.results?.totalEvents || 0}`);
      console.log(`   Total Loss: $${(run.results?.totalLoss || 0).toLocaleString('en-US', {maximumFractionDigits: 2})}`);
      console.log(`   AAL: ${(run.results?.expectedLoss || 0).toLocaleString('en-US', {maximumFractionDigits: 2})}`);
      console.log(`   Max Event Loss: $${(run.results?.maxLoss || 0).toLocaleString('en-US', {maximumFractionDigits: 2})}`);
      console.log(`   Avg Event Loss: $${(run.results?.averageLoss || 0).toLocaleString('en-US', {maximumFractionDigits: 2})}`);
      console.log(`   Affected Regions: ${(run.results?.affectedRegions || []).join(', ') || 'N/A'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkSimulations();
