/**
 * Exposure Service for CAT Modeling Platform
 */

const { repositories } = require('../repositories');
const Exposure = require('../models/Exposure');
const Location = require('../models/Location');
const Policy = require('../models/Policy');
const Account = require('../models/Account');

class ExposureService {
  constructor() {
    // ExposureService uses location repository since exposures are tied to locations
    this.locationRepository = repositories.location;
    this.hazardRepository = repositories.hazard;
    this.vulnerabilityRepository = repositories.vulnerability;
  }

  /**
   * Get exposures with advanced filtering
   */
  async getExposures(filters = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 100,
        accountId,
        policyId,
        locationId,
        exposureType,
        perilType,
        minValue,
        maxValue,
        occupancyType,
        constructionType,
        status = 'Active'
      } = { ...filters, ...options };

      const query = { status };
      
      if (accountId) query.accountId = accountId;
      if (policyId) query.policyId = policyId;
      if (locationId) query.locationId = locationId;
      if (exposureType) query.exposureType = exposureType;
      if (occupancyType) query.occupancyType = occupancyType;
      if (constructionType) query.constructionType = constructionType;
      
      // Peril filtering
      if (perilType) {
        query['perilExposures.peril'] = perilType;
      }
      
      // Value range filtering
      if (minValue !== undefined || maxValue !== undefined) {
        query.totalInsuredValue = {};
        if (minValue !== undefined) query.totalInsuredValue.$gte = minValue;
        if (maxValue !== undefined) query.totalInsuredValue.$lte = maxValue;
      }

