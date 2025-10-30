/**
 * Service-to-Service Integration Tests
 * Tests cross-module operations and service integration
 */

const mongoose = require('mongoose');
const IntegrationService = require('../../../src/services/IntegrationService');
const ExposureService = require('../../../src/services/ExposureService');
const FinancialCalculationService = require('../../../src/services/FinancialCalculationService');
const Account = require('../../../src/models/Account');
const Hazard = require('../../../src/models/Hazard');
const Vulnerability = require('../../../src/models/Vulnerability');
const { testEnv } = require('../../test-environment');

describe('Service Integration Tests', () => {
  beforeAll(async () => {
    await testEnv.initialize();
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  beforeEach(async () => {
    // Clear collections before each test
    if (testEnv.isDatabaseConnected()) {
      await Account.deleteMany({});
      await Hazard.deleteMany({});
      await Vulnerability.deleteMany({});
    }
  });

  describe('IntegrationService.getLocationRiskAssessment', () => {
    it('should aggregate risk data from multiple services', async () => {
      // Create test data
      const account = new Account({
        accountId: 'ACC-TEST-001',
        accountName: 'Test Account',
        accountType: 'Primary',
        totalExposure: 1000000,
        currency: 'USD',
        status: 'Active',
        regions: ['North America']
      });
      await account.save();

      const hazard = new Hazard({
        hazardId: 'HAZ-TEST-001',
        hazardName: 'Test Hazard',
        hazardType: 'Earthquake',
        status: 'Active',
        footprint: {
          centerLatitude: 37.7749,
          centerLongitude: -122.4194,
          radius: 50
        },
        probability: 0.1
      });
      await hazard.save();

      // Test integration service
      const result = await IntegrationService.getLocationRiskAssessment({
        latitude: 37.7749,
        longitude: -122.4194,
        bufferKm: 50,
        currency: 'USD'
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.analysis).toBeDefined();
    });
  });

  describe('IntegrationService.aggregateAccountExposures', () => {
    it('should aggregate exposures for an account', async () => {
      const account = new Account({
        accountId: 'ACC-TEST-002',
        accountName: 'Test Account 2',
        accountType: 'Primary',
        totalExposure: 2000000,
        currency: 'USD',
        status: 'Active'
      });
      await account.save();

      const result = await IntegrationService.aggregateAccountExposures('ACC-TEST-002');

      expect(result).toBeDefined();
      expect(result.accountId).toBe('ACC-TEST-002');
      expect(result.totalExposures).toBeDefined();
      expect(result.totalValue).toBeDefined();
    });
  });

  describe('ExposureService.aggregateAccountExposures', () => {
    it('should aggregate account exposures with breakdown', async () => {
      const account = new Account({
        accountId: 'ACC-TEST-003',
        accountName: 'Test Account 3',
        accountType: 'Primary',
        totalExposure: 3000000,
        currency: 'USD',
        status: 'Active'
      });
      await account.save();

      const exposureService = new ExposureService();
      const result = await exposureService.aggregateAccountExposures('ACC-TEST-003');

      expect(result).toBeDefined();
      expect(result.accountId).toBe('ACC-TEST-003');
      expect(result.exposuresByType).toBeDefined();
      expect(result.exposuresByRegion).toBeDefined();
      expect(result.exposuresByPeril).toBeDefined();
    });
  });

  describe('ExposureService.calculatePortfolioRiskAggregation', () => {
    it('should calculate portfolio risk across multiple accounts', async () => {
      const account1 = new Account({
        accountId: 'ACC-PORT-001',
        accountName: 'Portfolio Account 1',
        accountType: 'Primary',
        totalExposure: 1000000,
        currency: 'USD',
        status: 'Active'
      });
      await account1.save();

      const account2 = new Account({
        accountId: 'ACC-PORT-002',
        accountName: 'Portfolio Account 2',
        accountType: 'Primary',
        totalExposure: 2000000,
        currency: 'USD',
        status: 'Active'
      });
      await account2.save();

      const exposureService = new ExposureService();
      const result = await exposureService.calculatePortfolioRiskAggregation(
        ['ACC-PORT-001', 'ACC-PORT-002']
      );

      expect(result).toBeDefined();
      expect(result.totalAccounts).toBe(2);
      expect(result.riskMetrics).toBeDefined();
      expect(result.riskMetrics.concentrationRisk).toBeDefined();
      expect(result.riskMetrics.diversificationBenefit).toBeDefined();
    });
  });

  describe('FinancialCalculationService Integration', () => {
    it('should calculate portfolio risk metrics', () => {
      const financialService = new FinancialCalculationService();
      
      const mockEvents = [
        { financialImpact: { totalLoss: 100000 } },
        { financialImpact: { totalLoss: 200000 } },
        { financialImpact: { totalLoss: 150000 } }
      ];

      const metrics = financialService.calculatePortfolioRiskMetrics(mockEvents);

      expect(metrics).toBeDefined();
      expect(metrics.summary).toBeDefined();
      expect(metrics.summary.expectedLoss).toBeDefined();
      expect(metrics.valueAtRisk).toBeDefined();
      expect(metrics.tailValueAtRisk).toBeDefined();
    });
  });

  describe('Cross-Service Data Flow', () => {
    it('should handle data flow from IntegrationService to FinancialCalculationService', async () => {
      const account = new Account({
        accountId: 'ACC-FLOW-001',
        accountName: 'Flow Test Account',
        accountType: 'Primary',
        totalExposure: 5000000,
        currency: 'USD',
        status: 'Active'
      });
      await account.save();

      // Get account risk analysis
      const riskAnalysis = await IntegrationService.getAccountRiskAnalysis('ACC-FLOW-001', {
        currency: 'USD'
      });

      expect(riskAnalysis.success).toBe(true);
      expect(riskAnalysis.data).toBeDefined();

      // Calculate financial metrics
      const financialMetrics = await IntegrationService.calculateFinancialRiskMetrics({
        accountId: 'ACC-FLOW-001',
        currency: 'USD',
        confidenceLevel: 0.95
      });

      expect(financialMetrics.success).toBe(true);
      expect(financialMetrics.data).toBeDefined();
    });
  });
});

