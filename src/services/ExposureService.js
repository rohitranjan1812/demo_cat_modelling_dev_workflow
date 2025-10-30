const BaseService = require('./BaseService');
const Exposure = require('../models/Exposure');
const Account = require('../models/Account');
const Policy = require('../models/Policy');
const Location = require('../models/Location');

/**
 * ExposureService - Business logic for exposure management
 * 
 * Implements Task 1.1 from ACTION_PLAN_2025-10-03.md
 * Provides unified access to exposure data and complex business operations
 */
class ExposureService extends BaseService {
  constructor() {
    super(Exposure);
  }

  /**
   * Create exposure from existing Account, Policy, and Location
   * @param {Object} data - Exposure data
   * @returns {Promise<Object>} Created exposure
   */
  async createExposure(data) {
    try {
      // Validate references exist
      const [account, policy, location] = await Promise.all([
        Account.findOne({ accountId: data.accountId }),
        Policy.findOne({ policyId: data.policyId }),
        Location.findOne({ locationId: data.locationId })
      ]);

      if (!account) {
        throw new Error(`Account ${data.accountId} not found`);
      }
      if (!policy) {
        throw new Error(`Policy ${data.policyId} not found`);
      }
      if (!location) {
        throw new Error(`Location ${data.locationId} not found`);
      }

      // Validate policy belongs to account
      if (policy.accountId !== data.accountId) {
        throw new Error(`Policy ${data.policyId} does not belong to account ${data.accountId}`);
      }

      // Enrich exposure data with location information
      const exposureData = {
        ...data,
        location: {
          latitude: location.coordinates.latitude,
          longitude: location.coordinates.longitude,
          elevation: location.coordinates.elevation || 0,
          address: {
            street: location.address.street,
            city: location.address.city,
            state: location.address.state,
            postalCode: location.address.postalCode,
            country: location.address.country,
            region: location.address.region
          }
        },
        policyTerms: {
          effectiveDate: policy.effectiveDate,
          expirationDate: policy.expirationDate,
          deductible: policy.totalDeductible,
          limit: policy.totalLimit,
          coinsurance: policy.coinsurancePercentage || 100
        }
      };

      // Create exposure
      const exposure = await this.create(exposureData);

      return exposure;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get exposures near a location
   * @param {Number} latitude - Center latitude
   * @param {Number} longitude - Center longitude
   * @param {Number} radiusKm - Radius in kilometers
   * @param {Object} options - Additional query options
   * @returns {Promise<Array>} Array of exposures
   */
  async getExposuresNearLocation(latitude, longitude, radiusKm, options = {}) {
    try {
      return await Exposure.getExposuresInRadius(latitude, longitude, radiusKm, options);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get active exposures for an account
   * @param {String} accountId - Account ID
   * @param {Date} asOfDate - Date to check active status
   * @returns {Promise<Array>} Array of active exposures
   */
  async getActiveExposuresForAccount(accountId, asOfDate = new Date()) {
    try {
      return await this.find({
        accountId,
        status: 'Active',
        'policyTerms.effectiveDate': { $lte: asOfDate },
        'policyTerms.expirationDate': { $gte: asOfDate }
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get exposures by peril type
   * @param {String} peril - Peril type
   * @param {Object} options - Additional query options
   * @returns {Promise<Array>} Array of exposures
   */
  async getExposuresByPeril(peril, options = {}) {
    try {
      const { region, minValue = 0, status = 'Active' } = options;
      
      const query = {
        'perilExposure.peril': peril,
        'perilExposure.isExcluded': false,
        status,
        totalInsuredValue: { $gte: minValue }
      };

      if (region) {
        query['location.address.region'] = region;
      }

      return await this.find(query);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Calculate total exposure for an account
   * @param {String} accountId - Account ID
   * @returns {Promise<Object>} Exposure summary with totals by currency and peril
   */
  async calculateAccountExposure(accountId) {
    try {
      const exposures = await this.find({ 
        accountId, 
        status: 'Active' 
      });

      // Group by currency
      const byCurrency = {};
      const byPeril = {};
      let totalCount = 0;

      exposures.data.forEach(exposure => {
        const currency = exposure.currency;
        
        // Sum by currency
        if (!byCurrency[currency]) {
          byCurrency[currency] = {
            totalInsuredValue: 0,
            buildingValue: 0,
            contentsValue: 0,
            businessInterruptionValue: 0,
            count: 0
          };
        }
        
        byCurrency[currency].totalInsuredValue += exposure.totalInsuredValue;
        byCurrency[currency].buildingValue += exposure.buildingValue;
        byCurrency[currency].contentsValue += exposure.contentsValue;
        byCurrency[currency].businessInterruptionValue += exposure.businessInterruptionValue || 0;
        byCurrency[currency].count++;
        
        // Sum by peril
        exposure.perilExposure.forEach(pe => {
          if (!pe.isExcluded) {
            if (!byPeril[pe.peril]) {
              byPeril[pe.peril] = {
                totalExposure: 0,
                count: 0
              };
            }
            byPeril[pe.peril].totalExposure += pe.exposureValue;
            byPeril[pe.peril].count++;
          }
        });
        
        totalCount++;
      });

      return {
        accountId,
        totalCount,
        byCurrency,
        byPeril,
        timestamp: new Date()
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get exposure distribution by region
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Exposure distribution by region
   */
  async getExposureDistributionByRegion(options = {}) {
    try {
      const { status = 'Active' } = options;
      
      const pipeline = [
        {
          $match: { status }
        },
        {
          $group: {
            _id: '$location.address.region',
            totalExposure: { $sum: '$totalInsuredValue' },
            count: { $sum: 1 },
            avgExposure: { $avg: '$totalInsuredValue' },
            maxExposure: { $max: '$totalInsuredValue' },
            minExposure: { $min: '$totalInsuredValue' }
          }
        },
        {
          $sort: { totalExposure: -1 }
        }
      ];

      const results = await this.aggregate(pipeline);
      
      return {
        byRegion: results,
        timestamp: new Date()
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get exposure distribution by occupancy type
   * @param {String} region - Optional region filter
   * @returns {Promise<Object>} Exposure distribution by occupancy
   */
  async getExposureDistributionByOccupancy(region = null) {
    try {
      const matchStage = { status: 'Active' };
      if (region) {
        matchStage['location.address.region'] = region;
      }

      const pipeline = [
        {
          $match: matchStage
        },
        {
          $group: {
            _id: '$occupancyType',
            totalExposure: { $sum: '$totalInsuredValue' },
            count: { $sum: 1 },
            avgExposure: { $avg: '$totalInsuredValue' }
          }
        },
        {
          $sort: { totalExposure: -1 }
        }
      ];

      const results = await this.aggregate(pipeline);
      
      return {
        byOccupancy: results,
        region: region || 'All',
        timestamp: new Date()
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Validate all exposures for data quality
   * @param {Object} options - Validation options
   * @returns {Promise<Object>} Validation report
   */
  async validateAllExposures(options = {}) {
    try {
      const { limit = 1000, accountId } = options;
      
      const query = accountId ? { accountId } : {};
      const exposures = await this.find(query, { limit });

      const report = {
        totalChecked: exposures.data.length,
        valid: 0,
        invalid: 0,
        errors: [],
        warnings: []
      };

      for (const exposure of exposures.data) {
        const validation = exposure.validateExposureConsistency();
        
        if (validation.isValid) {
          report.valid++;
        } else {
          report.invalid++;
          report.errors.push({
            exposureId: exposure.exposureId,
            errors: validation.errors
          });
        }

        // Additional warnings
        if (exposure.totalInsuredValue > 100000000) {
          report.warnings.push({
            exposureId: exposure.exposureId,
            message: `Very high TIV: ${exposure.totalInsuredValue}`
          });
        }

        if (!exposure.isValidOnDate()) {
          report.warnings.push({
            exposureId: exposure.exposureId,
            message: 'Exposure not currently valid'
          });
        }
      }

      return report;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Bulk update exposures from policy changes
   * @param {String} policyId - Policy ID
   * @param {Object} updates - Policy updates to apply
   * @returns {Promise<Object>} Update result
   */
  async updateExposuresFromPolicy(policyId, updates) {
    try {
      const updateData = {};
      
      // Map policy fields to exposure fields
      if (updates.effectiveDate) {
        updateData['policyTerms.effectiveDate'] = updates.effectiveDate;
      }
      if (updates.expirationDate) {
        updateData['policyTerms.expirationDate'] = updates.expirationDate;
      }
      if (updates.totalDeductible !== undefined) {
        updateData['policyTerms.deductible'] = updates.totalDeductible;
      }
      if (updates.totalLimit !== undefined) {
        updateData['policyTerms.limit'] = updates.totalLimit;
      }
      if (updates.coinsurancePercentage !== undefined) {
        updateData['policyTerms.coinsurance'] = updates.coinsurancePercentage;
      }

      if (Object.keys(updateData).length === 0) {
        return { modifiedCount: 0, message: 'No updates to apply' };
      }

      updateData.updatedAt = new Date();
      updateData.updatedBy = updates.updatedBy || 'system';

      const result = await this.model.updateMany(
        { policyId, status: 'Active' },
        { $set: updateData }
      );

      return {
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount,
        timestamp: new Date()
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get exposures expiring within a date range
   * @param {Date} startDate - Start of range
   * @param {Date} endDate - End of range
   * @returns {Promise<Array>} Expiring exposures
   */
  async getExpiringExposures(startDate, endDate) {
    try {
      return await this.find({
        status: 'Active',
        'policyTerms.expirationDate': {
          $gte: startDate,
          $lte: endDate
        }
      }, {
        sort: { 'policyTerms.expirationDate': 1 }
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Find exposures within a geographic bounding box
   * @param {Object} bounds - Bounding box {north, south, east, west}
   * @param {Object} options - Additional query options
   * @returns {Promise<Array>} Exposures within bounds
   */
  async findExposuresInBounds(bounds, options = {}) {
    try {
      const { north, south, east, west } = bounds;
      const { status = 'Active', minValue = 0 } = options;

      const query = {
        'location.latitude': { $gte: south, $lte: north },
        'location.longitude': { $gte: west, $lte: east },
        status,
        totalInsuredValue: { $gte: minValue }
      };

      return await this.find(query);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Aggregate all exposures for a specific account with detailed breakdown
   * @param {String} accountId - Account ID
   * @param {Object} options - Aggregation options
   * @returns {Promise<Object>} Aggregated exposure summary
   */
  async aggregateAccountExposures(accountId, options = {}) {
    try {
      const { includeChildAccounts = false, asOfDate = new Date() } = options;
      
      // Get account exposures
      const exposures = await this.getActiveExposuresForAccount(accountId, asOfDate);
      
      // If including child accounts, get those too
      let childExposures = [];
      if (includeChildAccounts) {
        const Account = require('../models/Account');
        const account = await Account.findOne({ accountId });
        if (account) {
          const childAccounts = await account.getChildAccounts();
          for (const childAccount of childAccounts) {
            const childExps = await this.getActiveExposuresForAccount(childAccount.accountId, asOfDate);
            childExposures = childExposures.concat(childExps.data || []);
          }
        }
      }

      const allExposures = [...(exposures.data || []), ...childExposures];
      
      // Aggregate by type
      const byType = {
        residential: { count: 0, value: 0 },
        commercial: { count: 0, value: 0 },
        industrial: { count: 0, value: 0 },
        infrastructure: { count: 0, value: 0 }
      };

      // Aggregate by region
      const byRegion = {};
      
      // Aggregate by peril
      const byPeril = {};

      let totalValue = 0;
      let totalCount = 0;

      allExposures.forEach(exposure => {
        totalCount++;
        totalValue += exposure.totalInsuredValue || 0;
        
        // By type
        const type = exposure.occupancyType || 'residential';
        if (byType[type]) {
          byType[type].count++;
          byType[type].value += exposure.totalInsuredValue || 0;
        }
        
        // By region
        const region = exposure.location?.address?.region || 'Unknown';
        if (!byRegion[region]) {
          byRegion[region] = { count: 0, value: 0 };
        }
        byRegion[region].count++;
        byRegion[region].value += exposure.totalInsuredValue || 0;
        
        // By peril
        if (exposure.perilExposure) {
          exposure.perilExposure.forEach(pe => {
            if (!pe.isExcluded) {
              if (!byPeril[pe.peril]) {
                byPeril[pe.peril] = { count: 0, value: 0 };
              }
              byPeril[pe.peril].count++;
              byPeril[pe.peril].value += pe.exposureValue || 0;
            }
          });
        }
      });

      return {
        accountId,
        aggregationTimestamp: new Date(),
        totalExposures: totalCount,
        totalValue,
        exposuresByType: byType,
        exposuresByRegion: byRegion,
        exposuresByPeril: byPeril,
        includeChildAccounts
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Calculate portfolio risk aggregation across multiple accounts
   * @param {Array<String>} accountIds - Array of account IDs
   * @param {Object} options - Calculation options
   * @returns {Promise<Object>} Portfolio risk summary
   */
  async calculatePortfolioRiskAggregation(accountIds, options = {}) {
    try {
      const { currency = 'USD', asOfDate = new Date() } = options;
      
      const portfolioSummary = {
        totalAccounts: accountIds.length,
        totalExposures: 0,
        totalValue: 0,
        byAccount: {},
        byRegion: {},
        byPeril: {},
        riskMetrics: {
          concentrationRisk: 0,
          diversificationBenefit: 0,
          geographicSpread: 0
        },
        timestamp: new Date()
      };

      // Aggregate each account
      for (const accountId of accountIds) {
        const accountSummary = await this.aggregateAccountExposures(accountId, { asOfDate });
        portfolioSummary.byAccount[accountId] = accountSummary;
        portfolioSummary.totalExposures += accountSummary.totalExposures;
        portfolioSummary.totalValue += accountSummary.totalValue;
        
        // Merge regional data
        Object.entries(accountSummary.exposuresByRegion).forEach(([region, data]) => {
          if (!portfolioSummary.byRegion[region]) {
            portfolioSummary.byRegion[region] = { count: 0, value: 0 };
          }
          portfolioSummary.byRegion[region].count += data.count;
          portfolioSummary.byRegion[region].value += data.value;
        });
        
        // Merge peril data
        Object.entries(accountSummary.exposuresByPeril).forEach(([peril, data]) => {
          if (!portfolioSummary.byPeril[peril]) {
            portfolioSummary.byPeril[peril] = { count: 0, value: 0 };
          }
          portfolioSummary.byPeril[peril].count += data.count;
          portfolioSummary.byPeril[peril].value += data.value;
        });
      }

      // Calculate concentration risk (HHI)
      const accountValues = Object.values(portfolioSummary.byAccount).map(a => a.totalValue);
      const totalPortfolioValue = portfolioSummary.totalValue;
      if (totalPortfolioValue > 0) {
        const hhi = accountValues.reduce((sum, value) => {
          const share = value / totalPortfolioValue;
          return sum + (share * share);
        }, 0);
        portfolioSummary.riskMetrics.concentrationRisk = hhi;
        portfolioSummary.riskMetrics.diversificationBenefit = Math.max(0, 1 - hhi);
      }

      // Calculate geographic spread
      const uniqueRegions = Object.keys(portfolioSummary.byRegion).length;
      portfolioSummary.riskMetrics.geographicSpread = uniqueRegions;

      return portfolioSummary;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Calculate expected loss for exposures given hazard scenarios
   * @param {Array} exposures - Array of exposure objects
   * @param {Object} hazardScenario - Hazard scenario details
   * @returns {Promise<Object>} Loss calculations
   */
  async calculateExpectedLoss(exposures, hazardScenario) {
    try {
      const { peril, intensity, location } = hazardScenario;
      
      let totalLoss = 0;
      const details = [];

      for (const exposure of exposures) {
        // Get peril-specific exposure
        const perilExp = exposure.perilExposure.find(p => p.peril === peril);
        
        if (!perilExp || perilExp.isExcluded) {
          continue;
        }

        // Calculate distance-based attenuation (simple model)
        const distance = this.calculateDistance(
          location.latitude,
          location.longitude,
          exposure.location.latitude,
          exposure.location.longitude
        );

        // Simple attenuation: 100% at 0km, 50% at 50km, 10% at 100km
        const attenuation = Math.max(0, 1 - (distance / 100));
        const effectiveIntensity = intensity * attenuation;

        // Calculate damage ratio (simplified)
        const damageRatio = Math.min(effectiveIntensity / 10, 1) * 0.5; // Max 50% loss

        // Calculate gross loss
        const grossLoss = perilExp.exposureValue * damageRatio;

        // Apply policy terms
        const netLoss = exposure.applyPolicyTerms(grossLoss);

        totalLoss += netLoss;

        details.push({
          exposureId: exposure.exposureId,
          distance,
          attenuation,
          effectiveIntensity,
          damageRatio,
          grossLoss,
          netLoss
        });
      }

      return {
        totalLoss,
        affectedExposures: details.length,
        details,
        scenario: hazardScenario,
        timestamp: new Date()
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   * @param {Number} lat1 - First latitude
   * @param {Number} lon1 - First longitude
   * @param {Number} lat2 - Second latitude
   * @param {Number} lon2 - Second longitude
   * @returns {Number} Distance in kilometers
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

module.exports = ExposureService;
