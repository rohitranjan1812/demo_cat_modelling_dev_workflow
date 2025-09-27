const IntegrationService = require('../../src/services/IntegrationService');
const Hazard = require('../../src/models/Hazard');
const Vulnerability = require('../../src/models/Vulnerability');
const Account = require('../../src/models/Account');
const HazardZone = require('../../src/models/HazardZone');
const HazardScenario = require('../../src/models/HazardScenario');

// Mock the models
jest.mock('../../src/models/Hazard');
jest.mock('../../src/models/Vulnerability');
jest.mock('../../src/models/Account');
jest.mock('../../src/models/HazardZone');
jest.mock('../../src/models/HazardScenario');
jest.mock('../../src/models/Location');

describe('IntegrationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getLocationRiskAssessment', () => {
    it('should return comprehensive risk assessment for a location', async () => {
      // Mock data with proper methods
      const mockHazard = {
        hazardId: 'HAZ-12345678',
        hazardName: 'Test Hurricane',
        hazardType: 'Hurricane',
        severity: 'Major',
        probability: 0.3,
        footprint: { centerLatitude: 25.0, centerLongitude: -80.0, radius: 100 },
        economicImpact: [{ estimatedLoss: 1000000, currency: 'USD' }],
        affectsLocation: jest.fn().mockReturnValue(true),
        calculateHazardScore: jest.fn().mockReturnValue(6.5)
      };

      const mockVulnerability = {
        vulnerabilityId: 'VUL-12345678',
        vulnerabilityName: 'Test Vulnerability',
        vulnerabilityType: 'Physical',
        overallVulnerabilityScore: 7.2,
        overallRiskLevel: 'High',
        geographicScope: { centerLatitude: 25.0, centerLongitude: -80.0, radius: 50 },
        affectsLocation: jest.fn().mockReturnValue(true)
      };

      const mockAccount = {
        accountId: 'ACC-123456',
        accountName: 'Test Account',
        accountType: 'Primary',
        totalExposure: 5000000,
        currency: 'USD',
        regions: ['North America'],
        riskProfile: 'High'
      };

      // Mock model methods
      jest.spyOn(Hazard, 'find').mockResolvedValue([mockHazard]);
      jest.spyOn(Vulnerability, 'find').mockResolvedValue([mockVulnerability]);
      jest.spyOn(Account, 'find').mockResolvedValue([mockAccount]);
      jest.spyOn(HazardZone, 'find').mockResolvedValue([]);
      jest.spyOn(HazardScenario, 'find').mockResolvedValue([]);

      const result = await IntegrationService.getLocationRiskAssessment({
        latitude: 25.0,
        longitude: -80.0,
        bufferKm: 50,
        hazardTypes: ['Hurricane'],
        includeVulnerability: true,
        includeExposure: true,
        currency: 'USD'
      });

      expect(result.success).toBe(true);
      expect(result.data.location.latitude).toBe(25.0);
      expect(result.data.location.longitude).toBe(-80.0);
      expect(result.data.analysis.hazards).toBe(1);
      expect(result.data.analysis.vulnerabilities).toBe(1);
      expect(result.data.analysis.accounts).toBe(1);
      expect(result.data.riskMetrics).toBeDefined();
      expect(result.data.recommendations).toBeDefined();
    });

    it('should handle errors gracefully', async () => {
      Hazard.find.mockRejectedValue(new Error('Database error'));

      await expect(
        IntegrationService.getLocationRiskAssessment({
          latitude: 25.0,
          longitude: -80.0
        })
      ).rejects.toThrow('Failed to get location risk assessment: Database error');
    });
  });

  describe('getAccountRiskAnalysis', () => {
    it('should return account risk analysis with integrated data', async () => {
      const mockAccount = {
        accountId: 'ACC-123456',
        accountName: 'Test Account',
        accountType: 'Primary',
        totalExposure: 5000000,
        currency: 'USD',
        getChildAccounts: jest.fn().mockResolvedValue([])
      };

      Account.findOne.mockResolvedValue(mockAccount);

      const result = await IntegrationService.getAccountRiskAnalysis('ACC-123456', {
        includeChildAccounts: true,
        hazardTypes: ['Hurricane'],
        currency: 'USD',
        riskThreshold: 0.5
      });

      expect(result.success).toBe(true);
      expect(result.data.account.accountId).toBe('ACC-123456');
      expect(result.data.riskMetrics).toBeDefined();
      expect(result.data.recommendations).toBeDefined();
    });

    it('should throw error when account not found', async () => {
      Account.findOne.mockResolvedValue(null);

      await expect(
        IntegrationService.getAccountRiskAnalysis('INVALID-ACCOUNT')
      ).rejects.toThrow('Failed to get account risk analysis: Account not found');
    });
  });

  describe('calculateFinancialRiskMetrics', () => {
    it('should calculate comprehensive financial risk metrics', async () => {
      const mockAccount = {
        accountId: 'ACC-123456',
        accountName: 'Test Account',
        totalExposure: 5000000,
        currency: 'USD'
      };

      const mockRiskAnalysis = {
        data: {
          riskMetrics: {
            totalExposure: 5000000,
            combinedRiskScore: 6.5
          },
          rawData: {
            hazards: [],
            vulnerabilities: []
          }
        }
      };

      Account.findOne.mockResolvedValue(mockAccount);
      
      // Mock the getAccountRiskAnalysis method
      jest.spyOn(IntegrationService, 'getAccountRiskAnalysis')
        .mockResolvedValue(mockRiskAnalysis);

      const result = await IntegrationService.calculateFinancialRiskMetrics({
        accountId: 'ACC-123456',
        hazardTypes: ['Hurricane'],
        timeHorizon: 1,
        confidenceLevel: 0.95,
        currency: 'USD',
        includeVulnerabilityAdjustment: true
      });

      expect(result.success).toBe(true);
      expect(result.data.expectedLoss).toBeDefined();
      expect(result.data.valueAtRisk).toBeDefined();
      expect(result.data.tailValueAtRisk).toBeDefined();
      expect(result.data.standardDeviation).toBeDefined();
      expect(result.data.currency).toBe('USD');
      expect(result.data.confidenceLevel).toBe(0.95);
      expect(result.data.timeHorizon).toBe(1);
    });

    it('should throw error when account not found', async () => {
      Account.findOne.mockResolvedValue(null);

      await expect(
        IntegrationService.calculateFinancialRiskMetrics({
          accountId: 'INVALID-ACCOUNT'
        })
      ).rejects.toThrow('Failed to calculate financial risk metrics: Account not found');
    });
  });

  describe('getRiskDashboard', () => {
    it('should return comprehensive dashboard data', async () => {
      // Mock the statistics methods
      jest.spyOn(IntegrationService, 'getHazardStatistics').mockResolvedValue({
        totalHazards: 10,
        byType: { Hurricane: 5, Earthquake: 3, Flood: 2 }
      });

      jest.spyOn(IntegrationService, 'getVulnerabilityStatistics').mockResolvedValue({
        totalVulnerabilities: 15,
        byType: { Physical: 8, Social: 4, Economic: 3 }
      });

      jest.spyOn(IntegrationService, 'getAccountStatistics').mockResolvedValue({
        totalAccounts: 25,
        totalExposure: 100000000
      });

      jest.spyOn(IntegrationService, 'getRecentRiskEvents').mockResolvedValue([]);
      jest.spyOn(IntegrationService, 'getRiskTrends').mockResolvedValue({
        trend: 'stable',
        change: 0.05
      });

      const result = await IntegrationService.getRiskDashboard({
        region: 'North America',
        hazardTypes: ['Hurricane'],
        timeRange: '30d',
        currency: 'USD'
      });

      expect(result.success).toBe(true);
      expect(result.data.overview.totalHazards).toBe(10);
      expect(result.data.overview.totalVulnerabilities).toBe(15);
      expect(result.data.overview.totalAccounts).toBe(25);
      expect(result.data.overview.totalExposure).toBe(100000000);
      expect(result.data.riskIndicators).toBeDefined();
    });
  });

  describe('Helper methods', () => {
    describe('calculateIntegratedRiskMetrics', () => {
      it('should calculate risk metrics correctly', async () => {
        const mockData = {
          hazards: [
            { calculateHazardScore: () => 6.0 },
            { calculateHazardScore: () => 7.0 }
          ],
          vulnerabilities: [
            { overallVulnerabilityScore: 5.0 },
            { overallVulnerabilityScore: 6.0 }
          ],
          accounts: [
            { totalExposure: 1000000 },
            { totalExposure: 2000000 }
          ],
          zones: [],
          scenarios: [],
          currency: 'USD'
        };

        const result = await IntegrationService.calculateIntegratedRiskMetrics(mockData);

        expect(result.hazardRiskScore).toBe(6.5); // (6.0 + 7.0) / 2
        expect(result.vulnerabilityRiskScore).toBe(5.5); // (5.0 + 6.0) / 2
        expect(result.combinedRiskScore).toBe(6.0); // (6.5 + 5.5) / 2
        expect(result.totalExposure).toBe(3000000);
        expect(result.currency).toBe('USD');
      });
    });

    describe('calculateAccountRiskMetrics', () => {
      it('should calculate account risk metrics correctly', () => {
        const mockData = {
          account: { totalExposure: 1000000 },
          childAccounts: [
            { totalExposure: 500000 },
            { totalExposure: 300000 }
          ],
          locationRiskData: [
            {
              riskAssessment: {
                riskMetrics: { combinedRiskScore: 6.0 },
                rawData: {
                  hazards: [
                    { hazardType: 'Hurricane', probability: 0.3, severity: 'Major' },
                    { hazardType: 'Flood', probability: 0.5, severity: 'Minor' }
                  ]
                }
              }
            },
            {
              riskAssessment: {
                riskMetrics: { combinedRiskScore: 8.0 },
                rawData: {
                  hazards: [
                    { hazardType: 'Earthquake', probability: 0.2, severity: 'Critical' }
                  ]
                }
              }
            }
          ],
          currency: 'USD'
        };

        const result = IntegrationService.calculateAccountRiskMetrics(mockData);

        expect(result.totalExposure).toBe(1800000); // 1000000 + 500000 + 300000
        expect(result.averageRiskScore).toBe(7.0); // (6.0 + 8.0) / 2
        expect(result.locationCount).toBe(2);
        expect(result.currency).toBe('USD');
      });
    });

    describe('calculateExpectedLoss', () => {
      it('should calculate expected loss correctly', () => {
        const mockRiskData = {
          riskMetrics: {
            totalExposure: 1000000,
            combinedRiskScore: 6.0
          }
        };

        const result = IntegrationService.calculateExpectedLoss(mockRiskData, 1);
        expect(result).toBe(600000); // 1000000 * (6.0 / 10) * 1
      });
    });

    describe('calculateValueAtRisk', () => {
      it('should calculate VaR correctly', () => {
        const mockRiskData = {
          riskMetrics: {
            totalExposure: 1000000,
            combinedRiskScore: 6.0
          }
        };

        const result = IntegrationService.calculateValueAtRisk(mockRiskData, 0.95);
        expect(result).toBeGreaterThan(0);
        expect(typeof result).toBe('number');
      });
    });

    describe('assessDataQuality', () => {
      it('should assess data quality correctly', () => {
        const mockData = {
          hazards: Array(5).fill({}),
          vulnerabilities: Array(3).fill({}),
          accounts: Array(10).fill({})
        };

        const result = IntegrationService.assessDataQuality(mockData);

        expect(result.score).toBeGreaterThan(0);
        expect(result.score).toBeLessThanOrEqual(1);
        expect(['Low', 'Medium', 'High']).toContain(result.level);
        expect(result.factors.hazardData).toBe(5);
        expect(result.factors.vulnerabilityData).toBe(3);
        expect(result.factors.accountData).toBe(10);
      });
    });
  });
});
