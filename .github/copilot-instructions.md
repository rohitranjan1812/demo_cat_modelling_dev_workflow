# GitHub Copilot Instructions - CAT Modeling Application

## Project Overview
Full-stack catastrophe risk modeling platform for insurance simulation. React/TypeScript frontend (port 3000) + Node.js/Express backend (port 3001) + MongoDB with **mandatory replica set** configuration.

## Critical Architecture Decisions

### MongoDB Replica Set Requirement
**The application WILL FAIL without a replica set.** MongoDB must run with `--replSet rs0` to support multi-document ACID transactions used throughout the codebase.

```bash
# Setup (Windows PowerShell as Admin)
.\setup-mongodb-replica.ps1

# Verify connection string includes replicaSet parameter
MONGODB_URI=mongodb://localhost:27017/cat_modeling_dev?replicaSet=rs0
```

**Why**: Services like `BaseService` use transactions (`session.withTransaction()`) for data integrity during simulations. Without replica set, these fail silently or throw errors.

### Data Model Hierarchy
```
Account (ACC-XXXXXX) → Policy (POL-XXXXXXXX) → Exposure (EXP-XXXXXXXXXX)
                                                    ↓
                                                Location (LOC-XXXXXXXX)
                                                    ↓
                                            Hazard + Vulnerability
```

**All models require audit fields**: `createdBy` and `lastModifiedBy` (String, required). Missing these causes validation failures that rollback transactions.

### ID Format Conventions
- Account: `ACC-XXXXXX` (6 digits)
- Hazard: `HAZ-XXXXXXXX` (8 digits)
- Vulnerability: `VUL-XXXXXXXX` (8 digits)
- Location: `LOC-XXXXXXXX` (8 digits)
- Exposure: `EXP-XXXXXXXXXX` (10 digits)
- Policy: `POL-XXXXXXXX` (8 digits)

Regex validators enforce these formats in schemas (`src/models/*.js`).

## Critical Developer Workflows

### Starting the Application
```bash
# Start both frontend and backend
.\start-all.bat

# OR individually
npm run start:backend  # Port 3001
npm run start:frontend # Port 3000
```

### Seeding Data (IMPORTANT)
**Use `seed-minimal-correct.js` as the reference** - it contains correct schema structures with all required nested fields.

```bash
node seed-minimal-correct.js  # Creates 6 test records with correct schemas
```

