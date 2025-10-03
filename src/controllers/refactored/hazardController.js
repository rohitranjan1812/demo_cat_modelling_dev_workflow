/**
 * Refactored Hazard Controller using Service Layer
 * Handles HTTP requests and delegates business logic to HazardService
 */

const HazardService = require('../../services/HazardService');
const { useMockDB, mockResponses } = require('../../middleware/mockDataHandler');

class HazardController {
  constructor() {
    this.hazardService = new HazardService();
  }

  /**
   * Get all hazards with filtering and pagination
   * GET /api/v1/hazards
   */
  async getAllHazards(req, res) {
    try {
      // Return empty data in mock mode
      if (useMockDB) {
        return res.json(mockResponses.emptyList(req));
      }

      const result = await this.hazardService.getHazards(req.query);
      res.json(result);
    } catch (error) {
      console.error('Error fetching hazards:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching hazards',
        error: error.message
      });
    }
  }

  /**
   * Get hazard by ID
   * GET /api/v1/hazards/:id
   */
  async getHazardById(req, res) {
    try {
      // Return not found in mock mode
      if (useMockDB) {
        return res.status(404).json({
          success: false,
          message: 'Hazard not found (mock mode - no data available)'
        });
      }

      const { id } = req.params;
      const result = await this.hazardService.getHazardById(id);

      res.json(result);
    } catch (error) {
      console.error('Error fetching hazard:', error);
      if (error.message === 'Hazard not found') {
        return res.status(404).json({
          success: false,
          message: 'Hazard not found'
        });
      }
      res.status(500).json({
        success: false,
        message: 'Error fetching hazard',
        error: error.message
      });
    }
  }

  /**
   * Create a new hazard
   * POST /api/v1/hazards
   */
  async createHazard(req, res) {
    try {
      console.log('Creating hazard with data:', JSON.stringify(req.body, null, 2));
      const userId = req.user?._id || 'system';
      const result = await this.hazardService.createHazard(req.body, userId);

      res.status(201).json(result);
    } catch (error) {
      console.error('Error creating hazard:', error);
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.details || error.message
        });
      }
      res.status(500).json({
        success: false,
        message: 'Error creating hazard',
        error: error.message
      });
    }
  }

  /**
   * Update hazard
   * PUT /api/v1/hazards/:id
   */
  async updateHazard(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?._id || 'system';
      const result = await this.hazardService.updateHazard(id, req.body, userId);

      res.json(result);
    } catch (error) {
      console.error('Error updating hazard:', error);
      if (error.message === 'Hazard not found') {
        return res.status(404).json({
          success: false,
          message: 'Hazard not found'
        });
      }
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.details || error.message
        });
      }
      res.status(500).json({
        success: false,
        message: 'Error updating hazard',
        error: error.message
      });
    }
  }

  /**
   * Delete hazard
   * DELETE /api/v1/hazards/:id
   */
  async deleteHazard(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?._id || 'system';
      const result = await this.hazardService.deleteHazard(id, userId);

      res.json(result);
    } catch (error) {
      console.error('Error deleting hazard:', error);
      if (error.message === 'Hazard not found') {
        return res.status(404).json({
          success: false,
          message: 'Hazard not found'
        });
      }
      res.status(500).json({
        success: false,
        message: 'Error deleting hazard',
        error: error.message
      });
    }
  }

  /**
   * Get hazards within geographic bounds
   * GET /api/v1/hazards/bounds
   */
  async getHazardsInBounds(req, res) {
    try {
      const { minLat, maxLat, minLng, maxLng } = req.query;
      
      if (!minLat || !maxLat || !minLng || !maxLng) {
        return res.status(400).json({
          success: false,
          message: 'Geographic bounds are required (minLat, maxLat, minLng, maxLng)'
        });
      }

      const bounds = {
        minLat: parseFloat(minLat),
        maxLat: parseFloat(maxLat),
        minLng: parseFloat(minLng),
        maxLng: parseFloat(maxLng)
      };

      const result = await this.hazardService.getHazardsInBounds(bounds, req.query);
      res.json(result);
    } catch (error) {
      console.error('Error fetching hazards in bounds:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching hazards in bounds',
        error: error.message
      });
    }
  }

  /**
   * Get hazards near a location
   * GET /api/v1/hazards/near
   */
  async getHazardsNearLocation(req, res) {
    try {
      const { latitude, longitude, maxDistance } = req.query;
      
      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: 'Latitude and longitude are required'
        });
      }

      const location = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      };

      const options = {};
      if (maxDistance) {
        options.maxDistance = parseFloat(maxDistance);
      }

      const result = await this.hazardService.getHazardsNearLocation(location, options);
      res.json(result);
    } catch (error) {
      console.error('Error fetching nearby hazards:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching nearby hazards',
        error: error.message
      });
    }
  }

  /**
   * Search hazards
   * GET /api/v1/hazards/search
   */
  async searchHazards(req, res) {
    try {
      const { q, ...options } = req.query;
      
      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      const result = await this.hazardService.searchHazards(q, options);
      res.json(result);
    } catch (error) {
      console.error('Error searching hazards:', error);
      res.status(500).json({
        success: false,
        message: 'Error searching hazards',
        error: error.message
      });
    }
  }

  /**
   * Get hazard statistics
   * GET /api/v1/hazards/statistics
   */
  async getHazardStatistics(req, res) {
    try {
      const result = await this.hazardService.getHazardStatistics(req.query);
      res.json(result);
    } catch (error) {
      console.error('Error fetching hazard statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching hazard statistics',
        error: error.message
      });
    }
  }

  /**
   * Link hazard to vulnerability
   * POST /api/v1/hazards/:id/link-vulnerability
   */
  async linkVulnerability(req, res) {
    try {
      const { id } = req.params;
      const { vulnerabilityId, relationshipType } = req.body;

      if (!vulnerabilityId) {
        return res.status(400).json({
          success: false,
          message: 'Vulnerability ID is required'
        });
      }

      const result = await this.hazardService.linkVulnerability(id, vulnerabilityId, relationshipType);
      res.json(result);
    } catch (error) {
      console.error('Error linking hazard to vulnerability:', error);
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      res.status(500).json({
        success: false,
        message: 'Error linking hazard to vulnerability',
        error: error.message
      });
    }
  }

  /**
   * Unlink hazard from vulnerability
   * DELETE /api/v1/hazards/:id/unlink-vulnerability/:vulnerabilityId
   */
  async unlinkVulnerability(req, res) {
    try {
      const { id, vulnerabilityId } = req.params;

      const result = await this.hazardService.unlinkVulnerability(id, vulnerabilityId);
      res.json(result);
    } catch (error) {
      console.error('Error unlinking hazard from vulnerability:', error);
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      res.status(500).json({
        success: false,
        message: 'Error unlinking hazard from vulnerability',
        error: error.message
      });
    }
  }
}

// Create singleton instance
const hazardController = new HazardController();

module.exports = hazardController;
