@echo off
REM ========================================
REM E2E Testing Quick Start Script
REM ========================================

echo.
echo ========================================
echo    E2E Testing Quick Start
echo ========================================
echo.

REM Check if MongoDB is running
echo [1/5] Checking MongoDB...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo    ✓ MongoDB is running
) else (
    echo    ✗ MongoDB is NOT running
    echo    → Please start MongoDB first
    echo    → Run: net start MongoDB
    pause
    exit /b 1
)

REM Check if backend is running
echo [2/5] Checking Backend Server...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3001/health' -TimeoutSec 2 -UseBasicParsing; exit 0 } catch { exit 1 }"
if %ERRORLEVEL% EQU 0 (
    echo    ✓ Backend is running on port 3001
) else (
    echo    ✗ Backend is NOT running
    echo    → Starting backend server...
    start "CAT Backend" cmd /c "npm start"
    timeout /t 5 /nobreak > nul
    echo    ✓ Backend started
)

REM Check if frontend is running
echo [3/5] Checking Frontend Dev Server...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3000' -TimeoutSec 2 -UseBasicParsing; exit 0 } catch { exit 1 }"
if %ERRORLEVEL% EQU 0 (
    echo    ✓ Frontend is running on port 3000
) else (
    echo    ✗ Frontend is NOT running
    echo    → Frontend should already be running
    echo    → If not, run: cd frontend && npm start
)

REM Verify test data
echo [4/5] Verifying Test Data...
node -e "const mongoose = require('mongoose'); const Exposure = require('./src/models/Exposure'); mongoose.connect('mongodb://localhost:27017/cat_modeling_exposure').then(async () => { const count = await Exposure.countDocuments(); console.log('   ✓ Found ' + count + ' exposures in database'); if (count < 10) { console.log('   ⚠️  Warning: Less than 10 exposures. Run: node scripts/seed-minimal-data.js'); } mongoose.disconnect(); });"

REM Open browser
echo [5/5] Opening Browser...
timeout /t 2 /nobreak > nul
start http://localhost:3000/exposures

echo.
echo ========================================
echo    ✅ E2E Testing Environment Ready!
echo ========================================
echo.
echo 📝 Next Steps:
echo    1. Browser opened to Exposure List
echo    2. Follow the E2E Testing Guide
echo    3. Check all test scenarios
echo.
echo 📚 Testing Guide:
echo    documentation\guides\E2E_TESTING_GUIDE.md
echo.
echo 🎯 Expected Data:
echo    - 30 Exposures
echo    - 12 Locations
echo    - 7 Policies
echo    - 3 Accounts
echo.
echo 🔗 URLs:
echo    - Frontend: http://localhost:3000/exposures
echo    - Backend:  http://localhost:3001
echo    - Health:   http://localhost:3001/health
echo.
echo ========================================
echo.
pause
