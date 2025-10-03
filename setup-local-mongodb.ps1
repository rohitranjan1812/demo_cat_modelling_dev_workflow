# CAT Modeling Platform - Local MongoDB Setup Script
# Run this script as Administrator

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CAT Modeling Platform - Local Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
if (-not $isAdmin) {
    Write-Host "❌ Please run this script as Administrator" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[1/6] Checking MongoDB installation..." -ForegroundColor Yellow
try {
    $mongodVersion = & mongod --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ MongoDB found" -ForegroundColor Green
    } else {
        throw "MongoDB not found"
    }
} catch {
    Write-Host "❌ MongoDB not found. Please install MongoDB first." -ForegroundColor Red
    Write-Host "   Download from: https://www.mongodb.com/try/download/community" -ForegroundColor White
    Write-Host "   Follow the guide in MONGODB_LOCAL_SETUP.md" -ForegroundColor White
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "[2/6] Creating data directory..." -ForegroundColor Yellow
$dataDir = "C:\data\db"
if (-not (Test-Path $dataDir)) {
    New-Item -ItemType Directory -Path $dataDir -Force | Out-Null
    Write-Host "✅ Created data directory: $dataDir" -ForegroundColor Green
} else {
    Write-Host "✅ Data directory already exists: $dataDir" -ForegroundColor Green
}

Write-Host ""
Write-Host "[3/6] Starting MongoDB service..." -ForegroundColor Yellow
try {
    $service = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
    if ($service -and $service.Status -eq "Running") {
        Write-Host "✅ MongoDB service already running" -ForegroundColor Green
    } else {
        Start-Service -Name "MongoDB" -ErrorAction Stop
        Write-Host "✅ MongoDB service started" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Could not start MongoDB service automatically" -ForegroundColor Yellow
    Write-Host "   Please run: net start MongoDB" -ForegroundColor White
    Write-Host "   Or start MongoDB manually" -ForegroundColor White
}

Write-Host ""
Write-Host "[4/6] Creating .env file for local MongoDB..." -ForegroundColor Yellow
$envContent = @"
# MongoDB Configuration (Local)
MONGODB_URI=mongodb://localhost:27017/cat_modeling_exposure
MONGODB_TEST_URI=mongodb://localhost:27017/cat_modeling_exposure_test

# Server Configuration
PORT=3001
NODE_ENV=development

# API Configuration
API_VERSION=v1
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
JWT_SECRET=cat_modeling_jwt_secret_2024_development_key
BCRYPT_ROUNDS=12

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
"@

$envContent | Out-File -FilePath ".env" -Encoding UTF8
Write-Host "✅ .env file created for local MongoDB" -ForegroundColor Green

Write-Host ""
Write-Host "[5/6] Installing dependencies..." -ForegroundColor Yellow
try {
    & npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dependencies installed" -ForegroundColor Green
    } else {
        throw "npm install failed"
    }
} catch {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "[6/6] Seeding database with sample data..." -ForegroundColor Yellow
try {
    & npm run seed
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database seeded successfully" -ForegroundColor Green
    } else {
        throw "Database seeding failed"
    }
} catch {
    Write-Host "❌ Failed to seed database" -ForegroundColor Red
    Write-Host "   Make sure MongoDB is running: net start MongoDB" -ForegroundColor White
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  🎉 Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Start backend: npm start" -ForegroundColor White
Write-Host "2. Start frontend: cd frontend && npm start" -ForegroundColor White
Write-Host "3. Open browser: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Your CAT Modeling Platform is ready for testing!" -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to exit"



















