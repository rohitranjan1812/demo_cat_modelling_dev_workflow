/**
 * Validation Framework
 * Comprehensive validation system with schema validation, custom rules, and error handling
 */

const Joi = require('joi');
const { ValidationError, BusinessLogicError } = require('../errors/CustomErrors');

/**
 * Custom Validation Rules
 */
const customValidationRules = {
  // Geographic coordinates validation
  coordinates: {
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required()
  },

  // Date range validation
  dateRange: Joi.object({
    startDate: Joi.date().required(),
    endDate: Joi.date().min(Joi.ref('startDate')).required()
  }),

  // Currency validation
  currency: Joi.string().valid('USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CNY', 'INR', 'BRL'),

  // ID patterns
  idPatterns: {
    hazardId: Joi.string().pattern(/^HAZ-\d{8}$/),
    exposureId: Joi.string().pattern(/^EXP-\d{8}$/),
    vulnerabilityId: Joi.string().pattern(/^VUL-\d{8}$/),
    simulationId: Joi.string().pattern(/^SIM-\d{8}$/),
    scenarioId: Joi.string().pattern(/^SCN-\d{8}$/),
    accountId: Joi.string().pattern(/^ACC-\d{8}$/),
    userId: Joi.string().pattern(/^USR-\d{8}$/)
  },

  // Risk score validation
  riskScore: Joi.number().min(0).max(10),

  // Probability validation
  probability: Joi.number().min(0).max(1),

  // Percentage validation
  percentage: Joi.number().min(0).max(100),

  // Confidence level validation
  confidenceLevel: Joi.number().min(0).max(100),

  // Return period validation
  returnPeriod: Joi.number().min(1).max(10000),

  // Hazard types
  hazardTypes: [
    'Earthquake', 'Hurricane', 'Typhoon', 'Cyclone', 'Tornado', 'Flood', 'Flash Flood',
    'Wildfire', 'Forest Fire', 'Bushfire', 'Hail', 'Wind', 'Storm Surge', 'Tsunami',
    'Volcanic Eruption', 'Landslide', 'Avalanche', 'Drought', 'Heat Wave', 'Cold Wave',
    'Ice Storm', 'Blizzard', 'Sandstorm', 'Dust Storm', 'Terrorism', 'Cyber Attack',
    'Nuclear Accident', 'Chemical Spill', 'Oil Spill', 'Industrial Accident',
    'Transportation Accident', 'Infrastructure Failure', 'Pandemic', 'Biological Attack',
    'Radiological Attack', 'Space Weather', 'Solar Flare', 'Asteroid Impact',
    'Climate Change Impact', 'Sea Level Rise', 'Permafrost Thaw', 'Glacial Lake Outburst'
  ],

  // Asset types
  assetTypes: ['residential', 'commercial', 'industrial', 'agricultural', 'infrastructure', 'mixed'],

  // Construction types
  constructionTypes: ['frame', 'masonry', 'concrete', 'steel', 'mixed', 'other'],

  // Occupancy types
  occupancyTypes: ['residential', 'commercial', 'industrial', 'agricultural', 'institutional', 'mixed']
};

/**
 * Validation Framework Class
 */
class ValidationFramework {
  constructor() {
    this.customRules = new Map();
    this.businessRules = new Map();
    this.schemaCache = new Map();
    this.validationMetrics = {
      validationCount: 0,
      errorCount: 0,
      successCount: 0,
      averageValidationTime: 0
    };
  }

  /**
   * Register a custom validation rule
   * @param {string} name - Rule name
   * @param {Function} validator - Validation function
   * @param {string} message - Error message
   */
  registerRule(name, validator, message) {
    this.customRules.set(name, { validator, message });
  }

  /**
   * Register a business rule
   * @param {string} name - Rule name
   * @param {Function} rule - Business rule function
   * @param {string} description - Rule description
   */
  registerBusinessRule(name, rule, description) {
    this.businessRules.set(name, { rule, description });
  }

