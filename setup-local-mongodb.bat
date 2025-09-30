@echo off
echo ========================================
echo   CAT Modeling Platform - Local Setup
echo ========================================
echo.

echo [1/5] Checking MongoDB installation...
where mongod >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ MongoDB not found. Please install MongoDB first.
    echo    Download from: https://www.mongodb.com/try/download/community
    echo    Follow the guide in MONGODB_LOCAL_SETUP.md
    pause
    exit /b 1
)
echo ✅ MongoDB found

echo.
echo [2/5] Starting MongoDB service...
net start MongoDB >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  MongoDB service may already be running or needs manual start
    echo    Try: net start MongoDB
)
echo ✅ MongoDB service started

echo.
echo [3/5] Creating .env file for local MongoDB...
copy .env.local .env >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  .env file may already exist
)
echo ✅ .env file configured for local MongoDB

echo.
echo [4/5] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed

echo.
echo [5/5] Seeding database with sample data...
call npm run seed
if %errorlevel% neq 0 (
    echo ❌ Failed to seed database
    echo    Make sure MongoDB is running: net start MongoDB
    pause
    exit /b 1
)
echo ✅ Database seeded successfully

echo.
echo ========================================
echo   🎉 Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Start backend: npm start
echo 2. Start frontend: cd frontend ^&^& npm start
echo 3. Open browser: http://localhost:3000
echo.
echo Your CAT Modeling Platform is ready for testing!
echo.
pause









