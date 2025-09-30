const express = require('express');
const router = express.Router();
const VulnerabilityController = require('../controllers/vulnerabilityController');
const { validateVulnerability } = require('../validation/vulnerabilitySchemas');

// Vulnerability Routes
// IMPORTANT: Specific routes MUST come before parametrized routes (:id)

// Location-based vulnerability analysis (before :id routes)
router.get('/vulnerabilities/affecting-location', VulnerabilityController.getVulnerabilitiesAffectingLocation);
router.get('/vulnerabilities/location-score', VulnerabilityController.calculateLocationVulnerabilityScore);
router.get('/vulnerabilities/comprehensive-analysis', VulnerabilityController.getComprehensiveVulnerabilityAnalysis);

// Vulnerability statistics and reporting (before :id routes)
router.get('/vulnerabilities/statistics', VulnerabilityController.getVulnerabilityStatistics);

// Hazard-specific vulnerability analysis (before generic :id routes)
router.get('/vulnerabilities/by-hazard/:hazardType', VulnerabilityController.getVulnerabilitiesByHazardType);

// Base CRUD operations
router.get('/vulnerabilities', VulnerabilityController.getAllVulnerabilities);
router.post('/vulnerabilities', validateVulnerability, VulnerabilityController.createVulnerability);

// Parametrized routes with :id (MUST be after specific routes)
router.get('/vulnerabilities/:id/validate', VulnerabilityController.validateVulnerabilityAssessment);
router.get('/vulnerabilities/:id/recommendations', VulnerabilityController.getRiskReductionRecommendations);
router.get('/vulnerabilities/:id', VulnerabilityController.getVulnerabilityById);
router.put('/vulnerabilities/:id', validateVulnerability, VulnerabilityController.updateVulnerability);
router.delete('/vulnerabilities/:id', VulnerabilityController.deleteVulnerability);

// Vulnerability linking and relationships
router.post('/vulnerabilities/:id/link-hazard', VulnerabilityController.linkVulnerabilityToHazard);
router.post('/vulnerabilities/:id/link-location', VulnerabilityController.linkVulnerabilityToLocation);
router.post('/vulnerabilities/:id/link-account', VulnerabilityController.linkVulnerabilityToAccount);

module.exports = router;




