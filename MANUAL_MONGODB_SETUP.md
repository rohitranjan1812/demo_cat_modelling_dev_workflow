# 🗄️ Manual MongoDB Local Setup - Quick Guide

## 🚀 Step-by-Step Installation

### Step 1: Download & Install MongoDB
1. **Go to:** https://www.mongodb.com/try/download/community
2. **Select:** Windows, MSI package
3. **Download:** MongoDB Community Server 7.0.14
4. **Run installer as Administrator**
5. **Choose:** "Complete" setup
6. **Check:** "Install MongoDB as a Service"
7. **Complete installation**

### Step 2: Start MongoDB Service
Open **Command Prompt as Administrator** and run:
```cmd
net start MongoDB
```

### Step 3: Verify Installation
```cmd
mongod --version
mongo --version
```

### Step 4: Configure Your Project
```cmd
# Copy the local MongoDB configuration
copy .env.local .env

# Install dependencies
npm install

# Seed the database with sample data
npm run seed
```

### Step 5: Start Your Application
**Terminal 1 (Backend):**
```cmd
npm start
```

**Terminal 2 (Frontend):**
```cmd
cd frontend
npm start
```

### Step 6: Test Everything
1. **Open:** http://localhost:3000
2. **Check:** Dashboard shows real data (not zeros!)
3. **Verify:** All API endpoints work

## ✅ Expected Results
- Backend: "✅ Connected to MongoDB: mongodb://localhost:27017/cat_modeling_exposure"
- Dashboard: Shows 3 hazards, 2 vulnerabilities, 2 simulations, 2 accounts
- All pages load with real data from MongoDB

## 🛠️ Troubleshooting
- **Service won't start:** Check if port 27017 is free
- **Connection failed:** Verify MongoDB service is running
- **Empty data:** Run `npm run seed` again

---
**Your local MongoDB setup is ready for full manual testing!** 🎉


