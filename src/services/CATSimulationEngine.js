const SimulationEvent = require('../models/SimulationEvent');
const SimulationRun = require('../models/SimulationRun');
const Hazard = require('../models/Hazard');
const Account = require('../models/Account');
const Vulnerability = require('../models/Vulnerability');
const ProbabilityDistributionService = require('./ProbabilityDistributionService');
const IntegrationService = require('./IntegrationService');

/**
 * Comprehensive CAT Simulation Engine
 * Generates massive volumes of simulation data across thousands of years
 * with advanced probability distributions and financial modeling
 */
class CATSimulationEngine {
  constructor(integrationService = null, financialService = null) {
    this.probService = new ProbabilityDistributionService();
    this.integrationService = integrationService || IntegrationService;
    this.financialService = financialService;
    this.runningSimulations = new Map();
  }

  /**
   * Start a new simulation run
   * @param {Object} config - Simulation configuration
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Simulation run information
   */
  async startSimulation(config, userId) {
    try {
      // Create simulation run record
      const simulationRun = new SimulationRun({
        simulationRunId: this.generateSimulationRunId(),
        simulationName: config.simulationName || 'CAT Simulation',
        simulationDescription: config.simulationDescription || 'Comprehensive CAT simulation',
        configuration: {
          startYear: config.startYear,
          endYear: config.endYear,
          timeHorizon: config.timeHorizon,
          timeHorizonUnit: config.timeHorizonUnit,
          hazardTypes: config.hazardTypes || [],
          geographicScope: config.geographicScope || {},
          exposureScope: config.exposureScope || {},
          vulnerabilityScope: config.vulnerabilityScope || {},
          modelingConfig: {
            modelProvider: config.modelingConfig?.modelProvider || 'AIR',
            modelType: config.modelingConfig?.modelType || 'Probabilistic',
            resolution: config.modelingConfig?.resolution || 'High',
            numberOfSimulations: config.modelingConfig?.numberOfSimulations || 1000,
            probabilityDistributions: config.modelingConfig?.probabilityDistributions || {}
          },
          riskConfig: config.riskConfig || {}
        },
        createdBy: userId,
        lastModifiedBy: userId
      });

      await simulationRun.save();

      // Start simulation in background (don't wait for it)
      this.runSimulation(simulationRun.simulationRunId).catch(err => {
        console.error(`Background simulation ${simulationRun.simulationRunId} failed:`, err);
      });

      return {
        success: true,
        simulationRunId: simulationRun.simulationRunId,
        status: 'Started',
        message: 'Simulation started successfully'
      };
    } catch (error) {
      throw new Error(`Failed to start simulation: ${error.message}`);
    }
  }

  /**
   * Run the actual simulation
   * @param {string} simulationRunId - Simulation run ID
   */
  async runSimulation(simulationRunId) {
    try {
      const simulationRun = await SimulationRun.findOne({ simulationRunId });
      if (!simulationRun) {
        throw new Error('Simulation run not found');
      }

      simulationRun.startSimulation();
      await simulationRun.save();

      const config = simulationRun.configuration;
      const totalYears = config.endYear - config.startYear + 1;
      const totalEvents = config.modelingConfig.numberOfSimulations;
      
      let completedEvents = 0;
      const events = [];

      // Generate events for each year
      for (let year = config.startYear; year <= config.endYear; year++) {
        const yearEvents = await this.generateYearEvents(year, config, simulationRunId);
        events.push(...yearEvents);
        completedEvents += yearEvents.length;

        // Update progress
        const progress = Math.round((completedEvents / totalEvents) * 100);
        simulationRun.updateProgress(completedEvents, totalEvents, `Processing year ${year}`);
        await simulationRun.save();

        // Check if simulation was cancelled
        if (simulationRun.status === 'Cancelled') {
          return;
        }
      }

      // Calculate results
      const results = await this.calculateSimulationResults(events, config);
      
      // Complete simulation
      simulationRun.completeSimulation(results);
      await simulationRun.save();

      // Store events in database (don't crash if this fails)
      try {
        await this.storeSimulationEvents(events);
      } catch (storeError) {
        console.error('Warning: Failed to store simulation events:', storeError.message);
        // Continue anyway - results are already saved
      }

    } catch (error) {
      console.error('Error running simulation:', error);
      const simulationRun = await SimulationRun.findOne({ simulationRunId });
      if (simulationRun) {
        simulationRun.failSimulation(error.message, { stack: error.stack });
        await simulationRun.save();
      }
      throw error;
    }
  }

  /**
   * Generate events for a specific year
   * @param {number} year - Year to generate events for
   * @param {Object} config - Simulation configuration
   * @param {string} simulationRunId - Simulation run ID
   * @returns {Promise<Array>} Array of generated events
   */
  async generateYearEvents(year, config, simulationRunId) {
    const events = [];
    const hazardTypes = config.hazardTypes || await this.getAvailableHazardTypes();
    
    for (const hazardType of hazardTypes) {
      const hazardEvents = await this.generateHazardEvents(
        hazardType, 
        year, 
        config, 
        simulationRunId
      );
      events.push(...hazardEvents);
    }

    return events;
  }

  /**
   * Generate events for a specific hazard type
   * @param {string} hazardType - Type of hazard
   * @param {number} year - Year to generate events for
   * @param {Object} config - Simulation configuration
   * @param {string} simulationRunId - Simulation run ID
   * @returns {Promise<Array>} Array of generated events
   */
  async generateHazardEvents(hazardType, year, config, simulationRunId) {
    const events = [];
    
    // Get hazard frequency distribution
    const frequencyDist = this.getHazardFrequencyDistribution(hazardType, year);
    const numEvents = this.generateEventCount(frequencyDist);
    
    for (let i = 0; i < numEvents; i++) {
      const event = await this.generateSingleEvent(
        hazardType, 
        year, 
        config, 
        simulationRunId
      );
      events.push(event);
    }

    return events;
  }

