@echo off
echo ========================================
echo CAT Modeling Platform - Frontend Startup
echo ========================================
echo.

cd frontend

if not exist ".env" (
    echo Warning: .env file not found!
    echo Creating from env.example...
    copy env.example .env
    echo.
)

echo Starting frontend development server...
echo Frontend will be available at: http://localhost:3000
echo.

npm start
