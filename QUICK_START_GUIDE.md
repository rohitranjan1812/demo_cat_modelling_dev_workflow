# CAT Modeling Platform - Quick Start Guide
**Last Updated:** September 30, 2025

---

## 🚀 Get Started in 2 Minutes

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Windows, Mac, or Linux

**Note:** MongoDB is NOT required for development! The platform uses a mock database by default.

---

## ⚡ Quick Start

### 1. Clone & Install

```bash
# Clone the repository
cd "D:\cat modelling\demo_cat_modelling_dev_workflow"

# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install --legacy-peer-deps
cd ..
```

### 2. Setup Environment (One-Time)

```bash
npm run setup:env
```

This creates `.env` files for both backend and frontend with optimal settings.

### 3. Start the Application

```bash
npm run start:all
```

This opens two terminal windows:
- **Backend:** http://localhost:3001
- **Frontend:** http://localhost:3000

**That's it!** Your CAT Modeling Platform is now running! 🎉

---

## 📱 Access the Application

### Frontend (User Interface)
Open your browser and navigate to:
```
http://localhost:3000
```

### Backend (API)
The API is available at:
```
http://localhost:3001/api/v1
```

### Health Check
Verify the backend is running:
```
http://localhost:3001/health
```

---

## 🎯 What Can You Do?

### 1. Manage Hazards
- View hazards on interactive map
- Create new hazards (hurricanes, earthquakes, floods)
- Analyze hazard statistics
- Query hazards by location

**Try:** Navigate to `Hazards` in the sidebar

### 2. Assess Vulnerabilities
- Evaluate asset vulnerability
- Calculate location-based risk scores
- Get risk mitigation recommendations

**Try:** Navigate to `Vulnerabilities` in the sidebar

### 3. Run Simulations
- Configure Monte Carlo simulations
- Analyze probabilistic loss scenarios
- View financial risk metrics
- Export simulation results

**Try:** Navigate to `Simulations` in the sidebar

### 4. Integration & Analytics
- Location risk assessment
- Account risk analysis
- Financial metrics calculation
- Risk comparison tools

**Try:** Navigate to `Integration` in the sidebar

---

## 🛠️ Alternative Startup Methods

### Method 1: Automated (Recommended)
```bash
npm run start:all
```
Starts both backend and frontend automatically

### Method 2: Manual (More Control)

**Terminal 1 - Backend:**
```bash
npm run start:backend
```

**Terminal 2 - Frontend:**
```bash
npm run start:frontend
```

### Method 3: Development Mode (Auto-Reload)

**Terminal 1 - Backend:**
```bash
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

---

## 📊 Available API Endpoints

### Hazards
```
GET    /api/v1/hazards                    - List all hazards
GET    /api/v1/hazards/statistics         - Hazard statistics
GET    /api/v1/hazards/affecting-location - Query by location
GET    /api/v1/hazards/:id                - Get hazard by ID
POST   /api/v1/hazards                    - Create hazard
PUT    /api/v1/hazards/:id                - Update hazard
DELETE /api/v1/hazards/:id                - Delete hazard
```

### Vulnerabilities
```
GET    /api/v1/vulnerabilities                   - List all
GET    /api/v1/vulnerabilities/statistics        - Statistics
GET    /api/v1/vulnerabilities/location-score    - Calculate score
GET    /api/v1/vulnerabilities/affecting-location- Query by location
POST   /api/v1/vulnerabilities                   - Create
```

### Integration
```
GET    /api/v1/integration/risk/location                - Location risk
GET    /api/v1/integration/risk/account/:accountId      - Account risk
POST   /api/v1/integration/financial/:accountId/metrics - Financial metrics
POST   /api/v1/integration/risk/comparison              - Compare risks
GET    /api/v1/integration/dashboard                    - Dashboard data
```

### Simulations
```
POST   /api/v1/simulations/start             - Start simulation
GET    /api/v1/simulations/runs              - Get simulation runs
GET    /api/v1/simulations/:id/status        - Get status
GET    /api/v1/simulations/:id/results       - Get results
GET    /api/v1/simulations/dashboard         - Dashboard
```

---

## 🧪 Test the API

### Using curl

**Health Check:**
```bash
curl http://localhost:3001/health
```

**Get Hazards:**
```bash
curl http://localhost:3001/api/v1/hazards
```

**Get Hazard Statistics:**
```bash
curl http://localhost:3001/api/v1/hazards/statistics
```

**Create Hazard:**
```bash
curl -X POST http://localhost:3001/api/v1/hazards \
  -H "Content-Type: application/json" \
  -d '{
    "hazardId": "HAZ-001",
    "hazardName": "Test Hurricane",
    "hazardType": "Hurricane",
    "severity": "Major",
    "probability": 0.15
  }'
```

### Using Postman

1. Import the API collection (if available)
2. Base URL: `http://localhost:3001/api/v1`
3. All endpoints are available without authentication

---

## 🗺️ Frontend Navigation

### Dashboard (/)
- System overview
- Recent simulations
- Quick actions
- Interactive hazard map

