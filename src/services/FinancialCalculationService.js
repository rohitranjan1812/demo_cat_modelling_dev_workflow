/**
 * Financial Calculation Service for CAT Modeling Platform
 * Implements industry-standard financial risk metrics:
 * - Expected Loss (EL)
 * - Value at Risk (VaR) 
 * - Tail Value at Risk (TVaR)
 * - Loss Distributions
 * - Portfolio Risk Metrics
 */

class FinancialCalculationService {
  constructor() {
    this.confidenceLevels = [0.90, 0.95, 0.99, 0.995, 0.999];
    this.defaultCurrency = 'USD';
  }

  /**
   * Calculate Expected Loss (EL) from loss distribution
   * @param {Array<number>} lossData - Array of loss values
   * @param {Array<number>} probabilities - Corresponding probabilities (optional)
   * @returns {number} Expected loss value
   */
  calculateExpectedLoss(lossData, probabilities = null) {
    if (!lossData || lossData.length === 0) return 0;

    if (probabilities && probabilities.length === lossData.length) {
      // Weighted average using probabilities
      const totalProb = probabilities.reduce((sum, p) => sum + p, 0);
      if (totalProb === 0) return 0;
      
      return lossData.reduce((sum, loss, index) => 
        sum + (loss * probabilities[index] / totalProb), 0);
    } else {
      // Simple arithmetic mean
      return lossData.reduce((sum, loss) => sum + loss, 0) / lossData.length;
    }
  }

  /**
   * Calculate Value at Risk (VaR) at specified confidence level
   * @param {Array<number>} lossData - Array of loss values
   * @param {number} confidenceLevel - Confidence level (0.95 = 95%)
   * @returns {number} VaR value
   */
  calculateValueAtRisk(lossData, confidenceLevel = 0.95) {
    if (!lossData || lossData.length === 0) return 0;
    
    const sortedLosses = [...lossData].sort((a, b) => a - b);
    const index = Math.floor((1 - confidenceLevel) * sortedLosses.length);
    const varIndex = Math.max(0, Math.min(index, sortedLosses.length - 1));
    
    return sortedLosses[varIndex] || 0;
  }

  /**
   * Calculate Tail Value at Risk (TVaR) - Conditional VaR
   * @param {Array<number>} lossData - Array of loss values
   * @param {number} confidenceLevel - Confidence level (0.95 = 95%)
   * @returns {number} TVaR value
   */
  calculateTailValueAtRisk(lossData, confidenceLevel = 0.95) {
    if (!lossData || lossData.length === 0) return 0;
    
    const sortedLosses = [...lossData].sort((a, b) => a - b);
    const varIndex = Math.floor((1 - confidenceLevel) * sortedLosses.length);
    const tailLosses = sortedLosses.slice(varIndex);
    
    if (tailLosses.length === 0) return sortedLosses[sortedLosses.length - 1] || 0;
    
    return tailLosses.reduce((sum, loss) => sum + loss, 0) / tailLosses.length;
  }

