@echo off
echo Starting MongoDB with Replica Set...

REM Kill any existing MongoDB processes
taskkill /f /im mongod.exe 2>nul

REM Wait a moment for cleanup
timeout /t 3 /nobreak >nul

REM Start MongoDB with replica set
"C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --replSet rs0 --port 27017 --dbpath "data\mongodb-replica" --bind_ip_all --logpath "logs\mongodb-replica.log" --logappend

pause