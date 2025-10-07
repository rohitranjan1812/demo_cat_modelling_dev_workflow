const BaseRepository = require('./BaseRepository');
const Location = require('../models/Location');

/**
 * Location Repository
 * 
 * Handles all database operations for Location entities
 * Provides specialized geospatial query methods
 */
class LocationRepository extends BaseRepository {
  constructor() {
    super(Location);
  }

  /**
   * Find locations by location ID pattern
   * @param {string} pattern - Pattern to match (e.g., 'LOC-*')
   * @returns {Promise<Array>} Matching locations
   */
  async findByLocationIdPattern(pattern) {
    try {
      const regex = new RegExp(pattern.replace('*', '.*'), 'i');
      return await this.find({ locationId: regex });
    } catch (error) {
      throw this.handleError(error, 'findByLocationIdPattern');
    }
  }

  /**
   * Find locations by region
   * @param {string} region - Region name
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Locations in region
   */
  async findByRegion(region, options = {}) {
    try {
      return await this.find({ 'address.region': region }, options);
    } catch (error) {
      throw this.handleError(error, 'findByRegion');
    }
  }

  /**
   * Find locations by country
   * @param {string} country - Country name
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Locations in country
   */
  async findByCountry(country, options = {}) {
    try {
      return await this.find({ 'address.country': country }, options);
    } catch (error) {
      throw this.handleError(error, 'findByCountry');
    }
  }

  /**
   * Find locations by city
   * @param {string} city - City name
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Locations in city
   */
  async findByCity(city, options = {}) {
    try {
      return await this.find({ 'address.city': { $regex: city, $options: 'i' } }, options);
    } catch (error) {
      throw this.handleError(error, 'findByCity');
    }
  }

  /**
   * Find locations within elevation range
   * @param {number} minElevation - Minimum elevation
   * @param {number} maxElevation - Maximum elevation
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Locations within elevation range
   */
  async findByElevationRange(minElevation, maxElevation, options = {}) {
    try {
      const filter = {
        elevation: {
          $gte: minElevation,
          $lte: maxElevation
        }
      };
      return await this.find(filter, options);
    } catch (error) {
      throw this.handleError(error, 'findByElevationRange');
    }
  }

  /**
   * Find locations by risk level
   * @param {string} riskLevel - Risk level
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Locations with specified risk level
   */
  async findByRiskLevel(riskLevel, options = {}) {
    try {
      return await this.find({ 'riskZones.riskLevel': riskLevel }, options);
    } catch (error) {
      throw this.handleError(error, 'findByRiskLevel');
    }
  }

  /**
   * Find locations with specific hazard exposure
   * @param {string} hazardId - Hazard ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Exposed locations
   */
  async findByHazardExposure(hazardId, options = {}) {
    try {
      return await this.find({ 'hazardExposure.hazardId': hazardId }, options);
    } catch (error) {
      throw this.handleError(error, 'findByHazardExposure');
    }
  }

  /**
   * Find locations near coordinates using GeoJSON
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @param {number} maxDistance - Maximum distance in meters
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Nearby locations
   */
  async findNearCoordinates(latitude, longitude, maxDistance = 10000, options = {}) {
    try {
      const point = {
        type: 'Point',
        coordinates: [longitude, latitude]
      };

      return await this.findNear(point, {
        locationField: 'location',
        maxDistance,
        ...options
      });
    } catch (error) {
      throw this.handleError(error, 'findNearCoordinates');
    }
  }

  /**
   * Get location statistics by region
   * @returns {Promise<Array>} Statistics per region
   */
  async getStatisticsByRegion() {
    try {
      const pipeline = [
        {
          $group: {
            _id: '$address.region',
            count: { $sum: 1 },
            avgElevation: { $avg: '$elevation' },
            riskLevels: { $push: '$riskZones.riskLevel' }
          }
        },
        {
          $project: {
            region: '$_id',
            count: 1,
            avgElevation: { $round: ['$avgElevation', 2] },
            riskLevels: {
              $reduce: {
                input: '$riskLevels',
                initialValue: [],
                in: { $concatArrays: ['$$value', '$$this'] }
              }
            }
          }
        },
        { $sort: { count: -1 } }
      ];

      return await this.aggregate(pipeline);
    } catch (error) {
      throw this.handleError(error, 'getStatisticsByRegion');
    }
  }

  /**
   * Get location density in geographic grid
   * @param {number} gridSize - Grid size in degrees
   * @returns {Promise<Array>} Location density grid
   */
  async getLocationDensityGrid(gridSize = 0.1) {
    try {
      const pipeline = [
        {
          $addFields: {
            gridLat: {
              $floor: {
                $divide: [{ $arrayElemAt: ['$location.coordinates', 1] }, gridSize]
              }
            },
            gridLng: {
              $floor: {
                $divide: [{ $arrayElemAt: ['$location.coordinates', 0] }, gridSize]
              }
            }
          }
        },
        {
          $group: {
            _id: {
              lat: '$gridLat',
              lng: '$gridLng'
            },
            count: { $sum: 1 },
            locations: { $push: '$locationId' }
          }
        },
        {
          $project: {
            gridCell: '$_id',
            count: 1,
            density: '$count',
            locations: 1
          }
        },
        { $sort: { count: -1 } }
      ];

      return await this.aggregate(pipeline);
    } catch (error) {
      throw this.handleError(error, 'getLocationDensityGrid');
    }
  }

  /**
   * Update location risk assessment
   * @param {string} locationId - Location ID
   * @param {Object} riskData - Risk assessment data
   * @returns {Promise<Object>} Updated location
   */
  async updateRiskAssessment(locationId, riskData) {
    try {
      const update = {
        $set: {
          'riskAssessment.lastUpdated': new Date(),
          'riskAssessment.overallRiskScore': riskData.overallRiskScore,
          'riskAssessment.riskLevel': riskData.riskLevel
        },
        $push: {
          'riskAssessment.assessmentHistory': {
            date: new Date(),
            score: riskData.overallRiskScore,
            level: riskData.riskLevel,
            assessor: riskData.assessor
          }
        }
      };

      return await this.updateOne({ locationId }, update);
    } catch (error) {
      throw this.handleError(error, 'updateRiskAssessment');
    }
  }

  /**
   * Find locations that need risk assessment update
   * @param {number} daysSinceUpdate - Days since last update
   * @returns {Promise<Array>} Locations needing update
   */
  async findLocationsNeedingRiskUpdate(daysSinceUpdate = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysSinceUpdate);

      const filter = {
        $or: [
          { 'riskAssessment.lastUpdated': { $lt: cutoffDate } },
          { 'riskAssessment.lastUpdated': { $exists: false } }
        ]
      };

      return await this.find(filter, { 
        select: 'locationId locationName address.region riskAssessment.lastUpdated' 
      });
    } catch (error) {
      throw this.handleError(error, 'findLocationsNeedingRiskUpdate');
    }
  }
}

module.exports = LocationRepository;