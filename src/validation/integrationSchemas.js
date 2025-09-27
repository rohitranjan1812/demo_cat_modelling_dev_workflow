const Joi = require('joi');

// Common validation schemas for integration endpoints

// Location query validation
const locationQuerySchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  bufferKm: Joi.number().min(0).max(1000).default(50),
  hazardTypes: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string().custom((value, helpers) => {
      if (typeof value === 'string') {
        return value.split(',').map(s => s.trim()).filter(Boolean);
      }
      return value;
    })
  ).optional(),
  includeVulnerability: Joi.boolean().default(true),
  includeExposure: Joi.boolean().default(true),
  currency: Joi.string().valid('USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CNY', 'INR', 'BRL').default('USD')
});

// Account risk analysis query validation
const accountRiskQuerySchema = Joi.object({
  includeChildAccounts: Joi.boolean().default(true),
  hazardTypes: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string().custom((value, helpers) => {
      if (typeof value === 'string') {
        return value.split(',').map(s => s.trim()).filter(Boolean);
      }
      return value;
    })
  ).optional(),
  currency: Joi.string().valid('USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CNY', 'INR', 'BRL').default('USD'),
  riskThreshold: Joi.number().min(0).max(10).default(0.5)
});

// Financial metrics calculation validation
const financialMetricsSchema = Joi.object({
  hazardTypes: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string().custom((value, helpers) => {
      if (typeof value === 'string') {
        return value.split(',').map(s => s.trim()).filter(Boolean);
      }
      return value;
    })
  ).optional(),
  timeHorizon: Joi.number().min(0.1).max(50).default(1),
  confidenceLevel: Joi.number().min(0.5).max(0.999).default(0.95),
  currency: Joi.string().valid('USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CNY', 'INR', 'BRL').default('USD'),
  includeVulnerabilityAdjustment: Joi.boolean().default(true)
});

// Risk comparison validation
const riskComparisonSchema = Joi.object({
  locations: Joi.array().items(Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    name: Joi.string().max(200).optional(),
    bufferKm: Joi.number().min(0).max(1000).default(50),
    hazardTypes: Joi.alternatives().try(
      Joi.array().items(Joi.string()),
      Joi.string().custom((value, helpers) => {
        if (typeof value === 'string') {
          return value.split(',').map(s => s.trim()).filter(Boolean);
        }
        return value;
      })
    ).optional(),
    includeVulnerability: Joi.boolean().default(true),
    includeExposure: Joi.boolean().default(true),
    currency: Joi.string().valid('USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CNY', 'INR', 'BRL').default('USD')
  })).min(2).max(10).required()
});

// Dashboard query validation
const dashboardQuerySchema = Joi.object({
  region: Joi.string().valid('North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East', 'Africa').optional(),
  hazardTypes: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string().custom((value, helpers) => {
      if (typeof value === 'string') {
        return value.split(',').map(s => s.trim()).filter(Boolean);
      }
      return value;
    })
  ).optional(),
  timeRange: Joi.string().valid('7d', '30d', '90d', '1y', '2y', '5y').default('30d'),
  currency: Joi.string().valid('USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CNY', 'INR', 'BRL').default('USD')
});

// Risk trend analysis validation
const trendAnalysisQuerySchema = Joi.object({
  type: Joi.string().valid('location', 'account').required(),
  id: Joi.string().required(),
  timeRange: Joi.string().valid('7d', '30d', '90d', '1y', '2y', '5y').default('1y'),
  granularity: Joi.string().valid('daily', 'weekly', 'monthly', 'quarterly').default('monthly')
});

// Risk alerts query validation
const alertsQuerySchema = Joi.object({
  accountId: Joi.string().optional(),
  severity: Joi.string().valid('low', 'medium', 'high', 'critical', 'all').default('medium'),
  limit: Joi.number().min(1).max(1000).default(50),
  acknowledged: Joi.boolean().optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional()
});

// Data export validation
const exportQuerySchema = Joi.object({
  type: Joi.string().valid('location', 'account', 'dashboard').required(),
  id: Joi.string().required(),
  format: Joi.string().valid('json', 'csv', 'xml').default('json'),
  includeRawData: Joi.boolean().default(false),
  fields: Joi.array().items(Joi.string()).optional()
});

// Response schemas for validation

// Risk metrics response schema
const riskMetricsSchema = Joi.object({
  hazardRiskScore: Joi.number().min(0).max(10).required(),
  vulnerabilityRiskScore: Joi.number().min(0).max(10).required(),
  combinedRiskScore: Joi.number().min(0).max(10).required(),
  overallRiskLevel: Joi.string().valid('Very Low', 'Low', 'Medium', 'High', 'Very High', 'Extreme').required(),
  totalExposure: Joi.number().min(0).required(),
  currency: Joi.string().required(),
  dataQuality: Joi.object({
    score: Joi.number().min(0).max(1).required(),
    level: Joi.string().valid('Low', 'Medium', 'High').required(),
    factors: Joi.object().required()
  }).required()
});

// Location risk assessment response schema
const locationRiskAssessmentSchema = Joi.object({
  success: Joi.boolean().required(),
  data: Joi.object({
    location: Joi.object({
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
      bufferKm: Joi.number().required()
    }).required(),
    analysis: Joi.object({
      hazards: Joi.number().min(0).required(),
      vulnerabilities: Joi.number().min(0).required(),
      accounts: Joi.number().min(0).required(),
      zones: Joi.number().min(0).required(),
      scenarios: Joi.number().min(0).required()
    }).required(),
    riskMetrics: riskMetricsSchema.required(),
    recommendations: Joi.array().items(Joi.object({
      type: Joi.string().required(),
      priority: Joi.string().valid('Low', 'Medium', 'High', 'Critical').required(),
      message: Joi.string().required(),
      actions: Joi.array().items(Joi.string()).required()
    })).required(),
    rawData: Joi.object().optional()
  }).required()
});

