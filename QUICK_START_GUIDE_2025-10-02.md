# Quick Start Guide - CAT Modeling Simulation Tool

## Current Status: ✅ OPERATIONAL

### Prerequisites
- MongoDB is running on your system
- Node.js installed
- Ports 3000 and 3001 available

### Starting the Application

#### 1. Backend Server (Already Running)
The backend is currently running on port 3001. If you need to restart it:
```bash
npm run start:backend
```

#### 2. Frontend Application
In a new terminal:
```bash
npm run start:frontend
```
Then open http://localhost:3000 in your browser

### What's Working

#### ✅ Accounts Module
- View 3 pre-loaded accounts
- Total exposure: $90,000,000
- Search and filter functionality
- Account statistics

#### ✅ Simulations Module  
- View 2 existing simulation runs
- Create new simulations
- Track simulation progress
- View results and statistics

#### ✅ Dashboard
- Overview of system metrics
- Recent simulation activity
- Quick action buttons

#### ✅ Integration Module
- Location-based risk assessment
- Risk dashboard
- Alert system

#### ⚠️ Limited Functionality
- Hazards: No data (validation errors)
- Vulnerabilities: No data (validation errors)

### How to Test

1. **View Accounts**
   - Navigate to Accounts page
   - Should see 3 accounts listed
   - Try search functionality

2. **Check Simulations**
   - Go to Simulations page
   - View existing runs
   - Try creating a new simulation

3. **Test Integration**
   - Visit Integration page
   - Enter location coordinates
   - View risk assessment

### API Endpoints (All Working)
- Health Check: http://localhost:3001/health
- Accounts: http://localhost:3001/api/v1/accounts
- Simulations: http://localhost:3001/api/v1/simulations/runs
- Dashboard: http://localhost:3001/api/v1/simulations/dashboard

### Troubleshooting

**Frontend won't start:**
```bash
cd frontend
npm install
npm start
```

**Backend issues:**
```bash
# Check if MongoDB is running
# Restart backend:
npm run start:backend
```

**No data showing:**
The database has been seeded. If you see no data, check:
- Backend is running (port 3001)
- MongoDB is accessible
- No CORS errors in browser console

### Test Credentials
No authentication required in development mode.

### Support Files
- API Test Results: `tests/api-test-results.json`
- Development Logs: `logs/development/`
- Test Reports: `logs/testing/`

---
**Status**: Ready for testing and development
**Last Updated**: October 2, 2025, 12:30 PM
