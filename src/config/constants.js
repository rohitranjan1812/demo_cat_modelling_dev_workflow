/**
 * Application Constants for CAT Modeling Platform
 * Centralized constants for consistent usage across the application
 */

// Currency constants
const CURRENCIES = [
  'USD', // United States Dollar
  'EUR', // Euro
  'GBP', // British Pound Sterling
  'JPY', // Japanese Yen
  'CAD', // Canadian Dollar
  'AUD', // Australian Dollar
  'CNY', // Chinese Yuan
  'INR', // Indian Rupee
  'BRL', // Brazilian Real
  'CHF', // Swiss Franc
  'MXN', // Mexican Peso
  'SGD', // Singapore Dollar
  'HKD', // Hong Kong Dollar
  'NZD', // New Zealand Dollar
  'SEK', // Swedish Krona
  'NOK', // Norwegian Krone
  'DKK', // Danish Krone
  'ZAR'  // South African Rand
];

const DEFAULT_CURRENCY = 'USD';

// Geographic regions
const REGIONS = [
  'North America',
  'Europe',
  'Asia Pacific',
  'Latin America',
  'Middle East',
  'Africa'
];

// Hazard/Peril types
const HAZARD_TYPES = [
  // Natural Catastrophes
  'Earthquake',
  'Hurricane',
  'Typhoon',
  'Cyclone',
  'Tornado',
  'Flood',
  'Flash Flood',
  'Wildfire',
  'Forest Fire',
  'Bushfire',
  'Hail',
  'Wind',
  'Storm Surge',
  'Tsunami',
  'Volcanic Eruption',
  'Landslide',
  'Avalanche',
  'Drought',
  'Heat Wave',
  'Cold Wave',
  'Ice Storm',
  'Blizzard',
  'Sandstorm',
  'Dust Storm',
  
  // Man-made Catastrophes
  'Terrorism',
  'Cyber Attack',
  'Nuclear Accident',
  'Chemical Spill',
  'Oil Spill',
  'Industrial Accident',
  'Transportation Accident',
  'Infrastructure Failure',
  'Pandemic',
  'Biological Attack',
  'Radiological Attack',
  
  // Emerging Risks
  'Space Weather',
  'Solar Flare',
  'Asteroid Impact',
  'Climate Change Impact',
  'Sea Level Rise',
  'Permafrost Thaw',
  'Glacial Lake Outburst'
];

// Hazard categories
const HAZARD_CATEGORIES = {
  NATURAL: 'Natural',
  METEOROLOGICAL: 'Meteorological',
  GEOPHYSICAL: 'Geophysical',
  HYDROLOGICAL: 'Hydrological',
  CLIMATOLOGICAL: 'Climatological',
  BIOLOGICAL: 'Biological',
  TECHNOLOGICAL: 'Technological',
  SOCIETAL: 'Societal',
  EMERGING: 'Emerging'
};

// Severity levels
const SEVERITY_LEVELS = [
  'Minor',
  'Moderate',
  'Significant',
  'Severe',
  'Catastrophic',
  'Extreme'
];

// Risk levels
const RISK_LEVELS = [
  'Low',
  'Medium',
  'High',
  'Very High',
  'Extreme'
];

// Status values
const STATUS_VALUES = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  EXPIRED: 'Expired',
  PENDING: 'Pending',
  CANCELLED: 'Cancelled',
  SUSPENDED: 'Suspended',
  DRAFT: 'Draft'
};

// Account types
const ACCOUNT_TYPES = [
  'Primary',
  'Reinsurance',
  'Retrocession',
  'Facultative',
  'Treaty'
];

// Exposure types
const EXPOSURE_TYPES = [
  'Property',
  'Casualty',
  'Business Interruption',
  'Liability',
  'Multi-Line'
];

// Coverage types
const COVERAGE_TYPES = [
  'Named Peril',
  'All Risk',
  'Catastrophe',
  'Multi-Peril'
];

// Occupancy types
const OCCUPANCY_TYPES = [
  'Residential',
  'Commercial',
  'Industrial',
  'Agricultural',
  'Mixed Use',
  'Institutional',
  'Recreational',
  'Other'
];

// Construction types
const CONSTRUCTION_TYPES = [
  'Wood Frame',
  'Steel Frame',
  'Concrete',
  'Masonry',
  'Mixed',
  'Reinforced Concrete',
  'Unreinforced Masonry',
  'Other'
];

// Roof types
const ROOF_TYPES = [
  'Flat',
  'Pitched',
  'Gabled',
  'Hip',
  'Mansard',
  'Gambrel',
  'Shed',
  'Other'
];

// Foundation types
const FOUNDATION_TYPES = [
  'Slab',
  'Crawlspace',
  'Basement',
  'Pier',
  'Post and Beam',
  'Other'
];

// Risk grades
const RISK_GRADES = ['A', 'B', 'C', 'D', 'E', 'F'];

// Data quality levels
const DATA_QUALITY_LEVELS = [
  'High',
  'Medium',
  'Low',
  'Unknown'
];

