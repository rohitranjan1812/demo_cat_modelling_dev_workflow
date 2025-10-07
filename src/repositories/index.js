/**
 * Repository Index
 * 
 * Centralized access to all repository instances
 * Implements singleton pattern for repository instances
 */

const LocationRepository = require('./LocationRepository');
const HazardRepository = require('./HazardRepository');
const VulnerabilityRepository = require('./VulnerabilityRepository');

/**
 * Repository Manager
 * 
 * Provides singleton instances of all repositories
 * Ensures consistent database access patterns
 */
class RepositoryManager {
  constructor() {
    this._locationRepository = null;
    this._hazardRepository = null;
    this._vulnerabilityRepository = null;
  }

  /**
   * Get Location Repository instance
   * @returns {LocationRepository} Location repository
   */
  get location() {
    if (!this._locationRepository) {
      this._locationRepository = new LocationRepository();
    }
    return this._locationRepository;
  }

  /**
   * Get Hazard Repository instance
   * @returns {HazardRepository} Hazard repository
   */
  get hazard() {
    if (!this._hazardRepository) {
      this._hazardRepository = new HazardRepository();
    }
    return this._hazardRepository;
  }

  /**
   * Get Vulnerability Repository instance
   * @returns {VulnerabilityRepository} Vulnerability repository
   */
  get vulnerability() {
    if (!this._vulnerabilityRepository) {
      this._vulnerabilityRepository = new VulnerabilityRepository();
    }
    return this._vulnerabilityRepository;
  }

  /**
   * Execute operations within a transaction across multiple repositories
   * @param {Function} operations - Function containing repository operations
   * @returns {Promise<any>} Transaction result
   */
  async withTransaction(operations) {
    // Use the location repository as the base for transaction management
    return await this.location.withTransaction(operations);
  }

  /**
   * Health check for all repositories
   * @returns {Promise<Object>} Health status
   */
  async healthCheck() {
    const results = {};

    try {
      // Test each repository
      const [locationCount, hazardCount, vulnerabilityCount] = await Promise.all([
        this.location.count(),
        this.hazard.count(),
        this.vulnerability.count()
      ]);

      results.location = { status: 'healthy', count: locationCount };
      results.hazard = { status: 'healthy', count: hazardCount };
      results.vulnerability = { status: 'healthy', count: vulnerabilityCount };
      results.overall = 'healthy';

    } catch (error) {
      results.overall = 'unhealthy';
      results.error = error.message;
    }

    return results;
  }

  /**
   * Get health status (alias for healthCheck)
   * @returns {Promise<Object>} Health status
   */
  async getHealthStatus() {
    return await this.healthCheck();
  }

  /**
   * Get comprehensive statistics across all repositories
   * @returns {Promise<Object>} Comprehensive statistics
   */
  async getComprehensiveStats() {
    try {
      const [locationStats, hazardStats, vulnerabilityStats] = await Promise.all([
        this.location.getStatisticsByRegion(),
        this.hazard.getStatisticsByType(),
        this.vulnerability.getStatisticsByType()
      ]);

      return {
        locations: locationStats,
        hazards: hazardStats,
        vulnerabilities: vulnerabilityStats,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Failed to get comprehensive stats: ${error.message}`);
    }
  }

  /**
   * Find cross-entity relationships
   * @param {Object} criteria - Search criteria
   * @returns {Promise<Object>} Related entities
   */
  async findRelatedEntities(criteria) {
    try {
      const { entityType, entityId, radius = 50000 } = criteria;
      let baseEntity = null;
      let results = {};

      // Get the base entity
      switch (entityType) {
        case 'location':
          baseEntity = await this.location.findOne({ locationId: entityId });
          if (baseEntity) {
            const [lng, lat] = baseEntity.location.coordinates;
            results.nearbyHazards = await this.hazard.findNearCoordinates(lat, lng, radius);
            results.nearbyVulnerabilities = await this.vulnerability.findNearCoordinates(lat, lng, radius);
          }
          break;

        case 'hazard':
          baseEntity = await this.hazard.findOne({ hazardId: entityId });
          if (baseEntity) {
            const [lng, lat] = baseEntity.footprint.center.coordinates;
            results.nearbyLocations = await this.location.findNearCoordinates(lat, lng, radius);
            results.relatedVulnerabilities = await this.vulnerability.findByLinkedHazard(entityId);
          }
          break;

        case 'vulnerability':
          baseEntity = await this.vulnerability.findOne({ vulnerabilityId: entityId });
          if (baseEntity) {
            const [lng, lat] = baseEntity.geographicScope.center.coordinates;
            results.nearbyLocations = await this.location.findNearCoordinates(lat, lng, radius);
            results.relatedHazards = await this.hazard.find({
              hazardId: { $in: baseEntity.linkedHazards?.map(h => h.hazardId) || [] }
            });
          }
          break;

        default:
          throw new Error(`Unknown entity type: ${entityType}`);
      }

      return {
        baseEntity,
        relationships: results,
        searchRadius: radius
      };
    } catch (error) {
      throw new Error(`Failed to find related entities: ${error.message}`);
    }
  }

  /**
   * Bulk operations across multiple repositories
   * @param {Object} operations - Bulk operations
   * @returns {Promise<Object>} Bulk operation results
   */
  async bulkOperations(operations) {
    const results = {};

    try {
      // Execute operations in parallel where possible
      const promises = [];

      if (operations.locations?.create) {
        promises.push(
          this.location.createMany(operations.locations.create)
            .then(result => { results.locationsCreated = result.length; })
        );
      }

      if (operations.hazards?.create) {
        promises.push(
          this.hazard.createMany(operations.hazards.create)
            .then(result => { results.hazardsCreated = result.length; })
        );
      }

      if (operations.vulnerabilities?.create) {
        promises.push(
          this.vulnerability.createMany(operations.vulnerabilities.create)
            .then(result => { results.vulnerabilitiesCreated = result.length; })
        );
      }

      await Promise.all(promises);

      results.success = true;
      results.timestamp = new Date().toISOString();

    } catch (error) {
      results.success = false;
      results.error = error.message;
    }

    return results;
  }
}

// Create singleton instance
const repositoryManager = new RepositoryManager();

// Export both the manager and individual repositories for flexibility
module.exports = {
  // Singleton manager instance
  repositories: repositoryManager,
  
  // Individual repository classes (for testing or special cases)
  LocationRepository,
  HazardRepository,
  VulnerabilityRepository,
  
  // Base repository for extension
  BaseRepository: require('./BaseRepository')
};