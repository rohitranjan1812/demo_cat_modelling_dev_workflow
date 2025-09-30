# 🚀 Quick Start - MongoDB Backend Integration

## ⚡ TL;DR - Get Running in 5 Minutes

### 1. Create `.env` file in root directory:
```bash
# Copy this exactly into your .env file:

# MongoDB Atlas (Cloud) - RECOMMENDED
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/cat_modeling_exposure?retryWrites=true&w=majority
MONGODB_TEST_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/cat_modeling_exposure_test?retryWrites=true&w=majority

# OR for Local MongoDB (uncomment if you prefer local)
# MONGODB_URI=mongodb://localhost:27017/cat_modeling_exposure  
# MONGODB_TEST_URI=mongodb://localhost:27017/cat_modeling_exposure_test

PORT=3001
NODE_ENV=development
API_VERSION=v1
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
JWT_SECRET=cat_modeling_jwt_secret_2024_development_key
BCRYPT_ROUNDS=12
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### 2. Seed Database:
```bash
npm run seed
```

### 3. Start Backend (Terminal 1):
```bash
npm start
```

### 4. Start Frontend (Terminal 2):
```bash
cd frontend
npm start
```

### 5. Open Browser:
```
http://localhost:3000
```

## ✅ What You Should See:
- **Dashboard** with real data counts (not zeros!)
- **Hazards:** 3 items (Hurricane Maria, California Earthquake, European Flood)
- **Vulnerabilities:** 2 items (Coastal Infrastructure, Urban Development)
- **Simulations:** 2 items (Hurricane Impact Analysis, Earthquake Risk Assessment)
- **Accounts:** 2 items (Global Insurance Corp, Regional Reinsurance Ltd)

## 🔧 If Something Goes Wrong:

### MongoDB Atlas Setup (5 minutes):
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create free account → Create cluster (FREE tier)
3. Get connection string → Replace in .env file

### Quick Tests:
```bash
# Test backend health
curl http://localhost:3001/health

# Test data
curl http://localhost:3001/api/v1/hazards
```

## 📋 What Changed:
✅ **Removed mock database** - Now uses real MongoDB  
✅ **Fixed all models** - Proper Mongoose integration  
✅ **Added seeding script** - Realistic sample data  
✅ **Fixed frontend API calls** - Points to correct backend  
✅ **Created comprehensive setup guide** - See MONGODB_SETUP_GUIDE.md  

---

**Your CAT Modeling Platform now has a proper MongoDB backend ready for full manual testing!** 🎉


