/**
 * Exposure Service for CAT Modeling Platform
 * Handles business logic for exposure management, queries, and calculations
 */

const BaseService = require('./BaseService');
const Exposure = require('../models/Exposure');
const Account = require('../models/Account');
const Policy = require('../models/Policy');
const Location = require('../models/Location');

class ExposureService extends BaseService {
  constructor() {
    super(Exposure);
  }

  /**
   * Get exposures with filtering and pagination
   * @param {Object} filters - Filter parameters
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Filtered exposures with pagination
   */
  async getExposures(filters = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        accountId,
        policyId,
        exposureType,
        status,
        currency,
        region,
        country,
        search,
        minValue,
        maxValue,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = { ...filters, ...options };

      // Build filter object
      const filter = {};
      
      if (accountId) filter.accountId = accountId;
      if (policyId) filter.policyId = policyId;
      if (exposureType) filter.exposureType = exposureType;
      if (status) filter.status = status;
      if (currency) filter.currency = currency;
      if (region) filter['location.address.region'] = region;
      if (country) filter['location.address.country'] = country;

      // Value range filter
      if (minValue !== undefined || maxValue !== undefined) {
        filter.totalInsuredValue = {};
        if (minValue !== undefined) filter.totalInsuredValue.$gte = parseFloat(minValue);
        if (maxValue !== undefined) filter.totalInsuredValue.$lte = parseFloat(maxValue);
      }

      // Search functionality
      if (search) {
        filter.$or = [
          { exposureName: { $regex: search, $options: 'i' } },
          { exposureId: { $regex: search, $options: 'i' } },
          { accountId: { $regex: search, $options: 'i' } },
          { policyId: { $regex: search, $options: 'i' } }
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

      return this.createSuccessResponse(result, 'Exposures retrieved successfully');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get exposure by ID
   * @param {string} id - Exposure ID (MongoDB _id or exposureId)
   * @returns {Promise<Object>} Exposure details
   */
  async getExposureById(id) {
    try {
      let exposure;
      
      // Try to find by MongoDB _id first
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        exposure = await this.findById(id);
      } else {
        // Otherwise search by exposureId
        exposure = await this.model.findOne({ exposureId: id });
      }

      if (!exposure) {
        throw new Error('Exposure not found');
      }

      // Get related data
      const account = await Account.findOne({ accountId: exposure.accountId });
      const policy = exposure.policyId ? await Policy.findOne({ policyId: exposure.policyId }) : null;
      const location = exposure.locationId ? await Location.findOne({ locationId: exposure.locationId }) : null;

      return this.createSuccessResponse({
        exposure: exposure.toObject(),
        account: account ? account.toObject() : null,
        policy: policy ? policy.toObject() : null,
        location: location ? location.toObject() : null
      }, 'Exposure details retrieved successfully');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create new exposure
   * @param {Object} exposureData - Exposure data
   * @param {string} userId - User creating the exposure
   * @returns {Promise<Object>} Created exposure
   */
  async createExposure(exposureData, userId) {
    try {
      // Validate account exists
      const account = await Account.findOne({ accountId: exposureData.accountId });
      if (!account) {
        throw new Error('Account not found');
      }

      // Set audit fields
      exposureData.createdBy = userId;
      exposureData.lastModifiedBy = userId;

      // Generate exposure ID if not provided
      if (!exposureData.exposureId) {
        exposureData.exposureId = Exposure.generateExposureId();
      }

      const exposure = await this.create(exposureData);

      return this.createSuccessResponse(exposure, 'Exposure created successfully');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update existing exposure
   * @param {string} id - Exposure ID
   * @param {Object} updateData - Update data
   * @param {string} userId - User updating the exposure
   * @returns {Promise<Object>} Updated exposure
   */
  async updateExposure(id, updateData, userId) {
    try {
      updateData.lastModifiedBy = userId;
      
      const exposure = await this.update(id, updateData);

      if (!exposure) {
        throw new Error('Exposure not found');
      }

      return this.createSuccessResponse(exposure, 'Exposure updated successfully');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete exposure
   * @param {string} id - Exposure ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteExposure(id) {
    try {
      const result = await this.delete(id);

      return this.createSuccessResponse(result, 'Exposure deleted successfully');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get exposures near a location
   * @param {Object} params - Location parameters
   * @returns {Promise<Object>} Nearby exposures
   */
  async getExposuresNearLocation(params) {
    try {
      const {
        latitude,
        longitude,
        radiusKm = 50,
        status = 'Active',
        exposureTypes = [],
        perils = []
      } = params;

      // Build filters
      const filters = { status };
      
      if (exposureTypes.length > 0) {
        filters.exposureType = { $in: exposureTypes };
      }
      
      if (perils.length > 0) {
        filters['perilExposures.peril'] = { $in: perils };
      }

      const exposures = await Exposure.getExposuresInRadius(
        latitude,
        longitude,
        radiusKm,
        filters
      );

      // Calculate summary statistics
      const summary = {
        totalExposures: exposures.length,
        totalValue: exposures.reduce((sum, exp) => sum + exp.totalInsuredValue, 0),
        byType: {},
        byPeril: {},
        averageValue: 0
      };

      exposures.forEach(exp => {
        // By type
        summary.byType[exp.exposureType] = (summary.byType[exp.exposureType] || 0) + exp.totalInsuredValue;
        
        // By peril
        exp.perilExposures.forEach(peril => {
          summary.byPeril[peril.peril] = (summary.byPeril[peril.peril] || 0) + peril.exposureValue;
        });
      });

      summary.averageValue = exposures.length > 0 ? summary.totalValue / exposures.length : 0;

      return this.createSuccessResponse({
        exposures,
        summary,
        searchParameters: { latitude, longitude, radiusKm }
      }, 'Exposures near location retrieved successfully');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get account exposure summary
   * @param {string} accountId - Account ID
   * @param {Object} options - Calculation options
   * @returns {Promise<Object>} Exposure summary
   */
  async getAccountExposureSummary(accountId, options = {}) {
    try {
      const {
        currency = 'USD',
        includeInactive = false,
        groupBy = null
      } = options;

      const summary = await Exposure.calculateAccountExposure(accountId, {
        currency,
        includeInactive
      });

      // Get additional details if requested
      if (groupBy) {
        const exposures = await this.model.find({
          accountId,
          ...(includeInactive ? {} : { status: 'Active' }),
          ...(currency ? { currency } : {})
        });

        summary.groupedData = this.groupExposures(exposures, groupBy);
      }

      return this.createSuccessResponse(summary, 'Account exposure summary retrieved successfully');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get active exposures
   * @param {Object} filters - Additional filters
   * @returns {Promise<Object>} Active exposures
   */
  async getActiveExposures(filters = {}) {
    try {
      const exposures = await Exposure.getActiveExposures(filters);

      return this.createSuccessResponse(exposures, 'Active exposures retrieved successfully');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get exposures for specific perils
   * @param {Array<string>} perils - Peril types
   * @param {Object} filters - Additional filters
   * @returns {Promise<Object>} Exposures for perils
   */
  async getExposuresForPerils(perils, filters = {}) {
    try {
      if (!Array.isArray(perils) || perils.length === 0) {
        throw new Error('Perils array is required and must not be empty');
      }

      const exposures = await Exposure.getExposuresForPerils(perils, filters);

      // Calculate peril-specific summary
      const summary = {
        totalExposures: exposures.length,
        perilSummary: {}
      };

      perils.forEach(peril => {
        summary.perilSummary[peril] = {
          count: 0,
          totalValue: 0,
          averageValue: 0
        };
      });

      exposures.forEach(exp => {
        exp.perilExposures.forEach(peril => {
          if (perils.includes(peril.peril)) {
            summary.perilSummary[peril.peril].count += 1;
            summary.perilSummary[peril.peril].totalValue += peril.exposureValue;
          }
        });
      });

      // Calculate averages
      Object.keys(summary.perilSummary).forEach(peril => {
        const count = summary.perilSummary[peril].count;
        if (count > 0) {
          summary.perilSummary[peril].averageValue = 
            summary.perilSummary[peril].totalValue / count;
        }
      });

      return this.createSuccessResponse({
        exposures,
        summary
      }, 'Exposures for perils retrieved successfully');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Validate exposure data consistency
   * @param {string} exposureId - Exposure ID
   * @returns {Promise<Object>} Validation result
   */
  async validateExposure(exposureId) {
    try {
      const exposure = await this.model.findOne({ exposureId });

      if (!exposure) {
        throw new Error('Exposure not found');
      }

      const validation = exposure.validateExposureConsistency();

      return this.createSuccessResponse(validation, 'Exposure validation completed');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Bulk import exposures
   * @param {Array<Object>} exposuresData - Array of exposure data
   * @param {string} userId - User importing the exposures
   * @returns {Promise<Object>} Import results
   */
  async bulkImportExposures(exposuresData, userId) {
    try {
      if (!Array.isArray(exposuresData) || exposuresData.length === 0) {
        throw new Error('Exposures data must be a non-empty array');
      }

      const results = {
        successful: [],
        failed: [],
        totalProcessed: exposuresData.length
      };

      for (const exposureData of exposuresData) {
        try {
          // Set audit fields
          exposureData.createdBy = userId;
          exposureData.lastModifiedBy = userId;

          // Generate exposure ID if not provided
          if (!exposureData.exposureId) {
            exposureData.exposureId = Exposure.generateExposureId();
          }

          const exposure = await this.model.create(exposureData);
          results.successful.push({
            exposureId: exposure.exposureId,
            _id: exposure._id
          });
        } catch (error) {
          results.failed.push({
            data: exposureData,
            error: error.message
          });
        }
      }

      return this.createSuccessResponse(results, 
        `Bulk import completed: ${results.successful.length} successful, ${results.failed.length} failed`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Calculate portfolio exposure metrics
   * @param {Object} filters - Portfolio filters
   * @returns {Promise<Object>} Portfolio metrics
   */
  async calculatePortfolioMetrics(filters = {}) {
    try {
      const exposures = await this.model.find(filters);

      if (exposures.length === 0) {
        return this.createSuccessResponse({
          totalExposures: 0,
          totalValue: 0,
          averageValue: 0,
          medianValue: 0,
          distribution: {}
        }, 'No exposures found for portfolio');
      }

      // Calculate metrics
      const values = exposures.map(exp => exp.totalInsuredValue);
      values.sort((a, b) => a - b);

      const totalValue = values.reduce((sum, val) => sum + val, 0);
      const averageValue = totalValue / values.length;
      const medianValue = values.length % 2 === 0
        ? (values[values.length / 2 - 1] + values[values.length / 2]) / 2
        : values[Math.floor(values.length / 2)];

      // Calculate distribution by percentiles
      const percentiles = [10, 25, 50, 75, 90, 95, 99];
      const distribution = {};
      percentiles.forEach(p => {
        const index = Math.floor((p / 100) * values.length);
        distribution[`p${p}`] = values[Math.min(index, values.length - 1)];
      });

      // Group by various dimensions
      const byType = {};
      const byRegion = {};
      const byCurrency = {};

      exposures.forEach(exp => {
        byType[exp.exposureType] = (byType[exp.exposureType] || 0) + exp.totalInsuredValue;
        byRegion[exp.location.address.region] = (byRegion[exp.location.address.region] || 0) + exp.totalInsuredValue;
        byCurrency[exp.currency] = (byCurrency[exp.currency] || 0) + exp.totalInsuredValue;
      });

      return this.createSuccessResponse({
        totalExposures: exposures.length,
        totalValue,
        averageValue,
        medianValue,
        distribution,
        byType,
        byRegion,
        byCurrency,
        minValue: values[0],
        maxValue: values[values.length - 1]
      }, 'Portfolio metrics calculated successfully');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Helper method to group exposures
   * @param {Array} exposures - Array of exposures
   * @param {string} groupBy - Field to group by
   * @returns {Object} Grouped exposures
   */
  groupExposures(exposures, groupBy) {
    const grouped = {};

    exposures.forEach(exp => {
      let key;
      switch (groupBy) {
        case 'type':
          key = exp.exposureType;
          break;
        case 'region':
          key = exp.location.address.region;
          break;
        case 'country':
          key = exp.location.address.country;
          break;
        case 'currency':
          key = exp.currency;
          break;
        default:
          key = 'other';
      }

      if (!grouped[key]) {
        grouped[key] = {
          count: 0,
          totalValue: 0,
          exposures: []
        };
      }

      grouped[key].count += 1;
      grouped[key].totalValue += exp.totalInsuredValue;
      grouped[key].exposures.push(exp.exposureId);
    });

    return grouped;
  }
}

module.exports = ExposureService;
