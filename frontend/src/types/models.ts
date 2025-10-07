/**
 * TypeScript Type Definitions for CAT Modeling Platform
 * 
 * These interfaces match the backend MongoDB models exactly.
 * Generated from: Account, Policy, Location, Exposure, Hazard, Vulnerability models
 * Date: October 5, 2025
 */

// ============================================================================
// ENUMS - Match backend shared constants
// ============================================================================

export type AccountType = 'Primary' | 'Reinsurance' | 'Retrocession' | 'Facultative' | 'Treaty';
export type PolicyType = 'Direct' | 'Reinsurance' | 'Facultative' | 'Treaty' | 'Retrocession';
export type CoverageType = 'Property' | 'Liability' | 'Business Interruption' | 'Cyber' | 'Marine' | 'Aviation' | 'Energy';
export type ExposureType = 'Property' | 'Casualty' | 'Liability' | 'Marine' | 'Aviation' | 'Cyber';
export type OccupancyType = 'Residential' | 'Commercial' | 'Industrial' | 'Mixed Use' | 'Institutional' | 'Agricultural';
export type ConstructionType = 'Wood' | 'Concrete' | 'Steel' | 'Masonry' | 'Mixed';
export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'CNY' | 'INR' | 'BRL';
export type Region = 'North America' | 'Europe' | 'Asia Pacific' | 'Latin America' | 'Middle East' | 'Africa';
export type Status = 'Active' | 'Inactive';
export type AccountStatus = 'Active' | 'Inactive' | 'Suspended' | 'Pending';
export type PolicyStatus = 'Active' | 'Expired' | 'Cancelled' | 'Pending';
export type ExposureStatus = 'Active' | 'Inactive' | 'Expired' | 'Under Review' | 'Pending';
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Very High' | 'Extreme' | 'Very Low';
export type SeverityLevel = 'Minor' | 'Moderate' | 'Major' | 'Severe' | 'Catastrophic' | 'Extreme';
export type ModelProvider = 'RMS' | 'AIR' | 'CoreLogic' | 'KCC' | 'Custom';

// Basic perils (used in Exposure model)
export type PerilType = 
  | 'Earthquake'
  | 'Hurricane'
  | 'Flood'
  | 'Wildfire'
  | 'Tornado'
  | 'Wind';

// Extended perils (used in Hazard and Vulnerability models)
export type ExtendedPerilType = PerilType
  | 'Typhoon'
  | 'Cyclone'
  | 'Flash Flood'
  | 'Forest Fire'
  | 'Bushfire'
  | 'Hail'
  | 'Storm Surge'
  | 'Tsunami'
  | 'Volcanic Eruption'
  | 'Landslide'
  | 'Avalanche'
  | 'Drought'
  | 'Heat Wave'
  | 'Cold Wave'
  | 'Ice Storm'
  | 'Blizzard'
  | 'Sandstorm'
  | 'Dust Storm'
  | 'Terrorism'
  | 'Cyber Attack'
  | 'Nuclear Accident'
  | 'Chemical Spill'
  | 'Oil Spill'
  | 'Industrial Accident'
  | 'Transportation Accident'
  | 'Infrastructure Failure'
  | 'Pandemic'
  | 'Biological Attack'
  | 'Radiological Attack'
  | 'Space Weather'
  | 'Solar Flare'
  | 'Asteroid Impact'
  | 'Climate Change Impact'
  | 'Sea Level Rise'
  | 'Permafrost Thaw'
  | 'Glacial Lake Outburst';

// ============================================================================
// SHARED TYPES
// ============================================================================

// Legacy coordinates interface - deprecated, use GeoJSONPoint instead
export interface Coordinates {
  latitude: number;
  longitude: number;
  elevation?: number;
}

// GeoJSON Point format - matches backend geospatial data structure
export interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude] format
}

// Utility type for coordinate conversion
export type CoordinatesLegacy = {
  latitude: number;
  longitude: number;
};

// Helper functions can convert between formats:
// geoJsonToCoordinates(geoJson: GeoJSONPoint): CoordinatesLegacy
// coordinatesToGeoJson(coords: CoordinatesLegacy): GeoJSONPoint

