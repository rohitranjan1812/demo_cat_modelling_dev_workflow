/**
 * Constants Index
 * 
 * Central export point for all constants.
 * Allows for cleaner imports: const { ACCOUNT_TYPES, CURRENCIES } = require('./constants');
 */

const accountTypes = require('./accountTypes');
const policyTypes = require('./policyTypes');
const perils = require('./perils');
const buildingTypes = require('./buildingTypes');
const regions = require('./regions');
const currencies = require('./currencies');
const statuses = require('./statuses');
const modelProviders = require('./modelProviders');

module.exports = {
  // Account Types
  ...accountTypes,
  
  // Policy Types
  ...policyTypes,
  
  // Perils
  ...perils,
  
  // Building & Property Types
  ...buildingTypes,
  
  // Geographic Regions
  ...regions,
  
  // Currencies
  ...currencies,
  
  // Statuses
  ...statuses,
  
  // Model Providers
  ...modelProviders
};
