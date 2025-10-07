/**
 * Geographic Region Constants
 * 
 * Centralized definition of geographic regions used throughout the application.
 */

const REGIONS = {
  NORTH_AMERICA: 'North America',
  EUROPE: 'Europe',
  ASIA_PACIFIC: 'Asia Pacific',
  LATIN_AMERICA: 'Latin America',
  MIDDLE_EAST: 'Middle East',
  AFRICA: 'Africa'
};

const REGION_VALUES = Object.values(REGIONS);

const REGION_DESCRIPTIONS = {
  [REGIONS.NORTH_AMERICA]: 'North America including USA, Canada, and Mexico',
  [REGIONS.EUROPE]: 'European countries',
  [REGIONS.ASIA_PACIFIC]: 'Asia-Pacific region including Japan, Australia, China, India',
  [REGIONS.LATIN_AMERICA]: 'Central and South America',
  [REGIONS.MIDDLE_EAST]: 'Middle Eastern countries',
  [REGIONS.AFRICA]: 'African continent'
};

// Common countries by region (for reference)
const REGION_COUNTRIES = {
  [REGIONS.NORTH_AMERICA]: ['USA', 'Canada', 'Mexico'],
  [REGIONS.EUROPE]: ['UK', 'Germany', 'France', 'Spain', 'Italy'],
  [REGIONS.ASIA_PACIFIC]: ['Japan', 'Australia', 'China', 'India', 'Singapore'],
  [REGIONS.LATIN_AMERICA]: ['Brazil', 'Argentina', 'Chile', 'Colombia'],
  [REGIONS.MIDDLE_EAST]: ['UAE', 'Saudi Arabia', 'Qatar', 'Israel'],
  [REGIONS.AFRICA]: ['South Africa', 'Nigeria', 'Kenya', 'Egypt']
};

module.exports = {
  REGIONS,
  REGION_VALUES,
  REGION_DESCRIPTIONS,
  REGION_COUNTRIES
};
