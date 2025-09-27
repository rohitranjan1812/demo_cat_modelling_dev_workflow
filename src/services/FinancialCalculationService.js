const math = require('mathjs');

/**
 * Financial Calculation Service for CAT Modeling
 * Provides comprehensive financial risk metrics and KPIs for catastrophe modeling
 */
class FinancialCalculationService {
  constructor() {
    this.currencyRates = new Map();
    this.initializeCurrencyRates();
  }

  /**
   * Initialize currency exchange rates
   */
  initializeCurrencyRates() {
    // Base currency is USD
    this.currencyRates.set('USD', 1.0);
    this.currencyRates.set('EUR', 0.85);
    this.currencyRates.set('GBP', 0.73);
    this.currencyRates.set('JPY', 110.0);
    this.currencyRates.set('CAD', 1.25);
    this.currencyRates.set('AUD', 1.35);
    this.currencyRates.set('CNY', 6.45);
    this.currencyRates.set('INR', 75.0);
    this.currencyRates.set('BRL', 5.2);
  }

  /**
   * Calculate Expected Loss (EL)
   * @param {Array} events - Array of simulation events
   * @param {string} currency - Target currency
   * @returns {Object} Expected loss calculation
   */
  calculateExpectedLoss(events, currency = 'USD') {
    if (!events || events.length === 0) {
      return {
        expectedLoss: 0,
        currency,
        confidenceInterval: { lower: 0, upper: 0, confidenceLevel: 0.95 },
        calculationMethod: 'Direct Sum'
      };
    }

    // Convert all losses to target currency
    const convertedLosses = events.map(event => 
      this.convertCurrency(event.financialImpact.totalLoss, event.financialImpact.currency, currency)
    );

    const expectedLoss = convertedLosses.reduce((sum, loss) => sum + loss, 0) / events.length;
    
    // Calculate confidence interval
    const confidenceInterval = this.calculateConfidenceInterval(convertedLosses, 0.95);

    return {
      expectedLoss,
      currency,
      confidenceInterval,
      calculationMethod: 'Direct Sum',
      totalEvents: events.length,
      totalLoss: convertedLosses.reduce((sum, loss) => sum + loss, 0)
    };
  }

  /**
   * Calculate Value at Risk (VaR)
   * @param {Array} events - Array of simulation events
   * @param {number} confidenceLevel - Confidence level (0-1)
   * @param {string} currency - Target currency
   * @returns {Object} VaR calculation
   */
  calculateValueAtRisk(events, confidenceLevel = 0.95, currency = 'USD') {
    if (!events || events.length === 0) {
      return {
        valueAtRisk: 0,
        confidenceLevel,
        currency,
        calculationMethod: 'Historical Simulation'
      };
    }

    // Convert all losses to target currency and sort
    const convertedLosses = events.map(event => 
      this.convertCurrency(event.financialImpact.totalLoss, event.financialImpact.currency, currency)
    ).sort((a, b) => a - b);

    const index = Math.floor((1 - confidenceLevel) * convertedLosses.length);
    const valueAtRisk = convertedLosses[index] || 0;

    return {
      valueAtRisk,
      confidenceLevel,
      currency,
      calculationMethod: 'Historical Simulation',
      totalEvents: events.length,
      percentile: (1 - confidenceLevel) * 100
    };
  }

  /**
   * Calculate Tail Value at Risk (TVaR)
   * @param {Array} events - Array of simulation events
   * @param {number} confidenceLevel - Confidence level (0-1)
   * @param {string} currency - Target currency
   * @returns {Object} TVaR calculation
   */
  calculateTailValueAtRisk(events, confidenceLevel = 0.95, currency = 'USD') {
    if (!events || events.length === 0) {
      return {
        tailValueAtRisk: 0,
        confidenceLevel,
        currency,
        calculationMethod: 'Historical Simulation'
      };
    }

    // Convert all losses to target currency and sort
    const convertedLosses = events.map(event => 
      this.convertCurrency(event.financialImpact.totalLoss, event.financialImpact.currency, currency)
    ).sort((a, b) => a - b);

    const varIndex = Math.floor((1 - confidenceLevel) * convertedLosses.length);
    const tailLosses = convertedLosses.slice(varIndex);
    
    const tailValueAtRisk = tailLosses.length > 0 
      ? tailLosses.reduce((sum, loss) => sum + loss, 0) / tailLosses.length
      : 0;

    return {
      tailValueAtRisk,
      confidenceLevel,
      currency,
      calculationMethod: 'Historical Simulation',
      totalEvents: events.length,
      tailEvents: tailLosses.length,
      percentile: (1 - confidenceLevel) * 100
    };
  }

