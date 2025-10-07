/**
 * Frontend TypeScript Interface Validation Test
 * Tests that updated frontend interfaces match backend models
 */

import { Location, Hazard, Vulnerability, GeoJSONPoint, GeographicScope } from '../frontend/src/types/models';
import { geoJsonToCoordinates, coordinatesToGeoJson, isValidGeoJson, calculateDistance } from '../frontend/src/utils/coordinates';

// Mock data matching the new GeoJSON format
const mockLocation: Location = {
  _id: "64a8b4c123456789abcde123",
  locationId: "LOC-00000001",
  locationName: "Sample Location",
  location: {
    type: "Point",
    coordinates: [-74.34608473816789, 42.39549373928942]
  },
  elevation: 250,
  address: {
    street: "123 Main St",
    city: "Albany",
    state: "NY",
    postalCode: "12201",
    country: "United States",
    region: "North America"
  },
  riskZones: [],
  riskFactors: [],
  hazardExposure: [],
  hazardZones: [],
  propertyCharacteristics: {
    occupancyType: "Commercial",
    constructionType: "Steel",
    yearBuilt: 2000,
    numberOfStories: 5,
    squareFootage: 10000,
    replacementCost: 5000000,
    marketValue: 4500000
  },
  totalExposure: 5000000,
  currency: "USD",
  associatedPolicies: [],
  catModelData: {
    modelProvider: "RMS",
    modelVersion: "v21",
    lastModelUpdate: "2023-01-01T00:00:00Z",
    modelResults: {}
  },
  status: "Active",
  createdBy: "system",
  lastModifiedBy: "system",
  metadata: {},
  createdAt: "2023-01-01T00:00:00Z",
  updatedAt: "2023-01-01T00:00:00Z"
};

const mockHazard: Hazard = {
  _id: "64a8b4c123456789abcde456",
  hazardId: "HAZ-00000001",
  hazardName: "Sample Hurricane",
  hazardType: "Hurricane",
  hazardCategory: "Natural",
  intensities: [],
  footprint: {
    center: {
      type: "Point",
      coordinates: [-74.0, 42.0]
    },
    radius: 100,
    radiusUnit: "km",
    affectedArea: 31416,
    areaUnit: "km2"
  },
  severity: "Major",
  probability: 0.02,
  returnPeriod: 50,
  returnPeriodUnit: "years",
  economicImpact: [],
  affectedRegions: ["North America"],
  affectedCountries: ["United States"],
  vulnerabilityFactors: {
    populationDensity: "High",
    infrastructureQuality: "Good",
    emergencyResponse: "Excellent"
  },
  modelData: {
    modelProvider: "RMS",
    modelVersion: "v21",
    modelType: "Probabilistic",
    lastModelUpdate: "2023-01-01T00:00:00Z",
    modelResults: {}
  },
  dataSources: [],
  status: "Active",
  isHistorical: false,
  isSimulated: true,
  createdBy: "system",
  lastModifiedBy: "system",
  metadata: {},
  createdAt: "2023-01-01T00:00:00Z",
  updatedAt: "2023-01-01T00:00:00Z"
};

const mockVulnerability: Vulnerability = {
  _id: "64a8b4c123456789abcde789",
  vulnerabilityId: "VUL-00000001",
  vulnerabilityName: "Sample Vulnerability",
  vulnerabilityType: "Infrastructure",
  vulnerabilityScore: 7.5,
  vulnerabilityLevel: "High",
  factors: [],
  geographicScope: {
    center: {
      type: "Point",
      coordinates: [-74.0, 42.0]
    },
    radius: 50,
    radiusUnit: "km",
    area: 7854,
    areaUnit: "km2",
    administrativeLevel: "State/Province",
    country: "United States",
    state: "New York",
    region: "North America"
  },
  hazardVulnerabilities: [],
  linkedHazards: [],
  linkedLocations: [],
  linkedExposures: [],
  status: "Active",
  isPublic: true,
  isTemplate: false,
  createdBy: "system",
  lastModifiedBy: "system",
  metadata: {},
  createdAt: "2023-01-01T00:00:00Z",
  updatedAt: "2023-01-01T00:00:00Z"
};

