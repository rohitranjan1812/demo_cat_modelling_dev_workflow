const express = require('express');
const router = express.Router();
const IntegrationController = require('../controllers/integrationController');
const { validateLocationQuery, validateAccountRiskQuery, validateFinancialMetrics, validateRiskComparison } = require('../validation/integrationSchemas');
const Joi = require('joi');

// Validation schemas are imported from integrationSchemas

// Location-based risk assessment routes
router.get('/risk/location', validateLocationQuery, IntegrationController.getLocationRiskAssessment);
router.get('/risk/location/trends', IntegrationController.getRiskTrendAnalysis);

// Account-based risk analysis routes
router.get('/risk/account/:accountId', validateAccountRiskQuery, IntegrationController.getAccountRiskAnalysis);
router.get('/risk/account/:accountId/trends', IntegrationController.getRiskTrendAnalysis);

// Financial calculation integration routes
router.post('/financial/:accountId/metrics', validateFinancialMetrics, IntegrationController.calculateFinancialRiskMetrics);

// Risk comparison and analysis routes
router.post('/risk/comparison', validateRiskComparison, IntegrationController.getRiskComparison);

// Dashboard and overview routes
router.get('/dashboard', IntegrationController.getRiskDashboard);

// Risk alerts and notifications routes
router.get('/alerts', IntegrationController.getRiskAlerts);

// Data export routes
router.get('/export', IntegrationController.exportRiskData);

// Health check for integration service
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Integration service is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: {
      locationRisk: '/api/v1/integration/risk/location',
      accountRisk: '/api/v1/integration/risk/account/:accountId',
      financialMetrics: '/api/v1/integration/financial/:accountId/metrics',
      riskComparison: '/api/v1/integration/risk/comparison',
      dashboard: '/api/v1/integration/dashboard',
      alerts: '/api/v1/integration/alerts',
      export: '/api/v1/integration/export'
    }
  });
});

module.exports = router;
