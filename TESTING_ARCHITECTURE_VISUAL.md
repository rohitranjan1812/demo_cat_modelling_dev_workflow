# Testing Architecture Visualization
**Companion to:** Comprehensive Testing Blueprint & Test Implementation Guide  
**Date:** October 10, 2025  
**Version:** 1.0

---

## Test Hierarchy Pyramid

```
                    /\
                   /  \
                  / E2E \              < 10-20 tests
                 /--------\             Focus: User workflows
                /  System  \            Duration: 5-10 min
               /------------\           Coverage: Critical paths
              /  Integration \          < 50-100 tests
             /----------------\         Focus: Component interaction
            /   Unit Tests      \       Duration: 2-5 min
           /----------------------\     Coverage: >80%
          /    Foundation Layer    \   < 200-500 tests
         /--------------------------\  Focus: Individual units
                                       Duration: <2 min
                                       Coverage: >90%
```

---

## Application Architecture & Test Mapping

```
┌──────────────────────────────────────────────────────────────┐
│                        Frontend UI                            │
│  ┌────────────┬────────────┬────────────┬────────────┐      │
│  │ Dashboard  │  Hazards   │Simulations │ Accounts   │      │
│  └─────┬──────┴──────┬─────┴──────┬─────┴──────┬─────┘      │
│        │             │            │            │             │
│        └─────────────┴────────────┴────────────┘             │
│                       │                                       │
│                  UI System Tests                              │
│                  tests/system/ui/                             │
└───────────────────────┼───────────────────────────────────────┘
                        │
                   HTTP/REST
                        │
┌───────────────────────┼───────────────────────────────────────┐
│                  Express App                                   │
│  ┌────────────────────┼────────────────────────────┐          │
│  │              Routes Layer                       │          │
│  │  /accounts  /hazards  /simulations  /integration          │
│  │       │          │           │             │              │
│  │  API Integration Tests                                    │
│  │  tests/integration/api/                                   │
│  └───────┼──────────┼───────────┼─────────────┼─────────────┘
│          │          │           │             │               │
│  ┌───────┼──────────┼───────────┼─────────────┼─────────────┐
│  │  Controller Layer                                         │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │
│  │  │ Account  │ │ Hazard   │ │Simulation│ │Integration │  │
│  │  │Controller│ │Controller│ │Controller│ │Controller  │  │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └─────┬──────┘  │
│  │       │            │            │             │          │
│  │  Controller Integration Tests                            │
│  │  tests/integration/controllers/                          │
│  └───────┼────────────┼────────────┼─────────────┼──────────┘
│          │            │            │             │           │
│  ┌───────┼────────────┼────────────┼─────────────┼──────────┐
│  │  Service Layer                                            │
│  │  ┌──────────┐ ┌──────────┐ ┌────────────┐ ┌──────────┐  │
│  │  │ Account  │ │ Hazard   │ │ Simulation │ │Financial │  │
│  │  │ Service  │ │ Service  │ │ Service    │ │ Service  │  │
│  │  └────┬─────┘ └────┬─────┘ └─────┬──────┘ └────┬─────┘  │
│  │       │            │             │              │        │
│  │  Service Unit Tests & Integration                        │
│  │  tests/unit/services/ & tests/integration/services/      │
│  └───────┼────────────┼─────────────┼──────────────┼────────┘
│          │            │             │              │         │
│  ┌───────┼────────────┼─────────────┼──────────────┼────────┐
│  │  Data Layer                                               │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │
│  │  │ Account  │ │ Hazard   │ │Simulation│ │Vulnerability│ │
│  │  │ Model    │ │ Model    │ │ Model    │ │ Model      │  │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └─────┬──────┘  │
│  │       │            │            │             │          │
│  │  Model Unit Tests                                        │
│  │  tests/unit/models/                                      │
│  └───────┼────────────┼────────────┼─────────────┼──────────┘
│          │            │            │             │           │
└──────────┼────────────┼────────────┼─────────────┼───────────┘
           │            │            │             │
      ┌────┴────────────┴────────────┴─────────────┴───┐
      │                MongoDB                           │
      │  Database Integration Tests                     │
      │  tests/integration/database/                    │
      └─────────────────────────────────────────────────┘
```

---

## Test Execution Flow

