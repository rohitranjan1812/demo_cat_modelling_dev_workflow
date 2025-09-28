const express = require('express');
const router = express.Router();
const VulnerabilityController = require('../controllers/vulnerabilityController');
const { validateVulnerability } = require('../validation/vulnerabilitySchemas');

// Vulnerability Routes
router.get('/vulnerabilities', VulnerabilityController.getAllVulnerabilities);
router.get('/vulnerabilities/:id', VulnerabilityController.getVulnerabilityById);
router.post('/vulnerabilities', validateVulnerability, VulnerabilityController.createVulnerability);
router.put('/vulnerabilities/:id', validateVulnerability, VulnerabilityController.updateVulnerability);
router.delete('/vulnerabilities/:id', VulnerabilityController.deleteVulnerability);

// Location-based vulnerability analysis
router.get('/vulnerabilities/affecting-location', VulnerabilityController.getVulnerabilitiesAffectingLocation);
router.get('/vulnerabilities/location-score', VulnerabilityController.calculateLocationVulnerabilityScore);
router.get('/vulnerabilities/comprehensive-analysis', VulnerabilityController.getComprehensiveVulnerabilityAnalysis);

// Hazard-specific vulnerability analysis
router.get('/vulnerabilities/by-hazard/:hazardType', VulnerabilityController.getVulnerabilitiesByHazardType);

// Vulnerability statistics and reporting
router.get('/vulnerabilities/statistics', VulnerabilityController.getVulnerabilityStatistics);

// Vulnerability linking and relationships
router.post('/vulnerabilities/:id/link-hazard', VulnerabilityController.linkVulnerabilityToHazard);
router.post('/vulnerabilities/:id/link-location', VulnerabilityController.linkVulnerabilityToLocation);
router.post('/vulnerabilities/:id/link-account', VulnerabilityController.linkVulnerabilityToAccount);

// Vulnerability assessment and validation
router.get('/vulnerabilities/:id/validate', VulnerabilityController.validateVulnerabilityAssessment);
router.get('/vulnerabilities/:id/recommendations', VulnerabilityController.getRiskReductionRecommendations);

module.exports = router;




