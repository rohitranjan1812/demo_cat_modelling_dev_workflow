# 🚀 MongoDB Community Edition Setup Guide

## 📋 Step-by-Step Installation

### Step 1: Download MongoDB Community Edition
1. **Go to**: https://www.mongodb.com/try/download/community
2. **Select**:
   - **Version**: 7.0.x (Current Stable)
   - **Platform**: Windows
   - **Package**: MSI
3. **Download** the installer (approximately 200MB)

### Step 2: Install MongoDB
1. **Run the downloaded MSI installer**
2. **Choose**: "Complete" installation type
3. **Install MongoDB as a Service**: ✅ YES (recommended)
   - Service Name: MongoDB
   - Data Directory: C:\data\db (default)
   - Log Directory: C:\data\log (default)
4. **Install MongoDB Compass**: ❌ NO (optional GUI - can skip for now)
5. **Complete the installation**

### Step 3: Verify Installation
Open PowerShell as Administrator and run:
```powershell
mongod --version
```
You should see MongoDB version information.

### Step 4: Configure for Replica Set (CRITICAL for transactions)
We need to configure MongoDB to run with replica set support to enable ACID transactions.

#### Option A: Use Our Automated Script
```powershell
# Stop the default MongoDB service first
net stop MongoDB

# Start with replica set configuration  
.\start-mongodb-replica.bat
```

#### Option B: Manual Configuration
If the script doesn't work, follow these manual steps:

1. **Stop MongoDB Service**:
```powershell
net stop MongoDB
```

2. **Start MongoDB with Replica Set**:
```powershell
mongod --replSet rs0 --port 27017 --dbpath "C:\data\db"
```

3. **Initialize Replica Set** (in another terminal):
```powershell
mongo --eval "load('init-replica-set.js')"
```

### Step 5: Test the Setup
```powershell
# Test MongoDB connection and transactions
node test-mongodb-setup.js
```

**Expected output**:
```
✅ Connected to MongoDB
✅ REAL transaction test PASSED!
🎉 MongoDB is configured correctly for transactions
```

### Step 6: Run Transaction Tests
```powershell
npm test tests/services/BaseService.transaction.test.js
```

**Expected result**: All 23 tests pass with real MongoDB transactions!

---

## 🔧 Troubleshooting

### If mongod is not recognized:
Add MongoDB to PATH:
```powershell
# Add to PATH (replace with your MongoDB installation path)
$env:PATH += ";C:\Program Files\MongoDB\Server\7.0\bin"
```

### If replica set initialization fails:
```powershell
# Connect to MongoDB and manually initialize
mongo
> rs.initiate({_id: "rs0", members: [{_id: 0, host: "localhost:27017"}]})
```

### If tests still fail:
Check that MongoDB is running with replica set:
```powershell
mongo --eval "rs.status()"
```

---

## 🎯 What This Achieves

✅ **Real ACID Transactions**: MongoDB with proper replica set support  
✅ **Production Parity**: Same transaction behavior as production  
✅ **No Fallback Mode**: Tests reflect real MongoDB requirements  
✅ **Honest Testing**: No masking of configuration issues  

Ready to proceed with the installation?