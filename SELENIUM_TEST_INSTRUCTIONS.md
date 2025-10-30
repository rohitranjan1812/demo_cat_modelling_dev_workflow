# 🧪 Selenium Test Execution Instructions

## Prerequisites

1. **MongoDB Running**: Ensure MongoDB is running with replica set
2. **Backend Server**: Backend should be running on `http://localhost:3001`
3. **Frontend Server**: Frontend should be running on `http://localhost:3000`
4. **Chrome Browser**: Chrome browser installed (Selenium will use it)
5. **Dependencies**: All npm packages installed (`npm install`)

## Quick Start

### Option 1: Auto-Start Servers and Run Tests (Windows)

```bash
run-selenium-tests.bat
```

This script will:
1. Check if servers are running
2. Start them if not running
3. Wait for them to be ready
4. Run the Selenium tests

### Option 2: Manual Start

**Terminal 1 - Start Backend:**
```bash
npm run start:backend
```

**Terminal 2 - Start Frontend:**
```bash
npm run start:frontend
```

**Terminal 3 - Run Tests:**
```bash
node test-fixes-verification.js
```

## What the Tests Verify

### ✅ Test 1: User Login
- Verifies authentication with `riskmanager/RiskManager2025!`
- Checks login redirect

### ✅ Test 2: Navigate to Simulations Page
- Verifies Simulations link exists in navigation
- Tests navigation to `/simulations`

### ✅ Test 3: Simulation Modal Rendering (CRITICAL)
- **Tests the modal fix**: Verifies modal appears when "Start Simulation" is clicked
- Checks for dialog elements before/after click
- Takes screenshots for debugging

### ✅ Test 4: Hazard API Data Availability (CRITICAL)
- **Tests the API fix**: Verifies `/api/v1/hazards` returns data
- Checks response structure and status

### ✅ Test 5: Vulnerability API Data Availability (CRITICAL)
- **Tests the API fix**: Verifies `/api/v1/vulnerabilities` returns data
- Checks response structure and status

### ✅ Test 6: Browser Console Errors
- Checks for JavaScript errors in browser console
- Reports warnings and severe errors

## Expected Results

After fixes, you should see:
- ✅ Login: PASSED
- ✅ Navigate to Simulations: PASSED
- ✅ Modal Rendering: PASSED (dialog count should increase after click)
- ✅ Hazard API Data: PASSED (status 200, even if empty array)
- ✅ Vulnerability API Data: PASSED (status 200, even if empty array)
- ✅ Console Errors: PASSED (no severe errors)

## Test Outputs

The test generates:
- `test-modal-before.png` - Screenshot before clicking Start Simulation
- `test-modal-after.png` - Screenshot after clicking Start Simulation
- `fix-verification-report.json` - Detailed test report

## Troubleshooting

### "Connection Refused" Error
- **Cause**: Servers not running
- **Fix**: Start backend and frontend servers first

### "Element Not Found" Error
- **Cause**: Page hasn't loaded or element selector changed
- **Fix**: Check if servers are running and pages load correctly

### "API Failed" Error
- **Cause**: Backend not running or authentication failing
- **Fix**: Verify backend is running on port 3001 and check logs

### Chrome Driver Issues
- **Cause**: ChromeDriver version mismatch
- **Fix**: Update chromedriver: `npm install chromedriver@latest`

## Test Reports

View detailed results in:
- `fix-verification-report.json` - JSON report with all test details
- Console output - Real-time test progress

## Next Steps After Tests

1. **If All Tests Pass**: ✅ All fixes verified! System ready for use.
2. **If Tests Fail**: Review error messages and screenshots to identify issues
3. **Update Tests**: Modify test selectors if UI changes

