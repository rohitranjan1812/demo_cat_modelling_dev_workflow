/**
 * Account Service for CAT Modeling Platform
 * Handles all account-related business logic and database operations
 */

const { repositories } = require('../repositories');
const Account = require('../models/Account');
const Hazard = require('../models/Hazard');
const Vulnerability = require('../models/Vulnerability');

class AccountService {
  constructor() {
    // AccountService can use location repository for geographic queries
    this.locationRepository = repositories.location;
    this.hazardRepository = repositories.hazard;
    this.vulnerabilityRepository = repositories.vulnerability;
  }

  /**
   * Get accounts with advanced filtering
   * @param {Object} filters - Filter parameters
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Filtered accounts with pagination
   */
  async getAccounts(filters = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        accountType,
        status = 'Active',
        region,
        minExposure,
        maxExposure,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = { ...filters, ...options };

      // Build filter object
      const filter = { status };
      
      if (accountType) filter.accountType = accountType;
      if (region) filter.regions = region;
      
      if (minExposure || maxExposure) {
        filter.totalExposure = {};
        if (minExposure) filter.totalExposure.$gte = parseFloat(minExposure);
        if (maxExposure) filter.totalExposure.$lte = parseFloat(maxExposure);
      }

      // Add search functionality
      if (search) {
        filter.$or = [
          { accountName: { $regex: search, $options: 'i' } },
          { accountId: { $regex: search, $options: 'i' } },
          { organization: { $regex: search, $options: 'i' } }
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

      return this.createSuccessResponse(result, 'Accounts retrieved successfully');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get account by ID with full details
   * @param {string} id - Account ID
   * @returns {Promise<Object>} Account details
   */
  async getAccountById(id) {
    try {
      const account = await this.findById(id);

      if (!account) {
        throw new Error('Account not found');
      }

      // Get risk metrics
      const riskMetrics = await this.calculateRiskMetrics(account);

      const accountDetails = {
        ...account.toObject(),
        riskMetrics
      };

      return this.createSuccessResponse(accountDetails, 'Account details retrieved successfully');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create a new account
   * @param {Object} accountData - Account data
   * @param {string} userId - User ID creating the account
   * @returns {Promise<Object>} Created account
   */
  async createAccount(accountData, userId) {
    try {
      // Generate account ID
      const accountCount = await this.count();
      const accountId = `ACC-${(accountCount + 1).toString().padStart(8, '0')}`;

      const newAccountData = {
        ...accountData,
        accountId,
        createdBy: userId,
        lastModifiedBy: userId,
        status: 'Active'
      };

      // Validate required fields
      const validation = await this.validate(newAccountData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
      }

      const account = await this.create(newAccountData);

      return this.createSuccessResponse(account, 'Account created successfully');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update account
   * @param {string} id - Account ID
   * @param {Object} updateData - Update data
   * @param {string} userId - User ID updating the account
   * @returns {Promise<Object>} Updated account
   */
  async updateAccount(id, updateData, userId) {
    try {
      const updatePayload = {
        ...updateData,
        lastModifiedBy: userId,
        updatedAt: new Date()
      };

      const updatedAccount = await this.updateById(id, updatePayload);

      if (!updatedAccount) {
        throw new Error('Account not found');
      }

      return this.createSuccessResponse(updatedAccount, 'Account updated successfully');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete account (soft delete)
   * @param {string} id - Account ID
   * @param {string} userId - User ID deleting the account
   * @returns {Promise<Object>} Deletion result
   */
  async deleteAccount(id, userId) {
    try {
      const deletedAccount = await this.deleteById(id, { soft: true });

      if (!deletedAccount) {
        throw new Error('Account not found');
      }

      return this.createSuccessResponse(
        { id: deletedAccount._id, status: 'deleted' },
        'Account deleted successfully'
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Calculate risk metrics for an account
   * @param {Object} account - Account object
   * @returns {Promise<Object>} Risk metrics
   */
  async calculateRiskMetrics(account) {
    try {
      // Get hazards affecting this account's regions
      const hazards = await Hazard.find({
        affectedRegions: { $in: account.regions },
        status: 'Active'
      });

      // Get vulnerabilities affecting this account's regions
      const vulnerabilities = await Vulnerability.find({
        'geographicScope.regions': { $in: account.regions },
        status: 'Active'
      });

      // Calculate exposure metrics
      const totalHazardExposure = hazards.reduce((sum, hazard) => {
        return sum + (hazard.economicImpact?.[0]?.estimatedLoss || 0);
      }, 0);

      const averageVulnerabilityScore = vulnerabilities.length > 0 
        ? vulnerabilities.reduce((sum, vuln) => sum + vuln.overallVulnerabilityScore, 0) / vulnerabilities.length
        : 0;

      // Calculate risk score
      const riskScore = (totalHazardExposure / account.totalExposure) * (averageVulnerabilityScore / 10);

      return {
        totalHazardExposure,
        affectedHazards: hazards.length,
        affectedVulnerabilities: vulnerabilities.length,
        averageVulnerabilityScore,
        riskScore,
        riskLevel: this.getRiskLevel(riskScore),
        exposureRatio: totalHazardExposure / account.totalExposure
      };
    } catch (error) {
      console.error('Error calculating risk metrics:', error);
      return {
        totalHazardExposure: 0,
        affectedHazards: 0,
        affectedVulnerabilities: 0,
        averageVulnerabilityScore: 0,
        riskScore: 0,
        riskLevel: 'Low',
        exposureRatio: 0
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
   * Get account statistics
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Account statistics
   */
  async getAccountStatistics(filters = {}) {
    try {
      const stats = await this.getStatistics(filters, ['accountType', 'status']);
      
      // Get additional metrics
      const totalAccounts = await this.count(filters);
      const activeAccounts = await this.count({ ...filters, status: 'Active' });
      
      // Calculate total exposure
      const exposureStats = await this.aggregate([
        { $match: filters },
        {
          $group: {
            _id: null,
            totalExposure: { $sum: '$totalExposure' },
            averageExposure: { $avg: '$totalExposure' },
            maxExposure: { $max: '$totalExposure' },
            minExposure: { $min: '$totalExposure' }
          }
        }
      ]);

      return this.createSuccessResponse({
        totalAccounts,
        activeAccounts,
        exposureStats: exposureStats[0] || {
          totalExposure: 0,
          averageExposure: 0,
          maxExposure: 0,
          minExposure: 0
        },
        breakdown: stats
      }, 'Account statistics retrieved successfully');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Search accounts by text
   * @param {string} searchTerm - Search term
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Search results
   */
  async searchAccounts(searchTerm, options = {}) {
    try {
      const searchFields = ['accountName', 'accountId', 'organization'];
      const result = await this.search(searchTerm, searchFields, options);

      return this.createSuccessResponse(result, 'Account search completed successfully');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get accounts by region
   * @param {string} region - Region name
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Accounts in region
   */
  async getAccountsByRegion(region, options = {}) {
    try {
      const filter = { regions: region, status: 'Active' };
      const result = await this.find(filter, options);

      return this.createSuccessResponse(result, `Accounts in ${region} retrieved successfully`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get accounts by exposure range
   * @param {Object} exposureRange - Exposure range
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Accounts in exposure range
   */
  async getAccountsByExposure(exposureRange, options = {}) {
    try {
      const { minExposure, maxExposure } = exposureRange;
      const filter = { status: 'Active' };

      if (minExposure !== undefined || maxExposure !== undefined) {
        filter.totalExposure = {};
        if (minExposure !== undefined) filter.totalExposure.$gte = minExposure;
        if (maxExposure !== undefined) filter.totalExposure.$lte = maxExposure;
      }

      const result = await this.find(filter, options);

      return this.createSuccessResponse(result, 'Accounts by exposure range retrieved successfully');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get high-risk accounts
   * @param {Object} options - Query options
   * @returns {Promise<Object>} High-risk accounts
   */
  async getHighRiskAccounts(options = {}) {
    try {
      // Get all accounts and calculate their risk scores
      const accounts = await this.find({ status: 'Active' }, { limit: 1000 });
      
      const accountsWithRisk = await Promise.all(
        accounts.data.map(async (account) => {
          const riskMetrics = await this.calculateRiskMetrics(account);
          return {
            ...account.toObject(),
            riskMetrics
          };
        })
      );

      // Filter high-risk accounts (risk score >= 5)
      const highRiskAccounts = accountsWithRisk.filter(
        account => account.riskMetrics.riskScore >= 5
      );

      // Sort by risk score
      highRiskAccounts.sort((a, b) => b.riskMetrics.riskScore - a.riskMetrics.riskScore);

      return this.createSuccessResponse({
        data: highRiskAccounts,
        pagination: {
          page: 1,
          limit: highRiskAccounts.length,
          total: highRiskAccounts.length,
          pages: 1
        }
      }, 'High-risk accounts retrieved successfully');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get account portfolio analysis
   * @param {string} accountId - Account ID
   * @returns {Promise<Object>} Portfolio analysis
   */
  async getAccountPortfolioAnalysis(accountId) {
    try {
      const account = await this.findById(accountId);
      if (!account) {
        throw new Error('Account not found');
      }

      // Get all hazards and vulnerabilities affecting this account
      const hazards = await Hazard.find({
        affectedRegions: { $in: account.regions },
        status: 'Active'
      });

      const vulnerabilities = await Vulnerability.find({
        'geographicScope.regions': { $in: account.regions },
        status: 'Active'
      });

      // Calculate portfolio metrics
      const portfolioAnalysis = {
        account: {
          id: account._id,
          name: account.accountName,
          type: account.accountType,
          totalExposure: account.totalExposure,
          regions: account.regions
        },
        riskExposure: {
          totalHazardExposure: hazards.reduce((sum, h) => sum + (h.economicImpact?.[0]?.estimatedLoss || 0), 0),
          totalVulnerabilityExposure: vulnerabilities.reduce((sum, v) => sum + (v.overallVulnerabilityScore * 1000000), 0),
          exposureRatio: 0
        },
        hazardAnalysis: {
          totalHazards: hazards.length,
          byType: this.groupByField(hazards, 'hazardType'),
          byCategory: this.groupByField(hazards, 'hazardCategory'),
          bySeverity: this.groupByField(hazards, 'severity')
        },
        vulnerabilityAnalysis: {
          totalVulnerabilities: vulnerabilities.length,
          byType: this.groupByField(vulnerabilities, 'vulnerabilityType'),
          byCategory: this.groupByField(vulnerabilities, 'vulnerabilityCategory'),
          byRiskLevel: this.groupByField(vulnerabilities, 'overallRiskLevel')
        },
        recommendations: this.generateRecommendations(account, hazards, vulnerabilities)
      };

      // Calculate exposure ratio
      portfolioAnalysis.riskExposure.exposureRatio = 
        portfolioAnalysis.riskExposure.totalHazardExposure / account.totalExposure;

      return this.createSuccessResponse(portfolioAnalysis, 'Portfolio analysis completed successfully');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Group array by field
   * @param {Array} array - Array to group
   * @param {string} field - Field to group by
   * @returns {Object} Grouped data
   */
  groupByField(array, field) {
    return array.reduce((groups, item) => {
      const key = item[field] || 'Unknown';
      groups[key] = (groups[key] || 0) + 1;
      return groups;
    }, {});
  }

  /**
   * Generate recommendations for account
   * @param {Object} account - Account object
   * @param {Array} hazards - Affecting hazards
   * @param {Array} vulnerabilities - Affecting vulnerabilities
   * @returns {Array} Recommendations
   */
  generateRecommendations(account, hazards, vulnerabilities) {
    const recommendations = [];

    // High exposure recommendation
    const totalHazardExposure = hazards.reduce((sum, h) => sum + (h.economicImpact?.[0]?.estimatedLoss || 0), 0);
    if (totalHazardExposure > account.totalExposure * 0.5) {
      recommendations.push({
        type: 'exposure',
        priority: 'High',
        title: 'High Hazard Exposure',
        description: `Account has ${((totalHazardExposure / account.totalExposure) * 100).toFixed(1)}% exposure to hazards`,
        action: 'Consider diversifying portfolio or increasing insurance coverage'
      });
    }

    // High vulnerability recommendation
    const highRiskVulnerabilities = vulnerabilities.filter(v => v.overallRiskLevel === 'High' || v.overallRiskLevel === 'Very High');
    if (highRiskVulnerabilities.length > 0) {
      recommendations.push({
        type: 'vulnerability',
        priority: 'Medium',
        title: 'High Vulnerability Risk',
        description: `${highRiskVulnerabilities.length} high-risk vulnerabilities affecting this account`,
        action: 'Review and address vulnerability factors'
      });
    }

    // Geographic concentration recommendation
    if (account.regions.length === 1) {
      recommendations.push({
        type: 'concentration',
        priority: 'Medium',
        title: 'Geographic Concentration',
        description: 'Account is concentrated in a single region',
        action: 'Consider diversifying across multiple regions'
      });
    }

    return recommendations;
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
    console.error('AccountService Error:', error);
    
    // Return a standardized error
    const formattedError = new Error(error.message || 'An error occurred in AccountService');
    formattedError.statusCode = error.statusCode || 500;
    formattedError.service = 'AccountService';
    
    return formattedError;
  }
}

module.exports = AccountService;

module.exports = AccountService;