  /**
   * Calculate comprehensive risk metrics for a portfolio
   * @param {Array<Object>} events - Array of simulation events
   * @param {Object} options - Calculation options
   * @returns {Object} Comprehensive risk metrics
   */
  calculatePortfolioRiskMetrics(events, options = {}) {
    const {
      confidenceLevels = this.confidenceLevels,
      currency = this.defaultCurrency,
      timeHorizon = 1 // years
    } = options;

    const lossData = events.map(event => 
      event.financialImpact ? event.financialImpact.totalLoss : 0
    );

    if (lossData.length === 0) {
      return this.createEmptyRiskMetrics(currency, timeHorizon);
    }

    const expectedLoss = this.calculateExpectedLoss(lossData);
    const standardDeviation = this.calculateStandardDeviation(lossData);
    const skewness = this.calculateSkewness(lossData);
    const kurtosis = this.calculateKurtosis(lossData);
    
    // Calculate VaR and TVaR for multiple confidence levels
    const varMetrics = {};
    const tvarMetrics = {};
    
    confidenceLevels.forEach(level => {
      varMetrics[`VaR_${(level * 100).toFixed(1)}%`] = this.calculateValueAtRisk(lossData, level);
      tvarMetrics[`TVaR_${(level * 100).toFixed(1)}%`] = this.calculateTailValueAtRisk(lossData, level);
    });

    // Calculate additional risk metrics
    const maxLoss = Math.max(...lossData);
    const minLoss = Math.min(...lossData);
    const median = this.calculateMedian(lossData);
    const coefficientOfVariation = standardDeviation / expectedLoss;
    
    // Risk-adjusted metrics
    const sharpeRatio = this.calculateSharpeRatio(expectedLoss, standardDeviation);
    const probabilityOfExceedance = this.calculateProbabilityOfExceedance(lossData, expectedLoss * 2);
    
    return {
      summary: {
        totalEvents: events.length,
        expectedLoss,
        standardDeviation,
        coefficientOfVariation,
        median,
        maxLoss,
        minLoss,
        currency,
        timeHorizon
      },
      distributionMetrics: {
        skewness,
        kurtosis,
        variance: standardDeviation ** 2
      },
      valueAtRisk: varMetrics,
      tailValueAtRisk: tvarMetrics,
      riskAdjustedMetrics: {
        sharpeRatio,
        probabilityOfExceedance,
        returnOnRiskAdjustedCapital: this.calculateRORACratio(expectedLoss, varMetrics[`VaR_99.5%`])
      },
      lossExceedanceCurve: this.calculateLossExceedanceCurve(lossData),
      calculatedAt: new Date().toISOString(),
      methodology: 'Monte Carlo Simulation with Historical Calibration'
    };
  }

  /**
   * Calculate loss exceedance curve
   * @param {Array<number>} lossData - Array of loss values
   * @returns {Array<Object>} Exceedance curve points
   */
  calculateLossExceedanceCurve(lossData) {
    const sortedLosses = [...lossData].sort((a, b) => b - a);
    const totalEvents = sortedLosses.length;
    
    return sortedLosses.map((loss, index) => ({
      loss,
      exceedanceProbability: (index + 1) / totalEvents,
      returnPeriod: totalEvents / (index + 1)
    }));
  }

  /**
   * Calculate probability of exceedance for a specific threshold
   * @param {Array<number>} lossData - Array of loss values
   * @param {number} threshold - Loss threshold
   * @returns {number} Probability of exceedance
   */
  calculateProbabilityOfExceedance(lossData, threshold) {
    const exceedingEvents = lossData.filter(loss => loss > threshold);
    return exceedingEvents.length / lossData.length;
  }

  /**
   * Calculate Sharpe ratio for risk-adjusted returns
   * @param {number} expectedReturn - Expected return
   * @param {number} volatility - Standard deviation
   * @param {number} riskFreeRate - Risk-free rate (default 0.02 = 2%)
   * @returns {number} Sharpe ratio
   */
  calculateSharpeRatio(expectedReturn, volatility, riskFreeRate = 0.02) {
    if (volatility === 0) return 0;
    return (expectedReturn - riskFreeRate) / volatility;
  }

  /**
   * Calculate Return on Risk-Adjusted Capital (RORAC)
   * @param {number} expectedReturn - Expected return
   * @param {number} riskCapital - Risk capital (typically VaR)
   * @returns {number} RORAC ratio
   */
  calculateRORACratio(expectedReturn, riskCapital) {
    if (riskCapital === 0) return 0;
    return expectedReturn / riskCapital;
  }

  /**
   * Calculate diversification benefit
   * @param {Array<Object>} portfolioItems - Array of portfolio items with exposure amounts
   * @returns {number} Diversification benefit (0-1 scale)
   */
  calculateDiversificationBenefit(portfolioItems) {
    if (!portfolioItems || portfolioItems.length <= 1) return 0;
    
    const totalExposure = portfolioItems.reduce((sum, item) => sum + item.exposureAmount, 0);
    if (totalExposure === 0) return 0;
    
    // Calculate Herfindahl-Hirschman Index (HHI)
    const hhi = portfolioItems.reduce((sum, item) => {
      const share = item.exposureAmount / totalExposure;
      return sum + (share * share);
    }, 0);
    
    // Convert HHI to diversification benefit (1 - HHI)
    return Math.max(0, 1 - hhi);
  }