  /**
   * Calculate Standard Deviation
   * @param {Array} events - Array of simulation events
   * @param {string} currency - Target currency
   * @returns {Object} Standard deviation calculation
   */
  calculateStandardDeviation(events, currency = 'USD') {
    if (!events || events.length === 0) {
      return {
        standardDeviation: 0,
        currency,
        calculationMethod: 'Sample Standard Deviation'
      };
    }

    // Convert all losses to target currency
    const convertedLosses = events.map(event => 
      this.convertCurrency(event.financialImpact.totalLoss, event.financialImpact.currency, currency)
    );

    const mean = convertedLosses.reduce((sum, loss) => sum + loss, 0) / convertedLosses.length;
    const variance = convertedLosses.reduce((sum, loss) => sum + Math.pow(loss - mean, 2), 0) / convertedLosses.length;
    const standardDeviation = Math.sqrt(variance);

    return {
      standardDeviation,
      currency,
      calculationMethod: 'Sample Standard Deviation',
      totalEvents: events.length,
      mean,
      variance
    };
  }

  /**
   * Calculate Risk-Adjusted Exposure
   * @param {Array} events - Array of simulation events
   * @param {string} currency - Target currency
   * @returns {Object} Risk-adjusted exposure calculation
   */
  calculateRiskAdjustedExposure(events, currency = 'USD') {
    if (!events || events.length === 0) {
      return {
        riskAdjustedExposure: 0,
        currency,
        calculationMethod: 'Exposure Weighted by Risk'
      };
    }

    let totalExposure = 0;
    let totalRiskAdjustedExposure = 0;

    events.forEach(event => {
      const exposureImpact = event.exposureImpact || [];
      exposureImpact.forEach(impact => {
        const convertedExposure = this.convertCurrency(impact.exposureAmount, currency, currency);
        const riskMultiplier = 1 + (impact.lossRatio || 0);
        
        totalExposure += convertedExposure;
        totalRiskAdjustedExposure += convertedExposure * riskMultiplier;
      });
    });

    return {
      riskAdjustedExposure: totalRiskAdjustedExposure,
      currency,
      calculationMethod: 'Exposure Weighted by Risk',
      totalExposure,
      riskMultiplier: totalExposure > 0 ? totalRiskAdjustedExposure / totalExposure : 1
    };
  }

  /**
   * Calculate Loss Ratio
   * @param {Array} events - Array of simulation events
   * @param {string} currency - Target currency
   * @returns {Object} Loss ratio calculation
   */
  calculateLossRatio(events, currency = 'USD') {
    if (!events || events.length === 0) {
      return {
        lossRatio: 0,
        currency,
        calculationMethod: 'Total Loss / Total Exposure'
      };
    }

    let totalLoss = 0;
    let totalExposure = 0;

    events.forEach(event => {
      const convertedLoss = this.convertCurrency(
        event.financialImpact.totalLoss, 
        event.financialImpact.currency, 
        currency
      );
      totalLoss += convertedLoss;

      const exposureImpact = event.exposureImpact || [];
      exposureImpact.forEach(impact => {
        const convertedExposure = this.convertCurrency(impact.exposureAmount, currency, currency);
        totalExposure += convertedExposure;
      });
    });

    const lossRatio = totalExposure > 0 ? totalLoss / totalExposure : 0;

    return {
      lossRatio,
      currency,
      calculationMethod: 'Total Loss / Total Exposure',
      totalLoss,
      totalExposure
    };
  }

  /**
   * Calculate Diversification Benefit
   * @param {Array} events - Array of simulation events
   * @param {string} currency - Target currency
   * @returns {Object} Diversification benefit calculation
   */
  calculateDiversificationBenefit(events, currency = 'USD') {
    if (!events || events.length === 0) {
      return {
        diversificationBenefit: 0,
        currency,
        calculationMethod: 'Portfolio Effect'
      };
    }

    let totalDiversificationBenefit = 0;
    let totalLoss = 0;

    events.forEach(event => {
      const convertedLoss = this.convertCurrency(
        event.financialImpact.totalLoss, 
        event.financialImpact.currency, 
        currency
      );
      totalLoss += convertedLoss;
      totalDiversificationBenefit += event.riskMetrics.diversificationBenefit || 0;
    });

    const diversificationRatio = totalLoss > 0 ? totalDiversificationBenefit / totalLoss : 0;

    return {
      diversificationBenefit: totalDiversificationBenefit,
      currency,
      calculationMethod: 'Portfolio Effect',
      totalLoss,
      diversificationRatio
    };
  }

