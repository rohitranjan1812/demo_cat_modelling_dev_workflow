/**
 * Service Registry
 * Central registry for all application services with dependency management
 */

const DIContainer = require('./DIContainer');

// Service imports
const ProbabilityDistributionService = require('../services/ProbabilityDistributionService');
const FinancialCalculationService = require('../services/FinancialCalculationService');
const BaseService = require('../services/BaseService');

// Import services that need registration
const HazardService = require('../services/HazardService');
const VulnerabilityService = require('../services/VulnerabilityService');
const AccountService = require('../services/AccountService');
const ExposureService = require('../services/ExposureService');
const IntegrationService = require('../services/IntegrationService');
const SimulationService = require('../services/SimulationService');
const CATSimulationEngine = require('../services/CATSimulationEngine');

class ServiceRegistry {
  static initialized = false;

  /**
   * Initialize all services and register with DI container
   */
  static initialize() {
    if (this.initialized) {
      console.log('ServiceRegistry already initialized');
      return;
    }

    console.log('Initializing ServiceRegistry...');

    try {
      // Register core utility services first (no dependencies)
      DIContainer.registerSingleton('probabilityDistribution', () => {
        return new ProbabilityDistributionService();
      }, []);

      DIContainer.registerSingleton('financialCalculation', () => {
        return new FinancialCalculationService();
      }, []);

      // Register data services (no inter-dependencies)
      DIContainer.registerSingleton('hazard', () => {
        return new HazardService();
      }, []);

      DIContainer.registerSingleton('vulnerability', () => {
        return new VulnerabilityService();
      }, []);

      DIContainer.registerSingleton('account', () => {
        return new AccountService();
      }, []);

      DIContainer.registerSingleton('exposure', () => {
        return new ExposureService();
      }, []);

      // Register integration service (depends on data services)
      DIContainer.registerSingleton('integration', () => {
        const hazardService = DIContainer.resolve('hazard');
        const vulnerabilityService = DIContainer.resolve('vulnerability');
        const accountService = DIContainer.resolve('account');
        const exposureService = DIContainer.resolve('exposure');
        
        return new IntegrationService(
          hazardService,
          vulnerabilityService,
          accountService,
          exposureService
        );
      }, ['hazard', 'vulnerability', 'account', 'exposure']);

      // Register simulation engine (depends on integration and financial services)
      DIContainer.registerSingleton('simulationEngine', () => {
        const integrationService = DIContainer.resolve('integration');
        const financialService = DIContainer.resolve('financialCalculation');
        const probabilityService = DIContainer.resolve('probabilityDistribution');
        
        return new CATSimulationEngine(
          integrationService,
          financialService,
          probabilityService
        );
      }, ['integration', 'financialCalculation', 'probabilityDistribution']);

      // Register simulation service (depends on engine)
      DIContainer.registerSingleton('simulation', () => {
        const simulationEngine = DIContainer.resolve('simulationEngine');
        const financialService = DIContainer.resolve('financialCalculation');
        const integrationService = DIContainer.resolve('integration');
        
        return new SimulationService(
          simulationEngine,
          financialService,
          integrationService
        );
      }, ['simulationEngine', 'financialCalculation', 'integration']);

      this.initialized = true;
      console.log('ServiceRegistry initialized successfully');
      console.log('Registered services:', DIContainer.getRegisteredServices());
    } catch (error) {
      console.error('Failed to initialize ServiceRegistry:', error);
      throw error;
    }
  }

  /**
   * Get a service instance
   * @param {string} serviceName - Name of the service
   * @returns {*} Service instance
   */
  static get(serviceName) {
    if (!this.initialized) {
      throw new Error('ServiceRegistry not initialized. Call ServiceRegistry.initialize() first.');
    }

    return DIContainer.resolve(serviceName);
  }

  /**
   * Check if registry is initialized
   * @returns {boolean}
   */
  static isInitialized() {
    return this.initialized;
  }

  /**
   * Reset the registry (useful for testing)
   */
  static reset() {
    DIContainer.clear();
    this.initialized = false;
  }

  /**
   * Get health status of all services
   * @returns {Object} Health status
   */
  static getHealthStatus() {
    return DIContainer.getHealthStatus();
  }

  /**
   * Validate all services can be instantiated
   * @returns {Object} Validation results
   */
  static async validateServices() {
    const results = {
      success: true,
      services: {},
      errors: []
    };

    const serviceNames = DIContainer.getRegisteredServices();

    for (const name of serviceNames) {
      try {
        const service = DIContainer.resolve(name);
        results.services[name] = {
          status: 'OK',
          type: service.constructor.name
        };
      } catch (error) {
        results.success = false;
        results.services[name] = {
          status: 'ERROR',
          error: error.message
        };
        results.errors.push({ service: name, error: error.message });
      }
    }

    return results;
  }
}

module.exports = ServiceRegistry;
