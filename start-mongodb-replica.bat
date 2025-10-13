@echo off
echo 🚀 Starting MongoDB with Replica Set for CAT Modeling
echo ================================================================
echo 📊 Port: 27017
echo 🔄 Data directory: %cd%\data\mongodb-replica
echo 📝 Logs: %cd%\logs\mongodb.log
echo 🎯 Replica Set: rs0 (enables ACID transactions)
echo ⚠️  IMPORTANT: Keep this terminal open while using the app
echo.

REM Check if MongoDB is installed
where mongod >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ MongoDB not found in PATH
    echo 💡 Please install MongoDB Community Edition first:
    echo    https://www.mongodb.com/try/download/community
    echo.
    echo 📝 Or add MongoDB to PATH:
    echo    set PATH=%%PATH%%;C:\Program Files\MongoDB\Server\7.0\bin
    pause
    exit /b 1
)

REM Stop existing MongoDB service if running
echo � Stopping existing MongoDB service...
net stop MongoDB 2>nul
if %ERRORLEVEL% == 0 (
    echo ✅ MongoDB service stopped
) else (
    echo ℹ️  MongoDB service was not running
)

REM Create directories if they don't exist
if not exist "data\mongodb-replica" mkdir "data\mongodb-replica"
if not exist "logs" mkdir "logs"

echo 🔧 Starting MongoDB with replica set configuration...
echo.
mongod --config mongodb-replica.conf
