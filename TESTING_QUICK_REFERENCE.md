# Testing Quick Reference & Checklist
**For Developers:** Quick reference for day-to-day testing activities  
**Date:** October 10, 2025  
**Version:** 1.0

---

## 🚀 Quick Start

### Before Writing Any Code
```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies
npm install

# 3. Run existing tests to ensure baseline
npm test

# 4. Check test coverage
npm run test:coverage
```

---

## ✅ Test-Driven Development Checklist

### For Each New Feature

- [ ] **Step 1: Write the Test First (RED)**
  - [ ] Identify what you're testing
  - [ ] Write a failing test
  - [ ] Run test to confirm it fails: `npm test -- path/to/test.js`

- [ ] **Step 2: Write Minimal Code (GREEN)**
  - [ ] Write just enough code to pass the test
  - [ ] Run test to confirm it passes
  - [ ] Don't optimize yet

- [ ] **Step 3: Refactor (CLEAN)**
  - [ ] Clean up the code
  - [ ] Run tests to ensure still passing
  - [ ] Check coverage: `npm run test:coverage`

- [ ] **Step 4: Commit**
  - [ ] Stage changes: `git add .`
  - [ ] Commit with clear message: `git commit -m "feat: add feature X with tests"`
  - [ ] Push: `git push`

---

## 📝 What to Test: Decision Tree

```
Are you working on...

├─ A Model (src/models/)?
│  └─ Write: Unit tests in tests/unit/models/
│     ├─ Schema validation
│     ├─ Instance methods
│     ├─ Static methods
│     └─ Relationships
│
├─ A Service (src/services/)?
│  └─ Write: Unit tests in tests/unit/services/
│     ├─ Business logic methods
│     ├─ Calculations
│     ├─ Error handling
│     └─ Integration tests in tests/integration/services/
│
├─ A Controller (src/controllers/)?
│  └─ Write: Integration tests in tests/integration/controllers/
│     ├─ Request handling
│     ├─ Response formatting
│     ├─ Error responses
│     └─ Validation
│
├─ An API Route (src/routes/)?
│  └─ Write: API integration tests in tests/integration/api/
│     ├─ Full CRUD operations
│     ├─ Query parameters
│     ├─ Authentication
│     └─ Authorization
│
├─ A Utility (src/utils/)?
│  └─ Write: Unit tests in tests/unit/utilities/
│     ├─ Input/output validation
│     ├─ Edge cases
│     └─ Error handling
│
└─ A Complete Workflow?
   └─ Write: E2E tests in tests/system/e2e/
      ├─ User journey
      ├─ Data flow
      └─ System integration
```

---

## 🎯 Test Coverage Goals

| Component | Minimum | Target | Excellent |
|-----------|---------|--------|-----------|
| Models | 85% | 90% | 95% |
| Services | 80% | 85% | 90% |
| Controllers | 75% | 80% | 85% |
| Utilities | 85% | 90% | 95% |
| **Overall** | **80%** | **85%** | **90%** |

### Checking Your Coverage
```bash
# Run tests with coverage
npm run test:coverage

# View HTML report
open coverage/index.html
```

---

## 📋 Test Naming Conventions

### Test File Names
```
Source File                Test File
─────────────────────────────────────────────
src/models/Account.js   →  tests/unit/models/Account.test.js
src/services/Hazard.js  →  tests/unit/services/HazardService.test.js
src/controllers/sim.js  →  tests/integration/controllers/simulationController.test.js
```

### Test Suite Names
```javascript
// ✅ Good
describe('Account Model', () => {});
describe('FinancialCalculationService', () => {});
describe('POST /api/v1/accounts', () => {});

// ❌ Bad
describe('Test', () => {});
describe('My tests', () => {});
describe('Stuff', () => {});
```