export interface Address {
  street: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  region: Region;
}

export interface PerilExposure {
  peril: PerilType;
  exposureAmount: number;
  deductible: number;
}

// ============================================================================
// ACCOUNT MODEL
// ============================================================================

export interface PrimaryHazard {
  hazardType: ExtendedPerilType;
  riskLevel: RiskLevel;
  exposureAmount?: number;
  lastAssessed: string; // ISO date string
}

export interface PrimaryHazard {
  hazardType: ExtendedPerilType;
  riskLevel: RiskLevel;
  exposureAmount?: number;
  lastAssessed: string; // ISO date string
}

export interface HazardRiskProfile {
  overallRiskLevel: RiskLevel;
  primaryHazards: PrimaryHazard[];
  lastRiskAssessment: string; // ISO date string
  riskAssessmentMethod?: 'Model' | 'Expert' | 'Historical' | 'Hybrid';
}

export interface Account {
  _id: string;
  accountId: string;
  accountName: string;
  accountType: AccountType;
  parentAccountId?: string;
  accountLevel: number;
  totalExposure: number;
  currency: Currency;
  regions: Region[];
  riskProfile: 'Low' | 'Medium' | 'High' | 'Very High';
  hazardRiskProfile: HazardRiskProfile;
  maxExposurePerLocation?: number;
  maxExposurePerPeril?: number;
  status: AccountStatus;
  effectiveDate: string; // ISO date string
  expiryDate?: string; // ISO date string
  createdBy: string;
  lastModifiedBy: string;
  metadata?: Record<string, any>;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

// ============================================================================
// POLICY MODEL
// ============================================================================

export interface Coverage {
  coverageType: CoverageType;
  coverageLimit: number;
  deductible: number;
  coveragePercentage: number;
}

export interface HazardCoverage {
  hazardId: string;
  coverageLimit: number;
  deductible: number;
  coveragePercentage: number;
  effectiveDate: string;
  expiryDate?: string;
}

export interface RiskCharacteristics {
  occupancyType?: OccupancyType;
  constructionType?: ConstructionType;
  yearBuilt?: number;
  numberOfStories?: number;
  squareFootage?: number;
}

export interface Sublimit {
  peril: PerilType;
  limit: number;
  deductible: number;
  region?: Region;
}

export interface SpecialCondition {
  conditionType: 'Exclusion' | 'Endorsement' | 'Warranty' | 'Condition' | 'Clause';
  description: string;
  effectiveDate: string;
  expiryDate?: string;
  isActive: boolean;
}

export interface Policy {
  _id: string;
  policyId: string;
  policyNumber: string;
  accountId: string;
  policyName: string;
  policyType: PolicyType;
  coverages: Coverage[];
  totalLimit: number;
  totalDeductible: number;
  premium: number;
  currency: Currency;
  effectiveDate: string;
  expiryDate: string;
  coveredRegions: Region[];
  coveredPerils: ExtendedPerilType[];
  hazardCoverage: HazardCoverage[];
  riskCharacteristics: RiskCharacteristics;
  sublimits: Sublimit[];
  specialConditions: SpecialCondition[];
  status: PolicyStatus;
  createdBy: string;
  lastModifiedBy: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// LOCATION MODEL
// ============================================================================

export interface RiskZone {
  zoneType: PerilType;
  zoneCode: string;
  zoneDescription?: string;
  riskLevel: RiskLevel;
}

export interface RiskFactor {
  peril: PerilType;
  riskScore: number;
  probability: number;
  expectedLoss: number;
  lastUpdated: string;
}

export interface HazardExposureItem {
  hazardId: string;
  exposureLevel: 'None' | 'Low' | 'Medium' | 'High' | 'Very High' | 'Extreme';
  riskScore?: number;
  lastAssessed: string;
  assessmentMethod?: 'Model' | 'Expert' | 'Historical' | 'Hybrid';
}

export interface HazardZone {
  zoneId: string;
  zoneType: string;
  riskLevel: RiskLevel;
  effectiveDate: string;
  expiryDate?: string;
}

export interface PropertyCharacteristics {
  occupancyType: OccupancyType;
  constructionType: ConstructionType;
  yearBuilt?: number;
  numberOfStories?: number;
  squareFootage?: number;
  replacementCost?: number;
  marketValue?: number;
}

export interface AssociatedPolicy {
  policyId: string;
  exposureAmount: number;
  effectiveDate: string;
  expiryDate: string;
}

export interface CatModelData {
  modelProvider?: ModelProvider;
  modelVersion?: string;
  lastModelUpdate?: string;
  modelResults?: Record<string, any>;
}

export interface Location {
  _id: string;
  locationId: string;
  locationName: string;
  location: GeoJSONPoint; // Updated to GeoJSON format
  elevation?: number;
  address: Address;
  riskZones: RiskZone[];
  riskFactors: RiskFactor[];
  hazardExposure: HazardExposureItem[];
  hazardZones: HazardZone[];
  propertyCharacteristics: PropertyCharacteristics;
  totalExposure: number;
  currency: Currency;
  associatedPolicies: AssociatedPolicy[];
  catModelData: CatModelData;
  status: 'Active' | 'Inactive' | 'Under Review' | 'Excluded';
  createdBy: string;
  lastModifiedBy: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// EXPOSURE MODEL
// ============================================================================

export interface Exposure {
  _id: string;
  exposureId: string;
  exposureType: ExposureType;
  accountId: string;
  policyId: string;
  locationId: string;
  totalInsuredValue: number;
  replacementValue: number;
  currency: Currency;
  perilExposures: PerilExposure[];
  location: {
    latitude: number;
    longitude: number;
  };
  occupancyType: OccupancyType;
  constructionType: ConstructionType;
  yearBuilt?: number;
  numberOfStories?: number;
  squareFootage?: number;
  effectiveDate?: string;
  expiryDate?: string;
  status: ExposureStatus;
  createdBy: string;
  lastModifiedBy: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// HAZARD MODEL
// ============================================================================

export interface Intensity {
  scale: string;
  value: number;
  unit: string;
  description?: string;
}

export interface Footprint {
  center: GeoJSONPoint; // Updated to GeoJSON format
  radius: number;
  radiusUnit: string;
  affectedArea?: number;
  areaUnit?: string;
}

export interface EconomicImpact {
  estimatedLoss?: number;
  currency?: Currency;
  confidenceLevel?: number;
  lossType?: 'Property' | 'Business Interruption' | 'Infrastructure' | 'Agricultural' | 'Total';
  methodology?: string;
}

export interface VulnerabilityFactors {
  populationDensity?: string;
  infrastructureQuality?: string;
  emergencyResponse?: string;
  buildingCodes?: string;
  earlyWarningSystem?: string;
}

export interface ModelData {
  modelProvider?: ModelProvider;
  modelVersion?: string;
  modelType?: 'Probabilistic' | 'Deterministic' | 'Scenario' | 'Hybrid';
  resolution?: string;
  lastModelUpdate?: string;
  modelResults?: Record<string, any>;
}

export interface DataSource {
  sourceType?: string;
  sourceName: string;
  reliability?: string;
  lastUpdated?: string;
}

export interface Hazard {
  _id: string;
  hazardId: string;
  hazardName: string;
  hazardType: ExtendedPerilType;
  hazardCategory: 'Natural' | 'Man-made' | 'Emerging' | 'Compound' | 'Cascading';
  intensities: Intensity[];
  footprint: Footprint;
  severity: SeverityLevel;
  probability: number;
  returnPeriod?: number;
  returnPeriodUnit?: 'years' | 'months' | 'days';
  economicImpact: EconomicImpact[];
  affectedRegions: Region[];
  affectedCountries: string[];
  vulnerabilityFactors?: VulnerabilityFactors;
  modelData: ModelData;
  dataSources: DataSource[];
  status: 'Active' | 'Inactive' | 'Under Review' | 'Deprecated' | 'Draft';
  isHistorical: boolean;
  isSimulated: boolean;
  createdBy: string;
  lastModifiedBy: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// VULNERABILITY MODEL
// ============================================================================

export interface VulnerabilityFactor {
  factorType: string;
  factorName: string;
  factorValue: number;
  weight: number;
  unit?: string;
  description?: string;
  dataSource?: string;
  lastUpdated?: string;
}

// Updated to match backend geographicScope structure
export interface GeographicScope {
  center: GeoJSONPoint; // Updated to GeoJSON format
  radius: number;
  radiusUnit: 'km' | 'miles' | 'nautical_miles';
  area?: number;
  areaUnit?: 'km2' | 'miles2' | 'acres' | 'hectares';
  polygon?: number[][][]; // Array of coordinate arrays for complex shapes
  administrativeLevel: 'National' | 'State/Province' | 'County/District' | 'Municipal' | 'Local' | 'Custom';
  country: string;
  state?: string;
  region: Region;
}

export interface HazardVulnerability {
  hazardType: ExtendedPerilType;
  vulnerabilityScore: number;
  confidenceLevel: string;
  exposureType?: string;
  exposureValue?: number;
  currency?: Currency;
  exposureUnit?: string;
  riskLevel: RiskLevel;
  expectedLoss?: number;
  expectedLossCurrency?: Currency;
}

export interface LinkedHazard {
  hazardId: string;
  relationshipType: 'Primary' | 'Secondary' | 'Related' | 'Cascading';
  vulnerabilityScore?: number;
}

export interface LinkedLocation {
  locationId: string;
  exposureValue?: number;
  currency?: Currency;
  vulnerabilityScore?: number;
}

export interface LinkedExposure {
  exposureId: string;
  exposureValue?: number;
  currency?: Currency;
  vulnerabilityScore?: number;
}

export interface Vulnerability {
  _id: string;
  vulnerabilityId: string;
  vulnerabilityName: string;
  vulnerabilityType: string;
  vulnerabilityScore: number;
  vulnerabilityLevel: string;
  factors: VulnerabilityFactor[];
  geographicScope: GeographicScope;
  hazardVulnerabilities: HazardVulnerability[];
  linkedHazards: LinkedHazard[];
  linkedLocations: LinkedLocation[];
  linkedExposures: LinkedExposure[];
  status: 'Active' | 'Inactive' | 'Under Review' | 'Deprecated' | 'Draft';
  isPublic: boolean;
  isTemplate: boolean;
  createdBy: string;
  lastModifiedBy: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: ValidationError[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ExposureStatistics {
  totalCount: number;
  totalValue: number;
  byType: Record<string, number>;
  byOccupancy: Record<string, number>;
  byConstruction: Record<string, number>;
  byStatus: Record<string, number>;
}

// ============================================================================
// FORM / CREATE TYPES (without _id, createdAt, updatedAt)
// ============================================================================

export type CreateExposureInput = Omit<Exposure, '_id' | 'createdAt' | 'updatedAt'>;
export type UpdateExposureInput = Partial<CreateExposureInput>;

export type CreateAccountInput = Omit<Account, '_id' | 'createdAt' | 'updatedAt'>;
export type UpdateAccountInput = Partial<CreateAccountInput>;

export type CreatePolicyInput = Omit<Policy, '_id' | 'createdAt' | 'updatedAt'>;
export type UpdatePolicyInput = Partial<CreatePolicyInput>;

export type CreateLocationInput = Omit<Location, '_id' | 'createdAt' | 'updatedAt'>;
export type UpdateLocationInput = Partial<CreateLocationInput>;

export type CreateHazardInput = Omit<Hazard, '_id' | 'createdAt' | 'updatedAt'>;
export type UpdateHazardInput = Partial<CreateHazardInput>;

export type CreateVulnerabilityInput = Omit<Vulnerability, '_id' | 'createdAt' | 'updatedAt'>;
export type UpdateVulnerabilityInput = Partial<CreateVulnerabilityInput>;

// ============================================================================
// QUERY PARAMETER TYPES
// ============================================================================

export interface ExposureQueryParams {
  page?: number;
  limit?: number;
  accountId?: string;
  policyId?: string;
  locationId?: string;
  status?: ExposureStatus;
  exposureType?: ExposureType;
  occupancyType?: OccupancyType;
  constructionType?: ConstructionType;
  minValue?: number;
  maxValue?: number;
  peril?: PerilType;
}

export interface ExposureSearchParams extends ExposureQueryParams {
  q?: string; // Search term
}
