const Hazard = require('../models/Hazard');
const Vulnerability = require('../models/Vulnerability');
const Account = require('../models/Account');
const HazardZone = require('../models/HazardZone');
const HazardScenario = require('../models/HazardScenario');
const Location = require('../models/Location');

/**
 * Integration Service for seamless data flow between exposure, hazard, and vulnerability modules
 * This service provides unified risk assessment and financial calculation interfaces
 */
class IntegrationService {
  
  /**
   * Get comprehensive risk assessment for a specific location
   * @param {Object} params - Location and analysis parameters
   * @returns {Object} Integrated risk assessment
   */
  static async getLocationRiskAssessment(params) {
    const {
      latitude,
      longitude,
      bufferKm = 50,
      hazardTypes = [],
      includeVulnerability = true,
      includeExposure = true,
      currency = 'USD'
    } = params;

    try {
      // Get all relevant data in parallel
      const [hazards, vulnerabilities, accounts, zones, scenarios] = await Promise.all([
        this.getHazardsAffectingLocation(latitude, longitude, bufferKm, hazardTypes),
        includeVulnerability ? this.getVulnerabilitiesAffectingLocation(latitude, longitude, bufferKm) : [],
        includeExposure ? this.getAccountsInLocation(latitude, longitude, bufferKm) : [],
        this.getHazardZonesContainingLocation(latitude, longitude),
        this.getRelevantScenarios(latitude, longitude, bufferKm)
      ]);

      // Calculate integrated risk metrics
      const riskMetrics = await this.calculateIntegratedRiskMetrics({
        hazards,
        vulnerabilities,
        accounts,
        zones,
        scenarios,
        currency
      });

      // Generate risk recommendations
      const recommendations = this.generateRiskRecommendations({
        hazards,
        vulnerabilities,
        accounts,
        riskMetrics
      });

      return {
        success: true,
        data: {
          location: {
            latitude,
            longitude,
            bufferKm
          },
          analysis: {
            hazards: hazards.length,
            vulnerabilities: vulnerabilities.length,
            accounts: accounts.length,
            zones: zones.length,
            scenarios: scenarios.length
          },
          riskMetrics,
          recommendations,
          rawData: {
            hazards: hazards.map(h => this.sanitizeHazardData(h)),
            vulnerabilities: vulnerabilities.map(v => this.sanitizeVulnerabilityData(v)),
            accounts: accounts.map(a => this.sanitizeAccountData(a)),
            zones: zones.map(z => this.sanitizeZoneData(z)),
            scenarios: scenarios.map(s => this.sanitizeScenarioData(s))
          }
        }
      };
    } catch (error) {
      throw new Error(`Failed to get location risk assessment: ${error.message}`);
    }
  }

  /**
   * Get account-specific risk analysis with integrated hazard and vulnerability data
   * @param {string} accountId - Account identifier
   * @param {Object} options - Analysis options
   * @returns {Object} Account risk analysis
   */
  static async getAccountRiskAnalysis(accountId, options = {}) {
    const {
      includeChildAccounts = true,
      hazardTypes = [],
      currency = 'USD',
      riskThreshold = 0.5
    } = options;

    try {
      // Get account and related data
      const account = await Account.findOne({ accountId });
      if (!account) {
        throw new Error('Account not found');
      }

      const [childAccounts, accountLocations] = await Promise.all([
        includeChildAccounts ? account.getChildAccounts() : [],
        this.getAccountLocations(accountId)
      ]);

      // Get risk data for all account locations
      const locationRiskData = await Promise.all(
        accountLocations.map(async (location) => {
          const riskAssessment = await this.getLocationRiskAssessment({
            latitude: location.coordinates.latitude,
            longitude: location.coordinates.longitude,
            bufferKm: 25,
            hazardTypes,
            currency
          });
          return {
            location,
            riskAssessment: riskAssessment.data
          };
        })
      );

      // Calculate account-level risk metrics
      const accountRiskMetrics = this.calculateAccountRiskMetrics({
        account,
        childAccounts,
        locationRiskData,
        currency
      });

      // Generate account-specific recommendations
      const recommendations = this.generateAccountRecommendations({
        account,
        accountRiskMetrics,
        locationRiskData,
        riskThreshold
      });

      return {
        success: true,
        data: {
          account: this.sanitizeAccountData(account),
          childAccounts: childAccounts.map(ca => this.sanitizeAccountData(ca)),
          riskMetrics: accountRiskMetrics,
          locationRiskData,
          recommendations,
          summary: {
            totalExposure: accountRiskMetrics.totalExposure,
            averageRiskScore: accountRiskMetrics.averageRiskScore,
            highRiskLocations: accountRiskMetrics.highRiskLocations,
            criticalHazards: accountRiskMetrics.criticalHazards
          }
        }
      };
    } catch (error) {
      throw new Error(`Failed to get account risk analysis: ${error.message}`);
    }
  }