**Common seeding failure**: Missing audit fields or incorrect nested schemas (e.g., Hazard's `footprint`, `temporal`, `severity` have specific required sub-fields). Check `check-required-fields.js` to discover all required fields.

### Authentication
Demo users (see `LOGIN_CREDENTIALS.md`):
- **demo/DemoPass123!** - Analyst (read/write)
- **admin/AdminPass123!** - Admin (full access)
- **viewer/ViewerPass123!** - Read-only

JWT tokens (7-day expiry) stored in localStorage. Backend middleware: `src/middleware/authenticate.js`.

### Running Tests
```bash
npm test                    # All tests
npm run test:backend        # API integration tests
npm run test:simulation     # Simulation workflow test
node check-required-fields.js  # Discover model requirements
```

**Test data persistence**: Recent debugging revealed that data validation failures cause silent transaction rollbacks. Always verify counts after seeding:
```bash
node verify-data.js  # Comprehensive verification with samples
```

## Project-Specific Patterns

### Service Layer Architecture
**Dependency Injection Pattern** (refactored Phase 1.3):
```javascript
// BAD - hard dependencies
const service = new MyService();

// GOOD - inject dependencies
const engine = new CATSimulationEngine({
  integrationService: integrationService,
  financialService: financialService,
  config: { enableLogging: true }
});
```

Key services:
- `CATSimulationEngine` - Core simulation logic (1766 lines, Monte Carlo)
- `IntegrationService` - Cross-service orchestration
- `FinancialCalculationService` - Loss calculations, deductibles, limits
- `ProbabilityDistributionService` - Statistical distributions

### Frontend State Management
- Redux for complex state (simulations, auth)
- Local useState/useEffect for component state
- API client: `frontend/src/services/api.ts`
- Auth context: `frontend/src/contexts/AuthContext.tsx`

### Simulation Workflow
1. User creates simulation via `SimulationsPage.tsx` → opens modal `SimulationForm.tsx`
2. Form submits to `POST /api/v1/simulations` with:
   ```javascript
   {
     simulationName: "...",
     simulationDescription: "...",
     // Flatten configuration at root level
     numberOfIterations: 1000,
     numberOfYears: 10,
     ...configuration
   }
   ```
3. Backend `CATSimulationEngine` processes via `runSimulation()` method
4. Results stored in `SimulationRun` and `SimulationEvent` collections

**Known Issue**: Modal rendering bug - `SimulationForm` doesn't show when `showForm=true` (React state issue, backend API 100% functional per `test-api-integration.js`).

## Common Pitfalls & Solutions

### 1. Data Not Persisting
**Symptom**: Seeding reports success but `verify-data.js` shows 0 records.
**Cause**: Validation failures in nested schemas or missing audit fields.
**Fix**: Use `seed-minimal-correct.js` structure as template. All models need:
```javascript
{
  // ... model-specific fields
  createdBy: 'system',
  lastModifiedBy: 'system'
}
```

### 2. MongoDB Connection Errors
**Symptom**: "Transaction numbers only allowed on replica set" or timeouts.
**Fix**: Run `setup-mongodb-replica.ps1` and verify `?replicaSet=rs0` in connection string.

### 3. Frontend API 401 Errors
**Symptom**: API calls return Unauthorized.
**Fix**: Check token expiry, login again. Tokens stored in `localStorage.getItem('token')`.

### 4. Simulation Modal Not Showing
**Symptom**: Click "Start Simulation" but modal doesn't appear.
**Status**: Known issue with React state/render (debug logs added to `SimulationsPage.tsx:76-80, 143-152`).
**Workaround**: Direct API testing works - use `test-api-integration.js` to create simulations bypassing UI.

## Key Files & Directories

### Backend Critical Files
- `src/services/CATSimulationEngine.js` - Core simulation engine (1766 lines)
- `src/models/Account.js` - Complex nested schema with hazardRiskProfile
- `src/routes/auth.js` - JWT auth, login rate limiting
- `seed-minimal-correct.js` - **Reference for correct seeding patterns**
- `check-required-fields.js` - Tool to discover model requirements

### Frontend Critical Files
- `frontend/src/pages/Simulations/SimulationsPage.tsx` - Simulation list & launcher
- `frontend/src/components/Simulations/SimulationForm.tsx` - Create simulation modal
- `frontend/src/services/api.ts` - Axios client with auth interceptors

### Documentation
- `ARCHITECTURE_AND_GUIDE.md` - System architecture, roadmap (225 lines)
- `LOGIN_CREDENTIALS.md` - Demo user credentials
- `SESSION_PROGRESS_UPDATE.md` - Latest debugging discoveries

## Testing Philosophy
From `.github/instructions/cat_mod_demo_workflow.instructions.md`:
- Don't conclude test success unless **100% pass** and all issues resolved
- Don't force tests to pass if legitimately failing
- Map entire codebase before adding new code
- Architecture and rigorous testing align with business goals over speed
- Document all changes in `documentation/` directory

## Integration Points
- **MongoDB**: All data persistence with transaction support
- **JWT**: Token-based auth with 7-day expiry
- **Axios**: Frontend-backend communication
- **Material-UI**: Component library for React frontend

## Environment Configuration
```env
# Core settings
MONGODB_URI=mongodb://127.0.0.1:27017/cat_modeling_dev?replicaSet=rs0
PORT=3001
NODE_ENV=development
JWT_SECRET=your-secret-key

# Frontend connects to
REACT_APP_API_URL=http://localhost:3001/api/v1
```

## Next Actions for New Contributors
1. Run `.\setup-mongodb-replica.ps1` (Windows Admin PowerShell)
2. `npm install` (root and `frontend/` directory)
3. `node seed-minimal-correct.js` - Create test data
4. `.\start-all.bat` - Launch application
5. Login with demo/DemoPass123!
6. Review `ARCHITECTURE_AND_GUIDE.md` for system design

---
*Last updated: October 28, 2025*
*For questions on unclear patterns, check `SESSION_SUMMARY.md` for recent debugging context*
