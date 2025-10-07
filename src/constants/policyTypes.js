/**
 * Policy Type Constants
 * 
 * Centralized definition of policy types used throughout the application.
 */

const POLICY_TYPES = {
  DIRECT: 'Direct',
  REINSURANCE: 'Reinsurance',
  FACULTATIVE: 'Facultative',
  TREATY: 'Treaty',
  RETROCESSION: 'Retrocession'
};

const POLICY_TYPE_VALUES = Object.values(POLICY_TYPES);

const POLICY_TYPE_DESCRIPTIONS = {
  [POLICY_TYPES.DIRECT]: 'Direct insurance policy with policyholder',
  [POLICY_TYPES.REINSURANCE]: 'Reinsurance policy covering an insurer',
  [POLICY_TYPES.FACULTATIVE]: 'Facultative reinsurance for individual risks',
  [POLICY_TYPES.TREATY]: 'Treaty reinsurance covering a portfolio',
  [POLICY_TYPES.RETROCESSION]: 'Retrocession policy for reinsurer protection'
};

// Coverage Types for Policy Coverages
const COVERAGE_TYPES = {
  PROPERTY: 'Property',
  LIABILITY: 'Liability',
  BUSINESS_INTERRUPTION: 'Business Interruption',
  CYBER: 'Cyber',
  MARINE: 'Marine',
  AVIATION: 'Aviation',
  ENERGY: 'Energy'
};

const COVERAGE_TYPE_VALUES = Object.values(COVERAGE_TYPES);

module.exports = {
  POLICY_TYPES,
  POLICY_TYPE_VALUES,
  POLICY_TYPE_DESCRIPTIONS,
  COVERAGE_TYPES,
  COVERAGE_TYPE_VALUES
};