  /**
   * Generate a single event
   * @param {string} hazardType - Type of hazard
   * @param {number} year - Year to generate event for
   * @param {Object} config - Simulation configuration
   * @param {string} simulationRunId - Simulation run ID
   * @returns {Promise<Object>} Generated event
   */
  async generateSingleEvent(hazardType, year, config, simulationRunId) {
    // Generate event characteristics
    const intensity = this.generateEventIntensity(hazardType, year);
    const severity = this.determineEventSeverity(intensity, hazardType);
    const probability = this.calculateEventProbability(intensity, hazardType);
    const returnPeriod = this.calculateReturnPeriod(probability);
    
    // Generate geographic impact
    const geographicImpact = await this.generateGeographicImpact(
      hazardType, 
      intensity, 
      config
    );
    
    // Generate financial impact
    const financialImpact = await this.generateFinancialImpact(
      hazardType, 
      intensity, 
      geographicImpact, 
      config
    );
    
    // Generate vulnerability impact
    const vulnerabilityImpact = await this.generateVulnerabilityImpact(
      hazardType, 
      geographicImpact, 
      config
    );
    
    // Generate exposure impact
    const exposureImpact = await this.generateExposureImpact(
      hazardType, 
      geographicImpact, 
      financialImpact, 
      config
    );
    
    // Calculate risk metrics
    const riskMetrics = this.calculateRiskMetrics(
      financialImpact, 
      exposureImpact, 
      vulnerabilityImpact
    );
    
    // Create event object
    const event = {
      eventId: this.generateEventId(),
      simulationRunId,
      eventName: `${hazardType} Event ${year}`,
      hazardType,
      hazardCategory: this.getHazardCategory(hazardType),
      severity,
      intensity: intensity.value,
      intensityScale: intensity.scale,
      probability,
      returnPeriod,
      returnPeriodUnit: 'years',
      eventYear: year,
      eventMonth: this.generateRandomMonth(),
      eventDay: this.generateRandomDay(),
      duration: this.generateEventDuration(hazardType, intensity),
      durationUnit: this.getDurationUnit(hazardType),
      geographicImpact,
      financialImpact,
      vulnerabilityImpact,
      exposureImpact,
      riskMetrics,
      modelData: {
        modelProvider: config.modelingConfig.modelProvider || 'Custom',
        modelVersion: config.modelingConfig.modelVersion || '1.0',
        modelType: config.modelingConfig.modelType || 'Probabilistic',
        resolution: config.modelingConfig.resolution || 'Medium',
        randomSeed: Math.floor(Math.random() * 1000000),
        probabilityDistribution: this.getProbabilityDistribution(hazardType),
        distributionParameters: this.getDistributionParameters(hazardType, intensity)
      },
      status: 'Generated',
      isSimulated: true,
      createdBy: config.createdBy || 'system',
      lastModifiedBy: config.createdBy || 'system'
    };

    return event;
  }

  /**
   * Generate event intensity using probability distributions
   * @param {string} hazardType - Type of hazard
   * @param {number} year - Year to generate event for
   * @returns {Object} Intensity object with value and scale
   */
  generateEventIntensity(hazardType, year) {
    const intensityConfig = this.getIntensityConfiguration(hazardType);
    const distribution = intensityConfig.distribution;
    const parameters = intensityConfig.parameters;
    
    // Apply climate change trends
    const climateTrend = this.getClimateChangeTrend(hazardType, year);
    const adjustedParameters = this.adjustParametersForClimate(parameters, climateTrend);
    
    // Generate intensity value
    const intensityValue = this.probService.generateSample(
      distribution, 
      adjustedParameters, 
      1
    )[0];
    
    return {
      value: Math.max(0, intensityValue),
      scale: intensityConfig.scale
    };
  }

  /**
   * Generate geographic impact for an event
   * @param {string} hazardType - Type of hazard
   * @param {Object} intensity - Event intensity
   * @param {Object} config - Simulation configuration
   * @returns {Promise<Array>} Array of geographic impact objects
   */
  async generateGeographicImpact(hazardType, intensity, config) {
    const impacts = [];
    const numLocations = this.generateNumberOfLocations(hazardType, intensity);
    
    for (let i = 0; i < numLocations; i++) {
      const location = this.generateRandomLocation(config);
      const impact = {
        affectedLatitude: location.latitude,
        affectedLongitude: location.longitude,
        affectedRadius: this.generateAffectedRadius(hazardType, intensity),
        radiusUnit: 'km',
        affectedArea: this.calculateAffectedArea(hazardType, intensity),
        areaUnit: 'km2',
        intensityAtLocation: this.calculateIntensityAtLocation(intensity, location),
        intensityScale: intensity.scale
      };
      impacts.push(impact);
    }
    
    return impacts;
  }

  /**
   * Generate financial impact for an event
   * @param {string} hazardType - Type of hazard
   * @param {Object} intensity - Event intensity
   * @param {Array} geographicImpact - Geographic impact array
   * @param {Object} config - Simulation configuration
   * @returns {Promise<Object>} Financial impact object
   */
  async generateFinancialImpact(hazardType, intensity, geographicImpact, config) {
    const baseLoss = this.calculateBaseLoss(hazardType, intensity);
    const directLoss = baseLoss * 0.7; // 70% direct loss
    const indirectLoss = baseLoss * 0.2; // 20% indirect loss
    const businessInterruptionLoss = baseLoss * 0.1; // 10% business interruption
    
    const totalLoss = directLoss + indirectLoss + businessInterruptionLoss;
    
    // Calculate confidence interval
    const confidenceInterval = this.calculateConfidenceInterval(totalLoss, 0.95);
    
    return {
      directLoss,
      indirectLoss,
      businessInterruptionLoss,
      totalLoss,
      currency: config.exposureScope.currency || 'USD',
      confidenceInterval
    };
  }