```
┌─────────────────────────────────────────────────────────────┐
│  Developer Commits Code                                      │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  GitHub Actions Triggered                                    │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  Stage 1: Unit Tests (Fast - 2 min)                         │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  ✓ Model tests                                       │    │
│  │  ✓ Service tests (isolated)                         │    │
│  │  ✓ Utility tests                                     │    │
│  │  ✓ Middleware tests                                  │    │
│  └─────────────────────────────────────────────────────┘    │
│  Fail? → Stop pipeline, notify developer                     │
└────────────────┬────────────────────────────────────────────┘
                 │ Pass ✓
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  Stage 2: Integration Tests (Medium - 5 min)                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  ✓ Controller-Service integration                   │    │
│  │  ✓ Service-Model integration                        │    │
│  │  ✓ Database integration                             │    │
│  │  ✓ API endpoint tests                               │    │
│  └─────────────────────────────────────────────────────┘    │
│  Fail? → Stop pipeline, notify developer                     │
└────────────────┬────────────────────────────────────────────┘
                 │ Pass ✓
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  Stage 3: System Tests (Slow - 10 min)                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  ✓ End-to-end workflows                             │    │
│  │  ✓ Full API system tests                            │    │
│  │  ✓ UI component tests                               │    │
│  │  ✓ Cross-module integration                         │    │
│  └─────────────────────────────────────────────────────┘    │
│  Fail? → Stop pipeline, notify developer                     │
└────────────────┬────────────────────────────────────────────┘
                 │ Pass ✓
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  Stage 4: Coverage & Quality Gates                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  ✓ Coverage > 80%                                   │    │
│  │  ✓ No critical security issues                      │    │
│  │  ✓ Code quality metrics met                         │    │
│  │  ✓ Performance benchmarks passed                    │    │
│  └─────────────────────────────────────────────────────┘    │
│  Fail? → Stop pipeline, notify developer                     │
└────────────────┬────────────────────────────────────────────┘
                 │ Pass ✓
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  Deploy to Staging / Merge PR                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Test Data Flow

```
Test Setup Phase:
┌──────────────┐
│ Test Begins  │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Global Setup (once per run)          │
│  • Start in-memory MongoDB           │
│  • Load environment config            │
│  • Initialize shared resources        │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Suite Setup (per describe block)     │
│  • Connect to test database          │
│  • Load test fixtures                │
│  • Initialize suite-specific data    │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Test Setup (before each test)        │
│  • Clear database collections        │
│  • Generate mock data                │
│  • Set up test-specific state        │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Run Test                              │
│  • Arrange: Prepare data              │
│  • Act: Execute function/API call     │
│  • Assert: Verify results             │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Test Cleanup (after each test)       │
│  • Clean up test-specific data       │
│  • Reset mocks and spies              │
│  • Release resources                  │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Suite Cleanup (after all tests)      │
│  • Disconnect from database          │
│  • Clean up suite-specific resources │
│  • Generate test reports              │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Global Cleanup (once per run)        │
│  • Stop in-memory MongoDB            │
│  • Generate coverage reports          │
│  • Archive test artifacts             │
└──────────────────────────────────────┘
```

---

## Test Dependencies Map

```
Level 0: Foundation (No dependencies)
├─ jest.config.js
├─ tests/setup.js
├─ tests/global-setup.js
├─ tests/global-teardown.js
├─ tests/helpers/test-utils.js
└─ tests/helpers/mock-generators.js
       │
       │ Required by ↓
       │
Level 1: Model Unit Tests (Depends on: Foundation)
├─ tests/unit/models/Account.test.js
├─ tests/unit/models/Policy.test.js
├─ tests/unit/models/Location.test.js
├─ tests/unit/models/Hazard.test.js
├─ tests/unit/models/Vulnerability.test.js
└─ tests/unit/models/SimulationRun.test.js
       │
       │ Required by ↓
       │
Level 2: Service Unit Tests (Depends on: Foundation + Models)
├─ tests/unit/services/ProbabilityDistributionService.test.js
├─ tests/unit/services/FinancialCalculationService.test.js
├─ tests/unit/services/AccountService.test.js
├─ tests/unit/services/HazardService.test.js
├─ tests/unit/services/VulnerabilityService.test.js
└─ tests/unit/services/SimulationService.test.js
       │
       │ Required by ↓
       │
