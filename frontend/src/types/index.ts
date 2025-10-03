// Common types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

// Hazard types
export interface Hazard {
  _id: string;
  hazardId: string;
  hazardName: string;
  hazardType: HazardType;
  hazardCategory: 'Natural' | 'Man-made' | 'Emerging' | 'Compound' | 'Cascading';
  description?: string;
  hazardDescription?: string;
  intensities?: Array<{
    scale: 'Richter' | 'Mercalli' | 'Saffir-Simpson' | 'Fujita' | 'Enhanced Fujita' | 'Beaufort' | 'Custom';
    value: number;
    unit: string;
    description?: string;
  }>;
  footprint: {
    centerLatitude: number;
    centerLongitude: number;
    radius: number;
    unit: 'km' | 'miles' | 'nautical_miles';
    affectedArea?: number;
    areaUnit?: 'km2' | 'miles2' | 'acres' | 'hectares';
    polygon?: number[][][];
  };
  temporal: {
    startTime: string;
    endTime?: string;
    duration?: number;
    durationUnit?: 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months';
    peakIntensityTime?: string;
    warningTime?: number;
    warningTimeUnit?: 'seconds' | 'minutes' | 'hours' | 'days';
  };
  severity: SeverityLevel;
  probability: number;
  returnPeriod?: number;
  returnPeriodUnit?: 'years' | 'months' | 'days';
  economicImpact?: Array<{
    estimatedLoss: number;
    currency: string;
    confidenceLevel?: number;
    lossType?: 'Property' | 'Business Interruption' | 'Infrastructure' | 'Agricultural' | 'Total';
    methodology?: string;
  }>;
  affectedRegions: string[];
  affectedCountries: string[];
  linkedVulnerabilities?: Array<{
    vulnerabilityId: string;
    relationshipType: 'Primary' | 'Secondary' | 'Related' | 'Cascading';
    vulnerabilityScore?: number;
    linkedAt: string;
  }>;
  climateChangeImpact?: {
    isClimateRelated: boolean;
    climateScenario?: 'RCP2.6' | 'RCP4.5' | 'RCP6.0' | 'RCP8.5' | 'Historical' | 'Custom';
    temperatureIncrease?: number;
    seaLevelRise?: number;
    precipitationChange?: number;
  };
  modelData?: {
    modelProvider?: string;
    modelVersion?: string;
    modelType?: 'Probabilistic' | 'Deterministic' | 'Scenario' | 'Hybrid';
    resolution?: 'High' | 'Medium' | 'Low' | 'Variable';
    lastModelUpdate?: string;
  };
  isHistorical: boolean;
  isSimulated: boolean;
  status: 'Active' | 'Inactive' | 'Under Review' | 'Deprecated' | 'Draft';
  createdBy: string;
  lastModifiedBy: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface HazardEvent {
  _id: string;
  eventId: string;
  hazardId: string;
  eventName: string;
  eventType: string;
  description: string;
  startDate: string;
  endDate?: string;
  duration: number;
  durationUnit: 'hours' | 'days' | 'weeks' | 'months';
  intensity: number;
  severity: SeverityLevel;
  affectedArea: {
    type: 'Point' | 'Polygon' | 'MultiPolygon';
    coordinates: number[] | number[][][] | number[][][][];
    radius?: number;
  };
  impactMetrics: {
    totalLoss: number;
    insuredLoss: number;
    affectedPopulation: number;
    fatalities: number;
    injuries: number;
    currency: string;
  };
  status: 'Ongoing' | 'Completed' | 'Cancelled';
  metadata: {
    source: string;
    lastUpdated: string;
    version: string;
    tags: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface HazardZone {
  _id: string;
  zoneId: string;
  zoneName: string;
  hazardType: HazardType;
  zoneType: 'High Risk' | 'Medium Risk' | 'Low Risk' | 'Safe Zone';
  description: string;
  geographicBoundary: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
  riskLevel: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
  probability: number;
  affectedRegions: string[];
  affectedCountries: string[];
  status: 'Active' | 'Inactive' | 'Archived';
  metadata: {
    source: string;
    lastUpdated: string;
    version: string;
    tags: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface HazardScenario {
  _id: string;
  scenarioId: string;
  scenarioName: string;
  description: string;
  hazardType: HazardType;
  scenarioType: 'Probabilistic' | 'Deterministic' | 'Scenario' | 'Hybrid';
  parameters: {
    intensity: number;
    probability: number;
    duration: number;
    durationUnit: 'hours' | 'days' | 'weeks' | 'months';
    geographicScope: {
      regions: string[];
      countries: string[];
      coordinates?: {
        type: 'Polygon' | 'MultiPolygon';
        coordinates: number[][][];
      };
    };
  };
  expectedImpact: {
    totalLoss: number;
    insuredLoss: number;
    affectedPopulation: number;
    currency: string;
  };
  status: 'Draft' | 'Active' | 'Running' | 'Completed' | 'Failed' | 'Cancelled';
  metadata: {
    source: string;
    lastUpdated: string;
    version: string;
    tags: string[];
  };
  createdAt: string;
  updatedAt: string;
}

// Vulnerability types
export interface Vulnerability {
  _id: string;
  vulnerabilityId: string;
  vulnerabilityName: string;
  vulnerabilityDescription?: string;
  vulnerabilityType: 'Physical' | 'Social' | 'Economic' | 'Environmental' | 'Institutional' | 'Infrastructure' | 'Multi-dimensional';
  vulnerabilityCategory: 'Individual' | 'Community' | 'Regional' | 'National' | 'Global';
  geographicScope: {
    centerLatitude: number;
    centerLongitude: number;
    radius: number;
    radiusUnit: 'km' | 'miles' | 'nautical_miles';
    area?: number;
    areaUnit?: 'km2' | 'miles2' | 'acres' | 'hectares';
    polygon?: number[][][];
    administrativeLevel: 'National' | 'State/Province' | 'County/District' | 'Municipal' | 'Local' | 'Custom';
    country: string;
    state?: string;
    region: 'North America' | 'Europe' | 'Asia Pacific' | 'Latin America' | 'Middle East' | 'Africa';
  };
  overallVulnerabilityScore: number;
  overallRiskLevel: RiskLevel;
  confidenceLevel: 'Low' | 'Medium' | 'High' | 'Very High';
  vulnerabilityFactors?: Array<{
    factorType: string;
    factorName: string;
    factorValue: number;
    weight: number;
    unit?: string;
    description?: string;
    dataSource?: string;
    lastUpdated: string;
  }>;
  hazardVulnerabilities: Array<{
    hazardType: HazardType;
    vulnerabilityScore: number;
    confidenceLevel: 'Low' | 'Medium' | 'High' | 'Very High';
    methodology?: string;
    lastUpdated: string;
  }>;
  exposureVulnerabilities?: Array<{
    exposureType: string;
    exposureValue: number;
    currency?: string;
    exposureUnit?: string;
    vulnerabilityScore: number;
    riskLevel: RiskLevel;
    expectedLoss?: number;
    expectedLossCurrency?: string;
  }>;
  mitigationMeasures?: Array<{
    measureType: string;
    measureName: string;
    description?: string;
    effectiveness: number;
    cost?: number;
    currency?: string;
    implementationTime?: number;
    implementationTimeUnit?: string;
    priority?: 'Low' | 'Medium' | 'High' | 'Critical';
    status?: 'Planned' | 'In Progress' | 'Completed' | 'Cancelled';
  }>;
  linkedHazards?: Array<{
    hazardId: string;
    relationshipType: 'Primary' | 'Secondary' | 'Related' | 'Cascading';
    vulnerabilityScore?: number;
  }>;
  linkedLocations?: Array<{
    locationId: string;
    vulnerabilityScore?: number;
    impactLevel?: string;
  }>;
  linkedAccounts?: Array<{
    accountId: string;
    exposureValue?: number;
    currency?: string;
    vulnerabilityScore?: number;
  }>;
  assessmentDate: string;
  validFrom: string;
  validTo?: string;
  methodology?: {
    assessmentMethod?: string;
    modelProvider?: string;
    modelVersion?: string;
    resolution?: 'High' | 'Medium' | 'Low' | 'Variable';
    lastModelUpdate?: string;
  };
  status: 'Active' | 'Inactive' | 'Under Review' | 'Deprecated' | 'Draft';
  isPublic?: boolean;
  isTemplate?: boolean;
  createdBy: string;
  lastModifiedBy: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// HazardVulnerability is now part of Vulnerability interface

// Simulation types
export interface SimulationRun {
  _id: string;
  simulationRunId: string;
  simulationName: string;
  simulationDescription?: string;
  configuration: SimulationConfiguration;
  status: 'Pending' | 'Running' | 'Completed' | 'Failed' | 'Cancelled';
  progress: number;
  startTime: string;
  endTime?: string;
  duration?: number;
  results?: SimulationResults;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SimulationConfiguration {
  startYear: number;
  endYear: number;
  timeHorizon: number;
  timeHorizonUnit: 'years' | 'months' | 'days';
  hazardTypes: HazardType[];
  geographicScope: {
    regions: string[];
    countries: string[];
    coordinates?: {
      type: 'Polygon' | 'MultiPolygon';
      coordinates: number[][][];
    };
  };
  exposureScope: {
    currency: string;
    totalExposure: number;
    categories: {
      residential: number;
      commercial: number;
      industrial: number;
      infrastructure: number;
    };
  };
  modelingConfig: {
    numberOfSimulations: number;
    modelProvider: string;
    modelType: 'Probabilistic' | 'Deterministic' | 'Scenario' | 'Hybrid';
    resolution: 'High' | 'Medium' | 'Low' | 'Variable';
    randomSeed?: number;
  };
}

export interface SimulationResults {
  summary: {
    totalEvents: number;
    totalLoss: number;
    averageLoss: number;
    maximumLoss: number;
    returnPeriods: {
      '10': number;
      '25': number;
      '50': number;
      '100': number;
      '250': number;
      '500': number;
      '1000': number;
    };
  };
  events: SimulationEvent[];
  statistics: SimulationStatistics;
}

export interface SimulationEvent {
  _id: string;
  eventId: string;
  simulationRunId: string;
  hazardType: HazardType;
  eventYear: number;
  eventMonth: number;
  eventDay: number;
  intensity: number;
  probability: number;
  severity: SeverityLevel;
  affectedArea: {
    type: 'Point' | 'Polygon' | 'MultiPolygon';
    coordinates: number[] | number[][][] | number[][][][];
  };
  financialImpact: {
    totalLoss: number;
    insuredLoss: number;
    currency: string;
  };
  createdAt: string;
}

export interface SimulationStatistics {
  byHazardType: Record<HazardType, {
    count: number;
    totalLoss: number;
    averageLoss: number;
    maximumLoss: number;
  }>;
  bySeverity: Record<SeverityLevel, {
    count: number;
    totalLoss: number;
    averageLoss: number;
  }>;
  byYear: Record<number, {
    count: number;
    totalLoss: number;
    averageLoss: number;
  }>;
  byMonth: Record<number, {
    count: number;
    totalLoss: number;
    averageLoss: number;
  }>;
}

// Integration types
export interface RiskAssessment {
  location: Location;
  hazards: Hazard[];
  vulnerabilities: Vulnerability[];
  riskScore: number;
  riskLevel: RiskLevel;
  recommendations: string[];
  lastUpdated: string;
}

export interface FinancialMetrics {
  totalExposure: number;
  expectedLoss: number;
  probableMaximumLoss: number;
  averageAnnualLoss: number;
  returnPeriods: Record<string, number>;
  currency: string;
  lastUpdated: string;
}

export interface Account {
  _id: string;
  accountId: string;
  accountName: string;
  accountType: 'Primary' | 'Reinsurance' | 'Retrocession' | 'Facultative' | 'Treaty';
  parentAccountId?: string;
  accountLevel: number;
  totalExposure: number;
  currency: string;
  regions: string[];
  riskProfile: 'Low' | 'Medium' | 'High' | 'Very High';
  hazardRiskProfile: {
    overallRiskLevel: 'Low' | 'Medium' | 'High' | 'Very High' | 'Extreme';
    primaryHazards: Array<{
      hazardType: HazardType;
      riskLevel: 'Low' | 'Medium' | 'High' | 'Very High' | 'Extreme';
      exposureAmount: number;
      lastAssessed: string;
    }>;
    lastRiskAssessment: string;
    riskAssessmentMethod?: 'Model' | 'Expert' | 'Historical' | 'Hybrid';
  };
  maxExposurePerLocation?: number;
  maxExposurePerPeril?: number;
  status: 'Active' | 'Inactive' | 'Suspended' | 'Pending';
  effectiveDate: string;
  expiryDate?: string;
  createdBy: string;
  lastModifiedBy: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Policy {
  _id: string;
  policyId: string;
  policyName: string;
  policyType: 'Property' | 'Liability' | 'Life' | 'Health' | 'Auto' | 'Other';
  coverageAmount: number;
  deductible: number;
  premium: number;
  currency: string;
  effectiveDate: string;
  expirationDate: string;
  status: 'Active' | 'Inactive' | 'Expired' | 'Cancelled';
  coverageAreas: string[];
  exclusions: string[];
  createdAt: string;
  updatedAt: string;
}

// Enums
export type HazardType = 
  | 'Earthquake' | 'Hurricane' | 'Typhoon' | 'Cyclone' | 'Tornado' | 'Flood' | 'Flash Flood'
  | 'Wildfire' | 'Forest Fire' | 'Bushfire' | 'Hail' | 'Wind' | 'Storm Surge' | 'Tsunami'
  | 'Volcanic Eruption' | 'Landslide' | 'Avalanche' | 'Drought' | 'Heat Wave' | 'Cold Wave'
  | 'Ice Storm' | 'Blizzard' | 'Sandstorm' | 'Dust Storm' | 'Terrorism' | 'Cyber Attack'
  | 'Nuclear Accident' | 'Chemical Spill' | 'Oil Spill' | 'Industrial Accident'
  | 'Transportation Accident' | 'Infrastructure Failure' | 'Pandemic' | 'Biological Attack'
  | 'Radiological Attack' | 'Space Weather' | 'Solar Flare' | 'Asteroid Impact'
  | 'Climate Change Impact' | 'Sea Level Rise' | 'Permafrost Thaw' | 'Glacial Lake Outburst';

export type HazardCategory = 
  | 'Natural' | 'Man-made' | 'Emerging' | 'Compound' | 'Cascading';

export type VulnerabilityType = 
  | 'Physical' | 'Social' | 'Economic' | 'Environmental' | 'Institutional' | 'Infrastructure' | 'Multi-dimensional';

export type VulnerabilityCategory = 
  | 'Individual' | 'Community' | 'Regional' | 'National' | 'Global';

export type SeverityLevel = 
  | 'Minor' | 'Moderate' | 'Major' | 'Severe' | 'Catastrophic' | 'Extreme';

export type RiskLevel = 
  | 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High' | 'Critical';

// Filter types
export interface HazardFilters {
  page?: number;
  limit?: number;
  hazardType?: HazardType;
  hazardCategory?: HazardCategory;
  severity?: SeverityLevel;
  region?: string;  // Maps to affectedRegions in backend
  country?: string; // Maps to affectedCountries in backend
  minProbability?: number;
  maxProbability?: number;
  isHistorical?: boolean;
  isSimulated?: boolean;
  status?: 'Active' | 'Inactive' | 'Under Review' | 'Deprecated' | 'Draft';
}

export interface VulnerabilityFilters {
  page?: number;
  limit?: number;
  vulnerabilityType?: VulnerabilityType;
  vulnerabilityCategory?: VulnerabilityCategory;
  overallRiskLevel?: RiskLevel;
  region?: string;
  country?: string;
  hazardType?: HazardType;
  minScore?: number;
  maxScore?: number;
  status?: 'Active' | 'Inactive' | 'Under Review' | 'Deprecated' | 'Draft';
}

export interface SimulationFilters {
  page?: number;
  limit?: number;
  status?: 'Pending' | 'Running' | 'Completed' | 'Failed' | 'Cancelled';
  hazardType?: HazardType;
  createdBy?: string;
  startDate?: string;
  endDate?: string;
}

// Chart data types
export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
  category?: string;
}

export interface MapDataPoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  value: number;
  category?: string;
  color?: string;
}

