const math = require('mathjs');

/**
 * Advanced Probability Distribution Service for CAT Modeling
 * Provides comprehensive probability distributions for hazard modeling, loss estimation, and risk assessment
 */
class ProbabilityDistributionService {
  constructor() {
    this.distributions = new Map();
    this.initializeDistributions();
  }

  /**
   * Initialize all available probability distributions
   */
  initializeDistributions() {
    // Normal Distribution
    this.distributions.set('normal', {
      name: 'Normal',
      parameters: ['mean', 'std'],
      description: 'Gaussian distribution for symmetric data'
    });

    // Lognormal Distribution
    this.distributions.set('lognormal', {
      name: 'Lognormal',
      parameters: ['mu', 'sigma'],
      description: 'Log-normal distribution for positive data with right skew'
    });

    // Gamma Distribution
    this.distributions.set('gamma', {
      name: 'Gamma',
      parameters: ['shape', 'scale'],
      description: 'Gamma distribution for positive data with flexible shape'
    });

    // Weibull Distribution
    this.distributions.set('weibull', {
      name: 'Weibull',
      parameters: ['shape', 'scale'],
      description: 'Weibull distribution for reliability and extreme value modeling'
    });

    // Pareto Distribution
    this.distributions.set('pareto', {
      name: 'Pareto',
      parameters: ['shape', 'scale'],
      description: 'Pareto distribution for heavy-tailed data'
    });

    // Exponential Distribution
    this.distributions.set('exponential', {
      name: 'Exponential',
      parameters: ['rate'],
      description: 'Exponential distribution for memoryless processes'
    });

    // Beta Distribution
    this.distributions.set('beta', {
      name: 'Beta',
      parameters: ['alpha', 'beta'],
      description: 'Beta distribution for bounded data'
    });

    // Gumbel Distribution (Extreme Value Type I)
    this.distributions.set('gumbel', {
      name: 'Gumbel',
      parameters: ['location', 'scale'],
      description: 'Gumbel distribution for extreme value modeling'
    });

    // Frechet Distribution (Extreme Value Type II)
    this.distributions.set('frechet', {
      name: 'Frechet',
      parameters: ['shape', 'scale', 'location'],
      description: 'Frechet distribution for extreme value modeling'
    });

    // Generalized Extreme Value (GEV)
    this.distributions.set('gev', {
      name: 'Generalized Extreme Value',
      parameters: ['location', 'scale', 'shape'],
      description: 'GEV distribution for extreme value modeling'
    });

    // Generalized Pareto Distribution (GPD)
    this.distributions.set('gpd', {
      name: 'Generalized Pareto',
      parameters: ['shape', 'scale', 'location'],
      description: 'GPD for modeling excesses over threshold'
    });
  }

  /**
   * Generate random sample from normal distribution
   * @param {number} mean - Mean of the distribution
   * @param {number} std - Standard deviation
   * @param {number} size - Number of samples
   * @returns {Array} Array of random samples
   */
  generateNormal(mean, std, size = 1) {
    const samples = [];
    for (let i = 0; i < size; i++) {
      // Box-Muller transform
      const u1 = Math.random();
      const u2 = Math.random();
      const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      samples.push(mean + std * z0);
    }
    return samples;
  }

  /**
   * Generate random sample from lognormal distribution
   * @param {number} mu - Mean of the underlying normal distribution
   * @param {number} sigma - Standard deviation of the underlying normal distribution
   * @param {number} size - Number of samples
   * @returns {Array} Array of random samples
   */
  generateLognormal(mu, sigma, size = 1) {
    const normalSamples = this.generateNormal(mu, sigma, size);
    return normalSamples.map(x => Math.exp(x));
  }

  /**
   * Generate random sample from gamma distribution
   * @param {number} shape - Shape parameter (alpha)
   * @param {number} scale - Scale parameter (beta)
   * @param {number} size - Number of samples
   * @returns {Array} Array of random samples
   */
  generateGamma(shape, scale, size = 1) {
    const samples = [];
    for (let i = 0; i < size; i++) {
      if (shape < 1) {
        // Use acceptance-rejection method for shape < 1
        samples.push(this._generateGammaSmallShape(shape, scale));
      } else {
        // Use Marsaglia and Tsang's method for shape >= 1
        samples.push(this._generateGammaLargeShape(shape, scale));
      }
    }
    return samples;
  }