      const skip = (page - 1) * limit;
      const exposures = await Exposure.find(query)
        .sort({ totalInsuredValue: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Exposure.countDocuments(query);

      return {
        data: exposures,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting exposures:', error);
      throw error;
    }
  }

  /**
   * Get exposure summary statistics
   */
  async getExposureSummary(filters = {}) {
    try {
      const query = { status: 'Active' };
      if (filters.accountId) query.accountId = filters.accountId;
      if (filters.policyId) query.policyId = filters.policyId;

      const summary = await Exposure.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalCount: { $sum: 1 },
            totalInsuredValue: { $sum: '$totalInsuredValue' },
            totalReplacementValue: { $sum: '$replacementValue' },
            avgInsuredValue: { $avg: '$totalInsuredValue' }
          }
        }
      ]);

      // Group by exposure type
      const byType = await Exposure.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$exposureType',
            count: { $sum: 1 },
            totalValue: { $sum: '$totalInsuredValue' }
          }
        },
        { $sort: { totalValue: -1 } }
      ]);

      // Group by occupancy
      const byOccupancy = await Exposure.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$occupancyType',
            count: { $sum: 1 },
            totalValue: { $sum: '$totalInsuredValue' }
          }
        },
        { $sort: { totalValue: -1 } }
      ]);

      // Group by construction
      const byConstruction = await Exposure.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$constructionType',
            count: { $sum: 1 },
            totalValue: { $sum: '$totalInsuredValue' }
          }
        },
        { $sort: { totalValue: -1 } }
      ]);

      // Peril exposure breakdown
      const byPeril = await Exposure.aggregate([
        { $match: query },
        { $unwind: '$perilExposures' },
        {
          $group: {
            _id: '$perilExposures.peril',
            count: { $sum: 1 },
            totalExposure: { $sum: '$perilExposures.exposureAmount' },
            avgExposure: { $avg: '$perilExposures.exposureAmount' },
            totalDeductible: { $sum: '$perilExposures.deductible' }
          }
        },
        { $sort: { totalExposure: -1 } }
      ]);

      return {
        overall: summary[0] || {
          totalCount: 0,
          totalInsuredValue: 0,
          totalReplacementValue: 0,
          avgInsuredValue: 0
        },
        byType: byType.reduce((acc, item) => {
          acc[item._id] = { count: item.count, totalValue: item.totalValue };
          return acc;
        }, {}),
        byOccupancy: byOccupancy.reduce((acc, item) => {
          acc[item._id] = { count: item.count, totalValue: item.totalValue };
          return acc;
        }, {}),
        byConstruction: byConstruction.reduce((acc, item) => {
          acc[item._id] = { count: item.count, totalValue: item.totalValue };
          return acc;
        }, {}),
        byPeril: byPeril.reduce((acc, item) => {
          acc[item._id] = {
            count: item.count,
            totalExposure: item.totalExposure,
            avgExposure: item.avgExposure,
            totalDeductible: item.totalDeductible
          };
          return acc;
        }, {})
      };
    } catch (error) {
      console.error('Error getting exposure summary:', error);
      throw error;
    }
  }

  /**
   * Get exposures within a geographic radius
   */
  async getExposuresInRadius(latitude, longitude, radiusKm, additionalFilters = {}) {
    try {
      const radiusInMeters = radiusKm * 1000;
      
      const exposures = await Exposure.find({
        status: 'Active',
        ...additionalFilters,
        'location.latitude': {
          $gte: latitude - (radiusKm / 111),
          $lte: latitude + (radiusKm / 111)
        },
        'location.longitude': {
          $gte: longitude - (radiusKm / (111 * Math.cos(latitude * Math.PI / 180))),
          $lte: longitude + (radiusKm / (111 * Math.cos(latitude * Math.PI / 180)))
        }
      }).lean();

      // Calculate actual distance and filter
      const exposuresWithDistance = exposures.map(exp => {
        const distance = this.calculateDistance(
          latitude, longitude,
          exp.location.latitude, exp.location.longitude
        );
        return { ...exp, distance };
      }).filter(exp => exp.distance <= radiusKm)
        .sort((a, b) => a.distance - b.distance);

      return exposuresWithDistance;
    } catch (error) {
      console.error('Error getting exposures in radius:', error);
      throw error;
    }
  }

  /**
   * Calculate distance between two points (Haversine formula)
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Calculate aggregate exposure for a specific peril
   */
  async getAggregateExposureByPeril(peril, filters = {}) {
    try {
      const query = {
        status: 'Active',
        'perilExposures.peril': peril,
        ...filters
      };

      const result = await Exposure.aggregate([
        { $match: query },
        { $unwind: '$perilExposures' },
        { $match: { 'perilExposures.peril': peril } },
        {
          $group: {
            _id: null,
            totalExposure: { $sum: '$perilExposures.exposureAmount' },
            count: { $sum: 1 },
            avgExposure: { $avg: '$perilExposures.exposureAmount' },
            maxExposure: { $max: '$perilExposures.exposureAmount' },
            totalDeductible: { $sum: '$perilExposures.deductible' }
          }
        }
      ]);

      return result[0] || {
        totalExposure: 0,
        count: 0,
        avgExposure: 0,
        maxExposure: 0,
        totalDeductible: 0
      };
    } catch (error) {
      console.error('Error getting aggregate exposure by peril:', error);
      throw error;
    }
  }

  /**
   * Create a new exposure with validation
   */
  async createExposure(exposureData) {
    try {
      // Validate references exist
      if (exposureData.accountId) {
        const account = await Account.findOne({ accountId: exposureData.accountId });
        if (!account) {
          throw new Error(`Account ${exposureData.accountId} not found`);
        }
      }

      if (exposureData.policyId) {
        const policy = await Policy.findOne({ policyId: exposureData.policyId });
        if (!policy) {
          throw new Error(`Policy ${exposureData.policyId} not found`);
        }
      }

      if (exposureData.locationId) {
        const location = await Location.findOne({ locationId: exposureData.locationId });
        if (!location) {
          throw new Error(`Location ${exposureData.locationId} not found`);
        }

        // Auto-populate geographic data from location if not provided
        if (!exposureData.location && location.coordinates) {
          exposureData.location = {
            latitude: location.coordinates.latitude,
            longitude: location.coordinates.longitude
          };
        }
      }

      // Create exposure
      const exposure = new Exposure(exposureData);
      await exposure.save();

      return exposure;
    } catch (error) {
      console.error('Error creating exposure:', error);
      throw error;
    }
  }

  /**
   * Update an existing exposure
   */
  async updateExposure(exposureId, updateData) {
    try {
      const exposure = await Exposure.findOne({ exposureId });
      
      if (!exposure) {
        throw new Error(`Exposure ${exposureId} not found`);
      }

      // Validate references if being updated
      if (updateData.accountId && updateData.accountId !== exposure.accountId) {
        const account = await Account.findOne({ accountId: updateData.accountId });
        if (!account) {
          throw new Error(`Account ${updateData.accountId} not found`);
        }
      }

      // Apply updates
      Object.assign(exposure, updateData);
      await exposure.save();

      return exposure;
    } catch (error) {
      console.error('Error updating exposure:', error);
      throw error;
    }
  }

  /**
   * Get active exposures for a date range
   */
  async getActiveExposures(startDate = new Date(), endDate = null) {
    try {
      const query = {
        status: 'Active',
        effectiveDate: { $lte: startDate }
      };
      
      if (endDate) {
        query.expiryDate = { $gte: endDate };
      } else {
        query.expiryDate = { $gte: startDate };
      }
      
      return await Exposure.find(query).lean();
    } catch (error) {
      console.error('Error getting active exposures:', error);
      throw error;
    }
  }

  /**
   * Get exposures by account hierarchy (including child accounts)
   */
  async getExposuresByAccountHierarchy(accountId) {
    try {
      // Get account and all child accounts
      const account = await Account.findOne({ accountId });
      if (!account) {
        throw new Error(`Account ${accountId} not found`);
      }

      const childAccounts = await Account.getChildAccounts(accountId);
      const accountIds = [accountId, ...childAccounts.map(a => a.accountId)];

      return await Exposure.find({
        accountId: { $in: accountIds },
        status: 'Active'
      }).lean();
    } catch (error) {
      console.error('Error getting exposures by account hierarchy:', error);
      throw error;
    }
  }

  /**
   * Calculate total exposure accumulation
   */
  async calculateExposureAccumulation(filters = {}) {
    try {
      const exposures = await this.getExposures(filters);
      
      const accumulation = {
        totalExposures: exposures.data.length,
        totalInsuredValue: 0,
        totalReplacementValue: 0,
        byPeril: {},
        byRegion: {},
        byOccupancy: {},
        byConstruction: {}
      };

      exposures.data.forEach(exp => {
        accumulation.totalInsuredValue += exp.totalInsuredValue;
        accumulation.totalReplacementValue += exp.replacementValue;

        // Accumulate by peril
        exp.perilExposures.forEach(perilExp => {
          if (!accumulation.byPeril[perilExp.peril]) {
            accumulation.byPeril[perilExp.peril] = {
              count: 0,
              totalExposure: 0,
              totalDeductible: 0
            };
          }
          accumulation.byPeril[perilExp.peril].count++;
          accumulation.byPeril[perilExp.peril].totalExposure += perilExp.exposureAmount;
          accumulation.byPeril[perilExp.peril].totalDeductible += perilExp.deductible;
        });

        // Accumulate by occupancy
        if (!accumulation.byOccupancy[exp.occupancyType]) {
          accumulation.byOccupancy[exp.occupancyType] = { count: 0, totalValue: 0 };
        }
        accumulation.byOccupancy[exp.occupancyType].count++;
        accumulation.byOccupancy[exp.occupancyType].totalValue += exp.totalInsuredValue;

        // Accumulate by construction
        if (!accumulation.byConstruction[exp.constructionType]) {
          accumulation.byConstruction[exp.constructionType] = { count: 0, totalValue: 0 };
        }
        accumulation.byConstruction[exp.constructionType].count++;
        accumulation.byConstruction[exp.constructionType].totalValue += exp.totalInsuredValue;
      });

      return accumulation;
    } catch (error) {
      console.error('Error calculating exposure accumulation:', error);
      throw error;
    }
  }

  /**
   * Create a standardized success response
   * @param {*} data - Response data
   * @param {string} message - Success message
   * @param {Object} meta - Additional metadata
   * @returns {Object} Standardized response
   */
  createSuccessResponse(data, message, meta = {}) {
    return {
      success: true,
      message,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta
      }
    };
  }

  /**
   * Handle and format errors
   * @param {Error} error - Error object
   * @returns {Error} Formatted error
   */
  handleError(error) {
    console.error('ExposureService Error:', error);
    
    // Return a standardized error
    const formattedError = new Error(error.message || 'An error occurred in ExposureService');
    formattedError.statusCode = error.statusCode || 500;
    formattedError.service = 'ExposureService';
    
    return formattedError;
  }
}

module.exports = ExposureService;

module.exports = ExposureService;
