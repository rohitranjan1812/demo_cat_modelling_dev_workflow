/**
 * Hazard Service for CAT Modeling Platform
 * Handles all hazard-related business logic and database operations
 */

const BaseService = require('./BaseService');
const Hazard = require('../models/Hazard');
const HazardEvent = require('../models/HazardEvent');
const HazardZone = require('../models/HazardZone');
const HazardScenario = require('../models/HazardScenario');
const Vulnerability = require('../models/Vulnerability');
const Account = require('../models/Account');

class HazardService extends BaseService {
  constructor() {
    super(Hazard);
  }

  /**
   * Get hazards with advanced filtering
   * @param {Object} filters - Filter parameters
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Filtered hazards with pagination
   */
  async getHazards(filters = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        hazardType,
        hazardCategory,
        severity,
        region,
        country,
        minProbability,
        maxProbability,
        isHistorical,
        isSimulated,
        status = 'Active',
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = { ...filters, ...options };

      // Build filter object
      const filter = { status };
      
      if (hazardType) filter.hazardType = hazardType;
      if (hazardCategory) filter.hazardCategory = hazardCategory;
      if (severity) filter.severity = severity;
      if (region) filter.affectedRegions = region;
      if (country) filter.affectedCountries = country;
      if (isHistorical !== undefined) filter.isHistorical = isHistorical === 'true';
      if (isSimulated !== undefined) filter.isSimulated = isSimulated === 'true';
      
      if (minProbability || maxProbability) {
        filter.probability = {};
        if (minProbability) filter.probability.$gte = parseFloat(minProbability);
        if (maxProbability) filter.probability.$lte = parseFloat(maxProbability);
      }

      // Add search functionality
      if (search) {
        filter.$or = [
          { hazardName: { $regex: search, $options: 'i' } },
          { hazardDescription: { $regex: search, $options: 'i' } },
          { hazardId: { $regex: search, $options: 'i' } }
        ];
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const result = await this.find(filter, {
        page: parseInt(page),
        limit: parseInt(limit),
        sort,
        populate: ['linkedVulnerabilities']
      });

      return this.createSuccessResponse(result, 'Hazards retrieved successfully');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get hazard by ID with full details
   * @param {string} id - Hazard ID
   * @returns {Promise<Object>} Hazard details
   */
  async getHazardById(id) {
    try {
      const hazard = await this.findById(id, {
        populate: ['linkedVulnerabilities', 'linkedAccounts']
      });

      if (!hazard) {
        throw new Error('Hazard not found');
      }

      // Get related events
      const events = await HazardEvent.find({ hazardId: hazard.hazardId })
        .sort({ eventDate: -1 })
        .limit(10);

      // Get related scenarios
      const scenarios = await HazardScenario.find({ hazardId: hazard.hazardId })
        .sort({ createdAt: -1 })
        .limit(5);

      // Get risk metrics
      const riskMetrics = await this.calculateRiskMetrics(hazard);

      const hazardDetails = {
        ...hazard.toObject(),
        events,
        scenarios,
        riskMetrics
      };

      return this.createSuccessResponse(hazardDetails, 'Hazard details retrieved successfully');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create a new hazard
   * @param {Object} hazardData - Hazard data
   * @param {string} userId - User ID creating the hazard
   * @returns {Promise<Object>} Created hazard
   */
  async createHazard(hazardData, userId) {
    try {
      // Generate hazard ID
      const hazardCount = await this.count();
      const hazardId = `HAZ-${(hazardCount + 1).toString().padStart(8, '0')}`;

      const newHazardData = {
        ...hazardData,
        hazardId,
        createdBy: userId,
        lastModifiedBy: userId,
        status: 'Active'
      };

      // Validate required fields (skip required validation since we're adding required fields)
      const validation = await this.validate(newHazardData, { skipRequired: true });
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
      }

      // Create the document directly with the model to avoid validation issues
      const hazard = new this.model(newHazardData);
      await hazard.save();

      return this.createSuccessResponse(hazard, 'Hazard created successfully');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update hazard
   * @param {string} id - Hazard ID
   * @param {Object} updateData - Update data
   * @param {string} userId - User ID updating the hazard
   * @returns {Promise<Object>} Updated hazard
   */
  async updateHazard(id, updateData, userId) {
    try {
      const updatePayload = {
        ...updateData,
        lastModifiedBy: userId,
        updatedAt: new Date()
      };

      const updatedHazard = await this.updateById(id, updatePayload);

      if (!updatedHazard) {
        throw new Error('Hazard not found');
      }

      return this.createSuccessResponse(updatedHazard, 'Hazard updated successfully');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete hazard (soft delete)
   * @param {string} id - Hazard ID
   * @param {string} userId - User ID deleting the hazard
   * @returns {Promise<Object>} Deletion result
   */
  async deleteHazard(id, userId) {
    try {
      const deletedHazard = await this.deleteById(id, { soft: true });

      if (!deletedHazard) {
        throw new Error('Hazard not found');
      }

      return this.createSuccessResponse(
        { id: deletedHazard._id, status: 'deleted' },
        'Hazard deleted successfully'
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get hazards within geographic bounds
   * @param {Object} bounds - Geographic bounds
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Hazards within bounds
   */
  async getHazardsInBounds(bounds, options = {}) {
    try {
      const result = await this.findWithinBounds(bounds, {
        latitudeField: 'footprint.centerLatitude',
        longitudeField: 'footprint.centerLongitude',
        ...options
      });

      return this.createSuccessResponse(result, 'Hazards within bounds retrieved successfully');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get hazards near a specific location
   * @param {Object} location - Location coordinates
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Nearby hazards
   */
  async getHazardsNearLocation(location, options = {}) {
    try {
      const { maxDistance = 50000 } = options; // 50km default

      const result = await this.findNear(location, {
        latitudeField: 'footprint.centerLatitude',
        longitudeField: 'footprint.centerLongitude',
        maxDistance,
        ...options
      });

      return this.createSuccessResponse(result, 'Nearby hazards retrieved successfully');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Calculate risk metrics for a hazard
   * @param {Object} hazard - Hazard object
   * @returns {Promise<Object>} Risk metrics
   */
  async calculateRiskMetrics(hazard) {
    try {
      // Get affected vulnerabilities
      const vulnerabilities = await Vulnerability.find({
        linkedHazards: { $elemMatch: { hazardId: hazard.hazardId } }
      });

      // Get affected accounts
      const accounts = await Account.find({
        regions: { $in: hazard.affectedRegions }
      });

      // Calculate exposure metrics
      const totalExposure = accounts.reduce((sum, account) => sum + (account.totalExposure || 0), 0);
      const averageVulnerabilityScore = vulnerabilities.length > 0 
        ? vulnerabilities.reduce((sum, vuln) => sum + vuln.overallVulnerabilityScore, 0) / vulnerabilities.length
        : 0;

      // Calculate risk score
      const riskScore = (hazard.probability || 0) * (hazard.severity || 0) * (averageVulnerabilityScore / 10);

      return {
        totalExposure,
        affectedAccounts: accounts.length,
        affectedVulnerabilities: vulnerabilities.length,
        averageVulnerabilityScore,
        riskScore,
        riskLevel: this.getRiskLevel(riskScore)
      };
    } catch (error) {
      console.error('Error calculating risk metrics:', error);
      return {
        totalExposure: 0,
        affectedAccounts: 0,
        affectedVulnerabilities: 0,
        averageVulnerabilityScore: 0,
        riskScore: 0,
        riskLevel: 'Low'
      };
    }
  }

  /**
   * Get risk level based on risk score
   * @param {number} riskScore - Risk score
   * @returns {string} Risk level
   */
  getRiskLevel(riskScore) {
    if (riskScore >= 7) return 'Very High';
    if (riskScore >= 5) return 'High';
    if (riskScore >= 3) return 'Medium';
    if (riskScore >= 1) return 'Low';
    return 'Very Low';
  }

  /**
   * Get hazard statistics
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Hazard statistics
   */
  async getHazardStatistics(filters = {}) {
    try {
      const stats = await this.getStatistics(filters, ['hazardType', 'hazardCategory', 'severity']);
      
      // Get additional metrics
      const totalHazards = await this.count(filters);
      const activeHazards = await this.count({ ...filters, status: 'Active' });
      const historicalHazards = await this.count({ ...filters, isHistorical: true });
      const simulatedHazards = await this.count({ ...filters, isSimulated: true });

      return this.createSuccessResponse({
        totalHazards,
        activeHazards,
        historicalHazards,
        simulatedHazards,
        breakdown: stats
      }, 'Hazard statistics retrieved successfully');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Search hazards by text
   * @param {string} searchTerm - Search term
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Search results
   */
  async searchHazards(searchTerm, options = {}) {
    try {
      const searchFields = ['hazardName', 'hazardDescription', 'hazardId'];
      const result = await this.search(searchTerm, searchFields, options);

      return this.createSuccessResponse(result, 'Hazard search completed successfully');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Link hazard to vulnerability
   * @param {string} hazardId - Hazard ID
   * @param {string} vulnerabilityId - Vulnerability ID
   * @param {string} relationshipType - Relationship type
   * @returns {Promise<Object>} Link result
   */
  async linkVulnerability(hazardId, vulnerabilityId, relationshipType = 'Primary') {
    try {
      const hazard = await this.findById(hazardId);
      if (!hazard) {
        throw new Error('Hazard not found');
      }

      const vulnerability = await Vulnerability.findById(vulnerabilityId);
      if (!vulnerability) {
        throw new Error('Vulnerability not found');
      }

      // Add to hazard's linked vulnerabilities
      const existingLink = hazard.linkedVulnerabilities.find(
        link => link.vulnerabilityId === vulnerabilityId
      );

      if (!existingLink) {
        hazard.linkedVulnerabilities.push({
          vulnerabilityId,
          relationshipType,
          linkedAt: new Date()
        });
        await hazard.save();
      }

      // Add to vulnerability's linked hazards
      const existingHazardLink = vulnerability.linkedHazards.find(
        link => link.hazardId === hazardId
      );

      if (!existingHazardLink) {
        vulnerability.linkedHazards.push({
          hazardId,
          relationshipType,
          linkedAt: new Date()
        });
        await vulnerability.save();
      }

      return this.createSuccessResponse(
        { hazardId, vulnerabilityId, relationshipType },
        'Hazard and vulnerability linked successfully'
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Unlink hazard from vulnerability
   * @param {string} hazardId - Hazard ID
   * @param {string} vulnerabilityId - Vulnerability ID
   * @returns {Promise<Object>} Unlink result
   */
  async unlinkVulnerability(hazardId, vulnerabilityId) {
    try {
      const hazard = await this.findById(hazardId);
      if (!hazard) {
        throw new Error('Hazard not found');
      }

      const vulnerability = await Vulnerability.findById(vulnerabilityId);
      if (!vulnerability) {
        throw new Error('Vulnerability not found');
      }

      // Remove from hazard's linked vulnerabilities
      hazard.linkedVulnerabilities = hazard.linkedVulnerabilities.filter(
        link => link.vulnerabilityId !== vulnerabilityId
      );
      await hazard.save();

      // Remove from vulnerability's linked hazards
      vulnerability.linkedHazards = vulnerability.linkedHazards.filter(
        link => link.hazardId !== hazardId
      );
      await vulnerability.save();

      return this.createSuccessResponse(
        { hazardId, vulnerabilityId },
        'Hazard and vulnerability unlinked successfully'
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

module.exports = HazardService;
