const BaseRepository = require('./BaseRepository');
const Hazard = require('../models/Hazard');

/**
 * Hazard Repository
 * 
 * Handles all database operations for Hazard entities
 * Provides specialized query methods for hazard analysis
 */
class HazardRepository extends BaseRepository {
  constructor() {
    super(Hazard);
  }

  /**
   * Find hazards by hazard ID pattern
   * @param {string} pattern - Pattern to match (e.g., 'HAZ-*')
   * @returns {Promise<Array>} Matching hazards
   */
  async findByHazardIdPattern(pattern) {
    try {
      const regex = new RegExp(pattern.replace('*', '.*'), 'i');
      return await this.find({ hazardId: regex });
    } catch (error) {
      throw this.handleError(error, 'findByHazardIdPattern');
    }
  }

  /**
   * Find hazards by type
   * @param {string} hazardType - Hazard type
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Hazards of specified type
   */
  async findByType(hazardType, options = {}) {
    try {
      return await this.find({ hazardType }, options);
    } catch (error) {
      throw this.handleError(error, 'findByType');
    }
  }

  /**
   * Find hazards by severity level
   * @param {string} severityLevel - Severity level
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Hazards with specified severity
   */
  async findBySeverityLevel(severityLevel, options = {}) {
    try {
      return await this.find({ severityLevel }, options);
    } catch (error) {
      throw this.handleError(error, 'findBySeverityLevel');
    }
  }

  /**
   * Find hazards by region
   * @param {string} region - Region name
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Hazards in region
   */
  async findByRegion(region, options = {}) {
    try {
      return await this.find({ affectedRegions: region }, options);
    } catch (error) {
      throw this.handleError(error, 'findByRegion');
    }
  }

  /**
   * Find hazards by status
   * @param {string} status - Status
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Hazards with specified status
   */
  async findByStatus(status, options = {}) {
    try {
      return await this.find({ status }, options);
    } catch (error) {
      throw this.handleError(error, 'findByStatus');
    }
  }

  /**
   * Find active hazards
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Active hazards
   */
  async findActive(options = {}) {
    try {
      return await this.findByStatus('Active', options);
    } catch (error) {
      throw this.handleError(error, 'findActive');
    }
  }

  /**
   * Find hazards within time range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Hazards within time range
   */
  async findByTimeRange(startDate, endDate, options = {}) {
    try {
      const filter = {
        'temporal.startTime': {
          $gte: startDate,
          $lte: endDate
        }
      };
      return await this.find(filter, options);
    } catch (error) {
      throw this.handleError(error, 'findByTimeRange');
    }
  }

  /**
   * Find hazards near coordinates using footprint center
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @param {number} maxDistance - Maximum distance in meters
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Nearby hazards
   */
  async findNearCoordinates(latitude, longitude, maxDistance = 50000, options = {}) {
    try {
      const point = {
        type: 'Point',
        coordinates: [longitude, latitude]
      };

      return await this.findNear(point, {
        locationField: 'footprint.center',
        maxDistance,
        ...options
      });
    } catch (error) {
      throw this.handleError(error, 'findNearCoordinates');
    }
  }

  /**
   * Find hazards by intensity range
   * @param {number} minIntensity - Minimum intensity
   * @param {number} maxIntensity - Maximum intensity
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Hazards within intensity range
   */
  async findByIntensityRange(minIntensity, maxIntensity, options = {}) {
    try {
      const filter = {
        'intensity.value': {
          $gte: minIntensity,
          $lte: maxIntensity
        }
      };
      return await this.find(filter, options);
    } catch (error) {
      throw this.handleError(error, 'findByIntensityRange');
    }
  }

  /**
   * Find hazards by probability range
   * @param {number} minProbability - Minimum probability
   * @param {number} maxProbability - Maximum probability
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Hazards within probability range
   */
  async findByProbabilityRange(minProbability, maxProbability, options = {}) {
    try {
      const filter = {
        probability: {
          $gte: minProbability,
          $lte: maxProbability
        }
      };
      return await this.find(filter, options);
    } catch (error) {
      throw this.handleError(error, 'findByProbabilityRange');
    }
  }