  /**
   * Generate vulnerability impact for an event using proper actuarial formula:
   * Loss = Hazard × Vulnerability × Exposure
   * @param {string} hazardType - Type of hazard
   * @param {Array} geographicImpact - Geographic impact array
   * @param {Object} config - Simulation configuration
   * @returns {Promise<Array>} Array of vulnerability impact objects
   */
  async generateVulnerabilityImpact(hazardType, geographicImpact, config) {
    const impacts = [];
    
    for (const geoImpact of geographicImpact) {
      // Get vulnerabilities affecting this location
      const vulnerabilities = await this.getVulnerabilitiesForLocation(
        geoImpact.affectedLatitude, 
        geoImpact.affectedLongitude, 
        { searchRadius: geoImpact.affectedRadius || 50, hazardTypes: [hazardType] }
      );
      
      // Get exposures at this location
      const exposures = await this.getExposuresForLocation(
        geoImpact.affectedLatitude, 
        geoImpact.affectedLongitude, 
        { searchRadius: geoImpact.affectedRadius || 50 }
      );
      
      for (const vuln of vulnerabilities) {
        for (const exposure of exposures) {
          // Calculate damage ratio using hazard intensity and vulnerability
          const damageRatio = this.calculateDamageRatio(
            hazardType,
            geoImpact.intensityAtLocation,
            vuln.overallVulnerabilityScore,
            exposure.assetCharacteristics
          );
          
          // Calculate gross loss: Hazard × Vulnerability × Exposure
          const hazardFactor = geoImpact.intensityAtLocation / 10; // Normalize to 0-1
          const vulnerabilityFactor = vuln.overallVulnerabilityScore; // Already 0-1
          const exposureValue = exposure.totalInsuredValue;
          
          const grossLoss = exposureValue * damageRatio;
          
          // Apply policy terms (deductibles, limits)
          const deductible = exposure.coverageDetails?.deductible || 0;
          const limit = exposure.coverageDetails?.limit || exposureValue;
          const coinsurance = (exposure.coverageDetails?.coinsurance || 100) / 100;
          
          // Calculate net loss after policy terms
          const lossAboveDeductible = Math.max(0, grossLoss - deductible);
          const lossWithinLimit = Math.min(lossAboveDeductible, limit);
          const netLoss = lossWithinLimit * coinsurance;
          
          impacts.push({
            vulnerabilityId: vuln.vulnerabilityId,
            exposureId: exposure.exposureId,
            accountId: exposure.accountId,
            policyId: exposure.policyId,
            vulnerabilityScore: vuln.overallVulnerabilityScore,
            hazardIntensity: geoImpact.intensityAtLocation,
            damageRatio,
            exposureValue,
            grossLoss,
            deductible,
            limit,
            coinsurance,
            netLoss,
            location: {
              latitude: geoImpact.affectedLatitude,
              longitude: geoImpact.affectedLongitude
            }
          });
        }
      }
    }
    
    return impacts;
  }

  /**
   * Calculate damage ratio using proper actuarial logic
   * Damage Ratio = f(Hazard Intensity, Vulnerability Score, Asset Characteristics)
   * @param {string} hazardType - Type of hazard
   * @param {number} hazardIntensity - Hazard intensity value
   * @param {number} vulnerabilityScore - Vulnerability score (0-1)
   * @param {Object} assetCharacteristics - Asset characteristics
   * @returns {number} Damage ratio (0-1)
   */
  calculateDamageRatio(hazardType, hazardIntensity, vulnerabilityScore, assetCharacteristics = {}) {
    // Normalize hazard intensity to 0-1 scale (assuming max intensity is 10)
    const normalizedIntensity = Math.min(hazardIntensity / 10, 1);
    
    // Base damage ratio from hazard and vulnerability
    let baseDamageRatio = normalizedIntensity * vulnerabilityScore;
    
    // Apply peril-specific damage functions
    switch (hazardType) {
      case 'Earthquake':
        // Earthquake damage is highly non-linear
        baseDamageRatio = Math.pow(normalizedIntensity, 2) * vulnerabilityScore;
        // Adjust for construction type
        if (assetCharacteristics.constructionType === 'Wood Frame') {
          baseDamageRatio *= 1.3;
        } else if (assetCharacteristics.constructionType === 'Concrete') {
          baseDamageRatio *= 0.7;
        }
        break;
        
      case 'Hurricane':
      case 'Typhoon':
      case 'Cyclone':
        // Wind damage increases exponentially with intensity
        baseDamageRatio = Math.pow(normalizedIntensity, 1.5) * vulnerabilityScore;
        // Adjust for roof type
        if (assetCharacteristics.roofType === 'Flat') {
          baseDamageRatio *= 1.2;
        }
        break;
        
      case 'Flood':
      case 'Flash Flood':
        // Flood damage is more linear but catastrophic at high levels
        baseDamageRatio = normalizedIntensity * vulnerabilityScore;
        // Adjust for basement presence
        if (assetCharacteristics.basementPresent) {
          baseDamageRatio *= 1.4;
        }
        // Adjust for number of stories (lower stories more vulnerable)
        if (assetCharacteristics.numberOfStories === 1) {
          baseDamageRatio *= 1.3;
        }
        break;
        
      case 'Wildfire':
      case 'Forest Fire':
      case 'Bushfire':
        // Wildfire damage tends to be total or minimal
        baseDamageRatio = normalizedIntensity > 0.6 ? 0.9 * vulnerabilityScore : 0.3 * vulnerabilityScore;
        // Adjust for construction type
        if (assetCharacteristics.constructionType === 'Wood Frame') {
          baseDamageRatio *= 1.5;
        }
        break;
        
      case 'Tornado':
        // Tornado damage is extreme but localized
        baseDamageRatio = Math.pow(normalizedIntensity, 2.5) * vulnerabilityScore;
        break;
        
      case 'Hail':
        // Hail damage primarily affects roof and exterior
        baseDamageRatio = normalizedIntensity * vulnerabilityScore * 0.6; // Typically partial damage
        break;
        
      default:
        // Default linear relationship
        baseDamageRatio = normalizedIntensity * vulnerabilityScore;
    }
    
    // Apply age factor if available
    if (assetCharacteristics.yearBuilt) {
      const age = new Date().getFullYear() - assetCharacteristics.yearBuilt;
      const ageFactor = 1 + (age / 100) * 0.2; // 20% increase per 100 years
      baseDamageRatio *= Math.min(ageFactor, 1.5); // Cap at 50% increase
    }
    
    // Ensure damage ratio is between 0 and 1
    return Math.max(0, Math.min(baseDamageRatio, 1));
  }