### Test Case Names
```javascript
// ✅ Good - Descriptive and specific
it('should create account with valid data', () => {});
it('should throw error when accountId is missing', () => {});
it('should calculate expected loss correctly', () => {});

// ❌ Bad - Vague or unclear
it('works', () => {});
it('test account', () => {});
it('should pass', () => {});
```

---

## 🛠️ Common Test Patterns

### Pattern 1: Model Unit Test
```javascript
const Model = require('../../src/models/ModelName');
const TestUtils = require('../helpers/test-utils');

describe('ModelName Model', () => {
  beforeAll(async () => await TestUtils.connectDatabase());
  afterAll(async () => await TestUtils.disconnectDatabase());
  beforeEach(async () => await TestUtils.clearDatabase());

  it('should create instance with valid data', async () => {
    const data = TestUtils.generateMockData('modelType');
    const instance = await Model.create(data);
    expect(instance).toBeDefined();
  });
});
```

### Pattern 2: Service Unit Test
```javascript
const Service = require('../../src/services/ServiceName');
const Model = require('../../src/models/ModelName');

jest.mock('../../src/models/ModelName');

describe('ServiceName', () => {
  let service;

  beforeEach(() => {
    service = new Service();
    jest.clearAllMocks();
  });

  it('should perform operation', async () => {
    Model.find.mockResolvedValue([{ id: 1 }]);
    const result = await service.method();
    expect(result).toBeDefined();
    expect(Model.find).toHaveBeenCalled();
  });
});
```

### Pattern 3: API Integration Test
```javascript
const request = require('supertest');
const app = require('../../src/app');
const TestUtils = require('../helpers/test-utils');

describe('API: /api/v1/resource', () => {
  beforeAll(async () => await TestUtils.connectDatabase());
  afterAll(async () => await TestUtils.disconnectDatabase());
  beforeEach(async () => await TestUtils.clearDatabase());

  it('should return resource', async () => {
    const response = await request(app)
      .get('/api/v1/resource')
      .expect(200);
    expect(response.body).toBeDefined();
  });
});
```

### Pattern 4: E2E Test
```javascript
const request = require('supertest');
const app = require('../../src/app');
const TestUtils = require('../helpers/test-utils');

describe('E2E: Complete Workflow', () => {
  beforeAll(async () => await TestUtils.connectDatabase());
  afterAll(async () => await TestUtils.disconnectDatabase());
  beforeEach(async () => await TestUtils.clearDatabase());

  it('should complete workflow', async () => {
    // Step 1: Create resource
    const createResponse = await request(app)
      .post('/api/v1/resource')
      .send({ data })
      .expect(201);
    
    // Step 2: Use resource
    const useResponse = await request(app)
      .get(`/api/v1/resource/${createResponse.body.id}`)
      .expect(200);
    
    // Step 3: Verify results
    expect(useResponse.body).toMatchObject({ expected });
  });
});
```

---

## 🔧 Common Test Utilities

### Generate Mock Data
```javascript
const TestUtils = require('./helpers/test-utils');

// Generate single mock object
const account = TestUtils.generateMockData('account');
const hazard = TestUtils.generateMockData('hazard');

// Generate with overrides
const specificAccount = TestUtils.generateMockData('account', {
  region: 'Europe',
  currency: 'EUR'
});

// Create in database
const dbAccount = await TestUtils.createTestData(Account, account);
```

### Clear Database
```javascript
// Clear all collections
await TestUtils.clearDatabase();

// Clear specific model
await Account.deleteMany({});
```

### Wait for Async Operations
```javascript
// Wait for specific time
await TestUtils.wait(1000); // 1 second

// Better: Use fake timers
jest.useFakeTimers();
// ... test code
jest.runAllTimers();
```

---

## 🐛 Debugging Tests

### Run Specific Test
```bash
# Run single file
npx jest tests/unit/models/Account.test.js

# Run tests matching pattern
npx jest --testNamePattern="should create account"

# Run tests in specific directory
npx jest tests/integration/
```

