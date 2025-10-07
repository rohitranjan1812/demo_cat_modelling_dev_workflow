/**
 * Dependency Injection Container
 * Manages service lifecycle and dependency resolution
 */

class DIContainer {
  constructor() {
    this.services = new Map();
    this.singletons = new Map();
    this.factories = new Map();
  }

  /**
   * Register a service with the container
   * @param {string} name - Service name
   * @param {Function} factory - Factory function to create service instance
   * @param {Object} options - Configuration options
   * @param {boolean} options.singleton - Whether to create as singleton
   * @param {Array<string>} options.dependencies - Array of dependency names
   */
  register(name, factory, options = {}) {
    if (this.services.has(name)) {
      throw new Error(`Service '${name}' is already registered`);
    }

    this.services.set(name, {
      factory,
      singleton: options.singleton !== undefined ? options.singleton : true,
      dependencies: options.dependencies || []
    });
  }

  /**
   * Register a factory function (non-singleton)
   * @param {string} name - Service name
   * @param {Function} factory - Factory function
   */
  registerFactory(name, factory) {
    this.register(name, factory, { singleton: false });
  }

  /**
   * Register a singleton service
   * @param {string} name - Service name
   * @param {Function} factory - Factory function
   * @param {Array<string>} dependencies - Dependency names
   */
  registerSingleton(name, factory, dependencies = []) {
    this.register(name, factory, { singleton: true, dependencies });
  }

  /**
   * Resolve a service by name
   * @param {string} name - Service name
   * @returns {*} Service instance
   */
  resolve(name) {
    const serviceConfig = this.services.get(name);
    
    if (!serviceConfig) {
      throw new Error(`Service '${name}' not found. Did you forget to register it?`);
    }

    // Return cached singleton if available
    if (serviceConfig.singleton && this.singletons.has(name)) {
      return this.singletons.get(name);
    }

    // Resolve dependencies
    const resolvedDependencies = serviceConfig.dependencies.map(dep => {
      try {
        return this.resolve(dep);
      } catch (error) {
        throw new Error(`Failed to resolve dependency '${dep}' for service '${name}': ${error.message}`);
      }
    });

    // Create service instance
    let instance;
    try {
      instance = serviceConfig.factory(...resolvedDependencies);
    } catch (error) {
      throw new Error(`Failed to create instance of service '${name}': ${error.message}`);
    }

    // Cache singleton
    if (serviceConfig.singleton) {
      this.singletons.set(name, instance);
    }

    return instance;
  }

  /**
   * Check if a service is registered
   * @param {string} name - Service name
   * @returns {boolean} True if service is registered
   */
  has(name) {
    return this.services.has(name);
  }

  /**
   * Clear all singleton instances (useful for testing)
   */
  clearSingletons() {
    this.singletons.clear();
  }

  /**
   * Clear everything (useful for testing)
   */
  clear() {
    this.services.clear();
    this.singletons.clear();
    this.factories.clear();
  }

  /**
   * Get list of all registered service names
   * @returns {Array<string>} Service names
   */
  getRegisteredServices() {
    return Array.from(this.services.keys());
  }

  /**
   * Get service health status
   * @returns {Object} Health status of all services
   */
  getHealthStatus() {
    const status = {};
    
    for (const [name, config] of this.services.entries()) {
      status[name] = {
        registered: true,
        singleton: config.singleton,
        instantiated: this.singletons.has(name),
        dependencies: config.dependencies
      };
    }
    
    return status;
  }
}

// Export singleton instance
module.exports = new DIContainer();