  /**
   * Generate random sample from Weibull distribution
   * @param {number} shape - Shape parameter (k)
   * @param {number} scale - Scale parameter (lambda)
   * @param {number} size - Number of samples
   * @returns {Array} Array of random samples
   */
  generateWeibull(shape, scale, size = 1) {
    const samples = [];
    for (let i = 0; i < size; i++) {
      const u = Math.random();
      samples.push(scale * Math.pow(-Math.log(u), 1 / shape));
    }
    return samples;
  }

  /**
   * Generate random sample from Pareto distribution
   * @param {number} shape - Shape parameter (alpha)
   * @param {number} scale - Scale parameter (xm)
   * @param {number} size - Number of samples
   * @returns {Array} Array of random samples
   */
  generatePareto(shape, scale, size = 1) {
    const samples = [];
    for (let i = 0; i < size; i++) {
      const u = Math.random();
      samples.push(scale * Math.pow(u, -1 / shape));
    }
    return samples;
  }

  /**
   * Generate random sample from exponential distribution
   * @param {number} rate - Rate parameter (lambda)
   * @param {number} size - Number of samples
   * @returns {Array} Array of random samples
   */
  generateExponential(rate, size = 1) {
    const samples = [];
    for (let i = 0; i < size; i++) {
      const u = Math.random();
      samples.push(-Math.log(u) / rate);
    }
    return samples;
  }

  /**
   * Generate random sample from beta distribution
   * @param {number} alpha - Alpha parameter
   * @param {number} beta - Beta parameter
   * @param {number} size - Number of samples
   * @returns {Array} Array of random samples
   */
  generateBeta(alpha, beta, size = 1) {
    const samples = [];
    for (let i = 0; i < size; i++) {
      const gamma1 = this.generateGamma(alpha, 1, 1)[0];
      const gamma2 = this.generateGamma(beta, 1, 1)[0];
      samples.push(gamma1 / (gamma1 + gamma2));
    }
    return samples;
  }

  /**
   * Generate random sample from Gumbel distribution (Extreme Value Type I)
   * @param {number} location - Location parameter (mu)
   * @param {number} scale - Scale parameter (beta)
   * @param {number} size - Number of samples
   * @returns {Array} Array of random samples
   */
  generateGumbel(location, scale, size = 1) {
    const samples = [];
    for (let i = 0; i < size; i++) {
      const u = Math.random();
      samples.push(location - scale * Math.log(-Math.log(u)));
    }
    return samples;
  }

  /**
   * Generate random sample from Frechet distribution (Extreme Value Type II)
   * @param {number} shape - Shape parameter (alpha)
   * @param {number} scale - Scale parameter (s)
   * @param {number} location - Location parameter (m)
   * @param {number} size - Number of samples
   * @returns {Array} Array of random samples
   */
  generateFrechet(shape, scale, location, size = 1) {
    const samples = [];
    for (let i = 0; i < size; i++) {
      const u = Math.random();
      samples.push(location + scale * Math.pow(-Math.log(u), -1 / shape));
    }
    return samples;
  }

  /**
   * Generate random sample from Generalized Extreme Value (GEV) distribution
   * @param {number} location - Location parameter (mu)
   * @param {number} scale - Scale parameter (sigma)
   * @param {number} shape - Shape parameter (xi)
   * @param {number} size - Number of samples
   * @returns {Array} Array of random samples
   */
  generateGEV(location, scale, shape, size = 1) {
    const samples = [];
    for (let i = 0; i < size; i++) {
      const u = Math.random();
      if (Math.abs(shape) < 1e-8) {
        // Gumbel case (shape = 0)
        samples.push(location - scale * Math.log(-Math.log(u)));
      } else {
        const y = -Math.log(u);
        samples.push(location + scale * (Math.pow(y, -shape) - 1) / shape);
      }
    }
    return samples;
  }