  /**
   * Calculate financial risk metrics for financial calculation module integration
   * @param {Object} params - Financial calculation parameters
   * @returns {Object} Financial risk metrics
   */
  static async calculateFinancialRiskMetrics(params) {
    const {
      accountId,
      hazardTypes = [],
      timeHorizon = 1, // years
      confidenceLevel = 0.95,
      currency = 'USD',
      includeVulnerabilityAdjustment = true
    } = params;

    try {
      // Get account and risk data
      const account = await Account.findOne({ accountId });
      if (!account) {
        throw new Error('Account not found');
      }

      const accountRiskAnalysis = await this.getAccountRiskAnalysis(accountId, {
        hazardTypes,
        currency
      });

      // Calculate financial metrics
      const financialMetrics = {
        // Expected Loss (EL)
        expectedLoss: this.calculateExpectedLoss(accountRiskAnalysis.data, timeHorizon),
        
        // Value at Risk (VaR)
        valueAtRisk: this.calculateValueAtRisk(accountRiskAnalysis.data, confidenceLevel),
        
        // Tail Value at Risk (TVaR)
        tailValueAtRisk: this.calculateTailValueAtRisk(accountRiskAnalysis.data, confidenceLevel),
        
        // Standard Deviation
        standardDeviation: this.calculateStandardDeviation(accountRiskAnalysis.data),
        
        // Risk-adjusted exposure
        riskAdjustedExposure: this.calculateRiskAdjustedExposure(accountRiskAnalysis.data),
        
        // Hazard-specific metrics
        hazardMetrics: this.calculateHazardSpecificMetrics(accountRiskAnalysis.data, hazardTypes),
        
        // Vulnerability-adjusted metrics
        vulnerabilityAdjustedMetrics: includeVulnerabilityAdjustment ? 
          this.calculateVulnerabilityAdjustedMetrics(accountRiskAnalysis.data) : null,
        
        // Time horizon adjustments
        timeHorizonAdjustments: this.calculateTimeHorizonAdjustments(accountRiskAnalysis.data, timeHorizon),
        
        // Currency and confidence level
        currency,
        confidenceLevel,
        timeHorizon,
        
        // Metadata
        calculationTimestamp: new Date(),
        dataQuality: this.assessDataQuality(accountRiskAnalysis.data)
      };

      return {
        success: true,
        data: financialMetrics
      };
    } catch (error) {
      throw new Error(`Failed to calculate financial risk metrics: ${error.message}`);
    }
  }

  /**
   * Get integrated risk dashboard data
   * @param {Object} params - Dashboard parameters
   * @returns {Object} Dashboard data
   */
  static async getRiskDashboard(params = {}) {
    const {
      region,
      hazardTypes = [],
      timeRange = '30d',
      currency = 'USD'
    } = params;

    try {
      // Get aggregated data
      const [
        hazardStats,
        vulnerabilityStats,
        accountStats,
        recentEvents,
        riskTrends
      ] = await Promise.all([
        this.getHazardStatistics(region, hazardTypes),
        this.getVulnerabilityStatistics(region),
        this.getAccountStatistics(region),
        this.getRecentRiskEvents(timeRange),
        this.getRiskTrends(timeRange, region)
      ]);

      // Calculate overall risk indicators
      const riskIndicators = this.calculateRiskIndicators({
        hazardStats,
        vulnerabilityStats,
        accountStats,
        recentEvents
      });

      return {
        success: true,
        data: {
          overview: {
            totalHazards: hazardStats.totalHazards,
            totalVulnerabilities: vulnerabilityStats.totalVulnerabilities,
            totalAccounts: accountStats.totalAccounts,
            totalExposure: accountStats.totalExposure,
            currency
          },
          riskIndicators,
          hazardStats,
          vulnerabilityStats,
          accountStats,
          recentEvents,
          riskTrends,
          lastUpdated: new Date()
        }
      };
    } catch (error) {
      throw new Error(`Failed to get risk dashboard: ${error.message}`);
    }
  }

