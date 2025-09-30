const CATSimulationEngine = require('../services/CATSimulationEngine');
const SimulationRun = require('../models/SimulationRun');
const SimulationEvent = require('../models/SimulationEvent');
const { validationResult } = require('express-validator');
const { useMockDB, mockResponses } = require('../middleware/mockDataHandler');

class SimulationController {
  constructor() {
    this.simulationEngine = new CATSimulationEngine();
  }

  /**
   * Start a new simulation run
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async startSimulation(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const config = req.body;
      const userId = req.user?.id || 'anonymous';

      // Start simulation
      const result = await this.simulationEngine.startSimulation(config, userId);

      res.status(201).json({
        success: true,
        message: 'Simulation started successfully',
        data: result
      });
    } catch (error) {
      console.error('Error starting simulation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start simulation',
        error: error.message
      });
    }
  }

  /**
   * Get simulation run status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getSimulationStatus(req, res) {
    try {
      const { simulationRunId } = req.params;

      const simulationRun = await SimulationRun.findOne({ simulationRunId });
      if (!simulationRun) {
        return res.status(404).json({
          success: false,
          message: 'Simulation run not found'
        });
      }

      res.json({
        success: true,
        data: {
          simulationRunId: simulationRun.simulationRunId,
          simulationName: simulationRun.simulationName,
          status: simulationRun.status,
          progress: simulationRun.progress,
          currentStep: simulationRun.currentStep,
          startTime: simulationRun.startTime,
          endTime: simulationRun.endTime,
          duration: simulationRun.getDurationString(),
          performanceSummary: simulationRun.getPerformanceSummary(),
          resultsSummary: simulationRun.getResultsSummary()
        }
      });
    } catch (error) {
      console.error('Error getting simulation status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get simulation status',
        error: error.message
      });
    }
  }

  /**
   * Get simulation results
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getSimulationResults(req, res) {
    try {
      const { simulationRunId } = req.params;
      const { page = 1, limit = 100, sortBy = 'eventYear', sortOrder = 'asc' } = req.query;

      const simulationRun = await SimulationRun.findOne({ simulationRunId });
      if (!simulationRun) {
        return res.status(404).json({
          success: false,
          message: 'Simulation run not found'
        });
      }

      if (simulationRun.status !== 'Completed') {
        return res.status(400).json({
          success: false,
          message: 'Simulation not completed yet'
        });
      }

      // Get simulation events with pagination
      const skip = (page - 1) * limit;
      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      const events = await SimulationEvent.find({ simulationRunId })
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));

      const totalEvents = await SimulationEvent.countDocuments({ simulationRunId });

      res.json({
        success: true,
        data: {
          simulationRunId,
          results: simulationRun.results,
          events: events,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: totalEvents,
            pages: Math.ceil(totalEvents / limit)
          }
        }
      });
    } catch (error) {
      console.error('Error getting simulation results:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get simulation results',
        error: error.message
      });
    }
  }

  /**
   * Get simulation events by criteria
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getSimulationEvents(req, res) {
    try {
      const { simulationRunId } = req.params;
      const { 
        hazardType, 
        severity, 
        minLoss, 
        maxLoss, 
        startYear, 
        endYear,
        page = 1, 
        limit = 100 
      } = req.query;

      const query = { simulationRunId };

      // Apply filters
      if (hazardType) query.hazardType = hazardType;
      if (severity) query.severity = severity;
      if (minLoss || maxLoss) {
        query['financialImpact.totalLoss'] = {};
        if (minLoss) query['financialImpact.totalLoss'].$gte = parseFloat(minLoss);
        if (maxLoss) query['financialImpact.totalLoss'].$lte = parseFloat(maxLoss);
      }
      if (startYear || endYear) {
        query.eventYear = {};
        if (startYear) query.eventYear.$gte = parseInt(startYear);
        if (endYear) query.eventYear.$lte = parseInt(endYear);
      }

      const skip = (page - 1) * limit;
      const events = await SimulationEvent.find(query)
        .sort({ eventYear: 1, eventMonth: 1, eventDay: 1 })
        .skip(skip)
        .limit(parseInt(limit));

      const totalEvents = await SimulationEvent.countDocuments(query);

      res.json({
        success: true,
        data: {
          events,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: totalEvents,
            pages: Math.ceil(totalEvents / limit)
          }
        }
      });
    } catch (error) {
      console.error('Error getting simulation events:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get simulation events',
        error: error.message
      });
    }
  }

  /**
   * Get simulation statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getSimulationStatistics(req, res) {
    try {
      const { simulationRunId } = req.params;
      const { groupBy = 'hazardType' } = req.query;

      const simulationRun = await SimulationRun.findOne({ simulationRunId });
      if (!simulationRun) {
        return res.status(404).json({
          success: false,
          message: 'Simulation run not found'
        });
      }

      // Get aggregated statistics
      const pipeline = [
        { $match: { simulationRunId } },
        {
          $group: {
            _id: `$${groupBy}`,
            totalEvents: { $sum: 1 },
            totalLoss: { $sum: '$financialImpact.totalLoss' },
            averageLoss: { $avg: '$financialImpact.totalLoss' },
            maxLoss: { $max: '$financialImpact.totalLoss' },
            minLoss: { $min: '$financialImpact.totalLoss' },
            averageIntensity: { $avg: '$intensity' },
            averageProbability: { $avg: '$probability' }
          }
        },
        { $sort: { totalLoss: -1 } }
      ];

      const statistics = await SimulationEvent.aggregate(pipeline);

      res.json({
        success: true,
        data: {
          simulationRunId,
          groupBy,
          statistics,
          summary: simulationRun.results
        }
      });
    } catch (error) {
      console.error('Error getting simulation statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get simulation statistics',
        error: error.message
      });
    }
  }

  /**
   * Get simulation runs by user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getSimulationRuns(req, res) {
    try {
      // Return empty data in mock mode
      if (useMockDB) {
        return res.json(mockResponses.emptyList(req));
      }
      
      const { 
        status, 
        startYear, 
        endYear, 
        page = 1, 
        limit = 20 
      } = req.query;

      const query = {};
      if (status) query.status = status;
      if (startYear || endYear) {
        query['configuration.startYear'] = {};
        if (startYear) query['configuration.startYear'].$gte = parseInt(startYear);
        if (endYear) query['configuration.endYear'].$lte = parseInt(endYear);
      }

      const skip = (page - 1) * limit;
      const simulationRuns = await SimulationRun.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const totalRuns = await SimulationRun.countDocuments(query);

      res.json({
        success: true,
        data: {
          simulationRuns,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: totalRuns,
            pages: Math.ceil(totalRuns / limit)
          }
        }
      });
    } catch (error) {
      console.error('Error getting simulation runs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get simulation runs',
        error: error.message
      });
    }
  }

  /**
   * Cancel a simulation run
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async cancelSimulation(req, res) {
    try {
      const { simulationRunId } = req.params;

      const simulationRun = await SimulationRun.findOne({ simulationRunId });
      if (!simulationRun) {
        return res.status(404).json({
          success: false,
          message: 'Simulation run not found'
        });
      }

      if (simulationRun.status === 'Completed' || simulationRun.status === 'Failed') {
        return res.status(400).json({
          success: false,
          message: 'Cannot cancel completed or failed simulation'
        });
      }

      simulationRun.cancelSimulation();
      await simulationRun.save();

      res.json({
        success: true,
        message: 'Simulation cancelled successfully',
        data: {
          simulationRunId,
          status: simulationRun.status
        }
      });
    } catch (error) {
      console.error('Error cancelling simulation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel simulation',
        error: error.message
      });
    }
  }

  /**
   * Get simulation dashboard data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getSimulationDashboard(req, res) {
    try {
      // Return empty dashboard in mock mode
      if (useMockDB) {
        return res.json(mockResponses.emptyDashboard());
      }
      
      const { 
        timeRange = '30d',
        region,
        hazardType 
      } = req.query;

      // Calculate date range
      const now = new Date();
      let startDate;
      switch (timeRange) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '1y':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      // Get simulation runs in date range
      const simulationRuns = await SimulationRun.find({
        createdAt: { $gte: startDate }
      }).sort({ createdAt: -1 });

      // Get aggregated statistics
      const pipeline = [
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: null,
            totalRuns: { $sum: 1 },
            completedRuns: {
              $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
            },
            runningRuns: {
              $sum: { $cond: [{ $eq: ['$status', 'Running'] }, 1, 0] }
            },
            failedRuns: {
              $sum: { $cond: [{ $eq: ['$status', 'Failed'] }, 1, 0] }
            },
            totalEvents: { $sum: '$results.totalEvents' },
            totalLoss: { $sum: '$results.totalLoss' }
          }
        }
      ];

      const stats = await SimulationRun.aggregate(pipeline);
      const summary = stats[0] || {
        totalRuns: 0,
        completedRuns: 0,
        runningRuns: 0,
        failedRuns: 0,
        totalEvents: 0,
        totalLoss: 0
      };

      // Get recent simulation runs
      const recentRuns = simulationRuns.slice(0, 10);

      // Get hazard type distribution
      const hazardPipeline = [
        {
          $match: {
            createdAt: { $gte: startDate },
            status: 'Completed'
          }
        },
        {
          $unwind: '$results.eventsByHazardType'
        },
        {
          $group: {
            _id: '$results.eventsByHazardType',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ];

      const hazardDistribution = await SimulationRun.aggregate(hazardPipeline);

      res.json({
        success: true,
        data: {
          summary,
          recentRuns,
          hazardDistribution,
          timeRange
        }
      });
    } catch (error) {
      console.error('Error getting simulation dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get simulation dashboard',
        error: error.message
      });
    }
  }

  /**
   * Export simulation data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async exportSimulationData(req, res) {
    try {
      const { simulationRunId } = req.params;
      const { format = 'json', includeEvents = true } = req.query;

      const simulationRun = await SimulationRun.findOne({ simulationRunId });
      if (!simulationRun) {
        return res.status(404).json({
          success: false,
          message: 'Simulation run not found'
        });
      }

      let data = {
        simulationRun: simulationRun.toObject(),
        events: []
      };

      if (includeEvents === 'true') {
        const events = await SimulationEvent.find({ simulationRunId });
        data.events = events.map(event => event.toObject());
      }

      if (format === 'csv') {
        // Convert to CSV format
        const csv = this.convertToCSV(data);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="simulation_${simulationRunId}.csv"`);
        res.send(csv);
      } else {
        // Return as JSON
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="simulation_${simulationRunId}.json"`);
        res.json(data);
      }
    } catch (error) {
      console.error('Error exporting simulation data:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export simulation data',
        error: error.message
      });
    }
  }

  /**
   * Convert data to CSV format
   * @param {Object} data - Data to convert
   * @returns {string} CSV string
   */
  convertToCSV(data) {
    if (!data.events || data.events.length === 0) {
      return 'No events found';
    }

    const headers = [
      'eventId',
      'eventName',
      'hazardType',
      'severity',
      'intensity',
      'probability',
      'eventYear',
      'totalLoss',
      'directLoss',
      'indirectLoss',
      'businessInterruptionLoss'
    ];

    const csvRows = [headers.join(',')];

    data.events.forEach(event => {
      const row = [
        event.eventId,
        event.eventName,
        event.hazardType,
        event.severity,
        event.intensity,
        event.probability,
        event.eventYear,
        event.financialImpact.totalLoss,
        event.financialImpact.directLoss,
        event.financialImpact.indirectLoss,
        event.financialImpact.businessInterruptionLoss
      ];
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  }

  /**
   * Get simulation health status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getSimulationHealth(req, res) {
    try {
      const runningSimulations = await SimulationRun.countDocuments({ status: 'Running' });
      const pendingSimulations = await SimulationRun.countDocuments({ status: 'Pending' });
      const completedSimulations = await SimulationRun.countDocuments({ status: 'Completed' });
      const failedSimulations = await SimulationRun.countDocuments({ status: 'Failed' });

      const totalEvents = await SimulationEvent.countDocuments();
      const recentEvents = await SimulationEvent.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });

      res.json({
        success: true,
        data: {
          status: 'healthy',
          simulations: {
            running: runningSimulations,
            pending: pendingSimulations,
            completed: completedSimulations,
            failed: failedSimulations
          },
          events: {
            total: totalEvents,
            recent: recentEvents
          },
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error getting simulation health:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get simulation health',
        error: error.message
      });
    }
  }
}

module.exports = new SimulationController();
