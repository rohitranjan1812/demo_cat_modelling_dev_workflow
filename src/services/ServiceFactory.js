/**
 * ServiceFactory - Centralized Service Creation and Dependency Injection
 * 
 * Provides factory pattern for consistent service initialization across the system.
 * Manages dependencies and enables proper mocking for tests.
 * 
 * Author: System Architecture Team
 * Created: 2025-10-12
 * Version: 1.0.0
 */

const CATSimulationEngine = require('./CATSimulationEngine');
const IntegrationService = require('./IntegrationService');
const FinancialCalculationService = require('./FinancialCalculationService');
const ProbabilityDistributionService = require('./ProbabilityDistributionService');

class ServiceFactory {
  constructor() {
    this.services = new Map();
    this.config = {
      enableCaching: true,
      enableTransactions: false // Will be enabled in Phase 1.4
    };
  }

  /**
   * Creates or returns cached service instance
   * @param {string} serviceName - Name of the service to create
   * @param {Object} options - Service-specific options
   * @returns {Object} Service instance
   */
  getService(serviceName, options = {}) {
    const cacheKey = `${serviceName}_${JSON.stringify(options)}`;
    
    if (this.config.enableCaching && this.services.has(cacheKey)) {
      return this.services.get(cacheKey);
    }

    let service;
    switch (serviceName) {
      case 'CATSimulationEngine':
        service = this.createCATSimulationEngine(options);
        break;
      case 'IntegrationService':
        service = this.createIntegrationService(options);
        break;
      case 'FinancialCalculationService':
        service = this.createFinancialCalculationService(options);
        break;
      case 'ProbabilityDistributionService':
        service = this.createProbabilityDistributionService(options);
        break;
      default:
        throw new Error(`Unknown service: ${serviceName}`);
    }

    if (this.config.enableCaching) {
      this.services.set(cacheKey, service);
    }

    return service;
  }

  /**
   * Creates CATSimulationEngine with all required dependencies
   * @param {Object} options - Configuration options
   * @returns {CATSimulationEngine} Configured simulation engine
   */
  createCATSimulationEngine(options = {}) {
    const dependencies = {
      integrationService: options.integrationService || this.getService('IntegrationService'),
      financialService: options.financialService || this.getService('FinancialCalculationService'),
      probabilityService: options.probabilityService || this.getService('ProbabilityDistributionService'),
      config: {
        enableLogging: options.enableLogging !== false,
        enableMetrics: options.enableMetrics !== false,
        maxConcurrentSimulations: options.maxConcurrentSimulations || 10,
        ...options.config
      }
    };

    return new CATSimulationEngine(dependencies);
  }

  /**
   * Creates IntegrationService with dependencies
   * @param {Object} options - Configuration options
   * @returns {IntegrationService} Configured integration service
   */
  createIntegrationService(options = {}) {
    const dependencies = {
      financialCalculationService: options.financialCalculationService,
      exposureDataService: options.exposureDataService,
      hazardService: options.hazardService,
      vulnerabilityService: options.vulnerabilityService,
      config: {
        maxRetryAttempts: options.maxRetryAttempts || 3,
        timeoutMs: options.timeoutMs || 30000,
        batchSize: options.batchSize || 1000,
        ...options.config
      }
    };

    return new IntegrationService(dependencies);
  }

  /**
   * Creates FinancialCalculationService
   * @param {Object} options - Configuration options
   * @returns {FinancialCalculationService} Configured financial service
   */
  createFinancialCalculationService(options = {}) {
    const dependencies = {
      config: {
        defaultConfidenceLevel: options.defaultConfidenceLevel || 0.95,
        enableCaching: options.enableCaching !== false,
        precision: options.precision || 6,
        ...options.config
      }
    };

    return new FinancialCalculationService(dependencies);
  }

  /**
   * Creates ProbabilityDistributionService
   * @param {Object} options - Configuration options
   * @returns {ProbabilityDistributionService} Configured probability service
   */
  createProbabilityDistributionService(options = {}) {
    return new ProbabilityDistributionService(options);
  }

  /**
   * Creates service with mock dependencies for testing
   * @param {string} serviceName - Name of the service to create
   * @param {Object} mocks - Mock implementations
   * @param {Object} options - Additional options
   * @returns {Object} Service with mocked dependencies
   */
  createMockService(serviceName, mocks = {}, options = {}) {
    const mockOptions = {
      ...options,
      integrationService: mocks.integrationService,
      financialService: mocks.financialService,
      probabilityService: mocks.probabilityService,
      config: {
        enableCaching: false, // Disable caching for tests
        ...options.config
      }
    };

    return this.getService(serviceName, mockOptions);
  }

  /**
   * Clears the service cache
   */
  clearCache() {
    this.services.clear();
  }

  /**
   * Sets factory configuration
   * @param {Object} config - Factory configuration
   */
  configure(config) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Gets all registered services (for debugging)
   * @returns {Array} Array of service cache keys
   */
  getRegisteredServices() {
    return Array.from(this.services.keys());
  }
}

// Export singleton instance
module.exports = new ServiceFactory();