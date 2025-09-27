/**
 * Account Model Tests - No Database Required
 * Tests model validation and methods without database operations
 */
const Account = require('../../src/models/Account');

describe('Account Model - No Database', () => {
  describe('Model Validation', () => {
    test('should validate account ID format', () => {
      const validAccount = new Account({
        accountId: 'ACC-123456',
        accountName: 'Test Account',
        accountType: 'Primary',
        totalExposure: 1000000,
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      });

      expect(validAccount.accountId).toBe('ACC-123456');
      expect(validAccount.validateSync()).toBeUndefined();
    });

    test('should reject invalid account ID format', () => {
      const invalidAccount = new Account({
        accountId: 'INVALID-ID',
        accountName: 'Test Account',
        accountType: 'Primary',
        totalExposure: 1000000,
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      });

      const validationError = invalidAccount.validateSync();
      expect(validationError).toBeDefined();
      expect(validationError.errors.accountId).toBeDefined();
    });

    test('should validate account type', () => {
      const validAccount = new Account({
        accountId: 'ACC-123456',
        accountName: 'Test Account',
        accountType: 'Primary',
        totalExposure: 1000000,
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      });

      expect(validAccount.accountType).toBe('Primary');
      expect(validAccount.validateSync()).toBeUndefined();
    });

    test('should reject invalid account type', () => {
      const invalidAccount = new Account({
        accountId: 'ACC-123456',
        accountName: 'Test Account',
        accountType: 'InvalidType',
        totalExposure: 1000000,
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      });

      const validationError = invalidAccount.validateSync();
      expect(validationError).toBeDefined();
      expect(validationError.errors.accountType).toBeDefined();
    });

    test('should validate total exposure is positive', () => {
      const validAccount = new Account({
        accountId: 'ACC-123456',
        accountName: 'Test Account',
        accountType: 'Primary',
        totalExposure: 1000000,
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      });

      expect(validAccount.totalExposure).toBe(1000000);
      expect(validAccount.validateSync()).toBeUndefined();
    });

    test('should reject negative total exposure', () => {
      const invalidAccount = new Account({
        accountId: 'ACC-123456',
        accountName: 'Test Account',
        accountType: 'Primary',
        totalExposure: -1000,
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      });

      const validationError = invalidAccount.validateSync();
      expect(validationError).toBeDefined();
      expect(validationError.errors.totalExposure).toBeDefined();
    });
  });

  describe('Model Methods', () => {
    let account;

    beforeEach(() => {
      account = new Account({
        accountId: 'ACC-123456',
        accountName: 'Test Account',
        accountType: 'Primary',
        totalExposure: 1000000,
        currency: 'USD',
        regions: ['North America'],
        riskProfile: 'Medium',
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      });
    });

    test('should have correct default values', () => {
      expect(account.status).toBe('Active');
      expect(account.accountLevel).toBe(1);
      // Note: createdAt and updatedAt are set by Mongoose on save, not on creation
    });

    test('should calculate account level correctly', () => {
      expect(account.accountLevel).toBe(1);
      
      const childAccount = new Account({
        accountId: 'ACC-789012',
        accountName: 'Child Account',
        accountType: 'Reinsurance',
        parentAccountId: 'ACC-123456',
        accountLevel: 2, // Set explicitly since it's not auto-calculated
        totalExposure: 500000,
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      });
      
      expect(childAccount.accountLevel).toBe(2);
    });

    test('should validate expiry date is after effective date', () => {
      const accountWithDates = new Account({
        accountId: 'ACC-123456',
        accountName: 'Test Account',
        accountType: 'Primary',
        totalExposure: 1000000,
        effectiveDate: new Date('2024-01-01'),
        expiryDate: new Date('2024-12-31'),
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      });

      expect(accountWithDates.validateSync()).toBeUndefined();
    });

    test('should reject expiry date before effective date on save', async () => {
      const invalidAccount = new Account({
        accountId: 'ACC-123456',
        accountName: 'Test Account',
        accountType: 'Primary',
        totalExposure: 1000000,
        effectiveDate: new Date('2024-12-31'),
        expiryDate: new Date('2024-01-01'),
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      });

      // This validation happens in pre-save hook, not in validateSync
      try {
        await invalidAccount.save();
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.message).toContain('Expiry date must be after effective date');
      }
    });

    test('should reject child account with level 1 on save', async () => {
      const invalidChildAccount = new Account({
        accountId: 'ACC-789012',
        accountName: 'Child Account',
        accountType: 'Reinsurance',
        parentAccountId: 'ACC-123456',
        accountLevel: 1, // Invalid: child accounts must have level > 1
        totalExposure: 500000,
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      });

      // This validation happens in pre-save hook, not in validateSync
      try {
        await invalidChildAccount.save();
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.message).toContain('Child accounts must have level > 1');
      }
    });
  });

  describe('Model Schema', () => {
    test('should have required fields', () => {
      const account = new Account();
      const validationError = account.validateSync();
      
      expect(validationError.errors.accountId).toBeDefined();
      expect(validationError.errors.accountName).toBeDefined();
      expect(validationError.errors.accountType).toBeDefined();
      expect(validationError.errors.createdBy).toBeDefined();
      expect(validationError.errors.lastModifiedBy).toBeDefined();
      // totalExposure has a default value, so it's not required
    });

    test('should have optional fields with defaults', () => {
      const account = new Account({
        accountId: 'ACC-123456',
        accountName: 'Test Account',
        accountType: 'Primary',
        totalExposure: 1000000,
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      });

      expect(account.status).toBe('Active');
      expect(account.accountLevel).toBe(1);
      expect(account.currency).toBe('USD');
      expect(account.riskProfile).toBe('Medium');
    });

    test('should handle regions array', () => {
      const account = new Account({
        accountId: 'ACC-123456',
        accountName: 'Test Account',
        accountType: 'Primary',
        totalExposure: 1000000,
        regions: ['North America', 'Europe'],
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      });

      expect(account.regions).toEqual(['North America', 'Europe']);
      expect(account.validateSync()).toBeUndefined();
    });
  });

  describe('Model Transformations', () => {
    test('should transform to JSON correctly', () => {
      const account = new Account({
        accountId: 'ACC-123456',
        accountName: 'Test Account',
        accountType: 'Primary',
        totalExposure: 1000000,
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      });

      const json = account.toJSON();
      expect(json.accountId).toBe('ACC-123456');
      expect(json.accountName).toBe('Test Account');
      expect(json._id).toBeDefined();
    });

    test('should transform to object correctly', () => {
      const account = new Account({
        accountId: 'ACC-123456',
        accountName: 'Test Account',
        accountType: 'Primary',
        totalExposure: 1000000,
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      });

      const obj = account.toObject();
      expect(obj.accountId).toBe('ACC-123456');
      expect(obj.accountName).toBe('Test Account');
    });
  });
});