  /**
   * Generate exposure impact for an event using the Exposure model
   * This aggregates exposure data at the account level
   * @param {string} hazardType - Type of hazard
   * @param {Array} geographicImpact - Geographic impact array
   * @param {Object} financialImpact - Financial impact object
   * @param {Object} config - Simulation configuration
   * @returns {Promise<Array>} Array of exposure impact objects aggregated by account
   */
  async generateExposureImpact(hazardType, geographicImpact, financialImpact, config) {
    const impacts = [];
    const accountExposureMap = new Map();
    
    for (const geoImpact of geographicImpact) {
      // Get exposures at this location using the new Exposure model
      const exposures = await this.getExposuresForLocation(
        geoImpact.affectedLatitude, 
        geoImpact.affectedLongitude, 
        { searchRadius: geoImpact.affectedRadius || 50 }
      );
      
      for (const exposure of exposures) {
        const accountId = exposure.accountId;
        
        // Aggregate exposures by account
        if (!accountExposureMap.has(accountId)) {
          accountExposureMap.set(accountId, {
            accountId,
            policyId: exposure.policyId,
            exposureAmount: 0,
            totalExposures: 0,
            exposuresByType: {},
            exposureIds: []
          });
        }
        
        const accountData = accountExposureMap.get(accountId);
        accountData.exposureAmount += exposure.totalInsuredValue;
        accountData.totalExposures += 1;
        accountData.exposureIds.push(exposure.exposureId);
        
        // Track exposure by type
        const expType = exposure.exposureType;
        accountData.exposuresByType[expType] = 
          (accountData.exposuresByType[expType] || 0) + exposure.totalInsuredValue;
      }
    }
    
    // Convert map to array and calculate losses
    for (const [accountId, accountData] of accountExposureMap) {
      const exposureAmount = accountData.exposureAmount;
      const lossRatio = this.calculateLossRatio(hazardType, geographicImpact[0]?.intensityAtLocation || 5);
      const actualLoss = exposureAmount * lossRatio;
      
      // Use average deductible and limit (simplified for account-level aggregation)
      const deductible = exposureAmount * 0.05; // 5% deductible
      const limit = exposureAmount * 0.9; // 90% limit
      const netLoss = Math.max(0, Math.min(actualLoss - deductible, limit));
      
      impacts.push({
        accountId: accountData.accountId,
        policyId: accountData.policyId,
        exposureAmount,
        totalExposures: accountData.totalExposures,
        exposuresByType: accountData.exposuresByType,
        exposureIds: accountData.exposureIds,
        lossRatio,
        actualLoss,
        deductible,
        limit,
        netLoss
      });
    }
    
    return impacts;
  }

  /**
   * Calculate risk metrics for an event using proper financial calculations
   * @param {Object} financialImpact - Financial impact object
   * @param {Array} exposureImpact - Exposure impact array
   * @param {Array} vulnerabilityImpact - Vulnerability impact array
   * @returns {Object} Risk metrics object
   */
  calculateRiskMetrics(financialImpact, exposureImpact, vulnerabilityImpact) {
    const totalExposure = exposureImpact.reduce((sum, impact) => sum + impact.exposureAmount, 0);
    const totalLoss = financialImpact.totalLoss;
    
    // If financialService is available, use proper calculations
    if (this.financialService) {
      const lossData = [totalLoss];
      
      return {
        expectedLoss: this.financialService.calculateExpectedLoss(lossData),
        valueAtRisk: this.financialService.calculateValueAtRisk(lossData, 0.95),
        tailValueAtRisk: this.financialService.calculateTailValueAtRisk(lossData, 0.95),
        standardDeviation: this.financialService.calculateStandardDeviation ? 
          this.financialService.calculateStandardDeviation(lossData) : totalLoss * 0.3,
        riskAdjustedExposure: totalExposure * (1 + (totalLoss / Math.max(totalExposure, 1)) * 0.1),
        lossRatio: totalExposure > 0 ? totalLoss / totalExposure : 0,
        diversificationBenefit: this.calculateDiversificationBenefit(exposureImpact),
        concentrationRisk: this.calculateConcentrationRisk(exposureImpact)
      };
    }
    
    // Fallback to simplified calculations if financialService not available
    const expectedLoss = totalLoss * 0.8; // 80% of total loss as expected
    const valueAtRisk = totalLoss * 1.2; // 120% of total loss as VaR
    const tailValueAtRisk = totalLoss * 1.5; // 150% of total loss as TVaR
    const standardDeviation = totalLoss * 0.3; // 30% of total loss as std dev
    const riskAdjustedExposure = totalExposure * 1.1; // 10% adjustment
    const lossRatio = totalExposure > 0 ? totalLoss / totalExposure : 0;
    const diversificationBenefit = this.calculateDiversificationBenefit(exposureImpact);
    const concentrationRisk = this.calculateConcentrationRisk(exposureImpact);
    
    return {
      expectedLoss,
      valueAtRisk,
      tailValueAtRisk,
      standardDeviation,
      riskAdjustedExposure,
      lossRatio,
      diversificationBenefit,
      concentrationRisk
    };
  }

