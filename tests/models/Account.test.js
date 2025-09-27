const Account = require('../../src/models/Account');

describe('Account Model', () => {
  describe('Account Creation', () => {
    test('should create a valid account', async () => {
      const accountData = {
        accountId: 'ACC-123456',
        accountName: 'Test Account',
        accountType: 'Primary',
        totalExposure: 1000000,
        currency: 'USD',
        regions: ['North America'],
        riskProfile: 'Medium',
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      };

      const account = new Account(accountData);
      const savedAccount = await account.save();

      expect(savedAccount.accountId).toBe('ACC-123456');
      expect(savedAccount.accountName).toBe('Test Account');
      expect(savedAccount.accountType).toBe('Primary');
      expect(savedAccount.totalExposure).toBe(1000000);
      expect(savedAccount.status).toBe('Active');
    });

    test('should fail with invalid account ID format', async () => {
      const accountData = {
        accountId: 'INVALID-ID',
        accountName: 'Test Account',
        accountType: 'Primary',
        totalExposure: 1000000,
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      };

      const account = new Account(accountData);
      await expect(account.save()).rejects.toThrow();
    });

    test('should fail with invalid account type', async () => {
      const accountData = {
        accountId: 'ACC-123456',
        accountName: 'Test Account',
        accountType: 'InvalidType',
        totalExposure: 1000000,
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      };

      const account = new Account(accountData);
      await expect(account.save()).rejects.toThrow();
    });

    test('should fail with negative total exposure', async () => {
      const accountData = {
        accountId: 'ACC-123456',
        accountName: 'Test Account',
        accountType: 'Primary',
        totalExposure: -1000,
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      };

      const account = new Account(accountData);
      await expect(account.save()).rejects.toThrow();
    });
  });

  describe('Account Hierarchy', () => {
    test('should create parent-child relationship', async () => {
      // Create parent account
      const parentData = {
        accountId: 'ACC-111111',
        accountName: 'Parent Account',
        accountType: 'Primary',
        totalExposure: 2000000,
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      };
      const parent = await new Account(parentData).save();

      // Create child account
      const childData = {
        accountId: 'ACC-222222',
        accountName: 'Child Account',
        accountType: 'Reinsurance',
        parentAccountId: 'ACC-111111',
        totalExposure: 1000000,
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      };
      const child = new Account(childData);
      const savedChild = await child.save();

      expect(savedChild.parentAccountId).toBe('ACC-111111');
      expect(savedChild.accountLevel).toBe(2);
    });

    test('should fail if parent account does not exist', async () => {
      const childData = {
        accountId: 'ACC-222222',
        accountName: 'Child Account',
        accountType: 'Reinsurance',
        parentAccountId: 'ACC-NONEXISTENT',
        totalExposure: 1000000,
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      };

      const child = new Account(childData);
      await expect(child.save()).rejects.toThrow();
    });
  });

  describe('Account Methods', () => {
    let parentAccount, childAccount1, childAccount2;

    beforeEach(async () => {
      // Create parent account
      parentAccount = await new Account({
        accountId: 'ACC-111111',
        accountName: 'Parent Account',
        accountType: 'Primary',
        totalExposure: 1000000,
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      }).save();

      // Create child accounts
      childAccount1 = await new Account({
        accountId: 'ACC-222222',
        accountName: 'Child Account 1',
        accountType: 'Reinsurance',
        parentAccountId: 'ACC-111111',
        totalExposure: 500000,
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      }).save();

      childAccount2 = await new Account({
        accountId: 'ACC-333333',
        accountName: 'Child Account 2',
        accountType: 'Reinsurance',
        parentAccountId: 'ACC-111111',
        totalExposure: 300000,
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      }).save();
    });

    test('should get child accounts', async () => {
      const children = await parentAccount.getChildAccounts();
      expect(children).toHaveLength(2);
      expect(children.map(child => child.accountId)).toContain('ACC-222222');
      expect(children.map(child => child.accountId)).toContain('ACC-333333');
    });

    test('should calculate total exposure including children', async () => {
      const totalExposure = await parentAccount.getTotalExposureIncludingChildren();
      expect(totalExposure).toBe(1800000); // 1000000 + 500000 + 300000
    });
  });

  describe('Account Static Methods', () => {
    beforeEach(async () => {
      await new Account({
        accountId: 'ACC-111111',
        accountName: 'North America Account',
        accountType: 'Primary',
        regions: ['North America'],
        totalExposure: 1000000,
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      }).save();

      await new Account({
        accountId: 'ACC-222222',
        accountName: 'Europe Account',
        accountType: 'Primary',
        regions: ['Europe'],
        totalExposure: 2000000,
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      }).save();
    });

    test('should find accounts by region', async () => {
      const naAccounts = await Account.findByRegion('North America');
      expect(naAccounts).toHaveLength(1);
      expect(naAccounts[0].accountId).toBe('ACC-111111');

      const europeAccounts = await Account.findByRegion('Europe');
      expect(europeAccounts).toHaveLength(1);
      expect(europeAccounts[0].accountId).toBe('ACC-222222');
    });
  });

  describe('Account Validation', () => {
    test('should fail if expiry date is before effective date', async () => {
      const accountData = {
        accountId: 'ACC-123456',
        accountName: 'Test Account',
        accountType: 'Primary',
        totalExposure: 1000000,
        effectiveDate: new Date('2024-12-31'),
        expiryDate: new Date('2024-01-01'),
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      };

      const account = new Account(accountData);
      await expect(account.save()).rejects.toThrow('Expiry date must be after effective date');
    });

    test('should fail if child account has level 1', async () => {
      const accountData = {
        accountId: 'ACC-123456',
        accountName: 'Child Account',
        accountType: 'Reinsurance',
        parentAccountId: 'ACC-111111',
        accountLevel: 1,
        totalExposure: 1000000,
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      };

      const account = new Account(accountData);
      await expect(account.save()).rejects.toThrow('Child accounts must have level > 1');
    });
  });
});