  /**
   * Generate random sample from Generalized Pareto Distribution (GPD)
   * @param {number} shape - Shape parameter (xi)
   * @param {number} scale - Scale parameter (sigma)
   * @param {number} location - Location parameter (mu)
   * @param {number} size - Number of samples
   * @returns {Array} Array of random samples
   */
  generateGPD(shape, scale, location, size = 1) {
    const samples = [];
    for (let i = 0; i < size; i++) {
      const u = Math.random();
      if (Math.abs(shape) < 1e-8) {
        // Exponential case (shape = 0)
        samples.push(location - scale * Math.log(u));
      } else {
        samples.push(location + scale * (Math.pow(u, -shape) - 1) / shape);
      }
    }
    return samples;
  }

  /**
   * Generate random sample from any distribution by name
   * @param {string} distributionName - Name of the distribution
   * @param {Object} parameters - Distribution parameters
   * @param {number} size - Number of samples
   * @returns {Array} Array of random samples
   */
  generateSample(distributionName, parameters, size = 1) {
    const dist = this.distributions.get(distributionName.toLowerCase());
    if (!dist) {
      throw new Error(`Distribution '${distributionName}' not supported`);
    }

    switch (distributionName.toLowerCase()) {
      case 'normal':
        return this.generateNormal(parameters.mean, parameters.std, size);
      case 'lognormal':
        return this.generateLognormal(parameters.mu, parameters.sigma, size);
      case 'gamma':
        return this.generateGamma(parameters.shape, parameters.scale, size);
      case 'weibull':
        return this.generateWeibull(parameters.shape, parameters.scale, size);
      case 'pareto':
        return this.generatePareto(parameters.shape, parameters.scale, size);
      case 'exponential':
        return this.generateExponential(parameters.rate, size);
      case 'beta':
        return this.generateBeta(parameters.alpha, parameters.beta, size);
      case 'gumbel':
        return this.generateGumbel(parameters.location, parameters.scale, size);
      case 'frechet':
        return this.generateFrechet(parameters.shape, parameters.scale, parameters.location, size);
      case 'gev':
        return this.generateGEV(parameters.location, parameters.scale, parameters.shape, size);
      case 'gpd':
        return this.generateGPD(parameters.shape, parameters.scale, parameters.location, size);
      default:
        throw new Error(`Distribution '${distributionName}' not implemented`);
    }
  }

  /**
   * Calculate probability density function (PDF) for normal distribution
   * @param {number} x - Value to evaluate
   * @param {number} mean - Mean of the distribution
   * @param {number} std - Standard deviation
   * @returns {number} PDF value
   */
  pdfNormal(x, mean, std) {
    const variance = std * std;
    return (1 / Math.sqrt(2 * Math.PI * variance)) * Math.exp(-0.5 * Math.pow((x - mean) / std, 2));
  }

  /**
   * Calculate cumulative distribution function (CDF) for normal distribution
   * @param {number} x - Value to evaluate
   * @param {number} mean - Mean of the distribution
   * @param {number} std - Standard deviation
   * @returns {number} CDF value
   */
  cdfNormal(x, mean, std) {
    return 0.5 * (1 + this._erf((x - mean) / (std * Math.sqrt(2))));
  }

  /**
   * Calculate Value at Risk (VaR) for normal distribution
   * @param {number} confidenceLevel - Confidence level (0-1)
   * @param {number} mean - Mean of the distribution
   * @param {number} std - Standard deviation
   * @returns {number} VaR value
   */
  varNormal(confidenceLevel, mean, std) {
    const z = this._inverseNormalCDF(confidenceLevel);
    return mean + std * z;
  }

  /**
   * Calculate Tail Value at Risk (TVaR) for normal distribution
   * @param {number} confidenceLevel - Confidence level (0-1)
   * @param {number} mean - Mean of the distribution
   * @param {number} std - Standard deviation
   * @returns {number} TVaR value
   */
  tvarNormal(confidenceLevel, mean, std) {
    const varValue = this.varNormal(confidenceLevel, mean, std);
    const phi = this.pdfNormal(varValue, mean, std);
    return mean + std * phi / (1 - confidenceLevel);
  }