  /**
   * Calculate simulation results
   * @param {Array} events - Array of simulation events
   * @param {Object} config - Simulation configuration
   * @returns {Promise<Object>} Simulation results
   */
  async calculateSimulationResults(events, config) {
    const totalEvents = events.length;
    
    // Handle case where no events were generated
    if (totalEvents === 0) {
      return {
        totalEvents: 0,
        eventsByHazardType: new Map(),
        eventsBySeverity: new Map(),
        eventsByYear: new Map(),
        totalLoss: 0,
        averageLoss: 0,
        medianLoss: 0,
        maxLoss: 0,
        minLoss: 0,
        standardDeviation: 0,
        expectedLoss: 0,
        valueAtRisk: new Map([['95', 0], ['99', 0]]),
        tailValueAtRisk: new Map([['95', 0], ['99', 0]]),
        diversificationBenefit: 0,
        concentrationRisk: 0,
        affectedRegions: [],
        affectedCountries: [],
        vulnerabilityDistribution: new Map(),
        totalExposure: 0,
        averageExposure: 0,
        exposureDistribution: new Map()
      };
    }
    
    const totalLoss = events.reduce((sum, event) => sum + event.financialImpact.totalLoss, 0);
    const averageLoss = totalLoss / totalEvents;
    const maxLoss = Math.max(...events.map(event => event.financialImpact.totalLoss), 0);
    const minLoss = Math.min(...events.map(event => event.financialImpact.totalLoss), 0);
    
    // Calculate statistics by hazard type
    const eventsByHazardTypeMap = {};
    const eventsBySeverityMap = {};
    const eventsByYearMap = {};
    
    events.forEach(event => {
      eventsByHazardTypeMap[event.hazardType] = (eventsByHazardTypeMap[event.hazardType] || 0) + 1;
      eventsBySeverityMap[event.severity] = (eventsBySeverityMap[event.severity] || 0) + 1;
      eventsByYearMap[event.eventYear] = (eventsByYearMap[event.eventYear] || 0) + 1;
    });
    
    const eventsByHazardType = new Map(Object.entries(eventsByHazardTypeMap));
    const eventsBySeverity = new Map(Object.entries(eventsBySeverityMap));
    const eventsByYear = new Map(Object.entries(eventsByYearMap));
    
    // Calculate risk metrics
    const expectedLoss = events.reduce((sum, event) => sum + (event.riskMetrics?.expectedLoss || 0), 0);
    const diversificationBenefit = events.reduce((sum, event) => sum + (event.riskMetrics?.diversificationBenefit || 0), 0);
    const concentrationRisk = events.reduce((sum, event) => sum + (event.riskMetrics?.concentrationRisk || 0), 0) / totalEvents;
    
    // Calculate geographic statistics
    const affectedRegions = new Set();
    const affectedCountries = new Set();
    
    events.forEach(event => {
      if (event.geographicImpact) {
        event.geographicImpact.forEach(impact => {
          // Determine region and country based on coordinates
          const region = this.getRegionFromCoordinates(impact.affectedLatitude, impact.affectedLongitude);
          const country = this.getCountryFromCoordinates(impact.affectedLatitude, impact.affectedLongitude);
          if (region) affectedRegions.add(region);
          if (country) affectedCountries.add(country);
        });
      }
    });
    
    return {
      totalEvents,
      eventsByHazardType,
      eventsBySeverity,
      eventsByYear,
      totalLoss,
      averageLoss,
      medianLoss: this.calculateMedian(events.map(event => event.financialImpact.totalLoss)),
      maxLoss,
      minLoss,
      standardDeviation: this.calculateStandardDeviation(events.map(event => event.financialImpact.totalLoss)),
      expectedLoss,
      valueAtRisk: new Map([
        ['95', this.calculateValueAtRisk(events, 0.95)],
        ['99', this.calculateValueAtRisk(events, 0.99)]
      ]),
      tailValueAtRisk: new Map([
        ['95', this.calculateTailValueAtRisk(events, 0.95)],
        ['99', this.calculateTailValueAtRisk(events, 0.99)]
      ]),
      diversificationBenefit,
      concentrationRisk,
      affectedRegions: Array.from(affectedRegions),
      affectedCountries: Array.from(affectedCountries),
      averageVulnerabilityScore: this.calculateAverageVulnerabilityScore(events),
      vulnerabilityDistribution: this.calculateVulnerabilityDistribution(events),
      totalExposure: this.calculateTotalExposure(events),
      averageExposure: this.calculateAverageExposure(events),
      exposureDistribution: this.calculateExposureDistribution(events)
    };
  }

  // Helper methods for event generation

  generateSimulationRunId() {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `SIMRUN-${timestamp}-${random}`;
  }

  generateEventId() {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `SIM-${timestamp}-${random}`;
  }

  generatePolicyId(account) {
    return `POL-${account.accountId.slice(-6)}-${Math.floor(Math.random() * 1000)}`;
  }

  generateRandomMonth() {
    return Math.floor(Math.random() * 12) + 1;
  }

  generateRandomDay() {
    return Math.floor(Math.random() * 31) + 1;
  }

  generateRandomLocation(config) {
    // Use boundingBox if available, otherwise default to global bounds
    const bounds = config.geographicScope?.boundingBox || {
      minLatitude: -90,
      maxLatitude: 90,
      minLongitude: -180,
      maxLongitude: 180
    };
    
    const latitude = bounds.minLatitude + Math.random() * (bounds.maxLatitude - bounds.minLatitude);
    const longitude = bounds.minLongitude + Math.random() * (bounds.maxLongitude - bounds.minLongitude);
    return { latitude, longitude };
  }

  // Additional helper methods would be implemented here...
  // (The file is getting long, so I'll continue with the remaining methods in the next part)

  async getAvailableHazardTypes() {
    return ['Earthquake', 'Hurricane', 'Flood', 'Wildfire', 'Tornado'];
  }

  getHazardFrequencyDistribution(hazardType, year) {
    // Return frequency distribution configuration
    return {
      distribution: 'Poisson',
      parameters: { lambda: this.getHazardFrequency(hazardType, year) }
    };
  }