Level 3: Controller Tests (Depends on: Foundation + Models + Services)
├─ tests/integration/controllers/accountController.test.js
├─ tests/integration/controllers/hazardController.test.js
├─ tests/integration/controllers/vulnerabilityController.test.js
├─ tests/integration/controllers/simulationController.test.js
└─ tests/integration/controllers/integrationController.test.js
       │
       │ Required by ↓
       │
Level 4: API Integration (Depends on: All previous levels)
├─ tests/integration/api/accounts-api.test.js
├─ tests/integration/api/hazards-api.test.js
├─ tests/integration/api/vulnerabilities-api.test.js
├─ tests/integration/api/simulations-api.test.js
└─ tests/integration/api/integration-api.test.js
       │
       │ Required by ↓
       │
Level 5: System & E2E (Depends on: All previous levels + UI)
├─ tests/system/e2e/simulation-workflow.test.js
├─ tests/system/e2e/risk-assessment-workflow.test.js
├─ tests/system/e2e/portfolio-management-workflow.test.js
└─ tests/system/ui/*.test.js
       │
       │ Informs ↓
       │
Level 6: Performance & Security (Depends on: System tests)
├─ tests/performance/load-tests.test.js
├─ tests/performance/stress-tests.test.js
├─ tests/security/auth-tests.test.js
└─ tests/security/vulnerability-scan.test.js
```

---

## Coverage Tracking Flow

```
Source Code                     Test Files
┌──────────────┐               ┌──────────────┐
│ src/models/  │◄──────────────┤ tests/unit/  │
│ Account.js   │   covers       │ models/      │
└──────┬───────┘               └──────────────┘
       │                              │
       │ used by                      │ tests
       ▼                              ▼
┌──────────────┐               ┌──────────────┐
│ src/services/│◄──────────────┤ tests/unit/  │
│ AccountSvc.js│   covers       │ services/    │
└──────┬───────┘               └──────────────┘
       │                              │
       │ used by                      │ tests
       ▼                              ▼
┌──────────────┐               ┌───────────────┐
│src/controllers◄──────────────┤tests/integration
│ AccountCtrl  │   covers       │ /controllers/ │
└──────┬───────┘               └───────────────┘
       │                              │
       │ exposed via                  │ tests
       ▼                              ▼
┌──────────────┐               ┌───────────────┐
│ src/routes/  │◄──────────────┤tests/integration
│ accounts.js  │   covers       │ /api/         │
└──────────────┘               └───────────────┘
       │
       │ Aggregated by
       ▼
┌─────────────────────────────────────────┐
│      Jest Coverage Report                │
│  ┌─────────────────────────────────┐   │
│  │ Lines:   85.5% ( 1024 / 1197 )  │   │
│  │ Functions: 83.2% ( 234 / 281 )  │   │
│  │ Branches:  78.9% ( 456 / 578 )  │   │
│  │ Statements: 85.1% ( 1015 / 1192 )│  │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## Test File Organization

```
demo_cat_modelling_dev_workflow/
│
├── src/                                    # Source code
│   ├── models/                             # Data models
│   ├── services/                           # Business logic
│   ├── controllers/                        # Request handlers
│   ├── routes/                             # API routes
│   ├── middleware/                         # Middleware
│   └── utils/                              # Utilities
│
├── tests/                                  # All tests
│   │
│   ├── unit/                               # Unit tests
│   │   ├── models/                         # Model unit tests
│   │   │   ├── Account.test.js            # ✓ Tests Account model
│   │   │   ├── Policy.test.js             # ✓ Tests Policy model
│   │   │   ├── Location.test.js           # ✓ Tests Location model
│   │   │   ├── Hazard.test.js             # ✓ Tests Hazard model
│   │   │   ├── Vulnerability.test.js      # ✓ Tests Vulnerability model
│   │   │   └── SimulationRun.test.js      # ✓ Tests SimulationRun model
│   │   │
│   │   ├── services/                       # Service unit tests
│   │   │   ├── AccountService.test.js
│   │   │   ├── HazardService.test.js
│   │   │   ├── VulnerabilityService.test.js
│   │   │   ├── SimulationService.test.js
│   │   │   ├── FinancialCalculationService.test.js
│   │   │   ├── ProbabilityDistributionService.test.js
│   │   │   └── IntegrationService.test.js
│   │   │
│   │   ├── utilities/                      # Utility unit tests
│   │   │   ├── validation.test.js
│   │   │   ├── calculations.test.js
│   │   │   └── formatters.test.js
│   │   │
│   │   └── middleware/                     # Middleware unit tests
│   │       ├── auth.test.js
│   │       ├── validation.test.js
│   │       └── errorHandler.test.js
│   │
│   ├── integration/                        # Integration tests
│   │   ├── controllers/                    # Controller integration
│   │   │   ├── accountController.test.js
│   │   │   ├── hazardController.test.js
│   │   │   ├── vulnerabilityController.test.js
│   │   │   ├── simulationController.test.js
│   │   │   └── integrationController.test.js
│   │   │
│   │   ├── services/                       # Service integration
│   │   │   ├── simulation-integration.test.js
│   │   │   ├── cross-service.test.js
│   │   │   └── database-integration.test.js
│   │   │
│   │   └── api/                            # API integration
│   │       ├── accounts-api.test.js
│   │       ├── hazards-api.test.js
│   │       ├── vulnerabilities-api.test.js
│   │       ├── simulations-api.test.js
│   │       └── integration-api.test.js
│   │
│   ├── system/                             # System tests
│   │   ├── e2e/                            # End-to-end tests
│   │   │   ├── simulation-workflow.test.js
│   │   │   ├── risk-assessment-workflow.test.js
│   │   │   └── portfolio-management-workflow.test.js
│   │   │
│   │   ├── api-system/                     # API system tests
│   │   │   ├── full-crud-workflows.test.js
│   │   │   ├── complex-queries.test.js
│   │   │   └── error-scenarios.test.js
│   │   │
│   │   └── ui/                             # UI system tests
│   │       ├── dashboard.test.js
│   │       ├── hazards-page.test.js
│   │       ├── simulations-page.test.js
│   │       └── navigation.test.js
│   │
│   ├── performance/                        # Performance tests
│   │   ├── load-tests/
│   │   │   ├── api-load.test.js
│   │   │   └── simulation-load.test.js
│   │   └── stress-tests/
│   │       └── maximum-load.test.js
│   │
│   ├── security/                           # Security tests
│   │   ├── authentication.test.js
│   │   ├── authorization.test.js
│   │   └── vulnerability-scan.test.js
│   │
│   ├── fixtures/                           # Test data fixtures
│   │   ├── accounts.json
│   │   ├── hazards.json
│   │   ├── vulnerabilities.json
│   │   └── simulations.json
│   │
│   ├── helpers/                            # Test helpers
│   │   ├── test-utils.js                  # Test utilities
│   │   ├── mock-generators.js             # Mock data generators
│   │   ├── database-setup.js              # DB setup helpers
│   │   └── api-helpers.js                 # API test helpers
│   │
│   ├── setup.js                           # Jest setup
│   ├── global-setup.js                    # Global setup
│   └── global-teardown.js                 # Global teardown
│
├── coverage/                              # Coverage reports
├── jest.config.js                         # Jest configuration
└── package.json                           # NPM scripts
```

---

## Mock vs Real Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    Test Type Matrix                          │
├──────────────┬──────────────┬──────────────┬────────────────┤
│ Test Level   │ Data Source  │ Dependencies │ Isolation      │
├──────────────┼──────────────┼──────────────┼────────────────┤
│ Unit Tests   │ Mock/Fake    │ All mocked   │ 100% isolated  │
│              │ data objects │              │                │
│              │              │              │                │
│ Service      │ Mock Models  │ Models       │ Service        │
│ Unit Tests   │ (Jest mocks) │ mocked       │ isolated       │
│              │              │              │                │
│ Controller   │ Real Models  │ Services     │ Controller +   │
│ Integration  │ Test DB      │ mocked       │ Routes only    │
│              │              │              │                │
│ API          │ Real Models  │ Full stack   │ API layer      │
│ Integration  │ Test DB      │ except UI    │ integrated     │
│              │              │              │                │
│ E2E Tests    │ Real Data    │ Full app     │ Full system    │
│              │ Test DB      │ including UI │ integration    │
│              │              │              │                │
│ Performance  │ Real/Large   │ Full app     │ Full system    │
│ Tests        │ datasets     │ prod-like    │ under load     │
└──────────────┴──────────────┴──────────────┴────────────────┘

Example Data Sources by Test Type:

Unit Test:
const mockAccount = { 
  accountId: 'MOCK-001', 
  accountName: 'Mock Account' 
};

Integration Test:
const testAccount = await TestUtils.generateMockData('account');
await Account.create(testAccount);

E2E Test:
const realAccount = await request(app)
  .post('/api/v1/accounts')
  .send(accountData);
```

---

## Continuous Testing Feedback Loop

```
Developer Workflow:
┌──────────────────┐
│ 1. Write Test    │──────┐
│    (RED)         │      │
└──────────────────┘      │
                          │
                          ▼
┌──────────────────┐   ┌──────────────────┐
│ 3. Refactor      │◄──┤ 2. Write Code    │
│    (CLEAN)       │   │    (GREEN)       │
└──────────────────┘   └──────────────────┘
         │
         │ Commit
         ▼
┌──────────────────┐
│ Run Local Tests  │
│ (npm test)       │
└────────┬─────────┘
         │
         │ Pass ✓
         ▼
┌──────────────────┐
│ Push to GitHub   │
└────────┬─────────┘
         │
         │ Trigger CI
         ▼
┌──────────────────┐
│ CI Runs All      │
│ Tests            │
└────────┬─────────┘
         │
         ├─ Pass ✓ ───────┐
         │                 │
         └─ Fail ✗        │
              │            │
              ▼            ▼
    ┌──────────────┐  ┌──────────────┐
    │ Notify Dev   │  │ Merge/Deploy │
    │ Fix Issues   │  └──────────────┘
    └──────────────┘
```

---

## Coverage Heatmap (Target State)

```
Component Coverage Map:
┌───────────────────────────────────────────────────────┐
│ Models               ████████████████████ 95%         │
│ Services             ██████████████████   88%         │
│ Controllers          █████████████████    82%         │
│ Routes               █████████████        75%         │
│ Middleware           ███████████████████  87%         │
│ Utilities            ████████████████████ 93%         │
│ Integration          ███████████████      72%         │
│                                                        │
│ Overall              ██████████████████   85%         │
└───────────────────────────────────────────────────────┘

Legend:
████████████████████ >90% (Excellent)
█████████████████    80-90% (Good)
███████████          70-80% (Acceptable)
████████             60-70% (Needs Improvement)
████                 <60% (Critical)
```

---

## Quick Reference: Test Commands

```bash
# Run all tests
npm test

# Run specific test levels
npm run test:unit              # Unit tests only
npm run test:integration       # Integration tests only
npm run test:system            # System tests only
npm run test:e2e               # E2E tests only

# Watch mode (for development)
npm run test:watch

# Coverage
npm run test:coverage          # Generate coverage report

# Specific test files
npx jest tests/unit/models/Account.test.js
npx jest tests/integration/controllers/
npx jest --testNamePattern="should create account"

# Debug tests
node --inspect-brk node_modules/.bin/jest --runInBand

# CI mode
npm run test:ci                # Optimized for CI/CD
```

---

## Success Metrics Dashboard (Goal State)

```
┌─────────────────────────────────────────────────────────────┐
│                   Testing Metrics Dashboard                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Code Coverage:          85.2% ████████████████████         │
│  Test Pass Rate:         99.8% ███████████████████████      │
│  Test Execution Time:     15m  ████████████████             │
│  Flakiness Rate:         0.5%  █                            │
│                                                              │
│  Tests by Level:                                            │
│    Unit:                 423   ████████████████████████████ │
│    Integration:          87    ██████████                   │
│    System:               34    ████                         │
│    E2E:                  12    ██                           │
│                                                              │
│  Recent Trends (7 days):                                    │
│    New Tests Added:      +15   ↗                            │
│    Coverage Change:      +2.3% ↗                            │
│    Avg Runtime:          -45s  ↘                            │
│    Failures:             -3    ↘                            │
│                                                              │
│  Quality Gates:                                             │
│    ✓ Coverage > 80%                                         │
│    ✓ Pass rate > 99%                                        │
│    ✓ Flakiness < 1%                                         │
│    ✓ Runtime < 30 min                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

**Document Version:** 1.0  
**Last Updated:** October 10, 2025  
**Status:** Visual Reference Guide