  /**
   * Validate data against schema
   * @param {Object} data - Data to validate
   * @param {Object} schema - Joi schema
   * @param {Object} options - Validation options
   * @returns {Object} Validation result
   */
  validate(data, schema, options = {}) {
    const startTime = Date.now();
    this.validationMetrics.validationCount++;

    try {
      // Use cached schema if available
      const cacheKey = JSON.stringify(schema);
      let compiledSchema = this.schemaCache.get(cacheKey);
      
      if (!compiledSchema) {
        compiledSchema = Joi.compile(schema);
        this.schemaCache.set(cacheKey, compiledSchema);
      }

      const { error, value, warning } = compiledSchema.validate(data, {
        abortEarly: false,
        allowUnknown: options.allowUnknown || false,
        stripUnknown: options.stripUnknown || false,
        ...options
      });

      const validationTime = Date.now() - startTime;
      this.updateMetrics(validationTime, !error);

      if (error) {
        const validationError = this.formatValidationError(error, options.context);
        throw validationError;
      }

      return {
        success: true,
        data: value,
        warnings: warning ? warning.details : [],
        validationTime
      };

    } catch (error) {
      const validationTime = Date.now() - startTime;
      this.updateMetrics(validationTime, false);
      
      if (error instanceof ValidationError) {
        throw error;
      }
      
      throw new ValidationError(
        `Validation failed: ${error.message}`,
        null,
        null,
        { originalError: error.message }
      );
    }
  }

  /**
   * Validate with custom rules
   * @param {Object} data - Data to validate
   * @param {Array} ruleNames - Custom rule names to apply
   * @returns {Object} Validation result
   */
  validateWithCustomRules(data, ruleNames) {
    const errors = [];
    
    for (const ruleName of ruleNames) {
      const rule = this.customRules.get(ruleName);
      if (!rule) {
        continue;
      }

      try {
        const isValid = rule.validator(data);
        if (!isValid) {
          errors.push({
            rule: ruleName,
            message: rule.message,
            data
          });
        }
      } catch (error) {
        errors.push({
          rule: ruleName,
          message: `Rule execution failed: ${error.message}`,
          data
        });
      }
    }

    if (errors.length > 0) {
      throw new ValidationError(
        'Custom validation failed',
        null,
        null,
        { customRuleErrors: errors }
      );
    }

    return { success: true, data };
  }

  /**
   * Validate business rules
   * @param {Object} data - Data to validate
   * @param {Array} ruleNames - Business rule names to apply
   * @param {Object} context - Business context
   * @returns {Object} Validation result
   */
  validateBusinessRules(data, ruleNames, context = {}) {
    const violations = [];
    
    for (const ruleName of ruleNames) {
      const businessRule = this.businessRules.get(ruleName);
      if (!businessRule) {
        continue;
      }

      try {
        const result = businessRule.rule(data, context);
        if (!result.valid) {
          violations.push({
            rule: ruleName,
            description: businessRule.description,
            violation: result.message || 'Business rule violation',
            context: result.context,
            severity: result.severity || 'error'
          });
        }
      } catch (error) {
        violations.push({
          rule: ruleName,
          description: businessRule.description,
          violation: `Rule execution failed: ${error.message}`,
          severity: 'error'
        });
      }
    }

    if (violations.length > 0) {
      const errorViolations = violations.filter(v => v.severity === 'error');
      if (errorViolations.length > 0) {
        throw new BusinessLogicError(
          'Business rule validation failed',
          ruleNames.join(', '),
          { violations }
        );
      }
    }

    return { 
      success: true, 
      data, 
      warnings: violations.filter(v => v.severity === 'warning') 
    };
  }