  /**
   * Fit distribution parameters using method of moments
   * @param {string} distributionName - Name of the distribution
   * @param {Array} data - Sample data
   * @returns {Object} Fitted parameters
   */
  fitDistribution(distributionName, data) {
    const n = data.length;
    const mean = data.reduce((sum, x) => sum + x, 0) / n;
    const variance = data.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / n;
    const std = Math.sqrt(variance);

    switch (distributionName.toLowerCase()) {
      case 'normal':
        return { mean, std };
      case 'lognormal':
        const logData = data.map(x => Math.log(x));
        const logMean = logData.reduce((sum, x) => sum + x, 0) / n;
        const logVariance = logData.reduce((sum, x) => sum + Math.pow(x - logMean, 2), 0) / n;
        return { mu: logMean, sigma: Math.sqrt(logVariance) };
      case 'exponential':
        return { rate: 1 / mean };
      case 'gamma':
        // Method of moments for gamma distribution
        const gammaShape = Math.pow(mean, 2) / variance;
        const gammaScale = variance / mean;
        return { shape: gammaShape, scale: gammaScale };
      case 'weibull':
        // Approximate method of moments for Weibull
        const weibullShape = 1.2; // Approximate value
        const weibullScale = mean / this._gamma(1 + 1 / weibullShape);
        return { shape: weibullShape, scale: weibullScale };
      default:
        throw new Error(`Fitting not implemented for distribution '${distributionName}'`);
    }
  }

  /**
   * Calculate goodness of fit using Kolmogorov-Smirnov test
   * @param {string} distributionName - Name of the distribution
   * @param {Object} parameters - Distribution parameters
   * @param {Array} data - Sample data
   * @returns {Object} KS test results
   */
  goodnessOfFit(distributionName, parameters, data) {
    const sortedData = [...data].sort((a, b) => a - b);
    const n = sortedData.length;
    let maxDiff = 0;

    for (let i = 0; i < n; i++) {
      const empirical = (i + 1) / n;
      const theoretical = this.cdf(distributionName, parameters, sortedData[i]);
      const diff = Math.abs(empirical - theoretical);
      maxDiff = Math.max(maxDiff, diff);
    }

    const criticalValue = 1.36 / Math.sqrt(n); // 95% confidence level
    const isGoodFit = maxDiff < criticalValue;

    return {
      ksStatistic: maxDiff,
      criticalValue,
      isGoodFit,
      pValue: this._ksPValue(maxDiff, n)
    };
  }

  /**
   * Calculate CDF for any distribution
   * @param {string} distributionName - Name of the distribution
   * @param {Object} parameters - Distribution parameters
   * @param {number} x - Value to evaluate
   * @returns {number} CDF value
   */
  cdf(distributionName, parameters, x) {
    switch (distributionName.toLowerCase()) {
      case 'normal':
        return this.cdfNormal(x, parameters.mean, parameters.std);
      case 'lognormal':
        return this.cdfNormal(Math.log(x), parameters.mu, parameters.sigma);
      case 'exponential':
        return 1 - Math.exp(-parameters.rate * x);
      case 'gamma':
        return this._gammaCDF(x, parameters.shape, parameters.scale);
      case 'weibull':
        return 1 - Math.exp(-Math.pow(x / parameters.scale, parameters.shape));
      default:
        throw new Error(`CDF not implemented for distribution '${distributionName}'`);
    }
  }

  /**
   * Get all available distributions
   * @returns {Array} Array of distribution information
   */
  getAvailableDistributions() {
    return Array.from(this.distributions.values());
  }

  /**
   * Get distribution information by name
   * @param {string} distributionName - Name of the distribution
   * @returns {Object} Distribution information
   */
  getDistributionInfo(distributionName) {
    return this.distributions.get(distributionName.toLowerCase());
  }

  // Private helper methods