  /**
   * Calculate risk indicators for dashboard
   * @param {Object} data - Statistics data
   * @returns {Object} Risk indicators
   */
  static calculateRiskIndicators(data) {
    const { hazardStats, vulnerabilityStats, accountStats, recentEvents } = data;
    
    // Calculate risk score based on various factors
    const hazardRisk = hazardStats.averageSeverity || 0;
    const vulnerabilityRisk = vulnerabilityStats.averageVulnerabilityScore || 0;
    const exposureRisk = accountStats.averageExposure || 0;
    const eventRisk = recentEvents.length > 0 ? recentEvents.length * 0.1 : 0;
    
    const overallRiskScore = (hazardRisk + vulnerabilityRisk + exposureRisk + eventRisk) / 4;
    
    // Determine risk level
    let riskLevel = 'Low';
    if (overallRiskScore >= 8) riskLevel = 'Critical';
    else if (overallRiskScore >= 6) riskLevel = 'High';
    else if (overallRiskScore >= 4) riskLevel = 'Medium';
    
    return {
      overallRiskScore: Math.round(overallRiskScore * 100) / 100,
      riskLevel,
      hazardRisk: Math.round(hazardRisk * 100) / 100,
      vulnerabilityRisk: Math.round(vulnerabilityRisk * 100) / 100,
      exposureRisk: Math.round(exposureRisk * 100) / 100,
      eventRisk: Math.round(eventRisk * 100) / 100,
      lastCalculated: new Date().toISOString()
    };
  }

  // Helper methods for data retrieval and processing

  static async getHazardsAffectingLocation(latitude, longitude, bufferKm, hazardTypes = []) {
    const hazards = await Hazard.find({ status: 'Active' });
    let affectingHazards = hazards.filter(hazard => 
      hazard.affectsLocation(latitude, longitude, bufferKm)
    );

    if (hazardTypes.length > 0) {
      affectingHazards = affectingHazards.filter(hazard => 
        hazardTypes.includes(hazard.hazardType)
      );
    }

    return affectingHazards;
  }

  static async getVulnerabilitiesAffectingLocation(latitude, longitude, bufferKm) {
    const vulnerabilities = await Vulnerability.find({ status: 'Active' });
    return vulnerabilities.filter(vuln => 
      vuln.affectsLocation(latitude, longitude, bufferKm)
    );
  }

  static async getAccountsInLocation(latitude, longitude, bufferKm) {
    // This would typically involve querying locations and then accounts
    // For now, returning all accounts as a placeholder
    return await Account.find({ status: 'Active' });
  }

  static async getHazardZonesContainingLocation(latitude, longitude) {
    const zones = await HazardZone.find({ status: 'Active' });
    return zones.filter(zone => 
      zone.containsLocation(latitude, longitude)
    );
  }

  static async getRelevantScenarios(latitude, longitude, bufferKm) {
    // Get scenarios that might affect this location
    return await HazardScenario.find({ 
      status: 'Completed',
      'affectedLocations': { $exists: true, $ne: [] }
    });
  }

  static async getAccountLocations(accountId) {
    // This would typically query a locations collection
    // For now, returning empty array as placeholder
    return [];
  }

  // Risk calculation methods

