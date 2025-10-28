@echo off
echo 🔧 Starting MongoDB with Replica Set on alternate port...
echo ========================================================

REM Create directories if they don't exist
if not exist "data\mongodb-replica-27018" mkdir "data\mongodb-replica-27018"
if not exist "logs" mkdir "logs"

REM Start MongoDB on port 27018 with replica set
echo 🚀 Starting MongoDB replica set on port 27018...
"C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" ^
    --replSet rs0 ^
    --port 27018 ^
    --dbpath "data\mongodb-replica-27018" ^
    --bind_ip_all ^
    --logpath "logs\mongodb-replica-27018.log" ^
    --logappend

echo 📋 MongoDB started with:
echo    Port: 27018
echo    Replica Set: rs0
echo    Data Path: data\mongodb-replica-27018
echo    Log Path: logs\mongodb-replica-27018.log