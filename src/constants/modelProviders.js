/**
 * Model Provider Constants
 * 
 * Centralized definition of catastrophe modeling providers.
 */

const MODEL_PROVIDERS = {
  RMS: 'RMS',
  AIR: 'AIR',
  CORELOGIC: 'CoreLogic',
  KCC: 'KCC',
  CUSTOM: 'Custom'
};

const MODEL_PROVIDER_VALUES = Object.values(MODEL_PROVIDERS);

const MODEL_PROVIDER_NAMES = {
  [MODEL_PROVIDERS.RMS]: 'Risk Management Solutions',
  [MODEL_PROVIDERS.AIR]: 'AIR Worldwide',
  [MODEL_PROVIDERS.CORELOGIC]: 'CoreLogic',
  [MODEL_PROVIDERS.KCC]: 'Karen Clark & Company',
  [MODEL_PROVIDERS.CUSTOM]: 'Custom Model'
};

const MODEL_PROVIDER_DESCRIPTIONS = {
  [MODEL_PROVIDERS.RMS]: 'Risk Management Solutions - Industry-leading catastrophe risk modeling',
  [MODEL_PROVIDERS.AIR]: 'AIR Worldwide - Comprehensive catastrophe modeling solutions',
  [MODEL_PROVIDERS.CORELOGIC]: 'CoreLogic - Property risk and hazard modeling',
  [MODEL_PROVIDERS.KCC]: 'Karen Clark & Company - Hurricane and earthquake modeling',
  [MODEL_PROVIDERS.CUSTOM]: 'Custom-built or proprietary models'
};

module.exports = {
  MODEL_PROVIDERS,
  MODEL_PROVIDER_VALUES,
  MODEL_PROVIDER_NAMES,
  MODEL_PROVIDER_DESCRIPTIONS
};