  static async calculateIntegratedRiskMetrics(data) {
    const { hazards, vulnerabilities, accounts, zones, scenarios, currency } = data;

    // Calculate hazard risk score
    const hazardRiskScore = hazards.length > 0 ? 
      hazards.reduce((sum, h) => sum + h.calculateHazardScore(), 0) / hazards.length : 0;

    // Calculate vulnerability risk score
    const vulnerabilityRiskScore = vulnerabilities.length > 0 ?
      vulnerabilities.reduce((sum, v) => sum + v.overallVulnerabilityScore, 0) / vulnerabilities.length : 0;

    // Calculate exposure value
    const totalExposure = accounts.reduce((sum, a) => sum + a.totalExposure, 0);

    // Calculate combined risk score
    const combinedRiskScore = (hazardRiskScore + vulnerabilityRiskScore) / 2;

    // Determine overall risk level
    let overallRiskLevel = 'Low';
    if (combinedRiskScore >= 8) overallRiskLevel = 'Extreme';
    else if (combinedRiskScore >= 6) overallRiskLevel = 'Very High';
    else if (combinedRiskScore >= 4) overallRiskLevel = 'High';
    else if (combinedRiskScore >= 2) overallRiskLevel = 'Medium';

    return {
      hazardRiskScore,
      vulnerabilityRiskScore,
      combinedRiskScore,
      overallRiskLevel,
      totalExposure,
      currency,
      dataQuality: this.assessDataQuality({ hazards, vulnerabilities, accounts })
    };
  }

  static calculateAccountRiskMetrics(data) {
    const { account, childAccounts, locationRiskData, currency } = data;

    const totalExposure = account.totalExposure + 
      childAccounts.reduce((sum, child) => sum + child.totalExposure, 0);

    const averageRiskScore = locationRiskData.length > 0 ?
      locationRiskData.reduce((sum, lrd) => 
        sum + lrd.riskAssessment.riskMetrics.combinedRiskScore, 0) / locationRiskData.length : 0;

    const highRiskLocations = locationRiskData.filter(lrd => 
      lrd.riskAssessment.riskMetrics.overallRiskLevel === 'High' || 
      lrd.riskAssessment.riskMetrics.overallRiskLevel === 'Very High' ||
      lrd.riskAssessment.riskMetrics.overallRiskLevel === 'Extreme'
    ).length;

    const criticalHazards = [...new Set(
      locationRiskData.flatMap(lrd => 
        lrd.riskAssessment.rawData.hazards.map(h => h.hazardType)
      )
    )];

    return {
      totalExposure,
      averageRiskScore,
      highRiskLocations,
      criticalHazards,
      currency,
      locationCount: locationRiskData.length
    };
  }

  // Financial calculation methods

  static calculateExpectedLoss(riskData, timeHorizon) {
    // Simplified expected loss calculation
    const baseExposure = riskData.riskMetrics.totalExposure || 0;
    const riskScore = riskData.riskMetrics.combinedRiskScore || 0;
    const timeFactor = Math.min(timeHorizon, 10); // Cap at 10 years, but don't divide by 10
    
    return baseExposure * (riskScore / 10) * timeFactor;
  }

  static calculateValueAtRisk(riskData, confidenceLevel) {
    // Simplified VaR calculation
    const expectedLoss = this.calculateExpectedLoss(riskData, 1);
    const volatility = this.calculateStandardDeviation(riskData);
    
    // Using normal distribution approximation
    const zScore = this.getZScore(confidenceLevel);
    return expectedLoss + (zScore * volatility);
  }

  static calculateTailValueAtRisk(riskData, confidenceLevel) {
    // Simplified TVaR calculation
    const varValue = this.calculateValueAtRisk(riskData, confidenceLevel);
    const expectedLoss = this.calculateExpectedLoss(riskData, 1);
    
    // TVaR is typically higher than VaR
    return varValue + (expectedLoss * 0.1);
  }

  static calculateStandardDeviation(riskData) {
    // Simplified standard deviation calculation
    const riskScore = riskData.riskMetrics.combinedRiskScore || 0;
    const exposure = riskData.riskMetrics.totalExposure || 0;
    
    // Assume coefficient of variation of 0.3
    return exposure * (riskScore / 10) * 0.3;
  }