  /**
   * Calculate concentration risk
   * @param {Array<Object>} portfolioItems - Array of portfolio items
   * @param {string} concentrationBy - Concentration dimension ('geography', 'peril', 'account')
   * @returns {number} Concentration risk score (0-1 scale)
   */
  calculateConcentrationRisk(portfolioItems, concentrationBy = 'geography') {
    if (!portfolioItems || portfolioItems.length === 0) return 0;
    
    const totalExposure = portfolioItems.reduce((sum, item) => sum + item.exposureAmount, 0);
    const concentrationMap = {};
    
    portfolioItems.forEach(item => {
      let key;
      switch (concentrationBy) {
        case 'geography':
          key = `${Math.floor(item.latitude / 5)}_${Math.floor(item.longitude / 5)}`; // 5-degree grid
          break;
        case 'peril':
          key = item.hazardType || 'Unknown';
          break;
        case 'account':
          key = item.accountId || 'Unknown';
          break;
        default:
          key = 'default';
      }
      
      concentrationMap[key] = (concentrationMap[key] || 0) + item.exposureAmount;
    });
    
    // Calculate concentration using HHI
    const hhi = Object.values(concentrationMap).reduce((sum, exposure) => {
      const share = exposure / totalExposure;
      return sum + (share * share);
    }, 0);
    
    return hhi; // Higher HHI = Higher concentration risk
  }

  /**
   * Calculate risk-adjusted exposure
   * @param {number} grossExposure - Gross exposure amount
   * @param {number} riskScore - Risk score (0-10 scale)
   * @param {Object} adjustmentFactors - Risk adjustment factors
   * @returns {number} Risk-adjusted exposure
   */
  calculateRiskAdjustedExposure(grossExposure, riskScore, adjustmentFactors = {}) {
    const {
      baseAdjustment = 0.1, // 10% base risk adjustment
      riskScaling = 0.05,    // 5% per risk score unit
      maxAdjustment = 0.5    // 50% maximum adjustment
    } = adjustmentFactors;
    
    const riskAdjustment = baseAdjustment + (riskScore * riskScaling);
    const cappedAdjustment = Math.min(riskAdjustment, maxAdjustment);
    
    return grossExposure * (1 + cappedAdjustment);
  }

  /**
   * Calculate correlation matrix for multiple perils
   * @param {Array<Array<number>>} perilLossData - Array of loss arrays for each peril
   * @param {Array<string>} perilNames - Names of perils
   * @returns {Object} Correlation matrix and related statistics
   */
  calculatePerilCorrelation(perilLossData, perilNames) {
    const numPerils = perilLossData.length;
    const correlationMatrix = Array(numPerils).fill().map(() => Array(numPerils).fill(0));
    
    // Calculate correlation coefficients
    for (let i = 0; i < numPerils; i++) {
      for (let j = 0; j < numPerils; j++) {
        if (i === j) {
          correlationMatrix[i][j] = 1.0;
        } else {
          correlationMatrix[i][j] = this.calculatePearsonCorrelation(
            perilLossData[i], 
            perilLossData[j]
          );
        }
      }
    }
    
    return {
      correlationMatrix,
      perilNames,
      averageCorrelation: this.calculateAverageCorrelation(correlationMatrix),
      maxCorrelation: this.getMaxOffDiagonalCorrelation(correlationMatrix),
      diversificationEffect: this.calculateDiversificationEffect(correlationMatrix)
    };
  }

  /**
   * Calculate optimal retention levels for reinsurance
   * @param {Array<number>} lossData - Historical or simulated loss data
   * @param {Object} retentionOptions - Retention calculation options
   * @returns {Object} Optimal retention analysis
   */
  calculateOptimalRetention(lossData, retentionOptions = {}) {
    const {
      riskTolerance = 0.05, // 5% of capital
      capitalBase = 1000000000, // $1B capital
      reinsuranceCost = 0.15, // 15% of premium
      targetROE = 0.12 // 12% return on equity
    } = retentionOptions;
    
    const maxRetention = capitalBase * riskTolerance;
    const testRetentionLevels = [];
    const step = maxRetention / 20; // Test 20 different levels
    
    for (let retention = step; retention <= maxRetention; retention += step) {
      const metrics = this.calculateRetentionMetrics(lossData, retention, retentionOptions);
      testRetentionLevels.push({
        retentionLevel: retention,
        ...metrics
      });
    }
    
    // Find optimal retention level based on risk-adjusted returns
    const optimalLevel = testRetentionLevels.reduce((best, current) => 
      current.riskAdjustedReturn > best.riskAdjustedReturn ? current : best
    );
    
    return {
      optimalRetentionLevel: optimalLevel.retentionLevel,
      optimalMetrics: optimalLevel,
      analysisResults: testRetentionLevels,
      recommendation: this.generateRetentionRecommendation(optimalLevel, retentionOptions)
    };
  }