// Model providers
const MODEL_PROVIDERS = [
  'AIR',
  'RMS',
  'CoreLogic',
  'KatRisk',
  'JBA',
  'Custom',
  'Other'
];

// Model types
const MODEL_TYPES = [
  'Probabilistic',
  'Deterministic',
  'Stochastic',
  'Scenario',
  'Hybrid'
];

// Resolution levels
const RESOLUTION_LEVELS = [
  'Low',
  'Medium',
  'High',
  'Very High'
];

// Time horizon units
const TIME_HORIZON_UNITS = [
  'days',
  'months',
  'years',
  'decades'
];

// Duration units
const DURATION_UNITS = [
  'seconds',
  'minutes',
  'hours',
  'days',
  'weeks',
  'months'
];

// Area units
const AREA_UNITS = [
  'km2',
  'miles2',
  'sqm',
  'sqft',
  'acres',
  'hectares'
];

// Distance units
const DISTANCE_UNITS = [
  'km',
  'miles',
  'meters',
  'feet',
  'nautical_miles'
];

// Deductible types
const DEDUCTIBLE_TYPES = [
  'Flat',
  'Percentage',
  'Per Occurrence',
  'Annual Aggregate',
  'Franchise'
];

// Vulnerability factor types
const VULNERABILITY_FACTOR_TYPES = [
  'Physical',
  'Social',
  'Economic',
  'Environmental',
  'Institutional',
  'Infrastructure',
  'Demographic',
  'Geographic',
  'Temporal',
  'Custom'
];

// Administrative levels
const ADMINISTRATIVE_LEVELS = [
  'Country',
  'State',
  'Province',
  'Region',
  'County',
  'District',
  'Municipality',
  'City',
  'Town',
  'Village',
  'Neighborhood'
];

// Confidence levels (for risk calculations)
const CONFIDENCE_LEVELS = [0.90, 0.95, 0.99, 0.995, 0.999];

// Default values
const DEFAULTS = {
  CURRENCY: DEFAULT_CURRENCY,
  SEARCH_RADIUS_KM: 50,
  PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  RISK_SCORE: 5,
  RISK_GRADE: 'C',
  VULNERABILITY_SCORE: 0.5,
  CONFIDENCE_LEVEL: 0.95,
  TIME_HORIZON_YEARS: 1,
  DATA_QUALITY: 'Medium'
};

// Validation ranges
const RANGES = {
  LATITUDE: { MIN: -90, MAX: 90 },
  LONGITUDE: { MIN: -180, MAX: 180 },
  ELEVATION: { MIN: -1000, MAX: 10000 },
  RISK_SCORE: { MIN: 0, MAX: 10 },
  VULNERABILITY_SCORE: { MIN: 0, MAX: 1 },
  PROBABILITY: { MIN: 0, MAX: 1 },
  COINSURANCE: { MIN: 0, MAX: 100 },
  YEAR: { MIN: 1800, MAX: 2100 },
  STORIES: { MIN: 0, MAX: 200 }
};

// Error messages
const ERROR_MESSAGES = {
  ACCOUNT_NOT_FOUND: 'Account not found',
  EXPOSURE_NOT_FOUND: 'Exposure not found',
  HAZARD_NOT_FOUND: 'Hazard not found',
  VULNERABILITY_NOT_FOUND: 'Vulnerability not found',
  INVALID_CURRENCY: 'Invalid currency code',
  INVALID_REGION: 'Invalid region',
  INVALID_HAZARD_TYPE: 'Invalid hazard type',
  INVALID_DATE_RANGE: 'Invalid date range: end date must be after start date',
  INVALID_COORDINATES: 'Invalid coordinates',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
  VALIDATION_FAILED: 'Validation failed'
};

// Export all constants
module.exports = {
  // Currency
  CURRENCIES,
  DEFAULT_CURRENCY,
  
  // Geography
  REGIONS,
  AREA_UNITS,
  DISTANCE_UNITS,
  ADMINISTRATIVE_LEVELS,
  
  // Hazards and Risks
  HAZARD_TYPES,
  HAZARD_CATEGORIES,
  SEVERITY_LEVELS,
  RISK_LEVELS,
  RISK_GRADES,
  
  // Status
  STATUS_VALUES,
  
  // Account and Policy
  ACCOUNT_TYPES,
  EXPOSURE_TYPES,
  COVERAGE_TYPES,
  DEDUCTIBLE_TYPES,
  
  // Asset Characteristics
  OCCUPANCY_TYPES,
  CONSTRUCTION_TYPES,
  ROOF_TYPES,
  FOUNDATION_TYPES,
  
  // Modeling
  MODEL_PROVIDERS,
  MODEL_TYPES,
  RESOLUTION_LEVELS,
  CONFIDENCE_LEVELS,
  
  // Time
  TIME_HORIZON_UNITS,
  DURATION_UNITS,
  
  // Vulnerability
  VULNERABILITY_FACTOR_TYPES,
  
  // Data Quality
  DATA_QUALITY_LEVELS,
  
  // Defaults
  DEFAULTS,
  
  // Validation
  RANGES,
  
  // Error Messages
  ERROR_MESSAGES
};
