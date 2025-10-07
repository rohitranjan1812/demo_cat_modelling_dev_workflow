/**
 * Exposure Routes
 * 
 * RESTful API endpoints for Exposure management.
 * Connects frontend to ExposureService backend methods.
 */

const express = require('express');
const router = express.Router();
const ExposureService = require('../services/ExposureService');

// Initialize service
const exposureService = new ExposureService();

/**
 * GET /api/exposures
 * Get all exposures with optional filters and pagination
 * 
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20)
 * - accountId: Filter by account ID
 * - status: Filter by status
 * - exposureType: Filter by exposure type
 */
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      accountId,
      policyId,
      locationId,
      status,
      exposureType,
      occupancyType,
      constructionType,
      minValue,
      maxValue,
      peril
    } = req.query;

    // Build filter object for service
    const filters = {};
    if (accountId) filters.accountId = accountId;
    if (policyId) filters.policyId = policyId;
    if (locationId) filters.locationId = locationId;
    if (status) filters.status = status;
    if (exposureType) filters.exposureType = exposureType;
    if (occupancyType) filters.occupancyType = occupancyType;
    if (constructionType) filters.constructionType = constructionType;
    if (minValue) filters.minValue = parseFloat(minValue);
    if (maxValue) filters.maxValue = parseFloat(maxValue);
    if (peril) filters.perilType = peril;

    // Get exposures with pagination
    const result = await exposureService.getExposures(
      filters,
      { page: parseInt(page), limit: parseInt(limit) }
    );

    res.json({
      success: true,
      data: result.data,  // exposures array
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error getting exposures:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/exposures/:id
 * Get a single exposure by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const exposure = await exposureService.findById(req.params.id);

    if (!exposure) {
      return res.status(404).json({
        success: false,
        error: 'Exposure not found'
      });
    }

    res.json({
      success: true,
      data: exposure
    });
  } catch (error) {
    console.error('Error getting exposure:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/exposures
 * Create a new exposure
 * 
 * Body: Exposure data matching Exposure model schema
 */
router.post('/', async (req, res) => {
  try {
    const exposure = await exposureService.createExposure(req.body);

    res.status(201).json({
      success: true,
      data: exposure,
      message: 'Exposure created successfully'
    });
  } catch (error) {
    console.error('Error creating exposure:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }))
      });
    }

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/exposures/:id
 * Update an existing exposure
 * 
 * Body: Partial exposure data to update
 */
router.put('/:id', async (req, res) => {
  try {
    const exposure = await exposureService.updateExposure(
      req.params.id,
      req.body
    );

    if (!exposure) {
      return res.status(404).json({
        success: false,
        error: 'Exposure not found'
      });
    }

    res.json({
      success: true,
      data: exposure,
      message: 'Exposure updated successfully'
    });
  } catch (error) {
    console.error('Error updating exposure:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }))
      });
    }

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/exposures/:id
 * Delete an exposure
 */
router.delete('/:id', async (req, res) => {
  try {
    const result = await exposureService.delete(req.params.id);

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Exposure not found'
      });
    }

    res.json({
      success: true,
      message: 'Exposure deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting exposure:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/exposures/account/:accountId
 * Get all exposures for a specific account
 */
router.get('/account/:accountId', async (req, res) => {
  try {
    const result = await exposureService.getExposures(
      { accountId: req.params.accountId }
    );

    res.json({
      success: true,
      data: result.data,
      count: result.data.length,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error getting exposures by account:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/exposures/location/:locationId
 * Get all exposures for a specific location
 */
router.get('/location/:locationId', async (req, res) => {
  try {
    const result = await exposureService.getExposures(
      { locationId: req.params.locationId }
    );

    res.json({
      success: true,
      data: result.data,
      count: result.data.length,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error getting exposures by location:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/exposures/policy/:policyId
 * Get all exposures for a specific policy
 */
router.get('/policy/:policyId', async (req, res) => {
  try {
    const result = await exposureService.getExposures(
      { policyId: req.params.policyId }
    );

    res.json({
      success: true,
      data: result.data,
      count: result.data.length,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error getting exposures by policy:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/exposures/bulk
 * Create multiple exposures in bulk
 * 
 * Body: { exposures: [...] }
 */
router.post('/bulk', async (req, res) => {
  try {
    const { exposures } = req.body;

    if (!Array.isArray(exposures)) {
      return res.status(400).json({
        success: false,
        error: 'exposures must be an array'
      });
    }

    // Use Promise.all to create all exposures
    const results = await Promise.all(
      exposures.map(exp => exposureService.createExposure(exp))
    );

    res.status(201).json({
      success: true,
      data: results,
      count: results.length,
      message: `${results.length} exposures created successfully`
    });
  } catch (error) {
    console.error('Error creating bulk exposures:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/exposures/search
 * Search exposures with advanced filters
 * 
 * Query params:
 * - q: Search term (searches exposureId, accountId, locationId)
 * - minValue: Minimum total value
 * - maxValue: Maximum total value
 * - peril: Filter by peril type
 * - occupancyType: Filter by occupancy type
 * - constructionType: Filter by construction type
 */
router.get('/search', async (req, res) => {
  try {
    const {
      q,
      page = 1,
      limit = 20,
      minValue,
      maxValue,
      peril,
      occupancyType,
      constructionType,
      exposureType,
      status
    } = req.query;

    // Build search filter
    const filter = {};
    
    if (q) {
      filter.$or = [
        { exposureId: new RegExp(q, 'i') },
        { accountId: new RegExp(q, 'i') },
        { locationId: new RegExp(q, 'i') },
        { policyId: new RegExp(q, 'i') }
      ];
    }

    if (minValue || maxValue) {
      filter.totalInsuredValue = {};
      if (minValue) filter.totalInsuredValue.$gte = parseFloat(minValue);
      if (maxValue) filter.totalInsuredValue.$lte = parseFloat(maxValue);
    }

    if (peril) {
      filter['perilExposures.peril'] = peril;
    }

    if (occupancyType) {
      filter.occupancyType = occupancyType;
    }

    if (constructionType) {
      filter.constructionType = constructionType;
    }

    if (exposureType) {
      filter.exposureType = exposureType;
    }

    if (status) {
      filter.status = status;
    }

    // Get exposures with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const result = await exposureService.getExposures(
      filter,
      { skip, limit: parseInt(limit) }
    );

    // Get total count for pagination
    const Exposure = require('../models/Exposure');
    const total = await Exposure.countDocuments(filter);

    res.json({
      success: true,
      data: result.data,  // exposures array
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error searching exposures:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/exposures/statistics/summary
 * Get exposure statistics and summary
 */
router.get('/statistics/summary', async (req, res) => {
  try {
    const { accountId } = req.query;
    
    const filter = accountId ? { accountId } : {};
    const result = await exposureService.getExposures(filter);
    const exposures = result.data;

    // Calculate statistics
    const statistics = {
      totalCount: exposures.length,
      totalValue: exposures.reduce((sum, exp) => sum + (exp.totalValue || 0), 0),
      byType: {},
      byOccupancy: {},
      byConstruction: {},
      byStatus: {}
    };

    // Group by various dimensions
    exposures.forEach(exp => {
      // By type
      statistics.byType[exp.exposureType] = (statistics.byType[exp.exposureType] || 0) + 1;
      
      // By occupancy
      if (exp.occupancyType) {
        statistics.byOccupancy[exp.occupancyType] = (statistics.byOccupancy[exp.occupancyType] || 0) + 1;
      }
      
      // By construction
      if (exp.constructionType) {
        statistics.byConstruction[exp.constructionType] = (statistics.byConstruction[exp.constructionType] || 0) + 1;
      }
      
      // By status
      statistics.byStatus[exp.status] = (statistics.byStatus[exp.status] || 0) + 1;
    });

    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('Error getting exposure statistics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