### Hazards (/hazards)
- Hazard list with filtering
- Create/edit hazards
- View hazard details
- Hazard statistics

### Vulnerabilities (/vulnerabilities)
- Vulnerability list
- Risk assessments
- Mitigation recommendations
- Location-based queries

### Simulations (/simulations)
- Start new simulation
- View simulation runs
- Analyze results
- Export data

### Integration (/integration)
- Location risk assessment
- Account risk analysis
- Financial metrics
- Risk comparison

### Accounts (/accounts)
- Account management
- Exposure tracking
- Policy management

---

## ⚙️ Configuration

### Backend Configuration (.env)
```env
PORT=3001                    # Backend port
NODE_ENV=development         # Environment
USE_MOCK_DB=true            # Use mock database (no MongoDB needed)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Frontend Configuration (.env)
```env
REACT_APP_API_URL=http://localhost:3001/api/v1
REACT_APP_ENABLE_DEBUG_MODE=true
```

### Change Configuration

1. **Edit .env files** (backend and frontend)
2. **Restart the application**

**Or**

```bash
# Delete existing .env files
# Re-run setup
npm run setup:env
```

---

## 🔧 Troubleshooting

### Problem: "Port 3001 already in use"

**Solution 1:** Kill the process using port 3001
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3001 | xargs kill -9
```

**Solution 2:** Change the port in `.env`
```env
PORT=3002
```

Then update frontend `.env`:
```env
REACT_APP_API_URL=http://localhost:3002/api/v1
```

---

### Problem: "Cannot connect to backend"

**Check:**
1. Backend is running on http://localhost:3001
2. Frontend `.env` has correct `REACT_APP_API_URL`
3. CORS is configured (it should be by default)

**Solution:**
```bash
# Restart both services
npm run start:all
```

---

### Problem: "CORS error in browser"

**Check:**
1. Backend `.env` has `ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001`
2. Backend is restarted after changing .env

**Solution:**
```bash
# Re-run environment setup
npm run setup:env

# Restart backend
npm run start:backend
```

---

### Problem: "Module not found"

**Solution:**
```bash
# Reinstall dependencies
npm install
cd frontend
npm install --legacy-peer-deps
```

---

### Problem: "Data doesn't persist"

**This is expected!** The mock database is in-memory.

**To persist data:**
1. Install MongoDB
2. Change `.env`:
   ```env
   USE_MOCK_DB=false
   MONGODB_URI=mongodb://localhost:27017/cat_modeling_exposure
   ```
3. Restart backend

---

## 📚 Additional Resources

### Documentation
- **Integration Fix Summary:** `INTEGRATION_FIX_SUMMARY.md`
- **Product Owner Log:** `logs/PRODUCT_OWNER_LOG_2025-09-30.md`
- **Developer Log:** `logs/DEVELOPER_LOG_2025-09-30.md`
- **Tester Log:** `logs/TESTER_LOG_2025-09-30.md`

### Architecture
- **Main README:** `README.md`
- **Integration Architecture:** `INTEGRATION_ARCHITECTURE.md`
- **Hazard Module Docs:** `HAZARD_MODULE_DOCUMENTATION.md`
- **Vulnerability Docs:** `VULNERABILITY_MODULE_DOCUMENTATION.md`

---

## 🎓 Next Steps

### For Developers
1. Review the codebase structure
2. Check out the API documentation
3. Read the developer log for technical details
4. Start building features!

### For Testers
1. Review the test log
2. Test the main user workflows
3. Report any issues
4. Suggest improvements

### For Product Owners
1. Review the product owner log
2. Test the business use cases
3. Provide feedback
4. Plan next features

---

## ✨ Tips & Best Practices

### Development
- Use `npm run dev` for auto-reload during development
- Keep both backend and frontend running
- Use browser DevTools to debug frontend
- Check backend console for API logs

### Testing
- Test in multiple browsers (Chrome, Firefox, Edge)
- Use Postman for API testing
- Check browser console for errors
- Verify network tab for API calls

### Data
- Mock database resets on backend restart
- Create test data via API or frontend
- Save important test scenarios
- Use data seeding scripts (coming soon)

---

## 🆘 Getting Help

### Check Logs
```bash
# Backend logs in terminal
# Frontend logs in browser console (F12)
```

### Common Solutions
1. Restart the application
2. Clear browser cache
3. Re-run environment setup
4. Reinstall dependencies

### Still Stuck?
Check the comprehensive documentation in the `logs/` folder:
- Product Owner Log - Business perspective
- Developer Log - Technical details
- Tester Log - Quality assurance

---

## 🎉 Success Checklist

- [ ] Backend running on http://localhost:3001
- [ ] Frontend accessible at http://localhost:3000
- [ ] Health check returns success
- [ ] Dashboard loads without errors
- [ ] Can navigate between pages
- [ ] API calls work (check Network tab)
- [ ] No CORS errors in console

If all checked, you're ready to go! 🚀

---

**Happy Modeling!** 🌪️📊💼

**Last Updated:** September 30, 2025  
**Version:** 1.0.0