  /**
   * Calculate financial metrics for a specific retention level
   * @param {Array<number>} lossData - Loss data
   * @param {number} retentionLevel - Retention level to test
   * @param {Object} options - Calculation options
   * @returns {Object} Financial metrics for this retention level
   */
  calculateRetentionMetrics(lossData, retentionLevel, options) {
    const retainedLosses = lossData.map(loss => Math.min(loss, retentionLevel));
    const cededLosses = lossData.map(loss => Math.max(0, loss - retentionLevel));
    
    const retainedEL = this.calculateExpectedLoss(retainedLosses);
    const cededEL = this.calculateExpectedLoss(cededLosses);
    const reinsuranceCost = cededEL * options.reinsuranceCost;
    
    const netCost = retainedEL + reinsuranceCost;
    const riskReduction = (cededEL / (retainedEL + cededEL)) || 0;
    const riskAdjustedReturn = (options.targetROE * options.capitalBase - netCost) / options.capitalBase;
    
    return {
      retainedEL,
      cededEL,
      reinsuranceCost,
      netCost,
      riskReduction,
      riskAdjustedReturn,
      var95: this.calculateValueAtRisk(retainedLosses, 0.95),
      tvar95: this.calculateTailValueAtRisk(retainedLosses, 0.95)
    };
  }

  /**
   * Generate reinsurance retention recommendation
   * @param {Object} optimalMetrics - Optimal retention metrics
   * @param {Object} options - Original options
   * @returns {Object} Recommendation with rationale
   */
  generateRetentionRecommendation(optimalMetrics, options) {
    const retentionAsPercent = (optimalMetrics.retentionLevel / options.capitalBase * 100).toFixed(1);
    const riskReductionPercent = (optimalMetrics.riskReduction * 100).toFixed(1);
    
    return {
      recommendation: `Retain ${this.formatCurrency(optimalMetrics.retentionLevel)} (${retentionAsPercent}% of capital)`,
      rationale: [
        `Achieves ${riskReductionPercent}% risk transfer to reinsurers`,
        `Net cost of ${this.formatCurrency(optimalMetrics.netCost)} including reinsurance`,
        `Risk-adjusted return of ${(optimalMetrics.riskAdjustedReturn * 100).toFixed(2)}%`,
        `95% VaR reduced to ${this.formatCurrency(optimalMetrics.var95)}`
      ],
      riskProfile: {
        retentionLevel: optimalMetrics.retentionLevel,
        var95: optimalMetrics.var95,
        expectedLoss: optimalMetrics.retainedEL,
        riskCapital: optimalMetrics.var95 * 1.2 // 120% of VaR as risk capital
      }
    };
  }

  /**
   * Calculate loss distribution statistics
   * @param {Array<number>} lossData - Array of loss values
   * @returns {Object} Distribution statistics
   */
  calculateDistributionStatistics(lossData) {
    if (!lossData || lossData.length === 0) {
      return { error: 'No loss data provided' };
    }

    const mean = this.calculateExpectedLoss(lossData);
    const median = this.calculateMedian(lossData);
    const mode = this.calculateMode(lossData);
    const variance = this.calculateVariance(lossData);
    const standardDeviation = Math.sqrt(variance);
    const skewness = this.calculateSkewness(lossData);
    const kurtosis = this.calculateKurtosis(lossData);
    
    // Calculate percentiles
    const percentiles = {};
    [1, 5, 10, 25, 50, 75, 90, 95, 99].forEach(p => {
      percentiles[`P${p}`] = this.calculatePercentile(lossData, p / 100);
    });

    return {
      centralTendency: { mean, median, mode },
      dispersion: { variance, standardDeviation, range: Math.max(...lossData) - Math.min(...lossData) },
      shape: { skewness, kurtosis },
      percentiles,
      summary: {
        totalObservations: lossData.length,
        minValue: Math.min(...lossData),
        maxValue: Math.max(...lossData),
        coefficientOfVariation: standardDeviation / mean
      }
    };
  }

