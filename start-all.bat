@echo off
echo ========================================
echo CAT Modeling Platform - Full Stack Startup
echo ========================================
echo.

echo Checking environment configuration...
node setup-environment.js
echo.

echo ========================================
echo Starting Backend and Frontend
echo ========================================
echo.
echo Backend will be available at: http://localhost:3001
echo Frontend will be available at: http://localhost:3000
echo.
echo Press Ctrl+C in either window to stop the respective server
echo.

start "CAT Modeling - Backend" cmd /k "npm run start:backend"
timeout /t 5 /nobreak > nul
start "CAT Modeling - Frontend" cmd /k "npm run start:frontend"

echo.
echo ✓ Both servers are starting in separate windows
echo ✓ Check the new windows for server status
echo.