  static calculateRiskAdjustedExposure(riskData) {
    const baseExposure = riskData.riskMetrics.totalExposure || 0;
    const riskScore = riskData.riskMetrics.combinedRiskScore || 0;
    
    return baseExposure * (1 + (riskScore / 10));
  }

  static calculateHazardSpecificMetrics(riskData, hazardTypes) {
    const hazards = riskData.rawData.hazards || [];
    const metrics = {};

    hazardTypes.forEach(hazardType => {
      const hazardData = hazards.filter(h => h.hazardType === hazardType);
      if (hazardData.length > 0) {
        metrics[hazardType] = {
          count: hazardData.length,
          averageProbability: hazardData.reduce((sum, h) => sum + (h.probability || 0), 0) / hazardData.length,
          maxSeverity: Math.max(...hazardData.map(h => this.getSeverityScore(h.severity))),
          totalExposure: hazards.length > 0 ? riskData.riskMetrics.totalExposure * (hazardData.length / hazards.length) : 0
        };
      }
    });

    return metrics;
  }

  static calculateVulnerabilityAdjustedMetrics(riskData) {
    const vulnerabilities = riskData.rawData.vulnerabilities || [];
    const baseExposure = riskData.riskMetrics.totalExposure || 0;
    
    if (vulnerabilities.length === 0) {
      return {
        adjustedExposure: baseExposure,
        vulnerabilityMultiplier: 1.0
      };
    }

    const averageVulnerability = vulnerabilities.reduce((sum, v) => 
      sum + v.overallVulnerabilityScore, 0) / vulnerabilities.length;
    
    const vulnerabilityMultiplier = 1 + (averageVulnerability / 10);
    
    return {
      adjustedExposure: baseExposure * vulnerabilityMultiplier,
      vulnerabilityMultiplier,
      averageVulnerabilityScore: averageVulnerability
    };
  }

  static calculateTimeHorizonAdjustments(riskData, timeHorizon) {
    const baseRisk = riskData.riskMetrics.combinedRiskScore || 0;
    
    // Risk typically increases with time horizon
    const timeAdjustment = Math.min(timeHorizon / 5, 2); // Cap at 2x
    
    return {
      adjustedRiskScore: baseRisk * timeAdjustment,
      timeAdjustmentFactor: timeAdjustment,
      timeHorizon
    };
  }

  // Utility methods

  static getSeverityScore(severity) {
    const scores = {
      'Minor': 1,
      'Moderate': 2,
      'Major': 3,
      'Severe': 4,
      'Catastrophic': 5,
      'Extreme': 6
    };
    return scores[severity] || 0;
  }

  static getZScore(confidenceLevel) {
    // Z-scores for common confidence levels
    const zScores = {
      0.90: 1.28,
      0.95: 1.65,
      0.99: 2.33,
      0.999: 3.09
    };
    return zScores[confidenceLevel] || 1.65;
  }

  static assessDataQuality(data) {
    const hazards = data.rawData?.hazards || data.hazards || [];
    const vulnerabilities = data.rawData?.vulnerabilities || data.vulnerabilities || [];
    const accounts = data.rawData?.accounts || data.accounts || [];
    
    let qualityScore = 0;
    let totalFactors = 0;

    // Assess hazard data quality
    if (hazards.length > 0) {
      qualityScore += Math.min(hazards.length / 10, 1) * 0.3;
      totalFactors += 0.3;
    }

    // Assess vulnerability data quality
    if (vulnerabilities.length > 0) {
      qualityScore += Math.min(vulnerabilities.length / 5, 1) * 0.3;
      totalFactors += 0.3;
    }

    // Assess account data quality
    if (accounts.length > 0) {
      qualityScore += Math.min(accounts.length / 20, 1) * 0.4;
      totalFactors += 0.4;
    }

    const finalScore = totalFactors > 0 ? qualityScore / totalFactors : 0;

    return {
      score: finalScore,
      level: finalScore >= 0.8 ? 'High' : finalScore >= 0.6 ? 'Medium' : 'Low',
      factors: {
        hazardData: hazards.length,
        vulnerabilityData: vulnerabilities.length,
        accountData: accounts.length
      }
    };
  }

  // Data sanitization methods

