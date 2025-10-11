const mongoose = require('mongoose');
const Exposure = require('../../src/models/Exposure');

/**
 * Test suite for Exposure Model - Core Model Layer
 * Tests the unified exposure data model that consolidates Account, Policy, and Location
 * Priority: P0 (Core Model)
 */
describe('Exposure Model - Core Model Tests', () => {
    let mockExposureData;

    });

  afterAll(async () => {
    if (connection) {
                }
  });

  beforeEach(async () => {
    // Clear the collection before each test
    await Exposure.deleteMany({});
    
    // Standard mock exposure data
    mockExposureData = {
      exposureId: 'EXP-1234567890',
      accountId: 'ACC-123',
      policyId: 'POL-456',
      locationId: 'LOC-789',
      totalInsuredValue: 1000000,
      buildingValue: 800000,
      contentsValue: 200000,
      businessInterruptionValue: 100000,
      currency: 'USD',
      location: {
        latitude: 40.7128,
        longitude: -74.0060,
        elevation: 10,
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'US',
          region: 'North America'
        }
      },
      occupancyType: 'Commercial',
      constructionType: 'Steel Frame',
      yearBuilt: 2000,
      numberOfStories: 5,
      squareFootage: 10000,
      perilExposure: [{
        peril: 'Hurricane',
        exposureValue: 1000000,
        deductible: 10000,
        limit: 1000000,
        isExcluded: false
      }],
      policyTerms: {
        effectiveDate: new Date('2023-01-01'),
        expirationDate: new Date('2023-12-31'),
        deductible: 10000,
        policyLimit: 1000000
      },
      riskCharacteristics: {
        buildingAge: 23,
        distanceToCoast: 5000,
        elevation: 10,
        soilType: 'Sandy'
      }
    };
  });

  describe('Schema Validation', () => {
    describe('Required Fields', () => {
      test('should create exposure with all required fields', async () => {
        const exposure = new Exposure(mockExposureData);
        const savedExposure = await exposure.save();
        
        expect(savedExposure._id).toBeDefined();
        expect(savedExposure.exposureId).toBe(mockExposureData.exposureId);
        expect(savedExposure.accountId).toBe(mockExposureData.accountId);
        expect(savedExposure.totalInsuredValue).toBe(mockExposureData.totalInsuredValue);
      });

      test('should require exposureId', async () => {
        const invalidData = { ...mockExposureData };
        delete invalidData.exposureId;
        
        const exposure = new Exposure(invalidData);
        await expect(exposure.save()).rejects.toThrow(/exposureId.*required/i);
      });

      test('should require accountId', async () => {
        const invalidData = { ...mockExposureData };
        delete invalidData.accountId;
        
        const exposure = new Exposure(invalidData);
        await expect(exposure.save()).rejects.toThrow(/accountId.*required/i);
      });

      test('should require policyId', async () => {
        const invalidData = { ...mockExposureData };
        delete invalidData.policyId;
        
        const exposure = new Exposure(invalidData);
        await expect(exposure.save()).rejects.toThrow(/policyId.*required/i);
      });

      test('should require locationId', async () => {
        const invalidData = { ...mockExposureData };
        delete invalidData.locationId;
        
        const exposure = new Exposure(invalidData);
        await expect(exposure.save()).rejects.toThrow(/locationId.*required/i);
      });

      test('should require totalInsuredValue', async () => {
        const invalidData = { ...mockExposureData };
        delete invalidData.totalInsuredValue;
        
        const exposure = new Exposure(invalidData);
        await expect(exposure.save()).rejects.toThrow(/totalInsuredValue.*required/i);
      });

      test('should require buildingValue', async () => {
        const invalidData = { ...mockExposureData };
        delete invalidData.buildingValue;
        
        const exposure = new Exposure(invalidData);
        await expect(exposure.save()).rejects.toThrow(/buildingValue.*required/i);
      });

      test('should require location coordinates', async () => {
        const invalidData = { ...mockExposureData };
        delete invalidData.location.latitude;
        
        const exposure = new Exposure(invalidData);
        await expect(exposure.save()).rejects.toThrow(/latitude.*required/i);
      });

      test('should require occupancyType', async () => {
        const invalidData = { ...mockExposureData };
        delete invalidData.occupancyType;
        
        const exposure = new Exposure(invalidData);
        await expect(exposure.save()).rejects.toThrow(/occupancyType.*required/i);
      });

      test('should require constructionType', async () => {
        const invalidData = { ...mockExposureData };
        delete invalidData.constructionType;
        
        const exposure = new Exposure(invalidData);
        await expect(exposure.save()).rejects.toThrow(/constructionType.*required/i);
      });
    });

    describe('Field Validation', () => {
      describe('exposureId Format', () => {
        test('should accept valid exposureId format', async () => {
          const exposure = new Exposure(mockExposureData);
          await expect(exposure.save()).resolves.toBeDefined();
        });

        test('should reject invalid exposureId format', async () => {
          const invalidFormats = [
            'EXP-123',           // Too short
            'EXP-12345678901',   // Too long
            'INVALID-1234567890', // Wrong prefix
            'EXP1234567890',     // Missing dash
            'EXP-ABCDEFGHIJ'     // Non-numeric
          ];

          for (const invalidId of invalidFormats) {
            const invalidData = { ...mockExposureData, exposureId: invalidId };
            const exposure = new Exposure(invalidData);
            await expect(exposure.save()).rejects.toThrow(/Exposure ID must be in format/i);
          }
        });
      });

      describe('Value Constraints', () => {
        test('should enforce minimum value constraints', async () => {
          const invalidData = { ...mockExposureData, totalInsuredValue: -1000 };
          const exposure = new Exposure(invalidData);
          await expect(exposure.save()).rejects.toThrow(/Path.*totalInsuredValue.*minimum/i);
        });

        test('should accept zero values where appropriate', async () => {
          const validData = {
            ...mockExposureData,
            contentsValue: 0,
            businessInterruptionValue: 0,
            timeElementValue: 0,
            otherValue: 0
          };
          
          const exposure = new Exposure(validData);
          const saved = await exposure.save();
          
          expect(saved.contentsValue).toBe(0);
          expect(saved.businessInterruptionValue).toBe(0);
        });

        test('should reject negative building value', async () => {
          const invalidData = { ...mockExposureData, buildingValue: -100000 };
          const exposure = new Exposure(invalidData);
          await expect(exposure.save()).rejects.toThrow(/Path.*buildingValue.*minimum/i);
        });

        test('should reject negative contents value', async () => {
          const invalidData = { ...mockExposureData, contentsValue: -50000 };
          const exposure = new Exposure(invalidData);
          await expect(exposure.save()).rejects.toThrow(/Path.*contentsValue.*minimum/i);
        });
      });

      describe('Currency Validation', () => {
        test('should accept valid currencies', async () => {
          const validCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CNY', 'INR', 'BRL'];
          
          for (const currency of validCurrencies) {
            const data = { ...mockExposureData, exposureId: `EXP-${Date.now()}${Math.random().toString().slice(2, 5)}`, currency };
            const exposure = new Exposure(data);
            const saved = await exposure.save();
            expect(saved.currency).toBe(currency);
            await exposure.deleteOne();
          }
        });

        test('should reject invalid currencies', async () => {
          const invalidData = { ...mockExposureData, currency: 'INVALID' };
          const exposure = new Exposure(invalidData);
          await expect(exposure.save()).rejects.toThrow(/`INVALID` is not a valid enum value/i);
        });

        test('should default to USD if not specified', async () => {
          const dataWithoutCurrency = { ...mockExposureData };
          delete dataWithoutCurrency.currency;
          
          const exposure = new Exposure(dataWithoutCurrency);
          const saved = await exposure.save();
          
          expect(saved.currency).toBe('USD');
        });
      });

      describe('Location Validation', () => {
        test('should validate latitude bounds', async () => {
          const testCases = [
            { lat: -90, shouldPass: true },
            { lat: 90, shouldPass: true },
            { lat: 0, shouldPass: true },
            { lat: -91, shouldPass: false },
            { lat: 91, shouldPass: false }
          ];

          for (const { lat, shouldPass } of testCases) {
            const data = {
              ...mockExposureData,
              exposureId: `EXP-${Date.now()}${Math.random().toString().slice(2, 5)}`,
              location: { ...mockExposureData.location, latitude: lat }
            };
            
            const exposure = new Exposure(data);
            
            if (shouldPass) {
              await expect(exposure.save()).resolves.toBeDefined();
              await exposure.deleteOne();
            } else {
              await expect(exposure.save()).rejects.toThrow();
            }
          }
        });

        test('should validate longitude bounds', async () => {
          const testCases = [
            { lng: -180, shouldPass: true },
            { lng: 180, shouldPass: true },
            { lng: 0, shouldPass: true },
            { lng: -181, shouldPass: false },
            { lng: 181, shouldPass: false }
          ];

          for (const { lng, shouldPass } of testCases) {
            const data = {
              ...mockExposureData,
              exposureId: `EXP-${Date.now()}${Math.random().toString().slice(2, 5)}`,
              location: { ...mockExposureData.location, longitude: lng }
            };
            
            const exposure = new Exposure(data);
            
            if (shouldPass) {
              await expect(exposure.save()).resolves.toBeDefined();
              await exposure.deleteOne();
            } else {
              await expect(exposure.save()).rejects.toThrow();
            }
          }
        });

        test('should validate elevation bounds', async () => {
          const testCases = [
            { elevation: -1000, shouldPass: true },
            { elevation: 10000, shouldPass: true },
            { elevation: 0, shouldPass: true },
            { elevation: -1001, shouldPass: false },
            { elevation: 10001, shouldPass: false }
          ];

          for (const { elevation, shouldPass } of testCases) {
            const data = {
              ...mockExposureData,
              exposureId: `EXP-${Date.now()}${Math.random().toString().slice(2, 5)}`,
              location: { ...mockExposureData.location, elevation }
            };
            
            const exposure = new Exposure(data);
            
            if (shouldPass) {
              await expect(exposure.save()).resolves.toBeDefined();
              await exposure.deleteOne();
            } else {
              await expect(exposure.save()).rejects.toThrow();
            }
          }
        });

        test('should require valid region', async () => {
          const validRegions = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East', 'Africa'];
          const invalidRegions = ['Antarctica', 'Unknown', 'Other'];

          for (const region of validRegions) {
            const data = {
              ...mockExposureData,
              exposureId: `EXP-${Date.now()}${Math.random().toString().slice(2, 5)}`,
              location: {
                ...mockExposureData.location,
                address: { ...mockExposureData.location.address, region }
              }
            };
            
            const exposure = new Exposure(data);
            await expect(exposure.save()).resolves.toBeDefined();
            await exposure.deleteOne();
          }

          for (const region of invalidRegions) {
            const data = {
              ...mockExposureData,
              location: {
                ...mockExposureData.location,
                address: { ...mockExposureData.location.address, region }
              }
            };
            
            const exposure = new Exposure(data);
            await expect(exposure.save()).rejects.toThrow();
          }
        });
      });

      describe('Occupancy and Construction Validation', () => {
        test('should validate occupancy types', async () => {
          const validTypes = ['Residential', 'Commercial', 'Industrial', 'Agricultural', 'Mixed Use', 'Institutional'];
          const invalidTypes = ['Retail', 'Office', 'Unknown'];

          for (const occupancyType of validTypes) {
            const data = {
              ...mockExposureData,
              exposureId: `EXP-${Date.now()}${Math.random().toString().slice(2, 5)}`,
              occupancyType
            };
            
            const exposure = new Exposure(data);
            await expect(exposure.save()).resolves.toBeDefined();
            await exposure.deleteOne();
          }

          for (const occupancyType of invalidTypes) {
            const data = { ...mockExposureData, occupancyType };
            const exposure = new Exposure(data);
            await expect(exposure.save()).rejects.toThrow();
          }
        });

        test('should validate construction types', async () => {
          const validTypes = ['Wood Frame', 'Masonry', 'Concrete', 'Steel Frame', 'Mixed', 'Manufactured Housing'];
          const invalidTypes = ['Brick', 'Adobe', 'Unknown'];

          for (const constructionType of validTypes) {
            const data = {
              ...mockExposureData,
              exposureId: `EXP-${Date.now()}${Math.random().toString().slice(2, 5)}`,
              constructionType
            };
            
            const exposure = new Exposure(data);
            await expect(exposure.save()).resolves.toBeDefined();
            await exposure.deleteOne();
          }

          for (const constructionType of invalidTypes) {
            const data = { ...mockExposureData, constructionType };
            const exposure = new Exposure(data);
            await expect(exposure.save()).rejects.toThrow();
          }
        });

        test('should validate year built constraints', async () => {
          const currentYear = new Date().getFullYear();
          
          const testCases = [
            { year: 1800, shouldPass: true },
            { year: currentYear, shouldPass: true },
            { year: currentYear + 5, shouldPass: true },
            { year: 1799, shouldPass: false },
            { year: currentYear + 6, shouldPass: false }
          ];

          for (const { year, shouldPass } of testCases) {
            const data = {
              ...mockExposureData,
              exposureId: `EXP-${Date.now()}${Math.random().toString().slice(2, 5)}`,
              yearBuilt: year
            };
            
            const exposure = new Exposure(data);
            
            if (shouldPass) {
              await expect(exposure.save()).resolves.toBeDefined();
              await exposure.deleteOne();
            } else {
              await expect(exposure.save()).rejects.toThrow();
            }
          }
        });

        test('should validate number of stories constraints', async () => {
          const testCases = [
            { stories: 1, shouldPass: true },
            { stories: 200, shouldPass: true },
            { stories: 50, shouldPass: true },
            { stories: 0, shouldPass: false },
            { stories: 201, shouldPass: false },
            { stories: -1, shouldPass: false }
          ];

          for (const { stories, shouldPass } of testCases) {
            const data = {
              ...mockExposureData,
              exposureId: `EXP-${Date.now()}${Math.random().toString().slice(2, 5)}`,
              numberOfStories: stories
            };
            
            const exposure = new Exposure(data);
            
            if (shouldPass) {
              await expect(exposure.save()).resolves.toBeDefined();
              await exposure.deleteOne();
            } else {
              await expect(exposure.save()).rejects.toThrow();
            }
          }
        });
      });

      describe('Peril Exposure Validation', () => {
        test('should validate peril types', async () => {
          const validPerils = ['Earthquake', 'Hurricane', 'Typhoon', 'Flood', 'Wildfire', 'Tornado', 'Hail'];
          
          for (const peril of validPerils) {
            const data = {
              ...mockExposureData,
              exposureId: `EXP-${Date.now()}${Math.random().toString().slice(2, 5)}`,
              perilExposure: [{
                peril,
                exposureValue: 1000000,
                deductible: 10000,
                limit: 1000000,
                isExcluded: false
              }]
            };
            
            const exposure = new Exposure(data);
            await expect(exposure.save()).resolves.toBeDefined();
            await exposure.deleteOne();
          }
        });

        test('should reject invalid peril types', async () => {
          const invalidPeril = 'Nuclear';
          const data = {
            ...mockExposureData,
            perilExposure: [{
              peril: invalidPeril,
              exposureValue: 1000000,
              deductible: 10000,
              limit: 1000000,
              isExcluded: false
            }]
          };
          
          const exposure = new Exposure(data);
          await expect(exposure.save()).rejects.toThrow();
        });

        test('should validate peril exposure values', async () => {
          const testCases = [
            { value: 0, shouldPass: true },
            { value: 1000000, shouldPass: true },
            { value: -1000, shouldPass: false }
          ];

          for (const { value, shouldPass } of testCases) {
            const data = {
              ...mockExposureData,
              exposureId: `EXP-${Date.now()}${Math.random().toString().slice(2, 5)}`,
              perilExposure: [{
                peril: 'Hurricane',
                exposureValue: value,
                deductible: 10000,
                limit: 1000000,
                isExcluded: false
              }]
            };
            
            const exposure = new Exposure(data);
            
            if (shouldPass) {
              await expect(exposure.save()).resolves.toBeDefined();
              await exposure.deleteOne();
            } else {
              await expect(exposure.save()).rejects.toThrow();
            }
          }
        });

        test('should validate deductible constraints', async () => {
          const testCases = [
            { deductible: 0, shouldPass: true },
            { deductible: 10000, shouldPass: true },
            { deductible: -1000, shouldPass: false }
          ];

          for (const { deductible, shouldPass } of testCases) {
            const data = {
              ...mockExposureData,
              exposureId: `EXP-${Date.now()}${Math.random().toString().slice(2, 5)}`,
              perilExposure: [{
                peril: 'Hurricane',
                exposureValue: 1000000,
                deductible,
                limit: 1000000,
                isExcluded: false
              }]
            };
            
            const exposure = new Exposure(data);
            
            if (shouldPass) {
              await expect(exposure.save()).resolves.toBeDefined();
              await exposure.deleteOne();
            } else {
              await expect(exposure.save()).rejects.toThrow();
            }
          }
        });
      });
    });

    describe('Unique Constraints', () => {
      test('should enforce unique exposureId', async () => {
        const exposure1 = new Exposure(mockExposureData);
        await exposure1.save();
        
        const duplicateData = { ...mockExposureData };
        const exposure2 = new Exposure(duplicateData);
        
        await expect(exposure2.save()).rejects.toThrow(/duplicate key error/i);
      });
    });
  });

  describe('Model Methods and Virtuals', () => {
    let testExposure;

    beforeEach(async () => {
      testExposure = new Exposure(mockExposureData);
      await testExposure.save();
    });

    describe('Instance Methods', () => {
      test('should calculate total coverage correctly', async () => {
        const totalCoverage = testExposure.getTotalCoverage();
        const expected = mockExposureData.buildingValue + 
                        mockExposureData.contentsValue + 
                        (mockExposureData.businessInterruptionValue || 0);
        
        expect(totalCoverage).toBe(expected);
      });

      test('should get peril exposure by type', async () => {
        const hurricaneExposure = testExposure.getPerilExposure('Hurricane');
        
        expect(hurricaneExposure).toBeDefined();
        expect(hurricaneExposure.peril).toBe('Hurricane');
        expect(hurricaneExposure.exposureValue).toBe(1000000);
      });

      test('should return null for non-existent peril', async () => {
        const nonExistentPeril = testExposure.getPerilExposure('Earthquake');
        expect(nonExistentPeril).toBeNull();
      });

      test('should check if peril is excluded', async () => {
        expect(testExposure.isPerilExcluded('Hurricane')).toBe(false);
        expect(testExposure.isPerilExcluded('Earthquake')).toBe(true); // Not in peril list = excluded
      });

      test('should calculate building age correctly', async () => {
        const currentYear = new Date().getFullYear();
        const expectedAge = currentYear - mockExposureData.yearBuilt;
        
        expect(testExposure.getBuildingAge()).toBe(expectedAge);
      });

      test('should format address correctly', async () => {
        const formattedAddress = testExposure.getFormattedAddress();
        const expected = `${mockExposureData.location.address.street}, ${mockExposureData.location.address.city}, ${mockExposureData.location.address.state} ${mockExposureData.location.address.postalCode}`;
        
        expect(formattedAddress).toBe(expected);
      });
    });

    describe('Static Methods', () => {
      test('should find exposures by account', async () => {
        const exposures = await Exposure.findByAccount(mockExposureData.accountId);
        
        expect(exposures).toHaveLength(1);
        expect(exposures[0].accountId).toBe(mockExposureData.accountId);
      });

      test('should find exposures by policy', async () => {
        const exposures = await Exposure.findByPolicy(mockExposureData.policyId);
        
        expect(exposures).toHaveLength(1);
        expect(exposures[0].policyId).toBe(mockExposureData.policyId);
      });

      test('should find exposures by location', async () => {
        const exposures = await Exposure.findByLocation(mockExposureData.locationId);
        
        expect(exposures).toHaveLength(1);
        expect(exposures[0].locationId).toBe(mockExposureData.locationId);
      });

      test('should find exposures by region', async () => {
        const exposures = await Exposure.findByRegion('North America');
        
        expect(exposures).toHaveLength(1);
        expect(exposures[0].location.address.region).toBe('North America');
      });

      test('should find exposures by peril', async () => {
        const exposures = await Exposure.findByPeril('Hurricane');
        
        expect(exposures).toHaveLength(1);
        expect(exposures[0].perilExposure.some(pe => pe.peril === 'Hurricane')).toBe(true);
      });

      test('should calculate portfolio summary', async () => {
        // Create additional exposures for portfolio
        const exposure2Data = {
          ...mockExposureData,
          exposureId: 'EXP-2234567890',
          accountId: 'ACC-456',
          totalInsuredValue: 2000000,
          buildingValue: 1600000,
          contentsValue: 400000
        };
        
        const exposure2 = new Exposure(exposure2Data);
        await exposure2.save();
        
        const summary = await Exposure.getPortfolioSummary();
        
        expect(summary.totalExposures).toBe(2);
        expect(summary.totalInsuredValue).toBe(3000000);
        expect(summary.averageExposureValue).toBe(1500000);
        expect(summary.currencyBreakdown.USD).toBe(3000000);
      });
    });

    describe('Virtual Properties', () => {
      test('should calculate risk score virtual property', async () => {
        // Assuming risk score is calculated based on various factors
        expect(testExposure.riskScore).toBeGreaterThan(0);
        expect(testExposure.riskScore).toBeLessThanOrEqual(100);
      });

      test('should calculate exposure density virtual property', async () => {
        if (testExposure.squareFootage && testExposure.squareFootage > 0) {
          const expectedDensity = testExposure.totalInsuredValue / testExposure.squareFootage;
          expect(testExposure.exposureDensity).toBe(expectedDensity);
        }
      });
    });
  });

  describe('Indexing and Performance', () => {
    test('should have proper indexes for efficient queries', async () => {
      const indexes = await Exposure.collection.getIndexes();
      
      // Check for required indexes
      expect(indexes).toHaveProperty('exposureId_1');
      expect(indexes).toHaveProperty('accountId_1');
      expect(indexes).toHaveProperty('policyId_1');
      expect(indexes).toHaveProperty('locationId_1');
      expect(indexes).toHaveProperty('totalInsuredValue_1');
      expect(indexes).toHaveProperty('currency_1');
      expect(indexes).toHaveProperty('location.latitude_1');
      expect(indexes).toHaveProperty('location.longitude_1');
      expect(indexes).toHaveProperty('occupancyType_1');
      expect(indexes).toHaveProperty('constructionType_1');
    });

    test('should perform geospatial queries efficiently', async () => {
      // Create multiple exposures in different locations
      const locations = [
        { lat: 40.7128, lng: -74.0060 }, // New York
        { lat: 34.0522, lng: -118.2437 }, // Los Angeles
        { lat: 25.7617, lng: -80.1918 }  // Miami
      ];

      for (let i = 0; i < locations.length; i++) {
        const exposureData = {
          ...mockExposureData,
          exposureId: `EXP-${i}234567890`,
          location: {
            ...mockExposureData.location,
            latitude: locations[i].lat,
            longitude: locations[i].lng
          }
        };
        
        const exposure = new Exposure(exposureData);
        await exposure.save();
      }

      // Test geospatial query performance
      const startTime = Date.now();
      const nearbyExposures = await Exposure.findNearby(40.7128, -74.0060, 100); // 100km radius
      const endTime = Date.now();

      expect(nearbyExposures.length).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(100); // Should be fast
    });
  });

  describe('Data Consistency and Integrity', () => {
    test('should maintain data consistency across updates', async () => {
      const exposure = new Exposure(mockExposureData);
      await exposure.save();

      // Update total insured value
      exposure.totalInsuredValue = 1500000;
      await exposure.save();

      // Verify the update was saved correctly
      const updatedExposure = await Exposure.findById(exposure._id);
      expect(updatedExposure.totalInsuredValue).toBe(1500000);
    });

    test('should validate data integrity on updates', async () => {
      const exposure = new Exposure(mockExposureData);
      await exposure.save();

      // Try to update with invalid data
      exposure.totalInsuredValue = -1000;
      await expect(exposure.save()).rejects.toThrow();
    });

    test('should handle concurrent updates properly', async () => {
      const exposure = new Exposure(mockExposureData);
      await exposure.save();

      // Simulate concurrent updates
      const exposure1 = await Exposure.findById(exposure._id);
      const exposure2 = await Exposure.findById(exposure._id);

      exposure1.buildingValue = 900000;
      exposure2.contentsValue = 300000;

      await exposure1.save();
      await exposure2.save();

      // Verify final state
      const finalExposure = await Exposure.findById(exposure._id);
      expect(finalExposure.buildingValue).toBe(900000);
      expect(finalExposure.contentsValue).toBe(300000);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle invalid ObjectId references gracefully', async () => {
      const invalidData = {
        ...mockExposureData,
        accountId: 'invalid-object-id'
      };

      const exposure = new Exposure(invalidData);
      // Should save successfully as we\'re just storing strings, not enforcing ObjectId format
      await expect(exposure.save()).resolves.toBeDefined();
    });

    test('should handle missing optional fields', async () => {
      const minimalData = {
        exposureId: 'EXP-9876543210',
        accountId: 'ACC-123',
        policyId: 'POL-456',
        locationId: 'LOC-789',
        totalInsuredValue: 1000000,
        buildingValue: 800000,
        contentsValue: 200000,
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
          address: {
            country: 'US',
            region: 'North America'
          }
        },
        occupancyType: 'Commercial',
        constructionType: 'Steel Frame'
      };

      const exposure = new Exposure(minimalData);
      const saved = await exposure.save();

      expect(saved.currency).toBe('USD'); // Default value
      expect(saved.businessInterruptionValue).toBe(0); // Default value
      expect(saved.numberOfStories).toBe(1); // Default value
    });

    test('should handle very large exposure values', async () => {
      const largeValueData = {
        ...mockExposureData,
        exposureId: 'EXP-9999999999',
        totalInsuredValue: Number.MAX_SAFE_INTEGER,
        buildingValue: Number.MAX_SAFE_INTEGER - 1000000
      };

      const exposure = new Exposure(largeValueData);
      await expect(exposure.save()).resolves.toBeDefined();
    });

    test('should handle special characters in address fields', async () => {
      const specialCharData = {
        ...mockExposureData,
        exposureId: 'EXP-8888888888',
        location: {
          ...mockExposureData.location,
          address: {
            ...mockExposureData.location.address,
            street: '123 Rue Saint-Honoré',
            city: 'São Paulo',
            state: 'São Paulo'
          }
        }
      };

      const exposure = new Exposure(specialCharData);
      const saved = await exposure.save();

      expect(saved.location.address.street).toBe('123 Rue Saint-Honoré');
      expect(saved.location.address.city).toBe('São Paulo');
    });
  });

  describe('Performance Tests', () => {
    test('should handle bulk operations efficiently', async () => {
      const bulkData = Array.from({ length: 100 }, (_, i) => ({
        ...mockExposureData,
        exposureId: `EXP-${String(i).padStart(10, '0')}`,
        accountId: `ACC-${i}`,
        totalInsuredValue: 1000000 + (i * 10000)
      }));

      const startTime = Date.now();
      await Exposure.insertMany(bulkData);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(2000); // Should complete in less than 2 seconds

      // Verify all records were inserted
      const count = await Exposure.countDocuments();
      expect(count).toBe(100);
    });

    test('should perform complex aggregations efficiently', async () => {
      // Insert test data
      const testData = Array.from({ length: 50 }, (_, i) => ({
        ...mockExposureData,
        exposureId: `EXP-${String(i).padStart(10, '0')}`,
        occupancyType: i % 2 === 0 ? 'Commercial' : 'Residential',
        totalInsuredValue: 1000000 + (i * 50000),
        location: {
          ...mockExposureData.location,
          address: {
            ...mockExposureData.location.address,
            region: i < 25 ? 'North America' : 'Europe'
          }
        }
      }));

      await Exposure.insertMany(testData);

      const startTime = Date.now();
      const aggregation = await Exposure.aggregate([
        {
          $group: {
            _id: {
              occupancyType: '$occupancyType',
              region: '$location.address.region'
            },
            totalValue: { $sum: '$totalInsuredValue' },
            count: { $sum: 1 },
            avgValue: { $avg: '$totalInsuredValue' }
          }
        },
        { $sort: { totalValue: -1 } }
      ]);
      const endTime = Date.now();

      expect(aggregation).toHaveLength(4); // 2 occupancy types × 2 regions
      expect(endTime - startTime).toBeLessThan(500); // Should be fast
    });
  });
});