const IntegrationService = require('../services/IntegrationService');

/**
 * Integration Controller for unified risk assessment and financial calculation interfaces
 * Provides seamless integration between exposure, hazard, and vulnerability modules
 */
class IntegrationController {
  
  /**
   * Get comprehensive location risk assessment
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getLocationRiskAssessment(req, res) {
    try {
      const {
        latitude,
        longitude,
        bufferKm = 50,
        hazardTypes = [],
        includeVulnerability = true,
        includeExposure = true,
        currency = 'USD'
      } = req.query;

      // Validate required parameters
      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: 'Latitude and longitude are required'
        });
      }

      // Parse hazard types if provided as comma-separated string
      const parsedHazardTypes = Array.isArray(hazardTypes) ? 
        hazardTypes : hazardTypes.split(',').filter(Boolean);

      const result = await IntegrationService.getLocationRiskAssessment({
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        bufferKm: parseFloat(bufferKm),
        hazardTypes: parsedHazardTypes,
        includeVulnerability: includeVulnerability === 'true',
        includeExposure: includeExposure === 'true',
        currency
      });

      res.json(result);
    } catch (error) {
      console.error('Error in getLocationRiskAssessment:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting location risk assessment',
        error: error.message
      });
    }
  }

  /**
   * Get account-specific risk analysis
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getAccountRiskAnalysis(req, res) {
    try {
      const { accountId } = req.params;
      const {
        includeChildAccounts = 'true',
        hazardTypes = [],
        currency = 'USD',
        riskThreshold = 0.5
      } = req.query;

      // Parse hazard types if provided as comma-separated string
      const parsedHazardTypes = Array.isArray(hazardTypes) ? 
        hazardTypes : hazardTypes.split(',').filter(Boolean);

      const result = await IntegrationService.getAccountRiskAnalysis(accountId, {
        includeChildAccounts: includeChildAccounts === 'true',
        hazardTypes: parsedHazardTypes,
        currency,
        riskThreshold: parseFloat(riskThreshold)
      });

      res.json(result);
    } catch (error) {
      console.error('Error in getAccountRiskAnalysis:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting account risk analysis',
        error: error.message
      });
    }
  }

  /**
   * Calculate financial risk metrics for financial calculation module integration
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async calculateFinancialRiskMetrics(req, res) {
    try {
      const { accountId } = req.params;
      const {
        hazardTypes = [],
        timeHorizon = 1,
        confidenceLevel = 0.95,
        currency = 'USD',
        includeVulnerabilityAdjustment = 'true'
      } = req.body;

      // Parse hazard types if provided as comma-separated string
      const parsedHazardTypes = Array.isArray(hazardTypes) ? 
        hazardTypes : hazardTypes.split(',').filter(Boolean);

      const result = await IntegrationService.calculateFinancialRiskMetrics({
        accountId,
        hazardTypes: parsedHazardTypes,
        timeHorizon: parseFloat(timeHorizon),
        confidenceLevel: parseFloat(confidenceLevel),
        currency,
        includeVulnerabilityAdjustment: includeVulnerabilityAdjustment === 'true'
      });

      res.json(result);
    } catch (error) {
      console.error('Error in calculateFinancialRiskMetrics:', error);
      res.status(500).json({
        success: false,
        message: 'Error calculating financial risk metrics',
        error: error.message
      });
    }
  }

  /**
   * Get integrated risk dashboard data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getRiskDashboard(req, res) {
    try {
      const {
        region,
        hazardTypes = [],
        timeRange = '30d',
        currency = 'USD'
      } = req.query;

      // Parse hazard types if provided as comma-separated string
      const parsedHazardTypes = Array.isArray(hazardTypes) ? 
        hazardTypes : hazardTypes.split(',').filter(Boolean);

      const result = await IntegrationService.getRiskDashboard({
        region,
        hazardTypes: parsedHazardTypes,
        timeRange,
        currency
      });

      res.json(result);
    } catch (error) {
      console.error('Error in getRiskDashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting risk dashboard',
        error: error.message
      });
    }
  }

  /**
   * Get risk comparison between multiple locations
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getRiskComparison(req, res) {
    try {
      const { locations } = req.body;
      
      if (!locations || !Array.isArray(locations) || locations.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'At least 2 locations are required for comparison'
        });
      }

      const comparisonResults = await Promise.all(
        locations.map(async (location) => {
          const result = await IntegrationService.getLocationRiskAssessment({
            latitude: location.latitude,
            longitude: location.longitude,
            bufferKm: location.bufferKm || 50,
            hazardTypes: location.hazardTypes || [],
            includeVulnerability: location.includeVulnerability !== false,
            includeExposure: location.includeExposure !== false,
            currency: location.currency || 'USD'
          });
          
          return {
            location: {
              latitude: location.latitude,
              longitude: location.longitude,
              name: location.name || `${location.latitude}, ${location.longitude}`
            },
            riskAssessment: result.data
          };
        })
      );

      // Calculate comparison metrics
      const comparisonMetrics = calculateComparisonMetrics(comparisonResults);

      res.json({
        success: true,
        data: {
          locations: comparisonResults,
          comparison: comparisonMetrics,
          summary: {
            totalLocations: locations.length,
            highestRisk: comparisonMetrics.highestRisk,
            lowestRisk: comparisonMetrics.lowestRisk,
            averageRisk: comparisonMetrics.averageRisk
          }
        }
      });
    } catch (error) {
      console.error('Error in getRiskComparison:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting risk comparison',
        error: error.message
      });
    }
  }

  /**
   * Get risk trend analysis for a specific location or account
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getRiskTrendAnalysis(req, res) {
    try {
      const {
        type, // 'location' or 'account'
        id, // location coordinates or account ID
        timeRange = '1y',
        granularity = 'monthly' // daily, weekly, monthly, quarterly
      } = req.query;

      if (!type || !id) {
        return res.status(400).json({
          success: false,
          message: 'Type and ID are required'
        });
      }

      // This would typically query historical data
      // For now, returning mock trend data
      const trendData = generateMockTrendData(timeRange, granularity);

      res.json({
        success: true,
        data: {
          type,
          id,
          timeRange,
          granularity,
          trendData,
          analysis: {
            trend: 'increasing', // stable, increasing, decreasing
            change: 0.15, // percentage change
            volatility: 0.08, // standard deviation
            confidence: 0.85
          }
        }
      });
    } catch (error) {
      console.error('Error in getRiskTrendAnalysis:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting risk trend analysis',
        error: error.message
      });
    }
  }

  /**
   * Get risk alerts and notifications
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getRiskAlerts(req, res) {
    try {
      const {
        accountId,
        severity = 'medium', // low, medium, high, critical
        limit = 50
      } = req.query;

      // This would typically query an alerts/notifications system
      // For now, returning mock alert data
      const alerts = generateMockAlerts(accountId, severity, parseInt(limit));

      res.json({
        success: true,
        data: {
          alerts,
          summary: {
            total: alerts.length,
            critical: alerts.filter(a => a.severity === 'critical').length,
            high: alerts.filter(a => a.severity === 'high').length,
            medium: alerts.filter(a => a.severity === 'medium').length,
            low: alerts.filter(a => a.severity === 'low').length
          }
        }
      });
    } catch (error) {
      console.error('Error in getRiskAlerts:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting risk alerts',
        error: error.message
      });
    }
  }

  /**
   * Export risk data for external systems
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async exportRiskData(req, res) {
    try {
      const {
        type, // 'location', 'account', 'dashboard'
        id,
        format = 'json', // json, csv, xml
        includeRawData = false
      } = req.query;

      if (!type || !id) {
        return res.status(400).json({
          success: false,
          message: 'Type and ID are required'
        });
      }

      let data;
      switch (type) {
        case 'location':
          const [lat, lng] = id.split(',').map(Number);
          const locationResult = await IntegrationService.getLocationRiskAssessment({
            latitude: lat,
            longitude: lng,
            bufferKm: 50
          });
          data = locationResult.data;
          break;
        case 'account':
          const accountResult = await IntegrationService.getAccountRiskAnalysis(id);
          data = accountResult.data;
          break;
        case 'dashboard':
          const dashboardResult = await IntegrationService.getRiskDashboard();
          data = dashboardResult.data;
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid type. Must be location, account, or dashboard'
          });
      }

      // Remove raw data if not requested
      if (!includeRawData && data.rawData) {
        delete data.rawData;
      }

      // Set appropriate headers based on format
      const filename = `risk_data_${type}_${id}_${new Date().toISOString().split('T')[0]}`;
      
      switch (format) {
        case 'csv':
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
          res.send(convertToCSV(data));
          break;
        case 'xml':
          res.setHeader('Content-Type', 'application/xml');
          res.setHeader('Content-Disposition', `attachment; filename="${filename}.xml"`);
          res.send(convertToXML(data));
          break;
        default: // json
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
          res.json(data);
      }
    } catch (error) {
      console.error('Error in exportRiskData:', error);
      res.status(500).json({
        success: false,
        message: 'Error exporting risk data',
        error: error.message
      });
    }
  }
}

// Helper functions

function calculateComparisonMetrics(comparisonResults) {
  const riskScores = comparisonResults.map(r => r.riskAssessment.riskMetrics.combinedRiskScore);
  const exposures = comparisonResults.map(r => r.riskAssessment.riskMetrics.totalExposure);
  
  const highestRisk = Math.max(...riskScores);
  const lowestRisk = Math.min(...riskScores);
  const averageRisk = riskScores.reduce((sum, score) => sum + score, 0) / riskScores.length;
  
  const highestExposure = Math.max(...exposures);
  const lowestExposure = Math.min(...exposures);
  const averageExposure = exposures.reduce((sum, exp) => sum + exp, 0) / exposures.length;

  return {
    highestRisk,
    lowestRisk,
    averageRisk,
    highestExposure,
    lowestExposure,
    averageExposure,
    riskRange: highestRisk - lowestRisk,
    exposureRange: highestExposure - lowestExposure
  };
}

function generateMockTrendData(timeRange, granularity) {
  const data = [];
  const now = new Date();
  const months = timeRange === '1y' ? 12 : timeRange === '6m' ? 6 : 3;
  
  for (let i = months; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    data.push({
      date: date.toISOString().split('T')[0],
      riskScore: 3 + Math.random() * 4, // 3-7 range
      exposure: 1000000 + Math.random() * 5000000, // 1M-6M range
      hazards: Math.floor(Math.random() * 10),
      vulnerabilities: Math.floor(Math.random() * 5)
    });
  }
  
  return data;
}

function generateMockAlerts(accountId, severity, limit) {
  const alerts = [];
  const alertTypes = ['High Risk Location', 'Vulnerability Update', 'Hazard Alert', 'Exposure Limit'];
  const severities = ['low', 'medium', 'high', 'critical'];
  
  for (let i = 0; i < Math.min(limit, 20); i++) {
    const alertSeverity = severities[Math.floor(Math.random() * severities.length)];
    if (severity !== 'all' && alertSeverity !== severity) continue;
    
    alerts.push({
      id: `alert_${Date.now()}_${i}`,
      type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
      severity: alertSeverity,
      message: `Alert message ${i + 1}`,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      accountId: accountId || null,
      acknowledged: Math.random() > 0.5
    });
  }
  
  return alerts.sort((a, b) => b.timestamp - a.timestamp);
}

function convertToCSV(data) {
  // Simple CSV conversion - in production, use a proper CSV library
  return JSON.stringify(data, null, 2);
}

function convertToXML(data) {
  // Simple XML conversion - in production, use a proper XML library
  return `<riskData>${JSON.stringify(data, null, 2)}</riskData>`;
}

module.exports = IntegrationController;
