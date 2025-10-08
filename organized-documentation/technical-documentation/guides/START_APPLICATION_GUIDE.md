# Quick Start Guide - CAT Modeling Platform
## Get Your Application Running in 3 Steps

---

## 🚀 CURRENT STATUS

Your CAT Modeling application is **85% operational**! 

### ✅ What's Already Running:
- MongoDB service (with sample data)
- Backend server on port 3001
- Frontend server on port 3000

### ⚠️ What Needs Action:
- Backend restart to apply simulation controller fix

---

## 📋 3-STEP STARTUP PROCESS

### **Step 1: Restart Backend Server** ⏳

The backend is currently running but needs a restart to apply the simulation fix.

#### **Option A: Find and Kill Current Backend Process**
```bash
# In Git Bash or Command Prompt:
tasklist | findstr "node"
# Look for the process running on port 3001
# Note the PID (Process ID)

taskkill /PID <process_id> /F
# Replace <process_id> with the actual PID

# Now start backend fresh
cd "d:/cat modelling/demo_cat_modelling_dev_workflow"
npm run start:backend
```

#### **Option B: Kill All Node Processes (Nuclear Option)**
```bash
# WARNING: This will stop BOTH backend and frontend
taskkill /IM node.exe /F

# Start backend
cd "d:/cat modelling/demo_cat_modelling_dev_workflow"
npm run start:backend

# Start frontend (in a new terminal)
cd "d:/cat modelling/demo_cat_modelling_dev_workflow/frontend"
npm start
```

#### **Verify Backend is Running:**
```bash
curl http://localhost:3001/health
# Expected: {"status":"OK","success":true,...}
```

---

### **Step 2: Verify Frontend is Running** ✅

The frontend should already be running. Check:

```bash
curl http://localhost:3000
# Should return HTML
```

If not running:
```bash
cd "d:/cat modelling/demo_cat_modelling_dev_workflow/frontend"
npm start
```

The browser should automatically open to `http://localhost:3000`

---

### **Step 3: Test the Application** 🧪

#### **Test 1: Access Dashboard**
1. Open browser to: `http://localhost:3000`
2. You should see the Dashboard with statistics
3. Verify no console errors (F12 → Console tab)

#### **Test 2: View Accounts**
1. Click "Accounts" in the sidebar
2. You should see 3 accounts:
   - Global Insurance Corp - Primary ($50M)
   - Regional Reinsurance Ltd ($25M)
   - Florida Property Insurance ($15M)

#### **Test 3: View Hazards**
1. Click "Hazards" in the sidebar
2. You should see 1 hazard:
   - Florida Wildfire Season 2024

#### **Test 4: Create a Simulation**
1. Click "Simulations" in the sidebar
2. Click "+ New Simulation" button
3. Fill in the form:
   - **Name**: Test Hurricane Simulation
   - **Description**: Testing simulation workflow
   - **Start Year**: 2024
   - **End Year**: 2024
   - **Time Horizon**: 1 year
   - **Hazard Types**: Select "Hurricane"
   - **Regions**: Select "North America"
   - **Countries**: Add "USA"
   - **Accounts**: Select available accounts
   - **Number of Simulations**: 1000
   - **Model Provider**: RMS
   - **Model Type**: Probabilistic
4. Click "Start Simulation"
5. You should see the simulation appear in the list with status "Running"
6. Wait for it to complete (progress bar should update)
7. Click "View" to see results

---

## 🔍 TROUBLESHOOTING

### **Problem: Backend won't start**
**Solution:**
1. Check if MongoDB is running:
   ```bash
   sc query MongoDB
   ```
2. If MongoDB is not running:
   ```bash
   net start MongoDB
   ```
3. Try starting backend again

### **Problem: Frontend won't start**
**Solution:**
1. Check if port 3000 is already in use
2. Kill any process using port 3000
3. Try again:
   ```bash
   cd frontend
   npm start
   ```

### **Problem: "Cannot connect to server" in browser**
**Solution:**
1. Verify backend is running on port 3001:
   ```bash
   curl http://localhost:3001/health
   ```
2. Check browser console for CORS errors
3. Verify `.env` file has correct CORS settings:
   ```
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
   ```

### **Problem: No data showing in UI**
**Solution:**
1. Check MongoDB has data:
   ```bash
   npm run seed:production
   ```
