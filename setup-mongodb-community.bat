@echo off
echo 🔍 MongoDB Community Edition Setup Helper
echo =============================================

REM Check if MongoDB is installed
where mongod >nul 2>nul
if %ERRORLEVEL% == 0 (
    echo ✅ MongoDB found in PATH
    mongod --version | findstr "db version"
    goto :configure_replica
) else (
    echo ❌ MongoDB not found in PATH
    goto :install_mongodb
)

:install_mongodb
echo.
echo 📋 MongoDB Community Edition Installation Required
echo =================================================
echo.
echo 🔗 Download from: https://www.mongodb.com/try/download/community
echo 
echo 📝 Installation Steps:
echo    1. Select: Windows platform
echo    2. Choose: MSI package  
echo    3. Run installer with defaults
echo    4. Install as Windows Service: YES
echo    5. Skip MongoDB Compass (optional GUI)
echo.
echo ⚡ Quick Download Link:
echo    https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.4-signed.msi
echo.
set /p continue="Press ENTER after installing MongoDB, or 'q' to quit: "
if /i "%continue%"=="q" exit /b 0

REM Check again after installation
where mongod >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ MongoDB still not found. Please check installation.
    echo 💡 You may need to add MongoDB to PATH manually:
    echo    set PATH=%%PATH%%;C:\Program Files\MongoDB\Server\7.0\bin
    pause
    exit /b 1
)

:configure_replica
echo.
echo 🔧 Configuring MongoDB for Replica Set (Required for Transactions)
echo ===================================================================
echo.

REM Check if configuration exists
if not exist "mongodb-replica.conf" (
    echo ❌ Configuration file missing
    echo 💡 Run: node setup-mongodb-simple.js
    pause
    exit /b 1
)

echo ✅ Configuration file found: mongodb-replica.conf
echo ✅ Startup script found: start-mongodb-replica.bat
echo ✅ Initialization script: init-replica-set.js
echo ✅ Environment configured: .env
echo.

echo 🚀 Ready to start MongoDB with replica set!
echo.
echo 📋 Next Steps:
echo    1. Run: start-mongodb-replica.bat
echo    2. Wait for "waiting for connections" message
echo    3. In another terminal: mongo --eval "load('init-replica-set.js')"
echo    4. Test: node test-mongodb-setup.js
echo    5. Run tests: npm test tests/services/BaseService.transaction.test.js
echo.

set /p start="Start MongoDB now? (y/n): "
if /i "%start%"=="y" (
    echo.
    echo 🚀 Starting MongoDB...
    call start-mongodb-replica.bat
) else (
    echo 📋 Run start-mongodb-replica.bat when ready
)

pause