  /**
   * Generate gamma distribution for shape < 1
   * @private
   */
  _generateGammaSmallShape(shape, scale) {
    // Acceptance-rejection method
    const c = 1 / shape;
    const d = (1 - shape) * Math.pow(shape, shape / (1 - shape));
    
    while (true) {
      const u = Math.random();
      const v = Math.random();
      const x = Math.pow(u, 1 / shape);
      const y = -Math.log(v);
      
      if (y >= d * Math.pow(x, shape - 1)) {
        return scale * x;
      }
    }
  }

  /**
   * Generate gamma distribution for shape >= 1
   * @private
   */
  _generateGammaLargeShape(shape, scale) {
    // Marsaglia and Tsang's method
    const d = shape - 1 / 3;
    const c = 1 / Math.sqrt(9 * d);
    
    while (true) {
      let x, v;
      do {
        x = this.generateNormal(0, 1, 1)[0];
        v = 1 + c * x;
      } while (v <= 0);
      
      v = v * v * v;
      const u = Math.random();
      
      if (u < 1 - 0.0331 * Math.pow(x, 4)) {
        return scale * d * v;
      }
      
      if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) {
        return scale * d * v;
      }
    }
  }

  /**
   * Error function approximation
   * @private
   */
  _erf(x) {
    // Abramowitz and Stegun approximation
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }

  /**
   * Inverse normal CDF approximation
   * @private
   */
  _inverseNormalCDF(p) {
    // Beasley-Springer-Moro algorithm
    const a = [0, -3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
    const b = [0, -5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
    const c = [0, -7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
    const d = [0, 7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];

    const pLow = 0.02425;
    const pHigh = 1 - pLow;

    if (p < pLow) {
      const q = Math.sqrt(-2 * Math.log(p));
      return (((((c[1] * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) * q + c[6]) / ((((d[1] * q + d[2]) * q + d[3]) * q + d[4]) * q + 1);
    } else if (p <= pHigh) {
      const q = p - 0.5;
      const r = q * q;
      return (((((a[1] * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * r + a[6]) * q / (((((b[1] * r + b[2]) * r + b[3]) * r + b[4]) * r + b[5]) * r + 1);
    } else {
      const q = Math.sqrt(-2 * Math.log(1 - p));
      return -(((((c[1] * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) * q + c[6]) / ((((d[1] * q + d[2]) * q + d[3]) * q + d[4]) * q + 1);
    }
  }

  /**
   * Gamma function approximation
   * @private
   */
  _gamma(z) {
    if (z < 0.5) {
      return Math.PI / (Math.sin(Math.PI * z) * this._gamma(1 - z));
    }
    z -= 1;
    let x = 0.99999999999980993;
    const coefficients = [
      676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059,
      12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7
    ];
    for (let i = 0; i < coefficients.length; i++) {
      x += coefficients[i] / (z + i + 1);
    }
    const t = z + coefficients.length - 0.5;
    return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
  }

  /**
   * Gamma CDF approximation
   * @private
   */
  _gammaCDF(x, shape, scale) {
    // Incomplete gamma function approximation
    if (x < 0) return 0;
    if (x === 0) return 0;
    
    const a = shape;
    const b = scale;
    const t = x / b;
    
    // Series expansion for incomplete gamma function
    let sum = 0;
    let term = 1;
    for (let k = 0; k < 100; k++) {
      sum += term;
      term *= t / (a + k);
      if (Math.abs(term) < 1e-10) break;
    }
    
    return sum * Math.exp(-t) * Math.pow(t, a) / this._gamma(a);
  }

  /**
   * KS test p-value approximation
   * @private
   */
  _ksPValue(ksStatistic, n) {
    // Approximate p-value for Kolmogorov-Smirnov test
    const lambda = ksStatistic * Math.sqrt(n);
    let pValue = 0;
    for (let j = 1; j <= 100; j++) {
      pValue += Math.pow(-1, j - 1) * Math.exp(-2 * j * j * lambda * lambda);
    }
    return 2 * pValue;
  }
}

module.exports = ProbabilityDistributionService;
