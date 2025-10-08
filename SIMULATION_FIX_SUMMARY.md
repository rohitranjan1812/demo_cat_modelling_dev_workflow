# Simulation Fix Implementation Summary

## Overview

This document summarizes the implementation to resolve simulation failures caused by missing database seed data.

## Problem Analysis

### Root Cause
The CAT Simulation Engine was failing when triggered via the UI due to empty database collections. The simulation requires:
- **Hazard data**: For event generation and scenario modeling
- **Vulnerability data**: For impact assessment calculations
- **Account data**: For exposure calculations and location queries

### Symptoms
- Simulations failed immediately after starting
- Generic error messages without clear guidance
- No indication of what was missing
- No easy way to verify database status

## Solution Implementation

### 1. Database Verification Tool

**File**: `src/config/verify-database.js`

**Purpose**: Check database status and provide clear diagnostics

**Features**:
- ✅ Checks MongoDB connectivity
- ✅ Counts documents in all required collections
- ✅ Shows sample data from each collection
- ✅ Clear status indicator: "READY" or "NOT READY"
- ✅ Platform-specific troubleshooting guidance
- ✅ Helpful error messages for common issues

**Usage**:
```bash
npm run verify:db
```

**Sample Output**:
```
✅ Database Status: READY FOR SIMULATIONS

📋 Database has the minimum required data:
   ✓ Account data for exposure calculations
   ✓ Hazard data for event generation
   ✓ Vulnerability data for impact assessment

🚀 You can now run simulations from the UI!

📌 Sample Hazard Data:
   ID:   HAZ-00100001
   Name: Hurricane Katrina Historical Analysis
   Type: Hurricane
   Severity: Catastrophic
```

### 2. Enhanced Seed Script

**File**: `src/config/comprehensive-seed-fixed.js`

**Improvements**:
- ⚠️ Warns before deleting existing data
- ⏱️ 3-second delay with cancellation option
- 🔍 Better connection error messages
- 💡 Specific troubleshooting hints
- 📊 Verification after seeding

**Sample Data Included**:
- **3 Accounts**: Insurance companies with varying risk profiles ($30M-$75M exposure)
- **4 Hazards**: Hurricane, Earthquake, Flood, Wildfire scenarios
- **2 Vulnerabilities**: Coastal properties and seismic zones
- **Sample simulation runs**: For reference

### 3. Quick Setup Tool

**File**: `src/config/quick-setup.js`

**Purpose**: One-command automated database setup

**Workflow**:
1. Check database status
2. If already ready → Done ✅
3. If missing data → Auto-seed
4. Verify seeding success
5. Report final status

**Usage**:
```bash
npm run setup:db
```

This is the **recommended** way to set up the database!

### 4. Pre-Flight Validation

**File**: `src/services/CATSimulationEngine.js`

**New Method**: `validateRequiredData()`

**Checks**:
- Active hazard records exist
- Active vulnerability records exist
- Active account records exist

**Behavior**:
- Runs automatically before starting any simulation
- Throws descriptive error if data missing
- Includes setup instructions in error message

**Error Message**:
```
Cannot start simulation - missing required data:
  • No active hazard data found in database
  • No active vulnerability data found in database
  • No active account data found in database

Please run "npm run setup:db" to seed the database with sample data.
```

### 5. Enhanced Error Handling

**File**: `src/controllers/simulationController.js`

**Improvements**:
- Detects specific error types
- Provides contextual error messages
- Includes troubleshooting hints
- Uses proper HTTP status codes

**Error Categories**:

| Issue | Status Code | Message | Hint |
|-------|------------|---------|------|
| Missing hazard data | 400 | No hazard data found | Run setup:db |
| Missing vulnerability data | 400 | No vulnerability data found | Run setup:db |
| Missing account data | 400 | No account data found | Run setup:db |
| MongoDB not running | 503 | MongoDB not accessible | Start MongoDB |
| Other errors | 500 | Generic failure | Check logs |

### 6. Comprehensive Documentation

**Files**:
- `DATABASE_SETUP_GUIDE.md`: Complete troubleshooting guide
- `README.md`: Updated with database setup section
- `SIMULATION_FIX_SUMMARY.md`: This document

**Topics Covered**:
- Problem explanation
- Solution steps
- Quick setup vs. manual setup
- MongoDB installation/troubleshooting
- Collection details
- Common issues and fixes
- Quick reference commands

## Usage Instructions

### For First-Time Setup

```bash
# 1. Install dependencies
npm install

# 2. Quick database setup (auto-verifies and seeds)
npm run setup:db

# 3. Start backend
npm run start:backend

# 4. Start frontend (in new terminal)
npm run start:frontend

# 5. Open browser
# Navigate to: http://localhost:3000
# Login: admin / CATModeling2025!
```

### For Troubleshooting Existing Setup

```bash
# Check database status
npm run verify:db

# If database is empty or missing data
npm run seed:fixed

# Verify seeding worked
npm run verify:db
```

### For Testing Simulations

1. Login to the UI
2. Navigate to Simulations
3. Click "Create New Simulation"
4. Fill in parameters:
   - **Name**: Test Simulation
   - **Start Year**: 2024
   - **End Year**: 2025
   - **Number of Simulations**: 100 (start small)
   - **Hazard Types**: Select any (Hurricane, Earthquake, Flood, Wildfire)
   - **Model Provider**: AIR (default)
