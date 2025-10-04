# Database Setup and Simulation Fix Guide

## Problem Summary

The simulations are failing because the MongoDB database is either:
1. Not running
2. Not populated with required seed data

## Root Cause

The CAT Simulation Engine requires the following data to function:
- **Accounts**: For exposure calculations and location queries
- **Hazards**: For event generation and simulation scenarios
- **Vulnerabilities**: For impact assessment and loss calculations

When any of these collections are empty, the simulation will fail with errors like:
- "No hazard types available"
- "No vulnerabilities found for location"
- "No exposure data for impact calculations"

## Solution Steps

### Quick Setup (Recommended)

The fastest way to get started:

```bash
npm run setup:db
```

This command will:
1. Check if MongoDB is running
2. Verify if database has required data
3. Automatically seed the database if needed
4. Confirm everything is ready for simulations

### Manual Setup (Step-by-Step)

If you prefer to run each step manually:

### Step 1: Verify MongoDB is Running

Run the database verification script:
```bash
npm run verify:db
```

or directly:
```bash
node src/config/verify-database.js
```

**If MongoDB is NOT running:**
- The script will show connection errors and provide troubleshooting steps
- Follow the platform-specific instructions to start MongoDB

**If MongoDB IS running:**
- The script will check all required collections
- Show current counts and sample data
- Indicate if the database is ready for simulations

### Step 2: Seed the Database

If the verification shows missing data, run the seed script:

```bash
npm run seed:fixed
```

or directly:
```bash
node src/config/comprehensive-seed-fixed.js
```

This will populate the database with:
- **3 Accounts** with varying risk profiles and exposure amounts
- **4 Hazards** (Hurricane, Earthquake, Flood, Wildfire scenarios)
- **2 Vulnerabilities** (Coastal properties and Earthquake zones)
- **Sample simulation runs** for reference

### Step 3: Verify Seeding Success

Run the verification script again:
```bash
npm run verify:db
```

You should see:
```
✅ Database Status: READY FOR SIMULATIONS

📋 Database has the minimum required data:
   ✓ Account data for exposure calculations
   ✓ Hazard data for event generation
   ✓ Vulnerability data for impact assessment

🚀 You can now run simulations from the UI!
```

### Step 4: Run Simulation from UI

1. Ensure backend is running: `npm run start:backend`
2. Ensure frontend is running: `npm run start:frontend`
3. Login with admin credentials:
   - Username: `admin`
   - Password: `CATModeling2025!`
4. Navigate to Simulations page
5. Create a new simulation with:
   - Name: Test Simulation
   - Start Year: 2024
   - End Year: 2025
   - Number of Simulations: 100 (start small)
   - Hazard Types: Select from available (Hurricane, Earthquake, Flood, Wildfire)
   - Model Provider: AIR (default)

## Troubleshooting

### MongoDB Connection Issues

**Error:** `MongoServerSelectionError` or `ECONNREFUSED`

**Solutions:**

**Windows:**
```powershell
# Check if MongoDB service is running
Get-Service MongoDB*

# Start MongoDB service
net start MongoDB
```

**Linux:**
```bash
# Check MongoDB status
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod

# Enable MongoDB to start on boot
sudo systemctl enable mongod
```

**Mac:**
```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Start MongoDB
brew services start mongodb-community
```

### Verify MongoDB Port

Check if MongoDB is listening on port 27017:
```bash
netstat -an | grep 27017
```

### Check Environment Variables

Verify your `.env` file has:
```
MONGODB_URI=mongodb://localhost:27017/cat_modeling_exposure
USE_MOCK_DB=false
```

### Simulation Still Fails After Seeding

**Check backend logs** for specific errors:

Common issues:
1. **"No hazard types available"** - Re-run seed script
2. **"Invalid configuration"** - Check simulation parameters in UI
3. **"Database query timeout"** - MongoDB may be slow, increase timeout in config

**Check simulation configuration:**
- Ensure date ranges are valid (startYear < endYear)
- Number of simulations should be reasonable (< 10,000 for testing)
- At least one hazard type should be selected

## Database Collections Details

### Accounts Collection
**Purpose:** Stores insurance accounts with exposure data

**Sample Data:**
- ACC-001001: Global Insurance Corp ($50M exposure)
- ACC-002002: Regional Property Insurer ($30M exposure)
- ACC-003003: Specialized Reinsurer ($75M exposure)

**Required Fields for Simulation:**
- `accountId`: Unique identifier
- `totalExposure`: Total exposure amount
- `regions`: Geographic regions covered
- `hazardRiskProfile`: Risk levels by hazard type

### Hazards Collection
**Purpose:** Defines catastrophic events and their characteristics

**Sample Data:**
- HAZ-00100001: Hurricane Katrina Analysis
- HAZ-00100002: San Francisco Earthquake Scenario
- HAZ-00100003: Mississippi River Flood
- HAZ-00100004: California Wildfire

**Required Fields for Simulation:**
- `hazardId`: Unique identifier
- `hazardType`: Type (Hurricane, Earthquake, Flood, etc.)
- `severity`: Severity level
- `probability`: Annual occurrence probability
- `footprint`: Geographic impact area

### Vulnerabilities Collection
**Purpose:** Assesses structural and geographic vulnerabilities

**Sample Data:**
- VUL-00100001: Coastal Property Hurricane Vulnerability
- VUL-00100002: Seismic Zone Earthquake Vulnerability

**Required Fields for Simulation:**
- `vulnerabilityId`: Unique identifier
- `vulnerabilityType`: Physical, Economic, Social, etc.
- `geographicScope`: Location data
- `vulnerabilityFactors`: Contributing factors
- `overallVulnerabilityScore`: Composite risk score

## Additional Resources

### Scripts Available

- `npm run setup:db` - **Quick setup**: Auto-verify and seed database
- `npm run verify:db` - Check database status
- `npm run seed:fixed` - Seed database with sample data
- `npm run seed:comprehensive` - Seed with more extensive data
- `npm run seed:production` - Seed with production-level data
- `npm run start:backend` - Start backend server
- `npm run start:frontend` - Start frontend application

### Seed Data Customization

To add more data, edit:
- `src/config/comprehensive-seed-fixed.js`

Add entries to:
- `accountsData` array
- `hazardsData` array
- `vulnerabilitiesData` array

Then re-run the seed script.

### Database Schema

Model definitions can be found in:
- `src/models/Account.js`
- `src/models/Hazard.js`
- `src/models/Vulnerability.js`
- `src/models/SimulationRun.js`
- `src/models/SimulationEvent.js`

## Support

If issues persist after following this guide:
1. Check backend console logs for detailed error messages
2. Run `npm run verify:db` and share the output
3. Check MongoDB logs for connection/query issues
4. Verify all npm packages are installed: `npm install`

## Quick Reference

```bash
# Complete setup from scratch (RECOMMENDED)
npm install                    # Install dependencies
npm run setup:db              # Auto-setup database (verify & seed)
npm run start:backend         # Start backend
npm run start:frontend        # Start frontend (in new terminal)
```

Or manually:
```bash
# Manual setup
npm install                    # Install dependencies
npm run verify:db             # Check MongoDB status
npm run seed:fixed            # Seed database if needed
npm run verify:db             # Verify seeding
npm run start:backend         # Start backend
npm run start:frontend        # Start frontend (in new terminal)
```

Open browser to: `http://localhost:3000`
Login: admin / CATModeling2025!
