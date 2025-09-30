const express = require('express');
const router = express.Router();
const {
  HazardController,
  HazardEventController,
  HazardZoneController,
  HazardScenarioController,
  HazardAnalysisController
} = require('../controllers/hazardController');
const { validateHazard, validateHazardEvent, validateHazardZone, validateHazardScenario } = require('../validation/hazardSchemas');

// Hazard Routes
// IMPORTANT: Specific routes MUST come before parametrized routes (:id)
router.get('/hazards/affecting-location', HazardController.getHazardsAffectingLocation);
router.get('/hazards/statistics', HazardController.getHazardStatistics);
router.get('/hazards', HazardController.getAllHazards);
router.get('/hazards/:id', HazardController.getHazardById);
router.post('/hazards', validateHazard, HazardController.createHazard);
router.put('/hazards/:id', validateHazard, HazardController.updateHazard);
router.delete('/hazards/:id', HazardController.deleteHazard);

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










