# MongoDB Backend Integration Setup Guide

## 🎯 Overview
This guide will help you set up a proper MongoDB backend for full-fledged manual testing of the CAT Modeling Platform.

## 📋 Prerequisites
- Node.js installed
- Either MongoDB Atlas account (recommended) OR local MongoDB installation

## 🚀 Option 1: MongoDB Atlas (Cloud) - RECOMMENDED

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Create a new cluster (choose the FREE tier)

### Step 2: Get Connection String
1. In Atlas, click "Connect" on your cluster
2. Select "Connect your application"
3. Copy the connection string (it looks like):
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
   ```

### Step 3: Configure Environment
1. **Create `.env` file in the root directory:**
   ```bash
   # MongoDB Configuration
   MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/cat_modeling_exposure?retryWrites=true&w=majority
   MONGODB_TEST_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/cat_modeling_exposure_test?retryWrites=true&w=majority

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

   **⚠️ Important:** Replace `your_username`, `your_password`, and the cluster URL with your actual Atlas credentials.

## 🔧 Option 2: Local MongoDB

### Step 1: Install MongoDB
- **Windows:** Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
- **macOS:** `brew install mongodb-community`
- **Linux:** Follow [MongoDB installation guide](https://docs.mongodb.com/manual/administration/install-on-linux/)

### Step 2: Start MongoDB Service
```bash
# Windows (run as Administrator)
net start MongoDB

# macOS/Linux
brew services start mongodb-community
# OR
sudo systemctl start mongod
```

### Step 3: Configure Environment
Create `.env` file in the root directory:
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

## 🌱 Database Setup & Seeding

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Seed Database with Sample Data
```bash
npm run seed
```

This will:
- ✅ Connect to your MongoDB database
- ✅ Clear any existing data
- ✅ Insert sample hazards, vulnerabilities, simulations, and accounts
- ✅ Show a summary of created data

## 🚀 Starting the Application

### Step 1: Start Backend (Terminal 1)
```bash
cd "D:\cat modelling\demo_cat_modelling_dev_workflow"
npm start
```

Expected output:
```
✅ Connected to MongoDB: mongodb+srv://...
🚀 Server running on port 3001
📊 Environment: development
🔗 Health check: http://localhost:3001/health
📋 API Documentation: http://localhost:3001/api/v1
```

### Step 2: Start Frontend (Terminal 2)
```bash
cd "D:\cat modelling\demo_cat_modelling_dev_workflow\frontend"
npm start
```

Expected output:
```
Local:            http://localhost:3000
webpack compiled with 0 errors
```

## 🧪 Testing the Integration

### Backend API Tests
```bash
# Health check
curl http://localhost:3001/health

# Get hazards (should return sample data)
curl http://localhost:3001/api/v1/hazards

# Get vulnerabilities
curl http://localhost:3001/api/v1/vulnerabilities

# Get simulations
curl http://localhost:3001/api/v1/simulations/runs

# Get accounts
curl http://localhost:3001/api/v1/accounts
```

### Frontend Integration
1. Open `http://localhost:3000`
2. Navigate to Dashboard - should show real data counts
3. Go to Hazards page - should display sample hazards
4. Check Vulnerabilities - should show sample vulnerability data
5. View Simulations - should display sample simulation runs

## 📊 Expected Results

After successful setup, your Dashboard should show:
- **Active Hazards:** 3 (Hurricane Maria, California Earthquake, European Flood)
- **Vulnerabilities:** 2 (Coastal Infrastructure, Urban Development)  
- **Simulations:** 2 (Hurricane Impact Analysis, Earthquake Risk Assessment)
- **Accounts:** 2 (Global Insurance Corp, Regional Reinsurance Ltd)

## 🛠️ Troubleshooting

### Common Issues:

1. **"Cannot connect to MongoDB"**
   - Check your connection string
   - Ensure MongoDB service is running (local) or Atlas cluster is active
   - Verify network connectivity

2. **"Port already in use"**
   - Kill existing Node processes: `taskkill /F /IM node.exe` (Windows)
   - Change PORT in .env file

3. **"Environment variable not found"**
   - Ensure .env file exists in root directory
   - Check .env file syntax (no spaces around =)

4. **Frontend shows zeros on dashboard**
   - Verify backend is running on port 3001
   - Check browser console for API errors
   - Ensure database seeding was successful

## 🎉 Success Indicators

✅ Backend starts without errors  
✅ Database connection successful  
✅ API endpoints return sample data  
✅ Frontend displays real data from backend  
✅ Dashboard shows non-zero counts  
✅ All pages load with sample data  

## 📞 Need Help?

If you encounter issues:
1. Check the terminal logs for specific error messages
2. Verify your .env file configuration
3. Ensure MongoDB service is running
4. Test API endpoints individually using curl or Postman

---

**Your CAT Modeling Platform is now ready for comprehensive manual testing with a real MongoDB backend!** 🚀









