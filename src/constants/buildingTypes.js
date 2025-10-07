/**
 * Building and Property Type Constants
 * 
 * Centralized definition of occupancy and construction types.
 */

// Occupancy Types (used in Exposure and Location models)
const OCCUPANCY_TYPES = {
  RESIDENTIAL: 'Residential',
  COMMERCIAL: 'Commercial',
  INDUSTRIAL: 'Industrial'
};

const OCCUPANCY_TYPE_VALUES = Object.values(OCCUPANCY_TYPES);

// Construction Types (used in Exposure and Location models)
const CONSTRUCTION_TYPES = {
  FRAME: 'Frame',
  MASONRY: 'Masonry',
  CONCRETE: 'Concrete',
  STEEL: 'Steel'
};

const CONSTRUCTION_TYPE_VALUES = Object.values(CONSTRUCTION_TYPES);

// Exposure Types
const EXPOSURE_TYPES = {
  PROPERTY: 'Property',
  LIABILITY: 'Liability',
  BUSINESS_INTERRUPTION: 'Business Interruption'
};

const EXPOSURE_TYPE_VALUES = Object.values(EXPOSURE_TYPES);

// Risk Levels
const RISK_LEVELS = {
  VERY_LOW: 'Very Low',
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  VERY_HIGH: 'Very High',
  EXTREME: 'Extreme'
};

const RISK_LEVEL_VALUES = Object.values(RISK_LEVELS);

// Severity Levels (for Hazard model)
const SEVERITY_LEVELS = {
  MINOR: 'Minor',
  MODERATE: 'Moderate',
  MAJOR: 'Major',
  SEVERE: 'Severe',
  CATASTROPHIC: 'Catastrophic',
  EXTREME: 'Extreme'
};

const SEVERITY_LEVEL_VALUES = Object.values(SEVERITY_LEVELS);

module.exports = {
  OCCUPANCY_TYPES,
  OCCUPANCY_TYPE_VALUES,
  CONSTRUCTION_TYPES,
  CONSTRUCTION_TYPE_VALUES,
  EXPOSURE_TYPES,
  EXPOSURE_TYPE_VALUES,
  RISK_LEVELS,
  RISK_LEVEL_VALUES,
  SEVERITY_LEVELS,
  SEVERITY_LEVEL_VALUES
};
