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
  hazardCategory: HazardCategory;
  description: string;
  severity: SeverityLevel;
  probability: number;
  affectedRegions: string[];
  affectedCountries: string[];
  geographicScope: {
    regions: string[];
    countries: string[];
    coordinates?: {
      type: 'Polygon' | 'MultiPolygon';
      coordinates: number[][][];
    };
  };
  temporalScope: {
    startDate: string;
    endDate?: string;
    duration?: number;
    durationUnit?: 'hours' | 'days' | 'weeks' | 'months' | 'years';
  };
  impactMetrics: {
    potentialLoss: number;
    affectedPopulation: number;
    economicImpact: number;
    currency: string;
  };
  isHistorical: boolean;
  isSimulated: boolean;
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
  vulnerabilityType: VulnerabilityType;
  vulnerabilityCategory: VulnerabilityCategory;
  description: string;
  geographicScope: {
    region: string;
    country: string;
    coordinates?: {
      type: 'Point' | 'Polygon' | 'MultiPolygon';
      coordinates: number[] | number[][][] | number[][][][];
    };
  };
  hazardVulnerabilities: HazardVulnerability[];
  overallVulnerabilityScore: number;
  overallRiskLevel: RiskLevel;
  assessmentDate: string;
  lastUpdated: string;
  status: 'Active' | 'Inactive' | 'Archived';
  metadata: {
    source: string;
    assessor: string;
    version: string;
    tags: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface HazardVulnerability {
  hazardType: HazardType;
  vulnerabilityScore: number;
  riskLevel: RiskLevel;
  factors: {
    exposure: number;
    sensitivity: number;
    adaptiveCapacity: number;
  };
  assessmentDetails: {
    methodology: string;
    dataQuality: 'High' | 'Medium' | 'Low';
    confidence: number;
    limitations: string[];
  };
}

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
  accountType: 'Individual' | 'Corporate' | 'Government' | 'NGO';
  contactInfo: {
    email: string;
    phone?: string;
    address: {
      street: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
    };
  };
  policies: Policy[];
  riskProfile: {
    riskTolerance: 'Low' | 'Medium' | 'High';
    coverageAreas: string[];
    totalExposure: number;
    currency: string;
  };
  status: 'Active' | 'Inactive' | 'Suspended';
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
  | 'Natural' | 'Technological' | 'Biological' | 'Climate' | 'Geological' | 'Meteorological' | 'Hydrological';

export type VulnerabilityType = 
  | 'Physical' | 'Economic' | 'Social' | 'Environmental' | 'Infrastructure' | 'Institutional';

export type VulnerabilityCategory = 
  | 'Building' | 'Infrastructure' | 'Population' | 'Economic' | 'Environmental' | 'Social';

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
  region?: string;
  country?: string;
  minProbability?: number;
  maxProbability?: number;
  isHistorical?: boolean;
  isSimulated?: boolean;
  status?: 'Active' | 'Inactive' | 'Archived';
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
  status?: 'Active' | 'Inactive' | 'Archived';
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