// Account risk analysis response schema
const accountRiskAnalysisSchema = Joi.object({
  success: Joi.boolean().required(),
  data: Joi.object({
    account: Joi.object().required(),
    childAccounts: Joi.array().items(Joi.object()).required(),
    riskMetrics: Joi.object({
      totalExposure: Joi.number().min(0).required(),
      averageRiskScore: Joi.number().min(0).max(10).required(),
      highRiskLocations: Joi.number().min(0).required(),
      criticalHazards: Joi.array().items(Joi.string()).required(),
      currency: Joi.string().required(),
      locationCount: Joi.number().min(0).required()
    }).required(),
    locationRiskData: Joi.array().items(Joi.object()).required(),
    recommendations: Joi.array().items(Joi.object()).required(),
    summary: Joi.object().required()
  }).required()
});

// Financial metrics response schema
const financialMetricsResponseSchema = Joi.object({
  success: Joi.boolean().required(),
  data: Joi.object({
    expectedLoss: Joi.number().min(0).required(),
    valueAtRisk: Joi.number().min(0).required(),
    tailValueAtRisk: Joi.number().min(0).required(),
    standardDeviation: Joi.number().min(0).required(),
    riskAdjustedExposure: Joi.number().min(0).required(),
    hazardMetrics: Joi.object().required(),
    vulnerabilityAdjustedMetrics: Joi.object().optional(),
    timeHorizonAdjustments: Joi.object().required(),
    currency: Joi.string().required(),
    confidenceLevel: Joi.number().required(),
    timeHorizon: Joi.number().required(),
    calculationTimestamp: Joi.date().required(),
    dataQuality: Joi.object().required()
  }).required()
});

// Dashboard response schema
const dashboardResponseSchema = Joi.object({
  success: Joi.boolean().required(),
  data: Joi.object({
    overview: Joi.object({
      totalHazards: Joi.number().min(0).required(),
      totalVulnerabilities: Joi.number().min(0).required(),
      totalAccounts: Joi.number().min(0).required(),
      totalExposure: Joi.number().min(0).required(),
      currency: Joi.string().required()
    }).required(),
    riskIndicators: Joi.object().required(),
    hazardStats: Joi.object().required(),
    vulnerabilityStats: Joi.object().required(),
    accountStats: Joi.object().required(),
    recentEvents: Joi.array().required(),
    riskTrends: Joi.object().required(),
    lastUpdated: Joi.date().required()
  }).required()
});

// Validation middleware functions

const validateLocationQuery = (req, res, next) => {
  const { error } = locationQuerySchema.validate(req.query);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Latitude and longitude are required',
      error: error.details[0].message
    });
  }
  next();
};

const validateAccountRiskQuery = (req, res, next) => {
  const { error } = accountRiskQuerySchema.validate(req.query);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid account risk query parameters',
      error: error.details[0].message
    });
  }
  next();
};

const validateFinancialMetrics = (req, res, next) => {
  const { error } = financialMetricsSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid financial metrics parameters',
      error: error.details[0].message
    });
  }
  next();
};

const validateRiskComparison = (req, res, next) => {
  const { error } = riskComparisonSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'At least 2 locations are required',
      error: error.details[0].message
    });
  }
  next();
};

const validateDashboardQuery = (req, res, next) => {
  const { error } = dashboardQuerySchema.validate(req.query);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid dashboard query parameters',
      error: error.details[0].message
    });
  }
  next();
};

const validateTrendAnalysisQuery = (req, res, next) => {
  const { error } = trendAnalysisQuerySchema.validate(req.query);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid trend analysis query parameters',
      error: error.details[0].message
    });
  }
  next();
};

const validateAlertsQuery = (req, res, next) => {
  const { error } = alertsQuerySchema.validate(req.query);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid alerts query parameters',
      error: error.details[0].message
    });
  }
  next();
};

const validateExportQuery = (req, res, next) => {
  const { error } = exportQuerySchema.validate(req.query);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid export query parameters',
      error: error.details[0].message
    });
  }
  next();
};

// Response validation middleware

const validateLocationRiskResponse = (req, res, next) => {
  // This would typically be used in testing or development
  // to validate response schemas
  next();
};

const validateAccountRiskResponse = (req, res, next) => {
  next();
};

const validateFinancialMetricsResponse = (req, res, next) => {
  next();
};

const validateDashboardResponse = (req, res, next) => {
  next();
};

module.exports = {
  // Query validation schemas
  locationQuerySchema,
  accountRiskQuerySchema,
  financialMetricsSchema,
  riskComparisonSchema,
  dashboardQuerySchema,
  trendAnalysisQuerySchema,
  alertsQuerySchema,
  exportQuerySchema,
  
  // Response validation schemas
  riskMetricsSchema,
  locationRiskAssessmentSchema,
  accountRiskAnalysisSchema,
  financialMetricsResponseSchema,
  dashboardResponseSchema,
  
  // Validation middleware
  validateLocationQuery,
  validateAccountRiskQuery,
  validateFinancialMetrics,
  validateRiskComparison,
  validateDashboardQuery,
  validateTrendAnalysisQuery,
  validateAlertsQuery,
  validateExportQuery,
  
  // Response validation middleware
  validateLocationRiskResponse,
  validateAccountRiskResponse,
  validateFinancialMetricsResponse,
  validateDashboardResponse
};