  static sanitizeHazardData(hazard) {
    return {
      hazardId: hazard.hazardId,
      hazardName: hazard.hazardName,
      hazardType: hazard.hazardType,
      severity: hazard.severity,
      probability: hazard.probability,
      footprint: hazard.footprint,
      economicImpact: hazard.economicImpact
    };
  }

  static sanitizeVulnerabilityData(vulnerability) {
    return {
      vulnerabilityId: vulnerability.vulnerabilityId,
      vulnerabilityName: vulnerability.vulnerabilityName,
      vulnerabilityType: vulnerability.vulnerabilityType,
      overallVulnerabilityScore: vulnerability.overallVulnerabilityScore,
      overallRiskLevel: vulnerability.overallRiskLevel,
      geographicScope: vulnerability.geographicScope
    };
  }

  static sanitizeAccountData(account) {
    return {
      accountId: account.accountId,
      accountName: account.accountName,
      accountType: account.accountType,
      totalExposure: account.totalExposure,
      currency: account.currency,
      regions: account.regions,
      riskProfile: account.riskProfile
    };
  }

  static sanitizeZoneData(zone) {
    return {
      zoneId: zone.zoneId,
      zoneName: zone.zoneName,
      zoneType: zone.zoneType,
      boundary: zone.boundary,
      riskLevels: zone.riskLevels
    };
  }

  static sanitizeScenarioData(scenario) {
    return {
      scenarioId: scenario.scenarioId,
      scenarioName: scenario.scenarioName,
      primaryHazard: scenario.primaryHazard,
      results: scenario.results,
      status: scenario.status
    };
  }

  // Recommendation generation methods

  static generateRiskRecommendations(data) {
    const { hazards, vulnerabilities, accounts, riskMetrics } = data;
    const recommendations = [];

    // High risk recommendations
    if (riskMetrics.overallRiskLevel === 'High' || riskMetrics.overallRiskLevel === 'Very High' || riskMetrics.overallRiskLevel === 'Extreme') {
      recommendations.push({
        type: 'High Risk Alert',
        priority: 'Critical',
        message: 'Location has high risk exposure. Immediate risk mitigation measures recommended.',
        actions: ['Review insurance coverage', 'Implement emergency response plans', 'Consider risk transfer options']
      });
    }

    // Hazard-specific recommendations
    if (hazards.length > 0) {
      const highProbabilityHazards = hazards.filter(h => h.probability > 0.7);
      if (highProbabilityHazards.length > 0) {
        recommendations.push({
          type: 'High Probability Hazards',
          priority: 'High',
          message: `${highProbabilityHazards.length} high probability hazards identified`,
          actions: ['Monitor hazard conditions', 'Prepare evacuation plans', 'Review building codes']
        });
      }
    }

    // Vulnerability recommendations
    if (vulnerabilities.length > 0) {
      const highVulnerability = vulnerabilities.filter(v => v.overallVulnerabilityScore > 7);
      if (highVulnerability.length > 0) {
        recommendations.push({
          type: 'High Vulnerability',
          priority: 'High',
          message: 'High vulnerability factors identified',
          actions: ['Strengthen infrastructure', 'Improve emergency response', 'Enhance building codes']
        });
      }
    }

    return recommendations;
  }

  static generateAccountRecommendations(data) {
    const { account, accountRiskMetrics, riskThreshold } = data;
    const recommendations = [];

    if (accountRiskMetrics.averageRiskScore > riskThreshold) {
      recommendations.push({
        type: 'Account Risk Management',
        priority: 'High',
        message: 'Account exceeds risk threshold',
        actions: ['Review risk limits', 'Consider risk transfer', 'Implement monitoring']
      });
    }

    if (accountRiskMetrics.highRiskLocations > 0) {
      recommendations.push({
        type: 'Location Risk',
        priority: 'Medium',
        message: `${accountRiskMetrics.highRiskLocations} high-risk locations identified`,
        actions: ['Review location-specific risks', 'Consider geographic diversification']
      });
    }

    return recommendations;
  }

  // Statistics methods (placeholders for now)

