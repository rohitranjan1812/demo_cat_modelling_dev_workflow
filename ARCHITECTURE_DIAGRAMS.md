# CAT Modeling Application - Visual Architecture Diagrams

**Generated:** January 2, 2026  
**Purpose:** Visual representation of system architecture and data flow

---

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Data Model Relationships](#data-model-relationships)
3. [Simulation Workflow](#simulation-workflow)
4. [Service Layer Architecture](#service-layer-architecture)
5. [Authentication Flow](#authentication-flow)
6. [Frontend Component Tree](#frontend-component-tree)
7. [API Endpoint Map](#api-endpoint-map)
8. [Testing Architecture](#testing-architecture)

---

## 1. System Architecture

### Three-Tier Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION TIER                              │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────┐      │
│  │              React Frontend (TypeScript)                     │      │
│  │              Running on http://localhost:3000                │      │
│  └─────────────────────────────────────────────────────────────┘      │
│                                                                         │
│  Components:                                                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │  Dashboard  │  │ Simulations │  │  Accounts   │  │   Hazards   │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │
│                                                                         │
│  State Management:                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                   │
│  │    Redux    │  │   Context   │  │ Local State │                   │
│  └─────────────┘  └─────────────┘  └─────────────┘                   │
└───────────────────────────┬─────────────────────────────────────────────┘
                            │
                            │ HTTP/REST (Axios)
                            │ JWT Authentication
                            │
┌───────────────────────────▼─────────────────────────────────────────────┐
│                         APPLICATION TIER                                │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────┐      │
│  │           Node.js/Express Backend                            │      │
│  │           Running on http://localhost:3001                   │      │
│  └─────────────────────────────────────────────────────────────┘      │
│                                                                         │
│  Middleware Stack:                                                      │
│  ┌─────────┐  ┌──────────┐  ┌─────────┐  ┌────────┐  ┌────────┐     │
│  │ Helmet  │→ │   CORS   │→ │  Morgan │→ │  Auth  │→ │  Rate  │     │
│  │Security │  │          │  │ Logging │  │  JWT   │  │ Limit  │     │
│  └─────────┘  └──────────┘  └─────────┘  └────────┘  └────────┘     │
│                                                                         │
│  API Routes (/api/v1):                                                  │
│  ┌─────────────────────────────────────────────────────────────┐      │
│  │ /auth  /accounts  /policies  /exposures  /locations         │      │
│  │ /hazards  /vulnerabilities  /simulations  /integration      │      │
│  └─────────────────────────────────────────────────────────────┘      │
│                                                                         │
│  Controllers:                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                │
│  │ Auth         │  │ Account      │  │ Simulation   │                │
│  │ Controller   │  │ Controller   │  │ Controller   │                │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                │
│         │                  │                  │                         │
│  Service Layer:            ▼                  ▼                         │
│  ┌────────────────────────────────────────────────────────────┐       │
│  │                                                             │       │
│  │  ┌──────────────────┐    ┌──────────────────────────┐     │       │
│  │  │ CATSimulation    │    │  IntegrationService      │     │       │
│  │  │ Engine           │◀───│  (Orchestration)         │     │       │
│  │  │ (1765 lines)     │    │                          │     │       │
│  │  └──────────────────┘    └──────────────────────────┘     │       │
│  │           ▲                         ▲                      │       │
│  │           │                         │                      │       │
│  │  ┌────────┴─────────┐      ┌───────┴──────────┐          │       │
│  │  │ Financial        │      │ Probability      │          │       │
│  │  │ Calculation      │      │ Distribution     │          │       │
│  │  │ Service          │      │ Service          │          │       │
│  │  └──────────────────┘      └──────────────────┘          │       │
│  │                                                             │       │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │       │
│  │  │ Account      │  │ Hazard       │  │ Exposure     │   │       │
│  │  │ Service      │  │ Service      │  │ Service      │   │       │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │       │
│  │                                                             │       │
│  └─────────────────────────────────────────────────────────────┘      │
│                                                                         │
└───────────────────────────┬─────────────────────────────────────────────┘
                            │
                            │ Mongoose ODM
                            │ ACID Transactions
                            │
┌───────────────────────────▼─────────────────────────────────────────────┐
│                           DATA TIER                                     │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────┐      │
│  │              MongoDB Database                                │      │
│  │              Port: 27017                                     │      │
│  │              Replica Set: rs0 (REQUIRED)                     │      │
│  └─────────────────────────────────────────────────────────────┘      │
│                                                                         │
│  Collections:                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │  accounts    │  │   policies   │  │  exposures   │  │ locations │ │
│  │  (Account)   │  │   (Policy)   │  │  (Exposure)  │  │ (Location)│ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └───────────┘ │
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │   hazards    │  │vulnerabilities│ │simulationruns│  │simulation │ │
│  │  (Hazard)    │  │(Vulnerability)│ │(SimulationRun)│ │  events   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └───────────┘ │
│                                                                         │
│  Features:                                                              │
│  ✅ ACID Transactions      ✅ Replica Set                              │
│  ✅ Validation Schemas     ✅ Indexes                                  │
│  ✅ Audit Fields          ✅ Relationships                             │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Data Model Relationships

### Entity Relationship Diagram

```
                                    ┌──────────────────┐
                                    │     Account      │
                                    │   ACC-XXXXXX     │
                                    ├──────────────────┤
                                    │ accountId (PK)   │
                                    │ accountName      │
                                    │ accountType      │
                                    │ parentAccountId  │◀─┐
                                    │ totalExposure    │  │ Self-referencing
                                    │ regions[]        │  │ (Hierarchy)
                                    └────────┬─────────┘  │
                                             │            │
                                             │ hasMany    │
                                             ▼            │
                    ┌────────────────────────────────────┴┐
                    │           Policy                    │
                    │        POL-XXXXXXXX                 │
                    ├─────────────────────────────────────┤
                    │ policyId (PK)                       │
                    │ accountId (FK) ──────────────────┐  │
                    │ policyNumber                     │  │
                    │ coverages[]                      │  │
                    │ totalLimit                       │  │
                    │ hazardCoverage                   │  │
                    └────────┬────────────────────────────┘
                             │
                             │ hasMany
                             ▼
        ┌────────────────────────────────────────┐
        │            Exposure                    │
        │         EXP-XXXXXXXXXX                 │
        ├────────────────────────────────────────┤
        │ exposureId (PK)                        │
        │ policyId (FK) ──────────────────────┐  │
        │ locationId (FK) ─────────────────┐  │  │
        │ totalInsuredValue                │  │  │
        │ policyTerms                      │  │  │
        │ riskFactors                      │  │  │
        └──────────┬───────────────────────┘  │  │
                   │                           │  │
                   │ belongsTo                 │  │
                   ▼                           │  │
    ┌──────────────────────┐                  │  │
    │     Location         │◀─────────────────┘  │
    │   LOC-XXXXXXXX       │                     │
    ├──────────────────────┤                     │
    │ locationId (PK)      │                     │
    │ address              │                     │
    │ coordinates[]        │                     │
    │ propertyChar...      │                     │
    └──────────────────────┘                     │
                                                  │
                                                  │
         ┌────────────────────────────────────────┘
         │
         │ uses in simulation
         ▼
┌──────────────────┐         ┌──────────────────┐
│     Hazard       │         │  Vulnerability   │
│  HAZ-XXXXXXXX    │         │  VUL-XXXXXXXX    │
├──────────────────┤         ├──────────────────┤
│ hazardId (PK)    │         │ vulnerabilityId  │
│ hazardType       │         │ assetType        │
│ footprint        │         │ vulnerabilityFac │
│ severity         │         │ damageThresholds │
│ temporal         │         │ mitigationMeas.. │
└────────┬─────────┘         └────────┬─────────┘
         │                            │
         │ used in                    │ used in
         └────────────┐      ┌────────┘
                      ▼      ▼
              ┌──────────────────────┐
              │   SimulationRun      │
              │    (Auto-gen ID)     │
              ├──────────────────────┤
              │ simulationId (PK)    │
              │ simulationName       │
              │ numberOfIterations   │
              │ numberOfYears        │
              │ configuration        │
              │ status               │
              └──────┬───────────────┘
                     │
                     │ hasMany
                     ▼
              ┌──────────────────────┐
              │  SimulationEvent     │
              │    (Auto-gen ID)     │
              ├──────────────────────┤
              │ eventId (PK)         │
              │ simulationRunId (FK) │
              │ eventYear            │
              │ hazardType           │
              │ totalLoss            │
              │ affectedExposures[]  │
              └──────────────────────┘
```

### ID Format Reference

```
Entity          Format              Example            Regex
─────────────────────────────────────────────────────────────────
Account         ACC-XXXXXX          ACC-100001         ^ACC-\d{6}$
Hazard          HAZ-XXXXXXXX        HAZ-10000001       ^HAZ-\d{8}$
Vulnerability   VUL-XXXXXXXX        VUL-10000001       ^VUL-\d{8}$
Location        LOC-XXXXXXXX        LOC-10000001       ^LOC-\d{8}$
Exposure        EXP-XXXXXXXXXX      EXP-1000000001     ^EXP-\d{10}$
Policy          POL-XXXXXXXX        POL-10000001       ^POL-\d{8}$
```

---

## 3. Simulation Workflow

### Complete Simulation Process

```
┌──────────────────────────────────────────────────────────────────────┐
│                        SIMULATION WORKFLOW                           │
└──────────────────────────────────────────────────────────────────────┘

Phase 1: User Interaction
──────────────────────────
  User                    Frontend
    │                        │
    │ 1. Click "Start"       │
    │  (CURRENTLY MISSING!)  │
    ├───────────────────────▶│
    │                        │
    │ 2. Fill form:          │
    │    - Name              │
    │    - Iterations (1000) │
    │    - Years (10)        │
    │    - Config params     │
    ├───────────────────────▶│
    │                        │
    │ 3. Submit              │
    ├───────────────────────▶│
    │                        │

Phase 2: API Call
─────────────────
                Frontend                    Backend API
                    │                          │
                    │ POST /api/v1/simulations │
                    │ {                        │
                    │   simulationName: "...", │
                    │   numberOfIterations,    │
                    │   numberOfYears,         │
                    │   configuration          │
                    │ }                        │
                    ├─────────────────────────▶│
                    │                          │
                    │                          │ Validate JWT
                    │                          │ Validate input
                    │                          │
                    │                          ▼
                    │                   SimulationController
                    │                          │
                    │                          │ createSimulation()
                    │                          ▼
                    │                   SimulationService
                    │                          │

Phase 3: Simulation Engine (CATSimulationEngine)
────────────────────────────────────────────────
                                                 │
                    ┌────────────────────────────┘
                    │
                    ▼
    ┌──────────────────────────────────────────────────┐
    │  runSimulation(simulationConfig)                 │
    └──────────────────────────────────────────────────┘
                    │
                    │ 1. Validate configuration
                    ▼
    ┌──────────────────────────────────────────────────┐
    │  Load data via IntegrationService:               │
    │  - All exposures with policy/location data       │
    │  - All relevant hazards                          │
    │  - All relevant vulnerabilities                  │
    └──────────────────────────────────────────────────┘
                    │
                    │ 2. Initialize
                    ▼
    ┌──────────────────────────────────────────────────┐
    │  FOR iteration = 1 to numberOfIterations         │
    │  ┌────────────────────────────────────────────┐  │
    │  │  FOR year = 1 to numberOfYears             │  │
    │  │  ┌──────────────────────────────────────┐  │  │
    │  │  │  Generate Hazard Events              │  │  │
    │  │  │  (Poisson frequency distribution)    │  │  │
    │  │  │                                       │  │  │
    │  │  │  FOR each hazard event:              │  │  │
    │  │  │  ┌────────────────────────────────┐  │  │  │
    │  │  │  │  Calculate affected exposures  │  │  │  │
    │  │  │  │  (geographic footprint match)  │  │  │  │
    │  │  │  │                                 │  │  │  │
    │  │  │  │  FOR each affected exposure:   │  │  │  │
    │  │  │  │  ┌──────────────────────────┐  │  │  │  │
    │  │  │  │  │  Apply vulnerability     │  │  │  │  │
    │  │  │  │  │  Calculate damage ratio  │  │  │  │  │
    │  │  │  │  │  Compute gross loss      │  │  │  │  │
    │  │  │  │  │  Apply deductible        │  │  │  │  │
    │  │  │  │  │  Apply limits            │  │  │  │  │
    │  │  │  │  │  Net loss = final loss   │  │  │  │  │
    │  │  │  │  └──────────────────────────┘  │  │  │  │
    │  │  │  └────────────────────────────────┘  │  │  │
    │  │  │                                       │  │  │
    │  │  │  Aggregate year losses               │  │  │
    │  │  └──────────────────────────────────────┘  │  │
    │  │                                             │  │
    │  │  Store iteration results                   │  │
    │  └────────────────────────────────────────────┘  │
    │                                                   │
    │  Calculate statistics:                           │
    │  - Average Annual Loss (AAL)                     │
    │  - Standard Deviation                            │
    │  - Value at Risk (VaR)                           │
    │  - Tail Value at Risk (TVaR)                     │
    │  - Probable Maximum Loss (PML)                   │
    └──────────────────────────────────────────────────┘
                    │
                    │ 3. Save results
                    ▼
    ┌──────────────────────────────────────────────────┐
    │  Store in MongoDB (Transaction):                │
    │  - Create SimulationRun record                   │
    │  - Create SimulationEvent records (bulk insert)  │
    │  - Update relationships                          │
    └──────────────────────────────────────────────────┘
                    │
                    │ 4. Return result
                    ▼
    ┌──────────────────────────────────────────────────┐
    │  Return simulationId and summary statistics      │
    └──────────────────────────────────────────────────┘

Phase 4: Response to User
──────────────────────────
    Backend API             Frontend                User
        │                      │                      │
        │ {                    │                      │
        │   simulationId,      │                      │
        │   status: "complete",│                      │
        │   results: {...}     │                      │
        │ }                    │                      │
        ├─────────────────────▶│                      │
        │                      │                      │
        │                      │ Display results      │
        │                      │ Show charts/tables   │
        │                      ├─────────────────────▶│
        │                      │                      │
```

---

## 4. Service Layer Architecture

### Service Dependency Graph

```
┌────────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                             │
└────────────────────────────────────────────────────────────────┘

                    ┌───────────────────────┐
                    │   BaseService         │
                    │   (Abstract)          │
                    │                       │
                    │ - create()            │
                    │ - findById()          │
                    │ - update()            │
                    │ - delete()            │
                    │ - withTransaction()   │
                    └───────────┬───────────┘
                                │
                                │ extends
                ┌───────────────┴───────────────┐
                │                               │
                ▼                               ▼
    ┌─────────────────────┐         ┌─────────────────────┐
    │  AccountService     │         │  HazardService      │
    │                     │         │                     │
    │ - getHierarchy()    │         │ - findByType()      │
    │ - getTotalExposure()│         │ - getFootprint()    │
    └─────────────────────┘         └─────────────────────┘
                ▲                               ▲
                │                               │
                │                               │
                └───────────┬───────────────────┘
                            │ uses
                            │
                ┌───────────▼───────────┐
                │  IntegrationService   │
                │  (Orchestrator)       │
                │                       │
                │ - getSimulationData() │
                │ - validateRefs()      │
                │ - aggregateResults()  │
                └───────────┬───────────┘
                            │
                            │ injects into
                            ▼
            ┌───────────────────────────────┐
            │   CATSimulationEngine         │
            │   (1765 lines)                │
            │                               │
            │ Constructor dependencies:     │
            │ ┌───────────────────────────┐ │
            │ │ integrationService        │ │
            │ │ financialService          │ │
            │ │ probabilityService        │ │
            │ │ config                    │ │
            │ └───────────────────────────┘ │
            │                               │
            │ Main methods:                 │
            │ - runSimulation()             │
            │ - generateYearlyEvents()      │
            │ - calculateEventImpact()      │
            │ - aggregateResults()          │
            └───────────┬───────────────────┘
                        │ uses
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌───────────────┐ ┌──────────────┐ ┌─────────────────┐
│ Financial     │ │ Probability  │ │ Exposure        │
│ Calculation   │ │ Distribution │ │ Service         │
│ Service       │ │ Service      │ │                 │
│               │ │              │ │ - findByPolicy()│
│ - calcLoss()  │ │ - poisson()  │ │ - aggregate()   │
│ - applyDed()  │ │ - lognormal()│ │                 │
│ - applyLim()  │ │ - weibull()  │ │                 │
└───────────────┘ └──────────────┘ └─────────────────┘
```

---

## 5. Authentication Flow

### JWT Authentication Sequence

```
┌────────┐                                         ┌────────┐
│ Client │                                         │ Server │
└────┬───┘                                         └───┬────┘
     │                                                 │
     │ 1. POST /api/v1/auth/login                     │
     │    { username, password }                      │
     ├────────────────────────────────────────────────▶│
     │                                                 │
     │                                     ┌───────────▼──────────┐
     │                                     │ Validate credentials │
     │                                     │ - Find user by name  │
     │                                     │ - bcrypt.compare()   │
     │                                     └───────────┬──────────┘
     │                                                 │
     │                                     ┌───────────▼──────────┐
     │                                     │ Generate JWT token   │
     │                                     │ - Sign with secret   │
     │                                     │ - Set expiry: 7 days │
     │                                     └───────────┬──────────┘
     │                                                 │
     │ 2. Response:                                    │
     │◀────────────────────────────────────────────────┤
     │    {                                            │
     │      token: "eyJhbGc...",                       │
     │      expiresIn: "7d",                           │
     │      user: { username, role }                   │
     │    }                                            │
     │                                                 │
┌────▼──────────────────────┐                         │
│ Store token:              │                         │
│ localStorage.setItem()    │                         │
│ Add to Axios headers:     │                         │
│ Authorization: Bearer ... │                         │
└────┬──────────────────────┘                         │
     │                                                 │
     │ 3. Subsequent API calls                         │
     │    GET /api/v1/simulations                      │
     │    Headers: { Authorization: "Bearer ..." }     │
     ├────────────────────────────────────────────────▶│
     │                                                 │
     │                                     ┌───────────▼──────────┐
     │                                     │ Authenticate         │
     │                                     │ Middleware           │
     │                                     │ - Extract token      │
     │                                     │ - Verify signature   │
     │                                     │ - Check expiry       │
     │                                     │ - Attach user to req │
     │                                     └───────────┬──────────┘
     │                                                 │
     │                                                 │ ✅ Valid
     │                                                 ▼
     │                                     ┌─────────────────────┐
     │                                     │ Process request     │
     │                                     │ - Check permissions │
     │                                     │ - Execute logic     │
     │                                     └───────────┬─────────┘
     │                                                 │
     │ 4. Response with data                           │
     │◀────────────────────────────────────────────────┤
     │                                                 │
     │ If token expired or invalid:                    │
     │◀────────────────────────────────────────────────┤
     │    { error: "Unauthorized", status: 401 }       │
     │                                                 │
┌────▼──────────────────────┐                         │
│ Redirect to login         │                         │
│ Clear stored token        │                         │
└───────────────────────────┘                         │
```

---

## 6. Frontend Component Tree

### React Component Hierarchy

```
App.tsx (Root)
│
├─ AuthContext.Provider
│  │
│  ├─ Router
│  │  │
│  │  ├─ PrivateRoute
│  │  │  │
│  │  │  ├─ Layout
│  │  │  │  │
│  │  │  │  ├─ Navigation
│  │  │  │  │  ├─ Logo
│  │  │  │  │  ├─ Menu Items
│  │  │  │  │  │  ├─ Dashboard
│  │  │  │  │  │  ├─ Accounts
│  │  │  │  │  │  ├─ Hazards
│  │  │  │  │  │  ├─ Vulnerabilities
│  │  │  │  │  │  ├─ ❌ Simulations (MISSING!)
│  │  │  │  │  │  └─ Settings
│  │  │  │  │  └─ User Menu
│  │  │  │  │
│  │  │  │  └─ Main Content
│  │  │  │     │
│  │  │  │     ├─ Dashboard Page
│  │  │  │     │  ├─ StatCard
│  │  │  │     │  ├─ Chart
│  │  │  │     │  └─ RecentActivity
│  │  │  │     │
│  │  │  │     ├─ Accounts Page
│  │  │  │     │  ├─ AccountList
│  │  │  │     │  ├─ AccountForm
│  │  │  │     │  └─ AccountDetails
│  │  │  │     │
│  │  │  │     ├─ Simulations Page
│  │  │  │     │  ├─ SimulationList
│  │  │  │     │  │  └─ SimulationCard
│  │  │  │     │  ├─ ❌ Start Button (MISSING!)
│  │  │  │     │  └─ SimulationForm (Modal)
│  │  │  │     │     ├─ ❌ Doesn't render! (BUG)
│  │  │  │     │     ├─ ConfigSection
│  │  │  │     │     ├─ ParametersSection
│  │  │  │     │     └─ SubmitButton
│  │  │  │     │
│  │  │  │     ├─ Hazards Page
│  │  │  │     │  ├─ HazardList
│  │  │  │     │  ├─ HazardForm
│  │  │  │     │  └─ HazardMap
│  │  │  │     │
│  │  │  │     └─ ... other pages
│  │  │  │
│  │  │  └─ Footer
│  │  │
│  │  └─ Public Routes
│  │     │
│  │     ├─ Login Page
│  │     │  ├─ LoginForm
│  │     │  │  ├─ TextField (username)
│  │     │  │  ├─ TextField (password)
│  │     │  │  └─ Button (login)
│  │     │  └─ DemoCredentials Display
│  │     │     ├─ ❌ Shows: riskmanager/RiskManager2025!
│  │     │     ├─ ❌ Shows: analyst/DataAnalyst2025!
│  │     │     └─ Shows: viewer/Viewer2025!
│  │     │
│  │     └─ NotFound Page
│  │
│  └─ Redux Store
│     ├─ Auth Slice
│     ├─ Simulation Slice
│     └─ Data Slice
```

---

## 7. API Endpoint Map

### Complete API Route Structure

```
/api/v1
│
├─ /auth
│  ├─ POST   /login              # Authenticate user, get JWT
│  ├─ POST   /register           # Register new user
│  └─ POST   /logout             # Logout (invalidate token)
│
├─ /accounts
│  ├─ GET    /                   # List all accounts (paginated)
│  ├─ POST   /                   # Create new account
│  ├─ GET    /:accountId         # Get account by ID
│  ├─ PUT    /:accountId         # Update account
│  ├─ DELETE /:accountId         # Delete account
│  ├─ GET    /:accountId/children          # Get child accounts
│  ├─ GET    /:accountId/total-exposure    # Calculate total exposure
│  └─ GET    /region/:regionName           # Get accounts by region
│
├─ /policies
│  ├─ GET    /                   # List all policies
│  ├─ POST   /                   # Create new policy
│  ├─ GET    /:policyId          # Get policy by ID
│  ├─ PUT    /:policyId          # Update policy
│  ├─ DELETE /:policyId          # Delete policy
│  └─ GET    /account/:accountId # Get policies for account
│
├─ /exposures
│  ├─ GET    /                   # List all exposures
│  ├─ POST   /                   # Create new exposure
│  ├─ GET    /:exposureId        # Get exposure by ID
│  ├─ PUT    /:exposureId        # Update exposure
│  ├─ DELETE /:exposureId        # Delete exposure
│  ├─ GET    /policy/:policyId   # Get exposures for policy
│  └─ GET    /location/:locationId # Get exposures at location
│
├─ /locations
│  ├─ GET    /                   # List all locations
│  ├─ POST   /                   # Create new location
│  ├─ GET    /:locationId        # Get location by ID
│  ├─ PUT    /:locationId        # Update location
│  ├─ DELETE /:locationId        # Delete location
│  └─ GET    /nearby             # Find locations near coordinates
│
├─ /hazards
│  ├─ GET    /                   # List all hazards
│  ├─ POST   /                   # Create new hazard
│  ├─ GET    /:hazardId          # Get hazard by ID
│  ├─ PUT    /:hazardId          # Update hazard
│  ├─ DELETE /:hazardId          # Delete hazard
│  └─ GET    /type/:hazardType   # Get hazards by type
│
├─ /vulnerabilities
│  ├─ GET    /                   # List all vulnerabilities
│  ├─ POST   /                   # Create new vulnerability
│  ├─ GET    /:vulnerabilityId   # Get vulnerability by ID
│  ├─ PUT    /:vulnerabilityId   # Update vulnerability
│  ├─ DELETE /:vulnerabilityId   # Delete vulnerability
│  └─ GET    /asset/:assetType   # Get vulnerabilities for asset type
│
├─ /simulations
│  ├─ GET    /                   # List all simulations
│  ├─ POST   /                   # ✅ Create and run simulation (WORKS!)
│  ├─ GET    /:simulationId      # Get simulation by ID
│  ├─ GET    /:simulationId/results # Get simulation results
│  ├─ GET    /:simulationId/events  # Get simulation events
│  └─ DELETE /:simulationId      # Delete simulation
│
├─ /integration
│  ├─ GET    /validation         # Validate data integrity
│  ├─ POST   /aggregate          # Aggregate data across models
│  └─ GET    /statistics         # Get system statistics
│
└─ /health                       # Health check endpoint
   └─ GET    /                   # Returns server status
```

---

## 8. Testing Architecture

### Test Organization Hierarchy

```
tests/
│
├─ setup.js                      # Global test setup
├─ global-setup.js               # Jest global setup
├─ test-utils.js                 # Shared test utilities
└─ test-environment.js           # Custom test environment

Backend Tests (85% coverage)
│
├─ models/                       # Model validation tests
│  ├─ Account.test.js            # Account schema tests
│  ├─ Policy.test.js             # Policy schema tests
│  ├─ Exposure.test.js           # Exposure schema tests
│  ├─ Location.test.js           # Location schema tests
│  ├─ Hazard.test.js             # Hazard schema tests
│  ├─ Vulnerability.test.js      # Vulnerability schema tests
│  └─ User.test.js               # User authentication tests
│
├─ controllers/                  # Controller tests
│  ├─ accountController.test.js  # Account endpoints
│  ├─ policyController.test.js   # Policy endpoints
│  └─ ... (other controllers)
│
├─ services/                     # Service layer tests
│  ├─ BaseService.test.js        # Base service functionality
│  ├─ CATSimulationEngine.test.js # Simulation engine
│  ├─ FinancialCalculation.test.js # Financial calculations
│  └─ ... (other services)
│
├─ integration/                  # Integration tests
│  ├─ integrationService.test.js # Cross-service integration
│  └─ services/
│     └─ ServiceIntegration.test.js
│
├─ backend/                      # API tests
│  ├─ api.test.js                # API endpoint tests
│  └─ crud.test.js               # CRUD operation tests
│
├─ framework/                    # Framework tests
│  ├─ ErrorHandler.test.js       # Error handling
│  ├─ CustomErrors.test.js       # Custom error classes
│  ├─ ValidationFramework.test.js # Validation
│  └─ PerformanceOptimization.test.js
│
└─ seed-validation-comprehensive.test.js # 45+ validation tests

Frontend Tests (15% coverage - NEEDS IMPROVEMENT)
│
└─ ui/                           # UI/E2E tests
   ├─ selenium.test.js           # Selenium WebDriver
   │  └─ ❌ Fails due to frontend bugs
   └─ puppeteer.test.js          # Puppeteer headless
      └─ ❌ Fails due to frontend bugs

Standalone Test Scripts
│
├─ test-api-integration.js       # Direct API testing
├─ test-simulation-journey.js    # E2E simulation workflow
├─ test-simulation-create.js     # Simulation creation
├─ verify-data.js                # Data verification
└─ check-required-fields.js      # Schema discovery
```

### Test Execution Flow

```
Developer runs: npm test
         │
         ▼
    Jest Runner
         │
         ├─────────────────────────────────────┐
         │                                     │
         ▼                                     ▼
   Unit Tests                          Integration Tests
         │                                     │
         ├─ Models                             ├─ Service Integration
         ├─ Services                           ├─ Controller-Service
         └─ Utils                              └─ API Endpoints
         │                                     │
         ▼                                     ▼
   MongoDB Memory Server              Real MongoDB (optional)
         │                                     │
         └─────────────────┬───────────────────┘
                           │
                           ▼
                    Generate Coverage Report
                           │
                           ▼
                    Display Results
                     - Passed: 125+
                     - Failed: 0
                     - Coverage: 85% backend

E2E Tests (separate execution)
         │
         ▼
   Selenium/Puppeteer
         │
         ├─ Launch Chrome
         ├─ Navigate to app
         ├─ ❌ Login fails (credentials mismatch)
         ├─ ❌ Simulation UI missing
         └─ Generate report with screenshots
```

---

## Conclusion

These visual diagrams provide a comprehensive overview of the CAT Modeling Application's architecture, data models, workflows, and testing infrastructure. Key takeaways:

1. **Well-Architected Backend:** Clean three-tier architecture with proper separation of concerns
2. **Complex Data Model:** 14 models with well-defined relationships
3. **Sophisticated Simulation Engine:** 1,765-line Monte Carlo simulation with multiple dependencies
4. **Strong Testing Foundation:** 125+ tests with 85% backend coverage
5. **Frontend Integration Gaps:** Critical UI components missing or non-functional

**Next Steps:**
- Use these diagrams to understand system architecture
- Reference data model relationships when working with database
- Follow simulation workflow to understand processing logic
- Use service dependency graph for debugging and enhancements

---

**Document Generated:** January 2, 2026  
**For:** Codebase understanding and architecture reference  
**Related Docs:** CODEBASE_ANALYSIS.md, CURRENT_STATE_SUMMARY.md
