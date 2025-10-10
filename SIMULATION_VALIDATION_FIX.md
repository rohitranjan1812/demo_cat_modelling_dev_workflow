# 🔧 Simulation Validation Error - Fixed!

## Problem
Simulation was failing with validation error due to missing required field: `modelingConfig.numberOfSimulations`

## Solution Applied ✅
Made `numberOfSimulations` **optional** in validation schema.

**File Changed:** `src/routes/simulations.js` (Line 73)

```javascript
// BEFORE (required)
body('modelingConfig.numberOfSimulations')
  .isInt({ min: 1, max: 1000000 })

// AFTER (optional)
body('modelingConfig.numberOfSimulations')
  .optional()
  .isInt({ min: 1, max: 1000000 })
```

---

## ✅ Correct Simulation Format for Frontend

### Minimum Required Fields:
```json
{
  "simulationName": "Test Simulation",
  "startYear": 2024,
  "endYear": 2025,
  "timeHorizon": 2,
  "timeHorizonUnit": "years",
  "hazardTypes": ["Earthquake"],
  "modelingConfig": {
    "numberOfSimulations": 1
  }
}
```

### Full Simulation Format (Recommended):
```json
{
  "simulationName": "India Earthquake Risk Analysis",
  "simulationDescription": "Testing earthquake risk with realistic exposure accounts",
  "startYear": 2024,
  "endYear": 2025,
  "timeHorizon": 2,
  "timeHorizonUnit": "years",
  "hazardTypes": ["Earthquake", "Flood"],
  
  "geographicScope": {
    "regions": ["Asia Pacific"],
    "countries": ["India"],
    "boundingBox": {
      "minLatitude": 8.0,
      "maxLatitude": 35.0,
      "minLongitude": 68.0,
      "maxLongitude": 97.0
    }
  },
  
  "exposureScope": {
    "currency": "USD",
    "minExposure": 1000000,
    "maxExposure": 500000000
  },
  
  "vulnerabilityScope": {
    "includeHistorical": true,
    "includePredicted": false
  },
  
  "modelingConfig": {
    "modelProvider": "Custom",
    "modelVersion": "2.0",
    "modelType": "Probabilistic",
    "resolution": "Medium",
    "numberOfSimulations": 1,
    "iterations": 1,
    "randomSeed": 12345,
    "useClimateScenarios": false
  }
}
```

---

## 📋 All Required Fields

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `simulationName` | string | Optional | Generated | 1-200 chars |
| `simulationDescription` | string | Optional | - | Max 1000 chars |
| `startYear` | integer | **YES** | - | 1900-3000 |
| `endYear` | integer | **YES** | - | 1900-3000 |
| `timeHorizon` | integer | **YES** | - | Min 1 |
| `timeHorizonUnit` | string | **YES** | - | years/months/days |
| `hazardTypes` | array | Optional | [] | Valid hazard types |
| `modelingConfig.numberOfSimulations` | integer | Optional | 1 | 1-1,000,000 |

---

## 🎯 Valid Values

### Hazard Types (Any of these):
```
Earthquake, Hurricane, Typhoon, Cyclone, Tornado, Flood, Flash Flood,
Wildfire, Forest Fire, Bushfire, Hail, Wind, Storm Surge, Tsunami,
Volcanic Eruption, Landslide, Avalanche, Drought, Heat Wave, Cold Wave,
Ice Storm, Blizzard, Sandstorm, Dust Storm
```

### Regions:
```
North America, Europe, Asia Pacific, Latin America, Middle East, Africa
```

### Currencies:
```
USD, EUR, GBP, JPY, CAD, AUD, CNY, INR, BRL
```

### Model Providers:
```
RMS, AIR, CoreLogic, Karen Clark, JBA, Custom, Multiple
```

### Model Types:
```
Probabilistic, Deterministic, Scenario, Hybrid
```

### Resolution:
```
High, Medium, Low, Variable
```

---

## 🧪 Test the Fix

### Option 1: Try Creating Simulation in Frontend Again

1. Go to: http://localhost:3000/simulations
2. Click "New Simulation" or "Create Simulation"
3. Fill in the form:
   ```
   Name: Test-Earthquake-Fix
   Hazard Types: Earthquake
   Start Year: 2024
   End Year: 2025
   Time Horizon: 2
   Unit: years
   ```
4. Submit

**Expected:** ✅ Simulation should create successfully now!

### Option 2: Test via API Directly

```bash
# Save this to test-simulation.json
{
  "simulationName": "API Test Simulation",
  "startYear": 2024,
  "endYear": 2025,
  "timeHorizon": 2,
  "timeHorizonUnit": "years",
  "hazardTypes": ["Earthquake"],
  "geographicScope": {
    "regions": ["Asia Pacific"]
  },
  "modelingConfig": {
    "modelProvider": "Custom",
    "modelType": "Probabilistic",
    "numberOfSimulations": 1
  }
}

# Test with curl (replace YOUR_TOKEN with actual token)
curl -X POST http://localhost:3001/api/v1/simulations/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d @test-simulation.json
```

---

## 🔄 Apply the Fix

### Backend needs restart for validation changes:

```bash
# Stop current backend (Ctrl+C in backend terminal or window)

# Restart
node src/index.js
```

**Or if running in separate window:**
```bash
# Kill the process
taskkill /F /IM node.exe /FI "WINDOWTITLE eq *src/index.js*"

# Restart in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "node src/index.js"
```

---

## ✅ Verification

After restarting backend, test simulation creation:

### Should Work ✅
```json
{
  "startYear": 2024,
  "endYear": 2025,
  "timeHorizon": 2,
  "timeHorizonUnit": "years",
  "hazardTypes": ["Earthquake"]
}
```

### Should Also Work ✅
```json
{
  "simulationName": "Test",
  "startYear": 2024,
  "endYear": 2025,
  "timeHorizon": 2,
  "timeHorizonUnit": "years",
  "hazardTypes": ["Earthquake"],
  "modelingConfig": {
    "numberOfSimulations": 1
  }
}
```

### Will Fail ❌
```json
{
  "startYear": 2024
  // Missing required fields: endYear, timeHorizon, timeHorizonUnit
}
```

---

## 📊 Common Validation Errors & Fixes

### Error: "Start year must be between 1900 and 3000"
**Fix:** Ensure `startYear` is a number, not a string
```javascript
// ❌ Wrong
startYear: "2024"

// ✅ Correct
startYear: 2024
```

### Error: "Time horizon unit must be years, months, or days"
**Fix:** Use exact lowercase string
```javascript
// ❌ Wrong
timeHorizonUnit: "Years"

// ✅ Correct
timeHorizonUnit: "years"
```

### Error: "Hazard types must be an array"
**Fix:** Always use array, even for single hazard
```javascript
// ❌ Wrong
hazardTypes: "Earthquake"

// ✅ Correct
hazardTypes: ["Earthquake"]
```

### Error: "Invalid hazard type"
**Fix:** Use exact case-sensitive names
```javascript
// ❌ Wrong
hazardTypes: ["earthquake", "flood"]

// ✅ Correct
hazardTypes: ["Earthquake", "Flood"]
```

---

## 🎯 Quick Fix Summary

**Problem:** `numberOfSimulations` was required but frontend didn't send it  
**Solution:** Made it optional in validation  
**Action Required:** Restart backend  
**Test:** Try creating simulation in frontend again  

---

**Status:** ✅ **FIXED - Restart backend and try again!**

