/**
 * Simulation Service for CAT Modeling Platform
 * Handles all simulation-related business logic and database operations
 * 
 * @param {CATSimulationEngine} simulationEngine - Simulation engine instance
 * @param {FinancialCalculationService} financialService - Financial calculations service
 * @param {IntegrationService} integrationService - Integration service
 */

const BaseService = require('./BaseService');
const SimulationRun = require('../models/SimulationRun');
const SimulationEvent = require('../models/SimulationEvent');
const Hazard = require('../models/Hazard');
const Vulnerability = require('../models/Vulnerability');
const Account = require('../models/Account');

class SimulationService extends BaseService {
  constructor(simulationEngine = null, financialService = null, integrationService = null) {
    super(SimulationRun);
    
    // Injected services
    this.simulationEngine = simulationEngine;
    this.financialService = financialService;
    this.integrationService = integrationService;
    
    // Fallback for non-DI initialization (backward compatibility)
    if (!this.simulationEngine) {
      console.warn('SimulationService: No engine injected, creating default instance');
      const CATSimulationEngine = require('./CATSimulationEngine');
      this.simulationEngine = new CATSimulationEngine();
    }
    
    if (!this.financialService) {
      console.warn('SimulationService: No financial service injected, creating default instance');
      const FinancialCalculationService = require('./FinancialCalculationService');
      this.financialService = new FinancialCalculationService();
    }
  }