  generateEventCount(frequencyDist) {
    // Generate number of events using Poisson distribution
    const lambda = frequencyDist.parameters.lambda;
    const u = Math.random();
    let k = 0;
    let p = Math.exp(-lambda);
    let s = p;
    
    while (u > s) {
      k++;
      p *= lambda / k;
      s += p;
    }
    
    return k;
  }

  getHazardFrequency(hazardType, year) {
    // Base frequencies by hazard type
    const baseFrequencies = {
      'Earthquake': 0.1,
      'Hurricane': 0.3,
      'Flood': 0.5,
      'Wildfire': 0.2,
      'Tornado': 0.4
    };
    
    const baseFreq = baseFrequencies[hazardType] || 0.1;
    const climateTrend = this.getClimateChangeTrend(hazardType, year);
    
    return baseFreq * (1 + climateTrend);
  }

  getClimateChangeTrend(hazardType, year) {
    // Simple climate change trend calculation
    const baseYear = 2000;
    const yearsFromBase = year - baseYear;
    const trendRate = 0.01; // 1% per year
    
    return yearsFromBase * trendRate;
  }

  // Store simulation events in database
  async storeSimulationEvents(events) {
    try {
      await SimulationEvent.insertMany(events);
    } catch (error) {
      console.error('Error storing simulation events:', error);
      throw error;
    }
  }

  // Additional helper methods for calculations
  calculateMedian(values) {
    const sorted = values.sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  }

  calculateStandardDeviation(values) {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  calculateValueAtRisk(events, confidenceLevel) {
    const losses = events.map(event => event.financialImpact.totalLoss).sort((a, b) => a - b);
    const index = Math.floor((1 - confidenceLevel) * losses.length);
    return losses[index] || 0;
  }

  calculateTailValueAtRisk(events, confidenceLevel) {
    const losses = events.map(event => event.financialImpact.totalLoss).sort((a, b) => a - b);
    const varIndex = Math.floor((1 - confidenceLevel) * losses.length);
    const tailLosses = losses.slice(varIndex);
    return tailLosses.reduce((sum, loss) => sum + loss, 0) / tailLosses.length;
  }

  calculateDiversificationBenefit(exposureImpact) {
    // Simple diversification benefit calculation
    const totalExposure = exposureImpact.reduce((sum, impact) => sum + impact.exposureAmount, 0);
    const maxExposure = Math.max(...exposureImpact.map(impact => impact.exposureAmount));
    return totalExposure > 0 ? (totalExposure - maxExposure) / totalExposure : 0;
  }

  calculateConcentrationRisk(exposureImpact) {
    // Herfindahl-Hirschman Index for concentration risk
    const totalExposure = exposureImpact.reduce((sum, impact) => sum + impact.exposureAmount, 0);
    if (totalExposure === 0) return 0;
    
    const hhi = exposureImpact.reduce((sum, impact) => {
      const share = impact.exposureAmount / totalExposure;
      return sum + share * share;
    }, 0);
    
    return hhi;
  }

  // Placeholder methods for complex calculations
  determineEventSeverity(intensity, hazardType) {
    const thresholds = {
      'Earthquake': { Minor: 4, Moderate: 5, Major: 6, Severe: 7, Catastrophic: 8, Extreme: 9 },
      'Hurricane': { Minor: 1, Moderate: 2, Major: 3, Severe: 4, Catastrophic: 5, Extreme: 5 },
      'Flood': { Minor: 1, Moderate: 2, Major: 3, Severe: 4, Catastrophic: 5, Extreme: 6 }
    };
    
    const thresh = thresholds[hazardType] || thresholds['Earthquake'];
    const val = intensity.value;
    
    if (val >= thresh.Extreme) return 'Extreme';
    if (val >= thresh.Catastrophic) return 'Catastrophic';
    if (val >= thresh.Severe) return 'Severe';
    if (val >= thresh.Major) return 'Major';
    if (val >= thresh.Moderate) return 'Moderate';
    return 'Minor';
  }

  calculateEventProbability(intensity, hazardType) {
    // Simple probability calculation based on intensity
    const baseProb = 0.1;
    const intensityFactor = intensity.value / 10;
    return Math.min(0.9, baseProb * intensityFactor);
  }

  calculateReturnPeriod(probability) {
    return probability > 0 ? 1 / probability : 1000;
  }

  // Additional placeholder methods
  getHazardCategory(hazardType) {
    const categories = {
      'Earthquake': 'Natural',
      'Hurricane': 'Natural',
      'Flood': 'Natural',
      'Wildfire': 'Natural',
      'Tornado': 'Natural'
    };
    return categories[hazardType] || 'Natural';
  }

  getIntensityConfiguration(hazardType) {
    const configs = {
      'Earthquake': { distribution: 'lognormal', parameters: { mu: 1.5, sigma: 0.5 }, scale: 'Richter' },
      'Hurricane': { distribution: 'weibull', parameters: { shape: 2, scale: 3 }, scale: 'Saffir-Simpson' },
      'Flood': { distribution: 'gamma', parameters: { shape: 2, scale: 1000 }, scale: 'Custom' }
    };
    return configs[hazardType] || configs['Earthquake'];
  }

  // More placeholder methods for the remaining functionality
  generateNumberOfLocations(hazardType, intensity) {
    return Math.floor(Math.random() * 5) + 1;
  }

  generateAffectedRadius(hazardType, intensity) {
    return intensity.value * 10 + Math.random() * 50;
  }

  calculateAffectedArea(hazardType, intensity) {
    const radius = this.generateAffectedRadius(hazardType, intensity);
    return Math.PI * radius * radius;
  }

  calculateIntensityAtLocation(intensity, location) {
    return intensity.value * (0.8 + Math.random() * 0.4);
  }

  calculateBaseLoss(hazardType, intensity) {
    // Industry-standard loss calculation based on hazard type and intensity
    const baseLossFactors = {
      'Earthquake': {
        baseAmount: 10000000, // $10M base
        intensityMultiplier: 2.5,
        variabilityFactor: 0.3
      },
      'Hurricane': {
        baseAmount: 25000000, // $25M base
        intensityMultiplier: 3.0,
        variabilityFactor: 0.4
      },
      'Flood': {
        baseAmount: 5000000, // $5M base
        intensityMultiplier: 1.8,
        variabilityFactor: 0.25
      },
      'Wildfire': {
        baseAmount: 15000000, // $15M base
        intensityMultiplier: 2.2,
        variabilityFactor: 0.35
      },
      'Tornado': {
        baseAmount: 8000000, // $8M base
        intensityMultiplier: 2.0,
        variabilityFactor: 0.3
      }
    };

    const factors = baseLossFactors[hazardType] || baseLossFactors['Earthquake'];
    
    // Calculate base loss with intensity scaling and random variation
    const scaledIntensity = Math.pow(intensity.value, factors.intensityMultiplier);
    const randomVariation = 1 + (Math.random() - 0.5) * factors.variabilityFactor;
    
    return factors.baseAmount * scaledIntensity * randomVariation;
  }

  calculateConfidenceInterval(totalLoss, confidenceLevel) {
    const margin = totalLoss * 0.1;
    return {
      lower: Math.max(0, totalLoss - margin),
      upper: totalLoss + margin,
      confidenceLevel
    };
  }

  async getVulnerabilitiesForLocation(lat, lng, config) {
    try {
      // Find vulnerabilities within a reasonable distance (50km radius by default)
      const radius = config.vulnerabilityRadius || 50; // km
      
      const vulnerabilities = await Vulnerability.find({ 
        status: 'Active',
        'geographicScope.centerLatitude': {
          $gte: lat - (radius / 111.32), // Approximate degrees conversion
          $lte: lat + (radius / 111.32)
        },
        'geographicScope.centerLongitude': {
          $gte: lng - (radius / (111.32 * Math.cos(lat * Math.PI / 180))),
          $lte: lng + (radius / (111.32 * Math.cos(lat * Math.PI / 180)))
        }
      }).limit(10); // Limit to prevent performance issues

      return vulnerabilities.filter(vuln => {
        // Calculate actual distance and check if within radius
        const distance = this.calculateDistance(
          lat, lng,
          vuln.geographicScope.centerLatitude,
          vuln.geographicScope.centerLongitude
        );
        return distance <= radius;
      });
    } catch (error) {
      console.error('Error querying vulnerabilities for location:', error);
      return []; // Return empty array on error to prevent simulation failure
    }
  }

  calculateVulnerabilityMultiplier(score) {
    return 1 + (score / 10) * 0.5;
  }

  /**
   * Calculate distance between two geographic points using Haversine formula
   * @param {number} lat1 - Latitude of first point
   * @param {number} lng1 - Longitude of first point
   * @param {number} lat2 - Latitude of second point
   * @param {number} lng2 - Longitude of second point
   * @returns {number} Distance in kilometers
   */
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  }