  /**
   * Get hazard statistics by type
   * @returns {Promise<Array>} Statistics per hazard type
   */
  async getStatisticsByType() {
    try {
      const pipeline = [
        {
          $group: {
            _id: '$hazardType',
            count: { $sum: 1 },
            avgIntensity: { $avg: '$intensity.value' },
            avgProbability: { $avg: '$probability' },
            avgSeverity: { $avg: '$severity' },
            minIntensity: { $min: '$intensity.value' },
            maxIntensity: { $max: '$intensity.value' },
            statusCounts: {
              $push: '$status'
            }
          }
        },
        {
          $addFields: {
            statusDistribution: {
              $reduce: {
                input: '$statusCounts',
                initialValue: {},
                in: {
                  $mergeObjects: [
                    '$$value',
                    {
                      $arrayToObject: [
                        [{ k: '$$this', v: { $add: [{ $ifNull: [{ $getField: { field: '$$this', input: '$$value' } }, 0] }, 1] } }]
                      ]
                    }
                  ]
                }
              }
            }
          }
        },
        {
          $project: {
            hazardType: '$_id',
            count: 1,
            avgIntensity: { $round: ['$avgIntensity', 2] },
            avgProbability: { $round: ['$avgProbability', 4] },
            avgSeverity: { $round: ['$avgSeverity', 2] },
            intensityRange: {
              min: '$minIntensity',
              max: '$maxIntensity'
            },
            statusDistribution: 1
          }
        },
        { $sort: { count: -1 } }
      ];

      return await this.aggregate(pipeline);
    } catch (error) {
      throw this.handleError(error, 'getStatisticsByType');
    }
  }

  /**
   * Get hazard trend analysis
   * @param {number} monthsBack - Number of months to analyze
   * @returns {Promise<Array>} Trend data
   */
  async getTrendAnalysis(monthsBack = 12) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - monthsBack);

      const pipeline = [
        {
          $match: {
            'temporal.startTime': { $gte: cutoffDate }
          }
        },
        {
          $addFields: {
            month: { $dateToString: { format: '%Y-%m', date: '$temporal.startTime' } }
          }
        },
        {
          $group: {
            _id: {
              month: '$month',
              hazardType: '$hazardType'
            },
            count: { $sum: 1 },
            avgIntensity: { $avg: '$intensity.value' },
            avgSeverity: { $avg: '$severity' }
          }
        },
        {
          $group: {
            _id: '$_id.month',
            hazardTypes: {
              $push: {
                type: '$_id.hazardType',
                count: '$count',
                avgIntensity: '$avgIntensity',
                avgSeverity: '$avgSeverity'
              }
            },
            totalCount: { $sum: '$count' }
          }
        },
        { $sort: { '_id': 1 } }
      ];

      return await this.aggregate(pipeline);
    } catch (error) {
      throw this.handleError(error, 'getTrendAnalysis');
    }
  }

  /**
   * Find overlapping hazards in geographic area
   * @param {Object} bounds - Geographic bounds {minLat, maxLat, minLng, maxLng}
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Overlapping hazards
   */
  async findOverlappingHazards(bounds, options = {}) {
    try {
      return await this.findWithinBounds(bounds, {
        locationField: 'footprint.center',
        ...options
      });
    } catch (error) {
      throw this.handleError(error, 'findOverlappingHazards');
    }
  }

  /**
   * Update hazard status
   * @param {string} hazardId - Hazard ID
   * @param {string} newStatus - New status
   * @param {string} userId - User making the change
   * @returns {Promise<Object>} Updated hazard
   */
  async updateStatus(hazardId, newStatus, userId) {
    try {
      const update = {
        $set: {
          status: newStatus,
          lastModifiedBy: userId,
          updatedAt: new Date()
        },
        $push: {
          statusHistory: {
            status: newStatus,
            changedBy: userId,
            changedAt: new Date()
          }
        }
      };

      return await this.updateOne({ hazardId }, update);
    } catch (error) {
      throw this.handleError(error, 'updateStatus');
    }
  }

  /**
   * Find hazards that need probability recalculation
   * @param {number} daysSinceUpdate - Days since last update
   * @returns {Promise<Array>} Hazards needing recalculation
   */
  async findHazardsNeedingRecalculation(daysSinceUpdate = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysSinceUpdate);

      const filter = {
        status: 'Active',
        $or: [
          { probabilityCalculatedAt: { $lt: cutoffDate } },
          { probabilityCalculatedAt: { $exists: false } }
        ]
      };

      return await this.find(filter, {
        select: 'hazardId hazardType probability probabilityCalculatedAt affectedRegions'
      });
    } catch (error) {
      throw this.handleError(error, 'findHazardsNeedingRecalculation');
    }
  }

  /**
   * Get high-risk hazards summary
   * @param {number} minSeverity - Minimum severity threshold
   * @param {number} minProbability - Minimum probability threshold
   * @returns {Promise<Array>} High-risk hazards
   */
  async getHighRiskHazardsSummary(minSeverity = 7, minProbability = 0.3) {
    try {
      const filter = {
        status: 'Active',
        severity: { $gte: minSeverity },
        probability: { $gte: minProbability }
      };

      return await this.find(filter, {
        select: 'hazardId hazardType severity probability affectedRegions footprint.center',
        sort: { severity: -1, probability: -1 }
      });
    } catch (error) {
      throw this.handleError(error, 'getHighRiskHazardsSummary');
    }
  }
}

module.exports = HazardRepository;