  /**
   * Get simulation runs with filtering
   * @param {Object} filters - Filter parameters
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Filtered simulation runs with pagination
   */
  async getSimulationRuns(filters = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        simulationType,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = { ...filters, ...options };

      // Build filter object
      const filter = {};
      
      if (status) filter.status = status;
      if (simulationType) filter.simulationType = simulationType;

      // Add search functionality
      if (search) {
        filter.$or = [
          { simulationName: { $regex: search, $options: 'i' } },
          { simulationRunId: { $regex: search, $options: 'i' } },
          { simulationDescription: { $regex: search, $options: 'i' } }
        ];
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const result = await this.find(filter, {
        page: parseInt(page),
        limit: parseInt(limit),
        sort
      });

      return this.createSuccessResponse(result, 'Simulation runs retrieved successfully');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get simulation run by ID with full details
   * @param {string} id - Simulation run ID
   * @returns {Promise<Object>} Simulation run details
   */
  async getSimulationRunById(id) {
    try {
      const simulationRun = await this.findById(id);

      if (!simulationRun) {
        throw new Error('Simulation run not found');
      }

      // Get simulation events
      const events = await SimulationEvent.find({ simulationRunId: simulationRun.simulationRunId })
        .sort({ eventTime: -1 });

      // Get financial metrics
      const financialMetrics = await this.calculateFinancialMetrics(simulationRun);

      const simulationDetails = {
        ...simulationRun.toObject(),
        events,
        financialMetrics
      };

      return this.createSuccessResponse(simulationDetails, 'Simulation run details retrieved successfully');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Start a new simulation
   * @param {Object} simulationConfig - Simulation configuration
   * @param {string} userId - User ID starting the simulation
   * @returns {Promise<Object>} Started simulation
   */
  async startSimulation(simulationConfig, userId) {
    try {
      // Generate simulation run ID
      const runCount = await this.count();
      const simulationRunId = `SIMRUN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${(runCount + 1).toString().padStart(6, '0')}`;

      const simulationRunData = {
        simulationRunId,
        simulationName: simulationConfig.simulationName || `Simulation ${simulationRunId}`,
        simulationDescription: simulationConfig.simulationDescription || 'CAT modeling simulation',
        simulationType: simulationConfig.simulationType || 'Portfolio',
        configuration: simulationConfig,
        status: 'Running',
        createdBy: userId,
        lastModifiedBy: userId
      };

      // Create simulation run record
      const simulationRun = await this.create(simulationRunData);

      // Start simulation asynchronously
      this.runSimulationAsync(simulationRunId, simulationConfig)
        .catch(error => {
          console.error('Simulation error:', error);
          this.updateSimulationStatus(simulationRunId, 'Failed', error.message);
        });

      return this.createSuccessResponse(simulationRun, 'Simulation started successfully');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Run simulation asynchronously
   * @param {string} simulationRunId - Simulation run ID
   * @param {Object} config - Simulation configuration
   * @returns {Promise<void>}
   */
  async runSimulationAsync(simulationRunId, config) {
    try {
      console.log(`Starting simulation: ${simulationRunId}`);

      // Run the simulation
      const simulationResult = await this.simulationEngine.runSimulation(simulationRunId, config);

      // Update simulation status
      await this.updateSimulationStatus(simulationRunId, 'Completed', 'Simulation completed successfully');

      // Store simulation events
      if (simulationResult.events && simulationResult.events.length > 0) {
        await this.storeSimulationEvents(simulationRunId, simulationResult.events);
      }

      console.log(`Simulation completed: ${simulationRunId}`);
    } catch (error) {
      console.error(`Simulation failed: ${simulationRunId}`, error);
      await this.updateSimulationStatus(simulationRunId, 'Failed', error.message);
    }
  }

  /**
   * Update simulation status
   * @param {string} simulationRunId - Simulation run ID
   * @param {string} status - New status
   * @param {string} message - Status message
   * @returns {Promise<void>}
   */
  async updateSimulationStatus(simulationRunId, status, message) {
    try {
      await this.updateOne(
        { simulationRunId },
        {
          status,
          statusMessage: message,
          completedAt: status === 'Completed' ? new Date() : undefined,
          lastModifiedAt: new Date()
        }
      );
    } catch (error) {
      console.error('Error updating simulation status:', error);
    }
  }

  /**
   * Store simulation events
   * @param {string} simulationRunId - Simulation run ID
   * @param {Array} events - Simulation events
   * @returns {Promise<void>}
   */
  async storeSimulationEvents(simulationRunId, events) {
    try {
      const eventDocuments = events.map(event => ({
        simulationRunId,
        eventType: event.eventType || 'Hazard',
        eventTime: event.eventTime || new Date(),
        location: event.location,
        intensity: event.intensity,
        financialImpact: event.financialImpact,
        affectedAccounts: event.affectedAccounts || [],
        affectedVulnerabilities: event.affectedVulnerabilities || [],
        metadata: event.metadata || {}
      }));

      await SimulationEvent.insertMany(eventDocuments);
    } catch (error) {
      console.error('Error storing simulation events:', error);
    }
  }

  /**
   * Stop a running simulation
   * @param {string} id - Simulation run ID
   * @param {string} userId - User ID stopping the simulation
   * @returns {Promise<Object>} Stop result
   */
  async stopSimulation(id, userId) {
    try {
      const simulationRun = await this.findById(id);
      if (!simulationRun) {
        throw new Error('Simulation run not found');
      }

      if (simulationRun.status !== 'Running') {
        throw new Error('Simulation is not currently running');
      }

      // Update status to stopped
      const updatedSimulation = await this.updateById(id, {
        status: 'Stopped',
        statusMessage: 'Simulation stopped by user',
        lastModifiedBy: userId,
        lastModifiedAt: new Date()
      });

      return this.createSuccessResponse(updatedSimulation, 'Simulation stopped successfully');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete simulation run
   * @param {string} id - Simulation run ID
   * @param {string} userId - User ID deleting the simulation
   * @returns {Promise<Object>} Deletion result
   */
  async deleteSimulationRun(id, userId) {
    try {
      const simulationRun = await this.findById(id);
      if (!simulationRun) {
        throw new Error('Simulation run not found');
      }

      // Delete associated events first
      await SimulationEvent.deleteMany({ simulationRunId: simulationRun.simulationRunId });

      // Delete simulation run
      const deletedSimulation = await this.deleteById(id, { soft: true });

      return this.createSuccessResponse(
        { id: deletedSimulation._id, status: 'deleted' },
        'Simulation run deleted successfully'
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Calculate financial metrics for simulation
   * @param {Object} simulationRun - Simulation run object
   * @returns {Promise<Object>} Financial metrics
   */
  async calculateFinancialMetrics(simulationRun) {
    try {
      // Get simulation events
      const events = await SimulationEvent.find({ simulationRunId: simulationRun.simulationRunId });

      if (events.length === 0) {
        return {
          totalLoss: 0,
          expectedLoss: 0,
          valueAtRisk: {},
          tailValueAtRisk: {},
          lossDistribution: []
        };
      }

      // Extract loss data
      const lossData = events
        .map(event => event.financialImpact?.totalLoss || 0)
        .filter(loss => loss > 0);

      if (lossData.length === 0) {
        return {
          totalLoss: 0,
          expectedLoss: 0,
          valueAtRisk: {},
          tailValueAtRisk: {},
          lossDistribution: []
        };
      }

      // Calculate financial metrics
      const expectedLoss = this.financialCalculator.calculateExpectedLoss(lossData);
      const var95 = this.financialCalculator.calculateValueAtRisk(lossData, 0.95);
      const var99 = this.financialCalculator.calculateValueAtRisk(lossData, 0.99);
      const tvar95 = this.financialCalculator.calculateTailValueAtRisk(lossData, 0.95);
      const tvar99 = this.financialCalculator.calculateTailValueAtRisk(lossData, 0.99);

      return {
        totalLoss: lossData.reduce((sum, loss) => sum + loss, 0),
        expectedLoss,
        valueAtRisk: {
          '95%': var95,
          '99%': var99
        },
        tailValueAtRisk: {
          '95%': tvar95,
          '99%': tvar99
        },
        lossDistribution: this.financialCalculator.calculateLossExceedanceCurve(lossData)
      };
    } catch (error) {
      console.error('Error calculating financial metrics:', error);
      return {
        totalLoss: 0,
        expectedLoss: 0,
        valueAtRisk: {},
        tailValueAtRisk: {},
        lossDistribution: []
      };
    }
  }

  /**
   * Get simulation statistics
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Simulation statistics
   */
  async getSimulationStatistics(filters = {}) {
    try {
      const stats = await this.getStatistics(filters, ['status', 'simulationType']);
      
      // Get additional metrics
      const totalSimulations = await this.count(filters);
      const runningSimulations = await this.count({ ...filters, status: 'Running' });
      const completedSimulations = await this.count({ ...filters, status: 'Completed' });
      const failedSimulations = await this.count({ ...filters, status: 'Failed' });

      // Get recent simulations
      const recentSimulations = await this.find(filters, {
        sort: { createdAt: -1 },
        limit: 5
      });

      return this.createSuccessResponse({
        totalSimulations,
        runningSimulations,
        completedSimulations,
        failedSimulations,
        recentSimulations: recentSimulations.data,
        breakdown: stats
      }, 'Simulation statistics retrieved successfully');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get simulation dashboard data
   * @returns {Promise<Object>} Dashboard data
   */
  async getSimulationDashboard() {
    try {
      // Get recent simulations
      const recentSimulations = await this.find({}, {
        sort: { createdAt: -1 },
        limit: 10
      });

      // Get running simulations
      const runningSimulations = await this.find({ status: 'Running' }, {
        sort: { createdAt: -1 },
        limit: 5
      });

      // Get statistics
      const statistics = await this.getSimulationStatistics();

      // Get simulation events for the last 24 hours
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const recentEvents = await SimulationEvent.find({
        eventTime: { $gte: yesterday }
      }).sort({ eventTime: -1 }).limit(20);

      return this.createSuccessResponse({
        recentSimulations: recentSimulations.data,
        runningSimulations: runningSimulations.data,
        statistics: statistics.data,
        recentEvents: recentEvents
      }, 'Simulation dashboard data retrieved successfully');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Clone a simulation run
   * @param {string} id - Original simulation run ID
   * @param {Object} modifications - Modifications to apply
   * @param {string} userId - User ID cloning the simulation
   * @returns {Promise<Object>} Cloned simulation
   */
  async cloneSimulationRun(id, modifications = {}, userId) {
    try {
      const originalSimulation = await this.findById(id);
      if (!originalSimulation) {
        throw new Error('Original simulation run not found');
      }

      // Generate new simulation run ID
      const runCount = await this.count();
      const simulationRunId = `SIMRUN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${(runCount + 1).toString().padStart(6, '0')}`;

      const clonedData = {
        ...originalSimulation.toObject(),
        _id: undefined,
        simulationRunId,
        simulationName: modifications.simulationName || `${originalSimulation.simulationName} (Copy)`,
        simulationDescription: modifications.simulationDescription || originalSimulation.simulationDescription,
        status: 'Draft',
        createdBy: userId,
        lastModifiedBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: undefined,
        ...modifications
      };

      const clonedSimulation = await this.create(clonedData);

      return this.createSuccessResponse(clonedSimulation, 'Simulation cloned successfully');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get simulation events for a run
   * @param {string} simulationRunId - Simulation run ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Simulation events
   */
  async getSimulationEvents(simulationRunId, options = {}) {
    try {
      const { page = 1, limit = 50, eventType, sortBy = 'eventTime', sortOrder = 'desc' } = options;

      const filter = { simulationRunId };
      if (eventType) filter.eventType = eventType;

      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const skip = (page - 1) * limit;
      
      const [events, total] = await Promise.all([
        SimulationEvent.find(filter).sort(sort).skip(skip).limit(parseInt(limit)).exec(),
        SimulationEvent.countDocuments(filter)
      ]);

      return this.createSuccessResponse({
        data: events,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }, 'Simulation events retrieved successfully');
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

module.exports = SimulationService;
