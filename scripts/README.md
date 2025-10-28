# CAT Model Simulation Scripts

This directory contains scripts for generating exposure data and running CAT model simulations at scale.

## Scripts Overview

### 1. `generate-india-exposure-data.js`
Generates comprehensive exposure data for India CAT modeling.

**What it generates:**
- 1,000 Accounts (insurance accounts)
- 2,000 Policies (linked to accounts)
- 10,000 Locations (across India)
- 10,000 Exposures (linked to accounts, policies, and locations)

**Usage:**
```bash
node scripts/generate-india-exposure-data.js
```

**Features:**
- Geographic distribution across all Indian states
- Realistic property values in INR
- Proper Account → Policy → Location → Exposure relationships
- Batch processing for efficiency
- Progress tracking

**Output:**
- Creates data in MongoDB `cat_modeling_dev` database
- Displays summary statistics
- Total Insured Value: ~₹400-600 Billion INR

---

### 2. `batch-simulation-runner.js`
Runs thousands of CAT model simulations in batches.

**Usage:**
```bash
# Run 100 simulations (default)
node scripts/batch-simulation-runner.js

# Run 1000 simulations
node scripts/batch-simulation-runner.js 1000

# Run 5000 simulations
node scripts/batch-simulation-runner.js 5000
```

**Features:**
- Batch processing (50 simulations per batch)
- Concurrent execution (up to 10 simultaneous simulations)
- Progress tracking and reporting
- Performance metrics
- Results export to JSON
- Comprehensive statistics

**Configuration:**
- `BATCH_SIZE`: 50 (simulations per batch)
- `MAX_CONCURRENT`: 10 (max parallel simulations)
- `RETRY_ATTEMPTS`: 3 (retry on failure)

**Output:**
- Results saved to `simulation-results/` directory
- Console progress updates
- Performance statistics
- Loss analysis

---

## Prerequisites

### 1. MongoDB Must Be Running
```bash
# Start MongoDB
mongod --dbpath ./data

# Or use Windows service
net start MongoDB
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Ensure `.env` file has correct MongoDB URI:
```
MONGODB_URI=mongodb://localhost:27017/cat_modeling_dev
```

---

## Complete Workflow

### Step 1: Generate Exposure Data
```bash
# This must be run first - simulations need exposure data!
node scripts/generate-india-exposure-data.js
```

**Expected output:**
```
🇮🇳 INDIA CAT MODELING - EXPOSURE DATA GENERATOR
============================================================

🔌 Connecting to MongoDB: mongodb://localhost:27017/cat_modeling_dev
✅ Connected to MongoDB successfully

📊 Generating 1000 Accounts...
   ✅ Created 1000 accounts

📋 Generating 2000 Policies...
   ✅ Created 2000 policies

📍 Generating 10000 Locations across India...
   ⏳ Progress: 500/10000 locations created
   ⏳ Progress: 1000/10000 locations created
   ...
   ✅ Created 10000 locations

💰 Generating 10000 Exposures...
   ⏳ Progress: 500/10000 exposures created
   ...
   ✅ Created 10000 exposures

============================================================
📈 DATA GENERATION SUMMARY
============================================================

📊 Accounts:       1,000
📋 Policies:       2,000
📍 Locations:      10,000
💰 Exposures:      10,000

💵 Total Insured Value: ₹453.27 Billion INR
💵 Average Exposure:    ₹45.33 Million INR

🗺️  Top 5 States by Exposure Count:
   1. Maharashtra: 1,234
   2. Karnataka: 1,098
   3. Tamil Nadu: 987
   ...

✅ Data generation completed successfully!
🚀 Ready for CAT model simulations
```

### Step 2: Run Test Simulations
```bash
# Run a few test simulations to verify everything works
node scripts/batch-simulation-runner.js 10
```

### Step 3: Run Large-Scale Simulations
```bash
# Run 1000 simulations
node scripts/batch-simulation-runner.js 1000

# Run 5000 simulations (takes ~10-15 minutes)
node scripts/batch-simulation-runner.js 5000
```

**Expected output:**
```
🚀 BATCH CAT MODEL SIMULATION RUNNER
============================================================

🎯 Target: 1,000 simulations
📦 Batch Size: 50
⚡ Max Concurrent: 10

✅ Found 10,000 exposures in database

📝 Generating 1000 simulation configurations...

📦 Processing Batch 1/20 (50 simulations)
────────────────────────────────────────────────────────────
   ✅ Simulation 1/50
   ✅ Simulation 2/50
   ...

   ⏱️  Batch Duration: 12.34s
   ✅ Successful: 48
   ❌ Failed: 2

📊 Overall Progress: 5.0% (50/1000)
   ✅ Success: 48 | ❌ Failed: 2

...

============================================================
🎉 BATCH PROCESSING COMPLETE
============================================================

