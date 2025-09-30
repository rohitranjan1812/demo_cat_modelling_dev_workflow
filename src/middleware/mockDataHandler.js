/**
 * Mock Data Handler Middleware
 * Returns empty/sample data when mock database mode is enabled
 */

const useMockDB = process.env.USE_MOCK_DB === 'true';

/**
 * Wraps a controller function to return mock data when in mock DB mode
 */
function withMockData(controllerFn, mockResponseFn) {
  return async (req, res, next) => {
    if (useMockDB) {
      try {
        const mockResponse = mockResponseFn(req);
        return res.json(mockResponse);
      } catch (error) {
        console.error('Error in mock data handler:', error);
        return res.status(500).json({
          success: false,
          message: 'Error in mock mode',
          error: error.message
        });
      }
    }
    
    // If not in mock mode, call the actual controller
    return controllerFn(req, res, next);
  };
}

/**
 * Generate mock responses for different endpoints
 */
const mockResponses = {
  // Empty list response
  emptyList: (req) => ({
    success: true,
    data: [],
    pagination: {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      total: 0,
      pages: 0
    }
  }),
  
  // Empty statistics response
  emptyStats: () => ({
    success: true,
    data: {
      total: 0,
      byType: {},
      bySeverity: {},
      byStatus: {},
      byRegion: {}
    }
  }),
  
  // Empty dashboard response
  emptyDashboard: () => ({
    success: true,
    data: {
      totalRuns: 0,
      activeRuns: 0,
      completedRuns: 0,
      failedRuns: 0,
      avgDuration: 0,
      recentRuns: []
    }
  }),
  
  // Risk dashboard with sample data
  riskDashboard: () => ({
    success: true,
    data: {
      totalHazards: 0,
      totalVulnerabilities: 0,
      totalAccounts: 0,
      totalExposure: 0,
      averageRiskScore: 0,
      highRiskLocations: 0,
      recentAlerts: []
    }
  }),
  
  // Empty integration response
  emptyIntegration: () => ({
    success: true,
    data: {
      analysis: {
        hazards: 0,
        vulnerabilities: 0,
        accounts: 0
      },
      riskMetrics: {
        combinedRiskScore: 0,
        overallRiskLevel: 'Very Low',
        totalExposure: 0
      },
      recommendations: []
    }
  }),
  
  // Account risk analysis
  accountRisk: (req) => ({
    success: true,
    data: {
      accountId: req.params.accountId,
      riskScore: 0,
      exposure: 0,
      hazards: [],
      vulnerabilities: []
    }
  }),
  
  // Location risk assessment
  locationRisk: (req) => ({
    success: true,
    data: {
      location: {
        latitude: parseFloat(req.query.latitude) || 0,
        longitude: parseFloat(req.query.longitude) || 0
      },
      analysis: {
        hazards: 0,
        vulnerabilities: 0,
        accounts: 0
      },
      riskMetrics: {
        hazardRiskScore: 0,
        vulnerabilityRiskScore: 0,
        combinedRiskScore: 0,
        overallRiskLevel: 'Very Low',
        totalExposure: 0,
        currency: req.query.currency || 'USD'
      },
      recommendations: [{
        type: 'Info',
        priority: 'Low',
        message: 'Mock database mode - no real data available',
        actions: ['Switch to MongoDB for real data']
      }]
    }
  })
};

module.exports = {
  withMockData,
  mockResponses,
  useMockDB
};
