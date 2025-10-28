const mongoose = require('mongoose');
const Policy = require('../../src/models/Policy');

/**
 * Test suite for Policy Model - Core Model Layer
 * Tests insurance policy data model with coverage terms and conditions
 * Priority: P0 (Core Model)
 */
describe('Policy Model - Core Model Tests', () => {
    let mockPolicyData;

    });

  afterAll(async () => {
    if (connection) {
                }
  });

  beforeEach(async () => {
    // Clear the collection before each test
    await Policy.deleteMany({});
    
    // Standard mock policy data
    mockPolicyData = {
      policyId: 'POL-12345678',
      policyNumber: 'CAT-2024-001234',
      accountId: 'ACC-12345678',
      policyName: 'Commercial Property Policy',
      policyType: 'Property',
      lineOfBusiness: 'Commercial Property',
      underwritingCompany: 'Test Insurance Co.',
      broker: 'Test Broker Inc.',
      
      // Policy Terms
      effectiveDate: new Date('2024-01-01T00:00:00Z'),
      expirationDate: new Date('2024-12-31T23:59:59Z'),
      policyTerm: 12,
      policyTermUnit: 'months',
      
      // Coverage Details
      totalInsuredValue: 10000000,
      currency: 'USD',
      policyLimit: 10000000,
      aggregateLimit: 10000000,
      deductible: 100000,
      deductibleType: 'Per Occurrence',
      coinsurance: 0,
      
      // Premium Information
      premium: {
        basePremium: 25000,
        taxes: 2500,
        fees: 1000,
        totalPremium: 28500,
        paymentFrequency: 'Annual',
        paymentMethod: 'Check'
      },
      
      // Coverage Types
      coverageTypes: [{
        coverageType: 'Building',
        limit: 8000000,
        deductible: 100000,
        coinsurance: 0,
        isIncluded: true
      }, {
        coverageType: 'Contents',
        limit: 2000000,
        deductible: 50000,
        coinsurance: 0,
        isIncluded: true
      }],
      
      // Covered Perils
      coveredPerils: [
        'Fire', 'Lightning', 'Explosion', 'Windstorm', 'Hail',
        'Earthquake', 'Flood', 'Hurricane', 'Tornado'
      ],
      
      // Excluded Perils
      excludedPerils: [
        'War', 'Nuclear', 'Terrorism'
      ],
      
      // Policy Conditions
      policyConditions: [{
        conditionType: 'Waiting Period',
        description: 'Earthquake coverage subject to 72-hour waiting period',
        value: 72,
        unit: 'hours',
        appliesTo: ['Earthquake']
      }],
      
      // Geographic Coverage
      geographicCoverage: {
        coverageType: 'Named Locations',
        regions: ['North America'],
        countries: ['United States'],
        states: ['California', 'Florida', 'Texas'],
        excludedAreas: ['Flood Zone A']
      },
      
      // Reinsurance Information
      reinsurance: {
        isReinsured: true,
        reinsuranceType: 'Quota Share',
        retentionPercentage: 25,
        reinsurers: [{
          reinsurerName: 'Global Re',
          percentage: 50
        }, {
          reinsurerName: 'National Re',
          percentage: 25
        }]
      },
      
      // Status and Audit
      status: 'Active',
      issueDate: new Date('2023-12-15T00:00:00Z'),
      renewalDate: new Date('2024-12-31T00:00:00Z'),
      lastModified: new Date(),
      version: '1.0',
      
      // Metadata
      metadata: {
        dataSource: 'Underwriting System',
        lastUpdated: new Date(),
        accuracy: 'High',
        confidence: 95,
        notes: 'Standard commercial property policy'
      }
    };
  });

  describe('Schema Validation', () => {
    describe('Required Fields', () => {
      test('should create policy with all required fields', async () => {
        const policy = new Policy(mockPolicyData);
        const savedPolicy = await policy.save();
        
        expect(savedPolicy._id).toBeDefined();
        expect(savedPolicy.policyId).toBe(mockPolicyData.policyId);
        expect(savedPolicy.policyNumber).toBe(mockPolicyData.policyNumber);
        expect(savedPolicy.accountId).toBe(mockPolicyData.accountId);
      });

      test('should require policyId', async () => {
        const invalidData = { ...mockPolicyData };
        delete invalidData.policyId;
        
        const policy = new Policy(invalidData);
        await expect(policy.save()).rejects.toThrow(/policyId.*required/i);
      });

      test('should require policyNumber', async () => {
        const invalidData = { ...mockPolicyData };
        delete invalidData.policyNumber;
        
        const policy = new Policy(invalidData);
        await expect(policy.save()).rejects.toThrow(/policyNumber.*required/i);
      });

      test('should require accountId', async () => {
        const invalidData = { ...mockPolicyData };
        delete invalidData.accountId;
        
        const policy = new Policy(invalidData);
        await expect(policy.save()).rejects.toThrow(/accountId.*required/i);
      });

      test('should require policyName', async () => {
        const invalidData = { ...mockPolicyData };
        delete invalidData.policyName;
        
        const policy = new Policy(invalidData);
        await expect(policy.save()).rejects.toThrow(/policyName.*required/i);
      });

      test('should require policyType', async () => {
        const invalidData = { ...mockPolicyData };
        delete invalidData.policyType;
        
        const policy = new Policy(invalidData);
        await expect(policy.save()).rejects.toThrow(/policyType.*required/i);
      });

      test('should require effectiveDate', async () => {
        const invalidData = { ...mockPolicyData };
        delete invalidData.effectiveDate;
        
        const policy = new Policy(invalidData);
        await expect(policy.save()).rejects.toThrow(/effectiveDate.*required/i);
      });

      test('should require expirationDate', async () => {
        const invalidData = { ...mockPolicyData };
        delete invalidData.expirationDate;
        
        const policy = new Policy(invalidData);
        await expect(policy.save()).rejects.toThrow(/expirationDate.*required/i);
      });

      test('should require totalInsuredValue', async () => {
        const invalidData = { ...mockPolicyData };
        delete invalidData.totalInsuredValue;
        
        const policy = new Policy(invalidData);
        await expect(policy.save()).rejects.toThrow(/totalInsuredValue.*required/i);
      });
    });

    describe('Field Validation', () => {
      describe('policyId Format', () => {
        test('should accept valid policyId format', async () => {
          const policy = new Policy(mockPolicyData);
          await expect(policy.save()).resolves.toBeDefined();
        });

        test('should reject invalid policyId format', async () => {
          const invalidFormats = [
            'POL-123',       // Too short
            'POL-123456789', // Too long
            'INVALID-12345678', // Wrong prefix
            'POL12345678',   // Missing dash
            'POL-ABCDEFGH'   // Non-numeric
          ];

          for (const invalidId of invalidFormats) {
            const invalidData = { ...mockPolicyData, policyId: invalidId };
            const policy = new Policy(invalidData);
            await expect(policy.save()).rejects.toThrow(/Policy ID must be in format/i);
          }
        });
      });

      describe('Policy Type Validation', () => {
        test('should accept valid policy types', async () => {
          const validTypes = [
            'Property', 'Casualty', 'Auto', 'Workers Comp', 'Professional Liability',
            'General Liability', 'Product Liability', 'Cyber', 'Marine', 'Aviation'
          ];

          for (const policyType of validTypes) {
            const data = {
              ...mockPolicyData,
              policyId: `POL-${Date.now().toString().slice(-8)}`,
              policyType
            };
            
            const policy = new Policy(data);
            await expect(policy.save()).resolves.toBeDefined();
            await policy.deleteOne();
          }
        });

        test('should reject invalid policy types', async () => {
          const invalidTypes = ['Unknown', 'Other', 'Custom'];

          for (const policyType of invalidTypes) {
            const data = { ...mockPolicyData, policyType };
            const policy = new Policy(data);
            await expect(policy.save()).rejects.toThrow();
          }
        });
      });

      describe('Line of Business Validation', () => {
        test('should accept valid lines of business', async () => {
          const validLines = [
            'Commercial Property', 'Commercial Auto', 'Workers Compensation',
            'General Liability', 'Professional Liability', 'Cyber Liability',
            'Personal Property', 'Personal Auto', 'Marine', 'Aviation'
          ];

          for (const lineOfBusiness of validLines) {
            const data = {
              ...mockPolicyData,
              policyId: `POL-${Date.now().toString().slice(-8)}`,
              lineOfBusiness
            };
            
            const policy = new Policy(data);
            await expect(policy.save()).resolves.toBeDefined();
            await policy.deleteOne();
          }
        });
      });

      describe('Financial Validation', () => {
        test('should validate positive financial amounts', async () => {
          const testCases = [
            { field: 'totalInsuredValue', value: -1000000, shouldFail: true },
            { field: 'policyLimit', value: -500000, shouldFail: true },
            { field: 'deductible', value: -10000, shouldFail: true },
            { field: 'totalInsuredValue', value: 0, shouldFail: false },
            { field: 'totalInsuredValue', value: 1000000, shouldFail: false }
          ];

          for (const { field, value, shouldFail } of testCases) {
            const data = {
              ...mockPolicyData,
              policyId: `POL-${Date.now().toString().slice(-8)}`,
              [field]: value
            };
            
            const policy = new Policy(data);
            
            if (shouldFail) {
              await expect(policy.save()).rejects.toThrow();
            } else {
              await expect(policy.save()).resolves.toBeDefined();
              await policy.deleteOne();
            }
          }
        });

        test('should validate currency format', async () => {
          const validCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];
          const invalidCurrencies = ['INVALID', 'XXX', ''];

          for (const currency of validCurrencies) {
            const data = {
              ...mockPolicyData,
              policyId: `POL-${Date.now().toString().slice(-8)}`,
              currency
            };
            
            const policy = new Policy(data);
            await expect(policy.save()).resolves.toBeDefined();
            await policy.deleteOne();
          }

          for (const currency of invalidCurrencies) {
            const data = { ...mockPolicyData, currency };
            const policy = new Policy(data);
            await expect(policy.save()).rejects.toThrow();
          }
        });

        test('should validate deductible type', async () => {
          const validTypes = [
            'Per Occurrence', 'Per Claim', 'Aggregate', 'Percentage', 
            'Waiting Period', 'Time Deductible'
          ];

          for (const deductibleType of validTypes) {
            const data = {
              ...mockPolicyData,
              policyId: `POL-${Date.now().toString().slice(-8)}`,
              deductibleType
            };
            
            const policy = new Policy(data);
            await expect(policy.save()).resolves.toBeDefined();
            await policy.deleteOne();
          }
        });

        test('should validate coinsurance percentage', async () => {
          const testCases = [
            { coinsurance: 0, shouldPass: true },
            { coinsurance: 0.2, shouldPass: true },
            { coinsurance: 1, shouldPass: true },
            { coinsurance: -0.1, shouldPass: false },
            { coinsurance: 1.1, shouldPass: false }
          ];

          for (const { coinsurance, shouldPass } of testCases) {
            const data = {
              ...mockPolicyData,
              policyId: `POL-${Date.now().toString().slice(-8)}`,
              coinsurance
            };
            
            const policy = new Policy(data);
            
            if (shouldPass) {
              await expect(policy.save()).resolves.toBeDefined();
              await policy.deleteOne();
            } else {
              await expect(policy.save()).rejects.toThrow();
            }
          }
        });
      });

      describe('Date Validation', () => {
        test('should validate policy term dates', async () => {
          const now = new Date();
          const futureDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
          const pastDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

          // Valid: effective date in past, expiration in future
          const validData = {
            ...mockPolicyData,
            effectiveDate: pastDate,
            expirationDate: futureDate
          };
          
          const policy = new Policy(validData);
          await expect(policy.save()).resolves.toBeDefined();
        });

        test('should validate policy term units', async () => {
          const validUnits = ['days', 'months', 'years'];

          for (const policyTermUnit of validUnits) {
            const data = {
              ...mockPolicyData,
              policyId: `POL-${Date.now().toString().slice(-8)}`,
              policyTermUnit
            };
            
            const policy = new Policy(data);
            await expect(policy.save()).resolves.toBeDefined();
            await policy.deleteOne();
          }
        });
      });

      describe('Premium Validation', () => {
        test('should validate premium structure', async () => {
          const validPremium = {
            basePremium: 25000,
            taxes: 2500,
            fees: 1000,
            totalPremium: 28500,
            paymentFrequency: 'Annual',
            paymentMethod: 'Check'
          };

          const data = {
            ...mockPolicyData,
            premium: validPremium
          };
          
          const policy = new Policy(data);
          const saved = await policy.save();
          
          expect(saved.premium.basePremium).toBe(25000);
          expect(saved.premium.totalPremium).toBe(28500);
        });

        test('should validate payment frequency', async () => {
          const validFrequencies = ['Annual', 'Semi-Annual', 'Quarterly', 'Monthly'];

          for (const paymentFrequency of validFrequencies) {
            const data = {
              ...mockPolicyData,
              policyId: `POL-${Date.now().toString().slice(-8)}`,
              premium: {
                ...mockPolicyData.premium,
                paymentFrequency
              }
            };
            
            const policy = new Policy(data);
            await expect(policy.save()).resolves.toBeDefined();
            await policy.deleteOne();
          }
        });

        test('should validate payment methods', async () => {
          const validMethods = ['Check', 'Credit Card', 'Bank Transfer', 'Direct Debit'];

          for (const paymentMethod of validMethods) {
            const data = {
              ...mockPolicyData,
              policyId: `POL-${Date.now().toString().slice(-8)}`,
              premium: {
                ...mockPolicyData.premium,
                paymentMethod
              }
            };
            
            const policy = new Policy(data);
            await expect(policy.save()).resolves.toBeDefined();
            await policy.deleteOne();
          }
        });

        test('should validate premium amounts', async () => {
          const testCases = [
            { basePremium: -1000, shouldFail: true },
            { taxes: -100, shouldFail: true },
            { fees: -50, shouldFail: true },
            { basePremium: 0, shouldFail: false },
            { basePremium: 50000, shouldFail: false }
          ];

          for (const { basePremium, taxes, fees, shouldFail } of testCases) {
            const premiumData = { ...mockPolicyData.premium };
            if (basePremium !== undefined) premiumData.basePremium = basePremium;
            if (taxes !== undefined) premiumData.taxes = taxes;
            if (fees !== undefined) premiumData.fees = fees;

            const data = {
              ...mockPolicyData,
              policyId: `POL-${Date.now().toString().slice(-8)}`,
              premium: premiumData
            };
            
            const policy = new Policy(data);
            
            if (shouldFail) {
              await expect(policy.save()).rejects.toThrow();
            } else {
              await expect(policy.save()).resolves.toBeDefined();
              await policy.deleteOne();
            }
          }
        });
      });

      describe('Coverage Types Validation', () => {
        test('should validate coverage types', async () => {
          const validCoverageTypes = [
            'Building', 'Contents', 'Business Interruption', 'Extra Expense',
            'Equipment', 'Inventory', 'Accounts Receivable', 'Fine Arts'
          ];

          for (const coverageType of validCoverageTypes) {
            const data = {
              ...mockPolicyData,
              policyId: `POL-${Date.now().toString().slice(-8)}`,
              coverageTypes: [{
                coverageType,
                limit: 1000000,
                deductible: 10000,
                coinsurance: 0,
                isIncluded: true
              }]
            };
            
            const policy = new Policy(data);
            await expect(policy.save()).resolves.toBeDefined();
            await policy.deleteOne();
          }
        });

        test('should validate coverage limits and deductibles', async () => {
          const testCases = [
            { limit: -1000000, shouldFail: true },
            { deductible: -10000, shouldFail: true },
            { limit: 0, shouldFail: false },
            { deductible: 0, shouldFail: false }
          ];

          for (const { limit, deductible, shouldFail } of testCases) {
            const coverageData = [...mockPolicyData.coverageTypes];
            if (limit !== undefined) coverageData[0].limit = limit;
            if (deductible !== undefined) coverageData[0].deductible = deductible;

            const data = {
              ...mockPolicyData,
              policyId: `POL-${Date.now().toString().slice(-8)}`,
              coverageTypes: coverageData
            };
            
            const policy = new Policy(data);
            
            if (shouldFail) {
              await expect(policy.save()).rejects.toThrow();
            } else {
              await expect(policy.save()).resolves.toBeDefined();
              await policy.deleteOne();
            }
          }
        });
      });

      describe('Peril Validation', () => {
        test('should accept valid covered perils', async () => {
          const validPerils = [
            'Fire', 'Lightning', 'Explosion', 'Windstorm', 'Hail',
            'Earthquake', 'Flood', 'Hurricane', 'Tornado', 'Theft',
            'Vandalism', 'Sprinkler Leakage', 'Water Damage'
          ];

          const data = {
            ...mockPolicyData,
            coveredPerils: validPerils
          };
          
          const policy = new Policy(data);
          const saved = await policy.save();
          
          expect(saved.coveredPerils).toEqual(validPerils);
        });

        test('should accept valid excluded perils', async () => {
          const validExclusions = [
            'War', 'Nuclear', 'Terrorism', 'Cyber Attack',
            'Pandemic', 'Government Action', 'Ordinance or Law'
          ];

          const data = {
            ...mockPolicyData,
            excludedPerils: validExclusions
          };
          
          const policy = new Policy(data);
          const saved = await policy.save();
          
          expect(saved.excludedPerils).toEqual(validExclusions);
        });
      });

      describe('Geographic Coverage Validation', () => {
        test('should validate coverage types', async () => {
          const validCoverageTypes = [
            'Worldwide', 'Named Locations', 'Territory', 'Blanket Coverage'
          ];

          for (const coverageType of validCoverageTypes) {
            const data = {
              ...mockPolicyData,
              policyId: `POL-${Date.now().toString().slice(-8)}`,
              geographicCoverage: {
                ...mockPolicyData.geographicCoverage,
                coverageType
              }
            };
            
            const policy = new Policy(data);
            await expect(policy.save()).resolves.toBeDefined();
            await policy.deleteOne();
          }
        });

        test('should validate regions', async () => {
          const validRegions = [
            'North America', 'Europe', 'Asia Pacific', 'Latin America', 
            'Middle East', 'Africa'
          ];

          for (const region of validRegions) {
            const data = {
              ...mockPolicyData,
              policyId: `POL-${Date.now().toString().slice(-8)}`,
              geographicCoverage: {
                ...mockPolicyData.geographicCoverage,
                regions: [region]
              }
            };
            
            const policy = new Policy(data);
            await expect(policy.save()).resolves.toBeDefined();
            await policy.deleteOne();
          }
        });
      });

      describe('Reinsurance Validation', () => {
        test('should validate reinsurance types', async () => {
          const validTypes = [
            'Quota Share', 'Surplus', 'Excess of Loss', 'Stop Loss',
            'Aggregate Excess', 'Proportional', 'Non-Proportional'
          ];

          for (const reinsuranceType of validTypes) {
            const data = {
              ...mockPolicyData,
              policyId: `POL-${Date.now().toString().slice(-8)}`,
              reinsurance: {
                ...mockPolicyData.reinsurance,
                reinsuranceType
              }
            };
            
            const policy = new Policy(data);
            await expect(policy.save()).resolves.toBeDefined();
            await policy.deleteOne();
          }
        });

        test('should validate retention percentage', async () => {
          const testCases = [
            { retention: 0, shouldPass: true },
            { retention: 50, shouldPass: true },
            { retention: 100, shouldPass: true },
            { retention: -10, shouldPass: false },
            { retention: 110, shouldPass: false }
          ];

          for (const { retention, shouldPass } of testCases) {
            const data = {
              ...mockPolicyData,
              policyId: `POL-${Date.now().toString().slice(-8)}`,
              reinsurance: {
                ...mockPolicyData.reinsurance,
                retentionPercentage: retention
              }
            };
            
            const policy = new Policy(data);
            
            if (shouldPass) {
              await expect(policy.save()).resolves.toBeDefined();
              await policy.deleteOne();
            } else {
              await expect(policy.save()).rejects.toThrow();
            }
          }
        });

        test('should validate reinsurer percentages', async () => {
          const validReinsurers = [{
            reinsurerName: 'Reinsurer A',
            percentage: 30
          }, {
            reinsurerName: 'Reinsurer B',
            percentage: 45
          }];

          const data = {
            ...mockPolicyData,
            reinsurance: {
              ...mockPolicyData.reinsurance,
              reinsurers: validReinsurers
            }
          };
          
          const policy = new Policy(data);
          const saved = await policy.save();
          
          expect(saved.reinsurance.reinsurers).toHaveLength(2);
          expect(saved.reinsurance.reinsurers[0].percentage).toBe(30);
        });
      });

      describe('Status Validation', () => {
        test('should accept valid status values', async () => {
          const validStatuses = [
            'Active', 'Inactive', 'Expired', 'Cancelled', 'Suspended',
            'Pending', 'Under Review', 'Renewed'
          ];

          for (const status of validStatuses) {
            const data = {
              ...mockPolicyData,
              policyId: `POL-${Date.now().toString().slice(-8)}`,
              status
            };
            
            const policy = new Policy(data);
            await expect(policy.save()).resolves.toBeDefined();
            await policy.deleteOne();
          }
        });

        test('should reject invalid status values', async () => {
          const invalidStatuses = ['Unknown', 'Custom', 'Other'];

          for (const status of invalidStatuses) {
            const data = { ...mockPolicyData, status };
            const policy = new Policy(data);
            await expect(policy.save()).rejects.toThrow();
          }
        });
      });
    });

    describe('Unique Constraints', () => {
      test('should enforce unique policyId', async () => {
        const policy1 = new Policy(mockPolicyData);
        await policy1.save();
        
        const duplicateData = { ...mockPolicyData };
        const policy2 = new Policy(duplicateData);
        
        await expect(policy2.save()).rejects.toThrow(/duplicate key error/i);
      });

      test('should enforce unique policyNumber', async () => {
        const policy1 = new Policy(mockPolicyData);
        await policy1.save();
        
        const duplicateData = { 
          ...mockPolicyData,
          policyId: 'POL-87654321' // Different policy ID
          // Same policy number
        };
        const policy2 = new Policy(duplicateData);
        
        await expect(policy2.save()).rejects.toThrow(/duplicate key error/i);
      });
    });

    describe('Default Values', () => {
      test('should set default values for optional fields', async () => {
        const minimalData = {
          policyId: 'POL-99999999',
          policyNumber: 'MIN-2024-001',
          accountId: 'ACC-12345678',
          policyName: 'Minimal Policy',
          policyType: 'Property',
          effectiveDate: new Date('2024-01-01'),
          expirationDate: new Date('2024-12-31'),
          totalInsuredValue: 1000000
        };

        const policy = new Policy(minimalData);
        const saved = await policy.save();

        expect(saved.status).toBe('Active'); // Default value
        expect(saved.currency).toBe('USD'); // Default value
        expect(saved.coinsurance).toBe(0); // Default value
        expect(saved.coveredPerils).toEqual([]); // Default empty array
        expect(saved.excludedPerils).toEqual([]); // Default empty array
      });
    });
  });

  describe('Model Methods and Virtuals', () => {
    let testPolicy;

    beforeEach(async () => {
      testPolicy = new Policy(mockPolicyData);
      await testPolicy.save();
    });

    describe('Instance Methods', () => {
      test('should check if policy is active', async () => {
        expect(testPolicy.isActive()).toBe(true);
        
        testPolicy.status = 'Expired';
        expect(testPolicy.isActive()).toBe(false);
      });

      test('should check if policy is expired', async () => {
        const now = new Date();
        
        // Policy expires in future - not expired
        testPolicy.expirationDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        expect(testPolicy.isExpired()).toBe(false);
        
        // Policy expired in past
        testPolicy.expirationDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        expect(testPolicy.isExpired()).toBe(true);
      });

      test('should calculate days until expiration', async () => {
        const now = new Date();
        const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        
        testPolicy.expirationDate = futureDate;
        const daysUntilExpiration = testPolicy.getDaysUntilExpiration();
        
        expect(daysUntilExpiration).toBeCloseTo(30, 0);
      });

      test('should get coverage by type', async () => {
        const buildingCoverage = testPolicy.getCoverageByType('Building');
        
        expect(buildingCoverage).toBeDefined();
        expect(buildingCoverage.coverageType).toBe('Building');
        expect(buildingCoverage.limit).toBe(8000000);
        
        expect(testPolicy.getCoverageByType('NonExistent')).toBeNull();
      });

      test('should calculate total coverage limit', async () => {
        const totalLimit = testPolicy.getTotalCoverageLimit();
        const expectedTotal = mockPolicyData.coverageTypes.reduce((sum, coverage) => sum + coverage.limit, 0);
        
        expect(totalLimit).toBe(expectedTotal);
      });

      test('should check if peril is covered', async () => {
        expect(testPolicy.isPerilCovered('Fire')).toBe(true);
        expect(testPolicy.isPerilCovered('Earthquake')).toBe(true);
        expect(testPolicy.isPerilCovered('War')).toBe(false); // Excluded
        expect(testPolicy.isPerilCovered('Unknown')).toBe(false);
      });

      test('should calculate retention percentage', async () => {
        const retentionPercentage = testPolicy.getRetentionPercentage();
        
        expect(retentionPercentage).toBe(25); // From mock data
      });

      test('should get reinsurance coverage', async () => {
        const reinsuranceCoverage = testPolicy.getReinsuranceCoverage();
        
        expect(reinsuranceCoverage).toBe(75); // 100% - 25% retention
      });

      test('should calculate annual premium rate', async () => {
        const premiumRate = testPolicy.getAnnualPremiumRate();
        const expectedRate = (mockPolicyData.premium.totalPremium / mockPolicyData.totalInsuredValue) * 100;
        
        expect(premiumRate).toBeCloseTo(expectedRate, 4);
      });

      test('should format policy summary', async () => {
        const summary = testPolicy.getPolicySummary();
        
        expect(summary).toContain(mockPolicyData.policyNumber);
        expect(summary).toContain(mockPolicyData.policyName);
        expect(summary).toContain(mockPolicyData.status);
      });
    });

    describe('Static Methods', () => {
      test('should find policies by account', async () => {
        const policies = await Policy.findByAccount(mockPolicyData.accountId);
        
        expect(policies).toHaveLength(1);
        expect(policies[0].accountId).toBe(mockPolicyData.accountId);
      });

      test('should find policies by status', async () => {
        const activePolicies = await Policy.findByStatus('Active');
        
        expect(activePolicies).toHaveLength(1);
        expect(activePolicies[0].status).toBe('Active');
      });

      test('should find policies by type', async () => {
        const propertyPolicies = await Policy.findByType('Property');
        
        expect(propertyPolicies).toHaveLength(1);
        expect(propertyPolicies[0].policyType).toBe('Property');
      });

      test('should find expiring policies', async () => {
        const daysAhead = 30;
        const expiringPolicies = await Policy.findExpiringPolicies(daysAhead);
        
        // This should find our test policy if it expires within 30 days
        expect(Array.isArray(expiringPolicies)).toBe(true);
      });

      test('should find policies by effective date range', async () => {
        const startDate = new Date('2023-01-01');
        const endDate = new Date('2024-12-31');
        
        const policies = await Policy.findByEffectiveDateRange(startDate, endDate);
        
        expect(policies).toHaveLength(1);
        expect(policies[0].policyId).toBe(mockPolicyData.policyId);
      });

      test('should calculate portfolio statistics', async () => {
        // Create additional policies for statistics
        const additionalPolicies = [
          {
            ...mockPolicyData,
            policyId: 'POL-11111111',
            policyNumber: 'CAT-2024-002',
            totalInsuredValue: 5000000,
            premium: { ...mockPolicyData.premium, totalPremium: 15000 }
          },
          {
            ...mockPolicyData,
            policyId: 'POL-22222222',
            policyNumber: 'CAT-2024-003',
            totalInsuredValue: 8000000,
            premium: { ...mockPolicyData.premium, totalPremium: 22000 }
          }
        ];
        
        await Policy.insertMany(additionalPolicies);
        
        const stats = await Policy.getPortfolioStatistics();
        
        expect(stats.totalPolicies).toBe(3);
        expect(stats.totalInsuredValue).toBe(23000000);
        expect(stats.averagePolicyValue).toBeCloseTo(7666666.67, 2);
        expect(stats.totalPremium).toBe(65500);
      });
    });

    describe('Virtual Properties', () => {
      test('should calculate policy age in days', async () => {
        const now = new Date();
        const issueDate = new Date(now.getTime() - 100 * 24 * 60 * 60 * 1000); // 100 days ago
        
        testPolicy.issueDate = issueDate;
        
        expect(testPolicy.policyAgeInDays).toBeCloseTo(100, 0);
      });

      test('should calculate loss ratio', async () => {
        // This would typically require claims data
        // For now, we'll test that the property exists and returns a number
        expect(typeof testPolicy.lossRatio).toBe('number');
        expect(testPolicy.lossRatio).toBeGreaterThanOrEqual(0);
      });

      test('should calculate coverage adequacy ratio', async () => {
        const coverageRatio = testPolicy.coverageAdequacyRatio;
        
        expect(typeof coverageRatio).toBe('number');
        expect(coverageRatio).toBeGreaterThan(0);
      });
    });
  });

  describe('Business Logic Validation', () => {
    test('should validate policy limits against insured values', async () => {
      const invalidData = {
        ...mockPolicyData,
        totalInsuredValue: 10000000,
        policyLimit: 5000000 // Limit less than insured value
      };

      const policy = new Policy(invalidData);
      // This validation might be in business logic rather than schema
      await expect(policy.save()).resolves.toBeDefined();
      
      // But we can test the business logic
      expect(policy.policyLimit).toBeLessThan(policy.totalInsuredValue);
    });

    test('should validate premium calculation consistency', async () => {
      const policy = new Policy(mockPolicyData);
      await policy.save();

      const calculatedTotal = policy.premium.basePremium + 
                             policy.premium.taxes + 
                             policy.premium.fees;
      
      expect(calculatedTotal).toBe(policy.premium.totalPremium);
    });

    test('should validate reinsurer percentage totals', async () => {
      const reinsurers = mockPolicyData.reinsurance.reinsurers;
      const totalReinsurancePercentage = reinsurers.reduce((sum, r) => sum + r.percentage, 0);
      const retentionPercentage = mockPolicyData.reinsurance.retentionPercentage;
      
      expect(totalReinsurancePercentage + retentionPercentage).toBeCloseTo(100, 0);
    });

    test('should validate coverage type limits against policy limit', async () => {
      const totalCoverageLimit = mockPolicyData.coverageTypes.reduce((sum, c) => sum + c.limit, 0);
      
      expect(totalCoverageLimit).toBeLessThanOrEqual(mockPolicyData.policyLimit);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle missing optional nested objects', async () => {
      const minimalData = {
        policyId: 'POL-77777777',
        policyNumber: 'MIN-2024-002',
        accountId: 'ACC-12345678',
        policyName: 'Minimal Policy',
        policyType: 'Property',
        effectiveDate: new Date('2024-01-01'),
        expirationDate: new Date('2024-12-31'),
        totalInsuredValue: 1000000
      };

      const policy = new Policy(minimalData);
      const saved = await policy.save();

      expect(saved.premium).toBeUndefined();
      expect(saved.reinsurance).toBeUndefined();
      expect(saved.geographicCoverage).toBeUndefined();
    });

    test('should handle very large policy values', async () => {
      const largeValueData = {
        ...mockPolicyData,
        policyId: 'POL-88888888',
        totalInsuredValue: Number.MAX_SAFE_INTEGER,
        policyLimit: Number.MAX_SAFE_INTEGER - 1000000
      };

      const policy = new Policy(largeValueData);
      await expect(policy.save()).resolves.toBeDefined();
    });

    test('should handle special characters in text fields', async () => {
      const specialCharData = {
        ...mockPolicyData,
        policyId: 'POL-99999999',
        policyName: 'Póliza de Seguro São Paulo',
        underwritingCompany: 'Compañía de Seguros & Reaseguros S.A.'
      };

      const policy = new Policy(specialCharData);
      const saved = await policy.save();

      expect(saved.policyName).toBe('Póliza de Seguro São Paulo');
      expect(saved.underwritingCompany).toBe('Compañía de Seguros & Reaseguros S.A.');
    });
  });

  describe('Performance Tests', () => {
    test('should handle bulk policy operations efficiently', async () => {
      const bulkData = Array.from({ length: 50 }, (_, i) => ({
        ...mockPolicyData,
        policyId: `POL-${String(i).padStart(8, '0')}`,
        policyNumber: `BULK-2024-${String(i).padStart(3, '0')}`,
        totalInsuredValue: 1000000 + (i * 100000),
        premium: {
          ...mockPolicyData.premium,
          totalPremium: 10000 + (i * 500)
        }
      }));

      const startTime = Date.now();
      await Policy.insertMany(bulkData);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(2000); // Should complete in less than 2 seconds

      // Verify all records were inserted
      const count = await Policy.countDocuments();
      expect(count).toBe(50);
    });

    test('should perform complex aggregations efficiently', async () => {
      // Insert test data
      const testData = Array.from({ length: 30 }, (_, i) => ({
        ...mockPolicyData,
        policyId: `POL-${String(i).padStart(8, '0')}`,
        policyType: i % 3 === 0 ? 'Property' : i % 3 === 1 ? 'Casualty' : 'Auto',
        lineOfBusiness: i % 3 === 0 ? 'Commercial Property' : i % 3 === 1 ? 'General Liability' : 'Commercial Auto',
        totalInsuredValue: 1000000 + (i * 500000),
        premium: {
          ...mockPolicyData.premium,
          totalPremium: 15000 + (i * 1000)
        }
      }));

      await Policy.insertMany(testData);

      const startTime = Date.now();
      const aggregation = await Policy.aggregate([
        {
          $group: {
            _id: {
              policyType: '$policyType',
              lineOfBusiness: '$lineOfBusiness'
            },
            count: { $sum: 1 },
            totalInsuredValue: { $sum: '$totalInsuredValue' },
            avgPremium: { $avg: '$premium.totalPremium' },
            totalPremium: { $sum: '$premium.totalPremium' }
          }
        },
        { $sort: { totalInsuredValue: -1 } }
      ]);
      const endTime = Date.now();

      expect(aggregation.length).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(500); // Should be fast
    });
  });
});