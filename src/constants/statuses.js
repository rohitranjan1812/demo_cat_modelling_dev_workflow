/**
 * Status Constants
 * 
 * Centralized definition of status values used across different models.
 */

const ACCOUNT_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  SUSPENDED: 'Suspended',
  PENDING: 'Pending'
};

const ACCOUNT_STATUS_VALUES = Object.values(ACCOUNT_STATUS);

const POLICY_STATUS = {
  ACTIVE: 'Active',
  EXPIRED: 'Expired',
  CANCELLED: 'Cancelled',
  PENDING: 'Pending'
};

const POLICY_STATUS_VALUES = Object.values(POLICY_STATUS);

const LOCATION_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive'
};

const LOCATION_STATUS_VALUES = Object.values(LOCATION_STATUS);

const EXPOSURE_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  UNDER_REVIEW: 'Under Review'
};

const EXPOSURE_STATUS_VALUES = Object.values(EXPOSURE_STATUS);

const HAZARD_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  HISTORICAL: 'Historical'
};

const HAZARD_STATUS_VALUES = Object.values(HAZARD_STATUS);

const VULNERABILITY_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive'
};

const VULNERABILITY_STATUS_VALUES = Object.values(VULNERABILITY_STATUS);

// Generic status that can be used as fallback
const GENERIC_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive'
};

const GENERIC_STATUS_VALUES = Object.values(GENERIC_STATUS);

module.exports = {
  ACCOUNT_STATUS,
  ACCOUNT_STATUS_VALUES,
  POLICY_STATUS,
  POLICY_STATUS_VALUES,
  LOCATION_STATUS,
  LOCATION_STATUS_VALUES,
  EXPOSURE_STATUS,
  EXPOSURE_STATUS_VALUES,
  HAZARD_STATUS,
  HAZARD_STATUS_VALUES,
  VULNERABILITY_STATUS,
  VULNERABILITY_STATUS_VALUES,
  GENERIC_STATUS,
  GENERIC_STATUS_VALUES
};