  static async getHazardStatistics(region, hazardTypes) {
    // Implementation would query hazard data
    return { totalHazards: 0, byType: {} };
  }

  static async getVulnerabilityStatistics(region) {
    // Implementation would query vulnerability data
    return { totalVulnerabilities: 0, byType: {} };
  }

  static async getAccountStatistics(region) {
    // Implementation would query account data
    return { totalAccounts: 0, totalExposure: 0 };
  }

  static async getRecentRiskEvents(timeRange) {
    // Implementation would query recent events
    return [];
  }

  static async getRiskTrends(timeRange, region) {
    // Implementation would calculate risk trends
    return { trend: 'stable', change: 0 };
  }

  /**
   * Get accounts near a specific location
   * @param {Object} params - Location parameters
   * @returns {Promise<Array>} Array of accounts near the location
   */
  static async getAccountsNearLocation(params) {
    const {
      latitude,
      longitude,
      radiusKm = 50,
      status = 'Active'
    } = params;

    try {
      // Get locations within radius
      const Location = require('../models/Location');
      const radiusInDegrees = radiusKm / 111; // Approximate km to degrees
      
      const locations = await Location.find({
        'coordinates.latitude': {
          $gte: latitude - radiusInDegrees,
          $lte: latitude + radiusInDegrees
        },
        'coordinates.longitude': {
          $gte: longitude - radiusInDegrees,
          $lte: longitude + radiusInDegrees
        }
      });

      // Extract unique account IDs from locations
      const accountIds = [...new Set(locations.map(loc => loc.metadata?.get('accountId')).filter(Boolean))];
      
      // Fetch accounts
      const accounts = await Account.find({
        accountId: { $in: accountIds },
        ...(status ? { status } : {})
      });

      return accounts;
    } catch (error) {
      throw new Error(`Failed to get accounts near location: ${error.message}`);
    }
  }

  /**
   * Get vulnerabilities affecting a specific location
   * @param {Object} params - Location parameters
   * @returns {Promise<Array>} Array of vulnerabilities
   */
  static async getVulnerabilitiesForLocation(params) {
    const {
      latitude,
      longitude,
      radiusKm = 50,
      hazardTypes = []
    } = params;

    try {
      const Vulnerability = require('../models/Vulnerability');
      const radiusInDegrees = radiusKm / 111; // Approximate km to degrees
      
      const query = {
        'geographicScope.centerLatitude': {
          $gte: latitude - radiusInDegrees,
          $lte: latitude + radiusInDegrees
        },
        'geographicScope.centerLongitude': {
          $gte: longitude - radiusInDegrees,
          $lte: longitude + radiusInDegrees
        },
        status: 'Active'
      };

      if (hazardTypes.length > 0) {
        query.applicableHazards = { $in: hazardTypes };
      }

      const vulnerabilities = await Vulnerability.find(query);
      
      return vulnerabilities;
    } catch (error) {
      throw new Error(`Failed to get vulnerabilities for location: ${error.message}`);
    }
  }

  /**
   * Get exposures near a specific location
   * @param {Object} params - Location parameters
   * @returns {Promise<Array>} Array of exposures
   */
  static async getExposuresNearLocation(params) {
    const {
      latitude,
      longitude,
      radiusKm = 50,
      exposureTypes = [],
      perils = []
    } = params;

    try {
      const Exposure = require('../models/Exposure');
      const radiusInDegrees = radiusKm / 111; // Approximate km to degrees
      
      const query = {
        'location.latitude': {
          $gte: latitude - radiusInDegrees,
          $lte: latitude + radiusInDegrees
        },
        'location.longitude': {
          $gte: longitude - radiusInDegrees,
          $lte: longitude + radiusInDegrees
        },
        status: 'Active'
      };

      if (exposureTypes.length > 0) {
        query.exposureType = { $in: exposureTypes };
      }

      if (perils.length > 0) {
        query['perilExposures.peril'] = { $in: perils };
      }

      const exposures = await Exposure.find(query);
      
      return exposures;
    } catch (error) {
      throw new Error(`Failed to get exposures near location: ${error.message}`);
    }
  }
}

module.exports = IntegrationService;