5. Click "Start Simulation"

**Expected Behavior**:
- ✅ If database has data: Simulation starts successfully
- ❌ If database is empty: Clear error message with setup instructions
- ❌ If MongoDB down: Connection error with troubleshooting steps

## Technical Details

### Database Collections

#### Accounts Collection
- **Purpose**: Insurance account data
- **Count**: 3 sample accounts
- **Total Exposure**: $155M
- **Regions**: North America, Europe, Asia Pacific

#### Hazards Collection
- **Purpose**: Catastrophic event definitions
- **Count**: 4 sample hazards
- **Types**: Hurricane, Earthquake, Flood, Wildfire
- **Severity Levels**: Catastrophic, Severe, Major

#### Vulnerabilities Collection
- **Purpose**: Structural/geographic vulnerability assessments
- **Count**: 2 sample vulnerabilities
- **Types**: Coastal properties, Seismic zones
- **Locations**: Florida (Miami), California (San Francisco)

### Validation Logic

The simulation engine now validates data **before** starting:

```javascript
async validateRequiredData(config) {
  // Check hazards
  const hazardCount = await Hazard.countDocuments({ status: 'Active' });
  if (hazardCount === 0) {
    throw new Error('No hazard data...');
  }
  
  // Check vulnerabilities
  const vulnCount = await Vulnerability.countDocuments({ status: 'Active' });
  if (vulnCount === 0) {
    throw new Error('No vulnerability data...');
  }
  
  // Check accounts
  const accountCount = await Account.countDocuments({ status: 'Active' });
  if (accountCount === 0) {
    throw new Error('No account data...');
  }
}
```

This ensures simulations fail **fast** with **clear** error messages.

### Error Response Format

**API Error Response**:
```json
{
  "success": false,
  "message": "Cannot start simulation: No hazard data found in database. Please run 'npm run setup:db' to seed the database.",
  "error": "No active hazard data found in database",
  "hint": "Run 'npm run verify:db' to check database status"
}
```

## NPM Scripts Added

| Script | Command | Purpose |
|--------|---------|---------|
| `verify:db` | `node src/config/verify-database.js` | Check database status |
| `setup:db` | `node src/config/quick-setup.js` | Auto-setup database |
| `seed:fixed` | `node src/config/comprehensive-seed-fixed.js` | Seed with sample data |

## Files Modified

### New Files
1. `src/config/verify-database.js` - Database verification tool (208 lines)
2. `src/config/quick-setup.js` - Quick setup automation (63 lines)
3. `DATABASE_SETUP_GUIDE.md` - Comprehensive guide (349 lines)
4. `SIMULATION_FIX_SUMMARY.md` - This document (320+ lines)

### Modified Files
1. `src/config/comprehensive-seed-fixed.js` - Enhanced error handling
2. `src/services/CATSimulationEngine.js` - Added validation method
3. `src/controllers/simulationController.js` - Better error messages
4. `package.json` - Added new scripts
5. `README.md` - Updated with setup instructions

## Testing Checklist

When MongoDB is available, test the following:

- [ ] `npm run verify:db` shows MongoDB connection error (if MongoDB stopped)
- [ ] `npm run verify:db` shows NOT READY status (if database empty)
- [ ] `npm run setup:db` seeds database automatically
- [ ] `npm run verify:db` shows READY status (after seeding)
- [ ] Sample data is visible in verification output
- [ ] Starting simulation from UI works without errors
- [ ] Simulation generates events and completes
- [ ] Results are displayed in UI
- [ ] Starting simulation with empty database shows clear error
- [ ] Error message includes setup instructions

## Benefits

### Before Implementation
❌ Simulations failed with generic errors
❌ No way to verify database status
❌ No guidance on how to fix issues
❌ Manual database setup required
❌ Unclear what data was missing

### After Implementation
✅ Pre-flight validation catches issues early
✅ Clear, actionable error messages
✅ One-command database setup
✅ Easy verification tool
✅ Comprehensive troubleshooting guide
✅ Platform-specific help

## MongoDB Installation Reference

### Windows
```powershell
# Download MongoDB Community Server
# https://www.mongodb.com/try/download/community

# Or via Chocolatey
choco install mongodb

# Start service
net start MongoDB
```

### Linux (Ubuntu/Debian)
```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start service
sudo systemctl start mongod
sudo systemctl enable mongod
```

### macOS
```bash
# Via Homebrew
brew tap mongodb/brew
brew install mongodb-community@6.0

# Start service
brew services start mongodb-community
```

## Support

If issues persist:

1. Check `DATABASE_SETUP_GUIDE.md` for detailed troubleshooting
2. Run `npm run verify:db` and share the output
3. Check MongoDB logs for connection/query errors
4. Verify all dependencies: `npm install`
5. Check `.env` file for correct MONGODB_URI

## Summary

This implementation provides:
- ✅ **Automated setup** - One command to prepare database
- ✅ **Clear diagnostics** - Know exactly what's wrong
- ✅ **Actionable errors** - Error messages include fixes
- ✅ **Comprehensive docs** - Troubleshooting guide included
- ✅ **Robust validation** - Catch issues before they cause failures

**Key Command**: `npm run setup:db`

This single command handles everything: checking status, seeding if needed, and verifying success.