  /**
   * Calculate Concentration Risk
   * @param {Array} events - Array of simulation events
   * @param {string} currency - Target currency
   * @returns {Object} Concentration risk calculation
   */
  calculateConcentrationRisk(events, currency = 'USD') {
    if (!events || events.length === 0) {
      return {
        concentrationRisk: 0,
        currency,
        calculationMethod: 'Herfindahl-Hirschman Index'
      };
    }

    // Calculate HHI for each event
    let totalConcentrationRisk = 0;
    let eventCount = 0;

    events.forEach(event => {
      const exposureImpact = event.exposureImpact || [];
      if (exposureImpact.length > 0) {
        const totalExposure = exposureImpact.reduce((sum, impact) => 
          sum + this.convertCurrency(impact.exposureAmount, currency, currency), 0
        );

        if (totalExposure > 0) {
          const hhi = exposureImpact.reduce((sum, impact) => {
            const convertedExposure = this.convertCurrency(impact.exposureAmount, currency, currency);
            const share = convertedExposure / totalExposure;
            return sum + share * share;
          }, 0);

          totalConcentrationRisk += hhi;
          eventCount++;
        }
      }
    });

    const averageConcentrationRisk = eventCount > 0 ? totalConcentrationRisk / eventCount : 0;

    return {
      concentrationRisk: averageConcentrationRisk,
      currency,
      calculationMethod: 'Herfindahl-Hirschman Index',
      totalEvents: eventCount,
      riskLevel: this.getRiskLevel(averageConcentrationRisk)
    };
  }

  /**
   * Calculate Comprehensive Risk Metrics
   * @param {Array} events - Array of simulation events
   * @param {string} currency - Target currency
   * @param {Array} confidenceLevels - Array of confidence levels
   * @returns {Object} Comprehensive risk metrics
   */
  calculateComprehensiveRiskMetrics(events, currency = 'USD', confidenceLevels = [0.90, 0.95, 0.99]) {
    const expectedLoss = this.calculateExpectedLoss(events, currency);
    const standardDeviation = this.calculateStandardDeviation(events, currency);
    const riskAdjustedExposure = this.calculateRiskAdjustedExposure(events, currency);
    const lossRatio = this.calculateLossRatio(events, currency);
    const diversificationBenefit = this.calculateDiversificationBenefit(events, currency);
    const concentrationRisk = this.calculateConcentrationRisk(events, currency);

    // Calculate VaR and TVaR for different confidence levels
    const varMetrics = {};
    const tvarMetrics = {};

    confidenceLevels.forEach(level => {
      varMetrics[`var_${Math.round(level * 100)}`] = this.calculateValueAtRisk(events, level, currency);
      tvarMetrics[`tvar_${Math.round(level * 100)}`] = this.calculateTailValueAtRisk(events, level, currency);
    });

    return {
      expectedLoss,
      standardDeviation,
      riskAdjustedExposure,
      lossRatio,
      diversificationBenefit,
      concentrationRisk,
      valueAtRisk: varMetrics,
      tailValueAtRisk: tvarMetrics,
      currency,
      calculationTimestamp: new Date().toISOString(),
      totalEvents: events.length
    };
  }

  /**
   * Calculate Portfolio Risk Metrics
   * @param {Array} events - Array of simulation events
   * @param {string} currency - Target currency
   * @returns {Object} Portfolio risk metrics
   */
  calculatePortfolioRiskMetrics(events, currency = 'USD') {
    if (!events || events.length === 0) {
      return {
        portfolioValue: 0,
        portfolioRisk: 0,
        currency,
        calculationMethod: 'Portfolio Risk Assessment'
      };
    }

    // Group events by account
    const accountGroups = {};
    events.forEach(event => {
      const exposureImpact = event.exposureImpact || [];
      exposureImpact.forEach(impact => {
        if (!accountGroups[impact.accountId]) {
          accountGroups[impact.accountId] = [];
        }
        accountGroups[impact.accountId].push({
          eventId: event.eventId,
          loss: impact.actualLoss,
          exposure: impact.exposureAmount
        });
      });
    });

    // Calculate portfolio metrics
    const accountCount = Object.keys(accountGroups).length;
    let totalPortfolioValue = 0;
    let totalPortfolioLoss = 0;
    let portfolioVariance = 0;

    Object.values(accountGroups).forEach(accountEvents => {
      const accountValue = accountEvents.reduce((sum, event) => sum + event.exposure, 0);
      const accountLoss = accountEvents.reduce((sum, event) => sum + event.loss, 0);
      
      totalPortfolioValue += accountValue;
      totalPortfolioLoss += accountLoss;
    });

    // Calculate portfolio variance (simplified)
    const averageLoss = totalPortfolioLoss / events.length;
    portfolioVariance = events.reduce((sum, event) => {
      const eventLoss = this.convertCurrency(event.financialImpact.totalLoss, event.financialImpact.currency, currency);
      return sum + Math.pow(eventLoss - averageLoss, 2);
    }, 0) / events.length;

    const portfolioRisk = Math.sqrt(portfolioVariance);

    return {
      portfolioValue: totalPortfolioValue,
      portfolioRisk,
      currency,
      calculationMethod: 'Portfolio Risk Assessment',
      accountCount,
      totalPortfolioLoss,
      portfolioVariance,
      riskPerAccount: accountCount > 0 ? portfolioRisk / accountCount : 0
    };
  }