### Debug with Node Inspector
```bash
# Debug specific test
node --inspect-brk node_modules/.bin/jest tests/unit/models/Account.test.js --runInBand

# Then open chrome://inspect in Chrome
```

### Verbose Output
```bash
# Show console.log output
npx jest --verbose

# Show all test names
npx jest --listTests
```

### Common Issues & Solutions

**Issue: Tests hang or timeout**
```javascript
// Solution: Increase timeout
jest.setTimeout(10000); // 10 seconds

// Or for specific test
it('slow test', async () => {
  // test code
}, 10000);
```

**Issue: Database connection errors**
```javascript
// Solution: Check setup/teardown
beforeAll(async () => {
  await TestUtils.connectDatabase();
});

afterAll(async () => {
  await TestUtils.disconnectDatabase();
});
```

**Issue: Tests pass individually but fail together**
```javascript
// Solution: Clear state between tests
afterEach(async () => {
  await TestUtils.clearDatabase();
  jest.clearAllMocks();
});
```

---

## ✨ Test Quality Checklist

Before Committing, Ask Yourself:

### Test Coverage
- [ ] My tests cover the happy path
- [ ] My tests cover error cases
- [ ] My tests cover edge cases
- [ ] My tests cover boundary conditions
- [ ] Coverage meets minimum threshold (80%+)

### Test Quality
- [ ] Test names clearly describe what they test
- [ ] Tests are independent (can run in any order)
- [ ] Tests clean up after themselves
- [ ] No hardcoded values (use constants/mocks)
- [ ] Tests run quickly (<1s per unit test)

### Test Maintainability
- [ ] Tests follow established patterns
- [ ] Mock data uses test utilities
- [ ] No duplication (DRY principle)
- [ ] Setup/teardown properly organized
- [ ] Comments explain complex test logic

### Test Reliability
- [ ] Tests are deterministic (same result every time)
- [ ] No sleeps or arbitrary waits
- [ ] No dependencies on external services
- [ ] No dependencies on test execution order
- [ ] No flaky tests (inconsistent pass/fail)

---

## 📊 Daily Testing Workflow

### Morning Routine
```bash
# 1. Pull latest changes
git pull origin main

# 2. Run full test suite
npm test

# 3. Check for failures
# If any fails, fix before starting new work
```

### During Development
```bash
# Run tests in watch mode
npm run test:watch

# Tests re-run automatically on file changes
# Focus on files you're working on
```

### Before Committing
```bash
# 1. Run all tests
npm test

# 2. Check coverage
npm run test:coverage

# 3. Verify no tests skipped
# Look for .skip or .only in test files

# 4. Commit if all pass
git add .
git commit -m "descriptive message"
git push
```

---

## 🎓 Testing Best Practices

### DO ✅

1. **Write tests first** (TDD approach)
2. **Test one thing per test** (single responsibility)
3. **Use descriptive test names** (document behavior)
4. **Keep tests simple** (easier to understand)
5. **Mock external dependencies** (isolate unit tests)
6. **Clean up after tests** (prevent side effects)
7. **Use test utilities** (DRY principle)
8. **Test edge cases** (boundary conditions)
9. **Test error handling** (negative cases)
10. **Keep tests fast** (quick feedback loop)

### DON'T ❌

1. **Don't skip tests** (`.skip` or `.only`)
2. **Don't test implementation** (test behavior)
3. **Don't use random data** (non-deterministic)
4. **Don't depend on order** (test isolation)
5. **Don't test frameworks** (test your code)
6. **Don't duplicate setup** (use helpers)
7. **Don't ignore failing tests** (fix immediately)
8. **Don't over-mock** (test real interactions)
9. **Don't write slow tests** (optimize or move to E2E)
10. **Don't commit commented tests** (delete or fix)

---

## 🔍 Code Review Checklist for Tests

When Reviewing Others' Tests:

- [ ] Tests added for new functionality
- [ ] Tests follow project conventions
- [ ] Test names are clear and descriptive
- [ ] Tests actually test what they claim
- [ ] Edge cases are covered
- [ ] Error cases are covered
- [ ] No obvious test smells (sleeps, .only, .skip)
- [ ] Tests are maintainable
- [ ] Coverage meets thresholds
- [ ] Tests run successfully in CI

---

## 📈 Measuring Test Success

### Individual Developer Metrics
- **Test Pass Rate**: Aim for 100%
- **Coverage Contribution**: +2-5% per feature
- **Test-to-Code Ratio**: 1:1 or better
- **Test Speed**: Unit tests <1s, Integration <5s

### Team Metrics
- **Overall Coverage**: Maintain >80%
- **Flakiness Rate**: Keep <1%
- **Test Execution Time**: Keep <30 min total
- **Bug Escape Rate**: Decrease over time

---

## 🚨 Red Flags in Tests

Watch Out For:

🚩 **Tests that occasionally fail** - Flaky tests
🚩 **Tests that sleep/wait** - Use events/promises instead
🚩 **Tests with no assertions** - Not actually testing
🚩 **Tests that are commented out** - Fix or delete
🚩 **Tests with .skip or .only** - Clean up before commit
🚩 **Very slow unit tests** - Should be integration tests
🚩 **Complex test setup** - Extract to helpers
🚩 **Duplicate test code** - Use shared utilities
🚩 **Tests that test mocks** - Test real behavior
🚩 **100+ line test functions** - Break into smaller tests

---

## 📚 Additional Resources

### Documentation
- [Comprehensive Testing Blueprint](./COMPREHENSIVE_TESTING_BLUEPRINT.md)
- [Test Implementation Guide](./TEST_IMPLEMENTATION_GUIDE.md)
- [Testing Architecture Visual](./TESTING_ARCHITECTURE_VISUAL.md)

### External Resources
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)

### Team Resources
- Ask in #testing-help Slack channel
- Pair programming for complex tests
- Weekly test review sessions

---

## 🎯 Quick Commands Reference

```bash
# Run all tests
npm test

# Test specific level
npm run test:unit
npm run test:integration
npm run test:system

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# Specific file
npx jest path/to/test.js

# Pattern matching
npx jest --testNamePattern="pattern"

# Update snapshots
npx jest --updateSnapshot

# Clear cache
npx jest --clearCache

# CI mode
npm run test:ci
```

---

## 💡 Pro Tips

1. **Use test.only during development** - But remove before commit!
   ```javascript
   test.only('test I am working on', () => {});
   ```

2. **Group related tests** - Use nested describe blocks
   ```javascript
   describe('Account Model', () => {
     describe('validation', () => {});
     describe('methods', () => {});
   });
   ```

3. **Use beforeAll for expensive setup** - Database connections, etc.
   ```javascript
   beforeAll(async () => {
     await TestUtils.connectDatabase();
   });
   ```

4. **Use beforeEach for test isolation** - Clear state between tests
   ```javascript
   beforeEach(async () => {
     await TestUtils.clearDatabase();
   });
   ```

5. **Create custom matchers** - For domain-specific assertions
   ```javascript
   expect.extend({
     toBeValidAccount(received) {
       const pass = received.accountId && received.accountName;
       return { pass, message: () => 'Not a valid account' };
     }
   });
   ```

---

## 🎉 Celebrate Test Milestones!

- ✅ First test written
- ✅ 50% coverage reached
- ✅ 80% coverage reached (team goal!)
- ✅ 90% coverage reached (excellence!)
- ✅ All tests passing in CI
- ✅ Zero flaky tests for a week
- ✅ Test suite under 10 minutes
- ✅ 100 tests written

Keep testing, keep improving! 🚀

---

**Document Version:** 1.0  
**Last Updated:** October 10, 2025  
**For Questions:** Contact the testing team or refer to blueprint documents