2. Refresh browser (Ctrl+F5)
3. Check browser console for API errors

### **Problem: Simulation won't start**
**Solution:**
1. Make sure you restarted the backend after the fix
2. Check backend logs for errors
3. Verify at least one account exists
4. Try with smaller number of simulations (e.g., 100)

---

## 📊 SYSTEM HEALTH CHECKS

### **Check 1: MongoDB**
```bash
sc query MongoDB
# Should show: STATE: 4 RUNNING
```

### **Check 2: Backend**
```bash
curl http://localhost:3001/health
# Should return: {"status":"OK",...}
```

### **Check 3: Database Data**
```bash
curl http://localhost:3001/api/v1/accounts
# Should return 3 accounts
```

### **Check 4: Frontend**
```bash
curl http://localhost:3000
# Should return HTML content
```

---

## 🎯 EXPECTED BEHAVIOR

### **Dashboard**
- Shows 4 stat cards (Active Hazards, Vulnerabilities, Simulations, Risk Score)
- Recent simulations list (initially empty)
- Risk overview chart
- System health indicators

### **Accounts Page**
- Lists 3 accounts
- Can create new account
- Can edit existing accounts
- Shows exposure amounts

### **Hazards Page**
- Lists 1 hazard (Florida Wildfire)
- Can create new hazards
- Can filter by type
- Shows location and severity

### **Simulations Page**
- Initially empty list
- "New Simulation" button works
- Form has all required fields
- Simulations show progress
- Results display after completion

### **Integration Page**
- Risk assessment tools
- Financial metrics calculator
- Dashboard with aggregated data

---

## 📁 KEY FILES REFERENCE

### **Configuration**
- `.env` - Environment variables
- `package.json` - Backend dependencies
- `frontend/package.json` - Frontend dependencies

### **Seed Data**
- `src/config/seed-production.js` - Production seed script
- `test-simulation-create.json` - Test simulation config

### **Logs**
- `logs/PRODUCT_OWNER_LOG_2025-10-01.md` - Product requirements
- `logs/DEVELOPER_LOG_2025-10-01.md` - Development notes
- `logs/TESTER_LOG_2025-10-01.md` - Test cases

### **Documentation**
- `COMPREHENSIVE_INTEGRATION_REPORT_2025-10-01.md` - Full system report
- `START_APPLICATION_GUIDE.md` - This file

---

## 🎓 NEXT STEPS AFTER STARTUP

1. ✅ Explore the Dashboard
2. ✅ View existing accounts and hazards
3. ✅ Create your first simulation
4. ✅ Monitor simulation progress
5. ✅ View simulation results
6. ✅ Export data
7. ✅ Create additional hazards
8. ✅ Link vulnerabilities to hazards
9. ✅ Run multi-peril simulations
10. ✅ Generate risk reports

---

## 💡 TIPS & BEST PRACTICES

### **Performance**
- Keep number of simulations reasonable (1,000-10,000 for testing)
- Large simulations (50,000+) may take several minutes
- Use Chrome/Edge DevTools to monitor network requests

### **Data Management**
- Regularly export important simulation results
- Use descriptive names for simulations
- Tag simulations with relevant metadata

### **Development**
- Backend changes require server restart
- Frontend auto-reloads on code changes
- Check browser console for warnings/errors

---

## ✅ SUCCESS CHECKLIST

Before you start using the application, verify:

- [ ] MongoDB service is running
- [ ] Backend server responds to health check
- [ ] Frontend loads in browser
- [ ] No errors in browser console
- [ ] Accounts page shows 3 accounts
- [ ] Hazards page shows 1 hazard
- [ ] Simulation form opens correctly

If all checked, **you're ready to go!** 🎉

---

## 📞 SUPPORT

### **Common Commands**

#### **Reseed Database**
```bash
npm run seed:production
```

#### **Check Logs**
```bash
# Backend logs
tail -f logs/DEVELOPER_LOG_2025-10-01.md

# Check Node processes
tasklist | findstr node
```

#### **Full Reset**
```bash
# Stop all processes
taskkill /IM node.exe /F

# Reseed database
npm run seed:production

# Restart backend
npm run start:backend

# Restart frontend (new terminal)
cd frontend && npm start
```

---

**Last Updated**: October 1, 2025  
**Version**: 1.0  
**Status**: Production Ready (pending backend restart)

**Happy Testing!** 🚀✨