⏱️  Total Duration: 245.67s
📊 Total Simulations: 1000
✅ Successful: 976
❌ Failed: 24
⚡ Throughput: 4.07 simulations/second

💾 Results saved to: simulation-results/batch-results-2025-01-08T12-30-45.json

============================================================
📊 BATCH SIMULATION STATISTICS
============================================================

📈 Total Simulations:      1,000
✅ Completed:              976 (97.6%)
❌ Failed:                 24 (2.4%)

💰 Loss Statistics:
   Total Loss:       ₹234.56 Billion
   Average Loss:     ₹240.33 Million
   Max Loss:         ₹1,234.56 Million
   Min Loss:         ₹12.34 Million
   Total Events:     12,345

🌍 Hazard Type Distribution:
   Earthquake: 456
   Flood: 387
   Cyclone: 298
   ...

⚡ Performance Metrics:
   Avg Execution Time:  3.45s
   Max Execution Time:  12.34s
   Min Execution Time:  0.89s

✅ Statistics generation complete!
```

---

## Troubleshooting

### Error: MongoDB Connection Refused
```
❌ MongoDB connection failed: connect ECONNREFUSED
```

**Solution:**
1. Start MongoDB: `mongod --dbpath ./data`
2. Check MongoDB is running: `mongosh` (should connect successfully)
3. Verify `.env` has correct URI

### Error: No Exposure Data Found
```
❌ No exposure data found!
   Please run: node scripts/generate-india-exposure-data.js
```

**Solution:**
Run the exposure generator first: `node scripts/generate-india-exposure-data.js`

### Node.js Internal Assertion Error
```
Error [ERR_INTERNAL_ASSERTION]: This is caused by either a bug in Node.js...
    at internalConnectMultiple (node:net:1118:3)
```

**Solution:**
This was caused by IPv6 connection issues. The scripts now force IPv4 with `family: 4` option.
If you still see this:
1. Use Node.js v18 or v20 (tested versions)
2. Reduce `maxPoolSize` in connection options
3. Check for DNS resolution issues

### Simulations Return 0 Losses
This was the original issue! The simulation engine couldn't find exposure data.

**Solution:**
- Ensure exposure data is generated (Step 1)
- Verify exposures exist: `mongosh cat_modeling_dev --eval "db.exposures.countDocuments()"`
- Check exposure locations match hazard locations (should be similar geographic distribution)

---

## Performance Tips

### For Faster Generation
1. **Increase batch sizes** (if you have enough RAM):
   ```javascript
   const BATCH_SIZE = 100;  // Default: 50
   const MAX_CONCURRENT = 20;  // Default: 10
   ```

2. **Use SSD** for MongoDB data directory

3. **Close other applications** to free up resources

### For Large-Scale Runs (10,000+)
1. **Monitor memory usage**: Each simulation uses ~10-20 MB
2. **Use larger MongoDB connection pool**
3. **Run in multiple sessions**: Split into 5 runs of 2,000 each
4. **Monitor disk space**: Results JSON can be large

---

## Data Model

### Exposure Data Structure
```
Account (1,000)
  ├── Policy (2,000) - Multiple policies per account
  │     ├── Coverage details
  │     ├── Limits & Deductibles
  │     └── Effective dates
  └── Location (10,000) - Properties across India
        ├── Geographic coordinates
        ├── Building characteristics
        └── Risk attributes
              └── Exposure (10,000) - Insurance exposure
                    ├── Total Insured Value
                    ├── Building/Contents/BI values
                    └── Policy terms
```

### Simulation Configuration
```javascript
{
  simulationName: "India Earthquake Risk 2025",
  hazardTypes: ["Earthquake", "Flood", "Cyclone"],
  geographicScope: {
    regions: ["Maharashtra"],
    countries: ["India"]
  },
  modelingConfig: {
    numberOfSimulations: 1000,
    probabilityDistributions: { ... }
  },
  exposureScope: {
    occupancyTypes: ["Residential", "Commercial"],
    constructionTypes: ["Concrete", "Steel Frame"]
  }
}
```

---

## Next Steps

After running simulations:

1. **Analyze Results**
   - Check `simulation-results/` directory
   - Review loss statistics
   - Identify high-risk scenarios

2. **Visualize Data**
   - Import results into visualization tool
   - Create loss exceedance curves
   - Generate risk heat maps

3. **Refine Models**
   - Adjust probability distributions
   - Update vulnerability factors
   - Enhance exposure data quality

4. **Production Deployment**
   - Set up automated runs
   - Configure alerting
   - Implement result archiving

---

## Support

For issues or questions:
1. Check this README
2. Review error messages carefully
3. Verify all prerequisites are met
4. Check MongoDB logs: `mongod.log`

---

**Last Updated:** 2025-01-08
**Version:** 1.0.0
**Status:** Production Ready ✅
