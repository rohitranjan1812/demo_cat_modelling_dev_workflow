const express = require('express');
const router = express.Router();
const VulnerabilityController = require('../controllers/refactored/vulnerabilityController');
const { validateVulnerability } = require('../validation/vulnerabilitySchemas');

// Create controller instance
const vulnerabilityController = new VulnerabilityController();

// Vulnerability Routes
// IMPORTANT: Specific routes MUST come before parametrized routes (:id)

// Location-based vulnerability analysis (before :id routes)
router.get('/vulnerabilities/affecting-location', vulnerabilityController.getVulnerabilitiesAffectingLocation.bind(vulnerabilityController));
router.get('/vulnerabilities/location-score', vulnerabilityController.calculateLocationVulnerabilityScore.bind(vulnerabilityController));
router.get('/vulnerabilities/comprehensive-analysis', vulnerabilityController.getComprehensiveVulnerabilityAnalysis.bind(vulnerabilityController));

// Vulnerability statistics and reporting (before :id routes)
router.get('/vulnerabilities/statistics', vulnerabilityController.getVulnerabilityStatistics.bind(vulnerabilityController));

// Hazard-specific vulnerability analysis (before generic :id routes)
router.get('/vulnerabilities/by-hazard/:hazardType', vulnerabilityController.getVulnerabilitiesByHazardType.bind(vulnerabilityController));

// Base CRUD operations
router.get('/vulnerabilities', vulnerabilityController.getAllVulnerabilities.bind(vulnerabilityController));
router.post('/vulnerabilities', vulnerabilityController.createVulnerability.bind(vulnerabilityController));

// Parametrized routes with :id (MUST be after specific routes)
router.get('/vulnerabilities/:id/validate', vulnerabilityController.validateVulnerabilityAssessment.bind(vulnerabilityController));
router.get('/vulnerabilities/:id/recommendations', vulnerabilityController.getRiskReductionRecommendations.bind(vulnerabilityController));
router.get('/vulnerabilities/:id', vulnerabilityController.getVulnerabilityById.bind(vulnerabilityController));
router.put('/vulnerabilities/:id', validateVulnerability, vulnerabilityController.updateVulnerability.bind(vulnerabilityController));
router.delete('/vulnerabilities/:id', vulnerabilityController.deleteVulnerability.bind(vulnerabilityController));

// Vulnerability linking and relationships
router.post('/vulnerabilities/:id/link-hazard', vulnerabilityController.linkVulnerabilityToHazard.bind(vulnerabilityController));
router.post('/vulnerabilities/:id/link-location', vulnerabilityController.linkVulnerabilityToLocation.bind(vulnerabilityController));
router.post('/vulnerabilities/:id/link-account', vulnerabilityController.linkVulnerabilityToAccount.bind(vulnerabilityController));

module.exports = router;




