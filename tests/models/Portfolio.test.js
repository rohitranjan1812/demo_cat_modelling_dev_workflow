const mongoose = require('mongoose');
const Portfolio = require('../../src/models/Portfolio');

/**
 * Test suite for Portfolio Model - Core Model Layer
 * Tests insurance portfolio data model with exposure aggregation
 * Priority: P0 (Core Model)
 */
describe('Portfolio Model - Core Model Tests', () => {
    let mockPortfolioData;

    });

  afterAll(async () => {
    if (connection) {
                }
  });

  beforeEach(async () => {
    // Clear the collection before each test
    await Portfolio.deleteMany({});
    
    // Standard mock portfolio data
    mockPortfolioData = {
      portfolioId: 'PRT-12345678',
      portfolioName: 'Commercial Property Portfolio 2024',
      portfolioDescription: 'Comprehensive commercial property portfolio covering North American markets',
      accountId: 'ACC-12345678',
      portfolioType: 'Commercial Property',
      lineOfBusiness: 'Property',
      region: 'North America',
      currency: 'USD',
      
      // Portfolio composition
      composition: {
        totalExposures: 15420,
        totalInsuredValue: 28750000000,
        averageExposureValue: 1863456,
        exposuresByOccupancy: {
          'Office': 5847,
          'Retail': 4321,
          'Industrial': 2876,
          'Hospitality': 1543,
          'Healthcare': 833
        },
        exposuresByConstruction: {
          'Masonry': 6789,
          'Steel Frame': 4567,
          'Wood Frame': 2345,
          'Concrete': 1234,
          'Mixed': 485
        },
        exposuresByRegion: {
          'California': 4876,
          'Florida': 3542,
          'Texas': 2987,
          'New York': 2234,
          'Illinois': 1781
        }
      },
      
      // Geographic distribution
      geographicDistribution: {
        coverage: 'Multi-State',
        primaryRegions: ['West Coast', 'East Coast', 'Southeast'],
        states: ['CA', 'FL', 'TX', 'NY', 'IL', 'PA', 'OH', 'GA', 'NC', 'WA'],
        countries: ['United States'],
        boundingBox: {
          northEast: { latitude: 48.9991, longitude: -66.9 },
          southWest: { latitude: 24.396, longitude: -125.0 }
        },
        concentrationAreas: [{
          name: 'Los Angeles Metro',
          center: { latitude: 34.0522, longitude: -118.2437 },
          exposureCount: 1234,
          totalValue: 2450000000
        }, {
          name: 'Miami-Dade County',
          center: { latitude: 25.7617, longitude: -80.1918 },
          exposureCount: 987,
          totalValue: 1876000000
        }]
      },
      
      // Risk characteristics
      riskCharacteristics: {
        primaryPerils: ['Hurricane', 'Earthquake', 'Severe Thunderstorm', 'Wildfire'],
        perilWeights: {
          'Hurricane': 0.35,
          'Earthquake': 0.28,
          'Severe Thunderstorm': 0.22,
          'Wildfire': 0.15
        },
        riskProfile: 'Medium-High',
        catastropheExposure: 'High',
        diversificationScore: 7.8,
        concentrationRisk: 'Medium',
        riskMetrics: {
          expectedLoss: 125000000,
          standardDeviation: 287500000,
          coefficientOfVariation: 2.3,
          skewness: 3.2,
          kurtosis: 12.7
        }
      },
      
      // Financial summary
      financialSummary: {
        totalInsuredValue: 28750000000,
        totalPremium: 425000000,
        averagePremiumRate: 1.48,
        deductibleRange: {
          minimum: 25000,
          maximum: 5000000,
          average: 250000
        },
        limitRange: {
          minimum: 1000000,
          maximum: 500000000,
          average: 18650000
        },
        sublimitTotal: 2875000000,
        reinsuranceCoverage: {
          totalCeded: 8625000000,
          retentionPercentage: 70,
          reinsuranceTypes: ['Quota Share', 'Excess of Loss']
        }
      },
      
      // Policy information
      policyInformation: {
        policyCount: 8743,
        activePolicies: 8612,
        inactivePolicies: 131,
        policyTerms: {
          'Annual': 7234,
          'Multi-Year': 1387,
          'Short-Term': 122
        },
        renewalSchedule: {
          'January': 1234,
          'April': 2876,
          'July': 1987,
          'October': 2646
        },
        averagePolicyValue: 3289456
      },
      
      // Performance metrics
      performanceMetrics: {
        lossRatio: 0.67,
        expenseRatio: 0.32,
        combinedRatio: 0.99,
        roeTarget: 0.15,
        roeActual: 0.12,
        profitMargin: 0.08,
        lossFrequency: 0.023,
        lossSeverity: 285000,
        retentionRate: 0.87,
        growthRate: 0.05
      },
      
      // Underwriting guidelines
      underwritingGuidelines: {
        maxSingleRiskLimit: 100000000,
        maxCatastropheAccumulation: 2500000000,
        minimumPremiumRate: 0.005,
        maximumPremiumRate: 0.05,
        acceptedOccupancies: [
          'Office', 'Retail', 'Industrial', 'Hospitality', 'Healthcare',
          'Educational', 'Residential', 'Mixed Use'
        ],
        excludedOccupancies: [
          'Nuclear', 'Chemical', 'Oil Refining', 'Mining'
        ],
        constructionRestrictions: {
          'Wood Frame': { maxStories: 4, maxValue: 10000000 },
          'Masonry': { maxStories: 10, maxValue: 50000000 },
          'Steel Frame': { maxStories: 50, maxValue: 200000000 },
          'Concrete': { maxStories: 100, maxValue: 500000000 }
        },
        geographicRestrictions: [
          'Exclude Flood Zone A',
          'Exclude areas within 1 mile of known active faults'
        ]
      },
      
      // Modeling configuration
      modelingConfiguration: {
        primaryModel: 'RMS RiskLink 23.0',
        secondaryModels: ['AIR Touchstone 6.1', 'KCC RQE 18.0'],
        modelResolution: '100m',
        simulationCount: 100000,
        returnPeriods: [10, 25, 50, 100, 250, 500, 1000],
        confidenceLevels: [0.90, 0.95, 0.99],
        modelingStandards: 'ISO 31000:2018',
        validationFrequency: 'Annual',
        lastModelUpdate: new Date('2024-01-15T00:00:00Z')
      },
      
      // Benchmark comparisons
      benchmarkComparisons: {
        industryBenchmarks: {
          lossRatio: 0.65,
          expenseRatio: 0.30,
          combinedRatio: 0.95,
          premiumRate: 0.015
        },
        peerComparisons: [{
          peerName: 'Competitor A',
          lossRatio: 0.69,
          expenseRatio: 0.34,
          combinedRatio: 1.03
        }, {
          peerName: 'Competitor B',
          lossRatio: 0.64,
          expenseRatio: 0.29,
          combinedRatio: 0.93
        }],
        rankingMetrics: {
          overallRank: 3,
          totalCompetitors: 12,
          percentile: 75
        }
      },
      
      // Historical performance
      historicalPerformance: [{
        year: 2023,
        totalInsuredValue: 26500000000,
        totalPremium: 387500000,
        claimsIncurred: 245000000,
        lossRatio: 0.63,
        combinedRatio: 0.96,
        roeActual: 0.14
      }, {
        year: 2022,
        totalInsuredValue: 24750000000,
        totalPremium: 358750000,
        claimsIncurred: 267500000,
        lossRatio: 0.75,
        combinedRatio: 1.08,
        roeActual: 0.08
      }],
      
      // Regulatory compliance
      regulatoryCompliance: {
        primaryRegulators: ['NAIC', 'State Insurance Departments'],
        complianceStatus: 'Compliant',
        lastAuditDate: new Date('2023-11-15T00:00:00Z'),
        nextAuditDate: new Date('2024-11-15T00:00:00Z'),
        requiredReserves: 425000000,
        actualReserves: 465000000,
        solvenctRatio: 1.85,
        riskBasedCapital: {
          required: 287500000,
          available: 523750000,
          ratio: 1.82
        }
      },
      
      // Data quality metrics
      dataQuality: {
        completenessScore: 0.97,
        accuracyScore: 0.94,
        consistencyScore: 0.96,
        timelinessScore: 0.98,
        overallScore: 0.96,
        lastValidation: new Date('2024-01-01T00:00:00Z'),
        validationIssues: [{
          issueType: 'Missing Occupancy',
          affectedRecords: 23,
          severity: 'Low',
          status: 'Resolved'
        }],
        dataSource: 'Underwriting System',
        updateFrequency: 'Daily'
      },
      
      // Status and audit
      status: 'Active',
      effectiveDate: new Date('2024-01-01T00:00:00Z'),
      expirationDate: new Date('2024-12-31T23:59:59Z'),
      createdBy: 'portfolio-manager',
      createdDate: new Date('2023-12-01T00:00:00Z'),
      lastModifiedBy: 'risk-analyst',
      lastModifiedDate: new Date(),
      version: '2024.1',
      approvalStatus: 'Approved',
      approvedBy: 'chief-underwriter',
      approvalDate: new Date('2023-12-15T00:00:00Z'),
      
      // Metadata
      metadata: {
        dataSource: 'Portfolio Management System',
        lastUpdated: new Date(),
        accuracy: 'High',
        confidence: 94,
        tags: ['commercial', 'property', 'north-america', 'catastrophe'],
        notes: 'Comprehensive commercial property portfolio with strong geographic diversification',
        reportingPeriod: '2024'
      }
    };
  });

  describe('Schema Validation', () => {
    describe('Required Fields', () => {
      test('should create portfolio with all required fields', async () => {
        const portfolio = new Portfolio(mockPortfolioData);
        const savedPortfolio = await portfolio.save();
        
        expect(savedPortfolio._id).toBeDefined();
        expect(savedPortfolio.portfolioId).toBe(mockPortfolioData.portfolioId);
        expect(savedPortfolio.portfolioName).toBe(mockPortfolioData.portfolioName);
        expect(savedPortfolio.accountId).toBe(mockPortfolioData.accountId);
      });

      test('should require portfolioId', async () => {
        const invalidData = { ...mockPortfolioData };
        delete invalidData.portfolioId;
        
        const portfolio = new Portfolio(invalidData);
        await expect(portfolio.save()).rejects.toThrow(/portfolioId.*required/i);
      });

      test('should require portfolioName', async () => {
        const invalidData = { ...mockPortfolioData };
        delete invalidData.portfolioName;
        
        const portfolio = new Portfolio(invalidData);
        await expect(portfolio.save()).rejects.toThrow(/portfolioName.*required/i);
      });

      test('should require accountId', async () => {
        const invalidData = { ...mockPortfolioData };
        delete invalidData.accountId;
        
        const portfolio = new Portfolio(invalidData);
        await expect(portfolio.save()).rejects.toThrow(/accountId.*required/i);
      });

      test('should require portfolioType', async () => {
        const invalidData = { ...mockPortfolioData };
        delete invalidData.portfolioType;
        
        const portfolio = new Portfolio(invalidData);
        await expect(portfolio.save()).rejects.toThrow(/portfolioType.*required/i);
      });

      test('should require lineOfBusiness', async () => {
        const invalidData = { ...mockPortfolioData };
        delete invalidData.lineOfBusiness;
        
        const portfolio = new Portfolio(invalidData);
        await expect(portfolio.save()).rejects.toThrow(/lineOfBusiness.*required/i);
      });
    });

    describe('Field Validation', () => {
      describe('portfolioId Format', () => {
        test('should accept valid portfolioId format', async () => {
          const validIds = [
            'PRT-12345678',
            'PRT-87654321',
            'PRT-00000001'
          ];

          for (const portfolioId of validIds) {
            const data = {
              ...mockPortfolioData,
              portfolioId,
              portfolioName: `Test Portfolio ${portfolioId}`
            };
            
            const portfolio = new Portfolio(data);
            await expect(portfolio.save()).resolves.toBeDefined();
            await portfolio.deleteOne();
          }
        });

        test('should reject invalid portfolioId formats', async () => {
          const invalidIds = [
            'PRT-123',         // Too short
            'PRT-123456789',   // Too long
            'INVALID-12345678', // Wrong prefix
            'PRT12345678',     // Missing dash
            'PRT-ABCDEFGH'     // Non-numeric
          ];

          for (const portfolioId of invalidIds) {
            const data = { ...mockPortfolioData, portfolioId };
            const portfolio = new Portfolio(data);
            await expect(portfolio.save()).rejects.toThrow(/Portfolio ID must be in format/i);
          }
        });
      });

      describe('Portfolio Type Validation', () => {
        test('should accept valid portfolio types', async () => {
          const validTypes = [
            'Commercial Property', 'Personal Property', 'Commercial Auto',
            'Personal Auto', 'Workers Compensation', 'General Liability',
            'Professional Liability', 'Cyber Liability', 'Marine', 'Aviation'
          ];

          for (const portfolioType of validTypes) {
            const data = {
              ...mockPortfolioData,
              portfolioId: `PRT-${Date.now().toString().slice(-8)}`,
              portfolioType,
              portfolioName: `Test ${portfolioType} Portfolio`
            };
            
            const portfolio = new Portfolio(data);
            await expect(portfolio.save()).resolves.toBeDefined();
            await portfolio.deleteOne();
          }
        });

        test('should reject invalid portfolio types', async () => {
          const invalidTypes = ['Unknown', 'Other', 'Custom'];

          for (const portfolioType of invalidTypes) {
            const data = { ...mockPortfolioData, portfolioType };
            const portfolio = new Portfolio(data);
            await expect(portfolio.save()).rejects.toThrow();
          }
        });
      });

      describe('Line of Business Validation', () => {
        test('should accept valid lines of business', async () => {
          const validLines = [
            'Property', 'Casualty', 'Auto', 'Workers Comp',
            'Liability', 'Marine', 'Aviation', 'Cyber'
          ];

          for (const lineOfBusiness of validLines) {
            const data = {
              ...mockPortfolioData,
              portfolioId: `PRT-${Date.now().toString().slice(-8)}`,
              lineOfBusiness,
              portfolioName: `Test ${lineOfBusiness} Portfolio`
            };
            
            const portfolio = new Portfolio(data);
            await expect(portfolio.save()).resolves.toBeDefined();
            await portfolio.deleteOne();
          }
        });
      });

      describe('Currency Validation', () => {
        test('should accept valid currencies', async () => {
          const validCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];

          for (const currency of validCurrencies) {
            const data = {
              ...mockPortfolioData,
              portfolioId: `PRT-${Date.now().toString().slice(-8)}`,
              currency,
              portfolioName: `Test ${currency} Portfolio`
            };
            
            const portfolio = new Portfolio(data);
            await expect(portfolio.save()).resolves.toBeDefined();
            await portfolio.deleteOne();
          }
        });

        test('should reject invalid currencies', async () => {
          const invalidCurrencies = ['INVALID', 'XXX', ''];

          for (const currency of invalidCurrencies) {
            const data = { ...mockPortfolioData, currency };
            const portfolio = new Portfolio(data);
            await expect(portfolio.save()).rejects.toThrow();
          }
        });
      });

      describe('Financial Validation', () => {
        test('should validate positive financial amounts', async () => {
          const testCases = [
            { field: 'totalInsuredValue', value: -1000000000, shouldFail: true },
            { field: 'totalPremium', value: -1000000, shouldFail: true },
            { field: 'totalInsuredValue', value: 0, shouldFail: false },
            { field: 'totalInsuredValue', value: 1000000000, shouldFail: false }
          ];

          for (const { field, value, shouldFail } of testCases) {
            const financialSummary = { ...mockPortfolioData.financialSummary };
            financialSummary[field] = value;

            const data = {
              ...mockPortfolioData,
              portfolioId: `PRT-${Date.now().toString().slice(-8)}`,
              financialSummary
            };
            
            const portfolio = new Portfolio(data);
            
            if (shouldFail) {
              await expect(portfolio.save()).rejects.toThrow();
            } else {
              await expect(portfolio.save()).resolves.toBeDefined();
              await portfolio.deleteOne();
            }
          }
        });

        test('should validate premium rate range', async () => {
          const testCases = [
            { rate: 0.005, shouldPass: true },  // 0.5%
            { rate: 0.05, shouldPass: true },   // 5%
            { rate: -0.01, shouldPass: false }, // Negative
            { rate: 0.1, shouldPass: false }    // Too high (10%)
          ];

          for (const { rate, shouldPass } of testCases) {
            const data = {
              ...mockPortfolioData,
              portfolioId: `PRT-${Date.now().toString().slice(-8)}`,
              financialSummary: {
                ...mockPortfolioData.financialSummary,
                averagePremiumRate: rate
              }
            };
            
            const portfolio = new Portfolio(data);
            
            if (shouldPass) {
              await expect(portfolio.save()).resolves.toBeDefined();
              await portfolio.deleteOne();
            } else {
              await expect(portfolio.save()).rejects.toThrow();
            }
          }
        });

        test('should validate percentage fields', async () => {
          const testCases = [
            { field: 'retentionPercentage', value: 0, shouldPass: true },
            { field: 'retentionPercentage', value: 100, shouldPass: true },
            { field: 'retentionPercentage', value: -10, shouldPass: false },
            { field: 'retentionPercentage', value: 110, shouldPass: false }
          ];

          for (const { field, value, shouldPass } of testCases) {
            const reinsuranceCoverage = { ...mockPortfolioData.financialSummary.reinsuranceCoverage };
            reinsuranceCoverage[field] = value;

            const data = {
              ...mockPortfolioData,
              portfolioId: `PRT-${Date.now().toString().slice(-8)}`,
              financialSummary: {
                ...mockPortfolioData.financialSummary,
                reinsuranceCoverage
              }
            };
            
            const portfolio = new Portfolio(data);
            
            if (shouldPass) {
              await expect(portfolio.save()).resolves.toBeDefined();
              await portfolio.deleteOne();
            } else {
              await expect(portfolio.save()).rejects.toThrow();
            }
          }
        });
      });

      describe('Geographic Validation', () => {
        test('should validate coordinate bounds', async () => {
          const testCases = [
            {
              bounds: {
                northEast: { latitude: 48.9991, longitude: -66.9 },
                southWest: { latitude: 24.396, longitude: -125.0 }
              },
              shouldPass: true
            },
            {
              bounds: {
                northEast: { latitude: 95.0, longitude: -66.9 }, // Invalid latitude
                southWest: { latitude: 24.396, longitude: -125.0 }
              },
              shouldPass: false
            },
            {
              bounds: {
                northEast: { latitude: 48.9991, longitude: -200.0 }, // Invalid longitude
                southWest: { latitude: 24.396, longitude: -125.0 }
              },
              shouldPass: false
            }
          ];

          for (const { bounds, shouldPass } of testCases) {
            const data = {
              ...mockPortfolioData,
              portfolioId: `PRT-${Date.now().toString().slice(-8)}`,
              geographicDistribution: {
                ...mockPortfolioData.geographicDistribution,
                boundingBox: bounds
              }
            };
            
            const portfolio = new Portfolio(data);
            
            if (shouldPass) {
              await expect(portfolio.save()).resolves.toBeDefined();
              await portfolio.deleteOne();
            } else {
              await expect(portfolio.save()).rejects.toThrow();
            }
          }
        });
      });

      describe('Performance Metrics Validation', () => {
        test('should validate ratio ranges', async () => {
          const testCases = [
            { metric: 'lossRatio', value: 0.67, shouldPass: true },
            { metric: 'lossRatio', value: -0.1, shouldPass: false },
            { metric: 'lossRatio', value: 5.0, shouldPass: false },
            { metric: 'expenseRatio', value: 0.32, shouldPass: true },
            { metric: 'combinedRatio', value: 0.99, shouldPass: true },
            { metric: 'retentionRate', value: 0.87, shouldPass: true },
            { metric: 'retentionRate', value: 1.1, shouldPass: false }
          ];

          for (const { metric, value, shouldPass } of testCases) {
            const performanceMetrics = { ...mockPortfolioData.performanceMetrics };
            performanceMetrics[metric] = value;

            const data = {
              ...mockPortfolioData,
              portfolioId: `PRT-${Date.now().toString().slice(-8)}`,
              performanceMetrics
            };
            
            const portfolio = new Portfolio(data);
            
            if (shouldPass) {
              await expect(portfolio.save()).resolves.toBeDefined();
              await portfolio.deleteOne();
            } else {
              await expect(portfolio.save()).rejects.toThrow();
            }
          }
        });
      });

      describe('Risk Characteristics Validation', () => {
        test('should validate peril weights sum to 1', async () => {
          const testCases = [
            {
              weights: { 'Hurricane': 0.4, 'Earthquake': 0.3, 'Tornado': 0.3 },
              shouldPass: true
            },
            {
              weights: { 'Hurricane': 0.5, 'Earthquake': 0.3, 'Tornado': 0.3 },
              shouldPass: false // Sum > 1
            },
            {
              weights: { 'Hurricane': 0.3, 'Earthquake': 0.2, 'Tornado': 0.2 },
              shouldPass: false // Sum < 1
            }
          ];

          for (const { weights, shouldPass } of testCases) {
            const data = {
              ...mockPortfolioData,
              portfolioId: `PRT-${Date.now().toString().slice(-8)}`,
              riskCharacteristics: {
                ...mockPortfolioData.riskCharacteristics,
                perilWeights: weights
              }
            };
            
            const portfolio = new Portfolio(data);
            
            if (shouldPass) {
              await expect(portfolio.save()).resolves.toBeDefined();
              await portfolio.deleteOne();
            } else {
              await expect(portfolio.save()).rejects.toThrow();
            }
          }
        });
      });

      describe('Data Quality Validation', () => {
        test('should validate quality scores', async () => {
          const testCases = [
            { score: 0.97, shouldPass: true },
            { score: 1.0, shouldPass: true },
            { score: 0.0, shouldPass: true },
            { score: -0.1, shouldPass: false },
            { score: 1.1, shouldPass: false }
          ];

          for (const { score, shouldPass } of testCases) {
            const data = {
              ...mockPortfolioData,
              portfolioId: `PRT-${Date.now().toString().slice(-8)}`,
              dataQuality: {
                ...mockPortfolioData.dataQuality,
                overallScore: score
              }
            };
            
            const portfolio = new Portfolio(data);
            
            if (shouldPass) {
              await expect(portfolio.save()).resolves.toBeDefined();
              await portfolio.deleteOne();
            } else {
              await expect(portfolio.save()).rejects.toThrow();
            }
          }
        });
      });

      describe('Status Validation', () => {
        test('should accept valid status values', async () => {
          const validStatuses = ['Active', 'Inactive', 'Pending', 'Archived', 'Under Review'];

          for (const status of validStatuses) {
            const data = {
              ...mockPortfolioData,
              portfolioId: `PRT-${Date.now().toString().slice(-8)}`,
              status
            };
            
            const portfolio = new Portfolio(data);
            await expect(portfolio.save()).resolves.toBeDefined();
            await portfolio.deleteOne();
          }
        });

        test('should reject invalid status values', async () => {
          const invalidStatuses = ['Unknown', 'Custom'];

          for (const status of invalidStatuses) {
            const data = { ...mockPortfolioData, status };
            const portfolio = new Portfolio(data);
            await expect(portfolio.save()).rejects.toThrow();
          }
        });
      });
    });

    describe('Unique Constraints', () => {
      test('should enforce unique portfolioId', async () => {
        const portfolio1 = new Portfolio(mockPortfolioData);
        await portfolio1.save();
        
        const duplicateData = { 
          ...mockPortfolioData,
          portfolioName: 'Different Portfolio Name'
        };
        const portfolio2 = new Portfolio(duplicateData);
        
        await expect(portfolio2.save()).rejects.toThrow(/duplicate key error/i);
      });
    });

    describe('Default Values', () => {
      test('should set default values for optional fields', async () => {
        const minimalData = {
          portfolioId: 'PRT-99999999',
          portfolioName: 'Minimal Portfolio',
          accountId: 'ACC-12345678',
          portfolioType: 'Commercial Property',
          lineOfBusiness: 'Property'
        };

        const portfolio = new Portfolio(minimalData);
        const saved = await portfolio.save();

        expect(saved.status).toBe('Active'); // Default value
        expect(saved.currency).toBe('USD'); // Default value
        expect(saved.region).toBeUndefined(); // No default
      });
    });
  });

  describe('Model Methods and Virtuals', () => {
    let testPortfolio;

    beforeEach(async () => {
      testPortfolio = new Portfolio(mockPortfolioData);
      await testPortfolio.save();
    });

    describe('Instance Methods', () => {
      test('should check if portfolio is active', async () => {
        expect(testPortfolio.isActive()).toBe(true);
        
        testPortfolio.status = 'Inactive';
        expect(testPortfolio.isActive()).toBe(false);
      });

      test('should get total insured value', async () => {
        const tiv = testPortfolio.getTotalInsuredValue();
        
        expect(tiv).toBe(mockPortfolioData.financialSummary.totalInsuredValue);
      });

      test('should get total premium', async () => {
        const premium = testPortfolio.getTotalPremium();
        
        expect(premium).toBe(mockPortfolioData.financialSummary.totalPremium);
      });

      test('should calculate premium rate', async () => {
        const rate = testPortfolio.calculatePremiumRate();
        const expectedRate = mockPortfolioData.financialSummary.totalPremium / mockPortfolioData.financialSummary.totalInsuredValue;
        
        expect(rate).toBeCloseTo(expectedRate, 6);
      });

      test('should get exposure count', async () => {
        const count = testPortfolio.getExposureCount();
        
        expect(count).toBe(mockPortfolioData.composition.totalExposures);
      });

      test('should get average exposure value', async () => {
        const avgValue = testPortfolio.getAverageExposureValue();
        
        expect(avgValue).toBe(mockPortfolioData.composition.averageExposureValue);
      });

      test('should get exposures by occupancy', async () => {
        const officeExposures = testPortfolio.getExposuresByOccupancy('Office');
        
        expect(officeExposures).toBe(mockPortfolioData.composition.exposuresByOccupancy.Office);
        expect(testPortfolio.getExposuresByOccupancy('NonExistent')).toBe(0);
      });

      test('should get exposures by construction', async () => {
        const masonryExposures = testPortfolio.getExposuresByConstruction('Masonry');
        
        expect(masonryExposures).toBe(mockPortfolioData.composition.exposuresByConstruction.Masonry);
        expect(testPortfolio.getExposuresByConstruction('NonExistent')).toBe(0);
      });

      test('should get exposures by region', async () => {
        const caExposures = testPortfolio.getExposuresByRegion('California');
        
        expect(caExposures).toBe(mockPortfolioData.composition.exposuresByRegion.California);
        expect(testPortfolio.getExposuresByRegion('NonExistent')).toBe(0);
      });

      test('should get primary perils', async () => {
        const perils = testPortfolio.getPrimaryPerils();
        
        expect(perils).toEqual(mockPortfolioData.riskCharacteristics.primaryPerils);
      });

      test('should get peril weight', async () => {
        const hurricaneWeight = testPortfolio.getPerilWeight('Hurricane');
        
        expect(hurricaneWeight).toBe(mockPortfolioData.riskCharacteristics.perilWeights.Hurricane);
        expect(testPortfolio.getPerilWeight('NonExistent')).toBe(0);
      });

      test('should calculate diversification benefit', async () => {
        const benefit = testPortfolio.calculateDiversificationBenefit();
        
        expect(typeof benefit).toBe('number');
        expect(benefit).toBeGreaterThanOrEqual(0);
      });

      test('should get geographic coverage', async () => {
        const coverage = testPortfolio.getGeographicCoverage();
        
        expect(coverage.states).toEqual(mockPortfolioData.geographicDistribution.states);
        expect(coverage.countries).toEqual(mockPortfolioData.geographicDistribution.countries);
      });

      test('should get concentration areas', async () => {
        const concentrations = testPortfolio.getConcentrationAreas();
        
        expect(concentrations).toHaveLength(2);
        expect(concentrations[0].name).toBe('Los Angeles Metro');
      });

      test('should calculate expected loss', async () => {
        const expectedLoss = testPortfolio.getExpectedLoss();
        
        expect(expectedLoss).toBe(mockPortfolioData.riskCharacteristics.riskMetrics.expectedLoss);
      });

      test('should get reinsurance coverage percentage', async () => {
        const coverage = testPortfolio.getReinsuranceCoverage();
        const expectedCoverage = 100 - mockPortfolioData.financialSummary.reinsuranceCoverage.retentionPercentage;
        
        expect(coverage).toBe(expectedCoverage);
      });

      test('should check if profitable', async () => {
        expect(testPortfolio.isProfitable()).toBe(true);
        
        testPortfolio.performanceMetrics.combinedRatio = 1.05;
        expect(testPortfolio.isProfitable()).toBe(false);
      });

      test('should get historical performance for year', async () => {
        const performance2023 = testPortfolio.getHistoricalPerformance(2023);
        
        expect(performance2023).toBeDefined();
        expect(performance2023.year).toBe(2023);
        expect(performance2023.lossRatio).toBe(0.63);
        
        expect(testPortfolio.getHistoricalPerformance(2020)).toBeNull();
      });

      test('should calculate portfolio age in days', async () => {
        const ageInDays = testPortfolio.getPortfolioAgeInDays();
        
        expect(typeof ageInDays).toBe('number');
        expect(ageInDays).toBeGreaterThan(0);
      });

      test('should check if needs review', async () => {
        // Portfolio that needs review (old model)
        const oldDate = new Date(Date.now() - 400 * 24 * 60 * 60 * 1000);
        testPortfolio.modelingConfiguration.lastModelUpdate = oldDate;
        
        expect(testPortfolio.needsModelReview()).toBe(true);
        
        // Portfolio with recent model update
        const recentDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        testPortfolio.modelingConfiguration.lastModelUpdate = recentDate;
        
        expect(testPortfolio.needsModelReview()).toBe(false);
      });

      test('should format portfolio summary', async () => {
        const summary = testPortfolio.getPortfolioSummary();
        
        expect(summary).toContain(mockPortfolioData.portfolioName);
        expect(summary).toContain(mockPortfolioData.portfolioType);
        expect(summary).toContain(mockPortfolioData.status);
      });
    });

    describe('Static Methods', () => {
      test('should find portfolios by account', async () => {
        const portfolios = await Portfolio.findByAccount(mockPortfolioData.accountId);
        
        expect(portfolios).toHaveLength(1);
        expect(portfolios[0].accountId).toBe(mockPortfolioData.accountId);
      });

      test('should find portfolios by type', async () => {
        const portfolios = await Portfolio.findByType('Commercial Property');
        
        expect(portfolios).toHaveLength(1);
        expect(portfolios[0].portfolioType).toBe('Commercial Property');
      });

      test('should find portfolios by status', async () => {
        const activePortfolios = await Portfolio.findByStatus('Active');
        
        expect(activePortfolios).toHaveLength(1);
        expect(activePortfolios[0].status).toBe('Active');
      });

      test('should find portfolios by region', async () => {
        const naPortfolios = await Portfolio.findByRegion('North America');
        
        expect(naPortfolios).toHaveLength(1);
        expect(naPortfolios[0].region).toBe('North America');
      });

      test('should find portfolios needing review', async () => {
        // Update the test portfolio to need review
        testPortfolio.modelingConfiguration.lastModelUpdate = new Date(Date.now() - 400 * 24 * 60 * 60 * 1000);
        await testPortfolio.save();
        
        const needingReview = await Portfolio.findNeedingReview();
        
        expect(needingReview.length).toBeGreaterThan(0);
      });

      test('should calculate portfolio statistics', async () => {
        const stats = await Portfolio.getPortfolioStatistics();
        
        expect(stats.totalPortfolios).toBe(1);
        expect(stats.activePortfolios).toBe(1);
        expect(stats.totalInsuredValue).toBe(mockPortfolioData.financialSummary.totalInsuredValue);
        expect(stats.totalPremium).toBe(mockPortfolioData.financialSummary.totalPremium);
      });

      test('should find large portfolios', async () => {
        const threshold = 1000000000;
        const largePortfolios = await Portfolio.findLargePortfolios(threshold);
        
        expect(largePortfolios).toHaveLength(1);
        expect(largePortfolios[0].financialSummary.totalInsuredValue).toBeGreaterThan(threshold);
      });

      test('should find profitable portfolios', async () => {
        const profitablePortfolios = await Portfolio.findProfitablePortfolios();
        
        expect(profitablePortfolios).toHaveLength(1);
        expect(profitablePortfolios[0].performanceMetrics.combinedRatio).toBeLessThan(1.0);
      });
    });

    describe('Virtual Properties', () => {
      test('should calculate portfolio age in days', async () => {
        const ageInDays = testPortfolio.portfolioAgeInDays;
        
        expect(typeof ageInDays).toBe('number');
        expect(ageInDays).toBeGreaterThan(0);
      });

      test('should calculate retention ratio', async () => {
        const retentionRatio = testPortfolio.retentionRatio;
        const expectedRatio = mockPortfolioData.financialSummary.reinsuranceCoverage.retentionPercentage / 100;
        
        expect(retentionRatio).toBe(expectedRatio);
      });

      test('should calculate diversification index', async () => {
        const diversificationIndex = testPortfolio.diversificationIndex;
        
        expect(typeof diversificationIndex).toBe('number');
        expect(diversificationIndex).toBeGreaterThan(0);
      });

      test('should get dominant occupancy', async () => {
        const dominantOccupancy = testPortfolio.dominantOccupancy;
        
        expect(dominantOccupancy).toBe('Office'); // Highest count in mock data
      });

      test('should get dominant construction type', async () => {
        const dominantConstruction = testPortfolio.dominantConstruction;
        
        expect(dominantConstruction).toBe('Masonry'); // Highest count in mock data
      });

      test('should get dominant region', async () => {
        const dominantRegion = testPortfolio.dominantRegion;
        
        expect(dominantRegion).toBe('California'); // Highest count in mock data
      });
    });
  });

  describe('Business Logic Validation', () => {
    test('should validate financial consistency', async () => {
      const portfolio = new Portfolio(mockPortfolioData);
      await portfolio.save();

      // Total insured value should be reasonable compared to premium
      const premiumRate = portfolio.financialSummary.totalPremium / portfolio.financialSummary.totalInsuredValue;
      expect(premiumRate).toBeGreaterThan(0.001); // At least 0.1%
      expect(premiumRate).toBeLessThan(0.1); // At most 10%
    });

    test('should validate composition consistency', async () => {
      const portfolio = new Portfolio(mockPortfolioData);
      await portfolio.save();

      // Sum of exposures by occupancy should equal total exposures
      const occupancySum = Object.values(portfolio.composition.exposuresByOccupancy).reduce((sum, count) => sum + count, 0);
      expect(occupancySum).toBe(portfolio.composition.totalExposures);

      // Sum of exposures by construction should equal total exposures  
      const constructionSum = Object.values(portfolio.composition.exposuresByConstruction).reduce((sum, count) => sum + count, 0);
      expect(constructionSum).toBe(portfolio.composition.totalExposures);

      // Sum of exposures by region should equal total exposures
      const regionSum = Object.values(portfolio.composition.exposuresByRegion).reduce((sum, count) => sum + count, 0);
      expect(regionSum).toBe(portfolio.composition.totalExposures);
    });

    test('should validate peril weight consistency', async () => {
      const portfolio = new Portfolio(mockPortfolioData);
      await portfolio.save();

      const weightSum = Object.values(portfolio.riskCharacteristics.perilWeights).reduce((sum, weight) => sum + weight, 0);
      expect(weightSum).toBeCloseTo(1.0, 2);
    });

    test('should validate performance metrics consistency', async () => {
      const portfolio = new Portfolio(mockPortfolioData);
      await portfolio.save();

      // Combined ratio should equal loss ratio + expense ratio
      const calculatedCombined = portfolio.performanceMetrics.lossRatio + portfolio.performanceMetrics.expenseRatio;
      expect(calculatedCombined).toBeCloseTo(portfolio.performanceMetrics.combinedRatio, 2);
    });

    test('should validate reinsurance coverage consistency', async () => {
      const portfolio = new Portfolio(mockPortfolioData);
      await portfolio.save();

      const reinsurance = portfolio.financialSummary.reinsuranceCoverage;
      const cededValue = reinsurance.totalCeded;
      const totalValue = portfolio.financialSummary.totalInsuredValue;
      const retentionPercentage = reinsurance.retentionPercentage;

      // Ceded amount should be consistent with retention percentage
      const expectedRetained = totalValue * (retentionPercentage / 100);
      const actualRetained = totalValue - cededValue;
      
      expect(actualRetained).toBeCloseTo(expectedRetained, -6); // Within $1M
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle missing optional nested objects', async () => {
      const minimalData = {
        portfolioId: 'PRT-77777777',
        portfolioName: 'Minimal Portfolio',
        accountId: 'ACC-12345678',
        portfolioType: 'Commercial Property',
        lineOfBusiness: 'Property'
      };

      const portfolio = new Portfolio(minimalData);
      const saved = await portfolio.save();

      expect(saved.composition).toBeUndefined();
      expect(saved.geographicDistribution).toBeUndefined();
      expect(saved.riskCharacteristics).toBeUndefined();
    });

    test('should handle special characters in text fields', async () => {
      const specialCharData = {
        ...mockPortfolioData,
        portfolioId: 'PRT-88888888',
        portfolioName: 'Portfólio Comercial São Paulo',
        portfolioDescription: 'Análisis de riesgo & evaluación'
      };

      const portfolio = new Portfolio(specialCharData);
      const saved = await portfolio.save();

      expect(saved.portfolioName).toBe('Portfólio Comercial São Paulo');
      expect(saved.portfolioDescription).toBe('Análisis de riesgo & evaluación');
    });

    test('should handle very large portfolios', async () => {
      const largePortfolioData = {
        ...mockPortfolioData,
        portfolioId: 'PRT-99999999',
        composition: {
          ...mockPortfolioData.composition,
          totalExposures: 1000000,
          totalInsuredValue: 1000000000000 // $1 trillion
        },
        financialSummary: {
          ...mockPortfolioData.financialSummary,
          totalInsuredValue: 1000000000000,
          totalPremium: 15000000000 // $15 billion
        }
      };

      const portfolio = new Portfolio(largePortfolioData);
      await expect(portfolio.save()).resolves.toBeDefined();
    });
  });

  describe('Performance Tests', () => {
    test('should handle bulk portfolio operations efficiently', async () => {
      const bulkData = Array.from({ length: 15 }, (_, i) => ({
        portfolioId: `PRT-${String(i).padStart(8, '0')}`,
        portfolioName: `Test Portfolio ${i}`,
        accountId: `ACC-${String(i).padStart(8, '0')}`,
        portfolioType: 'Commercial Property',
        lineOfBusiness: 'Property',
        region: 'North America',
        currency: 'USD',
        composition: {
          totalExposures: 1000 + (i * 100),
          totalInsuredValue: 100000000 + (i * 10000000),
          averageExposureValue: 100000 + (i * 10000)
        },
        financialSummary: {
          totalInsuredValue: 100000000 + (i * 10000000),
          totalPremium: 1500000 + (i * 150000),
          averagePremiumRate: 0.015 + (i * 0.001)
        },
        status: 'Active'
      }));

      const startTime = Date.now();
      await Portfolio.insertMany(bulkData);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(3000); // Should complete in less than 3 seconds
      
      // Verify all records were inserted
      const count = await Portfolio.countDocuments();
      expect(count).toBe(15);
    });

    test('should perform complex portfolio aggregations efficiently', async () => {
      // Insert diverse test data
      const portfolioTypes = ['Commercial Property', 'Personal Property', 'Commercial Auto'];
      const regions = ['North America', 'Europe', 'Asia Pacific'];
      
      const testData = Array.from({ length: 30 }, (_, i) => ({
        portfolioId: `PRT-${String(i).padStart(8, '0')}`,
        portfolioName: `Portfolio ${i}`,
        accountId: `ACC-${String(i % 10).padStart(8, '0')}`,
        portfolioType: portfolioTypes[i % portfolioTypes.length],
        lineOfBusiness: 'Property',
        region: regions[i % regions.length],
        currency: 'USD',
        composition: {
          totalExposures: 1000 + (i * 500),
          totalInsuredValue: 100000000 + (i * 50000000),
          averageExposureValue: 100000 + (i * 50000)
        },
        financialSummary: {
          totalInsuredValue: 100000000 + (i * 50000000),
          totalPremium: 1500000 + (i * 750000),
          averagePremiumRate: 0.015 + (i * 0.0005)
        },
        performanceMetrics: {
          lossRatio: 0.6 + (i * 0.01),
          expenseRatio: 0.3 + (i * 0.005),
          combinedRatio: 0.9 + (i * 0.015)
        },
        status: 'Active'
      }));

      await Portfolio.insertMany(testData);

      const startTime = Date.now();
      const aggregation = await Portfolio.aggregate([
        {
          $group: {
            _id: {
              portfolioType: '$portfolioType',
              region: '$region'
            },
            count: { $sum: 1 },
            totalInsuredValue: { $sum: '$financialSummary.totalInsuredValue' },
            totalPremium: { $sum: '$financialSummary.totalPremium' },
            avgLossRatio: { $avg: '$performanceMetrics.lossRatio' },
            avgCombinedRatio: { $avg: '$performanceMetrics.combinedRatio' }
          }
        },
        { $sort: { totalInsuredValue: -1 } }
      ]);
      const endTime = Date.now();

      expect(aggregation.length).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(1000); // Should be fast
    });
  });
});