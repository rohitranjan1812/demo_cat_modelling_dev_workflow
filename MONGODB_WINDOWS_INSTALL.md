# MongoDB Installation Guide for Windows
**Platform:** CAT Modeling Platform  
**Date:** September 30, 2025  
**OS:** Windows 10/11

---

## 🎯 Quick Installation Steps

### Option 1: MongoDB Installer (Recommended - Easiest)

#### Step 1: Download MongoDB
1. Open PowerShell or Command Prompt as Administrator
2. Run this command to download using winget (Windows Package Manager):
   ```powershell
   winget install MongoDB.Server
   ```

   **OR** Download manually:
   - Visit: https://www.mongodb.com/try/download/community
   - Select: Windows x64
   - Click: Download
   - Run the installer (.msi file)

#### Step 2: Install MongoDB
1. **Run the installer** (mongodb-windows-x86_64-X.X.X.msi)
2. Choose **"Complete"** installation
3. **IMPORTANT:** Check "Install MongoDB as a Service"
   - Service Name: `MongoDB`
   - Data Directory: `C:\Program Files\MongoDB\Server\X.X\data`
   - Log Directory: `C:\Program Files\MongoDB\Server\X.X\log`
4. **Install MongoDB Compass** (GUI tool) - Check the box
5. Click **Next** → **Install**
6. Wait for installation to complete

#### Step 3: Verify Installation
Open PowerShell/CMD and run:
```powershell
mongod --version
```

Expected output:
```
db version v7.x.x
Build Info: ...
```

#### Step 4: Start MongoDB Service
```powershell
# Start the service
net start MongoDB

# Check status
sc query MongoDB
```

---

### Option 2: Chocolatey (Alternative)

If you have Chocolatey installed:
```powershell
# Run as Administrator
choco install mongodb -y
choco install mongodb-compass -y
```

---

### Option 3: Manual Installation (Advanced)

1. Download MongoDB Community Server
2. Extract to `C:\Program Files\MongoDB\`
3. Create data directory: `C:\data\db`
4. Create log directory: `C:\data\log`
5. Run manually: `mongod --dbpath C:\data\db`

---

## ✅ Verification Steps

### 1. Check MongoDB is Running
```powershell
# Check service status
sc query MongoDB

# Should show: STATE: 4 RUNNING
```

### 2. Test Connection
```powershell
# Connect to MongoDB shell
mongosh

# Should show: Connected to MongoDB
```

### 3. Quick Test
In mongosh:
```javascript
// Show databases
show dbs

// Create test database
use testdb

// Insert test document
db.test.insertOne({name: "test"})

// Verify
db.test.find()

// Exit
exit
```

---

## 🔧 Troubleshooting

### Issue: "mongod is not recognized"
**Solution:** Add MongoDB to PATH
1. Open System Properties → Environment Variables
2. Edit **Path** variable
3. Add: `C:\Program Files\MongoDB\Server\7.0\bin`
4. Restart Command Prompt

### Issue: Service won't start
**Solution:**
```powershell
# Check if port 27017 is in use
netstat -ano | findstr :27017

# If occupied, kill the process or change MongoDB port
```

### Issue: Access Denied
**Solution:** Run Command Prompt/PowerShell as Administrator

---

## 🎉 Success Indicators

✅ MongoDB service is running  
✅ `mongod --version` shows version  
✅ `mongosh` connects successfully  
✅ Can create/read test data  

---

## 📝 Next Steps

After MongoDB is installed:

1. **Update Backend Configuration**
   ```bash
   cd "D:\cat modelling\demo_cat_modelling_dev_workflow"
   # Edit .env file: USE_MOCK_DB=false
   ```

2. **Seed Database with Sample Data**
   ```bash
   npm run seed
   ```

3. **Start Application**
   ```bash
   npm run start:all
   ```

---

## 🛠️ MongoDB Compass (GUI Tool)

MongoDB Compass provides a visual interface:
- **Open:** Start Menu → MongoDB Compass
- **Connect:** Use connection string: `mongodb://localhost:27017`
- **Browse:** View databases, collections, documents
- **Query:** Visual query builder

---

## 📊 Connection Details for CAT Platform

```env
# Default MongoDB connection
MONGODB_URI=mongodb://localhost:27017/cat_modeling_exposure

# Test database
MONGODB_TEST_URI=mongodb://localhost:27017/cat_modeling_exposure_test
```

---

## 🔒 Security Notes (Production)

For production deployment:
1. Enable authentication
2. Create admin user
3. Use strong passwords
4. Configure firewall rules
5. Enable SSL/TLS

**Current setup is for development only - no authentication required**

---

## 📞 Need Help?

- MongoDB Documentation: https://docs.mongodb.com/
- Community Forums: https://www.mongodb.com/community/forums/
- Stack Overflow: Tag `mongodb`

---

**Installation Time:** ~10-15 minutes  
**Disk Space Required:** ~500 MB  
**RAM Required:** Minimum 2GB  

✨ **You're ready to use real data with the CAT Modeling Platform!**
