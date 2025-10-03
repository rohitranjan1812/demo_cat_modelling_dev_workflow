const express = require('express');
const router = express.Router();
const hazardController = require('../controllers/refactored/hazardController');
const {
  HazardController,
  HazardEventController,
  HazardZoneController,
  HazardScenarioController,
  HazardAnalysisController
} = require('../controllers/hazardController');
const { validateHazard, validateHazardEvent, validateHazardZone, validateHazardScenario } = require('../validation/hazardSchemas');

// Hazard Routes (Refactored with Service Layer)
// IMPORTANT: Specific routes MUST come before parametrized routes (:id)
router.get('/hazards/bounds', hazardController.getHazardsInBounds.bind(hazardController));
router.get('/hazards/near', hazardController.getHazardsNearLocation.bind(hazardController));
router.get('/hazards/search', hazardController.searchHazards.bind(hazardController));
router.get('/hazards/statistics', hazardController.getHazardStatistics.bind(hazardController));
router.get('/hazards', hazardController.getAllHazards.bind(hazardController));
router.get('/hazards/:id', hazardController.getHazardById.bind(hazardController));
router.post('/hazards', hazardController.createHazard.bind(hazardController));
router.put('/hazards/:id', validateHazard, hazardController.updateHazard.bind(hazardController));
router.delete('/hazards/:id', hazardController.deleteHazard.bind(hazardController));

// Hazard-Vulnerability Linking Routes
router.post('/hazards/:id/link-vulnerability', hazardController.linkVulnerability.bind(hazardController));
router.delete('/hazards/:id/unlink-vulnerability/:vulnerabilityId', hazardController.unlinkVulnerability.bind(hazardController));

// Legacy routes for backward compatibility
router.get('/hazards/affecting-location', HazardController.getHazardsAffectingLocation);

// Hazard Event Routes
// IMPORTANT: Specific routes MUST come before parametrized routes (:id)
router.get('/hazard-events/affecting-location', HazardEventController.getEventsAffectingLocation);
router.get('/hazard-events/ongoing', HazardEventController.getOngoingEvents);
router.get('/hazard-events', HazardEventController.getAllHazardEvents);
router.get('/hazard-events/:id', HazardEventController.getHazardEventById);
router.post('/hazard-events', validateHazardEvent, HazardEventController.createHazardEvent);
router.put('/hazard-events/:id', validateHazardEvent, HazardEventController.updateHazardEvent);
router.delete('/hazard-events/:id', HazardEventController.deleteHazardEvent);

// Hazard Zone Routes
// IMPORTANT: Specific routes MUST come before parametrized routes (:id)
router.get('/hazard-zones/containing-location', HazardZoneController.getZonesContainingLocation);
router.get('/hazard-zones', HazardZoneController.getAllHazardZones);
router.get('/hazard-zones/:id', HazardZoneController.getHazardZoneById);
router.post('/hazard-zones', validateHazardZone, HazardZoneController.createHazardZone);
router.put('/hazard-zones/:id', validateHazardZone, HazardZoneController.updateHazardZone);
router.delete('/hazard-zones/:id', HazardZoneController.deleteHazardZone);

// Hazard Scenario Routes
// IMPORTANT: Specific routes MUST come before parametrized routes (:id)
router.get('/hazard-scenarios/running', HazardScenarioController.getRunningScenarios);
router.get('/hazard-scenarios', HazardScenarioController.getAllHazardScenarios);
router.get('/hazard-scenarios/:id', HazardScenarioController.getHazardScenarioById);
router.post('/hazard-scenarios', validateHazardScenario, HazardScenarioController.createHazardScenario);
router.put('/hazard-scenarios/:id', validateHazardScenario, HazardScenarioController.updateHazardScenario);
router.delete('/hazard-scenarios/:id', HazardScenarioController.deleteHazardScenario);
router.post('/hazard-scenarios/:id/run', HazardScenarioController.runScenarioSimulation);

// Hazard Analysis Routes
router.get('/analysis/location', HazardAnalysisController.getLocationHazardAnalysis);
router.get('/analysis/policy/:policyId', HazardAnalysisController.getPolicyHazardExposure);

module.exports = router;