  // Statistical helper methods

  calculateMedian(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid];
  }

  calculateMode(values) {
    const frequency = {};
    values.forEach(value => {
      const bucket = Math.floor(value / 1000) * 1000; // Group into $1k buckets
      frequency[bucket] = (frequency[bucket] || 0) + 1;
    });
    
    let maxFreq = 0;
    let mode = 0;
    Object.entries(frequency).forEach(([value, freq]) => {
      if (freq > maxFreq) {
        maxFreq = freq;
        mode = parseInt(value);
      }
    });
    
    return mode;
  }

  calculateVariance(values) {
    const mean = this.calculateExpectedLoss(values);
    return values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length;
  }

  calculateStandardDeviation(values) {
    return Math.sqrt(this.calculateVariance(values));
  }

  calculateSkewness(values) {
    const mean = this.calculateExpectedLoss(values);
    const stdDev = this.calculateStandardDeviation(values);
    if (stdDev === 0) return 0;
    
    const skewSum = values.reduce((sum, value) => {
      return sum + Math.pow((value - mean) / stdDev, 3);
    }, 0);
    
    return skewSum / values.length;
  }

  calculateKurtosis(values) {
    const mean = this.calculateExpectedLoss(values);
    const stdDev = this.calculateStandardDeviation(values);
    if (stdDev === 0) return 0;
    
    const kurtSum = values.reduce((sum, value) => {
      return sum + Math.pow((value - mean) / stdDev, 4);
    }, 0);
    
    return (kurtSum / values.length) - 3; // Excess kurtosis
  }

  calculatePercentile(values, percentile) {
    const sorted = [...values].sort((a, b) => a - b);
    const index = percentile * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    
    if (lower === upper) {
      return sorted[lower];
    }
    
    const weight = index - lower;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }

  calculatePearsonCorrelation(x, y) {
    if (x.length !== y.length || x.length === 0) return 0;
    
    const n = x.length;
    const meanX = x.reduce((sum, val) => sum + val, 0) / n;
    const meanY = y.reduce((sum, val) => sum + val, 0) / n;
    
    let numerator = 0;
    let denomX = 0;
    let denomY = 0;
    
    for (let i = 0; i < n; i++) {
      const diffX = x[i] - meanX;
      const diffY = y[i] - meanY;
      numerator += diffX * diffY;
      denomX += diffX * diffX;
      denomY += diffY * diffY;
    }
    
    const denominator = Math.sqrt(denomX * denomY);
    return denominator === 0 ? 0 : numerator / denominator;
  }

  calculateAverageCorrelation(correlationMatrix) {
    let sum = 0;
    let count = 0;
    
    for (let i = 0; i < correlationMatrix.length; i++) {
      for (let j = i + 1; j < correlationMatrix[i].length; j++) {
        sum += correlationMatrix[i][j];
        count++;
      }
    }
    
    return count > 0 ? sum / count : 0;
  }

  getMaxOffDiagonalCorrelation(correlationMatrix) {
    let max = -1;
    
    for (let i = 0; i < correlationMatrix.length; i++) {
      for (let j = i + 1; j < correlationMatrix[i].length; j++) {
        max = Math.max(max, Math.abs(correlationMatrix[i][j]));
      }
    }
    
    return max;
  }

  calculateDiversificationEffect(correlationMatrix) {
    const avgCorrelation = this.calculateAverageCorrelation(correlationMatrix);
    // Diversification effect is inverse of correlation
    return Math.max(0, 1 - avgCorrelation);
  }

  // Utility methods

  formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  createEmptyRiskMetrics(currency, timeHorizon) {
    return {
      summary: {
        totalEvents: 0,
        expectedLoss: 0,
        standardDeviation: 0,
        coefficientOfVariation: 0,
        median: 0,
        maxLoss: 0,
        minLoss: 0,
        currency,
        timeHorizon
      },
      distributionMetrics: { skewness: 0, kurtosis: 0, variance: 0 },
      valueAtRisk: {},
      tailValueAtRisk: {},
      riskAdjustedMetrics: { sharpeRatio: 0, probabilityOfExceedance: 0, returnOnRiskAdjustedCapital: 0 },
      lossExceedanceCurve: [],
      calculatedAt: new Date().toISOString(),
      methodology: 'No data available'
    };
  }

  /**
   * Convert losses to different currencies
   * @param {number} amount - Amount to convert
   * @param {string} fromCurrency - Source currency
   * @param {string} toCurrency - Target currency
   * @param {Object} exchangeRates - Exchange rate object
   * @returns {number} Converted amount
   */
  convertCurrency(amount, fromCurrency, toCurrency, exchangeRates = {}) {
    if (fromCurrency === toCurrency) return amount;
    
    // Default exchange rates (in production, would use live rates)
    const defaultRates = {
      'USD': 1.0,
      'EUR': 0.85,
      'GBP': 0.73,
      'JPY': 110.0,
      'CAD': 1.25,
      'AUD': 1.35
    };
    
    const rates = { ...defaultRates, ...exchangeRates };
    const fromRate = rates[fromCurrency] || 1;
    const toRate = rates[toCurrency] || 1;
    
    // Convert to USD first, then to target currency
    const usdAmount = amount / fromRate;
    return usdAmount * toRate;
  }

  /**
   * Calculate insurance pricing metrics
   * @param {Object} riskMetrics - Risk metrics from portfolio analysis
   * @param {Object} pricingOptions - Pricing model options
   * @returns {Object} Pricing recommendations
   */
  calculateInsurancePricing(riskMetrics, pricingOptions = {}) {
    const {
      targetProfitMargin = 0.20, // 20% profit margin
      expenseRatio = 0.35, // 35% expense ratio
      costOfCapital = 0.08, // 8% cost of capital
      riskMargin = 0.15 // 15% risk margin
    } = pricingOptions;
    
    const expectedLoss = riskMetrics.summary.expectedLoss;
    const riskCapital = riskMetrics.valueAtRisk['VaR_99.5%'] || expectedLoss * 10;
    
    // Technical price calculation
    const lossComponent = expectedLoss * (1 + riskMargin);
    const expenseComponent = lossComponent * expenseRatio;
    const capitalComponent = riskCapital * costOfCapital;
    const profitComponent = (lossComponent + expenseComponent + capitalComponent) * targetProfitMargin;
    
    const technicalPrice = lossComponent + expenseComponent + capitalComponent + profitComponent;
    const lossRatio = expectedLoss / technicalPrice;
    const combinedRatio = lossRatio + expenseRatio;
    
    return {
      pricing: {
        technicalPrice,
        lossComponent,
        expenseComponent,
        capitalComponent,
        profitComponent,
        currency: riskMetrics.summary.currency
      },
      metrics: {
        lossRatio,
        expenseRatio,
        combinedRatio,
        profitMargin: profitComponent / technicalPrice,
        returnOnCapital: profitComponent / riskCapital
      },
      recommendation: {
        minimumPrice: technicalPrice * 0.9, // 10% discount maximum
        targetPrice: technicalPrice,
        maximumPrice: technicalPrice * 1.3, // 30% premium maximum
        competitivePosition: this.assessCompetitivePosition(technicalPrice, options.marketRates || {})
      }
    };
  }

  assessCompetitivePosition(technicalPrice, marketRates) {
    const avgMarketPrice = Object.values(marketRates).reduce((sum, price) => sum + price, 0) / Object.keys(marketRates).length || technicalPrice;
    const priceRatio = technicalPrice / avgMarketPrice;
    
    if (priceRatio < 0.9) return 'Highly Competitive';
    if (priceRatio < 1.1) return 'Competitive';
    if (priceRatio < 1.3) return 'Above Market';
    return 'Significantly Above Market';
  }
}

module.exports = FinancialCalculationService;