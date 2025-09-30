/**
 * Sample Data for Mock Database
 * Provides realistic test data for development and testing
 */

const sampleHazards = [
  {
    _id: 'hazard_1',
    name: 'Hurricane Maria',
    hazardType: 'Hurricane',
    hazardCategory: 'Natural',
    severity: 'High',
    probability: 0.15,
    status: 'Active',
    affectedRegions: ['North America', 'Caribbean'],
    affectedCountries: ['USA', 'Puerto Rico', 'Dominican Republic'],
    isHistorical: false,
    isSimulated: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    _id: 'hazard_2',
    name: 'California Earthquake',
    hazardType: 'Earthquake',
    hazardCategory: 'Natural',
    severity: 'Very High',
    probability: 0.08,
    status: 'Active',
    affectedRegions: ['North America'],
    affectedCountries: ['USA'],
    isHistorical: false,
    isSimulated: true,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  },
  {
    _id: 'hazard_3',
    name: 'European Flood',
    hazardType: 'Flood',
    hazardCategory: 'Natural',
    severity: 'Medium',
    probability: 0.25,
    status: 'Active',
    affectedRegions: ['Europe'],
    affectedCountries: ['Germany', 'Netherlands', 'Belgium'],
    isHistorical: false,
    isSimulated: true,
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25')
  }
];

const sampleVulnerabilities = [
  {
    _id: 'vuln_1',
    name: 'Coastal Infrastructure',
    vulnerabilityType: 'Infrastructure',
    severity: 'High',
    riskScore: 85,
    affectedRegions: ['North America', 'Europe'],
    status: 'Active',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
  {
    _id: 'vuln_2',
    name: 'Urban Development',
    vulnerabilityType: 'Urban',
    severity: 'Medium',
    riskScore: 65,
    affectedRegions: ['Asia Pacific'],
    status: 'Active',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12')
  }
];

const sampleSimulations = [
  {
    _id: 'sim_1',
    name: 'Hurricane Impact Analysis',
    status: 'Completed',
    hazardType: 'Hurricane',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    _id: 'sim_2',
    name: 'Earthquake Risk Assessment',
    status: 'Running',
    hazardType: 'Earthquake',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  }
];

const sampleAccounts = [
  {
    _id: 'acc_1',
    name: 'Global Insurance Corp',
    accountType: 'Corporate',
    status: 'Active',
    totalExposure: 50000000,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    _id: 'acc_2',
    name: 'Regional Reinsurance Ltd',
    accountType: 'Reinsurance',
    status: 'Active',
    totalExposure: 25000000,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05')
  }
];

module.exports = {
  sampleHazards,
  sampleVulnerabilities,
  sampleSimulations,
  sampleAccounts
};
