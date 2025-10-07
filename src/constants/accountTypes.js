/**
 * Account Type Constants
 * 
 * Centralized definition of account types used throughout the application.
 * This ensures consistency across models, validation, and business logic.
 */

const ACCOUNT_TYPES = {
  PRIMARY: 'Primary',
  REINSURANCE: 'Reinsurance',
  RETROCESSION: 'Retrocession',
  FACULTATIVE: 'Facultative',
  TREATY: 'Treaty'
};

const ACCOUNT_TYPE_VALUES = Object.values(ACCOUNT_TYPES);

const ACCOUNT_TYPE_DESCRIPTIONS = {
  [ACCOUNT_TYPES.PRIMARY]: 'Primary insurance account - direct policyholder relationship',
  [ACCOUNT_TYPES.REINSURANCE]: 'Reinsurance account - insurer of insurers',
  [ACCOUNT_TYPES.RETROCESSION]: 'Retrocession account - reinsurance of reinsurers',
  [ACCOUNT_TYPES.FACULTATIVE]: 'Facultative reinsurance - individual risk coverage',
  [ACCOUNT_TYPES.TREATY]: 'Treaty reinsurance - portfolio-based coverage'
};

module.exports = {
  ACCOUNT_TYPES,
  ACCOUNT_TYPE_VALUES,
  ACCOUNT_TYPE_DESCRIPTIONS
};
