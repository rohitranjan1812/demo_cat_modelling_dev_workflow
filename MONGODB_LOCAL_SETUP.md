# 🗄️ MongoDB Local Installation & Setup Guide

## 📋 Prerequisites
- Windows 10/11 (64-bit)
- Administrator privileges
- At least 1GB free disk space

## 🚀 Step-by-Step Installation

### Step 1: Download MongoDB Community Server
1. **Go to:** [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. **Select:**
   - Version: 7.0.14 (Latest stable)
   - Platform: Windows
   - Package: MSI
3. **Click:** Download

### Step 2: Install MongoDB
1. **Run the MSI installer** as Administrator
2. **Choose:** "Complete" setup type
3. **Important:** Check "Install MongoDB as a Service"
4. **Service Name:** MongoDB
5. **Data Directory:** C:\data\db (default)
6. **Log Directory:** C:\Program Files\MongoDB\Server\7.0\log (default)
7. **Complete the installation**

### Step 3: Verify Installation
Open Command Prompt as Administrator and run:
```cmd
mongod --version
mongo --version
```

### Step 4: Start MongoDB Service
```cmd
# Start MongoDB service
net start MongoDB

# Check if service is running
sc query MongoDB
```

### Step 5: Test Connection
```cmd
# Connect to MongoDB shell
mongo

# In MongoDB shell, test:
> db.runCommand({connectionStatus: 1})
> exit
```

## 🔧 Configuration for CAT Modeling Platform

### Step 1: Create Database Directory (if needed)
```cmd
mkdir C:\data\db
```

### Step 2: Update .env File
Create/update your `.env` file in the project root:
```bash
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
```

### Step 3: Seed Database
```bash
# Install dependencies (if not done)
npm install

# Seed the database with sample data
npm run seed
```

### Step 4: Start Application
**Terminal 1 (Backend):**
```bash
npm start
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm start
```

## 🧪 Testing Your Setup

### Test MongoDB Connection
```bash
# Test backend health
curl http://localhost:3001/health

# Test API endpoints
curl http://localhost:3001/api/v1/hazards
curl http://localhost:3001/api/v1/vulnerabilities
curl http://localhost:3001/api/v1/simulations/runs
curl http://localhost:3001/api/v1/accounts
```

### Expected Results
- Backend should show: "✅ Connected to MongoDB: mongodb://localhost:27017/cat_modeling_exposure"
- API endpoints should return sample data (not empty arrays)
- Frontend dashboard should show real counts instead of zeros

## 🛠️ Troubleshooting

### Common Issues:

1. **"MongoDB service failed to start"**
   ```cmd
   # Check if data directory exists
   dir C:\data\db
   
   # Create if missing
   mkdir C:\data\db
   
   # Restart service
   net stop MongoDB
   net start MongoDB
   ```

2. **"Port 27017 already in use"**
   ```cmd
   # Check what's using the port
   netstat -an | findstr :27017
   
   # Kill the process if needed
   taskkill /F /PID <process_id>
   ```

3. **"Access denied" errors**
   - Run Command Prompt as Administrator
   - Check MongoDB service permissions

4. **"Database connection failed"**
   - Verify MongoDB service is running: `sc query MongoDB`
   - Check .env file has correct MONGODB_URI
   - Ensure no firewall blocking port 27017

### Useful Commands:
```cmd
# Start MongoDB service
net start MongoDB

# Stop MongoDB service
net stop MongoDB

# Check service status
sc query MongoDB

# View MongoDB logs
type "C:\Program Files\MongoDB\Server\7.0\log\mongod.log"

# Connect to MongoDB shell
mongo

# In MongoDB shell:
> show dbs
> use cat_modeling_exposure
> show collections
> db.hazards.find()
```

## ✅ Success Indicators

After successful setup, you should see:
- ✅ MongoDB service running
- ✅ Backend connects to local MongoDB
- ✅ Database seeded with sample data
- ✅ API endpoints return real data
- ✅ Frontend displays actual counts
- ✅ Full CRUD operations working

## 🎯 Next Steps

Once MongoDB is running locally:
1. **Test all API endpoints** to ensure data persistence
2. **Create new hazards/vulnerabilities** through the UI
3. **Run simulations** and verify data storage
4. **Test account management** functionality
5. **Verify data persistence** across application restarts

---

**Your local MongoDB setup is now ready for comprehensive manual testing!** 🚀