  /**
   * Calculate Scenario Analysis
   * @param {Array} events - Array of simulation events
   * @param {string} currency - Target currency
   * @returns {Object} Scenario analysis
   */
  calculateScenarioAnalysis(events, currency = 'USD') {
    if (!events || events.length === 0) {
      return {
        scenarios: {},
        currency,
        calculationMethod: 'Scenario Analysis'
      };
    }

    // Group events by severity
    const severityGroups = {};
    events.forEach(event => {
      if (!severityGroups[event.severity]) {
        severityGroups[event.severity] = [];
      }
      severityGroups[event.severity].push(event);
    });

    const scenarios = {};
    Object.keys(severityGroups).forEach(severity => {
      const severityEvents = severityGroups[severity];
      const totalLoss = severityEvents.reduce((sum, event) => 
        sum + this.convertCurrency(event.financialImpact.totalLoss, event.financialImpact.currency, currency), 0
      );
      const averageLoss = totalLoss / severityEvents.length;
      const maxLoss = Math.max(...severityEvents.map(event => 
        this.convertCurrency(event.financialImpact.totalLoss, event.financialImpact.currency, currency)
      ));

      scenarios[severity] = {
        eventCount: severityEvents.length,
        totalLoss,
        averageLoss,
        maxLoss,
        probability: severityEvents.length / events.length
      };
    });

    return {
      scenarios,
      currency,
      calculationMethod: 'Scenario Analysis',
      totalScenarios: Object.keys(scenarios).length
    };
  }

  /**
   * Convert currency
   * @param {number} amount - Amount to convert
   * @param {string} fromCurrency - Source currency
   * @param {string} toCurrency - Target currency
   * @returns {number} Converted amount
   */
  convertCurrency(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) return amount;
    
    const fromRate = this.currencyRates.get(fromCurrency) || 1;
    const toRate = this.currencyRates.get(toCurrency) || 1;
    
    // Convert to USD first, then to target currency
    const usdAmount = amount / fromRate;
    return usdAmount * toRate;
  }

  /**
   * Calculate confidence interval
   * @param {Array} values - Array of values
   * @param {number} confidenceLevel - Confidence level (0-1)
   * @returns {Object} Confidence interval
   */
  calculateConfidenceInterval(values, confidenceLevel = 0.95) {
    if (!values || values.length === 0) {
      return { lower: 0, upper: 0, confidenceLevel };
    }

    const sortedValues = [...values].sort((a, b) => a - b);
    const n = sortedValues.length;
    const alpha = 1 - confidenceLevel;
    const lowerIndex = Math.floor(alpha / 2 * n);
    const upperIndex = Math.ceil((1 - alpha / 2) * n) - 1;

    return {
      lower: sortedValues[Math.max(0, lowerIndex)],
      upper: sortedValues[Math.min(n - 1, upperIndex)],
      confidenceLevel
    };
  }

  /**
   * Get risk level based on concentration risk
   * @param {number} concentrationRisk - Concentration risk value
   * @returns {string} Risk level
   */
  getRiskLevel(concentrationRisk) {
    if (concentrationRisk < 0.15) return 'Low';
    if (concentrationRisk < 0.25) return 'Medium';
    if (concentrationRisk < 0.35) return 'High';
    return 'Very High';
  }

  /**
   * Update currency rates
   * @param {Object} rates - Currency rates object
   */
  updateCurrencyRates(rates) {
    Object.entries(rates).forEach(([currency, rate]) => {
      this.currencyRates.set(currency, rate);
    });
  }

  /**
   * Get current currency rates
   * @returns {Object} Current currency rates
   */
  getCurrencyRates() {
    return Object.fromEntries(this.currencyRates);
  }
}

module.exports = FinancialCalculationService;
