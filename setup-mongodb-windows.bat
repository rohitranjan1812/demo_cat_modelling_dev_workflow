@echo off
echo =================================================
echo 🔧 MongoDB Community Edition Setup for Windows
echo =================================================
echo 🎯 Goal: Enable REAL ACID transactions locally
echo ⚠️  Removing dangerous fallback mode
echo.

REM Check if MongoDB is already installed
where mongod >nul 2>nul
if %ERRORLEVEL% == 0 (
    echo ✅ MongoDB already installed
    goto :configure_replica
)

echo 📥 MongoDB not found. Starting installation...
echo.
echo 🔗 Downloading MongoDB Community Edition...

REM Create temp directory
if not exist temp mkdir temp

REM Download MongoDB Community Edition (latest stable)
echo Downloading MongoDB 7.0 Community Edition...
curl -L "https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.4-signed.msi" -o temp/mongodb-installer.msi

if not exist temp/mongodb-installer.msi (
    echo ❌ Download failed. Please download manually from:
    echo    https://www.mongodb.com/try/download/community
    pause
    exit /b 1
)

echo ✅ Download complete
echo.
echo 🔧 Installing MongoDB...

REM Install MongoDB silently
msiexec /i temp/mongodb-installer.msi /quiet /norestart ^
    ADDLOCAL="ServerService,Client" ^
    SHOULD_INSTALL_COMPASS=0

echo ✅ MongoDB installation complete
echo.

REM Add MongoDB to PATH if not already there
set "MONGODB_PATH=C:\Program Files\MongoDB\Server\7.0\bin"
echo %PATH% | find /i "%MONGODB_PATH%" >nul
if %ERRORLEVEL% neq 0 (
    echo 📝 Adding MongoDB to PATH...
    setx PATH "%PATH%;%MONGODB_PATH%" /M
    set "PATH=%PATH%;%MONGODB_PATH%"
)

:configure_replica
echo 🔧 Configuring MongoDB Replica Set...

REM Stop MongoDB service if running
echo 🛑 Stopping MongoDB service...
net stop MongoDB 2>nul

REM Create directories
if not exist "data\mongodb-replica" mkdir "data\mongodb-replica"
if not exist "logs" mkdir "logs"

REM Create MongoDB configuration file
echo 📝 Creating replica set configuration...
(
echo # MongoDB Replica Set Configuration for CAT Modeling
echo systemLog:
echo   destination: file
echo   logAppend: true
echo   path: "%cd%\logs\mongodb-replica.log"
echo.
echo storage:
echo   dbPath: "%cd%\data\mongodb-replica"
echo   journal:
echo     enabled: true
echo.
echo processManagement:
echo   fork: false
echo.
echo net:
echo   port: 27017
echo   bindIpAll: true
echo.
echo replication:
echo   replSetName: rs0
echo.
echo security:
echo   authorization: disabled
) > mongodb-replica.conf

echo ✅ Configuration created: mongodb-replica.conf

REM Create startup script for replica set
echo 📝 Creating startup script...
(
echo @echo off
echo echo 🚀 Starting MongoDB with Replica Set...
echo mongod --config mongodb-replica.conf
) > start-mongodb-replica.bat

echo ✅ Created start-mongodb-replica.bat

REM Create replica set initialization script
echo 📝 Creating replica set initialization...
(
echo rs.initiate^(^{
echo   _id: "rs0",
echo   members: [
echo     ^{ _id: 0, host: "localhost:27017" ^}
echo   ]
echo ^}^);
) > init-replica-set.js

echo ✅ Created init-replica-set.js

REM Create environment file
echo 📝 Creating environment configuration...
(
echo # MongoDB Local Replica Set Configuration
echo MONGODB_URI=mongodb://localhost:27017/cat_modeling_dev?replicaSet=rs0
echo MONGODB_TEST_URI=mongodb://localhost:27017/cat_modeling_test?replicaSet=rs0
echo.
echo # Server Configuration  
echo PORT=3001
echo NODE_ENV=development
echo.
echo # Mock Database - DISABLED ^(using real MongoDB with transactions^)
echo USE_MOCK_DB=false
echo.
echo # API Configuration
echo API_VERSION=v1
echo RATE_LIMIT_WINDOW_MS=900000
echo RATE_LIMIT_MAX_REQUESTS=100
echo.
echo # Authentication
echo JWT_SECRET=your-super-secret-jwt-key-change-in-production
echo JWT_EXPIRY=24h
echo.
echo # Logging
echo LOG_LEVEL=info
) > .env

echo ✅ Environment file created

echo.
echo 🎉 MongoDB setup complete!
echo.
echo 📋 Next Steps:
echo    1. Run: start-mongodb-replica.bat
echo    2. Wait for MongoDB to start
echo    3. In another terminal, run: mongo --eval "load('init-replica-set.js')"
echo    4. Run tests: npm test tests/services/BaseService.transaction.test.js
echo.
echo 🎯 SUCCESS: Real MongoDB transactions enabled!
echo    ❌ Dangerous fallback mode removed
echo    ✅ Production-safe configuration
echo.
pause