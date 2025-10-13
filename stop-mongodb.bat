@echo off
echo 🛑 Stopping MongoDB...
taskkill /F /IM mongod.exe 2>nul
if %ERRORLEVEL% == 0 (
    echo ✅ MongoDB stopped successfully
) else (
    echo ℹ️  MongoDB was not running
)
pause
