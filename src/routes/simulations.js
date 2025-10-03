const express = require('express');
const { body, query, param } = require('express-validator');
const simulationController = require('../controllers/simulationController');

const router = express.Router();

// Validation schemas
const startSimulationValidation = [
  body('simulationName')
    .optional()
    .isString()
    .isLength({ min: 1, max: 200 })
    .withMessage('Simulation name must be between 1 and 200 characters'),
  
  body('simulationDescription')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('Simulation description must be less than 1000 characters'),
  
  body('startYear')
    .isInt({ min: 1900, max: 3000 })
    .withMessage('Start year must be between 1900 and 3000'),
  
  body('endYear')
    .isInt({ min: 1900, max: 3000 })
    .withMessage('End year must be between 1900 and 3000'),
  
  body('timeHorizon')
    .isInt({ min: 1 })
    .withMessage('Time horizon must be a positive integer'),
  
  body('timeHorizonUnit')
    .isIn(['years', 'months', 'days'])
    .withMessage('Time horizon unit must be years, months, or days'),
  
  body('hazardTypes')
    .optional()
    .isArray()
    .withMessage('Hazard types must be an array'),
  
  body('hazardTypes.*')
    .optional()
    .isIn([
      'Earthquake', 'Hurricane', 'Typhoon', 'Cyclone', 'Tornado', 'Flood', 'Flash Flood',
      'Wildfire', 'Forest Fire', 'Bushfire', 'Hail', 'Wind', 'Storm Surge', 'Tsunami',
      'Volcanic Eruption', 'Landslide', 'Avalanche', 'Drought', 'Heat Wave', 'Cold Wave',
      'Ice Storm', 'Blizzard', 'Sandstorm', 'Dust Storm', 'Terrorism', 'Cyber Attack',
      'Nuclear Accident', 'Chemical Spill', 'Oil Spill', 'Industrial Accident',
      'Transportation Accident', 'Infrastructure Failure', 'Pandemic', 'Biological Attack',
      'Radiological Attack', 'Space Weather', 'Solar Flare', 'Asteroid Impact',
      'Climate Change Impact', 'Sea Level Rise', 'Permafrost Thaw', 'Glacial Lake Outburst'
    ])
    .withMessage('Invalid hazard type'),
  
  body('geographicScope.regions')
    .optional()
    .isArray()
    .withMessage('Regions must be an array'),
  
  body('geographicScope.regions.*')
    .optional()
    .isIn(['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East', 'Africa'])
    .withMessage('Invalid region'),
  
  body('exposureScope.currency')
    .optional()
    .isIn(['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CNY', 'INR', 'BRL'])
    .withMessage('Invalid currency'),
  
  body('modelingConfig.numberOfSimulations')
    .isInt({ min: 1, max: 1000000 })
    .withMessage('Number of simulations must be between 1 and 1,000,000'),
  
  body('modelingConfig.modelProvider')
    .optional()
    .isIn(['RMS', 'AIR', 'CoreLogic', 'Karen Clark', 'JBA', 'Custom', 'Multiple'])
    .withMessage('Invalid model provider'),
  
  body('modelingConfig.modelType')
    .optional()
    .isIn(['Probabilistic', 'Deterministic', 'Scenario', 'Hybrid'])
    .withMessage('Invalid model type'),
  
  body('modelingConfig.resolution')
    .optional()
    .isIn(['High', 'Medium', 'Low', 'Variable'])
    .withMessage('Invalid resolution')
];

const simulationRunIdValidation = [
  param('simulationRunId')
    .matches(/^SIMRUN-\d{8}-\d{6}$/)
    .withMessage('Invalid simulation run ID format')
];

