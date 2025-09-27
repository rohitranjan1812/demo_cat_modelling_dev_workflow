const request = require('supertest');
const app = require('../../src/app');
const IntegrationService = require('../../src/services/IntegrationService');

// Mock the IntegrationService
jest.mock('../../src/services/IntegrationService');

describe('Integration Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/integration/risk/location', () => {
    it('should return location risk assessment with valid parameters', async () => {
      const mockResponse = {
        success: true,
        data: {
          location: {
            latitude: 25.0,
            longitude: -80.0,
            bufferKm: 50
          },
          analysis: {
            hazards: 2,
            vulnerabilities: 1,
            accounts: 3,
            zones: 1,
            scenarios: 0
          },
          riskMetrics: {
            hazardRiskScore: 6.5,
            vulnerabilityRiskScore: 7.2,
            combinedRiskScore: 6.85,
            overallRiskLevel: 'High',
            totalExposure: 5000000,
            currency: 'USD'
          },
          recommendations: [
            {
              type: 'High Risk Alert',
              priority: 'Critical',
              message: 'Location has high risk exposure',
              actions: ['Review insurance coverage', 'Implement emergency response plans']
            }
          ]
        }
      };

      IntegrationService.getLocationRiskAssessment.mockResolvedValue(mockResponse);

      const response = await request(app)
        .get('/api/v1/integration/risk/location')
        .query({
          latitude: 25.0,
          longitude: -80.0,
          bufferKm: 50,
          hazardTypes: 'Hurricane,Flood',
          includeVulnerability: true,
          includeExposure: true,
          currency: 'USD'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.location.latitude).toBe(25.0);
      expect(response.body.data.location.longitude).toBe(-80.0);
      expect(response.body.data.analysis.hazards).toBe(2);
      expect(response.body.data.riskMetrics.overallRiskLevel).toBe('High');
    });

    it('should return 400 for missing required parameters', async () => {
      const response = await request(app)
        .get('/api/v1/integration/risk/location')
        .query({
          latitude: 25.0
          // missing longitude
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Latitude and longitude are required');
    });

    it('should handle service errors gracefully', async () => {
      IntegrationService.getLocationRiskAssessment.mockRejectedValue(
        new Error('Service error')
      );

      const response = await request(app)
        .get('/api/v1/integration/risk/location')
        .query({
          latitude: 25.0,
          longitude: -80.0
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Error getting location risk assessment');
    });
  });

  describe('GET /api/v1/integration/risk/account/:accountId', () => {
    it('should return account risk analysis', async () => {
      const mockResponse = {
        success: true,
        data: {
          account: {
            accountId: 'ACC-123456',
            accountName: 'Test Account',
            totalExposure: 5000000,
            currency: 'USD'
          },
          childAccounts: [],
          riskMetrics: {
            totalExposure: 5000000,
            averageRiskScore: 6.5,
            highRiskLocations: 2,
            criticalHazards: ['Hurricane', 'Flood'],
            currency: 'USD',
            locationCount: 5
          },
          recommendations: [
            {
              type: 'Account Risk Management',
              priority: 'High',
              message: 'Account exceeds risk threshold',
              actions: ['Review risk limits', 'Consider risk transfer']
            }
          ]
        }
      };

      IntegrationService.getAccountRiskAnalysis.mockResolvedValue(mockResponse);

      const response = await request(app)
        .get('/api/v1/integration/risk/account/ACC-123456')
        .query({
          includeChildAccounts: true,
          hazardTypes: 'Hurricane,Flood',
          currency: 'USD',
          riskThreshold: 0.5
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.account.accountId).toBe('ACC-123456');
      expect(response.body.data.riskMetrics.totalExposure).toBe(5000000);
    });

    it('should handle account not found error', async () => {
      IntegrationService.getAccountRiskAnalysis.mockRejectedValue(
        new Error('Account not found')
      );

      const response = await request(app)
        .get('/api/v1/integration/risk/account/INVALID-ACCOUNT');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Error getting account risk analysis');
    });
  });

  describe('POST /api/v1/integration/financial/:accountId/metrics', () => {
    it('should calculate financial risk metrics', async () => {
      const mockResponse = {
        success: true,
        data: {
          expectedLoss: 300000,
          valueAtRisk: 450000,
          tailValueAtRisk: 500000,
          standardDeviation: 150000,
          riskAdjustedExposure: 5500000,
          hazardMetrics: {
            Hurricane: {
              count: 2,
              averageProbability: 0.3,
              maxSeverity: 4,
              totalExposure: 2000000
            }
          },
          vulnerabilityAdjustedMetrics: {
            adjustedExposure: 6000000,
            vulnerabilityMultiplier: 1.2,
            averageVulnerabilityScore: 6.5
          },
          timeHorizonAdjustments: {
            adjustedRiskScore: 6.5,
            timeAdjustmentFactor: 1.0,
            timeHorizon: 1
          },
          currency: 'USD',
          confidenceLevel: 0.95,
          timeHorizon: 1,
          calculationTimestamp: new Date(),
          dataQuality: {
            score: 0.8,
            level: 'High',
            factors: {
              hazardData: 2,
              vulnerabilityData: 1,
              accountData: 1
            }
          }
        }
      };

      IntegrationService.calculateFinancialRiskMetrics.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/api/v1/integration/financial/ACC-123456/metrics')
        .send({
          hazardTypes: ['Hurricane', 'Flood'],
          timeHorizon: 1,
          confidenceLevel: 0.95,
          currency: 'USD',
          includeVulnerabilityAdjustment: true
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.expectedLoss).toBe(300000);
      expect(response.body.data.valueAtRisk).toBe(450000);
      expect(response.body.data.currency).toBe('USD');
    });

    it('should validate financial metrics parameters', async () => {
      const response = await request(app)
        .post('/api/v1/integration/financial/ACC-123456/metrics')
        .send({
          timeHorizon: -1, // Invalid: should be positive
          confidenceLevel: 1.5, // Invalid: should be <= 0.999
          currency: 'INVALID' // Invalid currency
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid financial metrics parameters');
    });
  });

  describe('POST /api/v1/integration/risk/comparison', () => {
    it('should compare risk between multiple locations', async () => {
      const mockResponse = {
        success: true,
        data: {
          locations: [
            {
              location: {
                latitude: 25.0,
                longitude: -80.0,
                name: 'Miami'
              },
              riskAssessment: {
                riskMetrics: {
                  combinedRiskScore: 7.5,
                  totalExposure: 3000000
                }
              }
            },
            {
              location: {
                latitude: 40.0,
                longitude: -74.0,
                name: 'New York'
              },
              riskAssessment: {
                riskMetrics: {
                  combinedRiskScore: 5.2,
                  totalExposure: 5000000
                }
              }
            }
          ],
          comparison: {
            highestRisk: 7.5,
            lowestRisk: 5.2,
            averageRisk: 6.35,
            highestExposure: 5000000,
            lowestExposure: 3000000,
            averageExposure: 4000000,
            riskRange: 2.3,
            exposureRange: 2000000
          },
          summary: {
            totalLocations: 2,
            highestRisk: 7.5,
            lowestRisk: 5.2,
            averageRisk: 6.35
          }
        }
      };

      // Mock the service method for each location
      IntegrationService.getLocationRiskAssessment
        .mockResolvedValueOnce({
          data: {
            riskMetrics: { combinedRiskScore: 7.5, totalExposure: 3000000 }
          }
        })
        .mockResolvedValueOnce({
          data: {
            riskMetrics: { combinedRiskScore: 5.2, totalExposure: 5000000 }
          }
        });

      const response = await request(app)
        .post('/api/v1/integration/risk/comparison')
        .send({
          locations: [
            {
              latitude: 25.0,
              longitude: -80.0,
              name: 'Miami',
              bufferKm: 50,
              hazardTypes: ['Hurricane'],
              currency: 'USD'
            },
            {
              latitude: 40.0,
              longitude: -74.0,
              name: 'New York',
              bufferKm: 50,
              hazardTypes: ['Hurricane'],
              currency: 'USD'
            }
          ]
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.locations).toHaveLength(2);
      expect(response.body.data.comparison.highestRisk).toBe(7.5);
      expect(response.body.data.comparison.lowestRisk).toBe(5.2);
    });

    it('should validate comparison parameters', async () => {
      const response = await request(app)
        .post('/api/v1/integration/risk/comparison')
        .send({
          locations: [
            {
              latitude: 25.0,
              longitude: -80.0
            }
            // Only one location - should require at least 2
          ]
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('At least 2 locations are required');
    });
  });

  describe('GET /api/v1/integration/dashboard', () => {
    it('should return risk dashboard data', async () => {
      const mockResponse = {
        success: true,
        data: {
          overview: {
            totalHazards: 15,
            totalVulnerabilities: 25,
            totalAccounts: 50,
            totalExposure: 100000000,
            currency: 'USD'
          },
          riskIndicators: {
            overallRiskLevel: 'Medium',
            trend: 'increasing',
            change: 0.1
          },
          hazardStats: {
            byType: { Hurricane: 8, Earthquake: 4, Flood: 3 }
          },
          vulnerabilityStats: {
            byType: { Physical: 12, Social: 8, Economic: 5 }
          },
          accountStats: {
            byRegion: { 'North America': 30, 'Europe': 20 }
          },
          recentEvents: [],
          riskTrends: {
            trend: 'stable',
            change: 0.05
          },
          lastUpdated: new Date()
        }
      };

      IntegrationService.getRiskDashboard.mockResolvedValue(mockResponse);

      const response = await request(app)
        .get('/api/v1/integration/dashboard')
        .query({
          region: 'North America',
          hazardTypes: 'Hurricane,Earthquake',
          timeRange: '30d',
          currency: 'USD'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.overview.totalHazards).toBe(15);
      expect(response.body.data.overview.totalVulnerabilities).toBe(25);
      expect(response.body.data.overview.totalAccounts).toBe(50);
    });
  });

  describe('GET /api/v1/integration/alerts', () => {
    it('should return risk alerts', async () => {
      const mockResponse = {
        success: true,
        data: {
          alerts: [
            {
              id: 'alert_1',
              type: 'High Risk Location',
              severity: 'high',
              message: 'Location exceeds risk threshold',
              timestamp: new Date(),
              accountId: 'ACC-123456',
              acknowledged: false
            },
            {
              id: 'alert_2',
              type: 'Vulnerability Update',
              severity: 'medium',
              message: 'New vulnerability assessment available',
              timestamp: new Date(),
              accountId: 'ACC-123456',
              acknowledged: true
            }
          ],
          summary: {
            total: 2,
            critical: 0,
            high: 1,
            medium: 1,
            low: 0
          }
        }
      };

      // Mock the controller method directly since it generates mock data
      const response = await request(app)
        .get('/api/v1/integration/alerts')
        .query({
          accountId: 'ACC-123456',
          severity: 'medium',
          limit: 50
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.alerts).toBeDefined();
      expect(response.body.data.summary).toBeDefined();
    });
  });

  describe('GET /api/v1/integration/export', () => {
    it('should export risk data in JSON format', async () => {
      const mockData = {
        location: { latitude: 25.0, longitude: -80.0 },
        riskMetrics: { combinedRiskScore: 6.5, totalExposure: 1000000 }
      };

      IntegrationService.getLocationRiskAssessment.mockResolvedValue({
        data: mockData
      });

      const response = await request(app)
        .get('/api/v1/integration/export')
        .query({
          type: 'location',
          id: '25.0,-80.0',
          format: 'json',
          includeRawData: false
        });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('application/json');
      expect(response.headers['content-disposition']).toContain('attachment');
    });

    it('should validate export parameters', async () => {
      const response = await request(app)
        .get('/api/v1/integration/export')
        .query({
          type: 'invalid', // Invalid type
          id: 'test'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid type');
    });
  });

  describe('GET /api/v1/integration/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/v1/integration/health');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Integration service is running');
      expect(response.body.endpoints).toBeDefined();
    });
  });
});
