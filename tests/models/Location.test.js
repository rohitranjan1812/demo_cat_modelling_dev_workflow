const mongoose = require('mongoose');
const Location = require('../../src/models/Location');

/**
 * Test suite for Location Model - Core Model Layer
 * Tests location data model with coordinates, address, and risk factors
 * Priority: P0 (Core Model)
 */
describe('Location Model - Core Model Tests', () => {
    let mockLocationData;

    });

  afterAll(async () => {
    if (connection) {
                }
  });

  beforeEach(async () => {
    // Clear the collection before each test
    await Location.deleteMany({});
    
    // Standard mock location data
    mockLocationData = {
      locationId: 'LOC-12345678',
      locationName: 'Test Location NYC',
      coordinates: {
        latitude: 40.7128,
        longitude: -74.0060,
        elevation: 10
      },
      address: {
        street: '123 Broadway',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'United States',
        region: 'North America'
      },
      locationType: 'Urban',
      isActive: true,
      riskFactors: [{
        peril: 'Hurricane',
        riskScore: 7.5,
        probability: 0.02,
        expectedLoss: 1000000,
        lastUpdated: new Date()
      }],
      nearbyLandmarks: [{
        name: 'Times Square',
        type: 'Commercial',
        distance: 2.5,
        unit: 'km'
      }],
      environmentalFactors: {
        soilType: 'Clay',
        topography: 'Flat',
        floodZone: 'AE',
        seismicZone: 'Zone 2A',
        windZone: 'Zone 3',
        fireRisk: 'Low'
      },
      demographics: {
        population: 50000,
        populationDensity: 10000,
        medianIncome: 75000,
        vulnerablePopulation: 12.5
      },
      infrastructure: {
        powerGrid: 'Reliable',
        waterSupply: 'Municipal',
        transportation: 'Excellent',
        healthcare: 'Good',
        emergencyServices: 'Excellent'
      },
      metadata: {
        dataSource: 'USGS',
        lastUpdated: new Date(),
        accuracy: 'High',
        confidence: 95
      }
    };
  });

  describe('Schema Validation', () => {
    describe('Required Fields', () => {
      test('should create location with all required fields', async () => {
        const location = new Location(mockLocationData);
        const savedLocation = await location.save();
        
        expect(savedLocation._id).toBeDefined();
        expect(savedLocation.locationId).toBe(mockLocationData.locationId);
        expect(savedLocation.locationName).toBe(mockLocationData.locationName);
        expect(savedLocation.coordinates.latitude).toBe(mockLocationData.coordinates.latitude);
      });

      test('should require locationId', async () => {
        const invalidData = { ...mockLocationData };
        delete invalidData.locationId;
        
        const location = new Location(invalidData);
        await expect(location.save()).rejects.toThrow(/locationId.*required/i);
      });

      test('should require locationName', async () => {
        const invalidData = { ...mockLocationData };
        delete invalidData.locationName;
        
        const location = new Location(invalidData);
        await expect(location.save()).rejects.toThrow(/locationName.*required/i);
      });

      test('should require coordinates', async () => {
        const invalidData = { ...mockLocationData };
        delete invalidData.coordinates;
        
        const location = new Location(invalidData);
        await expect(location.save()).rejects.toThrow(/coordinates.*required/i);
      });

      test('should require address', async () => {
        const invalidData = { ...mockLocationData };
        delete invalidData.address;
        
        const location = new Location(invalidData);
        await expect(location.save()).rejects.toThrow(/address.*required/i);
      });

      test('should require locationType', async () => {
        const invalidData = { ...mockLocationData };
        delete invalidData.locationType;
        
        const location = new Location(invalidData);
        await expect(location.save()).rejects.toThrow(/locationType.*required/i);
      });
    });

    describe('Field Validation', () => {
      describe('locationId Format', () => {
        test('should accept valid locationId format', async () => {
          const location = new Location(mockLocationData);
          await expect(location.save()).resolves.toBeDefined();
        });

        test('should reject invalid locationId format', async () => {
          const invalidFormats = [
            'LOC-123',       // Too short
            'LOC-123456789', // Too long
            'INVALID-12345678', // Wrong prefix
            'LOC12345678',   // Missing dash
            'LOC-ABCDEFGH'   // Non-numeric
          ];

          for (const invalidId of invalidFormats) {
            const invalidData = { ...mockLocationData, locationId: invalidId };
            const location = new Location(invalidData);
            await expect(location.save()).rejects.toThrow(/Location ID must be in format/i);
          }
        });
      });

      describe('Coordinates Validation', () => {
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
              ...mockLocationData,
              locationId: `LOC-${Date.now().toString().slice(-8)}`,
              coordinates: { ...mockLocationData.coordinates, latitude: lat }
            };
            
            const location = new Location(data);
            
            if (shouldPass) {
              await expect(location.save()).resolves.toBeDefined();
              await location.deleteOne();
            } else {
              await expect(location.save()).rejects.toThrow();
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
              ...mockLocationData,
              locationId: `LOC-${Date.now().toString().slice(-8)}`,
              coordinates: { ...mockLocationData.coordinates, longitude: lng }
            };
            
            const location = new Location(data);
            
            if (shouldPass) {
              await expect(location.save()).resolves.toBeDefined();
              await location.deleteOne();
            } else {
              await expect(location.save()).rejects.toThrow();
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
              ...mockLocationData,
              locationId: `LOC-${Date.now().toString().slice(-8)}`,
              coordinates: { ...mockLocationData.coordinates, elevation }
            };
            
            const location = new Location(data);
            
            if (shouldPass) {
              await expect(location.save()).resolves.toBeDefined();
              await location.deleteOne();
            } else {
              await expect(location.save()).rejects.toThrow();
            }
          }
        });

        test('should default elevation to 0 if not provided', async () => {
          const dataWithoutElevation = {
            ...mockLocationData,
            coordinates: {
              latitude: mockLocationData.coordinates.latitude,
              longitude: mockLocationData.coordinates.longitude
            }
          };
          
          const location = new Location(dataWithoutElevation);
          const saved = await location.save();
          
          expect(saved.coordinates.elevation).toBe(0);
        });
      });

      describe('Address Validation', () => {
        test('should require street address', async () => {
          const invalidData = {
            ...mockLocationData,
            address: { ...mockLocationData.address }
          };
          delete invalidData.address.street;
          
          const location = new Location(invalidData);
          await expect(location.save()).rejects.toThrow(/street.*required/i);
        });

        test('should require city', async () => {
          const invalidData = {
            ...mockLocationData,
            address: { ...mockLocationData.address }
          };
          delete invalidData.address.city;
          
          const location = new Location(invalidData);
          await expect(location.save()).rejects.toThrow(/city.*required/i);
        });

        test('should require country', async () => {
          const invalidData = {
            ...mockLocationData,
            address: { ...mockLocationData.address }
          };
          delete invalidData.address.country;
          
          const location = new Location(invalidData);
          await expect(location.save()).rejects.toThrow(/country.*required/i);
        });

        test('should require region', async () => {
          const invalidData = {
            ...mockLocationData,
            address: { ...mockLocationData.address }
          };
          delete invalidData.address.region;
          
          const location = new Location(invalidData);
          await expect(location.save()).rejects.toThrow(/region.*required/i);
        });

        test('should validate region enumeration', async () => {
          const validRegions = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East', 'Africa'];
          const invalidRegions = ['Antarctica', 'Oceania', 'Unknown'];

          for (const region of validRegions) {
            const data = {
              ...mockLocationData,
              locationId: `LOC-${Date.now().toString().slice(-8)}`,
              address: { ...mockLocationData.address, region }
            };
            
            const location = new Location(data);
            await expect(location.save()).resolves.toBeDefined();
            await location.deleteOne();
          }

          for (const region of invalidRegions) {
            const data = { 
              ...mockLocationData,
              address: { ...mockLocationData.address, region }
            };
            
            const location = new Location(data);
            await expect(location.save()).rejects.toThrow();
          }
        });

        test('should validate field length constraints', async () => {
          const testCases = [
            { field: 'street', maxLength: 200, value: 'a'.repeat(201), shouldFail: true },
            { field: 'city', maxLength: 100, value: 'a'.repeat(101), shouldFail: true },
            { field: 'state', maxLength: 100, value: 'a'.repeat(101), shouldFail: true },
            { field: 'postalCode', maxLength: 20, value: 'a'.repeat(21), shouldFail: true },
            { field: 'country', maxLength: 100, value: 'a'.repeat(101), shouldFail: true }
          ];

          for (const { field, value, shouldFail } of testCases) {
            const data = {
              ...mockLocationData,
              address: { ...mockLocationData.address, [field]: value }
            };
            
            const location = new Location(data);
            
            if (shouldFail) {
              await expect(location.save()).rejects.toThrow();
            } else {
              await expect(location.save()).resolves.toBeDefined();
            }
          }
        });

        test('should trim whitespace from address fields', async () => {
          const dataWithWhitespace = {
            ...mockLocationData,
            address: {
              ...mockLocationData.address,
              street: '  123 Broadway  ',
              city: '  New York  ',
              state: '  NY  ',
              country: '  United States  '
            }
          };
          
          const location = new Location(dataWithWhitespace);
          const saved = await location.save();
          
          expect(saved.address.street).toBe('123 Broadway');
          expect(saved.address.city).toBe('New York');
          expect(saved.address.state).toBe('NY');
          expect(saved.address.country).toBe('United States');
        });
      });

      describe('Location Type Validation', () => {
        test('should accept valid location types', async () => {
          const validTypes = ['Urban', 'Suburban', 'Rural', 'Industrial', 'Commercial', 'Residential', 'Mixed'];

          for (const locationType of validTypes) {
            const data = {
              ...mockLocationData,
              locationId: `LOC-${Date.now().toString().slice(-8)}`,
              locationType
            };
            
            const location = new Location(data);
            await expect(location.save()).resolves.toBeDefined();
            await location.deleteOne();
          }
        });

        test('should reject invalid location types', async () => {
          const invalidTypes = ['Unknown', 'Other', 'Military'];

          for (const locationType of invalidTypes) {
            const data = { ...mockLocationData, locationType };
            const location = new Location(data);
            await expect(location.save()).rejects.toThrow();
          }
        });
      });

      describe('Risk Factors Validation', () => {
        test('should validate risk factor peril types', async () => {
          const validPerils = ['Earthquake', 'Hurricane', 'Flood', 'Wildfire', 'Tornado', 'Hail', 'Wind', 'Storm Surge', 'Tsunami', 'Volcanic'];

          for (const peril of validPerils) {
            const data = {
              ...mockLocationData,
              locationId: `LOC-${Date.now().toString().slice(-8)}`,
              riskFactors: [{
                peril,
                riskScore: 5.0,
                probability: 0.1,
                expectedLoss: 500000
              }]
            };
            
            const location = new Location(data);
            await expect(location.save()).resolves.toBeDefined();
            await location.deleteOne();
          }
        });

        test('should validate risk score bounds', async () => {
          const testCases = [
            { score: 0, shouldPass: true },
            { score: 10, shouldPass: true },
            { score: 5.5, shouldPass: true },
            { score: -0.1, shouldPass: false },
            { score: 10.1, shouldPass: false }
          ];

          for (const { score, shouldPass } of testCases) {
            const data = {
              ...mockLocationData,
              locationId: `LOC-${Date.now().toString().slice(-8)}`,
              riskFactors: [{
                peril: 'Hurricane',
                riskScore: score,
                probability: 0.1,
                expectedLoss: 500000
              }]
            };
            
            const location = new Location(data);
            
            if (shouldPass) {
              await expect(location.save()).resolves.toBeDefined();
              await location.deleteOne();
            } else {
              await expect(location.save()).rejects.toThrow();
            }
          }
        });

        test('should validate probability bounds', async () => {
          const testCases = [
            { prob: 0, shouldPass: true },
            { prob: 1, shouldPass: true },
            { prob: 0.5, shouldPass: true },
            { prob: -0.1, shouldPass: false },
            { prob: 1.1, shouldPass: false }
          ];

          for (const { prob, shouldPass } of testCases) {
            const data = {
              ...mockLocationData,
              locationId: `LOC-${Date.now().toString().slice(-8)}`,
              riskFactors: [{
                peril: 'Hurricane',
                riskScore: 5.0,
                probability: prob,
                expectedLoss: 500000
              }]
            };
            
            const location = new Location(data);
            
            if (shouldPass) {
              await expect(location.save()).resolves.toBeDefined();
              await location.deleteOne();
            } else {
              await expect(location.save()).rejects.toThrow();
            }
          }
        });

        test('should validate expected loss constraints', async () => {
          const testCases = [
            { loss: 0, shouldPass: true },
            { loss: 1000000, shouldPass: true },
            { loss: -1000, shouldPass: false }
          ];

          for (const { loss, shouldPass } of testCases) {
            const data = {
              ...mockLocationData,
              locationId: `LOC-${Date.now().toString().slice(-8)}`,
              riskFactors: [{
                peril: 'Hurricane',
                riskScore: 5.0,
                probability: 0.1,
                expectedLoss: loss
              }]
            };
            
            const location = new Location(data);
            
            if (shouldPass) {
              await expect(location.save()).resolves.toBeDefined();
              await location.deleteOne();
            } else {
              await expect(location.save()).rejects.toThrow();
            }
          }
        });
      });

      describe('Nearby Landmarks Validation', () => {
        test('should validate landmark types', async () => {
          const validTypes = ['Commercial', 'Residential', 'Industrial', 'Educational', 'Healthcare', 'Government', 'Religious', 'Recreation', 'Transportation'];

          for (const type of validTypes) {
            const data = {
              ...mockLocationData,
              locationId: `LOC-${Date.now().toString().slice(-8)}`,
              nearbyLandmarks: [{
                name: 'Test Landmark',
                type,
                distance: 1.0,
                unit: 'km'
              }]
            };
            
            const location = new Location(data);
            await expect(location.save()).resolves.toBeDefined();
            await location.deleteOne();
          }
        });

        test('should validate distance constraints', async () => {
          const testCases = [
            { distance: 0, shouldPass: true },
            { distance: 100, shouldPass: true },
            { distance: -1, shouldPass: false }
          ];

          for (const { distance, shouldPass } of testCases) {
            const data = {
              ...mockLocationData,
              locationId: `LOC-${Date.now().toString().slice(-8)}`,
              nearbyLandmarks: [{
                name: 'Test Landmark',
                type: 'Commercial',
                distance,
                unit: 'km'
              }]
            };
            
            const location = new Location(data);
            
            if (shouldPass) {
              await expect(location.save()).resolves.toBeDefined();
              await location.deleteOne();
            } else {
              await expect(location.save()).rejects.toThrow();
            }
          }
        });

        test('should validate distance units', async () => {
          const validUnits = ['km', 'miles', 'meters'];

          for (const unit of validUnits) {
            const data = {
              ...mockLocationData,
              locationId: `LOC-${Date.now().toString().slice(-8)}`,
              nearbyLandmarks: [{
                name: 'Test Landmark',
                type: 'Commercial',
                distance: 1.0,
                unit
              }]
            };
            
            const location = new Location(data);
            await expect(location.save()).resolves.toBeDefined();
            await location.deleteOne();
          }
        });
      });

      describe('Environmental Factors Validation', () => {
        test('should validate enumerated environmental factors', async () => {
          const validFactors = {
            soilType: ['Clay', 'Sand', 'Silt', 'Loam', 'Rock', 'Fill', 'Peat'],
            topography: ['Flat', 'Rolling', 'Hilly', 'Mountainous', 'Coastal', 'Valley'],
            fireRisk: ['Low', 'Moderate', 'High', 'Extreme']
          };

          for (const [factor, validValues] of Object.entries(validFactors)) {
            for (const value of validValues) {
              const data = {
                ...mockLocationData,
                locationId: `LOC-${Date.now().toString().slice(-8)}`,
                environmentalFactors: {
                  ...mockLocationData.environmentalFactors,
                  [factor]: value
                }
              };
              
              const location = new Location(data);
              await expect(location.save()).resolves.toBeDefined();
              await location.deleteOne();
            }
          }
        });

        test('should validate flood zone format', async () => {
          const validFloodZones = ['A', 'AE', 'AH', 'AO', 'AR', 'A99', 'V', 'VE', 'X', 'D'];

          for (const floodZone of validFloodZones) {
            const data = {
              ...mockLocationData,
              locationId: `LOC-${Date.now().toString().slice(-8)}`,
              environmentalFactors: {
                ...mockLocationData.environmentalFactors,
                floodZone
              }
            };
            
            const location = new Location(data);
            await expect(location.save()).resolves.toBeDefined();
            await location.deleteOne();
          }
        });
      });

      describe('Demographics Validation', () => {
        test('should validate demographic constraints', async () => {
          const testCases = [
            { field: 'population', value: -100, shouldFail: true },
            { field: 'populationDensity', value: -10, shouldFail: true },
            { field: 'medianIncome', value: -1000, shouldFail: true },
            { field: 'vulnerablePopulation', value: -5, shouldFail: true },
            { field: 'vulnerablePopulation', value: 105, shouldFail: true },
            { field: 'population', value: 0, shouldFail: false },
            { field: 'vulnerablePopulation', value: 50, shouldFail: false }
          ];

          for (const { field, value, shouldFail } of testCases) {
            const data = {
              ...mockLocationData,
              locationId: `LOC-${Date.now().toString().slice(-8)}`,
              demographics: {
                ...mockLocationData.demographics,
                [field]: value
              }
            };
            
            const location = new Location(data);
            
            if (shouldFail) {
              await expect(location.save()).rejects.toThrow();
            } else {
              await expect(location.save()).resolves.toBeDefined();
              await location.deleteOne();
            }
          }
        });
      });

      describe('Infrastructure Validation', () => {
        test('should validate infrastructure quality levels', async () => {
          const qualityLevels = ['Poor', 'Fair', 'Good', 'Excellent'];
          const infrastructureFields = ['powerGrid', 'waterSupply', 'transportation', 'healthcare', 'emergencyServices'];

          for (const field of infrastructureFields) {
            for (const quality of qualityLevels) {
              const data = {
                ...mockLocationData,
                locationId: `LOC-${Date.now().toString().slice(-8)}`,
                infrastructure: {
                  ...mockLocationData.infrastructure,
                  [field]: quality
                }
              };
              
              const location = new Location(data);
              await expect(location.save()).resolves.toBeDefined();
              await location.deleteOne();
            }
          }
        });

        test('should handle special water supply types', async () => {
          const validWaterTypes = ['Municipal', 'Well', 'Shared', 'Trucked', 'Other'];

          for (const waterSupply of validWaterTypes) {
            const data = {
              ...mockLocationData,
              locationId: `LOC-${Date.now().toString().slice(-8)}`,
              infrastructure: {
                ...mockLocationData.infrastructure,
                waterSupply
              }
            };
            
            const location = new Location(data);
            await expect(location.save()).resolves.toBeDefined();
            await location.deleteOne();
          }
        });
      });

      describe('Metadata Validation', () => {
        test('should validate accuracy levels', async () => {
          const validAccuracyLevels = ['Low', 'Medium', 'High', 'Very High'];

          for (const accuracy of validAccuracyLevels) {
            const data = {
              ...mockLocationData,
              locationId: `LOC-${Date.now().toString().slice(-8)}`,
              metadata: {
                ...mockLocationData.metadata,
                accuracy
              }
            };
            
            const location = new Location(data);
            await expect(location.save()).resolves.toBeDefined();
            await location.deleteOne();
          }
        });

        test('should validate confidence range', async () => {
          const testCases = [
            { confidence: 0, shouldPass: true },
            { confidence: 100, shouldPass: true },
            { confidence: 95, shouldPass: true },
            { confidence: -10, shouldPass: false },
            { confidence: 110, shouldPass: false }
          ];

          for (const { confidence, shouldPass } of testCases) {
            const data = {
              ...mockLocationData,
              locationId: `LOC-${Date.now().toString().slice(-8)}`,
              metadata: {
                ...mockLocationData.metadata,
                confidence
              }
            };
            
            const location = new Location(data);
            
            if (shouldPass) {
              await expect(location.save()).resolves.toBeDefined();
              await location.deleteOne();
            } else {
              await expect(location.save()).rejects.toThrow();
            }
          }
        });
      });
    });

    describe('Unique Constraints', () => {
      test('should enforce unique locationId', async () => {
        const location1 = new Location(mockLocationData);
        await location1.save();
        
        const duplicateData = { ...mockLocationData };
        const location2 = new Location(duplicateData);
        
        await expect(location2.save()).rejects.toThrow(/duplicate key error/i);
      });
    });

    describe('Default Values', () => {
      test('should set default values for optional fields', async () => {
        const minimalData = {
          locationId: 'LOC-99999999',
          locationName: 'Minimal Location',
          coordinates: {
            latitude: 40.7128,
            longitude: -74.0060
          },
          address: {
            street: '123 Test St',
            city: 'Test City',
            country: 'Test Country',
            region: 'North America'
          },
          locationType: 'Urban'
        };

        const location = new Location(minimalData);
        const saved = await location.save();

        expect(saved.isActive).toBe(true); // Default value
        expect(saved.coordinates.elevation).toBe(0); // Default value
        expect(saved.riskFactors).toEqual([]); // Default empty array
        expect(saved.nearbyLandmarks).toEqual([]); // Default empty array
      });
    });
  });

  describe('Model Methods and Virtuals', () => {
    let testLocation;

    beforeEach(async () => {
      testLocation = new Location(mockLocationData);
      await testLocation.save();
    });

    describe('Instance Methods', () => {
      test('should calculate distance to another location', async () => {
        const otherLocation = {
          latitude: 41.8781,
          longitude: -87.6298 // Chicago coordinates
        };
        
        const distance = testLocation.calculateDistanceTo(otherLocation);
        
        expect(distance).toBeGreaterThan(700); // Approximate distance NYC to Chicago
        expect(distance).toBeLessThan(800);
      });

      test('should get risk score for specific peril', async () => {
        const hurricaneRisk = testLocation.getRiskScore('Hurricane');
        
        expect(hurricaneRisk).toBe(7.5);
        expect(testLocation.getRiskScore('Earthquake')).toBeNull();
      });

      test('should check if location is in high risk zone', async () => {
        expect(testLocation.isHighRisk('Hurricane')).toBe(true); // Score 7.5 > 7
        
        // Add low risk peril
        testLocation.riskFactors.push({
          peril: 'Tornado',
          riskScore: 3.0,
          probability: 0.01,
          expectedLoss: 100000
        });
        
        expect(testLocation.isHighRisk('Tornado')).toBe(false); // Score 3.0 < 7
      });

      test('should get formatted address string', async () => {
        const formattedAddress = testLocation.getFormattedAddress();
        const expected = '123 Broadway, New York, NY 10001, United States';
        
        expect(formattedAddress).toBe(expected);
      });

      test('should get nearby landmarks by type', async () => {
        const commercialLandmarks = testLocation.getNearbyLandmarksByType('Commercial');
        
        expect(commercialLandmarks).toHaveLength(1);
        expect(commercialLandmarks[0].name).toBe('Times Square');
      });

      test('should calculate overall risk score', async () => {
        // Add another risk factor
        testLocation.riskFactors.push({
          peril: 'Flood',
          riskScore: 4.0,
          probability: 0.05,
          expectedLoss: 500000
        });
        
        const overallRisk = testLocation.getOverallRiskScore();
        
        expect(overallRisk).toBeGreaterThan(0);
        expect(overallRisk).toBeLessThanOrEqual(10);
      });

      test('should check if location is coastal', async () => {
        // NYC is coastal
        expect(testLocation.isCoastal()).toBe(true);
        
        // Create inland location
        const inlandLocation = new Location({
          ...mockLocationData,
          locationId: 'LOC-88888888',
          coordinates: { latitude: 39.0458, longitude: -76.6413 }, // Baltimore (less coastal)
          environmentalFactors: {
            ...mockLocationData.environmentalFactors,
            topography: 'Flat'
          }
        });
        
        // This would require more sophisticated coastal detection logic
        // For now, we'll just test that the method exists and returns a boolean
        expect(typeof inlandLocation.isCoastal()).toBe('boolean');
      });
    });

    describe('Static Methods', () => {
      test('should find locations by region', async () => {
        const locations = await Location.findByRegion('North America');
        
        expect(locations).toHaveLength(1);
        expect(locations[0].address.region).toBe('North America');
      });

      test('should find locations by city', async () => {
        const locations = await Location.findByCity('New York');
        
        expect(locations).toHaveLength(1);
        expect(locations[0].address.city).toBe('New York');
      });

      test('should find locations by country', async () => {
        const locations = await Location.findByCountry('United States');
        
        expect(locations).toHaveLength(1);
        expect(locations[0].address.country).toBe('United States');
      });

      test('should find locations by location type', async () => {
        const urbanLocations = await Location.findByType('Urban');
        
        expect(urbanLocations).toHaveLength(1);
        expect(urbanLocations[0].locationType).toBe('Urban');
      });

      test('should find locations with specific peril risk', async () => {
        const hurricaneRiskLocations = await Location.findByPerilRisk('Hurricane');
        
        expect(hurricaneRiskLocations).toHaveLength(1);
        expect(hurricaneRiskLocations[0].riskFactors.some(rf => rf.peril === 'Hurricane')).toBe(true);
      });

      test('should find high risk locations', async () => {
        const highRiskLocations = await Location.findHighRiskLocations(7.0);
        
        expect(highRiskLocations).toHaveLength(1);
        expect(highRiskLocations[0].riskFactors.some(rf => rf.riskScore >= 7.0)).toBe(true);
      });

      test('should find locations within geographic bounds', async () => {
        const bounds = {
          minLat: 40,
          maxLat: 41,
          minLng: -75,
          maxLng: -73
        };
        
        const locationsInBounds = await Location.findInGeographicBounds(bounds);
        
        expect(locationsInBounds).toHaveLength(1);
        expect(locationsInBounds[0].locationId).toBe(mockLocationData.locationId);
      });

      test('should find locations near coordinates', async () => {
        const nearbyLocations = await Location.findNearby(40.7128, -74.0060, 10); // 10km radius
        
        expect(nearbyLocations).toHaveLength(1);
        expect(nearbyLocations[0].locationId).toBe(mockLocationData.locationId);
      });

      test('should calculate regional statistics', async () => {
        // Create additional locations for statistics
        const additionalLocations = [
          {
            ...mockLocationData,
            locationId: 'LOC-11111111',
            locationName: 'Location 2',
            riskFactors: [{ peril: 'Earthquake', riskScore: 5.0, probability: 0.01, expectedLoss: 750000 }],
            demographics: { population: 25000, populationDensity: 5000, medianIncome: 65000, vulnerablePopulation: 15 }
          },
          {
            ...mockLocationData,
            locationId: 'LOC-22222222',
            locationName: 'Location 3',
            riskFactors: [{ peril: 'Flood', riskScore: 6.0, probability: 0.03, expectedLoss: 600000 }],
            demographics: { population: 75000, populationDensity: 15000, medianIncome: 85000, vulnerablePopulation: 10 }
          }
        ];
        
        await Location.insertMany(additionalLocations);
        
        const stats = await Location.getRegionalStatistics('North America');
        
        expect(stats.totalLocations).toBe(3);
        expect(stats.totalPopulation).toBe(150000);
        expect(stats.averageRiskScore).toBeCloseTo(6.17, 1);
        expect(stats.perilDistribution.Hurricane).toBe(1);
        expect(stats.perilDistribution.Earthquake).toBe(1);
        expect(stats.perilDistribution.Flood).toBe(1);
      });
    });

    describe('Virtual Properties', () => {
      test('should calculate population density category', async () => {
        expect(testLocation.populationDensityCategory).toBeDefined();
        expect(['Low', 'Medium', 'High', 'Very High']).toContain(testLocation.populationDensityCategory);
      });

      test('should calculate risk category', async () => {
        expect(testLocation.riskCategory).toBeDefined();
        expect(['Low', 'Medium', 'High', 'Critical']).toContain(testLocation.riskCategory);
      });

      test('should calculate infrastructure score', async () => {
        expect(testLocation.infrastructureScore).toBeGreaterThan(0);
        expect(testLocation.infrastructureScore).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('Indexing and Performance', () => {
    test('should have proper indexes for efficient queries', async () => {
      const indexes = await Location.collection.getIndexes();
      
      // Check for required indexes
      expect(indexes).toHaveProperty('locationId_1');
      expect(indexes).toHaveProperty('coordinates.latitude_1');
      expect(indexes).toHaveProperty('coordinates.longitude_1');
      expect(indexes).toHaveProperty('address.region_1');
      expect(indexes).toHaveProperty('address.country_1');
      expect(indexes).toHaveProperty('locationType_1');
      expect(indexes).toHaveProperty('isActive_1');
    });

    test('should perform geospatial queries efficiently', async () => {
      // Create multiple locations for testing
      const locations = [
        { lat: 40.7589, lng: -73.9851 }, // Times Square
        { lat: 40.6892, lng: -74.0445 }, // Statue of Liberty
        { lat: 40.7505, lng: -73.9934 }  // Empire State Building
      ];

      for (let i = 0; i < locations.length; i++) {
        const locationData = {
          ...mockLocationData,
          locationId: `LOC-${String(i).padStart(8, '0')}`,
          locationName: `Location ${i}`,
          coordinates: {
            latitude: locations[i].lat,
            longitude: locations[i].lng,
            elevation: 10
          }
        };
        
        await new Location(locationData).save();
      }

      // Test geospatial query performance
      const startTime = Date.now();
      const nearbyLocations = await Location.findNearby(40.7128, -74.0060, 5); // 5km radius
      const endTime = Date.now();

      expect(nearbyLocations.length).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(100); // Should be fast
    });
  });

  describe('Data Consistency and Integrity', () => {
    test('should maintain data consistency across updates', async () => {
      const location = new Location(mockLocationData);
      await location.save();

      // Update risk score
      location.riskFactors[0].riskScore = 8.5;
      await location.save();

      // Verify the update was saved correctly
      const updatedLocation = await Location.findById(location._id);
      expect(updatedLocation.riskFactors[0].riskScore).toBe(8.5);
    });

    test('should validate data integrity on updates', async () => {
      const location = new Location(mockLocationData);
      await location.save();

      // Try to update with invalid data
      location.coordinates.latitude = 95; // Invalid latitude
      await expect(location.save()).rejects.toThrow();
    });

    test('should handle concurrent updates properly', async () => {
      const location = new Location(mockLocationData);
      await location.save();

      // Simulate concurrent updates
      const location1 = await Location.findById(location._id);
      const location2 = await Location.findById(location._id);

      location1.locationName = 'Updated Name 1';
      location2.demographics.population = 60000;

      await location1.save();
      await location2.save();

      // Verify final state
      const finalLocation = await Location.findById(location._id);
      expect(finalLocation.locationName).toBe('Updated Name 1');
      expect(finalLocation.demographics.population).toBe(60000);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle missing optional nested fields', async () => {
      const minimalData = {
        locationId: 'LOC-77777777',
        locationName: 'Minimal Location',
        coordinates: {
          latitude: 40.7128,
          longitude: -74.0060
        },
        address: {
          street: '123 Test St',
          city: 'Test City',
          country: 'Test Country',
          region: 'North America'
        },
        locationType: 'Urban'
      };

      const location = new Location(minimalData);
      const saved = await location.save();

      expect(saved.riskFactors).toEqual([]);
      expect(saved.nearbyLandmarks).toEqual([]);
      expect(saved.environmentalFactors).toBeUndefined();
      expect(saved.demographics).toBeUndefined();
      expect(saved.infrastructure).toBeUndefined();
      expect(saved.metadata).toBeUndefined();
    });

    test('should handle special characters in location names and addresses', async () => {
      const specialCharData = {
        ...mockLocationData,
        locationId: 'LOC-66666666',
        locationName: 'Café São Paulo',
        address: {
          ...mockLocationData.address,
          street: '123 Rue Saint-Honoré',
          city: 'São Paulo'
        }
      };

      const location = new Location(specialCharData);
      const saved = await location.save();

      expect(saved.locationName).toBe('Café São Paulo');
      expect(saved.address.street).toBe('123 Rue Saint-Honoré');
      expect(saved.address.city).toBe('São Paulo');
    });

    test('should handle very large coordinate arrays (polygons)', async () => {
      const largePolygon = Array.from({ length: 1000 }, (_, i) => [
        -74.0 + (i * 0.0001),
        40.7 + (i * 0.0001)
      ]);

      const locationWithLargePolygon = {
        ...mockLocationData,
        locationId: 'LOC-55555555',
        coordinates: {
          ...mockLocationData.coordinates,
          boundingPolygon: [largePolygon]
        }
      };

      const location = new Location(locationWithLargePolygon);
      await expect(location.save()).resolves.toBeDefined();
    });
  });

  describe('Performance Tests', () => {
    test('should handle bulk operations efficiently', async () => {
      const bulkData = Array.from({ length: 100 }, (_, i) => ({
        ...mockLocationData,
        locationId: `LOC-${String(i).padStart(8, '0')}`,
        locationName: `Location ${i}`,
        coordinates: {
          latitude: 40.7128 + (i * 0.001),
          longitude: -74.0060 + (i * 0.001),
          elevation: i * 10
        }
      }));

      const startTime = Date.now();
      await Location.insertMany(bulkData);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(2000); // Should complete in less than 2 seconds

      // Verify all records were inserted
      const count = await Location.countDocuments();
      expect(count).toBe(100);
    });

    test('should perform complex aggregations efficiently', async () => {
      // Insert test data
      const testData = Array.from({ length: 50 }, (_, i) => ({
        ...mockLocationData,
        locationId: `LOC-${String(i).padStart(8, '0')}`,
        locationType: i % 3 === 0 ? 'Urban' : i % 3 === 1 ? 'Suburban' : 'Rural',
        demographics: {
          population: 10000 + (i * 1000),
          populationDensity: 1000 + (i * 100),
          medianIncome: 50000 + (i * 1000),
          vulnerablePopulation: 10 + (i % 20)
        },
        riskFactors: [{
          peril: i % 3 === 0 ? 'Hurricane' : i % 3 === 1 ? 'Earthquake' : 'Flood',
          riskScore: 3 + (i % 8),
          probability: 0.01 + (i * 0.001),
          expectedLoss: 100000 + (i * 10000)
        }]
      }));

      await Location.insertMany(testData);

      const startTime = Date.now();
      const aggregation = await Location.aggregate([
        {
          $group: {
            _id: {
              locationType: '$locationType',
              region: '$address.region'
            },
            totalPopulation: { $sum: '$demographics.population' },
            avgRiskScore: { $avg: { $arrayElemAt: ['$riskFactors.riskScore', 0] } },
            count: { $sum: 1 }
          }
        },
        { $sort: { totalPopulation: -1 } }
      ]);
      const endTime = Date.now();

      expect(aggregation.length).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(500); // Should be fast
    });
  });
});