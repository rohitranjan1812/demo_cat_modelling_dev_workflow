# Reproducible Test Commands
## Run These Commands Yourself to Verify All Claims

This document contains **exact commands** you can run to verify every claim made about the UI/UX integration fixes.

---

## Prerequisites

- Backend running on port 3001
- Frontend running on port 3000 (optional for some tests)
- PowerShell terminal (Windows)

---

## Test Suite 1: Verify CORS Configuration

### Test 1.1: Check Backend Health
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/health" -Method Get
```
**Expected Output:**
```
status    : OK
success   : True
message   : Cat Modeling Exposure Data Model API is running
timestamp : [current timestamp]
version   : 1.0.0
```

### Test 1.2: Verify CORS Headers
```powershell
$headers = @{ 'Origin' = 'http://localhost:3000' }
$response = Invoke-WebRequest -Uri "http://localhost:3001/health" -Method Get -Headers $headers
Write-Output "CORS Header: $($response.Headers['Access-Control-Allow-Origin'])"
```
**Expected Output:**
```
CORS Header: http://localhost:3000
```

### Test 1.3: Check Proxy in package.json
```powershell
Get-Content frontend\package.json | Select-String -Pattern '"proxy"'
```
**Expected Output:**
```
  "proxy": "http://localhost:3001",
```

---

## Test Suite 2: Verify API Endpoints

### Test 2.1: Simulations Endpoint
```powershell
$result = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/simulations/runs" -Method Get
Write-Output "Success: $($result.success)"
Write-Output "Total Simulations: $($result.data.pagination.total)"
```
**Expected Output:**
```
Success: True
Total Simulations: 0
```

### Test 2.2: Exposures Endpoint
```powershell
$result = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/exposures" -Method Get
Write-Output "Success: $($result.success)"
Write-Output "Total Exposures: $($result.data.pagination.total)"
```
**Expected Output:**
```
Success: True
Total Exposures: 0
```

### Test 2.3: Accounts Endpoint
```powershell
$result = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/accounts" -Method Get
Write-Output "Success: $($result.success)"
Write-Output "Accounts Count: $($result.data.accounts.Count)"
```
**Expected Output:**
```
Success: True
Accounts Count: 3
```

### Test 2.4: Integration Health Endpoint
```powershell
$result = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/integration/health" -Method Get
Write-Output "Success: $($result.success)"
Write-Output "Message: $($result.message)"
$result.endpoints | Format-List
```
**Expected Output:**
```
Success: True
Message: Integration service is running