  /**
   * Format validation error
   * @param {Object} joiError - Joi validation error
   * @param {string} context - Validation context
   * @returns {ValidationError} Formatted error
   */
  formatValidationError(joiError, context = '') {
    const errors = joiError.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context?.value,
      type: detail.type,
      constraint: detail.context?.limit
    }));

    const primaryError = errors[0];
    const message = context 
      ? `${context} validation failed: ${primaryError.message}`
      : `Validation failed: ${primaryError.message}`;

    return new ValidationError(
      message,
      primaryError.field,
      primaryError.value,
      { allErrors: errors }
    );
  }

  /**
   * Update validation metrics
   * @param {number} validationTime - Time taken for validation
   * @param {boolean} success - Whether validation succeeded
   */
  updateMetrics(validationTime, success) {
    if (success) {
      this.validationMetrics.successCount++;
    } else {
      this.validationMetrics.errorCount++;
    }

    // Update average validation time
    const totalValidations = this.validationMetrics.validationCount;
    const currentAverage = this.validationMetrics.averageValidationTime;
    this.validationMetrics.averageValidationTime = 
      ((currentAverage * (totalValidations - 1)) + validationTime) / totalValidations;
  }

  /**
   * Get common schemas
   * @returns {Object} Common validation schemas
   */
  getCommonSchemas() {
    return {
      // Geographic location schema
      location: Joi.object({
        latitude: customValidationRules.coordinates.latitude,
        longitude: customValidationRules.coordinates.longitude,
        address: Joi.string().max(500).optional(),
        city: Joi.string().max(100).optional(),
        state: Joi.string().max(100).optional(),
        country: Joi.string().max(100).optional(),
        postalCode: Joi.string().max(20).optional()
      }),

      // Financial amount schema
      financialAmount: Joi.object({
        amount: Joi.number().min(0).required(),
        currency: customValidationRules.currency.required()
      }),

      // Time period schema
      timePeriod: customValidationRules.dateRange,

      // Risk assessment schema
      riskAssessment: Joi.object({
        riskScore: customValidationRules.riskScore.required(),
        probability: customValidationRules.probability.required(),
        impact: Joi.string().valid('low', 'medium', 'high', 'critical').required(),
        confidenceLevel: customValidationRules.confidenceLevel.optional()
      }),

      // Pagination schema
      pagination: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(1000).default(50),
        sortBy: Joi.string().optional(),
        sortOrder: Joi.string().valid('asc', 'desc').default('desc')
      }),

      // Search query schema
      searchQuery: Joi.object({
        query: Joi.string().min(1).max(200).required(),
        filters: Joi.object().optional(),
        facets: Joi.array().items(Joi.string()).optional()
      })
    };
  }

  /**
   * Get validation metrics
   * @returns {Object} Validation metrics
   */
  getMetrics() {
    return {
      ...this.validationMetrics,
      successRate: this.validationMetrics.validationCount > 0 
        ? (this.validationMetrics.successCount / this.validationMetrics.validationCount * 100).toFixed(2)
        : 0,
      customRulesCount: this.customRules.size,
      businessRulesCount: this.businessRules.size,
      cachedSchemasCount: this.schemaCache.size
    };
  }

  /**
   * Clear validation cache and metrics
   */
  clear() {
    this.schemaCache.clear();
    this.validationMetrics = {
      validationCount: 0,
      errorCount: 0,
      successCount: 0,
      averageValidationTime: 0
    };
  }
}

// Global validation framework instance
const globalValidator = new ValidationFramework();

// Register some common custom rules
globalValidator.registerRule(
  'uniqueInArray',
  (data) => {
    if (!Array.isArray(data)) return true;
    return data.length === new Set(data).size;
  },
  'Array values must be unique'
);

globalValidator.registerRule(
  'validCoordinates',
  (data) => {
    if (!data.latitude || !data.longitude) return false;
    return data.latitude >= -90 && data.latitude <= 90 &&
           data.longitude >= -180 && data.longitude <= 180;
  },
  'Invalid geographic coordinates'
);

// Register common business rules
globalValidator.registerBusinessRule(
  'simulationParametersConsistency',
  (data, context) => {
    if (data.startYear && data.endYear && data.startYear >= data.endYear) {
      return {
        valid: false,
        message: 'Start year must be before end year',
        context: { startYear: data.startYear, endYear: data.endYear }
      };
    }
    return { valid: true };
  },
  'Simulation start year must be before end year'
);

globalValidator.registerBusinessRule(
  'exposureValueLimits',
  (data, context) => {
    const maxExposure = context.maxExposure || 1000000000; // 1 billion default
    if (data.exposureValue && data.exposureValue > maxExposure) {
      return {
        valid: false,
        message: `Exposure value exceeds maximum allowed: ${maxExposure}`,
        context: { exposureValue: data.exposureValue, maxExposure },
        severity: 'warning'
      };
    }
    return { valid: true };
  },
  'Exposure value should not exceed reasonable limits'
);

module.exports = {
  ValidationFramework,
  globalValidator,
  customValidationRules
};