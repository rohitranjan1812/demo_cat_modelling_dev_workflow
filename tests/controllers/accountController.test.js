const request = require('supertest');
const app = require('../../src/app');
const Account = require('../../src/models/Account');

describe('Account Controller', () => {
  describe('POST /api/v1/accounts', () => {
    test('should create a new account', async () => {
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

      const response = await request(app)
        .post('/api/v1/accounts')
        .send(accountData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accountId).toBe('ACC-123456');
      expect(response.body.data.accountName).toBe('Test Account');
    });

    test('should fail with invalid data', async () => {
      const invalidData = {
        accountId: 'INVALID-ID',
        accountName: 'Test Account',
        accountType: 'Primary',
        totalExposure: 1000000,
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      };

      const response = await request(app)
        .post('/api/v1/accounts')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation error');
    });

    test('should fail with duplicate account ID', async () => {
      const accountData = {
        accountId: 'ACC-123456',
        accountName: 'Test Account',
        accountType: 'Primary',
        totalExposure: 1000000,
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      };

      // Create first account
      await request(app)
        .post('/api/v1/accounts')
        .send(accountData)
        .expect(201);

      // Try to create duplicate
      const response = await request(app)
        .post('/api/v1/accounts')
        .send(accountData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Account ID already exists');
    });
  });

  describe('GET /api/v1/accounts', () => {
    beforeEach(async () => {
      // Create test accounts
      await new Account({
        accountId: 'ACC-111111',
        accountName: 'Account One',
        accountType: 'Primary',
        totalExposure: 1000000,
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      }).save();

      await new Account({
        accountId: 'ACC-222222',
        accountName: 'Account Two',
        accountType: 'Reinsurance',
        totalExposure: 2000000,
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      }).save();
    });

    test('should get all accounts', async () => {
      const response = await request(app)
        .get('/api/v1/accounts')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination).toBeDefined();
    });

    test('should paginate results', async () => {
      const response = await request(app)
        .get('/api/v1/accounts?page=1&limit=1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(1);
    });

    test('should filter by status', async () => {
      const response = await request(app)
        .get('/api/v1/accounts?status=Active')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    test('should search accounts', async () => {
      const response = await request(app)
        .get('/api/v1/accounts?search=Account One')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].accountName).toBe('Account One');
    });
  });

  describe('GET /api/v1/accounts/:accountId', () => {
    let account;

    beforeEach(async () => {
      account = await new Account({
        accountId: 'ACC-123456',
        accountName: 'Test Account',
        accountType: 'Primary',
        totalExposure: 1000000,
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      }).save();
    });

    test('should get account by ID', async () => {
      const response = await request(app)
        .get('/api/v1/accounts/ACC-123456')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accountId).toBe('ACC-123456');
      expect(response.body.data.accountName).toBe('Test Account');
    });

    test('should return 404 for non-existent account', async () => {
      const response = await request(app)
        .get('/api/v1/accounts/ACC-NONEXISTENT')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Account not found');
    });
  });

  describe('PUT /api/v1/accounts/:accountId', () => {
    let account;

    beforeEach(async () => {
      account = await new Account({
        accountId: 'ACC-123456',
        accountName: 'Test Account',
        accountType: 'Primary',
        totalExposure: 1000000,
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      }).save();
    });

    test('should update account', async () => {
      const updateData = {
        accountName: 'Updated Account Name',
        totalExposure: 2000000,
        lastModifiedBy: 'test-user'
      };

      const response = await request(app)
        .put('/api/v1/accounts/ACC-123456')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accountName).toBe('Updated Account Name');
      expect(response.body.data.totalExposure).toBe(2000000);
    });

    test('should return 404 for non-existent account', async () => {
      const updateData = {
        accountName: 'Updated Account Name',
        lastModifiedBy: 'test-user'
      };

      const response = await request(app)
        .put('/api/v1/accounts/ACC-NONEXISTENT')
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Account not found');
    });
  });

  describe('DELETE /api/v1/accounts/:accountId', () => {
    let account;

    beforeEach(async () => {
      account = await new Account({
        accountId: 'ACC-123456',
        accountName: 'Test Account',
        accountType: 'Primary',
        totalExposure: 1000000,
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      }).save();
    });

    test('should delete account', async () => {
      const response = await request(app)
        .delete('/api/v1/accounts/ACC-123456')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Account deleted successfully');

      // Verify account is deleted
      const deletedAccount = await Account.findOne({ accountId: 'ACC-123456' });
      expect(deletedAccount).toBeNull();
    });

    test('should return 404 for non-existent account', async () => {
      const response = await request(app)
        .delete('/api/v1/accounts/ACC-NONEXISTENT')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Account not found');
    });
  });

  describe('GET /api/v1/accounts/:accountId/children', () => {
    let parentAccount, childAccount;

    beforeEach(async () => {
      parentAccount = await new Account({
        accountId: 'ACC-111111',
        accountName: 'Parent Account',
        accountType: 'Primary',
        totalExposure: 1000000,
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      }).save();

      childAccount = await new Account({
        accountId: 'ACC-222222',
        accountName: 'Child Account',
        accountType: 'Reinsurance',
        parentAccountId: 'ACC-111111',
        totalExposure: 500000,
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      }).save();
    });

    test('should get child accounts', async () => {
      const response = await request(app)
        .get('/api/v1/accounts/ACC-111111/children')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].accountId).toBe('ACC-222222');
    });

    test('should return empty array for account with no children', async () => {
      const response = await request(app)
        .get('/api/v1/accounts/ACC-222222/children')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });
  });

  describe('GET /api/v1/accounts/:accountId/total-exposure', () => {
    let parentAccount, childAccount1, childAccount2;

    beforeEach(async () => {
      parentAccount = await new Account({
        accountId: 'ACC-111111',
        accountName: 'Parent Account',
        accountType: 'Primary',
        totalExposure: 1000000,
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      }).save();

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

    test('should calculate total exposure including children', async () => {
      const response = await request(app)
        .get('/api/v1/accounts/ACC-111111/total-exposure')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.directExposure).toBe(1000000);
      expect(response.body.data.totalExposureIncludingChildren).toBe(1800000);
    });
  });

  describe('GET /api/v1/accounts/region/:region', () => {
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

    test('should get accounts by region', async () => {
      const response = await request(app)
        .get('/api/v1/accounts/region/North America')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].accountId).toBe('ACC-111111');
    });
  });
});
