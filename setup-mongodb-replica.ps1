#!/usr/bin/env pwsh
# MongoDB Replica Set Setup Script

Write-Host "🔧 MongoDB Replica Set Setup" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan

# Configuration
$mongoPath = "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe"
$dataPath = "data\mongodb-replica"
$logPath = "logs\mongodb-replica.log"
$replicaSetName = "rs0"
$port = 27017

# Ensure directories exist
if (!(Test-Path $dataPath)) {
    New-Item -ItemType Directory -Path $dataPath -Force
    Write-Host "✅ Created data directory: $dataPath" -ForegroundColor Green
}

if (!(Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs" -Force
    Write-Host "✅ Created logs directory" -ForegroundColor Green
}

# Check if MongoDB is already running on our port
$existingProcess = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
if ($existingProcess) {
    Write-Host "⚠️  MongoDB already running on port $port" -ForegroundColor Yellow
    
    # Try to connect and check replica set status
    Write-Host "🔍 Checking replica set status..." -ForegroundColor Cyan
    try {
        $result = node -e "
            const { MongoClient } = require('mongodb');
            (async () => {
                try {
                    const client = new MongoClient('mongodb://localhost:27017');
                    await client.connect();
                    const admin = client.db('admin');
                    const status = await admin.command({ replSetGetStatus: 1 });
                    console.log('✅ Replica set already initialized');
                    console.log('Primary:', status.members.find(m => m.stateStr === 'PRIMARY')?.name || 'Unknown');
                    process.exit(0);
                } catch (error) {
                    if (error.message.includes('not running with --replSet')) {
                        console.log('❌ MongoDB not running with replica set');
                        process.exit(1);
                    } else if (error.message.includes('no replset config')) {
                        console.log('⚠️  MongoDB running with --replSet but not initialized');
                        process.exit(2);
                    } else {
                        console.log('❌ Error:', error.message);
                        process.exit(3);
                    }
                }
            })();"
        
        $exitCode = $LASTEXITCODE
        if ($exitCode -eq 0) {
            Write-Host "🎉 MongoDB replica set is already working!" -ForegroundColor Green
            exit 0
        } elseif ($exitCode -eq 2) {
            Write-Host "🔧 MongoDB running with --replSet but needs initialization..." -ForegroundColor Yellow
            # Continue to initialization step
        } else {
            Write-Host "❌ MongoDB not properly configured for replica set" -ForegroundColor Red
            Write-Host "🔄 Please stop the existing MongoDB process and run this script again" -ForegroundColor Yellow
            exit 1
        }
    } catch {
        Write-Host "❌ Error checking MongoDB status" -ForegroundColor Red
        exit 1
    }
} else {
    # Start MongoDB with replica set
    Write-Host "🚀 Starting MongoDB with replica set configuration..." -ForegroundColor Cyan
    
    $arguments = @(
        "--replSet", $replicaSetName,
        "--port", $port,
        "--dbpath", $dataPath,
        "--bind_ip_all",
        "--logpath", $logPath,
        "--logappend"
    )
    
    $mongoProcess = Start-Process -FilePath $mongoPath -ArgumentList $arguments -PassThru -WindowStyle Hidden
    
    Write-Host "⏳ Waiting for MongoDB to start..." -ForegroundColor Yellow
    Start-Sleep 10
    
    # Check if process is running
    if ($mongoProcess.HasExited) {
        Write-Host "❌ MongoDB failed to start" -ForegroundColor Red
        Write-Host "📋 Check log file: $logPath" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "✅ MongoDB started successfully" -ForegroundColor Green
}

# Initialize replica set
Write-Host "🔧 Initializing replica set..." -ForegroundColor Cyan

$initResult = node -e "
    const { MongoClient } = require('mongodb');
    (async () => {
        try {
            const client = new MongoClient('mongodb://localhost:27017');
            await client.connect();
            
            const config = {
                _id: 'rs0',
                members: [{ _id: 0, host: 'localhost:27017' }]
            };
            
            const admin = client.db('admin');
            const result = await admin.command({ replSetInitiate: config });
            
            console.log('✅ Replica set initialized successfully');
            console.log('Result:', JSON.stringify(result, null, 2));
            
            // Wait for replica set to elect primary
            console.log('⏳ Waiting for primary election...');
            let attempts = 0;
            while (attempts < 30) {
                try {
                    const status = await admin.command({ replSetGetStatus: 1 });
                    const primary = status.members.find(m => m.stateStr === 'PRIMARY');
                    if (primary) {
                        console.log('✅ Primary elected:', primary.name);
                        break;
                    }
                } catch (e) {
                    // Still electing, continue waiting
                }
                await new Promise(resolve => setTimeout(resolve, 1000));
                attempts++;
            }
            
            if (attempts >= 30) {
                console.log('⚠️  Primary election taking longer than expected');
                console.log('   This is normal for first-time setup');
            }
            
            await client.close();
            process.exit(0);
        } catch (error) {
            console.log('❌ Error initializing replica set:', error.message);
            process.exit(1);
        }
    })();"

if ($LASTEXITCODE -eq 0) {
    Write-Host "🎉 MongoDB Replica Set Setup Complete!" -ForegroundColor Green
    Write-Host "" -ForegroundColor White
    Write-Host "📋 Connection Details:" -ForegroundColor Cyan
    Write-Host "   URI: mongodb://localhost:27017/?replicaSet=rs0" -ForegroundColor White
    Write-Host "   Replica Set: rs0" -ForegroundColor White
    Write-Host "   Port: 27017" -ForegroundColor White
    Write-Host "" -ForegroundColor White
    Write-Host "🧪 Ready for transaction testing!" -ForegroundColor Green
} else {
    Write-Host "❌ Replica set initialization failed" -ForegroundColor Red
    exit 1
}