  async getAccountsForLocation(lat, lng, config) {
    try {
      // Find accounts within the specified regions or globally
      const query = { status: 'Active' };
      
      // If geographic scope is specified, filter by regions
      if (config.geographicScope?.regions) {
        query.regions = { $in: config.geographicScope.regions };
      }
      
      const accounts = await Account.find(query).limit(20); // Limit for performance
      
      // Filter accounts based on exposure scope if specified
      if (config.exposureScope) {
        return accounts.filter(account => {
          if (config.exposureScope.minExposure && account.totalExposure < config.exposureScope.minExposure) {
            return false;
          }
          if (config.exposureScope.maxExposure && account.totalExposure > config.exposureScope.maxExposure) {
            return false;
          }
          return true;
        });
      }
      
      return accounts;
    } catch (error) {
      console.error('Error querying accounts for location:', error);
      return []; // Return empty array on error to prevent simulation failure
    }
  }

  calculateLossRatio(hazardType, intensity) {
    // Industry-standard loss ratios based on hazard type and intensity
    const lossRatioModels = {
      'Earthquake': {
        minRatio: 0.05,
        maxRatio: 0.85,
        intensityThreshold: 6.0, // Richter scale
        baseRatio: 0.15
      },
      'Hurricane': {
        minRatio: 0.10,
        maxRatio: 0.90,
        intensityThreshold: 3.0, // Saffir-Simpson scale
        baseRatio: 0.25
      },
      'Flood': {
        minRatio: 0.08,
        maxRatio: 0.75,
        intensityThreshold: 2.0,
        baseRatio: 0.20
      },
      'Wildfire': {
        minRatio: 0.15,
        maxRatio: 0.95,
        intensityThreshold: 4.0,
        baseRatio: 0.35
      },
      'Tornado': {
        minRatio: 0.12,
        maxRatio: 0.88,
        intensityThreshold: 3.0, // EF scale
        baseRatio: 0.28
      }
    };

    const model = lossRatioModels[hazardType] || lossRatioModels['Earthquake'];
    
    // Calculate loss ratio based on intensity
    let ratio = model.baseRatio;
    
    if (intensity > model.intensityThreshold) {
      // Exponential increase for high intensity events
      const excessIntensity = intensity - model.intensityThreshold;
      const scalingFactor = 1 + (excessIntensity * 0.4); // 40% increase per unit above threshold
      ratio = model.baseRatio * scalingFactor;
    } else {
      // Linear scaling for lower intensity events
      ratio = model.baseRatio * (intensity / model.intensityThreshold);
    }
    
    // Add some random variation (±15%)
    const variation = 1 + (Math.random() - 0.5) * 0.3;
    ratio *= variation;
    
    // Ensure ratio stays within bounds
    return Math.max(model.minRatio, Math.min(model.maxRatio, ratio));
  }

  calculateDeductible(account, hazardType) {
    return account.totalExposure * 0.05; // 5% deductible
  }

  calculateLimit(account, hazardType) {
    return account.totalExposure * 0.8; // 80% limit
  }