const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Limit must be between 1 and 1000'),
  
  query('sortBy')
    .optional()
    .isIn(['eventYear', 'eventMonth', 'eventDay', 'intensity', 'probability', 'financialImpact.totalLoss'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

const eventQueryValidation = [
  query('hazardType')
    .optional()
    .isIn([
      'Earthquake', 'Hurricane', 'Typhoon', 'Cyclone', 'Tornado', 'Flood', 'Flash Flood',
      'Wildfire', 'Forest Fire', 'Bushfire', 'Hail', 'Wind', 'Storm Surge', 'Tsunami',
      'Volcanic Eruption', 'Landslide', 'Avalanche', 'Drought', 'Heat Wave', 'Cold Wave',
      'Ice Storm', 'Blizzard', 'Sandstorm', 'Dust Storm', 'Terrorism', 'Cyber Attack',
      'Nuclear Accident', 'Chemical Spill', 'Oil Spill', 'Industrial Accident',
      'Transportation Accident', 'Infrastructure Failure', 'Pandemic', 'Biological Attack',
      'Radiological Attack', 'Space Weather', 'Solar Flare', 'Asteroid Impact',
      'Climate Change Impact', 'Sea Level Rise', 'Permafrost Thaw', 'Glacial Lake Outburst'
    ])
    .withMessage('Invalid hazard type'),
  
  query('severity')
    .optional()
    .isIn(['Minor', 'Moderate', 'Major', 'Severe', 'Catastrophic', 'Extreme'])
    .withMessage('Invalid severity level'),
  
  query('minLoss')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum loss must be a positive number'),
  
  query('maxLoss')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum loss must be a positive number'),
  
  query('startYear')
    .optional()
    .isInt({ min: 1900, max: 3000 })
    .withMessage('Start year must be between 1900 and 3000'),
  
  query('endYear')
    .optional()
    .isInt({ min: 1900, max: 3000 })
    .withMessage('End year must be between 1900 and 3000')
];

// Routes

/**
 * @route POST /api/v1/simulations/start
 * @desc Start a new simulation run
 * @access Private
 */
router.post('/start', startSimulationValidation, simulationController.startSimulation);

/**
 * @route GET /api/v1/simulations/runs
 * @desc Get simulation runs with optional filtering
 * @access Private
 */
router.get('/runs', queryValidation, simulationController.getSimulationRuns);

/**
 * @route GET /api/v1/simulations/dashboard
 * @desc Get simulation dashboard data
 * @access Private
 */
router.get('/dashboard', simulationController.getSimulationDashboard);

/**
 * @route GET /api/v1/simulations/health
 * @desc Get simulation system health status
 * @access Private
 */
router.get('/health', simulationController.getSimulationHealth);

/**
 * @route GET /api/v1/simulations/:simulationRunId/status
 * @desc Get simulation run status
 * @access Private
 */
router.get('/:simulationRunId/status', simulationRunIdValidation, simulationController.getSimulationStatus);

/**
 * @route GET /api/v1/simulations/:simulationRunId/results
 * @desc Get simulation results
 * @access Private
 */
router.get('/:simulationRunId/results', 
  simulationRunIdValidation, 
  queryValidation, 
  simulationController.getSimulationResults
);

/**
 * @route GET /api/v1/simulations/:simulationRunId/events
 * @desc Get simulation events with filtering
 * @access Private
 */
router.get('/:simulationRunId/events', 
  simulationRunIdValidation, 
  eventQueryValidation, 
  queryValidation, 
  simulationController.getSimulationEvents
);

/**
 * @route GET /api/v1/simulations/:simulationRunId/statistics
 * @desc Get simulation statistics
 * @access Private
 */
router.get('/:simulationRunId/statistics', 
  simulationRunIdValidation, 
  query('groupBy')
    .optional()
    .isIn(['hazardType', 'severity', 'eventYear', 'eventMonth'])
    .withMessage('Invalid group by field'),
  simulationController.getSimulationStatistics
);

/**
 * @route GET /api/v1/simulations/:simulationRunId/export
 * @desc Export simulation data
 * @access Private
 */
router.get('/:simulationRunId/export', 
  simulationRunIdValidation,
  query('format')
    .optional()
    .isIn(['json', 'csv'])
    .withMessage('Format must be json or csv'),
  query('includeEvents')
    .optional()
    .isBoolean()
    .withMessage('Include events must be boolean'),
  simulationController.exportSimulationData
);

/**
 * @route POST /api/v1/simulations/:simulationRunId/cancel
 * @desc Cancel a simulation run
 * @access Private
 */
router.post('/:simulationRunId/cancel', simulationRunIdValidation, simulationController.cancelSimulation);

module.exports = router;
