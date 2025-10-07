/**
 * Peril Type Constants
 * 
 * Centralized definition of peril types used throughout the application.
 * These perils are used in Exposure, Hazard, and Vulnerability models.
 */

const PERIL_TYPES = {
  EARTHQUAKE: 'Earthquake',
  HURRICANE: 'Hurricane',
  FLOOD: 'Flood',
  WILDFIRE: 'Wildfire',
  TORNADO: 'Tornado',
  WIND: 'Wind'
};

const PERIL_TYPE_VALUES = Object.values(PERIL_TYPES);

// Extended peril types used in Hazard and Vulnerability models
const EXTENDED_PERIL_TYPES = {
  ...PERIL_TYPES,
  TYPHOON: 'Typhoon',
  CYCLONE: 'Cyclone',
  FLASH_FLOOD: 'Flash Flood',
  FOREST_FIRE: 'Forest Fire',
  BUSHFIRE: 'Bushfire',
  HAIL: 'Hail',
  STORM_SURGE: 'Storm Surge',
  TSUNAMI: 'Tsunami',
  VOLCANIC_ERUPTION: 'Volcanic Eruption',
  LANDSLIDE: 'Landslide',
  AVALANCHE: 'Avalanche',
  DROUGHT: 'Drought',
  HEAT_WAVE: 'Heat Wave',
  COLD_WAVE: 'Cold Wave',
  ICE_STORM: 'Ice Storm',
  BLIZZARD: 'Blizzard',
  SANDSTORM: 'Sandstorm',
  DUST_STORM: 'Dust Storm',
  
  // Man-made hazards
  TERRORISM: 'Terrorism',
  CYBER_ATTACK: 'Cyber Attack',
  NUCLEAR_ACCIDENT: 'Nuclear Accident',
  CHEMICAL_SPILL: 'Chemical Spill',
  OIL_SPILL: 'Oil Spill',
  INDUSTRIAL_ACCIDENT: 'Industrial Accident',
  TRANSPORTATION_ACCIDENT: 'Transportation Accident',
  INFRASTRUCTURE_FAILURE: 'Infrastructure Failure',
  PANDEMIC: 'Pandemic',
  BIOLOGICAL_ATTACK: 'Biological Attack',
  RADIOLOGICAL_ATTACK: 'Radiological Attack',
  
  // Emerging hazards
  SPACE_WEATHER: 'Space Weather',
  SOLAR_FLARE: 'Solar Flare',
  ASTEROID_IMPACT: 'Asteroid Impact',
  CLIMATE_CHANGE_IMPACT: 'Climate Change Impact',
  SEA_LEVEL_RISE: 'Sea Level Rise',
  PERMAFROST_THAW: 'Permafrost Thaw',
  GLACIAL_LAKE_OUTBURST: 'Glacial Lake Outburst'
};

const EXTENDED_PERIL_TYPE_VALUES = Object.values(EXTENDED_PERIL_TYPES);

const PERIL_CATEGORIES = {
  NATURAL: 'Natural',
  MAN_MADE: 'Man-made',
  EMERGING: 'Emerging',
  COMPOUND: 'Compound',
  CASCADING: 'Cascading'
};

const PERIL_CATEGORY_VALUES = Object.values(PERIL_CATEGORIES);

module.exports = {
  PERIL_TYPES,
  PERIL_TYPE_VALUES,
  EXTENDED_PERIL_TYPES,
  EXTENDED_PERIL_TYPE_VALUES,
  PERIL_CATEGORIES,
  PERIL_CATEGORY_VALUES
};