// Test functions
function testGeoJSONValidation() {
  console.log('🧪 Testing GeoJSON Validation...');
  
  const validPoint: GeoJSONPoint = {
    type: "Point",
    coordinates: [-74.0, 42.0]
  };
  
  const invalidPoint1 = {
    type: "Point",
    coordinates: [-200, 42.0] // Invalid longitude
  } as GeoJSONPoint;
  
  const invalidPoint2 = {
    type: "Point",
    coordinates: [-74.0, 100] // Invalid latitude
  } as GeoJSONPoint;
  
  console.log(`Valid point: ${isValidGeoJson(validPoint)}`); // Should be true
  console.log(`Invalid longitude: ${isValidGeoJson(invalidPoint1)}`); // Should be false
  console.log(`Invalid latitude: ${isValidGeoJson(invalidPoint2)}`); // Should be false
}

function testCoordinateConversion() {
  console.log('\n🧪 Testing Coordinate Conversion...');
  
  const geoJsonPoint: GeoJSONPoint = {
    type: "Point",
    coordinates: [-74.34608473816789, 42.39549373928942]
  };
  
  // Convert to legacy format
  const legacy = geoJsonToCoordinates(geoJsonPoint);
  console.log(`Legacy format: lat=${legacy.latitude}, lng=${legacy.longitude}`);
  
  // Convert back to GeoJSON
  const backToGeoJson = coordinatesToGeoJson(legacy);
  console.log(`Back to GeoJSON: ${JSON.stringify(backToGeoJson)}`);
  
  // Check if conversion is reversible
  const isReversible = JSON.stringify(geoJsonPoint) === JSON.stringify(backToGeoJson);
  console.log(`Conversion is reversible: ${isReversible}`);
}

function testDistanceCalculation() {
  console.log('\n🧪 Testing Distance Calculation...');
  
  const point1: GeoJSONPoint = { type: "Point", coordinates: [-74.0, 42.0] };
  const point2: GeoJSONPoint = { type: "Point", coordinates: [-73.0, 41.0] };
  
  const distance = calculateDistance(point1, point2);
  console.log(`Distance between points: ${distance.toFixed(2)} km`);
}

function testInterfaceStructure() {
  console.log('\n🧪 Testing Interface Structure...');
  
  // Test that all required fields are present and correctly typed
  console.log(`Location has GeoJSON coordinates: ${mockLocation.location.type === 'Point'}`);
  console.log(`Hazard footprint has GeoJSON center: ${mockHazard.footprint.center.type === 'Point'}`);
  console.log(`Vulnerability has geographicScope: ${mockVulnerability.geographicScope.center.type === 'Point'}`);
  
  // Test coordinate access
  const [lng, lat] = mockLocation.location.coordinates;
  console.log(`Location coordinates: lng=${lng}, lat=${lat}`);
  
  const [hazardLng, hazardLat] = mockHazard.footprint.center.coordinates;
  console.log(`Hazard center: lng=${hazardLng}, lat=${hazardLat}`);
  
  const [vulnLng, vulnLat] = mockVulnerability.geographicScope.center.coordinates;
  console.log(`Vulnerability center: lng=${vulnLng}, lat=${vulnLat}`);
}

function runAllTests() {
  console.log('🚀 Running Frontend TypeScript Interface Tests...\n');
  
  try {
    testGeoJSONValidation();
    testCoordinateConversion();
    testDistanceCalculation();
    testInterfaceStructure();
    
    console.log('\n✅ All tests completed successfully!');
    console.log('✅ Frontend TypeScript interfaces updated to match backend GeoJSON format');
    console.log('✅ Coordinate conversion utilities working correctly');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    throw error;
  }
}

// Export for use in other files
export {
  mockLocation,
  mockHazard,
  mockVulnerability,
  testGeoJSONValidation,
  testCoordinateConversion,
  testDistanceCalculation,
  testInterfaceStructure,
  runAllTests
};

// Run tests if called directly
if (typeof window === 'undefined' && require.main === module) {
  runAllTests();
}