@echo off
echo ========================================
echo CAT Modeling Platform - Selenium Test Runner
echo ========================================
echo.

echo Step 1: Checking if servers are running...
netstat -ano | findstr ":3000" >nul
if %errorlevel% equ 0 (
    echo   ✓ Frontend is running on port 3000
) else (
    echo   ✗ Frontend is NOT running on port 3000
    echo   Starting frontend...
    start "CAT Modeling - Frontend" cmd /k "cd /d %~dp0 && npm run start:frontend"
    echo   Waiting for frontend to start...
    timeout /t 15 /nobreak > nul
)

netstat -ano | findstr ":3001" >nul
if %errorlevel% equ 0 (
    echo   ✓ Backend is running on port 3001
) else (
    echo   ✗ Backend is NOT running on port 3001
    echo   Starting backend...
    start "CAT Modeling - Backend" cmd /k "cd /d %~dp0 && npm run start:backend"
    echo   Waiting for backend to start...
    timeout /t 10 /nobreak > nul
)

echo.
echo Step 2: Running Selenium tests...
echo.
node test-fixes-verification.js

echo.
echo ========================================
echo Test execution completed!
echo ========================================
pause