  generateEventDuration(hazardType, intensity) {
    const durations = {
      'Earthquake': 60, // seconds
      'Hurricane': 24 * 60 * 60, // seconds
      'Flood': 7 * 24 * 60 * 60 // seconds
    };
    return durations[hazardType] || 3600;
  }

  getDurationUnit(hazardType) {
    return 'seconds';
  }

  getProbabilityDistribution(hazardType) {
    return 'lognormal';
  }

  getDistributionParameters(hazardType, intensity) {
    return { mu: 1.5, sigma: 0.5 };
  }

  adjustParametersForClimate(parameters, climateTrend) {
    return {
      ...parameters,
      mu: parameters.mu + climateTrend * 0.1
    };
  }

  calculateAverageVulnerabilityScore(events) {
    const scores = events.flatMap(event => {
      if (!event.vulnerabilityImpact) return [];
      return event.vulnerabilityImpact.map(impact => impact.vulnerabilityScore || 0);
    });
    return scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
  }

  calculateVulnerabilityDistribution(events) {
    const distribution = {};
    events.forEach(event => {
      if (event.vulnerabilityImpact) {
        event.vulnerabilityImpact.forEach(impact => {
          const score = Math.floor(impact.vulnerabilityScore);
          distribution[score] = (distribution[score] || 0) + 1;
        });
      }
    });
    return new Map(Object.entries(distribution));
  }

  calculateTotalExposure(events) {
    return events.reduce((sum, event) => {
      if (!event.exposureImpact) return sum;
      return sum + event.exposureImpact.reduce((eventSum, impact) => eventSum + (impact.exposureAmount || 0), 0);
    }, 0);
  }

  calculateAverageExposure(events) {
    const totalExposure = this.calculateTotalExposure(events);
    const totalEvents = events.length;
    return totalEvents > 0 ? totalExposure / totalEvents : 0;
  }

  calculateExposureDistribution(events) {
    const distribution = {};
    events.forEach(event => {
      if (event.exposureImpact) {
        event.exposureImpact.forEach(impact => {
          const range = Math.floor(impact.exposureAmount / 1000000); // Group by millions
          distribution[range] = (distribution[range] || 0) + 1;
        });
      }
    });
    return new Map(Object.entries(distribution));
  }

  getRegionFromCoordinates(lat, lng) {
    // Simple region determination based on coordinates
    if (lat >= 24 && lat <= 71 && lng >= -180 && lng <= -50) return 'North America';
    if (lat >= 35 && lat <= 71 && lng >= -10 && lng <= 40) return 'Europe';
    if (lat >= -50 && lat <= 50 && lng >= 100 && lng <= 180) return 'Asia Pacific';
    return 'Other';
  }

  getCountryFromCoordinates(lat, lng) {
    // Simple country determination based on coordinates
    if (lat >= 24 && lat <= 49 && lng >= -125 && lng <= -66) return 'United States';
    if (lat >= 49 && lat <= 71 && lng >= -141 && lng <= -52) return 'Canada';
    if (lat >= 35 && lat <= 71 && lng >= -10 && lng <= 40) return 'United Kingdom';
    return 'Unknown';
  }

  /**
   * Get accounts near a specific location
   * @param {number} latitude - Latitude coordinate
   * @param {number} longitude - Longitude coordinate
   * @param {Object} config - Query configuration
   * @returns {Promise<Array>} Array of accounts
   */
  async getAccountsForLocation(latitude, longitude, config = {}) {
    const { searchRadius = 50, status = 'Active' } = config;
    
    if (this.integrationService && this.integrationService.getAccountsNearLocation) {
      return await this.integrationService.getAccountsNearLocation({
        latitude,
        longitude,
        radiusKm: searchRadius,
        status
      });
    }
    
    // Fallback to direct model query
    const Location = require('../models/Location');
    const Account = require('../models/Account');
    
    const radiusInDegrees = searchRadius / 111; // Approximate km to degrees
    
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
    
    const accountIds = [...new Set(locations.map(loc => loc.metadata?.get('accountId')).filter(Boolean))];
    const accounts = await Account.find({ 
      accountId: { $in: accountIds }, 
      status: status 
    });
    
    return accounts;
  }

  /**
   * Get vulnerabilities affecting a specific location
   * @param {number} latitude - Latitude coordinate
   * @param {number} longitude - Longitude coordinate
   * @param {Object} config - Query configuration
   * @returns {Promise<Array>} Array of vulnerabilities
   */
  async getVulnerabilitiesForLocation(latitude, longitude, config = {}) {
    const { searchRadius = 50, hazardTypes = [] } = config;
    
    if (this.integrationService && this.integrationService.getVulnerabilitiesForLocation) {
      return await this.integrationService.getVulnerabilitiesForLocation({
        latitude,
        longitude,
        radiusKm: searchRadius,
        hazardTypes
      });
    }
    
    // Fallback to direct model query
    const Vulnerability = require('../models/Vulnerability');
    
    const radiusInDegrees = searchRadius / 111; // Approximate km to degrees
    
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
  }

  /**
   * Get exposures near a specific location
   * @param {number} latitude - Latitude coordinate
   * @param {number} longitude - Longitude coordinate
   * @param {Object} config - Query configuration
   * @returns {Promise<Array>} Array of exposures
   */
  async getExposuresForLocation(latitude, longitude, config = {}) {
    const { searchRadius = 50, exposureTypes = [], perils = [] } = config;
    
    if (this.integrationService && this.integrationService.getExposuresNearLocation) {
      return await this.integrationService.getExposuresNearLocation({
        latitude,
        longitude,
        radiusKm: searchRadius,
        exposureTypes,
        perils
      });
    }
    
    // Fallback to direct model query using Exposure model
    const Exposure = require('../models/Exposure');
    
    const radiusInDegrees = searchRadius / 111; // Approximate km to degrees
    
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
  }
}

module.exports = CATSimulationEngine;

