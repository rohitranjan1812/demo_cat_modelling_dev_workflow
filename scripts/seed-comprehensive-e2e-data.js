/**
 * Comprehensive E2E Test Data Seeding Script
 * 
 * Seeds realistic, diverse data for thorough UI testing:
 * - 5 Policies (various types and statuses)
 * - 10 Locations (different countries, coordinates, risk levels)
 * - 25 Exposures (varied types, values, perils, statuses)
 * 
 * Run: node scripts/seed-comprehensive-e2e-data.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cat_modeling_dev';

// Import models
const Policy = require('../src/models/Policy');
const Location = require('../src/models/Location');
const Exposure = require('../src/models/Exposure');

// ============================================================================
// TEST DATA GENERATORS
// ============================================================================

const policies = [
  {
    policyNumber: 'POL-2025-001',
    accountId: 'ACC-001',
    accountName: 'TechCorp Global Insurance',
    inceptionDate: new Date('2025-01-01'),
    expiryDate: new Date('2025-12-31'),
    status: 'Active',
    policyType: 'Commercial Property',
    insured: 'TechCorp Industries Ltd.',
    broker: 'Global Insurance Brokers',
    underwriter: 'Jane Smith',
    currency: 'USD',
    totalInsuredValue: 50000000,
    premium: 250000,
    deductible: 100000,
    layers: [
      {
        layerNumber: 1,
        limit: 25000000,
        attachment: 0,
        premium: 150000,
        reinsurerShares: [{ reinsurer: 'ReinsureCo A', share: 60 }, { reinsurer: 'ReinsureCo B', share: 40 }]
      },
      {
        layerNumber: 2,
        limit: 25000000,
        attachment: 25000000,
        premium: 100000,
        reinsurerShares: [{ reinsurer: 'ReinsureCo C', share: 100 }]
      }
    ],
    coverages: ['Property Damage', 'Business Interruption', 'Equipment Breakdown'],
    createdBy: 'e2e-test',
    lastModifiedBy: 'e2e-test'
  },
  {
    policyNumber: 'POL-2025-002',
    accountId: 'ACC-002',
    accountName: 'Pacific Rim Manufacturing',
    inceptionDate: new Date('2025-02-01'),
    expiryDate: new Date('2026-01-31'),
    status: 'Active',
    policyType: 'Industrial All Risk',
    insured: 'Pacific Manufacturing Group',
    broker: 'Asia Pacific Brokers',
    underwriter: 'Michael Chen',
    currency: 'USD',
    totalInsuredValue: 75000000,
    premium: 450000,
    deductible: 250000,
    layers: [
      {
        layerNumber: 1,
        limit: 50000000,
        attachment: 0,
        premium: 300000,
        reinsurerShares: [{ reinsurer: 'SwissRe', share: 50 }, { reinsurer: 'Munich Re', share: 50 }]
      },
      {
        layerNumber: 2,
        limit: 25000000,
        attachment: 50000000,
        premium: 150000,
        reinsurerShares: [{ reinsurer: 'Hannover Re', share: 100 }]
      }
    ],
    coverages: ['Property', 'Machinery Breakdown', 'Business Interruption', 'Earthquake'],
    createdBy: 'e2e-test',
    lastModifiedBy: 'e2e-test'
  },
  {
    policyNumber: 'POL-2025-003',
    accountId: 'ACC-003',
    accountName: 'European Retail Chain',
    inceptionDate: new Date('2025-03-01'),
    expiryDate: new Date('2026-02-28'),
    status: 'Active',
    policyType: 'Package Policy',
    insured: 'EuroMart Holdings PLC',
    broker: 'London Insurance Brokers',
    underwriter: 'Sarah Williams',
    currency: 'EUR',
    totalInsuredValue: 35000000,
    premium: 175000,
    deductible: 50000,
    layers: [
      {
        layerNumber: 1,
        limit: 35000000,
        attachment: 0,
        premium: 175000,
        reinsurerShares: [{ reinsurer: 'Lloyd\'s Syndicate 123', share: 100 }]
      }
    ],
    coverages: ['Property', 'Stock', 'Public Liability'],
    createdBy: 'e2e-test',
    lastModifiedBy: 'e2e-test'
  },
  {
    policyNumber: 'POL-2024-099',
    accountId: 'ACC-004',
    accountName: 'Legacy Properties Inc',
    inceptionDate: new Date('2024-06-01'),
    expiryDate: new Date('2025-05-31'),
    status: 'Expired',
    policyType: 'Commercial Property',
    insured: 'Legacy Properties Inc',
    broker: 'Heritage Brokers',
    underwriter: 'Robert Johnson',
    currency: 'USD',
    totalInsuredValue: 15000000,
    premium: 90000,
    deductible: 25000,
    layers: [
      {
        layerNumber: 1,
        limit: 15000000,
        attachment: 0,
        premium: 90000,
        reinsurerShares: [{ reinsurer: 'Regional Re', share: 100 }]
      }
    ],
    coverages: ['Property Damage', 'Windstorm'],
    createdBy: 'e2e-test',
    lastModifiedBy: 'e2e-test'
  },
  {
    policyNumber: 'POL-2025-PEND',
    accountId: 'ACC-005',
    accountName: 'Startup Ventures LLC',
    inceptionDate: new Date('2025-06-01'),
    expiryDate: new Date('2026-05-31'),
    status: 'Pending',
    policyType: 'Commercial Package',
    insured: 'Startup Ventures LLC',
    broker: 'Innovation Insurance',
    underwriter: 'Emily Davis',
    currency: 'USD',
    totalInsuredValue: 5000000,
    premium: 35000,
    deductible: 10000,
    layers: [
      {
        layerNumber: 1,
        limit: 5000000,
        attachment: 0,
        premium: 35000,
        reinsurerShares: [{ reinsurer: 'Startup Re', share: 100 }]
      }
    ],
    coverages: ['Property', 'Cyber', 'General Liability'],
    createdBy: 'e2e-test',
    lastModifiedBy: 'e2e-test'
  }
];

const locations = [
  {
    locationId: 'LOC-US-SF-001',
    policyNumber: 'POL-2025-001',
    accountId: 'ACC-001',
    name: 'TechCorp Headquarters',
    country: 'United States',
    state: 'California',
    city: 'San Francisco',
    postalCode: '94105',
    latitude: 37.7749,
    longitude: -122.4194,
    occupancyType: 'Office',
    constructionType: 'Steel',
    numberOfBuildings: 3,
    totalArea: 150000,
    yearBuilt: 2018,
    numberOfStories: 15,
    isHighRisk: false,
    floodZone: 'X',
    seismicZone: 'Zone 4',
    createdBy: 'e2e-test',
    lastModifiedBy: 'e2e-test'
  },
  {
    locationId: 'LOC-US-NYC-001',
    policyNumber: 'POL-2025-001',
    accountId: 'ACC-001',
    name: 'TechCorp East Coast Office',
    country: 'United States',
    state: 'New York',
    city: 'New York',
    postalCode: '10001',
    latitude: 40.7128,
    longitude: -74.0060,
    occupancyType: 'Office',
    constructionType: 'Concrete',
    numberOfBuildings: 1,
    totalArea: 50000,
    yearBuilt: 2010,
    numberOfStories: 20,
    isHighRisk: false,
    floodZone: 'A',
    seismicZone: 'Zone 2',
    createdBy: 'e2e-test',
    lastModifiedBy: 'e2e-test'
  },
  {
    locationId: 'LOC-JP-TKY-001',
    policyNumber: 'POL-2025-002',
    accountId: 'ACC-002',
    name: 'Tokyo Manufacturing Plant',
    country: 'Japan',
    state: 'Tokyo',
    city: 'Tokyo',
    postalCode: '100-0001',
    latitude: 35.6762,
    longitude: 139.6503,
    occupancyType: 'Manufacturing',
    constructionType: 'Steel',
    numberOfBuildings: 5,
    totalArea: 300000,
    yearBuilt: 2015,
    numberOfStories: 4,
    isHighRisk: true,
    floodZone: 'AE',
    seismicZone: 'Zone 4',
    createdBy: 'e2e-test',
    lastModifiedBy: 'e2e-test'
  },
  {
    locationId: 'LOC-CN-SH-001',
    policyNumber: 'POL-2025-002',
    accountId: 'ACC-002',
    name: 'Shanghai Distribution Center',
    country: 'China',
    state: 'Shanghai',
    city: 'Shanghai',
    postalCode: '200000',
    latitude: 31.2304,
    longitude: 121.4737,
    occupancyType: 'Warehouse',
    constructionType: 'Concrete',
    numberOfBuildings: 2,
    totalArea: 200000,
    yearBuilt: 2019,
    numberOfStories: 3,
    isHighRisk: false,
    floodZone: 'X',
    seismicZone: 'Zone 3',
    createdBy: 'e2e-test',
    lastModifiedBy: 'e2e-test'
  },
  {
    locationId: 'LOC-UK-LON-001',
    policyNumber: 'POL-2025-003',
    accountId: 'ACC-003',
    name: 'London Flagship Store',
    country: 'United Kingdom',
    state: 'England',
    city: 'London',
    postalCode: 'SW1A 1AA',
    latitude: 51.5074,
    longitude: -0.1278,
    occupancyType: 'Retail',
    constructionType: 'Masonry',
    numberOfBuildings: 1,
    totalArea: 25000,
    yearBuilt: 1985,
    numberOfStories: 5,
    isHighRisk: false,
    floodZone: 'X',
    seismicZone: 'Zone 1',
    createdBy: 'e2e-test',
    lastModifiedBy: 'e2e-test'
  },
  {
    locationId: 'LOC-DE-BER-001',
    policyNumber: 'POL-2025-003',
    accountId: 'ACC-003',
    name: 'Berlin Retail Complex',
    country: 'Germany',
    state: 'Berlin',
    city: 'Berlin',
    postalCode: '10115',
    latitude: 52.5200,
    longitude: 13.4050,
    occupancyType: 'Retail',
    constructionType: 'Concrete',
    numberOfBuildings: 1,
    totalArea: 30000,
    yearBuilt: 2000,
    numberOfStories: 4,
    isHighRisk: false,
    floodZone: 'X',
    seismicZone: 'Zone 1',
    createdBy: 'e2e-test',
    lastModifiedBy: 'e2e-test'
  },
  {
    locationId: 'LOC-FR-PAR-001',
    policyNumber: 'POL-2025-003',
    accountId: 'ACC-003',
    name: 'Paris Shopping Center',
    country: 'France',
    state: 'Île-de-France',
    city: 'Paris',
    postalCode: '75001',
    latitude: 48.8566,
    longitude: 2.3522,
    occupancyType: 'Retail',
    constructionType: 'Mixed',
    numberOfBuildings: 1,
    totalArea: 35000,
    yearBuilt: 1995,
    numberOfStories: 6,
    isHighRisk: false,
    floodZone: 'A',
    seismicZone: 'Zone 2',
    createdBy: 'e2e-test',
    lastModifiedBy: 'e2e-test'
  },
  {
    locationId: 'LOC-US-MIA-001',
    policyNumber: 'POL-2024-099',
    accountId: 'ACC-004',
    name: 'Miami Beach Resort',
    country: 'United States',
    state: 'Florida',
    city: 'Miami Beach',
    postalCode: '33139',
    latitude: 25.7907,
    longitude: -80.1300,
    occupancyType: 'Hotel',
    constructionType: 'Concrete',
    numberOfBuildings: 2,
    totalArea: 80000,
    yearBuilt: 2005,
    numberOfStories: 10,
    isHighRisk: true,
    floodZone: 'AE',
    seismicZone: 'Zone 1',
    createdBy: 'e2e-test',
    lastModifiedBy: 'e2e-test'
  },
  {
    locationId: 'LOC-AU-SYD-001',
    policyNumber: 'POL-2025-002',
    accountId: 'ACC-002',
    name: 'Sydney Operations Center',
    country: 'Australia',
    state: 'New South Wales',
    city: 'Sydney',
    postalCode: '2000',
    latitude: -33.8688,
    longitude: 151.2093,
    occupancyType: 'Office',
    constructionType: 'Steel',
    numberOfBuildings: 1,
    totalArea: 45000,
    yearBuilt: 2020,
    numberOfStories: 12,
    isHighRisk: false,
    floodZone: 'X',
    seismicZone: 'Zone 3',
    createdBy: 'e2e-test',
    lastModifiedBy: 'e2e-test'
  },
  {
    locationId: 'LOC-US-SF-002',
    policyNumber: 'POL-2025-PEND',
    accountId: 'ACC-005',
    name: 'Startup Tech Hub',
    country: 'United States',
    state: 'California',
    city: 'San Francisco',
    postalCode: '94103',
    latitude: 37.7749,
    longitude: -122.4194,
    occupancyType: 'Office',
    constructionType: 'Wood',
    numberOfBuildings: 1,
    totalArea: 10000,
    yearBuilt: 2022,
    numberOfStories: 3,
    isHighRisk: false,
    floodZone: 'X',
    seismicZone: 'Zone 4',
    createdBy: 'e2e-test',
    lastModifiedBy: 'e2e-test'
  }
];

const exposures = [
  // TechCorp - Property exposures (Active)
  {
    policyNumber: 'POL-2025-001',
    locationId: 'LOC-US-SF-001',
    accountId: 'ACC-001',
    exposureType: 'Property',
    occupancyType: 'Office',
    constructionType: 'Steel',
    totalInsuredValue: 25000000,
    buildingValue: 20000000,
    contentsValue: 4000000,
    businessInterruptionValue: 1000000,
    currency: 'USD',
    yearBuilt: 2018,
    numberOfStories: 15,
    totalArea: 150000,
    status: 'Active',
    perils: [
      { peril: 'Earthquake', limit: 25000000, deductible: 250000 },
      { peril: 'Fire', limit: 25000000, deductible: 50000 },
      { peril: 'Flood', limit: 10000000, deductible: 100000 }
    ],
    customAttributes: {
      hasBasement: true,
      fireSuppressionSystem: 'Sprinkler',
      securityGrade: 'A',
      lastInspectionDate: '2025-01-15'
    },
    createdBy: 'e2e-test',
    lastModifiedBy: 'e2e-test'
  },
  {
    policyNumber: 'POL-2025-001',
    locationId: 'LOC-US-NYC-001',
    accountId: 'ACC-001',
    exposureType: 'Property',
    occupancyType: 'Office',
    constructionType: 'Concrete',
    totalInsuredValue: 18000000,
    buildingValue: 15000000,
    contentsValue: 2500000,
    businessInterruptionValue: 500000,
    currency: 'USD',
    yearBuilt: 2010,
    numberOfStories: 20,
    totalArea: 50000,
    status: 'Active',
    perils: [
      { peril: 'Fire', limit: 18000000, deductible: 40000 },
      { peril: 'Flood', limit: 8000000, deductible: 80000 },
      { peril: 'Windstorm', limit: 15000000, deductible: 75000 }
    ],
    customAttributes: {
      hasBasement: false,
      fireSuppressionSystem: 'Deluge',
      securityGrade: 'A+',
      lastInspectionDate: '2025-02-01'
    },
    createdBy: 'e2e-test',
    lastModifiedBy: 'e2e-test'
  },
  
  // Pacific Manufacturing - Industrial exposures (Active)
  {
    policyNumber: 'POL-2025-002',
    locationId: 'LOC-JP-TKY-001',
    accountId: 'ACC-002',
    exposureType: 'Property',
    occupancyType: 'Manufacturing',
    constructionType: 'Steel',
    totalInsuredValue: 45000000,
    buildingValue: 30000000,
    contentsValue: 12000000,
    businessInterruptionValue: 3000000,
    currency: 'USD',
    yearBuilt: 2015,
    numberOfStories: 4,
    totalArea: 300000,
    status: 'Active',
    perils: [
      { peril: 'Earthquake', limit: 45000000, deductible: 500000 },
      { peril: 'Fire', limit: 45000000, deductible: 100000 },
      { peril: 'Tsunami', limit: 20000000, deductible: 200000 }
    ],
    customAttributes: {
      hasHazardousMaterials: true,
      fireSuppressionSystem: 'Foam',
      securityGrade: 'B',
      earthquakeRetrofitted: true,
      lastInspectionDate: '2025-01-20'
    },
    createdBy: 'e2e-test',
    lastModifiedBy: 'e2e-test'
  },
  {
    policyNumber: 'POL-2025-002',
    locationId: 'LOC-CN-SH-001',
    accountId: 'ACC-002',
    exposureType: 'Property',
    occupancyType: 'Warehouse',
    constructionType: 'Concrete',
    totalInsuredValue: 22000000,
    buildingValue: 12000000,
    contentsValue: 9000000,
    businessInterruptionValue: 1000000,
    currency: 'USD',
    yearBuilt: 2019,
    numberOfStories: 3,
    totalArea: 200000,
    status: 'Active',
    perils: [
      { peril: 'Fire', limit: 22000000, deductible: 60000 },
      { peril: 'Flood', limit: 15000000, deductible: 150000 },
      { peril: 'Windstorm', limit: 20000000, deductible: 100000 }
    ],
    customAttributes: {
      hasAutomatedSystems: true,
      fireSuppressionSystem: 'Sprinkler',
      securityGrade: 'A',
      lastInspectionDate: '2025-02-10'
    },
    createdBy: 'e2e-test',
    lastModifiedBy: 'e2e-test'
  },
  {
    policyNumber: 'POL-2025-002',
    locationId: 'LOC-AU-SYD-001',
    accountId: 'ACC-002',
    exposureType: 'Property',
    occupancyType: 'Office',
    constructionType: 'Steel',
    totalInsuredValue: 16000000,
    buildingValue: 13000000,
    contentsValue: 2500000,
    businessInterruptionValue: 500000,
    currency: 'USD',
    yearBuilt: 2020,
    numberOfStories: 12,
    totalArea: 45000,
    status: 'Active',
    perils: [
      { peril: 'Fire', limit: 16000000, deductible: 35000 },
      { peril: 'Windstorm', limit: 14000000, deductible: 70000 }
    ],
    customAttributes: {
      greenBuilding: true,
      fireSuppressionSystem: 'Sprinkler',
      securityGrade: 'A',
      lastInspectionDate: '2025-03-01'
    },
    createdBy: 'e2e-test',
    lastModifiedBy: 'e2e-test'
  },
  
  // European Retail - Retail exposures (Active)
  {
    policyNumber: 'POL-2025-003',
    locationId: 'LOC-UK-LON-001',
    accountId: 'ACC-003',
    exposureType: 'Property',
    occupancyType: 'Retail',
    constructionType: 'Masonry',
    totalInsuredValue: 12000000,
    buildingValue: 8000000,
    contentsValue: 3500000,
    businessInterruptionValue: 500000,
    currency: 'EUR',
    yearBuilt: 1985,
    numberOfStories: 5,
    totalArea: 25000,
    status: 'Active',
    perils: [
      { peril: 'Fire', limit: 12000000, deductible: 30000 },
      { peril: 'Theft', limit: 3500000, deductible: 10000 }
    ],
    customAttributes: {
      historicBuilding: true,
      fireSuppressionSystem: 'Sprinkler',
      securityGrade: 'B',
      lastInspectionDate: '2025-03-15'
    },
    createdBy: 'e2e-test',
    lastModifiedBy: 'e2e-test'
  },
  {
    policyNumber: 'POL-2025-003',
    locationId: 'LOC-DE-BER-001',
    accountId: 'ACC-003',
    exposureType: 'Property',
    occupancyType: 'Retail',
    constructionType: 'Concrete',
    totalInsuredValue: 11000000,
    buildingValue: 7000000,
    contentsValue: 3500000,
    businessInterruptionValue: 500000,
    currency: 'EUR',
    yearBuilt: 2000,
    numberOfStories: 4,
    totalArea: 30000,
    status: 'Active',
    perils: [
      { peril: 'Fire', limit: 11000000, deductible: 28000 },
      { peril: 'Theft', limit: 3500000, deductible: 10000 }
    ],
    customAttributes: {
      modernSecurity: true,
      fireSuppressionSystem: 'Sprinkler',
      securityGrade: 'A',
      lastInspectionDate: '2025-03-20'
    },
    createdBy: 'e2e-test',
    lastModifiedBy: 'e2e-test'
  },
  {
    policyNumber: 'POL-2025-003',
    locationId: 'LOC-FR-PAR-001',
    accountId: 'ACC-003',
    exposureType: 'Property',
    occupancyType: 'Retail',
    constructionType: 'Mixed',
    totalInsuredValue: 13000000,
    buildingValue: 8000000,
    contentsValue: 4500000,
    businessInterruptionValue: 500000,
    currency: 'EUR',
    yearBuilt: 1995,
    numberOfStories: 6,
    totalArea: 35000,
    status: 'Active',
    perils: [
      { peril: 'Fire', limit: 13000000, deductible: 32000 },
      { peril: 'Flood', limit: 8000000, deductible: 80000 },
      { peril: 'Theft', limit: 4500000, deductible: 15000 }
    ],
    customAttributes: {
      shoppingCenter: true,
      fireSuppressionSystem: 'Sprinkler',
      securityGrade: 'A',
      lastInspectionDate: '2025-03-18'
    },
    createdBy: 'e2e-test',
    lastModifiedBy: 'e2e-test'
  },
  
  // Legacy Properties - Expired exposure
  {
    policyNumber: 'POL-2024-099',
    locationId: 'LOC-US-MIA-001',
    accountId: 'ACC-004',
    exposureType: 'Property',
    occupancyType: 'Hotel',
    constructionType: 'Concrete',
    totalInsuredValue: 15000000,
    buildingValue: 12000000,
    contentsValue: 2500000,
    businessInterruptionValue: 500000,
    currency: 'USD',
    yearBuilt: 2005,
    numberOfStories: 10,
    totalArea: 80000,
    status: 'Expired',
    perils: [
      { peril: 'Windstorm', limit: 15000000, deductible: 150000 },
      { peril: 'Flood', limit: 10000000, deductible: 100000 },
      { peril: 'Fire', limit: 15000000, deductible: 40000 }
    ],
    customAttributes: {
      beachfront: true,
      hurricaneShutters: true,
      fireSuppressionSystem: 'Sprinkler',
      securityGrade: 'B',
      lastInspectionDate: '2024-06-15'
    },
    createdBy: 'e2e-test',
    lastModifiedBy: 'e2e-test'
  },
  
  // Startup Ventures - Pending exposure
  {
    policyNumber: 'POL-2025-PEND',
    locationId: 'LOC-US-SF-002',
    accountId: 'ACC-005',
    exposureType: 'Property',
    occupancyType: 'Office',
    constructionType: 'Wood',
    totalInsuredValue: 3500000,
    buildingValue: 2000000,
    contentsValue: 1300000,
    businessInterruptionValue: 200000,
    currency: 'USD',
    yearBuilt: 2022,
    numberOfStories: 3,
    totalArea: 10000,
    status: 'Pending',
    perils: [
      { peril: 'Fire', limit: 3500000, deductible: 15000 },
      { peril: 'Earthquake', limit: 3500000, deductible: 35000 }
    ],
    customAttributes: {
      sharedSpace: true,
      fireSuppressionSystem: 'Sprinkler',
      securityGrade: 'C',
      lastInspectionDate: '2025-04-01'
    },
    createdBy: 'e2e-test',
    lastModifiedBy: 'e2e-test'
  },
  
  // Additional varied exposures for testing filters
  {
    policyNumber: 'POL-2025-001',
    locationId: 'LOC-US-SF-001',
    accountId: 'ACC-001',
    exposureType: 'Casualty',
    occupancyType: 'Office',
    constructionType: 'Steel',
    totalInsuredValue: 5000000,
    buildingValue: 0,
    contentsValue: 0,
    businessInterruptionValue: 0,
    currency: 'USD',
    yearBuilt: 2018,
    numberOfStories: 15,
    totalArea: 150000,
    status: 'Active',
    perils: [
      { peril: 'Liability', limit: 5000000, deductible: 25000 }
    ],
    customAttributes: {
      employeeCount: 500,
      coverageType: 'General Liability'
    },
    createdBy: 'e2e-test',
    lastModifiedBy: 'e2e-test'
  },
  {
    policyNumber: 'POL-2025-002',
    locationId: 'LOC-JP-TKY-001',
    accountId: 'ACC-002',
    exposureType: 'Casualty',
    occupancyType: 'Manufacturing',
    constructionType: 'Steel',
    totalInsuredValue: 10000000,
    buildingValue: 0,
    contentsValue: 0,
    businessInterruptionValue: 0,
    currency: 'USD',
    yearBuilt: 2015,
    numberOfStories: 4,
    totalArea: 300000,
    status: 'Active',
    perils: [
      { peril: 'Liability', limit: 10000000, deductible: 50000 },
      { peril: 'Product Liability', limit: 5000000, deductible: 25000 }
    ],
    customAttributes: {
      employeeCount: 800,
      coverageType: 'Product & General Liability'
    },
    createdBy: 'e2e-test',
    lastModifiedBy: 'e2e-test'
  },
  
  // Specialty exposures - Cyber
  {
    policyNumber: 'POL-2025-PEND',
    locationId: 'LOC-US-SF-002',
    accountId: 'ACC-005',
    exposureType: 'Cyber',
    occupancyType: 'Office',
    constructionType: 'Wood',
    totalInsuredValue: 1500000,
    buildingValue: 0,
    contentsValue: 0,
    businessInterruptionValue: 0,
    currency: 'USD',
    yearBuilt: 2022,
    numberOfStories: 3,
    totalArea: 10000,
    status: 'Pending',
    perils: [
      { peril: 'Cyber', limit: 1500000, deductible: 10000 }
    ],
    customAttributes: {
      dataRecords: 100000,
      cloudProvider: 'AWS',
      coverageType: 'Data Breach & Business Interruption'
    },
    createdBy: 'e2e-test',
    lastModifiedBy: 'e2e-test'
  },
  
  // Additional Property exposures with varied characteristics
  {
    policyNumber: 'POL-2025-001',
    locationId: 'LOC-US-SF-001',
    accountId: 'ACC-001',
    exposureType: 'Property',
    occupancyType: 'Office',
    constructionType: 'Steel',
    totalInsuredValue: 8000000,
    buildingValue: 6000000,
    contentsValue: 1800000,
    businessInterruptionValue: 200000,
    currency: 'USD',
    yearBuilt: 2018,
    numberOfStories: 15,
    totalArea: 150000,
    status: 'Inactive',
    perils: [
      { peril: 'Fire', limit: 8000000, deductible: 20000 }
    ],
    customAttributes: {
      wing: 'North',
      renovationPlanned: true,
      lastInspectionDate: '2024-12-01'
    },
    createdBy: 'e2e-test',
    lastModifiedBy: 'e2e-test'
  },
  {
    policyNumber: 'POL-2025-002',
    locationId: 'LOC-JP-TKY-001',
    accountId: 'ACC-002',
    exposureType: 'Property',
    occupancyType: 'Manufacturing',
    constructionType: 'Steel',
    totalInsuredValue: 28000000,
    buildingValue: 18000000,
    contentsValue: 8500000,
    businessInterruptionValue: 1500000,
    currency: 'USD',
    yearBuilt: 2015,
    numberOfStories: 4,
    totalArea: 300000,
    status: 'Under Review',
    perils: [
      { peril: 'Fire', limit: 28000000, deductible: 75000 },
      { peril: 'Equipment Breakdown', limit: 10000000, deductible: 50000 }
    ],
    customAttributes: {
      productionLine: 'Electronics',
      machineryAge: 3,
      lastInspectionDate: '2025-03-15'
    },
    createdBy: 'e2e-test',
    lastModifiedBy: 'e2e-test'
  },
  
  // More varied value ranges for testing filters
  {
    policyNumber: 'POL-2025-003',
    locationId: 'LOC-UK-LON-001',
    accountId: 'ACC-003',
    exposureType: 'Property',
    occupancyType: 'Retail',
    constructionType: 'Masonry',
    totalInsuredValue: 500000,
    buildingValue: 200000,
    contentsValue: 280000,
    businessInterruptionValue: 20000,
    currency: 'EUR',
    yearBuilt: 1985,
    numberOfStories: 5,
    totalArea: 25000,
    status: 'Active',
    perils: [
      { peril: 'Fire', limit: 500000, deductible: 5000 }
    ],
    customAttributes: {
      department: 'Home Goods',
      floor: 2,
      lastInspectionDate: '2025-04-01'
    },
    createdBy: 'e2e-test',
    lastModifiedBy: 'e2e-test'
  },
  {
    policyNumber: 'POL-2025-002',
    locationId: 'LOC-CN-SH-001',
    accountId: 'ACC-002',
    exposureType: 'Property',
    occupancyType: 'Warehouse',
    constructionType: 'Concrete',
    totalInsuredValue: 75000000,
    buildingValue: 40000000,
    contentsValue: 30000000,
    businessInterruptionValue: 5000000,
    currency: 'USD',
    yearBuilt: 2019,
    numberOfStories: 3,
    totalArea: 200000,
    status: 'Active',
    perils: [
      { peril: 'Fire', limit: 75000000, deductible: 200000 },
      { peril: 'Flood', limit: 50000000, deductible: 500000 },
      { peril: 'Windstorm', limit: 60000000, deductible: 300000 }
    ],
    customAttributes: {
      storageType: 'High-Value Electronics',
      coldStorage: false,
      lastInspectionDate: '2025-03-25'
    },
    createdBy: 'e2e-test',
    lastModifiedBy: 'e2e-test'
  },
  
  // Edge cases - very low and very high values
  {
    policyNumber: 'POL-2025-PEND',
    locationId: 'LOC-US-SF-002',
    accountId: 'ACC-005',
    exposureType: 'Property',
    occupancyType: 'Office',
    constructionType: 'Wood',
    totalInsuredValue: 150000,
    buildingValue: 50000,
    contentsValue: 90000,
    businessInterruptionValue: 10000,
    currency: 'USD',
    yearBuilt: 2022,
    numberOfStories: 3,
    totalArea: 10000,
    status: 'Pending',
    perils: [
      { peril: 'Fire', limit: 150000, deductible: 1000 }
    ],
    customAttributes: {
      sharedSpace: true,
      sublease: true,
      lastInspectionDate: '2025-04-10'
    },
    createdBy: 'e2e-test',
    lastModifiedBy: 'e2e-test'
  },
  {
    policyNumber: 'POL-2025-002',
    locationId: 'LOC-JP-TKY-001',
    accountId: 'ACC-002',
    exposureType: 'Property',
    occupancyType: 'Manufacturing',
    constructionType: 'Steel',
    totalInsuredValue: 150000000,
    buildingValue: 100000000,
    contentsValue: 40000000,
    businessInterruptionValue: 10000000,
    currency: 'USD',
    yearBuilt: 2015,
    numberOfStories: 4,
    totalArea: 300000,
    status: 'Active',
    perils: [
      { peril: 'Earthquake', limit: 150000000, deductible: 1500000 },
      { peril: 'Fire', limit: 150000000, deductible: 400000 },
      { peril: 'Tsunami', limit: 75000000, deductible: 750000 }
    ],
    customAttributes: {
      criticalInfrastructure: true,
      specializedEquipment: true,
      earthquakeRetrofitted: true,
      lastInspectionDate: '2025-03-30'
    },
    createdBy: 'e2e-test',
    lastModifiedBy: 'e2e-test'
  },
  
  // Different construction types for filter testing
  {
    policyNumber: 'POL-2025-003',
    locationId: 'LOC-FR-PAR-001',
    accountId: 'ACC-003',
    exposureType: 'Property',
    occupancyType: 'Retail',
    constructionType: 'Mixed',
    totalInsuredValue: 9500000,
    buildingValue: 6000000,
    contentsValue: 3000000,
    businessInterruptionValue: 500000,
    currency: 'EUR',
    yearBuilt: 1995,
    numberOfStories: 6,
    totalArea: 35000,
    status: 'Active',
    perils: [
      { peril: 'Fire', limit: 9500000, deductible: 25000 }
    ],
    customAttributes: {
      parkingLevels: 2,
      restaurantOnSite: true,
      lastInspectionDate: '2025-04-05'
    },
    createdBy: 'e2e-test',
    lastModifiedBy: 'e2e-test'
  },
  {
    policyNumber: 'POL-2024-099',
    locationId: 'LOC-US-MIA-001',
    accountId: 'ACC-004',
    exposureType: 'Property',
    occupancyType: 'Hotel',
    constructionType: 'Concrete',
    totalInsuredValue: 8500000,
    buildingValue: 7000000,
    contentsValue: 1300000,
    businessInterruptionValue: 200000,
    currency: 'USD',
    yearBuilt: 2005,
    numberOfStories: 10,
    totalArea: 80000,
    status: 'Expired',
    perils: [
      { peril: 'Windstorm', limit: 8500000, deductible: 85000 },
      { peril: 'Fire', limit: 8500000, deductible: 22000 }
    ],
    customAttributes: {
      poolArea: true,
      oceanView: true,
      lastInspectionDate: '2024-05-20'
    },
    createdBy: 'e2e-test',
    lastModifiedBy: 'e2e-test'
  },
  
  // Additional statuses for comprehensive testing
  {
    policyNumber: 'POL-2025-001',
    locationId: 'LOC-US-NYC-001',
    accountId: 'ACC-001',
    exposureType: 'Property',
    occupancyType: 'Office',
    constructionType: 'Concrete',
    totalInsuredValue: 12000000,
    buildingValue: 10000000,
    contentsValue: 1800000,
    businessInterruptionValue: 200000,
    currency: 'USD',
    yearBuilt: 2010,
    numberOfStories: 20,
    totalArea: 50000,
    status: 'Under Review',
    perils: [
      { peril: 'Fire', limit: 12000000, deductible: 30000 }
    ],
    customAttributes: {
      recentRenovation: true,
      upgradePending: true,
      lastInspectionDate: '2025-03-28'
    },
    createdBy: 'e2e-test',
    lastModifiedBy: 'e2e-test'
  },
  {
    policyNumber: 'POL-2025-003',
    locationId: 'LOC-DE-BER-001',
    accountId: 'ACC-003',
    exposureType: 'Property',
    occupancyType: 'Retail',
    constructionType: 'Concrete',
    totalInsuredValue: 7200000,
    buildingValue: 4500000,
    contentsValue: 2500000,
    businessInterruptionValue: 200000,
    currency: 'EUR',
    yearBuilt: 2000,
    numberOfStories: 4,
    totalArea: 30000,
    status: 'Cancelled',
    perils: [
      { peril: 'Fire', limit: 7200000, deductible: 18000 }
    ],
    customAttributes: {
      leaseExpired: true,
      closurePlanned: true,
      lastInspectionDate: '2024-11-30'
    },
    createdBy: 'e2e-test',
    lastModifiedBy: 'e2e-test'
  },
  {
    policyNumber: 'POL-2025-002',
    locationId: 'LOC-AU-SYD-001',
    accountId: 'ACC-002',
    exposureType: 'Property',
    occupancyType: 'Office',
    constructionType: 'Steel',
    totalInsuredValue: 19000000,
    buildingValue: 15500000,
    contentsValue: 3000000,
    businessInterruptionValue: 500000,
    currency: 'USD',
    yearBuilt: 2020,
    numberOfStories: 12,
    totalArea: 45000,
    status: 'Suspended',
    perils: [
      { peril: 'Fire', limit: 19000000, deductible: 45000 }
    ],
    customAttributes: {
      paymentIssue: true,
      reinstateBy: '2025-06-01',
      lastInspectionDate: '2025-02-28'
    },
    createdBy: 'e2e-test',
    lastModifiedBy: 'e2e-test'
  }
];

// ============================================================================
// SEEDING FUNCTIONS
// ============================================================================

async function clearExistingData() {
  console.log('\n🗑️  Clearing existing E2E test data...');
  
  const deleteResults = await Promise.all([
    Exposure.deleteMany({ createdBy: 'e2e-test' }),
    Location.deleteMany({ createdBy: 'e2e-test' }),
    Policy.deleteMany({ createdBy: 'e2e-test' })
  ]);
  
  console.log(`   ✓ Deleted ${deleteResults[0].deletedCount} exposures`);
  console.log(`   ✓ Deleted ${deleteResults[1].deletedCount} locations`);
  console.log(`   ✓ Deleted ${deleteResults[2].deletedCount} policies`);
}

async function seedPolicies() {
  console.log('\n📋 Seeding policies...');
  
  for (const policy of policies) {
    try {
      await Policy.create(policy);
      console.log(`   ✓ Created policy: ${policy.policyNumber} - ${policy.accountName}`);
    } catch (error) {
      console.error(`   ✗ Failed to create policy ${policy.policyNumber}:`, error.message);
    }
  }
}

async function seedLocations() {
  console.log('\n📍 Seeding locations...');
  
  for (const location of locations) {
    try {
      await Location.create(location);
      console.log(`   ✓ Created location: ${location.locationId} - ${location.name} (${location.city}, ${location.country})`);
    } catch (error) {
      console.error(`   ✗ Failed to create location ${location.locationId}:`, error.message);
    }
  }
}

async function seedExposures() {
  console.log('\n🏢 Seeding exposures...');
  
  for (const exposure of exposures) {
    try {
      await Exposure.create(exposure);
      const formattedValue = new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: exposure.currency,
        maximumFractionDigits: 0 
      }).format(exposure.totalInsuredValue);
      console.log(`   ✓ Created exposure: ${exposure.exposureType} - ${exposure.locationId} (${formattedValue}, ${exposure.status})`);
    } catch (error) {
      console.error(`   ✗ Failed to create exposure for ${exposure.locationId}:`, error.message);
    }
  }
}

async function printSummary() {
  console.log('\n📊 Data Summary:');
  console.log('═══════════════════════════════════════════════════════════════');
  
  const policiesCount = await Policy.countDocuments({ createdBy: 'e2e-test' });
  const locationsCount = await Location.countDocuments({ createdBy: 'e2e-test' });
  const exposuresCount = await Exposure.countDocuments({ createdBy: 'e2e-test' });
  
  console.log(`\n📋 Policies: ${policiesCount}`);
  const policyStats = await Policy.aggregate([
    { $match: { createdBy: 'e2e-test' } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  policyStats.forEach(stat => console.log(`   - ${stat._id}: ${stat.count}`));
  
  console.log(`\n📍 Locations: ${locationsCount}`);
  const locationStats = await Location.aggregate([
    { $match: { createdBy: 'e2e-test' } },
    { $group: { _id: '$country', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  locationStats.forEach(stat => console.log(`   - ${stat._id}: ${stat.count}`));
  
  console.log(`\n🏢 Exposures: ${exposuresCount}`);
  
  const exposureByType = await Exposure.aggregate([
    { $match: { createdBy: 'e2e-test' } },
    { $group: { _id: '$exposureType', count: { $sum: 1 } } }
  ]);
  console.log('\n   By Type:');
  exposureByType.forEach(stat => console.log(`   - ${stat._id}: ${stat.count}`));
  
  const exposureByStatus = await Exposure.aggregate([
    { $match: { createdBy: 'e2e-test' } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  console.log('\n   By Status:');
  exposureByStatus.forEach(stat => console.log(`   - ${stat._id}: ${stat.count}`));
  
  const exposureByConstruction = await Exposure.aggregate([
    { $match: { createdBy: 'e2e-test' } },
    { $group: { _id: '$constructionType', count: { $sum: 1 } } }
  ]);
  console.log('\n   By Construction:');
  exposureByConstruction.forEach(stat => console.log(`   - ${stat._id}: ${stat.count}`));
  
  const valueStats = await Exposure.aggregate([
    { $match: { createdBy: 'e2e-test' } },
    {
      $group: {
        _id: null,
        total: { $sum: '$totalInsuredValue' },
        avg: { $avg: '$totalInsuredValue' },
        min: { $min: '$totalInsuredValue' },
        max: { $max: '$totalInsuredValue' }
      }
    }
  ]);
  
  if (valueStats.length > 0) {
    const stats = valueStats[0];
    console.log('\n   Value Statistics (USD):');
    console.log(`   - Total: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(stats.total)}`);
    console.log(`   - Average: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(stats.avg)}`);
    console.log(`   - Min: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(stats.min)}`);
    console.log(`   - Max: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(stats.max)}`);
  }
  
  console.log('\n═══════════════════════════════════════════════════════════════');
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('🚀 Starting Comprehensive E2E Data Seeding');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`📅 Date: ${new Date().toLocaleString()}`);
  console.log(`🔗 MongoDB URI: ${MONGODB_URI}`);
  console.log('═══════════════════════════════════════════════════════════════');
  
  try {
    // Connect to MongoDB
    console.log('\n🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('   ✓ Connected successfully');
    
    // Clear existing test data
    await clearExistingData();
    
    // Seed data in order (policies → locations → exposures)
    await seedPolicies();
    await seedLocations();
    await seedExposures();
    
    // Print summary
    await printSummary();
    
    console.log('\n✅ E2E Data Seeding Complete!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Start backend: npm start');
    console.log('   2. Start frontend: cd frontend && npm start');
    console.log('   3. Open browser: http://localhost:3000/exposures');
    console.log('   4. Test all UI features with the seeded data');
    console.log('\n═══════════════════════════════════════════════════════════════');
    
  } catch (error) {
    console.error('\n❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the seeding script
main();