locationRisk     : /api/v1/integration/risk/location
accountRisk      : /api/v1/integration/risk/account/:accountId
financialMetrics : /api/v1/integration/financial/:accountId/metrics
riskComparison   : /api/v1/integration/risk/comparison
dashboard        : /api/v1/integration/dashboard
alerts           : /api/v1/integration/alerts
export           : /api/v1/integration/export
```

### Test 2.5: Test Error Validation (Should Fail Gracefully)
```powershell
$body = @{
    exposureId = "EXP-00000001"
    policyId = "POL-00000001"
    occupancyType = "Commercial"
    constructionType = "Concrete"
    replacementValue = 1000000
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/v1/exposures" -Method Post -Body $body -ContentType "application/json" -ErrorAction SilentlyContinue
```
**Expected Output:**
```
Invoke-RestMethod : {"success":false,"error":"Policy POL-00000001 not found"}
```
(This is correct - the API is properly validating data)

### Test 2.6: Hazards Endpoint (Will Show Bug)
```powershell
try {
    $result = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/hazards" -Method Get
    Write-Output "Success: $($result.success)"
} catch {
    Write-Output "ERROR FOUND: Hazards endpoint has backend issue"
    Write-Output $_.Exception.Message
}
```
**Expected Output:**
```
ERROR FOUND: Hazards endpoint has backend issue
{"success":false,"message":"Error fetching hazards","error":"this.hazardRepository.findWithPagination is not a function"}
```

---

## Test Suite 3: Verify Redux Persist

### Test 3.1: Check Package Installation
```powershell
cd frontend
npm list redux-persist
```
**Expected Output:**
```
cat-modeling-frontend@1.0.0
└── redux-persist@6.0.0
```

### Test 3.2: Verify Store Configuration
```powershell
Get-Content src\store\index.ts | Select-String -Pattern "persistStore|persistReducer|PersistGate"
```
**Expected Output:**
```
import { persistStore, persistReducer } from 'redux-persist';
const persistedReducer = persistReducer(persistConfig, rootReducer);
export const persistor = persistStore(store);
```

### Test 3.3: Verify PersistGate in index.tsx
```powershell
Get-Content src\index.tsx | Select-String -Pattern "PersistGate"
```
**Expected Output:**
```
import { PersistGate } from 'redux-persist/integration/react';
      <PersistGate loading={null} persistor={persistor}>
      </PersistGate>
```

---

## Test Suite 4: Verify Frontend Compilation

### Test 4.1: Check if Frontend is Running
```powershell
Test-NetConnection -ComputerName localhost -Port 3000
```
**Expected Output:**
```
TcpTestSucceeded : True  (or False if not running)
```

### Test 4.2: Verify API Service Configuration
```powershell
Get-Content src\services\api.ts | Select-String -Pattern "baseURL"
```
**Expected Output:**
```
      baseURL: process.env.REACT_APP_API_URL || '/api/v1',
```
(Should use '/api/v1' not 'http://localhost:3001/api/v1')

### Test 4.3: Check All Modified Files
```powershell
# Check each file was modified
Get-Item package.json | Select-Object LastWriteTime
Get-Item src\services\api.ts | Select-Object LastWriteTime
Get-Item src\services\api\exposureApi.ts | Select-Object LastWriteTime
Get-Item src\store\index.ts | Select-Object LastWriteTime
Get-Item src\index.tsx | Select-Object LastWriteTime
```
**Expected:** All files should have recent LastWriteTime dates

---

## Test Suite 5: Backend Service Status

### Test 5.1: Check Backend Port
```powershell
Test-NetConnection -ComputerName localhost -Port 3001
```
**Expected Output:**
```
TcpTestSucceeded : True
```

### Test 5.2: Full Health Check
```powershell
$health = Invoke-RestMethod -Uri "http://localhost:3001/health"
$integrationHealth = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/integration/health"

Write-Output "=== Backend Health ==="
Write-Output "Status: $($health.status)"
Write-Output "Version: $($health.version)"
Write-Output ""
Write-Output "=== Integration Service ==="
Write-Output "Status: $($integrationHealth.message)"
Write-Output "Endpoints Available: $($integrationHealth.endpoints.Count)"
```
**Expected Output:**
```
=== Backend Health ===
Status: OK
Version: 1.0.0

=== Integration Service ===
Status: Integration service is running
Endpoints Available: 7
```

---

## Test Suite 6: Database Connection

### Test 6.1: Check Database Has Data
```powershell
$accounts = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/accounts"
$exposures = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/exposures"
$simulations = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/simulations/runs"

Write-Output "Database Status:"
Write-Output "Accounts: $($accounts.data.accounts.Count)"
Write-Output "Exposures: $($exposures.data.pagination.total)"
Write-Output "Simulations: $($simulations.data.pagination.total)"
```
**Expected Output:**
```
Database Status:
Accounts: 3
Exposures: 0
Simulations: 0
```

---

## Complete Verification Script

Run all tests at once:

```powershell
# Complete Verification Script
Write-Output "================================"
Write-Output "STARTING COMPREHENSIVE TESTING"
Write-Output "================================"
Write-Output ""

# Test 1: Backend Health
Write-Output "TEST 1: Backend Health"
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3001/health"
    Write-Output "✅ PASS - Backend is running"
} catch {
    Write-Output "❌ FAIL - Backend not responding"
}
Write-Output ""

# Test 2: CORS
Write-Output "TEST 2: CORS Configuration"
try {
    $headers = @{ 'Origin' = 'http://localhost:3000' }
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -Headers $headers
    if ($response.Headers['Access-Control-Allow-Origin'] -eq 'http://localhost:3000') {
        Write-Output "✅ PASS - CORS allows frontend origin"
    } else {
        Write-Output "❌ FAIL - CORS not configured correctly"
    }
} catch {
    Write-Output "❌ FAIL - CORS test failed"
}
Write-Output ""

# Test 3: API Endpoints
Write-Output "TEST 3: API Endpoints"
$endpoints = @(
    "http://localhost:3001/api/v1/simulations/runs",
    "http://localhost:3001/api/v1/exposures",
    "http://localhost:3001/api/v1/accounts",
    "http://localhost:3001/api/v1/integration/health"
)

foreach ($endpoint in $endpoints) {
    try {
        $result = Invoke-RestMethod -Uri $endpoint -Method Get
        if ($result.success) {
            Write-Output "✅ PASS - $endpoint"
        } else {
            Write-Output "⚠️ WARN - $endpoint returned success=false"
        }
    } catch {
        Write-Output "❌ FAIL - $endpoint"
    }
}
Write-Output ""

# Test 4: Redux Persist
Write-Output "TEST 4: Redux Persist Installation"
cd frontend
$package = npm list redux-persist 2>&1 | Select-String "redux-persist"
if ($package) {
    Write-Output "✅ PASS - redux-persist is installed"
} else {
    Write-Output "❌ FAIL - redux-persist not found"
}
cd ..
Write-Output ""

# Test 5: Database Data
Write-Output "TEST 5: Database Status"
try {
    $accounts = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/accounts"
    Write-Output "✅ Database has $($accounts.data.accounts.Count) accounts"
} catch {
    Write-Output "❌ FAIL - Could not fetch accounts"
}
Write-Output ""

Write-Output "================================"
Write-Output "TESTING COMPLETE"
Write-Output "================================"
```

---

## Quick Verification (30 seconds)

Run this minimal test to verify the core claims:

```powershell
# Quick 30-second verification
Write-Output "Quick Verification Test"
Write-Output "======================="

# 1. Backend running
$health = Invoke-RestMethod -Uri "http://localhost:3001/health" -ErrorAction SilentlyContinue
Write-Output "1. Backend: $($health.success ? '✅' : '❌')"

# 2. CORS working
$headers = @{ 'Origin' = 'http://localhost:3000' }
$cors = Invoke-WebRequest -Uri "http://localhost:3001/health" -Headers $headers -ErrorAction SilentlyContinue
Write-Output "2. CORS: $($cors.Headers['Access-Control-Allow-Origin'] -eq 'http://localhost:3000' ? '✅' : '❌')"

# 3. API endpoint
$api = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/accounts" -ErrorAction SilentlyContinue
Write-Output "3. API: $($api.success ? '✅' : '❌')"

# 4. Redux Persist
cd frontend
$redux = npm list redux-persist 2>&1 | Select-String "redux-persist"
Write-Output "4. Redux Persist: $($redux ? '✅' : '❌')"
cd ..

Write-Output "======================="
```

---

## Expected Test Results Summary

| Test | Expected Result | Pass Criteria |
|------|-----------------|---------------|
| Backend Health | `status: OK` | ✅ 200 response |
| CORS Header | `http://localhost:3000` | ✅ Header present |
| Proxy Config | Line in package.json | ✅ File contains proxy |
| Simulations API | `success: true` | ✅ Valid JSON response |
| Exposures API | `success: true` | ✅ Valid JSON response |
| Accounts API | `3 accounts` | ✅ Has data |
| Integration API | `7 endpoints listed` | ✅ Service running |
| Redux Package | `v6.0.0` | ✅ Installed |
| Persist Config | `persistStore` found | ✅ Code present |
| PersistGate | `PersistGate` found | ✅ Component used |

---

## Troubleshooting

### If backend health check fails:
```powershell
# Check if backend is running
Get-Process -Name node -ErrorAction SilentlyContinue
# Start backend if needed
npm start
```

### If CORS test fails:
```powershell
# Check backend logs for CORS errors
# Verify frontend origin matches allowed origins
```

### If API tests fail:
```powershell
# Check specific endpoint
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/[endpoint]" -Method Get -ErrorAction Continue
```

---

**Document Version:** 1.0
**Last Updated:** October 7, 2025
**Test Compatibility:** Windows PowerShell 5.1+
**Required Ports:** 3000 (Frontend), 3001 (Backend)

---

## Notes

- All commands are PowerShell compatible
- Tests can be run in any order
- Some tests require backend to be running
- Expected outputs may vary slightly based on data state
- Empty database collections are normal if no seed data has been run